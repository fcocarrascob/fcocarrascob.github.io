// ─────────────────────────────────────────────────────────────────────────────
// Verificaciones LRFD de placa base: AISC 360 (J8 aplastamiento, J3 pernos) y
// Design Guide 1 (flexión de la placa). Consume el solver de placaBase.ts.
// Puro, sin dependencias. Unidades internas: kgf y cm.
// ─────────────────────────────────────────────────────────────────────────────

import {
  clipHalfPlane,
  contactPolygon,
  monomials,
  resolveRods,
  solveBearing,
  type PlacaInputs,
  type Rod,
  type SolverResult,
} from './placaBase';
import { anchorageChecks } from './placaBaseAnchorage';

export interface CheckResult {
  id: string;
  nombre: string;
  demanda: number;
  capacidad: number;
  ratio: number;
  ok: boolean;
  unidad: string;
  detalle: string;
}

export interface PlacaDerived {
  ex: number; // excentricidad Muy/Pu [cm] (Infinity si Pu = 0)
  ey: number; // excentricidad Mux/Pu [cm]
  sqrtA2A1: number;
  m: number; // volado DG1 dirección N [cm]
  n: number; // volado DG1 dirección B [cm]
  lambdaNp: number; // λn′ [cm]
  AbRod: number; // área bruta del perno [cm²]
  nRods: number;
  tReq: number; // espesor requerido de placa [cm]
}

export interface PlacaResults {
  solver: SolverResult;
  checks: CheckResult[];
  warnings: string[];
  derived: PlacaDerived;
  okGlobal: boolean;
}

// ── Constantes ───────────────────────────────────────────────────────────────

const KSI = 70.307; // kgf/cm² por ksi
const ES = 2.04e6; // acero [kgf/cm²]
const PHI_C = 0.65; // aplastamiento (J8)
const PHI_B = 0.9; // flexión de placa
const PHI_R = 0.75; // pernos (J3)

const FU_KSI: Record<number, number> = { 36: 58, 55: 75, 105: 125 };

// Tabla J3.4: distancia mínima al borde [pulg diámetro → pulg borde].
const J34: Array<[number, number]> = [
  [0.5, 0.75],
  [0.625, 0.875],
  [0.75, 1],
  [0.875, 1.125],
  [1, 1.25],
  [1.125, 1.5],
  [1.25, 1.625],
];

function minEdgeJ34(dRod: number): number {
  const dIn = dRod / 2.54;
  for (const [dd, e] of J34) if (dIn <= dd + 1e-6) return e * 2.54;
  return 1.25 * dRod;
}

function check(
  id: string,
  nombre: string,
  demanda: number,
  capacidad: number,
  unidad: string,
  detalle: string
): CheckResult {
  const ratio = capacidad > 0 ? demanda / capacidad : demanda > 0 ? Infinity : 0;
  return { id, nombre, demanda, capacidad, ratio, ok: ratio <= 1, unidad, detalle };
}

// ── Flexión de la placa (DG1) ────────────────────────────────────────────────

/**
 * Momento por unidad de ancho en las 4 líneas críticas (0.95d, 0.8bf),
 * integrando el bloque de presiones real (polígono de contacto recortado).
 * Devuelve el máximo y una etiqueta de la línea que gobierna.
 */
function bendingFromPressure(
  inp: PlacaInputs,
  sol: SolverResult
): { Mu: number; label: string } {
  const [p0, px, py] = sol.p;
  const CP = contactPolygon(inp.B, inp.N, sol.p);
  const ycr = (0.95 * inp.d) / 2;
  const xcr = (0.8 * inp.bf) / 2;
  let Mu = 0;
  let label = '—';

  const consider = (val: number, lab: string) => {
    if (val > Mu) {
      Mu = val;
      label = lab;
    }
  };

  if (CP.length >= 3) {
    if (ycr < inp.N / 2) {
      // y ≥ +ycr (volado m hacia +y)
      let m = monomials(clipHalfPlane(CP, -ycr, 0, 1));
      let intS = p0 * m.A + px * m.Sx + py * m.Sy;
      let intSy = p0 * m.Sy + px * m.Ixy + py * m.Iyy;
      consider((intSy - ycr * intS) / inp.B, 'línea 0.95d (+y)');
      // y ≤ −ycr
      m = monomials(clipHalfPlane(CP, -ycr, 0, -1));
      intS = p0 * m.A + px * m.Sx + py * m.Sy;
      intSy = p0 * m.Sy + px * m.Ixy + py * m.Iyy;
      consider((-intSy - ycr * intS) / inp.B, 'línea 0.95d (−y)');
    }
    if (xcr < inp.B / 2) {
      let m = monomials(clipHalfPlane(CP, -xcr, 1, 0));
      let intS = p0 * m.A + px * m.Sx + py * m.Sy;
      let intSx = p0 * m.Sx + px * m.Ixx + py * m.Ixy;
      consider((intSx - xcr * intS) / inp.N, 'línea 0.8bf (+x)');
      m = monomials(clipHalfPlane(CP, -xcr, -1, 0));
      intS = p0 * m.A + px * m.Sx + py * m.Sy;
      intSx = p0 * m.Sx + px * m.Ixx + py * m.Ixy;
      consider((-intSx - xcr * intS) / inp.N, 'línea 0.8bf (−x)');
    }
  }
  // Fluencia entre alas (mecanismo λn′, con λ = 1 conservador).
  const lambdaNp = Math.sqrt(inp.d * inp.bf) / 4;
  consider((sol.sigmaMax * lambdaNp ** 2) / 2, 'λn′ (entre alas)');
  return { Mu, label };
}

/** Flexión del lado traccionado: voladizo cargado por la tracción del perno. */
function bendingFromTension(
  inp: PlacaInputs,
  rods: Rod[],
  T: number[]
): { Mu: number; label: string } | null {
  const ycr = (0.95 * inp.d) / 2;
  const xcr = (0.8 * inp.bf) / 2;
  let Mu = 0;
  let label = '';
  for (let i = 0; i < rods.length; i++) {
    if (T[i] <= 0) continue;
    const r = rods[i];
    const dy = Math.abs(r.y) - ycr;
    const dx = Math.abs(r.x) - xcr;
    const cands: number[] = [];
    if (dy > 0) cands.push(dy);
    if (dx > 0) cands.push(dx);
    if (cands.length === 0) continue; // perno dentro de la huella: hay warning aparte
    const lev = Math.min(...cands);
    // Ancho efectivo: dispersión a 45° a ambos lados, acotada por la separación
    // al perno más próximo y por la dimensión de la placa.
    let sAdj = Infinity;
    for (let j = 0; j < rods.length; j++) {
      if (j === i) continue;
      const dd = Math.hypot(rods[j].x - r.x, rods[j].y - r.y);
      if (dd > 0) sAdj = Math.min(sAdj, dd);
    }
    const dimAlong = lev === dy ? inp.B : inp.N;
    const beff = Math.min(4 * lev, sAdj, dimAlong);
    if (beff <= 0) continue;
    const val = (T[i] * lev) / beff;
    if (val > Mu) {
      Mu = val;
      label = `perno en (${r.x.toFixed(0)}, ${r.y.toFixed(0)}) cm, brazo ${lev.toFixed(1)} cm, b_ef ${beff.toFixed(1)} cm`;
    }
  }
  return Mu > 0 ? { Mu, label } : null;
}

// ── Orquestador ──────────────────────────────────────────────────────────────

export function runPlaca(inp: PlacaInputs): PlacaResults {
  const rods = resolveRods(inp.layout, inp.B, inp.N);
  const Ab = (Math.PI * inp.dRod ** 2) / 4;
  const Ec = 15100 * Math.sqrt(Math.max(inp.fc, 1));
  const rho = (ES / Ec) * Ab;

  const solver = solveBearing(inp.B, inp.N, rods, rho, inp.Pu, inp.Mux, inp.Muy);

  const checks: CheckResult[] = [];
  const warnings: string[] = [];

  // ── Aplastamiento del hormigón (AISC 360 J8, φc = 0.65) ────────────────────
  const k = Math.max(1, Math.min(inp.B2 / inp.B, inp.N2 / inp.N));
  const sqrtA2A1 = Math.min(k, 2);
  const fpCap = PHI_C * Math.min(0.85 * inp.fc * sqrtA2A1, 1.7 * inp.fc);
  checks.push(
    check(
      'aplastamiento',
      'Aplastamiento del hormigón (J8)',
      solver.sigmaMax,
      fpCap,
      'kgf/cm²',
      `φc·mín(0.85·f'c·√(A2/A1), 1.7·f'c) con √(A2/A1) = ${sqrtA2A1.toFixed(2)}, φc = 0.65`
    )
  );

  // ── Flexión de la placa, lado comprimido (DG1, φb = 0.90) ──────────────────
  const phiMp = PHI_B * ((inp.Fy * inp.t ** 2) / 4); // por unidad de ancho
  const bComp = bendingFromPressure(inp, solver);
  const tReqComp = Math.sqrt((4 * bComp.Mu) / (PHI_B * inp.Fy));
  checks.push(
    check(
      'flexion-compresion',
      'Flexión de placa — lado comprimido (DG1)',
      bComp.Mu,
      phiMp,
      'kgf·cm/cm',
      `Gobierna ${bComp.label}; t requerido = ${tReqComp.toFixed(2)} cm (φb·Fy·t²/4)`
    )
  );

  // ── Flexión de la placa, lado traccionado (DG1, levantamiento) ─────────────
  let tReqTens = 0;
  const bTens = bendingFromTension(inp, rods, solver.T);
  if (bTens) {
    tReqTens = Math.sqrt((4 * bTens.Mu) / (PHI_B * inp.Fy));
    checks.push(
      check(
        'flexion-traccion',
        'Flexión de placa — lado traccionado',
        bTens.Mu,
        phiMp,
        'kgf·cm/cm',
        `Gobierna ${bTens.label}; t requerido = ${tReqTens.toFixed(2)} cm`
      )
    );
  }

  // ── Pernos de anclaje (AISC 360 J3, φ = 0.75) ──────────────────────────────
  const Fu = FU_KSI[inp.grade] * KSI;
  const Fnt = 0.75 * Fu;
  const Fnv = 0.45 * Fu;
  const Tmax = solver.T.length > 0 ? Math.max(...solver.T) : 0;
  if (rods.length > 0) {
    checks.push(
      check(
        'perno-traccion',
        `Perno a tracción (J3, F1554 gr. ${inp.grade})`,
        Tmax,
        PHI_R * Fnt * Ab,
        'kgf',
        `Fnt = 0.75·Fu = ${Math.round(Fnt)} kgf/cm², Ab = ${Ab.toFixed(2)} cm², φ = 0.75`
      )
    );
    const nSh = Math.max(1, Math.min(inp.nShear, rods.length));
    const Vrod = Math.hypot(inp.Vux, inp.Vuy) / nSh;
    const frv = Vrod / Ab;
    const interactionNeeded = frv > 0.3 * PHI_R * Fnv;
    checks.push(
      check(
        'perno-corte',
        'Perno a corte (J3, hilos incluidos)',
        Vrod,
        PHI_R * Fnv * Ab,
        'kgf',
        `Fnv = 0.45·Fu = ${Math.round(Fnv)} kgf/cm², corte repartido en ${nSh} perno(s)` +
          (interactionNeeded ? '' : '; interacción V+T no requerida (fv ≤ 0.3·φ·Fnv)')
      )
    );
    if (interactionNeeded) {
      const Fntp = Math.max(0, Math.min(Fnt, 1.3 * Fnt - (Fnt / (PHI_R * Fnv)) * frv));
      checks.push(
        check(
          'perno-interaccion',
          'Perno — interacción tracción + corte (J3.7)',
          Tmax,
          PHI_R * Fntp * Ab,
          'kgf',
          `F′nt = mín(Fnt, 1.3·Fnt − Fnt/(φ·Fnv)·fv) = ${Math.round(Fntp)} kgf/cm² con fv = ${frv.toFixed(0)} kgf/cm²`
        )
      );
    }
  } else if (Math.hypot(inp.Vux, inp.Vuy) > 0 || inp.Pu < 0) {
    warnings.push('No hay pernos definidos: el corte y el levantamiento no tienen cómo transferirse.');
  }

  // ── Anclaje al hormigón en tracción (ACI 318 Cap. 17) ──────────────────────
  const anch = anchorageChecks(inp, rods, solver.T);
  checks.push(...anch.checks);
  warnings.push(...anch.warnings);

  // ── Warnings de detallamiento (no bloquean) ────────────────────────────────
  if (rods.length >= 2) {
    let sMin = Infinity;
    for (let i = 0; i < rods.length; i++)
      for (let j = i + 1; j < rods.length; j++)
        sMin = Math.min(sMin, Math.hypot(rods[i].x - rods[j].x, rods[i].y - rods[j].y));
    const sReq = (8 / 3) * inp.dRod;
    if (sMin < sReq - 1e-9)
      warnings.push(
        `Separación entre pernos ${sMin.toFixed(1)} cm < 2⅔·d = ${sReq.toFixed(1)} cm (AISC J3.3; se recomienda 3d).`
      );
  }
  if (rods.length > 0) {
    let eMin = Infinity;
    for (const r of rods)
      eMin = Math.min(eMin, inp.B / 2 - Math.abs(r.x), inp.N / 2 - Math.abs(r.y));
    const eReq = minEdgeJ34(inp.dRod);
    if (eMin < eReq - 1e-9)
      warnings.push(
        `Distancia al borde ${eMin.toFixed(1)} cm < mínimo ${eReq.toFixed(1)} cm (AISC Tabla J3.4).`
      );
    if (rods.some((r) => Math.abs(r.x) < inp.bf / 2 && Math.abs(r.y) < inp.d / 2))
      warnings.push('Hay pernos dentro de la huella de la columna: dificultan el montaje y quedan fuera del modelo de flexión de la placa.');
  }
  if (inp.t < 1.2) warnings.push('Espesor de placa menor a 12 mm: poco práctico para placas de columna.');

  const derived: PlacaDerived = {
    ex: inp.Pu !== 0 ? inp.Muy / inp.Pu : inp.Muy !== 0 ? Infinity : 0,
    ey: inp.Pu !== 0 ? inp.Mux / inp.Pu : inp.Mux !== 0 ? Infinity : 0,
    sqrtA2A1,
    m: (inp.N - 0.95 * inp.d) / 2,
    n: (inp.B - 0.8 * inp.bf) / 2,
    lambdaNp: Math.sqrt(inp.d * inp.bf) / 4,
    AbRod: Ab,
    nRods: rods.length,
    tReq: Math.max(tReqComp, tReqTens),
  };

  const okGlobal =
    solver.regime !== 'inestable' && solver.converged && checks.every((c) => c.ok);

  return { solver, checks, warnings, derived, okGlobal };
}
