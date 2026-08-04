// ─────────────────────────────────────────────────────────────────────────────
// Orquestador del verificador de secciones. Espeja runPlaca() de
// placaBaseChecks.ts: arma propiedades, clasificación, capacidades y la lista
// de CheckResult, más los avisos.
//
// Los tres modos de la herramienta (capacidad, demanda, comparador) son ESTE
// motor: capacidad es demanda con las demandas en cero.
//
// Puro. Unidades: kgf y cm; momentos en kgf·cm.
// ─────────────────────────────────────────────────────────────────────────────

import { check, type CheckResult } from '../checks';
import { clasificar } from './clasificacion';
import { verificarCompresion, type ResCompresion } from './compresion';
import { verificarCorte, type ResCorte } from './corte';
import { verificarFlexionX, verificarFlexionY, type ResFlexion } from './flexion';
import { verificarInteraccion, type ResInteraccion } from './interaccion';
import { resolverPropiedades, type PropiedadesResueltas } from './propiedades';
import { verificarSismico, type ResSismico } from './sismico';
import { verificarTraccion } from './traccion';
import type { Clasificacion, EntradaVerificacion, EstadoLimite, Propiedades } from './tipos';

const TONF = 1000; // kgf
const TONF_M = 100000; // kgf·cm

/** Apuntes del sitio que respaldan cada capítulo. */
const REF = {
  B: 'aisc360-22-capB-requisitos-de-diseno',
  D: 'aisc360-22-capD-traccion',
  E: 'aisc360-22-capE-compresion',
  F: 'aisc360-22-capF-flexion',
  G: 'aisc360-22-capG-corte',
  H: 'aisc360-22-capH-fuerzas-combinadas',
} as const;

export interface ResultadoSeccion {
  propiedades: Propiedades;
  resueltas: PropiedadesResueltas;
  clasificacion: Clasificacion;
  compresion?: ResCompresion;
  flexionX?: ResFlexion;
  flexionY?: ResFlexion;
  corte?: ResCorte;
  interaccion?: ResInteraccion;
  sismico?: ResSismico;
  traccion?: { phiPn: number; gobierna: string; avisos: string[] };
  checks: CheckResult[];
  warnings: string[];
  okGlobal: boolean;
  /** El uso más alto de todos los checks corridos. */
  usoMaximo: number;
  /** Nombre de la verificación que gobierna. */
  gobierna: string;
}

const TODOS: EstadoLimite[] = [
  'compresion',
  'traccion',
  'flexion-x',
  'flexion-y',
  'corte',
  'interaccion',
  'sismico',
];

export function verificarSeccion(entrada: EntradaVerificacion): ResultadoSeccion {
  const { geom, material, estabilidad, demandas, declaradas, traccion: datosTraccion } = entrada;
  const estados = entrada.estados ?? TODOS;
  const corre = (e: EstadoLimite) => estados.includes(e);

  const resueltas = resolverPropiedades(geom, declaradas);
  const props = resueltas.props;
  const clas = clasificar(geom, material);

  const checks: CheckResult[] = [];
  const warnings: string[] = [];

  // El área de paredes rectas sobreestima la real del HSS, que lleva radios de
  // esquina. Es el ítem abierto de AUDIT.md sobre el □150×150×8.
  if ((geom.familia === 'HSS-R' || geom.familia === 'HSS-C') && !declaradas?.Ag) {
    warnings.push(
      'A_g se calculó con paredes rectas, sin los radios de esquina: SOBREESTIMA el área real (≈ +4 % en un HSS 4×4×¼). Declará el A_g de catálogo.'
    );
  }
  for (const f of resueltas.fueraDeTolerancia) {
    warnings.push(
      `${f.clave}: las planchas dan ${(f.dif * 100).toFixed(1)} % respecto del valor declarado, más de lo que explican los redondeos de unión. Revisá la geometría o la fila de catálogo.`
    );
  }

  // ── Compresión (Cap. E) ──
  let compresion: ResCompresion | undefined;
  if (corre('compresion')) {
    compresion = verificarCompresion(geom, material, props, estabilidad, clas);
    warnings.push(...compresion.avisos);
    const modo =
      compresion.gobierna === 'torsional'
        ? 'pandeo torsional (E4)'
        : compresion.gobierna === 'flexional-x'
          ? 'pandeo por flexión, eje fuerte (E3)'
          : 'pandeo por flexión, eje débil (E3)';
    // Se emite siempre: con demanda 0 el ratio es 0 y el check ES la capacidad,
    // que es justo lo que muestra el modo «capacidad» de la herramienta.
    checks.push(
      check(
        'compresion',
        'Compresión (E3/E4)',
        demandas.Pu / TONF,
        compresion.phiPn / TONF,
        'tonf',
        `Gobierna el ${modo}. λ = ${Math.max(compresion.lambdaX, compresion.lambdaY).toFixed(1)}, F_e = ${compresion.Fe.toFixed(0)} kgf/cm², F_n = ${compresion.Fn.toFixed(0)} kgf/cm².`,
        REF.E
      )
    );
  }

  // ── Tracción (Sec. D2) ──
  let traccion: ResultadoSeccion['traccion'];
  if (corre('traccion')) {
    const t = verificarTraccion(material, props, datosTraccion);
    traccion = { phiPn: t.phiPn, gobierna: t.gobierna, avisos: t.avisos };
    warnings.push(...t.avisos);
    checks.push(
      check(
        'traccion',
        'Tracción (D2)',
        demandas.Tu / TONF,
        t.phiPn / TONF,
        'tonf',
        `Gobierna ${t.gobierna === 'rotura' ? 'la rotura del área neta efectiva (D2-2)' : 'la fluencia del área bruta (D2-1)'}.`,
        REF.D
      )
    );
  }

  // ── Flexión eje fuerte (Cap. F) ──
  let flexionX: ResFlexion | undefined;
  if (corre('flexion-x')) {
    flexionX = verificarFlexionX(geom, material, props, estabilidad, clas);
    warnings.push(...flexionX.avisos);
    if (flexionX.fueraDeAlcance) {
      warnings.push('La flexión en el eje fuerte quedó fuera de alcance: el resultado no es utilizable.');
    } else {
      checks.push(
        check(
          'flexion-x',
          'Flexión eje fuerte (F2/F3/F7/F8)',
          (estabilidad.B1 * demandas.Mux) / TONF_M,
          flexionX.phiMn / TONF_M,
          'tonf·m',
          detalleFlexion(flexionX, estabilidad.Cb),
          REF.F
        )
      );
    }
  }

  // ── Flexión eje débil ──
  let flexionY: ResFlexion | undefined;
  if (corre('flexion-y')) {
    flexionY = verificarFlexionY(geom, material, props, clas);
    warnings.push(...flexionY.avisos);
    checks.push(
      check(
        'flexion-y',
        'Flexión eje débil (F6/F7)',
        demandas.Muy / TONF_M,
        flexionY.phiMn / TONF_M,
        'tonf·m',
        `Gobierna ${flexionY.gobierna === 'FLB' ? 'el pandeo local del ala' : 'la fluencia'}.`,
        REF.F
      )
    );
  }

  // ── Corte (Cap. G) ──
  let corte: ResCorte | undefined;
  if (corre('corte')) {
    corte = verificarCorte(geom, material, props);
    warnings.push(...corte.avisos);
    if (!corte.fueraDeAlcance) {
      checks.push(
        check(
          'corte',
          'Corte (G2/G4)',
          demandas.Vu / TONF,
          corte.phiVn / TONF,
          'tonf',
          `A_w = ${corte.Aw.toFixed(1)} cm², h/t = ${corte.lambda.toFixed(1)}, C_v = ${corte.Cv.toFixed(3)}, φ_v = ${corte.phiV.toFixed(2)}.`,
          REF.G
        )
      );
    }
  }

  // ── Interacción (Sec. H1) ──
  let interaccion: ResInteraccion | undefined;
  if (
    corre('interaccion') &&
    compresion &&
    flexionX &&
    !flexionX.fueraDeAlcance &&
    demandas.Pu > 0 &&
    (demandas.Mux > 0 || demandas.Muy > 0)
  ) {
    interaccion = verificarInteraccion(
      demandas.Pu,
      compresion.phiPn,
      estabilidad.B1 * demandas.Mux,
      flexionX.phiMn,
      demandas.Muy,
      flexionY ? flexionY.phiMn : 0
    );
    checks.push(
      check(
        'interaccion',
        `Interacción (${interaccion.ecuacion})`,
        interaccion.u,
        1,
        '—',
        `u_P = ${interaccion.uP.toFixed(3)}, u_Mx = ${interaccion.uMx.toFixed(3)}${interaccion.uMy > 0 ? `, u_My = ${interaccion.uMy.toFixed(3)}` : ''}. B₁ = ${estabilidad.B1.toFixed(2)}.`,
        REF.H
      )
    );
    if (estabilidad.B1 === 1) {
      warnings.push(
        'B₁ = 1,0 (default). Si hay carga transversal entre apoyos o el axial es alto, el momento de segundo orden es mayor — derivalo con el Apéndice 8.'
      );
    }
  }

  if (estabilidad.Cb === 1 && flexionX && flexionX.gobierna === 'LTB') {
    warnings.push(
      'C_b = 1,0 (default conservador). Derivarlo de la Ec. F1-1 con los cuartos del segmento no arriostrado sube la capacidad a LTB.'
    );
  }

  // ── Capa sísmica (NCh2369) ──
  let sismico: ResSismico | undefined;
  if (corre('sismico') && !compresion) {
    warnings.push(
      'Las verificaciones sísmicas necesitan la cadena de compresión (F_e y L_c/r): activá también «Compresión».'
    );
  }
  if (corre('sismico') && compresion) {
    sismico = verificarSismico(
      geom,
      material,
      props,
      compresion.Fe,
      Math.max(compresion.lambdaX, compresion.lambdaY),
      clas
    );
    warnings.push(...sismico.avisos);
    for (const l of sismico.limites) {
      checks.push(
        check(
          l.id,
          l.nombre,
          l.valor,
          l.limite,
          '—',
          `${l.ref}. Solo exigible si el miembro debe ser dúctil (típicamente una diagonal de arriostramiento) — la herramienta no puede saberlo, lo decidís vos al activar esta verificación.`
        )
      );
    }
  }

  const conDemanda = checks.filter((c) => Number.isFinite(c.ratio) && c.demanda > 0);
  const peor = conDemanda.reduce<CheckResult | null>(
    (a, b) => (a === null || b.ratio > a.ratio ? b : a),
    null
  );

  return {
    propiedades: props,
    resueltas,
    clasificacion: clas,
    compresion,
    flexionX,
    flexionY,
    corte,
    interaccion,
    sismico,
    traccion,
    checks,
    warnings,
    okGlobal: checks.every((c) => c.ok),
    usoMaximo: peor ? peor.ratio : 0,
    gobierna: peor ? peor.nombre : '—',
  };
}

function detalleFlexion(f: ResFlexion, Cb: number): string {
  const partes: string[] = [];
  if (f.Lp !== undefined && f.Lr !== undefined) {
    partes.push(`L_p = ${(f.Lp / 100).toFixed(2)} m, L_r = ${(f.Lr / 100).toFixed(2)} m`);
  }
  if (f.zona) {
    const z = f.zona === 'plastica' ? 'plástica' : f.zona === 'inelastica' ? 'inelástica' : 'elástica';
    partes.push(`zona ${z}`);
  }
  partes.push(`C_b = ${Cb.toFixed(3)}`);
  const modo =
    f.gobierna === 'LTB'
      ? 'pandeo lateral-torsional'
      : f.gobierna === 'FLB'
        ? 'pandeo local del ala'
        : f.gobierna === 'WLB'
          ? 'pandeo local del alma'
          : 'fluencia';
  return `Gobierna ${modo}. ${partes.join(', ')}.`;
}
