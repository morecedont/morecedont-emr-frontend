#!/bin/bash
# Hook: responsive-check
# Triggers after Claude writes any .tsx or .jsx file under src/
# Checks that the file follows mobile-first responsive rules

FILE=$1

# Only run on component and page files
if [[ ! "$FILE" =~ \.(tsx|jsx)$ ]]; then
  exit 0
fi

ERRORS=()
WARNINGS=()

# Rule 1 — No fixed pixel widths on layout elements (w-[Npx] on divs/sections)
if grep -qE 'className="[^"]*w-\[[0-9]+px\]' "$FILE"; then
  ERRORS+=("❌ Fixed pixel width found (w-[Npx]). Use w-full, max-w-*, or Tailwind fractional widths.")
fi

# Rule 2 — Inputs must have text-base to prevent iOS zoom
if grep -qE '<input' "$FILE"; then
  if ! grep -qE '<input[^>]*text-base' "$FILE"; then
    ERRORS+=("❌ Input found without text-base class. Add text-base to prevent iOS zoom on focus.")
  fi
fi

# Rule 3 — Buttons must have minimum h-11 for touch targets
if grep -qE '<button' "$FILE"; then
  if ! grep -qE 'h-11|h-12|h-14' "$FILE"; then
    WARNINGS+=("⚠️  Button found without h-11 minimum. Ensure touch targets are at least 44px.")
  fi
fi

# Rule 4 — No inline styles
if grep -qE 'style=\{' "$FILE"; then
  ERRORS+=("❌ Inline style found. Use Tailwind classes only — no style={{}} props.")
fi

# Rule 5 — Images must use next/image
if grep -qE '<img ' "$FILE"; then
  ERRORS+=("❌ Native <img> tag found. Use next/image instead.")
fi

# Rule 6 — Grid must start mobile-first (grid-cols-1 before sm/md/lg variants)
if grep -qE 'grid-cols-[2-9]' "$FILE"; then
  if ! grep -qE 'grid-cols-1' "$FILE"; then
    WARNINGS+=("⚠️  Grid starts at 2+ columns with no grid-cols-1 base. Grids must start mobile-first.")
  fi
fi

# Rule 7 — No hardcoded hex colors
if grep -qE 'text-\[#|bg-\[#|border-\[#' "$FILE"; then
  ERRORS+=("❌ Hardcoded hex color found (e.g. bg-[#4C6FFF]). Use design system classes from DESIGN.md.")
fi

# Output results
if [ ${#ERRORS[@]} -gt 0 ] || [ ${#WARNINGS[@]} -gt 0 ]; then
  echo ""
  echo "🔍 Responsive check: $FILE"
  echo "─────────────────────────────────────"

  for error in "${ERRORS[@]}"; do
    echo "$error"
  done

  for warning in "${WARNINGS[@]}"; do
    echo "$warning"
  done

  echo "─────────────────────────────────────"
  echo "📖 See RESPONSIVE.md for full guidelines."
  echo ""
fi

# Exit 1 if there are errors (not warnings) to block the action
if [ ${#ERRORS[@]} -gt 0 ]; then
  exit 1
fi

exit 0
