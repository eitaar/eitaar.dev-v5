# Skills Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the homepage Skills section as a responsive grid of 11 technologies, each with a placeholder pixel icon, name, and category tag.

**Architecture:** A single typed `skills` array lives in the frontmatter of [src/pages/index.astro](../../../src/pages/index.astro). The existing empty `<div>` marked `<!-- skill -->` is replaced with the heading + a `.map()` over that array that renders one card per skill. The site has no test suite (per [CLAUDE.md](../../../CLAUDE.md)), so verification uses `astro check`, `npm run build`, and visual inspection in the dev server instead of TDD.

**Tech Stack:** Astro 6, Tailwind CSS v4, TypeScript. Re-uses the existing `PixelIcon` import from [src/assets/bottle.svg](../../../src/assets/bottle.svg) as a placeholder icon. No new dependencies.

**Spec:** [docs/superpowers/specs/2026-05-25-skills-section-design.md](../specs/2026-05-25-skills-section-design.md)

---

## File Structure

- Modify: [src/pages/index.astro](../../../src/pages/index.astro)
  - Add `Skill` type alias to frontmatter
  - Add `skills: Skill[]` constant (11 items) to frontmatter
  - Replace the empty `<div class="py-36">…<!-- skill --></div>` block with the grid markup

No new files. No data module — the spec specifies inline data.

---

## Task 1: Implement and verify the Skills section

**Files:**
- Modify: [src/pages/index.astro](../../../src/pages/index.astro) — frontmatter and the `<!-- skill -->` block

- [ ] **Step 1: Add the `Skill` type and `skills` array to frontmatter**

Open [src/pages/index.astro](../../../src/pages/index.astro). The current frontmatter ends with `import Layout from "../layouts/Layout.astro";`. Append the type and array just below it (still inside the `---` fence):

```astro
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

- [ ] **Step 2: Verify the type compiles**

Run: `npx astro check`
Expected: 0 errors, 0 warnings related to `src/pages/index.astro`. Pre-existing warnings elsewhere are fine.

- [ ] **Step 3: Replace the empty Skills block with the grid**

Find this block in [src/pages/index.astro](../../../src/pages/index.astro):

```astro
<div class="py-36">
	<!-- skill -->
	 <h2 class="font-ndot47 text-6xl leading-none tracking-wide">Skills</h2>
</div>
```

Replace it with:

```astro
<div class="flex w-full flex-col items-start justify-start gap-16 border-b border-border py-36">
	<h2 class="font-ndot47 text-6xl leading-none tracking-wide">Skills</h2>
	<ul class="grid w-full grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
		{
			skills.map((skill) => (
				<li class="flex flex-col items-start gap-3">
					<PixelIcon aria-hidden="true" class="text-text h-16 w-16 fill-current" />
					<p class="font-share text-xl tracking-wide">{skill.name}</p>
					<p class="text-muted text-xs tracking-wide">
						{skill.category}
						{skill.note ? ` · ${skill.note.toLowerCase()}` : ""}
					</p>
				</li>
			))
		}
	</ul>
</div>
```

Notes on what changed vs the empty block:
- The outer `<div>` now uses the same `flex … border-b border-border py-36` pattern as the About section above it, for consistent vertical rhythm.
- `<ul>` + `<li>` are used because this is a list of items (semantic markup; Tailwind's reset already strips bullets).
- `PixelIcon` is the existing import from the frontmatter — no new import needed.
- The tag string is built inline: `frontend`, `native · learning`, `other`, `design`.

- [ ] **Step 4: Run the dev server and verify visually**

Run: `npm run dev`
Open: `http://localhost:4321`

Verify:
- The Skills heading renders below About in the same display font as About.
- 11 cards appear in a grid: 2 columns on narrow viewports, 3 at `md` (≥768px), 4 at `lg` (≥1024px).
- Every card shows the bottle.svg icon as a placeholder.
- Card text is the technology name (in `font-share`) and a small muted tag.
- The Rust card's tag reads `native · learning`.
- The Python card's tag reads `other`.
- The Figma card's tag reads `design`.
- Toggle dark mode (the existing theme toggle) and confirm the icon and text colors flip correctly via `text-text` / `text-muted`.

Stop the dev server when done.

- [ ] **Step 5: Run the production build**

Run: `npm run build`
Expected: build completes with no errors. The `dist/` output contains the rendered page.

- [ ] **Step 6: Format**

Run: `npm run format`
Expected: prettier + biome rewrite formatting if needed; no errors.

- [ ] **Step 7: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add skills section grid to homepage"
```

---

## Self-Review

- **Spec coverage:**
  - 11 items rendered ✓ (Step 1 array, Step 3 grid)
  - Domain shown as tag, not section header ✓ (Step 3 tag line)
  - Outer wrapper matches About's `border-b border-border py-36` ✓ (Step 3 outer div)
  - Heading `font-ndot47 text-6xl` preserved ✓ (Step 3 keeps the existing h2)
  - Grid `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` ✓ (Step 3 ul)
  - Per-card layout: icon → name (`font-share`) → tag (`text-xs text-muted`) ✓ (Step 3 li)
  - Rust tag reads `native · learning`, others read just the category ✓ (Step 3 inline expression)
  - All tags `text-muted`, no per-category colors ✓ (Step 3 class)
  - Placeholder icon = `bottle.svg` via existing `PixelIcon` import ✓ (Step 3 PixelIcon usage)
  - Data lives inline in `index.astro` frontmatter, not a separate module ✓ (Step 1)
  - Done-when items 1–5: covered by Steps 3, 4, 4, 4, 2+5
- **Placeholders:** No TBD/TODO. Every code block contains the literal content to paste.
- **Type consistency:** `Skill` type defined once in Step 1 and used by the array in the same step. The map callback in Step 3 only reads `skill.name`, `skill.category`, `skill.note` — all defined on the type.
