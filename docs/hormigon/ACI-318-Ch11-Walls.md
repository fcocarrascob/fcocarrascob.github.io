---
title: "ACI 318-25 Cap. 11 — Muros de Hormigón Armado"
type: formula
standard_ref: "ACI-318-25"
chapter: "11"
section: "11.3–11.8"
variables: [Pn, Vn, Mn, Pu, Vu, Mu, Acv, Ag, rho_l, rho_t, f_c, f_yt, h, l_c, k, alpha_c, lambda, I_cr]
units: "SI"
tags: [muros, paredes, corte-en-plano, esbeltez, hormigón, ACI-318]
related:
  - ACI-318-Ch21-PhiFactors.md
  - ACI-318-Ch22-SectionalStrength.md
  - ACI-318-Ch18-SpecialWalls.md
created: 2026-05-05
updated: 2026-05-05
---

# ACI 318-25 Cap. 11 — Muros de Hormigón Armado (No Sísmicos)

## Fuente
ACI CODE-318-25: Capítulo 11, §11.3–11.8 (Páginas 179–188)

> **Alcance:** Muros de carga y no portantes, vaciados en sitio y prefabricados (incluyendo tilt-up). Los muros estructurales especiales (sísmicos) se rigen por [Cap. 18 §18.10](ACI-318-Ch18-SpecialWalls.md).

---

## 1. Espesores Mínimos (§11.3)

**Tabla 11.3.1.1 — Espesores mínimos h**

| Tipo de muro | Espesor mínimo h |
|---|---|
| **Portante (bearing)** | Mayor entre: 100 mm ó ℓc/25 (menor entre altura y longitud no soportada) |
| **No portante (nonbearing)** | Mayor entre: 100 mm ó ℓc/30 (menor entre altura y longitud no soportada) |
| **Sótano exterior y fundación** | 190 mm |

> Nota: Los valores de sótano y fundación aplican solo a muros diseñados por el método simplificado §11.5.3.

---

## 2. Resistencia a Flexión y Carga Axial (§11.5.2 y §11.5.3)

### 2.1 Método General (§11.5.2)

Para muros portantes:
$$\phi P_n \geq P_u, \quad \phi M_n \geq M_u$$

$P_n$ y $M_n$ se calculan con el diagrama de interacción (§22.4), igual que columnas. Los efectos de esbeltez se amplifican según §6.6.4, §6.7 o §6.8.

Para muros **no portantes**: $M_n$ se calcula según §22.3 (solo flexión).

### 2.2 Método Simplificado para Flexión Fuera del Plano (§11.5.3)

**Aplicable si:** la resultante de todas las cargas factoradas cae dentro del tercio medio del espesor (excentricidad ≤ h/6), y la sección es rectangular sólida.

$$P_n = 0.55 f'_c A_g \left[ 1 - \left( \frac{k \ell_c}{32h} \right)^2 \right] \tag{11.5.3.1}$$

**Variables:**
| Símbolo | Descripción | Unidad |
|---------|------------|--------|
| $f'_c$ | Resistencia a compresión del concreto | MPa |
| $A_g$ | Área bruta de la sección transversal del muro | mm² |
| $k$ | Factor de longitud efectiva (Tabla 11.5.3.2) | — |
| $\ell_c$ | Longitud vertical no soportada del muro | mm |
| $h$ | Espesor del muro | mm |

**Tabla 11.5.3.2 — Factor k**

| Condición de borde | k |
|---|---|
| Arriostrado en top y bottom, restringido contra rotación en uno o ambos extremos | **0.8** |
| Arriostrado en top y bottom, sin restricción de rotación en ambos extremos | **1.0** |
| No arriostrado contra traslación lateral | **2.0** |

Reducción: $\phi = 0.65$ (compresión controlada, §21.2.2).

---

## 3. Resistencia a Corte en el Plano (§11.5.4)

### 3.1 Límite Máximo
$$V_n \leq 0.66 \sqrt{f'_c} \, A_{cv} \tag{11.5.4.2}$$

### 3.2 Fórmula General
$$V_n = \left( \alpha_c \lambda \sqrt{f'_c} + \rho_t f_{yt} \right) A_{cv} \tag{11.5.4.3}$$

donde $\alpha_c$ depende de la relación altura/longitud:

| $h_w/\ell_w$ | $\alpha_c$ |
|---|---|
| ≤ 1.5 | **0.25** |
| ≥ 2.0 | **0.17** |
| 1.5 < $h_w/\ell_w$ < 2.0 | interpolación lineal |

**Variables:**
| Símbolo | Descripción | Unidad |
|---------|------------|--------|
| $\alpha_c$ | Factor que depende de $h_w/\ell_w$ | — |
| $\lambda$ | Factor de peso del concreto (1.0 para concreto normal, §19.2.4) | — |
| $\rho_t$ | Cuantía de refuerzo horizontal (transversal) | — |
| $f_{yt}$ | Tensión de fluencia del refuerzo transversal | MPa |
| $A_{cv}$ | Área bruta de la sección de corte ($\ell_w \times h$) | mm² |
| $h_w$ | Altura total del muro | mm |
| $\ell_w$ | Longitud horizontal del muro | mm |

### 3.3 Muro con Tracción Neta (§11.5.4.4)
Si el muro tiene tracción axial neta ($N_u$ negativo):
$$\alpha_c = 2 \left(1 + \frac{N_u}{3.5 A_g}\right) \geq 0.0 \tag{11.5.4.4}$$

### 3.4 Corte Fuera del Plano (§11.5.5)
$V_n$ se calcula por §22.5 (igual que vigas).

---

## 4. Refuerzo Mínimo (§11.6)

### 4.1 Caso con Baja Demanda de Corte: $V_u \leq 0.5\phi\,\alpha_c\lambda\sqrt{f'_c}\,A_{cv}$

**Tabla 11.6.1 — Cuantías mínimas**

| Tipo de muro | Tipo de refuerzo | Tamaño de barra/malla | $f_y$ (MPa) | $\rho_\ell$ mín (long.) | $\rho_t$ mín (trans.) |
|---|---|---|---|---|---|
| Vaciado en sitio | Barras corrugadas | ≤ No. 16 | ≥ 420 | 0.0012 | 0.0020 |
| Vaciado en sitio | Barras corrugadas | ≤ No. 16 | < 420 | 0.0015 | 0.0025 |
| Vaciado en sitio | Barras corrugadas | > No. 16 | cualquier | 0.0015 | 0.0025 |
| Vaciado en sitio | Malla electrosoldada | ≤ MW200/MD200 | cualquier | 0.0012 | 0.0020 |
| Prefabricado | Barras o malla | cualquier | cualquier | 0.0010 | 0.0010 |

> $\rho_\ell$ = cuantía vertical (longitudinal), $\rho_t$ = cuantía horizontal (transversal).

### 4.2 Caso con Alta Demanda de Corte: $V_u > 0.5\phi\,\alpha_c\lambda\sqrt{f'_c}\,A_{cv}$

Ambas condiciones deben satisfacerse:

**(a)** Cuantía vertical mínima:
$$\rho_\ell \geq 0.0025 + 0.5 \left(2.5 - \frac{h_w}{\ell_w}\right)(\rho_t - 0.0025) \tag{11.6.2}$$
con $\rho_\ell \geq 0.0025$ y sin superar el $\rho_t$ requerido por resistencia.

**(b)** Cuantía horizontal mínima: $\rho_t \geq 0.0025$

> Nota: Para $h_w/\ell_w \leq 0.5$, el refuerzo vertical iguala al horizontal. Para $h_w/\ell_w \geq 2.5$, el mínimo vertical es 0.0025.

---

## 5. Detallado del Refuerzo (§11.7)

### 5.1 Espaciado de Barras Longitudinales (verticales) — §11.7.2

**Muros vaciados en sitio:**
- $s \leq \text{menor de}\ (3h,\ 450\ \text{mm})$
- Si se requiere refuerzo de corte en plano: $s \leq \ell_w/3$

**Muros con espesor > 250 mm** (excepto sótano de un piso y muros de contención): colocar al menos **2 capas de refuerzo**, una cerca de cada cara.

### 5.2 Espaciado de Barras Transversales (horizontales) — §11.7.3

**Muros vaciados en sitio:**
- $s \leq \text{menor de}\ (3h,\ 450\ \text{mm})$
- Si se requiere refuerzo de corte en plano: $s \leq \ell_w/5$

### 5.3 Soporte Lateral del Refuerzo Longitudinal (§11.7.5)

Si $A_{st} > 0.01\,A_g$ y el refuerzo longitudinal trabaja en compresión → se requieren estribos transversales de soporte.

### 5.4 Refuerzo alrededor de Aberturas (§11.7.6)

En adición al mínimo del §11.6:
- Muros con **2 capas**: agregar ≥ 2 barras No. 16 alrededor de cada abertura (ventana, puerta)
- Muros con **1 capa**: agregar ≥ 1 barra No. 16
- Estas barras deben desarrollar $f_y$ en tensión en las esquinas de la abertura.

---

## 6. Método Alternativo para Muros Esbeltos Fuera del Plano (§11.8)

### 6.1 Condiciones de Aplicabilidad (§11.8.1.1)

(a) Sección constante en toda la altura  
(b) Muro controlado por tensión para momento fuera del plano  
(c) $\phi M_n \geq M_{cr}$ (con $f_r$ según §19.2.3)  
(d) $P_u$ en punto medio ≤ $0.06 f'_c A_g$  
(e) Deflexión bajo cargas de servicio $\Delta_s \leq \ell_c/150$ (incluye efectos P-Δ)

### 6.2 Momento Último Amplificado por P-Δ (§11.8.3)

**Método iterativo:**
$$M_u = M_{ua} + P_u \Delta_u \tag{11.8.3.1a}$$

donde la deflexión última es:
$$\Delta_u = \frac{5 M_u \ell_c^2}{(0.75)(48) E_c I_{cr}} \tag{11.8.3.1b}$$

**Método directo:**
$$M_u = \frac{M_{ua}}{1 - \dfrac{5 P_u \ell_c^2}{(0.75)(48) E_c I_{cr}}} \tag{11.8.3.1d}$$

**Momento de inercia fisurado:**
$$I_{cr} = \frac{E_s}{E_c} \left( A_s + \frac{P_u}{f_y} \cdot \frac{h}{2d} \right)(d - c)^2 + \frac{\ell_w c^3}{3} \tag{11.8.3.1c}$$
con $E_s/E_c \geq 6$.

**Variables adicionales:**
| Símbolo | Descripción | Unidad |
|---------|------------|--------|
| $M_{ua}$ | Momento factorizado sin efectos P-Δ, en punto medio | N·mm |
| $\Delta_u$ | Deflexión máxima bajo cargas últimas | mm |
| $\ell_c$ | Altura libre (longitud no soportada) del muro | mm |
| $I_{cr}$ | Momento de inercia fisurado | mm⁴ |
| $A_{se,w}$ | Área efectiva de refuerzo longitudinal | mm² |
| $c$ | Profundidad del eje neutro | mm |

---

## Ejemplo de Uso

**Diseño simplificado de muro portante:**
- h = 200 mm, ℓc = 3 m, k = 0.8, f'c = 25 MPa, Ag = 200 × 1000 = 200,000 mm²
$$P_n = 0.55 \times 25 \times 200{,}000 \times \left[1 - \left(\frac{0.8 \times 3000}{32 \times 200}\right)^2\right]$$
$$P_n = 2{,}750{,}000 \times [1 - (0.375)^2] = 2{,}750{,}000 \times 0.859 = 2{,}362{,}500\ \text{N} = 2{,}362\ \text{kN}$$
$$\phi P_n = 0.65 \times 2{,}362 = 1{,}535\ \text{kN/m}$$
