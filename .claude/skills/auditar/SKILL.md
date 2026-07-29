---
name: auditar
description: Audita uno o varios posts (.mdx) de struct/pad en consistencia numérica, léxica, de formato y de tesis, y registra el resultado en AUDIT.md. Úsalo antes de publicar un post nuevo, al cerrar un experimento, o para revisar posts del backlog. Acepta un slug, una ruta, "nuevos" (posts sin auditar) o nada (el post modificado en el working tree).
---

# Auditar posts de struct/pad

Orquesta la auditoría editorial y técnica de posts. El trabajo pesado lo hace el
subagente `auditor` (read-only); esta skill selecciona qué auditar, lo lanza y
consolida los reportes en `AUDIT.md`.

## 1. Resolver el alcance

Según `$ARGUMENTS`:

- **Vacío** → audita los `.mdx` bajo `src/content/` modificados o nuevos en el
  working tree (`git status --porcelain src/content/`). Si no hay ninguno, audita el
  post tocado en el último commit.
- **Un slug o ruta** (p. ej. `factor-r-omega0` o `src/content/blog/factor-r-omega0.mdx`)
  → ese post. Resuelve el slug con `Glob` sobre `src/content/**/<slug>.mdx`.
- **`nuevos`** → todos los posts que **no** aparecen en la tabla de cobertura de
  `AUDIT.md`.
- **Varios slugs** → todos ellos.

## 2. Lanzar el auditor

Un subagente `auditor` **por post**, en paralelo (hasta ~5 a la vez). Pásale la ruta
absoluta del post, la fecha de hoy y el sha corto de `git rev-parse --short HEAD`.

El auditor es read-only por diseño: devuelve el bloque de reporte, no escribe. Esto
evita que varios auditores en paralelo se pisen en `AUDIT.md`, y evita que "corrija"
un número que en realidad venía correcto del modelo SAP2000.

## 3. Consolidar en AUDIT.md

Por cada reporte recibido:

1. **Inserta el bloque tal cual** al comienzo de la sección `## Registro de
   auditorías` (más reciente arriba). No reescribas los hallazgos del auditor: son
   el registro.
2. **Actualiza la tabla de cobertura** (`## Cobertura`): fecha de última auditoría,
   veredicto y hallazgos abiertos del post.

Si un post ya fue auditado antes, el nuevo bloque **no reemplaza** al anterior — se
apila encima. El historial de auditorías es el punto del archivo.

## 4. Ofrecer la planilla del canvas

Cada reporte trae una línea **Planilla del canvas**. Para cada post marcado `sí` o
`parcial` que **no** tenga planilla todavía, **ofrécela — no la generes sin preguntar**:
un ejemplo de cálculo sin planilla no es un defecto, y el usuario decide caso a caso.

Preséntalo junto al resumen de la auditoría, en una línea por post: cuántas
verificaciones cubriría y qué números habría que declarar como dato de entrada.

Si acepta, la convención es:

1. El JSON va en **`public/planillas/<slug>.json`**, con el mismo slug del post. Ahí se
   acumulan: son archivos sueltos descargables, **no** plantillas de
   `worksheet-templates.ts` (esa galería es otra cosa y no crece con cada ejemplo).
2. Formato: `{version, meta:{titulo, ficha, esperadoFalso}, regions:[…]}`. Regiones
   apiladas en una columna (`x: 40`, `y` cada 46), con encabezados `text` separando
   bloques: datos de entrada primero y todos a la vista, nunca incrustados en una
   fórmula. Las regiones `math` usan `nombre := expr` para definir y un `=` final para
   mostrar; `= unidad` convierte con chequeo dimensional.
3. **Debe reproducir exactamente los números del post.** Verifícala con
   `npm run verify:planilla -- public/planillas/<slug>.json --md` y compara la salida
   contra las tablas del post. Los `false` legítimos —los que son el hallazgo del
   ejemplo, no un defecto— se declaran en `meta.esperadoFalso` con su razón.
4. Enlázala desde el post con `/herramientas/canvas?planilla=<slug>`, que la importa
   directo (`MathCanvas.tsx` hace el fetch; el slug se valida contra `[a-z0-9-]`).

Si el post ya tiene planilla, **verifícala de nuevo** en esta pasada: si el post cambió
sus números, la planilla es la que dice si siguen cuadrando.

## 5. Reportar al usuario

Resume en prosa: veredicto por post, los 🔴/🟠 en orden de severidad, y qué
recalculaste que sí cuadró. **No apliques fixes en esta pasada** — el usuario decide
qué se corrige. Si te pide aplicarlos, hazlo después y marca cada fila como
`✅ aplicado en <sha>` o `🚫 descartado (razón)` en `AUDIT.md`.
