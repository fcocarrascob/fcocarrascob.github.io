// ─────────────────────────────────────────────────────────────────────────────
// zapataBiaxial.ts — Motor del surrogate de campo (POD) para la herramienta
// "Zapata aislada biaxial". Puro, sin dependencias, portable/testeable.
//
// Predice el campo de desplazamiento normalizado uz_norm = UZ·k_s/(N/A) de una
// zapata bajo momento biaxial, desde (e_x/B, e_y/L, K_r, L/B), reconstruyendo con
// POD: uz_norm = media + Σ cᵢ·modoᵢ, donde cada coeficiente cᵢ lo predice un
// ensemble de árboles. De uz_norm se derivan, con borde limpio:
//   contacto  = uz_norm < 0
//   q/(N/A)   = max(-uz_norm, 0)
// El modelo (mean + modos + árboles) se entrena y exporta en Python
// (analysis/surrogate_campo.py → models/surrogate_campo.json).
// ─────────────────────────────────────────────────────────────────────────────

export interface Tree {
  f: number[]; // feature index por nodo (hoja: irrelevante)
  t: number[]; // umbral por nodo
  l: number[]; // hijo izquierdo (hoja = -1)
  r: number[]; // hijo derecho
  v: number[]; // valor de hoja
}
export interface CoefModel { base: number; lr: number; trees: Tree[]; }
export interface CampoModel {
  target: string;
  grid: number;
  feats: string[]; // ["e_x_over_B","e_y_over_L","log_Kr","L_over_B","kern_idx"]
  mean: number[];
  modes: number[][];
  coef_models: CoefModel[];
}

/** Evalúa un árbol de decisión: x[f] <= t va a la izquierda (convención sklearn). */
export function evalTree(tree: Tree, x: number[]): number {
  let n = 0;
  while (tree.l[n] !== -1) {
    n = x[tree.f[n]] <= tree.t[n] ? tree.l[n] : tree.r[n];
  }
  return tree.v[n];
}

/** Predicción de un ensemble (gradient boosting): base + Σ lr·árbol. */
export function evalEnsemble(cm: CoefModel, x: number[]): number {
  let y = cm.base;
  for (const tree of cm.trees) y += cm.lr * evalTree(tree, x);
  return y;
}

/** Coeficientes POD predichos para el vector de features. */
export function predictCoefs(model: CampoModel, x: number[]): number[] {
  return model.coef_models.map((cm) => evalEnsemble(cm, x));
}

/** Reconstruye el campo uz_norm (GRID×GRID, orden fila-mayor i→x, j→y). */
export function reconstructUz(model: CampoModel, x: number[]): Float64Array {
  const coefs = predictCoefs(model, x);
  const g2 = model.grid * model.grid;
  const uz = new Float64Array(g2);
  for (let p = 0; p < g2; p++) {
    let v = model.mean[p];
    for (let k = 0; k < coefs.length; k++) v += coefs[k] * model.modes[k][p];
    uz[p] = v;
  }
  return uz;
}

export interface FieldResult {
  uz: Float64Array;      // campo uz_norm (adimensional; <0 = contacto)
  grid: number;
  contact: number;       // fracción de la base en contacto [0..1]
  qMaxNorm: number;      // q_max / (N/A) adimensional
}

/** Campo + escalares derivados, desde el vector de features ya armado. */
export function predictField(model: CampoModel, x: number[]): FieldResult {
  const uz = reconstructUz(model, x);
  let nContact = 0;
  let qMax = 0;
  for (let i = 0; i < uz.length; i++) {
    if (uz[i] < 0) {
      nContact++;
      const q = -uz[i];
      if (q > qMax) qMax = q;
    }
  }
  return { uz, grid: model.grid, contact: nContact / uz.length, qMaxNorm: qMax };
}

/** Arma el vector de features (en el orden del modelo) desde inputs físicos. */
export function featuresFrom(exB: number, eyL: number, Kr: number, LB: number): number[] {
  return [exB, eyL, Math.log10(Kr), LB, 6 * (exB + eyL)];
}
