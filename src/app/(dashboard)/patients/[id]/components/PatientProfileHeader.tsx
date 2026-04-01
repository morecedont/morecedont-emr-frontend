"use client"

import { useState } from "react"
import Link from "next/link"
import PatientAvatar from "@/components/shared/PatientAvatar"
import SharePatientModal from "../../components/SharePatientModal"

export type PatientHeaderData = {
  id: string
  fullName: string
  age: number | null
  bloodType: string | null
  phone: string | null
  isActive: boolean
}

interface PatientProfileHeaderProps {
  patient: PatientHeaderData
}

export default function PatientProfileHeader({ patient }: PatientProfileHeaderProps) {
  const [showShare, setShowShare] = useState(false)

  return (
    <>
      <section className="bg-[#E6EAF5] rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4 sm:gap-5">
          <PatientAvatar
            fullName={patient.fullName}
            size="xl"
            showStatusDot
            isActive={patient.isActive}
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight">
              {patient.fullName}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {patient.age !== null && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/60 rounded-full border border-white/40 text-xs font-semibold text-secondary">
                  <span className="material-symbols-outlined text-[12px]">cake</span>
                  {patient.age} años
                </span>
              )}
              {patient.bloodType && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/60 rounded-full border border-white/40 text-xs font-semibold text-secondary">
                  <span className="material-symbols-outlined text-[12px] text-primary">bloodtype</span>
                  {patient.bloodType}
                </span>
              )}
              {patient.phone && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/60 rounded-full border border-white/40 text-xs font-semibold text-secondary">
                  <span className="material-symbols-outlined text-[12px]">call</span>
                  {patient.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowShare(true)}
            className="h-10 px-4 flex items-center gap-2 bg-white/80 border border-white/60 rounded-lg text-sm font-semibold text-on-surface hover:bg-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">share</span>
            <span className="hidden sm:inline">Compartir expediente</span>
          </button>
          <Link
            href={`/patients/${patient.id}/history/new`}
            className="h-10 px-4 flex items-center gap-2 bg-sidebar-active text-white rounded-lg text-sm font-bold hover:bg-sidebar-active/90 transition-colors shadow-lg shadow-blue-500/20"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="hidden sm:inline">Nueva historia clínica</span>
          </Link>
        </div>
      </section>

      {showShare && (
        <SharePatientModal
          patientId={patient.id}
          patientName={patient.fullName}
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  )
}
