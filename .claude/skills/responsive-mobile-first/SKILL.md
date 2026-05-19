---
name: responsive-mobile-first
description: Mobile-first responsive rules for the Morecedont EMR frontend. Use PROACTIVELY before writing or editing any .tsx, .jsx, or layout/page component in src/. Enforces Tailwind v4 design tokens, prohibits fixed pixel widths and hex colors, requires text-base on inputs (anti-iOS-zoom), h-11 minimum on touch targets, next/image instead of <img>, and mobile-first grids. The .claude/hooks/responsive-check.sh hook validates these on PostToolUse and will BLOCK the write if errors are found — read this skill first to avoid rewrites.
---

# Mobile-first rules for Morecedont EMR

These rules apply to every `.tsx` / `.jsx` file under `src/`. The hook at `.claude/hooks/responsive-check.sh` runs after every Write/Edit and **blocks the write** if a hard rule is violated. Read the rules before generating code; do not rely on the hook to catch mistakes after the fact.

## Hard errors (the hook blocks the write)

| Rule | Bad | Good |
|---|---|---|
| No fixed pixel widths on layout elements | `className="w-[320px]"` | `className="w-full max-w-sm"` |
| All `<input>` must include `text-base` (prevents iOS auto-zoom on focus) | `<input className="..." />` without `text-base` | `<input className="text-base ..." />` |
| No inline styles | `style={{ color: "red" }}` | Tailwind class (`text-error`) |
| No native `<img>` | `<img src="/x.jpg" />` | `import Image from "next/image"` → `<Image src="/x.jpg" alt="..." width={...} height={...} />` |
| No hardcoded hex colors via arbitrary values | `bg-[#4C6FFF]`, `text-[#444]`, `border-[#E6EAF5]` | Design system tokens: `bg-sidebar-active`, `text-on-surface-variant`, `border-outline-variant/30` |

## Warnings (allowed but flagged)

- **Buttons without `h-11` minimum** (44 px touch target). Acceptable alternatives: `h-12`, `h-14`. Always use one of these on `<button>` and clickable links.
- **Grids that don't start at `grid-cols-1`**: a class like `md:grid-cols-2 lg:grid-cols-3` must include `grid-cols-1` as the base.

## Mobile-first patterns

### Layout
- Single column on mobile; expand via `sm:`, `md:`, `lg:`, `xl:` breakpoints.
- Container padding: `px-4 sm:px-6 lg:px-8`.
- Section vertical spacing: `py-12 sm:py-16 lg:py-24`.
- Width utilities: `w-full`, `max-w-*`, `mx-auto`. Never `w-[Npx]`.
- No horizontal overflow at any breakpoint.

### Typography
- Headings scale: `text-2xl sm:text-3xl lg:text-4xl xl:text-5xl`.
- Body: `text-sm sm:text-base`.
- Inputs: must include `text-base` regardless of breakpoint.

### Navigation
- Mobile: hamburger with stacked vertical links.
- Tablet (`md:`): condensed horizontal nav.
- Desktop (`lg:`): full nav.

### Cards & grids
- Default: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
- Images: `w-full h-auto` or `aspect-*`. Always via `next/image`.

### Forms
- All fields: `w-full`.
- Multi-column layouts: `md:` and up only (`grid-cols-1 md:grid-cols-2`).
- Submit buttons: `w-full sm:w-auto` unless full-width by design.
- All `<input>` and `<select>`: include `text-base` (anti-zoom iOS).

### Touch targets
- Buttons and links: minimum `h-11` (44 px) on mobile.
- Spacing between clickable elements: at least `gap-3`.

### Decorative elements
- Large background shapes: `hidden sm:block` or scaled down on mobile.
- No decorative element causes horizontal scroll.

## Design system tokens (instead of hex)

Defined in `src/app/globals.css` via `@theme inline`. Use these classes — NEVER `bg-[#hex]`.

**Surfaces:** `bg-background`, `bg-surface`, `bg-surface-container-lowest`, `bg-surface-container-low`, `bg-surface-container`, `bg-surface-container-high`.

**Text:** `text-on-surface`, `text-on-surface-variant`, `text-on-background`, `text-secondary`, `text-outline`.

**Brand:** `bg-primary`, `bg-primary-container`, `bg-primary-fixed`, `text-on-primary`, `bg-secondary`, `bg-secondary-container`, `bg-tertiary`.

**Status:** `bg-error`, `text-error`, `bg-error-container`, `text-on-error-container`.

**App shell:** `bg-sidebar`, `bg-sidebar-active` (sidebar nav).

**Outlines:** `border-outline`, `border-outline-variant` (with `/20`, `/30` for opacity).

**Fonts:** `font-headline` (Manrope), `font-body` (Inter), `font-label`.

## Icon usage

Material Symbols Outlined (loaded via `<link>` in `src/app/layout.tsx`):

```tsx
<span className="material-symbols-outlined text-[20px]">add</span>
```

For filled variant use `material-symbols-filled`. Don't use `style={{ fontVariationSettings: ... }}` — use the utility class.

## Common ready-made class strings (used across the codebase)

```ts
// Standard input
"w-full text-base bg-white border border-outline-variant/40 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline/50"

// Standard select
"w-full text-base bg-white border border-outline-variant/40 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"

// Form label
"block text-sm font-semibold text-on-surface mb-1.5"

// Primary button
"w-full sm:w-auto h-11 px-6 flex items-center justify-center gap-2 bg-primary text-white font-semibold rounded-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-70"

// Secondary button
"h-11 px-4 flex items-center gap-2 text-sm font-semibold text-secondary border border-outline-variant/30 rounded-lg hover:bg-surface-container transition-colors"
```

Reuse these patterns instead of reinventing them. If a component already imports an `inputCls` / `selectCls` / `labelCls` constant locally, extend it rather than introducing new variants.
