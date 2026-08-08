---
titulo: Diagonal de paño en V invertida — NCh2369 §8.6
disciplina: acero
tema: Arriostramientos
normas: [NCh2369:2025, AISC 360-22]
fecha: 2026-08-08
estado: verificado
veredicto: Cierra con HSS 125×125×6 (uso 0,67), pero el perfil lo elige la Tabla 9, no la resistencia — el 5 mm pasaba resistencia (0,79) y falla b/t (22 > 18,9), porque el R_y nacional endurece el límite. Eximirse por 0,7R₁ costaría 2,2 veces el acero.
post:
---

# Diagonal de paño en V invertida — NCh2369 §8.6

Diagonal comprimida de un marco arriostrado concéntrico: requisitos de ductilidad de §8.6.3
(esbeltez y Tabla 9) y compresión por AISC 360-22 §E3.

## Caso

| Dato | Valor |
|---|---|
| Paño | 6 m de ancho × 4 m de altura, V invertida; diagonales de 5 m |
| Sistema | MAC industrial, Categoría II, $R_1 = 5$ |
| Corte sísmico de la línea (4.5) | $V_u = 294$ kN en el nivel |
| Diagonal candidata | HSS 125×125×5, conformado en frío, A36 ($F_y = 250$ MPa) |
| Material esperado | $R_y = 1{,}3$ (C8.3.3, A36 nacional) |

## Supuestos

1. **S1** — Todo en SI (N, mm, MPa); propiedades HSS con esquinas rectas (aprox. de catálogo).
2. **S2** — El corte se reparte por equilibrio entre las dos diagonales del paño: una en tracción y una en compresión, $\cos\theta = 0{,}6$.
3. **S3** — $K = 1{,}0$ y $L = 5$ m entre puntos de trabajo, en ambas direcciones.
4. **S4** — Categoría II: las alternativas por cargas amplificadas están permitidas (§8.3.5).
5. **S5** — $b = B - 3t$ para la pared del HSS (AISC 360-22 §B4.1b(d), gotcha registrado en el repo).

## 1. Axial por diagonal y mínimo de tracción

Equilibrio del paño.  [NCh2369 §8.6.2]  (S2)

$$P_u = \frac{V_u}{2\cos\theta} = \frac{294}{2 \cdot 0{,}6} = 245\ \text{kN}$$

→ la diagonal traccionada toma el 50 % del corte por sentido $\ge$ 30 % ✓.

## 2. Esbeltez global

Límite de §8.6.3, con $r = 49{,}0$ mm del HSS 125×5.  [NCh2369 §8.6.3]  (S1, S3)

$$\frac{KL}{r} = \frac{5\,000}{49{,}0} = 102{,}0 \le 1{,}5\pi\sqrt{E/F_y} = 1{,}5\pi\sqrt{800} = 133{,}3$$

→ ✓, y con holgura: la esbeltez no es el problema.

## 3. Ancho/espesor — la Tabla 9 con $R_y$

Pared de HSS conformado en frío usado como arriostramiento.  [NCh2369 §8.6.3 · Tabla 9]  (S5)

$$\lambda_{md} = 0{,}76\sqrt{\frac{E}{R_y F_y}} = 0{,}76\sqrt{\frac{200\,000}{325}} = 18{,}85 \qquad \left(\text{sin } R_y\text{: } 21{,}50\right)$$

$$\frac{b}{t} = \frac{125 - 3 \cdot 5}{5} = 22{,}0 > 18{,}85 \qquad \frac{125 - 3 \cdot 6}{6} = 17{,}83 \le 18{,}85$$

→ el 5 mm falla ✗ **por el $R_y$** (con 21,50 pasaba); el 6 mm cumple ✓. Se adopta **HSS 125×125×6**.

## 4. Compresión

HSS 125×6: $A = 2\,856$ mm², $r = 48{,}6$ mm, $KL/r = 102{,}8$.  [AISC 360-22 §E3]  (S1, S3)

$$F_e = \frac{\pi^2 E}{(L_c/r)^2} = \frac{\pi^2 \cdot 200\,000}{102{,}8^2} = 186{,}8\ \text{MPa} \qquad \frac{F_y}{F_e} = 1{,}34 \le 2{,}25$$

$$F_n = 0{,}658^{F_y/F_e}\,F_y = 0{,}658^{1{,}34} \cdot 250 = 142{,}8\ \text{MPa} \qquad \text{[Ec. E3-2]}$$

$$\phi_c P_n = 0{,}9 \cdot 142{,}8 \cdot 2\,856 = 367{,}0\ \text{kN} \qquad \frac{245}{367{,}0} = 0{,}67 \;✓$$

→ el 5 mm descartado daba $\phi_c P_n = 311{,}2$ kN, uso 0,79 ✓: **la resistencia no lo descartaba**.

## 5. Qué costaría eximirse

§8.6.3 exime de esbeltez y Tabla 9 a la diagonal diseñada con el sísmico ×$0{,}7R_1$.  [NCh2369 §8.6.3]  (S4)

$$P_u^{amp} = 245 \cdot 0{,}7 \cdot 5 = 857{,}5\ \text{kN}$$

→ pide un HSS 200×200×8 ($\phi_c P_n = 1\,114{,}6$ kN, uso 0,77): $A = 6\,144$ mm² contra
2 856 — **2,15 veces el acero**.

## Resumen

| Verificación | Ref. | Demanda | Capacidad | Uso | |
|---|---|---:|---:|---:|:--:|
| Tracción mínima por sentido | NCh §8.6.2 | 30 % | 50 % | — | ✓ |
| Esbeltez global (125×5) | NCh §8.6.3 | 102,0 | 133,3 | 0,77 | ✓ |
| **b/t pared (125×5)** | NCh Tabla 9 | 22,0 | 18,85 | **1,17** | ✗ |
| b/t pared (125×6) | NCh Tabla 9 | 17,83 | 18,85 | 0,95 | ✓ |
| Compresión (125×6) | AISC §E3 | 245 kN | 367,0 kN | 0,67 | ✓ |
| Compresión eximida (200×8) | NCh §8.6.3 | 857,5 kN | 1 114,6 kN | 0,77 | ✓ |

## Veredicto

Cierra con HSS 125×125×6, y el milímetro extra lo pide la Tabla 9, no el sismo: el 5 mm
sobraba en resistencia y esbeltez, y lo mata el $R_y = 1{,}3$ del denominador. Pagar
resistencia (×3,5 la demanda) más que duplica el acero: la ductilidad es el milímetro más
barato del paño.

## Referencias

| Clave | Norma y edición | Cláusula | Leída en PDF |
|---|---|---|---|
| NCh | NCh2369:2025 | §8.6.2, §8.6.3 (límites y eximición), Tabla 9 (pared HSS como arriostramiento) | 2026-08-08 (rasterizada, pp. impresas 87, 97–98) |
| AISC | ANSI/AISC 360-22 | §E3, Ecs. E3-1 a E3-4 | 2026-08-08 (rasterizada, pp. 16.1-40/41) |
| AISC-b | ANSI/AISC 360-22 | §B4.1b(d) — $b = B - 3t$ | heredada (gotcha registrado en el repo) |

## Para promover a post

- **El post del paño ya existe** (`src/content/acero/ejemplo-chevron-nch2369.mdx`, con Tabla 9
  y esbeltez incluidas): este memo no se promueve entero.
- Lo que el post **no** tiene: la eximición de §8.6.3 y su costo (×2,15 el acero) — candidata
  a ampliación del post o a nota corta, con la figura de la pared $b = B - 3t$ y los dos límites.
- Por leer si se amplía: §B4.1b(d) rasterizado (hoy heredado del gotcha del repo).
