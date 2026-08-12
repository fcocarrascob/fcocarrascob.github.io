// ─────────────────────────────────────────────────────────────────────────────
// El elemento viga de Euler-Bernoulli: su matriz de rigidez y las cargas
// nodales equivalentes de una carga distribuida trapecial.
//
// GDL locales en orden [v_i, θ_i, v_j, θ_j], con v hacia arriba y θ antihorario
// (ver la convención completa en `tipos.ts`).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Matriz de rigidez del elemento, 4×4.
 *
 *   k = (EI/L³) · ⎡ 12    6L   −12    6L ⎤
 *                 ⎢ 6L   4L²   −6L   2L² ⎥
 *                 ⎢−12   −6L    12   −6L ⎥
 *                 ⎣ 6L   2L²   −6L   4L² ⎦
 */
export function rigidezElemento(EI: number, L: number): number[][] {
  const c = EI / (L * L * L);
  const L2 = L * L;
  return [
    [12 * c, 6 * L * c, -12 * c, 6 * L * c],
    [6 * L * c, 4 * L2 * c, -6 * L * c, 2 * L2 * c],
    [-12 * c, -6 * L * c, 12 * c, -6 * L * c],
    [6 * L * c, 2 * L2 * c, -6 * L * c, 4 * L2 * c],
  ];
}

/**
 * Cargas nodales equivalentes de una carga trapecial que va de `wA` en el nodo
 * i a `wB` en el j, ambas en kN/m HACIA ABAJO, repartida en todo el elemento.
 *
 * Se descompone en una parte uniforme `wu = wA` más una triangular
 * `wt = wB − wA` que crece hacia j:
 *
 *   uniforme:    Fv = wu·L/2  en cada nodo,   M = ∓wu·L²/12
 *   triangular:  Fv = 3wt·L/20 en i y 7wt·L/20 en j,   M = −wt·L²/30 y +wt·L²/20
 *
 * (3/20 + 7/20 = 1/2, que es la resultante wt·L/2 del triángulo.)
 *
 * El signo sale negativo en las fuerzas porque la carga baja y el GDL sube.
 * Devuelve el vector en el mismo orden que la matriz de rigidez.
 */
export function cargasEquivalentes(
  wA: number,
  wB: number,
  L: number
): [number, number, number, number] {
  const wu = wA;
  const wt = wB - wA;
  const L2 = L * L;
  return [
    -(wu * L) / 2 - (3 * wt * L) / 20,
    -(wu * L2) / 12 - (wt * L2) / 30,
    -(wu * L) / 2 - (7 * wt * L) / 20,
    (wu * L2) / 12 + (wt * L2) / 20,
  ];
}
