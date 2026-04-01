"use client"

import PatientAvatar from "@/components/shared/PatientAvatar"

export type HistoryHeaderData = {
  historyId: string
  patientId: string
  patientName: string
  patientAge: number | null
  bloodType: string | null
  idNumber: string | null
  clinicName: string | null
  createdAt: string
  updatedAt: string
  doctorName: string
  status: "active" | "completed"
}

interface HistoryHeaderProps {
  data: HistoryHeaderData
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export default function HistoryHeader({ data }: HistoryHeaderProps) {
  const isActive = data.status === "active"

  return (
    <>
      <div className="bg-surface border-b border-outline/10 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Left: patient info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <PatientAvatar fullName={data.patientName} size="md" showStatusDot isActive={isActive} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-extrabold text-on-surface text-lg truncate">{data.patientName}</h1>
                {data.patientAge !== null && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-surface-container rounded-full text-xs font-semibold text-secondary">
                    <span className="material-symbols-outlined text-[12px]">cake</span>
                    {data.patientAge} años
                  </span>
                )}
                {data.bloodType && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 rounded-full text-xs font-semibold text-error">
                    <span className="material-symbols-outlined text-[12px]">water_drop</span>
                    {data.bloodType}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {data.clinicName && (
                  <span className="px-2 py-0.5 bg-[#E6EAF5] rounded-full text-xs font-semibold text-sidebar">
                    {data.clinicName}
                  </span>
                )}
                <span className="text-xs text-secondary">
                  Creado {formatDate(data.createdAt)}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                    isActive ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {isActive ? "Activo" : "Completado"}
                </span>
              </div>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 h-9 px-4 text-sm font-semibold text-on-surface border border-outline/20 rounded-lg hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span className="hidden sm:inline">Imprimir</span>
            </button>
            <a
              href={`/patients/${data.patientId}/history/${data.historyId}/edit`}
              className="flex items-center gap-1.5 h-9 px-4 text-sm font-semibold bg-sidebar-active text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              <span className="hidden sm:inline">Editar historia</span>
            </a>
          </div>
        </div>
      </div>

      {/* Footer sync bar */}
      <div className="hidden md:block fixed bottom-0 left-0 right-0 z-40 border-t border-[#E6EAF5] bg-surface/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between text-xs text-secondary">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            SINCRONIZADO
          </span>
          <span className="font-semibold tracking-wide">
            {data.idNumber ? `ID PACIENTE: ${data.idNumber}` : `HISTORIA: ${data.historyId.slice(0, 8).toUpperCase()}`}
          </span>
          <span>
            Última edición: {formatDate(data.updatedAt)} por Dr. {data.doctorName}
          </span>
        </div>
      </div>
    </>
  )
}
