"use client"

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
} from "date-fns"
import type { Appointment } from "@/types/appointments"
import AppointmentPill from "./AppointmentPill"

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
const MAX_PILLS = 3

interface CalendarGridProps {
  appointments: Appointment[]
  currentMonth: Date
  onDayClick: (date: Date) => void
  onAppointmentClick?: (appointment: Appointment) => void
}

export default function CalendarGrid({
  appointments,
  currentMonth,
  onDayClick,
  onAppointmentClick,
}: CalendarGridProps) {
  const gridStart = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 })
  const gridEnd = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })
  const today = new Date()

  // Agrupar citas por día (clave yyyy-MM-dd en hora local).
  const byDay = new Map<string, Appointment[]>()
  for (const a of appointments) {
    const key = format(new Date(a.scheduled_at), "yyyy-MM-dd")
    const bucket = byDay.get(key)
    if (bucket) bucket.push(a)
    else byDay.set(key, [a])
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl overflow-hidden flex flex-col h-full min-h-[640px]">
      {/* Cabecera de días */}
      <div className="grid grid-cols-7 bg-surface-container-low/60">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-3 text-center">
            <span className="text-[10px] font-extrabold text-secondary uppercase tracking-widest">
              {d}
            </span>
          </div>
        ))}
      </div>

      {/* Celdas */}
      <div className="grid grid-cols-7 flex-1">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd")
          const dayAppts = byDay.get(key) ?? []
          const inMonth = isSameMonth(day, currentMonth)
          const isToday = isSameDay(day, today)
          const extra = dayAppts.length - MAX_PILLS

          return (
            <div
              key={key}
              onClick={() => onDayClick(day)}
              className={`min-h-[112px] p-2 border-b border-r border-outline-variant/10 cursor-pointer transition-colors ${
                inMonth
                  ? "hover:bg-surface-container-low/40"
                  : "bg-surface-container-low/30 opacity-50"
              }`}
            >
              {isToday ? (
                <span className="flex items-center justify-center w-6 h-6 bg-teal-accent/10 text-teal-accent rounded-full text-xs font-bold">
                  {format(day, "d")}
                </span>
              ) : (
                <span className="text-xs font-bold text-secondary px-1">
                  {format(day, "d")}
                </span>
              )}

              <div className="mt-2 flex flex-col gap-1">
                {dayAppts.slice(0, MAX_PILLS).map((a) => (
                  <AppointmentPill
                    key={a.id}
                    appointment={a}
                    onClick={onAppointmentClick}
                  />
                ))}
                {extra > 0 && (
                  <span className="text-[9px] font-extrabold text-secondary/60 px-2">
                    +{extra} más
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
