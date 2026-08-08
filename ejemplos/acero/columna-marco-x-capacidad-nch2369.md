---
titulo: La columna del marco en X — NCh2369 §8.3.4
disciplina: acero
tema: Columnas
normas: [NCh2369:2025, AISC 360-22]
fecha: 2026-08-08
estado: verificado
veredicto: Cada elemento del mismo mecanismo tiene su peor estado: el puntal, el post-pandeo que §8.6.7 escribe; la columna, el pandeo incipiente que C8.6.7 declara no evaluar. Reusar el estado del puntal deja la demanda 31 % baja. Cierra con HEB 300 (0,77) y exporta 1 564 kN de levantamiento.
post:
---

# La columna del marco en X — NCh2369 §8.3.4

La fila pendiente del contrato de la diagonal fusible, por los dos caminos que §8.3.4 admite: el
análisis amplificado y la máxima carga transferible.

## Caso

| Dato | Valor |
|---|---|
| Cepa | La del memo del puntal: 2 niveles, paños 6 × 4 m con X apiladas; $R_1 = 5$ |
| Diagonales | HSS 125×125×6, A36; $L = 7\,211$ mm; cruce conectado (§8.6.4) |
| Corte sísmico de la línea (4.5) | $V_u = 400$ kN por nivel |
| Columna | HEB 300, A36: $A_g = 14\,910$ mm², $r_y = 75{,}8$ mm; tramos de 4 m |
| Gravedad en la columna | $D = 300$ kN, $L = 150$ kN; $SO = SA = 0$ |
| Geometría de la diagonal | $\cos\theta = 0{,}832$; $\operatorname{sen}\theta = 0{,}555$ |

## Supuestos

1. **S1** — Todo en SI. Capacidades esperadas de la diagonal, del memo de la diagonal fusible: $T_{ye} = 928{,}2$, $P_{ne} = 724{,}6$, $0{,}3P_{ne} = 217{,}4$ kN.
2. **S2** — Corte de 400 kN en los dos niveles (toda la fuerza horizontal en el techo); el axial sísmico acumula las verticales de los dos niveles.
3. **S3** — Los dos niveles llegan a su estado límite a la vez, sin reducción por no simultaneidad.
4. **S4** — $K = 1{,}0$ con $L = 4$ m: la X restringe el plano y el puntal, la normal. C8.3.2 advierte contra adoptar $K = 1$ por defecto; acá lo justifica la doble restricción.
5. **S5** — Columna biarticulada, gusset centrado: sin momento.
6. **S6** — $a = 0{,}25$ (Tabla C-2, plataformas de operación).
7. **S7** — HEB 300 de catálogo, no esbelto: $b/2t_f = 7{,}89 \le 15{,}84$ y $h/t_w = 18{,}9 \le 42{,}1$ (B4.1a).
8. **S8** — $R_y = 1{,}3$ sobre el perfil laminado; C8.3.3 lo respalda sobre planchas A36 nacionales.

## 1. Camino A — el análisis amplificado

Combinaciones de 4.5 con el estado sísmico horizontal amplificado por $0{,}7R_1 \ge 1{,}0$; el axial elástico acumula las verticales de las dos diagonales de cada nivel.  [NCh2369 §8.3.4]  (S2)

$$N_{E,\text{elást}} = 2 \cdot \left(2 \cdot 240{,}4\right) \operatorname{sen}\theta = 533{,}4\ \text{kN} \qquad N_A = 3{,}5 \cdot 533{,}4 = 1\,866{,}9\ \text{kN}$$

→ control por volcamiento: $M = 400 \cdot 8 = 3\,200\ \text{kN}\cdot\text{m}$, y $3\,200/6 = 533{,}3$ kN. ✓

## 2. Camino B — la máxima transferible, y qué estado del mecanismo

La demanda «no necesita ser mayor que la máxima carga que el sistema puede transferir a la columna», evaluada con capacidades esperadas. El estado no es único, y el signo lo decide todo.  [NCh2369 §8.3.4 · §8.3.1 · C8.3.4]  (S1, S3)

```
                                            columna N=(T+C)·sen θ   puntal F=(T−C)·cos θ
              T ╲       ╱ C                        ── SUMA ──          ── RESTA ──
                 ╲     ╱
   columna ●──────╳──────● columna   C = P_ne     724,6 → N = 916,8      F = 169,4
                 ╱     ╲             C = 0,3·P_ne 217,4 → N = 635,5      F = 591,4
              C ╱       ╲ T          (T = T_ye = 928,2 kN en ambos)         kN
```

→ el peor estado no es el mismo para los dos: el puntal se dimensiona con el post-pandeo —el que
§8.6.7 escribe— y la columna, con el opuesto. (El memo del puntal llega a 519,1 kN porque le aplica
además el techo de $0{,}7R_1$ que §8.6.7 concede a ese elemento.)

## 3. Los dos estados, en números

Estado I, pandeo incipiente: las dos en capacidad esperada. Estado II, post-pandeo: la comprimida ya cayó a su residual — el estado con que §8.6.7 dimensiona el puntal.  (S3)

$$N_{B,\text{I}} = 2\left(928{,}2 + 724{,}6\right)\operatorname{sen}\theta = 1\,833{,}6\ \text{kN} \qquad N_{B,\text{II}} = 2\left(928{,}2 + 217{,}4\right)\operatorname{sen}\theta = 1\,270{,}9\ \text{kN}$$

→ el estado II queda **31,9 %** bajo el camino A; el estado I, solo **1,8 %**. C8.6.7 permite no evaluar el I —«no es común que controle»— pero lo recomienda ante dudas razonables, y acá se suman.

$$N_E = \min\left(1\,866{,}9;\ 1\,833{,}6\right) = 1\,833{,}6\ \text{kN}$$

## 4. Las combinaciones de 4.5

Las dos del método LRFD, con $N_E$ ya amplificado.  [NCh2369 §4.5.1]  (S6)

$$1{,}2D + aL + E = 360{,}0 + 37{,}5 + 1\,833{,}6 = 2\,231{,}1\ \text{kN (compresión)}$$

$$0{,}9D + E = 270{,}0 - 1\,833{,}6 = -1\,563{,}6\ \text{kN (tracción)}$$

## 5. El HEB 300

$L_c/r_y = 4\,000/75{,}8 = 52{,}8 \le 133{,}2$, así que rige la Ec. E3-2.  [AISC 360-22 §E3 · §D2]  (S4, S7)

$$F_e = \frac{\pi^2 \cdot 200\,000}{52{,}8^2} = 708{,}8\ \text{MPa} \qquad F_n = 0{,}658^{250/708{,}8} \cdot 250 = 215{,}7\ \text{MPa}$$

$$\phi_c P_n = 0{,}9 \cdot 215{,}7 \cdot 14\,910 = 2\,894{,}3\ \text{kN} \qquad \phi_t P_n = 0{,}9 \cdot 250 \cdot 14\,910 = 3\,354{,}8\ \text{kN}$$

→ **0,77** en compresión y **0,47** en tracción. Con el estado II —el que §8.6.7 escribe para el puntal— el uso habría sido 0,58: el escenario que C8.6.7 permite no evaluar vale un tercio de la columna.

## 6. El empalme, donde reaparecen los dos caminos

§8.4.2 pide la menor capacidad esperada entre los elementos conectados —la de la propia columna—, con los mismos dos topes de §8.3.4.  [NCh2369 §8.4.2]  (S8)

$$T_{ye}^{col} = 1{,}3 \cdot 250 \cdot 14\,910 = 4\,846\ \text{kN} \quad\longrightarrow\quad \text{tope} = 2\,231\ \text{kN} \;\;(-54\ \%)$$

## Resumen

| Verificación | Ref. | Demanda | Capacidad | Uso | |
|---|---|---:|---:|---:|:--:|
| Camino A (análisis $\times 0{,}7R_1$) | NCh §8.3.4 | 1 866,9 kN | — | — | referencia |
| Camino B, estado I (pandeo incipiente) | NCh §8.3.4 / C8.6.7 | 1 833,6 kN | — | — | **rige** |
| Camino B, estado II (post-pandeo) | NCh §8.6.7 | 1 270,9 kN | — | — | no gobierna |
| **Compresión** | AISC §E3 | 2 231,1 kN | 2 894,3 kN | **0,77** | ✓ |
| Tracción (levantamiento) | AISC §D2 | 1 563,6 kN | 3 354,8 kN | 0,47 | ✓ |
| Esbeltez global | AISC §E2 | 52,8 | 200 | 0,26 | ✓ |
| Empalme | NCh §8.4.2 | 2 231 kN | — | — | tope rige |

## Veredicto

Cierra con HEB 300 al 0,77, y lo que enseña es que un mecanismo tiene más de un peor caso. El
puntal equilibra una **resta** y su estado crítico es el post-pandeo, el único que la norma escribe
(§8.6.7); la columna acumula una **suma** y el suyo es el opuesto, el pandeo incipiente, que ninguna
cláusula prescribe y C8.6.7 declara no evaluar «por no ser común que controle». Arrastrar el estado
del puntal a la columna deja la demanda 31 % baja —1 271 contra 1 834 kN— y el uso en 0,58 en vez de
0,77. Y el tope de la «máxima transferible», que se lee como un descuento, entrega 1,8 %.

## Referencias

| Clave | Norma y edición | Cláusula | Leída en PDF |
|---|---|---|---|
| NCh-a | NCh2369:2025 | §4.5.1 (combinaciones LRFD); Tabla C-2 (factor $a$) | 2026-08-08 (rasterizada, p. impresa 15) |
| NCh-b | NCh2369:2025 | §8.3.1 (capacidades esperadas); C8.3.2 ($K$); §8.3.3 + C8.3.3 ($R_y$) | 2026-08-08 (rasterizada, pp. impresas 79–80) |
| NCh-c | NCh2369:2025 | §8.3.4 + C8.3.4 (columnas y máxima transferible) | 2026-08-08 (rasterizada, p. impresa 81) |
| NCh-d | NCh2369:2025 | §8.4.2 (empalmes de columnas) | 2026-08-08 (rasterizada, p. impresa 83) |
| NCh-e | NCh2369:2025 | §8.6.1 a §8.6.4 (no imponen nada a la columna); C8.6.7 final (estado de pandeo incipiente) | 2026-08-08 (rasterizada, pp. impresas 87 y 90) |
| AISC | ANSI/AISC 360-22 | §E2 (esbeltez); §E3, Ecs. E3-1 a E3-4; §D2, Ec. D2-1 | 2026-08-08 (rasterizada, pp. 16.1-32, 16.1-40/41) |

## Para promover a post

- Tesis candidata: un mecanismo, dos peores casos. Es el reverso del memo del puntal —misma X,
  signo opuesto— y cierra el post paraguas del contrato de la diagonal.
- Figura: los dos estados lado a lado, marcando dónde las capacidades se suman y dónde se restan.
  El croquis del paso 2 es el borrador.
- Por profundizar: los 1 564 kN de levantamiento hacia la base. Los memos de placa base de la serie
  son de otra estructura, más liviana: la base de esta cepa es un memo aparte.
- Por profundizar: la no simultaneidad de S3, que NCh2369 no cuantifica.
