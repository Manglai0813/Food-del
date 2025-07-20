# food-del Dashboard Container - Next.js 15 + React 19
# Next.js 15 + React 19 用のダッシュボードコンテナ

FROM node:22-alpine

# 设置工作目录 / 作業ディレクトリ設定
WORKDIR /app

# 复制package文件 / packageファイルのコピー
COPY package*.json ./

# 安装依赖 / 依存関係インストール
RUN npm install

# 复制源代码 / ソースコードのコピー
COPY . .

# 暴露Next.js开发服务器端口 / Next.js開発サーバーポート公開
EXPOSE 3001

# 启动Next.js开发服务器 / Next.js開発サーバー起動
CMD ["npm", "run", "dev"]