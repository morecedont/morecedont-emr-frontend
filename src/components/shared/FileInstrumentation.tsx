"use client"

import { FILE_SIZES, FILE_SIZE_OPTIONS } from "@/lib/constants/endodontics"

interface FileInstrumentationProps {
  instrumentationType: "manual" | "rotary_reciprocating" | null
  fileInitial: string | null
  fileFinal: string | null
  fileLength: number | null
  fileNotes: string | null
  onInstrumentationChange: (value: "manual" | "rotary_reciprocating") => void
  onFileInitialChange: (value: string) => void
  onFileFinalChange: (value: string) => void
  onFileLengthChange: (value: number | null) => void
  onFileNotesChange: (value: string) => void
  readOnly?: boolean
}

const inputCls =
  "w-full text-base bg-white border border-outline-variant/40 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline/50"
const selectCls =
  "w-full text-base bg-white border border-outline-variant/40 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
const labelCls = "block text-sm font-semibold text-on-surface-variant mb-1.5"

function getInitialIdx(fileInitial: string | null) {
  if (!fileInitial) return -1
  return FILE_SIZES.indexOf(fileInitial)
}

function getSequence(fileInitial: string | null, fileFinal: string | null): string[] {
  const iIdx = getInitialIdx(fileInitial)
  const fIdx = fileFinal ? FILE_SIZES.indexOf(fileFinal) : -1
  if (iIdx < 0 || fIdx < 0 || fIdx < iIdx) return []
  return FILE_SIZES.slice(iIdx, fIdx + 1)
}

export default function FileInstrumentation({
  instrumentationType,
  fileInitial,
  fileFinal,
  fileLength,
  fileNotes,
  onInstrumentationChange,
  onFileInitialChange,
  onFileFinalChange,
  onFileLengthChange,
  onFileNotesChange,
  readOnly = false,
}: FileInstrumentationProps) {
  const initialIdx = getInitialIdx(fileInitial)
  const finalIdx = fileFinal ? FILE_SIZES.indexOf(fileFinal) : -1
  const hasWarning = initialIdx >= 0 && finalIdx >= 0 && finalIdx < initialIdx
  const sequence = getSequence(fileInitial, fileFinal)

  if (readOnly) {
    return (
      <div className="col-span-1 sm:col-span-2 bg-surface-container-low rounded-xl p-4 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">Preparación biomecánica</p>

        <div className="flex flex-wrap gap-2">
          {instrumentationType === "manual" && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700">Manual</span>
          )}
          {instrumentationType === "rotary_reciprocating" && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700">Rotatoria / Reciprocante</span>
          )}
          {fileInitial && fileFinal && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-surface-container text-on-surface">
              #{fileInitial} → #{fileFinal}
            </span>
          )}
          {fileLength && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-surface-container text-on-surface">
              {fileLength} mm
            </span>
          )}
        </div>

        {sequence.length > 0 && (
          <div className="overflow-x-auto">
            <div className="flex items-center gap-1.5 min-w-max py-1">
              {sequence.map((size, i) => (
                <span key={size} className="flex items-center gap-1.5">
                  <span className="bg-primary/10 text-sidebar-active text-xs font-semibold rounded-full px-2.5 py-1">
                    #{size}
                  </span>
                  {i < sequence.length - 1 && (
                    <span className="text-outline text-xs">→</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {fileNotes && (
          <p className="text-sm text-secondary leading-relaxed">{fileNotes}</p>
        )}
      </div>
    )
  }

  return (
    <div className="col-span-1 md:col-span-2 bg-surface-container-low rounded-xl p-5 space-y-5">
      <h3 className="font-bold text-on-surface">Preparación biomecánica</h3>

      {/* Instrumentation type */}
      <div>
        <p className={labelCls}>Instrumentación</p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="instrumentation_type"
              value="manual"
              checked={instrumentationType === "manual"}
              onChange={() => onInstrumentationChange("manual")}
              className="text-sidebar-active focus:ring-sidebar-active/20"
            />
            <span className="text-sm text-on-surface">Manual</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="instrumentation_type"
              value="rotary_reciprocating"
              checked={instrumentationType === "rotary_reciprocating"}
              onChange={() => onInstrumentationChange("rotary_reciprocating")}
              className="text-sidebar-active focus:ring-sidebar-active/20"
            />
            <span className="text-sm text-on-surface">Rotatoria / Reciprocante</span>
          </label>
        </div>
      </div>

      {/* Lima inicial / Lima final */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className={labelCls}>Lima inicial</p>
          <select
            value={fileInitial ?? ""}
            onChange={(e) => onFileInitialChange(e.target.value)}
            className={selectCls}
          >
            <option value="">Seleccionar</option>
            {FILE_SIZE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <p className={labelCls}>Lima final</p>
          <select
            value={fileFinal ?? ""}
            onChange={(e) => onFileFinalChange(e.target.value)}
            className={selectCls}
          >
            <option value="">Seleccionar</option>
            {FILE_SIZE_OPTIONS
              .filter((o) => initialIdx < 0 || FILE_SIZES.indexOf(o.value) >= initialIdx)
              .map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))
            }
          </select>
          {hasWarning && (
            <p className="text-red-500 text-xs mt-1">La lima final debe ser mayor o igual a la inicial</p>
          )}
        </div>
      </div>

      {/* Visual sequence */}
      {sequence.length > 0 && (
        <div>
          <p className={labelCls}>Secuencia</p>
          <div className="overflow-x-auto rounded-lg bg-white border border-outline-variant/20 px-4 py-3">
            <div className="flex items-center gap-1.5 min-w-max">
              {sequence.map((size, i) => (
                <span key={size} className="flex items-center gap-1.5">
                  <span className="bg-primary/10 text-sidebar-active text-xs font-semibold rounded-full px-2.5 py-1">
                    #{size}
                  </span>
                  {i < sequence.length - 1 && (
                    <span className="text-outline text-xs">→</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Work length */}
      <div>
        <p className={labelCls}>Longitud de trabajo</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={fileLength ?? ""}
            onChange={(e) => onFileLengthChange(e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="Ej. 16.5"
            step={0.5}
            min={5}
            max={35}
            className={`${inputCls} w-full sm:w-32`}
          />
          <span className="text-sm text-secondary shrink-0">mm</span>
        </div>
      </div>

      {/* Notes */}
      <div>
        <p className={labelCls}>Notas de instrumentación</p>
        <textarea
          value={fileNotes ?? ""}
          onChange={(e) => onFileNotesChange(e.target.value)}
          placeholder="Ej. Preparación hasta lima 40 a 16mm con técnica crown-down"
          rows={3}
          className={`${inputCls} min-h-[80px] resize-none`}
        />
      </div>
    </div>
  )
}
