import type { ScopeVariable } from '@/types/notebook'

interface VariableItemProps {
  variable: ScopeVariable
  onClick: (name: string) => void
}

const TYPE_COLORS: Record<ScopeVariable['type'], string> = {
  number:   'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  string:   'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  boolean:  'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
  function: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400',
  matrix:   'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400',
  unit:     'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400',
  complex:  'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400',
  unknown:  'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

const TYPE_LABELS: Record<ScopeVariable['type'], string> = {
  number: 'num',
  string: 'str',
  boolean: 'bool',
  function: 'fn',
  matrix: 'mat',
  unit: 'unit',
  complex: 'cplx',
  unknown: '?',
}

export function VariableItem({ variable, onClick }: VariableItemProps) {
  return (
    <button
      onClick={() => onClick(variable.name)}
      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left group"
      title={`Insertar "${variable.name}"`}
    >
      {/* Type badge */}
      <span className={`text-[10px] font-mono px-1 py-0.5 rounded shrink-0 ${TYPE_COLORS[variable.type]}`}>
        {TYPE_LABELS[variable.type]}
      </span>

      {/* Name */}
      <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100 shrink-0">
        {variable.name}
      </span>

      {/* Value */}
      <span className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1 text-right font-mono">
        {variable.displayValue}
      </span>
    </button>
  )
}
