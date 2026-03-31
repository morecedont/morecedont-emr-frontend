## Automated enforcement
This project has a Claude Code hook at `.claude/hooks/responsive-check.sh` that
automatically checks every .tsx and .jsx file written by Claude for responsive violations.

Errors (block write):
- Fixed pixel widths (w-[Npx])
- Inputs without text-base
- Inline styles (style={{}})
- Native <img> tags instead of next/image
- Hardcoded hex colors

Warnings (allow but notify):
- Buttons without h-11 minimum height
- Grids that don't start at grid-cols-1

---

## Mobile-first rules

### Layout
- All layouts start as single column on mobile, expand via `sm:`, `md:`, `lg:` breakpoints
- No fixed pixel widths — use `w-full`, `max-w-*`, `mx-auto`
- No horizontal overflow at any breakpoint
- Container padding: `px-4 sm:px-6 lg:px-8`
- Section vertical spacing: `py-12 sm:py-16 lg:py-24`

### Typography
- Headings scale: `text-2xl sm:text-3xl lg:text-4xl xl:text-5xl`
- Body text: `text-sm sm:text-base`

### Navigation
- Mobile: hamburger with stacked vertical links
- Tablet (`md:`): condensed horizontal nav
- Desktop (`lg:`): full nav

### Cards & grids
- Grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Images: `w-full h-auto` or fixed aspect ratio with `aspect-*`

### Forms
- All fields: `w-full`
- Multi-column layouts: `md:` and up only
- Buttons: `w-full sm:w-auto` unless full-width by design
- All `<input>` and `<select>`: must include `text-base` (prevents iOS zoom)

### Touch targets
- All buttons and links: minimum `h-11` (44px) on mobile
- Spacing between clickable elements: at least `gap-3`

### Decorative elements
- Large background shapes: `hidden sm:block` or reduced sizing on mobile
- No decorative element causes horizontal scroll
