import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
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
        target: 'http://hostshield_api:3000', // Docker service name
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
