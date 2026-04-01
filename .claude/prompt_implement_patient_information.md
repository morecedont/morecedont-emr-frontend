
---

**Context:**
You are implementing the new patient intake wizard for Morecedont at route `src/app/(dashboard)/patients/new/`. The project uses Next.js 14+ App Router, Supabase Auth, Prisma 6, Tailwind CSS, and TypeScript. Read `DESIGN.md` and `RESPONSIVE.md` before writing any code.

**You are given:**
- PNG mockup of Step 1 (Personal Data)
- PNG mockup of Step 2 (Medical Background / Clinical History)
- HTML/CSS files exported from the design tool for both screens

Translate both into Next.js + Tailwind following `DESIGN.md`. Do not copy HTML directly.

---

**Wizard structure — 6 steps total:**

```
Step 1 → Datos personales
Step 2 → Contacto de emergencia y última visita
Step 3 → Antecedentes médicos
Step 4 → Examen clínico + odontograma
Step 5 → Endodoncia
Step 6 → Plan de tratamiento y presupuesto
```

**Important behavior:**
- Steps 1 and 2 create the `patients` record — saved to DB on completing Step 2
- Steps 3 through 6 create the `medical_histories` and all child records — saved incrementally per step
- The wizard must allow saving progress at any step from Step 3 onward — "Guardar y continuar" saves the current step to DB and advances, "Guardar y salir" saves and redirects to `/patients/[id]`
- If the doctor abandons after Step 2, the patient exists in DB but has no medical history yet — this is valid
- Progress bar at the top shows all 6 steps with current step highlighted in `#4C6FFF`

---

**Files to create:**

**1. `src/app/(dashboard)/patients/new/page.tsx`** — Server Component:
- Verifies session via `getProfile()` — redirects to `/login` if null
- Fetches doctor's clinics for the clinic selector in Step 2:
```ts
const doctorClinics = await prisma.doctor_clinics.findMany({
  where: { doctor_id: profile.id },
  include: { clinics: true }
})
```
- Renders `<NewPatientWizard doctorId={profile.id} clinics={doctorClinics} />`

**2. `src/app/(dashboard)/patients/new/NewPatientWizard.tsx`** — Client Component (`"use client"`):
- Manages current step with `useState`
- Stores form data across steps with `useState` — one state object per step group:
```ts
const [personalData, setPersonalData] = useState({...})
const [emergencyData, setEmergencyData] = useState({...})
const [medicalBackground, setMedicalBackground] = useState({...})
const [dentalExam, setDentalExam] = useState({...})
const [endodontics, setEndodontics] = useState({...})
const [treatmentPlan, setTreatmentPlan] = useState({...})
const [patientId, setPatientId] = useState<string | null>(null)
const [medicalHistoryId, setMedicalHistoryId] = useState<string | null>(null)
```
- Renders the progress bar and the current step component
- Passes `onNext`, `onBack`, `onSaveAndExit` callbacks to each step

**3. `src/app/(dashboard)/patients/new/components/ProgressBar.tsx`** — Client Component:
- 6 steps shown horizontally with connector lines
- Each step: circle with number + label below
- Completed steps: filled `#4C6FFF` circle with checkmark
- Current step: filled `#4C6FFF` circle with number, bold label
- Pending steps: gray circle with number, gray label
- Connector line: `#4C6FFF` if step is completed, `#E6EAF5` if pending
- On mobile: show only current step label + "Paso X de 6"

---

**Step components:**

**4. `src/app/(dashboard)/patients/new/steps/Step1PersonalData.tsx`** — Client Component:
Fields matching mockup:
- Full Legal Name (full width) — required
- Patient ID / Cédula (right column) — required
- Date of Birth (date picker) — required
- Gender Identity (dropdown: Masculino, Femenino, Otro, Prefiero no decir)
- Blood Type (dropdown: A+, A-, B+, B-, AB+, AB-, O+, O-, Desconocido)
- Phone Number — required
- Email Address
- Home Address (textarea)

Bottom info cards (matching mockup):
- "Cumple con privacidad médica" with shield icon
- "Validación inteligente" — duplicate check on ID + DOB
- "¿Necesitas ayuda?" with support contact

Client-side validation before advancing:
- Full name, ID, DOB, phone required
- Email format if provided
- Duplicate check: call server action `checkDuplicatePatient(idNumber, dateOfBirth)` that queries `prisma.patients.findFirst` matching both fields — show warning modal if duplicate found, allow override

On "Continuar al Paso 2 →": validate and advance to Step 2

**5. `src/app/(dashboard)/patients/new/steps/Step2EmergencyContact.tsx`** — Client Component:
Fields:
- Emergency contact name — required
- Emergency contact phone — required
- Last dental visit (date picker)
- Clinic selector (dropdown of doctor's clinics) — optional
- Currency selector (USD, VES, EUR) — for the treatment plan budget

"Guardar paciente y continuar →" button:
- Calls server action `createPatient(personalData, emergencyData, doctorId)`
- Server action:
```ts
// 1. Insert into patients
// 2. Insert into doctor_patients with shared_by = null
// 3. Insert into medical_histories with currency and clinic_id
// 4. Returns { patientId, medicalHistoryId }
```
- On success: stores `patientId` and `medicalHistoryId` in wizard state, advances to Step 3
- On error: shows error message inline

**6. `src/app/(dashboard)/patients/new/steps/Step3MedicalBackground.tsx`** — Client Component:
Matches the second PNG mockup exactly — 6 system cards in a 3x2 grid:

Card layout: icon + system name header, checkboxes below

Systems and their checkboxes mapped to `medical_backgrounds` columns:
- ❤️ **Cardiovascular**: Problemas cardiacos (`cardio_heart_problems`), Fiebre reumática (`cardio_rheumatic_fever`), Prolapso válvula mitral (`cardio_mitral_valve_prolapse`), Fatiga fácil (`cardio_easy_fatigue`), Presión arterial alta (`cardio_high_blood_pressure`), Antibióticos antes del tratamiento (`cardio_antibiotics_before`)
- 🫁 **Respiratorio**: Gripe frecuente (`resp_frequent_flu`), Tuberculosis (`resp_tuberculosis`), Asma/sinusitis (`resp_asthma_sinusitis`), Tos crónica/sangrado (`resp_chronic_cough_blood`)
- 🧬 **Endocrino**: Diabetes (`endo_diabetes`), Problemas de tiroides (`endo_thyroid_problems`), Sed/orina frecuente (`endo_thirst_frequent_urination`), Otro glandular (`endo_other_glandular`)
- 🧠 **Neurológico**: Tratamiento psiquiátrico (`neuro_psychiatric_treatment`), Tiroides (`neuro_thyroid_problems`), Depresión frecuente (`neuro_frequent_depression`)
- 🫀 **Gástrico y Renal**: Hígado (`gastro_liver_problems`), Reflujo/vómitos (`gastro_reflux_vomiting`), Úlceras (`gastro_ulcers`), Diarrea frecuente (`gastro_frequent_diarrhea`), Pérdida de peso (`gastro_unexplained_weight_loss`), Riñones (`renal_kidney_problems`), ETS (`renal_sti`)
- ♀️ **Salud de la mujer**: Anticonceptivos (`female_contraceptives`), Osteoporosis (`female_osteoporosis`), Embarazada (`female_pregnant`), Lactancia (`female_breastfeeding`)

Also: Inmunológico section below grid — (`immun_drug_allergy`, `immun_autoimmune_disease`, `immun_immunosuppressants`) + Sangre section (`blood_anemia`, `blood_leukemia`, `blood_easy_bleeding`)

"Observaciones clínicas y alergias" textarea at the bottom (free text, stored in a `notes` field — add this as nullable text column note for later migration)

Allergy tags: user can type an allergy and press Enter to add it as a tag — stored as comma-separated text in observations for MVP

"Guardar y continuar" button:
- Calls server action `saveMedicalBackground(medicalHistoryId, backgroundData)`
- Inserts or upserts into `medical_backgrounds`

**7. `src/app/(dashboard)/patients/new/steps/Step4DentalExam.tsx`** — Client Component:

Two sections:

**Section A — Lista de problemas** (7 boolean toggles as styled toggle switches):
- ATM, Apiñamiento, Periodontitis, Gingivitis, Hábitos, Toma Aspirina, Cordales para extraer
- Estado de erupción: radio buttons (Erupcionado / Semi / No erupcionado)

**Section B — Odontograma** (interactive):
- 32 teeth displayed in FDI notation layout — upper row (18-11, 21-28) and lower row (48-41, 31-38)
- Each tooth is a clickable box showing its number
- Clicking a tooth opens a small popover with status options: Sano, Caries, Extraído, Restaurado, Corona, Implante, Ausente, Endodoncia
- Selected status shown with a color dot on the tooth:
  - Sano: white/default
  - Caries: orange
  - Extraído: red with X
  - Restaurado: blue
  - Corona: purple
  - Implante: teal
  - Endodoncia: yellow
- Tooth state stored in `dentalExam.toothRecords` array: `{ toothNumber, vestibularStatus, lingualStatus }`

Text fields below: Especificaciones, Observaciones, Diagnóstico definitivo, Plan de tratamiento (notas)

"Guardar y continuar" button:
- Calls server action `saveDentalExam(medicalHistoryId, examData, toothRecords)`
- Upserts `dental_exams` and batch upserts `tooth_records`

**8. `src/app/(dashboard)/patients/new/steps/Step5Endodontics.tsx`** — Client Component:

Tooth selector at top: input to enter tooth number being treated

Sections with radio buttons / selects matching the DDL:
- **Anamnesis**: Dolor (Espontáneo/Provocado) + intensidad 1-10 slider, Tipo (Agudo/Sordo/Pulsátil), Alivio con (Frío/Calor/Analgésicos)
- **Examen clínico**: Percusión vertical/horizontal (+/-), Palpación apical/encía (+/-), Movilidad (Grado I/II/III), Pruebas térmicas (text)
- **Examen radiográfico**: Cámara pulpar (Normal/Calcificada/Abierta), Conductos (Visibles/Atresiados/Curvatura), Zona periapical (Radiolucidez/L.P. Engrosado)
- **Diagnóstico**: Pulpar (text), Periapical (text)
- **Conductometría**: Conducto, Referencia, Longitud (text fields)
- **Protocolo**: NaOCl % (number input), EDTA (checkbox), Instrumentación (Manual/Rotatoria), Obturación (Condensación Lateral/Termoplástica)

Chronogram section: list of sessions with date picker + activity dropdown (options from `EndodonticActivity` enum). "Agregar sesión" button adds a new row.

Note: Endodoncia is optional — show "Omitir este paso" link that skips to Step 6

"Guardar y continuar" button:
- Calls server action `saveEndodontics(medicalHistoryId, endodonticData, sessions)`

**9. `src/app/(dashboard)/patients/new/steps/Step6TreatmentPlan.tsx`** — Client Component:

Two sections:

**Section A — Ítems del plan** (up to 33 items):
- Dynamic list — "Agregar procedimiento" button adds a new row
- Each row: item number (auto), description text input, cost number input
- Currency shown as label next to cost (inherited from Step 2 selection)
- Total cost calculated and shown at the bottom
- Remove row button (×) on each row

**Section B — Registro de pagos**:
- Table with columns: Fecha, U.D. (Unidad Dental), Actividad Clínica, Costo, Abono, Saldo
- "Agregar pago" button adds a new payment row
- Saldo calculated as Costo - Abono (read-only)
- Total balance shown at the bottom

"Guardar historia clínica completa" button:
- Calls server action `saveTreatmentPlan(medicalHistoryId, items, payments)`
- On success: shows success toast + redirects to `/patients/[patientId]`

"Guardar y salir" secondary button:
- Saves current state and redirects to `/patients/[patientId]`

---

**Server Actions — `src/lib/actions/patients.ts`** (add to existing file):

```ts
checkDuplicatePatient(idNumber: string, dateOfBirth: string): Promise<boolean>
createPatient(personalData, emergencyData, doctorId): Promise<{ patientId, medicalHistoryId }>
saveMedicalBackground(medicalHistoryId, data): Promise<void>
saveDentalExam(medicalHistoryId, examData, toothRecords): Promise<void>
saveEndodontics(medicalHistoryId, data, sessions): Promise<void>
saveTreatmentPlan(medicalHistoryId, items, payments): Promise<void>
```

All server actions must:
- Verify the calling doctor owns the `medical_history_id` before writing
- Use `prisma.upsert` where possible to allow re-saving the same step
- Return `{ error: string }` on failure — never throw

---

**Visual fidelity rules:**
- Step 1 and 2: match PNG mockup exactly — white card, field layout, bottom info cards
- Step 3: match second PNG mockup — system cards with icons, checkbox style, allergy tags
- Steps 4-6: clean consistent style matching the overall design system from `DESIGN.md`
- Checkboxes: custom styled with `#4C6FFF` when checked
- Toggle switches: `#4C6FFF` when on, `#E6EAF5` when off
- All labels and text in Spanish
- Active step in progress bar: `#4C6FFF` filled circle
- Completed steps: `#4C6FFF` with white checkmark

---

**Follow all responsive guidelines defined in `RESPONSIVE.md`. Apply mobile-first CSS using Tailwind breakpoints. Run the responsive checklist before finishing.**

**Specific responsive behavior:**
- Progress bar: step numbers only on mobile, labels visible from `md:`
- Form grids: `grid-cols-1 md:grid-cols-2` for field pairs
- Odontogram: scrollable horizontally on mobile, full layout on `lg:`
- System cards: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Treatment plan table: card layout on mobile, table on `md:`
- Navigation buttons (Back/Next): full width stacked on mobile, inline on `sm:`

---

**After implementing, verify:**
1. Completing Steps 1+2 creates a `patients` row and a `medical_histories` row in Supabase
2. Each subsequent step upserts its corresponding table correctly
3. Duplicate patient check fires on Step 1 when ID + DOB are filled
4. Odontogram allows clicking any tooth and selecting a status
5. Endodoncia step can be skipped
6. Treatment plan calculates totals correctly
7. On Step 6 completion, redirects to `/patients/[patientId]`
8. Abandoning after Step 2 leaves a valid patient with no medical history
9. No TypeScript errors on `npm run build`
10. No horizontal overflow at 375px on any step

---
