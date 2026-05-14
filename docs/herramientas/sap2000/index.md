---
title: "Herramientas SAP2000"
type: tool
tags: [sap2000, section-designer, momento-curvatura, interaccion-pm]
created: 2026-05-14
updated: 2026-05-14
---

# Herramientas SAP2000

Herramientas para visualizar resultados del **Section Designer de SAP2000**. Pega los datos exportados directamente y genera los gráficos en el navegador, sin necesidad de Python ni Jupyter.

---

## Herramientas disponibles

| Herramienta | Descripción |
|---|---|
| [Momento-Curvatura](MomentoCurvatura.md) | Diagrama Momento-Curvatura con factores $\phi$ aplicados y cálculo del factor de ductilidad $FU$ |
| [Interacción P-M](InteraccionPM.md) | Diagramas de interacción P-M3 y P-M2 para columnas (curvas a 0°, 90°, 180° y 270°) |

---

## Formato de datos

Ambas herramientas leen datos exportados del Section Designer de SAP2000 en **formato de texto separado por tabulaciones (TSV)**, con la **coma (`,`) como separador decimal** (formato chileno/europeo). El flujo de trabajo es:

1. En SAP2000, selecciona los datos en la ventana del Section Designer
2. Copia al portapapeles (`Ctrl+C`)
3. Pega en el área de texto de la herramienta (`Ctrl+V`)
4. Presiona **Graficar**

> **Nota:** Los cálculos se realizan completamente en el navegador. Ningún dato se envía a ningún servidor.
