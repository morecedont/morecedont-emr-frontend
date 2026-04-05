"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { formatDistanceToNow } from "date-fns"
import type { PatientAttachmentRecord, AttachmentRecord } from "@/lib/actions/attachments"
import FilePreviewModal from "@/components/shared/FilePreviewModal"
import { getFileCategory } from "@/lib/storage-utils"

type FilterType = "all" | "image" | "pdf" | "dicom"

interface Props {
  patient: { id: string; full_name: string }
  attachments: PatientAttachmentRecord[]
  patientId: string
}

export default function PatientFilesGallery({ patient, attachments, patientId }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")
  const [previewFile, setPreviewFile] = useState<PatientAttachmentRecord | null>(null)
  const [previewFiles, setPreviewFiles] = useState<PatientAttachmentRecord[]>([])

  const filteredAttachments = useMemo(() => {
    if (activeFilter === "all") return attachments
    return attachments.filter(
      (a) => getFileCategory(a.fileType, a.fileName) === activeFilter
    )
  }, [attachments, activeFilter])

  const groupedByHistory = useMemo(() => {
    const groups: Record<
      string,
      {
        historyId: string
        historyCreatedAt: string
        clinicName: string | null
        files: PatientAttachmentRecord[]
      }
    > = {}

    filteredAttachments.forEach((att) => {
      if (!groups[att.historyId]) {
        groups[att.historyId] = {
          historyId: att.historyId,
          historyCreatedAt: att.historyCreatedAt,
          clinicName: att.clinicName,
          files: [],
        }
      }
      groups[att.historyId].files.push(att)
    })

    return Object.values(groups).sort(
      (a, b) =>
        new Date(b.historyCreatedAt).getTime() -
        new Date(a.historyCreatedAt).getTime()
    )
  }, [filteredAttachments])

  const uniqueHistoryCount = useMemo(() => {
    const ids = new Set(attachments.map((a) => a.historyId))
    return ids.size
  }, [attachments])

  function openPreview(file: PatientAttachmentRecord, groupFiles: PatientAttachmentRecord[]) {
    setPreviewFile(file)
    setPreviewFiles(groupFiles)
  }

  const filterLabels: { key: FilterType; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "image", label: "Imágenes" },
    { key: "pdf", label: "PDFs" },
    { key: "dicom", label: "DICOM" },
  ]

  return (
    <div className="min-h-screen bg-surface-container-low">
      <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <nav className="flex items-center gap-1.5 text-xs font-medium text-secondary flex-wrap">
          <Link href="/patients" className="hover:text-[#4C6FFF] transition-colors">
            Pacientes
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link
            href={`/patients/${patientId}`}
            className="hover:text-[#4C6FFF] transition-colors truncate max-w-[120px]"
          >
            {patient.full_name}
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface font-semibold">Archivos</span>
        </nav>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-on-surface">
            Archivos de {patient.full_name}
          </h1>
          {attachments.length > 0 && (
            <p className="text-sm text-secondary mt-1">
              {attachments.length} {attachments.length === 1 ? "archivo" : "archivos"} en{" "}
              {uniqueHistoryCount}{" "}
              {uniqueHistoryCount === 1 ? "historia clínica" : "historias clínicas"}
            </p>
          )}
        </div>

        {/* Filters + empty state */}
        {attachments.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <span className="material-symbols-outlined text-[52px] text-secondary/30">
              attach_file
            </span>
            <p className="text-base font-semibold text-on-surface">
              Este paciente no tiene archivos adjuntos
            </p>
            <p className="text-sm text-secondary max-w-sm">
              Los archivos se adjuntan desde dentro de cada historia clínica
            </p>
            <Link
              href={`/patients/${patientId}`}
              className="mt-2 h-10 px-5 inline-flex items-center gap-2 bg-[#4C6FFF] text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-[#3B5EEE] transition-colors"
            >
              Ver historias
            </Link>
          </div>
        ) : (
          <>
            {/* Filter row */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {filterLabels.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                    activeFilter === key
                      ? "bg-[#4C6FFF] text-white"
                      : "bg-[#E6EAF5] text-[#6B7280] hover:bg-[#d5dcf0]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* No results for filter */}
            {groupedByHistory.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-16 text-center">
                <span className="material-symbols-outlined text-[44px] text-secondary/30">
                  filter_list
                </span>
                <p className="text-sm font-semibold text-on-surface">
                  No hay archivos de tipo{" "}
                  {filterLabels.find((f) => f.key === activeFilter)?.label.toLowerCase()} para este paciente
                </p>
                <button
                  onClick={() => setActiveFilter("all")}
                  className="h-9 px-4 text-sm font-semibold text-[#4C6FFF] border border-[#4C6FFF]/30 rounded-xl hover:bg-[#4C6FFF]/5 transition-colors"
                >
                  Ver todos
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {groupedByHistory.map((group) => (
                  <div key={group.historyId}>
                    {/* Group header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className="text-sm font-semibold text-[#1E1E2F]">
                          Historia Clínica —{" "}
                          {format(new Date(group.historyCreatedAt), "MMM yyyy", { locale: es })}
                        </span>
                        {group.clinicName && (
                          <span className="bg-[#E6EAF5] text-[#6B7280] text-xs px-2 py-0.5 rounded-full">
                            {group.clinicName}
                          </span>
                        )}
                        <span className="text-xs text-[#9CA3AF]">
                          {group.files.length}{" "}
                          {group.files.length === 1 ? "archivo" : "archivos"}
                        </span>
                      </div>
                      <Link
                        href={`/patients/${patientId}/history/${group.historyId}`}
                        className="text-xs text-[#4C6FFF] hover:underline flex items-center gap-1 self-start sm:self-auto"
                      >
                        Ver historia
                        <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                      </Link>
                    </div>

                    {/* File grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                      {group.files.map((file) => {
                        const category = getFileCategory(file.fileType, file.fileName)

                        return (
                          <button
                            key={file.id}
                            onClick={() => openPreview(file, group.files)}
                            className="group bg-white rounded-xl border border-outline-variant/10 overflow-hidden flex flex-col text-left hover:shadow-md hover:scale-[1.02] transition-all duration-150"
                          >
                            {/* Thumbnail */}
                            <div className="aspect-square relative overflow-hidden">
                              {category === "image" && file.signedUrl ? (
                                <img
                                  src={file.signedUrl}
                                  alt={file.fileName}
                                  className="w-full h-full object-cover"
                                />
                              ) : category === "pdf" ? (
                                <div className="w-full h-full bg-[#E6EAF5] flex flex-col items-center justify-center gap-2">
                                  <span className="material-symbols-outlined text-[#4C6FFF] text-[40px]">
                                    picture_as_pdf
                                  </span>
                                  <span className="text-xs font-bold text-[#4C6FFF] uppercase tracking-widest">
                                    PDF
                                  </span>
                                </div>
                              ) : category === "dicom" ? (
                                <div className="w-full h-full bg-[#2E3A59] flex flex-col items-center justify-center gap-2">
                                  <span className="material-symbols-outlined text-white/70 text-[40px]">
                                    biotech
                                  </span>
                                  <span className="text-xs font-bold text-white/70 uppercase tracking-widest">
                                    DICOM
                                  </span>
                                </div>
                              ) : (
                                <div className="w-full h-full bg-surface-container flex flex-col items-center justify-center gap-2">
                                  <span className="material-symbols-outlined text-secondary text-[40px]">
                                    draft
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="p-2.5">
                              <p className="text-xs font-semibold text-on-surface truncate">
                                {file.fileName}
                              </p>
                              <p className="text-[11px] text-secondary mt-0.5">
                                {formatDistanceToNow(new Date(file.uploadedAt), {
                                  addSuffix: true,
                                  locale: es,
                                })}
                              </p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <FilePreviewModal
        isOpen={!!previewFile}
        file={previewFile as AttachmentRecord | null}
        allFiles={previewFiles as AttachmentRecord[]}
        onClose={() => setPreviewFile(null)}
        onNavigate={(f) => {
          const found = previewFiles.find((pf) => pf.id === f.id)
          if (found) setPreviewFile(found)
        }}
      />
    </div>
  )
}
