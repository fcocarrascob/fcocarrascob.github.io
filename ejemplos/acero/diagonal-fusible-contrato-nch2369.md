---
titulo: La diagonal fusible se diseña dos veces — NCh2369 §8.3 y §8.6
disciplina: acero
tema: Arriostramientos
normas: [NCh2369:2025, AISC 360-22]
fecha: 2026-08-08
estado: verificado
veredicto: Como miembro usa 0,50 de sí misma; como fusible factura 841 kN a la conexión, 519 al puntal y 587 a la columna. Sobredimensionarla no la mejora — encarece el contrato que exporta.
post:
---

# La diagonal fusible se diseña dos veces — NCh2369 §8.3 y §8.6

La diagonal de la cepa del memo del puntal, completa: primero como miembro (lo que resiste) y
después como fusible (las demandas que exporta al resto del sistema).

## Caso

| Dato | Valor |
|---|---|
| Cepa | La del memo del puntal: paños 6 × 4 m en X, $V_u = 400$ kN por nivel, $R_1 = 5$ |
| Diagonal | HSS 125×125×6, A36: $A = 2\,856$ mm², $r = 48{,}6$ mm, $L = 7\,211$ mm |
| Cruce | Conectado, contraparte traccionada: $KL = L/2 = 3\,606$ mm (§8.6.4) |
| Material esperado | $R_y = 1{,}3$ (C8.3.3); $F_{ye} = 325$ MPa |
| Geometría | $\cos\theta = 0{,}832$; $\sin\theta = 0{,}555$ |

## Supuestos

1. **S1** — Todo en SI; propiedades HSS con esquinas rectas (aprox. de catálogo).
2. **S2** — Corte repartido por equilibrio entre las dos diagonales del paño (una tracción, una compresión).
3. **S3** — Categoría II: los techos por $0{,}7R_1$ están permitidos (§8.3.5).
4. **S4** — Los consumidores del contrato se citan con su número; su diseño completo vive en el memo del puntal y en el post de la diagonal HSS en X.

## 1. El miembro — demanda y ductilidad

Del corte de línea, y los dos requisitos de §8.6.3 (heredados del par en V, misma sección).  (S2)

$$P_u = \frac{V_u}{2\cos\theta} = 240{,}4\ \text{kN} \qquad \frac{KL}{r} = 74{,}1 \le 133{,}3 \qquad \frac{b}{t} = 17{,}83 \le 18{,}85$$

## 2. El miembro — resistencia

Compresión por E3 con $F_y$; tracción por fluencia bruta.  [AISC 360-22 §E3 · §D2]  (S1)

$$F_e = 359{,}3\ \text{MPa} \quad F_n = 0{,}658^{250/359{,}3} \cdot 250 = 186{,}8\ \text{MPa} \quad \phi_c P_n = 480{,}1\ \text{kN} \;\Rightarrow\; \frac{240{,}4}{480{,}1} = 0{,}50$$

→ y en tracción, $0{,}9 F_y A_g = 642{,}6$ kN → 0,37. **El miembro sobra** — el diseño no termina aquí.

## 3. El fusible — capacidades esperadas

Con $F_{ye}$ en lugar de $F_y$.  [NCh2369 §8.3.1]

$$T_{ye} = 325 \cdot 2\,856 = 928{,}2\ \text{kN} \qquad F_{cre} = 0{,}658^{325/359{,}3} \cdot 325 = 222{,}6\ \text{MPa}$$

$$P_{ne} = 1{,}14 \cdot 222{,}6 \cdot 2\,856 = 724{,}6\ \text{kN} \qquad 0{,}3P_{ne} = 217{,}4\ \text{kN}$$

## 4. El techo del contrato

Ninguna demanda exportada necesita superar la de 4.5 con el sísmico ×$0{,}7R_1$.  [NCh2369 §8.6.8 · §8.3.4]  (S3)

$$0{,}7R_1 \cdot P_u = 3{,}5 \cdot 240{,}4 = 841{,}3\ \text{kN} < T_{ye} = 928{,}2\ \text{kN}$$

→ el techo muerde y recorta la tracción exportada un 9 %. En compresión no: $P_{ne} = 724{,}6 < 841{,}3$.

## 5. El contrato — lo que cada consumidor paga

Cada cláusula cobra las capacidades esperadas, no la demanda del análisis.  (S4)

```
                        ┌→ conexión [8.6.8]: desarrolla 841,3 T y 724,6 C
   HSS 125×125×6 ───────┼→ puntal  [8.6.7]: (T − 0,3P_ne)·cos θ = 519,1 C
   resiste 240,4 kN     ┼→ columna [8.3.4]: (T + 0,3P_ne)·sen θ = 587,3 ↓ por nivel
   (uso propio: 0,50)   └→ zona protegida [8.3.7]: nada soldado al tramo fusible
```

| Consumidor | Cláusula | Demanda exportada | Dónde se desarrolla |
|---|---|---|---|
| Conexión de extremo | §8.6.8 | 841,3 kN (T) y 724,6 kN (C) | post `ejemplo-diagonal-hss-traccion` |
| Puntal entre X | §8.6.7 | 519,1 kN de compresión | memo del puntal |
| Columna | §8.3.4 | +587,3 kN por nivel | memo de la columna del marco en X — allí gobierna el otro estado del mecanismo (916,8 kN/nivel) |
| Zona protegida | §8.3.7 | sin número: prohibido soldar al fusible | detallamiento |

## Resumen

| Verificación | Ref. | Demanda | Capacidad | Uso | |
|---|---|---:|---:|---:|:--:|
| Esbeltez global | NCh §8.6.3 | 74,1 | 133,3 | 0,56 | ✓ |
| b/t pared (Tabla 9, $R_y$) | NCh §8.6.3 | 17,83 | 18,85 | 0,95 | ✓ |
| Compresión | AISC §E3 | 240,4 kN | 480,1 kN | **0,50** | ✓ |
| Tracción | AISC §D2 | 240,4 kN | 642,6 kN | 0,37 | ✓ |
| Techo del contrato | NCh §8.6.8/§8.3.4 | $T_{ye}$ = 928,2 kN | techo 841,3 kN | — | techo rige |

## Veredicto

La diagonal usa la mitad de sí misma y factura 841 kN a la conexión, 519 al puntal y 587 a la
columna: el fusible no se diseña para resistir — se diseña para **definir**, y las demandas que
definen son sus capacidades esperadas, no su carga. Por eso sobredimensionarla empeora el
proyecto: cada mm² extra sube $T_{ye}$ y $P_{ne}$, y la cuenta la pagan los cuatro consumidores
(el cruce que salvó la esbeltez ya le costó ×2,8 al puntal). El diseño de una diagonal sísmica
termina cuando el último consumidor pagó su fila.

## Referencias

| Clave | Norma y edición | Cláusula | Leída en PDF |
|---|---|---|---|
| NCh-a | NCh2369:2025 | §8.3.1 (capacidades esperadas); §8.3.4 (columnas); §8.3.5 (categorías) | 2026-08-08 (rasterizada, pp. impresas 79–81) |
| NCh-b | NCh2369:2025 | §8.3.7 + C8.3.7 (zona protegida); §8.6.3, §8.6.4, Tabla 9; §8.6.7; §8.6.8 (conexiones y techo) | 2026-08-08 (rasterizada, pp. impresas 82, 87–90, 97–98) |
| AISC | ANSI/AISC 360-22 | §E3, Ecs. E3-1 a E3-4; §D2, Ec. D2-1 ($P_n = F_y A_g$, $\phi_t = 0{,}90$) | 2026-08-08 (rasterizadas, pp. 16.1-32 y 16.1-40/41) |

## Para promover a post

- Tesis candidata: la diagonal se diseña dos veces, y la segunda pasada es la cara. Es el post
  paraguas que ordena los existentes (diagonal HSS, chevron, gusset, puntal) como consumidores.
- La fila de la columna quedó saldada en su propio memo (§8.3.4 + C8.3.4): el estado post-pandeo
  con que se escribe este contrato no es el que la gobierna, porque en la columna las dos
  capacidades se suman en vez de restarse.
- El croquis del contrato es el borrador de la figura central del post.
