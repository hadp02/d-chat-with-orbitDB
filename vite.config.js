import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    vue(),
    nodePolyfills({
      include: ['buffer', 'process', 'events', 'stream', 'util']
    })
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@fortawesome/fontawesome-free/css/all.css";`
      }
    }
  },
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['@orbitdb/core']
  }
})