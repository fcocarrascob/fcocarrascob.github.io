---
titulo: Rigidez rotacional de la base — DG1 Apéndice C
disciplina: acero
tema: Placas base
normas: [AISC Design Guide 1 3.ª ed., AISC 360-22]
fecha: 2026-08-08
estado: verificado
veredicto: La base declarada empotrada entrega β = 19 430 kN·m/rad al momento del análisis — el 58 % del 4EI/L de su propia columna, antes de restar la fundación (C-1). Y la secante sube con el momento, no baja, porque el bloque a f_máx fija la deformación de la zapata.
post:
---

# Rigidez rotacional de la base — DG1 Apéndice C

La base del memo empotrado como resorte: rigidez secante $\beta_{connection}$ por el método
C.2.1 (cuatro deformaciones), evaluada al momento del análisis y al piso de NCh2369 §8.5.2.

## Caso

| Dato | Valor |
|---|---|
| Columna | HEB 300, $d = 300$ mm; $I_x = 25\,170$ cm⁴ (catálogo) |
| Placa | $B = N = 450$ mm, $t_p = 25$ mm; pernos a $f = 175$ mm |
| Pedestal | $1100 \times 1100 \times 1200$ mm, $f'_c = 25$ MPa |
| Pernos | 4 × 1″ F1554 gr. 36, $A_{rod} = 507$ mm²; 2 en la fila traccionada |
| Aplastamiento | $f_{\text{máx}} = 27{,}6$ MPa, $q_{\text{máx}} = 12{,}43$ kN/mm (serie) |
| Nivel 1 (análisis) | $M_E = 110\ \text{kN}\cdot\text{m}$, $P_u = 250$ kN → $Y = 32{,}2$ mm, $T = 150{,}2$ kN |
| Nivel 2 (piso §8.5.2) | $M_u = 278{,}6\ \text{kN}\cdot\text{m}$, $P_u = 250$ kN → $Y = 71{,}2$ mm, $T = 635{,}0$ kN |

## Supuestos

1. **S1** — $T$ e $Y$ heredados del memo de la base empotrada (bloque DG1 §4.3.7), en los dos niveles.
2. **S2** — $L_{rod} = h_{ef} + t_p = 400 + 25 = 425$ mm (tope de placa a tuerca inferior), sin mortero.
3. **S3** — $d_{footing} = 1\,200$ mm: la altura del pedestal. La zapata y el suelo son $\beta_{footing}$, fuera del alcance (Ec. C-1).
4. **S4** — $w_c = 145$ lb/ft³ (hormigón de peso normal).
5. **S5** — $E = E_{rod} = 200\,000$ MPa; $G = 77\,200$ MPa (AISC 360-22 §E4).
6. **S6** — Contraste contra una columna de 6 m: $4EI/L$ con el $I_x$ de catálogo.

## 1. Régimen de excentricidad

$e = M_u/P_u$ [Ec. C-2] contra $e_{crit} = 215$ mm heredada [Ec. C-3].  (S1)

$$e = \frac{110 \cdot 10^6}{250\,000} = 440\ \text{mm} \qquad e = \frac{278{,}6 \cdot 10^6}{250\,000} = 1\,114\ \text{mm}$$

→ ambos niveles $\ge e_{crit}$: excentricidad alta, pernos activos — rigen las Ecs. C-4 a C-12.

## 2. Módulos y propiedades de la placa

$E_{concrete}$ se define en ksi con $w_c$ en lb/ft³ [Ec. C-12]; $f'_c = 25/6{,}895 = 3{,}63$ ksi.  (S4)

$$E_{concrete} = w_c^{1{,}5}\sqrt{f'_c} = 145^{1{,}5}\sqrt{3{,}63} = 3\,325\ \text{ksi} = 22\,924\ \text{MPa}$$

$$I_{plate} = \frac{B\,t_p^3}{12} = 585\,938\ \text{mm}^4 \qquad A_{plate}^{shear} = \frac{5}{6}B\,t_p = 9\,375\ \text{mm}^2 \quad \text{[Ec. C-9]}$$

→ voladizos: $m = (450 - 0{,}95 \cdot 300)/2 = 82{,}5$ mm; $L_{tension} = f - d/2 = 25$ mm [Ec. C-8].

## 3. Alargamiento del perno

Fila completa: $T = 150{,}2$ kN sobre $2 A_{rod}$.  [Ec. C-6]  (S2)

$$\Delta_{rod} = \frac{T\,L_{rod}}{A_{rod}\,E_{rod}} = \frac{150\,200 \cdot 425}{2 \cdot 507 \cdot 200\,000} = 0{,}315\ \text{mm}$$

## 4. Flexión de la placa, lado traccionado

Voladizo corto ($L_{tension} = 25$ mm): flexión más corte.  [Ec. C-7]

$$\Delta_{plate}^{tension} = \frac{T\,L_{tension}^3}{3\,E\,I_{plate}} + \frac{T\,L_{tension}}{A_{plate}^{shear}\,G} = 0{,}007 + 0{,}005 = 0{,}012\ \text{mm}$$

## 5. Flexión de la placa, lado comprimido

$Y = 32{,}2 < m = 82{,}5$: rige la rama con el bloque parcial.  [Ec. C-11]

$$\Delta_{plate}^{compression} = \frac{f_{\text{máx}}B}{8EI_{plate}}\left[m^4 - \frac{(m-Y)^3(3m+Y)}{3}\right] + \frac{f_{\text{máx}}BY}{A_{plate}^{shear}G}\left(m - \frac{Y}{2}\right)$$

$$= 0{,}457 + 0{,}037 = 0{,}493\ \text{mm}$$

## 6. Aplastamiento bajo la placa

$f_{\text{máx}}$ del bloque, a lo largo del pedestal.  [Ec. C-12]  (S3)

$$\Delta_{footing} = \frac{f_{\text{máx}}\,d_{footing}}{E_{concrete}} = \frac{27{,}6 \cdot 1\,200}{22\,924} = 1{,}445\ \text{mm}$$

→ el término mayor, y **no depende del momento**: el bloque está a $f_{\text{máx}}$ en los dos niveles.

## 7. Rotación y rigidez secante

Suma de deformaciones sobre el brazo $f + N/2 = 400$ mm.  [Ecs. C-5, C-4]

$$\theta = \frac{0{,}315 + 0{,}012 + 0{,}493 + 1{,}445}{400} = 5{,}66 \cdot 10^{-3}\ \text{rad}$$

$$\beta_{connection} = \frac{M_u}{\theta} = \frac{110 \cdot 10^6}{5{,}66 \cdot 10^{-3}} = 19\,430\ \text{kN}\cdot\text{m/rad}$$

## 8. La secante en el piso de §8.5.2

Mismas ecuaciones con $Y = 71{,}2$, $T = 635{,}0$ kN: $\Delta_{rod} = 1{,}331$;
$\Delta_{plate}^{tension} = 0{,}050$; $\Delta_{plate}^{compression} = 0{,}669$; $\Delta_{footing} = 1{,}445$ mm.

$$\theta = \frac{3{,}495}{400} = 8{,}74 \cdot 10^{-3}\ \text{rad} \qquad \beta_{connection} = \frac{278{,}6 \cdot 10^6}{8{,}74 \cdot 10^{-3}} = 31\,890\ \text{kN}\cdot\text{m/rad}$$

→ el momento sube ×2,5 y la rotación solo ×1,5: la secante **sube** ×1,6, arrastrada por el
$\Delta_{footing}$ constante del paso 6.

## 9. El contraste: la rigidez de la propia columna

$$\frac{4EI}{L} = \frac{4 \cdot 200\,000 \cdot 2{,}517 \cdot 10^8}{6\,000} = 33\,560\ \text{kN}\cdot\text{m/rad} \quad (S6)$$

$$\frac{\beta_{connection}}{4EI/L} = \frac{19\,430}{33\,560} = 0{,}58$$

→ y en el piso de §8.5.2, $31\,890/33\,560 = 0{,}95$.

## Resumen

| Magnitud | Ref. | $M_E = 110$ | Piso $278{,}6$ |
|---|---|---:|---:|
| $\Delta_{rod}$ | Ec. C-6 | 0,315 mm | 1,331 mm |
| $\Delta_{plate}^{tension}$ | Ec. C-7 | 0,012 mm | 0,050 mm |
| $\Delta_{plate}^{compression}$ | Ec. C-11 | 0,493 mm | 0,669 mm |
| $\Delta_{footing}$ | Ec. C-12 | 1,445 mm | 1,445 mm |
| $\theta$ | Ec. C-5 | 5,66 mrad | 8,74 mrad |
| $\beta_{connection}$ | Ec. C-4 | 19 430 kN·m/rad | 31 890 kN·m/rad |
| $\beta / (4EI/L)$ | — | **0,58** | 0,95 |

## Veredicto

La base que el análisis declaró empotrada entrega, al momento con que la modeló, el 58 % de la
rigidez flexural de su propia columna — empotramiento parcial, y todavía sin restar
$\beta_{footing}$, que entra en serie (Ec. C-1) y solo puede bajarla. El «sincerar la rigidez»
del memo anterior tiene número: un resorte de ~19 400 kN·m/rad. Ojo de método: la secante del
Apéndice C no se ablanda con el momento — sube—, porque el bloque rectangular a $f_{\text{máx}}$
hace a $\Delta_{footing}$, el término dominante, independiente de $M_u$.

## Referencias

| Clave | Norma y edición | Cláusula | Leída en PDF |
|---|---|---|---|
| DG1-C | AISC Design Guide 1, 3.ª ed. | Ap. C §C.1–C.2.1, Ecs. C-1 a C-12 | 2026-08-08 (rasterizada, pp. impresas 189–192) |
| DG1 | AISC Design Guide 1, 3.ª ed. | §4.3.7 — bloque: $e_{crit}$, $Y$, $T$ | heredada del memo de la base empotrada (2026-08-08) |
| AISC | ANSI/AISC 360-22 | §E4 — $G = 77\,200$ MPa | 2026-08-08 (capa de texto: es definición, no ecuación) |

## Para promover a post

- Tesis candidata: «empotrada» es una promesa medible, y esta base cumple el 58 % — el puente
  exacto entre el post «ni empotrada ni rotulada» (fenómeno) y el memo del piso §8.5.2 (castigo).
- Falta el otro resorte: $\beta_{footing}$ con la zapata B = 3,1 m de la serie (Ec. C-1 +
  NCh2369 Cap. 10 o Das) — memo de geotecnia propio.
- Figura: las cuatro deformaciones de la Fig. C-2 sobre la base de la serie, apiladas por tamaño.
- Sensibilidad que el post debería correr: $\beta$ con la placa de 35 mm que la DG1 pedía, y con
  $L_{rod}$ largo (pernos con silla).
