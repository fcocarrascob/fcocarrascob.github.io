---
description: "Use when creating or editing documentation pages in docs/, modifying mkdocs.yml, or adding new sections/standards to the wiki. Covers frontmatter schema, Spanish-language conventions, heading structure, math notation, table style, and MkDocs/Material configuration rules."
applyTo: "**"
---

# Ingeniería Estructural Wiki — Content & Configuration Guidelines

## Language

All documentation content is written in **Spanish**. This includes:
- Page titles, section headings, and body text
- Admonition labels (`> **Nota:**`, `> **Advertencia:**`)
- Navigation labels in `mkdocs.yml`

Code, variable names, and technical identifiers (e.g., `As_min`, `wc`) remain in English or follow the originating standard's notation.

---

## Frontmatter Schema

Every page in `docs/` must include YAML frontmatter. Use the full schema for standard-reference pages:

```yaml
---
title: "STANDARD — Chapter N: Topic in Spanish"
type: formula                          # formula | reference | tool | guide
standard_ref: "ACI-318-25"            # Originating standard identifier
chapter: "7"                           # Chapter number as string
section: "7.3–7.7"                    # Section range covered
variables: [h, fy, As_min, Mu, phi]   # Key variables used in the page
units: "SI"                            # SI or USC
tags: [losa, unidireccional, ...]      # Spanish + English terms, lowercase
related:
  - ../standards/StandardFile.md
  - RelatedChapter.md
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

Minimal frontmatter for non-standard pages (index, guides):
```yaml
---
title: "Page Title"
---
```

---

## File & Folder Naming

| Content type | Pattern | Example |
|---|---|---|
| ACI/code chapter | `ACI-318-Ch{N}-{TopicName}.md` | `ACI-318-Ch9-Beams.md` |
| National standard | `{Standard}{Year}.md` | `NCh2369.md` |
| Section index | `index.md` inside topic folder | `hormigon/index.md` |

Folder names are **Spanish topic words** in lowercase (e.g., `hormigon/`, `sismo/`, `herramientas/`). File names use **English topic words** in PascalCase after the standard prefix.

---

## Heading Structure

```markdown
# Standard Cap. N — Topic in Spanish          ← H1: page title (one per page)

## Fuente                                       ← always second heading
Standard name, pages covered.

## 1. Topic Name (§clause)                     ← numbered H2 with §reference
### 1.1 Subtopic                               ← numbered H3
```

- Reference ACI/NCh paragraph numbers with `§` (e.g., `§7.3.1.1`).
- Use `---` horizontal rules between major H2 sections.
- Never skip heading levels.

---

## Math Notation

This site uses **MathJax 3** via `pymdownx.arithmatex` (generic mode).

| Usage | Syntax | Example |
|---|---|---|
| Inline variable or expression | `$...$` | `$f_y = 420$ MPa` |
| Standalone equation | `$$...$$` on its own line | `$$A_s = \frac{M_u}{\phi f_y (d - a/2)}$$` |
| Multi-line or aligned | `$$\begin{aligned}...\\end{aligned}$$` | aligned derivations |

- Always use LaTeX math for any formula, even simple ones — never write equations in plain text.
- Use `\!` for negative spacing around `\max`, `\min` to compact arguments: `\max\!\left(...\right)`.
- Subscripts use underscores (`A_s`, `w_c`), superscripts use `^`.

---

## Tables

Use standard Markdown pipe tables. Align numeric columns right, text columns left:

```markdown
| Condición de apoyo         | Espesor mínimo $h$ |
|----------------------------|--------------------|
| Simplemente apoyado        | $\ell / 20$        |
| Voladizo (cantilever)      | $\ell / 10$        |
```

- Column headers in **Spanish**.
- Embed inline math inside cells where needed.
- Add footnotes below tables using `¹` and `> ¹ explanation text`.

---

## Notes & Admonitions

For simple notes, use blockquote style:
```markdown
> **Nota:** Las losas nervadas se diseñan por Capítulo 9 (§9.8).
```

For richer callouts, use Material admonitions:
```markdown
!!! warning "Advertencia"
    Verificar que la sección sea tension-controlled.
```

---

## MkDocs Configuration Rules

### Adding a new page
1. Create the file in the correct `docs/` subfolder.
2. Register it in `mkdocs.yml` under the appropriate `nav` entry using a **Spanish label**.
3. Match the folder hierarchy in `nav` exactly.

### Adding a new section
1. Create a folder in `docs/` (Spanish lowercase name).
2. Add an `index.md` inside it.
3. Add a top-level nav entry with a Spanish section name.

### Extensions
- Do **not** remove or change any existing `markdown_extensions` entry.
- New pymdownx extensions must be tested locally with `mkdocs serve` before committing.
- Math requires **both** `pymdownx.arithmatex: generic: true` **and** the MathJax JS entries in `extra_javascript` — never remove either.

### Jupyter Notebooks
- Notebooks go in the relevant topic folder inside `docs/`.
- `mkdocs-jupyter` is configured with `execute: false` — notebooks must be pre-executed and saved with outputs before committing.
- Add to `nav` like any other page.

### Interactive Plots
- Plotly is loaded globally via CDN in `extra_javascript`. Use `plotly.js` in Jupyter notebooks or inline HTML blocks — no additional configuration needed.

---

## Cross-References

Use relative Markdown links:
```markdown
[Cap. 21 — Factores φ](ACI-318-Ch21-PhiFactors.md)
[Losas Unidireccionales](../hormigon/ACI-318-Ch7-OneWaySlabs.md)
```

List related pages in frontmatter `related:` **and** link inline where first mentioned.
