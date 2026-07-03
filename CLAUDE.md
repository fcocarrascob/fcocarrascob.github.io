# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Dev server at http://localhost:4321
npm run build     # Static build to dist/
npm run preview   # Preview the production build locally
```

There are no tests. Verify changes by running `npm run build` (catches TypeScript and Zod schema errors) and inspecting `dist/` output. Requires Node >= 22.12.

Deployed as a static site to GitHub Pages at `site: https://fcocarrascob.github.io` (root, no base path). `npm run build` emits `dist/`.

## Stack

- **Astro 6** — static site generator (output: `static`)
- **MDX** via `@astrojs/mdx` — content format for posts
- **React 19** via `@astrojs/react` — only for client islands (the math canvas); content pages stay zero-JS
- **KaTeX** — LaTeX math rendering via `remark-math` + `rehype-katex`, configured through `markdown.processor: unified({...})` (Astro 6 API)
- **mathjs** — runtime expression + unit evaluation in the math canvas (not used for content)
- **astro-mermaid** + **mermaid** — `mermaid` code fences in MDX render to diagrams
- **Tailwind CSS v4** — configured via `@tailwindcss/vite` plugin (no `tailwind.config.js`), with `@tailwindcss/typography` for prose styling
- **Shiki** — code syntax highlighting (theme: `github-light`), built into Astro

## Astro 6 Specifics

Three non-obvious config constraints (all in `astro.config.mjs`):

1. **Content config location**: `src/content.config.ts` — placing it at `src/content/config.ts` causes a `LegacyContentConfigError`.
2. **Remark/rehype plugins**: Must be passed via `markdown.processor: unified({...})` importing `unified` from `@astrojs/markdown-remark`. Passing them directly in `markdown.remarkPlugins` or `mdx({ remarkPlugins })` produces deprecation warnings.
3. **Integration order**: `mermaid()` must come *before* `mdx()` in the `integrations` array so it can intercept ` ```mermaid ` fences before MDX processes them.

## Content Collections

Two collections are defined in `src/content.config.ts`, both using the Astro 6 `glob` loader:

- **`blog`** (`src/content/blog/`) — general notes. Frontmatter: `title`, `description`, `pubDate` required; `updatedDate`, `tags`, `draft`, `norm` (referenced standard), `section` (topic grouping) optional.
- **`hormigon`** (`src/content/hormigon/`) — reinforced-concrete (ACI 318-25) chapter notes. Same base fields, but **`subsection` is required** (keys live in `src/lib/hormigon.ts` → `SUBSECTIONS`, currently only `aci318-25`) and `chapter` is optional. There is no `section`/`tags` grouping here; `subsection` drives routing.

Posts with `draft: true` are excluded from all listings and routes.

Each collection has its own query wrapper — **import from these, don't call `getCollection` directly in pages**:

- `src/lib/posts.ts` → `getAllPosts()`, `getPostsByTag()`, `getPostsBySection()` (blog)
- `src/lib/hormigon.ts` → `getAllHormigonPosts()`, `getHormigonPostsBySubsection()`, plus the `SUBSECTIONS` map and `SubsectionKey` type (hormigon)

Both wrappers filter drafts and sort by `pubDate` descending.

## Math Syntax (content)

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

## Math Canvas Tool

The largest piece of non-content code: a SMath-style interactive worksheet at `/herramientas/canvas`. The page (`src/pages/herramientas/canvas.astro`) mounts the React island with `client:only="react"`. It is the only stateful, client-side feature in the site.

**UI layer** (`src/components/canvas/`, React):
- `MathCanvas.tsx` — top-level: holds the `Region[]` state, autosaves to `localStorage` (key `structpad.worksheet.v1`, 300 ms debounce), handles click-to-create / drag / multi-select / delete, JSON import/export, and the templates dropdown. Empty regions are transient (dropped on blur, never persisted).
- `MathRegion.tsx` — one draggable region; renders KaTeX output or the editing input, and paints the ✓/✗ verdict for boolean results. Exports `GRID` and `snap()`.
- `SymbolPalette.tsx` — right-hand palette of insertable symbols/snippets; snippet support includes placeholder selection and multiline re-indentation.

**Engine layer** (`src/lib/`, pure, no React — keep it that way so it stays testable/portable):
- `worksheet.ts` — `evaluateSheet(regions)` is the core. Evaluates every non-text region against a **single shared mathjs scope in reading order (y, then x)**, so variables defined higher/left are visible lower/right (SMath semantics). Region `src` grammar: `name := expr` defines, a trailing `=` shows the result, `= unit` converts with dimensional checking. Also handles LaTeX generation (greek letters, subscripts, scientific notation). Registers the local unit `tonf` (= 1000 kgf, alias `tf`).
- `program.ts` — a minimal **imperative interpreter** for `program`-kind regions, because mathjs has no control flow. Parses Python-style **indentation-defined blocks** (`if`/`else if`/`else`, `for … in range/list`, `while`, `break`/`continue`, `return`) into statements and runs them, delegating each expression/condition back to mathjs via `ProgramContext.evaluate`. A header `name :=` exports the return value as a variable; `name(args) :=` defines a callable function (a closure capturing the live scope, allowing recursion). Guarded by `MAX_ITERS` (100k) against infinite loops.
- `worksheet-templates.ts` — the built-in template gallery (e.g. ACI 318-25 beam design). Templates use the same `{version, regions}` shape as export/import; `layout()` stacks items in a single column so the reading-order scope resolves predictably.

Three region kinds: `math`, `text`, `program`. When adding engine features, prefer extending the pure lib modules and keep React components thin.

## SAP2000 Script Builder

A family of config→script generators at `/herramientas/sap-scripts/`. Each sub-tool is a form mirroring a `*Config` dataclass from the [Skills_SAP](https://github.com/fcocarrascob/Skills_SAP) repo (`Config` dataclass + `Backend.run(config)` + `gui_*.py` — a pattern repeated across most of `Skills_SAP/scripts/`), and produces a single self-contained `.py` file the user downloads and runs locally with `comtypes` against an open SAP2000 instance. **No SAP2000 logic is reimplemented in TypeScript** — the generator only templates a short runner footer (`BaseModelConfig(...)` + `.run()`) around a vendored copy of the real Python backend, so the generated script behaves identically to the desktop GUI it mirrors.

**Vendoring**: `Skills_SAP` is a public repo, added as a git submodule at `vendor/skills-sap` (pinned commit — update deliberately with `git submodule update --remote vendor/skills-sap`). Vite/Astro can't reliably import from outside `src/` (and GitHub Actions doesn't check out submodules by default), so `scripts/sync-sap-scripts.mjs` (`npm run sync:sap-scripts`) copies the specific files each sub-tool needs into `src/lib/sap-scripts/vendor/<tool>/`, prefixed with a header noting the source commit. **Never edit files under `src/lib/sap-scripts/vendor/` by hand** — edit `Skills_SAP`, then re-run the sync script. After updating the submodule, always re-run `npm run sync:sap-scripts` and commit both the submodule bump and the resulting vendor changes together.

**Per sub-tool** (see `modelo-base` for the reference implementation):
- `src/lib/sap-scripts/<tool>-template.ts` — imports the vendored `.py` file(s) via Vite's `?raw`, strips their `from config import (...)` and `if __name__ == "__main__":` boilerplate, and reassembles them with a generated footer that instantiates the config dataclass from the form values (`generate<Tool>Script(values)`). Also exports a `validate<Tool>FormValues(values)` for range checks.
- `src/components/sap-scripts/<Tool>Builder.tsx` — the form + live preview (e.g. an SVG chart for the NCh2369 spectrum, computed with a pure TS port of the formula in `src/lib/sap-scripts/nch2369-spectrum.ts` — this port is for instant browser feedback only; the vendored Python is still what actually runs against SAP2000) + copy/download buttons for the generated script.
- `src/pages/herramientas/sap-scripts/<tool>.astro` — thin page, `client:only="react"`.
- `src/lib/sap-scripts/catalog.ts` — the `SAP_SCRIPT_TOOLS` list rendered by `src/pages/herramientas/sap-scripts/index.astro`; add an entry here (status `'planned'` is fine before the tool exists) to list a new sub-tool in the catalog.

## Layouts

The layouts form a chain: `BaseLayout` (HTML shell, external CSS) → `PageLayout` / `BlogPost` (add `Header` + `Footer`). `BlogPost` renders the post header (title, date, tags, norm) above the prose slot and is used by both `blog/[slug].astro` and `hormigon/[slug].astro`.

## Scaling to New Sections

To add a content section (e.g., a new standard):
1. Add a collection in `src/content.config.ts` with its own Zod schema.
2. Add a query-wrapper module in `src/lib/` (mirror `posts.ts` / `hormigon.ts`).
3. Create `src/pages/<section>/index.astro` and `[slug].astro`.
4. Add the nav link in `src/components/ui/Header.astro` (`navLinks` array).

For new interactive tools, follow the canvas pattern: a thin `.astro` page under `src/pages/herramientas/` mounting a React island with `client:only="react"`, with logic split into pure `src/lib/` modules.

## Styles

Tailwind v4 custom tokens are defined in `src/styles/global.css` under `@theme {}`: colors (`ink`, `muted`, `accent`, `surface`, `border`) and font families (`sans`, `mono`). The `prose` class from `@tailwindcss/typography` styles MDX content in `BlogPost.astro`.
