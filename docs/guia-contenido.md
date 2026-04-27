# Guía para agregar contenido

Esta guía explica paso a paso cómo agregar nuevas páginas Markdown y Jupyter Notebooks al sitio.

---

## Estructura del proyecto

```
docs/                    ← Todo el contenido va aquí
├── index.md             ← Página de inicio
├── hormigon/            ← Sección Hormigón
│   ├── index.md         ← Página principal de la sección
│   └── mi-pagina.md     ← Página de contenido
├── estanques/
├── sismo/
├── herramientas/
└── guia-contenido.md    ← Este archivo

mkdocs.yml               ← Configuración y navegación del sitio
requirements.txt         ← Dependencias Python
```

Cada vez que agregues un archivo `.md` o `.ipynb` en `docs/`, debes registrarlo también en la sección `nav:` de `mkdocs.yml`.

---

## 1. Agregar una página Markdown

### Paso 1 — Crear el archivo

Crea un archivo `.md` dentro de la carpeta de la sección correspondiente:

```
docs/
└── hormigon/
    └── aci-318-columnas.md    ← archivo nuevo
```

### Paso 2 — Copiar el template

Usa esta plantilla como punto de partida:

```markdown
# Título de la Página

Descripción breve del contenido de esta página.

## Primera sección

Texto de la primera sección.

## Segunda sección

Texto de la segunda sección.
```

### Paso 3 — Registrar en la navegación

Abre `mkdocs.yml` y agrega la página en la sección `nav:` correspondiente:

```yaml
nav:
  - Hormigón:
    - hormigon/index.md
    - Columnas ACI 318: hormigon/aci-318-columnas.md    # ← línea nueva
```

El texto a la izquierda (`Columnas ACI 318`) es lo que aparece en el menú. La ruta a la derecha es relativa a `docs/`.

---

## 2. Agregar un Jupyter Notebook

### Paso 1 — Copiar el notebook

Copia tu archivo `.ipynb` a la carpeta correspondiente dentro de `docs/`:

```
docs/
└── hormigon/
    └── columna_aci318.ipynb    ← notebook copiado
```

### Paso 2 — Registrar en la navegación

En `mkdocs.yml`, agrégalo igual que una página Markdown:

```yaml
nav:
  - Hormigón:
    - hormigon/index.md
    - Columna ACI 318 (notebook): hormigon/columna_aci318.ipynb    # ← línea nueva
```

!!! tip "El notebook se renderiza automáticamente"
    El plugin `mkdocs-jupyter` convierte el notebook a HTML al construir el sitio. No necesitas exportarlo manualmente.

!!! warning "Los notebooks no se ejecutan al construir"
    Las celdas no se ejecutan durante el build (`execute: false` en `mkdocs.yml`). Asegúrate de que el notebook ya tenga todas las salidas guardadas antes de copiarlo.

---

## 3. Elementos de contenido

### Fórmulas matemáticas (LaTeX)

**Fórmula en línea** — usar `\( ... \)`:

```markdown
El esfuerzo de corte es \( V_u = \phi V_n \), donde \( \phi = 0.75 \).
```

Resultado: El esfuerzo de corte es \( V_u = \phi V_n \), donde \( \phi = 0.75 \).

---

**Fórmula en bloque** — usar `\[ ... \]`:

```markdown
\[
V_n = \left( A_{cv} \left[ \lambda \rho_t f_y + \alpha_c \lambda \sqrt{f'_c} \right] \right)
\]
```

Resultado:

\[
V_n = \left( A_{cv} \left[ \lambda \rho_t f_y + \alpha_c \lambda \sqrt{f'_c} \right] \right)
\]

---

### Bloques de código Python

````markdown
```python
import forallpeople as si
si.environment('structural')

fc = 35 * si.MPa
fy = 420 * si.MPa
```
````

---

### Notas y advertencias (Admonitions)

```markdown
!!! note "Nota"
    Texto de la nota.

!!! warning "Advertencia"
    Texto de la advertencia.

!!! tip "Consejo"
    Texto del consejo.

!!! info "Información"
    Texto informativo.

!!! danger "Peligro"
    Texto de peligro.
```

Resultado:

!!! note "Nota"
    Texto de la nota.

!!! warning "Advertencia"
    Texto de la advertencia.

!!! tip "Consejo"
    Texto del consejo.

---

### Admonition colapsable

```markdown
??? note "Haz clic para expandir"
    Contenido oculto por defecto.
```

---

### Tablas

```markdown
| Símbolo | Descripción           | Unidad |
|---------|----------------------|--------|
| \( f'_c \) | Resistencia del hormigón | MPa    |
| \( f_y \)  | Límite de fluencia del acero | MPa |
| \( A_s \)  | Área de acero longitudinal | mm²  |
```

Resultado:

| Símbolo | Descripción | Unidad |
|---------|-------------|--------|
| \( f'_c \) | Resistencia del hormigón | MPa |
| \( f_y \) | Límite de fluencia del acero | MPa |
| \( A_s \) | Área de acero longitudinal | mm² |

---

### Pestañas (Tabs)

```markdown
=== "SI (kN, mm)"
    La carga \( P_u = 500 \text{ kN} \)

=== "Imperial (kip, in)"
    La carga \( P_u = 112 \text{ kip} \)
```

---

### Imágenes

Coloca la imagen en la misma carpeta del archivo `.md` y referenciala así:

```markdown
![Descripción de la imagen](nombre-imagen.png)
```

---

## 4. Previsualizar el sitio en local

Antes de hacer push, puedes ver el sitio en tu computador:

```powershell
# Instalar dependencias (solo la primera vez)
pip install -r requirements.txt

# Iniciar servidor local
mkdocs serve
```

Luego abre `http://127.0.0.1:8000` en tu navegador.

Cualquier cambio que hagas en los archivos se refleja automáticamente en el navegador.

---

## 5. Publicar cambios

El sitio se publica automáticamente con GitHub Actions cada vez que haces push a la rama `main`:

```powershell
git add .
git commit -m "Agrego página: ACI 318 columnas"
git push origin main
```

Después de unos segundos verás el sitio actualizado en `https://fcocarrascob.github.io`.

!!! warning "Configuración inicial de GitHub Pages"
    La primera vez debes configurar GitHub Pages en los ajustes del repositorio:
    
    1. Ve a **Settings → Pages** en tu repositorio en GitHub
    2. En **Source**, selecciona la rama `gh-pages`
    3. Guarda. El sitio estará disponible en `https://fcocarrascob.github.io`

---

## Resumen rápido

| Acción | Pasos |
|--------|-------|
| Nueva página Markdown | 1) Crear `.md` en `docs/seccion/` 2) Agregar en `nav:` de `mkdocs.yml` |
| Nuevo Notebook | 1) Copiar `.ipynb` en `docs/seccion/` 2) Agregar en `nav:` de `mkdocs.yml` |
| Nueva sección | 1) Crear carpeta en `docs/` 2) Crear `index.md` dentro 3) Agregar sección en `nav:` |
| Publicar | `git add . && git commit -m "..." && git push origin main` |
