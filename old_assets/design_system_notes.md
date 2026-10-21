# CampusVoice — Design System Notes (Archived Draft)

> ⚠️ This was a working draft from early development.
> The final design system is implemented in `/src/index.css`.

---

## Colour Palette (Draft v1 — Revised)

| Token Name         | Old Hex   | Final Hex  | Notes                        |
|--------------------|-----------|------------|------------------------------|
| Background Primary | #0B0E1A   | #0A0D14    | Slightly darker in final     |
| Card Surface       | #131828   | #161B2A    | More contrast in final       |
| Accent Blue        | #4F9BFF   | #60A5FA    | Tailwind blue-400 adopted    |
| Accent Purple      | #9D6FFF   | #A78BFA    | Tailwind violet-400 adopted  |
| Accent Green       | #26D97F   | #34D399    | Tailwind emerald-400 adopted |
| Accent Red         | #EF4040   | #EF4444    | Tailwind red-500 adopted     |
| Text Primary       | #FFFFFF   | #FFFFFF    | No change                    |
| Text Secondary     | #94A3B8   | #94A3B8    | Tailwind slate-400           |

---

## Typography (Draft)

```css
/* Rejected fonts considered during design phase */
font-family: 'Space Grotesk', sans-serif; /* too futuristic */
font-family: 'DM Sans', sans-serif;       /* considered for body */
font-family: 'Nunito', sans-serif;        /* too casual */

/* Final choices adopted */
font-family: 'Syne', sans-serif;          /* headings */
font-family: 'Inter', sans-serif;         /* body text */
```

---

## Component Spacing Scale (Early Draft)

| Scale | Value  | Usage                  |
|-------|--------|------------------------|
| xs    | 4px    | Icon gaps              |
| sm    | 8px    | Input padding inner    |
| md    | 16px   | Card internal padding  |
| lg    | 24px   | Section spacing        |
| xl    | 32px   | Page section gaps      |
| 2xl   | 48px   | Layout breathing room  |

---

## Border Radius Decisions

- Cards: `24px` — feels premium and modern
- Inputs: `12px` — softer than buttons
- Buttons: `12px` — consistent with inputs
- Badges: `9999px` (fully rounded pills)
- Avatars: `50%` (circular)

---

## Rejected UI Patterns

- ❌ Sidebar navigation — replaced with top tab pills
- ❌ Table-heavy admin view — replaced with card grid
- ❌ Modal-only complaint form — kept as modal but with animated entry
- ❌ Light mode toggle — dark mode only for v1

---

## Animation Notes

All animations use Framer Motion (now `motion/react`):
- Login card entry: `opacity 0→1`, `y: 30→0`
- Modal open: `scale 0.95→1`, `opacity 0→1`
- Toast notifications: slide in from right, fade out after 5s
- Skeleton loaders: pulse shimmer effect

---

*This design document was replaced by the live implementation in `src/index.css` and `src/App.tsx`.*
