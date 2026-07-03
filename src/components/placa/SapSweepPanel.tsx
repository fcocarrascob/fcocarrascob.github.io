import { useMemo, useRef, useState, useDeferredValue } from 'react';
import {
  FORCE_UNITS,
  MOMENT_UNITS,
  parseSapReactions,
  toPlateLoads,
  unitByKey,
  type PlateLoadRow,
} from '../../lib/sapReactions';
import { sweepPlaca, type PlacaGeom, type SweepRowResult } from '../../lib/placaBaseSweep';

interface Props {
  geom: PlacaGeom;
  onLoadRow: (row: PlateLoadRow) => void;
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

export default function SapSweepPanel({ geom, onLoadRow }: Props) {
  const [open, setOpen] = useState(false);
  const [rawText, setRawText] = useState('');
  const [forceKey, setForceKey] = useState('auto');
  const [momentKey, setMomentKey] = useState('auto');
  const [swapAxes, setSwapAxes] = useState(false);
  const [onlyCombos, setOnlyCombos] = useState(true);
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

  // El barrido corre miles de runPlaca(): diferir la geometría mantiene fluida
  // la escritura en los inputs mientras se recalcula.
  const deferredGeom = useDeferredValue(geom);
  const sweep = useMemo(
    () => (loadRows.length > 0 ? sweepPlaca(deferredGeom, loadRows) : null),
    [deferredGeom, loadRows]
  );

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setRawText(String(reader.result ?? ''));
    reader.readAsText(file);
  };

  const load = (row: SweepRowResult) => {
    setLoadedKey(rowKey(row));
    onLoadRow(row);
  };

  const loadBtn = (row: SweepRowResult) => (
    <button
      type="button"
      onClick={() => load(row)}
      className={`rounded border px-2 py-0.5 text-xs whitespace-nowrap ${
        loadedKey === rowKey(row)
          ? 'border-accent bg-accent/10 text-accent'
          : 'border-border text-muted hover:border-accent hover:text-accent'
      }`}
      title="Cargar estas cargas en el formulario para ver presiones y pernos"
    >
      {loadedKey === rowKey(row) ? 'cargado ✓' : 'ver caso →'}
    </button>
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
          pega la tabla y detecta la combinación que controla cada apoyo
        </span>
      </summary>

      <div className="border-t border-border p-4">
        <p className="mb-3 text-xs leading-relaxed text-muted">
          Copia la tabla <strong>Joint Reactions</strong> desde SAP2000 (Display → Show Tables,
          con las combinaciones seleccionadas) o sube el CSV exportado. Cada fila se evalúa con
          la placa definida arriba: Pu = +F3 (reacción vertical = compresión), Vux = F1,
          Vuy = F2, Mux = M1, Muy = M2 (ejes globales; M3 se ignora). Acepta coma o punto
          decimal y las filas Max/Min de combinaciones envolvente.
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
          <label className="flex items-center gap-1.5 text-muted">
            <input
              type="checkbox"
              checked={swapAxes}
              onChange={(e) => setSwapAxes(e.target.checked)}
              className="accent-current"
            />
            Columna rotada 90° (x ↔ y)
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
              </>
            )}
          </div>
        )}
        {parsed?.warnings.map((w) => (
          <div key={w} className="mt-2 rounded border border-amber-300 bg-amber-50 p-2 text-xs text-amber-800">
            {w}
          </div>
        ))}

        {sweep && sweep.worst && (
          <>
            {/* ── Resumen ── */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-border bg-surface px-3 py-2 text-center">
                <div className="text-xs text-muted">Ratio máximo</div>
                <div className={`text-lg font-semibold ${ratioClass(sweep.worst.maxRatio)}`}>
                  {fmtRatio(sweep.worst.maxRatio)}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-surface px-3 py-2 text-center">
                <div className="text-xs text-muted">t req barrido / t</div>
                <div className="text-lg font-semibold text-ink">
                  {sweep.tReqMax.toFixed(2)} / {geom.t.toFixed(2)}{' '}
                  <span className="text-xs font-normal text-muted">cm</span>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-surface px-3 py-2 text-center">
                <div className="text-xs text-muted">Filas NO OK</div>
                <div
                  className={`text-lg font-semibold ${sweep.nFail > 0 ? 'text-red-700' : 'text-ink'}`}
                >
                  {sweep.nFail} / {sweep.rows.length}
                </div>
              </div>
              <div
                className={`rounded-lg border px-3 py-2 text-center ${
                  sweep.okGlobal ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                }`}
              >
                <div className="text-xs text-muted">Barrido</div>
                <div
                  className={`text-lg font-bold ${sweep.okGlobal ? 'text-green-700' : 'text-red-700'}`}
                >
                  {sweep.okGlobal ? 'OK' : 'NO OK'}
                </div>
              </div>
            </div>

            {/* ── Caso que controla ── */}
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded border border-border bg-surface/50 p-3 text-sm">
              <span className="text-muted">Controla el diseño:</span>
              <span className="font-medium text-ink">
                nudo {sweep.worst.joint} · {sweep.worst.combo}
                {sweep.worst.stepType && ` (${sweep.worst.stepType})`}
              </span>
              <span className="text-muted">gobierna</span>
              <span className="font-medium text-ink">{sweep.worst.governs}</span>
              {loadBtn(sweep.worst)}
            </div>
            {sweep.nUnstable > 0 && (
              <div className="mt-2 rounded border border-red-300 bg-red-50 p-2 text-xs text-red-700">
                {sweep.nUnstable} fila(s) sin equilibrio posible con esta configuración de pernos
                (levantamiento o momento que los pernos no logran tomar).
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
                    <th className="py-1.5 pr-2 font-medium">Pu [tonf]</th>
                    <th className="py-1.5 pr-2 font-medium">Mux [tonf·m]</th>
                    <th className="py-1.5 pr-2 font-medium">Muy [tonf·m]</th>
                    <th className="py-1.5 pr-2 font-medium">V [tonf]</th>
                    <th className="py-1.5 pr-2 font-medium">Gobierna</th>
                    <th className="py-1.5 pr-2 font-medium">Ratio</th>
                    <th className="py-1.5 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {sweep.byJoint.map(({ joint, nRows, worst }) => (
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
                      <td className="py-1.5 pr-2 font-mono whitespace-nowrap">{fmtF(worst.Pu)}</td>
                      <td className="py-1.5 pr-2 font-mono whitespace-nowrap">{fmtM(worst.Mux)}</td>
                      <td className="py-1.5 pr-2 font-mono whitespace-nowrap">{fmtM(worst.Muy)}</td>
                      <td className="py-1.5 pr-2 font-mono whitespace-nowrap">
                        {fmtF(Math.hypot(worst.Vux, worst.Vuy))}
                      </td>
                      <td className="py-1.5 pr-2">{worst.governs}</td>
                      <td className={`py-1.5 pr-2 font-mono whitespace-nowrap ${ratioClass(worst.maxRatio)}`}>
                        {fmtRatio(worst.maxRatio)} {worst.ok ? '✓' : '✗'}
                      </td>
                      <td className="py-1.5">{loadBtn(worst)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Crítico por verificación ── */}
            <h3 className="mt-5 text-sm font-medium text-ink">
              Combinación que controla cada verificación
            </h3>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-left text-muted">
                    <th className="py-1.5 pr-2 font-medium">Verificación</th>
                    <th className="py-1.5 pr-2 font-medium">Nudo</th>
                    <th className="py-1.5 pr-2 font-medium">Combinación</th>
                    <th className="py-1.5 font-medium">Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  {sweep.byCheck.map((c) => (
                    <tr key={c.id} className="border-b border-border/60">
                      <td className="py-1.5 pr-2 text-ink">{c.nombre}</td>
                      <td className="py-1.5 pr-2 font-mono">{c.joint}</td>
                      <td className="py-1.5 pr-2">
                        {c.combo}
                        {c.stepType && (
                          <span className="ml-1 text-[10px] text-muted">{c.stepType}</span>
                        )}
                      </td>
                      <td className={`py-1.5 font-mono ${ratioClass(c.ratio)}`}>
                        {fmtRatio(c.ratio)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-muted">
              El barrido usa la placa definida arriba para todos los nudos (placa tipo). Al
              cambiar la geometría, el barrido se recalcula al instante. «ver caso →» carga esas
              cargas en el formulario para inspeccionar presiones, eje neutro y pernos.
            </p>
          </>
        )}
      </div>
    </details>
  );
}
