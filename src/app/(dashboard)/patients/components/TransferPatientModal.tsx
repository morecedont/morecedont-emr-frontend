"use client"

import { useState, useTransition } from "react"
import { searchDoctors, transferPatient } from "@/lib/actions/patients"

type Doctor = {
  id: string
  full_name: string
  email: string
  specialty: string | null
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

interface TransferPatientModalProps {
  patientId: string
  patientName: string
  onClose: () => void
}

export default function TransferPatientModal({
  patientId,
  patientName,
  onClose,
}: TransferPatientModalProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Doctor[]>([])
  const [searched, setSearched] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [notes, setNotes] = useState("")
  const [confirmed, setConfirmed] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSearching, startSearch] = useTransition()
  const [isTransferring, startTransfer] = useTransition()

  function handleSearch(value: string) {
    setQuery(value)
    if (value.trim().length < 2) {
      setResults([])
      setSearched(false)
      return
    }
    startSearch(async () => {
      const doctors = await searchDoctors(value)
      setResults(doctors)
      setSearched(true)
    })
  }

  function handleTransfer() {
    if (!selectedDoctor || !confirmed) return
    setError(null)
    startTransfer(async () => {
      const result = await transferPatient(patientId, selectedDoctor.id, notes || undefined)
      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error ?? "Error al transferir")
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-error text-[20px]">
              swap_horiz
            </span>
            <h2 className="text-base font-bold text-on-surface">
              Traspasar paciente
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-outline text-[20px]">
              close
            </span>
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center py-6 gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600">
                check_circle
              </span>
            </div>
            <p className="font-bold text-on-surface">
              Paciente traspasado exitosamente
            </p>
            <p className="text-xs text-secondary">
              {selectedDoctor?.full_name} es ahora el responsable de{" "}
              <span className="font-semibold">{patientName}</span>.
              Usted ya no tiene acceso a este paciente.
            </p>
            <button
              onClick={onClose}
              className="mt-2 h-10 px-6 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            {/* Warning banner */}
            <div className="flex gap-2 p-3 bg-error/8 border border-error/20 rounded-xl mb-4">
              <span className="material-symbols-outlined text-error text-[18px] shrink-0 mt-0.5">
                warning
              </span>
              <p className="text-xs text-error leading-relaxed">
                Esta acción es <strong>irreversible</strong>. El nuevo doctor
                asume la gestión completa de{" "}
                <span className="font-semibold">{patientName}</span> y usted
                perderá el acceso permanentemente.
              </p>
            </div>

            {/* Search input */}
            <div className="relative mb-4">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Buscar doctor por nombre o email..."
                className="w-full text-base bg-surface-container-low rounded-lg py-2.5 pl-10 pr-4 border border-outline-variant/30 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all"
              />
            </div>

            {/* Results */}
            {isSearching ? (
              <div className="py-6 text-center text-sm text-secondary">
                Buscando...
              </div>
            ) : searched && results.length === 0 ? (
              <div className="py-6 text-center text-sm text-secondary">
                No se encontraron doctores activos
              </div>
            ) : (
              <div className="space-y-1 max-h-40 overflow-y-auto mb-4">
                {results.map((doctor) => (
                  <button
                    key={doctor.id}
                    onClick={() => { setSelectedDoctor(doctor); setConfirmed(false) }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                      selectedDoctor?.id === doctor.id
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-surface-container-low border border-transparent"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-xs shrink-0">
                      {getInitials(doctor.full_name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">
                        {doctor.full_name}
                      </p>
                      <p className="text-xs text-secondary truncate">
                        {doctor.specialty ?? doctor.email}
                      </p>
                    </div>
                    {selectedDoctor?.id === doctor.id && (
                      <span className="material-symbols-outlined text-primary text-[18px] ml-auto shrink-0">
                        check_circle
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Notes field (optional) */}
            {selectedDoctor && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-secondary mb-1">
                  Notas del traspaso (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Motivo del traspaso u observaciones relevantes..."
                  rows={2}
                  className="w-full text-base bg-surface-container-low rounded-lg px-3 py-2 border border-outline-variant/30 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all resize-none text-sm"
                />
              </div>
            )}

            {/* Confirmation checkbox */}
            {selectedDoctor && (
              <label className="flex items-start gap-2 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5 accent-error w-4 h-4 shrink-0"
                />
                <span className="text-xs text-on-surface leading-relaxed">
                  Entiendo que perderé el acceso permanente a{" "}
                  <strong>{patientName}</strong> y que este traspaso no puede
                  deshacerse.
                </span>
              </label>
            )}

            {/* Error */}
            {error && (
              <p className="text-xs text-error bg-error/8 rounded-lg px-3 py-2 mb-3">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 h-11 rounded-lg border border-outline-variant/30 text-sm font-semibold text-secondary hover:bg-surface-container transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleTransfer}
                disabled={!selectedDoctor || !confirmed || isTransferring}
                className="flex-1 h-11 rounded-lg bg-error text-white text-sm font-semibold hover:bg-error/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isTransferring ? "Traspasando..." : "Traspasar paciente"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
