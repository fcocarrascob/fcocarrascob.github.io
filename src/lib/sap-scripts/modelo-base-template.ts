/**
 * Generador del script "Modelo Base SAP2000".
 *
 * Arma un único archivo .py autocontenido combinando las fuentes vendorizadas
 * (config.py + backend_modelo_base.py, ver src/lib/sap-scripts/vendor/) con un
 * bloque final que instancia `BaseModelConfig` con los valores del formulario.
 * No se reimplementa la lógica de SAP2000 en TypeScript: la lógica real vive
 * en el .py vendorizado, así que el script generado se comporta exactamente
 * igual que `gui_modelo_base.py` en Skills_SAP.
 */
import configSource from './vendor/modelo_base/config.py?raw';
import backendSource from './vendor/modelo_base/backend_modelo_base.py?raw';
import { AR_BY_ZONE, SOIL_PARAMS, type SeismicZone, type SoilType } from './nch2369-spectrum';

export interface ModeloBaseFormValues {
  zone: SeismicZone;
  soil: SoilType;
  importance: number;
  rX: number;
  rY: number;
  dampingX: number;
  dampingY: number;
  rV: number;
  xiV: number;
  /** true: adjuntar a una instancia de SAP2000 ya abierta. false: abrir una instancia nueva. */
  attachToExisting: boolean;
}

export const MODELO_BASE_DEFAULTS: ModeloBaseFormValues = {
  zone: 2,
  soil: 'C',
  importance: 1.0,
  rX: 3.0,
  rY: 3.0,
  dampingX: 0.03,
  dampingY: 0.03,
  rV: 2.0,
  xiV: 0.03,
  attachToExisting: true,
};

const VENDOR_HEADER_RE = /^# ═+\n(?:#.*\n)*# ═+\n\n/;

/**
 * Normaliza CRLF -> LF. El submódulo vendorizado (vendor/skills-sap) se
 * clona con los finales de línea que traiga el checkout de git en Windows;
 * sin esto, regexes que asumen `\n` (como el strip del import de abajo) no
 * matchean y el script generado queda con basura sin remover.
 */
function normalizeNewlines(src: string): string {
  return src.replace(/\r\n/g, '\n');
}

/** Elimina el banner "ARCHIVO VENDORIZADO" que antepone scripts/sync-sap-scripts.mjs. */
function stripVendorHeader(src: string): string {
  return normalizeNewlines(src).replace(VENDOR_HEADER_RE, '');
}

/**
 * Prepara backend_modelo_base.py para vivir en el mismo módulo que config.py:
 * quita el `from config import (...)` (ya no hace falta, todo queda al mismo
 * nivel) y el bloque `if __name__ == "__main__":` de prueba, que reemplazamos
 * por el footer generado con los valores del formulario.
 */
function stripBackendBoilerplate(src: string): string {
  let out = stripVendorHeader(src);
  out = out.replace(/from config import \([^)]*\)\n/, '');

  const marker = 'if __name__ == "__main__":';
  const idx = out.indexOf(marker);
  if (idx !== -1) out = out.slice(0, idx).trimEnd() + '\n';
  return out;
}

/** Formatea un número como literal float de Python (siempre con punto decimal). */
function pyFloat(n: number): string {
  return Number.isInteger(n) ? `${n}.0` : `${n}`;
}

export interface ValidationError {
  field: keyof ModeloBaseFormValues;
  message: string;
}

/** Valida rangos físicamente razonables antes de generar el script. */
export function validateModeloBaseFormValues(v: ModeloBaseFormValues): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!(v.zone in AR_BY_ZONE)) errors.push({ field: 'zone', message: 'Zona sísmica debe ser 1, 2 o 3.' });
  if (!(v.soil in SOIL_PARAMS)) errors.push({ field: 'soil', message: 'Tipo de suelo debe ser A-E.' });
  if (!(v.importance > 0)) errors.push({ field: 'importance', message: 'El factor de importancia debe ser > 0.' });

  for (const [field, value] of [
    ['rX', v.rX],
    ['rY', v.rY],
    ['rV', v.rV],
  ] as const) {
    if (!(value > 0)) errors.push({ field, message: 'El factor R debe ser > 0.' });
  }

  for (const [field, value] of [
    ['dampingX', v.dampingX],
    ['dampingY', v.dampingY],
    ['xiV', v.xiV],
  ] as const) {
    if (!(value > 0 && value < 1)) {
      errors.push({ field, message: 'El amortiguamiento debe estar entre 0 y 1 (ej. 0.03 = 3%).' });
    }
  }

  return errors;
}

/** Arma el script .py completo, autocontenido, listo para descargar y ejecutar. */
export function generateModeloBaseScript(values: ModeloBaseFormValues): string {
  const config = stripVendorHeader(configSource).trimEnd();
  const backend = stripBackendBoilerplate(backendSource).trimEnd();
  const generatedAt = new Date().toISOString();
  const ar = AR_BY_ZONE[values.zone];

  const header = `"""
Modelo Base SAP2000 — script generado por struct-pad
=====================================================
Generado: ${generatedAt}
Fuente vendorizada (no editar a mano): github.com/fcocarrascob/Skills_SAP
                                       scripts/modelo_base/{config.py,backend_modelo_base.py}

Parámetros sísmicos configurados (NCh2369):
  Zona sísmica ${values.zone}  (Ao = ${ar} g) — Suelo ${values.soil} — I = ${values.importance}
  Horizontal X:  R = ${values.rX}, xi = ${values.dampingX}
  Horizontal Y:  R = ${values.rY}, xi = ${values.dampingY}
  Vertical:      R = ${values.rV}, xi = ${values.xiV}

Requisitos: Python 3.9+, paquete "comtypes" (pip install comtypes),
SAP2000 ${values.attachToExisting ? 'abierto' : 'instalado'} en este equipo.
"""

`;

  const footer = `

# ══════════════════════════════════════════════════════════════════════
# Ejecución — parámetros definidos en /herramientas/sap-scripts/modelo-base
# ══════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import json

    conn = SapConnection()
    res = conn.connect(attach_to_existing=${values.attachToExisting ? 'True' : 'False'})
    print(f"Conexión: {res}")

    if res.get("connected"):
        backend = BaseModelBackend(conn)
        config = BaseModelConfig(
            zone=${values.zone}, soil="${values.soil}",
            importance=${pyFloat(values.importance)},
            r_x=${pyFloat(values.rX)}, r_y=${pyFloat(values.rY)},
            damping_x=${pyFloat(values.dampingX)}, damping_y=${pyFloat(values.dampingY)},
            r_v=${pyFloat(values.rV)}, xi_v=${pyFloat(values.xiV)},
        )

        try:
            output = backend.run(config)
            print(json.dumps(output, indent=2, ensure_ascii=False))
        except Exception as e:
            print(f"Error: {e}")
        finally:
            conn.disconnect()
    else:
        print("No se pudo conectar a SAP2000. Verificá que esté abierto (o ajustá attach_to_existing).")
`;

  return header + config + '\n\n' + backend + footer;
}
