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
