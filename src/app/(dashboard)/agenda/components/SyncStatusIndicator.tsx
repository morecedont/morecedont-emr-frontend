"use client"

import type { SyncIndicatorStatus } from "@/types/appointments"

interface SyncStatusIndicatorProps {
  status: SyncIndicatorStatus
}

export default function SyncStatusIndicator({
  status,
}: SyncStatusIndicatorProps) {
  if (status === "synced") {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-[10px] font-bold text-green-700 uppercase tracking-tighter">
          Synced
        </span>
        <span className="material-symbols-outlined text-green-700 text-xs">
          sync
        </span>
      </div>
    )
  }

  if (status === "pending") {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full">
        <span className="material-symbols-outlined text-amber-accent text-xs animate-spin">
          progress_activity
        </span>
        <span className="text-[10px] font-bold text-amber-accent uppercase tracking-tighter">
          Syncing
        </span>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-error-container rounded-full">
        <span className="w-2 h-2 bg-error rounded-full" />
        <span className="text-[10px] font-bold text-error uppercase tracking-tighter">
          Error
        </span>
      </div>
    )
  }

  // not_connected — botón placeholder (la integración real es fase 2).
  return (
    <button
      type="button"
      onClick={() => {
        // Fase 2: redirigir a la pantalla de OAuth de Google.
        console.log("[agenda] Google Calendar connect — pendiente (fase 2)")
      }}
      className="flex items-center gap-2 h-11 px-3 bg-surface-container hover:bg-surface-container-high rounded-full transition-colors"
    >
      <span className="material-symbols-outlined text-secondary text-sm">
        link
      </span>
      <span className="text-[10px] font-bold text-secondary uppercase tracking-tighter">
        Connect Google
      </span>
    </button>
  )
}
