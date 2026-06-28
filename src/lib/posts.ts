import { getCollection } from 'astro:content';

export async function getAllPosts() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getPostsByTag(tag: string) {
  const posts = await getAllPosts();
  return posts.filter((post) => post.data.tags.includes(tag));
}

export async function getPostsBySection(section: string) {
  const posts = await getAllPosts();
  return posts.filter((post) => post.data.section === section);
}

/** Posts de una serie, ordenados por `seriesPart` ascendente. */
export async function getSeries(name: string) {
  const posts = await getAllPosts();
  return posts
    .filter((p) => p.data.series === name)
    .sort((a, b) => (a.data.seriesPart ?? 0) - (b.data.seriesPart ?? 0));
}

type PostGroup = {
  kind: 'series' | 'section';
  name: string;
  posts: Awaited<ReturnType<typeof getAllPosts>>;
};

/**
 * Agrupa los posts para el listado de Notas:
 *   - cada `series` es un grupo, ordenado por `seriesPart`
 *   - el resto se agrupa por `section` (o "Otros"), ordenado por fecha
 * Los grupos se ordenan por su post más reciente (la serie activa arriba).
 */
export async function getPostGroups(): Promise<PostGroup[]> {
  const posts = await getAllPosts(); // ya viene por pubDate desc
  const series = new Map<string, typeof posts>();
  const sections = new Map<string, typeof posts>();

  for (const p of posts) {
    if (p.data.series) {
      const arr = series.get(p.data.series) ?? [];
      arr.push(p);
      series.set(p.data.series, arr);
    } else {
      const key = p.data.section ?? 'Otros';
      const arr = sections.get(key) ?? [];
      arr.push(p);
      sections.set(key, arr);
    }
  }

  const latest = (ps: typeof posts) =>
    Math.max(...ps.map((p) => p.data.pubDate.valueOf()));

  const groups: (PostGroup & { _latest: number })[] = [
    ...[...series.entries()].map(([name, ps]) => ({
      kind: 'series' as const,
      name,
      posts: ps.sort((a, b) => (a.data.seriesPart ?? 0) - (b.data.seriesPart ?? 0)),
      _latest: latest(ps),
    })),
    ...[...sections.entries()].map(([name, ps]) => ({
      kind: 'section' as const,
      name,
      posts: ps,
      _latest: latest(ps),
    })),
  ];

  groups.sort((a, b) => b._latest - a._latest);
  return groups.map(({ _latest, ...g }) => g);
}

export type SeriesNav = {
  name: string;
  part: number;
  total: number;
  prev: { id: string; title: string; part: number } | null;
  next: { id: string; title: string; part: number } | null;
} | null;

/** Navegación anterior/siguiente dentro de la serie de un post. */
export async function getSeriesNav(postId: string): Promise<SeriesNav> {
  const posts = await getAllPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post?.data.series) return null;

  const series = await getSeries(post.data.series);
  const idx = series.findIndex((p) => p.id === postId);
  const at = (p: (typeof series)[number]) => ({
    id: p.id,
    title: p.data.title,
    part: p.data.seriesPart ?? 0,
  });

  return {
    name: post.data.series,
    part: post.data.seriesPart ?? idx + 1,
    total: series.length,
    prev: idx > 0 ? at(series[idx - 1]) : null,
    next: idx < series.length - 1 ? at(series[idx + 1]) : null,
  };
}
