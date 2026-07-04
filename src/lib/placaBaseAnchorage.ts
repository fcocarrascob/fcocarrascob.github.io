// ─────────────────────────────────────────────────────────────────────────────
// Anclaje al hormigón en tracción — ACI 318 Cap. 17 (17.6).
//
// Verifica el grupo de pernos TRACCIONADOS que entrega el solver de placaBase:
//   - Arrancamiento del cono (breakout) del grupo, 17.6.2, con excentricidad
//     de la tracción (ψec) y reducción por bordes del pedestal (ψed).
//   - Extracción (pullout) del perno más traccionado, 17.6.3.
//   - Desprendimiento lateral (side-face blowout), 17.6.4, solo si hay pernos
//     con embebido profundo cerca del borde (ca1 < 0.4·h_ef), con la corrección
//     de esquina y la fórmula de grupo a lo largo del borde.
//
// Supuestos (documentados en cada detalle): perno embebido con tuerca/cabeza
// (cast-in headed), hormigón fisurado (ψc = 1.0), hormigón de peso normal
// (λa = 1), sin refuerzo suplementario → φ = 0.70 (condición B). El pedestal
// B2 × N2 se asume concéntrico con la placa.
//
// NO se verifica el corte al hormigón (breakout de corte y pryout, 17.7).
//
// Constantes convertidas a kgf/cm desde ACI 318M (N, mm, MPa):
//   Nb  = 10·√f'c·hef^1.5  [N,mm,MPa]  →  10.1·√f'c·hef^1.5   [kgf,cm]
//   Nsb = 13·ca1·√Abrg·√f'c [N,mm,MPa] →  41.5·ca1·√Abrg·√f'c [kgf,cm]
//
// Puro, sin dependencias. Unidades internas: kgf y cm.
// ─────────────────────────────────────────────────────────────────────────────

import type { PlacaInputs, Rod } from './placaBase';
import type { CheckResult } from './placaBaseChecks';

const PHI_ANC = 0.7; // tracción en hormigón, sin refuerzo suplementario (17.5.3)
const KC_NB = 10.1; // Nb = KC·√f'c·hef^1.5 [kgf, cm] (kc = 10 SI, cast-in)
const KC_SB = 41.5; // Nsb = KC·ca1·√Abrg·√f'c [kgf, cm] (160 lb-in / 13 SI)

function mkCheck(
  id: string,
  nombre: string,
  demanda: number,
  capacidad: number,
  detalle: string
): CheckResult {
  const ratio = capacidad > 0 ? demanda / capacidad : demanda > 0 ? Infinity : 0;
  return { id, nombre, demanda, capacidad, ratio, ok: ratio <= 1, unidad: 'kgf', detalle };
}

/** Área de aplastamiento de la tuerca hexagonal pesada: 0.866·(1.5d)² − Ab ≈ 1.16·d². */
export function bearingAreaHexNut(dRod: number): number {
  const F = 1.5 * dRod;
  return 0.866 * F * F - (Math.PI * dRod * dRod) / 4;
}

export interface AnchorageResult {
  checks: CheckResult[];
  warnings: string[];
}

export function anchorageChecks(inp: PlacaInputs, rods: Rod[], T: number[]): AnchorageResult {
  const checks: CheckResult[] = [];
  const warnings: string[] = [];

  const idxT: number[] = [];
  for (let i = 0; i < rods.length; i++) if (T[i] > 0) idxT.push(i);
  if (idxT.length === 0) return { checks, warnings };

  const hEf = inp.hEf;
  if (!(hEf > 0)) {
    warnings.push('Hay pernos traccionados pero h_ef no está definido: el anclaje al hormigón (ACI 318 Cap. 17) no se pudo verificar.');
    return { checks, warnings };
  }

  const { B2, N2, fc, dRod } = inp;
  const Ttot = idxT.reduce((s, i) => s + T[i], 0);
  const Tmax = Math.max(...idxT.map((i) => T[i]));
  const Abrg = bearingAreaHexNut(dRod);

  // Extensión del grupo traccionado y distancias a los bordes del pedestal.
  const xs = idxT.map((i) => rods[i].x);
  const ys = idxT.map((i) => rods[i].y);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = Math.min(...ys), yMax = Math.max(...ys);
  const caXneg = B2 / 2 + xMin;
  const caXpos = B2 / 2 - xMax;
  const caYneg = N2 / 2 + yMin;
  const caYpos = N2 / 2 - yMax;
  const caMin = Math.min(caXneg, caXpos, caYneg, caYpos);

  if (caMin <= 0) {
    warnings.push('Hay pernos traccionados fuera del pedestal B₂ × N₂: el breakout (Cap. 17) no se pudo verificar. Revisar la geometría.');
    return { checks, warnings };
  }

  // ── Breakout del grupo en tracción (17.6.2) ─────────────────────────────────
  const r15 = 1.5 * hEf;
  const ANco = 9 * hEf * hEf;
  const wX = Math.min(r15, caXneg) + (xMax - xMin) + Math.min(r15, caXpos);
  const wY = Math.min(r15, caYneg) + (yMax - yMin) + Math.min(r15, caYpos);
  const ANc = Math.min(wX * wY, idxT.length * ANco);
  const Nb = KC_NB * Math.sqrt(fc) * Math.pow(hEf, 1.5);

  // ψec por eje: excentricidad de la resultante de tracción vs centroide del grupo.
  const eNx = Math.abs(idxT.reduce((s, i) => s + T[i] * rods[i].x, 0) / Ttot - (xMin + xMax) / 2);
  const eNy = Math.abs(idxT.reduce((s, i) => s + T[i] * rods[i].y, 0) / Ttot - (yMin + yMax) / 2);
  const psiEc =
    Math.min(1, 1 / (1 + (2 * eNx) / (3 * hEf))) * Math.min(1, 1 / (1 + (2 * eNy) / (3 * hEf)));
  const psiEd = caMin >= r15 ? 1 : 0.7 + (0.3 * caMin) / r15;

  const Ncbg = (ANc / ANco) * psiEc * psiEd * Nb;
  checks.push(
    mkCheck(
      'anclaje-breakout',
      'Anclaje — cono de arrancamiento (ACI 318 17.6.2)',
      Ttot,
      PHI_ANC * Ncbg,
      `φ·(ANc/ANco)·ψec·ψed·Nb con ANc/ANco = ${(ANc / ANco).toFixed(2)}, ψec = ${psiEc.toFixed(2)}, ` +
        `ψed = ${psiEd.toFixed(2)}, Nb = 10.1·√f'c·h_ef^1.5 = ${Math.round(Nb)} kgf; ` +
        `grupo de ${idxT.length} perno(s) traccionado(s), hormigón fisurado, φ = 0.70`
    )
  );

  // ── Pullout del perno más traccionado (17.6.3) ──────────────────────────────
  const Np = 8 * Abrg * fc;
  checks.push(
    mkCheck(
      'anclaje-pullout',
      'Anclaje — extracción del perno (ACI 318 17.6.3)',
      Tmax,
      PHI_ANC * Np,
      `φ·8·Abrg·f'c con Abrg ≈ 1.16·d² = ${Abrg.toFixed(2)} cm² (tuerca hex. pesada), ` +
        `hormigón fisurado, φ = 0.70`
    )
  );

  // ── Side-face blowout (17.6.4): solo con embebido profundo cerca del borde ──
  interface EdgeDef {
    name: string;
    ca: (r: Rod) => number; // distancia del perno a este borde
    along: (r: Rod) => number; // coordenada a lo largo del borde
    caPerp: (r: Rod) => number; // distancia al borde perpendicular más cercano
  }
  const edges: EdgeDef[] = [
    { name: 'x−', ca: (r) => B2 / 2 + r.x, along: (r) => r.y, caPerp: (r) => Math.min(N2 / 2 + r.y, N2 / 2 - r.y) },
    { name: 'x+', ca: (r) => B2 / 2 - r.x, along: (r) => r.y, caPerp: (r) => Math.min(N2 / 2 + r.y, N2 / 2 - r.y) },
    { name: 'y−', ca: (r) => N2 / 2 + r.y, along: (r) => r.x, caPerp: (r) => Math.min(B2 / 2 + r.x, B2 / 2 - r.x) },
    { name: 'y+', ca: (r) => N2 / 2 - r.y, along: (r) => r.x, caPerp: (r) => Math.min(B2 / 2 + r.x, B2 / 2 - r.x) },
  ];

  let worst: { ratio: number; dem: number; cap: number; detalle: string } | null = null;
  for (const e of edges) {
    const members = idxT.filter((i) => e.ca(rods[i]) < 0.4 * hEf);
    if (members.length === 0) continue;
    const ca1 = Math.min(...members.map((i) => e.ca(rods[i])));
    const ca2 = Math.min(...members.map((i) => e.caPerp(rods[i])));
    // Corrección de esquina (17.6.4.1.2): si ca2 < 3·ca1, factor (1 + ca2/ca1)/4.
    const corner = ca2 < 3 * ca1 ? (1 + Math.min(3, Math.max(1, ca2 / ca1))) / 4 : 1;
    const Nsb1 = KC_SB * ca1 * Math.sqrt(Abrg) * Math.sqrt(fc) * corner;
    const s = Math.max(...members.map((i) => e.along(rods[i]))) - Math.min(...members.map((i) => e.along(rods[i])));
    let cap: number;
    let dem: number;
    let grupo: string;
    if (members.length >= 2 && s < 6 * ca1) {
      cap = (1 + s / (6 * ca1)) * Nsb1; // grupo a lo largo del borde (17.6.4.2)
      dem = members.reduce((acc, i) => acc + T[i], 0);
      grupo = `grupo de ${members.length} pernos (s = ${s.toFixed(0)} cm < 6·ca1)`;
    } else {
      cap = Nsb1;
      dem = Math.max(...members.map((i) => T[i]));
      grupo = 'perno individual';
    }
    const ratio = dem / (PHI_ANC * cap);
    if (!worst || ratio > worst.ratio) {
      worst = {
        ratio,
        dem,
        cap: PHI_ANC * cap,
        detalle:
          `Borde ${e.name}: ca1 = ${ca1.toFixed(1)} cm < 0.4·h_ef; ` +
          `Nsb = 41.5·ca1·√Abrg·√f'c·${corner.toFixed(2)} (esquina), ${grupo}, φ = 0.70`,
      };
    }
  }
  if (worst) {
    checks.push(
      mkCheck(
        'anclaje-blowout',
        'Anclaje — desprendimiento lateral (ACI 318 17.6.4)',
        worst.dem,
        worst.cap,
        worst.detalle
      )
    );
  }

  warnings.push(
    'Anclaje verificado como perno embebido con tuerca/cabeza, hormigón fisurado, sin refuerzo suplementario (φ = 0.70). El corte al hormigón (breakout de corte y pryout — 17.7) no se verifica aquí.'
  );

  return { checks, warnings };
}
