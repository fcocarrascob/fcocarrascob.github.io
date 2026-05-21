import * as math from 'mathjs'
import type { ScopeVariable, ScopeValue } from '@/types/notebook'

// ─── Scope Manager ────────────────────────────────────────────────────────────
// Each notebook gets a single Math.js parser instance that persists across cells.
// When re-evaluating the full notebook, we reset and replay all cells in order.

export class MathScope {
  private parser: math.Parser

  constructor() {
    this.parser = math.parser()
  }

  /** Reset all user-defined variables (keep built-ins) */
  reset(): void {
    this.parser.clear()
  }

  /** Evaluate a single expression string in this scope */
  evaluate(expression: string): unknown {
    return this.parser.evaluate(expression)
  }

  /** Return a snapshot of all user variables currently in scope */
  getVariables(): ScopeVariable[] {
    const all = this.parser.getAll() as Record<string, ScopeValue>
    return Object.entries(all).map(([name, value]) => ({
      name,
      value,
      type: inferType(value),
      displayValue: formatValue(value),
    }))
  }

  /** Get the underlying parser (for advanced use) */
  getParser(): math.Parser {
    return this.parser
  }
}

// ─── Type inference ───────────────────────────────────────────────────────────

export function inferType(value: unknown): ScopeVariable['type'] {
  if (typeof value === 'number') return 'number'
  if (typeof value === 'string') return 'string'
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'function') return 'function'
  if (math.typeOf(value) === 'Unit') return 'unit'
  if (math.typeOf(value) === 'Matrix') return 'matrix'
  if (math.typeOf(value) === 'Complex') return 'complex'
  return 'unknown'
}

// ─── Value formatting ─────────────────────────────────────────────────────────

export function formatValue(value: unknown): string {
  if (value === null || value === undefined) return 'undefined'
  if (typeof value === 'function') return 'f(…)'

  try {
    const t = math.typeOf(value)
    if (t === 'Unit') {
      return (value as math.Unit).toString()
    }
    if (t === 'Matrix') {
      const matrix = value as math.Matrix
      const size = matrix.size()
      if (size.length === 1 && size[0] <= 6) {
        return `[${(matrix.toArray() as number[]).join(', ')}]`
      }
      return `Matrix ${size.join('×')}`
    }
    if (t === 'Complex') {
      return (value as math.Complex).toString()
    }
    if (typeof value === 'number') {
      // Avoid ugly floating point tails
      return math.format(value, { precision: 10 })
    }
    return String(value)
  } catch {
    return String(value)
  }
}
