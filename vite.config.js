import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.NODE_ENV === 'development' 
          ? 'http://localhost:8787'  // 本地开发时的 Worker 地址
          : 'https://memeplatform-api.outdoorequip2023.workers.dev', // 生产环境 Worker 地址
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  }
})