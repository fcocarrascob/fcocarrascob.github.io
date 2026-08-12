#!/usr/bin/env node
// Dibuja los esquemas estructurales del galpón del altiplano
// (/blog/galpon-altiplano-la-serie).
//
//   npm run figuras:galpon-esquema
//
// Las constantes de geometría son LAS MISMAS que las del script de construcción
// del modelo (`Skills_SAP/scripts/galpon_altiplano_build.py`, rev.G): luz,
// pendiente, altura de alero, separación de marcos, la lista JS de líneas de
// arriostramiento, los vanos arriostrados y las leyes de peralte `d_col`/`d_din`.
// Se copian acá a propósito, con su procedencia al lado, para que el dibujo no
// pueda desviarse del modelo sin que se note: si alguien cambia la malla en el
// build, este archivo queda visiblemente inconsistente.
//
// Emite a public/galpon-altiplano-la-serie/:
//   el-galpon.svg    marco transversal + elevación longitudinal + planta de techo
//   el-tapered.svg   la ley de peralte, las 7 secciones, y la sección por planchas
//
// El SVG no hereda las variables CSS del sitio (se sirve como <img>): colores
// literales y coma decimal, como el resto de las figuras.

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT_DIR = path.join(ROOT, 'public/galpon-altiplano-la-serie');

// ------------------------------------------------------------------ geometría
// Idénticas a galpon_altiplano_build.py rev.G, líneas 36-52.
const LUZ = 24.0;
const PEND = 10.0;
const H_ALERO = 8.0;
const SEP = 6.0;
const NMARCOS = 5;
const NCOL = 4; // tramos de columna
const NSEG = 6; // tramos de dintel
const NJ = 18;
const LARGO = (NMARCOS - 1) * SEP; // 24,0 m
const DXJ = LUZ / 2 / 9; // 1,3333 m — paso de la malla de techo
const JS = [0, 3, 6, 9, 12, 15, 18]; // líneas de unión con el arriostramiento
const BAYS = [1, 2, 3, 4];
const BAYS_ARR = [1, 4]; // vanos con crucería
const J_PIL = [3, 6, 9, 12, 15]; // pilares de hastial
const TAN10 = Math.tan((PEND * Math.PI) / 180);

// Planchas del tapered (m)
const BF = 0.22;
const TF = 0.012;
const TW = 0.006;
const D_BASE = 0.35;
const D_ALERO = 0.8;
const D_CUMBRE = 0.35;

const xRoof = (j) => j * DXJ;
const zRoof = (j) => H_ALERO + (j <= 9 ? j : NJ - j) * DXJ * TAN10;
const dCol = (k) => D_BASE + ((D_ALERO - D_BASE) * (k - 0.5)) / NCOL;
const dDin = (m) => D_ALERO + ((D_CUMBRE - D_ALERO) * (m - 0.5)) / (NSEG / 2);
const mSeg = (i) => (i < NSEG / 2 ? i + 1 : NSEG - i);

const Z_CUMBRE = zRoof(9); // 10,1164 m
const FLECHA = Z_CUMBRE - H_ALERO; // 2,1164 m
const L_FALDON = LUZ / 2 / Math.cos((PEND * Math.PI) / 180); // 12,1852 m

// Paneles de arriostramiento de techo: el anillo de la Figura A.2.
// Franjas de alero (0-3 y 15-18) en LOS CUATRO vanos; franjas centrales solo en
// los vanos extremos. El resultado es un anillo cerrado con el centro vacío.
const PANELES = [
  ...BAYS.map((b) => [b, 0, 3]),
  ...BAYS.map((b) => [b, 15, 18]),
  ...BAYS_ARR.flatMap((b) =>
    [
      [3, 6],
      [6, 9],
      [9, 12],
      [12, 15],
    ].map(([j1, j2]) => [b, j1, j2]),
  ),
];

// ---------------------------------------------------------------- utilidades

const COMA = (x, dec = 2) => x.toFixed(dec).replace('.', ',');
const N = (x) => x.toFixed(1);

const TINTA = '#222';
const TEXTO = '#333';
const SUAVE = '#666';
const COTA = '#8a857c';
const ACERO = '#1b4a6e'; // marco principal
const ARR = '#a8641b'; // crucería
const PLANTA = '#c9a227'; // arriostramiento de techo
const SISMO = '#2d6b9c';
const PILAR = '#4a7c59'; // pilares de hastial

const DEFS = `<defs>
    <marker id="dim" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="${COTA}"/>
    </marker>
    <marker id="sis" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="${SISMO}"/>
    </marker>
  </defs>`;

// Terreno con achurado, como en la-torre.svg
function suelo(x1, x2, y) {
  const p = [`<line x1="${N(x1)}" y1="${N(y)}" x2="${N(x2)}" y2="${N(y)}" stroke="${COTA}" stroke-width="2"/>`];
  for (let x = x1 + 6; x < x2; x += 22) {
    p.push(`<line x1="${N(x)}" y1="${N(y)}" x2="${N(x - 8)}" y2="${N(y + 10)}" stroke="${COTA}" stroke-width="1"/>`);
  }
  return p.join('\n  ');
}

// Rótula (base articulada): círculo blanco con borde
const rotula = (cx, cy) =>
  `<circle cx="${N(cx)}" cy="${N(cy)}" r="5" fill="#ffffff" stroke="${ACERO}" stroke-width="2"/>`;

function cotaH(x1, x2, y, rot) {
  return [
    `<line x1="${N(x1)}" y1="${N(y)}" x2="${N(x2)}" y2="${N(y)}" stroke="${COTA}" stroke-width="1" marker-start="url(#dim)" marker-end="url(#dim)"/>`,
    `<text x="${N((x1 + x2) / 2)}" y="${N(y + 15)}" font-size="10.5" text-anchor="middle" fill="${COTA}">${rot}</text>`,
  ].join('\n  ');
}

function cotaV(x, y1, y2, rot) {
  return [
    `<line x1="${N(x)}" y1="${N(y1)}" x2="${N(x)}" y2="${N(y2)}" stroke="${COTA}" stroke-width="1" marker-start="url(#dim)" marker-end="url(#dim)"/>`,
    `<text x="${N(x + 7)}" y="${N((y1 + y2) / 2 + 4)}" font-size="10.5" fill="${COTA}">${rot}</text>`,
  ].join('\n  ');
}

// ============================================================== figura 1
// Marco transversal (con el peralte real) + elevación longitudinal + planta.

function figuraGalpon() {
  const partes = [];

  // ---------------------------------------------- A · marco transversal
  // escala 14 px/m · x del modelo 0..24 → 70..406 · z 0 → 330
  const SA = 14;
  const AX = (x) => 70 + x * SA;
  const AZ = (z) => 330 - z * SA;

  partes.push(
    `<text x="${N(AX(LUZ / 2))}" y="96" font-size="13" text-anchor="middle" fill="${ACERO}" font-weight="bold">Marco transversal — 5 iguales @ 6,0 m</text>`,
    `<text x="${N(AX(LUZ / 2))}" y="112" font-size="11" text-anchor="middle" fill="${SUAVE}">peralte variable dibujado a escala · el escalonado ES la discretización del modelo</text>`,
  );

  // El miembro se dibuja como polígono de espesor d(s) centrado en la línea de
  // trabajo teórica. Cada tramo tiene peralte CONSTANTE: así se ve que el modelo
  // es escalonado, no un tapered continuo.
  const quad = (p1, p2, d, color) => {
    // p1, p2 en coordenadas de modelo [x, z]; d en m, perpendicular al eje
    const dx = p2[0] - p1[0];
    const dz = p2[1] - p1[1];
    const L = Math.hypot(dx, dz);
    const nx = (-dz / L) * (d / 2);
    const nz = (dx / L) * (d / 2);
    const pts = [
      [p1[0] + nx, p1[1] + nz],
      [p2[0] + nx, p2[1] + nz],
      [p2[0] - nx, p2[1] - nz],
      [p1[0] - nx, p1[1] - nz],
    ]
      .map(([x, z]) => `${N(AX(x))},${N(AZ(z))}`)
      .join(' ');
    return `<polygon points="${pts}" fill="${color}" fill-opacity="0.25" stroke="${color}" stroke-width="1.1"/>`;
  };

  // columnas: 4 tramos, peralte horizontal
  for (const x of [0, LUZ]) {
    for (let k = 1; k <= NCOL; k++) {
      const z1 = ((k - 1) * H_ALERO) / NCOL;
      const z2 = (k * H_ALERO) / NCOL;
      partes.push(quad([x, z1], [x, z2], dCol(k), ACERO));
    }
  }
  // dintel: 6 tramos, peralte perpendicular al faldón
  for (let i = 0; i < NSEG; i++) {
    const j1 = JS[i];
    const j2 = JS[i + 1];
    partes.push(quad([xRoof(j1), zRoof(j1)], [xRoof(j2), zRoof(j2)], dDin(mSeg(i)), ACERO));
  }

  // línea de trabajo teórica
  partes.push(
    `<polyline points="${[
      [0, 0],
      [0, H_ALERO],
      [LUZ / 2, Z_CUMBRE],
      [LUZ, H_ALERO],
      [LUZ, 0],
    ]
      .map(([x, z]) => `${N(AX(x))},${N(AZ(z))}`)
      .join(' ')}" fill="none" stroke="${ACERO}" stroke-width="1" stroke-dasharray="3 3" stroke-opacity="0.75"/>`,
  );

  // nodos de la malla del dintel (las 7 líneas JS)
  for (const j of JS) {
    partes.push(`<circle cx="${N(AX(xRoof(j)))}" cy="${N(AZ(zRoof(j)))}" r="2.6" fill="${ACERO}"/>`);
  }
  // nodos de la columna
  for (const x of [0, LUZ]) {
    for (let k = 1; k < NCOL; k++) {
      partes.push(`<circle cx="${N(AX(x))}" cy="${N(AZ((k * H_ALERO) / NCOL))}" r="2.6" fill="${ACERO}"/>`);
    }
  }

  partes.push(suelo(AX(0) - 26, AX(LUZ) + 26, AZ(0)));
  partes.push(rotula(AX(0), AZ(0)), rotula(AX(LUZ), AZ(0)));

  // sismo transversal
  partes.push(
    `<line x1="${N(AX(0) - 62)}" y1="${N(AZ(H_ALERO))}" x2="${N(AX(0) - 20)}" y2="${N(AZ(H_ALERO))}" stroke="${SISMO}" stroke-width="3" marker-end="url(#sis)"/>`,
    `<text x="${N(AX(0) - 62)}" y="${N(AZ(H_ALERO) - 10)}" font-size="11.5" fill="${SISMO}" font-weight="bold">E_x</text>`,
  );

  // pendiente
  partes.push(
    `<text x="${N(AX(6.5))}" y="${N(AZ(9.6))}" font-size="11" fill="${SUAVE}">10°</text>`,
    `<path d="M ${N(AX(4.4))} ${N(AZ(H_ALERO + 4.4 * TAN10))} L ${N(AX(7.4))} ${N(AZ(H_ALERO + 4.4 * TAN10))}" fill="none" stroke="${SUAVE}" stroke-width="1" stroke-dasharray="3 2"/>`,
  );

  // cotas del marco
  partes.push(
    cotaH(AX(0), AX(LUZ), AZ(0) + 34, 'luz 24,0 m'),
    cotaV(AX(LUZ) + 30, AZ(0), AZ(H_ALERO), `alero ${COMA(H_ALERO, 1)} m`),
    cotaV(AX(LUZ) + 74, AZ(H_ALERO), AZ(Z_CUMBRE), `f = ${COMA(FLECHA, 3)} m`),
    `<line x1="${N(AX(LUZ))}" y1="${N(AZ(H_ALERO))}" x2="${N(AX(LUZ) + 80)}" y2="${N(AZ(H_ALERO))}" stroke="${COTA}" stroke-width="0.8" stroke-dasharray="3 3"/>`,
    `<line x1="${N(AX(LUZ / 2))}" y1="${N(AZ(Z_CUMBRE))}" x2="${N(AX(LUZ) + 80)}" y2="${N(AZ(Z_CUMBRE))}" stroke="${COTA}" stroke-width="0.8" stroke-dasharray="3 3"/>`,
    `<text x="${N(AX(LUZ / 2))}" y="${N(AZ(0) + 62)}" font-size="10.5" text-anchor="middle" fill="${SUAVE}">bases articuladas · peralte 350 → 800 → 350 mm</text>`,
  );

  // ------------------------------------- B · elevación longitudinal (muro A)
  const SB = 13;
  const BX = (y) => 596 + y * SB;
  const BZ = (z) => 330 - z * SB;

  partes.push(
    `<text x="${N(BX(LARGO / 2))}" y="96" font-size="13" text-anchor="middle" fill="${ACERO}" font-weight="bold">Elevación longitudinal — muro tipo</text>`,
    `<text x="${N(BX(LARGO / 2))}" y="112" font-size="11" text-anchor="middle" fill="${SUAVE}">crucería solo en los dos vanos extremos · los otros dos van libres</text>`,
  );

  // crucería de muro: X completa de base a alero, en los vanos 1 y 4
  for (const b of BAYS_ARR) {
    const y1 = (b - 1) * SEP;
    const y2 = b * SEP;
    partes.push(
      `<line x1="${N(BX(y1))}" y1="${N(BZ(0))}" x2="${N(BX(y2))}" y2="${N(BZ(H_ALERO))}" stroke="${ARR}" stroke-width="2.2"/>`,
      `<line x1="${N(BX(y2))}" y1="${N(BZ(0))}" x2="${N(BX(y1))}" y2="${N(BZ(H_ALERO))}" stroke="${ARR}" stroke-width="2.2"/>`,
      `<circle cx="${N(BX((y1 + y2) / 2))}" cy="${N(BZ(H_ALERO / 2))}" r="3.4" fill="${ARR}"/>`,
    );
  }

  // columnas (las 5) y la línea de alero
  for (let f = 1; f <= NMARCOS; f++) {
    const y = (f - 1) * SEP;
    partes.push(
      `<line x1="${N(BX(y))}" y1="${N(BZ(0))}" x2="${N(BX(y))}" y2="${N(BZ(H_ALERO))}" stroke="${ACERO}" stroke-width="3.2"/>`,
      rotula(BX(y), BZ(0)),
    );
  }
  // El alero es una línea de puntales (j = 0), no arriostramiento de techo.
  partes.push(
    `<line x1="${N(BX(0))}" y1="${N(BZ(H_ALERO))}" x2="${N(BX(LARGO))}" y2="${N(BZ(H_ALERO))}" stroke="${ARR}" stroke-width="2.6"/>`,
    `<text x="${N(BX(LARGO) + 8)}" y="${N(BZ(H_ALERO) + 4)}" font-size="10" fill="${ARR}">puntal de alero</text>`,
  );

  partes.push(suelo(BX(0) - 26, BX(LARGO) + 26, BZ(0)));

  partes.push(
    `<line x1="${N(BX(0) - 62)}" y1="${N(BZ(H_ALERO))}" x2="${N(BX(0) - 20)}" y2="${N(BZ(H_ALERO))}" stroke="${SISMO}" stroke-width="3" marker-end="url(#sis)"/>`,
    `<text x="${N(BX(0) - 62)}" y="${N(BZ(H_ALERO) - 10)}" font-size="11.5" fill="${SISMO}" font-weight="bold">E_y</text>`,
  );

  for (const b of BAYS) {
    partes.push(cotaH(BX((b - 1) * SEP), BX(b * SEP), BZ(0) + 34, `${COMA(SEP, 1)} m`));
  }
  partes.push(
    `<text x="${N(BX(LARGO / 2))}" y="${N(BZ(0) + 62)}" font-size="10.5" text-anchor="middle" fill="${SUAVE}">largo total 24,0 m · el cruce de la X es el punto de arriostramiento (NCh2369 §8.6.4)</text>`,
  );

  // ------------------------------------------------- C · planta de techo
  const SC = 9.6;
  const CX = (x) => 132 + x * SC;
  // Y hacia ARRIBA, como en una planta convencional: el marco 1 queda abajo.
  const CY = (y) => 448 + (LARGO - y) * SC;

  partes.push(
    `<text x="${N(CX(LUZ / 2))}" y="410" font-size="13" text-anchor="middle" fill="${ACERO}" font-weight="bold">Planta de techo — el anillo de la Figura A.2</text>`,
    `<text x="${N(CX(LUZ / 2))}" y="428" font-size="10.5" text-anchor="middle" fill="${SUAVE}">la línea central es la cumbrera</text>`,
  );

  // diagonales de techo (el anillo)
  for (const [b, j1, j2] of PANELES) {
    const y1 = (b - 1) * SEP;
    const y2 = b * SEP;
    const x1 = xRoof(j1);
    const x2 = xRoof(j2);
    partes.push(
      `<line x1="${N(CX(x1))}" y1="${N(CY(y1))}" x2="${N(CX(x2))}" y2="${N(CY(y2))}" stroke="${PLANTA}" stroke-width="1.5"/>`,
      `<line x1="${N(CX(x2))}" y1="${N(CY(y1))}" x2="${N(CX(x1))}" y2="${N(CY(y2))}" stroke="${PLANTA}" stroke-width="1.5"/>`,
      `<circle cx="${N(CX((x1 + x2) / 2))}" cy="${N(CY((y1 + y2) / 2))}" r="2" fill="${PLANTA}"/>`,
    );
  }

  // puntales: las 7 líneas JS en los 4 vanos
  for (const j of JS) {
    partes.push(
      `<line x1="${N(CX(xRoof(j)))}" y1="${N(CY(0))}" x2="${N(CX(xRoof(j)))}" y2="${N(CY(LARGO))}" stroke="${ARR}" stroke-width="1.8"/>`,
    );
  }
  // marcos (líneas transversales)
  for (let f = 1; f <= NMARCOS; f++) {
    const y = (f - 1) * SEP;
    partes.push(
      `<line x1="${N(CX(0))}" y1="${N(CY(y))}" x2="${N(CX(LUZ))}" y2="${N(CY(y))}" stroke="${ACERO}" stroke-width="2.6"/>`,
    );
  }
  // cumbrera destacada
  partes.push(
    `<line x1="${N(CX(LUZ / 2))}" y1="${N(CY(0))}" x2="${N(CX(LUZ / 2))}" y2="${N(CY(LARGO))}" stroke="${ARR}" stroke-width="2.6"/>`,
  );
  // columnas en las esquinas de cada marco
  for (let f = 1; f <= NMARCOS; f++) {
    for (const x of [0, LUZ]) {
      partes.push(
        `<rect x="${N(CX(x) - 4)}" y="${N(CY((f - 1) * SEP) - 4)}" width="8" height="8" fill="${ACERO}"/>`,
      );
    }
  }
  // pilares de hastial
  for (const f of [1, NMARCOS]) {
    for (const j of J_PIL) {
      partes.push(
        `<circle cx="${N(CX(xRoof(j)))}" cy="${N(CY((f - 1) * SEP))}" r="3.2" fill="${PILAR}"/>`,
      );
    }
  }
  // El centro vacío, recuadrado: es lo que convierte el dibujo en un anillo y lo
  // que se pierde de vista si uno mira la Figura A.2 rápido.
  partes.push(
    `<rect x="${N(CX(xRoof(3)))}" y="${N(CY(3 * SEP))}" width="${N(CX(xRoof(15)) - CX(xRoof(3)))}" height="${N(CY(SEP) - CY(3 * SEP))}" fill="none" stroke="${SUAVE}" stroke-width="1.2" stroke-dasharray="5 4"/>`,
    `<rect x="${N(CX(LUZ / 2) - 36)}" y="${N(CY(LARGO / 2) - 17)}" width="72" height="27" fill="#ffffff" fill-opacity="0.95"/>`,
    `<text x="${N(CX(LUZ / 2))}" y="${N(CY(LARGO / 2) - 4)}" font-size="10" text-anchor="middle" fill="${SUAVE}">centro</text>`,
    `<text x="${N(CX(LUZ / 2))}" y="${N(CY(LARGO / 2) + 8)}" font-size="10" text-anchor="middle" fill="${SUAVE}">sin aspas</text>`,
  );

  partes.push(
    cotaH(CX(0), CX(LUZ), CY(0) + 28, '24,0 m (luz)'),
    cotaV(CX(LUZ) + 24, CY(LARGO), CY(0), '24,0 m (largo)'),
  );

  // ejes, abajo a la izquierda: X a la derecha, Y hacia arriba
  partes.push(
    `<line x1="${N(CX(0) - 50)}" y1="${N(CY(0))}" x2="${N(CX(0) - 22)}" y2="${N(CY(0))}" stroke="${SUAVE}" stroke-width="1.5" marker-end="url(#dim)"/>`,
    `<text x="${N(CX(0) - 16)}" y="${N(CY(0) + 4)}" font-size="10.5" fill="${SUAVE}">X</text>`,
    `<line x1="${N(CX(0) - 50)}" y1="${N(CY(0))}" x2="${N(CX(0) - 50)}" y2="${N(CY(0) - 28)}" stroke="${SUAVE}" stroke-width="1.5" marker-end="url(#dim)"/>`,
    `<text x="${N(CX(0) - 50)}" y="${N(CY(0) - 34)}" font-size="10.5" text-anchor="middle" fill="${SUAVE}">Y</text>`,
  );

  // ------------------------------------------------------------- leyenda
  const leyenda = [
    { color: ACERO, w: 3.2, rot: 'Marco de momento: columna y dintel de peralte variable' },
    { color: ARR, w: 2.4, rot: 'Puntales longitudinales (7 líneas × 4 vanos = 28) y crucería de muro' },
    { color: PLANTA, w: 1.8, rot: 'Arriostramiento de techo — NCh2369 §12.1.2, topología de la Fig. A.2' },
    { color: PILAR, w: 3.2, rot: 'Pilares de hastial (5 por testera, con P liberada arriba)' },
  ]
    .map((c, i) => {
      const yy = 452 + i * 24;
      return [
        `<line x1="470" y1="${N(yy - 4)}" x2="504" y2="${N(yy - 4)}" stroke="${c.color}" stroke-width="${c.w}"/>`,
        `<text x="514" y="${N(yy)}" font-size="11" fill="${TEXTO}">${c.rot}</text>`,
      ].join('\n  ');
    })
    .join('\n  ');

  partes.push(leyenda);
  partes.push(
    `<text x="470" y="566" font-size="11" fill="${TINTA}" font-weight="bold">Por qué el anillo, y no una crucería completa</text>`,
    `<text x="470" y="584" font-size="10.5" fill="${SUAVE}">§12.1.2 obliga al arriostramiento continuo de techo, pero es la Figura A.2 —del</text>`,
    `<text x="470" y="598" font-size="10.5" fill="${SUAVE}">Anexo A, informativo— la que dibuja la topología. Y lo que la figura vacía en el</text>`,
    `<text x="470" y="612" font-size="10.5" fill="${SUAVE}">centro son las aspas, no las líneas: los puntales van en los cuatro vanos igual.</text>`,
    `<text x="470" y="636" font-size="11" fill="${TINTA}" font-weight="bold">Lo que NO está modelado, a propósito</text>`,
    `<text x="470" y="654" font-size="10.5" fill="${SUAVE}">Las costaneras. Se calculan aparte como viga simple de 6,0 m y su carga entra</text>`,
    `<text x="470" y="668" font-size="10.5" fill="${SUAVE}">distribuida sobre el dintel. Modelarlas metía masa en nodos sin atadura y llenaba</text>`,
    `<text x="470" y="682" font-size="10.5" fill="${SUAVE}">el modal de modos locales.</text>`,
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 780" font-family="Segoe UI, Arial, sans-serif">
  <rect width="1000" height="780" fill="#ffffff"/>
  <text x="500" y="30" font-size="15.5" text-anchor="middle" fill="${TINTA}" font-weight="bold">El galpón: marcos a momento en el corte, arriostrado en el largo y en el techo</text>
  <text x="500" y="50" font-size="12" text-anchor="middle" fill="${SUAVE}">24,0 × 24,0 m en planta · 5 marcos @ 6,0 m · alero 8,0 m · pendiente 10° · bases articuladas · 105 nodos y 188 barras</text>
  ${DEFS}
  ${partes.join('\n  ')}
  <text x="70" y="748" font-size="10.5" fill="${SUAVE}">Geometría y topología: las mismas constantes del modelo verificado (Skills_SAP/scripts/galpon_altiplano_build.py rev.G) · 23 826,4 kg de acero = 41,365 kg/m²</text>
  <text x="70" y="763" font-size="10.5" fill="${SUAVE}">Los once estados de carga cierran con residuo de equilibrio 0,0 contra la resultante calculada a mano.</text>
</svg>
`;
}

// ============================================================== figura 2
// La ley de peralte: lo que el modelo tiene contra la recta teórica.

function figuraTapered() {
  const partes = [];

  // Recorrido s desde la base de la columna hasta la cumbrera.
  const S_TOTAL = H_ALERO + L_FALDON; // 20,1852 m
  const X0 = 78;
  const W = 600;
  const Y0 = 340; // línea de d = 0
  const H = 200;
  const D_MAX = 0.9;

  const sx = (s) => X0 + (s / S_TOTAL) * W;
  const sy = (d) => Y0 - (d / D_MAX) * H;

  // rejilla
  for (const d of [0, 0.2, 0.4, 0.6, 0.8]) {
    partes.push(
      `<line x1="${N(X0)}" y1="${N(sy(d))}" x2="${N(X0 + W)}" y2="${N(sy(d))}" stroke="#d1d5db" stroke-width="1"/>`,
      `<text x="${N(X0 - 8)}" y="${N(sy(d) + 4)}" font-size="11" text-anchor="end" fill="${SUAVE}">${(d * 1000).toFixed(0)}</text>`,
    );
  }
  partes.push(
    `<line x1="${N(X0)}" y1="${N(Y0)}" x2="${N(X0 + W)}" y2="${N(Y0)}" stroke="${TEXTO}" stroke-width="1.5"/>`,
    `<line x1="${N(X0)}" y1="${N(sy(D_MAX))}" x2="${N(X0)}" y2="${N(Y0)}" stroke="${TEXTO}" stroke-width="1.5"/>`,
    `<text x="${N(X0 - 8)}" y="102" font-size="11.5" fill="${TEXTO}">peralte d [mm]</text>`,
  );

  // hitos del recorrido, en vez de un eje numerado que pelearía con los rótulos
  for (const [s, rot, anc] of [
    [0, 'base · s = 0', 'start'],
    [H_ALERO, `alero · s = ${COMA(H_ALERO, 1)} m`, 'middle'],
    [S_TOTAL, `cumbrera · s = ${COMA(S_TOTAL, 2)} m`, 'end'],
  ]) {
    partes.push(
      `<line x1="${N(sx(s))}" y1="${N(Y0)}" x2="${N(sx(s))}" y2="${N(Y0 + 6)}" stroke="${TEXTO}" stroke-width="1.5"/>`,
      `<text x="${N(sx(s))}" y="${N(Y0 + 36)}" font-size="10.5" text-anchor="${anc}" fill="${TEXTO}">${rot}</text>`,
    );
  }

  // frontera columna / dintel
  partes.push(
    `<line x1="${N(sx(H_ALERO))}" y1="${N(sy(D_MAX))}" x2="${N(sx(H_ALERO))}" y2="${N(Y0)}" stroke="${SUAVE}" stroke-width="1.2" stroke-dasharray="5 4"/>`,
    `<text x="${N(sx(H_ALERO / 2))}" y="126" font-size="11.5" text-anchor="middle" fill="${ACERO}" font-weight="bold">COLUMNA · 4 tramos de 2,0 m</text>`,
    `<text x="${N(sx(H_ALERO + L_FALDON / 2))}" y="126" font-size="11.5" text-anchor="middle" fill="${ACERO}" font-weight="bold">DINTEL (medio faldón) · 3 tramos</text>`,
  );

  // la recta teórica d(s)
  const recta = [
    [0, D_BASE],
    [H_ALERO, D_ALERO],
    [S_TOTAL, D_CUMBRE],
  ]
    .map(([s, d]) => `${N(sx(s))},${N(sy(d))}`)
    .join(' ');
  partes.push(
    `<polyline points="${recta}" fill="none" stroke="${ARR}" stroke-width="2.2" stroke-dasharray="7 4"/>`,
  );

  // los 7 escalones reales, evaluados en el punto medio de cada tramo
  const escalones = [];
  for (let k = 1; k <= NCOL; k++) {
    escalones.push({
      s1: ((k - 1) * H_ALERO) / NCOL,
      s2: (k * H_ALERO) / NCOL,
      d: dCol(k),
      rot: `COL_${k}`,
    });
  }
  for (let m = 1; m <= NSEG / 2; m++) {
    escalones.push({
      s1: H_ALERO + ((m - 1) * L_FALDON) / 3,
      s2: H_ALERO + (m * L_FALDON) / 3,
      d: dDin(m),
      rot: `DIN_${m}`,
    });
  }
  for (const e of escalones) {
    partes.push(
      `<rect x="${N(sx(e.s1))}" y="${N(sy(e.d))}" width="${N(sx(e.s2) - sx(e.s1))}" height="${N(Y0 - sy(e.d))}" fill="${ACERO}" fill-opacity="0.14" stroke="${ACERO}" stroke-width="1.4"/>`,
      `<text x="${N((sx(e.s1) + sx(e.s2)) / 2)}" y="${N(sy(e.d) - 7)}" font-size="10" text-anchor="middle" fill="${ACERO}" font-weight="bold">${COMA(e.d * 1000, 2)}</text>`,
      `<text x="${N((sx(e.s1) + sx(e.s2)) / 2)}" y="${N(Y0 + 16)}" font-size="9.5" text-anchor="middle" fill="${SUAVE}">${e.rot}</text>`,
    );
  }

  // marcas de los quiebres de la recta: los dos 350 van DEBAJO del punto (dentro
  // de la barra, que es clara) para no pisar el borde superior del escalón.
  for (const [s, d, rot, anc, dy] of [
    [0, D_BASE, '350 en la base', 'start', 20],
    [H_ALERO, D_ALERO, '800 en el alero', 'middle', -14],
    [S_TOTAL, D_CUMBRE, '350 en la cumbrera', 'end', 20],
  ]) {
    partes.push(`<circle cx="${N(sx(s))}" cy="${N(sy(d))}" r="4" fill="${ARR}"/>`);
    partes.push(
      `<text x="${N(sx(s) + (anc === 'start' ? 6 : anc === 'end' ? -6 : 0))}" y="${N(sy(d) + dy)}" font-size="10.5" text-anchor="${anc}" fill="${ARR}">${rot}</text>`,
    );
  }

  partes.push(
    `<line x1="700" y1="120" x2="734" y2="120" stroke="${ARR}" stroke-width="2.2" stroke-dasharray="7 4"/>`,
    `<text x="744" y="124" font-size="11" fill="${TEXTO}">la ley lineal d(s) del proyecto</text>`,
    `<rect x="700" y="140" width="34" height="12" fill="${ACERO}" fill-opacity="0.14" stroke="${ACERO}" stroke-width="1.4"/>`,
    `<text x="744" y="150" font-size="11" fill="${TEXTO}">las 7 secciones del modelo</text>`,
    `<text x="700" y="182" font-size="11" fill="${TINTA}" font-weight="bold">El peralte se evalúa en el PUNTO MEDIO</text>`,
    `<text x="700" y="200" font-size="10.5" fill="${SUAVE}">de cada tramo, nunca en un extremo. Con ley</text>`,
    `<text x="700" y="214" font-size="10.5" fill="${SUAVE}">lineal eso equivale a promediar los peraltes,</text>`,
    `<text x="700" y="228" font-size="10.5" fill="${SUAVE}">pero no las inercias: I va con d² y promediar</text>`,
    `<text x="700" y="242" font-size="10.5" fill="${SUAVE}">secciones da un tramo más rígido del que hay.</text>`,
    `<text x="700" y="252" font-size="11" fill="${TINTA}" font-weight="bold">Por qué 4 y 3, y no más</text>`,
    `<text x="700" y="270" font-size="10.5" fill="${SUAVE}">La malla se corta en las uniones con el</text>`,
    `<text x="700" y="284" font-size="10.5" fill="${SUAVE}">arriostramiento de techo, que ya existen.</text>`,
    `<text x="700" y="298" font-size="10.5" fill="${SUAVE}">Un solo mallado sirve para cargar, para</text>`,
    `<text x="700" y="312" font-size="10.5" fill="${SUAVE}">arriostrar y para verificar por estación.</text>`,
  );

  // ---------------------------------------------- la sección por planchas
  // 220 px/m sobre el peralte de alero (800 mm) → 176 px de alto
  const SS = 220;
  const CX = 260;
  const CY = 560;
  const half = (D_ALERO * SS) / 2;
  const bfp = BF * SS;
  const tfp = TF * SS;
  const twp = TW * SS;

  partes.push(
    `<text x="${N(CX)}" y="422" font-size="13" text-anchor="middle" fill="${ACERO}" font-weight="bold">La sección: doble T soldada, definida por planchas</text>`,
    `<text x="${N(CX)}" y="438" font-size="11" text-anchor="middle" fill="${SUAVE}">dibujada en el alero (d = 800 mm) · A, I, J y Z salen de primeros principios</text>`,
    // ala superior
    `<rect x="${N(CX - bfp / 2)}" y="${N(CY - half)}" width="${N(bfp)}" height="${N(tfp)}" fill="${ACERO}" fill-opacity="0.3" stroke="${ACERO}" stroke-width="1.2"/>`,
    // ala inferior
    `<rect x="${N(CX - bfp / 2)}" y="${N(CY + half - tfp)}" width="${N(bfp)}" height="${N(tfp)}" fill="${ACERO}" fill-opacity="0.3" stroke="${ACERO}" stroke-width="1.2"/>`,
    // alma
    `<rect x="${N(CX - twp / 2)}" y="${N(CY - half + tfp)}" width="${N(twp)}" height="${N(2 * half - 2 * tfp)}" fill="${ACERO}" fill-opacity="0.3" stroke="${ACERO}" stroke-width="1.2"/>`,
    // cotas
    cotaH(CX - bfp / 2, CX + bfp / 2, CY - half - 18, `b_f = ${(BF * 1000).toFixed(0)} mm`),
    cotaV(CX + bfp / 2 + 44, CY - half, CY + half, `d = ${(D_ALERO * 1000).toFixed(0)} mm`),
    `<line x1="${N(CX + bfp / 2)}" y1="${N(CY - half)}" x2="${N(CX + bfp / 2 + 48)}" y2="${N(CY - half)}" stroke="${COTA}" stroke-width="0.8" stroke-dasharray="3 3"/>`,
    `<line x1="${N(CX + bfp / 2)}" y1="${N(CY + half)}" x2="${N(CX + bfp / 2 + 48)}" y2="${N(CY + half)}" stroke="${COTA}" stroke-width="0.8" stroke-dasharray="3 3"/>`,
    `<text x="${N(CX + bfp / 2 + 6)}" y="${N(CY - half + tfp + 10)}" font-size="10" fill="${SUAVE}">t_f = ${(TF * 1000).toFixed(0)} mm</text>`,
    `<text x="${N(CX + twp / 2 + 8)}" y="${N(CY + 4)}" font-size="10" fill="${SUAVE}">t_w = ${(TW * 1000).toFixed(0)} mm</text>`,
  );

  partes.push(
    `<text x="560" y="470" font-size="11" fill="${TINTA}" font-weight="bold">El predimensionamiento está hecho para fallar</text>`,
    `<text x="560" y="490" font-size="10.5" fill="${SUAVE}">Con alma de 6 mm y el peralte de alero, h = 800 − 2×12 = 776 mm</text>`,
    `<text x="560" y="504" font-size="10.5" fill="${SUAVE}">y h/t_w = 129,33 — falla el límite de alma no esbelta a compresión.</text>`,
    `<text x="560" y="518" font-size="10.5" fill="${SUAVE}">Y el arreglo obvio, subir el alma a 8 mm, tampoco alcanza.</text>`,
    `<text x="560" y="546" font-size="11" fill="${TINTA}" font-weight="bold">Y el J no se calcula a mano</text>`,
    `<text x="560" y="566" font-size="10.5" fill="${SUAVE}">La constante torsional que reporta SAP queda entre 2,9 y 3,2 %</text>`,
    `<text x="560" y="580" font-size="10.5" fill="${SUAVE}">bajo Σbt³/3, según la sección. Se adopta GetSectProps como</text>`,
    `<text x="560" y="594" font-size="10.5" fill="${SUAVE}">fuente única, o los dos motores no consumen el mismo número.</text>`,
    `<text x="560" y="622" font-size="11" fill="${TINTA}" font-weight="bold">Prohibida la sección no prismática de SAP2000</text>`,
    `<text x="560" y="642" font-size="10.5" fill="${SUAVE}">Su integración interna no es reproducible desde OpenSeesPy, y</text>`,
    `<text x="560" y="656" font-size="10.5" fill="${SUAVE}">con ella la verificación en dos motores dejaría de verificar nada.</text>`,
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" font-family="Segoe UI, Arial, sans-serif">
  <rect width="1000" height="700" fill="#ffffff"/>
  <text x="500" y="30" font-size="15.5" text-anchor="middle" fill="${TINTA}" font-weight="bold">El peralte variable: una recta de proyecto, siete secciones de análisis</text>
  <text x="500" y="50" font-size="12" text-anchor="middle" fill="${SUAVE}">alma 6 mm · alas 220 × 12 mm · acero A36 · el dintel se dibuja hasta la cumbrera y se refleja por simetría</text>
  ${DEFS}
  ${partes.join('\n  ')}
  <text x="78" y="676" font-size="10.5" fill="${SUAVE}">Leyes de peralte y malla: galpon_altiplano_build.py rev.G · d_col(k) y d_din(m) evaluadas en el punto medio de cada tramo</text>
  <text x="78" y="691" font-size="10.5" fill="${SUAVE}">Discretizar menos no es conservador: con un solo tramo por columna la deriva se sobreestima un 37,8 %, y el prismático equivalente se equivoca en los dos sentidos a la vez.</text>
</svg>
`;
}

// ------------------------------------------------------------------- escritura

await mkdir(OUT_DIR, { recursive: true });

const figuras = [
  ['el-galpon.svg', figuraGalpon()],
  ['el-tapered.svg', figuraTapered()],
];

for (const [nombre, svg] of figuras) {
  const destino = path.join(OUT_DIR, nombre);
  await writeFile(destino, svg, 'utf8');
  console.log(`✓ ${path.relative(ROOT, destino)}  (${svg.length} bytes)`);
}

console.log('\nAhora MÍRALOS: npm run render:esquema -- public/galpon-altiplano-la-serie');
