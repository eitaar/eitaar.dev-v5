# Responsive Mobile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make eitaar.dev-v5 render correctly on mobile (≥320px) while preserving the current desktop layout at `lg:` (≥1024px).

**Architecture:** Tailwind v4 utility-class diffs only. Mobile-first authoring with `md:`/`lg:` prefixes progressively restoring tablet/desktop styles. No new files, no JS, no theme changes.

**Tech Stack:** Astro 6, Tailwind v4, TypeScript. No test suite (per [CLAUDE.md](../../../CLAUDE.md)); verification is `astro check` + manual browser audit on `npm run dev`.

**Branch:** Work happens on `responsive-mobile` (already checked out).

**Spec:** [2026-05-25-responsive-mobile-design.md](../specs/2026-05-25-responsive-mobile-design.md)

---

## Conventions

Because no test suite exists, each task follows this rhythm:
1. Read the current file region.
2. Apply the exact diff shown.
3. Run `npx astro check` — must report **0 errors**.
4. Commit on the `responsive-mobile` branch.

A full visual audit happens at the end (Task 8).

---

## File Map

| File | Responsibility | Tasks |
|---|---|---|
| `src/layouts/Layout.astro` | `<main>` horizontal padding | Task 1 |
| `src/components/Footer.astro` | Footer padding + flex direction | Task 1 |
| `src/pages/index.astro` | All 4 section-level layout changes | Tasks 2–6 |
| `src/components/Project.astro` | Project row card layout | Task 5 |
| `src/components/Header.astro` | Nav gap safety tweak | Task 7 |

---

### Task 1: Layout shell + Footer

**Files:**
- Modify: `src/layouts/Layout.astro:32`
- Modify: `src/components/Footer.astro:1-2`

- [ ] **Step 1: Update `<main>` padding in Layout.astro**

Open [src/layouts/Layout.astro](../../../src/layouts/Layout.astro) line 32. Replace:

```astro
<main class="px-48">
```

with:

```astro
<main class="px-6 md:px-12 lg:px-48">
```

- [ ] **Step 2: Update Footer padding and flex direction**

Open [src/components/Footer.astro](../../../src/components/Footer.astro). Replace lines 1-2:

```astro
<footer class="px-48 pt-16 pb-6">
	<div class="flex items-center justify-between">
```

with:

```astro
<footer class="px-6 pt-16 pb-6 md:px-12 lg:px-48">
	<div class="flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-between">
```

- [ ] **Step 3: Type check**

Run: `npx astro check`
Expected: `0 errors, 0 warnings` (or unchanged warning count from baseline).

- [ ] **Step 4: Commit**

```bash
git add src/layouts/Layout.astro src/components/Footer.astro
git commit -m "feat(responsive): mobile-first padding for main and footer"
```

---

### Task 2: Hero section

**Files:**
- Modify: `src/pages/index.astro:19-33`

- [ ] **Step 1: Replace the hero block**

Open [src/pages/index.astro](../../../src/pages/index.astro). Replace lines 19-33:

```astro
<div class="flex min-h-screen w-full items-center justify-between border-border">
	<div class="flex flex-col items-start justify-center gap-5 pt-12">
		<h1 class="font-ndot47 text-9xl leading-none tracking-tight">eitaar</h1>
		<p class="font-share text-xl tracking-wide text-muted">Software Developer / Student</p>
	</div>
	<Image
		class="h-96 w-96"
		src={avatarImg}
		alt="avatar image"
		fetchpriority={"high"}
		loading={"eager"}
		format="avif"
		quality="mid"
	/>
</div>
```

with:

```astro
<div class="flex min-h-screen w-full flex-col-reverse items-center justify-center gap-8 border-border text-center lg:flex-row lg:items-center lg:justify-between lg:gap-0 lg:text-left">
	<div class="flex flex-col items-center justify-center gap-5 pt-12 lg:items-start">
		<h1 class="font-ndot47 text-7xl leading-none tracking-tight md:text-8xl lg:text-9xl">eitaar</h1>
		<p class="font-share text-base tracking-wide text-muted md:text-lg lg:text-xl">Software Developer / Student</p>
	</div>
	<Image
		class="h-48 w-48 md:h-64 md:w-64 lg:h-96 lg:w-96"
		src={avatarImg}
		alt="avatar image"
		fetchpriority={"high"}
		loading={"eager"}
		format="avif"
		quality="mid"
	/>
</div>
```

**Why `flex-col-reverse`:** markup order is text-then-image, but spec requires avatar visually above logo on mobile. `flex-col-reverse` flips visual order without breaking accessibility reading order.

- [ ] **Step 2: Type check**

Run: `npx astro check`
Expected: `0 errors`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(responsive): stack hero vertically on mobile"
```

---

### Task 3: About section

**Files:**
- Modify: `src/pages/index.astro:34-48`

- [ ] **Step 1: Replace the About block**

In [src/pages/index.astro](../../../src/pages/index.astro), replace lines 34-48:

```astro
<div class="flex w-full flex-col items-start justify-start gap-16 border-border py-36">
	<h2 class="font-ndot47 text-6xl leading-none tracking-wide">About</h2>
	<div class="grid grid-cols-12 items-start gap-11">
		<p class="col-span-9 text-xl text-pretty">
			I am a software developer, focused on the frontend. I'm currently learning Rust to try
			something other than web and build native applications, drawn by its performance and the
			chance to work with physical devices. Outside of work, I like to spend time reading books
			and comics or listening to music.
		</p>
		<PixelIcon
			aria-label="pixel art icon"
			class="text-text col-span-3 animate-motionspin fill-current"
		/>
	</div>
</div>
```

with:

```astro
<div class="flex w-full flex-col items-start justify-start gap-8 border-border py-20 md:gap-12 md:py-28 lg:gap-16 lg:py-36">
	<h2 class="font-ndot47 text-4xl leading-none tracking-wide md:text-5xl lg:text-6xl">About</h2>
	<div class="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-11">
		<p class="text-base text-pretty md:text-lg lg:col-span-9 lg:text-xl">
			I am a software developer, focused on the frontend. I'm currently learning Rust to try
			something other than web and build native applications, drawn by its performance and the
			chance to work with physical devices. Outside of work, I like to spend time reading books
			and comics or listening to music.
		</p>
		<PixelIcon
			aria-label="pixel art icon"
			class="text-text w-24 animate-motionspin fill-current md:w-32 lg:col-span-3 lg:w-auto"
		/>
	</div>
</div>
```

- [ ] **Step 2: Type check**

Run: `npx astro check`
Expected: `0 errors`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(responsive): stack About copy and icon on mobile"
```

---

### Task 4: Skills section

**Files:**
- Modify: `src/pages/index.astro:49-72`

- [ ] **Step 1: Replace the Skills block**

In [src/pages/index.astro](../../../src/pages/index.astro), replace lines 49-72:

```astro
<div class="flex w-full flex-col items-start justify-start gap-16 border-border py-36">
	<h2 class="font-ndot47 text-6xl leading-none tracking-wide">Skills</h2>
	<ul class="grid w-full grid-cols-4">
		{
			skillGroups.map((group, i) => (
				<li
					class:list={[
						"flex flex-col gap-6 px-8 first:pl-0 last:pr-0",
						i !== 0 && "border-l border-border",
					]}
				>
					<span class="font-share text-sm tracking-wider text-muted uppercase">
						{group.category}
					</span>
					<ul class="flex flex-col gap-3 font-ndot47 text-3xl leading-none tracking-wide">
						{group.items.map((item) => (
							<li>{item}</li>
						))}
					</ul>
				</li>
			))
		}
	</ul>
</div>
```

with:

```astro
<div class="flex w-full flex-col items-start justify-start gap-8 border-border py-20 md:gap-12 md:py-28 lg:gap-16 lg:py-36">
	<h2 class="font-ndot47 text-4xl leading-none tracking-wide md:text-5xl lg:text-6xl">Skills</h2>
	<ul class="grid w-full grid-cols-2 gap-y-8 lg:grid-cols-4 lg:gap-y-0">
		{
			skillGroups.map((group, i) => (
				<li
					class:list={[
						"flex flex-col gap-6 px-0 lg:px-8 lg:first:pl-0 lg:last:pr-0",
						i !== 0 && "lg:border-l lg:border-border",
					]}
				>
					<span class="font-share text-sm tracking-wider text-muted uppercase">
						{group.category}
					</span>
					<ul class="flex flex-col gap-3 font-ndot47 text-2xl leading-none tracking-wide md:text-3xl">
						{group.items.map((item) => (
							<li>{item}</li>
						))}
					</ul>
				</li>
			))
		}
	</ul>
</div>
```

- [ ] **Step 2: Type check**

Run: `npx astro check`
Expected: `0 errors`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(responsive): two-column skills grid on mobile"
```

---

### Task 5: Top Projects heading + Project component

**Files:**
- Modify: `src/pages/index.astro:73-78`
- Modify: `src/components/Project.astro:15-34`

- [ ] **Step 1: Update Top Projects section wrapper**

In [src/pages/index.astro](../../../src/pages/index.astro), replace lines 73-78:

```astro
<div class="flex w-full flex-col items-start justify-start gap-16 border-border py-36">
	<h2 class="font-ndot47 text-6xl leading-none tracking-wide">Top Projects</h2>
	<div class="flex w-full flex-col">
		{topProjects.map((project) => <Project project={project} />)}
	</div>
</div>
```

with:

```astro
<div class="flex w-full flex-col items-start justify-start gap-8 border-border py-20 md:gap-12 md:py-28 lg:gap-16 lg:py-36">
	<h2 class="font-ndot47 text-4xl leading-none tracking-wide md:text-5xl lg:text-6xl">Top Projects</h2>
	<div class="flex w-full flex-col">
		{topProjects.map((project) => <Project project={project} />)}
	</div>
</div>
```

- [ ] **Step 2: Update Project component**

Open [src/components/Project.astro](../../../src/components/Project.astro). Replace lines 15-34:

```astro
<a href={href} class="group flex items-center gap-8 border-b border-border py-8 last:border-0">
	<span class="w-20 shrink-0 font-share text-sm tracking-wider text-muted">{year}</span>
	<div class="min-w-0 flex-1">
		<h3 class="mb-2 text-4xl leading-none font-bold tracking-tight">{title}</h3>
		<ul
			class="flex flex-wrap items-center gap-x-2 font-share text-xs tracking-widest text-muted uppercase"
		>
			{
				techStack.map((item, i) => (
					<>
						{i > 0 && <span aria-hidden="true">·</span>}
						<li>{item}</li>
					</>
				))
			}
		</ul>
	</div>
	<p class="w-80 shrink-0 text-base leading-relaxed text-muted">{summary}</p>
	<ArrowSvg class="h-8 w-12 shrink-0 fill-current transition-transform group-hover:translate-x-1" />
</a>
```

with:

```astro
<a href={href} class="group flex flex-col items-start gap-3 border-b border-border py-6 last:border-0 lg:flex-row lg:items-center lg:gap-8 lg:py-8">
	<span class="font-share text-xs tracking-wider text-muted lg:w-20 lg:shrink-0 lg:text-sm">{year}</span>
	<div class="min-w-0 flex-1">
		<h3 class="mb-2 text-3xl leading-none font-bold tracking-tight lg:text-4xl">{title}</h3>
		<ul
			class="flex flex-wrap items-center gap-x-2 font-share text-xs tracking-widest text-muted uppercase"
		>
			{
				techStack.map((item, i) => (
					<>
						{i > 0 && <span aria-hidden="true">·</span>}
						<li>{item}</li>
					</>
				))
			}
		</ul>
	</div>
	<p class="text-sm leading-relaxed text-muted lg:w-80 lg:shrink-0 lg:text-base">{summary}</p>
	<ArrowSvg class="hidden h-8 w-12 shrink-0 fill-current transition-transform group-hover:translate-x-1 lg:block" />
</a>
```

- [ ] **Step 3: Type check**

Run: `npx astro check`
Expected: `0 errors`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro src/components/Project.astro
git commit -m "feat(responsive): stack project cards on mobile"
```

---

### Task 6: Contact section

**Files:**
- Modify: `src/pages/index.astro:79-113`

- [ ] **Step 1: Replace the Contact block**

In [src/pages/index.astro](../../../src/pages/index.astro), replace lines 79-113:

```astro
<div class="flex w-full flex-col items-start justify-start gap-16 border-border py-36">
	{
		contacts
			.filter((c) => c.big)
			.map((contact) => (
				<a
					href={contact.link}
					class="group flex w-full items-center justify-between border-border pb-8"
				>
					<span class="font-ndot47 text-7xl leading-none tracking-wide">{contact.name}</span>
					<ArrowSvg class="h-8 w-12 shrink-0 fill-current transition-transform group-hover:translate-x-1" />
				</a>
			))
	}
	<ul class="grid w-full grid-cols-3">
		{
			contacts
				.filter((c) => !c.big)
				.map((contact, i) => (
					<li
						class:list={[
							"flex flex-col gap-3 border-l border-border px-8 first:border-0 first:pl-0 last:pr-0",
						]}
					>
						<span class="font-share text-sm tracking-wider text-muted uppercase">
							{contact.label}
						</span>
						<a href={contact.link} class="font-ndot47 text-3xl leading-none tracking-wide">
							{contact.name}
						</a>
					</li>
				))
		}
	</ul>
</div>
```

with:

```astro
<div class="flex w-full flex-col items-start justify-start gap-8 border-border py-20 md:gap-12 md:py-28 lg:gap-16 lg:py-36">
	{
		contacts
			.filter((c) => c.big)
			.map((contact) => (
				<a
					href={contact.link}
					class="group flex w-full items-center justify-between border-border pb-4 lg:pb-8"
				>
					<span class="font-ndot47 text-4xl leading-none tracking-wide md:text-5xl lg:text-7xl">{contact.name}</span>
					<ArrowSvg class="h-8 w-12 shrink-0 fill-current transition-transform group-hover:translate-x-1" />
				</a>
			))
	}
	<ul class="grid w-full grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-y-0">
		{
			contacts
				.filter((c) => !c.big)
				.map((contact, i) => (
					<li
						class:list={[
							"flex flex-col gap-3 border-0 px-0 sm:border-l sm:border-border sm:px-8 sm:first:border-0 sm:first:pl-0 sm:last:pr-0",
						]}
					>
						<span class="font-share text-sm tracking-wider text-muted uppercase">
							{contact.label}
						</span>
						<a href={contact.link} class="font-ndot47 text-3xl leading-none tracking-wide">
							{contact.name}
						</a>
					</li>
				))
		}
	</ul>
</div>
```

- [ ] **Step 2: Type check**

Run: `npx astro check`
Expected: `0 errors`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(responsive): scale contact links and stack small contacts on mobile"
```

---

### Task 7: Header nav safety tweak

**Files:**
- Modify: `src/components/Header.astro:13`

- [ ] **Step 1: Replace the nav `<ul>` opening tag**

Open [src/components/Header.astro](../../../src/components/Header.astro) line 13. Replace:

```astro
<ul class="flex gap-4 font-share text-lg text-muted">
```

with:

```astro
<ul class="flex gap-3 font-share text-lg text-muted sm:gap-4">
```

- [ ] **Step 2: Type check**

Run: `npx astro check`
Expected: `0 errors`.

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat(responsive): tighten header nav gap on narrow viewports"
```

---

### Task 8: Build + manual viewport audit

**Files:** none (verification only).

- [ ] **Step 1: Production build**

Run: `npm run build`
Expected: build completes with no errors. Note any warnings.

- [ ] **Step 2: Start dev server**

Run: `npm run dev`
Expected: server reachable at `http://localhost:4321`.

- [ ] **Step 3: Browser DevTools audit at five viewport widths**

In the browser, open DevTools → Responsive Design Mode. Test these widths in order:

| Width | Label | Expectation |
|---|---|---|
| 375px | iPhone SE | Avatar above logo; 2-col skills; stacked projects; arrow hidden; 1-col small contacts; footer stacked |
| 414px | Large mobile | Same shape as 375px |
| 768px | Tablet (md) | Padding widens to `px-12`; section padding `py-28`; About text `text-lg`; footer side-by-side; small contacts 3-col |
| 1024px | Desktop (lg) | Identical to current production: side-by-side hero, 4-col skills, horizontal project cards with arrow, large contact text, 12-col About grid |
| 1440px | Wide desktop | Identical to 1024px proportions, no overflow |

For each width, run through:
1. No horizontal scroll on `<body>` (DevTools → Computed → check `scrollWidth` vs `clientWidth`).
2. Hero, About, Skills, Projects, Contacts each render per the table above.
3. Theme toggle still works (click moon icon → palette flips).
4. Header nav fits without wrapping.

- [ ] **Step 4: Record findings**

If everything passes, write a one-line completion note. If anything fails, list the failures and stop here — fixes belong in a follow-up task, not this commit.

- [ ] **Step 5: Stop dev server**

Stop the `npm run dev` process.

---

## Completion criteria

- All 8 tasks committed on `responsive-mobile`.
- `npx astro check` → 0 errors.
- `npm run build` → succeeds.
- Manual audit at 5 viewports passes per Task 8 table.

Branch is then ready for merge or PR per `superpowers:finishing-a-development-branch`.
