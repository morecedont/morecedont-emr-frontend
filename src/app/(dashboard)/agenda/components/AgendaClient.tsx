"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Appointment } from "@/types/appointments"
import CalendarGrid from "./CalendarGrid"
import AgendaView from "./AgendaView"
import SyncStatusIndicator from "./SyncStatusIndicator"
import NewAppointmentSlideOver from "./NewAppointmentSlideOver"

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * El mes viaja como string "YYYY-MM" (TZ-agnóstico). Se reconstruye como
 * fecha LOCAL (1ro del mes a medianoche local), nunca con new Date(isoUTC),
 * para que server (UTC en Vercel) y navegador (TZ local) coincidan.
 */
function parseMonth(month: string): Date {
  const [y, m] = month.split("-").map(Number)
  return new Date(y, m - 1, 1)
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

interface AgendaClientProps {
  appointments: Appointment[]
  month: string
  doctorId: string
  isGoogleConnected: boolean
}

export default function AgendaClient({
  appointments,
  month,
  doctorId,
  isGoogleConnected,
}: AgendaClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const monthDate = parseMonth(month)
  const monthLabel = capitalize(
    format(monthDate, "LLLL yyyy", { locale: es })
  )
  const googleFeedback = searchParams.get("google")

  function dismissFeedback() {
    router.replace(`/agenda?month=${month}`)
  }

  const [slideOverOpen, setSlideOverOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  function navigateMonth(delta: number) {
    router.push(`/agenda?month=${shiftMonth(month, delta)}`)
  }

  function openForDay(date: Date) {
    setSelectedDate(date)
    setSlideOverOpen(true)
  }

  function openNew() {
    setSelectedDate(new Date())
    setSlideOverOpen(true)
  }

  function handleAppointmentClick(appointment: Appointment) {
    // Fase 2: abrir modal de detalle de cita.
    console.log("[agenda] detalle de cita —", appointment.id)
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Feedback de conexión Google */}
      {googleFeedback && (
        <div
          className={`flex items-center justify-between gap-3 px-4 sm:px-6 py-3 text-sm font-medium ${
            googleFeedback === "connected"
              ? "bg-green-50 text-green-700"
              : "bg-error-container text-error"
          }`}
        >
          <span>
            {googleFeedback === "connected"
              ? "Google Calendar conectado. Tus próximas citas se sincronizarán."
              : "No se pudo conectar Google Calendar. Intentá de nuevo."}
          </span>
          <button
            type="button"
            onClick={dismissFeedback}
            className="flex items-center justify-center w-11 h-11 -mr-2 rounded-full hover:bg-black/5 transition-colors shrink-0"
            aria-label="Cerrar aviso"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 bg-surface-container-low/40">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <h1 className="font-headline font-bold text-xl text-on-surface">
            Agenda
          </h1>
          <div className="flex items-center bg-surface-container-low rounded-full px-2 py-1 gap-1">
            <button
              type="button"
              onClick={() => navigateMonth(-1)}
              className="flex items-center justify-center w-11 h-11 rounded-full hover:bg-white transition-colors"
              aria-label="Mes anterior"
            >
              <span className="material-symbols-outlined text-base">
                chevron_left
              </span>
            </button>
            <span className="font-headline font-bold text-sm min-w-[7rem] text-center">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={() => navigateMonth(1)}
              className="flex items-center justify-center w-11 h-11 rounded-full hover:bg-white transition-colors"
              aria-label="Mes siguiente"
            >
              <span className="material-symbols-outlined text-base">
                chevron_right
              </span>
            </button>
          </div>
          <SyncStatusIndicator
            status={isGoogleConnected ? "synced" : "not_connected"}
          />
        </div>

        <button
          type="button"
          onClick={openNew}
          className="hidden md:flex items-center gap-2 h-11 px-5 bg-teal-accent hover:bg-teal-accent-hover text-white rounded-lg font-bold text-sm transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Nueva cita
        </button>
      </div>

      {/* Desktop: grilla mensual */}
      <div className="hidden md:flex flex-1 bg-surface-container-low/40 p-4">
        <div className="flex-1 min-w-0">
          <CalendarGrid
            appointments={appointments}
            currentMonth={monthDate}
            onDayClick={openForDay}
            onAppointmentClick={handleAppointmentClick}
          />
        </div>
      </div>

      {/* Mobile: lista por día */}
      <div className="md:hidden flex-1 pt-4">
        <AgendaView
          appointments={appointments}
          onAppointmentClick={handleAppointmentClick}
        />
      </div>

      {/* FAB mobile */}
      <button
        type="button"
        onClick={openNew}
        aria-label="Nueva cita"
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-teal-accent hover:bg-teal-accent-hover text-white rounded-full flex items-center justify-center shadow-xl z-40 active:scale-90 transition-transform"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      {slideOverOpen && (
        <NewAppointmentSlideOver
          key={selectedDate?.toISOString() ?? "new"}
          onClose={() => setSlideOverOpen(false)}
          doctorId={doctorId}
          defaultDate={selectedDate}
          isGoogleConnected={isGoogleConnected}
          onCreated={() => router.refresh()}
        />
      )}
    </div>
  )
}
