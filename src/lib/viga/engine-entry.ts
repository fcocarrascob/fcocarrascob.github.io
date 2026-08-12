// Barrel para Node: `scripts/verify-viga.mjs` compila ESTE archivo con esbuild
// y lo importa, para correr el mismo motor que usa el sitio.

export { analizarViga, evaluarEn, EntradaInvalidaError } from './viga';
export { MecanismoError } from './solver';
export { rigidezElemento, cargasEquivalentes } from './elemento';
export { generarMemoria } from './memoria';
export { svgEsquema, svgDiagramas } from './dibujo';
export { rigidezEI } from './tipos';
export type {
  Apoyo,
  Carga,
  EntradaViga,
  ResultadoViga,
  Tramo,
} from './tipos';
