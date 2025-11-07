import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // パスエイリアス設定
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // 開発サーバー設定
  server: {
    port: 3000,
    host: true,
    open: true,
  },

  // プレビューサーバー設定
  preview: {
    port: 3000,
    host: true,
  },
})
