---
title: "ACI 318-25 Cap. 10 — Diseño de Columnas"
type: formula
standard_ref: "ACI-318-25"
chapter: "10"
section: "10.3–10.7, 22.4"
variables: [P_u, M_u, phi, A_s, A_g, f_c, f_y, rho_g, a, d]
units: "SI"
tags: [columnas, flexo-compresión, hormigón, ACI]
related:
  - ../standards/ACI-318-25.md
  - ../formulas/ACI-318-Ch22-SectionalStrength.md
  - ../formulas/ACI-318-Ch21-PhiFactors.md
  - ../materials/Concrete-Properties.md
  - ../materials/Steel-Reinforcing.md
  - ../applications/Column-Design-Workflow.md
created: 2026-04-09
updated: 2026-04-10
---

# ACI 318-25 Cap. 10 — Diseño de Columnas

## Fuente
ACI CODE-318-25: Capítulo 10 (Columnas), Capítulo 22 §22.4 (Resistencia axial combinada)

---

## Fórmulas

### Resistencia Axial Nominal ($P_o$) (§22.4.2.2)

Para miembros no preesforzados:

$$P_o = 0.85\,f'_c\,(A_g - A_{st}) + f_y\,A_{st}$$

> $f_y$ limitado a máx. 550 MPa para este cálculo.

### Resistencia Axial Nominal Máxima

Para columnas con estribos (§22.4.2, Tabla 22.4.2.1):

$$P_{n,max} = 0.80\,P_o$$

Para columnas con espiral (§22.4.2, Tabla 22.4.2.1):

$$P_{n,max} = 0.85\,P_o$$

**Variables:**

| Símbolo | Descripción | Unidad |
|---------|------------|--------|
| $P_{n,max}$ | Resistencia axial nominal máxima | N |
| $f'_c$ | Resistencia a compresión del concreto | MPa |
| $A_g$ | Área bruta de la sección transversal | mm² |
| $A_{st}$ | Área total de acero longitudinal | mm² |
| $f_y$ | Fluencia del acero de refuerzo | MPa |

### Resistencia a Flexión Nominal

$$M_n = A_s f_y \left( d - \frac{a}{2} \right)$$

$$a = \frac{A_s f_y}{0.85 f'_c b}$$

**Variables:**

| Símbolo | Descripción | Unidad |
|---------|------------|--------|
| $M_n$ | Momento nominal | N·mm |
| $A_s$ | Área de acero en tracción | mm² |
| $d$ | Altura efectiva (distancia al centroide del acero en tracción) | mm |
| $a$ | Profundidad del bloque de compresión equivalente | mm |
| $b$ | Ancho de la sección | mm |

### Verificación de Diseño

$$\phi P_n \geq P_u \quad \text{y} \quad \phi M_n \geq M_u$$

**Factores φ (§21.2):**
| Condición | $\phi$ |
|-----------|--------|
| Compresión controlada (estribos) | 0.65 |
| Compresión controlada (espiral) | 0.75 |
| Tracción controlada | 0.90 |
| Transición | Interpolar linealmente |

### Límites de Refuerzo (§10.6)

$$0.01 A_g \leq A_{st} \leq 0.08 A_g$$

Es decir:

$$1\% \leq \rho_g \leq 8\%$$

> **Práctica recomendada:** mantener $\rho_g$ entre 1% y 4% para facilitar la construcción y evitar congestión de acero.

### Refuerzo Mínimo por Flexión (§10.3.1)

$$A_{s,min} = \frac{0.25 \sqrt{f'_c}}{f_y} b_w d \geq \frac{1.4}{f_y} b_w d$$

### Esbeltez y Efectos de Segundo Orden (§6.6.4, §6.7)

Para columnas esbeltas ($k\ell_u / r > 22$ para arriostradas, $k\ell_u / r > 22$ para no arriostradas):

**Método de amplificación de momentos (§6.6.4):**

$$M_c = \delta_{ns} M_2$$

$$\delta_{ns} = \frac{C_m}{1 - P_u / (0.75 P_c)} \geq 1.0$$

$$P_c = \frac{\pi^2 (EI)_{eff}}{(k \ell_u)^2}$$

**Variables:**
| Símbolo | Descripción | Unidad |
|---------|------------|--------|
| $k$ | Factor de longitud efectiva | — |
| $\ell_u$ | Longitud no arriostrada | mm |
| $r$ | Radio de giro ($\approx 0.3h$ para rectangular) | mm |
| $C_m$ | Factor de equivalencia de momentos | — |
| $P_c$ | Carga crítica de Euler | N |
| $(EI)_{eff}$ | Rigidez efectiva reducida | N·mm² |

---

## Ejemplo de Uso

Sección rectangular $b = 300$ mm, $h = 500$ mm, $f'_c = 28$ MPa, $f_y = 420$ MPa:

$$A_g = 300 \times 500 = 150{,}000 \text{ mm}^2$$

$$A_{st,min} = 0.01 \times 150{,}000 = 1{,}500 \text{ mm}^2$$

$$A_{st,max} = 0.08 \times 150{,}000 = 12{,}000 \text{ mm}^2$$

Usando $\rho_g = 2\%$: $A_{st} = 3{,}000$ mm² → 6 barras Ø25 ($A_s = 6 \times 491 = 2{,}946$ mm²)

$$P_{n,max} = 0.80 [0.85 \times 28 \times (150{,}000 - 2{,}946) + 420 \times 2{,}946] = 3{,}790 \text{ kN}$$
