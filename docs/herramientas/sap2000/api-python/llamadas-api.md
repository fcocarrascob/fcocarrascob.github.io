---
title: "API Python SAP2000 — Llamadas a la API"
type: guide
tags: [sap2000, python, comtypes, oapi, return-codes, byref, unidades]
created: 2026-05-20
updated: 2026-05-20
related:
  - index.md
  - conexion.md
  - backend-template.md
---

# API Python SAP2000 — Llamadas a la API

Con `SapModel` disponible, cada operación en SAP2000 es una llamada a un
método de alguna de sus sub-interfaces. Esta página explica los tres conceptos
fundamentales para usarlas correctamente: **return codes**, **parámetros ByRef**
y **unidades**.

---

## 1. Return codes

Cada método de la OAPI retorna un **entero** que indica si la operación tuvo
éxito:

| Valor | Significado |
|---|---|
| `0` | Éxito |
| `≠ 0` | Error (el modelo no cambió) |

```python
ret = SapModel.PropMaterial.SetMaterial("H30", 2)
# ret == 0  → material creado correctamente
# ret != 0  → algo falló (nombre duplicado, tipo inválido, etc.)
```

### Patrón `assert` (convención del proyecto)

Para scripts de automatización, la convención es verificar cada return code
con `assert`. Si falla, el mensaje de error identifica exactamente qué llamada
causó el problema:

```python
ret = SapModel.PropMaterial.SetMaterial("H30", 2)
assert ret == 0, f"SetMaterial falló (ret={ret})"

ret = SapModel.PropMaterial.SetOConcrete("H30", 25e3, False, 0, 1, 2, 0.003, 0.003)
assert ret == 0, f"SetOConcrete falló (ret={ret})"
```

> **Nota:** En producción, se pueden reemplazar los `assert` por condiciones
> `if` con manejo de errores más robusto. El patrón `assert` es conveniente
> para scripts de desarrollo y verificación rápida.

---

## 2. Parámetros de salida (ByRef)

Muchos métodos de la OAPI retornan datos a través de parámetros **ByRef**
(por referencia). En Python con `comtypes` la función retorna una **tupla**
(`raw`) con la siguiente disposición:

| Posición | Contenido |
|---|---|
| `raw[0]`, `raw[1]`, ... | Valores de salida ByRef (en orden de aparición en la firma) |
| `raw[-1]` | **Return code** — siempre el **último** elemento |

```python
# Método con un parámetro de salida:
# GetModelFilename(ByRef FileName As String) As Long
raw = SapModel.GetModelFilename()
filename  = raw[0]   # ByRef output: primer elemento
ret_code  = raw[-1]  # return code:  siempre el último
assert ret_code == 0, f"GetModelFilename falló (ret={ret_code})"

print(f"Archivo activo: '{filename}'")
```

> **Advertencia:** La convención es la inversa de lo que podría esperarse:
> el return code **no** es el primero — es el último. Usar siempre `raw[-1]`
> para verificar el éxito.

### Ejemplo: leer resultados de desplazamiento

```python
# Prepara el objeto de resultados
SapModel.Results.Setup.DeselectAllCasesAndCombosForOutput()
SapModel.Results.Setup.SetCaseSelectedForOutput("DEAD")

# Obtiene desplazamiento en nudo "1"
# Firma: JointDispl(Name, ItemTypeElm)
# raw = (obj[], elm[], loadCase[], stepType[], stepNum[],
#         U1[], U2[], U3[], R1[], R2[], R3[], ret_code)
raw = SapModel.Results.JointDispl("1", 0)
ret_code = raw[-1]   # return code: último elemento
assert ret_code == 0, f"JointDispl falló (ret={ret_code})"

# ByRef outputs empiezan en raw[0]
U1_values = raw[5]   # lista de desplazamientos en dirección 1
U2_values = raw[6]
U3_values = raw[7]

print(f"Desplazamiento U1: {U1_values[0]}")
```

> **Nota:** Los métodos que retornan arrays entregan listas de Python.
> Siempre revisar los wrappers verificados en `scripts/wrappers/` o los
> archivos en `API/` para conocer el orden exacto de los valores en `raw`.

---

## 3. Unidades

Antes de operar con el modelo, es buena práctica fijar las unidades activas
con `SetPresentUnits`. Esto afecta cómo se interpretan los valores numéricos
en todas las llamadas siguientes.

```python
# Fijar unidades a kN, m, °C
ret = SapModel.SetPresentUnits(6)
assert ret == 0, f"SetPresentUnits falló (ret={ret})"
```

### Tabla de unidades frecuentes (`eUnits`)

| Valor | Sistema |
|---|---|
| `1` | lb, in, °F |
| `2` | lb, ft, °F |
| `3` | kip, in, °F |
| `4` | kip, ft, °F |
| `5` | kN, mm, °C |
| `6` | kN, m, °C |
| `7` | kN, cm, °C |
| `8` | N, mm, °C |
| `9` | N, m, °C |
| `10` | tonf, mm, °C |
| `11` | tonf, m, °C |
| `12` | tonf, cm, °C |
| `13` | kgf, mm, °C |
| `14` | kgf, m, °C |
| `15` | kgf, cm, °C |

---

## 4. Ejemplos de llamadas comunes

### 4.1 Inicializar un modelo nuevo

```python
ret = SapModel.InitializeNewModel()
assert ret == 0, f"InitializeNewModel falló (ret={ret})"

ret = SapModel.File.NewBlank()
assert ret == 0, f"NewBlank falló (ret={ret})"

ret = SapModel.SetPresentUnits(6)   # kN, m, °C
assert ret == 0, f"SetPresentUnits falló (ret={ret})"
```

### 4.2 Definir un material de acero

```python
# Crear material con nombre "A36" y tipo 1 (Steel)
ret = SapModel.PropMaterial.SetMaterial("A36", 1)
assert ret == 0, f"SetMaterial falló (ret={ret})"

# Asignar propiedades isótropas (E, nu, alpha, G)
#   E=200e6 kN/m², nu=0.3, alpha=1.2e-5, G se calcula automáticamente con G=0
ret = SapModel.PropMaterial.SetMPIsotropic("A36", 200e6, 0.3, 1.2e-5)
assert ret == 0, f"SetMPIsotropic falló (ret={ret})"
```

### 4.3 Agregar una barra (frame element)

```python
# Firma: AddByCoord(x1, y1, z1, x2, y2, z2, Name, PropName, UserName, CSys)
#   Name="" → SAP2000 asigna el nombre automáticamente
# raw = (frame_name, ret_code)
#          ↑             ↑
#          raw[0]     raw[-1]
raw = SapModel.FrameObj.AddByCoord(0, 0, 0,  0, 0, 4,
                                   "", "BEAM_SEC", "", "Global")
frame_name = raw[0]   # nombre asignado por SAP2000
ret_code   = raw[-1]  # return code: último elemento
assert ret_code == 0, f"AddByCoord falló (ret={ret_code})"
print(f"Barra creada: {frame_name}")
```

### 4.4 Ejecutar el análisis

```python
# Bloquear el modelo antes de analizar
ret = SapModel.SetModelIsLocked(False)
assert ret == 0, "SetModelIsLocked falló"

ret = SapModel.Analyze.RunAnalysis()
assert ret == 0, f"RunAnalysis falló (ret={ret})"
print("Análisis completado.")
```

---

## 5. Dónde encontrar la documentación de cada método

Los archivos en la carpeta `API/` del proyecto documentan todas las
sub-interfaces disponibles. Por ejemplo:

| Archivo | Sub-interfaz |
|---|---|
| `API/Properties.md` | `PropMaterial`, `PropFrame`, `PropArea` |
| `API/Object_Model.md` | `FrameObj`, `AreaObj`, `PointObj` |
| `API/Analyze.md` | `Analyze` |
| `API/Analysis_Results.md` | `Results` |
| `API/Load_Patterns.md` | `LoadPatterns` |
| `API/Load_Cases.md` | `LoadCases` |

---

## Siguiente paso

Con los conceptos básicos claros, el siguiente paso es aprender a estructurar
un script completo usando el template de backend:
[Template Backend](backend-template.md).
