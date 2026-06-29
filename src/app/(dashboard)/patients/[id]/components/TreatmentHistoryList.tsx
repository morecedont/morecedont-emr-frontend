"use client"

import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Pagination from "../../components/Pagination"

export type HistoryRow = {
  id: string
  patientId: string
  clinicName: string | null
  firstProcedure: string | null
  createdAt: string
  status: "active" | "completed" | "paused" | "draft"
}

function formatDateRange(createdAt: string, status: "active" | "completed" | "paused" | "draft"): string {
  const start = format(new Date(createdAt), "MMM yyyy", { locale: es }).toUpperCase()
  if (status === "active") return `${start} — EN CURSO`
  if (status === "draft") return `${start} — BORRADOR`
  return start
}

const STATUS_DOT: Record<string, string> = {
  active: "bg-green-500",
  completed: "bg-blue-500",
  paused: "bg-yellow-500",
  draft: "bg-amber-400",
}

const STATUS_BADGE: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  completed: "bg-blue-50 text-blue-700",
  paused: "bg-yellow-50 text-yellow-700",
  draft: "bg-amber-100 text-amber-700",
}

const STATUS_LABEL: Record<string, string> = {
  active: "Activo",
  completed: "Completado",
  paused: "En pausa",
  draft: "Borrador",
}

interface TreatmentHistoryListProps {
  histories: HistoryRow[]
  draftHistories: HistoryRow[]
  patientId: string
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
}

export default function TreatmentHistoryList({
  histories,
  draftHistories,
  patientId,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
}: TreatmentHistoryListProps) {
  const hasDrafts = draftHistories.length > 0
  const hasActiveHistories = histories.length > 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-on-surface">Historial de tratamientos</h2>
      </div>

      {/* Draft histories — shown above the active list */}
      {hasDrafts && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider px-1">
            Borradores sin confirmar
          </p>
          {draftHistories.map((h) => (
            <Link
              key={h.id}
              href={`/patients/${patientId}/history/${h.id}`}
              className="flex items-center gap-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 hover:border-amber-300 hover:shadow-sm transition-all group"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
                    {formatDateRange(h.createdAt, "draft")}
                  </p>
                  {h.clinicName && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-surface-container text-secondary rounded-full uppercase tracking-wide">
                      {h.clinicName}
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-on-surface truncate">
                  {h.firstProcedure ?? "Sin procedimientos registrados"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    Borrador
                  </span>
                  <span className="text-[10px] text-outline">Toca para ver y confirmar</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-amber-400 group-hover:text-amber-600 transition-colors text-[20px] shrink-0">
                chevron_right
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Active histories — paginated */}
      {!hasActiveHistories && !hasDrafts ? (
        <div className="bg-white rounded-xl border border-outline-variant/10 p-10 flex flex-col items-center gap-3 text-center">
          <span className="material-symbols-outlined text-outline text-5xl">medical_information</span>
          <p className="font-bold text-on-surface">No hay historias clínicas registradas</p>
          <p className="text-sm text-secondary">Crea la primera historia para este paciente.</p>
          <Link
            href={`/patients/${patientId}/history/new`}
            className="h-11 px-5 inline-flex items-center gap-2 bg-sidebar-active text-white text-sm font-semibold rounded-lg hover:bg-sidebar-active/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Crear primera historia clínica
          </Link>
        </div>
      ) : !hasActiveHistories && hasDrafts ? (
        <div className="bg-white rounded-xl border border-outline-variant/10 p-6 flex flex-col items-center gap-2 text-center">
          <span className="material-symbols-outlined text-outline text-3xl">pending_actions</span>
          <p className="text-sm text-secondary">No hay historias confirmadas aún.</p>
          <p className="text-xs text-outline">Confirma el borrador para que aparezca aquí.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
          <div className="space-y-3 p-4 sm:p-5">
            {histories.map((h) => (
              <Link
                key={h.id}
                href={`/patients/${patientId}/history/${h.id}`}
                className="flex items-center gap-4 rounded-xl border border-outline-variant/10 px-5 py-4 hover:border-primary/30 hover:shadow-sm transition-all group"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[h.status]} shrink-0 mt-0.5`} />

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                      {formatDateRange(h.createdAt, h.status)}
                    </p>
                    {h.clinicName && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-surface-container-low text-secondary rounded-full uppercase tracking-wide">
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

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            basePath={`/patients/${patientId}`}
            pageParam="historyPage"
            itemLabel="historias"
          />
        </div>
      )}
    </div>
  )
}
