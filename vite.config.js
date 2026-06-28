import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      input: 'index.dev.html'
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost/cloud',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
