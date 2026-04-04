import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { getProfile } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import HistoryHeader, { type HistoryHeaderData } from "./components/HistoryHeader"
import HistoryTabs, { type HistoryTabsData } from "./components/HistoryTabs"
import type { ToothRecord } from "@/components/shared/Odontogram"
import type { EndoRecord } from "./components/tabs/EndodonticsTab"

function calcAge(dob: Date | null | undefined): number | null {
  if (!dob) return null
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
  return age
}

export default async function HistoryDetailPage({
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
      patients: true,
      clinics: true,
      profiles: true,
      medical_backgrounds: true,
      dental_exams: {
        include: { tooth_records: true },
      },
      endodontics: {
        include: {
          endodontic_sessions: { orderBy: { session_date: "asc" } },
          endodontic_canals: { orderBy: { created_at: "asc" } },
        },
        orderBy: { created_at: "asc" },
      },
      treatment_items: { orderBy: { item_number: "asc" } },
      treatment_payments: { orderBy: { payment_date: "asc" } },
    },
  })

  if (!history) notFound()
  if (history.doctor_id !== profile.id) notFound()
  if (history.patient_id !== id) notFound()

  const patient = history.patients
  const isActive =
    history.created_at >= new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)

  // Header data
  const headerData: HistoryHeaderData = {
    historyId: history.id,
    patientId: id,
    patientName: patient.full_name,
    patientAge: calcAge(patient.date_of_birth),
    bloodType: patient.blood_type ?? null,
    idNumber: patient.id_number ?? null,
    clinicName: history.clinics?.name ?? null,
    createdAt: history.created_at.toISOString(),
    updatedAt: history.updated_at.toISOString(),
    doctorName: history.profiles.full_name,
    status: isActive ? "active" : "completed",
  }

  // Medical background
  const bg = history.medical_backgrounds
    ? {
        cardio_heart_problems: history.medical_backgrounds.cardio_heart_problems ?? false,
        cardio_rheumatic_fever: history.medical_backgrounds.cardio_rheumatic_fever ?? false,
        cardio_antibiotics_before: history.medical_backgrounds.cardio_antibiotics_before ?? false,
        cardio_mitral_valve_prolapse: history.medical_backgrounds.cardio_mitral_valve_prolapse ?? false,
        cardio_easy_fatigue: history.medical_backgrounds.cardio_easy_fatigue ?? false,
        cardio_high_blood_pressure: history.medical_backgrounds.cardio_high_blood_pressure ?? false,
        resp_frequent_flu: history.medical_backgrounds.resp_frequent_flu ?? false,
        resp_tuberculosis: history.medical_backgrounds.resp_tuberculosis ?? false,
        resp_asthma_sinusitis: history.medical_backgrounds.resp_asthma_sinusitis ?? false,
        resp_chronic_cough_blood: history.medical_backgrounds.resp_chronic_cough_blood ?? false,
        endo_diabetes: history.medical_backgrounds.endo_diabetes ?? false,
        endo_thyroid_problems: history.medical_backgrounds.endo_thyroid_problems ?? false,
        endo_thirst_frequent_urination: history.medical_backgrounds.endo_thirst_frequent_urination ?? false,
        endo_other_glandular: history.medical_backgrounds.endo_other_glandular ?? false,
        neuro_psychiatric_treatment: history.medical_backgrounds.neuro_psychiatric_treatment ?? false,
        neuro_thyroid_problems: history.medical_backgrounds.neuro_thyroid_problems ?? false,
        neuro_frequent_depression: history.medical_backgrounds.neuro_frequent_depression ?? false,
        gastro_liver_problems: history.medical_backgrounds.gastro_liver_problems ?? false,
        gastro_reflux_vomiting: history.medical_backgrounds.gastro_reflux_vomiting ?? false,
        gastro_ulcers: history.medical_backgrounds.gastro_ulcers ?? false,
        gastro_frequent_diarrhea: history.medical_backgrounds.gastro_frequent_diarrhea ?? false,
        gastro_unexplained_weight_loss: history.medical_backgrounds.gastro_unexplained_weight_loss ?? false,
        renal_kidney_problems: history.medical_backgrounds.renal_kidney_problems ?? false,
        renal_sti: history.medical_backgrounds.renal_sti ?? false,
        immun_drug_allergy: history.medical_backgrounds.immun_drug_allergy ?? false,
        immun_autoimmune_disease: history.medical_backgrounds.immun_autoimmune_disease ?? false,
        immun_immunosuppressants: history.medical_backgrounds.immun_immunosuppressants ?? false,
        blood_anemia: history.medical_backgrounds.blood_anemia ?? false,
        blood_leukemia: history.medical_backgrounds.blood_leukemia ?? false,
        blood_easy_bleeding: history.medical_backgrounds.blood_easy_bleeding ?? false,
        female_contraceptives: history.medical_backgrounds.female_contraceptives ?? false,
        female_osteoporosis: history.medical_backgrounds.female_osteoporosis ?? false,
        female_pregnant: history.medical_backgrounds.female_pregnant ?? false,
        female_breastfeeding: history.medical_backgrounds.female_breastfeeding ?? false,
        family_hypertension: history.medical_backgrounds.family_hypertension ?? false,
        family_diabetes: history.medical_backgrounds.family_diabetes ?? false,
        family_cardiovascular: history.medical_backgrounds.family_cardiovascular ?? false,
        family_cancer: history.medical_backgrounds.family_cancer ?? false,
        family_renal: history.medical_backgrounds.family_renal ?? false,
        family_mental_health: history.medical_backgrounds.family_mental_health ?? false,
        family_other: history.medical_backgrounds.family_other ?? null,
      }
    : null

  // Dental exam
  const exam = history.dental_exams
    ? {
        problem_atm: history.dental_exams.problem_atm ?? false,
        problem_crowding: history.dental_exams.problem_crowding ?? false,
        problem_periodontitis: history.dental_exams.problem_periodontitis ?? false,
        problem_gingivitis: history.dental_exams.problem_gingivitis ?? false,
        problem_habits: history.dental_exams.problem_habits ?? false,
        problem_takes_aspirin: history.dental_exams.problem_takes_aspirin ?? false,
        problem_wisdom_extract: history.dental_exams.problem_wisdom_extract ?? false,
        eruption_status: (history.dental_exams.eruption_status ?? null) as "erupted" | "semi" | "not_erupted" | null,
        specifications: history.dental_exams.specifications ?? null,
        observations: history.dental_exams.observations ?? null,
        definitive_diagnosis: history.dental_exams.definitive_diagnosis ?? null,
        treatment_plan_notes: history.dental_exams.treatment_plan_notes ?? null,
      }
    : null

  const toothRecords: ToothRecord[] = (history.dental_exams?.tooth_records ?? []).map((tr) => ({
    toothNumber: tr.tooth_number,
    vestibularStatus: tr.vestibular_status ?? "healthy",
    lingualStatus: tr.lingual_status ?? "healthy",
  }))

  // Endodontics
  const endoRecords: EndoRecord[] = history.endodontics.map((e) => ({
    id: e.id,
    tooth_number: e.tooth_number,
    pain_type: e.pain_type ?? null,
    pain_intensity: e.pain_intensity ?? null,
    pain_quality: e.pain_quality ?? null,
    pain_relief: e.pain_relief ?? null,
    percussion_vertical: e.percussion_vertical ?? null,
    percussion_horizontal: e.percussion_horizontal ?? null,
    palpation_apical: e.palpation_apical ?? null,
    palpation_gum: e.palpation_gum ?? null,
    mobility_grade: e.mobility_grade ?? null,
    thermal_tests: e.thermal_tests ?? null,
    pulp_chamber: e.pulp_chamber ?? null,
    canals: e.canals ?? null,
    periapical_zone: e.periapical_zone ?? null,
    pulp_diagnosis: e.pulp_diagnosis ?? null,
    periapical_diagnosis: e.periapical_diagnosis ?? null,
    canal_name: e.canal_name ?? null,
    canal_reference: e.canal_reference ?? null,
    canal_length: e.canal_length ?? null,
    irrigation_naocl_pct: e.irrigation_naocl_pct ? e.irrigation_naocl_pct.toString() : null,
    irrigation_edta: e.irrigation_edta ?? null,
    instrumentation: e.instrumentation ?? null,
    obturation: e.obturation ?? null,
    endodontic_sessions: e.endodontic_sessions.map((s) => ({
      id: s.id,
      session_date: s.session_date ? s.session_date.toISOString() : null,
      activity: s.activity,
      notes: s.notes ?? null,
    })),
    endodontic_canals: e.endodontic_canals.map((c) => ({
      id: c.id,
      canal_code: c.canal_code,
      canal_label: c.canal_label,
      reference: c.reference ?? null,
      length_mm: c.length_mm ? c.length_mm.toString() : null,
      notes: c.notes ?? null,
    })),
  }))

  const tabsData: HistoryTabsData = {
    historyId: history.id,
    patientId: id,
    currency: history.currency,
    bg,
    exam,
    toothRecords,
    endoRecords,
    items: history.treatment_items.map((i) => ({
      id: i.id,
      item_number: i.item_number,
      description: i.description,
      cost: i.cost.toString(),
    })),
    payments: history.treatment_payments.map((p) => ({
      id: p.id,
      payment_date: p.payment_date.toISOString(),
      tooth_unit: p.tooth_unit ?? null,
      clinical_activity: p.clinical_activity,
      cost: p.cost.toString(),
      payment: p.payment.toString(),
      balance: p.balance ? p.balance.toString() : null,
    })),
  }

  return (
    <div className="min-h-screen bg-surface-container-low">
      {/* Breadcrumb */}
      <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <nav className="flex items-center gap-1.5 text-xs font-medium text-secondary max-w-7xl mx-auto">
          <Link href="/patients" className="hover:text-sidebar-active transition-colors">
            Pacientes
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link href={`/patients/${id}`} className="hover:text-sidebar-active transition-colors">
            {patient.full_name}
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface font-semibold">
            Historia {new Date(history.created_at).toLocaleDateString("es-ES", { month: "short", year: "numeric" })}
          </span>
        </nav>
      </div>

      <HistoryHeader data={headerData} />
      <HistoryTabs data={tabsData} />
    </div>
  )
}
