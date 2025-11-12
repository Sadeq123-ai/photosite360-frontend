import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  build: {
    // ✅ TU CONFIGURACIÓN UTF-8 (MANTENIDA)
    charset: 'utf8',
    target: 'esnext',
    
    // ✅ OPTIMIZACIÓN: Cambiar a terser para mejor compresión
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Eliminar console.log en producción
        drop_debugger: true
      }
    },
    
    // ✅ OPTIMIZACIÓN: Tamaño de chunk warning
    chunkSizeWarningLimit: 1000,
    
    // ✅ TU CONFIGURACIÓN UTF-8 esbuild (MANTENIDA)
    esbuild: {
      charset: 'utf8'
    },
    
    // ✅ TU CONFIGURACIÓN + OPTIMIZACIONES (COMBINADAS)
    rollupOptions: {
      output: {
        // Tu configuración de nombres (MANTENIDA)
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        
        // ✅ OPTIMIZACIÓN AÑADIDA: Code Splitting
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-map': ['leaflet'],
          'vendor-ui': ['lucide-react', 'react-hot-toast'],
          'vendor-utils': ['axios']
        }
      }
    },
    
    // ✅ OPTIMIZACIÓN: Source maps solo en desarrollo
    sourcemap: false
  },
  
  // ✅ TU CONFIGURACIÓN (MANTENIDA)
  server: {
    fs: {
      strict: false
    },
    // ✅ OPTIMIZACIÓN AÑADIDA
    port: 5173,
    strictPort: false,
    host: true,
    open: false
  },
  
  // ✅ OPTIMIZACIÓN AÑADIDA: Preview config
  preview: {
    port: 4173,
    strictPort: false,
    host: true,
    open: false
  },
  
  // ✅ TU CONFIGURACIÓN (MANTENIDA)
  define: {
    'process.env': {}
  },
  
  // ✅ OPTIMIZACIÓN AÑADIDA: Dependency pre-bundling
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'leaflet',
      'axios',
      'react-hot-toast',
      'lucide-react'
    ]
  }
})