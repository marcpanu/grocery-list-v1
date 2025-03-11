import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    commonjsOptions: {
      include: [],
    },
  },
  optimizeDeps: {
    disabled: false,
  },
  server: {
    port: 3000,
    strictPort: true,
  },
}); 