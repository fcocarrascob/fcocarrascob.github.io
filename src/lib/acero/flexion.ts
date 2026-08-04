// ─────────────────────────────────────────────────────────────────────────────
// Flexión — AISC 360-22 Cap. F (F2/F3 perfil I eje fuerte, F6 eje débil,
// F7 HSS rectangular, F8 HSS circular).
//
// La cadena F2 está copiada de public/planillas/viga-ltb.json y viga-columna.json,
// cerradas contra sus posts con filas assert a precisión completa (L_p, L_r, el
// término J·c/(S_x·h_o), la Ec. F2-4 con y sin el crédito C_b).
//
// La cadena F7 del EJE FUERTE está anclada en public/planillas/viga-hss-flexion.json,
// que recorre sus cinco ramas con cinco tubos contra la misma demanda: F7-1
// (compacta), F7-2 (ala no compacta), F7-3 y F7-4 (ala esbelta, con el módulo
// efectivo S_e y el centroide corrido), F7-6 (alma no compacta) y F7-8/F7-10/F7-11
// (el LTB de F7.4). Queda sin ancla la F7-9 —el LTB elástico, que pide
// L_b > L_r y en un tubo son cientos de metros— y el eje débil.
//
// OJO CON LA NUMERACIÓN: la edición 22 incorporó las secciones cajón y corrió
// los números de F7 respecto de 360-16. Acá se cita la 22, que es el PDF contra
// el que se verificó: el ancho efectivo del ala de HSS es la F7-4 (la F7-5 es la
// de cajón), el alma no compacta la F7-6, y el LTB va de la F7-8 a la F7-11.
// Las Ecs. F7-2 y F7-6 de la 22 son la interpolación en λ entre λ_p y λ_r; la
// forma con los coeficientes tabulados (3,57·λ√(F_y/E) − 4,0) es la de 360-10.
//
// F3, F6 y F8 NO tienen ancla en las planillas: los casos de referencia que las
// tocarían no existen. Se implementan y el resultado lo declara.
//
// F4 y F5 (alma no compacta o esbelta) quedan FUERA DE ALCANCE: se detectan y
// se reportan como tales en vez de devolver un número de F2 que estaría mal.
//
// Puro. Unidades: kgf y cm; los momentos en kgf·cm.
// ─────────────────────────────────────────────────────────────────────────────

import { anchoPlanoHss } from './propiedades';
import { clasificar, kc } from './clasificacion';
import type { Clase, Clasificacion, Estabilidad, Geom, Material, Propiedades } from './tipos';

/** φ_b de F1(a), LRFD. */
export const PHI_B = 0.9;

export type ModoFlexion = 'fluencia' | 'LTB' | 'FLB' | 'WLB';
export type ZonaLtb = 'plastica' | 'inelastica' | 'elastica';

export interface ResFlexion {
  eje: 'x' | 'y';
  /** Momento plástico F2-1 (o su tope 1,6·F_y·S en el eje débil) [kgf·cm]. */
  Mp: number;
  /** L_p de la Ec. F2-5 (o F7-12). undefined donde no aplica LTB. */
  Lp?: number;
  /** L_r de la Ec. F2-6 (o F7-13). */
  Lr?: number;
  /** Tensión crítica de la Ec. F2-4, con el crédito C_b ya aplicado. */
  Fcr?: number;
  Mn: number;
  phiMn: number;
  gobierna: ModoFlexion;
  zona?: ZonaLtb;
  /**
   * Clase del elemento comprimido que decidió la rama de pandeo local.
   *
   * Lo expone el motor para que la memoria no tenga que re-derivarlo: en el eje
   * débil de un HSS los papeles de las paredes se invierten y la clasificación
   * del eje fuerte NO sirve — un ala compacta a flexión fuerte puede ser
   * esbelta a flexión débil, y escribir la ecuación equivocada da otro número.
   */
  claseFLB?: Clase;
  /** true si la sección cae en F4/F5 u otra rama no implementada. */
  fueraDeAlcance: boolean;
  /** true si la rama que gobernó no tiene ancla en las planillas publicadas. */
  sinAncla: boolean;
  avisos: string[];
}

// ── Perfil I, eje fuerte (F2 + F3) ───────────────────────────────────────────

/** L_p de la Ec. F2-5. */
export function longitudLp(ry: number, E: number, Fy: number): number {
  return 1.76 * ry * Math.sqrt(E / Fy);
}

/**
 * L_r de la Ec. F2-6, entera. `rz` es el término J·c/(S_x·h_o) que la ecuación
 * repite dentro de la F2-4; c = 1 para perfil I doblemente simétrico (F2-8b).
 */
export function longitudLr(
  rts: number,
  E: number,
  Fy: number,
  J: number,
  Sx: number,
  ho: number,
  c = 1
): { Lr: number; rz: number } {
  const rz = (J * c) / (Sx * ho);
  const Lr =
    1.95 * rts * (E / (0.7 * Fy)) * Math.sqrt(rz + Math.sqrt(rz ** 2 + 6.76 * ((0.7 * Fy) / E) ** 2));
  return { Lr, rz };
}

function flexionIFuerte(
  g: Extract<Geom, { familia: 'I' }>,
  mat: Material,
  props: Propiedades,
  est: Estabilidad,
  clas: Clasificacion
): ResFlexion {
  const { Fy, E } = mat;
  const { Zx, Sx, ry, rts, J, ho } = props;
  const avisos: string[] = [];

  const Mp = Fy * Zx;
  const M07 = 0.7 * Fy * Sx;
  const Lp = longitudLp(ry, E, Fy);
  const { Lr, rz } = longitudLr(rts, E, Fy, J, Sx, ho);

  // F2 exige alma compacta. Con alma no compacta o esbelta rige F4/F5, que no
  // está implementado: se dice, no se aproxima.
  if (clas.claseAlmaFlexion !== 'compacta') {
    return {
      eje: 'x',
      Mp,
      Lp,
      Lr,
      Mn: 0,
      phiMn: 0,
      gobierna: 'WLB',
      fueraDeAlcance: true,
      sinAncla: true,
      avisos: [
        `El alma es ${clas.claseAlmaFlexion} (λ = ${clas.flexion[1].lambda.toFixed(1)} > λp = ${clas.flexion[1].lambdap?.toFixed(1)}): rige la Sección F4 o F5, con el factor de plastificación R_pc. No está implementado.`,
      ],
    };
  }

  // ── Pandeo lateral-torsional (F2.2) ──
  let Mn_ltb: number;
  let zona: ZonaLtb;
  let Fcr: number | undefined;

  if (est.Lb <= Lp) {
    Mn_ltb = Mp;
    zona = 'plastica';
  } else if (est.Lb <= Lr) {
    // Ec. F2-2: la recta que baja entre M_p y 0,7·F_y·S_x, con su tope M_p.
    zona = 'inelastica';
    const frac = (est.Lb - Lp) / (Lr - Lp);
    Mn_ltb = Math.min(est.Cb * (Mp - (Mp - M07) * frac), Mp);
  } else {
    // Ecs. F2-3 y F2-4: pandeo elástico. El crédito C_b entra sobre F_cr.
    zona = 'elastica';
    const esb = est.Lb / rts;
    const q = esb ** 2;
    Fcr = ((est.Cb * Math.PI ** 2 * E) / q) * Math.sqrt(1 + 0.078 * rz * q);
    Mn_ltb = Math.min(Fcr * Sx, Mp);
  }

  // ── Pandeo local del ala (F3.2) ──
  let Mn_flb = Infinity;
  const ala = clas.flexion[0];
  if (ala.clase === 'no-compacta') {
    const frac = (ala.lambda - (ala.lambdap ?? 0)) / (ala.lambdar - (ala.lambdap ?? 0));
    Mn_flb = Mp - (Mp - M07) * frac;
    avisos.push('Ala no compacta: rige también el pandeo local del ala (F3.2). Sin ancla de verificación.');
  } else if (ala.clase === 'esbelta') {
    Mn_flb = (0.9 * E * kc(clas.flexion[1].lambda) * Sx) / ala.lambda ** 2;
    avisos.push('Ala esbelta: rige el pandeo local del ala (Ec. F3-2). Sin ancla de verificación.');
  }

  const Mn = Math.min(Mn_ltb, Mn_flb);
  const gobierna: ModoFlexion =
    Mn_flb < Mn_ltb ? 'FLB' : zona === 'plastica' ? 'fluencia' : 'LTB';

  return {
    eje: 'x',
    Mp,
    Lp,
    Lr,
    Fcr,
    Mn,
    phiMn: PHI_B * Mn,
    gobierna,
    zona,
    fueraDeAlcance: false,
    sinAncla: gobierna === 'FLB',
    avisos,
  };
}

// ── Perfil I, eje débil (F6) ─────────────────────────────────────────────────

function flexionIDebil(
  mat: Material,
  props: Propiedades,
  clas: Clasificacion
): ResFlexion {
  const { Fy, E } = mat;
  const { Zy, Sy } = props;
  // Ec. F6-1, con su tope 1,6·F_y·S_y.
  const Mp = Math.min(Fy * Zy, 1.6 * Fy * Sy);
  const ala = clas.flexion[0];

  let Mn = Mp;
  let gobierna: ModoFlexion = 'fluencia';

  if (ala.clase === 'no-compacta') {
    const frac = (ala.lambda - (ala.lambdap ?? 0)) / (ala.lambdar - (ala.lambdap ?? 0));
    Mn = Mp - (Mp - 0.7 * Fy * Sy) * frac; // Ec. F6-2
    gobierna = 'FLB';
  } else if (ala.clase === 'esbelta') {
    const Fcr = (0.69 * E) / ala.lambda ** 2; // Ec. F6-4
    Mn = Fcr * Sy; // Ec. F6-3
    gobierna = 'FLB';
  }

  return {
    eje: 'y',
    Mp,
    Mn,
    phiMn: PHI_B * Mn,
    gobierna,
    claseFLB: gobierna === 'FLB' ? ala.clase : undefined,
    fueraDeAlcance: false,
    sinAncla: true,
    avisos: ['Flexión en el eje débil (F6): sin ancla de verificación en las planillas publicadas.'],
  };
}

// ── HSS rectangular (F7) ─────────────────────────────────────────────────────

/**
 * Módulo elástico efectivo con el ala comprimida reducida (F7.2(c)).
 *
 * Quita la franja inefectiva `(b − b_e)·t` del ala comprimida, corre el
 * centroide y recompone I y S respecto de la fibra comprimida.
 */
function moduloEfectivoHss(
  g: Extract<Geom, { familia: 'HSS-R' }>,
  props: Propiedades,
  be: number,
  b: number
): number {
  const perdida = (b - be) * g.t;
  if (perdida <= 0) return props.Sx;
  const A = props.Ag - perdida;
  if (A <= 0) return props.Sx;
  const c = g.H / 2 - g.t / 2; // brazo del ala respecto del centroide original
  const yNuevo = (-perdida * c) / A; // el centroide baja (se alejó de la fibra comprimida)
  const Iorig = props.Ix - perdida * c ** 2;
  const Ieff = Iorig - A * yNuevo ** 2;
  const yComp = g.H / 2 - yNuevo;
  return Ieff > 0 && yComp > 0 ? Ieff / yComp : props.Sx;
}

function flexionHssR(
  g: Extract<Geom, { familia: 'HSS-R' }>,
  mat: Material,
  props: Propiedades,
  est: Estabilidad,
  clas: Clasificacion
): ResFlexion {
  const { Fy, E } = mat;
  const { Zx, Sx, ry, J, Ag } = props;
  const avisos: string[] = [];

  const Mp = Fy * Zx; // Ec. F7-1
  const ala = clas.flexion[0];
  const alma = clas.flexion[1];

  // La recta entre M_p y F_y·S que comparten la Ec. F7-2 (ala) y la F7-6 (alma):
  // misma forma, distintos límites de la Tabla B4.1b (casos 17 y 19).
  const interpolaNoCompacta = (lambda: number, lambdap: number, lambdar: number) =>
    Math.min(Mp, Mp - (Mp - Fy * Sx) * ((lambda - lambdap) / (lambdar - lambdap)));

  // ── Pandeo local del ala (F7.2) ──
  let Mn_flb = Infinity;
  if (ala.clase === 'no-compacta') {
    // Ec. F7-2
    Mn_flb = interpolaNoCompacta(ala.lambda, ala.lambdap ?? 0, ala.lambdar);
  } else if (ala.clase === 'esbelta') {
    // Ec. F7-4: ancho efectivo del ala comprimida, y Ec. F7-3 con S_e. Es la
    // rama de HSS; la F7-5, la de sección cajón, lleva 0,34 y no se implementa.
    const b = anchoPlanoHss(g.B, g.t);
    const be = Math.min(
      b,
      1.92 * g.t * Math.sqrt(E / Fy) * (1 - (0.38 / ala.lambda) * Math.sqrt(E / Fy))
    );
    Mn_flb = Fy * moduloEfectivoHss(g, props, be, b);
  }

  // ── Pandeo local del alma (F7.3) ──
  let Mn_wlb = Infinity;
  if (alma.clase === 'no-compacta') {
    // Ec. F7-6
    Mn_wlb = interpolaNoCompacta(alma.lambda, alma.lambdap ?? 0, alma.lambdar);
  } else if (alma.clase === 'esbelta') {
    return {
      eje: 'x',
      Mp,
      Mn: 0,
      phiMn: 0,
      gobierna: 'WLB',
      fueraDeAlcance: true,
      sinAncla: true,
      avisos: [
        'Alma de HSS esbelta: la rama de F7.3(c) —Ec. F7-7, con el R_pg de la F5-6— no está implementada. (El User Note de F7.3 dice que no hay HSS con alma esbelta; sí puede darlo una sección cajón.)',
      ],
    };
  }

  // ── Pandeo lateral-torsional (F7.4) ──
  let Mn_ltb = Infinity;
  let Lp: number | undefined;
  let Lr: number | undefined;
  let zona: ZonaLtb | undefined;
  if (est.Lb > 0 && J > 0 && Mp > 0) {
    const raizJA = Math.sqrt(J * Ag);
    Lp = (0.13 * E * ry * raizJA) / Mp; // Ec. F7-10
    Lr = (2 * E * ry * raizJA) / (0.7 * Fy * Sx); // Ec. F7-11
    if (est.Lb <= Lp) {
      // F7.4(a): el estado límite no aplica.
      Mn_ltb = Mp;
      zona = 'plastica';
    } else if (est.Lb <= Lr) {
      // Ec. F7-8
      zona = 'inelastica';
      const frac = (est.Lb - Lp) / (Lr - Lp);
      Mn_ltb = Math.min(Mp, est.Cb * (Mp - (Mp - 0.7 * Fy * Sx) * frac));
    } else {
      // Ec. F7-9
      zona = 'elastica';
      Mn_ltb = Math.min(Mp, (2 * E * est.Cb * raizJA) / (est.Lb / ry));
    }
  }

  const Mn = Math.min(Mp, Mn_flb, Mn_wlb, Mn_ltb);
  let gobierna: ModoFlexion = 'fluencia';
  let claseFLB: Clase | undefined;
  if (Mn === Mn_flb && Mn_flb < Mp) {
    gobierna = 'FLB';
    claseFLB = ala.clase;
  } else if (Mn === Mn_wlb && Mn_wlb < Mp) {
    gobierna = 'WLB';
    claseFLB = alma.clase;
  } else if (Mn === Mn_ltb && Mn_ltb < Mp) {
    gobierna = 'LTB';
  }

  // La única rama de F7 en el eje fuerte que ninguna planilla toca es la F7-9:
  // pide L_b > L_r, y en un tubo cerrado L_r son cientos de metros (253 m en el
  // □250×250×10 de viga-hss-flexion). No hay esa viga, así que no hay ancla.
  const sinAncla = zona === 'elastica';
  if (sinAncla) {
    avisos.push(
      'LTB elástico de HSS (Ec. F7-9): sin ancla de verificación. Exige L_b > L_r, que en un tubo cerrado son cientos de metros — revisa la geometría antes de usar este número.'
    );
  }

  return {
    eje: 'x',
    Mp,
    Lp,
    Lr,
    Mn,
    phiMn: PHI_B * Mn,
    gobierna,
    zona,
    claseFLB,
    fueraDeAlcance: false,
    sinAncla,
    avisos,
  };
}

// ── HSS circular (F8) ────────────────────────────────────────────────────────

function flexionHssC(
  g: Extract<Geom, { familia: 'HSS-C' }>,
  mat: Material,
  props: Propiedades
): ResFlexion {
  const { Fy, E } = mat;
  const dt = g.D / g.t;
  const Mp = Fy * props.Zx; // Ec. F8-1

  let Mn: number;
  let gobierna: ModoFlexion = 'fluencia';
  if (dt <= (0.07 * E) / Fy) {
    Mn = Mp;
  } else if (dt <= (0.31 * E) / Fy) {
    Mn = ((0.021 * E) / dt + Fy) * props.Sx; // Ec. F8-2
    gobierna = 'FLB';
  } else {
    Mn = ((0.33 * E) / dt) * props.Sx; // Ecs. F8-3 y F8-4
    gobierna = 'FLB';
  }

  return {
    eje: 'x',
    Mp,
    Mn: Math.min(Mn, Mp),
    phiMn: PHI_B * Math.min(Mn, Mp),
    gobierna,
    fueraDeAlcance: false,
    sinAncla: true,
    avisos: ['Flexión de HSS circular (F8): sin ancla de verificación en las planillas publicadas.'],
  };
}

// ── Entradas públicas ────────────────────────────────────────────────────────

export function verificarFlexionX(
  g: Geom,
  mat: Material,
  props: Propiedades,
  est: Estabilidad,
  clas?: Clasificacion
): ResFlexion {
  const c = clas ?? clasificar(g, mat);
  switch (g.familia) {
    case 'I':
      return flexionIFuerte(g, mat, props, est, c);
    case 'HSS-R':
      return flexionHssR(g, mat, props, est, c);
    case 'HSS-C':
      return flexionHssC(g, mat, props);
  }
}

export function verificarFlexionY(
  g: Geom,
  mat: Material,
  props: Propiedades,
  clas?: Clasificacion
): ResFlexion {
  const c = clas ?? clasificar(g, mat);
  if (g.familia === 'I') return flexionIDebil(mat, props, c);
  // El HSS rectangular flectando en el eje débil es el mismo problema de F7 con
  // los papeles de las paredes invertidos; el circular es simétrico.
  if (g.familia === 'HSS-C') return { ...flexionHssC(g, mat, props), eje: 'y' };
  const espejo: Extract<Geom, { familia: 'HSS-R' }> = { familia: 'HSS-R', B: g.H, H: g.B, t: g.t };
  const propsEspejo: Propiedades = {
    ...props,
    Ix: props.Iy,
    Iy: props.Ix,
    Sx: props.Sy,
    Sy: props.Sx,
    Zx: props.Zy,
    Zy: props.Zx,
    rx: props.ry,
    ry: props.rx,
  };
  const r = flexionHssR(espejo, mat, propsEspejo, { Lcx: 0, Lcy: 0, Lcz: 0, Lb: 0, Cb: 1, B1: 1 }, clasificar(espejo, mat));
  // El ancla de F7 (viga-hss-flexion) es del eje fuerte: acá los papeles de las
  // paredes se invierten y la clasificación no es la misma, así que se declara.
  return {
    ...r,
    eje: 'y',
    sinAncla: true,
    avisos: [
      ...r.avisos,
      'Flexión de HSS rectangular en el eje débil: es la misma Sección F7 con las paredes intercambiadas, pero sin ancla de verificación en las planillas publicadas.',
    ],
  };
}
