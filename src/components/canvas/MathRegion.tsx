import { useEffect, useRef } from 'react';
import katex from 'katex';
import type { Region, RegionResult } from '../../lib/worksheet';

export const GRID = 16;
export const snap = (v: number) => Math.max(0, Math.round(v / GRID) * GRID);

interface Props {
  region: Region;
  result?: RegionResult;
  /** En edición: muestra el input de texto plano. */
  active: boolean;
  selected: boolean;
  onChange: (src: string) => void;
  /** Sale de edición (Enter, Escape o blur). */
  onCommit: () => void;
  onActivate: () => void;
  onSelect: (additive: boolean) => void;
  onMove: (x: number, y: number) => void;
  /** Registra el input activo para que la paleta inserte símbolos. */
  registerInput: (el: HTMLInputElement | null) => void;
}

/** Render KaTeX imperativo (sin dangerouslySetInnerHTML). */
function Katex({ tex }: { tex: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (ref.current) katex.render(tex, ref.current, { throwOnError: false });
  }, [tex]);
  return <span ref={ref} />;
}

export default function MathRegion({
  region,
  result,
  active,
  selected,
  onChange,
  onCommit,
  onActivate,
  onSelect,
  onMove,
  registerInput,
}: Props) {
  const drag = useRef<{ px: number; py: number; rx: number; ry: number; moved: boolean } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if (active) return; // en edición no se arrastra
    e.stopPropagation();
    drag.current = { px: e.clientX, py: e.clientY, rx: region.x, ry: region.y, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.px;
    const dy = e.clientY - d.py;
    if (!d.moved && Math.hypot(dx, dy) < 4) return;
    d.moved = true;
    onMove(snap(d.rx + dx), snap(d.ry + dy));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved) onSelect(e.ctrlKey || e.shiftKey);
  };

  const isText = region.kind === 'text';
  const hasError = Boolean(result?.error) && !active;

  return (
    <div
      className={`absolute select-none rounded px-1.5 py-0.5 ${
        active
          ? 'z-20 ring-1 ring-accent bg-white shadow-sm'
          : selected
            ? 'z-10 cursor-move ring-1 ring-accent/60 bg-accent/5'
            : `cursor-move hover:ring-1 ${hasError ? 'ring-1 ring-red-300' : 'hover:ring-border'}`
      }`}
      style={{ left: region.x, top: region.y }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onActivate();
      }}
    >
      {active ? (
        <input
          ref={registerInput}
          autoFocus
          className={`min-w-32 bg-transparent text-sm text-ink outline-none ${isText ? '' : 'font-mono'}`}
          style={{ width: `${Math.max(region.src.length + 2, 12)}ch` }}
          value={region.src}
          placeholder={isText ? 'texto…' : 'ej. M := F*L/4 = kN*m'}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onCommit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === 'Escape') {
              e.preventDefault();
              onCommit();
            }
            e.stopPropagation();
          }}
          onPointerDown={(e) => e.stopPropagation()}
        />
      ) : isText ? (
        <span className="whitespace-pre text-sm text-ink">{region.src}</span>
      ) : (
        <div>
          {result?.tex ? (
            <Katex tex={result.tex} />
          ) : (
            <span className="font-mono text-sm text-ink">{region.src}</span>
          )}
          {hasError && <div className="max-w-64 text-xs text-red-600">{result?.error}</div>}
        </div>
      )}
    </div>
  );
}
