# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Dev server at http://localhost:4321
npm run build     # Static build to dist/
npm run preview   # Preview the production build locally
```

There are no tests. Verify changes by running `npm run build` (catches TypeScript and Zod schema errors) and inspecting `dist/` output.

## Stack

- **Astro 6** — static site generator (output: `static`)
- **MDX** via `@astrojs/mdx` — content format for blog posts
- **KaTeX** — LaTeX math rendering via `remark-math` + `rehype-katex`, configured through `markdown.processor: unified({...})` (Astro 6 API)
- **Tailwind CSS v4** — configured via `@tailwindcss/vite` plugin (no `tailwind.config.js`), with `@tailwindcss/typography` for prose styling
- **Shiki** — code syntax highlighting (theme: `github-light`), built into Astro

## Astro 6 Specifics

Two non-obvious Astro 6 constraints:

1. **Content config location**: `src/content.config.ts` — placing it at `src/content/config.ts` causes a `LegacyContentConfigError`.
2. **Remark/rehype plugins**: Must be passed via `markdown.processor: unified({...})` importing `unified` from `@astrojs/markdown-remark`. Passing them directly in `markdown.remarkPlugins` or `mdx({ remarkPlugins })` produces deprecation warnings.

## Adding Content

Create `.mdx` files in `src/content/blog/`. Required frontmatter fields:

```yaml
---
title: ""
description: ""
pubDate: YYYY-MM-DD
tags: []
# Optional:
norm: "EN 1992-1-1"     # Referenced standard
section: "Hormigón Armado"  # Topic grouping
draft: false
updatedDate: YYYY-MM-DD
---
```

Posts with `draft: true` are excluded from all listings and routes.

## Math Syntax

KaTeX renders at build time — the HTML ships pre-rendered, no client JS needed (only KaTeX CSS).

- **Inline**: `$E = mc^2$`
- **Display**: `$$...$$` block
- **Numbered display equation** (use the `Equation` component):

```mdx
import Equation from '../../components/content/Equation.astro';

<Equation label="Ec. 6.10">
$$\sum_j \gamma_{G,j} \cdot G_{k,j} + \gamma_{Q,1} \cdot Q_{k,1}$$
</Equation>
```

## Content Components

Three MDX-usable components in `src/components/content/`:

- `Equation` — display equation with optional right-aligned label (`label` prop)
- `Figure` — captioned image (`src`, `alt`, `caption`, `width` props)
- `Note` — callout box with `type` prop: `"info"` (blue), `"warning"` (amber), `"tip"` (green); optional `title` prop

## Architecture

`src/lib/posts.ts` exports `getAllPosts()`, `getPostsByTag()`, `getPostsBySection()` — thin wrappers over Astro's `getCollection('blog')` with draft filtering and date sorting. Pages import from here rather than calling `getCollection` directly.

The three layouts form a chain: `BaseLayout` (HTML shell, external CSS) → `PageLayout` / `BlogPost` (add `Header` + `Footer`). `BlogPost` renders the post header (title, date, tags, norm) above the prose slot.

## Scaling to New Sections

To add a section (e.g., calculation templates):
1. Add a new collection in `src/content.config.ts` with its own Zod schema
2. Create `src/pages/<section>/index.astro` and `[slug].astro`
3. Add the nav link in `src/components/ui/Header.astro`

For interactive tools (React/Svelte islands), add `@astrojs/react` or similar integration and use `client:load` or `client:only="react"` on the component.

## Styles

Tailwind v4 custom tokens are defined in `src/styles/global.css` under `@theme {}`: colors (`ink`, `muted`, `accent`, `surface`, `border`) and font families (`sans`, `mono`). The `prose` class from `@tailwindcss/typography` styles MDX content in `BlogPost.astro`.
