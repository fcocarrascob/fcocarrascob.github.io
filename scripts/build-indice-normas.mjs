#!/usr/bin/env node
// Construye data/normas-indice.json: el inventario de qué ecuaciones EXISTEN en
// cada norma, por edición.
//
//   npm run indice:normas
//
// ¿Por qué un índice versionado y no leer el PDF en cada corrida? Porque la
// fuente vive fuera del repo (los PDF en OneDrive, las extracciones en
// material_teorico), así que se congela acá un artefacto chico y revisable, y
// regenerarlo es un paso deliberado que deja diff.
//
// LA FUENTE SON LAS EXTRACCIONES DE material_teorico, no el PDF, y eso está
// verificado: para AISC 360-22 el inventario de etiquetas coincide EXACTO con
// el del PDF en los ocho capítulos ingeridos — B 2, C 3, D 5, E 30, F 105,
// G 25, H 16 y J 41. Los Caps. I y K no están ingeridos, y ninguna herramienta
// del sitio los toca.
//
// Ojo con dos artefactos de la extracción, ya contemplados en el regex:
//   · la J4-5 sale escrita «(J 4-5)», con un espacio después de la letra;
//   · Ω se degrada a W en algunos párrafos (no afecta a las etiquetas).
//
// El índice dice qué ecuaciones EXISTEN. No dice qué dicen: para transcribir una
// ecuación sigue mandando la página rasterizada del PDF (ver CLAUDE.md).

import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const RAW = 'F:/Proyectos_Python/material_teorico/_procesamiento/raw/normas';

/**
 * Las normas que el sitio cita, con la edición vigente de CLAUDE.md.
 *
 * `patron` distingue las dos formas de numerar: AISC etiqueta por capítulo
 * («F4-9b») y ACI por sección («22.5.1.10a»). Las letras de AISC COLISIONAN
 * entre 360 y 341 —la E3-1 existe en las dos y son ecuaciones distintas—, que es
 * justo por lo que el índice va por norma y no en un solo saco.
 */
const NORMAS = {
  'aisc360-22': {
    nombre: 'AISC 360-22',
    pdf: 'F:/OneDrive/Ingenieria/Normas/A360-22W-ewr.pdf',
    dir: 'aisc360-22',
    patron: 'aisc',
  },
  'aisc341-22': {
    nombre: 'AISC 341-22',
    pdf: 'F:/OneDrive/Ingenieria/Normas/A341-22W-oke.pdf',
    dir: 'aisc341-22',
    patron: 'aisc',
  },
  'aci318-25': {
    nombre: 'ACI 318-25 (SI)',
    pdf: 'F:/OneDrive/Ingenieria/Normas/ACI 318-25_SI.pdf',
    dir: 'aci318-25',
    patron: 'aci',
  },
  // La DG1 es el caso raro: no es norma sino guía, y no está ingerida en
  // material_teorico, así que NO tiene extracciones. Su inventario sale entero
  // del PDF vía `python scripts/extraer-tags-pdf.py`, y por eso `dir` es null.
  // Entra al índice igual porque la serie de placas base la cita de punta a
  // punta, y una ecuación mal citada la ve el lector venga de donde venga.
  'dg1-3ed': {
    nombre: 'AISC Design Guide 1, 3.ª ed.',
    pdf: 'F:/OneDrive/Ingenieria/Normas/AISC Design Guide 1 - 3rd Edition.pdf',
    dir: null,
    patron: 'dg1',
  },
};

// Los `\s?` son por la «(J 4-5)», donde la extracción mete un espacio ENTRE la
// letra y el dígito del capítulo.
//
// El sufijo va HASTA d, no hasta b: la J3-6 se abre en J3-6a/b (aplastamiento)
// y J3-6c/d (desgarre). Con `[ab]?` faltaban las dos últimas, y el contraste
// contra el PDF no lo detectaba porque corría el MISMO regex de los dos lados
// — los dos equivocados igual, que es exactamente el modo de falla que este
// aparato existe para cerrar.
const PATRONES = {
  aisc: /\(([A-L])\s?(\d{0,2})\s?-\s?(\d{1,2})([a-d])?\)/g,
  aci: /\((\d{1,2}(?:\.\d{1,2}){2,3})([a-d])?\)/g,
};

/** Las etiquetas del comentario van como «(C-F4-1)» y el regex no las toma. */
function extraer(texto, patron) {
  const re = new RegExp(PATRONES[patron].source, 'g');
  const out = [];
  for (const m of texto.matchAll(re)) {
    out.push(
      patron === 'aisc' ? `${m[1]}${m[2]}-${m[3]}${m[4] ?? ''}` : `${m[1]}${m[2] ?? ''}`
    );
  }
  return out;
}

// Los apéndices NO están en las extracciones de la wiki, y los posts publicados
// los citan: la Ec. A-3-1M (fatiga, viga carrilera) y las A-8-3/A-8-5 (el B₁ de
// segundo orden). Salen del PDF con `python scripts/extraer-tags-pdf.py`, que
// deja data/normas-apendices.json, y se fusionan acá.
let apendices = {};
try {
  apendices = JSON.parse(await readFile(path.join(ROOT, 'data', 'normas-apendices.json'), 'utf8'));
} catch {
  console.warn('· sin data/normas-apendices.json — corré `python scripts/extraer-tags-pdf.py`');
}

const indice = { generado: new Date().toISOString().slice(0, 10), fuente: RAW, normas: {} };

for (const [clave, cfg] of Object.entries(NORMAS)) {
  // `dir: null` = documento sin extracciones en la wiki; su inventario entero
  // viene del PDF (ver el bloque de apéndices más abajo).
  const dir = cfg.dir ? path.join(RAW, cfg.dir) : null;
  let archivos = [];
  if (dir) {
    try {
      archivos = (await readdir(dir)).filter((f) => f.endsWith('.txt') && !f.startsWith('com'));
    } catch {
      console.error(`✗ no se pudo leer ${dir} — ¿está montado material_teorico?`);
      process.exit(1);
    }
  }

  const ecuaciones = {};
  for (const f of archivos.sort()) {
    const texto = await readFile(path.join(dir, f), 'utf8');
    for (const tag of extraer(texto, cfg.patron)) {
      // La primera aparición gana: es donde la norma la define.
      if (!ecuaciones[tag]) ecuaciones[tag] = f;
    }
  }

  const deApendice = apendices[clave] ?? {};
  for (const [tag, origen] of Object.entries(deApendice)) ecuaciones[tag] ??= origen;

  indice.normas[clave] = {
    nombre: cfg.nombre,
    pdf: cfg.pdf,
    patron: cfg.patron,
    archivos: archivos.sort(),
    ecuaciones,
  };
  const nPdf = Object.keys(deApendice).length;
  console.log(
    `${cfg.nombre.padEnd(28)} ${String(Object.keys(ecuaciones).length).padStart(3)} ecuaciones` +
      (archivos.length ? ` · ${archivos.length} archivos` : ' · sin extracciones en la wiki') +
      (nPdf ? ` · ${nPdf} del PDF` : '')
  );
}

const destino = path.join(ROOT, 'data', 'normas-indice.json');
await writeFile(destino, JSON.stringify(indice, null, 2) + '\n', 'utf8');
console.log(`\n→ ${path.relative(ROOT, destino)}`);
