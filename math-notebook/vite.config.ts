import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  // En desarrollo usa '/', en producción usa la ruta de GitHub Pages
  base: command === 'build' ? '/canvas-notepad/' : '/',
  build: {
    // El build se deposita en docs/canvas-notepad/ para que MkDocs lo sirva
    outDir: '../docs/canvas-notepad',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
}))
