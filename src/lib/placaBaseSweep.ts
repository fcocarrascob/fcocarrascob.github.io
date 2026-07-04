// ─────────────────────────────────────────────────────────────────────────────
// Barrido de combinaciones: corre runPlaca() sobre cada fila (nudo, combo) de
// reacciones y agrega los resultados — qué combinación controla cada nudo, qué
// combinación controla cada verificación y el caso más desfavorable global.
// Puro, sin dependencias de React. Unidades del motor: kgf y kgf·cm.
// ─────────────────────────────────────────────────────────────────────────────

import type { PlacaInputs } from './placaBase';
import { runPlaca } from './placaBaseChecks';
import type { PlateLoadRow } from './sapReactions';

/** Geometría y materiales de la placa: PlacaInputs sin las cargas. */
export type PlacaGeom = Omit<PlacaInputs, 'Pu' | 'Mux' | 'Muy' | 'Vux' | 'Vuy'>;

export const SHORT_CHECK_LABEL: Record<string, string> = {
  aplastamiento: 'Aplastamiento (J8)',
  'flexion-compresion': 'Flexión placa (compresión)',
  'flexion-traccion': 'Flexión placa (tracción)',
  'perno-traccion': 'Perno a tracción',
  'perno-corte': 'Perno a corte',
  'perno-interaccion': 'Perno V+T (J3.7)',
  'anclaje-breakout': 'Cono de arrancamiento (17.6.2)',
  'anclaje-pullout': 'Extracción perno (17.6.3)',
  'anclaje-blowout': 'Blowout lateral (17.6.4)',
  equilibrio: 'Sin equilibrio',
};

export interface SweepRowResult extends PlateLoadRow {
  maxRatio: number; // Infinity si no hay equilibrio
  governsId: string;
  governs: string;
  ok: boolean;
  unstable: boolean;
  tReq: number; // cm (0 si inestable)
}

export interface JointWorst {
  joint: string;
  nRows: number;
  worst: SweepRowResult;
}

export interface CheckWorst {
  id: string;
  nombre: string;
  ratio: number;
  joint: string;
  combo: string;
  stepType: string;
}

export interface SweepSummary {
  rows: SweepRowResult[]; // en orden de entrada
  byJoint: JointWorst[]; // ordenado por ratio descendente
  byCheck: CheckWorst[]; // combo que controla cada verificación
  worst: SweepRowResult | null;
  nJoints: number;
  nCombos: number;
  nFail: number;
  nUnstable: number;
  tReqMax: number; // cm, máximo sobre las filas estables
  okGlobal: boolean;
}

/** Comparador descendente seguro con Infinity (Infinity − Infinity = NaN). */
function byRatioDesc(a: number, b: number): number {
  if (a === b) return 0;
  return a > b ? -1 : 1;
}

export function sweepPlaca(geom: PlacaGeom, loads: PlateLoadRow[]): SweepSummary {
  const rows: SweepRowResult[] = [];
  const byJointMap = new Map<string, JointWorst>();
  const byCheckMap = new Map<string, CheckWorst>();
  const combos = new Set<string>();
  let worst: SweepRowResult | null = null;
  let nFail = 0;
  let nUnstable = 0;
  let tReqMax = 0;

  for (const load of loads) {
    combos.add(load.combo);
    const res = runPlaca({
      ...geom,
      Pu: load.Pu,
      Mux: load.Mux,
      Muy: load.Muy,
      Vux: load.Vux,
      Vuy: load.Vuy,
    });
    const unstable = res.solver.regime === 'inestable' || !res.solver.converged;

    let maxRatio = 0;
    let governsId = '';
    for (const c of res.checks) {
      if (c.ratio > maxRatio) {
        maxRatio = c.ratio;
        governsId = c.id;
      }
      if (!unstable) {
        const prev = byCheckMap.get(c.id);
        if (!prev || byRatioDesc(c.ratio, prev.ratio) < 0) {
          byCheckMap.set(c.id, {
            id: c.id,
            nombre: SHORT_CHECK_LABEL[c.id] ?? c.nombre,
            ratio: c.ratio,
            joint: load.joint,
            combo: load.combo,
            stepType: load.stepType,
          });
        }
      }
    }
    if (unstable) {
      maxRatio = Infinity;
      governsId = 'equilibrio';
      nUnstable++;
    } else {
      tReqMax = Math.max(tReqMax, res.derived.tReq);
    }

    const row: SweepRowResult = {
      ...load,
      maxRatio,
      governsId,
      governs: SHORT_CHECK_LABEL[governsId] ?? governsId,
      ok: !unstable && maxRatio <= 1,
      unstable,
      tReq: unstable ? 0 : res.derived.tReq,
    };
    rows.push(row);
    if (!row.ok) nFail++;
    if (!worst || byRatioDesc(row.maxRatio, worst.maxRatio) < 0) worst = row;

    const jw = byJointMap.get(load.joint);
    if (!jw) byJointMap.set(load.joint, { joint: load.joint, nRows: 1, worst: row });
    else {
      jw.nRows++;
      if (byRatioDesc(row.maxRatio, jw.worst.maxRatio) < 0) jw.worst = row;
    }
  }

  const byJoint = [...byJointMap.values()].sort((a, b) =>
    byRatioDesc(a.worst.maxRatio, b.worst.maxRatio)
  );
  const byCheck = [...byCheckMap.values()].sort((a, b) => byRatioDesc(a.ratio, b.ratio));

  return {
    rows,
    byJoint,
    byCheck,
    worst,
    nJoints: byJointMap.size,
    nCombos: combos.size,
    nFail,
    nUnstable,
    tReqMax,
    okGlobal: rows.length > 0 && nFail === 0,
  };
}
