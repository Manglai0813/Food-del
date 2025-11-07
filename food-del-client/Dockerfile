# ステージ1: ビルダー。依存関係のインストールとアプリケーションのビルドを行います。
FROM oven/bun:alpine AS builder

WORKDIR /app

# ビルド時に外部からAPIのURLを受け取るための引数
ARG VITE_API_URL
# ARGをビルドプロセス中の環境変数として設定
ENV VITE_API_URL=$VITE_API_URL

# 依存関係のファイルを先にコピーして、Dockerのレイヤーキャッシュを活用します。
COPY package.json bun.lock ./

# 開発依存関係を含むすべての依存関係をインストールします。
RUN bun install

# 全てのソースコードをコピーします。
COPY . .

# Viteを使用してアプリケーションをビルドし、`dist`ディレクトリを生成します。
RUN bun run build


# ステージ2: ランナー。Nginxを使用して静的ファイルを提供します。
FROM nginx:alpine

# 上で定義したNginxの設定ファイルをコンテナ内にコピーします。
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ビルダー段階からビルドされた静的ファイル（HTML, JS, CSS）をNginxのWebルートディレクトリにコピーします。
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginxのデフォルトポートである80を公開します。
EXPOSE 80

# コンテナ起動時にNginxサーバーをフォアグラウンドで起動します。
CMD ["nginx", "-g", "daemon off;"]
