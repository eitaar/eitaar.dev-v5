# Top Projects Section — Design

## Purpose

Add a "Top Projects" section to the homepage ([src/pages/index.astro](../../../src/pages/index.astro)) that lists projects where `topProject: true`, using a minimal, typographic style consistent with the existing About and Skills sections.

The section heading and outer container already exist at [src/pages/index.astro:85-88](../../../src/pages/index.astro#L85-L88); they need to be populated with the project rows.

## Data Source

`topProjects` is already computed at [src/pages/index.astro:8-9](../../../src/pages/index.astro#L8-L9):

```ts
const projects = await getCollection("projects");
const topProjects = projects.filter((project) => project.data.topProject);
```

Each entry conforms to the `projects` collection schema in [src/content.config.ts:20-33](../../../src/content.config.ts#L20-L33). The fields used by this section:

- `title: string`
- `pubDate: Date`
- `techStack: string[]`

Other schema fields (`summary`, `repoUrl`, `demoUrl`, `heroImage`) are intentionally **not** rendered. They remain in the schema for use elsewhere (e.g. a future project detail page or listing).

## Layout

### Container

Reuse the existing section container at [src/pages/index.astro:85](../../../src/pages/index.astro#L85):

```html
<div class="flex w-full flex-col items-start justify-start gap-16 border-b border-border py-36">
  <h2 class="font-ndot47 text-6xl leading-none tracking-wide">Top Projects</h2>
  <!-- project list goes here -->
</div>
```

This matches the existing About and Skills sections (`py-36`, `gap-16`, `border-b border-border`, `font-ndot47 text-6xl` heading).

### Project list

A `<ul class="flex w-full flex-col">` containing one `<li>` per project.

**Ordering:** sort `topProjects` by `pubDate` descending (newest first) before mapping. Implemented inline in the frontmatter, not pushed into the schema or collection config.

**Row separator:** each `<li>` after the first gets `border-t border-border` (using `:not(:first-child)` via Tailwind's `not-first:border-t` or by index check in the map). The first row sits flush against the section heading gap with no top border. No bottom border on the last row either — the section's outer `border-b` provides the closing line.

### Row structure

Each `<li>` is a 12-column grid with two rows of content and vertical padding `py-10`:

```
col:  1            2 3 4 5 6 7 8 9 10    11 12
row1: [number]     [title ────────────]  [year]
row2:              [tech · stack ────────────────]
```

Column spans: number `col-span-1`, title `col-span-9`, year `col-span-2` (right-aligned). Tech row sits in `col-start-2 col-span-11`.

Tailwind sketch:

```html
<li class="grid w-full grid-cols-12 items-baseline gap-x-4 py-10 not-first:border-t border-border">
  <span class="col-span-1 font-share text-sm uppercase tracking-wider text-muted">01</span>
  <h3 class="col-span-9 font-ndot47 text-4xl leading-none tracking-wide">Portfolio Website</h3>
  <span class="col-span-2 text-right font-share text-sm uppercase tracking-wider text-muted">2026</span>
  <span class="col-span-11 col-start-2 font-share text-sm uppercase tracking-wider text-muted">
    Astro · Tailwind
  </span>
</li>
```

**Number:** the 1-based index in the rendered list, padded to two digits (`String(i + 1).padStart(2, "0")`).

**Title:** rendered from `project.data.title` as-is (preserving original casing from the markdown frontmatter).

**Year:** `project.data.pubDate.getFullYear()`.

**Tech stack:** `project.data.techStack.join(" · ")`. Rendered uppercase via the `uppercase` Tailwind utility so the source data can stay mixed-case.

### Behavior

- **No hover effects.** Static typographic listing.
- **No links.** Neither the row nor any child is an anchor.
- **No interactivity / JS.** Pure server-rendered Astro.

## Empty state

If `topProjects` is empty after sorting, render the section heading only — no `<ul>`, no fallback text. This matches the section's current behavior (heading + empty space) and avoids placeholder copy that would need maintenance.

## Out of scope

- Project detail pages
- Filtering, pagination, or tag navigation
- Animations or scroll effects
- Showing non-top projects elsewhere on the homepage
- Image rendering (`heroImage`)
- Surfacing `repoUrl` / `demoUrl` on this section

## Affected files

- [src/pages/index.astro](../../../src/pages/index.astro) — only file modified. Add sort + map inside the existing Top Projects `<div>` at line 85-88.

No changes to:
- [src/content.config.ts](../../../src/content.config.ts) (schema is already sufficient)
- Styles, layouts, or components
