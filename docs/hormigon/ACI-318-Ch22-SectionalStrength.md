---
title: "ACI 318-25 Cap. 22 — Resistencia Seccional"
type: formula
standard_ref: "ACI-318-25"
chapter: "22"
section: "22.2–22.6"
variables: [M_n, V_n, V_c, V_s, P_o, P_n, beta_1, a, c, A_v, rho_w, lambda_s, lambda]
units: "SI"
tags: [resistencia-seccional, bloque-tensiones, cortante, flexión, ACI]
related:
  - ../standards/ACI-318-25.md
  - ../formulas/ACI-318-Ch9-Beams.md
  - ../formulas/ACI-318-Ch10-Columns.md
  - ../formulas/ACI-318-Ch21-PhiFactors.md
  - ../materials/Concrete-Properties.md
created: 2026-04-10
updated: 2026-04-10
---

# ACI 318-25 Cap. 22 — Resistencia Seccional

## Fuente
ACI CODE-318-25: Capítulo 22 — Sectional Strength

---

## Supuestos de Diseño (§22.2)

1. **Equilibrio** en cada sección
2. **Deformación compatible** (distribución lineal): $\varepsilon \propto \text{distancia al eje neutro}$
3. **Deformación última del concreto**: $\varepsilon_{cu} = 0.003$
4. **Resistencia a tracción del concreto = 0** para cálculo de flexión y axial
5. **Bloque de compresión equivalente rectangular**: esfuerzo uniforme $0.85\,f'_c$ sobre profundidad $a = \beta_1\,c$

---

## Bloque de Compresión Equivalente — Factor β₁ (§22.2.2.4.3, Tabla 22.2.2.4.3)

| $f'_c$ (MPa) | $\beta_1$ | Ecuación |
|-------------|-----------|---------|
| $17 \leq f'_c \leq 28$ | 0.85 | (a) |
| $28 < f'_c < 55$ | $0.85 - \dfrac{0.05(f'_c - 28)}{7}$ | (b) |
| $f'_c \geq 55$ | 0.65 | (c) |

**Valores numéricos:**
| $f'_c$ [MPa] | $\beta_1$ |
|-------------|-----------|
| 20 | 0.85 |
| 25 | 0.85 |
| 28 | 0.85 |
| 30 | 0.836 |
| 35 | 0.800 |
| 40 | 0.764 |
| 45 | 0.729 |
| 50 | 0.693 |
| 55 | 0.65 |
| ≥55 | 0.65 |

$$a = \beta_1\,c \quad \Rightarrow \quad c = \frac{a}{\beta_1}$$

---

## Resistencia a Flexión (§22.3)

$$M_n = A_s f_y \left(d - \frac{a}{2}\right) \quad \text{para sección rectangular}$$

$$a = \frac{A_s f_y}{0.85\,f'_c\,b}$$

---

## Resistencia Axial y Flexo-Compresión (§22.4)

### Fuerza axial nominal máxima (§22.4.2.2)

$$P_o = 0.85\,f'_c\,(A_g - A_{st}) + f_y\,A_{st}$$

> $f_y$ limitado a $550$ MPa (§22.4.2.1)

### Límite máximo de $P_n$ (Tabla 22.4.2.1)

| Tipo de refuerzo transversal | $P_{n,max}$ |
|-----------------------------|-------------|
| Estribos | $0.80\,P_o$ |
| Espiral | $0.85\,P_o$ |

---

## Resistencia al Corte Unidireccional — $V_n$ (§22.5)

### Resistencia total (§22.5.1.1)

$$V_n = V_c + V_s$$

### Límite de dimensiones de sección (§22.5.1.2)

$$V_u \leq \phi\left(V_c + 0.66\sqrt{f'_c}\,b_w d\right)$$

### $V_c$ para miembros no preesforzados (§22.5.5.1, Tabla 22.5.5.1)

**Con $A_v \geq A_{v,min}$:**

$$V_c = \left[0.17\lambda\sqrt{f'_c} + \frac{N_u}{6\,A_g}\right]b_w d \quad \text{(simplificada)}$$

$$V_c = \left[0.66\lambda\,\rho_w^{1/3}\sqrt{f'_c} + \frac{N_u}{6\,A_g}\right]b_w d \quad \text{(detallada)}$$

**Sin $A_v \geq A_{v,min}$:**

$$V_c = \left[0.66\,\lambda_s\,\lambda\,\rho_w^{1/3}\sqrt{f'_c} + \frac{N_u}{6\,A_g}\right]b_w d$$

**Límites:**

$$V_{c,min} = 0.083\,\lambda\sqrt{f'_c}\,b_w d \quad \text{(con refuerzo transversal)}$$

$$V_{c,max} = 0.42\,\lambda\sqrt{f'_c}\,b_w d$$

> $V_c \geq 0$; $N_u/6A_g \leq 0.05\,f'_c$; $\sqrt{f'_c} \leq 8.3$ MPa para cortante

### Factor de efecto de tamaño $\lambda_s$ (§22.5.5.1.3)

$$\lambda_s = \sqrt{\frac{2}{1 + d/250}} \leq 1.0$$

Aplica cuando $A_v < A_{v,min}$ — penaliza members profundos con poca armadura transversal.

### $V_s$ por refuerzo transversal — estribos perpendiculares (§22.5.8.5.3)

$$V_s = \frac{A_v\,f_{yt}\,d}{s}$$

$$\frac{A_v}{s} = \frac{V_u/\phi - V_c}{f_{yt}\,d}$$

**Variables:**
| Símbolo | Descripción | Unidad |
|---------|------------|--------|
| $V_c$ | Resistencia al corte del concreto | N |
| $V_s$ | Resistencia al corte del refuerzo | N |
| $A_v$ | Área de ramas de estribos en la sección | mm² |
| $f_{yt}$ | Fluencia del estribo (máx. 420 MPa en cálculo de $V_s$) | MPa |
| $s$ | Espaciado de estribos | mm |
| $\rho_w$ | $A_s / (b_w d)$ | — |
| $\lambda$ | Factor concreto liviano (1.0 normal, 0.75 liviano) | — |
| $\lambda_s$ | Factor de efecto de tamaño | — |
| $N_u$ | Fuerza axial (positivo = compresión) | N |
| $A_g$ | Área bruta | mm² |

---

## Resistencia al Corte Bidireccional (§22.6) — Punzonamiento

$$v_n = v_c \quad \text{(sin refuerzo de cortante)}$$

$$v_n = v_c + v_s \quad \text{(con refuerzo de cortante)}$$

El cortante bidireccional se verifica en la sección crítica a $d/2$ del borde del elemento cargado, con perímetro $b_o$.

---

## Notas de Diseño

- Las ecuaciones de $V_c$ de la revisión 2019/2025 incorporan "**size effect**" y el efecto de $\rho_w$ — más conservadoras que ediciones anteriores para vigas profundas con poca cuantía
- Para losas industriales/tableros con $d > 250$ mm, verificar siempre con la ecuación que incluye $\lambda_s$
- $\sqrt{f'_c}$ no puede exceder 8.3 MPa en cálculo de $V_c$ (equivale a $f'_c \approx 69$ MPa)
