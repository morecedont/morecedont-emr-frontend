---

**Context:**
You are implementing the main dashboard screen for Morecedont at route `src/app/(dashboard)/dashboard/page.tsx`. The project uses Next.js 14+ App Router, Supabase Auth, Prisma 6, Tailwind CSS, and TypeScript. Read `DESIGN.md` and `RESPONSIVE.md` before writing any code.

**You are given:**
- A PNG mockup of the dashboard screen
- An HTML/CSS file exported from the design tool

Translate both into Next.js + Tailwind following `DESIGN.md`. Do not copy the HTML directly — implement it as proper React components with real data from Supabase/Prisma.

---

**Layout structure:**
The dashboard uses a two-panel layout already defined in `src/app/(dashboard)/layout.tsx`:
- **Left sidebar** (fixed, dark `#2E3A59`): Morecedont logo + tagline, nav items (Dashboard, Patients, Clinics, Settings), storage usage bar at the bottom
- **Main content area**: top bar + page content

Do not recreate the sidebar or top bar inside the page — they live in the layout. If they are not yet implemented in the layout, implement them there first.

---

**Files to create or update:**

**1. `src/app/(dashboard)/layout.tsx`** — if not fully implemented yet, build it now with:

Sidebar:
- Logo "Morecedont" + subtitle "CLINICAL CURATOR" at the top in white
- Nav items with icons: Dashboard (`/dashboard`), Patients (`/patients`), Clinics (`/clinics`), Settings (`/settings`)
- Active item: background `#4C6FFF`, rounded, white text and icon
- Inactive items: white/gray text, hover state `#3A4A6B`
- Storage usage card at the bottom: label "Storage Usage", progress bar in `#4C6FFF`, subtitle text showing used/total GB
- Sidebar is fixed on desktop, hidden on mobile (toggled by hamburger in top bar)

Top bar:
- Page title left-aligned (passed as prop or read from pathname)
- Search input center: placeholder "Search records...", `#E6EAF5` background, rounded-full
- Right side: notification bell icon, help icon, doctor name + role + avatar
- Doctor name and role fetched from `profiles` table via `getProfile()`
- Top bar background: white, bottom border `#E6EAF5`

**2. `src/app/(dashboard)/dashboard/page.tsx`** — Server Component that:
- Calls `getProfile()` — redirects to `/login` if null
- Fetches real data via Prisma:

```ts
// Total patients count
const totalPatients = await prisma.doctor_patients.count({
  where: { doctor_id: profile.id }
})

// Recent consultations count (medical_histories created in last 30 days)
const recentConsultations = await prisma.medical_histories.count({
  where: {
    doctor_id: profile.id,
    created_at: { gte: subDays(new Date(), 30) }
  }
})

// Recent patients (last 4 with their latest medical history)
const recentPatients = await prisma.doctor_patients.findMany({
  where: { doctor_id: profile.id },
  include: {
    patients: {
      include: {
        medical_histories: {
          orderBy: { created_at: 'desc' },
          take: 1
        }
      }
    }
  },
  orderBy: { shared_at: 'desc' },
  take: 4
})
```

- Passes all fetched data as props to Client Components
- Install `date-fns` if not already installed: `npm install date-fns`

**3. `src/app/(dashboard)/dashboard/components/StatsCards.tsx`** — Server Component with 3 cards:

Card 1 — Total Patients:
- Icon: users group outline, `#4C6FFF` background pill
- Badge: "+12.5%" in green
- Value: `totalPatients` (real count from DB)
- Subtitle: "Updated 2 mins ago"
- Background: white, shadow-sm

Card 2 — Recent Consultations:
- Icon: stethoscope outline
- Badge: "Busy" in blue
- Value: `recentConsultations`
- Subtitle: "Average per day calculated from last 30 days"
- Background: white, shadow-sm

Card 3 — Upcoming Today:
- Background: `#4C6FFF` (solid blue, all text white)
- Icon: calendar
- Value: large number (hardcoded `0` for MVP — appointments feature is future scope)
- Subtitle: "No appointments scheduled" for MVP
- Note: add a `// TODO: appointments feature` comment

**4. `src/app/(dashboard)/dashboard/components/RecentPatientsTable.tsx`** — Client Component with:
- Header: "Recent Patients" title + "View All" link to `/patients` in `#4C6FFF`
- Table columns: PATIENT NAME, LAST VISIT, PROCEDURE, STATUS
- Patient name cell: avatar with initials (first letter of first + last name), full name bold, ID number below in gray
- Last visit: formatted date using `date-fns` `format(date, 'MMM dd, yyyy')`
- Procedure: last treatment item description from `medical_histories` — show "—" if none
- Status badge: "active" (green soft bg) or "inactive" (gray soft bg) — derive from whether last visit was within 6 months
- If no patients yet: empty state with icon and text "Aún no tienes pacientes registrados" + button "Agregar paciente" linking to `/patients/new`
- "View All" link goes to `/patients`

**5. `src/app/(dashboard)/dashboard/components/ClinicalTimeline.tsx`** — Client Component:
- Header: "Clinical Timeline" + `...` menu icon
- Timeline items with time, title, description, and colored dot indicator:
  - Blue dot: normal
  - Red dot: emergency/urgent
  - Gray dot: pending
- For MVP: render hardcoded timeline items matching the mockup style
- Add `// TODO: connect to real appointments/events data` comment
- Bottom action: "New Patient" quick action card with `+` icon and chevron, links to `/patients/new`
- Floating `+` button bottom-right: `#4C6FFF` background, links to `/patients/new`

**6. `src/app/(dashboard)/dashboard/components/Sidebar.tsx`** — extract sidebar into its own Client Component if not already done:
- Uses `usePathname()` to detect active route
- Active nav item highlighted with `#4C6FFF` background

---

**Data & auth rules:**
- Always verify session at the top of every Server Component page — redirect to `/login` if no session
- Never pass raw Prisma objects to Client Components — map to plain serializable types first
- Format all dates server-side before passing to Client Components
- Use `getProfile()` from `src/lib/session.ts` for the authenticated doctor's data

---

**Visual fidelity rules:**
- Match the mockup exactly: sidebar dark `#2E3A59`, active item `#4C6FFF`, card layout, table style, timeline dots
- Avatar initials: generated from patient full name, colored background derived from name hash or fixed palette of 6 brand colors
- Status badges: active = `bg-green-100 text-green-700`, inactive = `bg-gray-100 text-gray-500`
- All text in Spanish except column headers which match the mockup (can be Spanish)
- Storage bar uses `#4C6FFF` fill on `#E6EAF5` track

---

**Follow all responsive guidelines defined in `RESPONSIVE.md`. Apply mobile-first CSS using Tailwind breakpoints. Run the responsive checklist before finishing.**

**Specific responsive behavior:**
- Sidebar: hidden on mobile, visible from `lg:` — toggled by hamburger button in top bar
- Stats cards: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Main content + timeline: `grid-cols-1 lg:grid-cols-3` (content takes 2 cols, timeline takes 1)
- Top bar search: hidden on mobile, visible from `md:`
- Floating `+` button: visible on mobile only (`lg:hidden`)

---

**After implementing, verify:**
1. `/dashboard` renders with real patient count and consultation count from DB
2. Sidebar highlights "Dashboard" as active item
3. Doctor name and role appear correctly in the top bar
4. Recent patients table shows real data or empty state if no patients
5. Redirects to `/login` if session is missing
6. No TypeScript errors on `npm run build`
7. Sidebar collapses correctly on mobile
8. No horizontal overflow at 375px

---