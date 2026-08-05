// Punto de entrada del motor de acero para Node (`scripts/verify-acero.mjs`):
// un solo bundle, espejo de src/lib/planilla-engine.ts.

export { verificarSeccion } from './seccion';
export { derivarPropiedades, resolverPropiedades, MATERIALES } from './propiedades';
export { clasificar, esbeltecesElementos } from './clasificacion';
export { verificarCompresion, tensionNominal } from './compresion';
export {
  verificarFlexionX,
  verificarFlexionY,
  longitudLp,
  longitudLr,
  factorAw,
  factorRpc,
  factorRpg,
  radioEfectivoRt,
} from './flexion';
export { verificarCorte } from './corte';
export { verificarTraccion } from './traccion';
export { verificarInteraccion } from './interaccion';
export { verificarSismico } from './sismico';
export { generarMemoria } from './memoria';
