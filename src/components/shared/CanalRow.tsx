"use client"

import { CANAL_CODES, type CanalEntry } from "@/lib/constants/endodontics"

interface CanalRowProps {
  canal: CanalEntry
  index: number
  onChange: (index: number, field: keyof CanalEntry, value: string | number | null) => void
  onRemove: (index: number) => void
  readOnly?: boolean
}

const inputCls =
  "w-full text-base bg-white border border-outline-variant/40 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline/50"
const selectCls =
  "w-full text-base bg-white border border-outline-variant/40 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
const labelCls = "block text-xs font-semibold text-secondary mb-1"

export default function CanalRow({ canal, index, onChange, onRemove, readOnly }: CanalRowProps) {
  const isCustom = canal.canal_code === "custom"

  function handleCodeChange(code: string) {
    const found = CANAL_CODES.find((c) => c.code === code)
    onChange(index, "canal_code", code)
    onChange(index, "canal_label", found?.label ?? "")
  }

  function handleCustomLabel(label: string) {
    onChange(index, "canal_label", label)
    onChange(index, "canal_code", "custom")
  }

  return (
    <div className="bg-white border border-outline-variant/20 rounded-xl p-4">
      {/* Mobile: stacked layout */}
      <div className="flex flex-col gap-3 md:hidden">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className={labelCls}>Canal</p>
            <select
              value={canal.canal_code || ""}
              onChange={(e) => handleCodeChange(e.target.value)}
              disabled={readOnly}
              className={selectCls}
            >
              <option value="">Seleccionar</option>
              {CANAL_CODES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>
          {!readOnly && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="mt-6 w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
        {isCustom && (
          <div>
            <p className={labelCls}>Nombre del conducto</p>
            <input
              type="text"
              value={canal.canal_label.replace(/^Otro \(escribir\)$/, "")}
              onChange={(e) => handleCustomLabel(e.target.value)}
              placeholder="Ej. Accesorio"
              disabled={readOnly}
              className={inputCls}
            />
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className={labelCls}>Referencia</p>
            <input
              type="text"
              value={canal.reference}
              onChange={(e) => onChange(index, "reference", e.target.value)}
              placeholder="Ej. Cúspide mesial"
              disabled={readOnly}
              className={inputCls}
            />
          </div>
          <div>
            <p className={labelCls}>Longitud (mm)</p>
            <input
              type="number"
              value={canal.length_mm ?? ""}
              onChange={(e) => onChange(index, "length_mm", e.target.value ? parseFloat(e.target.value) : null)}
              placeholder="Ej. 16.5"
              step={0.5}
              min={0}
              max={35}
              disabled={readOnly}
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <p className={labelCls}>Notas</p>
          <input
            type="text"
            value={canal.notes}
            onChange={(e) => onChange(index, "notes", e.target.value)}
            placeholder="Observaciones del conducto"
            disabled={readOnly}
            className={inputCls}
          />
        </div>
      </div>

      {/* Desktop: horizontal layout */}
      <div className="hidden md:flex items-end gap-3">
        <div className="flex-shrink-0 w-48">
          <p className={labelCls}>Canal</p>
          <select
            value={canal.canal_code || ""}
            onChange={(e) => handleCodeChange(e.target.value)}
            disabled={readOnly}
            className={selectCls}
          >
            <option value="">Seleccionar</option>
            {CANAL_CODES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </div>
        {isCustom && (
          <div className="w-32">
            <p className={labelCls}>Nombre</p>
            <input
              type="text"
              value={canal.canal_label.replace(/^Otro \(escribir\)$/, "")}
              onChange={(e) => handleCustomLabel(e.target.value)}
              placeholder="Accesorio"
              disabled={readOnly}
              className={inputCls}
            />
          </div>
        )}
        <div className="flex-1">
          <p className={labelCls}>Referencia</p>
          <input
            type="text"
            value={canal.reference}
            onChange={(e) => onChange(index, "reference", e.target.value)}
            placeholder="Ej. Cúspide mesial"
            disabled={readOnly}
            className={inputCls}
          />
        </div>
        <div className="w-28">
          <p className={labelCls}>Longitud (mm)</p>
          <input
            type="number"
            value={canal.length_mm ?? ""}
            onChange={(e) => onChange(index, "length_mm", e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="16.5"
            step={0.5}
            min={0}
            max={35}
            disabled={readOnly}
            className={inputCls}
          />
        </div>
        <div className="flex-1">
          <p className={labelCls}>Notas</p>
          <input
            type="text"
            value={canal.notes}
            onChange={(e) => onChange(index, "notes", e.target.value)}
            placeholder="Observaciones del conducto"
            disabled={readOnly}
            className={inputCls}
          />
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="mb-0.5 w-8 h-9 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>
    </div>
  )
}
