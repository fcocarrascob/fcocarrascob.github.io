import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import type { Notebook, Cell, CellType, ScopeVariable } from '@/types/notebook'

// ─── Constants ────────────────────────────────────────────────────────────────

export const CELL_WIDTH   = 320   // px — fixed block width
export const GRID_SIZE    = 20    // px — snap grid
export const CANVAS_W     = 3000  // px — canvas virtual width
export const CANVAS_H     = 2000  // px — canvas virtual height

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function now(): string {
  return new Date().toISOString()
}

/** Snap a pixel value to the grid */
export function snapToGrid(v: number): number {
  return Math.round(v / GRID_SIZE) * GRID_SIZE
}

function makeCell(type: CellType, x = 80, y = 80): Cell {
  return {
    id: generateId(),
    type,
    content: '',
    x,
    y,
    width: CELL_WIDTH,
  }
}

/** Create a blank notebook with a single empty expression cell */
function makeNotebook(title = 'Notebook sin título'): Notebook {
  return {
    id: generateId(),
    title,
    cells: [makeCell('expression', 80, 80)],
    createdAt: now(),
    updatedAt: now(),
  }
}

/** Create the welcome notebook with example blocks pre-filled */
function makeExampleNotebook(): Notebook {
  return {
    id: generateId(),
    title: 'Mi primer canvas',
    cells: [
      { id: generateId(), type: 'expression', content: 'a = 30',    x: 80, y: 80,  width: CELL_WIDTH },
      { id: generateId(), type: 'expression', content: 'b = 3',     x: 80, y: 180, width: CELL_WIDTH },
      { id: generateId(), type: 'expression', content: 'c = a * b', x: 80, y: 280, width: CELL_WIDTH },
    ],
    createdAt: now(),
    updatedAt: now(),
  }
}

// ─── Store State ──────────────────────────────────────────────────────────────

export interface NotebookState {
  /** List of all saved notebooks */
  notebooks: Notebook[]
  /** Currently active notebook id */
  activeNotebookId: string | null
  /** Currently focused cell id */
  focusedCellId: string | null
  /** Scope variables derived from the last full evaluation */
  scopeVariables: ScopeVariable[]

  // ── Notebook actions ──
  createNotebook: (title?: string) => string
  deleteNotebook: (id: string) => void
  renameNotebook: (id: string, title: string) => void
  duplicateNotebook: (id: string) => string
  setActiveNotebook: (id: string) => void

  // ── Cell actions ──
  addCell: (type?: CellType, x?: number, y?: number) => string
  updateCell: (id: string, content: string) => void
  updateCellResult: (id: string, result: string | undefined, rendered: string | undefined, error: string | undefined) => void
  moveCell: (id: string, x: number, y: number) => void
  deleteCell: (id: string) => void
  focusCell: (id: string | null) => void

  // ── Evaluation ──
  setScopeVariables: (vars: ScopeVariable[]) => void

  // ── Export ──
  exportToText: () => string
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useNotebookStore = create<NotebookState>()(
  persist(
    (set, get) => {
      const defaultNotebook = makeExampleNotebook()

      return {
        notebooks: [defaultNotebook],
        activeNotebookId: defaultNotebook.id,
        focusedCellId: defaultNotebook.cells[0]?.id ?? null,
        scopeVariables: [],

        // ── Notebook actions ────────────────────────────────────────────────

        createNotebook: (title) => {
          const nb = makeNotebook(title)
          set(state => ({
            notebooks: [...state.notebooks, nb],
            activeNotebookId: nb.id,
            focusedCellId: nb.cells[0]?.id ?? null,
            scopeVariables: [],
          }))
          return nb.id
        },

        deleteNotebook: (id) => {
          set(state => {
            const remaining = state.notebooks.filter(n => n.id !== id)
            if (remaining.length === 0) {
              const fresh = makeNotebook()
              return {
                notebooks: [fresh],
                activeNotebookId: fresh.id,
                focusedCellId: fresh.cells[0]?.id ?? null,
                scopeVariables: [],
              }
            }
            const newActiveId = state.activeNotebookId === id
              ? (remaining[remaining.length - 1]?.id ?? null)
              : state.activeNotebookId
            return {
              notebooks: remaining,
              activeNotebookId: newActiveId,
              focusedCellId: null,
              scopeVariables: [],
            }
          })
        },

        renameNotebook: (id, title) => {
          set(state => ({
            notebooks: state.notebooks.map(n =>
              n.id === id ? { ...n, title, updatedAt: now() } : n
            ),
          }))
        },

        duplicateNotebook: (id) => {
          const state = get()
          const original = state.notebooks.find(n => n.id === id)
          if (!original) return id
          const copy: Notebook = {
            ...original,
            id: generateId(),
            title: `${original.title} (copia)`,
            cells: original.cells.map(c => ({
              ...c,
              id: generateId(),
              // Offset the copy slightly so it's visually distinct
              x: snapToGrid(c.x + GRID_SIZE * 4),
              y: snapToGrid(c.y + GRID_SIZE * 4),
            })),
            createdAt: now(),
            updatedAt: now(),
          }
          set(s => ({
            notebooks: [...s.notebooks, copy],
            activeNotebookId: copy.id,
            focusedCellId: copy.cells[0]?.id ?? null,
            scopeVariables: [],
          }))
          return copy.id
        },

        setActiveNotebook: (id) => {
          const state = get()
          const nb = state.notebooks.find(n => n.id === id)
          set({
            activeNotebookId: id,
            focusedCellId: nb?.cells[0]?.id ?? null,
            scopeVariables: [],
          })
        },

        // ── Cell actions ────────────────────────────────────────────────────

        addCell: (type = 'expression', x = 80, y = 80) => {
          const newCell = makeCell(type, snapToGrid(x), snapToGrid(y))
          set(s => ({
            notebooks: s.notebooks.map(n =>
              n.id === s.activeNotebookId
                ? { ...n, cells: [...n.cells, newCell], updatedAt: now() }
                : n
            ),
            focusedCellId: newCell.id,
          }))
          return newCell.id
        },

        updateCell: (id, content) => {
          set(s => ({
            notebooks: s.notebooks.map(n =>
              n.id === s.activeNotebookId
                ? {
                    ...n,
                    cells: n.cells.map(c => c.id === id ? { ...c, content } : c),
                    updatedAt: now(),
                  }
                : n
            ),
          }))
        },

        updateCellResult: (id, result, rendered, error) => {
          set(s => ({
            notebooks: s.notebooks.map(n =>
              n.id === s.activeNotebookId
                ? {
                    ...n,
                    cells: n.cells.map(c =>
                      c.id === id ? { ...c, result, rendered, error } : c
                    ),
                  }
                : n
            ),
          }))
        },

        moveCell: (id, x, y) => {
          set(s => ({
            notebooks: s.notebooks.map(n =>
              n.id === s.activeNotebookId
                ? {
                    ...n,
                    cells: n.cells.map(c =>
                      c.id === id
                        ? { ...c, x: snapToGrid(Math.max(0, x)), y: snapToGrid(Math.max(0, y)) }
                        : c
                    ),
                    updatedAt: now(),
                  }
                : n
            ),
          }))
        },

        deleteCell: (id) => {
          set(s => {
            const nb = s.notebooks.find(n => n.id === s.activeNotebookId)
            if (!nb) return s
            if (nb.cells.length <= 1) {
              // Replace with a blank cell instead of deleting the last one
              const blank = makeCell('expression', 80, 80)
              return {
                notebooks: s.notebooks.map(n =>
                  n.id === s.activeNotebookId
                    ? { ...n, cells: [blank], updatedAt: now() }
                    : n
                ),
                focusedCellId: blank.id,
              }
            }
            const remaining = nb.cells.filter(c => c.id !== id)
            return {
              notebooks: s.notebooks.map(n =>
                n.id === s.activeNotebookId
                  ? { ...n, cells: remaining, updatedAt: now() }
                  : n
              ),
              focusedCellId: s.focusedCellId === id
                ? (remaining[0]?.id ?? null)
                : s.focusedCellId,
            }
          })
        },

        focusCell: (id) => {
          set({ focusedCellId: id })
        },

        // ── Evaluation ──────────────────────────────────────────────────────

        setScopeVariables: (vars) => {
          set({ scopeVariables: vars })
        },

        // ── Export ──────────────────────────────────────────────────────────

        exportToText: () => {
          const state = get()
          const nb = state.notebooks.find(n => n.id === state.activeNotebookId)
          if (!nb) return ''
          // Sort by y, then x for top-to-bottom reading order
          const sorted = [...nb.cells].sort((a, b) =>
            a.y !== b.y ? a.y - b.y : a.x - b.x
          )
          const lines: string[] = [`# ${nb.title}`, '']
          for (const cell of sorted) {
            if (!cell.content.trim()) continue
            lines.push(cell.content)
            if (cell.result) lines.push(`  → ${cell.result}`)
            if (cell.error) lines.push(`  ⚠ ${cell.error}`)
            lines.push('')
          }
          return lines.join('\n')
        },
      }
    },
    {
      name: 'canvas-notepad-v1',
      version: 1,
      // Migrate old notebook format (with 'order') to new format (with x, y)
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          const state = persistedState as { notebooks?: Array<{ cells?: Array<Record<string, unknown>> }> }
          state.notebooks?.forEach(nb => {
            nb.cells?.forEach((cell, i) => {
              if (!('x' in cell)) cell.x = 80
              if (!('y' in cell)) cell.y = 80 + i * 100
              if (!('width' in cell)) cell.width = CELL_WIDTH
              delete cell.order
            })
          })
        }
        return persistedState as NotebookState
      },
    }
  )
)

// ─── Derived selectors ────────────────────────────────────────────────────────

export function useActiveNotebook() {
  return useNotebookStore(s =>
    s.notebooks.find(n => n.id === s.activeNotebookId) ?? null
  )
}

/** Returns cells of the active notebook sorted by canvas position (top → bottom, left → right) */
export function useActiveCells() {
  return useNotebookStore(
    useShallow(s => {
      const nb = s.notebooks.find(n => n.id === s.activeNotebookId)
      if (!nb) return []
      return [...nb.cells].sort((a, b) =>
        a.y !== b.y ? a.y - b.y : a.x - b.x
      )
    })
  )
}
