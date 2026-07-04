// ─────────────────────────────────────────────────────────────────────────────
// Barrido de combinaciones para la zapata biaxial: corre el surrogate de campo
// sobre cada fila (nudo, combo) de reacciones y agrega los resultados — qué
// combinación produce la mayor presión y el menor contacto en cada nudo, y el
// caso más desfavorable global contra la presión admisible q_a.
//
// Mapeo de reacciones (mismo convenio que toPlateLoads): Pcol = +F3 (reacción
// vertical = compresión), Mx = M1, My = M2. Opcionalmente los momentos se
// amplifican por el corte con el brazo hasta el sello: M′x = M1 + F2·brazo,
// M′y = M2 + F1·brazo (Ecs. 1–2 del prediseño de fundaciones).
//
// El surrogate se evalúa con |e|/B y |e|/L (el campo es simétrico por
// cuadrante); el signo solo orienta el mapa, no cambia contacto ni q_max.
//
// Puro, sin dependencias de React. Unidades del motor: kgf y kgf·cm.
// ─────────────────────────────────────────────────────────────────────────────

import {
  deriveZapata,
  envelopeWarnings,
  featuresFrom,
  predictField,
  type CampoModel,
  type ZapataGeom,
} from './zapataBiaxial';
import type { PlateLoadRow } from './sapReactions';

export interface ZapataSweepRow {
  joint: string;
  combo: string;
  stepType: string;
  Pcol: number; // kgf (+ comprime)
  MxEff: number; // kgf·cm (con amplificación por corte si aplica)
  MyEff: number;
  Ntot: number; // kgf
  exB: number; // con signo
  eyL: number;
  contact: number; // fracción [0..1]
  qMax: number; // kgf/cm²
  ratio: number; // qMax/qa (Infinity si tracción neta; 0 si qa no definida)
  ok: boolean;
  netTension: boolean;
  flags: string[]; // avisos de envolvente
}

export interface ZapataJointWorst {
  joint: string;
  nRows: number;
  worst: ZapataSweepRow; // mayor ratio (o q_max si no hay q_a)
  contactMin: number; // menor contacto entre las filas del nudo
}

export interface ZapataSweepSummary {
  rows: ZapataSweepRow[];
  byJoint: ZapataJointWorst[]; // ordenado por ratio/q_max descendente
  worst: ZapataSweepRow | null; // mayor ratio (o q_max) global
  contactMinRow: ZapataSweepRow | null; // menor contacto global
  nJoints: number;
  nCombos: number;
  nFail: number; // filas con ratio > 1 (solo si qa > 0) o tracción neta
  nOut: number; // filas fuera de la envolvente de entrenamiento
  nTension: number; // filas con tracción neta (Ntot ≤ 0)
  okGlobal: boolean;
}

/** Comparador descendente seguro con Infinity. */
function desc(a: number, b: number): number {
  if (a === b) return 0;
  return a > b ? -1 : 1;
}

/** Clave de ranking: ratio si hay q_a; si no, q_max. */
function rank(r: ZapataSweepRow, qa: number): number {
  if (r.netTension) return Infinity;
  return qa > 0 ? r.ratio : r.qMax;
}

/**
 * @param qa presión admisible [kgf/cm²]; 0 = sin verificación (solo ranking por q_max)
 * @param armCm brazo de amplificación de momentos por corte [cm]; 0 = sin amplificar
 */
export function sweepZapata(
  model: CampoModel,
  geom: ZapataGeom,
  qa: number,
  armCm: number,
  loads: PlateLoadRow[]
): ZapataSweepSummary {
  const rows: ZapataSweepRow[] = [];
  const byJointMap = new Map<string, ZapataJointWorst>();
  const combos = new Set<string>();
  let nFail = 0;
  let nOut = 0;
  let nTension = 0;

  for (const load of loads) {
    combos.add(load.combo);
    const MxEff = load.Mux + load.Vuy * armCm;
    const MyEff = load.Muy + load.Vux * armCm;
    const d = deriveZapata(geom, load.Pu, MxEff, MyEff);

    let row: ZapataSweepRow;
    if (d.Ntot <= 0) {
      row = {
        joint: load.joint, combo: load.combo, stepType: load.stepType,
        Pcol: load.Pu, MxEff, MyEff, Ntot: d.Ntot,
        exB: 0, eyL: 0, contact: 0, qMax: 0,
        ratio: Infinity, ok: false, netTension: true,
        flags: ['tracción neta: N ≤ 0, la zapata no puede equilibrar'],
      };
      nTension++;
    } else {
      const f = predictField(model, featuresFrom(Math.abs(d.exB), Math.abs(d.eyL), d.Kr, d.LB));
      const qMax = f.qMaxNorm * d.NA;
      const flags = envelopeWarnings(d);
      const ratio = qa > 0 ? qMax / qa : 0;
      row = {
        joint: load.joint, combo: load.combo, stepType: load.stepType,
        Pcol: load.Pu, MxEff, MyEff, Ntot: d.Ntot,
        exB: d.exB, eyL: d.eyL, contact: f.contact, qMax,
        ratio, ok: qa > 0 ? ratio <= 1 : true, netTension: false,
        flags,
      };
      if (flags.length > 0) nOut++;
    }
    if (!row.ok) nFail++;
    rows.push(row);

    const jw = byJointMap.get(row.joint);
    if (!jw) {
      byJointMap.set(row.joint, { joint: row.joint, nRows: 1, worst: row, contactMin: row.contact });
    } else {
      jw.nRows++;
      jw.contactMin = Math.min(jw.contactMin, row.contact);
      if (desc(rank(row, qa), rank(jw.worst, qa)) < 0) jw.worst = row;
    }
  }

  let worst: ZapataSweepRow | null = null;
  let contactMinRow: ZapataSweepRow | null = null;
  for (const r of rows) {
    if (!worst || desc(rank(r, qa), rank(worst, qa)) < 0) worst = r;
    if (!r.netTension && (!contactMinRow || r.contact < contactMinRow.contact)) contactMinRow = r;
  }

  const byJoint = [...byJointMap.values()].sort((a, b) =>
    desc(rank(a.worst, qa), rank(b.worst, qa))
  );

  return {
    rows,
    byJoint,
    worst,
    contactMinRow,
    nJoints: byJointMap.size,
    nCombos: combos.size,
    nFail,
    nOut,
    nTension,
    okGlobal: qa > 0 && rows.length > 0 && nFail === 0,
  };
}
