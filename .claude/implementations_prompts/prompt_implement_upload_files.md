
---

**Context:**
You are implementing the file upload and viewing feature for Morecedont. Doctors can upload X-rays, PDFs, and DICOM files attached to a specific clinical history. Files are stored in Supabase Storage bucket `clinical-records` with the path structure `{doctorId}/{patientId}/{historyId}/{filename}`. Access for shared patients uses signed URLs that expire in 1 hour. The project uses Next.js 14+ App Router, Supabase Auth, Prisma 6, Tailwind CSS, and TypeScript. Read `DESIGN.md` and `RESPONSIVE.md` before writing any code.

---

**Storage path convention:**
```
clinical-records/
  └── {doctorId}/
        └── {patientId}/
              └── {historyId}/
                    └── {timestamp}_{filename}
```

Filename format: `{Date.now()}_{sanitized_original_name}` — prevents collisions and preserves original name for display.

---

**Files to create:**

**1. `src/lib/storage.ts`** — Storage utility functions:

```ts
import { createServerClient } from '@/lib/supabase/server'
import { createBrowserClient } from '@/lib/supabase/client'

const BUCKET = 'clinical-records'
const SIGNED_URL_EXPIRY = 3600 // 1 hour in seconds

// Build storage path
export function buildStoragePath(
  doctorId: string,
  patientId: string,
  historyId: string,
  filename: string
): string {
  const sanitized = filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .toLowerCase()
  return `${doctorId}/${patientId}/${historyId}/${Date.now()}_${sanitized}`
}

// Generate a signed URL for a file (server-side)
export async function getSignedUrl(filePath: string): Promise<string | null> {
  const supabase = createServerClient()
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
  const supabase = createServerClient()
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(filePaths, SIGNED_URL_EXPIRY)
  if (error || !data) return {}
  return Object.fromEntries(
    data
      .filter(item => item.signedUrl)
      .map(item => [item.path, item.signedUrl])
  )
}

// Delete a file from storage
export async function deleteStorageFile(filePath: string): Promise<boolean> {
  const supabase = createServerClient()
  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([filePath])
  return !error
}

// Determine file type from MIME type or extension
export function getFileCategory(
  mimeType: string,
  filename: string
): 'image' | 'pdf' | 'dicom' | 'other' {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType === 'application/pdf') return 'pdf'
  if (
    mimeType === 'application/dicom' ||
    filename.toLowerCase().endsWith('.dcm')
  ) return 'dicom'
  return 'other'
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
```

---

**2. `src/lib/actions/attachments.ts`** — Server Actions:

```ts
'use server'

import { prisma } from '@/lib/prisma'
import { getProfile } from '@/lib/session'
import { deleteStorageFile, getSignedUrls } from '@/lib/storage'
import { revalidatePath } from 'next/cache'

// Save attachment metadata to DB after client uploads to storage
export async function saveAttachment(data: {
  medicalHistoryId: string
  patientId: string
  fileUrl: string        // storage path, NOT the public URL
  fileName: string       // original filename for display
  fileType: string       // MIME type
  fileSize: number       // bytes
  description?: string
  category: 'image' | 'pdf' | 'dicom' | 'other'
}) {
  const profile = await getProfile()
  if (!profile) return { error: 'No autorizado' }

  // Verify doctor owns the history
  const history = await prisma.medical_histories.findUnique({
    where: { id: data.medicalHistoryId }
  })
  if (!history || history.doctor_id !== profile.id) {
    return { error: 'No autorizado' }
  }

  const attachment = await prisma.attachments.create({
    data: {
      medical_history_id: data.medicalHistoryId,
      file_url: data.fileUrl,        // stores the storage PATH
      file_type: data.fileType,
      description: data.description ?? data.fileName,
    }
  })

  revalidatePath(`/patients/${data.patientId}`)
  revalidatePath(`/patients/${data.patientId}/history/${data.medicalHistoryId}`)

  return { attachment }
}

// Get attachments with signed URLs for a history
export async function getAttachmentsWithUrls(medicalHistoryId: string) {
  const profile = await getProfile()
  if (!profile) return { error: 'No autorizado' }

  // Verify access — either owns or has shared access
  const history = await prisma.medical_histories.findUnique({
    where: { id: medicalHistoryId },
    include: {
      patients: {
        include: {
          doctor_patients: {
            where: { doctor_id: profile.id }
          }
        }
      }
    }
  })

  if (!history) return { error: 'No encontrado' }

  const hasAccess =
    history.doctor_id === profile.id ||
    history.patients.doctor_patients.length > 0

  if (!hasAccess) return { error: 'No autorizado' }

  const attachments = await prisma.attachments.findMany({
    where: { medical_history_id: medicalHistoryId },
    orderBy: { uploaded_at: 'desc' }
  })

  // Generate signed URLs for all files
  const filePaths = attachments.map(a => a.file_url)
  const signedUrls = await getSignedUrls(filePaths)

  return {
    attachments: attachments.map(a => ({
      id: a.id,
      fileName: a.description ?? 'Archivo',
      fileType: a.file_type ?? '',
      filePath: a.file_url,
      signedUrl: signedUrls[a.file_url] ?? null,
      uploadedAt: a.uploaded_at.toISOString(),
      description: a.description
    }))
  }
}

// Delete attachment — removes from DB and storage
export async function deleteAttachment(attachmentId: string, patientId: string) {
  const profile = await getProfile()
  if (!profile) return { error: 'No autorizado' }

  const attachment = await prisma.attachments.findUnique({
    where: { id: attachmentId },
    include: { medical_histories: true }
  })

  if (!attachment) return { error: 'No encontrado' }
  if (attachment.medical_histories.doctor_id !== profile.id) {
    return { error: 'Solo el doctor que subió el archivo puede eliminarlo' }
  }

  // Delete from storage first
  await deleteStorageFile(attachment.file_url)

  // Delete from DB
  await prisma.attachments.delete({ where: { id: attachmentId } })

  revalidatePath(`/patients/${patientId}`)
  revalidatePath(
    `/patients/${patientId}/history/${attachment.medical_history_id}`
  )

  return { success: true }
}
```

---

**3. `src/components/shared/FileUploader.tsx`** — Client Component (`"use client"`):

The upload component used inside the clinical history. Uses the Supabase browser client directly for upload, then calls the server action to save metadata.

```tsx
interface FileUploaderProps {
  medicalHistoryId: string
  patientId: string
  doctorId: string
  onUploadComplete: (attachment: AttachmentRecord) => void
}
```

UI layout:

```
┌─────────────────────────────────────────────┐
│  📎 Subir archivos                          │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │   ☁️  Arrastra archivos aquí         │   │
│  │   o haz clic para seleccionar       │   │
│  │                                     │   │
│  │   JPG, PNG, PDF, DCM — máx. 150 MB  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Seleccionar archivo]                      │
└─────────────────────────────────────────────┘
```

Behavior:
- Drag and drop zone: dashed border `#E6EAF5`, `rounded-lg`, `p-8`
- Drag over state: border `#4C6FFF`, background `#F0F4FF`
- Hidden `<input type="file">` triggered by clicking the zone
- Accepted types: `image/jpeg,image/png,image/webp,application/pdf,.dcm`
- Multiple files allowed — uploads sequentially
- For each file:

**Upload flow:**
```ts
// 1. Build storage path
const path = buildStoragePath(doctorId, patientId, medicalHistoryId, file.name)

// 2. Upload to Supabase Storage via browser client
const supabase = createBrowserClient()
const { error: uploadError } = await supabase.storage
  .from('clinical-records')
  .upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type
  })

if (uploadError) {
  setFileError(file.name, uploadError.message)
  return
}

// 3. Save metadata to DB via server action
const result = await saveAttachment({
  medicalHistoryId,
  patientId,
  fileUrl: path,
  fileName: file.name,
  fileType: file.type || 'application/octet-stream',
  fileSize: file.size,
  category: getFileCategory(file.type, file.name)
})
```

**Per-file progress UI:**
```
[📄] radiografia_periapical.jpg          
     ████████████░░░░ 75%    Subiendo...

[✅] panoramica_2024.pdf                 
     Subido correctamente

[❌] archivo_corrupto.dcm               
     Error: archivo no válido
```

- Progress bar: `#4C6FFF` fill on `#E6EAF5` track
- Success state: green checkmark + filename
- Error state: red `×` + error message
- File size shown below filename in gray

**Client-side validation before upload:**
```ts
const MAX_SIZE = 150 * 1024 * 1024 // 150 MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp',
  'application/pdf', 'application/dicom',
  'application/octet-stream'
]

if (file.size > MAX_SIZE) {
  setError(`${file.name} supera el límite de 150 MB`)
  return
}

const isDicom = file.name.toLowerCase().endsWith('.dcm')
if (!ALLOWED_TYPES.includes(file.type) && !isDicom) {
  setError(`${file.name}: tipo de archivo no permitido`)
  return
}
```

---

**4. `src/components/shared/AttachmentViewer.tsx`** — Client Component:

Displays the list of uploaded files with preview and actions.

```tsx
interface AttachmentViewerProps {
  attachments: AttachmentRecord[]
  patientId: string
  canDelete: boolean  // true only if current doctor owns the history
  onDelete: (attachmentId: string) => void
}

interface AttachmentRecord {
  id: string
  fileName: string
  fileType: string
  filePath: string
  signedUrl: string | null
  uploadedAt: string
  description?: string | null
}
```

UI layout — grid of file cards:

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ [image]      │  │ 📄           │  │ 🔬           │
│              │  │              │  │              │
│ panoramica   │  │ informe.pdf  │  │ rx_periap.dcm│
│ .jpg · 3.2MB │  │ .pdf · 1.1MB│  │ .dcm · 45MB  │
│ Oct 12, 2023 │  │ Oct 10, 2023│  │ Oct 8, 2023  │
│ [👁] [⬇] [🗑]│  │ [👁] [⬇] [🗑]│  │     [⬇] [🗑] │
└──────────────┘  └──────────────┘  └──────────────┘
```

Per-file card behavior:
- **Image files**: show thumbnail using `<img src={signedUrl}>` — `object-cover`, `aspect-square`, `rounded-t-lg`
- **PDF files**: show PDF icon `📄` in `#4C6FFF` on `#E6EAF5` background
- **DICOM files**: show microscope/xray icon `🔬` on dark `#2E3A59` background with "DICOM" label
- **Other**: generic file icon

Action buttons per card:
- 👁 **Ver**: opens `FilePreviewModal` — only for images and PDFs, hidden for DICOM
- ⬇ **Descargar**: triggers download via signed URL — available for all types
- 🗑 **Eliminar**: shown only if `canDelete` is true — opens confirmation before deleting

Empty state:
```
📎 Sin archivos adjuntos
Sube radiografías, informes o imágenes del tratamiento
```

---

**5. `src/components/shared/FilePreviewModal.tsx`** — Client Component:

Full-screen modal for previewing images and PDFs:

```tsx
interface FilePreviewModalProps {
  isOpen: boolean
  file: AttachmentRecord | null
  onClose: () => void
}
```

- **Image preview**: `<img>` centered, max height 80vh, zoom on click (toggle between fit and original size)
- **PDF preview**: `<iframe src={signedUrl}>` or `<embed>` — full width, height 80vh
- **DICOM**: show message "Los archivos DICOM requieren software especializado. Descarga el archivo para visualizarlo." + download button
- Close button top-right: `×` icon
- Keyboard: `Escape` closes modal
- Background overlay: `bg-black/70` backdrop
- Navigation arrows if multiple files in the history — previous/next

---

**6. `src/app/(dashboard)/patients/[id]/history/[historyId]/components/tabs/AttachmentsTab.tsx`** — new tab:

Add a 5th tab "Archivos" to the history detail screen.

Server Component that:
- Calls `getAttachmentsWithUrls(historyId)` server action
- Passes result to Client Components
- Determines `canDelete` — true if `history.doctor_id === profile.id`

```tsx
<div className="space-y-6">
  {/* Upload section — only if current doctor owns the history */}
  {canDelete && (
    <FileUploader
      medicalHistoryId={historyId}
      patientId={patientId}
      doctorId={profile.id}
      onUploadComplete={handleUploadComplete}
    />
  )}

  {/* File grid */}
  <AttachmentViewer
    attachments={attachments}
    patientId={patientId}
    canDelete={canDelete}
    onDelete={handleDelete}
  />
</div>
```

---

**7. Update `HistoryTabs.tsx`** — add the new "Archivos" tab:

```tsx
const tabs = [
  { id: 'antecedentes', label: 'Antecedentes Médicos' },
  { id: 'examen', label: 'Examen Clínico' },
  { id: 'endodoncia', label: 'Endodoncia' },
  { id: 'tratamiento', label: 'Plan de Tratamiento' },
  { id: 'archivos', label: 'Archivos' },  // NEW
]
```

---

**8. Update patient profile `/patients/[id]`:**

Update `PatientAlertsDocuments.tsx` — the documents card should now show real attachments:

```tsx
// Fetch recent attachments across ALL histories of this patient
const attachments = await prisma.attachments.findMany({
  where: {
    medical_histories: {
      patient_id: patientId,
      doctor_id: profile.id  // or shared access
    }
  },
  orderBy: { uploaded_at: 'desc' },
  take: 3,
  include: { medical_histories: true }
})

// Generate signed URLs for the 3 most recent
const signedUrls = await getSignedUrls(attachments.map(a => a.file_url))
```

Show in the documents card:
- Filename + which history it belongs to (date)
- Signed URL thumbnail for images
- "Ver todos los archivos" link → `/patients/[id]/files` (stub for now, `href="#"`)

---

**9. `src/app/(dashboard)/patients/[id]/history/new` — add file upload to wizard:**

In `Step6TreatmentPlan.tsx` (last step), add an optional file upload section at the bottom:

```tsx
// Optional section at bottom of Step 6
<div className="border-t border-[#E6EAF5] pt-6 mt-6">
  <h3 className="text-base font-semibold text-[#1E1E2F] mb-2">
    Archivos adjuntos
    <span className="text-xs text-[#9CA3AF] ml-2">opcional</span>
  </h3>
  <p className="text-sm text-[#6B7280] mb-4">
    Puedes subir radiografías, informes o imágenes relacionadas a esta historia.
  </p>
  {medicalHistoryId && (
    <FileUploader
      medicalHistoryId={medicalHistoryId}
      patientId={patientId}
      doctorId={doctorId}
      onUploadComplete={(att) => setUploadedFiles(prev => [...prev, att])}
    />
  )}
</div>
```

Only show if `medicalHistoryId` is available (Step 2 completed successfully).

---

**Follow all responsive guidelines defined in `RESPONSIVE.md`. Apply mobile-first CSS using Tailwind breakpoints. Run the responsive checklist before finishing.**

**Specific responsive behavior:**
- File upload drop zone: full width on all breakpoints, reduced padding on mobile `p-4 sm:p-8`
- File cards grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Preview modal: full screen on mobile, centered max-w on desktop
- Action buttons on cards: always visible on mobile (no hover-only), icon + label on mobile, icon-only on desktop
- Tab bar with 5 tabs: horizontally scrollable on mobile

---

**After implementing, verify:**
1. Bucket `clinical-records` exists in Supabase Storage
2. Uploading a JPG from the Archivos tab saves to the correct path `{doctorId}/{patientId}/{historyId}/`
3. Uploaded image appears in the file grid with thumbnail
4. Clicking 👁 opens the preview modal with the image
5. Clicking ⬇ downloads the file
6. Uploading a PDF shows PDF icon and opens in iframe on preview
7. Uploading a `.dcm` file shows DICOM icon and download-only message
8. Deleting a file removes it from storage AND from `attachments` table
9. Doctor B accessing a shared patient can VIEW files (signed URL works) but cannot DELETE them (`canDelete = false`)
10. File size validation prevents files over 150 MB
11. Invalid file types show error message without uploading
12. Patient profile documents card shows 3 most recent files with signed URLs
13. No TypeScript errors on `npm run build`
14. No horizontal overflow at 375px

---