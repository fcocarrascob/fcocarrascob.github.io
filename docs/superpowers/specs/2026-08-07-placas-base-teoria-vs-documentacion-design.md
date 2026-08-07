# Placas base: separar la teoría de la documentación de la herramienta

Fecha: 2026-08-07

## El problema

La serie «Placas base» tiene tres posts. Dos enseñan; uno documenta.

`placas-base-empotrada-o-rotulada` abre con un fenómeno («esas reacciones salieron de un modelo
donde alguien dibujó la base empotrada o rotulada») y llega a un número que se recuerda (β·L/EI =
2,47 sobre una escala donde 20 es empotrada y 2 es rotulada). `placa-base-ejemplo-trabajado` hace
lo suyo: dos métodos sobre el mismo caso.

`placas-base-sap2000` no. Abre con *«Esta nota documenta la teoría y las verificaciones que
implementa la herramienta»*, sus títulos son los de la tabla de verificaciones de esa herramienta,
y su promesa es la auditabilidad del cálculo, no la comprensión del fenómeno. Es un buen documento
de lo que es. No es lo que un post de teoría debería ser en este sitio.

El post de referencia del estilo buscado es `gusset-teoria-estados-limite`: abre con un problema
del mundo, cada sección responde un «por qué», deja tres resultados cortos y derivables que se
recuerdan (r = t/√12, el umbral 25 que cae en 7,2 espesores, la razón √3 entre las dos bandas),
cierra con una tabla de qué es cláusula y qué es práctica, y solo al final —en un `<Note>`—
menciona dónde se ejercita con números.

## La causa, que no es de estilo

El post está **estructuralmente atado** a la herramienta. `src/components/placa/PlacaBaseTool.tsx`
mantiene un mapa `THEORY` (líneas 85–91) que enlaza cada fila de la tabla de verificaciones a un
ancla del post:

```ts
const NOTE_URL = '/acero/placas-base-sap2000';
const THEORY: Record<string, { sec: string; hash: string }> = {
  aplastamiento: { sec: '§2', hash: '2-aplastamiento-del-hormigón--aisc-360-j8' },
  'flexion-compresion': { sec: '§3.1', hash: '31-lado-comprimido-voladizos-m-y-n' },
  ...
```

Ese contrato obliga a que los títulos se llamen «§n. Verificación X» y a que el orden del post sea
el de la tabla de la herramienta, no el del fenómeno. El primer párrafo es la consecuencia; el mapa
es la causa. Cualquier reescritura que no rompa ese acoplamiento vuelve a caer en la misma forma.

**La decisión de fondo: la herramienta deja de apuntar al post de teoría y pasa a apuntar a una
página de documentación propia.** El post queda libre para organizarse por fenómeno.

## Lo que ya está adentro, clasificado

El post actual contiene un post de teoría muy bueno enterrado bajo la capa de doc. El trabajo es
separar dos capas, no escribir de cero.

| Material | Hoy | Destino |
|---|---|---|
| Contacto unilateral, plano de tensiones, kern, los 4 regímenes | §1 | Teoría |
| J8 con √(A₂/A₁); 0,95d y 0,8b_f; λn′ de Thornton; t = √(4M/φF_y) | §2–3 | Teoría |
| Los dos sistemas de área de perno (AISC vs. ACI) | Note en §4 | Teoría, sección propia |
| La contradicción interna de la DG1 en b_ef (ancho completo / 2ℓ / 4ℓ) | Note en §3.3 | Teoría, sección propia |
| El exponente 5/3 y su ganancia real; «la armadura de anclaje es el plan» | Notes en §5 | Teoría (§7, condensado) |
| El roce que la DG1 permite y NCh2369 §8.5.4 prohíbe; la llave de corte | §8 | Teoría, sección propia |
| Newton amortiguado, integrales exactas por Green, ρ = n·A_b | §1.3–1.4 | Documentación |
| «La herramienta usa 4ℓ», ψ = 1 fijos, φ = 0,70, fila delantera, λ = 1, A_brg | dispersos | Documentación |
| Barrido SAP2000 + script comtypes | §6 | Documentación |
| Distancias mínimas de detallamiento (J3.3, Tabla J3.4M, ACI 17.9) | §7 | Documentación |
| Alcance y limitaciones de la herramienta | §8 | Documentación |
| **El Cap. 17 completo, ecuación por ecuación (Ec. 15–21)** | §5 | **Se elimina** |

La última fila es el hallazgo que más simplifica: `/hormigon/aci318-25-cap17-anclajes` ya enseña
esos modos, y ya está escrito en el estilo buscado («Breakout — el que casi siempre manda», «Acero
del perno — el fusible»). Son ~200 líneas duplicadas. En el post de placa base quedan solo las
cuatro cosas específicas de placa base, y el resto remite.

## Arquitectura resultante

```
/acero/placas-base-teoria                 ← TEORÍA (reescritura de placas-base-sap2000)
/acero/placas-base-empotrada-o-rotulada   ← TEORÍA (ya en estilo; no se toca)
/acero/placa-base-ejemplo-trabajado       ← EJEMPLO (solo enlaces)
/herramientas/placa-base                  ← la herramienta
/herramientas/placa-base/documentacion    ← DOC (nueva)
```

La doc va como **página `.mdx` bajo `src/pages/`**, no como post de colección: necesita KaTeX y los
componentes `Equation`/`Note`, pero no debe aparecer en los listados de `/acero` ni en las
subsecciones. `markdown.processor` de `astro.config.mjs` aplica a las páginas `.mdx` igual que a
las de colección.

**Riesgo declarado:** que eso no sea cierto en Astro 6 tal como está configurado. Se verifica con
un stub mínimo (una página `.mdx` con un `$$…$$` y un `<Note>`) **antes** de escribir la doc
completa. Si falla, la alternativa es una colección `docs` en `src/content.config.ts` excluida de
todos los listados; el costo es una colección más y una ruta `[slug].astro`.

## El post de teoría

**Título:** *La placa base: la interfaz que solo puede empujar (el kern que es la mitad, el brazo
escondido y los dos códigos que no calculan el mismo perno)*

**Slug:** `placas-base-teoria`.

**Apertura** (sin numerar, como el gusset): la placa base es el único punto de la estructura donde
la carga **cambia de código**. Arriba todo es AISC 360, abajo todo es ACI 318, y la placa hereda
los dos: dos filosofías de φ, dos definiciones del área del perno, dos criterios de ductilidad. Y
el documento con que casi todos la diseñan —la *Design Guide 1*— no es norma de ninguno de los dos,
y lo declara de sí misma en su §6.1. Ese hecho arma el post y prepara el §9.

| § | Sección | Origen |
|---|---|---|
| 1 | **La interfaz que solo puede empujar** — contacto unilateral; el plano de asentamiento; el eje neutro como incógnita y no como dato; los cuatro regímenes | Ec. 1–5 y la tabla de regímenes del §1 actual, sin el solver |
| 2 | **Dos formas de presión, y ninguna es «el método elástico»** — el Ap. B.2 desactiva el malentendido triangular↔ASD; el §4.3.11 declara que el biaxial no tiene método manual | La «Motivación» actual, reencuadrada |
| 3 | **El brazo de la resultante: la variable escondida** — mismo equilibrio, resultante a Y/2 o a Y/3, y T se mueve +51 % sin que σ_max se entere | Nuevo en teoría; el número vive hoy solo en el ejemplo |
| 4 | **La placa como voladizo** — de dónde salen 0,95d y 0,8b_f; el λn′ de Thornton cuando el volado es chico; por qué se diseña contra M_p | §3.1–3.2 actuales |
| 5 | **El lado traccionado: la guía se contradice a sí misma** — ancho completo (§4.3.7, Ec. 4-60) vs. 2ℓ (Ej. B.2-2) vs. 4ℓ | La `<Note>` larga del §3.3, ascendida |
| 6 | **El perno: dos códigos, dos áreas** — coeficiente sobre A_b vs. F_u pleno sobre A_se,N | La `<Note>` del §4, ascendida |
| 7 | **Del perno al hormigón** — solo lo específico de placa base; el resto remite al Cap. 17 | §5 actual, de ~200 líneas a ~40 |
| 8 | **El corte: el que no tiene dueño** — fila delantera; el roce que la DG1 permite y NCh2369 §8.5.4 prohíbe; y por eso la llave de corte | §8 actual |
| 9 | **Qué es cláusula, qué es guía y qué es práctica** | Nuevo — el equivalente del §7 del gusset |

Cierre: un `<Note type="info" title="Dónde se ejercita esto con números">` con el ejemplo trabajado,
la herramienta y su documentación, y el post de rigidez rotacional. Misma forma que el gusset.

### Lo específico de placa base que se queda en el §7

Todo lo demás del Cap. 17 remite a `/hormigon/aci318-25-cap17-anclajes`. Se quedan cuatro cosas,
porque no existen sin una placa base delante:

1. El reparto real de tracciones entre pernos da la excentricidad `e'_N` del grupo — el ψ_ec que
   casi nadie calcula bien, porque supone un reparto uniforme que no ocurre con momento biaxial.
2. Los conos del grupo se traslapan y el pedestal los recorta: A_Nc del grupo es menor que n·A_Nco.
3. La interacción N–V del 17.8 al 1,2 es la que suele decidir, con cada modo pasando por separado.
4. En pedestal, la armadura de anclaje **es el plan, no el plan B** (DG1 §4.4.1, textual), y no hay
   que confundirla con la armadura suplementaria, que no se diseña para carga alguna y solo sube φ
   de 0,70 a 0,75.

### Los tres resultados cortos

Es lo que hace que el post de gusset se recuerde. Los tres se **derivan en el post**, en dos o tres
líneas cada uno, y ninguno se cita de memoria:

- **El kern biaxial es un rombo, y mide la mitad.** Imponer σ ≥ 0 en las cuatro esquinas da
  `|6e_x/B| + |6e_y/N| ≤ 1`. Es un rombo de diagonales B/3 y N/3, área BN/18 — la mitad del
  rectángulo BN/9 que uno dibujaría aplicando N/6 y B/6 por separado.
- **Z/S = 1,5.** La placa se verifica contra t²/4 y no contra t²/6: es una de las pocas piezas donde
  el diseño plástico entra sin discusión, y son 50 % de diferencia en el momento admisible.
- **Los dos sistemas de área de perno llegan casi al mismo número.** A_se,N/A_b = (1 − 0,9743/(n·d))²
  vale ≈ 0,77 para un perno corriente, contra el 0,75 del coeficiente de AISC: ~3 % de diferencia.
  Por eso el error de mezclarlos —0,75·F_u sobre A_se, o F_u pleno sobre A_b— no cuesta 3 % sino
  −23 % o +30 %. Los dos números se calculan en el post, con la definición de A_se,N leída del PDF.

### La tabla del §9

Tres estatus, no dos como en el gusset, y ese es el aporte de la sección: **cláusula AISC**,
**cláusula ACI**, **guía (no obligatoria)** y **práctica**. Filas previstas: aplastamiento J8 ·
líneas críticas 0,95d/0,8b_f · λn′ de Thornton · b_ef del lado traccionado (⚠️ contradictoria) ·
área del perno (⚠️ dos cláusulas incompatibles) · los modos del Cap. 17 · bloque rectangular vs.
triangular (ambas admisibles) · el biaxial (⚠️ la guía se declara incompetente) · el roce (la guía
permite, NCh2369 prohíbe) · la rigidez rotacional del Ap. C · la hipótesis de placa rígida (⚠️).

El remate del post es que la DG1 se declara a sí misma un recurso y no una norma (§6.1). Puesto al
final, reordena todo lo anterior.

## La página de documentación

`src/pages/herramientas/placa-base/documentacion.mdx`. Contenido, en este orden:

1. **Qué resuelve y cómo.** El planteo de equilibrio (las tres ecuaciones), Newton amortiguado sobre
   el potencial convexo, las integrales exactas por el teorema de Green sobre el polígono de
   contacto —no de grilla—, ρ = n·A_b y la insensibilidad a n.
2. **Las decisiones que se apartan de la guía, con su dirección declarada.** b_ef = 4ℓ (no
   conservadora) · σ de esquina contra φ_c f_p,max (más conservadora que el bloque) · h_ef^1,5
   siempre (conservadora, y cuánto) · √(A₂/A₁) = min(B₂/B, N₂/N) · λ = 1 · A_brg ≈ 1,16 d² ·
   ψ_c = ψ_ec,V = ψ_h,V = 1 · φ = 0,70 condición B · la fila delantera toma todo el corte.
3. **El barrido SAP2000.** Por qué no basta la envolvente por componente, cómo obtener la tabla
   *Joint Reactions*, y el script de la API con `comtypes`.
4. **Detallamiento** (J3.3, Tabla J3.4M, ACI 17.9), que es checklist de la herramienta.
5. **Alcance y limitaciones.**

Cada bloque abre con un enlace a la sección de teoría que le corresponde. Los títulos numerados de
esta página son los que consume el mapa `THEORY`.

## Cambios en código

| Archivo | Cambio |
|---|---|
| `astro.config.mjs` | Redirect `/acero/placas-base-sap2000` → `/acero/placas-base-teoria`; el redirect existente de `/blog/placas-base-sap2000` pasa a apuntar directo al nuevo slug, sin encadenar |
| `src/components/placa/PlacaBaseTool.tsx` | `NOTE_URL` → `/herramientas/placa-base/documentacion`; los 6 hashes de `THEORY` a los títulos de la doc; la URL de la cabecera de la memoria impresa (línea ~360) |
| `src/pages/herramientas/placa-base.astro` | Se mueve a `placa-base/index.astro`; los dos enlaces del encabezado pasan a apuntar uno a teoría y otro a la doc |
| `src/content/acero/placa-base-ejemplo-trabajado.mdx` | 1 enlace al post de teoría (línea 16) |
| `src/content/acero/ejemplo-conexion-apernada-corte.mdx`, `src/content/hormigon/ejemplo-anclajes-pedestal.mdx` | Apuntan a la herramienta, no al post: revisar que sigan siendo el destino correcto |
| `public/placas-base-sap2000/` | Renombrar a `public/placa-base/`; las 4 figuras se quedan todas en el post de teoría |

## Verificación

Por la regla de fuentes de `CLAUDE.md`, todo número que se toque se lee de la **página rasterizada**
del PDF, no de la capa de texto ni de una ficha. Lo que hay que abrir:

- **ACI 318-25 (SI)**: la definición de A_se,N; los términos de 17.8 que se citen.
- **AISC 360-22**: Tabla J3.2, §J8, §J3.3–J3.5.
- **Design Guide 1, 3.ª ed.**: Ap. B.2, §4.3.5, §4.3.7 con la Ec. 4-60, §4.3.11, §4.4.1, §6.1 y el
  paso 5 del Ejemplo B.2-2.
- **NCh2369:2025**: §8.5.4.

Después: `npm run verify:ecuaciones`, `npm run build`, y `/auditar` sobre el post de teoría y sobre
la página de documentación. Registrar en `ECUACIONES.md` lo que cambie de ubicación, con la fecha de
lectura en la columna «Revisada» solo para lo que efectivamente se abra en esta pasada.

## Lo que este trabajo no hace

- No toca `placas-base-empotrada-o-rotulada`, que ya está en el estilo buscado.
- No toca el motor `src/lib/` de la herramienta: ninguna verificación cambia de resultado. Es
  reorganización de contenido y de enlaces.
- No escribe el post de la **llave de corte** ni el del **Capítulo 6 sísmico** de la DG1, que siguen
  siendo los dos eslabones pendientes de la serie. El §8 los deja anotados como tales.
