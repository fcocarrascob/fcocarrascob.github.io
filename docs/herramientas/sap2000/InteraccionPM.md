---
title: "Interacción P-M — SAP2000"
type: tool
tags: [sap2000, interaccion-pm, columna, section-designer, diagrama-pm]
created: 2026-05-14
updated: 2026-05-14
hide:
  - navigation
  - toc
---

# Interacción P-M — SAP2000 Section Designer

Pega los datos del diagrama de interacción exportados del Section Designer de SAP2000 para visualizar los diagramas P-M3 y P-M2.

---

## Instrucciones

1. En SAP2000, abre el **Section Designer** y exporta el diagrama de Interacción P-M
2. El export debe corresponder a las **19 curvas** estándar (ángulos de 0° a 360°)
3. Copia y pega los datos en el área de texto (tabulaciones como separador, coma como decimal)
4. Presiona **Graficar**

> **Nota:** Se grafican las 4 curvas simétricas: 0° y 180° para el diagrama P-M3, y 90° y 270° para el diagrama P-M2.

---

<div style="background:var(--md-code-bg-color,#f5f5f5);border-radius:8px;padding:1.5rem;margin-bottom:1.2rem;">

  <label style="display:block;font-size:0.9rem;font-weight:600;margin-bottom:0.5rem;">
    Datos del Section Designer — copiar y pegar desde SAP2000 (TSV, decimal con coma)
  </label>
  <textarea id="pm-input" rows="10" spellcheck="false"
    placeholder="Pegar datos aquí..."
    style="width:100%;font-family:monospace;font-size:0.85rem;padding:10px;border:1px solid #bbb;border-radius:5px;box-sizing:border-box;resize:vertical;background:var(--md-default-bg-color,#fff);"></textarea>

  <div style="display:flex;align-items:center;gap:1rem;margin-top:1rem;flex-wrap:wrap;">
    <button onclick="plotPM()"
      style="padding:8px 28px;background:#4a90d9;color:#fff;border:none;border-radius:5px;cursor:pointer;font-size:1rem;">
      Graficar
    </button>
    <button onclick="clearPM()"
      style="padding:8px 16px;background:#e0e0e0;color:#333;border:none;border-radius:5px;cursor:pointer;font-size:0.9rem;">
      Limpiar
    </button>
  </div>

</div>

<div id="pm-msg" style="min-height:1.5rem;margin-bottom:0.5rem;"></div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
  <div>
    <p style="font-weight:600;margin:0 0 0.3rem;font-size:0.95rem;">Diagrama P-M3 (0° y 180°)</p>
    <div id="pm3-chart" style="width:100%;height:520px;border:1px solid #000;border-radius:4px;"></div>
  </div>
  <div>
    <p style="font-weight:600;margin:0 0 0.3rem;font-size:0.95rem;">Diagrama P-M2 (90° y 270°)</p>
    <div id="pm2-chart" style="width:100%;height:520px;border:1px solid #000;border-radius:4px;"></div>
  </div>
</div>

<style>
@media (max-width: 900px) {
  #pm3-chart, #pm2-chart { height: 420px !important; }
  div:has(> #pm3-chart) { grid-column: span 2; }
}
</style>

<script>
(function () {

  /* Parsear texto TSV:
     - separador de columnas: tabulación
     - decimal: coma o punto
     - las 2 primeras filas del export de SAP2000 son encabezados → se omiten */
  function parseTSV(text) {
    var lines = text.trim().split('\n').slice(2);
    return lines.map(function (line) {
      return line.split('\t').map(function (v) {
        return parseFloat(v.trim().replace(',', '.'));
      });
    });
  }

  /* Extraer una curva por índice de curva (1-based).
     Cada curva ocupa 3 columnas: [P, M2, M3]
     base = (n-1)*3 + 1
     useM3=true  → columna M3 = base+2  (para diagrama P-M3)
     useM3=false → columna M2 = base+1  (para diagrama P-M2) */
  function extractCurve(rows, curveN, useM3) {
    var base = (curveN - 1) * 3 + 1;
    var colP = base;
    var colM = useM3 ? base + 2 : base + 1;
    var P = [], M = [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      if (row.length > colM && !isNaN(row[colP]) && !isNaN(row[colM])) {
        P.push(row[colP]);
        M.push(row[colM]);
      }
    }
    return { P: P, M: M };
  }

  function makeLayout(title) {
    return {
      title: { text: title, font: { size: 14 } },
      xaxis: { title: 'Momento M\u2099 (tonf\u00b7m)', gridcolor: '#ddd', zeroline: true, zerolinecolor: '#aaa' },
      yaxis: { title: 'Carga Axial P\u2099 (tonf)', gridcolor: '#ddd', zeroline: true, zerolinecolor: '#aaa' },
      legend: { x: 0.02, y: 0.02, bgcolor: 'rgba(255,255,255,0.85)', bordercolor: '#ccc', borderwidth: 1 },
      margin: { l: 70, r: 20, t: 50, b: 60 },
      hovermode: 'closest'
    };
  }

  window.plotPM = function () {
    var text = document.getElementById('pm-input').value;
    var msg  = document.getElementById('pm-msg');
    msg.innerHTML = '';

    if (!text.trim()) {
      msg.innerHTML = '<p style="color:#e74c3c;margin:0;">&#9888; Pega los datos del Section Designer antes de graficar.</p>';
      return;
    }

    var rows = parseTSV(text);

    /* Validar que haya columnas suficientes para la curva 19 (columna 57) */
    var minCols = rows.reduce(function (mx, r) { return Math.max(mx, r.length); }, 0);
    if (minCols < 57) {
      msg.innerHTML = '<p style="color:#e74c3c;margin:0;">&#9888; Los datos no tienen suficientes columnas (se esperan al menos 58 columnas para 19 curvas). Verifica que hayas copiado el export completo.</p>';
      return;
    }

    /* P-M3: curvas 1 (0°) y 13 (180°), usando columna M3 */
    var c1  = extractCurve(rows, 1,  true);
    var c13 = extractCurve(rows, 13, true);

    /* P-M2: curvas 7 (90°) y 19 (270°), usando columna M2 */
    var c7  = extractCurve(rows, 7,  false);
    var c19 = extractCurve(rows, 19, false);

    if (!c1.P.length || !c13.P.length) {
      msg.innerHTML = '<p style="color:#e74c3c;margin:0;">&#9888; No se pudieron leer las curvas P-M3. Verifica el formato de los datos.</p>';
      return;
    }
    if (!c7.P.length || !c19.P.length) {
      msg.innerHTML = '<p style="color:#e74c3c;margin:0;">&#9888; No se pudieron leer las curvas P-M2. Verifica el formato de los datos.</p>';
      return;
    }

    /* Diagrama P-M3 */
    Plotly.newPlot('pm3-chart', [
      { x: c1.M,  y: c1.P,  mode: 'lines', name: 'Curva 1 — 0\u00b0',   line: { color: '#2980b9', width: 2.5 } },
      { x: c13.M, y: c13.P, mode: 'lines', name: 'Curva 13 — 180\u00b0', line: { color: '#e67e22', width: 2.5 } }
    ], makeLayout('P-M3'), { responsive: true });

    /* Diagrama P-M2 */
    Plotly.newPlot('pm2-chart', [
      { x: c7.M,  y: c7.P,  mode: 'lines', name: 'Curva 7 — 90\u00b0',  line: { color: '#27ae60', width: 2.5 } },
      { x: c19.M, y: c19.P, mode: 'lines', name: 'Curva 19 — 270\u00b0', line: { color: '#8e44ad', width: 2.5 } }
    ], makeLayout('P-M2'), { responsive: true });
  };

  window.clearPM = function () {
    document.getElementById('pm-input').value = '';
    document.getElementById('pm-msg').innerHTML = '';
    var el3 = document.getElementById('pm3-chart');
    var el2 = document.getElementById('pm2-chart');
    if (el3 && el3._fullLayout) { Plotly.purge(el3); }
    if (el2 && el2._fullLayout) { Plotly.purge(el2); }
  };

}());
</script>
