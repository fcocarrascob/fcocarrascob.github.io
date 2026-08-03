// Enlace post → planilla del canvas, resuelto en el build.
//
// El enlace se escribía a mano en cada post, y por eso el 2026-08-02 faltaba en
// 8 de las 21 planillas publicadas — las 7 de la tanda de acero del 2026-08-01
// se saltaron todas juntas. La relación no necesita declararse: el slug de la
// planilla es el id del post sin el prefijo `ejemplo-`, que es la convención con
// la que se nombraron las 21. Resolviéndola acá, un post que estrena planilla
// queda enlazado por existir el archivo, sin que nadie tenga que acordarse.
//
// Se exige el prefijo `ejemplo-` a propósito: sin él, un post del blog que
// compartiera nombre con una planilla se enlazaría solo, por accidente.

import { existsSync } from 'node:fs';
import path from 'node:path';

const PREFIJO = 'ejemplo-';
const DIR = path.resolve(process.cwd(), 'public', 'planillas');

export interface PlanillaLink {
  /** Slug de la planilla (el del post sin `ejemplo-`). */
  slug: string;
  /** Deep-link al canvas, que la importa al abrir. */
  canvas: string;
  /** El JSON crudo, para descargarlo o correrlo con `verify:planilla`. */
  json: string;
}

/** La planilla de un post, si existe el archivo. `undefined` si no. */
export function planillaDePost(postId: string | undefined): PlanillaLink | undefined {
  if (!postId?.startsWith(PREFIJO)) return undefined;
  const slug = postId.slice(PREFIJO.length);
  if (!existsSync(path.join(DIR, `${slug}.json`))) return undefined;
  return {
    slug,
    canvas: `/herramientas/canvas?planilla=${slug}`,
    json: `/planillas/${slug}.json`,
  };
}
