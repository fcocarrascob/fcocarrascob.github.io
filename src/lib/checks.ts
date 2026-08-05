// ─────────────────────────────────────────────────────────────────────────────
// La forma común de una verificación normativa: demanda contra capacidad, con
// el detalle que dice de dónde salió cada una.
//
// Vive fuera de placaBaseChecks.ts porque la usan dos motores (placa base y
// verificador de secciones) y va a usarla cualquiera que venga después.
// Puro, sin dependencias.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Qué mide el check.
 *
 * `resistencia` es demanda contra capacidad, y su ratio es un uso comparable
 * con el de cualquier otro estado límite. `esbeltez` es una razón geométrica
 * contra un límite normativo (λ ≤ λ_md): también da un cociente ≤ 1, pero NO
 * es un uso — mezclarlo en el ranking hace que una esbeltez pueda reportarse
 * como «la verificación que gobierna» al lado de usos de flexión.
 */
export type ClaseCheck = 'resistencia' | 'esbeltez';

export interface CheckResult {
  id: string;
  nombre: string;
  demanda: number;
  capacidad: number;
  ratio: number;
  ok: boolean;
  unidad: string;
  detalle: string;
  /**
   * Slug del apunte que respalda el estado límite (`aisc360-22-capE-compresion`).
   * La tabla de resultados lo convierte en link a la sección correspondiente.
   */
  ref?: string;
  /** Default `resistencia`: es lo que era todo antes de que existieran las esbelteces. */
  clase?: ClaseCheck;
}

/**
 * Arma un CheckResult calculando el ratio. Capacidad nula con demanda no nula
 * da Infinity (falla), y con demanda nula da 0 (no aplica).
 */
export function check(
  id: string,
  nombre: string,
  demanda: number,
  capacidad: number,
  unidad: string,
  detalle: string,
  ref?: string,
  clase: ClaseCheck = 'resistencia'
): CheckResult {
  const ratio = capacidad > 0 ? demanda / capacidad : demanda > 0 ? Infinity : 0;
  return { id, nombre, demanda, capacidad, ratio, ok: ratio <= 1, unidad, detalle, ref, clase };
}
