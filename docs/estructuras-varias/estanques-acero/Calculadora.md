---
title: "Calculadora — Propiedades del Estanque Cilíndrico"
type: tool
standard_ref: "API-650"
tags: [estanque, calculadora, api-650, propiedades, hidrostatica]
related:
  - index.md
created: 2026-04-30
updated: 2026-04-30
---

# Calculadora — Propiedades del Estanque Cilíndrico

Herramienta interactiva para calcular las **propiedades geométricas e hidrostáticas** de un estanque cilíndrico vertical de acero.

---

## Parámetros de entrada

> **Instrucciones:** Ingresa las dimensiones del estanque y presiona **Calcular**. Los resultados aparecen a continuación junto con las ecuaciones que los generan.

<div style="background:var(--md-code-bg-color,#f5f5f5);border-radius:8px;padding:1.5rem;">

<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem 1.5rem;">

  <label style="display:flex;flex-direction:column;gap:4px;font-size:0.9rem;">
    <span><em>D</em> — Diámetro interior (m)</span>
    <input id="tnk-D" type="number" value="10" min="0.1" step="0.1"
           style="padding:4px 8px;border:1px solid #bbb;border-radius:4px;font-size:1rem;">
  </label>

  <label style="display:flex;flex-direction:column;gap:4px;font-size:0.9rem;">
    <span><em>H</em> — Altura de Manto/Cilindro (m)</span>
    <input id="tnk-H" type="number" value="8" min="0.1" step="0.1"
           style="padding:4px 8px;border:1px solid #bbb;border-radius:4px;font-size:1rem;">
  </label>

  <label style="display:flex;flex-direction:column;gap:4px;font-size:0.9rem;">
    <span><em>h<sub>l</sub></em> — Altura del líquido (m)</span>
    <input id="tnk-hl" type="number" value="7" min="0.01" step="0.1"
           style="padding:4px 8px;border:1px solid #bbb;border-radius:4px;font-size:1rem;">
  </label>

  <label style="display:flex;flex-direction:column;gap:4px;font-size:0.9rem;">
    <span><em>ρ<sub>l</sub></em> — Densidad del líquido (kg/m³)</span>
    <input id="tnk-rho" type="number" value="1000" min="1" step="1"
           style="padding:4px 8px;border:1px solid #bbb;border-radius:4px;font-size:1rem;">
  </label>

</div>

<button onclick="calcTanque()"
  style="margin-top:1rem;padding:8px 24px;background:#4a90d9;color:#fff;border:none;border-radius:5px;cursor:pointer;font-size:1rem;">
  Calcular
</button>

</div>

---

## Resultados y ecuaciones

<div id="tnk-results" style="margin-top:1rem;"></div>

<div id="tnk-chart" style="margin-top:1rem;"></div>

<script>
function calcTanque() {
  var D   = parseFloat(document.getElementById('tnk-D').value);
  var H   = parseFloat(document.getElementById('tnk-H').value);
  var hl  = parseFloat(document.getElementById('tnk-hl').value);
  var rho = parseFloat(document.getElementById('tnk-rho').value);
  var g   = 9.81;

  var out = document.getElementById('tnk-results');

  if ([D, H, hl, rho].some(isNaN) || D <= 0 || H <= 0 || hl <= 0 || rho <= 0) {
    out.innerHTML = '<p style="color:red;">⚠ Ingresa valores positivos en todos los campos.</p>';
    return;
  }
  if (hl > H) {
    out.innerHTML = '<p style="color:red;">⚠ La altura del líquido (' + hl + ' m) supera la altura del estanque (' + H + ' m).</p>';
    return;
  }

  var R       = D / 2;
  var Abase   = Math.PI * R * R;
  var Alat    = Math.PI * D * H;
  var Vtotal  = Abase * H;
  var Vliq    = Abase * hl;
  var mliq    = rho * Vliq;
  var Wliq    = mliq * g / 1000;          // kN
  var pbase   = rho * g * hl / 1000;      // kPa
  var Fbase   = pbase * Abase;            // kN
  var eta     = (hl / H) * 100;
  var hdD  = hl / D;   // relación h/D
  var mi_ratio = Math.tanh(0.866 * D / hl) / (0.866 * D / hl);
  var mi       = mi_ratio * mliq;            // kg
  var hi_ratio  = (hdD <= 0.75) ? 0.375 : (0.5 - 0.09375 / hdD);
  var hi        = hi_ratio * hl;              // m
  var hi_cond   = (hdD <= 0.75)
    ? '\\;\\text{(}h/D = '+f(hdD,3)+'\\leq 0{,}75\\text{)}'
    : '\\;\\text{(}h/D = '+f(hdD,3)+'> 0{,}75\\text{)}';
  var his_ratio = (hdD <= 1.33)
    ? (0.866 * D / hl) / (2 * Math.tanh(0.866 * D / hl)) - 0.125
    : 0.45;
  var his      = his_ratio * hl;              // m  (h_i*)
  var his_cond  = (hdD <= 1.33)
    ? '\\;\\text{(}h/D = '+f(hdD,3)+'\\leq 1{,}33\\text{)}'
    : '\\;\\text{(}h/D = '+f(hdD,3)+'> 1{,}33\\text{)}';
  var mc_ratio = 0.23 * Math.tanh(3.68 * hl / D) / hdD;
  var mc       = mc_ratio * mliq;            // kg
  var cosh_c   = Math.cosh(3.68 * hdD);
  var sinh_c   = Math.sinh(3.68 * hdD);
  var hc_ratio = 1 - (cosh_c - 1) / (3.68 * hdD * sinh_c);
  var hc       = hc_ratio * hl;              // m
  var hcs_ratio = 1 - (cosh_c - 2.01) / (3.68 * hdD * sinh_c);
  var hcs       = hcs_ratio * hl;            // m  (h_c*)


  function f(v, d)    { return v.toLocaleString('es-CL', {minimumFractionDigits: d, maximumFractionDigits: d}); }
  function eq(latex)  { return '<div class="arithmatex">\\[' + latex + '\\]</div>'; }
  function eqi(latex) { return '<span class="arithmatex">\\(' + latex + '\\)</span>'; }

  var html =
    '<div style="border-left:4px solid #4a90d9;padding:0.75rem 1.25rem;margin-bottom:1rem;background:var(--md-code-bg-color,#f5f5f5);border-radius:0 6px 6px 0;">' +
    '<strong>Parámetros ingresados:</strong> ' +
    eqi('D = ' + f(D,2) + '\\text{ m},\\quad H = ' + f(H,2) + '\\text{ m},\\quad h_l = ' + f(hl,2) + '\\text{ m},\\quad \\rho_l = ' + f(rho,0) + '\\text{ kg/m}^3') +
    '</div>' +

    '<h3 style="margin-top:1.5rem;">1. Geometría</h3>' +
    eq('R = \\dfrac{D}{2} = \\dfrac{' + f(D,2) + '}{2} = ' + f(R,3) + '\\text{ m}') +
    eq('A_{\\text{base}} = \\pi R^2 = \\pi\\,('+f(R,3)+')^2 = '+f(Abase,3)+'\\text{ m}^2') +
    eq('A_{\\text{lat}} = \\pi D H = \\pi\\,('+f(D,2)+'\\cdot'+f(H,2)+') = '+f(Alat,3)+'\\text{ m}^2') +
    eq('V_{\\text{total}} = A_{\\text{base}}\\cdot H = '+f(Abase,3)+'\\times '+f(H,2)+' = '+f(Vtotal,3)+'\\text{ m}^3') +

    '<h3 style="margin-top:1.5rem;">2. Líquido contenido</h3>' +
    eq('V_l = A_{\\text{base}}\\cdot h_l = '+f(Abase,3)+'\\times '+f(hl,2)+' = '+f(Vliq,3)+'\\text{ m}^3') +
    eq('m_l = \\rho_l\\,V_l = '+f(rho,0)+'\\times '+f(Vliq,3)+' = '+f(mliq,1)+'\\text{ kg}') +
    eq('W_l = m_l\\,g = '+f(mliq,1)+'\\times 9{,}81 = '+f(Wliq,2)+'\\text{ kN}') +
    eq('\\eta = \\dfrac{h_l}{H} = \\dfrac{'+f(hl,2)+'}{'+f(H,2)+'} = '+f(eta,1)+'\\%') +

    '<h3 style="margin-top:1.5rem;">3. Presión hidrostática</h3>' +
    eq('p_{\\text{base}} = \\rho_l\\,g\\,h_l = '+f(rho,0)+'\\times 9{,}81\\times '+f(hl,2)+' = '+f(pbase,2)+'\\text{ kPa}') +
    eq('F_{\\text{base}} = p_{\\text{base}}\\cdot A_{\\text{base}} = '+f(pbase,2)+'\\times '+f(Abase,3)+' = '+f(Fbase,2)+'\\text{ kN}')+

    '<h3 style="margin-top:1.5rem;">4. Masas y alturas — Componente Impulsiva</h3>' +
    eq('\\frac{m_i}{m} = \\frac{\\tanh(0.866\\,D/h_l)}{0.866\\,D/h_l} = ' + f(mi_ratio,4)
    + '\\quad\\Rightarrow\\quad m_i = ' + f(mi,1) + '\\text{ kg}') +
    eq('\\frac{h_i}{h_l} = ' + f(hi_ratio,2) + hi_cond
    + '\\quad\\Rightarrow\\quad h_i = ' + f(hi,2) + '\\text{ m}') +
    eq('\\frac{h_i^*}{h_l} = ' + f(his_ratio,2) + his_cond
    + '\\quad\\Rightarrow\\quad h_i^* = ' + f(his,2) + '\\text{ m}') +

    '<h3 style="margin-top:1.5rem;">5. Masas y alturas — Componente Convectiva</h3>' +
    eq('\\frac{m_c}{m} = 0.23\\,\\frac{\\tanh(3.68\\,h_l/D)}{h_l/D} = ' + f(mc_ratio,4)
    + '\\quad\\Rightarrow\\quad m_c = ' + f(mc,1) + '\\text{ kg}') +
    eq('\\frac{h_c}{h_l} = ' + f(hc_ratio,2)
    + '\\quad\\Rightarrow\\quad h_c = ' + f(hc,2) + '\\text{ m}') +
    eq('\\frac{h_c^*}{h_l} = ' + f(hcs_ratio,2)
    + '\\quad\\Rightarrow\\quad h_c^* = ' + f(hcs,2) + '\\text{ m}') +

    '<div style="display:flex;flex-wrap:wrap;gap:1rem;margin-top:1.5rem;">' +
    '<div id="tnk-chart-heights" style="flex:1 1 340px;min-width:280px;"></div>' +
    '<div id="tnk-chart-masses"  style="flex:1 1 340px;min-width:280px;"></div>' +
    '</div>';

  out.innerHTML = html;

  // Re-renderizar ecuaciones MathJax inyectadas dinámicamente
  if (window.MathJax && MathJax.typesetPromise) {
    MathJax.typesetPromise([out]);
  }

  // ── Gráfico Plotly ──────────────────────────────────────────────
  var xs = [], yi = [], yis = [], yc = [], ycs = [], ymi = [], ymc = [];
  for (var i = 1; i <= 400; i++) {
    var x = i * 0.01;   // h/D de 0.01 a 4.0
    xs.push(x);
    // h_i / h_l
    yi.push(x <= 0.75 ? 0.375 : 0.5 - 0.09375 / x);
    // h_i* / h_l
    yis.push(x <= 1.33
      ? (0.866 / x) / (2 * Math.tanh(0.866 / x)) - 0.125
      : 0.45);
    // h_c / h_l
    var ch = Math.cosh(3.68 * x), sh = Math.sinh(3.68 * x);
    yc.push(1 - (ch - 1)   / (3.68 * x * sh));
    ycs.push(1 - (ch - 2.01) / (3.68 * x * sh));
    // m_i/m  y  m_c/m
    ymi.push(Math.tanh(0.866 / x) / (0.866 / x));
    ymc.push(0.23 * Math.tanh(3.68 * x) / x);
  }

  var colorGrid = 'rgba(180,180,180,0.3)';
  var opts     = {responsive: true, displayModeBar: false};
  var vline    = {type:'line', x0:hdD, x1:hdD, y0:0, y1:1.6, line:{color:'#e74c3c', width:1.5, dash:'dot'}};
  var vann     = {x:hdD, y:1.55, text:'h/D = '+f(hdD,3), showarrow:false, font:{color:'#e74c3c', size:11}};
  var baseLayout = {
    height: 340,
    margin: {t:40, r:16, b:60, l:52},
    xaxis: {title:'h/D', gridcolor:colorGrid, range:[0,2]},
    legend: {orientation:'h', y:-0.28, font:{size:11}},
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor:  'rgba(0,0,0,0)',
    shapes: [vline],
    annotations: [vann]
  };

  // ── Gráfico 1: Alturas ──────────────────────────────────────────
  var tracesH = [
    {x:xs, y:yi,  mode:'lines', name:'h<sub>i</sub>/h<sub>l</sub>',  line:{color:'#2980b9', width:2}},
    {x:xs, y:yis, mode:'lines', name:'h<sub>i</sub>*/h<sub>l</sub>', line:{color:'#2980b9', width:2, dash:'dash'}},
    {x:xs, y:yc,  mode:'lines', name:'h<sub>c</sub>/h<sub>l</sub>',  line:{color:'#27ae60', width:2}},
    {x:xs, y:ycs, mode:'lines', name:'h<sub>c</sub>*/h<sub>l</sub>', line:{color:'#27ae60', width:2, dash:'dash'}},
    {x:[hdD], y:[hi_ratio],  mode:'markers', showlegend:false, marker:{color:'#2980b9', size:10, symbol:'circle'}},
    {x:[hdD], y:[his_ratio], mode:'markers', showlegend:false, marker:{color:'#2980b9', size:10, symbol:'diamond'}},
    {x:[hdD], y:[hc_ratio],  mode:'markers', showlegend:false, marker:{color:'#27ae60', size:10, symbol:'circle'}},
    {x:[hdD], y:[hcs_ratio], mode:'markers', showlegend:false, marker:{color:'#27ae60', size:10, symbol:'diamond'}}
  ];
  var layoutH = Object.assign({}, baseLayout, {
    title: {text:'Alturas impulsiva y convectiva', font:{size:13}},
    yaxis: {title:'h / h<sub>l</sub>', gridcolor:colorGrid, range:[0,2.1]}
  });
  Plotly.newPlot('tnk-chart-heights', tracesH, layoutH, opts);

  // ── Gráfico 2: Masas ────────────────────────────────────────────
  var tracesM = [
    {x:xs, y:ymi, mode:'lines', name:'m<sub>i</sub>/m', line:{color:'#8e44ad', width:2}},
    {x:xs, y:ymc, mode:'lines', name:'m<sub>c</sub>/m', line:{color:'#e67e22', width:2}},
    {x:[hdD], y:[mi_ratio], mode:'markers', showlegend:false, marker:{color:'#8e44ad', size:10, symbol:'circle'}},
    {x:[hdD], y:[mc_ratio], mode:'markers', showlegend:false, marker:{color:'#e67e22', size:10, symbol:'circle'}}
  ];
  var layoutM = Object.assign({}, baseLayout, {
    title: {text:'Masas impulsiva y convectiva', font:{size:13}},
    yaxis: {title:'m / m<sub>total</sub>', gridcolor:colorGrid, range:[0,1.1]}
  });
  Plotly.newPlot('tnk-chart-masses', tracesM, layoutM, opts);
}
</script>
