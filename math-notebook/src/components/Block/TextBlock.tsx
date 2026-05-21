import { useRef, useEffect } from 'react'
import type { Cell } from '@/types/notebook'

interface TextBlockProps {
  cell: Cell
  isDark: boolean
  isFocused: boolean
  onChange: (content: string) => void
}

export function TextBlock({ cell, isDark, isFocused, onChange }: TextBlockProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus cuando el bloque recibe el foco
  useEffect(() => {
    if (isFocused && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isFocused])

  // Auto-resize
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  return (
    <textarea
      ref={textareaRef}
      value={cell.content}
      onChange={handleInput}
      placeholder="Texto libre…"
      rows={1}
      className={`
        w-full resize-none border-none outline-none bg-transparent
        text-sm leading-relaxed
        placeholder:italic placeholder:text-slate-400
        ${isDark ? 'text-slate-300' : 'text-slate-700'}
      `}
      style={{ minHeight: '36px', overflow: 'hidden' }}
    />
  )
}
