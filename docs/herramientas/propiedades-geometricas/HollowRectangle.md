---
title: "Rectángulo Hueco — Propiedades Geométricas"
type: reference
tags: [rectangulo-hueco, tubo-rectangular, inercia, centroide, modulo-seccion, radio-giro, seccion-transversal]
related:
  - index.md
  - IBeam-Simetrico.md
created: 2026-04-29
updated: 2026-04-29
---

# Rectángulo Hueco — Propiedades Geométricas

Propiedades geométricas para una sección rectangular hueca de paredes rectas (sección doblemente simétrica). Aplica a perfiles tubulares rectangulares (RHS) y cuadrados (SHS).

---

## Notación y dimensiones

<div style="display:flex; flex-wrap:wrap; gap:2.5rem; align-items:flex-start; margin-bottom:1.5rem;" markdown="1">

<div style="flex:0 0 auto;" markdown="1">
<svg xmlns="http://www.w3.org/2000/svg" width="260" height="270" viewBox="0 0 260 270">
  <!-- eje x centroidal -->
  <line x1="15" y1="130" x2="230" y2="130" stroke="#888" stroke-width="1" stroke-dasharray="5,4"/>
  <!-- eje y centroidal -->
  <line x1="120" y1="10" x2="120" y2="245" stroke="#888" stroke-width="1" stroke-dasharray="5,4"/>
  <!-- eje x1 (esquina inferior) -->
  <line x1="15" y1="225" x2="230" y2="225" stroke="#aaa" stroke-width="1" stroke-dasharray="3,3"/>
  <!-- eje y1 (esquina izquierda) -->
  <line x1="30" y1="10" x2="30" y2="245" stroke="#aaa" stroke-width="1" stroke-dasharray="3,3"/>
  <!-- rectángulo exterior -->
  <rect x="30" y="30" width="180" height="195" fill="#4a90d9" stroke="#1a5a9a" stroke-width="1.5" opacity="0.85"/>
  <!-- hueco interior -->
  <rect x="65" y="65" width="110" height="125" fill="white" stroke="#1a5a9a" stroke-width="1"/>
  <!-- cota b (exterior, arriba) -->
  <line x1="30"  y1="18" x2="210" y2="18" stroke="#333" stroke-width="1"/>
  <line x1="30"  y1="14" x2="30"  y2="22" stroke="#333" stroke-width="1"/>
  <line x1="210" y1="14" x2="210" y2="22" stroke="#333" stroke-width="1"/>
  <text x="120" y="13" text-anchor="middle" font-size="12" fill="#333" font-family="serif" font-style="italic">b</text>
  <!-- cota b1 (interior, abajo del hueco) -->
  <line x1="65"  y1="252" x2="175" y2="252" stroke="#555" stroke-width="1"/>
  <line x1="65"  y1="248" x2="65"  y2="256" stroke="#555" stroke-width="1"/>
  <line x1="175" y1="248" x2="175" y2="256" stroke="#555" stroke-width="1"/>
  <text x="120" y="264" text-anchor="middle" font-size="11" fill="#555" font-family="serif" font-style="italic">b<tspan font-size="9" dy="2">1</tspan></text>
  <!-- cota a (exterior, derecha) -->
  <line x1="222" y1="30"  x2="222" y2="225" stroke="#333" stroke-width="1"/>
  <line x1="218" y1="30"  x2="226" y2="30"  stroke="#333" stroke-width="1"/>
  <line x1="218" y1="225" x2="226" y2="225" stroke="#333" stroke-width="1"/>
  <text x="235" y="132" text-anchor="middle" font-size="12" fill="#333" font-family="serif" font-style="italic">a</text>
  <!-- cota a1 (interior, izquierda) -->
  <line x1="18" y1="65"  x2="18" y2="190" stroke="#555" stroke-width="1"/>
  <line x1="14" y1="65"  x2="22" y2="65"  stroke="#555" stroke-width="1"/>
  <line x1="14" y1="190" x2="22" y2="190" stroke="#555" stroke-width="1"/>
  <text x="9" y="131" text-anchor="middle" font-size="11" fill="#555" font-family="serif" font-style="italic">a<tspan font-size="9" dy="2">1</tspan></text>
  <!-- labels ejes centroidales -->
  <text x="227" y="126" font-size="11" fill="#888" font-family="serif" font-style="italic">x</text>
  <text x="124" y="244" font-size="11" fill="#888" font-family="serif" font-style="italic">y</text>
  <!-- labels ejes en esquina -->
  <text x="227" y="221" font-size="10" fill="#aaa" font-family="serif" font-style="italic">x<tspan font-size="8" dy="2">1</tspan></text>
  <text x="33"  y="244" font-size="10" fill="#aaa" font-family="serif" font-style="italic">y<tspan font-size="8" dy="2">1</tspan></text>
  <!-- centroide -->
  <circle cx="120" cy="130" r="3" fill="#e55"/>
  <text x="126" y="125" font-size="10" fill="#e55" font-family="sans-serif">C</text>
  <!-- Cx label -->
  <line x1="30" y1="138" x2="120" y2="138" stroke="#e55" stroke-width="0.8" stroke-dasharray="3,2"/>
  <text x="75" y="150" text-anchor="middle" font-size="10" fill="#e55" font-family="serif" font-style="italic">C<tspan font-size="8" dy="2">x</tspan></text>
  <!-- Cy label -->
  <line x1="128" y1="130" x2="128" y2="225" stroke="#e55" stroke-width="0.8" stroke-dasharray="3,2"/>
  <text x="140" y="182" font-size="10" fill="#e55" font-family="serif" font-style="italic">C<tspan font-size="8" dy="2">y</tspan></text>
</svg>
</div>

<div style="flex:1 1 200px;" markdown="1">

| Símbolo | Descripción |
|---------|-------------|
| $b$ | Ancho exterior |
| $a$ | Altura exterior |
| $b_1$ | Ancho interior del hueco |
| $a_1$ | Altura interior del hueco |
| $C_x = b/2$ | Distancia al centroide (horizontal) |
| $C_y = a/2$ | Distancia al centroide (vertical) |

> **Nota:** Para pared uniforme de espesor $t$: $b_1 = b - 2t$, $a_1 = a - 2t$.

</div>
</div>

---

## Propiedades geométricas

| Propiedad | Símbolo | Ecuación | Observación |
|-----------|---------|----------|-------------|
| Área | $A$ | $A = b\,a - b_1 a_1$ | |
| Perímetro exterior | $P$ | $P = 2\,(a + b)$ | |
| Perímetro interior | $P_1$ | $P_1 = 2\,(a_1 + b_1)$ | |
| Centroide | $C_x,\,C_y$ | $C_x = b/2,\quad C_y = a/2$ | Simetría doble |
| Inercia eje $x$–$x$ | $I_x$ | $I_x = \dfrac{b\,a^3 - b_1 a_1^3}{12}$ | Eje centroidal horizontal |
| Inercia eje $y$–$y$ | $I_y$ | $I_y = \dfrac{b^3 a - b_1^3 a_1}{12}$ | Eje centroidal vertical |
| Inercia eje $x_1$–$x_1$ | $I_{x1}$ | $I_{x1} = \dfrac{b\,a^3}{3} - \dfrac{b_1 a_1(a_1^2 + 3a^2)}{12}$ | Eje en borde inferior |
| Inercia eje $y_1$–$y_1$ | $I_{y1}$ | $I_{y1} = \dfrac{b^3 a}{3} - \dfrac{b_1 a_1(b_1^2 + 3b^2)}{12}$ | Eje en borde izquierdo |
| Inercia polar $z$ | $J_z$ | $J_z = I_x + I_y$ | Respecto al centroide |
| Inercia polar $z_1$ | $J_{z1}$ | $J_{z1} = I_{x1} + I_{y1}$ | Respecto a esquina |
| Radio de giro | $K_x,\,K_y$ | $K_x = \sqrt{\dfrac{I_x}{A}},\quad K_y = \sqrt{\dfrac{I_y}{A}}$ | |
| Radio de giro polar | $K_z$ | $K_z = \sqrt{K_x^2 + K_y^2}$ | |
| Radio de giro $x_1$ | $K_{x1}$ | $K_{x1} = \sqrt{I_{x1}/A}$ | |
| Radio de giro $y_1$ | $K_{y1}$ | $K_{y1} = \sqrt{I_{y1}/A}$ | |
| Radio de giro $z_1$ | $K_{z1}$ | $K_{z1} = \sqrt{K_{x1}^2 + K_{y1}^2}$ | |
| Módulo elástico | $Z_x,\,Z_y$ | $Z_x = \dfrac{I_x}{C_y},\quad Z_y = \dfrac{I_y}{C_x}$ | |

---

## Calculadora

Ingresa las dimensiones exteriores e interiores de la sección.

<div style="background:var(--md-code-bg-color, #f5f5f5); border-radius:8px; padding:1.5rem; max-width:520px;">

<div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem 1.5rem;">
  <label style="display:flex;flex-direction:column;gap:4px;font-size:0.9rem;">
    <span><em>b</em> — ancho exterior (mm)</span>
    <input id="hr-b"  type="number" value="150" min="1" style="padding:4px 8px;border:1px solid #bbb;border-radius:4px;font-size:1rem;">
  </label>
  <label style="display:flex;flex-direction:column;gap:4px;font-size:0.9rem;">
    <span><em>a</em> — altura exterior (mm)</span>
    <input id="hr-a"  type="number" value="200" min="1" style="padding:4px 8px;border:1px solid #bbb;border-radius:4px;font-size:1rem;">
  </label>
  <label style="display:flex;flex-direction:column;gap:4px;font-size:0.9rem;">
    <span><em>b<sub>1</sub></em> — ancho interior (mm)</span>
    <input id="hr-b1" type="number" value="130" min="1" style="padding:4px 8px;border:1px solid #bbb;border-radius:4px;font-size:1rem;">
  </label>
  <label style="display:flex;flex-direction:column;gap:4px;font-size:0.9rem;">
    <span><em>a<sub>1</sub></em> — altura interior (mm)</span>
    <input id="hr-a1" type="number" value="180" min="1" style="padding:4px 8px;border:1px solid #bbb;border-radius:4px;font-size:1rem;">
  </label>
</div>

<button onclick="calcHR()"
  style="margin-top:1rem;padding:8px 24px;background:#4a90d9;color:#fff;border:none;border-radius:5px;cursor:pointer;font-size:1rem;">
  Calcular
</button>

<div id="hr-results" style="margin-top:1.2rem;"></div>
</div>

<script>
function calcHR() {
  var b  = parseFloat(document.getElementById('hr-b').value);
  var a  = parseFloat(document.getElementById('hr-a').value);
  var b1 = parseFloat(document.getElementById('hr-b1').value);
  var a1 = parseFloat(document.getElementById('hr-a1').value);

  if ([b, a, b1, a1].some(isNaN) || b <= 0 || a <= 0 || b1 <= 0 || a1 <= 0) {
    document.getElementById('hr-results').innerHTML =
      '<p style="color:red;">⚠ Ingresa valores positivos en todos los campos.</p>';
    return;
  }
  if (a1 >= a || b1 >= b) {
    document.getElementById('hr-results').innerHTML =
      '<p style="color:red;">⚠ Las dimensiones interiores deben ser menores que las exteriores.</p>';
    return;
  }

  var A   = b * a - b1 * a1;
  var P   = 2 * (a + b);
  var P1  = 2 * (a1 + b1);
  var Cx  = b / 2;
  var Cy  = a / 2;
  var Ix  = (b * Math.pow(a, 3) - b1 * Math.pow(a1, 3)) / 12;
  var Iy  = (Math.pow(b, 3) * a - Math.pow(b1, 3) * a1) / 12;
  var Ix1 = (b * Math.pow(a, 3)) / 3 - (b1 * a1 * (a1*a1 + 3*a*a)) / 12;
  var Iy1 = (Math.pow(b, 3) * a) / 3 - (b1 * a1 * (b1*b1 + 3*b*b)) / 12;
  var Jz  = Ix + Iy;
  var Jz1 = Ix1 + Iy1;
  var Kx  = Math.sqrt(Ix / A);
  var Ky  = Math.sqrt(Iy / A);
  var Kz  = Math.sqrt(Kx*Kx + Ky*Ky);
  var Kx1 = Math.sqrt(Ix1 / A);
  var Ky1 = Math.sqrt(Iy1 / A);
  var Kz1 = Math.sqrt(Kx1*Kx1 + Ky1*Ky1);
  var Zx  = Ix / Cy;
  var Zy  = Iy / Cx;

  function fmt(v, dec) { return v.toLocaleString('es-CL', {maximumFractionDigits: dec}); }

  document.getElementById('hr-results').innerHTML =
    '<table style="border-collapse:collapse;width:100%;font-size:0.9rem;table-layout:fixed;">' +
    '<colgroup>' +
    '<col style="width:38%">' +
    '<col style="width:14%">' +
    '<col style="width:30%">' +
    '<col style="width:18%">' +
    '</colgroup>' +
    '<thead><tr style="background:#4a90d9;color:#fff;">' +
    '<th style="padding:6px 10px;text-align:left;">Propiedad</th>' +
    '<th style="padding:6px 10px;text-align:left;">Símbolo</th>' +
    '<th style="padding:6px 10px;text-align:right;">Valor</th>' +
    '<th style="padding:6px 10px;text-align:left;">Unidad</th>' +
    '</tr></thead><tbody>' +
    hrRow('Área',             'A',    fmt(A,   2), 'mm²') +
    hrRow('Perímetro ext.',   'P',    fmt(P,   2), 'mm')  +
    hrRow('Perímetro int.',   'P₁',   fmt(P1,  2), 'mm')  +
    hrRow('Centroide Cx',     'Cₓ',   fmt(Cx,  2), 'mm')  +
    hrRow('Centroide Cy',     'Cᵧ',   fmt(Cy,  2), 'mm')  +
    hrRow('Inercia x–x',      'Iₓ',   fmt(Ix,  0), 'mm⁴') +
    hrRow('Inercia y–y',      'Iᵧ',   fmt(Iy,  0), 'mm⁴') +
    hrRow('Inercia x₁–x₁',   'Iₓ₁',  fmt(Ix1, 0), 'mm⁴') +
    hrRow('Inercia y₁–y₁',   'Iᵧ₁',  fmt(Iy1, 0), 'mm⁴') +
    hrRow('Inercia polar z',  'Jz',   fmt(Jz,  0), 'mm⁴') +
    hrRow('Inercia polar z₁', 'Jz₁',  fmt(Jz1, 0), 'mm⁴') +
    hrRow('Radio giro Kx',    'Kₓ',   fmt(Kx,  2), 'mm')  +
    hrRow('Radio giro Ky',    'Kᵧ',   fmt(Ky,  2), 'mm')  +
    hrRow('Radio giro Kz',    'Kz',   fmt(Kz,  2), 'mm')  +
    hrRow('Radio giro Kx₁',   'Kₓ₁',  fmt(Kx1, 2), 'mm')  +
    hrRow('Radio giro Ky₁',   'Kᵧ₁',  fmt(Ky1, 2), 'mm')  +
    hrRow('Radio giro Kz₁',   'Kz₁',  fmt(Kz1, 2), 'mm')  +
    hrRow('Mód. elástico x',  'Zₓ',   fmt(Zx,  0), 'mm³') +
    hrRow('Mód. elástico y',  'Zᵧ',   fmt(Zy,  0), 'mm³') +
    '</tbody></table>';
}

function hrRow(name, sym, val, unit) {
  return '<tr style="border-bottom:1px solid #ddd;">' +
    '<td style="padding:5px 10px;">' + name + '</td>' +
    '<td style="padding:5px 10px;font-style:italic;">' + sym + '</td>' +
    '<td style="padding:5px 10px;text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap;">' + val + '</td>' +
    '<td style="padding:5px 10px;color:#666;">' + unit + '</td>' +
    '</tr>';
}
</script>

---

> **Nota:** Las fórmulas son válidas para sección rectangular hueca con hueco centrado y paredes rectas (sin radios de esquina). Para perfiles tubulares normalizados (RHS/SHS) con radios de esquina, el área y la inercia reales difieren ligeramente.

# Rectángulo Hueco — Propiedades Geométricas

Propiedades geométricas para una sección rectangular hueca de paredes rectas (sección doblemente simétrica). Aplica a perfiles tubulares rectangulares (RHS) y cuadrados (SHS).

---

## Notación y dimensiones

<div style="display:flex; flex-wrap:wrap; gap:2.5rem; align-items:flex-start; margin-bottom:1.5rem;" markdown="1">

<div style="flex:0 0 auto;" markdown="1">
<svg xmlns="http://www.w3.org/2000/svg" width="240" height="260" viewBox="0 0 240 260">
  <!-- ejes centroidales -->
  <line x1="120" y1="10" x2="120" y2="250" stroke="#888" stroke-width="1" stroke-dasharray="5,4"/>
  <line x1="15"  y1="130" x2="225" y2="130" stroke="#888" stroke-width="1" stroke-dasharray="5,4"/>
  <!-- rectángulo exterior -->
  <rect x="30" y="30" width="180" height="200" fill="#4a90d9" stroke="#1a5a9a" stroke-width="1.5" opacity="0.85"/>
  <!-- hueco interior (blanco) -->
  <rect x="60" y="60" width="120" height="140" fill="white" stroke="#1a5a9a" stroke-width="1"/>
  <!-- cota b (exterior) -->
  <line x1="30"  y1="18" x2="210" y2="18" stroke="#333" stroke-width="1"/>
  <line x1="30"  y1="14" x2="30"  y2="22" stroke="#333" stroke-width="1"/>
  <line x1="210" y1="14" x2="210" y2="22" stroke="#333" stroke-width="1"/>
  <text x="120" y="13" text-anchor="middle" font-size="12" fill="#333" font-family="serif" font-style="italic">b</text>
  <!-- cota b' (interior) -->
  <line x1="60"  y1="248" x2="180" y2="248" stroke="#555" stroke-width="1"/>
  <line x1="60"  y1="244" x2="60"  y2="252" stroke="#555" stroke-width="1"/>
  <line x1="180" y1="244" x2="180" y2="252" stroke="#555" stroke-width="1"/>
  <text x="120" y="258" text-anchor="middle" font-size="11" fill="#555" font-family="serif" font-style="italic">b'</text>
  <!-- cota d (exterior) -->
  <line x1="222" y1="30"  x2="222" y2="230" stroke="#333" stroke-width="1"/>
  <line x1="218" y1="30"  x2="226" y2="30"  stroke="#333" stroke-width="1"/>
  <line x1="218" y1="230" x2="226" y2="230" stroke="#333" stroke-width="1"/>
  <text x="233" y="134" text-anchor="middle" font-size="12" fill="#333" font-family="serif" font-style="italic">d</text>
  <!-- cota d' (interior) -->
  <line x1="16" y1="60"  x2="16" y2="200" stroke="#555" stroke-width="1"/>
  <line x1="12" y1="60"  x2="20" y2="60"  stroke="#555" stroke-width="1"/>
  <line x1="12" y1="200" x2="20" y2="200" stroke="#555" stroke-width="1"/>
  <text x="8" y="134" text-anchor="middle" font-size="11" fill="#555" font-family="serif" font-style="italic">d'</text>
  <!-- eje x label -->
  <text x="220" y="128" font-size="11" fill="#888" font-family="sans-serif">x</text>
  <!-- eje y label -->
  <text x="125" y="250" font-size="11" fill="#888" font-family="sans-serif">y</text>
  <!-- centroide -->
  <circle cx="120" cy="130" r="3" fill="#e55"/>
  <text x="127" y="126" font-size="10" fill="#e55" font-family="sans-serif">C</text>
</svg>
</div>

<div style="flex:1 1 200px;" markdown="1">

| Símbolo | Descripción |
|---------|-------------|
| $d$ | Altura exterior |
| $b$ | Ancho exterior |
| $d'$ | Altura interior del hueco |
| $b'$ | Ancho interior del hueco |

> **Nota:** Para espesor de pared uniforme $t$: $b' = b - 2t$ y $d' = d - 2t$.

</div>
</div>

---

## Propiedades geométricas

| Propiedad | Símbolo | Ecuación | Observación |
|-----------|---------|----------|-------------|
| Área | $A$ | $A = b\,d - b'd'$ | |
| Perímetro | $P$ | $P = 2\,(b + d) + 2\,(b' + d')$ | Contorno exterior + contorno del hueco |
| Centroide | $\bar{x},\bar{y}$ | $\bar{x} = b/2,\quad \bar{y} = d/2$ | Simetría doble |
| Inercia eje $x$–$x$ | $I_x$ | $I_x = \dfrac{b\,d^3 - b'\,d'^3}{12}$ | Eje fuerte (horizontal) |
| Inercia eje $y$–$y$ | $I_y$ | $I_y = \dfrac{d\,b^3 - d'\,b'^3}{12}$ | Eje débil (vertical) |
| Inercia polar | $J_i$ | $J_i = I_x + I_y$ | |
| Radio de giro | $r_x,\,r_y$ | $r_x = \sqrt{I_x/A},\quad r_y = \sqrt{I_y/A}$ | |
| Módulo elástico | $Z_x,\,Z_y$ | $Z_x = \dfrac{I_x}{d/2},\quad Z_y = \dfrac{I_y}{b/2}$ | |
| Módulo plástico | $S_x$ | $S_x = \dfrac{b\,d^2 - b'\,d'^2}{4}$ | |
| Módulo plástico | $S_y$ | $S_y = \dfrac{d\,b^2 - d'\,b'^2}{4}$ | |

---

## Calculadora

Ingresa las dimensiones exteriores e interiores de la sección.

<div style="background:var(--md-code-bg-color, #f5f5f5); border-radius:8px; padding:1.5rem; max-width:520px;">

<div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem 1.5rem;">
  <label style="display:flex;flex-direction:column;gap:4px;font-size:0.9rem;">
    <span><em>d</em> — altura exterior (mm)</span>
    <input id="hr-d"  type="number" value="200" min="1" style="padding:4px 8px;border:1px solid #bbb;border-radius:4px;font-size:1rem;">
  </label>
  <label style="display:flex;flex-direction:column;gap:4px;font-size:0.9rem;">
    <span><em>b</em> — ancho exterior (mm)</span>
    <input id="hr-b"  type="number" value="150" min="1" style="padding:4px 8px;border:1px solid #bbb;border-radius:4px;font-size:1rem;">
  </label>
  <label style="display:flex;flex-direction:column;gap:4px;font-size:0.9rem;">
    <span><em>d'</em> — altura interior (mm)</span>
    <input id="hr-di" type="number" value="180" min="1" style="padding:4px 8px;border:1px solid #bbb;border-radius:4px;font-size:1rem;">
  </label>
  <label style="display:flex;flex-direction:column;gap:4px;font-size:0.9rem;">
    <span><em>b'</em> — ancho interior (mm)</span>
    <input id="hr-bi" type="number" value="130" min="1" style="padding:4px 8px;border:1px solid #bbb;border-radius:4px;font-size:1rem;">
  </label>
</div>

<button onclick="calcHR()"
  style="margin-top:1rem;padding:8px 24px;background:#4a90d9;color:#fff;border:none;border-radius:5px;cursor:pointer;font-size:1rem;">
  Calcular
</button>

<div id="hr-results" style="margin-top:1.2rem;"></div>
</div>

<script>
function calcHR() {
  var d  = parseFloat(document.getElementById('hr-d').value);
  var b  = parseFloat(document.getElementById('hr-b').value);
  var di = parseFloat(document.getElementById('hr-di').value);
  var bi = parseFloat(document.getElementById('hr-bi').value);

  if ([d, b, di, bi].some(isNaN) || d <= 0 || b <= 0 || di <= 0 || bi <= 0) {
    document.getElementById('hr-results').innerHTML =
      '<p style="color:red;">⚠ Ingresa valores positivos en todos los campos.</p>';
    return;
  }
  if (di >= d || bi >= b) {
    document.getElementById('hr-results').innerHTML =
      '<p style="color:red;">⚠ Las dimensiones interiores deben ser menores que las exteriores.</p>';
    return;
  }

  var A  = b * d - bi * di;
  var P  = 2 * (b + d) + 2 * (bi + di);
  var Ix = (b * Math.pow(d, 3) - bi * Math.pow(di, 3)) / 12;
  var Iy = (d * Math.pow(b, 3) - di * Math.pow(bi, 3)) / 12;
  var Ji = Ix + Iy;
  var rx = Math.sqrt(Ix / A);
  var ry = Math.sqrt(Iy / A);
  var Zx = Ix / (d / 2);
  var Zy = Iy / (b / 2);
  var Sx = (b * d * d - bi * di * di) / 4;
  var Sy = (d * b * b - di * bi * bi) / 4;

  function fmt(v, dec) { return v.toLocaleString('es-CL', {maximumFractionDigits: dec}); }

  document.getElementById('hr-results').innerHTML =
    '<table style="border-collapse:collapse;width:100%;font-size:0.9rem;table-layout:fixed;">' +
    '<colgroup>' +
    '<col style="width:38%">' +
    '<col style="width:14%">' +
    '<col style="width:30%">' +
    '<col style="width:18%">' +
    '</colgroup>' +
    '<thead><tr style="background:#4a90d9;color:#fff;">' +
    '<th style="padding:6px 10px;text-align:left;">Propiedad</th>' +
    '<th style="padding:6px 10px;text-align:left;">Símbolo</th>' +
    '<th style="padding:6px 10px;text-align:right;">Valor</th>' +
    '<th style="padding:6px 10px;text-align:left;">Unidad</th>' +
    '</tr></thead><tbody>' +
    hrRow('Área',             'A',   fmt(A,  2),  'mm²') +
    hrRow('Perímetro',        'P',   fmt(P,  2),  'mm')  +
    hrRow('Centroide',        'ȳ',   fmt(d/2,2),  'mm')  +
    hrRow('Inercia x–x',      'Iₓ',  fmt(Ix, 0),  'mm⁴') +
    hrRow('Inercia y–y',      'Iᵧ',  fmt(Iy, 0),  'mm⁴') +
    hrRow('Inercia polar',    'Jᵢ',  fmt(Ji, 0),  'mm⁴') +
    hrRow('Radio de giro x',  'rₓ',  fmt(rx, 2),  'mm')  +
    hrRow('Radio de giro y',  'rᵧ',  fmt(ry, 2),  'mm')  +
    hrRow('Mód. elástico x',  'Zₓ',  fmt(Zx, 0),  'mm³') +
    hrRow('Mód. elástico y',  'Zᵧ',  fmt(Zy, 0),  'mm³') +
    hrRow('Mód. plástico x',  'Sₓ',  fmt(Sx, 0),  'mm³') +
    hrRow('Mód. plástico y',  'Sᵧ',  fmt(Sy, 0),  'mm³') +
    '</tbody></table>';
}

function hrRow(name, sym, val, unit) {
  return '<tr style="border-bottom:1px solid #ddd;">' +
    '<td style="padding:5px 10px;">' + name + '</td>' +
    '<td style="padding:5px 10px;font-style:italic;">' + sym + '</td>' +
    '<td style="padding:5px 10px;text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap;">' + val + '</td>' +
    '<td style="padding:5px 10px;color:#666;">' + unit + '</td>' +
    '</tr>';
}
</script>

---

> **Nota:** Las fórmulas son válidas para sección rectangular hueca con hueco centrado y paredes rectas (sin radios de esquina). Para perfiles tubulares normalizados (RHS/SHS) con radios de esquina, el área y la inercia reales difieren ligeramente.
