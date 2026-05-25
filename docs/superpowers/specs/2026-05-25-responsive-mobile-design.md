# Responsive Mobile Design Spec

**Date:** 2026-05-25
**Branch:** `responsive-mobile`
**Scope:** Make eitaar.dev-v5 render correctly on mobile (and reasonably on tablet) without breaking the existing desktop layout.

## Goals

- The site must not visually break at viewport widths from 320px upward.
- Desktop layout (≥1024px) must remain pixel-equivalent to the current state.
- Tablet (640–1023px) should render coherently without being polished further.

## Non-Goals

- No new components, pages, or features.
- No theme/color/font token changes.
- No hamburger menu (header nav is short enough to fit).
- No custom CSS breakpoints. No new global CSS rules.
- No JavaScript-driven layout switching.

## Principles

1. **Mobile-first authoring.** Base classes target mobile. `md:` and `lg:` progressively restore tablet/desktop styles.
2. **Tailwind standard breakpoints only.** `sm:` 640px, `md:` 768px, `lg:` 1024px. `lg:` is the boundary that restores the current desktop appearance.
3. **Standard utilities only.** Use `text-xl`, `px-6`, `gap-8`, etc. Do not use arbitrary values like `text-[13px]` or `px-[42px]`. (Reinforces existing project preference.)
4. **Token reuse.** Color and font variables in `global.css` / `light.css` / `dark.css` are not touched.
5. **Edits only.** No new files. All changes are within existing components.

## Affected Files

- [src/layouts/Layout.astro](../../../src/layouts/Layout.astro)
- [src/pages/index.astro](../../../src/pages/index.astro)
- [src/components/Project.astro](../../../src/components/Project.astro)
- [src/components/Footer.astro](../../../src/components/Footer.astro)
- [src/components/Header.astro](../../../src/components/Header.astro) — minor only

## Detailed Changes

### Layout & Footer

| Target                             | Current                             | Mobile (base)                | md                                               | lg           |
| ---------------------------------- | ----------------------------------- | ---------------------------- | ------------------------------------------------ | ------------ |
| `<main>` horizontal padding        | `px-48`                             | `px-6`                       | `md:px-12`                                       | `lg:px-48`   |
| Footer horizontal padding          | `px-48`                             | `px-6`                       | `md:px-12`                                       | `lg:px-48`   |
| Footer inner flex                  | `flex items-center justify-between` | `flex-col items-start gap-2` | `md:flex-row md:items-center md:justify-between` | (md applies) |
| Section vertical padding (`py-36`) | `py-36`                             | `py-20`                      | `md:py-28`                                       | `lg:py-36`   |
| Section gap (`gap-16`)             | `gap-16`                            | `gap-8`                      | `md:gap-12`                                      | `lg:gap-16`  |

### Hero (index.astro)

- Container: `flex justify-between` → base `flex-col-reverse items-center text-center gap-8` (avatar top via `flex-col-reverse` since markup order is text-then-image), `lg:flex-row lg:items-center lg:justify-between lg:text-left lg:gap-0`.
  - **Decision rationale:** avatar appears above logo on mobile per user choice. Source order keeps logo first for accessibility/SEO; `flex-col-reverse` flips visual order on mobile without DOM reordering.
- Avatar `h-96 w-96` → `h-48 w-48 md:h-64 md:w-64 lg:h-96 lg:w-96`.
- Logo `text-9xl` → `text-7xl md:text-8xl lg:text-9xl`.
- Subtitle `text-xl` → `text-base md:text-lg lg:text-xl`.
- Text column gap `gap-5` stays (small enough).

### About section

- Inner grid `grid grid-cols-12 items-start gap-11` → `flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-11`.
- Paragraph `col-span-9 text-xl` → `text-base md:text-lg lg:col-span-9 lg:text-xl`.
- PixelIcon `col-span-3` → `w-24 md:w-32 lg:col-span-3 lg:w-auto`.
- Section heading `text-6xl` → `text-4xl md:text-5xl lg:text-6xl` (same pattern applied to all `text-6xl` section headings).

### Skills section

- Grid `grid-cols-4` → `grid-cols-2 lg:grid-cols-4`.
- List item padding `px-8 first:pl-0 last:pr-0` → `px-0 lg:px-8 lg:first:pl-0 lg:last:pr-0`.
- Border `i !== 0 && "border-l border-border"` → keep the conditional, but prefix `lg:border-l` so the border only appears at desktop. On mobile, separation comes from grid `gap-y-8` (added on `<ul>`).
- `<ul>` add `gap-y-8 lg:gap-y-0` so two-column rows don't collide.
- Skill items `text-3xl` → `text-2xl md:text-3xl` (lg keeps `text-3xl`).

### Top Projects section

Heading uses the shared `text-6xl` → `text-4xl md:text-5xl lg:text-6xl` rule above.

### Project component (Project.astro)

Per user decision: stacked layout with year above title, summary below techstack.

- Anchor `flex items-center gap-8` → `flex flex-col items-start gap-3 lg:flex-row lg:items-center lg:gap-8`.
- Year `w-20 shrink-0 ... text-sm` → `text-xs lg:w-20 lg:shrink-0 lg:text-sm`. On mobile width is content-driven.
- Title `text-4xl` → `text-3xl lg:text-4xl`.
- Tech stack `text-xs` (already small) — keep as is.
- Summary `w-80 shrink-0 text-base` → `text-sm lg:w-80 lg:shrink-0 lg:text-base`. Mobile: no fixed width, flows naturally.
- ArrowSvg → add `hidden lg:block` so it disappears on mobile (clarity > affordance redundancy; the whole row is a link).
- Vertical padding `py-8` → `py-6 lg:py-8`.

### Contact section

- Big contact items (`text-7xl`) → `text-4xl md:text-5xl lg:text-7xl`.
- Big contact `pb-8` → `pb-4 lg:pb-8`.
- Big contact arrow `h-8 w-12` stays (still proportionate at smaller text). Confirm during verification.
- Small contacts grid `grid-cols-3` → `grid-cols-1 sm:grid-cols-3`.
- Small contact item `border-l border-border px-8 first:border-0 first:pl-0 last:pr-0` → `border-0 px-0 sm:border-l sm:border-border sm:px-8 sm:first:border-0 sm:first:pl-0 sm:last:pr-0`. Add `gap-y-6` to the `<ul>` so stacked rows breathe.
- Small contact label/value font sizes unchanged.

### Header (minor)

- Logo `text-lg` and nav `text-lg` — keep. Three nav items + theme toggle fit comfortably in 375px at `px-6`.
- One safety adjustment: `gap-4` → `gap-3 sm:gap-4` to reduce edge collision on very narrow screens.

## Verification

After implementation, manual verification at these viewport widths via `npm run dev`:

- **375px** (iPhone SE / standard mobile)
- **414px** (large mobile)
- **768px** (tablet, md breakpoint kicks in)
- **1024px** (lg breakpoint — must match current desktop)
- **1440px** (large desktop — must match current)

Per viewport, check each section:

1. No horizontal scroll on `<body>`.
2. Hero: avatar above text on mobile, side-by-side on lg.
3. About: text and icon stacked on mobile, 12-col grid on lg.
4. Skills: 2 columns on mobile, 4 on lg.
5. Projects: each card stacked on mobile, horizontal on lg with arrow visible.
6. Big contacts: text fits without overflow at every width.
7. Small contacts: 1 column on mobile, 3 columns from sm upward.
8. Footer: stacked on mobile, side-by-side on md+.
9. Header nav fits without wrapping.
10. Theme toggle still works at all widths.

Type check: `npx astro check` must pass.
Build: `npm run build` must succeed.

## Risks & Notes

- `flex-col-reverse` in the hero changes visual order without touching DOM order — screen readers read logo→avatar (the natural reading order), which is the right tradeoff.
- The hero `min-h-screen` is preserved; on mobile the stacked layout will still vertically center within the viewport.
- View transitions (`<ClientRouter>`) are currently commented out, so no transition-related responsive concerns.
- No tests exist in the project, so verification is manual/visual only. Stated explicitly per project convention.
