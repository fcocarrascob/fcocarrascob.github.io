---
title: "ACI 318-25 Cap. 21 — Factores de Reducción φ"
type: formula
standard_ref: "ACI-318-25"
chapter: "21"
section: "21.2"
variables: [phi, epsilon_t, epsilon_ty]
units: "SI"
tags: [phi, factores-reducción, resistencia, ACI]
related:
  - ../standards/ACI-318-25.md
  - ../formulas/ACI-318-Ch22-SectionalStrength.md
  - ../formulas/ACI-318-Ch9-Beams.md
  - ../formulas/ACI-318-Ch10-Columns.md
created: 2026-04-10
updated: 2026-04-10
---

# ACI 318-25 Cap. 21 — Factores de Reducción φ

## Fuente
ACI CODE-318-25: Capítulo 21 — Strength Reduction Factors

---

## Propósito

Los factores $\phi$ sirven para:
1. Compensar variabilidad en resistencia de materiales y dimensiones
2. Reflejar inexactitudes en las ecuaciones de diseño
3. Reconocer la ductilidad y confiabilidad requerida del elemento
4. Reflejar la importancia del elemento en la estructura

---

## Tabla 21.2.1 — Factores φ para Elementos y Conexiones

| Acción / Elemento | $\phi$ | Notas |
|-------------------|--------|-------|
| (a) Momento, fuerza axial, o combinación | 0.65–0.90 | Según Tabla 21.2.2 |
| (b) Cortante | 0.75 | Ver 21.2.4 para sismo |
| (c) Torsión | 0.75 | — |
| (d) Aplastamiento | 0.65 | — |
| (e) Ménsula y voladizo | 0.75 | — |
| (f) Concreto simple | 0.60 | — |
| (g) Biela-tirante (Cap. 23) | 0.75 | — |
| (h) Zonas de anclaje post-tensado | 0.85 | — |
| (i) Conexiones pretensadas controladas por fluencia en tracción | 0.90 | — |
| (j) Anclaje de barras — rotura de hormigón | 0.75 | — |
| (k) Refuerzo de anclaje (§17.5.2.1) | 0.90 | — |
| (l) Rotura de concreto en anclas en tracción, no redundante | 0.65 | — |
| (m) Rotura de concreto en anclas en tracción, redundante | 0.75 | — |
| (n) Rotura de concreto en anclas en corte | 0.75 | — |
| (o) Ancla metálica en tracción, dúctil | 0.75 | — |
| (p) Ancla metálica en tracción, no dúctil | 0.65 | — |
| (q) Ancla metálica en corte, dúctil | 0.65 | — |
| (r) Ancla metálica en corte, no dúctil | 0.60 | — |

---

## Tabla 21.2.2 — φ para Momento/Axial según Deformación Neta

La deformación neta $\varepsilon_t$ es la deformación de tracción en el refuerzo extremo en tracción a resistencia nominal, excluyendo prestress, fluencia, retracción y temperatura.

| Clasificación | Condición sobre $\varepsilon_t$ | $\phi$ |
|--------------|--------------------------------|--------|
| Controlada por compresión | $\varepsilon_t \leq \varepsilon_{ty}$ | 0.65 (estribos) / 0.75 (espiral) |
| Transición | $\varepsilon_{ty} < \varepsilon_t < (\varepsilon_{ty} + 0.003)$ | Interpolada linealmente |
| Controlada por tracción | $\varepsilon_t \geq \varepsilon_{ty} + 0.003$ | 0.90 |

> Para acero de refuerzo deformado Grado 420 ($f_y = 420$ MPa): $\varepsilon_{ty} = f_y/E_s = 420/200{,}000 = 0.0021$
> → límite de tracción controlada: $\varepsilon_t \geq 0.0021 + 0.003 = 0.0051$

**Interpolación lineal en zona de transición (miembros con estribos):**

$$\phi = 0.65 + 0.25 \cdot \frac{\varepsilon_t - \varepsilon_{ty}}{0.003}$$

**Interpolación lineal en zona de transición (miembros con espiral):**

$$\phi = 0.75 + 0.15 \cdot \frac{\varepsilon_t - \varepsilon_{ty}}{0.003}$$

---

## Criterios de Clasificación

- **Compresión controlada** ($\varepsilon_t \leq \varepsilon_{ty}$): falla frágil sin aviso, requiere $\phi$ mínimo
- **Tracción controlada** ($\varepsilon_t \geq \varepsilon_{ty} + 0.003$): fluencia del acero antes del aplastamiento del concreto, falla dúctil con aviso → $\phi = 0.90$
- **Vigas y losas**: típicamente controladas por tracción ($\phi = 0.90$)
- **Columnas con carga axial elevada**: típicamente compresión controlada ($\phi = 0.65$ con estribos)

---

## Notas de Aplicación

- Para **redistribución de momentos** en miembros continuos (§6.6.5): se requiere $\varepsilon_t \geq 0.0075$
- Para estructuras con **requisitos sísmicos**: ajustes en $\phi$ por cortante según §21.2.4
- $\phi$ para cortante = 0.75 aplica a estructuras ordinarias; en algunas condiciones sísmicas se reduce
- $f_y$ limitado a máx. 550 MPa para cálculo de resistencia axial en compresión (§22.4.2.1)
