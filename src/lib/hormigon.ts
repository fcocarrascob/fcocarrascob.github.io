import { getCollection } from 'astro:content';

export const SUBSECTIONS = {
  'aci318-25': {
    label: 'Notas ACI 318-25',
    norm: 'ACI 318-25',
    description:
      'Notas y resúmenes de la norma ACI 318-25 para diseño de estructuras de hormigón armado.',
  },
} as const;

export type SubsectionKey = keyof typeof SUBSECTIONS;

export async function getAllHormigonPosts() {
  const posts = await getCollection('hormigon', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getHormigonPostsBySubsection(subsection: string) {
  const posts = await getAllHormigonPosts();
  return posts.filter((post) => post.data.subsection === subsection);
}
