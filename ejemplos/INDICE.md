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
| [BFP por capacidad — NCh2369 §8.7.5](acero/conexion-bfp-capacidad-nch2369.md) | acero | Conexiones | verificado | El tope de 0,7$R_1$ salva la conexión (0,99) pero no la columna (1,27–1,86); la viga perforada rompe a 0,81·$M_{pe}$ y los atiesadores piden 20 mm | — |
| [Pedestal por capacidad — NCh2369 §9.5](hormigon/pedestal-base-columna-nch2369.md) | hormigon | Anclajes | verificado | Cierra holgado (≤ 0,37): la armadura la fija el 0,5 % mínimo y los estribos la zona de protección, que cubre casi todo el pedestal — se detalla, no se calcula | — |
| [Zapata bajo el pedestal — NCh2369 Cap. 10](geotecnia/zapata-base-columna-nch2369.md) | geotecnia | Zapatas | verificado | Cierra con B = 3,1: la dimensiona el 80 % de área apoyada (0,93), no la presión ni el deslizamiento (0,44); el roce prohibido arriba es la única resistencia abajo | — |

Se mantiene a mano. Un script cuando haya ~10 memos, no antes.
