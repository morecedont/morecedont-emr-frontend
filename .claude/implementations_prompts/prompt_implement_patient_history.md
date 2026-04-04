
---

**Context:**
You are implementing two screens for the patient profile and clinical history flow in Morecedont. The project uses Next.js 14+ App Router, Supabase Auth, Prisma 6, Tailwind CSS, and TypeScript. Read `DESIGN.md` and `RESPONSIVE.md` before writing any code.

**You are given:**
- PNG + HTML for Screen 1: Patient Profile (`/patients/[id]`)
- PNG + HTML for Screen 2: Clinical History Detail (`/patients/[id]/history/[historyId]`)

Translate both into Next.js + Tailwind following `DESIGN.md`. Do not copy HTML directly.

**Critical correction before starting:**
Both mockups show incorrect sidebar items (Medications, Lab Results, Clinical Notes, New Consultation button). Ignore those completely — use the existing sidebar already implemented in `src/app/(dashboard)/layout.tsx` which has: Dashboard, Pacientes, Clínicas, Configuración.

---

## Screen 1 — Patient Profile

**File:** `src/app/(dashboard)/patients/[id]/page.tsx`

**Server Component that:**
- Verifies session via `getProfile()` — redirects to `/login` if null
- Fetches patient data:

```ts
// Verify doctor has access to this patient
const doctorPatient = await prisma.doctor_patients.findUnique({
  where: {
    doctorId_patientId: {
      doctor_id: profile.id,
      patient_id: params.id
    }
  }
})
if (!doctorPatient) notFound()

// Fetch patient with all medical histories
const patient = await prisma.patients.findUnique({
  where: { id: params.id },
  include: {
    medical_histories: {
      orderBy: { created_at: 'desc' },
      include: {
        clinics: true,
        treatment_items: {
          orderBy: { item_number: 'asc' },
          take: 1
        },
        medical_backgrounds: {
          select: {
            immun_drug_allergy: true,
            blood_easy_bleeding: true
          }
        }
      }
    }
  }
})
if (!patient) notFound()

// Fetch attachments for documents card
const attachments = await prisma.attachments.findMany({
  where: {
    medical_history: {
      patient_id: params.id,
      doctor_id: profile.id
    }
  },
  orderBy: { uploaded_at: 'desc' },
  take: 3
})
```

- Derives patient age from `date_of_birth`
- Derives history status: `active` if `created_at` within 6 months and no subsequent history, `completed` if older, `paused` if manually set (use `active` as default for MVP)
- Maps all data to plain serializable objects
- Passes to Client Components

**Files to create:**

**1. `src/app/(dashboard)/patients/[id]/page.tsx`** — Server Component as described above rendering:
```tsx
<PatientProfileHeader patient={patient} />
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
  <div className="lg:col-span-2 space-y-6">
    <TreatmentHistoryList histories={histories} patientId={params.id} />
    <PatientAlertsDocuments patient={patient} attachments={attachments} />
  </div>
  <div className="space-y-4">
    <PersonalInfoCard patient={patient} />
    <EmergencyContactCard patient={patient} />
    <ClinicalInfoCard patient={patient} />
  </div>
</div>
```

**2. `src/app/(dashboard)/patients/[id]/components/PatientProfileHeader.tsx`** — Client Component:
- Large avatar with initials, `#4C6FFF` background, green active dot
- Patient name large bold
- Inline chips: age (calendar icon), blood type (drop icon), phone (phone icon)
- Right buttons: "Compartir expediente" ghost + share icon, "Nueva historia clínica" filled `#4C6FFF` + icon
- "Nueva historia clínica" links to `/patients/[id]/history/new`
- "Compartir expediente" opens `SharePatientModal` (reuse from patients list)

**3. `src/app/(dashboard)/patients/[id]/components/TreatmentHistoryList.tsx`** — Client Component:
- Title "Historial de tratamientos" + "Ver todo →" link
- Each history row is a card matching mockup:
  - Left: colored dot (green=active, blue=completed, yellow=paused)
  - Date range: "OCT 2023 — EN CURSO" or "MAR 2022 — JUN 2022" in gray small caps
  - Clinic badge: `#E6EAF5` background pill
  - Title: first treatment item description or "Sin procedimientos registrados" in bold
  - Below: status badge + doctor name (from `profiles`) + summary text
  - Right: chevron icon — entire row links to `/patients/[id]/history/[historyId]`
- Status badges: Activo `bg-green-50 text-green-700`, Completado `bg-blue-50 text-blue-700`, En pausa `bg-yellow-50 text-yellow-700`
- Empty state: icon + "No hay historias clínicas registradas" + "Crear primera historia clínica" button linking to `/patients/[id]/history/new`

**4. `src/app/(dashboard)/patients/[id]/components/PatientAlertsDocuments.tsx`** — Client Component:
Two cards side by side:

Alerts card:
- Icon + "ALERTAS" label
- List of allergy alerts derived from `medical_backgrounds` — show allergy names as tags
- If no alerts: "Sin alertas registradas"
- Timestamp: "Registrado hace X años" using `date-fns` `formatDistanceToNow`

Documents card:
- Icon + "DOCUMENTOS" label
- List of recent attachments with filename
- "Ver archivos recientes" link → future scope, `href="#"` for MVP
- If no attachments: "Sin documentos adjuntos"

**5. `src/app/(dashboard)/patients/[id]/components/PersonalInfoCard.tsx`** — Server Component:
- Title "Información personal" + "Editar" link → `/patients/[id]/edit`
- Fields with label/value pairs: Nombre completo, DNI/ID, F. Nacimiento, Género, Dirección
- Label style: `text-xs text-gray-400 uppercase tracking-wide`
- Value style: `text-sm text-[#1E1E2F] font-medium`

**6. `src/app/(dashboard)/patients/[id]/components/EmergencyContactCard.tsx`** — Server Component:
- Title "Contacto de emergencia"
- Avatar with initials, contact name, relationship if available
- Phone number in `#4C6FFF` with phone icon

**7. `src/app/(dashboard)/patients/[id]/components/ClinicalInfoCard.tsx`** — Server Component:
- Title "Información clínica"
- Fields: Última visita, Clínica preferida, Moneda preferida
- Same label/value style as PersonalInfoCard

---

## Screen 2 — Clinical History Detail

**File:** `src/app/(dashboard)/patients/[id]/history/[historyId]/page.tsx`

**Server Component that:**
- Verifies session and doctor access to patient (same check as Screen 1)
- Fetches full history:

```ts
const history = await prisma.medical_histories.findUnique({
  where: { id: params.historyId },
  include: {
    patients: true,
    clinics: true,
    medical_backgrounds: true,
    dental_exams: {
      include: { tooth_records: true }
    },
    endodontics: {
      include: { endodontic_sessions: true }
    },
    treatment_items: {
      orderBy: { item_number: 'asc' }
    },
    treatment_payments: {
      orderBy: { payment_date: 'asc' }
    },
    attachments: true
  }
})
if (!history) notFound()
if (history.doctor_id !== profile.id) notFound()
```

- Maps to plain serializable objects
- Passes to tab components

**Files to create:**

**8. `src/app/(dashboard)/patients/[id]/history/[historyId]/page.tsx`** — Server Component rendering:
```tsx
<HistoryHeader history={history} patient={patient} />
<HistoryTabs history={history} />
```

**9. `src/app/(dashboard)/patients/[id]/history/[historyId]/components/HistoryHeader.tsx`** — Client Component matching mockup:
- Compact avatar + patient name + age chip + blood type chip
- Second line: clinic badge + date range + status badge (Activo green)
- Right: "Imprimir" ghost button + "Editar historia" filled `#4C6FFF`
- "Editar historia" links to `/patients/[id]/history/[historyId]/edit`
- Footer bar at very bottom of page (fixed): "● SINCRONIZADO" left + "ID PACIENTE: {idNumber}" center + "Última edición: {date} por Dr. {name}" right — same style as mockup

**10. `src/app/(dashboard)/patients/[id]/history/[historyId]/components/HistoryTabs.tsx`** — Client Component (`"use client"`):
- 4 tabs: Antecedentes Médicos, Examen Clínico, Endodoncia, Plan de Tratamiento
- Active tab: bold, `#4C6FFF` underline
- Uses `useState` to track active tab
- Renders the correct tab content component

**11. `src/app/(dashboard)/patients/[id]/history/[historyId]/components/tabs/MedicalBackgroundTab.tsx`** — Client Component:

Critical allergy banner at top (if any allergy fields are true):
- Red/pink banner matching mockup: `bg-red-50 border border-red-200`
- Shows allergy tags derived from boolean fields: `immun_drug_allergy` → "ALERGIA A MEDICAMENTOS", custom allergies from observations text
- Warning triangle icon in red

6 system cards in `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`:
Each card matches mockup style — icon top right, system name in gray small caps, condition name bold, description text below:
- ❤️ Cardiovascular: maps all `cardio_*` booleans
- 🫁 Respiratorio: maps all `resp_*` booleans
- 🧬 Endocrino: maps all `endo_*` booleans
- 🧠 Neurológico: maps all `neuro_*` booleans
- 🫀 Gástrico y Renal: maps all `gastro_*` + `renal_*` booleans
- ♀️ Salud de la Mujer: maps all `female_*` booleans

For each system card:
- If any boolean is true: show the condition name bold + generic description text
- If all false: show system name + "Normal" in gray + "Sin patologías detectadas"

Inmunológico + Sangre as two cards side by side below grid:
- Maps `immun_*` and `blood_*` booleans
- Shows relevant tags below

Observaciones clínicas y alergias section:
- Title + "Editar antecedentes" button top right → opens edit modal or links to edit page
- Quoted text block with observations content
- No observations: "Sin observaciones registradas"

**12. `src/app/(dashboard)/patients/[id]/history/[historyId]/components/tabs/DentalExamTab.tsx`** — Client Component:

Section A — Lista de problemas:
- 7 rows: label + YES/NO badge
- YES: `bg-red-50 text-red-600 rounded-full px-3 py-1 text-xs`
- NO: `bg-gray-100 text-gray-400 rounded-full px-3 py-1 text-xs`
- Eruption status as badge below

Section B — Odontograma:
- Reuse the odontogram component from the new patient wizard
- Read-only by default — "Editar" button top right unlocks it
- Color legend below matching tooth statuses
- Text blocks below: Especificaciones, Observaciones, Diagnóstico definitivo, Plan de tratamiento notas

**13. `src/app/(dashboard)/patients/[id]/history/[historyId]/components/tabs/EndodonticsTab.tsx`** — Client Component:

Empty state if `history.endodontics.length === 0`:
- Icon + "No hay registros de endodoncia" + "Agregar endodoncia" button

If records exist — for each endodontic record:
- Tooth number as section header
- Cards per section: Anamnesis, Examen Clínico, Examen Radiográfico, Diagnóstico, Conductometría, Protocolo
- Each card: labeled badges for enum values, text for free fields
- Pain intensity: visual bar 1-10

Chronogram below:
- Timeline list: date + activity badge + notes
- Activity badge colors: opening/biopulpectomy blue, postop/distance control green
- "Agregar sesión" button

**14. `src/app/(dashboard)/patients/[id]/history/[historyId]/components/tabs/TreatmentPlanTab.tsx`** — Client Component:

Section A — Treatment items:
- Table: #, Descripción, Costo (with currency label in header)
- Total row bold at bottom
- Empty state if no items

Section B — Payment history:
- Table: Fecha, U.D., Actividad Clínica, Costo, Abono, Saldo
- Saldo: green text if 0, red if > 0
- Totals row: Total costo, Total abonado, Saldo pendiente
- "Agregar pago" button → opens inline form row or modal

**15. `src/lib/actions/payments.ts`** — new Server Actions file:
```ts
// addPayment(medicalHistoryId, paymentData) — inserts into treatment_payments
// verifies doctor owns the medical_history before inserting
```

---

**Shared components to create or reuse:**

**`src/components/shared/Odontogram.tsx`** — extract from the new patient wizard if already created, make it reusable with `readOnly` prop:
```ts
interface OdontogramProps {
  toothRecords: ToothRecord[]
  readOnly?: boolean
  onChange?: (records: ToothRecord[]) => void
}
```

**`src/components/shared/PatientAvatar.tsx`** — reusable avatar with initials:
```ts
interface PatientAvatarProps {
  fullName: string
  size?: 'sm' | 'md' | 'lg'
  showStatusDot?: boolean
  isActive?: boolean
}
```

---

**Server Action for new history:**
Add to `src/lib/actions/patients.ts`:
```ts
// createMedicalHistory(patientId, doctorId, clinicId, currency)
// Creates a new medical_histories record and redirects to the wizard
// Route: /patients/[id]/history/new → redirects to wizard pre-filled with patientId
```

Update `src/app/(dashboard)/patients/[id]/history/new/page.tsx` as a redirect handler:
```ts
// Server Component that creates the medical history record
// then redirects to /patients/new with the historyId pre-filled
// so the wizard continues from Step 3 (medical background)
// since patient personal data already exists
```

---

**Visual fidelity rules:**
- Screen 1: match mockup 2 exactly — history rows, alert/document cards, right column cards
- Screen 2: match mockup 3 exactly — compact header, allergy banner, system cards with text descriptions, footer bar
- Footer sync bar: `border-t border-[#E6EAF5]`, fixed bottom, `text-xs text-gray-400`
- All text in Spanish
- Breadcrumbs: use `next/link`, gray separator `>`

---

**Follow all responsive guidelines defined in `RESPONSIVE.md`. Apply mobile-first CSS using Tailwind breakpoints. Run the responsive checklist before finishing.**

**Specific responsive behavior:**
- Screen 1 grid: `grid-cols-1 lg:grid-cols-3` — right column stacks below on mobile
- Alert/document cards: `grid-cols-1 sm:grid-cols-2`
- Screen 2 tabs: horizontally scrollable on mobile with `overflow-x-auto`
- System cards grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Odontogram: horizontally scrollable on mobile
- Treatment tables: card layout on mobile, table on `md:`
- Footer sync bar: hidden on mobile, visible from `md:`

---

**After implementing, verify:**
1. `/patients/[id]` shows correct patient data and list of medical histories
2. Clicking a history row navigates to `/patients/[id]/history/[historyId]`
3. "Nueva historia clínica" creates a new record and redirects to the wizard at Step 3
4. Allergy banner appears on the Antecedentes tab when relevant boolean fields are true
5. Odontogram renders correctly in read-only mode with color coding
6. Treatment plan totals calculate correctly
7. Doctor without access to patient gets `notFound()`
8. Footer shows correct patient ID and last edit date
9. No TypeScript errors on `npm run build`
10. No horizontal overflow at 375px on either screen

---