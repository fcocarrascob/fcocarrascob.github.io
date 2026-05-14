---
title: "ACI 318-25 — Capítulo 7: Losas Unidireccionales"
type: formula
standard_ref: "ACI-318-25"
chapter: "7"
section: "7.3–7.7"
variables: [h, fy, wc, As_min, Ag, Act, d, Vn, Vu, Mn, Mu, phi]
units: "SI"
tags: [losa, unidireccional, one-way-slab, espesor-mínimo, refuerzo, flexión, cortante, retracción]
related:
  - ../standards/ACI-318-25.md
  - ACI-318-Ch8-TwoWaySlabs.md
  - ACI-318-Ch9-Beams.md
  - ACI-318-Ch21-PhiFactors.md
  - ACI-318-Ch22-SectionalStrength.md
created: 2026-04-13
updated: 2026-04-13
---

# ACI 318-25 Cap. 7 — Losas Unidireccionales

## Fuente
ACI CODE-318-25: Capítulo 7, páginas 99–110.

## Alcance (§7.1)

Se aplica al diseño de losas reforzadas para flexión en **una dirección**, incluyendo:

- Losas macizas (solid slabs)
- Losas sobre plataforma metálica (stay-in-place non-composite steel deck)
- Losas compuestas (precast + cast-in-place)
- Losas alveolares prefabricadas preesforzadas (hollow-core)

> **Nota:** Las losas nervadas (joist systems) se diseñan por Capítulo 9 (§9.8).

---

## 1. Límites de Diseño (§7.3)

### 1.1 Espesor Mínimo sin Cálculo de Deflexión

**Tabla 7.3.1.1** — Válida para losas macizas no preesforzadas que **no soportan ni están adheridas** a elementos no estructurales susceptibles a daño por deflexión:

| Condición de apoyo | Espesor mínimo h |
|--------------------|-----------------|
| Simplemente apoyado | $\ell / 20$ |
| Un extremo continuo | $\ell / 24$ |
| Ambos extremos continuos | $\ell / 28$ |
| Voladizo (cantilever) | $\ell / 10$ |

> ¹ Válida para concreto de peso normal y $f_y = 420$ MPa.

**Modificadores aplicables:**

- **Para $f_y \neq 420$ MPa:** multiplicar la expresión por:

$$\left(0.4 + \frac{f_y}{700}\right)$$

- **Para concreto liviano** ($w_c$ entre 1440 y 1840 kg/m³): multiplicar por el mayor de:

$$\max\!\left(1.65 - 0.0003w_c,\; 1.09\right)$$

### 1.2 Deflexiones Calculadas

Si no se cumple la Tabla 7.3.1.1, las deflexiones inmediatas y diferidas deben calcularse según §24.2 y no exceder los límites de **Tabla 24.2.2**.

### 1.3 Límite de Deformación (§7.3.3)

Las losas no preesforzadas deben ser **tension-controlled** según Tabla 21.2.2 ($\varepsilon_t \geq \varepsilon_{ty} + 0.003$).

---

## 2. Resistencia Requerida (§7.4)

### Momento factorizado
Para losas construidas monolíticamente con apoyos, $M_u$ puede calcularse en la **cara del apoyo** (§7.4.2.1).

### Cortante factorizado — Sección crítica
La cortante de diseño puede tomarse en la sección crítica ubicada a **d desde la cara del apoyo** (no preesforzadas) o **h/2 desde la cara** (preesforzadas), siempre que (§7.4.3.2):

- La reacción del apoyo introduce compresión en el extremo de la losa
- Las cargas se aplican en o cerca de la cara superior
- No hay cargas concentradas entre la cara del apoyo y la sección crítica

---

## 3. Resistencia de Diseño (§7.5)

En cada sección y para cada combinación de carga aplicable debe satisfacerse:

$$\phi M_n \geq M_u \qquad \phi V_n \geq V_u$$

- $M_n$ calculado según §22.3 (resistencia a flexión).
- $V_n$ calculado según §22.5 (resistencia a corte unidireccional).
- $\phi$ determinado según §21.2.

---

## 4. Refuerzo Mínimo (§7.6)

### 4.1 Refuerzo Flexural Mínimo (No Preesforzado)

$$A_{s,\min} = 0.0018 A_g \tag{7.6.1.1}$$

**Variables:**

| Símbolo | Descripción | Unidad |
|---------|-------------|--------|
| $A_{s,\min}$ | Área mínima de refuerzo flexural | mm² |
| $A_g$ | Área bruta de la sección transversal ($b_w \times h$) | mm² |

### 4.2 Refuerzo Mínimo en Losas Preesforzadas sin Adherencia

$$A_{s,\min} \geq 0.004 A_{ct} \tag{7.6.2.3}$$

donde $A_{ct}$ es el área de la sección transversal entre la cara de tensión en flexión y el centroide de la sección bruta.

### 4.3 Refuerzo de Corte Mínimo (§7.6.3)

Se requiere $A_{v,\min}$ en todas las regiones donde $V_u > \phi V_c$.
Excepción: losas alveolares macizas con $h > 315$ mm requieren $A_{v,\min}$ donde $V_u > 0.5\phi V_{cw}$.

Si se requiere refuerzo de corte, $A_{v,\min}$ según §9.6.3.4.

### 4.4 Refuerzo de Retracción y Temperatura (§7.6.4 → §24.4.3)

$$\rho_{s\&t} \geq 0.0018 \tag{24.4.3.2}$$

- Espaciado máximo: $s \leq \min(5h,\; 450\text{ mm})$
- Debe desarrollar $f_y$ en tensión en todas las secciones

---

## 5. Detallado del Refuerzo (§7.7)

### 5.1 Espaciado de Refuerzo

| Caso | Espaciado máximo s |
|------|-------------------|
| Losas no preesforzadas y clase C (control de fisuración) | Según §24.3 |
| Losas no preesforzadas + preesforzadas clase T/C con tendones no adheridos | $\min(3h,\; 450\text{ mm})$ |
| Refuerzo perpendicular a viga según §7.5.2.3 | $\min(5h,\; 450\text{ mm})$ |
| Refuerzo de retracción y temperatura (no preesforzado) | $\min(5h,\; 450\text{ mm})$ |

### 5.2 Terminación del Refuerzo Flexural (§7.7.3.8)

- **Apoyo simple:** al menos 1/3 del refuerzo de momento positivo máximo debe extenderse hacia el interior del apoyo.
- **Otros apoyos:** al menos 1/4 del refuerzo de momento positivo debe extenderse hacia el apoyo al menos **150 mm**.
- El refuerzo de momento negativo debe extenderse más allá del punto de inflexión al menos $\max(d,\; 12d_b,\; \ell_n/16)$.
- Todo refuerzo tensionado debe extenderse al menos $\max(d,\; 12d_b)$ más allá del punto en que ya no es requerido por flexión.

### 5.3 Retracción y Temperatura — Colocación (§7.7.6)

- Se coloca **perpendicular** al refuerzo principal de flexión.
- Espaciado máximo: $\min(5h,\; 450\text{ mm})$.

---

## 6. Condición Tensión-Controlada

Las losas no preesforzadas deben ser tension-controlled (ver [ACI-318-Ch21-PhiFactors](ACI-318-Ch21-PhiFactors.md)):

$$\varepsilon_t \geq \varepsilon_{ty} + 0.003 \Rightarrow \phi = 0.90$$

---

## Notas

- Para losas apoyadas en muros o no vaciadas monolíticamente con vigas, el área bruta de concreto para el cálculo de preesfuerzo por retracción corresponde solo a la franja tributaria del tendón (§7.6.4.2.2).
- En losas post-tensionadas con vigas, al menos un tendón de retracción debe existir en la losa entre cada par de vigas adyacentes (§7.6.4.2.3).
