import * as math from 'mathjs'
import type { Cell, EvalResult, ScopeVariable } from '@/types/notebook'
import { MathScope, formatValue } from './mathScope'
import { expressionToLatex } from './toLatex'

// ─── Friendly error messages ──────────────────────────────────────────────────

function friendlyError(err: unknown): string {
  if (!(err instanceof Error)) return 'Error desconocido'
  const msg = err.message

  if (msg.includes('Undefined symbol')) {
    const match = msg.match(/Undefined symbol (.+)/)
    const sym = match?.[1] ?? 'variable'
    return `Variable no definida: "${sym}"`
  }
  if (msg.includes('Cannot read') || msg.includes('is not a function')) {
    return 'Error de tipo: operación no soportada'
  }
  if (msg.includes('Division by zero') || msg.includes('Infinity')) {
    return 'División por cero'
  }
  if (msg.includes('Unexpected token') || msg.includes('Unexpected end')) {
    return 'Expresión incompleta o inválida'
  }
  if (msg.includes('Cannot convert')) {
    return `Error de unidades: ${msg}`
  }
  return msg.length > 100 ? msg.slice(0, 100) + '…' : msg
}

// ─── Single cell evaluation ───────────────────────────────────────────────────

/**
 * Evaluate a single expression string within a given scope.
 * The scope is mutated (variables are assigned into it).
 */
export function evaluateCell(expression: string, scope: MathScope): EvalResult {
  const expr = expression.trim()

  // Empty expression
  if (!expr) return {}

  // Comment lines (# or //)
  if (expr.startsWith('#') || expr.startsWith('//')) {
    return { display: expr }
  }

  try {
    const result = scope.evaluate(expr)

    // If result is undefined (e.g. assignment with side effects only), still OK
    const hasResult = result !== undefined && result !== null

    // Detect assignment: expression like "x = 5" or "f(x) = ..."
    let assignedVar: string | undefined
    try {
      const node = math.parse(expr)
      if (node.type === 'AssignmentNode') {
        assignedVar = (node as math.AssignmentNode).name
      }
      if (node.type === 'FunctionAssignmentNode') {
        assignedVar = (node as math.FunctionAssignmentNode).name
      }
    } catch {
      // ignore parse errors for assignment detection
    }

    const display = hasResult ? formatValue(result) : expr
    const latex = expressionToLatex(expr, hasResult ? result : undefined)

    return {
      result: hasResult ? result as EvalResult['result'] : undefined,
      display,
      latex,
      assignedVar,
    }
  } catch (err) {
    return { error: friendlyError(err) }
  }
}

// ─── Full notebook evaluation ─────────────────────────────────────────────────

export interface CellEvaluation {
  cellId: string
  result?: string
  rendered?: string
  error?: string
}

/**
 * Evaluate all cells in order, resetting scope first.
 * Returns per-cell results and the final scope variable list.
 */
export function evaluateNotebook(
  cells: Cell[],
  scope: MathScope
): { cellResults: CellEvaluation[]; scopeVariables: ScopeVariable[] } {
  scope.reset()
  // Canvas evaluation order: top → bottom (y), then left → right (x)
  const sorted = [...cells].sort((a, b) =>
    a.y !== b.y ? a.y - b.y : a.x - b.x
  )
  const cellResults: CellEvaluation[] = []

  for (const cell of sorted) {
    if (cell.type === 'text') {
      cellResults.push({ cellId: cell.id })
      continue
    }

    const evalResult = evaluateCell(cell.content, scope)

    cellResults.push({
      cellId: cell.id,
      result: evalResult.display,
      rendered: evalResult.latex,
      error: evalResult.error,
    })
  }

  return {
    cellResults,
    scopeVariables: scope.getVariables(),
  }
}

// ─── Autocompletion helpers ───────────────────────────────────────────────────

/** Built-in math.js symbols useful for autocompletion */
export const BUILTIN_COMPLETIONS: string[] = [
  // Constants
  'pi', 'e', 'phi', 'tau', 'Infinity', 'NaN',
  // Trig
  'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2',
  'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
  // Math
  'sqrt', 'cbrt', 'exp', 'log', 'log2', 'log10', 'abs',
  'ceil', 'floor', 'round', 'sign', 'mod', 'pow',
  'max', 'min', 'sum', 'prod', 'mean', 'median', 'std', 'variance',
  // Matrix
  'matrix', 'det', 'inv', 'transpose', 'cross', 'dot',
  'zeros', 'ones', 'identity', 'range', 'size',
  // Algebra
  'simplify', 'derivative', 'evaluate',
  // Units (common)
  'km', 'm', 'cm', 'mm', 'kg', 'g', 'mg', 'L', 'mL',
  'km/h', 'm/s', 'N', 'J', 'W', 'Pa', 'K', 'degC', 'degF',
]

/** Get completions for a partial word given current scope variables */
export function getCompletions(partial: string, scope: MathScope): string[] {
  const userVars = scope.getVariables().map(v => v.name)
  const all = [...new Set([...BUILTIN_COMPLETIONS, ...userVars])]
  const lower = partial.toLowerCase()
  return all.filter(c => c.toLowerCase().startsWith(lower) && c !== partial)
}

// ─── Unit detection helper ────────────────────────────────────────────────────

/** Try to detect if a value has physical units */
export function hasUnit(value: unknown): boolean {
  try {
    return math.typeOf(value) === 'Unit'
  } catch {
    return false
  }
}

/** Convert unit expression: e.g. "5 km to m" */
export function convertUnit(expression: string, scope: MathScope): EvalResult {
  return evaluateCell(expression, scope)
}

/** Format result with unit display */
export function formatResultWithUnit(result: unknown): string {
  if (!result) return ''
  try {
    const t = math.typeOf(result)
    if (t === 'Unit') {
      const u = result as math.Unit
      return u.toString()
    }
  } catch {
    // ignore
  }
  return formatValue(result)
}

// ─── LaTeX preview ────────────────────────────────────────────────────────────

/**
 * Generate a live LaTeX preview for partial/in-progress input.
 * Returns empty string on parse error (for graceful degradation).
 */
export function previewLatex(expression: string): string {
  const expr = expression.trim()
  if (!expr) return ''
  try {
    const node = math.parse(expr)
    return node.toTex({ parenthesis: 'keep', implicit: 'hide' })
  } catch {
    return ''
  }
}

/** Re-export for convenience */
export { valueToLatex } from './toLatex'
