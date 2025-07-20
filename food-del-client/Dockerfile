# food-del Client Container - React 18 + Vite 6
# React 18 + Vite 6 用のクライアントコンテナ

FROM node:22-alpine

# 设置工作目录 / 作業ディレクトリ設定
WORKDIR /app

# 复制package文件 / packageファイルのコピー
COPY package*.json ./

# 安装依赖 / 依存関係インストール
RUN npm install

# 复制源代码 / ソースコードのコピー
COPY . .

# 暴露Vite开发服务器端口 / Vite開発サーバーポート公開
EXPOSE 5173

# 启动开发服务器 / 開発サーバー起動
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]