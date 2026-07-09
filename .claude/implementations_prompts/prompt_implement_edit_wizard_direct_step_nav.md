
**Context:**
You are implementing Direct Step Navigation in the Edit History Wizard for Morecedont. When editing a clinical history at `/patients/[id]/history/[historyId]/edit`, the doctor must be able to click any step in the progress bar and jump directly to it — without cycling through all previous steps. This applies to both completed and future steps, since all data is pre-loaded into state on mount.
The project uses Next.js App Router (v16), Supabase Auth, Prisma 6, Tailwind CSS v4, and TypeScript strict.
Before writing any code: read `.claude/skills/responsive-mobile-first/SKILL.md` and `.claude/skills/design-system/SKILL.md`.

**First — inspect existing code before writing anything:**
Read these files in full and note their exact current state before proceeding:
- `src/app/(dashboard)/patients/[id]/history/[historyId]/edit/components/EditProgressBar.tsx` — full file (current interface, desktop step circles, mobile progress bar)
- `src/app/(dashboard)/patients/[id]/history/[historyId]/edit/EditHistoryWizard.tsx` — full file (step state, EditProgressBar call, step rendering)

---

## No DB migration needed

This feature is a pure UI/UX change. No SQL, no Prisma schema change, no `npx prisma generate`.

---

## Step 1 — Modify `EditProgressBar.tsx`

**File:** `src/app/(dashboard)/patients/[id]/history/[historyId]/edit/components/EditProgressBar.tsx`

Replace the entire file with this implementation:

```tsx
"use client"

const STEPS = [
  { label: "Antecedentes médicos" },
  { label: "Examen clínico" },
  { label: "Endodoncia" },
  { label: "Plan de tratamiento" },
]

interface EditProgressBarProps {
  currentStep: number // 1-based
  onStepClick: (step: number) => void
}

export default function EditProgressBar({ currentStep, onStepClick }: EditProgressBarProps) {
  return (
    <div className="mb-8 sm:mb-10">
      {/* Mobile: horizontal scrollable step pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:hidden">
        {STEPS.map((step, i) => {
          const stepNum = i + 1
          const isCompleted = stepNum < currentStep
          const isCurrent = stepNum === currentStep

          return (
            <button
              key={stepNum}
              type="button"
              onClick={() => onStepClick(stepNum)}
              className={`h-11 flex items-center gap-2 px-4 rounded-full shrink-0 font-semibold text-sm transition-all ${
                isCurrent
                  ? "bg-sidebar-active text-white shadow-md shadow-primary/20"
                  : isCompleted
                  ? "bg-sidebar-active/15 text-sidebar-active border border-sidebar-active/30"
                  : "bg-surface-container text-secondary border border-outline-variant/30 hover:bg-surface-container-high"
              }`}
            >
              {isCompleted ? (
                <span className="material-symbols-outlined text-[14px]">check</span>
              ) : (
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                  bg-white/20">
                  {stepNum}
                </span>
              )}
              <span className={isCurrent ? "inline" : "hidden sm:inline"}>
                {step.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Desktop: full step indicator with clickable circles */}
      <div className="hidden md:flex items-center justify-between">
        {STEPS.map((step, i) => {
          const stepNum = i + 1
          const isCompleted = stepNum < currentStep
          const isCurrent = stepNum === currentStep

          return (
            <div key={stepNum} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onStepClick(stepNum)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                    isCompleted
                      ? "bg-sidebar-active text-white cursor-pointer hover:brightness-110 active:scale-95"
                      : isCurrent
                      ? "bg-sidebar-active text-white shadow-lg shadow-blue-500/20 cursor-default"
                      : "bg-surface-container-highest text-on-surface-variant cursor-pointer hover:bg-surface-container-high active:scale-95"
                  }`}
                >
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  ) : (
                    stepNum
                  )}
                </button>
                <p
                  className={`text-[10px] font-bold uppercase tracking-widest text-center leading-tight max-w-[80px] ${
                    isCurrent
                      ? "text-sidebar-active"
                      : isCompleted
                      ? "text-sidebar-active/70"
                      : "text-outline"
                  }`}
                >
                  {step.label}
                </p>
              </div>

              {i < STEPS.length - 1 && (
                <div className="flex-1 mx-2 h-[2px] rounded-full relative -mt-5">
                  <div className="w-full h-full bg-outline-variant/20 rounded-full" />
                  <div
                    className="absolute left-0 top-0 h-full bg-sidebar-active rounded-full transition-all duration-500"
                    style={{ width: isCompleted ? "100%" : "0%" }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

**Visual wireframes:**

Mobile (< 768px) — horizontal scrollable pills:
```
┌─────────────────────────────────────────────────────────────┐
│ [✓ Antecedentes médicos] [● Examen clínico] [3] [4]  →scroll│
└─────────────────────────────────────────────────────────────┘
  Completed pill:  bg-sidebar-active/15, text-sidebar-active, border
  Current pill:    bg-sidebar-active, text-white, shadow
  Future pill:     bg-surface-container, text-secondary, border
  All pills h-11, rounded-full, shrink-0
  On mobile (<sm): only current step shows label text; others show icon/number only
  On sm+: all steps show label text
```

Desktop (≥ 768px) — circles with connector lines:
```
┌──────────────────────────────────────────────────────────────────┐
│  [✓]          ─────────────  [●]          ──────────  [3]   [4]  │
│  Antecedentes              Examen                   Endo   Plan  │
│  (clickable,               (current,                (clickable,  │
│   hover: brighter)          no hover)                hover: gray)│
└──────────────────────────────────────────────────────────────────┘
  Completed circles: bg-sidebar-active, hover:brightness-110, cursor-pointer
  Current circle:    bg-sidebar-active, cursor-default (no hover)
  Future circles:    bg-surface-container-highest, hover:bg-surface-container-high, cursor-pointer
  Connector line fill: bg-sidebar-active at 100% width for completed segments, 0% for future
```

**Key rules:**
- The `style={{ width: ... }}` on the connector line fill is the single allowed `style={{}}` usage in this file — it's a runtime-computed percentage that cannot be a static Tailwind class. No other inline styles.
- All step buttons must have `focus:outline-none focus:ring-2 focus:ring-primary/30` for keyboard accessibility.
- Mobile pills must have `shrink-0` to prevent compression inside `overflow-x-auto`.
- The mobile step label on `sm:inline` class: on mobile (< `sm` = < 640px), only the current step's label is always visible (class `inline`), future/completed steps hide their label text (class `hidden sm:inline`). This prevents the pill row from overflowing on very small screens.

---

## Step 2 — Modify `EditHistoryWizard.tsx`

**File:** `src/app/(dashboard)/patients/[id]/history/[historyId]/edit/EditHistoryWizard.tsx`

**Only two changes required — do NOT rewrite the rest of the file:**

### Change A — Update `EditProgressBar` call (line ~84)

Find this line:
```tsx
<EditProgressBar currentStep={step} />
```

Replace with:
```tsx
<EditProgressBar currentStep={step} onStepClick={setStep} />
```

That's it. `setStep` is already in scope from `useState(1)` on line 42. No additional state or handler needed.

### Change B — No other changes

The wizard already pre-loads ALL section data into stable state on mount (lines 44–50):
```ts
const [bgData] = useState(medicalBackground)
const [examData] = useState(dentalExam)
const [toothData] = useState(toothRecords)
const [endoData] = useState(firstEndoRecord)
const [itemsData] = useState(treatmentItems)
const [paymentsData] = useState(treatmentPayments)
```
Because all data is frozen in state at mount, jumping to any step is safe from the first render — no data loss, no uninitialized fields.

**Do NOT** change the step rendering (`step === 1 && ...`, etc.) — it already handles direct jumps correctly.
**Do NOT** change the header, cancel button, save handlers, or any other part of the component.

---

## Responsive behavior (exact class strings)

| Context | Class string |
|---|---|
| Mobile container | `flex items-center gap-2 overflow-x-auto pb-2 md:hidden` |
| Mobile pill (current) | `h-11 flex items-center gap-2 px-4 rounded-full shrink-0 font-semibold text-sm bg-sidebar-active text-white shadow-md shadow-primary/20` |
| Mobile pill (completed) | `h-11 flex items-center gap-2 px-4 rounded-full shrink-0 font-semibold text-sm bg-sidebar-active/15 text-sidebar-active border border-sidebar-active/30` |
| Mobile pill (future) | `h-11 flex items-center gap-2 px-4 rounded-full shrink-0 font-semibold text-sm bg-surface-container text-secondary border border-outline-variant/30 hover:bg-surface-container-high` |
| Mobile label (current) | `inline` |
| Mobile label (other) | `hidden sm:inline` |
| Desktop container | `hidden md:flex items-center justify-between` |
| Desktop circle (completed) | `w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm bg-sidebar-active text-white cursor-pointer hover:brightness-110 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-primary/30` |
| Desktop circle (current) | `w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm bg-sidebar-active text-white shadow-lg shadow-blue-500/20 cursor-default transition-all focus:outline-none focus:ring-2 focus:ring-primary/30` |
| Desktop circle (future) | `w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm bg-surface-container-highest text-on-surface-variant cursor-pointer hover:bg-surface-container-high active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-primary/30` |

---

## After implementing, verify:

1. Go to `/patients/[id]/history/[historyId]/edit` — the progress bar renders without TypeScript errors and the current step circle is highlighted with `bg-sidebar-active`.

2. On desktop (≥ 768px): click a completed step circle (stepNum < currentStep) — the wizard jumps directly to that step, the circle for the new current step becomes fully active (solid `bg-sidebar-active`), and connector lines before it show filled.

3. On desktop: click a future step circle (stepNum > currentStep) — the wizard jumps directly forward without going through intermediate steps. Previously saved data for the target step pre-fills correctly (e.g., clicking step 3 Endodoncia shows existing endo data).

4. On desktop: the current step circle has `cursor-default` and no hover brightness change. Completed and future circles have `cursor-pointer` with visible hover state.

5. On mobile (≤ 640px): the progress bar shows scrollable horizontal pills. The current step pill is `bg-sidebar-active` with white text; completed steps show a `check` icon; future steps are muted `bg-surface-container`. Pills are `h-11` (44px touch target) and do not compress.

6. On mobile (≤ 640px): tapping any pill jumps to that step directly. The label text of non-current steps is hidden on phones (< 640px) but visible on `sm:` (≥ 640px) to avoid overflow.

7. After navigating to step 3 (Endodoncia) via click, clicking the back/next buttons inside the step continue to work correctly — `onBack={() => setStep(2)}` still fires normally.

8. No horizontal overflow at 375px: the mobile pill row is `overflow-x-auto` so it scrolls internally, not the page body.

9. `npm run build` exits 0 with zero TypeScript errors. The `onStepClick` prop satisfies `(step: number) => void` and `setStep` (from `useState<number>`) matches that signature exactly.

10. `npm run lint` exits 0 on both modified files — no new lint warnings introduced.

11. The single `style={{ width: ... }}` on the connector line fill is already present in the original `EditProgressBar.tsx` and is acceptable (runtime-computed percentage). No new `style={{}}` usages are introduced.
