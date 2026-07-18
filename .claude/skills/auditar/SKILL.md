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

## 4. Reportar al usuario

Resume en prosa: veredicto por post, los 🔴/🟠 en orden de severidad, y qué
recalculaste que sí cuadró. **No apliques fixes en esta pasada** — el usuario decide
qué se corrige. Si te pide aplicarlos, hazlo después y marca cada fila como
`✅ aplicado en <sha>` o `🚫 descartado (razón)` en `AUDIT.md`.
