import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/buildrun-livechat-websocket': {
        target: 'ws://localhost:8080',
        ws: true,
        changeOrigin: true,
      },
      '/app': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/topics': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
