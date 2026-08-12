// ─────────────────────────────────────────────────────────────────────────────
// Tipos del analizador de vigas.
//
// Convención de signos, fijada una vez y respetada en todo el motor:
//
//   v      desplazamiento vertical, POSITIVO HACIA ARRIBA
//   theta  giro, dv/dx, POSITIVO ANTIHORARIO
//   M      momento flector, POSITIVO cuando tracciona la fibra INFERIOR
//   V      corte, POSITIVO cuando el trozo izquierdo empuja hacia arriba
//
// Las CARGAS de entrada, en cambio, son positivas HACIA ABAJO, porque así se
// declaran en la práctica: una carga muerta de 20 kN/m se escribe 20, no −20.
// La conversión ocurre una sola vez, al armar el vector de cargas.
//
// Unidades: longitud m, fuerza kN, momento kN·m. E entra en MPa e I en cm⁴
// porque es como vienen de las tablas de perfiles; `rigidezEI()` las lleva a
// kN·m².
// ─────────────────────────────────────────────────────────────────────────────

export type TipoApoyo = 'libre' | 'apoyo' | 'empotrado' | 'resorte';

export interface Apoyo {
  /** Posición global desde el extremo izquierdo, m. */
  x: number;
  tipo: TipoApoyo;
  /** Rigidez vertical, kN/m. Solo `resorte`; 0 o ausente = libre en v. */
  k?: number;
  /** Rigidez rotacional, kN·m/rad. Solo `resorte`; 0 o ausente = libre en θ. */
  ktheta?: number;
}

export interface Tramo {
  /** Largo, m. */
  L: number;
  /**
   * Rigidez a flexión RELATIVA al resto de la viga. En una viga hiperestática
   * el reparto de momentos depende solo de las razones entre tramos, así que
   * con esto se resuelve sin necesidad de declarar sección: 1,0 en todos los
   * tramos = viga de sección constante.
   */
  rigidezRel: number;
}

export type Carga =
  /** Carga puntual, kN, positiva hacia abajo. */
  | { tipo: 'puntual'; x: number; P: number }
  /** Momento puntual, kN·m, positivo antihorario. */
  | { tipo: 'momento'; x: number; M: number }
  /** Carga distribuida trapecial, kN/m, positiva hacia abajo. */
  | { tipo: 'distribuida'; x0: number; x1: number; w0: number; w1: number };

export interface EntradaViga {
  tramos: Tramo[];
  apoyos: Apoyo[];
  cargas: Carga[];
  /** Módulo de elasticidad, MPa. Opcional: sin él no hay deformada absoluta. */
  E?: number;
  /** Inercia, cm⁴. Opcional, ídem. */
  I?: number;
}

/** Reacción de un apoyo. Ambas en el sentido positivo del motor (arriba, antihorario). */
export interface Reaccion {
  x: number;
  tipo: TipoApoyo;
  /** Fuerza vertical que el apoyo aplica a la viga, kN, positiva hacia arriba. */
  Fv: number;
  /** Momento que el apoyo aplica a la viga, kN·m, positivo antihorario. */
  Mr: number;
}

/**
 * Un elemento ya resuelto, con V(s) y M(s) como POLINOMIOS en s = x − x0.
 *
 * Guardar el polinomio y no una muestra es lo que hace exacta la recuperación:
 * la malla se corta solo en los puntos clave y dentro de cada elemento V y M
 * salen de equilibrio, no de interpolar la solución nodal.
 */
export interface ElementoResuelto {
  /** Posición del nodo izquierdo, m. */
  x0: number;
  /** Largo, m. */
  L: number;
  /** Rigidez a flexión usada, kN·m² (absoluta si se conoce EI, relativa si no). */
  EI: number;
  /** Carga distribuida en los extremos del elemento, kN/m hacia abajo. */
  wA: number;
  wB: number;
  /** v y θ en el nodo izquierdo (m y rad, o divididos por EI si no se conoce). */
  vi: number;
  ti: number;
  /** V(s) = cv[0] + cv[1]·s + cv[2]·s² */
  cv: [number, number, number];
  /** M(s) = cm[0] + cm[1]·s + cm[2]·s² + cm[3]·s³ */
  cm: [number, number, number, number];
}

export interface Punto {
  x: number;
  y: number;
}

/** Un valor extremo con la posición donde ocurre. */
export interface Extremo {
  x: number;
  valor: number;
}

export interface ResultadoViga {
  /** Largo total, m. */
  L: number;
  /** Posición de cada nodo de la malla, m. */
  nodos: number[];
  elementos: ElementoResuelto[];
  reacciones: Reaccion[];
  /**
   * `true` si se declararon E e I y la deformada está en unidades reales.
   * Si es `false`, `deformada` y `flecha` traen δ·EI en kN·m³ y hay que
   * dividirlos por la rigidez para leerlos como desplazamiento.
   */
  EIconocido: boolean;
  /** Rigidez usada, kN·m² (solo si `EIconocido`). */
  EI?: number;
  diagramas: {
    corte: Punto[];
    momento: Punto[];
    /** δ en mm si `EIconocido`; si no, δ·EI en kN·m³. */
    deformada: Punto[];
  };
  /** Momento positivo máximo (tracción abajo). `valor` es 0 si nunca es positivo. */
  momentoMax: Extremo;
  /** Momento negativo mínimo (tracción arriba). `valor` es 0 si nunca es negativo. */
  momentoMin: Extremo;
  /** El corte de mayor valor absoluto, con su signo. */
  corteMax: Extremo;
  /** La flecha de mayor valor absoluto, con su signo (negativa = hacia abajo). */
  flechaMax: Extremo;
  /** Carga total hacia abajo, kN. Sirve al chequeo de equilibrio. */
  cargaTotal: number;
  /** Avisos no fatales (p. ej. deformada no calculable). */
  avisos: string[];
}

/** Valores internos en una posición cualquiera de la viga. */
export interface ValoresEn {
  x: number;
  V: number;
  M: number;
  /** δ en mm si `EIconocido`; si no, δ·EI en kN·m³. */
  delta: number;
}

/**
 * Rigidez a flexión en kN·m² a partir de E en MPa e I en cm⁴.
 *
 * 1 MPa = 10³ kN/m² y 1 cm⁴ = 10⁻⁸ m⁴, así que el factor es 10⁻⁵.
 */
export function rigidezEI(E: number, I: number): number {
  return E * I * 1e-5;
}
