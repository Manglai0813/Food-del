# ステージ1: ビルダー
# 依存関係のインストールとアプリケーションのビルド
FROM oven/bun:alpine AS builder

WORKDIR /app

# ビルド時APIのURLを引数から受け取る
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# 依存関係ファイルを先にコピー Dockerレイヤーキャッシュを活用
COPY package.json ./
COPY bun.lock* ./

# 全ての依存関係をインストール
RUN bun install

# ソースコード全体をコピー
COPY . .

# Viteを使用してビルド dist ディレクトリを生成
RUN bun run build


# ステージ2: ランナー
# Nginxを使用して静的ファイルを提供
FROM nginx:alpine

# Nginx設定ファイルをコンテナ内にコピー
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ビルド済み静的ファイル HTML JS CSS をNginxのWebルートにコピー
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginxのデフォルトポート80を公開
EXPOSE 80

# コンテナ起動時にNginxサーバーをフォアグラウンドで起動
CMD ["nginx", "-g", "daemon off;"]