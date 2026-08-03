#!/usr/bin/env node
// Dibuja las figuras del espectro de NCh2369:2025 para la nota de /apuntes/nch2369.
//
//   npm run figuras:espectro
//
// Los SVG salen CALCULADOS, no dibujados a mano: las curvas vienen de
// `src/lib/sap-scripts/nch2369-spectrum.ts`, el mismo módulo que ya alimenta la
// vista previa del SAP Script Builder. Así el post y la herramienta no pueden
// divergir, y si alguien corrige un parámetro de la Tabla 6 las figuras se
// rehacen solas.
//
// Emite a public/apuntes/nch2369/:
//   espectro-suelos.svg        los 5 espectros de referencia (Ec. 3), zona 3
//   espectro-correcciones.svg  las tres correcciones de la Ec. (1a) + la rampa R*
//
// Verificado contra el PDF de la 3.ª edición (2025.05.28): Tabla 3 (p. 57),
// Tabla 6 (p. 60), Ecs. (1a), (1b) y (3) (pp. 28-29).
//
// El SVG no hereda las variables CSS del sitio (se sirve como <img>), así que
// los colores van literales, en la misma paleta que el resto de las figuras.
// Coma decimal en todos los rótulos, como el resto de los esquemas.

import { build } from 'esbuild';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT_DIR = path.join(ROOT, 'public/apuntes/nch2369');

/** Compila el módulo del espectro (TypeScript) a algo importable por Node. */
async function loadSpectrum() {
  const out = path.join(tmpdir(), `nch2369-spectrum-${process.pid}.mjs`);
  await build({
    entryPoints: [path.join(ROOT, 'src/lib/sap-scripts/nch2369-spectrum.ts')],
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

const { computeSpectrum, SOIL_PARAMS, AR_BY_ZONE } = await loadSpectrum();

// ---------------------------------------------------------------- utilidades

const COMA = (x, dec = 2) => x.toFixed(dec).replace('.', ',');

const TINTA = '#333';
const SUAVE = '#6b7280';
const BORDE = '#d1d5db';

/**
 * Espectro de REFERENCIA horizontal, Ec. (3): sin I, sin R*, sin corrección de
 * amortiguamiento. Se obtiene pidiendo I = 1, R = 1 y `applyRStar = false` —
 * hay que desactivarlo explícitamente, porque el módulo no implementa la rama
 * "R = 1 → R* = 1" de la Ec. (1b).
 */
const referencia = (zona, suelo) => computeSpectrum(zona, suelo, 1, 1, 0.05, 1.0, 1.0, false);

/** Espectro de DISEÑO horizontal, Ec. (1a), con R*(T) modo a modo. */
const diseno = (zona, suelo, I, R, xi) => computeSpectrum(zona, suelo, I, R, xi, 1.0, 1.0, true);

/** Recorta un espectro a T ≤ tMax y devuelve los pares [T, Sa]. */
function hasta(spec, tMax) {
  const pts = [];
  for (let i = 0; i < spec.periods.length; i++) {
    if (spec.periods[i] > tMax) break;
    pts.push([spec.periods[i], spec.accels[i]]);
  }
  return pts;
}

/** Escala lineal de un rango de datos a un rango de píxeles. */
function escala(d0, d1, p0, p1) {
  return (v) => p0 + ((v - d0) / (d1 - d0)) * (p1 - p0);
}

/** Convierte pares [x, y] en el atributo `points` de un <polyline>. */
function polilinea(pts, sx, sy) {
  return pts.map(([x, y]) => `${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(' ');
}

/**
 * Marco de ejes con grilla y rótulos. Devuelve las escalas y el SVG del marco.
 * `x`, `y`, `w`, `h` delimitan el área de dibujo (no incluye rótulos).
 */
function marco({ x, y, w, h, xMax, yMax, xTicks, yTicks, xLabel, yLabel, yDec = 2 }) {
  const sx = escala(0, xMax, x, x + w);
  const sy = escala(0, yMax, y + h, y);
  const partes = [];

  for (const t of xTicks) {
    const px = sx(t);
    partes.push(`<line x1="${px.toFixed(1)}" y1="${y}" x2="${px.toFixed(1)}" y2="${y + h}" stroke="${BORDE}" stroke-width="1"/>`);
    partes.push(`<text x="${px.toFixed(1)}" y="${y + h + 16}" font-size="11" fill="${SUAVE}" text-anchor="middle">${COMA(t, 1)}</text>`);
  }
  for (const t of yTicks) {
    const py = sy(t);
    partes.push(`<line x1="${x}" y1="${py.toFixed(1)}" x2="${x + w}" y2="${py.toFixed(1)}" stroke="${BORDE}" stroke-width="1"/>`);
    partes.push(`<text x="${x - 8}" y="${(py + 4).toFixed(1)}" font-size="11" fill="${SUAVE}" text-anchor="end">${COMA(t, yDec)}</text>`);
  }

  partes.push(`<line x1="${x}" y1="${y + h}" x2="${x + w}" y2="${y + h}" stroke="${TINTA}" stroke-width="1.5"/>`);
  partes.push(`<line x1="${x}" y1="${y}" x2="${x}" y2="${y + h}" stroke="${TINTA}" stroke-width="1.5"/>`);
  partes.push(`<text x="${x + w}" y="${y + h + 34}" font-size="12" fill="${TINTA}" text-anchor="end">${xLabel}</text>`);
  partes.push(`<text x="${x - 6}" y="${y - 10}" font-size="12" fill="${TINTA}" text-anchor="start">${yLabel}</text>`);

  return { sx, sy, svg: partes.join('\n  ') };
}

// -------------------------------------------------- figura 1: los cinco suelos

function figuraSuelos() {
  const ZONA = 3;
  const T_MAX = 3.0;
  const SUELOS = [
    { k: 'A', color: '#1c7c3c' },
    { k: 'B', color: '#2563eb' },
    { k: 'C', color: '#b02a1a' },
    { k: 'D', color: '#b35c0e' },
    { k: 'E', color: '#6d28d9' },
  ];

  const curvas = SUELOS.map((s) => ({ ...s, pts: hasta(referencia(ZONA, s.k), T_MAX) }));
  const yMax = 1.8;

  const { sx, sy, svg: ejes } = marco({
    x: 78, y: 62, w: 640, h: 340,
    xMax: T_MAX, yMax,
    xTicks: [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0],
    yTicks: [0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8],
    xLabel: 'T [s]', yLabel: 'S_aH [g]', yDec: 1,
  });

  const trazos = curvas
    .map((c) => `<polyline points="${polilinea(c.pts, sx, sy)}" fill="none" stroke="${c.color}" stroke-width="2.4"/>`)
    .join('\n  ');

  // Leyenda con el pico de cada suelo — es el dato que se lee de la figura.
  const leyenda = curvas
    .map((c, i) => {
      const pico = Math.max(...c.pts.map(([, v]) => v));
      const tPico = c.pts.find(([, v]) => v === pico)[0];
      const yy = 82 + i * 34;
      const sp = SOIL_PARAMS[c.k];
      return [
        `<line x1="740" y1="${yy - 4}" x2="768" y2="${yy - 4}" stroke="${c.color}" stroke-width="2.6"/>`,
        `<text x="776" y="${yy}" font-size="11.5" fill="${TINTA}">Suelo ${c.k} · S = ${COMA(sp.S)}</text>`,
        `<text x="776" y="${yy + 13}" font-size="10.5" fill="${SUAVE}">pico ${COMA(pico)} g en T = ${COMA(tPico)} s</text>`,
      ].join('\n  ');
    })
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 480" font-family="Segoe UI, Arial, sans-serif">
  <rect width="1000" height="480" fill="#ffffff"/>
  <text x="500" y="28" font-size="15" text-anchor="middle" fill="#222" font-weight="bold">El pico no crece con la blandura: la meseta corre y se ensancha</text>
  <text x="500" y="47" font-size="12" text-anchor="middle" fill="${SUAVE}">Espectros de referencia, Ec. (3) · zona sísmica 3 (A_r = ${COMA(AR_BY_ZONE[ZONA])} g) · ξ = 0,05 · sin I ni R*</text>
  ${ejes}
  ${trazos}
  ${leyenda.replace(/\n {2}/g, '\n  ')}
  <text x="740" y="${82 + 5 * 34 + 10}" font-size="11" fill="${TINTA}" font-weight="bold">El máximo está en el suelo C, no en el E.</text>
  <text x="740" y="${82 + 5 * 34 + 26}" font-size="10.5" fill="${SUAVE}">Sube de A a C (S llega a 1,05) y vuelve a</text>
  <text x="740" y="${82 + 5 * 34 + 40}" font-size="10.5" fill="${SUAVE}">bajar en D y E. Lo que sí crece de forma</text>
  <text x="740" y="${82 + 5 * 34 + 54}" font-size="10.5" fill="${SUAVE}">monótona es T_0: la meseta se corre a</text>
  <text x="740" y="${82 + 5 * 34 + 68}" font-size="10.5" fill="${SUAVE}">períodos largos y se ensancha, así que</text>
  <text x="740" y="${82 + 5 * 34 + 82}" font-size="10.5" fill="${SUAVE}">una estructura flexible sale peor parada</text>
  <text x="740" y="${82 + 5 * 34 + 96}" font-size="10.5" fill="${SUAVE}">en E que en C, y al revés si es rígida.</text>
  <text x="78" y="450" font-size="10.5" fill="${SUAVE}">Calculado con src/lib/sap-scripts/nch2369-spectrum.ts · parámetros de la Tabla 6 (NCh2369:2025, p. 60)</text>
</svg>
`;
}

// ------------------------------- figura 2: las tres correcciones y la rampa R*

function figuraCorrecciones() {
  const ZONA = 3;
  const SUELO = 'C';
  const R = 5;
  const XI = 0.02;
  const I = 1.0;
  const T_MAX = 2.0;

  const sp = SOIL_PARAMS[SUELO];
  const cr = 0.16 * R;
  const tRampa = cr * sp.T1; // C_r·T_1: hasta acá R* degrada

  const ref = hasta(referencia(ZONA, SUELO), T_MAX);
  const conR = ref.map(([t, v]) => [t, v / R]); // R constante, sin la rampa
  const conRStar = hasta(diseno(ZONA, SUELO, I, R, 0.05), T_MAX); // solo R*(T)
  const dis = hasta(diseno(ZONA, SUELO, I, R, XI), T_MAX); // + amortiguamiento
  const fXi = (0.05 / XI) ** 0.4;

  // --- panel izquierdo: las curvas
  // yMax por encima del pico de referencia (1,65 g en suelo C): si se recorta,
  // la curva gris se sale del marco y parece rota.
  const yMax = 1.8;
  const A = marco({
    x: 68, y: 88, w: 400, h: 300,
    xMax: T_MAX, yMax,
    xTicks: [0, 0.5, 1.0, 1.5, 2.0],
    yTicks: [0, 0.45, 0.9, 1.35, 1.8],
    xLabel: 'T [s]', yLabel: 'S_a [g]', yDec: 2,
  });

  const curvas = [
    { pts: ref, color: '#9ca3af', w: 2.2, dash: '8 5', rot: 'S_aH — referencia (ξ = 0,05)' },
    { pts: conR, color: '#93b4dd', w: 2.0, dash: '4 4', rot: `S_aH / R con R = ${R} fijo` },
    { pts: conRStar, color: '#1a63a8', w: 2.4, dash: '', rot: 'S_aH / R*(T)' },
    { pts: dis, color: '#b02a1a', w: 3, dash: '', rot: `× (0,05/ξ)^0,4 = ${COMA(fXi)} → diseño` },
  ];

  const trazosA = curvas
    .map((c) => `<polyline points="${polilinea(c.pts, A.sx, A.sy)}" fill="none" stroke="${c.color}" stroke-width="${c.w}"${c.dash ? ` stroke-dasharray="${c.dash}"` : ''}/>`)
    .join('\n  ');

  const leyendaA = curvas
    .map((c, i) => {
      const yy = 108 + i * 19;
      return [
        `<line x1="196" y1="${yy - 4}" x2="224" y2="${yy - 4}" stroke="${c.color}" stroke-width="${c.w}"${c.dash ? ` stroke-dasharray="${c.dash}"` : ''}/>`,
        `<text x="232" y="${yy}" font-size="11" fill="${TINTA}">${c.rot}</text>`,
      ].join('\n  ');
    })
    .join('\n  ');

  // Marca de la zona donde la rampa de R* separa las dos curvas azules.
  const xR = A.sx(tRampa);
  const bandaA = `<rect x="${A.sx(0).toFixed(1)}" y="88" width="${(xR - A.sx(0)).toFixed(1)}" height="300" fill="#1a63a8" fill-opacity="0.06"/>
  <line x1="${xR.toFixed(1)}" y1="88" x2="${xR.toFixed(1)}" y2="388" stroke="#1a63a8" stroke-width="1.2" stroke-dasharray="5 4"/>
  <text x="${(xR + 6).toFixed(1)}" y="380" font-size="10.5" fill="#1a63a8">C_r·T_1 = ${COMA(tRampa)} s</text>`;

  // --- panel derecho: R*(T)
  const rStarPts = [];
  for (let i = 0; i <= 200; i++) {
    const t = (i / 200) * T_MAX;
    rStarPts.push([t, t >= tRampa ? R : 1.5 + (R - 1.5) * (t / tRampa)]);
  }

  const B = marco({
    x: 610, y: 88, w: 320, h: 300,
    xMax: T_MAX, yMax: 6,
    xTicks: [0, 0.5, 1.0, 1.5, 2.0],
    yTicks: [0, 1.5, 3, 4.5, 6],
    xLabel: 'T [s]', yLabel: 'R*', yDec: 1,
  });

  const trazoB = `<polyline points="${polilinea(rStarPts, B.sx, B.sy)}" fill="none" stroke="#1a63a8" stroke-width="2.8"/>
  <line x1="${B.sx(0).toFixed(1)}" y1="${B.sy(R).toFixed(1)}" x2="${B.sx(T_MAX).toFixed(1)}" y2="${B.sy(R).toFixed(1)}" stroke="#9ca3af" stroke-width="1.4" stroke-dasharray="6 4"/>
  <text x="${B.sx(T_MAX).toFixed(1)}" y="${(B.sy(R) - 8).toFixed(1)}" font-size="11" fill="${SUAVE}" text-anchor="end">R = ${R} (Tabla 7)</text>
  <circle cx="${B.sx(0).toFixed(1)}" cy="${B.sy(1.5).toFixed(1)}" r="4.5" fill="#b02a1a"/>
  <text x="${(B.sx(0) + 10).toFixed(1)}" y="${(B.sy(1.5) + 4).toFixed(1)}" font-size="11" fill="#b02a1a">1,5</text>
  <circle cx="${B.sx(tRampa).toFixed(1)}" cy="${B.sy(R).toFixed(1)}" r="4.5" fill="#1a63a8"/>
  <text x="${(B.sx(tRampa) + 8).toFixed(1)}" y="${(B.sy(R) + 18).toFixed(1)}" font-size="10.5" fill="#1a63a8">T = C_r·T_1 = ${COMA(tRampa)} s</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 520" font-family="Segoe UI, Arial, sans-serif">
  <rect width="1000" height="520" fill="#ffffff"/>
  <text x="500" y="28" font-size="15" text-anchor="middle" fill="#222" font-weight="bold">El espectro de diseño son tres correcciones sobre el de referencia</text>
  <text x="500" y="47" font-size="12" text-anchor="middle" fill="${SUAVE}">Zona 3 · suelo ${SUELO} · R = ${R} · ξ = ${COMA(XI)} (marco arriostrado soldado, Tabla 7) · I = ${COMA(I, 1)}</text>
  <text x="268" y="72" font-size="12" fill="${TINTA}" font-weight="bold" text-anchor="middle">a) Ec. (1a), paso a paso</text>
  <text x="770" y="72" font-size="12" fill="${TINTA}" font-weight="bold" text-anchor="middle">b) La rampa de la Ec. (1b)</text>
  ${bandaA}
  ${A.svg}
  ${trazosA}
  ${leyendaA}
  ${B.svg}
  ${trazoB}
  <text x="610" y="462" font-size="10.5" fill="${TINTA}" font-weight="bold">Ojo: la norma calcula R* UNA vez, con T*.</text>
  <text x="610" y="477" font-size="10.5" fill="${SUAVE}">La curva azul de (a) usa R*(T) período a período,</text>
  <text x="610" y="491" font-size="10.5" fill="${SUAVE}">que es como se carga la función en SAP2000.</text>
  <text x="68" y="491" font-size="10.5" fill="${SUAVE}">Calculado con src/lib/sap-scripts/nch2369-spectrum.ts</text>
  <text x="68" y="505" font-size="10.5" fill="${SUAVE}">Ecs. (1a), (1b) y (3) de NCh2369:2025 (pp. 28-29)</text>
</svg>
`;
}

// ------------------------------------------------------------------- escritura

await mkdir(OUT_DIR, { recursive: true });

const figuras = [
  ['espectro-suelos.svg', figuraSuelos()],
  ['espectro-correcciones.svg', figuraCorrecciones()],
];

for (const [nombre, svg] of figuras) {
  const destino = path.join(OUT_DIR, nombre);
  await writeFile(destino, svg, 'utf8');
  console.log(`✓ ${path.relative(ROOT, destino)}  (${svg.length} bytes)`);
}

console.log('\nAhora MÍRALOS: npm run render:esquema -- public/apuntes/nch2369');
