#!/usr/bin/env node
// Dibuja las figuras calculadas del ejemplo de deformaciones de la torre
// (/apuntes/ejemplo-torre-deformaciones-nch2369).
//
//   npm run figuras:derivas-torre
//
// La curva del espectro de desplazamiento viene de `src/lib/nch2369-spectrum.ts`
// (Sd = Sa·(T/2π)²·g sobre el espectro de referencia corregido por ξ); las
// derivas por piso vienen del análisis validado en dos motores (SAP2000 vía
// OAPI y OpenSeesPy, rukan `verification/case09_torre_cbf_mrf.py`, error
// < 0,01 %), combinadas como CQC de derivas modales con el espectro de
// referencia de §6.1.
//
// Emite a public/ejemplo-torre-deformaciones-nch2369/:
//   derivas-por-piso.svg          perfil de derivas X e Y contra 0,015·h y la excepción ×2
//   espectro-desplazamiento.svg   Sd(T) y el costo de rigidizar el MRF
//
// El SVG no hereda las variables CSS del sitio (se sirve como <img>): colores
// literales y coma decimal, como el resto de las figuras.

import { build } from 'esbuild';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT_DIR = path.join(ROOT, 'public/ejemplo-torre-deformaciones-nch2369');

async function loadSpectrum() {
  const out = path.join(tmpdir(), `nch2369-spectrum-derivas-${process.pid}.mjs`);
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
const ZONA = 3;
const SUELO = 'D';
const XI = 0.02;
const F_XI = (0.05 / XI) ** 0.4;
const G = 9.80665; // m/s²

// Derivas de entrepiso [mm] con el espectro de referencia de §6.1 (CQC de
// derivas modales; case09 rukan ↔ SAP2000, error < 0,01 % en desplazamientos).
const DERIVAS_X = [9.6, 10.1, 6.4];
const DERIVAS_Y = [112.2, 169.5, 112.1];
const LIMITE = 60;      // 0,015·h con h = 4 000 mm (§6.3)
const LIMITE_X2 = 120;  // la excepción de §6.3: límites ×2

// Períodos del análisis y el T meta de la rigidización (Sd(T)/Sd(T_Y) = 60/169,5).
const T_STAR_X = 0.2202;
const T_STAR_Y = 0.9957;
const T_META = 0.4652;
const ALFA = (T_STAR_Y / T_META) ** 2; // ≈ 4,6

// ---------------------------------------------------------------- utilidades

const COMA = (x, dec = 2) => x.toFixed(dec).replace('.', ',');

const TINTA = '#333';
const SUAVE = '#6b7280';
const BORDE = '#d1d5db';
const AZUL = '#1a63a8';   // dirección X (CBF)
const ROJO = '#b02a1a';   // dirección Y (MRF)
const VERDE = '#1c7c3c';

function escala(d0, d1, p0, p1) {
  return (v) => p0 + ((v - d0) / (d1 - d0)) * (p1 - p0);
}

// Sd(T) en mm sobre el espectro de referencia corregido por ξ (I = 1,0):
// computeSpectrum con R = 1 entrega S_aH·(0,05/ξ)^0,4 punto a punto.
function espectroDesplazamiento(tMax) {
  const ref = computeSpectrum(ZONA, SUELO, 1, 1, XI, 1.0, 1.0, false);
  const pts = [];
  for (let i = 0; i < ref.periods.length; i++) {
    const t = ref.periods[i];
    if (t > tMax) break;
    pts.push([t, ref.accels[i] * G * (t / (2 * Math.PI)) ** 2 * 1000]);
  }
  return pts;
}

// Interpolación lineal sobre la grilla (paso 0,01 s): los rótulos de los
// puntos deben cuadrar con la aritmética del post, no con la celda más cercana.
const sdEn = (pts, t) => {
  for (let i = 1; i < pts.length; i++) {
    if (pts[i][0] >= t) {
      const [t0, v0] = pts[i - 1];
      const [t1, v1] = pts[i];
      return v0 + ((t - t0) / (t1 - t0)) * (v1 - v0);
    }
  }
  return pts[pts.length - 1][1];
};

// ------------------------------------------ figura 1: las derivas contra §6.3

function figuraDerivas() {
  const D_MAX = 200;
  const X0 = 200;
  const W = 690;
  const sd = escala(0, D_MAX, X0, X0 + W);

  const ticks = [0, 40, 80, 120, 160, 200];
  const ejes = ticks
    .map((t) => {
      const px = sd(t);
      return [
        `<line x1="${px.toFixed(1)}" y1="96" x2="${px.toFixed(1)}" y2="400" stroke="${BORDE}" stroke-width="1"/>`,
        `<text x="${px.toFixed(1)}" y="418" font-size="11" fill="${SUAVE}" text-anchor="middle">${t}</text>`,
      ].join('\n  ');
    })
    .join('\n  ');

  const limites = [
    `<line x1="${sd(LIMITE).toFixed(1)}" y1="96" x2="${sd(LIMITE).toFixed(1)}" y2="400" stroke="${VERDE}" stroke-width="2" stroke-dasharray="6 4"/>`,
    `<text x="${sd(LIMITE).toFixed(1)}" y="86" font-size="11.5" fill="${VERDE}" text-anchor="middle" font-weight="bold">0,015·h = 60 mm (§6.3)</text>`,
    `<line x1="${sd(LIMITE_X2).toFixed(1)}" y1="96" x2="${sd(LIMITE_X2).toFixed(1)}" y2="400" stroke="${VERDE}" stroke-width="1.4" stroke-dasharray="2 4"/>`,
    `<text x="${sd(LIMITE_X2).toFixed(1)}" y="86" font-size="10.5" fill="${SUAVE}" text-anchor="middle">excepción ×2 = 120 mm</text>`,
  ].join('\n  ');

  // Tres pisos, de arriba hacia abajo, con la barra X y la Y de cada uno.
  const filas = [];
  for (let piso = 3; piso >= 1; piso--) {
    const y0 = 120 + (3 - piso) * 96;
    const dx = DERIVAS_X[piso - 1];
    const dy = DERIVAS_Y[piso - 1];
    filas.push(
      `<text x="60" y="${y0 + 26}" font-size="13" fill="${TINTA}" font-weight="bold">Piso ${piso}</text>`,
      `<text x="60" y="${y0 + 42}" font-size="10.5" fill="${SUAVE}">h = 4,0 m</text>`,
      // barra X
      `<line x1="${X0}" y1="${y0 + 8}" x2="${sd(dx).toFixed(1)}" y2="${y0 + 8}" stroke="${AZUL}" stroke-width="14" stroke-opacity="0.9"/>`,
      `<text x="${(sd(dx) + 10).toFixed(1)}" y="${y0 + 12}" font-size="11.5" fill="${AZUL}" font-weight="bold">X: ${COMA(dx, 1)} mm ✓</text>`,
      // barra Y
      `<line x1="${X0}" y1="${y0 + 36}" x2="${sd(dy).toFixed(1)}" y2="${y0 + 36}" stroke="${ROJO}" stroke-width="14" stroke-opacity="0.9"/>`,
      `<text x="${(sd(dy) + 10).toFixed(1)}" y="${y0 + 40}" font-size="11.5" fill="${ROJO}" font-weight="bold">Y: ${COMA(dy, 1)} mm — ${COMA(dy / LIMITE, 2)}× el límite</text>`,
    );
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 470" font-family="Segoe UI, Arial, sans-serif">
  <rect width="1000" height="470" fill="#ffffff"/>
  <text x="500" y="28" font-size="15" text-anchor="middle" fill="#222" font-weight="bold">Las derivas contra §6.3: el CBF pasa con el 17 %, el MRF reprueba hasta 2,8 veces</text>
  <text x="500" y="47" font-size="12" text-anchor="middle" fill="${SUAVE}">Espectro de referencia §6.1 (sin R*, corregido por (0,05/ξ)^0,4) · derivas CQC por entrepiso · límite 0,015·h (§6.3)</text>
  ${ejes}
  ${limites}
  ${filas.join('\n  ')}
  <text x="${X0 + W + 12}" y="418" font-size="11" fill="${TINTA}">mm</text>
  <text x="60" y="446" font-size="10.5" fill="${SUAVE}">Derivas: análisis validado en dos motores (case09 rukan ↔ SAP2000, error &lt; 0,01 %), CQC de derivas modales · §6.1, §6.3 y su excepción: NCh2369:2025 pp. 68-70</text>
</svg>
`;
}

// ------------------- figura 2: el espectro de desplazamiento y qué cuesta rigidizar

function figuraSd() {
  const T_MAX = 2.0;
  const SD_MAX = 500;
  const pts = espectroDesplazamiento(T_MAX);

  const X0 = 84, Y0 = 92, W = 610, H = 330;
  const sx = escala(0, T_MAX, X0, X0 + W);
  const sy = escala(0, SD_MAX, Y0 + H, Y0);

  const marco = [];
  for (const t of [0, 0.5, 1.0, 1.5, 2.0]) {
    const px = sx(t);
    marco.push(`<line x1="${px.toFixed(1)}" y1="${Y0}" x2="${px.toFixed(1)}" y2="${Y0 + H}" stroke="${BORDE}" stroke-width="1"/>`);
    marco.push(`<text x="${px.toFixed(1)}" y="${Y0 + H + 16}" font-size="11" fill="${SUAVE}" text-anchor="middle">${COMA(t, 1)}</text>`);
  }
  for (const v of [0, 100, 200, 300, 400, 500]) {
    const py = sy(v);
    marco.push(`<line x1="${X0}" y1="${py.toFixed(1)}" x2="${X0 + W}" y2="${py.toFixed(1)}" stroke="${BORDE}" stroke-width="1"/>`);
    marco.push(`<text x="${X0 - 8}" y="${(py + 4).toFixed(1)}" font-size="11" fill="${SUAVE}" text-anchor="end">${v}</text>`);
  }
  marco.push(`<line x1="${X0}" y1="${Y0 + H}" x2="${X0 + W}" y2="${Y0 + H}" stroke="${TINTA}" stroke-width="1.5"/>`);
  marco.push(`<line x1="${X0}" y1="${Y0}" x2="${X0}" y2="${Y0 + H}" stroke="${TINTA}" stroke-width="1.5"/>`);
  marco.push(`<text x="${X0 + W}" y="${Y0 + H + 34}" font-size="12" fill="${TINTA}" text-anchor="end">T [s]</text>`);
  marco.push(`<text x="${X0 - 6}" y="${Y0 - 10}" font-size="12" fill="${TINTA}">S_d [mm]</text>`);

  const curva = pts.map(([t, v]) => `${sx(t).toFixed(1)},${sy(v).toFixed(1)}`).join(' ');

  const sdY = sdEn(pts, T_STAR_Y);
  const sdMeta = sdEn(pts, T_META);
  const sdX = sdEn(pts, T_STAR_X);

  const punto = (t, v, color, rot, anchor = 'middle', dx = 0, dy = -14) => [
    `<circle cx="${sx(t).toFixed(1)}" cy="${sy(v).toFixed(1)}" r="5.5" fill="${color}"/>`,
    `<line x1="${sx(t).toFixed(1)}" y1="${sy(v).toFixed(1)}" x2="${sx(t).toFixed(1)}" y2="${Y0 + H}" stroke="${color}" stroke-width="1" stroke-dasharray="3 3"/>`,
    `<text x="${(sx(t) + dx).toFixed(1)}" y="${(sy(v) + dy).toFixed(1)}" font-size="11" fill="${color}" text-anchor="${anchor}" font-weight="bold">${rot}</text>`,
  ].join('\n  ');

  const flecha = [
    // la trayectoria de la rigidización: de (T_Y, Sd_Y) a (T_meta, Sd_meta)
    `<path d="M ${sx(T_STAR_Y).toFixed(1)} ${sy(sdY).toFixed(1)} Q ${sx(0.7).toFixed(1)} ${sy(sdY * 0.93).toFixed(1)} ${(sx(T_META) + 8).toFixed(1)} ${(sy(sdMeta) - 8).toFixed(1)}" fill="none" stroke="${TINTA}" stroke-width="1.6" stroke-dasharray="7 4" marker-end="url(#pta)"/>`,
    `<text x="${sx(0.66).toFixed(1)}" y="${sy(205).toFixed(1)}" font-size="11.5" fill="${TINTA}" font-weight="bold">rigidez × ${COMA(ALFA, 1)}</text>`,
    `<text x="${sx(0.66).toFixed(1)}" y="${(sy(205) + 16).toFixed(1)}" font-size="10.5" fill="${SUAVE}">para que la deriva baje de 169,5 a 60 mm</text>`,
  ].join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 500" font-family="Segoe UI, Arial, sans-serif">
  <defs>
    <marker id="pta" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
      <path d="M0,0 L9,4.5 L0,9 z" fill="${TINTA}"/>
    </marker>
  </defs>
  <rect width="1000" height="500" fill="#ffffff"/>
  <text x="500" y="28" font-size="15" text-anchor="middle" fill="#222" font-weight="bold">El espectro de desplazamiento: por qué la deriva se arregla con rigidez, y cuánta</text>
  <text x="500" y="47" font-size="12" text-anchor="middle" fill="${SUAVE}">S_d(T) = S_a(T)·(T/2π)² sobre el espectro de referencia de §6.1 (zona 3, suelo D, ξ = 0,02, I = 1,0)</text>
  ${marco.join('\n  ')}
  <polyline points="${curva}" fill="none" stroke="${TINTA}" stroke-width="2.6"/>
  ${punto(T_STAR_Y, sdY, ROJO, `T*_Y = ${COMA(T_STAR_Y, 3)} s → ${COMA(sdY, 0)} mm`, 'start', 12, -6)}
  ${punto(T_META, sdMeta, ROJO, `T meta = ${COMA(T_META, 3)} s → ${COMA(sdMeta, 0)} mm`, 'end', -12, -6)}
  ${punto(T_STAR_X, sdX, AZUL, `T*_X → ${COMA(sdX, 0)} mm`)}
  ${flecha}
  <text x="712" y="120" font-size="10.5" fill="${TINTA}" font-weight="bold">La curva crece casi monótona con T:</text>
  <text x="712" y="134" font-size="10.5" fill="${SUAVE}">flexibilizar siempre agranda el</text>
  <text x="712" y="148" font-size="10.5" fill="${SUAVE}">desplazamiento. Y al revés: rigidizar</text>
  <text x="712" y="162" font-size="10.5" fill="${SUAVE}">rinde poco al principio, porque S_a</text>
  <text x="712" y="176" font-size="10.5" fill="${SUAVE}">sube mientras T² baja. Para cortar la</text>
  <text x="712" y="190" font-size="10.5" fill="${SUAVE}">deriva a un tercio (169,5 → 60 mm) el</text>
  <text x="712" y="204" font-size="10.5" fill="${SUAVE}">período debe bajar a menos de la</text>
  <text x="712" y="218" font-size="10.5" fill="${SUAVE}">mitad: rigidez × 4,6.</text>
  <text x="712" y="244" font-size="10.5" fill="${AZUL}">El CBF vive en la otra punta: en</text>
  <text x="712" y="258" font-size="10.5" fill="${AZUL}">T*_X = 0,220 s el espectro solo</text>
  <text x="712" y="272" font-size="10.5" fill="${AZUL}">le pide ${COMA(sdX, 0)} mm.</text>
  <text x="${X0}" y="470" font-size="10.5" fill="${SUAVE}">Curva: src/lib/nch2369-spectrum.ts (Ec. 3 corregida por ξ) · T* y derivas: análisis validado en dos motores (case09 rukan ↔ SAP2000) · estimación con forma modal constante</text>
</svg>
`;
}

// ------------------------------------------------------------------- escritura

await mkdir(OUT_DIR, { recursive: true });

const figuras = [
  ['derivas-por-piso.svg', figuraDerivas()],
  ['espectro-desplazamiento.svg', figuraSd()],
];

for (const [nombre, svg] of figuras) {
  const destino = path.join(OUT_DIR, nombre);
  await writeFile(destino, svg, 'utf8');
  console.log(`✓ ${path.relative(ROOT, destino)}  (${svg.length} bytes)`);
}

console.log('\nAhora MÍRALOS: npm run render:esquema -- public/ejemplo-torre-deformaciones-nch2369');
