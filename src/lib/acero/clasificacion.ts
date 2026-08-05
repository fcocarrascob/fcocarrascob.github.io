// ─────────────────────────────────────────────────────────────────────────────
// Clasificación de elementos comprimidos — AISC 360-22 Tablas B4.1a y B4.1b.
//
// Son DOS tablas distintas y la confusión entre ellas es el error clásico:
//   B4.1a (compresión uniforme) da solo λr — la frontera no-esbelto / esbelto,
//         que decide si aplica E7.
//   B4.1b (flexión) da λp y λr — compacta / no compacta / esbelta, que decide
//         si aplica F2 o F3/F4.
//
// Los coeficientes marcados ✓ están confirmados contra las planillas publicadas.
// Puro, sin dependencias.
// ─────────────────────────────────────────────────────────────────────────────

import { alturaAlma, anchoPlanoHss } from './propiedades';
import type { Clase, Clasificacion, ElementoClasificado, Geom, Material } from './tipos';

/**
 * k_c del User Note de la Tabla B4.1, para almas de perfiles armados.
 * Acotado a [0,35 · 0,76].
 */
export function kc(hSobreTw: number): number {
  return Math.min(0.76, Math.max(0.35, 4 / Math.sqrt(hSobreTw)));
}

function clasePorLambda(lambda: number, lambdap: number | undefined, lambdar: number): Clase {
  if (lambdap !== undefined && lambda <= lambdap) return 'compacta';
  if (lambda <= lambdar) return lambdap === undefined ? 'compacta' : 'no-compacta';
  return 'esbelta';
}

function el(
  id: string,
  nombre: string,
  lambda: number,
  lambdar: number,
  ref: string,
  lambdap?: number
): ElementoClasificado {
  return { id, nombre, lambda, lambdap, lambdar, clase: clasePorLambda(lambda, lambdap, lambdar), ref };
}

/** Esbelteces de cada elemento de la sección. */
export function esbeltecesElementos(g: Geom): { ala: number; alma: number } {
  switch (g.familia) {
    case 'I':
      return { ala: g.bf / (2 * g.tf), alma: alturaAlma(g.d, g.tf) / g.tw };
    case 'HSS-R':
      // Flexión en torno al eje fuerte: el "ala" es la pared de ancho B (la
      // comprimida), el "alma" la de altura H.
      return { ala: anchoPlanoHss(g.B, g.t) / g.t, alma: anchoPlanoHss(g.H, g.t) / g.t };
    case 'HSS-C':
      return { ala: g.D / g.t, alma: g.D / g.t };
  }
}

export function clasificar(g: Geom, mat: Material): Clasificacion {
  const { Fy, E } = mat;
  const raiz = Math.sqrt(E / Fy);
  const { ala, alma } = esbeltecesElementos(g);

  const compresion: ElementoClasificado[] = [];
  const flexion: ElementoClasificado[] = [];

  if (g.familia === 'I') {
    // ── Compresión (Tabla B4.1a) ──
    const lamRfComp =
      g.tipo === 'laminado'
        ? 0.56 * raiz // ✓ caso 1, alas de perfiles I laminados
        : 0.64 * Math.sqrt((kc(alma) * E) / Fy); // caso 2, alas de perfiles I armados
    compresion.push(
      el(
        'ala-c',
        'Ala (compresión uniforme)',
        ala,
        lamRfComp,
        g.tipo === 'laminado' ? 'Tabla B4.1a caso 1' : 'Tabla B4.1a caso 2'
      )
    );
    compresion.push(el('alma-c', 'Alma (compresión uniforme)', alma, 1.49 * raiz, 'Tabla B4.1a caso 5')); // ✓

    // ── Flexión (Tabla B4.1b) ──
    const lamPf = 0.38 * raiz; // ✓ caso 10
    const lamRf =
      g.tipo === 'laminado'
        ? 1.0 * raiz // caso 10
        : 0.95 * Math.sqrt((kc(alma) * E) / (0.7 * Fy)); // caso 11, con F_L = 0,7·F_y
    flexion.push(
      el(
        'ala-f',
        'Ala (flexión)',
        ala,
        lamRf,
        g.tipo === 'laminado' ? 'Tabla B4.1b caso 10' : 'Tabla B4.1b caso 11',
        lamPf
      )
    );
    flexion.push(
      el('alma-f', 'Alma (flexión)', alma, 5.7 * raiz, 'Tabla B4.1b caso 15', 3.76 * raiz) // ✓ λp
    );
  } else if (g.familia === 'HSS-R') {
    // ── Compresión: las dos paredes contra el mismo λr ──
    const lamRc = 1.4 * raiz; // ✓ caso 6, paredes de HSS rectangular
    compresion.push(el('ala-c', 'Pared B (compresión uniforme)', ala, lamRc, 'Tabla B4.1a caso 6'));
    compresion.push(el('alma-c', 'Pared H (compresión uniforme)', alma, lamRc, 'Tabla B4.1a caso 6'));

    // ── Flexión: el ala comprimida y el alma tienen límites distintos ──
    flexion.push(el('ala-f', 'Ala de HSS (flexión)', ala, 1.4 * raiz, 'Tabla B4.1b, alas de HSS', 1.12 * raiz));
    flexion.push(el('alma-f', 'Alma de HSS (flexión)', alma, 5.7 * raiz, 'Tabla B4.1b, almas de HSS', 2.42 * raiz));
  } else {
    // ── HSS circular: un solo elemento, y los límites van con E/F_y sin raíz ──
    const dt = ala;
    compresion.push(el('pared-c', 'Pared (compresión uniforme)', dt, (0.11 * E) / Fy, 'Tabla B4.1a, HSS circular'));
    flexion.push(
      el('pared-f', 'Pared (flexión)', dt, (0.31 * E) / Fy, 'Tabla B4.1b, HSS circular', (0.07 * E) / Fy)
    );
  }

  return {
    compresion,
    flexion,
    hayEsbeltoCompresion: compresion.some((e) => e.clase === 'esbelta'),
    claseAlaFlexion: flexion[0].clase,
    claseAlmaFlexion: flexion[1] ? flexion[1].clase : flexion[0].clase,
  };
}
