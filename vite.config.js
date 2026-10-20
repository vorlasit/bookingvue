import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()], 
  server: {
    proxy: {
      '/api': {
        target: 'http://160.191.178.161:8888',
        changeOrigin: true
      }
    },
    watch: {
      // Exclude large structural files from being tracked
      ignored: ['**/node_modules/**', '**/.git/**']
    }, 
    host: '0.0.0.0',
    port: 3000, // Replace 3000 with your preferred port 
    strictPort: true,
    allowedHosts: ['web.khouanchay.com'],

  }
})
