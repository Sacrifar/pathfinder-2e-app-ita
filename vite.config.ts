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
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        }
      }
    }
  }
})
