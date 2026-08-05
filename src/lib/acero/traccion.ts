// ─────────────────────────────────────────────────────────────────────────────
// Tracción — AISC 360-22 Sec. D2 (fluencia en el área bruta y rotura en el
// área neta efectiva).
//
// D2-2 depende de la CONEXIÓN, que esta herramienta no conoce: `A_n` y `U`
// entran como dato opcional. Sin ellos solo corre D2-1 y se avisa — no se
// supone U = 1, que sería no conservador en casi cualquier conexión real.
//
// Ancla: public/planillas/diagonal-hss-traccion.json (D2-1 → 68,7 tonf y
// D2-2 con el Caso 5 de la Tabla D3.1 → 48,4 tonf en el HSS 4×4×¼).
//
// Puro. Unidades: kgf y cm.
// ─────────────────────────────────────────────────────────────────────────────

import type { DatosTraccion, Material, Propiedades } from './tipos';

/** φ_t de D2(a) — fluencia. */
export const PHI_T_FLUENCIA = 0.9;
/** φ_t de D2(b) — rotura. */
export const PHI_T_ROTURA = 0.75;

export interface ResTraccion {
  /** φ_t·F_y·A_g de la Ec. D2-1 [kgf]. */
  phiPnFluencia: number;
  /** φ_t·F_u·A_e de la Ec. D2-2. undefined si no se declararon A_n y U. */
  phiPnRotura?: number;
  Ae?: number;
  phiPn: number;
  gobierna: 'fluencia' | 'rotura';
  avisos: string[];
}

export function verificarTraccion(
  mat: Material,
  props: Propiedades,
  datos?: DatosTraccion
): ResTraccion {
  const avisos: string[] = [];
  const phiPnFluencia = PHI_T_FLUENCIA * mat.Fy * props.Ag; // Ec. D2-1

  const An = datos?.An;
  const U = datos?.U;
  if (An === undefined || U === undefined) {
    avisos.push(
      'Rotura en el área neta (D2-2) no verificada: falta A_n y U, que dependen de la conexión. ' +
        'En una diagonal ranurada la rotura suele gobernar sobre la fluencia.'
    );
    return { phiPnFluencia, phiPn: phiPnFluencia, gobierna: 'fluencia', avisos };
  }

  const Ae = An * U; // Ec. D3-1
  const phiPnRotura = PHI_T_ROTURA * mat.Fu * Ae; // Ec. D2-2
  const phiPn = Math.min(phiPnFluencia, phiPnRotura);

  return {
    phiPnFluencia,
    phiPnRotura,
    Ae,
    phiPn,
    gobierna: phiPnRotura < phiPnFluencia ? 'rotura' : 'fluencia',
    avisos,
  };
}
