Aquí el prompt:

---

**Context:**
You are implementing Feature 3 — Conductometría múltiple por conducto — for Morecedont. Currently the endodontics form has a single set of fields for one canal. A specialist endodontist needs to register multiple canals per tooth, each with its own code, reference, and length in millimeters. The project uses Next.js 14+ App Router, Supabase Auth, Prisma 6, Tailwind CSS, and TypeScript. Read `DESIGN.md` and `RESPONSIVE.md` before writing any code.

---

**Step 1 — Database migration:**

Run this SQL in Supabase SQL Editor before writing any code:

```sql
-- New table for multiple canals per endodontic record
CREATE TABLE endodontic_canals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endodontic_id UUID NOT NULL REFERENCES endodontics(id) ON DELETE CASCADE,
  canal_code TEXT NOT NULL,
  canal_label TEXT NOT NULL,
  reference TEXT,
  length_mm DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE endodontic_canals ENABLE ROW LEVEL SECURITY;

-- RLS policy: doctor access through endodontics → medical_histories
CREATE POLICY "doctor_endodontic_canals" ON endodontic_canals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM endodontics e
      JOIN medical_histories mh ON mh.id = e.medical_history_id
      WHERE e.id = endodontic_id AND mh.doctor_id = auth.uid()
    )
  );

-- Index for performance
CREATE INDEX idx_endodontic_canals_endodontic ON endodontic_canals(endodontic_id);

-- Deprecate old single canal fields (keep them for backward compatibility, just stop using them)
-- DO NOT DROP canal_name, canal_reference, canal_length — existing data may use them
```

After running the migration:
```bash
npx prisma db pull
npx prisma generate
```

Confirm `endodontic_canals` appears in `prisma/schema.prisma` before proceeding.

---

**Step 2 — Canal codes reference:**

These are the standard endodontic canal codes to use as a preset selector:

```ts
export const CANAL_CODES = [
  { code: 'P',   label: 'P — Palatino' },
  { code: 'B',   label: 'B — Vestibular' },
  { code: 'MB',  label: 'MB — Mesio-vestibular' },
  { code: 'MB2', label: 'MB2 — Mesial 2' },
  { code: 'DV',  label: 'DV — Disto-vestibular' },
  { code: 'V',   label: 'V — Vestibular' },
  { code: 'D',   label: 'D — Distal' },
  { code: 'M',   label: 'M — Mesial' },
  { code: 'MV',  label: 'MV — Mesio-vestibular' },
  { code: 'ML',  label: 'ML — Mesio-lingual' },
  { code: 'custom', label: 'Otro (escribir)' },
]
```

Create this as a shared constant at `src/lib/constants/endodontics.ts`.

---

**Step 3 — Update all affected files:**

**1. `src/components/shared/CanalRow.tsx`** — new reusable Client Component:

A single row representing one canal entry:

```tsx
interface CanalRowProps {
  canal: CanalEntry
  index: number
  onChange: (index: number, field: keyof CanalEntry, value: string | number | null) => void
  onRemove: (index: number) => void
  readOnly?: boolean
}

interface CanalEntry {
  id?: string
  canal_code: string
  canal_label: string
  reference: string
  length_mm: number | null
  notes: string
}
```

Row layout — horizontal on desktop, stacked on mobile:

```
| Canal selector | Referencia | Longitud (mm) | Notas | [×] |
```

- **Canal selector**: dropdown with `CANAL_CODES` options — when "Otro" is selected, show a text input next to it for custom code
- **Referencia**: text input, placeholder "Ej. Cúspide mesial"
- **Longitud (mm)**: number input, placeholder "Ej. 16.5", step 0.5, min 0, max 35
- **Notas**: text input, placeholder "Observaciones del conducto"
- **Remove button**: `×` icon, `text-red-400 hover:text-red-600`, hidden if `readOnly`
- All inputs: `text-base`, `border border-[#E6EAF5]`, `rounded-lg`, focus ring `#4C6FFF`
- Row background: white, `rounded-lg`, `p-3`, `border border-[#E6EAF5]`
- On mobile: each field stacks vertically with its label

---

**2. `src/app/(dashboard)/patients/new/steps/Step5Endodontics.tsx`**

Replace the existing single Conductometría section with the new multi-canal UI:

Remove these fields from the single-entry form:
- `canal_name` text input
- `canal_reference` text input  
- `canal_length` text input

Replace with:

```tsx
// New state for multiple canals
const [canals, setCanals] = useState<CanalEntry[]>(
  initialData?.endodontic_canals ?? []
)

const addCanal = () => {
  setCanals(prev => [...prev, {
    canal_code: '',
    canal_label: '',
    reference: '',
    length_mm: null,
    notes: ''
  }])
}

const updateCanal = (index: number, field: keyof CanalEntry, value: string | number | null) => {
  setCanals(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c))
}

const removeCanal = (index: number) => {
  setCanals(prev => prev.filter((_, i) => i !== index))
}
```

New Conductometría section UI:

```
─────────────────────────────────────────
5. CONDUCTOMETRÍA (LR)
─────────────────────────────────────────
[+ Agregar conducto]

┌─────────────────────────────────────────────────────────┐
│ Canal: [MB — Mesio-vestibular ▼] [custom input if Otro] │
│ Referencia: [____________] Longitud: [______] mm        │
│ Notas: [_________________________________]    [×]       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Canal: [P — Palatino ▼]                                 │
│ Referencia: [____________] Longitud: [______] mm        │
│ Notas: [_________________________________]    [×]       │
└─────────────────────────────────────────────────────────┘

[+ Agregar otro conducto]
```

"Agregar conducto" button style: ghost, `#4C6FFF` border and text, `+` icon left, full width on mobile

Empty state (no canals yet):
- Dashed border box with `+` icon and "Agregar primer conducto" centered text
- Clicking it adds the first canal row

Summary below all canals (read-only, auto-calculated):
```
Total conductos: 2 | Longitud promedio: 15.5 mm | Longitud mínima: 15 mm | Longitud máxima: 16 mm
```
Show in a `#E6EAF5` info box, `text-xs text-[#6B7280]`

---

**3. `src/lib/actions/patients.ts` — update `saveEndodontics`:**

```ts
async function saveEndodontics(
  medicalHistoryId: string,
  doctorId: string,
  endodonticData: EndodonticData,
  sessions: SessionData[],
  canals: CanalEntry[]  // NEW parameter
) {
  // Verify ownership
  const history = await prisma.medical_histories.findUnique({
    where: { id: medicalHistoryId }
  })
  if (!history || history.doctor_id !== doctorId) throw new Error('Unauthorized')

  // Upsert endodontic record
  const endodontic = await prisma.endodontics.upsert({
    where: { id: endodonticData.id ?? 'new' },
    update: { ...endodonticData },
    create: { medical_history_id: medicalHistoryId, ...endodonticData }
  })

  // Replace canals — deleteMany + createMany
  await prisma.endodontic_canals.deleteMany({
    where: { endodontic_id: endodontic.id }
  })

  if (canals.length > 0) {
    await prisma.endodontic_canals.createMany({
      data: canals.map(canal => ({
        endodontic_id: endodontic.id,
        canal_code: canal.canal_code,
        canal_label: canal.canal_label,
        reference: canal.reference ?? '',
        length_mm: canal.length_mm,
        notes: canal.notes ?? ''
      }))
    })
  }

  // Handle sessions
  await prisma.endodontic_sessions.deleteMany({
    where: { endodontic_id: endodontic.id }
  })
  if (sessions.length > 0) {
    await prisma.endodontic_sessions.createMany({
      data: sessions.map(s => ({
        endodontic_id: endodontic.id,
        ...s
      }))
    })
  }

  return { endodonticId: endodontic.id }
}
```

---

**4. Update data fetching to include canals:**

In every place that fetches `endodontics`, add `endodontic_canals` to the include:

```ts
// In /patients/[id]/history/[historyId]/page.tsx
endodontics: {
  include: {
    endodontic_sessions: true,
    endodontic_canals: {        // ADD THIS
      orderBy: { created_at: 'asc' }
    }
  }
}

// Same in /patients/[id]/history/[historyId]/edit/page.tsx
```

---

**5. `src/app/(dashboard)/patients/[id]/history/[historyId]/components/tabs/EndodonticsTab.tsx`**

Replace the read-only Conductometría section with the new multi-canal view:

```tsx
// Conductometría read-only display
<div className="space-y-2">
  <h4 className="text-sm font-semibold text-[#1E1E2F]">Conductometría (LR)</h4>

  {canals.length === 0 ? (
    <p className="text-sm text-[#9CA3AF]">Sin conductos registrados</p>
  ) : (
    <>
      {/* Summary bar */}
      <div className="bg-[#E6EAF5] rounded-lg p-3 text-xs text-[#6B7280]">
        Total conductos: {canals.length} |
        Longitud promedio: {avgLength} mm |
        Rango: {minLength} — {maxLength} mm
      </div>

      {/* Canal table — desktop */}
      <table className="hidden md:table w-full text-sm">
        <thead>
          <tr className="text-xs text-[#9CA3AF] uppercase border-b border-[#E6EAF5]">
            <th className="text-left py-2">Canal</th>
            <th className="text-left py-2">Referencia</th>
            <th className="text-left py-2">Longitud</th>
            <th className="text-left py-2">Notas</th>
          </tr>
        </thead>
        <tbody>
          {canals.map(canal => (
            <tr key={canal.id} className="border-b border-[#E6EAF5] hover:bg-[#F9FAFC]">
              <td className="py-2 font-medium text-[#4C6FFF]">{canal.canal_code}</td>
              <td className="py-2 text-[#6B7280]">{canal.reference || '—'}</td>
              <td className="py-2">
                {canal.length_mm
                  ? <span className="font-medium text-[#1E1E2F]">{canal.length_mm} mm</span>
                  : <span className="text-[#9CA3AF]">—</span>
                }
              </td>
              <td className="py-2 text-[#6B7280]">{canal.notes || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Canal cards — mobile */}
      <div className="md:hidden space-y-2">
        {canals.map(canal => (
          <div key={canal.id} className="bg-[#F9FAFC] border border-[#E6EAF5] rounded-lg p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-[#4C6FFF]">{canal.canal_code}</span>
              {canal.length_mm && (
                <span className="text-sm font-medium text-[#1E1E2F]">{canal.length_mm} mm</span>
              )}
            </div>
            {canal.reference && (
              <p className="text-xs text-[#6B7280]">Ref: {canal.reference}</p>
            )}
            {canal.notes && (
              <p className="text-xs text-[#9CA3AF] mt-1">{canal.notes}</p>
            )}
          </div>
        ))}
      </div>
    </>
  )}
</div>
```

---

**6. Update `EditHistoryWizard.tsx`:**

Include `endodontic_canals` in the initial state passed to `EditStep3Endodontics`:

```ts
const [canals] = useState(
  history.endodontics?.[0]?.endodontic_canals ?? []
)

// Pass to step:
<EditStep3Endodontics
  initialData={endodontics}
  initialCanals={canals}   // NEW
  onNext={...}
  onBack={...}
  onSaveAndExit={...}
/>
```

Update `Step5Endodontics` to accept `initialCanals` prop:
```ts
interface Step5Props {
  initialData?: EndodonticData
  initialCanals?: CanalEntry[]  // NEW
  onNext: (data: EndodonticData, sessions: SessionData[], canals: CanalEntry[]) => void
  onBack: () => void
  onSaveAndExit: (data: EndodonticData, sessions: SessionData[], canals: CanalEntry[]) => void
}
```

---

**Follow all responsive guidelines defined in `RESPONSIVE.md`. Apply mobile-first CSS using Tailwind breakpoints. Run the responsive checklist before finishing.**

**Specific responsive behavior:**
- Canal rows: stacked fields on mobile, horizontal on `md:`
- Conductometría table: hidden on mobile, shown from `md:` — use card layout on mobile
- "Agregar conducto" button: full width on mobile, auto width on `md:`
- Summary stats: wrap naturally on mobile

---

**After implementing, verify:**
1. Migration ran and `endodontic_canals` table exists in Supabase
2. `prisma db pull` reflects the new table
3. Endodontics step shows empty dashed state when no canals exist
4. "Agregar conducto" adds a new canal row correctly
5. Canal selector dropdown shows all `CANAL_CODES` options
6. Selecting "Otro" shows a custom text input
7. Longitud field accepts decimals (e.g. 15.5)
8. Summary bar calculates correctly with multiple canals
9. Saving persists all canals to `endodontic_canals` table
10. Read-only view in `EndodonticsTab` shows canals as table on desktop and cards on mobile
11. Edit wizard pre-fills existing canals correctly
12. Removing a canal and saving deletes it from DB
13. No TypeScript errors on `npm run build`
14. No horizontal overflow at 375px

---