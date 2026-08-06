#!/usr/bin/env node
// Contrasta cada servilleta de /acero/predimensionamiento contra el motor completo.
//
//   npm run verify:servilletas
//   npm run verify:servilletas -- viga-flexion
//
// Qué hace, y por qué no es lo mismo que verify-acero.mjs: aquel ancla el MOTOR
// contra las planillas publicadas. Este ancla el ATAJO contra el motor. Corre dos
// caminos sobre el mismo caso —el despeje que publica el post y la verificación
// completa— y compara.
//
// La comparación es siempre la misma cuenta. La servilleta dimensiona una sección
// para una demanda, así que se la toma al pie de la letra: se calcula la demanda
// que el atajo declara admisible y se le pregunta al motor cuánta capacidad hay
// de verdad. El cociente es el uso:
//
//     uso = demanda que la servilleta acepta / capacidad que el motor calcula
//
//     uso = 1  →  el atajo es la ecuación despejada, sin pérdida
//     uso < 1  →  conservador: pides más perfil del necesario
//     uso > 1  →  INSEGURO: la sección que elegiste no pasa
//
// Y acá está lo que lo vuelve guardia y no demo: **cada caso declara de antemano
// cuál de los tres es**, porque eso es exactamente lo que el post afirma en su
// sección «Dónde miente». Si un caso declarado `exacta` se desvía, o uno
// declarado `insegura` deja de serlo, el script sale con código 1. El post no
// puede envejecer en silencio.
//
// Las secciones son las que el sitio ya publica, con las mismas propiedades
// DECLARADAS que usan sus planillas: así el ancla de la capacidad no es este
// script sino el ejemplo ya auditado.

import { build } from 'esbuild';
import { rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

/** Compila un módulo TypeScript del sitio a algo importable por Node. */
async function bundle(entry, nombre) {
  const out = path.join(tmpdir(), `${nombre}-${process.pid}.mjs`);
  await build({
    entryPoints: [path.join(ROOT, entry)],
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

const { verificarSeccion, MATERIALES } = await bundle(
  'src/lib/acero/engine-entry.ts',
  'servilletas-engine'
);

const TONF = 1000; // kgf
const TONF_M = 100000; // kgf·cm
const M = 100; // cm

const A992 = MATERIALES.A992;

const est = (o) => ({ Lcx: 0, Lcy: 0, Lcz: 0, Lb: 0, Cb: 1, B1: 1, ...o });
const dem = (o) => ({ Pu: 0, Tu: 0, Mux: 0, Muy: 0, Vu: 0, ...o });

// ─────────────────────────────────────────────────────────────────────────────
// La sección de trabajo: W460×74, A992.
//
// Es la del ejemplo `/acero/ejemplo-viga-ltb`, con las mismas propiedades
// declaradas que su planilla. Reusarla no es comodidad: significa que la
// capacidad contra la que se contrasta ya está cerrada contra un post auditado.
// ─────────────────────────────────────────────────────────────────────────────

const W460X74 = {
  geom: { familia: 'I', tipo: 'laminado', d: 45.7, bf: 19.0, tf: 1.45, tw: 0.9 },
  material: A992,
  declaradas: { Zx: 1655, Sx: 1457, ry: 4.19, rts: 5.03, J: 51.6, ho: 44.2 },
};

// Perfil ARMADO de alma esbelta, para el borde de la servilleta del corte.
// No es laminado, así que no entra por la puerta de §G2.1(a) ni con h/t_w chico.
const ARMADO_ALMA_ESBELTA = {
  geom: { familia: 'I', tipo: 'armado', d: 90.0, bf: 25.0, tf: 2.0, tw: 0.8 },
  material: A992,
};

// ─────────────────────────────────────────────────────────────────────────────
// Servilleta 1 — Z_x,req = M_u / (φ_b F_y)      [Ec. F2-1 + §F1(a)]
//
// Se la toma al pie de la letra: si la relación es cierta, el momento
// φ_b F_y Z_x es exactamente lo que la sección admite. Se le entrega ese momento
// al motor y se mira el uso.
//
// C_b = 1,0 en todos los casos, que es lo único que sabes al predimensionar: el
// diagrama de momentos todavía no existe. El último caso muestra cuánto de la
// pérdida devuelve el C_b real de un vano con carga uniforme.
// ─────────────────────────────────────────────────────────────────────────────

const PHI_B = 0.9;
const MU_SERVILLETA = PHI_B * A992.Fy * W460X74.declaradas.Zx; // kgf·cm

// C_b de la Ec. F1-1 sobre la parábola de un vano simplemente apoyado con carga
// uniforme. Sale racional exacto (w y L se cancelan), como ya documenta
// verify-acero.mjs: M_A = M_C = 3, M_B = M_máx = 4, en unidades de w·L²/32.
const CB_VANO_COMPLETO = 50 / 44;

const flexionCasos = [
  {
    nombre: 'L_b = 1,0 m (holgado bajo L_p)',
    esperado: 'exacta',
    entrada: {
      ...W460X74,
      estabilidad: est({ Lb: 1.0 * M, Cb: 1.0 }),
      demandas: dem({ Mux: MU_SERVILLETA }),
      estados: ['flexion-x'],
    },
  },
  {
    nombre: 'L_b = 1,75 m (justo bajo L_p)',
    esperado: 'exacta',
    entrada: {
      ...W460X74,
      estabilidad: est({ Lb: 1.75 * M, Cb: 1.0 }),
      demandas: dem({ Mux: MU_SERVILLETA }),
      estados: ['flexion-x'],
    },
  },
  {
    nombre: 'L_b = 2,5 m (pasado L_p, zona inelástica)',
    esperado: 'insegura',
    entrada: {
      ...W460X74,
      estabilidad: est({ Lb: 2.5 * M, Cb: 1.0 }),
      demandas: dem({ Mux: MU_SERVILLETA }),
      estados: ['flexion-x'],
    },
  },
  {
    nombre: 'L_b = 4,0 m (zona inelástica)',
    esperado: 'insegura',
    entrada: {
      ...W460X74,
      estabilidad: est({ Lb: 4.0 * M, Cb: 1.0 }),
      demandas: dem({ Mux: MU_SERVILLETA }),
      estados: ['flexion-x'],
    },
  },
  {
    nombre: 'L_b = 8,0 m (zona elástica)',
    esperado: 'insegura',
    entrada: {
      ...W460X74,
      estabilidad: est({ Lb: 8.0 * M, Cb: 1.0 }),
      demandas: dem({ Mux: MU_SERVILLETA }),
      estados: ['flexion-x'],
    },
  },
  {
    nombre: 'L_b = 4,0 m, con el C_b real del vano (50/44)',
    esperado: 'insegura',
    entrada: {
      ...W460X74,
      estabilidad: est({ Lb: 4.0 * M, Cb: CB_VANO_COMPLETO }),
      demandas: dem({ Mux: MU_SERVILLETA }),
      estados: ['flexion-x'],
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Servilleta 3 — (d·t_w)_req = V_u / (0,6 F_y)     [Ec. G2-1, rama §G2.1(a)]
//
// Sin φ, porque §G1(a) exceptúa a §G2.1(a) y ahí φ_v = 1,00 con C_v1 = 1,0
// (Ec. G2-2). El segundo caso sale de esa rama y muestra qué pasa entonces.
// ─────────────────────────────────────────────────────────────────────────────

const VU_SERVILLETA_W = 0.6 * A992.Fy * W460X74.geom.d * W460X74.geom.tw;
const VU_SERVILLETA_ARMADO =
  0.6 * A992.Fy * ARMADO_ALMA_ESBELTA.geom.d * ARMADO_ALMA_ESBELTA.geom.tw;

const corteCasos = [
  {
    nombre: 'W460×74 laminado (dentro de §G2.1(a))',
    esperado: 'exacta',
    entrada: {
      ...W460X74,
      estabilidad: est({}),
      demandas: dem({ Vu: VU_SERVILLETA_W }),
      estados: ['corte'],
    },
  },
  {
    nombre: 'Armado 900×250, alma de 8 mm (fuera de §G2.1(a))',
    esperado: 'insegura',
    entrada: {
      ...ARMADO_ALMA_ESBELTA,
      estabilidad: est({}),
      demandas: dem({ Vu: VU_SERVILLETA_ARMADO }),
      estados: ['corte'],
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Servilleta de columna — A_g,req = P_u/(φ_c ρ F_y), con ρ = F_n/F_y leído del
// eje débil.                                    [Ecs. E3-1 a E3-4 + §E1]
//
// El atajo que el post publica calcula ρ desde UNA sola esbeltez: la del eje
// débil, que es la que uno mira. Tomarlo al pie de la letra significa declarar
// admisible P_u = φ_c · F_n(L_cy/r_y) · A_g, y preguntarle al motor —que mira
// los dos ejes y además E4— cuánta capacidad hay de verdad.
//
// La sección es la W250×73 de `/acero/ejemplo-columna-galpon-compresion`, con
// las propiedades declaradas de su planilla.
// ─────────────────────────────────────────────────────────────────────────────

const PHI_C = 0.9;

const W250X73 = {
  geom: { familia: 'I', tipo: 'laminado', d: 25.3, bf: 25.4, tf: 1.42, tw: 0.86 },
  material: A992,
  declaradas: { Ag: 92.8, rx: 11.0, ry: 6.46 },
};

/** F_n de las Ecs. E3-2 y E3-3 a partir de una sola esbeltez. */
function fnFlexural(lambda, mat) {
  const Fe = (Math.PI ** 2 * mat.E) / lambda ** 2;
  const lambdaLim = 4.71 * Math.sqrt(mat.E / mat.Fy);
  return lambda <= lambdaLim ? 0.658 ** (mat.Fy / Fe) * mat.Fy : 0.877 * Fe;
}

/** Lo que la servilleta declara admisible mirando solo el eje débil. */
function puServilleta(Lcy) {
  const lambdaY = Lcy / W250X73.declaradas.ry;
  return PHI_C * fnFlexural(lambdaY, A992) * W250X73.declaradas.Ag;
}

const columnaCasos = [
  {
    // Exacta, no conservadora: cuando el eje débil gobierna de verdad, la
    // servilleta ES la Ec. E3-2 y no pierde nada. Declararla «conservadora»
    // fue el primer error que cazó esta guardia.
    nombre: 'Arriostrada igual en los dos ejes (L_cx = L_cy)',
    esperado: 'exacta',
    Lcy: 3.75 * M,
    entrada: {
      ...W250X73,
      estabilidad: est({ Lcx: 3.75 * M, Lcy: 3.75 * M, Lcz: 3.75 * M }),
      demandas: dem({ Pu: puServilleta(3.75 * M) }),
      estados: ['compresion'],
    },
  },
  {
    nombre: 'Columna de galpón: K_x = 2,0 sobre 7,5 m, arriostrada a 3,75 m',
    esperado: 'insegura',
    Lcy: 3.75 * M,
    entrada: {
      ...W250X73,
      estabilidad: est({ Lcx: 2.0 * 7.5 * M, Lcy: 3.75 * M, Lcz: 3.75 * M }),
      demandas: dem({ Pu: puServilleta(3.75 * M) }),
      estados: ['compresion'],
    },
  },
  {
    nombre: 'Longitud torsional mayor que la lateral (L_cz = 2·L_cy)',
    esperado: 'insegura',
    Lcy: 3.75 * M,
    entrada: {
      ...W250X73,
      estabilidad: est({ Lcx: 3.75 * M, Lcy: 3.75 * M, Lcz: 7.5 * M }),
      demandas: dem({ Pu: puServilleta(3.75 * M) }),
      estados: ['compresion'],
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────

const SERVILLETAS = [
  {
    id: 'viga-flexion',
    titulo: 'Viga a flexión · Z_x,req = M_u/(φ_b F_y)',
    post: 'predimensionamiento-viga-flexion',
    casos: flexionCasos,
    demanda: (c) => c.entrada.demandas.Mux,
    capacidad: (r) => r.flexionX.phiMn,
    unidad: 'tonf·m',
    escala: TONF_M,
    extra: (r) => `L_p = ${(r.flexionX.Lp / M).toFixed(2)} m · L_r = ${(r.flexionX.Lr / M).toFixed(2)} m · ${r.flexionX.gobierna}`,
  },
  {
    id: 'viga-corte',
    titulo: 'Viga a corte · (d·t_w)_req = V_u/(0,6 F_y)',
    post: 'predimensionamiento-viga-flexion',
    casos: corteCasos,
    demanda: (c) => c.entrada.demandas.Vu,
    capacidad: (r) => r.corte.phiVn,
    unidad: 'tonf',
    escala: TONF,
    extra: (r) => `h/t_w = ${r.corte.lambda.toFixed(1)} · C_v1 = ${r.corte.Cv.toFixed(3)} · φ_v = ${r.corte.phiV.toFixed(2)}`,
  },
  {
    id: 'columna-compresion',
    titulo: 'Columna comprimida · A_g,req = P_u/(φ_c ρ F_y), con ρ del eje débil',
    post: 'predimensionamiento-columna-comprimida',
    casos: columnaCasos,
    demanda: (c) => c.entrada.demandas.Pu,
    capacidad: (r) => r.compresion.phiPn,
    unidad: 'tonf',
    escala: TONF,
    extra: (r) =>
      `λ_y = ${r.compresion.lambdaY.toFixed(1)} · λ_x = ${r.compresion.lambdaX.toFixed(1)} · λ_lím = ${r.compresion.lambdaLim.toFixed(1)} · F_n = ${r.compresion.Fn.toFixed(0)} kgf/cm² · ${r.compresion.gobierna}`,
  },
];

/** Un atajo se considera exacto si el uso no se despega más de esto de 1. */
const TOL_EXACTA = 0.005;

/** Cómo se lee el uso, y qué esperaba el post. */
function clasificar(uso) {
  if (Math.abs(uso - 1) <= TOL_EXACTA) return 'exacta';
  return uso > 1 ? 'insegura' : 'conservadora';
}

const pedidos = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const aCorrer = pedidos.length
  ? SERVILLETAS.filter((s) => pedidos.includes(s.id))
  : SERVILLETAS;

if (!aCorrer.length) {
  console.error(`No hay servilleta con ese id. Disponibles: ${SERVILLETAS.map((s) => s.id).join(', ')}`);
  process.exit(1);
}

let fallos = 0;
let total = 0;

for (const s of aCorrer) {
  console.log(`\n── ${s.titulo}`);
  console.log(`   /acero/${s.post}\n`);
  console.log(
    `   ${'Caso'.padEnd(46)} ${'servilleta'.padStart(11)} ${'motor'.padStart(11)} ${'uso'.padStart(7)}  veredicto`
  );

  for (const caso of s.casos) {
    total += 1;
    const r = verificarSeccion(caso.entrada);
    const demanda = s.demanda(caso);
    const capacidad = s.capacidad(r);
    const uso = demanda / capacidad;
    const real = clasificar(uso);
    const ok = real === caso.esperado;
    if (!ok) fallos += 1;

    const marca = ok ? '✓' : '✗';
    const desvio = uso > 1 ? `+${((uso - 1) * 100).toFixed(1)} %` : `−${((1 - uso) * 100).toFixed(1)} %`;
    const veredicto = real === 'exacta' ? 'exacta' : `${real} ${desvio}`;

    console.log(
      `${marca}  ${caso.nombre.padEnd(46)} ${(demanda / s.escala).toFixed(2).padStart(11)} ${(capacidad / s.escala).toFixed(2).padStart(11)} ${uso.toFixed(3).padStart(7)}  ${veredicto}`
    );
    if (!ok) {
      console.log(`   ↑ el post declara «${caso.esperado}» y el motor dice «${real}»`);
    }
    if (s.extra) console.log(`   ${' '.repeat(46)} ${s.extra(r)}`);
  }
}

console.log(
  `\n${fallos === 0 ? '✓' : '✗'} ${total - fallos}/${total} casos coinciden con lo que declara el post.`
);
if (fallos) {
  console.log('  Una servilleta cambió de lado. Corrige el post o corrige el caso, pero no lo dejes así.');
}
process.exit(fallos ? 1 : 0);
