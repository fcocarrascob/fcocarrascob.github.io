---
title: "Notepad WYSIWYG de Cálculos"
type: tool
tags: [notepad, calculadora, mathlive, wysiwyg, interactivo]
created: 2026-05-03
updated: 2026-05-03
hide:
  - navigation
  - toc
---

# Notepad WYSIWYG de Cálculos

Escribe expresiones matemáticas con tipografía TeX: fracciones reales, exponentes, raíces y letras griegas. El scope acumula entre filas de arriba a abajo.

---

<div id="np-toolbar" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;align-items:center;">
  <button onclick="addRow()"
    style="padding:5px 14px;background:#e0e0e0;color:#333;border:none;border-radius:4px;cursor:pointer;font-size:0.9rem;">
    + Cálculo
  </button>
  <button onclick="addSection()"
    style="padding:5px 14px;background:#e0e0e0;color:#333;border:none;border-radius:4px;cursor:pointer;font-size:0.9rem;">
    + Sección
  </button>
  <span style="width:1px;height:20px;background:#ccc;display:inline-block;margin:0 2px;"></span>
  <button onclick="clearNotepad()"
    style="padding:5px 14px;background:#e0e0e0;color:#333;border:none;border-radius:4px;cursor:pointer;font-size:0.9rem;">
    Limpiar
  </button>
  <button onclick="copyNotepad()" id="btn-copy"
    style="padding:5px 14px;background:#e0e0e0;color:#333;border:none;border-radius:4px;cursor:pointer;font-size:0.9rem;">
    Copiar
  </button>
  <button onclick="window.print()"
    style="padding:5px 14px;background:#e0e0e0;color:#333;border:none;border-radius:4px;cursor:pointer;font-size:0.9rem;">
    Imprimir / PDF
  </button>
  <span style="width:1px;height:20px;background:#ccc;display:inline-block;margin:0 2px;"></span>
  <button onclick="toggleKeyboard()" id="btn-kbd" title="Activar teclado virtual matemático"
    style="padding:5px 14px;background:#e0e0e0;color:#333;border:none;border-radius:4px;cursor:pointer;font-size:0.9rem;">
    ⌨ Teclado
  </button>
</div>

<div id="np-col-headers"
  style="display:grid;grid-template-columns:1fr 1fr 28px;gap:8px;margin-bottom:4px;padding:0 2px;">
  <div style="font-size:0.78rem;color:#999;font-weight:500;text-transform:uppercase;letter-spacing:0.04em;">Expresión</div>
  <div style="font-size:0.78rem;color:#999;font-weight:500;text-transform:uppercase;letter-spacing:0.04em;">Resultado</div>
  <div></div>
</div>

<div id="np-rows"></div>

<style>
/* ── Filas de cálculo ────────────────────────────────── */
.np-row {
  display: grid;
  grid-template-columns: 1fr 1fr 28px;
  gap: 8px;
  align-items: center;
  margin: 3px 0;
}

/* ── Math field ──────────────────────────────────────── */
math-field.np-mf {
  width: 100%;
  min-height: 40px;
  border: 1px solid #bbb;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 1rem;
  background: var(--md-code-bg-color, #f5f5f5);
  box-sizing: border-box;
}
math-field.np-mf:focus-within {
  border-color: #2980b9;
  box-shadow: 0 0 0 2px rgba(41,128,185,0.15);
  outline: none;
}

/* ── Paneles de resultado ────────────────────────────── */
.np-result {
  padding: 4px 12px;
  border-radius: 0 6px 6px 0;
  min-height: 40px;
  display: flex;
  align-items: center;
  line-height: 1.7;
}
.np-result-assign { border-left:3px solid #2980b9; background:rgba(41,128,185,0.06); }
.np-result-ok     { border-left:3px solid #27ae60; background:rgba(39,174,96,0.06); }
.np-result-err    { border-left:3px solid #e74c3c; background:rgba(231,76,60,0.06); color:#c0392b; font-family:monospace; font-size:0.82rem; }
.np-result-empty  { border-left:3px solid #ddd; background:rgba(0,0,0,0.02); color:#ccc; font-style:italic; font-size:0.85rem; }

/* ── Filas de sección ────────────────────────────────── */
.np-section-row {
  display: grid;
  grid-template-columns: 1fr 28px;
  gap: 8px;
  margin: 14px 0 4px;
  align-items: center;
}
.np-section-input {
  width: 100%;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-bottom: 2px solid #2980b9;
  background: transparent;
  color: inherit;
  padding: 4px 2px;
  outline: none;
  box-sizing: border-box;
}

/* ── Botón eliminar ──────────────────────────────────── */
.np-del-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #bbb;
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}
.np-del-btn:hover { background:rgba(231,76,60,0.12); color:#e74c3c; }

/* ── Modo oscuro ─────────────────────────────────────── */
[data-md-color-scheme="slate"] math-field.np-mf {
  background: var(--md-code-bg-color, #2d2d2d);
  border-color: #555;
  color: #eee;
}
[data-md-color-scheme="slate"] .np-section-input {
  color: #eee;
}

/* ── Impresión ───────────────────────────────────────── */
@media print {
  header, .md-header, .md-nav, .md-sidebar, .md-footer,
  .md-tabs, [data-md-component="header"], [data-md-component="sidebar"],
  button, .md-content__button,
  #np-toolbar, #np-col-headers, .np-del-btn { display:none !important; }
  math-field { visibility:hidden; height:0 !important; margin:0 !important; padding:0 !important; }
  .np-row { grid-template-columns:1fr !important; }
  .np-row > math-field { display:none !important; }
  .np-section-row { grid-template-columns:1fr !important; }
  .np-result { border-radius:4px; min-height:auto; }
  .md-grid { max-width:100% !important; margin:0 !important; }
  .md-content { margin:0 !important; padding:0 !important; }
  body { font-size:11pt; }
}

/* ── Mobile ──────────────────────────────────────────── */
@media (max-width:700px) {
  .np-row { grid-template-columns:1fr 28px !important; }
  .np-row > .np-result { display:none; }
}
</style>

<script type="module">
// ── Cargar MathLive ───────────────────────────────────────────────────
import 'https://cdn.jsdelivr.net/npm/mathlive';
await customElements.whenDefined('math-field');

// ── Estado global ─────────────────────────────────────────────────────
var _evalTimer  = null;
var _kbEnabled  = false;
var _rowCounter = 0;

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
  _rowCounter = 0;
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
  btn.style.background = _kbEnabled ? '#2980b9' : '#e0e0e0';
  btn.style.color      = _kbEnabled ? '#fff'    : '#333';
  document.querySelectorAll('math-field.np-mf').forEach(function(mf) {
    mf.setAttribute('virtual-keyboard-mode', _kbEnabled ? 'onfocus' : 'manual');
  });
};

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
