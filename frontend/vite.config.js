import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // '/api'로 "시작하는" 모든 경로를 백엔드로 보내다 보니, public/apikey.png
      // 같은 정적 파일 요청(/apikey.png)도 우연히 "/api"로 시작해서 똑같이
      // 백엔드로 잘못 넘어가는 문제가 있었다 - 백엔드에 그런 경로가 없으니
      // ECONNREFUSED/proxy error가 났다. 정규식으로 "/api/" 뒤에 반드시
      // 슬래시가 오는 경우만 매칭하도록 좁혀서 이 충돌을 막는다.
      '^/api/': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
