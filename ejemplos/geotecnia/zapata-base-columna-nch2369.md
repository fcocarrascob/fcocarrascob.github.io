---
titulo: La zapata bajo el pedestal del cuarteto — NCh2369 Cap. 10
disciplina: geotecnia
tema: Zapatas
normas: [NCh2369:2025]
fecha: 2026-08-08
estado: verificado
veredicto: Cierra con B = 3,1 m y la dimensiona el 80 % de área apoyada (0,93), no la presión ni el deslizamiento (0,44). El roce que §8.5.4 tarifa en cero arriba es la única resistencia lateral abajo — y sobra.
post:
---

# La zapata bajo el pedestal del cuarteto — NCh2369 Cap. 10

Zapata aislada bajo el pedestal $1100 \times 1100 \times 1200$ de la serie de memos. Suelo y
verificaciones del Cap. 10 en ASD, sobre el suelo del informe.

## Caso

| Dato | Valor |
|---|---|
| Zapata | $B \times B \times 0{,}60$ m, $D_f = 1{,}80$ m; pedestal $1{,}10 \times 1{,}10 \times 1{,}20$ |
| Suelo | Arena media densa: $\phi' = 30°$, $c' = 0$, $\gamma = 1{,}85$ tonf/m³, $D_R \approx 65\ \%$ |
| Informe | $q_{adm} = 2{,}0$ (estática) / $3{,}0$ (sísmica) kgf/cm²; $k_v = 5\,000$ tonf/m³ |
| Hormigón | $\gamma_c = 2{,}55$ tonf/m³; $E = 2{,}4 \cdot 10^6$ tonf/m² |
| Cargas base columna | $D = 20$, $L = 8$ tonf; $E$: $N = \pm 30$, $V = 10$ tonf, $M = 16\ \text{tonf}\cdot\text{m}$ |

## Supuestos

1. **S1** — tonf y kgf/cm² (ASD), como toda la cadena de la zapata; brazo del corte al sello 1,80 m.
2. **S2** — Combinaciones de 4.5 y $a = 0{,}25$ leídas en PDF; el $L$ de cálculo es la fila «Zarpa» de la Tabla 10.
3. **S3** — Fundación **estándar menor**: la zapata no está en el modelo (misma decisión del cuarteto) → 80 %.
4. **S4** — Fuerzas de inercia de la fundación despreciadas: se hormigona contra terreno natural [§10.1.4].
5. **S5** — Capacidad de soporte con área efectiva e inclinación fuera de alcance; queda para promover.
6. **S6** — Pesos con $B = 3{,}1$: zapata 14,70 + pedestal 3,70 + suelo 18,65 = **37,05 tonf**.

## 1. ¿Es rígida?

Zarpa $L = (3{,}1 - 1{,}1)/2 = 1{,}00$ m; $I = 0{,}6^3/12 = 0{,}018$ m³.  [NCh Ec. (25)]  (S2)

$$L\sqrt[4]{\frac{k_v}{4EI}} = 1{,}00\sqrt[4]{\frac{5\,000}{4 \cdot 2{,}4 \cdot 10^6 \cdot 0{,}018}} = 0{,}41 \le 1$$

→ rígida: tensiones de contacto planas.

## 2. Las tres combinaciones en el sello

$M_{sello} = 0{,}7M_E + 0{,}7V_E \cdot 1{,}80$; el peso $W$ entra completo (S4, S6):

| Combinación | $N$ (tonf) | $V$ (tonf) | $M$ (tonf·m) | $e$ (m) | $e/B$ |
|---|---:|---:|---:|---:|---:|
| $D + L$ | 65,05 | 0 | 0 | 0 | 0 |
| $D + 0{,}75aL + 0{,}7E$ (compresión) | 79,55 | 7,0 | 23,8 | 0,299 | 0,096 |
| $D + 0{,}7E$ (levantamiento) | 36,05 | 7,0 | 23,8 | 0,660 | 0,213 |

→ sin el peso propio y el suelo (37,05 tonf), el levantamiento daría $N = -1{,}0$ tonf: tracción
neta, régimen de fundación anclada (10.1.6).

## 3. Tensiones de contacto

Compresión dentro del núcleo ($e/B = 0{,}096 < 1/6$); levantamiento en despegue triangular.  [NCh §10.1.4]

$$q_{\text{máx}}^{comp} = \frac{79{,}55}{3{,}1^2}\left(1 + \frac{6 \cdot 0{,}299}{3{,}1}\right) = 13{,}1\ \text{tonf/m}^2 = 1{,}31\ \text{kgf/cm}^2 \le 3{,}0$$

→ usos: gravedad **0,34** (0,68/2,0) ✓ · compresión **0,44** ✓ · levantamiento **0,29** (0,87) ✓.

## 4. El 80 % de área apoyada

Estándar menor → apoyada ≥ 80 %; con despegue, área $= 3(1/2 - e/B)$.  [NCh §10.1.4]  (S3)

```
     N' = 36,05 tonf ▼   e = 0,66 m →|
   ●━━━━━━━━┯━━━━━━━━━━━━━━━━━━━━━━━●   sello, B = 3,1 m
            │              ▁▂▃▄▅▆▇  q triangular
   despegue │◄── apoyado 86,1 % ≥ 80 % ──►
    13,9 %
```

$$\frac{e}{B} = 0{,}213 \le 0{,}233 \quad\Rightarrow\quad \text{área} = 3\left(0{,}5 - 0{,}213\right) = 86{,}1\ \% \ge 80\ \%$$

→ uso **0,93** ✓ — **gobierna**. Con $B = 3{,}0$: $e/B = 0{,}235$ → 79,5 % ✗ por medio punto:
el 80 % fija $B$, no la presión.

## 5. Deslizamiento: solo queda el roce

Cohesión no (arena, sin cementación); pasivo prohibido ($D_R = 65 < 70\ \%$).  [NCh §10.1.3, Ecs. (22) y (24)]

$$F_R = N'\tan\phi' = 36{,}05 \cdot \tan 30° = 20{,}8\ \text{tonf} \qquad FS = \frac{20{,}8}{7{,}0} = 2{,}97 \ge 1{,}3$$

→ uso **0,44** ✓ (1,3 = referencia MOP, C10.1.3). El corte que arriba obligó a la llave —§8.5.4
tarifa el roce en cero— abajo lo resiste **solo el roce**, con FS 3.

## 6. No llega a fundación anclada

$N' = 36{,}05 > 0$ en la peor combinación: no aplica 10.1.6 y el cuarteto de anclajes trabaja
contra el pedestal, no contra la zapata. (S6)

## Resumen

| Verificación | Ref. | Demanda | Límite | Uso | |
|---|---|---:|---:|---:|:--:|
| Rigidez | NCh Ec. (25) | 0,41 | 1 | 0,41 | ✓ |
| Tensión gravedad | NCh §10.1.4 | 0,68 kgf/cm² | 2,0 | 0,34 | ✓ |
| Tensión sismo compresión | NCh §10.1.4 | 1,31 kgf/cm² | 3,0 | 0,44 | ✓ |
| **Área apoyada ≥ 80 %** | NCh §10.1.4 | 86,1 % | 80 % | **0,93** | ✓ |
| Deslizamiento | NCh §10.1.3 | FS 2,97 | 1,3 | 0,44 | ✓ |
| ¿Anclada? | NCh §10.1.6 | $N' = 36 > 0$ | — | — | no aplica |

## Veredicto

Cierra con $B = 3{,}1$ m, y la dimensiona **el 80 % de área apoyada** (0,93) — la presión usa
0,44 y el deslizamiento también; $B = 3{,}0$ falla el 80 % por medio punto porcentual. La
moraleja del par con el cuarteto es el roce: la misma incertidumbre que §8.5.4 tarifa en cero
sobre la placa, 10.1.3 la acepta como única resistencia bajo el sello — porque abajo la normal
es peso permanente garantizado, no una compresión que puede no estar.

## Referencias

| Clave | Norma y edición | Cláusula | Leída en PDF |
|---|---|---|---|
| NCh-d | NCh2369:2025 | §10.1.3 + C10.1.3, Ecs. (22) y (24), prohibiciones de cohesión y pasivo | 2026-08-08 |
| NCh-e | NCh2369:2025 | §10.1.4 + C10.1.4: Ec. (25), clases, 80 % ASD, inercia despreciable | 2026-08-08 |
| NCh-f | NCh2369:2025 | §4.5.1 (combinaciones) y Tabla C-2 ($a$) | 2026-08-08 (rasterizada, p. impresa 15) |
| NCh-g | NCh2369:2025 | Tabla 10 — $L$ de cálculo, fila «Zarpa» | 2026-08-08 (rasterizada, p. impresa 124) |

## Para promover a post

- Tesis candidata: el roce, arriba y abajo de la misma columna — §8.5.4 lo prohíbe sobre la
  placa y 10.1.3 lo deja solo bajo el sello. La diferencia es qué tan garantizada está la normal.
- Al promover: rehacer la capacidad de soporte con área efectiva e inclinación (Das 16.9, como
  el post del galpón) — con $\beta = 11°$ no debería gobernar, pero hay que mostrarlo (S5).
- Figura: la columna completa de la serie, de la tuerca al sello, con el roce tachado arriba y
  trabajando abajo.
