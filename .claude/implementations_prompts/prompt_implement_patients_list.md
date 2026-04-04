
---

**Context:**
You are implementing the patients list screen for Morecedont at route `src/app/(dashboard)/patients/page.tsx`. The project uses Next.js 14+ App Router, Supabase Auth, Prisma 6, Tailwind CSS, and TypeScript. Read `DESIGN.md` and `RESPONSIVE.md` before writing any code.

**You are given:**
- A PNG mockup of the patients list screen
- An HTML/CSS file exported from the design tool

Translate both into Next.js + Tailwind following `DESIGN.md`. Do not copy the HTML directly — implement it as proper React components with real data from Prisma.

---

**Files to create:**

**1. `src/app/(dashboard)/patients/page.tsx`** — Server Component that:
- Verifies session via `getProfile()` — redirects to `/login` if null
- Accepts searchParams: `page`, `clinic`, `search`, `status`
- Fetches data via Prisma:

```ts
const PAGE_SIZE = 10

// Build where clause dynamically
const where = {
  doctor_patients: {
    some: { doctor_id: profile.id }
  },
  ...(search && {
    OR: [
      { full_name: { contains: search, mode: 'insensitive' } },
      { id_number: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ]
  })
}

// Fetch patients with pagination
const [patients, totalCount] = await Promise.all([
  prisma.patients.findMany({
    where,
    include: {
      medical_histories: {
        orderBy: { created_at: 'desc' },
        take: 1,
        include: {
          clinics: true,
          treatment_items: {
            orderBy: { item_number: 'asc' },
            take: 1
          }
        }
      },
      doctor_patients: {
        where: { doctor_id: profile.id }
      }
    },
    orderBy: { created_at: 'desc' },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE
  }),
  prisma.patients.count({ where })
])

// Fetch doctor's clinics for the filter dropdown
const doctorClinics = await prisma.doctor_clinics.findMany({
  where: { doctor_id: profile.id },
  include: { clinics: true }
})
```

- Maps results to plain serializable objects before passing to Client Components
- Derives patient status: `active` if last medical history was within 6 months, `inactive` otherwise, `pending` if no medical history yet
- Passes `patients`, `totalCount`, `totalPages`, `currentPage`, `doctorClinics` to child components

**2. `src/app/(dashboard)/patients/components/PatientsTable.tsx`** — Client Component with:
- Table columns matching mockup: FULL NAME, ID NUMBER, PHONE, LAST VISIT, CLINIC, STATUS, ACTIONS
- Full name cell: avatar with initials + colored background, full name bold, email below in gray
- Avatar background: deterministic color from name (cycle through 6 brand palette colors based on name charCode)
- ID number: prefixed `#` if not already
- Last visit: formatted `MMM dd, yyyy` using `date-fns` — show "—" if no history
- Clinic: pill/badge with clinic name — show "—" if no clinic assigned
- Status badges:
  - `active` / "Estable": green dot + `bg-green-50 text-green-700`
  - `pending` / "Pendiente": yellow dot + `bg-yellow-50 text-yellow-700`
  - `inactive` / "Inactivo": gray dot + `bg-gray-100 text-gray-500`
- Actions column: eye icon (view, links to `/patients/[id]`) + share icon (opens share modal)
- Empty state: icon + "Aún no tienes pacientes registrados" + "Agregar paciente" button linking to `/patients/new`
- Showing count text: "Mostrando 1-10 de {totalCount} pacientes"

**3. `src/app/(dashboard)/patients/components/PatientsFilters.tsx`** — Client Component with:
- Clinic dropdown filter: "Todas las clínicas" default + doctor's clinics list
  - On change: updates URL search param `clinic` using `useRouter` + `useSearchParams`
- "Más filtros" button: opens a slide-over or dropdown with status filter (Todos, Activo, Pendiente, Inactivo)
- Search is handled in the top bar's global search — do NOT add a separate search input here
- "Nuevo paciente" button: primary `#4C6FFF`, links to `/patients/new`, `+` icon left

**4. `src/app/(dashboard)/patients/components/Pagination.tsx`** — Client Component with:
- Previous / Next buttons
- Page number buttons — show first 3, ellipsis, last page
- Current page highlighted with `#4C6FFF` background
- Updates URL `page` param using `useRouter`
- Disabled state for prev on page 1 and next on last page

**5. `src/app/(dashboard)/patients/components/SharePatientModal.tsx`** — Client Component with:
- Triggered by share icon in actions column
- Modal overlay with: title "Compartir historial", search input to find doctor by name or email
- Search calls a Server Action `searchDoctors(query)` that queries `profiles` where `role = 'doctor'` and `status = 'active'`, excluding the current doctor
- Doctor result list: avatar initials, name, specialty
- "Compartir" button: inserts into `doctor_patients` with `shared_by = currentDoctorId` and `shared_at = now()`
- Success state: "Historial compartido exitosamente"
- Error handling: "Este doctor ya tiene acceso a este paciente"

**6. `src/app/(dashboard)/patients/components/BottomStatsCards.tsx`** — Server Component with 3 cards matching the mockup bottom section:

Card 1 — Monthly Growth:
- Icon: bar chart in `#4C6FFF`
- Value: "+12.5%" (calculate real % comparing this month vs last month patient count)
- Subtitle: "Nuevos registros este mes"

Card 2 — Clinic Capacity:
- Progress bar showing total patients / 500 (arbitrary MVP cap) as percentage
- Label: "X% Completo" + "Y espacios disponibles hoy" (hardcoded for MVP)
- Add `// TODO: connect to real capacity settings`

Card 3 — Next Sync:
- Dark background `#2E3A59`, white text
- Text: "Respaldo automático programado en 45 minutos."
- Link: "Ver programa →" (non-functional for MVP, `href="#"`)
- Add `// TODO: connect to real backup schedule`

**7. `src/lib/actions/patients.ts`** — Server Actions file:

```ts
// searchDoctors(query: string) — search profiles for doctors to share with
// sharePatient(patientId: string, targetDoctorId: string) — insert into doctor_patients
```

---

**URL state management:**
- All filters and pagination use URL search params — no local state for filters
- Page URL pattern: `/patients?page=2&clinic=uuid&status=active&search=query`
- Use `useSearchParams()` in Client Components to read current filters
- Use `useRouter().push()` to update filters — preserve existing params when updating one

---

**Visual fidelity rules:**
- Match the mockup exactly: table layout, avatar style, badge colors, pagination style, bottom cards
- Clinic badge: `bg-gray-100 text-gray-600`, rounded, small padding
- Table header: uppercase, `text-xs`, `#9CA3AF`, letter-spacing
- Table rows: `hover:bg-[#F9FAFC]` hover state, bottom border `#E6EAF5`
- All text in Spanish
- Action icons: outline style, `#9CA3AF` default, `#4C6FFF` on hover

---

**Follow all responsive guidelines defined in `RESPONSIVE.md`. Apply mobile-first CSS using Tailwind breakpoints. Run the responsive checklist before finishing.**

**Specific responsive behavior:**
- Mobile: table becomes a card list — each patient is a card with name, status badge, and action buttons
- Tablet (md): show table with reduced columns (hide PHONE and CLINIC)
- Desktop (lg): full table as in mockup
- Filters bar: stacked on mobile, inline on md+
- Bottom stats cards: `grid-cols-1 sm:grid-cols-3`

---

**After implementing, verify:**
1. `/patients` renders the real patient list from DB
2. Clinic filter updates the URL and filters the list correctly
3. Pagination works — page 2 shows next 10 patients
4. Share modal opens, searches doctors, and inserts into `doctor_patients`
5. Empty state shows when doctor has no patients
6. Status badges derive correctly from last visit date
7. "Nuevo paciente" button links to `/patients/new`
8. No TypeScript errors on `npm run build`
9. Card layout renders correctly at 375px with no horizontal overflow

---