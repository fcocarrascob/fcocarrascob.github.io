---
titulo: Llave de corte en placa base — ACI 318-25 §17.11
disciplina: acero
tema: Placas base
normas: [ACI 318-25 (SI), AISC 360-22, AISC Design Guide 1 3.ª ed.]
fecha: 2026-08-07
estado: pendiente
veredicto: Cierra con uso 0,88 en el breakout de la llave, pero obliga a subir h_ef de los pernos de 400 a 450 mm.
post:
---

# Llave de corte en placa base — ACI 318-25 §17.11

Corte de viento en la base de una columna, transferido por una llave soldada bajo la placa.
Estados límite de hormigón por ACI §17.11; la llave como placa de acero por AISC 360-22.

## Caso

| Dato | Valor |
|---|---|
| Columna / placa | HEB 300; placa $450 \times 450 \times 25$ mm, A36 ($F_y = 250$ MPa) |
| Pedestal | $1100 \times 1100$ mm, alto $h_a = 1200$ mm, $f'_c = 25$ MPa |
| Grout | $t_{grout} = 40$ mm |
| Pernos | 4 × 1″ F1554 gr. 36, patrón cuadrado $s = 350$ mm ($f = 175$ mm) |
| Llave | plancha $b_{sl} = 300$ mm, $t_{sl} = 25$ mm, 90 mm bajo la placa (40 grout + 50 embebidos) |
| Cargas | $V_u = 80$ kN (≈ 8,2 tonf), $P_u = 0$ (viento) |

## Supuestos

1. **S1** — Todo en SI (N, mm, MPa): la edición SI trae otros coeficientes que la de pulgadas ($V_b$: 3,7 y no 9).
2. **S2** — Pernos no soldados a la placa, así que no aplica §17.11.1.1.3.
3. **S3** — Hormigón fisurado sin armadura suplementaria: $\psi_{c,V} = 1{,}0$.
4. **S4** — El cono de la llave se desarrolla en el pedestal, no en la fundación bajo él.
5. **S5** — Sin carga axial concurrente con el corte.

## 1. Los pernos no toman corte

Mínimo 4 anclajes por el Cap. 17 **excepto** acero a corte, breakout a corte y pryout a corte: el
código elimina esas tres verificaciones y la llave toma $V_u$ completo.  [ACI §17.11.1.1.2]  (S2)

## 2. Área efectiva de aplastamiento

Placa sobre el hormigón: solo cuenta la franja de $2t_{sl}$ bajo la superficie.  [ACI §17.11.2.1.1(b)]

$$h_{ef,sl} = 2\,t_{sl} = 50\ \text{mm} \qquad A_{ef,sl} = b_{sl}\,h_{ef,sl} = 300 \cdot 50 = 15\,000\ \text{mm}^2$$

→ la llave baja 90 mm bajo la placa y **solo 50 mm trabajan**.

## 3. Aplastamiento de la llave

$P_u = 0 \Rightarrow \psi_{brg,sl} = 1$ [Ec. 17.11.2.2.1b]; $\phi = 0{,}65$ [§17.11.1.1.4].  (S5)

$$V_{brg,sl} = 1{,}7\,f'_c\,A_{ef,sl}\,\psi_{brg,sl} = 1{,}7 \cdot 25 \cdot 15\,000 \cdot 1 = 637{,}5\ \text{kN}$$

→ $\phi V_{brg,sl} = 0{,}65 \cdot 637{,}5 = 414$ kN, uso **0,19** ✓.

## 4. Breakout de la llave

$c_{a1} = 1100/2 - 25/2 = 537{,}5$ mm (cara de la llave al borde); $c_{a2} = 400$ mm;
$1{,}5c_{a1} = 806$ mm. Como $h_a = 1200 \ge 1{,}5c_{a1}$, no aplica el tope de $c_{a1}$ de
§17.7.2.1.2.  [ACI §17.11.3.1.1]  (S4)

$$A_{Vc} = (b_{sl} + 2c_{a2})(h_{ef,sl} + 1{,}5c_{a1}) - A_{ef,sl} = 1100 \cdot 856 - 15\,000 = 926\,900\ \text{mm}^2$$

$$A_{Vco} = 4{,}5\,c_{a1}^2 = 4{,}5 \cdot 537{,}5^2 = 1\,300\,100\ \text{mm}^2 \qquad \text{[Ec. 17.7.2.1.3]}$$

$$V_b = 3{,}7\,\lambda_a\sqrt{f'_c}\,c_{a1}^{1{,}5} = 3{,}7 \cdot 1{,}0 \cdot 5 \cdot 12\,461 = 230{,}5\ \text{kN} \qquad \text{[Ec. 17.7.2.2.1b]}$$

$\psi_{ed,V} = 0{,}7 + 0{,}3 \cdot 400/806 = 0{,}849$ [Ec. 17.7.2.4.1b]; $\psi_{c,V} = 1{,}0$ [Tabla
17.7.2.5.1] (S3); $\psi_{h,V} = 1{,}0$ porque $h_a \ge 1{,}5c_{a1}$ [§17.7.2.6.1].

$$V_{cb,sl} = \frac{A_{Vc}}{A_{Vco}}\,\psi_{ed,V}\,\psi_{c,V}\,\psi_{h,V}\,V_b = 0{,}713 \cdot 0{,}849 \cdot 230{,}5 = 139{,}5\ \text{kN}$$

→ $\phi V_{cb,sl} = 0{,}65 \cdot 139{,}5 = 90{,}7$ kN, uso **0,88** ✓ — **gobierna**.

## 5. Restricciones geométricas de la llave sobre los pernos

$h_{sl} = 90$ mm; $c_{sl} = 175$ mm (eje de pernos traccionados al eje de la llave).  [ACI §17.11.1.1.8]

$$h_{ef} \ge 2{,}5\,h_{sl} = 225\ \text{mm} \qquad h_{ef} \ge 2{,}5\,c_{sl} = 438\ \text{mm}\ \ (\text{gobierna})$$

→ **$h_{ef} = 450$ mm**: los pernos de 400 mm del caso sin llave no alcanzan.

## 6. La llave tracciona los pernos

El par entre la reacción de aplastamiento y el corte va a los anclajes.  [ACI §17.11.1.1.9 · DG1 Ej. 4.7-5]

$$e = t_{grout} + \tfrac{h_{ef,sl}}{2} = 40 + 25 = 65\ \text{mm} \qquad M_u = V_u\,e = 80 \cdot 0{,}065 = 5{,}2\ \text{kN}\cdot\text{m}$$

Con $P_u = 0$ y $f_{p,\text{máx}} = \phi_c\,1{,}7f'_c = 27{,}6$ MPa ($\sqrt{A_2/A_1} = 2{,}44$ satura en 2),
$q_{\text{máx}} = 27{,}6 \cdot 450 = 12{,}43$ kN/mm  [DG1 §4.3.6]:

$$Y = \left(f + \tfrac{N}{2}\right) - \sqrt{\left(f + \tfrac{N}{2}\right)^2 - \frac{2M_u}{q_{\text{máx}}}} = 400 - \sqrt{160\,000 - 837} = 1{,}05\ \text{mm}$$

$$T_u = q_{\text{máx}}\,Y = 12{,}43 \cdot 1{,}05 = 13{,}0\ \text{kN} \;\Rightarrow\; 6{,}5\ \text{kN/perno}$$

→ **sin momento aplicado, los pernos igual quedan traccionados**.

## 7. La llave como placa de acero

Voladizo de brazo $e = 65$ mm desde la placa.  [AISC 360-22 §J4.5 · F11.1]

$$Z = \frac{b_{sl}\,t_{sl}^2}{4} = \frac{300 \cdot 625}{4} = 46\,875\ \text{mm}^3 \qquad \phi M_n = 0{,}90\,F_y Z = 10{,}5\ \text{kN}\cdot\text{m}$$

→ contra $M_u = 5{,}2$ kN·m, uso **0,49** ✓.

## Resumen

| Verificación | Ref. | Demanda | Capacidad | Uso | |
|---|---|---:|---:|---:|:--:|
| Aplastamiento de la llave | ACI §17.11.2 | 80 kN | 414 kN | 0,19 | ✓ |
| **Breakout de la llave** | ACI §17.11.3 | 80 kN | 90,7 kN | **0,88** | ✓ |
| Flexión de la llave | AISC §J4.5 | 5,2 kN·m | 10,5 kN·m | 0,49 | ✓ |
| Embebido mínimo del perno | ACI §17.11.1.1.8 | 438 mm | 450 mm | 0,97 | ✓ |
| Perno a tracción | AISC §J3 | 6,5 kN | 114 kN | 0,06 | ✓ |
| Pernos a corte | ACI §17.11.1.1.2 | — | — | — | no se verifica |

## Veredicto

Cierra. Gobierna el breakout de la llave (0,88), seis veces más exigente que el aplastamiento sobre
la misma llave. Lo fija el pedestal vía $c_{a1}$, no la llave: profundizarla no aporta nada
—$A_{ef,sl}$ y $h_{ef,sl}$ topean en $2t_{sl}$— y ensancharla tampoco, porque $A_{Vc}$ ya está
cortado por las caras del pedestal. Las palancas son $t_{sl}$ y el pedestal. Detalle obligatorio:
agujero de inspección de 25 mm a cada lado largo de la llave [§17.11.1.2].

## Referencias

| Clave | Norma y edición | Cláusula | Leída en PDF |
|---|---|---|---|
| ACI | ACI 318-25 (SI) | §17.11.1 a §17.11.3; §17.7.2.1 a §17.7.2.5 | 2026-08-07 |
| AISC | ANSI/AISC 360-22 | §J4.5 | 2026-08-07 |
| AISC-F | ANSI/AISC 360-22 | §F11.1 — $M_n = F_y Z$ de la llave | ⚠ pendiente |
| DG1 | AISC Design Guide 1, 3.ª ed. | §4.3.6; Ej. 4.7-5 | 2026-08-07 |

## Para promover a post

- Por leer: AISC 360-22 §F11.1. §J4.5 nombra la fluencia por flexión pero **no imprime la
  ecuación**; $M_n = F_y Z$ se tomó del uso que le da la DG1 en su Ej. 4.7-5.
- Tesis candidata: la llave que se dibuja no es la que trabaja — solo $2t_{sl}$ resiste, y el par
  que ella misma genera tracciona pernos que no tenían momento aplicado.
- Figuras: $A_{ef,sl}$ y $A_{Vc}$ de la llave contra los del grupo de pernos, a la misma escala.
