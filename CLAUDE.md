# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # dev server at localhost:4321 (--host flag included)
npm run build        # production build to ./dist/
npm run preview      # preview production build
npm run bp           # build + preview in one step
npm run format       # prettier (Astro + Tailwind class sorting) + biome check --write
npm run biome:check  # biome format + lint --write
astro check          # TypeScript + Astro type checking
```

No test suite is configured.

## Architecture

**Stack:** Astro 7 · Tailwind CSS v4 · TypeScript (strict) · GSAP

Tailwind v4 is integrated via the `@tailwindcss/vite` plugin (not PostCSS). The `@theme inline` block in [src/styles/global.css](src/styles/global.css) maps CSS custom properties to Tailwind utilities, so color tokens like `--coral` become `bg-coral`, `text-coral`, etc.

### Theming

Dark mode is toggled via a `data-theme="dark"` attribute on a parent element. The token cascade:

- [src/styles/global.css](src/styles/global.css) — light defaults on `:root`, `@theme inline` Tailwind mappings, `@custom-variant dark` pointing at `[data-theme="dark"]`
- [src/styles/dark.css](src/styles/dark.css) — overrides all tokens under `[data-theme="dark"]`
- [src/styles/light.css](src/styles/light.css) — reserved for explicit light overrides

Color palette: `--bg`, `--bg2`, `--text`, `--muted`, `--border`, `--coral`, `--mint`, `--yellow`, `--lavender`, `--orange`, and `*-pale` variants for each accent.

### Pages & Routing

File-based routing from `src/pages/`. Currently:

- `index.astro` — homepage
- `rss.xml.js` — RSS feed

### Layout

[src/layouts/Layout.astro](src/layouts/Layout.astro) is the single base shell. It accepts `title`, `description`, `showHeader` (default `true`), and `showFooter` (default `true`). It sets `bg-bg` on `<body>` and includes `<ClientRouter>` for view transitions.

### Content Collections

Defined in [src/content.config.ts](src/content.config.ts) using Astro's glob loader (Astro 5+ API). The `blog` collection lives in `src/content/blog/` and expects frontmatter: `title`, `description`, `pubDate`, `updatedDate?`, `heroImage?`.

### Fonts

Atkinson Hyperlegible is served locally from `src/assets/fonts/` and registered in `astro.config.mjs` via Astro's built-in font system. The CSS variable is `--font-atkinson`.

### Formatters

Biome handles JS/TS/JSON/Astro (tabs, 100-char lines, double quotes, LF). Prettier handles Astro files with Tailwind class sorting. Both run on save via VSCode settings. `npm run format` runs both together.

Astro v7 uses Vite 8 and the Rust compiler by default. `compressHTML: true` is set explicitly to preserve v6 whitespace behavior (v7 default changed to `'jsx'`). Markdown is now processed by Sätteri (no custom remark/rehype plugins in use).
