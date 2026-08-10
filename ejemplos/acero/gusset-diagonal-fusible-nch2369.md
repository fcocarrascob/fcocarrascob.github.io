---
titulo: El gusset de la diagonal fusible — §8.6.9 pide 38 mm por la vía (a) y 12 por la (b)
disciplina: acero
tema: Conexiones
normas: [NCh2369:2025, AISC 360-22]
fecha: 2026-08-09
estado: verificado
veredicto: Cierra con plancha de 12 mm, filete de 4 y cordón de 345 — pero ningún estado límite de resistencia fija el espesor: los tres piden 7,3 mm y el 12 se pone por montaje. Lo que sí lo fija es §8.6.9, y por arriba - la vía (a), resistir el M_pe de la diagonal (41,5 kN·m), pediría 38 mm, tres veces la plancha, así que para un tubo la única vía real es la (b), girar. Y el largo del cordón no lo decide la plancha - lo decide la pared de 6 mm del tubo, que topa el filete en 4 mm por J2.2b y estira el cordón a 345 mm; con pared de 8 serían 229.
post:
---

# El gusset de la diagonal fusible — §8.6.9 pide 38 mm por la vía (a) y 12 por la (b)

El gusset de extremo de la diagonal de la cepa en X, dimensionado para el contrato que la diagonal
exporta, y contrastado contra las dos alternativas que §8.6.9 ofrece para el giro del pandeo.

## Caso

| Dato | Valor |
|---|---|
| Diagonal | HSS 125×125×6, A36; pared $t_w = 6$ mm, ancho conectado $b = 125$ mm |
| Contrato heredado | $T = 841{,}3$ kN y $C = P_{ne} = 724{,}6$ kN [§8.6.8] |
| Gusset | plancha A36: $F_y = 250$, $F_u = 400$ MPa |
| Soldadura | tubo ranurado sobre el gusset, 4 filetes E70 ($F_{EXX} = 482$ MPa) |
| Geometría | $\theta = 33{,}7°$; $Z_{HSS} = 127\,557$ mm³ (esquinas rectas) |

## Supuestos

1. **S1** — Demanda heredada del memo de la diagonal fusible: $T$ es el techo de $0{,}7R_1$ (no $T_{ye}$)
   y $C = P_{ne}$; §8.6.8 pide las dos.
2. **S2** — Sección de Whitmore con difusión a 30°: **no está en 360-22**, se adopta como modelo
   declarado (práctica del Manual).
3. **S3** — Bloque de corte con los dos cordones como planos de corte y el ancho del tubo como plano
   de tracción; $U_{bs} = 1{,}0$ (bloque simétrico, tracción uniforme).
4. **S4** — Los 4 filetes son de igual largo y la carga pasa por su centro de gravedad, así que
   $k_{ds} = 1{,}0$ [Ec. J2-5(3)].
5. **S5** — $R_y = 1{,}3$ (C8.3.3) y $Z$ con esquinas rectas, como en el memo de la diagonal.
6. **S6** — La rotura del área neta del **tubo** (retraso de corte, Cap. D) es del miembro, no del
   gusset: fuera de alcance, y hoy el corpus no la tiene cubierta.

## 1. El filete lo topa el tubo, no la plancha

A lo largo del borde de un material de 6 mm o más, el filete máximo es el espesor menos 2 mm.
[AISC §J2.2b(b)(2)]

$$w_{\text{máx}} = t_w - 2 = 6 - 2 = 4\ \text{mm}$$

→ el gusset podría llevar un filete mucho mayor; el que manda es el borde ranurado del tubo. La
excepción existe —designar el cordón «a garganta completa» en los planos— pero exige verificarlo en
obra.

## 2. El cordón: 345 mm, y a 14 % del umbral que lo penaliza

Cuatro filetes a corte, $F_{nw} = 0{,}60F_{EXX}$ con $\phi = 0{,}75$.  [Ec. J2-4 · Tabla J2.5]  (S4)

$$\phi R_n / \ell = 0{,}75 \cdot 0{,}60 \cdot 482 \cdot (0{,}707 \cdot 4) \cdot 4 = 2{,}454\ \text{kN/mm} \;\Rightarrow\; \ell_w \ge \frac{841{,}3}{2{,}454} = 342{,}9 \to \mathbf{345}\ \text{mm}$$

→ uso **0,99**. Y $\ell/w = 86{,}2 < 100$: la reducción por cordón largo cargado en el extremo
[Ec. J2-1] todavía no aplica, pero queda a 14 %. Con pared de 8 mm el filete podría ser de 6 y el
cordón bajaría a **229 mm**: la pared del tubo, no la plancha, es la que fija el largo.

## 3. La plancha: los dos estados límite piden lo mismo, y es poco

La sección de Whitmore abre desde los cordones.  [Ec. J4-1 · Ec. J4-5]  (S2, S3)

$$B_w = b + 2\ell_w \tan 30° = 125 + 398{,}4 = 523{,}4\ \text{mm}$$

$$t \ge \frac{T}{0{,}90F_y B_w} = 7{,}14 \qquad t \ge \frac{T}{0{,}75\left(0{,}60F_y \cdot 2\ell_w + F_u b\right)} = 7{,}31\ \text{mm}$$

→ con plancha de 12 mm: fluencia de Whitmore **0,60** y bloque de corte **0,61** (en el bloque
gobierna el tope de fluencia por corte del área bruta, no la rotura).

## 4. Compresión: la franja es corta, así que no hay pandeo que calcular

§J4.4 remite al Cap. E solo si $L_c/r > 25$; si no, es fluencia pura.  [Ec. J4-6]

$$r = \frac{t}{\sqrt{12}} = 3{,}46\ \text{mm} \;\Rightarrow\; 25r = 87\ \text{mm} \quad (L \le 133\ \text{mm con } K = 0{,}65)$$

$$\phi P_n = 0{,}90 F_y B_w t = 1\,413{,}1\ \text{kN} \;\Rightarrow\; \frac{724{,}6}{1\,413{,}1} = \mathbf{0{,}51}$$

→ el pandeo del gusset, que es el estado que todos verifican, no llega a existir mientras la franja
libre entre el fin del cordón y el apoyo no pase de 133 mm. Con la franja de rótula del paso 6
(24 mm) sobra margen.

## 5. La vía (a) de §8.6.9: resistir el momento del pandeo

La conexión debe resistir la capacidad flexural esperada del elemento, en la dirección del pandeo.
[NCh2369 §8.6.9(a)]  (S5)

$$M_{pe} = R_y F_y Z = 1{,}3 \cdot 250 \cdot 127\,557 = 41{,}5\ \text{kN}\cdot\text{m} \qquad \phi M_n = 0{,}90 F_y \frac{B_w t^2}{4} = 4{,}24\ \text{kN}\cdot\text{m}$$

→ la plancha de 12 da el **10 %**. Igualar pide $t = 37{,}5$ mm: **tres veces** el espesor que la
resistencia exige. Para una diagonal de tubo la vía (a) no es una opción de diseño.

## 6. La vía (b): la franja de rótula, y por qué engordar es al revés

La geometría del gusset debe acomodar el giro plástico sin fallar.  [NCh2369 §8.6.9(b) · C8.6.9]

$$\text{franja libre} = 2t = 24\ \text{mm}$$

→ y acá está la trampa: si alguien «asegura» el gusset subiéndolo a 20 mm, $\phi M_n$ crece
$\times 2{,}78$ (va con $t^2$) y la franja pedida sube a 40 mm. C8.6.9 lo dice sin rodeos — conviene
que la plancha produzca el giro plástico estable **«en lugar de robustecerla»** y correr la
plastificación al elemento.

## Resumen

| Verificación | Ref. | Demanda | Capacidad | Uso | |
|---|---|---:|---:|---:|:--:|
| Filete máximo (pared del tubo) | §J2.2b(b)(2) | — | 4 mm | — | tope |
| Cordón, 4 filetes de 345 mm | Ec. J2-4 | 841,3 kN | 846,5 kN | **0,99** | ✓ |
| Cordón largo cargado al extremo | Ec. J2-1 | $\ell/w = 86{,}2$ | 100 | 0,86 | ✓ no reduce |
| Fluencia de Whitmore ($t = 12$) | Ec. J4-1 | 841,3 kN | 1 413,1 kN | 0,60 | ✓ |
| Bloque de corte ($t = 12$) | Ec. J4-5 | 841,3 kN | 1 381,5 kN | 0,61 | ✓ |
| Compresión ($L_c/r \le 25$) | Ec. J4-6 | 724,6 kN | 1 413,1 kN | 0,51 | ✓ |
| Espesor que pide la resistencia | J4-1 / J4-5 | 7,31 mm | 12 mm provistos | 0,61 | ✓ sobra |
| **§8.6.9(a) — resistir $M_{pe}$** | NCh §8.6.9(a) | 41,5 kN·m | 4,24 kN·m | **9,8** | ✗ pide 38 mm |
| §8.6.9(b) — franja de rótula | NCh §8.6.9(b) | $2t = 24$ mm | detalle | — | vía adoptada |

## Veredicto

Ningún estado límite de resistencia dimensiona esta plancha: los tres piden 7,3 mm y se pone 12 por
montaje y por el mínimo de filete. El espesor lo gobierna §8.6.9, y lo gobierna **por arriba**: la
vía (a) pediría 38 mm para resistir los 41,5 kN·m del pandeo de la diagonal, de modo que en una
diagonal de tubo la única vía practicable es la (b), y la (b) premia la plancha delgada — cada
milímetro extra sube $\phi M_n$ con $t^2$ y empuja la rótula hacia el tubo, que es exactamente lo
que C8.6.9 pide evitar. La otra dimensión, el largo del cordón, tampoco la decide el gusset: la
pared de 6 mm del tubo topa el filete en 4 mm y estira los cordones a 345 mm, que a su vez es lo que
hace ancha la sección de Whitmore. Subir la pared a 8 mm acortaría el cordón un 34 %.

## Referencias

| Clave | Norma y edición | Cláusula | Leída en PDF |
|---|---|---|---|
| AISC-J2 | ANSI/AISC 360-22 | §J2.2b(b) y (d) + Ec. J2-1; Tabla J2.4; §J2.4 Ecs. J2-4 y J2-5 + Tabla J2.5 | 2026-08-09 (rasterizadas, pp. 16.1-127, 16.1-128, 16.1-130 y 16.1-132) |
| AISC-J4 | ANSI/AISC 360-22 | §J4.1 Ecs. J4-1/J4-2; §J4.2 Ecs. J4-3/J4-4; §J4.3 Ec. J4-5; §J4.4 Ec. J4-6 | 2026-08-09 (rasterizadas, pp. 16.1-145 y 16.1-146) |
| NCh | NCh2369:2025 | §8.6.8 y §8.6.9(a)/(b) + C8.6.8 y C8.6.9 | 2026-08-09 (rasterizada, p. impresa 90) |
| Memos | diagonal fusible; silla de anclaje | $T = 841{,}3$, $C = 724{,}6$, $R_y = 1{,}3$; $F_{EXX} = 482$ MPa | heredados (verificados) |
| — | sección de Whitmore a 30° | modelo declarado (S2), no está en 360-22 | no aplica |

## Para promover a post

- Tesis candidata: la cláusula que dimensiona por arriba. §8.6.9 es de las pocas que castigan
  engordar, y en el gusset de tubo la vía (a) queda descartada por un factor de tres.
- Hallazgo de método: el filete lo topa la pared del tubo por §J2.2b(b)(2), no la plancha — el
  cordón crece 50 % y con él la sección de Whitmore. Es un techo geométrico que se olvida.
- Por correr: la rotura del área neta del tubo ranurado (Cap. D, retraso de corte) no está en ningún
  memo del corpus (S6), y es el estado que puede obligar a reforzar la ranura.
- Figura: el gusset en verdadera magnitud con los 345 mm de cordón, el abanico de Whitmore de 523 mm
  y la franja de 2t, contra el mismo gusset de 38 mm que pediría la vía (a).
