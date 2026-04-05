"use client"

import { useEffect, useState } from "react"
import FileUploader from "@/components/shared/FileUploader"
import AttachmentViewer from "@/components/shared/AttachmentViewer"
import {
  getAttachmentsWithUrls,
  type AttachmentRecord,
} from "@/lib/actions/attachments"

interface AttachmentsTabProps {
  historyId: string
  patientId: string
  doctorId: string
  canDelete: boolean
}

export default function AttachmentsTab({
  historyId,
  patientId,
  doctorId,
  canDelete,
}: AttachmentsTabProps) {
  const [attachments, setAttachments] = useState<AttachmentRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAttachmentsWithUrls(historyId).then((result) => {
      if (result.attachments) setAttachments(result.attachments)
      setLoading(false)
    })
  }, [historyId])

  function handleUploadComplete(attachment: AttachmentRecord) {
    setAttachments((prev) => [attachment, ...prev])
  }

  function handleDelete(attachmentId: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-secondary text-sm">
          <span className="material-symbols-outlined text-[20px] animate-spin">
            progress_activity
          </span>
          Cargando archivos...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {canDelete && (
        <FileUploader
          medicalHistoryId={historyId}
          patientId={patientId}
          doctorId={doctorId}
          onUploadComplete={handleUploadComplete}
        />
      )}

      <AttachmentViewer
        attachments={attachments}
        patientId={patientId}
        canDelete={canDelete}
        onDelete={handleDelete}
      />
    </div>
  )
}
