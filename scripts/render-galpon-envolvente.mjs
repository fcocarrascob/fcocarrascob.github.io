#!/usr/bin/env node
// Dibuja las dos figuras calculadas del post de la envolvente del galpón
// (/blog/rukan-verificacion-galpon-envolvente).
//
//   npm run figuras:galpon-envolvente
//
// Los datos salen de las cabeceras `# Result:` de
// `Skills_SAP/scripts/galpon_altiplano_combos.py` (los 79 nombres, en su orden
// de creación) y `galpon_altiplano_envolvente.py` (la gobernante por miembro),
// y de la corrida de `rukan/verification/case10_galpon_altiplano.py`, que las
// reproduce en 29 de 30. Registro en SERIE-GALPON.md §5.37 y §5.47.
//
// Emite a public/rukan-verificacion-galpon-envolvente/:
//   nueve-de-setenta-y-nueve.svg  el árbol completo, con las que gobiernan
//   la-estacion-del-medio.svg     las tres estaciones del dintel de cumbrera
//
// El SVG no hereda las variables CSS del sitio (se sirve como <img>): colores
// literales y coma decimal, como el resto de las figuras.

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT_DIR = path.join(ROOT, 'public/rukan-verificacion-galpon-envolvente');

// ------------------------------------------------------------------ los datos

// Los 79 nombres, en el orden en que el script los crea. NCh3171 §9.1.1 para
// gravedad y viento (63), NCh2369 §4.5.1 con la simultaneidad de §4.5.2 para
// sismo (12), y 4 de la rama ilustrativa con R = 5.
const COMBOS = [
  'G1',
  'G2_B', 'G2_I', 'G2_D', 'G3A_B', 'G3A_I', 'G3A_D',
  'G3B_BTXPP', 'G4_BTXPP', 'G3B_BTXPN', 'G4_BTXPN', 'G3B_BTXNP', 'G4_BTXNP',
  'G3B_BTXNN', 'G4_BTXNN', 'G3B_BLYPP', 'G4_BLYPP', 'G3B_BLYPN', 'G4_BLYPN',
  'G3B_BLYNP', 'G4_BLYNP', 'G3B_BLYNN', 'G4_BLYNN', 'G3B_ITXPP', 'G4_ITXPP',
  'G3B_ITXPN', 'G4_ITXPN', 'G3B_ITXNP', 'G4_ITXNP', 'G3B_ITXNN', 'G4_ITXNN',
  'G3B_ILYPP', 'G4_ILYPP', 'G3B_ILYPN', 'G4_ILYPN', 'G3B_ILYNP', 'G4_ILYNP',
  'G3B_ILYNN', 'G4_ILYNN', 'G3B_DTXPP', 'G4_DTXPP', 'G3B_DTXPN', 'G4_DTXPN',
  'G3B_DTXNP', 'G4_DTXNP', 'G3B_DTXNN', 'G4_DTXNN', 'G3B_DLYPP', 'G4_DLYPP',
  'G3B_DLYPN', 'G4_DLYPN', 'G3B_DLYNP', 'G4_DLYNP', 'G3B_DLYNN', 'G4_DLYNN',
  'G6_TXPP', 'G6_TXPN', 'G6_TXNP', 'G6_TXNN', 'G6_LYPP', 'G6_LYPN', 'G6_LYNP', 'G6_LYNN',
  'E1P_A', 'E1P_B', 'E1N_A', 'E1N_B', 'E2P_A', 'E2P_B', 'E2N_A', 'E2N_B',
  'E3P_A', 'E3P_B', 'E3N_A', 'E3N_B',
  'R5_1P', 'R5_1N', 'R5_2P', 'R5_2N',
];

// La gobernante por miembro (P compresión, P tracción, |M3|), medida por rukan
// sobre las 79 y coincidente con SAP en 29 de 30.
const GOBERNANTES = {
  'COL3A_1': ['G3A_B', 'G6_TXPP', 'G3A_B'],
  'COL3A_4': ['G3A_B', 'G6_TXPP', 'G3A_B'],
  'DIN3_1': ['G3A_B', 'G6_LYNP', 'G3A_B'],
  'DIN3_2': ['G3A_B', 'G6_LYNP', 'G3A_I'],
  'DIN3_3': ['G3A_B', 'G6_LYNP', 'G3A_B'],
  'PUN00_1': ['E2N_B', 'E2P_A', 'E3P_A'],
  'PUN09_2': ['G3A_B', 'G6_TXNP', 'E3P_A'],
  'ARWA1_1': ['E2P_A', 'E2N_B', 'E3P_A'],
  'ART1_00_1': ['G3A_B', 'E2N_B', 'E3P_A'],
  'PIL1_06': ['E3P_A', null, 'G4_BLYPN'], // la tracción es un empate en 0,0
};

const ETIQUETA = {
  'COL3A_1': 'columna, base',
  'COL3A_4': 'columna, rodilla',
  'DIN3_1': 'dintel, rodilla',
  'DIN3_2': 'dintel, medio',
  'DIN3_3': 'dintel, cumbrera',
  'PUN00_1': 'puntal de alero',
  'PUN09_2': 'puntal de cumbrera',
  'ARWA1_1': 'media diagonal de muro',
  'ART1_00_1': 'media diagonal de techo',
  'PIL1_06': 'pilar de hastial',
};

// Las tres estaciones del dintel de cumbrera bajo G3A_B (§5.47). El valor del
// centro se midió partiendo el elemento en dos, que para una barra prismática
// con carga uniforme es exacto.
const DIN3_3 = { i: 163.0409, m: 207.9321, j: 193.6238 };

// ------------------------------------------------------ el contraste que manda

if (COMBOS.length !== 79) {
  throw new Error(`son 79 combinaciones, no ${COMBOS.length}`);
}
const GRAVEDAD = COMBOS.filter((c) => c[0] === 'G');
const SISMO = COMBOS.filter((c) => c[0] === 'E');
const R5 = COMBOS.filter((c) => c.startsWith('R5_'));
if (GRAVEDAD.length !== 63 || SISMO.length !== 12 || R5.length !== 4) {
  throw new Error(`reparto: ${GRAVEDAD.length} / ${SISMO.length} / ${R5.length}`);
}

const USADAS = [...new Set(Object.values(GOBERNANTES).flat().filter(Boolean))];
for (const c of USADAS) {
  if (!COMBOS.includes(c)) throw new Error(`gobernante desconocida: ${c}`);
}
if (USADAS.length !== 9) {
  throw new Error(`deberían gobernar nueve, no ${USADAS.length}: ${USADAS}`);
}

// La estación central tiene que ser la que gobierna, y por un margen que se note.
const MARGEN = DIN3_3.m / Math.max(DIN3_3.i, DIN3_3.j) - 1;
if (MARGEN < 0.05) {
  throw new Error(`el centro debería gobernar con margen: ${MARGEN}`);
}

// ---------------------------------------------------------------- utilidades

const COMA = (x, dec = 2) => x.toFixed(dec).replace('.', ',');

const TINTA = '#333';
const SUAVE = '#6b7280';
const BORDE = '#d1d5db';
const AZUL = '#1a63a8';
const ROJO = '#b02a1a';
const VERDE = '#1f7a4d';
const AMBAR = '#b45309';
const GRIS = '#c7ccd1';

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

// ---------------- figura 1: nueve de setenta y nueve

function figuraNueve() {
  const W = 1000;
  const H = 556;

  // Rejilla de las 79, en filas por familia.
  const cel = 15;
  const gap = 4;
  const porFila = 16;
  const x0 = 60;
  let y = 158;

  const color = (c) => {
    if (!USADAS.includes(c)) return GRIS;
    if (c[0] === 'E') return ROJO;
    return AZUL;
  };

  const bloque = (rot, lista, sub) => {
    const out = [
      texto(x0, y - 26, rot, { size: 12.5, bold: true }),
      texto(x0, y - 10, sub, { size: 10.5, fill: SUAVE }),
    ];
    lista.forEach((c, i) => {
      const cx = x0 + (i % porFila) * (cel + gap);
      const cy = y + Math.floor(i / porFila) * (cel + gap);
      const gob = USADAS.includes(c);
      out.push(
        `<rect x="${cx}" y="${cy}" width="${cel}" height="${cel}" rx="3" fill="${color(c)}"${gob ? ' stroke="#333" stroke-width="1"' : ''}/>`,
      );
    });
    y += Math.ceil(lista.length / porFila) * (cel + gap) + 42;
    return out;
  };

  const rejilla = [
    ...bloque('63 de gravedad y viento', GRAVEDAD, 'NCh3171:2017 §9.1.1, ramas (1), (2), (3a), (3b), (4) y (6)'),
    ...bloque('12 sísmicas', SISMO, 'NCh2369:2025 §4.5.1 con la simultaneidad de §4.5.2'),
    ...bloque('4 de la rama ilustrativa', R5, 'con R = 5, para comparar'),
  ];

  // Las nueve que gobiernan, con quién.
  const tx = 470;
  let ty = 158;
  const lista = [texto(tx, ty - 8, 'Las nueve que dimensionan algo', { size: 13, bold: true })];
  ty += 14;
  const porQue = {
    G3A_B: 'nieve balanceada — la compresión de casi todo',
    G3A_I: 'nieve DESbalanceada — solo el dintel medio',
    G6_TXPP: 'viento transversal — tracción de columna',
    G6_TXNP: 'viento transversal — puntal de cumbrera',
    G6_LYNP: 'viento longitudinal — tracción de dintel',
    G4_BLYPN: 'viento + nieve — el pilar de hastial',
    E2P_A: 'sismo, ecuación 2 — diagonal de muro',
    E2N_B: 'sismo, ecuación 2 — puntal y diagonales',
    E3P_A: 'sismo, ecuación 3 — el M₃ de todo el arriostramiento',
  };
  for (const c of COMBOS.filter((c) => USADAS.includes(c))) {
    lista.push(
      `<rect x="${tx}" y="${ty - 10}" width="${cel}" height="${cel}" rx="3" fill="${color(c)}" stroke="#333" stroke-width="1"/>`,
    );
    lista.push(texto(tx + 24, ty + 2, c, { size: 11.5, bold: true }));
    lista.push(texto(tx + 116, ty + 2, porQue[c], { size: 11, fill: SUAVE }));
    ty += 24;
  }

  const caja = [
    `<rect x="48" y="${H - 116}" width="${W - 96}" height="84" rx="8" fill="#f7f9fb" stroke="${BORDE}" stroke-width="1.2"/>`,
    texto(70, H - 88, 'Nueve de setenta y nueve. Y las setenta que no gobiernan nada tampoco sobran:', {
      size: 13.5,
      bold: true,
    }),
    texto(
      70,
      H - 66,
      'no se sabe cuáles son hasta correrlas. Armar el árbol completo es barato —una suma lineal por combinación— y saltárselo',
      { size: 12, fill: SUAVE },
    ),
    texto(
      70,
      H - 49,
      'es la clase de atajo que se cobra en el miembro que a nadie se le ocurrió mirar: el dintel medio lo gobierna la nieve DESbalanceada.',
      { size: 12, fill: SUAVE },
    ),
  ];

  return marco(
    W,
    H,
    'De 79 combinaciones, nueve dimensionan algo',
    'Envolvente sobre los diez miembros de control del galpón. Cada cuadro es una combinación; las de borde oscuro gobiernan al menos una respuesta.',
    [...rejilla, ...lista, ...caja].join('\n  '),
  );
}

// ---------------- figura 2: la estación del medio

function figuraEstacion() {
  const W = 1000;
  const H = 520;

  // El faldón, de j = 6 a la cumbrera, con su diagrama de momento.
  const x0 = 140;
  const x1 = 720;
  const yBase = 300;
  const sx = (t) => x0 + t * (x1 - x0);
  const sy = (m) => yBase - (m / 240) * 150;

  const est = [
    { t: 0, v: DIN3_3.i, rot: 'estación i', sub: 'j = 6' },
    { t: 0.5, v: DIN3_3.m, rot: 'estación central', sub: 'la que gobierna' },
    { t: 1, v: DIN3_3.j, rot: 'estación j', sub: 'cumbrera' },
  ];

  // La parábola por los tres puntos.
  const pts = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    // interpolación cuadrática de Lagrange sobre (0, 0.5, 1)
    const v =
      DIN3_3.i * (2 * (t - 0.5) * (t - 1)) +
      DIN3_3.m * (-4 * t * (t - 1)) +
      DIN3_3.j * (2 * t * (t - 0.5));
    pts.push(`${sx(t)},${sy(v)}`);
  }

  const cuerpo = [
    // la barra
    `<line x1="${sx(0)}" y1="${yBase}" x2="${sx(1)}" y2="${yBase}" stroke="${TINTA}" stroke-width="3"/>`,
    // el diagrama
    `<polyline points="${pts.join(' ')}" fill="none" stroke="${AZUL}" stroke-width="2.6"/>`,
    `<polygon points="${sx(0)},${yBase} ${pts.join(' ')} ${sx(1)},${yBase}" fill="${AZUL}" opacity="0.09"/>`,
  ];

  for (const e of est) {
    const gob = e.t === 0.5;
    cuerpo.push(
      `<line x1="${sx(e.t)}" y1="${yBase}" x2="${sx(e.t)}" y2="${sy(e.v)}" stroke="${gob ? ROJO : SUAVE}" stroke-width="${gob ? 2.4 : 1.4}" stroke-dasharray="${gob ? '' : '4 4'}"/>`,
      `<circle cx="${sx(e.t)}" cy="${sy(e.v)}" r="${gob ? 6 : 4.5}" fill="${gob ? ROJO : AZUL}"/>`,
      texto(sx(e.t), sy(e.v) - 16, `${COMA(e.v, 3)} kN·m`, {
        size: gob ? 14 : 12.5,
        anchor: 'middle',
        bold: true,
        fill: gob ? ROJO : TINTA,
      }),
      texto(sx(e.t), yBase + 24, e.rot, { size: 12, anchor: 'middle', bold: gob, fill: gob ? ROJO : TINTA }),
      texto(sx(e.t), yBase + 40, e.sub, { size: 10.5, anchor: 'middle', fill: SUAVE }),
    );
  }

  const perdida = 100 * (1 - Math.max(DIN3_3.i, DIN3_3.j) / DIN3_3.m);
  cuerpo.push(
    texto(x1 + 40, sy(DIN3_3.m) + 4, 'M₃ bajo G3A_B', { size: 12, fill: SUAVE }),
    texto(x1 + 40, sy(DIN3_3.m) + 20, '1,2(D+Dsd) + 1,6·S', { size: 12, fill: SUAVE }),
  );

  const caja = [
    `<rect x="48" y="${H - 132}" width="${W - 96}" height="100" rx="8" fill="#fdf6f4" stroke="${ROJO}" stroke-width="1.4"/>`,
    texto(
      70,
      H - 104,
      `Leer solo los extremos de la barra se lleva ${COMA(DIN3_3.m, 1)} a ${COMA(Math.max(DIN3_3.i, DIN3_3.j), 1)} kN·m: un ${COMA(perdida, 1)} % de menos, del lado inseguro.`,
      { size: 13.5, bold: true },
    ),
    texto(
      70,
      H - 82,
      'Y es lo único que devuelve la salida de fuerzas de un elemento. SAP muestra la estación central y por eso la ve; un motor que solo',
      { size: 12, fill: SUAVE },
    ),
    texto(
      70,
      H - 65,
      'lea los extremos tiene que reconstruir la parábola: M_centro = (M_i + M_j)/2 + w·L²/8, con M_i y M_j en signo de DIAGRAMA. Ojo:',
      { size: 12, fill: SUAVE },
    ),
    texto(
      70,
      H - 48,
      'localForces devuelve la estación j con el signo cambiado, y pasarla cruda da 14,31 en vez de 207,93 — sin romper nada.',
      { size: 12, fill: SUAVE },
    ),
  ];

  return marco(
    W,
    H,
    'El dintel de cumbrera no lo gobierna ninguno de sus extremos',
    'Diagrama de momento del tramo de dintel que llega a la cumbrera, bajo la combinación gobernante de gravedad.',
    [...cuerpo, ...caja].join('\n  '),
  );
}

// ---------------------------------------------------------------------- salida

await mkdir(OUT_DIR, { recursive: true });
const figuras = [
  ['nueve-de-setenta-y-nueve.svg', figuraNueve()],
  ['la-estacion-del-medio.svg', figuraEstacion()],
];
for (const [nombre, svg] of figuras) {
  await writeFile(path.join(OUT_DIR, nombre), svg, 'utf8');
  console.log(`  ${path.relative(ROOT, path.join(OUT_DIR, nombre))}`);
}

console.log('');
console.log(`combinaciones: ${COMBOS.length}  (${GRAVEDAD.length} G · ${SISMO.length} E · ${R5.length} R5)`);
console.log(`gobiernan: ${USADAS.length} -> ${USADAS.sort().join(', ')}`);
console.log(
  `DIN3_3: i ${DIN3_3.i}  centro ${DIN3_3.m}  j ${DIN3_3.j}  -> leer extremos pierde ${(100 * (1 - Math.max(DIN3_3.i, DIN3_3.j) / DIN3_3.m)).toFixed(2)} %`,
);
