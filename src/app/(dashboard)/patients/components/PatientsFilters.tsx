"use client"

import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useState, useCallback } from "react"

type Clinic = {
  id: string
  name: string
}

interface PatientsFiltersProps {
  clinics: Clinic[]
}

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "active", label: "Activo" },
  { value: "pending", label: "Pendiente" },
  { value: "inactive", label: "Inactivo" },
]

export default function PatientsFilters({ clinics }: PatientsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showStatusFilter, setShowStatusFilter] = useState(false)

  const currentClinic = searchParams.get("clinic") ?? ""
  const currentStatus = searchParams.get("status") ?? ""

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete("page")
      router.push(`/patients?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      {/* Clinic filter */}
      <select
        value={currentClinic}
        onChange={(e) => updateParam("clinic", e.target.value)}
        className="text-base h-11 px-3 pr-8 bg-white border border-outline-variant/30 rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer flex-1 sm:flex-none sm:w-52"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
      >
        <option value="">Todas las clínicas</option>
        {clinics.map((clinic) => (
          <option key={clinic.id} value={clinic.id}>
            {clinic.name}
          </option>
        ))}
      </select>

      {/* More filters */}
      <div className="relative">
        <button
          onClick={() => setShowStatusFilter((v) => !v)}
          className={`h-11 px-4 flex items-center gap-2 border rounded-lg text-sm font-medium transition-colors ${
            currentStatus
              ? "bg-primary/10 border-primary/30 text-primary"
              : "bg-white border-outline-variant/30 text-secondary hover:bg-surface-container"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            tune
          </span>
          Más filtros
          {currentStatus && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          )}
        </button>

        {showStatusFilter && (
          <div className="absolute top-12 left-0 z-20 bg-white border border-outline-variant/20 rounded-xl shadow-lg p-2 w-44">
            <p className="text-[10px] font-bold text-secondary uppercase tracking-wider px-2 py-1">
              Estado
            </p>
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  updateParam("status", opt.value)
                  setShowStatusFilter(false)
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                  currentStatus === opt.value
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-on-surface hover:bg-surface-container"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Spacer */}
      <div className="hidden sm:block flex-1" />

      {/* New patient button */}
      <Link
        href="/patients/new"
        className="h-11 px-5 inline-flex items-center justify-center gap-2 bg-sidebar-active text-white text-sm font-semibold rounded-lg hover:bg-sidebar-active/90 transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
        Nuevo paciente
      </Link>
    </div>
  )
}
