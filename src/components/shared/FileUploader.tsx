"use client"

import { useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { buildStoragePath, getFileCategory, formatFileSize } from "@/lib/storage-utils"
import { saveAttachment, type AttachmentRecord } from "@/lib/actions/attachments"

const MAX_SIZE = 150 * 1024 * 1024 // 150 MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/dicom",
  "application/octet-stream",
]

type FileState = {
  file: File
  progress: number
  status: "pending" | "uploading" | "done" | "error"
  error?: string
}

interface FileUploaderProps {
  medicalHistoryId: string
  patientId: string
  doctorId: string
  onUploadComplete: (attachment: AttachmentRecord) => void
}

export default function FileUploader({
  medicalHistoryId,
  patientId,
  doctorId,
  onUploadComplete,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [fileStates, setFileStates] = useState<FileState[]>([])

  function setFileStatus(
    index: number,
    update: Partial<Omit<FileState, "file">>
  ) {
    setFileStates((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...update } : f))
    )
  }

  async function processFiles(files: File[]) {
    const newStates: FileState[] = files.map((f) => ({
      file: f,
      progress: 0,
      status: "pending",
    }))
    setFileStates((prev) => [...prev, ...newStates])

    const startIndex = fileStates.length

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const idx = startIndex + i

      const isDicom = file.name.toLowerCase().endsWith(".dcm")

      if (file.size > MAX_SIZE) {
        setFileStatus(idx, {
          status: "error",
          error: `Supera el límite de 150 MB`,
        })
        continue
      }

      if (!ALLOWED_TYPES.includes(file.type) && !isDicom) {
        setFileStatus(idx, {
          status: "error",
          error: "Tipo de archivo no permitido",
        })
        continue
      }

      setFileStatus(idx, { status: "uploading", progress: 10 })

      const path = buildStoragePath(doctorId, patientId, medicalHistoryId, file.name)
      const supabase = createClient()

      const { error: uploadError } = await supabase.storage
        .from("clinical-records")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || "application/octet-stream",
        })

      if (uploadError) {
        setFileStatus(idx, { status: "error", error: uploadError.message })
        continue
      }

      setFileStatus(idx, { progress: 80 })

      const result = await saveAttachment({
        medicalHistoryId,
        patientId,
        fileUrl: path,
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
        category: getFileCategory(file.type, file.name),
      })

      if (result.error) {
        setFileStatus(idx, { status: "error", error: result.error })
        continue
      }

      setFileStatus(idx, { status: "done", progress: 100 })

      if (result.attachment) {
        onUploadComplete(result.attachment)
      }
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) processFiles(files)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length > 0) processFiles(files)
    e.target.value = ""
  }

  return (
    <div className="bg-white rounded-xl border border-outline-variant/10 p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-secondary text-[18px]">
          attach_file
        </span>
        <p className="text-sm font-bold text-on-surface">Subir archivos</p>
      </div>

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`rounded-lg border-2 border-dashed p-4 sm:p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
          isDragging
            ? "border-[#4C6FFF] bg-[#F0F4FF]"
            : "border-[#E6EAF5] hover:border-[#4C6FFF]/50 hover:bg-surface-container-low"
        }`}
      >
        <span className="material-symbols-outlined text-secondary text-[32px]">
          cloud_upload
        </span>
        <p className="text-sm font-semibold text-on-surface text-center">
          Arrastra archivos aquí
        </p>
        <p className="text-xs text-secondary text-center">
          o haz clic para seleccionar
        </p>
        <p className="text-xs text-secondary text-center mt-1">
          JPG, PNG, PDF, DCM — máx. 150 MB
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,application/pdf,.dcm"
        onChange={handleChange}
        className="sr-only"
      />

      {/* File list */}
      {fileStates.length > 0 && (
        <div className="space-y-2">
          {fileStates.map((fs, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg bg-surface-container-low"
            >
              <span
                className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${
                  fs.status === "done"
                    ? "text-green-600"
                    : fs.status === "error"
                    ? "text-error"
                    : "text-secondary"
                }`}
              >
                {fs.status === "done"
                  ? "check_circle"
                  : fs.status === "error"
                  ? "cancel"
                  : "draft"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">
                  {fs.file.name}
                </p>
                <p className="text-xs text-secondary">
                  {formatFileSize(fs.file.size)}
                </p>

                {fs.status === "uploading" && (
                  <div className="mt-1.5">
                    <div className="h-1.5 rounded-full bg-[#E6EAF5] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#4C6FFF] transition-all duration-300"
                        style={{ width: `${fs.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-secondary mt-1">
                      Subiendo... {fs.progress}%
                    </p>
                  </div>
                )}

                {fs.status === "done" && (
                  <p className="text-xs text-green-600 mt-0.5">
                    Subido correctamente
                  </p>
                )}

                {fs.status === "error" && (
                  <p className="text-xs text-error mt-0.5">
                    Error: {fs.error}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
