import { prisma } from "@/lib/prisma"
import ClinicalTimeline from "./ClinicalTimeline"
import type { Appointment } from "@/types/appointments"

export default async function TodayAgendaServer({ doctorId }: { doctorId: string }) {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const raw = await prisma.appointments.findMany({
    where: {
      doctor_id: doctorId,
      scheduled_at: { gte: todayStart, lte: todayEnd },
    },
    include: {
      patient: { select: { full_name: true, email: true } },
      clinic: { select: { name: true } },
    },
    orderBy: { scheduled_at: "asc" },
  })

  const appointments: Appointment[] = raw.map((a) => ({
    id: a.id,
    patient_id: a.patient_id,
    clinic_id: a.clinic_id,
    scheduled_at: a.scheduled_at.toISOString(),
    duration_minutes: a.duration_minutes,
    treatment_type: a.treatment_type,
    notes: a.notes,
    status: a.status as Appointment["status"],
    gcal_event_id: a.gcal_event_id,
    gcal_sync_status: a.gcal_sync_status as Appointment["gcal_sync_status"],
    gcal_sync_enabled: a.gcal_sync_enabled,
    patient: { full_name: a.patient.full_name, email: a.patient.email },
    clinic: { name: a.clinic.name },
  }))

  return <ClinicalTimeline appointments={appointments} />
}
