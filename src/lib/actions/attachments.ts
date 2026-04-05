"use server"

import { prisma } from "@/lib/prisma"
import { getProfile } from "@/lib/session"
import { deleteStorageFile, getSignedUrls } from "@/lib/storage"
import { revalidatePath } from "next/cache"

export type AttachmentRecord = {
  id: string
  fileName: string
  fileType: string
  filePath: string
  signedUrl: string | null
  uploadedAt: string
  description?: string | null
}

// Save attachment metadata to DB after client uploads to storage
export async function saveAttachment(data: {
  medicalHistoryId: string
  patientId: string
  fileUrl: string
  fileName: string
  fileType: string
  fileSize: number
  description?: string
  category: "image" | "pdf" | "dicom" | "other"
}): Promise<{ attachment?: AttachmentRecord; error?: string }> {
  const profile = await getProfile()
  if (!profile) return { error: "No autorizado" }

  const history = await prisma.medical_histories.findUnique({
    where: { id: data.medicalHistoryId },
  })
  if (!history || history.doctor_id !== profile.id) {
    return { error: "No autorizado" }
  }

  const attachment = await prisma.attachments.create({
    data: {
      medical_history_id: data.medicalHistoryId,
      file_url: data.fileUrl,
      file_type: data.fileType,
      description: data.description ?? data.fileName,
    },
  })

  revalidatePath(`/patients/${data.patientId}`)
  revalidatePath(
    `/patients/${data.patientId}/history/${data.medicalHistoryId}`
  )

  return {
    attachment: {
      id: attachment.id,
      fileName: attachment.description ?? data.fileName,
      fileType: attachment.file_type ?? data.fileType,
      filePath: attachment.file_url,
      signedUrl: null,
      uploadedAt: attachment.uploaded_at.toISOString(),
      description: attachment.description,
    },
  }
}

// Get attachments with signed URLs for a history
export async function getAttachmentsWithUrls(
  medicalHistoryId: string
): Promise<{ attachments?: AttachmentRecord[]; error?: string }> {
  const profile = await getProfile()
  if (!profile) return { error: "No autorizado" }

  const history = await prisma.medical_histories.findUnique({
    where: { id: medicalHistoryId },
    include: {
      patients: {
        include: {
          doctor_patients: {
            where: { doctor_id: profile.id },
          },
        },
      },
    },
  })

  if (!history) return { error: "No encontrado" }

  const hasAccess =
    history.doctor_id === profile.id ||
    history.patients.doctor_patients.length > 0

  if (!hasAccess) return { error: "No autorizado" }

  const attachments = await prisma.attachments.findMany({
    where: { medical_history_id: medicalHistoryId },
    orderBy: { uploaded_at: "desc" },
  })

  const filePaths = attachments.map((a) => a.file_url)
  const signedUrls = await getSignedUrls(filePaths)

  return {
    attachments: attachments.map((a) => ({
      id: a.id,
      fileName: a.description ?? "Archivo",
      fileType: a.file_type ?? "",
      filePath: a.file_url,
      signedUrl: signedUrls[a.file_url] ?? null,
      uploadedAt: a.uploaded_at.toISOString(),
      description: a.description,
    })),
  }
}

// Delete attachment — removes from DB and storage
export async function deleteAttachment(
  attachmentId: string,
  patientId: string
): Promise<{ success?: boolean; error?: string }> {
  const profile = await getProfile()
  if (!profile) return { error: "No autorizado" }

  const attachment = await prisma.attachments.findUnique({
    where: { id: attachmentId },
    include: { medical_histories: true },
  })

  if (!attachment) return { error: "No encontrado" }
  if (attachment.medical_histories.doctor_id !== profile.id) {
    return { error: "Solo el doctor que subió el archivo puede eliminarlo" }
  }

  await deleteStorageFile(attachment.file_url)

  await prisma.attachments.delete({ where: { id: attachmentId } })

  revalidatePath(`/patients/${patientId}`)
  revalidatePath(
    `/patients/${patientId}/history/${attachment.medical_history_id}`
  )

  return { success: true }
}
