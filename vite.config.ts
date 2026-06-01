import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 선거 후보 비교 정적 웹. base는 상대경로로 두어 어디서든 정적 서빙 가능하게 함
export default defineConfig({
  plugins: [react()],
  base: './',
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
      },
    },
  },
});
