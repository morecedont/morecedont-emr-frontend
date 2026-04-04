"use server"

import { getProfile } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

// ─── Patients list actions ────────────────────────────────────────────────────

export async function searchDoctors(query: string) {
  const profile = await getProfile()
  if (!profile) return []

  const doctors = await prisma.profiles.findMany({
    where: {
      role: "doctor",
      status: "active",
      id: { not: profile.id },
      OR: [
        { full_name: { contains: query, mode: Prisma.QueryMode.insensitive } },
        { email: { contains: query, mode: Prisma.QueryMode.insensitive } },
      ],
    },
    select: { id: true, full_name: true, email: true, specialty: true },
    take: 10,
  })

  return doctors
}

export async function sharePatient(
  patientId: string,
  targetDoctorId: string
): Promise<{ success: boolean; error?: string }> {
  const profile = await getProfile()
  if (!profile) return { success: false, error: "No autorizado" }

  const existing = await prisma.doctor_patients.findUnique({
    where: { doctor_id_patient_id: { doctor_id: targetDoctorId, patient_id: patientId } },
  })
  if (existing) {
    return { success: false, error: "Este doctor ya tiene acceso a este paciente" }
  }

  await prisma.doctor_patients.create({
    data: { doctor_id: targetDoctorId, patient_id: patientId, shared_by: profile.id, shared_at: new Date() },
  })
  return { success: true }
}

// ─── Medical history actions ─────────────────────────────────────────────────

export async function createMedicalHistory(
  patientId: string,
  clinicId: string | null,
  currency: "USD" | "VES" | "EUR"
): Promise<{ medicalHistoryId?: string; error?: string }> {
  const profile = await getProfile()
  if (!profile) return { error: "No autorizado" }

  const access = await prisma.doctor_patients.findUnique({
    where: { doctor_id_patient_id: { doctor_id: profile.id, patient_id: patientId } },
  })
  if (!access) return { error: "No autorizado" }

  try {
    const history = await prisma.medical_histories.create({
      data: {
        patient_id: patientId,
        doctor_id: profile.id,
        clinic_id: clinicId || null,
        currency,
      },
    })
    return { medicalHistoryId: history.id }
  } catch (err) {
    console.error("createMedicalHistory error:", err)
    return { error: "Error al crear historia clínica" }
  }
}

// ─── New patient wizard actions ───────────────────────────────────────────────

export async function checkDuplicatePatient(
  idNumber: string,
  dateOfBirth: string
): Promise<boolean> {
  const existing = await prisma.patients.findFirst({
    where: {
      id_number: idNumber,
      date_of_birth: new Date(dateOfBirth),
    },
  })
  return !!existing
}

export type PersonalData = {
  fullName: string
  idNumber: string
  dateOfBirth: string
  gender: string
  bloodType: string
  phone: string
  email: string
  address: string
}

export type EmergencyData = {
  emergencyContact: string
  emergencyPhone: string
  lastDentalVisit: string
  clinicId: string
  currency: string
}

export async function createPatient(
  personalData: PersonalData,
  emergencyData: EmergencyData,
  doctorId: string
): Promise<{ patientId?: string; medicalHistoryId?: string; error?: string }> {
  const profile = await getProfile()
  if (!profile || profile.id !== doctorId) return { error: "No autorizado" }

  try {
    const patient = await prisma.patients.create({
      data: {
        full_name: personalData.fullName,
        id_number: personalData.idNumber || null,
        date_of_birth: personalData.dateOfBirth ? new Date(personalData.dateOfBirth) : null,
        gender: personalData.gender || null,
        blood_type: personalData.bloodType || null,
        phone: personalData.phone || null,
        email: personalData.email || null,
        address: personalData.address || null,
        created_by: doctorId,
      },
    })

    await prisma.doctor_patients.create({
      data: { doctor_id: doctorId, patient_id: patient.id },
    })

    const medicalHistory = await prisma.medical_histories.create({
      data: {
        patient_id: patient.id,
        doctor_id: doctorId,
        clinic_id: emergencyData.clinicId || null,
        currency: (emergencyData.currency as "USD" | "VES" | "EUR") || "USD",
        last_dental_visit: emergencyData.lastDentalVisit ? new Date(emergencyData.lastDentalVisit) : null,
        emergency_contact: emergencyData.emergencyContact
          ? `${emergencyData.emergencyContact} | ${emergencyData.emergencyPhone}`
          : null,
      },
    })

    return { patientId: patient.id, medicalHistoryId: medicalHistory.id }
  } catch (err) {
    console.error("createPatient error:", err)
    return { error: "Error al crear el paciente" }
  }
}

async function verifyOwnership(medicalHistoryId: string, doctorId: string): Promise<boolean> {
  const history = await prisma.medical_histories.findFirst({
    where: { id: medicalHistoryId, doctor_id: doctorId },
  })
  return !!history
}

export type MedicalBackgroundData = {
  cardio_heart_problems: boolean
  cardio_rheumatic_fever: boolean
  cardio_antibiotics_before: boolean
  cardio_mitral_valve_prolapse: boolean
  cardio_easy_fatigue: boolean
  cardio_high_blood_pressure: boolean
  resp_frequent_flu: boolean
  resp_tuberculosis: boolean
  resp_asthma_sinusitis: boolean
  resp_chronic_cough_blood: boolean
  endo_diabetes: boolean
  endo_thyroid_problems: boolean
  endo_thirst_frequent_urination: boolean
  endo_other_glandular: boolean
  neuro_psychiatric_treatment: boolean
  neuro_thyroid_problems: boolean
  neuro_frequent_depression: boolean
  gastro_liver_problems: boolean
  gastro_reflux_vomiting: boolean
  gastro_ulcers: boolean
  gastro_frequent_diarrhea: boolean
  gastro_unexplained_weight_loss: boolean
  renal_kidney_problems: boolean
  renal_sti: boolean
  immun_drug_allergy: boolean
  immun_autoimmune_disease: boolean
  immun_immunosuppressants: boolean
  blood_anemia: boolean
  blood_leukemia: boolean
  blood_easy_bleeding: boolean
  female_contraceptives: boolean
  female_osteoporosis: boolean
  female_pregnant: boolean
  female_breastfeeding: boolean
}

export async function saveMedicalBackground(
  medicalHistoryId: string,
  data: MedicalBackgroundData
): Promise<{ error?: string }> {
  const profile = await getProfile()
  if (!profile) return { error: "No autorizado" }
  if (!(await verifyOwnership(medicalHistoryId, profile.id))) return { error: "No autorizado" }

  try {
    await prisma.medical_backgrounds.upsert({
      where: { medical_history_id: medicalHistoryId },
      update: data,
      create: { medical_history_id: medicalHistoryId, ...data },
    })
    return {}
  } catch (err) {
    console.error("saveMedicalBackground error:", err)
    return { error: "Error al guardar antecedentes" }
  }
}

export type DentalExamData = {
  problem_atm: boolean
  problem_crowding: boolean
  problem_periodontitis: boolean
  problem_gingivitis: boolean
  problem_habits: boolean
  problem_takes_aspirin: boolean
  problem_wisdom_extract: boolean
  eruption_status: "erupted" | "semi" | "not_erupted" | null
  specifications: string
  observations: string
  definitive_diagnosis: string
  treatment_plan_notes: string
}

export type ToothRecord = {
  toothNumber: number
  vestibularStatus: string
  lingualStatus: string
}

export async function saveDentalExam(
  medicalHistoryId: string,
  examData: DentalExamData,
  toothRecords: ToothRecord[]
): Promise<{ error?: string }> {
  const profile = await getProfile()
  if (!profile) return { error: "No autorizado" }
  if (!(await verifyOwnership(medicalHistoryId, profile.id))) return { error: "No autorizado" }

  try {
    const exam = await prisma.dental_exams.upsert({
      where: { medical_history_id: medicalHistoryId },
      update: {
        problem_atm: examData.problem_atm,
        problem_crowding: examData.problem_crowding,
        problem_periodontitis: examData.problem_periodontitis,
        problem_gingivitis: examData.problem_gingivitis,
        problem_habits: examData.problem_habits,
        problem_takes_aspirin: examData.problem_takes_aspirin,
        problem_wisdom_extract: examData.problem_wisdom_extract,
        eruption_status: examData.eruption_status,
        specifications: examData.specifications || null,
        observations: examData.observations || null,
        definitive_diagnosis: examData.definitive_diagnosis || null,
        treatment_plan_notes: examData.treatment_plan_notes || null,
      },
      create: {
        medical_history_id: medicalHistoryId,
        problem_atm: examData.problem_atm,
        problem_crowding: examData.problem_crowding,
        problem_periodontitis: examData.problem_periodontitis,
        problem_gingivitis: examData.problem_gingivitis,
        problem_habits: examData.problem_habits,
        problem_takes_aspirin: examData.problem_takes_aspirin,
        problem_wisdom_extract: examData.problem_wisdom_extract,
        eruption_status: examData.eruption_status,
        specifications: examData.specifications || null,
        observations: examData.observations || null,
        definitive_diagnosis: examData.definitive_diagnosis || null,
        treatment_plan_notes: examData.treatment_plan_notes || null,
      },
    })

    // Batch upsert tooth records
    for (const tr of toothRecords) {
      await prisma.tooth_records.upsert({
        where: { dental_exam_id_tooth_number: { dental_exam_id: exam.id, tooth_number: tr.toothNumber } },
        update: {
          vestibular_status: tr.vestibularStatus as never,
          lingual_status: tr.lingualStatus as never,
        },
        create: {
          dental_exam_id: exam.id,
          tooth_number: tr.toothNumber,
          vestibular_status: tr.vestibularStatus as never,
          lingual_status: tr.lingualStatus as never,
        },
      })
    }

    return {}
  } catch (err) {
    console.error("saveDentalExam error:", err)
    return { error: "Error al guardar examen dental" }
  }
}

export type EndodonticData = {
  toothNumber: number
  painType: string | null
  painIntensity: number | null
  painQuality: string | null
  painRelief: string | null
  percussionVertical: string | null
  percussionHorizontal: string | null
  palpationApical: string | null
  palpationGum: string | null
  mobilityGrade: string | null
  thermalTests: string
  pulpChamber: string | null
  canals: string | null
  periapicalZone: string | null
  pulpDiagnosis: string
  periapicalDiagnosis: string
  canalName: string
  canalReference: string
  canalLength: string
  irrigationNaoclPct: number | null
  irrigationEdta: boolean
  instrumentation: string | null
  obturation: string | null
}

export type EndoSession = {
  date: string
  activity: string
  notes: string
}

export async function saveEndodontics(
  medicalHistoryId: string,
  data: EndodonticData,
  sessions: EndoSession[]
): Promise<{ error?: string }> {
  const profile = await getProfile()
  if (!profile) return { error: "No autorizado" }
  if (!(await verifyOwnership(medicalHistoryId, profile.id))) return { error: "No autorizado" }

  try {
    // Find existing endo for this tooth in this history
    const existing = await prisma.endodontics.findFirst({
      where: { medical_history_id: medicalHistoryId, tooth_number: data.toothNumber },
    })

    let endoId: string
    const payload = {
      tooth_number: data.toothNumber,
      pain_type: data.painType as never,
      pain_intensity: data.painIntensity,
      pain_quality: data.painQuality as never,
      pain_relief: data.painRelief as never,
      percussion_vertical: data.percussionVertical as never,
      percussion_horizontal: data.percussionHorizontal as never,
      palpation_apical: data.palpationApical as never,
      palpation_gum: data.palpationGum as never,
      mobility_grade: data.mobilityGrade as never,
      thermal_tests: data.thermalTests || null,
      pulp_chamber: data.pulpChamber as never,
      canals: data.canals as never,
      periapical_zone: data.periapicalZone as never,
      pulp_diagnosis: data.pulpDiagnosis || null,
      periapical_diagnosis: data.periapicalDiagnosis || null,
      canal_name: data.canalName || null,
      canal_reference: data.canalReference || null,
      canal_length: data.canalLength || null,
      irrigation_naocl_pct: data.irrigationNaoclPct ?? null,
      irrigation_edta: data.irrigationEdta,
      instrumentation: data.instrumentation as never,
      obturation: data.obturation as never,
    }

    if (existing) {
      await prisma.endodontics.update({ where: { id: existing.id }, data: payload })
      // Delete old sessions before re-inserting
      await prisma.endodontic_sessions.deleteMany({ where: { endodontic_id: existing.id } })
      endoId = existing.id
    } else {
      const endo = await prisma.endodontics.create({
        data: { medical_history_id: medicalHistoryId, ...payload },
      })
      endoId = endo.id
    }

    // Insert sessions
    for (const s of sessions) {
      if (s.date && s.activity) {
        await prisma.endodontic_sessions.create({
          data: {
            endodontic_id: endoId,
            session_date: new Date(s.date),
            activity: s.activity as never,
            notes: s.notes || null,
          },
        })
      }
    }

    return {}
  } catch (err) {
    console.error("saveEndodontics error:", err)
    return { error: "Error al guardar endodoncia" }
  }
}

export type TreatmentItem = {
  itemNumber: number
  description: string
  cost: number
}

export type TreatmentPayment = {
  date: string
  toothUnit: string
  clinicalActivity: string
  cost: number
  payment: number
}

export type PatientUpdateData = {
  fullName: string
  idNumber: string
  dateOfBirth: string
  gender: string
  bloodType: string
  phone: string
  email: string
  address: string
}

export async function updatePatient(
  patientId: string,
  data: PatientUpdateData
): Promise<{ error?: string }> {
  const profile = await getProfile()
  if (!profile) return { error: "No autorizado" }

  const access = await prisma.doctor_patients.findUnique({
    where: { doctor_id_patient_id: { doctor_id: profile.id, patient_id: patientId } },
  })
  if (!access) return { error: "No autorizado" }

  try {
    await prisma.patients.update({
      where: { id: patientId },
      data: {
        full_name: data.fullName,
        id_number: data.idNumber || null,
        date_of_birth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender || null,
        blood_type: data.bloodType || null,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
      },
    })
    return {}
  } catch (err) {
    console.error("updatePatient error:", err)
    return { error: "Error al actualizar el paciente" }
  }
}

export async function saveTreatmentPlan(
  medicalHistoryId: string,
  items: TreatmentItem[],
  payments: TreatmentPayment[]
): Promise<{ error?: string }> {
  const profile = await getProfile()
  if (!profile) return { error: "No autorizado" }
  if (!(await verifyOwnership(medicalHistoryId, profile.id))) return { error: "No autorizado" }

  try {
    // Replace items
    await prisma.treatment_items.deleteMany({ where: { medical_history_id: medicalHistoryId } })
    for (const item of items) {
      if (item.description) {
        await prisma.treatment_items.create({
          data: {
            medical_history_id: medicalHistoryId,
            item_number: item.itemNumber,
            description: item.description,
            cost: new Prisma.Decimal(item.cost || 0),
          },
        })
      }
    }

    // Replace payments
    await prisma.treatment_payments.deleteMany({ where: { medical_history_id: medicalHistoryId } })
    for (const p of payments) {
      if (p.clinicalActivity && p.date) {
        await prisma.treatment_payments.create({
          data: {
            medical_history_id: medicalHistoryId,
            payment_date: new Date(p.date),
            tooth_unit: p.toothUnit || null,
            clinical_activity: p.clinicalActivity,
            cost: new Prisma.Decimal(p.cost || 0),
            payment: new Prisma.Decimal(p.payment || 0),
          },
        })
      }
    }

    return {}
  } catch (err) {
    console.error("saveTreatmentPlan error:", err)
    return { error: "Error al guardar plan de tratamiento" }
  }
}
