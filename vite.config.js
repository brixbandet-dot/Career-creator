import { defineConfig } from 'vite';

// base './' lets the built game run from any folder, including GitHub Pages.
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 2000 },
  test: { include: ['tests/**/*.test.js'] },
});
