---
title: "API Python SAP2000 — Introducción"
type: guide
tags: [sap2000, python, comtypes, oapi, automatizacion]
created: 2026-05-20
updated: 2026-05-20
related:
  - conexion.md
  - llamadas-api.md
  - backend-template.md
  - gui-template.md
---

# API Python SAP2000 — Introducción

SAP2000 expone una **Open API (OAPI)** que permite controlar el programa
completamente desde código Python: crear modelos, asignar cargas, ejecutar
análisis y extraer resultados, todo de forma programática.

---

## 1. ¿Qué es la OAPI?

La OAPI de SAP2000 es una interfaz **COM (Component Object Model)** que
expone el objeto principal `SapObject`, desde el cual se accede a todo el
modelo. En Python se usa la biblioteca `comtypes` para conectarse a ese
objeto COM.

La jerarquía de acceso es:

```
comtypes.client
    └── sap_object          (CSI.SAP2000.API.SapObject)
            └── SapModel    (cSapModel)
                    ├── PropMaterial    → materiales
                    ├── PropFrame       → secciones de barra
                    ├── PropArea        → secciones de área
                    ├── FrameObj        → barras (frame elements)
                    ├── AreaObj         → áreas (shell elements)
                    ├── PointObj        → nudos
                    ├── LoadPatterns    → patrones de carga
                    ├── LoadCases       → casos de carga
                    ├── Analyze         → análisis
                    ├── Results         → resultados
                    └── File            → guardar/abrir modelo
```

> **Nota:** Toda la interacción ocurre a través de `SapModel`. El objeto
> `sap_object` sólo se usa para conectar/desconectar y obtener metadatos
> como la versión de la API.

---

## 2. Requisitos

| Requisito | Versión mínima | Notas |
|---|---|---|
| Sistema operativo | Windows 10/11 | COM es exclusivo de Windows |
| SAP2000 | v22 o superior | Instalado y con licencia activa |
| Python | 3.10+ | 64-bit recomendado |
| `comtypes` | 1.2+ | `pip install comtypes` |
| `PySide6` | 6.5+ | Solo para GUI — `pip install PySide6` |

### Instalación mínima

```bash
pip install comtypes
```

### Instalación completa (backend + GUI)

```bash
pip install comtypes PySide6
```

---

## 3. Flujo de trabajo general

Un script Python que usa la OAPI sigue siempre esta secuencia:

```
1. Conectar     → obtener sap_object → obtener SapModel
2. Operar       → crear/modificar el modelo usando SapModel.*
3. Desconectar  → liberar la referencia COM
```

> **Advertencia:** Si el script termina abruptamente sin desconectar, la
> referencia COM queda activa pero Python ya no puede usarla. Siempre usar
> `try/finally` para garantizar la desconexión.

---

## 4. Arquitectura del proyecto

Para proyectos más complejos, este proyecto organiza el código en dos capas:

| Capa | Archivo | Responsabilidad |
|---|---|---|
| **Backend** | `backend_{nombre}.py` | Conexión COM + lógica SAP2000 |
| **Frontend** | `gui_{nombre}.py` | Interfaz gráfica PySide6 |

Ambas capas parten de templates base ubicados en `scripts/templates/`:

- `backend_template.py` — template del backend
- `gui_template.py` — template de la GUI

---

## 5. Contenido de esta sección

| Página | Tema |
|---|---|
| [Conexión y Desconexión](conexion.md) | Cómo conectarse a SAP2000 y liberar la referencia COM |
| [Llamadas a la API](llamadas-api.md) | Patrón de return codes, parámetros ByRef, unidades |
| [Template Backend](backend-template.md) | Cómo adaptar `backend_template.py` a un script propio |
| [Template GUI](gui-template.md) | Cómo adaptar `gui_template.py` a una GUI standalone |
