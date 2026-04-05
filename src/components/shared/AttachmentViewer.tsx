"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import type { AttachmentRecord } from "@/lib/actions/attachments"
import { getFileCategory } from "@/lib/storage-utils"
import { deleteAttachment } from "@/lib/actions/attachments"
import FilePreviewModal from "./FilePreviewModal"

interface AttachmentViewerProps {
  attachments: AttachmentRecord[]
  patientId: string
  canDelete: boolean
  onDelete: (attachmentId: string) => void
}

export default function AttachmentViewer({
  attachments,
  patientId,
  canDelete,
  onDelete,
}: AttachmentViewerProps) {
  const [previewFile, setPreviewFile] = useState<AttachmentRecord | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const previewableFiles = attachments.filter((a) => {
    const cat = getFileCategory(a.fileType, a.fileName)
    return cat === "image" || cat === "pdf"
  })

  async function handleDelete(attachmentId: string) {
    setDeleting(attachmentId)
    const result = await deleteAttachment(attachmentId, patientId)
    setDeleting(null)
    setConfirmDelete(null)
    if (!result.error) {
      onDelete(attachmentId)
    }
  }

  function handleDownload(file: AttachmentRecord) {
    if (!file.signedUrl) return
    const a = document.createElement("a")
    a.href = file.signedUrl
    a.download = file.fileName
    a.click()
  }

  if (attachments.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <span className="material-symbols-outlined text-[36px] text-secondary/40">
          attach_file
        </span>
        <p className="text-sm font-semibold text-secondary">
          Sin archivos adjuntos
        </p>
        <p className="text-xs text-secondary/70">
          Sube radiografías, informes o imágenes del tratamiento
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {attachments.map((attachment) => {
          const category = getFileCategory(attachment.fileType, attachment.fileName)
          const isPreviewable = category === "image" || category === "pdf"
          const isConfirming = confirmDelete === attachment.id
          const isDeleting = deleting === attachment.id

          return (
            <div
              key={attachment.id}
              className="bg-white rounded-xl border border-outline-variant/10 overflow-hidden flex flex-col"
            >
              {/* Thumbnail / Icon area */}
              <div className="aspect-square relative overflow-hidden">
                {category === "image" && attachment.signedUrl ? (
                  <img
                    src={attachment.signedUrl}
                    alt={attachment.fileName}
                    className="w-full h-full object-cover"
                  />
                ) : category === "pdf" ? (
                  <div className="w-full h-full bg-[#E6EAF5] flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[#4C6FFF] text-[48px]">
                      picture_as_pdf
                    </span>
                    <span className="text-xs font-bold text-[#4C6FFF] uppercase tracking-widest">
                      PDF
                    </span>
                  </div>
                ) : category === "dicom" ? (
                  <div className="w-full h-full bg-[#2E3A59] flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-white/70 text-[48px]">
                      biotech
                    </span>
                    <span className="text-xs font-bold text-white/70 uppercase tracking-widest">
                      DICOM
                    </span>
                  </div>
                ) : (
                  <div className="w-full h-full bg-surface-container flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[48px]">
                      draft
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3 flex-1 flex flex-col gap-1">
                <p className="text-sm font-semibold text-on-surface truncate">
                  {attachment.fileName}
                </p>
                <p className="text-xs text-secondary">
                  {formatDistanceToNow(new Date(attachment.uploadedAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </p>
              </div>

              {/* Actions */}
              <div className="px-3 pb-3">
                {isConfirming ? (
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-error flex-1">¿Eliminar archivo?</p>
                    <button
                      onClick={() => handleDelete(attachment.id)}
                      disabled={isDeleting}
                      className="h-8 px-3 text-xs font-bold text-white bg-error rounded-lg hover:bg-error/90 transition-colors disabled:opacity-60"
                    >
                      {isDeleting ? "..." : "Sí"}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="h-8 px-3 text-xs font-semibold text-secondary border border-outline-variant/30 rounded-lg hover:bg-surface-container transition-colors"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {isPreviewable && (
                      <button
                        onClick={() => setPreviewFile(attachment)}
                        className="h-9 flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-secondary border border-outline-variant/20 rounded-lg hover:bg-surface-container transition-colors"
                        title="Ver"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          visibility
                        </span>
                        <span>Ver</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDownload(attachment)}
                      disabled={!attachment.signedUrl}
                      className="h-9 flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-secondary border border-outline-variant/20 rounded-lg hover:bg-surface-container transition-colors disabled:opacity-40"
                      title="Descargar"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        download
                      </span>
                      <span>Bajar</span>
                    </button>
                    {canDelete && (
                      <button
                        onClick={() => setConfirmDelete(attachment.id)}
                        className="h-9 w-9 flex items-center justify-center text-error/60 border border-outline-variant/20 rounded-lg hover:bg-error/10 hover:text-error transition-colors"
                        title="Eliminar"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          delete
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <FilePreviewModal
        isOpen={!!previewFile}
        file={previewFile}
        allFiles={previewableFiles}
        onClose={() => setPreviewFile(null)}
        onNavigate={setPreviewFile}
      />
    </>
  )
}
