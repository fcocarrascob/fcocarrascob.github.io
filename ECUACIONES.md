# ECUACIONES.md — libro mayor de procedencia

Una fila por ecuación implementada en un motor del sitio: de qué norma y edición
sale, dónde vive en el código, con qué se ancla y cuándo se leyó en el PDF.

**Las columnas «Ec.» y «Dónde» las genera `npm run verify:ecuaciones -- --escribir`
y se pisan en cada corrida. Las columnas «Ancla» y «Revisada» las escribes tú y el
script las preserva** — son el estado de la auditoría y no se derivan de nada.

## Qué garantiza cada columna

- **Ec.** — la etiqueta citada. Que exista en la edición vigente lo verifica el
  script y no admite falso positivo: es el chequeo que habría cazado el
  `F7-12/F7-13` de 360-16 el día que se escribió.
- **Dónde** — todos los sitios del código que la citan. Más de uno es lo normal y
  lo deseable: el motor y la memoria son dos implementaciones, y una ecuación que
  vive en una sola no tiene doble entrada aunque el número se vea bien.
- **Ancla** — qué fija su valor. `planilla:<slug>` si una planilla publicada la
  cierra, `continuidad` si la fija una identidad en una frontera de tabla, `—` si
  no la fija nada. Las filas con `—` son el backlog de riesgo.
- **Revisada** — `sha` o fecha en que alguien abrió la **página rasterizada** del
  PDF y comparó la forma algebraica y el origen del coeficiente. `⬜` es «nadie la
  miró todavía», que es distinto de «está mal» y distinto de «está bien».

El script decide si el NÚMERO existe. Si la FORMA es la correcta no lo puede
decidir nadie sin abrir el PDF, y por eso esa columna es a mano. Ver la regla de
fuentes normativas en `CLAUDE.md`: la capa de texto del PDF no sirve para leer una
ecuación —destruye el cociente y convierte φ en `f`—, así que se rasteriza.

## Estado

66 ecuaciones citadas · 23 revisadas contra el PDF rasterizado.

| Ancla | Ecuaciones |
|---|---:|
| `continuidad λ_pw/λ_rw` | 23 |
| — | 14 |
| `planilla:viga-hss-flexion` | 9 |
| `planilla:viga-ltb` | 8 |
| `planilla:columna-galpon-compresion` | 5 |
| `planilla:diagonal-hss-traccion` | 3 |
| `no implementada` | 2 |
| `planilla:viga-columna` | 2 |

**Sin ancla de ningún tipo (14).** Están implementadas y nada fija su
valor: ni una planilla publicada, ni una identidad de continuidad. Un error acá
nunca se manifestó, así que es el backlog de mayor riesgo (van por número, no por
prioridad):

`E7-2` · `E7-5` · `F3-2` · `F6-1` · `F6-2` · `F6-3` · `F6-4` · `F7-7` · `F7-9` · `F8-1` · `F8-2` · `F8-3` · `F8-4` · `G2-11`

**Sin revisar contra el PDF (43).** Nadie abrió todavía la página
rasterizada para comparar la forma algebraica y el origen del coeficiente:

`D2-1` · `D2-2` · `D3-1` · `E3-1` · `E3-2` · `E3-3` · `E3-4` · `E4-2` · `E7-2` · `E7-5` · `F1-1` · `F2-1` · `F2-2` · `F2-3` · `F2-4` · `F2-5` · `F2-6` · `F2-8b` · `F3-2` · `F6-1` · `F6-2` · `F6-3` · `F6-4` · `F7-1` · `F7-2` · `F7-3` · `F7-4` · `F7-5` · `F7-6` · `F7-7` · `F7-8` · `F7-9` · `F7-10` · `F7-11` · `F8-1` · `F8-2` · `F8-3` · `F8-4` · `G2-10` · `G2-11` · `H1-1a` · `H1-1b` · `H1-2`

## AISC 360-22 — `aisc360-22`

PDF: `F:/OneDrive/Ingenieria/Normas/A360-22W-ewr.pdf`

| Ec. | Dónde | Ancla | Revisada |
|---|---|---|---|
| `D2-1` | `acero/memoria.ts:340` `acero/seccion.ts:167` `acero/traccion.ts:23` `acero/traccion.ts:39` | `planilla:diagonal-hss-traccion` | ⬜ |
| `D2-2` | `acero/memoria.ts:344` `acero/seccion.ts:167` `acero/traccion.ts:25` `acero/traccion.ts:45` `acero/traccion.ts:52` | `planilla:diagonal-hss-traccion` | ⬜ |
| `D3-1` | `acero/memoria.ts:344` `acero/traccion.ts:51` | `planilla:diagonal-hss-traccion` | ⬜ |
| `E3-1` | `acero/memoria.ts:317` | `planilla:columna-galpon-compresion` | ⬜ |
| `E3-2` | `acero/compresion.ts:45` `acero/memoria.ts:301` | `planilla:columna-galpon-compresion` | ⬜ |
| `E3-3` | `acero/compresion.ts:45` `acero/memoria.ts:302` | `planilla:columna-galpon-compresion` | ⬜ |
| `E3-4` | `acero/compresion.ts:139` `acero/memoria.ts:293` | `planilla:columna-galpon-compresion` | ⬜ |
| `E4-2` | `acero/compresion.ts:29` `acero/compresion.ts:143` `acero/memoria.ts:320` | `planilla:columna-galpon-compresion` | ⬜ |
| `E7-2` | `acero/compresion.ts:62` | — | ⬜ |
| `E7-5` | `acero/compresion.ts:62` | — | ⬜ |
| `F1-1` | `acero/seccion.ts:328` `acero/tipos.ts:79` | `planilla:viga-ltb` | ⬜ |
| `F2-1` | `acero/flexion.ts:39` `acero/flexion.ts:300` `acero/memoria.ts:393` `acero/memoria.ts:506` | `planilla:viga-ltb` | ⬜ |
| `F2-2` | `acero/flexion.ts:176` `acero/memoria.ts:521` | `planilla:viga-ltb` | ⬜ |
| `F2-3` | `acero/flexion.ts:181` `acero/memoria.ts:529` | `planilla:viga-ltb` | ⬜ |
| `F2-4` | `acero/flexion.ts:7` `acero/flexion.ts:80` `acero/flexion.ts:111` `acero/flexion.ts:181` `acero/memoria.ts:529` | `planilla:viga-ltb` | ⬜ |
| `F2-5` | `acero/flexion.ts:64` `acero/flexion.ts:104` `acero/memoria.ts:509` | `planilla:viga-ltb` | ⬜ |
| `F2-6` | `acero/flexion.ts:66` `acero/flexion.ts:110` `acero/memoria.ts:509` | `planilla:viga-ltb` | ⬜ |
| `F2-8b` | `acero/flexion.ts:111` | `planilla:viga-ltb` | ⬜ |
| `F3-2` | `acero/flexion.ts:198` | — | ⬜ |
| `F4-1` | `acero/flexion.ts:245` `acero/flexion.ts:321` | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F4-2` | `acero/flexion.ts:340` `acero/memoria.ts:445` | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F4-3` | `acero/flexion.ts:345` `acero/memoria.ts:451` | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F4-4` | `acero/flexion.ts:72` `acero/flexion.ts:302` `acero/memoria.ts:395` | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F4-5` | `acero/flexion.ts:325` `acero/flexion.ts:345` `acero/memoria.ts:451` | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F4-6a` | `acero/flexion.ts:30` `acero/flexion.ts:74` `acero/flexion.ts:283` `acero/flexion.ts:303` `acero/memoria.ts:395` | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F4-7` | `acero/flexion.ts:64` `acero/flexion.ts:324` `acero/flexion.ts:415` `acero/memoria.ts:426` `acero/memoria.ts:427` | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F4-8` | `acero/flexion.ts:66` `acero/flexion.ts:325` `acero/flexion.ts:331` `acero/memoria.ts:426` | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F4-9a` | `acero/flexion.ts:68` `acero/flexion.ts:242` `acero/flexion.ts:256` | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F4-9b` | `acero/flexion.ts:35` `acero/flexion.ts:242` `acero/flexion.ts:258` `acero/memoria.ts:404` | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F4-11` | `acero/flexion.ts:76` `acero/flexion.ts:226` `acero/flexion.ts:233` `acero/memoria.ts:398` | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F4-12` | `acero/flexion.ts:78` `acero/flexion.ts:225` `acero/memoria.ts:398` | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F4-13` | `acero/flexion.ts:355` `acero/memoria.ts:478` | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F4-14` | `acero/flexion.ts:359` `acero/memoria.ts:485` | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F5-1` | `acero/flexion.ts:422` `acero/flexion.ts:424` `acero/memoria.ts:418` | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F5-2` | `acero/flexion.ts:432` `acero/flexion.ts:438` `acero/memoria.ts:457` `acero/memoria.ts:463` | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F5-3` | `acero/flexion.ts:432` `acero/memoria.ts:457` | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F5-4` | `acero/flexion.ts:438` `acero/memoria.ts:463` | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F5-5` | `acero/flexion.ts:66` `acero/flexion.ts:416` `acero/memoria.ts:427` | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F5-6` | `acero/flexion.ts:36` `acero/flexion.ts:70` `acero/flexion.ts:226` `acero/flexion.ts:262` `acero/flexion.ts:412` `acero/flexion.ts:479` `acero/flexion.ts:613` `acero/flexion.ts:621` `acero/memoria.ts:412` `acero/memoria.ts:601` `acero/memoria.ts:602` | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F5-7` | `acero/flexion.ts:447` `acero/flexion.ts:451` `acero/memoria.ts:488` `acero/memoria.ts:494` | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F5-8` | `acero/flexion.ts:447` `acero/memoria.ts:488` | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F5-9` | `acero/flexion.ts:451` `acero/memoria.ts:494` | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F6-1` | `acero/flexion.ts:495` `acero/memoria.ts:538` | — | ⬜ |
| `F6-2` | `acero/flexion.ts:504` `acero/memoria.ts:542` | — | ⬜ |
| `F6-3` | `acero/flexion.ts:508` `acero/memoria.ts:548` | — | ⬜ |
| `F6-4` | `acero/flexion.ts:507` `acero/memoria.ts:548` | — | ⬜ |
| `F7-1` | `acero/flexion.ts:563` `acero/memoria.ts:563` | `planilla:viga-hss-flexion` | ⬜ |
| `F7-2` | `acero/flexion.ts:11` `acero/flexion.ts:20` `acero/flexion.ts:567` `acero/flexion.ts:575` `acero/memoria.ts:581` `acero/memoria.ts:585` | `planilla:viga-hss-flexion` | ⬜ |
| `F7-3` | `acero/flexion.ts:11` `acero/flexion.ts:578` `acero/memoria.ts:569` | `planilla:viga-hss-flexion` | ⬜ |
| `F7-4` | `acero/flexion.ts:11` `acero/flexion.ts:18` `acero/flexion.ts:578` `acero/memoria.ts:566` `acero/memoria.ts:569` | `planilla:viga-hss-flexion` | ⬜ |
| `F7-5` | `acero/flexion.ts:18` `acero/flexion.ts:579` | `no implementada` | ⬜ |
| `F7-6` | `acero/flexion.ts:12` `acero/flexion.ts:19` `acero/flexion.ts:20` `acero/flexion.ts:567` `acero/flexion.ts:593` `acero/memoria.ts:593` | `planilla:viga-hss-flexion` | ⬜ |
| `F7-7` | `acero/flexion.ts:70` `acero/flexion.ts:78` `acero/flexion.ts:613` `acero/flexion.ts:621` `acero/memoria.ts:601` `acero/memoria.ts:602` | — | ⬜ |
| `F7-8` | `acero/flexion.ts:12` `acero/flexion.ts:19` `acero/flexion.ts:37` `acero/flexion.ts:639` | `planilla:viga-hss-flexion` | ⬜ |
| `F7-9` | `acero/flexion.ts:13` `acero/flexion.ts:644` `acero/flexion.ts:663` `acero/flexion.ts:668` | — | ⬜ |
| `F7-10` | `acero/flexion.ts:64` `acero/flexion.ts:632` `acero/memoria.ts:611` | `planilla:viga-hss-flexion` | ⬜ |
| `F7-11` | `acero/flexion.ts:19` `acero/flexion.ts:66` `acero/flexion.ts:633` `acero/memoria.ts:611` | `planilla:viga-hss-flexion` | ⬜ |
| `F8-1` | `acero/flexion.ts:703` `acero/memoria.ts:628` | — | ⬜ |
| `F8-2` | `acero/flexion.ts:710` `acero/memoria.ts:635` | — | ⬜ |
| `F8-3` | `acero/flexion.ts:713` `acero/memoria.ts:639` | — | ⬜ |
| `F8-4` | `acero/flexion.ts:713` `acero/memoria.ts:639` | — | ⬜ |
| `G2-10` | `acero/corte.ts:10` | `planilla:viga-hss-flexion` | ⬜ |
| `G2-11` | `acero/corte.ts:11` | — | ⬜ |
| `H1-1a` | `acero/interaccion.ts:2` `acero/seccion.ts:249` | `planilla:viga-columna` | ⬜ |
| `H1-1b` | `acero/interaccion.ts:2` `acero/interaccion.ts:18` `acero/seccion.ts:249` | `planilla:viga-columna` | ⬜ |
| `H1-2` | `acero/seccion.ts:316` | `no implementada` | ⬜ |

---

Índice de normas regenerado con `npm run indice:normas` (2026-08-05).
Su fuente son las extracciones de `material_teorico/_procesamiento/raw/normas`,
cuyo inventario de etiquetas se contrastó contra el PDF: para AISC 360-22 coinciden
EXACTO en los ocho capítulos ingeridos (B 2, C 3, D 5, E 30, F 105, G 25, H 16,
J 39). Los Caps. I y K no están ingeridos y ninguna herramienta los toca.
