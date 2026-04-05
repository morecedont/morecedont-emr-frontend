

**Lo que hay que hacer es preciso:**
1. Crear ruta `/patients/[id]/files` con galería completa agrupada por historia
2. Corregir el link en `PatientAlertsDocuments`
3. Mejorar la query para incluir metadatos de la historia

**Lo que agregaría al análisis de Cursor:** reusar el `FilePreviewModal` que ya existe con el carrusel para mantener exactamente el mismo estilo que ya funciona en la historia clínica.

---

Aquí el prompt:

---

**Context:**
The "Ver archivos recientes" button in the patient profile at `/patients/[id]` currently points to `href="#"` and does nothing. You need to implement a full patient files gallery page at `/patients/[id]/files` and fix the link. The project uses Next.js 14+ App Router, Supabase Auth, Prisma 6, Tailwind CSS, and TypeScript. Read `DESIGN.md` and `RESPONSIVE.md` before writing any code.

**Important:** Reuse the existing `FilePreviewModal` and `AttachmentViewer` components already implemented — do not recreate them. Maintain the exact same visual style as the Archivos tab inside the clinical history.

---

**First — inspect existing code before writing anything:**

```bash
# Understand what already exists
cat src/app/(dashboard)/patients/[id]/components/PatientAlertsDocuments.tsx
cat src/app/(dashboard)/patients/[id]/page.tsx
cat src/components/shared/AttachmentViewer.tsx
cat src/components/shared/FilePreviewModal.tsx
cat src/lib/actions/attachments.ts
```

Report what props `FilePreviewModal` and `AttachmentViewer` accept before proceeding.

---

**Step 1 — Fix the link in `PatientAlertsDocuments.tsx`:**

```tsx
// Replace:
<a href="#" className="...">
  Ver archivos recientes →
</a>

// With:
import Link from 'next/link'

<Link
  href={`/patients/${patientId}/files`}
  className="inline-flex items-center gap-1 text-xs font-semibold text-[#4C6FFF] hover:underline mt-2"
>
  Ver archivos recientes →
</Link>
```

`PatientAlertsDocuments` must receive `patientId` as a prop. Verify it already does — if not, pass it from `page.tsx`.

---

**Step 2 — Add server action `getPatientAttachmentsWithUrls` to `src/lib/actions/attachments.ts`:**

```ts
export async function getPatientAttachmentsWithUrls(patientId: string): Promise<{
  attachments?: PatientAttachmentRecord[]
  error?: string
}> {
  const profile = await getProfile()
  if (!profile) return { error: 'No autorizado' }

  // Verify doctor has access to this patient
  const access = await prisma.doctor_patients.findUnique({
    where: {
      doctor_id_patient_id: {
        doctor_id: profile.id,
        patient_id: patientId
      }
    }
  })
  if (!access) return { error: 'No autorizado' }

  // Fetch ALL attachments from ALL histories of this patient
  const attachments = await prisma.attachments.findMany({
    where: {
      medical_histories: {
        patient_id: patientId,
        doctor_id: profile.id
      }
    },
    include: {
      medical_histories: {
        select: {
          id: true,
          created_at: true,
          clinics: {
            select: { name: true }
          }
        }
      }
    },
    orderBy: { uploaded_at: 'desc' }
  })

  if (attachments.length === 0) return { attachments: [] }

  // Generate signed URLs for all files
  const filePaths = attachments.map(a => a.file_url)
  const signedUrls = await getSignedUrls(filePaths)

  return {
    attachments: attachments.map(a => ({
      id: a.id,
      fileName: a.description ?? a.file_url.split('/').pop() ?? 'Archivo',
      fileType: a.file_type ?? '',
      filePath: a.file_url,
      signedUrl: signedUrls[a.file_url] ?? null,
      uploadedAt: a.uploaded_at.toISOString(),
      description: a.description,
      // History context
      historyId: a.medical_histories.id,
      historyCreatedAt: a.medical_histories.created_at.toISOString(),
      clinicName: a.medical_histories.clinics?.name ?? null
    }))
  }
}

export interface PatientAttachmentRecord {
  id: string
  fileName: string
  fileType: string
  filePath: string
  signedUrl: string | null
  uploadedAt: string
  description: string | null
  historyId: string
  historyCreatedAt: string
  clinicName: string | null
}
```

---

**Step 3 — Create `src/app/(dashboard)/patients/[id]/files/page.tsx`:**

Server Component:
```tsx
import { getProfile } from '@/lib/session'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getPatientAttachmentsWithUrls } from '@/lib/actions/attachments'
import PatientFilesGallery from './PatientFilesGallery'

export default async function PatientFilesPage({
  params
}: {
  params: { id: string }
}) {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  // Verify access
  const access = await prisma.doctor_patients.findUnique({
    where: {
      doctor_id_patient_id: {
        doctor_id: profile.id,
        patient_id: params.id
      }
    }
  })
  if (!access) notFound()

  // Fetch patient name for breadcrumb
  const patient = await prisma.patients.findUnique({
    where: { id: params.id },
    select: { full_name: true, id: true }
  })
  if (!patient) notFound()

  const result = await getPatientAttachmentsWithUrls(params.id)
  const attachments = result.attachments ?? []

  return (
    <PatientFilesGallery
      patient={patient}
      attachments={attachments}
      patientId={params.id}
    />
  )
}
```

---

**Step 4 — Create `src/app/(dashboard)/patients/[id]/files/PatientFilesGallery.tsx`:**

Client Component (`"use client"`):

```tsx
'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { PatientAttachmentRecord } from '@/lib/actions/attachments'
import FilePreviewModal from '@/components/shared/FilePreviewModal'
import { getFileCategory } from '@/lib/storage'

interface Props {
  patient: { id: string; full_name: string }
  attachments: PatientAttachmentRecord[]
  patientId: string
}
```

**Page layout:**

```
Breadcrumb: Pacientes > [Patient Name] > Archivos
Title: "Archivos de [Patient Name]"
Subtitle: "X archivos en Y historias clínicas"

[Filter tabs: Todos | Imágenes | PDFs | DICOM]     [search input]

─── Historia Clínica — Abr 2026 · Ceodont ──────────────────
  [Link → /patients/[id]/history/[historyId]]

  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │ [image]  │  │ 📄 PDF   │  │ 🔬 DICOM │
  │          │  │          │  │          │
  │ cars.jpg │  │ inf.pdf  │  │ rx.dcm   │
  └──────────┘  └──────────┘  └──────────┘

─── Historia Clínica — Ene 2026 · Clínica Norte ────────────
  ...
```

**Grouping logic:**
```ts
const groupedByHistory = useMemo(() => {
  const groups: Record<string, {
    historyId: string
    historyCreatedAt: string
    clinicName: string | null
    files: PatientAttachmentRecord[]
  }> = {}

  filteredAttachments.forEach(att => {
    if (!groups[att.historyId]) {
      groups[att.historyId] = {
        historyId: att.historyId,
        historyCreatedAt: att.historyCreatedAt,
        clinicName: att.clinicName,
        files: []
      }
    }
    groups[att.historyId].files.push(att)
  })

  // Sort groups by history date descending
  return Object.values(groups).sort(
    (a, b) => new Date(b.historyCreatedAt).getTime() - new Date(a.historyCreatedAt).getTime()
  )
}, [filteredAttachments])
```

**Filter tabs:**
```ts
type FilterType = 'all' | 'image' | 'pdf' | 'dicom'

const [activeFilter, setActiveFilter] = useState<FilterType>('all')

const filteredAttachments = useMemo(() => {
  if (activeFilter === 'all') return attachments
  return attachments.filter(a => getFileCategory(a.fileType, a.fileName) === activeFilter)
}, [attachments, activeFilter])
```

Tab style: active tab `bg-[#4C6FFF] text-white`, inactive `bg-[#E6EAF5] text-[#6B7280]`, `rounded-full px-4 py-1.5 text-sm`

**File cards — same style as `AttachmentViewer`:**
- Image: thumbnail `aspect-square object-cover rounded-lg` clickable to open modal
- PDF: icon card `bg-[#E6EAF5]` with PDF icon in `#4C6FFF`
- DICOM: dark card `bg-[#2E3A59]` with xray icon in white
- Hover: `shadow-md scale-[1.02]` transition
- Below card: filename truncated, upload date

**Clicking a file opens `FilePreviewModal`:**

Pass ALL files from that history group to the modal for carousel navigation:
```ts
const [previewFile, setPreviewFile] = useState<PatientAttachmentRecord | null>(null)
const [previewFiles, setPreviewFiles] = useState<PatientAttachmentRecord[]>([])

const openPreview = (file: PatientAttachmentRecord, groupFiles: PatientAttachmentRecord[]) => {
  setPreviewFile(file)
  setPreviewFiles(groupFiles) // enables carousel within the history group
}
```

**History group header:**
```tsx
<div className="flex items-center justify-between mb-3">
  <div className="flex items-center gap-3">
    <span className="text-sm font-semibold text-[#1E1E2F]">
      Historia Clínica —{' '}
      {format(new Date(group.historyCreatedAt), 'MMM yyyy', { locale: es })}
    </span>
    {group.clinicName && (
      <span className="bg-[#E6EAF5] text-[#6B7280] text-xs px-2 py-0.5 rounded-full">
        {group.clinicName}
      </span>
    )}
    <span className="text-xs text-[#9CA3AF]">
      {group.files.length} {group.files.length === 1 ? 'archivo' : 'archivos'}
    </span>
  </div>
  <Link
    href={`/patients/${patientId}/history/${group.historyId}`}
    className="text-xs text-[#4C6FFF] hover:underline flex items-center gap-1"
  >
    Ver historia →
  </Link>
</div>
```

**Empty states:**
- No files at all: icon + "Este paciente no tiene archivos adjuntos" + "Los archivos se adjuntan desde dentro de cada historia clínica" + button "Ver historias" linking to `/patients/[id]`
- Filter returns no results: "No hay archivos de tipo [X] para este paciente" + "Ver todos" button resets filter

**Back navigation:**
- Breadcrumb: `Pacientes > {patient.full_name} > Archivos`
- Each part is a `Link`

---

**Step 5 — Update `patients/[id]/page.tsx` query:**

Update the existing attachments query to include history context (used for the 3 preview thumbnails in `PatientAlertsDocuments`):

```ts
// Replace existing attachmentsRaw query with:
const attachmentsRaw = await prisma.attachments.findMany({
  where: {
    medical_histories: {
      patient_id: id,
      doctor_id: profile.id
    }
  },
  include: {
    medical_histories: {
      select: {
        id: true,
        created_at: true,
        clinics: { select: { name: true } }
      }
    }
  },
  orderBy: { uploaded_at: 'desc' },
  take: 3
})

// Update mapping to include historyId:
const attachments = attachmentsRaw.map(a => ({
  id: a.id,
  fileName: a.description ?? a.file_url.split('/').pop() ?? a.file_url,
  fileType: a.file_type ?? null,
  uploadedAt: a.uploaded_at.toISOString(),
  signedUrl: signedUrlMap[a.file_url] ?? null,
  historyId: a.medical_histories.id  // ADD THIS
}))
```

---

**Follow all responsive guidelines defined in `RESPONSIVE.md`. Apply mobile-first CSS using Tailwind breakpoints. Run the responsive checklist before finishing.**

**Specific responsive behavior:**
- File cards grid: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`
- Filter tabs: horizontally scrollable on mobile `overflow-x-auto`
- History group header: stacked on mobile, inline on `sm:`
- Breadcrumb: truncate patient name on mobile with `truncate max-w-[120px]`
- Preview modal: reuse existing — already responsive

---

**After implementing, verify:**
1. "Ver archivos recientes" button in patient profile navigates to `/patients/[id]/files`
2. All files from all histories appear grouped by history
3. Each group shows the correct history date and clinic name
4. "Ver historia →" link navigates to the correct history
5. Filter tabs correctly filter by image/PDF/DICOM
6. Clicking an image opens `FilePreviewModal` with carousel navigation within that history group
7. Empty state shows correctly when no files exist
8. Empty filter state shows correctly with reset button
9. Breadcrumb navigates correctly at each level
10. `npm run build` passes with zero TypeScript errors
11. No horizontal overflow at 375px

---

