import * as math from 'mathjs'
import { formatValue } from './mathScope'

// ─── AST → LaTeX ──────────────────────────────────────────────────────────────

/**
 * Convert a math.js expression string + its result to a LaTeX string.
 * e.g. "area = pi * r^2" with result 12.566 → "area = \pi \cdot r^{2} = 12.566"
 */
export function expressionToLatex(expression: string, result: unknown): string {
  const expr = expression.trim()
  if (!expr) return ''

  try {
    const node = math.parse(expr)
    const exprLatex = node.toTex({ parenthesis: 'keep', implicit: 'hide' })
    const resultLatex = valueToLatex(result)

    // If the expression itself is an assignment, show "lhs = rhs = result"
    // but only add result if it differs from the rhs display
    if (node.type === 'AssignmentNode') {
      const rhsLatex = (node as math.AssignmentNode).value.toTex({ parenthesis: 'keep' })
      if (rhsLatex === resultLatex) {
        return exprLatex   // e.g. "x = 5" — no need to repeat
      }
      return `${exprLatex} = ${resultLatex}`
    }

    // Pure expression: "expr = result"
    if (resultLatex && resultLatex !== exprLatex) {
      return `${exprLatex} = ${resultLatex}`
    }
    return exprLatex
  } catch {
    // Fallback: escape expression as text
    return `\\text{${escapeLatex(expr)}}`
  }
}

/**
 * Convert a math.js result value to a LaTeX string.
 */
export function valueToLatex(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'function') return '\\text{función}'

  try {
    const t = math.typeOf(value)

    if (t === 'number') {
      const n = value as number
      if (!isFinite(n)) return n > 0 ? '\\infty' : '-\\infty'
      return math.format(n, { precision: 10 })
    }

    if (t === 'boolean') {
      return value ? '\\text{verdadero}' : '\\text{falso}'
    }

    if (t === 'string') {
      return `\\text{${escapeLatex(String(value))}}`
    }

    if (t === 'Complex') {
      const c = value as math.Complex
      const re = math.format(c.re, { precision: 8 })
      if (c.im === 0) return re
      const imSign = c.im >= 0 ? '+' : '-'
      const imAbs = math.format(Math.abs(c.im), { precision: 8 })
      return `${re} ${imSign} ${imAbs}i`
    }

    if (t === 'Unit') {
      // Use math.js native LaTeX for units
      try {
        const node = math.parse(formatValue(value))
        return node.toTex({ parenthesis: 'keep' })
      } catch {
        return escapeLatex(formatValue(value))
      }
    }

    if (t === 'Matrix') {
      const matrix = value as math.Matrix
      const arr = matrix.toArray() as number[][]
      const size = matrix.size()
      if (size.length === 1) {
        // Row vector
        const cols = (arr as unknown as number[]).map(v => math.format(v, { precision: 8 }))
        return `\\begin{pmatrix} ${cols.join(' & ')} \\end{pmatrix}`
      }
      if (size.length === 2) {
        const rows = (arr as number[][]).map(row =>
          row.map(v => math.format(v, { precision: 8 })).join(' & ')
        )
        return `\\begin{pmatrix} ${rows.join(' \\\\ ')} \\end{pmatrix}`
      }
      return `\\text{Matrix}_{${size.join('\\times')}}`
    }

    // Fallback: use formatValue
    return escapeLatex(formatValue(value))
  } catch {
    return escapeLatex(formatValue(value))
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeLatex(s: string): string {
  return s
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/[&%$#_{}]/g, c => `\\${c}`)
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/~/g, '\\textasciitilde{}')
}
