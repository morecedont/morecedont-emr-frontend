"use client"

import { useState, useTransition } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import ClinicSelector, { type SelectedClinic } from "@/components/shared/ClinicSelector"
import { updateLatestHistoryClinic } from "@/lib/actions/patients"

export type ClinicalInfo = {
  lastVisit: string | null
  preferredClinic: string | null
  preferredClinicId: string | null
  currency: string | null
}

const lbl = "text-xs text-gray-400 uppercase tracking-wide mb-0.5"
const val = "text-sm text-[#1E1E2F] font-medium"

export default function ClinicalInfoCard({
  info,
  patientId,
  doctorId,
  hasHistory,
}: {
  info: ClinicalInfo
  patientId: string
  doctorId: string
  hasHistory: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [selectedClinic, setSelectedClinic] = useState<SelectedClinic | null>(
    info.preferredClinicId
      ? { id: info.preferredClinicId, name: info.preferredClinic ?? "" }
      : null
  )
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const lastVisit = info.lastVisit
    ? format(new Date(info.lastVisit), "dd/MM/yyyy", { locale: es })
    : "—"

  function handleCancel() {
    setEditing(false)
    setError(null)
    setSelectedClinic(
      info.preferredClinicId
        ? { id: info.preferredClinicId, name: info.preferredClinic ?? "" }
        : null
    )
  }

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await updateLatestHistoryClinic(patientId, selectedClinic?.id ?? null)
      if (result.error) {
        setError(result.error)
        return
      }
      setEditing(false)
    })
  }

  return (
    <div className="bg-white rounded-xl border border-outline-variant/10 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-on-surface">Información clínica</h3>
        {hasHistory && !editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-secondary hover:text-sidebar-active transition-colors"
            aria-label="Editar clínica preferida"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <p className={lbl}>Última visita</p>
          <p className={val}>{lastVisit}</p>
        </div>

        <div>
          <p className={lbl}>Clínica preferida</p>
          {editing ? (
            <div className="mt-1 space-y-2">
              <ClinicSelector
                value={selectedClinic}
                doctorId={doctorId}
                onChange={setSelectedClinic}
                placeholder="Buscar o crear clínica..."
              />
              {error && <p className="text-xs text-error">{error}</p>}
              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isPending}
                  className="h-9 px-3 text-xs font-semibold text-secondary hover:bg-surface-container rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isPending}
                  className="h-9 px-3 text-xs font-bold text-white bg-sidebar-active rounded-lg hover:bg-sidebar-active/90 transition-colors disabled:opacity-50"
                >
                  {isPending ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          ) : (
            <p className={val}>{info.preferredClinic ?? "—"}</p>
          )}
        </div>

        <div>
          <p className={lbl}>Moneda preferida</p>
          <p className={val}>{info.currency ?? "USD"}</p>
        </div>
      </div>
    </div>
  )
}
