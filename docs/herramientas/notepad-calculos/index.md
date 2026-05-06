---
title: "Notepad de Cálculos"
type: tool
tags: [hoja-de-calculo, calculadora, mathjs, mathlive, interactivo]
created: 2026-05-03
updated: 2026-05-06
---

# Notepad de Cálculos

Herramientas de cálculo interactivas impulsadas por **[math.js](https://mathjs.org/)** y **[MathLive](https://cortexjs.io/mathlive/)**.

---

## Herramientas disponibles

- **[MathSheet — Hoja de Cálculo](MathSheet.md)** — Canvas 2D con bloques arrastrables tipo SMath Studio / Mathcad. Posiciona bloques de cálculo, texto y sección sobre una cuadrícula de 40 px. Las expresiones se evalúan de arriba hacia abajo, izquierda a derecha, compartiendo un scope de variables. Estado persistido automáticamente en el navegador.

---

## Sintaxis básica

La hoja usa la sintaxis de **math.js**. Los puntos clave:

### Asignaciones y expresiones

Escribe en los bloques de cálculo con tipografía WYSIWYG (MathLive):

``````
L = 6 m              # asigna variable con unidades
wD = 15 kN/m         # admite unidades compuestas
wu = 1.2 * wD        # opera con variables definidas antes
Mu = wu * L^2 / 8    # potencias con ^
``````

### Unidades soportadas (ejemplos)

| Magnitud | Unidades aceptadas |
|---|---|
| Longitud | ``m``, ``cm``, ``mm``, ``ft``, ``in`` |
| Fuerza | ``N``, ``kN``, ``MN``, ``lbf``, ``kip`` |
| Tensión / Presión | ``Pa``, ``kPa``, ``MPa``, ``GPa``, ``psi`` |
| Momento | ``N*m``, ``kN*m``, ``kip*ft`` |
| Masa | ``kg``, ``ton``, ``lb`` |

---

> **Nota:** Los cálculos se realizan completamente en el navegador. Ningún dato se envía a ningún servidor.
