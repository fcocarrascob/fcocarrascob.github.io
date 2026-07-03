// ─────────────────────────────────────────────────────────────────────────────
// Placa base rígida: distribución biaxial de presiones bajo la placa.
//
// Modelo: placa rígida, hormigón elástico de solo compresión, pernos de anclaje
// como áreas transformadas (n·Ab) de solo tracción. El estado se describe con un
// plano de tensiones s(x,y) = p0 + px·x + py·y [kgf/cm²]; la presión de contacto
// es σ = max(0, s) y la tracción de cada perno T_i = ρ·max(0, −s(x_i, y_i)).
//
// El equilibrio {Pu, Mux, Muy} se resuelve como minimización de un potencial
// convexo (Newton amortiguado con line search de Armijo). Las integrales sobre
// la zona comprimida son EXACTAS: la zona es el rectángulo recortado por el
// semiplano s ≥ 0 (polígono ≤ 5 vértices) y los momentos de {1,x,y,x²,xy,y²}
// tienen forma cerrada (teorema de Green).
//
// Puro, sin dependencias, portable/testeable. Unidades internas: kgf y cm.
// Origen en el centroide de la placa; x a lo largo de B, y a lo largo de N.
// Signos: Pu > 0 comprime; Mux comprime el borde +y; Muy comprime el borde +x.
// ─────────────────────────────────────────────────────────────────────────────

export type Grade = 36 | 55 | 105;

export interface Pt {
  x: number;
  y: number;
}

export interface Rod {
  x: number; // cm desde el centro de la placa
  y: number;
}

export interface RodPattern {
  nx: number; // pernos por fila (dirección x)
  ny: number; // pernos por columna (dirección y)
  ex: number; // distancia al borde en x [cm]
  ey: number; // distancia al borde en y [cm]
  perimeterOnly: boolean;
}

export interface PlacaInputs {
  B: number; // ancho de placa (eje x) [cm]
  N: number; // largo de placa (eje y) [cm]
  t: number; // espesor de placa [cm]
  fc: number; // f'c hormigón [kgf/cm²]
  Fy: number; // fluencia placa [kgf/cm²]
  B2: number; // pedestal en x (para A2) [cm]
  N2: number; // pedestal en y [cm]
  d: number; // peralte de columna (eje y) [cm]
  bf: number; // ala de columna (eje x) [cm]
  pattern: RodPattern;
  dRod: number; // diámetro del perno [cm]
  grade: Grade; // F1554
  nShear: number; // pernos que toman el corte
  Pu: number; // axial [kgf], >0 compresión
  Mux: number; // momento sobre eje x [kgf·cm]
  Muy: number; // momento sobre eje y [kgf·cm]
  Vux: number; // corte [kgf]
  Vuy: number;
}

export type Regime =
  | 'sin-carga'
  | 'compresion-total'
  | 'solo-pernos'
  | 'parcial'
  | 'inestable';

export interface SolverResult {
  regime: Regime;
  converged: boolean;
  iters: number;
  p: [number, number, number]; // (p0, px, py) del plano s(x,y)
  sigmaMax: number; // presión máxima de contacto [kgf/cm²]
  contactFrac: number; // área comprimida / área de placa
  T: number[]; // tracción por perno [kgf], ≥ 0
  rods: Rod[];
  Rsum: number; // resultante del hormigón ∫σ dA [kgf]
  Tsum: number; // suma de tracciones [kgf]
  naSegment: [Pt, Pt] | null; // eje neutro recortado al rectángulo
  message?: string;
}

// ── Geometría de pernos ──────────────────────────────────────────────────────

export function expandPattern(pattern: RodPattern, B: number, N: number): Rod[] {
  const { nx, ny, ex, ey, perimeterOnly } = pattern;
  if (nx < 1 || ny < 1) return [];
  const xs: number[] = [];
  const ys: number[] = [];
  const x0 = -(B / 2 - ex);
  const y0 = -(N / 2 - ey);
  for (let i = 0; i < nx; i++) xs.push(nx === 1 ? 0 : x0 + (i * (B - 2 * ex)) / (nx - 1));
  for (let j = 0; j < ny; j++) ys.push(ny === 1 ? 0 : y0 + (j * (N - 2 * ey)) / (ny - 1));
  const rods: Rod[] = [];
  for (let i = 0; i < nx; i++)
    for (let j = 0; j < ny; j++) {
      if (perimeterOnly && i > 0 && i < nx - 1 && j > 0 && j < ny - 1) continue;
      rods.push({ x: xs[i], y: ys[j] });
    }
  return rods;
}

// ── Polígonos: recorte por semiplano e integrales de monomios ────────────────

/** Recorta un polígono (CCW) conservando la región a + b·x + c·y ≥ 0. */
export function clipHalfPlane(poly: Pt[], a: number, b: number, c: number): Pt[] {
  const out: Pt[] = [];
  const n = poly.length;
  for (let i = 0; i < n; i++) {
    const P = poly[i];
    const Q = poly[(i + 1) % n];
    const sP = a + b * P.x + c * P.y;
    const sQ = a + b * Q.x + c * Q.y;
    if (sP >= 0) out.push(P);
    if (sP >= 0 !== sQ >= 0) {
      const t = sP / (sP - sQ);
      out.push({ x: P.x + t * (Q.x - P.x), y: P.y + t * (Q.y - P.y) });
    }
  }
  return out;
}

export interface Mono {
  A: number;
  Sx: number;
  Sy: number;
  Ixx: number;
  Ixy: number;
  Iyy: number;
}

const MONO_ZERO: Mono = { A: 0, Sx: 0, Sy: 0, Ixx: 0, Ixy: 0, Iyy: 0 };

/** Momentos de {1, x, y, x², xy, y²} sobre un polígono CCW (Green). */
export function monomials(poly: Pt[]): Mono {
  const n = poly.length;
  if (n < 3) return MONO_ZERO;
  let A = 0,
    Sx = 0,
    Sy = 0,
    Ixx = 0,
    Ixy = 0,
    Iyy = 0;
  for (let i = 0; i < n; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % n];
    const cr = p.x * q.y - q.x * p.y;
    A += cr;
    Sx += (p.x + q.x) * cr;
    Sy += (p.y + q.y) * cr;
    Ixx += (p.x * p.x + p.x * q.x + q.x * q.x) * cr;
    Iyy += (p.y * p.y + p.y * q.y + q.y * q.y) * cr;
    Ixy += (p.x * q.y + 2 * p.x * p.y + 2 * q.x * q.y + q.x * p.y) * cr;
  }
  // El recorte preserva CCW; A < 0 solo por degeneración numérica → vacío.
  if (A <= 0) return MONO_ZERO;
  return { A: A / 2, Sx: Sx / 6, Sy: Sy / 6, Ixx: Ixx / 12, Ixy: Ixy / 24, Iyy: Iyy / 12 };
}

export function plateRect(B: number, N: number): Pt[] {
  return [
    { x: -B / 2, y: -N / 2 },
    { x: B / 2, y: -N / 2 },
    { x: B / 2, y: N / 2 },
    { x: -B / 2, y: N / 2 },
  ];
}

/** Polígono de contacto (zona s ≥ 0) para un plano dado. */
export function contactPolygon(B: number, N: number, p: [number, number, number]): Pt[] {
  if (p[1] === 0 && p[2] === 0) return p[0] > 0 ? plateRect(B, N) : [];
  return clipHalfPlane(plateRect(B, N), p[0], p[1], p[2]);
}

// ── Álgebra 3×3 ──────────────────────────────────────────────────────────────

type V3 = [number, number, number];
type M3 = [V3, V3, V3];

function solve3(H: M3, b: V3): V3 | null {
  // Eliminación gaussiana con pivoteo parcial.
  const a: number[][] = [
    [H[0][0], H[0][1], H[0][2], b[0]],
    [H[1][0], H[1][1], H[1][2], b[1]],
    [H[2][0], H[2][1], H[2][2], b[2]],
  ];
  for (let col = 0; col < 3; col++) {
    let piv = col;
    for (let r = col + 1; r < 3; r++) if (Math.abs(a[r][col]) > Math.abs(a[piv][col])) piv = r;
    if (Math.abs(a[piv][col]) < 1e-300) return null;
    if (piv !== col) [a[piv], a[col]] = [a[col], a[piv]];
    for (let r = col + 1; r < 3; r++) {
      const f = a[r][col] / a[col][col];
      for (let k = col; k < 4; k++) a[r][k] -= f * a[col][k];
    }
  }
  const x: V3 = [0, 0, 0];
  for (let r = 2; r >= 0; r--) {
    let s = a[r][3];
    for (let k = r + 1; k < 3; k++) s -= a[r][k] * x[k];
    x[r] = s / a[r][r];
    if (!Number.isFinite(x[r])) return null;
  }
  return x;
}

// ── Evaluación del estado para un plano u = (p0, px, py) ─────────────────────

interface EvalState {
  poly: Pt[];
  mono: Mono;
  intS: number; // ∫σ dA
  intSx: number; // ∫σ·x dA
  intSy: number; // ∫σ·y dA
  T: number[];
  Tsum: number;
  R: V3; // residuos (gradiente del potencial)
  Pi: number; // potencial convexo
}

function evalState(
  u: V3,
  rect: Pt[],
  rods: Rod[],
  rho: number,
  Pu: number,
  Mux: number,
  Muy: number
): EvalState {
  const [p0, px, py] = u;
  const poly = px === 0 && py === 0 ? (p0 > 0 ? rect : []) : clipHalfPlane(rect, p0, px, py);
  const m = monomials(poly);
  const intS = p0 * m.A + px * m.Sx + py * m.Sy;
  const intSx = p0 * m.Sx + px * m.Ixx + py * m.Ixy;
  const intSy = p0 * m.Sy + px * m.Ixy + py * m.Iyy;
  const intS2 =
    p0 * p0 * m.A +
    px * px * m.Ixx +
    py * py * m.Iyy +
    2 * (p0 * px * m.Sx + p0 * py * m.Sy + px * py * m.Ixy);
  const T: number[] = new Array(rods.length);
  let Tsum = 0,
    Tx = 0,
    Ty = 0,
    Trod2 = 0;
  for (let i = 0; i < rods.length; i++) {
    const si = p0 + px * rods[i].x + py * rods[i].y;
    const Ti = si < 0 ? -rho * si : 0;
    T[i] = Ti;
    Tsum += Ti;
    Tx += Ti * rods[i].x;
    Ty += Ti * rods[i].y;
    if (si < 0) Trod2 += rho * si * si;
  }
  const R: V3 = [intS - Tsum - Pu, intSx - Tx - Muy, intSy - Ty - Mux];
  const Pi = 0.5 * intS2 + 0.5 * Trod2 - (Pu * p0 + Muy * px + Mux * py);
  return { poly, mono: m, intS, intSx, intSy, T, Tsum, R, Pi };
}

function hessian(st: EvalState, rods: Rod[], rho: number, u: V3): M3 {
  const m = st.mono;
  const H: M3 = [
    [m.A, m.Sx, m.Sy],
    [m.Sx, m.Ixx, m.Ixy],
    [m.Sy, m.Ixy, m.Iyy],
  ];
  const [p0, px, py] = u;
  for (const r of rods) {
    const si = p0 + px * r.x + py * r.y;
    if (si < 0) {
      H[0][0] += rho;
      H[0][1] += rho * r.x;
      H[0][2] += rho * r.y;
      H[1][0] += rho * r.x;
      H[1][1] += rho * r.x * r.x;
      H[1][2] += rho * r.x * r.y;
      H[2][0] += rho * r.y;
      H[2][1] += rho * r.x * r.y;
      H[2][2] += rho * r.y * r.y;
    }
  }
  return H;
}

// ── Newton amortiguado sobre el potencial convexo ────────────────────────────

interface NewtonOut {
  u: V3;
  converged: boolean;
  iters: number;
}

function scaledResid(R: V3, B: number, N: number, Pref: number): number {
  return Math.max(Math.abs(R[0]), Math.abs(R[1]) / B, Math.abs(R[2]) / N) / Pref;
}

function newton(
  u0: V3,
  rect: Pt[],
  rods: Rod[],
  rho: number,
  Pu: number,
  Mux: number,
  Muy: number,
  B: number,
  N: number,
  Pref: number
): NewtonOut {
  const TOL = 1e-8;
  let u: V3 = [...u0] as V3;
  let st = evalState(u, rect, rods, rho, Pu, Mux, Muy);
  for (let iter = 1; iter <= 60; iter++) {
    if (scaledResid(st.R, B, N, Pref) < TOL) return { u, converged: true, iters: iter - 1 };
    const H = hessian(st, rods, rho, u);
    const trace = H[0][0] + H[1][1] + H[2][2];
    if (trace <= 0) return { u, converged: false, iters: iter }; // sin rigidez: no hay equilibrio
    // Resolver H·du = −R, con regularización Levenberg si H es casi singular
    // o si la dirección no es de descenso.
    let mu = 0;
    let du: V3 | null = null;
    for (let attempt = 0; attempt < 10; attempt++) {
      const Hd: M3 = [
        [H[0][0] + mu, H[0][1], H[0][2]],
        [H[1][0], H[1][1] + mu, H[1][2]],
        [H[2][0], H[2][1], H[2][2] + mu],
      ];
      du = solve3(Hd, [-st.R[0], -st.R[1], -st.R[2]]);
      if (du) {
        const gdu = st.R[0] * du[0] + st.R[1] * du[1] + st.R[2] * du[2];
        if (gdu < 0) break; // descenso: aceptar
        du = null;
      }
      mu = mu === 0 ? 1e-10 * trace : mu * 100;
    }
    if (!du) return { u, converged: false, iters: iter };
    // Line search de Armijo (backtracking) sobre el potencial.
    const gdu = st.R[0] * du[0] + st.R[1] * du[1] + st.R[2] * du[2];
    let alpha = 1;
    let stNew = st;
    let accepted = false;
    for (let h = 0; h < 30; h++) {
      const uTry: V3 = [u[0] + alpha * du[0], u[1] + alpha * du[1], u[2] + alpha * du[2]];
      stNew = evalState(uTry, rect, rods, rho, Pu, Mux, Muy);
      if (stNew.Pi <= st.Pi + 1e-4 * alpha * gdu) {
        u = uTry;
        accepted = true;
        break;
      }
      alpha /= 2;
    }
    if (!accepted) return { u, converged: false, iters: iter };
    st = stNew;
  }
  return { u, converged: scaledResid(st.R, B, N, Pref) < 1e-6, iters: 60 };
}

// ── Post-proceso ─────────────────────────────────────────────────────────────

function naSegmentOf(B: number, N: number, p: V3): [Pt, Pt] | null {
  const [p0, px, py] = p;
  if (px === 0 && py === 0) return null;
  const corners = plateRect(B, N);
  const pts: Pt[] = [];
  for (let i = 0; i < 4; i++) {
    const P = corners[i];
    const Q = corners[(i + 1) % 4];
    const sP = p0 + px * P.x + py * P.y;
    const sQ = p0 + px * Q.x + py * Q.y;
    if (sP === 0) pts.push(P);
    else if (sP > 0 !== sQ > 0) {
      const t = sP / (sP - sQ);
      pts.push({ x: P.x + t * (Q.x - P.x), y: P.y + t * (Q.y - P.y) });
    }
  }
  if (pts.length < 2) return null;
  // Tomar el par más separado (evita duplicados en esquinas).
  let best: [Pt, Pt] = [pts[0], pts[1]];
  let dBest = -1;
  for (let i = 0; i < pts.length; i++)
    for (let j = i + 1; j < pts.length; j++) {
      const dd = (pts[i].x - pts[j].x) ** 2 + (pts[i].y - pts[j].y) ** 2;
      if (dd > dBest) {
        dBest = dd;
        best = [pts[i], pts[j]];
      }
    }
  return dBest > 1e-12 ? best : null;
}

function buildResult(
  regime: Regime,
  converged: boolean,
  iters: number,
  u: V3,
  B: number,
  N: number,
  rods: Rod[],
  rho: number,
  Pu: number,
  Mux: number,
  Muy: number,
  message?: string
): SolverResult {
  const st = evalState(u, plateRect(B, N), rods, rho, Pu, Mux, Muy);
  const [p0, px, py] = u;
  let sigmaMax = 0;
  for (const c of plateRect(B, N)) sigmaMax = Math.max(sigmaMax, p0 + px * c.x + py * c.y);
  return {
    regime,
    converged,
    iters,
    p: [...u] as [number, number, number],
    sigmaMax: Math.max(0, sigmaMax),
    contactFrac: B * N > 0 ? st.mono.A / (B * N) : 0,
    T: st.T,
    rods,
    Rsum: st.intS,
    Tsum: st.Tsum,
    naSegment: naSegmentOf(B, N, u),
    message,
  };
}

// ── Solver principal ─────────────────────────────────────────────────────────

const MSG_INESTABLE =
  'La configuración de pernos no puede equilibrar la carga aplicada (no existe equilibrio estable).';

/**
 * Resuelve el plano de tensiones que equilibra {Pu, Mux, Muy}.
 * @param rho rigidez transformada por perno: n·Ab [cm²] (n = Es/Ec)
 */
export function solveBearing(
  B: number,
  N: number,
  rods: Rod[],
  rho: number,
  Pu: number,
  Mux: number,
  Muy: number
): SolverResult {
  const zero: V3 = [0, 0, 0];
  if (!(B > 0) || !(N > 0)) {
    return buildResult('sin-carga', true, 0, zero, Math.max(B, 1), Math.max(N, 1), rods, rho, 0, 0, 0);
  }
  const Pref = Math.max(Math.abs(Pu), Math.abs(Mux) / N, Math.abs(Muy) / B);
  if (Pref < 1e-9) return buildResult('sin-carga', true, 0, zero, B, N, rods, rho, Pu, Mux, Muy);

  const rect = plateRect(B, N);
  const A = B * N;
  const Ix = (B * N ** 3) / 12;
  const Iy = (N * B ** 3) / 12;

  // 1) Compresión total (forma cerrada): dentro del núcleo central.
  const uFull: V3 = [Pu / A, Muy / Iy, Mux / Ix];
  if (Pu > 0) {
    let allPos = true;
    for (const c of rect) if (uFull[0] + uFull[1] * c.x + uFull[2] * c.y < 0) allPos = false;
    if (allPos) return buildResult('compresion-total', true, 0, uFull, B, N, rods, rho, Pu, Mux, Muy);
  }

  // Guardia: levantamiento sin pernos → no hay equilibrio posible.
  if (rods.length === 0 && Pu <= 0) {
    return buildResult('inestable', false, 0, zero, B, N, rods, rho, Pu, Mux, Muy, MSG_INESTABLE);
  }

  // 2) Solo pernos (forma cerrada): levantamiento neto sin contacto.
  let uStart: V3 = uFull;
  if (Pu <= 0 && rods.length > 0 && rho > 0) {
    let s1 = 0,
      sx = 0,
      sy = 0,
      sxx = 0,
      sxy = 0,
      syy = 0;
    for (const r of rods) {
      s1 += 1;
      sx += r.x;
      sy += r.y;
      sxx += r.x * r.x;
      sxy += r.x * r.y;
      syy += r.y * r.y;
    }
    const Hr: M3 = [
      [rho * s1, rho * sx, rho * sy],
      [rho * sx, rho * sxx, rho * sxy],
      [rho * sy, rho * sxy, rho * syy],
    ];
    const uRods = solve3(Hr, [Pu, Muy, Mux]);
    if (uRods) {
      let allNeg = true;
      for (const c of rect) if (uRods[0] + uRods[1] * c.x + uRods[2] * c.y > 0) allNeg = false;
      if (allNeg) return buildResult('solo-pernos', true, 0, uRods, B, N, rods, rho, Pu, Mux, Muy);
      uStart = uRods;
    }
  }

  // 3) Caso general: Newton amortiguado, con continuación de carga si falla.
  let out = newton(uStart, rect, rods, rho, Pu, Mux, Muy, B, N, Pref);
  let iters = out.iters;
  if (!out.converged) {
    let u: V3 = uStart;
    let ok = true;
    for (const lam of [0.25, 0.5, 0.75, 1.0]) {
      const o = newton(u, rect, rods, rho, lam * Pu, lam * Mux, lam * Muy, B, N, Pref * lam || Pref);
      iters += o.iters;
      u = o.u;
      if (!o.converged) {
        ok = false;
        break;
      }
    }
    out = { u, converged: ok, iters };
  }
  if (!out.converged) {
    return buildResult('inestable', false, iters, out.u, B, N, rods, rho, Pu, Mux, Muy, MSG_INESTABLE);
  }
  return buildResult('parcial', true, iters, out.u, B, N, rods, rho, Pu, Mux, Muy);
}
