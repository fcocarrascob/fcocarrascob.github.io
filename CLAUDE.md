# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Idioma — español neutro, siempre

**Todo el español que se escriba aquí es español neutro: el de segunda persona `tú`, sin voseo y sin regionalismos.** Aplica a todo —posts y contenido MDX, textos de UI, mensajes de error, comentarios de código, mensajes de commit, y las respuestas al usuario en el chat— e igual a agentes y subagentes.

En concreto:

- **`tú`, nunca `vos`**: «si no puedes abrir el PDF», no «si no podés»; «ten en cuenta», no «tené en cuenta». Los imperativos son `usa`, `revisa`, `escribe`, `mira`, `abre`.
- **Nada de `vosotros`** tampoco: el plural es `ustedes`.
- **Sin regionalismos** de ningún país, incluido Chile: nada de «al tiro», «cachai», «harto», «pololear», «ojo que». Si una palabra delata de dónde es quien escribe, se cambia por la neutra.
- **Vocabulario técnico estándar**: `computadora`/`equipo`, `archivo`, `enlace`, `pantalla`. Los términos de ingeniería y los nombres de norma se dejan como los usa la norma (`viga`, `losa`, `zapata`, `alma`, `ala`, `pandeo lateral-torsional`).

Por qué: el sitio se lee desde toda Latinoamérica y España, y el voseo lo marca como material de un solo país. El neutro no es más frío —la voz sigue siendo directa y en primera persona del plural cuando corresponde—, solo deja de excluir.

Si un texto ya publicado tiene voseo o un regionalismo, se corrige en el mismo commit en que se lo toca.

## Fuentes normativas — regla no negociable

**Toda ecuación, coeficiente o valor de tabla que se cite —en un post, en una planilla del canvas o en el código de un motor— se lee del PDF de la norma antes de escribirse. Nunca de memoria, y nunca solo de las fichas de `material_teorico`.**

Aplica igual a agentes y subagentes. Si no puedes abrir el PDF, no escribas el número: dilo.

### Las ediciones vigentes, y las únicas que se citan

| Norma | Edición | PDF |
|---|---|---|
| AISC 360 | **360-22** | `F:\OneDrive\Ingenieria\Normas\A360-22W-ewr.pdf` |
| AISC 341 | **341-22** | `F:\OneDrive\Ingenieria\Normas\A341-22W-oke.pdf` |
| ACI 318 | **318-25 (SI)** | `F:\OneDrive\Ingenieria\Normas\ACI 318-25_SI.pdf` |
| NCh2369 | **2025, 3.ª ed.** | `F:\OneDrive\Ingenieria\Normas\NCh 2369 - 3°Edición 2025.05.28.pdf` |

Citar una edición distinta es un hallazgo, no una variante: AISC 360-10 y ACI 318-19 están en disco y sirven para explicar de dónde viene algo, nunca como fuente de un número nuevo.

### Cómo se lee el PDF (importa, y es contraintuitivo)

Los PDF tienen capa de texto, pero **la capa de texto NO sirve para leer una ecuación**: destruye la disposición del cociente y de los subíndices —una fracción sale como una columna de símbolos sueltos— y **convierte φ en `f`** (en el Cap. H de 360-22, `φcPn` se extrae como `fcPn`). Quien reconstruya una fórmula desde ese texto está completando de memoria justo lo que la regla quiere evitar.

Entonces, dos usos distintos:

- **Texto extraído** (PyMuPDF, `page.get_text()`): para *ubicar* la sección, listar qué ecuaciones existen en un capítulo y leer prosa, definiciones y User Notes.
- **Página rasterizada** (PyMuPDF `page.get_pixmap()` a PNG, y **mirarla**): para transcribir la ecuación. `pdftoppm` no está instalado, así que la ruta es PyMuPDF.

### Las fichas de `material_teorico` son un mapa, no una fuente

`F:\Proyectos_Python\material_teorico\referencias\` sirve para ubicar rápido la sección y entender el contexto. No está auditado: ya hubo al menos una ficha con una ecuación mal transcrita que varios posts citaban como fuente. Si la ficha y el PDF discrepan, **manda el PDF** y la ficha se corrige en el mismo commit.

### Por qué la regla es tan dura

El error típico no es aritmético, es de transcripción, y por eso ninguna revisión de resultados lo encuentra. El caso testigo: las Ecs. F7-2 y F7-6 vivieron en el motor con los coeficientes tabulados de **360-10** (`3,57·λ·√(F_y/E) − 4,0`) donde la 22 escribe la interpolación entre λ_p y λ_r. Son la misma recta redondeada: coinciden al **0,04 %**, la aritmética cerraba consigo misma, y sobrevivió a la auditoría de varios posts. Solo apareció al confrontar dos implementaciones. Después reapareció intacta en `memoria.ts`, que nadie había mirado.

### El libro mayor: `ECUACIONES.md`

Toda ecuación implementada en un motor tiene su fila: de qué norma y edición sale, dónde vive en el código, con qué se ancla y cuándo se leyó en el PDF.

```bash
npm run indice:normas        # regenera data/normas-indice.json (qué ecuaciones EXISTEN)
npm run verify:ecuaciones    # falla si el código cita una que no existe en la edición vigente
npm run ecuaciones           # además regenera ECUACIONES.md
```

El reparto de trabajo importa: **que el número exista es mecánico y lo decide el script** —no admite falso positivo, y es lo que habría cazado el `F7-12/F7-13` el día que se escribió—. Que la **forma algebraica** sea la de la edición vigente y que el coeficiente venga de la tabla correcta **no lo decide ningún script**: pide abrir la página rasterizada, y se registra a mano en la columna «Revisada», que el generador preserva y nunca pisa.

El índice se construye desde las extracciones de `material_teorico/_procesamiento/raw/normas`, que **sí sirven** para inventariar (a diferencia de `page.get_text()`, conservan la fracción y el φ). Su inventario está contrastado contra el PDF: para AISC 360-22 coincide exacto en los ocho capítulos ingeridos.

### Al citar

Siempre **número de ecuación + edición**, y la cita se verifica igual que el número: el `F7-12/F7-13` que arrastraba `memoria.ts` era la numeración de 360-16, que la 22 corrió al insertar las secciones cajón.

Gotchas ya registrados en el repo, que valen como recordatorio de qué tipo de cosa buscar:

- **Renumeración de F7 entre 360-16 y 360-22** (el ancho efectivo del ala de HSS es F7-4, el alma no compacta F7-6, el LTB va de F7-8 a F7-11).
- **B4.1a ≠ B4.1b**: son dos tablas y dicen cosas distintas; un alma puede ser esbelta a compresión y compacta a flexión.
- **`b = B − 3t` es texto de §B4.1b(d)**, no una nota al pie de la Tabla B4.1b.
- **La Ec. (19.2.3.1) está impresa con errata en la edición SI de ACI 318-25** (0,062 en vez de 0,62).
- **ACI 318-19 removió el DDM y el marco equivalente**, y renumeró γ_f, γ_v y J_c.

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

### `tema` — the filter axis for ejemplos

`hormigon`, `acero` and `geotecnia` all take an optional `tema`: the family of element or problem (`Vigas`, `Conexiones`, `Losas`, `Zapatas`, …). **Every new ejemplo de cálculo must declare one**, reusing an existing value where it fits — that's what keeps the chip row short as the section grows. A post without `tema` falls into an `Otros` chip.

It is deliberately coarser than `chapter`, which is nearly 1:1 with the post and would give one chip per example. The vocabulary is not declared in any central list: `contarTemas()` (`src/lib/temas.ts`) derives the chips from what's published, so a new tema appears with the first post that declares it.

The chip row itself is `src/components/ui/TemaFilter.astro`, shared by `/blog` (filtering on `section`, grouped listing) and the three `/*/ejemplos` pages (filtering on `tema`, flat listing). It's progressive enhancement — the full list renders at build time and the script only hides cards. A page mounting it must provide: `data-tema` on each card (PostCard forwards arbitrary `data-*`), `data-list` on the list container, `data-count` on the results counter, and `data-group` on each group wrapper if the listing is grouped.

Each collection has its own query wrapper — **import from these, don't call `getCollection` directly in pages**:

- `src/lib/posts.ts` → `getAllPosts()`, `getPostsByTag()`, `getPostsBySection()` (blog)
- `src/lib/hormigon.ts` → `getAllHormigonPosts()`, `getHormigonPostsBySubsection()`, plus the `SUBSECTIONS` map and `SubsectionKey` type (hormigon)

Both wrappers filter drafts and sort by `pubDate` descending.

### `ejemplos/` — memos de cálculo, fuera del sitio

`ejemplos/` en la raíz **no es una colección y no llega al build**: ningún glob de
`src/content.config.ts` la alcanza. Son memos de cálculo compactos —`.md` plano, techo de 150
líneas y ~100 palabras de prosa por paso, sin componentes ni figuras ni planilla— y su fin es
**consolidar la aplicación de la normativa chilena al diseño y análisis de elementos**, un caso a
la vez.

Dos reglas que definen la carpeta, y que son fáciles de romper sin querer:

- **Independientes del blog.** No son borradores de posts ni su versión comprimida. Un memo **se
  sostiene solo**: toda cláusula que usa se lee del PDF de la edición vigente y se registra en su
  propia tabla de referencias. Ninguna fila puede decir «heredada del post», aunque el número
  también viva en un post auditado. Heredar de **otro memo** sí se permite, declarándolo en los
  supuestos.
- **No repetir.** Cada cláusula se ejemplifica una vez y cada elemento se diseña una vez. Antes de
  escribir un memo se lee `ejemplos/INDICE.md`; si el estado límite, la cláusula o el elemento ya
  están, el caso nuevo es un paso más en el memo que existe, no un memo nuevo. Lo mismo con las
  estructuras: un solo pórtico arriostrado, una sola base de columna.

El contrato del formato está en **`ejemplos/README.md`**: léelo antes de escribir uno. Lo esencial:
pasos numerados con la ecuación y su reemplazo numérico, prosa mínima, supuestos numerados `S1, S2…`
citables desde los pasos, y una tabla de referencias donde **cada cláusula declara si se leyó en el
PDF**. Un memo con referencias pendientes no se promueve a post. La plantilla en blanco es
`ejemplos/_PLANTILLA.md` y lo acumulado se lista en `ejemplos/INDICE.md`.

La sección `## Para promover a post` de cada memo se mantiene, pero es una **salida opcional, no el
propósito**: un cálculo que cierra sin sorpresas es un memo terminado. Se promueve cuando el caso
tiene una tesis que enseñe algo; promoverlo significa reescribirlo al formato publicado, **no cambia
los ejemplos ya publicados**, y el memo sigue siendo autónomo (no pasa a citar al post que salió
de él).

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
- `WorksheetPrint.tsx` — the print document: a portal in `<body>` that reflows the regions into a *linear* document (reading order), hidden on screen and shown only under `@media print`. It is **not** the canvas layout, so there is no geometric correspondence between a region's position on the sheet and its position on paper.
- `usePaginacion.ts` — measures that print document (off-screen, at the A4 content width) and reports which page each region lands on. Feeds the «página N» rules the canvas draws across the sheet.

**Engine layer** (`src/lib/`, pure, no React — keep it that way so it stays testable/portable):
- `worksheet.ts` — `evaluateSheet(regions)` is the core. Evaluates every non-text region against a **single shared mathjs scope in reading order (y, then x)**, so variables defined higher/left are visible lower/right (SMath semantics). Region `src` grammar: `name := expr` defines, a trailing `=` shows the result, `= unit` converts with dimensional checking. Also handles LaTeX generation (greek letters, subscripts, scientific notation). Registers the local unit `tonf` (= 1000 kgf, alias `tf`).
- `program.ts` — a minimal **imperative interpreter** for `program`-kind regions, because mathjs has no control flow. Parses Python-style **indentation-defined blocks** (`if`/`else if`/`else`, `for … in range/list`, `while`, `break`/`continue`, `return`) into statements and runs them, delegating each expression/condition back to mathjs via `ProgramContext.evaluate`. A header `name :=` exports the return value as a variable; `name(args) :=` defines a callable function (a closure capturing the live scope, allowing recursion). Guarded by `MAX_ITERS` (100k) against infinite loops.
- `worksheet-templates.ts` — the built-in template gallery (e.g. ACI 318-25 beam design). Templates use the same `{version, regions}` shape as export/import; `layout()` stacks items in a single column so the reading-order scope resolves predictably.
- `paginacion.ts` — the A4 page-break model: takes measured block heights and returns the page split, replicating what the browser does with unbreakable blocks (greedy fill, collapsed margins, margins truncated at unforced breaks only). `Region.pageBreak` forces a break. Verified against real PDFs with `npm run pdf:planilla` — do not "simplify" the margin rules or `A4_ALTO_UTIL_PX` without re-running it.

Three region kinds: `math`, `text`, `program`. When adding engine features, prefer extending the pure lib modules and keep React components thin.

The print styles live in `global.css` **outside** `@media print` (the media query only decides visibility) — `usePaginacion` has to measure that document on screen, and rules inside a print-only query would not apply there.

## Retired: the SAP2000 tools (2026-08-05)

`/herramientas/sap-scripts` (a config→script generator that vendored the Python backend of
[Skills_SAP](https://github.com/fcocarrascob/Skills_SAP)) and `/herramientas/mcp-sap2000` (docs for
the MCP server of that same repo) **were removed**, along with the `vendor/skills-sap` submodule and
`npm run sync:sap-scripts`. That work belongs to its own repo; the site was hosting its front end
and paying the sync cost. The trigger: the vendored `_r_star()` was missing the `R = 1 → R* = 1`
branch of NCh2369 Eq. (1b), and the repo's own rule sent that fix upstream to `Skills_SAP` — tying
a normative correction on this site to an external repo.

**What survived**: `src/lib/nch2369-spectrum.ts` (moved out of `src/lib/sap-scripts/`, and the
missing branch fixed there). It is plain site code now, and its only consumer is
`scripts/render-espectro-nch2369.mjs` (`npm run figuras:espectro`), which draws the two figures of
`/apuntes/nch2369-espectro-de-diseno`. **Do not reintroduce a dependency on `Skills_SAP` from this
repo** — link to it instead, the way `blog/mcp-sap2000-como-esta-armado.mdx` does.

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
