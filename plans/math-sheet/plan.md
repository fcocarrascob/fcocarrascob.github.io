# MathSheet — Hoja de Cálculo Matemático Tipo SMath Studio

**Branch:** `feature/math-sheet`
**Description:** Reemplazar las herramientas Notepad.md y MathLiveNotepad.md con una única hoja de cálculo matemático (`MathSheet.md`) con canvas 2D, bloques arrastrables con WYSIWYG MathLive, snap-to-grid activado por defecto, y evaluación por posición (top→bottom, left→right).

---

## Goal

Reemplazar `Notepad.md` y `MathLiveNotepad.md` con `MathSheet.md`, una herramienta tipo SMath Studio/Mathcad incrustada en el sitio MkDocs. El usuario posiciona libremente **regiones matemáticas** en un canvas con cuadrícula (snap-to-grid por defecto), edita expresiones con tipografía LaTeX (MathLive), y el motor evalúa ordenando los bloques por posición **top→bottom, left→right** compartiendo un `scope` de math.js. Las librerías actuales (MathLive, math.js, Plotly) se reutilizan; se añade soporte de drag nativo en JS. Los archivos viejos se eliminan del repo y del nav de `mkdocs.yml`.

---

## Arquitectura General

```
Canvas (div scroll infinito, cuadrícula CSS)
 └── Block (position:absolute, draggable)
      ├── Header (título editable + botones: tipo, cerrar)
      ├── ExpressionCell (<math-field> MathLive)
      └── ResultCell (span LaTeX/MathJax o Plotly chart)

Engine:
  1. Leer todos los bloques → ordenar por offsetTop
  2. math.evaluate(expr, scope) en orden
  3. Actualizar ResultCell de cada bloque
  4. Guardar estado en localStorage (auto-save)
```

**Librerías:**

| Librería | Fuente | Uso |
|---|---|---|
| math.js 14.8.1 | CDN ya en mkdocs.yml | Evaluación + unidades |
| MathLive (latest) | CDN importado en el HTML | WYSIWYG input |
| MathJax 3 | CDN ya en mkdocs.yml | Render resultados |
| Plotly 2.35.2 | CDN ya en mkdocs.yml | Bloques gráfico |
| Vanilla JS | — | Drag & drop |

---

## Implementation Steps

### Step 1: Eliminar archivos viejos y crear canvas base con bloques arrastrables

**Archivos:**
- `docs/herramientas/notepad-calculos/Notepad.md` *(eliminar)*
- `docs/herramientas/notepad-calculos/MathLiveNotepad.md` *(eliminar)*
- `docs/herramientas/notepad-calculos/EjemploVigaACI.md` *(eliminar — reemplazado por el ejemplo embebido en la nueva hoja)*
- `docs/herramientas/notepad-calculos/index.md` *(actualizar — quitar referencias a los archivos eliminados)*
- `docs/herramientas/notepad-calculos/MathSheet.md` *(nuevo)*
- `mkdocs.yml` *(limpiar nav entries viejas, añadir nueva)*

**Qué:**
Eliminar los archivos obsoletos del repositorio y del nav, y crear el canvas con:

- **Eliminar archivos viejos**: `Notepad.md`, `MathLiveNotepad.md`, `EjemploVigaACI.md`. Actualizar `index.md` para que sólo apunte a `MathSheet.md`.
- **Nav en mkdocs.yml**: quitar las tres entradas antiguas, añadir `Hoja de Cálculo: herramientas/notepad-calculos/MathSheet.md`.
- **Canvas**: `div#ms-canvas` con `position:relative`, `overflow:auto`, dimensiones mínimas 3000×2000 px, fondo cuadrícula CSS (`background-image: linear-gradient(...)` de 40×40 px) con celda de **40 px**.
- **Block DOM template**: cada bloque es un `div.ms-block` con `position:absolute`, borde redondeado, sombra, header de arrastre (`div.ms-block-header`), zona de expresión y zona de resultado.
- **Drag nativo** (sin librerías externas): `mousedown` en el header activa `mousemove`/`mouseup` en el canvas para mover el bloque. Coordenadas relativas al canvas.
- **Snap-to-grid activado por defecto**: al soltar el bloque (`mouseup`) se cuantiza la posición al múltiplo de 40 px más cercano. Checkbox **"Cuadrícula"** en la toolbar que activa/desactiva el snap (estado persiste en localStorage).
- **Botón "+"** en toolbar: menú desplegable para añadir bloque Cálculo / Texto / Sección.

**Testing:**
- Los archivos viejos ya no existen; el nav muestra sólo "Hoja de Cálculo".
- Abrir la página, hacer clic en "+" → aparece un bloque en el canvas.
- Arrastrar el bloque por el header → se repositiona y encaja a la cuadrícula de 40 px al soltar.
- Desactivar checkbox "Cuadrícula" → el bloque se queda donde se suelta (libre).
- El canvas hace scroll al llegar al borde; el fondo cuadrícula es visible.

---

### Step 2: WYSIWYG math input con MathLive por bloque

**Archivos:**
- `docs/herramientas/notepad-calculos/MathSheet.md`

**Qué:**
En cada bloque de tipo `calc`, la zona de expresión contiene un `<math-field>` de MathLive:

- Importar MathLive via CDN (`https://cdn.jsdelivr.net/npm/mathlive`) como módulo ES.
- Configurar `MathfieldElement` con `virtual-keyboard-mode="off"` por defecto.
- Reutilizar la función `asciiToMathjs()` (ya existe en MathLiveNotepad.md) para convertir la salida ASCII-Math de MathLive a sintaxis math.js.
- El `<math-field>` ocupa todo el ancho del bloque; altura mínima 44 px, auto-expand en multilínea.
- Botón toggle ⌨ para activar el teclado virtual de MathLive globalmente.
- Bloques de tipo `text` usan un `<textarea>` estándar (sin MathLive).
- Bloques de tipo `section` usan un `<input type="text">` estilado como encabezado H2.

**Testing:**
- Click en un bloque calc → aparece cursor MathLive y puede escribir `x := 5`.
- Fracciones (`/`), raíces (`sqrt`), exponentes (`^`) se renderizan visualmente en el campo.
- Bloques texto y sección aceptan texto plano.

---

### Step 3: Motor de evaluación top→bottom, left→right

**Archivos:**
- `docs/herramientas/notepad-calculos/MathSheet.md`

**Qué:**
Implementar el motor central de evaluación con ordenamiento 2D:

```javascript
function evaluateSheet() {
  // 1. Recolectar todos los bloques calc y ordenar: primero por top, luego por left
  const calcBlocks = [...document.querySelectorAll('.ms-block[data-type="calc"]')]
    .sort((a, b) => {
      const dy = parseInt(a.style.top) - parseInt(b.style.top);
      return dy !== 0 ? dy : parseInt(a.style.left) - parseInt(b.style.left);
    });

  // 2. Limpiar scope y re-evaluar
  const scope = {};
  for (const block of calcBlocks) {
    const expr = block._mathjsExpr;  // convertido desde MathLive
    try {
      const result = math.evaluate(expr, scope);
      block.querySelector('.ms-result').innerHTML = formatResult(result, expr);
      block.dataset.error = '';
    } catch(e) {
      block.querySelector('.ms-result').textContent = e.message;
      block.dataset.error = '1';
    }
  }
  MathJax.typesetPromise([...document.querySelectorAll('.ms-result')]);
}
```

- Disparar `evaluateSheet()` en `input` de cualquier `<math-field>` (debounce 300 ms).
- Disparar también al soltar un bloque (drag end) porque moverlo puede cambiar el orden de evaluación.
- **Criterio de orden**: `top` tiene prioridad; si dos bloques tienen el mismo `top` (misma fila de cuadrícula), se ordenan por `left` (izquierda → derecha).
- `formatResult()`: si el resultado tiene unidades (`math.unit`), mostrar valor + unidad en LaTeX; si es número puro, 4 cifras significativas; si es matriz/vector, notación corchete.
- Bloques con `data-error="1"` → borde rojo; resultado válido → borde izquierdo verde tenue.

**Testing:**
- Crear bloque A (`x := 5`) y bloque B (`y := x + 3`). B muestra `y = 8`.
- Mover B **encima** de A → reevalúa; B no reconoce `x`, muestra error.
- Mover A de vuelta arriba → B vuelve a mostrar `8`.
- Expresiones con unidades: `F := 10 kN`, `L := 5 m`, `M := F * L` → `M = 50 kN·m`.

---

### Step 4: Tipos de bloque — Texto y Sección

**Archivos:**
- `docs/herramientas/notepad-calculos/MathSheet.md`

**Qué:**
Completar los tipos de bloque no-calc:

- **Bloque Texto** (`data-type="text"`):
  - `<textarea>` auto-resize con fuente serif.
  - No participa en la evaluación.
  - Útil para anotaciones, hipótesis, referencias normativas.
  
- **Bloque Sección** (`data-type="section"`):
  - `<input type="text">` estilado como `<h2>` (fuente mayor, línea decorativa abajo).
  - Fondo levemente diferente para destacar visualmente en el canvas.
  - No participa en la evaluación.

- **Menú contextual del header** (botón `⋮`): permite cambiar tipo de bloque entre `calc ↔ text`.

- **Bordes de color por tipo**:
  - Calc: borde izquierdo azul (#2980b9)
  - Texto: borde izquierdo gris (#999)
  - Sección: borde izquierdo naranja (#e67e22), fondo lavanda claro

**Testing:**
- Añadir bloque Sección "§1 Geometría" → aparece estilado como encabezado, no evalúa.
- Añadir bloque Texto → acepta texto libre, no evalúa.
- Cambiar tipo de un bloque calc → el `<math-field>` se reemplaza por `<textarea>`.

---

### Step 5: Persistencia, toolbar y UX

**Archivos:**
- `docs/herramientas/notepad-calculos/MathSheet.md`

**Qué:**
Toolbar fija en la parte superior del canvas (no scrollea) y persistencia de estado:

**Toolbar:**
```
[+ Cálculo] [+ Texto] [+ Sección] [+ Gráfico] | [Guardar JSON] [Cargar JSON] [Limpiar] | [⌨ Teclado] [snap □]
```

**Persistencia en localStorage:**
```javascript
function saveSheet() {
  const state = [...document.querySelectorAll('.ms-block')].map(b => ({
    id: b.id,
    type: b.dataset.type,
    x: parseInt(b.style.left),
    y: parseInt(b.style.top),
    w: b.offsetWidth,
    expr: b._latexExpr || '',
    text: b.querySelector('textarea,input')?.value || ''
  }));
  localStorage.setItem('mathsheet-state', JSON.stringify(state));
}
```
- Auto-save en `input` y drag-end.
- Restore al cargar la página (`DOMContentLoaded`).
- **Exportar JSON**: `Blob` + `URL.createObjectURL` → descarga `mathsheet.json`.
- **Importar JSON**: `<input type="file">` oculto.

**Resize de bloques:**
- Handle en la esquina inferior-derecha (`div.ms-resize-handle`) para cambiar ancho/alto del bloque con `mousedown/mousemove`.

**Botón eliminar:**
- Botón `×` en el header del bloque, visible solo en hover (`:hover .ms-close-btn { opacity:1 }`).

**Testing:**
- Crear una hoja de ejemplo, recargar la página → estado restaurado.
- Exportar JSON, limpiar, importar → hoja restaurada.
- Resize de un bloque → MathLive y textarea se ajustan al nuevo tamaño.

---

---

## Ejemplo de hoja tipo SMath incluido

Como referencia de uso, crear un ejemplo pre-cargado (activado con botón "Cargar Ejemplo"):

```
[Sección: "§1 Datos del Problema"]
[Calc: L := 6 m        | L = 6 m]
[Calc: wD := 15 kN/m   | wD = 15 kN/m]
[Calc: wL := 10 kN/m   | wL = 10 kN/m]

[Sección: "§2 Combinación de Cargas"]
[Calc: wu := 1.2*wD + 1.6*wL   | wu = 34 kN/m]

[Sección: "§3 Solicitaciones"]
[Calc: Mu := wu * L^2 / 8      | Mu = 153 kN·m]
[Calc: Vu := wu * L / 2        | Vu = 102 kN]

[Plot: f(x) = wu * x * (L - x) / 2, x: 0 a L]
```

---

## Consideraciones técnicas

### Conflicto MathJax + MkDocs
MathJax está cargado globalmente por MkDocs. Al retipificar los resultados usar `MathJax.typesetPromise([elemento])` en lugar de `MathJax.typeset()` (ya hace queue interno). El bloque de configuración `mathjax.js` re-tipifica en cada navegación de página; no necesita modificación.

### MathLive como módulo ES
MathLive se importa como módulo ES con `<script type="module">`. Esto es compatible con MkDocs Material y no interfiere con scripts globales.

### Evaluación de unidades en math.js
`math.evaluate('F := 10 kN', scope)` devuelve un objeto `Unit`. Para mostrar como resultado: `math.format(result, { notation: 'fixed', precision: 4 })` incluye la unidad automáticamente.

### Archivos eliminados
`Notepad.md`, `MathLiveNotepad.md` y `EjemploVigaACI.md` se borran del repositorio en el Step 1. Sus funcionalidades quedan completamente cubiertas por `MathSheet.md`.

---

## Archivos afectados

| Archivo | Acción |
|---|---|
| `docs/herramientas/notepad-calculos/Notepad.md` | **Eliminar** |
| `docs/herramientas/notepad-calculos/MathLiveNotepad.md` | **Eliminar** |
| `docs/herramientas/notepad-calculos/EjemploVigaACI.md` | **Eliminar** |
| `docs/herramientas/notepad-calculos/index.md` | **Editar** (quitar referencias a archivos eliminados) |
| `docs/herramientas/notepad-calculos/MathSheet.md` | **Crear** (nuevo, ~700-900 líneas HTML+JS+CSS) |
| `mkdocs.yml` | **Editar** (reemplazar 3 nav entries antiguas por 1 nueva) |

---

## Criterios de éxito

- [ ] Canvas scrollable con cuadrícula visible
- [ ] Bloques creados por menú, arrastrables libremente
- [ ] Input MathLive WYSIWYG en cada bloque calc
- [ ] Resultados evaluados top-to-bottom y mostrados en LaTeX
- [ ] Variables cruzadas entre bloques (scope compartido)
- [ ] Unidades propagadas correctamente
- [ ] Tipos: calc, text, section, plot
- [ ] Estado persistido en localStorage
- [ ] Export/import JSON
- [ ] *(Futuro)* Bloques gráfico con Plotly
