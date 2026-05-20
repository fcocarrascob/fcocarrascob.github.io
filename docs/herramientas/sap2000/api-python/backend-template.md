---
title: "API Python SAP2000 — Template Backend"
type: guide
tags: [sap2000, python, comtypes, backend, template, dataclass]
created: 2026-05-20
updated: 2026-05-20
related:
  - index.md
  - conexion.md
  - llamadas-api.md
  - gui-template.md
---

# API Python SAP2000 — Template Backend

El archivo `backend_template.py` es la plantilla base para cualquier script
que automatice SAP2000 con COM directo. Esta página explica su anatomía y
cómo adaptarlo a un script propio.

> **Nota:** Este template es para conexión COM directa (standalone), **no**
> para scripts ejecutados a través del MCP server.

---

## 1. Estructura del template

El archivo tiene tres bloques principales:

```
backend_template.py
├── SapConnection   → maneja conectar/desconectar COM
├── MyConfig        → dataclass con los parámetros de entrada
└── MyBackend       → lógica del script (método run)
```

---

## 2. `SapConnection` — conexión COM

`SapConnection` encapsula las llamadas a `comtypes.client` y expone una
interfaz simple con dos métodos: `connect` y `disconnect`.

```python
class SapConnection:

    def connect(self, attach_to_existing: bool = True) -> dict:
        # attach_to_existing=True → se adjunta a SAP2000 ya abierto
        # Retorna: {"connected": True, "version": "...", "model_path": "..."}
        #       o: {"connected": False, "error": "..."}
        ...

    def disconnect(self) -> dict:
        # Libera las referencias COM (no cierra SAP2000)
        # Retorna: {"disconnected": True}
        ...

    @property
    def is_connected(self) -> bool: ...

    @property
    def sap_model(self): ...   # acceso directo a SapModel
```

Internamente, `connect` usa `GetActiveObject` para adjuntarse a una instancia
existente, o el flujo `CreateObject → ApplicationStart` para lanzar una nueva.
Ver [Conexión y Desconexión](conexion.md) para los detalles.

---

## 3. `MyConfig` — parámetros de entrada

Es un **dataclass** de Python que agrupa todos los parámetros que el script
necesita. Usar un dataclass en lugar de variables sueltas o `**kwargs` tiene
tres ventajas:

- Tipado explícito (Python sabe qué tipo espera cada campo)
- Valores por defecto claros
- Fácil de serializar / pasar a la GUI

```python
from dataclasses import dataclass

@dataclass
class MyConfig:
    param_1: float = 1.0
    param_2: float = 2.0
    param_3: str = "DEFAULT"
```

### Cómo renombrar y agregar campos

Renombrar la clase y los campos según el dominio del script. Por ejemplo,
para un script que genera una viga simple:

```python
@dataclass
class VigaConfig:
    longitud:   float = 6.0     # m
    seccion:    str   = "W310X97"
    carga_dist: float = 10.0    # kN/m
    carga_punt: float = 50.0    # kN (en el centro)
    unidades:   int   = 6       # kN, m, °C (eUnits = 6)
```

---

## 4. `MyBackend` — lógica del script

`MyBackend` recibe una `SapConnection` en su constructor y expone un método
`run(config)` que ejecuta la lógica del script y retorna un `dict` de
resultados.

```python
class MyBackend:

    def __init__(self, connection: SapConnection):
        self._conn = connection

    @property
    def sap_model(self):
        # Lanza RuntimeError si no hay conexión activa
        if not self._conn.is_connected:
            raise RuntimeError("No hay conexión con SAP2000.")
        return self._conn.sap_model

    def run(self, config: MyConfig) -> dict:
        SapModel = self.sap_model
        result = {}
        # ... tareas numeradas ...
        result["success"] = True
        return result
```

### El patrón de tareas numeradas

Dentro de `run`, la convención es dividir la lógica en **tareas numeradas**
con comentarios que actúan como separadores visuales:

```python
def run(self, config: VigaConfig) -> dict:
    SapModel = self.sap_model
    result = {}

    # ── Task 1: Inicializar ──────────────────────────────────────────
    ret = SapModel.InitializeNewModel()
    assert ret == 0, f"InitializeNewModel falló (ret={ret})"

    ret = SapModel.File.NewBlank()
    assert ret == 0, f"NewBlank falló (ret={ret})"

    ret = SapModel.SetPresentUnits(config.unidades)
    assert ret == 0, f"SetPresentUnits falló (ret={ret})"
    result["task_1_init"] = True

    # ── Task 2: Material ─────────────────────────────────────────────
    ret = SapModel.PropMaterial.SetMaterial("A36", 1)
    assert ret == 0, f"SetMaterial falló (ret={ret})"
    result["task_2_material"] = "A36"

    # ── Task 3: Sección ──────────────────────────────────────────────
    # ...

    result["success"] = True
    return result
```

---

## 5. Pasos de adaptación

### Paso 1: Copiar y renombrar el archivo

```
scripts/templates/backend_template.py
           ↓ copiar como
scripts/mi_proyecto/backend_viga.py
```

### Paso 2: Renombrar las clases

```python
# Antes:
class MyConfig: ...
class MyBackend: ...

# Después:
class VigaConfig: ...
class VigaBackend: ...
```

### Paso 3: Definir los campos del Config

Reemplazar `param_1`, `param_2`, `param_3` con los parámetros reales del
script, con tipos y valores por defecto apropiados.

### Paso 4: Implementar `run()`

Copiar las tareas del script verificado (o escribirlas desde cero) dentro
del método `run`, usando:

- `config.campo` en lugar de variables globales
- `self.sap_model` en lugar de `SapModel` global
- El dict `result` local para acumular los resultados

### Paso 5: Verificar con el bloque `__main__`

El template incluye un bloque de prueba al final del archivo. Actualizar los
valores del `Config` y ejecutar el archivo directamente para verificar:

```python
if __name__ == "__main__":
    conn = SapConnection()
    res = conn.connect(attach_to_existing=True)
    print(f"Conexión: {res}")

    if res.get("connected"):
        backend = VigaBackend(conn)
        config = VigaConfig(longitud=6.0, seccion="W310X97")
        try:
            output = backend.run(config)
            import json
            print(json.dumps(output, indent=2, ensure_ascii=False))
        finally:
            conn.disconnect()
```

---

## Siguiente paso

Con el backend listo, se puede envolver en una interfaz gráfica usando
el template de GUI: [Template GUI](gui-template.md).
