// ─────────────────────────────────────────────────────────────────────────────
// Propiedades de sección derivadas de la geometría.
//
// Las fórmulas del perfil I están copiadas LITERALES de las planillas del canvas
// (public/planillas/viga-ltb.json, viga-columna.json, columna-galpon-compresion.json),
// que ya pasaron auditoría y están contrastadas contra filas de catálogo con
// tolerancia declarada. No se "mejoran" acá: si cambian, cambian allá primero.
//
// Puro, sin dependencias. Unidades: kgf y cm.
// ─────────────────────────────────────────────────────────────────────────────

import type { Geom, Propiedades } from './tipos';

/** Densidad del acero: 7850 kg/m³ → peso lineal [kg/m] = A [cm²] · 0,785. */
const PESO_POR_CM2 = 0.785;

/**
 * Altura libre del alma usada por B4.1.
 *
 * En perfil laminado h es la luz libre MENOS los redondeos de unión ala-alma.
 * Sin el dato del redondeo, `d - 2·t_f` es la cota SUPERIOR de h — conservadora
 * para B4.1 (B4.1 §1b). En perfil armado es exacta.
 */
export function alturaAlma(d: number, tf: number): number {
  return d - 2 * tf;
}

/**
 * Ancho plano de una pared de HSS rectangular.
 *
 * Tabla B4.1a nota (d): sin radio de esquina conocido, `b = B − 3t` con `t` la
 * pared de diseño (B4.2).
 */
export function anchoPlanoHss(lado: number, t: number): number {
  return lado - 3 * t;
}

function propsI(g: Extract<Geom, { familia: 'I' }>): Propiedades {
  const { d, bf, tf, tw } = g;
  const h = alturaAlma(d, tf);

  const Ag = 2 * bf * tf + h * tw;
  const Ix = (bf * d ** 3 - (bf - tw) * h ** 3) / 12;
  const Iy = (2 * tf * bf ** 3 + h * tw ** 3) / 12;
  const Sx = Ix / (d / 2);
  const Sy = Iy / (bf / 2);
  const Zx = bf * tf * (d - tf) + (tw * h ** 2) / 4;
  const Zy = (tf * bf ** 2) / 2 + (h * tw ** 2) / 4;
  // h_o es la distancia entre centroides de alas: sale EXACTA de las planchas.
  const ho = d - tf;
  const J = (2 * bf * tf ** 3 + (d - tf) * tw ** 3) / 3;
  // C_w = I_y·h_o²/4, del User Note de F2 para perfil I doblemente simétrico.
  const Cw = (Iy * ho ** 2) / 4;
  const rts = Math.sqrt((Iy * ho) / (2 * Sx));

  return {
    Ag,
    Ix,
    Iy,
    Sx,
    Sy,
    Zx,
    Zy,
    rx: Math.sqrt(Ix / Ag),
    ry: Math.sqrt(Iy / Ag),
    rts,
    ho,
    J,
    Cw,
    peso: Ag * PESO_POR_CM2,
  };
}

function propsHssR(g: Extract<Geom, { familia: 'HSS-R' }>): Propiedades {
  const { B, H, t } = g;
  const bi = B - 2 * t;
  const hi = H - 2 * t;

  // Paredes rectas, sin radios de esquina: SOBREESTIMA el área real (~4 % en un
  // HSS 4×4×¼). Quien llame emite el warning; acá solo se calcula.
  const Ag = B * H - bi * hi;
  const Ix = (B * H ** 3 - bi * hi ** 3) / 12;
  const Iy = (H * B ** 3 - hi * bi ** 3) / 12;
  const Zx = (B * H ** 2) / 4 - (bi * hi ** 2) / 4;
  const Zy = (H * B ** 2) / 4 - (hi * bi ** 2) / 4;

  // Torsión de Bredt para tubo cerrado de pared delgada, sobre la línea media.
  const Am = (B - t) * (H - t);
  const perim = 2 * (B - t) + 2 * (H - t);
  const J = (4 * Am ** 2 * t) / perim;

  return {
    Ag,
    Ix,
    Iy,
    Sx: Ix / (H / 2),
    Sy: Iy / (B / 2),
    Zx,
    Zy,
    rx: Math.sqrt(Ix / Ag),
    ry: Math.sqrt(Iy / Ag),
    // Sección cerrada: el alabeo es despreciable y el LTB va por F7.4, no por F2.
    rts: 0,
    ho: 0,
    J,
    Cw: 0,
    peso: Ag * PESO_POR_CM2,
  };
}

function propsHssC(g: Extract<Geom, { familia: 'HSS-C' }>): Propiedades {
  const { D, t } = g;
  const di = D - 2 * t;

  const Ag = (Math.PI / 4) * (D ** 2 - di ** 2);
  const I = (Math.PI / 64) * (D ** 4 - di ** 4);
  const S = I / (D / 2);
  const Z = (D ** 3 - di ** 3) / 6;
  const r = Math.sqrt(I / Ag);

  return {
    Ag,
    Ix: I,
    Iy: I,
    Sx: S,
    Sy: S,
    Zx: Z,
    Zy: Z,
    rx: r,
    ry: r,
    rts: 0,
    ho: 0,
    J: 2 * I,
    Cw: 0,
    peso: Ag * PESO_POR_CM2,
  };
}

/** Propiedades derivadas de la geometría, sin ningún dato de catálogo. */
export function derivarPropiedades(g: Geom): Propiedades {
  switch (g.familia) {
    case 'I':
      return propsI(g);
    case 'HSS-R':
      return propsHssR(g);
    case 'HSS-C':
      return propsHssC(g);
  }
}

export interface ContrasteProp {
  clave: keyof Propiedades;
  derivado: number;
  declarado: number;
  /** Diferencia relativa `derivado/declarado - 1`. */
  dif: number;
}

/**
 * Tolerancias del contraste planchas ↔ tabla. Las planchas no llevan los
 * redondeos de unión ala-alma, así que dan menos área, menos módulo y menos J
 * — las mismas tolerancias que declaran las planillas publicadas.
 */
const TOLERANCIA: Partial<Record<keyof Propiedades, number>> = {
  Ag: 0.02,
  Ix: 0.02,
  Iy: 0.02,
  Sx: 0.02,
  Sy: 0.02,
  Zx: 0.02,
  Zy: 0.02,
  rx: 0.01,
  ry: 0.02,
  rts: 0.02,
  J: 0.1,
  Cw: 0.05,
};

export interface PropiedadesResueltas {
  /** Las que usa el motor: las declaradas donde existan, las derivadas donde no. */
  props: Propiedades;
  derivadas: Propiedades;
  contraste: ContrasteProp[];
  /** Claves cuyo contraste excede la tolerancia que los redondeos explican. */
  fueraDeTolerancia: ContrasteProp[];
}

/**
 * Fusiona propiedades declaradas (fila de catálogo, o las que publica un post)
 * sobre las derivadas de las planchas, y reporta el contraste.
 *
 * Es la misma comprobación que hacen a mano las planillas: lo derivable se
 * deriva y se contrasta contra la fila con tolerancia declarada, porque las
 * planchas no llevan los redondeos de unión.
 */
export function resolverPropiedades(
  g: Geom,
  declaradas?: Partial<Propiedades>
): PropiedadesResueltas {
  const derivadas = derivarPropiedades(g);
  const props: Propiedades = { ...derivadas };
  const contraste: ContrasteProp[] = [];

  if (declaradas) {
    for (const [k, v] of Object.entries(declaradas) as Array<[keyof Propiedades, number | undefined]>) {
      if (v === undefined || !Number.isFinite(v)) continue;
      const derivado = derivadas[k];
      props[k] = v;
      if (v !== 0) contraste.push({ clave: k, derivado, declarado: v, dif: derivado / v - 1 });
    }
  }

  // El peso lineal cuelga del área que de verdad se usa: si A_g vino declarado,
  // el peso derivado de las planchas ya no corresponde.
  if (declaradas?.Ag) props.peso = props.Ag * PESO_POR_CM2;

  const fueraDeTolerancia = contraste.filter(
    (c) => Math.abs(c.dif) > (TOLERANCIA[c.clave] ?? 0.02)
  );

  return { props, derivadas, contraste, fueraDeTolerancia };
}

/** Materiales de uso corriente. R_y = 1,30 es el valor nacional de NCh2369 C8.3.3. */
export const MATERIALES = {
  A992: { nombre: 'ASTM A992', Fy: 3520, Fu: 4570, E: 2.04e6, G: 787200, Ry: 1.3, Rt: 1.2 },
  A36: { nombre: 'ASTM A36', Fy: 2530, Fu: 4080, E: 2.04e6, G: 787200, Ry: 1.3, Rt: 1.2 },
  A572_50: { nombre: 'ASTM A572 Gr. 50', Fy: 3520, Fu: 4570, E: 2.04e6, G: 787200, Ry: 1.3, Rt: 1.2 },
  A500_C: { nombre: 'ASTM A500 Gr. C', Fy: 3520, Fu: 4360, E: 2.04e6, G: 787200, Ry: 1.3, Rt: 1.2 },
  A500_B: { nombre: 'ASTM A500 Gr. B', Fy: 2950, Fu: 4080, E: 2.04e6, G: 787200, Ry: 1.4, Rt: 1.3 },
} as const;

export type MaterialKey = keyof typeof MATERIALES;
