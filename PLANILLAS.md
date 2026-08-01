# PLANILLAS — cobertura y estado de las planillas del canvas

Registro vivo de las planillas de `public/planillas/`, que son la **reproducción
independiente** de cada ejemplo de cálculo: mismos datos de entrada declarados, fórmulas
armadas desde la norma, y al final un bloque de **contrastes** que compara cada número
que la planilla calcula contra el número que el post publica. Sirven para dos cosas:

1. **Para el lector**: abrir el ejemplo en `/herramientas/canvas?planilla=<slug>`, variar
   parámetros y ver cómo cambian los números y los veredictos ✓/✗. Por eso los datos de
   entrada van primero y a la vista, nunca incrustados en una fórmula.
2. **Para la auditoría**: `npm run verify:planillas` corre todas con el mismo motor del
   canvas (mismas unidades, mismo chequeo dimensional) y falla si cualquier verificación
   da `false` sin declarar. Un contraste que falla = una discrepancia cálculo↔post.

Este registro es la tabla de estado; los **hallazgos** que salen de los contrastes se
registran donde siempre, en `AUDIT.md`, con sus severidades. Aquí solo se apunta cuántos
hay y hacia dónde mirar.

## Qué reproduce una planilla (y qué no)

La planilla reproduce la cadena normativa del post **a partir de sus datos de entrada
declarados**. No interactúa con modelos externos: un número que viene de un modelo
SAP2000, de un catálogo o de una tabla de norma entra como dato declarado con su cita
("Tabla J3.3M: d_h = 28 mm") y es frontera explícita de lo verificado. Tampoco ve prosa,
figuras ni citas — eso sigue siendo territorio del auditor (`AUDIT.md`).

> **El formato `{version, regions}` lo usa también `struct_llm`**, que genera planillas
> desde el `Resultado` de sus tools. Esas hojas **no viven acá ni entran en las tablas de
> estado de este archivo**: son entregables de ese proyecto, autocontenidos, y su bloque de
> contraste compara contra la tool, no contra un post. El formato es el punto de contacto;
> los repos siguen separados.

## El ciclo, un ejemplo a la vez

Una planilla por vuelta, sin adelantar la siguiente hasta cerrar la anterior:

1. **Construir** la planilla desde la norma y los datos de entrada del post
   (§ Convenciones: independencia). Sale de un agente con el PDF de la norma a
   la vista, nunca de copiar los pasos intermedios del post. Cada **valor de
   tabla** que el post cite se abre en el PDF y se lee en la columna de las
   unidades del cálculo (§ Convenciones: valores de tabla). Es el paso que no
   se puede saltar: un número tabulado mal citado no lo caza ningún recálculo,
   porque la aritmética del post cuadra consigo misma.
2. **Dibujar el esquema paramétrico** en `public/esquemas/<slug>.svg` y colgarlo
   de la región `image` (§ Esquema paramétrico). No es opcional: una planilla
   sin esquema queda incompleta.
3. **Verificar**: `npm run verify:planilla -- public/planillas/<slug>.json`.
   Falla por número que no cuadra, por unidad incoherente y por token de
   esquema que no resuelve. Y con el sitio servido,
   `npm run reflow:planilla -- <slug>` recoloca los bloques para que ninguno
   quede encima de otro (§ Convenciones: disposición de los bloques).
   **Ojo con el servido**: `reflow` y `pdf:planilla` abren la planilla desde el
   sitio, o sea desde `dist/`, y escriben en `public/`. Después de reflow hay
   que rehacer el build (o copiar el `.json` a `dist/planillas/`) antes de
   imprimir, o el PDF sale del layout viejo — y como cuadra consigo mismo, el
   chequeo pasa igual.
4. **Mirar el esquema**: `npm run render:esquema -- public/planillas/<slug>.json`
   resuelve los tokens contra la hoja, rasteriza el SVG con Chromium y deja el
   PNG en un temporal. Que los tokens resuelvan no dice que el dibujo se lea
   (§ Esquema paramétrico: revisión visual). Sin abrir ese PNG el paso no está
   hecho.
5. **Aplicar los fixes mecánicos** al post — redondeos, dígitos, un número mal
   arrastrado. Si un hallazgo toca una **tesis o una decisión de diseño**, ahí
   se para: eso se conversa antes de tocar el post.
6. **Revisar los cortes de página**: con el sitio servido,
   `npm run pdf:planilla -- <slug>` imprime la A4 de verdad y comprueba que el
   corte que el canvas anuncia es el que el PDF tiene. Donde una sección de
   cálculo quede partida a la mala —arranca al pie, o se derrama por dos
   líneas— se pone un salto forzado en su encabezado (§ Convenciones: cortes de
   página). Una sección más larga que una página se parte igual: eso no se
   fuerza, se acepta.
7. **Registrar**: los hallazgos con su severidad en `AUDIT.md`, la fila de este
   registro con pasos, verificaciones, contrastes y fecha de corrida.
8. **Cerrar**: `npm run verify:planillas` (todas, no solo la nueva), `npm run
   build`, y commit del par planilla + esquema + post corregido.

## Convenciones

- **Independencia**: la planilla se construye desde la norma (verificada en el PDF) y los
  datos de entrada del post — nunca transcribiendo los pasos intermedios del post, que es
  verificar que el post coincide consigo mismo.
- **Valores de tabla: al PDF, y en la columna de las unidades del cálculo.** Toda constante
  que venga de una tabla de la norma —$F_{nv}$, $F_y$ de un grado, un $\phi$, un coeficiente,
  una dimensión de agujero— se lee en el PDF y se declara en la planilla con su cita
  («Tabla J3.3M: $d_h$ = 24 mm»), aunque el post ya la publique. Los códigos escritos en
  unidades imperiales traen **dos columnas**, y no son la misma: en AISC 360-22 la Tabla J3.2
  tabula 54 ksi **(370 MPa)** para el Grupo 120 con rosca incluida, mientras la conversión
  exacta de las 54 ksi da 372. En un cálculo métrico manda **la columna métrica**; ésa es la
  convención del sitio (370/470 para el Grupo 120, 470/580 para el Grupo 150, 190 para el
  A307).
  **Por qué es un paso propio**: el 2026-08-01, la planilla de la shear tab encontró que el
  post citaba 372 MPa «de la Tabla J3.2». Los 0,5 % de diferencia dieron vuelta el número
  insignia del ejemplo —el perno extremo pasó de uso 0,995 a 1,00— y arrastraban a otros tres
  posts. Ningún recálculo lo habría encontrado: la aritmética publicada era correcta a partir
  del valor equivocado. Solo aparece abriendo la tabla. **Y vuelve a entrar si no se cita**: el
  mismo día, la planilla del empalme apernado encontró los 372 otra vez, en el único post que
  quedaba sin alinear. Por eso el fix no es solo cambiar el número — es dejar escrita la
  procedencia junto a él («Tabla J3.2: 54 ksi = 370 MPa, la columna métrica»), que es lo que
  impide que la próxima vuelta lo reintroduzca.
- **Contrastes**: un booleano por cada número publicado en las tablas del post (más los
  intermedios clave publicados en prosa), con id `c_*`, al final de la hoja bajo el
  encabezado «CONTRASTE CON EL POST». Se omiten los redundantes (un uso que es cociente
  de dos números ya contrastados), salvo el uso que gobierna.
- **Tolerancia**: media unidad del último dígito publicado —
  `abs(Rd_pan - 119.12 tonf) < 0.005 tonf`. El post publica redondeado; la planilla
  calcula a precisión completa.
- **Una columna derivada se recalcula, no se escala.** Cuando el post compara dos
  configuraciones y una es N veces la otra —dos planos de corte en vez de uno, dos
  elementos en vez de uno—, la columna derivada hay que calcularla desde los datos,
  no multiplicando o dividiendo el número **ya redondeado** de la otra. La planilla
  lo hace solo si se le declara el factor (`n_ea := 2`) y se aplica sobre la
  cantidad de precisión completa. **Por qué es su propia regla**: el 2026-08-01 la
  planilla del doble ángulo encontró tres hallazgos y **los tres eran esto** —
  `2 × 10 757 = 21 514` cuando el exacto es 21 513; el uso de bloque publicado como
  0,42 porque es el 0,83 de la shear tab partido por dos, cuando `30/72,311` da
  0,41. Cada paso de redondeo intermedio se acumula, y en un post comparativo la
  columna derivada es justo la que el lector lee para sacar la conclusión.
- **`meta.esperadoFalso`**: dos usos, siempre con su razón escrita. (a) Los `false` que
  son la tesis del ejemplo («no pasa» es el punto del post). (b) Discrepancias
  encontradas, marcadas `HALLAZGO <fecha>` mientras el fix al post no se decida — nunca
  para tapar una discrepancia en silencio. Si el post se corrige, el runner avisa que la
  excepción quedó obsoleta y hay que borrarla.
- **Esquema paramétrico** (obligatorio): toda planilla lleva un SVG en
  `public/esquemas/<slug de la planilla>.svg` con tokens `{{expr}}` /
  `{{expr:unidad}}`, colgado de su región `image`. Una imagen muda no cumple: el
  esquema existe para que el lector vea **cuánto valen** las variables que el dibujo
  rotula, y para que al mover un dato el dibujo se mueva con los números. Reglas:
  - **De dónde sale**: se deriva de la figura del post — misma composición, mismos
    colores — y se guarda **aparte**, en `/esquemas/`. El post conserva su SVG
    estático (ahí los tokens saldrían crudos). Si el panel recortado solo existía
    para la planilla, se mueve a `/esquemas/` y no queda copia.
  - **Tokens**: `{{expr}}` acepta cualquier expresión mathjs contra el scope
    (`{{max(u_a, u_b)}}`, `{{d_v - t_fv:mm}}`). La forma con unidad convierte e
    imprime **solo el número**; la unidad la escribe el SVG con su propia tipografía
    (cm², tonf·m). Los valores salen con 4 cifras significativas, no con el redondeo
    del post. La sustitución barre **todo el archivo, comentarios incluidos**: un
    `{{expr}}` de ejemplo dentro de un `<!-- -->` también se evalúa y hace fallar
    la corrida.
  - **Dónde va**: la región `image` ve el scope de su posición de lectura, así que
    va **después** de las variables que rotula. En la práctica: justo antes del
    encabezado «CONTRASTE CON EL POST», donde ya está todo definido.
  - **Banda de valores**: bajo el dibujo van dos o tres líneas con lo que la hoja
    concluye — demanda, la variable que el ejemplo hace hablar, y el estado límite
    que gobierna con su uso. Es lo que convierte el esquema en un resumen vivo.
    Si hace falta espacio, se estira el `viewBox` hacia abajo y se recalcula el `h`
    de la región (`h = w · alto/ancho del viewBox`).
  - **Contrato**: `verify:planillas` falla si un token no resuelve — variable no
    definida todavía en ese punto de la hoja, o unidad incoherente. El dibujo queda
    bajo el mismo contrato que los números.
  - **Revisión visual** (`npm run render:esquema`): el contrato de tokens es
    necesario y no suficiente. Un esquema puede cuadrar y verse mal, y eso
    ningún booleano lo ve: el valor sustituido es más largo que el rótulo que
    lo esperaba y se sale de su caja, un texto se pasa del `viewBox` y queda
    cortado, un rótulo cae encima de una línea del dibujo. Hay que abrir el
    PNG. La lista de lo que se mira: (a) nada cortado en los cuatro bordes;
    (b) ningún texto encima de otro texto ni de una línea que lo tache;
    (c) los valores sustituidos caben en su caja o su barra; (d) la banda de
    valores dice lo que la hoja concluye; (e) el símbolo del tubo es `□`
    (U+25A1), no `[]`; (f) **ningún valor pierde en el redondeo lo que el
    esquema quería mostrar** — `formatValor` imprime 4 cifras significativas,
    así que un uso de 1,0002 sale «1» y un margen del 0,02 % desaparece. Si el
    punto del rótulo es la diferencia, se rotula la diferencia: `{{(1-u)*100}}`
    en vez de `{{u}}`. Lo que se corrige va al SVG y se vuelve a renderizar.
  - **Seguridad**: solo `/esquemas/` se inyecta inline; cualquier otra imagen va
    por `<img>`.
- **Disposición de los bloques**: la planilla se escribe con un paso vertical fijo, y eso
  vale mientras cada bloque sea una línea. No lo es: una región `program` ocupa una línea
  por instrucción —ocho, diez— y una `math` con una fracción también crece, así que el
  bloque de abajo termina dibujado encima del de arriba. `npm run reflow:planilla` lo
  arregla midiendo el alto **real** de cada región ya renderizada en el canvas (un modelo
  estático erraría justo en los casos que importan) y reasignando `y` en orden de lectura.
  No toca `x`, ni `pageBreak`, ni el orden: el scope y el PDF salen idénticos.
- **Cortes de página**: la planilla se lee en el canvas, pero también se imprime como
  memoria de cálculo, y ahí la hoja se parte en A4. El canvas anuncia dónde con una
  línea «── página N ──»; si un corte cae a mitad de una sección de cálculo, se
  selecciona la región que debería abrir la página y se pulsa **⇱ Salto de página**
  (queda como `"pageBreak": true` en el JSON, y viaja con la planilla). Para verlo
  impreso de verdad: `npm run pdf:planilla -- <slug>` con el sitio servido.
  **El salto se pone después de mirar, nunca antes.** Un salto en el encabezado de
  cada sección parece prolijo y no lo es: si el corte natural ya caía justo antes de
  ese encabezado, el forzado no mueve nada y en cambio deja una página de 300 px.
  El 2026-08-01 la planilla del doble ángulo empezó con cuatro saltos «de oficio»
  y los cuatro hicieron eso —11 páginas, de las cuales cuatro con 250-530 px de
  contenido—; sin ninguno quedó en 8 páginas parejas, y mirando el PDF resultó que
  hacía falta **uno solo**, en la única sección que arrancaba al pie. El criterio
  para leer el reporte es la distancia entre marcas consecutivas: dos muy juntas
  = página talón.
- Si un post con planilla cambia sus números, la planilla es la que dice si siguen
  cuadrando: correr `verify:planillas` antes de publicar.

## Estado

✅ cuadra (contrastes al día, sin hallazgos abiertos) · ⚠️ con hallazgos (ver `AUDIT.md`)
· ⬜ pendiente · 🚫 no candidato (dictamen del auditor)

### acero

| Post | Pasos | Verif. | Contrastes | Esq. | Págs. | Hallazgos | Última corrida | Estado |
|---|---|---|---|---|---|---|---|---|
| `ejemplo-gusset-simple-apernado` | 92 | 46 | 23 | 18 | 6 (1⇱) | 3 aplicados 2026-07-31 (tabla por-perno con t = 18 mm) | 2026-07-31 | ✅ |
| `ejemplo-gusset-simple-soldado` | 71 | 46 | 28 | 16 | 6 (2⇱) | 1 aplicado 2026-07-31 (387,2 → 387,1) | 2026-07-31 | ✅ |
| `ejemplo-gusset-esquina-apernado` | 146 | 99 | 69 | 51 | 10 (3⇱) | 1 aplicado 2026-07-31 (Resultado 143,00 → 140,55, con el alt) | 2026-07-31 | ✅ |
| `ejemplo-gusset-apice-chevron` | 105 | 81 | 57 | 38 | 8 (2⇱) | 1 aplicado 2026-07-31 (0,538 → 0,537) | 2026-07-31 | ✅ |
| `ejemplo-diagonal-hss-traccion` | 41 | 34 | 25 | 26 | 4 (1⇱) | 1 aplicado 2026-07-31 (56 340 kgf → 56 351) | 2026-07-31 | ✅ |
| `ejemplo-chevron-nch2369` | 134 | 97 | 82 | 38 | 10 (2⇱) | 5 aplicados 2026-07-31 (el 🟠: la fila R₁ = 2,0 invertía el signo del desequilibrio) | 2026-07-31 | ✅ |
| `ejemplo-columna-galpon-compresion` |  |  |  |  |  |  |  | ⬜ |
| `ejemplo-conexion-apernada-corte` | 73 | 69 | 49 | 45 | 7 (4⇱) | 1 aplicado 2026-08-01 (🟠 el F_nv de la Tabla J3.2, 372 → 370 MPa: dio vuelta el 0,995 del perno extremo a 1,00) | 2026-08-01 | ✅ |
| `ejemplo-conexion-doble-angulo` | 107 | 88 | 58 | 67 | 9 (1⇱) | 3 aplicados 2026-08-01 (doblar y dividir el redondeado: 21 514 → 21 513 kgf · 0,461 → 0,460 · 0,42 → 0,41) | 2026-08-01 | ✅ |
| `ejemplo-conexion-momento-end-plate` | 76 | 52 | 38 | 21 | 6 (1⇱) | 0 | 2026-07-31 | ✅ |
| `ejemplo-conexion-momento-placas-ala` | 87 | 59 | 41 | 27 | 6 | 1 aplicado 2026-07-31 (97.5 → 97.6) | 2026-07-31 | ✅ |
| `ejemplo-empalme-apernado-viga` | 125 | 92 | 61 | 60 | 9 (2⇱) | 1 aplicado 2026-08-01 (🟠 el F_nv de la Tabla J3.2, 372 → 370 MPa: 86,5 → 86,1 tonf y el uso 0,52 → 0,53; era el último post con la conversión de las ksi) | 2026-08-01 | ✅ |
| `ejemplo-viga-carrilera-puente-grua` |  |  |  |  |  |  |  | ⬜ |
| `ejemplo-viga-columna` |  |  |  |  |  |  |  | ⬜ |
| `ejemplo-viga-ltb` |  |  |  |  |  |  |  | ⬜ |

**Esq.** = tokens del esquema paramétrico. Las 11 planillas publicadas lo tienen.
**Págs.** = páginas A4 al imprimir, y entre paréntesis los saltos forzados (⇱).

### hormigón

| Post | Pasos | Verif. | Contrastes | Esq. | Págs. | Hallazgos | Última corrida | Estado |
|---|---|---|---|---|---|---|---|---|
| `ejemplo-anclajes-pedestal` |  |  |  |  |  |  |  | ⬜ |
| `ejemplo-columna-interaccion-esbeltez` |  |  |  |  |  |  |  | ⬜ |
| `ejemplo-losa-punzonamiento-momento` |  |  |  |  |  |  |  | ⬜ |
| `ejemplo-losa-unidireccional` |  |  |  |  |  |  |  | ⬜ |
| `ejemplo-mensula-puntal-tensor` |  |  |  |  |  |  |  | ⬜ |
| `ejemplo-muro-flexocompresion` |  |  |  |  |  |  |  | ⬜ |
| `ejemplo-pedestal-anclaje-nch2369` |  |  |  |  |  |  |  | ⬜ |
| `ejemplo-viga-flexion-corte` |  |  |  |  |  |  |  | ⬜ |
| `ejemplo-viga-t` |  |  |  |  |  |  |  | ⬜ |
| `ejemplo-zapata-aislada` |  |  |  |  |  |  |  | ⬜ |

### geotecnia

| Post | Pasos | Verif. | Contrastes | Esq. | Págs. | Hallazgos | Última corrida | Estado |
|---|---|---|---|---|---|---|---|---|
| `ejemplo-fundacion-anclada-nch2369` |  |  |  |  |  |  |  | ⬜ |
| `ejemplo-losa-rigida-o-flexible-nch2369` |  |  |  |  |  |  |  | ⬜ |
| `ejemplo-pilotes-friccion-negativa-nch2369` |  |  |  |  |  |  |  | ⬜ |
| `ejemplo-zapata-galpon-nch2369` |  |  |  |  |  |  |  | ⬜ |
| `ejemplo-zapata-los-dos-criterios` |  |  |  |  |  |  |  | ⬜ |
