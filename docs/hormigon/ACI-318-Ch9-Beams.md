---
title: "ACI 318-25 Cap. 9 — Diseño de Vigas"
type: formula
standard_ref: "ACI-318-25"
chapter: "9"
section: "9.3–9.7, 18.6"
variables: [M_u, V_u, T_u, phi, A_s, A_v, b_w, d, h, f_c, f_y, f_yt, s, rho_w, M_pr, V_e]
units: "SI"
tags: [vigas, flexión, corte, torsión, hormigón, ACI, sismo, marcos-especiales]
related:
  - ../standards/ACI-318-25.md
  - ../formulas/ACI-318-Ch22-SectionalStrength.md
  - ../formulas/ACI-318-Ch21-PhiFactors.md
  - ../materials/Concrete-Properties.md
  - ../materials/Steel-Reinforcing.md
  - ACI-318-Ch18-SpecialWalls.md
created: 2026-04-10
updated: 2026-05-14
---

# ACI 318-25 Cap. 9 — Diseño de Vigas

## Fuente
ACI CODE-318-25: Capítulo 9, con fórmulas de resistencia en Cap. 22

---

## Límites de Diseño

### Profundidad Mínima (§9.3.1.1, Tabla 9.3.1.1)

Para vigas no preesforzadas que no soporten ni estén unidas a particiones u otras construcciones susceptibles de daño por deflexiones grandes:

| Condición de apoyo | $h_{min}$ |
|--------------------|-----------|
| Simplemente apoyada | $\ell / 16$ |
| Un extremo continuo | $\ell / 18.5$ |
| Ambos extremos continuos | $\ell / 21$ |
| Voladizo | $\ell / 8$ |

> Valores válidos para concreto de peso normal y $f_y = 420$ MPa.

**Modificadores:**

- Para $f_y \neq 420$ MPa: multiplicar por $(0.4 + f_y/700)$
- Para concreto liviano ($w_c$ entre 1440 y 1840 kg/m³): multiplicar por $\max(1.65 - 0.0003\,w_c,\; 1.09)$

### Restricción de Ductilidad — Vigas No Preesforzadas (§9.3.3.1)

Para $P_u < 0.10\,f'_c\,A_g$: la viga debe ser controlada por tracción (ver Tabla 21.2.2).

---

## Fórmulas de Resistencia

### Verificación General (§9.5.1.1)

$$\phi M_n \geq M_u \qquad \phi V_n \geq V_u \qquad \phi T_n \geq T_u$$

con $\phi$ según [Cap. 21](ACI-318-Ch21-PhiFactors.md) y resistencias nominales según [Cap. 22](ACI-318-Ch22-SectionalStrength.md).

---

### Flexión (§9.5.2 → §22.3)

Para $P_u < 0.10\,f'_c\,A_g$:

$$M_n = A_s f_y \left(d - \frac{a}{2}\right)$$

$$a = \frac{A_s f_y}{0.85\,f'_c\,b}$$

La profundidad del bloque de compresión equivalente cumple $a = \beta_1 c$.

**Variables:**

| Símbolo | Descripción | Unidad |
|---------|------------|--------|
| $M_n$ | Momento nominal | N·mm |
| $A_s$ | Área de acero en tracción | mm² |
| $f_y$ | Fluencia del acero | MPa |
| $d$ | Altura efectiva | mm |
| $a$ | Profundidad del bloque equivalente | mm |
| $b$ | Ancho de la sección comprimida | mm |
| $\beta_1$ | Factor del bloque de compresión (ver Tabla 22.2.2.4.3) | — |

---

### Cortante — Sección Crítica (§9.4.3.2)

Para cargas aplicadas en la parte superior y sin cargas concentradas entre el apoyo y $d$, el cortante de diseño puede tomarse a una distancia $d$ desde la cara del apoyo (**vigas no preesforzadas**) o $h/2$ (**preesforzadas**).

---

### Cortante — Resistencia del Concreto (§22.5.5.1, Tabla 22.5.5.1)

Para miembros no preesforzados, $V_c$ se determina según la disponibilidad de refuerzo transversal mínimo:

**Con $A_v \geq A_{v,min}$** (dos opciones equivalentes):

$$V_c = \left[0.17\lambda\sqrt{f'_c} + \frac{N_u}{6\,A_g}\right] b_w d \quad \text{(opción simplificada)}$$

$$V_c = \left[0.66\lambda\,\rho_w^{1/3}\sqrt{f'_c} + \frac{N_u}{6\,A_g}\right] b_w d \quad \text{(opción detallada)}$$

**Sin $A_v \geq A_{v,min}$** (incluye efecto de tamaño $\lambda_s$):

$$V_c = \left[0.66\,\lambda_s\,\lambda\,\rho_w^{1/3}\sqrt{f'_c} + \frac{N_u}{6\,A_g}\right] b_w d$$

**Límites:**

$$0.083\,\lambda\sqrt{f'_c}\,b_w d \leq V_c \leq 0.42\,\lambda\sqrt{f'_c}\,b_w d$$

> $V_c$ no puede ser negativo. $N_u/6A_g$ no puede exceder $0.05\,f'_c$. $\sqrt{f'_c}$ limitado a 8.3 MPa (§22.5.3.1).

**Factor de efecto de tamaño** $\lambda_s$ (§22.5.5.1.3):

$$\lambda_s = \sqrt{\frac{2}{1 + d/250}} \leq 1.0$$

**Variables:**

| Símbolo | Descripción | Unidad |
|---------|------------|--------|
| $V_c$ | Resistencia al corte aportada por el concreto | N |
| $\lambda$ | Factor de concreto liviano (1.0 para concreto normal) | — |
| $\lambda_s$ | Factor de efecto de tamaño (aplica si $A_v < A_{v,min}$) | — |
| $\rho_w$ | Cuantía de refuerzo longitudinal $= A_s / (b_w d)$ | — |
| $f'_c$ | Resistencia a compresión del concreto | MPa |
| $b_w$ | Ancho del alma | mm |
| $d$ | Altura efectiva | mm |
| $N_u$ | Fuerza axial (positiva compresión, negativa tracción) | N |
| $A_g$ | Área bruta de la sección | mm² |

---

### Cortante — Resistencia del Refuerzo Transversal (§22.5.8.5.3)

$$V_s = \frac{A_v\,f_{yt}\,d}{s}$$

**Verificación de dimensiones de sección** (§22.5.1.2):

$$V_u \leq \phi\left(V_c + 0.66\sqrt{f'_c}\,b_w d\right)$$

**Variables:**

| Símbolo | Descripción | Unidad |
|---------|------------|--------|
| $V_s$ | Resistencia al corte del refuerzo | N |
| $A_v$ | Área de todos los ramas del estribo en la sección | mm² |
| $f_{yt}$ | Fluencia del acero del estribo (máx. 420 MPa en diseño) | MPa |
| $s$ | Espaciado de estribos | mm |

---

### Torsión — Umbral de Desprecio (§9.5.4.1, §22.7)

Si $T_u < \phi T_{th}$, se puede despreciar la torsión. La torsión umbral $T_{th}$ se calcula según §22.7.

---

## Límites de Refuerzo

### Acero Mínimo en Tracción (§9.6.1)

$$A_{s,min} = \frac{0.25\sqrt{f'_c}}{f_y}\,b_w d \geq \frac{1.4}{f_y}\,b_w d$$

### Refuerzo Transversal Mínimo (§9.6.3.4)

Requerido cuando $V_u > 0.5\,\phi V_c$:

$$A_{v,min} = \max\left(\frac{0.062\sqrt{f'_c}}{f_{yt}}\,b_w s,\; \frac{0.35}{f_{yt}}\,b_w s\right)$$

---

## Requisitos Sísmicos — Viga de Marco Especial (§18.6)

> **Aplica cuando:** la viga forma parte de un Sistema Especial de Marcos Resistentes a Momento (SMRF) en edificios SDC C–F o en Chile bajo NCh2369 con diseño sísmico especial.

### Límites Dimensionales (§18.6.2)

| Requisito | Límite |
|-----------|--------|
| Luz libre | $\ell_n \geq 4d$ |
| Ancho del alma | $b_w \geq 250$ mm |
| Relación ancho/altura | $b_w / h \geq 0.3$ |
| Proyección fuera de cara de columna | $\leq 3b_w$ por cada lado |

### Refuerzo Longitudinal (§18.6.3)

- Mínimo **2 barras continuas** en cara superior e inferior en toda la longitud.
- Cuantía de tracción: $\rho \leq 0.025$ en cualquier sección.
- En la **cara del nudo**: $A_s^{+} \geq A_s^{-}/2$ (refuerzo inferior ≥ mitad del superior).
- En cualquier sección de la luz: $A_s \geq \tfrac{1}{4}\,\max(A_s^{cara\,A},\, A_s^{cara\,B})$.

### Empalmes (§18.6.4)

- **Prohibidos** dentro de $2h$ desde la cara de la columna.
- **Prohibidos** en regiones de plastificación esperada.
- Los empalmes permitidos deben quedar dentro de aros de confinamiento.

### Refuerzo Transversal — Confinamiento (§18.6.5)

Se requieren **aros** (hoops) en longitud $2h$ desde la cara de la columna en ambos extremos.

- Primer aro: a no más de **50 mm** de la cara de la columna.
- Espaciado dentro de $2h$:

$$s \leq \min\!\left(\frac{d}{4},\; 6d_{b,long},\; 150\ \text{mm}\right)$$

- Fuera de la zona $2h$: estribos con ganchos de 135°, $s \leq d/2$.

**Variables:**

| Símbolo | Descripción | Unidad |
|---------|------------|--------|
| $h$ | Altura total de la viga | mm |
| $d_{b,long}$ | Diámetro de barra longitudinal | mm |
| $s$ | Espaciado de aros | mm |

### Diseño por Cortante Sísmico (§18.6.6)

El cortante de diseño $V_e$ se determina a partir de los **momentos probables** $M_{pr}$ en los extremos (usando $1.25f_y$ y $\phi = 1.0$), sumados con la carga de gravedad:

$$V_e = \frac{M_{pr,1} + M_{pr,2}}{\ell_n} + \frac{w_{grav}\,\ell_n}{2}$$

> Se evalúan ambos sentidos del sismo para determinar el máximo $V_e$.

**Condición $V_c = 0$ (§18.6.6.2):** asumir $V_c = 0$ cuando simultáneamente:

1. La componente sísmica del corte supera la mitad del corte total: $V_e^{sism} > V_u/2$
2. La carga axial factorizada: $P_u < 0.05\,A_g\,f'_c$

**Variables:**

| Símbolo | Descripción | Unidad |
|---------|------------|--------|
| $M_{pr,1},\,M_{pr,2}$ | Momentos probables en extremos (con $1.25f_y$, $\phi=1$) | N·mm |
| $\ell_n$ | Luz libre de la viga | mm |
| $w_{grav}$ | Carga de gravedad uniformemente distribuida factorizada | N/mm |
| $V_e$ | Cortante de diseño sísmico | N |
