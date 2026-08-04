// ─────────────────────────────────────────────────────────────────────────────
// Compresión — AISC 360-22 Cap. E (E3 pandeo por flexión, E4 torsional y
// flexo-torsional, E7 elementos esbeltos).
//
// La cadena E3/E4 está copiada de public/planillas/columna-galpon-compresion.json,
// que la tiene cerrada contra el post con filas assert a precisión completa.
// E7 NO tiene ancla en las planillas — los cuatro casos de referencia son no
// esbeltos. Se implementa y se declara esa falta de ancla en el resultado.
//
// Puro. Unidades: kgf y cm.
// ─────────────────────────────────────────────────────────────────────────────

import { alturaAlma, anchoPlanoHss } from './propiedades';
import { clasificar, esbeltecesElementos } from './clasificacion';
import type { Clasificacion, Estabilidad, Geom, Material, Propiedades } from './tipos';

/** φ_c de E1, LRFD. */
export const PHI_C = 0.9;

export type ModoCompresion = 'flexional-x' | 'flexional-y' | 'torsional';

export interface ResCompresion {
  lambdaX: number;
  lambdaY: number;
  /** 4,71·√(E/F_y): la frontera E3(a)/E3(b), equivalente a F_y/F_e = 2,25. */
  lambdaLim: number;
  Fex: number;
  Fey: number;
  /** F_ez de la Ec. E4-2. 0 en secciones cerradas (HSS), donde E4 no aplica. */
  Fez: number;
  /** El F_e que gobierna: el menor de los que aplican. */
  Fe: number;
  Fn: number;
  /** Área efectiva de E7. Igual a A_g si no hay elementos esbeltos. */
  Ae: number;
  /** φ_c·F_n·A_e [kgf]. */
  phiPn: number;
  gobierna: ModoCompresion;
  /** true si E7 redujo el área — el resultado no tiene ancla de verificación. */
  aplicaE7: boolean;
  avisos: string[];
}

/**
 * Ecs. E3-2 y E3-3: la tensión nominal a partir de la de pandeo elástico.
 * En 360-22 se llama F_n, no F_cr.
 */
export function tensionNominal(Fe: number, Fy: number): number {
  if (!Number.isFinite(Fe) || Fe <= 0) return 0;
  const q = Fy / Fe;
  // E3-2 (inelástico) si F_y/F_e ≤ 2,25; E3-3 (elástico) si no. La User Note
  // señala que la puerta equivale a L_c/r ≤ 4,71·√(E/F_y).
  return q <= 2.25 ? Fy * Math.pow(0.658, q) : 0.877 * Fe;
}

/** Coeficientes c1 y c2 de la Tabla E7.1. */
function coefsE7(atiesado: boolean): { c1: number; c2: number } {
  return atiesado ? { c1: 0.18, c2: 1.31 } : { c1: 0.22, c2: 1.49 };
}

/**
 * Ancho efectivo de un elemento esbelto (Ecs. E7-2/E7-3, con F_el de la E7-5).
 * Devuelve `b` sin reducir si el elemento no es esbelto.
 */
function anchoEfectivo(
  b: number,
  lambda: number,
  lambdar: number,
  Fy: number,
  Fn: number,
  atiesado: boolean
): number {
  if (lambda <= lambdar || Fn <= 0) return b;
  const { c1, c2 } = coefsE7(atiesado);
  const Fel = Math.pow((c2 * lambdar) / lambda, 2) * Fy;
  const raz = Math.sqrt(Fel / Fn);
  const be = b * (1 - c1 * raz) * raz;
  return Math.min(b, Math.max(0, be));
}

/**
 * Área efectiva de E7. Un solo paso: F_n sale de la sección bruta y con él se
 * calculan los anchos efectivos (la Sección E7 no itera).
 */
function areaEfectiva(
  g: Geom,
  mat: Material,
  props: Propiedades,
  clas: Clasificacion,
  Fn: number
): { Ae: number; aplico: boolean } {
  if (!clas.hayEsbeltoCompresion) return { Ae: props.Ag, aplico: false };
  const { Fy, E } = mat;
  const { ala, alma } = esbeltecesElementos(g);
  const lamAla = clas.compresion[0].lambdar;
  const lamAlma = clas.compresion[1]?.lambdar ?? lamAla;

  if (g.familia === 'I') {
    // Dos alas, cada una con dos salientes de ancho b_f/2 (no atiesadas).
    const bAla = g.bf / 2;
    const beAla = anchoEfectivo(bAla, ala, lamAla, Fy, Fn, false);
    const hAlma = alturaAlma(g.d, g.tf);
    const beAlma = anchoEfectivo(hAlma, alma, lamAlma, Fy, Fn, true);
    const perdida = 4 * (bAla - beAla) * g.tf + (hAlma - beAlma) * g.tw;
    return { Ae: Math.max(0, props.Ag - perdida), aplico: true };
  }

  if (g.familia === 'HSS-R') {
    const bB = anchoPlanoHss(g.B, g.t);
    const bH = anchoPlanoHss(g.H, g.t);
    const beB = anchoEfectivo(bB, ala, lamAla, Fy, Fn, true);
    const beH = anchoEfectivo(bH, alma, lamAlma, Fy, Fn, true);
    const perdida = 2 * (bB - beB) * g.t + 2 * (bH - beH) * g.t;
    return { Ae: Math.max(0, props.Ag - perdida), aplico: true };
  }

  // HSS circular: E7.2 da el área efectiva directa, no un ancho efectivo.
  const dt = g.D / g.t;
  if (dt <= (0.11 * E) / Fy) return { Ae: props.Ag, aplico: false };
  const factor = (0.038 * E) / (Fy * dt) + 2 / 3;
  return { Ae: Math.min(props.Ag, factor * props.Ag), aplico: true };
}

export function verificarCompresion(
  g: Geom,
  mat: Material,
  props: Propiedades,
  est: Estabilidad,
  clas?: Clasificacion
): ResCompresion {
  const { Fy, E, G } = mat;
  const c = clas ?? clasificar(g, mat);
  const avisos: string[] = [];

  const lambdaX = props.rx > 0 ? est.Lcx / props.rx : Infinity;
  const lambdaY = props.ry > 0 ? est.Lcy / props.ry : Infinity;
  const lambdaLim = 4.71 * Math.sqrt(E / Fy);

  // Ec. E3-4 en cada eje.
  const Fex = (Math.PI ** 2 * E) / lambdaX ** 2;
  const Fey = (Math.PI ** 2 * E) / lambdaY ** 2;

  // Ec. E4-2: pandeo torsional del perfil doblemente simétrico en torno al
  // centro de corte. En sección cerrada el alabeo es despreciable y E4 no aplica.
  let Fez = 0;
  const aplicaE4 = g.familia === 'I' && est.Lcz > 0 && props.Cw > 0;
  if (aplicaE4) {
    const Is = props.Ix + props.Iy;
    Fez = ((Math.PI ** 2 * E * props.Cw) / est.Lcz ** 2 + G * props.J) / Is;
  }

  // E4 alcanza al perfil I doblemente simétrico solo cuando la longitud no
  // arriostrada a torsión supera a la lateral (User Note de E4). Se calcula
  // siempre para poner número al margen, pero solo entra al mínimo si la
  // puerta está abierta.
  const candidatos: Array<{ modo: ModoCompresion; Fe: number }> = [
    { modo: 'flexional-x', Fe: Fex },
    { modo: 'flexional-y', Fe: Fey },
  ];
  if (aplicaE4 && est.Lcz > est.Lcy) candidatos.push({ modo: 'torsional', Fe: Fez });

  const menor = candidatos.reduce((a, b) => (b.Fe < a.Fe ? b : a));
  const Fe = menor.Fe;
  const Fn = tensionNominal(Fe, Fy);

  const { Ae, aplico } = areaEfectiva(g, mat, props, c, Fn);
  if (aplico) {
    avisos.push(
      'La sección tiene elementos esbeltos: aplica E7 y el área efectiva es menor que la bruta. ' +
        'Esta rama no tiene ancla de verificación en las planillas publicadas.'
    );
  }
  if (Math.max(lambdaX, lambdaY) > 200) {
    avisos.push('L_c/r > 200. La User Note de E2 recomienda no superarlo (no es un límite obligatorio).');
  }
  if (aplicaE4 && est.Lcz <= est.Lcy && Fez < Fe) {
    avisos.push(
      'F_ez quedó por debajo de F_e, pero E4 no aplica porque L_cz ≤ L_cy (User Note de E4). Revisá el arriostramiento a torsión.'
    );
  }

  return {
    lambdaX,
    lambdaY,
    lambdaLim,
    Fex,
    Fey,
    Fez,
    Fe,
    Fn,
    Ae,
    phiPn: PHI_C * Fn * Ae,
    gobierna: menor.modo,
    aplicaE7: aplico,
    avisos,
  };
}
