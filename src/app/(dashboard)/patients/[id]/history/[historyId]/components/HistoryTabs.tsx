"use client"

import { useState } from "react"
import MedicalBackgroundTab from "./tabs/MedicalBackgroundTab"
import DentalExamTab, { type DentalExamData, type DentalExamTabProps } from "./tabs/DentalExamTab"
import EndodonticsTab, { type EndoRecord } from "./tabs/EndodonticsTab"
import TreatmentPlanTab, { type TreatmentItem, type TreatmentPayment } from "./tabs/TreatmentPlanTab"
import AttachmentsTab from "./tabs/AttachmentsTab"
import { type ToothRecord } from "@/components/shared/Odontogram"

type BgData = Parameters<typeof MedicalBackgroundTab>[0]["bg"]

export type HistoryTabsData = {
  historyId: string
  patientId: string
  doctorId: string
  currency: string
  bg: BgData
  exam: DentalExamData
  toothRecords: ToothRecord[]
  endoRecords: EndoRecord[]
  items: TreatmentItem[]
  payments: TreatmentPayment[]
}

const TABS = [
  { key: "bg", label: "Antecedentes Médicos", icon: "medical_information" },
  { key: "exam", label: "Examen Clínico", icon: "search" },
  { key: "endo", label: "Endodoncia", icon: "dentistry" },
  { key: "plan", label: "Plan de Tratamiento", icon: "assignment" },
  { key: "archivos", label: "Archivos", icon: "attach_file" },
] as const

type TabKey = typeof TABS[number]["key"]

export default function HistoryTabs({ data }: { data: HistoryTabsData }) {
  const [active, setActive] = useState<TabKey>("bg")

  return (
    <div className="pb-12">
      {/* Tab bar */}
      <div className="bg-surface border-b border-outline/10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-none gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActive(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  active === tab.key
                    ? "border-sidebar-active text-sidebar-active font-bold"
                    : "border-transparent text-secondary hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {active === "bg" && (
          <MedicalBackgroundTab
            bg={data.bg}
            patientId={data.patientId}
            historyId={data.historyId}
          />
        )}
        {active === "exam" && (
          <DentalExamTab
            exam={data.exam}
            toothRecords={data.toothRecords}
            patientId={data.patientId}
            historyId={data.historyId}
          />
        )}
        {active === "endo" && (
          <EndodonticsTab
            records={data.endoRecords}
            patientId={data.patientId}
            historyId={data.historyId}
          />
        )}
        {active === "plan" && (
          <TreatmentPlanTab
            items={data.items}
            payments={data.payments}
            currency={data.currency}
            historyId={data.historyId}
          />
        )}
        {active === "archivos" && (
          <AttachmentsTab
            historyId={data.historyId}
            patientId={data.patientId}
            doctorId={data.doctorId}
            canDelete={true}
          />
        )}
      </div>
    </div>
  )
}
