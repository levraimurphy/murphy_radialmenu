import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base relative ('./') = chemins d'assets relatifs, indispensables en NUI.
// Sortie dans build/ (servie par le fxmanifest : ui_page 'ui/build/index.html').
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { outDir: 'build', emptyOutDir: true },
});
