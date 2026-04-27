---
title: "ACI 318-25 — Capítulo 8: Losas Bidireccionales"
type: formula
standard_ref: "ACI-318-25"
chapter: "8"
section: "8.3–8.7"
variables: [h, fy, ln, alpha_fm, beta, gamma_f, gamma_v, Msc, b1, b2, vu, vn, phi, As_min, Ag, bslab]
units: "SI"
tags: [losa, bidireccional, two-way-slab, punzonamiento, flat-plate, flat-slab, espesor-mínimo, franja-de-columna, franja-media]
related:
  - ../standards/ACI-318-25.md
  - ACI-318-Ch7-OneWaySlabs.md
  - ACI-318-Ch21-PhiFactors.md
  - ACI-318-Ch22-SectionalStrength.md
created: 2026-04-13
updated: 2026-04-13
---

# ACI 318-25 Cap. 8 — Losas Bidireccionales

## Fuente
ACI CODE-318-25: Capítulo 8, páginas 111–140.

## Alcance (§8.1)

Se aplica al diseño de losas reforzadas para flexión en **dos direcciones**, con o sin vigas entre apoyos, incluyendo:
- Losas macizas (Flat Plates / Flat Slabs)
- Losas sobre plataforma metálica (stay-in-place non-composite steel deck)
- Losas compuestas
- Sistemas de losa nervada en dos direcciones (waffle slabs, §8.8)

> **No incluye:** losas sobre terreno que no transmiten cargas verticales al suelo.

### Sistemas de losas por tipo
| Sistema | Descripción |
|---------|------------|
| **Flat Plate** | Losa plana sin vigas ni capiteles, apoyada directamente en columnas |
| **Flat Slab** | Losa plana con capiteles o drop panels |
| **Losa con Vigas** | Losa con vigas en los bordes del panel |
| **Waffle Slab** | Losa nervada en dos direcciones (§8.8) |

---

## 1. Definiciones Geométricas (§8.4.1)

| Término | Definición |
|---------|-----------|
| **Panel** | Región delimitada por los ejes de columnas/vigas/muros en todos los lados |
| **Franja de columna** | Franja de diseño de ancho = $\min(0.25\ell_2,\, 0.25\ell_1)$ a cada lado del eje de columnas |
| **Franja media** | Franja de diseño delimitada por dos franjas de columna |
| **Viga (para efectos de losa)** | Incluye el alma + losa a cada lado hasta $\min$(proyección del alma, $4h_f$) |
| **Drop panel** | Engrosamiento local bajo la losa; requiere: proyección $\geq h/4$, extensión $\geq \ell/6$ desde eje del soporte |
| **Shear cap** | Proyección = engrosamiento cuya horizontalidad $\geq$ proyección bajo el sofito |

---

## 2. Espesor Mínimo (§8.3)

### 2.1 Sin Vigas Interiores (Tabla 8.3.1.1)

Para losas no preesforzadas sin vigas interiores con relación $\ell_{largo}/\ell_{corto} \leq 2$:

**Tabla 8.3.1.1** — Espesor mínimo $h$ (mm):

| $f_y$ (MPa) | Sin capiteles — Panel exterior sin vigas de borde | Sin capiteles — Panel exterior con vigas de borde | Sin capiteles — Panel interior | Con capiteles — Panel exterior sin vigas de borde | Con capiteles — Panel exterior con vigas de borde | Con capiteles — Panel interior |
|---|---|---|---|---|---|---|
| 280 | $\ell_n/33$ | $\ell_n/36$ | $\ell_n/36$ | $\ell_n/36$ | $\ell_n/40$ | $\ell_n/40$ |
| 420 | $\ell_n/30$ | $\ell_n/33$ | $\ell_n/33$ | $\ell_n/33$ | $\ell_n/36$ | $\ell_n/36$ |
| 550 | $\ell_n/27$ | $\ell_n/30$ | $\ell_n/30$ | $\ell_n/30$ | $\ell_n/33$ | $\ell_n/33$ |

> - $\ell_n$ = luz libre en la dirección larga, medida cara a cara de apoyos (mm).
> - Para $f_y$ entre los valores tabulados: interpolar linealmente.
> - Para $f_y > 550$ MPa: se debe calcular deflexiones (§8.3.2).
> - Viga de borde cuenta como tal si $\alpha_f \geq 0.8$.

**Mínimos absolutos (§8.3.1.1):**
- Sin drop panels: $h \geq 125$ mm
- Con drop panels: $h \geq 100$ mm

### 2.2 Con Vigas en Todos los Bordes (Tabla 8.3.1.2)

Función del parámetro $\alpha_{fm}$ (promedio de $\alpha_f$ para todas las vigas en los bordes del panel) y $\beta$ (relación de luces libres largo/corto):

| $\alpha_{fm}$ | $h$ mínimo |
|---|---|
| $\alpha_{fm} \leq 0.2$ | Aplica §8.3.1.1 |
| $0.2 < \alpha_{fm} \leq 2.0$ | $h \geq \max\!\left(\dfrac{\ell_n\!\left(0.8 + \dfrac{f_y}{1400}\right)}{36 + 5\beta(\alpha_{fm} - 0.2)},\; 125\text{ mm}\right)$ |
| $\alpha_{fm} > 2.0$ | $h \geq \max\!\left(\dfrac{\ell_n\!\left(0.8 + \dfrac{f_y}{1400}\right)}{36 + 9\beta},\; 90\text{ mm}\right)$ |

**Condición adicional (§8.3.1.2.1):** En bordes discontinuos de losas que satisfacen §8.3.1.2, debe proveerse una viga de borde con $\alpha_f \geq 0.80$, o aumentar h mínimo al menos 10% en el panel con borde discontinuo.

### 2.3 Restricción Adicional por Refuerzo de Corte (§8.3.1.4)

Si se usan estribos o conectores de corte tipo stud, el espesor debe ser suficiente para satisfacer los requisitos de $d$ en §22.6.7.1.

---

## 3. Transferencia de Momento Losa-Columna (§8.4.2.2)

### 3.1 Fracción por Flexión

La fracción del momento $M_{sc}$ transferido por flexión es $\gamma_f M_{sc}$, donde:

$$\gamma_f = \frac{1}{1 + \dfrac{2}{3}\sqrt{\dfrac{b_1}{b_2}}} \tag{8.4.2.2.2}$$

### 3.2 Fracción por Excentricidad de Cortante

$$\gamma_v = 1 - \gamma_f \tag{8.4.4.2.2}$$

### 3.3 Ancho Efectivo de Losa para Momento por Flexión (§8.4.2.2.3)

$$b_{slab} = c_{col} + 3h_{slab} \quad \text{(a cada lado del eje de columna)}$$

donde $c_{col}$ es el ancho del capitel o shear cap (si existe).

**Variables:**

| Símbolo | Descripción | Unidad |
|---------|-------------|--------|
| $M_{sc}$ | Momento factorizado resistido por la columna en la junta | N·mm |
| $\gamma_f$ | Fracción de $M_{sc}$ transferida por flexión | — |
| $\gamma_v$ | Fracción de $M_{sc}$ transferida por excentricidad de cortante | — |
| $b_1$ | Dimensión de la sección crítica de cortante paralela al momento | mm |
| $b_2$ | Dimensión de la sección crítica de cortante perpendicular al momento | mm |
| $b_{slab}$ | Ancho efectivo de losa para concentración de refuerzo | mm |

### 3.4 Modificación de $\gamma_f$ (Tabla 8.4.2.2.4)

Para losas no preesforzadas, si se satisfacen límites de $v_{uv}$ y $\varepsilon_t$:

| Posición de columna | Dirección de vano | $v_{uv}$ | $\varepsilon_t$ | $\gamma_f$ máximo modificado |
|---------------------|------------------|---------|-----------------|------------------------------|
| Columna de esquina | Cualquier dirección | $\leq 0.5\phi v_c$ | $\geq \varepsilon_{ty} + 0.003$ | 1.0 |
| Columna de borde | Perp. al borde | $\leq 0.75\phi v_c$ | $\geq \varepsilon_{ty} + 0.003$ | 1.0 |
| Columna de borde | Paralela al borde | $\leq 0.4\phi v_c$ | $\geq \varepsilon_{ty} + 0.008$ | $\frac{1.25}{1+(2/3)\sqrt{b_1/b_2}} \leq 1.0$ |
| Columna interior | Cualquier dirección | $\leq 0.4\phi v_c$ | $\geq \varepsilon_{ty} + 0.008$ | $\frac{1.25}{1+(2/3)\sqrt{b_1/b_2}} \leq 1.0$ |

---

## 4. Cortante por Punzonamiento (§8.4.4, §8.5.3)

### 4.1 Sección Crítica de Cortante

Las losas se evalúan para cortante bidireccional en la vecindad de columnas, cargas concentradas y áreas de reacción, según §22.6.4 (sección crítica a $d/2$ de la cara del soporte).

### 4.2 Resistencia de Diseño para Cortante Bidireccional

$$\phi v_n \geq v_u \tag{8.5.1.1d}$$

- $v_n$ según §22.6 (incluye contribución del concreto y, si aplica, del refuerzo de corte).
- Debe verificarse tanto corte unidireccional como bidireccional (punzonamiento).

### 4.3 Esfuerzo de Cortante por Transferencia de Momento

$$v_{u,AB} = v_{uv} + \frac{\gamma_v M_{sc} c_{AB}}{J_c}$$

$$v_{u,CD} = v_{uv} - \frac{\gamma_v M_{sc} c_{CD}}{J_c}$$

donde $J_c$ es una propiedad de la sección crítica análoga al momento polar de inercia. Para columna interior:

$$J_c = \frac{d(c_1 + d)^3}{6} + \frac{(c_1 + d)d^3}{6} + \frac{d(c_2 + d)(c_1 + d)^2}{2}$$

---

## 5. Refuerzo Mínimo Flexural (§8.6.1)

### 5.1 Refuerzo Mínimo General

$$A_{s,\min} = 0.0018 A_g \tag{8.6.1.1}$$

colocado cerca de la cara de tensión de la losa en la dirección del vano considerado.

### 5.2 Refuerzo Mínimo Adicional ante Punzonamiento (§8.6.1.2)

Si $v_{uv} > \phi\, 0.17\sqrt{f'_c}\,\lambda_s\lambda$ en la sección crítica:

$$A_{s,\min} = \frac{5\, v_{uv}\, b_{slab}\, b_o}{\phi\, \alpha_s\, f_y} \tag{8.6.1.2}$$

donde $\alpha_s$ corresponde a la posición de la columna (§22.6.5.3) y $\lambda_s$ es el factor de efecto de tamaño (§22.5.5.1.3).

---

## 6. Detallado del Refuerzo (§8.7)

### 6.1 Espaciado Máximo de Refuerzo No Preesforzado (§8.7.2.2)

| Región | Espaciado máximo $s$ |
|--------|---------------------|
| Secciones críticas (losas macizas) | $\min(2h,\; 450\text{ mm})$ |
| Otras secciones | $\min(3h,\; 450\text{ mm})$ |

### 6.2 Restricción de Esquina (§8.7.3)

En esquinas exteriores de losas apoyadas en muros de borde o vigas con $\alpha_f > 1.0$:
- Proveer refuerzo en la cara superior e inferior que resista $M_u/\text{m}$ igual al $M_u$ máximo positivo por unidad de ancho en el panel.
- Extensión desde la esquina: $\ell_{largo}/5$ en cada dirección.
- Refuerzo paralelo a la diagonal (arriba) y perpendicular a la diagonal (abajo), o dos capas paralelas a los bordes en cada cara.

### 6.3 Terminación del Refuerzo sin Vigas (§8.7.4.1.3 y Fig. 8.7.4.1.3)

- Las longitudes mínimas de extensión están establecidas en la Fig. 8.7.4.1.3.
- Al menos la mitad de las barras superiores de la franja de columna debe extenderse $\geq 5d$ más allá de la cara del apoyo (para interceptar posibles fisuras de punzonamiento en losas gruesas).
- En vanos adyacentes desiguales, las extensiones de refuerzo negativo se basan en el vano más largo.

### 6.4 Aberturas en la Losa (§8.5.4)

Las aberturas son permitidas si el análisis verifica resistencia y serviciabilidad. Sin análisis formal, se permiten si:
- En la zona de intersección de **dos franjas medias**: abertura de cualquier tamaño (sin compensación de refuerzo sí habrá que mantener el total del panel).
- En la intersección de **dos franjas de columna**: abertura $\leq 1/8$ del ancho de cada franja de columna; compensar el refuerzo interrumpido.
- En la intersección de **una franja de columna + una franja media**: no interrumpir más del $1/4$ del refuerzo de ninguna franja; compensar.
- Si la abertura está a menos de $4h$ del perímetro de columna: verificar cortante por punzonamiento según §22.6.4.3.

---

## 7. Deflexiones (§8.3.2, §24.2)

Si no se satisfacen los espesores mínimos de §8.3.1, calcular deflexiones según §24.2 verificando que no excedan los límites de Tabla 24.2.2.

**Momento de inercia efectivo (para losas no preesforzadas), §24.2.3.5:**

$$I_e = \frac{I_{cr}}{1 - \left[\dfrac{(2/3)M_{cr}}{M_a}\right]^2\!\left(1 - \dfrac{I_{cr}}{I_g}\right)} \quad \text{si } M_a > \tfrac{2}{3}M_{cr}$$

**Deflexión diferida (§24.2.4.1):**

$$\lambda_\Delta = \frac{\xi}{1 + 50\rho'} \tag{24.2.4.1.1}$$

| Duración de la carga sostenida (meses) | $\xi$ |
|---------------------------------------|-------|
| 3 | 1.0 |
| 6 | 1.2 |
| 12 | 1.4 |
| 60 o más | 2.0 |

**Tabla 24.2.2 — Deflexiones máximas permisibles:**

| Elemento | Condición | Deflexión a considerar | Límite |
|----------|-----------|----------------------|--------|
| Techos planos | Sin elementos no estructurales susceptibles a daño | Inmediata por máx($L_r$, $S$, $R$) | $\ell/180$ |
| Pisos | — | Inmediata por $L$ | $\ell/360$ |
| Techo o piso | Con elementos no estructurales, susceptibles a daño | Diferida + inmediata post-instalación | $\ell/480$ |
| Techo o piso | Con elementos no estructurales, no susceptibles a daño | Igual que arriba | $\ell/240$ |

---

## 8. Losas Preesforzadas (§8.3.4, §8.6.2)

- Las losas bidireccionales preesforzadas deben diseñarse como **Clase U** con $f_t \leq 0.5\sqrt{f'_c}$ (§8.3.4.1).
- Preesfuerzo efectivo mínimo: $A_{ps}f_{se}$ que provea al menos **0.9 MPa** de compresión promedio en toda sección transversal tributaria.
- Espaciado máximo de tendones: $\min(8h,\; 1.5\text{ m})$ en al menos una dirección.

---

## Notas

- La relación $\ell_{largo}/\ell_{corto}$ no debe exceder 2 para usar las tablas de espesor mínimo sin verificar deflexiones. Para relaciones mayores, usar las reglas de losa unidireccional (§7.3.1).
- La ecuación de $I_e$ revisada en el Código 2019 (Bischoff 2005) corrige la subestimación de deflexiones que ocurría con la ecuación de Branson (1965) para losas con bajo porcentaje de refuerzo.
- Para losas gruesas como losas de transferencia o mat foundations, se recomienda refuerzo continuo en ambas caras para mejorar la integridad estructural y el control de fisuras (R8.7.4.1.3).
