#!/usr/bin/env node
// Rasteriza el esquema paramétrico de una planilla a PNG, para poder MIRARLO.
//
// `verify-planilla.mjs` garantiza que los tokens del SVG resuelven, pero un
// esquema puede cuadrar y verse mal: rótulos encimados, texto que se sale del
// viewBox, un número de 7 dígitos que pisa la línea de al lado. Eso solo se
// detecta viendo el dibujo, y un .svg con `{{tokens}}` no es mirable — hay que
// sustituirlos contra el scope de la hoja y pasarlo por un navegador.
//
//   npm run render:esquema -- public/planillas/<slug>.json   # resuelve y pinta
//   npm run render:esquema -- public/esquemas               # todas (sin scope)
//   npm run render:esquemas                                 # las 7 planillas
//
// Acepta .json (planilla: evalúa la hoja y sustituye los tokens del esquema),
// .svg (lo pinta tal cual; los tokens quedan crudos) o un directorio de
// cualquiera de los dos. Los PNG van a un directorio temporal fuera del repo
// (o a `--out <dir>`) y el script imprime sus rutas absolutas.
//
//   --out <dir>     dónde dejar los PNG (default: <tmp>/struct-pad-esquemas)
//   --scale <n>     factor de rasterizado, default 2 (texto de 9 px legible)
//   --keep-svg      deja también el .svg ya resuelto, junto al PNG
//
// El render usa Chromium (playwright), el mismo motor que dibuja el canvas, así
// que lo que sale del PNG es lo que ve el lector.

import { build } from 'esbuild';
import { chromium } from 'playwright';
import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

const argv = process.argv.slice(2);
const opt = (nombre, def) => {
  const i = argv.indexOf(nombre);
  return i === -1 ? def : argv[i + 1];
};
const outDir = path.resolve(opt('--out', path.join(tmpdir(), 'struct-pad-esquemas')));
const scale = Number(opt('--scale', '2'));
const keepSvg = argv.includes('--keep-svg');
const targets = argv.filter((a, i) => !a.startsWith('--') && !argv[i - 1]?.startsWith('--'));

if (targets.length === 0) {
  console.error('Uso: npm run render:esquema -- <planilla.json | esquema.svg | directorio> [--out dir] [--scale n]');
  process.exit(2);
}

/** Expande directorios a sus .json/.svg (orden alfabético). */
async function resolverEntradas(entradas) {
  const rutas = [];
  for (const t of entradas) {
    const abs = path.resolve(t);
    if ((await stat(abs)).isDirectory()) {
      const hijos = (await readdir(abs))
        .filter((f) => f.endsWith('.json') || f.endsWith('.svg'))
        .sort();
      rutas.push(...hijos.map((f) => path.join(abs, f)));
    } else {
      rutas.push(abs);
    }
  }
  return rutas;
}

/** Compila el motor del canvas (TypeScript) a un módulo importable por Node. */
async function loadEngine() {
  const out = path.join(tmpdir(), `esquema-engine-${process.pid}.mjs`);
  await build({
    entryPoints: [path.join(ROOT, 'src/lib/planilla-engine.ts')],
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

/**
 * Tamaño natural del SVG. Los esquemas se dibujan solo con `viewBox` (el ancho
 * lo pone la región `image`), así que de ahí salen las proporciones.
 */
function tamano(svg) {
  const vb = svg.match(/viewBox\s*=\s*"([^"]+)"/);
  if (vb) {
    const [, , w, h] = vb[1].trim().split(/[\s,]+/).map(Number);
    if (w > 0 && h > 0) return { w, h };
  }
  const w = Number(svg.match(/\swidth\s*=\s*"(\d+(?:\.\d+)?)/)?.[1]);
  const h = Number(svg.match(/\sheight\s*=\s*"(\d+(?:\.\d+)?)/)?.[1]);
  return { w: w || 800, h: h || 600 };
}

const { evaluateSheet, renderEsquema, ESQUEMAS_PREFIX } = await loadEngine();

/** Devuelve los esquemas de una entrada, ya resueltos: [{nombre, svg, nota}]. */
async function esquemasDe(ruta) {
  if (ruta.endsWith('.svg')) {
    const svg = await readFile(ruta, 'utf8');
    const crudos = svg.match(/\{\{[^{}]+\}\}/g)?.length ?? 0;
    return [
      {
        nombre: path.basename(ruta, '.svg'),
        svg,
        nota: crudos ? `${crudos} token(s) SIN resolver (render sin planilla)` : 'sin tokens',
      },
    ];
  }

  const planilla = JSON.parse(await readFile(ruta, 'utf8'));
  const regions = planilla.regions ?? [];
  const results = evaluateSheet(regions);
  const slug = path.basename(ruta, '.json');
  const salida = [];

  const imagenes = regions
    .filter((r) => r.kind === 'image' && r.src.startsWith(ESQUEMAS_PREFIX))
    .sort((a, b) => a.y - b.y || a.x - b.x);

  for (const [i, r] of imagenes.entries()) {
    const svgText = await readFile(path.join(ROOT, 'public', r.src), 'utf8');
    const { svg, tokens, faltantes } = renderEsquema(svgText, results[r.id]?.scope ?? {});
    salida.push({
      nombre: imagenes.length > 1 ? `${slug}-${i + 1}` : slug,
      svg,
      nota:
        `${tokens} tokens resueltos desde ${path.basename(r.src)}` +
        (faltantes.length ? ` · ¡${faltantes.length} SIN RESOLVER: ${faltantes.join(' · ')}!` : ''),
    });
  }
  if (!salida.length) salida.push({ nombre: slug, svg: null, nota: 'la planilla no tiene esquema' });
  return salida;
}

await mkdir(outDir, { recursive: true });
const rutas = await resolverEntradas(targets);
const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: scale });
const pintados = [];
let sinEsquema = 0;

for (const ruta of rutas) {
  for (const { nombre, svg, nota } of await esquemasDe(ruta)) {
    if (!svg) {
      console.log(`  [ -- ] ${nombre}: ${nota}`);
      sinEsquema += 1;
      continue;
    }
    const { w, h } = tamano(svg);
    const png = path.join(outDir, `${nombre}.png`);

    await page.setViewportSize({ width: Math.ceil(w), height: Math.ceil(h) });
    // Fondo blanco explícito: varios esquemas recortan con el viewBox y dejan
    // márgenes transparentes que en un visor oscuro se comen el texto negro.
    await page.setContent(
      `<!doctype html><html><body style="margin:0;background:#fff">${svg}</body></html>`,
      { waitUntil: 'load' },
    );
    await page.evaluate(([w, h]) => {
      const el = document.querySelector('svg');
      el.setAttribute('width', w);
      el.setAttribute('height', h);
      el.style.display = 'block';
    }, [w, h]);
    await page.locator('svg').first().screenshot({ path: png });

    if (keepSvg) await writeFile(path.join(outDir, `${nombre}.svg`), svg, 'utf8');
    pintados.push(png);
    console.log(`  [ OK ] ${nombre}  ${Math.round(w)}×${Math.round(h)} @${scale}x  ·  ${nota}`);
  }
}

await browser.close();

console.log(`\n${pintados.length} PNG en ${outDir}` + (sinEsquema ? ` · ${sinEsquema} sin esquema` : ''));
for (const p of pintados) console.log(`  ${p}`);
console.log('');
