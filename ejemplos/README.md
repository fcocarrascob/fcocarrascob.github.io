# `ejemplos/` — memos de cálculo

**Consolidar la aplicación de la normativa chilena al diseño y análisis de elementos**, un caso a la
vez y de forma compacta. Ese es el fin, y todo lo demás de este archivo sale de ahí.

Esta carpeta está **fuera del build**. Ningún glob de `src/content.config.ts` la alcanza, así que
nada de lo que hay acá llega al sitio. Sí se versiona.

## Las tres reglas

### 1. Independientes del blog

Los memos **no son borradores de posts** ni su versión comprimida ni un banco de material para el
sitio. Son un corpus propio: el registro de cómo se aplica NCh2369 —con las normas que ella
referencia: AISC 360 y 341, ACI 318, NCh427— a un elemento concreto. Que un memo termine en post es
una salida posible, no el objetivo, y no cambia cómo se escribe.

De ahí sale la regla operativa: **un memo se sostiene solo**. Toda cláusula que usa se lee en el PDF
de la edición vigente y se registra en su propia tabla de referencias. Ninguna fila puede decir
«heredada del post»: si el número también vive en un post publicado, igual se lee del PDF acá. Un
memo sí puede heredar de otro memo —declarándolo en los supuestos—, porque el corpus es una unidad;
de un post, no.

### 2. No repetir

**Cada cláusula se ejemplifica una vez, y cada elemento se diseña una vez.** Antes de escribir un
memo se lee [INDICE.md](INDICE.md): si el estado límite, la cláusula o el elemento ya están, el caso
nuevo no es un memo nuevo — es un paso más en el que existe, o no es nada.

Lo mismo con las estructuras: una sola base de columna, una sola viga de marco, **una sola cepa
arriostrada**. Si hacen falta dos casos, que sean dos configuraciones de la misma estructura —mismo
paño, mismo acero, mismo perfil— y que la diferencia sea la cláusula que se quiere mostrar, no una
estructura nueva inventada de cero.

Y **un dueño por número**: cada magnitud se deriva en un solo memo y los demás la heredan por
supuesto declarado, citando el memo de origen. Tres copias de $T_{ye}$ no son tres ejemplos, son
tres oportunidades de que deriven entre sí.

El corpus pasó de 19 a 14 memos el 2026-08-08 aplicando esto; la nota de esa consolidación y la de
las dos configuraciones de la cepa están al pie de `INDICE.md`.

### 3. Compactos

Un memo cuesta una fracción de un ejemplo publicado (mediana de ~3.400 palabras, dos SVG a mano y
una planilla del canvas). Ese costo bajo es lo que permite acumular. Lo que lo mantiene bajo está en
la sección siguiente, y se pierde solo si no está escrito.

## Qué es un memo

Un `.md` plano (no `.mdx`) en `ejemplos/<disciplina>/<slug>.md`, con techo de **150 líneas**. Es un
tope de andamiaje, no de contenido: el fijo —encabezado, caso, supuestos, resumen, referencias,
promoción— son unas 60 líneas y cada ecuación en display cuesta 3, así que 150 dan para una docena
de ecuaciones. Un caso que pida más se parte en dos memos.

Pero el largo total no es la medida que importa: crece con la cantidad de estados límite, y eso es
propiedad del caso, no de la verbosidad. Lo que de verdad separa un memo de un post es la **prosa
por paso**, con tope de ~100 palabras. Los dos memos que fijaron el formato van en 74 y 85; el post
publicado del mismo caso, en 480.

```bash
f=ejemplos/<disciplina>/<slug>.md
wc -l "$f"
prosa=$(sed '/^```/,/^```/d; s/\$\$[^$]*\$\$//g; s/\$[^$]*\$//g' "$f" | grep -v '^|' | wc -w)
pasos=$(grep -c '^## [0-9]' "$f")
echo "$prosa palabras / $pasos pasos = $((prosa / pasos)) por paso"
```

```
ejemplos/
  README.md         este archivo
  _PLANTILLA.md     se copia para cada memo nuevo
  INDICE.md         qué hay acumulado, en qué estado y con qué veredicto
  acero/  hormigon/  geotecnia/
```

## El formato

### Encabezado

```yaml
---
titulo: Placa base con momento — DG1, excentricidad grande
disciplina: acero
tema: Placas base          # mismo vocabulario que el `tema` de los posts
normas: [AISC Design Guide 1 3.ª ed., ACI 318-25]
fecha: 2026-08-07
estado: pendiente          # verificado | pendiente | derivado-de-post
veredicto: No cierra — el breakout del pedestal gobierna (uso 1,53).
post:                      # ruta del post si se promovió; vacío mientras no
---
```

`estado` se **deriva** de la tabla de referencias: si alguna cláusula todavía no se leyó en el PDF,
el memo está `pendiente`. Está duplicado arriba solo para poder armar `INDICE.md` de un vistazo.
`derivado-de-post` es el tercer caso: el memo no es cálculo nuevo sino la transcripción de un
ejemplo ya publicado y auditado, y sus referencias heredan la verificación de ese post.

### Secciones, en este orden

| Sección | Contenido | Extensión |
|---|---|---|
| `# <título>` + 1–2 líneas | Qué se verifica y con qué método. Sin tesis, sin gancho. | 2 líneas |
| `## Caso` | Tabla de datos de entrada: geometría, materiales, cargas. | 5–10 filas |
| `## Supuestos` | Lista numerada `S1, S2…` para citarlos desde los pasos. Todo lo que se eligió y no viene del enunciado. | 3–8 ítems |
| `## 1. … ## N.` | Un bloque por estado límite. | el grueso |
| `## Resumen` | Tabla `Verificación \| Ref. \| Demanda \| Capacidad \| Uso \| ✓/✗`. | 1 tabla |
| `## Veredicto` | Qué gobierna y qué cambiar para cerrar. | 2–4 líneas |
| `## Referencias` | Tabla `Clave \| Norma y edición \| Cláusula \| Leída en PDF`. | 1 tabla |
| `## Para promover a post` | Qué falta: referencias por leer, la tesis candidata, los SVG que harían falta. | 2–5 bullets |

### Cómo se escribe un paso

Una línea de justificación con la cláusula entre corchetes y el supuesto que usa entre paréntesis,
la ecuación con símbolos = números = resultado + unidad, y el veredicto. Nada más:

```markdown
## 3. Tracción de pernos

Régimen: e = 30 cm > e_crit = 20,7 cm → excentricidad grande.  [DG1 §4.3.7]  (S2)

$$T_u = q_{máx}\,Y - P_u = 11\,050 \cdot 4{,}56 - 40\,000 = 10\,370\ \text{kgf}$$

→ **5,19 tonf/perno** (2 pernos en la fila traccionada).
```

La prosa que explica *por qué* la fórmula es esa no va en el memo. Esa es exactamente la parte que
se escribe recién si el caso se promueve a post.

### Lo que un memo NO lleva

Esto es lo que lo mantiene compacto, y se va recuperando solo si no está escrito:

- sin `<Note>`, `<Figure>` ni ningún componente MDX, y sin imports;
- sin SVG, imágenes ni HTML embebido; se admite **un** croquis ASCII dentro de un fence, con
  tope de ~15 líneas, y solo cuando la geometría o el equilibrio son lo que el memo enseña.
  La prueba: si al borrarlo se pierde claridad, va; si solo se pierde adorno, no va. Al
  promover, el croquis es el borrador gratis del SVG real;
- sin planilla del canvas — esa aparece recién al promover;
- sin footnotes: la bibliografía es la tabla de `## Referencias`;
- sin enlaces al sitio;
- sin apertura con tesis ni gancho, y sin conclusiones argumentativas;
- sin comparación entre métodos, salvo que el caso sea exactamente eso.

### Notación

Coma decimal en todo el memo, **también dentro de LaTeX** (`4{,}56`), y miles con `\,`. Los posts
publicados mezclan coma en prosa con punto en LaTeX; el memo es documento interno y se uniforma, y
el ajuste se hace al promover. Español neutro, como todo el repo.

El LaTeX del memo se escribe **portable**, y esa es una diferencia real con la de los posts. Un post
lo compila el KaTeX 0.17 del sitio, uno solo y conocido; un memo se lee en cualquier visor de
Markdown, y los visores traen KaTeX más viejos o configurados distinto. Dos formas que el sitio
acepta y un visor puede rechazar:

- **`·` dentro de `\text{}`**: los posts escriben `\text{tonf·m}` y el sitio lo renderiza bien, pero
  un visor puede traducirlo a `\cdotp` —que no existe en modo texto— y mostrar un ParseError. En el
  memo va `\text{kN}\cdot\text{m}`. En prosa y en tablas el `·` es normal, no pasa por KaTeX.
- **Acentos en modo matemático**: `q_{máx}` dispara `unicodeTextInMathMode`. En el memo va
  `q_{\text{máx}}`; los posts usan la otra salida válida, `q_{m\acute{a}x}`.

`npm run build` no caza ninguna de las dos, porque `ejemplos/` está fuera del sitio. Se verifican
parseando cada expresión con el KaTeX del repo antes de dar el memo por terminado.

## Trazabilidad normativa

Sigue rigiendo la regla no negociable de `CLAUDE.md`: toda ecuación se lee del PDF de la edición
vigente antes de escribirse, y de la **página rasterizada**, no de la capa de texto. Lo que el memo
agrega es que **la deuda se declara** en vez de quedar implícita:

```markdown
| Clave | Norma y edición | Cláusula | Leída en PDF |
|---|---|---|---|
| DG1 | AISC Design Guide 1, 3.ª ed. | §4.3.7, Ecs. 4-27 a 4-60 | 2026-08-07 |
| ACI | ACI 318-25 (SI) | §17.6.2, Ec. 17.6.2.1b | ⚠ pendiente |
```

Acumular rápido está permitido. Decir que un número está verificado cuando no lo está, no. **Un memo
con alguna fila `⚠ pendiente` está incompleto**: no vale como aplicación normativa consolidada y no
se promueve.

Y por la regla 1, `⚠ pendiente` es el único descargo admisible. «Heredada del post» no lo es: un
memo cuyas cláusulas viven en un post no se sostiene solo, y el día que el post cambie el memo queda
citando algo que ya no existe.

## La salida opcional: promover a post

Todo memo lleva una sección `## Para promover a post`, y se mantiene. Pero es una **salida**, no el
propósito: se escribe pensando en qué haría falta *si* el caso terminara publicado, no para
justificar el memo. Un cálculo que cierra sin sorpresas es un memo perfectamente terminado, cumple
el fin de la carpeta y no necesita post.

Lo que justificaría las 3.400 palabras de un ejemplo publicado es que el caso muestre algo que el
lector no habría anticipado: que gobierna la verificación que nadie mira, que dos métodos válidos se
contradicen, que la palanca de diseño no es la que parece. Promover significa reescribir al formato
publicado —apertura con tesis, `## El caso`, pasos con prosa, `## Resumen: demanda vs. capacidad`,
`## La planilla`, footnote normativa— usando el memo como insumo. El memo se conserva, se le llena
el campo `post:`, y **sigue siendo autónomo**: no pasa a citar al post que salió de él.
