import { getCollection } from 'astro:content';

// Cada sub-sección es un libro. `label` = título corto mostrado en la galería;
// `author` va en el slot de "norma" del encabezado; `description` es el resumen.
// Añadir un libro nuevo = una entrada aquí + posts con ese `subsection`.
export const SUBSECTIONS = {
  'llm-from-scratch': {
    label: 'Build a LLM from Scratch',
    author: 'Sebastian Raschka',
    description:
      'Apuntes didácticos del libro de Sebastian Raschka: construir un modelo de lenguaje grande desde cero, paso a paso — de los datos de texto al modelo GPT entrenado.',
  },
  'reasoning-from-scratch': {
    label: 'Build a Reasoning Model from Scratch',
    author: 'Sebastian Raschka',
    description:
      'Apuntes didácticos del libro de Sebastian Raschka: cómo se construye un modelo de razonamiento desde cero — evaluación verificable, inference-time scaling, reinforcement learning y distillation — con un hilo propio: aplicar cada técnica al cálculo estructural.',
  },
  'hands-on-ml': {
    label: 'Hands-On Machine Learning',
    author: 'Aurélien Géron',
    description:
      'Apuntes didácticos del libro de Aurélien Géron (3.ª ed.): los fundamentos del machine learning con Scikit-Learn, Keras y TensorFlow, concepto a concepto.',
  },
  'deep-learning-with-python': {
    label: 'Deep Learning with Python',
    author: 'François Chollet & Matthew Watson',
    description:
      'Apuntes didácticos del libro de François Chollet y Matthew Watson (3.ª ed.): deep learning con Keras 3 sobre TensorFlow, PyTorch y JAX — de qué es el campo y sus bloques matemáticos hasta convnets, Transformers y modelos generativos.',
  },
} as const;

export type SubsectionKey = keyof typeof SUBSECTIONS;

export async function getAllApuntes() {
  const posts = await getCollection('apuntes', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getApuntesBySubsection(subsection: string) {
  const posts = await getAllApuntes();
  return posts.filter((post) => post.data.subsection === subsection);
}
