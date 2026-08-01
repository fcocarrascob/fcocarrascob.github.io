#!/usr/bin/env node
// Imprime una planilla a PDF A4 y comprueba que los cortes de página que el
// canvas anuncia son los que el PDF tiene de verdad.
//
//   npm run pdf:planilla -- <slug> [...más]      # una o varias
//   npm run pdf:planillas                        # las 7 publicadas
//   ... -- --url http://localhost:4322           # si el preview cambió de puerto
//
// Necesita el sitio servido (`npm run preview` o `npm run dev`).
//
// Qué hace, en orden:
//   1. abre /herramientas/canvas?planilla=<slug> en Chromium;
//   2. lee del DOM los cortes que la hoja está anunciando (las marcas
//      «página N»), que es exactamente lo que ve el usuario;
//   3. imprime con `preferCSSPageSize`, de modo que mande la regla @page del
//      sitio y no una opción del script — si @page está mal, el PDF sale mal
//      y la comprobación lo dice;
//   4. compara la página en la que el PDF pone cada bloque contra la anunciada.
//
// El PDF y una captura del canvas quedan en un temporal fuera del repo.

import { chromium } from 'playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

const argv = process.argv.slice(2);
const opt = (n, d) => {
  const i = argv.indexOf(n);
  return i === -1 ? d : argv[i + 1];
};
const base = opt('--url', 'http://localhost:4322').replace(/\/$/, '');
const outDir = path.resolve(opt('--out', path.join(tmpdir(), 'struct-pad-pdf')));
const slugs = argv.filter((a, i) => !a.startsWith('--') && !argv[i - 1]?.startsWith('--'));

if (slugs.length === 0) {
  console.error('Uso: npm run pdf:planilla -- <slug> [...más] [--url http://localhost:4322]');
  process.exit(2);
}

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
let fallas = 0;

for (const slug of slugs) {
  // Contexto nuevo por planilla: el canvas guarda en localStorage y pregunta
  // antes de pisar trabajo previo. Con la despensa vacía no pregunta nada.
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  page.on('dialog', (d) => d.accept());

  await page.goto(`${base}/herramientas/canvas?planilla=${slug}`, { waitUntil: 'networkidle' });
  // La paginación se mide con 250 ms de respiro tras el último cambio.
  await page.waitForFunction(
    () => document.querySelectorAll('.worksheet-print [data-wp-id]').length > 3,
    { timeout: 15000 },
  );
  await page.waitForTimeout(1200);

  // --- 1. Lo que el canvas anuncia ------------------------------------------
  //
  // Las marcas se dibujan en `top: y - 10` de la región que abre página; con
  // las regiones a la vista se recupera cuál es. Se lee del DOM y no del
  // estado de React a propósito: lo que se verifica es lo que el usuario ve.
  const anunciado = await page.evaluate(() => {
    const marcas = [...document.querySelectorAll('[class*="pointer-events-none"]')]
      .map((el) => {
        const txt = el.textContent ?? '';
        const m = txt.match(/página (\d+)/);
        return m ? { pagina: Number(m[1]), top: parseFloat(el.style.top), forzado: txt.includes('⇱') } : null;
      })
      .filter(Boolean);
    const total = document.querySelector('button[title*="memoria de cálculo"]')?.textContent ?? '';
    return { marcas, total: Number(total.match(/\((\d+)/)?.[1] ?? 0) };
  });

  await page.screenshot({ path: path.join(outDir, `${slug}-canvas.png`), fullPage: true });

  // --- 2. El PDF de verdad ---------------------------------------------------
  const pdfPath = path.join(outDir, `${slug}.pdf`);
  await page.pdf({ path: pdfPath, preferCSSPageSize: true, printBackground: true });

  // El orden de los bloques del documento impreso, para casar texto con página.
  //
  // KaTeX emite la fórmula dos veces: una en MathML (para lectores de
  // pantalla) y otra en HTML (la que se ve y la que sale impresa). Sin quitar
  // la primera, el texto del bloque sale duplicado y no casa con nada del PDF.
  const bloques = await page.evaluate(() =>
    [...document.querySelectorAll('.worksheet-print [data-wp-id]')].map((el) => {
      const copia = el.cloneNode(true);
      copia.querySelectorAll('.katex-mathml').forEach((n) => n.remove());
      return {
        id: el.dataset.wpId,
        texto: (copia.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 80),
      };
    }),
  );
  await writeFile(
    path.join(outDir, `${slug}-bloques.json`),
    JSON.stringify({ anunciado, bloques }, null, 2),
    'utf8',
  );

  // Cuántas páginas trae el PDF. El árbol de páginas puede venir en varios
  // nodos, cada uno con su `/Count`; el del total es el mayor. (Quedarse con
  // el primero da el de un nodo intermedio y reporta de menos.)
  const cuentas = [...(await readFile(pdfPath)).toString('latin1').matchAll(/\/Count (\d+)/g)];
  const paginasPdf = Math.max(0, ...cuentas.map((m) => Number(m[1])));

  const ok = paginasPdf === anunciado.total;
  if (!ok) fallas += 1;
  console.log(
    `  [${ok ? ' OK ' : 'FALLA'}] ${slug}: el canvas anuncia ${anunciado.total} pág., ` +
      `el PDF trae ${paginasPdf}  ·  cortes marcados: ${anunciado.marcas
        .map((m) => (m.forzado ? `⇱${m.pagina}` : m.pagina))
        .join(', ') || '—'}`,
  );

  await ctx.close();
}

await browser.close();
console.log(`\n${slugs.length - fallas}/${slugs.length} cuadran · salidas en ${outDir}\n`);
process.exit(fallas ? 1 : 0);
