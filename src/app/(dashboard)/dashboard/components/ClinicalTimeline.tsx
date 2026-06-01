"use client"

import Link from "next/link"
import { format, addMinutes } from "date-fns"
import { es } from "date-fns/locale"
import type { Appointment, AppointmentStatus } from "@/types/appointments"

const STATUS_STYLES: Record<AppointmentStatus, { bar: string; dot: string; label: string; labelCls: string }> = {
  scheduled: {
    bar: "bg-amber-accent",
    dot: "bg-amber-accent",
    label: "Agendada",
    labelCls: "text-amber-600 bg-amber-50",
  },
  confirmed: {
    bar: "bg-teal-accent",
    dot: "bg-teal-accent",
    label: "Confirmada",
    labelCls: "text-teal-accent bg-teal-surface",
  },
  completed: {
    bar: "bg-outline-variant",
    dot: "bg-outline-variant",
    label: "Completada",
    labelCls: "text-secondary bg-surface-container",
  },
  cancelled: {
    bar: "bg-outline-variant",
    dot: "bg-outline-variant",
    label: "Cancelada",
    labelCls: "text-outline bg-surface-container",
  },
}

function AppointmentCard({ appt }: { appt: Appointment }) {
  const start = new Date(appt.scheduled_at)
  const end = addMinutes(start, appt.duration_minutes)
  const styles = STATUS_STYLES[appt.status]
  const isCancelled = appt.status === "cancelled"

  return (
    <div className={`flex gap-2.5 ${isCancelled ? "opacity-50" : ""}`}>
      {/* Time + bar */}
      <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
        <span className="text-[10px] font-mono font-bold text-secondary w-10 text-center">
          {format(start, "HH:mm")}
        </span>
        <div className={`w-0.5 flex-1 min-h-[32px] rounded-full ${styles.bar}`} />
        <span className="text-[10px] font-mono text-outline w-10 text-center">
          {format(end, "HH:mm")}
        </span>
      </div>

      {/* Card */}
      <div className="flex-1 mb-3 pb-3 border-b border-outline-variant/10 last:border-0 last:mb-0 last:pb-0">
        <div className="flex items-start justify-between gap-1.5">
          <p className={`text-sm font-semibold text-on-surface leading-tight ${isCancelled ? "line-through" : ""}`}>
            {appt.patient.full_name}
          </p>
          <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${styles.labelCls}`}>
            {styles.label}
          </span>
        </div>
        <p className="text-xs text-secondary mt-0.5 truncate">
          {appt.clinic.name}
        </p>
        {appt.treatment_type && (
          <p className="text-xs text-outline mt-0.5 truncate">{appt.treatment_type}</p>
        )}
      </div>
    </div>
  )
}

interface ClinicalTimelineProps {
  appointments: Appointment[]
}

export default function ClinicalTimeline({ appointments }: ClinicalTimelineProps) {
  const today = format(new Date(), "EEEE d MMM", { locale: es })
  const total = appointments.length
  const upcoming = appointments.filter((a) => a.status !== "cancelled").length

  return (
    <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-outline-variant/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-surface flex items-center justify-center">
            <span className="material-symbols-outlined text-teal-accent text-[18px]">
              calendar_today
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-on-surface">Agenda del día</h3>
            <p className="text-[11px] text-secondary capitalize">{today}</p>
          </div>
        </div>
        {total > 0 && (
          <span className="inline-flex items-center justify-center w-7 h-7 bg-teal-accent text-white text-xs font-bold rounded-full">
            {total}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-5 py-4 flex-1 overflow-y-auto">
        {total === 0 ? (
          <div className="flex flex-col items-center py-8 gap-3 text-center">
            <span className="material-symbols-outlined text-outline text-[36px]">
              event_available
            </span>
            <div>
              <p className="text-sm font-semibold text-on-surface">Sin citas hoy</p>
              <p className="text-xs text-secondary mt-0.5">
                Las citas aparecerán aquí en tiempo real.
              </p>
            </div>
            <Link
              href="/agenda"
              className="mt-1 h-8 px-4 inline-flex items-center gap-1.5 text-xs font-semibold bg-teal-surface text-teal-accent border border-teal-border rounded-lg hover:bg-teal-border transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              Agendar cita
            </Link>
          </div>
        ) : (
          <div>
            {appointments.map((appt) => (
              <AppointmentCard key={appt.id} appt={appt} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {total > 0 && (
        <div className="px-5 py-3 border-t border-outline-variant/10 flex items-center justify-between bg-surface-container-low/40 shrink-0">
          <p className="text-[11px] text-secondary">
            {upcoming} activa{upcoming !== 1 ? "s" : ""}
            {upcoming !== total && (
              <span className="text-outline"> · {total - upcoming} cancelada{total - upcoming !== 1 ? "s" : ""}</span>
            )}
          </p>
          <Link
            href="/agenda"
            className="text-[11px] font-semibold text-teal-accent hover:text-teal-accent-hover transition-colors flex items-center gap-0.5"
          >
            Ver agenda
            <span className="material-symbols-outlined text-[13px]">chevron_right</span>
          </Link>
        </div>
      )}

      {/* Mobile FAB */}
      <Link
        href="/patients/new"
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-sidebar-active text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-50"
        aria-label="Nuevo paciente"
      >
        <span className="material-symbols-outlined">add</span>
      </Link>
    </div>
  )
}
