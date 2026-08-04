// ─────────────────────────────────────────────────────────────────────────────
// Fuerzas combinadas — AISC 360-22 Sec. H1.1 (Ecs. H1-1a y H1-1b).
//
// Ancla: public/planillas/viga-columna.json, que cierra el presupuesto en
// u = 0,94 con B₁ = 1,34 sobre el W250×58.
//
// B₁ (P-δ, Apéndice 8) NO se calcula acá: entra multiplicando el momento antes
// de llamar a esta función, porque depende del diagrama de momentos y del
// método de análisis, que son del análisis y no de la sección.
//
// Puro, sin unidades propias — trabaja con ratios.
// ─────────────────────────────────────────────────────────────────────────────

export interface ResInteraccion {
  uP: number;
  uMx: number;
  uMy: number;
  /** El uso total: el lado izquierdo de H1-1a o H1-1b. */
  u: number;
  ecuacion: 'H1-1a' | 'H1-1b';
  ok: boolean;
}

/**
 * @param Pr demanda axial (compresión o tracción) [kgf]
 * @param Pc capacidad axial de diseño φPn [kgf]
 * @param Mrx demanda de momento eje fuerte, YA amplificada por B₁ [kgf·cm]
 * @param Mcx capacidad φMnx [kgf·cm]
 */
export function verificarInteraccion(
  Pr: number,
  Pc: number,
  Mrx: number,
  Mcx: number,
  Mry = 0,
  Mcy = 0
): ResInteraccion {
  const uP = Pc > 0 ? Pr / Pc : Pr > 0 ? Infinity : 0;
  const uMx = Mcx > 0 ? Mrx / Mcx : Mrx > 0 ? Infinity : 0;
  const uMy = Mcy > 0 ? Mry / Mcy : Mry > 0 ? Infinity : 0;

  // H1.1 parte en P_r/P_c = 0,2.
  const ecuacion = uP >= 0.2 ? 'H1-1a' : 'H1-1b';
  const u = uP >= 0.2 ? uP + (8 / 9) * (uMx + uMy) : uP / 2 + (uMx + uMy);

  return { uP, uMx, uMy, u, ecuacion, ok: u <= 1 };
}
