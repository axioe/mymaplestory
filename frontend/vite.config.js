import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // 프론트엔드에서는 '/api/...' 로만 호출하면 백엔드(8080)로 전달됩니다.
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
