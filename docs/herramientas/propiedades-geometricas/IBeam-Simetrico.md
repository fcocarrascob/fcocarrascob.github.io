---
title: "Perfil I Simétrico — Propiedades Geométricas"
type: reference
tags: [perfil-i, inercia, centroide, modulo-seccion, radio-giro, seccion-transversal]
related:
  - index.md
created: 2026-04-29
updated: 2026-04-29
---

# Perfil I Simétrico — Propiedades Geométricas

Propiedades geométricas para un perfil I de alas paralelas iguales (sección doblemente simétrica).

---

## Notación y dimensiones

<div style="display:flex; flex-wrap:wrap; gap:2.5rem; align-items:flex-start; margin-bottom:1.5rem;" markdown="1">

<div style="flex:0 0 auto;" markdown="1">
<img src="../ibeam.png" alt="Diagrama Perfil I Simétrico" style="max-width:260px; height:auto;">
</div>

<div style="flex:1 1 200px;" markdown="1">

| Símbolo | Descripción |
|---------|-------------|
| $d$ | Altura total del perfil |
| $b$ | Ancho de ala |
| $t_f$ | Espesor de ala |
| $t_w$ | Espesor de alma |
| $h$ | Altura libre del alma: $h = d - 2\,t_f$ |

</div>
</div>

---

## 1. Área y Perímetro

$$A = 2\,b\,t_f + h\,t_w$$

$$P = 2\,(2b + d - 2\,t_f) + 2\,t_w$$

---

## 2. Centroide

Por simetría doble, el centroide coincide con el centro geométrico:

$$\bar{y} = \dfrac{d}{2}, \qquad \bar{z} = \dfrac{b}{2}$$

---

## 3. Momento de Inercia

### Eje fuerte $x$–$x$ (horizontal, pasa por el centroide)

$$I_x = \dfrac{b\,d^3 - h^3(b - t_w)}{12}$$

### Eje débil $y$–$y$ (vertical, pasa por el centroide)

$$I_y = \dfrac{2\,t_f\,b^3 + h\,t_w^3}{12}$$

---

## 4. Momento de Inercia Polar

$$J_i = I_x + I_y$$

---

## 5. Radio de Giro

$$r_x = \sqrt{\dfrac{I_x}{A}}, \qquad r_y = \sqrt{\dfrac{I_y}{A}}$$

---

## 6. Módulo Elástico de Sección

$$Z_x = \dfrac{I_x}{d/2}, \qquad Z_y = \dfrac{I_y}{b/2}$$

---

## 7. Módulo Plástico de Sección

$$S_x = \dfrac{b\,t_f\,(d - t_f) + \dfrac{t_w\,h^2}{4}}{1}$$

$$S_y = \dfrac{b^2\,t_f}{2} + \dfrac{t_w^2\,h}{4}$$

---

## Calculadora

Ingresa las dimensiones de la sección y calcula automáticamente todas las propiedades.

<div style="background:var(--md-code-bg-color, #f5f5f5); border-radius:8px; padding:1.5rem; max-width:520px;">

<div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem 1.5rem;">
  <label style="display:flex;flex-direction:column;gap:4px;font-size:0.9rem;">
    <span><em>d</em> — altura total (mm)</span>
    <input id="pg-d"  type="number" value="300" min="1" style="padding:4px 8px;border:1px solid #bbb;border-radius:4px;font-size:1rem;">
  </label>
  <label style="display:flex;flex-direction:column;gap:4px;font-size:0.9rem;">
    <span><em>b</em> — ancho de ala (mm)</span>
    <input id="pg-b"  type="number" value="150" min="1" style="padding:4px 8px;border:1px solid #bbb;border-radius:4px;font-size:1rem;">
  </label>
  <label style="display:flex;flex-direction:column;gap:4px;font-size:0.9rem;">
    <span><em>t<sub>f</sub></em> — espesor de ala (mm)</span>
    <input id="pg-tf" type="number" value="10"  min="1" style="padding:4px 8px;border:1px solid #bbb;border-radius:4px;font-size:1rem;">
  </label>
  <label style="display:flex;flex-direction:column;gap:4px;font-size:0.9rem;">
    <span><em>t<sub>w</sub></em> — espesor de alma (mm)</span>
    <input id="pg-tw" type="number" value="7"   min="1" style="padding:4px 8px;border:1px solid #bbb;border-radius:4px;font-size:1rem;">
  </label>
</div>

<button onclick="calcIBeam()"
  style="margin-top:1rem;padding:8px 24px;background:#4a90d9;color:#fff;border:none;border-radius:5px;cursor:pointer;font-size:1rem;">
  Calcular
</button>

<div id="pg-results" style="margin-top:1.2rem;"></div>
</div>

<script>
function calcIBeam() {
  var d  = parseFloat(document.getElementById('pg-d').value);
  var b  = parseFloat(document.getElementById('pg-b').value);
  var tf = parseFloat(document.getElementById('pg-tf').value);
  var tw = parseFloat(document.getElementById('pg-tw').value);

  if ([d, b, tf, tw].some(isNaN) || d <= 0 || b <= 0 || tf <= 0 || tw <= 0) {
    document.getElementById('pg-results').innerHTML =
      '<p style="color:red;">⚠ Ingresa valores positivos en todos los campos.</p>';
    return;
  }
  var h = d - 2 * tf;
  if (h <= 0) {
    document.getElementById('pg-results').innerHTML =
      '<p style="color:red;">⚠ El espesor de ala es demasiado grande para la altura indicada.</p>';
    return;
  }

  var A  = 2 * b * tf + h * tw;
  var P  = 2 * (2 * b + d - 2 * tf) + 2 * tw;
  var Ix = (b * Math.pow(d, 3) - Math.pow(h, 3) * (b - tw)) / 12;
  var Iy = (2 * tf * Math.pow(b, 3) + h * Math.pow(tw, 3)) / 12;
  var Ji = Ix + Iy;
  var rx = Math.sqrt(Ix / A);
  var ry = Math.sqrt(Iy / A);
  var Zx = Ix / (d / 2);
  var Zy = Iy / (b / 2);
  var Sx = b * tf * (d - tf) + (tw * h * h) / 4;
  var Sy = (b * b * tf) / 2 + (tw * tw * h) / 4;

  function fmt(v, dec) { return v.toLocaleString('es-CL', {maximumFractionDigits: dec}); }

  document.getElementById('pg-results').innerHTML =
    '<table style="border-collapse:collapse;width:100%;font-size:0.9rem;">' +
    '<thead><tr style="background:#4a90d9;color:#fff;">' +
    '<th style="padding:6px 10px;text-align:left;">Propiedad</th>' +
    '<th style="padding:6px 10px;text-align:left;">Símbolo</th>' +
    '<th style="padding:6px 10px;text-align:right;">Valor</th>' +
    '<th style="padding:6px 10px;text-align:left;">Unidad</th>' +
    '</tr></thead><tbody>' +
    row('Área',                    'A',           fmt(A,  2),  'mm²')  +
    row('Perímetro',               'P',           fmt(P,  2),  'mm')   +
    row('Centroide (eje x)',        'ȳ',           fmt(d/2,2),  'mm')   +
    row('Inercia eje x–x',         'Iₓ',          fmt(Ix, 0),  'mm⁴')  +
    row('Inercia eje y–y',         'Iᵧ',          fmt(Iy, 0),  'mm⁴')  +
    row('Inercia polar',           'Jᵢ',          fmt(Ji, 0),  'mm⁴')  +
    row('Radio de giro x',         'rₓ',          fmt(rx, 2),  'mm')   +
    row('Radio de giro y',         'rᵧ',          fmt(ry, 2),  'mm')   +
    row('Módulo elástico x',       'Zₓ',          fmt(Zx, 0),  'mm³')  +
    row('Módulo elástico y',       'Zᵧ',          fmt(Zy, 0),  'mm³')  +
    row('Módulo plástico x',       'Sₓ',          fmt(Sx, 0),  'mm³')  +
    row('Módulo plástico y',       'Sᵧ',          fmt(Sy, 0),  'mm³')  +
    '</tbody></table>';
}

function row(name, sym, val, unit) {
  return '<tr style="border-bottom:1px solid #ddd;">' +
    '<td style="padding:5px 10px;">' + name + '</td>' +
    '<td style="padding:5px 10px;font-style:italic;">' + sym + '</td>' +
    '<td style="padding:5px 10px;text-align:right;font-variant-numeric:tabular-nums;">' + val + '</td>' +
    '<td style="padding:5px 10px;color:#666;">' + unit + '</td>' +
    '</tr>';
}
</script>

---

> **Nota:** Las fórmulas son válidas para perfiles de alas paralelas con simetría doble ($b_1 = b_2$, $t_{f1} = t_{f2}$). Para perfiles con alas desiguales utilizar la sección de Perfil I No Simétrico (próximamente).
