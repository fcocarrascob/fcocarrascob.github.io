# Índice de memos

Qué hay acumulado en `ejemplos/`, en qué estado y con qué veredicto. El contrato está en
[README.md](README.md); la plantilla en blanco, en [_PLANTILLA.md](_PLANTILLA.md).

`estado` — **verificado**: toda cláusula leída en el PDF de la edición vigente · **pendiente**:
queda al menos una por leer, no se promueve así.

La tabla se genera desde el frontmatter de cada memo: `npm run ejemplos` la regenera y
`npm run verify:ejemplos` falla si quedó desactualizada o si un memo rompe el contrato.

<!-- INDICE:INICIO -->
| Caso | Disciplina | Tema | Estado | Veredicto | Post |
|---|---|---|---|---|---|
| [La diagonal fusible se diseña dos veces — NCh2369 §8.3 y §8.6](acero/diagonal-fusible-contrato-nch2369.md) | acero | Arriostramientos | verificado | Como miembro usa 0,50 de sí misma; como fusible factura 841 kN a la conexión, 519 al puntal y 587 a la columna. Sobredimensionarla no la mejora — encarece el contrato que exporta. | — |
| [Diagonal de paño en V invertida — NCh2369 §8.6](acero/diagonal-v-invertida-nch2369.md) | acero | Arriostramientos | verificado | Cierra con HSS 125×125×6 (uso 0,67), pero el perfil lo elige la Tabla 9, no la resistencia — el 5 mm pasaba resistencia (0,79) y falla b/t (22 > 18,9), porque el R_y nacional endurece el límite. Eximirse por 0,7R₁ costaría 2,2 veces el acero. | — |
| [Puntal entre paños en X — NCh2369 §8.6.7](acero/puntal-entre-x-nch2369.md) | acero | Arriostramientos | verificado | Cierra con HSS 150×150×8 (0,89) para un elemento que el análisis mostraba descargado — el equilibrio post-pandeo le pone 519 kN de compresión. Y el cruce que salva la diagonal (sin él, KL/r = 148 > 133) le sube la residual ×2,8 al puntal. | — |
| [Viga del paño en V invertida — NCh2369 §8.6.6](acero/viga-pano-v-invertida-nch2369.md) | acero | Arriostramientos | verificado | Cierra con HEB 500 (H1 = 0,88), pero la gravedad pedía Z_x = 340 cm³ y el equilibrio post-pandeo pide 4 100 — el pandeo de la diagonal multiplica la viga por 12. | — |
| [La columna del marco en X — NCh2369 §8.3.4](acero/columna-marco-x-capacidad-nch2369.md) | acero | Columnas | verificado | Cada elemento del mismo mecanismo tiene su peor estado = el puntal, el post-pandeo que §8.6.7 escribe; la columna, el pandeo incipiente que C8.6.7 declara no evaluar. Reusar el estado del puntal deja la demanda 31 % baja. Cierra con HEB 300 (0,77) y exporta 1 564 kN de levantamiento. | — |
| [La conexión BFP re-verificada por capacidad — NCh2369 §8.7.5](acero/conexion-bfp-capacidad-nch2369.md) | acero | Conexiones | verificado | Con el tope de §8.7.5 (41,6 tonf·m) la conexión pasa al filo (0,99) y la columna queda en 1,86/1,45/1,38. Los PL 100×12 no cumplen §8.7.6 (pide 20 mm) y la viga perforada rompe a 0,81·M_pe — el fusible dúctil no existe. | — |
| [Base empotrada — los pernos pagan la mitad de M_pe (NCh2369 §8.5.2)](acero/placa-base-empotrada-nch2369.md) | acero | Placas base | verificado | No cierra — el piso de 0,5·M_pe* (279 kN·m) es 2,5 veces el momento del análisis y deja los pernos en 2,79. Sincerar la rigidez de la base o pagar el anclaje completo. | — |
| [Llave de corte — viento y sismo (ACI 318-25 §17.11 · NCh2369 §8.5.3)](acero/placa-base-llave-de-corte-nch2369.md) | acero | Placas base | verificado | La misma llave, dos normas y dos veredictos = bajo viento sobra (0,88) y bajo sismo no cierra (1,08). El sismo entra dos veces —amplifica ×1,4 y §8.5.4 borra los 65 kN de roce que la DG1 acreditaría— y la capacidad no se mueve. Cierra con pedestal de 1300 (0,84). | — |
| [La base como resorte — β_connection, β_footing y la serie (DG1 Ap. C)](acero/placa-base-rigidez-rotacional-dg1.md) | acero | Placas base | verificado | La base declarada empotrada entrega β_base = 18 480 kN·m/rad, el 55 % del 4EI/L de su propia columna. Y reparte la culpa: la fundación es 19 veces más rígida que la conexión, así que el empotramiento parcial vive en los pernos y la placa. Modelar el resorte del suelo y empotrar la conexión es afinar el resorte equivocado. | — |
| [Silla de anclaje — diseñada para el perno, no para la carga (NCh2369 C8.5.2)](acero/placa-base-silla-anclaje-nch2369.md) | acero | Placas base | verificado | No cierra — la placa superior que la carga valida (0,63) no resiste la fluencia esperada del perno (1,58) y pide 32 mm. Y el R_y hay que suponerlo — F1554 no está en la Tabla A3.2. | — |
| [Armadura de anclaje para el breakout de la llave — ACI 318-25 §17.5.2.1 + NCh2369 §8.5.5](hormigon/llave-corte-armadura-de-anclaje-nch2369.md) | hormigon | Anclajes | verificado | El breakout que no cerraba (1,08) se cose con 3 horquillas φ12 (uso 0,91) sin agrandar el pedestal. Pero la vía está escrita para pernos —§17.11 la calla—, los estribos de §9.5.3 quedan a 2,9 veces la distancia eficaz, y la armadura se cuelga de los 234 kN de la fluencia esperada de la llave, no de los 98 del análisis. Dos derivas de edición de regalo: φ pasó de 0,75 a 0,90 y la Ec. 25.4.3.1(a) SI está impresa con un denominador que nunca puede regir. | — |
| [El pedestal por capacidad — NCh2369 §9.5 + ACI 318-25](hormigon/pedestal-base-columna-nch2369.md) | hormigon | Anclajes | verificado | Cierra holgado (usos ≤ 0,37) — y esa es la tesis. La resistencia no dimensiona nada. La armadura la fija el 0,5 % mínimo y los estribos la zona de protección de §9.5.3, que con lado 1100 cubre casi todo el pedestal. | — |
| [La viga 30×60 como viga de marco especial — ACI 18.6 + NCh2369 §9.1.2](hormigon/viga-marco-especial-nch2369.md) | hormigon | Vigas | verificado | El corte de diseño sube 42 % (25,6 tonf) sin que llegue carga nueva del análisis — lo fija la propia armadura vía M_pr. V_c se salva por 7 puntos (43 % < 50 %), y los estribos de la rótula los rige el d/4 del confinamiento, no el corte. | — |
| [La zapata bajo el pedestal del cuarteto — NCh2369 Cap. 10](geotecnia/zapata-base-columna-nch2369.md) | geotecnia | Zapatas | verificado | Cierra con B = 3,1 m y la dimensiona el 80 % de área apoyada (0,93), no la presión ni el deslizamiento (0,44). El roce que §8.5.4 tarifa en cero arriba es la única resistencia lateral abajo — y sobra. | — |
| [La zapata B = 3,1 contra Das — capacidad de soporte y asentamiento](geotecnia/zapata-capacidad-y-asentamiento-das.md) | geotecnia | Zapatas | verificado | Los dos estados límite que NCh2369 no cubre sobran por mucho: FS = 11,5 y 13,0 contra 3, y 2,2 mm contra 25. La inclinación de 11° recorta la capacidad un 31 % y ni así gobierna — el 80 % de área apoyada sigue siendo lo único que dimensiona B. Y el k_v del informe es rigidez sísmica: subestima el asentamiento estático ×3. | — |
<!-- INDICE:FIN -->

## Las estructuras del corpus

Regla 2 en acción: pocas estructuras, muchos memos. Antes de inventar una estructura nueva, el
caso tiene que no caber en una de estas.

**El cuarteto de la base** — HEB 300 sobre placa 450 × 450 × 25, pedestal 1100 × 1100 y zapata
B = 3,1 m. Lo comparten los cuatro memos de placas base, el pedestal y las dos zapatas; las
magnitudes cruzan de un memo a otro por supuesto declarado.

**La cepa arriostrada** — un solo paño de 6 × 4 m, A36 con R_y = 1,3, R_1 = 5 y la misma diagonal
HSS 125×125×6, en las dos configuraciones que §8.6 trata distinto:

| | V invertida (§8.6.6) | X apiladas (§8.6.7) |
|---|---|---|
| Diagonal | 5,0 m — cos θ = 0,60 | 7,21 m con cruce — cos θ = 0,832 |
| Corte de piso | 294 kN | 400 kN |
| Axial en la diagonal | 245 kN | 240,4 kN |
| P_ne | 510,9 kN (KL/r = 102,8) | 724,6 kN (KL/r = 74,1) |
| Memos | diagonal, viga | diagonal fusible, puntal, columna |

El corte de piso difiere porque el ángulo difiere: la X, más tendida, convierte corte en axial con
menos eficiencia, y por eso las dos configuraciones cargan **la misma diagonal casi igual** (245
contra 240,4 kN). Cambia la configuración, no el elemento — eso es lo que las hace comparables y
no dos ejemplos sueltos.

**Un dueño por número.** Las capacidades esperadas de cada diagonal se derivan una sola vez y los
demás memos las heredan por supuesto declarado:

- X apiladas → las posee `diagonal-fusible-contrato` (T_ye = 928,2 kN, P_ne = 724,6 kN y el techo
  de tracción 841,3 kN).
- V invertida → las posee `viga-pano-v-invertida`, donde el equilibrio del nudo las necesita;
  `diagonal-v-invertida` diseña el miembro y le presta el F_e.
