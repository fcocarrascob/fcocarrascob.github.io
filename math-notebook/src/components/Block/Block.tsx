import { GripHorizontal, X } from 'lucide-react'
import { useNotebookStore, CELL_WIDTH } from '@/store/notebookStore'
import { MathBlock } from './MathBlock'
import { TextBlock } from './TextBlock'
import type { Cell } from '@/types/notebook'

interface BlockProps {
  cell: Cell
  isDark: boolean
  isFocused: boolean
  isDragging: boolean
  onFocus: () => void
  onDragStart: (e: React.MouseEvent) => void
  onEval: () => void
}

export function Block({
  cell,
  isDark,
  isFocused,
  isDragging,
  onFocus,
  onDragStart,
  onEval,
}: BlockProps) {
  const { deleteCell, updateCell } = useNotebookStore()

  const borderColor = isDark
    ? isFocused ? 'border-violet-500' : 'border-slate-700 hover:border-slate-500'
    : isFocused ? 'border-violet-400' : 'border-slate-200 hover:border-slate-300'

  const bgColor = isDark ? 'bg-slate-900' : 'bg-white'

  return (
    <div
      className={`
        absolute rounded-lg border shadow-sm transition-shadow
        ${bgColor} ${borderColor}
        ${isDragging ? 'shadow-xl opacity-90 z-50' : 'shadow-sm z-10'}
      `}
      style={{
        left: cell.x,
        top: cell.y,
        width: CELL_WIDTH,
        // Prevent text selection while dragging
        userSelect: isDragging ? 'none' : 'auto',
      }}
      onClick={onFocus}
    >
      {/* ── Drag Handle (header bar) ─────────────────────────────── */}
      <div
        className={`
          flex items-center justify-between px-2 py-1
          rounded-t-lg border-b
          ${isDark
            ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'}
          ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
        `}
        onMouseDown={onDragStart}
      >
        <GripHorizontal size={14} strokeWidth={1.5} />
        <button
          className={`
            p-0.5 rounded transition-colors
            ${isDark
              ? 'hover:bg-red-900/50 hover:text-red-400'
              : 'hover:bg-red-50 hover:text-red-500'}
          `}
          onMouseDown={(e) => e.stopPropagation()}   // no iniciar drag
          onClick={(e) => { e.stopPropagation(); deleteCell(cell.id) }}
          title="Eliminar bloque"
        >
          <X size={12} strokeWidth={2} />
        </button>
      </div>

      {/* ── Block Content ────────────────────────────────────────── */}
      <div className="p-2">
        {cell.type === 'expression' ? (
          <MathBlock
            cell={cell}
            isDark={isDark}
            isFocused={isFocused}
            onChange={(content) => updateCell(cell.id, content)}
            onEval={onEval}
          />
        ) : (
          <TextBlock
            cell={cell}
            isDark={isDark}
            isFocused={isFocused}
            onChange={(content) => updateCell(cell.id, content)}
          />
        )}
      </div>
    </div>
  )
}
