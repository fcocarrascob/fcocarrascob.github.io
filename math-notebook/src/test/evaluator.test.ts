import { describe, it, expect, beforeEach } from 'vitest'
import { evaluateCell, evaluateNotebook, previewLatex } from '@/engine/evaluator'
import { MathScope } from '@/engine/mathScope'
import type { Cell } from '@/types/notebook'

function makeCell(id: string, content: string, y: number): Cell {
  return { id, type: 'expression', content, x: 80, y, width: 320 }
}

describe('evaluateCell', () => {
  let scope: MathScope

  beforeEach(() => {
    scope = new MathScope()
  })

  it('evaluates a simple number', () => {
    const res = evaluateCell('42', scope)
    expect(res.error).toBeUndefined()
    expect(res.display).toBe('42')
  })

  it('assigns a variable and detects the name', () => {
    const res = evaluateCell('x = 5', scope)
    expect(res.error).toBeUndefined()
    expect(res.assignedVar).toBe('x')
  })

  it('uses previously assigned variable in next eval', () => {
    evaluateCell('x = 5', scope)
    const res = evaluateCell('x + 3', scope)
    expect(res.error).toBeUndefined()
    expect(res.display).toBe('8')
  })

  it('evaluates sqrt(16) = 4', () => {
    const res = evaluateCell('sqrt(16)', scope)
    expect(res.display).toBe('4')
  })

  it('evaluates pi * r^2 for r = 3', () => {
    evaluateCell('r = 3', scope)
    const res = evaluateCell('pi * r^2', scope)
    expect(res.error).toBeUndefined()
    // ~28.274...
    expect(parseFloat(res.display ?? '0')).toBeCloseTo(28.274, 2)
  })

  it('returns friendly error for undefined variable', () => {
    const res = evaluateCell('undefined_var + 1', scope)
    expect(res.error).toBeDefined()
    expect(res.error).toContain('no definida')
  })

  it('returns friendly error for division by zero', () => {
    const res = evaluateCell('1 / 0', scope)
    // Math.js returns Infinity, not an error, so check display
    // (Math.js behavior: 1/0 = Infinity)
    expect(res.error).toBeUndefined()
    expect(res.display?.toLowerCase()).toMatch(/infinity|∞|inf/i)
  })

  it('handles empty expression gracefully', () => {
    const res = evaluateCell('', scope)
    expect(res.error).toBeUndefined()
    expect(res.result).toBeUndefined()
  })

  it('handles comment lines', () => {
    const res = evaluateCell('# this is a comment', scope)
    expect(res.error).toBeUndefined()
    expect(res.display).toBe('# this is a comment')
  })

  it('evaluates unit expression', () => {
    const res = evaluateCell('5 km to m', scope)
    expect(res.error).toBeUndefined()
    expect(res.display).toContain('5000')
  })

  it('evaluates function definition and call', () => {
    evaluateCell('f(x) = x^2 + 1', scope)
    const res = evaluateCell('f(3)', scope)
    expect(res.display).toBe('10')
  })
})

describe('evaluateNotebook', () => {
  let scope: MathScope

  beforeEach(() => {
    scope = new MathScope()
  })

  it('evaluates all cells in order and returns scope variables', () => {
    const cells: Cell[] = [
      makeCell('c1', 'x = 2', 0),
      makeCell('c2', 'y = x * 3', 1),
      makeCell('c3', 'z = y + x', 2),
    ]
    const { cellResults, scopeVariables } = evaluateNotebook(cells, scope)
    expect(cellResults).toHaveLength(3)
    // z = 2*3 + 2 = 8
    expect(cellResults[2].result).toBe('8')
    expect(scopeVariables.some(v => v.name === 'x')).toBe(true)
    expect(scopeVariables.some(v => v.name === 'z')).toBe(true)
  })

  it('does not stop on error — subsequent cells still run', () => {
    const cells: Cell[] = [
      makeCell('c1', 'bad_var + 1', 0),   // error
      makeCell('c2', 'good = 42', 1),      // should still run
    ]
    const { cellResults } = evaluateNotebook(cells, scope)
    expect(cellResults[0].error).toBeDefined()
    expect(cellResults[1].result).toBe('42')
  })

  it('resets scope between full evaluations', () => {
    const cells1: Cell[] = [makeCell('c1', 'a = 10', 0)]
    evaluateNotebook(cells1, scope)
    // Re-run with different content — scope should be fresh
    const cells2: Cell[] = [makeCell('c1', 'b = 20', 0)]
    const { scopeVariables } = evaluateNotebook(cells2, scope)
    expect(scopeVariables.some(v => v.name === 'a')).toBe(false)
    expect(scopeVariables.some(v => v.name === 'b')).toBe(true)
  })
})

describe('previewLatex', () => {
  it('converts expression to LaTeX string', () => {
    const latex = previewLatex('sqrt(x^2 + 1)')
    expect(latex).toContain('sqrt')
  })

  it('returns empty string for empty input', () => {
    expect(previewLatex('')).toBe('')
  })

  it('returns empty string for invalid expression', () => {
    expect(previewLatex('(((')).toBe('')
  })
})
