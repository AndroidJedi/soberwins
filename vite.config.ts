import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: 'soberwins.localhost',
    port: 5173,
    open: 'http://soberwins.localhost:5173/',
  },
});
