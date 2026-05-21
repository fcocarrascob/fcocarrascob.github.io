import { useState, useEffect, useCallback, useRef } from 'react'
import { Toolbar } from '@/components/Toolbar/Toolbar'
import { Canvas } from '@/components/Canvas/Canvas'
import { VariablesPanel } from '@/components/VariablesPanel/VariablesPanel'
import { useEvaluation } from '@/hooks/useEvaluation'
import { useActiveCells, useNotebookStore } from '@/store/notebookStore'

function App() {
  // ── Dark mode (persiste en localStorage) ──────────────────────────────
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    return false
  })

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  // ── Canvas scroll container ref (para posicionar nuevos bloques) ───────
  const scrollRef = useRef<HTMLDivElement>(null)

  // ── Evaluation ────────────────────────────────────────────────────────
  const cells = useActiveCells()
  const { evalCell, evalAll } = useEvaluation()

  const handleRunAll = useCallback(() => {
    evalAll(cells)
  }, [evalAll, cells])

  const handleEvalCell = useCallback((id: string) => {
    const cell = cells.find(c => c.id === id)
    if (cell) evalCell(cell, cells)
  }, [evalCell, cells])

  // Eval on load (rehydrate results from localStorage)
  useEffect(() => {
    if (cells.length > 0) evalAll(cells)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useNotebookStore.getState().activeNotebookId])

  // Ctrl+Shift+Enter → evaluar todo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
        e.preventDefault()
        handleRunAll()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleRunAll])

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${dark ? 'dark bg-slate-950' : 'bg-white'}`}>
      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <Toolbar
        isDark={dark}
        onToggleDark={() => setDark(d => !d)}
        onRunAll={handleRunAll}
        scrollRef={scrollRef}
      />

      {/* ── Main area: canvas + variables panel ─────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Scrollable canvas wrapper */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-auto"
          style={{ scrollBehavior: 'auto' }}
        >
          <Canvas
            isDark={dark}
            onEvalCell={handleEvalCell}
          />
        </div>

        {/* Variables panel (sidebar derecha — lee scopeVariables del store) */}
        <VariablesPanel />
      </div>
    </div>
  )
}

export default App
