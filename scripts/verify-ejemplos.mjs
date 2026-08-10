// Verifica el contrato mecánico de ejemplos/ (frontmatter, techo de líneas, estado ↔ referencias,
// secciones obligatorias, INDICE al día) y con --escribir regenera la tabla de INDICE.md desde los
// frontmatter. Lo normativo —que el número sea el de la página rasterizada— no lo decide este script.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve('ejemplos');
const DISCIPLINAS = ['acero', 'hormigon', 'geotecnia'];
const CAMPOS = ['titulo', 'disciplina', 'tema', 'normas', 'fecha', 'estado', 'veredicto', 'post'];
const ESTADOS = ['verificado', 'pendiente'];
const SECCIONES = ['## Caso', '## Supuestos', '## Resumen', '## Veredicto', '## Referencias', '## Para promover a post'];
const TECHO_LINEAS = 150;
const TECHO_PROSA_POR_PASO = 100;
const INICIO = '<!-- INDICE:INICIO -->';
const FIN = '<!-- INDICE:FIN -->';

const escribir = process.argv.includes('--escribir');
const errores = [];
const avisos = [];

function parseFrontmatter(texto) {
  const m = texto.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) return null;
  const campos = {};
  for (const linea of m[1].split(/\r?\n/)) {
    const mm = linea.match(/^([a-z]+):\s*(.*)$/);
    if (mm) campos[mm[1]] = mm[2].trim();
  }
  return campos;
}

function prosaPorPaso(cuerpo) {
  const sinFences = cuerpo.replace(/^```[\s\S]*?^```/gm, '');
  const sinMate = sinFences.replace(/\$\$[^$]*\$\$/g, '').replace(/\$[^$]*\$/g, '');
  const lineas = sinMate.split(/\r?\n/).filter((l) => !l.trimStart().startsWith('|'));
  const palabras = lineas.join(' ').split(/\s+/).filter(Boolean).length;
  const pasos = (cuerpo.match(/^## \d/gm) || []).length;
  return pasos > 0 ? Math.round(palabras / pasos) : null;
}

const memos = [];
for (const disciplina of DISCIPLINAS) {
  const dir = path.join(RAIZ, disciplina);
  for (const nombre of readdirSync(dir).filter((n) => n.endsWith('.md')).sort()) {
    const ruta = `${disciplina}/${nombre}`;
    const texto = readFileSync(path.join(dir, nombre), 'utf8');
    const fm = parseFrontmatter(texto);
    if (!fm) {
      errores.push(`${ruta}: sin frontmatter`);
      continue;
    }
    for (const campo of CAMPOS) {
      if (!(campo in fm)) errores.push(`${ruta}: falta el campo \`${campo}\``);
      else if (campo !== 'post' && fm[campo] === '') errores.push(`${ruta}: el campo \`${campo}\` está vacío`);
    }
    if (fm.estado && !ESTADOS.includes(fm.estado)) errores.push(`${ruta}: estado \`${fm.estado}\` no es ${ESTADOS.join(' | ')}`);
    if (fm.disciplina && fm.disciplina !== disciplina) errores.push(`${ruta}: disciplina \`${fm.disciplina}\` no coincide con la carpeta`);
    if (fm.veredicto && fm.veredicto.includes('|')) errores.push(`${ruta}: el veredicto lleva \`|\` y rompería la tabla del INDICE`);

    const lineas = (texto.match(/\n/g) || []).length;
    if (lineas > TECHO_LINEAS) errores.push(`${ruta}: ${lineas} líneas > techo de ${TECHO_LINEAS}`);

    const cuerpo = texto.replace(/^---[\s\S]*?\r?\n---\r?\n/, '');
    for (const seccion of SECCIONES) {
      if (!new RegExp(`^${seccion}\\s*$`, 'm').test(cuerpo)) errores.push(`${ruta}: falta la sección \`${seccion}\``);
    }
    if (!/^## \d/m.test(cuerpo)) errores.push(`${ruta}: no tiene pasos numerados (\`## 1.\`)`);

    const tienePendiente = cuerpo.includes('⚠ pendiente');
    if (fm.estado === 'verificado' && tienePendiente) errores.push(`${ruta}: estado \`verificado\` con filas \`⚠ pendiente\` en referencias`);
    if (fm.estado === 'pendiente' && !tienePendiente) errores.push(`${ruta}: estado \`pendiente\` sin ninguna fila \`⚠ pendiente\` — debería ser \`verificado\``);

    const prosa = prosaPorPaso(cuerpo);
    if (prosa !== null && prosa > TECHO_PROSA_POR_PASO) avisos.push(`${ruta}: ~${prosa} palabras de prosa por paso (guía: ${TECHO_PROSA_POR_PASO})`);

    memos.push({ ruta, ...fm });
  }
}

memos.sort((a, b) => {
  const d = DISCIPLINAS.indexOf(a.disciplina) - DISCIPLINAS.indexOf(b.disciplina);
  if (d !== 0) return d;
  if (a.tema !== b.tema) return a.tema < b.tema ? -1 : 1;
  return a.ruta < b.ruta ? -1 : 1;
});

const filas = memos.map((m) => `| [${m.titulo}](${m.ruta}) | ${m.disciplina} | ${m.tema} | ${m.estado} | ${m.veredicto} | ${m.post || '—'} |`);
const bloque = [INICIO, '| Caso | Disciplina | Tema | Estado | Veredicto | Post |', '|---|---|---|---|---|---|', ...filas, FIN].join('\n');

const indicePath = path.join(RAIZ, 'INDICE.md');
const indice = readFileSync(indicePath, 'utf8');
const desde = indice.indexOf(INICIO);
const hasta = indice.indexOf(FIN);
if (desde === -1 || hasta === -1) {
  errores.push(`INDICE.md: faltan los marcadores ${INICIO} / ${FIN}`);
} else {
  const actual = indice.slice(desde, hasta + FIN.length);
  if (actual !== bloque) {
    if (escribir) {
      writeFileSync(indicePath, indice.slice(0, desde) + bloque + indice.slice(hasta + FIN.length), 'utf8');
      console.log('INDICE.md: tabla regenerada.');
    } else {
      errores.push('INDICE.md: la tabla no coincide con los frontmatter — corre `npm run ejemplos`');
    }
  }
}

// Guardia de cobertura de los grafos de dependencias: todo memo aparece como nodo en algún
// ```mermaid del INDICE, y todo nodo corresponde a un memo. Que la arista diga la magnitud
// correcta no lo decide este script — eso sale de los `## Supuestos` y lo pone quien la escribe.
const bloques = indice.match(/```mermaid\r?\n[\s\S]*?```/g) || [];
const nodos = new Set();
for (const bloque of bloques) {
  for (const m of bloque.matchAll(/^\s*([a-z0-9][a-z0-9-]*)\[/gm)) nodos.add(m[1]);
}
const slugs = new Set(memos.map((m) => path.basename(m.ruta, '.md')));
if (bloques.length === 0) {
  errores.push('INDICE.md: no hay ningún grafo ```mermaid en «Las estructuras del corpus»');
} else {
  for (const slug of slugs) {
    if (!nodos.has(slug)) errores.push(`INDICE.md: \`${slug}\` no es nodo de ningún grafo — agrégalo a «Las estructuras del corpus»`);
  }
  for (const nodo of nodos) {
    if (!slugs.has(nodo)) errores.push(`INDICE.md: el nodo \`${nodo}\` no corresponde a ningún memo`);
  }
}

for (const aviso of avisos) console.warn(`aviso: ${aviso}`);
if (errores.length) {
  for (const error of errores) console.error(`error: ${error}`);
  process.exit(1);
}
console.log(`${memos.length} memos, contrato OK (${memos.filter((m) => m.estado === 'verificado').length} verificados, ${bloques.length} grafos cubren los ${nodos.size} nodos).`);
