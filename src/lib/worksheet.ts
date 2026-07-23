// Motor de la hoja de cálculo estilo SMath.
// Lógica pura (sin React): recibe las regiones de la hoja y devuelve, por cada
// región matemática, el LaTeX a renderizar y el resultado o error.
//
// Sintaxis de una región matemática (campo `src`):
//   - "nombre := expresión"        definición (no muestra resultado)
//   - "nombre := expresión ="      definición + muestra el resultado
//   - "expresión ="                solo evalúa y muestra
//   - "... = unidad"               convierte el resultado a esa unidad (chequeo
//                                  dimensional: mathjs lanza si es incoherente)
//
// Las dependencias entre regiones son implícitas por nombre de variable y se
// resuelven en orden de lectura: arriba→abajo, izquierda→derecha (como SMath).

import { create, all } from 'mathjs';
import { parseProgram, runProgram, type ProgramContext } from './program';

const math = create(all, {});

// Unidad de la práctica local (Chile/LatAm). `kgf` ya viene en math.js
// (= 9.80665 N); las compuestas `kgf/cm²`, `tonf·m`, `tonf/m` se derivan solas.
// math.js `max`/`min` ya comparan unidades (vía larger/smaller), así que
// `max(2.5 tonf, 30 kN)` funciona sin envoltorios.
math.createUnit('tonf', { definition: '1000 kgf', aliases: ['tf'] });

// Funciones útiles de diseño, disponibles en cualquier hoja (como las unidades).
// Se mantienen puras y unit-aware: reciben cantidades con unidades y devuelven un
// número o una cantidad, para poder encadenarlas en las fórmulas empíricas de la
// norma. Nombres únicos (no chocan con builtins de math.js), por eso override:false.
math.import(
  {
    // β1 del bloque rectangular equivalente (ACI 318-25, Tabla 22.2.2.4.3).
    // Acepta f'c con unidad de tensión, o un número plano interpretado como MPa.
    beta1: function (fc: unknown) {
      const fcm = typeof fc === 'number' ? fc : math.number(fc as never, 'MPa');
      if (fcm <= 28) return 0.85;
      if (fcm >= 56) return 0.65;
      return 0.85 - (0.05 * (fcm - 28)) / 7;
    },
    // √f'c como una tensión en kgf/cm² (unidad de la práctica local): así los
    // coeficientes empíricos chilenos (0.53, 0.8, 2.1, 14, …) quedan coherentes.
    // Acepta f'c con unidad, o un número plano interpretado como kgf/cm².
    sqrtfc: function (fc: unknown) {
      const fck = typeof fc === 'number' ? fc : math.number(fc as never, 'kgf/cm^2');
      return math.unit(Math.sqrt(fck), 'kgf/cm^2');
    },
    // Factor φ de flexión (ACI 318-25, Tabla 21.2.2), interpolado en la transición.
    phiFlexion: function (et: unknown, ety: unknown) {
      const e = math.number(et as never);
      const ey = math.number(ety as never);
      if (e >= ey + 0.003) return 0.9;
      if (e <= ey) return 0.65;
      return 0.65 + (0.25 * (e - ey)) / 0.003;
    },
  },
  { override: false },
);

/** Tope de iteraciones por programa (anti-bucle-infinito; evita colgar la pestaña). */
const MAX_ITERS = 100_000;

export type RegionKind = 'math' | 'text' | 'program';

export interface Region {
  id: string;
  kind: RegionKind;
  /** Posición en la hoja (px), ajustada a la cuadrícula. */
  x: number;
  y: number;
  /** Texto crudo: expresión math.js o texto libre según `kind`. */
  src: string;
}

export interface ParsedMath {
  /** Nombre de variable si la región define una (lado izquierdo de `:=`). */
  varName?: string;
  /** Expresión math.js a evaluar. */
  expr: string;
  /** true si hay un `=` final: mostrar el resultado en línea. */
  showResult: boolean;
  /** Unidad objetivo tras el `=` final (ej. "kN*m"). */
  targetUnit?: string;
}

export interface RegionResult {
  /** LaTeX completo de la región (definición + expresión + resultado). */
  tex?: string;
  /** Veredicto booleano de una comparación (true=✓, false=✗). Lo pinta MathRegion. */
  bool?: boolean;
  /** Firma de una función definida por una región de programa (ej. "f(x)"). */
  defined?: string;
  /** Mensaje de error (sintaxis, variable indefinida, unidad incoherente...). */
  error?: string;
}

export type SheetResults = Record<string, RegionResult>;

const DEF_RE = /^\s*([\p{L}_][\p{L}\p{N}_]*)\s*:=\s*([\s\S]*)$/u;
// Último `=` de nivel superior que no forma parte de ==, <=, >=, != ni :=.
const TRAILING_EQ_RE = /^([\s\S]*[^:<>!=])=(?!=)([^=]*)$/;

/** Separa "nombre := expr = unidad" en sus partes. */
export function parseMathRegion(src: string): ParsedMath {
  let rest = src;
  let varName: string | undefined;

  const def = DEF_RE.exec(rest);
  if (def) {
    varName = def[1];
    rest = def[2];
  }

  let showResult = false;
  let targetUnit: string | undefined;
  const eq = TRAILING_EQ_RE.exec(rest);
  if (eq) {
    const tail = eq[2].trim();
    // Solo es un "=" de visualización si lo que sigue está vacío o parece una
    // unidad (identificadores combinados con * / ^ y dígitos), no una expresión.
    if (tail === '' || (/^[\p{L}\p{N}_*/^\s()-]*$/u.test(tail) && /\p{L}/u.test(tail))) {
      showResult = true;
      targetUnit = tail || undefined;
      rest = eq[1];
    }
  }

  return { varName, expr: rest.trim(), showResult, targetUnit };
}

/** Convierte `\_x` escapado por mathjs.toTex() en subíndices reales `_{x}`. */
function fixSubscripts(tex: string): string {
  return tex.replace(/\\_([\p{L}\p{N}]+)/gu, '_{$1}');
}

const GREEK = new Set([
  'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota',
  'kappa', 'lambda', 'mu', 'nu', 'xi', 'omicron', 'pi', 'rho', 'sigma', 'tau',
  'upsilon', 'phi', 'chi', 'psi', 'omega',
  'Gamma', 'Delta', 'Theta', 'Lambda', 'Xi', 'Pi', 'Sigma', 'Upsilon', 'Phi',
  'Psi', 'Omega',
]);

/** LaTeX de un nombre de variable: griegas y subíndices (`alpha_s` → `\alpha_{s}`). */
function symbolTex(name: string): string {
  const [head, ...rest] = name.split('_');
  const h = GREEK.has(head) ? `\\${head}` : head;
  // Llaves para que sea seguro concatenar (evita `\cdotL`).
  return rest.length ? `{${h}_{${rest.join('_')}}}` : `{${h}}`;
}

/**
 * LaTeX de una expresión math.js. Los símbolos presentes en `vars` se
 * renderizan como variables (cursiva + subíndice); el resto usa el toTex por
 * defecto, que muestra en redonda las unidades reconocidas (kN, MPa...).
 * Lanza si la expresión no parsea.
 */
function exprToTex(expr: string, vars: ReadonlySet<string>): string {
  const tex = math.parse(expr).toTex({
    parenthesis: 'auto',
    handler: (node: { type: string; name?: string }) => {
      if (node.type === 'SymbolNode' && node.name && vars.has(node.name)) {
        return symbolTex(node.name);
      }
      return undefined;
    },
  });
  return fixSubscripts(tex.trim());
}

/** Notación "2.0947e+5" → "2.0947\cdot 10^{5}". */
function numToTex(s: string): string {
  const m = /^(-?[\d.]+)e([+-]?\d+)$/i.exec(s);
  if (m) return `${m[1]}\\cdot 10^{${parseInt(m[2], 10)}}`;
  return s;
}

/** LaTeX del valor calculado: número (con exponente) + unidad en redonda. */
function resultToTex(value: unknown): string {
  const formatted = math.format(value, { precision: 5 });
  if (math.isUnit(value)) {
    const sp = formatted.indexOf(' ');
    if (sp !== -1) {
      const num = formatted.slice(0, sp);
      const unit = formatted.slice(sp + 1);
      return `${numToTex(num)}\\;\\mathrm{${unit.replace(/ /g, '\\,')}}`;
    }
  }
  return numToTex(formatted);
}

/**
 * Evalúa todas las regiones matemáticas de la hoja en orden de lectura
 * (y ascendente, luego x) con un scope compartido, y devuelve el LaTeX y
 * el resultado o error de cada una.
 */
export function evaluateSheet(regions: Region[]): SheetResults {
  const results: SheetResults = {};
  const scope: Record<string, unknown> = {};

  const ordered = regions
    .filter((r) => r.kind !== 'text')
    .sort((a, b) => a.y - b.y || a.x - b.x);

  const ctx: ProgramContext = {
    evaluate: (expr, s) => math.evaluate(expr, s),
    maxIters: MAX_ITERS,
  };

  for (const region of ordered) {
    if (region.src.trim() === '') {
      results[region.id] = {};
      continue;
    }

    if (region.kind === 'program') {
      results[region.id] = evalProgramRegion(region.src, scope, ctx);
      continue;
    }

    const parsed = parseMathRegion(region.src);

    // LaTeX de la parte izquierda (definición + expresión), independiente de
    // que la evaluación tenga éxito: así una región con error se ve igual.
    const known = new Set(Object.keys(scope));
    let tex: string | undefined;
    try {
      const lhs = parsed.varName ? `${symbolTex(parsed.varName)}\\,{:=}\\,` : '';
      tex = lhs + (parsed.expr ? exprToTex(parsed.expr, known) : '');
    } catch {
      tex = undefined; // sintaxis inválida: la región mostrará el texto crudo
    }

    if (!parsed.expr) {
      results[region.id] = { tex, error: 'Falta la expresión' };
      continue;
    }

    try {
      let value = math.evaluate(parsed.expr, scope);
      if (parsed.targetUnit) {
        if (!math.isUnit(value)) throw new Error(`El resultado no tiene unidades, no se puede convertir a ${parsed.targetUnit}`);
        value = value.to(parsed.targetUnit);
      }
      if (parsed.varName) scope[parsed.varName] = value;

      const isBool = typeof value === 'boolean';
      if (isBool && parsed.showResult) {
        // `tex` es la comparación renderizada; el veredicto ✓/✗ lo pinta MathRegion.
        results[region.id] = { tex, bool: value };
      } else {
        if (!isBool && parsed.showResult && tex !== undefined) {
          tex += `=${resultToTex(value)}`;
        }
        results[region.id] = { tex };
      }
    } catch (err) {
      results[region.id] = { tex, error: errMsg(err) };
    }
  }

  return results;
}

/**
 * Evalúa una región de programa. Si define una función (`f(x) := ...`) la
 * registra como closure en el scope compartido; si es un programa inline lo
 * ejecuta en una copia del scope (sus variables internas no contaminan la hoja)
 * y exporta su valor de retorno bajo el nombre de la cabecera, si lo hay.
 */
function evalProgramRegion(
  src: string,
  scope: Record<string, unknown>,
  ctx: ProgramContext,
): RegionResult {
  let prog;
  try {
    prog = parseProgram(src);
  } catch (err) {
    return { error: errMsg(err) };
  }

  if (prog.params && prog.name) {
    const { name, params, body } = prog;
    // El closure captura el scope vivo: ve las variables de la hoja al llamarse
    // (y permite recursión, pues `name` ya está en el scope).
    scope[name] = (...args: unknown[]) => {
      const local = { ...scope };
      params.forEach((p, i) => {
        local[p] = args[i];
      });
      return runProgram(body, local, ctx, { n: 0 });
    };
    return { defined: `${name}(${params.join(', ')})` };
  }

  try {
    const value = runProgram(prog.body, { ...scope }, ctx, { n: 0 });
    if (prog.name) scope[prog.name] = value;
    let tex: string | undefined;
    if (value !== undefined) {
      const lhs = prog.name ? `${symbolTex(prog.name)}=` : '';
      tex = lhs + resultToTex(value);
    }
    return { tex };
  } catch (err) {
    return { error: errMsg(err) };
  }
}

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
