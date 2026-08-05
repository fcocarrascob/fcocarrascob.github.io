// ─────────────────────────────────────────────────────────────────────────────
// Tipos del verificador de secciones de acero.
//
// Unidades internas: kgf y cm — las mismas de placaBaseChecks.ts y de las
// planillas del canvas. Los momentos van en kgf·cm; la UI convierte a tonf·m.
// ─────────────────────────────────────────────────────────────────────────────

export type Familia = 'I' | 'HSS-R' | 'HSS-C';

/** Un perfil I laminado tiene redondeos de unión ala-alma; uno armado, no. */
export type TipoI = 'laminado' | 'armado';

/** Perfil I doblemente simétrico, definido por sus cuatro planchas. */
export interface GeomI {
  familia: 'I';
  tipo: TipoI;
  d: number; // altura total [cm]
  bf: number; // ancho del ala [cm]
  tf: number; // espesor del ala [cm]
  tw: number; // espesor del alma [cm]
}

/** HSS rectangular. `t` es la pared de DISEÑO (0,93·nominal en conformados en frío). */
export interface GeomHssR {
  familia: 'HSS-R';
  B: number; // ancho, dirección del eje débil [cm]
  H: number; // altura, dirección del eje fuerte [cm]
  t: number; // pared de diseño [cm]
}

/** HSS circular. */
export interface GeomHssC {
  familia: 'HSS-C';
  D: number; // diámetro exterior [cm]
  t: number; // pared de diseño [cm]
}

export type Geom = GeomI | GeomHssR | GeomHssC;

export interface Material {
  nombre: string;
  Fy: number; // [kgf/cm²]
  Fu: number; // [kgf/cm²]
  E: number; // [kgf/cm²]
  G: number; // [kgf/cm²]
  /** R_y de NCh2369 8.3.3 / AISC 341 Tabla A3.2. Solo lo usa la capa sísmica. */
  Ry: number;
  /** R_t, ídem. */
  Rt: number;
}

/**
 * Propiedades de la sección. Todas en cm y sus potencias, salvo `peso` [kg/m].
 * `rts`, `ho` y `Cw` solo tienen sentido en perfiles abiertos; en HSS valen 0.
 */
export interface Propiedades {
  Ag: number;
  Ix: number;
  Iy: number;
  Sx: number;
  Sy: number;
  Zx: number;
  Zy: number;
  rx: number;
  ry: number;
  rts: number;
  ho: number;
  J: number;
  Cw: number;
  peso: number;
}

/** Longitudes de pandeo y factores que dependen del análisis, no de la sección. */
export interface Estabilidad {
  Lcx: number; // L_c = K·L en el plano del eje fuerte [cm]
  Lcy: number; // ídem eje débil [cm]
  Lcz: number; // longitud no arriostrada a torsión [cm]
  Lb: number; // longitud no arriostrada del ala comprimida [cm]
  /** C_b de la Ec. F1-1. Default 1,0 (conservador) — derivarlo exige el diagrama de momentos. */
  Cb: number;
  /** B₁ del Apéndice 8 (P-δ). Default 1,0 — ídem. */
  B1: number;
}

export interface Demandas {
  Pu: number; // compresión axial [kgf], ≥ 0
  Tu: number; // tracción axial [kgf], ≥ 0
  Mux: number; // momento eje fuerte [kgf·cm]
  Muy: number; // momento eje débil [kgf·cm]
  Vu: number; // corte [kgf]
}

/** Datos de la conexión que D2-2 necesita y esta herramienta no puede derivar. */
export interface DatosTraccion {
  An?: number; // área neta [cm²]
  U?: number; // factor de retraso de cortante (Tabla D3.1)
}

export type EstadoLimite =
  | 'compresion'
  | 'traccion'
  | 'flexion-x'
  | 'flexion-y'
  | 'corte'
  | 'interaccion'
  | 'sismico';

export interface EntradaVerificacion {
  geom: Geom;
  material: Material;
  estabilidad: Estabilidad;
  demandas: Demandas;
  /** Propiedades tabuladas que pisan a las derivadas de las planchas. */
  declaradas?: Partial<Propiedades>;
  traccion?: DatosTraccion;
  /** Qué estados límite correr. Sin esto se corren todos los que apliquen. */
  estados?: EstadoLimite[];
}

/** Clase de un elemento comprimido según B4.1. */
export type Clase = 'compacta' | 'no-compacta' | 'esbelta';

export interface ElementoClasificado {
  id: string;
  nombre: string;
  lambda: number;
  /** Solo en flexión (Tabla B4.1b). En compresión no hay λp. */
  lambdap?: number;
  lambdar: number;
  clase: Clase;
  ref: string; // cita de la tabla y el caso
}

export interface Clasificacion {
  /** Tabla B4.1a: solo λr, la frontera no-esbelto / esbelto. */
  compresion: ElementoClasificado[];
  /** Tabla B4.1b: λp y λr, para el eje fuerte. */
  flexion: ElementoClasificado[];
  hayEsbeltoCompresion: boolean;
  claseAlaFlexion: Clase;
  claseAlmaFlexion: Clase;
}
