#!/usr/bin/env node
// Dibuja las tres figuras calculadas del post sísmico del galpón del altiplano
// (/apuntes/ejemplo-galpon-altiplano-sismico-nch2369).
//
//   npm run figuras:galpon-sismico
//
// Las constantes vienen de SERIE-GALPON.md, que es la memoria de cálculo de la
// serie, y de ahí del modelo SAP2000 congelado (galpon_altiplano.sdb, v27.1):
// §6.2.1 el modelo en números · §5.34 la convergencia del mallado · §5.35 la
// banda y la Ec. (14) · §5.36 los dos T* · §5.38 la deriva. Van SIN redondear.
//
// Las cifras del espectro (S_aH de referencia, S_a de diseño, Q0mín y Q0máx) se
// recalculan acá desde `src/lib/nch2369-spectrum.ts` y se contrastan contra lo
// que midió el modelo: si alguna se separa más de 1e-4 relativo, el script
// falla en vez de dibujar un número que no cuadra.
//
// Emite a public/ejemplo-galpon-altiplano-sismico-nch2369/:
//   la-fila-no-la-eliges.svg    quién elige la fila de la Tabla 7, y el hueco
//   el-minimo-se-come-el-r.svg  las dos rutas contra la banda, y la Ec. (14)
//   la-deriva-y-el-mallado.svg  el 94,6 %, y el margen contra el error de malla
//
// El SVG no hereda las variables CSS del sitio (se sirve como <img>): colores
// literales y coma decimal, como el resto de las figuras.

import { build } from 'esbuild';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT_DIR = path.join(ROOT, 'public/ejemplo-galpon-altiplano-sismico-nch2369');

async function loadSpectrum() {
  const out = path.join(tmpdir(), `nch2369-spectrum-galpon-${process.pid}.mjs`);
  await build({
    entryPoints: [path.join(ROOT, 'src/lib/nch2369-spectrum.ts')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile: out,
    logLevel: 'error',
  });
  const mod = await import(pathToFileURL(out).href);
  await rm(out, { force: true });
  return mod;
}

const { AR_BY_ZONE, SOIL_PARAMS } = await loadSpectrum();

// ------------------------------------------------------------------ los datos

// Sitio (SERIE-GALPON §4.1: Tablas 3 y 6 de NCh2369:2025, leídas rasterizadas
// el 2026-08-12). I = 1,00 por Categoría II, §4.3.
const ZONA = 2;
const SUELO = 'B';
const I_IMP = 1.0;
const XI = 0.02; // uniones soldadas, columna ξ de la Tabla 7

const AR = AR_BY_ZONE[ZONA];
const SP = SOIL_PARAMS[SUELO];
const F_XI = (0.05 / XI) ** 0.4;

// Modelo congelado (§6.2.1). Masa sísmica P = D + 0,20·S.
const P_SIS = 674.8610909934324; // kN
const T_STAR_X = 0.8526565963541679; // s · modo 1, U_x = 94,63 %
const T_STAR_Y = 0.1610608923144279; // s · modo 41, U_y = 47,42 %

// Cortes basales CQC, por ruta y por dirección. Leídos SIN redondear de
// `Results.BaseReact` del modelo abierto el 2026-08-12 — §5.35 los tabula
// redondeados a tres decimales, y con el Q0X redondeado de la ruta R = 5 la
// Ec. (14) no reproduce el R1 publicado.
const Q0 = {
  4: { X: 86.96022871934747, Y: 130.25718886418443 },
  5: { X: 69.56818297547798, Y: 121.39480759923802 },
};

// Los mismos cortes con el espectro de REFERENCIA de §6.1 (sin R*). Sirven de
// chequeo de una línea: el cociente contra el de diseño tiene que dar el R*
// de esa dirección, o uno de los dos espectros está mal cargado.
const Q0_REF = { X: 347.8409148773899, Y: 498.9063138060352 };

// Deriva con el espectro de referencia de §6.1 y la simultaneidad de §4.5.2
// (§5.38). El límite es 0,015·h con h = 8,0 m de alero.
const H_ALERO = 8.0; // m
const LIM_DERIVA = 0.015 * H_ALERO; // m
const DERIVA_X = 0.113504; // m · alero del marco 4, el máximo
const DERIVA_Y = 0.006912; // m · alero, dirección arriostrada

// Convergencia del mallado del peralte variable, contra N = 36 (§5.34). N es el
// número de tramos por columna; la malla adoptada es 4.
const MALLA = [
  { n: 1, err: 37.8 },
  { n: 2, err: 9.23 },
  { n: 3, err: 3.98 },
  { n: 6, err: 0.95 },
  { n: 9, err: 0.4 },
];

// ------------------------------------------------- lo que se recalcula acá

// Ec. (3) de NCh2369:2025 — la misma forma que `spectrumShape()` de la
// biblioteca, evaluada en un T arbitrario (la biblioteca solo entrega la
// grilla de 0,01 s y los T* no caen en ella).
const saH = (T) => {
  if (T === 0) return AR * SP.S;
  const ratio = T / SP.T0;
  return (AR * SP.S * (1 + SP.r * ratio ** SP.p)) / (1 + ratio ** SP.q);
};

// Ec. (1b) de §5.4.1, con C_r = 0,16·R. R* se evalúa UNA vez, en el T* de la
// dirección de análisis, y queda constante en todo el espectro.
const rStar = (T, R) => {
  if (R <= 1) return 1;
  const lim = 0.16 * R * SP.T1;
  return T >= lim ? R : 1.5 + (R - 1.5) * (T / lim);
};

const codo = (R) => 0.16 * R * SP.T1;

// Ec. (12) de §5.12 y Ec. (13) de §5.13.
const q0Min = 0.25 * I_IMP * AR * SP.S * P_SIS;
const q0Max = (R) => ((2.75 * I_IMP * AR * SP.S) / (R + 1)) * F_XI * P_SIS;

const RUTAS = [4, 5].map((R) => ({
  R,
  codo: codo(R),
  rStarX: rStar(T_STAR_X, R),
  rStarY: rStar(T_STAR_Y, R),
  q0max: q0Max(R),
  q0x: Q0[R].X,
  q0y: Q0[R].Y,
}));

// Ec. (14) de §5.14, en la única dirección donde el segundo factor no vale 1.
const R5 = RUTAS.find((r) => r.R === 5);
const FACTOR_12 = q0Min / R5.q0x; // §5.12: amplificar todas las fuerzas
const R1_X_R5 = R5.rStarX * Math.min(R5.q0x / q0Min, 1);

// ------------------------------------------------------ el contraste que manda

// Lo que midió el modelo (§5.35 y §5.36). Si la biblioteca del sitio no lo
// reproduce, el script no dibuja.
const ESPERADO = [
  ['S_aH referencia en T*_X', I_IMP * saH(T_STAR_X) * F_XI, 0.6306425],
  ['S_aH referencia en T*_Y', I_IMP * saH(T_STAR_Y) * F_XI, 1.3975929],
  ['S_a de diseño en T*_X (R = 4)', (I_IMP * saH(T_STAR_X) * F_XI) / rStar(T_STAR_X, 4), 0.1576606],
  ['S_a de diseño en T*_Y (R = 4)', (I_IMP * saH(T_STAR_Y) * F_XI) / rStar(T_STAR_Y, 4), 0.3648912],
  ['R*_Y de la Ec. (1b), R = 4', rStar(T_STAR_Y, 4), 3.8301633726045696],
  ['R*_Y de la Ec. (1b), R = 5', rStar(T_STAR_Y, 5), 4.109783],
  ['Q0mín de la Ec. (12)', q0Min, 70.86041455430902],
  ['Q0máx de la Ec. (13), R = 4', q0Max(4), 224.9066895021051],
  // El par referencia/diseño: su cociente TIENE que dar el R* de la dirección.
  ['Q0_REF / Q0_diseño en X (R = 4)', Q0_REF.X / Q0[4].X, rStar(T_STAR_X, 4)],
  ['Q0_REF / Q0_diseño en Y (R = 4)', Q0_REF.Y / Q0[4].Y, rStar(T_STAR_Y, 4)],
];
for (const [rot, calc, medido] of ESPERADO) {
  const dif = Math.abs(calc / medido - 1);
  if (dif > 1e-4) {
    throw new Error(
      `${rot}: la biblioteca da ${calc} y el modelo midió ${medido} (${(100 * dif).toFixed(4)} %)`,
    );
  }
}

// ---------------------------------------------------------------- utilidades

const COMA = (x, dec = 2) => x.toFixed(dec).replace('.', ',');
const MILES = (x, dec = 0) => {
  const [ent, frac] = x.toFixed(dec).split('.');
  const conMiles = ent.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return frac ? `${conMiles},${frac}` : conMiles;
};

const TINTA = '#333';
const SUAVE = '#6b7280';
const BORDE = '#d1d5db';
const AZUL = '#1a63a8'; // ruta §12.2, R = 4 — la de diseño
const ROJO = '#b02a1a'; // ruta fila 5.5, R = 5 — la ilustrativa
const VERDE = '#1f7a4d';
const AMBAR = '#b45309';
const GRIS = '#9ca3af';

const escala = (d0, d1, p0, p1) => (v) => p0 + ((v - d0) / (d1 - d0)) * (p1 - p0);

function caja({ x, y, w, h, fill, stroke, rx = 6, sw = 1.6 }) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
}

function texto(x, y, s, { size = 12, fill = TINTA, anchor = 'start', bold = false } = {}) {
  const peso = bold ? ' font-weight="bold"' : '';
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" text-anchor="${anchor}"${peso}>${s}</text>`;
}

function flecha(x1, y1, x2, y2, color = SUAVE) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.6" marker-end="url(#punta)"/>`;
}

const DEFS = `<defs>
    <marker id="punta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="${SUAVE}"/>
    </marker>
  </defs>`;

// ------------------------------- figura 1: quién elige la fila de la Tabla 7

function figuraFila() {
  const W = 1000;
  const H = 660;

  const filas = [
    {
      id: '5.5',
      R: 5,
      rot: 'Edificios industriales de un piso, con o sin puente grúa,',
      rot2: 'CON arriostramiento continuo de techo, anclajes dúctiles',
      quien: '§12.1.2 la vuelve la fila por defecto',
      color: ROJO,
    },
    {
      id: '5.6',
      R: 3,
      rot: 'Edificios industriales de un piso, sin puente grúa,',
      rot2: 'SIN arriostramiento continuo de techo, anclajes dúctiles',
      quien: 'solo para la excepción de §12.1.2',
      color: GRIS,
    },
    {
      id: '5.7',
      R: 4,
      rot: 'Galpones livianos de acero',
      rot2: '— definidos por las ocho condiciones de §12.2.1',
      quien: '§12.2: «se DEBE evaluar utilizando […] punto 5.7»',
      color: AZUL,
    },
    {
      id: '2',
      R: 1.5,
      rot: 'Otras estructuras no incluidas o asimilables',
      rot2: '— donde cae «con puente grúa y SIN arriostramiento»',
      quien: 'el hueco: esa combinación no tiene fila propia',
      color: AMBAR,
    },
  ];

  const x0 = 48;
  const wCaja = 624;
  const alto = 82;
  const gap = 18;
  const yTop = 152;

  // La barra del R vive DENTRO de la caja, en su franja derecha.
  const xBar = x0 + 452;
  const sxR = escala(0, 5, xBar, xBar + 108);

  const bloques = filas
    .map((f, i) => {
      const y = yTop + i * (alto + gap);
      const esNuestra = f.id === '5.7';
      return [
        caja({
          x: x0,
          y,
          w: wCaja,
          h: alto,
          fill: esNuestra ? '#eef4fb' : '#ffffff',
          stroke: f.color,
          sw: esNuestra ? 2.4 : 1.4,
        }),
        texto(x0 + 16, y + 24, `Tabla 7, fila ${f.id}`, { size: 12.5, bold: true, fill: f.color }),
        texto(x0 + 16, y + 44, f.rot, { size: 11.5, fill: TINTA }),
        texto(x0 + 16, y + 60, f.rot2, { size: 11.5, fill: TINTA }),
        texto(x0 + 16, y + 76, f.quien, { size: 10.5, fill: SUAVE }),
        `<line x1="${xBar - 18}" y1="${y + 10}" x2="${xBar - 18}" y2="${y + alto - 10}" stroke="${BORDE}" stroke-width="1"/>`,
        `<rect x="${xBar}" y="${y + 40}" width="${(sxR(f.R) - sxR(0)).toFixed(1)}" height="22" rx="3" fill="${f.color}" fill-opacity="${esNuestra ? 0.85 : 0.45}"/>`,
        texto(xBar, y + 30, `R = ${COMA(f.R, f.R === 1.5 ? 1 : 0)}`, {
          size: 13,
          bold: true,
          fill: f.color,
        }),
      ].join('\n  ');
    })
    .join('\n  ');

  // El camino de este galpón, a la derecha.
  const xp = 706;
  const wp = 252;
  const pasos = [
    ['¿Marcos transversales?', 'Sí → §12.1.2 obliga el', 'arriostramiento continuo', VERDE],
    ['¿Solo carga su peso propio?', 'No: 0,35 kPa de carga muerta', 'superpuesta → sin excepción', VERDE],
    ['¿Las ocho de §12.2.1?', 'Se cumplen las ocho letras,', 'de la a) hasta la h)', VERDE],
  ];
  const camino = pasos
    .map(([t1, t2, t3, c], i) => {
      const y = 200 + i * 104;
      return [
        caja({ x: xp, y, w: wp, h: 74, fill: '#f6faf7', stroke: c, sw: 1.4 }),
        texto(xp + 14, y + 22, t1, { size: 11.5, bold: true, fill: c }),
        texto(xp + 14, y + 40, t2, { size: 10.5, fill: TINTA }),
        texto(xp + 14, y + 56, t3, { size: 10.5, fill: TINTA }),
        i < pasos.length - 1 ? flecha(xp + wp / 2, y + 74, xp + wp / 2, y + 100, c) : '',
      ].join('\n  ');
    })
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="Segoe UI, Arial, sans-serif">
  ${DEFS}
  <rect width="${W}" height="${H}" fill="#ffffff"/>
  ${texto(W / 2, 34, 'La Tabla 7 clasifica el edificio, no la dirección — y la fila no la elige el ingeniero', { size: 15.5, bold: true, fill: '#222', anchor: 'middle' })}
  ${texto(W / 2, 56, 'Un galpón con marcos transversales en X y crucería en Y tiene dos sistemas sismorresistentes y una sola fila de la Tabla 7', { size: 12, fill: SUAVE, anchor: 'middle' })}
  ${texto(x0, 92, 'Las cuatro filas que un galpón industrial puede terminar usando', { size: 12.5, bold: true, fill: TINTA })}
  ${texto(x0, 112, 'La barra es el R de tabla. La línea gris de cada caja dice quien decide que te toque esa fila.', { size: 11, fill: SUAVE })}
  ${texto(xp, 174, 'El camino de este galpón', { size: 12.5, bold: true, fill: TINTA })}
  ${bloques}
  ${camino}
  ${caja({ x: xp, y: 512, w: wp, h: 76, fill: '#eef4fb', stroke: AZUL, sw: 2.4 })}
  ${texto(xp + 14, 534, 'Va por §12.2: R = 4', { size: 12.5, bold: true, fill: AZUL })}
  ${texto(xp + 14, 552, 'y el amplificador de capacidad', { size: 10.5, fill: TINTA })}
  ${texto(xp + 14, 568, 'baja de 0,7R₁ a 0,5R₁,', { size: 10.5, fill: TINTA })}
  ${texto(xp + 14, 584, 'por §12.2.2', { size: 10.5, bold: true, fill: TINTA })}
  ${flecha(xp + wp / 2, 478, xp + wp / 2, 508, AZUL)}
  ${texto(x0, 620, 'La fila 5.6 (R = 3) es casi inalcanzable: §12.1.2 exige arriostramiento continuo de techo en todo edificio con marcos transversales, salvo los que', { size: 11, fill: TINTA })}
  ${texto(x0, 636, 'solo cargan su peso propio. Y «con puente grúa y sin arriostramiento» no está en la tabla: cae en la fila 2, con R = 1,5.', { size: 11, fill: TINTA })}
  ${texto(x0, 654, 'NCh2369:2025 (3.ª ed.) · Tabla 7 (pág. impresa 61) · §12.1.2 y §12.2 (págs. 143-145), leídas rasterizadas el 2026-08-12', { size: 10.5, fill: SUAVE })}
</svg>
`;
}

// ---------------------- figura 2: las dos rutas contra la banda, y la Ec. (14)

function figuraBanda() {
  const W = 1000;
  const H = 560;

  const xMax = 260; // kN
  const x0 = 214; // margen izquierdo ancho: las etiquetas de ruta son largas
  const wPlot = 482;
  const sx = escala(0, xMax, x0, x0 + wPlot);

  const ticks = [0, 50, 100, 150, 200, 250];
  const ejes = ticks
    .map(
      (t) =>
        `<line x1="${sx(t).toFixed(1)}" y1="112" x2="${sx(t).toFixed(1)}" y2="392" stroke="${BORDE}" stroke-width="1"/>\n  ` +
        texto(sx(t), 410, MILES(t), { size: 11, fill: SUAVE, anchor: 'middle' }),
    )
    .join('\n  ');

  const barras = [];
  let y = 138;
  for (const ruta of RUTAS) {
    const color = ruta.R === 4 ? AZUL : ROJO;
    const etiqueta =
      ruta.R === 4 ? '§12.2 · R = 4 (la ruta de diseño)' : 'fila 5.5 · R = 5 (la ilustrativa)';

    barras.push(
      `<rect x="${sx(q0Min).toFixed(1)}" y="${y - 14}" width="${(sx(ruta.q0max) - sx(q0Min)).toFixed(1)}" height="118" fill="${VERDE}" fill-opacity="0.08"/>`,
    );
    barras.push(
      `<line x1="${sx(ruta.q0max).toFixed(1)}" y1="${y - 14}" x2="${sx(ruta.q0max).toFixed(1)}" y2="${y + 104}" stroke="${VERDE}" stroke-width="1.4" stroke-dasharray="5 4"/>`,
    );
    barras.push(
      texto(sx(ruta.q0max) - 8, y - 2, `Q₀máx = ${COMA(ruta.q0max, 3)} kN`, {
        size: 10.5,
        fill: VERDE,
        anchor: 'end',
      }),
    );
    barras.push(
      texto(x0 - 12, y + 4, etiqueta, { size: 11.5, bold: true, fill: color, anchor: 'end' }),
    );

    for (const dir of ['X', 'Y']) {
      const q = dir === 'X' ? ruta.q0x : ruta.q0y;
      const yy = y + (dir === 'X' ? 22 : 62);
      const bajo = q < q0Min;
      barras.push(
        `<rect x="${sx(0).toFixed(1)}" y="${yy}" width="${(sx(q) - sx(0)).toFixed(1)}" height="26" rx="3" fill="${color}" fill-opacity="${bajo ? 0.95 : 0.55}"/>`,
      );
      barras.push(
        texto(x0 - 12, yy + 18, dir === 'X' ? 'X · marcos' : 'Y · arriostrada', {
          size: 11,
          fill: SUAVE,
          anchor: 'end',
        }),
      );
      barras.push(
        texto(sx(q) + 10, yy + 18, `${COMA(q, 3)} kN`, { size: 11.5, bold: true, fill: color }),
      );
      if (bajo) {
        barras.push(
          texto(sx(q) + 92, yy + 18, `✗ ${COMA(100 * (1 - q / q0Min), 2)} % bajo el mínimo`, {
            size: 11,
            bold: true,
            fill: AMBAR,
          }),
        );
      }
    }
    y += 132;
  }

  const lineaMin = [
    `<line x1="${sx(q0Min).toFixed(1)}" y1="112" x2="${sx(q0Min).toFixed(1)}" y2="392" stroke="${AMBAR}" stroke-width="2"/>`,
    texto(sx(q0Min), 104, `Q₀mín = ${COMA(q0Min, 3)} kN  (Ec. 12)`, {
      size: 11.5,
      bold: true,
      fill: AMBAR,
      anchor: 'middle',
    }),
  ].join('\n  ');

  const xp = 726;
  const panel = [
    caja({ x: xp, y: 150, w: 236, h: 224, fill: '#fdf6ec', stroke: AMBAR, sw: 1.6 }),
    texto(xp + 16, 176, 'Lo que cobra el mínimo', { size: 12.5, bold: true, fill: AMBAR }),
    texto(xp + 16, 198, 'Dirección X, ruta R = 5:', { size: 11, fill: TINTA }),
    texto(xp + 16, 222, '§5.12 amplifica todo por', { size: 11, fill: TINTA }),
    texto(xp + 16, 240, `${COMA(q0Min, 3)} / ${COMA(R5.q0x, 3)} = ${COMA(FACTOR_12, 6)}`, {
      size: 11.5,
      bold: true,
      fill: TINTA,
    }),
    texto(xp + 16, 268, 'y la Ec. (14) devuelve', { size: 11, fill: TINTA }),
    texto(xp + 16, 290, `R₁ = 5,00 × ${COMA(R5.q0x / q0Min, 6)}`, { size: 11.5, fill: TINTA }),
    texto(xp + 16, 316, `R₁ = ${COMA(R1_X_R5, 6)}`, { size: 17, bold: true, fill: ROJO }),
    texto(xp + 16, 342, 'La fila que promete el R', { size: 11, fill: SUAVE }),
    texto(xp + 16, 358, 'más alto no lo entrega.', { size: 11, fill: SUAVE }),
  ].join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="Segoe UI, Arial, sans-serif">
  <rect width="${W}" height="${H}" fill="#ffffff"/>
  ${texto(W / 2, 34, 'Las dos rutas contra la banda de §5.12–§5.13 — y el único corte que se cae por abajo', { size: 15.5, bold: true, fill: '#222', anchor: 'middle' })}
  ${texto(W / 2, 56, `Mismo modelo, misma masa P = ${COMA(P_SIS, 3)} kN. Solo cambia el R de tabla, y con él el R* de cada dirección y el Q₀máx de la Ec. (13)`, { size: 12, fill: SUAVE, anchor: 'middle' })}
  ${texto(40, 84, 'Corte basal Q₀ [kN]', { size: 12, bold: true, fill: TINTA })}
  ${ejes}
  ${barras.join('\n  ')}
  ${lineaMin}
  ${panel}
  ${texto(40, 462, 'La banda verde es distinta en cada ruta: el Q₀máx de la Ec. (13) divide por (R + 1), así que subir el R de 4 a 5 baja el techo de 224,907 a 187,422 kN.', { size: 11, fill: TINTA })}
  ${texto(40, 480, 'El piso de la Ec. (12) no depende del R y queda donde estaba. Con R = 5, el corte de la dirección de marcos cae por debajo de ese piso.', { size: 11, fill: TINTA })}
  ${texto(40, 506, 'Cortes CQC del análisis modal espectral (60 modos, §5.6.2 cumplida) del modelo galpon_altiplano.sdb, SAP2000 v27.1', { size: 10.5, fill: SUAVE })}
  ${texto(40, 522, 'Ecs. (1a), (1b), (12), (13) y (14) de NCh2369:2025 (3.ª ed.), págs. impresas 27-29 y 48-49 · recalculadas contra src/lib/nch2369-spectrum.ts', { size: 10.5, fill: SUAVE })}
</svg>
`;
}

// -------------------- figura 3: la deriva, su margen, y el error de mallado

function figuraDeriva() {
  const W = 1000;
  const H = 520;

  const x0 = 118;
  const wPlot = 360;
  const dMax = 0.14;
  const sx = escala(0, dMax, x0, x0 + wPlot);

  const ticks = [0, 0.03, 0.06, 0.09, 0.12];
  const ejes = ticks
    .map(
      (t) =>
        `<line x1="${sx(t).toFixed(1)}" y1="118" x2="${sx(t).toFixed(1)}" y2="272" stroke="${BORDE}" stroke-width="1"/>\n  ` +
        texto(sx(t), 290, COMA(t, 3), { size: 11, fill: SUAVE, anchor: 'middle' }),
    )
    .join('\n  ');

  const razonX = DERIVA_X / LIM_DERIVA;
  const razonY = DERIVA_Y / LIM_DERIVA;
  const margen = 100 * (1 - razonX);

  const barras = [
    `<rect x="${sx(0).toFixed(1)}" y="146" width="${(sx(DERIVA_X) - sx(0)).toFixed(1)}" height="34" rx="3" fill="${ROJO}" fill-opacity="0.85"/>`,
    texto(x0 - 12, 168, 'X · marcos', { size: 11.5, fill: TINTA, anchor: 'end' }),
    texto(sx(DERIVA_X) + 10, 162, `${COMA(DERIVA_X, 6)} m`, { size: 11.5, bold: true, fill: ROJO }),
    texto(sx(DERIVA_X) + 10, 178, `${COMA(100 * razonX, 1)} % del límite`, { size: 11, fill: ROJO }),
    `<rect x="${sx(0).toFixed(1)}" y="210" width="${(sx(DERIVA_Y) - sx(0)).toFixed(1)}" height="34" rx="3" fill="${AZUL}" fill-opacity="0.6"/>`,
    texto(x0 - 12, 232, 'Y · arriostrada', { size: 11.5, fill: TINTA, anchor: 'end' }),
    texto(sx(DERIVA_Y) + 10, 226, `${COMA(DERIVA_Y, 6)} m`, { size: 11.5, bold: true, fill: AZUL }),
    texto(sx(DERIVA_Y) + 10, 242, `${COMA(100 * razonY, 1)} % del límite`, { size: 11, fill: AZUL }),
    `<line x1="${sx(LIM_DERIVA).toFixed(1)}" y1="118" x2="${sx(LIM_DERIVA).toFixed(1)}" y2="272" stroke="${VERDE}" stroke-width="2.2"/>`,
    texto(sx(LIM_DERIVA), 110, `0,015·h = ${COMA(LIM_DERIVA, 3)} m`, {
      size: 11.5,
      bold: true,
      fill: VERDE,
      anchor: 'middle',
    }),
  ].join('\n  ');

  const x1 = 606;
  const wPlot2 = 264;
  const eMax = 40;
  const sx2 = escala(0, eMax, x1, x1 + wPlot2);

  const ticks2 = [0, 10, 20, 30, 40];
  const ejes2 = ticks2
    .map(
      (t) =>
        `<line x1="${sx2(t).toFixed(1)}" y1="118" x2="${sx2(t).toFixed(1)}" y2="272" stroke="${BORDE}" stroke-width="1"/>\n  ` +
        texto(sx2(t), 290, `${MILES(t)} %`, { size: 11, fill: SUAVE, anchor: 'middle' }),
    )
    .join('\n  ');

  const barras2 = MALLA.map((m, i) => {
    const yy = 132 + i * 28;
    const mata = m.err > margen;
    // Las barras cortas quedan a la izquierda de la línea del margen: su
    // etiqueta se corre al otro lado para no cruzarla.
    const xEtiq = Math.max(sx2(m.err) + 8, sx2(margen) + 12);
    return [
      `<rect x="${sx2(0).toFixed(1)}" y="${yy}" width="${(sx2(m.err) - sx2(0)).toFixed(1)}" height="19" rx="3" fill="${mata ? ROJO : VERDE}" fill-opacity="${mata ? 0.8 : 0.5}"/>`,
      texto(x1 - 10, yy + 14, `N = ${m.n}`, { size: 11, fill: TINTA, anchor: 'end' }),
      texto(xEtiq, yy + 14, `+${COMA(m.err, 2)} %`, {
        size: 10.5,
        bold: mata,
        fill: mata ? ROJO : SUAVE,
      }),
      mata ? texto(xEtiq + 60, yy + 14, 'veredicto falso', { size: 10, fill: ROJO }) : '',
    ].join('\n  ');
  }).join('\n  ');

  const lineaMargen = [
    `<line x1="${sx2(margen).toFixed(1)}" y1="118" x2="${sx2(margen).toFixed(1)}" y2="272" stroke="${AMBAR}" stroke-width="2.2" stroke-dasharray="6 4"/>`,
    texto(sx2(margen) + 6, 112, `margen real: ${COMA(margen, 1)} %`, {
      size: 11.5,
      bold: true,
      fill: AMBAR,
    }),
  ].join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="Segoe UI, Arial, sans-serif">
  <rect width="${W}" height="${H}" fill="#ffffff"/>
  ${texto(W / 2, 34, 'La deriva pasa por 5,4 % — y ese margen es más chico que el error de una malla gruesa', { size: 15.5, bold: true, fill: '#222', anchor: 'middle' })}
  ${texto(W / 2, 56, 'Desplazamientos con el espectro de referencia de §6.1 (sin R*, con (0,05/ξ)^0,4 y con I) y la simultaneidad de §4.5.2', { size: 12, fill: SUAVE, anchor: 'middle' })}
  ${texto(x0 - 12, 88, 'Desplazamiento de alero [m], contra el límite de §6.3', { size: 12, bold: true, fill: TINTA })}
  ${texto(x1 - 10, 88, 'Cuánto sobreestima la deriva cada malla (§5.34)', { size: 12, bold: true, fill: TINTA })}
  ${ejes}
  ${barras}
  ${ejes2}
  ${barras2}
  ${lineaMargen}
  ${texto(x0 - 12, 332, 'La dirección de marcos usa el 94,6 % del límite y la arriostrada el 5,8 %:', { size: 11, fill: TINTA })}
  ${texto(x0 - 12, 350, `el mismo edificio, la misma masa, y ${COMA(DERIVA_X / DERIVA_Y, 1)} veces de diferencia.`, { size: 11, fill: TINTA })}
  ${texto(x0 - 12, 376, 'El mismo 0,015·h de §6.3 es el gatillo del P-Delta de §6.4: estamos a un 5 %', { size: 11, fill: TINTA })}
  ${texto(x0 - 12, 394, 'de tener que correr segundo orden. Y C6.4 avisa que el P-Delta «puede serlo', { size: 11, fill: TINTA })}
  ${texto(x0 - 12, 412, 'en estructuras de marcos resistentes a momento».', { size: 11, fill: TINTA })}
  ${texto(x1 - 10, 332, 'N es el número de tramos por columna del peralte variable, contra', { size: 11, fill: TINTA })}
  ${texto(x1 - 10, 350, 'N = 36 como referencia. La malla adoptada es N = 4: cae entre las', { size: 11, fill: TINTA })}
  ${texto(x1 - 10, 368, 'filas N = 3 y N = 6, o sea entre +3,98 % y +0,95 %. Con uno o dos', { size: 11, fill: TINTA })}
  ${texto(x1 - 10, 386, 'tramos por columna el error solo se habría comido el margen: la', { size: 11, fill: TINTA })}
  ${texto(x1 - 10, 404, 'deriva habría «reprobado» sin que nada en la salida lo delatara.', { size: 11, fill: TINTA })}
  ${texto(x0 - 12, 462, 'Desplazamientos del modelo galpon_altiplano.sdb (SAP2000 v27.1), caso espectral de referencia · chequeo de consistencia: bajo el caso de diseño', { size: 10.5, fill: SUAVE })}
  ${texto(x0 - 12, 478, 'el mismo nodo da 0,028105 m, y 0,112442 / 0,028105 = 4,0009 ≈ R*_X = 4,0', { size: 10.5, fill: SUAVE })}
  ${texto(x0 - 12, 498, 'NCh2369:2025 (3.ª ed.) · §6.1, §6.3 y §6.4 con C6.4, págs. impresas 68-70, leídas rasterizadas el 2026-08-12', { size: 10.5, fill: SUAVE })}
</svg>
`;
}

// ------------------------------------------------------------------- emisión

await mkdir(OUT_DIR, { recursive: true });
const figuras = [
  ['la-fila-no-la-eliges.svg', figuraFila()],
  ['el-minimo-se-come-el-r.svg', figuraBanda()],
  ['la-deriva-y-el-mallado.svg', figuraDeriva()],
];
for (const [nombre, svg] of figuras) {
  await writeFile(path.join(OUT_DIR, nombre), svg, 'utf8');
  console.log(`  ${path.relative(ROOT, path.join(OUT_DIR, nombre))}`);
}

console.log('');
console.log(`R*_X  R=4: ${rStar(T_STAR_X, 4)}  R=5: ${rStar(T_STAR_X, 5)}`);
console.log(`R*_Y  R=4: ${rStar(T_STAR_Y, 4)}  R=5: ${rStar(T_STAR_Y, 5)}`);
console.log(`codo  R=4: ${codo(4)} s   R=5: ${codo(5)} s   (T*_Y = ${T_STAR_Y})`);
console.log(`T*_Y bajo el codo de R=4 por ${(100 * (1 - T_STAR_Y / codo(4))).toFixed(4)} %`);
console.log(`Q0min ${q0Min}  ·  Q0max R=4 ${q0Max(4)}  ·  Q0max R=5 ${q0Max(5)}`);
console.log(`R=5, X: ${R5.q0x} kN → ${(100 * (1 - R5.q0x / q0Min)).toFixed(4)} % bajo el minimo`);
console.log(`5.12 amplifica por ${FACTOR_12}  ·  Ec. (14) → R1 = ${R1_X_R5}`);
console.log(`Q0Y/Q0X (R=4): ${(100 * (Q0[4].Y / Q0[4].X - 1)).toFixed(4)} %`);
console.log(`Q0_REF/Q0_dis  X: ${Q0_REF.X / Q0[4].X}   Y: ${Q0_REF.Y / Q0[4].Y}`);
console.log(
  `deriva X ${DERIVA_X} / ${LIM_DERIVA} = ${DERIVA_X / LIM_DERIVA}  → margen ${(100 * (1 - DERIVA_X / LIM_DERIVA)).toFixed(4)} %`,
);
console.log(`deriva Y ${DERIVA_Y} / ${LIM_DERIVA} = ${DERIVA_Y / LIM_DERIVA}`);
