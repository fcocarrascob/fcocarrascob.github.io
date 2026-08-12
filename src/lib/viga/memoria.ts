// ─────────────────────────────────────────────────────────────────────────────
// Memoria de cálculo: convierte un análisis de viga en regiones del canvas.
//
// Escrita con el mismo idioma que las planillas publicadas: banners `━━ … ━━`,
// filas `nombre := valor unidad`, y comparaciones `a < b =` que el canvas pinta
// como ✓ o ✗.
//
// Lo que la hoja RECALCULA de verdad es el EQUILIBRIO. Las reacciones vienen
// del motor —una viga hiperestática no se resuelve en una planilla lineal, y
// fingir que sí sería peor que no hacerlo—, pero ΣF = 0 y ΣM|₀ = 0 se rearman
// con mathjs desde los datos de entrada declarados. Esa es la verificación
// independiente: si el motor se equivocara en una reacción, las dos filas
// booleanas del final se pondrían en ✗.
//
// Trampas del canvas que condicionan los nombres, ambas documentadas en
// PLANILLAS.md: una variable no puede llamarse como una UNIDAD (`m`, `t`, `N`,
// `kN`) ni como una CONSTANTE de mathjs (`e`, `pi`). De ahí `Mo_carga` y no
// `M_carga`, y `e_F` en vez de `e`. Los subíndices salvan el resto: `a_1` es un
// identificador distinto de `a`.
// ─────────────────────────────────────────────────────────────────────────────

import { m, t, type Item } from '../worksheet-layout';
import { verificarSimbolos, type HojaCanvas } from '../canvas-handoff';
import type { Region } from '../worksheet';
import { altoDiagramas, comoDataUri, svgDiagramas, svgEsquema, ALTO_ESQUEMA, ANCHO } from './dibujo';
import type { EntradaViga, ResultadoViga } from './tipos';

const PREFIJO = 'viga';

function sig(v: number, n: number): string {
  if (!Number.isFinite(v)) return '0';
  if (v === 0) return '0';
  return Number(v.toPrecision(n)).toString();
}

/**
 * Un dato del que DEPENDE el contraste de equilibrio: 12 cifras.
 *
 * No es exceso de precisión: la hoja compara ΣF y ΣM con tolerancia 1e-6, y si
 * las reacciones y las cargas se escribieran redondeadas, el residuo mediría el
 * redondeo de sus propios números en vez de una discrepancia real.
 */
const dato = (v: number): string => sig(v, 12);

/** Un resultado que la hoja solo muestra: 6 cifras, que es lo que se lee. */
const salida = (v: number): string => sig(v, 6);

/** Número con coma decimal, para los textos de acompañamiento. */
const coma = (v: number, dec = 2): string =>
  Number.isFinite(v) ? v.toFixed(dec).replace('.', ',') : '—';

interface Imagen {
  kind: 'image';
  src: string;
  w: number;
  h: number;
}

type Bloque = Item | Imagen;

const esImagen = (b: Bloque): b is Imagen => b.kind === 'image';

/**
 * Apila los bloques en una sola columna.
 *
 * Es `layout()` de `worksheet-layout.ts` extendido para imágenes, que ese no
 * maneja. Una sola columna no es estética: `evaluateSheet` recorre las regiones
 * en orden de lectura (y, luego x), y con una columna el scope queda predecible.
 */
function disponer(bloques: Bloque[], x = 40, y0 = 32): Region[] {
  let y = y0;
  return bloques.map((b, i) => {
    if (esImagen(b)) {
      const region: Region = { id: `${PREFIJO}-${i}`, kind: 'image', x, y, src: b.src, w: b.w, h: b.h };
      y += b.h + 26;
      return region;
    }
    const region: Region = { id: `${PREFIJO}-${i}`, kind: b.kind, x, y, src: b.src };
    const lineas = b.src.split('\n').length;
    y += lineas > 1 ? lineas * 22 + 28 : 46;
    return region;
  });
}

const banner = (texto: string): Item => t(`━━ ${texto} ━━`);

const NOMBRE_APOYO: Record<string, string> = {
  libre: 'libre',
  apoyo: 'apoyo',
  empotrado: 'empotrado',
  resorte: 'resorte',
};

export function generarMemoria(entrada: EntradaViga, res: ResultadoViga): HojaCanvas {
  const b: Bloque[] = [];

  b.push(t('ANÁLISIS DE VIGA — reacciones, corte, momento y deformada'));
  b.push(
    t('Rigidez matricial 1D, viga de Euler-Bernoulli. Solo análisis: esta hoja no verifica')
  );
  b.push(t('ninguna norma ni ningún material.'));

  // ── Esquema ──
  b.push({ kind: 'image', src: comoDataUri(svgEsquema(entrada, ANCHO)), w: ANCHO, h: ALTO_ESQUEMA });

  // ── Geometría ──
  b.push(banner('GEOMETRÍA'));
  entrada.tramos.forEach((tr, i) => {
    b.push(m(`L_${i + 1} := ${dato(tr.L)} m`));
  });
  const sumaL = entrada.tramos.map((_, i) => `L_${i + 1}`).join(' + ');
  b.push(m(`L_tot := ${sumaL} = m`));
  if (entrada.tramos.some((tr) => Math.abs(tr.rigidezRel - 1) > 1e-12)) {
    b.push(
      t(
        'Rigidez relativa por tramo: ' +
          entrada.tramos.map((tr, i) => `tramo ${i + 1} EI×${coma(tr.rigidezRel)}`).join(' · ')
      )
    );
    b.push(t('En una viga hiperestática el reparto depende solo de estas razones.'));
  }

  // ── Apoyos ──
  b.push(banner('APOYOS'));
  entrada.apoyos.forEach((a, i) => {
    const extra =
      a.tipo === 'resorte'
        ? ` (k = ${coma(a.k ?? 0)} kN/m, kθ = ${coma(a.ktheta ?? 0)} kN·m/rad)`
        : '';
    b.push(t(`Apoyo ${i + 1}: ${NOMBRE_APOYO[a.tipo]} en x = ${coma(a.x)} m${extra}`));
    b.push(m(`x_${i + 1} := ${dato(res.reacciones[i].x)} m`));
  });

  if (res.EIconocido && entrada.E && entrada.I) {
    b.push(banner('RIGIDEZ'));
    b.push(m(`E_ac := ${dato(entrada.E)} MPa`));
    b.push(m(`I_x := ${dato(entrada.I)} cm^4`));
    b.push(m('EI_v := E_ac*I_x = kN*m^2'));
  }

  // ── Cargas ──
  b.push(banner('CARGAS'));
  // Términos que arman ΣF y ΣM del lado de las cargas.
  const terminosW: string[] = [];
  const terminosMo: string[] = [];
  let nCarga = 0;

  for (const c of entrada.cargas) {
    nCarga++;
    const k = nCarga;
    if (c.tipo === 'puntual') {
      b.push(t(`Carga ${k}: puntual de ${coma(c.P)} kN hacia abajo, en x = ${coma(c.x)} m`));
      b.push(m(`P_${k} := ${dato(c.P)} kN`));
      b.push(m(`xP_${k} := ${dato(c.x)} m`));
      terminosW.push(`P_${k}`);
      terminosMo.push(`P_${k}*xP_${k}`);
    } else if (c.tipo === 'momento') {
      b.push(t(`Carga ${k}: momento de ${coma(c.M)} kN·m (antihorario +), en x = ${coma(c.x)} m`));
      b.push(m(`Mp_${k} := ${dato(c.M)} kN*m`));
      terminosMo.push(`-Mp_${k}`);
    } else {
      const uniforme = Math.abs(c.w0 - c.w1) < 1e-12;
      b.push(
        t(
          uniforme
            ? `Carga ${k}: distribuida de ${coma(c.w0)} kN/m entre x = ${coma(c.x0)} y ${coma(c.x1)} m`
            : `Carga ${k}: distribuida de ${coma(c.w0)} a ${coma(c.w1)} kN/m entre x = ${coma(c.x0)} y ${coma(c.x1)} m`
        )
      );
      b.push(m(`qa_${k} := ${dato(c.w0)} kN/m`));
      b.push(m(`qb_${k} := ${dato(c.w1)} kN/m`));
      b.push(m(`a_${k} := ${dato(c.x0)} m`));
      b.push(m(`b_${k} := ${dato(c.x1)} m`));
      b.push(m(`W_${k} := (qa_${k} + qb_${k})/2*(b_${k} - a_${k}) = kN`));
      // Momento del trapecio respecto de x = 0, en forma integral: nunca divide,
      // así que vale también cuando la resultante es nula (qa = −qb).
      b.push(
        m(
          `Mq_${k} := (b_${k} - a_${k})*(qa_${k}*(2*a_${k} + b_${k}) + qb_${k}*(a_${k} + 2*b_${k}))/6 = kN*m`
        )
      );
      terminosW.push(`W_${k}`);
      terminosMo.push(`Mq_${k}`);
    }
  }

  // ── Reacciones ──
  b.push(banner('REACCIONES (motor de rigidez matricial)'));
  const terminosR: string[] = [];
  const terminosMr: string[] = [];
  res.reacciones.forEach((r, i) => {
    b.push(m(`R_${i + 1} := ${dato(r.Fv)} kN`));
    terminosR.push(`R_${i + 1}`);
    terminosMr.push(`R_${i + 1}*x_${i + 1}`);
    if (Math.abs(r.Mr) > 0) {
      b.push(m(`MR_${i + 1} := ${dato(r.Mr)} kN*m`));
      terminosMr.push(`MR_${i + 1}`);
    }
  });
  b.push(t('Fuerza positiva hacia arriba; momento positivo antihorario.'));

  // ── Equilibrio: lo único que esta hoja recalcula de verdad ──
  b.push(banner('EQUILIBRIO — recalculado en la hoja'));
  b.push(m(`W_tot := ${terminosW.length ? terminosW.join(' + ') : '0 kN'} = kN`));
  b.push(m(`R_tot := ${terminosR.join(' + ')} = kN`));
  b.push(m('e_F := abs(R_tot - W_tot)/max(abs(W_tot), 1 kN) ='));
  b.push(t('ΣF vertical: las reacciones tienen que sumar la carga total.'));
  b.push(m('e_F < 1e-6 ='));

  b.push(m(`Mo_carga := ${terminosMo.length ? terminosMo.join(' + ') : '0 kN*m'} = kN*m`));
  b.push(m(`Mo_react := ${terminosMr.join(' + ')} = kN*m`));
  b.push(m('e_M := abs(Mo_react - Mo_carga)/max(abs(Mo_carga), 1 kN*m) ='));
  b.push(t('ΣM respecto de x = 0: las reacciones tienen que equilibrar el momento de las cargas.'));
  b.push(m('e_M < 1e-6 ='));

  // ── Resultados ──
  b.push(banner('ESFUERZOS Y DEFORMACIÓN'));
  b.push(m(`M_pos := ${salida(res.momentoMax.valor)} kN*m`));
  b.push(t(`Momento positivo máximo (tracción abajo), en x = ${coma(res.momentoMax.x)} m`));
  b.push(m(`M_neg := ${salida(res.momentoMin.valor)} kN*m`));
  b.push(t(`Momento negativo máximo (tracción arriba), en x = ${coma(res.momentoMin.x)} m`));
  b.push(m(`V_max := ${salida(res.corteMax.valor)} kN`));
  b.push(t(`Corte de mayor magnitud, en x = ${coma(res.corteMax.x)} m`));
  if (res.EIconocido) {
    b.push(m(`d_max := ${salida(res.flechaMax.valor)} mm`));
    b.push(t(`Flecha de mayor magnitud (negativa = hacia abajo), en x = ${coma(res.flechaMax.x)} m`));
    b.push(m('L_tot/abs(d_max) ='));
    b.push(t('Razón L/δ, para contrastar contra el límite de servicio que corresponda.'));
  } else {
    b.push(m(`dEI_max := ${salida(res.flechaMax.valor)} kN*m^3`));
    b.push(
      t(
        `Flecha × EI en x = ${coma(res.flechaMax.x)} m. Sin E e I declarados, divídela por la rigidez.`
      )
    );
  }

  // ── Diagramas ──
  b.push(banner('DIAGRAMAS'));
  b.push({
    kind: 'image',
    src: comoDataUri(svgDiagramas(res, ANCHO)),
    w: ANCHO,
    h: altoDiagramas(),
  });
  b.push(t('V positivo hacia arriba · M dibujado en la cara traccionada · δ en geometría real.'));

  // El guardián corre sobre las filas de cálculo: una imagen no define ni usa
  // símbolos, y su `src` es un data URI que confundiría al análisis léxico.
  verificarSimbolos(b.filter((x): x is Item => !esImagen(x)));

  return {
    version: 1,
    meta: { titulo: 'Análisis de viga — reacciones, corte, momento y deformada' },
    regions: disponer(b),
  };
}
