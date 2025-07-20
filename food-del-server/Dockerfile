# food-del Server Container - Bun + Express + TypeScript
# Bun + Express + TypeScript 用のサーバーコンテナ

FROM oven/bun:alpine

# 设置工作目录 / 作業ディレクトリ設定
WORKDIR /app

# 复制package文件 / packageファイルのコピー
COPY package*.json ./
COPY bun.lockb* ./

# 安装依赖 / 依存関係インストール
RUN bun install

# 复制源代码 / ソースコードのコピー
COPY . .

# 生成Prisma客户端 / Prismaクライアント生成
RUN bunx prisma generate

# 暴露Express服务器端口 / Expressサーバーポート公開
EXPOSE 5000

# 启动开发服务器 / 開発サーバー起動
CMD ["bun", "--watch", "index.ts"]