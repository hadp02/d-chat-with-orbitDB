import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    vue(),
    nodePolyfills({
      include: ['buffer', 'process', 'events', 'stream', 'util','os', 'net', 'tls', 'crypto']
    })
  ],
  server: {
    port: 5173,
    strictPort: true,
  },
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['@orbitdb/core']
  }
})