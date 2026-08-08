---
titulo: La viga 30×60 como viga de marco especial — ACI 18.6 + NCh2369 §9.1.2
disciplina: hormigon
tema: Vigas
normas: [ACI 318-25 (SI), NCh2369:2025]
fecha: 2026-08-08
estado: verificado
veredicto: El corte de diseño sube 42 % (25,6 tonf) sin que llegue carga nueva del análisis — lo fija la propia armadura vía M_pr. V_c se salva por 7 puntos (43 % < 50 %), y los estribos de la rótula los rige el d/4 del confinamiento, no el corte.
post:
---

# La viga 30×60 como viga de marco especial — ACI 18.6 + NCh2369 §9.1.2

Una viga 30×60 dimensionada por flexión y corte, re-verificada con la capa sísmica que a un marco
industrial chileno le corresponde por defecto.

## Caso

| Dato | Valor |
|---|---|
| Sección | $b = 30$, $h = 60$, $d = 54$ cm |
| Materiales | $f'_c = 250$ kgf/cm², $f_y = 4\,200$ kgf/cm² (G420) |
| Armadura en caras del nudo | $A_s^- = 3\phi25 = 14{,}73$ cm²; $A_s^+ = 2\phi25 = 9{,}82$ cm², continuas |
| Marco | Luz libre $l_n = 5{,}7$ m; gravitacional concurrente $w_u = 5{,}1$ tonf/m |
| Referencia gravitacional | El diseño por gravedad cerró con $V_u = 18$ tonf |

## Supuestos

1. **S1** — kgf/cm y tonf; $P_u \approx 0$ en la viga.
2. **S2** — La viga pasa de apoyada a viga de marco: armadura de las caras del nudo declarada arriba, con el positivo como armadura inferior continua.
3. **S3** — $w_u = 1{,}2D + L$ como gravitacional concurrente con el sismo (combinaciones 4.5).
4. **S4** — Marco de Categoría II sin muros que tomen ≥ 75 % del corte: no aplican 9.1.4–9.1.5.

## 1. La regla base chilena

Los marcos a momento sísmicos se dimensionan y detallan como **especiales**; el escape a
intermedio cuesta 0,7$R_1$ o deriva ≤ 50 % del límite.  [NCh2369 §9.1.2 · §9.1.3]  (S4)

→ sin pagar el escape, esta viga «típica» debe cumplir ACI §18.6 completo.

## 2. Armadura longitudinal mínima sísmica

Dos barras continuas arriba y abajo; $\rho \le 0{,}025$; $M_n^+ \ge M_n^-/2$ en la cara y
$\ge M_{n,\text{máx}}/4$ en toda sección.  [ACI §18.6.3.1 · §18.6.3.2]  (S2)

$$\rho = \frac{14{,}73}{30 \cdot 54} = 0{,}0091 \le 0{,}025 \qquad \frac{M_n^+}{M_n^-} = \frac{20{,}9}{30{,}4} = 0{,}69 \ge 0{,}5 \qquad 20{,}9 \ge \frac{30{,}4}{4} \;✓$$

## 3. Los momentos probables

Con $1{,}25 f_y$ — la viga tasada por lo que su acero puede llegar a dar.  [ACI §18.6.5 y R18.6.5]

$$M_{pr}^- = 1{,}25 f_y A_s^-\left(d - \frac{a}{2}\right) = 37{,}1\ \text{tonf}\cdot\text{m} \qquad M_{pr}^+ = 25{,}8\ \text{tonf}\cdot\text{m} \quad (a = 12{,}1 \text{ y } 8{,}1\ \text{cm})$$

## 4. El corte por capacidad

Momentos probables de signo opuesto en las caras más la gravitacional.  [ACI §18.6.5.1]  (S3)

```
   M_pr− = 37,1 ↷)━━━━━━━ w_u = 5,1 tonf/m ━━━━━━━(↶ M_pr+ = 25,8
              V_e = (37,1 + 25,8)/5,7 + 5,1·5,7/2
                  =  11,0 (capacidad) + 14,5 (gravedad) = 25,6 tonf
```

$$V_e = \frac{M_{pr}^- + M_{pr}^+}{l_n} + \frac{w_u\,l_n}{2} = 11{,}0 + 14{,}5 = 25{,}6\ \text{tonf}$$

→ **+42 %** sobre los 18 tonf del diseño gravitacional, sin que ninguna carga nueva llegue del
análisis.

## 5. ¿Se anula V_c?

$V_c = 0$ solo si el corte sísmico es ≥ ½ del total **y** $P_u < A_g f'_c/20$.  [ACI §18.6.5.2]  (S1)

$$\frac{V_{cap}}{V_e} = \frac{11{,}0}{25{,}6} = 0{,}43 < 0{,}5$$

$V_c$ por la Ec. (a) de la Tabla 22.5.5.1, con $N_u \approx 0$, $\lambda = 1$ y $\sqrt{f'_c} = 4{,}95 \le 8{,}3$ MPa [§22.5.3.1]:

$$V_c = 0{,}17\lambda\sqrt{f'_c}\,b_w d = 0{,}17 \cdot \sqrt{24{,}52} \cdot 300 \cdot 540 = 136{,}4\ \text{kN} = 13{,}9\ \text{tonf}$$

→ $V_c$ **cuenta** — se salva por 7 puntos. Estribos por $V_e$:
$V_s = 25{,}6/0{,}75 - 13{,}9 = 20{,}2$ → $s = 17{,}6$ cm con $\phi10$ de 2 ramas.

## 6. El confinamiento rige sobre el corte

Zona de $2h = 120$ cm desde la cara; primer estribo a ≤ 50 mm.  [ACI §18.6.4.1 · §18.6.4.4 · §18.6.4.5]

$$s \le \min\left(\frac{d}{4};\ 150\ \text{mm};\ 6d_b\right) = \min\left(135;\ 150;\ 150\right) = 135\ \text{mm}$$

→ **φ10@130 cerrados con gancho sísmico** en 1,20 m (el corte pedía 176). Fuera de la zona:
corte pide 289 mm, manda $d/2 = 270$ → φ10@250 con ganchos sísmicos.

## Resumen

| Verificación | Ref. | Demanda | Capacidad / límite | Uso | |
|---|---|---:|---:|---:|:--:|
| Cuantía y continuidad | ACI §18.6.3.1 | 0,0091 | 0,025 | 0,36 | ✓ |
| $M_n^+ \ge M_n^-/2$ en el nudo | ACI §18.6.3.2 | 0,69 | ≥ 0,5 | — | ✓ |
| **Corte por capacidad** | ACI §18.6.5.1 | **25,6 tonf** | vs 18 del diseño grav. | ×1,42 | — |
| ¿$V_c = 0$? | ACI §18.6.5.2 | 0,43 | ≥ 0,5 | no aplica | $V_c$ vale |
| Estribos zona de rótula | ACI §18.6.4.4 | 176 mm (corte) | 135 mm (confinam.) | **rige 18.6.4** | φ10@130 |
| Estribos resto | ACI §18.6.4.5 | 289 mm | 270 mm ($d/2$) | rige $d/2$ | φ10@250 |

## Veredicto

La viga que cerraba en gravitacional cambia de estribos y gana reglas de armado sin recibir
una sola carga nueva: el corte lo fija su propia armadura de flexión vía $M_{pr}$ — el quinto
elemento del día dimensionado por algo que el análisis no muestra, y con la misma moraleja
del fusible: **sobrearmar la flexión le sube el corte a su propia viga**. En la rótula ni
siquiera manda el corte: manda el $d/4$ del confinamiento. Y $V_c$ sobrevive por 7 puntos —
en una viga con menos gravedad concurrente, se anula.

## Referencias

| Clave | Norma y edición | Cláusula | Leída en PDF |
|---|---|---|---|
| ACI | ACI 318-25 (SI) | §18.6.3.1–.2; §18.6.4.1, .4, .5; §18.6.5.1–.2 + R18.6.5 | 2026-08-08 (rasterizadas, pp. impresas 328–333) |
| NCh | NCh2369:2025 | §9.1.2, §9.1.3 (+ C9.1.1: DS 60 reemplaza a NCh430) | 2026-08-08 (rasterizada, p. impresa 101) |
| ACI-22 | ACI 318-25 (SI) | Tabla 22.5.5.1, Ec. (a) — $V_c$; §22.5.3.1 (tope de $\sqrt{f'_c}$) | 2026-08-08 (rasterizada, p. impresa 444) |

## Para promover a post

- Tesis candidata: la viga sísmica se diseña dos veces — la segunda vez contra sí misma. Cierra
  el par con `ejemplo-viga-flexion-corte` igual que la BFP cerró con su post.
- Figura: el croquis del paso 4 como SVG (los $M_{pr}$ girando y el diagrama de $V_e$).
- Por profundizar al promover: cortes de barras con las zonas prohibidas de empalme (§18.6.3.3)
  y la viga de marco intermedio (§18.4) como término de comparación del escape 9.1.3.
