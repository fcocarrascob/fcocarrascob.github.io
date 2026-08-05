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
- **Dónde** — todos los sitios que la citan: motores (`acero/…`) y posts
  (`acero/ejemplo-…mdx`). Los posts entran al mismo control porque una ecuación mal
  citada en una nota la ve el lector, que es peor que si vive solo en el código.
- **Doble entrada** — si la citan las DOS implementaciones: el motor TS y la cadena
  que la memoria hace evaluar a mathjs. Una ecuación que vive en una sola no está
  contrastada contra nada aunque su número se vea bien. `solo prosa` es que ningún
  motor la implementa: aparece en un post y nada comprueba su número. Lo deriva el
  script, y mide la CITA, no la implementación: un `solo motor` puede significar que
  la memoria sí la calcula pero sin escribir su número, que también hay que arreglar.
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

111 ecuaciones citadas · 23 revisadas contra el PDF rasterizado.

| Ancla | Ecuaciones |
|---|---:|
| — | 59 |
| `continuidad λ_pw/λ_rw` | 23 |
| `planilla:viga-hss-flexion` | 9 |
| `planilla:viga-ltb` | 8 |
| `planilla:columna-galpon-compresion` | 5 |
| `planilla:diagonal-hss-traccion` | 3 |
| `no implementada` | 2 |
| `planilla:viga-columna` | 2 |

**Sin ancla de ningún tipo (59).** Están implementadas y nada fija su
valor: ni una planilla publicada, ni una identidad de continuidad. Un error acá
nunca se manifestó, así que es el backlog de mayor riesgo (van por número, no por
prioridad):

`A-3-1M` · `A-8-3` · `A-8-5` · `B3-1` · `B3-2` · `E4-1` · `E4-3` · `E7-1` · `E7-2` · `E7-3` · `E7-5` · `E7-7` · `F2-8a` · `F3-1` · `F3-2` · `F6-1` · `F6-2` · `F6-3` · `F6-4` · `F7-7` · `F7-9` · `F8-1` · `F8-2` · `F8-3` · `F8-4` · `F13-1` · `G2-1` · `G2-2` · `G2-4` · `G2-7` · `G2-11` · `G4-1` · `H1-1` · `H2-1` · `H3-1` · `H3-6` · `J2-4` · `J2-5` · `J2-6` · `J3-1` · `J3-3a` · `J3-4` · `J3-6a` · `J3-6b` · `J3-6c` · `J3-6d` · `J4-1` · `J4-2` · `J4-3` · `J4-4` · `J4-5` · `J4-6` · `J10-1` · `J10-2` · `J10-4` · `J10-9` · `J10-10` · `J10-11` · `J10-12`

**Sin doble entrada (61).** Las cita una sola de las dos
implementaciones, así que ningún contraste las mira:

`A-3-1M` solo prosa · `A-8-3` solo prosa · `A-8-5` solo prosa · `B3-1` solo prosa · `B3-2` solo prosa · `E3-1` solo memoria · `E4-1` solo prosa · `E4-3` solo prosa · `E7-1` solo prosa · `E7-2` solo motor · `E7-3` solo prosa · `E7-5` solo motor · `E7-7` solo prosa · `F1-1` solo motor · `F2-8a` solo prosa · `F2-8b` solo motor · `F3-1` solo prosa · `F3-2` solo motor · `F4-1` solo motor · `F4-9a` solo motor · `F7-5` solo motor · `F7-8` solo motor · `F7-9` solo motor · `F13-1` solo prosa · `G2-1` solo prosa · `G2-2` solo prosa · `G2-4` solo prosa · `G2-7` solo prosa · `G2-10` solo motor · `G2-11` solo motor · `G4-1` solo prosa · `H1-1` solo prosa · `H1-1a` solo motor · `H1-1b` solo motor · `H1-2` solo motor · `H2-1` solo prosa · `H3-1` solo prosa · `H3-6` solo prosa · `J2-4` solo prosa · `J2-5` solo prosa · `J2-6` solo prosa · `J3-1` solo prosa · `J3-3a` solo prosa · `J3-4` solo prosa · `J3-6a` solo prosa · `J3-6b` solo prosa · `J3-6c` solo prosa · `J3-6d` solo prosa · `J4-1` solo prosa · `J4-2` solo prosa · `J4-3` solo prosa · `J4-4` solo prosa · `J4-5` solo prosa · `J4-6` solo prosa · `J10-1` solo prosa · `J10-2` solo prosa · `J10-4` solo prosa · `J10-9` solo prosa · `J10-10` solo prosa · `J10-11` solo prosa · `J10-12` solo prosa

**Sin revisar contra el PDF (88).** Nadie abrió todavía la página
rasterizada para comparar la forma algebraica y el origen del coeficiente:

`A-3-1M` · `A-8-3` · `A-8-5` · `B3-1` · `B3-2` · `D2-1` · `D2-2` · `D3-1` · `E3-1` · `E3-2` · `E3-3` · `E3-4` · `E4-1` · `E4-2` · `E4-3` · `E7-1` · `E7-2` · `E7-3` · `E7-5` · `E7-7` · `F1-1` · `F2-1` · `F2-2` · `F2-3` · `F2-4` · `F2-5` · `F2-6` · `F2-8a` · `F2-8b` · `F3-1` · `F3-2` · `F6-1` · `F6-2` · `F6-3` · `F6-4` · `F7-1` · `F7-2` · `F7-3` · `F7-4` · `F7-5` · `F7-6` · `F7-7` · `F7-8` · `F7-9` · `F7-10` · `F7-11` · `F8-1` · `F8-2` · `F8-3` · `F8-4` · `F13-1` · `G2-1` · `G2-2` · `G2-4` · `G2-7` · `G2-10` · `G2-11` · `G4-1` · `H1-1` · `H1-1a` · `H1-1b` · `H1-2` · `H2-1` · `H3-1` · `H3-6` · `J2-4` · `J2-5` · `J2-6` · `J3-1` · `J3-3a` · `J3-4` · `J3-6a` · `J3-6b` · `J3-6c` · `J3-6d` · `J4-1` · `J4-2` · `J4-3` · `J4-4` · `J4-5` · `J4-6` · `J10-1` · `J10-2` · `J10-4` · `J10-9` · `J10-10` · `J10-11` · `J10-12`

## AISC 360-22 — `aisc360-22`

PDF: `F:/OneDrive/Ingenieria/Normas/A360-22W-ewr.pdf`

| Ec. | Dónde | Doble entrada | Ancla | Revisada |
|---|---|---|---|---|
| `A-3-1M` | `acero/ejemplo-viga-carrilera-puente-grua.mdx:343` `acero/ejemplo-viga-carrilera-puente-grua.mdx:347` `acero/ejemplo-viga-carrilera-puente-grua.mdx:398` | `solo prosa` | — | ⬜ |
| `A-8-3` | `acero/ejemplo-viga-columna.mdx:135` `acero/ejemplo-viga-columna.mdx:195` | `solo prosa` | — | ⬜ |
| `A-8-5` | `acero/ejemplo-viga-columna.mdx:128` | `solo prosa` | — | ⬜ |
| `B3-1` | `acero/aisc360-22-capB-requisitos-de-diseno.mdx:56` | `solo prosa` | — | ⬜ |
| `B3-2` | `acero/aisc360-22-capB-requisitos-de-diseno.mdx:62` | `solo prosa` | — | ⬜ |
| `D2-1` | `acero/memoria.ts:340` `acero/seccion.ts:167` `acero/traccion.ts:23` `acero/traccion.ts:39` `acero/aisc360-22-capD-traccion.mdx:65` `acero/aisc360-22-capD-traccion.mdx:231` `acero/ejemplo-diagonal-hss-traccion.mdx:85` `acero/ejemplo-diagonal-hss-traccion.mdx:87` `acero/ejemplo-diagonal-hss-traccion.mdx:633` `acero/ejemplo-gusset-simple-apernado.mdx:134` `acero/ejemplo-gusset-simple-apernado.mdx:283` `acero/ejemplo-gusset-simple-soldado.mdx:176` | ✅ | `planilla:diagonal-hss-traccion` | ⬜ |
| `D2-2` | `acero/memoria.ts:344` `acero/seccion.ts:167` `acero/traccion.ts:25` `acero/traccion.ts:45` `acero/traccion.ts:52` `acero/aisc360-22-capD-traccion.mdx:82` `acero/aisc360-22-capD-traccion.mdx:232` `acero/ejemplo-diagonal-hss-traccion.mdx:102` `acero/ejemplo-diagonal-hss-traccion.mdx:104` `acero/ejemplo-diagonal-hss-traccion.mdx:148` `acero/ejemplo-diagonal-hss-traccion.mdx:634` `acero/ejemplo-gusset-apice-chevron.mdx:529` `acero/ejemplo-gusset-simple-apernado.mdx:134` `acero/ejemplo-gusset-simple-apernado.mdx:281` `acero/ejemplo-gusset-simple-soldado.mdx:81` `acero/ejemplo-gusset-simple-soldado.mdx:175` | ✅ | `planilla:diagonal-hss-traccion` | ⬜ |
| `D3-1` | `acero/memoria.ts:344` `acero/traccion.ts:51` `acero/aisc360-22-capD-traccion.mdx:90` `acero/ejemplo-diagonal-hss-traccion.mdx:102` `acero/ejemplo-gusset-simple-soldado.mdx:81` | ✅ | `planilla:diagonal-hss-traccion` | ⬜ |
| `E3-1` | `acero/memoria.ts:317` `acero/aisc360-22-capE-compresion.mdx:52` `acero/aisc360-22-capE-compresion.mdx:94` `acero/ejemplo-columna-galpon-compresion.mdx:138` `acero/ejemplo-diagonal-hss-traccion.mdx:275` `acero/ejemplo-diagonal-hss-traccion.mdx:312` `acero/ejemplo-viga-columna.mdx:90` | `solo memoria` | `planilla:columna-galpon-compresion` | ⬜ |
| `E3-2` | `acero/compresion.ts:45` `acero/memoria.ts:301` `acero/aisc360-22-capE-compresion.mdx:52` `acero/aisc360-22-capE-compresion.mdx:106` `acero/aisc360-22-capE-compresion.mdx:124` `acero/aisc360-22-capE-compresion.mdx:157` `acero/ejemplo-columna-galpon-compresion.mdx:150` `acero/ejemplo-columna-galpon-compresion.mdx:205` `acero/ejemplo-diagonal-hss-traccion.mdx:275` `acero/ejemplo-diagonal-hss-traccion.mdx:304` `acero/ejemplo-diagonal-hss-traccion.mdx:306` `acero/ejemplo-diagonal-hss-traccion.mdx:330` `acero/ejemplo-diagonal-hss-traccion.mdx:343` `acero/ejemplo-diagonal-hss-traccion.mdx:644` `acero/ejemplo-gusset-simple-apernado.mdx:234` `acero/ejemplo-viga-columna.mdx:82` | ✅ | `planilla:columna-galpon-compresion` | ⬜ |
| `E3-3` | `acero/compresion.ts:45` `acero/memoria.ts:302` `acero/aisc360-22-capE-compresion.mdx:52` `acero/aisc360-22-capE-compresion.mdx:106` `acero/aisc360-22-capE-compresion.mdx:133` `acero/aisc360-22-capE-compresion.mdx:252` `acero/ejemplo-columna-galpon-compresion.mdx:130` `acero/ejemplo-columna-galpon-compresion.mdx:132` `acero/ejemplo-columna-galpon-compresion.mdx:150` `acero/ejemplo-columna-galpon-compresion.mdx:206` `acero/ejemplo-diagonal-hss-traccion.mdx:330` `acero/ejemplo-diagonal-hss-traccion.mdx:645` | ✅ | `planilla:columna-galpon-compresion` | ⬜ |
| `E3-4` | `acero/compresion.ts:139` `acero/memoria.ts:293` `acero/aisc360-22-capE-compresion.mdx:111` `acero/ejemplo-columna-galpon-compresion.mdx:120` `acero/ejemplo-columna-galpon-compresion.mdx:122` `acero/ejemplo-diagonal-hss-traccion.mdx:275` `acero/ejemplo-diagonal-hss-traccion.mdx:295` `acero/ejemplo-viga-columna.mdx:82` | ✅ | `planilla:columna-galpon-compresion` | ⬜ |
| `E4-1` | `acero/aisc360-22-capE-compresion.mdx:52` | `solo prosa` | — | ⬜ |
| `E4-2` | `acero/compresion.ts:29` `acero/compresion.ts:143` `acero/memoria.ts:320` `acero/aisc360-22-capE-compresion.mdx:161` `acero/ejemplo-columna-galpon-compresion.mdx:179` `acero/ejemplo-columna-galpon-compresion.mdx:185` `acero/ejemplo-columna-galpon-compresion.mdx:188` `acero/ejemplo-columna-galpon-compresion.mdx:207` | ✅ | `planilla:columna-galpon-compresion` | ⬜ |
| `E4-3` | `acero/aisc360-22-capE-compresion.mdx:170` `acero/ejemplo-columna-galpon-compresion.mdx:176` | `solo prosa` | — | ⬜ |
| `E7-1` | `acero/aisc360-22-capE-compresion.mdx:52` `acero/aisc360-22-capE-compresion.mdx:206` | `solo prosa` | — | ⬜ |
| `E7-2` | `acero/compresion.ts:62` | `solo motor` | — | ⬜ |
| `E7-3` | `acero/aisc360-22-capE-compresion.mdx:215` | `solo prosa` | — | ⬜ |
| `E7-5` | `acero/compresion.ts:62` `acero/aisc360-22-capE-compresion.mdx:223` | `solo motor` | — | ⬜ |
| `E7-7` | `acero/aisc360-22-capE-compresion.mdx:227` | `solo prosa` | — | ⬜ |
| `F1-1` | `acero/seccion.ts:328` `acero/tipos.ts:79` `acero/aisc360-22-capF-flexion.mdx:158` `acero/aisc360-22-capF-flexion.mdx:288` `acero/ejemplo-viga-columna.mdx:105` `acero/ejemplo-viga-ltb.mdx:106` `acero/ejemplo-viga-ltb.mdx:109` `acero/ejemplo-viga-ltb.mdx:150` | `solo motor` | `planilla:viga-ltb` | ⬜ |
| `F2-1` | `acero/flexion.ts:39` `acero/flexion.ts:300` `acero/memoria.ts:393` `acero/memoria.ts:506` `acero/aisc360-22-capF-flexion.mdx:61` `acero/aisc360-22-capF-flexion.mdx:283` `acero/ejemplo-viga-carrilera-puente-grua.mdx:160` `acero/ejemplo-viga-carrilera-puente-grua.mdx:162` `acero/ejemplo-viga-carrilera-puente-grua.mdx:390` `acero/ejemplo-viga-columna.mdx:107` `acero/ejemplo-viga-ltb.mdx:56` `acero/ejemplo-viga-ltb.mdx:58` `acero/ejemplo-viga-ltb.mdx:185` | ✅ | `planilla:viga-ltb` | ⬜ |
| `F2-2` | `acero/flexion.ts:176` `acero/memoria.ts:521` `acero/aisc360-22-capF-flexion.mdx:112` `acero/aisc360-22-capF-flexion.mdx:170` `acero/aisc360-22-capF-flexion.mdx:209` `acero/aisc360-22-capF-flexion.mdx:285` `acero/ejemplo-viga-carrilera-puente-grua.mdx:179` `acero/ejemplo-viga-carrilera-puente-grua.mdx:182` `acero/ejemplo-viga-carrilera-puente-grua.mdx:391` `acero/ejemplo-viga-columna.mdx:107` `acero/ejemplo-viga-columna.mdx:212` `acero/ejemplo-viga-ltb.mdx:156` `acero/ejemplo-viga-ltb.mdx:188` | ✅ | `planilla:viga-ltb` | ⬜ |
| `F2-3` | `acero/flexion.ts:181` `acero/memoria.ts:529` `acero/aisc360-22-capF-flexion.mdx:121` `acero/aisc360-22-capF-flexion.mdx:170` `acero/ejemplo-viga-ltb.mdx:103` `acero/ejemplo-viga-ltb.mdx:123` `acero/ejemplo-viga-ltb.mdx:187` | ✅ | `planilla:viga-ltb` | ⬜ |
| `F2-4` | `acero/flexion.ts:7` `acero/flexion.ts:80` `acero/flexion.ts:111` `acero/flexion.ts:181` `acero/memoria.ts:529` `acero/ejemplo-viga-ltb.mdx:116` | ✅ | `planilla:viga-ltb` | ⬜ |
| `F2-5` | `acero/flexion.ts:64` `acero/flexion.ts:104` `acero/memoria.ts:509` `acero/aisc360-22-capF-flexion.mdx:134` `acero/ejemplo-viga-carrilera-puente-grua.mdx:160` `acero/ejemplo-viga-columna.mdx:103` `acero/ejemplo-viga-ltb.mdx:82` `acero/ejemplo-viga-ltb.mdx:85` | ✅ | `planilla:viga-ltb` | ⬜ |
| `F2-6` | `acero/flexion.ts:66` `acero/flexion.ts:110` `acero/memoria.ts:509` `acero/aisc360-22-capF-flexion.mdx:140` `acero/ejemplo-viga-carrilera-puente-grua.mdx:160` `acero/ejemplo-viga-carrilera-puente-grua.mdx:170` `acero/ejemplo-viga-columna.mdx:103` `acero/ejemplo-viga-ltb.mdx:83` `acero/ejemplo-viga-ltb.mdx:91` | ✅ | `planilla:viga-ltb` | ⬜ |
| `F2-8a` | `acero/ejemplo-viga-carrilera-puente-grua.mdx:176` | `solo prosa` | — | ⬜ |
| `F2-8b` | `acero/flexion.ts:111` | `solo motor` | `planilla:viga-ltb` | ⬜ |
| `F3-1` | `acero/aisc360-22-capF-flexion.mdx:200` | `solo prosa` | — | ⬜ |
| `F3-2` | `acero/flexion.ts:198` | `solo motor` | — | ⬜ |
| `F4-1` | `acero/flexion.ts:245` `acero/flexion.ts:321` | `solo motor` | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F4-2` | `acero/flexion.ts:340` `acero/memoria.ts:445` | ✅ | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F4-3` | `acero/flexion.ts:345` `acero/memoria.ts:451` | ✅ | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F4-4` | `acero/flexion.ts:72` `acero/flexion.ts:302` `acero/memoria.ts:395` | ✅ | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F4-5` | `acero/flexion.ts:325` `acero/flexion.ts:345` `acero/memoria.ts:451` | ✅ | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F4-6a` | `acero/flexion.ts:30` `acero/flexion.ts:74` `acero/flexion.ts:283` `acero/flexion.ts:303` `acero/memoria.ts:395` | ✅ | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F4-7` | `acero/flexion.ts:64` `acero/flexion.ts:324` `acero/flexion.ts:415` `acero/memoria.ts:426` `acero/memoria.ts:427` | ✅ | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F4-8` | `acero/flexion.ts:66` `acero/flexion.ts:325` `acero/flexion.ts:331` `acero/memoria.ts:426` | ✅ | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F4-9a` | `acero/flexion.ts:68` `acero/flexion.ts:242` `acero/flexion.ts:256` | `solo motor` | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F4-9b` | `acero/flexion.ts:35` `acero/flexion.ts:242` `acero/flexion.ts:258` `acero/memoria.ts:404` | ✅ | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F4-11` | `acero/flexion.ts:76` `acero/flexion.ts:226` `acero/flexion.ts:233` `acero/memoria.ts:398` | ✅ | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F4-12` | `acero/flexion.ts:78` `acero/flexion.ts:225` `acero/memoria.ts:398` | ✅ | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F4-13` | `acero/flexion.ts:355` `acero/memoria.ts:478` | ✅ | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F4-14` | `acero/flexion.ts:359` `acero/memoria.ts:485` | ✅ | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F5-1` | `acero/flexion.ts:422` `acero/flexion.ts:424` `acero/memoria.ts:418` | ✅ | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F5-2` | `acero/flexion.ts:432` `acero/flexion.ts:438` `acero/memoria.ts:457` `acero/memoria.ts:463` | ✅ | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F5-3` | `acero/flexion.ts:432` `acero/memoria.ts:457` | ✅ | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F5-4` | `acero/flexion.ts:438` `acero/memoria.ts:463` | ✅ | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F5-5` | `acero/flexion.ts:66` `acero/flexion.ts:416` `acero/memoria.ts:427` | ✅ | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F5-6` | `acero/flexion.ts:36` `acero/flexion.ts:70` `acero/flexion.ts:226` `acero/flexion.ts:262` `acero/flexion.ts:412` `acero/flexion.ts:479` `acero/flexion.ts:613` `acero/flexion.ts:621` `acero/memoria.ts:412` `acero/memoria.ts:601` `acero/memoria.ts:602` | ✅ | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F5-7` | `acero/flexion.ts:447` `acero/flexion.ts:451` `acero/memoria.ts:488` `acero/memoria.ts:494` | ✅ | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F5-8` | `acero/flexion.ts:447` `acero/memoria.ts:488` | ✅ | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F5-9` | `acero/flexion.ts:451` `acero/memoria.ts:494` | ✅ | `continuidad λ_pw/λ_rw` | ✅ `fcea3f5` |
| `F6-1` | `acero/flexion.ts:495` `acero/memoria.ts:538` | ✅ | — | ⬜ |
| `F6-2` | `acero/flexion.ts:504` `acero/memoria.ts:542` | ✅ | — | ⬜ |
| `F6-3` | `acero/flexion.ts:508` `acero/memoria.ts:548` | ✅ | — | ⬜ |
| `F6-4` | `acero/flexion.ts:507` `acero/memoria.ts:548` | ✅ | — | ⬜ |
| `F7-1` | `acero/flexion.ts:563` `acero/memoria.ts:563` `acero/ejemplo-viga-hss-flexion.mdx:126` `acero/ejemplo-viga-hss-flexion.mdx:131` `acero/ejemplo-viga-hss-flexion.mdx:316` | ✅ | `planilla:viga-hss-flexion` | ⬜ |
| `F7-2` | `acero/flexion.ts:11` `acero/flexion.ts:20` `acero/flexion.ts:567` `acero/flexion.ts:575` `acero/memoria.ts:581` `acero/memoria.ts:585` `acero/ejemplo-viga-hss-flexion.mdx:140` `acero/ejemplo-viga-hss-flexion.mdx:145` `acero/ejemplo-viga-hss-flexion.mdx:260` `acero/ejemplo-viga-hss-flexion.mdx:274` `acero/ejemplo-viga-hss-flexion.mdx:284` `acero/ejemplo-viga-hss-flexion.mdx:317` `acero/ejemplo-viga-hss-flexion.mdx:319` `acero/ejemplo-viga-hss-flexion.mdx:320` | ✅ | `planilla:viga-hss-flexion` | ⬜ |
| `F7-3` | `acero/flexion.ts:11` `acero/flexion.ts:578` `acero/memoria.ts:569` `acero/ejemplo-viga-hss-flexion.mdx:160` `acero/ejemplo-viga-hss-flexion.mdx:199` `acero/ejemplo-viga-hss-flexion.mdx:260` `acero/ejemplo-viga-hss-flexion.mdx:318` | ✅ | `planilla:viga-hss-flexion` | ⬜ |
| `F7-4` | `acero/flexion.ts:11` `acero/flexion.ts:18` `acero/flexion.ts:578` `acero/memoria.ts:566` `acero/memoria.ts:569` `acero/ejemplo-viga-hss-flexion.mdx:160` `acero/ejemplo-viga-hss-flexion.mdx:163` `acero/ejemplo-viga-hss-flexion.mdx:165` `acero/ejemplo-viga-hss-flexion.mdx:260` `acero/ejemplo-viga-hss-flexion.mdx:318` `acero/ejemplo-viga-hss-flexion.mdx:368` `acero/ejemplo-viga-hss-flexion.mdx:388` | ✅ | `planilla:viga-hss-flexion` | ⬜ |
| `F7-5` | `acero/flexion.ts:18` `acero/flexion.ts:579` `acero/ejemplo-viga-hss-flexion.mdx:388` | `solo motor` | `no implementada` | ⬜ |
| `F7-6` | `acero/flexion.ts:12` `acero/flexion.ts:19` `acero/flexion.ts:20` `acero/flexion.ts:567` `acero/flexion.ts:593` `acero/memoria.ts:593` `acero/ejemplo-viga-hss-flexion.mdx:274` `acero/ejemplo-viga-hss-flexion.mdx:276` `acero/ejemplo-viga-hss-flexion.mdx:310` `acero/ejemplo-viga-hss-flexion.mdx:368` `acero/ejemplo-viga-hss-flexion.mdx:388` | ✅ | `planilla:viga-hss-flexion` | ⬜ |
| `F7-7` | `acero/flexion.ts:70` `acero/flexion.ts:78` `acero/flexion.ts:613` `acero/flexion.ts:621` `acero/memoria.ts:601` `acero/memoria.ts:602` | ✅ | — | ⬜ |
| `F7-8` | `acero/flexion.ts:12` `acero/flexion.ts:19` `acero/flexion.ts:37` `acero/flexion.ts:639` `acero/ejemplo-viga-hss-flexion.mdx:234` `acero/ejemplo-viga-hss-flexion.mdx:237` `acero/ejemplo-viga-hss-flexion.mdx:269` `acero/ejemplo-viga-hss-flexion.mdx:289` `acero/ejemplo-viga-hss-flexion.mdx:330` `acero/ejemplo-viga-hss-flexion.mdx:368` `acero/ejemplo-viga-hss-flexion.mdx:389` | `solo motor` | `planilla:viga-hss-flexion` | ⬜ |
| `F7-9` | `acero/flexion.ts:13` `acero/flexion.ts:644` `acero/flexion.ts:663` `acero/flexion.ts:668` `acero/ejemplo-viga-hss-flexion.mdx:247` | `solo motor` | — | ⬜ |
| `F7-10` | `acero/flexion.ts:64` `acero/flexion.ts:632` `acero/memoria.ts:611` `acero/ejemplo-viga-hss-flexion.mdx:216` `acero/ejemplo-viga-hss-flexion.mdx:368` | ✅ | `planilla:viga-hss-flexion` | ⬜ |
| `F7-11` | `acero/flexion.ts:19` `acero/flexion.ts:66` `acero/flexion.ts:633` `acero/memoria.ts:611` `acero/ejemplo-viga-hss-flexion.mdx:223` `acero/ejemplo-viga-hss-flexion.mdx:368` | ✅ | `planilla:viga-hss-flexion` | ⬜ |
| `F8-1` | `acero/flexion.ts:703` `acero/memoria.ts:628` | ✅ | — | ⬜ |
| `F8-2` | `acero/flexion.ts:710` `acero/memoria.ts:635` | ✅ | — | ⬜ |
| `F8-3` | `acero/flexion.ts:713` `acero/memoria.ts:639` | ✅ | — | ⬜ |
| `F8-4` | `acero/flexion.ts:713` `acero/memoria.ts:639` | ✅ | — | ⬜ |
| `F13-1` | `acero/ejemplo-conexion-momento-placas-ala.mdx:132` `acero/ejemplo-conexion-momento-placas-ala.mdx:271` `acero/ejemplo-empalme-apernado-viga.mdx:204` `acero/ejemplo-empalme-apernado-viga.mdx:223` | `solo prosa` | — | ⬜ |
| `G2-1` | `acero/aisc360-22-capG-corte.mdx:29` `acero/aisc360-22-capG-corte.mdx:202` `acero/ejemplo-viga-carrilera-puente-grua.mdx:264` `acero/ejemplo-viga-carrilera-puente-grua.mdx:393` | `solo prosa` | — | ⬜ |
| `G2-2` | `acero/aisc360-22-capG-corte.mdx:68` | `solo prosa` | — | ⬜ |
| `G2-4` | `acero/aisc360-22-capG-corte.mdx:77` | `solo prosa` | — | ⬜ |
| `G2-7` | `acero/aisc360-22-capG-corte.mdx:137` `acero/aisc360-22-capG-corte.mdx:184` `acero/aisc360-22-capG-corte.mdx:205` | `solo prosa` | — | ⬜ |
| `G2-10` | `acero/corte.ts:10` | `solo motor` | `planilla:viga-hss-flexion` | ⬜ |
| `G2-11` | `acero/corte.ts:11` | `solo motor` | — | ⬜ |
| `G4-1` | `acero/ejemplo-viga-hss-flexion.mdx:301` `acero/ejemplo-viga-hss-flexion.mdx:321` | `solo prosa` | — | ⬜ |
| `H1-1` *(familia)* | `acero/ejemplo-viga-columna.mdx:57` | `solo prosa` | — | ⬜ |
| `H1-1a` | `acero/interaccion.ts:2` `acero/seccion.ts:249` `acero/aisc360-22-capH-fuerzas-combinadas.mdx:73` `acero/ejemplo-viga-columna.mdx:153` `acero/ejemplo-viga-columna.mdx:156` `acero/ejemplo-viga-columna.mdx:196` | `solo motor` | `planilla:viga-columna` | ⬜ |
| `H1-1b` | `acero/interaccion.ts:2` `acero/interaccion.ts:18` `acero/seccion.ts:249` `acero/aisc360-22-capH-fuerzas-combinadas.mdx:81` `acero/aisc360-22-capH-fuerzas-combinadas.mdx:199` `acero/ejemplo-viga-carrilera-puente-grua.mdx:239` `acero/ejemplo-viga-carrilera-puente-grua.mdx:392` | `solo motor` | `planilla:viga-columna` | ⬜ |
| `H1-2` | `acero/seccion.ts:316` | `solo motor` | `no implementada` | ⬜ |
| `H2-1` | `acero/aisc360-22-capH-fuerzas-combinadas.mdx:116` `acero/aisc360-22-capH-fuerzas-combinadas.mdx:179` `acero/aisc360-22-capH-fuerzas-combinadas.mdx:201` | `solo prosa` | — | ⬜ |
| `H3-1` | `acero/aisc360-22-capH-fuerzas-combinadas.mdx:133` `acero/aisc360-22-capH-fuerzas-combinadas.mdx:202` | `solo prosa` | — | ⬜ |
| `H3-6` | `acero/aisc360-22-capH-fuerzas-combinadas.mdx:149` `acero/aisc360-22-capH-fuerzas-combinadas.mdx:177` `acero/aisc360-22-capH-fuerzas-combinadas.mdx:203` | `solo prosa` | — | ⬜ |
| `J2-4` | `acero/aisc360-22-capJ-conexiones.mdx:124` `acero/ejemplo-conexion-momento-end-plate.mdx:199` `acero/ejemplo-conexion-momento-end-plate.mdx:253` `acero/ejemplo-diagonal-hss-traccion.mdx:165` `acero/ejemplo-diagonal-hss-traccion.mdx:167` `acero/ejemplo-diagonal-hss-traccion.mdx:533` `acero/ejemplo-diagonal-hss-traccion.mdx:635` `acero/ejemplo-diagonal-hss-traccion.mdx:656` `acero/ejemplo-gusset-apice-chevron.mdx:529` | `solo prosa` | — | ⬜ |
| `J2-5` | `acero/aisc360-22-capJ-conexiones.mdx:139` `acero/aisc360-22-capJ-conexiones.mdx:250` `acero/ejemplo-conexion-momento-end-plate.mdx:197` | `solo prosa` | — | ⬜ |
| `J2-6` | `acero/ejemplo-gusset-simple-soldado.mdx:54` | `solo prosa` | — | ⬜ |
| `J3-1` | `acero/aisc360-22-capJ-conexiones.mdx:59` `acero/ejemplo-conexion-apernada-corte.mdx:61` `acero/ejemplo-conexion-apernada-corte.mdx:65` `acero/ejemplo-conexion-apernada-corte.mdx:265` `acero/ejemplo-conexion-doble-angulo.mdx:62` `acero/ejemplo-conexion-doble-angulo.mdx:64` `acero/ejemplo-conexion-doble-angulo.mdx:199` `acero/ejemplo-conexion-momento-end-plate.mdx:77` `acero/ejemplo-conexion-momento-end-plate.mdx:79` `acero/ejemplo-conexion-momento-end-plate.mdx:216` `acero/ejemplo-conexion-momento-end-plate.mdx:252` `acero/ejemplo-conexion-momento-end-plate.mdx:256` `acero/ejemplo-conexion-momento-placas-ala.mdx:68` `acero/ejemplo-conexion-momento-placas-ala.mdx:70` `acero/ejemplo-conexion-momento-placas-ala.mdx:267` `acero/ejemplo-empalme-apernado-viga.mdx:104` `acero/ejemplo-empalme-apernado-viga.mdx:108` `acero/ejemplo-empalme-apernado-viga.mdx:222` `acero/ejemplo-gusset-esquina-apernado.mdx:259` | `solo prosa` | — | ⬜ |
| `J3-3a` | `acero/aisc360-22-capJ-conexiones.mdx:90` `acero/aisc360-22-capJ-conexiones.mdx:248` | `solo prosa` | — | ⬜ |
| `J3-4` | `acero/aisc360-22-capJ-conexiones.mdx:99` `acero/aisc360-22-capJ-conexiones.mdx:249` `acero/ejemplo-empalme-apernado-viga.mdx:124` `acero/ejemplo-empalme-apernado-viga.mdx:218` `acero/ejemplo-empalme-apernado-viga.mdx:226` `acero/ejemplo-empalme-apernado-viga.mdx:270` | `solo prosa` | — | ⬜ |
| `J3-6a` | `acero/aisc360-22-capJ-conexiones.mdx:166` `acero/aisc360-22-capJ-conexiones.mdx:168` `acero/aisc360-22-capJ-conexiones.mdx:219` `acero/aisc360-22-capJ-conexiones.mdx:251` `acero/ejemplo-conexion-apernada-corte.mdx:267` `acero/ejemplo-conexion-doble-angulo.mdx:82` `acero/ejemplo-conexion-doble-angulo.mdx:200` `acero/ejemplo-conexion-doble-angulo.mdx:201` `acero/ejemplo-conexion-momento-placas-ala.mdx:266` `acero/ejemplo-empalme-apernado-viga.mdx:224` `acero/ejemplo-empalme-apernado-viga.mdx:225` `acero/ejemplo-gusset-esquina-apernado.mdx:494` `acero/ejemplo-gusset-simple-apernado.mdx:104` | `solo prosa` | — | ⬜ |
| `J3-6b` | `acero/aisc360-22-capJ-conexiones.mdx:177` | `solo prosa` | — | ⬜ |
| `J3-6c` | `acero/aisc360-22-capJ-conexiones.mdx:166` `acero/aisc360-22-capJ-conexiones.mdx:169` `acero/aisc360-22-capJ-conexiones.mdx:251` `acero/ejemplo-conexion-apernada-corte.mdx:87` `acero/ejemplo-conexion-apernada-corte.mdx:90` `acero/ejemplo-gusset-esquina-apernado.mdx:494` `acero/ejemplo-gusset-simple-apernado.mdx:104` `acero/ejemplo-gusset-simple-apernado.mdx:339` | `solo prosa` | — | ⬜ |
| `J3-6d` | `acero/aisc360-22-capJ-conexiones.mdx:177` | `solo prosa` | — | ⬜ |
| `J4-1` | `acero/ejemplo-conexion-momento-placas-ala.mdx:103` `acero/ejemplo-conexion-momento-placas-ala.mdx:269` `acero/ejemplo-empalme-apernado-viga.mdx:75` `acero/ejemplo-empalme-apernado-viga.mdx:219` `acero/ejemplo-gusset-apice-chevron.mdx:246` `acero/ejemplo-gusset-apice-chevron.mdx:394` `acero/ejemplo-gusset-simple-apernado.mdx:175` `acero/ejemplo-gusset-simple-apernado.mdx:286` `acero/ejemplo-gusset-simple-soldado.mdx:119` `acero/ejemplo-gusset-simple-soldado.mdx:181` `acero/ejemplo-gusset-simple-soldado.mdx:191` | `solo prosa` | — | ⬜ |
| `J4-2` | `acero/ejemplo-conexion-momento-placas-ala.mdx:103` `acero/ejemplo-conexion-momento-placas-ala.mdx:270` `acero/ejemplo-empalme-apernado-viga.mdx:75` `acero/ejemplo-empalme-apernado-viga.mdx:220` `acero/ejemplo-gusset-apice-chevron.mdx:248` `acero/ejemplo-gusset-esquina-apernado.mdx:494` `acero/ejemplo-gusset-simple-apernado.mdx:175` `acero/ejemplo-gusset-simple-apernado.mdx:287` `acero/ejemplo-gusset-simple-soldado.mdx:119` `acero/ejemplo-gusset-simple-soldado.mdx:183` `acero/ejemplo-gusset-simple-soldado.mdx:192` `acero/gusset-teoria-estados-limite.mdx:335` | `solo prosa` | — | ⬜ |
| `J4-3` | `acero/ejemplo-conexion-doble-angulo.mdx:202` `acero/ejemplo-conexion-momento-end-plate.mdx:182` `acero/ejemplo-conexion-momento-end-plate.mdx:255` `acero/ejemplo-empalme-apernado-viga.mdx:176` `acero/ejemplo-empalme-apernado-viga.mdx:227` `acero/ejemplo-gusset-apice-chevron.mdx:388` `acero/ejemplo-gusset-apice-chevron.mdx:491` `acero/ejemplo-gusset-apice-chevron.mdx:529` `acero/ejemplo-gusset-esquina-apernado.mdx:494` `acero/ejemplo-gusset-simple-apernado.mdx:274` `acero/ejemplo-gusset-simple-apernado.mdx:289` `acero/ejemplo-gusset-simple-soldado.mdx:169` `acero/ejemplo-gusset-simple-soldado.mdx:182` `acero/gusset-teoria-estados-limite.mdx:307` | `solo prosa` | — | ⬜ |
| `J4-4` | `acero/ejemplo-conexion-doble-angulo.mdx:203` `acero/ejemplo-conexion-momento-end-plate.mdx:182` `acero/ejemplo-conexion-momento-end-plate.mdx:254` `acero/ejemplo-empalme-apernado-viga.mdx:177` `acero/ejemplo-empalme-apernado-viga.mdx:228` `acero/gusset-teoria-estados-limite.mdx:336` | `solo prosa` | — | ⬜ |
| `J4-5` | `acero/aisc360-22-capD-traccion.mdx:183` `acero/aisc360-22-capD-traccion.mdx:212` `acero/aisc360-22-capD-traccion.mdx:234` `acero/aisc360-22-capJ-conexiones.mdx:193` `acero/aisc360-22-capJ-conexiones.mdx:253` `acero/ejemplo-conexion-apernada-corte.mdx:146` `acero/ejemplo-conexion-apernada-corte.mdx:149` `acero/ejemplo-conexion-apernada-corte.mdx:270` `acero/ejemplo-conexion-doble-angulo.mdx:118` `acero/ejemplo-conexion-doble-angulo.mdx:204` `acero/ejemplo-diagonal-hss-traccion.mdx:214` `acero/ejemplo-diagonal-hss-traccion.mdx:217` `acero/ejemplo-diagonal-hss-traccion.mdx:580` `acero/ejemplo-diagonal-hss-traccion.mdx:636` `acero/ejemplo-diagonal-hss-traccion.mdx:657` `acero/ejemplo-empalme-apernado-viga.mdx:240` `acero/ejemplo-gusset-apice-chevron.mdx:116` `acero/ejemplo-gusset-apice-chevron.mdx:529` `acero/ejemplo-gusset-simple-apernado.mdx:197` `acero/ejemplo-gusset-simple-apernado.mdx:284` `acero/ejemplo-gusset-simple-apernado.mdx:339` `acero/ejemplo-gusset-simple-soldado.mdx:133` `acero/ejemplo-gusset-simple-soldado.mdx:180` `acero/ejemplo-gusset-simple-soldado.mdx:193` `acero/ejemplo-gusset-simple-soldado.mdx:245` | `solo prosa` | — | ⬜ |
| `J4-6` | `acero/ejemplo-gusset-esquina-apernado.mdx:332` `acero/gusset-teoria-estados-limite.mdx:338` | `solo prosa` | — | ⬜ |
| `J10-1` | `acero/ejemplo-conexion-momento-end-plate.mdx:257` `acero/ejemplo-conexion-momento-placas-ala.mdx:150` `acero/ejemplo-conexion-momento-placas-ala.mdx:275` `acero/ejemplo-conexion-momento-placas-ala.mdx:312` | `solo prosa` | — | ⬜ |
| `J10-2` | `acero/ejemplo-conexion-momento-placas-ala.mdx:160` `acero/ejemplo-conexion-momento-placas-ala.mdx:233` `acero/ejemplo-conexion-momento-placas-ala.mdx:274` `acero/ejemplo-gusset-esquina-apernado.mdx:394` `acero/ejemplo-viga-carrilera-puente-grua.mdx:282` `acero/ejemplo-viga-carrilera-puente-grua.mdx:394` | `solo prosa` | — | ⬜ |
| `J10-4` | `acero/ejemplo-conexion-momento-placas-ala.mdx:168` `acero/ejemplo-conexion-momento-placas-ala.mdx:272` `acero/ejemplo-viga-carrilera-puente-grua.mdx:289` `acero/ejemplo-viga-carrilera-puente-grua.mdx:395` | `solo prosa` | — | ⬜ |
| `J10-9` | `acero/ejemplo-conexion-momento-end-plate.mdx:258` | `solo prosa` | — | ⬜ |
| `J10-10` | `acero/ejemplo-conexion-momento-placas-ala.mdx:191` `acero/ejemplo-conexion-momento-placas-ala.mdx:202` `acero/ejemplo-conexion-momento-placas-ala.mdx:245` `acero/ejemplo-conexion-momento-placas-ala.mdx:273` | `solo prosa` | — | ⬜ |
| `J10-11` | `acero/ejemplo-conexion-momento-placas-ala.mdx:206` | `solo prosa` | — | ⬜ |
| `J10-12` | `acero/ejemplo-conexion-momento-placas-ala.mdx:216` | `solo prosa` | — | ⬜ |

---

Índice de normas regenerado con `npm run indice:normas` (2026-08-05).
Su fuente son las extracciones de `material_teorico/_procesamiento/raw/normas`,
cuyo inventario de etiquetas se contrastó contra el PDF: para AISC 360-22 coinciden
EXACTO en los ocho capítulos ingeridos (B 2, C 3, D 5, E 30, F 105, G 25, H 16,
J 41). Los Caps. I y K no están ingeridos y ninguna herramienta los toca.
