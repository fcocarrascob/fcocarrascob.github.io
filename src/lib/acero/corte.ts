// ─────────────────────────────────────────────────────────────────────────────
// Corte — AISC 360-22 Cap. G (G2 alma de perfil I, G4 paredes de HSS
// rectangular).
//
// G5 (HSS circular) no está implementado: se reporta como fuera de alcance en
// vez de devolver un número aproximado.
//
// G4 está anclado en public/planillas/viga-hss-flexion.json, que lo verifica en
// las DOS ramas de C_v2 que un tubo alcanza: C_v2 = 1 en el □250×250×10 y
// C_v2 = 0,862 (Ec. G2-10) en el □400×200×6, cuya alma abolla antes de fluir.
// La tercera rama, la Ec. G2-11, pediría un alma mucho más esbelta.
//
// G2 sigue sin ancla: la única planilla que lo toca es la viga carrilera, que es
// monosimétrica y queda fuera de alcance.
//
// Puro. Unidades: kgf y cm.
// ─────────────────────────────────────────────────────────────────────────────

import { alturaAlma, anchoPlanoHss } from './propiedades';
import type { Geom, Material, Propiedades } from './tipos';

export interface ResCorte {
  /** Área de corte del alma [cm²]. */
  Aw: number;
  /** h/t_w del alma. */
  lambda: number;
  /** C_v1 (perfil I) o C_v2 (HSS). */
  Cv: number;
  /** φ_v: 1,00 en la puerta de G2.1(a), 0,90 en el resto. */
  phiV: number;
  Vn: number;
  phiVn: number;
  fueraDeAlcance: boolean;
  avisos: string[];
}

/** k_v para almas sin atiesadores transversales (G2.1(b)(1)). */
const KV_SIN_ATIESADORES = 5.34;

function corteI(
  g: Extract<Geom, { familia: 'I' }>,
  mat: Material
): ResCorte {
  const { Fy, E } = mat;
  const h = alturaAlma(g.d, g.tf);
  const lambda = h / g.tw;
  // G2.1: A_w = d·t_w para perfiles I laminados.
  const Aw = g.d * g.tw;

  // G2.1(a): la puerta que da φ_v = 1,00 — la cumple casi todo perfil laminado.
  if (lambda <= 2.24 * Math.sqrt(E / Fy)) {
    const Vn = 0.6 * Fy * Aw;
    return {
      Aw,
      lambda,
      Cv: 1,
      phiV: 1.0,
      Vn,
      phiVn: 1.0 * Vn,
      fueraDeAlcance: false,
      avisos: [],
    };
  }

  const raizKv = Math.sqrt((KV_SIN_ATIESADORES * E) / Fy);
  const Cv1 = lambda <= 1.1 * raizKv ? 1 : (1.1 * raizKv) / lambda;
  const Vn = 0.6 * Fy * Aw * Cv1;
  return {
    Aw,
    lambda,
    Cv: Cv1,
    phiV: 0.9,
    Vn,
    phiVn: 0.9 * Vn,
    fueraDeAlcance: false,
    avisos: [
      'El alma no cumple G2.1(a): φ_v baja a 0,90 y entra C_v1. Se supuso alma SIN atiesadores transversales (k_v = 5,34).',
    ],
  };
}

function corteHssR(g: Extract<Geom, { familia: 'HSS-R' }>, mat: Material): ResCorte {
  const { Fy, E } = mat;
  // G4: las dos paredes paralelas a la fuerza de corte.
  const h = anchoPlanoHss(g.H, g.t);
  const lambda = h / g.t;
  const Aw = 2 * h * g.t;
  const kv = 5;
  const raizKv = Math.sqrt((kv * E) / Fy);

  // C_v2 de G2.2.
  let Cv2: number;
  if (lambda <= 1.1 * raizKv) Cv2 = 1;
  else if (lambda <= 1.37 * raizKv) Cv2 = (1.1 * raizKv) / lambda;
  else Cv2 = (1.51 * kv * E) / (lambda ** 2 * Fy);

  const Vn = 0.6 * Fy * Aw * Cv2;
  return { Aw, lambda, Cv: Cv2, phiV: 0.9, Vn, phiVn: 0.9 * Vn, fueraDeAlcance: false, avisos: [] };
}

export function verificarCorte(g: Geom, mat: Material, props: Propiedades): ResCorte {
  void props;
  switch (g.familia) {
    case 'I':
      return corteI(g, mat);
    case 'HSS-R':
      return corteHssR(g, mat);
    case 'HSS-C':
      return {
        Aw: 0,
        lambda: g.D / g.t,
        Cv: 0,
        phiV: 0.9,
        Vn: 0,
        phiVn: 0,
        fueraDeAlcance: true,
        avisos: ['El corte de HSS circular (Sección G5) no está implementado.'],
      };
  }
}
