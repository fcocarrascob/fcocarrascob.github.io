#!/usr/bin/env node
// Publica el contrato de la planilla en `public/`, para que tenga una URL estable.
//
//   npm run esquema:planilla            # copia docs/ → public/
//   npm run esquema:planilla -- --check # falla si la copia quedó desactualizada
//
// Por qué existe: `docs/ESQUEMA-PLANILLA.md` es la fuente única del contrato y la
// lee la skill `planilla` desde el repo. Pero un chat de claude.ai no ve el repo,
// y ahí el contrato hace más falta todavía — es el único lugar donde el modelo NO
// puede correr el verificador. Copiándolo a `public/planillas/ESQUEMA.md` queda en
// https://fcocarrascob.github.io/planillas/ESQUEMA.md, pegable en las instrucciones
// de un proyecto.
//
// Se copia en vez de enlazarse porque `docs/` no entra al build: Astro solo publica
// lo que está bajo `public/` y `src/pages/`.

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const ORIGEN = path.join(ROOT, 'docs', 'ESQUEMA-PLANILLA.md');
const DESTINO = path.join(ROOT, 'public', 'planillas', 'ESQUEMA.md');

const check = process.argv.includes('--check');

const AVISO = `<!-- Generado por \`npm run esquema:planilla\` desde docs/ESQUEMA-PLANILLA.md.
     No lo edites acá: los cambios se pierden en la próxima copia. -->

`;

/**
 * Compara ignorando el final de línea.
 *
 * Con `core.autocrlf=true` git reescribe los .md a CRLF al extraerlos, pero el
 * aviso de arriba lleva `\n` literal: una comparación byte a byte daba «quedó
 * atrás» en un archivo idéntico, justo después de un rebase. Lo que se verifica
 * es que el texto sea el mismo, no cómo lo dejó git en el disco.
 */
const norm = (s) => s.replace(/\r\n/g, '\n');

const fuente = await readFile(ORIGEN, 'utf8');
const esperado = norm(AVISO + fuente);

if (check) {
  const actual = existsSync(DESTINO) ? norm(readFileSync(DESTINO, 'utf8')) : null;
  if (actual === esperado) {
    console.log('OK  public/planillas/ESQUEMA.md está al día.');
    process.exit(0);
  }
  console.error(
    actual === null
      ? 'FALLA  falta public/planillas/ESQUEMA.md.'
      : 'FALLA  public/planillas/ESQUEMA.md quedó atrás de docs/ESQUEMA-PLANILLA.md.',
  );
  console.error('       Corre: npm run esquema:planilla');
  process.exit(1);
}

await writeFile(DESTINO, esperado, 'utf8');
console.log(`Publicado  ${path.relative(ROOT, DESTINO)}  (${esperado.length} bytes)`);
