# ステージ1: ビルダー。依存関係のインストールとアプリケーションのビルドを行います。
FROM oven/bun:alpine AS builder

WORKDIR /app

# 依存関係のファイルを先にコピーして、Dockerのレイヤーキャッシュを活用します。
COPY package*.json ./
COPY bun.lockb* ./

# 開発依存関係を含むすべての依存関係をインストールします。
RUN bun install

# 全てのソースコードをコピーします。
COPY . .

# Prismaクライアントを生成します。
RUN bunx prisma generate

# アプリケーションをビルドし、`dist`ディレクトリを生成します。
RUN bun run build


# ステージ2: ランナー。最終的な軽量イメージを作成します。
FROM oven/bun:alpine

WORKDIR /app

# 本番用の依存関係のみをインストールします。
COPY package*.json bun.lockb* ./
RUN bun install --production

# ビルダー段階からビルドされたJavaScriptコードのみをコピーします。
COPY --from=builder /app/dist ./dist

# 実行時に必要なPrismaスキーマファイルをコピーします。
COPY --from=builder /app/prisma ./prisma

# 実行時に必要な生成済みPrismaクライアントをコピーします。
COPY --from=builder /app/node_modules/.prisma/client ./node_modules/.prisma/client

# 事前に用意した静的画像ファイルをコンテナにコピーします。
COPY ./storage /app/storage

# アプリケーションが使用するポートを公開します。
EXPOSE 5000

# コンテナ起動時に、コンパイル済みのJavaScriptファイルを実行します。
CMD ["bun", "dist/index.js"]
