import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Default to localhost:3000 for local development
  // In Docker, this should be set to http://hostshield_api:3000
  const apiTarget = process.env.VITE_API_TARGET || 'http://localhost:3000';

  return {
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.js',
    },
    server: {
      host: true, // Needed for Docker
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        }
      }
    }
  };
})
