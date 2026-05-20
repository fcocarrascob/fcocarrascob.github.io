---
title: "API Python SAP2000 — Conexión y Desconexión"
type: guide
tags: [sap2000, python, comtypes, conexion, oapi]
created: 2026-05-20
updated: 2026-05-20
related:
  - index.md
  - llamadas-api.md
  - backend-template.md
---

# API Python SAP2000 — Conexión y Desconexión

El primer paso para controlar SAP2000 desde Python es obtener una referencia
al objeto COM principal. Esta página explica cómo conectarse, validar la
conexión y liberar la referencia al terminar.

---

## 1. El objeto raíz: `SapObject`

Todo comienza con `comtypes.client`, que permite obtener el objeto COM
registrado por SAP2000 con el `ProgID`:

```
"CSI.SAP2000.API.SapObject"
```

Desde ese objeto se obtiene `SapModel`, que es la interfaz que se usa para
todas las operaciones del modelo.

---

## 2. Modos de conexión

Existen dos modos:

| Modo | Cuándo usarlo |
|---|---|
| **Adjuntarse a instancia existente** | SAP2000 ya está abierto con un modelo cargado |
| **Lanzar nueva instancia** | Se quiere abrir SAP2000 desde el script sin intervención manual |

### 2.1 Adjuntarse a una instancia existente (modo habitual)

```python
import comtypes.client

# Obtiene el objeto COM de la instancia de SAP2000 ya en ejecución
sap_object = comtypes.client.GetActiveObject("CSI.SAP2000.API.SapObject")

# Obtiene la interfaz principal del modelo
SapModel = sap_object.SapModel
```

> **Nota:** `GetActiveObject` lanza `OSError` si SAP2000 no está abierto.
> Siempre envolver en `try/except`.

### 2.2 Lanzar una nueva instancia

```python
import comtypes.client
import comtypes.gen.SAP2000v1

# Crea el helper de SAP2000 y lanza la aplicación
helper = comtypes.client.CreateObject("SAP2000v1.Helper")
helper = helper.QueryInterface(comtypes.gen.SAP2000v1.cHelper)

sap_object = helper.CreateObjectProgID("CSI.SAP2000.API.SapObject")
sap_object.ApplicationStart()

SapModel = sap_object.SapModel
```

> **Advertencia:** Este modo requiere que la biblioteca de tipos COM de
> SAP2000 (`SAP2000v1`) esté registrada en el sistema (ocurre automáticamente
> con la instalación de SAP2000).

---

## 3. Validar la conexión

Tras conectar, conviene verificar la versión y el modelo activo:

```python
# Versión de la API
version = sap_object.GetOAPIVersionNumber()
print(f"SAP2000 OAPI versión: {version}")

# Ruta del modelo activo (cadena vacía si no hay modelo guardado)
model_path = SapModel.GetModelFilename()
print(f"Modelo activo: {model_path}")
```

---

## 4. Desconexión (liberar la referencia COM)

Desconectar consiste en liberar las referencias Python al objeto COM.
**Esto no cierra SAP2000**: sólo hace que Python deje de tener acceso.

```python
# Liberar referencias
SapModel = None
sap_object = None
```

> **Nota:** En `comtypes`, al asignar `None` se decrementa el contador de
> referencias COM. SAP2000 sigue abierto e interactivo para el usuario.

---

## 5. Patrón completo con manejo de errores

El patrón recomendado usa `try/finally` para garantizar la desconexión:

```python
import comtypes.client

sap_object = None
SapModel = None

try:
    # 1. Conectar
    sap_object = comtypes.client.GetActiveObject("CSI.SAP2000.API.SapObject")
    SapModel = sap_object.SapModel

    version = sap_object.GetOAPIVersionNumber()
    print(f"Conectado — OAPI v{version}")

    # 2. Operar con SapModel...
    # ret = SapModel.PropMaterial.SetMaterial(...)

except OSError as e:
    print(f"No se pudo conectar a SAP2000: {e}")
except Exception as e:
    print(f"Error durante la ejecución: {e}")
    raise
finally:
    # 3. Siempre desconectar
    SapModel = None
    sap_object = None
    print("Desconectado.")
```

---

## 6. La clase `SapConnection`

El template del proyecto encapsula este patrón en la clase `SapConnection`
definida en `backend_template.py`. Usarla directamente evita repetir el código
de conexión en cada script:

```python
from backend_template import SapConnection

conn = SapConnection()

# Conectar
result = conn.connect(attach_to_existing=True)
# result == {"connected": True, "version": "...", "model_path": "..."}

if result["connected"]:
    SapModel = conn.sap_model   # acceso a la interfaz del modelo
    # ... operar ...

# Desconectar
conn.disconnect()
# conn.sap_model queda None; SAP2000 sigue abierto
```

Ver [Template Backend](backend-template.md) para la documentación completa
de `SapConnection`.

---

## Siguiente paso

Con la conexión establecida, el siguiente paso es aprender cómo funcionan
las llamadas individuales a la API: [Llamadas a la API](llamadas-api.md).
