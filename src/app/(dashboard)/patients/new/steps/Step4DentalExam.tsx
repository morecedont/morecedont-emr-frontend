"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { saveDentalExam, type DentalExamData, type ToothRecord } from "@/lib/actions/patients"

const inputCls =
  "w-full text-base bg-white border border-outline-variant/40 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline/50"
const labelCls = "block text-sm font-semibold text-on-surface-variant mb-1.5"

type ToothStatus = "healthy" | "decayed" | "extracted" | "restored" | "crowned" | "implant" | "missing" | "endodontic"

const TOOTH_STATUS_OPTIONS: { value: ToothStatus; label: string; dot: string }[] = [
  { value: "healthy", label: "Sano", dot: "bg-gray-200" },
  { value: "decayed", label: "Caries", dot: "bg-orange-400" },
  { value: "extracted", label: "Extraído", dot: "bg-red-500" },
  { value: "restored", label: "Restaurado", dot: "bg-blue-400" },
  { value: "crowned", label: "Corona", dot: "bg-purple-400" },
  { value: "implant", label: "Implante", dot: "bg-teal-400" },
  { value: "missing", label: "Ausente", dot: "bg-gray-400" },
  { value: "endodontic", label: "Endodoncia", dot: "bg-yellow-400" },
]

const TOOTH_BG: Record<ToothStatus, string> = {
  healthy: "bg-white border-gray-300",
  decayed: "bg-orange-100 border-orange-400",
  extracted: "bg-red-100 border-red-400",
  restored: "bg-blue-100 border-blue-400",
  crowned: "bg-purple-100 border-purple-400",
  implant: "bg-teal-100 border-teal-400",
  missing: "bg-gray-200 border-gray-400",
  endodontic: "bg-yellow-100 border-yellow-400",
}

const UPPER_LEFT = [18, 17, 16, 15, 14, 13, 12, 11]
const UPPER_RIGHT = [21, 22, 23, 24, 25, 26, 27, 28]
const LOWER_LEFT = [48, 47, 46, 45, 44, 43, 42, 41]
const LOWER_RIGHT = [31, 32, 33, 34, 35, 36, 37, 38]

function getPopoverAlignClass(number: number) {
  const upperLeftIndex = UPPER_LEFT.indexOf(number)
  if (upperLeftIndex >= 0 && upperLeftIndex <= 2) return "left-0"

  const lowerLeftIndex = LOWER_LEFT.indexOf(number)
  if (lowerLeftIndex >= 0 && lowerLeftIndex <= 2) return "left-0"

  const upperRightIndex = UPPER_RIGHT.indexOf(number)
  if (upperRightIndex >= UPPER_RIGHT.length - 3) return "right-0"

  const lowerRightIndex = LOWER_RIGHT.indexOf(number)
  if (lowerRightIndex >= LOWER_RIGHT.length - 3) return "right-0"

  return "left-1/2 -translate-x-1/2"
}

const PROBLEMS = [
  { key: "problem_atm" as const, label: "ATM" },
  { key: "problem_crowding" as const, label: "Apiñamiento" },
  { key: "problem_periodontitis" as const, label: "Periodontitis" },
  { key: "problem_gingivitis" as const, label: "Gingivitis" },
  { key: "problem_habits" as const, label: "Hábitos" },
  { key: "problem_takes_aspirin" as const, label: "Toma Aspirina" },
  { key: "problem_wisdom_extract" as const, label: "Cordales para extraer" },
]

export type ExamFormData = Omit<DentalExamData, "eruption_status"> & {
  eruption_status: "erupted" | "semi" | "not_erupted" | ""
}

const EMPTY_EXAM: ExamFormData = {
  problem_atm: false, problem_crowding: false, problem_periodontitis: false,
  problem_gingivitis: false, problem_habits: false, problem_takes_aspirin: false,
  problem_wisdom_extract: false, eruption_status: "", specifications: "",
  observations: "", definitive_diagnosis: "", treatment_plan_notes: "",
}

interface Step4Props {
  medicalHistoryId: string
  patientId: string
  initialData?: ExamFormData
  initialToothRecords?: ToothRecord[]
  onSaveAndExit?: () => void
  onNext: () => void
  onBack: () => void
}

export default function Step4DentalExam({ medicalHistoryId, patientId, initialData, initialToothRecords, onSaveAndExit, onNext, onBack }: Step4Props) {
  const router = useRouter()
  const [examData, setExamData] = useState<ExamFormData>(() => initialData ?? EMPTY_EXAM)
  const [toothMap, setToothMap] = useState<Record<number, ToothStatus>>(() => {
    if (!initialToothRecords) return {}
    const map: Record<number, ToothStatus> = {}
    for (const r of initialToothRecords) {
      map[r.toothNumber] = r.vestibularStatus as ToothStatus
    }
    return map
  })
  const [openTooth, setOpenTooth] = useState<number | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSaving, startSaving] = useTransition()

  function toggleProblem(key: keyof ExamFormData) {
    setExamData((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))
  }

  function setStatus(tooth: number, status: ToothStatus) {
    setToothMap((prev) => ({ ...prev, [tooth]: status }))
    setOpenTooth(null)
  }

  function buildToothRecords(): ToothRecord[] {
    return Object.entries(toothMap)
      .filter(([, status]) => status !== "healthy")
      .map(([tooth, status]) => ({
        toothNumber: parseInt(tooth),
        vestibularStatus: status,
        lingualStatus: status,
      }))
  }

  async function doSave() {
    return saveDentalExam(
      medicalHistoryId,
      { ...examData, eruption_status: examData.eruption_status || null },
      buildToothRecords()
    )
  }

  function handleNext() {
    setServerError(null)
    startSaving(async () => {
      const result = await doSave()
      if (result.error) { setServerError(result.error); return }
      onNext()
    })
  }

  function handleSaveAndExit() {
    setServerError(null)
    startSaving(async () => {
      const result = await doSave()
      if (result.error) { setServerError(result.error); return }
      if (onSaveAndExit) {
        onSaveAndExit()
      } else {
        router.push(`/patients/${patientId}`)
      }
    })
  }

  function ToothCell({ number }: { number: number }) {
    const status = toothMap[number] ?? "healthy"
    const isOpen = openTooth === number
    const opensUpward = number >= 31
    const popoverPositionClass = opensUpward
      ? "bottom-10 sm:bottom-11"
      : "top-10 sm:top-11"
    const popoverAlignClass = getPopoverAlignClass(number)

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenTooth(isOpen ? null : number)}
          className={`h-8 w-8 rounded border-2 text-[9px] font-bold transition-all hover:scale-105 sm:h-9 sm:w-9 sm:text-[10px] ${TOOTH_BG[status]} flex items-center justify-center`}
          title={`Diente ${number}`}
        >
          {number}
        </button>
        {isOpen && (
          <div
            className={`absolute ${popoverPositionClass} ${popoverAlignClass} z-20 w-32 rounded-xl border border-outline-variant/20 bg-white p-1.5 shadow-2xl`}
          >
            {TOOTH_STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(number, opt.value)}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[11px] leading-4 transition-colors ${
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
    <div className="bg-white rounded-xl shadow-sm border border-outline-variant/10">
      <div className="p-6 sm:p-8 border-b border-surface-container">
        <h2 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
          Examen clínico y odontograma
        </h2>
        <p className="text-secondary mt-1 text-sm">
          Registre los problemas detectados y el estado de cada pieza dental.
        </p>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* Section A — Problem list */}
        <div>
          <h3 className="font-bold text-on-surface mb-4">Lista de problemas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {PROBLEMS.map((p) => (
              <label key={p.key} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-surface-container-low transition-colors">
                <button
                  type="button"
                  role="switch"
                  aria-checked={examData[p.key] as boolean}
                  onClick={() => toggleProblem(p.key)}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                    examData[p.key] ? "bg-sidebar-active" : "bg-surface-container-highest"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                      examData[p.key] ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-sm font-medium text-on-surface">{p.label}</span>
              </label>
            ))}
          </div>

          {/* Eruption status */}
          <div className="mt-5">
            <p className="text-sm font-semibold text-on-surface-variant mb-2">Estado de erupción</p>
            <div className="flex flex-wrap gap-3">
              {[
                { value: "erupted", label: "Erupcionado" },
                { value: "semi", label: "Semi" },
                { value: "not_erupted", label: "No erupcionado" },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="eruption_status"
                    value={opt.value}
                    checked={examData.eruption_status === opt.value}
                    onChange={() => setExamData((prev) => ({ ...prev, eruption_status: opt.value as never }))}
                    className="text-sidebar-active focus:ring-sidebar-active/20"
                  />
                  <span className="text-sm text-on-surface">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Section B — Odontogram */}
        <div>
          <h3 className="font-bold text-on-surface mb-2">Odontograma</h3>
          <p className="text-xs text-secondary mb-4">Haz clic en un diente para cambiar su estado.</p>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mb-5">
            {TOOTH_STATUS_OPTIONS.map((opt) => (
              <span key={opt.value} className="inline-flex items-center gap-1.5 text-xs text-secondary">
                <span className={`w-2.5 h-2.5 rounded-full ${opt.dot}`} />
                {opt.label}
              </span>
            ))}
          </div>

          <div className="pb-2">
            <div className="space-y-2 rounded-xl bg-surface-container-low p-3 sm:p-4">
              {/* Upper jaw */}
              <div className="flex items-center justify-between gap-1 sm:gap-1.5">
                <div className="flex gap-1 sm:gap-1.5">{UPPER_LEFT.map((n) => <ToothCell key={n} number={n} />)}</div>
                <div className="w-px h-8 bg-outline-variant/30 mx-1" />
                <div className="flex gap-1 sm:gap-1.5">{UPPER_RIGHT.map((n) => <ToothCell key={n} number={n} />)}</div>
              </div>
              {/* Divider */}
              <div className="h-px bg-outline-variant/30 my-2" />
              {/* Lower jaw */}
              <div className="flex items-center justify-between gap-1 sm:gap-1.5">
                <div className="flex gap-1 sm:gap-1.5">{LOWER_LEFT.map((n) => <ToothCell key={n} number={n} />)}</div>
                <div className="w-px h-8 bg-outline-variant/30 mx-1" />
                <div className="flex gap-1 sm:gap-1.5">{LOWER_RIGHT.map((n) => <ToothCell key={n} number={n} />)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Text fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>Especificaciones</label>
            <textarea
              value={examData.specifications}
              onChange={(e) => setExamData((p) => ({ ...p, specifications: e.target.value }))}
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>
          <div>
            <label className={labelCls}>Observaciones</label>
            <textarea
              value={examData.observations}
              onChange={(e) => setExamData((p) => ({ ...p, observations: e.target.value }))}
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>
          <div>
            <label className={labelCls}>Diagnóstico definitivo</label>
            <textarea
              value={examData.definitive_diagnosis}
              onChange={(e) => setExamData((p) => ({ ...p, definitive_diagnosis: e.target.value }))}
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>
          <div>
            <label className={labelCls}>Plan de tratamiento (notas)</label>
            <textarea
              value={examData.treatment_plan_notes}
              onChange={(e) => setExamData((p) => ({ ...p, treatment_plan_notes: e.target.value }))}
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>

        {serverError && (
          <p className="text-sm text-error bg-error-container/20 rounded-lg px-4 py-3">{serverError}</p>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 sm:px-8 py-5 border-t border-surface-container flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="h-11 px-6 flex items-center justify-center gap-2 text-secondary font-semibold hover:bg-surface-container rounded-lg transition-all"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Atrás
        </button>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleSaveAndExit}
            disabled={isSaving}
            className="h-11 px-6 flex items-center justify-center gap-2 border border-outline-variant/30 text-secondary font-semibold rounded-lg hover:bg-surface-container transition-all disabled:opacity-60"
          >
            Guardar y salir
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={isSaving}
            className="h-11 px-8 flex items-center justify-center gap-2 bg-sidebar-active text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 hover:bg-sidebar-active/90 transition-all disabled:opacity-60"
          >
            {isSaving ? "Guardando..." : "Guardar y continuar"}
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  )
}
