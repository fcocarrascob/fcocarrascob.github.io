# Subsección «Predimensionamiento» de Acero: la ecuación despejada al revés

Fecha: 2026-08-06

## El problema

`/acero` tiene 24 posts en tres subsecciones —`aisc360-22` (7 notas de capítulo), `ejemplos` (16
casos trabajados) y `teoria` (1)— y todos corren en la misma dirección: le entregas una sección al
texto y el texto te dice si pasa. Ninguno responde la pregunta que va antes, **qué perfil pedir para
que pase**, con lápiz y sin abrir nada.

Eso es tiempo perdido de verdad. Sin una primera estimación defendible se itera a ciegas, y cada
iteración cuesta un ciclo completo de modelo.

## La decisión de fondo

La subsección **invierte la dirección de la ecuación normativa**. `M_n = F_y Z_x` es lo que la norma
escribe; `Z_{x,req} = M_u/(\phi_b F_y)` es lo que uno necesita. Es la misma ecuación leída al revés,
y esa vuelta es todo el aporte.

De ahí sale todo lo demás:

- **Nada de barridos paramétricos.** La relación se deriva algebraicamente de la ecuación
  normativa; no se ajusta empíricamente sobre una nube de casos.
- **Las relaciones quedan en forma literal**, sin instanciar un `F_y`. El valor está en tener el
  despeje, no en memorizar un coeficiente. Eso las vuelve universales y baratas de auditar.
- **El motor de `src/lib/acero/` solo valida.** No genera ninguna relación: mide cuánto desvía el
  atajo respecto de la verificación completa, y de qué lado.

Esto encaja con la regla de fuentes de `CLAUDE.md` sin excepciones: la ecuación se lee del PDF
rasterizado, el despeje es álgebra declarada como propia, y el error del atajo lo mide código del
sitio.

### Por qué una subsección y no una sección del blog

`Oficio` vive en `blog` porque su material es criterio transversal. Esto es lo contrario: son
relaciones ancladas a capítulos concretos de AISC 360-22, hermanas directas de las notas
`aisc360-22-cap*` y de los `ejemplo-*`. La subsección cuesta una clave en `SUBSECTIONS` y una página
índice calcada de `teoria`; el schema de `acero` acepta `subsection: z.string()` libre y
`[slug].astro` ya rutea cualquier valor.

## El contrato de la sección

Vive en la `description` de `SUBSECTIONS`, que la página índice ya renderiza. No gasta un post,
igual que hizo Oficio. Lo que declara:

> Una servilleta acá es **una ecuación de la norma despejada, no una regla de dedo**. Siempre viaja
> con la condición que la habilita y con la medida de cuánto se desvía de la verificación completa.

## La anatomía de un post

Formato fijo, reconocible desde el índice:

| Sección | Qué hace |
|---|---|
| *(apertura sin H2)* | La dirección en que la norma escribe contra la que uno usa al diseñar, con enlace a la nota de capítulo que cuenta el porqué |
| `## El caso` | Qué elemento, qué datos tienes en la mano, qué te falta todavía |
| `## Las servilletas` | N relaciones numeradas. Cada una: la ecuación como la norma la escribe (`Equation` con su label), el despeje declarado como álgebra propia, y la condición sin la cual no vale |
| `## Lo que la servilleta no ve` | El estado límite que el atajo omite, y por qué se puede posponer |
| `## Dónde miente` | Tabla *caso · servilleta · motor completo · desvío % · ¿del lado seguro?* |
| `## El orden` | En qué secuencia se aplican y qué decisión no se deshace |
| `## Reproducir` | El comando de `verify:servilletas` |

La columna que importa en «Dónde miente» es la última: un atajo conservador y uno inseguro son
animales distintos, y un porcentaje solo no distingue.

## La validación: `scripts/verify-servilletas.mjs`

Hermano de `scripts/verify-acero.mjs`, del que reutiliza el `bundle()` con esbuild sobre
`src/lib/acero/engine-entry.ts`.

La diferencia de propósito: `verify-acero.mjs` ancla el motor contra las planillas publicadas.
`verify-servilletas.mjs` corre **dos caminos sobre el mismo caso** —el despeje de la servilleta y la
verificación completa— y afirma que el desvío queda dentro de la banda que el post publica y **del
lado que el post declara**.

Es guardia, no demo: si una servilleta deja de estar del lado seguro, sale con código 1.

## Lo que queda fuera

Descartado explícitamente durante el diseño:

- **Catálogo de perfiles** vendorizado al repo.
- **Herramienta nueva** o cambios a `/herramientas/verificador-secciones`.
- **Barridos paramétricos** o scripts generadores de reglas empíricas.
- **Números cerrados para memorizar** (`L_p \approx 42 r_y` y compañía).
- **Réplica en Hormigón o Geotecnia.** Si el formato funciona, se evalúa después.

## Los tres posts del estreno

### 1. Viga a flexión — Caps. F y G

Las cuatro servilletas, todas leídas en página rasterizada el 2026-08-06:

| # | Relación | Sale de | Qué la habilita |
|---|---|---|---|
| 1 | `Z_{x,req} = M_u/(\phi_b F_y)` | Ec. F2-1, `\phi_b = 0{,}90` de §F1(a) | alcance de §F2: alma y ala compactas (Tabla B4.1b, casos 15 y 10) **y** `L_b \le L_p` |
| 2 | `r_{y,mín} = L_b/(1{,}76\sqrt{E/F_y})` | despeje de la Ec. F2-5 | es la condición de la #1: §F2.2(a) dice que con `L_b \le L_p` el LTB «does not apply» |
| 3 | `(d\,t_w)_{req} = V_u/(0{,}6F_y)` | Ec. G2-1 con `A_w = d t_w`, en la rama §G2.1(a) | I **laminado** con `h/t_w \le 2{,}24\sqrt{E/F_y}` |
| 4 | `I_{req} = 5wL^4/(384\,\delta_{adm})` | **mecánica, no norma** | ver abajo |

**El hallazgo del post está en la #3.** §G1(a) fija `\phi_v = 0{,}90` *«for all provisions in this
chapter except Section G2.1(a)»*, y §G2.1(a) fija `\phi_v = 1{,}00` con `C_{v1} = 1{,}0` (Ec. G2-2).
En la rama que cubre a casi todo perfil laminado, la servilleta del corte **no lleva φ**: aplicarle
0,90 por costumbre pide 11 % más de alma que la que la norma exige. La User Note de §G2.1(a) delimita el alcance con nombre y
apellido — todos los W, S y HP de ASTM A6/A6M vigentes salvo ocho perfiles listados, para
`F_y = 345` MPa.

**La trampa de la flecha.** El Capítulo L completo son dos páginas y §L2 (Deflections) es **una sola
frase**: *«Deflections in structural members and structural systems shall be limited so as not to
impair the serviceability of the structure.»* Ningún número, ninguna tabla. El `L/360` que todos
usan no está en la Specification: §L1 remite a *«the intended function of the structure»* y su User
Note apunta al Apéndice C de ASCE/SEI 7. Bajo la regla de fuentes ese número **no se escribe**. La
relación #4 es una identidad de resistencia de materiales, declarada como tal, con `\delta_{adm}`
como dato del proyecto del lector.

*Dónde miente*: casos de `L_b` creciente, donde el atajo pasa de exacto a **inseguro** apenas
`L_b > L_p`.

### 2. Columna comprimida — Cap. E

Tesis: el área es lo que uno cree elegir y **el radio de giro es lo que decide**. `A_{g,req}` depende
de `F_{cr}`, que depende de `L_c/r`, que ya depende del perfil; la única entrada limpia es `r`.

La relación central es la fracción de `F_y` que sobrevive, escrita como función de una sola variable
adimensional a partir de E3-2/E3-3. Es derivable, no recordada: «para conservar la mitad de `F_y`
necesitas `L_c/r \le X`» sale exacto del despeje. El `L_c/r \le 200` de la User Note de §E2 sí es
texto normativo y se cita como User Note.

*Dónde miente*: el eje que gobierna cuando `K_x \ne K_y`, que `ejemplo-columna-galpon-compresion` ya
mide.

### 3. Diagonal de arriostramiento — Caps. D y E + NCh2369 §8.6

Tesis: la diagonal **invierte el orden intuitivo**. Se dimensiona pensando en la tracción, pero la
esbeltez sísmica y la compresión mandan primero y dejan la tracción holgada.

Las relaciones: `A_{g,req}` por fluencia (D2-1), `(A_n U)_{req}` por rotura (D2-2), cuál de las dos
gobierna según `F_y/F_u` y `U`, `r_{mín}` por el límite de esbeltez de NCh2369 §8.6, y el área que
pide la compresión.

*Lo que la servilleta no ve*: `U` (Tabla D3.1) depende de una conexión que en predimensionamiento
todavía no existe.

## Flujo de escritura

1. Rasterizar la página (`page.render()` de pypdfium2 — PyMuPDF no está instalado en esta máquina) y
   transcribir mirando. La capa de texto sirve para *ubicar* y para leer prosa y User Notes.
2. Registrar cada ecuación en `ECUACIONES.md`; la columna «Revisada» se llena a mano con la fecha.
3. Escribir el post en español neutro, `tú`, sin voseo (`CLAUDE.md` §Idioma).
4. Agregar sus casos a `verify-servilletas.mjs` y correrlo.
5. `/auditar <slug>` antes de publicar; los 🔴 y 🟠 se aplican.
6. Estado en `ROADMAP.md`.

**El post de la viga se escribe y se audita solo, antes de tocar los otros dos.** El formato es nuevo
y la auditoría del primero es la que lo confirma o lo corrige.

## Las rutas de las normas se piden, no se asumen

Las rutas que `CLAUDE.md` deja escritas (`F:\OneDrive\Ingenieria\Normas\`,
`F:\Proyectos_Python\material_teorico\`) valen en una de las dos máquinas donde se trabaja este
repo, no en las dos. En esta sesión `F:` no estaba montada y los PDF vivían en
`C:\Users\…\OneDrive - PSC INGENIERÍA SpA\Escritorio\Documentos\Normas`.

**No se corrigen las rutas del `CLAUDE.md`**, porque cualquier valor fijo va a estar mal en la otra
máquina. La regla operativa es: **antes de citar el primer número, se pide la ruta al PDF de la
norma y a `material_teorico`.** El costo de preguntar es una línea; el de asumir es escribir un
número sin fuente, que es justo lo que la regla no negociable prohíbe.

## Verificación

```bash
npm run build                # TypeScript + Zod
npm run verify:servilletas   # cada servilleta contra el motor completo
npm run verify:ecuaciones    # falla si un post cita una ecuación que no existe en la edición vigente
```

Y a mano con `npm run dev`: `/acero` muestra cuatro subsecciones con el conteo correcto,
`/acero/predimensionamiento` lista los tres posts, y cada post renderiza KaTeX con los labels de
`Equation` correlativos.
