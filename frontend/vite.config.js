
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // list the backend endpoints your frontend will call
      '/split': 'http://localhost:5000',
      '/merge': 'http://localhost:5000',
      '/pdf-to-images-convert': 'http://localhost:5000',
      '/images-to-pdf': 'http://localhost:5000',
      '/pdf-to-docx-convert': 'http://localhost:5000',
      '/pdf-to-text-convert': 'http://localhost:5000',
      '/compress': 'http://localhost:5000'
      // add others if you call them
    }
  }
})
