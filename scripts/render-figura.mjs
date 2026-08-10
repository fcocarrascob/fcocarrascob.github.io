#!/usr/bin/env node
// Rasteriza un SVG estático de `public/` con Chromium y deja el PNG en un
// temporal, para MIRARLO.
//
//   npm run figura -- public/placas-base-rigidez/fig-marco.svg
//   npm run figura -- public/placas-base-rigidez            # todos los del dir
//
// POR QUÉ EXISTE. Las figuras de los posts se dibujan a mano en `public/` y
// nadie las abre: el navegador las muestra bien formadas aunque dos rótulos
// queden uno encima del otro, y el build no tiene forma de saberlo. Los
// esquemas paramétricos del canvas ya tenían `npm run render:esquema` —que
// además resuelve los tokens—; esto es su equivalente para el SVG sin tokens,
// y responde a la misma regla del repo: que el contrato pase no dice que el
// dibujo se lea.
//
// Deliberadamente NO valida nada ni devuelve código de error por el contenido:
// su única salida útil es un PNG que hay que abrir.

import { chromium } from 'playwright';
import { readFile, readdir, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const VERDE = '\x1b[32m';
const GRIS = '\x1b[90m';
const RESET = '\x1b[0m';

const objetivo = process.argv[2];
if (!objetivo) {
  console.error('uso: npm run figura -- <ruta.svg | directorio>');
  process.exit(1);
}

/** Un .svg suelto, o todos los .svg de un directorio. */
async function svgs(rel) {
  const abs = path.resolve(ROOT, rel);
  if ((await stat(abs)).isDirectory()) {
    const nombres = (await readdir(abs)).filter((f) => f.endsWith('.svg')).sort();
    return nombres.map((f) => path.join(abs, f));
  }
  return [abs];
}

const salida = path.join(tmpdir(), 'struct-pad-figuras');
const browser = await chromium.launch();
const hechos = [];

for (const abs of await svgs(objetivo)) {
  const svg = await readFile(abs, 'utf8');
  // El viewBox manda el tamaño; sin él, un default razonable para el sitio.
  const vb = svg.match(/viewBox\s*=\s*"[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)"/);
  const w = Math.round(Number(vb?.[1] ?? 840));
  const h = Math.round(Number(vb?.[2] ?? 560));

  const page = await browser.newPage({
    viewport: { width: w, height: h },
    deviceScaleFactor: 2,
  });
  // Fondo blanco explícito: un SVG sin <rect> de fondo sale transparente y en
  // el visor de PNG se lee sobre negro, que no es como lo verá el lector.
  await page.setContent(
    `<body style="margin:0;background:#fff">${svg}</body>`,
    { waitUntil: 'load' }
  );
  const destino = path.join(salida, path.basename(abs).replace(/\.svg$/, '.png'));
  await page.screenshot({ path: destino });
  await page.close();

  const tokens = (svg.match(/\{\{[^{}]+\}\}/g) ?? []).length;
  const aviso = tokens
    ? `  ${GRIS}(${tokens} token(s) sin resolver — esto es para SVG sin tokens; usa render:esquema)${RESET}`
    : '';
  console.log(`  ${VERDE}[ OK ]${RESET} ${path.basename(abs).padEnd(34)} ${w}×${h} @2x${aviso}`);
  hechos.push(destino);
}

await browser.close();

console.log(`\n${hechos.length} PNG en ${salida}`);
for (const f of hechos) console.log(`  ${f}`);
console.log(`\n${GRIS}Ábrelos. Que el SVG sea válido no dice que el dibujo se lea.${RESET}`);
