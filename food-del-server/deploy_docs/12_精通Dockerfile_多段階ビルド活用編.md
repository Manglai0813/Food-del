# 12. 精通Dockerfile：多段階ビルド活用編

## 1. なぜ「多段階ビルド」なのか？

私たちが最初に作成した `Dockerfile` は、開発には便利でしたが、本番環境には多くの問題がありました。

-   **イメージが肥大化する**: `devDependencies`（例: `typescript`）やソースコード（`.ts`ファイル）など、実行に不要なファイルがすべて最終的なイメージに含まれてしまい、数百MBの無駄な容量を消費します。
-   **セキュリティリスク**: ソースコードがイメージ内に存在するため、万が一コンテナに侵入された場合にコードが漏洩するリスクがあります。
-   **ビルドキャッシュの非効率性**: 少しのコード変更でも、`COPY . .` 以降のすべてのステップが再実行される可能性があります。

**多段階ビルド（Multi-stage Build）** は、これらの問題を解決するためのDockerの標準的なベストプラクティスです。最終的なイメージを可能な限り小さく、クリーンに保つことができます。

## 2. Dockerfileの構造解説

私たちの最終的な `Dockerfile` は、2つのステージ（段階）で構成されています。

```dockerfile
# ---------------- STAGE 1: Builder ----------------
# 目的: TypeScriptをJavaScriptにコンパイルし、実行可能な成果物を生成する
FROM oven/bun:alpine AS builder

WORKDIR /app

COPY package*.json bun.lockb* ./

# 開発依存関係を含むすべての依存関係をインストール
RUN bun install

COPY . .

RUN bunx prisma generate

# `tsc && tsc-alias` を実行
RUN bun run build

# ---------------- STAGE 2: Runner ----------------
# 目的: ビルド成果物のみを使用して、軽量な本番イメージを作成する
FROM oven/bun:alpine

WORKDIR /app

COPY package*.json bun.lockb* ./

# 本番用の依存関係のみをインストール
RUN bun install --production

# 【重要】Builderステージから必要なファイルのみをコピー
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma/client ./node_modules/.prisma/client

EXPOSE 5000

# コンパイル済みのJavaScriptファイルを実行
CMD ["bun", "dist/index.js"]
```

## 3. 各ステップの逐行解説

### ステージ1: `builder`

このステージは、ソースコードをコンパイルするための一時的な環境です。最終的なイメージには含まれません。

-   `FROM oven/bun:alpine AS builder`
    -   Bunの公式イメージをベースとして使用し、このステージに `builder` という名前を付けます。
-   `RUN bun install`
    -   `devDependencies` を含む**すべて**のパッケージをインストールします。`typescript` や `tsc-alias`、`prisma` CLI など、ビルドに必要なツールをインストールするためです。
-   `COPY . .`
    -   すべてのソースコードをコンテナ内にコピーします。
-   `RUN bunx prisma generate`
    -   ビルド時にPrisma Clientを生成します。
-   `RUN bun run build`
    -   `package.json` で定義した `build` スクリプト（`tsc && tsc-alias`）を実行し、コンパイル済みのJavaScriptファイルを `/app/dist` ディレクトリに生成します。

### ステージ2: `runner` (最終イメージ)

このステージが、私たちが最終的にデプロイする軽量なイメージを構築します。

-   `FROM oven/bun:alpine`
    -   **新しいクリーンなベースイメージ**から開始します。`builder` ステージの不要なファイルは一切引き継がれません。
-   `RUN bun install --production`
    -   `package.json` の `dependencies` に記載されている**本番用パッケージのみ**をインストールします。これにより `node_modules` のサイズが大幅に削減されます。
-   `COPY --from=builder /app/dist ./dist`
    -   **多段階ビルドの核心部分です**。`--from=builder` フラグを使い、前の `builder` ステージから `/app/dist` ディレクトリ（コンパイル済みJSコード）のみを現在のステージにコピーします。
-   `COPY --from=builder /app/prisma ./prisma`
    -   実行時にPrismaが必要とするスキーマファイルをコピーします。
-   `COPY --from=builder /app/node_modules/.prisma/client ...`
    -   `builder` ステージで生成されたPrisma Clientをコピーします。これも実行に必須です。
-   `CMD ["bun", "dist/index.js"]`
    -   コンテナのデフォルトの起動コマンドとして、コンパイル済みの `index.js` を指定します。

## 4. 結論

多段階ビルドを採用することで、私たちは以下を実現しました。

-   **イメージサイズの最小化**: 最終イメージにはソースコードや開発ツールが含まれず、実行に必要なファイルのみが存在します。
-   **セキュリティの向上**: 攻撃対象領域が減少し、ソースコードの漏洩リスクがなくなります。
-   **ビルドと実行環境の分離**: ビルドに必要なツールと、実行に必要なランタイム環境を明確に分離できます。

これは、コンテナ化されたアプリケーションを本番環境にデプロイするための、現代的で標準的なアプローチです。
