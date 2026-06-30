---
name: design-system
description: Morecedont Clinical Curator design system. Use PROACTIVELY before writing or editing any .tsx, .jsx, layout, or page component in src/. Defines the authoritative color tokens, typography scale, button variants, badge styles, form patterns, card patterns, icon conventions, and spacing. Read this alongside responsive-mobile-first before generating any UI code.
---

# Morecedont — Clinical Curator Design System

**Source of truth:** `.claude/design-reference/design-system.html` (rendered reference) and `src/app/globals.css` (`@theme inline` token definitions).

Read this skill in full before writing any UI component. If your generated code contradicts any rule here, rewrite it.

---

## 1. Color tokens — the only way to express color

The design system uses semantic token names. **Never use hex values directly in component code** — the post-write hook blocks `bg-[#hex]`, `text-[#hex]`, and `border-[#hex]`. Use the token classes below.

### Full token mapping

| Role | Token class | Hex equivalent (reference only) |
|------|-------------|----------------------------------|
| Brand primary | `bg-primary` / `text-primary` / `border-primary` | `#224bdd` |
| Primary container | `bg-primary-container` | `#4367f7` |
| Primary fixed (light tint) | `bg-primary-fixed` | `#dde1ff` |
| Primary fixed dim | `bg-primary-fixed-dim` | `#b8c3ff` |
| Secondary text / icons | `text-secondary` / `bg-secondary` | `#525e7f` |
| Secondary container | `bg-secondary-container` | `#cad6fd` |
| Tertiary | `bg-tertiary` / `text-tertiary` | `#565b74` |
| Background page | `bg-background` | `#f8f9ff` |
| Surface (card base) | `bg-surface` | `#f8f9ff` |
| Surface lowest (inputs) | `bg-surface-container-lowest` | `#ffffff` |
| Surface low (sections) | `bg-surface-container-low` | `#f0f3ff` |
| Surface mid | `bg-surface-container` | `#eaeef9` |
| Surface high | `bg-surface-container-high` | `#e4e8f3` |
| Surface highest | `bg-surface-container-highest` | `#dee2ed` |
| Surface dim | `bg-surface-dim` | `#d6dae5` |
| Sidebar background | `bg-sidebar` | `#2e3a59` |
| Sidebar active item | `bg-sidebar-active` | `#4c6fff` |
| Main text | `text-on-surface` | `#171c23` |
| Secondary text | `text-on-surface-variant` | `#444655` |
| Muted / placeholder | `text-outline` | `#747687` |
| Border subtle | `border-outline-variant` | `#c4c5d8` |
| Error | `bg-error` / `text-error` | `#ba1a1a` |
| Error container | `bg-error-container` | `#ffdad6` |
| On error container | `text-on-error-container` | `#93000a` |

### Opacity modifiers (allowed)

Use Tailwind opacity modifiers on tokens: `border-outline-variant/20`, `border-outline-variant/40`, `bg-primary/5`, `bg-primary/10`, `bg-error-container/20`.

### Gradient (brand signature)

The brand gradient used on primary KPI cards, hero CTAs, and header accents:
```css
background: linear-gradient(135deg, #224bdd 0%, #4367f7 100%);
```
In Tailwind use: `bg-gradient-to-br from-primary to-primary-container`

---

## 2. Typography

**Font families:**
- `font-headline` (Manrope) — headings, card titles, section titles, sidebar brand name
- `font-body` (Inter) — body text, labels, table cells, form labels
- `font-label` (Inter) — captions, metadata, timestamps

**Scale — use these combinations:**

| Use case | Classes |
|----------|---------|
| Display XL (hero) | `text-5xl font-extrabold font-headline leading-tight` |
| Display L (section title) | `text-4xl font-bold font-headline leading-tight` |
| Headline M (card title) | `text-2xl font-semibold font-headline` |
| Headline S (section label) | `text-lg font-semibold font-headline` |
| Body L (paragraph) | `text-base leading-relaxed text-on-surface` |
| Body M (secondary) | `text-sm leading-relaxed text-secondary` |
| Label (form label) | `text-xs font-bold text-secondary uppercase tracking-wider` |
| Caption (metadata) | `text-xs text-outline italic` |
| Overline (section marker) | `text-xs font-bold text-primary uppercase tracking-widest` |

---

## 3. Buttons

Every button must have minimum height `h-11` (44px) on mobile. Use these exact variants:

### Primary button
```tsx
className="h-11 px-6 flex items-center justify-center gap-2 bg-gradient-to-br from-primary to-primary-container text-white font-semibold text-sm rounded-lg shadow-md hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
```
Use for: main CTAs, "Guardar", "Nueva historia clínica", "Agregar paciente"

### Secondary button (outlined)
```tsx
className="h-11 px-6 flex items-center justify-center gap-2 border border-primary text-primary font-semibold text-sm rounded-lg hover:bg-primary/5 transition-colors disabled:opacity-50"
```
Use for: secondary actions, "Cancelar", "Ver todo"

### Ghost button (no border)
```tsx
className="h-11 px-4 flex items-center gap-2 text-sm font-semibold text-secondary rounded-lg hover:bg-surface-container transition-colors"
```
Use for: tertiary actions, nav items, "Imprimir"

### Destructive button
```tsx
className="h-11 px-6 flex items-center justify-center gap-2 bg-error text-white font-semibold text-sm rounded-lg hover:brightness-110 active:scale-[0.98] transition-all"
```
Use for: "Eliminar", "Rechazar"

### Icon-only button
```tsx
className="h-9 w-9 flex items-center justify-center rounded-lg text-outline hover:text-primary hover:bg-surface-container-low transition-colors"
```
Use for: table action columns (ver, editar, eliminar)

---

## 4. Badges / status chips

All badges: `rounded-full text-xs font-bold uppercase tracking-wider px-3 py-1`

| Status | Classes |
|--------|---------|
| Active / Activo | `bg-green-100 text-green-700` |
| Pending / Pendiente | `bg-amber-100 text-amber-700` |
| Completed / Completado | `bg-primary-fixed text-primary` |
| Cancelled / Error | `bg-error-container text-on-error-container` |
| Archived / Inactivo | `bg-surface-container-highest text-secondary` |
| Clinic / Neutral | `bg-surface-container text-secondary` |

Dot indicator variants (for table rows):
```tsx
// Active
<span className="flex items-center gap-1.5 text-green-700 text-xs font-semibold">
  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />Activo
</span>
```

---

## 5. Forms & inputs

**Standard input:**
```tsx
className="w-full text-base bg-surface-container-lowest border border-outline-variant/40 rounded-lg px-3 py-2.5 text-on-surface placeholder:text-outline/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
```

**Input in error state:**
```tsx
className="w-full text-base bg-surface-container-lowest border border-error/50 rounded-lg px-3 py-2.5 text-error focus:outline-none focus:ring-2 focus:ring-error/20 focus:border-error transition-all"
```

**Select:**
```tsx
className="w-full text-base bg-surface-container-lowest border border-outline-variant/40 rounded-lg px-3 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
```

**Textarea:**
```tsx
className="w-full text-base bg-surface-container-lowest border border-outline-variant/40 rounded-lg px-3 py-2.5 text-on-surface placeholder:text-outline/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
```

**Form label:**
```tsx
className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2"
```

**Error message below input:**
```tsx
<p className="text-xs text-error mt-1">Mensaje de error</p>
```

**All inputs MUST have `text-base`** — prevents iOS auto-zoom on focus.

**Form section container:**
```tsx
className="bg-surface-container-low rounded-xl p-6 md:p-10 space-y-6"
```

**Multi-column form grid:**
```tsx
className="grid grid-cols-1 md:grid-cols-2 gap-6"
// or 3-col:
className="grid grid-cols-1 md:grid-cols-3 gap-6"
```

---

## 6. Cards

**Base card (patient summary, info sidebar):**
```tsx
className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10"
```

**Section card (within page):**
```tsx
className="bg-surface rounded-xl p-6 border border-outline-variant/10"
```

**KPI card (gradient):**
```tsx
className="bg-gradient-to-br from-primary to-primary-container rounded-xl p-6 shadow-lg text-white"
```

**Dark card (sidebar accent, DICOM):**
```tsx
className="bg-sidebar rounded-xl p-6 text-white"
```

**Card header pattern:**
```tsx
<div className="flex items-center justify-between mb-6">
  <h3 className="text-sm font-bold font-headline uppercase tracking-tight text-on-surface">
    Título de sección
  </h3>
  <button className="...ghost button...">Acción</button>
</div>
```

**Card field pair (label + value):**
```tsx
<div className="flex justify-between text-xs">
  <span className="text-secondary">Etiqueta</span>
  <span className="font-bold text-on-surface">Valor</span>
</div>
```

---

## 7. Tables

**Table container:**
```tsx
className="w-full text-sm"
```

**Table header row:**
```tsx
<thead>
  <tr className="border-b border-outline-variant/20">
    <th className="text-left py-3 px-4 text-xs font-bold text-outline uppercase tracking-wider">
      Columna
    </th>
  </tr>
</thead>
```

**Table body row:**
```tsx
<tr className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
  <td className="py-3 px-4 text-on-surface">valor</td>
</tr>
```

**Mobile fallback** — tables become card lists at mobile:
```tsx
{/* Desktop table */}
<table className="hidden md:table w-full">...</table>

{/* Mobile cards */}
<div className="md:hidden space-y-3">
  {items.map(item => (
    <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/10">
      ...
    </div>
  ))}
</div>
```

---

## 8. Icons (Material Symbols)

Usage pattern:
```tsx
<span className="material-symbols-outlined text-[20px] text-primary">icon_name</span>
// Filled:
<span className="material-symbols-filled text-[20px] text-primary">icon_name</span>
```

Common icon names for this domain:

| Use case | Icon name |
|----------|-----------|
| Dentistry / clinical | `dentistry` |
| Patient | `person` |
| Calendar / appointment | `calendar_month` |
| Medical services | `medical_services` |
| Clinical history | `history` |
| Add note | `note_add` |
| Analytics / stats | `analytics` |
| Compliance | `shield_with_heart` |
| Upload / attach | `attach_file` |
| Download | `download` |
| Preview / eye | `visibility` |
| Delete | `delete` |
| Edit | `edit` |
| Share | `share` |
| Search | `search` |
| Filter | `filter_list` |
| Settings | `settings` |
| Close / X | `close` |
| Arrow back | `arrow_back` |
| Chevron right | `chevron_right` |
| Add | `add` |
| Check | `check_circle` |
| Error / alert | `error` |
| Warning | `warning` |
| Folder | `folder_open` |
| Image | `image` |
| PDF | `picture_as_pdf` |
| More options | `more_vert` |
| Bell / notification | `notifications` |
| Tooth | `dentistry` |
| Location / clinic | `location_on` |
| Phone | `phone` |
| Email | `email` |
| Trending up | `trending_up` |

---

## 9. Spacing

Use Tailwind's default scale (multiples of 4px). Common values for this UI:

| Value | Tailwind | Use |
|-------|----------|-----|
| 4px | `p-1` / `gap-1` | Icon gap, tight badges |
| 8px | `p-2` / `gap-2` | Button icon gap, inline spacing |
| 12px | `p-3` / `gap-3` | Table row padding, card inner gap |
| 16px | `p-4` / `gap-4` | Card padding mobile, grid gap |
| 24px | `p-6` / `gap-6` | Card padding desktop, section gap |
| 32px | `p-8` / `gap-8` | Form section padding |
| 40px | `p-10` | Large section padding |

Page container padding: `px-4 sm:px-6 lg:px-8`
Section vertical spacing: `py-6 sm:py-8 lg:py-12`

---

## 10. Section dividers

```tsx
{/* Accent line before section titles */}
<div className="flex items-center space-x-3 mb-6">
  <span className="w-8 h-0.5 bg-primary" />
  <h2 className="text-xl font-bold font-headline">Título</h2>
</div>
```

---

## 11. Full reference

For the visual rendering of every component, open:
`.claude/design-reference/design-system.html` in a browser.
For the PNG snapshot: `.claude/design-reference/design-system.png`
