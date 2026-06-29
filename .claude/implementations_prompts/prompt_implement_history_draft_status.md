---

**Context:**
You are implementing the History Draft Status feature for Morecedont. When a doctor starts a new clinical history, it is created with `status: 'draft'` and must be explicitly confirmed with a dedicated button before becoming part of the permanent record. Unconfirmed drafts are cleaned up automatically. Routes affected: `/patients/[id]`, `/patients/[id]/history/[historyId]`. The project uses Next.js App Router (v16), Supabase Auth, Prisma 6, Tailwind CSS v4, and TypeScript strict.
Before writing any code: read `.claude/skills/responsive-mobile-first/SKILL.md`, `.claude/skills/design-system/SKILL.md`, and `DESIGN.md`.

**First — inspect existing code before writing anything:**
Read these files and note their current state before proceeding:
- `src/app/(dashboard)/patients/[id]/page.tsx` — lines 24-112 (deriveStatus, Promise.all query, histories mapping)
- `src/app/(dashboard)/patients/[id]/components/TreatmentHistoryList.tsx` — full file (HistoryRow type, STATUS_* maps)
- `src/app/(dashboard)/patients/[id]/history/[historyId]/page.tsx` — lines 50-73 (isActive derivation, headerData)
- `src/app/(dashboard)/patients/[id]/history/[historyId]/components/HistoryHeader.tsx` — full file (HistoryHeaderData type, badge JSX)
- `src/lib/actions/patients.ts` — lines 78-107 (createMedicalHistory)

---

## Step 0 — Database migration

Run this SQL in the Supabase SQL Editor before writing any code:

```sql
-- Add status column to medical_histories
ALTER TABLE public.medical_histories
  ADD COLUMN status TEXT NOT NULL DEFAULT 'draft';

-- Mark all existing histories as active (retrocompatibility — they were already confirmed)
UPDATE public.medical_histories SET status = 'active';

-- Index for efficient status filtering
CREATE INDEX idx_medical_histories_status
  ON public.medical_histories(status);

-- Compound index for cleanup query (patient + status + created_at)
CREATE INDEX idx_medical_histories_patient_status_created
  ON public.medical_histories(patient_id, status, created_at);
```

After running the SQL, add the field to `prisma/schema.prisma` in the `medical_histories` model (insert after `updated_at`):

```prisma
model medical_histories {
  id                  String               @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  patient_id          String               @db.Uuid
  doctor_id           String               @db.Uuid
  clinic_id           String?              @db.Uuid
  currency            currency_type        @default(USD)
  last_dental_visit   DateTime?            @db.Date
  emergency_contact   String?
  signature_date      DateTime?            @db.Date
  created_at          DateTime             @default(now()) @db.Timestamptz(6)
  updated_at          DateTime             @default(now()) @db.Timestamptz(6)
  status              String               @default("draft")   // ← ADD THIS LINE
  // ... all existing relations unchanged ...
}
```

Then run: `npx prisma generate`
Do NOT run `prisma migrate dev`, `prisma migrate deploy`, or `prisma db push`.

---

## Step 1 — Server Actions (`src/lib/actions/patients.ts`)

### 1a — Modify `createMedicalHistory` (line ~94)

Inside the existing `prisma.medical_histories.create` call, add `status: 'draft'`:

```ts
const history = await prisma.medical_histories.create({
  data: {
    patient_id: patientId,
    doctor_id: profile.id,
    clinic_id: clinicId || null,
    currency,
    status: 'draft',   // ← ADD THIS
  },
})
```

### 1b — Add `confirmMedicalHistory` (append to patients.ts)

```ts
export async function confirmMedicalHistory(
  historyId: string,
  patientId: string
): Promise<{ error?: string }> {
  const profile = await getProfile()
  if (!profile) return { error: "No autorizado" }

  const history = await prisma.medical_histories.findUnique({
    where: { id: historyId },
    select: { doctor_id: true, status: true, patient_id: true },
  })
  if (!history) return { error: "Historia no encontrada" }
  if (history.doctor_id !== profile.id) return { error: "No autorizado" }
  if (history.patient_id !== patientId) return { error: "No autorizado" }
  if (history.status !== "draft") return { error: "Esta historia ya fue confirmada" }

  try {
    await prisma.medical_histories.update({
      where: { id: historyId },
      data: { status: "active" },
    })
    revalidatePath(`/patients/${patientId}`)
    revalidatePath(`/patients/${patientId}/history/${historyId}`)
    return {}
  } catch (err) {
    console.error("confirmMedicalHistory error:", err)
    return { error: "Error al confirmar la historia. Intenta de nuevo." }
  }
}
```

### 1c — Add `discardDraftHistory` (append to patients.ts)

⚠️ Must delete storage files before deleting the DB record — cascade removes `attachments` rows but NOT physical files.

```ts
import { deleteStorageFile } from "@/lib/storage"

export async function discardDraftHistory(
  historyId: string,
  patientId: string
): Promise<{ error?: string }> {
  const profile = await getProfile()
  if (!profile) return { error: "No autorizado" }

  const history = await prisma.medical_histories.findUnique({
    where: { id: historyId },
    select: {
      doctor_id: true,
      status: true,
      patient_id: true,
      attachments: { select: { file_url: true } },
    },
  })
  if (!history) return { error: "Historia no encontrada" }
  if (history.doctor_id !== profile.id) return { error: "No autorizado" }
  if (history.patient_id !== patientId) return { error: "No autorizado" }
  if (history.status !== "draft") {
    return { error: "Solo se pueden descartar historias en borrador" }
  }

  try {
    // Delete storage files first (DB cascade won't do this)
    await Promise.all(history.attachments.map((a) => deleteStorageFile(a.file_url)))

    await prisma.medical_histories.delete({ where: { id: historyId } })

    revalidatePath(`/patients/${patientId}`)
    return {}
  } catch (err) {
    console.error("discardDraftHistory error:", err)
    return { error: "Error al descartar el borrador. Intenta de nuevo." }
  }
}
```

### 1d — Add `cleanupOrphanedDrafts` (append to patients.ts)

Cleans up empty drafts older than 30 minutes. "Empty" = no `medical_backgrounds` row AND no `treatment_items`. Called silently from the patient page server component on every load.

```ts
export async function cleanupOrphanedDrafts(patientId: string): Promise<void> {
  const profile = await getProfile()
  if (!profile) return

  const cutoff = new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago

  try {
    const staleDrafts = await prisma.medical_histories.findMany({
      where: {
        patient_id: patientId,
        doctor_id: profile.id,
        status: "draft",
        created_at: { lt: cutoff },
        medical_backgrounds: null,          // no background data saved
        treatment_items: { none: {} },      // no treatment items saved
      },
      select: {
        id: true,
        attachments: { select: { file_url: true } },
      },
    })

    if (staleDrafts.length === 0) return

    // Delete storage files for each stale draft
    await Promise.all(
      staleDrafts.flatMap((d) => d.attachments.map((a) => deleteStorageFile(a.file_url)))
    )

    await prisma.medical_histories.deleteMany({
      where: { id: { in: staleDrafts.map((d) => d.id) } },
    })

    revalidatePath(`/patients/${patientId}`)
  } catch (err) {
    console.error("cleanupOrphanedDrafts error:", err)
    // Silent failure — do not block page render
  }
}
```

---

## Step 2 — Update `src/app/(dashboard)/patients/[id]/page.tsx`

### 2a — Update `deriveStatus` function (line 24)

```ts
function deriveStatus(createdAt: Date, dbStatus: string): "active" | "completed" | "paused" | "draft" {
  if (dbStatus === "draft") return "draft"
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  return createdAt >= sixMonthsAgo ? "active" : "completed"
}
```

### 2b — Replace the `Promise.all` block (lines 49-86)

Replace the entire `const [patient, totalHistoryCount, attachmentsRaw]` block with this new version that:
- Calls `cleanupOrphanedDrafts` first (silently)
- Fetches `active` histories for the paginated list
- Fetches `draft` histories separately (shown at the top, unpaginated)
- Counts only `active` histories for pagination

```ts
// Run cleanup silently before fetching — removes empty drafts older than 30 min
await cleanupOrphanedDrafts(id)

const [patient, totalActiveCount, draftHistories, attachmentsRaw] = await Promise.all([
  prisma.patients.findUnique({
    relationLoadStrategy: "join",
    where: { id },
    include: {
      medical_histories: {
        where: { status: "active" },
        orderBy: { created_at: "desc" },
        skip: (currentHistoryPage - 1) * HISTORY_PAGE_SIZE,
        take: HISTORY_PAGE_SIZE,
        include: {
          clinics: true,
          treatment_items: { orderBy: { item_number: "asc" }, take: 1 },
          medical_backgrounds: { select: { immun_drug_allergy: true, blood_easy_bleeding: true } },
        },
      },
    },
  }),
  prisma.medical_histories.count({
    where: { patient_id: id, status: "active" },
  }),
  prisma.medical_histories.findMany({
    where: { patient_id: id, doctor_id: profile.id, status: "draft" },
    orderBy: { created_at: "desc" },
    include: {
      clinics: true,
      treatment_items: { orderBy: { item_number: "asc" }, take: 1 },
    },
  }),
  prisma.attachments.findMany({
    relationLoadStrategy: "join",
    where: {
      medical_histories: { patient_id: id },
    },
    include: {
      medical_histories: {
        select: {
          id: true,
          created_at: true,
          clinics: { select: { name: true } },
        },
      },
    },
    orderBy: { uploaded_at: "desc" },
    take: 3,
  }),
])
if (!patient) notFound()
```

### 2c — Update histories mapping (line ~105)

```ts
// Active histories (paginated)
const histories: HistoryRow[] = patient.medical_histories.map((h) => ({
  id: h.id,
  patientId: patient.id,
  clinicName: h.clinics?.name ?? null,
  firstProcedure: h.treatment_items[0]?.description ?? null,
  createdAt: h.created_at.toISOString(),
  status: deriveStatus(h.created_at, h.status),
}))

// Draft histories (separate, shown above the list)
const draftRows: HistoryRow[] = draftHistories.map((h) => ({
  id: h.id,
  patientId: patient.id,
  clinicName: h.clinics?.name ?? null,
  firstProcedure: h.treatment_items[0]?.description ?? null,
  createdAt: h.created_at.toISOString(),
  status: "draft" as const,
}))

const totalHistoryPages = Math.max(1, Math.ceil(totalActiveCount / HISTORY_PAGE_SIZE))
```

### 2d — Update the `latestHistory` reference and `isActive` (line ~90)

The `latestHistory` is used for alerts and sidebar info. It should be the most recent ACTIVE history (not a draft):

```ts
// Use first active history (already ordered by created_at desc in the query)
const latestHistory = patient.medical_histories[0] ?? null
```

No change needed here — the query now filters `status: "active"` so the first result is already the most recent active history.

### 2e — Update `TreatmentHistoryList` call in JSX (line ~175)

```tsx
<TreatmentHistoryList
  histories={histories}
  draftHistories={draftRows}          // ← ADD THIS PROP
  patientId={id}
  currentPage={currentHistoryPage}
  totalPages={totalHistoryPages}
  totalCount={totalActiveCount}
  pageSize={HISTORY_PAGE_SIZE}
/>
```

---

## Step 3 — Update `src/app/(dashboard)/patients/[id]/history/[historyId]/page.tsx`

### 3a — Replace the derived `isActive` block (lines 56-73)

Currently the page derives status from `created_at` date. Replace with reading from DB:

```ts
// REMOVE this block:
// const sixMonthsAgo = new Date()
// sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
// const isActive = history.created_at >= sixMonthsAgo

// REPLACE WITH:
const dbStatus = history.status  // 'draft' | 'active'
const derivedStatus: "draft" | "active" | "completed" = (() => {
  if (dbStatus === "draft") return "draft"
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  return history.created_at >= sixMonthsAgo ? "active" : "completed"
})()
```

### 3b — Update `HistoryHeaderData` mapping

```ts
const headerData: HistoryHeaderData = {
  historyId: history.id,
  patientId: id,
  patientName: patient.full_name,
  patientAge: calcAge(patient.date_of_birth),
  bloodType: patient.blood_type ?? null,
  idNumber: patient.id_number ?? null,
  clinicName: history.clinics?.name ?? null,
  createdAt: history.created_at.toISOString(),
  updatedAt: history.updated_at.toISOString(),
  doctorName: history.profiles.full_name,
  status: derivedStatus,   // ← was: isActive ? "active" : "completed"
}
```

### 3c — Insert `DraftBanner` in the page JSX

After `<HistoryHeader data={headerData} />` and before `<HistoryTabs data={tabsData} />`:

```tsx
import DraftBanner from "./components/DraftBanner"

// In the return JSX:
<div className="min-h-screen bg-surface-container-low">
  {/* Breadcrumb — unchanged */}
  <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-2">
    {/* ... existing breadcrumb unchanged ... */}
  </div>

  <HistoryHeader data={headerData} />

  {/* Show draft banner only for draft histories */}
  {derivedStatus === "draft" && (
    <DraftBanner historyId={historyId} patientId={id} />
  )}

  <HistoryTabs data={tabsData} />
</div>
```

---

## Step 4 — Create `src/app/(dashboard)/patients/[id]/history/[historyId]/components/DraftBanner.tsx`

New Client Component. Displays below the HistoryHeader when the history is a draft. Handles confirm and discard flows with a two-step confirmation for discard.

```
Mobile layout:
┌─────────────────────────────────────────────────────────┐
│ ⚠️  Historia en borrador                                 │
│     Los datos se guardan por sección, pero esta          │
│     historia no aparece en el historial del paciente     │
│     hasta que la confirmes.                              │
│                                                         │
│     [Descartar borrador]    [✓ Confirmar historia]       │
└─────────────────────────────────────────────────────────┘

After clicking "Descartar borrador" — confirmation step:
┌─────────────────────────────────────────────────────────┐
│ 🗑️  ¿Eliminar este borrador?                             │
│     Se eliminarán todos los datos ingresados hasta       │
│     ahora. Esta acción no se puede deshacer.             │
│                                                         │
│     [Cancelar]              [Sí, eliminar borrador]      │
└─────────────────────────────────────────────────────────┘

Desktop (sm:) — buttons inline on the right:
┌─────────────────────────────────────────────────────────┐
│ ⚠️  Historia en borrador — Los datos se guardan por      │
│     sección pero la historia no está confirmada aún.    │
│                                 [Descartar] [Confirmar] │
└─────────────────────────────────────────────────────────┘
```

```tsx
"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { confirmMedicalHistory, discardDraftHistory } from "@/lib/actions/patients"

interface DraftBannerProps {
  historyId: string
  patientId: string
}

export default function DraftBanner({ historyId, patientId }: DraftBannerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)

  const handleConfirm = () => {
    setError(null)
    startTransition(async () => {
      const result = await confirmMedicalHistory(historyId, patientId)
      if (result.error) {
        setError(result.error)
        return
      }
      router.refresh() // re-render server component — DraftBanner disappears
    })
  }

  const handleDiscard = () => {
    setError(null)
    startTransition(async () => {
      const result = await discardDraftHistory(historyId, patientId)
      if (result.error) {
        setError(result.error)
        setShowDiscardConfirm(false)
        return
      }
      router.push(`/patients/${patientId}`)
    })
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-3">
      <div className="max-w-7xl mx-auto">
        {!showDiscardConfirm ? (
          // Default state
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <span className="material-symbols-outlined text-amber-500 text-[22px] shrink-0 mt-0.5">
                warning
              </span>
              <div>
                <p className="text-sm font-bold text-amber-800">Historia en borrador</p>
                <p className="text-sm text-amber-700 mt-0.5">
                  Los datos se guardan por sección, pero esta historia no aparece en el
                  historial del paciente hasta que la confirmes.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 sm:flex-col sm:items-stretch lg:flex-row">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(true)}
                disabled={isPending}
                className="h-11 px-4 flex items-center justify-center gap-2 text-sm font-semibold text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Descartar</span>
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isPending}
                className="h-11 px-4 flex items-center justify-center gap-2 text-sm font-semibold bg-primary text-white rounded-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>{isPending ? "Confirmando…" : "Confirmar historia"}</span>
              </button>
            </div>
          </div>
        ) : (
          // Discard confirmation step
          <div className="bg-error-container/30 border border-error/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <span className="material-symbols-outlined text-error text-[22px] shrink-0 mt-0.5">
                delete_forever
              </span>
              <div>
                <p className="text-sm font-bold text-on-surface">¿Eliminar este borrador?</p>
                <p className="text-sm text-on-surface-variant mt-0.5">
                  Se eliminarán todos los datos ingresados hasta ahora. Esta acción no se
                  puede deshacer.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 sm:flex-col sm:items-stretch lg:flex-row">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                disabled={isPending}
                className="h-11 px-4 flex items-center justify-center gap-2 text-sm font-semibold text-secondary border border-outline-variant/30 rounded-lg hover:bg-surface-container transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDiscard}
                disabled={isPending}
                className="h-11 px-4 flex items-center justify-center gap-2 text-sm font-semibold bg-error text-white rounded-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>{isPending ? "Eliminando…" : "Sí, eliminar borrador"}</span>
              </button>
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-error bg-error-container/20 rounded-lg px-3 py-2 mt-2">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
```

---

## Step 5 — Update `src/app/(dashboard)/patients/[id]/history/[historyId]/components/HistoryHeader.tsx`

### 5a — Update `HistoryHeaderData` type

```ts
export type HistoryHeaderData = {
  historyId: string
  patientId: string
  patientName: string
  patientAge: number | null
  bloodType: string | null
  idNumber: string | null
  clinicName: string | null
  createdAt: string
  updatedAt: string
  doctorName: string
  status: "draft" | "active" | "completed"   // ← was: "active" | "completed"
}
```

### 5b — Update the status badge JSX

Find the badge element that currently renders:
```tsx
<span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
  isActive ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"
}`}>
  {isActive ? "Activo" : "Completado"}
</span>
```

Replace with:
```tsx
{data.status === "draft" && (
  <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-amber-100 text-amber-700">
    Borrador
  </span>
)}
{data.status === "active" && (
  <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-green-50 text-green-700">
    Activo
  </span>
)}
{data.status === "completed" && (
  <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-blue-50 text-blue-700">
    Completado
  </span>
)}
```

Also update the `isActive` usage that drives the `PatientAvatar` `showStatusDot` / `isActive` props:

```tsx
// Replace:
// <PatientAvatar fullName={data.patientName} size="md" showStatusDot isActive={isActive} />
// With:
<PatientAvatar
  fullName={data.patientName}
  size="md"
  showStatusDot={data.status !== "draft"}
  isActive={data.status === "active"}
/>
```

---

## Step 6 — Update `src/app/(dashboard)/patients/[id]/components/TreatmentHistoryList.tsx`

### 6a — Update `HistoryRow` type

```ts
export type HistoryRow = {
  id: string
  patientId: string
  clinicName: string | null
  firstProcedure: string | null
  createdAt: string
  status: "active" | "completed" | "paused" | "draft"   // ← add "draft"
}
```

### 6b — Add `draft` to STATUS_* maps

```ts
const STATUS_DOT: Record<string, string> = {
  active: "bg-green-500",
  completed: "bg-blue-500",
  paused: "bg-yellow-500",
  draft: "bg-amber-400",              // ← ADD
}

const STATUS_BADGE: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  completed: "bg-blue-50 text-blue-700",
  paused: "bg-yellow-50 text-yellow-700",
  draft: "bg-amber-100 text-amber-700",   // ← ADD
}

const STATUS_LABEL: Record<string, string> = {
  active: "Activo",
  completed: "Completado",
  paused: "En pausa",
  draft: "Borrador",                      // ← ADD
}
```

### 6c — Update `formatDateRange` to handle draft

```ts
function formatDateRange(createdAt: string, status: "active" | "completed" | "paused" | "draft"): string {
  const start = format(new Date(createdAt), "MMM yyyy", { locale: es }).toUpperCase()
  if (status === "active") return `${start} — EN CURSO`
  if (status === "draft") return `${start} — BORRADOR`
  return start
}
```

### 6d — Update props interface and component

```ts
interface TreatmentHistoryListProps {
  histories: HistoryRow[]
  draftHistories: HistoryRow[]          // ← ADD
  patientId: string
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
}
```

### 6e — Full updated component JSX

Replace the full component body with this implementation that shows drafts at the top in a special section, followed by the paginated active histories:

```tsx
export default function TreatmentHistoryList({
  histories,
  draftHistories,
  patientId,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
}: TreatmentHistoryListProps) {
  const hasDrafts = draftHistories.length > 0
  const hasActiveHistories = histories.length > 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-on-surface">Historial de tratamientos</h2>
      </div>

      {/* Draft histories section — shown above active list */}
      {hasDrafts && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider px-1">
            Borradores sin confirmar
          </p>
          {draftHistories.map((h) => (
            <Link
              key={h.id}
              href={`/patients/${patientId}/history/${h.id}`}
              className="flex items-center gap-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 hover:border-amber-300 hover:shadow-sm transition-all group"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
                    {formatDateRange(h.createdAt, "draft")}
                  </p>
                  {h.clinicName && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-surface-container text-secondary rounded-full uppercase tracking-wide">
                      {h.clinicName}
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-on-surface truncate">
                  {h.firstProcedure ?? "Sin procedimientos registrados"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    Borrador
                  </span>
                  <span className="text-[10px] text-outline">Toca para ver y confirmar</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-amber-400 group-hover:text-amber-600 transition-colors text-[20px] shrink-0">
                chevron_right
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Active histories — paginated */}
      {!hasActiveHistories && !hasDrafts ? (
        // True empty state — no histories at all
        <div className="bg-white rounded-xl border border-outline-variant/10 p-10 flex flex-col items-center gap-3 text-center">
          <span className="material-symbols-outlined text-outline text-5xl">medical_information</span>
          <p className="font-bold text-on-surface">No hay historias clínicas registradas</p>
          <p className="text-sm text-secondary">Crea la primera historia para este paciente.</p>
          <Link
            href={`/patients/${patientId}/history/new`}
            className="h-11 px-5 inline-flex items-center gap-2 bg-sidebar-active text-white text-sm font-semibold rounded-lg hover:bg-sidebar-active/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Crear primera historia clínica
          </Link>
        </div>
      ) : !hasActiveHistories && hasDrafts ? (
        // Has drafts but no confirmed histories
        <div className="bg-white rounded-xl border border-outline-variant/10 p-6 flex flex-col items-center gap-2 text-center">
          <span className="material-symbols-outlined text-outline text-3xl">pending_actions</span>
          <p className="text-sm text-secondary">No hay historias confirmadas aún.</p>
          <p className="text-xs text-outline">Confirma el borrador para que aparezca aquí.</p>
        </div>
      ) : (
        // Has active histories
        <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
          <div className="space-y-3 p-4 sm:p-5">
            {histories.map((h) => (
              <Link
                key={h.id}
                href={`/patients/${patientId}/history/${h.id}`}
                className="flex items-center gap-4 rounded-xl border border-outline-variant/10 px-5 py-4 hover:border-primary/30 hover:shadow-sm transition-all group"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[h.status]} shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                      {formatDateRange(h.createdAt, h.status)}
                    </p>
                    {h.clinicName && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-surface-container-low text-secondary rounded-full uppercase tracking-wide">
                        {h.clinicName}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-on-surface truncate">
                    {h.firstProcedure ?? "Sin procedimientos registrados"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${STATUS_BADGE[h.status]}`}>
                      {STATUS_LABEL[h.status]}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px] shrink-0">
                  chevron_right
                </span>
              </Link>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            basePath={`/patients/${patientId}`}
            pageParam="historyPage"
            itemLabel="historias"
          />
        </div>
      )}
    </div>
  )
}
```

---

**Specific responsive behavior:**
- `DraftBanner`: `flex flex-col gap-4` on mobile, `sm:flex-row sm:items-center` on sm+
- Buttons in DraftBanner: `w-full` on mobile (inside flex-col), auto-width on `sm:` (inside flex-row)
- `sm:flex-col sm:items-stretch lg:flex-row` on the button group — stacked vertically between sm and lg, then horizontal again on lg+
- Draft rows in TreatmentHistoryList: same card width as active rows, amber border replaces outline-variant
- "Borradores sin confirmar" label: `hidden` on no-draft state (rendered conditionally)
- All buttons in DraftBanner have `h-11` minimum height
- No inputs in this feature — no `text-base` concern

---

**After implementing, verify:**
1. Navigate to `/patients/[id]/history/new` — a draft history is created and you are redirected to the history detail page
2. History detail page shows the amber `DraftBanner` below the header — confirm step visible, discard step hidden
3. HistoryHeader badge shows "Borrador" in amber, not "Activo" or "Completado"
4. Clicking "Confirmar historia" in `DraftBanner` → calls `confirmMedicalHistory` → page refreshes → banner disappears → badge changes to "Activo"
5. After confirmation, history appears in the paginated "Historial de tratamientos" list on the patient page
6. Clicking "Descartar borrador" in `DraftBanner` → shows confirmation step ("¿Eliminar este borrador?")
7. Confirming discard → calls `discardDraftHistory` → router pushes to `/patients/[id]` → history is gone from DB
8. Trying to discard an ACTIVE history returns `{ error: 'Solo se pueden descartar historias en borrador' }`
9. Draft history appears in the "Borradores sin confirmar" section on `/patients/[id]`, NOT in the paginated active list
10. A draft older than 30 minutes with no data (no `medical_backgrounds`, no `treatment_items`) is auto-deleted when `/patients/[id]` loads — verify it's gone from the list
11. A draft with some section data saved is NOT auto-deleted even if older than 30 minutes
12. `totalHistoryCount` on patient page counts only `active` histories — verify pagination math is correct
13. Discarding a draft with attachments: verify files are deleted from Supabase Storage AND the `attachments` DB rows are gone
14. `confirmMedicalHistory` called by doctor B (not the history owner) returns `{ error: 'No autorizado' }` without mutating DB
15. `npm run build` exits 0 — zero TypeScript errors
16. `npm run lint` exits 0 on all new and modified files
17. No horizontal overflow at 375px on the history detail page with `DraftBanner` visible

---
