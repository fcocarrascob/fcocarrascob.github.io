---
title: "Momento-Curvatura — SAP2000"
type: tool
tags: [sap2000, momento-curvatura, section-designer, ductilidad]
created: 2026-05-14
updated: 2026-05-14
hide:
  - navigation
  - toc
---

# Momento-Curvatura — SAP2000 Section Designer

Pega los datos exportados del Section Designer de SAP2000 para visualizar el diagrama Momento-Curvatura con momentos factorados.

---

## Instrucciones

1. En SAP2000, abre el **Section Designer** y exporta la curva Momento-Curvatura
2. Los datos deben tener **4 columnas**: Curvatura · $M_n$ Real · $M_n$ Ideal · (columna auxiliar)
3. Copia y pega en el área de texto (tabulaciones como separador, coma como decimal)
4. Ingresa el **Momento Último** $M_u$ de diseño en tonf·m
5. Presiona **Graficar**

> **Nota:** Los factores $\phi$ son fijos: $\phi = 0{,}95$ para $\phi M_n$ real y $\phi = 0{,}90$ para $\phi M_n$ ideal.

---

<div style="background:var(--md-code-bg-color,#f5f5f5);border-radius:8px;padding:1.5rem;margin-bottom:1.2rem;">

  <label style="display:block;font-size:0.9rem;font-weight:600;margin-bottom:0.5rem;">
    Datos del Section Designer — copiar y pegar desde SAP2000 (TSV, decimal con coma)
  </label>
  <textarea id="mc-input" rows="10" spellcheck="false"
    placeholder="Pegar datos aquí..."
    style="width:100%;font-family:monospace;font-size:0.85rem;padding:10px;border:1px solid #bbb;border-radius:5px;box-sizing:border-box;resize:vertical;background:var(--md-default-bg-color,#fff);"></textarea>

  <div style="display:flex;align-items:flex-end;gap:1.5rem;margin-top:1rem;flex-wrap:wrap;">
    <label style="display:flex;flex-direction:column;gap:4px;font-size:0.9rem;">
      <span>M<sub>ult</sub> — Momento último (tonf·m)</span>
      <input id="mc-mult" type="number" value="21.0" step="0.5" min="0"
        style="padding:5px 10px;border:1px solid #bbb;border-radius:4px;font-size:1rem;width:180px;">
    </label>
    <button onclick="plotMC()"
      style="padding:8px 28px;background:#4a90d9;color:#fff;border:none;border-radius:5px;cursor:pointer;font-size:1rem;">
      Graficar
    </button>
    <button onclick="clearMC()"
      style="padding:8px 16px;background:#e0e0e0;color:#333;border:none;border-radius:5px;cursor:pointer;font-size:0.9rem;">
      Limpiar
    </button>
  </div>

</div>

<div id="mc-msg" style="min-height:1.5rem;margin-bottom:0.5rem;"></div>
<div id="mc-table" style="margin-bottom:1.5rem;"></div>
<div id="mc-chart" style="max-width:680px;height:580px;border:1px solid #000;border-radius:4px;"></div>

<script>
(function () {

  function parseTSV(text) {
    var rows = [];
    var lines = text.trim().split('\n');
    for (var i = 0; i < lines.length; i++) {
      var cols = lines[i].split('\t').map(function (v) {
        return parseFloat(v.trim().replace(',', '.'));
      });
      if (cols.length >= 3 && !isNaN(cols[0]) && !isNaN(cols[1]) && !isNaN(cols[2])) {
        rows.push(cols);
      }
    }
    return rows;
  }

  window.plotMC = function () {
    var text = document.getElementById('mc-input').value;
    var mUlt = parseFloat(document.getElementById('mc-mult').value);
    var msg  = document.getElementById('mc-msg');
    var tbl  = document.getElementById('mc-table');
    msg.innerHTML = '';
    tbl.innerHTML = '';

    if (!text.trim()) {
      msg.innerHTML = '<p style="color:#e74c3c;margin:0;">&#9888; Pega los datos del Section Designer antes de graficar.</p>';
      return;
    }
    if (isNaN(mUlt) || mUlt <= 0) {
      msg.innerHTML = '<p style="color:#e74c3c;margin:0;">&#9888; Ingresa un valor positivo para M<sub>ult</sub>.</p>';
      return;
    }

    var rows = parseTSV(text);
    if (rows.length < 2) {
      msg.innerHTML = '<p style="color:#e74c3c;margin:0;">&#9888; No se encontraron suficientes datos válidos. Verifica que el separador sea tabulación y el decimal sea coma o punto.</p>';
      return;
    }

    /* Agregar origen (0, 0, 0) al inicio — igual que el notebook */
    var curv    = [0].concat(rows.map(function (r) { return r[0]; }));
    var mnReal  = [0].concat(rows.map(function (r) { return r[1] * 0.95; }));
    var mnIdeal = [0].concat(rows.map(function (r) { return r[2] * 0.90; }));
    var mUltArr = curv.map(function () { return mUlt; });

    var mYield = mnReal[1];
    var fu     = mUlt / mYield;

    /* Tabla de resultados */
    tbl.innerHTML =
      '<table style="border-collapse:collapse;font-size:0.9rem;">' +
      '<thead><tr style="background:#4a90d9;color:#fff;">' +
      '<th style="padding:7px 20px;border:1px solid #3a80c9;">Momento de Fluencia &phi;M<sub>n</sub> (tonf&middot;m)</th>' +
      '<th style="padding:7px 20px;border:1px solid #3a80c9;">Momento &Uacute;ltimo M<sub>ult</sub> (tonf&middot;m)</th>' +
      '<th style="padding:7px 20px;border:1px solid #3a80c9;">Factor de Ductilidad FU</th>' +
      '</tr></thead><tbody><tr style="text-align:center;">' +
      '<td style="padding:7px 20px;border:1px solid #ddd;">' + mYield.toFixed(2) + '</td>' +
      '<td style="padding:7px 20px;border:1px solid #ddd;">' + mUlt.toFixed(2) + '</td>' +
      '<td style="padding:7px 20px;border:1px solid #ddd;font-weight:600;">' + fu.toFixed(2) + '</td>' +
      '</tr></tbody></table>';

    var traces = [
      {
        x: curv, y: mnReal, mode: 'lines',
        name: '\u03c6M\u2099 Real (' + mYield.toFixed(2) + ' tonf\u00b7m)',
        line: { color: '#2980b9', width: 2.5 }
      },
      {
        x: curv, y: mnIdeal, mode: 'lines',
        name: '\u03c6M\u2099 Ideal',
        line: { color: '#27ae60', width: 2.5, dash: 'dash' }
      },
      {
        x: curv, y: mUltArr, mode: 'lines',
        name: 'M<sub>ult</sub> = ' + mUlt.toFixed(2) + ' tonf\u00b7m',
        line: { color: '#e74c3c', width: 2, dash: 'dot' }
      }
    ];

    var layout = {
      title: { text: 'Diagrama Momento-Curvatura', font: { size: 16 } },
      xaxis: { title: 'Curvatura (1/m)', gridcolor: '#ddd', zeroline: true, zerolinecolor: '#aaa' },
      yaxis: { title: 'Momento \u03c6M\u2099 (tonf\u00b7m)', gridcolor: '#ddd', zeroline: true, zerolinecolor: '#aaa' },
      legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(255,255,255,0.85)', bordercolor: '#ccc', borderwidth: 1 },
      margin: { l: 70, r: 30, t: 60, b: 60 },
      hovermode: 'x unified'
    };

    Plotly.newPlot('mc-chart', traces, layout, { responsive: true });
  };

  window.clearMC = function () {
    document.getElementById('mc-input').value = '';
    document.getElementById('mc-msg').innerHTML = '';
    document.getElementById('mc-table').innerHTML = '';
    var el = document.getElementById('mc-chart');
    if (el && el._fullLayout) { Plotly.purge(el); }
  };

}());
</script>
