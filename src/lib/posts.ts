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
