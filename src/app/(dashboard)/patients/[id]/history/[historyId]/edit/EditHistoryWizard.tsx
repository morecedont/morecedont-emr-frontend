"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import EditProgressBar from "./components/EditProgressBar"
import Step3MedicalBackground from "@/app/(dashboard)/patients/new/steps/Step3MedicalBackground"
import Step4DentalExam from "@/app/(dashboard)/patients/new/steps/Step4DentalExam"
import Step5Endodontics from "@/app/(dashboard)/patients/new/steps/Step5Endodontics"
import Step6TreatmentPlan from "@/app/(dashboard)/patients/new/steps/Step6TreatmentPlan"
import type { MedicalBackgroundData } from "@/lib/actions/patients"
import type { ToothRecord } from "@/lib/actions/patients"
import type { ExamFormData } from "@/app/(dashboard)/patients/new/steps/Step4DentalExam"
import type { InitialEndoData } from "@/app/(dashboard)/patients/new/steps/Step5Endodontics"
import type { ItemRow, PaymentRow } from "@/app/(dashboard)/patients/new/steps/Step6TreatmentPlan"

export type EditHistoryWizardProps = {
  historyId: string
  patientId: string
  doctorId: string
  currency: string
  medicalBackground: MedicalBackgroundData | null
  dentalExam: ExamFormData | null
  toothRecords: ToothRecord[]
  firstEndoRecord: InitialEndoData | null
  treatmentItems: ItemRow[]
  treatmentPayments: PaymentRow[]
}

export default function EditHistoryWizard({
  historyId,
  patientId,
  doctorId,
  currency,
  medicalBackground,
  dentalExam,
  toothRecords,
  firstEndoRecord,
  treatmentItems,
  treatmentPayments,
}: EditHistoryWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)

  // Store incoming props in state so they are stable references for step initializers
  const [bgData] = useState(medicalBackground)
  const [examData] = useState(dentalExam)
  const [toothData] = useState(toothRecords)
  const [endoData] = useState(firstEndoRecord)
  const [itemsData] = useState(treatmentItems)
  const [paymentsData] = useState(treatmentPayments)

  const historyUrl = `/patients/${patientId}/history/${historyId}`

  function handleCancel() {
    router.push(historyUrl)
  }

  function handleSaveAndExit() {
    router.push(historyUrl)
  }

  function handleComplete() {
    router.push(historyUrl)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header with cancel */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-on-surface tracking-tight">Editar historia clínica</h1>
          <p className="text-sm text-secondary mt-0.5">Los cambios se guardan por paso.</p>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          className="h-9 px-4 flex items-center gap-2 text-sm font-semibold text-secondary border border-outline-variant/30 rounded-lg hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
          Cancelar
        </button>
      </div>

      <EditProgressBar currentStep={step} />

      {step === 1 && (
        <Step3MedicalBackground
          medicalHistoryId={historyId}
          patientId={patientId}
          initialData={bgData ?? undefined}
          onNext={() => setStep(2)}
          onBack={handleCancel}
          onSaveAndExit={handleSaveAndExit}
        />
      )}

      {step === 2 && (
        <Step4DentalExam
          medicalHistoryId={historyId}
          patientId={patientId}
          initialData={examData ?? undefined}
          initialToothRecords={toothData}
          onSaveAndExit={handleSaveAndExit}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <Step5Endodontics
          medicalHistoryId={historyId}
          patientId={patientId}
          initialData={endoData ? { ...endoData, endodontic_canals: endoData.endodontic_canals ?? [] } : undefined}
          onSaveAndExit={handleSaveAndExit}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
          onSkip={() => setStep(4)}
        />
      )}

      {step === 4 && (
        <Step6TreatmentPlan
          medicalHistoryId={historyId}
          patientId={patientId}
          doctorId={doctorId}
          currency={currency}
          initialItems={itemsData.length > 0 ? itemsData : undefined}
          initialPayments={paymentsData.length > 0 ? paymentsData : undefined}
          onComplete={handleComplete}
          onBack={() => setStep(3)}
        />
      )}
    </div>
  )
}
