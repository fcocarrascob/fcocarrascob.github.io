---
titulo: Armadura de anclaje para el breakout de la llave — ACI 318-25 §17.5.2.1 + NCh2369 §8.5.5
disciplina: hormigon
tema: Anclajes
normas: [ACI 318-25 (SI), NCh2369:2025, AISC Design Guide 1 3.ª ed.]
fecha: 2026-08-08
estado: verificado
veredicto: El breakout que no cerraba (1,08) se cose con 3 horquillas φ12 (uso 0,91) sin agrandar el pedestal. Pero la vía está escrita para pernos —§17.11 la calla—, los estribos de §9.5.3 quedan a 2,9 veces la distancia eficaz, y la armadura se cuelga de los 234 kN de la fluencia esperada de la llave, no de los 98 del análisis. Dos derivas de edición de regalo: φ pasó de 0,75 a 0,90 y la Ec. 25.4.3.1(a) SI está impresa con un denominador que nunca puede regir.
post:
---

# Armadura de anclaje para el breakout de la llave — ACI 318-25 §17.5.2.1 + NCh2369 §8.5.5

La extracción por corte (breakout) de la llave, que el memo de la llave dejó en 1,08 bajo sismo,
resuelta con armadura de anclaje en vez de hormigón simple o pedestal más grande.

## Caso

| Dato | Valor |
|---|---|
| Pedestal | $1100 \times 1100 \times 1200$ mm, $f'_c = 25$ MPa, recubrimiento 50 mm |
| Armadura existente | 16φ25 + estribos φ10 c/200 con 2 trabas, A630-420H (memo del pedestal) |
| Llave | $300 \times 25$ mm, embebida 50 mm; $c_{a1} = 537{,}5$ mm, $c_{a2} = 400$ mm |
| Breakout heredado | $\phi V_{cb,sl} = 90{,}7$ kN contra $V_u^S = 98$ kN → uso 1,08 ✗ |
| Capacidad esperada de la llave | $V = R_y F_y Z_{sl}/e = 234{,}4$ kN (memo del pedestal) |
| Armadura nueva | horquillas en U, φ12, A630-420H ($f_y = 420$ MPa) |

## Supuestos

1. **S1** — La vía de §17.5.2.1.2 (armadura en vez de breakout) **se extiende a la llave por
   interpretación declarada**: §17.11 no la menciona, pero $V_{cb,sl}$ se calcula con el mismo
   método de §17.7.2 (§17.11.3.1) y el mecanismo de falla es el mismo.
2. **S2** — La armadura pertenece al pedestal: §8.5.5 manda la zona en contacto con los anclajes a
   la cláusula 9, y §9.5.2 (Cat. III) pide resistencia ≥ capacidad esperada del dispositivo. Se
   diseña para 234,4 kN; los 98 kN de §8.5.3 quedan como piso de la letra.
3. **S3** — Demanda, geometría del cono y capacidades heredadas de los memos de la llave y del
   pedestal (§8.5.3, §8.5.4, §9.5.2 y §9.5.3 leídas allí).
4. **S4** — La Ec. 25.4.3.1(a) SI imprime $21\lambda\sqrt{f'_c}$ con $d_b$ lineal: así nunca rige
   sobre los pisos (b)/(c) — errata aparente, como la de 19.2.3.1. Se adopta la forma del 318-14
   que R25.4.3.1 declara restaurada ($0{,}24 f_y \psi/\lambda\sqrt{f'_c}\cdot d_b$), la más dura.
5. **S5** — $\psi_{cc} = \psi_r = 1{,}0$ (conservador); $\lambda = 1{,}0$; sin corte-fricción
   (§17.5.2.1.4 lo prohíbe para esta armadura).

## 1. La vía existe, pero está escrita para pernos

La nota [3] de la Tabla 17.5.2 permite usar la resistencia de diseño de la armadura de anclaje
**en lugar de** la del breakout, si se desarrolla a ambos lados del plano de falla (o abraza el
anclaje) y sus ramas son paralelas a $V$.  [ACI T.17.5.2 n.3 · §17.5.2.1.2(a),(b)]  (S1)

En §17.11 (llaves) la frase «anchor reinforcement» no aparece: §17.5.2.6 manda la llave a §17.11 y
§17.11.1.1.6 fija $\phi V_{cb,sl} \ge V_u$ con $\phi = 0{,}65$, sin alternativa armada. La vía es
de pernos y extenderla a la llave es una decisión, no una cláusula.

## 2. Para qué carga: 98 o 234

La armadura reemplaza una verificación cuya demanda era $V_u^S = 98$ kN. Pero es armadura **del
pedestal**, y la zona en contacto con los anclajes se diseña por cláusula 9: capacidad esperada
del dispositivo, «el pedestal no es fusible».  [NCh §8.5.5 · §9.5.2 + C9.5.2]  (S2, S3)

$$V_{dise\tilde{n}o} = 234{,}4\ \text{kN} = 2{,}4 \cdot V_u^S$$

## 3. φ = 0,90 y el área requerida

La conexión pasa a estar controlada por fluencia de barras dúctiles: Tabla 21.2.1(k). La DG1
(p. 49) dice $\phi = 0{,}75$ citando 318-19 — **deriva de edición**: el 2025 lo subió a 0,90.
[ACI T.21.2.1(k) · §17.5.2.1.5 · DG1 §4.4.1]

$$A_s \ge \frac{V}{\phi f_y} = \frac{234\,400}{0{,}90 \cdot 420} = 620\ \text{mm}^2 \qquad (259\ \text{mm}^2\ \text{por la letra})$$

## 4. Los estribos de §9.5.3 no cuentan

Solo es eficaz la armadura a menos de $\min(0{,}5c_{a1};\ 0{,}3c_{a2}) = \min(269;\ 120) = 120$ mm
del anclaje.  [ACI R17.5.2.1.2]  (S3)

$$d_{rama} = \frac{1\,100}{2} - 50 - 5 - 150 = 345\ \text{mm} = 2{,}9 \cdot 120$$

→ las ramas perimetrales confinan (§9.5.3) pero no cosen este plano; aun sumando las 2 trabas
(157 mm² si corrieran paralelas a $V$), no llegan ni al área. **La respuesta es no.**

## 5. Tres horquillas φ12

U horizontales que abrazan la llave por su cara de carga (tan cerca como sea practicable), ramas
paralelas a $V$ a 85 mm ≤ 120 de la cara de la llave, apiladas en cotas 60–160 mm.
[ACI Fig. R17.5.2.1b(i) · §17.5.2.1.2(b)]  (S1)

```
 cara B ║                                          ║ cara A (libre)
        ║ ●━━━━━━━━━━━━━━━━━━━━━━━┓                ║
 ganchos║ ●━━━━━━━━━━━━━━━━━━━━━━━┫ y = +235       ║
  90°↓  ║      3 U φ12, ramas ∥ V ▐█▌ llave        ║  V →
        ║ ●━━━━━━━━━━━━━━━━━━━━━━━┫ y = −235       ║  sólido: de la llave
        ║ ●━━━━━━━━━━━━━━━━━━━━━━━┛                ║  hacia cara A, ±35°
```

$$A_s = 6 \cdot 113{,}1 = 679\ \text{mm}^2 \qquad \phi V_n = 0{,}90 \cdot 420 \cdot 679 = 256{,}7\ \text{kN}$$

→ uso **0,91** ✓ para 234,4 (0,38 por la letra). El breakout de hormigón simple deja de existir
como verificación.

## 6. El desarrollo: la recta no cabe, el gancho sí

Del cruce con el plano de falla al extremo hay ~550 mm hacia la cara B. Barra alta ($\psi_t = 1{,}3$,
más de 300 mm de hormigón fresco debajo):  [ACI T.25.4.2.3 · T.25.4.2.5]  (S4, S5)

$$\ell_d = \frac{420 \cdot 1{,}3}{2{,}1 \cdot 1{,}0 \cdot \sqrt{25}} \cdot 12 = 624\ \text{mm} > 550\ \text{mm}$$

$$\ell_{dh} = \frac{0{,}24 \cdot 420}{\sqrt{25}} \cdot 12 = 242\ \text{mm} \ge \max(8d_b;\ 150\ \text{mm})$$

→ **ganchos estándar de 90° hacia abajo** en el extremo (el gancho no castiga posición de
hormigonado, R25.4.3.2). Del lado del sólido ancla la U que abraza la llave. El equilibrio de
borde lo dan los 16φ25 y la malla superior ya exigidos por §9.5.3.  [ACI §25.4.3.1 + T.25.4.3.2]

## Resumen

| Verificación | Ref. | Demanda | Capacidad | Uso | |
|---|---|---:|---:|---:|:--:|
| Armadura de anclaje (234,4 kN) | ACI 17.5.2.1.2 + T.21.2.1(k) | 620 mm² | 679 mm² (3 U φ12) | **0,91** | ✓ |
| Ídem por la letra (98 kN) | NCh §8.5.3 | 259 mm² | 679 mm² | 0,38 | ✓ |
| Estribos §9.5.3 como armadura | ACI R17.5.2.1.2 | ≤ 120 mm | a 345 mm | — | ✗ no cuentan |
| Desarrollo con gancho 90° | ACI §25.4.3.1 | 242 mm | ~550 mm | 0,44 | ✓ |
| Aplastamiento de la llave (a 234,4) | memo llave | 234,4 kN | 497 kN | 0,47 | ✓ |
| Breakout de hormigón simple | ACI §17.11.3 | — | — | — | reemplazado |

## Veredicto

Tres horquillas φ12 (~3 kg de acero) resuelven lo que el memo de la llave resolvía agrandando el
pedestal a 1300 (+0,7 m³ de hormigón): el 1,08 baja a 0,91 con el pedestal de 1100 intacto — la
palanca de verdad no era $c_{a1}$, era coser el plano. El precio es normativo, no material: la
vía hay que extenderla de pernos a llaves por supuesto declarado, y colgarla de la fluencia
esperada de la llave para ser consecuente con C9.5.2.

## Referencias

| Clave | Norma y edición | Cláusula | Leída en PDF |
|---|---|---|---|
| ACI-17 | ACI 318-25 (SI) | T.17.5.2 + nota [3]; §17.5.2.1 a §17.5.2.1.5 + R (Figs. b(i)/b(ii)); §17.5.2.6; §17.11.1.1.6 y §17.11.3 (silencio armadura) | 2026-08-08 |
| ACI-21 | ACI 318-25 (SI) | Tabla 21.2.1, fila (k) | 2026-08-08 |
| ACI-25 | ACI 318-25 (SI) | §25.4.2.1 a §25.4.2.3 + T.25.4.2.5; §25.4.3.1 + R25.4.3.1 (errata SI en (a)) + T.25.4.3.2 | 2026-08-08 |
| NCh | NCh2369:2025 | §8.5.5 | 2026-08-08 |
| DG1 | AISC Design Guide 1, 3.ª ed. | §4.4.1 (p. 49) — anchor vs. supplementary; φ = 0,75 citando 318-19 | 2026-08-08 |
| Memos | llave de corte + pedestal | $V_u^S$, $\phi V_{cb,sl}$, $c_{a1}/c_{a2}$, $V$ esperado, armado y §8.5.3/§8.5.4/§9.5.2/§9.5.3 | heredados (verificados) |

## Para promover a post

- Tesis candidata: la armadura que la norma no escribió — el Cap. 17 da la vía para pernos y la
  calla para llaves, y el diseño real vive de extenderla; cuarta cara del «todo se diseña para el
  dispositivo» del corpus de la base.
- Figura: planta y corte del sólido con las 3 U y la pantalla de 120 mm que deja fuera a los
  estribos perimetrales.
