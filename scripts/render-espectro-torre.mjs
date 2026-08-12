#!/usr/bin/env node
// Dibuja las figuras calculadas del ejemplo de la torre CBF/MRF
// (/apuntes/ejemplo-torre-sismica-nch2369).
//
//   npm run figuras:espectro-torre
//
// Las curvas vienen de `src/lib/nch2369-spectrum.ts`; los T*, R* y cortes
// basales vienen del análisis validado en dos motores (SAP2000 vía OAPI y
// OpenSeesPy, rukan `verification/case09_torre_cbf_mrf.py`, error < 0,01 %).
// A diferencia de la figura de la nota del espectro, acá cada espectro de
// diseño usa R* CONSTANTE —el de su dirección, calculado con T*—, que es lo
// que la Ec. (1b) pide para el análisis.
//
// Emite a public/ejemplo-torre-sismica-nch2369/:
//   espectros-por-direccion.svg   referencia + diseño X + diseño Y, con T* marcados
//   banda-por-direccion.svg       Q0mín/Q0máx y dónde cae el Q0 de cada dirección
//
// El SVG no hereda las variables CSS del sitio (se sirve como <img>): colores
// literales y coma decimal, como el resto de las figuras.

import { build } from 'esbuild';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT_DIR = path.join(ROOT, 'public/ejemplo-torre-sismica-nch2369');

async function loadSpectrum() {
  const out = path.join(tmpdir(), `nch2369-spectrum-torre-${process.pid}.mjs`);
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

const { computeSpectrum } = await loadSpectrum();

// ------------------------------------------------------------------ los datos
// Torre del ejemplo: zona 3, suelo D, I = 1,0, R = 5 y ξ = 0,02 en AMBAS
// direcciones (Tabla 7, filas 5.1 y 5.3, uniones soldadas). Lo que difiere por
// dirección es el período del modo dominante, y con él el R* de la Ec. (1b).
const ZONA = 3;
const SUELO = 'D';
const I_IMP = 1.0;
const R_TABLA = 5;
const XI = 0.02;
const CR_T1 = 0.16 * R_TABLA * 0.41; // C_r·T_1 = 0,328 s (suelo D)

// Del análisis modal validado (case09 rukan ↔ SAP2000):
const T_STAR_X = 0.2202; // s · CBF, 89,1 % de masa
const T_STAR_Y = 0.9957; // s · MRF, 87,1 % de masa
const R_STAR_X = 3.8495; // rampa de la Ec. (1b)
const R_STAR_Y = 5.0;    // meseta: T*_Y > C_r·T_1

// Cortes basales CQC (kN) y banda §5.12/§5.13 con P = 1200 kN:
const Q0X = 474.9;
const Q0Y = 255.9;
const Q0MIN = 168.0;   // 0,25·I·(A_r·S/g)·P
const Q0MAX = 444.4;   // 2,75·I·A_r·S/(g·(R+1))·(0,05/ξ)^0,4·P

const F_XI = (0.05 / XI) ** 0.4;

// ---------------------------------------------------------------- utilidades

const COMA = (x, dec = 2) => x.toFixed(dec).replace('.', ',');

const TINTA = '#333';
const SUAVE = '#6b7280';
const BORDE = '#d1d5db';
const AZUL = '#1a63a8';   // dirección X (CBF)
const ROJO = '#b02a1a';   // dirección Y (MRF)
const GRIS = '#9ca3af';   // referencia

const referencia = () => computeSpectrum(ZONA, SUELO, 1, 1, 0.05, 1.0, 1.0, false);

function hasta(spec, tMax) {
  const pts = [];
  for (let i = 0; i < spec.periods.length; i++) {
    if (spec.periods[i] > tMax) break;
    pts.push([spec.periods[i], spec.accels[i]]);
  }
  return pts;
}

function escala(d0, d1, p0, p1) {
  return (v) => p0 + ((v - d0) / (d1 - d0)) * (p1 - p0);
}

function polilinea(pts, sx, sy) {
  return pts.map(([x, y]) => `${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(' ');
}

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

// ------------------------------------- figura 1: un espectro por cada dirección

function figuraEspectros() {
  const T_MAX = 2.0;
  const ref = hasta(referencia(), T_MAX);

  // Diseño con R* CONSTANTE por dirección: I·S_aH(T)/R*·(0,05/ξ)^0,4.
  const disX = ref.map(([t, v]) => [t, (I_IMP * v * F_XI) / R_STAR_X]);
  const disY = ref.map(([t, v]) => [t, (I_IMP * v * F_XI) / R_STAR_Y]);

  const yMax = 1.6;
  const A = marco({
    x: 78, y: 88, w: 620, h: 330,
    xMax: T_MAX, yMax,
    xTicks: [0, 0.5, 1.0, 1.5, 2.0],
    yTicks: [0, 0.4, 0.8, 1.2, 1.6],
    xLabel: 'T [s]', yLabel: 'S_a [g]', yDec: 1,
  });

  // Sa de diseño en cada T*, leídos de las curvas (para los puntos).
  const saEn = (pts, t) => {
    let mejor = pts[0];
    for (const p of pts) if (Math.abs(p[0] - t) < Math.abs(mejor[0] - t)) mejor = p;
    return mejor[1];
  };
  const saX = saEn(disX, T_STAR_X);
  const saY = saEn(disY, T_STAR_Y);

  const xRampa = A.sx(CR_T1);

  const trazos = [
    `<rect x="${A.sx(0).toFixed(1)}" y="88" width="${(xRampa - A.sx(0)).toFixed(1)}" height="330" fill="${AZUL}" fill-opacity="0.05"/>`,
    `<line x1="${xRampa.toFixed(1)}" y1="88" x2="${xRampa.toFixed(1)}" y2="418" stroke="${SUAVE}" stroke-width="1.2" stroke-dasharray="5 4"/>`,
    `<text x="${(xRampa + 6).toFixed(1)}" y="410" font-size="10.5" fill="${SUAVE}">C_r·T_1 = ${COMA(CR_T1, 3)} s</text>`,
    `<polyline points="${polilinea(ref, A.sx, A.sy)}" fill="none" stroke="${GRIS}" stroke-width="2.2" stroke-dasharray="8 5"/>`,
    `<polyline points="${polilinea(disX, A.sx, A.sy)}" fill="none" stroke="${AZUL}" stroke-width="2.8"/>`,
    `<polyline points="${polilinea(disY, A.sx, A.sy)}" fill="none" stroke="${ROJO}" stroke-width="2.8"/>`,
    // T* de cada dirección, sobre su curva
    `<circle cx="${A.sx(T_STAR_X).toFixed(1)}" cy="${A.sy(saX).toFixed(1)}" r="5" fill="${AZUL}"/>`,
    `<line x1="${A.sx(T_STAR_X).toFixed(1)}" y1="${A.sy(saX).toFixed(1)}" x2="${A.sx(T_STAR_X).toFixed(1)}" y2="418" stroke="${AZUL}" stroke-width="1" stroke-dasharray="3 3"/>`,
    `<text x="${A.sx(T_STAR_X).toFixed(1)}" y="${(A.sy(saX) - 12).toFixed(1)}" font-size="11" fill="${AZUL}" text-anchor="middle" font-weight="bold">T*_X = ${COMA(T_STAR_X, 3)} s</text>`,
    `<circle cx="${A.sx(T_STAR_Y).toFixed(1)}" cy="${A.sy(saY).toFixed(1)}" r="5" fill="${ROJO}"/>`,
    `<line x1="${A.sx(T_STAR_Y).toFixed(1)}" y1="${A.sy(saY).toFixed(1)}" x2="${A.sx(T_STAR_Y).toFixed(1)}" y2="418" stroke="${ROJO}" stroke-width="1" stroke-dasharray="3 3"/>`,
    `<text x="${A.sx(T_STAR_Y).toFixed(1)}" y="${(A.sy(saY) - 12).toFixed(1)}" font-size="11" fill="${ROJO}" text-anchor="middle" font-weight="bold">T*_Y = ${COMA(T_STAR_Y, 3)} s</text>`,
  ].join('\n  ');

  const leyenda = [
    { color: GRIS, dash: '8 5', w: 2.2, rot: 'Referencia S_aH — Ec. (3), ξ = 0,05' },
    { color: AZUL, dash: '', w: 2.8, rot: `Diseño X (CBF): R* = ${COMA(R_STAR_X, 4)} — la rampa` },
    { color: ROJO, dash: '', w: 2.8, rot: `Diseño Y (MRF): R* = ${COMA(R_STAR_Y, 1)} — la meseta` },
  ]
    .map((c, i) => {
      const yy = 108 + i * 20;
      return [
        `<line x1="726" y1="${yy - 4}" x2="754" y2="${yy - 4}" stroke="${c.color}" stroke-width="${c.w}"${c.dash ? ` stroke-dasharray="${c.dash}"` : ''}/>`,
        `<text x="762" y="${yy}" font-size="11" fill="${TINTA}">${c.rot}</text>`,
      ].join('\n  ');
    })
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 500" font-family="Segoe UI, Arial, sans-serif">
  <rect width="1000" height="500" fill="#ffffff"/>
  <text x="500" y="28" font-size="15" text-anchor="middle" fill="#222" font-weight="bold">Mismo R = 5 de tabla, dos espectros de diseño: el período de cada dirección elige su R*</text>
  <text x="500" y="47" font-size="12" text-anchor="middle" fill="${SUAVE}">Zona 3 · suelo D · I = 1,0 · ξ = 0,02 (soldadas) · Ec. (1a) con R* constante por dirección, calculado en T* (Ec. 1b)</text>
  ${A.svg}
  ${trazos}
  ${leyenda}
  <text x="726" y="190" font-size="10.5" fill="${TINTA}" font-weight="bold">El CBF cae dentro de la rampa:</text>
  <text x="726" y="204" font-size="10.5" fill="${SUAVE}">T*_X &lt; C_r·T_1 → R* baja a 3,85 y su</text>
  <text x="726" y="218" font-size="10.5" fill="${SUAVE}">espectro queda un 30 % por encima del</text>
  <text x="726" y="232" font-size="10.5" fill="${SUAVE}">espectro del MRF en todo el rango.</text>
  <text x="726" y="252" font-size="10.5" fill="${SUAVE}">Los puntos marcan dónde lee cada</text>
  <text x="726" y="266" font-size="10.5" fill="${SUAVE}">dirección su demanda dominante.</text>
  <text x="78" y="470" font-size="10.5" fill="${SUAVE}">Curvas: src/lib/nch2369-spectrum.ts · T* y R*: análisis validado en dos motores (case09 rukan ↔ SAP2000, error &lt; 0,01 %)</text>
  <text x="78" y="485" font-size="10.5" fill="${SUAVE}">Ecs. (1a), (1b) y (3) de NCh2369:2025 (pp. 28-29) · Tablas 3, 6 y 7 (pp. 57, 60)</text>
</svg>
`;
}

// --------------------------------------- figura 2: la banda, ahora con dos Q0

function figuraBanda() {
  const Q_MAX_EJE = 700;
  const X0 = 90;
  const W = 820;
  const sq = escala(0, Q_MAX_EJE, X0, X0 + W);

  const filas = [
    { nombre: 'X — CBF (arriostrada)', q0: Q0X, color: AZUL, y: 150, veredicto: `Q₀ &gt; Q₀máx → §5.13 permite recortar a ${COMA(Q0MAX, 1)} kN (−6,4 %)` },
    { nombre: 'Y — MRF (marco de momento)', q0: Q0Y, color: ROJO, y: 260, veredicto: 'dentro de la banda → ni §5.12 ni §5.13 intervienen' },
  ];

  const ticks = [0, 100, 200, 300, 400, 500, 600, 700];
  const ejes = ticks
    .map((t) => {
      const px = sq(t);
      return [
        `<line x1="${px.toFixed(1)}" y1="110" x2="${px.toFixed(1)}" y2="330" stroke="${BORDE}" stroke-width="1"/>`,
        `<text x="${px.toFixed(1)}" y="348" font-size="11" fill="${SUAVE}" text-anchor="middle">${t}</text>`,
      ].join('\n  ');
    })
    .join('\n  ');

  const banda = [
    `<rect x="${sq(Q0MIN).toFixed(1)}" y="110" width="${(sq(Q0MAX) - sq(Q0MIN)).toFixed(1)}" height="220" fill="#1c7c3c" fill-opacity="0.08"/>`,
    `<line x1="${sq(Q0MIN).toFixed(1)}" y1="110" x2="${sq(Q0MIN).toFixed(1)}" y2="330" stroke="#1c7c3c" stroke-width="1.6" stroke-dasharray="6 4"/>`,
    `<line x1="${sq(Q0MAX).toFixed(1)}" y1="110" x2="${sq(Q0MAX).toFixed(1)}" y2="330" stroke="#1c7c3c" stroke-width="1.6" stroke-dasharray="6 4"/>`,
    `<text x="${sq(Q0MIN).toFixed(1)}" y="100" font-size="11.5" fill="#1c7c3c" text-anchor="middle" font-weight="bold">Q₀mín = ${COMA(Q0MIN, 1)} kN</text>`,
    `<text x="${sq(Q0MIN).toFixed(1)}" y="86" font-size="10.5" fill="${SUAVE}" text-anchor="middle">§5.12 · 0,25·I·(A_r·S/g)·P</text>`,
    `<text x="${sq(Q0MAX).toFixed(1)}" y="100" font-size="11.5" fill="#1c7c3c" text-anchor="middle" font-weight="bold">Q₀máx = ${COMA(Q0MAX, 1)} kN</text>`,
    `<text x="${sq(Q0MAX).toFixed(1)}" y="86" font-size="10.5" fill="${SUAVE}" text-anchor="middle">§5.13 · 2,75·I·A_r·S/(g(R+1))·(0,05/ξ)^0,4·P</text>`,
  ].join('\n  ');

  const marcas = filas
    .map((f) => {
      const px = sq(f.q0);
      return [
        `<text x="${X0}" y="${f.y - 26}" font-size="12.5" fill="${f.color}" font-weight="bold">${f.nombre}</text>`,
        `<line x1="${X0}" y1="${f.y}" x2="${px.toFixed(1)}" y2="${f.y}" stroke="${f.color}" stroke-width="7" stroke-opacity="0.85"/>`,
        `<circle cx="${px.toFixed(1)}" cy="${f.y}" r="7" fill="${f.color}"/>`,
        `<text x="${(px + 12).toFixed(1)}" y="${f.y + 4}" font-size="12" fill="${f.color}" font-weight="bold">Q₀ = ${COMA(f.q0, 1)} kN</text>`,
        `<text x="${X0}" y="${f.y + 24}" font-size="10.5" fill="${SUAVE}">${f.veredicto}</text>`,
      ].join('\n  ');
    })
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 400" font-family="Segoe UI, Arial, sans-serif">
  <rect width="1000" height="400" fill="#ffffff"/>
  <text x="500" y="30" font-size="15" text-anchor="middle" fill="#222" font-weight="bold">La banda de §5.12–§5.13 es una sola, pero cada dirección cae en un lugar distinto</text>
  <text x="500" y="49" font-size="12" text-anchor="middle" fill="${SUAVE}">P = 1 200 kN · zona 3 · suelo D · I = 1,0 · R = 5 · ξ = 0,02 — la banda no depende del análisis, solo del sitio y del sistema</text>
  ${ejes}
  ${banda}
  ${marcas}
  <text x="${X0 + W + 28}" y="348" font-size="11" fill="${TINTA}" text-anchor="start">kN</text>
  <text x="90" y="378" font-size="10.5" fill="${SUAVE}">Q₀ por dirección: CQC del análisis modal espectral, validado en dos motores (case09 rukan ↔ SAP2000, error &lt; 0,01 %)</text>
</svg>
`;
}

// ------------------------------------------------------------------- escritura

await mkdir(OUT_DIR, { recursive: true });

const figuras = [
  ['espectros-por-direccion.svg', figuraEspectros()],
  ['banda-por-direccion.svg', figuraBanda()],
];

for (const [nombre, svg] of figuras) {
  const destino = path.join(OUT_DIR, nombre);
  await writeFile(destino, svg, 'utf8');
  console.log(`✓ ${path.relative(ROOT, destino)}  (${svg.length} bytes)`);
}

console.log('\nAhora MÍRALOS: npm run render:esquema -- public/ejemplo-torre-sismica-nch2369');
