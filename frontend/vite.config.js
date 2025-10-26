import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Output directory
    outDir: 'dist',
    // Generate source maps for debugging
    sourcemap: false,
    // Minify output
    minify: 'terser',
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion'],
          'utils-vendor': ['axios']
        }
      }
    }
  },
  // Server configuration
  server: {
    port: 5173,
    open: false
  },
  // Preview configuration
  preview: {
    port: 4173
  }
})
