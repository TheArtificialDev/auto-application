import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    emptyOutDir: false,
    rollupOptions: {
      input: {
        content: 'src/content/index.tsx'
      },
      output: {
        entryFileNames: 'assets/[name].js',
        inlineDynamicImports: true,
      }
    }
  }
});
