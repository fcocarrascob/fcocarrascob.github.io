---
title: "Calculadora — Diseño de Viga Rectangular ACI 318-25"
type: tool
standard_ref: "ACI-318-25"
chapter: "9"
section: "9.3–9.6"
variables: [Mu, Vu, wu, As, phi, fc, fy, b, d, L]
units: "SI"
tags: [viga, diseño, flexión, cortante, acero, aci-318]
related:
  - ../../hormigon/ACI-318-Ch9-Beams.md
  - ../../hormigon/ACI-318-Ch21-PhiFactors.md
  - index.md
created: 2026-05-03
updated: 2026-05-03
---

# Calculadora — Diseño de Viga Rectangular ACI 318-25

Herramienta interactiva para el **diseño a flexión y cortante** de una viga rectangular simplemente apoyada con carga uniforme, según ACI 318-25.

---

## Parámetros de entrada

> **Instrucciones:** Ingresa las propiedades del elemento y presiona **Calcular**. Los resultados se presentan con las ecuaciones relevantes.

<div style="background:var(--md-code-bg-color,#f5f5f5);border-radius:8px;padding:1.5rem;">

<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem 1.5rem;">

  <label style="display:flex;flex-direction:column;gap:4px;font-size:0.9rem;">
    <span><em>L</em> — Longitud de la viga (m)</span>
    <input id="vg-L" type="number" value="6" min="0.5" step="0.1"
           style="padding:4px 8px;border:1px solid #bbb;border-radius:4px;font-size:1rem;">
  </label>

  <label style="display:flex;flex-direction:column;gap:4px;font-size:0.9rem;">
    <span><em>w<sub>D</sub></em> — Carga muerta uniforme (kN/m)</span>
    <input id="vg-wD" type="number" value="15" min="0" step="0.5"
           style="padding:4px 8px;border:1px solid #bbb;border-radius:4px;font-size:1rem;">
  </label>

  <label style="display:flex;flex-direction:column;gap:4px;font-size:0.9rem;">
    <span><em>w<sub>L</sub></em> — Carga viva uniforme (kN/m)</span>
    <input id="vg-wL" type="number" value="10" min="0" step="0.5"
           style="padding:4px 8px;border:1px solid #bbb;border-radius:4px;font-size:1rem;">
  </label>

  <label style="display:flex;flex-direction:column;gap:4px;font-size:0.9rem;">
    <span><em>f'<sub>c</sub></em> — Resistencia del hormigón (MPa)</span>
    <input id="vg-fc" type="number" value="25" min="17" step="1"
           style="padding:4px 8px;border:1px solid #bbb;border-radius:4px;font-size:1rem;">
  </label>

  <label style="display:flex;flex-direction:column;gap:4px;font-size:0.9rem;">
    <span><em>f<sub>y</sub></em> — Resistencia del acero (MPa)</span>
    <input id="vg-fy" type="number" value="420" min="280" step="10"
           style="padding:4px 8px;border:1px solid #bbb;border-radius:4px;font-size:1rem;">
  </label>

  <label style="display:flex;flex-direction:column;gap:4px;font-size:0.9rem;">
    <span><em>b</em> — Ancho de la sección (mm)</span>
    <input id="vg-b" type="number" value="300" min="100" step="25"
           style="padding:4px 8px;border:1px solid #bbb;border-radius:4px;font-size:1rem;">
  </label>

  <label style="display:flex;flex-direction:column;gap:4px;font-size:0.9rem;">
    <span><em>d</em> — Altura efectiva (mm)</span>
    <input id="vg-d" type="number" value="500" min="100" step="25"
           style="padding:4px 8px;border:1px solid #bbb;border-radius:4px;font-size:1rem;">
  </label>

</div>

<button onclick="calcViga()"
  style="margin-top:1rem;padding:8px 24px;background:#4a90d9;color:#fff;border:none;border-radius:5px;cursor:pointer;font-size:1rem;">
  Calcular
</button>

</div>

---

## Resultados y ecuaciones

<div id="vg-results" style="margin-top:1rem;"></div>

<div style="display:flex;flex-wrap:wrap;gap:1rem;margin-top:0.5rem;">
  <div id="vg-chart-M" style="flex:1 1 340px;min-width:280px;"></div>
  <div id="vg-chart-V" style="flex:1 1 340px;min-width:280px;"></div>
</div>

<script>
function calcViga() {
  var L   = parseFloat(document.getElementById('vg-L').value);
  var wD  = parseFloat(document.getElementById('vg-wD').value);
  var wL  = parseFloat(document.getElementById('vg-wL').value);
  var fc  = parseFloat(document.getElementById('vg-fc').value);
  var fy  = parseFloat(document.getElementById('vg-fy').value);
  var b   = parseFloat(document.getElementById('vg-b').value);   // mm
  var d   = parseFloat(document.getElementById('vg-d').value);   // mm

  var out = document.getElementById('vg-results');

  if ([L, wD, wL, fc, fy, b, d].some(isNaN) ||
      L <= 0 || wD < 0 || wL < 0 || fc <= 0 || fy <= 0 || b <= 0 || d <= 0) {
    out.innerHTML = '<p style="color:red;">⚠ Verifica que todos los valores sean positivos.</p>';
    return;
  }

  // ── Combinación última ────────────────────────────────────────────
  var wu  = 1.2 * wD + 1.6 * wL;          // kN/m
  var Mu  = wu * L * L / 8;               // kN·m
  var Vu  = wu * L / 2;                   // kN

  // ── Acero requerido (iteración a/d) §22.2 ────────────────────────
  // φ flexión = 0.90 para sección controlada por tensión (§21.2.1)
  var phi_f = 0.90;
  var b_m   = b / 1000;     // m
  var d_m   = d / 1000;     // m
  var fy_kPa = fy * 1000;   // kPa
  var fc_kPa = fc * 1000;   // kPa

  // As initial guess: a ≈ 0.1*d
  var a  = 0.1 * d_m;
  var As = 0;
  for (var i = 0; i < 30; i++) {
    As = (Mu * 1000) / (phi_f * fy_kPa * (d_m - a / 2));  // m²
    var new_a = (As * fy_kPa) / (0.85 * fc_kPa * b_m);
    if (Math.abs(new_a - a) < 1e-8) break;
    a = new_a;
  }
  var As_cm2  = As * 1e4;     // cm²
  var a_mm    = a * 1000;     // mm

  // ── β₁ §22.2.2.4.3 ───────────────────────────────────────────────
  var beta1 = (fc <= 28) ? 0.85 : Math.max(0.65, 0.85 - 0.05 * (fc - 28) / 7);

  // ── Acero mínimo §9.6.1.2 ────────────────────────────────────────
  var As_min1 = (0.25 * Math.sqrt(fc) / fy) * b_m * d_m * 1e4;  // cm²
  var As_min2 = (1.4 / fy) * b_m * d_m * 1e4;                   // cm²
  var As_min  = Math.max(As_min1, As_min2);

  // ── Acero máximo §21.2.2 (tensión-controlada: εt ≥ 0.004) ────────
  // ρ_max corresponds to c/d = 0.003/(0.003 + 0.004)
  var c_max   = (0.003 / 0.007) * d_m;
  var As_max  = (0.85 * fc_kPa * beta1 * c_max * b_m / fy_kPa) * 1e4;  // cm²

  // ── As de diseño ─────────────────────────────────────────────────
  var As_use  = Math.max(As_cm2, As_min);

  // ── Cortante nominal φVn §22.5 ───────────────────────────────────
  // Vc simplificado §22.5.5.1 (sin Nₙ, ρw mínimo)
  var phi_v  = 0.75;
  var rho_w  = (As_use / 1e4) / (b_m * d_m);
  // ACI 318-25 §22.5.5.1: Vc = [8λ(ρw)^(1/3)√f'c + Nu/(6Ag)] bw·d
  var lambda  = 1.0;
  var Vc_MPa  = 8 * lambda * Math.pow(rho_w, 1/3) * Math.sqrt(fc) / 1000;  // MPa → kN/mm²
  var Vc      = Vc_MPa * b * d / 1000;         // kN  (b·d en mm²)
  var phi_Vc  = phi_v * Vc;                    // kN

  // ── Verificaciones ───────────────────────────────────────────────
  var ok_As_min = As_use >= As_min;
  var ok_As_max = As_use <= As_max;
  var ok_V      = phi_Vc >= Vu;
  var ok_tens   = As_use <= As_max;  // sección tensión-controlada

  function f(v, d2) { return v.toLocaleString('es-CL', { minimumFractionDigits: d2, maximumFractionDigits: d2 }); }
  function eq(latex)  { return '<div class="arithmatex">\\[' + latex + '\\]</div>'; }
  function eqi(latex) { return '<span class="arithmatex">\\(' + latex + '\\)</span>'; }
  function badge(ok, okText, errText) {
    var color = ok ? '#27ae60' : '#e67e22';
    var icon  = ok ? '✅' : '⚠';
    return '<span style="background:' + color + '22;border:1px solid ' + color + ';color:' + color +
           ';border-radius:4px;padding:2px 8px;font-size:0.85rem;font-weight:600;">' +
           icon + ' ' + (ok ? okText : errText) + '</span>';
  }

  var html =
    '<div style="border-left:4px solid #4a90d9;padding:0.75rem 1.25rem;margin-bottom:1rem;background:var(--md-code-bg-color,#f5f5f5);border-radius:0 6px 6px 0;">' +
    '<strong>Parámetros ingresados:</strong> ' +
    eqi('L = ' + f(L,2) + '\\text{ m},\\quad f\'_c = ' + f(fc,0) + '\\text{ MPa},\\quad f_y = ' + f(fy,0) + '\\text{ MPa},\\quad b = ' + f(b,0) + '\\text{ mm},\\quad d = ' + f(d,0) + '\\text{ mm}') +
    '</div>' +

    '<h3 style="margin-top:1.5rem;">1. Combinación de carga última §5.3.1</h3>' +
    eq('w_u = 1.2\\,w_D + 1.6\\,w_L = 1.2\\times' + f(wD,1) + ' + 1.6\\times' + f(wL,1) +
       ' = ' + f(wu,2) + '\\text{ kN/m}') +

    '<h3 style="margin-top:1.5rem;">2. Solicitaciones máximas</h3>' +
    eq('M_u = \\dfrac{w_u\\,L^2}{8} = \\dfrac{' + f(wu,2) + '\\times(' + f(L,2) + ')^2}{8} = ' +
       f(Mu,2) + '\\text{ kN·m}') +
    eq('V_u = \\dfrac{w_u\\,L}{2} = \\dfrac{' + f(wu,2) + '\\times' + f(L,2) + '}{2} = ' +
       f(Vu,2) + '\\text{ kN}') +

    '<h3 style="margin-top:1.5rem;">3. Bloque de compresión equivalente — §22.2</h3>' +
    eq('\\beta_1 = ' + f(beta1,3) +
       (fc <= 28 ? '\\;\\text{(}f\'_c\\leq 28\\text{ MPa)}' :
        '\\;\\text{(}f\'_c > 28\\text{ MPa, interpolado)}')) +

    '<h3 style="margin-top:1.5rem;">4. Área de acero requerida — §22.2 (iteración)</h3>' +
    eq('A_s = \\frac{M_u}{\\phi_f\\,f_y\\!\\left(d - \\dfrac{a}{2}\\right)} = ' +
       f(As_cm2, 2) + '\\text{ cm}^2\\quad\\text{con}\\quad a = ' + f(a_mm,1) + '\\text{ mm}') +

    '<h3 style="margin-top:1.5rem;">5. Acero mínimo — §9.6.1.2</h3>' +
    eq('A_{s,\\min} = \\max\\!\\left(\\frac{0.25\\sqrt{f\'_c}}{f_y}\\,b\\,d,\\;\\frac{1.4}{f_y}\\,b\\,d\\right) = ' +
       f(As_min,2) + '\\text{ cm}^2') +

    '<h3 style="margin-top:1.5rem;">6. Acero máximo — §21.2.2 (sección tensión-controlada)</h3>' +
    eq('A_{s,\\max} = \\frac{0.85\\,f\'_c\\,\\beta_1\\,c_{\\max}\\,b}{f_y} = ' +
       f(As_max,2) + '\\text{ cm}^2\\quad\\text{con}\\quad c_{\\max} = ' +
       f(c_max*1000,1) + '\\text{ mm}') +

    '<h3 style="margin-top:1.5rem;">7. Acero de diseño</h3>' +
    eq('A_{s,\\text{uso}} = \\max(A_{s,\\text{req}},\\;A_{s,\\min}) = ' + f(As_use,2) + '\\text{ cm}^2') +

    '<h3 style="margin-top:1.5rem;">8. Verificación de cortante — §22.5.5.1</h3>' +
    eq('\\rho_w = \\frac{A_{s,\\text{uso}}}{b\\,d} = ' + f(rho_w*100,4) + '\\%') +
    eq('V_c = 8\\,\\lambda\\,\\rho_w^{1/3}\\sqrt{f\'_c}\\,b_w\\,d = ' + f(Vc,2) + '\\text{ kN}') +
    eq('\\phi V_c = ' + f(phi_v,2) + '\\times' + f(Vc,2) + ' = ' + f(phi_Vc,2) + '\\text{ kN}') +

    '<h3 style="margin-top:1.5rem;">9. Resumen de verificaciones</h3>' +
    '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:0.5rem;">' +
    '<div>' + badge(ok_As_min, 'A<sub>s</sub> ≥ A<sub>s,mín</sub>', 'A<sub>s</sub> &lt; A<sub>s,mín</sub> — aumentar sección') + '</div>' +
    '<div>' + badge(ok_As_max, 'A<sub>s</sub> ≤ A<sub>s,máx</sub> (tensión-controlada)', 'A<sub>s</sub> &gt; A<sub>s,máx</sub> — aumentar sección') + '</div>' +
    '<div>' + badge(ok_V,  'φV<sub>c</sub> ≥ V<sub>u</sub> (sin estribo requerido)', 'φV<sub>c</sub> &lt; V<sub>u</sub> — diseñar estribos') + '</div>' +
    '</div>' +

    '<div style="margin-top:1rem;padding:0.75rem 1rem;background:var(--md-code-bg-color,#f5f5f5);border-radius:6px;">' +
    '<strong>Resultado:</strong> ' +
    eqi('A_{s,\\text{uso}} = ' + f(As_use,2) + '\\text{ cm}^2') +
    (ok_As_max && ok_As_min
      ? ' — Sección dentro de límites normativos.'
      : ' — <span style="color:#e67e22;">Revisar observaciones arriba.</span>') +
    '</div>';

  out.innerHTML = html;

  if (window.MathJax && MathJax.typesetPromise) {
    MathJax.typesetPromise([out]);
  }

  // ── Gráficos ─────────────────────────────────────────────────────
  var nPts = 200;
  var xs   = [], Ms = [], Vs = [];
  for (var i = 0; i <= nPts; i++) {
    var x = i * L / nPts;
    xs.push(x);
    Ms.push(wu * x * (L - x) / 2);
    Vs.push(wu * (L / 2 - x));
  }

  var colorGrid = 'rgba(180,180,180,0.3)';
  var baseLayout = {
    height: 300,
    margin: { t: 40, r: 16, b: 52, l: 60 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor:  'rgba(0,0,0,0)',
    xaxis: { title: 'x (m)', gridcolor: colorGrid, range: [0, L] },
    legend: { orientation: 'h', y: -0.3 }
  };
  var opts = { responsive: true, displayModeBar: false };

  // Diagrama de momentos
  var xMid = L / 2;
  Plotly.newPlot('vg-chart-M', [
    { x: xs, y: Ms, mode: 'lines', name: 'M(x)', line: { color: '#2980b9', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(41,128,185,0.1)' },
    { x: [xMid], y: [Mu], mode: 'markers+text', name: 'M<sub>u</sub>', text: ['M<sub>u</sub> = ' + f(Mu,1) + ' kN·m'], textposition: 'top center', marker: { color: '#e74c3c', size: 10 }, showlegend: false }
  ], Object.assign({}, baseLayout, {
    title: { text: 'Diagrama de Momentos M(x)', font: { size: 13 } },
    yaxis: { title: 'M (kN·m)', gridcolor: colorGrid }
  }), opts);

  // Diagrama de cortantes
  Plotly.newPlot('vg-chart-V', [
    { x: xs, y: Vs, mode: 'lines', name: 'V(x)', line: { color: '#27ae60', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(39,174,96,0.1)' },
    { x: [0, L], y: [Vu, -Vu], mode: 'markers+text', name: 'V<sub>u</sub>', text: ['V<sub>u</sub> = ' + f(Vu,1) + ' kN', '-' + f(Vu,1) + ' kN'], textposition: ['top right', 'bottom right'], marker: { color: '#e74c3c', size: 10 }, showlegend: false }
  ], Object.assign({}, baseLayout, {
    title: { text: 'Diagrama de Cortantes V(x)', font: { size: 13 } },
    yaxis: { title: 'V (kN)', gridcolor: colorGrid }
  }), opts);
}
</script>
