#!/usr/bin/env node
// Renderiza una planilla ya verificada como una página HTML autocontenida.
//
//   npm run artefacto:planilla -- <slug | ruta.json> [...más] [--out dir]
//
// Para qué: compartir una memoria de cálculo por un enlace privado —a un cliente,
// a un revisor— sin publicar un post. Es el primo web de `npm run pdf:planilla`.
// La salida se sube con la herramienta Artifact de Claude, que envuelve el archivo
// en su propio <html>/<head>: por eso esto emite un FRAGMENTO (title + style +
// contenido) y no un documento completo.
//
// Es un visor, no un motor: los números vienen calculados de aquí, la página no
// lleva mathjs ni React. El KaTeX va pre-renderizado a HTML.
//
// Autocontenido de verdad, porque el CSP de un artefacto bloquea todo host
// externo: el CSS de KaTeX va inline con sus fuentes como data URI, y el esquema
// de `/esquemas/` se incrusta como SVG con los tokens ya sustituidos.
//
// Se niega a renderizar una planilla con errores. Una memoria no se comparte con
// un «undefined» adentro; primero se arregla la planilla.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import katex from 'katex';
import { cargarMotor, ROOT } from './lib/motor.mjs';

const argv = process.argv.slice(2);
const opt = (n, d) => {
  const i = argv.indexOf(n);
  return i === -1 ? d : argv[i + 1];
};
const outDir = path.resolve(opt('--out', path.join(tmpdir(), 'struct-pad-artefactos')));
const objetivos = argv.filter((a, i) => !a.startsWith('--') && !argv[i - 1]?.startsWith('--'));

if (objetivos.length === 0) {
  console.error('Uso: npm run artefacto:planilla -- <slug | ruta.json> [...más] [--out dir]');
  process.exit(2);
}

const { evaluateSheet, renderEsquema, ESQUEMAS_PREFIX } = await cargarMotor();

await mkdir(outDir, { recursive: true });

let fallas = 0;
for (const objetivo of objetivos) {
  try {
    const salida = await renderizar(objetivo);
    console.log(`OK  ${salida}`);
  } catch (err) {
    console.error(`FALLA  ${objetivo}: ${err.message}`);
    fallas += 1;
  }
}
process.exit(fallas > 0 ? 1 : 0);

// --- Render ------------------------------------------------------------------

async function renderizar(objetivo) {
  const rutaPlanilla = resolverPlanilla(objetivo);
  const slug = path.basename(rutaPlanilla, '.json');
  const crudo = await readFile(rutaPlanilla, 'utf8');
  const planilla = JSON.parse(crudo);
  const regions = planilla.regions ?? [];
  const meta = planilla.meta ?? {};
  const esperadoFalso = meta.esperadoFalso ?? {};

  const results = evaluateSheet(regions);

  // Orden de lectura, el mismo del canvas y del documento de impresión.
  const ordenadas = [...regions]
    .filter((r) => (r.src ?? '').trim() !== '')
    .sort((a, b) => a.y - b.y || a.x - b.x);

  const conError = ordenadas.filter((r) => results[r.id]?.error);
  if (conError.length > 0) {
    const detalle = conError
      .slice(0, 3)
      .map((r) => `${r.id}: ${results[r.id].error}`)
      .join(' · ');
    throw new Error(
      `la planilla tiene ${conError.length} región(es) con error y no se puede publicar — ${detalle}`,
    );
  }

  const bloques = [];
  let pasos = 0;
  const verdictos = [];

  // La primera región de texto es el título, igual que en WorksheetPrint.
  const regionTitulo = ordenadas.find((r) => r.kind === 'text');
  const titulo = meta.titulo ?? regionTitulo?.src ?? slug;

  for (const r of ordenadas) {
    if (r.id === regionTitulo?.id) continue; // ya va en el encabezado

    if (r.kind === 'image') {
      bloques.push(await bloqueFigura(r, results[r.id]?.scope));
      continue;
    }

    if (r.kind === 'text') {
      bloques.push(
        r.src.includes('━')
          ? `<h2 class="wp-h2">${esc(r.src.replace(/━/g, '').trim())}</h2>`
          : `<p class="wp-label">${esc(r.src)}</p>`,
      );
      continue;
    }

    const res = results[r.id] ?? {};

    if (r.kind === 'program' && res.defined) {
      bloques.push(
        `<p class="wp-label"><code>${esc(res.defined)}</code> — función definida</p>`,
      );
      continue;
    }

    // Verificación: la comparación renderizada más su veredicto.
    if (typeof res.bool === 'boolean') {
      const razon = esperadoFalso[r.id];
      verdictos.push({ id: r.id, ok: res.bool, razon });
      const marca = res.bool
        ? '<span class="wp-ok" aria-label="cumple">✓</span>'
        : '<span class="wp-no" aria-label="no cumple">✗</span>';
      const nota = !res.bool && razon ? `<span class="wp-nota">${esc(razon)}</span>` : '';
      bloques.push(
        `<div class="wp-eq wp-chk">${tex(res.tex, r.src)}${marca}${nota}</div>`,
      );
      continue;
    }

    pasos += 1;
    // El fuente de un programa se guarda plegado: es el desarrollo, no el
    // resultado, y desplegado ahoga la lectura de una memoria larga.
    const fuente =
      r.kind === 'program'
        ? `<details class="wp-src"><summary>ver el programa</summary><pre>${esc(r.src)}</pre></details>`
        : '';
    bloques.push(`<div class="wp-eq">${tex(res.tex, r.src)}</div>${fuente}`);
  }

  const noCumplen = verdictos.filter((v) => !v.ok);
  // Un `false` declarado en meta.esperadoFalso es el hallazgo del ejemplo, no un
  // defecto: se cuenta aparte para que el resumen no lo anuncie como problema.
  const declarados = noCumplen.filter((v) => v.razon).length;
  const contrastes = verdictos.filter((v) => v.id.startsWith('c_')).length;

  const html = documento({
    slug,
    titulo,
    bloques,
    pasos,
    verdictos: verdictos.length,
    noCumplen: noCumplen.length,
    declarados,
    contrastes,
    css: await cssKatex(),
    planillaJson: crudo,
  });

  const salida = path.join(outDir, `${slug}.html`);
  await writeFile(salida, html, 'utf8');
  return `${path.relative(process.cwd(), salida)}  (${(html.length / 1024).toFixed(0)} kB · ${pasos} pasos · ${verdictos.length} verificaciones)`;
}

function resolverPlanilla(objetivo) {
  const directo = objetivo.endsWith('.json')
    ? path.resolve(objetivo)
    : path.join(ROOT, 'public', 'planillas', `${objetivo}.json`);
  if (!existsSync(directo)) throw new Error(`no existe ${path.relative(ROOT, directo)}`);
  return directo;
}

/** LaTeX ya calculado, o el fuente crudo si el motor no pudo generarlo. */
function tex(t, src) {
  if (!t) return `<span class="wp-raw">${esc(src)}</span>`;
  return katex.renderToString(t, { throwOnError: false, displayMode: false });
}

/**
 * Figura. Un esquema de `/esquemas/` se incrusta como SVG con los tokens ya
 * resueltos contra el scope — nunca como `<img src>`: el archivo en disco tiene
 * los `{{tokens}}` sin sustituir, y saldría «{{Rd_pan:tonf}}» donde va el número.
 */
async function bloqueFigura(r, scope) {
  // El ancho de la hoja se respeta como tope, no como medida fija, y va en el
  // contenido y no en la <figure>: la lámina tiene relleno, y una anchura puesta
  // sobre ella dejaría el dibujo más ancho que su marco. El alto se omite —aquí
  // no hay paginación que medir, y fijarlo recorta el SVG al reescalar.
  const tope = r.w ? ` style="max-width:${r.w}px"` : '';
  if (r.src.startsWith(ESQUEMAS_PREFIX)) {
    const svgText = await readFile(path.join(ROOT, 'public', r.src), 'utf8');
    const { svg, faltantes } = renderEsquema(svgText, scope ?? {});
    if (faltantes.length) {
      throw new Error(`el esquema ${r.src} dejó tokens sin resolver: ${faltantes.join(' · ')}`);
    }
    return `<figure class="wp-fig"><div class="wp-lamina"${tope}>${svg}</div></figure>`;
  }
  // Una imagen pegada por el usuario ya viene como data URI dentro de la hoja.
  return `<figure class="wp-fig"><img src="${esc(r.src)}" alt=""${tope}></figure>`;
}

// --- KaTeX autocontenido -----------------------------------------------------

/**
 * El CSS de KaTeX con las fuentes incrustadas.
 *
 * Solo woff2, y se descartan los `url(...woff)` y `url(...ttf)` de respaldo: bajo
 * el CSP de un artefacto esas rutas relativas no resuelven contra nada, así que
 * dejarlas solo suma peticiones muertas. Todo navegador que abra un artefacto
 * lee woff2.
 */
async function cssKatex() {
  const dist = path.join(ROOT, 'node_modules', 'katex', 'dist');
  let css = await readFile(path.join(dist, 'katex.min.css'), 'utf8');

  const fuentes = new Map();
  for (const [, nombre] of css.matchAll(/url\(fonts\/([\w-]+)\.woff2\)/g)) {
    if (fuentes.has(nombre)) continue;
    const buf = await readFile(path.join(dist, 'fonts', `${nombre}.woff2`));
    fuentes.set(nombre, `data:font/woff2;base64,${buf.toString('base64')}`);
  }

  // Se reescribe el `src:` entero de cada @font-face, no solo la primera URL:
  // así los respaldos desaparecen en la misma pasada.
  css = css.replace(
    /src:url\(fonts\/([\w-]+)\.woff2\) format\("woff2"\)[^;}]*/g,
    (todo, nombre) => {
      const uri = fuentes.get(nombre);
      return uri ? `src:url(${uri}) format("woff2")` : todo;
    },
  );
  return css;
}

// --- Documento ---------------------------------------------------------------

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function documento(d) {
  const fecha = new Date().toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Resumen: lo primero que alguien quiere saber de una memoria es si cierra.
  const sinDeclarar = d.noCumplen - d.declarados;
  const estado =
    sinDeclarar > 0
      ? { clase: 'no', texto: `${sinDeclarar} no cumplen` }
      : { clase: 'ok', texto: 'todas cumplen' };

  const fichas = [
    ['Pasos de cálculo', d.pasos],
    ['Verificaciones', d.verdictos],
    ...(d.contrastes > 0 ? [['Contrastes', d.contrastes]] : []),
    ...(d.declarados > 0 ? [['No cumplen a propósito', d.declarados]] : []),
  ];

  return `<title>${esc(d.titulo.split('—')[0].trim())}</title>
<style>
${d.css}

/* Paleta: los tokens del sitio (src/styles/global.css) en claro, y una variante
   oscura derivada de ellos — el neutro va sesgado al azul del acento, no gris
   puro, y el acento se aclara para no perder contraste sobre fondo oscuro. */
:root {
  --ground: #ffffff;
  --surface: #f9fafb;
  --ink: #1a1a1a;
  --muted: #6b7280;
  --border: #e5e7eb;
  --accent: #2563eb;
  --ok: #15803d;
  --no: #b91c1c;
  --ok-bg: #f0fdf4;
  --no-bg: #fef2f2;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --ground: #14161a;
    --surface: #1b1e24;
    --ink: #e8eaed;
    --muted: #9aa3af;
    --border: #2a2f38;
    --accent: #7aa2f7;
    --ok: #4ade80;
    --no: #f87171;
    --ok-bg: #14231a;
    --no-bg: #241618;
  }
}
:root[data-theme="dark"] {
  --ground: #14161a;
  --surface: #1b1e24;
  --ink: #e8eaed;
  --muted: #9aa3af;
  --border: #2a2f38;
  --accent: #7aa2f7;
  --ok: #4ade80;
  --no: #f87171;
  --ok-bg: #14231a;
  --no-bg: #241618;
}

body {
  background: var(--ground);
  color: var(--ink);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-size: 16px;
  line-height: 1.55;
  margin: 0;
  padding: 2.5rem 1.25rem 4rem;
}
.memoria { max-width: 46rem; margin: 0 auto; }

.wp-header { border-bottom: 2px solid var(--ink); padding-bottom: 0.6rem; }
.wp-header h1 {
  font-size: 1.5rem; font-weight: 700; margin: 0; line-height: 1.25;
  text-wrap: balance;
}
.wp-meta { font-size: 0.8rem; color: var(--muted); margin: 0.35rem 0 0; }

.resumen {
  display: flex; flex-wrap: wrap; gap: 0.5rem 2rem; align-items: baseline;
  margin: 1.25rem 0 0; padding: 0.85rem 1rem;
  background: var(--surface); border: 1px solid var(--border); border-radius: 4px;
}
.resumen dl { display: flex; gap: 2rem; flex-wrap: wrap; margin: 0; }
.resumen div { display: flex; flex-direction: column; gap: 0.1rem; }
.resumen dt {
  font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--muted);
}
.resumen dd {
  margin: 0; font-size: 1.15rem; font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.estado {
  margin-left: auto; font-size: 0.8rem; font-weight: 600;
  padding: 0.2rem 0.6rem; border-radius: 999px; white-space: nowrap;
}
.estado.ok { color: var(--ok); background: var(--ok-bg); }
.estado.no { color: var(--no); background: var(--no-bg); }

.wp-h2 {
  font-size: 1rem; font-weight: 700; color: var(--ink);
  border-bottom: 1px solid var(--border);
  margin: 2rem 0 0.75rem; padding-bottom: 0.2rem;
  text-wrap: balance;
}
.wp-label { font-size: 0.875rem; color: var(--muted); margin: 0.9rem 0 0.25rem; }
.wp-eq {
  display: flex; align-items: center; gap: 0.6rem;
  margin: 0.35rem 0; overflow-x: auto; padding-bottom: 0.1rem;
}
.wp-chk {
  border-left: 2px solid var(--border); padding-left: 0.7rem; margin: 0.5rem 0;
}
.wp-raw { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 0.9em; }
.wp-ok { color: var(--ok); font-weight: 700; }
.wp-no { color: var(--no); font-weight: 700; }
.wp-nota { font-size: 0.8rem; color: var(--muted); font-style: italic; }
/* Los esquemas están dibujados para papel blanco: invertirlos en tema oscuro
   rompería el código de color de un plano (rojo = tracción, azul = compresión).
   Se presentan como lámina, con fondo claro propio y un borde que la declara
   deliberada en vez de dejarla parecer una fuga del tema claro. */
.wp-fig {
  margin: 1.25rem 0; max-width: 100%; overflow-x: auto;
  background: #ffffff; border: 1px solid var(--border); border-radius: 4px;
  padding: 0.75rem;
}
.wp-lamina { margin: 0 auto; }
.wp-fig svg, .wp-fig img { max-width: 100%; height: auto; display: block; }
.wp-src { margin: 0.15rem 0 0.6rem; font-size: 0.8rem; }
.wp-src summary { color: var(--accent); cursor: pointer; }
.wp-src pre {
  font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 0.78rem;
  background: var(--surface); border: 1px solid var(--border); border-radius: 4px;
  padding: 0.6rem 0.75rem; overflow-x: auto; margin: 0.4rem 0 0;
}
code { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 0.9em; }

.wp-footer {
  margin-top: 2.5rem; padding-top: 0.9rem; border-top: 1px solid var(--border);
  font-size: 0.78rem; color: var(--muted);
}
.wp-footer p { margin: 0 0 0.6rem; }
#bajar {
  font: inherit; font-size: 0.8rem; font-weight: 500;
  color: var(--accent); background: transparent;
  border: 1px solid var(--border); border-radius: 4px;
  padding: 0.3rem 0.7rem; cursor: pointer;
}
#bajar:hover { border-color: var(--accent); }
#bajar:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
#bajar[hidden] { display: none; }
#bajar-estado { margin-left: 0.6rem; font-size: 0.78rem; }

.katex { font-size: 1.03em; }
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
</style>

<article class="memoria">
  <header class="wp-header">
    <h1>${esc(d.titulo)}</h1>
    <p class="wp-meta">Memoria de cálculo · struct/pad · ${esc(fecha)}</p>
  </header>

  <section class="resumen" aria-label="Resumen de la planilla">
    <dl>
${fichas.map(([k, v]) => `      <div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join('\n')}
    </dl>
    <span class="estado ${estado.clase}">${esc(estado.texto)}</span>
  </section>

${d.bloques.map((b) => `  ${b}`).join('\n')}

  <footer class="wp-footer">
    <p>
      Generada desde la planilla del canvas matemático de struct/pad y verificada con
      <code>npm run verify:planilla</code>. Revisa los datos de entrada antes de
      incorporarla a una memoria de cálculo.
    </p>
    <button id="bajar" type="button" hidden>Descargar la planilla (.json)</button>
    <span id="bajar-estado" role="status"></span>
  </footer>
</article>

<script id="planilla" type="application/json">${d.planillaJson.replace(/</g, '\\u003c')}</script>
<script>
// La descarga solo existe si el visor concede la capacidad "downloads"; fuera de
// claude.ai el botón sencillamente no aparece, en vez de fallar al pulsarlo.
(function () {
  var boton = document.getElementById('bajar');
  var estado = document.getElementById('bajar-estado');
  if (!window.claude || !window.claude.downloads) return;
  boton.hidden = false;
  boton.addEventListener('click', function () {
    estado.textContent = '';
    window.claude.downloads
      .save({
        filename: ${JSON.stringify(`${d.slug}.json`)},
        data: document.getElementById('planilla').textContent,
      })
      .then(function () {
        estado.textContent = 'Descargada.';
      })
      .catch(function (err) {
        var code = err && err.code;
        if (code === 'declined') { estado.textContent = ''; return; }
        if (code === 'rate_limited') {
          estado.textContent = 'Hay otra descarga en curso. Inténtalo en un momento.';
          return;
        }
        if (code === 'unavailable' || code === 'not_granted' ||
            code === 'capability_disabled' || code === 'capability_removed') {
          boton.hidden = true;
          return;
        }
        estado.textContent = 'No se pudo preparar la descarga.';
      });
  });
})();
</script>
`;
}
