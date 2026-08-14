#!/usr/bin/env node
// Dibuja las dos figuras calculadas del post del modal del galpón
// (/blog/rukan-verificacion-galpon-modal-espectral).
//
//   npm run figuras:galpon-modal
//
// Los números salen de dos lugares, y ninguno de los dos necesita SAP2000
// abierto: las cabeceras `# Result:` de `Skills_SAP/scripts/galpon_altiplano_*`
// —que son la salida verificada del modelo congelado— y la corrida de
// `rukan/verification/case10_galpon_altiplano.py`. Van sin redondear.
// El registro está en SERIE-GALPON.md §5.46 y §6.2.1.
//
// Emite a public/rukan-verificacion-galpon-modal-espectral/:
//   la-masa-que-no-se-sacude.svg   la cascada de 674,861 kN a 582,0 kN
//   el-periodo-lo-dice-la-masa.svg el T1 con y sin el pilar, contra SAP
//
// El SVG no hereda las variables CSS del sitio (se sirve como <img>): colores
// literales y coma decimal, como el resto de las figuras.

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT_DIR = path.join(ROOT, 'public/rukan-verificacion-galpon-modal-espectral');

// ------------------------------------------------------------------ los datos

// Masa sísmica D + 0,20·S declarada en la memoria (§6.2.1). Es la que alimenta
// el Q0mín de la Ec. (12) y la banda de §5.12/§5.13.
const P_DECLARADO = 674.8610909934324; // kN

// Desglose del peso propio y de las cargas por familia de barras, medido sobre
// el modelo de rukan (§5.46).
const PILAR_DEAD = 33.5673; // kN — peso propio de los 10 pilares de hastial
const PILAR_DSD = 44.3246; // kN — el revestimiento de testera que cargan
const PILAR = PILAR_DEAD + PILAR_DSD;

const MASA_DINAMICA = 596.9689; // kN — la que queda en la matriz de masa
const MASA_PARTICIPA = 582.0329; // kN — descontando la que cae en nudos de base
const EN_BASES = MASA_DINAMICA - MASA_PARTICIPA;

// Períodos. `CON` es lo que da rukan si mete la masa del pilar; `SIN` es lo que
// da al reproducir el criterio de SAP.
const T1_CON = 0.883865617973;
const T1_SIN = 0.8526284592611;
const T1_SAP = 0.8526565963541679;

const TY_RUKAN = 0.1611500332159;
const TY_SAP = 0.1610608923144279;
const MODO_Y = 41;

// La confirmación por el otro camino: de los propios números de SAP.
const Q0X_SAP = 86.960228719357; // kN
const SA_DISENO_X = 0.1576606; // S_a/g en T*_X con R = 4 (§5.36)
const UX_SAP = 0.9462672299974055;

// ------------------------------------------------------ el contraste que manda

const err = (a, b) => Math.abs(a / b - 1);

// 1. Reproducir el criterio de SAP tiene que dar su período.
if (err(T1_SIN, T1_SAP) > 1e-4) {
  throw new Error(`T1 sin pilar: ${T1_SIN} contra ${T1_SAP} de SAP`);
}
// 2. Meter la masa del pilar tiene que separarlo de forma apreciable.
const DESVIO = T1_CON / T1_SAP - 1;
if (DESVIO < 0.03) {
  throw new Error(`la masa del pilar debería mover el período más: ${DESVIO}`);
}
// 3. La cascada tiene que cerrar.
if (Math.abs(P_DECLARADO - PILAR - MASA_DINAMICA) > 0.01) {
  throw new Error(`la cascada no cierra: ${P_DECLARADO} − ${PILAR} ≠ ${MASA_DINAMICA}`);
}
// 4. El camino independiente: de Q0X, S_a y U_x sale la masa que participa.
const W_DEDUCIDO = Q0X_SAP / SA_DISENO_X / UX_SAP;
if (err(W_DEDUCIDO, MASA_PARTICIPA) > 0.01) {
  throw new Error(`Q0X/Sa/Ux da ${W_DEDUCIDO} y rukan mide ${MASA_PARTICIPA}`);
}

// ---------------------------------------------------------------- utilidades

const COMA = (x, dec = 2) => x.toFixed(dec).replace('.', ',');
const MILES = (x, dec = 1) => {
  const [ent, frac] = x.toFixed(dec).split('.');
  const conMiles = ent.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return frac ? `${conMiles},${frac}` : conMiles;
};

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

// ------------------------- figura 1: la cascada de la masa

function figuraMasa() {
  const W = 1000;
  const H = 560;

  const x0 = 120;
  const x1 = 820;
  const sx = escala(0, P_DECLARADO, x0, x1);
  const X_VALOR = x1 + 26; // columna fija: si el valor sigue a la barra, choca
  const alto = 46; //          con el recuadro punteado del descuento
  let y = 140;

  const barra = (v, color, rot, sub, opacidad = 1) => {
    const b = [
      `<rect x="${x0}" y="${y}" width="${sx(v) - x0}" height="${alto}" rx="4" fill="${color}" opacity="${opacidad}"/>`,
      texto(x0 + 14, y + alto / 2 + 5, rot, { size: 13, fill: '#ffffff', bold: true }),
      texto(X_VALOR, y + alto / 2 + 5, `${MILES(v)} kN`, { size: 13, bold: true, fill: color }),
      texto(x0 - 14, y + alto / 2 + 5, sub, { size: 11, fill: SUAVE, anchor: 'end' }),
    ];
    y += alto + 44;
    return b;
  };

  const filas = [
    ...barra(P_DECLARADO, AZUL, 'P declarado para la norma', 'Ec. (12), banda'),
    ...barra(MASA_DINAMICA, AMBAR, 'masa en el modelo dinámico de SAP', 'lo que hay'),
    ...barra(MASA_PARTICIPA, VERDE, 'masa que efectivamente participa', 'lo que se sacude'),
  ];

  // Los dos descuentos, dibujados como la diferencia. El segundo es tan angosto
  // (14,9 kN de 675) que sus rótulos no caben centrados sobre el recuadro: se
  // sacan con una línea guía hacia la derecha.
  const descuento = (v0, v1, yBar, rot, detalle, color, guia = false) => {
    const xa = sx(v1);
    const xb = sx(v0);
    const caja = `<rect x="${xa}" y="${yBar}" width="${Math.max(xb - xa, 2)}" height="${alto}" rx="4" fill="none" stroke="${color}" stroke-width="1.6" stroke-dasharray="5 4"/>`;
    if (guia) {
      const yg = yBar + alto + 26;
      return [
        caja,
        `<path d="M ${(xa + xb) / 2} ${yBar + alto} L ${(xa + xb) / 2} ${yg - 10} L ${X_VALOR - 8} ${yg - 10}" fill="none" stroke="${color}" stroke-width="1.2"/>`,
        texto(X_VALOR, yg - 6, `− ${MILES(v0 - v1)} kN`, { size: 11.5, fill: color, bold: true }),
        texto(X_VALOR, yg + 11, rot, { size: 10.5, fill: SUAVE }),
      ];
    }
    return [
      caja,
      texto((xa + xb) / 2, yBar - 12, `− ${MILES(v0 - v1)} kN`, {
        size: 12,
        fill: color,
        anchor: 'middle',
        bold: true,
      }),
      texto((xa + xb) / 2, yBar + alto + 20, rot, { size: 11.5, fill: color, anchor: 'middle' }),
      texto((xa + xb) / 2, yBar + alto + 36, detalle, { size: 10.5, fill: SUAVE, anchor: 'middle' }),
    ];
  };

  const y1 = 140 + alto + 44;
  const y2 = y1 + alto + 44;
  const marcas = [
    ...descuento(P_DECLARADO, MASA_DINAMICA, y1, 'los pilares de hastial', 'peso propio 33,6 + revestimiento 44,3', ROJO),
    ...descuento(MASA_DINAMICA, MASA_PARTICIPA, y2, 'en nudos de base', 'inerte en cualquier motor', GRIS, true),
  ];

  const brecha = 100 * (P_DECLARADO / MASA_PARTICIPA - 1);
  const caja = [
    `<rect x="48" y="${H - 128}" width="${W - 96}" height="96" rx="8" fill="#fdf6f4" stroke="${ROJO}" stroke-width="1.4"/>`,
    texto(
      70,
      H - 100,
      `El Q₀ mínimo se calcula con un P que es ${COMA(brecha, 1)} % mayor que la masa de la que sale el Q₀ que se le compara.`,
      { size: 13.5, bold: true },
    ),
    texto(
      70,
      H - 78,
      'El pilar de hastial lleva la P liberada arriba: todo su peso vertical reacciona en su propia base y nunca llega al nudo',
      { size: 12, fill: SUAVE },
    ),
    texto(
      70,
      H - 61,
      'de techo. SAP arrastra esa liberación al armado de la masa y lo deja entero fuera de la matriz. La inercia HORIZONTAL',
      { size: 12, fill: SUAVE },
    ),
    texto(
      70,
      H - 44,
      'del pilar, en cambio, existe igual: hay que acelerarlo, y siendo biarticulado le entrega la mitad al techo.',
      { size: 12, fill: SUAVE },
    ),
  ];

  return marco(
    W,
    H,
    'La masa que el modelo declara y no sacude',
    'Masa sísmica D + 0,20·S del galpón, de lo que la memoria declara a lo que entra en el problema de valores propios.',
    [...filas, ...marcas, ...caja].join('\n  '),
  );
}

// ------------------- figura 2: el período lo decide la masa

function figuraPeriodo() {
  const W = 1000;
  const H = 624;

  const x0 = 300;
  const x1 = 860;
  const sx = escala(0.83, 0.90, x0, x1);
  const alto = 40;

  const filas = [
    {
      T: T1_CON,
      color: ROJO,
      rot: 'rukan con la masa del pilar',
      nota: `+${COMA(100 * (T1_CON / T1_SAP - 1), 2)} % contra SAP`,
    },
    {
      T: T1_SIN,
      color: VERDE,
      rot: 'rukan reproduciendo el criterio de SAP',
      nota: `${COMA(100 * Math.abs(T1_SIN / T1_SAP - 1), 4)} % contra SAP`,
    },
    { T: T1_SAP, color: AZUL, rot: 'SAP2000 (modelo congelado)', nota: 'la referencia' },
  ];

  let y = 150;
  const barras = filas.flatMap((f) => {
    const b = [
      `<line x1="${x0}" y1="${y + alto / 2}" x2="${sx(f.T)}" y2="${y + alto / 2}" stroke="${f.color}" stroke-width="3"/>`,
      `<circle cx="${sx(f.T)}" cy="${y + alto / 2}" r="7" fill="${f.color}"/>`,
      texto(x0 - 16, y + alto / 2 + 5, f.rot, { size: 12.5, anchor: 'end', bold: true, fill: f.color }),
      texto(sx(f.T) + 16, y + alto / 2 + 1, `${COMA(f.T, 6)} s`, { size: 12.5, bold: true }),
      texto(sx(f.T) + 16, y + alto / 2 + 17, f.nota, { size: 10.5, fill: SUAVE }),
    ];
    y += alto + 34;
    return b;
  });

  const eje = [
    `<line x1="${x0}" y1="${y - 18}" x2="${x1 + 30}" y2="${y - 18}" stroke="${BORDE}" stroke-width="1.4"/>`,
  ];
  for (const v of [0.84, 0.85, 0.86, 0.87, 0.88, 0.89]) {
    eje.push(texto(sx(v), y + 4, COMA(v, 2), { size: 10.5, fill: SUAVE, anchor: 'middle' }));
    eje.push(
      `<line x1="${sx(v)}" y1="${y - 18}" x2="${sx(v)}" y2="${y - 13}" stroke="${BORDE}" stroke-width="1.2"/>`,
    );
  }
  eje.push(texto(x1 + 34, y + 4, 'T₁ [s]', { size: 11, fill: SUAVE }));

  // La otra dirección, como cierre.
  const otra = [
    `<rect x="48" y="${H - 160}" width="${W - 96}" height="60" rx="8" fill="#f7f9fb" stroke="${BORDE}" stroke-width="1.2"/>`,
    texto(70, H - 134, `Y con el criterio reproducido, la otra dirección también cae en su lugar:`, {
      size: 13,
      bold: true,
    }),
    texto(
      70,
      H - 114,
      `el T* longitudinal da ${COMA(TY_RUKAN, 6)} s en el modo ${MODO_Y} — el mismo número de modo que SAP, que mide ${COMA(TY_SAP, 6)} s.`,
      { size: 12, fill: SUAVE },
    ),
  ];

  const caja = [
    `<rect x="48" y="${H - 88}" width="${W - 96}" height="56" rx="8" fill="#f4f8f5" stroke="${VERDE}" stroke-width="1.4"/>`,
    texto(
      70,
      H - 62,
      'Lo que descarta la rigidez: el momento de rodilla bajo 1,2D + 1,6S coincide con SAP a la sexta cifra, y no interviene',
      { size: 12, fill: SUAVE },
    ),
    texto(
      70,
      H - 45,
      'ninguna masa. En un marco hiperestático el reparto de momentos depende solo de la rigidez relativa.',
      { size: 12, fill: SUAVE },
    ),
  ];

  return marco(
    W,
    H,
    'El período no lo movía la rigidez: lo movía la masa',
    'Período fundamental del galpón, con la rigidez ya verificada exacta contra el modelo congelado.',
    [...barras, ...eje, ...otra, ...caja].join('\n  '),
  );
}

// ---------------------------------------------------------------------- salida

await mkdir(OUT_DIR, { recursive: true });
const figuras = [
  ['la-masa-que-no-se-sacude.svg', figuraMasa()],
  ['el-periodo-lo-dice-la-masa.svg', figuraPeriodo()],
];
for (const [nombre, svg] of figuras) {
  await writeFile(path.join(OUT_DIR, nombre), svg, 'utf8');
  console.log(`  ${path.relative(ROOT, path.join(OUT_DIR, nombre))}`);
}

console.log('');
console.log(`P declarado      ${P_DECLARADO} kN`);
console.log(`− pilar          ${PILAR} kN  (propio ${PILAR_DEAD} + revestimiento ${PILAR_DSD})`);
console.log(`= modelo dinamico ${MASA_DINAMICA} kN`);
console.log(`− en bases       ${EN_BASES.toFixed(4)} kN`);
console.log(`= participa      ${MASA_PARTICIPA} kN`);
console.log(`brecha P/participa: ${(100 * (P_DECLARADO / MASA_PARTICIPA - 1)).toFixed(2)} %`);
console.log('');
console.log(`Q0X/Sa/Ux = ${W_DEDUCIDO.toFixed(3)} kN   contra ${MASA_PARTICIPA} de rukan`);
console.log(`T1 con pilar ${T1_CON} (+${(100 * DESVIO).toFixed(3)} %)`);
console.log(`T1 sin pilar ${T1_SIN} (${(100 * err(T1_SIN, T1_SAP)).toFixed(5)} %)`);
