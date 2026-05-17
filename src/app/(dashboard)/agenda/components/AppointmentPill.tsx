"use client"

import { format } from "date-fns"
import type { Appointment, AppointmentStatus } from "@/types/appointments"

const BORDER_BY_STATUS: Record<AppointmentStatus, string> = {
  confirmed: "border-l-teal-accent",
  scheduled: "border-l-amber-accent",
  cancelled: "border-l-outline",
  completed: "border-l-outline",
}

interface AppointmentPillProps {
  appointment: Appointment
  onClick?: (appointment: Appointment) => void
}

export default function AppointmentPill({
  appointment,
  onClick,
}: AppointmentPillProps) {
  const time = format(new Date(appointment.scheduled_at), "HH:mm")
  const isCancelled = appointment.status === "cancelled"

  return (
    <button
      type="button"
      onClick={() => onClick?.(appointment)}
      title={`${time} · ${appointment.patient.full_name}`}
      className={`w-full h-7 truncate text-left bg-teal-surface text-teal-accent px-2 rounded-md text-[10px] font-bold border border-teal-border border-l-4 ${
        BORDER_BY_STATUS[appointment.status]
      } ${isCancelled ? "line-through opacity-60" : ""} hover:brightness-95 transition-all`}
    >
      <span className="opacity-70">{time}</span> ·{" "}
      {appointment.patient.full_name}
    </button>
  )
}
