"use server"

import { revalidatePath } from "next/cache"
import { getProfile } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import type {
  NewAppointmentInput,
  UpdateAppointmentInput,
} from "@/types/appointments"
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  isGoogleConnected,
  type CalendarEventInput,
} from "@/lib/google/calendar"

// ─── Sync best-effort a Google Calendar ───────────────────────────────────────
// Nada de lo de acá lanza: la mutación de la cita nunca depende del sync.

/** Log de auditoría de un intento de sync. Accesorio: si falla, no propaga. */
async function logSync(
  appointmentId: string,
  operation: "create" | "update" | "delete",
  status: "ok" | "error",
  errorMessage?: string
): Promise<void> {
  try {
    await prisma.appointment_sync_log.create({
      data: {
        appointment_id: appointmentId,
        operation,
        direction: "push",
        status,
        error_message: errorMessage ?? null,
      },
    })
  } catch {
    /* el log es accesorio; no propagar */
  }
}

/** Arma el cuerpo del evento de calendario desde los datos de la cita. */
function buildEventInput(a: {
  scheduled_at: Date
  duration_minutes: number
  treatment_type: string | null
  patient: { full_name: string; email: string | null }
}): CalendarEventInput {
  return {
    summary: `Cita: ${a.patient.full_name}`,
    description: a.treatment_type ?? undefined,
    startISO: a.scheduled_at.toISOString(),
    durationMinutes: a.duration_minutes,
    // Si el paciente tiene email, se lo invita y Google le manda el evento.
    attendeeEmail: a.patient.email ?? undefined,
  }
}

/**
 * Crea el evento en Google para una cita recién dada de alta (o pendiente).
 * Marca la cita synced/error. No lanza.
 */
async function pushCreate(
  doctorId: string,
  appointmentId: string,
  event: CalendarEventInput
): Promise<void> {
  try {
    if (!(await isGoogleConnected(doctorId))) return // queda pending → backfill al conectar

    const result = await createCalendarEvent(doctorId, event)
    if ("eventId" in result) {
      await prisma.appointments.update({
        where: { id: appointmentId },
        data: { gcal_event_id: result.eventId, gcal_sync_status: "synced" },
      })
      await logSync(appointmentId, "create", "ok")
    } else {
      await prisma.appointments.update({
        where: { id: appointmentId },
        data: { gcal_sync_status: "error" },
      })
      await logSync(appointmentId, "create", "error", result.error)
    }
  } catch (err) {
    console.error("pushCreate:", err)
    await logSync(
      appointmentId,
      "create",
      "error",
      err instanceof Error ? err.message : "unknown"
    )
  }
}

/**
 * Reconcilia el estado en Google tras editar una cita. Devuelve el parche de
 * campos gcal_* a persistir. No lanza.
 */
async function reconcileGoogleForUpdate(
  doctorId: string,
  appointment: {
    id: string
    gcal_event_id: string | null
  },
  event: CalendarEventInput,
  gcalSyncEnabled: boolean
): Promise<{ gcal_event_id?: string | null; gcal_sync_status?: string }> {
  try {
    // Sync desactivado para esta cita: si había evento, lo quitamos del calendario.
    if (!gcalSyncEnabled) {
      if (appointment.gcal_event_id) {
        const r = await deleteCalendarEvent(doctorId, appointment.gcal_event_id)
        await logSync(
          appointment.id,
          "delete",
          "ok" in r ? "ok" : "error",
          "ok" in r ? undefined : r.error
        )
      }
      return { gcal_event_id: null, gcal_sync_status: "pending" }
    }

    // Activado pero sin conexión: queda pending para el backfill.
    if (!(await isGoogleConnected(doctorId))) {
      return { gcal_sync_status: "pending" }
    }

    // Ya tenía evento → patch (y si Google lo perdió, recrear).
    if (appointment.gcal_event_id) {
      const r = await updateCalendarEvent(
        doctorId,
        appointment.gcal_event_id,
        event
      )
      if ("eventId" in r) {
        await logSync(appointment.id, "update", "ok")
        return { gcal_sync_status: "synced" }
      }
      if (r.error === "not_found") {
        const c = await createCalendarEvent(doctorId, event)
        if ("eventId" in c) {
          await logSync(appointment.id, "create", "ok")
          return { gcal_event_id: c.eventId, gcal_sync_status: "synced" }
        }
        await logSync(appointment.id, "create", "error", c.error)
        return { gcal_sync_status: "error" }
      }
      await logSync(appointment.id, "update", "error", r.error)
      return { gcal_sync_status: "error" }
    }

    // No tenía evento (recién activado el sync) → crear.
    const c = await createCalendarEvent(doctorId, event)
    if ("eventId" in c) {
      await logSync(appointment.id, "create", "ok")
      return { gcal_event_id: c.eventId, gcal_sync_status: "synced" }
    }
    await logSync(appointment.id, "create", "error", c.error)
    return { gcal_sync_status: "error" }
  } catch (err) {
    console.error("reconcileGoogleForUpdate:", err)
    return { gcal_sync_status: "error" }
  }
}

// ─── Búsqueda de pacientes (autocomplete del slide-over) ──────────────────────

export async function searchPatientsForAppointment(query: string) {
  const profile = await getProfile()
  if (!profile) return []

  const q = query.trim()
  if (q.length < 2) return []

  const patients = await prisma.patients.findMany({
    where: {
      current_doctor_id: profile.id,
      OR: [
        { full_name: { contains: q, mode: Prisma.QueryMode.insensitive } },
        { id_number: { contains: q, mode: Prisma.QueryMode.insensitive } },
      ],
    },
    select: { id: true, full_name: true, id_number: true, email: true },
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

  // Control de acceso: el paciente debe pertenecer al doctor.
  const patientAccess = await prisma.patients.findUnique({
    where: { id: patientId },
    select: { current_doctor_id: true },
  })
  if (!patientAccess || patientAccess.current_doctor_id !== profile.id) {
    return { error: "No tenés acceso a este paciente" }
  }

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
      include: { patient: { select: { full_name: true, email: true } } },
    })

    // Sync best-effort a Google Calendar: nunca rompe el alta de la cita.
    if (gcalSyncEnabled) {
      await pushCreate(
        profile.id,
        appointment.id,
        buildEventInput(appointment)
      )
    }

    revalidatePath("/agenda")
    return { appointmentId: appointment.id }
  } catch (err) {
    console.error("createAppointment:", err)
    return { error: "No se pudo crear la cita" }
  }
}

// ─── Editar cita ──────────────────────────────────────────────────────────────

export async function updateAppointment(
  input: UpdateAppointmentInput
): Promise<{ error?: string; appointmentId?: string }> {
  const profile = await getProfile()
  if (!profile) return { error: "No autorizado" }

  const {
    id,
    patientId,
    clinicId,
    scheduledAt,
    durationMinutes,
    treatmentType,
    notes,
    gcalSyncEnabled,
  } = input

  if (!id || !patientId || !clinicId || !scheduledAt) {
    return { error: "Paciente, clínica y fecha/hora son requeridos" }
  }

  // La cita debe ser del doctor.
  const existing = await prisma.appointments.findUnique({
    where: { id },
    select: { id: true, doctor_id: true, gcal_event_id: true },
  })
  if (!existing || existing.doctor_id !== profile.id) {
    return { error: "No tenés acceso a esta cita" }
  }

  // Acceso al paciente destino.
  const patientAccess = await prisma.patients.findUnique({
    where: { id: patientId },
    select: { current_doctor_id: true },
  })
  if (!patientAccess || patientAccess.current_doctor_id !== profile.id) {
    return { error: "No tenés acceso a este paciente" }
  }

  const when = new Date(scheduledAt)
  if (isNaN(when.getTime())) return { error: "Fecha u hora inválida" }

  try {
    const appointment = await prisma.appointments.update({
      where: { id },
      data: {
        patient_id: patientId,
        clinic_id: clinicId,
        scheduled_at: when,
        duration_minutes:
          Number.isFinite(durationMinutes) && durationMinutes > 0
            ? durationMinutes
            : 30,
        treatment_type: treatmentType?.trim() || null,
        notes: notes?.trim() || null,
        gcal_sync_enabled: gcalSyncEnabled,
        updated_at: new Date(),
      },
      include: { patient: { select: { full_name: true, email: true } } },
    })

    const patch = await reconcileGoogleForUpdate(
      profile.id,
      existing,
      buildEventInput(appointment),
      gcalSyncEnabled
    )
    if (Object.keys(patch).length > 0) {
      await prisma.appointments.update({
        where: { id },
        // gcal_sync_status es un enum; el string literal calza con sus valores.
        data: patch as Prisma.appointmentsUpdateInput,
      })
    }

    revalidatePath("/agenda")
    return { appointmentId: id }
  } catch (err) {
    console.error("updateAppointment:", err)
    return { error: "No se pudo actualizar la cita" }
  }
}

// ─── Cancelar cita (soft: queda en el historial, se quita del calendario) ─────

export async function cancelAppointment(
  appointmentId: string
): Promise<{ error?: string; success?: boolean }> {
  const profile = await getProfile()
  if (!profile) return { error: "No autorizado" }

  const existing = await prisma.appointments.findUnique({
    where: { id: appointmentId },
    select: { id: true, doctor_id: true, gcal_event_id: true },
  })
  if (!existing || existing.doctor_id !== profile.id) {
    return { error: "No tenés acceso a esta cita" }
  }

  try {
    if (existing.gcal_event_id) {
      const r = await deleteCalendarEvent(profile.id, existing.gcal_event_id)
      await logSync(
        appointmentId,
        "delete",
        "ok" in r ? "ok" : "error",
        "ok" in r ? undefined : r.error
      )
    }

    await prisma.appointments.update({
      where: { id: appointmentId },
      data: {
        status: "cancelled",
        gcal_event_id: null,
        gcal_sync_status: "pending",
        updated_at: new Date(),
      },
    })

    revalidatePath("/agenda")
    return { success: true }
  } catch (err) {
    console.error("cancelAppointment:", err)
    return { error: "No se pudo cancelar la cita" }
  }
}

// ─── Borrar cita (hard: elimina el registro y el evento de Google) ────────────

export async function deleteAppointment(
  appointmentId: string
): Promise<{ error?: string; success?: boolean }> {
  const profile = await getProfile()
  if (!profile) return { error: "No autorizado" }

  const existing = await prisma.appointments.findUnique({
    where: { id: appointmentId },
    select: { id: true, doctor_id: true, gcal_event_id: true },
  })
  if (!existing || existing.doctor_id !== profile.id) {
    return { error: "No tenés acceso a esta cita" }
  }

  try {
    // Borramos el evento de Google primero (best-effort). Si la cita ya no
    // existe, el log cae por cascade igual, así que logueamos sólo en éxito.
    if (existing.gcal_event_id) {
      await deleteCalendarEvent(profile.id, existing.gcal_event_id)
    }

    // El sync_log se borra por cascade (onDelete: Cascade).
    await prisma.appointments.delete({ where: { id: appointmentId } })

    revalidatePath("/agenda")
    return { success: true }
  } catch (err) {
    console.error("deleteAppointment:", err)
    return { error: "No se pudo eliminar la cita" }
  }
}

// ─── Backfill: sincroniza las citas pendientes al conectar/reconectar Google ──

export async function syncPendingAppointments(): Promise<{
  synced: number
  failed: number
}> {
  const profile = await getProfile()
  if (!profile) return { synced: 0, failed: 0 }
  const doctorId = profile.id

  // Sólo citas futuras, con sync activado, aún sin evento en Google.
  const pending = await prisma.appointments.findMany({
    where: {
      doctor_id: doctorId,
      gcal_sync_enabled: true,
      gcal_event_id: null,
      status: { not: "cancelled" },
      scheduled_at: { gte: new Date() },
      gcal_sync_status: { in: ["pending", "error", "offline_queued"] },
    },
    include: { patient: { select: { full_name: true, email: true } } },
    orderBy: { scheduled_at: "asc" },
  })

  let synced = 0
  let failed = 0
  for (const a of pending) {
    const before = a.gcal_event_id
    await pushCreate(doctorId, a.id, buildEventInput(a))
    // pushCreate persiste el resultado; releemos sólo el flag mínimo.
    const after = await prisma.appointments.findUnique({
      where: { id: a.id },
      select: { gcal_event_id: true },
    })
    if (after?.gcal_event_id && after.gcal_event_id !== before) synced++
    else failed++
  }

  if (synced > 0) revalidatePath("/agenda")
  return { synced, failed }
}
