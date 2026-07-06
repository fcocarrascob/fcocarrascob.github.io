import { useEffect, useMemo, useState } from 'react';
import {
  estimar,
  type EstimadorInputs,
  type EstimadorModel,
} from '../../lib/t1Estimador';

const DEFAULTS: EstimadorInputs = {
  n: 8, h: 3.0, E: 2.35e6, Ic: 0.0108, Ib: 0.0054, Lb: 6.0, W: 50,
  taperK: 1.0, soft1: 1.0, taperM: 1.0,
};

const FIELDS: { key: keyof EstimadorInputs; label: string; unit: string; step: number }[] = [
  { key: 'n', label: 'Pisos n', unit: '', step: 1 },
  { key: 'h', label: 'Altura de piso h', unit: 'm', step: 0.1 },
  { key: 'E', label: 'Módulo E', unit: 'tonf/m²', step: 1e5 },
  { key: 'Ic', label: 'Inercia columna I_c', unit: 'm⁴', step: 0.001 },
  { key: 'Ib', label: 'Inercia viga I_b', unit: 'm⁴', step: 0.001 },
  { key: 'Lb', label: 'Luz de viga L_b', unit: 'm', step: 0.5 },
  { key: 'W', label: 'Peso sísmico por piso W', unit: 'tonf', step: 5 },
];

const IRR: { key: keyof EstimadorInputs; label: string; min: number }[] = [
  { key: 'taperK', label: 'Taper de rigidez I_top/I_bot', min: 0.25 },
  { key: 'soft1', label: 'Piso blando k₁/k', min: 0.5 },
  { key: 'taperM', label: 'Taper de masa m_top/m_bot', min: 0.5 },
];

const fmt = (v: number, d = 3) => v.toFixed(d);

export default function T1EstimadorTool() {
  const [inp, setInp] = useState<EstimadorInputs>(DEFAULTS);
  const [model, setModel] = useState<EstimadorModel | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}models/estimador_t1.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((m: EstimadorModel) => setModel(m))
      .catch((e) => setError(String(e)));
  }, []);

  const res = useMemo(() => {
    if (!model) return null;
    try {
      return estimar(model, inp);
    } catch {
      return null;
    }
  }, [model, inp]);

  const set = (key: keyof EstimadorInputs, v: string) =>
    setInp((s) => ({ ...s, [key]: v === '' ? 0 : Number(v) }));

  // ── Forma modal: SVG (φ en x, altura en y) ────────────────────────────────
  const PhiSvg = () => {
    if (!res) return null;
    const Wv = 190, Hv = 250, pad = 12;
    const pts = [[0, 0], ...res.phi1.map((p, i) => [p, (i + 1) / res.phi1.length])];
    const xy = (p: number, z: number) =>
      `${pad + p * (Wv - 2 * pad)},${Hv - pad - z * (Hv - 2 * pad)}`;
    return (
      <svg width={Wv} height={Hv} className="shrink-0">
        <line x1={pad} y1={Hv - pad} x2={pad} y2={pad} stroke="#cbd5e1" />
        <line x1={pad} y1={Hv - pad} x2={Wv - pad} y2={Hv - pad} stroke="#cbd5e1" />
        <polyline
          points={pts.map(([p, z]) => xy(p, z)).join(' ')}
          fill="none" stroke="#2563eb" strokeWidth={2}
        />
        {pts.slice(1).map(([p, z], i) => (
          <circle key={i} cx={xy(p, z).split(',')[0]} cy={xy(p, z).split(',')[1]}
                  r={2.6} fill="#2563eb" />
        ))}
        <text x={Wv - pad} y={pad + 4} textAnchor="end" fontSize={10} fill="#64748b">
          φ₁ (techo = 1)
        </text>
      </svg>
    );
  };

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_1fr]">
      {/* ── Formulario ── */}
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold text-ink mb-3">Pórtico</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {FIELDS.map(({ key, label, unit, step }) => (
              <label key={key} className="text-xs text-muted">
                {label}
                <span className="flex items-center gap-1 mt-0.5">
                  <input
                    type="number" step={step} value={inp[key]}
                    onChange={(e) => set(key, e.target.value)}
                    className="w-full rounded border border-border px-2 py-1 text-sm text-ink"
                  />
                  {unit && <span className="text-[10px] whitespace-nowrap">{unit}</span>}
                </span>
              </label>
            ))}
          </div>
          {res && (
            <p className="mt-3 text-xs text-muted">
              ρ = (I_b/L_b)/(I_c/h) = <strong className="text-ink">{fmt(res.rho, 3)}</strong>
              {' · '}H = {fmt(res.H, 1)} m
            </p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold text-ink mb-3">Irregularidad vertical</h2>
          <div className="space-y-2.5">
            {IRR.map(({ key, label, min }) => (
              <label key={key} className="block text-xs text-muted">
                <span className="flex justify-between">
                  <span>{label}</span>
                  <strong className="text-ink">{fmt(inp[key] as number, 2)}</strong>
                </span>
                <input
                  type="range" min={min} max={1} step={0.05}
                  value={inp[key]}
                  onChange={(e) => set(key, e.target.value)}
                  className="w-full accent-blue-600"
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ── Resultados ── */}
      <div className="space-y-4">
        {error && (
          <p className="text-sm text-red-600">No se pudo cargar el modelo: {error}</p>
        )}
        {res && (
          <>
            <div className="rounded-lg border border-border bg-surface p-4 flex flex-wrap gap-x-8 gap-y-3">
              <div>
                <div className="text-xs text-muted">Período fundamental</div>
                <div className="text-3xl font-semibold text-ink">
                  T₁ = {fmt(res.T1, 3)} s
                </div>
                <div className="mt-1 text-xs text-muted">
                  T̂₁ = {fmt(res.t1Hat, 2)} · factor irregularidad ×{fmt(res.ratioIrr, 3)}
                </div>
              </div>
              <div className="text-sm text-muted space-y-1 self-center">
                {res.T2 !== null && <div>T₂ = {fmt(res.T2, 3)} s</div>}
                {res.T3 !== null && <div>T₃ = {fmt(res.T3, 3)} s</div>}
                <div>
                  Masa modal modo 1: <strong className="text-ink">
                    {fmt(res.mr1 * 100, 1)} %</strong>
                </div>
              </div>
              <PhiSvg />
            </div>

            <div className="rounded-lg border border-border bg-surface p-4">
              <h2 className="text-sm font-semibold text-ink mb-2">
                Comparación con T_a = C_t·H^x (ASCE 7)
              </h2>
              <table className="w-full text-sm">
                <tbody>
                  {res.taCode.map(({ label, T }) => (
                    <tr key={label} className="border-t border-border">
                      <td className="py-1.5 text-muted">{label}</td>
                      <td className="py-1.5 text-right text-ink">{fmt(T, 3)} s</td>
                      <td className="py-1.5 text-right text-muted w-24">
                        {fmt(res.T1 / T, 2)}× T_a
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-xs text-muted leading-relaxed">
                Las fórmulas de código son <em>cotas inferiores deliberadas</em>, calibradas
                sobre edificios reales (con rigidez no estructural incluida): que el modelo
                elástico desnudo dé un T₁ mayor es lo esperado.
              </p>
            </div>

            {res.warnings.length > 0 && (
              <ul className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 space-y-1">
                {res.warnings.map((w) => (
                  <li key={w}>⚠ {w}</li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
