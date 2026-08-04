#!/usr/bin/env node
// Verifica el motor de acero (src/lib/acero/) contra las planillas del canvas.
//
// Existe porque las planillas SON el oráculo: sus filas `abs(x - v) < tol` ya
// fijan las cadenas E3/E4, F2 y H1-1 a precisión completa, cerradas contra el
// post que publican. Reproducirlas es la prueba de que el motor dice lo mismo
// que el sitio ya afirma — no hay casos de prueba inventados acá.
//
//   npm run verify:acero
//
// Cada ancla usa el valor Y la tolerancia que declara la planilla de origen.
// Sale con código 1 si alguna se sale de tolerancia.
//
// Los datos de entrada de cada caso están copiados de la sección «DATOS» de su
// planilla, incluyendo qué propiedades entran DECLARADAS (fila de catálogo) y
// cuáles se derivan de las cuatro planchas — la frontera que las planillas
// explicitan.

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

const { verificarSeccion, generarMemoria, MATERIALES } = await bundle(
  'src/lib/acero/engine-entry.ts',
  'acero-engine'
);
// El mismo motor mathjs que corre en /herramientas/canvas: con él se evalúan las
// memorias generadas, que es el chequeo de doble entrada.
const { evaluateSheet } = await bundle('src/lib/planilla-engine.ts', 'acero-worksheet');

const TONF = 1000; // kgf
const TONF_M = 100000; // kgf·cm
const M = 100; // cm

const A992 = MATERIALES.A992;
const A500C = MATERIALES.A500_C;

// ── C_b de la Ec. F1-1 sobre la parábola M(x) = w·x·(L−x)/2 ──────────────────
//
// No se transcriben los 1,14 y 1,30 que imprimen los posts: para una viga
// simplemente apoyada con carga uniforme los cuartos de la F1-1 son fracciones
// de w·L², así que w y L se cancelan y C_b sale RACIONAL EXACTO. Por eso el
// mismo par de números aparece en la viga LTB (8 m) y en la viga-columna (7 m).
//
//   Vano completo — cuartos en L/4, L/2, 3L/4 (en unidades de w·L²/32):
//     M_A = M_C = 3, M_B = M_máx = 4
//     C_b = 12,5·4 / (2,5·4 + 3·3 + 4·4 + 3·3) = 50/44
const CB_VANO_COMPLETO = 50 / 44; // 1,13636… (los posts publican 1,14 / 1,136)
//
//   Medio vano, del apoyo al centro — cuartos en L/8, L/4, 3L/8, máximo en L/2
//   (en unidades de w·L²/128): M_A = 7, M_B = 12, M_C = 15, M_máx = 16
//     C_b = 12,5·16 / (2,5·16 + 3·7 + 4·12 + 3·15) = 200/154
const CB_MEDIO_VANO = 200 / 154; // 1,29870… (los posts publican 1,30 / 1,299)

/** Estabilidad con los defaults del motor, para no repetirlos en cada caso. */
const est = (o) => ({ Lcx: 0, Lcy: 0, Lcz: 0, Lb: 0, Cb: 1, B1: 1, ...o });
const dem = (o) => ({ Pu: 0, Tu: 0, Mux: 0, Muy: 0, Vu: 0, ...o });

// ─────────────────────────────────────────────────────────────────────────────
// Caso 1 · columna-galpon-compresion — W250×73, A992
// Cap. E: E3-1/-2/-3/-4, E4-2, Tabla B4.1a casos 1 y 5.
// ─────────────────────────────────────────────────────────────────────────────

const columnaGalpon = {
  planilla: 'columna-galpon-compresion',
  titulo: 'Columna de galpón a compresión — W250×73',
  entrada: {
    geom: { familia: 'I', tipo: 'laminado', d: 25.3, bf: 25.4, tf: 1.42, tw: 0.86 },
    material: A992,
    // A_g, r_x y r_y son dato de tabla; I, J y C_w salen de las planchas.
    declaradas: { Ag: 92.8, rx: 11.0, ry: 6.46 },
    estabilidad: est({ Lcx: 2.0 * 750, Lcy: 375, Lcz: 375, Lb: 375 }),
    demandas: dem({ Pu: 65 * TONF }),
    estados: ['compresion'],
  },
  anclas: (r) => [
    ['λ_x', r.compresion.lambdaX, 136, 0.5],
    ['λ_y', r.compresion.lambdaY, 58, 0.5],
    ['λ_rf (B4.1a c.1)', r.clasificacion.compresion[0].lambdar, 13.5, 0.05],
    ['λ_rw (B4.1a c.5)', r.clasificacion.compresion[1].lambdar, 35.9, 0.05],
    ['b_f/2t_f', r.clasificacion.compresion[0].lambda, 8.94, 0.005],
    ['A_e (no esbelto → A_g)', r.compresion.Ae, 92.8, 0.05, 'cm²'],
    ['F_ex (E3-4)', r.compresion.Fex, 1083, 0.5, 'kgf/cm²'],
    ['λ_lim = 4,71√(E/F_y)', r.compresion.lambdaLim, 113, 0.5],
    ['F_y/F_ex', A992.Fy / r.compresion.Fex, 3.25, 0.005],
    ['F_nx (E3-3)', r.compresion.Fn, 950, 0.5, 'kgf/cm²'],
    // El post exhibe 79 344 kgf (el producto con F_n ya redondeado); la cadena
    // a precisión completa da 79 309. La planilla lo declara en su
    // meta.esperadoFalso.c_rdxkgf como divergencia aceptada — el motor tiene que
    // reproducir la precisión completa, no el número impreso.
    ['φP_n (E3-1)', r.compresion.phiPn, 79309, 5, 'kgf'],
    ['φP_n (E3-1)', r.compresion.phiPn / TONF, 79.3, 0.05, 'tonf'],
    ['u_x', (65 * TONF) / r.compresion.phiPn, 0.82, 0.005],
    ['F_nx/F_y', r.compresion.Fn / A992.Fy, 0.27, 0.005],
    ['J (planchas)', r.propiedades.J, 53.5, 0.05, 'cm⁴'],
    ['C_w (planchas)', r.propiedades.Cw, 553000, 500, 'cm⁶'],
    ['I_s = I_x + I_y', r.propiedades.Ix + r.propiedades.Iy, 14990, 5, 'cm⁴'],
    ['F_ez (E4-2)', r.compresion.Fez, 8100, 50, 'kgf/cm²'],
    ['F_ez/F_ex', r.compresion.Fez / r.compresion.Fex, 7.5, 0.05],
    ['gobierna', r.compresion.gobierna === 'flexional-x' ? 1 : 0, 1, 0.5],
  ],
};

/** El mismo perfil con el plano arriostrado (K_x = 1): la palanca del post. */
const columnaGalponArriostrada = {
  planilla: 'columna-galpon-compresion',
  titulo: 'Columna de galpón — el plano arriostrado (K_x = 1)',
  entrada: {
    ...columnaGalpon.entrada,
    estabilidad: est({ Lcx: 750, Lcy: 375, Lcz: 375, Lb: 375 }),
  },
  anclas: (r) => [
    ['λ_x1', r.compresion.lambdaX, 68, 0.5],
    ['φP_n1', r.compresion.phiPn / TONF, 209, 0.5, 'tonf'],
  ],
};

/** El eje débil aislado, para cerrar la rama inelástica de la E3-2. */
const columnaGalponEjeDebil = {
  planilla: 'columna-galpon-compresion',
  titulo: 'Columna de galpón — el eje débil aislado (E3-2)',
  entrada: {
    ...columnaGalpon.entrada,
    // L_cx enorme se descarta poniendo el eje fuerte fuera de juego: se fuerza
    // que gobierne el débil, que es la cadena que el post publica aparte.
    estabilidad: est({ Lcx: 0, Lcy: 375, Lcz: 375, Lb: 375 }),
  },
  anclas: (r) => [
    ['F_ny (E3-2)', r.compresion.Fn, 2751, 0.5, 'kgf/cm²'],
    ['φP_ny', r.compresion.phiPn / TONF, 229.7, 0.05, 'tonf'],
    ['u_y', (65 * TONF) / r.compresion.phiPn, 0.28, 0.005],
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Caso 2 · viga-ltb — W460×74, A992
// Cap. F: F2-1 a F2-6, Tabla B4.1b casos 10 y 15.
// C_b entra DECLARADO: el motor no lo deriva (necesita el diagrama de momentos,
// que es del análisis). La planilla lo obtiene de la Ec. F1-1.
// ─────────────────────────────────────────────────────────────────────────────

const vigaLtbBase = {
  geom: { familia: 'I', tipo: 'laminado', d: 45.7, bf: 19.0, tf: 1.45, tw: 0.9 },
  material: A992,
  declaradas: { Zx: 1655, Sx: 1457, ry: 4.19, rts: 5.03, J: 51.6, ho: 44.2 },
  demandas: dem({ Mux: 20 * TONF_M }),
  estados: ['flexion-x'],
};

const vigaLtbA = {
  planilla: 'viga-ltb',
  titulo: 'Viga LTB — caso A, arriostrada solo en los apoyos (L_b = 8 m)',
  entrada: { ...vigaLtbBase, estabilidad: est({ Lb: 800, Cb: CB_VANO_COMPLETO }) },
  anclas: (r) => [
    ['λ_pf (B4.1b c.10)', r.clasificacion.flexion[0].lambdap, 9.15, 0.005],
    ['λ_pw (B4.1b c.15)', r.clasificacion.flexion[1].lambdap, 90.5, 0.05],
    ['M_p (F2-1)', r.flexionX.Mp, 5825600, 0.5, 'kgf·cm'],
    ['M_p', r.flexionX.Mp / TONF_M, 58.3, 0.05, 'tonf·m'],
    ['φM_p', (0.9 * r.flexionX.Mp) / TONF_M, 52.4, 0.05, 'tonf·m'],
    ['u_p', (20 * TONF_M) / (0.9 * r.flexionX.Mp), 0.38, 0.005],
    ['L_p (F2-5)', r.flexionX.Lp, 177.5, 0.05, 'cm'],
    ['L_p', r.flexionX.Lp / M, 1.78, 0.005, 'm'],
    ['L_r (F2-6)', r.flexionX.Lr, 516, 0.5, 'cm'],
    ['L_r', r.flexionX.Lr / M, 5.16, 0.005, 'm'],
    ['F_cr con C_b (F2-4)', r.flexionX.Fcr, 1453, 0.5, 'kgf/cm²'],
    ['M_n', r.flexionX.Mn / TONF_M, 21.2, 0.05, 'tonf·m'],
    ['φM_n', r.flexionX.phiMn, 1905000, 500, 'kgf·cm'],
    ['φM_n', r.flexionX.phiMn / TONF_M, 19.1, 0.05, 'tonf·m'],
    ['u_A', (20 * TONF_M) / r.flexionX.phiMn, 1.05, 0.005],
    ['zona elástica', r.flexionX.zona === 'elastica' ? 1 : 0, 1, 0.5],
  ],
};

/** Caso A sin el crédito por gradiente: C_b = 1,0. */
const vigaLtbA1 = {
  planilla: 'viga-ltb',
  titulo: 'Viga LTB — caso A sin crédito C_b (C_b = 1,0)',
  entrada: { ...vigaLtbBase, estabilidad: est({ Lb: 800, Cb: 1.0 }) },
  anclas: (r) => [
    ['F_cr1 (F2-4, sin C_b)', r.flexionX.Fcr, 1279, 0.5, 'kgf/cm²'],
    ['φM_n1', r.flexionX.phiMn / TONF_M, 16.8, 0.05, 'tonf·m'],
  ],
};

const vigaLtbB = {
  planilla: 'viga-ltb',
  titulo: 'Viga LTB — caso B, un arriostre a media luz (L_b = 4 m)',
  entrada: { ...vigaLtbBase, estabilidad: est({ Lb: 400, Cb: CB_MEDIO_VANO }) },
  anclas: (r) => [
    ['M_p', r.flexionX.Mp / TONF_M, 58.26, 0.005, 'tonf·m'],
    ['M_n (F2-2)', r.flexionX.Mn / TONF_M, 56.6, 0.05, 'tonf·m'],
    ['φM_n', r.flexionX.phiMn / TONF_M, 50.9, 0.05, 'tonf·m'],
    ['u_B', (20 * TONF_M) / r.flexionX.phiMn, 0.39, 0.005],
    ['zona inelástica', r.flexionX.zona === 'inelastica' ? 1 : 0, 1, 0.5],
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Caso 3 · viga-columna — W250×58, A992
// Cap. H (H1-1a) sobre las cadenas de E3 y F2. B₁ se calcula acá con la Ec.
// A-8-3 y entra al motor como dato, igual que en la herramienta: depende del
// diagrama de momentos y del método de análisis, no de la sección.
// ─────────────────────────────────────────────────────────────────────────────

const IX_VC = 8700;
const LCX_VC = 700;
const PU_VC = 90 * TONF;
const MU_VC = ((1.306 * 49) / 8) * TONF_M; // w_u·L²/8, con w_u = 1,306 tonf/m
const PE1_VC = (Math.PI ** 2 * A992.E * IX_VC) / LCX_VC ** 2; // Ec. A-8-5
const B1_VC = Math.max(1 / (1 - PU_VC / PE1_VC), 1); // Ec. A-8-3 con C_m = 1,0

const RY_VC = 5.03;
const AG_VC = 74.2;
const HO_VC = 23.9;
const IY_VC = AG_VC * RY_VC ** 2; // la planilla lo deriva así: I_y = A_g·r_y²

const vigaColumnaA = {
  planilla: 'viga-columna',
  titulo: 'Viga-columna — cadena A, con puntal a media altura',
  entrada: {
    geom: { familia: 'I', tipo: 'laminado', d: 25.2, bf: 20.3, tf: 1.35, tw: 0.8 },
    material: A992,
    declaradas: {
      Ag: AG_VC,
      Ix: IX_VC,
      Iy: IY_VC,
      rx: 10.8,
      ry: RY_VC,
      Zx: 767,
      Sx: 690,
      rts: 5.69,
      J: 40.6,
      ho: HO_VC,
      Cw: (IY_VC * HO_VC ** 2) / 4, // User Note de F2
    },
    estabilidad: est({ Lcx: LCX_VC, Lcy: 350, Lcz: 350, Lb: 350, Cb: CB_MEDIO_VANO, B1: B1_VC }),
    demandas: dem({ Pu: PU_VC, Mux: MU_VC }),
    estados: ['compresion', 'flexion-x', 'interaccion'],
  },
  anclas: (r) => [
    ['M_u = w_u·L²/8', MU_VC / TONF_M, 8.0, 0.05, 'tonf·m'],
    ['b_f/2t_f', r.clasificacion.compresion[0].lambda, 7.53, 0.04],
    ['λ_rf (B4.1a)', r.clasificacion.compresion[0].lambdar, 13.5, 0.05],
    ['λ_rw (B4.1a)', r.clasificacion.compresion[1].lambdar, 35.9, 0.05],
    ['λ_pf (B4.1b)', r.clasificacion.flexion[0].lambdap, 9.15, 0.005],
    ['λ_pw (B4.1b)', r.clasificacion.flexion[1].lambdap, 90.5, 0.05],
    ['λ_x', r.compresion.lambdaX, 64.8, 0.05],
    ['λ_yA', r.compresion.lambdaY, 69.58, 0.005],
    ['F_eA (E3-4)', r.compresion.Fe, 4158, 0.5, 'kgf/cm²'],
    ['F_y/F_eA', A992.Fy / r.compresion.Fe, 0.846, 0.0005],
    ['F_nA (E3-2)', r.compresion.Fn, 2470, 0.5, 'kgf/cm²'],
    // Misma especie que la columna de galpón: el post exhibe 164 947 kgf con
    // F_n redondeado y la cadena completa da 164 939 — declarado en
    // meta.esperadoFalso.c_rdpakgf de la planilla.
    ['φP_nA (E3-1)', r.compresion.phiPn, 164939, 5, 'kgf'],
    ['φP_nA', r.compresion.phiPn / TONF, 164.9, 0.05, 'tonf'],
    ['u_PA', r.interaccion.uP, 0.55, 0.005],
    ['L_p (F2-5)', r.flexionX.Lp / M, 2.13, 0.005, 'm'],
    ['L_r (F2-6)', r.flexionX.Lr / M, 7.38, 0.005, 'm'],
    ['M_p (F2-1)', r.flexionX.Mp, 2699840, 0.5, 'kgf·cm'],
    ['M_p', r.flexionX.Mp / TONF_M, 27.0, 0.05, 'tonf·m'],
    ['φM_nA (tope M_p)', r.flexionX.phiMn / TONF_M, 24.3, 0.05, 'tonf·m'],
    ['P_e1 (A-8-5)', PE1_VC, 357481, 0.5, 'kgf'],
    ['α·P_u/P_e1', PU_VC / PE1_VC, 0.25, 0.005],
    ['B₁ (A-8-3)', B1_VC, 1.34, 0.005],
    ['M_r = B₁·M_u', (B1_VC * MU_VC) / TONF_M, 10.7, 0.05, 'tonf·m'],
    ['u_MA', r.interaccion.uMx, 0.44, 0.005],
    ['u_A (H1-1a)', r.interaccion.u, 0.94, 0.005],
    ['rige H1-1a', r.interaccion.ecuacion === 'H1-1a' ? 1 : 0, 1, 0.5],
  ],
};

const vigaColumnaB = {
  planilla: 'viga-columna',
  titulo: 'Viga-columna — cadena B, sin puntal (L_cy = L_b = 7 m)',
  entrada: {
    ...vigaColumnaA.entrada,
    // El vano completo: el mismo C_b que el caso A de la viga LTB de 8 m, porque
    // no depende de w ni de L.
    estabilidad: est({ Lcx: LCX_VC, Lcy: 700, Lcz: 700, Lb: 700, Cb: CB_VANO_COMPLETO, B1: B1_VC }),
  },
  anclas: (r) => [
    ['λ_yB', r.compresion.lambdaY, 139, 0.5],
    ['φP_nB', r.compresion.phiPn / TONF, 60.9, 0.05, 'tonf'],
    ['φM_nB', r.flexionX.phiMn / TONF_M, 18.1, 0.05, 'tonf·m'],
    ['u_B (H1-1a)', r.interaccion.u, 2.0, 0.05],
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Caso 4 · diagonal-hss-traccion — HSS 4×4×¼ (≈ □100×100×6), A500 Gr. C
// D2-1, Tabla B4.1a caso 6, E3-2 · NCh2369:2025 8.3.1, 8.6.3, Tabla 9.
// ─────────────────────────────────────────────────────────────────────────────

const AG_HSS = 21.7;
const R_HSS = 3.84;

const diagonalHss = {
  planilla: 'diagonal-hss-traccion',
  titulo: 'Diagonal HSS 4×4×¼ — el cruce fijo (L_c = 0,5·L)',
  entrada: {
    geom: { familia: 'HSS-R', B: 10.16, H: 10.16, t: 0.59 },
    material: A500C,
    // A_g y r son de catálogo AISC: las paredes rectas SOBREESTIMAN el área
    // (no llevan los radios de esquina). Es el ítem abierto de AUDIT.md:721.
    declaradas: { Ag: AG_HSS, rx: R_HSS, ry: R_HSS },
    estabilidad: est({ Lcx: 225, Lcy: 225, Lcz: 225, Lb: 225 }),
    demandas: dem({ Pu: 42 * TONF, Tu: 42 * TONF }),
    estados: ['compresion', 'traccion', 'sismico'],
  },
  anclas: (r) => [
    ['b_w = B − 3t', 10.16 - 3 * 0.59, 8.39, 0.005, 'cm'],
    ['λ_w', r.clasificacion.compresion[0].lambda, 14.2, 0.05],
    ['λ_r (B4.1a c.6)', r.clasificacion.compresion[0].lambdar, 33.7, 0.05],
    ['λ_w/λ_r', r.clasificacion.compresion[0].lambda / r.clasificacion.compresion[0].lambdar, 0.42, 0.005],
    ['λ_c', r.compresion.lambdaX, 58.6, 0.05],
    ['F_e (E3-4)', r.compresion.Fe, 5864, 0.5, 'kgf/cm²'],
    ['F_y/F_e', A500C.Fy / r.compresion.Fe, 0.6, 0.0005],
    ['λ_lim', r.compresion.lambdaLim, 113.4, 0.05],
    ['F_n (E3-2)', r.compresion.Fn, 2738, 0.5, 'kgf/cm²'],
    ['φP_n', r.compresion.phiPn, 53474, 0.5, 'kgf'],
    ['φP_n', r.compresion.phiPn / TONF, 53.5, 0.05, 'tonf'],
    ['u_com', (42 * TONF) / r.compresion.phiPn, 0.79, 0.005],
    ['φP_n fluencia (D2-1)', r.traccion.phiPn, 68746, 0.5, 'kgf'],
    ['φP_n fluencia', r.traccion.phiPn / TONF, 68.7, 0.05, 'tonf'],
    ['F_ye = R_y·F_y (8.3.1)', r.sismico.Fye, 4576, 0.5, 'kgf/cm²'],
    ['λ_md (Tabla 9)', r.sismico.lambdaMd, 16.05, 0.005],
    ['λ_nch = 1,5π√(E/F_y)', r.sismico.lambdaGlobal, 113.4, 0.05],
    ['u_md', r.clasificacion.compresion[0].lambda / r.sismico.lambdaMd, 0.886, 0.0005],
    ['u_esb', r.compresion.lambdaX / r.sismico.lambdaGlobal, 0.52, 0.005],
    ['T_ye = F_ye·A_g', r.sismico.Tye / TONF, 99.3, 0.05, 'tonf'],
    ['F_cre (8.3.1)', r.sismico.Fcre, 3301, 0.5, 'kgf/cm²'],
    ['P_ne = 1,14·F_cre·A_g', r.sismico.Pne / TONF, 81.7, 0.05, 'tonf'],
  ],
};

/** La misma diagonal sin el cruce fijo: L_c = L. Los tres ✗ que el post exhibe. */
const diagonalHssSinCruce = {
  planilla: 'diagonal-hss-traccion',
  titulo: 'Diagonal HSS — sin el cruce fijo (L_c = L = 4,5 m)',
  entrada: {
    ...diagonalHss.entrada,
    estabilidad: est({ Lcx: 450, Lcy: 450, Lcz: 450, Lb: 450 }),
  },
  anclas: (r) => [
    ['λ_0', r.compresion.lambdaX, 117.2, 0.05],
    ['F_e0 (E3-4)', r.compresion.Fe, 1466, 0.5, 'kgf/cm²'],
    ['F_y/F_e0', A500C.Fy / r.compresion.Fe, 2.4, 0.005],
    ['F_n0 (E3-3)', r.compresion.Fn, 1286, 0.5, 'kgf/cm²'],
    ['φP_n0', r.compresion.phiPn / TONF, 25.1, 0.05, 'tonf'],
    ['u_com0', (42 * TONF) / r.compresion.phiPn, 1.67, 0.005],
    ['u_esb0 (8.6.3 ✗)', r.compresion.lambdaX / r.sismico.lambdaGlobal, 1.03, 0.005],
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Caso 5 · viga-hss-flexion — cinco tubos A500 Gr. C contra M_u = 20 tonf·m
// Cap. F Sección F7 entera (F7-1, F7-2, F7-3/F7-4, F7-6, F7-8/F7-10/F7-11),
// Tabla B4.1b casos 17 y 19, §B4.1b(d), §B4.2 y G4 en sus dos ramas de C_v2.
//
// Es el único caso donde NADA entra declarado: la planilla deriva todas las
// propiedades de B, H y t, así que `declaradas` va vacío y el motor tiene que
// reproducir también propsHssR. La pared de diseño (0,93·t_nominal, §B4.2) se
// escribe en la geometría, que es donde el motor la espera.
// ─────────────────────────────────────────────────────────────────────────────

const MU_HSS = 20 * TONF_M;
const VU_HSS = 10 * TONF;
const LB_HSS = 800;

/** Un tubo del barrido: entra la pared NOMINAL y sale la de diseño. */
const tubo = (B, H, tnom) => ({
  geom: { familia: 'HSS-R', B, H, t: 0.93 * tnom },
  material: A500C,
  estabilidad: est({ Lb: LB_HSS, Cb: CB_VANO_COMPLETO }),
  demandas: dem({ Mux: MU_HSS, Vu: VU_HSS }),
  estados: ['flexion-x', 'corte'],
});

const hssA = {
  planilla: 'viga-hss-flexion',
  titulo: 'Viga HSS — caso A, □250×250×10: ala compacta (Ec. F7-1)',
  entrada: tubo(25, 25, 1.0),
  anclas: (r) => [
    ['t de diseño (B4.2)', 0.93 * 1.0, 0.93, 0.0005, 'cm'],
    ['A_g (paredes rectas)', r.propiedades.Ag, 89.54, 0.005, 'cm²'],
    ['I_x', r.propiedades.Ix, 8659, 0.5, 'cm⁴'],
    ['S_x', r.propiedades.Sx, 692.7, 0.05, 'cm³'],
    ['Z_x', r.propiedades.Zx, 808.6, 0.05, 'cm³'],
    ['J (Bredt)', r.propiedades.J, 12969, 0.5, 'cm⁴'],
    ['r_y', r.propiedades.ry, 9.83, 0.005, 'cm'],
    ['λ_pf (B4.1b c.17)', r.clasificacion.flexion[0].lambdap, 26.96, 0.005],
    ['λ_rf (B4.1b c.17)', r.clasificacion.flexion[0].lambdar, 33.7, 0.005],
    ['λ_pw (B4.1b c.19)', r.clasificacion.flexion[1].lambdap, 58.26, 0.005],
    ['λ_rw (B4.1b c.19)', r.clasificacion.flexion[1].lambdar, 137.2, 0.05],
    ['λ_ala = (B−3t)/t', r.clasificacion.flexion[0].lambda, 23.88, 0.005],
    ['ala compacta', r.clasificacion.claseAlaFlexion === 'compacta' ? 1 : 0, 1, 0.5],
    ['alma compacta', r.clasificacion.claseAlmaFlexion === 'compacta' ? 1 : 0, 1, 0.5],
    ['M_p (F7-1)', r.flexionX.Mp / TONF_M, 28.46, 0.005, 'tonf·m'],
    ['L_p (F7-10)', r.flexionX.Lp / M, 9.87, 0.005, 'm'],
    ['L_r (F7-11)', r.flexionX.Lr / M, 253.3, 0.05, 'm'],
    // F7.4(a): L_b ≤ L_p, el LTB no aplica. El motor lo marca como zona plástica.
    ['LTB no aplica', r.flexionX.zona === 'plastica' ? 1 : 0, 1, 0.5],
    ['gobierna fluencia', r.flexionX.gobierna === 'fluencia' ? 1 : 0, 1, 0.5],
    ['φM_n', r.flexionX.phiMn / TONF_M, 25.62, 0.005, 'tonf·m'],
    ['u_A', MU_HSS / r.flexionX.phiMn, 0.78, 0.005],
    ['A_w = 2·h·t (G4)', r.corte.Aw, 41.31, 0.005, 'cm²'],
    ['C_v2 = 1 (G2-9)', r.corte.Cv, 1.0, 0.0005],
    ['φV_n (G4-1)', r.corte.phiVn / TONF, 78.5, 0.05, 'tonf'],
  ],
};

const hssB = {
  planilla: 'viga-hss-flexion',
  titulo: 'Viga HSS — caso B, □250×250×8: ala no compacta (Ec. F7-2)',
  entrada: tubo(25, 25, 0.8),
  anclas: (r) => [
    ['A_g', r.propiedades.Ag, 72.19, 0.005, 'cm²'],
    ['S_x', r.propiedades.Sx, 566.8, 0.05, 'cm³'],
    ['Z_x', r.propiedades.Zx, 656.8, 0.05, 'cm³'],
    ['λ_ala', r.clasificacion.flexion[0].lambda, 30.602, 0.0005],
    ['ala no compacta', r.clasificacion.claseAlaFlexion === 'no-compacta' ? 1 : 0, 1, 0.5],
    ['M_p', r.flexionX.Mp / TONF_M, 23.12, 0.005, 'tonf·m'],
    ['F_y·S_x (piso de F7-2)', (A500C.Fy * r.propiedades.Sx) / TONF_M, 19.95, 0.005, 'tonf·m'],
    ['M_n (F7-2)', r.flexionX.Mn / TONF_M, 21.41, 0.005, 'tonf·m'],
    ['robo sobre M_p', (1 - r.flexionX.Mn / r.flexionX.Mp) * 100, 7.4, 0.005, '%'],
    ['L_p (F7-10)', r.flexionX.Lp / M, 9.95, 0.005, 'm'],
    ['gobierna FLB', r.flexionX.gobierna === 'FLB' ? 1 : 0, 1, 0.5],
    ['φM_n', r.flexionX.phiMn / TONF_M, 19.27, 0.005, 'tonf·m'],
    ['u_B (no pasa)', MU_HSS / r.flexionX.phiMn, 1.04, 0.005],
  ],
};

const hssC = {
  planilla: 'viga-hss-flexion',
  titulo: 'Viga HSS — caso C, □250×250×6: ala esbelta (Ecs. F7-4 y F7-3)',
  entrada: tubo(25, 25, 0.6),
  anclas: (r) => [
    ['A_g', r.propiedades.Ag, 54.55, 0.005, 'cm²'],
    ['S_x', r.propiedades.Sx, 434.8, 0.05, 'cm³'],
    ['λ_ala', r.clasificacion.flexion[0].lambda, 41.803, 0.0005],
    ['ala esbelta', r.clasificacion.claseAlaFlexion === 'esbelta' ? 1 : 0, 1, 0.5],
    ['alma compacta', r.clasificacion.claseAlmaFlexion === 'compacta' ? 1 : 0, 1, 0.5],
    ['M_p', r.flexionX.Mp / TONF_M, 17.6, 0.005, 'tonf·m'],
    // M_n = F_y·S_e, así que S_e sale del propio resultado: es el número que la
    // Ec. F7-3 pone en juego, y el que la planilla contrasta contra 399,7.
    ['S_e (F7-3)', r.flexionX.Mn / A500C.Fy, 399.7, 0.05, 'cm³'],
    ['M_n (F7-3)', r.flexionX.Mn / TONF_M, 14.07, 0.005, 'tonf·m'],
    ['robo sobre M_p', (1 - r.flexionX.Mn / r.flexionX.Mp) * 100, 20.1, 0.05, '%'],
    ['L_p (F7-10)', r.flexionX.Lp / M, 10.02, 0.005, 'm'],
    ['φM_n', r.flexionX.phiMn / TONF_M, 12.66, 0.005, 'tonf·m'],
    ['u_C (no pasa)', MU_HSS / r.flexionX.phiMn, 1.58, 0.005],
  ],
};

const hssD = {
  planilla: 'viga-hss-flexion',
  titulo: 'Viga HSS — caso D, □300×200×6: la misma A_g repartida distinto',
  entrada: tubo(20, 30, 0.6),
  anclas: (r) => [
    // 250+250 = 300+200 y A_g = 2t(B+H) − 4t²: la igualdad con el caso C es
    // exacta, no una coincidencia de redondeo. Por eso la tolerancia es cerrada.
    ['A_g = la del caso C', r.propiedades.Ag, 54.5545, 0.0005, 'cm²'],
    ['S_x', r.propiedades.Sx, 471.9, 0.05, 'cm³'],
    ['Z_x', r.propiedades.Zx, 561.3, 0.05, 'cm³'],
    ['r_y', r.propiedades.ry, 8.34, 0.005, 'cm'],
    ['λ_ala', r.clasificacion.flexion[0].lambda, 32.84, 0.005],
    ['λ_alma', r.clasificacion.flexion[1].lambda, 50.76, 0.005],
    ['ala no compacta', r.clasificacion.claseAlaFlexion === 'no-compacta' ? 1 : 0, 1, 0.5],
    ['alma compacta', r.clasificacion.claseAlmaFlexion === 'compacta' ? 1 : 0, 1, 0.5],
    ['M_p', r.flexionX.Mp / TONF_M, 19.76, 0.005, 'tonf·m'],
    ['M_n (F7-2)', r.flexionX.Mn / TONF_M, 17.01, 0.005, 'tonf·m'],
    // L_p < L_b: acá F7.4(b) SÍ aplica, y con el crédito C_b la Ec. F7-8 topa en
    // M_p. Es el hallazgo que corrigió el post: aplicar no es gobernar.
    ['L_p (F7-10) < L_b', r.flexionX.Lp / M, 7.15, 0.005, 'm'],
    ['L_r (F7-11)', r.flexionX.Lr / M, 186.9, 0.05, 'm'],
    ['LTB en zona inelástica', r.flexionX.zona === 'inelastica' ? 1 : 0, 1, 0.5],
    ['gobierna FLB, no LTB', r.flexionX.gobierna === 'FLB' ? 1 : 0, 1, 0.5],
    ['φM_n', r.flexionX.phiMn / TONF_M, 15.31, 0.005, 'tonf·m'],
    ['u_D (no pasa)', MU_HSS / r.flexionX.phiMn, 1.31, 0.005],
  ],
};

/**
 * La Ec. F7-8 ejercida de verdad, con el LTB gobernando.
 *
 * En los cinco tubos del post el LTB nunca gobierna —ése es justamente el punto
 * del ejemplo—, así que `r.flexionX.Mn` nunca es el valor de F7-8 y anclarlo
 * desde ellos no probaría nada. La planilla publica el contrafactual que sí lo
 * fuerza: el □250×250×10 tiene el ala compacta, así que si se estira L_b hasta
 * los 70,68 m que ella despeja, lo único que puede recortar es el LTB, y por
 * construcción tiene que recortar el 10 % exacto de M_p.
 *
 * Es la comprobación más fuerte de la sección: el motor tiene que llegar al
 * mismo punto de la recta al que la planilla llegó despejándola al revés.
 */
const hssALargo = {
  planilla: 'viga-hss-flexion',
  titulo: 'Viga HSS — caso A con L_b = 70,68 m: la Ec. F7-8 gobernando',
  entrada: { ...tubo(25, 25, 1.0), estabilidad: est({ Lb: 70.683 * M, Cb: 1.0 }) },
  anclas: (r) => [
    ['L_p < L_b ≤ L_r', r.flexionX.zona === 'inelastica' ? 1 : 0, 1, 0.5],
    ['gobierna el LTB', r.flexionX.gobierna === 'LTB' ? 1 : 0, 1, 0.5],
    ['M_n/M_p = 0,90 (F7-8)', r.flexionX.Mn / r.flexionX.Mp, 0.9, 0.0005],
    ['M_n', r.flexionX.Mn / TONF_M, 25.617, 0.005, 'tonf·m'],
  ],
};

const hssE = {
  planilla: 'viga-hss-flexion',
  titulo: 'Viga HSS — caso E, □400×200×6: la adoptada, y la única de alma no compacta',
  entrada: tubo(20, 40, 0.6),
  anclas: (r) => [
    ['A_g', r.propiedades.Ag, 65.71, 0.005, 'cm²'],
    ['S_x', r.propiedades.Sx, 707.4, 0.05, 'cm³'],
    ['Z_x', r.propiedades.Zx, 862.0, 0.05, 'cm³'],
    ['J (Bredt)', r.propiedades.J, 11145, 0.5, 'cm⁴'],
    ['r_y', r.propiedades.ry, 8.59, 0.005, 'cm'],
    ['λ_ala', r.clasificacion.flexion[0].lambda, 32.84, 0.005],
    ['λ_alma', r.clasificacion.flexion[1].lambda, 68.685, 0.0005],
    ['alma NO compacta', r.clasificacion.claseAlmaFlexion === 'no-compacta' ? 1 : 0, 1, 0.5],
    ['M_p', r.flexionX.Mp / TONF_M, 30.34, 0.005, 'tonf·m'],
    ['L_p (F7-10)', r.flexionX.Lp / M, 6.42, 0.005, 'm'],
    ['L_r (F7-11)', r.flexionX.Lr / M, 172.0, 0.05, 'm'],
    ['LTB en zona inelástica', r.flexionX.zona === 'inelastica' ? 1 : 0, 1, 0.5],
    // Manda el ala (−15,6 %) sobre el alma (−2,4 %): la Ec. F7-6 se ejerce pero
    // no gobierna, así que su valor se contrasta en el caso propio de abajo.
    ['gobierna FLB', r.flexionX.gobierna === 'FLB' ? 1 : 0, 1, 0.5],
    ['M_n (F7-2)', r.flexionX.Mn / TONF_M, 25.6, 0.005, 'tonf·m'],
    ['robo sobre M_p', (1 - r.flexionX.Mn / r.flexionX.Mp) * 100, 15.6, 0.05, '%'],
    ['φM_n', r.flexionX.phiMn / TONF_M, 23.04, 0.005, 'tonf·m'],
    ['u_E (pasa)', MU_HSS / r.flexionX.phiMn, 0.87, 0.005],
    ['A_w = 2·h·t (G4)', r.corte.Aw, 42.77, 0.005, 'cm²'],
    ['λ del alma en G4', r.corte.lambda, 68.685, 0.0005],
    ['C_v2 < 1 (G2-10)', r.corte.Cv, 0.862, 0.0005],
    ['φV_n (G4-1)', r.corte.phiVn / TONF, 70.1, 0.05, 'tonf'],
    ['u_v', VU_HSS / r.corte.phiVn, 0.14, 0.005],
  ],
};

/**
 * La Ec. F7-6 aislada.
 *
 * En el □400×200×6 el alma es no compacta y la F7-6 se evalúa, pero queda
 * tapada por el ala (−2,4 % contra −15,6 %), así que `r.flexionX.Mn` no la
 * expone. Acá se rehace desde lo que el motor SÍ publica —M_p, S_x y la fila de
 * la Tabla B4.1b caso 19— y se contrasta contra los 29,62 tonf·m que la
 * planilla calcula con su propia función. Es el mismo tipo de amarre que el B₁
 * de la viga-columna: el número se arma acá y el motor aporta sus operandos.
 */
const hssEAlma = {
  planilla: 'viga-hss-flexion',
  titulo: 'Viga HSS — caso E, la rama del alma aislada (Ec. F7-6)',
  entrada: tubo(20, 40, 0.6),
  anclas: (r) => {
    const { Mp } = r.flexionX;
    const FySx = A500C.Fy * r.propiedades.Sx;
    const alma = r.clasificacion.flexion[1];
    const Mn_wlb = Mp - (Mp - FySx) * ((alma.lambda - alma.lambdap) / (alma.lambdar - alma.lambdap));
    return [
      ['M_p − F_y·S_x', (Mp - FySx) / TONF_M, 5.441, 0.0005, 'tonf·m'],
      ['M_n alma (F7-6)', Mn_wlb / TONF_M, 29.62, 0.005, 'tonf·m'],
      ['costo del alma', (1 - Mn_wlb / Mp) * 100, 2.37, 0.005, '%'],
      ['el alma no gobierna', Mn_wlb > r.flexionX.Mn ? 1 : 0, 1, 0.5],
    ];
  },
};

// ─────────────────────────────────────────────────────────────────────────────

const CASOS = [
  columnaGalpon,
  columnaGalponArriostrada,
  columnaGalponEjeDebil,
  vigaLtbA,
  vigaLtbA1,
  vigaLtbB,
  vigaColumnaA,
  vigaColumnaB,
  diagonalHss,
  diagonalHssSinCruce,
  hssA,
  hssB,
  hssC,
  hssD,
  hssALargo,
  hssE,
  hssEAlma,
];

const VERDE = '\x1b[32m';
const ROJO = '\x1b[31m';
const GRIS = '\x1b[90m';
const RESET = '\x1b[0m';

let fallas = 0;
let total = 0;

for (const caso of CASOS) {
  console.log(`\n${caso.titulo}`);
  console.log(`${GRIS}  ancla: public/planillas/${caso.planilla}.json${RESET}`);

  let r;
  try {
    r = verificarSeccion(caso.entrada);
  } catch (e) {
    console.log(`  ${ROJO}✗ el motor lanzó: ${e.message}${RESET}`);
    fallas++;
    continue;
  }

  for (const [etiqueta, valor, esperado, tol, unidad = ''] of caso.anclas(r)) {
    total++;
    const v = Number(valor);
    const dif = Math.abs(v - esperado);
    const ok = Number.isFinite(v) && dif <= tol;
    if (!ok) fallas++;
    const marca = ok ? `${VERDE}✓${RESET}` : `${ROJO}✗${RESET}`;
    const u = unidad ? ` ${unidad}` : '';
    const detalle = ok
      ? `${GRIS}${v.toPrecision(6)}${u}${RESET}`
      : `${ROJO}${v.toPrecision(6)}${u} — esperado ${esperado}${u} ± ${tol}, difiere ${dif.toPrecision(3)}${RESET}`;
    console.log(`  ${marca} ${etiqueta.padEnd(26)} ${detalle}`);
  }

  const avisos = [...new Set(r.warnings)];
  for (const w of avisos) console.log(`  ${GRIS}· ${w}${RESET}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Fase 2 · Matriz familia × estados sobre la MEMORIA
//
// Existe por un defecto real: el generador de memorias solo cubría 3 de los 7
// estados límite, y en un HSS en flexocompresión emitía `u_tot := u_c +
// (8/9)*u_f` sin definir nunca `u_f` — la hoja llegaba rota al canvas. No lo
// detectó nadie porque los cuatro casos de arriba usan subconjuntos cómodos de
// estados y ninguno combinaba HSS con interacción.
//
// Acá se corren las TRES familias con las SIETE verificaciones activas, y de
// cada memoria se comprueba que:
//   1. cubra todos los checks que el motor produjo,
//   2. evalúe sin errores en el motor mathjs del canvas (símbolos, unidades),
//   3. no tenga comparaciones falsas sin declarar en meta.esperadoFalso.
// Los puntos 2 y 3 son el chequeo de doble entrada entre los dos motores.
// ─────────────────────────────────────────────────────────────────────────────

const TODOS_ESTADOS = [
  'compresion',
  'traccion',
  'flexion-x',
  'flexion-y',
  'corte',
  'interaccion',
  'sismico',
];

/** Variable que cada check debe haber dejado definida en la hoja. */
const VARIABLE_DE = {
  compresion: 'Rd_c',
  traccion: 'Rd_t',
  'flexion-x': 'Rd_f',
  'flexion-y': 'Rd_fy',
  corte: 'Rd_v',
  interaccion: 'u_tot',
  'nch-ala': 'lam_md',
  'nch-pared-b': 'lam_md',
  'nch-pared-h': 'lam_md',
  'nch-esbeltez': 'lam_nch',
};

const MATRIZ = [
  {
    titulo: 'Perfil I laminado — W250×73 con las 7 verificaciones',
    entrada: {
      geom: { familia: 'I', tipo: 'laminado', d: 25.3, bf: 25.4, tf: 1.42, tw: 0.86 },
      material: A992,
      declaradas: { Ag: 92.8, rx: 11.0, ry: 6.46 },
      estabilidad: est({ Lcx: 1500, Lcy: 375, Lcz: 375, Lb: 375, Cb: 1, B1: 1.1 }),
      demandas: dem({ Pu: 65 * TONF, Tu: 20 * TONF, Mux: 5 * TONF_M, Muy: 1 * TONF_M, Vu: 15 * TONF }),
      estados: TODOS_ESTADOS,
      traccion: { An: 80, U: 0.85 },
    },
  },
  {
    titulo: 'Perfil I armado — alma alta, con las 7 verificaciones',
    entrada: {
      geom: { familia: 'I', tipo: 'armado', d: 60, bf: 25, tf: 1.6, tw: 0.8 },
      material: A992,
      estabilidad: est({ Lcx: 600, Lcy: 300, Lcz: 300, Lb: 300, Cb: 1.2, B1: 1 }),
      demandas: dem({ Pu: 40 * TONF, Tu: 10 * TONF, Mux: 20 * TONF_M, Muy: 2 * TONF_M, Vu: 30 * TONF }),
      estados: TODOS_ESTADOS,
    },
  },
  {
    titulo: 'HSS rectangular — flexocompresión con las 7 verificaciones',
    entrada: {
      geom: { familia: 'HSS-R', B: 20, H: 30, t: 0.8 },
      material: A500C,
      estabilidad: est({ Lcx: 400, Lcy: 400, Lcz: 400, Lb: 400, Cb: 1, B1: 1.05 }),
      demandas: dem({ Pu: 30 * TONF, Tu: 15 * TONF, Mux: 8 * TONF_M, Muy: 3 * TONF_M, Vu: 10 * TONF }),
      estados: TODOS_ESTADOS,
    },
  },
  {
    titulo: 'HSS circular — con las 7 verificaciones',
    entrada: {
      geom: { familia: 'HSS-C', D: 21.9, t: 0.82 },
      material: A500C,
      estabilidad: est({ Lcx: 350, Lcy: 350, Lcz: 350, Lb: 350, Cb: 1, B1: 1 }),
      demandas: dem({ Pu: 25 * TONF, Tu: 15 * TONF, Mux: 2 * TONF_M, Muy: 1 * TONF_M, Vu: 5 * TONF }),
      estados: TODOS_ESTADOS,
    },
  },
];

console.log(`\n${GRIS}${'─'.repeat(70)}${RESET}`);
console.log('Matriz familia × estados — cobertura y evaluación de la memoria');

for (const caso of MATRIZ) {
  console.log(`\n${caso.titulo}`);
  let r;
  let memoria;
  try {
    r = verificarSeccion(caso.entrada);
    memoria = generarMemoria(caso.entrada, r);
  } catch (e) {
    console.log(`  ${ROJO}✗ ${e.message}${RESET}`);
    fallas++;
    total++;
    continue;
  }

  // 1 · Cobertura: cada check del motor deja su variable en la hoja.
  const definidas = new Set();
  for (const reg of memoria.regions) {
    const d = reg.src.match(/^\s*([A-Za-z_]\w*)\s*:=/);
    if (d) definidas.add(d[1]);
  }
  const sinCubrir = r.checks
    .map((c) => c.id)
    .filter((id) => VARIABLE_DE[id] && !definidas.has(VARIABLE_DE[id]));
  total++;
  if (sinCubrir.length === 0) {
    console.log(`  ${VERDE}✓${RESET} cobertura                  ${GRIS}${r.checks.length} checks, todos documentados${RESET}`);
  } else {
    fallas++;
    console.log(`  ${ROJO}✗ cobertura: la memoria no documenta ${sinCubrir.join(', ')}${RESET}`);
  }

  // 2 y 3 · La hoja evaluada con el motor del canvas.
  const res = evaluateSheet(memoria.regions);
  const errores = [];
  const falsasSinDeclarar = [];
  const declaradasObsoletas = [];
  const esperado = memoria.meta.esperadoFalso ?? {};
  for (const reg of memoria.regions) {
    const rr = res[reg.id];
    if (!rr) continue;
    if (rr.error) errores.push(`${reg.src} → ${rr.error}`);
    if (rr.bool === false && !(reg.id in esperado)) falsasSinDeclarar.push(reg.src);
    if (rr.bool === true && reg.id in esperado) declaradasObsoletas.push(reg.src);
  }

  for (const [etiqueta, lista] of [
    ['sin errores de evaluación', errores],
    ['sin comparaciones falsas no declaradas', falsasSinDeclarar],
    ['sin excepciones obsoletas', declaradasObsoletas],
  ]) {
    total++;
    if (lista.length === 0) {
      console.log(`  ${VERDE}✓${RESET} ${etiqueta.padEnd(26)}`);
    } else {
      fallas++;
      console.log(`  ${ROJO}✗ ${etiqueta}:${RESET}`);
      for (const l of lista.slice(0, 5)) console.log(`      ${ROJO}${l}${RESET}`);
      if (lista.length > 5) console.log(`      ${ROJO}… y ${lista.length - 5} más${RESET}`);
    }
  }

  const nDeclaradas = Object.keys(esperado).length;
  if (nDeclaradas > 0) {
    console.log(`  ${GRIS}· ${nDeclaradas} comparación(es) declarada(s) como esperado-falso${RESET}`);
  }
}

console.log('');
if (fallas === 0) {
  console.log(
    `${VERDE}${total} comprobaciones: anclas contra 5 planillas y la memoria de 4 secciones con las 7 verificaciones. Todo cuadra.${RESET}`
  );
  process.exit(0);
}
console.log(`${ROJO}${fallas} de ${total} comprobaciones fallaron.${RESET}`);
process.exit(1);
