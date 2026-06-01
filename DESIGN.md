# Design System: The Clinical Curator

## 1. Overview & Creative North Star
The "Morecedont" experience is defined by the **"Clinical Curator"** North Star. We are moving away from the cold, spreadsheet-like rigidity of legacy EMRs and toward a high-end editorial experience. This design system treats patient data not as rows in a database, but as critical information within a premium, living document. 

The aesthetic is **Soft Minimalism**: a high-contrast, typographically-driven interface that utilizes "breathing room" (generous white space) and layered depth to reduce clinician cognitive load. We break the standard "dashboard" template by using intentional asymmetry and overlapping surface layers, creating a workspace that feels sophisticated, authoritative, and approachable.

---

### 2. Colors & Surface Architecture
Our palette transitions from clinical sterile whites to warm, tonal blues and lilacs. This creates a "calm-tech" environment that builds trust.

*   **The "No-Line" Rule:** Direct structural sectioning must never use 1px solid borders. To separate a sidebar from a main feed, or a patient header from a chart, use background color shifts. Place `surface-container-low` (#f0f3ff) against the `background` (#f8f9ff).
*   **Surface Hierarchy & Nesting:** Treat the UI as physical layers. 
    *   **Level 0 (Base):** `background` (#f8f9ff).
    *   **Level 1 (Sections):** `surface-container` (#eaeef9) for large content areas.
    *   **Level 2 (Active Cards):** `surface-container-lowest` (#ffffff) for data entry or focused charts.
*   **The "Glass & Gradient" Rule:** For floating headers or persistent navigation, use Glassmorphism. Apply `surface_container_lowest` at 80% opacity with a `backdrop-blur` of 20px. 
*   **Signature Textures:** For high-priority CTAs or "Summary" highlights, use a subtle linear gradient from `primary` (#224bdd) to `primary_container` (#4367f7) at a 135-degree angle. This adds "soul" and depth to otherwise flat medical data.

---

### 3. Typography
We use a dual-font strategy to balance authority with readability.

*   **Display & Headlines (Manrope):** Chosen for its modern, geometric structure. Use `display-md` for patient names and `headline-sm` for section titles. These should be set in `on_surface` (#171c23) with tighter letter-spacing (-0.02em) to create an editorial feel.
*   **Body & Labels (Inter):** The workhorse of the system. `body-md` is the standard for patient notes. 
*   **The Hierarchy of Trust:** Use high contrast in scale. A `headline-lg` title paired with a `label-sm` subtitle creates a clear visual anchor, guiding the clinician’s eye to the most critical data first.

---

### 4. Elevation & Depth
In this design system, depth is a functional tool, not a decoration.

*   **The Layering Principle:** Avoid shadows for static elements. Instead, use "Tonal Layering." A patient vitals card (`surface-container-lowest`) sitting on a chart area (`surface-container-low`) creates a natural, soft lift.
*   **Ambient Shadows:** For temporary modals or floating action buttons (FABs), use a 15% opacity version of `secondary` (#525e7f) with a 40px blur and 10px Y-offset. This mimics natural light reflecting off medical equipment.
*   **The "Ghost Border" Fallback:** If a boundary is required for accessibility in forms, use the `outline_variant` (#c4c5d8) at **20% opacity**. It should be felt, not seen.

---

### 5. Components

*   **Buttons:** 
    *   *Primary:* Gradient-filled (Primary to Primary-Container) with 8px radius (`DEFAULT`).
    *   *Secondary:* `surface-container-highest` background with `on_surface` text. No border.
*   **Inputs:** White background (`surface-container-lowest`), `DEFAULT` radius, and a 1px "Ghost Border." Focus states should transition the border to `primary` with a 4px soft outer glow.
*   **Cards & Lists:** **Strictly forbid divider lines.** Use `1.4rem` (Spacing 4) of vertical white space to separate list items. If items need grouping, wrap them in a `surface-container-low` container with a `lg` (1rem) radius.
*   **Status Badges:** Use "Pill" shapes (`full` radius). For "Active" or "Stable," use a soft green tint; for "Pending," use `surface-dim`. Text inside badges should always be `label-md` bold.
*   **Patient Timeline:** A unique component using a vertical `primary_fixed` (#dde1ff) line (2px wide) with `surface-container-lowest` nodes to represent chronological medical events.

---

### 6. Do’s and Don’ts

#### Do:
*   **Do** use asymmetrical layouts (e.g., a wide left column for notes and a narrow right column for quick vitals) to create an editorial look.
*   **Do** use "Medium" spacing (1rem) as your baseline for internal padding to ensure the UI feels "approachable."
*   **Do** use `outline` icons for a clinical, precise feel.

#### Don’t:
*   **Don't** use pure black (#000000) for text. Always use `on_surface` (#171c23) to keep the interface warm.
*   **Don't** use standard 1px grey dividers to separate content. Use background color blocks or white space.
*   **Don't** stack more than three levels of surface nesting, as it breaks the "Soft Minimalist" aesthetic.