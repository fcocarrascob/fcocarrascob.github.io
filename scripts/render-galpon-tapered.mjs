#!/usr/bin/env node
// Dibuja las dos figuras calculadas del post del peralte variable del galpón
// (/blog/rukan-verificacion-galpon-tapered).
//
//   npm run figuras:galpon-tapered
//
// Los números salen de `lab/nota06_tapered_convergencia.py` del repo de rukan,
// que resuelve el marco tipo por DOS caminos independientes —rigidez directa en
// numpy puro y OpenSeesPy— y verifica que coincidan antes de imprimir nada. Van
// sin redondear, tal como los emite la nota.
//
// Emite a public/rukan-verificacion-galpon-tapered/:
//   el-prismatico-es-un-tramo.svg   el momento de rodilla y de cumbrera vs. N,
//                                   y los tres prismáticos que no se mueven
//   la-malla-la-fija-la-deriva.svg  las tres magnitudes convergiendo a ritmos
//                                   que difieren en un factor 14,5
//
// El SVG no hereda las variables CSS del sitio (se sirve como <img>): colores
// literales y coma decimal, como el resto de las figuras.

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT_DIR = path.join(ROOT, 'public/rukan-verificacion-galpon-tapered');

// ------------------------------------------------------------------ los datos

// Marco tipo del galpón: luz 24,0 m, pendiente 10°, alero 8,0 m, bases
// articuladas, columna 350→800 mm y dintel 800→350 mm, alas 220×12 y alma 6 mm,
// ancho tributario 6,0 m. Gravedad G3A_B = 1,2(D + D_sd) + 1,6·S.
const D_BASE = 350;
const D_ALERO = 800;
const D_MEDIO = (D_BASE + D_ALERO) / 2; // 575 mm

// Referencia de malla fina: N = 36 tramos por miembro.
const TAPERED = {
  T1: 0.8616139790884352,
  dx: 0.0014653928120272092,
  dz: 0.17272903405117836,
  Ma: 678.4589594102098,
  Mc: 210.72596081586316,
};

// Prismáticos equivalentes, con la misma malla fina.
const PRISMATICOS = [
  { d: D_BASE, T1: 1.7066587574921716, dx: 0.006030360330117, Ma: 547.7215596069652, Mc: 369.9613440452216 },
  { d: D_MEDIO, T1: 1.0025097938561756, dx: 0.0020132894739, Ma: 552.1811909459977, Mc: 373.4397856166894 },
  { d: D_ALERO, T1: 0.7022821309266565, dx: 0.0009568031612005, Ma: 556.5525351887336, Mc: 377.0300647037241 },
];

// Convergencia de la discretización del tapered. N = tramos por miembro.
const MALLA = [
  { n: 1, T1: 0.9876910369023997, dx: 0.002145449467149935, dz: 0.17825210682427145, Ma: 552.1812270099049, Mc: 373.43981970801894 },
  { n: 2, T1: 0.8968010385731601, dx: 0.0016568834818771543, dz: 0.17351093419419852, Ma: 649.1359290202422, Mc: 248.56209226618057 },
  { n: 3, T1: 0.877081388422941, dx: 0.0015596976211846689, dz: 0.17306865681035125, Ma: 665.8882139036123, Mc: 226.95687088020503 },
  { n: 4, T1: 0.8701933339801939, dx: 0.0015237047223259483, dz: 0.1729233031379364, Ma: 671.5294749839068, Mc: 219.67580912556693 },
  { n: 6, T1: 0.8653337437320784, dx: 0.001495665069745039, dz: 0.1728158246467433, Ma: 675.4640292348995, Mc: 214.59507357169147 },
  { n: 9, T1: 0.8632003856423225, dx: 0.0014811637908196795, dz: 0.17276563447494153, Ma: 677.1830520804288, Mc: 212.37448369924368 },
  { n: 12, T1: 0.862458618169395, dx: 0.0014751196581350582, dz: 0.1727475514879388, Ma: 677.779961868102, Mc: 211.60328130858767 },
];

// ------------------------------------------------------ el contraste que manda
//
// Dos identidades tienen que cerrar, o el script no dibuja. La primera es el
// hallazgo que estructura el post; la segunda es la que da vuelta la intuición.

const PRISM_MEDIO = PRISMATICOS.find((p) => p.d === D_MEDIO);
const N1 = MALLA.find((m) => m.n === 1);

const err = (a, b) => Math.abs(a / b - 1);
// El prismático de peralte medio ES la malla de un tramo: con N = 1 la sección se
// toma en el punto medio del miembro, que es exactamente d = 575 mm. La identidad
// vale para el REPARTO DE MOMENTOS, que es lo que gobierna el diseño y no depende
// de ninguna masa. Es exacta en teoría, no bit a bit: el prismático se resuelve
// con la malla fina de 36 tramos y N = 1 con uno solo, y subdividir una barra
// prismática —exacto para Euler-Bernoulli— cambia el ensamble y con él el
// redondeo. Queda en 7·10⁻⁸.
const CHEQUEOS = [
  ['M rodilla: prismático 575 = malla N = 1', PRISM_MEDIO.Ma, N1.Ma],
  ['M cumbrera: prismático 575 = malla N = 1', PRISM_MEDIO.Mc, N1.Mc],
];
for (const [rot, a, b] of CHEQUEOS) {
  if (err(a, b) > 1e-6) {
    throw new Error(`${rot}: ${a} contra ${b} (${(100 * err(a, b)).toFixed(6)} %)`);
  }
}

// El período y la deriva SÍ se separan (1,500 % y 6,160 %), y no por la sección: por
// dónde queda la masa. Concentrarla en los nudos reparte distinto con 36 tramos
// que con uno, y la fuerza lateral —proporcional a esa masa— se corre con ella.
// Es un artefacto de la malla, no del peralte, y por eso el contraste de momentos
// es el que sostiene el argumento.
const SEP_T1 = err(PRISM_MEDIO.T1, N1.T1);
const SEP_DX = err(PRISM_MEDIO.dx, N1.dx);
if (SEP_T1 > 0.05 || SEP_DX > 0.15) {
  throw new Error(`la masa concentrada no debería separarlos tanto: ${SEP_T1}, ${SEP_DX}`);
}

// La deriva converge mucho más lento que la flecha: el factor entre sus errores
// con un solo tramo es el número que sostiene la última sección del post.
const E_DERIVA_N1 = err(N1.dx, TAPERED.dx);
const E_FLECHA_N1 = err(N1.dz, TAPERED.dz);
const FACTOR_LENTITUD = E_DERIVA_N1 / E_FLECHA_N1;
if (FACTOR_LENTITUD < 10) {
  throw new Error(`la deriva debería converger mucho más lento: factor ${FACTOR_LENTITUD}`);
}

// ---------------------------------------------------------------- utilidades

const COMA = (x, dec = 2) => x.toFixed(dec).replace('.', ',');
const PCT = (v, ref) => (100 * (v / ref - 1));

const TINTA = '#333';
const SUAVE = '#6b7280';
const BORDE = '#d1d5db';
const AZUL = '#1a63a8';
const ROJO = '#b02a1a';
const VERDE = '#1f7a4d';
const AMBAR = '#b45309';
const GRIS = '#9ca3af';

const escala = (d0, d1, p0, p1) => (v) => p0 + ((v - d0) / (d1 - d0)) * (p1 - p0);

function texto(x, y, s, { size = 12, fill = TINTA, anchor = 'start', bold = false } = {}) {
  const peso = bold ? ' font-weight="bold"' : '';
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" text-anchor="${anchor}"${peso}>${s}</text>`;
}

function marco(W, H, titulo, subtitulo, cuerpo) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif">
  <rect width="${W}" height="${H}" fill="#ffffff"/>
  ${texto(48, 46, titulo, { size: 21, bold: true })}
  ${texto(48, 72, subtitulo, { size: 13, fill: SUAVE })}
  ${cuerpo}
</svg>
`;
}

// ------------- figura 1: el prismático equivalente es la malla de un tramo

function figuraPrismatico() {
  const W = 1000;
  const H = 620;

  // Panel: momento (kN·m) contra N, con las dos estaciones.
  const x0 = 92;
  const x1 = 600;
  const yTop = 132;
  const yBot = 470;
  const sx = escala(0, 13, x0, x1);
  const sy = escala(140, 720, yBot, yTop);

  const eje = [
    `<line x1="${x0}" y1="${yBot}" x2="${x1 + 16}" y2="${yBot}" stroke="${BORDE}" stroke-width="1.4"/>`,
    `<line x1="${x0}" y1="${yTop - 12}" x2="${x0}" y2="${yBot}" stroke="${BORDE}" stroke-width="1.4"/>`,
    texto(x0 - 10, yBot + 22, 'N =', { size: 11, fill: SUAVE, anchor: 'end' }),
  ];
  for (const m of MALLA) {
    eje.push(texto(sx(m.n), yBot + 22, String(m.n), { size: 11, fill: SUAVE, anchor: 'middle' }));
    eje.push(
      `<line x1="${sx(m.n)}" y1="${yBot}" x2="${sx(m.n)}" y2="${yBot + 5}" stroke="${BORDE}" stroke-width="1.2"/>`,
    );
  }
  for (const v of [200, 300, 400, 500, 600, 700]) {
    eje.push(
      `<line x1="${x0}" y1="${sy(v)}" x2="${x1 + 16}" y2="${sy(v)}" stroke="#eef1f4" stroke-width="1"/>`,
    );
    eje.push(texto(x0 - 10, sy(v) + 4, String(v), { size: 10, fill: SUAVE, anchor: 'end' }));
  }
  eje.push(texto(x0 - 66, yTop - 24, 'M₃ [kN·m]', { size: 11, fill: SUAVE }));

  const linea = (campo, color) =>
    `<polyline points="${MALLA.map((m) => `${sx(m.n)},${sy(m[campo])}`).join(' ')}" fill="none" stroke="${color}" stroke-width="2.4"/>` +
    MALLA.map(
      (m) => `<circle cx="${sx(m.n)}" cy="${sy(m[campo])}" r="3.4" fill="${color}"/>`,
    ).join('');

  // Las asíntotas del tapered (N = 36). El rótulo va DENTRO del panel: a la
  // derecha choca con la tabla.
  const asintota = (v, color, rot, dy) =>
    `<line x1="${x0}" y1="${sy(v)}" x2="${x1 + 16}" y2="${sy(v)}" stroke="${color}" stroke-width="1.4" stroke-dasharray="6 4" opacity="0.75"/>` +
    texto(x1 + 12, sy(v) + dy, rot, { size: 10.5, fill: color, anchor: 'end' });

  // La banda de los tres prismáticos: casi no se mueve.
  const mas = PRISMATICOS.map((p) => p.Ma);
  const mcs = PRISMATICOS.map((p) => p.Mc);
  const banda = (arr, color) => {
    const lo = Math.min(...arr);
    const hi = Math.max(...arr);
    return `<rect x="${x0}" y="${sy(hi)}" width="${x1 - x0 + 16}" height="${Math.max(sy(lo) - sy(hi), 3)}" fill="${color}" opacity="0.16"/>`;
  };

  const cuerpo = [
    ...eje,
    banda(mas, ROJO),
    banda(mcs, ROJO),
    asintota(TAPERED.Ma, AZUL, 'tapered (N = 36)', -8),
    asintota(TAPERED.Mc, VERDE, 'tapered (N = 36)', 16),
    linea('Ma', AZUL),
    linea('Mc', VERDE),
    texto(sx(6), sy(TAPERED.Ma) - 16, 'rodilla', { size: 12, fill: AZUL, bold: true }),
    texto(sx(6), sy(TAPERED.Mc) + 26, 'cumbrera', { size: 12, fill: VERDE, bold: true }),
    // El punto N = 1, marcado.
    `<circle cx="${sx(1)}" cy="${sy(N1.Ma)}" r="7" fill="none" stroke="${ROJO}" stroke-width="2.2"/>`,
    `<circle cx="${sx(1)}" cy="${sy(N1.Mc)}" r="7" fill="none" stroke="${ROJO}" stroke-width="2.2"/>`,
  ];

  // Panel derecho: la tabla de los tres prismáticos.
  const tx = 660;
  let ty = 150;
  const tabla = [
    texto(tx, ty, 'Los tres prismáticos equivalentes', { size: 13, bold: true }),
    texto(tx, ty + 20, 'malla fina, para que no se mezcle con la discretización', {
      size: 10.5,
      fill: SUAVE,
    }),
  ];
  ty += 52;
  tabla.push(texto(tx, ty, 'd [mm]', { size: 10.5, fill: SUAVE }));
  tabla.push(texto(tx + 118, ty, 'T₁ [s]', { size: 10.5, fill: SUAVE, anchor: 'end' }));
  tabla.push(texto(tx + 210, ty, 'M rodilla', { size: 10.5, fill: SUAVE, anchor: 'end' }));
  tabla.push(texto(tx + 306, ty, 'M cumbrera', { size: 10.5, fill: SUAVE, anchor: 'end' }));
  ty += 8;
  tabla.push(
    `<line x1="${tx}" y1="${ty}" x2="${tx + 306}" y2="${ty}" stroke="${BORDE}" stroke-width="1.2"/>`,
  );
  ty += 20;
  for (const p of PRISMATICOS) {
    const marca = p.d === D_MEDIO;
    tabla.push(texto(tx, ty, String(p.d), { size: 12, bold: marca, fill: marca ? ROJO : TINTA }));
    tabla.push(texto(tx + 118, ty, COMA(p.T1, 3), { size: 12, anchor: 'end' }));
    tabla.push(texto(tx + 210, ty, COMA(p.Ma, 1), { size: 12, anchor: 'end' }));
    tabla.push(texto(tx + 306, ty, COMA(p.Mc, 1), { size: 12, anchor: 'end' }));
    ty += 26;
  }
  ty += 6;
  tabla.push(
    `<line x1="${tx}" y1="${ty - 16}" x2="${tx + 306}" y2="${ty - 16}" stroke="${BORDE}" stroke-width="1.2"/>`,
  );
  tabla.push(texto(tx, ty + 4, 'tapered', { size: 12, bold: true, fill: AZUL }));
  tabla.push(texto(tx + 118, ty + 4, COMA(TAPERED.T1, 3), { size: 12, anchor: 'end', bold: true }));
  tabla.push(texto(tx + 210, ty + 4, COMA(TAPERED.Ma, 1), { size: 12, anchor: 'end', bold: true }));
  tabla.push(texto(tx + 306, ty + 4, COMA(TAPERED.Mc, 1), { size: 12, anchor: 'end', bold: true }));

  ty += 52;
  const rangoT = PRISMATICOS[0].T1 / PRISMATICOS[2].T1;
  const rangoMa = Math.max(...mas) / Math.min(...mas) - 1;
  const rangoMc = Math.max(...mcs) / Math.min(...mcs) - 1;
  tabla.push(
    `<rect x="${tx - 14}" y="${ty - 16}" width="${300}" height="${118}" rx="8" fill="#fdf6f4" stroke="${ROJO}" stroke-width="1.4"/>`,
  );
  tabla.push(
    texto(tx, ty + 6, `El período se mueve ×${COMA(rangoT, 1)}…`, { size: 12.5, bold: true, fill: ROJO }),
  );
  tabla.push(
    texto(tx, ty + 28, `…y los momentos, ${COMA(100 * rangoMa, 1)} % y ${COMA(100 * rangoMc, 1)} %.`, {
      size: 12.5,
      fill: TINTA,
    }),
  );
  tabla.push(
    texto(tx, ty + 54, 'El reparto lo decide la RAZÓN entre', { size: 11.5, fill: SUAVE }),
  );
  tabla.push(texto(tx, ty + 71, 'rigideces, no su nivel. Cambiar el', { size: 11.5, fill: SUAVE }));
  tabla.push(texto(tx, ty + 88, 'peralte parejo no redistribuye nada.', { size: 11.5, fill: SUAVE }));

  // Pie: el hallazgo.
  const pie = [
    `<rect x="48" y="${H - 92}" width="${W - 96}" height="60" rx="8" fill="#f7f9fb" stroke="${BORDE}" stroke-width="1.2"/>`,
    texto(
      70,
      H - 66,
      `El prismático de peralte medio (d = ${D_MEDIO} mm) NO es una alternativa a discretizar: es la malla de UN tramo.`,
      { size: 13, bold: true },
    ),
    texto(
      70,
      H - 46,
      `Con N = 1 la sección se toma en el punto medio del miembro, y el reparto de momentos da los mismos ${COMA(N1.Ma, 2)} y ${COMA(N1.Mc, 2)} kN·m.`,
      { size: 12, fill: SUAVE },
    ),
  ];

  return marco(
    W,
    H,
    'El prismático equivalente es la malla de un tramo',
    `Momento de rodilla y de cumbrera del marco tipo bajo 1,2(D + D_sd) + 1,6·S, contra el número de tramos prismáticos por miembro. Tapered ${D_BASE} ↔ ${D_ALERO} mm.`,
    [...cuerpo, ...tabla, ...pie].join('\n  '),
  );
}

// ------------------------- figura 2: la malla la fija la deriva

function figuraMalla() {
  const W = 1000;
  const H = 592;

  const x0 = 96;
  const x1 = 720;
  const yTop = 136;
  const yBot = 428;
  const sx = escala(0, 13, x0, x1);
  // Escala logarítmica en el error, que es donde se ve el factor 15.
  const sy = escala(Math.log10(0.005), Math.log10(60), yBot, yTop);

  const eje = [
    `<line x1="${x0}" y1="${yBot}" x2="${x1 + 12}" y2="${yBot}" stroke="${BORDE}" stroke-width="1.4"/>`,
    `<line x1="${x0}" y1="${yTop - 12}" x2="${x0}" y2="${yBot}" stroke="${BORDE}" stroke-width="1.4"/>`,
    texto(x0 - 12, yBot + 22, 'N =', { size: 11, fill: SUAVE, anchor: 'end' }),
    texto(x0 - 74, yTop - 24, 'error vs. N = 36', { size: 11, fill: SUAVE }),
  ];
  for (const m of MALLA) {
    eje.push(texto(sx(m.n), yBot + 22, String(m.n), { size: 11, fill: SUAVE, anchor: 'middle' }));
  }
  for (const v of [0.01, 0.1, 1, 10]) {
    eje.push(
      `<line x1="${x0}" y1="${sy(Math.log10(v))}" x2="${x1 + 12}" y2="${sy(Math.log10(v))}" stroke="#eef1f4" stroke-width="1"/>`,
    );
    eje.push(
      texto(x0 - 10, sy(Math.log10(v)) + 4, `${COMA(v, v < 1 ? 2 : 0)} %`, {
        size: 10,
        fill: SUAVE,
        anchor: 'end',
      }),
    );
  }

  const series = [
    { campo: 'dx', ref: TAPERED.dx, color: ROJO, rot: 'deriva de alero' },
    { campo: 'T1', ref: TAPERED.T1, color: AMBAR, rot: 'período T₁' },
    { campo: 'dz', ref: TAPERED.dz, color: VERDE, rot: 'flecha de cumbrera' },
  ];
  const curvas = series.flatMap((s) => {
    const pts = MALLA.map((m) => ({ n: m.n, e: Math.abs(PCT(m[s.campo], s.ref)) }));
    const poly = pts.map((p) => `${sx(p.n)},${sy(Math.log10(p.e))}`).join(' ');
    const ult = pts[pts.length - 1];
    return [
      `<polyline points="${poly}" fill="none" stroke="${s.color}" stroke-width="2.6"/>`,
      ...pts.map((p) => `<circle cx="${sx(p.n)}" cy="${sy(Math.log10(p.e))}" r="3.6" fill="${s.color}"/>`),
      texto(sx(ult.n) + 14, sy(Math.log10(ult.e)) + 4, s.rot, { size: 12, fill: s.color, bold: true }),
    ];
  });

  // La malla adoptada por el modelo.
  const n4 = MALLA.find((m) => m.n === 4);
  const anot = [
    `<line x1="${sx(4)}" y1="${yTop - 12}" x2="${sx(4)}" y2="${yBot}" stroke="${AZUL}" stroke-width="1.4" stroke-dasharray="5 4"/>`,
    texto(sx(4) + 8, yTop + 4, 'N = 4 uniforme', { size: 11, fill: AZUL, bold: true }),
    texto(sx(4) + 8, yTop + 20, `deriva ${COMA(Math.abs(PCT(n4.dx, TAPERED.dx)), 2)} %`, {
      size: 11,
      fill: AZUL,
    }),
  ];

  const caja = [
    `<rect x="48" y="${H - 108}" width="${W - 96}" height="76" rx="8" fill="#fdf6f4" stroke="${ROJO}" stroke-width="1.4"/>`,
    texto(
      70,
      H - 80,
      `Con un solo tramo la flecha se equivoca ${COMA(100 * E_FLECHA_N1, 2)} % y la deriva ${COMA(100 * E_DERIVA_N1, 1)} %: un factor ${COMA(FACTOR_LENTITUD, 1)}.`,
      { size: 13.5, bold: true },
    ),
    texto(
      70,
      H - 58,
      'Con base articulada el momento de la columna es cero abajo y máximo en la rodilla, así que la deriva la gobierna',
      { size: 12, fill: SUAVE },
    ),
    texto(
      70,
      H - 41,
      `el peralte del extremo (d = ${D_ALERO} mm) y no el del promedio. La flecha del dintel la manda la zona central, y casi no se entera.`,
      { size: 12, fill: SUAVE },
    ),
  ];

  return marco(
    W,
    H,
    'La malla del tapered la fija la deriva, no la flecha',
    'Error de cada magnitud contra la malla de referencia (N = 36 tramos por miembro), en escala logarítmica.',
    [...eje, ...curvas, ...anot, ...caja].join('\n  '),
  );
}

// ---------------------------------------------------------------------- salida

await mkdir(OUT_DIR, { recursive: true });
const figuras = [
  ['el-prismatico-es-un-tramo.svg', figuraPrismatico()],
  ['la-malla-la-fija-la-deriva.svg', figuraMalla()],
];
for (const [nombre, svg] of figuras) {
  await writeFile(path.join(OUT_DIR, nombre), svg, 'utf8');
  console.log(`  ${path.relative(ROOT, path.join(OUT_DIR, nombre))}`);
}

console.log('');
console.log(`prismatico d=575 == malla N=1: rodilla ${PRISM_MEDIO.Ma} vs ${N1.Ma}`);
console.log(`                               cumbrera ${PRISM_MEDIO.Mc} vs ${N1.Mc}`);
console.log(
  `prismaticos: T1 x${(PRISMATICOS[0].T1 / PRISMATICOS[2].T1).toFixed(3)} y momentos ${(100 * (Math.max(...PRISMATICOS.map((p) => p.Ma)) / Math.min(...PRISMATICOS.map((p) => p.Ma)) - 1)).toFixed(2)} % / ${(100 * (Math.max(...PRISMATICOS.map((p) => p.Mc)) / Math.min(...PRISMATICOS.map((p) => p.Mc)) - 1)).toFixed(2)} %`,
);
console.log(
  `tapered vs prismatico 575: rodilla ${PCT(PRISM_MEDIO.Ma, TAPERED.Ma).toFixed(2)} %  cumbrera ${PCT(PRISM_MEDIO.Mc, TAPERED.Mc).toFixed(2)} %`,
);
console.log(
  `N=1: deriva ${(100 * E_DERIVA_N1).toFixed(2)} %  flecha ${(100 * E_FLECHA_N1).toFixed(2)} %  factor ${FACTOR_LENTITUD.toFixed(1)}`,
);
