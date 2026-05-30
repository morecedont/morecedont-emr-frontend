// Tipos serializables para la feature de Agenda.
// Se pasan desde Server Components a Client Components (fechas como ISO string,
// nada de Decimal ni Date crudos de Prisma).

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "cancelled"
  | "completed"

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

export type SyncIndicatorStatus =
  | "synced"
  | "pending"
  | "error"
  | "not_connected"
