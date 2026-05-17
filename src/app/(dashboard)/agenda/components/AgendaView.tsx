"use client"

import { format, addMinutes } from "date-fns"
import { es } from "date-fns/locale"
import type { Appointment, AppointmentStatus } from "@/types/appointments"

const BORDER_BY_STATUS: Record<AppointmentStatus, string> = {
  confirmed: "border-l-teal-accent",
  scheduled: "border-l-amber-accent",
  cancelled: "border-l-outline",
  completed: "border-l-outline",
}

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  confirmed: "Confirmado",
  scheduled: "Programado",
  cancelled: "Cancelado",
  completed: "Completado",
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

interface AgendaViewProps {
  appointments: Appointment[]
  onAppointmentClick?: (appointment: Appointment) => void
}

export default function AgendaView({
  appointments,
  onAppointmentClick,
}: AgendaViewProps) {
  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 px-6">
        <span className="material-symbols-outlined text-secondary/40 text-5xl mb-3">
          event_busy
        </span>
        <p className="font-headline font-bold text-on-surface">
          Sin citas este mes
        </p>
        <p className="text-sm text-on-surface-variant mt-1">
          Tocá el botón + para agendar la primera.
        </p>
      </div>
    )
  }

  // Agrupar por día, manteniendo el orden ascendente que viene del server.
  const groups = new Map<string, Appointment[]>()
  for (const a of appointments) {
    const key = format(new Date(a.scheduled_at), "yyyy-MM-dd")
    const bucket = groups.get(key)
    if (bucket) bucket.push(a)
    else groups.set(key, [a])
  }

  return (
    <div className="flex flex-col gap-8 px-4 pb-28">
      {[...groups.entries()].map(([key, dayAppts]) => {
        const dayDate = new Date(dayAppts[0].scheduled_at)
        return (
          <section key={key}>
            <header className="mb-4">
              <h2 className="font-headline text-on-surface text-xl font-bold tracking-tight">
                {capitalize(
                  format(dayDate, "EEEE, d 'de' MMMM", { locale: es })
                )}
              </h2>
              <p className="text-on-surface-variant text-sm font-medium opacity-70">
                {dayAppts.length}{" "}
                {dayAppts.length === 1 ? "cita programada" : "citas programadas"}
              </p>
            </header>

            <div className="flex flex-col gap-4">
              {dayAppts.map((a) => {
                const start = new Date(a.scheduled_at)
                const end = addMinutes(start, a.duration_minutes)
                const cancelled = a.status === "cancelled"
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => onAppointmentClick?.(a)}
                    className={`text-left bg-surface-container-lowest rounded-xl p-4 h-auto border-l-4 ${
                      BORDER_BY_STATUS[a.status]
                    } ${cancelled ? "opacity-60" : ""} active:scale-[0.99] transition-transform`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="min-w-0">
                        <span
                          className={`font-bold text-sm block mb-1 ${
                            cancelled
                              ? "text-on-surface-variant line-through"
                              : "text-teal-accent"
                          }`}
                        >
                          {format(start, "HH:mm")} - {format(end, "HH:mm")}
                        </span>
                        <h3 className="font-headline font-extrabold text-on-surface text-lg truncate">
                          {a.patient.full_name}
                        </h3>
                      </div>
                      <span className="shrink-0 bg-surface-container-highest text-on-surface-variant px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {STATUS_LABEL[a.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-sm">
                        medical_services
                      </span>
                      <p className="text-sm font-medium truncate">
                        {a.treatment_type ?? "Sin tratamiento especificado"}
                      </p>
                    </div>
                    <p className="mt-2 text-xs text-on-surface-variant/70 truncate">
                      {a.clinic.name}
                    </p>
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
