---
title: "MathSheet — Hoja de Cálculo"
type: tool
tags: [hoja-de-calculo, calculadora, mathjs, latex, interactivo]
created: 2026-05-06
updated: 2026-05-06
hide:
  - navigation
  - toc
---

# MathSheet — Hoja de Cálculo

**Clic izquierdo** en el canvas para crear un bloque Math. Escribe LaTeX puro y presiona **Enter** (o haz clic fuera) para renderizar y calcular. **Doble clic** en un bloque para volver a editar. Los bloques se evalúan de arriba a abajo, izquierda a derecha, compartiendo variables.

---

<div id="ms-toolbar">
  <button class="ms-btn" onclick="msAddBlock('calc')">+ Math</button>
  <button class="ms-btn" onclick="msAddBlock('text')">+ Texto</button>
  <button class="ms-btn" onclick="msAddBlock('section')">+ Sección</button>
  <div class="ms-sep"></div>
  <button class="ms-btn" onclick="msSaveJSON()" title="Exportar hoja como JSON">⬇ JSON</button>
  <button class="ms-btn" onclick="document.getElementById('ms-file-inp').click()" title="Importar hoja desde JSON">⬆ JSON</button>
  <input type="file" id="ms-file-inp" accept=".json" style="display:none" onchange="msLoadJSON(this)">
  <button class="ms-btn" onclick="msClear()">Limpiar</button>
  <div class="ms-sep"></div>
  <button class="ms-btn" onclick="msLoadExample()" title="Cargar hoja de ejemplo">Ejemplo</button>
  <div class="ms-sep"></div>
  <label class="ms-label">
    <input type="checkbox" id="ms-snap-cb" checked onchange="msToggleSnap(this.checked)">
    Cuadrícula
  </label>
</div>

<div id="ms-wrap">
  <div id="ms-canvas"></div>
</div>

<style>
/* ── Toolbar ─────────────────────────────────────────────────────── */
#ms-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  padding: 8px 12px;
  background: var(--md-default-bg-color, #fff);
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 8px 8px 0 0;
  position: sticky;
  top: var(--md-header-height, 3.5rem);
  z-index: 50;
}
.ms-btn {
  padding: 4px 12px;
  border: none;
  border-radius: 4px;
  background: rgba(0,0,0,0.07);
  color: var(--md-default-fg-color, #333);
  cursor: pointer;
  font-size: 0.82rem;
  transition: background 0.15s;
  white-space: nowrap;
}
.ms-btn:hover { background: rgba(0,0,0,0.13); }
.ms-sep {
  width: 1px;
  height: 20px;
  background: rgba(0,0,0,0.15);
  flex-shrink: 0;
}
.ms-label {
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  user-select: none;
  color: var(--md-default-fg-color, #333);
}

/* ── Canvas wrapper ──────────────────────────────────────────────── */
#ms-wrap {
  width: 100%;
  height: 75vh;
  min-height: 500px;
  overflow: auto;
  border: 1px solid rgba(0,0,0,0.12);
  border-top: none;
  border-radius: 0 0 8px 8px;
}

/* ── Canvas ──────────────────────────────────────────────────────── */
#ms-canvas {
  position: relative;
  min-width: 3000px;
  min-height: 2000px;
  background-color: var(--md-default-bg-color, #fff);
  background-image:
    linear-gradient(rgba(180,180,180,0.22) 1px, transparent 1px),
    linear-gradient(90deg, rgba(180,180,180,0.22) 1px, transparent 1px);
  background-size: 40px 40px;
  cursor: crosshair;
}

/* ── Block ───────────────────────────────────────────────────────── */
.ms-block {
  position: absolute;
  min-width: 200px;
  background: var(--md-default-bg-color, #fff);
  border: 1px solid rgba(0,0,0,0.15);
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.10);
  box-sizing: border-box;
}
.ms-block[data-type="calc"]    { border-left: 3px solid #2980b9; }
.ms-block[data-type="text"]    { border-left: 3px solid #888; }
.ms-block[data-type="section"] { border-left: 3px solid #e67e22; background: rgba(230,126,34,0.03); }
.ms-block[data-error="1"]      { outline: 2px solid rgba(231,76,60,0.5); }

/* ── Block header ────────────────────────────────────────────────── */
.ms-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  background: rgba(0,0,0,0.03);
  border-radius: 5px 5px 0 0;
  cursor: grab;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  user-select: none;
}
.ms-block-header:active { cursor: grabbing; }
.ms-block-type-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #999;
}
.ms-close-btn {
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 3px;
  background: transparent;
  color: #bbb;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  opacity: 0;
  transition: opacity 0.15s, color 0.15s, background 0.15s;
  flex-shrink: 0;
}
.ms-block:hover .ms-close-btn { opacity: 1; }
.ms-close-btn:hover { background: rgba(231,76,60,0.15); color: #e74c3c; }

/* ── Block body ──────────────────────────────────────────────────── */
.ms-block-body {
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* ── Edit / view layer switching ─────────────────────────────────── */
.ms-block[data-mode="view"] .ms-edit-layer { display: none; }
.ms-block[data-mode="edit"] .ms-view-layer { display: none; }

/* ── Edit layer ──────────────────────────────────────────────────── */
.ms-edit-layer {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

/* ── LaTeX textarea ──────────────────────────────────────────────── */
.ms-latex-input {
  width: 100%;
  min-height: 52px;
  border: 1px solid rgba(0,0,0,0.18);
  border-radius: 4px;
  padding: 6px 8px;
  font-family: 'Cascadia Code', 'Fira Code', 'Courier New', monospace;
  font-size: 0.85rem;
  resize: none;
  background: var(--md-code-bg-color, #f5f5f5);
  box-sizing: border-box;
  color: inherit;
  overflow: hidden;
  line-height: 1.55;
}
.ms-latex-input:focus {
  border-color: #2980b9;
  box-shadow: 0 0 0 2px rgba(41,128,185,0.15);
  outline: none;
}
.ms-input-hint {
  font-size: 0.70rem;
  color: #bbb;
  padding: 0 2px;
}

/* ── View layer ──────────────────────────────────────────────────── */
.ms-view-layer {
  display: flex;
  flex-direction: column;
  gap: 3px;
  position: relative;
  border-radius: 4px;
  padding: 2px 4px;
  cursor: default;
  transition: background 0.12s;
}
.ms-view-layer:hover { background: rgba(41,128,185,0.05); }
.ms-view-layer::after {
  content: '✎';
  position: absolute;
  top: 4px;
  right: 6px;
  font-size: 0.72rem;
  color: #aaa;
  opacity: 0;
  transition: opacity 0.15s;
  pointer-events: none;
}
.ms-view-layer:hover::after { opacity: 1; }

/* ── Rendered MathJax container ──────────────────────────────────── */
.ms-rendered {
  padding: 2px 4px;
  min-height: 32px;
  display: flex;
  align-items: center;
  overflow-x: auto;
  flex-wrap: wrap;
}
.ms-rendered .MathJax { max-width: 100%; }

/* ── Result ──────────────────────────────────────────────────────── */
.ms-result {
  padding: 3px 10px;
  min-height: 28px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  font-size: 0.9rem;
  line-height: 1.5;
  flex-wrap: wrap;
  font-variant-numeric: tabular-nums;
}
.ms-result-empty  { color: #ccc; font-style: italic; font-size: 0.78rem; }
.ms-result-assign { border-left: 3px solid #2980b9; background: rgba(41,128,185,0.06); }
.ms-result-ok     { border-left: 3px solid #27ae60; background: rgba(39,174,96,0.06); }
.ms-result-err    {
  border-left: 3px solid #e74c3c;
  background: rgba(231,76,60,0.06);
  color: #c0392b;
  font-family: monospace;
  font-size: 0.78rem;
}

/* ── Text textarea ───────────────────────────────────────────────── */
.ms-text-area {
  width: 100%;
  min-height: 80px;
  border: 1px solid rgba(0,0,0,0.14);
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 0.88rem;
  font-family: Georgia, serif;
  resize: none;
  background: var(--md-code-bg-color, #f5f5f5);
  box-sizing: border-box;
  color: inherit;
  overflow: hidden;
}
.ms-text-area:focus { outline: none; border-color: #888; }

/* ── Section input ───────────────────────────────────────────────── */
.ms-section-input {
  width: 100%;
  font-size: 1.05rem;
  font-weight: 700;
  border: none;
  border-bottom: 2px solid #e67e22;
  background: transparent;
  color: inherit;
  padding: 4px 2px;
  outline: none;
  box-sizing: border-box;
  letter-spacing: 0.02em;
}

/* ── Resize handle ───────────────────────────────────────────────── */
.ms-resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 16px;
  height: 16px;
  cursor: se-resize;
  opacity: 0;
  transition: opacity 0.15s;
  background:
    linear-gradient(135deg, transparent 5px,  #aaa 5px,  #aaa  6px, transparent  6px),
    linear-gradient(135deg, transparent 9px,  #aaa 9px,  #aaa 10px, transparent 10px),
    linear-gradient(135deg, transparent 13px, #aaa 13px, #aaa 14px, transparent 14px);
}
.ms-block:hover .ms-resize-handle { opacity: 1; }

/* ── No-snap canvas cursor ───────────────────────────────────────── */
#ms-canvas.no-snap { cursor: crosshair; }

/* ── Dark mode ───────────────────────────────────────────────────── */
[data-md-color-scheme="slate"] #ms-canvas {
  background-image:
    linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px);
  background-size: 40px 40px;
}
[data-md-color-scheme="slate"] .ms-block {
  border-color: rgba(255,255,255,0.12);
  box-shadow: 0 2px 6px rgba(0,0,0,0.4);
}
[data-md-color-scheme="slate"] .ms-block-header {
  background: rgba(255,255,255,0.04);
  border-color: rgba(255,255,255,0.07);
}
[data-md-color-scheme="slate"] .ms-latex-input,
[data-md-color-scheme="slate"] .ms-text-area {
  border-color: rgba(255,255,255,0.2);
}
[data-md-color-scheme="slate"] #ms-toolbar,
[data-md-color-scheme="slate"] #ms-wrap {
  border-color: rgba(255,255,255,0.1);
}
</style>

<script type="module">
// ── State ─────────────────────────────────────────────────────────
let blockCounter = 0;
let snapEnabled  = true;
let evalTimer    = null;
const GRID       = 40;

// ── Expose toolbar actions to global scope ────────────────────────
window.msAddBlock    = msAddBlock;
window.msSaveJSON    = msSaveJSON;
window.msLoadJSON    = msLoadJSON;
window.msClear       = msClear;
window.msLoadExample = msLoadExample;
window.msToggleSnap  = msToggleSnap;

// ── LaTeX → math.js conversion ────────────────────────────────────
// Handles the most common structural-engineering LaTeX patterns.
function latexToMathjs(latex) {
  let s = latex.trim();

  // Strip optional math delimiters if user typed them
  s = s.replace(/^\$\$|\$\$$/g, '').replace(/^\$|\$$/g, '').trim();

  // \frac{num}{den} → (num)/(den)   — iterate to resolve nesting
  for (let i = 0; i < 8; i++) {
    s = s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)');
  }

  // \sqrt[n]{x} → nthRoot(x,n)   — must precede plain \sqrt
  for (let i = 0; i < 4; i++) {
    s = s.replace(/\\sqrt\s*\[([^\]]*)\]\s*\{([^{}]*)\}/g, 'nthRoot($2,$1)');
  }
  // \sqrt{x} → sqrt(x)
  for (let i = 0; i < 4; i++) {
    s = s.replace(/\\sqrt\s*\{([^{}]*)\}/g, 'sqrt($1)');
  }

  // Superscripts  ^{expr} → ^(expr)
  s = s.replace(/\^\s*\{([^{}]*)\}/g, '^($1)');

  // Subscript variable names: A_{s1} → As1,  f_c → fc
  s = s.replace(/([a-zA-Z])\s*_\s*\{([a-zA-Z0-9]+)\}/g, '$1$2');
  s = s.replace(/([a-zA-Z])\s*_\s*([a-zA-Z0-9])/g, '$1$2');

  // \left / \right delimiters
  s = s.replace(/\\left\s*\(/g, '(').replace(/\\right\s*\)/g, ')');
  s = s.replace(/\\left\s*\[/g, '(').replace(/\\right\s*\]/g, ')');
  s = s.replace(/\\left\s*\{/g, '(').replace(/\\right\s*\}/g, ')');

  // Trig & hyperbolic functions
  s = s.replace(
    /\\(sin|cos|tan|cot|sec|csc|arcsin|arccos|arctan|sinh|cosh|tanh|asin|acos|atan)\b/g,
    '$1'
  );

  // Logarithms / exp
  s = s.replace(/\\ln\b/g, 'log');
  s = s.replace(/\\log\b/g, 'log10');
  s = s.replace(/\\exp\b/g, 'exp');

  // Constants
  s = s.replace(/\\pi\b/g, 'pi');
  s = s.replace(/\\infty\b/g, 'Infinity');

  // Operators
  s = s.replace(/\\cdot\b/g, '*');
  s = s.replace(/\\times\b/g, '*');
  s = s.replace(/\\div\b/g, '/');
  s = s.replace(/:=/g, '=');

  // Decorators that wrap a variable: \bar{x} → x, etc.
  s = s.replace(/\\(?:bar|hat|vec|tilde|dot|overline|underline)\s*\{([^{}]*)\}/g, '$1');

  // Text annotations: \text{...} → (remove)
  s = s.replace(/\\(?:text|mathrm|mathbf|mathit|mathsf|mbox)\s*\{[^{}]*\}/g, '');

  // Remove remaining unknown LaTeX commands
  s = s.replace(/\\[a-zA-Z]+\*/g, '');
  s = s.replace(/\\[a-zA-Z]+/g, '');

  // Remaining braces → parentheses
  s = s.replace(/\{/g, '(').replace(/\}/g, ')');

  // Implicit multiplication
  s = s.replace(/(\d)\s*\(/g, '$1*(');      // 2(x+1) → 2*(x+1)
  s = s.replace(/\)\s*\(/g, ')*(');          // )( → )*(
  s = s.replace(/(\d)([a-zA-Z])/g, '$1*$2'); // 2x → 2*x

  return s.trim();
}

// ── Format a math.js result value ────────────────────────────────
function fmtValue(v) {
  try {
    if (typeof v === 'number') {
      const rounded = parseFloat(v.toPrecision(6));
      return rounded.toLocaleString('es-CL', { maximumFractionDigits: 4 });
    }
    if (math.typeOf(v) === 'Unit') {
      const num = v.toNumber();
      const r   = parseFloat(num.toPrecision(6));
      return r.toLocaleString('es-CL', { maximumFractionDigits: 4 }) + '\u00a0' + v.formatUnits();
    }
    if (typeof v === 'boolean') return v ? 'verdadero' : 'falso';
    return math.format(v, { precision: 6 });
  } catch(e) { return String(v); }
}

// ── Evaluation engine ─────────────────────────────────────────────
function scheduleEval() {
  clearTimeout(evalTimer);
  evalTimer = setTimeout(evaluateSheet, 250);
}

function evaluateSheet() {
  if (typeof math === 'undefined') return;

  // Sort: top → bottom, then left → right
  const calcBlocks = [...document.querySelectorAll('.ms-block[data-type="calc"]')]
    .sort((a, b) => {
      const dy = (parseInt(a.style.top) || 0) - (parseInt(b.style.top) || 0);
      return dy !== 0 ? dy : (parseInt(a.style.left) || 0) - (parseInt(b.style.left) || 0);
    });

  const scope = {};

  for (const block of calcBlocks) {
    const latex    = (block.dataset.latex || '').trim();
    const resultEl = block.querySelector('.ms-result');
    if (!resultEl) continue;

    if (!latex) {
      resultEl.className   = 'ms-result ms-result-empty';
      resultEl.textContent = '—';
      block.dataset.error  = '';
      continue;
    }

    const expr = latexToMathjs(latex);
    try {
      const result   = math.evaluate(expr, scope);
      const isAssign = /^\s*[A-Za-z_][A-Za-z0-9_]*\s*=/.test(expr);
      if (isAssign) {
        const varName            = expr.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/)[1];
        resultEl.className       = 'ms-result ms-result-assign';
        resultEl.textContent     = varName + ' = ' + fmtValue(result);
      } else {
        resultEl.className       = 'ms-result ms-result-ok';
        resultEl.textContent     = '= ' + fmtValue(result);
      }
      block.dataset.error = '';
    } catch(e) {
      resultEl.className   = 'ms-result ms-result-err';
      resultEl.textContent = '⚠ ' + e.message;
      block.dataset.error  = '1';
    }
  }
}

// ── Render LaTeX via MathJax ──────────────────────────────────────
function renderBlock(block, latex) {
  const el = block.querySelector('.ms-rendered');
  if (!el) return;
  if (!latex.trim()) {
    el.innerHTML = '<span style="color:#ccc;font-style:italic;font-size:0.78rem">vacío — doble clic para editar</span>';
    return;
  }
  // Use display math (\[…\]) for expressions with multi-line constructs;
  // inline math (\(…\)) for simpler expressions.
  const isDisplay = /\\frac|\\int|\\sum|\\prod|\\lim|\\sqrt\s*\{/.test(latex);
  el.innerHTML = isDisplay ? '\\[' + latex + '\\]' : '\\(' + latex + '\\)';
  if (window.MathJax && MathJax.typesetPromise) {
    MathJax.typesetPromise([el]);
  }
}

// ── Enter / exit edit mode ────────────────────────────────────────
function enterEditMode(block) {
  block.dataset.mode = 'edit';
  const ta = block.querySelector('.ms-latex-input');
  if (ta) {
    ta.value = block.dataset.latex || '';
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
    setTimeout(() => { ta.focus(); ta.select(); }, 30);
  }
}

function commitBlock(block) {
  const ta = block.querySelector('.ms-latex-input');
  if (!ta) return;
  block.dataset.latex = ta.value.trim();
  block.dataset.mode  = 'view';
  renderBlock(block, block.dataset.latex);
  scheduleEval();
  saveSheet();
}

// ── Drag ──────────────────────────────────────────────────────────
function initDrag(block) {
  const header = block.querySelector('.ms-block-header');
  header.addEventListener('mousedown', function(e) {
    if (e.target.closest('button')) return;
    e.preventDefault();
    const startX   = e.clientX;
    const startY   = e.clientY;
    const origLeft = parseInt(block.style.left) || 0;
    const origTop  = parseInt(block.style.top)  || 0;

    function onMove(e) {
      block.style.left = Math.max(0, origLeft + e.clientX - startX) + 'px';
      block.style.top  = Math.max(0, origTop  + e.clientY - startY) + 'px';
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
      if (snapEnabled) {
        block.style.left = (Math.round(parseInt(block.style.left) / GRID) * GRID) + 'px';
        block.style.top  = (Math.round(parseInt(block.style.top)  / GRID) * GRID) + 'px';
      }
      saveSheet();
      evaluateSheet();
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
  });
}

// ── Resize ────────────────────────────────────────────────────────
function initResize(block) {
  const handle = block.querySelector('.ms-resize-handle');
  handle.addEventListener('mousedown', function(e) {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startW = block.offsetWidth;
    function onMove(e) {
      block.style.width = Math.max(200, startW + e.clientX - startX) + 'px';
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
      saveSheet();
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
  });
}

// ── Block creation ────────────────────────────────────────────────
function createBlock(type, x, y, opts) {
  opts = opts || {};
  const snapX    = snapEnabled ? Math.round(x / GRID) * GRID : x;
  const snapY    = snapEnabled ? Math.round(y / GRID) * GRID : y;
  const defaultW = type === 'section' ? 560 : 360;
  const w        = opts.w || defaultW;

  const block        = document.createElement('div');
  block.id           = opts.id || ('ms-b-' + (++blockCounter));
  block.className    = 'ms-block';
  block.dataset.type = type;
  block.style.left   = snapX + 'px';
  block.style.top    = snapY + 'px';
  block.style.width  = w + 'px';

  // Header
  const header     = document.createElement('div');
  header.className = 'ms-block-header';
  const typeLabels = { calc: 'Math', text: 'Texto', section: 'Sección' };
  const lbl        = document.createElement('span');
  lbl.className    = 'ms-block-type-label';
  lbl.textContent  = typeLabels[type] || type;
  const closeBtn     = document.createElement('button');
  closeBtn.className = 'ms-close-btn';
  closeBtn.innerHTML = '&times;';
  closeBtn.title     = 'Eliminar bloque';
  closeBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    block.remove();
    saveSheet();
    evaluateSheet();
  });
  header.appendChild(lbl);
  header.appendChild(closeBtn);

  // Body
  const body     = document.createElement('div');
  body.className = 'ms-block-body';

  if (type === 'calc') {
    const latex        = opts.latex !== undefined ? opts.latex : (opts.expr || '');
    block.dataset.latex = latex;
    block.dataset.mode  = opts.mode || (latex ? 'view' : 'edit');

    // ── Edit layer ──
    const editLayer     = document.createElement('div');
    editLayer.className = 'ms-edit-layer';

    const ta       = document.createElement('textarea');
    ta.className   = 'ms-latex-input';
    ta.placeholder = 'LaTeX, p.ej.  M_u = \\frac{w_u \\cdot L^2}{8}';
    ta.value       = latex;
    ta.rows        = 2;

    ta.addEventListener('input', function() {
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    });
    ta.addEventListener('blur', function() {
      commitBlock(block);
    });
    ta.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        ta.blur(); // commit
      }
      if (e.key === 'Escape') {
        ta.value = block.dataset.latex || ''; // revert
        ta.blur();
      }
    });

    const hint     = document.createElement('small');
    hint.className = 'ms-input-hint';
    hint.textContent = 'Enter para confirmar · Shift+Enter nueva línea · Esc cancela';

    editLayer.appendChild(ta);
    editLayer.appendChild(hint);

    // ── View layer ──
    const viewLayer     = document.createElement('div');
    viewLayer.className = 'ms-view-layer';
    viewLayer.title     = 'Doble clic para editar';

    const rendered      = document.createElement('div');
    rendered.className  = 'ms-rendered';

    const resultEl      = document.createElement('div');
    resultEl.className  = 'ms-result ms-result-empty';
    resultEl.textContent = '—';

    viewLayer.addEventListener('dblclick', function(e) {
      e.stopPropagation();
      enterEditMode(block);
    });

    viewLayer.appendChild(rendered);
    viewLayer.appendChild(resultEl);

    body.appendChild(editLayer);
    body.appendChild(viewLayer);

    if (latex) setTimeout(() => renderBlock(block, latex), 60);

  } else if (type === 'text') {
    const ta       = document.createElement('textarea');
    ta.className   = 'ms-text-area';
    ta.placeholder = 'Texto libre…';
    if (opts.text) ta.value = opts.text;
    ta.addEventListener('input', function() {
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
      saveSheet();
    });
    body.appendChild(ta);

  } else if (type === 'section') {
    const inp       = document.createElement('input');
    inp.type        = 'text';
    inp.className   = 'ms-section-input';
    inp.placeholder = '§ Nombre de sección…';
    if (opts.text) inp.value = opts.text;
    inp.addEventListener('input', saveSheet);
    body.appendChild(inp);
  }

  // Resize handle
  const rh     = document.createElement('div');
  rh.className = 'ms-resize-handle';

  block.appendChild(header);
  block.appendChild(body);
  block.appendChild(rh);

  document.getElementById('ms-canvas').appendChild(block);
  initDrag(block);
  initResize(block);
  return block;
}

// ── Canvas left-click → create Math block ─────────────────────────
document.getElementById('ms-canvas').addEventListener('click', function(e) {
  if (e.target.closest('.ms-block')) return; // click was on a block
  const rect = this.getBoundingClientRect();
  const x    = e.clientX - rect.left;
  const y    = e.clientY - rect.top;
  const block = createBlock('calc', x, y, { mode: 'edit' });
  // Focus the textarea immediately
  const ta = block.querySelector('.ms-latex-input');
  if (ta) setTimeout(() => ta.focus(), 40);
  saveSheet();
});

// ── Toolbar: add block ────────────────────────────────────────────
function msAddBlock(type) {
  const wrap  = document.getElementById('ms-wrap');
  const x     = Math.round(wrap.scrollLeft / GRID) * GRID + GRID;
  const y     = Math.round(wrap.scrollTop  / GRID) * GRID + GRID;
  const block = createBlock(type, x, y, { mode: type === 'calc' ? 'edit' : undefined });
  const focus = block.querySelector('textarea, input[type="text"]');
  if (focus) setTimeout(() => focus.focus(), 60);
  saveSheet();
}

// ── Snap toggle ───────────────────────────────────────────────────
function msToggleSnap(val) {
  snapEnabled = val;
  document.getElementById('ms-canvas').classList.toggle('no-snap', !val);
  saveSheet();
}

// ── Persistence: save ─────────────────────────────────────────────
function saveSheet() {
  const state = {
    counter: blockCounter,
    snap:    snapEnabled,
    blocks:  [...document.querySelectorAll('.ms-block')].map(b => {
      const ta  = b.querySelector('textarea.ms-text-area');
      const inp = b.querySelector('input[type="text"].ms-section-input');
      return {
        id:    b.id,
        type:  b.dataset.type,
        x:     parseInt(b.style.left) || 0,
        y:     parseInt(b.style.top)  || 0,
        w:     b.offsetWidth,
        latex: b.dataset.latex || '',
        text:  ta ? ta.value : (inp ? inp.value : '')
      };
    })
  };
  try { localStorage.setItem('mathsheet-v1', JSON.stringify(state)); } catch(e) {}
}

// ── Persistence: load ─────────────────────────────────────────────
function loadSheet(state) {
  if (!state || !Array.isArray(state.blocks)) return;
  document.getElementById('ms-canvas').querySelectorAll('.ms-block').forEach(b => b.remove());

  blockCounter = state.counter || 0;
  snapEnabled  = state.snap !== false;
  const snapCb = document.getElementById('ms-snap-cb');
  if (snapCb) snapCb.checked = snapEnabled;

  for (const bs of state.blocks) {
    // Backward-compat: old format used 'expr' instead of 'latex'
    const latex = bs.latex !== undefined ? bs.latex : (bs.expr || '');
    const block = createBlock(bs.type, bs.x, bs.y, {
      id: bs.id, w: bs.w, latex, text: bs.text
    });
    block.id = bs.id;
  }

  // Render all calc blocks, then evaluate
  setTimeout(() => {
    const toRender = [];
    document.querySelectorAll('.ms-block[data-type="calc"]').forEach(b => {
      const l  = b.dataset.latex || '';
      const el = b.querySelector('.ms-rendered');
      if (el && l) {
        const isDisplay = /\\frac|\\int|\\sum|\\prod|\\lim|\\sqrt\s*\{/.test(l);
        el.innerHTML = isDisplay ? '\\[' + l + '\\]' : '\\(' + l + '\\)';
        toRender.push(el);
      }
    });
    if (window.MathJax && MathJax.typesetPromise && toRender.length) {
      MathJax.typesetPromise(toRender).then(() => evaluateSheet());
    } else {
      evaluateSheet();
    }
  }, 80);
}

// ── Export JSON ───────────────────────────────────────────────────
function msSaveJSON() {
  saveSheet();
  const raw  = localStorage.getItem('mathsheet-v1') || '{}';
  const blob = new Blob([raw], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'mathsheet.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── Import JSON ───────────────────────────────────────────────────
function msLoadJSON(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const state = JSON.parse(e.target.result);
      loadSheet(state);
      localStorage.setItem('mathsheet-v1', e.target.result);
    } catch(err) {
      alert('Error al leer el archivo JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
  input.value = '';
}

// ── Clear canvas ──────────────────────────────────────────────────
function msClear() {
  if (!confirm('¿Limpiar el canvas? El estado actual se perderá.')) return;
  document.getElementById('ms-canvas').querySelectorAll('.ms-block').forEach(b => b.remove());
  blockCounter = 0;
  localStorage.removeItem('mathsheet-v1');
}

// ── Example sheet ─────────────────────────────────────────────────
function msLoadExample() {
  if (document.querySelectorAll('.ms-block').length > 0) {
    if (!confirm('¿Reemplazar el canvas actual con el ejemplo?')) return;
  }
  document.getElementById('ms-canvas').querySelectorAll('.ms-block').forEach(b => b.remove());
  blockCounter = 0;

  const items = [
    { type: 'section', x:  40, y:  40,  text:  '§1 Datos del Problema' },
    { type: 'calc',    x:  40, y: 120,  latex: 'L = 6' },
    { type: 'calc',    x: 460, y: 120,  latex: 'w_D = 15' },
    { type: 'calc',    x: 880, y: 120,  latex: 'w_L = 10' },
    { type: 'section', x:  40, y: 240,  text:  '§2 Combinación de Cargas ACI 318' },
    { type: 'calc',    x:  40, y: 320,  latex: 'w_u = 1.2 \\cdot w_D + 1.6 \\cdot w_L' },
    { type: 'section', x:  40, y: 440,  text:  '§3 Solicitaciones Máximas' },
    { type: 'calc',    x:  40, y: 520,  latex: 'M_u = \\frac{w_u \\cdot L^2}{8}' },
    { type: 'calc',    x: 480, y: 520,  latex: 'V_u = \\frac{w_u \\cdot L}{2}' },
    { type: 'text',    x:  40, y: 680,  text:  'Viga simplemente apoyada con carga uniforme.\nVerificar: sección tensión-controlada (ACI §21.2.2).' },
  ];
  for (const item of items) {
    createBlock(item.type, item.x, item.y, { latex: item.latex, text: item.text });
  }
  setTimeout(evaluateSheet, 300);
  saveSheet();
}

// ── Initialisation ────────────────────────────────────────────────
function init() {
  const raw = localStorage.getItem('mathsheet-v1');
  if (raw) {
    try {
      const state = JSON.parse(raw);
      if (state.blocks && state.blocks.length > 0) { loadSheet(state); return; }
    } catch(e) {}
  }
  msLoadExample();
}

// Wait for math.js global (loaded by MkDocs CDN) then start
(function waitForMath() {
  if (typeof math !== 'undefined') { init(); return; }
  setTimeout(waitForMath, 80);
})();
</script>

