# Engineering Wiki Site — GitHub Pages

**Branch:** `feature/engineering-wiki-site`
**Description:** Convertir el repositorio fcocarrascob.github.io en un sitio web de ingeniería estructural atractivo y funcional, publicando la wiki y guías del repositorio Notebooks.

## Goal

Crear un sitio estático con GitHub Pages que presente teoría e información de ingeniería estructural de forma clara y atractiva. El sitio se alimentará del contenido existente en el repositorio Notebooks (normas ACI 318-25, API 650, NCh 2369, guías de herramientas) y crecerá como referencia técnica profesional.

---

## Stack Recomendado: MkDocs + Material Theme

| Criterio | Justificación |
|---|---|
| **Markdown nativo** | Todo el contenido del wiki ya está en `.md` |
| **Soporte LaTeX** | MathJax/KaTeX integrado para fórmulas de ingeniería |
| **Diseño atractivo** | Material Design moderno, sin configuración extra |
| **Búsqueda integrada** | Búsqueda full-text en el sitio sin servidor |
| **GitHub Actions** | Deploy automático a GitHub Pages con `mkdocs gh-deploy` |
| **Bajo costo de mantenimiento** | Solo hay que escribir markdown |

> **[NEEDS CLARIFICATION]** ¿Quieres usar MkDocs Material (recomendado) o prefieres otra opción como Jekyll, Quarto, o HTML puro?

---

## Estructura Propuesta del Sitio

```
fcocarrascob.github.io/
├── docs/                         # Contenido del sitio (Markdown)
│   ├── index.md                  # Home page
│   ├── hormigon/
│   │   ├── index.md              # Intro a la sección Hormigón
│   │   ├── ACI_318-25_indice.md  # Índice del ACI 318-25 SI
│   │   └── losa_camiones.md      # Diseño losa para camiones mineros
│   ├── estanques/
│   │   └── index.md              # API 650 (stub inicial)
│   ├── sismo/
│   │   └── index.md              # NCh 2369 (stub inicial)
│   └── herramientas/
│       ├── forallpeople.md       # Guía forallpeople
│       └── handcalcs.md          # Guía handcalcs
├── mkdocs.yml                    # Configuración principal del sitio
├── .github/workflows/deploy.yml  # CI/CD — deploy automático a gh-pages
├── index.html                    # (mantener o redirigir)
└── requirements.txt              # mkdocs-material + plugins
```

---

## Implementation Steps

### Step 1: Fundación — MkDocs Material + CI/CD

**Files:**
- `mkdocs.yml` — Configuración: nombre, tema Material, paleta de colores, plugins (search, math)
- `requirements.txt` — `mkdocs-material`, `mkdocs-git-revision-date-localized`
- `.github/workflows/deploy.yml` — GitHub Action para publicar en rama `gh-pages` en cada push a `main`
- `docs/index.md` — Home page básica con introducción al sitio

**What:** Configurar el motor del sitio. Al finalizar este paso, el sitio ya estará publicado en `fcocarrascob.github.io` con una home page funcional, búsqueda y soporte de fórmulas LaTeX. El deploy será automático desde entonces.

**Testing:** Correr `mkdocs serve` localmente → verificar que carga el sitio. Hacer push a `main` → verificar que GitHub Action deploya correctamente.

---

### Step 2: Home Page Atractiva + Navegación

**Files:**
- `docs/index.md` — Página de inicio con: introducción personal/profesional, descripción de las secciones, cards de navegación
- `docs/overrides/` — (opcional) CSS personalizado para ajustar colores institucionales o tipografía
- `mkdocs.yml` — Definir `nav:` completo con todas las secciones

**What:** Crear una landing page atractiva que presente el sitio y guíe al visitante hacia las secciones de contenido. Usar los features de Material: `navigation.tabs`, `navigation.top`, cards de hero con enlaces a secciones.

**Testing:** `mkdocs serve` → verificar navegación completa, links funcionales, responsive en móvil.

---

### Step 3: Sección Hormigón — Contenido desde Notebooks

**Files:**
- `docs/hormigon/index.md` — Introducción a la sección
- `docs/hormigon/ACI_318-25_indice.md` — Migrado desde `Notebooks/docs/Hormigon/ACI_318-25_SI_indice.md`
- `docs/hormigon/losa_camiones.md` — Migrado desde `Notebooks/docs/Hormigon/losa_camiones_mineros.md`

**What:** Migrar y adaptar el contenido existente al formato del sitio. Verificar que las fórmulas LaTeX renderizen correctamente (punzonamiento con $\lambda_s$, etc.). Añadir navegación breadcrumb y enlaces entre páginas.

**Testing:** Verificar que todas las fórmulas matemáticas renderizan en el sitio. Revisar que la navegación entre páginas funciona correctamente.

> **[NEEDS CLARIFICATION]** ¿Quieres que el ACI 318-25 se presente como un único índice largo, o prefieres dividirlo en sub-páginas por parte/capítulo?

---

### Step 4: Sección Herramientas Python

**Files:**
- `docs/herramientas/index.md` — Introducción: Python para ingeniería estructural
- `docs/herramientas/forallpeople.md` — Migrado desde `Notebooks/notebooks/forallpeople_guia.md`
- `docs/herramientas/handcalcs.md` — Migrado desde `Notebooks/notebooks/handcalcs_guia.md`

**What:** Presentar las guías de `forallpeople` y `handcalcs` con bloques de código bien formateados y syntax highlighting. Esta sección posiciona el sitio como recurso para ingenieros que usan Python.

**Testing:** Verificar syntax highlighting en código Python. Verificar tablas de referencia de unidades y símbolos.

---

### Step 5: Secciones Estanques y Sismo (Stubs + Notebooks Link)

**Files:**
- `docs/estanques/index.md` — Introducción API 650, enlace al notebook HTML renderizado
- `docs/sismo/index.md` — Introducción NCh 2369, descripción del contenido a desarrollar
- `mkdocs.yml` — Actualizar navegación

**What:** Crear las secciones placeholder para los temas de estanques y sismo, con descripción del contenido y (opcionalmente) enlace al HTML estático del notebook `estanque_cilindrico_API650.html` que ya existe renderizado.

**Testing:** Verificar que las páginas existen y que el enlace al notebook HTML funciona.

> **[NEEDS CLARIFICATION]** ¿Quieres que los notebooks de Jupyter (`.ipynb`) se muestren como páginas dentro del sitio (requiere plugin `mkdocs-jupyter`) o basta con páginas descriptivas que enlacen al HTML ya renderizado?

---

## Decisiones Pendientes

| # | Pregunta | Opciones |
|---|---|---|
| 1 | ¿Framework del sitio? | **MkDocs Material** (recomendado), Jekyll, Quarto, HTML puro |
| 2 | ¿ACI 318-25 como una página larga o dividida por capítulos? | Una página (más simple), Multi-página (mejor navegación) |
| 3 | ¿Cómo presentar los notebooks? | Solo enlace al HTML / Integrados como páginas con `mkdocs-jupyter` |
| 4 | ¿El sitio es solo para ti o también para lectores externos? | Afecta el nivel de introducción y explicación en las páginas |

---

## Referencias Técnicas

- [MkDocs Material](https://squidfunk.github.io/mkdocs-material/) — Documentación oficial
- [MkDocs deploy to GitHub Pages](https://www.mkdocs.org/user-guide/deploying-your-docs/)
- [GitHub Actions for MkDocs](https://squidfunk.github.io/mkdocs-material/publishing-your-site/)
- [MathJax en MkDocs Material](https://squidfunk.github.io/mkdocs-material/reference/math/)
