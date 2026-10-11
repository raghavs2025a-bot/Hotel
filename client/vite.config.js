import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development the API is proxied so the HTTP-only auth cookie stays same-origin.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
});
