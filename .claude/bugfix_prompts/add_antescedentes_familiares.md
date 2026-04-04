
---

**Context:**
You are implementing Feature 2 — Antecedentes Familiares — for Morecedont. This adds a new "Family Medical History" section to the medical background form and view. The project uses Next.js 14+ App Router, Supabase Auth, Prisma 6, Tailwind CSS, and TypeScript. Read `DESIGN.md` and `RESPONSIVE.md` before writing any code.

---

**Step 1 — Database migration:**

Run this SQL in Supabase SQL Editor before writing any code:

```sql
ALTER TABLE medical_backgrounds
ADD COLUMN family_hypertension BOOLEAN DEFAULT FALSE,
ADD COLUMN family_diabetes BOOLEAN DEFAULT FALSE,
ADD COLUMN family_cardiovascular BOOLEAN DEFAULT FALSE,
ADD COLUMN family_cancer BOOLEAN DEFAULT FALSE,
ADD COLUMN family_renal BOOLEAN DEFAULT FALSE,
ADD COLUMN family_mental_health BOOLEAN DEFAULT FALSE,
ADD COLUMN family_other TEXT;
```

After running the migration:
```bash
npx prisma db pull
npx prisma generate
```

Confirm the new columns appear in `prisma/schema.prisma` under `medical_backgrounds` before proceeding.

---

**Step 2 — Update all affected files:**

**Files to modify:**

**1. `src/app/(dashboard)/patients/new/steps/Step3MedicalBackground.tsx`**

Add a new section at the bottom of the form, after the existing systems and before the observations textarea. The section must match the visual style of the existing system cards:

New section title: "Antecedentes Familiares"
Subtitle: "Indique si algún familiar directo (padres, hermanos, abuelos) ha padecido las siguientes condiciones"

Card layout — single card with a family icon (users icon) and 2-column checkbox grid inside:
```
☐ Hipertensión arterial      ☐ Diabetes
☐ Enfermedad cardiovascular  ☐ Cáncer
☐ Enfermedad renal           ☐ Salud mental
```

Below checkboxes — text input:
- Label: "Otros antecedentes familiares"
- Placeholder: "Describa otros antecedentes familiares relevantes..."
- Maps to `family_other` field

Add to `useState` initialization:
```ts
family_hypertension: initialData?.family_hypertension ?? false,
family_diabetes: initialData?.family_diabetes ?? false,
family_cardiovascular: initialData?.family_cardiovascular ?? false,
family_cancer: initialData?.family_cancer ?? false,
family_renal: initialData?.family_renal ?? false,
family_mental_health: initialData?.family_mental_health ?? false,
family_other: initialData?.family_other ?? '',
```

Include all new fields when calling `onNext` and `onSaveAndExit`.

---

**2. `src/lib/actions/patients.ts` — update `saveMedicalBackground`:**

Add the new fields to the upsert:
```ts
await prisma.medical_backgrounds.upsert({
  where: { medical_history_id: medicalHistoryId },
  update: {
    ...existingFields,
    family_hypertension: data.family_hypertension,
    family_diabetes: data.family_diabetes,
    family_cardiovascular: data.family_cardiovascular,
    family_cancer: data.family_cancer,
    family_renal: data.family_renal,
    family_mental_health: data.family_mental_health,
    family_other: data.family_other,
  },
  create: {
    medical_history_id: medicalHistoryId,
    ...allFields
  }
})
```

---

**3. `src/app/(dashboard)/patients/[id]/history/[historyId]/components/tabs/MedicalBackgroundTab.tsx`**

Add a new card in the read-only view for Antecedentes Familiares, placed after the Inmunológico + Sangre row and before Observaciones:

Card style — full width, same style as other system cards:
- Header: family/users icon + "Antecedentes Familiares" title
- Content: 2-column grid of items
- Each item shows:
  - If `true`: colored dot `#4C6FFF` + condition name bold
  - If `false`: gray dot + condition name in `#9CA3AF`
- If `family_other` has text: show it below the grid with a label "Otros:"
- If ALL fields are false and `family_other` is empty: show "Sin antecedentes familiares reportados" in gray

Condition labels:
```ts
const familyConditions = [
  { key: 'family_hypertension', label: 'Hipertensión arterial' },
  { key: 'family_diabetes', label: 'Diabetes' },
  { key: 'family_cardiovascular', label: 'Enfermedad cardiovascular' },
  { key: 'family_cancer', label: 'Cáncer' },
  { key: 'family_renal', label: 'Enfermedad renal' },
  { key: 'family_mental_health', label: 'Salud mental' },
]
```

---

**4. `src/app/(dashboard)/patients/[id]/history/[historyId]/edit/EditHistoryWizard.tsx`**

Verify the wizard passes `initialData` including the new family fields to `EditStep1MedicalBackground`. No additional changes needed if the spread operator is already used — just confirm the new fields are included.

---

**5. `src/app/(dashboard)/patients/new/steps/Step3MedicalBackground.tsx` — also verify the edit flow**

Since `Step3MedicalBackground` is reused in the edit wizard, the `initialData` prop already covers pre-filling. Confirm the new fields are part of the type definition:

```ts
interface MedicalBackgroundData {
  // ... existing fields
  family_hypertension: boolean
  family_diabetes: boolean
  family_cardiovascular: boolean
  family_cancer: boolean
  family_renal: boolean
  family_mental_health: boolean
  family_other: string
}
```

---

**Visual design for the new section:**

Match exactly the style of the existing system cards in `Step3MedicalBackground`:
- Card background: `#F9FAFC`, border `border border-[#E6EAF5]`, `rounded-lg`, `p-4`
- Section icon: users/family outline icon in `#4C6FFF`
- Section title: `text-base font-semibold text-[#1E1E2F]`
- Subtitle: `text-xs text-[#6B7280]` below title
- Checkbox grid: `grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3`
- Each checkbox row: custom styled checkbox with `#4C6FFF` when checked — same style as existing checkboxes in the form
- `family_other` textarea: same style as the observations textarea — `w-full`, `text-base`, `border border-[#E6EAF5]`, `rounded-lg`, `p-3`, focus ring `#4C6FFF`

In the read-only view (`MedicalBackgroundTab`):
- Full width card spanning the entire content area
- Same `#F9FAFC` background and border as other system cards
- 3-column grid on desktop, 2-column on tablet, 1-column on mobile

---

**Follow all responsive guidelines defined in `RESPONSIVE.md`. Apply mobile-first CSS using Tailwind breakpoints. Run the responsive checklist before finishing.**

---

**After implementing, verify:**
1. Migration ran successfully — new columns exist in Supabase
2. `prisma db pull` reflects new columns in schema
3. New patient form Step 3 shows "Antecedentes Familiares" section at the bottom
4. Checking family conditions and saving persists correctly to DB
5. Read-only view in `MedicalBackgroundTab` shows the family section with correct values
6. Edit history wizard pre-fills family checkboxes correctly from existing data
7. If all family fields are false: shows "Sin antecedentes familiares reportados"
8. `family_other` text appears in both form and read-only view
9. No TypeScript errors on `npm run build`
10. No horizontal overflow at 375px

---