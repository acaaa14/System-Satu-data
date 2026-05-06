import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'portal' ? '/frontend/' : '/',
  build: {
    outDir: mode === 'portal' ? '../portal-api/public/frontend' : 'dist',
    emptyOutDir: true,
    sourcemap: mode !== 'production',
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Simple vendor chunking to mimic Jakarta multiple chunks
          if (id.includes('node_modules')) {
            // Library grafik dipisah agar bundle utama tidak terlalu besar.
            if (
              id.includes('/recharts/') ||
              id.includes('/victory-vendor/') ||
              id.includes('/d3-') ||
              id.includes('/decimal.js-light/') ||
              id.includes('/react-redux/') ||
              id.includes('/@reduxjs/toolkit/') ||
              id.includes('/redux/') ||
              id.includes('/reselect/') ||
              id.includes('/immer/') ||
              id.includes('/use-sync-external-store/')
            ) {
              return 'chart-vendors'
            }

            // Dependency umum tetap digabung di vendors.
            return 'vendors'
          }
        },
        chunkFileNames: 'js/[name].[hash].js',
        entryFileNames: 'js/[name].[hash].js',
        assetFileNames: assetInfo => {
          if (/\.css$/.test(assetInfo.name)) {
            return 'css/[name].[hash].css'
          }
          return 'js/[name].[hash].js'
        }
      }
    },
    minify: true
  },
  define: {
    __IS_PROD__: JSON.stringify(mode === 'production')
  }
}))
