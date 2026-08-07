// @ts-check
import { defineConfig } from 'astro/config';
import mermaid from 'astro-mermaid';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { unified } from '@astrojs/markdown-remark';

export default defineConfig({
  site: 'https://fcocarrascob.github.io',
  // La serie «Placas base» vivía en /blog con `section: "Acero"` — una sección
  // fantasma de dos posts al lado de /acero, que es la sección real. Se movió a
  // la colección `acero` (teoría a /acero/teoria, el ejemplo a /acero/ejemplos)
  // y estas dos rutas quedan por los enlaces ya publicados. Con salida estática
  // y sin adapter, Astro emite una página HTML con `meta refresh` por cada una.
  redirects: {
    '/blog/placas-base-sap2000': '/acero/placas-base-sap2000',
    '/blog/placa-base-ejemplo-trabajado': '/acero/placa-base-ejemplo-trabajado',
  },
  // mermaid() debe ir antes de mdx() para interceptar los bloques ```mermaid
  integrations: [
    mermaid({
      theme: 'neutral',
      mermaidConfig: {
        flowchart: { curve: 'basis', nodeSpacing: 30, rankSpacing: 36 },
      },
    }),
    mdx(),
    react(),
  ],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
      // Renombra el heading auto-generado de los footnotes GFM ([^n]) que usamos
      // como bibliografía. Ver estilos en src/styles/global.css ([data-footnotes]).
      remarkRehype: { footnoteLabel: 'Bibliografía', footnoteBackContent: '↩' },
    }),
    shikiConfig: {
      theme: 'github-light',
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});