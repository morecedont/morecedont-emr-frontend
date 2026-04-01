"use client"

import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export type AlertData = {
  hasAllergy: boolean
  hasEasyBleeding: boolean
  createdAt: string | null
}

export type AttachmentData = {
  id: string
  fileName: string
  fileType: string | null
  uploadedAt: string
}

interface PatientAlertsDocumentsProps {
  alerts: AlertData
  attachments: AttachmentData[]
}

export default function PatientAlertsDocuments({ alerts, attachments }: PatientAlertsDocumentsProps) {
  const hasAlerts = alerts.hasAllergy || alerts.hasEasyBleeding

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Alerts card */}
      <div className="bg-white rounded-xl border border-outline-variant/10 p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-error text-[18px]">warning</span>
          <p className="text-[10px] font-bold uppercase tracking-widest text-error">Alertas</p>
        </div>

        {!hasAlerts ? (
          <p className="text-sm text-secondary">Sin alertas registradas</p>
        ) : (
          <div className="space-y-2">
            {alerts.hasAllergy && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full uppercase tracking-wide mr-2">
                <span className="material-symbols-outlined text-[12px]">warning</span>
                Alergia confirmada
              </span>
            )}
            {alerts.hasEasyBleeding && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 text-xs font-bold rounded-full uppercase tracking-wide">
                <span className="material-symbols-outlined text-[12px]">water_drop</span>
                Sangrado fácil
              </span>
            )}
            {alerts.createdAt && (
              <p className="text-xs text-secondary mt-2">
                Registrado{" "}
                {formatDistanceToNow(new Date(alerts.createdAt), { addSuffix: true, locale: es })}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Documents card */}
      <div className="bg-white rounded-xl border border-outline-variant/10 p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-secondary text-[18px]">attach_file</span>
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">Documentos</p>
        </div>

        {attachments.length === 0 ? (
          <p className="text-sm text-secondary">Sin documentos adjuntos</p>
        ) : (
          <div className="space-y-2">
            {attachments.map((a) => (
              <div key={a.id} className="flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-[16px] text-secondary shrink-0">
                  description
                </span>
                <span className="text-on-surface truncate">{a.fileName}</span>
              </div>
            ))}
            <a
              href="#"
              className="inline-flex items-center gap-1 text-xs font-semibold text-sidebar-active hover:underline mt-2"
            >
              Ver archivos recientes
              <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
