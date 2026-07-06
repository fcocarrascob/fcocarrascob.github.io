// ═══════════════════════════════════════════════════════════════════════════
// t1Estimador.ts — Estimador del período fundamental de pórticos planos
//
// Motor de la herramienta /herramientas/estimador-t1. Interpola las tablas
// EXACTAS del experimento C2 (840 análisis modales en SAP2000, anclas cerradas
// a <0.05 %): T̂₁ y ratios T₂/T₁, T₃/T₁, masa modal y forma modal φ₁ sobre la
// grilla (n × ρ), más la tabla FACTORIAL de irregularidades (taper de rigidez,
// piso blando, taper de masa) — la combinación multiplicativa se rechazó en el
// experimento (interacciones de hasta 22 %), por eso se interpola el factorial
// completo medido.
//
// Definición adimensional: T = T̂ · √(m·h³/(E·Ic)), con m [tonf·s²/m] la masa
// por piso, h [m] la altura de piso, E [tonf/m²] e Ic [m⁴] la inercia de UNA
// columna (pórtico de 2 columnas). ρ = (Ib/Lb)/(Ic/h).
// ═══════════════════════════════════════════════════════════════════════════

export interface EstimadorModel {
  meta: { source: string; def: string; n_levels: number[]; rho_levels: string[] };
  t1_hat: (number | null)[][];
  r21: (number | null)[][];
  r31: (number | null)[][];
  mr1: (number | null)[][];
  phi1: Record<string, Record<string, number[]>>;
  phi1_soft: Record<string, Record<string, number[]>>;
  irregularidades: {
    tk_levels: number[]; s1_levels: number[]; tm_levels: number[];
    ratio: number[][][][][]; // [n][rho][tk][s1][tm]
  };
  formula: { p: number[]; def: string };
}

export interface EstimadorInputs {
  n: number;      // pisos (1..30)
  h: number;      // altura de piso [m]
  E: number;      // módulo elástico [tonf/m²]
  Ic: number;     // inercia de una columna [m⁴]
  Ib: number;     // inercia de viga [m⁴]
  Lb: number;     // luz de viga [m]
  W: number;      // peso sísmico por piso [tonf]
  taperK: number; // I_top/I_bot columnas (0.25..1)
  soft1: number;  // k piso 1 / k regular (0.5..1)
  taperM: number; // m_top/m_bot (0.5..1)
}

export interface EstimadorResult {
  rho: number;
  u: number;
  t1Hat: number;      // adimensional, regular
  ratioIrr: number;   // factor por irregularidades (tabla factorial)
  T1: number;         // [s]
  T2: number | null;
  T3: number | null;
  mr1: number;
  phi1: number[];     // forma modal en los n pisos del usuario (techo = 1)
  H: number;          // altura total [m]
  taCode: { label: string; T: number }[];
  warnings: string[];
}

const G = 9.81;

// ── Interpolación 1D con clamp ───────────────────────────────────────────────
function locate(xs: number[], x: number): [number, number] {
  // xs ascendente → [índice inferior, fracción]; clamp a los bordes
  if (x <= xs[0]) return [0, 0];
  const last = xs.length - 1;
  if (x >= xs[last]) return [last - 1, 1];
  let i = 0;
  while (x > xs[i + 1]) i++;
  return [i, (x - xs[i]) / (xs[i + 1] - xs[i])];
}

// Eje ρ → u = 1/(1+ρ). En el JSON las columnas van de ρ=0.1 (u alto) a ∞
// (u=0): u DESCIENDE con el índice de columna.
export function uOf(rho: number): number {
  return Number.isFinite(rho) ? 1 / (1 + rho) : 0;
}

function rhoAxisU(model: EstimadorModel): number[] {
  return model.meta.rho_levels.map((k) =>
    k === 'INF' ? 0 : 1 / (1 + parseFloat(k))
  );
}

/** Interpola una tabla [n][rho] en (n, ρ): log-lineal en n, lineal en u. */
function interpNR(
  model: EstimadorModel,
  table: (number | null)[][],
  n: number,
  rho: number
): number {
  const ns = model.meta.n_levels;
  const us = rhoAxisU(model); // descendente
  const usAsc = [...us].reverse();
  const [i, fn] = locate(ns.map(Math.log), Math.log(Math.max(n, 1)));
  const [jAsc, fu] = locate(usAsc, uOf(rho));
  const j = us.length - 2 - jAsc; // volver al índice descendente (celda [j, j+1])
  const v = (ii: number, jj: number) => table[ii][jj] as number;
  // eje descendente: usAsc[jAsc+1] (peso fu) corresponde al indice j;
  // usAsc[jAsc] (peso 1-fu), al indice j+1
  const a = v(i, j) * fu + v(i, j + 1) * (1 - fu);
  const b = v(i + 1, j) * fu + v(i + 1, j + 1) * (1 - fu);
  return a * (1 - fn) + b * fn;
}

/** Ratio de irregularidad: trilineal en (tk, s1, tm) × bilineal en (n, ρ). */
function interpIrr(
  model: EstimadorModel,
  n: number,
  rho: number,
  tk: number,
  s1: number,
  tm: number
): number {
  const irr = model.irregularidades;
  // niveles DESCENDENTES (1.0 → 0.25); trabajar en eje ascendente invertido
  const axes = [irr.tk_levels, irr.s1_levels, irr.tm_levels].map((ls) =>
    [...ls].reverse()
  );
  const vals = [tk, s1, tm];
  const locs = axes.map((ls, k) => locate(ls, vals[k]));
  const nLev = [irr.tk_levels.length, irr.s1_levels.length, irr.tm_levels.length];
  // índice descendente equivalente: d = len-2-iAsc → celda [d, d+1]
  const cell = locs.map(([iAsc], k) => nLev[k] - 2 - iAsc);
  const frac = locs.map(([, f]) => f);

  // tabla auxiliar: ratio interpolado en (n, ρ) para un nodo factorial dado
  const ns = model.meta.n_levels;
  const us = rhoAxisU(model);
  const usAsc = [...us].reverse();
  const [i, fn] = locate(ns.map(Math.log), Math.log(Math.max(n, 1)));
  const [jAsc, fu] = locate(usAsc, uOf(rho));
  const j = us.length - 2 - jAsc;
  const nodeNR = (a: number, b: number, c: number) => {
    const v = (ii: number, jj: number) => irr.ratio[ii][jj][a][b][c];
    const p = v(i, j) * fu + v(i, j + 1) * (1 - fu);
    const q = v(i + 1, j) * fu + v(i + 1, j + 1) * (1 - fu);
    return p * (1 - fn) + q * fn;
  };

  // trilineal sobre la celda factorial (índices descendentes: [d+1] es el
  // nivel ascendente inferior, [d] el superior)
  let out = 0;
  for (let a = 0; a <= 1; a++)
    for (let b = 0; b <= 1; b++)
      for (let c = 0; c <= 1; c++) {
        const wa = a === 1 ? frac[0] : 1 - frac[0];
        const wb = b === 1 ? frac[1] : 1 - frac[1];
        const wc = c === 1 ? frac[2] : 1 - frac[2];
        // nivel ascendente a=1 → índice descendente cell[k]; a=0 → cell[k]+1
        out +=
          wa * wb * wc *
          nodeNR(
            a === 1 ? cell[0] : cell[0] + 1,
            b === 1 ? cell[1] : cell[1] + 1,
            c === 1 ? cell[2] : cell[2] + 1
          );
      }
  return out;
}

/** Forma modal φ₁ en los n pisos del usuario (interpolada y remuestreada). */
function interpPhi(
  model: EstimadorModel,
  n: number,
  rho: number,
  s1: number
): number[] {
  const ns = model.meta.n_levels;
  const us = rhoAxisU(model);
  const usAsc = [...us].reverse();
  const keys = model.meta.rho_levels;
  const [i, fn] = locate(ns.map(Math.log), Math.log(Math.max(n, 1)));
  const [jAsc, fu] = locate(usAsc, uOf(rho));
  const j = us.length - 2 - jAsc;

  // remuestrear una forma tabulada (n_grid pisos) a los z/H del usuario
  const resample = (phi: number[], nUser: number): number[] => {
    const zGrid = phi.map((_, k) => (k + 1) / phi.length);
    const out: number[] = [];
    for (let s = 1; s <= nUser; s++) {
      const z = s / nUser;
      if (z <= zGrid[0]) {
        out.push((phi[0] * z) / zGrid[0]); // hacia la base φ→0
        continue;
      }
      const [k, f] = locate(zGrid, z);
      out.push(phi[k] * (1 - f) + phi[k + 1] * f);
    }
    return out;
  };

  const shapeAt = (bank: Record<string, Record<string, number[]>>) => {
    const mix = (ii: number) => {
      const pa = resample(bank[String(ns[ii])][keys[j]], n);      // peso fu
      const pb = resample(bank[String(ns[ii])][keys[j + 1]], n);  // peso 1-fu
      return pa.map((v, k) => v * fu + pb[k] * (1 - fu));
    };
    const lo = mix(i);
    const hi = mix(i + 1);
    return lo.map((v, k) => v * (1 - fn) + hi[k] * fn);
  };

  const reg = shapeAt(model.phi1);
  if (s1 >= 0.999) return reg;
  const soft = shapeAt(model.phi1_soft);
  // lineal entre s1=1 (regular) y s1=0.5 (tabla soft)
  const f = Math.min(Math.max((1 - s1) / 0.5, 0), 1);
  return reg.map((v, k) => v * (1 - f) + soft[k] * f);
}

// ── Fórmulas de referencia de las normas (ASCE 7 Tabla 12.8-2, SI, H en m) ──
export function taCodigo(H: number): { label: string; T: number }[] {
  return [
    { label: 'Marco de acero (0.0724·H^0.8)', T: 0.0724 * Math.pow(H, 0.8) },
    { label: 'Marco de hormigón (0.0466·H^0.9)', T: 0.0466 * Math.pow(H, 0.9) },
    { label: 'Otros sistemas (0.0488·H^0.75)', T: 0.0488 * Math.pow(H, 0.75) },
  ];
}

export function estimar(model: EstimadorModel, inp: EstimadorInputs): EstimadorResult {
  const warnings: string[] = [];
  const n = Math.round(inp.n);
  const rho = (inp.Ib / inp.Lb) / (inp.Ic / inp.h);

  const ns = model.meta.n_levels;
  if (n < ns[0] || n > ns[ns.length - 1])
    warnings.push(`n = ${n} fuera de la grilla (1–30): se extrapola con clamp.`);
  if (rho < 0.1)
    warnings.push(
      `ρ = ${rho.toFixed(3)} bajo el mínimo muestreado (0.1): clamp — para muros/voladizos esta herramienta no aplica.`
    );
  if (inp.taperK < 0.25 || inp.soft1 < 0.5 || inp.taperM < 0.5)
    warnings.push('Irregularidad fuera del rango medido: clamp al borde de la tabla.');

  const nc = Math.min(Math.max(n, ns[0]), ns[ns.length - 1]);
  const t1Hat = interpNR(model, model.t1_hat, nc, rho);
  const ratioIrr = interpIrr(
    model, nc, rho,
    Math.min(Math.max(inp.taperK, 0.25), 1),
    Math.min(Math.max(inp.soft1, 0.5), 1),
    Math.min(Math.max(inp.taperM, 0.5), 1)
  );

  const m = inp.W / G; // masa por piso [tonf·s²/m]
  const scale = Math.sqrt((m * Math.pow(inp.h, 3)) / (inp.E * inp.Ic));
  const T1 = t1Hat * ratioIrr * scale;

  const r21 = nc >= 2 ? interpNR(model, model.r21, Math.max(nc, 2), rho) : null;
  const r31 = nc >= 3 ? interpNR(model, model.r31, Math.max(nc, 3), rho) : null;

  const H = n * inp.h;
  return {
    rho,
    u: uOf(rho),
    t1Hat,
    ratioIrr,
    T1,
    T2: r21 !== null && n >= 2 ? T1 * r21 : null,
    T3: r31 !== null && n >= 3 ? T1 * r31 : null,
    mr1: interpNR(model, model.mr1, nc, rho),
    phi1: interpPhi(model, nc, rho, inp.soft1),
    H,
    taCode: taCodigo(H),
    warnings,
  };
}
