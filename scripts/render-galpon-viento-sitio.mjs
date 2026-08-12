#!/usr/bin/env node
// Figuras calculadas del post del sitio del galpón del altiplano
// (/apuntes/ejemplo-galpon-altiplano-viento-sitio-nch432).
//
//   npm run figuras:galpon-viento
//
// Todo se calcula acá desde los parámetros del sitio y las ecuaciones de la
// NCh 432:2025 leídas en página rasterizada (Ec. (1) de §5.6.2, Ec. (2) de
// §5.8.2, Figura 3 y Notas 1 y 2 de la Tabla 4). Ningún número está escrito a
// mano en el SVG: si se cambia un parámetro del sitio, las tres figuras se
// mueven juntas y no pueden contradecir al texto.
//
// Emite a public/ejemplo-galpon-altiplano-viento-sitio-nch432/:
//   qh-cascada.svg        p0 → K_z → K_zt → K_e → q_h, con lo que resta y lo que devuelve
//   kzt-la-loma.svg       la geometría de la Figura 3 sobre el cerro del proyecto
//   kzt-sensibilidad.svg  la misma loma con tres clasificaciones y tres exposiciones, y el salto de H/L_h = 0,2
//
// El SVG no hereda las variables CSS del sitio (se sirve como <img>): colores
// literales y coma decimal, como el resto de las figuras.

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT_DIR = path.join(ROOT, 'public/ejemplo-galpon-altiplano-viento-sitio-nch432');

// ------------------------------------------------------- parámetros del sitio
// Declarados y congelados en SERIE-GALPON.md §3.
const V = 30.0; // m/s · Tabla 1, zona I-B (lat. 17°29'–27°22'S, altitud ≥ 2 000 m)
const I_IMP = 1.0; // Tabla 2, categoría de ocupación II
const K_Z = 0.95; // Tabla 5, exposición C, z = h = 8,0 m
const K_D = 0.85; // Tabla 3, SPRFV de edificios
const Z_E = 3800.0; // m sobre el nivel del mar
const H_CERRO = 40.0; // m · altura de la loma
const LH = 120.0; // m · distancia barlovento hasta media altura
const X_POS = 0.0; // m · el galpón está en la cresta
const Z_ALERO = 8.0; // m · altura de alero, que es la h del q_h para θ ≤ 10°

// Figura 3 — parámetros por forma del accidente y exposición.
// K1_POR_RATIO es K₁/(H/L_h); γ es el exponente de K₃; μ el de K₂ a barlovento.
const FORMAS = {
  cima2d: { rot: 'Cima 2D', k1: { B: 1.3, C: 1.45, D: 1.55 }, gamma: 3.0, mu: 1.5 },
  escarpe2d: { rot: 'Escarpamiento 2D', k1: { B: 0.75, C: 0.85, D: 0.95 }, gamma: 2.5, mu: 1.5 },
  colina3d: { rot: 'Colina axisimétrica 3D', k1: { B: 0.95, C: 1.05, D: 1.15 }, gamma: 4.0, mu: 1.5 },
};

// Ec. (1) de §5.6.2: K_zt = (1 + K₁·K₂·K₃)², con K₂ = 1 − |x|/(μ·L_h) y K₃ = e^(−γ·z/L_h).
// §5.6.1: si no se cumplen LAS TRES condiciones, K_zt = 1,0 — sin transición.
function kzt({ forma, exp, H = H_CERRO, Lh = LH, x = X_POS, z = Z_ALERO }) {
  const f = FORMAS[forma];
  const ratio = H / Lh;
  if (ratio < 0.2) return { aplica: false, k1: 0, k2: 0, k3: 0, kzt: 1.0, ratio };
  // §5.6.2: para H/L_h > 0,5 se supone H/L_h = 0,5 al evaluar K₁, y se sustituye
  // L_h por 2H al evaluar K₂ y K₃. Las dos partes, no solo la primera.
  const rEfec = Math.min(ratio, 0.5);
  const lhEfec = ratio > 0.5 ? 2 * H : Lh;
  const k1 = f.k1[exp] * rEfec;
  const k2 = Math.max(0, 1 - Math.abs(x) / (f.mu * lhEfec));
  const k3 = Math.max(0, Math.exp((-f.gamma * z) / lhEfec));
  return { aplica: true, k1, k2, k3, kzt: (1 + k1 * k2 * k3) ** 2, ratio };
}

const K_E = Math.exp(-0.000119 * Z_E); // Tabla 4, Nota 2 — la tabla termina en 1 800 m
const BASE = kzt({ forma: 'cima2d', exp: 'C' });
const K_ZT = BASE.kzt;

// Ec. (2) de §5.8.2: q_z = 0,613·I·K_z·K_zt·K_e·V² [N/m²]. K_d NO va acá.
const qz = (kz, kzt_, ke) => 0.613 * I_IMP * kz * kzt_ * ke * V * V;
const P0 = qz(1, 1, 1); // el p₀ de la Nota 1 de la Tabla 1
const QH = qz(K_Z, K_ZT, K_E);

// ---------------------------------------------------------------- utilidades

const COMA = (x, dec = 2) => x.toFixed(dec).replace('.', ',');
const MILES = (x, dec = 0) =>
  x
    .toFixed(dec)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/, ' ');
const N = (x) => x.toFixed(1);

const TINTA = '#222';
const TEXTO = '#333';
const SUAVE = '#666';
const BORDE = '#d1d5db';
const COTA = '#8a857c';
const AZUL = '#1b4a6e';
const SUBE = '#a8641b'; // lo que agrega
const BAJA = '#2d6b9c'; // lo que resta
const VERDE = '#1c7c3c';
const ROJO = '#b02a1a';

const DEFS = `<defs>
    <marker id="dim" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="${COTA}"/>
    </marker>
  </defs>`;

const cotaH = (x1, x2, y, rot, color = COTA) =>
  [
    `<line x1="${N(x1)}" y1="${N(y)}" x2="${N(x2)}" y2="${N(y)}" stroke="${color}" stroke-width="1" marker-start="url(#dim)" marker-end="url(#dim)"/>`,
    `<text x="${N((x1 + x2) / 2)}" y="${N(y - 6)}" font-size="10.5" text-anchor="middle" fill="${color}">${rot}</text>`,
  ].join('\n  ');

// ============================================================== figura 1
// La cascada: qué resta la altitud y qué devuelve la loma.

function figuraCascada() {
  // Pasos acumulativos sobre p₀.
  const PLANO = qz(K_Z, 1, 1); // el mismo galpón, terreno plano y nivel del mar
  const pasos = [
    { rot: 'p₀ — referencia', sub: 'Tabla 1 · K_z = K_zt = K_e = 1', val: P0, tipo: 'base' },
    { rot: `× K_z = ${COMA(K_Z, 2)}`, sub: 'Tabla 5 · exposición C, z = 8,0 m', val: PLANO, tipo: 'baja' },
    { rot: `× K_e = ${COMA(K_E, 4)}`, sub: 'Tabla 4, Nota 2 · la altitud', val: qz(K_Z, 1, K_E), tipo: 'baja' },
    { rot: `× K_zt = ${COMA(K_ZT, 3)}`, sub: 'Ec. (1) · cima 2D, en la cresta', val: QH, tipo: 'sube' },
  ];

  const X0 = 120;
  const W = 700;
  const Y0 = 380;
  const H = 268;
  const vMax = 1100;
  const sy = (v) => Y0 - (v / vMax) * H;

  const partes = [];
  for (const v of [0, 200, 400, 600, 800, 1000]) {
    partes.push(
      `<line x1="${N(X0)}" y1="${N(sy(v))}" x2="${N(X0 + W)}" y2="${N(sy(v))}" stroke="${BORDE}" stroke-width="1"/>`,
      `<text x="${N(X0 - 8)}" y="${N(sy(v) + 4)}" font-size="11" text-anchor="end" fill="${SUAVE}">${MILES(v)}</text>`,
    );
  }
  partes.push(
    `<line x1="${N(X0)}" y1="${N(Y0)}" x2="${N(X0 + W)}" y2="${N(Y0)}" stroke="${TEXTO}" stroke-width="1.5"/>`,
    `<text x="${N(X0 - 8)}" y="${N(sy(vMax) - 10)}" font-size="11.5" fill="${TEXTO}">q [N/m²]</text>`,
  );

  const ancho = W / pasos.length;
  let prev = 0;
  pasos.forEach((p, i) => {
    const cx = X0 + i * ancho + ancho / 2;
    const bw = ancho * 0.46;
    const color = p.tipo === 'base' ? AZUL : p.tipo === 'baja' ? BAJA : SUBE;

    // el tramo que cambia respecto del paso anterior
    if (i > 0) {
      const yA = sy(Math.max(prev, p.val));
      const yB = sy(Math.min(prev, p.val));
      partes.push(
        `<rect x="${N(cx - bw / 2)}" y="${N(yA)}" width="${N(bw)}" height="${N(yB - yA)}" fill="${color}" fill-opacity="0.30" stroke="${color}" stroke-width="1.4"/>`,
        `<line x1="${N(cx - bw / 2 - ancho * 0.27)}" y1="${N(sy(prev))}" x2="${N(cx - bw / 2)}" y2="${N(sy(prev))}" stroke="${SUAVE}" stroke-width="1" stroke-dasharray="4 3"/>`,
      );
      // El % va al costado del bloque, no encima, para no pisar el valor.
      const delta = (p.val / prev - 1) * 100;
      partes.push(
        `<text x="${N(cx + bw / 2 + 8)}" y="${N((yA + yB) / 2 + 4)}" font-size="11.5" fill="${color}" font-weight="bold">${delta > 0 ? '+' : ''}${COMA(delta, 1)} %</text>`,
      );
    } else {
      partes.push(
        `<rect x="${N(cx - bw / 2)}" y="${N(sy(p.val))}" width="${N(bw)}" height="${N(Y0 - sy(p.val))}" fill="${AZUL}" fill-opacity="0.16" stroke="${AZUL}" stroke-width="1.4"/>`,
      );
    }

    // El valor va SOBRE el nivel alcanzado, alineado al borde izquierdo del bloque.
    partes.push(
      `<line x1="${N(cx - bw / 2)}" y1="${N(sy(p.val))}" x2="${N(cx + bw / 2 + (i < pasos.length - 1 ? ancho * 0.27 : 0))}" y2="${N(sy(p.val))}" stroke="${TEXTO}" stroke-width="2"/>`,
      `<text x="${N(cx - bw / 2)}" y="${N(sy(p.val) - 9)}" font-size="12" text-anchor="start" fill="${TINTA}" font-weight="bold">${MILES(p.val, 1)}</text>`,
      `<text x="${N(cx)}" y="${N(Y0 + 22)}" font-size="11.5" text-anchor="middle" fill="${color}" font-weight="bold">${p.rot}</text>`,
      `<text x="${N(cx)}" y="${N(Y0 + 38)}" font-size="10" text-anchor="middle" fill="${SUAVE}">${p.sub}</text>`,
    );
    prev = p.val;
  });

  // El neto se mide contra el MISMO galpón en terreno plano a nivel del mar —que ya
  // lleva su K_z— y por eso es exactamente K_zt·K_e. Medirlo contra p₀ mezclaría
  // adentro el efecto de la exposición, que no tiene nada que ver con el sitio.
  const neto = (K_ZT * K_E - 1) * 100;
  partes.push(
    `<line x1="${N(X0 + ancho)}" y1="${N(sy(PLANO))}" x2="${N(X0 + W + 26)}" y2="${N(sy(PLANO))}" stroke="${BAJA}" stroke-width="1" stroke-dasharray="6 4"/>`,
    `<line x1="${N(X0 + W)}" y1="${N(sy(QH))}" x2="${N(X0 + W + 26)}" y2="${N(sy(QH))}" stroke="${SUBE}" stroke-width="1" stroke-dasharray="6 4"/>`,
    `<text x="${N(X0 + W + 32)}" y="${N(sy(PLANO) + 4)}" font-size="10.5" fill="${BAJA}">plano</text>`,
    `<text x="${N(X0 + W + 32)}" y="${N(sy(QH) + 4)}" font-size="10.5" fill="${SUBE}">q_h</text>`,
  );

  const cierre = [
    `<text x="${N(X0)}" y="470" font-size="12.5" fill="${TINTA}" font-weight="bold">El neto del sitio: +${COMA(neto, 1)} % — y es exactamente K_zt · K_e = ${COMA(K_ZT * K_E, 4)}</text>`,
    `<text x="${N(X0)}" y="492" font-size="11" fill="${SUAVE}">Se mide contra la segunda columna, no contra p₀: el mismo galpón, con su misma exposición C, en terreno plano y a nivel del</text>`,
    `<text x="${N(X0)}" y="508" font-size="11" fill="${SUAVE}">mar. La altitud le descuenta un ${COMA((1 - K_E) * 100, 1)} % y la loma le agrega un ${COMA((K_ZT - 1) * 100, 1)} %: no se compensan, y la loma gana por bastante.</text>`,
    `<text x="${N(X0)}" y="530" font-size="11" fill="${SUAVE}">El orden de los factores no cambia nada — el K_e se dibuja antes del K_zt solo porque es el que todo el mundo aplica primero,</text>`,
    `<text x="${N(X0)}" y="546" font-size="11" fill="${SUAVE}">y muchas veces el único que se aplica. Quien se queda en la tercera columna diseña con el ${COMA((qz(K_Z, 1, K_E) / QH) * 100, 0)} % de la presión que corresponde.</text>`,
  ].join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 580" font-family="Segoe UI, Arial, sans-serif">
  <rect width="1000" height="580" fill="#ffffff"/>
  <text x="500" y="30" font-size="15.5" text-anchor="middle" fill="${TINTA}" font-weight="bold">La presión de velocidad del galpón: lo que la altitud descuenta y lo que la loma devuelve</text>
  <text x="500" y="50" font-size="12" text-anchor="middle" fill="${SUAVE}">Ec. (2) de §5.8.2 · V = ${COMA(V, 0)} m/s (zona I-B) · I = ${COMA(I_IMP, 2)} (categoría II) · exposición C · z_e = ${MILES(Z_E)} m · el K_d de §5.4 NO va acá</text>
  ${DEFS}
  ${partes.join('\n  ')}
  ${cierre}
  <text x="120" y="566" font-size="10" fill="${SUAVE}">Los valores son acumulativos sobre p₀ = 0,613·V² = ${MILES(P0, 1)} N/m², que la Nota 1 de la Tabla 1 tabula redondeado como ${MILES(552)} N/m². Cierre por dos vías: 552 × (${COMA(K_Z, 2)} × ${COMA(K_ZT, 3)} × ${COMA(K_E, 4)}) = ${MILES(552 * K_Z * K_ZT * K_E, 0)} N/m².</text>
</svg>
`;
}

// ============================================================== figura 2
// La loma: la geometría de la Figura 3 sobre el cerro del proyecto.

function figuraLoma() {
  const partes = [];
  // Escalas distintas a propósito: con la misma, un galpón de 8 m sobre un cerro
  // de 40 m no se ve. La exageración vertical se declara al pie.
  const SX = 1.45; // px/m horizontal
  const SZ = 3.0; // px/m vertical
  const CRESTA_X = 620;
  const SUELO_Y = 520;
  const gx = (x) => CRESTA_X + x * SX;
  const gz = (z) => SUELO_Y - z * SZ;
  const X_IZQ = -2.2 * LH;
  const X_DER = 1.6 * LH;

  // Perfil de la loma: coseno alzado, con media altura exactamente en x = −L_h.
  const perfil = [];
  for (let x = X_IZQ; x <= X_DER; x += 3) {
    const z = H_CERRO * 0.5 * (1 + Math.cos((Math.PI * x) / (2 * LH)));
    perfil.push(`${N(gx(x))},${N(gz(Math.abs(x) <= 2 * LH ? z : 0))}`);
  }
  partes.push(
    `<polyline points="${perfil.join(' ')}" fill="#f3f0ea" stroke="${COTA}" stroke-width="1.8"/>`,
    `<line x1="${N(gx(X_IZQ))}" y1="${N(gz(0))}" x2="${N(gx(X_DER))}" y2="${N(gz(0))}" stroke="${COTA}" stroke-width="1" stroke-dasharray="6 5"/>`,
    `<text x="${N(gx(X_IZQ))}" y="${N(gz(0) + 16)}" font-size="10.5" fill="${SUAVE}">terreno general</text>`,
  );

  // El galpón en la cresta, a escala
  const gw = 24 * SX;
  const gh = 8 * SZ;
  partes.push(
    `<rect x="${N(gx(X_POS) - gw / 2)}" y="${N(gz(H_CERRO + Z_ALERO))}" width="${N(gw)}" height="${N(gh)}" fill="${AZUL}" fill-opacity="0.25" stroke="${AZUL}" stroke-width="1.6"/>`,
    `<polyline points="${N(gx(X_POS) - gw / 2)},${N(gz(H_CERRO + Z_ALERO))} ${N(gx(X_POS))},${N(gz(H_CERRO + Z_ALERO + 2.116))} ${N(gx(X_POS) + gw / 2)},${N(gz(H_CERRO + Z_ALERO))}" fill="${AZUL}" fill-opacity="0.25" stroke="${AZUL}" stroke-width="1.6"/>`,
    `<text x="${N(gx(X_POS))}" y="${N(gz(H_CERRO + Z_ALERO + 2.116) - 10)}" font-size="11" text-anchor="middle" fill="${AZUL}" font-weight="bold">el galpón, en la cresta (x = 0)</text>`,
  );

  // Cotas: H, L_h, z
  const X_COTA_H = -2.15 * LH;
  const X_ROT = -2.02 * LH; // arranque de los rótulos de la izquierda
  partes.push(
    `<line x1="${N(gx(X_COTA_H))}" y1="${N(gz(0))}" x2="${N(gx(X_COTA_H))}" y2="${N(gz(H_CERRO))}" stroke="${COTA}" stroke-width="1" marker-start="url(#dim)" marker-end="url(#dim)"/>`,
    `<line x1="${N(gx(X_COTA_H))}" y1="${N(gz(H_CERRO))}" x2="${N(gx(X_POS))}" y2="${N(gz(H_CERRO))}" stroke="${COTA}" stroke-width="0.8" stroke-dasharray="4 4"/>`,
    `<text x="${N(gx(X_COTA_H) - 8)}" y="${N(gz(H_CERRO / 2) + 4)}" font-size="11" text-anchor="end" fill="${COTA}">H = ${COMA(H_CERRO, 0)} m</text>`,
    // media altura: el punto que define L_h
    `<line x1="${N(gx(X_ROT))}" y1="${N(gz(H_CERRO / 2))}" x2="${N(gx(-LH))}" y2="${N(gz(H_CERRO / 2))}" stroke="${SUBE}" stroke-width="1.2" stroke-dasharray="5 4"/>`,
    `<circle cx="${N(gx(-LH))}" cy="${N(gz(H_CERRO / 2))}" r="4.5" fill="${SUBE}"/>`,
    `<text x="${N(gx(X_ROT))}" y="${N(gz(H_CERRO / 2) - 9)}" font-size="10.5" fill="${SUBE}">media altura, H/2 = ${COMA(H_CERRO / 2, 0)} m — acá termina el L_h</text>`,
    cotaH(gx(-LH), gx(X_POS), gz(0) + 40, `L_h = ${COMA(LH, 0)} m`),
    `<line x1="${N(gx(-LH))}" y1="${N(gz(H_CERRO / 2))}" x2="${N(gx(-LH))}" y2="${N(gz(0) + 44)}" stroke="${COTA}" stroke-width="0.8" stroke-dasharray="4 4"/>`,
    `<line x1="${N(gx(X_POS))}" y1="${N(gz(H_CERRO))}" x2="${N(gx(X_POS))}" y2="${N(gz(0) + 44)}" stroke="${COTA}" stroke-width="0.8" stroke-dasharray="4 4"/>`,
    // z
    `<line x1="${N(gx(X_POS) + gw / 2 + 14)}" y1="${N(gz(H_CERRO))}" x2="${N(gx(X_POS) + gw / 2 + 14)}" y2="${N(gz(H_CERRO + Z_ALERO))}" stroke="${COTA}" stroke-width="1" marker-start="url(#dim)" marker-end="url(#dim)"/>`,
    `<text x="${N(gx(X_POS) + gw / 2 + 20)}" y="${N(gz(H_CERRO + Z_ALERO / 2) + 4)}" font-size="10.5" fill="${COTA}">z = ${COMA(Z_ALERO, 1)} m</text>`,
    // viento — bien arriba, para no pelearse con las cotas de H y de media altura
    `<line x1="${N(gx(X_ROT))}" y1="${N(gz(H_CERRO * 1.1))}" x2="${N(gx(X_ROT) + 54)}" y2="${N(gz(H_CERRO * 1.1))}" stroke="${BAJA}" stroke-width="3"/>`,
    `<polygon points="${N(gx(X_ROT) + 66)},${N(gz(H_CERRO * 1.1))} ${N(gx(X_ROT) + 52)},${N(gz(H_CERRO * 1.1) - 5.5)} ${N(gx(X_ROT) + 52)},${N(gz(H_CERRO * 1.1) + 5.5)}" fill="${BAJA}"/>`,
    `<text x="${N(gx(X_ROT) + 74)}" y="${N(gz(H_CERRO * 1.1) + 4)}" font-size="11.5" fill="${BAJA}" font-weight="bold">viento</text>`,
  );

  // La cuenta, al lado
  const cuenta = [
    ['H/L_h', `${COMA(H_CERRO, 0)}/${COMA(LH, 0)}`, COMA(BASE.ratio, 4), '≥ 0,20 ✓ (§5.6.1, condición 2)'],
    ['K₁', `1,45 × ${COMA(BASE.ratio, 4)}`, COMA(BASE.k1, 4), 'cima 2D, exposición C'],
    ['K₂', `1 − 0/(1,5 × ${COMA(LH, 0)})`, COMA(BASE.k2, 4), 'el galpón está en la cresta'],
    ['K₃', `e^(−3 × ${COMA(Z_ALERO, 1)}/${COMA(LH, 0)})`, COMA(BASE.k3, 4), 'γ = 3 para cima 2D'],
  ];
  const filas = cuenta
    .map((c, i) => {
      const y = 130 + i * 26;
      return [
        `<text x="60" y="${y}" font-size="11.5" fill="${TINTA}" font-weight="bold">${c[0]}</text>`,
        `<text x="112" y="${y}" font-size="11" fill="${SUAVE}">${c[1]}</text>`,
        `<text x="272" y="${y}" font-size="11.5" fill="${AZUL}" font-weight="bold">${c[2]}</text>`,
        `<text x="336" y="${y}" font-size="10.5" fill="${SUAVE}">${c[3]}</text>`,
      ].join('\n  ');
    })
    .join('\n  ');

  partes.push(
    `<text x="60" y="104" font-size="12.5" fill="${TINTA}" font-weight="bold">Ec. (1) de §5.6.2 — K_zt = (1 + K₁·K₂·K₃)²</text>`,
    filas,
    `<line x1="60" y1="246" x2="700" y2="246" stroke="${BORDE}" stroke-width="1"/>`,
    `<text x="60" y="268" font-size="13" fill="${SUBE}" font-weight="bold">K_zt = (1 + ${COMA(BASE.k1, 4)} × ${COMA(BASE.k2, 4)} × ${COMA(BASE.k3, 4)})² = ${COMA(1 + BASE.k1 * BASE.k2 * BASE.k3, 6)}² = ${COMA(K_ZT, 4)}</text>`,
    `<text x="60" y="292" font-size="11" fill="${SUAVE}">Multiplica la presión por ${COMA(K_ZT, 3)}, o sea le agrega un ${COMA((K_ZT - 1) * 100, 1)} %. Y no sale de ninguna tabla: hay que medir el cerro en el plano</text>`,
    `<text x="60" y="308" font-size="11" fill="${SUAVE}">topográfico y clasificarlo. Ahí se juega el resultado, no en la aritmética de arriba.</text>`,
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 610" font-family="Segoe UI, Arial, sans-serif">
  <rect width="1000" height="610" fill="#ffffff"/>
  <text x="500" y="30" font-size="15.5" text-anchor="middle" fill="${TINTA}" font-weight="bold">La loma del proyecto, y de dónde sale cada letra de la Ec. (1)</text>
  <text x="500" y="50" font-size="12" text-anchor="middle" fill="${SUAVE}">L_h se mide hasta donde el terreno está a media altura, no hasta el pie del cerro — y ahí empieza la mitad de los errores</text>
  ${DEFS}
  ${partes.join('\n  ')}
  <text x="60" y="578" font-size="10.5" fill="${SUAVE}">Corte con la vertical exagerada ${COMA(SZ / SX, 1)} veces: con la misma escala en los dos ejes, un galpón de 8 m sobre un cerro de 40 m no se vería. El perfil de coseno es ilustrativo;</text>
  <text x="60" y="594" font-size="10.5" fill="${SUAVE}">lo que la norma usa son H, L_h y x. Definiciones y parámetros: Figura 3 de NCh 432:2025 (págs. 21-22), que no estaba transcrita al material de referencia.</text>
</svg>
`;
}

// ============================================================== figura 3
// La sensibilidad: la misma loma, y por qué el resultado depende de quién la clasifique.

function figuraSensibilidad() {
  const partes = [];

  // ---- panel A: tres formas × tres exposiciones
  const X0 = 70;
  const Y0 = 330;
  const W = 430;
  const H = 210;
  const vMax = 2.2;
  const sy = (v) => Y0 - ((v - 1) / (vMax - 1)) * H;

  for (const v of [1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2]) {
    partes.push(
      `<line x1="${N(X0)}" y1="${N(sy(v))}" x2="${N(X0 + W)}" y2="${N(sy(v))}" stroke="${BORDE}" stroke-width="1"/>`,
      `<text x="${N(X0 - 8)}" y="${N(sy(v) + 4)}" font-size="10.5" text-anchor="end" fill="${SUAVE}">${COMA(v, 1)}</text>`,
    );
  }
  partes.push(
    `<line x1="${N(X0)}" y1="${N(Y0)}" x2="${N(X0 + W)}" y2="${N(Y0)}" stroke="${TEXTO}" stroke-width="1.5"/>`,
    `<text x="${N(X0)}" y="96" font-size="12.5" fill="${TINTA}" font-weight="bold">A · La misma loma, según cómo se la clasifique</text>`,
    `<text x="${N(X0)}" y="112" font-size="10.5" fill="${SUAVE}">eje vertical K_zt · H = ${COMA(H_CERRO, 0)} m · L_h = ${COMA(LH, 0)} m · en la cresta · z = ${COMA(Z_ALERO, 1)} m</text>`,
    `<text x="${N(X0)}" y="126" font-size="10.5" fill="${SUAVE}">Lo único que cambia entre las nueve barras es la fila de la Figura 3 que se elija.</text>`,
  );

  const formas = ['cima2d', 'colina3d', 'escarpe2d'];
  const exps = ['B', 'C', 'D'];
  const grupoW = W / formas.length;
  formas.forEach((fm, i) => {
    const gx0 = X0 + i * grupoW;
    exps.forEach((ex, j) => {
      const bw = grupoW * 0.20;
      const cx = gx0 + grupoW * 0.5 + (j - 1) * (bw + 6);
      const r = kzt({ forma: fm, exp: ex });
      const destaca = fm === 'cima2d' && ex === 'C';
      const color = destaca ? SUBE : AZUL;
      partes.push(
        `<rect x="${N(cx - bw / 2)}" y="${N(sy(r.kzt))}" width="${N(bw)}" height="${N(Y0 - sy(r.kzt))}" fill="${color}" fill-opacity="${destaca ? 0.42 : 0.16}" stroke="${color}" stroke-width="${destaca ? 1.8 : 1.2}"/>`,
        `<text x="${N(cx)}" y="${N(sy(r.kzt) - 6)}" font-size="10" text-anchor="middle" fill="${color}" font-weight="${destaca ? 'bold' : 'normal'}">${COMA(r.kzt, 3)}</text>`,
        `<text x="${N(cx)}" y="${N(Y0 + 14)}" font-size="9.5" text-anchor="middle" fill="${SUAVE}">${ex}</text>`,
      );
    });
    partes.push(
      `<text x="${N(gx0 + grupoW / 2)}" y="${N(Y0 + 32)}" font-size="11" text-anchor="middle" fill="${TEXTO}" font-weight="bold">${FORMAS[fm].rot}</text>`,
    );
    if (i > 0) {
      partes.push(
        `<line x1="${N(gx0)}" y1="${N(sy(vMax))}" x2="${N(gx0)}" y2="${N(Y0)}" stroke="${BORDE}" stroke-width="1" stroke-dasharray="4 4"/>`,
      );
    }
  });

  const cimaC = kzt({ forma: 'cima2d', exp: 'C' }).kzt;
  const escC = kzt({ forma: 'escarpe2d', exp: 'C' }).kzt;
  partes.push(
    `<text x="${N(X0)}" y="${N(Y0 + 56)}" font-size="11" fill="${TINTA}" font-weight="bold">Con la exposición C fija, entre cima 2D y escarpamiento hay un ${COMA((cimaC / escC - 1) * 100, 0)} %</text>`,
    `<text x="${N(X0)}" y="${N(Y0 + 74)}" font-size="10.5" fill="${SUAVE}">de diferencia — con el mismo cerro, la misma altura y la misma posición. Nadie</text>`,
    `<text x="${N(X0)}" y="${N(Y0 + 90)}" font-size="10.5" fill="${SUAVE}">verifica esa clasificación en una revisión de cálculo, y decide más que el K_e.</text>`,
  );

  // ---- panel B: el salto en H/L_h = 0,2
  const BX0 = 570;
  const BW = 370;
  const bY0 = 330;
  const bH = 210;
  const vMaxB = 2.6; // la rama pasado el tope de 0,5 llega más arriba que el panel A
  const bsy = (v) => bY0 - ((v - 1) / (vMaxB - 1)) * bH;
  const bsx = (r) => BX0 + (r / 0.7) * BW;

  for (const v of [1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.4, 2.6]) {
    partes.push(
      `<line x1="${N(BX0)}" y1="${N(bsy(v))}" x2="${N(BX0 + BW)}" y2="${N(bsy(v))}" stroke="${BORDE}" stroke-width="1"/>`,
      `<text x="${N(BX0 - 6)}" y="${N(bsy(v) + 4)}" font-size="10" text-anchor="end" fill="${SUAVE}">${COMA(v, 1)}</text>`,
    );
  }
  for (const r of [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]) {
    partes.push(
      `<text x="${N(bsx(r))}" y="${N(bY0 + 16)}" font-size="10" text-anchor="middle" fill="${SUAVE}">${COMA(r, 1)}</text>`,
    );
  }
  partes.push(
    `<line x1="${N(BX0)}" y1="${N(bY0)}" x2="${N(BX0 + BW)}" y2="${N(bY0)}" stroke="${TEXTO}" stroke-width="1.5"/>`,
    `<text x="${N(BX0 + BW)}" y="${N(bY0 + 34)}" font-size="11" text-anchor="end" fill="${TEXTO}">H/L_h</text>`,
    `<text x="${N(BX0)}" y="96" font-size="12.5" fill="${TINTA}" font-weight="bold">B · El escalón de §5.6.1, y el techo de §5.6.2</text>`,
    `<text x="${N(BX0)}" y="112" font-size="10.5" fill="${SUAVE}">cima 2D, exposición C, H = ${COMA(H_CERRO, 0)} m fijo y L_h variable</text>`,
    `<text x="${N(BX0)}" y="126" font-size="10.5" fill="${SUAVE}">Pasado 0,5 el factor se congela: la norma le pone tope.</text>`,
  );

  // curva: H fijo, L_h variable
  const puntos = [];
  for (let r = 0.2; r <= 0.7001; r += 0.005) {
    const Lh = H_CERRO / r;
    const v = kzt({ forma: 'cima2d', exp: 'C', Lh });
    puntos.push(`${N(bsx(r))},${N(bsy(v.kzt))}`);
  }
  const tope = kzt({ forma: 'cima2d', exp: 'C', Lh: H_CERRO / 0.5 }).kzt;
  partes.push(
    `<line x1="${N(bsx(0.5))}" y1="${N(bsy(1))}" x2="${N(bsx(0.5))}" y2="${N(bsy(tope))}" stroke="${SUAVE}" stroke-width="1" stroke-dasharray="4 4"/>`,
    `<text x="${N(bsx(0.5) + 6)}" y="${N(bsy(tope) - 8)}" font-size="10" fill="${SUAVE}">tope: ${COMA(tope, 3)}</text>`,
  );
  partes.push(
    // la rama muerta
    `<line x1="${N(bsx(0))}" y1="${N(bsy(1))}" x2="${N(bsx(0.2))}" y2="${N(bsy(1))}" stroke="${ROJO}" stroke-width="2.8"/>`,
    `<polyline points="${puntos.join(' ')}" fill="none" stroke="${SUBE}" stroke-width="2.8"/>`,
  );

  const salto = kzt({ forma: 'cima2d', exp: 'C', Lh: H_CERRO / 0.2 }).kzt;
  partes.push(
    `<line x1="${N(bsx(0.2))}" y1="${N(bsy(1))}" x2="${N(bsx(0.2))}" y2="${N(bsy(salto))}" stroke="${TEXTO}" stroke-width="1.6" stroke-dasharray="5 4"/>`,
    `<circle cx="${N(bsx(0.2))}" cy="${N(bsy(1))}" r="4.5" fill="#ffffff" stroke="${ROJO}" stroke-width="2"/>`,
    `<circle cx="${N(bsx(0.2))}" cy="${N(bsy(salto))}" r="4.5" fill="${SUBE}"/>`,
    `<text x="${N(bsx(0.2) + 10)}" y="${N(bsy((1 + salto) / 2) + 4)}" font-size="11.5" fill="${TINTA}" font-weight="bold">salto de ${COMA((salto - 1) * 100, 0)} %</text>`,
    `<text x="${N(bsx(0.2) + 10)}" y="${N(bsy((1 + salto) / 2) + 20)}" font-size="10.5" fill="${SUAVE}">sin transición</text>`,
    `<circle cx="${N(bsx(BASE.ratio))}" cy="${N(bsy(K_ZT))}" r="5" fill="${AZUL}"/>`,
    `<text x="${N(bsx(BASE.ratio))}" y="${N(bsy(K_ZT) - 12)}" font-size="10.5" text-anchor="middle" fill="${AZUL}" font-weight="bold">el proyecto: ${COMA(K_ZT, 3)}</text>`,
    `<text x="${N(BX0)}" y="${N(bY0 + 56)}" font-size="11" fill="${TINTA}" font-weight="bold">Con L_h = ${COMA(H_CERRO / 0.2, 0)} m el factor vale ${COMA(salto, 3)}; con L_h un metro más,</text>`,
    `<text x="${N(BX0)}" y="${N(bY0 + 74)}" font-size="11" fill="${TINTA}" font-weight="bold">vale 1,00.</text>`,
    `<text x="${N(BX0)}" y="${N(bY0 + 92)}" font-size="10.5" fill="${SUAVE}">La condición 2 de §5.6.1 es un umbral, no una transición: medir mal el</text>`,
    `<text x="${N(BX0)}" y="${N(bY0 + 108)}" font-size="10.5" fill="${SUAVE}">L_h en el plano no cuesta un porcentaje, puede costar el factor entero.</text>`,
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 480" font-family="Segoe UI, Arial, sans-serif">
  <rect width="1000" height="480" fill="#ffffff"/>
  <text x="500" y="30" font-size="15.5" text-anchor="middle" fill="${TINTA}" font-weight="bold">El K_zt no se calcula: se decide. Y las dos decisiones no están en ninguna tabla</text>
  <text x="500" y="50" font-size="12" text-anchor="middle" fill="${SUAVE}">Qué forma tiene el accidente, y hasta dónde se mide el L_h. La aritmética de después es la parte fácil</text>
  ${DEFS}
  ${partes.join('\n  ')}
  <text x="70" y="466" font-size="10.5" fill="${SUAVE}">Parámetros K₁/(H/L_h), γ y μ por forma y exposición: Figura 3 de NCh 432:2025 · condiciones de aplicabilidad: §5.6.1 · Ec. (1) y el tope de 0,5: §5.6.2</text>
</svg>
`;
}

// ------------------------------------------------------------------- escritura

await mkdir(OUT_DIR, { recursive: true });

const figuras = [
  ['qh-cascada.svg', figuraCascada()],
  ['kzt-la-loma.svg', figuraLoma()],
  ['kzt-sensibilidad.svg', figuraSensibilidad()],
];

for (const [nombre, svg] of figuras) {
  const destino = path.join(OUT_DIR, nombre);
  await writeFile(destino, svg, 'utf8');
  console.log(`✓ ${path.relative(ROOT, destino)}  (${svg.length} bytes)`);
}

console.log(`\nq_h = ${QH.toFixed(6)} N/m²  ·  K_zt = ${K_ZT.toFixed(6)}  ·  K_e = ${K_E.toFixed(6)}`);
console.log(`K_zt·K_e = ${(K_ZT * K_E).toFixed(6)}  ·  p0 = ${P0.toFixed(4)} N/m²`);
for (const fm of ['cima2d', 'colina3d', 'escarpe2d']) {
  const r = kzt({ forma: fm, exp: 'C' });
  console.log(`  ${FORMAS[fm].rot.padEnd(24)} K1=${r.k1.toFixed(4)} K3=${r.k3.toFixed(4)} K_zt=${r.kzt.toFixed(4)}`);
}
const salto = kzt({ forma: 'cima2d', exp: 'C', Lh: H_CERRO / 0.2 });
console.log(`  salto en H/L_h = 0,20 (L_h = 200 m): K_zt = ${salto.kzt.toFixed(4)}`);
console.log('\nAhora MÍRALAS: npm run render:esquema -- public/ejemplo-galpon-altiplano-viento-sitio-nch432');
