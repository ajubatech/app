import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: true, // Listen on all addresses
    port: 5173, // Default port
    strictPort: false, // Try another port if this one is in use
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: false,
  },
});