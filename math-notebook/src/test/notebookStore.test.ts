import { describe, it, expect, beforeEach } from 'vitest'
import { useNotebookStore } from '@/store/notebookStore'

// Reset store between tests
beforeEach(() => {
  useNotebookStore.setState({
    notebooks: [],
    activeNotebookId: null,
    focusedCellId: null,
    scopeVariables: [],
  })
})

describe('notebookStore — notebook actions', () => {
  it('creates a notebook and sets it as active', () => {
    const id = useNotebookStore.getState().createNotebook('Test NB')
    const state = useNotebookStore.getState()
    expect(state.activeNotebookId).toBe(id)
    const nb = state.notebooks.find(n => n.id === id)
    expect(nb).toBeDefined()
    expect(nb!.title).toBe('Test NB')
    expect(nb!.cells).toHaveLength(1)
  })

  it('renames a notebook', () => {
    const id = useNotebookStore.getState().createNotebook('Old')
    useNotebookStore.getState().renameNotebook(id, 'New Name')
    const nb = useNotebookStore.getState().notebooks.find(n => n.id === id)
    expect(nb!.title).toBe('New Name')
  })

  it('duplicates a notebook with a copy suffix', () => {
    const id = useNotebookStore.getState().createNotebook('Original')
    useNotebookStore.getState().duplicateNotebook(id)
    const state = useNotebookStore.getState()
    expect(state.notebooks).toHaveLength(2)
    const copy = state.notebooks.find(n => n.title.includes('copia'))
    expect(copy).toBeDefined()
  })

  it('deletes a notebook and switches to another', () => {
    const id1 = useNotebookStore.getState().createNotebook('NB1')
    useNotebookStore.getState().createNotebook('NB2')
    useNotebookStore.getState().deleteNotebook(id1)
    const state = useNotebookStore.getState()
    expect(state.notebooks).toHaveLength(1)
    expect(state.activeNotebookId).not.toBe(id1)
  })

  it('creates a fresh notebook when the last one is deleted', () => {
    const id = useNotebookStore.getState().createNotebook('Solo')
    useNotebookStore.getState().deleteNotebook(id)
    const state = useNotebookStore.getState()
    expect(state.notebooks).toHaveLength(1)
    expect(state.notebooks[0].id).not.toBe(id)
  })
})

describe('notebookStore — cell actions', () => {
  it('adds a cell to the active notebook', () => {
    useNotebookStore.getState().createNotebook()
    const cellId = useNotebookStore.getState().addCell('expression')
    const state = useNotebookStore.getState()
    const nb = state.notebooks.find(n => n.id === state.activeNotebookId)
    // createNotebook adds 1 cell, addCell adds another = 2
    expect(nb!.cells).toHaveLength(2)
    expect(nb!.cells.some(c => c.id === cellId)).toBe(true)
  })

  it('updates cell content', () => {
    useNotebookStore.getState().createNotebook()
    const cellId = useNotebookStore.getState().addCell()
    useNotebookStore.getState().updateCell(cellId, 'x = 5')
    const state = useNotebookStore.getState()
    const nb = state.notebooks.find(n => n.id === state.activeNotebookId)
    const cell = nb!.cells.find(c => c.id === cellId)
    expect(cell!.content).toBe('x = 5')
  })

  it('deletes a cell and renumbers orders', () => {
    useNotebookStore.getState().createNotebook()
    const c1 = useNotebookStore.getState().addCell()
    const c2 = useNotebookStore.getState().addCell()
    const nbId = useNotebookStore.getState().activeNotebookId!
    const before = useNotebookStore.getState().notebooks.find(n => n.id === nbId)
    const initialCount = before!.cells.length

    useNotebookStore.getState().deleteCell(c1)
    const after = useNotebookStore.getState().notebooks.find(n => n.id === nbId)
    expect(after!.cells).toHaveLength(initialCount - 1)
    expect(after!.cells.some(c => c.id === c1)).toBe(false)
    expect(after!.cells.some(c => c.id === c2)).toBe(true)
  })

  it('keeps at least one cell when deleting the last one', () => {
    const id = useNotebookStore.getState().createNotebook()
    const nb = useNotebookStore.getState().notebooks.find(n => n.id === id)!
    const onlyCell = nb.cells[0]
    useNotebookStore.getState().deleteCell(onlyCell.id)
    const updated = useNotebookStore.getState().notebooks.find(n => n.id === id)!
    expect(updated.cells).toHaveLength(1)
  })

  it('exports notebook to text', () => {
    useNotebookStore.getState().createNotebook('Export Test')
    const state = useNotebookStore.getState()
    const nb = state.notebooks.find(n => n.id === state.activeNotebookId)!
    useNotebookStore.getState().updateCell(nb.cells[0].id, 'x = 5')
    useNotebookStore.getState().updateCellResult(nb.cells[0].id, '5', undefined, undefined)
    const text = useNotebookStore.getState().exportToText()
    expect(text).toContain('Export Test')
    expect(text).toContain('x = 5')
    expect(text).toContain('→ 5')
  })
})
