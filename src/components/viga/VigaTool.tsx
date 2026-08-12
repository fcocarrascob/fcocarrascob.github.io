import { useMemo, useRef, useState } from 'react';
import { analizarViga, evaluarEn } from '../../lib/viga/viga';
import { generarMemoria } from '../../lib/viga/memoria';
import { svgDiagramas, svgEsquema, ANCHO, EJE_X } from '../../lib/viga/dibujo';
import { abrirEnCanvas, descargarHoja } from '../../lib/canvas-handoff';
import type { Carga, EntradaViga, TipoApoyo } from '../../lib/viga/tipos';

// ─────────────────────────────────────────────────────────────────────────────
// Los campos se guardan como STRING, no como número.
//
// Con estado numérico no se puede vaciar un campo para reescribirlo: el '' se
// mapea a 0, la viga pasa por «largo cero» y la pantalla parpadea en rojo
// mientras se tipea. Con string, el análisis simplemente no corre hasta que
// todos los campos parsean.
// ─────────────────────────────────────────────────────────────────────────────

interface FTramo {
  L: string;
  rigidezRel: string;
}
interface FApoyo {
  x: string;
  tipo: TipoApoyo;
  k: string;
  ktheta: string;
}
type TipoCarga = 'distribuida' | 'puntual' | 'momento';
interface FCarga {
  tipo: TipoCarga;
  x: string;
  valor: string;
  x0: string;
  x1: string;
  w0: string;
  w1: string;
}

interface Modelo {
  tramos: FTramo[];
  apoyos: FApoyo[];
  cargas: FCarga[];
  E: string;
  I: string;
}

const cargaVacia = (): FCarga => ({
  tipo: 'distribuida',
  x: '3',
  valor: '30',
  x0: '0',
  x1: '6',
  w0: '20',
  w1: '20',
});

// ── Configuraciones de partida ───────────────────────────────────────────────

interface Preset {
  id: string;
  nombre: string;
  modelo: () => Modelo;
}

const base = (tramos: FTramo[], apoyos: FApoyo[], cargas: FCarga[]): Modelo => ({
  tramos,
  apoyos,
  cargas,
  E: '200000',
  I: '15000',
});

const tr = (L: string): FTramo => ({ L, rigidezRel: '1' });
const ap = (x: string, tipo: TipoApoyo = 'apoyo'): FApoyo => ({ x, tipo, k: '0', ktheta: '0' });
const udl = (x0: string, x1: string, w: string): FCarga => ({
  ...cargaVacia(),
  tipo: 'distribuida',
  x0,
  x1,
  w0: w,
  w1: w,
});
const pun = (x: string, P: string): FCarga => ({ ...cargaVacia(), tipo: 'puntual', x, valor: P });

const PRESETS: Preset[] = [
  {
    id: 'simple',
    nombre: 'Simplemente apoyada',
    modelo: () => base([tr('6')], [ap('0'), ap('6')], [udl('0', '6', '20')]),
  },
  {
    id: 'voladizo',
    nombre: 'Voladizo',
    modelo: () => base([tr('3')], [ap('0', 'empotrado')], [udl('0', '3', '15')]),
  },
  {
    id: 'biempotrada',
    nombre: 'Biempotrada',
    modelo: () =>
      base([tr('6')], [ap('0', 'empotrado'), ap('6', 'empotrado')], [udl('0', '6', '20')]),
  },
  {
    id: 'apoyada-empotrada',
    nombre: 'Apoyada-empotrada',
    modelo: () => base([tr('6')], [ap('0'), ap('6', 'empotrado')], [udl('0', '6', '20')]),
  },
  {
    id: 'dos-vanos',
    nombre: 'Dos vanos continuos',
    modelo: () =>
      base([tr('6'), tr('6')], [ap('0'), ap('6'), ap('12')], [udl('0', '12', '20')]),
  },
  {
    id: 'vano-voladizo',
    nombre: 'Vano con voladizo',
    modelo: () =>
      base([tr('6'), tr('2')], [ap('0'), ap('6')], [udl('0', '8', '20'), pun('8', '25')]),
  },
];

// ── Utilidades de formato ────────────────────────────────────────────────────

const coma = (v: number, dec = 2): string =>
  Number.isFinite(v) ? v.toFixed(dec).replace('.', ',') : '—';

const num = (s: string): number => {
  const t = s.trim().replace(',', '.');
  if (t === '') return NaN;
  return Number(t);
};

// ── Componentes de formulario ────────────────────────────────────────────────

function Campo({
  etiqueta,
  valor,
  onChange,
  sufijo,
  ancho = 'w-full',
}: {
  etiqueta?: string;
  valor: string;
  onChange: (v: string) => void;
  sufijo?: string;
  ancho?: string;
}) {
  return (
    <label className={`text-[11px] text-muted ${ancho}`}>
      {etiqueta}
      <span className="mt-0.5 flex items-center gap-1">
        <input
          type="text"
          inputMode="decimal"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded border border-border bg-white px-1.5 py-1 font-mono text-xs text-ink focus:border-accent focus:outline-none"
        />
        {sufijo && <span className="shrink-0 text-[10px] text-muted">{sufijo}</span>}
      </span>
    </label>
  );
}

function Tarjeta({
  titulo,
  accion,
  children,
}: {
  titulo: string;
  accion?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-surface p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-ink">{titulo}</h2>
        {accion}
      </div>
      {children}
    </section>
  );
}

const BotonMini = ({
  onClick,
  children,
  titulo,
}: {
  onClick: () => void;
  children: React.ReactNode;
  titulo?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={titulo}
    className="rounded border border-border bg-white px-2 py-0.5 text-[11px] text-muted transition-colors hover:border-accent hover:text-accent"
  >
    {children}
  </button>
);

// ── Herramienta ──────────────────────────────────────────────────────────────

export default function VigaTool() {
  const [mod, setMod] = useState<Modelo>(() => PRESETS[0].modelo());
  const [fallo, setFallo] = useState<string | null>(null);
  const [cursor, setCursor] = useState<number | null>(null);
  const cajaDiagramas = useRef<HTMLDivElement>(null);

  const editar = (parcial: Partial<Modelo>) => setMod((s) => ({ ...s, ...parcial }));

  const setTramo = (i: number, p: Partial<FTramo>) =>
    editar({ tramos: mod.tramos.map((t, j) => (i === j ? { ...t, ...p } : t)) });
  const setApoyo = (i: number, p: Partial<FApoyo>) =>
    editar({ apoyos: mod.apoyos.map((a, j) => (i === j ? { ...a, ...p } : a)) });
  const setCarga = (i: number, p: Partial<FCarga>) =>
    editar({ cargas: mod.cargas.map((c, j) => (i === j ? { ...c, ...p } : c)) });

  /** Largo total según lo que hay escrito ahora mismo. */
  const Ltot = useMemo(
    () => mod.tramos.reduce((s, t) => s + (num(t.L) || 0), 0),
    [mod.tramos]
  );

  /** Traduce el formulario a la entrada del motor, o `null` si algo no parsea. */
  const entrada = useMemo<EntradaViga | null>(() => {
    const tramos = mod.tramos.map((t) => ({ L: num(t.L), rigidezRel: num(t.rigidezRel) }));
    if (tramos.some((t) => !Number.isFinite(t.L) || !Number.isFinite(t.rigidezRel))) return null;

    const apoyos = mod.apoyos.map((a) => ({
      x: num(a.x),
      tipo: a.tipo,
      k: a.tipo === 'resorte' ? num(a.k) : undefined,
      ktheta: a.tipo === 'resorte' ? num(a.ktheta) : undefined,
    }));
    if (apoyos.some((a) => !Number.isFinite(a.x))) return null;
    if (apoyos.some((a) => a.tipo === 'resorte' && (!Number.isFinite(a.k) || !Number.isFinite(a.ktheta))))
      return null;

    const cargas: Carga[] = [];
    for (const c of mod.cargas) {
      if (c.tipo === 'distribuida') {
        const v = [num(c.x0), num(c.x1), num(c.w0), num(c.w1)];
        if (v.some((x) => !Number.isFinite(x))) return null;
        cargas.push({ tipo: 'distribuida', x0: v[0], x1: v[1], w0: v[2], w1: v[3] });
      } else if (c.tipo === 'puntual') {
        const v = [num(c.x), num(c.valor)];
        if (v.some((x) => !Number.isFinite(x))) return null;
        cargas.push({ tipo: 'puntual', x: v[0], P: v[1] });
      } else {
        const v = [num(c.x), num(c.valor)];
        if (v.some((x) => !Number.isFinite(x))) return null;
        cargas.push({ tipo: 'momento', x: v[0], M: v[1] });
      }
    }

    const E = num(mod.E);
    const I = num(mod.I);
    return {
      tramos,
      apoyos,
      cargas,
      E: Number.isFinite(E) && E > 0 ? E : undefined,
      I: Number.isFinite(I) && I > 0 ? I : undefined,
    };
  }, [mod]);

  // El motor lanza a propósito ante una viga inestable o una entrada imposible:
  // el mensaje es la mitad del valor de la herramienta, así que viaja junto al
  // resultado en vez de dejar la pantalla en blanco.
  const { res, error } = useMemo(() => {
    if (!entrada) return { res: null, error: 'Hay campos vacíos o que no son números.' };
    try {
      return { res: analizarViga(entrada), error: null as string | null };
    } catch (err) {
      return { res: null, error: err instanceof Error ? err.message : String(err) };
    }
  }, [entrada]);

  const esquema = useMemo(() => (entrada ? svgEsquema(entrada, ANCHO) : ''), [entrada]);
  const diagramas = useMemo(() => (res ? svgDiagramas(res, ANCHO) : ''), [res]);
  const lectura = useMemo(
    () => (res && cursor !== null ? evaluarEn(res, cursor) : null),
    [res, cursor]
  );

  /** Arma la memoria una vez por click y se la pasa a quien corresponda. */
  const conMemoria = (accion: (hoja: ReturnType<typeof generarMemoria>) => void) => {
    if (!entrada || !res) return;
    try {
      accion(generarMemoria(entrada, res));
      setFallo(null);
    } catch (err) {
      setFallo(err instanceof Error ? err.message : String(err));
    }
  };

  /** El overlay traduce el píxel del puntero a una posición de la viga. */
  const seguirCursor = (ev: React.MouseEvent<HTMLDivElement>) => {
    if (!res) return;
    const caja = cajaDiagramas.current;
    if (!caja) return;
    const r = caja.getBoundingClientRect();
    const enViewBox = ((ev.clientX - r.left) / r.width) * ANCHO;
    const t = (enViewBox - EJE_X.x0) / (EJE_X.x1 - EJE_X.x0);
    setCursor(Math.min(Math.max(t, 0), 1) * res.L);
  };

  const ajustarApoyos = () => {
    const bordes: number[] = [0];
    let a = 0;
    for (const t of mod.tramos) {
      a += num(t.L) || 0;
      bordes.push(a);
    }
    editar({
      apoyos: bordes.map((x, i) => ({
        ...(mod.apoyos[i] ?? ap('0')),
        x: String(Number(x.toFixed(6))),
      })),
    });
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)]">
      {/* ── Entradas ─────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <Tarjeta titulo="Configuración de partida">
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <BotonMini
                key={p.id}
                onClick={() => {
                  setMod(p.modelo());
                  setCursor(null);
                }}
              >
                {p.nombre}
              </BotonMini>
            ))}
          </div>
        </Tarjeta>

        <Tarjeta
          titulo="Tramos"
          accion={
            <div className="flex gap-1.5">
              <BotonMini
                onClick={ajustarApoyos}
                titulo="Deja un apoyo en cada borde de tramo, conservando los tipos"
              >
                apoyos a los bordes
              </BotonMini>
              <BotonMini onClick={() => editar({ tramos: [...mod.tramos, tr('5')] })}>
                + tramo
              </BotonMini>
            </div>
          }
        >
          <p className="mb-2 text-[11px] leading-snug text-muted">
            Un tramo es un trozo de <strong>rigidez constante</strong>, no necesariamente un vano:
            los apoyos se ubican aparte, por su posición. La rigidez relativa es lo único que
            decide el reparto de momentos en una viga hiperestática.
          </p>
          <div className="space-y-1.5">
            {mod.tramos.map((t, i) => (
              <div key={i} className="flex items-end gap-1.5">
                <span className="w-5 pb-1.5 text-[11px] text-muted">{i + 1}</span>
                <Campo
                  etiqueta="largo"
                  valor={t.L}
                  onChange={(v) => setTramo(i, { L: v })}
                  sufijo="m"
                />
                <Campo
                  etiqueta="EI relativo"
                  valor={t.rigidezRel}
                  onChange={(v) => setTramo(i, { rigidezRel: v })}
                />
                <button
                  type="button"
                  onClick={() => editar({ tramos: mod.tramos.filter((_, j) => j !== i) })}
                  disabled={mod.tramos.length === 1}
                  className="pb-1 text-xs text-muted transition-colors hover:text-red-700 disabled:opacity-30"
                  title="Quitar tramo"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-muted">
            Largo total <strong className="font-mono text-ink">{coma(Ltot)} m</strong>
          </p>
        </Tarjeta>

        <Tarjeta
          titulo="Apoyos"
          accion={
            <BotonMini onClick={() => editar({ apoyos: [...mod.apoyos, ap(String(Ltot))] })}>
              + apoyo
            </BotonMini>
          }
        >
          <div className="space-y-2">
            {mod.apoyos.map((a, i) => (
              <div key={i} className="rounded border border-border bg-white p-2">
                <div className="flex items-end gap-1.5">
                  <Campo
                    etiqueta="x"
                    valor={a.x}
                    onChange={(v) => setApoyo(i, { x: v })}
                    sufijo="m"
                    ancho="w-24"
                  />
                  <label className="flex-1 text-[11px] text-muted">
                    tipo
                    <select
                      value={a.tipo}
                      onChange={(e) => setApoyo(i, { tipo: e.target.value as TipoApoyo })}
                      className="mt-0.5 w-full rounded border border-border bg-white px-1.5 py-1 text-xs text-ink focus:border-accent focus:outline-none"
                    >
                      <option value="apoyo">apoyo</option>
                      <option value="empotrado">empotrado</option>
                      <option value="resorte">resorte</option>
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => editar({ apoyos: mod.apoyos.filter((_, j) => j !== i) })}
                    className="pb-1 text-xs text-muted transition-colors hover:text-red-700"
                    title="Quitar apoyo"
                  >
                    ✕
                  </button>
                </div>
                {a.tipo === 'resorte' && (
                  <div className="mt-1.5 flex gap-1.5">
                    <Campo
                      etiqueta="k vertical"
                      valor={a.k}
                      onChange={(v) => setApoyo(i, { k: v })}
                      sufijo="kN/m"
                    />
                    <Campo
                      etiqueta="k rotacional"
                      valor={a.ktheta}
                      onChange={(v) => setApoyo(i, { ktheta: v })}
                      sufijo="kN·m/rad"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Tarjeta>

        <Tarjeta
          titulo="Cargas"
          accion={
            <BotonMini onClick={() => editar({ cargas: [...mod.cargas, cargaVacia()] })}>
              + carga
            </BotonMini>
          }
        >
          <p className="mb-2 text-[11px] text-muted">
            Positivas <strong>hacia abajo</strong>; el momento, antihorario.
          </p>
          <div className="space-y-2">
            {mod.cargas.map((c, i) => (
              <div key={i} className="rounded border border-border bg-white p-2">
                <div className="flex items-center gap-1.5">
                  <select
                    value={c.tipo}
                    onChange={(e) => setCarga(i, { tipo: e.target.value as TipoCarga })}
                    className="flex-1 rounded border border-border bg-white px-1.5 py-1 text-xs text-ink focus:border-accent focus:outline-none"
                  >
                    <option value="distribuida">distribuida</option>
                    <option value="puntual">puntual</option>
                    <option value="momento">momento</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => editar({ cargas: mod.cargas.filter((_, j) => j !== i) })}
                    className="text-xs text-muted transition-colors hover:text-red-700"
                    title="Quitar carga"
                  >
                    ✕
                  </button>
                </div>
                {c.tipo === 'distribuida' ? (
                  <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                    <Campo
                      etiqueta="desde x"
                      valor={c.x0}
                      onChange={(v) => setCarga(i, { x0: v })}
                      sufijo="m"
                    />
                    <Campo
                      etiqueta="hasta x"
                      valor={c.x1}
                      onChange={(v) => setCarga(i, { x1: v })}
                      sufijo="m"
                    />
                    <Campo
                      etiqueta="q inicial"
                      valor={c.w0}
                      onChange={(v) => setCarga(i, { w0: v })}
                      sufijo="kN/m"
                    />
                    <Campo
                      etiqueta="q final"
                      valor={c.w1}
                      onChange={(v) => setCarga(i, { w1: v })}
                      sufijo="kN/m"
                    />
                  </div>
                ) : (
                  <div className="mt-1.5 flex gap-1.5">
                    <Campo
                      etiqueta="en x"
                      valor={c.x}
                      onChange={(v) => setCarga(i, { x: v })}
                      sufijo="m"
                    />
                    <Campo
                      etiqueta={c.tipo === 'puntual' ? 'P' : 'M'}
                      valor={c.valor}
                      onChange={(v) => setCarga(i, { valor: v })}
                      sufijo={c.tipo === 'puntual' ? 'kN' : 'kN·m'}
                    />
                  </div>
                )}
              </div>
            ))}
            {mod.cargas.length === 0 && (
              <p className="text-[11px] text-muted">Sin cargas: agrega al menos una.</p>
            )}
          </div>
        </Tarjeta>

        <Tarjeta titulo="Sección (opcional)">
          <p className="mb-2 text-[11px] leading-snug text-muted">
            Solo hace falta para la <strong>deformada en milímetros</strong>. Sin ella, las
            reacciones y los diagramas de V y M son los mismos y la flecha se reporta como δ·EI.
          </p>
          <div className="flex gap-1.5">
            <Campo etiqueta="E" valor={mod.E} onChange={(v) => editar({ E: v })} sufijo="MPa" />
            <Campo etiqueta="I" valor={mod.I} onChange={(v) => editar({ I: v })} sufijo="cm⁴" />
          </div>
        </Tarjeta>
      </div>

      {/* ── Resultados ───────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {esquema && (
          <div
            className="overflow-x-auto rounded-lg border border-border bg-white p-2"
            /* SVG generado por `dibujo.ts` a partir de números propios: no hay
               texto de origen externo que pudiera inyectar marcado. */
            dangerouslySetInnerHTML={{ __html: esquema }}
          />
        )}

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3">
            <p className="text-sm font-semibold text-red-800">No se pudo analizar la viga</p>
            <p className="mt-1 text-xs leading-relaxed text-red-700">{error}</p>
          </div>
        )}

        {res && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-surface p-3">
                <h2 className="mb-2 text-sm font-semibold text-ink">Reacciones</h2>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-[11px] text-muted">
                      <th className="pb-1 font-normal">apoyo</th>
                      <th className="pb-1 font-normal">x [m]</th>
                      <th className="pb-1 text-right font-normal">V [kN]</th>
                      <th className="pb-1 text-right font-normal">M [kN·m]</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {res.reacciones.map((r, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="py-1 text-muted">{i + 1}</td>
                        <td className="py-1">{coma(r.x)}</td>
                        <td className="py-1 text-right text-ink">{coma(r.Fv)}</td>
                        <td className="py-1 text-right text-ink">
                          {Math.abs(r.Mr) > 0 ? coma(r.Mr) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-2 text-[11px] leading-snug text-muted">
                  Positivas hacia arriba y antihorarias. Carga total{' '}
                  <span className="font-mono text-ink">{coma(res.cargaTotal)} kN</span>.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-surface p-3">
                <h2 className="mb-2 text-sm font-semibold text-ink">Valores máximos</h2>
                <dl className="space-y-1 text-xs">
                  <Fila
                    k="M⁺ (tracción abajo)"
                    v={`${coma(res.momentoMax.valor)} kN·m`}
                    x={res.momentoMax.x}
                  />
                  <Fila
                    k="M⁻ (tracción arriba)"
                    v={`${coma(res.momentoMin.valor)} kN·m`}
                    x={res.momentoMin.x}
                  />
                  <Fila k="V máximo" v={`${coma(res.corteMax.valor)} kN`} x={res.corteMax.x} />
                  <Fila
                    k={res.EIconocido ? 'Flecha máxima' : 'δ·EI máximo'}
                    v={
                      res.EIconocido
                        ? `${coma(res.flechaMax.valor)} mm`
                        : `${coma(res.flechaMax.valor, 1)} kN·m³`
                    }
                    x={res.flechaMax.x}
                  />
                  {res.EIconocido && Math.abs(res.flechaMax.valor) > 0 && (
                    <Fila
                      k="L / δ"
                      v={coma((res.L * 1000) / Math.abs(res.flechaMax.valor), 0)}
                    />
                  )}
                </dl>
              </div>
            </div>

            {res.avisos.map((a, i) => (
              <p
                key={i}
                className="rounded-lg border border-amber-300 bg-amber-50 p-2.5 text-xs leading-relaxed text-amber-900"
              >
                {a}
              </p>
            ))}

            <div>
              <p className="mb-1.5 text-xs">
                {lectura ? (
                  <span className="font-mono text-ink">
                    x = {coma(lectura.x)} m · V = {coma(lectura.V)} kN · M = {coma(lectura.M)}{' '}
                    kN·m · δ = {coma(lectura.delta, res.EIconocido ? 2 : 1)}{' '}
                    {res.EIconocido ? 'mm' : 'kN·m³'}
                  </span>
                ) : (
                  <span className="text-muted">
                    Pasa el cursor sobre los diagramas para leer V, M y δ en un punto.
                  </span>
                )}
              </p>
              <div
                ref={cajaDiagramas}
                onMouseMove={seguirCursor}
                onMouseLeave={() => setCursor(null)}
                className="relative overflow-x-auto rounded-lg border border-border bg-white p-2"
              >
                <div dangerouslySetInnerHTML={{ __html: diagramas }} />
                {cursor !== null && (
                  <div
                    className="pointer-events-none absolute inset-y-2 w-px bg-accent/60"
                    style={{
                      left: `calc(${
                        ((EJE_X.x0 + (EJE_X.x1 - EJE_X.x0) * (cursor / res.L)) / ANCHO) * 100
                      }% )`,
                    }}
                  />
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => conMemoria(abrirEnCanvas)}
                className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                title="Abre la memoria en el canvas matemático, donde puedes seguir calculando e imprimirla"
              >
                Abrir memoria en el canvas
              </button>
              <button
                type="button"
                onClick={() => conMemoria((h) => descargarHoja(h, 'memoria-viga.json'))}
                className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-ink transition-colors hover:border-accent"
              >
                Descargar memoria .json
              </button>
              <p className="text-[11px] text-muted">
                La memoria recalcula ΣF y ΣM con mathjs sobre los datos declarados.
              </p>
            </div>

            {fallo && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-3">
                <p className="text-sm font-semibold text-red-800">No se pudo armar la memoria</p>
                <p className="mt-1 text-xs leading-relaxed text-red-700">{fallo}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Fila({ k, v, x }: { k: string; v: string; x?: number }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-t border-border pt-1">
      <dt className="text-muted">{k}</dt>
      <dd className="text-right font-mono text-ink">
        {v}
        {x !== undefined && (
          <span className="ml-1.5 text-[11px] font-normal text-muted">en x = {coma(x)} m</span>
        )}
      </dd>
    </div>
  );
}
