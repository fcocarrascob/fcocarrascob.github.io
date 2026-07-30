import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    norm: z.string().optional(),
    section: z.string().optional(),
    // Serie de posts encadenados (p.ej. el experimento de fundaciones). `series`
    // agrupa; `seriesPart` ordena dentro del grupo (1, 2, 3, …).
    series: z.string().optional(),
    seriesPart: z.number().optional(),
  }),
});

// `tema` es la familia de elemento o problema (Vigas, Conexiones, Losas…), y es
// el eje por el que se filtran los listados de ejemplos. Es deliberadamente más
// grueso que `chapter`: el capítulo es casi 1:1 con el ejemplo, así que filtrar
// por él daría un chip por post. El vocabulario se declara acá, en el
// frontmatter, y no se deduce del capítulo — un ejemplo nuevo trae su tema y no
// hay un mapa central que se pueda olvidar de actualizar.
const hormigon = defineCollection({
  loader: glob({ base: './src/content/hormigon', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    subsection: z.string(),
    chapter: z.string().optional(),
    tema: z.string().optional(),
  }),
});

const acero = defineCollection({
  loader: glob({ base: './src/content/acero', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    subsection: z.string(),
    chapter: z.string().optional(),
    tema: z.string().optional(),
  }),
});

// Geotecnia: a diferencia de `hormigon` y `acero`, esta sección no cuelga de una
// norma sino de métodos con autor y año (Terzaghi 1943, Meyerhof 1963, …). Por eso
// `chapter` guarda el método o el capítulo de origen, y `source` deja la
// trazabilidad al libro y la edición — que acá es dato crítico, no adorno.
const geotecnia = defineCollection({
  loader: glob({ base: './src/content/geotecnia', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    subsection: z.string(),
    chapter: z.string().optional(),
    source: z.string().optional(),
    tema: z.string().optional(),
    // Posición en el arco de lectura. La taxonomía de subsecciones es temática
    // y no coincide con el orden en que la serie se construye, así que la
    // secuencia se declara acá en vez de dejarla implícita en la fecha.
    order: z.number().optional(),
  }),
});

// Apuntes de libros: clases didácticas destiladas desde el "cerebro"
// (repo material_teorico). `subsection` = slug del libro (keys en
// src/lib/apuntes.ts → SUBSECTIONS); `chapter` ordena y titula dentro del
// libro; `source` deja la trazabilidad al capítulo/páginas de origen.
const apuntes = defineCollection({
  loader: glob({ base: './src/content/apuntes', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    subsection: z.string(),
    chapter: z.string().optional(),
    source: z.string().optional(),
  }),
});

// Lab: la bitácora didáctica de los productos que se construyen en `struct_llm`
// (una entrada por etapa cerrada: teoría del libro + cláusula + medición + el
// camino falso). **El contenido vive fuera de este repo, a propósito**: este
// repo es público, y `draft: true` esconde la página del sitio pero no el
// archivo del repo. Apuntando `base` al repo privado, el contenido no puede
// filtrarse — no se puede commitear un archivo que no está en este árbol.
// Las rutas de /lab además están guardadas con `import.meta.env.DEV`.
// Si la carpeta no existe (CI, otra máquina), la colección queda vacía y no
// pasa nada.
const lab = defineCollection({
  loader: glob({
    base: '../struct_llm/lab',
    pattern: ['**/*.{md,mdx}', '!_*', '!README.md'],
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    // Etapa del roadmap que la entrada documenta (O1, E5, D2…) y el producto al
    // que pertenece: son los dos ejes por los que se agrupa el listado.
    etapa: z.string(),
    producto: z.string(),
    libro: z.string().optional(),
    norma: z.string().optional(),
  }),
});

export const collections = { blog, hormigon, acero, geotecnia, apuntes, lab };
