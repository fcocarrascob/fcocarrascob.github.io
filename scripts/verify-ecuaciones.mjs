#!/usr/bin/env node
// Verifica que TODA ecuación citada en el código exista en la edición vigente de
// su norma, y mantiene el libro mayor ECUACIONES.md.
//
//   npm run verify:ecuaciones            # verifica; sale 1 si hay huérfanas
//   npm run verify:ecuaciones -- --escribir   # además regenera ECUACIONES.md
//
// POR QUÉ EXISTE. El error que se repite en este repo no es aritmético, es de
// transcripción, y por eso ninguna revisión de resultados lo encuentra. Las
// Ecs. F7-2 y F7-6 vivieron con los coeficientes de 360-10 y coincidían al
// 0,04 %; el `F7-12/F7-13` que arrastraba memoria.ts era la numeración de
// 360-16. Ese segundo caso —citar una ecuación que en la edición vigente NO
// EXISTE— es puramente mecánico y no admite falso positivo: es lo que este
// script decide, y lo decide para siempre.
//
// LO QUE ESTE SCRIPT NO PUEDE DECIDIR, y por eso hay libro mayor: si la FORMA
// ALGEBRAICA es la de la edición vigente, y si el coeficiente salió de la tabla
// correcta. Eso pide mirar la página rasterizada del PDF, y se registra en la
// columna «Revisada» de ECUACIONES.md, que este script preserva y nunca escribe.

import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const ESCRIBIR = process.argv.includes('--escribir');

const VERDE = '\x1b[32m';
const ROJO = '\x1b[31m';
const AMBAR = '\x1b[33m';
const GRIS = '\x1b[90m';
const RESET = '\x1b[0m';

/**
 * Qué norma rige en cada parte del código.
 *
 * Va por carpeta y no en un solo saco porque las letras COLISIONAN entre normas:
 * la E3-1 existe en AISC 360 y en AISC 341 y son ecuaciones distintas. Un
 * archivo puede declarar más de una cuando de verdad mezcla —la placa base cita
 * AISC 360 y ACI 318 en la misma cadena—, y ahí la etiqueta se resuelve contra
 * cualquiera de las dos.
 */
const FUENTES = [
  { prefijo: 'src/lib/acero/', normas: ['aisc360-22'], zona: 'motor' },
  { prefijo: 'src/lib/placaBase', normas: ['aisc360-22', 'aci318-25'], zona: 'motor' },
  { prefijo: 'src/lib/zapata', normas: ['aci318-25'], zona: 'motor' },
  // Los posts entran al mismo control: una ecuación mal citada en una nota o en
  // un ejemplo la ve el lector, que es peor que si vive solo en el código.
  { prefijo: 'src/content/acero/', normas: ['aisc360-22', 'aisc341-22'], zona: 'post' },
  { prefijo: 'src/content/hormigon/', normas: ['aci318-25'], zona: 'post' },
];

const RAICES = ['src/lib', 'src/content'];

const indice = JSON.parse(await readFile(path.join(ROOT, 'data', 'normas-indice.json'), 'utf8'));

// ── Detección de citas ───────────────────────────────────────────────────────
//
// Una cita es explícita: va detrás de «Ec.»/«Ecs.», entre paréntesis, o detrás
// de un artículo. Sin esto, prosa como «H1-1 necesita la capacidad del eje
// débil» se contaría como cita de una ecuación que no existe (las reales son
// H1-1a y H1-1b) y el script gritaría por un comentario bien escrito.
// Dos formas conviven y hay que reconocer las dos:
//
//   · capítulo — «F4-9b», «J3-6c». El sufijo va hasta `d`: la J3-6 se abre en
//     a/b (aplastamiento) y c/d (desgarre), y con `[ab]?` una cita CORRECTA de
//     un post se leía como huérfana.
//   · apéndice — «A-8-3», «A-3-1M». Tres partes, y la M final es la versión
//     métrica, que es la que este sitio cita siempre.
//
// El apéndice va primero en la alternancia: si no, «A-3-1M» se leería como el
// tag de capítulo «A-3» y perdería la mitad.
const TAG = String.raw`(?:[A-H]-\d{1,2}-\d{1,2}[A-Za-z]?|[A-L]\d{0,2}-\d{1,2}[a-d]?)`;
const DETECTORES = [
  new RegExp(String.raw`\((${TAG})\)`, 'g'),
  new RegExp(String.raw`\bEcs?\.\s*(${TAG})`, 'g'),
  // «Ecs. F2-3 y F2-4», «F4-9a, F4-9b o F4-10», «de la F7-8 a la F7-11»,
  // «Ecs. E7-2/E7-3» — la barra separa una cita tanto como la coma.
  new RegExp(String.raw`(?:\by\b|\bo\b|,|/|\ba la\b)\s*(${TAG})`, 'g'),
  new RegExp(String.raw`\b(?:la|las|de la)\s+(${TAG})\b`, 'g'),
];

async function archivos(dir) {
  const out = [];
  for (const e of await readdir(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = path.posix.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await archivos(rel)));
    else if (/\.(ts|tsx|mdx)$/.test(e.name)) out.push(rel);
  }
  return out;
}

const todos = (await Promise.all(RAICES.map(archivos))).flat();
/** Map<`${norma}|${tag}`, {tag, normas, sitios[]}> */
const citas = new Map();
const huerfanas = [];

for (const rel of todos) {
  const fuente = FUENTES.find((f) => rel.startsWith(f.prefijo));
  if (!fuente) continue;
  const lineas = (await readFile(path.join(ROOT, rel), 'utf8')).split('\n');

  for (const [n, linea] of lineas.entries()) {
    const encontrados = new Set();
    for (const re of DETECTORES) {
      re.lastIndex = 0;
      for (const m of linea.matchAll(re)) encontrados.add(m[1]);
    }
    for (const tag of encontrados) {
      let donde = fuente.normas.find((k) => indice.normas[k]?.ecuaciones[tag]);
      const sitio = `${rel}:${n + 1}`;
      // Referencia a la FAMILIA: «H1-1» no existe, pero H1-1a y H1-1b sí, y
      // nombrar el par por su raíz es uso corriente. Se acepta y se marca.
      // No afloja el chequeo real: el F7-12 de 360-16 sigue cayendo, porque no
      // existe ninguna F7-12a que lo respalde.
      let familia = false;
      if (!donde) {
        donde = fuente.normas.find((k) =>
          ['a', 'b'].some((s) => indice.normas[k]?.ecuaciones[tag + s])
        );
        familia = Boolean(donde);
      }
      if (!donde) {
        huerfanas.push({ tag, sitio, normas: fuente.normas, linea: linea.trim() });
        continue;
      }
      const clave = `${donde}|${tag}`;
      if (!citas.has(clave)) citas.set(clave, { norma: donde, tag, sitios: [], familia });
      citas.get(clave).sitios.push(sitio);
    }
  }
}

// ── Reporte ──────────────────────────────────────────────────────────────────

console.log(
  `${GRIS}Índice: ${Object.entries(indice.normas)
    .map(([k, v]) => `${v.nombre} (${Object.keys(v.ecuaciones).length})`)
    .join(' · ')}${RESET}`
);
console.log(`${citas.size} ecuaciones citadas en ${FUENTES.length} zonas del código\n`);

if (huerfanas.length > 0) {
  console.log(`${ROJO}✗ ${huerfanas.length} cita(s) a ecuaciones que NO existen en la edición vigente:${RESET}`);
  for (const h of huerfanas) {
    console.log(`  ${ROJO}${h.tag}${RESET} en ${h.sitio}  ${GRIS}(se buscó en ${h.normas.join(', ')})${RESET}`);
    console.log(`      ${GRIS}${h.linea.slice(0, 110)}${RESET}`);
  }
} else {
  console.log(`${VERDE}✓ toda ecuación citada existe en la edición que declara CLAUDE.md${RESET}`);
}

// ── Libro mayor ──────────────────────────────────────────────────────────────
//
// Las columnas «Ancla» y «Revisada» las escribe una persona (o el auditor); el
// script las LEE del archivo existente y las devuelve intactas. Un libro mayor
// que se regenera entero se vacía solo y deja de ser una fuente de verdad.

const DESTINO = path.join(ROOT, 'ECUACIONES.md');

/**
 * Las dos ULTIMAS celdas de la fila son las humanas, se lea la tabla con las
 * columnas que se lea. Parsear por posición desde la izquierda ataba el archivo
 * a un número de columnas y se rompía al agregar una.
 */
function celdasDeFila(linea) {
  const m = linea.match(/^\|\s*`?([A-L]\d{0,2}-\d{1,2}[a-d]?)`?\s*\|(.*)\|\s*$/);
  if (!m) return null;
  const celdas = m[2].split('|').map((s) => s.trim());
  if (celdas.length < 2) return null;
  return { tag: m[1], ancla: celdas.at(-2), revisada: celdas.at(-1) };
}

/**
 * Si la ecuación está citada en el motor, en la memoria, o en las dos.
 *
 * Es lo que decide si tiene DOBLE ENTRADA: el motor TS y la cadena que la
 * memoria hace evaluar a mathjs son dos implementaciones independientes, y una
 * ecuación que solo vive en una no está contrastada contra nada aunque su
 * número se vea bien. Ojo con qué mide: mide la CITA, no la implementación. Una
 * fila `motor` puede significar que la memoria sí la calcula pero sin escribir
 * su número — que también hay que arreglar, porque la regla de citar aplica a
 * las dos.
 */
function dobleEntrada(sitios) {
  const mem = sitios.some((s) => s.includes('memoria.ts'));
  const motor = sitios.some((s) => s.startsWith('src/lib/') && !s.includes('memoria.ts'));
  if (mem && motor) return '✅';
  if (mem) return '`solo memoria`';
  if (motor) return '`solo motor`';
  // Ni motor ni memoria: la cita solo un post. No es que le falte una
  // implementación — es que no hay ninguna, y su número no lo comprueba nada.
  return '`solo prosa`';
}

async function columnasHumanas() {
  const previo = new Map();
  let texto;
  try {
    texto = await readFile(DESTINO, 'utf8');
  } catch {
    return previo;
  }
  let norma = null;
  for (const linea of texto.split('\n')) {
    const h = linea.match(/^##\s+.*`([a-z0-9-]+)`/);
    if (h) norma = h[1];
    const c = celdasDeFila(linea);
    if (c && norma) previo.set(`${norma}|${c.tag}`, { ancla: c.ancla, revisada: c.revisada });
  }
  return previo;
}

function orden(a, b) {
  const p = (t) => [t[0], parseInt(t.slice(1).split('-')[0] || '0', 10), parseInt(t.split('-')[1], 10), t];
  const [a1, a2, a3, a4] = p(a.tag);
  const [b1, b2, b3, b4] = p(b.tag);
  return a1.localeCompare(b1) || a2 - b2 || a3 - b3 || a4.localeCompare(b4);
}

if (ESCRIBIR) {
  const previo = await columnasHumanas();
  const porNorma = new Map();
  for (const c of citas.values()) {
    if (!porNorma.has(c.norma)) porNorma.set(c.norma, []);
    porNorma.get(c.norma).push(c);
  }

  const L = [];
  L.push('# ECUACIONES.md — libro mayor de procedencia');
  L.push('');
  L.push('Una fila por ecuación implementada en un motor del sitio: de qué norma y edición');
  L.push('sale, dónde vive en el código, con qué se ancla y cuándo se leyó en el PDF.');
  L.push('');
  L.push('**Las columnas «Ec.» y «Dónde» las genera `npm run verify:ecuaciones -- --escribir`');
  L.push('y se pisan en cada corrida. Las columnas «Ancla» y «Revisada» las escribes tú y el');
  L.push('script las preserva** — son el estado de la auditoría y no se derivan de nada.');
  L.push('');
  L.push('## Qué garantiza cada columna');
  L.push('');
  L.push('- **Ec.** — la etiqueta citada. Que exista en la edición vigente lo verifica el');
  L.push('  script y no admite falso positivo: es el chequeo que habría cazado el');
  L.push('  `F7-12/F7-13` de 360-16 el día que se escribió.');
  L.push('- **Dónde** — todos los sitios que la citan: motores (`acero/…`) y posts');
  L.push('  (`acero/ejemplo-…mdx`). Los posts entran al mismo control porque una ecuación mal');
  L.push('  citada en una nota la ve el lector, que es peor que si vive solo en el código.');
  L.push('- **Doble entrada** — si la citan las DOS implementaciones: el motor TS y la cadena');
  L.push('  que la memoria hace evaluar a mathjs. Una ecuación que vive en una sola no está');
  L.push('  contrastada contra nada aunque su número se vea bien. `solo prosa` es que ningún');
  L.push('  motor la implementa: aparece en un post y nada comprueba su número. Lo deriva el');
  L.push('  script, y mide la CITA, no la implementación: un `solo motor` puede significar que');
  L.push('  la memoria sí la calcula pero sin escribir su número, que también hay que arreglar.');
  L.push('- **Ancla** — qué fija su valor. `planilla:<slug>` si una planilla publicada la');
  L.push('  cierra, `continuidad` si la fija una identidad en una frontera de tabla, `—` si');
  L.push('  no la fija nada. Las filas con `—` son el backlog de riesgo.');
  L.push('- **Revisada** — `sha` o fecha en que alguien abrió la **página rasterizada** del');
  L.push('  PDF y comparó la forma algebraica y el origen del coeficiente. `⬜` es «nadie la');
  L.push('  miró todavía», que es distinto de «está mal» y distinto de «está bien».');
  L.push('');
  L.push('El script decide si el NÚMERO existe. Si la FORMA es la correcta no lo puede');
  L.push('decidir nadie sin abrir el PDF, y por eso esa columna es a mano. Ver la regla de');
  L.push('fuentes normativas en `CLAUDE.md`: la capa de texto del PDF no sirve para leer una');
  L.push('ecuación —destruye el cociente y convierte φ en `f`—, así que se rasteriza.');
  L.push('');

  // ── Estado, arriba de todo ──
  // El libro mayor ES el backlog: sin este resumen hay que recorrer 66 filas
  // para saber qué falta, y eso es lo que hace que una tabla así se abandone.
  const conAncla = (c) => (previo.get(`${c.norma}|${c.tag}`)?.ancla ?? '—').trim() || '—';
  const revisada = (c) => (previo.get(`${c.norma}|${c.tag}`)?.revisada ?? '⬜').trim() || '⬜';
  const reparto = new Map();
  for (const c of citas.values()) reparto.set(conAncla(c), (reparto.get(conAncla(c)) ?? 0) + 1);
  const sinAncla = [...citas.values()].filter((c) => conAncla(c) === '—').sort(orden);
  const sinRevisarLista = [...citas.values()].filter((c) => revisada(c) === '⬜').sort(orden);

  L.push('## Estado');
  L.push('');
  L.push(`${citas.size} ecuaciones citadas · ${citas.size - sinRevisarLista.length} revisadas contra el PDF rasterizado.`);
  L.push('');
  L.push('| Ancla | Ecuaciones |');
  L.push('|---|---:|');
  for (const [k, v] of [...reparto].sort((a, b) => b[1] - a[1])) L.push(`| ${k} | ${v} |`);
  L.push('');
  if (sinAncla.length > 0) {
    L.push(`**Sin ancla de ningún tipo (${sinAncla.length}).** Están implementadas y nada fija su`);
    L.push('valor: ni una planilla publicada, ni una identidad de continuidad. Un error acá');
    L.push('nunca se manifestó, así que es el backlog de mayor riesgo (van por número, no por');
    L.push('prioridad):');
    L.push('');
    L.push(sinAncla.map((c) => `\`${c.tag}\``).join(' · '));
    L.push('');
  }
  const sinDoble = [...citas.values()].filter((c) => dobleEntrada(c.sitios) !== '✅').sort(orden);
  if (sinDoble.length > 0) {
    L.push(`**Sin doble entrada (${sinDoble.length}).** Las cita una sola de las dos`);
    L.push('implementaciones, así que ningún contraste las mira:');
    L.push('');
    L.push(sinDoble.map((c) => `\`${c.tag}\` ${dobleEntrada(c.sitios).replace(/`/g, '')}`).join(' · '));
    L.push('');
  }
  if (sinRevisarLista.length > 0) {
    L.push(`**Sin revisar contra el PDF (${sinRevisarLista.length}).** Nadie abrió todavía la página`);
    L.push('rasterizada para comparar la forma algebraica y el origen del coeficiente:');
    L.push('');
    L.push(sinRevisarLista.map((c) => `\`${c.tag}\``).join(' · '));
    L.push('');
  }

  for (const [clave, lista] of [...porNorma].sort()) {
    const meta = indice.normas[clave];
    L.push(`## ${meta.nombre} — \`${clave}\``);
    L.push('');
    L.push(`PDF: \`${meta.pdf}\``);
    L.push('');
    L.push('| Ec. | Dónde | Doble entrada | Ancla | Revisada |');
    L.push('|---|---|---|---|---|');
    for (const c of lista.sort(orden)) {
      const h = previo.get(`${clave}|${c.tag}`) ?? { ancla: '—', revisada: '⬜' };
      const sitios = c.sitios.map((s) => `\`${s.replace(/^src\/(lib|content)\//, '')}\``).join(' ');
      const etiqueta = c.familia ? `\`${c.tag}\` *(familia)*` : `\`${c.tag}\``;
      L.push(
        `| ${etiqueta} | ${sitios} | ${dobleEntrada(c.sitios)} | ${h.ancla || '—'} | ${h.revisada || '⬜'} |`
      );
    }
    L.push('');
  }

  L.push('---');
  L.push('');
  L.push(`Índice de normas regenerado con \`npm run indice:normas\` (${indice.generado}).`);
  L.push('Su fuente son las extracciones de `material_teorico/_procesamiento/raw/normas`,');
  L.push('cuyo inventario de etiquetas se contrastó contra el PDF: para AISC 360-22 coinciden');
  L.push('EXACTO en los ocho capítulos ingeridos (B 2, C 3, D 5, E 30, F 105, G 25, H 16,');
  L.push('J 41). Los Caps. I y K no están ingeridos y ninguna herramienta los toca.');
  L.push('');

  await writeFile(DESTINO, L.join('\n'), 'utf8');
  const sinRevisar = [...citas.values()].filter(
    (c) => (previo.get(`${c.norma}|${c.tag}`)?.revisada ?? '⬜') === '⬜'
  ).length;
  console.log(
    `\n→ ECUACIONES.md · ${citas.size} filas, ${AMBAR}${sinRevisar} sin revisar${RESET}`
  );
}

process.exit(huerfanas.length > 0 ? 1 : 0);
