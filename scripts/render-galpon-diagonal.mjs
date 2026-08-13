#!/usr/bin/env node
// Dibuja las tres figuras calculadas del post de las diagonales del galpón del
// altiplano (/acero/ejemplo-diagonal-longitudinal-galpon).
//
//   npm run figuras:galpon-diagonal
//
// Las constantes vienen de SERIE-GALPON.md, que es la memoria de cálculo de la
// serie: §4.1 las lecturas de norma rasterizadas · §5.36 los dos T* · §5.37 la
// envolvente · §5.45 las cuatro barras corridas · §6.2.1 el modelo en números.
// Las secciones son las del `.sdb` congelado, leídas de
// Skills_SAP/scripts/galpon_altiplano_build.py. Van SIN redondear.
//
// Todo lo que se dibuja se RECALCULA acá desde las propiedades de plancha —no
// se copia de la memoria— y se contrasta contra lo que registra §5.45: si
// alguna cifra se separa más de 1e-6 relativo, el script falla en vez de
// dibujar un número que no cuadra.
//
// Emite a public/ejemplo-diagonal-longitudinal-galpon/:
//   diagonal-limites.svg   las tres fronteras y las cuatro barras
//   diagonal-espectro.svg  los dos T* sobre el espectro, y el corte que sale
//   diagonal-puertas.svg   el árbol de la cláusula 8 y sus salidas
//
// El SVG no hereda las variables CSS del sitio (se sirve como <img>): colores
// literales y coma decimal, como el resto de las figuras.

import { build } from 'esbuild';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT_DIR = path.join(ROOT, 'public/ejemplo-diagonal-longitudinal-galpon');

async function loadSpectrum() {
  const out = path.join(tmpdir(), `nch2369-spectrum-diagonal-${process.pid}.mjs`);
  await build({
    entryPoints: [path.join(ROOT, 'src/lib/nch2369-spectrum.ts')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile: out,
    logLevel: 'error',
  });
  const mod = await import(pathToFileURL(out).href);
  await rm(out, { force: true });
  return mod;
}

const { AR_BY_ZONE, SOIL_PARAMS } = await loadSpectrum();

// ------------------------------------------------------------------ los datos

// Material: A36 en PLANCHA. R_y = 1,3 sale de la Tabla A3.2 de AISC 341-22,
// fila «Plates, Strips, and Sheets», por remisión de la 8.3.3 de NCh2369.
const FY = 250; // MPa
const E = 200000; // MPa
const RY = 1.3;
const PHI_C = 0.9;

// Coeficientes leídos rasterizados el 2026-08-12 (SERIE-GALPON §4.1):
//   0,76  NCh2369:2025 Tabla 9, «paredes de perfiles rectangulares SOLDADOS
//         usados como arriostramientos» (pág. impresa 98) — razón h/t
//   1,49  AISC 360-22 Tabla B4.1a caso 8, «All other stiffened elements»
//   1,40  AISC 360-22 Tabla B4.1a caso 6, «Walls of rectangular HSS»
//   1,5π  NCh2369 8.6.3 y 8.8.4, esbeltez global
const C_LAMBDA_MD = 0.76;
const C_LAMBDA_R_CAJON = 1.49;
const C_LAMBDA_R_HSS = 1.4;

// Sitio (§4.1: Tablas 3 y 6). I = 1,00 por Categoría II.
const ZONA = 2;
const SUELO = 'B';
const I_IMP = 1.0;
const AR = AR_BY_ZONE[ZONA];
const SP = SOIL_PARAMS[SUELO];

// Modelo congelado (§6.2.1).
const T_STAR_X = 0.8526565963541679; // s · transversal, marcos de momento
const T_STAR_Y = 0.1610608923144279; // s · longitudinal, arriostrada
const Q0_X = 86.960228719357; // kN
const Q0_Y = 130.2571888641845; // kN
const R_STAR_Y = 3.8301633726045696; // §6.2.1 · la dirección donde vive la diagonal
const Q0_MIN = 70.86041455430902; // kN · Ec. (12), §5.12

// Envolvente (§5.37). Compresión en kN, sin redondear.
const PU_DIAG_MURO = 39.895;
const PU_DIAG_TECHO = 28.234;
const PU_PUNTAL = 96.087;
const PU_MURO_GRAVEDAD_VIENTO = 34.233; // la envolvente que NO gobierna

// Geometría, de galpon_altiplano_build.py. LUZ 24,0 m · SEP 6,0 m · alero 8,0 m
// · pendiente 10° · DXJ = (LUZ/2)/9 · las diagonales se modelan por MITADES
// porque 8.6.4 conecta el cruce.
const DXJ = 12.0 / 9.0;
const DZ_PANEL = 3 * DXJ * Math.tan((10 * Math.PI) / 180);
const L_MURO = Math.hypot(3.0, 4.0) * 1000; // base → XM: Δy 3,0 · Δz 4,0
const L_TECHO = (Math.hypot(3 * DXJ, 6.0, DZ_PANEL) / 2) * 1000;
const L_PUNTAL = 6000;

// ------------------------------------------------- lo que se recalcula acá

const raizE_Fy = Math.sqrt(E / FY);
const raizE_RyFy = Math.sqrt(E / (RY * FY));

// El amplificador de la exención, por la Ec. (14) y §12.2.2. Es DIRECCIONAL: en
// la transversal R*_X = 4 y da 2,00, pero esta diagonal vive en la longitudinal.
const R1_Y = R_STAR_Y * Math.min(Q0_Y / Q0_MIN, 1);
const AMPLIF = 0.5 * R1_Y;

const LAMBDA_MD = C_LAMBDA_MD * raizE_RyFy;
const LAMBDA_R_CAJON = C_LAMBDA_R_CAJON * raizE_Fy;
const LAMBDA_R_HSS = C_LAMBDA_R_HSS * raizE_Fy;
const ESB_NCH = 1.5 * Math.PI * raizE_Fy; // 8.6.3 y 8.8.4
const ESB_AISC = 4.71 * raizE_Fy; // quiebre de E3(a)/E3(b)

// Cajón soldado por cuatro planchas: envolvente exterior B×B, espesor t. Es lo
// que hace `SetTube` en SAP2000. La luz libre es B − 2t, por §B4.1b(e) de AISC
// 360-22 —NO el B − 3t del item (d), que está escrito solo para HSS—.
function cajon(B, t) {
  const b = B - 2 * t;
  const A = 2 * (B * t) + 2 * (b * t);
  const I = 2 * ((B * t ** 3) / 12 + B * t * ((B - t) / 2) ** 2) + 2 * ((t * b ** 3) / 12);
  return { B, t, b, A, I, r: Math.sqrt(I / A), lambda: b / t };
}

// φ_c P_n por las Ecs. E3-1, E3-2, E3-3 y E3-4 (elementos no esbeltos).
function compresion(sec, Lc) {
  const esb = Lc / sec.r;
  const Fe = (Math.PI ** 2 * E) / esb ** 2;
  const Fn = esb <= ESB_AISC ? 0.658 ** (FY / Fe) * FY : 0.877 * Fe;
  return { esb, Fe, Fn, phiPn: (PHI_C * Fn * sec.A) / 1000 };
}

const BARRAS = [
  {
    id: '100×100×4',
    rot: 'Diagonal de muro',
    sec: cajon(100, 4),
    Lc: L_MURO,
    Pu: PU_DIAG_MURO,
    clausula: '8.6.3',
    adoptada: false,
  },
  {
    id: '100×100×5',
    rot: 'Diagonal de muro',
    sec: cajon(100, 5),
    Lc: L_MURO,
    Pu: PU_DIAG_MURO,
    clausula: '8.6.3',
    adoptada: true,
  },
  {
    id: '75×75×4',
    rot: 'Diagonal de techo',
    sec: cajon(75, 4),
    Lc: L_TECHO,
    Pu: PU_DIAG_TECHO,
    clausula: '8.8.4',
    adoptada: false,
  },
  {
    id: '125×125×6',
    rot: 'Puntal de techo',
    sec: cajon(125, 6),
    Lc: L_PUNTAL,
    Pu: PU_PUNTAL,
    clausula: '8.8.4',
    adoptada: false,
  },
].map((b) => {
  const c = compresion(b.sec, b.Lc);
  return { ...b, ...c, usoLocal: b.sec.lambda / LAMBDA_MD, usoGlobal: c.esb / ESB_NCH };
});

// Espectro de referencia, Ec. (3) de §5.4.2, CORREGIDO por amortiguamiento. El
// §5.4.2 dice que los de referencia incorporan ξ = 0,05 y que «para razones
// menores se debe ponderar por (0,05/ξ)^0,4»; con las uniones soldadas de la
// Tabla 7, ξ = 0,02 y el factor vale 1,4427. Los valores que tabula §5.36 ya lo
// llevan puesto — sin él la figura dibujaría 0,9687 donde la memoria dice
// 1,3976, y el post citaría dos números distintos para lo mismo.
const XI = 0.02;
const F_XI = (0.05 / XI) ** 0.4;
const saH = (T) =>
  ((AR * SP.S * (1 + SP.r * (T / SP.T0) ** SP.p)) / (1 + (T / SP.T0) ** SP.q)) * F_XI;

// ------------------------------------------------------ el contraste que manda

// Contraste contra una SEGUNDA implementación, escrita aparte en Python y
// corrida el 2026-08-12 — es el contraste que cazó el F7-2/F7-6 de la serie
// anterior: una aritmética que cierra consigo misma no prueba nada. Los valores
// van a precisión completa, tal como los imprimió esa implementación; §5.45 los
// registra redondeados y NO sirve como fuente de este contraste.
const ESPERADO = [
  ['λ_md', LAMBDA_MD, 18.853279657559685],
  ['λ_r cajón (caso 8)', LAMBDA_R_CAJON, 42.143564158718235],
  ['λ_r HSS (caso 6)', LAMBDA_R_HSS, 39.59797974644666],
  ['1,5π√(E/Fy)', ESB_NCH, 133.286488144751],
  ['L_c diagonal de techo', L_TECHO, 3622.7565218356935],
  ['h/t muro 4 mm', BARRAS[0].sec.lambda, 23],
  ['h/t puntal', BARRAS[3].sec.lambda, 113 / 6],
  ['r muro 4 mm', BARRAS[0].sec.r, 39.22584182228174],
  ['r puntal', BARRAS[3].sec.r, 48.64325921098078],
  ['L_c/r muro 4 mm', BARRAS[0].esb, 127.46699032370579],
  ['φcPn muro 4 mm', BARRAS[0].phiPn, 146.055113279516],
  ['φcPn muro 5 mm', BARRAS[1].phiPn, 177.5647194584169],
  ['φcPn techo', BARRAS[2].phiPn, 111.96166237078275],
  ['φcPn puntal', BARRAS[3].phiPn, 286.8623382412771],
  // El espectro se contrasta contra §5.36, que lo tabula ya ponderado por f_ξ y
  // REDONDEADO a siete dígitos: la tolerancia va aflojada a esa precisión, no a
  // la de la máquina. Es el único par de la lista que no viene de la
  // implementación de contraste.
  ['S_aH en T*_X', saH(T_STAR_X), 0.6306425, 1e-7],
  ['S_aH en T*_Y', saH(T_STAR_Y), 1.3975929, 1e-7],
  ['0,5R₁ longitudinal', AMPLIF, 1.9150816863022848],
];

for (const [rot, calc, medido, tol = 1e-9] of ESPERADO) {
  const dif = Math.abs(calc - medido) / Math.abs(medido);
  if (dif > tol) {
    throw new Error(
      `${rot}: acá da ${calc} y el contraste da ${medido} (${(100 * dif).toExponential(3)} %, tolerancia ${tol})`,
    );
  }
}

// ---------------------------------------------------------------- utilidades

const COMA = (x, dec = 2) => x.toFixed(dec).replace('.', ',');

const TINTA = '#333';
const SUAVE = '#6b7280';
const BORDE = '#d1d5db';
const AZUL = '#1a63a8';
const ROJO = '#b02a1a';
const VERDE = '#1f7a4d';
const AMBAR = '#b45309';
const GRIS = '#9ca3af';

const escala = (d0, d1, p0, p1) => (v) => p0 + ((v - d0) / (d1 - d0)) * (p1 - p0);

function caja({ x, y, w, h, fill, stroke, rx = 6, sw = 1.6, dash = null }) {
  const d = dash ? ` stroke-dasharray="${dash}"` : '';
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${d}/>`;
}

function texto(x, y, s, { size = 12, fill = TINTA, anchor = 'start', bold = false } = {}) {
  const peso = bold ? ' font-weight="bold"' : '';
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" text-anchor="${anchor}"${peso}>${s}</text>`;
}

function flecha(x1, y1, x2, y2, color = SUAVE) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.6" marker-end="url(#punta)"/>`;
}

const DEFS = `<defs>
    <marker id="punta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="${SUAVE}"/>
    </marker>
  </defs>`;

// --------------------------- figura 1: las tres fronteras y las cuatro barras

function figuraLimites() {
  const W = 1000;
  const H = 640;
  const M = { l: 92, r: 250, t: 76, b: 68 };
  const px = escala(115, 140, M.l, W - M.r);
  const py = escala(0, 48, H - M.b, M.t);

  const p = [];
  p.push(texto(M.l, 32, 'Las tres fronteras sobre el mismo cajón soldado', { size: 17, bold: true }));
  p.push(
    texto(M.l, 54, 'A36 de plancha · F_y = 250 MPa · R_y = 1,30 · el eje vertical es la razón h/t de la pared', {
      size: 12.5,
      fill: SUAVE,
    }),
  );

  // región segura: bajo λ_md y a la izquierda de la esbeltez global
  p.push(
    `<rect x="${M.l}" y="${py(LAMBDA_MD)}" width="${px(ESB_NCH) - M.l}" height="${H - M.b - py(LAMBDA_MD)}" fill="#1f7a4d" opacity="0.07"/>`,
  );

  // ejes
  p.push(
    `<line x1="${M.l}" y1="${H - M.b}" x2="${W - M.r}" y2="${H - M.b}" stroke="${TINTA}" stroke-width="1.4"/>`,
  );
  p.push(`<line x1="${M.l}" y1="${M.t}" x2="${M.l}" y2="${H - M.b}" stroke="${TINTA}" stroke-width="1.4"/>`);

  for (let v = 115; v <= 140; v += 5) {
    p.push(
      `<line x1="${px(v)}" y1="${H - M.b}" x2="${px(v)}" y2="${H - M.b + 5}" stroke="${SUAVE}" stroke-width="1"/>`,
    );
    p.push(texto(px(v), H - M.b + 20, String(v), { size: 11.5, fill: SUAVE, anchor: 'middle' }));
  }
  for (let v = 0; v <= 45; v += 10) {
    p.push(`<line x1="${M.l - 5}" y1="${py(v)}" x2="${M.l}" y2="${py(v)}" stroke="${SUAVE}" stroke-width="1"/>`);
    p.push(texto(M.l - 10, py(v) + 4, String(v), { size: 11.5, fill: SUAVE, anchor: 'end' }));
  }
  p.push(
    texto((M.l + W - M.r) / 2, H - 20, 'esbeltez global  L_c / r', {
      size: 13,
      fill: TINTA,
      anchor: 'middle',
    }),
  );
  p.push(
    `<text x="26" y="${(M.t + H - M.b) / 2}" font-size="13" fill="${TINTA}" text-anchor="middle" transform="rotate(-90 26 ${(M.t + H - M.b) / 2})">pandeo local  h / t</text>`,
  );

  // frontera vertical: 1,5π√(E/Fy)
  p.push(
    `<line x1="${px(ESB_NCH)}" y1="${M.t}" x2="${px(ESB_NCH)}" y2="${H - M.b}" stroke="${ROJO}" stroke-width="2"/>`,
  );
  p.push(
    texto(px(ESB_NCH) + 8, M.t + 16, `1,5π√(E/F_y) = ${COMA(ESB_NCH)}`, { size: 12, fill: ROJO, bold: true }),
  );
  p.push(texto(px(ESB_NCH) + 8, M.t + 32, 'NCh2369  8.6.3 y 8.8.4', { size: 11.5, fill: ROJO }));

  // frontera horizontal de AISC (caso 8) y la del caso 6, punteada
  p.push(
    `<line x1="${M.l}" y1="${py(LAMBDA_R_CAJON)}" x2="${W - M.r}" y2="${py(LAMBDA_R_CAJON)}" stroke="${AZUL}" stroke-width="2"/>`,
  );
  p.push(
    texto(W - M.r + 10, py(LAMBDA_R_CAJON) - 6, `λ_r = 1,49√(E/F_y) = ${COMA(LAMBDA_R_CAJON)}`, {
      size: 12,
      fill: AZUL,
      bold: true,
    }),
  );
  p.push(
    texto(W - M.r + 10, py(LAMBDA_R_CAJON) + 10, 'AISC B4.1a caso 8 — cajón soldado', {
      size: 11.5,
      fill: AZUL,
    }),
  );
  p.push(
    `<line x1="${M.l}" y1="${py(LAMBDA_R_HSS)}" x2="${W - M.r}" y2="${py(LAMBDA_R_HSS)}" stroke="${AZUL}" stroke-width="1.4" stroke-dasharray="5 4" opacity="0.75"/>`,
  );
  p.push(
    texto(W - M.r + 10, py(LAMBDA_R_HSS) + 16, `caso 6 (HSS) = ${COMA(LAMBDA_R_HSS)}`, {
      size: 11,
      fill: AZUL,
      anchor: 'start',
    }),
  );

  // frontera de NCh2369
  p.push(
    `<line x1="${M.l}" y1="${py(LAMBDA_MD)}" x2="${W - M.r}" y2="${py(LAMBDA_MD)}" stroke="${VERDE}" stroke-width="2.4"/>`,
  );
  p.push(
    texto(W - M.r + 10, py(LAMBDA_MD) - 6, `λ_md = 0,76√(E/R_yF_y) = ${COMA(LAMBDA_MD)}`, {
      size: 12,
      fill: VERDE,
      bold: true,
    }),
  );
  p.push(
    texto(W - M.r + 10, py(LAMBDA_MD) + 10, 'NCh2369 Tabla 9 — el que decide', { size: 11.5, fill: VERDE }),
  );

  // la llave del factor 2,24, metida en el hueco de la izquierda del gráfico
  const xLl = M.l + 46;
  p.push(
    `<path d="M ${xLl} ${py(LAMBDA_R_CAJON)} L ${xLl - 14} ${py(LAMBDA_R_CAJON)} L ${xLl - 14} ${py(LAMBDA_MD)} L ${xLl} ${py(LAMBDA_MD)}" fill="none" stroke="${AMBAR}" stroke-width="1.6"/>`,
  );
  p.push(
    texto(xLl + 8, (py(LAMBDA_R_CAJON) + py(LAMBDA_MD)) / 2 - 2, `×${COMA(LAMBDA_R_CAJON / LAMBDA_MD)}`, {
      size: 13,
      fill: AMBAR,
      bold: true,
    }),
  );
  p.push(
    texto(xLl + 8, (py(LAMBDA_R_CAJON) + py(LAMBDA_MD)) / 2 + 15, 'más estricto', {
      size: 11.5,
      fill: AMBAR,
    }),
  );

  // Los cuatro puntos van numerados y la lectura se hace en la leyenda: en este
  // plano las cuatro barras caen en un racimo de ~50 px y cualquier rótulo
  // pegado al punto se pisa con el vecino.
  BARRAS.forEach((b, i) => {
    const cumple = b.sec.lambda <= LAMBDA_MD;
    const color = cumple ? VERDE : ROJO;
    const cx = px(b.esb);
    const cy = py(b.sec.lambda);
    p.push(
      `<circle cx="${cx}" cy="${cy}" r="${b.adoptada ? 8.5 : 6.5}" fill="${color}" stroke="#fff" stroke-width="2"/>`,
    );
    if (b.adoptada) {
      p.push(`<circle cx="${cx}" cy="${cy}" r="12.5" fill="none" stroke="${color}" stroke-width="1.6"/>`);
    }
    p.push(
      texto(cx, cy - 14, String(i + 1), { size: 12.5, fill: color, anchor: 'middle', bold: true }),
    );
  });

  // leyenda, sobre el hueco de abajo a la derecha
  const LX = 330;
  const LY = 420;
  const LW = 580;
  p.push(caja({ x: LX, y: LY, w: LW, h: 134, fill: '#fff', stroke: BORDE, rx: 8, sw: 1.2 }));
  const COLS = [LX + 40, LX + 380, LX + 460, LX + 556];
  p.push(texto(COLS[0], LY + 22, 'barra', { size: 11, fill: SUAVE, bold: true }));
  p.push(texto(COLS[1], LY + 22, 'h/t', { size: 11, fill: SUAVE, bold: true, anchor: 'end' }));
  p.push(texto(COLS[2], LY + 22, 'L_c/r', { size: 11, fill: SUAVE, bold: true, anchor: 'end' }));
  p.push(texto(COLS[3], LY + 22, 'uso λ_md', { size: 11, fill: SUAVE, bold: true, anchor: 'end' }));
  BARRAS.forEach((b, i) => {
    const y = LY + 44 + i * 23;
    const cumple = b.sec.lambda <= LAMBDA_MD;
    const color = cumple ? VERDE : ROJO;
    p.push(`<circle cx="${LX + 22}" cy="${y - 4}" r="6" fill="${color}"/>`);
    p.push(texto(LX + 22, y, String(i + 1), { size: 10, fill: '#fff', anchor: 'middle', bold: true }));
    p.push(
      texto(COLS[0], y, `${b.rot} ${b.id}${b.adoptada ? ' — adoptada' : ''}`, {
        size: 11.5,
        bold: b.adoptada,
      }),
    );
    p.push(texto(COLS[1], y, COMA(b.sec.lambda), { size: 11.5, anchor: 'end' }));
    p.push(texto(COLS[2], y, COMA(b.esb), { size: 11.5, anchor: 'end' }));
    p.push(
      texto(COLS[3], y, `${COMA(b.usoLocal, 3)} ${cumple ? '✓' : '✗'}`, {
        size: 11.5,
        anchor: 'end',
        fill: color,
        bold: true,
      }),
    );
  });

  p.push(
    texto(M.l + 10, H - M.b - 12, 'región que cumple las tres', { size: 11.5, fill: VERDE, bold: true }),
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="ui-sans-serif, system-ui, sans-serif">
  ${DEFS}
  <rect width="${W}" height="${H}" fill="#fff"/>
  ${p.join('\n  ')}
</svg>
`;
}

// ------------------- figura 2: los dos T* sobre el espectro, y el corte basal

function figuraEspectro() {
  const W = 1000;
  const H = 620;
  const M = { l: 82, r: 40, t: 74, b: 250 };
  const T_MAX = 1.5;
  const S_MAX = 2.0;
  const px = escala(0, T_MAX, M.l, W - M.r);
  const py = escala(0, S_MAX, H - M.b, M.t);

  const p = [];
  p.push(
    texto(M.l, 32, 'La dirección rígida cae cerca del pico, y por eso paga más', { size: 17, bold: true }),
  );
  p.push(
    texto(
      M.l,
      54,
      'Espectro de referencia S_aH — Ec. (3) de §5.4.2, ponderado por (0,05/ξ)^0,4 = 1,4427 · zona 2, suelo B, A_r = 0,42 g',
      { size: 12.5, fill: SUAVE },
    ),
  );

  // ejes
  p.push(
    `<line x1="${M.l}" y1="${H - M.b}" x2="${W - M.r}" y2="${H - M.b}" stroke="${TINTA}" stroke-width="1.4"/>`,
  );
  p.push(`<line x1="${M.l}" y1="${M.t}" x2="${M.l}" y2="${H - M.b}" stroke="${TINTA}" stroke-width="1.4"/>`);
  for (let v = 0; v <= T_MAX + 1e-9; v += 0.25) {
    p.push(
      `<line x1="${px(v)}" y1="${H - M.b}" x2="${px(v)}" y2="${H - M.b + 5}" stroke="${SUAVE}" stroke-width="1"/>`,
    );
    p.push(texto(px(v), H - M.b + 20, COMA(v), { size: 11.5, fill: SUAVE, anchor: 'middle' }));
  }
  for (let v = 0; v <= S_MAX + 1e-9; v += 0.5) {
    p.push(`<line x1="${M.l - 5}" y1="${py(v)}" x2="${M.l}" y2="${py(v)}" stroke="${SUAVE}" stroke-width="1"/>`);
    p.push(texto(M.l - 10, py(v) + 4, COMA(v, 1), { size: 11.5, fill: SUAVE, anchor: 'end' }));
  }
  p.push(texto(W - M.r, H - M.b + 38, 'período  T  [s]', { size: 13, anchor: 'end' }));
  p.push(texto(M.l - 10, M.t - 12, 'S_aH', { size: 13, anchor: 'end' }));

  // la curva
  const pts = [];
  for (let i = 0; i <= 400; i += 1) {
    const T = (i / 400) * T_MAX;
    pts.push(`${px(T)},${py(saH(T))}`);
  }
  p.push(`<polyline points="${pts.join(' ')}" fill="none" stroke="${TINTA}" stroke-width="2.2"/>`);

  // el pico, para que se vea que el T*_Y NO está sobre una meseta sino en la
  // rama que sube: es lo que decide en qué sentido se mueve el S_aH si la
  // dirección se rigidiza
  let pT = 0;
  let pS = 0;
  for (let i = 1; i <= 6000; i += 1) {
    const T = (i / 6000) * 2;
    if (saH(T) > pS) {
      pS = saH(T);
      pT = T;
    }
  }
  p.push(
    `<line x1="${px(pT)}" y1="${py(pS)}" x2="${px(pT)}" y2="${H - M.b}" stroke="${GRIS}" stroke-width="1.1" stroke-dasharray="3 4"/>`,
  );
  p.push(`<circle cx="${px(pT)}" cy="${py(pS)}" r="4" fill="${GRIS}"/>`);
  p.push(
    texto(px(pT) + 16, py(pS) + 24, `pico: ${COMA(pT, 4)} s · ${COMA(pS, 4)}`, { size: 11.5, fill: SUAVE }),
  );

  // los dos T*
  // El T*_Y cae en la subida de la curva, así que su rótulo va a la izquierda y
  // arriba para no cruzarla; el T*_X está en la rama que baja y va a la derecha.
  const MARCAS = [
    { T: T_STAR_Y, rot: 'longitudinal', sub: 'arriostrada', color: ROJO, dx: 18, dy: -74, anchor: 'start', guia: true },
    { T: T_STAR_X, rot: 'transversal', sub: 'marcos de momento', color: AZUL, dx: 14, dy: -18, anchor: 'start' },
  ];
  for (const m of MARCAS) {
    const s = saH(m.T);
    p.push(
      `<line x1="${px(m.T)}" y1="${py(s)}" x2="${px(m.T)}" y2="${H - M.b}" stroke="${m.color}" stroke-width="1.4" stroke-dasharray="4 4"/>`,
    );
    if (m.guia) {
      p.push(
        `<line x1="${px(m.T) + 6}" y1="${py(s) - 6}" x2="${px(m.T) + m.dx - 4}" y2="${py(s) + m.dy + 4}" stroke="${m.color}" stroke-width="1.1"/>`,
      );
    }
    p.push(`<circle cx="${px(m.T)}" cy="${py(s)}" r="7" fill="${m.color}" stroke="#fff" stroke-width="2"/>`);
    p.push(
      texto(px(m.T) + m.dx, py(s) + m.dy, `T* ${m.rot} = ${COMA(m.T, 4)} s`, {
        size: 12.5,
        fill: m.color,
        bold: true,
        anchor: m.anchor,
      }),
    );
    p.push(
      texto(px(m.T) + m.dx, py(s) + m.dy + 16, `S_aH = ${COMA(s, 4)}  ·  ${m.sub}`, {
        size: 11.5,
        fill: SUAVE,
        anchor: m.anchor,
      }),
    );
  }

  // barras de corte basal
  const yB = H - M.b + 78;
  const hB = 34;
  const xB = M.l + 190;
  const wMax = 420;
  const qMax = Math.max(Q0_X, Q0_Y);
  p.push(texto(M.l, yB - 22, 'Corte basal que resulta de cada uno', { size: 14, bold: true }));
  const BARRAS_Q = [
    { rot: 'Longitudinal', Q0: Q0_Y, color: ROJO },
    { rot: 'Transversal', Q0: Q0_X, color: AZUL },
  ];
  BARRAS_Q.forEach((b, i) => {
    const y = yB + i * (hB + 18);
    const w = (b.Q0 / qMax) * wMax;
    p.push(texto(M.l, y + hB / 2 + 5, b.rot, { size: 12.5, bold: true }));
    p.push(caja({ x: xB, y, w, h: hB, fill: b.color, stroke: b.color, rx: 3, sw: 1 }));
    p.push(
      texto(xB + w + 12, y + hB / 2 + 5, `${COMA(b.Q0, 2)} kN`, { size: 12.5, bold: true, fill: b.color }),
    );
  });
  p.push(
    texto(
      xB,
      yB + 2 * (hB + 18) + 16,
      `La dirección arriostrada se lleva un ${COMA(100 * (Q0_Y / Q0_X - 1), 1)} % más de corte que la de marcos.`,
      { size: 12.5, fill: TINTA },
    ),
  );
  p.push(
    texto(
      xB,
      yB + 2 * (hB + 18) + 34,
      `Y la diagonal lo nota: ${COMA(PU_DIAG_MURO, 3)} kN de compresión sísmica contra ${COMA(PU_MURO_GRAVEDAD_VIENTO, 3)} kN de gravedad y viento (+${COMA(100 * (PU_DIAG_MURO / PU_MURO_GRAVEDAD_VIENTO - 1), 1)} %).`,
      { size: 12.5, fill: AMBAR, bold: true },
    ),
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="ui-sans-serif, system-ui, sans-serif">
  ${DEFS}
  <rect width="${W}" height="${H}" fill="#fff"/>
  ${p.join('\n  ')}
</svg>
`;
}

// ----------------- figura 3: el árbol de la cláusula 8 y sus puertas de salida

function figuraPuertas() {
  const W = 1000;
  const H = 640;
  const p = [];

  p.push(texto(40, 34, 'De qué cláusula cuelga cada barra, y qué salidas le deja', { size: 17, bold: true }));
  p.push(
    texto(40, 56, 'NCh2369:2025, cláusula 8 — el mismo λ_md = ' + COMA(LAMBDA_MD) + ' en las tres ramas', {
      size: 12.5,
      fill: SUAVE,
    }),
  );

  // raíz
  p.push(caja({ x: 350, y: 82, w: 300, h: 48, fill: '#f3f4f6', stroke: BORDE }));
  p.push(texto(500, 112, '¿La barra trabaja en compresión?', { size: 13.5, bold: true, anchor: 'middle' }));

  p.push(flecha(430, 130, 220, 176));
  p.push(flecha(570, 130, 700, 176));
  p.push(texto(300, 152, 'no', { size: 12.5, fill: SUAVE, bold: true }));
  p.push(texto(650, 152, 'sí', { size: 12.5, fill: SUAVE, bold: true }));

  // rama solo-tracción
  p.push(caja({ x: 40, y: 178, w: 360, h: 116, fill: '#f0fdf4', stroke: VERDE }));
  p.push(texto(60, 202, 'Solo-tracción  —  8.6.1', { size: 13.5, bold: true, fill: VERDE }));
  p.push(texto(60, 224, 'Prohibido en general…', { size: 12, fill: TINTA }));
  p.push(
    texto(60, 244, '…excepto en galpones livianos regidos por 12.2.', { size: 12, fill: TINTA, bold: true }),
  );
  p.push(
    texto(60, 268, 'El λ_md NO APLICA: la 8.6.3 habla solo de las', { size: 12, fill: VERDE }),
  );
  p.push(texto(60, 284, 'diagonales «que trabajen en compresión».', { size: 12, fill: VERDE }));

  // rama compresión → dos cláusulas
  p.push(caja({ x: 620, y: 178, w: 340, h: 44, fill: '#f3f4f6', stroke: BORDE }));
  p.push(texto(790, 206, '¿En qué plano está el elemento?', { size: 13, bold: true, anchor: 'middle' }));

  p.push(flecha(700, 222, 560, 268));
  p.push(flecha(880, 222, 880, 268));

  // 8.6.3
  p.push(caja({ x: 430, y: 270, w: 300, h: 150, fill: '#fef2f2', stroke: ROJO }));
  p.push(texto(450, 294, 'Plano vertical  →  8.6.3', { size: 13.5, bold: true, fill: ROJO }));
  p.push(texto(450, 316, 'λ_md  y  esbeltez global', { size: 12, fill: TINTA }));
  p.push(texto(450, 340, 'UNA puerta de salida:', { size: 12, bold: true, fill: TINTA }));
  p.push(texto(450, 360, '· sismo amplificado por 0,7R₁ ≥ 1,0', { size: 12, fill: TINTA }));
  p.push(texto(450, 386, 'En galpón liviano, 12.2.2 lo baja', { size: 12, fill: AMBAR }));
  p.push(texto(450, 404, 'a 0,5R₁.', { size: 12, fill: AMBAR, bold: true }));

  // 8.8.4
  p.push(caja({ x: 760, y: 270, w: 200, h: 150, fill: '#eff6ff', stroke: AZUL }));
  p.push(texto(778, 294, 'Piso o cubierta', { size: 13.5, bold: true, fill: AZUL }));
  p.push(texto(778, 312, '→  8.8.4', { size: 13.5, bold: true, fill: AZUL }));
  p.push(texto(778, 336, 'los mismos dos', { size: 12, fill: TINTA }));
  p.push(texto(778, 358, 'DOS puertas:', { size: 12, bold: true, fill: TINTA }));
  p.push(texto(778, 376, '· el 0,7R₁', { size: 12, fill: TINTA }));
  p.push(texto(778, 394, '· o la máxima carga', { size: 12, fill: AZUL, bold: true }));
  p.push(texto(778, 410, '  transferible', { size: 12, fill: AZUL, bold: true }));

  // hojas: qué barra cae en cada una y con qué resultado
  const HOJAS = [
    {
      x: 430,
      w: 300,
      barra: BARRAS[0],
      pie: `Excede el λ_md un ${COMA(100 * (BARRAS[0].usoLocal - 1), 1)} %, pero la exención ABRE: la demanda amplificada es a lo más ${COMA(AMPLIF * PU_DIAG_MURO, 1)} kN contra φ_cP_n = ${COMA(BARRAS[0].phiPn, 1)} kN.`,
      color: ROJO,
    },
    {
      x: 760,
      w: 200,
      barra: BARRAS[2],
      pie: `Cumplen directo: ${COMA(BARRAS[2].sec.lambda)} y ${COMA(BARRAS[3].sec.lambda)} contra ${COMA(LAMBDA_MD)}. El puntal, al ${COMA(100 * BARRAS[3].usoLocal, 2)} % del límite.`,
      color: AZUL,
    },
  ];
  for (const h of HOJAS) {
    p.push(flecha(h.x + h.w / 2, 420, h.x + h.w / 2, 452));
    p.push(caja({ x: h.x, y: 454, w: h.w, h: 118, fill: '#fff', stroke: h.color, dash: '5 4', sw: 1.4 }));
  }
  p.push(texto(450, 478, 'Diagonal de muro  100×100×4', { size: 12.5, bold: true, fill: ROJO }));
  const l1 = [
    `h/t = ${COMA(BARRAS[0].sec.lambda)}  >  λ_md = ${COMA(LAMBDA_MD)}   ✗`,
    `L_c/r = ${COMA(BARRAS[0].esb)}  ≤  ${COMA(ESB_NCH)}   ✓`,
    `φ_cP_n = ${COMA(BARRAS[0].phiPn, 1)} kN  ·  uso ${COMA(BARRAS[0].Pu / BARRAS[0].phiPn, 3)}`,
    `Con 0,5R₁ = ${COMA(AMPLIF, 4)}:  uso ≤ ${COMA((AMPLIF * BARRAS[0].Pu) / BARRAS[0].phiPn, 2)}   ✓ ABRE`,
  ];
  l1.forEach((s, i) => p.push(texto(450, 500 + i * 18, s, { size: 11.5, fill: i === 3 ? VERDE : TINTA })));

  p.push(texto(778, 478, 'Techo  75×75×4', { size: 12.5, bold: true, fill: AZUL }));
  const l2 = [
    `h/t = ${COMA(BARRAS[2].sec.lambda)}  ✓  uso ${COMA(BARRAS[2].usoLocal, 3)}`,
    'Puntal  125×125×6',
    `h/t = ${COMA(BARRAS[3].sec.lambda)}  ✓  uso ${COMA(BARRAS[3].usoLocal, 4)}`,
    'una parte en mil de margen',
  ];
  l2.forEach((s, i) =>
    p.push(
      texto(778, 500 + i * 18, s, {
        size: 11.5,
        fill: i === 3 ? AMBAR : TINTA,
        bold: i === 1 || i === 3,
      }),
    ),
  );

  p.push(
    texto(40, 316, 'No es la ruta de este proyecto —la X toma', { size: 11.5, fill: SUAVE }),
  );
  p.push(texto(40, 332, 'compresión y su rigidez la usa la deriva—', { size: 11.5, fill: SUAVE }));
  p.push(texto(40, 348, 'pero es legal, y solo acá.', { size: 11.5, fill: SUAVE }));

  p.push(
    texto(40, 600, 'La coletilla «o con la máxima carga que el sistema puede transferir al elemento» está en 8.8.4 y NO está en 8.6.3.', {
      size: 12.5,
      fill: AMBAR,
      bold: true,
    }),
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="ui-sans-serif, system-ui, sans-serif">
  ${DEFS}
  <rect width="${W}" height="${H}" fill="#fff"/>
  ${p.join('\n  ')}
</svg>
`;
}

// ------------------------------------------------------------------- emisión

await mkdir(OUT_DIR, { recursive: true });
const figuras = [
  ['diagonal-limites.svg', figuraLimites()],
  ['diagonal-espectro.svg', figuraEspectro()],
  ['diagonal-puertas.svg', figuraPuertas()],
];
for (const [nombre, svg] of figuras) {
  await writeFile(path.join(OUT_DIR, nombre), svg, 'utf8');
  console.log(`  ${path.relative(ROOT, path.join(OUT_DIR, nombre))}`);
}

console.log('');
console.log(`λ_md ${LAMBDA_MD}  ·  λ_r caso 8 ${LAMBDA_R_CAJON}  ·  caso 6 ${LAMBDA_R_HSS}`);
console.log(`λ_r/λ_md = ${LAMBDA_R_CAJON / LAMBDA_MD}`);
console.log(`1,5π√(E/Fy) = ${ESB_NCH}  ·  4,71√(E/Fy) = ${ESB_AISC}`);
console.log(`  difieren ${(100 * (ESB_NCH / ESB_AISC - 1)).toFixed(4)} %`);
console.log(`L_c: muro ${L_MURO}  techo ${L_TECHO}  puntal ${L_PUNTAL} mm`);
for (const b of BARRAS) {
  console.log(
    `${b.rot} ${b.id} (${b.clausula}): h/t ${b.sec.lambda} uso ${b.usoLocal} · L_c/r ${b.esb} uso ${b.usoGlobal} · φcPn ${b.phiPn} kN uso ${b.Pu / b.phiPn}`,
  );
}
console.log(`Q0Y/Q0X = ${Q0_Y / Q0_X}`);
console.log(`sismo/gravedad+viento en la diagonal = ${PU_DIAG_MURO / PU_MURO_GRAVEDAD_VIENTO}`);
