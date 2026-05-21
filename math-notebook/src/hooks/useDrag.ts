import { useState, useEffect, useRef, useCallback } from 'react'
import { useNotebookStore, snapToGrid } from '@/store/notebookStore'

interface DragState {
  id: string
  startMouse: { x: number; y: number }
  startBlock: { x: number; y: number }
}

/**
 * Hook that manages free-canvas drag for blocks.
 * Uses native mouse events on window to avoid losing the drag when
 * the cursor moves faster than React's synthetic event handler.
 */
export function useDrag(canvasRef: React.RefObject<HTMLDivElement | null>) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const dragStateRef = useRef<DragState | null>(null)
  const { moveCell } = useNotebookStore()

  const startDrag = useCallback(
    (id: string, blockX: number, blockY: number, e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragStateRef.current = {
        id,
        startMouse: { x: e.clientX, y: e.clientY },
        startBlock: { x: blockX, y: blockY },
      }
      setDraggingId(id)
    },
    []
  )

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const ds = dragStateRef.current
      if (!ds || !canvasRef.current) return

      const dx = e.clientX - ds.startMouse.x
      const dy = e.clientY - ds.startMouse.y

      // Account for canvas scroll offset
      const newX = snapToGrid(Math.max(0, ds.startBlock.x + dx))
      const newY = snapToGrid(Math.max(0, ds.startBlock.y + dy))

      moveCell(ds.id, newX, newY)
    }

    const onUp = () => {
      if (dragStateRef.current) {
        dragStateRef.current = null
        setDraggingId(null)
      }
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [canvasRef, moveCell])

  return {
    startDrag,
    isDragging: (id: string) => draggingId === id,
    anyDragging: draggingId !== null,
  }
}
