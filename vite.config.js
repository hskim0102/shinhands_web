import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  define: {
    // 환경 변수를 명시적으로 정의
    'import.meta.env.VITE_DATABASE_URL': JSON.stringify(process.env.VITE_DATABASE_URL),
  },
  // 또는 envPrefix를 사용하여 VITE_ 접두사가 있는 모든 환경 변수를 노출
  envPrefix: 'VITE_',
})
