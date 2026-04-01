"use client"

import { ToothRecord } from "@/components/shared/Odontogram"
import dynamic from "next/dynamic"

const Odontogram = dynamic(() => import("@/components/shared/Odontogram"), { ssr: false })

type EruptionStatus = "erupted" | "semi" | "not_erupted" | null

export type DentalExamData = {
  problem_atm: boolean | null
  problem_crowding: boolean | null
  problem_periodontitis: boolean | null
  problem_gingivitis: boolean | null
  problem_habits: boolean | null
  problem_takes_aspirin: boolean | null
  problem_wisdom_extract: boolean | null
  eruption_status: EruptionStatus
  specifications: string | null
  observations: string | null
  definitive_diagnosis: string | null
  treatment_plan_notes: string | null
} | null

export type DentalExamTabProps = {
  exam: DentalExamData
  toothRecords: ToothRecord[]
  patientId: string
  historyId: string
}

const PROBLEMS: { field: keyof NonNullable<DentalExamData>; label: string }[] = [
  { field: "problem_atm", label: "Problema ATM" },
  { field: "problem_crowding", label: "Apiñamiento" },
  { field: "problem_periodontitis", label: "Periodontitis" },
  { field: "problem_gingivitis", label: "Gingivitis" },
  { field: "problem_habits", label: "Hábitos nocivos" },
  { field: "problem_takes_aspirin", label: "Toma aspirina" },
  { field: "problem_wisdom_extract", label: "Extracción de cordales" },
]

const ERUPTION_LABELS: Record<string, string> = {
  erupted: "Erupcionado",
  semi: "Semi-erupcionado",
  not_erupted: "No erupcionado",
}

export default function DentalExamTab({ exam, toothRecords, patientId, historyId }: DentalExamTabProps) {
  if (!exam) {
    return (
      <div className="py-12 text-center">
        <span className="material-symbols-outlined text-outline text-5xl">search</span>
        <p className="font-bold text-on-surface mt-3">Sin examen clínico registrado</p>
        <p className="text-sm text-secondary mt-1">Completa el formulario de examen clínico.</p>
        <a
          href={`/patients/${patientId}/history/${historyId}/edit`}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-sidebar-active text-white text-sm font-semibold rounded-lg"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Agregar examen
        </a>
      </div>
    )
  }

  const textFields = [
    { label: "Especificaciones", value: exam.specifications },
    { label: "Observaciones", value: exam.observations },
    { label: "Diagnóstico definitivo", value: exam.definitive_diagnosis },
    { label: "Notas del plan de tratamiento", value: exam.treatment_plan_notes },
  ]

  return (
    <div className="space-y-6">
      {/* Problem list */}
      <div className="bg-surface-container-low rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-on-surface">Lista de problemas</h3>
          <a
            href={`/patients/${patientId}/history/${historyId}/edit`}
            className="text-xs font-semibold text-sidebar-active hover:underline"
          >
            Editar
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PROBLEMS.map(({ field, label }) => {
            const val = exam[field] as boolean | null
            const isYes = val === true
            return (
              <div key={field} className="flex items-center justify-between py-2 border-b border-outline/10 last:border-0">
                <span className="text-sm text-on-surface">{label}</span>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                    isYes ? "bg-red-50 text-red-600" : "bg-surface-container text-outline"
                  }`}
                >
                  {isYes ? "SÍ" : "NO"}
                </span>
              </div>
            )
          })}

          {/* Eruption status */}
          {exam.eruption_status && (
            <div className="flex items-center justify-between py-2 border-b border-outline/10 last:border-0 sm:col-span-2">
              <span className="text-sm text-on-surface">Estado de erupción</span>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 uppercase tracking-wide">
                {ERUPTION_LABELS[exam.eruption_status] ?? exam.eruption_status}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Odontogram */}
      <div className="bg-surface-container-low rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-on-surface">Odontograma</h3>
          <a
            href={`/patients/${patientId}/history/${historyId}/edit`}
            className="text-xs font-semibold text-sidebar-active hover:underline"
          >
            Editar
          </a>
        </div>
        <div className="overflow-x-auto">
          <Odontogram toothRecords={toothRecords} readOnly />
        </div>
      </div>

      {/* Text fields */}
      {textFields.some((f) => f.value) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {textFields.map(({ label, value }) =>
            value ? (
              <div key={label} className="bg-surface-container-low rounded-xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-2">{label}</p>
                <p className="text-sm text-on-surface leading-relaxed">{value}</p>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  )
}
