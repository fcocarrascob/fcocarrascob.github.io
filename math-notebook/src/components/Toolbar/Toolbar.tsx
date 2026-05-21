import { useRef, useState, useEffect } from 'react'
import {
  Play, Plus, Type, Trash2, Download, Upload, Calculator,
} from 'lucide-react'
import { useNotebookStore, useActiveNotebook, useActiveCells, snapToGrid, CELL_WIDTH } from '@/store/notebookStore'
import type { Notebook } from '@/types/notebook'

interface ToolbarProps {
  isDark: boolean
  onToggleDark: () => void
  onRunAll: () => void
  /** Ref to the outer scroll container — used to position new blocks at viewport center */
  scrollRef: React.RefObject<HTMLDivElement | null>
}

export function Toolbar({ isDark, onToggleDark, onRunAll, scrollRef }: ToolbarProps) {
  const { addCell } = useNotebookStore()
  const notebook = useActiveNotebook()
  const cells = useActiveCells()
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const titleInputRef = useRef<HTMLInputElement>(null)
  const { renameNotebook } = useNotebookStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Title editing ──────────────────────────────────────────────────────
  const startEditTitle = () => {
    setTitleDraft(notebook?.title ?? '')
    setIsEditingTitle(true)
    setTimeout(() => titleInputRef.current?.select(), 0)
  }

  const commitTitle = () => {
    if (notebook && titleDraft.trim()) {
      renameNotebook(notebook.id, titleDraft.trim())
    }
    setIsEditingTitle(false)
  }

  useEffect(() => {
    if (!isEditingTitle) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') commitTitle()
      if (e.key === 'Escape') setIsEditingTitle(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  // ── Compute viewport center to position new blocks ─────────────────────
  const getViewportCenter = () => {
    const el = scrollRef.current
    if (!el) return { x: 80, y: 80 }
    return {
      x: snapToGrid(el.scrollLeft + el.clientWidth  / 2 - CELL_WIDTH / 2),
      y: snapToGrid(el.scrollTop  + el.clientHeight / 2 - 40),
    }
  }

  const handleAddExpression = () => {
    const { x, y } = getViewportCenter()
    addCell('expression', x, y)
  }

  const handleAddText = () => {
    const { x, y } = getViewportCenter()
    addCell('text', x, y)
  }

  // ── Clear canvas ───────────────────────────────────────────────────────
  const handleClear = () => {
    if (confirm('¿Limpiar todos los bloques del canvas?')) {
      const s = useNotebookStore.getState()
      const nb = s.notebooks.find(n => n.id === s.activeNotebookId)
      if (!nb) return
      // Delete all cells and add a fresh empty one
      ;[...nb.cells].forEach(c => s.deleteCell(c.id))
      s.addCell('expression', 80, 80)
    }
  }

  // ── Export JSON ────────────────────────────────────────────────────────
  const handleExportJSON = () => {
    const nb = notebook
    if (!nb) return
    const data = JSON.stringify(nb, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${nb.title.replace(/\s+/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Import JSON ────────────────────────────────────────────────────────
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const nb = JSON.parse(ev.target?.result as string) as Notebook
        // Add as a new notebook and make it active
        useNotebookStore.setState(s => ({
          notebooks: [...s.notebooks, nb],
          activeNotebookId: nb.id,
          focusedCellId: null,
          scopeVariables: [],
        }))
        onRunAll()
      } catch {
        alert('El archivo no es un JSON válido de Canvas Notepad.')
      }
    }
    reader.readAsText(file)
    // Reset input so same file can be imported again
    e.target.value = ''
  }

  const blockCount = cells.length

  return (
    <header className={`
      flex items-center gap-2 px-4 py-2 border-b sticky top-0 z-50
      ${isDark
        ? 'bg-slate-950/95 border-slate-800 backdrop-blur'
        : 'bg-white/95 border-slate-200 backdrop-blur'}
    `}>
      {/* Logo */}
      <Calculator
        size={18}
        className={isDark ? 'text-violet-400' : 'text-violet-600'}
      />

      {/* Title editable */}
      {isEditingTitle ? (
        <input
          ref={titleInputRef}
          value={titleDraft}
          onChange={e => setTitleDraft(e.target.value)}
          onBlur={commitTitle}
          className={`
            text-sm font-semibold bg-transparent border-b outline-none
            border-violet-400 min-w-0 max-w-48
            ${isDark ? 'text-slate-100' : 'text-slate-900'}
          `}
          autoFocus
        />
      ) : (
        <button
          onClick={startEditTitle}
          className={`
            text-sm font-semibold truncate max-w-40 transition-colors
            ${isDark
              ? 'text-slate-100 hover:text-violet-400'
              : 'text-slate-900 hover:text-violet-600'}
          `}
          title="Renombrar canvas"
        >
          {notebook?.title ?? 'Canvas Notepad'}
        </button>
      )}

      {/* Block count */}
      <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        {blockCount} {blockCount === 1 ? 'bloque' : 'bloques'}
      </span>

      <div className="flex-1" />

      {/* ── Actions ── */}
      <div className="flex items-center gap-1">
        <Btn onClick={handleAddExpression} title="+ Ecuación" icon={<Plus size={13}/>} label="Ecuación" variant="primary" isDark={isDark} />
        <Btn onClick={handleAddText}       title="+ Texto"    icon={<Type size={13}/>} label="Texto" isDark={isDark} />

        <div className={`w-px h-5 mx-1 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />

        <Btn onClick={onRunAll}        title="Evaluar todo (Ctrl+Shift+Enter)" icon={<Play size={13} fill="currentColor"/>} isDark={isDark} />
        <Btn onClick={handleExportJSON} title="Exportar JSON"                 icon={<Download size={13}/>} isDark={isDark} />
        <Btn onClick={() => fileInputRef.current?.click()} title="Importar JSON" icon={<Upload size={13}/>} isDark={isDark} />
        <Btn onClick={handleClear}     title="Limpiar canvas"                 icon={<Trash2 size={13}/>}  isDark={isDark} variant="danger" />
      </div>

      {/* Dark mode toggle */}
      <div className={`w-px h-5 mx-1 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
      <button
        onClick={onToggleDark}
        className={`
          p-1.5 rounded-md transition-colors text-xs
          ${isDark
            ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}
        `}
        title={isDark ? 'Modo claro' : 'Modo oscuro'}
      >
        {isDark ? '☀' : '☾'}
      </button>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImportJSON}
      />
    </header>
  )
}

// ─── Mini button helper ────────────────────────────────────────────────────────

interface BtnProps {
  onClick: () => void
  title: string
  icon: React.ReactNode
  label?: string
  variant?: 'default' | 'primary' | 'danger'
  isDark: boolean
}

function Btn({ onClick, title, icon, label, variant = 'default', isDark }: BtnProps) {
  const base = 'flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors'
  const variants = {
    default: isDark
      ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    primary: 'bg-violet-600 hover:bg-violet-700 text-white shadow-sm',
    danger: isDark
      ? 'text-red-400 hover:bg-red-950/40'
      : 'text-red-500 hover:bg-red-50',
  }
  return (
    <button onClick={onClick} title={title} className={`${base} ${variants[variant]}`}>
      {icon}
      {label && <span>{label}</span>}
    </button>
  )
}
