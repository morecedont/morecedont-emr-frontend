**Context:**
You are fixing a critical bug in Morecedont. When a doctor tries to edit an existing clinical history record, the app returns a 404 page. The edit flow is either not implemented or the routes are broken. The project uses Next.js 14+ App Router, Supabase Auth, Prisma 6, Tailwind CSS, and TypeScript. Read `DESIGN.md` and `RESPONSIVE.md` before writing any code.

---

**First — diagnose the issue:**

Before writing any code, inspect the following and report what you find:

```bash
# Check if edit routes exist
ls src/app/(dashboard)/patients/[id]/history/[historyId]/
ls src/app/(dashboard)/patients/[id]/edit/

# Check what the Edit button links to in the history header
grep -r "Editar historia" src/
grep -r "edit" src/app/(dashboard)/patients/ --include="*.tsx"

# Check middleware is not blocking the route
cat middleware.ts
```

Report exactly which routes are missing or misconfigured before proceeding.

---

**Routes to implement:**

**1. `src/app/(dashboard)/patients/[id]/history/[historyId]/edit/page.tsx`**

Server Component that:
- Verifies session via `getProfile()` — redirects to `/login` if null
- Verifies the doctor owns this history:
```ts
const history = await prisma.medical_histories.findUnique({
  where: { id: params.historyId },
  include: {
    medical_backgrounds: true,
    dental_exams: {
      include: { tooth_records: true }
    },
    endodontics: {
      include: { endodontic_sessions: true }
    },
    treatment_items: { orderBy: { item_number: 'asc' } },
    treatment_payments: { orderBy: { payment_date: 'asc' } }
  }
})

if (!history) notFound()
if (history.doctor_id !== profile.id) notFound()
```
- Renders `<EditHistoryWizard history={history} patientId={params.id} />`

**2. `src/app/(dashboard)/patients/[id]/history/[historyId]/edit/EditHistoryWizard.tsx`** — Client Component (`"use client"`):

This is the same wizard as the new patient form BUT:
- Skips Steps 1 and 2 (personal data + emergency contact) — patient already exists
- Starts directly at Step 1 of 4: Antecedentes Médicos → Examen Clínico → Endodoncia → Plan de Tratamiento
- Pre-fills ALL form fields with existing data from the `history` prop
- Progress bar shows 4 steps (not 6)
- Every step auto-saves on "Guardar y continuar" using upsert server actions
- "Guardar y salir" saves current step and redirects to `/patients/[id]/history/[historyId]`
- "Cancelar" discards changes and redirects back without saving

Pre-fill mapping:
```ts
// Initialize state from existing history data
const [medicalBackground, setMedicalBackground] = useState(
  history.medical_backgrounds ?? defaultMedicalBackground
)
const [dentalExam, setDentalExam] = useState(
  history.dental_exams ?? defaultDentalExam
)
const [toothRecords, setToothRecords] = useState(
  history.dental_exams?.tooth_records ?? []
)
const [endodontics, setEndodontics] = useState(
  history.endodontics ?? []
)
const [treatmentItems, setTreatmentItems] = useState(
  history.treatment_items ?? []
)
const [treatmentPayments, setTreatmentPayments] = useState(
  history.treatment_payments ?? []
)
```

**3. `src/app/(dashboard)/patients/[id]/history/[historyId]/edit/components/EditProgressBar.tsx`** — Client Component:
- Same style as new patient wizard progress bar
- 4 steps: "Antecedentes Médicos", "Examen Clínico", "Endodoncia", "Plan de Tratamiento"
- Current step highlighted in `#4C6FFF`
- Completed steps show checkmark

**4. Reuse step components from the new patient wizard:**

The edit wizard reuses the exact same step components already built:
- `Step3MedicalBackground.tsx` → rename/alias as `EditStep1MedicalBackground.tsx` or pass an `initialData` prop if not already supported
- `Step4DentalExam.tsx` → `EditStep2DentalExam.tsx`
- `Step5Endodontics.tsx` → `EditStep3Endodontics.tsx`
- `Step6TreatmentPlan.tsx` → `EditStep4TreatmentPlan.tsx`

If the existing step components don't accept `initialData` props yet, add that prop to each:
```ts
interface StepProps {
  initialData?: Partial<StepData>
  onNext: (data: StepData) => void
  onBack: () => void
  onSaveAndExit: (data: StepData) => void
}
```

**5. Update server actions in `src/lib/actions/patients.ts`:**

All existing save actions already use upsert — verify this is the case. If any use `create` instead of `upsert`, fix them:

```ts
// saveMedicalBackground — must use upsert
await prisma.medical_backgrounds.upsert({
  where: { medical_history_id: medicalHistoryId },
  update: { ...data },
  create: { medical_history_id: medicalHistoryId, ...data }
})

// saveDentalExam — must use upsert
await prisma.dental_exams.upsert({
  where: { medical_history_id: medicalHistoryId },
  update: { ...examData },
  create: { medical_history_id: medicalHistoryId, ...examData }
})

// tooth_records — use deleteMany + createMany for simplicity
await prisma.tooth_records.deleteMany({
  where: { dental_exam_id: dentalExamId }
})
await prisma.tooth_records.createMany({
  data: toothRecords.map(r => ({ dental_exam_id: dentalExamId, ...r }))
})

// saveEndodontics — upsert by id if exists, create if new
// saveEndodonticSessions — deleteMany + createMany per endodontic record

// saveTreatmentItems — deleteMany + createMany
await prisma.treatment_items.deleteMany({
  where: { medical_history_id: medicalHistoryId }
})
await prisma.treatment_items.createMany({ data: items })

// saveTreatmentPayments — only insert new ones, never delete existing payments
```

**6. Fix all "Editar historia" buttons and links across the app:**

Search and fix every place that should link to the edit route:
```bash
grep -r "Editar historia\|editarHistoria\|history.*edit\|edit.*history" src/ --include="*.tsx"
```

Every "Editar historia" button must link to:
```
/patients/[id]/history/[historyId]/edit
```

Using `next/link` or `useRouter().push()` — never `href="#"` or missing href.

**7. Fix `src/app/(dashboard)/patients/[id]/edit/page.tsx`** — if missing, create it:

This is for editing patient personal data (not the history). Simple Server Component:
- Fetches patient data
- Verifies doctor access
- Renders a form pre-filled with patient data
- On save: calls server action `updatePatient(patientId, data)` that updates `patients` table
- On success: redirects to `/patients/[id]`
- Fields: full name, ID number, date of birth, gender, phone, email, address, blood type

Add `updatePatient` to `src/lib/actions/patients.ts`:
```ts
async function updatePatient(patientId: string, doctorId: string, data: PatientUpdateData) {
  // Verify doctor has access
  const access = await prisma.doctor_patients.findUnique({
    where: { doctorId_patientId: { doctor_id: doctorId, patient_id: patientId } }
  })
  if (!access) throw new Error('Unauthorized')

  return prisma.patients.update({
    where: { id: patientId },
    data
  })
}
```

---

**Navigation fixes — verify these work end to end:**

```
/patients/[id]
  → click history row → /patients/[id]/history/[historyId]        ✓ must work
  → click "Editar registros" → /patients/[id]/edit                ✓ must work

/patients/[id]/history/[historyId]
  → click "Editar historia" → /patients/[id]/history/[historyId]/edit   ✓ must work
  → click breadcrumb "Pacientes" → /patients                            ✓ must work
  → click breadcrumb patient name → /patients/[id]                      ✓ must work

/patients/[id]/history/[historyId]/edit
  → complete all steps → redirect to /patients/[id]/history/[historyId] ✓ must work
  → click "Cancelar" → redirect to /patients/[id]/history/[historyId]   ✓ must work
  → click "Guardar y salir" → redirect to /patients/[id]/history/[historyId] ✓ must work
```

---

**Follow all responsive guidelines defined in `RESPONSIVE.md`. Apply mobile-first CSS using Tailwind breakpoints. Run the responsive checklist before finishing.**

---

**After implementing, verify:**
1. Clicking "Editar historia" from `/patients/[id]/history/[historyId]` navigates correctly with no 404
2. Edit wizard opens with all fields pre-filled from existing data
3. Saving each step upserts correctly — no duplicate records created
4. "Guardar y salir" saves and redirects correctly
5. "Cancelar" discards and redirects without saving
6. Editing patient personal data at `/patients/[id]/edit` works correctly
7. All breadcrumb links navigate to the correct routes
8. No TypeScript errors on `npm run build`
9. Run the app and manually test the full edit flow end to end before finishing