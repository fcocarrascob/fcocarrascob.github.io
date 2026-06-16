// Catálogo de plantillas cargables en el canvas (galería estilo SMath).
// Cada plantilla usa el mismo formato {version, regions} de export/import.
// Las planillas se disponen en UNA columna (orden de lectura arriba→abajo) para
// que el scope compartido se resuelva sin sorpresas (evita el cruce de columnas
// del orden por filas de evaluateSheet).

import type { Region, RegionKind } from './worksheet';

export interface Template {
  id: string;
  titulo: string;
  norma: string;
  descripcion: string;
  regions: Region[];
}

interface Item {
  kind: RegionKind;
  src: string;
}
const m = (src: string): Item => ({ kind: 'math', src });
const t = (src: string): Item => ({ kind: 'text', src });
const p = (src: string): Item => ({ kind: 'program', src });

/**
 * Coloca los ítems en una columna, calculando `y` según el alto de cada región
 * (las de programa/multilínea ocupan más). Devuelve regiones listas para la hoja.
 */
function layout(idPrefix: string, x: number, y0: number, items: Item[]): Region[] {
  let y = y0;
  return items.map((it, i) => {
    const region: Region = { id: `${idPrefix}-${i}`, kind: it.kind, x, y, src: it.src };
    const lines = it.src.split('\n').length;
    y += lines > 1 ? lines * 22 + 28 : 46;
    return region;
  });
}

// --- Viga de hormigón armado: flexión + cortante (ACI 318-25, Cap. 9) ---------
// Truco de unidades para las fórmulas empíricas con √f'c: se define `sfc` como la
// "tensión raíz" √f'c en MPa (magnitud extraída con number(), reatada a MPa). Así
// 0.25*sfc/fy es adimensional y 0.66*sfc*b*d es fuerza. La planilla acepta f'c en
// kgf/cm² o MPa indistintamente porque number(fc,"MPa") convierte.
const vigaItems: Item[] = [
  t('VIGA DE HORMIGÓN ARMADO — Flexión y cortante · ACI 318-25 (Cap. 9)'),

  t('Materiales'),
  m('fc := 250 kgf/cm^2'),
  m('fy := 4200 kgf/cm^2'),
  m('fyt := 4200 kgf/cm^2'),
  m('Es := 2.1e6 kgf/cm^2'),
  m('lambda := 1'),

  t('Geometría  ·  b: ancho bw  ·  d: peralte efectivo (1 capa, dt = d)'),
  m('b := 30 cm'),
  m('h := 50 cm'),
  m('d := 45 cm'),

  t('Solicitaciones mayoradas (Sec. 5.3)'),
  m('Mu := 18 tonf*m'),
  m('Vu := 15 tonf'),

  t('Refuerzo provisto  ·  As: 6φ16  ·  estribo Eφ10 de 2 ramas'),
  m('As := 12.06 cm^2'),
  m('Av := 1.57 cm^2'),
  m('s := 15 cm'),

  t("Auxiliar: sfc = √f'c como tensión [MPa]  (convierte f'c a MPa)"),
  p('sfc :=\n    fcm := number(fc, "MPa")\n    return sqrt(fcm) * 1 MPa'),
  m('ety := fy/Es ='),

  t('━━ FLEXIÓN (Cap. 22.2) ━━'),
  p('beta_1 :=\n    fcm := number(fc, "MPa")\n    if fcm <= 28\n        return 0.85\n    else if fcm >= 56\n        return 0.65\n    return 0.85 - 0.05*(fcm - 28)/7'),
  m('a := As*fy/(0.85*fc*b) = cm'),
  m('c := a/beta_1 = cm'),
  m('et := 0.003*(d - c)/c ='),
  p('phi :=\n    if et >= ety + 0.003\n        return 0.9\n    else if et <= ety\n        return 0.65\n    return 0.65 + 0.25*(et - ety)/0.003'),
  m('Mn := As*fy*(d - a/2) = tonf*m'),
  m('phiMn := phi*Mn = tonf*m'),
  t('Resistencia a flexión:  φMn ≥ Mu'),
  m('phiMn >= Mu ='),
  m('Asmin := max(0.25*sfc/fy, 1.4 MPa/fy)*b*d = cm^2'),
  t('Refuerzo mínimo (Sec. 9.6.1.2):  As ≥ As,mín'),
  m('As >= Asmin ='),
  t('Ductilidad (Sec. 9.3.3.1):  εt ≥ εty + 0.003'),
  m('et >= ety + 0.003 ='),

  t('━━ CORTANTE (Cap. 22.5) ━━'),
  m('rho_w := As/(b*d) ='),
  m('Vc := 0.66*lambda*rho_w^(1/3)*sfc*b*d = tonf'),
  m('Vs := Av*fyt*d/s = tonf'),
  m('Vn := Vc + Vs = tonf'),
  m('phiVn := 0.75*Vn = tonf'),
  t('Resistencia a cortante:  φVn ≥ Vu'),
  m('phiVn >= Vu ='),
  m('Vsmax := 0.66*sfc*b*d = tonf'),
  t('Tope de Vs (Sec. 22.5.10.5.3):  Vs ≤ Vs,máx'),
  m('Vs <= Vsmax ='),
  m('Avmin := max(0.062*sfc, 0.35 MPa)*b*s/fyt = cm^2'),
  t('Estribo mínimo (Sec. 9.6.3.4):  Av ≥ Av,mín'),
  m('Av >= Avmin ='),
  p('smaxv :=\n    lim := 0.33*sfc*b*d\n    if Vs <= lim\n        return min(d/2, 600 mm)\n    return min(d/4, 300 mm)'),
  t('Espaciamiento máx (Tabla 9.7.6.2.2):  s ≤ s,máx'),
  m('s <= smaxv ='),
];

const vigaFlexionCorte: Template = {
  id: 'viga-flexion-corte',
  titulo: 'Viga — Flexión y cortante (ACI 318-25)',
  norma: 'ACI 318-25 Cap. 9',
  descripcion: 'Diseño de viga de hormigón armado a flexión y cortante con todos los chequeos.',
  regions: layout('viga', 40, 32, vigaItems),
};

export const TEMPLATES: Template[] = [vigaFlexionCorte];
