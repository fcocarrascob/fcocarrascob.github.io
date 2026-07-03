// ─────────────────────────────────────────────────────────────────────────────
// Parser de la tabla "Joint Reactions" de SAP2000 (pegada desde la GUI o CSV
// exportado). Tolera:
//   - separador tab (portapapeles), punto y coma o coma
//   - coma decimal (configuración regional) y notación científica
//   - línea de título "TABLE: Joint Reactions", fila de unidades bajo el header
//   - filas Max/Min de combinaciones tipo envolvente
//   - tablas sin encabezado (heurística: últimas 6 columnas numéricas = F1..M3)
//
// Puro, sin dependencias. Los valores quedan en las unidades de la tabla;
// toPlateLoads() convierte a las unidades del motor (kgf y kgf·cm).
// ─────────────────────────────────────────────────────────────────────────────

export interface SapReactionRow {
  joint: string;
  combo: string;
  caseType: string; // '' si la tabla no trae la columna
  stepType: string; // '', 'Max' o 'Min'
  F1: number;
  F2: number;
  F3: number;
  M1: number;
  M2: number;
  M3: number;
}

export interface ParsedReactions {
  rows: SapReactionRow[];
  detectedForceUnit: string | null; // clave de FORCE_UNITS
  detectedMomentUnit: string | null; // clave de MOMENT_UNITS
  skipped: number; // líneas de datos no interpretadas
  warnings: string[];
}

// ── Unidades ─────────────────────────────────────────────────────────────────

export interface UnitOption {
  key: string;
  label: string;
  factor: number; // a kgf (fuerza) o kgf·cm (momento)
}

const KGF_PER: Record<string, number> = {
  tonf: 1000,
  kgf: 1,
  kn: 101.9716213,
  n: 0.1019716213,
  kip: 453.59237,
  lb: 0.45359237,
};

const CM_PER: Record<string, number> = { m: 100, cm: 1, mm: 0.1, ft: 30.48, in: 2.54 };

export const FORCE_UNITS: UnitOption[] = [
  { key: 'tonf', label: 'tonf', factor: KGF_PER.tonf },
  { key: 'kgf', label: 'kgf', factor: KGF_PER.kgf },
  { key: 'kn', label: 'kN', factor: KGF_PER.kn },
  { key: 'n', label: 'N', factor: KGF_PER.n },
  { key: 'kip', label: 'kip', factor: KGF_PER.kip },
  { key: 'lb', label: 'lb', factor: KGF_PER.lb },
];

export const MOMENT_UNITS: UnitOption[] = [
  { key: 'tonf-m', label: 'tonf·m', factor: KGF_PER.tonf * CM_PER.m },
  { key: 'kgf-m', label: 'kgf·m', factor: KGF_PER.kgf * CM_PER.m },
  { key: 'kgf-cm', label: 'kgf·cm', factor: 1 },
  { key: 'kn-m', label: 'kN·m', factor: KGF_PER.kn * CM_PER.m },
  { key: 'n-mm', label: 'N·mm', factor: KGF_PER.n * CM_PER.mm },
  { key: 'kip-ft', label: 'kip·ft', factor: KGF_PER.kip * CM_PER.ft },
  { key: 'kip-in', label: 'kip·in', factor: KGF_PER.kip * CM_PER.in },
  { key: 'lb-in', label: 'lb·in', factor: KGF_PER.lb * CM_PER.in },
];

export function unitByKey(options: UnitOption[], key: string | null): UnitOption | null {
  return options.find((u) => u.key === key) ?? null;
}

function detectForceUnit(cell: string): string | null {
  const t = cell.trim().toLowerCase();
  return t in KGF_PER ? t : null;
}

function detectMomentUnit(cell: string): string | null {
  const m = cell
    .trim()
    .toLowerCase()
    .match(/^([a-z]+)[-·. ]?(m|cm|mm|ft|in)$/);
  if (!m || !(m[1] in KGF_PER) || !(m[2] in CM_PER)) return null;
  const key = `${m[1]}-${m[2]}`;
  return MOMENT_UNITS.some((u) => u.key === key) ? key : null;
}

// ── Números: coma o punto decimal, notación científica ───────────────────────

export function parseNum(s: string): number | null {
  let t = s.trim().replace(/\s+/g, '');
  if (t === '') return null;
  const hasComma = t.includes(',');
  const hasDot = t.includes('.');
  if (hasComma && hasDot) {
    // El separador que aparece último es el decimal; el otro, de miles.
    if (t.lastIndexOf(',') > t.lastIndexOf('.')) t = t.replace(/\./g, '').replace(',', '.');
    else t = t.replace(/,/g, '');
  } else if (hasComma) {
    if ((t.match(/,/g) ?? []).length > 1) return null;
    t = t.replace(',', '.');
  }
  if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(t)) return null;
  const v = Number(t);
  return Number.isFinite(v) ? v : null;
}

// ── Parser ───────────────────────────────────────────────────────────────────

const NUM_COLS = ['f1', 'f2', 'f3', 'm1', 'm2', 'm3'] as const;

function normHeaderCell(cell: string): string {
  // "Output Case" → "outputcase"; "F1 [Tonf]" → "f1"
  return cell
    .replace(/\[.*?\]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function pickDelimiter(text: string): string {
  if (text.includes('\t')) return '\t';
  if (text.includes(';')) return ';';
  return ',';
}

const STEP_RE = /^(max|min)$/i;
const CASETYPE_RE = /^(combination|linstatic|linmodal|linrespspec|linmodhist|lindirhist|nonstatic|nonmodhist|nondirhist|linmoving|linbuckling|envelope)$/i;

export function parseSapReactions(text: string): ParsedReactions {
  const warnings: string[] = [];
  const rows: SapReactionRow[] = [];
  let skipped = 0;
  let detectedForceUnit: string | null = null;
  let detectedMomentUnit: string | null = null;

  const delim = pickDelimiter(text);
  if (delim === ',') {
    warnings.push(
      'Separador de columnas detectado: coma. Si los decimales también usan coma, revisa que los valores tengan sentido.'
    );
  }

  // Mapa de columnas si hay encabezado
  let colMap: Record<string, number> | null = null;

  const lines = text.split(/\r\n|\r|\n/);
  for (const line of lines) {
    if (line.trim() === '') continue;
    if (/^\s*table\s*:/i.test(line)) continue;
    const cells = line.split(delim);

    // ¿Encabezado?
    const normed = cells.map(normHeaderCell);
    if (normed.includes('joint') && (normed.includes('outputcase') || normed.includes('f3'))) {
      colMap = {};
      normed.forEach((c, i) => {
        if (c !== '' && !(c in colMap!)) colMap![c] = i;
      });
      // Unidades embebidas en el header: "F1 [Tonf]"
      const f1i = colMap['f1'];
      if (f1i !== undefined) {
        const emb = cells[f1i]?.match(/\[(.*?)\]/);
        if (emb) detectedForceUnit = detectForceUnit(emb[1]) ?? detectedForceUnit;
      }
      const m1i = colMap['m1'];
      if (m1i !== undefined) {
        const emb = cells[m1i]?.match(/\[(.*?)\]/);
        if (emb) detectedMomentUnit = detectMomentUnit(emb[1]) ?? detectedMomentUnit;
      }
      continue;
    }

    // ¿Fila de unidades bajo el encabezado?
    if (colMap) {
      const f1i = colMap['f1'];
      if (f1i !== undefined && f1i < cells.length && detectForceUnit(cells[f1i])) {
        detectedForceUnit = detectForceUnit(cells[f1i]);
        const m1i = colMap['m1'];
        if (m1i !== undefined && m1i < cells.length)
          detectedMomentUnit = detectMomentUnit(cells[m1i]);
        continue;
      }
    }

    // Fila de datos
    let row: SapReactionRow | null = null;
    if (colMap && NUM_COLS.every((c) => colMap![c] !== undefined)) {
      row = parseWithMap(cells, colMap);
    } else {
      row = parseHeuristic(cells);
    }
    if (row) rows.push(row);
    else skipped++;
  }

  if (rows.length > 0 && !detectedForceUnit) {
    warnings.push(
      'No se detectó la fila de unidades: verifica la unidad de fuerza y momento en los selectores.'
    );
  }
  if (skipped > 0 && rows.length === 0) {
    warnings.push('No se pudo interpretar ninguna fila. ¿Copiaste la tabla «Joint Reactions»?');
  }

  return { rows, detectedForceUnit, detectedMomentUnit, skipped, warnings };
}

function parseWithMap(cells: string[], map: Record<string, number>): SapReactionRow | null {
  const get = (k: string) => (map[k] !== undefined && map[k] < cells.length ? cells[map[k]].trim() : '');
  const joint = get('joint');
  const combo = get('outputcase');
  if (joint === '' || combo === '') return null;
  const nums: number[] = [];
  for (const c of NUM_COLS) {
    const v = parseNum(get(c));
    if (v === null) return null;
    nums.push(v);
  }
  const st = get('steptype');
  return {
    joint,
    combo,
    caseType: get('casetype'),
    stepType: STEP_RE.test(st) ? st : '',
    F1: nums[0],
    F2: nums[1],
    F3: nums[2],
    M1: nums[3],
    M2: nums[4],
    M3: nums[5],
  };
}

/** Sin encabezado: joint = col 0, combo = col 1, últimas 6 numéricas = F1..M3. */
function parseHeuristic(cells: string[]): SapReactionRow | null {
  if (cells.length < 8) return null;
  const joint = cells[0].trim();
  const combo = cells[1].trim();
  if (joint === '' || combo === '') return null;
  const numeric: number[] = [];
  for (let i = 2; i < cells.length; i++) {
    const v = parseNum(cells[i]);
    if (v !== null) numeric.push(v);
  }
  if (numeric.length < 6) return null;
  const nums = numeric.slice(-6);
  let stepType = '';
  let caseType = '';
  for (let i = 2; i < cells.length; i++) {
    const t = cells[i].trim();
    if (STEP_RE.test(t)) stepType = t;
    if (CASETYPE_RE.test(t)) caseType = t;
  }
  return {
    joint,
    combo,
    caseType,
    stepType,
    F1: nums[0],
    F2: nums[1],
    F3: nums[2],
    M1: nums[3],
    M2: nums[4],
    M3: nums[5],
  };
}

// ── Conversión a cargas del motor ────────────────────────────────────────────

export interface PlateLoadRow {
  joint: string;
  combo: string;
  stepType: string;
  Pu: number; // kgf, >0 comprime
  Mux: number; // kgf·cm
  Muy: number;
  Vux: number; // kgf
  Vuy: number;
}

/**
 * Reacción global → carga sobre la placa: Pu = +F3 (reacción hacia arriba =
 * compresión), Vux = F1, Vuy = F2, Mux = M1, Muy = M2. Con swapAxes (columna
 * rotada 90°: eje x de la placa alineado con Y global) se intercambian
 * F1 ↔ F2 y M1 ↔ M2.
 */
export function toPlateLoads(
  rows: SapReactionRow[],
  forceFactor: number,
  momentFactor: number,
  swapAxes: boolean
): PlateLoadRow[] {
  return rows.map((r) => ({
    joint: r.joint,
    combo: r.combo,
    stepType: r.stepType,
    Pu: r.F3 * forceFactor,
    Vux: (swapAxes ? r.F2 : r.F1) * forceFactor,
    Vuy: (swapAxes ? r.F1 : r.F2) * forceFactor,
    Mux: (swapAxes ? r.M2 : r.M1) * momentFactor,
    Muy: (swapAxes ? r.M1 : r.M2) * momentFactor,
  }));
}
