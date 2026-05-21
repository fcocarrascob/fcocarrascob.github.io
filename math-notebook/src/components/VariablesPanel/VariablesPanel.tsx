import { useState } from 'react'
import { ChevronRight, Database, X } from 'lucide-react'
import { VariableItem } from './VariableItem'
import { useNotebookStore } from '@/store/notebookStore'

interface VariablesPanelProps {
  /** Callback to insert variable name into the focused editor */
  onInsertVariable?: (name: string) => void
}

export function VariablesPanel({ onInsertVariable }: VariablesPanelProps) {
  const { scopeVariables } = useNotebookStore()
  const [collapsed, setCollapsed] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = scopeVariables.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleClick = (name: string) => {
    onInsertVariable?.(name)
  }

  return (
    <aside
      className={`flex flex-col border-l border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-900/30 transition-all duration-200 ${
        collapsed ? 'w-10' : 'w-56'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-2 py-2.5 border-b border-gray-100 dark:border-gray-900">
        <button
          onClick={() => setCollapsed(c => !c)}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors min-w-0"
        >
          <Database size={13} className="shrink-0" />
          {!collapsed && <span className="truncate">Variables</span>}
          <ChevronRight
            size={12}
            className={`shrink-0 transition-transform duration-200 ${collapsed ? '' : 'rotate-90'}`}
          />
        </button>

        {!collapsed && scopeVariables.length > 0 && (
          <span className="ml-auto text-[10px] text-gray-400 dark:text-gray-600 font-mono">
            {scopeVariables.length}
          </span>
        )}
      </div>

      {!collapsed && (
        <>
          {/* Search */}
          {scopeVariables.length > 4 && (
            <div className="px-2 py-1.5 border-b border-gray-100 dark:border-gray-900">
              <div className="relative">
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar…"
                  className="w-full text-xs px-2 py-1 pl-2 pr-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md outline-none focus:border-violet-400 dark:focus:border-violet-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Variable list */}
          <div className="flex-1 overflow-y-auto py-1 px-1">
            {filtered.length === 0 ? (
              <div className="px-2 py-4 text-center">
                <Database size={20} className="mx-auto mb-1.5 text-gray-300 dark:text-gray-700" />
                <p className="text-[11px] text-gray-400 dark:text-gray-600">
                  {scopeVariables.length === 0
                    ? 'Ninguna variable definida'
                    : 'Sin resultados'}
                </p>
              </div>
            ) : (
              filtered.map(v => (
                <VariableItem
                  key={v.name}
                  variable={v}
                  onClick={handleClick}
                />
              ))
            )}
          </div>

          {/* Hint */}
          {scopeVariables.length > 0 && (
            <div className="px-2 py-1.5 border-t border-gray-100 dark:border-gray-900">
              <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center">
                Click para insertar
              </p>
            </div>
          )}
        </>
      )}
    </aside>
  )
}
