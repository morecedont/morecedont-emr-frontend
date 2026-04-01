"use client"

import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export type HistoryRow = {
  id: string
  patientId: string
  clinicName: string | null
  firstProcedure: string | null
  createdAt: string
  status: "active" | "completed" | "paused"
}

function formatDateRange(createdAt: string, status: "active" | "completed" | "paused"): string {
  const start = format(new Date(createdAt), "MMM yyyy", { locale: es }).toUpperCase()
  if (status === "active") return `${start} — EN CURSO`
  return `${start}`
}

const STATUS_DOT: Record<string, string> = {
  active: "bg-green-500",
  completed: "bg-blue-500",
  paused: "bg-yellow-500",
}

const STATUS_BADGE: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  completed: "bg-blue-50 text-blue-700",
  paused: "bg-yellow-50 text-yellow-700",
}

const STATUS_LABEL: Record<string, string> = {
  active: "Activo",
  completed: "Completado",
  paused: "En pausa",
}

interface TreatmentHistoryListProps {
  histories: HistoryRow[]
  patientId: string
}

export default function TreatmentHistoryList({ histories, patientId }: TreatmentHistoryListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-on-surface">Historial de tratamientos</h2>
        <Link href={`/patients/${patientId}`} className="text-sm font-semibold text-sidebar-active hover:underline">
          Ver todo →
        </Link>
      </div>

      {histories.length === 0 ? (
        <div className="bg-white rounded-xl border border-outline-variant/10 p-10 flex flex-col items-center gap-3 text-center">
          <span className="material-symbols-outlined text-outline text-5xl">medical_information</span>
          <p className="font-bold text-on-surface">No hay historias clínicas registradas</p>
          <p className="text-sm text-secondary">Crea la primera historia para este paciente.</p>
          <Link
            href={`/patients/${patientId}/history/new`}
            className="h-10 px-5 inline-flex items-center gap-2 bg-sidebar-active text-white text-sm font-semibold rounded-lg hover:bg-sidebar-active/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Crear primera historia clínica
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {histories.map((h) => (
            <Link
              key={h.id}
              href={`/patients/${patientId}/history/${h.id}`}
              className="flex items-center gap-4 bg-white rounded-xl border border-outline-variant/10 px-5 py-4 hover:border-primary/30 hover:shadow-sm transition-all group"
            >
              {/* Colored dot */}
              <span className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[h.status]} shrink-0 mt-0.5`} />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                    {formatDateRange(h.createdAt, h.status)}
                  </p>
                  {h.clinicName && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-[#E6EAF5] text-secondary rounded-full uppercase tracking-wide">
                      {h.clinicName}
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-on-surface truncate">
                  {h.firstProcedure ?? "Sin procedimientos registrados"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${STATUS_BADGE[h.status]}`}>
                    {STATUS_LABEL[h.status]}
                  </span>
                </div>
              </div>

              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px] shrink-0">
                chevron_right
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
