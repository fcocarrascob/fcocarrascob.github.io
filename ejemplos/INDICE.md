# Índice de memos

Qué hay acumulado en `ejemplos/`, en qué estado y con qué veredicto. El formato está en
[README.md](README.md); la plantilla en blanco, en [_PLANTILLA.md](_PLANTILLA.md).

`estado` — **verificado**: toda cláusula leída en el PDF de la edición vigente · **pendiente**:
queda al menos una por leer, no se promueve así.

| Caso | Disciplina | Tema | Estado | Veredicto | Post |
|---|---|---|---|---|---|
| [Llave de corte — viento y sismo](acero/placa-base-llave-de-corte-nch2369.md) | acero | Placas base | verificado | La misma llave, dos veredictos: sobra con viento (0,88) y no cierra con sismo (1,08). El sismo amplifica ×1,4 y §8.5.4 borra el roce; la capacidad no se mueve — la palanca es el pedestal, no la llave | — |
| [Base empotrada — NCh2369 §8.5.2](acero/placa-base-empotrada-nch2369.md) | acero | Placas base | **pendiente** | No cierra: el piso de 0,5·$M_{pe}^*$ multiplica la tracción del perno por 4,2 y lo deja en 2,79 | — |
| [Silla de anclaje — NCh2369 C8.5.2](acero/placa-base-silla-anclaje-nch2369.md) | acero | Placas base | verificado | No cierra: la placa superior que la carga valida (0,63) falla bajo la fluencia esperada del perno (1,58); F1554 no está en la Tabla A3.2 | — |
| [La base como resorte — DG1 Ap. C](acero/placa-base-rigidez-rotacional-dg1.md) | acero | Placas base | verificado | β_base = 18 480 kN·m/rad = 0,55·4EI/L, y la fundación es 19× más rígida que la conexión: el resorte blando del «empotramiento» son los pernos y la placa, no el suelo | — |
| [Diagonal de paño en V invertida — NCh2369 §8.6](acero/diagonal-v-invertida-nch2369.md) | acero | Arriostramientos | verificado | Cierra con HSS 125×125×6 (0,67), pero el perfil lo elige la Tabla 9: el 5 mm pasaba resistencia (0,79) y falla b/t porque el R_y nacional endurece el límite; eximirse por 0,7R₁ costaría 2,2× el acero | — |
| [Viga del paño en V invertida — NCh2369 §8.6.6](acero/viga-pano-v-invertida-nch2369.md) | acero | Arriostramientos | verificado | Cierra con HEB 500 (H1 = 0,88), pero la gravedad pedía Z_x = 340 cm³ y el equilibrio post-pandeo pide 4 100 — el pandeo de la diagonal multiplica la viga por 12 | — |
| [Puntal entre paños en X — NCh2369 §8.6.7](acero/puntal-entre-x-nch2369.md) | acero | Arriostramientos | verificado | Cierra con HSS 150×150×8 (0,89) para un elemento que el análisis mostraba descargado: el equilibrio post-pandeo le pone 519 kN de compresión, y el cruce que salva la diagonal le sube la residual ×2,8 | — |
| [La diagonal fusible se diseña dos veces — NCh2369 §8.3/§8.6](acero/diagonal-fusible-contrato-nch2369.md) | acero | Arriostramientos | verificado | Como miembro usa 0,50; como fusible factura 841 kN a la conexión, 519 al puntal y 587 a la columna — el contrato lo pagan los consumidores, no la diagonal | — |
| [La columna del marco en X — NCh2369 §8.3.4](acero/columna-marco-x-capacidad-nch2369.md) | acero | Columnas | verificado | Cada elemento del mecanismo tiene su peor estado: el puntal el post-pandeo que §8.6.7 escribe, la columna el pandeo incipiente que C8.6.7 declara no evaluar — arrastrar el del puntal deja la demanda 31 % baja; el tope de «máxima transferible» entrega 1,8 % | — |
| [BFP por capacidad — NCh2369 §8.7.5](acero/conexion-bfp-capacidad-nch2369.md) | acero | Conexiones | **pendiente** | El tope de 0,7$R_1$ salva la conexión (0,99) pero no la columna (1,27–1,86); la viga perforada rompe a 0,81·$M_{pe}$ y los atiesadores piden 20 mm | — |
| [Viga de marco especial — ACI 18.6 + NCh2369 §9.1.2](hormigon/viga-marco-especial-nch2369.md) | hormigon | Vigas | **pendiente** | El corte sube 42 % sin carga nueva del análisis — lo fija su propia armadura vía M_pr; V_c se salva por 7 puntos y en la rótula rige el d/4 del confinamiento, no el corte | — |
| [Pedestal por capacidad — NCh2369 §9.5](hormigon/pedestal-base-columna-nch2369.md) | hormigon | Anclajes | verificado | Cierra holgado (≤ 0,37): la armadura la fija el 0,5 % mínimo y los estribos la zona de protección, que cubre casi todo el pedestal — se detalla, no se calcula | — |
| [Zapata bajo el pedestal — NCh2369 Cap. 10](geotecnia/zapata-base-columna-nch2369.md) | geotecnia | Zapatas | **pendiente** | Cierra con B = 3,1: la dimensiona el 80 % de área apoyada (0,93), no la presión ni el deslizamiento (0,44); el roce prohibido arriba es la única resistencia abajo | — |
| [La zapata B = 3,1 contra Das](geotecnia/zapata-capacidad-y-asentamiento-das.md) | geotecnia | Zapatas | verificado | Los dos estados límite que NCh2369 no cubre sobran (FS 11,5–13,0 contra 3; 2,2 mm contra 25) y la inclinación de 11° recorta 31 % sin gobernar: manda el 80 % de área. El k_v del informe es sísmico y subestima el estático ×3 | — |

Se mantiene a mano. Un script cuando haya ~20 memos, no antes.

## Consolidación 2026-08-08 — de 19 a 14

El corpus llegó a 19 memos con **11 sobre la misma columna** (HEB 300 → pedestal 1100 → zapata
3,1 m), varios de ellos medio estado límite cada uno. Se consolidó contra el fin declarado
—ejemplificar el diseño de un elemento con los requisitos de NCh2369— y sin perder ningún número:

**Bajas (2).** `placa-base-momento-dg1` era la transcripción del post
[`placa-base-ejemplo-trabajado`](../src/content/acero/placa-base-ejemplo-trabajado.mdx), con las
referencias heredadas y sin una cláusula de NCh2369; su función —mostrar qué sobrevive al comprimir
un post— la cumplen hoy `README.md` y `_PLANTILLA.md`. `columna-armada-celosia-e6` (AISC §E6) era el
único memo sin NCh2369 y sin conexión con ninguna estructura del corpus: material de otra serie.

**Fusiones (3).** La llave de corte de viento entró en la sísmica (que ya heredaba cuatro de sus
números por S6) como caso de contraste. `zapata-rigidez-rotacional-resorte-completo` entró en
`placa-base-rigidez-rotacional-dg1`: era «la otra mitad» del mismo resorte, no dimensionaba nada, y
partía un tema de acero en dos disciplinas. `zapata-capacidad-soporte-das` y `zapata-asentamiento-das`
—mismo caso, mismos supuestos, ambos cerrando con «sobra»— son ahora un memo.

Lo retirado vive en el historial de git.

## La regla de independencia y la deuda que destapó

Al escribir la regla 1 del [README](README.md) —un memo se sostiene solo, ninguna cláusula puede
decir «heredada del post»— quedaron a la vista cinco memos que sí dependían de un post publicado.
Se limpió la prosa en todos y se cerró la única fila que las lecturas de hoy ya cubrían (la Ec. D2-1
del memo de la diagonal fusible, y §4.5 + Tabla C-2 del de la zapata). **Los cuatro restantes pasan
a `pendiente`** con su fila marcada `⚠`, que es lo que el README manda: declarar la deuda en vez de
dejarla implícita.

| Memo | Cláusula por leer en PDF |
|---|---|
| Base empotrada | AISC 360-22 §J3 y Tabla J3.2 — $\phi F_{nt} A_b$ del perno |
| BFP por capacidad | AISC 360-22 §J3.7, §J4.1, §J10 (J10-1/2/4/10), §F13.1 |
| Viga de marco especial | ACI 318-25 §22.5.5.1 — $V_c$ |
| Zapata bajo el pedestal | NCh2369 Tabla 10 — $L$ de cálculo |

Ninguna de las cuatro cambia un número: son valores que un post auditado ya usaba y que acá tienen
que leerse otra vez, en su propio PDF. Son ~6 páginas rasterizadas.

## Lo otro que queda abierto

Hay **dos cepas arriostradas ficticias** (V invertida con $V_u = 294$ kN y X con 400 kN)
ejemplificando la misma maquinaria de §8.3.1 y del equilibrio post-pandeo, y dentro de la X las
capacidades esperadas de la diagonal están recalculadas en tres memos. Es la regla 2 sin aplicar,
y cerrarla es reescritura de cinco memos, no una fusión.
