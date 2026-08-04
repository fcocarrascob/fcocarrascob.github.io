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
  if (demandas.Pu > 0) items.push(m(`P_u := ${sig(demandas.Pu / TONF)} tonf`));
  if (demandas.Tu > 0) items.push(m(`T_u := ${sig(demandas.Tu / TONF)} tonf`));
  if (demandas.Mux > 0) items.push(m(`M_ux := ${sig(demandas.Mux / TONF_M)} tonf*m`));
  if (demandas.Muy > 0) items.push(m(`M_uy := ${sig(demandas.Muy / TONF_M)} tonf*m`));
  if (demandas.Vu > 0) items.push(m(`V_u := ${sig(demandas.Vu / TONF)} tonf`));

  // ── Clasificación ──
  // Cada tabla se emite SOLO si su estado límite se verificó: la B4.1a es la de
  // compresión uniforme y la B4.1b la de flexión, y no dicen lo mismo. Un alma
  // puede ser esbelta a compresión y compacta a flexión — le pasa a la viga
  // W460×74 de la planilla viga-ltb.
  const cComp = r.clasificacion.compresion;
  const cFlex = r.clasificacion.flexion;
  const hayClasificacion = r.compresion || (r.flexionX && !r.flexionX.fueraDeAlcance);
  if (hayClasificacion) items.push(banner('1 · CLASIFICACIÓN DE LA SECCIÓN'));

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
    items.push(banner('2 · COMPRESIÓN (Cap. E)'));
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

  // ── Flexión ──
  if (r.flexionX && !r.flexionX.fueraDeAlcance && geom.familia === 'I') {
    const f = r.flexionX;
    items.push(banner('3 · FLEXIÓN EJE FUERTE (Cap. F)'));
    items.push(t('Ec. F2-1:'));
    items.push(m('M_p := F_y*Z_x = tonf*m'));
    items.push(m('Rd_p := phi*M_p = tonf*m'));
    items.push(t('Ecs. F2-5 y F2-6, con c = 1 (perfil I doblemente simétrico):'));
    items.push(m('L_p := 1.76*r_y*sqrt(E/F_y) = cm'));
    items.push(m('rz := J*1/(S_x*h_o) ='));
    items.push(
      m('L_r := 1.95*r_ts*(E/(0.7*F_y))*sqrt(rz + sqrt(rz^2 + 6.76*(0.7*F_y/E)^2)) = cm')
    );
    items.push(m('M_07 := 0.7*F_y*S_x = tonf*m'));
    if (f.zona === 'plastica') {
      items.push(t('L_b ≤ L_p → zona plástica: M_n = M_p, el LTB no roba nada.'));
      items.push(m('L_b <= L_p ='));
      items.push(m('M_n := M_p = tonf*m'));
    } else if (f.zona === 'inelastica') {
      items.push(t('L_p < L_b ≤ L_r → LTB INELÁSTICO: rige la recta de la Ec. F2-2.'));
      items.push(m('L_b > L_p ='));
      items.push(m('L_b <= L_r ='));
      items.push(m('frac := (L_b - L_p)/(L_r - L_p) ='));
      items.push(m('corch := M_p - (M_p - M_07)*frac = tonf*m'));
      items.push(m('Mn_0 := C_b*corch = tonf*m'));
      items.push(m('M_n := min(Mn_0, M_p) = tonf*m'));
    } else {
      items.push(t('L_b > L_r → LTB ELÁSTICO: se vuelca sin haber fluido (Ecs. F2-3 y F2-4).'));
      items.push(m('L_b > L_r ='));
      items.push(m('esb := L_b/r_ts ='));
      items.push(m('q_f := esb^2 ='));
      items.push(m('F_cr := C_b*pi^2*E/q_f*sqrt(1 + 0.078*rz*q_f) = kgf/cm^2'));
      items.push(m('Mn_0 := F_cr*S_x = tonf*m'));
      items.push(m('M_n := min(Mn_0, M_p) = tonf*m'));
    }
    items.push(m('Rd_f := phi*M_n = tonf*m'));
    if (demandas.Mux > 0) {
      items.push(m('M_r := B_1*M_ux = tonf*m'));
      items.push(m('u_f := M_r/Rd_f ='));
      pushUso(
        'u_f <= 1 =',
        (estabilidad.B1 * demandas.Mux) / f.phiMn,
        'flexión en el eje fuerte'
      );
    }
  }

  // ── Interacción ──
  if (r.interaccion) {
    items.push(banner('4 · INTERACCIÓN (Sec. H1)'));
    items.push(t('H1.1 parte en P_r/P_c = 0,2: por encima rige H1-1a, por debajo H1-1b.'));
    items.push(m(r.interaccion.ecuacion === 'H1-1a' ? 'u_c >= 0.2 =' : 'u_c < 0.2 ='));
    items.push(
      m(
        r.interaccion.ecuacion === 'H1-1a'
          ? 'u_tot := u_c + (8/9)*u_f ='
          : 'u_tot := u_c/2 + u_f ='
      )
    );
    pushUso('u_tot <= 1 =', r.interaccion.u, 'la interacción del Cap. H');
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
  if (r.flexionX && !r.flexionX.fueraDeAlcance && geom.familia === 'I') {
    items.push(m(`abs(M_p - ${sig(r.flexionX.Mp / TONF_M)} tonf*m) < 0.05 tonf*m =`));
    if (r.flexionX.Lp !== undefined) {
      items.push(m(`abs(L_p - ${sig(r.flexionX.Lp)} cm) < 0.5 cm =`));
    }
    if (r.flexionX.Lr !== undefined) {
      items.push(m(`abs(L_r - ${sig(r.flexionX.Lr)} cm) < 0.5 cm =`));
    }
    items.push(m(`abs(Rd_f - ${sig(r.flexionX.phiMn / TONF_M)} tonf*m) < 0.05 tonf*m =`));
  }
  if (r.interaccion) {
    items.push(m(`abs(u_tot - ${sig(r.interaccion.u)}) < 0.005 =`));
  }

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
