// ─────────────────────────────────────────────────────────────────────────────
// Orquestador del verificador de secciones. Espeja runPlaca() de
// placaBaseChecks.ts: arma propiedades, clasificación, capacidades y la lista
// de CheckResult, más los avisos.
//
// Los dos modos de la herramienta (capacidad y demanda) son ESTE motor:
// capacidad es demanda con las demandas en cero.
//
// El veredicto tiene TRES valores, no dos. `okGlobal` se calculaba como
// `checks.every(c => c.ok)`, pero los estados fuera de alcance no agregan su
// check al array: el `every` no veía la fila que faltaba y devolvía true. Un
// perfil armado de alma no compacta salía «pasa» sin haberse verificado a
// flexión. Ahora eso es `incompleto`, y lo que no se verificó viaja en
// `noVerificados` para que la UI pueda nombrarlo.
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
  NCH: 'nch2369-2025-cap08-estructuras-de-acero',
} as const;

/**
 * Un estado límite que se pidió y no se pudo verificar.
 *
 * Existe porque suprimir el check y devolver `okGlobal` calculado sobre los que
 * quedaron es mentir: el `every` no ve la fila que falta y responde «pasa».
 */
export interface EstadoNoVerificado {
  estado: EstadoLimite;
  nombre: string;
  motivo: string;
}

/**
 * `pasa` / `no-pasa` son el veredicto de siempre. `incompleto` es el tercero
 * que faltaba: se pidió un estado límite, la sección cae en una rama que la
 * herramienta no implementa, y el resultado NO puede pintarse verde aunque el
 * resto de los checks cierren.
 */
export type Veredicto = 'pasa' | 'no-pasa' | 'incompleto';

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
  /** Estados pedidos que no se pudieron verificar. Vacío es lo normal. */
  noVerificados: EstadoNoVerificado[];
  veredicto: Veredicto;
  /**
   * true solo si TODOS los checks de resistencia y esbeltez pasan Y no quedó
   * ningún estado sin verificar. Un `false` puede significar «no pasa» o
   * «no se pudo verificar»: para distinguirlos está `veredicto`.
   */
  okGlobal: boolean;
  /** El uso más alto de los checks de RESISTENCIA (las esbelteces no son usos). */
  usoMaximo: number;
  /** Nombre de la verificación de resistencia que gobierna. */
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
  const noVerificados: EstadoNoVerificado[] = [];

  // El área de paredes rectas sobreestima la real del HSS, que lleva radios de
  // esquina. Es el ítem abierto de AUDIT.md sobre el □150×150×8.
  if ((geom.familia === 'HSS-R' || geom.familia === 'HSS-C') && !declaradas?.Ag) {
    warnings.push(
      'A_g se calculó con paredes rectas, sin los radios de esquina: SOBREESTIMA el área real (≈ +4 % en un HSS 4×4×¼). Declara el A_g de catálogo.'
    );
  }
  for (const f of resueltas.fueraDeTolerancia) {
    warnings.push(
      `${f.clave}: las planchas dan ${(f.dif * 100).toFixed(1)} % respecto del valor declarado, más de lo que explican los redondeos de unión. Revisa la geometría o la fila de catálogo.`
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
      noVerificados.push({
        estado: 'flexion-x',
        nombre: 'Flexión eje fuerte (Cap. F)',
        motivo: flexionX.avisos[0] ?? 'La sección cae en una rama del Cap. F que no está implementada.',
      });
      warnings.push('La flexión en el eje fuerte quedó fuera de alcance: el resultado no es utilizable.');
    } else {
      checks.push(
        check(
          'flexion-x',
          // El rótulo nombra la sección que DE VERDAD resolvió el caso: con F4
          // y F5 en juego, una lista de todas las posibles ya no informa.
          `Flexión eje fuerte (Sec. ${flexionX.seccion})`,
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
        `Flexión eje débil (Sec. ${flexionY.seccion})`,
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
    if (corte.fueraDeAlcance) {
      noVerificados.push({
        estado: 'corte',
        nombre: 'Corte (Cap. G)',
        motivo: corte.avisos[0] ?? 'El corte de esta familia no está implementado.',
      });
    } else {
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
  //
  // H1.1 es flexión + COMPRESIÓN y H1.2 flexión + TRACCIÓN. Las dos usan las
  // MISMAS Ecs. H1-1a y H1-1b; lo que cambia es qué es P_c: la capacidad del
  // Cap. E en H1.1, la del Cap. D en H1.2. Antes solo corría la primera, así
  // que una diagonal traccionada con momento no recibía ninguna interacción.
  let interaccion: ResInteraccion | undefined;
  const hayMomento = demandas.Mux > 0 || demandas.Muy > 0;
  const enTraccion = demandas.Tu > 0 && demandas.Pu <= 0;
  if (corre('interaccion') && hayMomento && (demandas.Pu > 0 || enTraccion)) {
    // La capacidad axial que corresponde según el signo del axial.
    const axial = enTraccion
      ? { Pr: demandas.Tu, Pc: traccion?.phiPn, falta: 'Tracción', seccion: 'H1.2' as const }
      : { Pr: demandas.Pu, Pc: compresion?.phiPn, falta: 'Compresión', seccion: 'H1.1' as const };

    if (axial.Pc === undefined) {
      warnings.push(
        `La interacción ${axial.seccion} necesita la capacidad axial: activa también «${axial.falta}».`
      );
      noVerificados.push({
        estado: 'interaccion',
        nombre: `Interacción (${axial.seccion})`,
        motivo: `Falta la capacidad axial del estado «${axial.falta}», que la interacción usa como P_c.`,
      });
    } else if (!flexionX || flexionX.fueraDeAlcance) {
      noVerificados.push({
        estado: 'interaccion',
        nombre: `Interacción (${axial.seccion})`,
        motivo: flexionX
          ? 'La flexión en el eje fuerte quedó fuera de alcance, así que M_cx no existe.'
          : 'Falta la capacidad a flexión del eje fuerte: activa también «Flexión eje fuerte».',
      });
    } else {
      // H1-1 necesita la capacidad del eje débil si hay momento en ese eje, aunque
      // el usuario no haya marcado «flexión eje débil»: sin ella el término M_ry/M_cy
      // sería una división por cero disfrazada de falla.
      if (demandas.Muy > 0 && !flexionY) {
        flexionY = verificarFlexionY(geom, material, props, clas);
        warnings.push(
          'Se calculó la flexión en el eje débil aunque no estaba marcada: H1-1 la necesita porque hay M_uy.'
        );
      }
      // B₁ es un amplificador de segundo orden por compresión: en tracción el
      // axial ENDEREZA el miembro y no hay P-δ que amplificar.
      const amplif = enTraccion ? 1 : estabilidad.B1;
      interaccion = verificarInteraccion(
        axial.Pr,
        axial.Pc,
        amplif * demandas.Mux,
        flexionX.phiMn,
        demandas.Muy,
        flexionY ? flexionY.phiMn : 0
      );
      checks.push(
        check(
          'interaccion',
          `Interacción (${axial.seccion}, ${interaccion.ecuacion})`,
          interaccion.u,
          1,
          '—',
          `u_P = ${interaccion.uP.toFixed(3)}, u_Mx = ${interaccion.uMx.toFixed(3)}${interaccion.uMy > 0 ? `, u_My = ${interaccion.uMy.toFixed(3)}` : ''}. ${
            enTraccion
              ? 'P_c es la capacidad a tracción del Cap. D (H1.2).'
              : `B₁ = ${estabilidad.B1.toFixed(2)}.`
          }`,
          REF.H
        )
      );
      if (enTraccion) {
        warnings.push(
          'H1.2 permite multiplicar C_b por √(1 + αP_r/P_ey) cuando la tracción actúa junto con la flexión (Ec. H1-2). No se aplica: es un crédito opcional y depende del diagrama de momentos.'
        );
      } else if (estabilidad.B1 === 1) {
        warnings.push(
          'B₁ = 1,0 (default). Si hay carga transversal entre apoyos o el axial es alto, el momento de segundo orden es mayor — derívalo con el Apéndice 8.'
        );
      }
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
      'Las verificaciones sísmicas necesitan la cadena de compresión (F_e y L_c/r): activa también «Compresión».'
    );
    noVerificados.push({
      estado: 'sismico',
      nombre: 'Capa sísmica (NCh2369)',
      motivo: 'Necesita F_e y L_c/r de la cadena de compresión, que no se corrió.',
    });
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
          `${l.ref}. Solo exigible si el miembro debe ser dúctil (típicamente una diagonal de arriostramiento) — la herramienta no puede saberlo, lo decides tú al activar esta verificación.`,
          REF.NCH,
          // No es un uso: es una razón geométrica contra un límite. Si entrara
          // al ranking, una esbeltez podría reportarse como «la verificación
          // que gobierna» al lado de un uso de flexión, que no es comparable.
          'esbeltez'
        )
      );
    }
  }

  const conDemanda = checks.filter(
    (c) => c.clase !== 'esbeltez' && Number.isFinite(c.ratio) && c.demanda > 0
  );
  const peor = conDemanda.reduce<CheckResult | null>(
    (a, b) => (a === null || b.ratio > a.ratio ? b : a),
    null
  );

  // Un estado pedido que no se pudo verificar NO puede salir verde: pesa más
  // que el `every`, porque el `every` solo ve las filas que sí se emitieron.
  const todosOk = checks.every((c) => c.ok);
  const veredicto: Veredicto = noVerificados.length > 0 ? 'incompleto' : todosOk ? 'pasa' : 'no-pasa';

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
    noVerificados,
    veredicto,
    okGlobal: veredicto === 'pasa',
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
