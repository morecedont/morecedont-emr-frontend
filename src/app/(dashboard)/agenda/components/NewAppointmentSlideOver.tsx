"use client"

import { useState, useEffect, useTransition } from "react"
import { format } from "date-fns"
import ClinicSelector, {
  type SelectedClinic,
} from "@/components/shared/ClinicSelector"
import {
  searchPatientsForAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  deleteAppointment,
} from "@/lib/actions/appointments"
import type { Appointment } from "@/types/appointments"

const DURATIONS = [30, 45, 60, 90]
const TREATMENTS = [
  "Limpieza",
  "Revisión",
  "Extracción",
  "Implante",
  "Ortodoncia",
  "Endodoncia",
  "Otro",
]

type PatientResult = {
  id: string
  full_name: string
  id_number: string | null
  email?: string | null
}

interface NewAppointmentSlideOverProps {
  onClose: () => void
  doctorId: string
  defaultDate: Date | null
  isGoogleConnected: boolean
  onSaved: () => void
  /** Si viene, el slide-over abre en modo edición de esa cita. */
  appointment?: Appointment | null
}

export default function NewAppointmentSlideOver({
  onClose,
  doctorId,
  defaultDate,
  isGoogleConnected,
  onSaved,
  appointment,
}: NewAppointmentSlideOverProps) {
  const isEdit = !!appointment
  const apptDate = appointment ? new Date(appointment.scheduled_at) : null

  const [visible, setVisible] = useState(false)

  const [patientQuery, setPatientQuery] = useState("")
  const [patientResults, setPatientResults] = useState<PatientResult[]>([])
  const [selectedPatient, setSelectedPatient] = useState<PatientResult | null>(
    appointment
      ? {
          id: appointment.patient_id,
          full_name: appointment.patient.full_name,
          id_number: null,
          email: appointment.patient.email,
        }
      : null
  )
  const [searched, setSearched] = useState(false)

  const [clinic, setClinic] = useState<SelectedClinic | null>(
    appointment
      ? { id: appointment.clinic_id, name: appointment.clinic.name }
      : null
  )
  const [dateStr, setDateStr] = useState(() =>
    format(apptDate ?? defaultDate ?? new Date(), "yyyy-MM-dd")
  )
  const [timeStr, setTimeStr] = useState(() =>
    apptDate ? format(apptDate, "HH:mm") : "09:00"
  )
  const [duration, setDuration] = useState(appointment?.duration_minutes ?? 45)
  const [treatment, setTreatment] = useState(
    appointment?.treatment_type ?? TREATMENTS[0]
  )
  const [notes, setNotes] = useState(appointment?.notes ?? "")
  const [gcalSync, setGcalSync] = useState(appointment?.gcal_sync_enabled ?? true)

  const [error, setError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [isSearching, startSearch] = useTransition()
  const [isSaving, startSave] = useTransition()
  const [isRemoving, startRemove] = useTransition()

  // El componente se monta recién al abrir (key en el padre), así que el
  // estado ya arranca limpio: el effect solo dispara la transición de entrada.
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  function handleClose() {
    onClose()
  }

  function handlePatientSearch(value: string) {
    setPatientQuery(value)
    setSelectedPatient(null)
    if (value.trim().length < 2) {
      setPatientResults([])
      setSearched(false)
      return
    }
    startSearch(async () => {
      const res = await searchPatientsForAppointment(value)
      setPatientResults(res)
      setSearched(true)
    })
  }

  function handleSave() {
    setError(null)
    if (!selectedPatient) return setError("Seleccioná un paciente")
    if (!clinic) return setError("Seleccioná una clínica")
    if (!dateStr) return setError("La fecha es requerida")
    if (!timeStr) return setError("La hora es requerida")

    const scheduledAt = new Date(`${dateStr}T${timeStr}:00`)
    if (isNaN(scheduledAt.getTime())) return setError("Fecha u hora inválida")

    startSave(async () => {
      const payload = {
        patientId: selectedPatient.id,
        clinicId: clinic.id,
        scheduledAt: scheduledAt.toISOString(),
        durationMinutes: duration,
        treatmentType: treatment,
        notes,
        gcalSyncEnabled: gcalSync,
      }
      const result =
        isEdit && appointment
          ? await updateAppointment({ id: appointment.id, ...payload })
          : await createAppointment(payload)
      if (result.error) {
        setError(result.error)
        return
      }
      onSaved()
      onClose()
    })
  }

  function handleCancelAppointment() {
    if (!appointment) return
    setError(null)
    startRemove(async () => {
      const result = await cancelAppointment(appointment.id)
      if (result.error) {
        setError(result.error)
        return
      }
      onSaved()
      onClose()
    })
  }

  function handleDeleteAppointment() {
    if (!appointment) return
    setError(null)
    startRemove(async () => {
      const result = await deleteAppointment(appointment.id)
      if (result.error) {
        setError(result.error)
        return
      }
      onSaved()
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`relative h-full w-full sm:w-96 bg-white flex flex-col transition-transform duration-300 ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-6 flex justify-between items-center bg-surface-container-lowest">
          <h3 className="font-headline font-bold text-lg text-on-surface">
            {isEdit ? "Editar cita" : "Nueva cita"}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="flex items-center justify-center w-11 h-11 -mr-2 text-secondary hover:bg-surface-container rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Paciente */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-secondary uppercase tracking-wider">
              Paciente
            </label>
            {selectedPatient ? (
              <div className="bg-teal-surface border border-teal-border rounded-lg p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-on-surface text-sm truncate">
                    {selectedPatient.full_name}
                  </p>
                  {selectedPatient.id_number && (
                    <p className="text-xs text-secondary truncate">
                      {selectedPatient.id_number}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPatient(null)
                    setPatientQuery("")
                  }}
                  className="shrink-0 text-secondary hover:text-error transition-colors"
                  aria-label="Quitar paciente"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    close
                  </span>
                </button>
              </div>
            ) : (
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">
                  search
                </span>
                <input
                  className="text-base w-full h-11 bg-white border border-outline-variant/40 rounded-lg pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline/50"
                  type="text"
                  value={patientQuery}
                  onChange={(e) => handlePatientSearch(e.target.value)}
                  placeholder="Buscar por nombre o DNI..."
                />
                {(isSearching || (searched && patientResults.length >= 0)) &&
                  patientQuery.trim().length >= 2 && (
                    <div className="absolute z-10 w-full bg-white border border-outline-variant/20 rounded-lg shadow-lg mt-1 max-h-56 overflow-y-auto">
                      {isSearching ? (
                        <p className="px-4 py-3 text-sm text-secondary">
                          Buscando...
                        </p>
                      ) : patientResults.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-secondary">
                          Sin resultados
                        </p>
                      ) : (
                        patientResults.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSelectedPatient(p)
                              setPatientResults([])
                              setSearched(false)
                            }}
                            className="w-full h-auto text-left px-4 py-3 hover:bg-surface-container-low transition-colors"
                          >
                            <p className="text-sm font-semibold text-on-surface truncate">
                              {p.full_name}
                            </p>
                            {p.id_number && (
                              <p className="text-xs text-secondary truncate">
                                {p.id_number}
                              </p>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* Clínica */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-secondary uppercase tracking-wider">
              Clínica
            </label>
            <ClinicSelector
              value={clinic}
              doctorId={doctorId}
              onChange={setClinic}
              placeholder="Buscar o crear clínica..."
            />
          </div>

          {/* Fecha y hora */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-secondary uppercase tracking-wider">
                Fecha
              </label>
              <input
                className="text-base w-full h-11 px-3 rounded-lg bg-white border border-outline-variant/40 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-secondary uppercase tracking-wider">
                Hora
              </label>
              <input
                className="text-base w-full h-11 px-3 rounded-lg bg-white border border-outline-variant/40 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
              />
            </div>
          </div>

          {/* Duración */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold text-secondary uppercase tracking-wider">
              Duración estimada
            </label>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`h-11 px-4 rounded-full text-xs font-bold transition-colors ${
                    duration === d
                      ? "bg-primary-container text-white"
                      : "border border-outline-variant/40 text-on-surface hover:bg-surface-container-low"
                  }`}
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>

          {/* Tratamiento */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-secondary uppercase tracking-wider">
              Tratamiento
            </label>
            <select
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              className="text-base w-full h-11 px-3 rounded-lg bg-white border border-outline-variant/40 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              {TREATMENTS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-secondary uppercase tracking-wider">
              Notas adicionales
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Escriba aquí alguna observación..."
              rows={3}
              className="text-base w-full px-3 py-2.5 rounded-lg bg-white border border-outline-variant/40 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all placeholder:text-outline/50"
            />
          </div>

          {/* Toggle sync */}
          <div className="pt-4">
            <label
              className={`flex items-center justify-between ${
                isGoogleConnected ? "cursor-pointer" : "opacity-60"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="w-8 h-8 bg-teal-surface rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-teal-accent text-lg">
                    sync
                  </span>
                </span>
                <span className="text-sm font-bold text-on-surface">
                  Sincronizar con Google Calendar
                </span>
              </span>
              <span className="relative inline-flex items-center">
                <input
                  className="text-base sr-only peer"
                  type="checkbox"
                  checked={gcalSync}
                  disabled={!isGoogleConnected}
                  onChange={(e) => setGcalSync(e.target.checked)}
                />
                <span className="w-10 h-5 bg-outline-variant/40 rounded-full peer-checked:bg-teal-accent peer-disabled:opacity-50 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
              </span>
            </label>
            {!isGoogleConnected && (
              <p className="mt-2 text-xs text-secondary">
                Conectá Google Calendar (botón arriba) para que esta cita se
                sincronice. La preferencia se guarda igual.
              </p>
            )}

            {/* Aviso de invitación al paciente */}
            {isGoogleConnected && gcalSync && selectedPatient && (
              <div className="mt-2 flex items-start gap-2 text-xs">
                <span
                  className={`material-symbols-outlined text-[15px] shrink-0 ${
                    selectedPatient.email ? "text-teal-accent" : "text-secondary"
                  }`}
                >
                  {selectedPatient.email ? "mail" : "mail_off"}
                </span>
                {selectedPatient.email ? (
                  <p className="text-secondary">
                    Se invitará a{" "}
                    <span className="font-semibold text-on-surface">
                      {selectedPatient.email}
                    </span>{" "}
                    — recibirá el evento en su Google Calendar.
                  </p>
                ) : (
                  <p className="text-secondary">
                    Este paciente no tiene email registrado: se creará el evento
                    pero no recibirá invitación.
                  </p>
                )}
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-error bg-error-container/40 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Acciones */}
        <div className="p-6 bg-surface-container-low/60 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving || isRemoving}
              className="h-11 px-4 rounded-lg font-bold text-sm text-secondary hover:bg-surface-container-high transition-all active:scale-95 disabled:opacity-60"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isRemoving}
              className="h-11 px-4 bg-teal-accent hover:bg-teal-accent-hover text-white rounded-lg font-bold text-sm transition-all active:scale-95 disabled:opacity-60"
            >
              {isSaving
                ? "Guardando..."
                : isEdit
                  ? "Guardar cambios"
                  : "Guardar cita"}
            </button>
          </div>

          {isEdit && (
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleCancelAppointment}
                disabled={isSaving || isRemoving}
                className="h-11 px-4 rounded-lg font-bold text-sm text-on-surface border border-outline-variant/40 hover:bg-surface-container-high transition-all active:scale-95 disabled:opacity-60"
              >
                {isRemoving ? "..." : "Cancelar cita"}
              </button>
              {confirmingDelete ? (
                <button
                  type="button"
                  onClick={handleDeleteAppointment}
                  disabled={isSaving || isRemoving}
                  className="h-11 px-4 rounded-lg font-bold text-sm text-white bg-error hover:brightness-110 transition-all active:scale-95 disabled:opacity-60"
                >
                  {isRemoving ? "Eliminando..." : "Confirmar"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  disabled={isSaving || isRemoving}
                  className="h-11 px-4 rounded-lg font-bold text-sm text-error border border-error/40 hover:bg-error-container/40 transition-all active:scale-95 disabled:opacity-60"
                >
                  Eliminar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
