#!/usr/bin/env node
// Verifica una planilla del canvas FUERA del navegador.
//
// Existe para que un ejemplo de cálculo del taller (material_teorico/taller/)
// pueda garantizar sus números sin que nadie los transcriba a mano: la planilla
// es la fuente de verdad y este script la ejecuta con el mismo motor que corre
// en /herramientas/canvas — mismas unidades, mismo chequeo dimensional.
//
//   npm run verify:planilla -- <planilla.json> [...más] [--md]
//   npm run verify:planillas            # todas las de public/planillas/
//
// Acepta uno o más .json, o un directorio (verifica todos sus .json). Sale con
// código 1 si en cualquiera de ellas:
//   - alguna región tiene error (sintaxis, variable indefinida, unidades que no
//     casan — esto último es el motivo principal de que el script exista);
//   - alguna comparación da `false` sin estar declarada en meta.esperadoFalso;
//   - alguna comparación declarada en meta.esperadoFalso da `true` (la excepción
//     quedó obsoleta y hay que borrarla, o el resultado cambió sin que nadie
//     lo notara).
//
// Con --md imprime el desarrollo y los veredictos como tablas Markdown listas
// para pegar en la ficha del taller.
//
// Formato de la planilla: el mismo {version, regions} de export/import del
// canvas, más un bloque `meta` opcional que este script entiende:
//
//   { "version": 1,
//     "meta": { "titulo": "...", "esperadoFalso": { "<id>": "por qué" } },
//     "regions": [ { "id": "...", "kind": "math", "x": 0, "y": 0, "src": "..." } ] }
//
// Las regiones `image` no se evalúan: se cuentan y se omiten del desarrollo.

import { build } from 'esbuild';
import { readFile, readdir, rm, stat } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

const args = process.argv.slice(2);
const emitMd = args.includes('--md');
const targets = args.filter((a) => !a.startsWith('--'));

if (targets.length === 0) {
  console.error('Uso: npm run verify:planilla -- <planilla.json | directorio> [...más] [--md]');
  process.exit(2);
}

/** Expande directorios a sus .json (orden alfabético, para un reporte estable). */
async function resolverPlanillas(entradas) {
  const rutas = [];
  for (const t of entradas) {
    const abs = path.resolve(t);
    if ((await stat(abs)).isDirectory()) {
      const hijos = (await readdir(abs)).filter((f) => f.endsWith('.json')).sort();
      rutas.push(...hijos.map((f) => path.join(abs, f)));
    } else {
      rutas.push(abs);
    }
  }
  return rutas;
}

/** Compila el motor del canvas (TypeScript) a un módulo importable por Node. */
async function loadEngine() {
  const out = path.join(tmpdir(), `worksheet-engine-${process.pid}.mjs`);
  await build({
    entryPoints: [path.join(ROOT, 'src/lib/worksheet.ts')],
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
 * El motor devuelve el resultado como LaTeX (es lo que consume el canvas).
 * Acá se revierte a texto plano para las tablas.
 *
 * En una región `math` solo hay valor que extraer si pedía mostrarlo (un `=`
 * final en el `src`): sin eso, el único `=` del LaTeX es el del operador `{:=}`
 * de la definición, y quedarse con lo que va después devuelve basura. Las
 * regiones `program` (src = null) siempre rinden su valor de retorno.
 */
function valorDeTex(tex, src) {
  if (!tex) return '';
  if (src !== null && !parseMathRegion(src).showResult) return '';
  const i = tex.lastIndexOf('=');
  if (i === -1) return '';
  return tex
    .slice(i + 1)
    .replace(/[\\;~]*\\mathrm\{([^}]*)\}/g, ' $1')
    .replace(/\\cdot\s*10\^\{([+-]?\d+)\}/g, 'e$1')
    .replace(/\\[,;~]/g, ' ')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const { evaluateSheet, parseMathRegion } = await loadEngine();

/** Verifica una planilla; devuelve true si está limpia. */
async function verificar(planillaPath) {
const planilla = JSON.parse(await readFile(planillaPath, 'utf8'));
const regions = planilla.regions ?? [];
const meta = planilla.meta ?? {};
const esperadoFalso = meta.esperadoFalso ?? {};

const results = evaluateSheet(regions);

// Orden de lectura, igual que el canvas: y ascendente, luego x.
const ordenadas = [...regions].sort((a, b) => a.y - b.y || a.x - b.x);

const errores = [];
const verdictos = [];
const filas = [];
let n = 0;
let figuras = 0;

for (const r of ordenadas) {
  if (r.kind === 'text') {
    filas.push({ tipo: 'seccion', texto: r.src });
    continue;
  }
  // Las imágenes no se evalúan; se cuentan y se omiten del desarrollo (su `src`
  // puede ser un data URI de cientos de kB, que no tiene nada que hacer en una tabla).
  if (r.kind === 'image') {
    figuras += 1;
    continue;
  }
  const res = results[r.id] ?? {};
  if (res.error) {
    errores.push({ id: r.id, src: r.src, error: res.error });
    filas.push({ tipo: 'error', src: r.src, error: res.error });
    continue;
  }
  if (typeof res.bool === 'boolean') {
    verdictos.push({ id: r.id, src: r.src, ok: res.bool });
    continue;
  }
  n += 1;
  filas.push({
    tipo: 'paso',
    n,
    src: r.src,
    valor: valorDeTex(res.tex, r.kind === 'program' ? null : r.src),
  });
}

// --- Reporte a consola -------------------------------------------------------

const titulo = meta.titulo ?? path.basename(planillaPath);
console.log(`\nPlanilla: ${titulo}`);
console.log(`Archivo:  ${path.relative(process.cwd(), planillaPath)}`);
console.log(
  `Regiones: ${regions.length}  ·  pasos: ${n}  ·  verificaciones: ${verdictos.length}` +
    (figuras ? `  ·  figuras: ${figuras}` : '') +
    '\n',
);

for (const e of errores) {
  console.log(`  [ERROR] ${e.src}`);
  console.log(`          ${e.error}`);
}

const inesperados = [];
const obsoletos = [];
for (const v of verdictos) {
  const permitido = Object.prototype.hasOwnProperty.call(esperadoFalso, v.id);
  if (v.ok) {
    console.log(`  [ OK  ] ${v.src}`);
    if (permitido) obsoletos.push(v);
  } else if (permitido) {
    console.log(`  [ NO  ] ${v.src}   <- esperado: ${esperadoFalso[v.id]}`);
  } else {
    console.log(`  [FALLA] ${v.src}`);
    inesperados.push(v);
  }
}

// --- Tablas Markdown ---------------------------------------------------------

if (emitMd) {
  const md = [];
  md.push(`\n---\n`);
  let abierta = false;
  const cerrar = () => {
    if (abierta) md.push('');
    abierta = false;
  };
  for (const f of filas) {
    if (f.tipo === 'seccion') {
      cerrar();
      md.push(`**${f.texto}**\n`);
    } else {
      if (!abierta) {
        md.push('| # | Expresión | Resultado |');
        md.push('|---|---|---|');
        abierta = true;
      }
      // Un programa es multilínea; en una celda de tabla va en una sola línea.
      const src = f.src.replace(/\n\s*/g, ' · ');
      if (f.tipo === 'error') md.push(`| — | \`${src}\` | ⚠ ${f.error} |`);
      else md.push(`| ${f.n} | \`${src}\` | ${f.valor} |`);
    }
  }
  cerrar();
  if (verdictos.length) {
    md.push('| Verificación | Veredicto |');
    md.push('|---|---|');
    for (const v of verdictos) {
      const nota = !v.ok && esperadoFalso[v.id] ? ` — ${esperadoFalso[v.id]}` : '';
      md.push(`| \`${v.src.replace(/\s*=\s*$/, '')}\` | ${v.ok ? '✅' : '❌'}${nota} |`);
    }
    md.push('');
  }
  console.log(md.join('\n'));
}

// --- Veredicto ---------------------------------------------------------------

for (const v of obsoletos) {
  console.log(`  [AVISO] "${v.id}" está en meta.esperadoFalso pero ahora pasa: bórralo.`);
}

const falla = errores.length > 0 || inesperados.length > 0 || obsoletos.length > 0;
console.log(
  `\n${falla ? 'FALLA' : 'OK'}: ${errores.length} errores · ` +
    `${inesperados.length} verificaciones no pasan sin declarar · ` +
    `${obsoletos.length} excepciones obsoletas\n`,
);
return !falla;
}

const rutas = await resolverPlanillas(targets);
const fallidas = [];
for (const ruta of rutas) {
  if (!(await verificar(ruta))) fallidas.push(path.relative(process.cwd(), ruta));
}

if (rutas.length > 1) {
  console.log('='.repeat(60));
  if (fallidas.length) {
    console.log(`FALLA: ${fallidas.length} de ${rutas.length} planillas:`);
    for (const f of fallidas) console.log(`  - ${f}`);
  } else {
    console.log(`OK: las ${rutas.length} planillas cuadran.`);
  }
  console.log('');
}
process.exit(fallidas.length ? 1 : 0);
