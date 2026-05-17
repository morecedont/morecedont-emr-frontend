"use server"

import { revalidatePath } from "next/cache"
import { getProfile } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import type { NewAppointmentInput } from "@/types/appointments"
import { createCalendarEvent, isGoogleConnected } from "@/lib/google/calendar"

// ─── Sync best-effort a Google Calendar ───────────────────────────────────────
// No lanza nunca: el alta de la cita no depende del éxito del sync.

async function syncAppointmentToGoogle(
  doctorId: string,
  appointmentId: string,
  event: {
    summary: string
    description?: string
    startISO: string
    durationMinutes: number
  }
): Promise<void> {
  try {
    // Sin conexión: la cita queda "pending" (se sincronizará al conectar).
    if (!(await isGoogleConnected(doctorId))) return

    const result = await createCalendarEvent(doctorId, event)

    if ("eventId" in result) {
      await prisma.appointments.update({
        where: { id: appointmentId },
        data: { gcal_event_id: result.eventId, gcal_sync_status: "synced" },
      })
      await prisma.appointment_sync_log.create({
        data: {
          appointment_id: appointmentId,
          operation: "create",
          direction: "outbound",
          status: "success",
        },
      })
    } else {
      await prisma.appointments.update({
        where: { id: appointmentId },
        data: { gcal_sync_status: "error" },
      })
      await prisma.appointment_sync_log.create({
        data: {
          appointment_id: appointmentId,
          operation: "create",
          direction: "outbound",
          status: "error",
          error_message: result.error,
        },
      })
    }
  } catch (err) {
    console.error("syncAppointmentToGoogle:", err)
    try {
      await prisma.appointment_sync_log.create({
        data: {
          appointment_id: appointmentId,
          operation: "create",
          direction: "outbound",
          status: "error",
          error_message: err instanceof Error ? err.message : "unknown",
        },
      })
    } catch {
      /* el log es accesorio; no propagar */
    }
  }
}

// ─── Búsqueda de pacientes (autocomplete del slide-over) ──────────────────────
// Scopeado por doctor_patients: el doctor solo ve pacientes a los que tiene acceso.

export async function searchPatientsForAppointment(query: string) {
  const profile = await getProfile()
  if (!profile) return []

  const q = query.trim()
  if (q.length < 2) return []

  const patients = await prisma.patients.findMany({
    where: {
      doctor_patients: { some: { doctor_id: profile.id } },
      OR: [
        { full_name: { contains: q, mode: Prisma.QueryMode.insensitive } },
        { id_number: { contains: q, mode: Prisma.QueryMode.insensitive } },
      ],
    },
    select: { id: true, full_name: true, id_number: true },
    orderBy: { full_name: "asc" },
    take: 10,
  })

  return patients
}

// ─── Crear cita ───────────────────────────────────────────────────────────────

export async function createAppointment(
  input: NewAppointmentInput
): Promise<{ error?: string; appointmentId?: string }> {
  const profile = await getProfile()
  if (!profile) return { error: "No autorizado" }

  const {
    patientId,
    clinicId,
    scheduledAt,
    durationMinutes,
    treatmentType,
    notes,
    gcalSyncEnabled,
  } = input

  if (!patientId || !clinicId || !scheduledAt) {
    return { error: "Paciente, clínica y fecha/hora son requeridos" }
  }

  // Control de acceso: el paciente debe estar vinculado al doctor.
  const link = await prisma.doctor_patients.findUnique({
    where: {
      doctor_id_patient_id: { doctor_id: profile.id, patient_id: patientId },
    },
  })
  if (!link) return { error: "No tenés acceso a este paciente" }

  const when = new Date(scheduledAt)
  if (isNaN(when.getTime())) return { error: "Fecha u hora inválida" }

  try {
    const appointment = await prisma.appointments.create({
      data: {
        doctor_id: profile.id,
        patient_id: patientId,
        clinic_id: clinicId,
        scheduled_at: when,
        duration_minutes:
          Number.isFinite(durationMinutes) && durationMinutes > 0
            ? durationMinutes
            : 30,
        treatment_type: treatmentType?.trim() || null,
        notes: notes?.trim() || null,
        status: "scheduled",
        // Queda "pending" hasta que el sync best-effort la marque.
        gcal_sync_status: "pending",
        // Opt-out por cita: el doctor puede excluir esta cita del sync.
        gcal_sync_enabled: gcalSyncEnabled,
      },
      include: { patient: { select: { full_name: true } } },
    })

    // Sync best-effort a Google Calendar: nunca rompe el alta de la cita.
    if (gcalSyncEnabled) {
      await syncAppointmentToGoogle(profile.id, appointment.id, {
        summary: `Cita: ${appointment.patient.full_name}`,
        description: treatmentType?.trim() || undefined,
        startISO: when.toISOString(),
        durationMinutes: appointment.duration_minutes,
      })
    }

    revalidatePath("/agenda")
    return { appointmentId: appointment.id }
  } catch (err) {
    console.error("createAppointment:", err)
    return { error: "No se pudo crear la cita" }
  }
}
