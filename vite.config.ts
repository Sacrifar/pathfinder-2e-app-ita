import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    watch: {
      // Reduce the number of files watched simultaneously
      usePolling: false,
      // Increase debounce to reduce file system calls
      interval: 1000,
    }
  },
  optimizeDeps: {
    // Force pre-bundling of these dependencies
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  build: {
    // Improve build performance
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core libraries
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          // PF2e data - separate into its own chunk for caching
          if (id.includes('pf2e-loader') || id.includes('compiled-pf2e-data')) {
            return 'pf2e-data';
          }
          // Class features and progressions
          if (id.includes('classFeatures') || id.includes('classProgressions') || id.includes('classSpecializations')) {
            return 'class-data';
          }
          // Translations
          if (id.includes('translations')) {
            return 'translations';
          }
        }
      }
    }
  }
})
