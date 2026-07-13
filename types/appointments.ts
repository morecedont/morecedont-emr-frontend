// Tipos serializables para la feature de Agenda.
// Se pasan desde Server Components a Client Components (fechas como ISO string,
// nada de Decimal ni Date crudos de Prisma).

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show"

export type GcalSyncStatus =
  | "pending"
  | "synced"
  | "error"
  | "offline_queued"

export interface Appointment {
  id: string
  patient_id: string
  clinic_id: string
  /** ISO 8601 string (Timestamptz serializado) */
  scheduled_at: string
  duration_minutes: number
  treatment_type: string | null
  notes: string | null
  status: AppointmentStatus
  gcal_event_id: string | null
  gcal_sync_status: GcalSyncStatus
  gcal_sync_enabled: boolean
  patient: { full_name: string; email: string | null }
  clinic: { name: string }
}

/** Payload que el slide-over envía a la Server Action `createAppointment`. */
export interface NewAppointmentInput {
  patientId: string
  clinicId: string
  /** ISO 8601 string construido desde fecha + hora del formulario */
  scheduledAt: string
  durationMinutes: number
  treatmentType: string | null
  notes: string | null
  /** Preferencia de sync con Google Calendar */
  gcalSyncEnabled: boolean
}

/** Payload para editar una cita existente (`updateAppointment`). */
export interface UpdateAppointmentInput extends NewAppointmentInput {
  id: string
}

/**
 * Payload de "Agendar paciente nuevo": datos administrativos mínimos del
 * paciente + la primera cita, en un solo flujo (`scheduleNewPatient`).
 * NO crea historia clínica: eso se completa en la consulta.
 */
export interface NewPatientAppointmentInput {
  // Datos mínimos del paciente
  fullName: string
  phone: string
  email: string | null
  referredBy: string | null
  approximateAge: number | null
  // Datos de la primera cita
  clinicId: string
  /** ISO 8601 construido desde fecha + hora del formulario */
  scheduledAt: string
  durationMinutes: number
  /** Motivo de consulta → appointments.treatment_type (texto libre) */
  reasonForVisit: string | null
  /** Preferencia de sync con Google Calendar */
  gcalSyncEnabled: boolean
}

export type SyncIndicatorStatus =
  | "synced"
  | "pending"
  | "error"
  | "not_connected"
