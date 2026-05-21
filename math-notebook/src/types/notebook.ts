// ─── Cell Types ───────────────────────────────────────────────────────────────

export type CellType = 'expression' | 'text'

export interface Cell {
  id: string
  type: CellType
  content: string
  /** Canvas X position in pixels (snapped to 20px grid) */
  x: number
  /** Canvas Y position in pixels (snapped to 20px grid) */
  y: number
  /** Block width in pixels (fixed: 320px) */
  width: number
  /** Evaluated numeric/string result */
  result?: string
  /** LaTeX string for KaTeX rendering */
  rendered?: string
  /** Error message if evaluation failed */
  error?: string
}

// ─── Notebook ─────────────────────────────────────────────────────────────────

export interface Notebook {
  id: string
  title: string
  cells: Cell[]
  createdAt: string   // ISO date string (serializable for localStorage)
  updatedAt: string
}

// ─── Variable Scope ───────────────────────────────────────────────────────────

export type ScopeValue =
  | number
  | string
  | boolean
  | object   // covers mathjs matrices, units, complex, etc.

export interface ScopeVariable {
  name: string
  value: ScopeValue
  type: 'number' | 'string' | 'boolean' | 'function' | 'matrix' | 'unit' | 'complex' | 'unknown'
  displayValue: string  // human-readable representation
}

// ─── Evaluation Result ────────────────────────────────────────────────────────

export interface EvalResult {
  /** Raw result value */
  result?: ScopeValue
  /** LaTeX string of the full expression = result */
  latex?: string
  /** Plain text fallback */
  display?: string
  /** Error message if evaluation failed */
  error?: string
  /** Newly assigned variable name (if this was an assignment) */
  assignedVar?: string
}
