# Notepad de Cálculos

**Branch:** `feature/notepad-calculos`
**Description:** Agregar una sección "Notepad de Cálculos" en Herramientas con una calculadora interactiva de doble modo (línea por línea en tiempo real + bloque con botón Calcular), resultados renderizados con MathJax, gráficos Plotly, y un ejemplo estructural completo al estilo de `Calculadora.md`.

---

## Goal

Proveer al usuario de la wiki una herramienta de cálculo estructural interactiva embebida directamente en MkDocs, que combine:
1. **Modo Notepad (live)** — editor línea por línea donde cada asignación muestra su resultado al lado, renderizado con MathJax, con scope acumulativo entre líneas (variables persisten).
2. **Modo Bloque** — textarea libre con botón "Calcular" que genera un documento de cálculo ordenado con ecuaciones MathJax y gráficos Plotly, al estilo de la `Calculadora.md` de estanques.

Motor de cálculo: **math.js** (Apache-2.0, CDN, soporte nativo de unidades).

---

## Decisiones de Diseño (confirmadas)

| Pregunta | Decisión |
|----------|----------|
| Interfaz | **Ambas**: tabs "Línea por línea" y "Bloque de texto" |
| Renderizado | **MathJax** — resultados como ecuaciones tipografiadas |
| Persistencia | **Copiar al portapapeles** — sin URL hash (KISS) |
| Ejemplo precargado | **Estilo `Calculadora.md`** — inputs + cálculos ordenados con MathJax + gráfico Plotly |
| Alcance | **Todo** — Steps 1–4 |

---

## Investigación Previa

### ¿Por qué NO Hurmet?
Hurmet (hurmet.org) es una SPA completa. No expone paquete npm ni bundle embebible. No integrable en MkDocs.

### ¿Por qué math.js?
- Licencia Apache-2.0 (igual que Plotly, ya en el sitio)
- CDN: `https://cdnjs.cloudflare.com/ajax/libs/mathjs/14.8.1/math.min.js`
- Unidades nativas: `math.evaluate("1.2 * 15 kN/m * (6 m)^2 / 8")` → `81 kN·m`
- `math.parse(expr).toTex()` genera LaTeX de la expresión para MathJax
- Mismo patrón de integración que Calculadora.md (HTML + JS inline en .md)

---

## Implementation Steps

### Step 1: Setup — math.js al sitio + estructura de la sección
**Files:**
- `mkdocs.yml`
- `docs/herramientas/index.md`
- `docs/herramientas/notepad-calculos/index.md` *(nuevo)*

**What:**
- Añadir math.js CDN a `extra_javascript` en `mkdocs.yml`
- Crear `docs/herramientas/notepad-calculos/index.md` con presentación de la sección (qué es, cómo usarlo, sintaxis básica con ejemplos de tabla)
- Registrar en `nav` de `mkdocs.yml` con etiqueta "Notepad de Cálculos"
- Mencionar la nueva sección en `docs/herramientas/index.md`

**Testing:**
- `mkdocs serve` → sección visible en el nav, página carga sin errores de consola JS

---

### Step 2: Notepad Interactivo — Doble Modo con MathJax
**Files:**
- `docs/herramientas/notepad-calculos/Notepad.md` *(nuevo)*

**What:**
Página con dos tabs (usando el componente `tabbed` de pymdownx ya configurado):

**Tab 1 — "Línea por Línea" (live)**
- Grilla de filas: `[input expr]  →  [resultado MathJax]`
- Botones `+` y `×` para agregar/eliminar filas
- `math.evaluate(expr, scope)` con scope acumulativo; cada cambio (`oninput`) re-evalúa todas las filas desde la primera
- Líneas con `#` se muestran en gris como comentario (no se evalúan)
- Errores en una fila muestran mensaje en rojo sin romper las filas siguientes
- Resultado renderizado como: `\[ varName = value \text{ unidad} \]` via `MathJax.typesetPromise()`
- Precargado con ejemplo viga simple (6 líneas)

**Tab 2 — "Bloque de Texto" (textarea + botón)**
- `<textarea>` multilínea (estilo Calculadora.md input box)
- Botón "**Calcular**" evalúa todo el bloque de una vez
- Output debajo: documento ordenado con secciones, cada resultado como ecuación MathJax (`eq()` y `eqi()` helpers, igual que Calculadora.md)
- Variables de tipo número muestran: `varName = value [unidad]`
- Secciones separadas por líneas `## Título` en el input → generan `<h3>` en el output

**Precarga del ejemplo (ambos tabs):**
```
# Viga simplemente apoyada — ACI 318
## Cargas y geometría
L = 6 m
wD = 15 kN/m
wL = 10 kN/m
## Combinación última
wu = 1.2 * wD + 1.6 * wL
Mu = wu * L^2 / 8
Vu = wu * L / 2
```

**Testing:**
- Tab 1: modificar valor de `L` → todos los resultados siguientes se recalculan en tiempo real
- Tab 2: presionar Calcular → aparece documento con ecuaciones MathJax correctas
- Comentarios y secciones se renderizan correctamente
- Error en una línea no colapsa el cálculo completo

---

### Step 3: UX — Copiar, Limpiar, Imprimir
**Files:**
- `docs/herramientas/notepad-calculos/Notepad.md` *(modificar)*

**What:**
- Botón **"Copiar texto"**: genera texto plano con formato `varName = value unidad` y lo envía a `navigator.clipboard.writeText()`; confirma con tooltip "¡Copiado!"
- Botón **"Limpiar"**: resetea el notepad al estado inicial (con confirmación `confirm()`)
- Botón **"Imprimir / PDF"**: llama `window.print()`
- `@media print` CSS (inline `<style>`): oculta `header`, `.md-nav`, `.md-sidebar`, botones de acción; muestra solo el bloque de resultados con tipografía limpia

**Testing:**
- Copiar → pegar en bloc de notas → verificar texto formateado correcto
- Imprimir → vista previa del navegador muestra solo el cálculo sin chrome de MkDocs
- Limpiar → vuelve al ejemplo precargado

---

### Step 4: Ejemplo Estructural Completo — Estilo Calculadora.md
**Files:**
- `docs/herramientas/notepad-calculos/EjemploVigaACI.md` *(nuevo)*

**What:**
Calculadora de diseño de viga rectangular simplemente apoyada (ACI 318-25) con el mismo patrón que `Calculadora.md`:

**Inputs (form):**
| Variable | Descripción |
|----------|-------------|
| `L` | Longitud (m) |
| `wD`, `wL` | Carga muerta y viva (kN/m) |
| `fc` | Resistencia del hormigón f'c (MPa) |
| `fy` | Resistencia del acero fy (MPa) |
| `b` | Ancho de la sección (mm) |
| `d` | Altura efectiva (mm) |

**Resultados ordenados con MathJax** (mismo patrón `eq()` / `eqi()` de Calculadora.md):
1. Combinación de carga: $w_u = 1.2 w_D + 1.6 w_L$
2. Solicitaciones: $M_u = w_u L^2 / 8$, $V_u = w_u L / 2$
3. Área de acero requerida: $A_s = M_u / (\phi f_y (d - a/2))$ (iterativo)
4. Acero mínimo §9.6.1.2 y máximo §21.2.2
5. Verificación de cortante $\phi V_n \geq V_u$
6. Resumen: ✅/⚠ para cada verificación

**Gráficos Plotly (igual que Calculadora.md):**
- Diagrama de momentos $M(x)$ a lo largo de la viga
- Diagrama de cortantes $V(x)$
- Punto de máximo marcado con marcador y anotación

**Testing:**
- Calcular con valores L=6m, wD=15kN/m, wL=10kN/m, f'c=25MPa, fy=420MPa, b=300mm, d=500mm
- Verificar que As calculado coincide con cálculo manual
- Verificar que gráficos de M y V son correctos (parábola y línea recta)
- Verificar estados de verificación (✅/⚠) son coherentes

---

## Arquitectura Técnica

### Motor de cálculo (math.js)
```javascript
// Scope acumulativo entre líneas
var scope = {};
math.evaluate("L = 6 m", scope);              // → Unit: 6 m
math.evaluate("wu = 1.2 * 15 kN/m + 1.6 * 10 kN/m", scope); // → Unit: 34 kN/m
math.evaluate("Mu = wu * L^2 / 8", scope);    // → Unit: 153 kN·m

// LaTeX del resultado para MathJax
math.format(scope.Mu, {notation: 'fixed', precision: 2}); // → "153.00 kN m"
```

### Renderizado MathJax (mismo patrón que Calculadora.md)
```javascript
function eq(latex)  { return '<div class="arithmatex">\\[' + latex + '\\]</div>'; }
function eqi(latex) { return '<span class="arithmatex">\\(' + latex + '\\)</span>'; }
// Después de inyectar HTML:
MathJax.typesetPromise([document.getElementById('notepad-output')]);
```

### Estructura de tabs (pymdownx.tabbed — ya configurado)
```markdown
=== "Línea por Línea"
    <div id="notepad-lineas">...</div>

=== "Bloque de Texto"
    <div id="notepad-bloque">...</div>
```

---

## Estructura de Archivos Final

```
docs/herramientas/notepad-calculos/
  index.md           ← Presentación + sintaxis básica + tabla de operadores
  Notepad.md         ← Herramienta dual (tabs: línea x línea + bloque)
  EjemploVigaACI.md  ← Calculadora completa estilo Calculadora.md (form + MathJax + Plotly)
```

```yaml
# mkdocs.yml — nav (añadir bajo Herramientas)
- Notepad de Cálculos:
  - Introducción: herramientas/notepad-calculos/index.md
  - Notepad Interactivo: herramientas/notepad-calculos/Notepad.md
  - Ejemplo — Viga ACI 318: herramientas/notepad-calculos/EjemploVigaACI.md
```

```yaml
# mkdocs.yml — extra_javascript (añadir)
- https://cdnjs.cloudflare.com/ajax/libs/mathjs/14.8.1/math.min.js
```

---

## Dependencias y Riesgos

| Item | Estado | Nota |
|------|--------|------|
| math.js CDN | ✅ Listo | Apache-2.0, cdnjs.cloudflare.com |
| MathJax 3 | ✅ Ya instalado | `typesetPromise()` funciona con DOM inyectado dinámicamente |
| Plotly | ✅ Ya instalado | Mismo patrón que Calculadora.md |
| pymdownx.tabbed | ✅ Ya configurado | Necesario para los dos modos del Notepad |
| Seguridad | ✅ Seguro | `math.evaluate()` no ejecuta JS arbitrario |
| Mobile | ⚠ Revisar | Grid de filas puede necesitar scroll horizontal en pantallas pequeñas |
| MathJax + tabs | ⚠ Atención | Al cambiar de tab, puede ser necesario llamar `typesetPromise()` nuevamente si MathJax no re-renderizó el tab oculto |
