"use server"

import { revalidatePath } from "next/cache"
import { getProfile } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import type { NewAppointmentInput } from "@/types/appointments"

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

  const { patientId, clinicId, scheduledAt, durationMinutes, treatmentType, notes } =
    input

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
        // La sync real con Google Calendar es fase 2; siempre arranca pendiente.
        gcal_sync_status: "pending",
      },
    })

    revalidatePath("/agenda")
    return { appointmentId: appointment.id }
  } catch (err) {
    console.error("createAppointment:", err)
    return { error: "No se pudo crear la cita" }
  }
}
