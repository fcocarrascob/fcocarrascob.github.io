---
titulo: Tracción del grupo de pernos — el cono que ningún pedestal compra (ACI 318-25 §17.6)
disciplina: hormigon
tema: Anclajes
normas: [ACI 318-25 (SI), NCh2369:2025]
fecha: 2026-08-09
estado: verificado
veredicto: Ninguna de las dos configuraciones cierra en hormigón simple — §17.6.2.1.2 trunca el h_ef de cálculo de 450 a 250 (pedestal 1100) y a 117 (600), y el uso queda en 2,11 y 7,22. El lado 1100 se eligió por el cono de la llave y para el de tracción no compra nada. Con armadura de anclaje el 600 cierra en 0,83 y son sus propias barras mínimas, porque el pedestal chico las mete dentro de la pantalla de 0,5h_ef que el grande deja fuera. Pero el estallido lateral —que la armadura no reemplaza— fija el lado mínimo en 710 mm, y el pullout de la tuerca falla en las dos con 1,58 sin importar el pedestal.
post:
---

# Tracción del grupo de pernos — el cono que ningún pedestal compra (ACI 318-25 §17.6)

Los cuatro estados límite de hormigón del grupo traccionado —breakout, pullout, estallido lateral y
la vía armada— en las dos configuraciones del mismo pedestal: el 1100 del corpus y el 600 de la práctica.

## Caso

| Dato | Valor |
|---|---|
| Columna / placa | HEB 300; placa $450 \times 450 \times 25$ mm |
| Pernos | 4 × 1″ F1554 gr. 36, cuadrado $s = 350$ mm ($f = 175$); $h_{ef} = 450$; tuerca hex. pesada, $A_{brg} = 969$ mm² |
| Pedestal A (corpus) | $1100 \times 1100 \times 1200$, 16φ25 + estribos φ10 |
| Pedestal B (práctica) | $600 \times 600 \times 1200$, 12φ16 + estribos φ10 |
| Hormigón / armadura | $f'_c = 25$ MPa fisurado; A630-420H ($f_y = 420$ MPa); recubrimiento 50 mm |
| Demanda (fila traccionada) | $2\,T_{ye} = 377{,}2$ kN |

## Supuestos

1. **S1** — Demanda = fluencia esperada de la fila traccionada: $T_{ye} = 188{,}6$ kN/perno (memo de la
   silla). Es el tope físico —§8.5.2 pedía 635 kN, más de lo que el acero entrega— y es lo que §9.5.2
   (Cat. III) le pide al pedestal.
2. **S2** — Grupo = los 2 pernos traccionados [§17.6.2.3.2], resultante centrada: $\psi_{ec,N} = 1{,}0$.
   Fisurado: $\psi_{c,N} = 1{,}0$; vaciado in situ: $\psi_{cp,N} = 1{,}0$ [§17.6.2.6.2].
3. **S3** — $\psi_a = 0{,}95$ en las dos (T. 17.5.4.1, sin acreditar armadura suplementaria); anclaje
   **no redundante**: $\phi = 0{,}65$ [T. 21.2.1(l)], y $\phi = 0{,}90$ para la armadura de anclaje [fila (k)].
4. **S4** — $A_{brg}$ = hexágono de la tuerca menos el vástago; sin arandela de placa.
5. **S5** — $\ell_d$ y $\ell_{dh}$ con las formas del memo de la armadura de la llave (la Ec. 25.4.3.1(a) del 318-14).
6. **S6** — Geometría, $h_{ef} = 450$ y el mínimo de 0,5 % [§10.6.1.2], heredados de los memos de la llave y del pedestal.

## 1. Cuatro caras a menos de 1,5h_ef: el h_ef de cálculo no es 450

$c_a = L/2 - 175$ → 375 y 125 mm, ambos bajo $1{,}5h_{ef} = 675$: **tres o más bordes en las dos**
configuraciones, así que el $h_{ef}$ de cálculo se trunca.  [§17.6.2.1.2]  (S6)

$$h'_{ef} = \max\left(\frac{c_{a,\text{máx}}}{1{,}5};\ \frac{s}{3}\right) = \max(250;\ 116{,}7) = 250 \quad\text{y}\quad \max(83{,}3;\ 116{,}7) = 116{,}7\ \text{mm}$$

→ el pedestal es «miembro angosto» aun con lado 1100. Y con $h'_{ef} < 280$ mm la rama de la
Ec. 17.6.2.2.3 ($h_{ef}^{5/3}$) queda fuera de rango: manda la 17.6.2.2.1.

## 2. Cono proyectado y resistencia básica

$A_{Nc}$ de la fila recortada por las caras, contra $A_{Nco} = 9h'^2_{ef}$; $k_c = 10$ (in situ).
[Ecs. 17.6.2.1.4 y 17.6.2.2.1]  (S2)

$$\frac{A_{Nc}}{A_{Nco}} = \frac{750 \cdot 1\,100}{562\,500} = 1{,}467 \qquad \frac{300 \cdot 600}{122\,578} = 1{,}469 \qquad (\le n A_{Nco})$$

$$N_b = k_c\lambda_a\sqrt{f'_c}\,h'^{1{,}5}_{ef} = 10 \cdot 5 \cdot 250^{1{,}5} = 197{,}6 \quad\text{y}\quad 10 \cdot 5 \cdot 116{,}7^{1{,}5} = 63{,}0\ \text{kN}$$

→ la razón es la misma (1,47): al truncarse $h_{ef}$ el cono se recorta proporcional, y lo único que separa a las dos configuraciones es $N_b$.

## 3. φN_cbg: ninguna de las dos cierra

$\psi_{ed,N} = 1{,}0$ en el 1100 ($c_{a,min} = 375 = 1{,}5h'_{ef}$, justo) y $0{,}7 + 0{,}3 \cdot 125/175 = 0{,}914$
en el 600.  [Ecs. 17.6.2.4.1 y 17.6.2.1b]  (S3)

$$\phi N_{cbg} = 0{,}65 \cdot 1{,}467 \cdot 0{,}95 \cdot 1{,}0 \cdot 197{,}6 = 179{,}0\ \text{kN} \;\Rightarrow\; \textbf{2,11} \qquad 0{,}65 \cdot 1{,}469 \cdot 0{,}95 \cdot 0{,}914 \cdot 63{,}0 = 52{,}3 \;\Rightarrow\; \textbf{7,22}$$

→ el 1100 es 3,4 veces mejor y sigue al doble de lo admisible: el ancho se eligió por el cono de la
llave y para este no compra nada. El premio que la 25 agrega tampoco se cobra —$\psi_{cm,N} = 2 - z/(1{,}5h_{ef})$
exige los pernos traccionados a 675 mm **o más de todo borde libre**, y hay 375 y 125 [§17.6.2.7.2]—,
pero sí cobra $\psi_a = 0{,}95$ (T. 17.5.4.1, nueva) y el $\phi = 0{,}65$ del anclaje no redundante contra
el 0,70 de la Condición B: 12 % más dura que la 19 para el mismo perno.

## 4. Lo que depende de la cabeza, no del pedestal

Pullout y estallido lateral cuelgan de $A_{brg}$, no del lado.  [Ecs. 17.6.3.1 y 17.6.3.2.2a]  (S4)

$$\phi N_{pn} = \phi\,\psi_a\psi_{c,P}\,(8A_{brg}f'_c) = 0{,}65 \cdot 0{,}95 \cdot 193{,}8 = 119{,}7\ \text{kN} \;<\; T_{ye} = 188{,}6 \;\Rightarrow\; \textbf{1,58}$$

→ falla **en las dos configuraciones**, y ningún pedestal lo arregla: pide arandela de placa.

## 5. Estallido lateral: solo el pedestal chico lo activa

Aplica si $h_{ef} > 2{,}5c_{a1}$: $450 > 312{,}5$ en el 600 y $450 < 937{,}5$ en el 1100.
$N_{sb}$ va sin la corrección por $c_{a2}$ cuando se agrupa.  [Ecs. 17.6.4.1 y 17.6.4.2]  (S4)

$$N_{sbg} = \left(1 + \frac{s}{6c_{a1}}\right)\psi_a\,13\,c_{a1}\sqrt{A_{brg}}\,\lambda_a\sqrt{f'_c} = 1{,}467 \cdot 240{,}3 = 352{,}4 \;\Rightarrow\; \phi N_{sbg} = 229{,}1\ \text{kN},\ \textbf{1,65}$$

→ y la armadura de anclaje **no lo reemplaza**: §17.5.2.1.1 sustituye solo el breakout de §17.6.2.
Salidas: $A_{brg} \ge 2\,630$ mm² (arandela ≈ 56 × 56, que de paso deja el pullout en 0,49), o
$c_{a1} \ge 0{,}4h_{ef} = 180$ → **lado ≥ 710 mm**. El otro piso al borde, los $6d_a = 152$ mm de la
T. 17.9.2(a) para perno apretado, sí es eximible con armadura contra la hendidura [§17.9.1]; este no.

## 6. La armadura de anclaje, y quién queda dentro de la pantalla

Solo cuenta la barra vertical a menos de $0{,}5h_{ef} = 225$ mm del eje del perno, y la
investigación base llega hasta φ16.  [§17.5.2.1.1 · R17.5.2.1.1]  (S3, S6)

$$A_s \ge \frac{N}{\phi f_y} = \frac{377\,200}{0{,}90 \cdot 420} = 998\ \text{mm}^2$$

| | eje de barra a la cara | barra más cercana al perno | eficaces | $A_s$ |
|---|---:|---:|---:|---:|
| 1100 · 16φ25 | 72,5 mm | 309 mm | **0** | 0 ✗ |
| 600 · 12φ16 | 68,0 mm | 81 mm | **6** (3 por perno, a 81 y 113) | 1 206 mm² → **0,83** ✓ |

→ el pedestal chico mete su armadura mínima dentro de la pantalla; el grande la empuja afuera, y encima
con φ25. Cruzan el cono a ~375 mm: la recta $\ell_d = 640$ no cabe, el gancho $\ell_{dh} = 323$ sí (325 disponibles).  (S5)

## Resumen

| Verificación | Ref. | Demanda | Capacidad | Uso | |
|---|---|---:|---:|---:|:--:|
| $h_{ef}$ de cálculo | §17.6.2.1.2 | 450 mm | 250 / 117 mm | — | truncado |
| Breakout, pedestal 1100 | Ec. 17.6.2.1b | 377,2 kN | 179,0 kN | **2,11** | ✗ |
| Breakout, pedestal 600 | Ec. 17.6.2.1b | 377,2 kN | 52,3 kN | **7,22** | ✗ |
| Pullout, por perno (los dos) | Ec. 17.6.3.2.2a | 188,6 kN | 119,7 kN | **1,58** | ✗ |
| Estallido lateral, 600 | Ec. 17.6.4.2 | 377,2 kN | 229,1 kN | **1,65** | ✗ (1100: no aplica) |
| Armadura de anclaje, 600 | §17.5.2.1.1 | 998 mm² | 1 206 mm² (6φ16) | 0,83 | ✓ |
| Armadura de anclaje, 1100 | R17.5.2.1.1 | 998 mm² | 0 (la más cercana a 309) | — | ✗ |
| Distancia al borde, 600 | T. 17.9.2(a) | 152 mm | 125 mm | 1,22 | ✗ eximible |

## Veredicto

El cono de tracción no lo compra ningún pedestal: §17.6.2.1.2 trunca el $h_{ef}$ de cálculo apenas hay
tres caras cerca, y con 450 mm de empotramiento eso pasa hasta con lado 1100. Con usos de 2,11 y 7,22
la vía armada no es una alternativa al hormigón simple: es la única. Y ahí se invierte el orden —el 600
cierra en 0,83 con las mismas barras que su cuantía mínima le exige, porque las deja a 81 mm del perno;
el 1100 no tiene ni una dentro de los 225 de la pantalla—. El piso al lado lo pone el estallido lateral,
que la armadura no reemplaza: **≥ 710 mm**, o una arandela de 2 630 mm² para pagarlo por la cabeza. Y el
pullout con tuerca sola falla 1,58 en las dos: ese no es problema de pedestal, es de arandela.

## Referencias

| Clave | Norma y edición | Cláusula | Leída en PDF |
|---|---|---|---|
| ACI-a | ACI 318-25 (SI) | §17.6.2.1 a §17.6.2.7 + R (Ecs. 17.6.2.1b, .1.1, .1.2, .1.4, .2.2.1, .2.2.3, .2.3.1, .2.4.1, .2.5.1, .2.6.2, .2.7.1) | 2026-08-09 (rasterizadas, pp. impresas 267–274) |
| ACI-b | ACI 318-25 (SI) | §17.6.3.1 y §17.6.3.2.2(a); §17.6.4.1, §17.6.4.1.1 y §17.6.4.2 + R17.6.4 | 2026-08-09 (rasterizadas, pp. 274–276) |
| ACI-c | ACI 318-25 (SI) | §17.5.2.1.1 + R17.5.2.1.1; §17.5.3; §17.5.4.1 + T. 17.5.4.1; T. 21.2.1 filas (k), (l), (m) | 2026-08-09 (rasterizadas, pp. 263, 265–266 y 430) |
| ACI-d | ACI 318-25 (SI) | §17.9.1; §17.9.2 + Tabla 17.9.2(a) + R17.9.2 | 2026-08-09 (rasterizadas, pp. 293–294) |
| ACI-e | ACI 318-25 (SI) | §10.6.1.2 (cuantía mínima); §25.4.2 y §25.4.3.1 ($\ell_d$, $\ell_{dh}$) | heredadas de los memos del pedestal y de la armadura de la llave (2026-08-08) |
| NCh | NCh2369:2025 | §9.5.2 + C9.5.2 (Cat. III); §8.5.2 (piso del momento) | heredadas de los memos del pedestal y de la base empotrada (2026-08-08) |
| Memos | silla, llave y pedestal del cuarteto | $T_{ye} = 188{,}6$ kN; $h_{ef} = 450$; geometría | heredados (verificados) |

## Para promover a post

- Tesis candidata: el pedestal chico ancla mejor —la pantalla de 0,5$h_{ef}$ y la truncación de §17.6.2.1.2—, contra el criterio con que se dimensionó el del corpus.
- Hallazgo de edición: $\psi_a$ (T. 17.5.4.1), $\psi_{cm,N}$ (§17.6.2.7) y el cambio de Condición A/B a redundante/no redundante (T. 21.2.1) son nuevos de la 25.
- Por correr: §17.10 (anclajes sísmicos) quedó fuera de alcance; y el memo de la rigidez rotacional usa $h_{ef} = 400$ donde este, el de la llave y el del pedestal usan 450.
- Figura: el cono truncado en las dos configuraciones, con la pantalla de 225 mm y las barras dentro y fuera.
