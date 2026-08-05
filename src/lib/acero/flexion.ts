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
// F4 (alma no compacta) y F5 (alma esbelta) se leyeron del PDF de la 22, no de
// la ficha del cerebro: el perfil soldado nacional vive ahí y devolver «fuera de
// alcance» dejaba sin verificar a flexión el caso más corriente. Se implementan
// SOLO para el perfil I doblemente simétrico, que es lo que el tipo Geom sabe
// expresar; en él S_xc = S_xt = S_x, así que F_L = 0,7·F_y por la Ec. F4-6a, y
// la fluencia del ala traccionada (F4.4 y F5.4) no aplica.
//
// Su ancla no es una planilla —ninguna toca F4/F5— sino la CONTINUIDAD en las
// fronteras de la Tabla B4.1b, que verify-acero comprueba: en λ = λ_pw el R_pc
// de la Ec. F4-9b vale M_p/M_yc y F4 tiene que reproducir la F2 que viga-ltb ya
// tiene anclada; en λ = λ_rw el R_pg de la F5-6 vale 1 y F5 se junta con F4.
// Es el mismo recurso del contrafactual con que se ancló la Ec. F7-8.
//
// OJO: F4 y F5 definen M_p = F_y·Z_x ≤ 1,6·F_y·S_x, un tope que la F2-1 no
// lleva. Se respeta donde la norma lo escribe.
//
// Puro. Unidades: kgf y cm; los momentos en kgf·cm.
// ─────────────────────────────────────────────────────────────────────────────

import { alturaAlma, anchoPlanoHss } from './propiedades';
import { clasificar, kc } from './clasificacion';
import type { Clase, Clasificacion, Estabilidad, Geom, Material, Propiedades } from './tipos';

/** φ_b de F1(a), LRFD. */
export const PHI_B = 0.9;

export type ModoFlexion = 'fluencia' | 'LTB' | 'FLB' | 'WLB';
export type ZonaLtb = 'plastica' | 'inelastica' | 'elastica';

/** Sección del Cap. F que resolvió el caso. La memoria la usa para no re-derivarla. */
export type SeccionFlexion = 'F2' | 'F4' | 'F5' | 'F6' | 'F7' | 'F8';

export interface ResFlexion {
  eje: 'x' | 'y';
  /** Qué sección del Cap. F gobernó la cadena. */
  seccion: SeccionFlexion;
  /** Momento plástico F2-1 (o su tope 1,6·F_y·S en el eje débil) [kgf·cm]. */
  Mp: number;
  /** L_p de la Ec. F2-5 (o F4-7, o F7-10). undefined donde no aplica LTB. */
  Lp?: number;
  /** L_r de la Ec. F2-6 (o F4-8, F5-5, F7-11). */
  Lr?: number;
  /** Factor de plastificación del alma, Ecs. F4-9a/F4-9b. Solo en F4. */
  Rpc?: number;
  /** Factor de reducción por alma esbelta, Ec. F5-6. Solo en F5 y F7-7. */
  Rpg?: number;
  /** Momento de fluencia del ala comprimida, Ec. F4-4 [kgf·cm]. Solo en F4. */
  Myc?: number;
  /** F_L de la Ec. F4-6a [kgf/cm²]. Solo en F4. */
  FL?: number;
  /** Radio de giro efectivo de la Ec. F4-11 [cm]. Solo en F4/F5. */
  rt?: number;
  /** a_w de la Ec. F4-12. Solo en F4/F5 y F7-7. */
  aw?: number;
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
  /** true si la sección cae en una rama no implementada (hoy solo el cajón esbelto-esbelto). */
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

/**
 * Despacha el eje fuerte del perfil I a la sección del Cap. F que corresponde,
 * según la clase del ALMA (Tabla B4.1b caso 15): compacta → F2, no compacta →
 * F4, esbelta → F5. La clase del ala decide después la rama de pandeo local
 * dentro de cada una.
 */
function flexionIFuerte(
  g: Extract<Geom, { familia: 'I' }>,
  mat: Material,
  props: Propiedades,
  est: Estabilidad,
  clas: Clasificacion
): ResFlexion {
  switch (clas.claseAlmaFlexion) {
    case 'compacta':
      return flexionIF2(g, mat, props, est, clas);
    case 'no-compacta':
      return flexionIF4(g, mat, props, est, clas);
    default:
      return flexionIF5(g, mat, props, est, clas);
  }
}

function flexionIF2(
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
    seccion: 'F2',
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

// ── Perfil I de alma no compacta o esbelta (F4 y F5) ─────────────────────────

/**
 * a_w de la Ec. F4-12: la razón entre el área del alma y la del ala comprimida.
 * La Ec. F5-6 lo usa acotado a 10; la F4-11, sin acotar.
 */
export function factorAw(hc: number, tw: number, bfc: number, tfc: number): number {
  return (hc * tw) / (bfc * tfc);
}

/**
 * r_t de la Ec. F4-11 — radio de giro efectivo para LTB, con el ala comprimida
 * más un sexto del alma. Es lo que reemplaza al r_ts de F2 cuando el alma deja
 * de ser compacta.
 */
export function radioEfectivoRt(bfc: number, aw: number): number {
  return bfc / Math.sqrt(12 * (1 + aw / 6));
}

/**
 * R_pc, el factor de plastificación del alma (Ecs. F4-9a y F4-9b).
 *
 * En doblemente simétrico I_yc/I_y = 0,5 > 0,23, así que nunca aplica la
 * F4-10 (R_pc = 1,0). Con λ ≤ λ_pw vale M_p/M_yc y la F4-1 devuelve M_p exacto:
 * ahí F4 se junta con F2, que es el ancla de continuidad.
 */
export function factorRpc(
  Mp: number,
  Myc: number,
  lambda: number,
  lambdapw: number,
  lambdarw: number
): number {
  const tope = Mp / Myc;
  if (lambda <= lambdapw) return tope; // Ec. F4-9a
  const frac = (lambda - lambdapw) / (lambdarw - lambdapw);
  return Math.min(tope, tope - (tope - 1) * frac); // Ec. F4-9b
}

/**
 * R_pg, el factor de reducción por alma esbelta (Ec. F5-6). Vale 1,0 mientras
 * h_c/t_w ≤ 5,7·√(E/F_y) — es decir, exactamente hasta λ_rw del caso 15, donde
 * F5 se junta con F4.
 */
export function factorRpg(
  aw: number,
  hc: number,
  tw: number,
  E: number,
  Fy: number
): number {
  const awTope = Math.min(aw, 10); // «a_w ... shall not exceed 10»
  const exceso = hc / tw - 5.7 * Math.sqrt(E / Fy);
  return Math.min(1, 1 - (awTope / (1200 + 300 * awTope)) * exceso);
}

/** Los ingredientes que F4 y F5 comparten, para el perfil I doblemente simétrico. */
function ingredientesF4F5(g: Extract<Geom, { familia: 'I' }>, mat: Material, props: Propiedades) {
  const { Fy, E } = mat;
  const { Sx, Zx, J, ho } = props;
  // Doblemente simétrico: el ala comprimida y la traccionada son la misma
  // plancha, así que S_xc = S_xt = S_x y la Ec. F4-6a da F_L = 0,7·F_y.
  const Sxc = Sx;
  // h_c es el doble de la distancia del centroide a la cara interior del ala
  // comprimida. En doblemente simétrico eso es la misma altura de alma que usa
  // B4.1, con la misma cota superior por los redondeos de unión.
  const hc = alturaAlma(g.d, g.tf);
  const aw = factorAw(hc, g.tw, g.bf, g.tf);
  const rt = radioEfectivoRt(g.bf, aw);
  return {
    Fy,
    E,
    Sxc,
    hc,
    aw,
    rt,
    J,
    ho,
    // F4 y F5 acotan M_p a 1,6·F_y·S_x; la F2-1 no lleva ese tope.
    Mp: Math.min(Fy * Zx, 1.6 * Fy * Sx),
    Myc: Fy * Sxc, // Ec. F4-4
    FL: 0.7 * Fy, // Ec. F4-6a
  };
}

/** Sección F4 — alma no compacta, eje fuerte. */
function flexionIF4(
  g: Extract<Geom, { familia: 'I' }>,
  mat: Material,
  props: Propiedades,
  est: Estabilidad,
  clas: Clasificacion
): ResFlexion {
  const { Fy, E, Sxc, hc, aw, rt, J, ho, Mp, Myc, FL } = ingredientesF4F5(g, mat, props);
  const avisos: string[] = [];
  const ala = clas.flexion[0];
  const alma = clas.flexion[1];

  const Rpc = factorRpc(Mp, Myc, alma.lambda, alma.lambdap ?? 0, alma.lambdar);
  const RpcMyc = Rpc * Myc; // Ec. F4-1, la fluencia del ala comprimida

  // ── LTB (F4.2) ──
  const Lp = 1.1 * rt * Math.sqrt(E / Fy); // Ec. F4-7
  // El término J/(S_xc·h_o) que repiten la F4-5 y la F4-8. La F4-5 manda tomar
  // J = 0 cuando I_yc/I_y ≤ 0,23; en doblemente simétrico esa razón vale 0,5, así
  // que la regla no aplica y por eso no está implementada. Si algún día entra la
  // simetría simple, entra con ella.
  const rzc = J / (Sxc * ho);
  const Lr =
    1.95 * rt * (E / FL) * Math.sqrt(rzc + Math.sqrt(rzc ** 2 + 6.76 * (FL / E) ** 2)); // Ec. F4-8

  let Mn_ltb: number;
  let zona: ZonaLtb;
  let Fcr: number | undefined;
  if (est.Lb <= Lp) {
    Mn_ltb = RpcMyc;
    zona = 'plastica';
  } else if (est.Lb <= Lr) {
    // Ec. F4-2
    zona = 'inelastica';
    const frac = (est.Lb - Lp) / (Lr - Lp);
    Mn_ltb = Math.min(RpcMyc, est.Cb * (RpcMyc - (RpcMyc - FL * Sxc) * frac));
  } else {
    // Ecs. F4-3 y F4-5
    zona = 'elastica';
    const q = (est.Lb / rt) ** 2;
    Fcr = ((est.Cb * Math.PI ** 2 * E) / q) * Math.sqrt(1 + 0.078 * rzc * q);
    Mn_ltb = Math.min(Fcr * Sxc, RpcMyc);
  }

  // ── Pandeo local del ala (F4.3) ──
  let Mn_flb = Infinity;
  if (ala.clase === 'no-compacta') {
    // Ec. F4-13
    const frac = (ala.lambda - (ala.lambdap ?? 0)) / (ala.lambdar - (ala.lambdap ?? 0));
    Mn_flb = RpcMyc - (RpcMyc - FL * Sxc) * frac;
  } else if (ala.clase === 'esbelta') {
    // Ec. F4-14
    Mn_flb = (0.9 * E * kc(alma.lambda) * Sxc) / ala.lambda ** 2;
  }

  // F4.4 (fluencia del ala traccionada) no aplica: S_xt = S_xc.
  const Mn = Math.min(Mn_ltb, Mn_flb);
  const gobierna: ModoFlexion =
    Mn_flb < Mn_ltb ? 'FLB' : zona === 'plastica' ? 'fluencia' : 'LTB';

  avisos.push(
    `Alma no compacta (λ = ${alma.lambda.toFixed(1)}, λ_p = ${(alma.lambdap ?? 0).toFixed(1)}): rige la Sección F4, con R_pc = ${Rpc.toFixed(3)} sobre M_yc.`
  );

  return {
    eje: 'x',
    seccion: 'F4',
    Mp,
    Lp,
    Lr,
    Fcr,
    Rpc,
    Myc,
    FL,
    rt,
    aw,
    Mn,
    phiMn: PHI_B * Mn,
    gobierna,
    zona,
    claseFLB: gobierna === 'FLB' ? ala.clase : undefined,
    fueraDeAlcance: false,
    // Ninguna planilla toca F4: el ancla es la continuidad con F2 en λ = λ_pw,
    // que verify-acero comprueba, no un número publicado en un post.
    sinAncla: true,
    avisos: [
      ...avisos,
      'Sección F4: anclada por continuidad con F2 en la frontera λ_pw, no por una planilla publicada.',
    ],
  };
}

/** Sección F5 — alma esbelta, eje fuerte. */
function flexionIF5(
  g: Extract<Geom, { familia: 'I' }>,
  mat: Material,
  props: Propiedades,
  est: Estabilidad,
  clas: Clasificacion
): ResFlexion {
  const { Fy, E, Sxc, hc, aw, rt, Mp } = ingredientesF4F5(g, mat, props);
  const ala = clas.flexion[0];
  const alma = clas.flexion[1];

  const Rpg = factorRpg(aw, hc, g.tw, E, Fy); // Ec. F5-6

  // ── LTB (F5.2) ──
  const Lp = 1.1 * rt * Math.sqrt(E / Fy); // Ec. F4-7, que F5.2 reusa
  const Lr = Math.PI * rt * Math.sqrt(E / (0.7 * Fy)); // Ec. F5-5

  let Mn_ltb: number;
  let zona: ZonaLtb;
  let Fcr: number | undefined;
  if (est.Lb <= Lp) {
    // Ec. F5-1: no aplica LTB, manda la fluencia del ala comprimida.
    //
    // ERRATA de la 22: la F5-1 está impresa como «M_p = R_pg·F_y·S_xc», pero el
    // encabezado de F5 dice que M_n es el menor de los cuatro estados límite y
    // esta es la rama de fluencia del ala. Es un término de M_n con la etiqueta
    // de M_p — verificado en la página rasterizada (16.1-60), no en la capa de
    // texto. Misma clase que la errata de la Ec. (19.2.3.1) del ACI 318-25 SI.
    Mn_ltb = Rpg * Fy * Sxc;
    zona = 'plastica';
  } else if (est.Lb <= Lr) {
    // Ecs. F5-3 y F5-2
    zona = 'inelastica';
    const frac = (est.Lb - Lp) / (Lr - Lp);
    Fcr = Math.min(Fy, est.Cb * (Fy - 0.3 * Fy * frac));
    Mn_ltb = Rpg * Fcr * Sxc;
  } else {
    // Ecs. F5-4 y F5-2
    zona = 'elastica';
    Fcr = Math.min(Fy, (est.Cb * Math.PI ** 2 * E) / (est.Lb / rt) ** 2);
    Mn_ltb = Rpg * Fcr * Sxc;
  }

  // ── Pandeo local del ala (F5.3) ──
  let Mn_flb = Infinity;
  if (ala.clase === 'no-compacta') {
    // Ecs. F5-8 y F5-7
    const frac = (ala.lambda - (ala.lambdap ?? 0)) / (ala.lambdar - (ala.lambdap ?? 0));
    Mn_flb = Rpg * (Fy - 0.3 * Fy * frac) * Sxc;
  } else if (ala.clase === 'esbelta') {
    // Ecs. F5-9 y F5-7
    Mn_flb = Rpg * ((0.9 * E * kc(alma.lambda)) / ala.lambda ** 2) * Sxc;
  }

  // F5.4 (fluencia del ala traccionada) no aplica: S_xt = S_xc.
  const Mn = Math.min(Rpg * Fy * Sxc, Mn_ltb, Mn_flb);
  const gobierna: ModoFlexion =
    Mn_flb < Mn_ltb ? 'FLB' : zona === 'plastica' ? 'fluencia' : 'LTB';

  return {
    eje: 'x',
    seccion: 'F5',
    Mp,
    Lp,
    Lr,
    Fcr,
    Rpg,
    Myc: Fy * Sxc,
    rt,
    aw,
    Mn,
    phiMn: PHI_B * Mn,
    gobierna,
    zona,
    claseFLB: gobierna === 'FLB' ? ala.clase : undefined,
    fueraDeAlcance: false,
    sinAncla: true,
    avisos: [
      `Alma esbelta (λ = ${alma.lambda.toFixed(1)} > λ_r = ${alma.lambdar.toFixed(1)}): rige la Sección F5, con R_pg = ${Rpg.toFixed(4)} (Ec. F5-6).`,
      'Sección F5: anclada por continuidad con F4 en la frontera λ_rw, no por una planilla publicada.',
      'F5 no cubre el campo de tracción del Cap. G: un alma esbelta suele pedir atiesadores, y esa verificación (G2.3 y G3) no está implementada.',
    ],
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
    seccion: 'F6',
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
  let Rpg: number | undefined;
  let aw: number | undefined;
  if (alma.clase === 'no-compacta') {
    // Ec. F7-6
    Mn_wlb = interpolaNoCompacta(alma.lambda, alma.lambdap ?? 0, alma.lambdar);
  } else if (alma.clase === 'esbelta') {
    if (ala.clase === 'esbelta') {
      // User Note de F7.3(c): «Box sections with slender webs and slender
      // flanges are not addressed in this Specification». No hay qué aplicar.
      return {
        eje: 'x',
        seccion: 'F7',
        Mp,
        Mn: 0,
        phiMn: 0,
        gobierna: 'WLB',
        fueraDeAlcance: true,
        sinAncla: true,
        avisos: [
          'Alma Y ala esbeltas: el User Note de F7.3(c) dice que la Especificación no cubre la sección cajón con las dos esbeltas. No hay ecuación que aplicar.',
        ],
      };
    }
    // Ec. F7-7, con el R_pg de la F5-6 y a_w = 2·h·t/(b·t_f) — acá las dos
    // paredes verticales son el «alma» (de ahí el 2) y la horizontal el «ala».
    const hPlano = anchoPlanoHss(g.H, g.t);
    const bPlano = anchoPlanoHss(g.B, g.t);
    aw = (2 * hPlano * g.t) / (bPlano * g.t);
    Rpg = factorRpg(aw, hPlano, g.t, E, Fy);
    Mn_wlb = Rpg * Fy * Sx;
    avisos.push(
      `Alma de HSS esbelta: rige la Ec. F7-7 con R_pg = ${Rpg.toFixed(4)} (Ec. F5-6). El User Note de F7.3 dice que no existen HSS con alma esbelta — si llegaste acá, revisa la geometría o es una sección cajón armada.`
    );
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
  if (zona === 'elastica') {
    avisos.push(
      'LTB elástico de HSS (Ec. F7-9): sin ancla de verificación. Exige L_b > L_r, que en un tubo cerrado son cientos de metros — revisa la geometría antes de usar este número.'
    );
  }
  // La F7-7 tampoco tiene ancla: su R_pg se comprueba por continuidad con la
  // F5-6, no contra una planilla.
  const sinAncla = zona === 'elastica' || Rpg !== undefined;

  return {
    eje: 'x',
    seccion: 'F7',
    Mp,
    Lp,
    Lr,
    Rpg,
    aw,
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
    seccion: 'F8',
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
