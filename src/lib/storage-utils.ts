// Pure utility functions safe to import from both server and client components

export const STORAGE_BUCKET = "clinical-records"

// Build storage path
export function buildStoragePath(
  doctorId: string,
  patientId: string,
  historyId: string,
  filename: string
): string {
  const sanitized = filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .toLowerCase()
  return `${doctorId}/${patientId}/${historyId}/${Date.now()}_${sanitized}`
}

// Determine file type from MIME type or extension
export function getFileCategory(
  mimeType: string,
  filename: string
): "image" | "pdf" | "dicom" | "other" {
  if (mimeType.startsWith("image/")) return "image"
  if (mimeType === "application/pdf") return "pdf"
  if (
    mimeType === "application/dicom" ||
    filename.toLowerCase().endsWith(".dcm")
  )
    return "dicom"
  return "other"
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
