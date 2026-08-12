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
import { abrirEnCanvas, descargarHoja, verificarSimbolos } from '../canvas-handoff';
import type { Region } from '../worksheet';
import type { ResultadoSeccion } from './seccion';
import type { EntradaVerificacion } from './tipos';

const TONF = 1000;
const TONF_M = 100000;

/** Redondeo a cifras significativas, para que la hoja no arrastre ruido. */
function sig(v: number, n = 6): string {
  if (!Number.isFinite(v)) return '0';
  if (v === 0) return '0';
  return Number(v.toPrecision(n)).toString();
}

/**
 * Un DATO declarado de la hoja, a precisión suficiente para que el contraste
 * pueda ser duro.
 *
 * Va a 12 cifras y no a 6 porque el contraste contra el motor tiene tolerancia
 * relativa de 1e-9: si los datos de entrada se escribieran redondeados, la hoja
 * fallaría contra el redondeo de sus propios números y no contra una
 * discrepancia real. Los valores de catálogo no se alargan —`92.8` sigue
 * escribiéndose `92.8`—; solo los derivados de las planchas muestran sus cifras,
 * que es lo que hace la memoria reproducible.
 */
const dato = (v: number): string => sig(v, 12);

function banner(texto: string): Item {
  return t(`━━ ${texto} ━━`);
}

// El guardián de símbolos que corría acá se movió a `../canvas-handoff`: no
// tenía nada de acero, y la memoria de vigas necesita exactamente el mismo
// chequeo. Nació de un error real: la sección de interacción emitía
// `u_tot := u_c + (8/9)*u_f` mientras el bloque que define `u_f` quedaba detrás
// de un filtro de familia, así que la memoria de un HSS en flexocompresión
// llegaba rota al canvas.

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
    items.push(m(`d := ${dato(geom.d)} cm`));
    items.push(m(`b_f := ${dato(geom.bf)} cm`));
    items.push(m(`t_f := ${dato(geom.tf)} cm`));
    items.push(m(`t_w := ${dato(geom.tw)} cm`));
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
    items.push(m(`B := ${dato(geom.B)} cm`));
    items.push(m(`H := ${dato(geom.H)} cm`));
    items.push(t('t es la pared de DISEÑO, no la nominal (B4.2)'));
    items.push(m(`t_d := ${dato(geom.t)} cm`));
    items.push(t('§B4.1b(d): sin radio de esquina conocido, b = B − 3t'));
    items.push(m('b_w := B - 3*t_d = cm'));
    items.push(m('h_w := H - 3*t_d = cm'));
    items.push(m('lam_w := b_w/t_d ='));
    items.push(m('lam_h := h_w/t_d ='));
    items.push(t('Paredes rectas, sin radios: SOBREESTIMA el área real del tubo.'));
    items.push(m('A_pl := B*H - (B - 2*t_d)*(H - 2*t_d) = cm^2'));
  } else {
    items.push(m(`D := ${dato(geom.D)} cm`));
    items.push(m(`t_d := ${dato(geom.t)} cm`));
    items.push(m('lam_dt := D/t_d ='));
    items.push(m('A_pl := pi/4*(D^2 - (D - 2*t_d)^2) = cm^2'));
  }

  items.push(banner('DATOS · PROPIEDADES USADAS — frontera declarada'));
  items.push(
    t('Las que el motor usó. Donde hay fila de catálogo, es dato declarado; el resto se derivó.')
  );
  items.push(m(`A_g := ${dato(p.Ag)} cm^2`));
  items.push(m(`I_x := ${dato(p.Ix)} cm^4`));
  items.push(m(`I_y := ${dato(p.Iy)} cm^4`));
  items.push(m(`S_x := ${dato(p.Sx)} cm^3`));
  items.push(m(`Z_x := ${dato(p.Zx)} cm^3`));
  items.push(m(`S_y := ${dato(p.Sy)} cm^3`));
  items.push(m(`Z_y := ${dato(p.Zy)} cm^3`));
  items.push(m(`r_x := ${dato(p.rx)} cm`));
  items.push(m(`r_y := ${dato(p.ry)} cm`));
  if (p.rts > 0) items.push(m(`r_ts := ${dato(p.rts)} cm`));
  if (p.ho > 0) items.push(m(`h_o := ${dato(p.ho)} cm`));
  items.push(m(`J := ${dato(p.J)} cm^4`));
  if (p.Cw > 0) items.push(m(`C_w := ${dato(p.Cw)} cm^6`));

  items.push(banner('DATOS · LONGITUDES Y CARGAS'));
  items.push(m(`L_cx := ${dato(estabilidad.Lcx)} cm`));
  items.push(m(`L_cy := ${dato(estabilidad.Lcy)} cm`));
  items.push(m(`L_cz := ${dato(estabilidad.Lcz)} cm`));
  items.push(m(`L_b := ${dato(estabilidad.Lb)} cm`));
  items.push(t('C_b y B_1 son dato: dependen del diagrama de momentos, no de la sección.'));
  items.push(m(`C_b := ${dato(estabilidad.Cb)}`));
  items.push(m(`B_1 := ${dato(estabilidad.B1)}`));
  // Se emiten TODAS las demandas si hay alguna, incluidos los ceros: los usos de
  // cada bloque las referencian y un cero no molesta, pero una que falte rompe la
  // hoja. La memoria del modo «capacidad» simplemente no trae ninguna.
  const hayDemandas =
    demandas.Pu > 0 || demandas.Tu > 0 || demandas.Mux > 0 || demandas.Muy > 0 || demandas.Vu > 0;
  if (hayDemandas) {
    items.push(m(`P_u := ${dato(demandas.Pu / TONF)} tonf`));
    items.push(m(`T_u := ${dato(demandas.Tu / TONF)} tonf`));
    items.push(m(`M_ux := ${dato(demandas.Mux / TONF_M)} tonf*m`));
    items.push(m(`M_uy := ${dato(demandas.Muy / TONF_M)} tonf*m`));
    items.push(m(`V_u := ${dato(demandas.Vu / TONF)} tonf`));
  }
  if (entrada.traccion?.An !== undefined && entrada.traccion?.U !== undefined) {
    items.push(t('Área neta y retraso de cortante: dependen de la conexión (Tabla D3.1).'));
    items.push(m(`A_n := ${dato(entrada.traccion.An)} cm^2`));
    items.push(m(`U := ${dato(entrada.traccion.U)}`));
  }

  // ── Clasificación ──
  // Cada tabla se emite SOLO si su estado límite se verificó: la B4.1a es la de
  // compresión uniforme y la B4.1b la de flexión, y no dicen lo mismo. Un alma
  // puede ser esbelta a compresión y compacta a flexión — le pasa a la viga
  // W460×74 de la planilla viga-ltb.
  const cComp = r.clasificacion.compresion;
  const cFlex = r.clasificacion.flexion;
  // El bloque de flexión define lam_pf / lam_fala / lam_pw / lam_falma, que los
  // emisores de los DOS ejes referencian. Colgarlo solo de flexionX dejaba la
  // hoja rota cuando se pedía únicamente el eje débil.
  const hayFlexion =
    (r.flexionX && !r.flexionX.fueraDeAlcance) || (r.flexionY && !r.flexionY.fueraDeAlcance);
  const hayClasificacion = r.compresion || hayFlexion;
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

  if (hayFlexion) {
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
    // ── E7, área efectiva ──
    //
    // Se escribe la CADENA, no el número. Antes la hoja traía
    // `A_e := <literal>` copiado del motor, así que la Sección E7 era el único
    // tramo del cálculo sin segunda implementación: el contraste comparaba el
    // resultado del motor contra sí mismo.
    //
    // El símbolo va `A_ec` y no `A_e` porque la norma le dice A_e a DOS cosas
    // distintas —el área efectiva de E7 y el área neta efectiva de D3-1— y en
    // esta hoja pueden convivir.
    if (c.aplicaE7) {
      items.push(t('E7: hay elementos esbeltos, así que el área efectiva es menor que la bruta.'));
      if (geom.familia === 'HSS-C') {
        items.push(t('Ec. E7-7 (Sec. E7.2): el tubo circular da el área efectiva directa.'));
        items.push(m('fac_e := 0.038*E/(F_y*lam_dt) + 2/3 ='));
        items.push(m('A_ec := min(A_g, fac_e*A_g) = cm^2'));
      } else {
        // Ecs. E7-2 y E7-3 con F_el de la E7-5. Los c_1 y c_2 son de la Tabla
        // E7.1 y dependen de si el elemento está atiesado.
        const anchoEf = (
          suf: string,
          bExpr: string,
          lam: string,
          lamr: string,
          atiesado: boolean,
          esbelto: boolean
        ) => {
          items.push(m(`b${suf} := ${bExpr} = cm`));
          if (!esbelto) {
            items.push(m(`be${suf} := b${suf} = cm`));
            return;
          }
          const [c1, c2] = atiesado ? ['0.18', '1.31'] : ['0.22', '1.49'];
          items.push(
            t(`Tabla E7.1, elemento ${atiesado ? 'atiesado' : 'no atiesado'}: c_1 = ${c1}, c_2 = ${c2}.`)
          );
          items.push(m(`Fel${suf} := (${c2}*${lamr}/${lam})^2*F_y = kgf/cm^2`)); // Ec. E7-5
          items.push(m(`raz${suf} := sqrt(Fel${suf}/F_n) =`));
          items.push(
            m(`be${suf} := min(b${suf}, b${suf}*(1 - ${c1}*raz${suf})*raz${suf}) = cm`)
          ); // Ec. E7-3
        };

        const esbAla = cComp[0].clase === 'esbelta';
        const esbAlma = cComp[1] ? cComp[1].clase === 'esbelta' : false;
        if (geom.familia === 'I') {
          items.push(t('Ecs. E7-2 y E7-3, con F_el de la E7-5. El ala son dos salientes no atiesados por cada plancha; el alma está atiesada en sus dos bordes.'));
          anchoEf('_af', 'b_f/2', 'lam_ala', 'lam_rf', false, esbAla);
          anchoEf('_aw', 'h_pl', 'lam_alma', 'lam_rw', true, esbAlma);
          items.push(m('perd_e := 4*(b_af - be_af)*t_f + (b_aw - be_aw)*t_w = cm^2'));
        } else {
          items.push(t('Ecs. E7-2 y E7-3, con F_el de la E7-5. Las cuatro paredes del tubo son elementos atiesados.'));
          anchoEf('_af', 'b_w', 'lam_ala', 'lam_rf', true, esbAla);
          anchoEf('_aw', 'h_w', 'lam_alma', 'lam_rw', true, esbAlma);
          items.push(m('perd_e := 2*(b_af - be_af)*t_d + 2*(b_aw - be_aw)*t_d = cm^2'));
        }
        // El cero lleva unidad: mathjs no compara un escalar con una magnitud.
        items.push(m('A_ec := max(0 cm^2, A_g - perd_e) = cm^2'));
      }
    } else {
      items.push(t('Ningún elemento es esbelto → no aplica E7 y se trabaja con la sección completa'));
      items.push(m('A_ec := A_g = cm^2'));
    }
    items.push(t('Ec. E3-1:'));
    items.push(m('Rd_c := phi*F_n*A_ec = tonf'));
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

    if (geom.familia === 'I' && eje === 'x' && (f.seccion === 'F4' || f.seccion === 'F5')) {
      // ── Secciones F4 y F5 ──
      // Comparten los ingredientes (a_w, r_t, L_p) y se separan en el factor:
      // F4 plastifica el alma con R_pc sobre M_yc, F5 la descuenta con R_pg.
      const esF4 = f.seccion === 'F4';
      items.push(
        t(
          esF4
            ? 'El alma es NO COMPACTA: no rige la F2 sino la Sección F4, con el factor de plastificación del alma R_pc.'
            : 'El alma es ESBELTA: rige la Sección F5, con el factor de reducción R_pg. El alma abolla y deja de aportar.'
        )
      );
      items.push(t('F4 y F5 acotan M_p a 1,6·F_y·S_x, un tope que la Ec. F2-1 no lleva:'));
      items.push(m(`${Mp} := min(F_y*${Z}, 1.6*F_y*${S}) = tonf*m`));
      items.push(t('Ec. F4-4 y Ec. F4-6a (S_xt = S_xc en doblemente simétrico):'));
      items.push(m(`M_yc := F_y*${S} = tonf*m`));
      items.push(m('F_L := 0.7*F_y = kgf/cm^2'));
      items.push(t('Ecs. F4-12 y F4-11 — el alma entra al radio de giro con un sexto de su área:'));
      items.push(m('a_w := h_pl*t_w/(b_f*t_f) ='));
      items.push(m('r_t := b_f/sqrt(12*(1 + a_w/6)) = cm'));

      if (esF4) {
        items.push(m(`lamr_w := ${sigCoef(cFlex[1].lambdar, material.E, material.Fy)} =`));
        items.push(t('Ecs. F4-9a y F4-9b — R_pc interpola entre el tope M_p/M_yc de la F4-9a y 1:'));
        items.push(m('Rpc_tope := M_p/M_yc ='));
        items.push(
          m('Rpc_0 := Rpc_tope - (Rpc_tope - 1)*((lam_falma - lam_pw)/(lamr_w - lam_pw)) =')
        );
        items.push(m('R_pc := min(Rpc_tope, Rpc_0) ='));
        items.push(t('Ec. F4-1, fluencia del ala comprimida:'));
        items.push(m('M_cfy := R_pc*M_yc = tonf*m'));
      } else {
        items.push(t('Ec. F5-6 — a_w acotado a 10, y R_pg vale 1 mientras h_c/t_w ≤ 5,7·√(E/F_y):'));
        items.push(m('aw_t := min(a_w, 10) ='));
        items.push(
          m('Rpg_0 := 1 - (aw_t/(1200 + 300*aw_t))*(lam_falma - 5.7*sqrt(E/F_y)) =')
        );
        items.push(m('R_pg := min(1, Rpg_0) ='));
        items.push(t('Ec. F5-1:'));
        items.push(m(`M_cfy := R_pg*F_y*${S} = tonf*m`));
      }

      // ── LTB ──
      items.push(
        t(
          esF4
            ? 'Ecs. F4-7 y F4-8, con r_t en lugar del r_ts de la F2:'
            : 'Ec. F4-7 (que F5.2 reusa) y Ec. F5-5:'
        )
      );
      items.push(m('L_p := 1.1*r_t*sqrt(E/F_y) = cm'));
      if (esF4) {
        items.push(m(`rzc := J/(${S}*h_o) =`));
        items.push(
          m('L_r := 1.95*r_t*(E/F_L)*sqrt(rzc + sqrt(rzc^2 + 6.76*(F_L/E)^2)) = cm')
        );
      } else {
        items.push(m('L_r := pi*r_t*sqrt(E/(0.7*F_y)) = cm'));
      }

      if (f.zona === 'plastica') {
        items.push(t('L_b ≤ L_p → el LTB no aplica.'));
        items.push(m('L_b <= L_p ='));
        items.push(m('Mn_ltb := M_cfy = tonf*m'));
      } else if (esF4 && f.zona === 'inelastica') {
        items.push(t('L_p < L_b ≤ L_r → Ec. F4-2, la recta entre R_pc·M_yc y F_L·S_xc.'));
        items.push(m('L_b > L_p ='));
        items.push(m('frac := (L_b - L_p)/(L_r - L_p) ='));
        items.push(m(`corch := M_cfy - (M_cfy - F_L*${S})*frac = tonf*m`));
        items.push(m('Mn_ltb := min(M_cfy, C_b*corch) = tonf*m'));
      } else if (esF4) {
        items.push(t('L_b > L_r → Ecs. F4-3 y F4-5.'));
        items.push(m('L_b > L_r ='));
        items.push(m('q_f := (L_b/r_t)^2 ='));
        items.push(m('F_cr := C_b*pi^2*E/q_f*sqrt(1 + 0.078*rzc*q_f) = kgf/cm^2'));
        items.push(m(`Mn_ltb := min(F_cr*${S}, M_cfy) = tonf*m`));
      } else if (f.zona === 'inelastica') {
        items.push(t('L_p < L_b ≤ L_r → Ecs. F5-3 y F5-2.'));
        items.push(m('L_b > L_p ='));
        items.push(m('frac := (L_b - L_p)/(L_r - L_p) ='));
        items.push(m('F_cr := min(F_y, C_b*(F_y - 0.3*F_y*frac)) = kgf/cm^2'));
        items.push(m(`Mn_ltb := R_pg*F_cr*${S} = tonf*m`));
      } else {
        items.push(t('L_b > L_r → Ecs. F5-4 y F5-2.'));
        items.push(m('L_b > L_r ='));
        items.push(m('F_cr := min(F_y, C_b*pi^2*E/(L_b/r_t)^2) = kgf/cm^2'));
        items.push(m(`Mn_ltb := R_pg*F_cr*${S} = tonf*m`));
      }

      // ── Pandeo local del ala ──
      const alaF4 = cFlex[0];
      if (alaF4.clase === 'compacta') {
        items.push(t('Ala compacta: el pandeo local del ala no aplica.'));
        items.push(m(`${Mn} := min(M_cfy, Mn_ltb) = tonf*m`));
      } else {
        items.push(m(`lamr_f := ${sigCoef(alaF4.lambdar, material.E, material.Fy)} =`));
        items.push(m('k_c := min(0.76, max(0.35, 4/sqrt(lam_falma))) ='));
        if (alaF4.clase === 'no-compacta' && esF4) {
          items.push(t('Ala no compacta: Ec. F4-13.'));
          items.push(
            m(
              `Mn_flb := M_cfy - (M_cfy - F_L*${S})*((lam_fala - lam_pf)/(lamr_f - lam_pf)) = tonf*m`
            )
          );
        } else if (esF4) {
          items.push(t('Ala esbelta: Ec. F4-14.'));
          items.push(m(`Mn_flb := 0.9*E*k_c*${S}/lam_fala^2 = tonf*m`));
        } else if (alaF4.clase === 'no-compacta') {
          items.push(t('Ala no compacta: Ecs. F5-8 y F5-7.'));
          items.push(
            m('Fcr_f := F_y - 0.3*F_y*((lam_fala - lam_pf)/(lamr_f - lam_pf)) = kgf/cm^2')
          );
          items.push(m(`Mn_flb := R_pg*Fcr_f*${S} = tonf*m`));
        } else {
          items.push(t('Ala esbelta: Ecs. F5-9 y F5-7.'));
          items.push(m('Fcr_f := 0.9*E*k_c/lam_fala^2 = kgf/cm^2'));
          items.push(m(`Mn_flb := R_pg*Fcr_f*${S} = tonf*m`));
        }
        items.push(m(`${Mn} := min(M_cfy, Mn_ltb, Mn_flb) = tonf*m`));
      }
      items.push(
        t(
          'La fluencia del ala traccionada (F4.4 / F5.4) no aplica: en doblemente simétrico S_xt = S_xc.'
        )
      );
    } else if (geom.familia === 'I' && eje === 'x') {
      items.push(t('Ec. F2-1:'));
      items.push(m(`${Mp} := F_y*${Z} = tonf*m`));
      items.push(m(`Rd_p := phi*${Mp} = tonf*m`));
      items.push(t('Ecs. F2-5 y F2-6. El c = 1 es de la Ec. F2-8b, perfil I doblemente simétrico:'));
      items.push(m('L_p := 1.76*r_y*sqrt(E/F_y) = cm'));
      items.push(m(`rz := J*1/(${S}*h_o) =`));
      items.push(
        m('L_r := 1.95*r_ts*(E/(0.7*F_y))*sqrt(rz + sqrt(rz^2 + 6.76*(0.7*F_y/E)^2)) = cm')
      );
      items.push(m(`M_07 := 0.7*F_y*${S} = tonf*m`));
      if (f.zona === 'plastica') {
        items.push(t('L_b ≤ L_p → zona plástica: el LTB no roba nada.'));
        items.push(m('L_b <= L_p ='));
        items.push(m(`Mn_ltb := ${Mp} = tonf*m`));
      } else if (f.zona === 'inelastica') {
        items.push(t('L_p < L_b ≤ L_r → LTB INELÁSTICO: rige la recta de la Ec. F2-2.'));
        items.push(m('L_b > L_p ='));
        items.push(m('L_b <= L_r ='));
        items.push(m('frac := (L_b - L_p)/(L_r - L_p) ='));
        items.push(m(`corch := ${Mp} - (${Mp} - M_07)*frac = tonf*m`));
        items.push(m('Mn_0 := C_b*corch = tonf*m'));
        items.push(m(`Mn_ltb := min(Mn_0, ${Mp}) = tonf*m`));
      } else {
        items.push(t('L_b > L_r → LTB ELÁSTICO: se vuelca sin haber fluido (Ecs. F2-3 y F2-4).'));
        items.push(m('L_b > L_r ='));
        items.push(m('esb := L_b/r_ts ='));
        items.push(m('q_f := esb^2 ='));
        items.push(m('F_cr := C_b*pi^2*E/q_f*sqrt(1 + 0.078*rz*q_f) = kgf/cm^2'));
        items.push(m(`Mn_0 := F_cr*${S} = tonf*m`));
        items.push(m(`Mn_ltb := min(Mn_0, ${Mp}) = tonf*m`));
      }
      // Pandeo local del ala (Sec. F3.2). Faltaba entero: con el ala no compacta
      // la hoja escribía el M_n del LTB y el contraste contra el motor la habría
      // rechazado — no había caso que lo recorriera.
      const alaF2 = cFlex[0];
      if (alaF2.clase === 'compacta') {
        items.push(t('Ala compacta (F3.1): el pandeo local del ala no aplica.'));
        items.push(m(`${Mn} := Mn_ltb = tonf*m`));
      } else if (alaF2.clase === 'no-compacta') {
        items.push(t('Ala NO compacta: Ec. F3-1, la recta entre M_p y 0,7·F_y·S_x.'));
        items.push(m(`lamr_fI := ${sigCoef(alaF2.lambdar, material.E, material.Fy)} =`));
        items.push(
          m(`Mn_flb := ${Mp} - (${Mp} - M_07)*(lam_fala - lam_pf)/(lamr_fI - lam_pf) = tonf*m`)
        );
        items.push(m(`${Mn} := min(Mn_ltb, Mn_flb) = tonf*m`));
      } else {
        items.push(t('Ala ESBELTA: Ec. F3-2, con el k_c del User Note de la Tabla B4.1.'));
        items.push(m('k_cI := min(0.76, max(0.35, 4/sqrt(lam_falma))) ='));
        items.push(m(`Mn_flb := 0.9*E*k_cI*${S}/lam_fala^2 = tonf*m`));
        items.push(m(`${Mn} := min(Mn_ltb, Mn_flb) = tonf*m`));
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
      // La pared comprimida y el canto del módulo cambian con el eje. En el
      // eje débil los papeles se invierten: la pared B pasa a ser el «alma» y
      // la H el «ala», y el radio que usa el LTB de F7.4 es el del OTRO eje.
      const bPlano = eje === 'x' ? 'b_w' : 'h_w'; // ala comprimida
      const hPlano = eje === 'x' ? 'h_w' : 'b_w'; // alma
      const canto = eje === 'x' ? 'H' : 'B';
      const Iej = eje === 'x' ? 'I_x' : 'I_y';
      const radioLtb = eje === 'x' ? 'r_y' : 'r_x';
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
        // Ec. F7-2 de la edición 22: la interpolación en λ entre λ_p y λ_r de
        // la Tabla B4.1b. La forma con coeficientes tabulados
        // (3,57·λ·√(F_y/E) − 4,0) es la de 360-10 y daba 0,04 % de diferencia
        // contra el motor — suficiente para fallar un ancla.
        items.push(t('Ala no compacta: Ec. F7-2, la recta entre λ_p y λ_r, con su tope M_p.'));
        items.push(m(`lamr_f${s} := ${sigCoef(cFlex[0].lambdar, material.E, material.Fy)} =`));
        items.push(
          m(
            `${Mn} := min(${Mp}, ${Mp} - (${Mp} - F_y*${S})*((${lamComp} - lam_pf)/(lamr_f${s} - lam_pf))) = tonf*m`
          )
        );
      } else if (f.gobierna === 'WLB' && f.Rpg === undefined) {
        items.push(t('Alma no compacta: Ec. F7-6, la misma recta con los límites del alma.'));
        items.push(m(`lamr_w${s} := ${sigCoef(cFlex[1].lambdar, material.E, material.Fy)} =`));
        items.push(
          m(
            `${Mn} := min(${Mp}, ${Mp} - (${Mp} - F_y*${S})*((${lamAlma} - lam_pw)/(lamr_w${s} - lam_pw))) = tonf*m`
          )
        );
      } else if (f.gobierna === 'WLB') {
        // Ec. F7-7, con el R_pg de la F5-6 y a_w = 2·h·t/(b·t).
        items.push(t('Alma esbelta: Ec. F7-7, con el R_pg de la Ec. F5-6.'));
        items.push(m(`aw${s} := 2*${hPlano}*t_d/(${bPlano}*t_d) =`));
        items.push(
          m(
            `Rpg${s} := min(1, 1 - (min(aw${s},10)/(1200 + 300*min(aw${s},10)))*(${lamAlma} - 5.7*sqrt(E/F_y))) =`
          )
        );
        items.push(m(`${Mn} := Rpg${s}*F_y*${S} = tonf*m`));
      } else if (f.gobierna === 'LTB') {
        items.push(t('Ecs. F7-10 y F7-11, y la rama de F7.4 que corresponde:'));
        items.push(m(`Lp_h${s} := 0.13*E*${radioLtb}*sqrt(J*A_g)/${Mp} = cm`));
        items.push(m(`Lr_h${s} := 2*E*${radioLtb}*sqrt(J*A_g)/(0.7*F_y*${S}) = cm`));
        items.push(
          t(
            f.zona === 'inelastica'
              ? 'L_p < L_b ≤ L_r → Ec. F7-8, con su tope M_p.'
              : 'L_b > L_r → Ec. F7-9, el LTB elástico del tubo.'
          )
        );
        items.push(
          m(
            f.zona === 'inelastica'
              ? `${Mn} := min(${Mp}, C_b*(${Mp} - (${Mp} - 0.7*F_y*${S})*((L_b - Lp_h${s})/(Lr_h${s} - Lp_h${s})))) = tonf*m`
              : `${Mn} := min(${Mp}, 2*E*C_b*sqrt(J*A_g)/(L_b/${radioLtb})) = tonf*m`
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
    // El coeficiente de abolladura se ESCRIBE, no se copia. Antes la hoja traía
    // `C_v := <literal>` del motor, así que las ramas de la Sec. G2.2 —que son
    // justo lo que la planilla viga-hss-flexion ancla en G4— no tenían segunda
    // implementación.
    if (v.phiV === 1) {
      items.push(t('G2.1(a): con h/t_w ≤ 2,24·√(E/F_y) el phi_v sube a 1,00 y la Ec. G2-2 da C_v1 = 1.'));
      items.push(m('lam_v <= 2.24*sqrt(E/F_y) ='));
      items.push(m('phi_v := 1.00'));
      items.push(m('C_v := 1'));
    } else if (geom.familia === 'I') {
      // Alma sin atiesadores: k_v = 5,34 por G2.1(b)(1).
      items.push(t('Fuera de G2.1(a): phi_v = 0,90 y entra C_v1. Alma SIN atiesadores → k_v = 5,34.'));
      items.push(m('lam_v > 2.24*sqrt(E/F_y) ='));
      items.push(m('phi_v := 0.90'));
      items.push(m('k_v := 5.34'));
      items.push(m('rkv := 1.1*sqrt(k_v*E/F_y) ='));
      if (v.Cv >= 1) {
        items.push(t('λ ≤ 1,1·√(k_v·E/F_y) → el alma fluye antes de abollar (Ec. G2-3).'));
        items.push(m('lam_v <= rkv ='));
        items.push(m('C_v := 1'));
      } else {
        items.push(t('λ > 1,1·√(k_v·E/F_y) → abolladura inelástica, Ec. G2-4.'));
        items.push(m('lam_v > rkv ='));
        items.push(m('C_v := rkv/lam_v ='));
      }
    } else {
      // G4 manda a la G2.2, cuyo C_v2 tiene TRES ramas. k_v = 5 por G4.
      items.push(t('G4 con phi_v = 0,90 y k_v = 5; el C_v2 sale de la Sec. G2.2, que tiene tres ramas.'));
      items.push(m('phi_v := 0.90'));
      items.push(m('k_v := 5'));
      items.push(m('rkv := 1.1*sqrt(k_v*E/F_y) ='));
      items.push(m('rkv2 := 1.37*sqrt(k_v*E/F_y) ='));
      if (v.Cv >= 1) {
        items.push(t('λ ≤ 1,1·√(k_v·E/F_y) → sin abolladura, Ec. G2-9.'));
        items.push(m('lam_v <= rkv ='));
        items.push(m('C_v := 1'));
      } else if (v.lambda <= 1.37 * Math.sqrt((5 * material.E) / material.Fy)) {
        items.push(t('1,1·√(k_v·E/F_y) < λ ≤ 1,37·√(k_v·E/F_y) → abolladura inelástica, Ec. G2-10.'));
        items.push(m('lam_v > rkv ='));
        items.push(m('lam_v <= rkv2 ='));
        items.push(m('C_v := rkv/lam_v ='));
      } else {
        items.push(t('λ > 1,37·√(k_v·E/F_y) → abolladura elástica, Ec. G2-11.'));
        items.push(m('lam_v > rkv2 ='));
        items.push(m('C_v := 1.51*k_v*E/(lam_v^2*F_y) ='));
      }
    }
    items.push(t('Ec. G2-1 en el perfil I y Ec. G4-1 en el tubo — misma forma:'));
    items.push(m('Rd_v := phi_v*0.6*F_y*A_w*C_v = tonf'));
    if (hayDemandas) {
      items.push(m('u_v := V_u/Rd_v ='));
      pushUso('u_v <= 1 =', demandas.Vu / v.phiVn, 'corte');
    }
  }

  // ── Interacción (Sec. H1) ──
  if (r.interaccion) {
    // H1.1 es con COMPRESIÓN y H1.2 con TRACCIÓN; las dos usan las mismas
    // Ecs. H1-1a y H1-1b y lo único que cambia es qué es P_c. El término axial
    // hay que tomarlo del bloque que de verdad corrió: escribir siempre `u_c`
    // dejaba la hoja rota por el camino de tracción, porque ese símbolo lo
    // define el bloque de compresión.
    const enTraccion = demandas.Tu > 0 && demandas.Pu <= 0;
    const uAxial = enTraccion ? 'u_t' : 'u_c';
    items.push(banner(`${++n} · INTERACCIÓN (Sec. H1)`));
    items.push(
      t(
        enTraccion
          ? 'H1.2, flexión con TRACCIÓN: las mismas Ecs. H1-1a y H1-1b, con P_c del Cap. D.'
          : 'H1.1, flexión con compresión. La frontera está en P_r/P_c = 0,2.'
      )
    );
    items.push(
      t(
        r.interaccion.ecuacion === 'H1-1a'
          ? 'P_r/P_c ≥ 0,2 → rige la Ec. H1-1a, con el crédito 8/9 sobre la flexión.'
          : 'P_r/P_c < 0,2 → rige la Ec. H1-1b, con el axial a la mitad.'
      )
    );
    items.push(m(r.interaccion.ecuacion === 'H1-1a' ? `${uAxial} >= 0.2 =` : `${uAxial} < 0.2 =`));
    // El término del eje débil solo entra si ese bloque llegó a definir u_fy.
    const sumaM = r.flexionY && !r.flexionY.fueraDeAlcance ? '(u_f + u_fy)' : 'u_f';
    items.push(
      m(
        r.interaccion.ecuacion === 'H1-1a'
          ? `u_tot := ${uAxial} + (8/9)*${sumaM} =`
          : `u_tot := ${uAxial}/2 + ${sumaM} =`
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

  // ── Lo que la hoja no cubre ──
  // Se dice, no se omite: antes los estados fuera de alcance se saltaban en
  // silencio y la memoria parecía completa.
  if (r.noVerificados.length > 0) {
    items.push(banner('LO QUE ESTA MEMORIA NO CUBRE'));
    items.push(
      t('Se pidieron estos estados límite y la herramienta no pudo verificarlos:')
    );
    for (const nv of r.noVerificados) items.push(t(`· ${nv.nombre} — ${nv.motivo}`));
  }

  // ── Contraste contra el motor ──
  //
  // LA TOLERANCIA ES RELATIVA Y DURA, y eso es deliberado. Estas filas usaban
  // tolerancias absolutas heredadas de la convención de las planillas
  // (`< 0,05 tonf·m`), que existe para contrastar contra un número PUBLICADO y
  // redondeado. Acá los dos lados están a precisión completa: son dos
  // implementaciones de la misma ecuación, y cualquier diferencia por encima
  // del ruido de punto flotante es una discrepancia real.
  //
  // Con la tolerancia vieja, las Ecs. F7-2/F7-6 escritas en la forma de 360-10
  // daban 0,008 tonf·m de diferencia sobre un límite de 0,05: pasaban. Con
  // 1e-9 relativo, 4·10⁻⁴ salta el mismo día.
  //
  // El literal va a 12 cifras y no a 6: con 6 el redondeo del propio número de
  // referencia (~1e-6) sería mayor que la tolerancia y fallaría contra sí mismo.
  const contraste = (expr: string, valor: number, unidad = '') => {
    const ref = unidad ? `(${sig(valor, 12)} ${unidad})` : sig(valor, 12);
    items.push(m(`abs(${expr}/${ref} - 1) < 1e-9 =`));
  };

  items.push(banner('CONTRASTE CONTRA LA HERRAMIENTA'));
  items.push(
    t('Cada número que reportó el motor TS, contra el que recalcula esta hoja con mathjs.')
  );
  items.push(t('Tolerancia relativa de 1e-9: los dos lados están a precisión completa, así que'));
  items.push(t('cualquier diferencia por encima del ruido de punto flotante es real.'));
  if (r.compresion) {
    contraste('F_e', r.compresion.Fe, 'kgf/cm^2');
    contraste('F_n', r.compresion.Fn, 'kgf/cm^2');
    // El área efectiva de E7, que hasta ahora la hoja copiaba del motor en vez
    // de calcularla: sin esta fila el contraste comparaba el motor consigo mismo.
    contraste('A_ec', r.compresion.Ae, 'cm^2');
    contraste('Rd_c', r.compresion.phiPn / TONF, 'tonf');
  }
  if (r.traccion) {
    contraste('Rd_t', r.traccion.phiPn / TONF, 'tonf');
  }
  if (r.flexionX && !r.flexionX.fueraDeAlcance) {
    contraste('M_p', r.flexionX.Mp / TONF_M, 'tonf*m');
    // L_p y L_r solo existen en la hoja cuando el perfil I los desarrolla; el
    // HSS los escribe como Lp_h/Lr_h y solo si gobierna el LTB.
    if (geom.familia === 'I' && r.flexionX.Lp !== undefined) {
      contraste('L_p', r.flexionX.Lp, 'cm');
      contraste('L_r', r.flexionX.Lr ?? 0, 'cm');
    }
    // Los factores de F4 y F5 son lo nuevo de esta cadena: si los dos motores
    // discrepan, discrepan acá antes que en el momento resultante.
    if (r.flexionX.Rpc !== undefined) {
      contraste('R_pc', r.flexionX.Rpc);
      contraste('r_t', r.flexionX.rt ?? 0, 'cm');
    }
    if (r.flexionX.Rpg !== undefined && geom.familia === 'I') {
      contraste('R_pg', r.flexionX.Rpg);
      contraste('r_t', r.flexionX.rt ?? 0, 'cm');
    }
    contraste('Rd_f', r.flexionX.phiMn / TONF_M, 'tonf*m');
  }
  if (r.flexionY && !r.flexionY.fueraDeAlcance) {
    contraste('Rd_fy', r.flexionY.phiMn / TONF_M, 'tonf*m');
  }
  if (r.corte && !r.corte.fueraDeAlcance) {
    // C_v es la rama de la Sec. G2.2 que la hoja ahora deriva en vez de copiar.
    contraste('C_v', r.corte.Cv);
    contraste('Rd_v', r.corte.phiVn / TONF, 'tonf');
  }
  if (r.interaccion) {
    contraste('u_tot', r.interaccion.u);
  }
  if (r.sismico) {
    contraste('F_ye', r.sismico.Fye, 'kgf/cm^2');
    contraste('T_ye', r.sismico.Tye / TONF, 'tonf');
    contraste('P_ne', r.sismico.Pne / TONF, 'tonf');
    contraste('lam_md', r.sismico.lambdaMd);
    contraste('lam_nch', r.sismico.lambdaGlobal);
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
//
// La mecánica vive en `../canvas-handoff`, compartida con las demás
// herramientas que generan hojas. Acá solo queda el nombre del archivo.

export { abrirEnCanvas };

/** Descarga la memoria como .json — el mismo formato que `verify:planilla` lee. */
export function descargarMemoria(memoria: Memoria): void {
  descargarHoja(memoria, 'memoria-seccion.json');
}
