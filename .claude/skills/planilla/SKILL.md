---
name: planilla
description: Escribe o corrige una planilla del canvas (public/planillas/*.json) — la hoja de cálculo paramétrica que acompaña a un ejemplo de cálculo. Úsala cuando haya que crear una planilla nueva, adaptar una existente, o convertir a planilla los números de un post. Acepta un slug, una ruta a un .json, o la descripción del elemento a calcular.
---

# Escribir una planilla del canvas

Una planilla es una hoja de `/herramientas/canvas` serializada: `{version, meta, regions}`.
Su gracia es ser **paramétrica y verificable** — al editar un dato de entrada todo se
recalcula, y un motor fuera del navegador comprueba que las unidades cuadran.

## 1. Lee el contrato antes de escribir

**`docs/ESQUEMA-PLANILLA.md`** es la referencia única: la gramática de `src`, los cuatro
`kind`, las unidades y funciones disponibles, el orden de evaluación y los footguns
registrados. Léelo entero. No escribas una región de memoria.

Si vas a tocar una planilla existente, mira además una publicada de la misma familia en
`public/planillas/` — hay 29, y la convención de encabezados y de orden ya está fijada.

## 2. Reglas que no se negocian

- **Una sola columna** (`x: 40`, `y` cada 46). El scope se resuelve en orden de lectura;
  dos columnas cruzan las filas y producen «variable indefinida».
- **Los datos de entrada, todos arriba y a la vista.** Nunca un número incrustado dentro de
  una fórmula: eso mata lo paramétrico, que es el punto.
- **Toda ecuación y todo coeficiente sale del PDF de la norma**, con su número de ecuación y
  edición, según la regla de `CLAUDE.md`. Aplica igual aquí que en un post: la planilla es
  una fuente de números, no un borrador.
- **Ids únicos y estables.** `meta.esperadoFalso` se indexa por id. Reserva el prefijo `c_`
  para las verificaciones que contrastan contra un número publicado.
- **Debe reproducir exactamente los números de su post**, si acompaña a uno.

## 3. Cierra con el verificador — siempre

Una planilla no está lista hasta que esto pasa:

```bash
npm run verify:planilla -- <ruta.json> --md
```

Con `--md` imprime el desarrollo y los veredictos como tablas; compáralas contra las del
post. **No declares la planilla terminada sin haber corrido esto y visto la salida.** El
error típico no es aritmético sino de transcripción, y la aritmética cierra consigo misma:
ninguna lectura del resultado lo encuentra.

Los `false` legítimos —los que son el hallazgo del ejemplo, no un defecto— se declaran en
`meta.esperadoFalso` con la razón escrita.

## 4. Dónde queda

- **Acompaña a un post** → `public/planillas/<slug>.json`, con el slug del post sin el
  prefijo `ejemplo-`. El enlace aparece solo (`src/lib/planillas.ts`) y el deep-link
  `/herramientas/canvas?planilla=<slug>` la importa al abrir.
- **Es un borrador de la conversación** → déjala en el scratchpad de la sesión y dile al
  usuario que la pegue en el canvas con «Pegar JSON» o Ctrl+V.

No la agregues a `worksheet-templates.ts`: esa galería son plantillas compiladas al bundle
y no crece con cada ejemplo.

## 5. Si además hay un esquema

Una región `image` que apunte a `/esquemas/<slug>.svg` recibe el scope de la hoja y sustituye
sus tokens `{{expr}}`. Un token sin resolver hace fallar el verificador. Detalles en la
sección 7 del contrato.
