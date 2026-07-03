/**
 * Catálogo de sub-herramientas del Constructor de Scripts SAP2000.
 *
 * Cada entrada corresponde a una carpeta de Skills_SAP/scripts/ que sigue el
 * patrón Config (dataclass) + Backend.run(config) + gui_*.py. Agregar un
 * nuevo sub-tool implica: vendorizar su config/backend en
 * scripts/sync-sap-scripts.mjs, escribir su template en src/lib/sap-scripts/,
 * y sumar la entrada acá.
 */

export interface SapScriptTool {
  slug: string;
  title: string;
  description: string;
  /** Carpeta de origen en Skills_SAP/scripts/. */
  sourceFolder: string;
  status: 'available' | 'planned';
}

export const SAP_SCRIPT_TOOLS: SapScriptTool[] = [
  {
    slug: 'modelo-base',
    title: 'Modelo Base',
    description:
      'Materiales, patrones de carga, secciones de acero/HA, espectros sísmicos NCh2369 y combinaciones LRFD/ASD/NCh en un modelo SAP2000 nuevo.',
    sourceFolder: 'modelo_base',
    status: 'available',
  },
  {
    slug: 'placa-base',
    title: 'Placa Base Paramétrica',
    description:
      'Pernos de anclaje, silla, balasto Winkler y mallado con control de todos los parámetros geométricos.',
    sourceFolder: 'placabase',
    status: 'planned',
  },
  {
    slug: 'fundaciones',
    title: 'Fundaciones',
    description: 'Generador paramétrico de fundaciones aisladas y combinadas.',
    sourceFolder: 'fundaciones',
    status: 'planned',
  },
  {
    slug: 'anillos-mesh',
    title: 'Anillos y Mallado',
    description:
      'Anillos circulares parametrizados y utilidades de mallado (rectangular, cilindro, perforaciones) con control de calidad por zona.',
    sourceFolder: 'ring_areas / mesh',
    status: 'planned',
  },
  {
    slug: 'conexiones-acero',
    title: 'Conexiones de Acero',
    description: 'Placas simples, multi-perno y perfiles de acero para conexiones estructurales.',
    sourceFolder: 'steel_connections',
    status: 'planned',
  },
  {
    slug: 'combinaciones-carga',
    title: 'Combinaciones de Carga',
    description: 'CRUD de combinaciones y estados de carga con templates normativos (LRFD, ASD, NCh).',
    sourceFolder: 'comb_cargas / estados_carga',
    status: 'planned',
  },
];

export function getAvailableSapScriptTools(): SapScriptTool[] {
  return SAP_SCRIPT_TOOLS.filter((t) => t.status === 'available');
}
