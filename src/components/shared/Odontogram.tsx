"use client"

import { useState } from "react"

export type ToothRecord = {
  toothNumber: number
  vestibularStatus: string
  lingualStatus: string
}

type ToothStatus = "healthy" | "decayed" | "extracted" | "restored" | "crowned" | "implant" | "missing" | "endodontic"

const STATUS_OPTIONS: { value: ToothStatus; label: string; dot: string; bg: string }[] = [
  { value: "healthy",    label: "Sano",       dot: "bg-gray-200",   bg: "bg-white border-gray-300" },
  { value: "decayed",    label: "Caries",     dot: "bg-orange-400", bg: "bg-orange-100 border-orange-400" },
  { value: "extracted",  label: "Extraído",   dot: "bg-red-500",    bg: "bg-red-100 border-red-400" },
  { value: "restored",   label: "Restaurado", dot: "bg-blue-400",   bg: "bg-blue-100 border-blue-400" },
  { value: "crowned",    label: "Corona",     dot: "bg-purple-400", bg: "bg-purple-100 border-purple-400" },
  { value: "implant",    label: "Implante",   dot: "bg-teal-400",   bg: "bg-teal-100 border-teal-400" },
  { value: "missing",    label: "Ausente",    dot: "bg-gray-400",   bg: "bg-gray-200 border-gray-400" },
  { value: "endodontic", label: "Endodoncia", dot: "bg-yellow-400", bg: "bg-yellow-100 border-yellow-400" },
]

const UPPER_LEFT  = [18, 17, 16, 15, 14, 13, 12, 11]
const UPPER_RIGHT = [21, 22, 23, 24, 25, 26, 27, 28]
const LOWER_LEFT  = [48, 47, 46, 45, 44, 43, 42, 41]
const LOWER_RIGHT = [31, 32, 33, 34, 35, 36, 37, 38]

function getStatusBg(status: string): string {
  return STATUS_OPTIONS.find((o) => o.value === status)?.bg ?? "bg-white border-gray-300"
}

interface OdontogramProps {
  toothRecords: ToothRecord[]
  readOnly?: boolean
  onChange?: (records: ToothRecord[]) => void
}

export default function Odontogram({ toothRecords, readOnly = false, onChange }: OdontogramProps) {
  const toothMap: Record<number, string> = {}
  for (const r of toothRecords) toothMap[r.toothNumber] = r.vestibularStatus
  const [localMap, setLocalMap] = useState<Record<number, string>>(toothMap)
  const [openTooth, setOpenTooth] = useState<number | null>(null)

  const activeMap = readOnly ? toothMap : localMap

  function setStatus(tooth: number, status: string) {
    const next = { ...localMap, [tooth]: status }
    setLocalMap(next)
    setOpenTooth(null)
    if (onChange) {
      onChange(
        Object.entries(next)
          .filter(([, s]) => s !== "healthy")
          .map(([t, s]) => ({ toothNumber: parseInt(t), vestibularStatus: s, lingualStatus: s }))
      )
    }
  }

  function ToothCell({ number }: { number: number }) {
    const status = (activeMap[number] ?? "healthy") as ToothStatus
    const isOpen = !readOnly && openTooth === number
    const bg = getStatusBg(status)

    return (
      <div className="relative">
        <button
          type="button"
          disabled={readOnly}
          onClick={() => setOpenTooth(isOpen ? null : number)}
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded border-2 flex items-center justify-center text-[9px] font-bold transition-all ${bg} ${!readOnly ? "hover:scale-105 cursor-pointer" : "cursor-default"}`}
          title={`Diente ${number}`}
        >
          {number}
        </button>
        {isOpen && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 z-30 bg-white rounded-xl shadow-2xl border border-outline-variant/20 p-2 w-36">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(number, opt.value)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-left transition-colors ${
                  status === opt.value
                    ? "bg-primary/10 text-primary font-semibold"
                    : "hover:bg-surface-container text-on-surface"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${opt.dot} shrink-0`} />
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {STATUS_OPTIONS.map((opt) => (
          <span key={opt.value} className="inline-flex items-center gap-1.5 text-xs text-secondary">
            <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
            {opt.label}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-max space-y-2 p-4 bg-surface-container-low rounded-xl">
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5 sm:gap-1">{UPPER_LEFT.map((n) => <ToothCell key={n} number={n} />)}</div>
            <div className="w-px h-7 bg-outline-variant/30 mx-1" />
            <div className="flex gap-0.5 sm:gap-1">{UPPER_RIGHT.map((n) => <ToothCell key={n} number={n} />)}</div>
          </div>
          <div className="h-px bg-outline-variant/30 my-1" />
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5 sm:gap-1">{LOWER_LEFT.map((n) => <ToothCell key={n} number={n} />)}</div>
            <div className="w-px h-7 bg-outline-variant/30 mx-1" />
            <div className="flex gap-0.5 sm:gap-1">{LOWER_RIGHT.map((n) => <ToothCell key={n} number={n} />)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
