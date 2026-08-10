# `ejemplos/` — memos de cálculo

**Consolidar la aplicación de la normativa chilena al diseño y análisis de elementos**, un caso a
la vez y de forma compacta. Ese es el fin, y todo lo demás de este archivo sale de ahí.

Esta carpeta está **fuera del build**: nada de lo que hay acá llega al sitio. Sí se versiona.

```
ejemplos/
  README.md         este archivo — el contrato
  _PLANTILLA.md     el molde: se copia para cada memo nuevo
  INDICE.md         el estado: qué hay acumulado, las estructuras del corpus
  acero/  hormigon/  geotecnia/
```

## Las tres reglas

### 1. Independientes del blog

Los memos no son borradores de posts ni un banco de material para el sitio: son un corpus propio.
**Un memo se sostiene solo**: toda cláusula que usa se lee en el PDF de la edición vigente y se
registra en su tabla de referencias. Ninguna fila puede decir «heredada del post», aunque el
número también viva en un post auditado — el día que el post cambie, el memo quedaría citando algo
que ya no existe. Heredar de **otro memo** sí se permite, declarándolo en los supuestos.

### 2. No repetir

**Cada cláusula se ejemplifica una vez y cada elemento se diseña una vez.** Antes de escribir un
memo se lee [INDICE.md](INDICE.md): si el estado límite, la cláusula o el elemento ya están, el
caso nuevo es un paso más en el memo que existe, o no es nada. Las estructuras también se reusan
—las del corpus están descritas en el INDICE—: si hacen falta dos casos, que sean dos
configuraciones de la misma estructura, y que la diferencia sea la cláusula que se quiere mostrar.

Al terminar un memo se lo agrega como nodo al grafo de dependencias de su estructura, en «Las
estructuras del corpus» del INDICE, con una arista por cada magnitud que sus supuestos declaren
heredar. El script exige la cobertura; el contenido de la arista, no.

Y **un dueño por número**: cada magnitud se deriva en un solo memo y los demás la heredan por
supuesto declarado, citando el memo de origen.

### 3. Compactos

Un `.md` plano (no `.mdx`) en `ejemplos/<disciplina>/<slug>.md`, con techo de **150 líneas** y
~**100 palabras de prosa por paso**. El techo de líneas es de andamiaje, no de contenido: el fijo
son unas 60 líneas y cada ecuación en display cuesta 3, así que 150 dan para una docena. La prosa
por paso es la medida que de verdad separa un memo de un post (~75–85 contra ~480 del ejemplo
publicado equivalente). Un caso que pida más líneas se parte en dos memos.

## El formato

El frontmatter y el orden de secciones están en [_PLANTILLA.md](_PLANTILLA.md): se copia y se
llena, no se reinventa. Dos campos con regla propia:

- `estado` (`verificado` | `pendiente`) se **deriva** de la tabla de referencias: si alguna
  cláusula no se leyó en el PDF, el memo está `pendiente`. Vive duplicado en el frontmatter solo
  para armar el índice.
- `veredicto` es la celda que muestra el INDICE, verbatim: una o dos frases con el número que
  gobierna, escritas pensando en esa tabla.

### Cómo se escribe un paso

Una línea de justificación con la cláusula entre corchetes y el supuesto que usa entre paréntesis,
la ecuación con símbolos = números = resultado + unidad, y el veredicto. Nada más:

```markdown
## 3. Tracción de pernos

Régimen: e = 30 cm > e_crit = 20,7 cm → excentricidad grande.  [DG1 §4.3.7]  (S2)

$$T_u = q_{máx}\,Y - P_u = 11\,050 \cdot 4{,}56 - 40\,000 = 10\,370\ \text{kgf}$$

→ **5,19 tonf/perno** (2 pernos en la fila traccionada).
```

La prosa que explica *por qué* la fórmula es esa no va en el memo: se escribe recién si el caso se
promueve a post.

### Lo que un memo NO lleva

- sin componentes MDX, imports, SVG, imágenes ni HTML; se admite **un** croquis ASCII en un fence
  (~15 líneas máximo), solo cuando la geometría o el equilibrio son lo que el memo enseña — si al
  borrarlo se pierde claridad, va; si solo se pierde adorno, no va;
- sin planilla del canvas — esa aparece recién al promover;
- sin footnotes ni enlaces al sitio: la bibliografía es la tabla de `## Referencias`;
- sin apertura con tesis ni gancho, sin conclusiones argumentativas, y sin comparación entre
  métodos salvo que el caso sea exactamente eso.

### Notación

Coma decimal en todo el memo, **también dentro de LaTeX** (`4{,}56`), y miles con `\,`. Español
neutro, como todo el repo.

El LaTeX se escribe **portable**: un memo se lee en cualquier visor de Markdown, con KaTeX más
viejos o configurados distinto que el del sitio. Dos formas que el sitio acepta y un visor puede
rechazar:

- **`·` dentro de `\text{}`** puede traducirse a `\cdotp` y dar ParseError: en el memo va
  `\text{kN}\cdot\text{m}`. En prosa y tablas el `·` es normal, no pasa por KaTeX.
- **Acentos en modo matemático** disparan `unicodeTextInMathMode`: va `q_{\text{máx}}`, no
  `q_{máx}`.

Ningún script las caza (`ejemplos/` está fuera del build): se verifican parseando cada expresión
con el KaTeX del repo antes de dar el memo por terminado.

## Trazabilidad normativa

Rige la regla no negociable de `CLAUDE.md`: toda ecuación se lee del PDF de la edición vigente, de
la **página rasterizada**. Lo que el memo agrega es que **la deuda se declara**: la columna
`Leída en PDF` lleva la fecha de lectura o `⚠ pendiente`. Acumular rápido está permitido; decir
que un número está verificado cuando no lo está, no. Y por la regla 1, `⚠ pendiente` es el único
descargo admisible — «heredada del post» no lo es.

## Verificación mecánica

```bash
npm run verify:ejemplos   # contrato: frontmatter, techo de líneas, estado ↔ referencias, INDICE al día,
                          #           y que todo memo sea nodo de algún grafo de dependencias
npm run ejemplos          # además regenera la tabla del INDICE desde los frontmatter
```

El reparto es el mismo de `ECUACIONES.md`: lo mecánico lo decide el script y no admite falso
positivo; que el número sea el de la página rasterizada no lo decide ningún script.

## La salida opcional: promover a post

Todo memo lleva `## Para promover a post`, pero es una **salida**, no el propósito: un cálculo que
cierra sin sorpresas es un memo terminado. Se promueve cuando el caso muestra algo que el lector
no habría anticipado — gobierna la verificación que nadie mira, dos métodos válidos se
contradicen, la palanca no es la que parece. Promover significa reescribir al formato publicado
usando el memo como insumo; el memo se conserva, se le llena el campo `post:` y **sigue siendo
autónomo**: no pasa a citar al post que salió de él.
