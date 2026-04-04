

---

**Context:**
You are implementing clinic creation inline during the new patient wizard for Morecedont. Currently Step 2 of the wizard has a clinic selector dropdown that only shows the doctor's existing clinics. The feature adds autocomplete search across ALL clinics in the platform, plus the ability to create a new clinic inline if it doesn't exist. The project uses Next.js 14+ App Router, Supabase Auth, Prisma 6, Tailwind CSS, and TypeScript. Read `DESIGN.md` and `RESPONSIVE.md` before writing any code.

---

**No database migration needed** — the `clinics` and `doctor_clinics` tables already exist with the correct structure.

---

**How it works end to end:**

1. Doctor types in the clinic search input
2. Results show clinics matching the search from ALL clinics in the DB (not just the doctor's)
3. If the doctor selects an existing clinic they don't belong to → insert into `doctor_clinics`
4. If no clinic matches → show "Crear clínica: [nombre escrito]" option at the bottom of results
5. Doctor selects "Crear" → inline mini-form appears asking for address and phone → saves to `clinics` + `doctor_clinics`
6. Newly created or selected clinic is set as the clinic for the medical history being created

---

**Files to create:**

**1. `src/components/shared/ClinicSelector.tsx`** — new reusable Client Component:

```tsx
interface ClinicSelectorProps {
  value: SelectedClinic | null
  doctorId: string
  onChange: (clinic: SelectedClinic | null) => void
  placeholder?: string
}

interface SelectedClinic {
  id: string
  name: string
  address?: string | null
  phone?: string | null
  isNew?: boolean
}
```

UI behavior:

**Search input:**
- Text input with search icon left, clear `×` button right when value present
- Placeholder: "Buscar o crear clínica..."
- `text-base` to prevent iOS zoom
- On focus: shows dropdown below
- On type: debounced search (300ms) calls server action `searchClinics(query)`
- Minimum 1 character to trigger search

**Dropdown results:**
```
┌─────────────────────────────────────────┐
│ 🏥 Clínica Dental Moderna               │
│    Av. Principal 123, Caracas           │
│─────────────────────────────────────────│
│ 🏥 Centro Odontológico Sanitas          │
│    Calle 5, Valencia                    │
│─────────────────────────────────────────│
│ + Crear "Dental Norte" como nueva       │
│   clínica                               │
└─────────────────────────────────────────┘
```

- Each existing clinic result: clinic icon + name bold + address below in gray
- Doctor's own clinics shown first with a subtle "Tu clínica" badge `bg-[#E6EAF5] text-[#4C6FFF] text-xs`
- "Crear nueva" option always shown at bottom if query is non-empty — even when results exist
- "Crear nueva" row: `+` icon in `#4C6FFF` + text "Crear '[query]' como nueva clínica" in `#4C6FFF`
- Hover state on rows: `bg-[#F9FAFC]`
- Loading state: spinner inside input right side while searching
- Empty results (no matches): show only the "Crear nueva" option
- Max height `max-h-60`, scrollable if overflow

**Selected state:**
When a clinic is selected, replace the input with a pill/card:
```
┌──────────────────────────────────────────┐
│ 🏥 Clínica Dental Moderna          [×]  │
│    Av. Principal 123               Editar│
└──────────────────────────────────────────┘
```
- Background: `#F0F4FF`, border `#4C6FFF`, `rounded-lg`, `p-3`
- `×` button clears selection and returns to search input
- "Editar" link: only shown for clinics created by the doctor — opens the mini-form pre-filled

**Inline create form:**
When "Crear nueva" is selected, show a mini-form BELOW the search input (not a modal):

```
┌─────────────────────────────────────────┐
│ Nueva clínica                           │
│                                         │
│ Nombre *                                │
│ [Dental Norte__________________________]│
│                                         │
│ Dirección                               │
│ [_______________________________________]│
│                                         │
│ Teléfono                                │
│ [_______________________________________]│
│                                         │
│ [Cancelar]              [Crear clínica] │
└─────────────────────────────────────────┘
```

- Name field pre-filled with what the doctor typed in search
- Address and phone optional
- "Crear clínica" button: filled `#4C6FFF`, calls `createClinic` server action
- "Cancelar": returns to search state, clears mini-form
- Loading state on "Crear clínica" button while saving
- On success: mini-form closes, newly created clinic appears as selected pill
- On error: inline error message below the form

**Keyboard navigation:**
- Arrow up/down navigates dropdown results
- Enter selects focused result
- Escape closes dropdown and clears focus

---

**2. `src/lib/actions/clinics.ts`** — new Server Actions file:

```ts
'use server'

import { prisma } from '@/lib/prisma'
import { getProfile } from '@/lib/session'

// Search clinics by name across ALL clinics in the platform
// Returns doctor's own clinics first, then others
export async function searchClinics(query: string) {
  const profile = await getProfile()
  if (!profile) throw new Error('Unauthorized')

  if (!query || query.trim().length < 1) return []

  const clinics = await prisma.clinics.findMany({
    where: {
      name: {
        contains: query.trim(),
        mode: 'insensitive'
      }
    },
    include: {
      doctor_clinics: {
        where: { doctor_id: profile.id },
        select: { doctor_id: true }
      }
    },
    orderBy: { name: 'asc' },
    take: 10
  })

  // Sort: doctor's own clinics first
  return clinics
    .map(clinic => ({
      id: clinic.id,
      name: clinic.name,
      address: clinic.address,
      phone: clinic.phone,
      isOwn: clinic.doctor_clinics.length > 0
    }))
    .sort((a, b) => (b.isOwn ? 1 : 0) - (a.isOwn ? 1 : 0))
}

// Create a new clinic and associate it with the doctor
export async function createClinic(data: {
  name: string
  address?: string
  phone?: string
}) {
  const profile = await getProfile()
  if (!profile) throw new Error('Unauthorized')

  if (!data.name?.trim()) return { error: 'El nombre de la clínica es requerido' }

  // Check for duplicate name (case insensitive)
  const existing = await prisma.clinics.findFirst({
    where: {
      name: { equals: data.name.trim(), mode: 'insensitive' }
    }
  })

  if (existing) {
    // Don't create duplicate — just associate doctor if not already
    await prisma.doctor_clinics.upsert({
      where: {
        doctor_id_clinic_id: {
          doctor_id: profile.id,
          clinic_id: existing.id
        }
      },
      update: {},
      create: {
        doctor_id: profile.id,
        clinic_id: existing.id
      }
    })
    return {
      clinic: {
        id: existing.id,
        name: existing.name,
        address: existing.address,
        phone: existing.phone
      },
      warning: 'Esta clínica ya existe. Se ha asociado a tu cuenta.'
    }
  }

  // Create new clinic
  const clinic = await prisma.clinics.create({
    data: {
      name: data.name.trim(),
      address: data.address?.trim() ?? null,
      phone: data.phone?.trim() ?? null,
      created_by: profile.id
    }
  })

  // Associate with doctor
  await prisma.doctor_clinics.create({
    data: {
      doctor_id: profile.id,
      clinic_id: clinic.id
    }
  })

  return {
    clinic: {
      id: clinic.id,
      name: clinic.name,
      address: clinic.address,
      phone: clinic.phone
    }
  }
}

// Associate an existing clinic with the doctor (when selecting a clinic they don't own)
export async function associateClinic(clinicId: string) {
  const profile = await getProfile()
  if (!profile) throw new Error('Unauthorized')

  await prisma.doctor_clinics.upsert({
    where: {
      doctor_id_clinic_id: {
        doctor_id: profile.id,
        clinic_id: clinicId
      }
    },
    update: {},
    create: {
      doctor_id: profile.id,
      clinic_id: clinicId
    }
  })
}
```

---

**3. `src/app/(dashboard)/patients/new/steps/Step2EmergencyContact.tsx`**

Replace the existing clinic dropdown with the new `ClinicSelector` component:

Remove:
- The existing `<select>` dropdown for clinics
- The `doctorClinics` prop that was passing only the doctor's clinics

Add `ClinicSelector`:
```tsx
<div>
  <label className="text-sm font-medium text-[#1E1E2F]">
    Clínica
    <span className="text-xs text-[#9CA3AF] ml-1">(opcional)</span>
  </label>
  <ClinicSelector
    value={selectedClinic}
    doctorId={doctorId}
    onChange={(clinic) => setSelectedClinic(clinic)}
    placeholder="Buscar o crear clínica..."
  />
</div>
```

Update state:
```ts
const [selectedClinic, setSelectedClinic] = useState<SelectedClinic | null>(
  initialData?.clinic ?? null
)
```

When calling `onNext` / saving:
```ts
clinic_id: selectedClinic?.id ?? null,
clinic_name: selectedClinic?.name ?? null,
```

Update `NewPatientWizard.tsx` — remove `doctorClinics` prop from Step 2 since it's no longer needed there. The server action handles searching internally.

---

**4. `src/app/(dashboard)/patients/new/page.tsx`**

Remove the `doctorClinics` fetch since the search is now handled via server action:

```ts
// REMOVE this query — no longer needed in the page
// const doctorClinics = await prisma.doctor_clinics.findMany(...)

// Pass doctorId to wizard instead
<NewPatientWizard doctorId={profile.id} />
```

---

**5. Update `src/app/(dashboard)/patients/[id]/history/[historyId]/edit/EditHistoryWizard.tsx`**

The edit wizard also shows the clinic selector in Step 2 equivalent. Replace with `ClinicSelector` pre-filled from `history.clinics`:

```ts
const [selectedClinic, setSelectedClinic] = useState<SelectedClinic | null>(
  history.clinics
    ? {
        id: history.clinics.id,
        name: history.clinics.name,
        address: history.clinics.address,
        phone: history.clinics.phone
      }
    : null
)
```

---

**Visual design for `ClinicSelector`:**

- Input: `w-full h-11 text-base border border-[#E6EAF5] rounded-lg px-4` with search icon `text-[#9CA3AF]` left, focus ring `ring-2 ring-[#4C6FFF]`
- Dropdown: `absolute z-50 w-full bg-white border border-[#E6EAF5] rounded-lg shadow-lg mt-1`
- Selected pill: `bg-[#F0F4FF] border border-[#4C6FFF] rounded-lg p-3`
- Mini create form: `bg-[#F9FAFC] border border-[#E6EAF5] rounded-lg p-4 mt-2`
- "Crear clínica" button: `bg-[#4C6FFF] text-white h-11 px-4 rounded-lg`
- "Cancelar": ghost `text-[#6B7280] h-11 px-4`
- "Tu clínica" badge: `bg-[#E6EAF5] text-[#4C6FFF] text-xs rounded-full px-2 py-0.5`
- Warning message (duplicate clinic): `bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded-lg p-3`

---

**Follow all responsive guidelines defined in `RESPONSIVE.md`. Apply mobile-first CSS using Tailwind breakpoints. Run the responsive checklist before finishing.**

**Specific responsive behavior:**
- Dropdown: full width matching the input on all breakpoints
- Mini create form fields: single column on mobile, `grid-cols-2` for address/phone on `sm:`
- Selected clinic pill: full width on all breakpoints
- "Crear" / "Cancelar" buttons: stacked full width on mobile, inline on `sm:`

---

**After implementing, verify:**
1. Step 2 of new patient wizard shows `ClinicSelector` instead of the old dropdown
2. Typing in the search shows matching clinics from all clinics in DB
3. Doctor's own clinics appear first with "Tu clínica" badge
4. Selecting an existing clinic from another doctor inserts into `doctor_clinics`
5. Selecting "Crear nueva" shows the inline mini-form
6. Creating a new clinic saves to `clinics` table with `created_by = doctorId`
7. New clinic is automatically added to `doctor_clinics`
8. If a clinic with the same name already exists: shows warning and associates instead of creating duplicate
9. Selected clinic appears as the pill card
10. Clearing selection returns to search input
11. Edit history wizard pre-fills clinic selector with existing clinic
12. `npm run build` passes with zero TypeScript errors
13. No horizontal overflow at 375px

---

