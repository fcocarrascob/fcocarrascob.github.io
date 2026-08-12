// ─────────────────────────────────────────────────────────────────────────────
// Analizador de vigas por rigidez matricial.
//
// El método completo, en cuatro pasos:
//
//  1. MALLA. Se corta en cada punto clave: bordes de tramo, apoyos, posición de
//     cada carga puntual o momento puntual, y bordes de cada carga distribuida.
//     La consecuencia que simplifica todo lo demás es que LAS CARGAS PUNTUALES
//     Y LOS MOMENTOS SIEMPRE CAEN SOBRE UN NODO, así que entran directo al
//     vector de cargas y solo la distribuida necesita cargas equivalentes.
//
//  2. RESOLVER. K·d = f con los GDL restringidos eliminados (ver `solver.ts`).
//
//  3. RECUPERAR. Con los desplazamientos nodales, las fuerzas de extremo del
//     elemento son f_ext = k_e·d_e − f_eq_e, y dentro del elemento V y M salen
//     de EQUILIBRIO del trozo izquierdo, no de interpolar:
//
//        V(s) = f_ext[0] − ∫₀ˢ w                        (cuadrática)
//        M(s) = −f_ext[1] + f_ext[0]·s − ∫₀ˢ (s−u)·w    (cúbica)
//
//     Es exacto: no hace falta refinar la malla para que V y M salgan bien.
//
//  4. DEFORMADA. Con EI·v″ = M y M cúbica, v es una quíntica que se integra en
//     cerrado usando v_i y θ_i como condiciones iniciales.
//
// Comprobación de que la cadena de signos cierra (viga biempotrada con q):
// f_ext = [qL/2, qL²/12, …] ⇒ M(0) = −qL²/12, M(L/2) = +qL²/24 y
// v(L/2) = −qL⁴/(384·EI). Son los tres valores de tabla.
// ─────────────────────────────────────────────────────────────────────────────

import { cargasEquivalentes, rigidezElemento } from './elemento';
import { MecanismoError, resolverConRestricciones } from './solver';
import {
  rigidezEI,
  type Carga,
  type ElementoResuelto,
  type EntradaViga,
  type Extremo,
  type Punto,
  type Reaccion,
  type ResultadoViga,
  type ValoresEn,
} from './tipos';

/** Dos posiciones más cercanas que esto son el mismo nodo (m). */
const TOL_NODO = 1e-9;

/** Muestras por elemento al armar los diagramas. */
const MUESTRAS_MIN = 24;
const MUESTRAS_MAX = 120;

// ── Validación ───────────────────────────────────────────────────────────────

/** La entrada no describe una viga analizable. */
export class EntradaInvalidaError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'EntradaInvalidaError';
  }
}

function validar(e: EntradaViga, L: number): void {
  if (e.tramos.length === 0) {
    throw new EntradaInvalidaError('La viga necesita al menos un tramo.');
  }
  for (const [i, t] of e.tramos.entries()) {
    if (!(t.L > 0)) {
      throw new EntradaInvalidaError(`El tramo ${i + 1} tiene largo ${t.L}: debe ser mayor que cero.`);
    }
    if (!(t.rigidezRel > 0)) {
      throw new EntradaInvalidaError(
        `El tramo ${i + 1} tiene rigidez relativa ${t.rigidezRel}: debe ser mayor que cero.`
      );
    }
  }
  for (const a of e.apoyos) {
    if (!(a.x >= -TOL_NODO && a.x <= L + TOL_NODO)) {
      throw new EntradaInvalidaError(
        `Hay un apoyo en x = ${a.x} m, fuera de la viga (0 a ${L} m).`
      );
    }
  }
  for (const c of e.cargas) {
    if (c.tipo === 'distribuida') {
      if (!(c.x1 > c.x0)) {
        throw new EntradaInvalidaError(
          `Una carga distribuida va de x = ${c.x0} m a x = ${c.x1} m: el final debe ser mayor que el inicio.`
        );
      }
      if (c.x0 < -TOL_NODO || c.x1 > L + TOL_NODO) {
        throw new EntradaInvalidaError(
          `Una carga distribuida (${c.x0} a ${c.x1} m) se sale de la viga (0 a ${L} m).`
        );
      }
    } else if (!(c.x >= -TOL_NODO && c.x <= L + TOL_NODO)) {
      throw new EntradaInvalidaError(
        `Hay una carga en x = ${c.x} m, fuera de la viga (0 a ${L} m).`
      );
    }
  }
}

/**
 * Chequeo de estabilidad ANTES de resolver, para poder dar un mensaje útil.
 *
 * Una viga plana tiene dos movimientos de cuerpo rígido —traslación vertical y
 * giro—; hay que impedir los dos. El pivote nulo de `resolverGauss` es la red
 * de seguridad para los casos raros (dos apoyos en la misma posición), pero su
 * mensaje no dice qué falta.
 */
function chequearEstabilidad(e: EntradaViga): void {
  let nV = 0;
  let nT = 0;
  let empotrado = false;
  for (const a of e.apoyos) {
    if (a.tipo === 'empotrado') {
      empotrado = true;
      nV++;
      nT++;
    } else if (a.tipo === 'apoyo') {
      nV++;
    } else if (a.tipo === 'resorte') {
      if ((a.k ?? 0) > 0) nV++;
      if ((a.ktheta ?? 0) > 0) nT++;
    }
  }
  if (empotrado || nV >= 2 || (nV >= 1 && nT >= 1)) return;
  if (nV === 0) {
    throw new MecanismoError(
      'La viga no tiene ningún apoyo que impida el desplazamiento vertical: se caería. ' +
        'Agrega al menos dos apoyos, o un empotramiento.'
    );
  }
  throw new MecanismoError(
    'La viga tiene un solo apoyo vertical y nada que impida el giro: rotaría alrededor de ese punto. ' +
      'Agrega un segundo apoyo, cambia el que hay por un empotramiento, o dale rigidez rotacional.'
  );
}

// ── Malla ────────────────────────────────────────────────────────────────────

function puntosClave(e: EntradaViga, L: number): number[] {
  const xs: number[] = [0, L];
  let acum = 0;
  for (const t of e.tramos) {
    acum += t.L;
    xs.push(acum);
  }
  for (const a of e.apoyos) xs.push(a.x);
  for (const c of e.cargas) {
    if (c.tipo === 'distribuida') xs.push(c.x0, c.x1);
    else xs.push(c.x);
  }

  const dentro = xs
    .map((x) => Math.min(Math.max(x, 0), L))
    .sort((a, b) => a - b);

  const unicos: number[] = [];
  for (const x of dentro) {
    if (unicos.length === 0 || x - unicos[unicos.length - 1] > TOL_NODO) unicos.push(x);
  }
  return unicos;
}

/** Índice del nodo cuya posición coincide con `x` (o el más cercano). */
function nodoEn(nodos: number[], x: number): number {
  let mejor = 0;
  let dist = Infinity;
  for (let i = 0; i < nodos.length; i++) {
    const d = Math.abs(nodos[i] - x);
    if (d < dist) {
      dist = d;
      mejor = i;
    }
  }
  return mejor;
}

/**
 * Carga distribuida acumulada en los extremos de un elemento.
 *
 * Varias cargas distribuidas pueden solaparse; se suman. Como la malla se cortó
 * en los bordes de cada una, dentro del elemento cada carga o cubre todo el
 * largo o no lo toca, y su variación es lineal.
 */
function cargaEnElemento(cargas: Carga[], x0: number, x1: number): { wA: number; wB: number } {
  let wA = 0;
  let wB = 0;
  const medio = (x0 + x1) / 2;
  for (const c of cargas) {
    if (c.tipo !== 'distribuida') continue;
    if (medio <= c.x0 || medio >= c.x1) continue;
    const pend = (c.w1 - c.w0) / (c.x1 - c.x0);
    wA += c.w0 + pend * (x0 - c.x0);
    wB += c.w0 + pend * (x1 - c.x0);
  }
  return { wA, wB };
}

// ── Polinomios ───────────────────────────────────────────────────────────────

const evalPoli = (c: number[], s: number): number => {
  let r = 0;
  for (let i = c.length - 1; i >= 0; i--) r = r * s + c[i];
  return r;
};

/** Raíces reales de a·s² + b·s + c dentro de [0, L]. */
function raicesEn(a: number, b: number, c: number, L: number): number[] {
  const out: number[] = [];
  const dentro = (s: number) => {
    if (s > TOL_NODO && s < L - TOL_NODO) out.push(s);
  };
  if (Math.abs(a) < 1e-14) {
    if (Math.abs(b) > 1e-14) dentro(-c / b);
    return out;
  }
  const disc = b * b - 4 * a * c;
  if (disc < 0) return out;
  const r = Math.sqrt(disc);
  dentro((-b + r) / (2 * a));
  dentro((-b - r) / (2 * a));
  return out;
}

/** θ(s)·EI relativo a θ_i: la integral de M(s). */
const integralM = (cm: number[], s: number): number =>
  cm[0] * s + (cm[1] * s * s) / 2 + (cm[2] * s ** 3) / 3 + (cm[3] * s ** 4) / 4;

/** v(s) − v_i − θ_i·s, multiplicado por EI: la doble integral de M(s). */
const dobleIntegralM = (cm: number[], s: number): number =>
  (cm[0] * s * s) / 2 + (cm[1] * s ** 3) / 6 + (cm[2] * s ** 4) / 12 + (cm[3] * s ** 5) / 20;

const flechaEn = (el: ElementoResuelto, s: number): number =>
  el.vi + el.ti * s + dobleIntegralM(el.cm, s) / el.EI;

const giroEn = (el: ElementoResuelto, s: number): number =>
  el.ti + integralM(el.cm, s) / el.EI;

// ── Análisis ─────────────────────────────────────────────────────────────────

export function analizarViga(entrada: EntradaViga): ResultadoViga {
  const L = entrada.tramos.reduce((s, t) => s + t.L, 0);
  validar(entrada, L);
  chequearEstabilidad(entrada);

  const avisos: string[] = [];
  const EIconocido = Boolean(entrada.E && entrada.I && entrada.E > 0 && entrada.I > 0);
  const EIabs = EIconocido ? rigidezEI(entrada.E as number, entrada.I as number) : undefined;
  // Sin EI declarado se resuelve con EI = 1: el resultado en desplazamientos es
  // entonces δ·EI (kN·m³), referido a un tramo de rigidez relativa 1. Los
  // esfuerzos y las reacciones no cambian, porque solo dependen de las RAZONES
  // entre tramos.
  const EIbase = EIabs ?? 1;
  if (!EIconocido) {
    avisos.push(
      'Sin E e I declarados la deformada se reporta como δ·EI (kN·m³): divídela por la rigidez a flexión para leerla como desplazamiento.'
    );
  }

  const nodos = puntosClave(entrada, L);
  const nEl = nodos.length - 1;
  const nGdl = 2 * nodos.length;

  // Rigidez de cada elemento según el tramo en que cae su punto medio.
  const bordesTramo: number[] = [0];
  for (const t of entrada.tramos) bordesTramo.push(bordesTramo[bordesTramo.length - 1] + t.L);
  const rigidezDe = (medio: number): number => {
    for (let i = 0; i < entrada.tramos.length; i++) {
      if (medio < bordesTramo[i + 1] + TOL_NODO) return entrada.tramos[i].rigidezRel;
    }
    return entrada.tramos[entrada.tramos.length - 1].rigidezRel;
  };

  // ── Ensamblaje ──
  const K: number[][] = Array.from({ length: nGdl }, () => new Array<number>(nGdl).fill(0));
  const f = new Array<number>(nGdl).fill(0);

  interface DatosEl {
    x0: number;
    Le: number;
    EI: number;
    wA: number;
    wB: number;
    k: number[][];
    feq: [number, number, number, number];
  }
  const datos: DatosEl[] = [];

  for (let e = 0; e < nEl; e++) {
    const x0 = nodos[e];
    const x1 = nodos[e + 1];
    const Le = x1 - x0;
    const EI = EIbase * rigidezDe((x0 + x1) / 2);
    const { wA, wB } = cargaEnElemento(entrada.cargas, x0, x1);
    const k = rigidezElemento(EI, Le);
    const feq = cargasEquivalentes(wA, wB, Le);
    datos.push({ x0, Le, EI, wA, wB, k, feq });

    const gdl = [2 * e, 2 * e + 1, 2 * e + 2, 2 * e + 3];
    for (let a = 0; a < 4; a++) {
      f[gdl[a]] += feq[a];
      for (let b = 0; b < 4; b++) K[gdl[a]][gdl[b]] += k[a][b];
    }
  }

  // Cargas puntuales y momentos: siempre sobre un nodo, por construcción de la malla.
  let cargaTotal = 0;
  for (const c of entrada.cargas) {
    if (c.tipo === 'puntual') {
      f[2 * nodoEn(nodos, c.x)] -= c.P; // la carga baja, el GDL sube
      cargaTotal += c.P;
    } else if (c.tipo === 'momento') {
      f[2 * nodoEn(nodos, c.x) + 1] += c.M;
    } else {
      cargaTotal += ((c.w0 + c.w1) / 2) * (c.x1 - c.x0);
    }
  }

  // Apoyos: los rígidos van a `fijos`, los elásticos suman rigidez a la diagonal.
  const fijos = new Set<number>();
  const nodoApoyo = entrada.apoyos.map((a) => nodoEn(nodos, a.x));
  entrada.apoyos.forEach((a, i) => {
    const n = nodoApoyo[i];
    if (a.tipo === 'apoyo') {
      fijos.add(2 * n);
    } else if (a.tipo === 'empotrado') {
      fijos.add(2 * n);
      fijos.add(2 * n + 1);
    } else if (a.tipo === 'resorte') {
      if ((a.k ?? 0) > 0) K[2 * n][2 * n] += a.k as number;
      if ((a.ktheta ?? 0) > 0) K[2 * n + 1][2 * n + 1] += a.ktheta as number;
    }
  });

  // ── Resolver ──
  const Kcopia = K.map((fila) => fila.slice());
  const { d, R } = resolverConRestricciones(Kcopia, f, fijos);

  // ── Recuperación de esfuerzos ──
  const elementos: ElementoResuelto[] = datos.map((dt, e) => {
    const de = [d[2 * e], d[2 * e + 1], d[2 * e + 2], d[2 * e + 3]];
    // f_ext = k·d − f_eq
    const fext = [0, 1, 2, 3].map((a) => {
      let s = -dt.feq[a];
      for (let b = 0; b < 4; b++) s += dt.k[a][b] * de[b];
      return s;
    });
    const pend = (dt.wB - dt.wA) / dt.Le; // dw/ds
    return {
      x0: dt.x0,
      L: dt.Le,
      EI: dt.EI,
      wA: dt.wA,
      wB: dt.wB,
      vi: de[0],
      ti: de[1],
      // V(s) = fext[0] − wA·s − (wB−wA)·s²/(2L)
      cv: [fext[0], -dt.wA, -pend / 2],
      // M(s) = −fext[1] + fext[0]·s − wA·s²/2 − (wB−wA)·s³/(6L)
      cm: [-fext[1], fext[0], -dt.wA / 2, -pend / 6],
    };
  });

  // ── Reacciones ──
  const reacciones: Reaccion[] = entrada.apoyos.map((a, i) => {
    const n = nodoApoyo[i];
    if (a.tipo === 'resorte') {
      // El resorte se opone al desplazamiento: la fuerza que aplica a la viga
      // es −k·v (y −kθ·θ), no la reacción de un vínculo rígido.
      return {
        x: nodos[n],
        tipo: a.tipo,
        Fv: -(a.k ?? 0) * d[2 * n],
        Mr: -(a.ktheta ?? 0) * d[2 * n + 1],
      };
    }
    return {
      x: nodos[n],
      tipo: a.tipo,
      Fv: R.get(2 * n) ?? 0,
      Mr: R.get(2 * n + 1) ?? 0,
    };
  });

  // ── Diagramas y máximos ──
  const corte: Punto[] = [];
  const momento: Punto[] = [];
  const deformada: Punto[] = [];
  const escalaFlecha = EIconocido ? 1000 : 1; // m → mm cuando el valor es real

  let momentoMax: Extremo = { x: 0, valor: 0 };
  let momentoMin: Extremo = { x: 0, valor: 0 };
  let corteMax: Extremo = { x: 0, valor: 0 };
  let flechaMax: Extremo = { x: 0, valor: 0 };

  const verM = (x: number, v: number) => {
    if (v > momentoMax.valor) momentoMax = { x, valor: v };
    if (v < momentoMin.valor) momentoMin = { x, valor: v };
  };
  const verV = (x: number, v: number) => {
    if (Math.abs(v) > Math.abs(corteMax.valor)) corteMax = { x, valor: v };
  };
  const verD = (x: number, v: number) => {
    if (Math.abs(v) > Math.abs(flechaMax.valor)) flechaMax = { x, valor: v };
  };

  for (const el of elementos) {
    const n = Math.min(
      MUESTRAS_MAX,
      Math.max(MUESTRAS_MIN, Math.round((el.L / L) * MUESTRAS_MAX * elementos.length))
    );
    for (let i = 0; i <= n; i++) {
      const s = (el.L * i) / n;
      const x = el.x0 + s;
      corte.push({ x, y: evalPoli(el.cv, s) });
      momento.push({ x, y: evalPoli(el.cm, s) });
      deformada.push({ x, y: flechaEn(el, s) * escalaFlecha });
    }

    // Extremos exactos de M: donde V = 0. Extremos de V: donde dV/ds = 0.
    for (const s of raicesEn(el.cv[2], el.cv[1], el.cv[0], el.L)) {
      verM(el.x0 + s, evalPoli(el.cm, s));
    }
    if (Math.abs(el.cv[2]) > 1e-14) {
      const s = -el.cv[1] / (2 * el.cv[2]);
      if (s > 0 && s < el.L) verV(el.x0 + s, evalPoli(el.cv, s));
    }
    // Los extremos de elemento siempre son candidatos: ahí viven los saltos.
    for (const s of [0, el.L]) {
      verM(el.x0 + s, evalPoli(el.cm, s));
      verV(el.x0 + s, evalPoli(el.cv, s));
      verD(el.x0 + s, flechaEn(el, s) * escalaFlecha);
    }

    // Flecha extrema: raíces de θ(s) = 0, que es una cuártica. Se barre denso y
    // se refina por bisección — el barrido de los diagramas no basta porque el
    // extremo casi nunca cae justo en una muestra.
    const paso = el.L / 200;
    let sPrev = 0;
    let gPrev = giroEn(el, 0);
    for (let i = 1; i <= 200; i++) {
      const s = paso * i;
      const g = giroEn(el, s);
      if (gPrev === 0 || (gPrev < 0) !== (g < 0)) {
        let a = sPrev;
        let b = s;
        for (let k = 0; k < 60; k++) {
          const mid = (a + b) / 2;
          if ((giroEn(el, a) < 0) !== (giroEn(el, mid) < 0)) b = mid;
          else a = mid;
        }
        const sr = (a + b) / 2;
        verD(el.x0 + sr, flechaEn(el, sr) * escalaFlecha);
      }
      sPrev = s;
      gPrev = g;
    }
  }

  return {
    L,
    nodos,
    elementos,
    reacciones,
    EIconocido,
    EI: EIabs,
    diagramas: { corte, momento, deformada },
    momentoMax,
    momentoMin,
    corteMax,
    flechaMax,
    cargaTotal,
    avisos,
  };
}

/** Valores internos en una posición cualquiera. Útil para la lectura interactiva. */
export function evaluarEn(res: ResultadoViga, x: number): ValoresEn {
  const xc = Math.min(Math.max(x, 0), res.L);
  let el = res.elementos[res.elementos.length - 1];
  for (const e of res.elementos) {
    if (xc < e.x0 + e.L - TOL_NODO) {
      el = e;
      break;
    }
  }
  const s = Math.min(Math.max(xc - el.x0, 0), el.L);
  return {
    x: xc,
    V: evalPoli(el.cv, s),
    M: evalPoli(el.cm, s),
    delta: flechaEn(el, s) * (res.EIconocido ? 1000 : 1),
  };
}

export { MecanismoError };
