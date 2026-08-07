---
titulo: Placa base con momento — DG1, excentricidad grande
disciplina: acero
tema: Placas base
normas: [AISC Design Guide 1 3.ª ed., AISC 360-22, ACI 318-25]
fecha: 2026-08-07
estado: derivado-de-post
veredicto: No cierra — gobierna el breakout del grupo traccionado (uso 1,02) y su interacción con el corte (1,20); la placa de 25 mm tampoco pasa.
post: src/content/acero/placa-base-ejemplo-trabajado.mdx
---

# Placa base con momento — DG1, excentricidad grande

Bloque rectangular de presiones de la Design Guide 1, cerrado con el anclaje del Cap. 17 de ACI 318.

## Caso

| Dato | Valor |
|---|---|
| Columna | HEB 300 ($d = b_f = 30$ cm) |
| Placa | $B = N = 45$ cm, $t = 2{,}5$ cm, A36 ($F_y = 2530$ kgf/cm²) |
| Pedestal | $80 \times 80$ cm, $f'_c = 250$ kgf/cm², concéntrico |
| Pernos | 4 × 1″ F1554 gr. 36, esquinas a 5 cm de cada borde, $h_{ef} = 40$ cm |
| Cargas | $P_u = 40$ tonf, $M_{ux} = 12$ tonf·m, $V_u = 2$ tonf |

## Supuestos

1. **S1** — Bloque rectangular de presiones a $f_{p,\text{máx}}$ pegado al borde comprimido (DG1 §4.3.7).
2. **S2** — La fila traccionada son 2 pernos a $f = N/2 - 5 = 17{,}5$ cm del centro.
3. **S3** — Ancho completo $B$ en el lado traccionado (Ec. 4-60; la DG1 usa otros dos criterios).
4. **S4** — Cono de arrancamiento limitado por las caras del pedestal.

## 1. Aplastamiento del hormigón

Pedestal concéntrico, $\sqrt{A_2/A_1} = 80/45 = 1{,}78 \le 2$.  [DG1 §4.3.7 · AISC 360-22 J8]

$$f_{p,\text{máx}} = \phi_c \cdot 0{,}85 f'_c \sqrt{A_2/A_1} = 0{,}65 \cdot 0{,}85 \cdot 250 \cdot 1{,}78 = 245{,}6\ \text{kgf/cm}^2$$

→ por unidad de largo, $q_{\text{máx}} = 245{,}6 \cdot 45 = 11\,050$ kgf/cm.

## 2. Régimen de excentricidad

$e = M_u/P_u = 12 \cdot 10^5 / 40\,000 = 30$ cm, muy sobre $N/6 = 7{,}5$ cm: hay despegue.  [DG1 §4.3.7]

$$e_{crit} = \frac{N}{2} - \frac{P_u}{2\,q_{\text{máx}}} = 22{,}5 - \frac{40\,000}{2 \cdot 11\,050} = 20{,}7\ \text{cm}$$

→ $e = 30 > 20{,}7$: **excentricidad grande**, los pernos toman tracción.

## 3. Largo del bloque y tracción de pernos

Momentos respecto de la fila traccionada.  [DG1 §4.3.7]  (S1, S2)

$$Y = \left(f + \tfrac{N}{2}\right) - \sqrt{\left(f + \tfrac{N}{2}\right)^2 - \frac{2 P_u (e + f)}{q_{\text{máx}}}} = 40 - \sqrt{1600 - 344} = 4{,}56\ \text{cm}$$

$$T_u = q_{\text{máx}}\,Y - P_u = 11\,050 \cdot 4{,}56 - 40\,000 = 10\,370\ \text{kgf}$$

→ **5,19 tonf/perno**. Discriminante positivo: la placa alcanza a equilibrar la carga.

## 4. Flexión de la placa

Voladizo $m = (45 - 28{,}5)/2 = 8{,}25$ cm; como $Y < m$, el bloque entero con su brazo.  [DG1 §4.3.7]  (S3)

$$M_{pl} = f_{p,\text{máx}}\,Y\left(m - \tfrac{Y}{2}\right) = 245{,}6 \cdot 4{,}56 \cdot 5{,}97 = 6\,680\ \text{kgf}\cdot\text{cm/cm}$$

$$t_{req} = \sqrt{\frac{4\,M_{pl}}{\phi_b F_y}} = \sqrt{\frac{4 \cdot 6\,680}{0{,}9 \cdot 2530}} = 3{,}43\ \text{cm} > 2{,}5\ \text{cm}$$

→ **la placa de 25 mm no cumple**; la DG1 pide 35 mm. El lado traccionado no gobierna: con
$x = f - 0{,}95d/2 = 3{,}25$ cm y ancho $B$, $M_{pl,T} \approx 750$ kgf·cm/cm ($t = 1{,}15$ cm).

## 5. Pernos

1″ F1554 gr. 36, $A_b = 5{,}07$ cm².  [AISC 360-22 J3]

$$\phi F_{nt} A_b = 0{,}75 \cdot (0{,}75 \cdot 58\ \text{ksi}) \cdot 5{,}07 = 11{,}6\ \text{tonf}$$

→ tracción 5,19/11,6 = **0,45** ✓; corte 0,50/7,0 = **0,07** ✓.

## 6. Anclaje al hormigón

El método clásico termina en el perno; el cono del grupo traccionado no lo pregunta.  [ACI §17.6.2]  (S4)

$$\phi N_{cbg} = 0{,}70\,\frac{A_{Nc}}{A_{Nco}}\,\psi_{ed}\,N_b = 0{,}70 \cdot 0{,}44 \cdot 0{,}81 \cdot 40{,}4 = 10{,}2\ \text{tonf}$$

→ contra 10,37 tonf del grupo: **1,02** ✗. Con el corte, $1{,}02 + 0{,}42 = 1{,}44 > 1{,}2$ ✗
[§17.8]. Falla también con la tracción mayor del modelo elástico (15,63 tonf → 1,53).

## Resumen

| Verificación | Ref. | Demanda | Capacidad | Uso | |
|---|---|---:|---:|---:|:--:|
| Aplastamiento (fijado por S1) | DG1 §4.3.7 · J8 | 245,6 kgf/cm² | 245,6 kgf/cm² | 1,00 | — |
| Flexión de placa, comprimido | DG1 Ec. 4-60 | 6 680 kgf·cm/cm | 3 558 kgf·cm/cm | **1,88** | ✗ |
| Flexión de placa, traccionado | DG1 Ec. 4-60 | 750 kgf·cm/cm | 3 558 kgf·cm/cm | 0,21 | ✓ |
| Perno a tracción | AISC J3 | 5,19 tonf | 11,6 tonf | 0,45 | ✓ |
| Perno a corte | AISC J3 | 0,50 tonf | 7,0 tonf | 0,07 | ✓ |
| **Breakout en tracción (grupo)** | ACI §17.6.2 | 10,37 tonf | 10,2 tonf | **1,02** | ✗ |
| Breakout en corte | ACI §17.7.2 | 2,00 tonf | 4,71 tonf | 0,42 | ✓ |
| **Interacción N–V** | ACI §17.8 | 1,44 | 1,2 | **1,20** | ✗ |

## Veredicto

No cierra. Lo cierran **placa de 35 mm** y **pedestal de 110 × 110 cm**. Subir $h_{ef}$ no sirve:
con el cono limitado por las caras, la palanca es la distancia al borde ($c_a$ de 22,5 a 37,5 cm
baja el breakout a 0,84 y la interacción a 0,90). Alternativas: armadura de anclaje (§17.5.2) o
pernos con placa de anclaje inferior.

## Referencias

| Clave | Norma y edición | Cláusula | Leída en PDF |
|---|---|---|---|
| DG1 | AISC Design Guide 1, 3.ª ed. | §4.3.7, Ecs. 4-27 a 4-60 | heredada del post |
| AISC | ANSI/AISC 360-22 | §J3, §J8 | heredada del post |
| ACI | ACI 318-25 (SI) | §17.6.2, §17.7.2, §17.8 | heredada del post |

## Para promover a post

- Ya está promovido: `src/content/acero/placa-base-ejemplo-trabajado.mdx`.
- Queda como memo de referencia del formato: muestra qué sobrevive cuando a un post de ~2.900
  palabras se le sacan las dos `<Note>`, la figura, la comparación con el modelo elástico y la tesis.
