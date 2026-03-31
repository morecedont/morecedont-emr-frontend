---

**Context:**
You are implementing the public landing page (home) for Morecedont at route `src/app/page.tsx`. The project uses Next.js 14+ App Router, Supabase Auth, Tailwind CSS, and TypeScript. Read `DESIGN.md` before writing any code. This is a fully public page — no authentication required to view it.

**You are given:**
- A PNG mockup of the full landing page
- An HTML/CSS file exported from the design tool

Translate both into Next.js + Tailwind following `DESIGN.md`. Do not copy the HTML directly — implement it as proper React components.

---

**Files to create:**

**1. `src/app/page.tsx`** — Server Component. Fetches the current session server-side using the Supabase server client and passes `isAuthenticated` and `userStatus` as props to the Navbar component.

```ts
// Fetch session:
const supabase = createServerClient()
const { data: { user } } = await supabase.auth.getUser()

// If user exists, fetch their profile status:
// const { data: profile } = await supabase.from('profiles').select('status').eq('id', user.id).single()

// Pass to Navbar: isAuthenticated (boolean), userStatus ('active' | 'pending' | 'rejected' | null)
```

**2. `src/app/(home)/components/Navbar.tsx`** — Client Component (`"use client"`) with:
- Logo "Morecedont" left-aligned
- Nav links center/right: "Inicio", "Cómo funciona", "Para quién", "FAQ" — smooth scroll to section IDs
- **Conditional right-side buttons based on session:**
  - `isAuthenticated === false` → show "Iniciar sesión" (ghost) + "Solicitar acceso" (filled)
  - `isAuthenticated === true && userStatus === 'active'` → show "Ir al dashboard" (filled, links to `/dashboard`)
  - `isAuthenticated === true && userStatus === 'pending'` → show "Solicitud en revisión" (disabled ghost button)
  - `isAuthenticated === true && userStatus === 'rejected'` → show "Ver estado" (ghost, links to `/register/rejected`)
- Sticky on scroll with subtle shadow appearing after scrolling 10px — use `useEffect` + `useState` for scroll detection
- Mobile: hamburger menu showing/hiding nav links and buttons

**3. `src/app/(home)/components/HeroSection.tsx`** — with:
- Headline, subheadline, two CTA buttons
- "Solicitar acceso" links to `/register`
- "Ver cómo funciona" smooth scrolls to `#como-funciona` section
- Decorative geometric shapes as background elements matching the mockup
- Section ID: `id="inicio"`

**4. `src/app/(home)/components/ProblemSection.tsx`** — with:
- 3 problem cards
- Section ID: `id="problemas"`

**5. `src/app/(home)/components/WhatIsSection.tsx`** — with:
- Two-column layout: text left, product image/placeholder right
- Background: `#E6EAF5`

**6. `src/app/(home)/components/BenefitsSection.tsx`** — with:
- 6 benefit cards in a 3x2 grid

**7. `src/app/(home)/components/HowItWorksSection.tsx`** — with:
- 3 steps with connector line on desktop
- CTA button below linking to `/register`
- Section ID: `id="como-funciona"`

**8. `src/app/(home)/components/ForWhomSection.tsx`** — with:
- 3 profile cards
- Section ID: `id="para-quien"`

**9. `src/app/(home)/components/FAQSection.tsx`** — Client Component (`"use client"`) with:
- Accordion behavior — one item open at a time
- `useState` to track which item is open
- Chevron icon rotates 180° when open — CSS transition
- Section ID: `id="faq"`

**10. `src/app/(home)/components/CTASection.tsx`** — with:
- Gradient background from `#2E3A59` to `#3F5AA6`
- "Solicitar acceso gratuito" links to `/register`
- "Tengo dudas" links to `mailto:soporte@morecedont.com`

**11. `src/app/(home)/components/Footer.tsx`** — with:
- Dark background `#2E3A59`
- Logo, nav links, support email, copyright

---

**Assembly in `src/app/page.tsx`:**
```tsx
// Render order:
<Navbar isAuthenticated={...} userStatus={...} />
<main>
  <HeroSection />
  <ProblemSection />
  <WhatIsSection />
  <BenefitsSection />
  <HowItWorksSection />
  <ForWhomSection />
  <FAQSection />
  <CTASection />
</main>
<Footer />
```

---

**Behavior rules:**
- All CTA buttons pointing to `/register` or `/login` must use `next/link`
- Smooth scroll for anchor links — add `scroll-smooth` to the `<html>` tag in `src/app/layout.tsx`
- The page must NOT redirect authenticated users — it's always publicly accessible
- Middleware must explicitly allow `/` without auth check — verify this is already the case
- No Prisma calls in this page — use Supabase client directly for the session and profile status check

---

**Visual fidelity rules:**
- Match the mockup exactly: layout, spacing, colors, typography, section order
- Use only colors from `DESIGN.md` — no hardcoded hex values
- All text in Spanish exactly as provided in the content — do not paraphrase or translate
- Fully responsive — mobile (375px), tablet (768px), desktop (1280px)
- Navbar must be sticky and functional on all breakpoints
- Decorative shapes in hero and CTA sections must match the mockup style

---

**Technical rules:**
- Each section is its own component file under `src/app/(home)/components/`
- Only `FAQSection.tsx` and `Navbar.tsx` are Client Components — everything else is a Server Component
- No inline styles — Tailwind only
- No CSS modules
- App Router only — no `getServerSideProps`
- No NextAuth imports anywhere
- `next/image` for any images or placeholder visuals

---

**After implementing, verify:**
1. `http://localhost:3000/` renders the full landing page without errors
2. Navbar shows "Iniciar sesión" + "Solicitar acceso" when not logged in
3. Navbar shows "Ir al dashboard" when logged in with `status: 'active'`
4. Navbar shows "Solicitud en revisión" when logged in with `status: 'pending'`
5. FAQ accordion opens and closes correctly
6. "Ver cómo funciona" button scrolls smoothly to the how it works section
7. All CTAs link to the correct routes
8. No TypeScript errors on `npm run build`
9. Page looks correct at 375px, 768px and 1280px widths

---