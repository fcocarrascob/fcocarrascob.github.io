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

// ── Física de la zapata: pesos, excentricidad efectiva y adimensionales ──────
// (compartida entre la herramienta y el barrido SAP2000)

export const E_G25 = (4700 * Math.sqrt(250 * 0.0980665)) / 0.0980665; // módulo G25 [kgf/cm²]
export const KR_MIN = 0.011;
export const KR_MAX = 997;
export const ECC_MAX = 0.45; // e_x/B, e_y/L máximos del muestreo
export const ECC_CAP = 0.6; // e_x/B + e_y/L (rincón profundo no muestreado)
export const GAMMA_C = 0.0024; // hormigón [kgf/cm³]
export const GAMMA_S = 0.0018; // suelo de relleno [kgf/cm³]
export const PED_A = 50 * 50; // sección del pedestal [cm²] (fija en el dataset)

export interface ZapataGeom {
  B: number; // cm
  L: number;
  T: number;
  Hped: number;
  ks: number; // kgf/cm³
  hrel: number; // cm
}

export interface ZapataDerived {
  Ntot: number; // kgf (columna + pesos propios + relleno)
  Pcol: number;
  wZap: number;
  wPed: number;
  wFill: number;
  exB: number; // e_x/B (con signo)
  eyL: number; // e_y/L
  Kr: number;
  LB: number;
  NA: number; // N/A [kgf/cm²]
}

/**
 * Composición de la carga vertical total y adimensionales, desde la carga de
 * columna y los momentos al nivel de base. Pcol en kgf (>0 comprime),
 * Mx/My en kgf·cm; e_x proviene de My (sobre B), e_y de Mx (sobre L).
 */
export function deriveZapata(g: ZapataGeom, PcolKgf: number, MxKgfcm: number, MyKgfcm: number): ZapataDerived {
  const wZap = g.B * g.L * g.T * GAMMA_C;
  const wPed = PED_A * g.Hped * GAMMA_C;
  const wFill = Math.max(g.B * g.L - PED_A, 0) * g.hrel * GAMMA_S;
  const Ntot = PcolKgf + wZap + wPed + wFill;
  const ex = Ntot > 0 ? MyKgfcm / Ntot : 0;
  const ey = Ntot > 0 ? MxKgfcm / Ntot : 0;
  return {
    Ntot,
    Pcol: PcolKgf,
    wZap,
    wPed,
    wFill,
    exB: g.B > 0 ? ex / g.B : 0,
    eyL: g.L > 0 ? ey / g.L : 0,
    Kr: g.ks > 0 && g.B > 0 ? (E_G25 * g.T ** 3) / (g.ks * g.B ** 4) : 0,
    LB: g.B > 0 ? g.L / g.B : 0,
    NA: g.B > 0 && g.L > 0 ? Ntot / (g.B * g.L) : 0,
  };
}

/** Avisos de envolvente de entrenamiento (usa |e| — el campo es simétrico). */
export function envelopeWarnings(d: { exB: number; eyL: number; Kr: number; LB: number }): string[] {
  const w: string[] = [];
  const exB = Math.abs(d.exB);
  const eyL = Math.abs(d.eyL);
  if (exB > ECC_MAX || eyL > ECC_MAX)
    w.push(`Excentricidad fuera del muestreo (e/B o e/L > ${ECC_MAX}).`);
  if (exB + eyL > ECC_CAP)
    w.push(`e_x/B + e_y/L = ${(exB + eyL).toFixed(2)} > ${ECC_CAP}: rincón profundo no entrenado.`);
  if (d.Kr < KR_MIN || d.Kr > KR_MAX)
    w.push(`K_r = ${d.Kr.toFixed(3)} fuera del rango [${KR_MIN}, ${KR_MAX}].`);
  if (d.LB < 1 || d.LB > 2.5) w.push(`L/B = ${d.LB.toFixed(2)} fuera del rango [1, 2.5].`);
  return w;
}
