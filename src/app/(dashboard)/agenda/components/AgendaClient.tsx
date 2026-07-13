"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Appointment } from "@/types/appointments"
import { syncPendingAppointments } from "@/lib/actions/appointments"
import { disconnectGoogle } from "@/lib/actions/google"
import CalendarGrid from "./CalendarGrid"
import AgendaView from "./AgendaView"
import SyncStatusIndicator from "./SyncStatusIndicator"
import NewAppointmentSlideOver from "./NewAppointmentSlideOver"
import NewPatientSlideOver from "./NewPatientSlideOver"

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
  googleEmail: string | null
}

export default function AgendaClient({
  appointments,
  month,
  doctorId,
  isGoogleConnected,
  googleEmail,
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
  const [newPatientOpen, setNewPatientOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null)
  const [isSyncing, startSync] = useTransition()
  const [isDisconnecting, startDisconnect] = useTransition()
  const [confirmDisconnect, setConfirmDisconnect] = useState(false)

  function navigateMonth(delta: number) {
    router.push(`/agenda?month=${shiftMonth(month, delta)}`)
  }

  function openForDay(date: Date) {
    setEditingAppointment(null)
    setSelectedDate(date)
    setSlideOverOpen(true)
  }

  function openNew() {
    setEditingAppointment(null)
    setSelectedDate(new Date())
    setSlideOverOpen(true)
  }

  function openNewPatient() {
    setSelectedDate(new Date())
    setNewPatientOpen(true)
  }

  function handleAppointmentClick(appointment: Appointment) {
    setEditingAppointment(appointment)
    setSelectedDate(new Date(appointment.scheduled_at))
    setSlideOverOpen(true)
  }

  function handleSyncNow() {
    startSync(async () => {
      await syncPendingAppointments()
      router.refresh()
    })
  }

  function handleDisconnect() {
    startDisconnect(async () => {
      await disconnectGoogle()
      setConfirmDisconnect(false)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Feedback de conexión Google */}
      {googleFeedback && (
        <div
          className={`flex items-center justify-between gap-3 px-4 sm:px-6 py-3 text-sm font-medium ${
            googleFeedback === "connected"
              ? "bg-green-50 text-green-700"
              : googleFeedback === "scope_missing"
                ? "bg-amber-50 text-amber-700"
                : "bg-error-container text-error"
          }`}
        >
          <span>
            {googleFeedback === "connected"
              ? "Google Calendar conectado. Tus próximas citas se sincronizarán."
              : googleFeedback === "scope_missing"
                ? "Faltó el permiso de calendario. Volvé a conectar y aceptá el acceso a “Ver y editar eventos” para que las citas se sincronicen."
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
          {isGoogleConnected && googleEmail && (
            <div
              className="flex items-center gap-1.5 h-11 px-3 bg-surface-container-low rounded-lg max-w-[12rem]"
              title={`Integrado con ${googleEmail}`}
            >
              <span className="material-symbols-outlined text-secondary text-lg shrink-0">
                account_circle
              </span>
              <span className="text-xs font-medium text-on-surface truncate">
                {googleEmail}
              </span>
            </div>
          )}
          {isGoogleConnected && (
            <button
              type="button"
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="flex items-center gap-1.5 h-11 px-3 rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors disabled:opacity-60"
            >
              <span
                className={`material-symbols-outlined text-lg ${
                  isSyncing ? "animate-spin" : ""
                }`}
              >
                sync
              </span>
              <span className="hidden sm:inline">
                {isSyncing ? "Sincronizando…" : "Sincronizar ahora"}
              </span>
            </button>
          )}
          {isGoogleConnected &&
            (confirmDisconnect ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  className="flex items-center gap-1.5 h-11 px-3 rounded-lg text-sm font-semibold text-white bg-error hover:brightness-110 transition-all disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-lg">
                    link_off
                  </span>
                  {isDisconnecting ? "Desconectando…" : "Confirmar"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDisconnect(false)}
                  disabled={isDisconnecting}
                  className="h-11 px-3 rounded-lg text-sm font-semibold text-secondary hover:bg-surface-container-low transition-colors disabled:opacity-60"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDisconnect(true)}
                className="flex items-center gap-1.5 h-11 px-3 rounded-lg text-sm font-semibold text-error hover:bg-error-container/40 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">
                  link_off
                </span>
                <span className="hidden sm:inline">Desincronizar</span>
              </button>
            ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            onClick={openNewPatient}
            className="flex items-center gap-2 h-11 px-4 border border-teal-accent text-teal-accent hover:bg-teal-surface rounded-lg font-bold text-sm transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">person_add</span>
            Paciente nuevo
          </button>
          <button
            type="button"
            onClick={openNew}
            className="flex items-center gap-2 h-11 px-5 bg-teal-accent hover:bg-teal-accent-hover text-white rounded-lg font-bold text-sm transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Nueva cita
          </button>
        </div>
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

      {/* FAB mobile: paciente nuevo (secundario) */}
      <button
        type="button"
        onClick={openNewPatient}
        aria-label="Agendar paciente nuevo"
        className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-white border border-teal-accent text-teal-accent rounded-full flex items-center justify-center shadow-xl z-40 active:scale-90 transition-transform"
      >
        <span className="material-symbols-outlined text-2xl">person_add</span>
      </button>

      {/* FAB mobile: nueva cita (principal) */}
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
          key={editingAppointment?.id ?? selectedDate?.toISOString() ?? "new"}
          onClose={() => setSlideOverOpen(false)}
          doctorId={doctorId}
          defaultDate={selectedDate}
          isGoogleConnected={isGoogleConnected}
          appointment={editingAppointment}
          onSaved={() => router.refresh()}
        />
      )}

      {newPatientOpen && (
        <NewPatientSlideOver
          onClose={() => setNewPatientOpen(false)}
          doctorId={doctorId}
          defaultDate={selectedDate}
          isGoogleConnected={isGoogleConnected}
          onSaved={() => router.refresh()}
        />
      )}
    </div>
  )
}
