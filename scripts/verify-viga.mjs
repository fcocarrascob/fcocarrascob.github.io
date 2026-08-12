#!/usr/bin/env node
// Verifica el motor de vigas (src/lib/viga/) contra soluciones cerradas.
//
//   npm run verify:viga
//
// El ancla acá NO son planillas publicadas, como en `verify-acero.mjs`, sino
// las soluciones exactas de la viga elástica: son fórmulas de dominio público,
// independientes de cualquier implementación, y se CALCULAN en este script a
// partir de q, L, P y EI simbólicos. No se transcribe ningún decimal impreso.
//
// Que esto tenga sentido descansa en un hecho: el elemento de Euler-Bernoulli
// es NODALMENTE EXACTO, y la recuperación de V y M dentro del elemento se hace
// por equilibrio y no por interpolación. O sea que el motor no aproxima estos
// casos: los reproduce a precisión de máquina. Por eso la tolerancia es 1e-9 y
// no «un par de por ciento». Las dos excepciones —posiciones que salen de una
// búsqueda de raíz— están declaradas caso a caso.
//
// Además de los casos con fórmula, se corren IDENTIDADES: propiedades que la
// solución exacta cumple sea cual sea el caso. Valen tanto como un número
// publicado, porque tampoco dependen de la implementación:
//
//   I1  la deformada es continua entre elementos (cierra la doble integración)
//   I2  equilibrio global: ΣF = 0 y ΣM|₀ = 0
//   I3  invariancia de refinamiento: partir los tramos en cuatro no cambia nada
//   I7  escalar EI no toca reacciones ni esfuerzos, y divide la flecha

import { build } from 'esbuild';
import { rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

/** Compila un módulo TypeScript del sitio a algo importable por Node. */
async function bundle(entry, nombre) {
  const out = path.join(tmpdir(), `${nombre}-${process.pid}.mjs`);
  await build({
    entryPoints: [path.join(ROOT, entry)],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile: out,
    logLevel: 'error',
  });
  const mod = await import(pathToFileURL(out).href);
  await rm(out, { force: true });
  return mod;
}

const { analizarViga, evaluarEn, rigidezEI, generarMemoria } = await bundle(
  'src/lib/viga/engine-entry.ts',
  'viga-engine'
);
// El mismo motor mathjs que corre en /herramientas/canvas: con él se evalúa la
// memoria generada, que es el chequeo de doble entrada — las dos filas de
// equilibrio de la hoja se rearman desde los datos y tienen que dar ✓.
const { evaluateSheet } = await bundle('src/lib/planilla-engine.ts', 'viga-worksheet');

// ── Datos simbólicos de los casos ────────────────────────────────────────────

const L = 6; // m
const q = 18; // kN/m
const P = 45; // kN
const M0 = 70; // kN·m
const E = 200000; // MPa
const I = 15000; // cm⁴
const EI = rigidezEI(E, I); // kN·m²
const MM = 1000; // las flechas del motor vienen en mm

// ── Registro de chequeos ─────────────────────────────────────────────────────

const fallos = [];
let corridos = 0;

/**
 * Contrasta un valor contra su fórmula cerrada, en error RELATIVO.
 *
 * `escala` existe para los valores cuyo esperado es cero o casi: medir «cero
 * contra 1e-16» en error relativo no significa nada, y hay que compararlo con
 * la magnitud del problema (el momento máximo, la reacción mayor). Sin eso el
 * ruido de coma flotante se lee como fallo.
 */
function check(etiqueta, obtenido, esperado, tol = 1e-9, unidad = '', escala) {
  corridos++;
  const ref = Math.max(Math.abs(escala ?? esperado), 1e-12);
  const err = Math.abs(obtenido - esperado) / ref;
  if (!(err <= tol) || !Number.isFinite(obtenido)) {
    fallos.push({ etiqueta, obtenido, esperado, err, tol, unidad });
  }
}

/** Un residuo YA normalizado (equilibrio, continuidad): se mide en absoluto. */
function checkCero(etiqueta, residuo, tol = 1e-9) {
  corridos++;
  if (!(Math.abs(residuo) <= tol) || !Number.isFinite(residuo)) {
    fallos.push({ etiqueta, obtenido: residuo, esperado: 0, err: Math.abs(residuo), tol, unidad: '-' });
  }
}

/** Magnitud de referencia de los momentos de un resultado. */
const escalaM = (r) =>
  Math.max(Math.abs(r.momentoMax.valor), Math.abs(r.momentoMin.valor), 1e-12);

/** Magnitud de referencia de las reacciones de un resultado. */
const escalaR = (r) =>
  Math.max(...r.reacciones.map((x) => Math.abs(x.Fv)), Math.abs(r.cargaTotal), 1e-12);

const tramo = (largo, rigidezRel = 1) => ({ L: largo, rigidezRel });
const apoyo = (x) => ({ x, tipo: 'apoyo' });
const empotrado = (x) => ({ x, tipo: 'empotrado' });
const resorte = (x, k, ktheta) => ({ x, tipo: 'resorte', k, ktheta });
const udl = (x0, x1, w) => ({ tipo: 'distribuida', x0, x1, w0: w, w1: w });
const trapecio = (x0, x1, w0, w1) => ({ tipo: 'distribuida', x0, x1, w0, w1 });
const puntual = (x, valor) => ({ tipo: 'puntual', x, P: valor });
const momento = (x, valor) => ({ tipo: 'momento', x, M: valor });

/** Reacción vertical del apoyo `i`, en el orden en que se declaró. */
const Rv = (res, i) => res.reacciones[i].Fv;
const Rm = (res, i) => res.reacciones[i].Mr;

// ── Identidades genéricas, sobre cada caso ───────────────────────────────────

/** I2 — equilibrio global de fuerzas y de momentos respecto de x = 0. */
function equilibrio(nombre, entrada, res) {
  let sF = 0;
  let escF = 0;
  let sM = 0;
  let escM = 0;
  for (const r of res.reacciones) {
    sF += r.Fv;
    escF += Math.abs(r.Fv);
    sM += r.Fv * r.x + r.Mr;
    escM += Math.abs(r.Fv * r.x) + Math.abs(r.Mr);
  }
  for (const c of entrada.cargas) {
    if (c.tipo === 'puntual') {
      sF -= c.P;
      escF += Math.abs(c.P);
      sM -= c.P * c.x;
      escM += Math.abs(c.P * c.x);
    } else if (c.tipo === 'momento') {
      sM += c.M;
      escM += Math.abs(c.M);
    } else {
      const largo = c.x1 - c.x0;
      const W = ((c.w0 + c.w1) / 2) * largo;
      sF -= W;
      escF += Math.abs(W);
      const xc =
        c.w0 + c.w1 === 0
          ? c.x0 + largo / 2
          : c.x0 + (largo * (c.w0 + 2 * c.w1)) / (3 * (c.w0 + c.w1));
      sM -= W * xc;
      escM += Math.abs(W * xc);
    }
  }
  checkCero(`${nombre} · I2 ΣF = 0`, sF / Math.max(escF, 1e-12));
  checkCero(`${nombre} · I2 ΣM|₀ = 0`, sM / Math.max(escM, 1e-12));
}

/**
 * I1 — la deformada es continua entre elementos.
 *
 * El diagrama emite dos puntos con el mismo x en cada frontera de elemento: uno
 * es el final de la quíntica del elemento izquierdo y el otro el v_i nodal del
 * derecho. Que coincidan es lo que cierra la doble integración contra la
 * solución del sistema — si el vector de cargas equivalentes y las fuerzas de
 * extremo no fueran consistentes, la deformada tendría escalones.
 */
function continuidadDeformada(nombre, res) {
  const pts = res.diagramas.deformada;
  let peor = 0;
  const escala = Math.max(Math.abs(res.flechaMax.valor), 1e-12);
  for (let i = 1; i < pts.length; i++) {
    if (Math.abs(pts[i].x - pts[i - 1].x) < 1e-12) {
      peor = Math.max(peor, Math.abs(pts[i].y - pts[i - 1].y) / escala);
    }
  }
  checkCero(`${nombre} · I1 deformada continua`, peor);
}

/** I3 — partir cada tramo en cuatro no puede cambiar ningún resultado. */
function invarianciaRefinamiento(nombre, entrada, res) {
  const fino = {
    ...entrada,
    tramos: entrada.tramos.flatMap((t) =>
      Array.from({ length: 4 }, () => tramo(t.L / 4, t.rigidezRel))
    ),
  };
  const r2 = analizarViga(fino);
  const eM = escalaM(res);
  const eR = escalaR(res);
  res.reacciones.forEach((r, i) => {
    check(`${nombre} · I3 R${i + 1}`, r2.reacciones[i].Fv, r.Fv, 1e-9, 'kN', eR);
    check(`${nombre} · I3 M${i + 1}`, r2.reacciones[i].Mr, r.Mr, 1e-9, 'kN·m', eM);
  });
  check(`${nombre} · I3 M⁺max`, r2.momentoMax.valor, res.momentoMax.valor, 1e-9, 'kN·m', eM);
  check(`${nombre} · I3 M⁻max`, r2.momentoMin.valor, res.momentoMin.valor, 1e-9, 'kN·m', eM);
  // En módulo: si el caso es antisimétrico hay DOS extremos de igual magnitud y
  // signo opuesto (el M₀ al centro es el ejemplo), y cuál gana el desempate lo
  // decide el último bit. Es una propiedad del caso, no un defecto del motor.
  check(
    `${nombre} · I3 |flecha|`,
    Math.abs(r2.flechaMax.valor),
    Math.abs(res.flechaMax.valor),
    1e-8,
    'mm'
  );
}

/**
 * I7 — escalar la rigidez deja los esfuerzos y divide la flecha en el factor.
 *
 * Los resortes se escalan JUNTO con EI: son rigideces absolutas, y dejarlos
 * quietos cambiaría el problema en vez de escalarlo. Es la razón de que la
 * identidad valga: lo invariante es la RAZÓN entre las rigideces, no EI.
 */
function escalaEI(nombre, entrada, res) {
  if (!entrada.E) return;
  const F = 1000;
  const r2 = analizarViga({
    ...entrada,
    E: entrada.E * F,
    apoyos: entrada.apoyos.map((a) =>
      a.tipo === 'resorte' ? { ...a, k: (a.k ?? 0) * F, ktheta: (a.ktheta ?? 0) * F } : a
    ),
  });
  const eM = escalaM(res);
  const eR = escalaR(res);
  res.reacciones.forEach((r, i) => {
    check(`${nombre} · I7 R${i + 1}`, r2.reacciones[i].Fv, r.Fv, 1e-9, 'kN', eR);
  });
  check(`${nombre} · I7 M⁺max`, r2.momentoMax.valor, res.momentoMax.valor, 1e-9, 'kN·m', eM);
  check(
    `${nombre} · I7 |flecha|·F`,
    Math.abs(r2.flechaMax.valor) * F,
    Math.abs(res.flechaMax.valor),
    1e-8,
    'mm'
  );
}

/**
 * La memoria que se abre en el canvas tiene que EVALUAR, y sus dos filas de
 * equilibrio dar ✓.
 *
 * Es el chequeo de doble entrada: la hoja rearma ΣF y ΣM con mathjs desde los
 * datos declarados, sin mirar cómo los obtuvo el motor. Si una reacción
 * estuviera mal, o si la hoja citara un símbolo que no define, esto lo caza acá
 * y no cuando alguien abre el canvas.
 */
function memoriaEvaluable(nombre, entrada, res) {
  let hoja;
  try {
    hoja = generarMemoria(entrada, res);
  } catch (err) {
    corridos++;
    fallos.push({
      etiqueta: `${nombre} · memoria no se pudo generar`,
      obtenido: String(err && err.message ? err.message : err),
      esperado: 'una hoja válida',
      err: NaN,
      tol: 0,
      unidad: '',
    });
    return;
  }

  const porId = new Map(hoja.regions.map((r) => [r.id, r.src]));
  const salida = evaluateSheet(hoja.regions);
  const errores = [];
  const booleanos = [];
  for (const [id, r] of Object.entries(salida)) {
    if (r.error) errores.push(`${porId.get(id)} → ${r.error}`);
    if (typeof r.bool === 'boolean') booleanos.push({ id, ok: r.bool });
  }

  corridos++;
  if (errores.length > 0) {
    fallos.push({
      etiqueta: `${nombre} · memoria evalúa sin errores`,
      obtenido: errores.join(' | '),
      esperado: 'sin errores',
      err: NaN,
      tol: 0,
      unidad: '',
    });
  }

  corridos++;
  if (booleanos.length !== 2) {
    fallos.push({
      etiqueta: `${nombre} · memoria trae las 2 filas de equilibrio`,
      obtenido: `${booleanos.length} comparaciones`,
      esperado: '2 (ΣF y ΣM)',
      err: NaN,
      tol: 0,
      unidad: '',
    });
  }

  for (const bl of booleanos) {
    corridos++;
    if (!bl.ok) {
      fallos.push({
        etiqueta: `${nombre} · equilibrio en la hoja: \`${porId.get(bl.id)}\``,
        obtenido: 'falso',
        esperado: 'verdadero',
        err: NaN,
        tol: 0,
        unidad: '',
      });
    }
  }
}

/** Corre las identidades y el chequeo de la memoria sobre un caso resuelto. */
function identidades(nombre, entrada, res) {
  equilibrio(nombre, entrada, res);
  continuidadDeformada(nombre, res);
  invarianciaRefinamiento(nombre, entrada, res);
  escalaEI(nombre, entrada, res);
  memoriaEvaluable(nombre, entrada, res);
}

/** Resuelve, corre las identidades y devuelve el resultado. */
function correr(nombre, entrada) {
  const res = analizarViga(entrada);
  identidades(nombre, entrada, res);
  return res;
}

// ── A. Isostáticos ───────────────────────────────────────────────────────────

{
  const n = '1 · Simple, q uniforme';
  const e = {
    tramos: [tramo(L)],
    apoyos: [apoyo(0), apoyo(L)],
    cargas: [udl(0, L, q)],
    E,
    I,
  };
  const r = correr(n, e);
  check(`${n} · R_A`, Rv(r, 0), (q * L) / 2, 1e-9, 'kN');
  check(`${n} · R_B`, Rv(r, 1), (q * L) / 2, 1e-9, 'kN');
  check(`${n} · M_max`, r.momentoMax.valor, (q * L * L) / 8, 1e-9, 'kN·m');
  check(`${n} · x(M_max)`, r.momentoMax.x, L / 2, 1e-9, 'm');
  check(`${n} · V_max`, Math.abs(r.corteMax.valor), (q * L) / 2, 1e-9, 'kN');
  check(`${n} · δ_max`, r.flechaMax.valor, (-5 * q * L ** 4 * MM) / (384 * EI), 1e-9, 'mm');
  check(`${n} · x(δ_max)`, r.flechaMax.x, L / 2, 1e-9, 'm');
}

{
  const n = '2 · Simple, P al centro';
  const e = {
    tramos: [tramo(L)],
    apoyos: [apoyo(0), apoyo(L)],
    cargas: [puntual(L / 2, P)],
    E,
    I,
  };
  const r = correr(n, e);
  check(`${n} · R_A`, Rv(r, 0), P / 2, 1e-9, 'kN');
  check(`${n} · M_max`, r.momentoMax.valor, (P * L) / 4, 1e-9, 'kN·m');
  check(`${n} · x(M_max)`, r.momentoMax.x, L / 2, 1e-9, 'm');
  check(`${n} · δ_max`, r.flechaMax.valor, (-P * L ** 3 * MM) / (48 * EI), 1e-9, 'mm');
}

{
  // a > b para que el máximo de flecha caiga en el tramo largo, que es donde
  // vale la fórmula cerrada de la posición.
  const n = '3 · Simple, P a 0,7·L';
  const a = 0.7 * L;
  const b = L - a;
  const e = {
    tramos: [tramo(L)],
    apoyos: [apoyo(0), apoyo(L)],
    cargas: [puntual(a, P)],
    E,
    I,
  };
  const r = correr(n, e);
  check(`${n} · R_A`, Rv(r, 0), (P * b) / L, 1e-9, 'kN');
  check(`${n} · R_B`, Rv(r, 1), (P * a) / L, 1e-9, 'kN');
  check(`${n} · M_max`, r.momentoMax.valor, (P * a * b) / L, 1e-9, 'kN·m');
  check(`${n} · x(M_max)`, r.momentoMax.x, a, 1e-9, 'm');
  check(
    `${n} · δ bajo la carga`,
    evaluarEn(r, a).delta,
    (-P * a * a * b * b * MM) / (3 * EI * L),
    1e-9,
    'mm'
  );
  const xd = Math.sqrt((L * L - b * b) / 3);
  check(
    `${n} · δ_max`,
    r.flechaMax.valor,
    (-P * b * (L * L - b * b) ** 1.5 * MM) / (9 * Math.sqrt(3) * EI * L),
    1e-8,
    'mm'
  );
  check(`${n} · x(δ_max)`, r.flechaMax.x, xd, 1e-6, 'm');
}

{
  const n = '4 · Voladizo, q uniforme';
  const e = { tramos: [tramo(L)], apoyos: [empotrado(0)], cargas: [udl(0, L, q)], E, I };
  const r = correr(n, e);
  check(`${n} · R`, Rv(r, 0), q * L, 1e-9, 'kN');
  check(`${n} · M_reacción`, Rm(r, 0), (q * L * L) / 2, 1e-9, 'kN·m');
  check(`${n} · M(0)`, r.momentoMin.valor, (-q * L * L) / 2, 1e-9, 'kN·m');
  check(`${n} · x(M_min)`, r.momentoMin.x, 0, 1e-9, 'm');
  check(`${n} · δ_punta`, r.flechaMax.valor, (-q * L ** 4 * MM) / (8 * EI), 1e-9, 'mm');
  check(`${n} · x(δ_max)`, r.flechaMax.x, L, 1e-9, 'm');
}

{
  const n = '5 · Voladizo, P en la punta';
  const e = { tramos: [tramo(L)], apoyos: [empotrado(0)], cargas: [puntual(L, P)], E, I };
  const r = correr(n, e);
  check(`${n} · R`, Rv(r, 0), P, 1e-9, 'kN');
  check(`${n} · M_reacción`, Rm(r, 0), P * L, 1e-9, 'kN·m');
  check(`${n} · M(0)`, r.momentoMin.valor, -P * L, 1e-9, 'kN·m');
  check(`${n} · δ_punta`, r.flechaMax.valor, (-P * L ** 3 * MM) / (3 * EI), 1e-9, 'mm');
}

{
  // El único caso que ejercita la parte TRIANGULAR de las cargas equivalentes.
  const n = '6 · Voladizo, triangular 0 → q en la punta';
  const e = {
    tramos: [tramo(L)],
    apoyos: [empotrado(0)],
    cargas: [trapecio(0, L, 0, q)],
    E,
    I,
  };
  const r = correr(n, e);
  check(`${n} · R`, Rv(r, 0), (q * L) / 2, 1e-9, 'kN');
  check(`${n} · M_reacción`, Rm(r, 0), (q * L * L) / 3, 1e-9, 'kN·m');
  check(`${n} · M(0)`, r.momentoMin.valor, (-q * L * L) / 3, 1e-9, 'kN·m');
  check(`${n} · δ_punta`, r.flechaMax.valor, (-11 * q * L ** 4 * MM) / (120 * EI), 1e-9, 'mm');
}

{
  // El único que ejercita el momento puntual y el salto del diagrama.
  const n = '7 · Simple, M₀ antihorario al centro';
  const e = {
    tramos: [tramo(L)],
    apoyos: [apoyo(0), apoyo(L)],
    cargas: [momento(L / 2, M0)],
    E,
    I,
  };
  const r = correr(n, e);
  check(`${n} · R_A`, Rv(r, 0), M0 / L, 1e-9, 'kN');
  check(`${n} · R_B`, Rv(r, 1), -M0 / L, 1e-9, 'kN');
  check(`${n} · M(L/2⁻)`, r.momentoMax.valor, M0 / 2, 1e-9, 'kN·m');
  check(`${n} · M(L/2⁺)`, r.momentoMin.valor, -M0 / 2, 1e-9, 'kN·m');
  check(`${n} · salto en el centro`, r.momentoMax.x, L / 2, 1e-9, 'm');
  // La antisimetría deja el centro sin flecha: se mide contra la flecha máxima.
  checkCero(
    `${n} · δ(L/2) = 0`,
    evaluarEn(r, L / 2).delta / Math.abs(r.flechaMax.valor)
  );
}

// ── B. Hiperestáticos ────────────────────────────────────────────────────────

{
  const n = '8 · Biempotrada, q uniforme';
  const e = {
    tramos: [tramo(L)],
    apoyos: [empotrado(0), empotrado(L)],
    cargas: [udl(0, L, q)],
    E,
    I,
  };
  const r = correr(n, e);
  check(`${n} · R_A`, Rv(r, 0), (q * L) / 2, 1e-9, 'kN');
  check(`${n} · M_reacción A`, Rm(r, 0), (q * L * L) / 12, 1e-9, 'kN·m');
  check(`${n} · M_empotramiento`, r.momentoMin.valor, (-q * L * L) / 12, 1e-9, 'kN·m');
  check(`${n} · M_centro`, r.momentoMax.valor, (q * L * L) / 24, 1e-9, 'kN·m');
  check(`${n} · x(M_centro)`, r.momentoMax.x, L / 2, 1e-9, 'm');
  check(`${n} · δ_max`, r.flechaMax.valor, (-q * L ** 4 * MM) / (384 * EI), 1e-9, 'mm');
}

{
  const n = '9 · Biempotrada, P al centro';
  const e = {
    tramos: [tramo(L)],
    apoyos: [empotrado(0), empotrado(L)],
    cargas: [puntual(L / 2, P)],
    E,
    I,
  };
  const r = correr(n, e);
  check(`${n} · R_A`, Rv(r, 0), P / 2, 1e-9, 'kN');
  check(`${n} · M_empotramiento`, r.momentoMin.valor, (-P * L) / 8, 1e-9, 'kN·m');
  check(`${n} · M_centro`, r.momentoMax.valor, (P * L) / 8, 1e-9, 'kN·m');
  check(`${n} · δ_max`, r.flechaMax.valor, (-P * L ** 3 * MM) / (192 * EI), 1e-9, 'mm');
}

{
  const n = '10 · Apoyada-empotrada, q uniforme';
  const e = {
    tramos: [tramo(L)],
    apoyos: [apoyo(0), empotrado(L)],
    cargas: [udl(0, L, q)],
    E,
    I,
  };
  const r = correr(n, e);
  check(`${n} · R_apoyo`, Rv(r, 0), (3 * q * L) / 8, 1e-9, 'kN');
  check(`${n} · R_empotramiento`, Rv(r, 1), (5 * q * L) / 8, 1e-9, 'kN');
  check(`${n} · M_empotramiento`, r.momentoMin.valor, (-q * L * L) / 8, 1e-9, 'kN·m');
  check(`${n} · M⁺_max`, r.momentoMax.valor, (9 * q * L * L) / 128, 1e-9, 'kN·m');
  check(`${n} · x(M⁺_max)`, r.momentoMax.x, (3 * L) / 8, 1e-9, 'm');
  // δ_max sale de una búsqueda de raíz: ξ es la raíz de 8ξ³ − 9ξ² + 1 = 0
  // distinta de 1, o sea (1 + √33)/16. La posición se contrasta con 1e-6.
  const xi = (1 + Math.sqrt(33)) / 16;
  check(
    `${n} · δ_max`,
    r.flechaMax.valor,
    (q * L ** 4 * MM * (xi * (3 * xi * xi - 2 * xi ** 3 - 1))) / (48 * EI),
    1e-7,
    'mm'
  );
  check(`${n} · x(δ_max)`, r.flechaMax.x, xi * L, 1e-6, 'm');
}

{
  const n = '11 · Apoyada-empotrada, P al centro';
  const e = {
    tramos: [tramo(L)],
    apoyos: [apoyo(0), empotrado(L)],
    cargas: [puntual(L / 2, P)],
    E,
    I,
  };
  const r = correr(n, e);
  check(`${n} · R_apoyo`, Rv(r, 0), (5 * P) / 16, 1e-9, 'kN');
  check(`${n} · R_empotramiento`, Rv(r, 1), (11 * P) / 16, 1e-9, 'kN');
  check(`${n} · M_empotramiento`, r.momentoMin.valor, (-3 * P * L) / 16, 1e-9, 'kN·m');
  check(`${n} · M_centro`, r.momentoMax.valor, (5 * P * L) / 32, 1e-9, 'kN·m');
  check(`${n} · δ_max`, r.flechaMax.valor, (-P * L ** 3 * MM) / (48 * Math.sqrt(5) * EI), 1e-7, 'mm');
  check(`${n} · x(δ_max)`, r.flechaMax.x, L / Math.sqrt(5), 1e-6, 'm');
}

{
  const n = '12 · Dos vanos iguales, q en ambos';
  const e = {
    tramos: [tramo(L), tramo(L)],
    apoyos: [apoyo(0), apoyo(L), apoyo(2 * L)],
    cargas: [udl(0, 2 * L, q)],
    E,
    I,
  };
  const r = correr(n, e);
  check(`${n} · R_ext`, Rv(r, 0), (3 * q * L) / 8, 1e-9, 'kN');
  check(`${n} · R_centro`, Rv(r, 1), (5 * q * L) / 4, 1e-9, 'kN');
  check(`${n} · R_ext (der)`, Rv(r, 2), (3 * q * L) / 8, 1e-9, 'kN');
  check(`${n} · M_apoyo central`, r.momentoMin.valor, (-q * L * L) / 8, 1e-9, 'kN·m');
  check(`${n} · x(M_apoyo)`, r.momentoMin.x, L, 1e-9, 'm');
  check(`${n} · M⁺_max`, r.momentoMax.valor, (9 * q * L * L) / 128, 1e-9, 'kN·m');
  check(`${n} · x(M⁺_max)`, r.momentoMax.x, (3 * L) / 8, 1e-9, 'm');
}

{
  // El mejor caso hiperestático de la lista: R_C sale NEGATIVA (el apoyo tira
  // hacia abajo). Ningún error de signo sobrevive a eso.
  const n = '13 · Dos vanos, q solo en el primero';
  const e = {
    tramos: [tramo(L), tramo(L)],
    apoyos: [apoyo(0), apoyo(L), apoyo(2 * L)],
    cargas: [udl(0, L, q)],
    E,
    I,
  };
  const r = correr(n, e);
  check(`${n} · R_A`, Rv(r, 0), (7 * q * L) / 16, 1e-9, 'kN');
  check(`${n} · R_B`, Rv(r, 1), (5 * q * L) / 8, 1e-9, 'kN');
  check(`${n} · R_C (negativa)`, Rv(r, 2), (-q * L) / 16, 1e-9, 'kN');
  check(`${n} · M_apoyo central`, r.momentoMin.valor, (-q * L * L) / 16, 1e-9, 'kN·m');
  check(`${n} · M⁺_max`, r.momentoMax.valor, (49 * q * L * L) / 512, 1e-9, 'kN·m');
  check(`${n} · x(M⁺_max)`, r.momentoMax.x, (7 * L) / 16, 1e-9, 'm');
}

// ── C. Resortes ──────────────────────────────────────────────────────────────

{
  // δ_punta = −3qL⁴ / (8·(3EI + k·L³)). Con k = 3EI/L³ el paréntesis es 6EI.
  const n = '14 · Voladizo con resorte en la punta';
  const k = (3 * EI) / L ** 3;
  const e = {
    tramos: [tramo(L)],
    apoyos: [empotrado(0), resorte(L, k, 0)],
    cargas: [udl(0, L, q)],
    E,
    I,
  };
  const r = correr(n, e);
  const dTip = (-3 * q * L ** 4) / (8 * (3 * EI + k * L ** 3));
  const Rk = -k * dTip;
  check(`${n} · δ_punta`, evaluarEn(r, L).delta, dTip * MM, 1e-9, 'mm');
  check(`${n} · R_resorte`, Rv(r, 1), Rk, 1e-9, 'kN');
  check(`${n} · R_empotramiento`, Rv(r, 0), q * L - Rk, 1e-9, 'kN');
  check(`${n} · M(0)`, evaluarEn(r, 0).M, (-q * L * L) / 2 + Rk * L, 1e-9, 'kN·m');
}

{
  // θ_A = −qL³ / (8·(3EI + k_r·L)). Con k_r = 3EI/L el paréntesis es 6EI.
  const n = '15 · Simple con resorte rotacional en A';
  const kr = (3 * EI) / L;
  const e = {
    tramos: [tramo(L)],
    apoyos: [resorte(0, undefined, kr), apoyo(0.0), apoyo(L)],
    cargas: [udl(0, L, q)],
    E,
    I,
  };
  const r = correr(n, e);
  const M0a = (-kr * q * L ** 3) / (8 * (3 * EI + kr * L));
  check(`${n} · M(0)`, evaluarEn(r, 0).M, M0a, 1e-9, 'kN·m');
  check(`${n} · R_A`, Rv(r, 1), (q * L) / 2 - M0a / L, 1e-9, 'kN');
  check(`${n} · R_B`, Rv(r, 2), (q * L) / 2 + M0a / L, 1e-9, 'kN');
}

// ── Límites de los resortes: k → 0 y k → ∞ ───────────────────────────────────
//
// Anclan el resorte contra dos casos que ya tienen fórmula propia, en vez de
// contra un número escrito a mano.
{
  const n = '16 · Límites del resorte vertical';
  const blando = analizarViga({
    tramos: [tramo(L)],
    apoyos: [empotrado(0), resorte(L, EI * 1e-12, 0)],
    cargas: [udl(0, L, q)],
    E,
    I,
  });
  check(
    `${n} · k → 0 reproduce el voladizo`,
    evaluarEn(blando, L).delta,
    (-q * L ** 4 * MM) / (8 * EI),
    1e-6,
    'mm'
  );
  const rigido = analizarViga({
    tramos: [tramo(L)],
    apoyos: [empotrado(0), resorte(L, EI * 1e12, 0)],
    cargas: [udl(0, L, q)],
    E,
    I,
  });
  check(
    `${n} · k → ∞ reproduce la apoyada-empotrada`,
    rigido.reacciones[1].Fv,
    (3 * q * L) / 8,
    1e-6,
    'kN'
  );
}

// ── Rigidez relativa: dos tramos con EI distinto ─────────────────────────────
//
// Dos anclas cerradas, sacadas del método de las fuerzas sobre dos vanos
// iguales de rigideces EI₁ y EI₂, liberando el momento del apoyo central:
//
//   (qL³/24)(1/EI₁ + 1/EI₂) = (M_B·L/3)(1/EI₁ + 1/EI₂)   ⇒  M_B = qL²/8
//
// con carga en AMBOS vanos: el paréntesis se cancela y M_B **no depende de la
// razón de rigideces**. Es un resultado poco intuitivo y por eso vale como
// ancla: una implementación que reparta mal la rigidez no lo reproduce.
//
// Con carga SOLO en el primer vano el paréntesis ya no se cancela:
//
//   (qL³/24)(1/EI₁) = (M_B·L/3)(1/EI₁ + 1/EI₂)  ⇒  M_B = (qL²/8)·EI₂/(EI₁+EI₂)
//
// y ahí sí el vano rígido atrae más momento. Los dos casos juntos fijan el
// reparto por los dos lados.
{
  const n = '17 · Rigidez relativa';
  const r1 = 1;
  const r2 = 2.5;
  const apoyos3 = [apoyo(0), apoyo(L), apoyo(2 * L)];

  const ambos = correr(`${n} (carga en ambos vanos)`, {
    tramos: [tramo(L, r1), tramo(L, r2)],
    apoyos: apoyos3,
    cargas: [udl(0, 2 * L, q)],
  });
  check(
    `${n} · M_B no depende de la razón EI`,
    ambos.momentoMin.valor,
    (-q * L * L) / 8,
    1e-9,
    'kN·m'
  );

  const soloUno = correr(`${n} (carga en el primer vano)`, {
    tramos: [tramo(L, r1), tramo(L, r2)],
    apoyos: apoyos3,
    cargas: [udl(0, L, q)],
  });
  check(
    `${n} · M_B = (qL²/8)·EI₂/(EI₁+EI₂)`,
    soloUno.momentoMin.valor,
    ((-q * L * L) / 8) * (r2 / (r1 + r2)),
    1e-9,
    'kN·m'
  );

  // Y con EI₁ = EI₂ esa misma fórmula tiene que caer en el caso 13 (−qL²/16).
  const iguales = analizarViga({
    tramos: [tramo(L), tramo(L)],
    apoyos: apoyos3,
    cargas: [udl(0, L, q)],
  });
  check(`${n} · EI₁ = EI₂ cae en el caso 13`, iguales.momentoMin.valor, (-q * L * L) / 16, 1e-9, 'kN·m');

  // El reparto depende solo de la RAZÓN: multiplicar ambos factores no cambia nada.
  const escalado = analizarViga({
    tramos: [tramo(L, 7 * r1), tramo(L, 7 * r2)],
    apoyos: apoyos3,
    cargas: [udl(0, L, q)],
  });
  soloUno.reacciones.forEach((re, i) => {
    check(
      `${n} · R${i + 1} invariante a la escala`,
      escalado.reacciones[i].Fv,
      re.Fv,
      1e-9,
      'kN',
      escalaR(soloUno)
    );
  });
}

// ── Entradas patológicas: error explícito, nunca NaN ─────────────────────────
{
  const patologicas = [
    ['sin apoyos', { tramos: [tramo(L)], apoyos: [], cargas: [udl(0, L, q)] }],
    ['un solo apoyo', { tramos: [tramo(L)], apoyos: [apoyo(0)], cargas: [udl(0, L, q)] }],
    ['tramo de largo cero', { tramos: [tramo(0)], apoyos: [apoyo(0)], cargas: [] }],
    [
      'carga fuera de la viga',
      { tramos: [tramo(L)], apoyos: [apoyo(0), apoyo(L)], cargas: [puntual(L + 1, P)] },
    ],
    [
      'distribuida invertida',
      { tramos: [tramo(L)], apoyos: [apoyo(0), apoyo(L)], cargas: [udl(4, 2, q)] },
    ],
  ];
  for (const [etiqueta, entrada] of patologicas) {
    corridos++;
    let lanzo = false;
    try {
      analizarViga(entrada);
    } catch (err) {
      lanzo = err instanceof Error && err.message.length > 20;
    }
    if (!lanzo) {
      fallos.push({
        etiqueta: `18 · Patológica «${etiqueta}» debe lanzar con mensaje`,
        obtenido: 'no lanzó (o el mensaje es demasiado corto)',
        esperado: 'Error explicativo',
        err: NaN,
        tol: 0,
        unidad: '',
      });
    }
  }
}

// ── Informe ──────────────────────────────────────────────────────────────────

const coma = (v) =>
  typeof v === 'number' ? v.toPrecision(10).replace('.', ',') : String(v);

if (fallos.length === 0) {
  console.log(`✓ motor de vigas: ${corridos} anclas dentro de tolerancia.`);
  process.exit(0);
}

console.error(`✗ motor de vigas: ${fallos.length} de ${corridos} anclas fuera de tolerancia.\n`);
for (const f of fallos) {
  console.error(`  ${f.etiqueta}`);
  console.error(`      obtenido  ${coma(f.obtenido)} ${f.unidad}`);
  console.error(`      esperado  ${coma(f.esperado)} ${f.unidad}`);
  if (Number.isFinite(f.err)) {
    console.error(`      error rel ${f.err.toExponential(3)}  (tolerancia ${f.tol})`);
  }
  console.error('');
}
process.exit(1);
