# Índice de memos

Qué hay acumulado en `ejemplos/`, en qué estado y con qué veredicto. El formato está en
[README.md](README.md); la plantilla en blanco, en [_PLANTILLA.md](_PLANTILLA.md).

`estado` — **verificado**: toda cláusula leída en el PDF de la edición vigente · **pendiente**:
queda al menos una por leer, no se promueve así · **derivado-de-post**: transcripción de un
ejemplo ya publicado, no es cálculo nuevo.

| Caso | Disciplina | Tema | Estado | Veredicto | Post |
|---|---|---|---|---|---|
| [Placa base con momento — DG1](acero/placa-base-momento-dg1.md) | acero | Placas base | derivado-de-post | No cierra: gobierna el breakout del grupo traccionado (1,02) y su interacción con el corte (1,20) | [`placa-base-ejemplo-trabajado`](../src/content/acero/placa-base-ejemplo-trabajado.mdx) |
| [Llave de corte — ACI §17.11](acero/placa-base-llave-de-corte.md) | acero | Placas base | verificado | Cierra con 0,88 en el breakout de la llave, pero obliga a subir $h_{ef}$ de 400 a 450 mm | — |
| [Llave de corte sísmica — NCh2369 §8.5.3](acero/placa-base-llave-de-corte-nch2369.md) | acero | Placas base | verificado | No cierra: el breakout queda en 1,08 — el sismo amplifica ×1,4 y §8.5.4 prohíbe el roce que la DG1 acreditaría | — |
| [Base empotrada — NCh2369 §8.5.2](acero/placa-base-empotrada-nch2369.md) | acero | Placas base | verificado | No cierra: el piso de 0,5·$M_{pe}^*$ multiplica la tracción del perno por 4,2 y lo deja en 2,79 | — |
| [Silla de anclaje — NCh2369 C8.5.2](acero/placa-base-silla-anclaje-nch2369.md) | acero | Placas base | verificado | No cierra: la placa superior que la carga valida (0,63) falla bajo la fluencia esperada del perno (1,58); F1554 no está en la Tabla A3.2 | — |
| [Rigidez rotacional de la base — DG1 Ap. C](acero/placa-base-rigidez-rotacional-dg1.md) | acero | Placas base | verificado | La base «empotrada» entrega β = 19 430 kN·m/rad — el 58 % del 4EI/L de su columna; y la secante sube con el momento, porque el bloque a f_máx fija la deformación de la zapata | — |
| [Diagonal de paño en V invertida — NCh2369 §8.6](acero/diagonal-v-invertida-nch2369.md) | acero | Arriostramientos | verificado | Cierra con HSS 125×125×6 (0,67), pero el perfil lo elige la Tabla 9: el 5 mm pasaba resistencia (0,79) y falla b/t porque el R_y nacional endurece el límite; eximirse por 0,7R₁ costaría 2,2× el acero | — |
| [Viga del paño en V invertida — NCh2369 §8.6.6](acero/viga-pano-v-invertida-nch2369.md) | acero | Arriostramientos | verificado | Cierra con HEB 500 (H1 = 0,88), pero la gravedad pedía Z_x = 340 cm³ y el equilibrio post-pandeo pide 4 100 — el pandeo de la diagonal multiplica la viga por 12 | — |
| [Puntal entre paños en X — NCh2369 §8.6.7](acero/puntal-entre-x-nch2369.md) | acero | Arriostramientos | verificado | Cierra con HSS 150×150×8 (0,89) para un elemento que el análisis mostraba descargado: el equilibrio post-pandeo le pone 519 kN de compresión, y el cruce que salva la diagonal le sube la residual ×2,8 | — |
| [La diagonal fusible se diseña dos veces — NCh2369 §8.3/§8.6](acero/diagonal-fusible-contrato-nch2369.md) | acero | Arriostramientos | verificado | Como miembro usa 0,50; como fusible factura 841 kN a la conexión, 519 al puntal y 587 a la columna — el contrato lo pagan los consumidores, no la diagonal | — |
| [Columna armada con celosía — AISC §E6](acero/columna-armada-celosia-e6.md) | acero | Columnas | verificado | Cierra al 0,81 sin castigo de esbeltez: la celosía soldada a 60° compra la exención E6-2a; al paso máximo legal perdería 12,5 %, y la barra se dimensiona con el 2 % que el análisis no muestra | — |
| [La columna del marco en X — NCh2369 §8.3.4](acero/columna-marco-x-capacidad-nch2369.md) | acero | Columnas | verificado | Cada elemento del mecanismo tiene su peor estado: el puntal el post-pandeo que §8.6.7 escribe, la columna el pandeo incipiente que C8.6.7 declara no evaluar — arrastrar el del puntal deja la demanda 31 % baja; el tope de «máxima transferible» entrega 1,8 % | — |
| [BFP por capacidad — NCh2369 §8.7.5](acero/conexion-bfp-capacidad-nch2369.md) | acero | Conexiones | verificado | El tope de 0,7$R_1$ salva la conexión (0,99) pero no la columna (1,27–1,86); la viga perforada rompe a 0,81·$M_{pe}$ y los atiesadores piden 20 mm | — |
| [Viga de marco especial — ACI 18.6 + NCh2369 §9.1.2](hormigon/viga-marco-especial-nch2369.md) | hormigon | Vigas | verificado | El corte sube 42 % sin carga nueva del análisis — lo fija su propia armadura vía M_pr; V_c se salva por 7 puntos y en la rótula rige el d/4 del confinamiento, no el corte | — |
| [Pedestal por capacidad — NCh2369 §9.5](hormigon/pedestal-base-columna-nch2369.md) | hormigon | Anclajes | verificado | Cierra holgado (≤ 0,37): la armadura la fija el 0,5 % mínimo y los estribos la zona de protección, que cubre casi todo el pedestal — se detalla, no se calcula | — |
| [Zapata bajo el pedestal — NCh2369 Cap. 10](geotecnia/zapata-base-columna-nch2369.md) | geotecnia | Zapatas | verificado | Cierra con B = 3,1: la dimensiona el 80 % de área apoyada (0,93), no la presión ni el deslizamiento (0,44); el roce prohibido arriba es la única resistencia abajo | — |
| [Capacidad de soporte B = 3,1 — Das área efectiva](geotecnia/zapata-capacidad-soporte-das.md) | geotecnia | Zapatas | verificado | Sobra ×4 (FS 11,5 y 13,0 contra 3): la inclinación de 11° recorta la capacidad un 31 % y ni así gobierna — el 80 % de área sigue mandando; la S5 de la zapata queda saldada | — |
| [Asentamiento B = 3,1 — balasto vs elasticidad](geotecnia/zapata-asentamiento-das.md) | geotecnia | Zapatas | verificado | 0,69 mm por balasto contra 2,2 por elasticidad: el k_v del informe es rigidez sísmica y subestima el estático ×3; ambos minúsculos contra 25 mm. La ficha de Das 17 tenía la Ec. (17.3) mal transcrita — corregida | — |
| [El resorte completo — β_footing y la serie C-1](geotecnia/zapata-rigidez-rotacional-resorte-completo.md) | geotecnia | Zapatas | verificado | β_footing = 377 000 kN·m/rad (19× la conexión); la serie da β_base = 18 480 = 0,55·4EI/L — el suelo descuenta 5 %: el resorte blando del empotramiento son los pernos y la placa, no la fundación | — |

Se mantiene a mano. Un script cuando haya ~10 memos, no antes.
