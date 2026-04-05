"use client"

import { useEffect } from "react"
import type { AttachmentRecord } from "@/lib/actions/attachments"
import { getFileCategory } from "@/lib/storage-utils"

interface FilePreviewModalProps {
  isOpen: boolean
  file: AttachmentRecord | null
  allFiles?: AttachmentRecord[]
  onClose: () => void
  onNavigate?: (file: AttachmentRecord) => void
}

export default function FilePreviewModal({
  isOpen,
  file,
  allFiles,
  onClose,
  onNavigate,
}: FilePreviewModalProps) {
  useEffect(() => {
    if (!isOpen) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") navigatePrev()
      if (e.key === "ArrowRight") navigateNext()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [isOpen, file, allFiles]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen || !file) return null

  const category = getFileCategory(file.fileType, file.fileName)
  const previewableFiles = allFiles?.filter((f) => {
    const cat = getFileCategory(f.fileType, f.fileName)
    return cat === "image" || cat === "pdf"
  })
  const currentIndex = previewableFiles?.findIndex((f) => f.id === file.id) ?? -1
  const hasPrev = currentIndex > 0
  const hasNext =
    previewableFiles !== undefined && currentIndex < previewableFiles.length - 1

  function navigatePrev() {
    if (!hasPrev || !previewableFiles || !onNavigate) return
    onNavigate(previewableFiles[currentIndex - 1])
  }

  function navigateNext() {
    if (!hasNext || !previewableFiles || !onNavigate) return
    onNavigate(previewableFiles[currentIndex + 1])
  }

  function handleDownload() {
    if (!file?.signedUrl) return
    const a = document.createElement("a")
    a.href = file.signedUrl
    a.download = file.fileName
    a.click()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-outline-variant/10 shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-sm font-bold text-on-surface truncate">
              {file.fileName}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {file.signedUrl && (
              <button
                onClick={handleDownload}
                className="h-9 px-3 flex items-center gap-1.5 text-xs font-semibold text-secondary border border-outline-variant/30 rounded-lg hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">
                  download
                </span>
                <span className="hidden sm:inline">Descargar</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="h-9 w-9 flex items-center justify-center text-secondary hover:bg-surface-container rounded-lg transition-colors"
              aria-label="Cerrar"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto flex items-center justify-center bg-surface-container-lowest min-h-0">
          {category === "image" && file.signedUrl && (
            <img
              src={file.signedUrl}
              alt={file.fileName}
              className="max-w-full max-h-[80vh] object-contain"
            />
          )}

          {category === "pdf" && file.signedUrl && (
            <iframe
              src={file.signedUrl}
              title={file.fileName}
              className="w-full h-[80vh] border-0"
            />
          )}

          {category === "dicom" && (
            <div className="flex flex-col items-center gap-4 p-8 text-center">
              <span className="material-symbols-outlined text-[48px] text-secondary">
                biotech
              </span>
              <p className="text-sm font-semibold text-on-surface">
                Los archivos DICOM requieren software especializado.
              </p>
              <p className="text-xs text-secondary">
                Descarga el archivo para visualizarlo con tu visor DICOM.
              </p>
              {file.signedUrl && (
                <button
                  onClick={handleDownload}
                  className="h-11 px-6 flex items-center gap-2 bg-sidebar-active text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 hover:bg-sidebar-active/90 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    download
                  </span>
                  Descargar DICOM
                </button>
              )}
            </div>
          )}

          {!file.signedUrl && (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
              <span className="material-symbols-outlined text-[48px] text-secondary">
                broken_image
              </span>
              <p className="text-sm text-secondary">
                No se pudo cargar la previsualización
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        {(hasPrev || hasNext) && (
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-outline-variant/10 shrink-0">
            <button
              onClick={navigatePrev}
              disabled={!hasPrev}
              className="h-9 px-3 flex items-center gap-1.5 text-xs font-semibold text-secondary border border-outline-variant/30 rounded-lg hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[16px]">
                arrow_back
              </span>
              Anterior
            </button>
            <span className="text-xs text-secondary">
              {currentIndex + 1} / {previewableFiles?.length}
            </span>
            <button
              onClick={navigateNext}
              disabled={!hasNext}
              className="h-9 px-3 flex items-center gap-1.5 text-xs font-semibold text-secondary border border-outline-variant/30 rounded-lg hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente
              <span className="material-symbols-outlined text-[16px]">
                arrow_forward
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
