import { redirect } from "next/navigation"
import { startOfMonth, addMonths, isValid, parse, format } from "date-fns"
import { getProfile } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import type { Appointment } from "@/types/appointments"
import { isGoogleConnected } from "@/lib/google/calendar"
import AgendaClient from "./components/AgendaClient"

export const dynamic = "force-dynamic"

function resolveMonth(raw: string | undefined): Date {
  if (raw) {
    const parsed = parse(raw, "yyyy-MM", new Date())
    if (isValid(parsed)) return startOfMonth(parsed)
  }
  return startOfMonth(new Date())
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const profile = await getProfile()
  if (!profile) redirect("/login")

  const { month } = await searchParams
  const monthStart = resolveMonth(month)
  const monthEnd = startOfMonth(addMonths(monthStart, 1))

  const [rows, googleConnected] = await Promise.all([
    prisma.appointments.findMany({
      relationLoadStrategy: "join",
      where: {
        doctor_id: profile.id,
        scheduled_at: { gte: monthStart, lt: monthEnd },
      },
      include: {
        patient: { select: { full_name: true } },
        clinic: { select: { name: true } },
      },
      orderBy: { scheduled_at: "asc" },
    }),
    isGoogleConnected(profile.id),
  ])

  // Objetos planos serializables para los Client Components.
  const appointments: Appointment[] = rows.map((a) => ({
    id: a.id,
    patient_id: a.patient_id,
    clinic_id: a.clinic_id,
    scheduled_at: a.scheduled_at.toISOString(),
    duration_minutes: a.duration_minutes,
    treatment_type: a.treatment_type,
    notes: a.notes,
    status: a.status,
    gcal_event_id: a.gcal_event_id,
    gcal_sync_status: a.gcal_sync_status,
    gcal_sync_enabled: a.gcal_sync_enabled,
    patient: { full_name: a.patient.full_name },
    clinic: { name: a.clinic.name },
  }))

  return (
    <AgendaClient
      appointments={appointments}
      month={format(monthStart, "yyyy-MM")}
      doctorId={profile.id}
      isGoogleConnected={googleConnected}
    />
  )
}
