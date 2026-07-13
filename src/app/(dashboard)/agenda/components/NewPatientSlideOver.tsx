"use client"

import { useState, useEffect, useTransition } from "react"
import { format } from "date-fns"
import ClinicSelector, {
  type SelectedClinic,
} from "@/components/shared/ClinicSelector"
import { scheduleNewPatient } from "@/lib/actions/appointments"

const DURATIONS = [30, 45, 60, 90]

const labelCls =
  "text-xs font-extrabold text-secondary uppercase tracking-wider"
const fieldCls =
  "text-base w-full h-11 px-3 rounded-lg bg-white border border-outline-variant/40 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline/50"

interface NewPatientSlideOverProps {
  onClose: () => void
  doctorId: string
  defaultDate: Date | null
  isGoogleConnected: boolean
  onSaved: () => void
}

/**
 * "Agendar paciente nuevo": datos administrativos mínimos + primera cita.
 * NO crea historia clínica (se completa en la consulta). Distinto del wizard
 * completo de alta de paciente.
 */
export default function NewPatientSlideOver({
  onClose,
  doctorId,
  defaultDate,
  isGoogleConnected,
  onSaved,
}: NewPatientSlideOverProps) {
  const [visible, setVisible] = useState(false)

  // Datos mínimos del paciente
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [referredBy, setReferredBy] = useState("")
  const [approximateAge, setApproximateAge] = useState("")

  // Datos de la cita
  const [clinic, setClinic] = useState<SelectedClinic | null>(null)
  const [dateStr, setDateStr] = useState(() =>
    format(defaultDate ?? new Date(), "yyyy-MM-dd")
  )
  const [timeStr, setTimeStr] = useState("09:00")
  const [duration, setDuration] = useState(45)
  const [reason, setReason] = useState("")
  const [gcalSync, setGcalSync] = useState(true)

  const [error, setError] = useState<string | null>(null)
  const [isSaving, startSave] = useTransition()

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  function handleSave() {
    setError(null)
    if (!fullName.trim()) return setError("El nombre es requerido")
    if (!phone.trim()) return setError("El teléfono es requerido")
    if (!clinic) return setError("Seleccioná una clínica")
    if (!dateStr) return setError("La fecha es requerida")
    if (!timeStr) return setError("La hora es requerida")

    const scheduledAt = new Date(`${dateStr}T${timeStr}:00`)
    if (isNaN(scheduledAt.getTime())) return setError("Fecha u hora inválida")

    let age: number | null = null
    if (approximateAge.trim()) {
      age = parseInt(approximateAge, 10)
      if (!Number.isInteger(age) || age < 0 || age > 130) {
        return setError("Edad aproximada inválida")
      }
    }

    startSave(async () => {
      const result = await scheduleNewPatient({
        fullName,
        phone,
        email: email.trim() || null,
        referredBy: referredBy.trim() || null,
        approximateAge: age,
        clinicId: clinic.id,
        scheduledAt: scheduledAt.toISOString(),
        durationMinutes: duration,
        reasonForVisit: reason.trim() || null,
        gcalSyncEnabled: gcalSync,
      })
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
        onClick={onClose}
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
          <div>
            <h3 className="font-headline font-bold text-lg text-on-surface">
              Agendar paciente nuevo
            </h3>
            <p className="text-xs text-secondary mt-0.5">
              Datos mínimos + primera cita. La historia se completa en la consulta.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-11 h-11 -mr-2 text-secondary hover:bg-surface-container rounded-full transition-colors shrink-0"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Nombre */}
          <div className="space-y-2">
            <label className={labelCls}>
              Nombre completo <span className="text-error">*</span>
            </label>
            <input
              className={fieldCls}
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej. María Pérez"
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <label className={labelCls}>
              Teléfono <span className="text-error">*</span>
            </label>
            <input
              className={fieldCls}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej. +58 412 1234567"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className={labelCls}>Email (opcional)</label>
            <input
              className={fieldCls}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="para invitarlo al evento de Calendar"
            />
          </div>

          {/* Referido por + Edad aproximada */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={labelCls}>Referido por</label>
              <input
                className={fieldCls}
                type="text"
                value={referredBy}
                onChange={(e) => setReferredBy(e.target.value)}
                placeholder="opcional"
              />
            </div>
            <div className="space-y-2">
              <label className={labelCls}>Edad aprox.</label>
              <input
                className={fieldCls}
                type="number"
                min={0}
                max={130}
                value={approximateAge}
                onChange={(e) => setApproximateAge(e.target.value)}
                placeholder="opcional"
              />
            </div>
          </div>

          {/* Clínica */}
          <div className="space-y-2">
            <label className={labelCls}>
              Clínica <span className="text-error">*</span>
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
              <label className={labelCls}>
                Fecha <span className="text-error">*</span>
              </label>
              <input
                className={`${fieldCls} font-medium`}
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className={labelCls}>
                Hora <span className="text-error">*</span>
              </label>
              <input
                className={`${fieldCls} font-medium`}
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
              />
            </div>
          </div>

          {/* Duración */}
          <div className="space-y-3">
            <label className={labelCls}>Duración estimada</label>
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

          {/* Motivo de consulta */}
          <div className="space-y-2">
            <label className={labelCls}>Motivo de consulta</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej. dolor en molar, revisión general..."
              rows={2}
              className="text-base w-full px-3 py-2.5 rounded-lg bg-white border border-outline-variant/40 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all placeholder:text-outline/50"
            />
          </div>

          {/* Toggle sync */}
          <div className="pt-2">
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
            {isGoogleConnected && gcalSync && (
              <div className="mt-2 flex items-start gap-2 text-xs">
                <span
                  className={`material-symbols-outlined text-[15px] shrink-0 ${
                    email.trim() ? "text-teal-accent" : "text-secondary"
                  }`}
                >
                  {email.trim() ? "mail" : "mail_off"}
                </span>
                <p className="text-secondary">
                  {email.trim()
                    ? "Se invitará al paciente por email al evento de Calendar."
                    : "Sin email: se crea el evento pero el paciente no recibe invitación."}
                </p>
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
        <div className="p-6 bg-surface-container-low/60">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="h-11 px-4 rounded-lg font-bold text-sm text-secondary hover:bg-surface-container-high transition-all active:scale-95 disabled:opacity-60"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="h-11 px-4 bg-teal-accent hover:bg-teal-accent-hover text-white rounded-lg font-bold text-sm transition-all active:scale-95 disabled:opacity-60"
            >
              {isSaving ? "Agendando..." : "Agendar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
