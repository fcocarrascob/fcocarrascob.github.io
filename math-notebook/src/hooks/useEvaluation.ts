import { useCallback, useRef, useMemo } from 'react'
import { useNotebookStore, useActiveNotebook } from '@/store/notebookStore'
import { MathScope } from '@/engine/mathScope'
import { evaluateCell, evaluateNotebook } from '@/engine/evaluator'
import type { Cell } from '@/types/notebook'

/**
 * Hook that manages math evaluation for the active notebook.
 * Keeps a persistent MathScope instance per notebook.
 */
export function useEvaluation() {
  const store = useNotebookStore()
  const notebook = useActiveNotebook()

  // One scope per active notebook — reset when notebook changes
  const scopeRef = useRef<MathScope>(new MathScope())
  const lastNotebookIdRef = useRef<string | null>(null)

  if (notebook?.id !== lastNotebookIdRef.current) {
    scopeRef.current = new MathScope()
    lastNotebookIdRef.current = notebook?.id ?? null
  }

  const scope = scopeRef.current

  // Evaluate a single cell (used for incremental evaluation on edit)
  const evalCell = useCallback((cell: Cell, cells: Cell[]) => {
    if (cell.type === 'text') return

    // Re-run all cells up to and including this one to keep scope consistent
    // Canvas order: top → bottom (y), then left → right (x)
    const sorted = [...cells].sort((a, b) =>
      a.y !== b.y ? a.y - b.y : a.x - b.x
    )
    const upToAndIncluding = sorted.slice(0, sorted.findIndex(c => c.id === cell.id) + 1)

    // Reset scope and replay
    scope.reset()
    for (const c of upToAndIncluding) {
      if (c.type === 'text') continue
      const result = evaluateCell(c.content, scope)
      store.updateCellResult(
        c.id,
        result.display,
        result.latex,
        result.error
      )
    }

    // Re-evaluate cells below this one to propagate changes
    const after = sorted.slice(sorted.findIndex(c => c.id === cell.id) + 1)
    for (const c of after) {
      if (c.type === 'text') continue
      const result = evaluateCell(c.content, scope)
      store.updateCellResult(c.id, result.display, result.latex, result.error)
    }

    store.setScopeVariables(scope.getVariables())
  }, [scope, store])

  // Evaluate entire notebook from scratch
  const evalAll = useCallback((cells: Cell[]) => {
    const { cellResults, scopeVariables } = evaluateNotebook(cells, scope)
    for (const cr of cellResults) {
      store.updateCellResult(cr.cellId, cr.result, cr.rendered, cr.error)
    }
    store.setScopeVariables(scopeVariables)
  }, [scope, store])

  const currentScope = useMemo(() => scope, [scope])

  return { evalCell, evalAll, scope: currentScope }
}
