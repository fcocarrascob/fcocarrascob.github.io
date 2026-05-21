# Canvas Notepad — Hoja de Cálculo Interactiva tipo Calculeaf

**Branch:** `feature/canvas-notepad`
**Descripción:** Aplicación React de hoja de cálculo con bloques arrastrables de ecuaciones tipografiadas (MathLive) sobre un canvas con cuadrícula milimetrada, evaluados de arriba hacia abajo con math.js, con persistencia en localStorage, integrada en el sitio MkDocs como subpath estático.

---

## Goal

Construir una hoja de cálculo interactiva tipo Calculeaf donde el usuario posiciona libremente bloques de ecuaciones WYSIWYG en un canvas con cuadrícula. Los bloques comparten un scope de variables, se evalúan en orden vertical (top → bottom) con math.js, y el resultado aparece inline tipografiado con KaTeX. El estado persiste en localStorage. La app vive en `fcocarrascob.github.io/canvas-notepad/`.

---

## Decisiones de Diseño (Confirmadas)

| # | Decisión | Elección |
|---|---|---|
| **Entrada matemática** | WYSIWYG tipografiado | **MathLive** (`<math-field>`) |
| **Ancho de bloques** | Fijo | **320px** (redimensionable en v2) |
| **Persistencia** | Automática + exportar | **localStorage** + botón Export/Import JSON |
| **Ubicación del proyecto** | Mismo repo | `fcocarrascob.github.io/math-notebook/` |

---

## Contexto Técnico

### Proyecto base: `math-notebook/` (React + TypeScript + Vite)
Ubicación final: `F:\Proyectos_Python\fcocarrascob.github.io\math-notebook\`

**Dependencias ya instaladas:**
| Librería | Uso |
|---|---|
| `mathjs ^15.2` | Motor de evaluación + unidades físicas |
| `katex ^0.16` | Renderizado HTML de resultados tipografiados |
| `zustand ^5.0` | Estado global (bloques, dragging, scope) |
| `lucide-react ^1.16` | Íconos del toolbar |
| `tailwindcss ^4.3` | Estilos utilitarios |

**Por agregar (Step 1):**
- `mathlive` — web component `<math-field>` para entrada WYSIWYG

**NO se usan:** CodeMirror, Vite hero assets

### Drag en canvas libre
`@dnd-kit` es para listas — aquí se usa un **hook personalizado** con eventos de mouse:

```typescript
// hooks/useDrag.ts — lógica central
const snap = (v: number, grid = 20) => Math.round(v / grid) * grid;

// mousedown en Block → guarda offset
// mousemove en window → calcula nueva posición con snap
// mouseup en window → confirma posición + dispara evaluateAll
```

### Modelo de datos (Zustand + localStorage)
```typescript
// types/index.ts
type BlockType = 'math' | 'text';

interface Block {
  id: string;
  type: BlockType;
  x: number;       // px, snap a 20px
  y: number;       // px, snap a 20px
  width: number;   // fijo: 320px
  content: string; // LaTeX (math) | texto plano (text)
  result?: EvalResult;
}

interface EvalResult {
  status: 'assign' | 'ok' | 'error' | 'empty';
  katexHtml: string;  // HTML pre-renderizado por KaTeX
}

interface WorksheetStore {
  blocks: Block[];
  addBlock: (type: BlockType, x?: number, y?: number) => void;
  moveBlock: (id: string, x: number, y: number) => void;
  updateContent: (id: string, content: string) => void;
  deleteBlock: (id: string) => void;
  clearAll: () => void;
  evaluateAll: () => void;
}
```

**Persistencia:** `zustand/middleware` `persist` con `localStorage`:
```typescript
const useWorksheetStore = create(
  persist<WorksheetStore>(
    (set, get) => ({ ... }),
    { name: 'canvas-notepad-v1' }
  )
);
```

### Orden de evaluación
```typescript
// engine/evaluate.ts
const sorted = [...blocks].sort((a, b) =>
  a.y !== b.y ? a.y - b.y : a.x - b.x
);
const scope: Record<string, unknown> = {};
for (const block of sorted) {
  if (block.type !== 'math' || !block.content) continue;
  const expr = mlToMathjs(block.content);
  try {
    const val = math.evaluate(expr, scope);
    // detectar asignación, renderizar con KaTeX
  } catch (e) { /* status: error */ }
}
```

### Puente MathLive → math.js (patrón probado en MathLiveNotepad.md)
```typescript
// engine/mlToMathjs.ts
export function mlToMathjs(ascii: string): string {
  return ascii
    .replace(/([a-zA-Z])_\(([a-zA-Z0-9']+)\)/g, '$1$2')   // w_(u) → wu
    .replace(/([a-zA-Z])_\{([a-zA-Z0-9']+)\}/g, '$1$2')   // w_{u} → wu
    .replace(/([a-zA-Z])_([a-zA-Z0-9])/g, '$1$2')          // w_u   → wu
    .replace(/\bcdot\b/g, '*')
    .trim();
}
```

### Cuadrícula CSS (sin imagen externa)
```css
/* Canvas.tsx — inline style o Tailwind arbitrary */
background-color: #ffffff;
background-image:
  linear-gradient(to right, #e2e8f0 1px, transparent 1px),
  linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
background-size: 20px 20px;
```

### Integración GitHub Actions
El workflow actual corre solo Python/MkDocs. Se extiende así:
```yaml
# NUEVO: antes del paso "Deploy a GitHub Pages"
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
    cache-dependency-path: math-notebook/package-lock.json

- name: Build Canvas Notepad
  working-directory: math-notebook
  run: npm ci && npm run build
  # vite.config.ts apunta outDir a ../docs/canvas-notepad
  # MkDocs incluye esos archivos en el deploy automáticamente
```

---

## Estructura de Archivos

```
fcocarrascob.github.io/
│
├── math-notebook/                     ← Proyecto React (MOVIDO aquí desde proyecto_prueba)
│   ├── package.json                   ← + mathlive
│   ├── vite.config.ts                 ← base:'/canvas-notepad/', outDir:'../docs/canvas-notepad'
│   ├── tsconfig.app.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx                    ← Shell: <Toolbar> + <Canvas>
│       ├── index.css                  ← Tailwind directives
│       ├── types/
│       │   └── index.ts               ← Block, BlockType, EvalResult, WorksheetStore
│       ├── store/
│       │   └── useWorksheetStore.ts   ← Zustand + persist(localStorage)
│       ├── components/
│       │   ├── Canvas.tsx             ← Div scrollable con grid CSS + event handlers drag
│       │   ├── Block.tsx              ← Wrapper absoluto + drag handle + botón ×
│       │   ├── MathBlock.tsx          ← <math-field> (edit) + KaTeX div (display)
│       │   ├── TextBlock.tsx          ← <textarea> autoexpandible
│       │   └── Toolbar.tsx            ← + Ecuación, + Texto, Limpiar, Export, Import
│       ├── engine/
│       │   ├── evaluate.ts            ← sort + math.js + KaTeX render
│       │   └── mlToMathjs.ts          ← Bridge ASCIIMath → math.js syntax
│       └── hooks/
│           └── useDrag.ts             ← Hook drag libre con snap a 20px
│
├── docs/
│   ├── canvas-notepad/                ← BUILD OUTPUT (no editar, generado por Vite)
│   │   ├── index.html
│   │   └── assets/
│   └── herramientas/
│       └── canvas-notepad.md          ← Página MkDocs con iframe
│
├── mkdocs.yml                         ← + entrada nav
└── .github/workflows/deploy.yml       ← + Node build step
```

---

## Implementation Steps

### Step 1: Mover proyecto + Scaffolding
**Archivos:** `math-notebook/` (todo), `math-notebook/package.json`, `math-notebook/vite.config.ts`

**Qué hace:**
1. Copiar `F:\Proyectos_Python\proyecto_prueba\math-notebook\` → `F:\Proyectos_Python\fcocarrascob.github.io\math-notebook\` (sin `node_modules/`, sin `dist/`)
2. Limpiar assets del template Vite: borrar `src/assets/react.svg`, `src/assets/vite.svg`, `src/assets/hero.png`, `src/App.css`
3. Instalar `mathlive`: `npm install mathlive`
4. `vite.config.ts`:
   ```typescript
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';
   import tailwindcss from '@tailwindcss/vite';

   export default defineConfig({
     base: '/canvas-notepad/',
     plugins: [react(), tailwindcss()],
     build: {
       outDir: '../docs/canvas-notepad',
       emptyOutDir: true,
     },
   });
   ```
5. `src/index.css`: solo Tailwind `@import "tailwindcss";`
6. `src/App.tsx`: shell mínimo con `<h1>Canvas Notepad</h1>`
7. `.gitignore` del repo principal: añadir `math-notebook/node_modules/` y `docs/canvas-notepad/`

**Testing:** `cd math-notebook && npm run dev` → título "Canvas Notepad" en `localhost:5173/canvas-notepad/`, sin errores TypeScript ni de consola.

---

### Step 2: Tipos + Zustand Store + persistencia localStorage
**Archivos:** `src/types/index.ts`, `src/store/useWorksheetStore.ts`

**Qué hace:**
- `types/index.ts`: definir `Block`, `BlockType`, `EvalResult`, `WorksheetStore`
- `useWorksheetStore.ts`: store completo con `persist` middleware:
  - `blocks: Block[]` — estado central
  - `addBlock(type, x?, y?)` — genera `id: crypto.randomUUID()`, `width: 320`, posición por defecto `{x: 80, y: 80}`
  - `moveBlock(id, x, y)` — actualiza coordenadas
  - `updateContent(id, content)` — actualiza LaTeX/texto
  - `deleteBlock(id)` — filtra array
  - `clearAll()` — vacía array
  - `evaluateAll()` — stub vacío (se implementa en Step 5)
  - `persist({ name: 'canvas-notepad-v1' })` — serializa a localStorage

**Testing:** En consola del dev server: `window.__store = useWorksheetStore.getState(); __store.addBlock('math')` → aparece en `__store.blocks`. Recargar página → bloque persiste.

---

### Step 3: Canvas con cuadrícula + bloques arrastrables
**Archivos:** `src/hooks/useDrag.ts`, `src/components/Canvas.tsx`, `src/components/Block.tsx`, `src/App.tsx`

**Qué hace:**

**`useDrag.ts`:**
```typescript
interface DragState {
  id: string;
  startMouse: { x: number; y: number };
  startBlock: { x: number; y: number };
}

export function useDrag(canvasRef: React.RefObject<HTMLDivElement>) {
  const [dragging, setDragging] = useState<DragState | null>(null);
  const { moveBlock, evaluateAll } = useWorksheetStore();
  const snap = (v: number) => Math.round(v / 20) * 20;

  const onBlockMouseDown = (id: string, bx: number, by: number, e: React.MouseEvent) => {
    e.preventDefault();
    setDragging({ id, startMouse: { x: e.clientX, y: e.clientY }, startBlock: { x: bx, y: by } });
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const scrollLeft = canvasRef.current.scrollLeft;
      const scrollTop = canvasRef.current.scrollTop;
      const dx = e.clientX - dragging.startMouse.x;
      const dy = e.clientY - dragging.startMouse.y;
      moveBlock(dragging.id,
        snap(Math.max(0, dragging.startBlock.x + dx)),
        snap(Math.max(0, dragging.startBlock.y + dy))
      );
    };
    const onUp = () => { if (dragging) { evaluateAll(); setDragging(null); } };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [dragging]);

  return { onBlockMouseDown, isDragging: (id: string) => dragging?.id === id };
}
```

**`Canvas.tsx`:**
- `div` con `ref`, `position: relative`, `width: 3000px`, `height: 2000px`, cuadrícula CSS
- `overflow: auto` en wrapper externo (`flex-1`)
- Renderiza `blocks.map(b => <Block key={b.id} block={b} ... />)`

**`Block.tsx`:**
- `div` `position: absolute`, `left: block.x`, `top: block.y`, `width: 320px`
- Header: barra de drag (cursor `grab`/`grabbing`), botón `×` (lucide `X`)
- Body: slot para `<MathBlock>` o `<TextBlock>`
- `box-shadow` + `border-radius` para aspecto de tarjeta

**Testing:** Añadir 2 bloques hardcodeados al store → ver canvas con cuadrícula y 2 tarjetas → arrastrar por el handle → se mueven con snap → se quedan en posición.

---

### Step 4: MathBlock — entrada MathLive + display KaTeX
**Archivos:** `src/components/MathBlock.tsx`

**Qué hace:**
- **Modo display** (por defecto): div con HTML de KaTeX del `block.content` (o placeholder `⟨expresión⟩` si vacío) + fila de resultado al pie
- **Modo edición** (al hacer click): muestra `<math-field>` con el LaTeX actual
- Integración React con `<math-field>` como web component:
  ```typescript
  // Declarar el elemento para TypeScript
  declare global {
    namespace JSX {
      interface IntrinsicElements {
        'math-field': React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement> & { value?: string },
          HTMLElement
        >;
      }
    }
  }

  // Montar MathLive en useEffect
  useEffect(() => {
    import('mathlive').then(() => setMathLiveReady(true));
  }, []);

  // Ref para acceder al valor
  const mfRef = useRef<HTMLElement & { getValue: (fmt: string) => string }>(null);
  ```
- Al confirmar (Escape / blur): `updateContent(id, mfRef.current.value)` → `evaluateAll()`
- Layout del bloque en modo display:
  ```
  ┌─────────────────────────────────┐
  │  ≡  drag handle           [×]   │  ← header 28px
  ├─────────────────────────────────┤
  │   a := 30 MPa                   │  ← expresión KaTeX
  │   ────────────────────────────  │
  │   a = 30 MPa                    │  ← resultado KaTeX (azul)
  └─────────────────────────────────┘
  ```

**Testing:** Click en bloque → aparece `<math-field>` → escribir `\frac{w_u \cdot L^2}{8}` → Escape → ver fracción tipografiada en display.

---

### Step 5: Motor de evaluación (math.js top → bottom + KaTeX)
**Archivos:** `src/engine/mlToMathjs.ts`, `src/engine/evaluate.ts`, `src/store/useWorksheetStore.ts`

**Qué hace:**

**`mlToMathjs.ts`**: bridge ASCIIMath → math.js (regex probadas en `MathLiveNotepad.md`). Casos cubiertos: subíndices `w_u`, fracciones, `cdot`, exponentes.

**`evaluate.ts`**:
```typescript
export function evaluateWorksheet(blocks: Block[]): Block[] {
  const sorted = [...blocks].sort((a, b) =>
    a.y !== b.y ? a.y - b.y : a.x - b.x
  );
  const scope: Record<string, unknown> = {};
  const results = new Map<string, EvalResult>();

  for (const block of sorted) {
    if (block.type !== 'math' || !block.content.trim()) {
      results.set(block.id, { status: 'empty', katexHtml: '' });
      continue;
    }
    const ascii = mlToMathjs(block.content);
    try {
      const val = math.evaluate(ascii, scope);
      const isAssign = /^\s*[A-Za-z_][A-Za-z0-9_]*\s*=/.test(ascii);
      const varName = ascii.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/)?.[1];
      const formatted = formatValue(val);              // número, unidad, fracción
      const katexStr = varName
        ? `${toLatexVar(varName)} = ${formatted}`
        : formatted;
      results.set(block.id, {
        status: isAssign ? 'assign' : 'ok',
        katexHtml: katex.renderToString(katexStr, { throwOnError: false }),
      });
    } catch (e) {
      results.set(block.id, {
        status: 'error',
        katexHtml: `<span style="color:#e74c3c">⚠ ${(e as Error).message}</span>`,
      });
    }
  }
  // Retornar blocks con results aplicados
  return blocks.map(b => ({ ...b, result: results.get(b.id) }));
}
```

**`useWorksheetStore.ts`** — implementar `evaluateAll`:
```typescript
evaluateAll: () => set(state => ({
  blocks: evaluateWorksheet(state.blocks)
}))
```

Trigger de `evaluateAll()`:
- Al salir del modo edición (blur / Escape en MathBlock)
- Al soltar un bloque arrastrado (`mouseup` en `useDrag`)
- Debounce 300ms en edición activa

**Testing:**
```
Bloque (y=100): a = 30 MPa        → a = 30 MPa  (azul)
Bloque (y=200): b = 3             → b = 3        (azul)
Bloque (y=300): c = a * b         → c = 9×10⁷ Pa (azul)
```
Mover bloque `c` arriba de `a` → resultado `c` pasa a error rojo (a, b no definidas).

---

### Step 6: TextBlock + Toolbar + Export/Import JSON
**Archivos:** `src/components/TextBlock.tsx`, `src/components/Toolbar.tsx`, `src/App.tsx`

**Qué hace:**

**`TextBlock.tsx`:** `<textarea>` con auto-resize (`rows` dinámico), sin borde, font heredada del canvas. Sin evaluación. Útil para títulos de sección y notas.

**`Toolbar.tsx`** (barra fija 48px, mismo estilo visual que la app):
```
[≡ Canvas Notepad]  [+ Ecuación]  [+ Texto]  |  [↓ Exportar]  [↑ Importar]  [Limpiar]
```
- `+ Ecuación`: `addBlock('math')` → posiciona en el centro visible del viewport
- `+ Texto`: `addBlock('text')`
- `↓ Exportar`: `JSON.stringify(blocks)` → descarga `.json`
- `↑ Importar`: `<input type="file">` hidden → lee JSON → reemplaza store → `evaluateAll()`
- `Limpiar`: `confirm()` → `clearAll()`

**Posición del nuevo bloque en el viewport:**
```typescript
const getViewportCenter = (canvasRef) => {
  const el = canvasRef.current;
  return {
    x: snap(el.scrollLeft + el.clientWidth / 2 - 160),
    y: snap(el.scrollTop  + el.clientHeight / 2 - 60),
  };
};
```

**`App.tsx`:** layout final:
```tsx
<div className="flex flex-col h-screen bg-white">
  <Toolbar canvasRef={canvasRef} />
  <div className="flex-1 overflow-auto" ref={canvasRef}>
    <Canvas />
  </div>
</div>
```

**Testing:** App completa funcional: agregar ecuaciones, texto, arrastrar, evaluar, exportar JSON, importar JSON en nueva sesión, recargar página y ver persistencia.

---

### Step 7: Integración MkDocs + GitHub Actions
**Archivos:** `.github/workflows/deploy.yml`, `mkdocs.yml`, `docs/herramientas/canvas-notepad.md`, `.gitignore`

**Qué hace:**

**`.gitignore`** — añadir:
```gitignore
math-notebook/node_modules/
docs/canvas-notepad/
```

**`.github/workflows/deploy.yml`** — insertar antes de "Deploy a GitHub Pages":
```yaml
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: math-notebook/package-lock.json

      - name: Build Canvas Notepad
        working-directory: math-notebook
        run: |
          npm ci
          npm run build
        # Vite deposita el build en docs/canvas-notepad/
        # mkdocs gh-deploy lo incluye automáticamente en el sitio
```

**`docs/herramientas/canvas-notepad.md`**:
```markdown
---
title: Canvas Notepad
hide: [navigation, toc]
---

<div style="margin: -1rem -1.2rem;">
  <iframe
    src="/canvas-notepad/"
    style="width:100%; height:calc(100vh - 60px); border:none; display:block;"
    title="Canvas Notepad">
  </iframe>
</div>
```

**`mkdocs.yml`** — en nav bajo Herramientas:
```yaml
    - Canvas Notepad: herramientas/canvas-notepad.md
```

**Testing:** Push a `main` → GitHub Actions: Node build pasa (dist generado) → MkDocs deploy pasa → `fcocarrascob.github.io/canvas-notepad/` sirve la app React → la página MkDocs muestra el iframe sin scrollbar exterior.

---

## Dependencias a instalar

```bash
# Desde la raíz del repo (después de mover math-notebook/)
cd math-notebook
npm install mathlive
# Verificar que el lock file se actualizó
```

Dependencias que ya vienen en `package.json` y se usan:
`mathjs`, `katex`, `zustand`, `lucide-react`, `tailwindcss`, `react 19`, `vite 8`, `typescript 6`

---

## Riesgos y Mitigaciones

| Riesgo | Prob. | Mitigación |
|---|---|---|
| `<math-field>` no monta en React 19 (web component) | Media | Lazy `import('mathlive')` en `useEffect`; usar `ref` para acceso imperativo al value |
| Conflicto estilos MathLive ↔ MkDocs | Ninguna | App corre en `<iframe>` — CSS completamente aislado |
| `outDir: '../docs/canvas-notepad'` falla si el dir no existe en CI | Baja | `emptyOutDir: true` en Vite lo crea; el `.gitignore` lo excluye del repo |
| Evaluación lenta con 30+ bloques al mover | Baja | Debounce 300ms; en v2: evaluación incremental desde el bloque modificado |
| localStorage excede 5MB con hojas grandes | Muy baja | Comprimir con `JSON.stringify` compacto; en v2: IndexedDB |
| `package-lock.json` no existe aún en el repo (primer push) | Media | Hacer `npm install` local antes del primer commit para generarlo |
