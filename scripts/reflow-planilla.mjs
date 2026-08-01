#!/usr/bin/env node
// Recoloca verticalmente los bloques de una planilla para que no se solapen.
//
//   npm run reflow:planilla -- <slug> [...más] [--dry]
//   npm run reflow:planillas
//
// Necesita el sitio servido (`npm run preview`).
//
// El problema: las planillas se escriben con un paso vertical fijo, y eso vale
// mientras cada bloque sea una línea. No lo es. Una región `program` ocupa una
// línea por instrucción —ocho, diez— y una `math` con una fracción también
// crece. El resultado es que el bloque de abajo se dibuja encima del de arriba.
//
// La altura no se modela, se MIDE: se abre la planilla en el canvas y se lee el
// alto real de cada región ya renderizada (KaTeX incluido). Un modelo estático
// erraría justo en los casos que importan.
//
// El orden de lectura se conserva por construcción: se ordena por (y, x) y se
// reasigna `y` de forma monótona, así que el scope de la hoja —que depende de
// ese orden— no se mueve. Tampoco se toca `x`, ni `pageBreak`, ni el documento
// de impresión: el PDF sale idéntico.

import { chromium } from 'playwright';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const GRID = 16;
/** Aire entre dos bloques, y el extra que abre un encabezado de sección. */
const HUECO = 16;
const HUECO_SECCION = 40;

const argv = process.argv.slice(2);
const dry = argv.includes('--dry');
const base = (argv.includes('--url') ? argv[argv.indexOf('--url') + 1] : 'http://localhost:4322').replace(/\/$/, '');
const slugs = argv.filter((a, i) => !a.startsWith('--') && !argv[i - 1]?.startsWith('--'));

if (slugs.length === 0) {
  console.error('Uso: npm run reflow:planilla -- <slug> [...más] [--dry] [--url http://localhost:4322]');
  process.exit(2);
}

const snap = (v) => Math.max(0, Math.round(v / GRID) * GRID);
const esSeccion = (r) => r.kind === 'text' && r.src.includes('━');

const browser = await chromium.launch();
let movidas = 0;

for (const slug of slugs) {
  const ruta = path.resolve('public/planillas', `${slug}.json`);
  const planilla = JSON.parse(await readFile(ruta, 'utf8'));

  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  page.on('dialog', (d) => d.accept());
  await page.goto(`${base}/herramientas/canvas?planilla=${slug}`, { waitUntil: 'networkidle' });
  await page.waitForFunction((n) => document.querySelectorAll('div.group.absolute').length >= n,
    planilla.regions.length, { timeout: 20000 });
  await page.waitForTimeout(800);

  // Alto real de cada región, indexado por su posición actual: el canvas no
  // marca los bloques con su id, pero (left, top) los identifica sin ambigüedad.
  const medidos = await page.evaluate(() =>
    [...document.querySelectorAll('div.group.absolute')].map((el) => ({
      left: parseFloat(el.style.left),
      top: parseFloat(el.style.top),
      alto: el.getBoundingClientRect().height,
    })),
  );
  await ctx.close();

  const porPos = new Map(medidos.map((m) => [`${m.left}|${m.top}`, m.alto]));
  const orden = [...planilla.regions].sort((a, b) => a.y - b.y || a.x - b.x);

  let y = orden[0]?.y ?? 32;
  let cambios = 0;
  let maxSolape = 0;

  for (const [i, r] of orden.entries()) {
    const alto = porPos.get(`${r.x}|${r.y}`) ?? r.h ?? 28;
    // Cuánto se solapaba con el siguiente, solo para el reporte.
    const sig = orden[i + 1];
    if (sig) maxSolape = Math.max(maxSolape, alto - (sig.y - r.y));

    if (r.y !== y) {
      cambios += 1;
      r.y = y;
    }
    const hueco = orden[i + 1] && esSeccion(orden[i + 1]) ? HUECO_SECCION : HUECO;
    y = snap(y + alto + hueco);
  }

  console.log(
    `  ${slug}: ${cambios} de ${orden.length} bloques recolocados` +
      (maxSolape > 0 ? `  ·  solape máximo previo: ${Math.round(maxSolape)} px` : '  ·  no había solapes'),
  );
  movidas += cambios;

  if (!dry) await writeFile(ruta, JSON.stringify(planilla, null, 2) + '\n', 'utf8');
}

await browser.close();
console.log(`\n${movidas} bloques recolocados${dry ? ' (simulación, nada escrito)' : ''}\n`);
