import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],

    // 環境変数設定 - クライアント.envを優先読み込み
    envDir: '.',

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
                // コード分割戦略 vendor/pages/共有コードを個別chunkに分割
                manualChunks: (id: string) => {
                    // Reactエコシステム React ReactDOM ReactRouter
                    if (id.includes('node_modules/react')) {
                        return 'vendor-react';
                    }
                    if (id.includes('node_modules/react-dom')) {
                        return 'vendor-react';
                    }
                    if (id.includes('node_modules/react-router-dom')) {
                        return 'vendor-react';
                    }

                    // TanStackQuery データ取得キャッシング
                    if (id.includes('node_modules/@tanstack/react-query')) {
                        return 'vendor-query';
                    }

                    // UIライブラリとアイコン
                    if (id.includes('node_modules/lucide-react')) {
                        return 'vendor-ui';
                    }

                    // Storeと共有サービス
                    if (id.includes('/stores/')) {
                        return 'stores';
                    }
                    if (id.includes('/api/')) {
                        return 'api-services';
                    }

                    // ページコンポーネント 遅延ローディング対象
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

        // チャンクサイズ警告の閾値 デフォルト500KB から 350KB に調整
        chunkSizeWarningLimit: 350,

        // 本番環境ではソースマップを無効化 ファイルサイズ削減
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