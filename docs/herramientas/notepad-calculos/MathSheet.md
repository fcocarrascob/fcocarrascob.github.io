---
title: "MathSheet — Hoja de Cálculo"
type: tool
tags: [hoja-de-calculo, calculadora, mathlive, mathjs, interactivo]
created: 2026-05-06
updated: 2026-05-06
hide:
  - navigation
  - toc
---

# MathSheet — Hoja de Cálculo

Posiciona **bloques de cálculo** en el canvas arrastrándolos por su cabecera. Las expresiones se evalúan de arriba hacia abajo, izquierda a derecha, compartiendo un scope de [math.js](https://mathjs.org/). El estado se guarda automáticamente en el navegador.

---

<div id="ms-toolbar">
  <button class="ms-btn" onclick="msAddBlock('calc')">+ Cálculo</button>
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
  <button class="ms-btn" id="ms-btn-kb" onclick="msToggleKb()" title="Activar / desactivar teclado virtual MathLive">⌨ Teclado</button>
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
.ms-btn:hover  { background: rgba(0,0,0,0.13); }
.ms-btn.active { background: #2980b9; color: #fff; }
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
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* ── Math field ──────────────────────────────────────────────────── */
math-field.ms-mf {
  width: 100%;
  min-height: 44px;
  border: 1px solid rgba(0,0,0,0.18);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 1rem;
  background: var(--md-code-bg-color, #f5f5f5);
  box-sizing: border-box;
}
math-field.ms-mf:focus-within {
  border-color: #2980b9;
  box-shadow: 0 0 0 2px rgba(41,128,185,0.15);
  outline: none;
}

/* ── Result ──────────────────────────────────────────────────────── */
.ms-result {
  padding: 3px 10px;
  min-height: 30px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  font-size: 0.92rem;
  line-height: 1.6;
  flex-wrap: wrap;
}
.ms-result-empty  { color: #ccc; font-style: italic; font-size: 0.8rem; }
.ms-result-assign { border-left: 3px solid #2980b9; background: rgba(41,128,185,0.06); }
.ms-result-ok     { border-left: 3px solid #27ae60; background: rgba(39,174,96,0.06); }
.ms-result-err    {
  border-left: 3px solid #e74c3c;
  background: rgba(231,76,60,0.06);
  color: #c0392b;
  font-family: monospace;
  font-size: 0.8rem;
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
[data-md-color-scheme="slate"] math-field.ms-mf {
  border-color: rgba(255,255,255,0.2);
  color: var(--md-default-fg-color);
}
[data-md-color-scheme="slate"] .ms-text-area {
  border-color: rgba(255,255,255,0.15);
}
[data-md-color-scheme="slate"] #ms-toolbar {
  border-color: rgba(255,255,255,0.1);
}
[data-md-color-scheme="slate"] #ms-wrap {
  border-color: rgba(255,255,255,0.1);
}
</style>

<script type="module">
// ── Load MathLive ─────────────────────────────────────────────────
import 'https://cdn.jsdelivr.net/npm/mathlive';
await customElements.whenDefined('math-field');

// ── State ─────────────────────────────────────────────────────────
let blockCounter = 0;
let snapEnabled  = true;
let kbEnabled    = false;
let evalTimer    = null;
const GRID       = 40;

// ── Expose toolbar actions to global scope ────────────────────────
window.msAddBlock    = msAddBlock;
window.msSaveJSON    = msSaveJSON;
window.msLoadJSON    = msLoadJSON;
window.msClear       = msClear;
window.msLoadExample = msLoadExample;
window.msToggleKb    = msToggleKb;
window.msToggleSnap  = msToggleSnap;

// ── ASCIIMath → math.js conversion ───────────────────────────────
// MathLive outputs ASCII-Math; this converts subscript forms and
// operators to valid math.js syntax.
function asciiToMathjs(ascii) {
  return ascii
    .replace(/([a-zA-Z])_\(([a-zA-Z0-9']+)\)/g, '$1$2')   // w_(u) → wu
    .replace(/([a-zA-Z])_\{([a-zA-Z0-9']+)\}/g, '$1$2')   // w_{u} → wu
    .replace(/([a-zA-Z])_([a-zA-Z0-9])/g,       '$1$2')   // w_u   → wu
    .replace(/\bcdot\b/g, '*')                             // \cdot → *
    .replace(/:=/g, '=')                                   // :=    → =
    .trim();
}

// ── Format helpers ────────────────────────────────────────────────
function fmtValue(v) {
  try {
    if (typeof v === 'number') {
      return v.toLocaleString('es-CL', { maximumFractionDigits: 4 });
    }
    if (math.typeOf(v) === 'Unit') {
      return v.toNumber().toLocaleString('es-CL', { maximumFractionDigits: 4 }) +
             '\u00a0' + v.formatUnits();
    }
    if (typeof v === 'boolean') return v ? 'verdadero' : 'falso';
    return math.format(v, { precision: 6 });
  } catch(e) { return String(v); }
}

// Convert math.js variable name to LaTeX subscript form:
// wu → w_{u},  Mu → M_{u},  As1 → A_{s1}
function varLatex(name) {
  let m;
  m = name.match(/^([A-Za-z]+?)([0-9]+)$/);
  if (m) return m[1] + '_{' + m[2] + '}';
  m = name.match(/^([a-z])([A-Z][a-z]*)$/);
  if (m) return m[1] + '_{' + m[2] + '}';
  m = name.match(/^([A-Z][a-z]*)([A-Z][a-z]*)$/);
  if (m && m[1].length <= 2) return m[1] + '_{' + m[2] + '}';
  return name;
}

function buildResultLatex(ascii, val) {
  const m = ascii.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/);
  const valStr = fmtValue(val);
  return m
    ? '\\(' + varLatex(m[1]) + ' = ' + valStr + '\\)'
    : '\\(' + valStr + '\\)';
}

// ── Evaluation engine ─────────────────────────────────────────────
function scheduleEval() {
  clearTimeout(evalTimer);
  evalTimer = setTimeout(evaluateSheet, 300);
}

function evaluateSheet() {
  if (typeof math === 'undefined') return;

  // Sort calc blocks: top first, then left-to-right within same row
  const calcBlocks = [...document.querySelectorAll('.ms-block[data-type="calc"]')]
    .sort((a, b) => {
      const dy = (parseInt(a.style.top)  || 0) - (parseInt(b.style.top)  || 0);
      return dy !== 0 ? dy : (parseInt(a.style.left) || 0) - (parseInt(b.style.left) || 0);
    });

  const scope     = {};
  const toTypeset = [];

  for (const block of calcBlocks) {
    const mf  = block.querySelector('math-field');
    const res = block.querySelector('.ms-result');
    if (!mf || !res) continue;

    let ascii = '';
    try { ascii = asciiToMathjs(mf.getValue('ascii-math') || ''); } catch(e) {}

    if (!ascii.trim()) {
      res.className = 'ms-result ms-result-empty';
      res.innerHTML = '—';
      block.dataset.error = '';
      continue;
    }

    try {
      const result   = math.evaluate(ascii, scope);
      const isAssign = /^\s*[A-Za-z_][A-Za-z0-9_]*\s*=/.test(ascii);
      res.className  = 'ms-result ' + (isAssign ? 'ms-result-assign' : 'ms-result-ok');
      res.innerHTML  = '<span class="arithmatex">' + buildResultLatex(ascii, result) + '</span>';
      block.dataset.error = '';
      toTypeset.push(res);
    } catch(e) {
      res.className   = 'ms-result ms-result-err';
      res.textContent = '⚠ ' + e.message;
      block.dataset.error = '1';
    }
  }

  if (window.MathJax && MathJax.typesetPromise && toTypeset.length) {
    MathJax.typesetPromise(toTypeset);
  }
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
      evaluateSheet(); // reorder may change results
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
  const defaultW = (type === 'section') ? 560 : 400;
  const w        = opts.w || defaultW;

  const block        = document.createElement('div');
  block.id           = opts.id || ('ms-b-' + (++blockCounter));
  block.className    = 'ms-block';
  block.dataset.type = type;
  block.style.left   = snapX + 'px';
  block.style.top    = snapY + 'px';
  block.style.width  = w + 'px';

  // ── Header ──
  const header    = document.createElement('div');
  header.className = 'ms-block-header';

  const typeLabels = { calc: 'Cálculo', text: 'Texto', section: 'Sección' };
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

  // ── Body ──
  const body     = document.createElement('div');
  body.className = 'ms-block-body';

  if (type === 'calc') {
    const mf     = document.createElement('math-field');
    mf.className = 'ms-mf';
    mf.setAttribute('virtual-keyboard-mode', kbEnabled ? 'onfocus' : 'manual');
    if (opts.expr) mf.value = opts.expr;

    const res     = document.createElement('div');
    res.className = 'ms-result ms-result-empty';
    res.innerHTML = '—';

    mf.addEventListener('input',  scheduleEval);
    mf.addEventListener('change', scheduleEval);

    body.appendChild(mf);
    body.appendChild(res);

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

  // ── Resize handle ──
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

// ── Toolbar: add block ────────────────────────────────────────────
function msAddBlock(type) {
  const wrap  = document.getElementById('ms-wrap');
  const x     = Math.round(wrap.scrollLeft / GRID) * GRID + GRID;
  const y     = Math.round(wrap.scrollTop  / GRID) * GRID + GRID;
  const block = createBlock(type, x, y);
  const focus = block.querySelector('math-field, textarea, input');
  if (focus) setTimeout(() => focus.focus(), 60);
  saveSheet();
}

// ── Snap toggle ───────────────────────────────────────────────────
function msToggleSnap(val) {
  snapEnabled = val;
  saveSheet();
}

// ── Keyboard toggle ───────────────────────────────────────────────
function msToggleKb() {
  kbEnabled = !kbEnabled;
  document.getElementById('ms-btn-kb').classList.toggle('active', kbEnabled);
  document.querySelectorAll('math-field.ms-mf').forEach(mf => {
    mf.setAttribute('virtual-keyboard-mode', kbEnabled ? 'onfocus' : 'manual');
  });
  saveSheet();
}

// ── Persistence: save ─────────────────────────────────────────────
function saveSheet() {
  const state = {
    counter: blockCounter,
    snap:    snapEnabled,
    kb:      kbEnabled,
    blocks:  [...document.querySelectorAll('.ms-block')].map(b => {
      const mf  = b.querySelector('math-field');
      const ta  = b.querySelector('textarea');
      const inp = b.querySelector('input[type="text"]');
      return {
        id:   b.id,
        type: b.dataset.type,
        x:    parseInt(b.style.left) || 0,
        y:    parseInt(b.style.top)  || 0,
        w:    b.offsetWidth,
        expr: mf  ? mf.value  : '',
        text: ta  ? ta.value  : (inp ? inp.value : '')
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
  snapEnabled  = state.snap !== false; // default true
  kbEnabled    = state.kb || false;

  const snapCb = document.getElementById('ms-snap-cb');
  const kbBtn  = document.getElementById('ms-btn-kb');
  if (snapCb) snapCb.checked = snapEnabled;
  if (kbBtn)  kbBtn.classList.toggle('active', kbEnabled);

  for (const bs of state.blocks) {
    const block = createBlock(bs.type, bs.x, bs.y, {
      id: bs.id, w: bs.w, expr: bs.expr, text: bs.text
    });
    block.id = bs.id; // ensure ID matches saved state
  }
  setTimeout(evaluateSheet, 200);
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
  input.value = ''; // reset so same file can be re-imported
}

// ── Clear canvas ──────────────────────────────────────────────────
function msClear() {
  if (!confirm('¿Limpiar el canvas? El estado actual se perderá.')) return;
  document.getElementById('ms-canvas').querySelectorAll('.ms-block').forEach(b => b.remove());
  blockCounter = 0;
  localStorage.removeItem('mathsheet-v1');
}

// ── Load example sheet ────────────────────────────────────────────
function msLoadExample() {
  if (document.querySelectorAll('.ms-block').length > 0) {
    if (!confirm('¿Reemplazar el canvas actual con el ejemplo?')) return;
  }
  document.getElementById('ms-canvas').querySelectorAll('.ms-block').forEach(b => b.remove());
  blockCounter = 0;

  const items = [
    { type: 'section', x:  40, y:  40,  text: '§1 Datos del Problema' },
    { type: 'calc',    x:  40, y: 120,  expr: 'L=6' },
    { type: 'calc',    x: 480, y: 120,  expr: 'w_D=15' },
    { type: 'calc',    x: 920, y: 120,  expr: 'w_L=10' },
    { type: 'section', x:  40, y: 240,  text: '§2 Combinación de Cargas ACI 318' },
    { type: 'calc',    x:  40, y: 320,  expr: 'w_u=1.2\\cdot w_D+1.6\\cdot w_L' },
    { type: 'section', x:  40, y: 440,  text: '§3 Solicitaciones Máximas' },
    { type: 'calc',    x:  40, y: 520,  expr: 'M_u=\\frac{w_u\\cdot L^2}{8}' },
    { type: 'calc',    x: 480, y: 520,  expr: 'V_u=\\frac{w_u\\cdot L}{2}' },
    { type: 'text',    x:  40, y: 680,  text: 'Viga simplemente apoyada con carga uniforme.\nVerificar: sección tensión-controlada (ACI §21.2.2).' },
  ];

  for (const item of items) {
    createBlock(item.type, item.x, item.y, { expr: item.expr, text: item.text });
  }
  setTimeout(evaluateSheet, 200);
  saveSheet();
}

// ── Initialisation ────────────────────────────────────────────────
function init() {
  // Restore from localStorage; fall back to example on first visit
  const raw = localStorage.getItem('mathsheet-v1');
  if (raw) {
    try {
      const state = JSON.parse(raw);
      if (state.blocks && state.blocks.length > 0) {
        loadSheet(state);
        return;
      }
    } catch(e) {}
  }
  msLoadExample();
}

// Wait for math.js global (loaded by MkDocs CDN) before starting
(function waitForMath() {
  if (typeof math !== 'undefined') { init(); return; }
  setTimeout(waitForMath, 80);
})();
</script>
