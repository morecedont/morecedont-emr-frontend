import { notFound, redirect } from "next/navigation"
import { getProfile } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import EditHistoryWizard from "./EditHistoryWizard"
import type { MedicalBackgroundData } from "@/lib/actions/patients"
import type { ExamFormData } from "@/app/(dashboard)/patients/new/steps/Step4DentalExam"
import type { InitialEndoData } from "@/app/(dashboard)/patients/new/steps/Step5Endodontics"

export default async function EditHistoryPage({
  params,
}: {
  params: Promise<{ id: string; historyId: string }>
}) {
  const { id, historyId } = await params
  const profile = await getProfile()
  if (!profile) redirect("/login")

  const history = await prisma.medical_histories.findUnique({
    where: { id: historyId },
    include: {
      medical_backgrounds: true,
      dental_exams: {
        include: { tooth_records: true },
      },
      endodontics: {
        include: { endodontic_sessions: true },
        orderBy: { created_at: "asc" },
      },
      treatment_items: { orderBy: { item_number: "asc" } },
      treatment_payments: { orderBy: { payment_date: "asc" } },
    },
  })

  if (!history) notFound()
  if (history.doctor_id !== profile.id) notFound()
  if (history.patient_id !== id) notFound()

  console.log('[EditHistory] medical_backgrounds:', JSON.stringify(history.medical_backgrounds))
  console.log('[EditHistory] dental_exams:', JSON.stringify(history.dental_exams?.id ?? null))
  console.log('[EditHistory] endodontics count:', history.endodontics.length)
  console.log('[EditHistory] treatment_items count:', history.treatment_items.length)

  const bg = history.medical_backgrounds
  const medicalBackground: MedicalBackgroundData | null = bg
    ? {
        cardio_heart_problems: bg.cardio_heart_problems ?? false,
        cardio_rheumatic_fever: bg.cardio_rheumatic_fever ?? false,
        cardio_antibiotics_before: bg.cardio_antibiotics_before ?? false,
        cardio_mitral_valve_prolapse: bg.cardio_mitral_valve_prolapse ?? false,
        cardio_easy_fatigue: bg.cardio_easy_fatigue ?? false,
        cardio_high_blood_pressure: bg.cardio_high_blood_pressure ?? false,
        resp_frequent_flu: bg.resp_frequent_flu ?? false,
        resp_tuberculosis: bg.resp_tuberculosis ?? false,
        resp_asthma_sinusitis: bg.resp_asthma_sinusitis ?? false,
        resp_chronic_cough_blood: bg.resp_chronic_cough_blood ?? false,
        endo_diabetes: bg.endo_diabetes ?? false,
        endo_thyroid_problems: bg.endo_thyroid_problems ?? false,
        endo_thirst_frequent_urination: bg.endo_thirst_frequent_urination ?? false,
        endo_other_glandular: bg.endo_other_glandular ?? false,
        neuro_psychiatric_treatment: bg.neuro_psychiatric_treatment ?? false,
        neuro_thyroid_problems: bg.neuro_thyroid_problems ?? false,
        neuro_frequent_depression: bg.neuro_frequent_depression ?? false,
        gastro_liver_problems: bg.gastro_liver_problems ?? false,
        gastro_reflux_vomiting: bg.gastro_reflux_vomiting ?? false,
        gastro_ulcers: bg.gastro_ulcers ?? false,
        gastro_frequent_diarrhea: bg.gastro_frequent_diarrhea ?? false,
        gastro_unexplained_weight_loss: bg.gastro_unexplained_weight_loss ?? false,
        renal_kidney_problems: bg.renal_kidney_problems ?? false,
        renal_sti: bg.renal_sti ?? false,
        immun_drug_allergy: bg.immun_drug_allergy ?? false,
        immun_autoimmune_disease: bg.immun_autoimmune_disease ?? false,
        immun_immunosuppressants: bg.immun_immunosuppressants ?? false,
        blood_anemia: bg.blood_anemia ?? false,
        blood_leukemia: bg.blood_leukemia ?? false,
        blood_easy_bleeding: bg.blood_easy_bleeding ?? false,
        female_contraceptives: bg.female_contraceptives ?? false,
        female_osteoporosis: bg.female_osteoporosis ?? false,
        female_pregnant: bg.female_pregnant ?? false,
        female_breastfeeding: bg.female_breastfeeding ?? false,
        family_hypertension: bg.family_hypertension ?? false,
        family_diabetes: bg.family_diabetes ?? false,
        family_cardiovascular: bg.family_cardiovascular ?? false,
        family_cancer: bg.family_cancer ?? false,
        family_renal: bg.family_renal ?? false,
        family_mental_health: bg.family_mental_health ?? false,
        family_other: bg.family_other ?? "",
      }
    : null

  const exam = history.dental_exams
  const dentalExam: ExamFormData | null = exam
    ? {
        problem_atm: exam.problem_atm ?? false,
        problem_crowding: exam.problem_crowding ?? false,
        problem_periodontitis: exam.problem_periodontitis ?? false,
        problem_gingivitis: exam.problem_gingivitis ?? false,
        problem_habits: exam.problem_habits ?? false,
        problem_takes_aspirin: exam.problem_takes_aspirin ?? false,
        problem_wisdom_extract: exam.problem_wisdom_extract ?? false,
        eruption_status: (exam.eruption_status ?? "") as "erupted" | "semi" | "not_erupted" | "",
        specifications: exam.specifications ?? "",
        observations: exam.observations ?? "",
        definitive_diagnosis: exam.definitive_diagnosis ?? "",
        treatment_plan_notes: exam.treatment_plan_notes ?? "",
      }
    : null

  const toothRecords = (exam?.tooth_records ?? []).map((tr) => ({
    toothNumber: tr.tooth_number,
    vestibularStatus: tr.vestibular_status ?? "healthy",
    lingualStatus: tr.lingual_status ?? "healthy",
  }))

  const firstEndo = history.endodontics[0] ?? null
  const firstEndoRecord: InitialEndoData | null = firstEndo
    ? {
        toothNumber: firstEndo.tooth_number,
        painType: firstEndo.pain_type,
        painIntensity: firstEndo.pain_intensity,
        painQuality: firstEndo.pain_quality,
        painRelief: firstEndo.pain_relief,
        percussionVertical: firstEndo.percussion_vertical,
        percussionHorizontal: firstEndo.percussion_horizontal,
        palpationApical: firstEndo.palpation_apical,
        palpationGum: firstEndo.palpation_gum,
        mobilityGrade: firstEndo.mobility_grade,
        thermalTests: firstEndo.thermal_tests,
        pulpChamber: firstEndo.pulp_chamber,
        canals: firstEndo.canals,
        periapicalZone: firstEndo.periapical_zone,
        pulpDiagnosis: firstEndo.pulp_diagnosis,
        periapicalDiagnosis: firstEndo.periapical_diagnosis,
        canalName: firstEndo.canal_name,
        canalReference: firstEndo.canal_reference,
        canalLength: firstEndo.canal_length,
        irrigationNaoclPct: firstEndo.irrigation_naocl_pct ? firstEndo.irrigation_naocl_pct.toString() : null,
        irrigationEdta: firstEndo.irrigation_edta,
        instrumentation: firstEndo.instrumentation,
        obturation: firstEndo.obturation,
        sessions: firstEndo.endodontic_sessions.map((s) => ({
          date: s.session_date ? s.session_date.toISOString().substring(0, 10) : "",
          activity: s.activity,
          notes: s.notes ?? "",
        })),
      }
    : null

  const treatmentItems = history.treatment_items.map((i) => ({
    description: i.description,
    cost: i.cost.toString(),
  }))

  const treatmentPayments = history.treatment_payments.map((p) => ({
    date: p.payment_date.toISOString().substring(0, 10),
    toothUnit: p.tooth_unit ?? "",
    clinicalActivity: p.clinical_activity,
    cost: p.cost.toString(),
    payment: p.payment.toString(),
  }))

  return (
    <div className="min-h-screen bg-surface-container-low">
      <EditHistoryWizard
        historyId={historyId}
        patientId={id}
        currency={history.currency}
        medicalBackground={medicalBackground}
        dentalExam={dentalExam}
        toothRecords={toothRecords}
        firstEndoRecord={firstEndoRecord}
        treatmentItems={treatmentItems}
        treatmentPayments={treatmentPayments}
      />
    </div>
  )
}
