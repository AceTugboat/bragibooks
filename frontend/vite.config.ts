import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    manifest: 'manifest.json',
    outDir: resolve(__dirname, '../static/dist'),
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/main.tsx'),
      },
    },
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': 'http://web:8000',
      '/asin-search': 'http://web:8000',
      '/static/images': 'http://web:8000',
    },
  },
})
