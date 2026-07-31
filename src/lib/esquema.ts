// Esquema paramétrico: sustitución de tokens `{{expr}}` / `{{expr:unidad}}` en
// un SVG contra el scope de la hoja (fase 2 del plan de imágenes del canvas).
//
// El SVG vive en `public/esquemas/` y se dibuja con los rótulos como tokens:
//
//   <text>l = {{l_w:cm}} cm</text>      → "l = 15 cm"      (solo el número)
//   <text>U = {{U_5}}</text>            → "U = 0.7607"     (valor a secas)
//   <text>{{1 - x_bar/l_w}}</text>      → cualquier expresión mathjs vale
//
// La región `image` que lo muestra captura el scope en su posición de lectura
// (ver `evaluateSheet`): el esquema ve las variables definidas arriba, igual
// que una región math. Un token que no resuelve (variable no definida todavía,
// unidad incoherente) se pinta como `¿expr?` y queda en `faltantes` — y
// `verify-planilla.mjs` falla si hay alguno, así el esquema queda bajo el
// mismo contrato que los números.
//
// Seguridad: solo se inyecta SVG inline desde `/esquemas/` (mismo origen,
// autoría propia). Una imagen pegada por el usuario nunca pasa por aquí.

import { evalExpr, formatValor } from './worksheet';

/** Prefijo de ruta desde el que se permite render inline con tokens. */
export const ESQUEMAS_PREFIX = '/esquemas/';

const TOKEN_RE = /\{\{([^{}]+)\}\}/g;
// Cola de unidad: identificadores combinados con * / ^ y dígitos (mismo
// criterio que el `= unidad` de una región math).
const UNIT_TAIL_RE = /^[\p{L}\p{N}_*/^\s()-]*$/u;

export interface EsquemaRender {
  /** El SVG con los tokens sustituidos. */
  svg: string;
  /** Cuántos tokens tenía el SVG. */
  tokens: number;
  /** Tokens que no resolvieron (expresión, tal como se escribió). */
  faltantes: string[];
}

/** Separa `expr:unidad`; el último `:` solo es unidad si la cola lo parece. */
function separarToken(crudo: string): { expr: string; unidad?: string } {
  const i = crudo.lastIndexOf(':');
  if (i === -1) return { expr: crudo };
  const tail = crudo.slice(i + 1).trim();
  if (UNIT_TAIL_RE.test(tail) && /\p{L}/u.test(tail)) {
    return { expr: crudo.slice(0, i).trim(), unidad: tail };
  }
  return { expr: crudo };
}

/** Sustituye los tokens del SVG contra el scope. Nunca lanza. */
export function renderEsquema(
  svgText: string,
  scope: Record<string, unknown>,
): EsquemaRender {
  const faltantes: string[] = [];
  let tokens = 0;
  const svg = svgText.replace(TOKEN_RE, (_m, crudoRaw: string) => {
    tokens += 1;
    const crudo = crudoRaw.trim();
    const { expr, unidad } = separarToken(crudo);
    try {
      return formatValor(evalExpr(expr, scope), unidad);
    } catch {
      faltantes.push(crudo);
      return `¿${expr}?`;
    }
  });
  return { svg, tokens, faltantes };
}
