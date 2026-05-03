---
title: "Notepad Interactivo de Cálculos"
type: tool
tags: [notepad, calculadora, mathjs, interactivo, unidades]
created: 2026-05-03
updated: 2026-05-03
hide:          # ← añadir esto
  - navigation # ← y esto
  - toc        # ← y esto (opcional, elimina el índice derecho)
---

# Notepad Interactivo de Cálculos

Escribe expresiones en el panel izquierdo — los resultados se renderizan en tiempo real a la derecha. Las variables persisten entre líneas; `#` inicia un comentario; `## Título` crea una sección.

---

<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
  <button onclick="clearNotepad()"
    style="padding:5px 16px;background:#e0e0e0;color:#333;border:none;border-radius:4px;cursor:pointer;font-size:0.9rem;">
    Limpiar
  </button>
  <button onclick="copyNotepad()" id="btn-copy"
    style="padding:5px 16px;background:#e0e0e0;color:#333;border:none;border-radius:4px;cursor:pointer;font-size:0.9rem;">
    Copiar texto
  </button>
  <button onclick="window.print()"
    style="padding:5px 16px;background:#e0e0e0;color:#333;border:none;border-radius:4px;cursor:pointer;font-size:0.9rem;">
    Imprimir / PDF
  </button>
</div>

<div id="notepad-split" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start;">

  <textarea id="notepad-editor"
    rows="20"
    spellcheck="false"
    oninput="scheduleEval()"
    style="width:100%;font-family:monospace;font-size:0.9rem;padding:10px 12px;border:1px solid #bbb;border-radius:6px;background:var(--md-code-bg-color,#f5f5f5);resize:vertical;box-sizing:border-box;line-height:1.6;"></textarea>

  <div id="notepad-output"
    style="padding:10px 14px;border:1px solid #ddd;border-radius:6px;background:var(--md-code-bg-color,#f5f5f5);min-height:200px;overflow-x:auto;line-height:1.8;">
  </div>

</div>

<!-- placeholder to keep rest of file after this point -->
<div id="notepad-lxl-container" style="display:none;"></div>

<style>
/* Resultado por línea */
.np-result-assign { border-left:3px solid #2980b9; padding:2px 10px; margin:1px 0; background:rgba(41,128,185,0.06); border-radius:0 4px 4px 0; }
.np-result-ok     { border-left:3px solid #27ae60; padding:2px 10px; margin:1px 0; background:rgba(39,174,96,0.06);  border-radius:0 4px 4px 0; }
.np-result-err    { border-left:3px solid #e74c3c; padding:2px 10px; margin:1px 0; background:rgba(231,76,60,0.06);  color:#c0392b; font-family:monospace; font-size:0.82rem; border-radius:0 4px 4px 0; }
.np-comment       { color:#999; font-style:italic; font-size:0.85rem; padding:1px 10px; }
.np-section       { font-weight:600; font-size:1rem; margin-top:1rem; margin-bottom:2px; padding-bottom:3px; border-bottom:1px solid #ccc; }
.np-empty         { height:0.6rem; }

/* Print */
@media print {
  header, .md-header, .md-nav, .md-sidebar, .md-footer,
  .md-tabs, [data-md-component="header"], [data-md-component="sidebar"],
  button, .md-content__button, #notepad-editor { display:none !important; }
  #notepad-split { grid-template-columns:1fr !important; }
  #notepad-output { border:none; padding:0; }
  .md-grid { max-width:100% !important; margin:0 !important; }
  .md-content { margin:0 !important; padding:0 !important; }
  body { font-size:11pt; }
}

/* Mobile: apilar */
@media (max-width:700px) {
  #notepad-split { grid-template-columns:1fr !important; }
}
</style>

<script>
var _evalTimer = null;

function scheduleEval() {
  clearTimeout(_evalTimer);
  _evalTimer = setTimeout(evalNotepad, 220);
}

var EJEMPLO = [
  '## Geometría y cargas',
  'L = 6 m           # Longitud de la viga',
  'wD = 15 kN/m      # Carga muerta',
  'wL = 10 kN/m      # Carga viva',
  '',
  '## Combinación última ACI',
  'wu = 1.2 * wD + 1.6 * wL',
  '',
  '## Solicitaciones máximas',
  'Mu = wu * L^2 / 8',
  'Vu = wu * L / 2',
].join('\n');

// ── Helpers ──────────────────────────────────────────────────────────
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

function buildLatex(expr, val) {
  var assignMatch = expr.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/);
  var valStr = fmtValue(val);
  if (assignMatch) {
    return '\\(' + varLatex(assignMatch[1]) + ' = ' + valStr + '\\)';
  }
  return '\\(' + valStr + '\\)';
}

// ── Motor de evaluación ──────────────────────────────────────────────
function evalNotepad() {
  if (typeof math === 'undefined') return;

  var text  = document.getElementById('notepad-editor').value;
  var lines = text.split('\n');
  var scope = {};
  var html  = '';

  lines.forEach(function(rawLine) {
    var isSec = rawLine.trimStart().startsWith('## ');
    var ci    = !isSec ? rawLine.indexOf('#') : -1;
    var expr  = (ci >= 0 ? rawLine.substring(0, ci) : rawLine).trim();
    var comment = (ci >= 0 ? rawLine.substring(ci + 1) : '').trim();

    if (isSec) {
      html += '<div class="np-section">' + rawLine.replace(/^##\s*/, '') + '</div>';
      return;
    }
    if (!expr && !comment) { html += '<div class="np-empty"></div>'; return; }
    if (!expr)             { html += '<div class="np-comment"># ' + comment + '</div>'; return; }

    try {
      var result   = math.evaluate(expr, scope);
      var latex    = buildLatex(expr, result);
      var isAssign = /^\s*[A-Za-z_][A-Za-z0-9_]*\s*=/.test(expr);
      var cls      = isAssign ? 'np-result-assign' : 'np-result-ok';
      var cHtml    = comment
        ? '<span style="color:#999;font-size:0.82rem;margin-left:10px;"># ' + comment + '</span>'
        : '';
      html += '<div class="' + cls + '"><span class="arithmatex">' + latex + '</span>' + cHtml + '</div>';
    } catch (e) {
      html += '<div class="np-result-err">⚠ ' + expr + ' → ' + e.message + '</div>';
    }
  });

  var out = document.getElementById('notepad-output');
  out.innerHTML = html || '<span style="color:#aaa;font-style:italic;">Escribe una expresión...</span>';

  if (window.MathJax && MathJax.typesetPromise) {
    MathJax.typesetPromise([out]);
  }
}

// ── Acciones ─────────────────────────────────────────────────────────
function clearNotepad() {
  if (!confirm('¿Limpiar y volver al ejemplo inicial?')) return;
  document.getElementById('notepad-editor').value = EJEMPLO;
  evalNotepad();
}

function copyNotepad() {
  var text  = document.getElementById('notepad-editor').value;
  var lines = text.split('\n');
  var scope = {};
  var out   = [];

  lines.forEach(function(rawLine) {
    var isSec = rawLine.trimStart().startsWith('## ');
    var ci    = !isSec ? rawLine.indexOf('#') : -1;
    var expr  = (ci >= 0 ? rawLine.substring(0, ci) : rawLine).trim();
    var comment = (ci >= 0 ? rawLine.substring(ci + 1) : '').trim();

    if (isSec)         { out.push('\n' + rawLine.replace(/^##\s*/, '').toUpperCase() + '\n' + '─'.repeat(28)); return; }
    if (!expr && !comment) { out.push(''); return; }
    if (!expr)         { out.push('  # ' + comment); return; }

    try {
      var val = math.evaluate(expr, scope);
      var lhs = (expr.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/) || [])[1];
      var vs  = fmtValue(val);
      out.push((lhs ? lhs + ' = ' + vs : expr + ' → ' + vs) + (comment ? '   # ' + comment : ''));
    } catch(e) {
      out.push(expr + '   # ERROR: ' + e.message);
    }
  });

  navigator.clipboard.writeText(out.join('\n')).then(function() {
    var btn = document.getElementById('btn-copy');
    btn.textContent = '¡Copiado!';
    setTimeout(function() { btn.textContent = 'Copiar texto'; }, 2000);
  });
}

// ── Inicialización ───────────────────────────────────────────────────
(function waitForMath() {
  if (typeof math === 'undefined') { setTimeout(waitForMath, 80); return; }
  document.getElementById('notepad-editor').value = EJEMPLO;
  evalNotepad();
})();
</script>
