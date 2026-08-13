#!/usr/bin/env node
// Figuras del post de estados y combinaciones del galpón del altiplano
// (/apuntes/ejemplo-galpon-altiplano-cargas-combinaciones).
//
//   npm run figuras:galpon-combos
//
// El árbol se CUENTA, no se transcribe: las multiplicaciones de cada rama están
// escritas como datos y el total sale de sumarlas, así que si alguien cambia el
// número de casos de nieve o de viento, la figura y el texto se mueven juntos.
// La estructura es la de `Skills_SAP/scripts/galpon_altiplano_combos.py`.
//
// Reacciones por estado y chequeo de linealidad: leídos del modelo con
// `Results.BaseReact` el 2026-08-12 (SAP2000 v27.1).
//
// Emite a public/ejemplo-galpon-altiplano-cargas-combinaciones/:
//   arbol-de-combinaciones.svg   de dónde salen las 79, y por qué la rama sísmica son 12
//   quien-gobierna.svg           la envolvente: qué combinación dimensiona cada miembro

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT_DIR = path.join(ROOT, 'public/ejemplo-galpon-altiplano-cargas-combinaciones');

// ----------------------------------------------------------------- los datos
const N_NIEVE = 3; // balanceada, desbalanceada izquierda, desbalanceada derecha
const N_VIENTO = 4; // transversal ±, longitudinal ±
const N_SIGNO_PI = 2; // presión interna ±0,18
const N_ECS = 3; // las tres ecuaciones de simultaneidad de §4.5.2
const N_SIGNO_EV = 2; // la vertical es un caso estático: su signo sí se enumera
const N_BASES_G = 2; // 1,2D + 0,2S  y  0,9D

// Ramas de NCh 3171 §9.1.1 que sobreviven a la poda, con su aritmética.
const RAMAS = [
  { rot: '(1)  1,4 D', n: 1, cuenta: 'una sola', color: 'D' },
  { rot: '(2)  1,2 D + 0,5 S', n: N_NIEVE, cuenta: `${N_NIEVE} casos de nieve`, color: 'S' },
  { rot: '(3a) 1,2 D + 1,6 S', n: N_NIEVE, cuenta: `${N_NIEVE} casos de nieve`, color: 'S' },
  {
    rot: '(3b) 1,2 D + 1,6 S + 0,8 W',
    n: N_NIEVE * N_VIENTO * N_SIGNO_PI,
    cuenta: `${N_NIEVE} × ${N_VIENTO} × ${N_SIGNO_PI}`,
    color: 'W',
  },
  {
    rot: '(4)  1,2 D + 1,6 W + 0,5 S',
    n: N_NIEVE * N_VIENTO * N_SIGNO_PI,
    cuenta: `${N_NIEVE} × ${N_VIENTO} × ${N_SIGNO_PI}`,
    color: 'W',
  },
  { rot: '(6)  0,9 D + 1,6 W', n: N_VIENTO * N_SIGNO_PI, cuenta: `${N_VIENTO} × ${N_SIGNO_PI}`, color: 'W' },
];
const N_GRAV = RAMAS.reduce((a, r) => a + r.n, 0);
const N_SISMO = N_ECS * N_SIGNO_EV * N_BASES_G;
const N_ILUS = 2 * N_SIGNO_EV;
const N_TOTAL = N_GRAV + N_SISMO + N_ILUS;

// Lo que habría salido enumerando también los signos de los casos espectrales.
const N_SISMO_INGENUO = N_ECS * 2 ** 3 * N_BASES_G;

// Envolvente, del modelo (SERIE-GALPON.md §5.37).
const GOBIERNAN = [
  { m: 'Columna, alero', v: 'M₃ = 633,284 kN·m', c: 'G3A_B', fam: 'S' },
  { m: 'Dintel, alero', v: 'M₃ = −633,206 kN·m', c: 'G3A_B', fam: 'S' },
  { m: 'Dintel, medio', v: 'M₃ = 176,334 kN·m', c: 'G3A_I', fam: 'Sd' },
  { m: 'Dintel, cumbrera', v: 'M₃ = 207,932 kN·m', c: 'G3A_B', fam: 'S' },
  { m: 'Dintel, tracción', v: 'P = +24,780 kN', c: 'G6_LYNP', fam: 'W' },
  { m: 'Puntal de alero', v: 'P = +28,248 kN', c: 'E2P_A', fam: 'E' },
  { m: 'Media diag. de muro', v: 'P = −39,895 kN', c: 'E2P_A', fam: 'E' },
  { m: 'Pilar de hastial', v: 'M₃ = −23,432 kN·m', c: 'G4_BLYPN', fam: 'W' },
];

// Reacciones basales por estado, leídas del modelo (kN).
const ESTADOS = [
  { rot: 'DEAD (peso propio)', fz: 233.657226 },
  { rot: 'DSD (muerta superpuesta)', fz: 302.963865 },
  { rot: 'SBAL (nieve balanceada)', fz: 691.2 },
  { rot: 'LR (sobrecarga de techo)', fz: 172.8 },
];
const D_TOTAL = 233.657226 + 302.963865;
const S_BAL = 691.2;

// ---------------------------------------------------------------- utilidades
const COMA = (x, d = 2) => x.toFixed(d).replace('.', ',');
const N = (x) => x.toFixed(1);
const TINTA = '#222';
const TEXTO = '#333';
const SUAVE = '#666';
const BORDE = '#d1d5db';
const AZUL = '#1b4a6e';
const NIEVE = '#2d6b9c';
const VIENTO = '#1c7c3c';
const SISMO = '#a8641b';
const ROJO = '#b02a1a';
const COLOR = { D: AZUL, S: NIEVE, Sd: '#7aa8cc', W: VIENTO, E: SISMO };

// ============================================================== figura 1
function figuraArbol() {
  const partes = [];
  const X0 = 70;
  const W = 250; // el ancho útil está limitado por los dos paneles de la derecha
  const Y0 = 150;
  const alto = 34;
  const nMax = 26;
  const sx = (n) => (n / nMax) * W;

  partes.push(
    `<text x="${X0}" y="104" font-size="12.5" fill="${TINTA}" font-weight="bold">A · Gravedad y viento — NCh 3171:2017 §9.1.1</text>`,
    `<text x="${X0}" y="122" font-size="10.5" fill="${SUAVE}">Con L = 0 (sin plataformas) y L_r = 0,30 kPa siempre menor que S = 1,20 kPa, la sobrecarga de techo no sobrevive a ninguna combinación donde la nieve esté.</text>`,
  );

  RAMAS.forEach((r, i) => {
    const y = Y0 + i * alto;
    const c = COLOR[r.color];
    partes.push(
      `<text x="${X0}" y="${N(y + 13)}" font-size="11" fill="${TEXTO}" font-family="Consolas, monospace">${r.rot}</text>`,
      `<rect x="${X0 + 210}" y="${N(y)}" width="${N(sx(r.n))}" height="20" fill="${c}" fill-opacity="0.30" stroke="${c}" stroke-width="1.3"/>`,
      `<text x="${N(X0 + 210 + sx(r.n) + 8)}" y="${N(y + 14)}" font-size="11.5" fill="${c}" font-weight="bold">${r.n}</text>`,
      `<text x="${N(X0 + 210 + sx(r.n) + 30)}" y="${N(y + 14)}" font-size="10" fill="${SUAVE}">${r.cuenta}</text>`,
    );
  });

  const yG = Y0 + RAMAS.length * alto;
  partes.push(
    `<line x1="${X0}" y1="${N(yG + 4)}" x2="${X0 + 490}" y2="${N(yG + 4)}" stroke="${BORDE}" stroke-width="1"/>`,
    `<text x="${X0}" y="${N(yG + 26)}" font-size="12" fill="${TINTA}" font-weight="bold">Subtotal gravedad y viento: ${N_GRAV}</text>`,
    `<text x="${X0}" y="${N(yG + 44)}" font-size="10.5" fill="${SUAVE}">La (5) y la (7) de §9.1.1 no se escriben: la (5) es la sísmica, y esa rama la reemplaza NCh 2369.</text>`,
  );

  // rama sísmica
  const yS = yG + 78;
  partes.push(
    `<text x="${X0}" y="${N(yS)}" font-size="12.5" fill="${TINTA}" font-weight="bold">B · Sismo — NCh 2369:2025 §4.5.1, con la simultaneidad de §4.5.2</text>`,
    `<text x="${X0}" y="${N(yS + 18)}" font-size="11" fill="${TEXTO}" font-family="Consolas, monospace">1,2 D + 0,2 S + E   y   0,9 D + E</text>`,
    `<text x="${X0}" y="${N(yS + 42)}" font-size="11" fill="${TEXTO}">${N_ECS} ecuaciones de simultaneidad × ${N_SIGNO_EV} signos de la vertical × ${N_BASES_G} bases gravitacionales =</text>`,
    `<rect x="${N(X0 + 400)}" y="${N(yS + 28)}" width="${N(sx(N_SISMO))}" height="20" fill="${SISMO}" fill-opacity="0.30" stroke="${SISMO}" stroke-width="1.3"/>`,
    `<text x="${N(X0 + 400 + sx(N_SISMO) + 8)}" y="${N(yS + 42)}" font-size="11.5" fill="${SISMO}" font-weight="bold">${N_SISMO}</text>`,
    `<text x="${X0}" y="${N(yS + 66)}" font-size="11" fill="${TEXTO}">Rama ilustrativa con R = 5, para comparar (2 ecuaciones × ${N_SIGNO_EV} signos) =</text>`,
    `<rect x="${N(X0 + 400)}" y="${N(yS + 52)}" width="${N(sx(N_ILUS))}" height="20" fill="${SISMO}" fill-opacity="0.14" stroke="${SISMO}" stroke-width="1.1" stroke-dasharray="4 3"/>`,
    `<text x="${N(X0 + 400 + sx(N_ILUS) + 8)}" y="${N(yS + 66)}" font-size="11.5" fill="${SISMO}" font-weight="bold">${N_ILUS}</text>`,
    `<line x1="${X0}" y1="${N(yS + 82)}" x2="${X0 + 700}" y2="${N(yS + 82)}" stroke="${TEXTO}" stroke-width="1.5"/>`,
    `<text x="${X0}" y="${N(yS + 106)}" font-size="14" fill="${TINTA}" font-weight="bold">TOTAL: ${N_TOTAL} combinaciones LRFD</text>`,
  );

  // el aparte del conteo sísmico
  const bx = 640;
  partes.push(
    `<rect x="${bx}" y="150" width="300" height="196" fill="#faf7f2" stroke="${SISMO}" stroke-width="1.2"/>`,
    `<text x="${bx + 16}" y="176" font-size="11.5" fill="${TINTA}" font-weight="bold">Por qué la rama sísmica son ${N_SISMO}</text>`,
    `<text x="${bx + 16}" y="196" font-size="10.5" fill="${TINTA}" font-weight="bold">y no ${N_SISMO_INGENUO}</text>`,
    `<text x="${bx + 16}" y="220" font-size="10.5" fill="${SUAVE}">§4.5.2 pide las tres ecuaciones con</text>`,
    `<text x="${bx + 16}" y="234" font-size="10.5" fill="${SUAVE}">TODOS los signos: 3 × 2³ × 2 = ${N_SISMO_INGENUO}.</text>`,
    `<text x="${bx + 16}" y="256" font-size="10.5" fill="${SUAVE}">Pero SAP aplica un caso espectral con</text>`,
    `<text x="${bx + 16}" y="270" font-size="10.5" fill="${SUAVE}">signo ± automático y reporta Máx/Mín.</text>`,
    `<text x="${bx + 16}" y="284" font-size="10.5" fill="${SUAVE}">Enumerar a mano los signos de E_x y</text>`,
    `<text x="${bx + 16}" y="298" font-size="10.5" fill="${SUAVE}">E_y los duplicaría, sin agregar nada.</text>`,
    `<text x="${bx + 16}" y="320" font-size="10.5" fill="${TINTA}" font-weight="bold">Solo se enumera el signo de E_z,</text>`,
    `<text x="${bx + 16}" y="334" font-size="10.5" fill="${TINTA}" font-weight="bold">que es un caso estático.</text>`,
  );

  // linealidad
  partes.push(
    `<rect x="${bx}" y="366" width="300" height="152" fill="#f5f8fa" stroke="${AZUL}" stroke-width="1.2"/>`,
    `<text x="${bx + 16}" y="392" font-size="11.5" fill="${TINTA}" font-weight="bold">El assert que no depende del motor</text>`,
    `<text x="${bx + 16}" y="414" font-size="10.5" fill="${SUAVE}">Reacción vertical total, en kN:</text>`,
    `<text x="${bx + 16}" y="436" font-size="10.5" fill="${TEXTO}" font-family="Consolas, monospace">D = ${COMA(D_TOTAL, 3)}   S = ${COMA(S_BAL, 1)}</text>`,
    `<text x="${bx + 16}" y="456" font-size="10.5" fill="${TEXTO}" font-family="Consolas, monospace">1,4·D      = ${COMA(1.4 * D_TOTAL, 3)}</text>`,
    `<text x="${bx + 16}" y="472" font-size="10.5" fill="${TEXTO}" font-family="Consolas, monospace">1,2·D+1,6·S = ${COMA(1.2 * D_TOTAL + 1.6 * S_BAL, 3)}</text>`,
    `<text x="${bx + 16}" y="496" font-size="10.5" fill="${SUAVE}">SAP devuelve lo mismo a 4·10⁻⁷ kN.</text>`,
    `<text x="${bx + 16}" y="510" font-size="10.5" fill="${SUAVE}">Si no, la combinación no es lineal.</text>`,
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 610" font-family="Segoe UI, Arial, sans-serif">
  <rect width="1000" height="610" fill="#ffffff"/>
  <text x="500" y="30" font-size="15.5" text-anchor="middle" fill="${TINTA}" font-weight="bold">De once estados de carga a ${N_TOTAL} combinaciones, y de dos normas que se remiten entre sí</text>
  <text x="500" y="50" font-size="12" text-anchor="middle" fill="${SUAVE}">NCh 3171 pone el andamio de gravedad y viento · NCh 2369 §4.5 reemplaza la rama sísmica · sismo y viento no actúan a la vez (§9.1.1)</text>
  ${partes.join('\n  ')}
  <text x="70" y="586" font-size="10.5" fill="${SUAVE}">Estructura y factores: galpon_altiplano_combos.py, contrastado contra NCh 3171:2017 §9.1.1 y NCh 2369:2025 §4.5.1 y §4.5.2 en página rasterizada.</text>
  <text x="70" y="600" font-size="10.5" fill="${SUAVE}">Reacciones basales y chequeo de linealidad: Results.BaseReact del modelo verificado (SAP2000 v27.1, 2026-08-12).</text>
</svg>
`;
}

// ============================================================== figura 2
function figuraGobierna() {
  const partes = [];
  const X0 = 70;
  const alto = 40;
  const Y0 = 130;

  partes.push(
    `<text x="${X0}" y="104" font-size="12" fill="${SUAVE}">Ocho verificaciones de la envolvente, gobernadas por solo ${new Set(GOBIERNAN.map((g) => g.c)).size} nombres. En la envolvente completa —diez miembros × tres esfuerzos— son nueve.</text>`,
  );

  GOBIERNAN.forEach((g, i) => {
    const y = Y0 + i * alto;
    const c = COLOR[g.fam];
    partes.push(
      `<rect x="${X0}" y="${N(y)}" width="820" height="30" fill="${i % 2 ? '#fafafa' : '#ffffff'}"/>`,
      `<rect x="${X0}" y="${N(y)}" width="5" height="30" fill="${c}"/>`,
      `<text x="${X0 + 18}" y="${N(y + 20)}" font-size="12" fill="${TEXTO}">${g.m}</text>`,
      `<text x="${X0 + 230}" y="${N(y + 20)}" font-size="12" fill="${TINTA}" font-family="Consolas, monospace">${g.v}</text>`,
      `<text x="${X0 + 430}" y="${N(y + 20)}" font-size="12" fill="${c}" font-weight="bold" font-family="Consolas, monospace">${g.c}</text>`,
    );
  });

  const yF = Y0 + GOBIERNAN.length * alto;
  const leyenda = [
    { c: NIEVE, t: 'G3A_B = 1,2 D + 1,6 S balanceada' },
    { c: COLOR.Sd, t: 'G3A_I = ídem, con la nieve DESBALANCEADA' },
    { c: VIENTO, t: 'G6_* = 0,9 D + 1,6 W  ·  G4_* = 1,2 D + 1,6 W + 0,5 S' },
    { c: SISMO, t: 'E* = las sísmicas de NCh 2369 §4.5.1' },
  ]
    .map((l, i) => {
      const y = yF + 30 + i * 20;
      return [
        `<rect x="${X0}" y="${N(y - 9)}" width="12" height="12" fill="${l.c}" fill-opacity="0.5" stroke="${l.c}" stroke-width="1.1"/>`,
        `<text x="${X0 + 20}" y="${N(y)}" font-size="11" fill="${TEXTO}">${l.t}</text>`,
      ].join('\n  ');
    })
    .join('\n  ');

  partes.push(leyenda);
  partes.push(
    `<text x="560" y="${N(yF + 30)}" font-size="11.5" fill="${TINTA}" font-weight="bold">Dos cosas que no se esperaban</text>`,
    `<text x="560" y="${N(yF + 50)}" font-size="10.5" fill="${SUAVE}">La nieve DESBALANCEADA gobierna el dintel a media luz —</text>`,
    `<text x="560" y="${N(yF + 64)}" font-size="10.5" fill="${SUAVE}">el caso que casi nadie corre, y que ninguna norma chilena</text>`,
    `<text x="560" y="${N(yF + 78)}" font-size="10.5" fill="${SUAVE}">disponible obliga a correr: entra por el estudio de sitio.</text>`,
    `<text x="560" y="${N(yF + 98)}" font-size="10.5" fill="${SUAVE}">Y a la diagonal de muro la gobierna el SISMO, no el viento:</text>`,
    `<text x="560" y="${N(yF + 112)}" font-size="10.5" fill="${SUAVE}">39,895 kN contra 34,233 de la envolvente de gravedad y</text>`,
    `<text x="560" y="${N(yF + 126)}" font-size="10.5" fill="${SUAVE}">viento, un 16,5 % más.</text>`,
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 630" font-family="Segoe UI, Arial, sans-serif">
  <rect width="1000" height="630" fill="#ffffff"/>
  <text x="500" y="30" font-size="15.5" text-anchor="middle" fill="${TINTA}" font-weight="bold">La envolvente: la gravedad con nieve gana casi todo, y el sismo se queda con el arriostramiento</text>
  <text x="500" y="50" font-size="12" text-anchor="middle" fill="${SUAVE}">Con S = 1,20 kPa y el sismo dividido por R* = 4, la envolvente sísmica llega al 53 % del momento de alero</text>
  ${partes.join('\n  ')}
  <text x="70" y="608" font-size="10.5" fill="${SUAVE}">Envolvente sobre las ${N_TOTAL} combinaciones, extraída del modelo verificado con combinaciones envolventes de SAP2000 (SERIE-GALPON.md §5.37).</text>
</svg>
`;
}

// ------------------------------------------------------------------- escritura
await mkdir(OUT_DIR, { recursive: true });
const figuras = [
  ['arbol-de-combinaciones.svg', figuraArbol()],
  ['quien-gobierna.svg', figuraGobierna()],
];
for (const [nombre, svg] of figuras) {
  await writeFile(path.join(OUT_DIR, nombre), svg, 'utf8');
  console.log(`✓ ${nombre}  (${svg.length} bytes)`);
}
console.log(`\ngravedad+viento ${N_GRAV} · sismo ${N_SISMO} (ingenuo ${N_SISMO_INGENUO}) · ilustrativas ${N_ILUS} · TOTAL ${N_TOTAL}`);
console.log(`D = ${D_TOTAL.toFixed(6)} kN · 1,4D = ${(1.4 * D_TOTAL).toFixed(6)} · 1,2D+1,6S = ${(1.2 * D_TOTAL + 1.6 * S_BAL).toFixed(6)}`);
