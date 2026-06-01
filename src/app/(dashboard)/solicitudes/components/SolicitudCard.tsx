"use client"

import { useTransition, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { approveDoctor, rejectDoctor } from "@/lib/actions/admin"

interface SolicitudCardProps {
  id: string
  fullName: string
  email: string
  phone: string | null
  licenseNumber: string | null
  specialty: string | null
  createdAt: string
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ").filter(Boolean)
  const letters =
    parts.length >= 2
      ? parts[0][0] + parts[1][0]
      : name.slice(0, 2)
  return letters.toUpperCase()
}

export default function SolicitudCard({
  id,
  fullName,
  email,
  phone,
  licenseNumber,
  specialty,
  createdAt,
}: SolicitudCardProps) {
  const [approving, startApprove] = useTransition()
  const [rejecting, startReject] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: es,
  })

  function handleApprove() {
    setError(null)
    startApprove(async () => {
      const result = await approveDoctor(id)
      if (result.error) setError(result.error)
    })
  }

  function handleReject() {
    if (!showRejectInput) {
      setShowRejectInput(true)
      return
    }
    setError(null)
    startReject(async () => {
      const result = await rejectDoctor(id, rejectReason || undefined)
      if (result.error) setError(result.error)
    })
  }

  const busy = approving || rejecting

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
      <div className="px-5 py-5">
        {/* Top row */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold font-headline shrink-0">
            <Initials name={fullName} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <p className="font-headline font-bold text-on-surface text-base leading-tight truncate">
                Dr. {fullName}
              </p>
              <span className="text-xs text-on-surface-variant shrink-0">{timeAgo}</span>
            </div>

            {specialty && (
              <p className="text-sm text-primary font-medium mt-0.5">{specialty}</p>
            )}

            {/* Details grid */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
              <Detail icon="mail" value={email} />
              {phone && <Detail icon="phone" value={phone} />}
              {licenseNumber && (
                <Detail icon="badge" label="Matrícula" value={licenseNumber} />
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="mt-3 text-xs text-error bg-error/8 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Reject reason input */}
        {showRejectInput && (
          <div className="mt-4">
            <input
              type="text"
              className="w-full text-base border border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-surface bg-surface-container placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Motivo del rechazo (opcional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              disabled={busy}
            />
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-3 justify-end">
          <button
            onClick={() => {
              setShowRejectInput(false)
              setRejectReason("")
            }}
            disabled={busy || !showRejectInput}
            className="text-sm text-on-surface-variant hover:text-on-surface disabled:opacity-0 transition-opacity"
          >
            Cancelar
          </button>

          <button
            onClick={handleReject}
            disabled={busy}
            className="h-11 px-4 rounded-xl border border-error/40 text-error text-sm font-medium hover:bg-error/8 disabled:opacity-50 transition-colors"
          >
            {rejecting ? "Rechazando…" : showRejectInput ? "Confirmar rechazo" : "Rechazar"}
          </button>

          <button
            onClick={handleApprove}
            disabled={busy}
            className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {approving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Aprobando…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                  check_circle
                </span>
                Aprobar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: string
  label?: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-on-surface-variant">
      <span className="material-symbols-outlined text-[16px] shrink-0">{icon}</span>
      <span className="truncate">
        {label ? <span className="font-medium text-on-surface mr-1">{label}:</span> : null}
        {value}
      </span>
    </div>
  )
}
