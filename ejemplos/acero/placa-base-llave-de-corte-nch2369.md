---
titulo: Llave de corte — viento y sismo (ACI 318-25 §17.11 · NCh2369 §8.5.3)
disciplina: acero
tema: Placas base
normas: [NCh2369:2025, ACI 318-25 (SI), AISC 360-22, AISC Design Guide 1 3.ª ed.]
fecha: 2026-08-08
estado: verificado
veredicto: La misma llave, dos normas y dos veredictos = bajo viento sobra (0,88) y bajo sismo no cierra (1,08). El sismo entra dos veces —amplifica ×1,4 y §8.5.4 borra los 65 kN de roce que la DG1 acreditaría— y la capacidad no se mueve. Cierra con pedestal de 1300 (0,84), pero la salida barata resultó ser otra: el memo de la armadura de anclaje cose el mismo plano con 3 horquillas φ12 sin tocar el pedestal.
post:
---

# Llave de corte — viento y sismo (ACI 318-25 §17.11 · NCh2369 §8.5.3)

Una llave soldada bajo la placa base, con la misma geometría contra dos acciones: corte de viento y
corte sísmico de NCh2369. Hormigón por ACI §17.11; la llave como placa por AISC 360-22.

## Caso

| Dato | Valor |
|---|---|
| Columna / placa | HEB 300; placa $450 \times 450 \times 25$ mm, A36 ($F_y = 250$ MPa) |
| Pedestal | $1100 \times 1100$ mm, alto $h_a = 1200$ mm, $f'_c = 25$ MPa |
| Grout | $t_{grout} = 40$ mm |
| Pernos | 4 × 1″ F1554 gr. 36, patrón cuadrado $s = 350$ mm ($f = 175$ mm) |
| Llave | plancha $b_{sl} = 300$ mm, $t_{sl} = 25$ mm, 90 mm bajo la placa (40 grout + 50 embebidos) |
| **Caso V** — viento | $V_u = 80$ kN, $P_u = 0$ |
| **Caso S** — sismo | $V_E = 70$ kN, $P_u = 250$ kN concurrente, $R_1 = 2{,}0$ |

## Supuestos

1. **S1** — Todo en SI (N, mm, MPa): la edición SI trae otros coeficientes que la de pulgadas ($V_b$: 3,7 y no 9).
2. **S2** — Pernos no soldados a la placa, así que no aplica §17.11.1.1.3.
3. **S3** — Hormigón fisurado sin armadura suplementaria ($\psi_{c,V} = 1{,}0$); el cono se desarrolla en el pedestal, no en la fundación bajo él.
4. **S4** — $R_1 = 2{,}0$ es dato del análisis global, ya resuelto por la Ec. (14) de §5.14.
5. **S5** — En el caso S, $V_E$ y $P_u$ salen de la combinación LRFD de 4.5, con $P_u$ la compresión **mínima** concurrente.

## 1. El corte de diseño

Bajo viento el corte es el de la combinación. Bajo sismo, la llave transmite **el total**, con el
estado sísmico horizontal amplificado por $0{,}7R_1 \ge 1{,}0$.  [NCh2369 §8.5.3]  (S4, S5)

$$V_u^{V} = 80{,}0\ \text{kN} \qquad V_u^{S} = 0{,}7\,R_1\,V_E = 1{,}4 \cdot 70 = 98{,}0\ \text{kN}$$

→ 22 % más, sobre una capacidad que no cambia.

## 2. El roce vale cero, y la excepción no aplica

La DG1 permite resistir corte por roce placa-hormigón con la compresión concurrente
[DG1 §4.3.5, Ec. 4-30]; NCh2369 lo prohíbe —ni mortero de nivelación ni roce— porque retracción,
pérdida de pretensión y variación de la carga vertical hacen incierta la normal.  [NCh2369 §8.5.4 · C8.5.4]

$$\phi V_n = \phi_{friction}\,\mu\,P_u = 0{,}65 \cdot 0{,}4 \cdot 250 = 65{,}0\ \text{kN} \;\longrightarrow\; 0$$

§8.5.3 exime de llave a apoyos con corte < 75 kN (con solo 2 pernos activos) y a sistemas de ≥ 9
pernos: acá $V_u^{S} = 98 > 75$ y $n = 4 < 9$ → **la llave es obligatoria** y toma dos tercios de
$V_u$ que la DG1 le descontaría.

## 3. Quién toma el corte, y con qué área

El Cap. 17 pide mínimo 4 anclajes **excepto** para acero a corte, breakout a corte y pryout: esas
tres verificaciones se eliminan y la llave toma $V_u$ completo. De la llave solo trabaja la franja
de $2t_{sl}$ bajo la superficie.  [ACI §17.11.1.1.2 · §17.11.2.1.1(b)]  (S2)

$$h_{ef,sl} = 2\,t_{sl} = 50\ \text{mm} \qquad A_{ef,sl} = b_{sl}\,h_{ef,sl} = 300 \cdot 50 = 15\,000\ \text{mm}^2$$

→ la llave baja 90 mm bajo la placa y **solo 50 mm trabajan**.

## 4. Aplastamiento de la llave

Sin axial $\psi_{brg,sl} = 1$ [Ec. 17.11.2.2.1b]; con compresión concurrente sube el confinamiento
[Ec. 17.11.2.2.1c], con $A_{bp} = 450^2 = 202\,500\ \text{mm}^2$. $\phi = 0{,}65$ [§17.11.1.1.4].

$$\psi_{brg,sl}^{S} = 1 + 4\,\frac{P_u}{A_{bp}\,f'_c} = 1 + \frac{4 \cdot 250\,000}{202\,500 \cdot 25} = 1{,}20 \le 2{,}0$$

$$\phi V_{brg,sl} = 0{,}65 \cdot 1{,}7\,f'_c\,A_{ef,sl}\,\psi_{brg,sl} = 414\ \text{kN}\ (V) \;/\; 497\ \text{kN}\ (S)$$

→ usos **0,19** y **0,20** ✓ — la compresión ayuda aquí, y solo aquí.

## 5. Breakout de la llave

$c_{a1} = 1100/2 - 25/2 = 537{,}5$ mm; $c_{a2} = 400$ mm; $1{,}5c_{a1} = 806$ mm. Como
$h_a = 1200 \ge 1{,}5c_{a1}$, no aplica el tope de §17.7.2.1.2 y $\psi_{h,V} = 1{,}0$;
$\psi_{ed,V} = 0{,}7 + 0{,}3 \cdot 400/806 = 0{,}849$.  [ACI §17.11.3.1.1 · §17.7.2]  (S3)

$$A_{Vc} = (b_{sl} + 2c_{a2})(h_{ef,sl} + 1{,}5c_{a1}) - A_{ef,sl} = 926\,900\ \text{mm}^2 \qquad A_{Vco} = 4{,}5\,c_{a1}^2 = 1\,300\,100\ \text{mm}^2$$

$$V_b = 3{,}7\,\lambda_a\sqrt{f'_c}\,c_{a1}^{1{,}5} = 230{,}5\ \text{kN} \qquad \phi V_{cb,sl} = 0{,}65 \cdot 0{,}713 \cdot 0{,}849 \cdot 230{,}5 = 90{,}7\ \text{kN}$$

→ **0,88** bajo viento ✓ y **1,08** bajo sismo ✗. La compresión no entra en este estado límite:
la capacidad es la misma en los dos casos, y **gobierna en los dos**.

## 6. Flexión de la llave

Voladizo de brazo $e = t_{grout} + h_{ef,sl}/2 = 65$ mm. Plancha rectangular:
$M_n = F_y Z \le 1{,}5F_y S_x$, y con $Z/S_x = 1{,}5$ el tope se cumple con igualdad.  [AISC §J4.5 · Ec. F11-1]

$$Z = \frac{b_{sl}\,t_{sl}^2}{4} = 46\,875\ \text{mm}^3 \qquad \phi M_n = 0{,}90\,F_y Z = 10{,}5\ \text{kN}\cdot\text{m}$$

→ $M_u = V_u\,e$ vale 5,2 y 6,37 kN·m: usos **0,49** y **0,61** ✓.

## 7. Lo que la llave le hace a los pernos

El par entre la reacción de aplastamiento y el corte va a los anclajes, y el embebido queda atado
a la geometría de la llave.  [ACI §17.11.1.1.8 · §17.11.1.1.9 · DG1 Ej. 4.7-5]

$$h_{ef} \ge \max\left(2{,}5\,h_{sl};\ 2{,}5\,c_{sl}\right) = \max\left(225;\ 438\right) = 438\ \text{mm} \;\Rightarrow\; h_{ef} = 450\ \text{mm}$$

Bajo viento ($P_u = 0$) el par tracciona: $Y = 1{,}05$ mm y $T_u = 13{,}0$ kN → **6,5 kN/perno**
sin momento aplicado. Bajo sismo, $e = M_u/P_u = 25{,}5 < N/6 = 75$ mm → $T_u = 0$.

→ los pernos de 400 mm del caso sin llave no alcanzan; **el sismo castiga la llave y alivia los pernos**.

## Resumen

| Verificación | Ref. | Caso V (80 kN) | Caso S (98 kN) | |
|---|---|---:|---:|:--:|
| Excepción sin llave | NCh §8.5.3 | — | no aplica | obligatoria |
| Roce placa-hormigón | NCh §8.5.4 | — | ~~65,0 kN~~ → 0 | prohibido |
| Aplastamiento de la llave | ACI §17.11.2 | 0,19 | 0,20 | ✓ |
| **Breakout de la llave** | ACI §17.11.3 | **0,88** ✓ | **1,08** ✗ | gobierna |
| Flexión de la llave | AISC §J4.5/F11 | 0,49 | 0,61 | ✓ |
| Embebido mínimo del perno | ACI §17.11.1.1.8 | 438 → 450 mm | ídem | ✓ |
| Perno traccionado por el par | ACI §17.11.1.1.9 | 6,5 kN/perno | 0 | ✓ |

## Veredicto

La misma llave pasa con viento (0,88) y no cierra con sismo (1,08), y entre los dos casos la
capacidad no se movió un kilonewton: el sismo entra dos veces por el lado de la demanda —amplifica
×1,4 [§8.5.3] y borra los 65 kN de roce [§8.5.4]—. La palanca no es la llave (profundizarla no
aporta, porque $A_{ef,sl}$ topea en $2t_{sl}$; ensancharla tampoco, porque $A_{Vc}$ ya está cortado
por las caras) sino el pedestal vía $c_{a1}$: con $1300 \times 1300$, $\phi V_{cb,sl} = 117$ kN y
uso 0,84. Detalle obligatorio: agujero de inspección de 25 mm a cada lado largo [§17.11.1.2].

## Referencias

| Clave | Norma y edición | Cláusula | Leída en PDF |
|---|---|---|---|
| NCh | NCh2369:2025 | §8.5.3 (+C8.5.3), §8.5.4 (+C8.5.4); §5.14 Ec. (14) | 2026-08-08 |
| ACI | ACI 318-25 (SI) | §17.11.1.1.2 a §17.11.1.1.9; §17.11.1.2; §17.11.2 (Ecs. 17.11.2.2.1b y c); §17.11.3.1 | 2026-08-07 y 2026-08-08 |
| ACI-b | ACI 318-25 (SI) | §17.7.2.1 a §17.7.2.5 — coeficientes del breakout | 2026-08-07 |
| DG1 | AISC Design Guide 1, 3.ª ed. | §4.3.5 Ec. 4-30; §4.3.6; Ej. 4.7-5 | 2026-08-07 y 2026-08-08 |
| AISC | ANSI/AISC 360-22 | §J4.5; §F11.1 Ec. F11-1 — $M_n = F_y Z \le 1{,}5F_y S_x$ | 2026-08-07 y 2026-08-08 |

## Para promover a post

- Tesis candidata: la misma llave, dos normas, dos veredictos — la diferencia está toda del lado de
  la demanda, y la salida es el pedestal. Dentro de ella, la segunda: la llave que se dibuja no es
  la que trabaja (solo $2t_{sl}$), y el par que ella misma genera tracciona pernos sin momento.
- Figuras: $A_{ef,sl}$ y $A_{Vc}$ contra los del grupo de pernos, a la misma escala; demanda
  80 → 98 kN contra capacidad fija de 90,7.
