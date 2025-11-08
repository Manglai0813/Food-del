/**
 * Vite設定 - パフォーマンス最適化
 *
 * バンドルサイズ削減とコード分割を最適化します。
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  // パスエイリアス設定
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // ビルド最適化
  build: {
    // ロールアップオプション
    rollupOptions: {
      output: {
        // 【コード分割戦略】
        // - vendor: node_modules の依存関係を separate chunk に
        // - pages: ページコンポーネントを separate chunk に
        // - 共有されるコードは main.js に残す
        manualChunks: (id: string) => {
          // React エコシステム
          if (id.includes('node_modules/react')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/react-router-dom')) {
            return 'vendor-react';
          }

          // TanStack Query
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'vendor-query';
          }

          // UI & Icons
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-ui';
          }

          // Store & Services
          if (id.includes('/stores/')) {
            return 'stores';
          }
          if (id.includes('/api/')) {
            return 'api-services';
          }

          // ページコンポーネント
          if (id.includes('/pages/food/HomePageContainer')) {
            return 'page-home';
          }
          if (id.includes('/pages/cart/CartPage')) {
            return 'page-cart';
          }
          if (id.includes('/pages/order/')) {
            return 'page-order';
          }
        },
      },
    },

    // チャンクサイズ警告の閾値を調整（デフォルト500KB）
    chunkSizeWarningLimit: 350,

    // ソースマップを本番環境で無効化（サイズ削減）
    sourcemap: false,
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
