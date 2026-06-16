import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MathRegion, { GRID, snap } from './MathRegion';
import SymbolPalette, { type SymbolEntry } from './SymbolPalette';
import { evaluateSheet, type Region, type RegionKind } from '../../lib/worksheet';

const STORAGE_KEY = 'structpad.worksheet.v1';

/** Hoja de ejemplo para la primera visita (se reemplaza al editar). */
const DEMO: Region[] = [
  { id: 'demo-t', kind: 'text', x: 32, y: 32, src: 'Ejemplo: momento máximo de una viga biapoyada' },
  { id: 'demo-1', kind: 'math', x: 32, y: 80, src: 'F := 30 kN' },
  { id: 'demo-2', kind: 'math', x: 32, y: 128, src: 'L := 6 m' },
  { id: 'demo-3', kind: 'math', x: 32, y: 176, src: 'M := F*L/4 = kN*m' },
  { id: 'demo-4', kind: 'math', x: 32, y: 224, src: 'M <= 60 kN*m =' },
];

function loadInitial(): Region[] {
  if (typeof window === 'undefined') return DEMO;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data?.regions)) {
        return (data.regions as Region[]).filter((r) => r.src.trim() !== '');
      }
    }
  } catch {
    // JSON corrupto: arrancar con la demo
  }
  return DEMO;
}

const newId = () => `r${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const toolBtn =
  'rounded border border-border bg-white px-2.5 py-1 text-xs font-medium text-ink hover:border-accent hover:text-accent';

export default function MathCanvas() {
  const [regions, setRegions] = useState<Region[]>(loadInitial);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  /** Tipo de la próxima región a crear con clic ('text' tras pulsar el botón Texto). */
  const [nextKind, setNextKind] = useState<RegionKind>('math');

  const sheetRef = useRef<HTMLDivElement>(null);
  const activeInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => evaluateSheet(regions), [regions]);

  // Autoguardado con debounce.
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        // Las regiones vacías son transitorias (se borran al salir de edición):
        // no se persisten por si la página se cierra con una a medio crear.
        const persistable = regions.filter((r) => r.src.trim() !== '');
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, regions: persistable }));
      } catch {
        // cuota llena o storage deshabilitado: ignorar
      }
    }, 300);
    return () => clearTimeout(t);
  }, [regions]);

  const updateRegion = useCallback((id: string, patch: Partial<Region>) => {
    setRegions((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const commitActive = useCallback(() => {
    if (activeId) {
      // Una región que queda vacía al salir de edición se elimina.
      setRegions((prev) => prev.filter((r) => r.id !== activeId || r.src.trim() !== ''));
    }
    setActiveId(null);
  }, [activeId]);

  const onSheetClick = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    setSelected(new Set());
    const rect = e.currentTarget.getBoundingClientRect();
    const kind: RegionKind = e.shiftKey ? 'text' : nextKind;
    const region: Region = {
      id: newId(),
      kind,
      x: snap(e.clientX - rect.left),
      y: snap(e.clientY - rect.top - GRID / 2),
      src: '',
    };
    setNextKind('math');
    setRegions((prev) => [...prev, region]);
    setActiveId(region.id);
  };

  // Supr/Retroceso elimina la selección (fuera de edición).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      const el = document.activeElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return;
      if (selected.size === 0) return;
      e.preventDefault();
      setRegions((prev) => prev.filter((r) => !selected.has(r.id)));
      setSelected(new Set());
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  const insertSymbol = useCallback(
    (entry: SymbolEntry) => {
      const el = activeInputRef.current;
      if (!el || !activeId) return;
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? start;

      // Los snippets multilínea (bloques de programa) se re-indentan según la
      // sangría de la línea actual, para que queden bien anidados al insertarlos
      // dentro de otro bloque.
      let text = entry.insert;
      if (text.includes('\n')) {
        const lineStart = el.value.lastIndexOf('\n', start - 1) + 1;
        const indent = el.value.slice(lineStart, start).match(/^\s*/)?.[0] ?? '';
        if (indent) text = text.replace(/\n/g, `\n${indent}`);
      }

      const next = el.value.slice(0, start) + text + el.value.slice(end);
      updateRegion(activeId, { src: next });

      // Selección tras insertar: si el snippet tiene placeholder, seleccionarlo
      // (para teclear encima); si no, posicionar el cursor según `caret`.
      let selStart = start + (entry.caret ?? text.length);
      let selEnd = selStart;
      if (entry.select) {
        const idx = text.indexOf(entry.select);
        if (idx >= 0) {
          selStart = start + idx;
          selEnd = selStart + entry.select.length;
        }
      }
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(selStart, selEnd);
      });
    },
    [activeId, updateRegion],
  );

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ version: 1, regions }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hoja-calculo.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (file: File) => {
    file.text().then((text) => {
      try {
        const data = JSON.parse(text);
        if (!Array.isArray(data?.regions)) throw new Error('formato inválido');
        setRegions(data.regions as Region[]);
        setSelected(new Set());
        setActiveId(null);
      } catch {
        alert('El archivo no es una hoja de cálculo válida.');
      }
    });
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center gap-2 border-b border-border bg-surface/80 px-3 py-2">
        <button
          className={`${toolBtn} ${nextKind === 'text' ? '!border-accent !text-accent' : ''}`}
          onClick={() => setNextKind((k) => (k === 'text' ? 'math' : 'text'))}
          title="Pulsa y luego haz clic en la hoja para colocar texto (o Shift+clic directo)"
        >
          T Texto
        </button>
        <button
          className={`${toolBtn} ${nextKind === 'program' ? '!border-accent !text-accent' : ''}`}
          onClick={() => setNextKind((k) => (k === 'program' ? 'math' : 'program'))}
          title="Pulsa y luego haz clic en la hoja para colocar un bloque de programa"
        >
          ƒ Programa
        </button>
        <span className="mx-1 h-4 w-px bg-border" />
        <button className={toolBtn} onClick={exportJson}>
          Exportar
        </button>
        <button className={toolBtn} onClick={() => fileRef.current?.click()}>
          Importar
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importJson(f);
            e.target.value = '';
          }}
        />
        <button
          className={`${toolBtn} hover:!border-red-400 hover:!text-red-600`}
          onClick={() => {
            if (confirm('¿Vaciar toda la hoja?')) {
              setRegions([]);
              setSelected(new Set());
              setActiveId(null);
            }
          }}
        >
          Limpiar
        </button>
        <span className="ml-auto hidden text-xs text-muted sm:block">
          Clic: nueva región · doble clic: editar · Supr: borrar
        </span>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="relative flex-1 overflow-auto bg-white">
          <div
            ref={sheetRef}
            className="relative cursor-crosshair"
            style={{
              minWidth: '100%',
              minHeight: '100%',
              width: 1600,
              height: 1400,
              backgroundImage:
                'linear-gradient(to right, rgba(100,116,139,0.12) 1px, transparent 1px), ' +
                'linear-gradient(to bottom, rgba(100,116,139,0.12) 1px, transparent 1px)',
              backgroundSize: `${GRID}px ${GRID}px`,
            }}
            onClick={onSheetClick}
          >
            {regions.map((r) => (
              <MathRegion
                key={r.id}
                region={r}
                result={results[r.id]}
                active={activeId === r.id}
                selected={selected.has(r.id)}
                onChange={(src) => updateRegion(r.id, { src })}
                onCommit={commitActive}
                onActivate={() => {
                  setSelected(new Set());
                  setActiveId(r.id);
                }}
                onSelect={(additive) =>
                  setSelected((prev) => {
                    const next = new Set(additive ? prev : []);
                    if (additive && prev.has(r.id)) next.delete(r.id);
                    else next.add(r.id);
                    return next;
                  })
                }
                onMove={(x, y) => updateRegion(r.id, { x, y })}
                registerInput={(el) => {
                  // Solo registrar montajes; insertSymbol ya valida que haya
                  // región activa, así que una referencia obsoleta es inocua.
                  if (el) activeInputRef.current = el;
                }}
              />
            ))}
          </div>
        </div>
        <SymbolPalette
          onInsert={insertSymbol}
          activeKind={activeId ? (regions.find((r) => r.id === activeId)?.kind ?? null) : null}
        />
      </div>
    </div>
  );
}
