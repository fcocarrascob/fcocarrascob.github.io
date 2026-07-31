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

## El ciclo, un ejemplo a la vez

Una planilla por vuelta, sin adelantar la siguiente hasta cerrar la anterior:

1. **Construir** la planilla desde la norma y los datos de entrada del post
   (§ Convenciones: independencia). Sale de un agente con el PDF de la norma a
   la vista, nunca de copiar los pasos intermedios del post.
2. **Dibujar el esquema paramétrico** en `public/esquemas/<slug>.svg` y colgarlo
   de la región `image` (§ Esquema paramétrico). No es opcional: una planilla
   sin esquema queda incompleta.
3. **Verificar**: `npm run verify:planilla -- public/planillas/<slug>.json`.
   Falla por número que no cuadra, por unidad incoherente y por token de
   esquema que no resuelve.
4. **Aplicar los fixes mecánicos** al post — redondeos, dígitos, un número mal
   arrastrado. Si un hallazgo toca una **tesis o una decisión de diseño**, ahí
   se para: eso se conversa antes de tocar el post.
5. **Registrar**: los hallazgos con su severidad en `AUDIT.md`, la fila de este
   registro con pasos, verificaciones, contrastes y fecha de corrida.
6. **Cerrar**: `npm run verify:planillas` (todas, no solo la nueva), `npm run
   build`, y commit del par planilla + esquema + post corregido.

## Convenciones

- **Independencia**: la planilla se construye desde la norma (verificada en el PDF) y los
  datos de entrada del post — nunca transcribiendo los pasos intermedios del post, que es
  verificar que el post coincide consigo mismo.
- **Contrastes**: un booleano por cada número publicado en las tablas del post (más los
  intermedios clave publicados en prosa), con id `c_*`, al final de la hoja bajo el
  encabezado «CONTRASTE CON EL POST». Se omiten los redundantes (un uso que es cociente
  de dos números ya contrastados), salvo el uso que gobierna.
- **Tolerancia**: media unidad del último dígito publicado —
  `abs(Rd_pan - 119.12 tonf) < 0.005 tonf`. El post publica redondeado; la planilla
  calcula a precisión completa.
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
  - **Seguridad**: solo `/esquemas/` se inyecta inline; cualquier otra imagen va
    por `<img>`.
- Si un post con planilla cambia sus números, la planilla es la que dice si siguen
  cuadrando: correr `verify:planillas` antes de publicar.

## Estado

✅ cuadra (contrastes al día, sin hallazgos abiertos) · ⚠️ con hallazgos (ver `AUDIT.md`)
· ⬜ pendiente · 🚫 no candidato (dictamen del auditor)

### acero

| Post | Pasos | Verif. | Contrastes | Esq. | Hallazgos | Última corrida | Estado |
|---|---|---|---|---|---|---|---|
| `ejemplo-gusset-simple-apernado` | 92 | 46 | 23 | 18 | 3 aplicados 2026-07-31 (tabla por-perno con t = 18 mm) | 2026-07-31 | ✅ |
| `ejemplo-gusset-simple-soldado` | 71 | 46 | 28 | 16 | 1 aplicado 2026-07-31 (387,2 → 387,1) | 2026-07-31 | ✅ |
| `ejemplo-gusset-esquina-apernado` | 146 | 99 | 69 | 51 | 1 aplicado 2026-07-31 (Resultado 143,00 → 140,55, con el alt) | 2026-07-31 | ✅ |
| `ejemplo-gusset-apice-chevron` | 105 | 81 | 57 | 38 | 1 aplicado 2026-07-31 (0,538 → 0,537) | 2026-07-31 | ✅ |
| `ejemplo-diagonal-hss-traccion` | 41 | 34 | 25 | 26 | 1 aplicado 2026-07-31 (56 340 kgf → 56 351) | 2026-07-31 | ✅ |
| `ejemplo-chevron-nch2369` | | | | | | | ⬜ |
| `ejemplo-columna-galpon-compresion` | | | | | | | ⬜ |
| `ejemplo-conexion-apernada-corte` | | | | | | | ⬜ |
| `ejemplo-conexion-doble-angulo` | | | | | | | ⬜ |
| `ejemplo-conexion-momento-end-plate` | 76 | 52 | 38 | 21 | 0 | 2026-07-31 | ✅ |
| `ejemplo-conexion-momento-placas-ala` | 87 | 59 | 41 | 27 | 1 aplicado 2026-07-31 (97.5 → 97.6) | 2026-07-31 | ✅ |
| `ejemplo-empalme-apernado-viga` | | | | | | | ⬜ |
| `ejemplo-viga-carrilera-puente-grua` | | | | | | | ⬜ |
| `ejemplo-viga-columna` | | | | | | | ⬜ |
| `ejemplo-viga-ltb` | | | | | | | ⬜ |

**Esq.** = tokens del esquema paramétrico. Las 7 planillas publicadas lo tienen.

### hormigón

| Post | Pasos | Verif. | Contrastes | Esq. | Hallazgos | Última corrida | Estado |
|---|---|---|---|---|---|---|---|
| `ejemplo-anclajes-pedestal` | | | | | | | ⬜ |
| `ejemplo-columna-interaccion-esbeltez` | | | | | | | ⬜ |
| `ejemplo-losa-punzonamiento-momento` | | | | | | | ⬜ |
| `ejemplo-losa-unidireccional` | | | | | | | ⬜ |
| `ejemplo-mensula-puntal-tensor` | | | | | | | ⬜ |
| `ejemplo-muro-flexocompresion` | | | | | | | ⬜ |
| `ejemplo-pedestal-anclaje-nch2369` | | | | | | | ⬜ |
| `ejemplo-viga-flexion-corte` | | | | | | | ⬜ |
| `ejemplo-viga-t` | | | | | | | ⬜ |
| `ejemplo-zapata-aislada` | | | | | | | ⬜ |

### geotecnia

| Post | Pasos | Verif. | Contrastes | Esq. | Hallazgos | Última corrida | Estado |
|---|---|---|---|---|---|---|---|
| `ejemplo-fundacion-anclada-nch2369` | | | | | | | ⬜ |
| `ejemplo-losa-rigida-o-flexible-nch2369` | | | | | | | ⬜ |
| `ejemplo-pilotes-friccion-negativa-nch2369` | | | | | | | ⬜ |
| `ejemplo-zapata-galpon-nch2369` | | | | | | | ⬜ |
| `ejemplo-zapata-los-dos-criterios` | | | | | | | ⬜ |
