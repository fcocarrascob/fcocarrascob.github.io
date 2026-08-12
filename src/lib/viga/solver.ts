// ─────────────────────────────────────────────────────────────────────────────
// Solver del sistema K·d = f.
//
// Es eliminación de Gauss con pivoteo parcial escrita a mano, no una librería:
// el sistema tiene 2·(nodos) GDL —rara vez más de un centenar— así que el costo
// es irrelevante, y a cambio el motor queda PURO y sin dependencias, como
// `placaBase.ts` y `zapataBiaxial.ts`.
//
// Los GDL restringidos se ELIMINAN en vez de penalizarse. Eso evita el
// compromiso de elegir un número grande «suficientemente grande» y, sobre todo,
// permite recuperar las reacciones exactas como R = K·d − f en esos GDL.
// ─────────────────────────────────────────────────────────────────────────────

/** La viga no está restringida lo suficiente y no tiene solución. */
export class MecanismoError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'MecanismoError';
  }
}

/**
 * Resuelve A·x = b por eliminación de Gauss con pivoteo parcial ESCALADO.
 *
 * `A` se consume (se modifica en el sitio); pásale una copia si la necesitas
 * después. Lanza `MecanismoError` si encuentra un pivote nulo.
 *
 * El escalado por fila no es adorno. La diagonal de K mezcla términos 12EI/L³
 * con términos 4EI/L, y si además hay un resorte muy rígido la norma global
 * queda dominada por él: un umbral medido contra esa norma dejaría pasar como
 * «no nulo» un pivote genuinamente singular varios órdenes más abajo. Midiendo
 * cada pivote contra el mayor valor de SU fila, el criterio queda adimensional
 * y comparable entre grados de libertad.
 */
export function resolverGauss(A: number[][], b: number[]): number[] {
  const n = b.length;
  if (n === 0) return [];

  // Escala de cada fila, tomada de la matriz original.
  const escalaFila = A.map((fila) => {
    let s = 0;
    for (const v of fila) s = Math.max(s, Math.abs(v));
    return s > 0 ? s : 1;
  });
  const TOL = 1e-12;

  const x = b.slice();

  for (let col = 0; col < n; col++) {
    let mejor = col;
    let mejorRel = Math.abs(A[col][col]) / escalaFila[col];
    for (let f = col + 1; f < n; f++) {
      const rel = Math.abs(A[f][col]) / escalaFila[f];
      if (rel > mejorRel) {
        mejorRel = rel;
        mejor = f;
      }
    }
    if (mejorRel < TOL) {
      throw new MecanismoError(
        'El sistema es singular: la viga tiene un grado de libertad sin restringir ' +
          '(mecanismo). Revisa que haya apoyos suficientes.'
      );
    }
    if (mejor !== col) {
      [A[col], A[mejor]] = [A[mejor], A[col]];
      [x[col], x[mejor]] = [x[mejor], x[col]];
      [escalaFila[col], escalaFila[mejor]] = [escalaFila[mejor], escalaFila[col]];
    }

    const pivote = A[col][col];
    for (let f = col + 1; f < n; f++) {
      const factor = A[f][col] / pivote;
      if (factor === 0) continue;
      for (let c = col; c < n; c++) A[f][c] -= factor * A[col][c];
      x[f] -= factor * x[col];
    }
  }

  // Sustitución hacia atrás.
  for (let f = n - 1; f >= 0; f--) {
    let s = x[f];
    for (let c = f + 1; c < n; c++) s -= A[f][c] * x[c];
    x[f] = s / A[f][f];
  }
  return x;
}

/**
 * Resuelve el sistema global con GDL restringidos.
 *
 * @param K      matriz global completa (nGdl × nGdl), ya con los resortes sumados
 * @param f      vector de cargas global completo
 * @param fijos  índices de GDL con desplazamiento impuesto nulo
 * @returns      `d` completo (con ceros en los fijos) y `R` de reacción en los fijos
 */
export function resolverConRestricciones(
  K: number[][],
  f: number[],
  fijos: Set<number>
): { d: number[]; R: Map<number, number> } {
  const n = f.length;
  const libres: number[] = [];
  for (let i = 0; i < n; i++) if (!fijos.has(i)) libres.push(i);

  const Kred = libres.map((i) => libres.map((j) => K[i][j]));
  const fred = libres.map((i) => f[i]);
  const dred = resolverGauss(Kred, fred);

  const d = new Array<number>(n).fill(0);
  libres.forEach((i, k) => {
    d[i] = dred[k];
  });

  // R = K·d − f, evaluado solo en los GDL restringidos.
  const R = new Map<number, number>();
  for (const i of fijos) {
    let s = 0;
    for (let j = 0; j < n; j++) s += K[i][j] * d[j];
    R.set(i, s - f[i]);
  }
  return { d, R };
}
