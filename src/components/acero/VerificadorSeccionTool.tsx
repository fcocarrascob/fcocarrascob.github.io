import { useMemo, useState } from 'react';
import { verificarSeccion } from '../../lib/acero/seccion';
import { MATERIALES, type MaterialKey } from '../../lib/acero/propiedades';
import { generarMemoria, abrirEnCanvas, descargarMemoria } from '../../lib/acero/memoria';
import type {
  EntradaVerificacion,
  EstadoLimite,
  Familia,
  Geom,
  Propiedades,
  TipoI,
} from '../../lib/acero/tipos';

// Unidades de la UI: geometría en cm, longitudes en m, fuerzas en tonf,
// momentos en tonf·m. El motor trabaja en kgf y cm.
const M = 100;
const TONF = 1000;
const TONF_M = 100000;

type Modo = 'capacidad' | 'demanda';

interface FormValues {
  modo: Modo;
  familia: Familia;
  tipoI: TipoI;
  material: MaterialKey;
  // Perfil I [cm]
  d: number;
  bf: number;
  tf: number;
  tw: number;
  // HSS rectangular [cm]
  B: number;
  H: number;
  tR: number;
  // HSS circular [cm]
  Dext: number;
  tC: number;
  // Propiedades de catálogo (0 = no declarada, se usa la derivada)
  usarCatalogo: boolean;
  Ag: number;
  Ix: number;
  Iy: number;
  Sx: number;
  Zx: number;
  rx: number;
  ry: number;
  rts: number;
  J: number;
  ho: number;
  // Estabilidad [m]
  Lcx: number;
  Lcy: number;
  Lcz: number;
  Lb: number;
  Cb: number;
  B1: number;
  // Demandas [tonf, tonf·m]
  Pu: number;
  Tu: number;
  Mux: number;
  Muy: number;
  Vu: number;
  estados: EstadoLimite[];
}

const DEFAULTS: FormValues = {
  modo: 'capacidad',
  familia: 'I',
  tipoI: 'laminado',
  material: 'A992',
  // W250×73 — el caso de la planilla columna-galpon-compresion.
  d: 25.3,
  bf: 25.4,
  tf: 1.42,
  tw: 0.86,
  B: 10.16,
  H: 10.16,
  tR: 0.59,
  Dext: 16.83,
  tC: 0.55,
  usarCatalogo: true,
  Ag: 92.8,
  Ix: 0,
  Iy: 0,
  Sx: 0,
  Zx: 0,
  rx: 11.0,
  ry: 6.46,
  rts: 0,
  J: 0,
  ho: 0,
  Lcx: 15,
  Lcy: 3.75,
  Lcz: 3.75,
  Lb: 3.75,
  Cb: 1,
  B1: 1,
  Pu: 65,
  Tu: 0,
  Mux: 0,
  Muy: 0,
  Vu: 0,
  estados: ['compresion', 'flexion-x', 'corte', 'interaccion'],
};

const ESTADOS: Array<{ id: EstadoLimite; label: string }> = [
  { id: 'compresion', label: 'Compresión (Cap. E)' },
  { id: 'traccion', label: 'Tracción (D2)' },
  { id: 'flexion-x', label: 'Flexión eje fuerte (Cap. F)' },
  { id: 'flexion-y', label: 'Flexión eje débil' },
  { id: 'corte', label: 'Corte (Cap. G)' },
  { id: 'interaccion', label: 'Interacción (H1)' },
  { id: 'sismico', label: 'Sísmico (NCh2369)' },
];

const CLASE_COLOR: Record<string, string> = {
  compacta: 'text-emerald-700',
  'no-compacta': 'text-amber-700',
  esbelta: 'text-red-700',
};

// ── Campos ───────────────────────────────────────────────────────────────────

function campo(
  label: string,
  value: number,
  onChange: (v: number) => void,
  opts: { step?: number; min?: number; sufijo?: string } = {}
) {
  return (
    <label className="text-sm" key={label}>
      <span className="block text-muted">
        {label}
        {opts.sufijo ? <span className="text-xs"> [{opts.sufijo}]</span> : null}
      </span>
      <input
        type="number"
        value={Number.isFinite(value) ? value : ''}
        step={opts.step ?? 0.01}
        min={opts.min}
        onChange={(e) => onChange(e.target.valueAsNumber)}
        className="mt-1 w-full rounded border border-border bg-white px-2 py-1 text-ink focus:border-accent focus:outline-none"
      />
    </label>
  );
}

function fmt(v: number, dec = 2): string {
  if (!Number.isFinite(v)) return '—';
  return v.toLocaleString('es-CL', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

// ── Componente ───────────────────────────────────────────────────────────────

export default function VerificadorSeccionTool() {
  const [v, setValues] = useState<FormValues>(DEFAULTS);
  const set = <K extends keyof FormValues>(key: K, val: FormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: val }));

  /**
   * Cambiar de familia limpia las propiedades declaradas: son de la sección
   * anterior y aplicarlas a otra da números sin sentido (un A_g de W250×73
   * sobre un HSS 4×4×¼, por ejemplo).
   */
  const setFamilia = (f: Familia) =>
    setValues((prev) => ({
      ...prev,
      familia: f,
      usarCatalogo: false,
      Ag: 0, Ix: 0, Iy: 0, Sx: 0, Zx: 0, rx: 0, ry: 0, rts: 0, J: 0, ho: 0,
    }));

  const geom = useMemo<Geom>(() => {
    if (v.familia === 'I') return { familia: 'I', tipo: v.tipoI, d: v.d, bf: v.bf, tf: v.tf, tw: v.tw };
    if (v.familia === 'HSS-R') return { familia: 'HSS-R', B: v.B, H: v.H, t: v.tR };
    return { familia: 'HSS-C', D: v.Dext, t: v.tC };
  }, [v.familia, v.tipoI, v.d, v.bf, v.tf, v.tw, v.B, v.H, v.tR, v.Dext, v.tC]);

  const errores = useMemo(() => {
    const e: string[] = [];
    const pos = (n: number, nombre: string) => {
      if (!Number.isFinite(n) || n <= 0) e.push(`${nombre} debe ser mayor que cero.`);
    };
    if (v.familia === 'I') {
      pos(v.d, 'd');
      pos(v.bf, 'b_f');
      pos(v.tf, 't_f');
      pos(v.tw, 't_w');
      if (v.d <= 2 * v.tf) e.push('d debe superar 2·t_f: el alma quedaría de altura nula o negativa.');
    } else if (v.familia === 'HSS-R') {
      pos(v.B, 'B');
      pos(v.H, 'H');
      pos(v.tR, 't');
      if (Math.min(v.B, v.H) <= 3 * v.tR) e.push('El lado menor debe superar 3·t (nota (d) de la Tabla B4.1a).');
    } else {
      pos(v.Dext, 'D');
      pos(v.tC, 't');
      if (v.Dext <= 2 * v.tC) e.push('D debe superar 2·t.');
    }
    if (v.Cb < 1) e.push('C_b no puede ser menor que 1,0.');
    if (v.B1 < 1) e.push('B₁ no puede ser menor que 1,0 (Ec. A-8-3 lleva el mínimo).');
    return e;
  }, [v]);

  const declaradas = useMemo<Partial<Propiedades> | undefined>(() => {
    if (!v.usarCatalogo) return undefined;
    const d: Partial<Propiedades> = {};
    const put = (k: keyof Propiedades, val: number) => {
      if (Number.isFinite(val) && val > 0) d[k] = val;
    };
    put('Ag', v.Ag);
    put('Ix', v.Ix);
    put('Iy', v.Iy);
    put('Sx', v.Sx);
    put('Zx', v.Zx);
    put('rx', v.rx);
    put('ry', v.ry);
    put('rts', v.rts);
    put('J', v.J);
    put('ho', v.ho);
    return Object.keys(d).length > 0 ? d : undefined;
  }, [v.usarCatalogo, v.Ag, v.Ix, v.Iy, v.Sx, v.Zx, v.rx, v.ry, v.rts, v.J, v.ho]);

  const entrada = useMemo<EntradaVerificacion>(
    () => ({
      geom,
      material: MATERIALES[v.material],
      declaradas,
      estabilidad: {
        Lcx: v.Lcx * M,
        Lcy: v.Lcy * M,
        Lcz: v.Lcz * M,
        Lb: v.Lb * M,
        Cb: v.Cb,
        B1: v.B1,
      },
      demandas:
        v.modo === 'capacidad'
          ? { Pu: 0, Tu: 0, Mux: 0, Muy: 0, Vu: 0 }
          : {
              Pu: v.Pu * TONF,
              Tu: v.Tu * TONF,
              Mux: v.Mux * TONF_M,
              Muy: v.Muy * TONF_M,
              Vu: v.Vu * TONF,
            },
      estados: v.estados,
    }),
    [geom, declaradas, v]
  );

  const resultado = useMemo(() => {
    if (errores.length > 0) return null;
    try {
      return verificarSeccion(entrada);
    } catch {
      return null;
    }
  }, [entrada, errores]);

  const toggleEstado = (id: EstadoLimite) =>
    set(
      'estados',
      v.estados.includes(id) ? v.estados.filter((e) => e !== id) : [...v.estados, id]
    );

  const p = resultado?.propiedades;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
      {/* ── Entradas ───────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
          {(['capacidad', 'demanda'] as Modo[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => set('modo', m)}
              className={`flex-1 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                v.modo === m ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              {m === 'capacidad' ? 'Capacidad' : 'Demanda'}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted leading-relaxed">
          {v.modo === 'capacidad'
            ? 'Qué aguanta la sección: φP_n, φM_n y φV_n con el estado límite que gobierna cada uno.'
            : 'Si pasa: los mismos φR_n contra las demandas, más la interacción H1-1.'}
        </p>

        <fieldset className="rounded-lg border border-border bg-surface p-3">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-muted">Sección</legend>
          <div className="flex gap-1 rounded border border-border bg-white p-1">
            {(
              [
                ['I', 'Perfil I'],
                ['HSS-R', 'HSS rect.'],
                ['HSS-C', 'HSS circ.'],
              ] as Array<[Familia, string]>
            ).map(([f, label]) => (
              <button
                key={f}
                type="button"
                onClick={() => setFamilia(f)}
                className={`flex-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                  v.familia === f ? 'bg-accent text-white' : 'text-muted hover:text-ink'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {v.familia === 'I' && (
            <>
              <label className="mt-3 block text-sm">
                <span className="block text-muted">Tipo</span>
                <select
                  value={v.tipoI}
                  onChange={(e) => set('tipoI', e.target.value as TipoI)}
                  className="mt-1 w-full rounded border border-border bg-white px-2 py-1 text-ink focus:border-accent focus:outline-none"
                >
                  <option value="laminado">Laminado (con redondeos de unión)</option>
                  <option value="armado">Armado / soldado</option>
                </select>
              </label>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {campo('d', v.d, (n) => set('d', n), { sufijo: 'cm' })}
                {campo('b_f', v.bf, (n) => set('bf', n), { sufijo: 'cm' })}
                {campo('t_f', v.tf, (n) => set('tf', n), { sufijo: 'cm' })}
                {campo('t_w', v.tw, (n) => set('tw', n), { sufijo: 'cm' })}
              </div>
            </>
          )}

          {v.familia === 'HSS-R' && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {campo('B (ancho)', v.B, (n) => set('B', n), { sufijo: 'cm' })}
              {campo('H (altura)', v.H, (n) => set('H', n), { sufijo: 'cm' })}
              {campo('t de diseño', v.tR, (n) => set('tR', n), { sufijo: 'cm' })}
            </div>
          )}

          {v.familia === 'HSS-C' && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {campo('D exterior', v.Dext, (n) => set('Dext', n), { sufijo: 'cm' })}
              {campo('t de diseño', v.tC, (n) => set('tC', n), { sufijo: 'cm' })}
            </div>
          )}

          <label className="mt-3 block text-sm">
            <span className="block text-muted">Acero</span>
            <select
              value={v.material}
              onChange={(e) => set('material', e.target.value as MaterialKey)}
              className="mt-1 w-full rounded border border-border bg-white px-2 py-1 text-ink focus:border-accent focus:outline-none"
            >
              {(Object.keys(MATERIALES) as MaterialKey[]).map((k) => (
                <option key={k} value={k}>
                  {MATERIALES[k].nombre} — F_y = {MATERIALES[k].Fy} kgf/cm²
                </option>
              ))}
            </select>
          </label>
        </fieldset>

        <details className="rounded-lg border border-border bg-surface p-3" open={v.usarCatalogo}>
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-muted">
            Propiedades de catálogo (opcional)
          </summary>
          <p className="mt-2 text-xs text-muted leading-relaxed">
            Lo derivable se deriva de las planchas; lo que declares acá lo pisa. Las planchas no
            llevan los redondeos de unión ala-alma, así que dan menos área y menos módulo —
            declarar la fila de catálogo cierra esa diferencia. Un 0 significa «usa la derivada».
          </p>
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={v.usarCatalogo}
              onChange={(e) => set('usarCatalogo', e.target.checked)}
            />
            <span className="text-muted">Usar los valores declarados</span>
          </label>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {campo('A_g', v.Ag, (n) => set('Ag', n), { sufijo: 'cm²' })}
            {campo('r_x', v.rx, (n) => set('rx', n), { sufijo: 'cm' })}
            {campo('r_y', v.ry, (n) => set('ry', n), { sufijo: 'cm' })}
            {campo('I_x', v.Ix, (n) => set('Ix', n), { sufijo: 'cm⁴' })}
            {campo('I_y', v.Iy, (n) => set('Iy', n), { sufijo: 'cm⁴' })}
            {campo('S_x', v.Sx, (n) => set('Sx', n), { sufijo: 'cm³' })}
            {campo('Z_x', v.Zx, (n) => set('Zx', n), { sufijo: 'cm³' })}
            {campo('r_ts', v.rts, (n) => set('rts', n), { sufijo: 'cm' })}
            {campo('J', v.J, (n) => set('J', n), { sufijo: 'cm⁴' })}
            {campo('h_o', v.ho, (n) => set('ho', n), { sufijo: 'cm' })}
          </div>
        </details>

        <fieldset className="rounded-lg border border-border bg-surface p-3">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-muted">
            Estabilidad
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {campo('L_cx = K_x·L_x', v.Lcx, (n) => set('Lcx', n), { sufijo: 'm' })}
            {campo('L_cy = K_y·L_y', v.Lcy, (n) => set('Lcy', n), { sufijo: 'm' })}
            {campo('L_cz (torsión)', v.Lcz, (n) => set('Lcz', n), { sufijo: 'm' })}
            {campo('L_b (ala comprimida)', v.Lb, (n) => set('Lb', n), { sufijo: 'm' })}
            {campo('C_b (Ec. F1-1)', v.Cb, (n) => set('Cb', n), { min: 1 })}
            {campo('B₁ (Ap. 8)', v.B1, (n) => set('B1', n), { min: 1 })}
          </div>
          <p className="mt-2 text-xs text-muted leading-relaxed">
            C_b y B₁ entran como dato con default 1,0 (conservador): derivarlos exige el diagrama
            de momentos, que es del análisis y no de la sección.
          </p>
        </fieldset>

        {v.modo === 'demanda' && (
          <fieldset className="rounded-lg border border-border bg-surface p-3">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-muted">
              Demandas mayoradas
            </legend>
            <div className="grid grid-cols-2 gap-3">
              {campo('P_u (compresión)', v.Pu, (n) => set('Pu', n), { sufijo: 'tonf' })}
              {campo('T_u (tracción)', v.Tu, (n) => set('Tu', n), { sufijo: 'tonf' })}
              {campo('M_ux', v.Mux, (n) => set('Mux', n), { sufijo: 'tonf·m' })}
              {campo('M_uy', v.Muy, (n) => set('Muy', n), { sufijo: 'tonf·m' })}
              {campo('V_u', v.Vu, (n) => set('Vu', n), { sufijo: 'tonf' })}
            </div>
          </fieldset>
        )}

        <fieldset className="rounded-lg border border-border bg-surface p-3">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-muted">
            Verificaciones
          </legend>
          <div className="space-y-1.5">
            {ESTADOS.map(({ id, label }) => (
              <label key={id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={v.estados.includes(id)}
                  onChange={() => toggleEstado(id)}
                />
                <span className="text-ink">{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {/* ── Resultados ─────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {errores.length > 0 && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3">
            <p className="text-sm font-semibold text-red-800">Revisa la geometría</p>
            <ul className="mt-1 list-disc pl-5 text-sm text-red-700">
              {errores.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        {resultado && p && (
          <>
            <div className="rounded-lg border border-border bg-surface p-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
                Propiedades
              </h2>
              <dl className="mt-2 grid grid-cols-3 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
                {(
                  [
                    ['A_g', p.Ag, 'cm²', 1],
                    ['peso', p.peso, 'kg/m', 1],
                    ['I_x', p.Ix, 'cm⁴', 0],
                    ['I_y', p.Iy, 'cm⁴', 0],
                    ['S_x', p.Sx, 'cm³', 0],
                    ['Z_x', p.Zx, 'cm³', 0],
                    ['r_x', p.rx, 'cm', 2],
                    ['r_y', p.ry, 'cm', 2],
                    ['r_ts', p.rts, 'cm', 2],
                    ['J', p.J, 'cm⁴', 1],
                    ['C_w', p.Cw, 'cm⁶', 0],
                    ['h_o', p.ho, 'cm', 2],
                  ] as Array<[string, number, string, number]>
                )
                  .filter(([, val]) => val > 0)
                  .map(([k, val, u, dec]) => (
                    <div key={k}>
                      <dt className="text-muted">{k}</dt>
                      <dd className="font-mono text-ink">
                        {fmt(val, dec)} <span className="text-xs text-muted">{u}</span>
                      </dd>
                    </div>
                  ))}
              </dl>
            </div>

            <div className="rounded-lg border border-border bg-surface p-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
                Clasificación (Tablas B4.1a y B4.1b)
              </h2>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted">
                      <th className="py-1 pr-3 font-medium">Elemento</th>
                      <th className="py-1 pr-3 font-medium">λ</th>
                      <th className="py-1 pr-3 font-medium">λ_p</th>
                      <th className="py-1 pr-3 font-medium">λ_r</th>
                      <th className="py-1 pr-3 font-medium">Clase</th>
                      <th className="py-1 font-medium">Ref.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...resultado.clasificacion.compresion, ...resultado.clasificacion.flexion].map(
                      (e, i) => (
                        <tr key={`${e.id}-${i}`} className="border-b border-border/50">
                          <td className="py-1 pr-3 text-ink">{e.nombre}</td>
                          <td className="py-1 pr-3 font-mono">{fmt(e.lambda, 2)}</td>
                          <td className="py-1 pr-3 font-mono text-muted">
                            {e.lambdap !== undefined ? fmt(e.lambdap, 2) : '—'}
                          </td>
                          <td className="py-1 pr-3 font-mono text-muted">{fmt(e.lambdar, 2)}</td>
                          <td className={`py-1 pr-3 font-medium ${CLASE_COLOR[e.clase]}`}>{e.clase}</td>
                          <td className="py-1 text-xs text-muted">{e.ref}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-3">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {v.modo === 'capacidad' ? 'Capacidades de diseño' : 'Verificaciones'}
                </h2>
                {v.modo === 'demanda' && (
                  <span className={`text-sm font-semibold ${resultado.okGlobal ? 'text-emerald-700' : 'text-red-700'}`}>
                    {resultado.okGlobal ? '✓ pasa' : '✗ no pasa'} · uso máx {fmt(resultado.usoMaximo, 2)}
                  </span>
                )}
              </div>
              <div className="mt-2 space-y-2">
                {resultado.checks.map((c) => (
                  <div key={c.id} className="rounded border border-border bg-white p-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-medium text-ink">
                        {c.ref ? (
                          <a href={`/acero/${c.ref}`} className="text-accent hover:underline">
                            {c.nombre}
                          </a>
                        ) : (
                          c.nombre
                        )}
                      </span>
                      <span className="font-mono text-sm text-ink">
                        {v.modo === 'demanda' && c.demanda > 0 ? (
                          <>
                            {fmt(c.demanda)} / {fmt(c.capacidad)}{' '}
                            <span className="text-xs text-muted">{c.unidad}</span>{' '}
                            <span className={c.ok ? 'text-emerald-700' : 'text-red-700'}>
                              {c.ok ? '✓' : '✗'} {fmt(c.ratio, 2)}
                            </span>
                          </>
                        ) : (
                          <>
                            {fmt(c.capacidad)} <span className="text-xs text-muted">{c.unidad}</span>
                          </>
                        )}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted leading-relaxed">{c.detalle}</p>
                  </div>
                ))}
              </div>
            </div>

            {resultado.warnings.length > 0 && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                  Avisos
                </h2>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-xs leading-relaxed text-amber-900">
                  {[...new Set(resultado.warnings)].map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => abrirEnCanvas(generarMemoria(entrada, resultado))}
                className="rounded border border-accent bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
              >
                Abrir memoria en el canvas
              </button>
              <button
                type="button"
                onClick={() => descargarMemoria(generarMemoria(entrada, resultado))}
                className="rounded border border-border bg-white px-3 py-1.5 text-sm font-medium text-ink hover:border-accent"
              >
                Descargar memoria .json
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
