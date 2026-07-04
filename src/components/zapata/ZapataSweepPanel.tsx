import { useMemo, useRef, useState, useDeferredValue } from 'react';
import {
  FORCE_UNITS,
  MOMENT_UNITS,
  parseSapReactions,
  toPlateLoads,
  unitByKey,
  type PlateLoadRow,
} from '../../lib/sapReactions';
import type { CampoModel, ZapataGeom } from '../../lib/zapataBiaxial';
import { sweepZapata, type ZapataSweepRow } from '../../lib/zapataBiaxialSweep';

/** Cargas efectivas (ya amplificadas) que se cargan al formulario. */
export interface ZapataLoadCase {
  Pcol: number; // kgf
  MxEff: number; // kgf·cm
  MyEff: number;
}

interface Props {
  geom: ZapataGeom;
  model: CampoModel | null;
  onLoadRow: (row: ZapataLoadCase) => void;
}

const PLACEHOLDER = [
  'Pega aquí la tabla Joint Reactions de SAP2000',
  '(Display → Show Tables → Joint Output → Reactions, Ctrl+C sobre la tabla).',
  '',
  'Ejemplo:',
  'TABLE:  Joint Reactions',
  'Joint\tOutputCase\tCaseType\tStepType\tF1\tF2\tF3\tM1\tM2\tM3',
  '\t\t\t\tTonf\tTonf\tTonf\tTonf-m\tTonf-m\tTonf-m',
  'C2\tC01.- D\tCombination\t\t-0,0038\t0,0533\t5,0596\t-0,0326\t0\t0,0001',
  'C2\tC04.- D+Wx\tCombination\tMax\t0,1682\t0,0496\t4,9898\t-0,0312\t0\t0',
].join('\n');

const fmtF = (kgf: number) => (kgf / 1000).toFixed(2); // → tonf
const fmtM = (kgfcm: number) => (kgfcm / 1e5).toFixed(2); // → tonf·m
const fmtRatio = (r: number) => (Number.isFinite(r) ? r.toFixed(2) : '∞');

const rowKey = (r: { joint: string; combo: string; stepType: string }) =>
  `${r.joint}|${r.combo}|${r.stepType}`;

function ratioClass(r: number): string {
  if (!Number.isFinite(r) || r > 1) return 'text-red-600 font-semibold';
  if (r >= 0.9) return 'text-amber-600 font-semibold';
  return 'text-ink';
}

export default function ZapataSweepPanel({ geom, model, onLoadRow }: Props) {
  const [open, setOpen] = useState(false);
  const [rawText, setRawText] = useState('');
  const [forceKey, setForceKey] = useState('auto');
  const [momentKey, setMomentKey] = useState('auto');
  const [swapAxes, setSwapAxes] = useState(false);
  const [onlyCombos, setOnlyCombos] = useState(true);
  const [amplify, setAmplify] = useState(true);
  const [qa, setQa] = useState(2.0);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const parsed = useMemo(
    () => (rawText.trim() !== '' ? parseSapReactions(rawText) : null),
    [rawText]
  );

  const effForceKey = forceKey === 'auto' ? (parsed?.detectedForceUnit ?? 'tonf') : forceKey;
  const effMomentKey = momentKey === 'auto' ? (parsed?.detectedMomentUnit ?? 'tonf-m') : momentKey;
  const forceUnit = unitByKey(FORCE_UNITS, effForceKey) ?? FORCE_UNITS[0];
  const momentUnit = unitByKey(MOMENT_UNITS, effMomentKey) ?? MOMENT_UNITS[0];

  const { loadRows, nExcluded } = useMemo(() => {
    if (!parsed) return { loadRows: [] as PlateLoadRow[], nExcluded: 0 };
    const kept = onlyCombos
      ? parsed.rows.filter((r) => r.caseType === '' || /comb/i.test(r.caseType))
      : parsed.rows;
    return {
      loadRows: toPlateLoads(kept, forceUnit.factor, momentUnit.factor, swapAxes),
      nExcluded: parsed.rows.length - kept.length,
    };
  }, [parsed, onlyCombos, forceUnit, momentUnit, swapAxes]);

  const arm = amplify ? geom.Hped + geom.T : 0;
  const deferredGeom = useDeferredValue(geom);
  const sweep = useMemo(
    () =>
      model && loadRows.length > 0
        ? sweepZapata(model, deferredGeom, qa, amplify ? deferredGeom.Hped + deferredGeom.T : 0, loadRows)
        : null,
    [model, deferredGeom, qa, amplify, loadRows]
  );

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setRawText(String(reader.result ?? ''));
    reader.readAsText(file);
  };

  const load = (row: ZapataSweepRow) => {
    setLoadedKey(rowKey(row));
    onLoadRow({ Pcol: row.Pcol, MxEff: row.MxEff, MyEff: row.MyEff });
  };

  const loadBtn = (row: ZapataSweepRow) => (
    <button
      type="button"
      onClick={() => load(row)}
      className={`rounded border px-2 py-0.5 text-xs whitespace-nowrap ${
        loadedKey === rowKey(row)
          ? 'border-accent bg-accent/10 text-accent'
          : 'border-border text-muted hover:border-accent hover:text-accent'
      }`}
      title="Cargar estas cargas en el formulario para ver el mapa de presión"
    >
      {loadedKey === rowKey(row) ? 'cargado ✓' : 'ver caso →'}
    </button>
  );

  const flagsMark = (row: ZapataSweepRow) =>
    row.flags.length > 0 && (
      <span className="ml-1 cursor-help text-amber-600" title={row.flags.join('\n')}>
        ⚠
      </span>
    );

  return (
    <details
      className="mt-8 rounded border border-border"
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-ink">
        Barrido SAP2000 — Joint Reactions
        <span className="ml-2 font-normal text-muted">
          pega la tabla y detecta la combinación que controla cada nudo
        </span>
      </summary>

      <div className="border-t border-border p-4">
        <p className="mb-3 text-xs leading-relaxed text-muted">
          Copia la tabla <strong>Joint Reactions</strong> desde SAP2000 (Display → Show Tables,
          con las combinaciones seleccionadas) o sube el CSV exportado. Cada fila se evalúa con
          la zapata definida arriba: P = +F3 (reacción vertical = compresión), Mₓ = M1,
          M_y = M2 (ejes globales; M3 se ignora). Con «amplificar por corte» los momentos se
          llevan al sello: M′ₓ = M1 + F2·(H_ped + T), M′_y = M2 + F1·(H_ped + T). Los pesos
          propios y el relleno se agregan igual que en el formulario. La presión máxima de cada
          caso se compara contra la admisible q_a.
        </p>

        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder={PLACEHOLDER}
          spellCheck={false}
          className="h-40 w-full rounded border border-border bg-white p-2 font-mono text-xs text-ink focus:border-accent focus:outline-none"
        />

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          <label className="text-muted">
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt,.tsv"
              onChange={(e) => handleFile(e.target.files?.[0])}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded border border-border px-2 py-1 text-muted hover:border-accent hover:text-accent"
            >
              Subir CSV…
            </button>
          </label>
          {rawText !== '' && (
            <button
              type="button"
              onClick={() => {
                setRawText('');
                setLoadedKey(null);
                if (fileRef.current) fileRef.current.value = '';
              }}
              className="rounded border border-border px-2 py-1 text-muted hover:border-red-400 hover:text-red-600"
            >
              Limpiar
            </button>
          )}
          <label className="flex items-center gap-1 text-muted">
            Fuerza
            <select
              value={forceKey}
              onChange={(e) => setForceKey(e.target.value)}
              className="rounded border border-border bg-white px-1 py-0.5 text-ink"
            >
              <option value="auto">
                auto{parsed?.detectedForceUnit ? ` (${forceUnit.label})` : ' (tonf)'}
              </option>
              {FORCE_UNITS.map((u) => (
                <option key={u.key} value={u.key}>
                  {u.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1 text-muted">
            Momento
            <select
              value={momentKey}
              onChange={(e) => setMomentKey(e.target.value)}
              className="rounded border border-border bg-white px-1 py-0.5 text-ink"
            >
              <option value="auto">
                auto{parsed?.detectedMomentUnit ? ` (${momentUnit.label})` : ' (tonf·m)'}
              </option>
              {MOMENT_UNITS.map((u) => (
                <option key={u.key} value={u.key}>
                  {u.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1 text-muted">
            q_a
            <input
              type="number"
              step={0.25}
              value={qa}
              onChange={(e) => setQa(e.target.value === '' ? 0 : Number(e.target.value))}
              className="w-16 rounded border border-border bg-white px-1 py-0.5 text-ink"
            />
            kgf/cm²
          </label>
          <label className="flex items-center gap-1.5 text-muted">
            <input
              type="checkbox"
              checked={amplify}
              onChange={(e) => setAmplify(e.target.checked)}
              className="accent-current"
            />
            Amplificar por corte (brazo {arm.toFixed(0)} cm)
          </label>
          <label className="flex items-center gap-1.5 text-muted">
            <input
              type="checkbox"
              checked={swapAxes}
              onChange={(e) => setSwapAxes(e.target.checked)}
              className="accent-current"
            />
            Zapata rotada 90° (x ↔ y)
          </label>
          <label className="flex items-center gap-1.5 text-muted">
            <input
              type="checkbox"
              checked={onlyCombos}
              onChange={(e) => setOnlyCombos(e.target.checked)}
              className="accent-current"
            />
            Solo combinaciones
          </label>
        </div>

        {parsed && (
          <div className="mt-3 text-xs text-muted">
            {parsed.rows.length} filas leídas
            {nExcluded > 0 && ` (${nExcluded} excluidas por no ser combinación)`}
            {parsed.skipped > 0 && ` · ${parsed.skipped} líneas no interpretadas`}
            {sweep && (
              <>
                {' '}
                · {sweep.nJoints} nudos · {sweep.nCombos} combinaciones
                {sweep.nOut > 0 && ` · ${sweep.nOut} filas fuera de la envolvente ⚠`}
              </>
            )}
          </div>
        )}
        {parsed?.warnings.map((w) => (
          <div key={w} className="mt-2 rounded border border-amber-300 bg-amber-50 p-2 text-xs text-amber-800">
            {w}
          </div>
        ))}
        {!model && rawText.trim() !== '' && (
          <p className="mt-2 text-xs text-muted">Cargando modelo…</p>
        )}

        {sweep && sweep.worst && (
          <>
            {/* ── Resumen ── */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-border bg-surface px-3 py-2 text-center">
                <div className="text-xs text-muted">q máx barrido</div>
                <div className={`text-lg font-semibold ${qa > 0 ? ratioClass(sweep.worst.ratio) : 'text-ink'}`}>
                  {sweep.worst.netTension ? '∞' : sweep.worst.qMax.toFixed(2)}{' '}
                  <span className="text-xs font-normal text-muted">kgf/cm²</span>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-surface px-3 py-2 text-center">
                <div className="text-xs text-muted">Contacto mínimo</div>
                <div className="text-lg font-semibold text-ink">
                  {sweep.contactMinRow ? `${(sweep.contactMinRow.contact * 100).toFixed(0)} %` : '—'}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-surface px-3 py-2 text-center">
                <div className="text-xs text-muted">Filas NO OK (q &gt; q_a)</div>
                <div className={`text-lg font-semibold ${sweep.nFail > 0 ? 'text-red-700' : 'text-ink'}`}>
                  {sweep.nFail} / {sweep.rows.length}
                </div>
              </div>
              <div
                className={`rounded-lg border px-3 py-2 text-center ${
                  sweep.okGlobal ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                }`}
              >
                <div className="text-xs text-muted">Barrido</div>
                <div className={`text-lg font-bold ${sweep.okGlobal ? 'text-green-700' : 'text-red-700'}`}>
                  {sweep.okGlobal ? 'OK' : 'NO OK'}
                </div>
              </div>
            </div>

            {/* ── Caso que controla ── */}
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded border border-border bg-surface/50 p-3 text-sm">
              <span className="text-muted">Controla:</span>
              <span className="font-medium text-ink">
                nudo {sweep.worst.joint} · {sweep.worst.combo}
                {sweep.worst.stepType && ` (${sweep.worst.stepType})`}
              </span>
              {!sweep.worst.netTension && (
                <span className="text-muted">
                  q máx {sweep.worst.qMax.toFixed(2)} kgf/cm² · contacto{' '}
                  {(sweep.worst.contact * 100).toFixed(0)} %
                </span>
              )}
              {flagsMark(sweep.worst)}
              {loadBtn(sweep.worst)}
            </div>
            {sweep.nTension > 0 && (
              <div className="mt-2 rounded border border-red-300 bg-red-50 p-2 text-xs text-red-700">
                {sweep.nTension} fila(s) con tracción neta (N ≤ 0 incluso con pesos propios):
                la zapata gravitacional no puede equilibrarlas.
              </div>
            )}

            {/* ── Crítico por nudo ── */}
            <h3 className="mt-5 text-sm font-medium text-ink">
              Combinación que controla cada nudo
            </h3>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-left text-muted">
                    <th className="py-1.5 pr-2 font-medium">Nudo</th>
                    <th className="py-1.5 pr-2 font-medium">Combinación</th>
                    <th className="py-1.5 pr-2 font-medium">P [tonf]</th>
                    <th className="py-1.5 pr-2 font-medium">M′ₓ [tonf·m]</th>
                    <th className="py-1.5 pr-2 font-medium">M′_y [tonf·m]</th>
                    <th className="py-1.5 pr-2 font-medium">Contacto</th>
                    <th className="py-1.5 pr-2 font-medium">q máx</th>
                    <th className="py-1.5 pr-2 font-medium">q/q_a</th>
                    <th className="py-1.5 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {sweep.byJoint.map(({ joint, nRows, worst, contactMin }) => (
                    <tr key={joint} className="border-b border-border/60">
                      <td className="py-1.5 pr-2 font-mono font-medium text-ink">
                        {joint}
                        <span className="ml-1 font-sans text-[10px] text-muted">({nRows})</span>
                      </td>
                      <td className="py-1.5 pr-2 text-ink">
                        {worst.combo}
                        {worst.stepType && (
                          <span className="ml-1 text-[10px] text-muted">{worst.stepType}</span>
                        )}
                      </td>
                      <td className="py-1.5 pr-2 font-mono whitespace-nowrap">{fmtF(worst.Pcol)}</td>
                      <td className="py-1.5 pr-2 font-mono whitespace-nowrap">{fmtM(worst.MxEff)}</td>
                      <td className="py-1.5 pr-2 font-mono whitespace-nowrap">{fmtM(worst.MyEff)}</td>
                      <td className="py-1.5 pr-2 font-mono whitespace-nowrap">
                        {worst.netTension ? '—' : `${(worst.contact * 100).toFixed(0)} %`}
                        {contactMin < worst.contact - 1e-9 && (
                          <span
                            className="ml-1 font-sans text-[10px] text-muted"
                            title="Menor contacto entre todas las combinaciones de este nudo"
                          >
                            (mín {(contactMin * 100).toFixed(0)} %)
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 pr-2 font-mono whitespace-nowrap">
                        {worst.netTension ? '∞' : worst.qMax.toFixed(2)}
                      </td>
                      <td className={`py-1.5 pr-2 font-mono whitespace-nowrap ${qa > 0 ? ratioClass(worst.ratio) : 'text-muted'}`}>
                        {qa > 0 ? (
                          <>
                            {fmtRatio(worst.ratio)} {worst.ok ? '✓' : '✗'}
                          </>
                        ) : (
                          '—'
                        )}
                        {flagsMark(worst)}
                      </td>
                      <td className="py-1.5">{loadBtn(worst)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-muted">
              El barrido usa la zapata definida arriba para todos los nudos (zapata tipo) y el
              mismo surrogate del formulario; el campo se evalúa con |e|/B y |e|/L (es simétrico
              por cuadrante). «ver caso →» carga P y los momentos efectivos en el formulario
              para inspeccionar el mapa de presión. ⚠ marca casos fuera de la envolvente de
              entrenamiento — su predicción es extrapolación.
            </p>
          </>
        )}
      </div>
    </details>
  );
}
