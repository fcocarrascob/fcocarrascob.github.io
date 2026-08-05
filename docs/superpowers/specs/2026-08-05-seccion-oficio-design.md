# Sección «Oficio»: la línea de posts de práctica

Fecha: 2026-08-05

## El problema

El blog tiene 139 posts y un formato dominante muy pesado: experimento paramétrico + referencia
cerrada + mapa de error. Es su mayor fortaleza y también su límite — cada post exige que el lector
entre por la teoría. Falta una línea que se lea rápido y que hable de lo que un ingeniero decide,
estima y revisa todos los días.

Esa línea ya existía con un solo post: `capacidad-vs-resistencia` (sección `Fundamentos`), que es
puro criterio, sin experimento propio, y es el que mejor envejece del blog.

## Decisiones

- Tres ejes: **criterio y decisiones**, **números de bolsillo**, **revisar y detectar errores**.
- Formato **corto y frecuente** (800–1.500 palabras, una idea por post), con SVG solo cuando el
  esquema aporte.
- Público: **ingeniero con 2–5 años**. Ya sabe calcular, todavía no tiene criterio propio. Tono de
  par que cuenta lo que aprendió, no de profesor.
- Fuente del material: **destilar lo ya publicado** + **cálculo nuevo y corto** + **lectura crítica
  de norma**. Queda fuera la anécdota de oficina: no es verificable desde el repo.
- La sección `Fundamentos` **se renombra a `Oficio`** y aloja tanto el post existente como la línea
  nueva. No se crea una novena sección.

### Por qué renombrar y no abrir una sección

`Fundamentos` tenía un solo post y ya era esta voz. Abrir una novena sección dejaba dos etiquetas
para la misma cosa y una de ellas con un único habitante. El renombre cuesta una línea de
frontmatter: `section` en blog es texto libre, `contarTemas()` deriva los chips de lo publicado, y
no hay ruta por sección (`src/pages/blog/` tiene solo `index.astro` y `[slug].astro`), así que no
se rompe ninguna URL. Los `fundamentos` de `/geotecnia` son `subsection` de otra colección y no se
tocan.

## Los tres formatos recurrentes

| Formato | Promesa | Cierre obligado |
|---|---|---|
| **El número, la banda y dónde se rompe** | Una magnitud que se cita de memoria: valor típico, banda real medida y la frontera donde deja de valer | El enlace al post que mide cada cifra |
| **Qué dice de verdad esa cláusula** | Una disposición que se aplica en automático, leída en el PDF de la edición vigente | Qué cambia en la planilla de quien la heredó |
| **El error que no da alarma** | Un modelo que equilibra perfecto y está mal | Cómo se detecta en 10 minutos |

Regla del formato de bolsillo: **un número por post**. Una lista de cinco no se recuerda; una banda
con su frontera, sí.

## Backlog

Las marcadas **PDF** exigen abrir la norma vigente antes de escribir un solo valor (regla no
negociable de `CLAUDE.md`). Las demás destilan cifras ya publicadas y verificadas en este sitio: su
trabajo es la compresión y el enlace, no el recálculo.

### Estreno

1. **Cinco errores que no dan ninguna alarma** — *el error que no da alarma*. Tesis: el error
   moderno no rompe el análisis, lo completa mal, y el equilibrio siempre cierra. Los cinco casos,
   todos medidos acá: resortes lineales bajo la zapata que inventan tracción de −116 kPa con
   equilibrio exacto (`zapata-solo-compresion-sap2000`); Eigen que entrega corte basal **0 tonf**
   con 8 modos y ningún mensaje (`ritz-vs-eigen-masa-participativa-sap2000`); el factor de escala
   del caso RS, 386.089 = g en in/s² contra 9,80665 en metros
   (`respuesta-espectral-modal-torre-traspaso`); la rótula M3 en columnas, que sobre-predice 16 % e
   **invierte la secuencia de daño** —el resultado *parece* diseño por capacidad—
   (`rotulas-pushover-sap2000`); y `R = 1` en el espectro NCh2369, que divide por hasta 1,5 donde la
   norma no permite reducir. Sin SVG nuevo.
2. **Rígido y flexible no son adjetivos: son una razón** — *criterio*, **PDF**. Cuatro definiciones
   normativas distintas de la misma palabra y ningún valor absoluto: la zapata por $K_r$ con la
   frontera medida cerca de 0,5 (`lab-zapata-rigida-flexible`), la losa de fundación por la Ec. (25)
   de NCh2369 (`ejemplo-losa-rigida-o-flexible-nch2369`), el diafragma —que reparte el corte por
   rigidez relativa o por área tributaria según el adjetivo— y la conexión FR/PR de AISC 360-22
   §B3.4 por $K_s L/EI$. SVG: un eje adimensional con las cuatro fronteras superpuestas.
3. **Una sección puede ser esbelta y compacta a la vez** — *qué dice de verdad esa cláusula*,
   **PDF**. B4.1a (compresión) y B4.1b (flexión) son dos tablas con límites distintos: la misma alma
   es esbelta a compresión y compacta a flexión, así que clasificar una vez y arrastrar el veredicto
   a todos los capítulos es un error silencioso. Bonus del mismo capítulo: el $b = B - 3t$ de los
   HSS es texto de §B4.1b(d), no una nota al pie. Caso real desde
   `src/lib/acero/clasificacion.ts`. SVG: la misma sección con sus dos veredictos.

### Números de bolsillo

4. **¿Es creíble el período que te devolvió el modelo?** — $T_1$ no se valida contra $C_t H^{0,75}$:
   ese exponente no es de ninguna estructura, es el punto medio entre dos regímenes de diseño (0,44
   con rigidez constante, 0,88 con $c \propto 1/T$, medidos en 840 geometrías). Los controles que sí
   sirven: Rayleigh (≤ 0,06 % regular, ≤ 1,6 % irregular) y la banda de masa participativa del modo
   1, 73–85 %. Fuente: `periodos-fundamentales-exponente`, `estimador-t1`.
5. **θ = 0,10: cuándo P-Delta deja de ser un detalle** — la frontera del 5 % de error está en
   $\theta = 0{,}10$–$0{,}25$ según $\rho$ y $n$; $B_2$ aguanta hasta 0,30–0,50; y el eje que manda
   no es la carga total sino dónde baja la gravedad ($f_{lean}$), que es lo que corrige el $R_M$ de
   AISC. Fuente: `pdelta-cuando-confiar-amplificador`.
6. **e = L/6: el kern y la presión que la fórmula lineal no ve** — con $e \le L/6$ la lineal es
   exacta; pasado el kern subestima $q_{max}$ en −6 / −16 / −49 % para $e/L$ = 0,25 / 0,30 / 0,40.
   De bolsillo: $c = 3(L/2 - e)$, $q_{max} = 2N/(Bc)$. Fuente: `zapata-solo-compresion-sap2000`,
   `lab-zapata-sin-traccion`. *Riesgo*: es el que más se solapa con lo publicado — escribirlo solo
   si el enfoque queda en el número y no en el experimento.
7. **Cuántos modos son suficientes** — el 90 % de masa no se alcanza con *más* modos sino con los
   modos *correctos*: Eigen enterró el primer lateral en el modo 9 y pedía 18 para el 90 %; Ritz
   llegó al 90 % con 2 y al 100 % con 8. Fuente: `ritz-vs-eigen-masa-participativa-sap2000`.

### Lectura crítica de norma (todas **PDF**)

8. **El corte de losas se cayó a la mitad y nadie avisó** — cuatro cosas que cambiaron y que la
   práctica heredada de 318-08 sigue haciendo igual: $V_c$ de losas reducido a la mitad desde
   318-19; 318-25 eliminó la tabla del mínimo por grado de acero (7.6.1.1 y 24.4.3.2); el
   espaciamiento de flexión va por Tabla 24.3.2 y no por $3h$; y la Ec. (19.2.3.1) está impresa con
   errata en la edición SI. Fuente: `ejemplo-losa-unidireccional`.
9. **El espesor de tabla no es un mínimo: es el diseño** — en una losa unidireccional ninguna
   verificación de resistencia dimensiona nada; manda la deflexión, y no baja suave: entre
   $h = 190$ y 220 mm la $I_e$ salta de 28 % a 100 % de $I_g$ al cruzar $\tfrac{2}{3}M_{cr}$. Las
   dos rutas permitidas para $I_e$ (24.2.3.6 y 24.2.3.7) se reparten el veredicto en $h = 200$.
   Fuente: `ejemplo-losa-unidireccional`.
10. **El φ de anclajes que usa tu planilla ya no existe** — el $\phi = 0{,}70$ de la Tabla 17.5.3
    Condición B es de 318-19. La 318-25 consolidó los φ en la Tabla 21.2.1 y estrenó la Tabla
    17.5.4.1 con $\Psi_a = 0{,}95$. Fuente: `ejemplo-anclajes-pedestal`; engancha con la deuda
    abierta de `src/lib/placaBaseAnchorage.ts`.

### Criterio

11. **Los factores de uso no son comparables entre sí** — 0,95 en fluencia dúctil no es 0,95 en
    pandeo ni en rotura de bloque de corte. Tres casos medidos: la conexión al 0,74 con la columna
    al 1,43 (`ejemplo-conexion-momento-placas-ala`); la columna que sobra por separado (0,55 y 0,33)
    y queda al 0,94 combinada, con diez puntos puestos por un $B_1 = 1{,}34$ invisible al primer
    orden (`ejemplo-viga-columna`); y la cadena donde gobierna la plancha y no los pernos
    (`ejemplo-conexion-apernada-corte`). Hermano natural de `capacidad-vs-resistencia`.
12. **La revisión de 10 minutos antes de creerle a un modelo** — la checklist, con cada ítem
    enlazado al post que lo mide: $\sum R$ contra el peso propio a mano; $T_1$ contra su banda; masa
    participativa ≥ 90 % y de qué dirección; un corte a mano (con la trampa de Section Cut: *By
    Group* entrega la reacción y no el esfuerzo interno, y el momento sale respecto al centroide del
    grupo si no fijas la Result Location); el signo, que lo fija el orden de los cuatro puntos; y
    las unidades de $g$.

## Flujo de escritura

1. Idea del backlog → borrador, respetando su formato de los tres.
2. Números: si vienen de un post del sitio, se citan con enlace al post que los respalda y **no se
   recalculan**. Si son nuevos, se leen del PDF de la edición vigente rasterizando la página
   (`page.get_pixmap()`), nunca de la capa de texto ni de las fichas de `material_teorico`
   (`CLAUDE.md` §Fuentes normativas).
3. Español neutro, `tú`, sin voseo ni regionalismos (`CLAUDE.md` §Idioma).
4. SVG solo si el esquema hace un trabajo que el texto no puede, en `public/<slug>/`.
5. `/auditar <slug>` antes de publicar; los 🔴 y 🟠 se aplican, el resto se registra en `AUDIT.md`.
6. Estado de cada idea en `ROADMAP.md`, sección propia.

## Verificación

- `npm run build` verde.
- En `/blog`: aparece el chip **Oficio** con el conteo correcto, ya no existe **Fundamentos**, y
  `capacidad-vs-resistencia` queda agrupado bajo el título nuevo.
- Filtrar por el chip y confirmar que el contador (`data-count`) y las tarjetas responden.
- Revisar los warnings de KaTeX del build (subíndices sin tilde: `q_{max}`, no `q_{máx}`).
