---
titulo: Llave de corte sísmica en placa base — NCh2369 §8.5.3 y ACI 318-25 §17.11
disciplina: acero
tema: Placas base
normas: [NCh2369:2025, ACI 318-25 (SI), AISC 360-22, AISC Design Guide 1 3.ª ed.]
fecha: 2026-08-08
estado: verificado
veredicto: No cierra — el breakout de la llave queda en 1,08. El sismo amplifica la demanda ×1,4 y §8.5.4 prohíbe los 65 kN de roce que la DG1 acreditaría. Cierra con pedestal de 1300 (0,84).
post:
---

# Llave de corte sísmica en placa base — NCh2369 §8.5.3 y ACI 318-25 §17.11

La llave del memo de viento (`placa-base-llave-de-corte.md`), ahora con corte sísmico según
NCh2369:2025. Estados límite de hormigón por ACI §17.11; la llave como placa por AISC 360-22.

## Caso

| Dato | Valor |
|---|---|
| Columna / placa | HEB 300; placa $450 \times 450 \times 25$ mm, A36 ($F_y = 250$ MPa) |
| Pedestal | $1100 \times 1100$ mm, alto $h_a = 1200$ mm, $f'_c = 25$ MPa |
| Grout | $t_{grout} = 40$ mm |
| Pernos | 4 × 1″ F1554 gr. 36, patrón cuadrado $s = 350$ mm; $h_{ef} = 450$ mm |
| Llave | plancha $b_{sl} = 300$ mm, $t_{sl} = 25$ mm, 90 mm bajo la placa (40 grout + 50 embebidos) |
| Cargas (análisis) | $V_E = 70$ kN de sismo; $P_u = 250$ kN de compresión concurrente |
| Factor efectivo | $R_1 = 2{,}0$ |

## Supuestos

1. **S1** — Todo en SI (N, mm, MPa): la edición SI trae otros coeficientes que la de pulgadas ($V_b$: 3,7 y no 9).
2. **S2** — $R_1 = 2{,}0$ es dato del análisis global, ya resuelto por la Ec. (14) de §5.14.
3. **S3** — $V_E$ y $P_u$ salen de la combinación LRFD de 4.5; $P_u = 250$ kN es la compresión **mínima** concurrente con $V_E$.
4. **S4** — Pernos no soldados a la placa: no aplica §17.11.1.1.3.
5. **S5** — Hormigón fisurado sin armadura suplementaria ($\psi_{c,V} = 1{,}0$); el cono se desarrolla en el pedestal.
6. **S6** — Geometría idéntica al memo de viento: se reusan sus $A_{ef,sl}$, $A_{Vc}$, $A_{Vco}$ y $V_b$, leídos en PDF el 2026-08-07.

## 1. El corte de diseño se amplifica

La llave transmite **el total** del corte, con el estado sísmico horizontal amplificado por
$0{,}7R_1 \ge 1{,}0$.  [NCh2369 §8.5.3]  (S2, S3)

$$V_u = 0{,}7\,R_1\,V_E = 1{,}4 \cdot 70 = 98{,}0\ \text{kN}$$

→ 22 % más que los 80 kN del caso de viento.

## 2. El roce que la DG1 acreditaría vale cero

La DG1 permite resistir corte por roce placa-hormigón con la compresión concurrente.  [DG1 §4.3.5, Ec. 4-30]  (S3)

$$\phi V_n = \phi_{friction}\,\mu\,P_u = 0{,}65 \cdot 0{,}4 \cdot 250 = 65{,}0\ \text{kN}$$

NCh2369 lo prohíbe: ni mortero de nivelación ni roce — retracción, pérdida de pretensión y
variación de la carga vertical hacen incierta la normal.  [NCh2369 §8.5.4 · C8.5.4]

→ **dos tercios de $V_u$ que la DG1 descontaría, la llave los toma igual.**

## 3. Las excepciones no aplican

§8.5.3 exime de llave a: (1) apoyos con corte < 75 kN (LRFD) tomándolo con **solo 2 pernos
activos** e interacción corte-tracción de NCh427/1; (2) sistemas de ≥ 9 pernos.  [NCh2369 §8.5.3]

$$V_u = 98{,}0 > 75\ \text{kN} \qquad n = 4 < 9$$

→ la llave es **obligatoria**.

## 4. Aplastamiento de la llave

Con compresión concurrente sube el confinamiento: Ec. 17.11.2.2.1c con $A_{bp} = 450^2 =
202\,500\ \text{mm}^2$; $\phi = 0{,}65$ [§17.11.1.1.4].  (S3)

$$\psi_{brg,sl} = 1 + 4\,\frac{P_u}{A_{bp}\,f'_c} = 1 + \frac{4 \cdot 250\,000}{202\,500 \cdot 25} = 1{,}20 \le 2{,}0$$

$$V_{brg,sl} = 1{,}7\,f'_c\,A_{ef,sl}\,\psi_{brg,sl} = 1{,}7 \cdot 25 \cdot 15\,000 \cdot 1{,}20 = 765{,}0\ \text{kN}$$

→ $\phi V_{brg,sl} = 497$ kN, uso **0,20** ✓ — la compresión ayuda aquí, y solo aquí.

## 5. Breakout de la llave

La geometría no cambió: valen $A_{Vc} = 926\,900\ \text{mm}^2$, $A_{Vco} = 1\,300\,100\
\text{mm}^2$, $V_b = 230{,}5$ kN, $\psi_{ed,V} = 0{,}849$ del memo de viento; la compresión no
entra en este estado límite.  [ACI §17.11.3.1 · §17.7.2]  (S5, S6)

$$V_{cb,sl} = \frac{A_{Vc}}{A_{Vco}}\,\psi_{ed,V}\,\psi_{c,V}\,\psi_{h,V}\,V_b = 0{,}713 \cdot 0{,}849 \cdot 230{,}5 = 139{,}5\ \text{kN}$$

→ $\phi V_{cb,sl} = 0{,}65 \cdot 139{,}5 = 90{,}7$ kN contra $V_u = 98{,}0$: uso **1,08** ✗ — **gobierna y no cierra**.

## 6. Flexión de la llave

Voladizo de brazo $e = t_{grout} + h_{ef,sl}/2 = 65$ mm. Para plancha rectangular $M_n = F_y Z
\le 1{,}5F_y S_x$, y con $Z/S_x = 1{,}5$ el tope se cumple con igualdad.  [AISC §J4.5 · Ec. F11-1]

$$M_u = V_u\,e = 98{,}0 \cdot 0{,}065 = 6{,}37\ \text{kN}\cdot\text{m} \qquad \phi M_n = 0{,}90\,F_y Z = 0{,}90 \cdot 250 \cdot 46\,875 = 10{,}5\ \text{kN}\cdot\text{m}$$

→ uso **0,61** ✓.

## 7. El par de la llave no tracciona los pernos

El momento del par aplastamiento-corte se considera en los anclajes [ACI §17.11.1.1.9], pero con
$P_u = 250$ kN la resultante queda dentro del núcleo central:

$$e = \frac{M_u}{P_u} = \frac{6{,}37}{250} = 25{,}5\ \text{mm} < \frac{N}{6} = 75\ \text{mm}$$

→ $T_u = 0$. Bajo viento ($P_u = 0$) este mecanismo traccionaba 6,5 kN/perno; el sismo castiga
la llave y alivia los pernos.

## Resumen

| Verificación | Ref. | Demanda | Capacidad | Uso | |
|---|---|---:|---:|---:|:--:|
| Excepción sin llave | NCh §8.5.3 | 98,0 kN | < 75 kN y ≥ 9 pernos | — | no aplica |
| Roce placa-hormigón | NCh §8.5.4 | — | ~~65,0 kN~~ → 0 | — | prohibido |
| Aplastamiento de la llave | ACI §17.11.2 | 98,0 kN | 497 kN | 0,20 | ✓ |
| **Breakout de la llave** | ACI §17.11.3 | 98,0 kN | 90,7 kN | **1,08** | ✗ |
| Flexión de la llave | AISC §J4.5/F11 | 6,37 kN·m | 10,5 kN·m | 0,61 | ✓ |
| Perno a tracción por el par | ACI §17.11.1.1.9 | 0 kN | — | 0 | ✓ |

## Veredicto

No cierra: breakout en 1,08. El sismo entra dos veces —amplifica ×1,4 y borra el roce— y la
capacidad no se mueve: la compresión infla el aplastamiento, pero el breakout no la ve. La
palanca es el pedestal vía $c_{a1}$: con $1300 \times 1300$ ($c_{a1} = 637{,}5$ mm),
$\phi V_{cb,sl} = 117$ kN y uso 0,84.

## Referencias

| Clave | Norma y edición | Cláusula | Leída en PDF |
|---|---|---|---|
| NCh | NCh2369:2025 | §8.5.3 (+C8.5.3), §8.5.4 (+C8.5.4); §5.14 Ec. (14) | 2026-08-08 |
| ACI | ACI 318-25 (SI) | §17.11.1.1.2 a §17.11.1.1.9; §17.11.2 Ec. 17.11.2.2.1c; §17.11.3.1 | 2026-08-08 |
| ACI-b | ACI 318-25 (SI) | §17.7.2.1 a §17.7.2.5 — coeficientes del breakout (S6) | 2026-08-07 (memo de viento) |
| DG1 | AISC Design Guide 1, 3.ª ed. | §4.3.5, Ec. 4-30 | 2026-08-08 |
| AISC | ANSI/AISC 360-22 | §J4.5; §F11.1 Ec. F11-1 | 2026-08-08 |

## Para promover a post

- Tesis candidata: el sismo entra dos veces a la misma llave — ×1,4 en demanda y cero roce. La
  que sobraba bajo viento (0,88) no cierra (1,08), y la salida es el pedestal, no la llave.
- Par natural con el memo de viento: mismos datos, dos normas, dos veredictos — un solo post
  comparativo.
- Figuras: demanda 80 → 98 kN contra capacidad fija de 90,7; el cono con $c_{a1}$ de 537,5 vs.
  637,5 mm.
