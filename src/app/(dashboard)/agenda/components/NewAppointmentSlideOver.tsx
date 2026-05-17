"use client"

import { useState, useEffect, useTransition } from "react"
import { format } from "date-fns"
import ClinicSelector, {
  type SelectedClinic,
} from "@/components/shared/ClinicSelector"
import {
  searchPatientsForAppointment,
  createAppointment,
} from "@/lib/actions/appointments"

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

type PatientResult = { id: string; full_name: string; id_number: string | null }

interface NewAppointmentSlideOverProps {
  onClose: () => void
  doctorId: string
  defaultDate: Date | null
  onCreated: () => void
}

export default function NewAppointmentSlideOver({
  onClose,
  doctorId,
  defaultDate,
  onCreated,
}: NewAppointmentSlideOverProps) {
  const [visible, setVisible] = useState(false)

  const [patientQuery, setPatientQuery] = useState("")
  const [patientResults, setPatientResults] = useState<PatientResult[]>([])
  const [selectedPatient, setSelectedPatient] = useState<PatientResult | null>(
    null
  )
  const [searched, setSearched] = useState(false)

  const [clinic, setClinic] = useState<SelectedClinic | null>(null)
  const [dateStr, setDateStr] = useState(() =>
    format(defaultDate ?? new Date(), "yyyy-MM-dd")
  )
  const [timeStr, setTimeStr] = useState("09:00")
  const [duration, setDuration] = useState(45)
  const [treatment, setTreatment] = useState(TREATMENTS[0])
  const [notes, setNotes] = useState("")
  const [gcalSync, setGcalSync] = useState(true)

  const [error, setError] = useState<string | null>(null)
  const [isSearching, startSearch] = useTransition()
  const [isSaving, startSave] = useTransition()

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
      const result = await createAppointment({
        patientId: selectedPatient.id,
        clinicId: clinic.id,
        scheduledAt: scheduledAt.toISOString(),
        durationMinutes: duration,
        treatmentType: treatment,
        notes,
        gcalSyncEnabled: gcalSync,
      })
      if (result.error) {
        setError(result.error)
        return
      }
      onCreated()
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
            Nueva cita
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
            <label className="flex items-center justify-between cursor-pointer">
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
                  onChange={(e) => setGcalSync(e.target.checked)}
                />
                <span className="w-10 h-5 bg-outline-variant/40 rounded-full peer-checked:bg-teal-accent transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
              </span>
            </label>
          </div>

          {error && (
            <p className="text-sm text-error bg-error-container/40 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Acciones */}
        <div className="p-6 bg-surface-container-low/60 grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="h-11 px-4 rounded-lg font-bold text-sm text-secondary hover:bg-surface-container-high transition-all active:scale-95 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="h-11 px-4 bg-teal-accent hover:bg-teal-accent-hover text-white rounded-lg font-bold text-sm transition-all active:scale-95 disabled:opacity-60"
          >
            {isSaving ? "Guardando..." : "Guardar cita"}
          </button>
        </div>
      </div>
    </div>
  )
}
