# El galpón del altiplano — memoria de cálculo y bitácora de la serie

Este documento es **dos cosas a la vez**, a propósito:

1. **Una mini memoria de cálculo.** Cada dato que entra al modelo o a un post aparece acá con su
   procedencia: norma, edición, cláusula, página impresa, página del PDF, y la fecha en que se leyó
   la página rasterizada. Un número sin fila en esta tabla no puede aparecer en un post.
2. **El estado de la serie.** Qué post va en qué fase, qué está bloqueado por qué, y qué se decidió
   ya para no volver a discutirlo. La serie no cabe en una sesión: esto es lo que permite retomarla.

Sirve además como material del benchmark de `C:\Proyectos_Python\struct_llm`: muestra el orden real
en que se resuelve un proyecto —leer la norma, congelar parámetros, modelar, verificar, diseñar— y
deja registrado qué se leyó y qué se supuso, que es exactamente lo que un modelo de lenguaje tiende
a saltarse.

**Plan completo de la serie:** `C:\Users\francisco.carrasco\.claude\plans\quiero-que-analices-los-vivid-cocke.md`

---

## 1. Cómo se retoma esto en otra sesión

> **Estado al 2026-08-12, fin de sesión.** Fases 0, 1 y 2 **cerradas**: las normas están leídas, los
> parámetros congelados, y el modelo SAP2000 construido, corrido y verificado (combinaciones,
> envolvente y deriva incluidas).
>
> De la Fase 3 hay **cinco posts cerrados y auditados, los cinco con planilla**: el **0** publicado
> en `main` (hace de mapa y bitácora) y el **1**, el **3**, el **5** y el **10** en la rama
> `serie-galpon`. **Quedan siete: 2, 4, 5b, 6, 7, 8 y 9.**
>
> **Lo próximo, y hay dos frentes.** El grande es **rukan**, que sigue intacto y bloquea los posts 2,
> 4 y 6: hay que construir el caso 10 en OpenSeesPy contra el `.sdb` congelado, tomando
> `verification/case08_gable_loads.py` como molde. El barato es el **5b** (los siete defectos del
> `modelo_base`), que no depende de nada — **pero ojo: solo dos de sus siete defectos están
> documentados** (§5.12 y §5.21); los otros cinco hay que reconstruirlos, así que es más caro de lo
> que dice la etiqueta.
>
> **No hace falta abrir SAP2000** para los posts 7, 8 y 9: sus números ya están en este archivo. Sí
> les hace falta sprint de PDF —Caps. E, F y H de AISC 360-22—, y el **deslinde completo antes de
> fijar la tesis**. Esa regla ya no es una recomendación: se llevó cuatro de las cinco piezas del
> post 5 y **las dos tesis completas del post 10** (§5.44). El terreno de `acero/` está muy
> trabajado; da por hecho que lo que creías nuevo ya está publicado, y búscalo **antes** de calcular.
>
> **El post 7 sigue con un bloqueo propio**: cita NCh427/1, que no está en PDF en este equipo.
>
> **Decisión pendiente, y es del usuario**: la rama `serie-galpon` no está fusionada. El post 0 vive
> en `main` y los posts 1, 3 y 5 solo en la rama. Hay que decidir si se fusiona por tandas o al
> cerrar la serie entera.

### Dónde está cada cosa

**Los tres repos que participan** (los tres quedaron limpios y commiteados):

| Repo | Ruta | Qué guarda | Rama |
|---|---|---|---|
| `fcocarrascob.github.io` | `C:\Proyectos_Python\fcocarrascob.github.io` | los posts, este archivo, `AUDIT.md`, las figuras y las planillas | **`serie-galpon`** |
| `Skills_SAP` | `C:\Proyectos_Python\Skills_SAP` | los ocho scripts `galpon_altiplano_*`. **Lee `scripts/README.md` antes de correr ninguno**: hay orden obligatorio y tres scripts superados cuyas cabeceras traen números viejos | `main` |
| `struct_llm` | `C:\Proyectos_Python\struct_llm` | `docs/lecciones-sap2000-modelado-oapi.md` §12 — lo aprendido de la OAPI | `auditoria-alcance-clausulas` |
| `rukan` | `C:\Proyectos_Python\rukan` | el segundo motor (OpenSeesPy). **Sin tocar para esta serie.** Su venv es además el único Python con PyMuPDF | `main` |

**El modelo SAP2000 no está en ningún repo.** Vive en el temporal, y buscarlo por el disco cuesta
media sesión:

```
C:\Users\FRANCI~1.CAR\AppData\Local\Temp\sap2000_scripts\galpon_altiplano.sdb
```

La forma barata de encontrarlo es `connect_sap2000`, que devuelve `model_path`. La copia publicada y
descargable del sitio es `public/galpon-altiplano-la-serie/galpon-altiplano.sdb` — **ojo con el
nombre**, la copia lleva guion medio y el original guion bajo.

### Qué importa para cada tipo de tarea

| Si vas a… | Lee primero | Y trabajas en |
|---|---|---|
| escribir un post | §5 (el hallazgo del post), §7 (qué no puede rehacer) y el **deslinde**: lee **completos** los posts antecedentes, no sus títulos (§5.41) | `src/content/<colección>/<slug>.mdx` |
| hacer una figura | `scripts/render-galpon-sismico.mjs` como patrón vigente | `scripts/render-*.mjs` + `package.json` (`figuras:<nombre>`) |
| hacer una planilla | `docs/ESQUEMA-PLANILLA.md` entero, y la skill `planilla` | `public/planillas/<slug>.json` |
| auditar | la skill `auditar`; el auditor es read-only y **tú** aplicas los fixes | `AUDIT.md` |
| tocar el modelo | §6.2 (cómo se construyó) y `Skills_SAP/scripts/README.md` | el MCP de SAP2000 |
| citar una norma | §4.1. **Si el número no está ahí, no lo sabes**: hay que abrir el PDF rasterizado | — |

### Comandos que se corren siempre antes de cerrar

```bash
npm run build              # 192 páginas hoy; valida TypeScript y el schema Zod
npm run verify:planillas   # 32 planillas hoy
npm run figuras:<nombre>   # y después rasterizar y MIRAR el PNG
npm run render:esquema -- public/<slug>
```

### Dos trampas de PowerShell que ya costaron tiempo

- **Nunca** `Get-Content -Raw | Set-Content` para editar texto: rompe la codificación de los acentos
  y deja el archivo con mojibake. Se usa la herramienta de edición, no el shell.
- Los mensajes de commit van en here-string `@'…'@`, y **no pueden llevar comillas dobles**: el
  intérprete vuelve a tokenizar el argumento y git recibe cada palabra como si fuera una ruta.
  Tampoco `\` ni `*`, que disparan el hook de seguridad.

### Cómo se lee esto

1. Lee este archivo entero. Es corto a propósito.
2. Mira **§6 Estado de la serie** para saber en qué fase está y qué sigue.
3. Todo número que necesites ya leído está en **§4 Memoria de cálculo**. Si no está ahí, **no lo
   sabes**: hay que abrir el PDF. La regla no negociable de `CLAUDE.md` aplica igual.
4. Las decisiones ya tomadas están en **§3**. No se re-litigan sin que el usuario lo pida.
5. Los hallazgos que cambian el contenido de un post están en **§5**.

### Herramientas de lectura de PDF

PyMuPDF **no está** en el Python del sistema. Está en el venv de rukan:

```
C:\Proyectos_Python\rukan\.venv\Scripts\python.exe     # PyMuPDF 1.28.2
```

Usar `import pymupdf` (el alias `fitz` está deprecado y emite warning). Los dos scripts auxiliares
viven en el scratchpad de la sesión; si no existen, se reescriben en cinco líneas:

- `localizar.py <pdf> <regex> [n]` — busca en la **capa de texto** para *ubicar* la sección. La capa
  de texto **no sirve** para transcribir: destruye fracciones y convierte φ en `f`.
- `raster.py <pdf> <dir> <pag...> [--zoom 2.6]` — `get_pixmap()` a PNG. **Esta es la única vía
  válida** para leer una ecuación, una tabla o un coeficiente. Zoom 2,6 da ~1550×2190 px y se lee
  bien.

### Offsets de página (verificados, corrigen al wiki)

| Norma | Índice 0-based de PyMuPDF | Nota |
|---|---|---|
| **NCh2369:2025** | página impresa **+ 6** | verificado contra los pies de las impresas 13, 15, 18, 19, 57, 60, 61, 80, 87, 92, 93, 96, 97-99, 143-145, 220-221 |
| **NCh3171:2017** | página impresa **+ 3** | 18 páginas de PDF, 12 de cuerpo. **Escaneado: 0 caracteres de capa de texto**, `localizar.py` no sirve |
| **AISC 341-22** | — | la Tabla A3.2 (R_y, R_t) está en el índice 0-based **59**, página 9.1-6 |

El wiki de `material_teorico` cita «+7» para NCh2369 porque cuenta páginas 1-based; `raster.py` es
0-based. Anotarlo evita una cacería de off-by-one por sesión.

### Rutas reales de las normas

`CLAUDE.md` cita `F:\OneDrive\Ingenieria\Normas\…`, que **no existe en este equipo**. Las reales:

```
C:\Users\francisco.carrasco\OneDrive - PSC INGENIERÍA SpA\Escritorio\Documentos\Normas\
  NCh 2369 - 3°Edición 2025.05.28.pdf
  NCh 432 - 3°Edición 2025.06.27.pdf
  NCh3171-2017.pdf            <- escaneada, SIN capa de texto: localizar.py no sirve, todo rasterizado
  NCh 433 - 5°Edición 2026.03.26.pdf
  A360-22W-ewr.pdf · A341-22W-oke.pdf · ACI 318-25_SI.pdf
```

**NCh431 (nieve) y NCh1537 (sobrecargas) no existen en PDF** en este equipo. Ver §5.1: resultó no ser
un problema.

---

## 2. El caso

Galpón industrial a dos aguas para faena minera de altiplano (~3.800 m).

```
              cumbrera
                 /\              pendiente 10°
                /  \
               /    \            flecha f = 2,12 m
          ____/      \____
         |                |
         |                |      h alero = 8,0 m
         |                |
        ===              ===     bases articuladas
         |<--- 24,0 m --->|

  Largo: 4 vanos x 6,0 m = 24,0 m  (5 marcos)
  Area en planta: 24,0 x 24,0 = 576,0 m2
  Faldon: 12,0 / cos 10° = 12,185 m  ->  9 espacios de 1,354 m (costaneras)
```

- **Transversal**: marcos a momento, columna y dintel de **peralte variable**, bases articuladas.
- **Longitudinal**: arriostrado (crucería), más **arriostramiento continuo de techo** — que no es
  decoración: es lo que decide la fila de la Tabla 7 (ver §5.2).
- **Perfiles**: soldados definidos **por planchas**; A, I, J, Z de primeros principios. El tapered no
  está en ningún catálogo, así que no se depende del ICHA.

---

## 3. Decisiones congeladas

Tomadas con el usuario. No se re-litigan.

| Tema | Decisión |
|---|---|
| Geometría | luz 24,0 m · pendiente 10° · alero 8,0 m · 5 marcos @ 6,0 m |
| Bases | **articuladas** (práctica chilena; es lo que hace fallar la deriva de §6.3) |
| Sitio | faena minera de altiplano ~3.800 m, **comuna de Pica, Región de Tarapacá** · **zona sísmica 2**, A_r = 0,42 g (Tabla 2 de NCh2369) · **zona de viento I-B**, V = 30 m/s (Tabla 1 de NCh432) · suelo **B** (sensibilidad a C). Verificado en §5.27 |
| Perfiles | soldados por planchas, **peralte variable** en columna y dintel |
| Nieve | **S = 1,20 kPa** sobre proyección horizontal, desde estudio de sitio |
| Extensión | **10 posts** + 1 subproducto |
| Alcance | análisis + verificación de miembros. **Sin conexiones, sin fundaciones** |
| Ubicación de posts | espejo de la serie de la torre: `apuntes/` + `blog/` (Rukan 8-10) + `acero/` |
| Skills_SAP | **no se toca**; sus defectos se documentan en el subproducto |
| Pedagogía | predimensionar «a ojo de obra» y dejar que falle; cada post cierra con la iteración |
| Modelo SAP2000 | se construye **a cuatro manos**, en 6 pasos con confirmación del usuario (§6.2) |
| **Ruta del R** | **las dos**: la de diseño es **§12.2 galpón liviano, R = 4, amplificador 0,5R₁ = 2,00** (que es lo que la norma obliga, §5.8); la fila 5.5 con R = 5 y 0,7R₁ = 3,50 se corre como **comparación ilustrativa** sobre el mismo modelo. El post 5 debe dejar explícito cuál es la obligatoria y cuál la ilustrativa |
| **Techo** | **crucería de techo explícita**. El panel como diafragma de §12.2.3 queda como `Note` de contraste (exige ANSI/SDI SD, que no tenemos, y rukan no tiene shell) |
| **Topografía** | **cima 2D, H = 40 m, L_h = 120 m, galpón en la cresta (x = 0), exposición C.** H/L_h = 0,333: cumple las tres condiciones de §5.6.1 y queda bajo el tope de 0,5 de §5.6.2. Da **K_zt = 1,95** (§5.24) |
| **Material de peralte variable** | **repartido, sin post propio.** La convergencia y el prismático-no-conservador (§5.33, §5.34) van al post 2; §8.6.4 y el punto de cruce van al post 4; la verificación por estación va al post 7. **No se abre un post 4bis** |
| **Costanera** | **canal C simple, verificado con AISC 360-22** — sin AISI S100, que no está en PDF. Ruta confirmada rasterizada: **§F2** eje mayor, **§F6** eje menor, **Ec. H1-1b con `P_r = 0`** para la biaxial (§5.39). Se define **por planchas**, como todo el resto, y **el ala debe salir compacta** o la ruta cae a §F12 |

---

## 4. Memoria de cálculo

### 4.1 Datos leídos de norma

Todos leídos en **página rasterizada**. `pág.` = página impresa de la norma; `PDF` = índice 0-based
de `raster.py`.

#### NCh 2369:2025 (3.ª ed., 2025.05.28)

| Cláusula / Tabla | pág. | PDF | Leída | Contenido verificado | Alimenta |
|---|---|---|---|---|---|
| **§4.3.1 y §4.3.2** Clasificación e importancia | 13 | 19 | 2026-08-12 | **4.3.1** las estructuras y equipos se clasifican en Categorías de ocupación y operación según Tabla 1. **4.3.2** «A cada Categoría definida en Tabla 1 le corresponde un coeficiente de importancia I, cuyo valor es el siguiente: Categoría I: **I = 0,80** · Categoría II: **I = 1,00** · Categoría III: **I = 1,20** · Categoría IV: **I = 1,20**». Ojo: **III y IV comparten I = 1,20**. **C4.3.1**: la Tabla 1 es una adaptación al ámbito industrial de las clasificaciones de NCh3171. **C4.3.2**: «La mayor parte de un proyecto puede ser clasificado como Categoría de ocupación II». | **I = 1,00** |
| **Tabla 1** — Clasificación de instalaciones | 18 | 24 | 2026-08-12 | **I** menores o provisionales (incl. provisionales de mantención/montaje < 60 días) · **II** «estructuras y equipos **normales**, que pueden tener fallas menores susceptibles de reparación rápida que no causan detenciones prolongadas ni pérdidas importantes de producción y que no ponen en peligro otras estructuras de categorías superiores» · **III** críticos o esenciales cuya falla causa detenciones prolongadas y pérdidas significativas; servicios públicos; salas de control, eléctricas y telecomunicaciones · **IV** esenciales que deben mantener operación durante el sismo; peligrosos con riesgo de incendio, explosión o emisiones tóxicas; vitales; protección y evacuación de personal; alta inversión y difícil reemplazo. **NOTA 1**: «Una instalación **no puede tener una clasificación inferior a la del equipo o proceso más crítico que aloje o soporte**, a menos que el diseño demuestre que los daños o detenciones de ella no afectan dicho equipo o proceso.» **NOTA 2**: la clasificación se hace extensiva a las instalaciones de control, enfriamiento y energía que competan a su operación. | Categoría **II**; **Hallazgo 5.14** |
| **§4.5.1** Combinaciones de cargas | 15 | 21 | 2026-08-12 | Las que no incorporan sismo se definen según NCh3171. Con sismo, **a lo menos** estas cuatro, complementadas con las aplicables al proyecto: **ASD** `D + 0,75aL + 0,75SO + 0,75SA + 0,70E` y `D + 0,75SA + 0,70E`; **LRFD** `1,2D + aL + SO + SA + E` y `0,9D + SA + E`. Definiciones: `D` carga permanente · `L` carga de uso · `a` factor de reducción de la sobrecarga de uso según la probabilidad de ocurrencia de su valor nominal junto con el sismo de diseño · `SO` carga de operación esperada concurrente con el sismo · `SA` carga accidental esperada producida por la ocurrencia del sismo · `E` carga sísmica direccionalmente combinada. **No aparecen W ni S en ninguna.** | Post 3, todos los combos |
| **§4.5.1**, párrafo de cierre | 15 | 21 | 2026-08-12 | «En el caso de proyectos ubicados en **alta montaña** o sitios en los cuales las características ambientales difieran considerablemente de los supuestos básicos considerados en las normas de cargas que correspondan, o en casos en que dichas normas así lo indiquen, es necesario contar con **estudios específicos que definan el nivel adecuado de las cargas de interés (por ejemplo nieve o viento)** para el diseño estructural y **especialmente la forma en que dichos efectos se deben combinar con el evento sísmico** definido en esta norma.» | **Hallazgo 5.1** — es la base normativa de S declarada |
| **Tabla C-2** (comentario a §4.5.1) | 15 | 21 | 2026-08-12 | Valores tradicionales de `a`: bodegas / salas de archivo y similares **0,50** · zonas de acopio con baja tasa de rotación **0,50** · zonas de uso normal y plataformas de operación **0,25** · **pasarelas de mantención y techos 0**. Está en la columna de COMENTARIOS: es guía, no disposición. | `a = 0` para el techo → L_r fuera de la combinación sísmica |
| **§5.1.1** Dirección de la solicitación sísmica | 19 | 25 | 2026-08-12 | Mínimo dos direcciones horizontales aproximadamente perpendiculares, elegidas para detectar los efectos más desfavorables. «El efecto de las aceleraciones sísmicas verticales se debe considerar **en todos los casos**» y combinarse con las horizontales según §4.5; las demandas verticales se determinan según §5.7. | Estado `EV` obligatorio |
| **§5.1.2** Masa sísmica | 19 | 25 | 2026-08-12 | Incluye las cargas permanentes del sistema y **una fracción de las sobrecargas, de acuerdo con el valor esperado o su probabilidad de ocurrencia simultánea con el sismo de diseño**. Sin estimación específica, la fracción no puede ser menor a: bodegas y salas de archivo **50 %**; zonas de acopio con baja tasa de rotación **50 %**; zonas de uso normal y plataformas de operación **25 %**. Para la masa de las fundaciones, remite a la cláusula 10. **No menciona nieve ni remite a NCh1537.** | Paso 2.5 del modelo; **Hallazgo 5.3** |
| **Tabla 3** — A₀ y A_r | 57 | 63 | 2026-08-12 | `A_r = 1,4·A₀`. Zona 1: A₀ = 0,20 g, A_r = **0,28 g** · Zona 2: 0,30 g, **0,42 g** · Zona 3: 0,40 g, **0,56 g**. NOTA: A₀ desde un registro puede determinarse como A₀ = S_a/2,5, con S_a la aceleración media del espectro elástico de seudo aceleración para ξ = 5 % entre 0,1 s y 0,5 s. | **A_r = 0,42 g** (zona 2) |
| **Tabla 4** — tipos de suelo | 57 | 63 | 2026-08-12 | A roca / suelo cementado, V_s30 ≥ 900, T_g < 0,15 · **B roca blanda o fracturada, suelo muy denso o muy firme, V_s30 ≥ 500, T_g < 0,30 (o H/V plano)** · C suelo denso o firme, ≥ 350, < 0,40 · D medianamente denso o firme, ≥ 180, < 1,00 · E compacidad o consistencia mediana, < 180 · F sitios singulares. Nota a): la clasificación aplica a topografía y estratificación aproximadamente horizontal **y a estructuras lejos de singularidades geomorfológicas y topográficas**; si el sitio admite dos o más tipos se toma el más desfavorable; si no se cumple el T_g, la clasificación baja un grado pero el corte basal de diseño es el mayor entre la reducida y la primaria por V_s30. | Suelo **B**; **Hallazgo 5.4** |
| **Tabla 6** — parámetros por suelo | 60 | 66 | 2026-08-12 | A: S 0,90 · r 4,50 · T₀ 0,15 · p 1,85 · q 3,00 · T₁ 0,15 — B: **1,00 · 4,50 · 0,30 · 1,60 · 3,00 · 0,27** — C: 1,05 · 4,50 · 0,40 · 1,50 · 3,00 · 0,35 — D: 1,00 · 3,50 · 0,60 · 1,00 · 2,50 · 0,41 — E: 1,00 · 3,00 · 1,20 · 1,00 · 2,70 · 0,79. NOTA: para estructuras con período fundamental ≥ 4 s se recomienda espectro de sitio según §5.4.3 y análisis según §5.10. | Espectro; **Hallazgo 5.5** |
| **§12.1.1 a §12.1.6** Galpones industriales | 143-144 | 149-150 | 2026-08-12 | **12.1.1** aplica a edificios industriales con o sin vigas portagrúas. **12.1.2** «Los edificios con marcos transversales **deben tener un sistema de arriostramiento continuo en el techo**. Cuando hay cerchas de techo el arriostramiento continuo se debe colocar en el plano de la cuerda inferior. **Se exceptúan los edificios sin puente-grúa en que las cargas permanentes sólo provienen del peso propio.**» **12.1.3** con puente-grúa, el análisis considera las magnitudes y alturas de carga suspendida más probables. **12.1.4** varias grúas → combinación con todas sin carga en la posición más desfavorable. **12.1.5** dispositivos contra caída de puentes grúa si hay levantamiento. **12.1.6** edificio flexible con muros rígidos no estructurales → uniones que soporten lateralmente el muro y permitan desplazamiento longitudinal independiente. **C12.1.2**: «El arriostramiento continuo de techo tiene las ventajas sísmicas de los diafragmas rígidos horizontales. Hace posible, además, distribuir cargas laterales concentradas, como las de grúas, entre varios marcos.» | **Hallazgo 5.7**; conecta con post 4 |
| **§12.2** Galpones livianos de acero | 144-145 | 150-151 | 2026-08-12 | «La demanda sísmica para galpones livianos **se debe** evaluar utilizando los parámetros indicados en Tabla 7, punto 5.7.» **12.2.1**, ocho condiciones: **a)** Categoría I o II según §4.3.1 · **b)** una o varias naves paralelas · **c)** altura libre interior de columnas laterales ≤ **23 m** y luz entre ejes de columnas sismorresistentes adyacentes ≤ **75 m** (nave individual) o **45 m** (naves paralelas) · **d)** peso propio de la **estructura soportante del techo** (sólo vigas, costaneras, colgadores, puntales, arriostramientos y conexiones) ≤ **70 kg/m²** · **e)** puentes grúa ≤ 100 kN sin cabina, o 50 kN con cabina · **f)** sin estanterías de almacenamiento vinculadas sísmicamente · **g)** equipos soportados por la estructura ≤ **50 kN por marco** · **h)** altillos vinculados a columnas ≤ **15 kN de carga sísmica horizontal por columna**. **12.2.2** el diseño cumple la cláusula 8 **reemplazando el amplificador 0,7R₁ por 0,5R₁**. **12.2.3** sin puente grúa ni otros equipos, se puede usar el **panel de techo como diafragma** (estándares ANSI/SDI SD), con la resistencia requerida de los paneles según §4.5 amplificada por 0,5R₁. **C12.2.1**: galpones «de luz y altura limitadas y grúas o equipos de poco peso, **en los cuales los esfuerzos de viento son normalmente superiores a los sísmicos**». | **Hallazgo 5.8** — decide el R de la serie |
| **§8.3.2 y §8.3.3** Estabilidad y resistencia esperada | 80 | 86 | 2026-08-12 | **8.3.2** «**No se permite ningún tipo de reducción de rigidez en los elementos estructurales, producto de la aplicación de algún método de diseño por estabilidad indicado en NCh427/1, al momento de evaluar los efectos sísmicos mediante las metodologías elásticas expuestas en esta norma**». **C8.3.2**: el Método de Análisis Directo reduce rigidez e incorpora P∆-Pδ; es adecuado para viento «cuya magnitud y sentido son fundamentalmente independientes de la respuesta dinámica», pero la solicitación sísmica depende fuertemente de ella, así que reducir rigidez «puede conducir a una subestimación de la demanda. Luego, **no se permite el uso del Análisis Directo en el contexto del diseño estructural sismorresistente nacional**». Además: no es adecuado diseñar a compresión con K = 1,0; «tal como lo establece NCh427, **debe realizarse un análisis de pandeo para definir el valor de K de cada elemento**» (K depende también de la distribución de cargas), o usar métodos conservadores reconocidos como los **nomogramas de Kavanagh (1962)**. El análisis aproximado de segundo orden de **NCh427/1:2016, Anexo 8** es aceptable. **8.3.3** para R_y y R_t se usan los valores del material correspondiente; para materiales certificados ASTM «se pueden usar los valores definidos en **ANSI/AISC 341-16, Tabla A3.1**»; se admiten otros valores justificados por ensayos de control de calidad y certificación del fabricante. **C8.3.3**: «De acuerdo a estudios sobre placas de acero calidad ASTM A36 (U. de Chile) […] el valor de **R_y es cercano a 1,3**, lo que es consistente con lo indicado por ANSI/AISC 341-16.» Arriba en la misma página, **método ASD**: las capacidades esperadas del LRFD **divididas por 1,5**. | **Hallazgos 5.16 y 5.17**; post 7 |
| **§8.6.1 a §8.6.4** Marcos arriostrados concéntricamente (MAC) | 87 | 93 | 2026-08-12 | **8.6.1** «No se permiten sistemas de arriostramiento con elementos que **solo resisten tracción**, **excepto en los casos de galpones livianos de acero que se rigen por las disposiciones de 12.2**.» **8.6.2** «En una línea resistente cualquiera, para cada nivel, la resistencia proporcionada por las diagonales traccionadas, para cada sentido de la acción sísmica, debe ser como mínimo un **30 % del esfuerzo de corte total en esa línea**.» **8.6.3** las diagonales sismorresistentes de planos verticales **que trabajen en compresión** deben tener razones ancho/espesor menores que λ_md de Tabla 9, y **esbeltez global menor que 1,5π√(E/F_y)**; se exceptúan aquellas cuya resistencia requerida se determine con §4.5 amplificando el sismo horizontal por **0,7R₁ ≥ 1,0**. **8.6.4** «Las diagonales en X **se deben conectar en el punto de cruce**. Dicho punto **se puede considerar fijo en la dirección perpendicular al plano** de las diagonales para los efectos de determinar la longitud de pandeo de la diagonal comprimida cuando la otra esté traccionada y una de las diagonales sea continua en el cruce.» **C8.6.1**: el objetivo de la prohibición es generar redundancia. **C8.6.3** (releída rasterizada el 2026-08-12, 2.ª sesión): «Las configuraciones arriostradas nacionales se diseñan para proveer un nivel de ductilidad moderado. Se espera que ante eventos sísmicos leves no se presenten incursiones inelásticas. No obstante, ante eventos sísmicos del nivel de diseño **es probable que las diagonales en compresión pandeen**. Con el fin de que **los ciclos de pandeo de las diagonales no generen fatiga de bajo ciclaje**, se establece que estas no pueden presentar pandeo local previo a una incursión inelástica moderada.» **C8.6.4**: la longitud de pandeo fuera del plano depende de la razón de fuerzas axiales y de la conexión de las diagonales discontinuas en el cruce. **Ojo con la asimetría de la exención**: §8.6.3 exime **solo** por `0,7R₁`; §8.8.4 agrega «o con la máxima carga que el sistema puede transferir al elemento» (§5.44). | **Hallazgos 5.10 y 5.11**; post 10 |
| **Anexo B (normativo)** B.1 Objetivo y generalidades | 220-221 | 226-227 | 2026-08-12 | Existe porque «NCh3171 no cuenta con combinaciones de cargas especialmente desarrolladas para casos industriales. Esto conduce a que en ocasiones las combinaciones indicadas en NCh3171, para casos generales, **generen inconsistencias**». Entrega lineamientos, no una lista cerrada. ASD sigue aceptable pero LRFD es superior en racionalidad probabilística. **Factor de equivalencia entre métodos, a nivel de resistencia, para diseño por capacidad: 1,5.** Las **tres reglas históricas**: (1) en cada combinación deben estar las cargas permanentes; (2) debe existir **al menos una acción crítica en su nivel de diseño (carga primaria)**, y las restantes (**acompañantes**) pueden adoptar su **valor más probable**; (3) sin información confiable y específica, criterios conservadores. **Definiciones probabilísticas**: el valor de diseño nominal de **nieve** y de **viento** es el de **2 % de probabilidad de excedencia anual**; el evento sísmico de diseño nominal es el de **10 % en 50 años**. «El **valor más probable** corresponde […] al **valor medio de la distribución** asociada a la carga.» Criterios conservadores **no** significan todas las acciones en su máximo simultáneo: «no es requerida la evaluación de escenarios de diseño que presenten conflictos con las leyes de la física». Remite a **ASCE/SEI 7-16 Caps. 1 y 2, y comentarios 2.3.5 y C2.3.5** para factores de acciones no tradicionales. Reconoce que servicio (deformaciones, vibraciones, fatiga) y estabilidad de fundaciones se verifican con **combinaciones de servicio**, en general equivalentes a ASD. | **Hallazgos 5.12 y 5.13**; post 3 |
| **§8.7.1 a §8.7.6** Marcos resistentes a momento (MRM) | 92-93 | 98-99 | 2026-08-12 | **8.7.1** las uniones de momento «deben ser del tipo **totalmente rígidas (TR)**. **No se permite usar conexiones del tipo parcialmente rígidas (PR)**». **8.7.2** «**No se permiten discontinuidades geométricas abruptas** en las potenciales zonas de formación de rótulas plásticas en la viga». **8.7.3** «Las secciones transversales de **vigas** de marcos resistentes a momento sismorresistentes deben contar con razones ancho/espesor, menores que el valor λ_md establecido en Tabla 9. Se pueden **exceptuar** aquellos elementos en que la resistencia requerida **para todos los esfuerzos** sea determinada utilizando las combinaciones de 4.5 […] amplificado por **0,7R₁ ≥ 1,0**». **8.7.4** «En estructuras de **varios niveles**, se **recomienda** que la suma de las capacidades flexurales esperadas reducidas por carga axial de las columnas que concurren a un nudo sea mayor o igual a **1,2 veces** la suma de las capacidades flexurales esperadas de las vigas conectadas en dicho nudo». **8.7.5** conexiones de momento, atiesadores de continuidad y zona panel se diseñan para la **capacidad esperada en flexión de la viga y el corte asociado**; tope en §4.5 con 0,7R₁ ≥ 1,0 o la máxima solicitación transferible. **8.7.6** las zonas panel «se deben encontrar limitadas por **atiesadores de continuidad**»; el ancho atiesado de la columna ≥ ancho del ala de la viga más ancha o de la placa que entrega la carga; el espesor del atiesador ≥ el mayor espesor entre las alas de vigas que llegan al nudo o de la placa. **C8.7.1**: AISC 358-10 trae 7 conexiones precalificadas; la práctica nacional relaja algunos requisitos, y el **«choco»** (conector soldado en taller + empalme flexural apernado), aunque no reconocido por 358-10, «puede utilizarse en la medida que cumpla con los requisitos de la presente norma». **C8.7.2**: la reducción de sección (RBS) de AISC 358-10 **no** se considera discontinuidad abrupta. **C8.7.3**: el objetivo es evitar fatiga de bajo ciclaje. **C8.7.4**: «**La exigencia a nivel de requisito mandatorio del concepto tradicional de columna fuerte y viga débil se ha eliminado en esta versión de la norma**», porque toda columna ya debe resistir el sismo amplificado por 0,7R₁. **C8.7.5**: `V_e = 2·M_pe/L_h` con L_h la distancia entre potenciales rótulas; LRFD `φV_n ≥ V_e + V_ug`, ASD `V_n/Ω ≥ V_e/1,5 + V_ag`. **C8.7.6**: los atiesadores se diseñan por J10.8 de NCh427/1:2016. | **Hallazgos 5.18 y 5.19**; posts 7 y 8 |
| **§8.8.4 y §8.8.5** Arriostramiento de piso o de cubierta | 96 | 102 | 2026-08-12 | **8.8.4** «Las diagonales y puntales de sistemas de arriostramiento de piso o de cubierta deben tener razones ancho/espesor, menores que el valor λ_md establecido en Tabla 9. **La esbeltez global de estos elementos debe ser menor que 1,5π√(E/F_y)**.» Se pueden **exceptuar** los elementos cuya resistencia requerida se determine con las combinaciones de §4.5 en las que el estado sísmico horizontal se amplificó por **0,7R₁ ≥ 1,0**, o con la máxima carga que el sistema puede transferir al elemento. **8.8.5** las conexiones de esas diagonales y puntales se diseñan para la **capacidad esperada en tracción y en compresión**; la resistencia requerida no necesita superar la de §4.5 con el sismo amplificado por 0,7R₁ ≥ 1,0, ni la máxima carga transferible. **C8.8.4** (releída rasterizada el 2026-08-12, 2.ª sesión, pág. impresa 96 / PDF 102): «Por lo general, los sistemas de arriostramiento horizontal para plataformas de piso son **altamente redundantes, siendo muchas veces sus elementos dimensionados por requisitos mínimos** (espaciamiento mínimo de pernos, espesores mínimos, entre otros). Consistentemente, es común que los elementos presenten resistencias de diseño superiores a las cargas amplificadas, por tanto, **no es necesario cumplir con los requisitos de esbeltez local indicados en Tabla 9**. Sin embargo, cuando no se dan las condiciones anteriores, es probable que las diagonales en compresión pandeen durante un evento del nivel de diseño. Con el objetivo de que los ciclos de pandeo de las diagonales no generen fatiga de bajo ciclaje, se establece que estas no pueden presentar pandeo local previo a una incursión inelástica moderada.» Es el comentario que explica **por qué §8.8.4 tiene la puerta de la máxima carga transferible y §8.6.3 no** (§5.44). | **Hallazgo 5.9**; post 10 |
| **Tabla 9** — Límites de la relación ancho/espesor | 97-99 | 103-105 | 2026-08-12 | Todos los límites se escriben con **R_y·F_y**, no con F_y. **Elementos no atiesados** (pág. 97): alas de perfiles soldados o laminados I, H, y alas de soldados/laminados/plegados en frío C, T y L → λ = b/t, **λ_md = 0,40√(E/(R_y F_y))**; almas de perfiles soldados o laminados tipo T → λ = d/t, mismo 0,40√(...). **Elementos atiesados, usados como arriostramientos** (pág. 98): paredes de rectangulares conformados en frío (HSS) o plegados en frío, alas de rectangulares soldados o laminados I/H, planchas laterales de rectangulares I/H, y paredes de rectangulares soldados → **λ_md = 0,76√(E/(R_y F_y))**; almas de I, H o C soldados, laminados o plegados en frío → **λ_md = 1,57√(E/(R_y F_y))**. **Perfiles usados como vigas sometidos a flexo-compresión** (pág. 99): alas en compresión uniforme (rectangulares soldados, HSS, plegados en frío; y alas de rectangulares soldados o laminados I/H) → b/t, **λ_md = 1,18√(E/(R_y F_y))**; almas de perfiles soldados, laminados o plegados en frío I, H o C, planchas laterales de rectangulares I/H, y almas de rectangulares soldados/HSS/plegados → h/t, con **dos ramas**: para **C_a ≤ 0,114**, `3,96√(E/(R_y F_y))·(1 − 3,04·C_a)`; para **C_a > 0,114**, `1,29√(E/(R_y F_y))·(2,12 − C_a) ≥ 1,57√(E/(R_y F_y))`. En que `C_a = P_u/(φ_c·P_y)` (LRFD), `C_a = Ω_c·P_a/P_y` (ASD) y **`P_y = R_y·F_y·A_g`**. | **Hallazgo 5.15**; posts 7, 8 y 10 |
| **Tabla 7** — R y ξ (filas de acero) | 60-61 | 66-67 | 2026-08-12 | 1. elásticas R 1, ξ 0,03 · 2. otras no incluidas o asimilables R 1,5, ξ 0,02 · 3. péndulo invertido R 2, ξ 0,03 · 4. sísmicas isostáticas R 2, ξ 0,03 · **5.1** marcos a momento **con** anclajes dúctiles R **5** · **5.2** marcos a momento **sin** anclajes dúctiles R **3** · **5.3** marcos arriostrados **con** anclajes dúctiles R **5** · **5.4** marcos arriostrados **sin** anclajes dúctiles R **3** · **5.5** edificios industriales de un piso, **con o sin puente grúa, con arriostramiento continuo de techo**, y con anclajes dúctiles R **5** · **5.6** edificios industriales de un piso, **sin puente grúa, sin arriostramiento continuo de techo**, y con anclajes dúctiles R **3** · **5.7** galpones livianos de acero R **4**. Todas las filas de acero: **ξ = 0,02 uniones soldadas / 0,03 uniones empernadas**. | Fila **5.5**, R = 5, ξ = 0,02; **Hallazgos 5.2 y 5.6** |

#### ANSI/AISC 341-22

| Cláusula / Tabla | pág. | PDF | Leída | Contenido verificado | Alimenta |
|---|---|---|---|---|---|
| **Tabla A3.2** — R_y y R_t | 9.1-6 | 59 | 2026-08-12 | *R_y and R_t Values for Steel and Steel Reinforcement Materials*. **Hot-Rolled Structural Shapes and Bars**: A36 → **R_y = 1,5**, R_t = 1,2 · A529 Gr.50 → 1,2/1,2 · A572 Gr.50 o 55 → 1,1/1,1 · A992 → 1,1/1,1 · A1043 Gr.36 → 1,3/1,1. **Hollow Structural Sections (HSS)**: A53 → 1,6/1,2 · **A500 Gr. B → 1,4/1,3** · A500 Gr. C → 1,3/1,2 · A501 → 1,4/1,3 · A1085 Gr. A → 1,25/1,15. **Plates, Strips, and Sheets**: **A36 → R_y = 1,3**, R_t = 1,2 · A572 Gr.42 → 1,3/1,0 · A572 Gr.50 o 55 → 1,1/1,2 · A1043 Gr.36 → 1,3/1,1. **Steel Reinforcement**: A615 Gr.60 → 1,2/1,2 · A706 Gr.60 y 80 → 1,2/1,2. | Cierra **§5.17**; confirma **R_y = 1,3** |

#### NCh 3171:2017 (2.ª ed., 2017.05.23)

PDF **escaneado, sin capa de texto** (0 caracteres en las 18 páginas): `localizar.py` no sirve, todo va
rasterizado. **Offset: índice 0-based de `raster.py` = página impresa + 3.** El cuerpo son 12 páginas.

| Cláusula | pág. | PDF | Leída | Contenido verificado | Alimenta |
|---|---|---|---|---|---|
| **§9** Combinaciones de carga (encabezado) | 9 | 12 | 2026-08-12 | Las combinaciones de 9.1 y 9.2 se usan «cuando las normas de diseño correspondientes a los distintos materiales así lo indiquen». **«Cuando las normas de diseño sísmico consideren otras combinaciones para casos particulares de cargas, éstas prevalecen.»** Se usan las que produzcan el efecto más desfavorable, y «en algunos casos esto puede ocurrir cuando una o más cargas en la combinación **no están presentes**». **NOTA**: son las combinaciones **mínimas**; el diseñador debe incorporar las más desfavorables para cada situación. | **Hallazgo 5.20** |
| **§9.1.1** Combinaciones básicas LRFD | 9 | 12 | 2026-08-12 | **(1)** `1,4D` · **(2)** `1,2D + 1,6L + 0,5(L_r o S o R)` · **(3a)** `1,2D + 1,6(L_r o S o R) + L` · **(3b)** `1,2D + 1,6(L_r o S o R) + 0,8W` · **(4)** `1,2D + 1,6W + L + 0,5(L_r o S o R)` · **(5)** `1,2D + 1,4E + L + 0,2S` · **(6)** `0,9D + 1,6W` · **(7)** `0,9D + 1,4E`. **L_r, S y R son alternativas** («o»), no aditivas. **E lleva factor 1,4.** La (5) **sí trae nieve, con 0,2S**. | Post 3 |
| **§9.1.1** excepciones a) a f) y reglas de cierre | 9-10 | 12-13 | 2026-08-12 | **a)** el factor de L en (3a), (4) y (5) puede ser **0,5** para destinos con L₀ de NCh1537 ≤ 5 kN/m², salvo estacionamientos y lugares de asamblea pública. **b)** F y T se incluyen con el mismo factor de D en (1), (2), (3a), (3b), (4), (5) y **(7)** — la **(6) queda fuera de la lista**. **c)** H: **1,6** si suma a la carga primaria; **0,9** si la contrarresta y es permanente y justificable; **0** en toda otra condición. **d)** en (2), (3a), (3b), (4) y (5) la S concurrente se toma como nieve de techo plano (p_f) o de techo inclinado (p_s). **e)** si W no fue reducida por factor de direccionalidad se permite **1,3W** en vez de 1,6W en (4) y (6). **f)** «En el caso de la combinación (ii) del método de diseño por cargas últimas de **NCh2369:2003, 4.5**, el factor "b" de amplificación de la carga sísmica para el diseño de estructuras de acero se debe considerar igual a **1,4**». **Reglas de cierre**: se investiga cada estado límite de resistencia y los efectos de una o más cargas no actuantes; el sismo y el viento se investigan **por separado** y «no es necesario considerar que actúan simultáneamente»; la definición específica de E la da la norma de diseño que corresponda. Y: **«En zonas donde la presencia de viento y nieve no es eventual, por ejemplo, zonas montañosas o ubicadas en las regiones XI o XII, se deben estudiar combinaciones especiales que reemplacen las combinaciones (3b), (4) y (5), anteriormente indicadas, pero que no sean menores que las originales.»** | **Hallazgos 5.21 y 5.22** |
| **§9.1.2** y **§9.1.3** inundación y hielo | 10 | 13 | 2026-08-12 | **9.1.2** en zonas susceptibles de inundación el término `1,6W` de (4) y (6) se reemplaza por `1,6W + 2,0F_a`; en zonas no susceptibles, por `0,8W + 1,0F_a`. **9.1.3** hielo atmosférico: `0,5(L_r o S o R)` de (2) → `0,2D_i + 0,5S`; `1,6W + 0,5(L_r o S o R)` de (4) → `D_i + W_i + 0,5S`; `1,6W` de (6) → `D_i + W_i`. | Fuera de alcance, declarado |
| **§9.2.1** Combinaciones básicas ASD | 11 | 14 | 2026-08-12 | **(1)** `D` · **(2)** `D + L` · **(3)** `D + (L_r o S o R)` · **(4)** `D + 0,75L + 0,75(L_r o S o R)` · **(5a)** `D + W` · **(5b)** `D + E` · **(6a)** `D + 0,75W + 0,75L + 0,75(L_r o S o R)` · **(6b)** `D + 0,75E + 0,75L + 0,75S` · **(7)** `0,6D + W` · **(8)** `0,6D + E`. Excepciones: **a)** F y T con el mismo factor de D en todas **excepto la (7)**. **b)** H: **1,0** si suma; **0,6** si contrarresta y es permanente y justificable; **0** en toda otra condición. **c)** en (3), (4), (6a) y (6b) la S concurrente se toma como p_f o p_s. **d)** las combinaciones **(7) y (8) se pueden omitir en el cálculo de estabilidad de las fundaciones y tensiones del suelo**. Cierre: viento y terremoto no necesitan considerarse simultáneos; la definición de E la da la norma de diseño correspondiente. | Post 3, servicio |

| **§9.2.1** reglas de cierre · **§9.2.2** · **§9.2.3** · **§9.3** | 12 | 15 | 2026-08-12 | **Cierre de 9.2.1**: «**No deben ser utilizados incrementos en las tensiones admisibles** con las combinaciones de cargas dadas en esta norma a menos que pueda ser demostrado que tal aumento es justificado por el comportamiento estructural causado por la rapidez o la duración de la carga; tales aumentos deben estar indicados en la norma de diseño de cada material.» Y la regla de montaña, en versión ASD: «En zonas donde la presencia de viento y nieve no es eventual, por ejemplo, zonas montañosas o ubicadas en las regiones XI o XII, se deben estudiar combinaciones especiales que reemplacen **la combinación (6)**, anteriormente indicada, pero que no sean menores que la original.» **9.2.2** inundación: zonas susceptibles → agregar `1,5F_a` a (5), (6) y (7), **y E se fija en cero en (5) y (6)**; zonas no susceptibles → `0,75F_a` en (5), (6) y (7), E = 0 en (5) y (6). **9.2.3** hielo: `0,7D_i` se agrega a (2); `(L_r o S o R)` de (3) → `0,7D_i + 0,7W_i + S`; `W` de (7) → `0,7D_i + 0,7W_i`. **9.3 Eventos extraordinarios**, un párrafo sin factores: «Donde se requiera por el código aplicable, norma, o la Autoridad Competente, la resistencia y la estabilidad deben ser comprobadas para asegurar que las estructuras sean capaces de soportar los efectos de los eventos extraordinarios (es decir, cargas accidentales de baja probabilidad), tales como incendios, explosiones, y el impacto de vehículos.» | **Hallazgo 5.23**; §9.3 fuera de alcance |

**§9 de NCh3171 queda leída completa.**

#### NCh 432:2025 (3.ª ed., 2025.06.27)

162 páginas, **con capa de texto** (289 k caracteres): `localizar.py` sirve para ubicar. **Offset:
índice 0-based = página impresa + 8.**

| Cláusula / Figura | pág. | PDF | Leída | Contenido verificado | Alimenta |
|---|---|---|---|---|---|
| **§5.6.1** Aceleración del viento sobre colinas, cimas y escarpamientos | 20 | 28 | 2026-08-12 | Los efectos en colinas, crestas y escarpes **aislados** que constituyen cambios abruptos en la topografía general, en **cualquier** categoría de exposición, se incluyen cuando el sitio cumple **todas** estas condiciones: **1.** el edificio está en la **mitad superior de una colina o cima**, o cerca de la cima de un escarpamiento (como se muestra en Figura 3); **2.** **H/L_h ≥ 0,2**; **3.** **H ≥ 4,5 m** para Exposiciones **C y D**, y **≥ 18 m** para Exposición **B**. | Post 1 |
| **§5.6.2** Factor topográfico, Ec. (1) | 20 | 28 | 2026-08-12 | **`K_zt = (1 + K₁·K₂·K₃)²`** — Ec. (1). K₁, K₂ y K₃ se dan en la Figura 3. **Los valores de K₂ y K₃ no deben ser menores que 0.** Las ecuaciones de K₁, K₂ y K₃ se pueden usar en vez de los valores tabulados cuando se requiere mayor precisión. **Para H/L_h > 0,5, se supone H/L_h = 0,5 para evaluar K₁ y se sustituye L_h por 2H para evaluar K₂ y K₃.** «Si las condiciones del sitio y la ubicación de los edificios y otras estructuras **no cumplen con todas** las condiciones especificadas en 5.6.1, entonces **K_zt = 1,0**.» | Post 1 |
| **Figura 3** — Factor topográfico K_zt | 21-22 | 29-30 | 2026-08-12 | **No estaba transcrita al wiki.** Definiciones: **L_h** = distancia contra el viento desde la cima hasta donde la diferencia en la elevación del terreno es **la mitad** de la altura de la colina o escarpa, m · **x** = distancia (en contra o a favor del viento) desde la **cresta** hasta el sitio del edificio, m · **z** = altura sobre la superficie del suelo en el lugar del edificio, m · **μ** = factor de atenuación horizontal · **γ** = factor de atenuación de altura · **K₃** = factor que tiene en cuenta la reducción de la aceleración con la altura sobre el terreno local. **Ecuaciones**: `K_zt = (1 + K₁K₂K₃)²` · K₁ de la tabla · **`K₂ = (1 − \|x\|/(μ·L_h))`** · **`K₃ = e^(−γ·z/L_h)`**. **Tabla «Parámetros por aceleración en cimas, colinas o escarpamientos»**, con K₁/(H/L_h) por exposición: **Cima 2D** (o valles con H negativo en K₁/(H/L_h)) → B 1,30 · **C 1,45** · D 1,55 · γ = 3 · μ 1,5 contra el viento y 1,5 a favor. **Escarpamiento 2D** → 0,75 · 0,85 · 0,95 · γ = 2,5 · μ 1,5 contra y **4** a favor. **Colina axisimétrica 3D** → 0,95 · 1,05 · 1,15 · γ = 4 · μ 1,5 y 1,5. | **Hallazgo 5.24**; post 1 |

| **Tabla 5** — Coeficientes de exposición K_h y K_z | 24 | 32 | 2026-08-12 | Por altura z o h en m, y exposición **B / C / D**: **0-2** → 0,71 / 0,87 / 0,90 · **4** → 0,71 / 0,87 / 1,01 · **5** → 0,71 / 0,87 / 1,05 · **6** → 0,71 / 0,90 / 1,09 · **8** → 0,71 / **0,95** / 1,14 · **10** → 0,71 / 1,00 / 1,19 · **12** → 0,74 / 1,04 / 1,22 · **14** → 0,77 / 1,07 / 1,26 · **16** → 0,80 / 1,10 / 1,29 · **18** → 0,83 / 1,13 / 1,31 · **20** → 0,85 / 1,15 / 1,34. **NOTAS**: 1) `K_z = 2,41·[z/z_g]^(2/α)` para `z_mín ≤ z ≤ z_g`. 2) α, z_g y z_mín según **Tabla 6**. 3) para `z < z_mín` se usa K_z con z = z_mín. 4) para `z > z_g`, **K_z = 2,41**. 5) para alturas no señaladas, aplicar la Nota 1 — **la nota dice «Tabla 4», errata: es la Tabla 5**. Texto arriba de la tabla: «La presión de velocidad, a la altura media del techo se calcula como **q_h = q_z evaluada a partir de la Ecuación (2) usando K_z a la altura media del techo h**». | **Hallazgo 5.25**; post 1 |

| **Tabla 2 de NCh2369** — Zonificación sísmica por comunas | 50 | 56 | 2026-08-12 | **No estaba transcrita al wiki.** Norte del país: **Arica y Parinacota** → Zona 3: Arica, Camarones · Zona 2: General Lagos, Putre. **Tarapacá** → Zona 3: Alto Hospicio, Huara, Iquique, Pozo Almonte · **Zona 2: Camiña, Pica** · **Zona 1: Colchane**. **Antofagasta** → Zona 3: Antofagasta, María Elena, Mejillones, Taltal, Tocopilla · **Zona 2: Calama, Sierra Gorda** · **Zona 1: San Pedro de Atacama**. **Atacama** → Zona 3: Alto del Carmen, Caldera, Chañaral, Copiapó, Huasco, Vallenar · Zona 2: Diego de Almagro, Tierra Amarilla. **Coquimbo** → todas en Zona 3 (Andacollo, Canela, Combarbalá, Coquimbo, Illapel, La Higuera, La Serena, Los Vilos, Monte Patria, Ovalle, Paiguano, Punitaqui, Río Hurtado, Salamanca, Vicuña). | **Hallazgo 5.27**; fija la comuna |
| **Tabla 1** — Zonificación y velocidad básica V | 12 | 20 | 2026-08-12 | Por zona, latitud sur, altitud (msnm), **V** en m/s y **p₀** en N/m²: **I-A** 17°29'–27°22'S, < 2 000, **27**, 447 · **I-B** 17°29'–27°22'S, **≥ 2 000**, **30**, **552** — ambas «Límite Norte hasta Copiapó» · **II-A** 27°22'–29°54'S, < 1 500, 27, 447 · **II-B** ídem, ≥ 1 500, 35, 751 — «Zona Centro» · **III-A** 29°54'–37°28'S, < 1 000, 34, 709 · **III-B** ídem, ≥ 1 000, 35, 751 — «Zona Sur» · **IV-A** 37°28'–41°28'S, < 600, 37, 839 · **IV-B** ídem, ≥ 600, 40, 981 — «Zona Sur hasta Chiloé» · **V** 41°28'–50°S, 40, 981 · **VI** 50°–56°32'S, 44, 1 187 — «Zona Austral» · **NC1** Isla de Pascua 32, 628 · **NC2** Juan Fernández 50, 1 533 · **NC3** Antártica CL 60, 2 207. **NOTA 1)** «p₀ corresponde a un valor de presión referencial que considera la evaluación de q_z de acuerdo con 5.8 **adoptando K_z, K_zt y K_e iguales a 1,0**». **NOTA 2)** Ver Figura 2. | **V = 30 m/s** (zona I-B) |
| **Tabla 2** — Factor de importancia I y período de retorno | 12 | 20 | 2026-08-12 | Por **Categoría de ocupación I / II / III / IV**: **período de retorno medio** 25 / 50 / 100 / 150 años; **Factor de Importancia I** = **0,87 / 1,00 / 1,15 / 1,22**. Texto: «La carga de viento se ajusta por el Factor de Importancia, I, de la Tabla 2. **La categoría de ocupación de la estructura se define en NCh3171.**» — ojo, remite a **NCh3171**, no a la Tabla 1 de NCh2369. | **I = 1,00** (categoría II) |
| **§3.2** y **§3.3** altura media del techo y altura del alero | 2 | 10 | 2026-08-12 | **3.2 altura media del techo, h**: «promedio de la altura del alero de la techumbre y la altura hasta el punto más alto de la techumbre. **Para ángulos de techo menores o iguales a 10 grados, se acepta utilizar la altura media del techo como la altura del alero del techo**». **3.3 altura del alero, h_e**: distancia desde la superficie del suelo adyacente al edificio hasta la línea del alero del techo en un muro en particular; si varía a lo largo del muro se usa la **altura promedio**. La simbología (pág. 7 / PDF 15) repite: «h = altura media del techo […] **excepto que la altura del alero se utiliza para un ángulo de techo θ menor o igual a 10 grados**». *(Definiciones en prosa: leídas de la capa de texto, que `CLAUDE.md` autoriza para prosa y definiciones.)* | Cierra **§5.25** |
| **§5.7** y **Tabla 4** — Factor de elevación del suelo K_e | 23 | 31 | 2026-08-12 | «El factor de elevación del suelo para ajustar la densidad del aire, K_e, se debe determinar de acuerdo con la Tabla 4. **Se permite tomar K_e = 1 para todas las elevaciones.**» **Tabla 4** por z_e en m: **< 0** → ver Nota 2 · **0** → 1,00 · **300** → 0,96 · **600** → 0,93 · **900** → 0,90 · **1 200** → 0,87 · **1 500** → 0,84 · **1 800** → 0,81 · **> 1 800** → **ver Nota 2**. **NOTA 1)** en todos los casos es posible usar K_e = 1,00 de manera conservadora. **NOTA 2)** K_e se determina por interpolación o con **`K_e = e^(−0,000119·z_e)`**, con z_e la elevación del terreno sobre el nivel del mar en m. | **Hallazgo 5.26**; post 1 |
| **§5.8.1** y **§5.8.2** — Presión de velocidad, Ec. (2) | 23 | 31 | 2026-08-12 | **5.8.1**: K_z o K_h se determinan de la Tabla 5 según la categoría de exposición de §5.5.3; en zonas de transición cerca de un cambio de rugosidad se permiten **valores intermedios** de K_z o K_h si se justifican con metodología. **5.8.2**, **Ec. (2)**: **`q_z = 0,613·I·K_z·K_zt·K_e·V²`** en **N/m²**, con **I** el factor de importancia según categoría de ocupación (Tabla 2), K_z de §5.8.1, K_zt de §5.6.2. **Ojo: I va DENTRO de q_z y K_d va fuera** (K_d aparece en las ecuaciones de presión, no acá). | Post 1 |

| **Tabla 3** — Factor de direccionalidad K_d | 18 | 26 | 2026-08-12 | **Edificios**: sistema principal resistente a las fuerzas del viento **0,85**; componentes y revestimiento **0,85**. Techos en arco 0,85 · cúpulas circulares 1,0ᵃ · **chimeneas, estanques y similares**: cuadrada 0,90, hexagonal 0,95, octagonal 1,0ᵃ, redonda 1,0ᵃ · muros y letreros sólidos, aislados y equipos en techumbres 0,85 · letreros abiertos y marcos planos 0,85 · **estructuras en celosía**: secciones triangulares, cuadradas o rectangulares 0,85, todas las demás 0,95. **Nota ᵃ**: se permite K_d = 0,95 para estructuras redondas u octogonales con sistemas estructurales **no axisimétricos**. | **K_d = 0,85** |
| **§5.5.2** Categorías de rugosidad de la superficie | 18 | 26 | 2026-08-12 | La rugosidad se determina «dentro de cada **sector de 45 grados** para una distancia contra el viento del sitio», según §5.5.3. **Rugosidad B**: áreas urbanas y suburbanas, boscosas, u otros terrenos con numerosas obstrucciones muy cercanas entre sí del tamaño de viviendas unifamiliares o mayor. **Rugosidad C**: «**terreno abierto con obstrucciones dispersas que tienen alturas generalmente inferiores a 10 m. Esta categoría incluye campos llanos, abiertos y pastizales.**» **C5.5.2**: la rugosidad C «es representativa de zonas de ubicación de aeropuertos, zonas en donde están la mayoría de las estaciones meteorológicas». | **Exposición C** |
| **Tabla 6** — Constantes de exposición al terreno | 25 | 33 | 2026-08-12 | Por exposición, **α · z_g (m) · z_mín (m)**: **B** → 7,5 · 1 000 · 10 · **C** → **9,8 · 750 · 5** · **D** → 11,5 · 590 · 2. | Chequeo de K_z |
| **§5.9** Efecto de ráfaga | 25 | 33 | 2026-08-12 | **5.9.1**: para decidir si es rígido o flexible, la frecuencia natural fundamental se establece «mediante un análisis debidamente fundamentado, utilizando las propiedades estructurales y las características de deformación de los elementos resistentes. **No se permite determinar la frecuencia natural fundamental mediante métodos aproximados basados únicamente en las características geométricas** del edificio o estructura». **5.9.2 rígidas**: «se permite considerar el factor de efecto de ráfaga (G) igual a **0,85**»; alternativamente el procedimiento de **ASCE/SEI 7-22 §26.11.4**; «**Los edificios de baja altura, tal como se definen en cláusula 3, se pueden considerar rígidos**». **5.9.3 flexibles**: G_f por análisis racional fundamentado; se permite **ASCE/SEI 7-22 §26.11.5**, pero sin métodos aproximados para la frecuencia. **5.9.4 Limitaciones**: «Cuando se entreguen factores de efecto de ráfaga **combinados** con coeficientes de presión (GC_p), (GC_pi) y (GC_pf) en tablas y figuras, el factor de efecto de ráfaga **no se debe determinar por separado**». | **Hallazgo 5.28**; G = 0,85 |
| **§5.10** Clasificación del cerramiento | 25 | 33 | 2026-08-12 | **5.10.1**: para los GC_pi los edificios se clasifican como **cerrados, parcialmente cerrados, parcialmente abiertos o abiertos** (cuatro clases) según la cláusula 3. Si satisface a la vez recinto abierto y parcialmente cerrado, se clasifica como **parcialmente abierto**. **5.10.2 Aberturas**: para establecer la clasificación se determina la cantidad de aberturas en la envolvente, y «cada muro del edificio **se debe asumir como el muro de barlovento**» para esa determinación. | Post 1 |
| **§5.11** y **Tabla 7** — Coeficientes de presión interna GC_pi | 26 | 34 | 2026-08-12 | **5.11.1 Factor de reducción para edificios de gran volumen R_i, Ec. (3)**: «Para un edificio **parcialmente cerrado** que contiene un **único volumen grande sin particiones**, el GC_pi se debe multiplicar por R_i»: `R_i = 1,0` o `R_i = 0,5·[1 + 1/√(1 + V_i/(6 950·A_og))] < 1,0`, con **A_og** = área total de aberturas en la envolvente (m²) y **V_i** = volumen interno sin particionar (m³). **Tabla 7** (SPRFV y C&R, todas las alturas, muros y techo): **Edificios cerrados** — A_o menor que el menor entre 0,01A_g o 0,37 m², y A_oi/A_gi ≤ 0,2 — presión interna **moderada**, **GC_pi = +0,18 / −0,18**. **Parcialmente cerrados** — A_o > 1,1A_oi, y A_o mayor que el menor entre 0,01A_g o 0,37 m², y A_oi/A_gi ≤ 0,2 — presión **alta**, **+0,55 / −0,55**. **Parcialmente abiertos** — el que no satisface cerrado, parcialmente cerrado ni abierto — moderada, **+0,18 / −0,18**. **Abiertos** — cada muro al menos **80 % abierto** — despreciable, **0,00**. **NOTAS**: 1) los signos + y − denotan presiones actuando **hacia** y **alejándose** de las superficies internas. 2) los GC_pi se usan con q_z o q_h según se especifique. 3) se consideran **dos casos**: GC_pi positivo en todas las superficies internas, o negativo en todas. | **GC_pi = ±0,18** |

**NCh432 queda leída para lo que la serie necesita.** Lo que falta es de la cláusula 7 (envolvente) y la
9 (C&R), que **ya está trabajado** en `ejemplo-viento-galpon-nch432.mdx` y se cita en vez de rehacerse.

#### Lecturas de la Fase 2 — NCh 2369:2025

| Cláusula / Figura | pág. | PDF | Leída | Contenido verificado | Alimenta |
|---|---|---|---|---|---|
| **§5.4.1** Espectros de diseño — **Ec. (1a)** y **Ec. (1b)** | 28 | 34 | 2026-08-12 | `S_a(T_H) = I·S_aH(T_H)/R* · (0,05/ξ)^0,4`. **R\*** = **1** si `R = 1`; **R** si `R ≠ 1` y `T* ≥ C_r T₁`; `1,5 + (R−1,5)·T*/(C_r T₁)` si `R ≠ 1` y `T* < C_r T₁`; y **`C_r = 0,16 R`**. Espectro vertical Ec. (2): `S_a(T_V) = I·S_aV(T_V)/R_V · (0,05/ξ_V)^0,4`, con `ξ_V = 0,03` salvo justificación. **C5.4.1**: «es necesario verificar que el período de vibración adoptado para el cálculo de R\* sea representativo y **maximice la respuesta** de la estructura». | Paso 2.6; la rama `R = 1` (rukan usa `R ≤ 1`, superset seguro) |
| **§5.4.2** Espectros de referencia — **Ec. (3)** y **Ec. (4)** | 29 | 35 | 2026-08-12 | `S_aH(T_H) = A_r·S·[1 + r(T_H/T₀)^p] / [1 + (T_H/T₀)^q]`. Vertical Ec. (4): `S_aV(T_V) = 0,7·A_r·S·[1 + r(1,7T_V/T₀)^p] / [1 + (1,7T_V/T₀)^q]`. «La razón de amortiguamiento incorporada en los espectros de referencia es ξ = 0,05. Para razones menores se debe ponderar por `(0,05/ξ)^0,4`. **Esta expresión es válida sólo para valores de ξ entre 0,02 y 0,05**.» Los de referencia «corresponden a demandas asociadas a **nivel último**». | Confirma la forma que implementa `rukan/spectra.py`; **ξ = 0,02 está justo en el borde de validez** |
| **§5.6.1** y **§5.6.2** Número de modos | 32 | 38 | 2026-08-12 | **5.6.1** «El análisis modal espectral se debe realizar considerando el espectro de diseño **para la dirección horizontal**.» **5.6.2** «suficientes modos … para que la suma de las masas modales (equivalentes), **en cada dirección de análisis**, sea mayor o igual al 90 % de la masa total». **C5.6.2**: la condición viene de NCh433, UBC, SEAOC y Nueva Zelandia. | **Hallazgo 5.31** — el 90 % está acotado al AME horizontal |
| **§5.7** Acción sísmica vertical | 35 | 41 | 2026-08-12 | **5.7.1** «Se debe representar el efecto sísmico vertical considerando **fuerzas estáticas equivalentes** `F_V = ± C_V·P`… `C_V` debe ser **1,2 I·A_r·S/g para suelos tipo A, B y C**; 1,1 para D; `I·A_r·S/g` para E.» **5.7.2** «**Alternativamente**, se puede desarrollar un análisis modal espectral utilizando el espectro vertical, aplicando las mismas reglas para cantidad de modos y superposición.» **C5.7.1**: la suma de pesos activos en vertical no es necesariamente la del horizontal, y «se debe examinar cuidadosamente si los factores de reducción de la sobrecarga usados para la acción horizontal son adecuados para la vertical»; además, si la flexibilidad vertical sugiere deformaciones relevantes «**es preferible hacer análisis dinámico**». | `C_V = 0,504`; estado `EV`; **Hallazgo 5.31** |
| **§5.12** Corte basal mínimo — **Ec. (12)** | 48 | 54 | 2026-08-12 | `Q₀^mín = 0,25·I·A_r·S·P/g`. Si `Q₀ < Q₀^mín`, todas las fuerzas y esfuerzos internos «se deben multiplicar por el cociente `Q₀^mín/Q₀`… **Este aumento no se debe aplicar al cálculo de desplazamientos**». **C5.12.1**: «Esta norma **no permite** el diseño de estructuras cuya resistencia lateral sea inferior a `Q₀^mín`, **independientemente del método de análisis** utilizado.» | **70,860 kN**; **Hallazgo 5.35** |
| **§5.13** Corte basal máximo — **Ec. (13)** · **§5.14** — **Ec. (14)** | 49 | 55 | 2026-08-12 | `Q₀^máx = 2,75 · I·A_r·S/(g(R+1)) · (0,05/ξ)^0,4 · P`. La reducción por `Q₀^máx/Q₀` «no se debe aplicar al cálculo de desplazamientos». **No aplica** si (a) el diseño sale de tiempo-historia con 5.10.2/5.10.3/5.10.4; **(b) el sistema se diseña con `R ≤ 2`**; (c) sitios Tipo F; (d) cláusula 13 Cat. III o IV; (e) generadoras de energía de cláusula 14. **§5.14**: `R₁ = R*·mín(Q₀/Q₀^mín, 1)`. | **224,907 kN** (R = 4) · 187,422 (R = 5); **Hallazgo 5.35** |
| **§12.1.1–§12.1.3** Galpones industriales | 143 | 149 | 2026-08-12 | **12.1.2** «Los edificios con marcos transversales **deben tener un sistema de arriostramiento continuo en el techo**. Cuando hay cerchas de techo el arriostramiento continuo se debe colocar en el plano de la cuerda inferior. **Se exceptúan los edificios sin puente-grúa en que las cargas permanentes sólo provienen del peso propio.**» **C12.1.2**: «tiene las ventajas sísmicas de los diafragmas rígidos horizontales. Hace posible, además, distribuir cargas laterales concentradas, como las de grúas, entre varios marcos.» **C12.1**: define galpón como construcción de grandes dimensiones, comúnmente de un solo nivel, de vanos típicamente libres entre paredes perimetrales. | **Hallazgo 5.29** — la excepción no aplica (hay 0,35 kPa superpuesta) |
| **Anexo A (informativo)** — **Figura A.2** | 218-219 | 224-225 | 2026-08-12 | El anexo se titula «Anexo A (**informativo**) — Detalles tradicionales». La Figura A.2, «Arriostramiento continuo de techo», muestra en planta un **anillo cerrado**: bandas diagonales a lo largo de cada alero en todos los vanos, cerradas por bandas en ambos hastiales, con el centro sin aspas — pero **las líneas de puntal recorren el largo completo**, incluido el centro. | **Hallazgo 5.29**; topología del modelo |

| **§4.5.2** Simultaneidad direccional | 16 | 22 | 2026-08-12 | Tres ecuaciones: `E = ±1,0Ex ±0,3Ey ±0,3Ez`, `±0,3Ex ±1,0Ey ±0,3Ez`, `±0,3Ex ±0,3Ey ±1,0Ez`. `E_i` = carga sísmica desacoplada en la dirección *i* según cláusula 5; x e y horizontales perpendiculares, z vertical. **C4.5.2**: «corresponde a **tres ecuaciones que deben ser evaluadas de manera independiente**, con sus respectivos cambios de signos, y **no a una elección entre las alternativas** posibles»; los factores «son **menores** a los requeridos en las versiones anteriores», consistentes con ASCE 7. | **Corrige el plan**: es 100/30/**30** con la vertical adentro, no 100/30 |
| **§6.1** Cálculo de desplazamientos sísmicos | 68 | 74 | 2026-08-12 | «Los desplazamientos sísmicos se deben estimar utilizando el **espectro elástico de referencia**, corregido según la razón de amortiguamiento que corresponda, y **ponderado por el coeficiente de importancia I**… La acción sísmica debe considerar la regla de simultaneidad direccional indicada en 4.5.2.» **C6.1**: «se ha observado deficiencias en la estimación del desplazamiento sísmico horizontal… se define al espectro de referencia como la demanda sísmica adecuada para la estimación de desplazamientos de diseño». | Casos `RSX_REF` / `RSY_REF`; **Hallazgo 5.38** |
| **§6.2** Separación entre estructuras — **Ec. (15)** | 68-69 | 74-75 | 2026-08-12 | `D ≥ κ·√(d_i² + d_j²)`, con `κ = 1,2` condición normal y **1,5** condición crítica (1,0 y 1,2 si `d_i`, `d_j` vienen de tiempo-historia con el modelo incluyendo ambas estructuras). **§6.2.2** la separación a elementos no estructurales rígidos o frágiles debe superar el desplazamiento relativo entre sus niveles. | Fuera de alcance (no hay estructuras adyacentes), declarado |
| **§6.3** Desplazamientos sísmicos máximos | 69-70 | 75-76 | 2026-08-12 | Los desplazamientos estimados según 6.1 no deben exceder: **estructuras en general `d^máx = 0,015·h`** · prefabricado con muros de uniones secas `0,002·h` · albañilería con particiones rígidamente unidas `0,003·h` · **marcos de momento con rellenos de albañilería dilatados `0,0075·h`**. **`h` = altura del nivel o entre dos puntos ubicados sobre una misma línea vertical.** **EXCEPCIÓN: «Los límites anteriores se pueden aumentar al doble si se demuestra que el desplazamiento horizontal estimado no compromete la operación de la industria.»** **C6.3**: la versión anterior no ponía tope al usar la excepción; el tope de ahora es consistente con ASCE 7-16 para el sismo Máximo Considerado. | **0,120 m** en el alero; **Hallazgo 5.38** |
| **§6.4** Efecto P-Delta | 70 | 76 | 2026-08-12 | «El efecto P-Delta se debe considerar cuando las deformaciones sísmicas excedan el valor: `d = 0,015·h`.» **C6.4**: «rara vez tiene importancia en estructuras arriostradas, pero **puede serlo en estructuras de marcos resistentes a momento**». | **No se gatilla** (0,9459 del límite); **Hallazgo 5.38** |
| **§12.5.9** | 151 | 157 | 2026-08-12 | «Para el cálculo de deformaciones sísmicas se debe realizar el procedimiento estipulado en cláusula 6, **considerando efecto P-Delta para todos los casos de carga y análisis**…» **Pero §12.5 es SISTEMAS DE ALMACENAMIENTO**, no galpones: `C12.5.9` habla de «la carga almacenada», de *leaning columns*, y la Figura C-6 es el arriostramiento de un rack. | **No aplica al galpón**; **Hallazgo 5.38** |

#### Lecturas de la Fase 2 — NCh 432:2025 (cláusula 7, procedimiento envolvente)

| Cláusula / Figura | pág. | PDF | Leída | Contenido verificado | Alimenta |
|---|---|---|---|---|---|
| **§7.1.1–§7.1.4** Alcance, condiciones, limitaciones | 46-47 | 54-55 | 2026-08-12 | Aplica al SPRFV de **edificios de baja altura** por procedimiento de envolvente. Tres condiciones: forma regular; sin respuesta sujeta a viento transversal, desprendimiento de vórtices, galope o aleteo, ni canalización; **sin techo arqueado o en barril**. **§7.1.4**: «**No debe haber reducciones** en la presión de velocidad causadas por el blindaje…» | El galpón califica |
| **§7.3.1** Presión de diseño — **Ec. (7)** | 47 | 55 | 2026-08-12 | `p = q_h·K_d·[(GC_pf) − (GC_pi)]` (N/m²), con `q_h` la presión de velocidad **a la altura media del techo**, `K_d` de §5.4, `GC_pf` de §7.3.2 y `GC_pi` de la Tabla 7. **`K_d` va explícito en la ecuación** — no dentro de `q_h`. | Paso 2.4b |
| **§7.3.1.1** y **§7.3.2** Casos de carga | 48 | 56 | 2026-08-12 | **7.3.1.1** «**No se permite separar** los coeficientes de presión externa combinados con factor de efecto ráfaga, `GC_pf`.» **7.3.2** hay casos básicos y casos de torsión, actuando de forma independiente. **Excepción — no se requiere diseño para torsión en: 1. edificios de un piso con `h ≤ 9 m`; 2. estructura ligera de uno y dos pisos; 3. uno y dos pisos con diafragmas flexibles.** **7.3.2.1**: se evalúa **tomando cada esquina como la de barlovento**, cargando todas las zonas simultáneamente; las Zonas 2E y 3E van en el borde del techo perpendicular a la cumbrera más cercano a esa esquina. Regla de truncamiento de Zona 2 negativa: se aplica hasta `mín(0,5·dimensión horizontal paralela al SPRFV ; 2,5·altura de alero)` y el resto usa el coeficiente de Zona 3. | **Torsión exenta** (un piso, h = 8,0 m); **Hallazgo 5.30** |
| **§7.3.3–§7.3.6** | 49 | 57 | 2026-08-12 | **7.3.3** el corte horizontal total no debe ser menor que el calculado despreciando el viento sobre el techo — «**Excepción: no se aplica a los edificios que utilizan marcos de momento para el SPRFV**». **7.3.4** parapetos, Ec. (8), `GC_pn` = +1,5 barlovento / −1,0 sotavento. **7.3.5** aleros: `GC_p = 0,7` en la cara inferior a barlovento. **7.3.6** **mínimos: 0,25 kN/m² en muro y 0,13 kN/m² en techo** proyectado sobre plano vertical normal al viento. | §7.3.3 aplica solo en la dirección longitudinal (arriostrada) |
| **§7.3.7** — **Ecs. (9) y (10)** | 50 | 58 | 2026-08-12 | Presión horizontal longitudinal para **edificios abiertos o parcialmente cerrados** con marcos transversales y techo inclinado: `p = q_h·K_d·[(GC_pf)barlovento − (GC_pf)sotavento]·K_B·K_S`, con `K_B = 1,8 − 0,033B` para `B < 30 m`, `K_S = 0,60 + 0,073(n−3) + 1,25φ^1,8`, y `F = p·A_E`. | **No aplica**: el galpón es cerrado. Trampa declarada |
| **Figura 12** — `GC_pf` casos básicos | 51 | 59 | 2026-08-12 | `a` = mín(10 % de la menor dimensión horizontal ; 0,4h), pero ≥ máx(4 % de la menor dimensión ; 0,9 m). **`h` = altura media del techo, «excepto que se debe utilizar la altura del alero para θ ≤ 10°»**. **Caso 1** (θ: 0–5 / 20 / 30–45 / 90) superficies 1,2,3,4,1E,2E,3E,4E — fila 0–5: `0,40 / −0,69 / −0,37 / −0,29 / 0,61 / −1,07 / −0,53 / −0,43`; fila 20: `0,53 / −0,69 / −0,48 / −0,43 / 0,80 / −1,07 / −0,69 / −0,64`. **Caso 2** (θ 0–90): `1 −0,45 · 2 −0,69 · 3 −0,37 · 4 −0,45 · 5 0,40 · 6 −0,29 · 1E −0,48 · 2E −1,07 · 3E −0,53 · 4E −0,48 · 5E 0,61 · 6E −0,43`. **Nota 2**: se permite interpolación lineal para θ distinto de los mostrados. | **Cierra la deuda de §5.25 con página**; paso 2.4b |
| **Figura 13** — `GC_pf` casos de torsión | 52 | 60 | 2026-08-12 | Casos 3 y 4. Sus cotas fijan la geometría de zonas: el Caso 3 marca `2a`, `0,5L` y `L` **a lo largo de la cumbrera**; el Caso 4 marca `B`, `0,5B`, `a` y `2a` **sobre el hastial**. Caso 3: `1T 0,10 · 2T −0,17 · 3T −0,09 · 4T −0,07` (fila 0–5). Caso 4: `5T 0,10 · 6T −0,07`. | Exento, pero sus cotas definen las franjas E |
| **Figura 14** | 53 | 61 | 2026-08-12 | Terminología geométrica de §7.3.7 (`B`, `A_S`, `A_E`, `n`), para edificios abiertos. | No aplica |

#### Lecturas de la Fase 3 — NCh 432:2025 (definiciones que faltaban)

| Cláusula | pág. | PDF | Leída | Contenido verificado | Alimenta |
|---|---|---|---|---|---|
| **§3.12** Edificio de baja altura | 3 | 11 | 2026-08-12 | «edificio cerrado, parcialmente cerrado o parcialmente abierto, que cumple con las condiciones siguientes: **1. Altura media del techo `h` es menor o igual a 18 m**, y **2. La altura media del techo `h` no excede la menor dimensión horizontal.**» Con `h = 8,0 m` contra 18 m y contra 24 m, el galpón califica por las dos. Es la definición a la que remite §5.9.2 para declararlo rígido sin análisis de frecuencia. | Post 1; cierra §5.28 con página |
| **§3.11, §3.13, §3.14, §3.15** Clases de cerramiento | 3 | 11 | 2026-08-12 | **Cerrado**: aberturas por muro `A_o < 0,01·A_g` o 0,37 m², el que sea menor. **Abierto**: cada muro al menos 80 % abierto, `A_o ≥ 0,8·A_g`. **Parcialmente cerrado**: `A_o > 1,10·A_oi` **y** `A_o >` (0,37 m² o 0,01·A_g, el menor) **y** `A_oi/A_gi ≤ 0,20`. **Parcialmente abierto**: el que no cumple ninguna de las tres. | Post 1; `GC_pi = ±0,18` |

#### Lecturas de la Fase 3 — AISC 360-22 (la ruta del canal de la costanera)

PDF: `A360-22W-ewr.pdf`. `pág.` = la numeración impresa `16.1-nn`; `PDF` = índice 0-based de `raster.py`
(offset: PDF = impresa + 67).

| Cláusula | pág. | PDF | Leída | Contenido verificado | Alimenta |
|---|---|---|---|---|---|
| **Tabla User Note F1.1** — tabla de selección del Cap. F | 51 | 118 | 2026-08-12 | El pictograma de la fila **F2 es una doble T *y un canal***, con ala **C** y alma **C**, estados límite `Y, LTB`. Las filas **F3, F4 y F5 dibujan solo doble T** — no hay fila de canal para ala no compacta o esbelta ni para alma esbelta. La fila **F6** dibuja doble T **y canal** flectados en el eje menor: ala `C, NC, S`, alma `NA`, estados `Y, FLB`. **F12** = «Unsymmetrical shapes, other than single angles», todos los estados límite. | **La ruta del canal existe en los dos ejes**; **Hallazgo 5.39** |
| **§F6** Doble T y canales flectados en su eje menor | 61 | 128 | 2026-08-12 | «This section applies to I-shaped members **and channels** bent about their minor axis. The nominal flexural strength, `M_n`, shall be the lower value obtained according to the limit states of **yielding (plastic moment)** and **flange local buckling**.» | Eje débil de la costanera |
| **Cap. H, encabezado** | 82 | 149 | 2026-08-12 | «This chapter addresses members subjected to axial force and flexure about **one or both axes**, with or without torsion, and members subjected to torsion only.» `H1` doblemente y simplemente simétricos · `H2` no simétricos · `H3` torsión · `H4` rotura de alas con perforaciones. | Encuadre |
| **§H1.1** — **Ecs. (H1-1a)** y **(H1-1b)** | 82 | 149 | 2026-08-12 | «The interaction of flexure and compression in doubly symmetric members and **singly symmetric members constrained to bend about a geometric axis (`x` and/or `y`)** shall be limited by Equations H1-1a and H1-1b.» **(a)** cuando `P_r/P_c ≥ 0,2`: `P_r/P_c + (8/9)·(M_rx/M_cx + M_ry/M_cy) ≤ 1,0`. **(b)** cuando `P_r/P_c < 0,2`: `P_r/(2P_c) + (M_rx/M_cx + M_ry/M_cy) ≤ 1,0`. **User Note**: «Section H2 may be used in lieu of the provisions of this section.» | **La ecuación del post 9**; **Hallazgo 5.39** |
| **§H1.2** Flexión y tracción | 83 | 150 | 2026-08-12 | Mismas Ecs. H1-1a/H1-1b con `P_c` de tracción del Cap. D. Para miembros **doblemente** simétricos se permite multiplicar `C_b` por `√(1 + α·P_r/P_ey)`, **Ec. (H1-2)** `P_ey = π²EI_y/L_b²`, `α = 1,0` (LRFD). **User Note de §H1.1**: «All terms in Equations H1-1a and H1-1b are to be taken as positive.» | El bono de `C_b` **no** aplica al canal (es simplemente simétrico) |

#### Lecturas de la Fase 3 — AISC 360-22 (la ruta del cajón de las diagonales)

Mismo PDF y mismo offset (`PDF = impresa + 67`). Leídas el **2026-08-12** (2.ª sesión), todas
rasterizadas a zoom 4,6 — el PDF de AISC es de 6 × 9 pulgadas y con zoom 2,6 la tabla no se lee.

| Cláusula | pág. | PDF | Leída | Contenido verificado | Alimenta |
|---|---|---|---|---|---|
| **Tabla B4.1a** — razones ancho/espesor, compresión axial | 21 | 88 | 2026-08-12 | Nueve casos. **Caso 6 «Walls of rectangular HSS»** → λ = `b/t`, **λ_r = 1,40√(E/F_y)**, con pictograma de esquina redondeada. **Caso 8 «All other stiffened elements»** → λ = `b/t`, **λ_r = 1,49√(E/F_y)**, y su pictograma es **una plancha entre dos elementos que la atiesan** — que es la pared de un cajón armado. Caso 7 «Flange cover plates between lines of fasteners or welds» → 1,40. Caso 5 «Webs of doubly symmetric rolled and built-up I-shaped sections and channels» → `h/t_w`, 1,49. Al pie: `E = 200 000 MPa`, `F_y` = tensión de fluencia mínima especificada. | **Hallazgo 5.45** — el cajón **soldado** es caso 8, no caso 6 |
| **§B4.1b**, items (d) y (e) | 22 | 89 | 2026-08-12 | **(d)** «For flanges of rectangular hollow structural sections (HSS), the width, `b`, is the clear distance between webs less the inside corner radius on each side… **If the corner radius is not known, `b` and `h` shall be taken as the corresponding outside dimension minus three times the thickness**.» — o sea el `b = B − 3t` es **solo para HSS**. **(e)** «For flanges or webs of **box sections** and other stiffened elements, the width, `b`, is **the clear distance between the elements providing stiffening**.» | **Hallazgo 5.45** — para el cajón armado la medida es la luz libre, `b = B − 2t` |
| **§E2** Longitud efectiva | 40 | 107 | 2026-08-12 | `L_c = KL`. **User Note**: para miembros diseñados a compresión, `L_c/r` **preferiblemente** no debería exceder **200**; y la esbeltez del miembro como fabricado, **300**. Segunda User Note: `L_c` se puede determinar con un factor `K` **o con un análisis de pandeo**. | Contexto; conecta con §5.16 |
| **§E3** — **Ecs. E3-1, E3-2, E3-3** | 40 | 107 | 2026-08-12 | Aplica a miembros de elementos **no esbeltos** según §B4.1. `P_n = F_n A_g` **(E3-1)**. **(a)** cuando `L_c/r ≤ 4,71√(E/F_y)` (o `F_y/F_e ≤ 2,25`): `F_n = (0,658^(F_y/F_e))·F_y` **(E3-2)**. **(b)** cuando `L_c/r > 4,71√(E/F_y)` (o `F_y/F_e > 2,25`): `F_n = 0,877·F_e` **(E3-3)**. | `φ_c P_n` de las cuatro secciones |
| **§E3** — **Ec. E3-4** y User Note | 41 | 108 | 2026-08-12 | `F_e = π²E/(L_c/r)²` **(E3-4)**; alternativamente §7.2.3(b) del Apéndice 7, o un análisis de pandeo elástico. **User Note**: «The two inequalities for calculating the limits of applicability of Sections E3(a) and E3(b), one based on `L_c/r` and one based on `F_y/F_e`, **provide the same result** for flexural buckling.» | Ídem |
| **§D1** y **§D2** — **Ec. D2-1** | 32 | 99 | 2026-08-12 | **D1**: «**There is no maximum slenderness limit for members in tension**»; la User Note recomienda `L/r ≤ 300` para los diseñados a tracción, y aclara que **no aplica a barras** (*rods*). **D2 (a)** fluencia en tracción: `P_n = F_y A_g` **(D2-1)**, `φ_t = 0,90` (LRFD), `Ω_t = 1,67` (ASD). | La rama solo-tracción de §12.2 |
| **§D2 (b)** — **Ec. D2-2** · **§D3** — **Ec. D3-1** | 33 | 100 | 2026-08-12 | Rotura en tracción: `P_n = F_u A_e` **(D2-2)**, `φ_t = 0,75`, `Ω_t = 2,00`. **D3**: `A_e = A_n U` **(D3-1)**, con `U` de la Tabla D3.1. «For open cross sections such as W, M, S, C, or HP shapes, WTs, STs, and single and double angles, the shear lag factor, `U`, need not be less than the ratio of the gross area of the connected element(s) to the member gross area. **This provision does not apply to closed sections, such as HSS, nor to plates.**» | Declarado fuera de alcance (§3: sin conexiones) |

### 4.2 Parámetros derivados

| Símbolo | Valor | De dónde sale |
|---|---|---|
| Área en planta | 576,0 m² | 24,0 × 24,0, geometría congelada |
| Largo de faldón | 12,185 m | 12,0 / cos 10° |
| Separación de costaneras | 1,354 m | faldón / 9 espacios |
| A_r | 0,42 g | Tabla 3, zona 2 |
| S, r, T₀, p, q, T₁ | 1,00 · 4,50 · 0,30 s · 1,60 · 3,00 · 0,27 s | Tabla 6, suelo B |
| R | 5 | Tabla 7 fila 5.5 (exige arriostramiento continuo de techo **y** anclajes dúctiles) |
| ξ | 0,02 | Tabla 7, uniones soldadas |
| f_ξ = (0,05/ξ)^0,4 | **1,4427** | Ec. (1a) — pendiente de leer. Con ξ = 0,02 son **+44 %** |
| Codo de la Ec. (1b): 0,16·R·T₁ | R=4: **0,173 s** · R=5: **0,216 s** | 0,16·R·T₁ con T₁ = 0,27 s. El T\* de la dirección arriostrada cae cerca: su R\* es sensible al modelo |
| Límite de esbeltez global §8.8.4, A36 | **133,29** | 1,5π√(E/F_y) con E = 200.000 MPa y F_y = 250 MPa. √800 = 28,2843 → ×π = 88,8577 → ×1,5 = 133,2865 |
| r mínimo de la diagonal, L = 10,0 m | **75,0 mm** | 10.000 / 133,29. Inalcanzable con perfil razonable |
| r mínimo de la diagonal, L = 5,0 m (cruce de la X, §8.6.4) | **37,5 mm** | 5.000 / 133,29. Un cajón 100×100×4 da r ≈ 39,2 mm → KL/r = 127,5 ✅ |
| **√(E/(R_y·F_y))** para A36 en **plancha** | **24,807** | E = 200.000 MPa, **R_y = 1,3** (AISC 341-22 Tabla A3.2, fila *Plates, Strips, and Sheets*; y C8.3.3 de NCh2369), F_y = 250 MPa → R_y F_y = 325 MPa → √(200.000/325) = √615,38. Válido porque **todas las secciones se definen por planchas**; con perfil laminado A36 sería R_y = 1,5 y todos los λ_md bajarían 6,9 % |
| λ_md alas no atiesadas (0,40·) | **9,92** | Ala 220×12 con alma 6: b = (220−6)/2 = 107 → b/t = **8,92** ✅ (10 % de margen) |
| λ_md paredes de HSS como arriostramiento (0,76·) | **18,85** | Cajón 100×100×4: b/t = 92/4 = **23** ❌ · 100×100×5: 90/5 = **18** ✅ |
| λ_md almas I/H/C como arriostramiento (1,57·) | **38,95** | también es el piso de la rama alta de flexo-compresión |
| λ_md alas en flexo-compresión (1,18·) | **29,27** | |
| λ_md almas en flexo-compresión, rama baja | **98,25·(1 − 3,04·C_a)** | 3,96 × 24,807. En C_a = 0 → 98,25; en C_a = 0,114 → **64,2** |
| λ_md almas en flexo-compresión, rama alta | **32,00·(2,12 − C_a) ≥ 38,95** | 1,29 × 24,807. Continua con la rama baja en C_a = 0,114; toca el piso en C_a ≈ 0,903 |

### 4.3 Datos de proyecto (declarados, sin cláusula)

Amparados por **§4.5.1** de NCh2369, que para alta montaña exige estudios específicos de nieve y
viento. Se declaran en los supuestos de cada post; no se atribuyen a NCh431 ni a NCh1537.

| Carga | Valor | Nota |
|---|---|---|
| Cubierta (panel sándwich aislado) | 0,12 kPa | |
| Costaneras | 0,06 kPa | |
| Instalaciones colgadas | 0,15 kPa | bandejas, luminarias, rociadores |
| **D superpuesta de techo** | **0,35 kPa** sobre el faldón | los tres componentes suman 0,33; **se adopta 0,35**, redondeando hacia arriba. Es el valor que usa el modelo (`D_TECHO = 0.35`) y con el que cierra `DSD = 302,964 kN`. El peso propio del marco lo pone el motor, aparte |
| D revestimiento de muro | 0,12 kPa | |
| **L_r** | **0,30 kPa** | con S = 1,20 no gobierna nunca; `a = 0` la saca del sismo |
| **S balanceada** | **1,20 kPa** sobre proyección horizontal | ≈ 3,4× la carga muerta de techo |
| **S desbalanceada** | 100 % / 50 % por faldón | **redactar como regla del estudio de sitio**, jamás como regla normativa |

### 4.4 Predimensionamiento «a ojo de obra»

Pensado para fallar. Se confirma con el usuario en el paso 2.2.

| Miembro | Predimensionado | Falla esperada | Arreglo esperado |
|---|---|---|---|
| Columna tapered | alma 6 mm, peralte 350 (base) → 800 (alero); alas 220×12 | h/t_w = 133 → alma esbelta · deriva §6.3 | alma 8 mm, alero 800→1.100, rigidizadores |
| Dintel tapered | alma 6 mm, 800 (alero) → 350 (cumbrera); alas 220×12 | flexión bajo nieve · LTB del ala inferior con L_b = 6,0 m | alma 8 mm + kickers a 2,70 m |
| Diagonal longitudinal | 2L 75×75×6, L = 10,0 m | esbeltez fuera del límite de §8 | **puntal a media altura** → L = 5,0 m |
| Costanera | C 200×50×15×2,0 @ 1,50 m | flexión eje débil bajo nieve | CA 250×3,0 @ 1,354 m + 2 tirantes a los tercios |
| Crucería de techo | dos vanos extremos | — | es lo que compra R = 5; hay que pesarla |

---

## 5. Hallazgos

Los que cambian el contenido de un post o corrigen algo ya escrito.

### 5.1 La deuda de NCh431 no existe — la norma manda usar un estudio de sitio

**§4.5.1 de NCh2369** exige, para proyectos de **alta montaña**, estudios específicos que definan el
nivel de las cargas de interés «por ejemplo nieve o viento» **y la forma en que se combinan con el
sismo**. El galpón está a 3.800 m. Declarar `S` desde un estudio de sitio deja de ser una deuda con
disculpa y pasa a ser lo que la norma pide, citable con cláusula y página.

Efecto sobre el plan: el `Note` de deuda del post 3 se reescribe como **cita normativa**, no como
disclaimer. Sigue prohibido atribuir un número a NCh431.

### 5.2 La Tabla 7 clasifica el edificio, no la dirección — y el techo elige la fila

Filas 5.5 (R = 5) y 5.6 (R = 3) se diferencian **solo** en si hay o no **arriostramiento continuo de
techo**. La fila aplica al edificio completo, o sea también a la dirección transversal, que ni siquiera
toca el techo. Unos cientos de kilos de crucería mueven la demanda de análisis un **67 %**.

Es la tesis del post 5, y quedó confirmada literalmente por la norma.

### 5.3 §5.1.2 no da un número para la nieve en la masa sísmica

Da un **criterio**: valor esperado, o probabilidad de ocurrencia simultánea con el sismo de diseño.
Los tres mínimos tabulados son ocupaciones (bodegas, acopio, plataformas), ninguna es nieve de techo.
En el altiplano la nieve permanece meses sobre la cubierta, así que la probabilidad de simultaneidad
**no** es despreciable — al revés que en un techo de Santiago. La decisión se toma en el paso 2.5 y se
argumenta, no se copia.

**Corrección al wiki**: `material_teorico\taller\_indice-taller.md` (línea ~79) anota que «§5.1.2
[remite a NCh1537 para la] fracción mínima de masa sísmica obligatoria». **§5.1.2 no remite a
NCh1537.** Corregir esa nota.

### 5.4 La loma del K_zt pelea con la clasificación de suelo

La nota a) de la **Tabla 4** dice que la clasificación de suelos aplica a topografía aproximadamente
horizontal y a estructuras **lejos de singularidades geomorfológicas y topográficas**. La plataforma
sobre un lomo que le da al post 1 su `K_zt` es, justamente, una singularidad topográfica. Es una
tensión real entre las dos normas y da un párrafo excelente en el post 1 o el 5.

### 5.5 Las tablas sísmicas de rukan SÍ coinciden con la 3.ª edición

Riesgo #1 del plan, **descartado**. `AR_BY_ZONE` (`spectra.py:22`) y `SOIL_PARAMS`
(`spectra.py:38-44`) coinciden **exactamente** con las Tablas 3 y 6 de la edición 2025, pese a que el
docstring del módulo cita «NCh2369.Of2003, cláusula 5.4 y 5.5» y «Tabla 5.2/5.3». No hay impacto
retroactivo sobre la serie de la torre.

**Pendiente menor**: actualizar ese docstring, que apunta a una edición que no es la vigente.

### 5.6 Con puente grúa y sin arriostramiento continuo de techo no hay fila

La 5.5 dice «**con o sin** puente grúa, **con** arriostramiento continuo de techo». La 5.6 dice «**sin**
puente grúa, **sin** arriostramiento continuo de techo». El caso «con puente grúa y sin arriostramiento
continuo de techo» **no está en la tabla**, y cae en la fila 2 («otras estructuras no incluidas o
asimilables»), R = 1,5. No estaba en el plan; es material para el post 5.

### 5.7 El arriostramiento continuo de techo es obligatorio, no una opción que compra R

**§12.1.2** lo exige para todo edificio con marcos transversales. La única excepción son los edificios
**sin puente grúa cuyas cargas permanentes provienen sólo del peso propio** — no es nuestro caso: la
cubierta, las costaneras y las instalaciones colgadas suman 0,35 kPa de carga muerta superpuesta.

Eso afila la tesis del post 5 en vez de romperla. La fila **5.6 de la Tabla 7 (R = 3) es casi
inalcanzable legalmente**: si tienes marcos transversales, §12.1.2 te obliga al arriostramiento
continuo, y eso te pone en la fila 5.5 (R = 5). La 5.6 describe la excepción —un galpón pelado cuya
única carga permanente es su propio peso— o un edificio que no cumple §12.1.2.

Y **C12.1.2 dice explícitamente** que el arriostramiento continuo «tiene las ventajas sísmicas de los
diafragmas rígidos horizontales» y «hace posible distribuir cargas laterales concentradas […] entre
varios marcos». O sea, el reparto entre los 5 marcos que es la tesis del post 4 es exactamente lo que
la norma persigue con la cláusula.

### 5.8 El galpón CALIFICA como liviano — y eso es una bifurcación, no un detalle

Las ocho condiciones de **§12.2.1**, contrastadas contra el caso:

| Cond. | Exige | Nuestro galpón | ¿Cumple? |
|---|---|---|---|
| a) | Categoría I o II | II | ✅ |
| b) | una o varias naves paralelas | una nave | ✅ |
| c) | altura libre ≤ 23 m; luz ≤ 75 m | 8,0 m; 24,0 m | ✅ |
| d) | **peso propio de la estructura de techo ≤ 70 kg/m²** | **47,6 kg/m²** (ver abajo) | ✅ **verificado** |
| e) | puente grúa ≤ 100/50 kN | no hay | ✅ |
| f) | sin estanterías vinculadas sísmicamente | no hay | ✅ |
| g) | equipos ≤ 50 kN por marco | instalaciones colgadas 0,15 kPa × 144 m² ≈ 21,6 kN | ✅ |
| h) | altillos ≤ 15 kN por columna | no hay | ✅ |

**El peso de la condición d), armado bien** (la auditoría del post 5 encontró que el número que
circulaba tenía un hueco): los **41,365 kg/m²** de §6.2.1 son *todo el acero del modelo* sobre los
576 m² de planta, y ese modelo deja las **costaneras fuera** a propósito (§6.2.2) — pero §12.2.1 d)
sí las cuenta. Sumadas, 0,06 kPa sobre los 584,889 m² de faldón son 3 578 kg, o **6,2 kg/m²** de
planta, y el total queda en **47,6 kg/m² < 70**. Ese 47,6 es además un mayorante de lo que la
condición pide, porque ella enumera «vigas, costaneras, colgadores, puntales, arriostramientos y
conexiones» y **no incluye las columnas**, que en el modelo sí están.

**Consecuencia**: §12.2 dice «se **debe** evaluar utilizando […] Tabla 7, punto 5.7», o sea **R = 4**, y
§12.2.2 reemplaza el amplificador de capacidad **0,7R₁ por 0,5R₁**. No es un menú: si cumples las ocho
condiciones, eres galpón liviano.

Esto **corrige el plan**, que suponía R = 5 con «la rama alternativa 3». La alternativa real es
**R = 5 (fila 5.5) contra R = 4 (§12.2)**, y las dos tiran en sentidos opuestos: R = 4 sube la demanda
de análisis un 25 %, pero el amplificador de capacidad baja de 3,50 a 2,00 (−43 %). Es exactamente el
contrato que ya explicó `blog/galpon-liviano-nch2369.mdx`, así que el post 5 **no lo re-explica**:
lo aplica y resuelve por cuál ruta va este galpón.

Nota adicional de **C12.2.1**: los galpones livianos son aquellos «en los cuales los esfuerzos de
viento son normalmente superiores a los sísmicos» — la norma misma anticipa la tesis del post 10.

**Resuelto con el usuario (2026-08-12)**: se corren **las dos**. La de diseño es §12.2 (R = 4, 0,5R₁);
la fila 5.5 (R = 5, 0,7R₁) va como comparación ilustrativa sobre el mismo modelo.

### 5.9 La esbeltez de §8.8.4 tiene dos salidas, y una es geometría

El límite es **1,5π√(E/F_y)** = **133,29** para A36. La diagonal longitudinal de 10,0 m pediría
r ≥ 75,0 mm, que no existe en perfil razonable. Con un **puntal a media altura** (L = 5,0 m) el
requisito baja a r ≥ 37,5 mm y un cajón 100×100×4 (r ≈ 39,2 mm) lo cumple con KL/r = 127,5.
Confirma la tesis del post 10: **el arreglo no es un perfil, es geometría.**

Lo que el plan no tenía: §8.8.4 ofrece una **segunda ruta legal** — quedar exento del límite
diseñando el elemento para el sismo amplificado por 0,7R₁ ≥ 1,0 (o para la máxima carga transferible).
Y como este galpón va por §12.2, **§12.2.2 reescribe ese 0,7R₁ como 0,5R₁ dentro de la propia
§8.8.4**. El post 10 puede mostrar las dos rutas y cuánto acero cuesta cada una.

Ojo con la distinción de cláusulas: **§8.8 es arriostramiento de piso o de cubierta** (nuestra crucería
de techo) y **§8.6 es MAC, marcos arriostrados concéntricamente** (nuestra crucería longitudinal
vertical). Ambas traen el mismo límite `1,5π√(E/F_y)`.

**Actualización 2026-08-12 (2.ª sesión): §8.6.3 ya estaba leída**, y su fila vive en §4.1 desde la
primera sesión (pág. impresa 87, PDF 93). Se volvió a rasterizar para confirmarla y la
transcripción es correcta. Lo que sí apareció al releer las dos páginas en paralelo es una
**asimetría entre las dos cláusulas que ninguna ficha registraba**: §8.6.3 exime **solo** por
`0,7R₁ ≥ 1,0`, mientras **§8.8.4 exime por `0,7R₁` _o_ por «la máxima carga que el sistema puede
transferir al elemento»**. Mismo límite, distinto juego de puertas. Es el eje del post 10
reencuadrado (§5.44).

### 5.10 Ir por galpón liviano habilita el arriostramiento solo-tracción

**§8.6.1** prohíbe el arriostramiento solo-tracción **excepto** en galpones livianos regidos por §12.2.
Como la ruta de diseño es §12.2 (§5.8), este galpón **sí puede** usar solo-tracción. Y §8.6.3 aplica su
límite de esbeltez a las diagonales «**que trabajen en compresión**», así que un sistema solo-tracción
lo esquiva por definición.

Eso convierte al post 10 en una comparación de tres configuraciones, no en un cálculo:

| | Fila 5.5 (R = 5) | §12.2 liviano (R = 4) |
|---|---|---|
| Solo-tracción | **prohibido** (§8.6.1) | **permitido** (§8.6.1, excepción) |
| Esbeltez §8.6.3 | muerde: la diagonal trabaja en compresión | no muerde si es solo-tracción |
| Amplificador de capacidad | 0,7R₁ = 3,50 | 0,5R₁ = 2,00 |
| §8.6.2 | ≥ 30 % del corte de la línea por las traccionadas | ídem |

### 5.11 El punto de cruce de la X ya es el punto de arriostramiento

**§8.6.4** obliga a conectar las diagonales en el punto de cruce y permite considerarlo **fijo en la
dirección perpendicular al plano** para la longitud de pandeo de la comprimida, cuando la otra está
traccionada y una es continua en el cruce.

Corrige el plan: el «puntal a media altura» que se proponía como arreglo geométrico **ya está** — es el
cruce de la propia X. Con la diagonal de 6 × 8 m, la longitud de pandeo fuera del plano es 5,0 m desde
el principio, y un cajón 100×100×4 (r ≈ 39,2 mm → KL/r = 127,5) cumple sin agregar nada.

El post 10 mantiene su tesis —el problema se resuelve con geometría, no con perfil— pero la geometría
la puso la norma, y el hallazgo pasa a ser **la cláusula que casi nadie aplica**. Queda por decidir con
el modelo qué pasa **en el plano**, donde §8.6.4 no dice nada.

### 5.12 El «1,4 de §4.5 para conexiones» no existe en la edición 2025

El reporte inicial sobre `modelo_base` de Skills_SAP daba por hecho un factor 1,4 de NCh2369 §4.5 para
conexiones. **§4.5 leída completa no lo tiene**: solo las cuatro combinaciones sísmicas. Lo que sí
existe es, en el **Anexo B**, un **factor de equivalencia entre métodos ASD↔LRFD a nivel de
resistencia, igual a 1,5**, aceptado «para propósitos de diseño sísmico (diseño por capacidad)».

Corrige el subproducto sobre los defectos del `modelo_base`: el defecto no es «le falta el 1,4», es
«no implementa la equivalencia de 1,5 del Anexo B».

### 5.13 El Anexo B cierra el argumento de la nieve

La cadena queda completa y citable de punta a punta:

1. **§5.1.2** pide una fracción de las sobrecargas «de acuerdo con el **valor esperado**, o su
   probabilidad de ocurrencia simultánea, con el sismo de diseño».
2. **Anexo B** define que «el **valor más probable** corresponde […] al **valor medio de la
   distribución** asociada a la carga», y que el nominal de nieve es el de **2 % de excedencia anual**
   mientras el sísmico es el de **10 % en 50 años**.
3. **§4.5.1** obliga, en alta montaña, a un estudio específico que defina el nivel de la nieve **y cómo
   se combina con el sismo**.

O sea: la fracción de nieve en la masa sísmica es **media / nominal**, y quien la entrega es el estudio
de sitio que la propia norma exige. Ningún número inventado, y la deuda de NCh431 queda convertida en
contenido.

El Anexo B aporta además la doctrina de **carga primaria / acompañante** que estructura el post 3, y
autoriza explícitamente las **combinaciones de servicio** para deformaciones — que es lo que el
`modelo_base` no tiene.

### 5.14 La Categoría de ocupación puede matar al galpón liviano

**§12.2.1 a)** exige Categoría I o II. La **NOTA 1 de la Tabla 1** dice que una instalación **no puede
clasificarse por debajo del equipo o proceso más crítico que aloje o soporte**. Basta con que el galpón
albergue equipo de proceso crítico para subir a Categoría III — y ahí pierde de golpe el galpón liviano
(R = 4 → habría que ir a la fila 5.5) **y** sube I de 1,00 a 1,20.

Por eso hay que **declarar explícitamente en los supuestos** qué alberga el galpón. Se declara como
bodega / almacenamiento de insumos **sin equipo de proceso crítico**, que es lo que sostiene a la vez la
Categoría II, el I = 1,00 y la ruta de §12.2.

Es un buen párrafo para el post 5: el R de un galpón no lo decide solo su estructura, lo decide **lo que
se guarda adentro**.

### 5.15 La Tabla 9 muerde más que la esbeltez global, y el arreglo del plan se queda corto

Dos consecuencias, ambas corrigen el predimensionamiento del plan.

**La diagonal.** El cajón 100×100×4 **cumple** la esbeltez global de §8.6.3 (KL/r = 127,5 < 133,29) pero
**falla la local**: b/t = 23 contra λ_md = 18,85 (y con la lectura `b = B − 3t` de AISC §B4.1b(d) da 22,
que tampoco pasa). Hay que subir a **100×100×5** → b/t = 18 ✅ y r ≈ 38,8 mm → KL/r = 128,8 ✅.
Buen material para el post 10: lo que manda no es el KL/r que todos miran, es el λ_md.

**El alma del tapered.** Con C_a bajo —lo típico de una columna de galpón, digamos C_a ≈ 0,05— el límite
es 98,25 × (1 − 3,04 × 0,05) = **83,3**. El alma de 6 mm con h = 800 − 2×12 = 776 mm da
h/t = **129,3**: falla, como el plan quería. Pero **el arreglo que el plan proponía —alma de 8 mm— da
97 y tampoco pasa**. Se necesita **10 mm**, o bajar el peralte del alero, o ambas. El C_a real sale del
análisis, así que el número final se fija en la Fase 2.

**Pendiente que decide cuánto de esto aplica**: hay que leer **§8.7 (marcos de momento)** para saber con
qué alcance invoca la Tabla 9 y si trae la misma exención por diseño de capacidad que §8.6.3 y §8.8.4.
Si la trae, el dintel y la columna tienen la misma bifurcación que la diagonal.

### 5.16 El Método de Análisis Directo está prohibido para sismo en Chile

**§8.3.2** lo dice como disposición y **C8.3.2** lo explicita: «no se permite el uso del Análisis Directo
en el contexto del diseño estructural sismorresistente nacional». El razonamiento es fino: el DAM es
adecuado para viento, «cuya magnitud y sentido son fundamentalmente independientes de la respuesta
dinámica», pero la solicitación sísmica sí depende de ella, y bajar la rigidez **subestima la demanda**.

**Corrige el plan**, que proponía resolver el post 7 con «DAM: 0,8τ_b EI + cargas nocionales». Para el
sismo hay que ir por longitud efectiva: C8.3.2 pide **un análisis de pandeo que defina el K de cada
elemento** (recordando que K depende también de la distribución de cargas), o métodos conservadores
reconocidos como los **nomogramas de Kavanagh (1962)**; y acepta el segundo orden aproximado de
**NCh427/1:2016 Anexo 8**.

Eso *mejora* la tesis del post 7: en Chile vuelves a los factores de longitud efectiva — **y para un
miembro de peralte variable no hay nomograma**. El K sale de un análisis de pandeo del modelo, que es
justo lo que los dos motores pueden entregar y contrastar.

Consecuencias prácticas:

- El DAM sí se puede (y conviene) usar para las combinaciones **de gravedad y viento**. Hay que separar
  las dos familias en el modelo y decirlo en el post.
- Baja la urgencia del `geom_transf` PDelta en rukan para el caso sísmico, pero **sube** la de tener un
  **análisis de pandeo (`eigen` de la matriz geométrica)** en ambos motores. Reordena la lista de
  cambios de rukan de §6.1.
- **NCh427/1 no está en PDF** en este equipo. Se suma a la deuda de §8.

### 5.17 R_y = 1,3 confirmado — pero es el de **placas**, y la cita de la norma quedó renumerada

**Cerrado el 2026-08-12** leyendo la **Tabla A3.2 de AISC 341-22** rasterizada. La tabla separa por
aplicación, y para **ASTM A36** da:

| Aplicación | R_y | R_t |
|---|---|---|
| Hot-Rolled Structural Shapes and Bars | **1,5** | 1,2 |
| **Plates, Strips, and Sheets** | **1,3** | 1,2 |

El **1,3 es el de placas**. Como todas las secciones de esta serie se definen **por planchas** (decisión
de §2), es el valor que corresponde — y coincide con **C8.3.3** de NCh2369, que habla literalmente de
«placas de acero calidad ASTM A36 (U. de Chile)». **Los λ_md de §4.2 quedan firmes**, ya no son
condicionales.

**Dos consecuencias de diseño que hay que tener a la vista:**

1. Si un miembro se resolviera con **perfil laminado** A36 en vez de plancha, R_y sube a 1,5 y **todos
   sus λ_md bajan un 6,9 %** (factor √(1,3/1,5) = 0,9309). El ala de 220×12 pasaría de 10 % de margen
   a 2 %.
2. Si la diagonal se resolviera con **tubo comercial** en vez de cajón soldado de plancha, cambia dos
   veces: **A500 Gr. B lleva R_y = 1,4** (Gr. C, 1,3) *y* su F_y nominal es mayor que el de A36, así que
   tanto el λ_md como el límite `1,5π√(E/F_y)` se aprietan. La comparación cajón-soldado contra
   tubo-comercial es material para el post 10.

**Gotcha de edición, nuevo, de la familia que `CLAUDE.md` ya documenta:** en **AISC 341-22 la tabla de
R_y y R_t es la A3.2**; la **A3.1** pasó a ser *Listed Materials Permitted for Use in SFRS*. La 22
declara en su prefacio «New presentation of Table A3.1». **NCh2369:2025 §8.3.3 cita «341-16, Tabla
A3.1»**, que era correcto para la 16 y apunta a otra cosa en la 22. Citar «AISC 341 Tabla A3.1» sin
edición manda a dos tablas distintas — conviene agregarlo a la lista de gotchas de `CLAUDE.md`.

### 5.18 «Columna fuerte–viga débil» dejó de ser obligatorio en la edición 2025

**C8.7.4** lo dice sin ambigüedad: «La exigencia a nivel de requisito mandatorio del concepto tradicional
de columna fuerte y viga débil **se ha eliminado en esta versión de la norma**». El razonamiento es que
su límite de aplicabilidad corresponde al uso de las cargas sísmicas amplificadas por 0,7R₁ ≥ 1,0 en la
resistencia de la columna, y como la norma ya exige que **toda** columna resista esas cargas, el
requisito tradicional se vuelve innecesario como obligatorio.

Lo que queda (**§8.7.4**) es una **recomendación**, y solo para «estructuras de **varios niveles**»:
ΣM_pc reducidas por axial ≥ **1,2**·ΣM_pe de las vigas del nudo. **Nuestro galpón es de un nivel**, así
que ni siquiera aplica como recomendación.

Es un cambio de edición que merece un `Note` en el post 7 u 8: quien venga de la Of2003 va a buscar el
chequeo y no está.

### 5.19 ¿La Tabla 9 aplica a la columna del marco? La norma dice «vigas»

**§8.7.3** impone λ_md a «las secciones transversales de **vigas** de marcos resistentes a momento», y la
tercera página de la **Tabla 9** titula sus filas «Perfiles usados como **vigas** sometidos a
flexo-compresión». La columna de un galpón es un miembro en flexo-compresión —de hecho la Tabla 9 la
cubriría por su encabezado— pero la palabra que usa §8.7.3 es «vigas».

Dos lecturas:

- **Estricta**: §8.7.3 solo obliga en las vigas (dinteles). La columna se verifica por NCh427/1 sin el
  λ_md sísmico.
- **Amplia** (la que se adopta): en un marco de un vano la columna **es** un miembro flexural y participa
  de la rótula plástica del nudo; el encabezado de la Tabla 9 habla de flexo-compresión, que es
  exactamente su estado. Se le aplica λ_md.

Se adopta la amplia por conservadora, **y se declara la ambigüedad en el post** en vez de esconderla.
Es contenido: obliga a mostrar cuánto cambia el resultado según la lectura.

Nota relacionada: **§8.7.2** prohíbe «discontinuidades geométricas abruptas» en las zonas de rótula
plástica de la viga. Un peralte variable es un cambio **gradual**, así que no cae ahí — pero la
**rodilla** es justo donde coinciden la rótula esperada y el cambio de geometría, y ese detalle hay que
mirarlo con §8.7.6 (atiesadores de continuidad obligatorios) en la mano.

**Exención por capacidad, y su letra chica**: §8.7.3 la ofrece igual que §8.6.3 y §8.8.4, pero exige que
la resistencia requerida **«para todos los esfuerzos»** salga de la combinación amplificada — redacción
más dura que la de las otras dos. Y por **§12.2.2**, para este galpón ese 0,7R₁ se lee **0,5R₁**.

### 5.20 Quién manda: NCh3171 cede por escrito ante la norma sísmica

La pregunta que el plan dejaba abierta —«determinar exactamente dónde manda cada una»— la contesta la
propia NCh3171 en la primera página de su §9: **«Cuando las normas de diseño sísmico consideren otras
combinaciones para casos particulares de cargas, éstas prevalecen.»**

Y la diferencia no es cosmética. Para el **mismo** E:

| | LRFD | ASD |
|---|---|---|
| **NCh3171** §9.1.1 (5) y §9.2.1 (5b) | `1,2D + **1,4E** + L + 0,2S` | `D + **1,0E**` |
| **NCh2369** §4.5.1 | `1,2D + aL + SO + SA + **1,0E**` | `D + 0,75aL + 0,75SO + 0,75SA + **0,70E**` |

Meter el E de NCh2369 en la combinación (5) de NCh3171 lo amplificaría **un 40 % de más**. NCh3171
además se cuida: «Para la definición específica del efecto del terremoto, E, ver normas de diseño según
corresponda» — o sea, **NCh3171 no define E**, lo delega. Esa es exactamente la «inconsistencia» de la
que se queja el **Anexo B B.1** de NCh2369.

Estructura del post 3: NCh3171 pone el andamio de gravedad y viento; NCh2369 §4.5 reemplaza la rama
sísmica; y el Anexo B explica por qué.

### 5.21 El «1,4» existe, pero es de NCh3171 y apunta a una edición muerta

**Excepción 9.1 f)** de NCh3171:2017: «En el caso de la combinación (ii) del método de diseño por cargas
últimas de **NCh2369:2003, 4.5**, el factor "b" de amplificación de la carga sísmica para el diseño de
estructuras de acero se debe considerar igual a **1,4**».

Tres correcciones de una sola frase, y cierra el §5.12:

1. El 1,4 está en **NCh3171**, no en NCh2369 §4.5.
2. No tiene nada que ver con conexiones: es el factor «b» de amplificación de la carga sísmica.
3. Remite a **NCh2369:2003**, edición que la 2025 reemplazó. La §4.5 de la 2025 **no tiene** una
   «combinación (ii)» ni un factor «b». **La excepción f) quedó colgando.**

Es un hallazgo publicable por sí solo, y explica de dónde venía el mito del «1,4 de §4.5 en conexiones»
que arrastraba el reporte del `modelo_base`.

### 5.22 NCh3171 también exige estudio especial para zona montañosa

Regla de cierre de §9.1.1: **«En zonas donde la presencia de viento y nieve no es eventual, por ejemplo,
zonas montañosas o ubicadas en las regiones XI o XII, se deben estudiar combinaciones especiales que
reemplacen las combinaciones (3b), (4) y (5), anteriormente indicadas, pero que no sean menores que las
originales.»**

Con esto son **dos normas independientes** exigiendo un estudio de combinaciones para este sitio:
NCh2369 §4.5.1 por alta montaña, y NCh3171 §9.1.1 por zona montañosa. La «deuda de NCh431» queda
doblemente cubierta por texto normativo, y el post 3 tiene su columna vertebral.

Nota práctica: la exigencia es que las combinaciones especiales **no sean menores que las originales**,
así que las (3b), (4) y (5) siguen siendo el piso y el estudio solo puede subir.

Y una regla que poda el árbol de combinaciones: **sismo y viento se investigan por separado**, «no es
necesario considerar que actúan simultáneamente» — vale igual en §9.1.1 y en §9.2.1.

### 5.23 Dos cosas del ASD de NCh3171 que cambian el trabajo, y una errata confirmada

**No hay aumento de tensiones admisibles.** El cierre de §9.2.1 lo prohíbe salvo que la norma de material
lo justifique «por la rapidez o la duración de la carga». El clásico aumento de un tercio por viento o
sismo no aplica: la reducción ya está en los factores 0,75 y 0,6 de las propias combinaciones.

**La verificación de servicio tiene combinaciones propias.** El Anexo B de NCh2369 reconoce que
deformaciones, vibraciones y fatiga se verifican con combinaciones de servicio «en general equivalentes
al método ASD», y §9.2.1 d) además permite **omitir las combinaciones (7) y (8)** en el cálculo de
estabilidad de fundaciones y tensiones del suelo. Esto es lo que el `modelo_base` de Skills_SAP no
tiene: marca LRFD y ASD **ambos como *strength*** y nunca llama `SetComboDeflection`.

**Errata interna confirmada.** El wiki de `material_teorico` la marcaba como sospecha y se verifica en el
impreso: **§9.2.2 y la regla de cierre de §9.2.1 citan «(5), (6) y (7)»**, pero **§9.2.1 numera 5a/5b y
6a/6b**. La norma remite a rótulos que no existen. Al implementar hay que decidir —y declarar— si «(6)»
significa 6a, 6b o ambas. Para nuestro caso importa: la **regla de montaña en ASD reemplaza «la
combinación (6)»**, y 6b es justamente la que trae `0,75E + 0,75S`.

### 5.24 El K_zt de la loma es mucho más grande de lo que el plan estimaba, y da vuelta la tesis del post 1

Con la Figura 3 ya legible se puede evaluar la loma propuesta: **cima 2D, exposición C, H = 40 m,
L_h = 120 m, x = 0** (galpón en la cresta), y **z = 8,0 m** (altura de alero, que es la que usa el q_h de
un techo a dos aguas de 10°).

Condiciones de §5.6.1: el galpón está en la mitad superior ✅ · H/L_h = 40/120 = **0,333 ≥ 0,2** ✅ ·
H = 40 m ≥ 4,5 m para exposición C ✅. Aplica, y como 0,333 < 0,5 no entra el tope de §5.6.2.

| Paso | Cuenta | Valor |
|---|---|---|
| K₁ | 1,45 × (40/120) | **0,4833** |
| K₂ | 1 − 0/(1,5 × 120) | **1,0000** |
| K₃ | e^(−3 × 8/120) = e^(−0,2) | **0,8187** |
| **K_zt** | (1 + 0,4833 × 1,0 × 0,8187)² = 1,3957² | **1,948** |

El plan estimaba 1,1–1,4. Es **1,95**: casi el doble de presión.

**Y eso da vuelta el titular del post 1.** La versión que el plan proponía era «el aire enrarecido regala
un 36 % y la loma se lo devuelve entero». La cuenta real es mejor: K_e ≈ 0,64 y K_zt ≈ 1,95 dan
**0,64 × 1,95 = 1,25**. O sea, el galpón del altiplano en una loma se diseña con **un 25 % más** de
presión que el mismo galpón en terreno plano a nivel del mar — no con menos. Quien aplique solo el K_e
que «todo el mundo conoce» diseña con **la mitad** de la presión que corresponde (0,64 contra 1,25).

**Cuidado al elegir la geometría del cerro**: K_zt es muy sensible. Con H = 20 m y L_h = 120 m
(H/L_h = 0,167) **no se cumple la condición 2 y K_zt = 1,0 de golpe** — un acantilado de discontinuidad
que también es contenido del post. La geometría del cerro es un parámetro de proyecto que hay que
declarar y congelar con el usuario, no un detalle.

### 5.25 ¿h en el alero o altura media? — **resuelto: alero**, y el post publicado estaba bien

La Tabla 5 viene precedida de: «La presión de velocidad, a la altura media del techo se calcula como
**q_h = q_z evaluada […] usando K_z a la altura media del techo h**». Pero
`apuntes/ejemplo-viento-galpon-nch432.mdx` resolvió su galpón «con **h medido en el alero**».

Para nuestro galpón, con θ = **10°** justo en el límite de la excepción habitual (θ ≤ 10° permite tomar
h = altura de alero), la diferencia es:

| | h = alero | h = altura media |
|---|---|---|
| h | 8,00 m | 9,06 m |
| K_z (exp. C) | **0,95** | 0,98 (interpolado) |
| K₃ del K_zt | 0,8187 | 0,7975 |
| **K_zt** | **1,948** | 1,919 |

**Resuelto el 2026-08-12** con la definición **§3.2** (pág. 2, PDF 10) —prosa, que la regla de
`CLAUDE.md` sí permite leer de la capa de texto—:

> «**3.2 altura media del techo, h**: promedio de la altura del alero de la techumbre y la altura hasta
> el punto más alto de la techumbre. **Para ángulos de techo menores o iguales a 10 grados, se acepta
> utilizar la altura media del techo como la altura del alero del techo**»

Y la simbología (pág. 7, PDF 15) lo repite: «h = altura media del techo de un edificio o altura de otra
estructura, **excepto que la altura del alero se utiliza para un ángulo de techo θ menor o igual a
10 grados**». La **§3.3** define además `h_e` (altura del alero) y aclara que si varía a lo largo del
muro se usa la altura promedio.

Nuestro θ = **10°** entra en el «≤ 10 grados». Por lo tanto **h = h_e = 8,00 m**, se mantienen
**K_z = 0,95** y **K_zt = 1,948**, y `ejemplo-viento-galpon-nch432.mdx` —que también es θ = 10° y midió
h en el alero— **estaba correcto**. No hay corrección que hacer y los dos posts quedan alineados.

**Errata menor confirmada**: la Nota 5 de la Tabla 5 remite a «Tabla 4» cuando habla de las alturas de la
propia Tabla 5.

### 5.26 La Tabla 4 no llega al altiplano — hay que salirse a la Nota 2

La tabla de K_e termina en **1 800 m**, y sobre eso dice «**ver Nota 2**». Nuestro sitio está a
**3 800 m**, o sea **más del doble** del último valor tabulado. Quien busque su elevación en la tabla no
la encuentra, y tiene que usar la fórmula de la Nota 2:

$$K_e = e^{-0,000119 \cdot z_e} = e^{-0,000119 \times 3800} = e^{-0,4522} = \mathbf{0,6362}$$

Confirma el ≈ 0,64 que se venía estimando, ahora con procedencia. Y es material del post 1: **el
altiplano chileno se sale de la tabla de su propia norma de viento.**

Nota práctica que conviene decir en el post: la **Nota 1** permite tomar `K_e = 1,00` «de manera
conservadora». En el altiplano eso significa diseñar con un **57 % más** de presión de la que
corresponde (1/0,6362). Es conservador, sí, pero es mucho acero.

### El q_h del galpón, con lo leído hasta ahora

Con `I = 1,00` (categoría II, **pendiente confirmar en la Tabla 2**), `K_z = 0,95` (exp. C, h = 8,0 m),
`K_zt = 1,948` y `K_e = 0,6362`:

$$q_h = 0,613 \times 1,00 \times 0,95 \times 1,948 \times 0,6362 \times V^2 = \mathbf{0,7217\,V^2}\ \text{N/m}^2$$

Y contra el **mismo galpón en terreno plano a nivel del mar** (K_zt = K_e = 1), la razón es exactamente
`K_zt · K_e = 1,948 × 0,6362 = ` **1,239**. El 25 % de más del §5.24, ahora con la ecuación en la mano.

**Cerrado con V = 30 m/s** (Tabla 1, zona **I-B**: latitud 17°29'–27°22'S y altitud ≥ 2 000 m, que es
donde cae una faena de altiplano de Tarapacá o Antofagasta):

$$q_h = 0,613 \times 1,00 \times 0,95 \times 1,948 \times 0,6362 \times 30^2 = \mathbf{650\ \text{N/m}^2 = 0,650\ \text{kPa}}$$

Chequeo cruzado con la NOTA 1 de la Tabla 1, que define `p₀` como el q_z con K_z = K_zt = K_e = 1:
`p₀ = 0,613 × 900 = 551,7 ≈ 552` ✅ tabulado. Entonces
`q_h = p₀ × K_z·K_zt·K_e = 552 × (0,95 × 1,948 × 0,6362) = 552 × 1,177 = 650 N/m²`. Las dos vías cierran.

**El titular del post 1, ya como número:**

| Quién calcula | q_h | |
|---|---|---|
| Aplica K_z, K_e **y K_zt** (correcto) | **0,650 kPa** | |
| Aplica K_z y K_e, **olvida K_zt** | 0,334 kPa | **51 %** de lo que corresponde |
| Toma K_e = 1,00 «conservador» y olvida K_zt | 0,525 kPa | 81 % |
| Referencia p₀ (los tres factores = 1) | 0,552 kPa | |

La razón entre la primera y la segunda fila es exactamente **K_zt = 1,948**.

### 5.27 Zona sísmica verificada — se sostiene la 2, pero hay que nombrar la comuna

La Tabla 1 de NCh432 ubica la zona **I-B** entre las latitudes **17°29'S y 27°22'S** — o sea Arica,
Tarapacá y Antofagasta. Pero la **zona sísmica** de NCh2369 se asigna **por comuna**, y en el norte de
Chile la zonificación baja hacia la cordillera: la costa es zona 3, la depresión intermedia zona 2, y el
**altiplano y la alta cordillera suelen ser zona 1**.

Si el sitio resulta **zona 1**, `A_r` pasa de **0,42 g a 0,28 g** (Tabla 3 de NCh2369) — un **33 % menos**
de demanda sísmica. Eso **refuerza** la tesis del post 10 (el viento dimensiona la diagonal) pero cambia
todos los números sísmicos de la serie.

**Verificado el 2026-08-12** leyendo la **Tabla 2 de NCh2369** (pág. 50 / PDF 56), que **no estaba
transcrita al wiki**. Las tres regiones del norte:

| Región | Zona 3 | Zona 2 | Zona 1 |
|---|---|---|---|
| Arica y Parinacota | Arica · Camarones | General Lagos · Putre | — |
| **Tarapacá** | Alto Hospicio · Huara · Iquique · Pozo Almonte | **Camiña · Pica** | **Colchane** |
| **Antofagasta** | Antofagasta · María Elena · Mejillones · Taltal · Tocopilla | **Calama · Sierra Gorda** | **San Pedro de Atacama** |
| Atacama | Alto del Carmen · Caldera · Chañaral · Copiapó · Huasco · Vallenar | Diego de Almagro · Tierra Amarilla | — |
| Coquimbo | todas las comunas listadas | — | — |

La sospecha era correcta: en el altiplano conviven **zona 1 y zona 2**. Pero la **zona 2 se sostiene**
si se nombra la comuna.

**Resolución**: el sitio se declara en la **comuna de Pica, Región de Tarapacá**. Es **zona sísmica 2**
(A_r = 0,42 g), su latitud cae en 17°29'–27°22'S y su territorio sube sobre los 2 000 m, o sea **zona de
viento I-B con V = 30 m/s**. Los dos parámetros de sitio quedan consistentes entre las dos normas y con
una faena real.

**Detalle didáctico para el post 5**: **Pica es zona 2 y Colchane —su vecina altiplánica— es zona 1**.
Cruzar el límite comunal cambia A_r de 0,42 g a 0,28 g, un **33 % menos** de demanda, sin que cambie
nada del sitio ni de la estructura.

### 5.28 El galpón es rígido por definición — la duda del G se cierra sin análisis de frecuencia

El plan marcaba como riesgo que «el marco a momento con T\* ~ 0,9 s podría no calificar de rígido y
exigir G_f de estructura flexible». **§5.9.2 lo resuelve**: «Los edificios de **baja altura**, tal como se
definen en cláusula 3, **se pueden considerar rígidos**». Con h = 8,0 m (≤ 18 m, y ≤ la menor dimensión
horizontal de 24 m) el galpón es de baja altura, así que **G = 0,85** sin necesidad de determinar la
frecuencia.

Y hay una consecuencia que conviene decir en el post: **§5.9.4** manda que cuando el factor de ráfaga
viene **combinado** con los coeficientes de presión —GC_p, GC_pi, GC_pf, que es el caso de la
**cláusula 7 (envolvente)** por la que va este galpón— **el G no se aplica por separado**. O sea, el
0,85 de §5.9.2 no multiplica nada en nuestro camino de cálculo: ya está dentro del GC_pf de la Figura 12.
Es un error clásico aplicarlo dos veces.

Nota de rigor para el post: §5.9.1 **prohíbe** estimar la frecuencia con fórmulas geométricas del tipo
`T = 0,1N`. Si el galpón no fuera de baja altura, habría que sacar la frecuencia del modelo — que es
justo lo que la serie tiene, en dos motores.

---

### 5.29 El arriostramiento de techo: la obligación es normativa, el dibujo es informativo

**§12.1.2 es disposición normativa** y obliga a que todo edificio con marcos transversales tenga
arriostramiento **continuo** de techo. Su única excepción —«edificios sin puente-grúa en que las
cargas permanentes **sólo** provienen del peso propio»— **no aplica acá**: hay 0,35 kPa de carga
muerta superpuesta de techo y 0,12 kPa de muro.

Pero el **cómo** viene de la **Figura A.2 del Anexo A, que se titula «(informativo) — Detalles
tradicionales»**. Ese contraste es contenido del post 5: la topología del arriostramiento la
define un anexo informativo, no la cláusula.

Y la figura dice algo que se lee mal a primera vista: **lo que se vacía en el centro son las
aspas, no las líneas**. Los puntales recorren el largo completo en todas las líneas; las
diagonales forman un anillo perimetral. En este galpón: **28 puntales** (7 líneas × 4 vanos) y
**16 paneles** de diagonales (bandas de alero en los 4 vanos + bandas de hastial en los extremos).

### 5.30 NCh432 exime la torsión de este galpón, y el marco de momento tiene su propia excepción

Dos exenciones que se ganan por lectura, no por criterio:

- **§7.3.2, excepción 1**: no se requiere diseño para los casos de torsión en «edificios de un
  piso con `h` menor o igual a **9 m**». Con `h = 8,0 m` la Figura 13 completa queda fuera. Las
  causales 2 y 3 (estructura ligera; diafragmas flexibles) también aplicarían.
- **§7.3.3**: el corte horizontal total no puede ser menor que el calculado despreciando el
  viento sobre el techo, **excepto en edificios que usan marcos de momento para el SPRFV**. Acá
  la exención vale en la dirección **transversal** (marcos) pero **no** en la longitudinal
  (arriostrada). Es un párrafo que casi nadie escribe.

Y una trampa que hay que declarar: **§7.3.7 (Ecs. 9 y 10) suena a este galpón** —«edificios con
marcos transversales y techos inclinados»— pero su alcance son **edificios abiertos o
parcialmente cerrados**. El nuestro es cerrado y va por la Ec. (7).

### 5.31 El 90 % de masa modal está acotado al análisis horizontal

**§5.6.1** acota el AME al «espectro de diseño **para la dirección horizontal**», y **§5.6.2**
pide el 90 % «en cada dirección de análisis» — de ese análisis. La vertical va por **§5.7.1**,
con **fuerzas estáticas equivalentes** `F_V = ±C_V·P`, y el modal vertical de **§5.7.2** es la
*alternativa*: solo ahí aplicaría el 90 % vertical.

Importa porque este modelo **no converge en masa vertical**: 65,1 % con 60 modos y 75,4 % con
150. Confundir el alcance manda a una persecución imposible.

Con suelo B: `C_V = 1,2 × 1,00 × 0,42 × 1,00 = ` **0,504**, y `F_V = 0,504 × 674,861 = `
**340,130 kN**.

Queda una salvedad viva, y hay que declararla en el post: **C5.7.1** dice que «cuando la
flexibilidad de los componentes frente a cargas verticales sugiera la posibilidad de que ocurran
deformaciones verticales relevantes **es preferible hacer análisis dinámico**» — y nuestro techo
lo es (modo 2, T = 0,3915 s, 48,9 % de masa vertical). Pero esa vía exige el 90 % que no se
alcanza. Se adopta §5.7.1 y se dice por qué.

### 5.32 El punto de cruce de la X es un sumidero de modos

Con las crucerías modeladas según §8.6.4 —conectadas en el cruce, con **una sola** diagonal
continua— aparecen **39 modos locales entre los primeros 60**, que juntan el **0,48 %** de la
masa. En el primero de ellos el nodo de cruce da `U₁ = 1,377014` contra ~0,003 en todo el resto
de la estructura.

La causa es física y vale como párrafo: en un análisis lineal ese punto queda sostenido solo por
la rigidez **flexional** de las diagonales, porque falta la **rigidez geométrica** de la diagonal
traccionada. Justamente lo que §8.6.4 permite *suponer* para el pandeo —«dicho punto se puede
considerar fijo en la dirección perpendicular al plano … **para los efectos de determinar la
longitud de pandeo**»— es una hipótesis de diseño, **no una licencia para poner un apoyo**.

Consecuencia práctica: el modo longitudinal real está en el **puesto 41**. Quien corra 12 o 30
modos no solo incumple §5.6.2 (46,7 % de masa con 30), se lleva un **T\* equivocado**: el del
modo 8, 0,269 s en vez de 0,161 s.

### 5.33 El prismático equivalente no es conservador en un marco hiperestático

Tentación al simplificar: modelar prismático y confiar en que «si la sección chica cumple, la
real —más grande hacia la rodilla— cumple mejor». **Es falso**, porque al agrandar la rodilla la
rodilla *atrae* más momento. Marco tipo, misma alma y mismas alas:

| | T₁ (s) | δ_x alero (m) | M₃ alero (kNm) | M₃ cumbrera (kNm) |
|---|---|---|---|---|
| **tapered 350↔800** | 0,370397 | 0,158560 | **463,088** | **145,537** |
| prismático d = 350 | 0,677884 | 0,648948 | 376,870 | 254,559 |
| prismático d = 575 | 0,427494 | 0,217608 | 376,706 | 254,766 |
| prismático d = 800 | 0,317630 | 0,103877 | 376,485 | 255,045 |

Entre los tres prismáticos **el momento no se mueve**: cambiar la rigidez de forma uniforme no
redistribuye nada. El tapered sí, y se lleva **+23 % al alero** y **−43 % a la cumbrera**. Ningún
peralte único reproduce ambas.

La simplificación correcta no es prismatizar el análisis: es **reducir la malla y las estaciones
de verificación**. Cortando el dintel en las uniones con el arriostramiento quedan **7 secciones
en vez de 17**, con el análisis intacto.

### 5.34 La discretización del tapered la controla la deriva, no la flecha

Contra `N = 36` como referencia, con base articulada:

| N | T₁ | flecha de cumbrera | **deriva de alero** |
|---|---|---|---|
| 1 | +16,31 % | +2,87 % | **+37,80 %** |
| 2 | +4,38 % | +0,37 % | **+9,23 %** |
| 3 | +1,91 % | +0,16 % | +3,98 % |
| 6 | +0,46 % | +0,042 % | +0,95 % |
| 9 | +0,196 % | +0,019 % | +0,40 % |

Se esperaba lo contrario —que la flecha convergiera más lento que el período—. La magnitud lenta
es una tercera: **la deriva**, y con un solo tramo se va casi un 38 %.

El porqué es físico: con base articulada el momento de la columna es cero abajo y máximo en el
alero, así que la rigidez que gobierna es la del extremo donde `d = 800`, no la del promedio
`d = 575`. La flecha del dintel la domina la zona central, donde el peralte real anda cerca del
promedio — por eso casi no se entera.

### 5.35 Con R = 5 el corte basal cae bajo el mínimo, y la Ec. (14) se lleva el R prometido

Con `P = 674,861 kN`, `Q₀^mín = 70,860 kN` (Ec. 12):

| Ruta | R\*_X | R\*_Y | Q₀X | Q₀Y | Q₀^máx | Veredicto |
|---|---|---|---|---|---|---|
| **§12.2, R = 4** (diseño) | 4,000000 | 3,830163 | 86,960 kN | 130,257 kN | 224,907 | dentro / dentro |
| fila 5.5, R = 5 (ilustrativa) | 5,000000 | 4,109783 | **69,568 kN** | 121,395 kN | 187,422 | **bajo el mínimo** / dentro |

Con `R = 5` el corte transversal queda **1,8 % bajo `Q₀^mín`**. §5.12 obliga a amplificar todo por
`70,860/69,568 = 1,018573`, y la Ec. (14) recorta el R₁ efectivo de **5,00 a 4,908819**. La fila
5.5 promete un R que el mínimo se come antes de empezar — buen cierre para el post 5.

### 5.36 La dirección arriostrada se lleva más corte que la de marcos

`Q₀Y = 130,257 kN` contra `Q₀X = 86,960 kN`: **+49,8 %** en la dirección que es más rígida. No es
un error, es dónde cae cada `T*` en el espectro:

| | T\* | S_aH de referencia | S_a de diseño (R = 4) |
|---|---|---|---|
| X transversal | 0,8526566 s | 0,6306425 | 0,1576606 |
| Y longitudinal | 0,1610609 s | **1,3975929** | 0,3648912 |

**Corrección del 2026-08-12 (2.ª sesión): no hay «meseta».** Al dibujar el espectro para el post 10
se midió que el pico de la Ec. (3) para este sitio está en **T = 0,2703 s** con
**S_aH = 1,6828**, y que el T\* longitudinal (0,1611 s) está sobre la rama **ascendente**, al
**83,1 %** de ese máximo; el transversal ya bajó al **37,5 %**. La razón entre los dos es **2,22**.
La conclusión no cambia, pero sí una consecuencia que se deducía mal: como el T\* longitudinal
está en la rama que sube, **rigidizar esa dirección baja el S_aH**, no lo deja igual.

El T\* longitudinal cae cerca del pico del espectro y además **6,8 % bajo el codo** de la Ec. (1b)
(`C_r T₁ = 0,1728 s` con R = 4), lo que le baja el R\* un 4,2 % adicional. Rigidizar la dirección
arriostrada la castiga dos veces.

### 5.37 La envolvente: la nieve manda casi todo, y la diagonal la gobierna el sismo

79 combinaciones LRFD (63 de gravedad y viento por NCh3171 §9.1.1, 12 sísmicas por NCh2369
§4.5.1 con la simultaneidad de §4.5.2, 4 de la rama ilustrativa con R = 5). Gobernantes:

| Miembro | M₃ máx (kNm) | manda | P comp. (kN) | manda | P tracc. (kN) | manda |
|---|---|---|---|---|---|---|
| Columna, base | 158,321 | `G3A_B` | −190,140 | `G3A_B` | +13,964 | `G6_TXPP` |
| **Columna, alero** | **633,284** | **`G3A_B`** | −180,384 | `G3A_B` | +21,562 | `G6_TXPP` |
| **Dintel, alero** | **−633,206** | **`G3A_B`** | −136,003 | `G3A_B` | +24,780 | `G6_LYNP` |
| Dintel, medio | 176,334 | **`G3A_I`** | −148,067 | `G3A_B` | +30,587 | `G6_LYNP` |
| Dintel, cumbrera | 207,932 | `G3A_B` | −137,454 | `G3A_B` | +32,502 | `G6_LYNP` |
| Puntal de alero | 1,686 | `E3P_A` | **−16,113** | **`E2N_B`** | **+28,248** | **`E2P_A`** |
| Puntal de cumbrera | 1,686 | `E3P_A` | −96,087 | `G3A_B` | +14,959 | `G6_TXNP` |
| **Media diag. de muro** | −0,384 | `E3P_A` | **−39,895** | **`E2P_A`** | **+23,651** | **`E2N_B`** |
| Media diag. de techo | 2,014 | `E3P_A` | −28,234 | `G3A_B` | +15,007 | `E2N_B` |
| Pilar de hastial | −23,432 | **`G4_BLYPN`** | −13,504 | `E3P_A` | 0,0 | — |

`G3A_B` = `1,2D + 1,6S` balanceada · `G3A_I` = ídem desbalanceada · `G6_*` = `0,9D + 1,6W` ·
`E*` = las sísmicas · `G4_*` = `1,2D + 1,6W + 0,5S`.

**Confirmado**: con `S = 1,20 kPa` y el sismo dividido por `R* = 4`, la gravedad con nieve gana
cómodo en la estructura principal. La envolvente sísmica llega al **53 %** del momento de alero
(337,165 contra 633,284 kNm). Y **la nieve desbalanceada gobierna el dintel medio** — el caso que
nadie corre.

**Corrige el plan**: la hipótesis del post 10 era que «la diagonal la dimensiona el viento, porque
E entra dividido por R\* y W entra multiplicado sin dividir por nada». **Es al revés**: la
compresión sísmica en la media diagonal de muro es **39,895 kN** contra **34,233** de la
envolvente de gravedad y viento, o sea el sismo gana por **16,5 %**. El razonamiento falla porque
el T\* longitudinal cae en la meseta del espectro (§5.36) y la dirección arriostrada se lleva
130,3 kN de corte basal contra 87,0 de la transversal.

La tesis del post 10 sobrevive, pero por otra razón: la demanda es baja para el cajón, y lo que lo
deja fuera **no es la resistencia sino λ_md** (§5.15). El post pasa de «el viento dimensiona» a
«ni el viento ni el sismo dimensionan: dimensiona la esbeltez local sísmica».

### 5.38 La deriva NO reprueba: pasa al 94,6 % — y ahí está la historia

El plan daba por hecho que «la deriva de §6.3 reprueba el marco articulado». **No reprueba.**

Desplazamientos con el espectro de **referencia** (§6.1: sin R\*, con `(0,05/ξ)^0,4` y con `I`) y la
simultaneidad de §4.5.2:

| | Valor | Límite `0,015·h` | Ratio |
|---|---|---|---|
| **Alero, marco 4** (máximo) | **0,113504 m** | 0,120 | **0,9459** |
| Alero, marco 2 | 0,113480 m | 0,120 | 0,9457 |
| Alero, marco 3 | 0,112442 m | 0,120 | 0,9370 |
| Cumbrera, marco 3 | 0,112605 m | 0,151739 | 0,7421 |
| Dirección Y, alero | 0,006912 m | 0,120 | 0,0576 |

**Cumple con 5,4 % de margen**, sin necesidad de invocar la excepción del doble.

Chequeo de consistencia que valida el par referencia/diseño: bajo `RSX_R4` el mismo nodo da
**0,028105 m**, y `0,112442 / 0,028105 = 4,0009 ≈ R*_X = 4,0` ✅.

**La historia del post cambia de «reprueba» a «pasa raspando», que es mejor**, por tres razones:

1. **El mismo `0,015·h` de §6.3 es el gatillo del P-Delta de §6.4.** Estamos al 94,6 %: a un 5 % de
   tener que correr segundo orden. Y `C6.4` avisa que el P-Delta «rara vez tiene importancia en
   estructuras arriostradas, pero **puede serlo en estructuras de marcos resistentes a momento**».
2. La dirección **arriostrada va sobrada** (5,8 % del límite) mientras la de marcos está al borde —
   el espejo exacto de §5.36, donde la arriostrada se llevaba **más** corte basal.
3. El resultado **depende de la discretización del tapered**: §5.34 midió que con N = 1 la deriva se
   sobreestima 37,8 % y con N = 2 un 9,2 %. Con la malla de 4 tramos que se adoptó, cualquiera de
   esos errores habría dado un «reprueba» falso.

**Trampa de lectura, y hay que decirla**: **§12.5.9** obliga a considerar «efecto P-Delta para todos
los casos de carga y análisis» — pero **§12.5 es *Sistemas de almacenamiento*, no galpones**.
`C12.5.9` habla de «la carga almacenada» y de *leaning columns*, y su Figura C-6 es el
arriostramiento de un rack. Citarla para un galpón es leer mal la sub-cláusula.

### 5.39 El canal sí está en AISC 360-22 — y son los tirantes los que habilitan la ecuación

La costanera se declaró **canal C simple, verificado con AISC 360-22**, para no depender de AISI S100
(que no está en PDF en ninguno de los dos equipos). La duda razonable era si 360-22 cubre el canal, o
si el canal es de los perfiles que la especificación deja fuera. **Lo cubre, y la tabla de selección
lo dice con dibujo.**

En la **Tabla User Note F1.1** (pág. 16.1-51) el pictograma de la fila **F2 son dos figuras: una doble
T y un canal**, ambos con ala compacta y alma compacta. Y la fila **F6** —eje menor— también dibuja
canal. O sea:

| Eje | Sección | Estados límite |
|---|---|---|
| Mayor | **§F2** | fluencia y **LTB** |
| Menor | **§F6** | fluencia y **pandeo local del ala** |

La combinación biaxial sale de **§H1.1** (pág. 16.1-82). Con `P_r = 0` la **Ec. (H1-1b)** se reduce a

`M_rx/M_cx + M_ry/M_cy ≤ 1,0`

que es exactamente la suma de razones sobre la que descansa la tesis del post 9.

**Lo que hay que mirar dos veces, y es el hallazgo:**

1. **La condición de aplicabilidad de §H1.1 no es la simetría, es el arriostramiento.** El texto dice
   «doubly symmetric members **and singly symmetric members constrained to bend about a geometric axis
   (`x` and/or `y`)**». Un canal es simplemente simétrico y su centro de corte cae **fuera del alma**:
   cargado sobre el faldón, si nada lo sujeta, **no flecta en torno a un eje geométrico — se tuerce**,
   y entonces §H1.1 no le aplica. Los **tirantes** de la tesis del post 9 dejan de ser un truco para
   bajar el momento débil: son **la condición que hace legal la ecuación**. Sin ellos hay que irse a
   §H2, o a §H3 si se quiere contar la torsión.
2. **El ala tiene que salir compacta o la ruta se cae.** Las filas **F3, F4 y F5 dibujan solo doble
   T**: no hay sección de canal para ala no compacta o esbelta, ni para alma esbelta. Un canal que no
   entre en F2 no tiene capítulo propio — cae a **§F12, «Unsymmetrical shapes»**, que manda revisar
   *todos* los estados límite. **Eso restringe el predimensionamiento de la costanera**: hay que
   elegir `b_f/t_f` y `h/t_w` compactos a propósito, y decirlo.
3. **El bono de `C_b` de §H1.2 no aplica.** La Ec. (H1-2) que permite multiplicar `C_b` por
   `√(1 + α·P_r/P_ey)` bajo tracción concurrente está escrita **solo «for doubly symmetric members»**.
   El canal queda fuera.

**Consecuencia para el plan**: el post 9 sigue en `acero` con `chapter: "Cap. F — Flexión"`, pero su
cierre ya no es «pon dos tirantes y el momento débil se divide por nueve». Es más fuerte: **sin
tirantes la verificación que todo el mundo escribe no es aplicable**, y la que sí lo es (§H2 / §H3)
nadie la corre.

### 5.39-bis Inventario del `.sdb`, para que no quede colgando

Leído del modelo abierto el 2026-08-12, porque el post 0 lo publica y no constaba en ninguna parte:

| | |
|---|---|
| SAP2000 | **v27.1.0** · unidades **6** = kN, m, C |
| Patrones de carga | **11** — `DEAD`, `DSD`, `LR`, `SBAL`, `SUNBI`, `SUNBD`, `WTXP`, `WTXN`, `WLYP`, `WLYN`, `WPI` |
| Casos | **19** — los 11 estáticos, `MODAL`, seis espectrales (`RSX/RSY` × `R4`, `R5`, `REF`) y `EV` |
| Combinaciones | **85** — las 79 de diseño más 6 envolventes |
| Archivo | `galpon_altiplano.sdb`, **97,9 KB**, guardado bloqueado; los resultados viven en los `.Y0*` aparte |

La copia publicada es `public/galpon-altiplano-la-serie/galpon-altiplano.sdb`.

### 5.40 El J de SAP no es Σbt³/3 — medido en las cuatro secciones extremas

Circulaba en la conversación un «3,2 %» de discrepancia entre la constante torsional que reporta
`GetSectProps` y el `Σbt³/3` de manual, **sin registro de dónde salía**. Se midió contra el modelo
(2026-08-12, SAP2000 v27.1):

| Sección | d [mm] | J de SAP [mm⁴] | Σbt³/3 con h = d − 2t_f [mm⁴] | Diferencia |
|---|---|---|---|---|
| COL_1 | 406,25 | 271 980,7 | 280 962,0 | **−3,197 %** |
| COL_4 | 743,75 | 296 280,7 | 305 262,0 | **−2,942 %** |
| DIN_1 | 725,00 | 294 930,7 | 303 912,0 | **−2,955 %** |
| DIN_3 | 425,00 | 273 330,7 | 282 312,0 | **−3,181 %** |

O sea: **entre 2,9 % y 3,2 % por debajo**, y el signo importa — SAP reporta **menos** rigidez
torsional que la fórmula de manual, no más. La diferencia no es un error de ninguno de los dos: la
suma de rectángulos ignora el material de los encuentros ala-alma y el redondeo interno del
programa. Es sistemática y crece cuando el alma pesa poco en el total.

**Consecuencia operativa**: `GetSectProps` es la fuente única, y ese número se escribe al
`stations.json` que consume rukan. Si un motor usa `Σbt³/3` y el otro el `J` de SAP, el contraste
arranca con un 3 % de desajuste en todo lo que dependa de la torsión — y el LTB del post 8 depende.

**No confundir con el assert de §6.2**, que verificó `GetSectProps` contra el cálculo a mano de una
doble T **en los nueve valores geométricos** (A, I₃₃, I₂₂, S, Z, r). Ese cerró al último dígito. El
`J` es la única propiedad que **no** coincide, y por eso vale la pena decirlo aparte.

### 5.41 La tesis del post 1 hubo que afilarla: el panorama ya había hecho el K_zt

Al escribir el post 1 apareció un solapamiento que el plan **no** había previsto. El plan declaraba
que `apuntes/nch432-cargas-de-viento.mdx` «ya ejemplificó K_e en el altiplano» y que por eso en el
post 1 el K_e sería contexto y la tesis sería el K_zt. Pero su **§10, «La misma nave en el
altiplano»**, hace bastante más que el K_e:

- el K_e a 3 400 m, con la exponencial de la Nota 2;
- una nota de que tomar `K_e = 1,0` «por conservador» cuesta un 50 %;
- **y un ejemplo completo de K_zt sobre colina** (axisimétrica 3D, H/L_h = 0,3, en la cresta),
  que da 1,47 y con el que concluye que «la topografía devuelve, de una sola vez, todo lo que la
  altitud había regalado».

O sea, la tesis original del post 1 —«el K_zt es grande y da vuelta la intuición»— **ya estaba
publicada**, con otro cerro y otro número.

**Lo que quedó como tesis nueva**, y es mejor:

1. **La clasificación del accidente decide más que el K_e, y nadie la revisa.** El mismo cerro
   (H = 40, L_h = 120, en la cresta, exp. C) da **1,948 como cima 2D**, **1,608 como colina
   axisimétrica 3D** y **1,537 como escarpamiento 2D**: un **27 %** de rango. El ejemplo publicado
   usó la fila 3D; el nuestro usa la 2D, y esa sola diferencia de lectura del plano vale más que
   toda la discusión sobre el K_e.
2. **El escalón de §5.6.1.** Con H = 40 m fijo: `L_h = 200 m` → K_zt = **1,581**; `L_h = 201 m` →
   K_zt = **1,000**. Un umbral, no una transición. No estaba en ningún post.
3. **El G que no se multiplica.** §5.9.2 declara rígido al galpón por §3.12 (baja altura), pero
   §5.9.4 prohíbe aplicar el G por separado cuando viene combinado en los `GC_pf` — que es el caso
   de la cláusula 7. **Y el error va del lado inseguro**: multiplicar el 0,85 aparte *baja* la
   presión un 15 %. El post publicado va por el camino direccional de la cláusula 8, donde el G sí
   es explícito, así que el contraste es directo.
4. **De las exenciones de la cláusula 7, solo dos cosas son nuevas.** La torsión de §7.3.2 y los
   mínimos de §7.3.6 **ya están en `ejemplo-viento-galpon-nch432`** — este punto se escribió mal la
   primera vez y la auditoría lo cazó. Lo nuevo es la **asimetría de §7.3.3** (la exención de marcos
   de momento vale en la dirección transversal y no en la arriostrada, porque este galpón tiene
   sistemas distintos en cada eje) y la **trampa de §7.3.7**.

**Y el neto del sitio es +23,9 %, no +25 %.** El 25 % de §5.24 salía de multiplicar los redondeos
(`0,64 × 1,95`). El valor exacto es `K_zt · K_e = 1,948034 × 0,636227 = 1,239392`. Corregido en el
post 0 y acá.

**Lección de proceso**: el deslinde del plan se armó leyendo los *títulos* de las secciones de los
posts publicados, no su contenido. Para los posts 3, 5 y 9 —que también tienen antecesores— hay que
leer las secciones completas antes de fijar la tesis, no después.

### 5.42 Post 3 — el deslinde, hecho ANTES esta vez, y qué queda como tesis

Aplicando la lección de §5.41, se leyó entero el antecesor antes de escribir nada.
**`apuntes/nch2369-panorama-y-combinaciones.mdx`** (secciones 1 a 4) ya agota:

- las cuatro combinaciones de **§4.5.1** (dos ASD, dos LRFD), escritas con `Equation`;
- **`SO` y `SA`** como las dos cargas que NCh3171 no tiene, y el factor **`a`** con su Tabla C-2;
- **§4.5.2 completa**: las tres permutaciones 100/30/30, todos los signos, y el argumento de que
  `E_z` está adentro y no es un caso aparte;
- el **factor 1,5** del Anexo B;
- las categorías y el `I`.

O sea, la tesis que el plan asignaba al post 3 —«NCh3171 y NCh2369 §4.5 no son listas alternativas»
y «§4.5.2 es 100/30/30»— **está publicada**.

**Lo que queda como tesis nueva del post 3**, todo con hallazgo propio en esta memoria:

| # | Qué | Dónde |
|---|---|---|
| 1 | **NCh3171 cede por escrito**: «Cuando las normas de diseño sísmico consideren otras combinaciones… éstas prevalecen». El panorama publicado documenta la remisión en el sentido NCh2369→NCh3171; **la de vuelta no está**. Y la diferencia es un **40 %** en el término sísmico (1,4E contra 1,0E) | §5.20 |
| 2 | **La excepción 9.1 f) quedó colgando**: cita «NCh2369:**2003**, 4.5, combinación (ii), factor b = 1,4», y la edición 2025 no tiene ni esa combinación ni ese factor. De ahí sale el mito del «1,4 de §4.5 para conexiones» | §5.21 |
| 3 | **Dos normas independientes** exigen estudio especial para este sitio: NCh2369 §4.5.1 (alta montaña) y NCh3171 §9.1.1 (zona montañosa), esta última con el piso de «no menores que las originales». La «deuda de NCh431» es en realidad lo que la norma manda hacer | §5.1, §5.22 |
| 4 | **Sismo y viento no se combinan** (§9.1.1 y §9.2.1), que es la regla que poda el árbol | §5.22 |
| 5 | **La errata de numeración del ASD**: §9.2.2 cita «(5), (6) y (7)» y §9.2.1 numera 5a/5b y 6a/6b. Al implementar hay que decidir y declarar qué es «(6)» | §5.23 |
| 6 | **El árbol real**: 11 estados → **79** combinaciones (63 + 12 + 4), con la aritmética de cada rama. Y por qué la sísmica son **12 y no 48**: SAP aplica los casos espectrales con signo ± automático, así que solo se enumera el signo de `E_z`, que es estático | §6.2, script `combos` |
| 7 | **La envolvente**: la nieve desbalanceada gobierna el dintel medio, y al arriostramiento lo gobierna el sismo | §5.37 |

**Estado**: figuras hechas y miradas (`npm run figuras:galpon-combos` →
`arbol-de-combinaciones.svg` y `quien-gobierna.svg`, en
`public/ejemplo-galpon-altiplano-cargas-combinaciones/`). **Falta la prosa del post, su auditoría
y su planilla.** Los datos que la prosa necesita, ya medidos del modelo:

| | kN |
|---|---|
| `DEAD` | 233,657226 |
| `DSD` | 302,963865 |
| **D total** | **536,621091** |
| `SBAL` | 691,2 (= 1,20 × 576, exacto) |
| `SUNBI` | 518,4 (= 0,75 × `SBAL`) |
| `LR` | 172,8 |
| `WTXP` | Fz −192,082392 · Fx −81,939439 |
| `WLYP` | Fz −185,722047 · Fx +10,205652 |
| `WPI` | Fz −57,243097 |

Linealidad verificada contra `Results.BaseReact`: `1,4·D = 751,269527` y
`1,2·D + 1,6·S = 1749,865309`, ambas a **4·10⁻⁷ kN** de la cuenta a mano.

### 5.43 Post 5 — el deslinde más caro de la serie, y la tesis que quedó

Es el post con más antecedentes publicados, y el deslinde se hizo **antes** de fijar la tesis
(§5.41). Se leyeron completos `blog/galpon-liviano-nch2369`, `apuntes/ejemplo-torre-sismica-nch2369`
y `apuntes/ejemplo-torre-deformaciones-nch2369`, y se contrastaron por búsqueda el resto de los
antecedentes. **Cayeron cuatro de las cinco piezas que el plan le asignaba al post.**

| Pieza que el plan le daba al post 5 | Dónde ya está publicada | Veredicto |
|---|---|---|
| Las ocho condiciones de §12.2.1, el R = 4 y el 0,5R₁ | `galpon-liviano-nch2369` — tabla completa de las ocho letras, y la comparación 5.5 vs 5.7 con el **+25 % / −29 %** | **agotada**. El post 5 la **aplica**, no la re-explica |
| La cadena `T* → R* → Q₀ → banda → R₁` | `ejemplo-torre-sismica-nch2369` §§3-6, con las Ecs. (12), (13) y (14) escritas y dos figuras (espectros por dirección, banda por dirección) | **agotada** |
| El codo `C_r·T₁` y la rampa de la Ec. (1b) | `nch2369-espectro-de-diseno`, la cepa, la torre, `ejemplo-fundacion-anclada-nch2369` | **agotada** |
| La deriva de §6.3, su excepción del doble, el gatillo del P-Delta de §6.4 y el chequeo `d_ref/d_dis = R*` | `ejemplo-torre-deformaciones-nch2369`, entero — incluido «el corte se verifica; la deriva se diseña» | **agotada** |
| La NOTA 1 de la Tabla 1 (Categoría por contagio) | `nch2369-panorama-y-combinaciones` L.86, «una regla de contagio» | **agotada**. En el post 5 es una consecuencia de §12.2.1 a), no un hallazgo |

**Lo que sobrevive, y es de lo que se escribe el post:**

1. **La Tabla 7 tiene una sola fila para un edificio con dos sistemas.** Es el complemento exacto y
   opuesto de la torre: allá dos sistemas ortogonales daban **dos filas** (5.1 y 5.3) que casualmente
   compartían R, y el post mostró que el R₁ igual se separa por el período. Acá el marco transversal y
   la crucería longitudinal son sistemas distintos y la Tabla 7 les da **una sola fila**, porque
   clasifica el edificio. Nadie lo ha publicado.
2. **La fila no la elige el ingeniero, y lo hacen dos cláusulas distintas.** §12.1.2 obliga al
   arriostramiento continuo de techo en todo edificio con marcos transversales, salvo los que solo
   cargan su peso propio — así que la fila 5.6 (R = 3) es **casi inalcanzable legalmente** y el «menú
   5.5 contra 5.6» que cuenta `galpon-liviano-nch2369` (L.163-164) no existe en la práctica.
   **Esto corrige un post publicado**, y hay que decirlo con enlace. Encima, si el galpón califica
   como liviano, §12.2 vuelve a elegir por él: «se **debe** evaluar utilizando Tabla 7, punto 5.7».
   Y queda el hueco de §5.6: «con puente grúa y sin arriostramiento continuo» no tiene fila, y cae en
   R = 1,5.
3. **La primera vez en el sitio que el segundo factor de la Ec. (14) no vale 1.** En la torre las dos
   direcciones tenían `Q₀ > Q₀^mín` y el `min(·,1)` era trivial; en `ejemplo-pedestal-anclaje-nch2369`
   y en `ejemplo-fundacion-anclada-nch2369` el R₁ ya corregido entra como **dato declarado**, no
   derivado. Acá se deriva: con R = 5 el corte transversal cae **1,8 % bajo `Q₀^mín`**, §5.12
   amplifica todo por 1,018573 y la Ec. (14) devuelve **R₁ = 4,908819**. La fila que promete el R más
   alto no lo entrega (§5.35).
4. **La deriva al 94,6 % es un resultado del mallado.** §5.38 mide el 94,6 %; §5.34 mide que con
   N = 1 la deriva se sobreestima 37,8 % y con N = 2 un 9,2 %. Con cualquiera de esas dos mallas el
   veredicto habría sido «reprueba» — falso. Es una lección de modelado que ninguno de los dos posts
   de la torre podía tener, porque allá las columnas son prismáticas.
5. **§12.5.9 es de racks, no de galpones** (§5.38). Citarla para exigir P-Delta en un galpón es leer
   mal la sub-cláusula.

**Tesis fijada**: *la Tabla 7 tiene una sola fila para este edificio, y la fila no la elige el
ingeniero* — la eligen §12.1.2 y §12.2, y cuando por fin queda una decisión que tomar (cuál de las
dos rutas), la decide el modelo y no el criterio: con R = 5 el mínimo se come el R prometido.

**Título de trabajo**: `chapter: "Ejemplo — Una sola fila de la Tabla 7 para dos sistemas"`.

### 5.44 Post 10 — el deslinde le costó las dos tesis, y la que queda es un mapa de cláusulas

El deslinde más caro de la serie hasta ahora: **se llevó la tesis principal y la de respaldo**, las
dos que §5.9, §5.10, §5.11 y §5.15 habían dejado escritas. Vale como confirmación de la regla de
§5.41 —leer **completos** los antecedentes, no sus títulos— y como aviso de que en `acero/` el
terreno de las diagonales sismorresistentes ya está muy trabajado.

**Lo que estaba tomado, y por quién:**

1. **`acero/ejemplo-chevron-nch2369.mdx` (2026-07-27) mata la tesis principal.** Sobre un **cajón
   soldado de A36** publica `λ_md = 0,76√(E/(R_y F_y)) = 18,9` —nuestro mismo 18,85—, muestra la
   diagonal que **falla el λ_md mientras pasa la esbeltez global** (`b/t = 35,0` ✗ contra
   `L_c/r = 71,5 ≤ 133,8` ✓), tiene una sección titulada «Las dos puertas de 8.6.3, y las dos
   cerradas» con la exención verificada, y cierra con «diagonales de cajón soldado 200×200×10 —
   **dimensionadas por λ_md, no por resistencia**». Es, palabra por palabra, la tesis que §5.15
   proponía para el post 10.
2. **`blog/galpon-liviano-nch2369.mdx` mata la tesis de respaldo.** Cita §8.6.1 **y §8.8.2**
   textuales y afirma que «el solo-tracción queda permitido, en los planos verticales (§8.6.1) y en
   el techo (§8.8.2)», con el `0,5R₁` y con lo que se pierde al salirse de §12.2. Es la bifurcación
   que §5.10 daba por exclusiva de este galpón.
3. **`acero/ejemplo-diagonal-hss-traccion.mdx` ya agotó §8.6.4** —el cruce de la X como punto fijo,
   con el 53,5 contra 25,1 tonf— y la identidad `1,5π√(E/F_y) ≡ 4,71√(E/F_y)`, que era el hallazgo
   de §5.11. Y **`predimensionamiento-diagonal-arriostramiento.mdx`** ya publicó el `r_min` que era
   la fila «r mínimo de la diagonal» de §4.2.

**Lo que sobrevive, y es lo que el post pasa a ser.** El usuario decidió **reencuadrarlo**: deja de
ser un post de cálculo de una diagonal y pasa a ser el **mapa de a qué cláusula cuelga cada
elemento y qué puerta de salida le queda**. Ese cruce no lo hace ningún post publicado.

| Elemento del galpón | Cláusula | Exige | Puertas de salida |
|---|---|---|---|
| Diagonal de muro (crucería longitudinal) | **§8.6.3** | λ_md (Tabla 9) **y** `1,5π√(E/F_y)` | **solo** `0,7R₁ ≥ 1,0` |
| Diagonal y puntales de techo | **§8.8.4** | los mismos dos | `0,7R₁ ≥ 1,0` **o la máxima carga que el sistema puede transferir** |
| Vigas de marco de momento | **§8.7.3** | λ_md | `0,7R₁ ≥ 1,0`, para **todos** los esfuerzos |
| Cualquiera de ellos, en galpón liviano | **§12.2.2** | ídem | el amplificador se reescribe **`0,5R₁`** |
| Diagonal de muro **solo-tracción** | **§8.6.1**, excepción de §12.2 | — | §8.6.3 **no muerde**: solo aplica a las que «trabajen en compresión» |

**La asimetría §8.6.3 / §8.8.4 es el hallazgo nuevo**, y salió de mirar las dos páginas rasterizadas
en paralelo (PDF 93 y 102, el 2026-08-12): §8.6.3 **no** ofrece la puerta de «la máxima carga
transferible» que §8.8.4 sí ofrece. Ninguna ficha lo registraba y ningún post lo dice.

**El segundo material propio** es el contraste sobre las secciones reales del modelo —la de muro
falla y la de techo pasa— y, sobre todo, **que la gobierna el sismo y no el viento** (§5.37), con la
explicación de §5.36: el T\* longitudinal cae en la meseta del espectro. Ese resultado es de este
modelo y no está publicado en ninguna parte.

**Corrección de rotulado que salió de la Tabla 9 rasterizada** (PDF 104, pág. impresa 98): son dos
filas distintas, y no dicen lo mismo. «Paredes de perfiles rectangulares **conformados en frío
(HSS) o plegados en frío** usados como arriostramientos» → λ = **`b/t`**. «Paredes de perfiles
rectangulares **soldados** usados como arriostramientos» → λ = **`h/t`**. Las dos con
`λ_md = 0,76√(E/(R_y F_y))`. Nuestro cajón es **soldado por planchas** (§3), así que le corresponde
la fila `h/t` y el `R_y = 1,3` de *Plates, Strips, and Sheets*. En una sección cuadrada el número no
cambia, pero la etiqueta sí — y `ejemplo-chevron-nch2369` rotula `b/t` sobre un cajón soldado.

**Tesis fijada**: *el mismo λ_md cuelga de tres cláusulas distintas, y cada una deja abierta una
puerta de salida diferente — la que casi nadie usa es la que §8.8.4 tiene y §8.6.3 no.*

### 5.45 Los cuatro elementos de arriostramiento, corridos — y la puerta que esta vez sí está abierta

Calculado el 2026-08-12 con las cuatro secciones reales del `.sdb`, la geometría leída de
`galpon_altiplano_build.py` y las demandas de §5.37. Acero **A36 de plancha**: `F_y = 250 MPa`,
`E = 200 000 MPa`, `R_y = 1,3` (AISC 341-22 Tabla A3.2, *Plates, Strips, and Sheets*).

Las cuatro secciones son **cajones soldados por planchas** —en el modelo son `SetTube`, con
envolvente exterior `B × B` y espesor `t`—, así que les toca la fila `h/t` de «paredes de perfiles
rectangulares **soldados**» de la Tabla 9 y el **caso 8** de la Tabla B4.1a.

| Constante | Valor |
|---|---|
| `√(E/F_y)` | 28,284271 |
| `√(E/(R_y F_y))` | 24,806947 |
| **λ_md = 0,76√(E/(R_y F_y))** (Tabla 9) | **18,8533** |
| λ_r = 1,49√(E/F_y) (B4.1a **caso 8**, cajón soldado) | 42,1436 |
| λ_r = 1,40√(E/F_y) (B4.1a **caso 6**, HSS conformado) | 39,5980 |
| **λ_r / λ_md** | **2,2353** |
| `1,5π√(E/F_y)` (§8.6.3 y §8.8.4) | 133,2865 |
| `4,71√(E/F_y)` (quiebre de §E3) | 133,2189 — difieren **0,051 %** |

| Elemento | Cláusula | `L_c` | `b`, `A`, `r` | `h/t` vs **λ_md** | `L_c/r` vs 133,29 | `φ_c P_n` | `P_u` (§5.37) | uso |
|---|---|---|---|---|---|---|---|---|
| **Diagonal de muro** CAJ 100×100×4 | **§8.6.3** | 5,000 m | 92 mm · 1 536 mm² · 39,226 mm | **23,00 → ✗ 1,2199** | 127,467 → ✓ 0,9563 | 146,055 kN | 39,895 | 0,273 |
| Diagonal de muro CAJ 100×100×**5** | §8.6.3 | 5,000 m | 90 mm · 1 900 mm² · 38,837 mm | 18,00 → ✓ 0,9547 | 128,742 → ✓ 0,9659 | 177,565 kN | 39,895 | 0,225 |
| Diagonal de techo CAJ 75×75×4 | **§8.8.4** | 3,623 m | 67 mm · 1 136 mm² · 29,032 mm | 16,75 → ✓ 0,8884 | 124,787 → ✓ 0,9362 | 111,962 kN | 28,234 | 0,252 |
| **Puntal de techo** CAJ 125×125×6 | **§8.8.4** | 6,000 m | 113 mm · 2 856 mm² · 48,643 mm | **18,833 → ✓ 0,9989** | 123,347 → ✓ 0,9254 | 286,862 kN | 96,087 | 0,335 |

Geometría, de `galpon_altiplano_build.py`: la media diagonal de muro va de la base al nodo `XM`
(`Δy = 3,0`, `Δz = 4,0`) → **5,000 m**; el panel de techo mide `Δx = 3·DXJ = 4,000 m`,
`Δy = SEP = 6,000 m`, `Δz = 0,7053 m`, y la media diagonal es **3,6228 m**; el puntal une dos
marcos en la misma línea `j` → **6,000 m**.

**Cuatro cosas que salen de esta tabla:**

1. **La diagonal de muro pasa lo que todos miran y falla lo que casi nadie mira.** `L_c/r = 127,47`
   cumple el `1,5π√(E/F_y)` **al 95,6 %**, y `h/t = 23,0` **excede el λ_md en un 22 %**. Y por
   AISC ni siquiera es esbelta: 23,0 contra 42,14, uso 0,55.
2. **El puntal de techo cumple el λ_md al 99,89 %** — `18,8333` contra `18,8533`, una parte en mil.
   Con 125×125×**7** no habría margen que discutir; con el 6 mm que tiene, el margen es de
   0,02 unidades de esbeltez. Es el número más frágil de todo el modelo.
3. **AISC distingue el cajón soldado del HSS y NCh2369 no.** La Tabla B4.1a le da al armado el
   caso 8 (**1,49**) y al conformado en frío el caso 6 (**1,40**) — un 6,4 % de diferencia,
   reconociendo que el conformado tiene tensiones residuales de plegado. La Tabla 9 de NCh2369 les
   pone a los dos el mismo **0,76**, y solo cambia el nombre de la razón (`h/t` para el soldado,
   `b/t` para el conformado). Ver §5.44.
4. **La puerta del amplificador está ABIERTA, y es la primera vez en el sitio.** No hace falta
   descomponer la combinación para demostrarlo: aunque se amplificara **toda** la combinación
   —no solo su parte sísmica— por el `0,5R₁` de §12.2.2, la demanda sería a lo más
   `2,00 × 39,895 = 79,79 kN` contra `φ_c P_n = 146,06 kN`, **uso 0,55**. Es una cota superior
   rigurosa. En `ejemplo-chevron-nch2369` esa puerta daba 1,52 y en `ejemplo-diagonal-hss-traccion`
   daba 4,68: **las dos cerradas**. Acá está abierta porque la diagonal está al 27 % de su
   capacidad — la dimensionó la esbeltez, no la carga.

**Ojo con el `R₁`, que es direccional.** §3 anota «`0,5R₁ = 2,00`», que sale de `R = 4`. Pero por la
Ec. (14), `R₁ = R*·mín(Q₀/Q₀^mín; 1)`, y en la dirección **longitudinal** —la arriostrada, donde
vive esta diagonal— `R*_Y = 3,8302` y `Q₀Y/Q₀^mín = 130,257/70,860 = 1,838 > 1`, así que
`R₁_Y = 3,8302` y **`0,5R₁_Y = 1,9151`**. El 2,00 de §3 es el de la dirección transversal. La
conclusión no cambia (1,9151 × 39,895 = 76,4 kN, uso 0,52), pero el número que se escriba en el
post tiene que ser el de la dirección que corresponde.

### 6.1 Fase 0 — sprint de PDF

| # | Tarea | Estado |
|---|---|---|
| 1 | Verificar tablas sísmicas de rukan contra la 3.ª ed. | ✅ **hecho** — coinciden (§5.5) |
| 2 | Leer NCh2369:2025, cláusulas de la serie | ✅ **hecho** para todo lo que la Fase 2 necesitó |
| 3 | Leer NCh3171:2017 §9 completo | ✅ **hecho** — §9, §9.1.1 con sus seis excepciones y reglas de cierre, §9.1.2, §9.1.3, §9.2.1 con sus cuatro excepciones y cierre, §9.2.2, §9.2.3 y §9.3 |
| 4 | Leer NCh432:2025, parámetros del sitio | ✅ **hecho** — §3.2, §3.3, §5.5.2, §5.6.1, §5.6.2, §5.7, §5.8.1, §5.8.2, §5.9, §5.10, §5.11 y las Tablas 1, 2, 3, 4, 5, 6 y 7, más la **Figura 3 (K_zt)** |
| 5 | Arreglar los bloqueantes de `rukan/spectra.py` | ✅ **hecho** — commit `35c3050` en rukan, 8 tests pasan |

**Ya leído de NCh2369** (2026-08-12): §4.3.1 · §4.3.2 · §4.5.1 + Tabla C-2 · §5.1.1 · §5.1.2 ·
§8.3.2 · §8.3.3 · §8.6.1–8.6.4 · §8.7.1–8.7.6 · §8.8.4 · §8.8.5 · §12.1.1–12.1.6 · §12.2 completa con
las ocho condiciones · Anexo B normativo B.1 · Tablas 1, 3, 4, 6, 7 y 9. Todo en §4.1.

**Leído en la Fase 2** (2026-08-12), todo rasterizado y en §4.1: **§5.4.1 Ecs. (1a)/(1b)/(2)** ·
**§5.4.2 Ecs. (3)/(4)** · **§5.6.1** y **§5.6.2** · **§5.7.1** y **§5.7.2** · **§5.12 Ec. (12)** ·
**§5.13 Ec. (13)** · **§5.14 Ec. (14)** · **§12.1.1–§12.1.3** con `C12.1.2` · **Anexo A y Figura A.2**.

De **NCh432:2025** se leyó la **cláusula 7 completa**: §7.1.1–§7.1.4, §7.2.1, §7.3.1 con la
**Ec. (7)**, §7.3.1.1, §7.3.2 con sus tres excepciones, §7.3.2.1, §7.3.2.2, §7.3.3–§7.3.6,
§7.3.7 con las **Ecs. (9)/(10)**, y las **Figuras 12, 13 y 14**.

**Leído después**, cerrando la deuda que esta tabla listaba: **§6.1, §6.2 con la Ec. (15), §6.3 y
§6.4 con `C6.4`** — págs. impresas 68-70, PDF 74-76, el 2026-08-12, con sus filas en §4.1. El post 5
ya no depende de ninguna lectura pendiente.

**Lo que sigue faltando de NCh2369**, en orden de urgencia:

| Cláusula | pág. impresa | PDF | Para qué |
|---|---|---|---|
| **§8.6.3** (esbeltez de las diagonales comprimidas) | 87 | 93 | post 10 — **es lo próximo que hay que rasterizar** (§5.9) |
| §8.4 / §8.5 (el 0,7R₁ y sus alternativas) | ~81-86 | ~87-92 | contexto de §12.2.2 |
| §5.2.2 irregularidades | ~30 | ~36 | post 4 |

Nada de lo ya leído se hereda de la serie de la torre: cada fila de §4.1 tiene su propia fecha de
lectura rasterizada.

**Bloqueantes de rukan** (tarea 5) — **los tres resueltos el 2026-08-12**, commit `35c3050` en rukan:

| # | Qué era | Arreglo aplicado |
|---|---|---|
| 1 | `nch2369_spectrum` aplicaba **R\* período a período** | parámetro **`r_fixed`** para R\* constante, más el helper **`r_star_for(t_star, R, soil)`** que lo calcula desde el T\* dominante. El docstring explica el flujo obligatorio de dos pasadas |
| 2 | docstring citaba la **Of2003** (Tablas 5.2 y 5.3) | referencia actualizada a **NCh2369:2025**, Tablas **3** y **6**, con la fecha de contraste. Los **valores** siempre estuvieron bien (§5.5) |
| 3 | `_r_star` **sin** la rama `R ≤ 1 → R* = 1` | portada desde `src/lib/nch2369-spectrum.ts`, con el porqué en el docstring |

Verificación: `R = 1 → R* = 1,0` ✅ · con `r_fixed` la meseta coincide exactamente con la versión
período a período y en `T = 0,05 s` la razón es **2,164** (la variable reduce por 2,31 en vez de por 5) ·
**8 tests pasan**.

### 6.2 Fase 2 — el modelo SAP2000, a cuatro manos

Seis pasos cortos vía el MCP. **Cada uno termina con un resumen para que el usuario lo confirme antes
de seguir.** Ningún post se escribe con un modelo sin confirmar.

**Cerrada el 2026-08-12.** Los seis pasos se hicieron con confirmación del usuario en cada
bifurcación, y varias decisiones cambiaron sobre la marcha (§6.2.2).

| Paso | Qué se construyó | Estado |
|---|---|---|
| 2.1 | Geometría: 5 marcos, puntales, crucerías de muro y de techo, pilares de hastial | ✅ |
| 2.2 | Secciones de peralte variable por planchas + estudio de convergencia de N (§5.34) | ✅ |
| 2.3 | Ejes locales, releases con §8.6.4, apoyos, `No design` en el tapered | ✅ |
| 2.4 | Cargas: 5 de gravedad + 5 de viento, todas distribuidas sobre barras | ✅ |
| 2.5 | Masa `D + 0,20·S` y modal de 60 modos | ✅ |
| 2.6 | R\*, espectros de diseño y de referencia, casos RS con CQC, vertical de §5.7.1, banda | ✅ |

#### 6.2.1 El modelo, en números

Dos scripts autoritativos en `C:\Proyectos_Python\Skills_SAP\scripts\`, en este orden:
**`galpon_altiplano_build`** (geometría → cargas → masa → modal) y
**`galpon_altiplano_espectral`** (T\* → R\* → espectros → casos RS → vertical → banda).

| | |
|---|---|
| Modelo | **105 nodos · 188 barras · 20 bases articuladas** · 23 826,406894506235 kg = **41,365 kg/m²** |
| Secciones tapered | **7**: columna 406,25 / 518,75 / 631,25 / 743,75 mm · dintel 725 / 575 / 425 mm (alma 6, alas 220×12) |
| Otras secciones | diagonal de muro CAJ 100×100×4 · diagonal de techo CAJ 75×75×4 · puntal CAJ 125×125×6 · pilar de hastial I 400×150×8/6 |
| Malla | columna 4 tramos de 2,0 m · dintel 6 tramos cortados en `j = 0,3,6,9,12,15,18` |
| Estados | 11, todos con **residuo de equilibrio 0,0** |
| `DEAD` · `DSD` | 233,65722558396922 · **302,9638654094505** kN |
| `LR` · `SBAL` · `SUNBI`/`SUNBD` | 172,8 · 691,2 · 518,4 kN |
| Viento (ΣF) | `WTXP` (81,939439 ; 0 ; 192,082392) · `WLYP` (−10,205652 ; 86,625229 ; 185,722047) · `WPI` (0 ; 0 ; 57,243097) kN |
| Masa sísmica `P` | **674,8610909934324 kN** = `D + 0,20·S` |
| T\* | X **0,8526565963541679 s** (modo 1, U_x = 94,63 %) · Y **0,1610608923144279 s** (modo 41, U_y = 47,42 %) |
| Masa acumulada (60 modos) | X 97,63 % · Y 97,83 % · Z 65,13 % |
| R\* de diseño (R = 4) | X **4,000000** · Y **3,8301633726045696** |
| Q₀ | X **86,960228719357** · Y **130,2571888641845** kN |
| Banda §5.12/§5.13 | [**70,86041455430902** ; **224,9066895021051**] → dentro en ambas |
| Vertical §5.7.1 | `C_V = 0,504` → `F_V = 340,1299898606887 kN` |

**Asserts que cerraron**: equilibrio global de los 11 estados a **0,0**; `Q_referencia/Q_diseño = R\*`
a **1e-15** en ambas direcciones; `F_V` contra `C_V·P` a **5e-12**; `GetSectProps` contra el cálculo
a mano de una I al último dígito en los nueve valores geométricos.

#### 6.2.2 Decisiones de modelado tomadas con el usuario

| Decisión | Rama descartada | Por qué |
|---|---|---|
| Costaneras **fuera** del modelo, como carga distribuida | modelarlas pin-pin en las 19 líneas | se calculan aparte como viga simple de 6,0 m; y la carga **nodal** concentraba masa en nodos sin atadura → modos locales (§5.32) |
| Malla del dintel en las uniones con el arriostramiento | una línea por costanera | todo nodo queda atado; 7 secciones en vez de 17 |
| **Se mantiene el peralte variable** | prismático equivalente | §5.33: ningún peralte único reproduce el momento de alero y el de cumbrera |
| Puntales en las 7 líneas × 4 vanos | solo en los vanos arriostrados | la Fig. A.2 vacía el aspa, no la línea (§5.29) |
| Diagonales en anillo perimetral, 16 paneles | X en los dos vanos extremos cruzando la luz | eso no es «continuo a lo largo» |
| §8.6.4 literal: **una sola** diagonal continua en el cruce | las dos continuas | más rígido que la norma y que el detalle real |
| Nodos sobre **líneas teóricas** | línea de centroides (columna a 1,6112°) | coordenadas limpias; el momento parásito se declara |
| Pilares de hastial: 5 por testera, **1 elemento**, `P` liberada arriba | 4 tramos; o sin pilares con carga nodal | son prismáticos; la `P` liberada evita que apuntalen el dintel del marco extremo |
| Crucería de muro y de techo en los **vanos extremos** | vano central; o extremos + central | camino corto desde el hastial |
| `No design` en las 70 barras del tapered | dejar el diseño activo | AISC 360-22 no tiene capítulo de peralte variable y SAP tomaría `L = 2,0 m` por objeto |
| Zonas de viento **promediadas por área** por cara | las 8 posiciones de franja E de §7.3.2.1 | la resultante por cara queda idéntica; solo se pierde la concentración local, que es materia de C&R |
| Masa sísmica `D + 0,20·S` | solo permanentes; o `S` completa | §5.1.2 da criterio, no número; el 0,2S de la combinación (5) de NCh3171 §9.1.1 es el juicio de la propia normativa |

Reglas de trabajo que se mantienen: scripts **idempotentes** (`InitializeNewModel` +
`File.NewBlank`) · `save_as` solo al cerrar cada paso · **rukan no se toca hasta que el modelo SAP
esté cerrado** · números **sin redondear** · **no encadenar muchos ciclos de `InitializeNewModel` +
`RunAnalysis`**: seis seguidos tumbaron el RPC de SAP2000 (`0x800706BE`) y cerraron el programa.

Todo lo aprendido de la OAPI quedó en
`C:\Proyectos_Python\struct_llm\docs\lecciones-sap2000-modelado-oapi.md`, §12.

### 6.3 Fase 3 — los diez posts

| # | Slug | Colección | Estado |
|---|---|---|---|
| **0** | `galpon-altiplano-la-serie` | `blog` / Sísmica | ✅ `05c3846` — **el caso + el mapa + la bitácora**. Sin campo `series` (los tres de rukan ya son Rukan 8-10; una serie de un miembro es ruido). **Se reabre y se actualiza al cerrar cada post**: entrada fechada en la bitácora, enlace en el mapa, y `updatedDate` |
| 1 | `ejemplo-galpon-altiplano-viento-sitio-nch432` | `apuntes` / `nch432` | ✅ `7298bc5`, rama `serie-galpon` · 3 figuras · planilla de 14 verificaciones · auditado, 16 hallazgos, 15 aplicados · **tesis afilada**: ver §5.41 |
| 2 | `rukan-verificacion-galpon-tapered` | `blog` / Rukan 8 | ⬜ **rukan sin tocar** |
| 3 | `ejemplo-galpon-altiplano-cargas-combinaciones` | `apuntes` / `nch2369` | ✅ `7ddddb0`, rama `serie-galpon` · 2 figuras · planilla de 14 verificaciones · auditado en dos pasadas · deslinde en §5.42 |
| 4 | `rukan-verificacion-galpon-modal-espectral` | `blog` / Rukan 9 | ⬜ **rukan sin tocar** |
| 5 | `ejemplo-galpon-altiplano-sismico-nch2369` | `apuntes` / `nch2369` | ✅ rama `serie-galpon` · 3 figuras · planilla de 21 verificaciones · auditado, **18 hallazgos, los 18 aplicados** · deslinde en §5.43 |
| 5b | `modelo-base-skills-sap-los-siete-defectos` | `blog` / SAP2000 | ⬜ |
| 6 | `rukan-verificacion-galpon-envolvente` | `blog` / Rukan 10 | ⬜ |
| 7 | `ejemplo-columna-tapered-galpon` | `acero` / Miembros | ⬜ |
| 8 | `ejemplo-dintel-tapered-ltb-galpon` | `acero` / Miembros | ⬜ |
| 9 | `ejemplo-costanera-galpon-biaxial` | `acero` / Miembros | ⬜ · canal C por **AISC 360-22** (§5.39) |
| 10 | `ejemplo-diagonal-longitudinal-galpon` | `acero` / Marcos arriostrados | ✅ rama `serie-galpon` · 3 figuras · planilla de 16 verificaciones · auditado, **18 hallazgos, los 18 aplicados** · **deslinde en §5.44, que le costó las dos tesis** · números en §5.45 |

Las tesis de cada uno están en el plan. Auditoría en dos tandas: tras 1+2+3, y tras el resto.

---

## 7. Lo que cada post NO puede rehacer

Párrafo obligatorio en el §1 de cada post, con enlace.

| Post ya publicado | Qué agotó | Afecta a |
|---|---|---|
| `apuntes/ejemplo-viento-galpon-nch432.mdx` | galpón 24 × 60 m θ=10°: **Figura 12**, el **reparto área→frame** en SAP2000, y la **costanera por C&R** (área efectiva, viga simple vs continua, deflexión) | posts 1 y 9 |
| `apuntes/nch432-cargas-de-viento.mdx` | el panorama completo y **K_e en el altiplano** | post 1 (allí K_e es contexto; la tesis es K_zt) |
| `blog/galpon-liviano-nch2369.mdx` | **§12.2** completa, las ocho condiciones, R = 4 y el 0,5R₁ | post 5 (debe declarar por qué **no** califica) |
| `blog/rukan-verificacion-peso-propio-combinaciones.mdx` | caso 8: galpón a dos aguas 3D de 3 marcos con D, L_r, E_X, E_Y | posts 2, 4, 6 |
| `acero/ejemplo-columna-galpon-compresion.mdx` · `ejemplo-viga-columna.mdx` | compresión pura con K y esbeltez · H1 prismático | post 7 |
| `acero/ejemplo-viga-ltb.mdx` | LTB con L_b como dato | post 8 (allí L_b es **función de la combinación**) |
| `acero/ejemplo-chevron-nch2369.mdx` | **el λ_md sobre un cajón soldado de A36** (λ_md = 18,9, nuestro mismo número), la diagonal que **falla el λ_md pasando la esbeltez global**, «las dos puertas de §8.6.3 y las dos cerradas», y el cierre «dimensionadas por λ_md, no por resistencia» | **post 10 — le costó la tesis entera** (§5.44) |
| `acero/ejemplo-diagonal-hss-traccion.mdx` | §8.6.4 con el cruce fijo (53,5 vs 25,1 tonf), §8.6.3 con sus dos exigencias y la exención verificada, §8.6.8 con `T_ye`, la identidad `1,5π√(E/F_y) ≡ 4,71√(E/F_y)`, y Caps. D, E y J sobre una diagonal | post 10 (§5.44) |
| `acero/predimensionamiento-diagonal-arriostramiento.mdx` | el `1,5π√(E/F_y)` como servilleta, λ_c = 1,5, el 39 % de F_y, y `r_min = L_c/(1,5π√(E/F_y))` | post 10 (§5.44) |
| `blog/galpon-liviano-nch2369.mdx` | además de §12.2: **§8.6.1 y §8.8.2 textuales**, «el solo-tracción queda permitido en los planos verticales y en el techo», y qué se pierde al salirse de §12.2 | **post 10 — le costó la tesis de respaldo** (§5.44) |
| `acero/ejemplo-gusset-simple-apernado.mdx` · `ejemplo-gusset-esquina-apernado.mdx` | el λ_md sobre tubos conformados en frío, y el tubo «al 98,2 % del límite» | post 10 (§5.44) |
| `acero/ejemplo-viga-carrilera-puente-grua.mdx` | **la Ec. H1-1b con `P_r = 0`** y la flexión biaxial gobernando al 0,97, sobre un perfil **doblemente simétrico** | post 9 (allí el perfil es **simplemente** simétrico, y ese es el punto) |
| Serie de la torre (3 apuntes + Rukan 7) | la cadena `T*→R*→Q₀→banda→R₁`, la deriva de §6, el espectro de referencia | posts 4 y 5 |

---

## 8. Deuda y pendientes

### Cerradas en la Fase 2

- ~~Docstring de `rukan/spectra.py` cita la Of2003~~ → **corregido** en el commit `35c3050`.
- ~~Ec. (1a)/(1b) pendientes de leer rasterizadas~~ → **leídas** (§4.1). `C_r = 0,16 R` confirmado.
- ~~¿`h` en el alero o altura media?~~ → **cerrado con página**: la notación de la Figura 12 de
  NCh432 dice «excepto que se debe utilizar la altura del alero para θ ≤ 10°». El post publicado
  estaba bien (§5.25).
- ~~Coeficientes de presión de la cláusula 7 sin leer~~ → **cláusula 7 completa leída**, incluidas
  las Figuras 12, 13 y 14 (§4.1).
- ~~§5.6.2, §5.7, §5.12, §5.13 y la Ec. (14) pendientes~~ → **leídas** (§4.1, §5.31, §5.35).
- ~~La costanera es un plegado y se diseñaría por AISI S100, que no está en PDF~~ → **cerrado**: se
  adopta **canal C simple por AISC 360-22**, con la ruta §F2 / §F6 / Ec. (H1-1b) confirmada
  rasterizada (§5.39). Ya no hay dependencia de una norma que no tenemos.
- ~~¿El material de peralte variable da para post propio?~~ → **no**: se reparte entre los posts 2, 4
  y 7 (decisión del usuario, §3).

### Abiertas

- **`material_teorico\taller\_indice-taller.md`**: la nota sobre §5.1.2 y NCh1537 es incorrecta (§5.3).
- ~~**§8.6.3 de NCh2369** sigue sin leer rasterizada~~ → **estaba leída desde la primera sesión** y su
  fila está en §4.1. Reconfirmada rasterizada el 2026-08-12 (2.ª sesión) junto con §8.8.4 y la
  Tabla 9. La nota era obsoleta, no una deuda. Ver §5.9 y §5.44.
- **La masa modal vertical no converge** (65,1 % con 60 modos, 75,4 % con 150). Se adopta §5.7.1
  estática, pero `C5.7.1` prefiere el dinámico para techos flexibles y el nuestro lo es. **Hay que
  declarar la salvedad en el post** (§5.31).
- **39 de 60 modos son locales del punto de cruce** (§5.32). Si el post 4 quiere mostrar un modal
  «limpio», hay que decidir si se documenta el artefacto o se modelan las diagonales enteras.
- **El script `galpon_altiplano_espectral` fija `P_SIS` a mano** (constante literal). Al cambiar
  cualquier carga hay que actualizarlo, o leerlo del modelo.
- **NCh431 y NCh1537** siguen sin PDF. Ya no bloquean (§5.1); el post 3 se publicó sin ellas.
- **NCh427/1 no está en PDF.** La cita §8.3.2 (métodos de diseño por estabilidad) y C8.3.2 (el segundo
  orden aproximado del Anexo 8, aceptado explícitamente). Necesaria para el post 7.
- **AISC 341-16 Tabla A3.1** — la norma cita esa edición y en disco está la 22. Ver §5.17.
- **Análisis de pandeo para K** (§5.16): rukan necesita un `eigen` de pandeo (matriz geométrica), no
  solo P-Delta. Reordena la prioridad de los cambios de rukan respecto de lo que decía el plan.
- **La excepción 9.1 f) de NCh3171:2017 quedó colgando** (§5.21): remite a NCh2369:**2003** §4.5, que la
  edición 2025 reemplazó. No hay «combinación (ii)» ni factor «b» en la vigente. Vale como hallazgo
  publicable y como aviso a quien arme combos automáticamente desde NCh3171.
- **Errata interna de NCh3171** (§5.23): §9.2.2 y el cierre de §9.2.1 citan «(5), (6) y (7)» cuando
  §9.2.1 numera 5a/5b y 6a/6b. Hay que decidir y **declarar** la lectura al implementar los combos.
- **El wiki numera mal las figuras de NCh432.** El plan pedía «Figuras 25/26 (topografía)» y «Figura 2
  (zonificación)»; en la 3.ª edición el `K_zt` está en la **Figura 3** y la zonificación con la
  velocidad básica en la **Tabla 1**. Las dos se leyeron rasterizadas el 2026-08-12 y están en §4.1.
  Queda corregir el wiki.
- **rukan no tiene sección de peralte variable** ni `geom_transf` configurable. Ver plan, Fase 2.
