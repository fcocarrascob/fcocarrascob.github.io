---
title: "ACI 318-25 Cap. 18 §18.10 — Muros Estructurales Especiales (Sísmicos)"
type: formula
standard_ref: "ACI-318-25"
chapter: "18"
section: "18.10"
variables: [Vn, Mn, Pn, Vu, Mu, Acv, Acw, rho_l, rho_t, f_c, f_yt, alpha_c, lambda, l_w, h_w, delta_u, h_wcs, c, b, Omega_v, omega_v, Ash, rho_s]
units: "SI"
tags: [muros-especiales, sismo, elementos-de-borde, corte-sísmico, hormigón, ACI-318, SFRS]
related:
  - ACI-318-Ch11-Walls.md
  - ACI-318-Ch21-PhiFactors.md
  - ACI-318-Ch22-SectionalStrength.md
created: 2026-05-05
updated: 2026-05-05
---

# ACI 318-25 Cap. 18 §18.10 — Muros Estructurales Especiales (Sísmicos)

## Fuente
ACI CODE-318-25: Capítulo 18, §18.10 (Páginas 346–373)

> **Alcance:** Muros estructurales especiales como parte del sistema resistente a cargas sísmicas (SFRS). Incluye muros acoplados, pilas de muro (wall piers) y vigas de acoplamiento (coupling beams). Para muros ordinarios, ver [Cap. 11](ACI-318-Ch11-Walls.md).

---

## 1. Clasificación de Segmentos de Muro (Tabla R18.10.1)

| $h_w/\ell_w$ | $\ell_w/b_w \leq 2.5$ | $2.5 < \ell_w/b_w \leq 6.0$ | $\ell_w/b_w > 6.0$ |
|---|---|---|---|
| < 2.0 | Muro | Muro | Muro |
| ≥ 2.0 | **Pila de muro** (reqs. columna) | **Pila de muro** (reqs. columna o alternativo) | Muro |

donde $h_w$ = altura libre, $\ell_w$ = longitud horizontal, $b_w$ = ancho del alma.

---

## 2. Refuerzo Distribuido Mínimo (§18.10.2)

### 2.1 Cuantías mínimas (§18.10.2.1)

$$\rho_\ell \geq 0.0025, \quad \rho_t \geq 0.0025$$

**Excepción:** Si $V_u \leq 0.083\lambda\sqrt{f'_c}\,A_{cv}$, se puede reducir $\rho_t$ a los valores de [Cap. 11 Tabla 11.6.1](ACI-318-Ch11-Walls.md).

Espaciado máximo del refuerzo distribuido: **450 mm** en cada dirección.

### 2.2 Dos cortinas de refuerzo (§18.10.2.2)

Se requieren **dos cortinas** de refuerzo si:
$$V_u > 0.17\lambda\sqrt{f'_c}\,A_{cv} \quad \text{o} \quad h_w/\ell_w \geq 2.0$$

### 2.3 Desarrollo y empalme del refuerzo longitudinal (§18.10.2.3)

- Barras longitudinales deben desarrollarse para $f_y$ según §25.4 y §25.5.
- En zonas donde se espera fluencia: desarrollar para **1.25 $f_y$**.
- **Empalmes por traslape prohibidos** en regiones de borde dentro de una altura $h_{sx}$ sobre la sección crítica ($h_{sx} \leq 6$ m) y $\ell_d$ bajo ella.
- Solo empalmes mecánicos (§18.2.7) o soldados (§18.2.8) en esas zonas.

### 2.4 Refuerzo mínimo en extremos de muros esbeltos (§18.10.2.4)

Para muros con $h_w/\ell_w \geq 2.0$, continuos desde base hasta tope, con sección crítica única:

**(a)** Cuantía longitudinal dentro de $0.15\ell_w$ desde el extremo del segmento:
$$\rho_{extremo} \geq \frac{0.5\sqrt{f'_c}}{f_y} \tag{18.10.2.4a}$$

**(b)** Este refuerzo se extiende vertical hacia arriba y abajo de la sección crítica al menos: $\max(\ell_w,\ M_u/3V_u)$.

**(c)** No más del 50% de las barras requeridas por (a) puede terminarse en cualquier sección.

---

## 3. Fuerzas de Diseño — Amplificación del Corte (§18.10.3)

Para muros que no sean pilas de muro ni segmentos horizontales (aplica a paredes verticales continuas):

### 3.1 Amplificación por análisis lineal (§18.10.3.3.2)

$$V_e = V_{uEh} \cdot \Omega_v \cdot \omega_v \tag{18.10.3.3.2}$$

**Tabla 18.10.3.3.3 — Factores $\Omega_v$ y $\omega_v$**

| $h_{wcs}/\ell_w$ | $\Omega_v$ | $\omega_v$ |
|---|---|---|
| ≤ 1.0 | 1.0 | 1.0 |
| 1.0 – 2.0 | interpolación lineal entre 1.0 y 1.5 | 1.0 |
| ≥ 2.0 | **1.5** | $0.8 + 0.09\,h_n^{1/3} \geq 1.0$ |

donde $h_n$ = número de pisos del edificio (plantas sobre la base), $h_{wcs}$ = altura del muro desde la base hasta la sección crítica.

**Alternativa:** $\Omega_v = M_{pr}/M_u$ calculado directamente para la sección crítica.

**Alternativa simplificada:** Si el código de edificación incluye sobreresistencia del SFRS, se permite $\Omega_v\omega_v = \Omega_o$.

---

## 4. Resistencia al Corte (§18.10.4)

### 4.1 Fórmula nominal de corte (§18.10.4.1)

$$V_n = \left(\alpha_c \lambda \sqrt{f'_c} + \rho_t f_{yt}\right) A_{cv} \tag{18.10.4.1}$$

donde:
- $\alpha_c = 0.25$ para $h_w/\ell_w \leq 1.5$
- $\alpha_c = 0.17$ para $h_w/\ell_w \geq 2.0$
- Interpolación lineal para valores intermedios
- $f'_c$ **no excede 85 MPa** en esta fórmula

### 4.2 Relación $h_w/\ell_w$ para segmentos (§18.10.4.2)

Para un segmento de muro, usar el **mayor** entre $h_w/\ell_w$ del muro completo y el del segmento.

### 4.3 Refuerzo bidireccional (§18.10.4.3)

Se requiere refuerzo distribuido en **dos direcciones ortogonales** en el plano del muro.
Si $h_w/\ell_w \leq 2.0$: $\rho_\ell \geq \rho_t$.

### 4.4 Límite máximo de corte nominal (§18.10.4.4)

Para el total de muros que comparten carga lateral:
$$V_{n,total} \leq \alpha_{sh} \cdot 0.66\sqrt{f'_c} \, A_{cv}$$

Para cualquier muro individual:
$$V_n \leq \alpha_{sh} \cdot 0.83\sqrt{f'_c} \, A_{cw}$$

donde $\alpha_{sh}$ considera la mejora por la presencia de ala en compresión:
$$\alpha_{sh} = 0.7 \left(1 + \frac{(b_w + b_{cf})t_{cf}}{A_{cx}}\right)^2 \leq 1.2 \quad (\alpha_{sh} \geq 1.0) \tag{18.10.4.4}$$

Se permite tomar $\alpha_{sh} = 1.0$.

### 4.5 Segmentos horizontales y vigas de acoplamiento (§18.10.4.5)

$$V_n \leq 0.83\sqrt{f'_c} \, A_{cw}$$

---

## 5. Diseño a Flexión y Carga Axial (§18.10.5)

- Se usa el diagrama de interacción completo de §22.4, incluyendo el refuerzo en alas, elementos de borde y alma.
- Se consideran los efectos de aberturas.

**Ancho efectivo de ala (§18.10.5.2):** extensión desde la cara del alma, el menor entre:
- Mitad de la distancia al próximo alma de muro
- 25% de la altura total del muro sobre la sección analizada

---

## 6. Elementos de Borde Especiales (§18.10.6)

### 6.1 ¿Cuándo se requieren? — Método basado en desplazamiento (§18.10.6.2)

Aplica a muros con $h_{wcs}/\ell_w \geq 2.0$, continuos desde la base, con sección crítica única.

**Condición de requerimiento:**
$$\frac{1.5\,\delta_u}{h_{wcs}} \geq \frac{\ell_w}{600\,c} \tag{18.10.6.2a}$$

donde $\delta_u/h_{wcs} \geq 0.005$ (mínimo obligatorio) y $c$ es la mayor profundidad del eje neutro calculada para la combinación más desfavorable.

**Si se requieren, además debe cumplirse uno de:**

**(ii)** Espesor mínimo de la zona en compresión:
$$b \geq \sqrt{c\,\ell_w/40} \tag{18.10.6.2b-ii}$$

**(iii)** Verificación de capacidad de deriva:
$$\frac{\delta_c}{h_{wcs}} \geq \frac{1.5\,\delta_u}{h_{wcs}}$$

donde:
$$\frac{\delta_c}{h_{wcs}} = \frac{1}{100}\left(4 - \frac{1}{50} - \frac{\ell_w}{b}\cdot\frac{c}{b} - \frac{V_e}{0.66\sqrt{f'_c}\,A_{cv}}\right) \geq 0.015 \tag{18.10.6.2b-iii}$$

### 6.2 Método alternativo — Verificación de tensión (§18.10.6.3)

Para muros no cubiertos por §18.10.6.2: se requieren elementos de borde si la tensión de compresión extrema (calculada elásticamente bajo cargas sísmicas) supera $0.2f'_c$.  
El elemento de borde puede discontinuarse donde la tensión < $0.15f'_c$.

### 6.3 Geometría del elemento de borde (§18.10.6.4)

**(a)** Extensión horizontal desde la fibra extrema en compresión:
$$\ell_{be} \geq \max\left(c - 0.1\ell_w,\ \frac{c}{2}\right)$$

**(b)** Ancho mínimo de la zona de flexo-compresión:
$$b \geq \frac{h_u}{16}$$

**(c)** Si $h_w/\ell_w \geq 2.0$ y $c/\ell_w \geq 3/8$:
$$b \geq 300\ \text{mm}$$

**(d)** En secciones con ala: el elemento de borde incluye el ala efectiva en compresión y se extiende al menos 300 mm en el alma.

### 6.4 Refuerzo transversal en elementos de borde (Tabla 18.10.6.4(g))

**Tabla 18.10.6.4(g) — Refuerzo mínimo de confinamiento**

| Tipo | Expresión aplicable |
|---|---|
| $A_{sh}/(s \cdot b_c)$ para estribo rectangular | Mayor entre: $0.3\left(\dfrac{A_g}{A_{ch}}-1\right)\dfrac{f'_c}{f_{yt}}$ **(a)** y $0.09\dfrac{f'_c}{f_{yt}}$ **(b)** |
| $\rho_s$ para espiral o aro circular | Mayor entre: $0.45\left(\dfrac{A_g}{A_{ch}}-1\right)\dfrac{f'_c}{f_{yt}}$ **(c)** y $0.12\dfrac{f'_c}{f_{yt}}$ **(d)** |

**Otras restricciones del elemento de borde:**
- Refuerzo transversal se extiende vertical al menos $\max(\ell_w,\ M_u/4V_u)$ sobre y bajo la sección crítica.
- Espaciado $h_x$ entre barras longitudinales con soporte lateral: $h_x \leq \min(350\ \text{mm},\ 2b/3)$.
- El concreto dentro del sistema de piso en la ubicación del elemento de borde: $f'_c \geq 0.7\,f'_{c,muro}$.
- El refuerzo horizontal del alma se ancla dentro del núcleo confinado del elemento de borde y se extiende a 150 mm del extremo del muro.

### 6.5 Extensión vertical de los elementos de borde (§18.10.6.4(i)(j))

- Estribos verticales del alma: soporte lateral con gancho sísmico a cada extremo, separación ≤ 300 mm.
- En la base del muro: el refuerzo transversal se extiende al menos $\ell_d$ dentro de la fundación (footing, losa o pilote), mínimo 300 mm.

---

## 7. Requisitos de Extensión Vertical del Elemento de Borde (§18.10.6.5)

Cuando se requiere elemento de borde por §18.10.6.2 o §18.10.6.3, su longitud vertical $\ell_{be}$ debe extenderse:

- **Hacia arriba:** al menos $\max(\ell_w,\ M_u/4V_u)$ desde la sección crítica
- **Hacia abajo:** al menos $\ell_d$ de la barra longitudinal más grande del elemento de borde dentro de la fundación

---

## 8. Resumen de Verificaciones para Muro Especial

| Verificación | Referencia | Requisito |
|---|---|---|
| Cuantía mínima distribuida | §18.10.2.1 | $\rho_\ell, \rho_t \geq 0.0025$ |
| Dos cortinas de refuerzo | §18.10.2.2 | $V_u > 0.17\lambda\sqrt{f'_c}A_{cv}$ ó $h_w/\ell_w \geq 2$ |
| Desarrollo en zona de fluencia | §18.10.2.3 | Para $1.25f_y$ |
| Amplificación del corte de diseño | §18.10.3.3 | $V_e = V_{uEh} \cdot \Omega_v \cdot \omega_v$ |
| Resistencia al corte nominal | §18.10.4.1 | $\phi V_n \geq V_e$, con $f'_c \leq 85$ MPa |
| Límite de $V_n$ | §18.10.4.4 | $V_n \leq \alpha_{sh} \cdot 0.83\sqrt{f'_c}A_{cw}$ |
| Elemento de borde (disp.) | §18.10.6.2 | $1.5\delta_u/h_{wcs} \geq \ell_w/600c$ |
| Elemento de borde (tensión) | §18.10.6.3 | $\sigma_{max} > 0.2f'_c$ |
| Refuerzo confinamiento | Tabla 18.10.6.4(g) | $A_{sh}/(sb_c)$ y $\rho_s$ mínimos |
| Ancho mínimo elemento de borde | §18.10.6.4(b)(c) | $b \geq h_u/16$; $b \geq 300$ mm si $c/\ell_w \geq 3/8$ |
| Extensión horizontal del elemento | §18.10.6.4(a) | $\ell_{be} \geq \max(c-0.1\ell_w,\ c/2)$ |

---

## Notas de Diseño

- **Factor φ para corte en muros especiales:** φ = 0.75 (§21.2.4.1). Sin embargo, §21.2.4.2 permite φ = 0.60 si $V_n$ está basado en $V_{pr}$ de los elementos adyacentes.
- **Muro acoplado (ductile coupled wall):** debe satisfacer el requisito de relación de acoplamiento (coupling ratio), con vigas de acoplamiento diseñadas por §18.10.7.
- **Diseño por análisis no lineal:** si se usa NRHA conforme al Apéndice A, las fuerzas de diseño son las del análisis directamente (§18.10.3.3.1).
- **Chile:** NCh2369-2025 permite el uso de ACI 318 para el diseño de elementos de concreto. Los muros sísmicos de edificios industriales quedan sujetos a los requisitos de §18.10.
