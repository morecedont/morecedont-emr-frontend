"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ProgressBar from "./components/ProgressBar"
import Step1PersonalData, { type PersonalFormData } from "./steps/Step1PersonalData"
import Step2EmergencyContact, { type EmergencyFormData } from "./steps/Step2EmergencyContact"
import Step3MedicalBackground from "./steps/Step3MedicalBackground"
import Step4DentalExam from "./steps/Step4DentalExam"
import Step5Endodontics from "./steps/Step5Endodontics"
import Step6TreatmentPlan from "./steps/Step6TreatmentPlan"

interface NewPatientWizardProps {
  doctorId: string
  clinics: { id: string; name: string }[]
}

const EMPTY_PERSONAL: PersonalFormData = {
  fullName: "", idNumber: "", dateOfBirth: "", gender: "",
  bloodType: "", occupation: "", phone: "", email: "", address: "",
}

const EMPTY_EMERGENCY: EmergencyFormData = {
  emergencyContact: "", emergencyPhone: "", lastDentalVisit: "", clinicId: "", currency: "USD",
}

export default function NewPatientWizard({ doctorId, clinics }: NewPatientWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [personalData, setPersonalData] = useState<PersonalFormData>(EMPTY_PERSONAL)
  const [emergencyData, setEmergencyData] = useState<EmergencyFormData>(EMPTY_EMERGENCY)
  const [patientId, setPatientId] = useState<string | null>(null)
  const [medicalHistoryId, setMedicalHistoryId] = useState<string | null>(null)

  function handleStep2Success(pid: string, mhid: string) {
    setPatientId(pid)
    setMedicalHistoryId(mhid)
    setStep(3)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <ProgressBar currentStep={step} />

      {step === 1 && (
        <Step1PersonalData
          data={personalData}
          onChange={setPersonalData}
          onNext={() => setStep(2)}
          onCancel={() => router.push("/patients")}
        />
      )}

      {step === 2 && (
        <Step2EmergencyContact
          data={emergencyData}
          onChange={setEmergencyData}
          personalData={personalData}
          doctorId={doctorId}
          clinics={clinics}
          onNext={handleStep2Success}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && patientId && medicalHistoryId && (
        <Step3MedicalBackground
          medicalHistoryId={medicalHistoryId}
          patientId={patientId}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
          onSaveAndExit={() => router.push(`/patients/${patientId}`)}
        />
      )}

      {step === 4 && patientId && medicalHistoryId && (
        <Step4DentalExam
          medicalHistoryId={medicalHistoryId}
          patientId={patientId}
          onNext={() => setStep(5)}
          onBack={() => setStep(3)}
        />
      )}

      {step === 5 && patientId && medicalHistoryId && (
        <Step5Endodontics
          medicalHistoryId={medicalHistoryId}
          patientId={patientId}
          onNext={() => setStep(6)}
          onBack={() => setStep(4)}
          onSkip={() => setStep(6)}
        />
      )}

      {step === 6 && patientId && medicalHistoryId && (
        <Step6TreatmentPlan
          medicalHistoryId={medicalHistoryId}
          patientId={patientId}
          currency={emergencyData.currency}
          onBack={() => setStep(5)}
        />
      )}
    </div>
  )
}
