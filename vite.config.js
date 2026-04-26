import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api/frankfurter': {
        target: 'https://api.frankfurter.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/frankfurter/, '')
      },
      '/api/twelvedata': {
        target: 'https://api.twelvedata.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/twelvedata/, '')
      }
    }
  }
})
