"use client"

import { useState, useTransition } from "react"
import { saveMedicalBackground, type MedicalBackgroundData } from "@/lib/actions/patients"

type BooleanKeys = {
  [K in keyof MedicalBackgroundData]: MedicalBackgroundData[K] extends boolean ? K : never
}[keyof MedicalBackgroundData]

const SYSTEM_CARDS = [
  {
    key: "cardiovascular",
    label: "Cardiovascular",
    icon: "favorite",
    iconBg: "bg-error-container",
    iconColor: "text-error",
    fields: [
      { key: "cardio_heart_problems" as BooleanKeys, label: "Problemas cardíacos" },
      { key: "cardio_rheumatic_fever" as BooleanKeys, label: "Fiebre reumática" },
      { key: "cardio_mitral_valve_prolapse" as BooleanKeys, label: "Prolapso válvula mitral" },
      { key: "cardio_easy_fatigue" as BooleanKeys, label: "Fatiga fácil" },
      { key: "cardio_high_blood_pressure" as BooleanKeys, label: "Presión arterial alta" },
      { key: "cardio_antibiotics_before" as BooleanKeys, label: "Antibióticos antes del tratamiento" },
    ],
  },
  {
    key: "respiratorio",
    label: "Respiratorio",
    icon: "air",
    iconBg: "bg-secondary-container",
    iconColor: "text-secondary",
    fields: [
      { key: "resp_frequent_flu" as BooleanKeys, label: "Gripe frecuente" },
      { key: "resp_tuberculosis" as BooleanKeys, label: "Tuberculosis" },
      { key: "resp_asthma_sinusitis" as BooleanKeys, label: "Asma / sinusitis" },
      { key: "resp_chronic_cough_blood" as BooleanKeys, label: "Tos crónica / sangrado" },
    ],
  },
  {
    key: "endocrino",
    label: "Endocrino",
    icon: "science",
    iconBg: "bg-tertiary-fixed",
    iconColor: "text-tertiary",
    fields: [
      { key: "endo_diabetes" as BooleanKeys, label: "Diabetes" },
      { key: "endo_thyroid_problems" as BooleanKeys, label: "Problemas de tiroides" },
      { key: "endo_thirst_frequent_urination" as BooleanKeys, label: "Sed / orina frecuente" },
      { key: "endo_other_glandular" as BooleanKeys, label: "Otro glandular" },
    ],
  },
  {
    key: "neurologico",
    label: "Neurológico",
    icon: "psychology",
    iconBg: "bg-primary-fixed",
    iconColor: "text-primary",
    fields: [
      { key: "neuro_psychiatric_treatment" as BooleanKeys, label: "Tratamiento psiquiátrico" },
      { key: "neuro_thyroid_problems" as BooleanKeys, label: "Tiroides" },
      { key: "neuro_frequent_depression" as BooleanKeys, label: "Depresión frecuente" },
    ],
  },
  {
    key: "gastro",
    label: "Gástrico y Renal",
    icon: "water_drop",
    iconBg: "bg-surface-dim",
    iconColor: "text-on-surface-variant",
    fields: [
      { key: "gastro_liver_problems" as BooleanKeys, label: "Hígado" },
      { key: "gastro_reflux_vomiting" as BooleanKeys, label: "Reflujo / vómitos" },
      { key: "gastro_ulcers" as BooleanKeys, label: "Úlceras" },
      { key: "gastro_frequent_diarrhea" as BooleanKeys, label: "Diarrea frecuente" },
      { key: "gastro_unexplained_weight_loss" as BooleanKeys, label: "Pérdida de peso" },
      { key: "renal_kidney_problems" as BooleanKeys, label: "Riñones" },
      { key: "renal_sti" as BooleanKeys, label: "ETS" },
    ],
  },
  {
    key: "femenino",
    label: "Salud de la mujer",
    icon: "female",
    iconBg: "bg-primary-fixed",
    iconColor: "text-sidebar-active",
    border: true,
    fields: [
      { key: "female_contraceptives" as BooleanKeys, label: "Anticonceptivos" },
      { key: "female_osteoporosis" as BooleanKeys, label: "Osteoporosis" },
      { key: "female_pregnant" as BooleanKeys, label: "Embarazada" },
      { key: "female_breastfeeding" as BooleanKeys, label: "Lactancia" },
    ],
  },
]

const EXTRA_SECTIONS = [
  {
    key: "inmunologico",
    label: "Inmunológico",
    fields: [
      { key: "immun_drug_allergy" as BooleanKeys, label: "Alergia a medicamentos" },
      { key: "immun_autoimmune_disease" as BooleanKeys, label: "Enfermedad autoinmune" },
      { key: "immun_immunosuppressants" as BooleanKeys, label: "Inmunosupresores" },
    ],
  },
  {
    key: "sangre",
    label: "Sangre",
    fields: [
      { key: "blood_anemia" as BooleanKeys, label: "Anemia" },
      { key: "blood_leukemia" as BooleanKeys, label: "Leucemia" },
      { key: "blood_easy_bleeding" as BooleanKeys, label: "Sangrado fácil" },
    ],
  },
]

const EMPTY_BG: MedicalBackgroundData = {
  cardio_heart_problems: false, cardio_rheumatic_fever: false, cardio_antibiotics_before: false,
  cardio_mitral_valve_prolapse: false, cardio_easy_fatigue: false, cardio_high_blood_pressure: false,
  resp_frequent_flu: false, resp_tuberculosis: false, resp_asthma_sinusitis: false, resp_chronic_cough_blood: false,
  endo_diabetes: false, endo_thyroid_problems: false, endo_thirst_frequent_urination: false, endo_other_glandular: false,
  neuro_psychiatric_treatment: false, neuro_thyroid_problems: false, neuro_frequent_depression: false,
  gastro_liver_problems: false, gastro_reflux_vomiting: false, gastro_ulcers: false,
  gastro_frequent_diarrhea: false, gastro_unexplained_weight_loss: false,
  renal_kidney_problems: false, renal_sti: false,
  immun_drug_allergy: false, immun_autoimmune_disease: false, immun_immunosuppressants: false,
  blood_anemia: false, blood_leukemia: false, blood_easy_bleeding: false,
  female_contraceptives: false, female_osteoporosis: false, female_pregnant: false, female_breastfeeding: false,
  family_hypertension: false, family_diabetes: false, family_cardiovascular: false,
  family_cancer: false, family_renal: false, family_mental_health: false,
  family_other: "",
}

const FAMILY_FIELDS: { key: BooleanKeys; label: string }[] = [
  { key: "family_hypertension", label: "Hipertensión arterial" },
  { key: "family_diabetes", label: "Diabetes" },
  { key: "family_cardiovascular", label: "Enfermedad cardiovascular" },
  { key: "family_cancer", label: "Cáncer" },
  { key: "family_renal", label: "Enfermedad renal" },
  { key: "family_mental_health", label: "Salud mental" },
]

interface Step3Props {
  medicalHistoryId: string
  patientId: string
  initialData?: MedicalBackgroundData
  onNext: () => void
  onBack: () => void
  onSaveAndExit: () => void
}

export default function Step3MedicalBackground({
  medicalHistoryId,
  onNext,
  onBack,
  onSaveAndExit,
  initialData,
}: Step3Props) {
  const [bgData, setBgData] = useState<MedicalBackgroundData>(() => initialData ?? EMPTY_BG)
  const [observations, setObservations] = useState("")
  const [allergyInput, setAllergyInput] = useState("")
  const [allergyTags, setAllergyTags] = useState<string[]>([])
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSaving, startSaving] = useTransition()

  function toggleField(key: BooleanKeys) {
    setBgData((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function addAllergyTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && allergyInput.trim()) {
      e.preventDefault()
      setAllergyTags((prev) => [...prev, allergyInput.trim()])
      setAllergyInput("")
    }
  }

  function removeTag(index: number) {
    setAllergyTags((prev) => prev.filter((_, i) => i !== index))
  }

  async function doSave() {
    const result = await saveMedicalBackground(medicalHistoryId, bgData)
    return result
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
      onSaveAndExit()
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-surface-container">
          <h2 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
            Antecedentes médicos
          </h2>
          <p className="text-secondary mt-1 text-sm">
            Seleccione las condiciones aplicables al paciente.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Main system cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SYSTEM_CARDS.map((card) => (
              <div
                key={card.key}
                className={`bg-surface-container-low rounded-xl p-5 ${card.border ? "border-2 border-primary/10" : ""}`}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-9 h-9 ${card.iconBg} ${card.iconColor} rounded-lg flex items-center justify-center shrink-0`}>
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {card.icon}
                    </span>
                  </div>
                  <h3 className="font-bold text-on-surface text-sm">{card.label}</h3>
                </div>
                <div className="space-y-3">
                  {card.fields.map((field) => (
                    <label key={field.key} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={bgData[field.key]}
                        onChange={() => toggleField(field.key)}
                        className="w-4 h-4 rounded border-outline-variant text-sidebar-active focus:ring-sidebar-active/20 cursor-pointer shrink-0"
                      />
                      <span className="text-sm text-secondary group-hover:text-on-surface transition-colors">
                        {field.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Extra sections: Inmunológico + Sangre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {EXTRA_SECTIONS.map((section) => (
              <div key={section.key} className="bg-surface-container-low rounded-xl p-5">
                <h3 className="font-bold text-on-surface text-sm mb-4">{section.label}</h3>
                <div className="space-y-3">
                  {section.fields.map((field) => (
                    <label key={field.key} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={bgData[field.key]}
                        onChange={() => toggleField(field.key)}
                        className="w-4 h-4 rounded border-outline-variant text-sidebar-active focus:ring-sidebar-active/20 cursor-pointer shrink-0"
                      />
                      <span className="text-sm text-secondary group-hover:text-on-surface transition-colors">
                        {field.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Antecedentes Familiares */}
          <div>
            <div className="bg-surface-container-low rounded-xl p-5 border-2 border-primary/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-primary-fixed text-sidebar-active rounded-lg flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">group</span>
                </div>
                <div>
                  <h3 className="font-bold text-on-surface text-sm">Antecedentes Familiares</h3>
                  <p className="text-xs text-secondary mt-0.5">
                    Indique si algún familiar directo (padres, hermanos, abuelos) ha padecido las siguientes condiciones
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {FAMILY_FIELDS.map((field) => (
                  <label key={field.key} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={bgData[field.key]}
                      onChange={() => toggleField(field.key)}
                      className="w-4 h-4 rounded border-outline-variant text-sidebar-active focus:ring-sidebar-active/20 cursor-pointer shrink-0"
                    />
                    <span className="text-sm text-secondary group-hover:text-on-surface transition-colors">
                      {field.label}
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-4">
                <label className="block text-sm font-semibold text-on-surface-variant mb-1.5">
                  Otros antecedentes familiares
                </label>
                <textarea
                  value={bgData.family_other}
                  onChange={(e) => setBgData((prev) => ({ ...prev, family_other: e.target.value }))}
                  placeholder="Describa otros antecedentes familiares relevantes..."
                  rows={2}
                  className="w-full text-base bg-white border border-outline-variant/30 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Observations & allergies */}
          <div>
            <h3 className="font-extrabold text-lg text-on-surface mb-3">
              Observaciones clínicas y alergias
            </h3>
            <div className="bg-white rounded-xl border border-outline-variant/30 focus-within:ring-2 focus-within:ring-primary/20 transition-all overflow-hidden">
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Mencione alergias a medicamentos, cirugías recientes o síntomas persistentes..."
                rows={4}
                className="w-full text-base border-none rounded-lg text-sm text-on-surface p-4 focus:ring-0 outline-none resize-none"
              />
            </div>

            {/* Allergy tag input */}
            <div className="mt-3">
              <input
                type="text"
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                onKeyDown={addAllergyTag}
                placeholder="Escribir alergia y presionar Enter..."
                className="w-full text-base bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            {allergyTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {allergyTags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-error-container text-error text-[10px] font-bold rounded-full uppercase tracking-wider"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(i)}
                      className="ml-1 hover:opacity-70"
                      type="button"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
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
    </div>
  )
}
