# Skills Section Design

**Date:** 2026-05-25
**Target:** [src/pages/index.astro](../../../src/pages/index.astro) — Skills section (currently only the `<h2>` is rendered)

## Purpose

A showcase of the technical stack eitaar has used. Audience is general visitors of the portfolio. The section communicates breadth of experience across frontend, native, design, and other domains.

## Content

11 skill items, grouped by domain (the domain is shown as a tag under each item, not as a section header):

| Item        | Category | Note     |
| ----------- | -------- | -------- |
| TypeScript  | frontend |          |
| JavaScript  | frontend |          |
| Astro       | frontend |          |
| Vue         | frontend |          |
| Nuxt        | frontend |          |
| Tailwind CSS| frontend |          |
| GSAP        | frontend |          |
| HTML & CSS  | frontend |          |
| Rust        | native   | Learning |
| Python      | other    |          |
| Figma       | design   |          |

## Layout

The section follows the established homepage pattern:

- Outer wrapper: `border-b border-border py-36` (matching About section)
- Heading: existing `<h2 class="font-ndot47 text-6xl leading-none tracking-wide">Skills</h2>`
- Grid below the heading: `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6`

Each grid cell contains:

1. A pixel-art icon (placeholder for now — see "Icon Strategy" below)
2. The technology name in `font-share` (the secondary display face used in the hero subtitle)
3. A category tag: `text-xs text-muted`, e.g. `frontend`. For Rust, append ` · learning`.

All category tags use `text-muted` — no per-category color accents.

```
[icon]              [icon]              [icon]              [icon]
TypeScript          JavaScript          Astro               Vue
frontend            frontend            frontend            frontend

[icon]              [icon]              [icon]              [icon]
Nuxt                Tailwind CSS        GSAP                HTML & CSS
frontend            frontend            frontend            frontend

[icon]              [icon]              [icon]
Rust                Python              Figma
native · learning   other               design
```

## Data

The list lives in the frontmatter of [src/pages/index.astro](../../../src/pages/index.astro) as a typed constant:

```ts
type Skill = {
  name: string;
  category: "frontend" | "native" | "other" | "design";
  note?: string;
};

const skills: Skill[] = [
  { name: "TypeScript", category: "frontend" },
  { name: "JavaScript", category: "frontend" },
  { name: "Astro", category: "frontend" },
  { name: "Vue", category: "frontend" },
  { name: "Nuxt", category: "frontend" },
  { name: "Tailwind CSS", category: "frontend" },
  { name: "GSAP", category: "frontend" },
  { name: "HTML & CSS", category: "frontend" },
  { name: "Rust", category: "native", note: "Learning" },
  { name: "Python", category: "other" },
  { name: "Figma", category: "design" },
];
```

The skills are rendered inline by mapping over this array. No separate component file and no separate data module — the 11-item list is small enough to live next to the markup that consumes it.

The category tag string is derived from the item: `${category}${note ? ` · ${note.toLowerCase()}` : ""}`.

## Icon Strategy

Custom pixel-art icons (one per technology, matching the aesthetic of [src/assets/bottle.svg](../../../src/assets/bottle.svg)) are the target end state, but creating 11 icons up-front is too much work to block the section ship.

**Phase 1 (this spec):** Every item renders with [src/assets/bottle.svg](../../../src/assets/bottle.svg) as a placeholder icon. The section is fully laid out, typography and tags are final, and only the icon glyph is provisional.

**Phase 2 (out of scope here):** Custom pixel icons are authored one at a time and swapped in by referencing a new SVG in the corresponding skill entry. This will eventually require adding an `icon` field to the `Skill` type, but that change is deferred until at least one real icon exists.

## Non-Goals

- No proficiency indicators (bars, stars, percentages)
- No per-category color accents
- No section subheadings per domain (categories are tag-only)
- No hover interactions / GSAP animations in this pass
- No real per-technology icons in this pass (placeholder only)
- No React (intentionally excluded from the list)

## Done When

1. The grid renders all 11 items on the homepage with placeholder icons
2. The layout matches the About section's vertical rhythm (`py-36`, bottom border)
3. The grid is responsive: 2 cols mobile, 3 cols at `md`, 4 cols at `lg`
4. The Rust tag reads `native · learning`; all other tags read just the category name
5. `npm run build` and `astro check` pass
