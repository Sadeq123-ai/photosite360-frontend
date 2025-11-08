import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Configuración crítica para UTF-8
    charset: 'utf8',
    minify: 'esbuild',
    target: 'esnext',
    // Forzar UTF-8 en todo el build
    esbuild: {
      charset: 'utf8'
    },
    // Configuración adicional para caracteres
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  // Configurar servidor de desarrollo
  server: {
    fs: {
      strict: false
    }
  },
  // Configuración global de encoding
  define: {
    'process.env': {}
  }
})