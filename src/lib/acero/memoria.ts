// ─────────────────────────────────────────────────────────────────────────────
// Memoria de cálculo: convierte una verificación en regiones del canvas
// matemático, escritas con el MISMO idioma que las planillas publicadas
// (banners `━━ … ━━`, `F_y := 3520 kgf/cm^2`, `Rd_x := phi*F_nx*A_g = tonf`,
// filas booleanas `u_max <= 1 =`).
//
// La memoria no repite los resultados del motor TS: los RECALCULA con mathjs a
// partir de los datos de entrada. Esa es la gracia — si los dos motores no
// coinciden, la hoja lo muestra. Las últimas filas son el contraste explícito
// contra lo que reportó el motor, verificable con `npm run verify:planilla`.
//
// Unidades del motor: kgf y cm. La hoja escribe kgf/cm² y convierte a tonf.
// ─────────────────────────────────────────────────────────────────────────────

import { layout, m, t, type Item } from '../worksheet-layout';
import type { Region } from '../worksheet';
import type { ResultadoSeccion } from './seccion';
import type { EntradaVerificacion } from './tipos';

const STORAGE_KEY = 'structpad.worksheet.v1';
const TONF = 1000;
const TONF_M = 100000;

/** Redondeo a cifras significativas, para que la hoja no arrastre ruido. */
function sig(v: number, n = 6): string {
  if (!Number.isFinite(v)) return '0';
  if (v === 0) return '0';
  return Number(v.toPrecision(n)).toString();
}

function banner(texto: string): Item {
  return t(`━━ ${texto} ━━`);
}

/** Funciones y constantes que el motor del canvas ya trae en su scope. */
const INTRINSECOS = new Set([
  'pi', 'e', 'sqrt', 'abs', 'min', 'max', 'sin', 'cos', 'tan', 'log', 'exp',
  'kgf', 'cm', 'tonf', 'tf', 'm', 'mm', 'kg', 'N', 'kN', 'MPa', 'Pa',
]);

/**
 * Símbolos que una región DEFINE (`nombre := …`) y los que USA.
 *
 * Es un análisis léxico deliberadamente simple: alcanza porque la memoria la
 * genera este archivo, no un humano, y la gramática de sus filas es la de
 * `parseMathRegion`.
 */
function simbolos(src: string): { define: string | null; usa: string[] } {
  const def = src.match(/^\s*([A-Za-z_]\w*)\s*:=/);
  const cuerpo = def ? src.slice(src.indexOf(':=') + 2) : src;
  const usa = (cuerpo.match(/[A-Za-z_]\w*/g) ?? []).filter((s) => !INTRINSECOS.has(s));
  return { define: def ? def[1] : null, usa };
}

/**
 * Verifica que ninguna región referencie un símbolo que no se definió antes.
 *
 * Existe por un error real: la sección de interacción emitía
 * `u_tot := u_c + (8/9)*u_f` mientras el bloque que define `u_f` quedaba detrás
 * de un filtro de familia, así que la memoria de un HSS en flexocompresión
 * llegaba rota al canvas. Un bloque que se olvide vuelve a romper la hoja; esto
 * lo convierte en un fallo ruidoso al generar, no en tres regiones en rojo que
 * el usuario descubre después.
 */
function verificarSimbolos(items: Item[]): void {
  const definidos = new Set<string>();
  const faltantes: string[] = [];
  for (const it of items) {
    if (it.kind === 'text') continue;
    const { define, usa } = simbolos(it.src);
    for (const s of usa) {
      if (!definidos.has(s)) faltantes.push(`«${s}» en la fila \`${it.src}\``);
    }
    if (define) definidos.add(define);
  }
  if (faltantes.length > 0) {
    throw new Error(
      `La memoria referencia símbolos que no define: ${faltantes.join('; ')}. ` +
        'Falta emitir el bloque que los define.'
    );
  }
}

export interface Memoria {
  version: 1;
  meta: { titulo: string; esperadoFalso?: Record<string, string> };
  regions: Region[];
}

const PREFIJO = 'vs';

export function generarMemoria(entrada: EntradaVerificacion, r: ResultadoSeccion): Memoria {
  const { geom, material, estabilidad, demandas } = entrada;
  const p = r.propiedades;
  const items: Item[] = [];

  // `layout` numera las regiones por posición, así que el id de una fila es su
  // índice al momento de empujarla. Se registra para poder declarar en
  // meta.esperadoFalso las comparaciones que dan falso a propósito — sin eso,
  // `npm run verify:planilla` marca la memoria de una sección que no pasa.
  /** Numera los bloques de verificación en el orden en que salgan. */
  let n = 0;
  const esperadoFalso: Record<string, string> = {};
  const push = (it: Item): string => {
    items.push(it);
    return `${PREFIJO}-${items.length - 1}`;
  };
  const pushFalso = (it: Item, razon: string): void => {
    esperadoFalso[push(it)] = razon;
  };
  /** Empuja `u_x <= 1 =` declarándolo esperado-falso si el uso supera 1. */
  const pushUso = (src: string, uso: number, que: string): void => {
    if (uso <= 1) push(m(src));
    else pushFalso(m(src), `La sección NO pasa en ${que}: uso = ${sig(uso, 4)}.`);
  };
  /**
   * Empuja la comparación de un λ contra su límite en la dirección que es
   * cierta, para que la hoja diga lo que pasa en vez de afirmar lo que no.
   */
  const pushLambda = (lam: string, lim: string, cumple: boolean, siNo: string): void => {
    if (cumple) push(m(`${lam} < ${lim} =`));
    else {
      push(t(siNo));
      push(m(`${lam} > ${lim} =`));
    }
  };

  const nombreFamilia =
    geom.familia === 'I'
      ? `Perfil I ${geom.tipo} ${sig(geom.d, 4)}×${sig(geom.bf, 4)}`
      : geom.familia === 'HSS-R'
        ? `HSS □ ${sig(geom.B, 4)}×${sig(geom.H, 4)}×${sig(geom.t, 3)}`
        : `HSS ⌀ ${sig(geom.D, 4)}×${sig(geom.t, 3)}`;
  const titulo = `Verificación de sección — ${nombreFamilia} · ${material.nombre}`;

  items.push(t(titulo.toUpperCase()));
  items.push(t('AISC 360-22 Caps. B, E, F, G, H · LRFD — generada por /herramientas/verificador-secciones'));
  items.push(t('Rd_ = capacidad de diseño (incluye phi) · las comparaciones dan ✓/✗'));

  // ── Datos ──
  items.push(banner('DATOS · ACERO Y FACTORES'));
  items.push(m(`F_y := ${sig(material.Fy)} kgf/cm^2`));
  items.push(m(`F_u := ${sig(material.Fu)} kgf/cm^2`));
  items.push(m(`E := ${sig(material.E)} kgf/cm^2`));
  items.push(m(`G := ${sig(material.G)} kgf/cm^2`));
  items.push(t('E1 y F1(a): phi = 0,90 para compresión y para flexión (LRFD)'));
  items.push(m('phi := 0.90'));

  items.push(banner('DATOS · GEOMETRÍA DE LA SECCIÓN'));
  if (geom.familia === 'I') {
    items.push(t('Las cuatro planchas. Todo lo derivable sale de ellas:'));
    items.push(m(`d := ${sig(geom.d)} cm`));
    items.push(m(`b_f := ${sig(geom.bf)} cm`));
    items.push(m(`t_f := ${sig(geom.tf)} cm`));
    items.push(m(`t_w := ${sig(geom.tw)} cm`));
    items.push(
      t('B4.1 §1b: sin el dato del redondeo, d - 2·t_f es la cota SUPERIOR de h — conservadora.')
    );
    items.push(m('h_pl := d - 2*t_f = cm'));
    items.push(m('A_pl := 2*b_f*t_f + h_pl*t_w = cm^2'));
    items.push(m('I_xpl := (b_f*d^3 - (b_f - t_w)*h_pl^3)/12 = cm^4'));
    items.push(m('I_ypl := (2*t_f*b_f^3 + h_pl*t_w^3)/12 = cm^4'));
    items.push(m('S_xpl := I_xpl/(d/2) = cm^3'));
    items.push(m('Z_xpl := b_f*t_f*(d - t_f) + t_w*h_pl^2/4 = cm^3'));
    items.push(m('h_opl := d - t_f = cm'));
    items.push(m('J_pl := (2*b_f*t_f^3 + (d - t_f)*t_w^3)/3 = cm^4'));
    items.push(m('r_xpl := sqrt(I_xpl/A_pl) = cm'));
    items.push(m('r_ypl := sqrt(I_ypl/A_pl) = cm'));
    items.push(m('bt_ala := b_f/(2*t_f) ='));
    items.push(m('ht_alma := h_pl/t_w ='));
  } else if (geom.familia === 'HSS-R') {
    items.push(m(`B := ${sig(geom.B)} cm`));
    items.push(m(`H := ${sig(geom.H)} cm`));
    items.push(t('t es la pared de DISEÑO, no la nominal (B4.2)'));
    items.push(m(`t_d := ${sig(geom.t)} cm`));
    items.push(t('Tabla B4.1a nota (d): sin radio de esquina conocido, b = B − 3t'));
    items.push(m('b_w := B - 3*t_d = cm'));
    items.push(m('h_w := H - 3*t_d = cm'));
    items.push(m('lam_w := b_w/t_d ='));
    items.push(m('lam_h := h_w/t_d ='));
    items.push(t('Paredes rectas, sin radios: SOBREESTIMA el área real del tubo.'));
    items.push(m('A_pl := B*H - (B - 2*t_d)*(H - 2*t_d) = cm^2'));
  } else {
    items.push(m(`D := ${sig(geom.D)} cm`));
    items.push(m(`t_d := ${sig(geom.t)} cm`));
    items.push(m('lam_dt := D/t_d ='));
    items.push(m('A_pl := pi/4*(D^2 - (D - 2*t_d)^2) = cm^2'));
  }

  items.push(banner('DATOS · PROPIEDADES USADAS — frontera declarada'));
  items.push(
    t('Las que el motor usó. Donde hay fila de catálogo, es dato declarado; el resto se derivó.')
  );
  items.push(m(`A_g := ${sig(p.Ag)} cm^2`));
  items.push(m(`I_x := ${sig(p.Ix)} cm^4`));
  items.push(m(`I_y := ${sig(p.Iy)} cm^4`));
  items.push(m(`S_x := ${sig(p.Sx)} cm^3`));
  items.push(m(`Z_x := ${sig(p.Zx)} cm^3`));
  items.push(m(`S_y := ${sig(p.Sy)} cm^3`));
  items.push(m(`Z_y := ${sig(p.Zy)} cm^3`));
  items.push(m(`r_x := ${sig(p.rx)} cm`));
  items.push(m(`r_y := ${sig(p.ry)} cm`));
  if (p.rts > 0) items.push(m(`r_ts := ${sig(p.rts)} cm`));
  if (p.ho > 0) items.push(m(`h_o := ${sig(p.ho)} cm`));
  items.push(m(`J := ${sig(p.J)} cm^4`));
  if (p.Cw > 0) items.push(m(`C_w := ${sig(p.Cw)} cm^6`));

  items.push(banner('DATOS · LONGITUDES Y CARGAS'));
  items.push(m(`L_cx := ${sig(estabilidad.Lcx)} cm`));
  items.push(m(`L_cy := ${sig(estabilidad.Lcy)} cm`));
  items.push(m(`L_cz := ${sig(estabilidad.Lcz)} cm`));
  items.push(m(`L_b := ${sig(estabilidad.Lb)} cm`));
  items.push(t('C_b y B_1 son dato: dependen del diagrama de momentos, no de la sección.'));
  items.push(m(`C_b := ${sig(estabilidad.Cb)}`));
  items.push(m(`B_1 := ${sig(estabilidad.B1)}`));
  // Se emiten TODAS las demandas si hay alguna, incluidos los ceros: los usos de
  // cada bloque las referencian y un cero no molesta, pero una que falte rompe la
  // hoja. La memoria del modo «capacidad» simplemente no trae ninguna.
  const hayDemandas =
    demandas.Pu > 0 || demandas.Tu > 0 || demandas.Mux > 0 || demandas.Muy > 0 || demandas.Vu > 0;
  if (hayDemandas) {
    items.push(m(`P_u := ${sig(demandas.Pu / TONF)} tonf`));
    items.push(m(`T_u := ${sig(demandas.Tu / TONF)} tonf`));
    items.push(m(`M_ux := ${sig(demandas.Mux / TONF_M)} tonf*m`));
    items.push(m(`M_uy := ${sig(demandas.Muy / TONF_M)} tonf*m`));
    items.push(m(`V_u := ${sig(demandas.Vu / TONF)} tonf`));
  }
  if (entrada.traccion?.An !== undefined && entrada.traccion?.U !== undefined) {
    items.push(t('Área neta y retraso de cortante: dependen de la conexión (Tabla D3.1).'));
    items.push(m(`A_n := ${sig(entrada.traccion.An)} cm^2`));
    items.push(m(`U := ${sig(entrada.traccion.U)}`));
  }

  // ── Clasificación ──
  // Cada tabla se emite SOLO si su estado límite se verificó: la B4.1a es la de
  // compresión uniforme y la B4.1b la de flexión, y no dicen lo mismo. Un alma
  // puede ser esbelta a compresión y compacta a flexión — le pasa a la viga
  // W460×74 de la planilla viga-ltb.
  const cComp = r.clasificacion.compresion;
  const cFlex = r.clasificacion.flexion;
  const hayClasificacion = r.compresion || (r.flexionX && !r.flexionX.fueraDeAlcance);
  if (hayClasificacion) items.push(banner(`${++n} · CLASIFICACIÓN DE LA SECCIÓN`));

  if (r.compresion) {
    items.push(t(`Compresión uniforme — ${cComp[0].ref}:`));
    items.push(m(`lam_rf := ${sigCoef(cComp[0].lambdar, material.E, material.Fy)} =`));
    items.push(m(`lam_ala := ${sig(cComp[0].lambda)}`));
    pushLambda('lam_ala', 'lam_rf', cComp[0].clase !== 'esbelta', 'El ala ES esbelta → aplica E7:');
    if (cComp[1]) {
      items.push(m(`lam_rw := ${sigCoef(cComp[1].lambdar, material.E, material.Fy)} =`));
      items.push(m(`lam_alma := ${sig(cComp[1].lambda)}`));
      pushLambda('lam_alma', 'lam_rw', cComp[1].clase !== 'esbelta', 'El alma ES esbelta → aplica E7:');
    }
  }

  if (r.flexionX && !r.flexionX.fueraDeAlcance) {
    items.push(t(`Flexión — ${cFlex[0].ref}. Es la OTRA tabla, no la de compresión:`));
    if (cFlex[0].lambdap !== undefined) {
      items.push(m(`lam_pf := ${sigCoef(cFlex[0].lambdap, material.E, material.Fy)} =`));
      items.push(m(`lam_fala := ${sig(cFlex[0].lambda)}`));
      pushLambda(
        'lam_fala',
        'lam_pf',
        cFlex[0].clase === 'compacta',
        `El ala es ${cFlex[0].clase} en flexión → entra el pandeo local del ala:`
      );
    }
    if (cFlex[1]?.lambdap !== undefined) {
      items.push(m(`lam_pw := ${sigCoef(cFlex[1].lambdap, material.E, material.Fy)} =`));
      items.push(m(`lam_falma := ${sig(cFlex[1].lambda)}`));
      pushLambda(
        'lam_falma',
        'lam_pw',
        cFlex[1].clase === 'compacta',
        `El alma es ${cFlex[1].clase} en flexión:`
      );
    }
  }

  // ── Compresión ──
  if (r.compresion) {
    const c = r.compresion;
    items.push(banner(`${++n} · COMPRESIÓN (Cap. E)`));
    items.push(m('lam_x := L_cx/r_x ='));
    items.push(m('lam_y := L_cy/r_y ='));
    items.push(m('lam := max(lam_x, lam_y) ='));
    items.push(m('lam_lim := 4.71*sqrt(E/F_y) ='));
    items.push(t('Ec. E3-4 sobre la esbeltez que gobierna:'));
    items.push(m('F_e := pi^2*E/lam^2 = kgf/cm^2'));
    items.push(m('q_c := F_y/F_e ='));
    if (c.Fe === c.Fex || c.Fe === c.Fey) {
      const inelastico = material.Fy / c.Fe <= 2.25;
      items.push(
        t(
          inelastico
            ? 'Régimen INELÁSTICO (q_c ≤ 2,25) — Ec. E3-2: acá F_y sí manda'
            : 'Régimen ELÁSTICO (q_c > 2,25) — Ec. E3-3: F_n = 0,877·F_e, que no ve F_y'
        )
      );
      items.push(m(inelastico ? 'q_c <= 2.25 =' : 'q_c > 2.25 ='));
      items.push(
        m(inelastico ? 'F_n := F_y*0.658^q_c = kgf/cm^2' : 'F_n := 0.877*F_e = kgf/cm^2')
      );
    }
    if (c.aplicaE7) {
      items.push(t('E7: hay elementos esbeltos y el área efectiva es menor que la bruta.'));
      items.push(m(`A_e := ${sig(c.Ae)} cm^2`));
    } else {
      items.push(t('Ningún elemento es esbelto → no aplica E7 y se trabaja con la sección completa'));
      items.push(m('A_e := A_g = cm^2'));
    }
    items.push(t('Ec. E3-1:'));
    items.push(m('Rd_c := phi*F_n*A_e = tonf'));
    if (c.Fez > 0) {
      items.push(t('Ec. E4-2, pandeo torsional en torno al centro de corte:'));
      items.push(m('I_s := I_x + I_y = cm^4'));
      items.push(m('F_ez := (pi^2*E*C_w/L_cz^2 + G*J)/I_s = kgf/cm^2'));
      if (c.Fez > c.Fe) {
        items.push(t('El torsional queda por encima: no gobierna.'));
        items.push(m('F_ez > F_e ='));
      } else {
        items.push(t('El torsional queda POR DEBAJO del flexional:'));
        items.push(m('F_ez < F_e ='));
      }
    }
    if (demandas.Pu > 0) {
      items.push(m('u_c := P_u/Rd_c ='));
      pushUso('u_c <= 1 =', demandas.Pu / c.phiPn, 'compresión');
    }
  }

  // ── Tracción (Sec. D2) ──
  if (r.traccion) {
    items.push(banner(`${++n} · TRACCIÓN (Sec. D2)`));
    items.push(t('Ec. D2-1, fluencia en el área bruta, con phi_t = 0,90:'));
    items.push(m('phi_t := 0.90'));
    items.push(m('Rd_tf := phi_t*F_y*A_g = tonf'));
    if (entrada.traccion?.An !== undefined && entrada.traccion?.U !== undefined) {
      items.push(t('Ecs. D3-1 y D2-2, rotura en el área neta efectiva, con phi_t = 0,75:'));
      items.push(m('A_e := A_n*U = cm^2'));
      items.push(m('Rd_tr := 0.75*F_u*A_e = tonf'));
      items.push(m('Rd_t := min(Rd_tf, Rd_tr) = tonf'));
    } else {
      items.push(
        t('Sin A_n ni U declarados no se verifica D2-2: el retraso de cortante es de la conexión.')
      );
      items.push(m('Rd_t := Rd_tf = tonf'));
    }
    if (hayDemandas) {
      items.push(m('u_t := T_u/Rd_t ='));
      pushUso('u_t <= 1 =', demandas.Tu / r.traccion.phiPn, 'tracción');
    }
  }

  // ── Flexión, los dos ejes ──
  //
  // Un solo emisor parametrizado por eje: la Ec. F6 del eje débil y la F7 del
  // HSS comparten estructura con la F2, y duplicar el bloque fue justo lo que
  // dejó al HSS sin su cadena y a la hoja referenciando un u_f inexistente.
  const emitirFlexion = (eje: 'x' | 'y', f: NonNullable<typeof r.flexionX>): void => {
    const s = eje === 'x' ? '' : 'y';
    const Z = eje === 'x' ? 'Z_x' : 'Z_y';
    const S = eje === 'x' ? 'S_x' : 'S_y';
    const Mp = `M_p${s}`;
    const Mn = `M_n${s}`;
    const Rd = `Rd_f${s}`;
    // El elemento comprimido cambia con el eje solo en el HSS rectangular: en
    // el perfil I el ala es la misma en los dos ejes.
    const lamComp = geom.familia === 'HSS-R' && eje === 'y' ? 'lam_falma' : 'lam_fala';
    const lamAlma = geom.familia === 'HSS-R' && eje === 'y' ? 'lam_fala' : 'lam_falma';

    items.push(
      banner(`${++n} · FLEXIÓN EJE ${eje === 'x' ? 'FUERTE' : 'DÉBIL'} (Cap. F)`)
    );

    if (geom.familia === 'I' && eje === 'x') {
      items.push(t('Ec. F2-1:'));
      items.push(m(`${Mp} := F_y*${Z} = tonf*m`));
      items.push(m(`Rd_p := phi*${Mp} = tonf*m`));
      items.push(t('Ecs. F2-5 y F2-6, con c = 1 (perfil I doblemente simétrico):'));
      items.push(m('L_p := 1.76*r_y*sqrt(E/F_y) = cm'));
      items.push(m(`rz := J*1/(${S}*h_o) =`));
      items.push(
        m('L_r := 1.95*r_ts*(E/(0.7*F_y))*sqrt(rz + sqrt(rz^2 + 6.76*(0.7*F_y/E)^2)) = cm')
      );
      items.push(m(`M_07 := 0.7*F_y*${S} = tonf*m`));
      if (f.zona === 'plastica') {
        items.push(t('L_b ≤ L_p → zona plástica: M_n = M_p, el LTB no roba nada.'));
        items.push(m('L_b <= L_p ='));
        items.push(m(`${Mn} := ${Mp} = tonf*m`));
      } else if (f.zona === 'inelastica') {
        items.push(t('L_p < L_b ≤ L_r → LTB INELÁSTICO: rige la recta de la Ec. F2-2.'));
        items.push(m('L_b > L_p ='));
        items.push(m('L_b <= L_r ='));
        items.push(m('frac := (L_b - L_p)/(L_r - L_p) ='));
        items.push(m(`corch := ${Mp} - (${Mp} - M_07)*frac = tonf*m`));
        items.push(m('Mn_0 := C_b*corch = tonf*m'));
        items.push(m(`${Mn} := min(Mn_0, ${Mp}) = tonf*m`));
      } else {
        items.push(t('L_b > L_r → LTB ELÁSTICO: se vuelca sin haber fluido (Ecs. F2-3 y F2-4).'));
        items.push(m('L_b > L_r ='));
        items.push(m('esb := L_b/r_ts ='));
        items.push(m('q_f := esb^2 ='));
        items.push(m('F_cr := C_b*pi^2*E/q_f*sqrt(1 + 0.078*rz*q_f) = kgf/cm^2'));
        items.push(m(`Mn_0 := F_cr*${S} = tonf*m`));
        items.push(m(`${Mn} := min(Mn_0, ${Mp}) = tonf*m`));
      }
    } else if (geom.familia === 'I') {
      items.push(t('Ec. F6-1, con su tope 1,6·F_y·S_y. En el eje débil no hay LTB.'));
      items.push(m(`${Mp} := min(F_y*${Z}, 1.6*F_y*${S}) = tonf*m`));
      const alaF = r.clasificacion.flexion[0];
      if (f.gobierna === 'FLB' && alaF.clase === 'no-compacta') {
        items.push(t('Ala no compacta: Ec. F6-2, la recta entre M_p y 0,7·F_y·S_y.'));
        items.push(m(`lamr_f := ${sigCoef(alaF.lambdar, material.E, material.Fy)} =`));
        items.push(
          m(`${Mn} := ${Mp} - (${Mp} - 0.7*F_y*${S})*(${lamComp} - lam_pf)/(lamr_f - lam_pf) = tonf*m`)
        );
      } else if (f.gobierna === 'FLB') {
        items.push(t('Ala esbelta: Ecs. F6-3 y F6-4.'));
        items.push(m(`F_cry := 0.69*E/${lamComp}^2 = kgf/cm^2`));
        items.push(m(`${Mn} := F_cry*${S} = tonf*m`));
      } else {
        items.push(m(`${Mn} := ${Mp} = tonf*m`));
      }
    } else if (geom.familia === 'HSS-R') {
      // La pared comprimida y el canto del módulo cambian con el eje.
      const bPlano = eje === 'x' ? 'b_w' : 'h_w';
      const canto = eje === 'x' ? 'H' : 'B';
      const Iej = eje === 'x' ? 'I_x' : 'I_y';
      items.push(t('Ec. F7-1:'));
      items.push(m(`${Mp} := F_y*${Z} = tonf*m`));
      if (f.gobierna === 'FLB' && f.claseFLB === 'esbelta') {
        // Ec. F7-4 y luego F7-3 con S_e. El módulo efectivo corre el centroide,
        // así que hay que recomponerlo: quitar la franja inefectiva del ala,
        // reubicar el eje neutro y volver a dividir por la fibra comprimida.
        items.push(t('Ala esbelta: ancho efectivo de la Ec. F7-4 y luego la F7-3 con S_e.'));
        items.push(
          m(`be${s} := min(${bPlano}, 1.92*t_d*sqrt(E/F_y)*(1 - (0.38/${lamComp})*sqrt(E/F_y))) = cm`)
        );
        items.push(m(`perd${s} := (${bPlano} - be${s})*t_d = cm^2`));
        items.push(m(`Aef${s} := A_g - perd${s} = cm^2`));
        items.push(m(`cf${s} := ${canto}/2 - t_d/2 = cm`));
        items.push(m(`yn${s} := -perd${s}*cf${s}/Aef${s} = cm`));
        items.push(m(`Ief${s} := (${Iej} - perd${s}*cf${s}^2) - Aef${s}*yn${s}^2 = cm^4`));
        items.push(m(`Se${s} := Ief${s}/(${canto}/2 - yn${s}) = cm^3`));
        items.push(m(`${Mn} := F_y*Se${s} = tonf*m`));
      } else if (f.gobierna === 'FLB') {
        items.push(t('Ala no compacta: Ec. F7-2, con su tope M_p.'));
        items.push(
          m(`${Mn} := min(${Mp}, ${Mp} - (${Mp} - F_y*${S})*(3.57*${lamComp}*sqrt(F_y/E) - 4.0)) = tonf*m`)
        );
      } else if (f.gobierna === 'WLB') {
        items.push(t('Alma no compacta: Ec. F7-5, con su tope M_p.'));
        items.push(
          m(`${Mn} := min(${Mp}, ${Mp} - (${Mp} - F_y*${S})*(0.305*${lamAlma}*sqrt(F_y/E) - 0.738)) = tonf*m`)
        );
      } else if (f.gobierna === 'LTB') {
        items.push(t('Ecs. F7-12 y F7-13, y la rama de F7.4 que corresponde:'));
        items.push(m('Lp_h := 0.13*E*r_y*sqrt(J*A_g)/M_p = cm'));
        items.push(m(`Lr_h := 2*E*r_y*sqrt(J*A_g)/(0.7*F_y*${S}) = cm`));
        items.push(
          m(
            f.zona === 'inelastica'
              ? `${Mn} := min(${Mp}, C_b*(${Mp} - (${Mp} - 0.7*F_y*${S})*((L_b - Lp_h)/(Lr_h - Lp_h)))) = tonf*m`
              : `${Mn} := min(${Mp}, 2*E*C_b*sqrt(J*A_g)/(L_b/r_y)) = tonf*m`
          )
        );
      } else {
        items.push(t('Sección compacta y L_b ≤ L_p: gobierna la fluencia.'));
        items.push(m(`${Mn} := ${Mp} = tonf*m`));
      }
    } else {
      // Las tres ramas de F8 se eligen por D/t, no comparando resistencias.
      const dt = geom.D / geom.t;
      items.push(t('Ec. F8-1, y la rama de F8 que corresponde a D/t:'));
      items.push(m(`${Mp} := F_y*${Z} = tonf*m`));
      if (dt <= (0.07 * material.E) / material.Fy) {
        items.push(t('Sección compacta: gobierna la fluencia.'));
        items.push(m('lam_dt <= 0.07*E/F_y ='));
        items.push(m(`${Mn} := ${Mp} = tonf*m`));
      } else if (dt <= (0.31 * material.E) / material.Fy) {
        items.push(t('No compacta: Ec. F8-2.'));
        items.push(m('lam_dt <= 0.31*E/F_y ='));
        items.push(m(`${Mn} := min(${Mp}, (0.021*E/lam_dt + F_y)*${S}) = tonf*m`));
      } else {
        items.push(t('Esbelta: Ecs. F8-3 y F8-4.'));
        items.push(m('lam_dt > 0.31*E/F_y ='));
        items.push(m(`${Mn} := min(${Mp}, 0.33*E/lam_dt*${S}) = tonf*m`));
      }
    }

    items.push(m(`${Rd} := phi*${Mn} = tonf*m`));
    if (hayDemandas) {
      const dem = eje === 'x' ? 'B_1*M_ux' : 'M_uy';
      const uso = eje === 'x' ? 'u_f' : 'u_fy';
      items.push(m(`${uso} := ${dem}/${Rd} =`));
      pushUso(
        `${uso} <= 1 =`,
        (eje === 'x' ? estabilidad.B1 * demandas.Mux : demandas.Muy) / f.phiMn,
        `flexión en el eje ${eje === 'x' ? 'fuerte' : 'débil'}`
      );
    }
  };

  if (r.flexionX && !r.flexionX.fueraDeAlcance) emitirFlexion('x', r.flexionX);
  if (r.flexionY && !r.flexionY.fueraDeAlcance) emitirFlexion('y', r.flexionY);

  // ── Corte (Cap. G) ──
  if (r.corte && !r.corte.fueraDeAlcance) {
    const v = r.corte;
    items.push(banner(`${++n} · CORTE (Cap. G)`));
    if (geom.familia === 'I') {
      items.push(t('G2.1: A_w = d·t_w en perfil I laminado.'));
      items.push(m('A_w := d*t_w = cm^2'));
      items.push(m('lam_v := ht_alma ='));
    } else {
      items.push(t('G4: las dos paredes paralelas a la fuerza de corte.'));
      items.push(m('A_w := 2*h_w*t_d = cm^2'));
      items.push(m('lam_v := lam_h ='));
    }
    if (v.phiV === 1) {
      items.push(t('G2.1(a): con h/t_w ≤ 2,24·√(E/F_y) el phi_v sube a 1,00 y C_v1 = 1.'));
      items.push(m('lam_v <= 2.24*sqrt(E/F_y) ='));
      items.push(m('phi_v := 1.00'));
      items.push(m('C_v := 1'));
    } else {
      items.push(t('Fuera de G2.1(a): phi_v = 0,90 y entra C_v. Alma SIN atiesadores.'));
      items.push(m('phi_v := 0.90'));
      items.push(m(`C_v := ${sig(v.Cv)}`));
    }
    items.push(m('Rd_v := phi_v*0.6*F_y*A_w*C_v = tonf'));
    if (hayDemandas) {
      items.push(m('u_v := V_u/Rd_v ='));
      pushUso('u_v <= 1 =', demandas.Vu / v.phiVn, 'corte');
    }
  }

  // ── Interacción (Sec. H1) ──
  if (r.interaccion) {
    items.push(banner(`${++n} · INTERACCIÓN (Sec. H1)`));
    items.push(t('H1.1 parte en P_r/P_c = 0,2: por encima rige H1-1a, por debajo H1-1b.'));
    items.push(m(r.interaccion.ecuacion === 'H1-1a' ? 'u_c >= 0.2 =' : 'u_c < 0.2 ='));
    // El término del eje débil solo entra si ese bloque llegó a definir u_fy.
    const sumaM = r.flexionY && !r.flexionY.fueraDeAlcance ? '(u_f + u_fy)' : 'u_f';
    items.push(
      m(
        r.interaccion.ecuacion === 'H1-1a'
          ? `u_tot := u_c + (8/9)*${sumaM} =`
          : `u_tot := u_c/2 + ${sumaM} =`
      )
    );
    pushUso('u_tot <= 1 =', r.interaccion.u, 'la interacción del Cap. H');
  }

  // ── Capa sísmica (NCh2369:2025) ──
  if (r.sismico) {
    const sis = r.sismico;
    items.push(banner(`${++n} · NCh2369 — DUCTILIDAD Y CAPACIDADES ESPERADAS`));
    items.push(
      t('Solo exigible si el miembro debe ser dúctil, típicamente una diagonal de arriostramiento.')
    );
    items.push(t('8.3.3: R_y = 1,30 es el valor nacional de C8.3.3, no el de AISC 341.'));
    items.push(m(`R_y := ${sig(material.Ry)}`));
    items.push(m(`R_t := ${sig(material.Rt)}`));
    items.push(t('8.3.1, capacidades esperadas:'));
    items.push(m('F_ye := R_y*F_y = kgf/cm^2'));
    items.push(m('F_ue := R_t*F_u = kgf/cm^2'));
    items.push(m('T_ye := F_ye*A_g = tonf'));
    items.push(t('F_cre es F_cr evaluado con F_ye en vez de F_y, y P_ne lleva el factor 1,14:'));
    // Misma bifurcación de E3-2/E3-3, pero evaluada con F_ye.
    const qe = r.compresion ? sis.Fye / r.compresion.Fe : 0;
    items.push(m('q_e := F_ye/F_e ='));
    items.push(
      m(qe <= 2.25 ? 'F_cre := F_ye*0.658^q_e = kgf/cm^2' : 'F_cre := 0.877*F_e = kgf/cm^2')
    );
    items.push(m('P_ne := 1.14*F_cre*A_g = tonf'));
    items.push(t('Tabla 9, pandeo local del elemento que debe plastificar:'));
    items.push(
      m(
        geom.familia === 'I'
          ? 'lam_md := 0.40*sqrt(E/F_ye) ='
          : 'lam_md := 0.76*sqrt(E/F_ye) ='
      )
    );
    for (const l of sis.limites) {
      if (l.id === 'nch-esbeltez') continue;
      const lam = l.id === 'nch-pared-h' ? 'lam_alma' : 'lam_ala';
      if (l.ok) push(m(`${lam} <= lam_md =`));
      else pushFalso(m(`${lam} <= lam_md =`), `${l.nombre}: λ = ${sig(l.valor, 4)} supera λ_md.`);
    }
    items.push(t('8.6.3, esbeltez global. El límite es exactamente el quiebre elástico de AISC:'));
    items.push(m('lam_nch := 1.5*pi*sqrt(E/F_y) ='));
    const esb = sis.limites.find((l) => l.id === 'nch-esbeltez');
    if (esb?.ok) push(m('lam <= lam_nch ='));
    else pushFalso(m('lam <= lam_nch ='), `Esbeltez global L_c/r = ${sig(esb?.valor ?? 0, 4)} supera 1,5π·√(E/F_y).`);
  }

  // ── Contraste contra el motor ──
  items.push(banner('CONTRASTE CONTRA LA HERRAMIENTA'));
  items.push(
    t('Cada número que reportó el motor TS, contra el que recalcula esta hoja con mathjs.')
  );
  items.push(t('Si alguno da ✗, los dos motores discrepan y hay que mirarlo.'));
  if (r.compresion) {
    items.push(m(`abs(F_e - ${sig(r.compresion.Fe)} kgf/cm^2) < 0.5 kgf/cm^2 =`));
    items.push(m(`abs(F_n - ${sig(r.compresion.Fn)} kgf/cm^2) < 0.5 kgf/cm^2 =`));
    items.push(m(`abs(Rd_c - ${sig(r.compresion.phiPn / TONF)} tonf) < 0.05 tonf =`));
  }
  if (r.traccion) {
    items.push(m(`abs(Rd_t - ${sig(r.traccion.phiPn / TONF)} tonf) < 0.05 tonf =`));
  }
  if (r.flexionX && !r.flexionX.fueraDeAlcance) {
    items.push(m(`abs(M_p - ${sig(r.flexionX.Mp / TONF_M)} tonf*m) < 0.05 tonf*m =`));
    // L_p y L_r solo existen en la hoja cuando el perfil I los desarrolla; el
    // HSS los escribe como Lp_h/Lr_h y solo si gobierna el LTB.
    if (geom.familia === 'I' && r.flexionX.Lp !== undefined) {
      items.push(m(`abs(L_p - ${sig(r.flexionX.Lp)} cm) < 0.5 cm =`));
      items.push(m(`abs(L_r - ${sig(r.flexionX.Lr ?? 0)} cm) < 0.5 cm =`));
    }
    items.push(m(`abs(Rd_f - ${sig(r.flexionX.phiMn / TONF_M)} tonf*m) < 0.05 tonf*m =`));
  }
  if (r.flexionY && !r.flexionY.fueraDeAlcance) {
    items.push(m(`abs(Rd_fy - ${sig(r.flexionY.phiMn / TONF_M)} tonf*m) < 0.05 tonf*m =`));
  }
  if (r.corte && !r.corte.fueraDeAlcance) {
    items.push(m(`abs(Rd_v - ${sig(r.corte.phiVn / TONF)} tonf) < 0.05 tonf =`));
  }
  if (r.interaccion) {
    items.push(m(`abs(u_tot - ${sig(r.interaccion.u)}) < 0.005 =`));
  }
  if (r.sismico) {
    items.push(m(`abs(F_ye - ${sig(r.sismico.Fye)} kgf/cm^2) < 0.5 kgf/cm^2 =`));
    items.push(m(`abs(T_ye - ${sig(r.sismico.Tye / TONF)} tonf) < 0.05 tonf =`));
    items.push(m(`abs(P_ne - ${sig(r.sismico.Pne / TONF)} tonf) < 0.05 tonf =`));
    items.push(m(`abs(lam_md - ${sig(r.sismico.lambdaMd)}) < 0.005 =`));
    items.push(m(`abs(lam_nch - ${sig(r.sismico.lambdaGlobal)}) < 0.05 =`));
  }

  verificarSimbolos(items);

  const meta: Memoria['meta'] = { titulo };
  if (Object.keys(esperadoFalso).length > 0) meta.esperadoFalso = esperadoFalso;

  return { version: 1, meta, regions: layout(PREFIJO, 40, 32, items) };
}

/**
 * Reescribe un límite numérico como la expresión de la norma cuando se puede
 * reconocer el coeficiente (0,56·√(E/F_y), 1,49·√(E/F_y), …); si no, lo deja
 * como número. Mantiene la hoja legible sin inventar una fórmula.
 */
function sigCoef(limite: number, E: number, Fy: number): string {
  const raiz = Math.sqrt(E / Fy);
  const coefRaiz = limite / raiz;
  const conocidosRaiz = [0.38, 0.4, 0.56, 0.64, 0.76, 0.95, 1.0, 1.12, 1.4, 1.49, 2.42, 3.76, 5.7];
  for (const c of conocidosRaiz) {
    if (Math.abs(coefRaiz - c) < 5e-4) return `${c}*sqrt(E/F_y)`;
  }
  const coefLineal = limite / (E / Fy);
  for (const c of [0.07, 0.11, 0.31]) {
    if (Math.abs(coefLineal - c) < 5e-5) return `${c}*E/F_y`;
  }
  return sig(limite);
}

// ── Entrega al canvas ────────────────────────────────────────────────────────

/**
 * Escribe la hoja en el slot del canvas y navega. `loadInitial()` de
 * MathCanvas lee esa clave al montar, así que la hoja aparece cargada.
 */
export function abrirEnCanvas(memoria: Memoria): void {
  if (typeof window === 'undefined') return;
  try {
    const previo = window.localStorage.getItem(STORAGE_KEY);
    if (previo) {
      const data = JSON.parse(previo) as { regions?: unknown[] };
      const hayTrabajo = Array.isArray(data.regions) && data.regions.length > 0;
      if (hayTrabajo && !window.confirm('El canvas tiene una hoja guardada. ¿Reemplazarla por la memoria?')) {
        return;
      }
    }
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, regions: memoria.regions })
    );
  } catch {
    window.alert('No se pudo escribir en el almacenamiento local del navegador.');
    return;
  }
  window.location.href = '/herramientas/canvas';
}

/** Descarga la memoria como .json — el mismo formato que `verify:planilla` lee. */
export function descargarMemoria(memoria: Memoria): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([JSON.stringify(memoria, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'memoria-seccion.json';
  a.click();
  URL.revokeObjectURL(url);
}
