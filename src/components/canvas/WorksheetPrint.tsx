import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import katex from 'katex';
import type { Region, SheetResults } from '../../lib/worksheet';

/** Render KaTeX imperativo (mismo enfoque que MathRegion). */
function Katex({ tex }: { tex: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (ref.current) katex.render(tex, ref.current, { throwOnError: false });
  }, [tex]);
  return <span ref={ref} />;
}

/**
 * Documento de impresión de la hoja: reordena las regiones en lectura natural
 * (arriba→abajo, izq→der) y las presenta como una planilla lineal, apta para
 * "Imprimir → Guardar como PDF" e incluir en una memoria de cálculo. Oculto en
 * pantalla vía CSS (.worksheet-print), visible solo en @media print.
 *
 * Convenciones de la hoja: la primera región de texto es el título; las de texto
 * con "━" son encabezados de sección; el resto, etiquetas. Las regiones math/programa
 * muestran su LaTeX ya calculado y el veredicto ✓/✗ de las comparaciones.
 */
export default function WorksheetPrint({
  regions,
  results,
}: {
  regions: Region[];
  results: SheetResults;
}) {
  const ordered = [...regions]
    .filter((r) => r.src.trim() !== '')
    .sort((a, b) => a.y - b.y || a.x - b.x);

  const titleRegion = ordered.find((r) => r.kind === 'text');
  const title = titleRegion?.src ?? 'Planilla de cálculo';
  const fecha = new Date().toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="worksheet-print">
      <div className="wp-header">
        <h1>{title}</h1>
        <p className="wp-meta">Memoria de cálculo · struct/pad · {fecha}</p>
      </div>

      {ordered.map((r) => {
        if (r.id === titleRegion?.id) return null; // ya está en el encabezado

        if (r.kind === 'text') {
          if (r.src.includes('━')) {
            return (
              <h2 key={r.id} className="wp-h2">
                {r.src.replace(/━/g, '').trim()}
              </h2>
            );
          }
          return (
            <p key={r.id} className="wp-label">
              {r.src}
            </p>
          );
        }

        const res = results[r.id];
        if (res?.error) {
          return (
            <p key={r.id} className="wp-eq wp-err">
              {r.src} — {res.error}
            </p>
          );
        }
        if (r.kind === 'program' && res?.defined) {
          return (
            <p key={r.id} className="wp-label">
              {res.defined} — función definida
            </p>
          );
        }
        return (
          <div key={r.id} className="wp-eq">
            {res?.tex ? <Katex tex={res.tex} /> : <span className="wp-raw">{r.src}</span>}
            {res?.bool !== undefined && (
              <span className={res.bool ? 'wp-ok' : 'wp-no'}>{res.bool ? '✓' : '✗'}</span>
            )}
          </div>
        );
      })}

      <div className="wp-footer">
        Generado con la herramienta de canvas matemático de struct/pad. Verifique los
        valores de entrada antes de incorporar esta planilla a la memoria de cálculo.
      </div>
    </div>,
    document.body,
  );
}
