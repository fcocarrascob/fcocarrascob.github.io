/**
 * Espectro de diseño NCh2369 — puerto puro a TypeScript.
 *
 * Reimplementa la fórmula (no la lógica de conexión a SAP2000) de
 * `compute_spectrum` / `compute_nch_spectrum` / `compute_vertical_spectrum` en
 * vendor/modelo_base/backend_modelo_base.py, para poder graficar el espectro
 * en el navegador sin abrir SAP2000. El script Python generado sigue siendo
 * la fuente de verdad para lo que realmente se escribe en el modelo SAP2000;
 * esto es solo una vista previa.
 */

export type SeismicZone = 1 | 2 | 3;
export type SoilType = 'A' | 'B' | 'C' | 'D' | 'E';

export interface SoilParameters {
  S: number;
  r: number;
  T0: number;
  p: number;
  q: number;
  T1: number;
}

export const AR_BY_ZONE: Record<SeismicZone, number> = {
  1: 0.28,
  2: 0.42,
  3: 0.56,
};

export const SOIL_PARAMS: Record<SoilType, SoilParameters> = {
  A: { S: 0.9, r: 4.5, T0: 0.15, p: 1.85, q: 3.0, T1: 0.15 },
  B: { S: 1.0, r: 4.5, T0: 0.3, p: 1.6, q: 3.0, T1: 0.27 },
  C: { S: 1.05, r: 4.5, T0: 0.4, p: 1.5, q: 3.0, T1: 0.35 },
  D: { S: 1.0, r: 3.5, T0: 0.6, p: 1.0, q: 2.5, T1: 0.41 },
  E: { S: 1.0, r: 3.0, T0: 1.2, p: 1.0, q: 2.7, T1: 0.79 },
};

export interface Spectrum {
  periods: number[];
  accels: number[];
}

function spectrumShape(
  ar: number,
  sp: SoilParameters,
  T: number,
  scaleFactor: number,
  periodShift: number,
): number {
  if (T === 0) return scaleFactor * ar * sp.S;

  const tShifted = periodShift * T;
  const ratio = sp.T0 > 0 ? tShifted / sp.T0 : 0;
  const num = 1.0 + sp.r * ratio ** sp.p;
  const den = 1.0 + ratio ** sp.q;
  return (scaleFactor * ar * sp.S * num) / den;
}

/** R* — factor de reducción corregido por período corto (interpolación lineal 1.5 -> R). */
function rStar(T: number, R: number, t1: number): number {
  const limit = 0.16 * R * t1;
  if (limit <= 0 || T >= limit) return R;
  return 1.5 + (R - 1.5) * (T / limit);
}

function round4(x: number): number {
  return Math.round(x * 10000) / 10000;
}

/**
 * Genera un espectro de diseño NCh2369 (horizontal o vertical).
 *
 * @param scaleFactor 1.0 horizontal, 0.7 vertical.
 * @param periodShift 1.0 horizontal, 1.7 vertical.
 * @param applyRStar true horizontal (aplica R*), false vertical.
 */
export function computeSpectrum(
  zone: SeismicZone,
  soil: SoilType,
  importance: number,
  R: number,
  damp: number,
  scaleFactor = 1.0,
  periodShift = 1.0,
  applyRStar = true,
): Spectrum {
  const ar = AR_BY_ZONE[zone];
  const sp = SOIL_PARAMS[soil];
  if (ar === undefined || sp === undefined) return { periods: [], accels: [] };

  const periodLimit = 5.0;
  const periodStep = 0.01;
  const nPoints = Math.round(periodLimit / periodStep);

  const periods: number[] = [];
  const accels: number[] = [];
  const dampingScale = (0.05 / damp) ** 0.4;

  for (let i = 0; i <= nPoints; i++) {
    const T = round4(i * periodStep);
    periods.push(T);

    const sa = spectrumShape(ar, sp, T, scaleFactor, periodShift);
    const rEff = applyRStar ? rStar(T, R, sp.T1) : R;
    accels.push((importance * sa * dampingScale) / rEff);
  }

  return { periods, accels };
}

/** Espectro horizontal NCh2369. */
export function computeNchSpectrum(
  zone: SeismicZone,
  soil: SoilType,
  importance: number,
  R: number,
  damp: number,
): Spectrum {
  return computeSpectrum(zone, soil, importance, R, damp, 1.0, 1.0, true);
}

/** Espectro vertical NCh2369 (factor 0.7, período 1.7×T, sin R*). */
export function computeVerticalSpectrum(
  zone: SeismicZone,
  soil: SoilType,
  importance: number,
  rV: number,
  xiV: number,
): Spectrum {
  return computeSpectrum(zone, soil, importance, rV, xiV, 0.7, 1.7, false);
}
