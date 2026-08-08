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
| [BFP por capacidad — NCh2369 §8.7.5](acero/conexion-bfp-capacidad-nch2369.md) | acero | Conexiones | verificado | El tope de 0,7$R_1$ salva la conexión (0,99) pero no la columna (1,27–1,86); la viga perforada rompe a 0,81·$M_{pe}$ y los atiesadores piden 20 mm | — |
| [Pedestal por capacidad — NCh2369 §9.5](hormigon/pedestal-base-columna-nch2369.md) | hormigon | Anclajes | verificado | Cierra holgado (≤ 0,37): la armadura la fija el 0,5 % mínimo y los estribos la zona de protección, que cubre casi todo el pedestal — se detalla, no se calcula | — |

Se mantiene a mano. Un script cuando haya ~10 memos, no antes.
