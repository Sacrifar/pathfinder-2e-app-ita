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
    chunkSizeWarningLimit: 1500,
    // Enable source maps for production debugging (smaller than inline)
    sourcemap: false,
    // Optimize minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    rollupOptions: {
      output: {
        // Improve chunk splitting
        manualChunks: (id) => {
          // React core libraries
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          // React Router
          if (id.includes('node_modules/react-router')) {
            return 'react-vendor';
          }

          // Split PF2E data by type for better caching and lazy loading
          if (id.includes('/pf2e/spells/')) {
            return 'pf2e-spells';
          }
          if (id.includes('/pf2e/feats/')) {
            return 'pf2e-feats';
          }
          if (id.includes('/pf2e/equipment/')) {
            return 'pf2e-equipment';
          }
          if (id.includes('/pf2e/actions/')) {
            return 'pf2e-actions';
          }
          if (id.includes('/pf2e/ancestries/') || id.includes('/pf2e/heritages/')) {
            return 'pf2e-ancestries';
          }
          if (id.includes('/pf2e/classes/') || id.includes('/pf2e/class-features/')) {
            return 'pf2e-classes';
          }

          // PF2e loader and utilities
          if (id.includes('pf2e-loader')) {
            return 'pf2e-core';
          }

          // Class features and progressions
          if (id.includes('classFeatures') || id.includes('classProgressions') || id.includes('classSpecializations') || id.includes('classResourceTemplates')) {
            return 'class-data';
          }

          // Translations
          if (id.includes('translations')) {
            return 'translations';
          }

          // Dice roller (large library)
          if (id.includes('dice') || id.includes('Dice')) {
            return 'dice-vendor';
          }

          // 3D rendering libraries
          if (id.includes('three') || id.includes('webgl') || id.includes('world')) {
            return 'rendering-vendor';
          }

          // Other node_modules - group by package
          if (id.includes('node_modules')) {
            // Extract package name
            const match = id.match(/node_modules\/(@[^/]+\/[^/]+|[^/]+)/);
            if (match) {
              const packageName = match[1].replace('@', '');
              // Group small packages together
              if (packageName.startsWith('react')) {
                return 'react-vendor';
              }
              return 'vendor';
            }
          }
        },
        // Improve asset file naming for caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
  },
})
