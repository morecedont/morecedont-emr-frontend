"use client"

import { useState, useTransition } from "react"
import { searchDoctors, sharePatient } from "@/lib/actions/patients"

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

interface SharePatientModalProps {
  patientId: string
  patientName: string
  onClose: () => void
}

export default function SharePatientModal({
  patientId,
  patientName,
  onClose,
}: SharePatientModalProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Doctor[]>([])
  const [searched, setSearched] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSearching, startSearch] = useTransition()
  const [isSharing, startShare] = useTransition()

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

  function handleShare() {
    if (!selectedDoctor) return
    setError(null)
    startShare(async () => {
      const result = await sharePatient(patientId, selectedDoctor.id)
      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error ?? "Error al compartir")
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-on-surface">
            Compartir historial
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-outline text-[20px]">
              close
            </span>
          </button>
        </div>

        <p className="text-xs text-secondary mb-4">
          Compartir historial de{" "}
          <span className="font-semibold text-on-surface">{patientName}</span>{" "}
          con otro doctor
        </p>

        {success ? (
          /* Success state */
          <div className="flex flex-col items-center py-6 gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600">
                check_circle
              </span>
            </div>
            <p className="font-bold text-on-surface">
              Historial compartido exitosamente
            </p>
            <p className="text-xs text-secondary">
              {selectedDoctor?.full_name} ahora tiene acceso al historial.
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
            {/* Search input */}
            <div className="relative mb-4">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Buscar por nombre o email..."
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
                No se encontraron doctores
              </div>
            ) : (
              <div className="space-y-1 max-h-48 overflow-y-auto mb-4">
                {results.map((doctor) => (
                  <button
                    key={doctor.id}
                    onClick={() => setSelectedDoctor(doctor)}
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

            {/* Error */}
            {error && (
              <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">
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
                onClick={handleShare}
                disabled={!selectedDoctor || isSharing}
                className="flex-1 h-11 rounded-lg bg-sidebar-active text-white text-sm font-semibold hover:bg-sidebar-active/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSharing ? "Compartiendo..." : "Compartir"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
