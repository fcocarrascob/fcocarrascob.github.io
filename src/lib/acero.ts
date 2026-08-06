import { getCollection } from 'astro:content';

export const SUBSECTIONS = {
  'aisc360-22': {
    label: 'Notas AISC 360-22',
    norm: 'AISC 360-22',
    description:
      'Notas y resúmenes de la norma AISC 360-22 (Specification for Structural Steel Buildings) para diseño de estructuras de acero.',
  },
  ejemplos: {
    label: 'Ejemplos de cálculo',
    norm: 'AISC 360-22',
    description:
      'Ejemplos trabajados paso a paso: diseño de elementos de acero según AISC 360-22, con la referencia normativa de cada ecuación y la verificación completa demanda–capacidad.',
  },
  predimensionamiento: {
    label: 'Predimensionamiento',
    norm: 'AISC 360-22 · NCh2369:2025',
    description:
      'Las ecuaciones de la norma despejadas hacia la variable que uno elige: qué pedirle a un ' +
      'perfil antes de calcularlo. Una servilleta acá es una ecuación despejada, no una regla de ' +
      'dedo, y siempre viaja con la condición que la habilita y con la medida de cuánto se ' +
      'desvía de la verificación completa.',
  },
  teoria: {
    label: 'Teoría y fenómenos',
    norm: 'Fenómenos y estados límite',
    description:
      'Cómo funciona lo que la norma prescribe: el fenómeno físico detrás de cada estado límite, con esquemas. Incluye lo que no es cláusula sino práctica del Manual, declarado como tal.',
  },
} as const;

export type SubsectionKey = keyof typeof SUBSECTIONS;

export async function getAllAceroPosts() {
  const posts = await getCollection('acero', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getAceroPostsBySubsection(subsection: string) {
  const posts = await getAllAceroPosts();
  return posts.filter((post) => post.data.subsection === subsection);
}
