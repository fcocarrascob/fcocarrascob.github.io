---
title: "Notepad de Cálculos"
type: tool
tags: [notepad, calculadora, mathjs, interactivo, unidades]
created: 2026-05-03
updated: 2026-05-03
---

# Notepad de Cálculos

Herramienta de cálculo interactiva impulsada por **[math.js](https://mathjs.org/)** que permite escribir expresiones con unidades físicas y obtener resultados renderizados como ecuaciones tipografiadas.

---

## Herramientas disponibles

- **[Notepad Interactivo](Notepad.md)** — Calculadora de propósito general con dos modos: evaluación línea por línea en tiempo real y modo bloque. Variables persisten entre líneas. Soporta unidades SI y USC.
- **[Ejemplo — Viga ACI 318](EjemploVigaACI.md)** — Calculadora de diseño de viga rectangular simplemente apoyada según ACI 318-25, con solicitaciones, área de acero requerida, verificaciones normativas y diagramas de $M(x)$ y $V(x)$.

---

## Sintaxis básica

La calculadora usa la sintaxis de math.js. Los puntos clave:

### Asignaciones y expresiones

```
L = 6 m              # asigna variable con unidades
wD = 15 kN/m         # admite unidades compuestas
wu = 1.2 * wD        # opera con variables definidas antes
Mu = wu * L^2 / 8    # potencias con ^
```

### Unidades soportadas (ejemplos)

| Magnitud | Unidades aceptadas |
|----------|--------------------|
| Longitud | `m`, `cm`, `mm`, `ft`, `in` |
| Fuerza | `N`, `kN`, `MN`, `lbf`, `kip` |
| Tensión / Presión | `Pa`, `kPa`, `MPa`, `GPa`, `psi`, `ksi` |
| Momento | `N*m`, `kN*m`, `kip*ft` |
| Masa | `kg`, `ton`, `lb` |

### Funciones matemáticas

```
sqrt(2)        # raíz cuadrada
abs(-5)        # valor absoluto
sin(pi/6)      # funciones trigonométricas (argumento en radianes)
cos(30 deg)    # alternativamente en grados
log(100, 10)   # logaritmo en base 10
max(a, b)      # máximo de dos valores
```

### Comentarios

Cualquier texto después de `#` en una línea es ignorado por el evaluador:

```
R = D / 2    # radio interior
```

### Secciones (modo bloque)

En el modo "Bloque de Texto", las líneas que comienzan con `##` crean encabezados en el documento de resultados:

```
## Geometría
D = 10 m
H = 8 m

## Hidrostática
p = rho * g * H
```

---

> **Nota:** Los cálculos se realizan completamente en el navegador. Ningún dato se envía a ningún servidor.
