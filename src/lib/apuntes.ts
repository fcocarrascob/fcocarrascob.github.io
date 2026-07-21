import { getCollection } from 'astro:content';

// Apuntes se agrupa en dos familias: `libros` (clases destiladas de un libro) y
// `normativas` (lecturas didácticas de una norma). El orden aquí es el orden en
// que se muestran las secciones en /apuntes.
export const GROUPS = {
  libros: 'Libros',
  normativas: 'Normativas',
} as const;

export type GroupKey = keyof typeof GROUPS;

// Cada sub-sección es un libro o una norma. `group` la ubica en su familia;
// `label` = título corto mostrado en la galería; `author` va en el slot de
// "norma" del encabezado (autor del libro / organismo emisor de la norma);
// `description` es el resumen. Añadir uno nuevo = una entrada aquí + posts con
// ese `subsection`.
export const SUBSECTIONS = {
  'llm-from-scratch': {
    group: 'libros',
    label: 'Build a LLM from Scratch',
    author: 'Sebastian Raschka',
    description:
      'Apuntes didácticos del libro de Sebastian Raschka: construir un modelo de lenguaje grande desde cero, paso a paso — de los datos de texto al modelo GPT entrenado.',
  },
  'reasoning-from-scratch': {
    group: 'libros',
    label: 'Build a Reasoning Model from Scratch',
    author: 'Sebastian Raschka',
    description:
      'Apuntes didácticos del libro de Sebastian Raschka: cómo se construye un modelo de razonamiento desde cero — evaluación verificable, inference-time scaling, reinforcement learning y distillation — con un hilo propio: aplicar cada técnica al cálculo estructural.',
  },
  'hands-on-ml': {
    group: 'libros',
    label: 'Hands-On Machine Learning',
    author: 'Aurélien Géron',
    description:
      'Apuntes didácticos del libro de Aurélien Géron (3.ª ed.): los fundamentos del machine learning con Scikit-Learn, Keras y TensorFlow, concepto a concepto.',
  },
  'deep-learning-with-python': {
    group: 'libros',
    label: 'Deep Learning with Python',
    author: 'François Chollet & Matthew Watson',
    description:
      'Apuntes didácticos del libro de François Chollet y Matthew Watson (3.ª ed.): deep learning con Keras 3 sobre TensorFlow, PyTorch y JAX — de qué es el campo y sus bloques matemáticos hasta convnets, Transformers y modelos generativos.',
  },
  nch432: {
    group: 'normativas',
    label: 'NCh 432 — Cargas de viento',
    author: 'Instituto Nacional de Normalización (INN)',
    description:
      'Apuntes didácticos de la NCh 432:2025 (3.ª edición): cómo la norma convierte una velocidad de viento en una presión de diseño — zonificación, presión de velocidad, factores de exposición, ráfaga y cerramiento, y las presiones que llegan al edificio.',
    // Nota única: enlaza directo al post, sin página-galería. Para convertirla en
    // galería multi-nota (como los libros): quitar `post` y crear
    // `src/pages/apuntes/nch432/index.astro`.
    post: 'nch432-cargas-de-viento',
  },
  'puentes-grua': {
    group: 'normativas',
    label: 'Puentes grúa — cargas y viga carrilera',
    author: 'AISC Design Guide 7 · ASCE 7 · CMAA',
    description:
      'Apunte didáctico del diseño de edificios con puente grúa a partir de las referencias de uso corriente (AISC Design Guide 7, ASCE 7 §4.9 y CMAA 70/74): la carga móvil de las ruedas, los tres efectos dinámicos, la clase de servicio, la viga carrilera y la fatiga.',
    // Nota única (ver comentario en nch432).
    post: 'puentes-grua-cargas-viga-carrilera',
  },
} as const;

export type SubsectionKey = keyof typeof SUBSECTIONS;

// Sub-secciones de un grupo, en el orden en que aparecen en SUBSECTIONS.
export function getSubsectionsByGroup(group: GroupKey) {
  return Object.entries(SUBSECTIONS).filter(([, sub]) => sub.group === group);
}

// Destino de una sub-sección: la nota directa si es de nota única (`post`), o su
// página-galería (`/apuntes/<slug>`) si agrupa varias notas.
export function subsectionHref(slug: SubsectionKey): string {
  const sub = SUBSECTIONS[slug];
  return 'post' in sub && sub.post ? `/apuntes/${sub.post}` : `/apuntes/${slug}`;
}

// true si la sub-sección es una nota única (sin página-galería intermedia).
export function isSinglePost(slug: SubsectionKey): boolean {
  const sub = SUBSECTIONS[slug];
  return 'post' in sub && Boolean(sub.post);
}

export async function getAllApuntes() {
  const posts = await getCollection('apuntes', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getApuntesBySubsection(subsection: string) {
  const posts = await getAllApuntes();
  return posts.filter((post) => post.data.subsection === subsection);
}
