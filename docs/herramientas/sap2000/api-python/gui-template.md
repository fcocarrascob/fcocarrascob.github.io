---
title: "API Python SAP2000 — Template GUI"
type: guide
tags: [sap2000, python, pyside6, gui, template, qthread, workers]
created: 2026-05-20
updated: 2026-05-20
related:
  - index.md
  - backend-template.md
---

# API Python SAP2000 — Template GUI

El archivo `gui_template.py` es la plantilla base para crear una interfaz
gráfica (GUI) standalone que controla SAP2000 a través de un backend. Está
construida con **PySide6** y sigue un patrón de **Workers** para mantener la
GUI responsiva durante las operaciones SAP2000.

> **Requisito previo:** Tener listo el backend correspondiente
> ([Template Backend](backend-template.md)) antes de adaptar la GUI.

---

## 1. Estructura del template

```
gui_template.py
├── Workers                     → operaciones SAP2000 en hilos separados
│   ├── ConnectWorker           → ejecuta conn.connect()
│   ├── RunWorker               → ejecuta backend.run(config)
│   └── DisconnectWorker        → ejecuta conn.disconnect()
├── _field()                    → helper para crear pares (QLabel, QLineEdit)
└── MainWindow (QWidget)        → ventana principal
        ├── _build_config()     → lee inputs → crea Config
        ├── _format_result()    → formatea dict resultado → texto para el log
        ├── _busy()             → habilita/deshabilita botones
        └── _set_connected()    → actualiza indicador de estado
```

---

## 2. Por qué se usan Workers (`QThread`)

Las llamadas a SAP2000 vía COM pueden tardar varios segundos. Si se ejecutan
en el hilo principal de Qt, la ventana se congela (no responde a clicks ni
actualiza la pantalla) hasta que terminan.

Los **Workers** son objetos `QThread` que ejecutan la operación en un hilo
separado y emiten una señal `finished(dict)` cuando terminan. El hilo
principal sólo se ocupa de actualizar la GUI al recibir esa señal.

```
Hilo GUI (Qt)              Hilo Worker
─────────────              ─────────────────────────────
btn_connect.click()
  → _on_connect()
  → _busy(True)            ConnectWorker.run()
  → worker.start() ──────────────────────────────────→
                                 conn.connect(...)
                           ←──────────────────────────
  ← worker.finished(result)
  → _on_connect_done(result)
  → _set_connected(True)
  → _busy(False)
```

### Los tres Workers

```python
class ConnectWorker(QThread):
    finished = Signal(dict)   # emite el resultado de conn.connect()

    def run(self):
        result = self._conn.connect(attach_to_existing=True)
        self.finished.emit(result)


class RunWorker(QThread):
    finished = Signal(dict)   # emite el resultado de backend.run(config)

    def run(self):
        try:
            result = self._backend.run(self._config)
        except Exception as exc:
            result = {"success": False, "error": str(exc)}
        self.finished.emit(result)


class DisconnectWorker(QThread):
    finished = Signal(dict)   # emite el resultado de conn.disconnect()

    def run(self):
        result = self._conn.disconnect()
        self.finished.emit(result)
```

---

## 3. `MainWindow` — ventana principal

La ventana sigue un layout vertical fijo con cinco zonas:

```
┌─────────────────────────────────────────┐
│ Estado: desconectado                    │  ← indicador rojo/verde
├─────────────────────────────────────────┤
│        [ Conectar a SAP2000 ]           │  ← btn_connect
├─────────────────────────────────────────┤
│  Parámetros de entrada                  │  ← QGroupBox + QGridLayout
│   Param 1: [____]   Param 2: [____]    │
│   Nombre:  [____]                       │
├─────────────────────────────────────────┤
│        [      Ejecutar      ]           │  ← btn_run (deshabilitado hasta conectar)
├─────────────────────────────────────────┤
│  Salida                                 │  ← QGroupBox
│   (log de texto, Consolas 9pt)          │
├─────────────────────────────────────────┤
│    [ Desconectar de SAP2000 ]           │  ← btn_disconnect
└─────────────────────────────────────────┘
```

---

## 4. Métodos clave a adaptar

### `_build_config()`

Lee los valores de los `QLineEdit` y construye el `Config` del backend.
Es el único método que necesita cambiar para conectar los inputs de la GUI
con los parámetros del backend:

```python
# Template original:
def _build_config(self) -> MyConfig:
    return MyConfig(
        param_1=float(self._input_param1.text()),
        param_2=float(self._input_param2.text()),
        param_3=self._input_param3.text(),
    )

# Ejemplo adaptado para VigaBackend:
def _build_config(self) -> VigaConfig:
    return VigaConfig(
        longitud=float(self._input_longitud.text()),
        seccion=self._input_seccion.text(),
        carga_dist=float(self._input_q.text()),
        carga_punt=float(self._input_p.text()),
    )
```

### `_format_result()`

Controla cómo se muestra el resultado en el log de texto. Por defecto imprime
el dict como JSON, pero se puede personalizar para resaltar los valores más
importantes:

```python
# Template original (JSON completo):
def _format_result(self, data: dict) -> str:
    return json.dumps(data, indent=2, ensure_ascii=False)

# Ejemplo adaptado:
def _format_result(self, data: dict) -> str:
    if not data.get("success"):
        return f"ERROR: {data.get('error', 'desconocido')}"
    lines = [
        f"Deflexión máxima:  {data['deflexion_max']:.4f} m",
        f"Momento máximo:    {data['momento_max']:.2f} kN·m",
        f"Nudo crítico:      {data['nudo_critico']}",
    ]
    return "\n".join(lines)
```

### `_busy()`

Deshabilita todos los botones mientras un Worker está activo, evitando que
el usuario lance operaciones concurrentes:

```python
def _busy(self, is_busy: bool):
    self._btn_connect.setEnabled(not is_busy and not self._conn.is_connected)
    self._btn_run.setEnabled(not is_busy and self._conn.is_connected)
    self._btn_disconnect.setEnabled(not is_busy and self._conn.is_connected)
```

---

## 5. Pasos de adaptación

### Paso 1: Copiar y renombrar el archivo

```
scripts/templates/gui_template.py
           ↓ copiar como
scripts/mi_proyecto/gui_viga.py
```

### Paso 2: Actualizar el import del backend

```python
# Antes:
from backend_template import SapConnection, MyBackend, MyConfig

# Después:
from backend_viga import SapConnection, VigaBackend, VigaConfig
```

### Paso 3: Actualizar el título de la ventana

```python
self.setWindowTitle("SAP2000 — Viga Simple")
```

### Paso 4: Reemplazar los inputs

En el constructor de `MainWindow`, reemplazar el bloque de inputs con los
campos del `Config`. Usar `_field(label, default, tooltip)` para cada campo:

```python
# Eliminar:
lbl, self._input_param1 = _field("Param 1", "1.0", ...)
lbl, self._input_param2 = _field("Param 2", "2.0", ...)
lbl, self._input_param3 = _field("Nombre", "DEFAULT", ...)

# Agregar:
lbl, self._input_longitud = _field("Longitud (m)", "6.0", "Longitud de la viga")
grid.addWidget(lbl, r, 0); grid.addWidget(self._input_longitud, r, 1)

lbl, self._input_seccion = _field("Sección", "W310X97", "Nombre de sección en SAP2000")
grid.addWidget(lbl, r, 2); grid.addWidget(self._input_seccion, r, 3)
r += 1

lbl, self._input_q = _field("Carga dist. (kN/m)", "10.0", "Carga distribuida")
grid.addWidget(lbl, r, 0); grid.addWidget(self._input_q, r, 1)
```

### Paso 5: Actualizar `_build_config()` y `_format_result()`

Adaptar ambos métodos según el `Config` del backend y los resultados que
devuelve `run()` (ver sección 4 arriba).

### Paso 6: Actualizar los Workers con el tipo correcto

En `_on_run`, actualizar la creación del `RunWorker` con las clases correctas:

```python
def _on_run(self):
    try:
        config = self._build_config()
    except ValueError as e:
        self._log_append(f"Error en inputs: {e}")
        return
    self._log_append("Ejecutando...")
    self._busy(True)
    self._worker = RunWorker(self._backend, config)   # mismo patrón
    self._worker.finished.connect(self._on_run_done)
    self._worker.start()
```

### Paso 7: Ejecutar

```bash
python gui_viga.py
```

---

## Ejemplo: ventana completa mínima

```python
# gui_viga.py — versión mínima sin Workers (solo para referencia didáctica)
import sys
from PySide6.QtWidgets import QApplication, QWidget, QVBoxLayout, QPushButton, QTextEdit
from backend_viga import SapConnection, VigaBackend, VigaConfig

class VigaGUI(QWidget):
    def __init__(self):
        super().__init__()
        self._conn = SapConnection()
        self._backend = VigaBackend(self._conn)

        layout = QVBoxLayout(self)
        self._btn = QPushButton("Conectar y ejecutar")
        self._log = QTextEdit(); self._log.setReadOnly(True)
        layout.addWidget(self._btn); layout.addWidget(self._log)
        self._btn.clicked.connect(self._run)

    def _run(self):
        res = self._conn.connect()
        if res["connected"]:
            config = VigaConfig(longitud=6.0)
            output = self._backend.run(config)
            self._log.append(str(output))
            self._conn.disconnect()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    w = VigaGUI(); w.show()
    sys.exit(app.exec())
```

> **Nota:** Esta versión sin Workers congela la GUI durante la ejecución.
> Para uso real, siempre usar el patrón de Workers del template completo.
