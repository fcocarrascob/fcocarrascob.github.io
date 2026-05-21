import { useRef } from 'react'
import { useActiveCells, useNotebookStore, CANVAS_W, CANVAS_H } from '@/store/notebookStore'
import { useDrag } from '@/hooks/useDrag'
import { Block } from '@/components/Block/Block'

interface CanvasProps {
  isDark: boolean
  onEvalCell: (id: string) => void
}

export function Canvas({ isDark, onEvalCell }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const cells = useActiveCells()
  const { focusedCellId, focusCell } = useNotebookStore()
  const { startDrag, isDragging, anyDragging } = useDrag(canvasRef)

  // Click on empty canvas area → deselect
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      focusCell(null)
    }
  }

  return (
    <div
      ref={canvasRef}
      className="relative select-none"
      style={{
        width: `${CANVAS_W}px`,
        height: `${CANVAS_H}px`,
        // Grid background — two overlapping linear-gradients
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        backgroundImage: isDark
          ? `
            linear-gradient(to right,  rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)
          `
          : `
            linear-gradient(to right,  #e2e8f0 1px, transparent 1px),
            linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
          `,
        backgroundSize: '20px 20px',
        cursor: anyDragging ? 'grabbing' : 'default',
      }}
      onClick={handleCanvasClick}
    >
      {cells.map(cell => (
        <Block
          key={cell.id}
          cell={cell}
          isDark={isDark}
          isFocused={focusedCellId === cell.id}
          isDragging={isDragging(cell.id)}
          onFocus={() => focusCell(cell.id)}
          onDragStart={(e) => startDrag(cell.id, cell.x, cell.y, e)}
          onEval={() => onEvalCell(cell.id)}
        />
      ))}
    </div>
  )
}
