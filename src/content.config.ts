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

export const collections = { blog, hormigon, acero, geotecnia, apuntes };
