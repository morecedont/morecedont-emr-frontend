

---

**Context:**
You are implementing Feature 5 — Número de limas en instrumentación — for Morecedont. Currently the endodontics form only has an instrumentation type selector (manual/rotary). A specialist endodontist needs to register the file sequence used during biomechanical preparation, including initial file, final file, working length, and notes. The project uses Next.js 14+ App Router, Supabase Auth, Prisma 6, Tailwind CSS, and TypeScript. Read `DESIGN.md` and `RESPONSIVE.md` before writing any code.

---

**Step 1 — Database migration:**

Run this SQL in Supabase SQL Editor before writing any code:

```sql
ALTER TABLE endodontics
ADD COLUMN file_initial TEXT,
ADD COLUMN file_final TEXT,
ADD COLUMN file_length DECIMAL(5,2),
ADD COLUMN file_notes TEXT;
```

After running:
```bash
npx prisma db pull
npx prisma generate
```

Confirm the new columns appear in `prisma/schema.prisma` under `endodontics`.

---

**Step 2 — Add file constants:**

Add to `src/lib/constants/endodontics.ts`:

```ts
export const FILE_SIZES = [
  '06', '08', '010', '15', '20', '25', '30', '35', '40', '45', '50',
  '55', '60', '70', '80', '90', '100', '110', '120', '130', '140'
]

export const FILE_SIZE_OPTIONS = FILE_SIZES.map(size => ({
  value: size,
  label: `Lima #${size}`
}))
```

---

**Step 3 — Create shared component:**

**`src/components/shared/FileInstrumentation.tsx`** — new reusable Client Component:

```tsx
interface FileInstrumentationProps {
  instrumentationType: 'manual' | 'rotary_reciprocating' | null
  fileInitial: string | null
  fileFinal: string | null
  fileLength: number | null
  fileNotes: string | null
  onInstrumentationChange: (value: 'manual' | 'rotary_reciprocating') => void
  onFileInitialChange: (value: string) => void
  onFileFinalChange: (value: string) => void
  onFileLengthChange: (value: number | null) => void
  onFileNotesChange: (value: string) => void
  readOnly?: boolean
}
```

UI layout:

```
─── Preparación biomecánica ────────────────────────────

Instrumentación:
( ) Manual    ( ) Rotatoria / Reciprocante

Lima inicial:          Lima final:
[ Select lima #__ ▼]   [ Select lima #__ ▼]

Longitud de trabajo:
[ _____ ] mm

Secuencia visual:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#06 → #08 → #10 → ... → #25
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Notas de instrumentación:
[_____________________________________________]
```

Component behavior:

**Instrumentación radio buttons:**
- Same styled radio buttons as existing form
- "Manual" and "Rotatoria / Reciprocante" options
- `#4C6FFF` when selected

**Lima inicial / Lima final dropdowns:**
- Both use `FILE_SIZE_OPTIONS` as options
- Lima final options filtered to only show sizes >= lima inicial (prevent illogical sequences)
- If `fileInitial` is selected and `fileFinal` is smaller: show inline warning `text-red-500 text-xs` — "La lima final debe ser mayor o igual a la inicial"
- Dropdown style: same as other selects in the form — `text-base`, `border border-[#E6EAF5]`, `rounded-lg`, `h-11`

**Secuencia visual:**
- Auto-generated from `fileInitial` to `fileFinal`
- Shows the standard file progression between the two values
- Displayed as a horizontal scrollable pill sequence:
```tsx
// Example: initial=15, final=40
// Shows: #15 → #20 → #25 → #30 → #35 → #40
```
- Each pill: `bg-[#E6EAF5] text-[#2E3A59] text-xs rounded-full px-2 py-1`
- Arrow between pills: `→` in `#9CA3AF`
- Hidden if either initial or final is not selected
- On mobile: horizontally scrollable with `overflow-x-auto`

**Longitud de trabajo:**
- Number input, placeholder "Ej. 16.5", step 0.5, min 5, max 35
- Unit label "mm" inline to the right
- `text-base` to prevent iOS zoom
- Width: `w-32` on desktop, `w-full` on mobile

**Notas textarea:**
- Optional, placeholder "Ej. Preparación hasta lima 40 a 16mm con técnica crown-down"
- `text-base`, `min-h-[80px]`, full width

**Read-only mode:**
- Instrumentación: badge — "Manual" `bg-blue-50 text-blue-700` or "Rotatoria" `bg-purple-50 text-purple-700`
- Lima inicial → Lima final: shown as `#15 → #40` in bold `text-[#1E1E2F]`
- Longitud: `16.5 mm` in bold
- Secuencia visual: same pill sequence, non-interactive
- Notes: text block below if present

---

**Step 4 — Update all affected files:**

**1. `src/app/(dashboard)/patients/new/steps/Step5Endodontics.tsx`**

Replace the existing instrumentation section:

Remove:
- `instrumentation` radio buttons (manual/rotary) — these move INTO `FileInstrumentation` component
- Any existing single file number field if present

Add to state:
```ts
const [instrumentationType, setInstrumentationType] = useState<'manual' | 'rotary_reciprocating' | null>(
  initialData?.instrumentation ?? null
)
const [fileInitial, setFileInitial] = useState<string | null>(
  initialData?.file_initial ?? null
)
const [fileFinal, setFileFinal] = useState<string | null>(
  initialData?.file_final ?? null
)
const [fileLength, setFileLength] = useState<number | null>(
  initialData?.file_length ? parseFloat(String(initialData.file_length)) : null
)
const [fileNotes, setFileNotes] = useState<string>(
  initialData?.file_notes ?? ''
)
```

Replace instrumentation section with:
```tsx
<FileInstrumentation
  instrumentationType={instrumentationType}
  fileInitial={fileInitial}
  fileFinal={fileFinal}
  fileLength={fileLength}
  fileNotes={fileNotes}
  onInstrumentationChange={setInstrumentationType}
  onFileInitialChange={setFileInitial}
  onFileFinalChange={setFileFinal}
  onFileLengthChange={setFileLength}
  onFileNotesChange={setFileNotes}
/>
```

Include new fields when calling `onNext` and `onSaveAndExit`:
```ts
instrumentation: instrumentationType,
file_initial: fileInitial,
file_final: fileFinal,
file_length: fileLength,
file_notes: fileNotes,
```

---

**2. `src/lib/actions/patients.ts` — update `saveEndodontics`:**

Add new fields to the upsert:
```ts
file_initial: endodonticData.file_initial ?? null,
file_final: endodonticData.file_final ?? null,
file_length: endodonticData.file_length ?? null,
file_notes: endodonticData.file_notes ?? null,
```

---

**3. `src/app/(dashboard)/patients/[id]/history/[historyId]/components/tabs/EndodonticsTab.tsx`**

Replace the read-only instrumentation section with `FileInstrumentation` in `readOnly` mode:

```tsx
<FileInstrumentation
  instrumentationType={endodontic.instrumentation}
  fileInitial={endodontic.file_initial}
  fileFinal={endodontic.file_final}
  fileLength={endodontic.file_length ? parseFloat(String(endodontic.file_length)) : null}
  fileNotes={endodontic.file_notes}
  onInstrumentationChange={() => {}}
  onFileInitialChange={() => {}}
  onFileFinalChange={() => {}}
  onFileLengthChange={() => {}}
  onFileNotesChange={() => {}}
  readOnly
/>
```

---

**4. `src/app/(dashboard)/patients/[id]/history/[historyId]/edit/EditHistoryWizard.tsx`**

Verify new file fields are passed through `initialData` to `EditStep3Endodontics`. Add explicit mapping if not using full spread:

```ts
file_initial: history.endodontics?.[0]?.file_initial ?? null,
file_final: history.endodontics?.[0]?.file_final ?? null,
file_length: history.endodontics?.[0]?.file_length
  ? parseFloat(String(history.endodontics[0].file_length))
  : null,
file_notes: history.endodontics?.[0]?.file_notes ?? null,
```

---

**Follow all responsive guidelines defined in `RESPONSIVE.md`. Apply mobile-first CSS using Tailwind breakpoints. Run the responsive checklist before finishing.**

**Specific responsive behavior:**
- Lima inicial / Lima final: `grid-cols-1 sm:grid-cols-2` side by side from `sm:`
- Secuencia visual: horizontally scrollable on all breakpoints with `overflow-x-auto`
- Longitud de trabajo: `w-full sm:w-32` — full width on mobile, fixed on desktop
- Instrumentation radio buttons: stacked on mobile, inline on `sm:`
- Notes textarea: full width on all breakpoints

---

**After implementing, verify:**
1. Migration ran and new columns exist in Supabase
2. `prisma db pull` reflects new columns
3. Endodontics Step 5 shows the updated instrumentation section with file selectors
4. Lima final dropdown only shows sizes >= lima inicial
5. Selecting lima #15 as initial and #40 as final shows sequence: #15 → #20 → #25 → #30 → #35 → #40
6. Longitud de trabajo accepts decimal values (e.g. 16.5)
7. Saving persists all file fields correctly to DB
8. Read-only view shows instrumentation badge, file range, sequence and length
9. Edit wizard pre-fills all file fields correctly from existing data
10. Selecting a final file smaller than initial shows the warning message
11. No TypeScript errors on `npm run build`
12. No horizontal overflow at 375px

---