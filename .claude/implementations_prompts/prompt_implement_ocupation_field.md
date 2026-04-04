
---

**Context:**
You are implementing Feature 6 — Campo ocupación en el perfil del paciente — for Morecedont. This adds an `occupation` field to the patients table and surfaces it in the new patient form, the patient profile view, and the patient edit form. The project uses Next.js 14+ App Router, Supabase Auth, Prisma 6, Tailwind CSS, and TypeScript. Read `DESIGN.md` and `RESPONSIVE.md` before writing any code.

---

**Step 1 — Database migration:**

Run this SQL in Supabase SQL Editor before writing any code:

```sql
ALTER TABLE patients
ADD COLUMN occupation TEXT;
```

After running:
```bash
npx prisma db pull
npx prisma generate
```

Confirm `occupation` appears in `prisma/schema.prisma` under `patients`.

---

**Step 2 — Update all affected files:**

**1. `src/app/(dashboard)/patients/new/steps/Step1PersonalData.tsx`**

Add `occupation` field to the form between `gender` and `phone`:

Field spec:
- Label: "Ocupación / Profesión"
- Input type: text
- Placeholder: "Ej. Médico, Ingeniero, Docente..."
- Optional field — no required validation
- Width: full width on mobile, left column on `md:` grid

Add to state:
```ts
const [formData, setFormData] = useState({
  // existing fields...
  occupation: initialData?.occupation ?? '',
})
```

Include in `onNext` and `onSaveAndExit` calls.

---

**2. `src/lib/actions/patients.ts` — update `createPatient`:**

Add `occupation` to the patient creation:
```ts
await prisma.patients.create({
  data: {
    full_name: personalData.full_name,
    id_number: personalData.id_number,
    date_of_birth: personalData.date_of_birth,
    gender: personalData.gender,
    blood_type: personalData.blood_type,
    phone: personalData.phone,
    email: personalData.email,
    address: personalData.address,
    occupation: personalData.occupation ?? null,  // ADD
    created_by: doctorId,
  }
})
```

Also update `updatePatient`:
```ts
await prisma.patients.update({
  where: { id: patientId },
  data: {
    // existing fields...
    occupation: data.occupation ?? null,  // ADD
  }
})
```

---

**3. `src/app/(dashboard)/patients/[id]/components/PersonalInfoCard.tsx`**

Add `occupation` as a new field in the personal info card, placed between gender and address:

```tsx
// Add to the fields list
{patient.occupation && (
  <div>
    <p className="text-xs text-[#9CA3AF] uppercase tracking-wide">
      Ocupación
    </p>
    <p className="text-sm text-[#1E1E2F] font-medium">
      {patient.occupation}
    </p>
  </div>
)}
```

Only render the field if `occupation` is not null or empty — do not show an empty row.

---

**4. `src/app/(dashboard)/patients/[id]/edit/PatientEditForm.tsx`**

Add `occupation` field to the edit form, same position as in Step 1 (between gender and phone):

- Label: "Ocupación / Profesión"
- Type: text
- Optional
- Pre-filled from `patient.occupation ?? ''`
- Same input style as all other fields in the form

Include in the form submission data passed to `updatePatient`.

---

**5. `src/app/(dashboard)/patients/list` — optional display:**

In `PatientsTable.tsx`, occupation does NOT need its own column — the table is already dense. No changes needed there.

---

**Type updates:**

Update any TypeScript interfaces or types that represent patient data to include the new field:

```ts
// Wherever Patient type is defined or used
occupation?: string | null
```

Search for these and update:
```bash
grep -r "full_name\|id_number\|blood_type" src/types/ src/lib/ --include="*.ts" -l
```

---

**Follow all responsive guidelines defined in `RESPONSIVE.md`. Apply mobile-first CSS using Tailwind breakpoints. Run the responsive checklist before finishing.**

**Specific responsive behavior:**
- Occupation field in Step 1: `col-span-1 md:col-span-1` — fits naturally in the existing 2-column grid
- Occupation in PersonalInfoCard: same label/value style as other fields, full width

---

**After implementing, verify:**
1. Migration ran and `occupation` column exists in Supabase
2. `prisma db pull` reflects the new column
3. New patient form Step 1 shows "Ocupación / Profesión" field
4. Saving a new patient with occupation persists to DB
5. Patient profile `/patients/[id]` shows occupation in the personal info card
6. Occupation is hidden if null or empty — no empty row shown
7. Edit patient form `/patients/[id]/edit` pre-fills occupation correctly
8. Updating occupation via edit form persists correctly
9. Existing patients without occupation show no empty field in the card
10. No TypeScript errors on `npm run build`

---
