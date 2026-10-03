import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// In development, Vite serves the React app and forwards /api/* to the Flask server
// (python -m backend.app, port 5001). In production Vercel does the same routing.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:5001',
    },
  },
  test: {
    environment: 'node',
  },
});
