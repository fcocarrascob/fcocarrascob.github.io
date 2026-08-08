---
titulo: El pedestal por capacidad — NCh2369 §9.5 + ACI 318-25
disciplina: hormigon
tema: Anclajes
normas: [NCh2369:2025, ACI 318-25 (SI), AISC 341-22]
fecha: 2026-08-08
estado: verificado
veredicto: Cierra holgado (usos ≤ 0,37) — y esa es la tesis. la resistencia no dimensiona nada. la armadura la fija el 0,5 % mínimo y los estribos la zona de protección de §9.5.3, que con lado 1100 cubre casi todo el pedestal.
post:
---

# El pedestal por capacidad — NCh2369 §9.5 + ACI 318-25

El pedestal del cuarteto de acero como miembro de hormigón armado, diseñado para la capacidad
esperada de sus anclajes (§9.5.2, Cat. III). El anclaje (Cap. 17) ya está en el post publicado.

## Caso

| Dato | Valor |
|---|---|
| Pedestal | $1100 \times 1100 \times 1200$ mm, $f'_c = 25$ MPa, recubrimiento 50 mm |
| Armadura | A630-420H ($f_y = 420$ MPa); longitudinal 16φ25; estribos φ10 perimetral + 2 trabas |
| Anclajes | 4 × 1″ F1554 gr. 36 con silla: $T_{ye} = 188{,}6$ kN c/u; $h_{ef} = 450$ mm |
| Llave de corte | $300 \times 25$, pie 50 mm bajo el tope de hormigón; $c_{a1} = 537{,}5$ mm |
| Contexto | Categoría III; compresión máxima concurrente 400 kN |

## Supuestos

1. **S1** — Todo en SI (N, mm, MPa); demandas heredadas del cuarteto de memos de acero.
2. **S2** — Categoría III: rige la capacidad esperada de los dispositivos de anclaje, no el análisis.
3. **S3** — Corte esperado = flexión de la llave con $R_y = 1{,}3$ (plancha A36, Tabla A3.2), la vía más débil del dispositivo.
4. **S4** — Tracción y corte concurrentes (conservador en $V_c$).
5. **S5** — La compresión del análisis es trivial frente a $P_o$: no se verifica.
6. **S6** — $d = 1100 - 50 - 10 - 12{,}5 = 1\,027$ mm.

## 1. Es un pedestal, y el Cap. 10 lo cubre

$$\frac{h}{\text{lado menor}} = \frac{1\,200}{1\,100} = 1{,}09 \le 3$$

→ pedestal según C9.5; ACI §10.1.1 incluye pedestales de hormigón armado.  [NCh C9.5 · ACI §10.1.1]

## 2. La demanda es la capacidad de los pernos y la llave

Cat. III/IV: resistencia de diseño ≥ **capacidad esperada en tracción y corte** de los
dispositivos.  [NCh §9.5.2]  (S2, S3)

$$T_u = 4\,T_{ye} = 4 \cdot 188{,}6 = 754{,}4\ \text{kN} \qquad V_u = \frac{R_y F_y Z_{sl}}{e} = \frac{1{,}3 \cdot 250 \cdot 46\,875}{65} = 234{,}4\ \text{kN}$$

## 3. Armadura longitudinal: manda el mínimo

Pedestal sobredimensionado → área reducida (≥ $A_g/2$) con piso explícito.  [ACI §10.3.1.2 · §10.6.1.2]

$$A_{s,min} = 0{,}005\,A_g = 0{,}005 \cdot 1\,210\,000 = 6\,050\ \text{mm}^2 \quad\Rightarrow\quad 16\phi25 = 7\,854\ \text{mm}^2\ (\rho = 0{,}65\ \%)$$

## 4. Tracción del grupo

Sección controlada por tracción: $\phi = 0{,}90$ [Tabla 21.2.2(f)].  [ACI Ec. 22.4.3.1]

$$\phi P_{nt} = 0{,}90\,f_y A_{st} = 0{,}90 \cdot 420 \cdot 7\,854 = 2\,969\ \text{kN}$$

→ uso **0,25** ✓ — el mínimo paga 4 veces la fluencia esperada del grupo, y es la armadura que
C9.5.2 quiere cruzando el cono ($h_{ef} = 450$ lo asegura).

## 5. Corte con tracción concurrente

$N_u$ negativo castiga a $V_c$: $N_u/6A_g = -754\,400/(6 \cdot 1\,210\,000) = -0{,}104$ MPa.
[ACI Tabla 22.5.5.1(a)]  (S4, S6)

$$\phi V_c = 0{,}75\left(0{,}17\sqrt{f'_c} + \frac{N_u}{6A_g}\right)b\,d = 0{,}75 \cdot 0{,}746 \cdot 1\,100 \cdot 1\,027 = 632\ \text{kN}$$

→ uso **0,37** ✓. Además $V_u < 0{,}5\phi V_c = 316$ kN: ni siquiera se exige $A_{v,min}$
[§10.6.2.1]; el provisto (4 ramas, 314 mm²) supera igual los 183 de §10.6.2.2.

## 6. Estribos: la zona de protección es casi todo el pedestal

Profundidad ≥ máx(lado menor; llave + 45° hasta la cara).  [NCh §9.5.3 · C9.5.3]

$$\max\left(1\,100;\ 50 + 537{,}5 = 587{,}5\right) = 1\,100\ \text{mm de }1\,200$$

→ estribos ≤ 220 mm en 1 100 mm y ≤ 440 en el resto: **φ10 c/200 en toda la altura**, los 3
primeros grupos a ≤ 50 mm libres, y malla superior (lado ≥ 700).

## Resumen

| Verificación | Ref. | Demanda | Capacidad | Uso | |
|---|---|---:|---:|---:|:--:|
| Clasificación pedestal | NCh C9.5 | 1,09 | ≤ 3 | — | ✓ |
| Tracción del grupo | ACI 22.4.3.1 | 754,4 kN | 2 969 kN | 0,25 | ✓ |
| Corte + tracción | ACI T.22.5.5.1(a) | 234,4 kN | 632 kN | 0,37 | ✓ |
| Cuantía longitudinal | ACI §10.6.1.2 | 6 050 mm² | 7 854 mm² (16φ25) | 0,77 | ✓ mínimo |
| Estribos zona de protección | NCh §9.5.3 | ≤ 220 mm | φ10 c/200 | — | ✓ |
| 3 primeros grupos ≤ 50 libres | NCh §9.5.3 | detalle | detalle | — | ✓ |

## Veredicto

Cierra holgado: ningún uso pasa de 0,37, y eso **es** el resultado. La armadura la fija el 0,5 %
mínimo y los estribos §9.5.3, cuya zona de protección cubre casi todo el pedestal. La
sobrerresistencia de C9.5.2 («no es fusible») sale sola: el ancho se eligió por el cono
($c_{a1}$) y ese mismo ancho regala todo lo demás. El pedestal no se calcula: se detalla.

## Referencias

| Clave | Norma y edición | Cláusula | Leída en PDF |
|---|---|---|---|
| NCh | NCh2369:2025 | §9.5 + C9.5; §9.5.1 a §9.5.3 + C9.5.1 a C9.5.3 | 2026-08-08 |
| ACI-10 | ACI 318-25 (SI) | §10.1.1; §10.3.1.2; §10.6.1.2; §10.6.2.1 y .2; §10.7.3.1 | 2026-08-08 |
| ACI-22 | ACI 318-25 (SI) | Ec. 22.4.3.1; Tabla 22.5.5.1 + §22.5.5.1.1 | 2026-08-08 |
| ACI-21 | ACI 318-25 (SI) | Tablas 21.2.1 y 21.2.2 | 2026-08-08 |
| AISC341 | ANSI/AISC 341-22 | Tabla A3.2 — plancha A36: $R_y = 1{,}3$ | 2026-08-08 |
| Memos | cuarteto de acero | $T_{ye}$, llave, $c_{a1}$, $h_{ef}$ | heredados (verificados) |

## Para promover a post

- Tesis candidata: el pedestal no se calcula, se detalla — tercera cara del «todo se diseña para
  el perno»: la silla (acero), el cono (post publicado) y ahora el miembro completo.
- El par con el post publicado es directo: aquel pregunta si el perno arranca el cono; este,
  qué armadura lo cose y qué estribos contienen el sólido de la llave.
- Figura: el pedestal en elevación con la zona de protección sombreada (1 100 de 1 200) y el
  plano a 45° desde el pie de la llave.
