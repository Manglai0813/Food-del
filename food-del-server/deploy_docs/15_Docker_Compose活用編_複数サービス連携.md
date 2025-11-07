# 15. Docker Compose活用編：複数サービス連携

## 1. なぜ`docker-compose`が必要なのか？

`Dockerfile`は、単一のアプリケーション（私たちの場合は`server`）をコンテナ化するための設計図です。しかし、実際のアプリケーションは単体では動作しません。私たちの`server`は、データを永続化するために`PostgreSQL`データベースを必要とします。

`docker run`コマンドを手動で使ってこれらを実行しようとすると、非常に煩雑になります。

-   手動でDockerネットワークを作成する必要がある。
-   `postgres`コンテナを先に起動し、次に`server`コンテナを起動するという順序を管理する必要がある。
-   `server`コンテナに、`postgres`コンテナのネットワーク上のアドレスを環境変数として手動で渡す必要がある。

`docker-compose`は、このような**複数のコンテナから成るアプリケーション**を定義し、管理するためのツールです。単一のYAMLファイル（`docker-compose.yml`）でアプリケーション全体の構成を記述し、`docker-compose up`という一つのコマンドで、すべてのサービスを正しい順序で、正しい設定で起動できます。

## 2. `docker-compose.yml`の構造解説

以下は、私たちが最終的に作成した、`server`と`postgres`の2つのサービスを定義した`docker-compose.yml`ファイルです。

**コード (`/home/manglai/Projects/Food-del/docker-compose.yml`):**
```yaml
version: '3.8' # この行は古いですが、互換性のために残っています

services: # --- アプリケーションを構成する各サービスを定義
  postgres:
    # ... (postgresサービスの詳細設定)
  server:
    # ... (serverサービスの詳細設定)

networks: # --- サービス間が通信するためのプライベートネットワークを定義
  food-del-network:
    driver: bridge

volumes: # --- データを永続化するためのボリュームを定義
  postgres_data:
```

## 3. 各サービスの詳細設定

### a. `postgres` サービス

このサービスは、PostgreSQLデータベースコンテナを定義します。

```yaml
postgres:
  image: postgres:16-alpine
  container_name: food-del-postgres
  environment:
    # .envファイルから読み込まれ、DB初期化時に使用される
    POSTGRES_DB: ${POSTGRES_DB}
    POSTGRES_USER: ${POSTGRES_USER}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  ports:
    # ホストの5433番ポートをコンテナの5432番ポートにマッピング
    - "5433:5432"
  volumes:
    # DBのデータをホスト上の名前付きボリューム`postgres_data`に永続化
    - postgres_data:/var/lib/postgresql/data
  networks:
    - food-del-network
  healthcheck: # 【重要】DBが本当に準備完了したかを確認
    test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
    interval: 5s
    timeout: 5s
    retries: 5
```

### b. `server` サービス

このサービスは、私たちのバックエンドアプリケーションコンテナを定義します。

```yaml
server:
  build:
    # ./food-del-server ディレクトリの Dockerfile を使ってイメージをビルド
    context: ./food-del-server
    dockerfile: Dockerfile
  image: food-del-server
  container_name: food-del-server
  ports:
    # ホストの8000番ポートをコンテナの5000番ポートにマッピング
    - "8000:5000"
  environment:
    # 【重要】DBのホスト名としてサービス名`postgres`を指定
    - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
    - NODE_ENV=production
    - JWT_SECRET=${JWT_SECRET}
    - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
  depends_on:
    postgres:
      # postgresサービスのhealthcheckがhealthy状態になるまで待機
      condition: service_healthy
  networks:
    - food-del-network
```
**サービス間通信のポイント**: `server`の`DATABASE_URL`では、ホスト名として`localhost`ではなく、データベースサービスの**サービス名である`postgres`**を指定しています。Docker Composeが提供する内部DNS解決機能により、`server`コンテナは`postgres`という名前でデータベースコンテナを見つけることができます。

## 4. 結論

`docker-compose`を利用することで、私たちは以下のことを達成しました。

-   **宣言的な環境定義**: アプリケーション全体の構成（サービス、ネットワーク、ボリューム）が、一つのファイルで宣言的に管理されるようになりました。
-   **ワンコマンドでの起動**: `docker-compose up`という一つのコマンドで、複雑なアプリケーションスタック全体を、依存関係を考慮した正しい順序で起動できます。
-   **サービス間通信の簡素化**: コンテナは、IPアドレスを意識することなく、サービス名で簡単に他のコンテナと通信できます。

これにより、開発環境のセットアップが劇的に簡素化され、誰でも同じ環境を簡単に再現できるようになりました。これは、チーム開発やCI/CDパイプラインへの統合において不可欠な要素です。
