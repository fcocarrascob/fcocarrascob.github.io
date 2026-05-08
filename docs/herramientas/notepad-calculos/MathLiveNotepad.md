---
title: "Notepad WYSIWYG de Cálculos"
type: tool
tags: [notepad, calculadora, mathlive, wysiwyg, interactivo]
created: 2026-05-03
updated: 2026-05-05
hide:
  - navigation
  - toc
---

<!-- ─────────────────────────────────────────────────────────────────
     Notepad WYSIWYG — diseño inspirado en Mathcha.io
     Motor: math.js  |  Entrada: MathLive  |  Salida: MathJax
     ───────────────────────────────────────────────────────────────── -->

<div class="np-doc" id="np-document">

  <!-- ── Toolbar ───────────────────────────────────────────────────── -->
  <div class="np-toolbar" id="np-toolbar">
    <div class="np-tb-group">
      <button class="np-btn np-btn-primary" onclick="addRow()" title="Nueva fila de cálculo (Enter)">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2"><line x1="7" y1="1" x2="7" y2="13"/><line x1="1" y1="7" x2="13" y2="7"/></svg>
        Cálculo
      </button>
      <button class="np-btn" onclick="addSection()" title="Nueva sección">
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" stroke-width="2"><line x1="0" y1="5" x2="14" y2="5"/></svg>
        Sección
      </button>
    </div>
    <div class="np-tb-group">
      <button class="np-btn" onclick="copyNotepad()" id="btn-copy" title="Copiar al portapapeles">
        <svg width="13" height="14" viewBox="0 0 13 14" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="3" width="8" height="10" rx="1.5"/><path d="M3 1H1.5A.5.5 0 001 1.5v10"/></svg>
        Copiar
      </button>
      <button class="np-btn" onclick="window.print()" title="Imprimir o exportar PDF">
        <svg width="14" height="13" viewBox="0 0 14 13" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="1" y="4" width="12" height="7" rx="1.5"/><path d="M3 4V2.5A.5.5 0 013.5 2h7a.5.5 0 01.5.5V4"/><rect x="3" y="7.5" width="8" height="2.5" rx=".5"/></svg>
        PDF
      </button>
      <button class="np-btn np-btn-ghost" onclick="clearNotepad()" title="Restablecer ejemplo">Limpiar</button>
      <div class="np-tb-sep"></div>
      <button class="np-btn np-btn-icon" onclick="toggleKeyboard()" id="btn-kbd" title="Activar teclado virtual">⌨</button>
    </div>
  </div>

  <!-- ── Barra de símbolos rápidos ─────────────────────────────────── -->
  <div class="np-symbar" id="np-symbar">
    <span class="np-sym-label">Insertar:</span>
    <button class="np-sym" data-latex="\sqrt{#?}"     title="Raíz cuadrada">√</button>
    <button class="np-sym" data-latex="\frac{#?}{}"   title="Fracción">ⁿ⁄ₓ</button>
    <button class="np-sym" data-latex="^{#?}"          title="Exponente">xⁿ</button>
    <button class="np-sym" data-latex="\pi"            title="Pi">π</button>
    <button class="np-sym" data-latex="\phi"           title="Phi">φ</button>
    <button class="np-sym" data-latex="\sigma"         title="Sigma">σ</button>
    <button class="np-sym" data-latex="\tau"           title="Tau">τ</button>
    <button class="np-sym" data-latex="\epsilon"       title="Epsilon">ε</button>
    <button class="np-sym" data-latex="\mu"            title="Mu">μ</button>
    <button class="np-sym" data-latex="\Delta"         title="Delta">Δ</button>
    <button class="np-sym" data-latex="\sum_{#?}^{}"  title="Sumatorio">Σ</button>
    <button class="np-sym" data-latex="\infty"         title="Infinito">∞</button>
    <button class="np-sym" data-latex="\leq"           title="Menor o igual">≤</button>
    <button class="np-sym" data-latex="\geq"           title="Mayor o igual">≥</button>
    <button class="np-sym" data-latex="\cdot"          title="Multiplicación (punto)">·</button>
    <button class="np-sym" data-latex="°"              title="Grados">°</button>
  </div>

  <!-- ── Cabeceras de columna ──────────────────────────────────────── -->
  <div class="np-col-headers" id="np-col-headers">
    <span>Expresión</span>
    <span>Resultado</span>
    <span></span>
  </div>

  <!-- ── Filas ─────────────────────────────────────────────────────── -->
  <div id="np-rows" class="np-rows-container"></div>

</div>

<style>
/* ════════════════════════════════════════════════════════
   CONTENEDOR DOCUMENTO
   ════════════════════════════════════════════════════════ */
.np-doc {
  background: var(--md-default-bg-color, #fff);
  border: 1px solid #e2e2e2;
  border-radius: 10px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04);
  overflow: hidden;
  margin: 0 0 1.5rem;
}

/* ════════════════════════════════════════════════════════
   TOOLBAR
   ════════════════════════════════════════════════════════ */
.np-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  border-bottom: 1px solid #e8e8e8;
  background: #f7f7f7;
  gap: 8px;
  flex-wrap: wrap;
}
.np-tb-group {
  display: flex;
  align-items: center;
  gap: 4px;
}
.np-tb-sep {
  width: 1px;
  height: 18px;
  background: #ddd;
  margin: 0 2px;
}
.np-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  background: #fff;
  color: #444;
  border: 1px solid #d8d8d8;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.82rem;
  font-family: inherit;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  white-space: nowrap;
}
.np-btn:hover {
  background: #f0f0f0;
  border-color: #bbb;
}
.np-btn-primary {
  background: #2980b9;
  color: #fff;
  border-color: #2471a3;
}
.np-btn-primary:hover {
  background: #2471a3;
  border-color: #1f618d;
}
.np-btn-ghost {
  background: transparent;
  border-color: transparent;
  color: #888;
}
.np-btn-ghost:hover {
  background: #f0f0f0;
  border-color: #ddd;
  color: #444;
}
.np-btn-icon {
  padding: 5px 8px;
  font-size: 0.9rem;
}

/* Teclado activo */
.np-btn-icon.active {
  background: #2980b9;
  color: #fff;
  border-color: #2471a3;
}

/* ════════════════════════════════════════════════════════
   BARRA DE SÍMBOLOS
   ════════════════════════════════════════════════════════ */
.np-symbar {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 6px 14px;
  border-bottom: 1px solid #eee;
  background: #fafafa;
  flex-wrap: wrap;
}
.np-sym-label {
  font-size: 0.73rem;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-right: 4px;
  white-space: nowrap;
}
.np-sym {
  min-width: 30px;
  height: 28px;
  padding: 0 6px;
  background: #fff;
  color: #333;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  font-family: "Latin Modern Math", "STIX Two Math", serif;
  transition: background 0.1s, border-color 0.1s;
  line-height: 1;
}
.np-sym:hover {
  background: #ebf5fb;
  border-color: #2980b9;
  color: #1a5276;
}

/* ════════════════════════════════════════════════════════
   CABECERAS DE COLUMNA
   ════════════════════════════════════════════════════════ */
.np-col-headers {
  display: grid;
  grid-template-columns: 1fr 1fr 32px;
  gap: 0;
  padding: 5px 14px 5px 16px;
  border-bottom: 1px solid #eee;
  background: #f5f5f5;
}
.np-col-headers span {
  font-size: 0.72rem;
  color: #aaa;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* ════════════════════════════════════════════════════════
   CONTENEDOR DE FILAS
   ════════════════════════════════════════════════════════ */
.np-rows-container {
  padding: 6px 0 10px;
}

/* ════════════════════════════════════════════════════════
   FILA DE CÁLCULO
   ════════════════════════════════════════════════════════ */
.np-row {
  display: grid;
  grid-template-columns: 1fr 1fr 32px;
  gap: 0;
  align-items: center;
  border-bottom: 1px solid #f3f3f3;
  transition: background 0.1s;
  padding: 0 14px;
}
.np-row:last-of-type { border-bottom: none; }
.np-row:hover { background: rgba(41,128,185,0.025); }

/* ── Math field ──────────────────────────────────────── */
math-field.np-mf {
  width: 100%;
  min-height: 42px;
  border: 1px solid transparent;
  border-radius: 5px;
  padding: 4px 8px;
  font-size: 1.05rem;
  background: transparent;
  box-sizing: border-box;
  transition: border-color 0.15s, background 0.15s;
  --caret-color: #2980b9;
}
math-field.np-mf:focus-within {
  border-color: #2980b9;
  background: rgba(41,128,185,0.04);
  outline: none;
}

/* ── Panel de resultado ──────────────────────────────── */
.np-result {
  padding: 4px 10px 4px 12px;
  min-height: 42px;
  display: flex;
  align-items: center;
  font-size: 0.97rem;
  border-left: 1px solid #f0f0f0;
}
.np-result-assign { color: #1a5276; }
.np-result-ok     { color: #1e8449; }
.np-result-err    { color: #c0392b; font-family: monospace; font-size: 0.8rem; }
.np-result-empty  { color: #d5d5d5; font-style: italic; font-size: 0.85rem; user-select: none; }

/* ── Botón eliminar ──────────────────────────────────── */
.np-del-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #ccc;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s, color 0.12s;
  flex-shrink: 0;
  margin: auto;
}
.np-del-btn:hover { background: rgba(231,76,60,0.1); color: #e74c3c; }

/* ════════════════════════════════════════════════════════
   FILA DE SECCIÓN
   ════════════════════════════════════════════════════════ */
.np-section-row {
  display: grid;
  grid-template-columns: 1fr 32px;
  align-items: center;
  gap: 0;
  margin: 6px 0 0;
  padding: 6px 14px 0;
  border-top: 2px solid #e8e8e8;
}
.np-section-input {
  width: 100%;
  font-size: 1.02rem;
  font-weight: 600;
  color: #2c3e50;
  letter-spacing: 0.01em;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  padding: 4px 2px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;
}
.np-section-input:focus { border-bottom-color: #2980b9; }
.np-section-input::placeholder { color: #bbb; font-weight: 400; }

/* ════════════════════════════════════════════════════════
   MODO OSCURO (slate)
   ════════════════════════════════════════════════════════ */
[data-md-color-scheme="slate"] .np-doc {
  background: var(--md-default-bg-color, #1e1e2e);
  border-color: #3a3a4a;
  box-shadow: 0 2px 16px rgba(0,0,0,0.3);
}
[data-md-color-scheme="slate"] .np-toolbar,
[data-md-color-scheme="slate"] .np-symbar,
[data-md-color-scheme="slate"] .np-col-headers { background: #252535; border-color: #3a3a4a; }
[data-md-color-scheme="slate"] .np-btn {
  background: #2e2e3e;
  color: #ccc;
  border-color: #444;
}
[data-md-color-scheme="slate"] .np-btn:hover { background: #3a3a4e; border-color: #555; }
[data-md-color-scheme="slate"] .np-sym { background: #2e2e3e; color: #ccc; border-color: #444; }
[data-md-color-scheme="slate"] .np-sym:hover { background: #1a3a55; border-color: #2980b9; color: #7fb3d3; }
[data-md-color-scheme="slate"] .np-rows-container { background: var(--md-default-bg-color, #1e1e2e); }
[data-md-color-scheme="slate"] .np-row { border-bottom-color: #2a2a3a; }
[data-md-color-scheme="slate"] .np-row:hover { background: rgba(41,128,185,0.06); }
[data-md-color-scheme="slate"] math-field.np-mf { color: #ddd; --caret-color: #5dade2; }
[data-md-color-scheme="slate"] math-field.np-mf:focus-within { border-color: #5dade2; background: rgba(93,173,226,0.06); }
[data-md-color-scheme="slate"] .np-result { border-left-color: #2a2a3a; }
[data-md-color-scheme="slate"] .np-result-assign { color: #7fb3d3; }
[data-md-color-scheme="slate"] .np-result-ok     { color: #7dcea0; }
[data-md-color-scheme="slate"] .np-result-err    { color: #e67e73; }
[data-md-color-scheme="slate"] .np-result-empty  { color: #444; }
[data-md-color-scheme="slate"] .np-section-row { border-top-color: #3a3a4a; }
[data-md-color-scheme="slate"] .np-section-input { color: #ddd; }
[data-md-color-scheme="slate"] .np-col-headers span { color: #666; }

/* ════════════════════════════════════════════════════════
   IMPRESIÓN
   ════════════════════════════════════════════════════════ */
@media print {
  header, .md-header, .md-nav, .md-sidebar, .md-footer,
  .md-tabs, [data-md-component="header"], [data-md-component="sidebar"],
  button, .md-content__button,
  .np-toolbar, .np-symbar, .np-col-headers, .np-del-btn { display: none !important; }
  .np-doc { border: none; box-shadow: none; border-radius: 0; }
  math-field { visibility: hidden; height: 0 !important; margin: 0 !important; padding: 0 !important; }
  .np-row { grid-template-columns: 1fr !important; padding: 0; }
  .np-row > math-field { display: none !important; }
  .np-section-row { grid-template-columns: 1fr !important; }
  .np-result { border-left: none; min-height: auto; border-radius: 4px; font-size: 11pt; }
  .md-grid { max-width: 100% !important; margin: 0 !important; }
  .md-content { margin: 0 !important; padding: 0 !important; }
  body { font-size: 11pt; }
}

/* ════════════════════════════════════════════════════════
   MOBILE
   ════════════════════════════════════════════════════════ */
@media (max-width: 700px) {
  .np-row { grid-template-columns: 1fr 32px !important; }
  .np-row > .np-result { display: none; }
  .np-symbar { display: none; }
}
</style>

<script type="module">
// ── Cargar MathLive ───────────────────────────────────────────────────
import 'https://cdn.jsdelivr.net/npm/mathlive';
await customElements.whenDefined('math-field');

// ── Estado global ─────────────────────────────────────────────────────
var _evalTimer   = null;
var _kbEnabled   = false;
var _activeMF    = null;   // último math-field enfocado (para insertar símbolos)

// ── Ejemplo inicial ───────────────────────────────────────────────────
var EJEMPLO = [
  { type: 'section', title: 'Geometría y cargas' },
  { type: 'calc', latex: 'L=6' },
  { type: 'calc', latex: 'w_D=15' },
  { type: 'calc', latex: 'w_L=10' },
  { type: 'section', title: 'Combinación última ACI' },
  { type: 'calc', latex: 'w_u=1.2\\cdot w_D+1.6\\cdot w_L' },
  { type: 'section', title: 'Solicitaciones máximas' },
  { type: 'calc', latex: 'M_u=\\frac{w_u\\cdot L^2}{8}' },
  { type: 'calc', latex: 'V_u=\\frac{w_u\\cdot L}{2}' },
];

// ── Puente ASCIIMath → math.js ────────────────────────────────────────
function asciiToMathjs(ascii) {
  return ascii
    .replace(/([a-zA-Z])_\(([a-zA-Z0-9']+)\)/g, '$1$2')   // w_(u) → wu
    .replace(/([a-zA-Z])_\{([a-zA-Z0-9']+)\}/g, '$1$2')   // w_{u} → wu (residual LaTeX)
    .replace(/([a-zA-Z])_([a-zA-Z0-9])/g, '$1$2')          // w_u   → wu
    .replace(/\bcdot\b/g, '*')                              // cdot  → *
    .trim();
}

// ── Helpers de formato ────────────────────────────────────────────────
function fmtValue(v) {
  try {
    if (typeof v === 'number') {
      return v.toLocaleString('es-CL', { maximumFractionDigits: 4 });
    }
    if (math.typeOf(v) === 'Unit') {
      var num  = v.toNumber();
      var unit = v.formatUnits();
      return num.toLocaleString('es-CL', { maximumFractionDigits: 4 }) + ' ' + unit;
    }
    if (typeof v === 'boolean') return v ? 'verdadero' : 'falso';
    return math.format(v, { precision: 6 });
  } catch(e) { return String(v); }
}

function varLatex(name) {
  var m;
  m = name.match(/^([A-Za-z]+?)([0-9]+)$/);
  if (m) return m[1] + '_{' + m[2] + '}';
  m = name.match(/^([a-z])([A-Z][a-z]*)$/);
  if (m) return m[1] + '_{' + m[2] + '}';
  m = name.match(/^([A-Z][a-z]*)([A-Z][a-z]*)$/);
  if (m && m[1].length <= 2) return m[1] + '_{' + m[2] + '}';
  return name;
}

function buildResultHtml(ascii, val) {
  var assignMatch = ascii.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/);
  var valStr = fmtValue(val);
  var latex;
  if (assignMatch) {
    latex = '\\(' + varLatex(assignMatch[1]) + ' = ' + valStr + '\\)';
  } else {
    latex = '\\(' + valStr + '\\)';
  }
  return '<span class="arithmatex">' + latex + '</span>';
}

// ── Evaluación de todas las filas ─────────────────────────────────────
function evalAllRows() {
  if (typeof math === 'undefined') return;
  var scope       = {};
  var rows        = document.querySelectorAll('#np-rows .np-row');
  var needsTypeset = [];

  rows.forEach(function(row) {
    var mf     = row.querySelector('math-field');
    var resDiv = row.querySelector('.np-result');
    if (!mf || !resDiv) return;

    var ascii;
    try { ascii = asciiToMathjs(mf.getValue('ascii-math') || ''); }
    catch(e) { ascii = ''; }

    if (!ascii) {
      resDiv.className = 'np-result np-result-empty';
      resDiv.innerHTML = '—';
      return;
    }

    try {
      var result   = math.evaluate(ascii, scope);
      var isAssign = /^\s*[A-Za-z_][A-Za-z0-9_]*\s*=/.test(ascii);
      resDiv.className = 'np-result ' + (isAssign ? 'np-result-assign' : 'np-result-ok');
      resDiv.innerHTML = buildResultHtml(ascii, result);
      needsTypeset.push(resDiv);
    } catch(e) {
      resDiv.className = 'np-result np-result-err';
      resDiv.innerHTML = '⚠ ' + e.message;
    }
  });

  if (window.MathJax && MathJax.typesetPromise && needsTypeset.length > 0) {
    MathJax.typesetPromise(needsTypeset);
  }
}

function scheduleEval() {
  clearTimeout(_evalTimer);
  _evalTimer = setTimeout(evalAllRows, 250);
}

// ── Crear fila de cálculo ─────────────────────────────────────────────
function addRow(latex) {
  var row = document.createElement('div');
  row.className = 'np-row';
  row.dataset.type = 'calc';

  var mf = document.createElement('math-field');
  mf.className = 'np-mf';
  mf.setAttribute('virtual-keyboard-mode', _kbEnabled ? 'onfocus' : 'manual');
  if (latex) mf.value = latex;

  var resDiv = document.createElement('div');
  resDiv.className = 'np-result np-result-empty';
  resDiv.innerHTML = '—';

  var delBtn = document.createElement('button');
  delBtn.className = 'np-del-btn';
  delBtn.innerHTML = '&times;';
  delBtn.title = 'Eliminar fila';
  delBtn.addEventListener('click', function() { row.remove(); scheduleEval(); });

  mf.addEventListener('input',  scheduleEval);
  mf.addEventListener('change', scheduleEval);
  mf.addEventListener('focus',  function() { _activeMF = mf; });

  row.appendChild(mf);
  row.appendChild(resDiv);
  row.appendChild(delBtn);

  document.getElementById('np-rows').appendChild(row);
  if (!latex) { mf.focus(); }
  scheduleEval();
}
window.addRow = addRow;

// ── Crear fila de sección ─────────────────────────────────────────────
function addSection(title) {
  var secRow = document.createElement('div');
  secRow.className = 'np-section-row';
  secRow.dataset.type = 'section';

  var inp = document.createElement('input');
  inp.type = 'text';
  inp.className = 'np-section-input';
  inp.placeholder = 'Nombre de sección\u2026';
  if (title) inp.value = title;

  var delBtn = document.createElement('button');
  delBtn.className = 'np-del-btn';
  delBtn.innerHTML = '&times;';
  delBtn.title = 'Eliminar sección';
  delBtn.addEventListener('click', function() { secRow.remove(); });

  secRow.appendChild(inp);
  secRow.appendChild(delBtn);
  document.getElementById('np-rows').appendChild(secRow);
  if (!title) { inp.focus(); }
}
window.addSection = addSection;

// ── Limpiar ───────────────────────────────────────────────────────────
window.clearNotepad = function() {
  if (!confirm('\u00bfLimpiar y volver al ejemplo inicial?')) return;
  document.getElementById('np-rows').innerHTML = '';
  loadExample();
};

// ── Copiar texto plano ────────────────────────────────────────────────
window.copyNotepad = function() {
  if (typeof math === 'undefined') return;
  var scope = {};
  var out   = [];
  var items = document.querySelectorAll('#np-rows > [data-type]');

  items.forEach(function(item) {
    if (item.dataset.type === 'section') {
      var t = (item.querySelector('.np-section-input') || {}).value || '';
      if (t) out.push('\n' + t.toUpperCase() + '\n' + '\u2500'.repeat(Math.max(t.length, 20)));
      return;
    }
    var mf = item.querySelector('math-field');
    if (!mf) return;
    var ascii;
    try { ascii = asciiToMathjs(mf.getValue('ascii-math') || ''); }
    catch(e) { ascii = ''; }
    if (!ascii) { out.push(''); return; }
    try {
      var val = math.evaluate(ascii, scope);
      var lhs = (ascii.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/) || [])[1];
      var vs  = fmtValue(val);
      out.push(lhs ? lhs + ' = ' + vs : ascii + ' \u2192 ' + vs);
    } catch(e) {
      out.push(ascii + '  # ERROR: ' + e.message);
    }
  });

  navigator.clipboard.writeText(out.join('\n')).then(function() {
    var btn = document.getElementById('btn-copy');
    btn.textContent = '\u00a1Copiado!';
    setTimeout(function() { btn.textContent = 'Copiar'; }, 2000);
  });
};

// ── Teclado virtual ───────────────────────────────────────────────────
window.toggleKeyboard = function() {
  _kbEnabled = !_kbEnabled;
  var btn = document.getElementById('btn-kbd');
  btn.classList.toggle('active', _kbEnabled);
  document.querySelectorAll('math-field.np-mf').forEach(function(mf) {
    mf.setAttribute('virtual-keyboard-mode', _kbEnabled ? 'onfocus' : 'manual');
  });
};

// ── Barra de símbolos rápidos ─────────────────────────────────────────
document.querySelectorAll('.np-sym').forEach(function(btn) {
  btn.addEventListener('mousedown', function(e) {
    e.preventDefault();  // no robar el foco del math-field
    var latex = this.dataset.latex;
    if (!latex || !_activeMF) return;
    _activeMF.executeCommand(['insert', latex]);
    _activeMF.focus();
    scheduleEval();
  });
});

// ── Cargar ejemplo ────────────────────────────────────────────────────
function loadExample() {
  EJEMPLO.forEach(function(item) {
    if (item.type === 'section') {
      addSection(item.title);
    } else {
      addRow(item.latex);
    }
  });
  setTimeout(evalAllRows, 150);
}

// ── Arrancar: esperar math.js ─────────────────────────────────────────
(function waitForMath() {
  if (typeof math !== 'undefined') { loadExample(); return; }
  setTimeout(waitForMath, 80);
})();
</script>

