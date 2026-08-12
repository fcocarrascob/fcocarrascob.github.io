// ─────────────────────────────────────────────────────────────────────────────
// Dibujo de la viga y de sus diagramas, como STRING SVG.
//
// Que devuelva texto y no JSX es deliberado: el mismo dibujo lo inyecta la isla
// React en pantalla y viaja como data URI dentro de la memoria que se abre en
// el canvas. Una sola fuente para las escalas, los rótulos y los signos — si
// fueran dos implementaciones, el diagrama impreso podría no ser el que se vio.
//
// Convención de dibujo, que hay que declarar porque no es la misma en los tres:
//
//   V   positivo hacia ARRIBA (convención clásica)
//   M   positivo hacia ABAJO  → el momento queda dibujado EN LA CARA TRACCIONADA
//   δ   geometría real: la flecha hacia abajo se dibuja hacia abajo
//
// La paleta es la misma de los scripts de figuras del repo. No hereda las
// variables CSS del sitio a propósito: el SVG también se sirve embebido en un
// data URI, donde no hay hoja de estilos que heredar.
// ─────────────────────────────────────────────────────────────────────────────

import type { EntradaViga, Punto, ResultadoViga } from './tipos';

const TINTA = '#333333';
const SUAVE = '#6b7280';
const BORDE = '#d1d5db';
const AZUL = '#1a63a8';
const ROJO = '#b02a1a';
const VERDE = '#1c7c3c';
const GUIA = '#9ca3af';

/** Ancho por defecto: el útil de una A4 con márgenes de 15 mm es 680 px. */
export const ANCHO = 660;

const FUENTE = 'Segoe UI, Arial, sans-serif';

/** Número con coma decimal, como todo rótulo del sitio. */
function coma(v: number, dec = 2): string {
  if (!Number.isFinite(v)) return '—';
  // Un −0,00 en un rótulo es ruido: se normaliza a 0,00.
  const x = Math.abs(v) < 0.5 * 10 ** -dec ? 0 : v;
  return x.toFixed(dec).replace('.', ',');
}

const px = (v: number): string => v.toFixed(1);

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function texto(
  x: number,
  y: number,
  s: string,
  o: { tam?: number; color?: string; ancla?: string; peso?: string } = {}
): string {
  const { tam = 11, color = TINTA, ancla = 'middle', peso = 'normal' } = o;
  return `<text x="${px(x)}" y="${px(y)}" font-size="${tam}" fill="${color}" text-anchor="${ancla}" font-weight="${peso}">${esc(s)}</text>`;
}

const linea = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color = TINTA,
  ancho = 1,
  dash = ''
): string =>
  `<line x1="${px(x1)}" y1="${px(y1)}" x2="${px(x2)}" y2="${px(y2)}" stroke="${color}" stroke-width="${ancho}"${dash ? ` stroke-dasharray="${dash}"` : ''} />`;

/** Flecha vertical que apunta hacia abajo, terminando en (x, y2). */
function flechaAbajo(x: number, y1: number, y2: number, color = ROJO, ancho = 1.4): string {
  const c = 4;
  return (
    linea(x, y1, x, y2, color, ancho) +
    `<path d="M ${px(x - c)} ${px(y2 - c * 1.6)} L ${px(x)} ${px(y2)} L ${px(x + c)} ${px(y2 - c * 1.6)} Z" fill="${color}" />`
  );
}

function envoltura(ancho: number, alto: number, cuerpo: string): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${alto}" ` +
    `viewBox="0 0 ${ancho} ${alto}" font-family="${FUENTE}">` +
    `<rect width="${ancho}" height="${alto}" fill="#ffffff" />${cuerpo}</svg>`
  );
}

// ── Esquema de la viga ───────────────────────────────────────────────────────

const MARGEN_X = 46;
const Y_VIGA = 104;
const ALTO_ESQUEMA = 176;

/** Símbolo de apoyo bajo la viga: triángulo con la base rayada. */
function simboloApoyo(x: number): string {
  const b = 9;
  const h = 15;
  let s = `<path d="M ${px(x)} ${px(Y_VIGA)} L ${px(x - b)} ${px(Y_VIGA + h)} L ${px(x + b)} ${px(Y_VIGA + h)} Z" fill="none" stroke="${TINTA}" stroke-width="1.3" />`;
  s += linea(x - b - 3, Y_VIGA + h, x + b + 3, Y_VIGA + h, TINTA, 1.3);
  for (let i = -3; i <= 3; i++) {
    const xi = x + i * 4;
    s += linea(xi, Y_VIGA + h, xi - 4, Y_VIGA + h + 5, SUAVE, 0.9);
  }
  return s;
}

/** Símbolo de empotramiento: muro vertical rayado al lado de la viga. */
function simboloEmpotrado(x: number, haciaLaDerecha: boolean): string {
  const h = 20;
  const d = haciaLaDerecha ? -1 : 1;
  let s = linea(x, Y_VIGA - h, x, Y_VIGA + h, TINTA, 1.8);
  for (let i = -4; i <= 4; i++) {
    const yi = Y_VIGA + i * 5;
    s += linea(x, yi, x + d * 6, yi + 5, SUAVE, 0.9);
  }
  return s;
}

/** Símbolo de resorte: zigzag bajo la viga. */
function simboloResorte(x: number): string {
  const y0 = Y_VIGA;
  const y1 = Y_VIGA + 22;
  const n = 6;
  const pts: string[] = [`${px(x)},${px(y0)}`];
  for (let i = 0; i < n; i++) {
    const yi = y0 + ((y1 - y0) * (i + 0.5)) / n;
    pts.push(`${px(x + (i % 2 === 0 ? 6 : -6))},${px(yi)}`);
  }
  pts.push(`${px(x)},${px(y1)}`);
  let s = `<polyline points="${pts.join(' ')}" fill="none" stroke="${TINTA}" stroke-width="1.2" />`;
  s += linea(x - 9, y1, x + 9, y1, TINTA, 1.3);
  for (let i = -2; i <= 2; i++) {
    s += linea(x + i * 4.5, y1, x + i * 4.5 - 4, y1 + 5, SUAVE, 0.9);
  }
  return s;
}

/** Arco con punta de flecha, para el momento puntual (antihorario). */
function simboloMomento(x: number, valor: number): string {
  const r = 15;
  const anti = valor >= 0;
  // Semicircunferencia sobre la viga; la punta va en el extremo que corresponda.
  const x1 = x - r;
  const x2 = x + r;
  const barrido = anti ? 1 : 0;
  const d = `M ${px(x1)} ${px(Y_VIGA)} A ${r} ${r} 0 0 ${barrido} ${px(x2)} ${px(Y_VIGA)}`;
  const xf = anti ? x1 : x2;
  const dir = anti ? 1 : -1;
  return (
    `<path d="${d}" fill="none" stroke="${ROJO}" stroke-width="1.5" />` +
    `<path d="M ${px(xf - 4)} ${px(Y_VIGA - 5 * dir)} L ${px(xf)} ${px(Y_VIGA + 2 * dir)} L ${px(xf + 4)} ${px(Y_VIGA - 5 * dir)} Z" fill="${ROJO}" />`
  );
}

/**
 * Esquema de la viga: tramos, apoyos y cargas, a escala en x.
 *
 * Las cargas distribuidas se dibujan a escala entre sí (la mayor ocupa 38 px),
 * de modo que un trapecio se lee como trapecio. Las puntuales no comparten esa
 * escala: son de otra dimensión y compararlas visualmente sería engañoso.
 */
export function svgEsquema(entrada: EntradaViga, ancho = ANCHO): string {
  const L = entrada.tramos.reduce((s, t) => s + t.L, 0);
  if (!(L > 0)) return envoltura(ancho, 40, texto(ancho / 2, 24, 'Viga sin largo', { color: SUAVE }));

  const x0 = MARGEN_X;
  const x1 = ancho - MARGEN_X;
  const sx = (x: number) => x0 + ((x1 - x0) * x) / L;

  let s = '';

  // ── Cargas distribuidas ──
  const distribuidas = entrada.cargas.filter((c) => c.tipo === 'distribuida');
  const wMax = Math.max(0, ...distribuidas.map((c) => Math.max(Math.abs(c.w0), Math.abs(c.w1))));
  const H_Q = 38;
  for (const c of distribuidas) {
    if (c.tipo !== 'distribuida') continue;
    const alto = (w: number) => (wMax > 0 ? (Math.abs(w) / wMax) * H_Q : 0);
    const xa = sx(c.x0);
    const xb = sx(c.x1);
    const ya = Y_VIGA - 6 - alto(c.w0);
    const yb = Y_VIGA - 6 - alto(c.w1);
    s +=
      `<path d="M ${px(xa)} ${px(Y_VIGA - 6)} L ${px(xa)} ${px(ya)} L ${px(xb)} ${px(yb)} L ${px(xb)} ${px(Y_VIGA - 6)} Z" ` +
      `fill="${AZUL}" fill-opacity="0.12" stroke="${AZUL}" stroke-width="1.2" />`;
    const n = Math.max(2, Math.min(14, Math.round((xb - xa) / 26)));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const xi = xa + (xb - xa) * t;
      const yi = ya + (yb - ya) * t;
      if (Y_VIGA - 6 - yi > 4) s += flechaAbajo(xi, yi, Y_VIGA - 7, AZUL, 1);
    }
    const etiqueta =
      Math.abs(c.w0 - c.w1) < 1e-9
        ? `${coma(c.w0)} kN/m`
        : `${coma(c.w0)} → ${coma(c.w1)} kN/m`;
    s += texto((xa + xb) / 2, Math.min(ya, yb) - 6, etiqueta, { tam: 10.5, color: AZUL });
  }

  // ── Cargas puntuales y momentos ──
  for (const c of entrada.cargas) {
    if (c.tipo === 'puntual') {
      const xp = sx(c.x);
      s += flechaAbajo(xp, Y_VIGA - 52, Y_VIGA - 7, ROJO, 1.6);
      s += texto(xp, Y_VIGA - 57, `${coma(c.P)} kN`, { tam: 10.5, color: ROJO });
    } else if (c.tipo === 'momento') {
      const xp = sx(c.x);
      s += simboloMomento(xp, c.M);
      s += texto(xp, Y_VIGA - 24, `${coma(c.M)} kN·m`, { tam: 10.5, color: ROJO });
    }
  }

  // ── La viga ──
  s += `<rect x="${px(x0)}" y="${px(Y_VIGA - 5)}" width="${px(x1 - x0)}" height="10" fill="${TINTA}" fill-opacity="0.08" stroke="${TINTA}" stroke-width="1.6" />`;

  // Divisiones entre tramos de rigidez distinta.
  let acum = 0;
  entrada.tramos.forEach((t, i) => {
    acum += t.L;
    if (i < entrada.tramos.length - 1) {
      s += linea(sx(acum), Y_VIGA - 5, sx(acum), Y_VIGA + 5, TINTA, 1);
    }
  });
  if (entrada.tramos.some((t) => Math.abs(t.rigidezRel - 1) > 1e-9)) {
    let a = 0;
    for (const t of entrada.tramos) {
      s += texto(sx(a + t.L / 2), Y_VIGA - 10, `EI×${coma(t.rigidezRel, 2)}`, {
        tam: 9.5,
        color: SUAVE,
      });
      a += t.L;
    }
  }

  // ── Apoyos ──
  for (const a of entrada.apoyos) {
    const xa = sx(a.x);
    if (a.tipo === 'apoyo') s += simboloApoyo(xa);
    else if (a.tipo === 'empotrado') s += simboloEmpotrado(xa, a.x < L / 2);
    else if (a.tipo === 'resorte') s += simboloResorte(xa);
  }

  // ── Cota total y posiciones de apoyo ──
  const yCota = ALTO_ESQUEMA - 24;
  s += linea(x0, yCota, x1, yCota, SUAVE, 0.9);
  const cotas: number[] = [];
  for (const v of [0, L, ...entrada.apoyos.map((a) => a.x)]) {
    if (!cotas.some((u) => Math.abs(u - v) < L * 1e-6)) cotas.push(v);
  }
  for (const xv of cotas.sort((p, q) => p - q)) {
    const xa = sx(xv);
    s += linea(xa, yCota - 4, xa, yCota + 4, SUAVE, 0.9);
    s += texto(xa, yCota + 15, `${coma(xv)} m`, { tam: 9.5, color: SUAVE });
  }
  s += texto(x1, yCota - 7, `L = ${coma(L)} m`, { tam: 10, color: SUAVE, ancla: 'end' });

  return envoltura(ancho, ALTO_ESQUEMA, s);
}

// ── Diagramas ────────────────────────────────────────────────────────────────

const ALTO_PANEL = 116;
const GAP_PANEL = 34;
const PAD_PANEL = 12;
/** Deja sitio para el rótulo del primer panel, que va sobre él. */
const Y_INICIO = 26;

interface Panel {
  /** Título ya con su unidad: va sobre el panel, no en el margen izquierdo. */
  titulo: string;
  puntos: Punto[];
  color: string;
  /** El único que se dibuja con el positivo hacia abajo es el momento. */
  positivoAbajo: boolean;
  marcas: { x: number; valor: number; etiqueta: string }[];
}

function dibujarPanel(p: Panel, yTop: number, x0: number, x1: number, L: number): string {
  const signo = p.positivoAbajo ? -1 : 1;
  const w = p.puntos.map((q) => q.y * signo);
  const wMax = Math.max(0, ...w);
  const wMin = Math.min(0, ...w);
  const rango = wMax - wMin || 1;
  const hu = ALTO_PANEL - 2 * PAD_PANEL;
  const yBase = yTop + PAD_PANEL + (wMax / rango) * hu;
  const sy = (v: number) => yBase - v * signo * (hu / rango);
  const sx = (x: number) => x0 + ((x1 - x0) * x) / L;

  let s = '';
  // Área bajo la curva, cerrada contra la línea de referencia.
  const pts = p.puntos.map((q) => `${px(sx(q.x))},${px(sy(q.y))}`).join(' ');
  s +=
    `<polygon points="${px(x0)},${px(yBase)} ${pts} ${px(x1)},${px(yBase)}" ` +
    `fill="${p.color}" fill-opacity="0.13" />`;
  s += `<polyline points="${pts}" fill="none" stroke="${p.color}" stroke-width="1.8" stroke-linejoin="round" />`;
  s += linea(x0, yBase, x1, yBase, TINTA, 1.1);

  // Título SOBRE el panel, no en el margen izquierdo: ahí competía por el
  // espacio con la etiqueta del valor máximo, que suele caer cerca del borde.
  s += texto(x0, yTop - 9, p.titulo, { tam: 11, color: TINTA, ancla: 'start', peso: '600' });

  // Marcas de los valores notables.
  for (const m of p.marcas) {
    if (Math.abs(m.valor) < 1e-12) continue;
    const xm = sx(m.x);
    const ym = sy(m.valor);
    s += linea(xm, yBase, xm, ym, GUIA, 0.9, '4 3');
    s += `<circle cx="${px(xm)}" cy="${px(ym)}" r="3" fill="${p.color}" />`;
    const arriba = ym < yBase;
    // Cerca de un extremo la etiqueta se ancla hacia adentro para no salirse.
    const ancla = xm < x0 + 34 ? 'start' : xm > x1 - 34 ? 'end' : 'middle';
    s += texto(xm, arriba ? ym - 7 : ym + 14, m.etiqueta, { tam: 10, color: p.color, ancla });
  }
  return s;
}

/**
 * Los tres diagramas apilados sobre un mismo eje x.
 *
 * `res.diagramas` ya trae los puntos muestreados por el motor, incluidos los
 * pares con el mismo x que representan los saltos (bajo una carga puntual el
 * corte salta, y bajo un momento puntual salta el momento).
 */
export function svgDiagramas(res: ResultadoViga, ancho = ANCHO): string {
  const x0 = EJE_X.x0;
  const x1 = ancho - (ANCHO - EJE_X.x1);
  const L = res.L;

  const unidadFlecha = res.EIconocido ? 'mm' : 'kN·m³ (δ·EI)';
  const decFlecha = res.EIconocido ? 2 : 1;

  const paneles: Panel[] = [
    {
      titulo: 'Corte V  [kN]  · positivo hacia arriba',
      puntos: res.diagramas.corte,
      color: AZUL,
      positivoAbajo: false,
      marcas: [
        {
          x: res.corteMax.x,
          valor: res.corteMax.valor,
          etiqueta: `${coma(res.corteMax.valor)} kN`,
        },
      ],
    },
    {
      titulo: 'Momento M  [kN·m]  · dibujado en la cara traccionada',
      puntos: res.diagramas.momento,
      color: ROJO,
      positivoAbajo: true,
      marcas: [
        {
          x: res.momentoMax.x,
          valor: res.momentoMax.valor,
          etiqueta: `${coma(res.momentoMax.valor)} kN·m`,
        },
        {
          x: res.momentoMin.x,
          valor: res.momentoMin.valor,
          etiqueta: `${coma(res.momentoMin.valor)} kN·m`,
        },
      ],
    },
    {
      titulo: `Deformada δ  [${unidadFlecha}]  · en geometría real`,
      puntos: res.diagramas.deformada,
      color: VERDE,
      positivoAbajo: false,
      marcas: [
        {
          x: res.flechaMax.x,
          valor: res.flechaMax.valor,
          etiqueta: `${coma(res.flechaMax.valor, decFlecha)} ${res.EIconocido ? 'mm' : ''}`.trim(),
        },
      ],
    },
  ];

  const alto = altoDiagramas();
  let s = '';

  // Posiciones que se rotulan: los apoyos y los dos extremos de la viga. Sin
  // los extremos, un voladizo queda sin ninguna cota en su punta.
  const marcasX: number[] = [];
  for (const v of [0, L, ...res.reacciones.map((r) => r.x)]) {
    if (!marcasX.some((u) => Math.abs(u - v) < L * 1e-6)) marcasX.push(v);
  }
  marcasX.sort((a, b) => a - b);

  const sx = (x: number) => x0 + ((x1 - x0) * x) / L;
  for (const r of res.reacciones) {
    s += linea(sx(r.x), Y_INICIO, sx(r.x), alto - 26, BORDE, 0.9);
  }

  paneles.forEach((p, i) => {
    s += dibujarPanel(p, Y_INICIO + i * (ALTO_PANEL + GAP_PANEL), x0, x1, L);
  });

  // Eje x común, abajo del todo.
  const yEje = alto - 24;
  s += linea(x0, yEje, x1, yEje, SUAVE, 0.9);
  for (const xm of marcasX) {
    s += linea(sx(xm), yEje - 3, sx(xm), yEje + 3, SUAVE, 0.9);
    s += texto(sx(xm), yEje + 15, coma(xm), { tam: 9.5, color: SUAVE });
  }
  s += texto(x1, yEje - 7, 'x [m]', { tam: 9.5, color: SUAVE, ancla: 'end' });

  return envoltura(ancho, alto, s);
}

/** El SVG como data URI, que es lo que viaja dentro de una región del canvas. */
export function comoDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Alto del SVG que devuelve `svgDiagramas`, para reservarlo en la región. */
export function altoDiagramas(): number {
  return Y_INICIO + 3 * (ALTO_PANEL + GAP_PANEL) + 12;
}

/**
 * Dónde empieza y termina el eje x dentro del viewBox de `svgDiagramas`.
 *
 * Lo necesita la lectura interactiva de la isla: el cursor va en un overlay
 * HTML encima del SVG, y para traducir un píxel de pantalla a una posición de
 * la viga tiene que conocer los mismos márgenes con que se dibujó.
 */
export const EJE_X = { x0: MARGEN_X, x1: ANCHO - 26 };

export { ALTO_ESQUEMA };
