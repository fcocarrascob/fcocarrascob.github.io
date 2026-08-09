---
titulo: La base como resorte — β_connection, β_footing y la serie (DG1 Ap. C)
disciplina: acero
tema: Placas base
normas: [AISC Design Guide 1 3.ª ed., AISC 360-22, NCh2369:2025]
fecha: 2026-08-08
estado: verificado
veredicto: La base declarada empotrada entrega β_base = 18 190 kN·m/rad, el 54 % del 4EI/L de su propia columna. Y reparte la culpa: la fundación es 20 veces más rígida que la conexión, así que el empotramiento parcial vive en los pernos y la placa. Modelar el resorte del suelo y empotrar la conexión es afinar el resorte equivocado.
post:
---

# La base como resorte — β_connection, β_footing y la serie (DG1 Ap. C)

La base del memo empotrado como resorte completo: la conexión por el método C.2.1 (cuatro
deformaciones), la fundación por balasto, y las dos en serie según la Ec. C-1.

## Caso

| Dato | Valor |
|---|---|
| Columna | HEB 300, $d = 300$ mm; $I_x = 25\,170$ cm⁴ (catálogo); 6 m de altura |
| Placa | $B = N = 450$ mm, $t_p = 25$ mm; pernos a $f = 175$ mm |
| Pedestal | $1100 \times 1100 \times 1200$ mm, $f'_c = 25$ MPa |
| Pernos | 4 × 1″ F1554 gr. 36, $A_{rod} = 507$ mm²; 2 en la fila traccionada |
| Aplastamiento | $f_{\text{máx}} = 27{,}6$ MPa, $q_{\text{máx}} = 12{,}43$ kN/mm (serie) |
| Zapata / suelo | $B = L = 3{,}1$ m, **rígida** (Ec. 25); $k_v = 5\,000$ tonf/m³ (informe) |
| Nivel 1 (análisis) | $M_E = 110\ \text{kN}\cdot\text{m}$, $P_u = 250$ kN → $Y = 32{,}2$ mm, $T = 150{,}2$ kN |
| Nivel 2 (piso §8.5.2) | $M_u = 278{,}6\ \text{kN}\cdot\text{m}$, $P_u = 250$ kN → $Y = 71{,}2$ mm, $T = 635{,}0$ kN |

## Supuestos

1. **S1** — $T$ e $Y$ heredados del memo de la base empotrada (bloque DG1 §4.3.7), en los dos niveles.
2. **S2** — $L_{rod} = h_{ef} + t_p = 450 + 25 = 475$ mm (tope de placa a tuerca inferior), sin mortero. La placa de 25 mm es la del cuarteto y **no cumple**: el memo del espesor pide 52 (ver el veredicto).
3. **S3** — $d_{footing} = 1\,200$ mm: la altura del pedestal (Ec. C-12).
4. **S4** — $w_c = 145$ lb/ft³; $E = E_{rod} = 200\,000$ MPa; $G = 77\,200$ MPa (AISC 360-22 §E4).
5. **S5** — Zapata rígida sobre cama de resortes $k_v$ uniforme (contacto plano de §10.1.4), con contacto pleno: $\beta_{footing}$ es **cota superior** — con despegue (86 % apoyado en la sísmica) cae.
6. **S6** — $k_v$ sísmico del informe; el memo de la zapata contra Das mostró que el estático es ~⅓.
7. **S7** — Rotaciones aditivas: la conexión y la fundación giran en serie (Ec. C-1).
8. **S8** — Contraste contra $4EI/L$ de la propia columna de 6 m, con el $I_x$ de catálogo.

## 1. Régimen de excentricidad

$e = M_u/P_u$ [Ec. C-2] contra $e_{crit} = 215$ mm heredada [Ec. C-3].  (S1)

$$e = \frac{110 \cdot 10^6}{250\,000} = 440\ \text{mm} \qquad e = \frac{278{,}6 \cdot 10^6}{250\,000} = 1\,114\ \text{mm}$$

→ ambos niveles $\ge e_{crit}$: excentricidad alta, pernos activos — rigen las Ecs. C-4 a C-12.

## 2. Módulos y propiedades de la placa

$E_{concrete}$ se define en ksi con $w_c$ en lb/ft³ [Ec. C-12]; $f'_c = 25/6{,}895 = 3{,}63$ ksi.  (S4)

$$E_{concrete} = w_c^{1{,}5}\sqrt{f'_c} = 145^{1{,}5}\sqrt{3{,}63} = 3\,325\ \text{ksi} = 22\,924\ \text{MPa}$$

$$I_{plate} = \frac{B\,t_p^3}{12} = 585\,938\ \text{mm}^4 \qquad A_{plate}^{shear} = \frac{5}{6}B\,t_p = 9\,375\ \text{mm}^2 \quad \text{[Ec. C-9]}$$

→ voladizos: $m = (450 - 0{,}95 \cdot 300)/2 = 82{,}5$ mm; $L_{tension} = f - d/2 = 25$ mm [Ec. C-8].

## 3. Las tres deformaciones del acero

Alargamiento del perno sobre la fila completa [Ec. C-6]; placa traccionada, voladizo corto con
flexión más corte [Ec. C-7]; placa comprimida con $Y = 32{,}2 < m$, rama del bloque parcial [Ec. C-11].  (S2)

$$\Delta_{rod} = \frac{T\,L_{rod}}{A_{rod}\,E_{rod}} = \frac{150\,200 \cdot 475}{2 \cdot 507 \cdot 200\,000} = 0{,}352\ \text{mm} \qquad \Delta_{plate}^{tension} = 0{,}007 + 0{,}005 = 0{,}012\ \text{mm}$$

$$\Delta_{plate}^{compression} = \frac{f_{\text{máx}}B}{8EI_{plate}}\left[m^4 - \frac{(m-Y)^3(3m+Y)}{3}\right] + \frac{f_{\text{máx}}BY}{A_{plate}^{shear}G}\left(m - \frac{Y}{2}\right) = 0{,}457 + 0{,}037 = 0{,}493\ \text{mm}$$

## 4. El aplastamiento, que no depende del momento

$f_{\text{máx}}$ del bloque, a lo largo del pedestal.  [Ec. C-12]  (S3)

$$\Delta_{footing} = \frac{f_{\text{máx}}\,d_{footing}}{E_{concrete}} = \frac{27{,}6 \cdot 1\,200}{22\,924} = 1{,}445\ \text{mm}$$

→ el término mayor, y **constante**: el bloque está a $f_{\text{máx}}$ en los dos niveles.

## 5. Rotación y rigidez secante, en los dos niveles

Suma de deformaciones sobre el brazo $f + N/2 = 400$ mm. En el piso de §8.5.2 ($Y = 71{,}2$,
$T = 635{,}0$ kN) los cuatro términos son 1,487 / 0,050 / 0,669 / 1,445 mm.  [Ecs. C-5, C-4]

$$\theta = \frac{2{,}302}{400} = 5{,}76 \cdot 10^{-3} \;\text{rad} \;\to\; \beta = 19\,110 \qquad \theta = \frac{3{,}651}{400} = 9{,}13 \cdot 10^{-3} \;\text{rad} \;\to\; \beta = 30\,520\ \frac{\text{kN}\cdot\text{m}}{\text{rad}}$$

→ el momento sube ×2,5 y la rotación solo ×1,6: la secante **sube** ×1,6, arrastrada por el
$\Delta_{footing}$ constante del paso 4.

## 6. β_footing, derivada por estática

Zapata rígida girada $\theta$ sobre la cama: $q(x) = k_v\,\theta\,x$, y el momento resultante
integra $x^2$ — la inercia del sello. Derivada, no recordada.  (S5, S6, S7)

$$M = \int_A k_v\,\theta\,x^2\,dA = k_v\,\theta\,I \;\Rightarrow\; \beta_{footing} = k_v\frac{B^4}{12} = 5\,000 \cdot \frac{3{,}1^4}{12} = 38\,480\ \frac{\text{tonf}\cdot\text{m}}{\text{rad}} = 377\,360\ \frac{\text{kN}\cdot\text{m}}{\text{rad}}$$

## 7. La serie de la Ec. C-1

Las rotaciones se suman; las rigideces van en serie.  [DG1 Ap. C, Ec. C-1]  (S8)

$$\beta_{base} = \frac{\beta_{connection}\,\beta_{footing}}{\beta_{connection} + \beta_{footing}} = \frac{19\,110 \cdot 377\,360}{19\,110 + 377\,360} = 18\,190\ \frac{\text{kN}\cdot\text{m}}{\text{rad}}$$

```
   columna 4EI/L = 33 560
        ├── β_connection    19 110  ←── el resorte blando (pernos + placa + pedestal)
        └── β_footing      377 360  ←── 20× más rígida (zapata B = 3,1 sobre k_v)
   ═══ en serie ═══  β_base = 18 190 kN·m/rad = 0,54·(4EI/L)
```

→ $4EI/L = 4 \cdot 200\,000 \cdot 2{,}517 \cdot 10^8 / 6\,000 = 33\,560$; el suelo denso descuenta **5 %**.

## 8. Sensibilidad: la arena suelta

Con $k_v = 1\,000$ tonf/m³, $\beta_{footing} = 75\,470$ (S6):

$$\beta_{base} = \frac{19\,110 \cdot 75\,470}{94\,580} = 15\,250\ \frac{\text{kN}\cdot\text{m}}{\text{rad}} \;\Rightarrow\; 0{,}45\,\frac{4EI}{L} \quad \text{— ni así la fundación gobierna.}$$

## Resumen

| Magnitud | Ref. | Valor | $\beta/(4EI/L)$ |
|---|---|---:|---:|
| Las cuatro $\Delta$ (rod / placa T / placa C / footing) | Ecs. C-6, C-7, C-11, C-12 | 0,352 / 0,012 / 0,493 / **1,445** mm | — |
| $\beta_{connection}$ ($M_E = 110$) | Ec. C-4 | 19 110 kN·m/rad | 0,57 |
| $\beta_{connection}$ (piso 278,6) | Ec. C-4 | 30 520 kN·m/rad | 0,91 |
| $\beta_{footing}$ ($k_v = 5\,000$) | estática + S5 | 377 360 kN·m/rad | 11,2 |
| **$\beta_{base}$ (serie C-1)** | Ec. C-1 | **18 190 kN·m/rad** | **0,54** |
| $\beta_{base}$ con arena suelta | sensibilidad | 15 250 kN·m/rad | 0,45 |

## Veredicto

La base declarada empotrada entrega el 54 % de la rigidez flexural de su propia columna, y la serie
reparte la culpa: la fundación es 20 veces más rígida que la conexión, así que el empotramiento
parcial vive en los pernos, la placa y el aplastamiento, no en el suelo. Modelar el resorte del
suelo y empotrar la conexión es afinar el resorte equivocado. Ojo de método: la secante del
Apéndice C no se ablanda con el momento —sube—, porque el bloque a $f_{\text{máx}}$ hace a
$\Delta_{footing}$, el término dominante, independiente de $M_u$.

## Referencias

| Clave | Norma y edición | Cláusula | Leída en PDF |
|---|---|---|---|
| DG1-C | AISC Design Guide 1, 3.ª ed. | Ap. C §C.1–C.2.1, Ecs. C-1 a C-12 | 2026-08-08 (rasterizada, pp. impresas 189–192) |
| DG1 | AISC Design Guide 1, 3.ª ed. | §4.3.7 — bloque: $e_{crit}$, $Y$, $T$ | heredada del memo de la base empotrada (2026-08-08) |
| AISC | ANSI/AISC 360-22 | §E4 — $G = 77\,200$ MPa | 2026-08-08 (capa de texto: es definición, no ecuación) |
| NCh | NCh2369:2025 | §8.5.2 (piso del momento); §10.1.4 — rigidez Ec. (25) y contacto plano | heredadas de los memos de la base empotrada y de la zapata (2026-08-08) |
| — | $\beta_{footing} = k_v B^4/12$ | derivación por estática (paso 7) | no aplica |

## Para promover a post

- Tesis candidata: el resorte equivocado — la base tiene dos resortes en serie y el blando no es el
  que todos modelan. Es el puente entre el post «ni empotrada ni rotulada» y el memo del piso §8.5.2.
- Figura: las cuatro deformaciones de la Fig. C-2 apiladas por tamaño, y los dos resortes en serie.
- Por correr al promover: la curva M–θ con despegue (S5), y $\beta$ con la placa de **52 mm** que el
  memo del espesor exige — con $t_p^3$, $\Delta_{plate}^{compression}$ cae ~7× y $\beta_{base}$ sube ~20 %.
