import { useEffect, useMemo, useRef, useState } from 'react';
import {
  predictField,
  featuresFrom,
  deriveZapata,
  envelopeWarnings,
  type CampoModel,
  type ZapataGeom,
} from '../../lib/zapataBiaxial';
import ZapataSweepPanel, { type ZapataLoadCase } from './ZapataSweepPanel';

interface Inputs {
  B: number; L: number; T: number; Hped: number; // geometría
  ks: number; hrel: number;                       // suelo + relleno
  P: number; Mx: number; My: number;              // carga de columna + momentos
}
const DEFAULTS: Inputs = { B: 300, L: 400, T: 40, Hped: 120, ks: 5, hrel: 80, P: 90, Mx: 60, My: 72 };

const FIELDS: { key: keyof Inputs; label: string; unit: string; step: number }[] = [
  { key: 'B', label: 'Ancho B', unit: 'cm', step: 10 },
  { key: 'L', label: 'Largo L', unit: 'cm', step: 10 },
  { key: 'T', label: 'Espesor T', unit: 'cm', step: 5 },
  { key: 'Hped', label: 'Alto pedestal (50×50)', unit: 'cm', step: 10 },
  { key: 'ks', label: 'Balasto kₛ', unit: 'kgf/cm³', step: 0.5 },
  { key: 'hrel', label: 'Relleno h', unit: 'cm', step: 10 },
  { key: 'P', label: 'Carga columna P', unit: 'tonf', step: 10 },
  { key: 'Mx', label: 'Momento Mₓ', unit: 'tonf·m', step: 5 },
  { key: 'My', label: 'Momento M_y', unit: 'tonf·m', step: 5 },
];

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

export default function ZapataBiaxialTool() {
  const [inp, setInp] = useState<Inputs>(DEFAULTS);
  const [model, setModel] = useState<CampoModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // cargar el modelo (fetch del JSON en /models/)
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}models/surrogate_campo.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((m: CampoModel) => setModel(m))
      .catch((e) => setError(String(e)));
  }, []);

  // Geometría (sin cargas) — compartida con el barrido SAP2000.
  const geom = useMemo<ZapataGeom>(
    () => ({ B: inp.B, L: inp.L, T: inp.T, Hped: inp.Hped, ks: inp.ks, hrel: inp.hrel }),
    [inp.B, inp.L, inp.T, inp.Hped, inp.ks, inp.hrel]
  );

  // ── Variables derivadas (peso propio + relleno → N_tot → features) ─────────
  // M[tonf·m] → kgf·cm es ×1e5;  e_x por My (sobre B), e_y por Mx (sobre L).
  const d = useMemo(
    () => deriveZapata(geom, inp.P * 1000, inp.Mx * 1e5, inp.My * 1e5),
    [geom, inp.P, inp.Mx, inp.My]
  );

  const pred = useMemo(() => {
    if (!model) return null;
    const x = featuresFrom(d.exB, d.eyL, d.Kr, d.LB);
    return predictField(model, x);
  }, [model, d]);

  // ── Avisos de envolvente ───────────────────────────────────────────────────
  const warnings = useMemo(() => envelopeWarnings(d), [d]);

  // ── Dibujo del heatmap ──────────────────────────────────────────────────────
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || !pred) return;
    const G = pred.grid;
    const MAX = 320;
    const aspect = inp.L / inp.B; // alto/ancho
    const w = Math.round(aspect >= 1 ? MAX / aspect : MAX);
    const h = Math.round(aspect >= 1 ? MAX : MAX * aspect);
    const dpr = window.devicePixelRatio || 1;
    cv.width = w * dpr; cv.height = h * dpr;
    cv.style.width = `${w}px`; cv.style.height = `${h}px`;
    const ctx = cv.getContext('2d')!;
    ctx.scale(dpr, dpr);
    const cw = w / G, ch = h / G;
    const qmax = pred.qMaxNorm || 1;
    for (let i = 0; i < G; i++) {
      for (let j = 0; j < G; j++) {
        const uz = pred.uz[i * G + j];
        ctx.fillStyle = uz < 0 ? magma(-uz / qmax) : '#f8fafc';
        // i → x (columna), j → y (fila); y crece hacia arriba → flip
        ctx.fillRect(i * cw, (G - 1 - j) * ch, cw + 0.8, ch + 0.8);
      }
    }
    ctx.strokeStyle = '#94a3b8';
    ctx.strokeRect(0, 0, w, h);
  }, [pred, inp.L, inp.B]);

  const set = (key: keyof Inputs, v: string) =>
    setInp((s) => ({ ...s, [key]: v === '' ? 0 : Number(v) }));

  // Fila del barrido SAP2000 → formulario (kgf → tonf, kgf·cm → tonf·m).
  const rootRef = useRef<HTMLDivElement>(null);
  const loadSweepRow = (row: ZapataLoadCase) => {
    const r3 = (v: number) => Math.round(v * 1000) / 1000;
    setInp((s) => ({
      ...s,
      P: r3(row.Pcol / 1000),
      Mx: r3(row.MxEff / 1e5),
      My: r3(row.MyEff / 1e5),
    }));
    rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const qMax = pred ? pred.qMaxNorm * d.NA : 0;              // [kgf/cm²]
  const wMax = pred && inp.ks > 0 ? (pred.qMaxNorm * d.NA) / inp.ks : 0; // asentamiento máx [cm]

  return (
    <div ref={rootRef}>
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto]">
      {/* ── Panel de inputs ── */}
      <div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FIELDS.map(({ key, label, unit, step }) => (
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
        </div>

        {/* ── Composición de la carga vertical total ── */}
        <div className="mt-4 rounded border border-border bg-surface/50 p-3 text-xs leading-relaxed text-muted">
          <span className="font-medium text-ink">
            Vertical total N = {(d.Ntot / 1000).toFixed(0)} tonf
          </span>{' '}
          = columna {(d.Pcol / 1000).toFixed(0)} + peso propio {((d.wZap + d.wPed) / 1000).toFixed(1)}{' '}
          + relleno {(d.wFill / 1000).toFixed(1)} tonf. El peso propio y el relleno están{' '}
          <em>centrados</em>: suman a N y por eso <strong>bajan la excentricidad efectiva</strong>{' '}
          (e = M/N) — estabilizan la zapata.
        </div>

        {/* ── Variables adimensionales calculadas ── */}
        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
          <Derived label="e_x/B" value={d.exB.toFixed(3)} />
          <Derived label="e_y/L" value={d.eyL.toFixed(3)} />
          <Derived label="K_r" value={d.Kr.toFixed(2)} />
          <Derived label="L/B" value={d.LB.toFixed(2)} />
        </div>

        {/* ── Resultados ── */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <Stat label="En contacto" value={pred ? `${(pred.contact * 100).toFixed(0)} %` : '—'} />
          <Stat label="q máx" value={pred ? `${qMax.toFixed(2)}` : '—'} unit="kgf/cm²" />
          <Stat label="Asent. máx" value={pred ? `${wMax.toFixed(2)}` : '—'} unit="cm" />
        </div>

        {warnings.length > 0 && (
          <div className="mt-4 rounded border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
            <strong>Fuera de la envolvente de entrenamiento:</strong>
            <ul className="mt-1 list-disc pl-4">
              {warnings.map((wg) => <li key={wg}>{wg}</li>)}
            </ul>
          </div>
        )}
        {error && (
          <p className="mt-4 text-xs text-red-600">No se pudo cargar el modelo: {error}</p>
        )}
      </div>

      {/* ── Heatmap ── */}
      <figure className="m-0 flex flex-col items-center">
        <canvas ref={canvasRef} className="rounded border border-border bg-white" />
        <figcaption className="mt-2 max-w-[320px] text-center text-xs text-muted">
          Presión de contacto (magma = mayor). Blanco = despegue. Vista en planta B×L;
          eje horizontal = B, vertical = L.
        </figcaption>
        {!model && !error && <p className="mt-2 text-xs text-muted">Cargando modelo…</p>}
      </figure>
    </div>

    {/* ── Barrido de combinaciones desde SAP2000 ── */}
    <ZapataSweepPanel geom={geom} model={model} onLoadRow={loadSweepRow} />
    </div>
  );
}

function Derived({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-border/60 py-0.5">
      <span className="font-mono text-muted">{label}</span>
      <span className="font-mono font-medium text-ink">{value}</span>
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
