import { useEffect, useMemo, useRef, useState } from 'react';
import type { Grade, PlacaInputs, SolverResult } from '../../lib/placaBase';
import { runPlaca, type PlacaResults } from '../../lib/placaBaseChecks';
import type { PlacaGeom } from '../../lib/placaBaseSweep';
import type { PlateLoadRow } from '../../lib/sapReactions';
import SapSweepPanel from './SapSweepPanel';

// ── Inputs de la UI (tonf, tonf·m, cm, kgf/cm²) ──────────────────────────────

interface NumInputs {
  B: number; N: number; t: number; Fy: number;
  fc: number; B2: number; N2: number;
  d: number; bf: number;
  nx: number; ny: number; ex: number; ey: number; dRod: number; hEf: number; nShear: number;
  Pu: number; Mux: number; Muy: number; Vux: number; Vuy: number;
}

const DEFAULTS: NumInputs = {
  B: 45, N: 45, t: 2.5, Fy: 2530,
  fc: 250, B2: 80, N2: 80,
  d: 30, bf: 30,
  nx: 2, ny: 2, ex: 5, ey: 5, dRod: 2.54, hEf: 40, nShear: 4,
  Pu: 40, Mux: 8, Muy: 0, Vux: 2, Vuy: 0,
};

interface Field { key: keyof NumInputs; label: string; unit: string; step: number }
interface Group { legend: string; fields: Field[] }

const GROUPS: Group[] = [
  {
    legend: 'Placa',
    fields: [
      { key: 'B', label: 'Ancho B (eje x)', unit: 'cm', step: 5 },
      { key: 'N', label: 'Largo N (eje y)', unit: 'cm', step: 5 },
      { key: 't', label: 'Espesor t', unit: 'cm', step: 0.2 },
      { key: 'Fy', label: 'Fy placa', unit: 'kgf/cm²', step: 10 },
    ],
  },
  {
    legend: 'Hormigón / pedestal',
    fields: [
      { key: 'fc', label: "f'c", unit: 'kgf/cm²', step: 10 },
      { key: 'B2', label: 'Pedestal B₂', unit: 'cm', step: 5 },
      { key: 'N2', label: 'Pedestal N₂', unit: 'cm', step: 5 },
    ],
  },
  {
    legend: 'Columna',
    fields: [
      { key: 'd', label: 'Peralte d (eje y)', unit: 'cm', step: 1 },
      { key: 'bf', label: 'Ala b_f (eje x)', unit: 'cm', step: 1 },
    ],
  },
  {
    legend: 'Pernos de anclaje',
    fields: [
      { key: 'nx', label: 'Pernos en x', unit: 'u', step: 1 },
      { key: 'ny', label: 'Pernos en y', unit: 'u', step: 1 },
      { key: 'ex', label: 'Dist. borde eₓ', unit: 'cm', step: 1 },
      { key: 'ey', label: 'Dist. borde e_y', unit: 'cm', step: 1 },
      { key: 'dRod', label: 'Diámetro', unit: 'cm', step: 0.1 },
      { key: 'hEf', label: 'Embebido h_ef', unit: 'cm', step: 5 },
      { key: 'nShear', label: 'Pernos al corte', unit: 'u', step: 1 },
    ],
  },
  {
    legend: 'Cargas mayoradas (LRFD)',
    fields: [
      { key: 'Pu', label: 'Axial Pu (+ comprime)', unit: 'tonf', step: 5 },
      { key: 'Mux', label: 'Momento Mux', unit: 'tonf·m', step: 1 },
      { key: 'Muy', label: 'Momento Muy', unit: 'tonf·m', step: 1 },
      { key: 'Vux', label: 'Corte Vux', unit: 'tonf', step: 1 },
      { key: 'Vuy', label: 'Corte Vuy', unit: 'tonf', step: 1 },
    ],
  },
];

const REGIME_LABEL: Record<SolverResult['regime'], string> = {
  'sin-carga': 'sin carga',
  'compresion-total': 'compresión total',
  'solo-pernos': 'solo pernos (levantamiento)',
  parcial: 'contacto parcial',
  inestable: 'inestable',
};

// ── Colormap magma (0..1 → rgb) ──────────────────────────────────────────────
const MAGMA: Array<[number, [number, number, number]]> = [
  [0.0, [0, 0, 4]], [0.2, [51, 16, 84]], [0.4, [122, 28, 109]],
  [0.6, [190, 55, 105]], [0.8, [249, 133, 86]], [1.0, [252, 253, 191]],
];
function magma(t: number): string {
  t = Math.max(0, Math.min(1, t));
  for (let i = 1; i < MAGMA.length; i++) {
    if (t <= MAGMA[i][0]) {
      const [t0, c0] = MAGMA[i - 1];
      const [t1, c1] = MAGMA[i];
      const f = (t - t0) / (t1 - t0);
      const c = (k: number) => Math.round(c0[k] + f * (c1[k] - c0[k]));
      return `rgb(${c(0)},${c(1)},${c(2)})`;
    }
  }
  return 'rgb(252,253,191)';
}

function rodColor(util: number): string {
  if (util >= 1) return '#dc2626';
  if (util >= 0.7) return '#d97706';
  return '#16a34a';
}

// ── Dibujo (puro: solo depende de los argumentos) ────────────────────────────

function paintPlaca(
  cv: HTMLCanvasElement,
  inp: NumInputs,
  res: PlacaResults,
  phiTn: number
) {
  const { B, N, d, bf, dRod } = inp;
  const sol = res.solver;
  const MAX = 340;
  const aspect = N / B; // alto/ancho
  const w = Math.round(aspect >= 1 ? MAX / aspect : MAX);
  const h = Math.round(aspect >= 1 ? MAX : MAX * aspect);
  const LEGEND = 40;
  const dpr = window.devicePixelRatio || 1;
  cv.width = w * dpr;
  cv.height = (h + LEGEND) * dpr;
  cv.style.width = `${w}px`;
  cv.style.height = `${h + LEGEND}px`;
  const ctx = cv.getContext('2d')!;
  ctx.scale(dpr, dpr);
  const sc = w / B; // px por cm (igual en y)
  const X = (x: number) => (x + B / 2) * sc;
  const Y = (y: number) => (N / 2 - y) * sc;

  // Fondo + heatmap de presiones
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, w, h + LEGEND);
  const [p0, px, py] = sol.p;
  const G = 48;
  const smax = sol.sigmaMax || 1;
  const cw = w / G, ch = h / G;
  for (let i = 0; i < G; i++)
    for (let j = 0; j < G; j++) {
      const x = -B / 2 + ((i + 0.5) * B) / G;
      const y = -N / 2 + ((j + 0.5) * N) / G;
      const s = p0 + px * x + py * y;
      ctx.fillStyle = s > 0 ? magma(s / smax) : '#ffffff';
      ctx.fillRect(i * cw, (G - 1 - j) * ch, cw + 0.8, ch + 0.8);
    }

  // Eje neutro
  if (sol.naSegment) {
    const [a, b] = sol.naSegment;
    ctx.strokeStyle = '#0f172a';
    ctx.setLineDash([7, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(X(a.x), Y(a.y));
    ctx.lineTo(X(b.x), Y(b.y));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Huella de la columna + líneas críticas de flexión (0.95d / 0.8bf)
  ctx.strokeStyle = '#475569';
  ctx.setLineDash([5, 3]);
  ctx.lineWidth = 1.2;
  ctx.strokeRect(X(-bf / 2), Y(d / 2), bf * sc, d * sc);
  ctx.strokeStyle = '#94a3b8';
  ctx.setLineDash([2, 3]);
  ctx.lineWidth = 1;
  ctx.strokeRect(X(-0.4 * bf), Y(0.475 * d), 0.8 * bf * sc, 0.95 * d * sc);
  ctx.setLineDash([]);

  // Pernos (color según utilización a tracción)
  const rPx = Math.max(3.5, (dRod * sc) / 2);
  sol.rods.forEach((r, i) => {
    const T = sol.T[i];
    ctx.beginPath();
    ctx.arc(X(r.x), Y(r.y), rPx, 0, 2 * Math.PI);
    if (T > 0) {
      ctx.fillStyle = rodColor(phiTn > 0 ? T / phiTn : 0);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#64748b';
    }
    ctx.lineWidth = 1.2;
    ctx.stroke();
  });

  // Borde de la placa
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.4;
  ctx.strokeRect(0, 0, w, h);

  // Leyenda: barra de gradiente 0 → σmax
  const ly = h + 8, lw = w, lh = 9;
  for (let i = 0; i < lw; i++) {
    ctx.fillStyle = magma(i / (lw - 1));
    ctx.fillRect(i, ly, 1.5, lh);
  }
  ctx.strokeStyle = '#94a3b8';
  ctx.strokeRect(0, ly, lw, lh);
  ctx.fillStyle = '#475569';
  ctx.font = '10px system-ui, sans-serif';
  ctx.fillText('0', 0, ly + lh + 12);
  const legendTxt = `σmáx = ${sol.sigmaMax.toFixed(1)} kgf/cm²`;
  ctx.fillText(legendTxt, lw - ctx.measureText(legendTxt).width, ly + lh + 12);
}

// ── Componente ───────────────────────────────────────────────────────────────

export default function PlacaBaseTool() {
  const [inp, setInp] = useState<NumInputs>(DEFAULTS);
  const [grade, setGrade] = useState<Grade>(36);
  const [perim, setPerim] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const set = (key: keyof NumInputs, v: string) =>
    setInp((s) => ({ ...s, [key]: v === '' ? 0 : Number(v) }));

  const geom = useMemo<PlacaGeom>(
    () => ({
      B: inp.B, N: inp.N, t: inp.t, fc: inp.fc, Fy: inp.Fy,
      B2: inp.B2, N2: inp.N2, d: inp.d, bf: inp.bf,
      pattern: {
        nx: Math.max(0, Math.round(inp.nx)),
        ny: Math.max(0, Math.round(inp.ny)),
        ex: inp.ex, ey: inp.ey, perimeterOnly: perim,
      },
      dRod: inp.dRod, grade, hEf: inp.hEf, nShear: Math.max(1, Math.round(inp.nShear)),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inp.B, inp.N, inp.t, inp.fc, inp.Fy, inp.B2, inp.N2, inp.d, inp.bf,
     inp.nx, inp.ny, inp.ex, inp.ey, inp.dRod, inp.hEf, inp.nShear, grade, perim]
  );

  const res = useMemo(() => {
    const engine: PlacaInputs = {
      ...geom,
      Pu: inp.Pu * 1000,          // tonf → kgf
      Mux: inp.Mux * 1e5,         // tonf·m → kgf·cm
      Muy: inp.Muy * 1e5,
      Vux: inp.Vux * 1000,
      Vuy: inp.Vuy * 1000,
    };
    return runPlaca(engine);
  }, [geom, inp.Pu, inp.Mux, inp.Muy, inp.Vux, inp.Vuy]);

  // Fila del barrido SAP2000 → formulario (kgf → tonf, kgf·cm → tonf·m).
  const rootRef = useRef<HTMLDivElement>(null);
  const loadSweepRow = (row: PlateLoadRow) => {
    const r3 = (v: number) => Math.round(v * 1000) / 1000;
    setInp((s) => ({
      ...s,
      Pu: r3(row.Pu / 1000),
      Mux: r3(row.Mux / 1e5),
      Muy: r3(row.Muy / 1e5),
      Vux: r3(row.Vux / 1000),
      Vuy: r3(row.Vuy / 1000),
    }));
    rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sol = res.solver;
  const byId = (id: string) => res.checks.find((c) => c.id === id);
  const phiTn = byId('perno-traccion')?.capacidad ?? 0;
  const Tmax = sol.T.length > 0 ? Math.max(...sol.T) : 0;
  const rodRatio = Math.max(byId('perno-traccion')?.ratio ?? 0, byId('perno-interaccion')?.ratio ?? 0);

  useEffect(() => {
    const cv = canvasRef.current;
    if (cv) paintPlaca(cv, inp, res, phiTn);
  }, [inp, res, phiTn]);

  const ratioClass = (r: number) =>
    r > 1 ? 'text-red-600 font-semibold' : r >= 0.9 ? 'text-amber-600 font-semibold' : 'text-ink';

  const fmtDemCap = (v: number, unidad: string) =>
    unidad === 'kgf' ? `${(v / 1000).toFixed(2)} tonf` : `${v.toFixed(1)} ${unidad}`;

  const fmtEcc = (e: number) => (Number.isFinite(e) ? e.toFixed(1) : '∞');

  return (
    <div ref={rootRef}>
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto]">
      {/* ── Panel de inputs y resultados ── */}
      <div>
        <div className="space-y-4">
          {GROUPS.map(({ legend, fields }) => (
            <fieldset key={legend} className="rounded border border-border p-3">
              <legend className="px-1 text-xs font-medium text-muted">{legend}</legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {fields.map(({ key, label, unit, step }) => (
                  <label key={key} className="text-sm">
                    <span className="block text-muted">{label}</span>
                    <span className="mt-1 flex items-baseline gap-1">
                      <input
                        type="number"
                        step={step}
                        autoComplete="off"
                        value={inp[key]}
                        onChange={(e) => set(key, (e.target as HTMLInputElement).value)}
                        className="w-full rounded border border-border bg-white px-2 py-1 text-ink focus:border-accent focus:outline-none"
                      />
                      <span className="shrink-0 text-xs text-muted">{unit}</span>
                    </span>
                  </label>
                ))}
                {legend === 'Pernos de anclaje' && (
                  <>
                    <label className="text-sm">
                      <span className="block text-muted">Grado F1554</span>
                      <select
                        value={grade}
                        onChange={(e) => setGrade(Number(e.target.value) as Grade)}
                        className="mt-1 w-full rounded border border-border bg-white px-2 py-1 text-ink focus:border-accent focus:outline-none"
                      >
                        <option value={36}>Gr. 36</option>
                        <option value={55}>Gr. 55</option>
                        <option value={105}>Gr. 105</option>
                      </select>
                    </label>
                    <label className="flex items-end gap-2 pb-1 text-sm text-muted">
                      <input
                        type="checkbox"
                        checked={perim}
                        onChange={(e) => setPerim(e.target.checked)}
                        className="accent-current"
                      />
                      Solo perímetro
                    </label>
                  </>
                )}
              </div>
            </fieldset>
          ))}
        </div>

        {/* ── Derivados ── */}
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
          <Derived label="e_x = Muy/Pu" value={`${fmtEcc(res.derived.ex)} cm`} />
          <Derived label="e_y = Mux/Pu" value={`${fmtEcc(res.derived.ey)} cm`} />
          <Derived label="√(A₂/A₁)" value={res.derived.sqrtA2A1.toFixed(2)} />
          <Derived label="régimen" value={REGIME_LABEL[sol.regime]} />
          <Derived label="m (0.95d)" value={`${res.derived.m.toFixed(1)} cm`} />
          <Derived label="n (0.8bf)" value={`${res.derived.n.toFixed(1)} cm`} />
          <Derived label="λn′" value={`${res.derived.lambdaNp.toFixed(1)} cm`} />
          <Derived label="pernos" value={`${res.derived.nRods} ⌀${inp.dRod.toFixed(2)}`} />
        </div>

        {/* ── Equilibrio (confianza en el solver) ── */}
        {sol.regime !== 'inestable' && sol.regime !== 'sin-carga' && (
          <div className="mt-3 rounded border border-border bg-surface/50 p-3 text-xs leading-relaxed text-muted">
            Equilibrio: ΣR<sub>hormigón</sub> − ΣT<sub>pernos</sub> ={' '}
            {(sol.Rsum / 1000).toFixed(2)} − {(sol.Tsum / 1000).toFixed(2)} ={' '}
            {((sol.Rsum - sol.Tsum) / 1000).toFixed(2)} tonf = Pu ✓ · contacto{' '}
            {(sol.contactFrac * 100).toFixed(0)} %
          </div>
        )}

        {/* ── Stats ── */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="σ máx" value={sol.sigmaMax.toFixed(1)} unit="kgf/cm²" />
          <Stat label="T máx perno" value={(Tmax / 1000).toFixed(2)} unit="tonf" />
          <Stat label="t req / t" value={`${res.derived.tReq.toFixed(2)} / ${inp.t.toFixed(2)}`} unit="cm" />
          <div
            className={`rounded-lg border px-3 py-2 text-center ${
              res.okGlobal ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
            }`}
          >
            <div className="text-xs text-muted">Verificación</div>
            <div className={`text-lg font-bold ${res.okGlobal ? 'text-green-700' : 'text-red-700'}`}>
              {res.okGlobal ? 'OK' : 'NO OK'}
            </div>
          </div>
        </div>

        {/* ── Mensaje de inestabilidad ── */}
        {sol.regime === 'inestable' && (
          <div className="mt-4 rounded border border-red-300 bg-red-50 p-3 text-xs text-red-700">
            <strong>Sin equilibrio:</strong> {sol.message}
          </div>
        )}

        {/* ── Tabla de checks ── */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="py-1.5 pr-2 font-medium">Verificación</th>
                <th className="py-1.5 pr-2 font-medium">Demanda</th>
                <th className="py-1.5 pr-2 font-medium">Capacidad</th>
                <th className="py-1.5 font-medium">Ratio</th>
              </tr>
            </thead>
            <tbody>
              {res.checks.map((c) => (
                <tr key={c.id} className="border-b border-border/60 align-top">
                  <td className="py-1.5 pr-2">
                    <div className="text-ink">{c.nombre}</div>
                    <div className="text-xs text-muted">{c.detalle}</div>
                  </td>
                  <td className="py-1.5 pr-2 font-mono whitespace-nowrap">{fmtDemCap(c.demanda, c.unidad)}</td>
                  <td className="py-1.5 pr-2 font-mono whitespace-nowrap">{fmtDemCap(c.capacidad, c.unidad)}</td>
                  <td className={`py-1.5 font-mono whitespace-nowrap ${ratioClass(c.ratio)}`}>
                    {Number.isFinite(c.ratio) ? c.ratio.toFixed(2) : '∞'} {c.ok ? '✓' : '✗'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Warnings ── */}
        {res.warnings.length > 0 && (
          <div className="mt-4 rounded border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
            <strong>Avisos:</strong>
            <ul className="mt-1 list-disc pl-4">
              {res.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ── Vista en planta ── */}
      <figure className="m-0 flex flex-col items-center">
        <canvas ref={canvasRef} className="rounded border border-border bg-white" />
        <figcaption className="mt-2 max-w-[340px] text-center text-xs text-muted">
          Planta de la placa B×N: presión de contacto (magma = mayor, blanco = sin contacto),
          eje neutro (línea discontinua), huella de columna y líneas críticas 0.95d/0.8b_f.
          Pernos: verde/ámbar/rojo según utilización a tracción; blanco = sin tracción.
          Utilización perno {rodRatio > 0 ? (rodRatio * 100).toFixed(0) : '0'} %.
        </figcaption>
      </figure>
    </div>

    {/* ── Barrido de combinaciones desde SAP2000 ── */}
    <SapSweepPanel geom={geom} onLoadRow={loadSweepRow} />
    </div>
  );
}

function Derived({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-border/60 py-0.5">
      <span className="font-mono text-muted">{label}</span>
      <span className="text-right font-mono font-medium text-ink">{value}</span>
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-center">
      <div className="text-xs text-muted">{label}</div>
      <div className="text-lg font-semibold text-ink">
        {value} {unit && <span className="text-xs font-normal text-muted">{unit}</span>}
      </div>
    </div>
  );
}
