# MathLive Notepad — Editor WYSIWYG de Cálculos

**Archivo objetivo:** `docs/herramientas/notepad-calculos/MathLiveNotepad.md`  
**Propósito:** Reemplazar el textarea monoespaciado del Notepad actual por filas con `<math-field>` de MathLive, permitiendo escritura visual de fracciones, exponentes y letras griegas (estilo SMath), manteniendo math.js como motor de cálculo y MathJax para el output.

---

## Investigación Previa

### MathLive (arnog/mathlive)
- **Licencia:** MIT | **Versión:** 0.109.2 (mayo 2026) | **Stars:** 2k
- **CDN:** `https://cdn.jsdelivr.net/npm/mathlive` (ES module — requiere `<script type="module">`)
- **Componente:** `<math-field>` web component — API idéntica a `<textarea>` (`.value`, eventos `input`/`change`)
- **Output:** `.getValue('ascii-math')` → expresión tipo `(wu * L^2)/(8)`, cercano a math.js
- **Teclado virtual:** incluido, configurable con `virtual-keyboard-mode`
- **Sin conflicto con MathJax:** MathLive renderiza el *input*; MathJax renderiza el *output* — DOM separado

### Puente MathLive → math.js (decisión de arquitectura)

MathLive produce LaTeX o ASCIIMath; math.js evalúa texto tipo código.

**Estrategia:** `getValue('ascii-math')` + función de limpieza de subíndices:

```javascript
function asciiToMathjs(ascii) {
  return ascii
    .replace(/([a-zA-Z])_\{([a-zA-Z0-9']+)\}/g, '$1$2')  // w_{u} → wu, f'_{c} → f'c
    .replace(/([a-zA-Z])_([a-zA-Z0-9])/g, '$1$2')          // w_u  → wu
    .replace(/\\cdot/g, '*')
    .trim();
}
```

Flujo: `w_u = \frac{w_D \cdot L^2}{8}` → ASCIIMath `wu = (wD * L^2)/(8)` → math.js lo evalúa directo.

### ¿Por qué NO usar Compute Engine?
Compute Engine (cortex-js, mismo ecosistema que MathLive) puede evaluar MathJSON directamente, pero:
- No tiene soporte de unidades físicas comparable a math.js (`kN/m`, `MPa`, `kN·m`)
- El codebase ya usa math.js — mantener una sola librería de cálculo es más simple

### Carga de MathLive en MkDocs
MathLive requiere `type="module"`. Se carga inline en la página — **sin tocar `mkdocs.yml`**:
```html
<script type="module">
  import 'https://cdn.jsdelivr.net/npm/mathlive';
</script>
```

---

## Decisiones Pendientes

> Estas preguntas deben responderse antes de implementar el Step 2:

1. **¿Coexistencia o reemplazo?** ¿Después de implementar el WYSIWYG, mantenemos ambos notepads en el nav (`Notepad.md` + `MathLiveNotepad.md`) o el WYSIWYG reemplaza al de texto plano?

2. **Teclado virtual:** En desktop puede ser intrusivo si aparece automáticamente. ¿Desactivado por defecto con botón `⌨` explícito, o automático al hacer click?

3. **Nombres de variable con subíndices:** El puente normaliza `w_u` → `wu` en el scope. ¿Está bien esta convención (mantiene `wu`, `Mu`, `wD` del codebase existente), o prefieres otra?

---

## Pasos de Implementación

### Step 1: Crear página + registrar en nav ✅ *[pendiente implementación]*

**Archivos:**
- `mkdocs.yml` — agregar entrada en nav
- `docs/herramientas/notepad-calculos/MathLiveNotepad.md` — crear con frontmatter y HTML placeholder

**Qué hace:**
- Página con frontmatter completo (`hide: [navigation, toc]`)
- Registrar bajo "Notepad de Cálculos" como "Notepad WYSIWYG (MathLive)"
- `Notepad.md` existente no se toca — coexisten

**Test:** `mkdocs serve` → nueva página visible en nav, sin errores

---

### Step 2: Gestor de filas con `<math-field>` ✅ *[pendiente implementación]*

**Archivos:**
- `docs/herramientas/notepad-calculos/MathLiveNotepad.md`

**Qué hace:**
- `<script type="module">` carga MathLive desde jsDelivr
- Función `addRow(latex?)` que inserta:
  - Panel izquierdo: `<math-field>` con tipografía TeX
  - Panel derecho: div placeholder de resultado
  - Botón `×` para eliminar la fila
- Fila especial "sección": input de texto plano para `## Título`
- Toolbar: `+ Cálculo`, `+ Sección`, `Limpiar`, `Copiar`, `Imprimir/PDF`
- Precarga ejemplo de viga ACI

**Diseño de fila:**
```
┌──────────────────────────────────┐  ┌───────────────────────────────────┐
│  <math-field>  w_u = 34 kN/m    │→ │  w_u = 34 kN/m                    │ ×
└──────────────────────────────────┘  └───────────────────────────────────┘
      Panel entrada (MathLive)              Panel resultado (MathJax)
```

**Test:** Ver `<math-field>` renderizado con tipografía TeX; escribir `\frac{1}{2}` → ver fracción real

---

### Step 3: Función puente + evaluación con math.js ✅ *[pendiente implementación]*

**Archivos:**
- `docs/herramientas/notepad-calculos/MathLiveNotepad.md`

**Qué hace:**
- `latexToMathjs(mf)`: llama `getValue('ascii-math')` → aplica limpieza → retorna `{lhs, expr, value, error}`
- `evalAllRows()`:
  - Recorre filas de arriba abajo (orden DOM)
  - Acumula `scope` entre filas (igual que `Notepad.md`)
  - Por cada `<math-field>`: llama `latexToMathjs()` → actualiza panel resultado
  - Errores en rojo sin interrumpir evaluación de filas siguientes
  - Evento `input` en cada `<math-field>` con debounce 250ms

**Test:**
- `L = 6 m` → `L = 6 m`
- `w_u = 1.2 w_D + 1.6 w_L` (con `wD=15`, `wL=10` definidos antes) → `wu = 34 kN/m`
- `M_u = \frac{w_u L^2}{8}` → `Mu = 153 kN·m`
- Error en fila 3 → filas 4+ siguen evaluando

---

### Step 4: Resultados MathJax + UX final ✅ *[pendiente implementación]*

**Archivos:**
- `docs/herramientas/notepad-calculos/MathLiveNotepad.md`

**Qué hace:**

*Panel resultado:*
- Muestra `\( \text{lhs} = \text{valor} \text{ unidad} \)` vía `MathJax.typesetPromise()`
- Asignaciones → borde azul (`.np-result-assign`)
- Expresiones → borde verde (`.np-result-ok`)
- Errores → borde rojo (`.np-result-err`)

*Copiar texto:*
- Re-evalúa scope y genera texto plano `varName = valor unidad`
- `navigator.clipboard.writeText()`

*Imprimir/PDF (`@media print`):*
- Oculta toolbar y campos `<math-field>`
- Muestra solo paneles de resultado + secciones (memoria de cálculo imprimible)

**Test:**
- Cambiar `L` → todos los resultados debajo recalculan en ≤300ms
- Imprimir → layout limpio
- Copiar → valores correctos en portapapeles

---

## Estructura de Archivos

```
docs/herramientas/notepad-calculos/
  index.md                      ← sin cambios
  Notepad.md                    ← sin cambios (coexiste durante desarrollo)
  MathLiveNotepad.md            ← NUEVO
  EjemploVigaACI.md             ← sin cambios
```

```yaml
# mkdocs.yml — cambio en nav (Step 1)
- Notepad de Cálculos:
  - Introducción: herramientas/notepad-calculos/index.md
  - Notepad de Texto: herramientas/notepad-calculos/Notepad.md
  - Notepad WYSIWYG (MathLive): herramientas/notepad-calculos/MathLiveNotepad.md
  - Ejemplo — Viga ACI 318: herramientas/notepad-calculos/EjemploVigaACI.md
```

**`mkdocs.yml` extra_javascript: sin cambios** — MathLive se carga inline como ES module.

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|-----------|
| Puente ASCIIMath→math.js con edge cases | Media | Cubrir: fracciones, potencias, subíndices, primas (`f'_c`); documentar limitaciones |
| Subíndices multi-char (`w_{u,max}`) | Baja | La regex de limpieza no los maneja — se documenta como limitación |
| Conflicto MathLive ↔ MathJax en DOM | Baja | DOM completamente separado: MathLive = input; MathJax = output |
| Teclado virtual intrusivo en desktop | Media | `virtual-keyboard-mode="manual"` por defecto (esperar respuesta Step 2) |
| Performance con 30+ filas | Baja | Debounce 250ms + scope incremental suficiente |

---

## Decisiones Confirmadas

| Pregunta | Decisión |
|----------|---------|
| ¿Coexistencia o reemplazo? | **Reemplazo**: MathLiveNotepad.md reemplaza a Notepad.md en el nav |
| Teclado virtual | **Desactivado por defecto** — botón ⌨ Teclado para activarlo |
| Nombres con subíndices | **OK**: w_u → wu en el scope (mantiene convención del codebase) |

