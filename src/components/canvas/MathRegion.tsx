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
  /** Registra el input/textarea activo para que la paleta inserte símbolos. */
  registerInput: (el: HTMLInputElement | HTMLTextAreaElement | null) => void;
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
  const isProgram = region.kind === 'program';
  const hasError = Boolean(result?.error) && !active;

  const lines = region.src.split('\n');
  const progRows = Math.max(lines.length, 2);
  const progCols = Math.max(...lines.map((l) => l.length), 24);

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
      {active && isProgram ? (
        <textarea
          ref={registerInput}
          autoFocus
          className="resize-none bg-transparent font-mono text-sm leading-snug text-ink outline-none"
          style={{ width: `${progCols + 2}ch` }}
          rows={progRows}
          value={region.src}
          placeholder={'S :=\n    s := 0\n    for i in 1:10\n        s := s + i\n    return s'}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onCommit}
          onKeyDown={(e) => {
            // Enter inserta línea; se confirma con Escape o Ctrl/⌘+Enter.
            if (e.key === 'Escape' || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) {
              e.preventDefault();
              onCommit();
            } else if (e.key === 'Tab') {
              e.preventDefault();
              const ta = e.currentTarget;
              const s = ta.selectionStart;
              const next = ta.value.slice(0, s) + '    ' + ta.value.slice(ta.selectionEnd);
              onChange(next);
              requestAnimationFrame(() => ta.setSelectionRange(s + 4, s + 4));
            }
            e.stopPropagation();
          }}
          onPointerDown={(e) => e.stopPropagation()}
        />
      ) : active ? (
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
      ) : isProgram ? (
        <div>
          <div className="flex items-center gap-2">
            <pre className="whitespace-pre border-l-2 border-accent pl-2 font-mono text-sm leading-snug text-ink">
              {region.src}
            </pre>
            {result?.tex && (
              <span className="flex items-center gap-1">
                <span className="text-muted">→</span>
                <Katex tex={result.tex} />
              </span>
            )}
            {result?.defined && (
              <span className="text-xs italic text-muted">{result.defined} definida</span>
            )}
          </div>
          {hasError && <div className="max-w-64 text-xs text-red-600">{result?.error}</div>}
        </div>
      ) : (
        <div>
          {result?.bool !== undefined ? (
            <div className="flex items-center gap-2">
              {result.tex && <Katex tex={result.tex} />}
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-sm font-bold ${
                  result.bool ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {result.bool ? '✓' : '✗'}
              </span>
            </div>
          ) : result?.tex ? (
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
