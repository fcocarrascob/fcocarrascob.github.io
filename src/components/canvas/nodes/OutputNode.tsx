import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { NodeView } from '../types';

const field =
  'w-full rounded border border-border bg-white px-2 py-1 text-sm text-ink ' +
  'focus:border-accent focus:outline-none';

export default function OutputNode({ data }: NodeProps) {
  const d = data as NodeView;
  const hasError = Boolean(d.error);
  return (
    <div
      className={`w-52 rounded-lg border bg-surface shadow-sm ${
        hasError ? 'border-red-400' : 'border-border'
      }`}
    >
      <div className="rounded-t-lg bg-green-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-700">
        Salida
      </div>
      <div className="flex flex-col gap-2 p-3">
        <input
          className={field}
          placeholder="unidad objetivo (ej. kN*m)"
          value={d.targetUnit ?? ''}
          onChange={(e) => d.onChange?.({ targetUnit: e.target.value })}
        />
        {hasError ? (
          <p className="text-xs text-red-600">{d.error}</p>
        ) : (
          <p className="font-mono text-base font-semibold text-ink">
            {d.result ?? '—'}
          </p>
        )}
      </div>
      <Handle type="target" position={Position.Left} className="!bg-green-600" />
    </div>
  );
}
