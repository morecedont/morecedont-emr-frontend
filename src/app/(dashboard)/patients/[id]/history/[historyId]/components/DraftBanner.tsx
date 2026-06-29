"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { confirmMedicalHistory, discardDraftHistory } from "@/lib/actions/patients"

interface DraftBannerProps {
  historyId: string
  patientId: string
}

export default function DraftBanner({ historyId, patientId }: DraftBannerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)

  const handleConfirm = () => {
    setError(null)
    startTransition(async () => {
      const result = await confirmMedicalHistory(historyId, patientId)
      if (result.error) {
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  const handleDiscard = () => {
    setError(null)
    startTransition(async () => {
      const result = await discardDraftHistory(historyId, patientId)
      if (result.error) {
        setError(result.error)
        setShowDiscardConfirm(false)
        return
      }
      router.push(`/patients/${patientId}`)
    })
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-3">
      <div className="max-w-7xl mx-auto">
        {!showDiscardConfirm ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <span className="material-symbols-outlined text-amber-500 text-[22px] shrink-0 mt-0.5">
                warning
              </span>
              <div>
                <p className="text-sm font-bold text-amber-800">Historia en borrador</p>
                <p className="text-sm text-amber-700 mt-0.5">
                  Los datos se guardan por sección, pero esta historia no aparece en el
                  historial del paciente hasta que la confirmes.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 sm:flex-col sm:items-stretch lg:flex-row">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(true)}
                disabled={isPending}
                className="h-11 px-4 flex items-center justify-center gap-2 text-sm font-semibold text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Descartar</span>
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isPending}
                className="h-11 px-4 flex items-center justify-center gap-2 text-sm font-semibold bg-primary text-white rounded-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>{isPending ? "Confirmando…" : "Confirmar historia"}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-error-container/30 border border-error/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <span className="material-symbols-outlined text-error text-[22px] shrink-0 mt-0.5">
                delete_forever
              </span>
              <div>
                <p className="text-sm font-bold text-on-surface">¿Eliminar este borrador?</p>
                <p className="text-sm text-on-surface-variant mt-0.5">
                  Se eliminarán todos los datos ingresados hasta ahora. Esta acción no se
                  puede deshacer.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 sm:flex-col sm:items-stretch lg:flex-row">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                disabled={isPending}
                className="h-11 px-4 flex items-center justify-center gap-2 text-sm font-semibold text-secondary border border-outline-variant/30 rounded-lg hover:bg-surface-container transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDiscard}
                disabled={isPending}
                className="h-11 px-4 flex items-center justify-center gap-2 text-sm font-semibold bg-error text-white rounded-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>{isPending ? "Eliminando…" : "Sí, eliminar borrador"}</span>
              </button>
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-error bg-error-container/20 rounded-lg px-3 py-2 mt-2">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
