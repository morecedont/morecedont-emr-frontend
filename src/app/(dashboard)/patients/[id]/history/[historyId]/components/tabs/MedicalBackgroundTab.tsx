"use client"

type BgData = {
  cardio_heart_problems: boolean; cardio_rheumatic_fever: boolean; cardio_antibiotics_before: boolean
  cardio_mitral_valve_prolapse: boolean; cardio_easy_fatigue: boolean; cardio_high_blood_pressure: boolean
  resp_frequent_flu: boolean; resp_tuberculosis: boolean; resp_asthma_sinusitis: boolean; resp_chronic_cough_blood: boolean
  endo_diabetes: boolean; endo_thyroid_problems: boolean; endo_thirst_frequent_urination: boolean; endo_other_glandular: boolean
  neuro_psychiatric_treatment: boolean; neuro_thyroid_problems: boolean; neuro_frequent_depression: boolean
  gastro_liver_problems: boolean; gastro_reflux_vomiting: boolean; gastro_ulcers: boolean
  gastro_frequent_diarrhea: boolean; gastro_unexplained_weight_loss: boolean
  renal_kidney_problems: boolean; renal_sti: boolean
  immun_drug_allergy: boolean; immun_autoimmune_disease: boolean; immun_immunosuppressants: boolean
  blood_anemia: boolean; blood_leukemia: boolean; blood_easy_bleeding: boolean
  female_contraceptives: boolean; female_osteoporosis: boolean; female_pregnant: boolean; female_breastfeeding: boolean
  family_hypertension?: boolean | null; family_diabetes?: boolean | null; family_cardiovascular?: boolean | null
  family_cancer?: boolean | null; family_renal?: boolean | null; family_mental_health?: boolean | null
  family_other?: string | null
} | null

const FAMILY_CONDITIONS = [
  { key: "family_hypertension" as const, label: "Hipertensión arterial" },
  { key: "family_diabetes" as const, label: "Diabetes" },
  { key: "family_cardiovascular" as const, label: "Enfermedad cardiovascular" },
  { key: "family_cancer" as const, label: "Cáncer" },
  { key: "family_renal" as const, label: "Enfermedad renal" },
  { key: "family_mental_health" as const, label: "Salud mental" },
]

const SYSTEMS = [
  {
    key: "cardiovascular", label: "Cardiovascular", icon: "favorite", iconBg: "bg-red-100 text-error",
    conditions: [
      { field: "cardio_high_blood_pressure" as const, name: "Hipertensión", desc: "Controlada con medicación. Presión estable." },
      { field: "cardio_heart_problems" as const, name: "Problemas cardíacos", desc: "Requiere evaluación previa al tratamiento." },
      { field: "cardio_rheumatic_fever" as const, name: "Fiebre reumática", desc: "Antecedente registrado." },
      { field: "cardio_mitral_valve_prolapse" as const, name: "Prolapso válvula mitral", desc: "Requiere profilaxis antibiótica." },
      { field: "cardio_easy_fatigue" as const, name: "Fatiga fácil", desc: "Puede indicar condición cardíaca subyacente." },
      { field: "cardio_antibiotics_before" as const, name: "Antibióticos pre-tratamiento", desc: "Indicado para procedimientos invasivos." },
    ],
  },
  {
    key: "respiratorio", label: "Respiratorio", icon: "air", iconBg: "bg-blue-50 text-blue-600",
    conditions: [
      { field: "resp_asthma_sinusitis" as const, name: "Asma / Sinusitis", desc: "Control con inhalador. Evitar alérgenos." },
      { field: "resp_frequent_flu" as const, name: "Gripe frecuente", desc: "Inmunidad reducida. Precaución en tratamientos." },
      { field: "resp_tuberculosis" as const, name: "Tuberculosis", desc: "Antecedente. Verificar estado actual." },
      { field: "resp_chronic_cough_blood" as const, name: "Tos crónica / sangrado", desc: "Requiere evaluación neumológica." },
    ],
  },
  {
    key: "endocrino", label: "Endocrino", icon: "science", iconBg: "bg-purple-50 text-purple-600",
    conditions: [
      { field: "endo_diabetes" as const, name: "Diabetes Tipo II", desc: "Última HbA1c: 6.8%. Tratamiento con Metformina." },
      { field: "endo_thyroid_problems" as const, name: "Problemas de tiroides", desc: "Bajo control endocrinológico." },
      { field: "endo_thirst_frequent_urination" as const, name: "Sed / Orina frecuente", desc: "Posible descontrol glucémico." },
      { field: "endo_other_glandular" as const, name: "Otro glandular", desc: "Consultar con especialista." },
    ],
  },
  {
    key: "neurologico", label: "Neurológico", icon: "psychology", iconBg: "bg-indigo-50 text-indigo-600",
    conditions: [
      { field: "neuro_psychiatric_treatment" as const, name: "Epilepsia", desc: "Crisis controladas. Último episodio hace 2 años." },
      { field: "neuro_thyroid_problems" as const, name: "Tiroides neurológico", desc: "Asociado a fatiga crónica." },
      { field: "neuro_frequent_depression" as const, name: "Depresión frecuente", desc: "Tratamiento psicológico activo." },
    ],
  },
  {
    key: "gastro", label: "Gástrico y Renal", icon: "water_drop", iconBg: "bg-gray-100 text-gray-500",
    conditions: [
      { field: "gastro_reflux_vomiting" as const, name: "Reflujo", desc: "Gastroesofágico moderado. Posible erosión dental palatina." },
      { field: "gastro_ulcers" as const, name: "Úlceras", desc: "Antecedente de úlcera gástrica." },
      { field: "gastro_liver_problems" as const, name: "Hígado", desc: "Función hepática alterada. Ajustar anestésicos." },
      { field: "gastro_frequent_diarrhea" as const, name: "Diarrea frecuente", desc: "Posible síndrome de intestino irritable." },
      { field: "gastro_unexplained_weight_loss" as const, name: "Pérdida de peso", desc: "Investigar causa subyacente." },
      { field: "renal_kidney_problems" as const, name: "Riñones", desc: "Insuficiencia renal leve. Ajustar dosis de fármacos." },
      { field: "renal_sti" as const, name: "ETS", desc: "Antecedente registrado." },
    ],
  },
  {
    key: "femenino", label: "Salud de la Mujer", icon: "female", iconBg: "bg-pink-50 text-pink-600",
    conditions: [
      { field: "female_contraceptives" as const, name: "Anticonceptivos", desc: "Uso regular. No se reportan otras incidencias." },
      { field: "female_osteoporosis" as const, name: "Osteoporosis", desc: "Precaución en procedimientos quirúrgicos óseos." },
      { field: "female_pregnant" as const, name: "Embarazada", desc: "Evitar radiografías y ciertos fármacos." },
      { field: "female_breastfeeding" as const, name: "Lactancia", desc: "Restricciones en medicamentos sistémicos." },
    ],
  },
]

interface MedicalBackgroundTabProps {
  bg: BgData
  patientId: string
  historyId: string
}

export default function MedicalBackgroundTab({ bg, patientId, historyId }: MedicalBackgroundTabProps) {
  const hasAllergy = bg?.immun_drug_allergy || bg?.blood_easy_bleeding

  return (
    <div className="space-y-6">
      {/* Allergy banner */}
      {hasAllergy && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <span className="material-symbols-outlined text-error text-[20px]">warning</span>
          {bg?.immun_drug_allergy && (
            <span className="px-3 py-1 bg-error text-white text-xs font-bold rounded-full uppercase tracking-wider">
              Alergia a Medicamentos
            </span>
          )}
          {bg?.blood_easy_bleeding && (
            <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">
              Sangrado Fácil
            </span>
          )}
        </div>
      )}

      {!bg ? (
        <div className="py-12 text-center">
          <span className="material-symbols-outlined text-outline text-5xl">medical_information</span>
          <p className="font-bold text-on-surface mt-3">Sin antecedentes registrados</p>
          <p className="text-sm text-secondary mt-1">Completa el formulario de antecedentes médicos.</p>
        </div>
      ) : (
        <>
          {/* System cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SYSTEMS.map((system) => {
              const activeConditions = system.conditions.filter((c) => bg[c.field])
              const hasAny = activeConditions.length > 0
              return (
                <div key={system.key} className="bg-surface-container-low rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-8 h-8 rounded-lg ${system.iconBg} flex items-center justify-center shrink-0`}>
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {system.icon}
                      </span>
                    </div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-secondary ml-2 text-right">
                      {system.label}
                    </p>
                  </div>
                  {hasAny ? (
                    <div className="space-y-3">
                      {activeConditions.map((c) => (
                        <div key={c.field}>
                          <p className="text-sm font-bold text-on-surface">{c.name}</p>
                          <p className="text-xs text-secondary mt-0.5 leading-relaxed">{c.desc}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-secondary">Normal</p>
                      <p className="text-xs text-outline mt-0.5">Sin patologías detectadas</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Inmunológico + Sangre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface-container-low rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[16px] text-primary">coronavirus</span>
                <p className="text-[9px] font-bold uppercase tracking-widest text-secondary">Inmunológico</p>
              </div>
              {(!bg.immun_drug_allergy && !bg.immun_autoimmune_disease && !bg.immun_immunosuppressants) ? (
                <p className="text-sm text-secondary">Sistema inmune competente. Calendario de vacunación al día según protocolos locales.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {bg.immun_drug_allergy && <span className="px-2.5 py-1 bg-error-container text-error text-[10px] font-bold rounded-full uppercase">Alergia a medicamentos</span>}
                  {bg.immun_autoimmune_disease && <span className="px-2.5 py-1 bg-error-container text-error text-[10px] font-bold rounded-full uppercase">Autoinmune</span>}
                  {bg.immun_immunosuppressants && <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full uppercase">Inmunosupresores</span>}
                </div>
              )}
            </div>
            <div className="bg-surface-container-low rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[16px] text-blue-500">water_drop</span>
                <p className="text-[9px] font-bold uppercase tracking-widest text-secondary">Sangre</p>
              </div>
              {(!bg.blood_anemia && !bg.blood_leukemia && !bg.blood_easy_bleeding) ? (
                <p className="text-sm text-secondary">Tiempo de coagulación normal. Sin antecedentes de hemorragias.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {bg.blood_anemia && <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full uppercase">Anemia</span>}
                  {bg.blood_leukemia && <span className="px-2.5 py-1 bg-error-container text-error text-[10px] font-bold rounded-full uppercase">Leucemia</span>}
                  {bg.blood_easy_bleeding && <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full uppercase">Sangrado fácil</span>}
                </div>
              )}
            </div>
          </div>

          {/* Antecedentes Familiares */}
          {(() => {
            const hasAnyFamily = FAMILY_CONDITIONS.some((c) => bg?.[c.key])
            const familyOther = bg?.family_other
            const hasContent = hasAnyFamily || !!familyOther
            return (
              <div className="bg-surface-container-low rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary-fixed text-sidebar-active flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[16px]">group</span>
                  </div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-secondary">
                    Antecedentes Familiares
                  </p>
                </div>
                {!hasContent ? (
                  <p className="text-sm text-secondary">Sin antecedentes familiares reportados</p>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {FAMILY_CONDITIONS.map((c) => {
                        const active = !!bg?.[c.key]
                        return (
                          <div key={c.key} className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${active ? "bg-sidebar-active" : "bg-gray-300"}`}
                            />
                            <span className={`text-sm ${active ? "font-bold text-on-surface" : "text-[#9CA3AF]"}`}>
                              {c.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    {familyOther && (
                      <p className="text-xs text-secondary mt-2">
                        <span className="font-semibold text-on-surface-variant">Otros: </span>
                        {familyOther}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })()}

          {/* Observations */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-on-surface">Observaciones clínicas y alergias</h3>
              <a
                href={`/patients/${patientId}/history/${historyId}/edit`}
                className="text-xs font-semibold text-sidebar-active hover:underline"
              >
                Editar antecedentes
              </a>
            </div>
            <div className="bg-surface-container-low rounded-xl p-5 border-l-4 border-sidebar-active/30">
              <p className="text-sm text-secondary italic leading-relaxed">
                "Sin observaciones registradas"
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
