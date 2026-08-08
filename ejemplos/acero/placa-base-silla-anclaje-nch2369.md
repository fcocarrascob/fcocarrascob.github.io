---
titulo: Silla de anclaje — diseñada para el perno, no para la carga (NCh2369 C8.5.2)
disciplina: acero
tema: Placas base
normas: [NCh2369:2025, AISC 341-22, AISC 360-22]
fecha: 2026-08-08
estado: verificado
veredicto: No cierra — la placa superior que la carga valida (0,63) no resiste la fluencia esperada del perno (1,58) y pide 32 mm. Y el R_y hay que suponerlo — F1554 no está en la Tabla A3.2.
post:
---

# Silla de anclaje — diseñada para el perno, no para la carga (NCh2369 C8.5.2)

La silla del perno dúctil de §8.5.2, verificada para la **capacidad de fluencia esperada del
perno** (C8.5.2), no para la tracción del análisis. Componentes de acero por AISC 360-22.

## Caso

| Dato | Valor |
|---|---|
| Perno | 1″ F1554 gr. 36 ($F_y = 248$ MPa, $A_b = 507$ mm², $d = 25{,}4$ mm) |
| Silla (una por perno) | 2 atiesadores PL $100 \times 10$, $h_s = 250$ mm, separación libre 90 mm |
| Placa superior | PL $180 \times 120 \times 25$, agujero $\varnothing 35$ mm |
| Material / soldadura | A36 ($F_y = 250$ MPa); filetes E70 ($F_{EXX} = 482$ MPa), $w = 6$ mm |
| Tracción del análisis | $T_u = 75$ kN/perno (memo de la base empotrada) |

## Supuestos

1. **S1** — Todo en SI (N, mm, MPa).
2. **S2** — $R_y = 1{,}5$: el F1554 **no está** en la Tabla A3.2 de AISC 341-22; se usa la fila de barras A36.
3. **S3** — Fluencia del vástago: $T_{ye}$ sobre el área bruta $A_b$.
4. **S4** — Placa superior: viga simplemente apoyada entre ejes de atiesadores, carga puntual, ancho descontando el agujero.
5. **S5** — Atiesadores soldados arriba y abajo: $L_c = 0{,}65\,h_s$; pandeo por flexión (E3).
6. **S6** — Los filetes transmiten $T_{ye}$ íntegra ($k_{ds} = 1{,}0$), sin acreditar el contacto.
7. **S7** — Pedestal y hormigón bajo la silla van por la cláusula 9: fuera de alcance.

## 1. La demanda es el perno, no la carga

Silla, atiesadores y pedestal se diseñan para la **capacidad de fluencia esperada del perno**.
[NCh2369 C8.5.2 · AISC 341-22 Tabla A3.2]  (S2, S3)

$$T_{ye} = R_y\,F_y\,A_b = 1{,}5 \cdot 248 \cdot 507 = 188{,}6\ \text{kN}$$

→ **2,5 veces** los 75 kN que el análisis le pedía al perno.

## 2. Geometría del perno dúctil

Largo expuesto $\ge$ máx(250 mm; $8d$) e hilo $\ge 75$ mm bajo la tuerca.  [NCh2369 §8.5.2 · Anexo A, Fig. A.1]

$$h_s = 250 \ge \max\left(250;\ 8 \cdot 25{,}4 = 203\right)\ \text{mm}$$

→ la silla de 250 mm cumple **justo**; con perno de 1¼″ ya no ($8d = 254$).

## 3. Placa superior a flexión

Luz entre ejes $L = 90 + 10 = 100$ mm; $b_{ef} = 120 - 35 = 85$ mm; $Z = 85 \cdot 25^2/4 =
13\,281$ mm³ ($Z/S = 1{,}5$: tope de F11-1 en igualdad).  [AISC §J4.5 · Ec. F11-1]  (S4)

$$M_u = \frac{T_{ye}\,L}{4} = \frac{188{,}6 \cdot 100}{4} = 4{,}72\ \text{kN}\cdot\text{m} \qquad \phi M_n = 0{,}90\,F_y Z = 2{,}99\ \text{kN}\cdot\text{m}$$

→ uso **1,58** ✗ — pide $t = 32$ mm ($t_{req} = 31{,}4$).

## 4. La misma placa bajo la carga del análisis

$$M_u = \frac{75 \cdot 100}{4} = 1{,}88\ \text{kN}\cdot\text{m} \qquad \frac{1{,}88}{2{,}99} = 0{,}63\ ✓$$

→ la silla que la carga valida, su propio perno la rompe. Con $R_y = 1{,}3$ tampoco se salva:
uso 1,37.

## 5. Atiesadores a compresión

Cada uno toma $T_{ye}/2 = 94{,}3$ kN. $L_c/r = 0{,}65 \cdot 250/2{,}89 = 56{,}3 > 25$ → rige el
Cap. E [J4.4(b)]; $F_e = \pi^2 E/(L_c/r)^2 = 623$ MPa [Ec. E3-4]; $F_y/F_e = 0{,}40 \le 2{,}25$.  (S5)

$$F_n = 0{,}658^{F_y/F_e}\,F_y = 0{,}658^{0{,}40} \cdot 250 = 211\ \text{MPa} \qquad \text{[Ec. E3-2]}$$

$$\phi_c P_n = 0{,}90 \cdot 211 \cdot 1\,000 = 190{,}2\ \text{kN}$$

→ uso **0,50** ✓.

## 6. Filete atiesador–placa base

Cuatro cordones de 100 mm, $w = 6$ mm: $A_{we} = 0{,}707 \cdot 6 \cdot 400 = 1\,697$ mm².
[Ec. J2-4 · Tabla J2.5]  (S6)

$$\phi R_n = 0{,}75 \cdot 0{,}60\,F_{EXX}\,A_{we} = 0{,}75 \cdot 289{,}2 \cdot 1\,697 = 368{,}1\ \text{kN}$$

→ uso $188{,}6/368{,}1 =$ **0,51** ✓.

## Resumen

| Verificación | Ref. | Demanda | Capacidad | Uso | |
|---|---|---:|---:|---:|:--:|
| Demanda de la silla | NCh C8.5.2 | 75 kN (análisis) | → $T_{ye} = 188{,}6$ kN | ×2,5 | manda $T_{ye}$ |
| Largo expuesto / hilo | NCh §8.5.2 | 250 / 75 mm | 250 / 75 mm | 1,00 | ✓ justo |
| **Placa superior ($T_{ye}$)** | AISC F11-1 | 4,72 kN·m | 2,99 kN·m | **1,58** | ✗ |
| Placa superior (análisis) | AISC F11-1 | 1,88 kN·m | 2,99 kN·m | 0,63 | ✓ |
| Atiesador a compresión | AISC E3 | 94,3 kN | 190,2 kN | 0,50 | ✓ |
| Filete a corte | AISC J2-4 | 188,6 kN | 368,1 kN | 0,51 | ✓ |

## Veredicto

No cierra: la placa superior validada por la carga (0,63) falla bajo su propio perno (1,58) y
pide 32 mm; atiesadores y filetes sobran (0,50 / 0,51). Y la demanda misma es un supuesto: el
F1554 no está en la Tabla A3.2, y con $R_y$ 1,5 o 1,3 la placa de 25 falla igual.

## Referencias

| Clave | Norma y edición | Cláusula | Leída en PDF |
|---|---|---|---|
| NCh | NCh2369:2025 | §8.5.2 + C8.5.2; Anexo A (informativo), Figura A.1 | 2026-08-08 |
| AISC341 | ANSI/AISC 341-22 | §A3.2 y Tabla A3.2 — $R_y$; F1554 no listado | 2026-08-08 |
| AISC-E | ANSI/AISC 360-22 | §E1 ($\phi_c$); §E3, Ecs. E3-1, E3-2, E3-4 | 2026-08-08 |
| AISC-J | ANSI/AISC 360-22 | §J2.4 Ec. J2-4 + Tabla J2.5; §J4.4, §J4.5; §F11.1 Ec. F11-1 | 2026-08-08 |

## Para promover a post

- Tesis candidata: el perno es lo único que se diseña para la carga; todo lo que lo rodea se
  diseña para el perno. Es el lado acero del pedestal ya publicado en Hormigón — las dos caras
  del mismo fusible.
- Hallazgo normativo propio: la Tabla A3.2 no trae F1554 — el $R_y$ del elemento más importante
  del mecanismo chileno hay que suponerlo.
- Figura: el flujo de fuerzas tuerca → placa superior → atiesadores → placa base, con la
  Figura A.1 al lado.
- Cierra el cuarteto de memos de la misma base y deja servido el post del Cap. 6 de la DG1
  (base fuerte/débil vs. perno-fusible).
