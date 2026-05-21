import { useEffect, useRef, useState, useCallback } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import type { Cell } from '@/types/notebook'

// ── Tipo del elemento <math-field> ───────────────────────────────────────────
type MathFieldElement = HTMLElement & {
  value: string
  getValue: (format: string) => string
  executeCommand: (cmd: [string, string]) => void
  focus: () => void
}

// React 19 usa React.JSX — se augmenta el módulo 'react' en vez de global JSX
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<
        React.HTMLAttributes<MathFieldElement> & {
          value?: string
          'virtual-keyboard-mode'?: string
        },
        MathFieldElement
      >
    }
  }
}

interface MathBlockProps {
  cell: Cell
  isDark: boolean
  isFocused: boolean
  onChange: (content: string) => void
  onEval: () => void
}

export function MathBlock({ cell, isDark, isFocused, onChange, onEval }: MathBlockProps) {
  const [editMode, setEditMode] = useState(false)
  const [mathLiveReady, setMathLiveReady] = useState(false)
  const mfRef = useRef<MathFieldElement>(null)

  // ── Cargar MathLive una sola vez ─────────────────────────────────────────
  useEffect(() => {
    import('mathlive').then(() => setMathLiveReady(true))
  }, [])

  // ── Entrar a modo edición al recibir foco ────────────────────────────────
  useEffect(() => {
    if (isFocused && !editMode) {
      setEditMode(true)
    }
  }, [isFocused])

  // ── Enfocar math-field cuando entra en modo edición ──────────────────────
  useEffect(() => {
    if (editMode && mathLiveReady && mfRef.current) {
      // Pequeño delay para que el DOM haya montado el web component
      const t = setTimeout(() => mfRef.current?.focus(), 30)
      return () => clearTimeout(t)
    }
  }, [editMode, mathLiveReady])

  const confirmEdit = useCallback(() => {
    if (mfRef.current) {
      // Guardar el valor LaTeX directamente
      const latex = mfRef.current.value ?? ''
      onChange(latex)
    }
    setEditMode(false)
    onEval()
  }, [onChange, onEval])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { confirmEdit(); return }
    if ((e.key === 'Enter') && !e.shiftKey) { confirmEdit(); return }
  }, [confirmEdit])

  // ── Renderizar contenido en modo display ─────────────────────────────────
  const renderDisplay = () => {
    const expr = cell.content.trim()
    const result = cell.rendered ?? cell.result
    const hasError = !!cell.error

    return (
      <div className="min-h-[36px] flex flex-col gap-1 cursor-text" onClick={() => setEditMode(true)}>
        {/* Expresión tipografiada */}
        <div
          className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'} ${!expr ? 'italic text-slate-400' : ''}`}
          dangerouslySetInnerHTML={{
            __html: expr
              ? katex.renderToString(expr, { throwOnError: false, displayMode: false })
              : '<span style="font-style:italic;color:#94a3b8">Haz click para editar…</span>',
          }}
        />

        {/* Resultado o error */}
        {result && !hasError && (
          <div
            className={`text-xs border-t pt-1 mt-0.5 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}
          >
            <span
              className={cell.rendered ? (isDark ? 'text-violet-400' : 'text-violet-600') : (isDark ? 'text-emerald-400' : 'text-emerald-600')}
              dangerouslySetInnerHTML={{
                __html: result.startsWith('\\') || result.includes('{')
                  ? katex.renderToString(result, { throwOnError: false })
                  : katex.renderToString(result, { throwOnError: false }),
              }}
            />
          </div>
        )}
        {hasError && (
          <div className={`text-xs border-t pt-1 mt-0.5 font-mono ${isDark ? 'border-slate-700 text-red-400' : 'border-slate-100 text-red-500'}`}>
            ⚠ {cell.error}
          </div>
        )}
      </div>
    )
  }

  // ── Modo edición: <math-field> ───────────────────────────────────────────
  const renderEdit = () => {
    if (!mathLiveReady) {
      return (
        <div className={`text-xs text-slate-400 py-2`}>Cargando editor…</div>
      )
    }

    return (
      <math-field
        ref={mfRef}
        value={cell.content}
        virtual-keyboard-mode="manual"
        onBlur={confirmEdit}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          minHeight: '40px',
          fontSize: '1rem',
          fontFamily: 'inherit',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          '--caret-color': isDark ? '#a78bfa' : '#7c3aed',
          color: isDark ? '#e2e8f0' : '#1e293b',
        } as React.CSSProperties}
      />
    )
  }

  return (
    <div className="min-h-[40px]">
      {editMode ? renderEdit() : renderDisplay()}
    </div>
  )
}
