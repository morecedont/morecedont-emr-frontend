import { createClient as createServerClient } from "@/lib/supabase/server"

export const BUCKET = "clinical-records"
const SIGNED_URL_EXPIRY = 3600 // 1 hour in seconds

// Re-export pure utils for convenience in server-only contexts
export { buildStoragePath, getFileCategory, formatFileSize } from "./storage-utils"

// Generate a signed URL for a file (server-side)
export async function getSignedUrl(filePath: string): Promise<string | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(filePath, SIGNED_URL_EXPIRY)
  if (error || !data) return null
  return data.signedUrl
}

// Generate signed URLs for multiple files at once
export async function getSignedUrls(
  filePaths: string[]
): Promise<Record<string, string>> {
  if (filePaths.length === 0) return {}
  const supabase = await createServerClient()
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(filePaths, SIGNED_URL_EXPIRY)
  if (error || !data) return {}
  return Object.fromEntries(
    data
      .filter((item) => item.signedUrl)
      .map((item) => [item.path, item.signedUrl!])
  )
}

// Delete a file from storage
export async function deleteStorageFile(filePath: string): Promise<boolean> {
  const supabase = await createServerClient()
  const { error } = await supabase.storage.from(BUCKET).remove([filePath])
  return !error
}
