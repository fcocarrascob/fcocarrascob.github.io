import { useMemo, useState } from 'react';
import {
  computeNchSpectrum,
  computeVerticalSpectrum,
  type SeismicZone,
  type SoilType,
  type Spectrum,
} from '../../lib/sap-scripts/nch2369-spectrum';
import {
  MODELO_BASE_DEFAULTS,
  generateModeloBaseScript,
  validateModeloBaseFormValues,
  type ModeloBaseFormValues,
} from '../../lib/sap-scripts/modelo-base-template';

const ZONES: SeismicZone[] = [1, 2, 3];
const SOILS: SoilType[] = ['A', 'B', 'C', 'D', 'E'];

// Paleta categórica validada (dataviz skill) contra la superficie clara del sitio.
const SERIES_COLOR = { x: '#2a78d6', y: '#1baf7a', v: '#eda100' } as const;

function numberField(
  label: string,
  value: number,
  onChange: (v: number) => void,
  opts: { step?: number; min?: number; max?: number } = {},
) {
  return (
    <label className="text-sm">
      <span className="block text-muted">{label}</span>
      <input
        type="number"
        value={value}
        step={opts.step ?? 0.01}
        min={opts.min}
        max={opts.max}
        onChange={(e) => onChange(e.target.valueAsNumber)}
        className="mt-1 w-full rounded border border-border bg-white px-2 py-1 text-ink focus:border-accent focus:outline-none"
      />
    </label>
  );
}

// ── Gráfico SVG de espectros (sin librerías) ─────────────────────────────────

function SpectrumChart({ x, y, v }: { x: Spectrum; y: Spectrum; v: Spectrum }) {
  const W = 420;
  const H = 220;
  const margin = { top: 10, right: 10, bottom: 28, left: 40 };
  const plotW = W - margin.left - margin.right;
  const plotH = H - margin.top - margin.bottom;

  const maxT = 5;
  const maxSa = Math.max(0.01, ...x.accels, ...y.accels, ...v.accels) * 1.1;

  const sx = (t: number) => margin.left + (t / maxT) * plotW;
  const sy = (sa: number) => margin.top + plotH - (sa / maxSa) * plotH;

  const toPoints = (s: Spectrum) =>
    s.periods.map((t, i) => `${sx(t).toFixed(1)},${sy(s.accels[i]).toFixed(1)}`).join(' ');

  const xTicks = [0, 1, 2, 3, 4, 5];
  const yTicks = 4;
  const yTickVals = Array.from({ length: yTicks + 1 }, (_, i) => (maxSa * i) / yTicks);

  const series = [
    { key: 'x', label: 'Horizontal X', color: SERIES_COLOR.x, data: x },
    { key: 'y', label: 'Horizontal Y', color: SERIES_COLOR.y, data: y },
    { key: 'v', label: 'Vertical', color: SERIES_COLOR.v, data: v },
  ];

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[420px]" role="img" aria-label="Espectro de diseño NCh2369">
        {/* Gridlines horizontales */}
        {yTickVals.map((val, i) => (
          <line
            key={i}
            x1={margin.left}
            x2={W - margin.right}
            y1={sy(val)}
            y2={sy(val)}
            stroke="#e5e7eb"
            strokeWidth={1}
          />
        ))}
        {/* Eje X */}
        <line
          x1={margin.left}
          x2={W - margin.right}
          y1={margin.top + plotH}
          y2={margin.top + plotH}
          stroke="#c3c2b7"
          strokeWidth={1}
        />
        {xTicks.map((t) => (
          <text key={t} x={sx(t)} y={H - 8} fontSize="9" textAnchor="middle" className="fill-muted">
            {t}
          </text>
        ))}
        {yTickVals.map((val, i) => (
          <text key={i} x={margin.left - 6} y={sy(val) + 3} fontSize="9" textAnchor="end" className="fill-muted">
            {val.toFixed(2)}
          </text>
        ))}
        <text x={W - margin.right} y={H - 8} fontSize="9" textAnchor="end" className="fill-muted">
          T (s)
        </text>
        <text x={margin.left} y={12} fontSize="9" textAnchor="start" className="fill-muted">
          Sa (g)
        </text>

        {series.map((s) => (
          <polyline
            key={s.key}
            points={toPoints(s.data)}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeLinejoin="round"
          />
        ))}
      </svg>
      <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {series.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-muted">{s.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────

export default function ModeloBaseBuilder() {
  const [values, setValues] = useState<ModeloBaseFormValues>(MODELO_BASE_DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = <K extends keyof ModeloBaseFormValues>(key: K, v: ModeloBaseFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  const errors = useMemo(() => validateModeloBaseFormValues(values), [values]);

  const spectra = useMemo(() => {
    return {
      x: computeNchSpectrum(values.zone, values.soil, values.importance, values.rX, values.dampingX),
      y: computeNchSpectrum(values.zone, values.soil, values.importance, values.rY, values.dampingY),
      v: computeVerticalSpectrum(values.zone, values.soil, values.importance, values.rV, values.xiV),
    };
  }, [values]);

  const script = useMemo(() => {
    if (errors.length > 0) return null;
    try {
      return generateModeloBaseScript(values);
    } catch {
      return null;
    }
  }, [values, errors]);

  const download = () => {
    if (!script) return;
    const blob = new Blob([script], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modelo_base_z${values.zone}${values.soil}.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copy = async () => {
    if (!script) return;
    await navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const errorFor = (field: keyof ModeloBaseFormValues) => errors.find((e) => e.field === field)?.message;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <fieldset className="rounded border border-border p-3">
          <legend className="px-1 text-xs font-medium text-muted">General</legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <label className="text-sm">
              <span className="block text-muted">Zona sísmica</span>
              <select
                value={values.zone}
                onChange={(e) => set('zone', Number(e.target.value) as SeismicZone)}
                className="mt-1 w-full rounded border border-border bg-white px-2 py-1 text-ink focus:border-accent focus:outline-none"
              >
                {ZONES.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="block text-muted">Tipo de suelo</span>
              <select
                value={values.soil}
                onChange={(e) => set('soil', e.target.value as SoilType)}
                className="mt-1 w-full rounded border border-border bg-white px-2 py-1 text-ink focus:border-accent focus:outline-none"
              >
                {SOILS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            {numberField('Factor de importancia I', values.importance, (v) => set('importance', v), {
              step: 0.05,
              min: 0,
            })}
          </div>
          {errorFor('importance') && <p className="mt-2 text-xs text-red-600">{errorFor('importance')}</p>}
        </fieldset>

        <fieldset className="rounded border border-border p-3">
          <legend className="px-1 text-xs font-medium text-muted">Horizontal</legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {numberField('R en X', values.rX, (v) => set('rX', v), { step: 0.5, min: 0 })}
            {numberField('ξ en X', values.dampingX, (v) => set('dampingX', v), { step: 0.01, min: 0, max: 1 })}
            {numberField('R en Y', values.rY, (v) => set('rY', v), { step: 0.5, min: 0 })}
            {numberField('ξ en Y', values.dampingY, (v) => set('dampingY', v), { step: 0.01, min: 0, max: 1 })}
          </div>
          {(errorFor('rX') || errorFor('rY') || errorFor('dampingX') || errorFor('dampingY')) && (
            <p className="mt-2 text-xs text-red-600">
              {errorFor('rX') ?? errorFor('rY') ?? errorFor('dampingX') ?? errorFor('dampingY')}
            </p>
          )}
        </fieldset>

        <fieldset className="rounded border border-border p-3">
          <legend className="px-1 text-xs font-medium text-muted">Vertical</legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {numberField('R vertical', values.rV, (v) => set('rV', v), { step: 0.5, min: 0 })}
            {numberField('ξ vertical', values.xiV, (v) => set('xiV', v), { step: 0.01, min: 0, max: 1 })}
          </div>
          {(errorFor('rV') || errorFor('xiV')) && (
            <p className="mt-2 text-xs text-red-600">{errorFor('rV') ?? errorFor('xiV')}</p>
          )}
        </fieldset>

        <fieldset className="rounded border border-border p-3">
          <legend className="px-1 text-xs font-medium text-muted">Conexión SAP2000</legend>
          <label className="flex items-start gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={values.attachToExisting}
              onChange={(e) => set('attachToExisting', e.target.checked)}
              className="mt-0.5 accent-current"
            />
            <span>
              Adjuntar a una instancia de SAP2000 ya abierta (recomendado). Si se desmarca, el script abre una
              instancia nueva de SAP2000 al ejecutarse.
            </span>
          </label>
        </fieldset>

        <div>
          <h3 className="text-sm font-medium text-ink">Vista previa del espectro NCh2369</h3>
          <div className="mt-2 rounded border border-border bg-surface/50 p-3">
            <SpectrumChart x={spectra.x} y={spectra.y} v={spectra.v} />
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-medium text-ink">Script generado</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={copy}
              disabled={!script}
              className="rounded border border-border px-3 py-1 text-xs font-medium text-ink hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copied ? 'Copiado ✓' : 'Copiar'}
            </button>
            <button
              type="button"
              onClick={download}
              disabled={!script}
              className="rounded bg-accent px-3 py-1 text-xs font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Descargar .py
            </button>
          </div>
        </div>

        {errors.length > 0 ? (
          <div className="mt-3 rounded border border-red-300 bg-red-50 p-3 text-xs text-red-700">
            Corregí los parámetros marcados en rojo para generar el script.
          </div>
        ) : (
          <pre className="mt-3 max-h-[520px] flex-1 overflow-auto rounded border border-border bg-ink p-3 text-[11px] leading-relaxed text-white">
            <code>{script}</code>
          </pre>
        )}

        <p className="mt-3 rounded border border-border bg-surface/50 p-3 text-xs leading-relaxed text-muted">
          Requiere Python 3.9+ y el paquete <code className="font-mono">comtypes</code> (
          <code className="font-mono">pip install comtypes</code>) y SAP2000 instalado en el equipo donde se
          ejecute. El script crea un modelo nuevo en blanco — no modifica un modelo existente.
        </p>
      </div>
    </div>
  );
}
