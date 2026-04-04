---

**Context:**
You are implementing the doctor registration flow for Morecedont, a dental EMR platform. The project uses Next.js 14+ App Router, Supabase Auth, Tailwind CSS, and TypeScript. Read `DESIGN.md` before writing any code. This is NOT a traditional self-serve registration — doctors submit a request that must be manually approved by a platform administrator before they can access the system.

**You are given:**
- PNG mockup + HTML file for the registration form screen (`/register`)
- PNG mockup + HTML file for the pending approval screen (`/register/pending`)

Translate both designs faithfully into Next.js + Tailwind following `DESIGN.md`. Do not copy the HTML directly.

---

**Database context:**
The `profiles` table in Supabase already has these columns added via migration:
- `status TEXT` — values: `'pending'` | `'active'` | `'rejected'` — default: `'pending'`
- `license_number TEXT` — professional license / colegiatura number
- `specialty TEXT` — dental specialty
- `rejection_reason TEXT` — filled by admin if rejected

Run `npx prisma db pull && npx prisma generate` first to sync the schema before writing any code.

---

**Files to create:**

**1. `src/lib/actions/auth.ts` — update the existing file, add `signUp` action:**
```ts
// signUp(formData) should:
// 1. Call supabase.auth.signUp() with email and password
// 2. If successful, insert a row into profiles via Prisma with:
//    { id: authUser.id, full_name, email, phone, license_number, specialty, status: 'pending', role: 'doctor' }
// 3. Redirect to /register/pending on success
// 4. Return { error: string } on failure — do not throw
```

**2. `src/app/(auth)/register/page.tsx`** — Server Component that renders the registration layout

**3. `src/app/(auth)/register/RegisterForm.tsx`** — Client Component (`"use client"`) with:
- Fields: full name (full width), email, phone, password, confirm password, license number, specialty (dropdown)
- Specialty options: `Odontología General`, `Endodoncia`, `Ortodoncia`, `Periodoncia`, `Cirugía Maxilofacial`, `Odontopediatría`
- Info box below fields with icon and approval notice text
- Submit button: "Enviar solicitud" with loading state via `useTransition`
- Client-side validation before submitting:
  - All fields required
  - Email format valid
  - Password minimum 8 characters
  - Password and confirm password must match
  - License number minimum 4 characters
- Error messages displayed inline below each field
- General error message displayed at the top of the form if the server action fails
- Link to `/login` at the bottom

**4. `src/app/(auth)/register/pending/page.tsx`** — Server Component showing:
- Status timeline with 3 steps: "Solicitud enviada" (completed), "En revisión" (active with pulse), "Cuenta activada" (pending)
- Support email link
- "Volver al inicio" ghost button linking to `/`

**5. Update `middleware.ts`** — extend the existing Supabase auth middleware to also check `profiles.status`:
```ts
// After confirming the user is authenticated:
// 1. Fetch profiles row for auth.uid()
// 2. If status === 'pending' → redirect to /register/pending
// 3. If status === 'rejected' → redirect to /register/rejected (stub page, just show rejection message)
// 4. If status === 'active' → allow through to dashboard
// Important: do NOT use Prisma in middleware — use the Supabase client directly:
//   const { data: profile } = await supabase.from('profiles').select('status').eq('id', user.id).single()
```

**6. `src/app/(auth)/register/rejected/page.tsx`** — Stub page showing:
- Title: "Solicitud rechazada"
- Text: "Tu solicitud de acceso no fue aprobada."
- Display `rejection_reason` if available — fetch it server-side via Supabase
- Link back to `/login`

---

**Behavior rules:**
- A doctor who registers lands on `/register/pending` and cannot access `/dashboard` until status is `'active'`
- If an already-authenticated doctor with `status: 'pending'` tries to visit `/dashboard`, middleware redirects them to `/register/pending`
- If an already-authenticated doctor with `status: 'rejected'` tries to visit any protected route, middleware redirects to `/register/rejected`
- The `/register/pending` and `/register/rejected` pages must be accessible to authenticated users with non-active status — do not redirect them to `/login`

---

**Visual fidelity rules:**
- Match both mockups exactly: layout, spacing, colors, typography, border radius
- Use only colors from `DESIGN.md` — no hardcoded hex values
- Background must include the same decorative geometric shapes as the login screen
- All text must be in Spanish
- Fully responsive — mobile and desktop

---

**Technical rules:**
- No NextAuth imports anywhere
- Tailwind only — no inline styles, no CSS modules
- App Router only — no `getServerSideProps`
- Do not run `prisma migrate dev` — schema is managed via Supabase dashboard
- Prisma is only used in server actions and server components, never in middleware or client components

---

**After implementing, verify:**
1. `/register` renders correctly and all validations work client-side
2. Submitting the form creates a user in `auth.users` AND a row in `profiles` with `status: 'pending'`
3. After submit, user is redirected to `/register/pending`
4. If the pending user tries to access `/dashboard` directly, middleware redirects to `/register/pending`
5. No TypeScript errors on `npm run build`

---