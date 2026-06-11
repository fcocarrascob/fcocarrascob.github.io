import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { NodeView } from '../types';

const field =
  'w-full rounded border border-border bg-white px-2 py-1 text-sm text-ink ' +
  'focus:border-accent focus:outline-none';

export default function InputNode({ data }: NodeProps) {
  const d = data as NodeView;
  return (
    <div className="w-52 rounded-lg border border-border bg-surface shadow-sm">
      <div className="rounded-t-lg bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
        Entrada
      </div>
      <div className="flex flex-col gap-2 p-3">
        <input
          className={field}
          placeholder="nombre (ej. fy)"
          value={d.varName ?? ''}
          onChange={(e) => d.onChange?.({ varName: e.target.value })}
        />
        <div className="flex gap-2">
          <input
            className={field}
            placeholder="valor"
            value={d.value ?? ''}
            onChange={(e) => d.onChange?.({ value: e.target.value })}
          />
          <input
            className={field}
            placeholder="unidad"
            value={d.unit ?? ''}
            onChange={(e) => d.onChange?.({ unit: e.target.value })}
          />
        </div>
        {d.error ? (
          <p className="text-xs text-red-600">{d.error}</p>
        ) : (
          <p className="font-mono text-xs text-muted">{d.result ?? '—'}</p>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-accent" />
    </div>
  );
}
