---

**Context:**
This is a dental EMR platform called Morecedont built with Next.js 14+ (App Router), Prisma 6, and Supabase. The database schema is already created in Supabase and introspected via `prisma db pull`. The schema has two relevant parts:
- `auth` schema: Supabase's built-in auth system (23 models, do not modify)
- `public` schema: 14 app models — `profiles`, `clinics`, `doctor_clinics`, `patients`, `doctor_patients`, `medical_histories`, `medical_backgrounds`, `dental_exams`, `tooth_records`, `endodontics`, `endodontic_sessions`, `treatment_items`, `treatment_payments`, `attachments`

The `profiles` table extends `auth.users` — every authenticated user has a corresponding row in `profiles` with their role and additional info.

**What was done before (remove/replace):**
- `src/auth.ts` was configured with NextAuth + PrismaAdapter — remove this entirely
- `src/app/api/auth/[...nextauth]/route.ts` — remove this
- `middleware.ts` was written for NextAuth — replace it
- Any reference to NextAuth in `package.json`, imports, or config — remove

**What to install:**
```bash
npm uninstall next-auth @auth/prisma-adapter
npm install @supabase/supabase-js @supabase/ssr
```

**What to build:**

**1. Environment variables** — Add to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**2. Supabase clients** — Create the following files:

`src/lib/supabase/client.ts` — browser client using `createBrowserClient` from `@supabase/ssr`

`src/lib/supabase/server.ts` — server client using `createServerClient` from `@supabase/ssr` with full cookie handling for Next.js App Router (read and set cookies via `cookies()` from `next/headers`)

`src/lib/supabase/middleware.ts` — middleware client using `createServerClient` with cookie handling compatible with `NextRequest`/`NextResponse`

**3. Middleware** — Replace `middleware.ts` in the root:
- Use the middleware Supabase client
- Call `supabase.auth.getUser()` to check session
- Redirect unauthenticated users to `/login`
- Redirect authenticated users away from `/login` and `/register` to `/dashboard`
- Protect all routes under `/(dashboard)`
- Matcher: `["/((?!api|_next/static|_next/image|favicon.ico).*)"]`

**4. Auth actions** — Create `src/lib/actions/auth.ts` as a Server Actions file with:
- `signIn(email, password)` — calls `supabase.auth.signInWithPassword()`, redirects to `/dashboard` on success
- `signUp(email, password, fullName)` — calls `supabase.auth.signUp()`, then inserts a row into `profiles` with `id` (from auth user), `full_name`, `email`, and `role: 'doctor'`
- `signOut()` — calls `supabase.auth.signOut()`, redirects to `/login`

**5. Session helper** — Create `src/lib/session.ts`:
- `getSession()` — uses server Supabase client, returns the current session or null
- `getProfile()` — uses server Supabase client + Prisma to fetch the full `profiles` row for the authenticated user. Returns null if not authenticated.

**6. Update `types/supabase.d.ts`** — Create a type extension:
```ts
export type UserRole = 'doctor' | 'admin'

export type Profile = {
  id: string
  full_name: string
  email: string
  phone: string | null
  role: UserRole
  created_at: string
}
```

**7. Update Prisma usage** — All Prisma queries must reference the correct introspected model names:
- `prisma.profiles` (not `prisma.user`)
- `prisma.clinics`, `prisma.patients`, `prisma.doctor_patients`, `prisma.medical_histories`, etc.

**8. Stub pages** — Create minimal working pages (no need for full UI yet, just functional):

`src/app/(auth)/login/page.tsx` — form with email + password, calls `signIn` server action

`src/app/(auth)/register/page.tsx` — form with name + email + password, calls `signUp` server action

`src/app/(dashboard)/layout.tsx` — calls `getProfile()`, redirects to `/login` if null, renders children

`src/app/(dashboard)/dashboard/page.tsx` — displays "Bienvenido, {profile.full_name}" to confirm auth is working

**Important rules:**
- Never use `getServerSideProps` or `getStaticProps` — this is App Router only
- Use `cookies()` from `next/headers` in all server components and actions
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client
- The Prisma client singleton in `src/lib/prisma.ts` stays unchanged
- Do not run `prisma migrate dev` — schema changes go through Supabase dashboard first, then `prisma db pull`

---