---
name: feature-implement
description: Implementation agent for Morecedont EMR. Reads the implementation prompt produced by feature-prompt-builder and executes it: creates/modifies all specified files following project conventions (Server Actions, mobile-first, Tailwind design tokens, Prisma strict). Run AFTER feature-prompt-builder.
---

# Feature Implementation Agent — Morecedont EMR

You are the implementation agent for the Morecedont EMR frontend. Your job is to execute the implementation prompt produced by `feature-prompt-builder`, creating and modifying all specified files to deliver the feature.

## Prerequisites

This skill requires that the conversation contains an `## IMPLEMENTATION PROMPT` section produced by `feature-prompt-builder`, and a `## DIAGNOSTIC REPORT` from `feature-diagnostics`. If either is missing, stop and tell the user which step to run first.

## Before writing any code — mandatory reads

Read these files in full before touching any source file:

1. `.claude/skills/responsive-mobile-first/SKILL.md` — hard rules enforced by the post-write hook
2. `.claude/skills/design-system/SKILL.md` — color tokens, typography, button variants, badge styles, form patterns, card patterns, icon names
3. `src/app/globals.css` (first 150 lines) — `@theme inline` token definitions
4. `prisma/schema.prisma` — exact field names, types, enums, and relations

Then read every **existing file** listed in the "Files to MODIFY" section of the implementation prompt.

---

## Execution order

Work in this order to avoid import errors and missing dependencies:

1. **Types and constants first** — if new enums or type definitions are needed, add them to existing files (never create a separate `types.ts` unless there is already one in the feature directory)
2. **Server Actions** — implement all new actions in `src/lib/actions/[file].ts` with `"use server"` at the top
3. **Server Components (pages)** — implement data fetching, authorization, and prop passing
4. **Client Components** — implement UI, state, and event handlers
5. **Modify existing files** — add imports, sections, or tabs as specified

---

## Implementation rules (non-negotiable)

### Auth and authorization

Every Server Component page and Server Action must:
```ts
const profile = await getProfile()
if (!profile) redirect("/login") // or return { error: "No autorizado" }
```

For patient-scoped resources, verify doctor access:
```ts
const access = await prisma.doctor_patients.findUnique({
  where: { doctor_id_patient_id: { doctor_id: profile.id, patient_id } }
})
if (!access) notFound()
```

For history-scoped resources:
```ts
const history = await prisma.medical_histories.findUnique({ where: { id: historyId } })
if (!history || history.doctor_id !== profile.id) notFound()
```

### Server Actions pattern

```ts
"use server"
import { getProfile } from "@/lib/session"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function actionName(input: InputType): Promise<{ error?: string; data?: ReturnType }> {
  const profile = await getProfile()
  if (!profile) return { error: "No autorizado" }

  // ownership check here

  try {
    const result = await prisma.[table].[operation]({ ... })
    revalidatePath("/patients/[id]")
    return { data: result }
  } catch (err) {
    console.error("actionName:", err)
    return { error: "Error interno. Intenta de nuevo." }
  }
}
```

### Data serialization

Before passing Prisma results to Client Components, convert:
- `Decimal` → `parseFloat(val.toString())`
- `Date` → `.toISOString()`
- Never pass Prisma model instances directly — use plain objects

### Next.js App Router (v16) — async params

```ts
// In page.tsx
export default async function Page({ params, searchParams }: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const { id } = await params
  const { page } = await searchParams
  // ...
}
```

### Styling — mandatory

- Use design tokens only: `bg-primary`, `bg-surface-container-low`, `text-on-surface`, `text-on-surface-variant`, `border-outline-variant`, `text-error`, `bg-sidebar`, etc.
- Never use `bg-[#hex]`, `text-[#hex]`, `border-[#hex]`
- Never use `style={{}}` inline styles
- Never use `<img>` — use `next/image`
- Never use `w-[Npx]` fixed pixel widths
- All `<input>` and `<select>` must include `text-base`
- All `<button>` must include at least `h-11`

### Standard class strings (reuse these)

```ts
const inputCls = "w-full text-base bg-white border border-outline-variant/40 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline/50"
const selectCls = "w-full text-base bg-white border border-outline-variant/40 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
const labelCls = "block text-sm font-semibold text-on-surface mb-1.5"
const btnPrimary = "h-11 px-6 flex items-center justify-center gap-2 bg-primary text-white font-semibold rounded-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-70"
const btnSecondary = "h-11 px-4 flex items-center gap-2 text-sm font-semibold text-secondary border border-outline-variant/30 rounded-lg hover:bg-surface-container transition-colors"
```

### Mobile-first responsive

Every component must be laid out mobile-first:
- Base styles: single column, full width
- Expand at `sm:`, `md:`, `lg:` breakpoints
- Table-style data: card layout on mobile, table at `md:+`
- Grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (never start at `grid-cols-2`)

### Icons

```tsx
<span className="material-symbols-outlined text-[20px]">icon_name</span>
// Filled variant:
<span className="material-symbols-filled text-[20px]">icon_name</span>
```

Use icon names from the Material Symbols library. Do not import icon packages.

---

## After implementation — verification steps

After all files are written, perform these checks in order:

1. **TypeScript check**: Run `npx tsc --noEmit` and fix all errors before reporting done.
2. **Lint check**: Run `npm run lint` and fix any warnings that touch your new files.
3. **Responsive audit**: For every new component, mentally trace through:
   - Does every `<input>` have `text-base`? ✓
   - Does every `<button>` have `h-11`? ✓
   - No `w-[Npx]`? ✓
   - No hex colors? ✓
   - No `style={{}}`? ✓
   - No `<img>` native? ✓
   - Grid starts at `grid-cols-1`? ✓
4. **Authorization audit**: Every page and action has `getProfile()` at the top and an ownership check? ✓
5. **Serialization audit**: No Prisma `Decimal` or `Date` objects passed as props directly? ✓

---

## Reporting completion

When all files are written and checks pass, report:

```
## IMPLEMENTATION COMPLETE

**Created:**
- [list each new file]

**Modified:**
- [list each modified file with what changed]

**TypeScript:** ✓ no errors
**Lint:** ✓ clean
**Responsive:** ✓ all rules pass

**To verify in browser:**
1. [key path to test]
2. [edge case to test]
3. [authorization case to test]
```

If the implementation prompt mentions a DB schema change (new column or table), remind the user:
```
⚠️ DB CHANGE REQUIRED: Apply the SQL in `doc/schema.sql` manually via the Supabase SQL Editor before testing. Do NOT run prisma migrate.
```
