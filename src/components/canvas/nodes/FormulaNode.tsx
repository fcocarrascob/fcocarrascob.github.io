import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { NodeView } from '../types';

const field =
  'w-full rounded border border-border bg-white px-2 py-1 text-sm text-ink ' +
  'focus:border-accent focus:outline-none';

export default function FormulaNode({ data }: NodeProps) {
  const d = data as NodeView;
  return (
    <div className="w-56 rounded-lg border border-border bg-surface shadow-sm">
      <div className="rounded-t-lg bg-ink/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink">
        Fórmula
      </div>
      <div className="flex flex-col gap-2 p-3">
        <input
          className={field}
          placeholder="nombre (ej. Mn)"
          value={d.varName ?? ''}
          onChange={(e) => d.onChange?.({ varName: e.target.value })}
        />
        <input
          className={`${field} font-mono`}
          placeholder="expresión (ej. As*fy)"
          value={d.expr ?? ''}
          onChange={(e) => d.onChange?.({ expr: e.target.value })}
        />
        {d.error ? (
          <p className="text-xs text-red-600">{d.error}</p>
        ) : (
          <p className="font-mono text-xs text-muted">= {d.result ?? '—'}</p>
        )}
      </div>
      <Handle type="target" position={Position.Left} className="!bg-ink" />
      <Handle type="source" position={Position.Right} className="!bg-accent" />
    </div>
  );
}
