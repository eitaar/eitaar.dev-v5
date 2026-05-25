# Top Projects Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Populate the existing empty "Top Projects" section on the homepage with a typographic list of projects flagged `topProject: true`, sorted newest first.

**Architecture:** Pure Astro server-rendering. All work happens in [src/pages/index.astro](../../../src/pages/index.astro): sort `topProjects` by `pubDate` in the frontmatter, then render a 12-column grid `<ul>` inside the existing section container. No new files, no new components, no JS, no styles.

**Tech Stack:** Astro 6, Tailwind CSS v4 (utility classes only — no new tokens).

**Reference spec:** [docs/superpowers/specs/2026-05-25-top-projects-section-design.md](../specs/2026-05-25-top-projects-section-design.md)

**Note on testing:** Per [CLAUDE.md](../../../CLAUDE.md), no test suite is configured. Verification is via `astro check` (type/Astro errors) and manual visual check in the dev server. TDD steps are replaced with: write code → run `astro check` → visually verify.

---

## File Structure

Only one file is touched:

- **Modify:** [src/pages/index.astro](../../../src/pages/index.astro)
  - Frontmatter (lines 1-29): add sort of `topProjects` by `pubDate` descending.
  - Template (lines 85-88): replace the empty body of the Top Projects `<div>` with a `<ul>` of project rows.

No new files. No changes to [src/content.config.ts](../../../src/content.config.ts), styles, or layouts.

---

## Task 1: Implement the Top Projects section

**Files:**
- Modify: `src/pages/index.astro` (frontmatter + lines 85-88)

### - [ ] Step 1: Sort topProjects by pubDate descending in the frontmatter

In [src/pages/index.astro](../../../src/pages/index.astro), find the existing line:

```ts
const topProjects = projects.filter((project) => project.data.topProject);
```

Replace it with:

```ts
const topProjects = projects
	.filter((project) => project.data.topProject)
	.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
```

This keeps the filter in one expression and adds a stable newest-first sort. `getTime()` is used to avoid `Date - Date` arithmetic type issues under `strict` TS.

### - [ ] Step 2: Populate the Top Projects section body

In [src/pages/index.astro](../../../src/pages/index.astro), the existing Top Projects block (currently lines 85-88) looks like:

```astro
<div class="flex w-full flex-col items-start justify-start gap-16 border-b border-border py-36">
	<h2 class="font-ndot47 text-6xl leading-none tracking-wide">Top Projects</h2>

</div>
```

Replace the empty line between the `<h2>` and the closing `</div>` so the block becomes:

```astro
<div class="flex w-full flex-col items-start justify-start gap-16 border-b border-border py-36">
	<h2 class="font-ndot47 text-6xl leading-none tracking-wide">Top Projects</h2>
	<ul class="flex w-full flex-col">
		{
			topProjects.map((project, i) => (
				<li class="grid w-full grid-cols-12 items-baseline gap-x-4 border-border py-10 not-first:border-t">
					<span class="col-span-1 font-share text-sm uppercase tracking-wider text-muted">
						{String(i + 1).padStart(2, "0")}
					</span>
					<h3 class="col-span-9 font-ndot47 text-4xl leading-none tracking-wide">
						{project.data.title}
					</h3>
					<span class="col-span-2 text-right font-share text-sm uppercase tracking-wider text-muted">
						{project.data.pubDate.getFullYear()}
					</span>
					<span class="col-span-11 col-start-2 font-share text-sm uppercase tracking-wider text-muted">
						{project.data.techStack.join(" · ")}
					</span>
				</li>
			))
		}
	</ul>
</div>
```

Notes on the class choices:
- `not-first:border-t` is the canonical Tailwind v4 form of `[&:not(:first-child)]:border-t` — applies the top border to every `<li>` except the first, so rows are separated without doubling against the section header gap or duplicating the section's outer `border-b`.
- `items-baseline` aligns the small caps spans to the title's baseline.
- `gap-x-4` keeps a small column gutter; vertical spacing between the title row and the tech row comes from natural line stacking inside the grid (no `gap-y`).

### - [ ] Step 3: Run `astro check`

Run from the project root:

```bash
npm run build -- --help >/dev/null 2>&1; npx astro check
```

Or simply:

```bash
npx astro check
```

Expected: `0 errors, 0 warnings, 0 hints` (or unchanged from before this task — at minimum, no new errors referencing `index.astro`).

If `astro check` complains about `project.data.pubDate.getTime()` or `getFullYear()`, confirm the schema in [src/content.config.ts:24](../../../src/content.config.ts#L24) still uses `z.coerce.date()` for `pubDate` — it should resolve to `Date`.

### - [ ] Step 4: Start the dev server and visually verify

Run:

```bash
npm run dev
```

Open `http://localhost:4321/` and confirm:

- A "Top Projects" section appears between Skills and the footer placeholder.
- At least one row is rendered (the existing `portfolio.md` project: number `01`, title "Portfolio website", year `2026`, tech `ASTRO · TAILWIND`).
- The row's number, title, and year sit on the same baseline. The tech stack line sits directly under the title.
- There is no top border above the first row.
- The section's outer `border-b` is the only horizontal line below the last row (no doubled bottom border).
- Dark mode (`data-theme="dark"` on `<html>`) renders the same shape with theme-correct colors.

Stop the dev server when verification is done.

### - [ ] Step 5: Run formatters

Run:

```bash
npm run format
```

Expected: prettier + biome complete without errors. The diff for `index.astro` should be limited to the lines you changed (no whole-file churn).

### - [ ] Step 6: Commit

```bash
git add src/pages/index.astro
git commit -m "feat(home): render top projects section"
```

Expected: a single commit touching only `src/pages/index.astro`.

---

## Self-Review

**Spec coverage:**

| Spec requirement | Implemented by |
| --- | --- |
| Reuse existing section container | Step 2 (kept outer `<div>` untouched) |
| List sorted by `pubDate` desc | Step 1 |
| Row content: number, title, year, tech stack | Step 2 |
| Number padded to two digits | Step 2 (`padStart(2, "0")`) |
| Tech stack joined by ` · ` and uppercase | Step 2 (`join(" · ")` + `uppercase` utility) |
| Border between rows, none above first or below last | Step 2 (`not-first:border-t`, no `border-b` on `<li>`) |
| No hover, no links, no JS | Step 2 (no anchors, no event handlers, no client directives) |
| Other schema fields not rendered | Step 2 (only `title`, `pubDate`, `techStack` referenced) |
| Empty-state: heading only, no fallback copy | Step 2 (`.map` over empty array yields nothing — no manual fallback) |
| Only [src/pages/index.astro](../../../src/pages/index.astro) modified | All steps |

No gaps.

**Placeholder scan:** None.

**Type consistency:** `pubDate` is `Date` (per `z.coerce.date()` in the schema), so `.getTime()` and `.getFullYear()` are valid. `techStack` is `string[]`, so `.join()` is valid. Class name `not-first:border-t` is the canonical Tailwind v4 form confirmed by the IDE diagnostic during spec writing.
