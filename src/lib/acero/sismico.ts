// ─────────────────────────────────────────────────────────────────────────────
// Capa sísmica — NCh2369:2025 8.3.1 (capacidades esperadas), 8.6.3 (ductilidad
// de la diagonal comprimida) y Tabla 9 (λ_md).
//
// TODOS los coeficientes de este archivo salen de fuentes que ya están en el
// repo, no de memoria:
//   · λ_md = 0,40·√(E/(R_y·F_y)) para elementos NO atiesados (alas de perfiles
//     I, H) — public/planillas/chevron-nch2369.json, contrastado en 9,96.
//   · λ_md = 0,76·√(E/(R_y·F_y)) para elementos atiesados (paredes de perfiles
//     rectangulares usados como arriostramientos) — chevron-nch2369.json (18,9)
//     y diagonal-hss-traccion.json (16,05).
//   · Esbeltez global L_c/r < 1,5·π·√(E/F_y) — diagonal-hss-traccion.json,
//     contrastado en 113,4. Es exactamente el quiebre elástico/inelástico de
//     AISC (1,5π = 4,712 contra el 4,71 de E3).
//   · F_ye = R_y·F_y, F_ue = R_t·F_u, T_ye = F_ye·A_g, P_ne = 1,14·F_cre·A_g
//     — 8.3.1, en diagonal-hss-traccion.json.
//   · R_y = 1,30 es el valor nacional de C8.3.3, no el 1,5 de AISC 341.
//
// LO QUE NO ESTÁ: la fila de Tabla 9 para ALMAS de perfiles I. Ninguna planilla
// ni post del repo la cita, así que no se implementa — se avisa.
//
// Puro. Unidades: kgf y cm.
// ─────────────────────────────────────────────────────────────────────────────

import { tensionNominal } from './compresion';
import { clasificar } from './clasificacion';
import type { Clasificacion, Geom, Material, Propiedades } from './tipos';

export interface LimiteSismico {
  id: string;
  nombre: string;
  valor: number;
  limite: number;
  ok: boolean;
  ref: string;
}

export interface ResSismico {
  /** F_ye = R_y·F_y de 8.3.1 [kgf/cm²]. */
  Fye: number;
  /** F_ue = R_t·F_u de 8.3.1 [kgf/cm²]. */
  Fue: number;
  /** Capacidad esperada en tracción T_ye = F_ye·A_g [kgf]. */
  Tye: number;
  /** Capacidad esperada en compresión P_ne = 1,14·F_cre·A_g [kgf]. */
  Pne: number;
  Fcre: number;
  /** λ_md aplicable al elemento que gobierna. */
  lambdaMd: number;
  /** 1,5·π·√(E/F_y) de 8.6.3. */
  lambdaGlobal: number;
  limites: LimiteSismico[];
  ok: boolean;
  avisos: string[];
}

/** λ_md de la Tabla 9 para un elemento no atiesado (alas de perfiles I, H). */
export function lambdaMdNoAtiesado(E: number, Fye: number): number {
  return 0.4 * Math.sqrt(E / Fye);
}

/** λ_md de la Tabla 9 para un elemento atiesado (paredes de perfiles rectangulares). */
export function lambdaMdAtiesado(E: number, Fye: number): number {
  return 0.76 * Math.sqrt(E / Fye);
}

/**
 * Verificaciones sísmicas de un miembro que debe ser dúctil (típicamente una
 * diagonal de arriostramiento).
 *
 * @param Fe tensión de pandeo elástico que gobierna, de la cadena de compresión
 * @param lambdaMax la mayor de L_cx/r_x y L_cy/r_y
 */
export function verificarSismico(
  g: Geom,
  mat: Material,
  props: Propiedades,
  Fe: number,
  lambdaMax: number,
  clas?: Clasificacion
): ResSismico {
  const c = clas ?? clasificar(g, mat);
  const { Fy, Fu, E, Ry, Rt } = mat;
  const avisos: string[] = [];

  // ── 8.3.1: capacidades esperadas ──
  const Fye = Ry * Fy;
  const Fue = Rt * Fu;
  const Tye = Fye * props.Ag;
  // F_cre es F_cr evaluado con F_ye en lugar de F_y, y P_ne lleva el factor 1,14.
  const Fcre = tensionNominal(Fe, Fye);
  const Pne = 1.14 * Fcre * props.Ag;

  const limites: LimiteSismico[] = [];

  // ── 8.6.3 + Tabla 9: pandeo local ──
  const lamMdNoAt = lambdaMdNoAtiesado(E, Fye);
  const lamMdAt = lambdaMdAtiesado(E, Fye);
  let lambdaMd: number;

  if (g.familia === 'I') {
    lambdaMd = lamMdNoAt;
    limites.push({
      id: 'nch-ala',
      nombre: 'Ala (elemento no atiesado)',
      valor: c.compresion[0].lambda,
      limite: lamMdNoAt,
      ok: c.compresion[0].lambda <= lamMdNoAt,
      ref: 'NCh2369:2025 Tabla 9, elementos no atiesados',
    });
    avisos.push(
      'El alma del perfil I no se verifica: la fila de la Tabla 9 para almas de perfiles I no está citada en ninguna fuente del repo, así que no se implementó.'
    );
  } else if (g.familia === 'HSS-R') {
    lambdaMd = lamMdAt;
    limites.push({
      id: 'nch-pared-b',
      nombre: 'Pared B (elemento atiesado)',
      valor: c.compresion[0].lambda,
      limite: lamMdAt,
      ok: c.compresion[0].lambda <= lamMdAt,
      ref: 'NCh2369:2025 Tabla 9, elementos atiesados',
    });
    limites.push({
      id: 'nch-pared-h',
      nombre: 'Pared H (elemento atiesado)',
      valor: c.compresion[1].lambda,
      limite: lamMdAt,
      ok: c.compresion[1].lambda <= lamMdAt,
      ref: 'NCh2369:2025 Tabla 9, elementos atiesados',
    });
  } else {
    lambdaMd = lamMdAt;
    avisos.push(
      'El HSS circular no se verifica contra la Tabla 9: su fila (D/t) no está citada en ninguna fuente del repo.'
    );
  }

  // ── 8.6.3: esbeltez global ──
  const lambdaGlobal = 1.5 * Math.PI * Math.sqrt(E / Fy);
  limites.push({
    id: 'nch-esbeltez',
    nombre: 'Esbeltez global L_c/r',
    valor: lambdaMax,
    limite: lambdaGlobal,
    ok: lambdaMax <= lambdaGlobal,
    ref: 'NCh2369:2025 8.6.3',
  });

  return {
    Fye,
    Fue,
    Tye,
    Pne,
    Fcre,
    lambdaMd,
    lambdaGlobal,
    limites,
    ok: limites.every((l) => l.ok),
    avisos,
  };
}
