// ─────────────────────────────────────────────────────────────────────────────
// La forma común de una verificación normativa: demanda contra capacidad, con
// el detalle que dice de dónde salió cada una.
//
// Vive fuera de placaBaseChecks.ts porque la usan dos motores (placa base y
// verificador de secciones) y va a usarla cualquiera que venga después.
// Puro, sin dependencias.
// ─────────────────────────────────────────────────────────────────────────────

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
  ref?: string
): CheckResult {
  const ratio = capacidad > 0 ? demanda / capacidad : demanda > 0 ? Infinity : 0;
  return { id, nombre, demanda, capacidad, ratio, ok: ratio <= 1, unidad, detalle, ref };
}
