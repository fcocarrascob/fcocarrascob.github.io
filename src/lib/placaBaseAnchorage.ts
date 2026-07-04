// ─────────────────────────────────────────────────────────────────────────────
// Anclaje al hormigón — ACI 318 Cap. 17 (tracción 17.6 + corte 17.7 + 17.8).
//
// TRACCIÓN (17.6), sobre el grupo de pernos traccionados del solver:
//   - Arrancamiento del cono (breakout) del grupo, 17.6.2, con excentricidad
//     de la tracción (ψec) y reducción por bordes del pedestal (ψed).
//   - Extracción (pullout) del perno más traccionado, 17.6.3.
//   - Desprendimiento lateral (side-face blowout), 17.6.4, solo si hay pernos
//     con embebido profundo cerca del borde (ca1 < 0.4·h_ef).
//
// CORTE (17.7), sobre el corte aplicado {Vux, Vuy}:
//   - Breakout de corte hacia el borde (17.7.2): cada componente del corte se
//     verifica contra el borde del pedestal hacia el que apunta, con la FILA
//     DELANTERA de pernos tomando toda la componente (caso conservador de
//     agujeros con holgura). ψec,V = 1 (reparto uniforme en la fila) y
//     ψh,V = 1 (pedestal profundo, ha ≥ 1.5·ca1).
//   - Pryout (17.7.3): Vcp = kcp·Ncbg con el grupo completo de pernos,
//     kcp = 2 si h_ef ≥ 6.35 cm (1 si no).
//
// INTERACCIÓN (17.8.3): si tracción y corte en el hormigón superan ambos el
// 20 % de su capacidad, se exige N/φNn + V/φVn ≤ 1.2 con los modos gobernantes.
//
// Supuestos comunes: perno embebido con tuerca/cabeza (cast-in), hormigón
// fisurado (ψc = 1.0), peso normal (λa = 1), pedestal B2 × N2 concéntrico con
// la placa, sin refuerzo suplementario ni armadura de anclaje → φ = 0.70.
//
// Constantes convertidas a kgf/cm desde ACI 318M (N, mm, MPa):
//   Nb  = 10·√f'c·hef^1.5                    →  10.1·√f'c·hef^1.5
//   Nsb = 13·ca1·√Abrg·√f'c                  →  41.5·ca1·√Abrg·√f'c
//   Vb  = 0.6·(le/da)^0.2·√da·√f'c·ca1^1.5   →  1.92·(le/da)^0.2·√da·√f'c·ca1^1.5
//   Vb  ≤ 3.7·√f'c·ca1^1.5                   →  ≤ 3.74·√f'c·ca1^1.5
//
// Puro, sin dependencias. Unidades internas: kgf y cm.
// ─────────────────────────────────────────────────────────────────────────────

import type { PlacaInputs, Rod } from './placaBase';
import type { CheckResult } from './placaBaseChecks';

const PHI_ANC = 0.7; // hormigón, sin refuerzo suplementario (17.5.3)
const KC_NB = 10.1; // Nb = KC·√f'c·hef^1.5 [kgf, cm] (kc = 10 SI, cast-in)
const KC_SB = 41.5; // Nsb = KC·ca1·√Abrg·√f'c [kgf, cm] (160 lb-in / 13 SI)
const KC_VB = 1.92; // Vb = KC·(le/da)^0.2·√da·√f'c·ca1^1.5 [kgf, cm] (0.6 SI)
const KC_VB_MAX = 3.74; // tope Vb ≤ KC·√f'c·ca1^1.5 [kgf, cm] (3.7 SI)

function mkCheck(
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
  if (rods.length === 0) return { checks, warnings };

  const { B2, N2, fc, dRod, hEf } = inp;
  const Vres = Math.hypot(inp.Vux, inp.Vuy);
  const idxT: number[] = [];
  for (let i = 0; i < rods.length; i++) if (T[i] > 0) idxT.push(i);
  if (idxT.length === 0 && Vres <= 0) return { checks, warnings };

  if (!(hEf > 0)) {
    warnings.push(
      'Hay demanda sobre los pernos pero h_ef no está definido: el anclaje al hormigón (ACI 318 Cap. 17) no se pudo verificar.'
    );
    return { checks, warnings };
  }

  const Abrg = bearingAreaHexNut(dRod);
  const r15 = 1.5 * hEf;
  const ANco = 9 * hEf * hEf;
  const Nb = KC_NB * Math.sqrt(fc) * Math.pow(hEf, 1.5);

  /**
   * Breakout de tracción (17.6.2) de un conjunto de pernos. Si `Tw` se entrega,
   * ψec se calcula con la excentricidad de la resultante de tracción real;
   * si es null (pryout), ψec = 1.
   */
  const breakoutN = (
    members: number[],
    Tw: number[] | null
  ): { N: number; anc: number; psiEc: number; psiEd: number; caMin: number } | null => {
    const xs = members.map((i) => rods[i].x);
    const ys = members.map((i) => rods[i].y);
    const xMin = Math.min(...xs), xMax = Math.max(...xs);
    const yMin = Math.min(...ys), yMax = Math.max(...ys);
    const caXneg = B2 / 2 + xMin;
    const caXpos = B2 / 2 - xMax;
    const caYneg = N2 / 2 + yMin;
    const caYpos = N2 / 2 - yMax;
    const caMin = Math.min(caXneg, caXpos, caYneg, caYpos);
    if (caMin <= 0) return null;
    const wX = Math.min(r15, caXneg) + (xMax - xMin) + Math.min(r15, caXpos);
    const wY = Math.min(r15, caYneg) + (yMax - yMin) + Math.min(r15, caYpos);
    const ANc = Math.min(wX * wY, members.length * ANco);
    let psiEc = 1;
    if (Tw) {
      const Tsum = members.reduce((s, i) => s + Tw[i], 0);
      if (Tsum > 0) {
        const eNx = Math.abs(members.reduce((s, i) => s + Tw[i] * rods[i].x, 0) / Tsum - (xMin + xMax) / 2);
        const eNy = Math.abs(members.reduce((s, i) => s + Tw[i] * rods[i].y, 0) / Tsum - (yMin + yMax) / 2);
        psiEc =
          Math.min(1, 1 / (1 + (2 * eNx) / (3 * hEf))) *
          Math.min(1, 1 / (1 + (2 * eNy) / (3 * hEf)));
      }
    }
    const psiEd = caMin >= r15 ? 1 : 0.7 + (0.3 * caMin) / r15;
    return { N: (ANc / ANco) * psiEc * psiEd * Nb, anc: ANc / ANco, psiEc, psiEd, caMin };
  };

  // ═══ Tracción (17.6) ════════════════════════════════════════════════════════
  let ratioN = 0; // ratio gobernante del hormigón en tracción (para 17.8)
  if (idxT.length > 0) {
    const Ttot = idxT.reduce((s, i) => s + T[i], 0);
    const Tmax = Math.max(...idxT.map((i) => T[i]));

    const bo = breakoutN(idxT, T);
    if (!bo) {
      warnings.push(
        'Hay pernos traccionados fuera del pedestal B₂ × N₂: el breakout (Cap. 17) no se pudo verificar. Revisar la geometría.'
      );
    } else {
      checks.push(
        mkCheck(
          'anclaje-breakout',
          'Anclaje — cono de arrancamiento (ACI 318 17.6.2)',
          Ttot,
          PHI_ANC * bo.N,
          'kgf',
          `φ·(ANc/ANco)·ψec·ψed·Nb con ANc/ANco = ${bo.anc.toFixed(2)}, ψec = ${bo.psiEc.toFixed(2)}, ` +
            `ψed = ${bo.psiEd.toFixed(2)}, Nb = 10.1·√f'c·h_ef^1.5 = ${Math.round(Nb)} kgf; ` +
            `grupo de ${idxT.length} perno(s) traccionado(s), hormigón fisurado, φ = 0.70`
        )
      );

      const Np = 8 * Abrg * fc;
      checks.push(
        mkCheck(
          'anclaje-pullout',
          'Anclaje — extracción del perno (ACI 318 17.6.3)',
          Tmax,
          PHI_ANC * Np,
          'kgf',
          `φ·8·Abrg·f'c con Abrg ≈ 1.16·d² = ${Abrg.toFixed(2)} cm² (tuerca hex. pesada), ` +
            `hormigón fisurado, φ = 0.70`
        )
      );

      // Side-face blowout (17.6.4): embebido profundo cerca del borde.
      interface EdgeDef {
        name: string;
        ca: (r: Rod) => number;
        along: (r: Rod) => number;
        caPerp: (r: Rod) => number;
      }
      const edges: EdgeDef[] = [
        { name: 'x−', ca: (r) => B2 / 2 + r.x, along: (r) => r.y, caPerp: (r) => Math.min(N2 / 2 + r.y, N2 / 2 - r.y) },
        { name: 'x+', ca: (r) => B2 / 2 - r.x, along: (r) => r.y, caPerp: (r) => Math.min(N2 / 2 + r.y, N2 / 2 - r.y) },
        { name: 'y−', ca: (r) => N2 / 2 + r.y, along: (r) => r.x, caPerp: (r) => Math.min(B2 / 2 + r.x, B2 / 2 - r.x) },
        { name: 'y+', ca: (r) => N2 / 2 - r.y, along: (r) => r.x, caPerp: (r) => Math.min(B2 / 2 + r.x, B2 / 2 - r.x) },
      ];
      let worstSb: { ratio: number; dem: number; cap: number; detalle: string } | null = null;
      for (const e of edges) {
        const members = idxT.filter((i) => e.ca(rods[i]) < 0.4 * hEf);
        if (members.length === 0) continue;
        const ca1 = Math.min(...members.map((i) => e.ca(rods[i])));
        const ca2 = Math.min(...members.map((i) => e.caPerp(rods[i])));
        const corner = ca2 < 3 * ca1 ? (1 + Math.min(3, Math.max(1, ca2 / ca1))) / 4 : 1;
        const Nsb1 = KC_SB * ca1 * Math.sqrt(Abrg) * Math.sqrt(fc) * corner;
        const s =
          Math.max(...members.map((i) => e.along(rods[i]))) -
          Math.min(...members.map((i) => e.along(rods[i])));
        let cap: number, dem: number, grupo: string;
        if (members.length >= 2 && s < 6 * ca1) {
          cap = (1 + s / (6 * ca1)) * Nsb1;
          dem = members.reduce((acc, i) => acc + T[i], 0);
          grupo = `grupo de ${members.length} pernos (s = ${s.toFixed(0)} cm < 6·ca1)`;
        } else {
          cap = Nsb1;
          dem = Math.max(...members.map((i) => T[i]));
          grupo = 'perno individual';
        }
        const ratio = dem / (PHI_ANC * cap);
        if (!worstSb || ratio > worstSb.ratio) {
          worstSb = {
            ratio,
            dem,
            cap: PHI_ANC * cap,
            detalle:
              `Borde ${e.name}: ca1 = ${ca1.toFixed(1)} cm < 0.4·h_ef; ` +
              `Nsb = 41.5·ca1·√Abrg·√f'c·${corner.toFixed(2)} (esquina), ${grupo}, φ = 0.70`,
          };
        }
      }
      if (worstSb) {
        checks.push(
          mkCheck(
            'anclaje-blowout',
            'Anclaje — desprendimiento lateral (ACI 318 17.6.4)',
            worstSb.dem,
            worstSb.cap,
            'kgf',
            worstSb.detalle
          )
        );
      }
      ratioN = Math.max(
        ...checks
          .filter((c) => ['anclaje-breakout', 'anclaje-pullout', 'anclaje-blowout'].includes(c.id))
          .map((c) => c.ratio)
      );
    }
  }

  // ═══ Corte (17.7) ═══════════════════════════════════════════════════════════
  let ratioV = 0; // ratio gobernante del hormigón en corte (para 17.8)
  if (Vres > 0) {
    // ── Breakout de corte (17.7.2): cada componente hacia su borde ────────────
    const le = Math.min(hEf, 8 * dRod);
    interface Dir {
      name: string;
      dem: number;
      coord: (r: Rod) => number; // coordenada hacia el borde (creciente)
      half: number; // semiancho del pedestal en esa dirección
      along: (r: Rod) => number;
      halfSide: number; // semiancho del pedestal en la dirección del borde
    }
    const dirs: Dir[] = [];
    if (Math.abs(inp.Vux) > 0) {
      const s = Math.sign(inp.Vux);
      dirs.push({
        name: s > 0 ? 'x+' : 'x−',
        dem: Math.abs(inp.Vux),
        coord: (r) => s * r.x,
        half: B2 / 2,
        along: (r) => r.y,
        halfSide: N2 / 2,
      });
    }
    if (Math.abs(inp.Vuy) > 0) {
      const s = Math.sign(inp.Vuy);
      dirs.push({
        name: s > 0 ? 'y+' : 'y−',
        dem: Math.abs(inp.Vuy),
        coord: (r) => s * r.y,
        half: N2 / 2,
        along: (r) => r.x,
        halfSide: B2 / 2,
      });
    }
    let worstV: { ratio: number; dem: number; cap: number; detalle: string } | null = null;
    for (const d of dirs) {
      const front = Math.max(...rods.map((r) => d.coord(r)));
      const row = rods.filter((r) => d.coord(r) > front - 0.5);
      const ca1 = d.half - front;
      if (ca1 <= 0) {
        warnings.push(
          `La fila de pernos hacia el borde ${d.name} queda fuera del pedestal: el breakout de corte (17.7.2) no se pudo verificar.`
        );
        continue;
      }
      const alongs = row.map((r) => d.along(r));
      const aMin = Math.min(...alongs), aMax = Math.max(...alongs);
      const ca2neg = d.halfSide + aMin;
      const ca2pos = d.halfSide - aMax;
      const ca2min = Math.min(ca2neg, ca2pos);
      const AVco = 4.5 * ca1 * ca1;
      const width = (aMax - aMin) + Math.min(1.5 * ca1, ca2neg) + Math.min(1.5 * ca1, ca2pos);
      const AVc = Math.min(width * 1.5 * ca1, row.length * AVco); // pedestal profundo: ha ≥ 1.5·ca1
      const Vb = Math.min(
        KC_VB * Math.pow(le / dRod, 0.2) * Math.sqrt(dRod) * Math.sqrt(fc) * Math.pow(ca1, 1.5),
        KC_VB_MAX * Math.sqrt(fc) * Math.pow(ca1, 1.5)
      );
      const psiEdV = ca2min >= 1.5 * ca1 ? 1 : 0.7 + (0.3 * ca2min) / (1.5 * ca1);
      const Vcbg = (AVc / AVco) * psiEdV * Vb; // ψec,V = ψc,V = ψh,V = 1
      const ratio = d.dem / (PHI_ANC * Vcbg);
      if (!worstV || ratio > worstV.ratio) {
        worstV = {
          ratio,
          dem: d.dem,
          cap: PHI_ANC * Vcbg,
          detalle:
            `Borde ${d.name}: fila delantera de ${row.length} perno(s) toma toda la componente; ` +
            `ca1 = ${ca1.toFixed(1)} cm, AVc/AVco = ${(AVc / AVco).toFixed(2)}, ψed,V = ${psiEdV.toFixed(2)}, ` +
            `Vb = mín(1.92·(le/da)^0.2·√da, 3.74)·√f'c·ca1^1.5 = ${Math.round(Vb)} kgf; ` +
            `pedestal profundo (ψh = 1), φ = 0.70`,
        };
      }
    }
    if (worstV) {
      checks.push(
        mkCheck(
          'anclaje-corte-breakout',
          'Anclaje — breakout de corte hacia el borde (ACI 318 17.7.2)',
          worstV.dem,
          worstV.cap,
          'kgf',
          worstV.detalle
        )
      );
    }

    // ── Pryout (17.7.3): grupo completo ────────────────────────────────────────
    const boAll = breakoutN(rods.map((_, i) => i), null);
    if (boAll) {
      const kcp = hEf >= 6.35 ? 2 : 1;
      const Vcpg = kcp * boAll.N;
      checks.push(
        mkCheck(
          'anclaje-pryout',
          'Anclaje — pryout (ACI 318 17.7.3)',
          Vres,
          PHI_ANC * Vcpg,
          'kgf',
          `φ·kcp·Ncbg con kcp = ${kcp} (h_ef ${kcp === 2 ? '≥' : '<'} 6.35 cm) y Ncbg del grupo completo ` +
            `de ${rods.length} pernos = ${Math.round(boAll.N)} kgf (ANc/ANco = ${boAll.anc.toFixed(2)}, ` +
            `ψed = ${boAll.psiEd.toFixed(2)}), φ = 0.70`
        )
      );
    }
    ratioV = Math.max(
      0,
      ...checks
        .filter((c) => ['anclaje-corte-breakout', 'anclaje-pryout'].includes(c.id))
        .map((c) => c.ratio)
    );
  }

  // ═══ Interacción tracción–corte en el hormigón (17.8.3) ═════════════════════
  if (ratioN > 0.2 && ratioV > 0.2) {
    checks.push(
      mkCheck(
        'anclaje-interaccion',
        'Anclaje — interacción tracción + corte (ACI 318 17.8.3)',
        (ratioN + ratioV) * 100,
        120,
        '%',
        `N/φNn + V/φVn = ${ratioN.toFixed(2)} + ${ratioV.toFixed(2)} ≤ 1.2, con los modos de ` +
          `hormigón gobernantes en tracción y corte (aplica porque ambos superan 0.2)`
      )
    );
  }

  if (checks.length > 0) {
    warnings.push(
      'Anclaje (Cap. 17) verificado como perno embebido con tuerca/cabeza, hormigón fisurado, pedestal concéntrico y profundo, sin refuerzo suplementario ni armadura de anclaje (φ = 0.70). En corte, la fila hacia el borde toma toda la componente (agujeros con holgura).'
    );
  }

  return { checks, warnings };
}
