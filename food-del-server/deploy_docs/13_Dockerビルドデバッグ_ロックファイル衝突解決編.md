# 13. Dockerビルドデバッグ：ロックファイル衝突解決編

## 1. 問題の発生

`Dockerfile.prod` を作成し、`docker build` コマンドを実行した際、私たちは最初の大きなエラーに遭遇しました。ビルドプロセスの `RUN bun install --production` ステップで、以下のようなエラーメッセージが出力されました。

**エラーログ:**
```
error: lockfile had changes, but lockfile is frozen
note: try re-running without --frozen-lockfile and commit the updated lockfile
...
ERROR: failed to build: failed to solve: process "/bin/sh -c bun install --production" did not complete successfully: exit code: 1
```

## 2. エラー分析

### a. エラーメッセージの意味

`lockfile had changes, but lockfile is frozen` というメッセージが問題の核心です。

-   **`lockfile is frozen` (ロックファイルは凍結されています)**: CI/CD環境や本番ビルドにおいて、`bun install` や `npm ci` のようなコマンドは、再現性を保証するために「凍結モード」で実行されます。これは、インストーラーが `package.json` と `bun.lockb` (ロックファイル) の間に不一致を検出しても、**絶対にロックファイルを変更しない**というモードです。もし不一致があれば、ビルドを失敗させて処理を中断します。
-   **`lockfile had changes` (ロックファイルに変更が必要でした)**: Bunが `package.json` に基づいて本番用の依存関係ツリーを計算した結果、その内容が既存の `bun.lockb` ファイルと一致しないことを意味します。

### b. 根本原因の特定

なぜ不一致が発生したのでしょうか？単純に `bun install` を再実行しても同じエラーが再現しました。詳細なログを再度確認すると、以下の行がヒントとなりました。

`migrated lockfile from package-lock.json`

これは、Dockerコンテナ内で `bun install` が実行されるたびに、プロジェクト内に存在する `package-lock.json` (npmのロックファイル) を検出し、それを解釈しようとしていたことを示しています。

このプロジェクトではBunを使用しているため、`bun.lockb` が唯一の信頼できるロックファイルであるべきです。`package-lock.json` が存在すると、Bunの依存関係解決プロセスに混乱が生じ、`bun.lockb` との間に矛盾した状態が生まれていました。これがエラーの根本原因でした。

## 3. 解決策：「信頼できる唯一の情報源」の確立

この曖昧さを解消するためには、プロジェクト内にロックファイルの「信頼できる唯一の情報源（Single Source of Truth）」を確立する必要があります。つまり、Bunの `bun.lockb` のみを使用するようにします。

以下が、私たちが実行した修正手順です。

### ステップ1：すべての古いロックファイルを削除する

まず、競合の原因となる可能性のあるすべてのロックファイルをホストマシンから削除し、完全にクリーンな状態から始めます。

**コマンド:**
```bash
rm -f package-lock.json bun.lockb
```

### ステップ2：信頼できる`bun.lockb`を再生成する

次に、`package.json` のみを元にして、Bunに新しい、クリーンなロックファイルを生成させます。

**コマンド:**
```bash
bun install
```
このコマンドは、`package.json` を読み込み、すべての依存関係を解決し、その結果を新しい `bun.lockb` ファイルに書き込みます。

### ステップ3：Dockerイメージを再ビルドする

最後に、この新しく生成された、信頼できる `bun.lockb` ファイルを使用して、Dockerイメージを再ビルドします。

**コマンド:**
```bash
docker build -t food-del-server:latest .
```
このビルドでは、`COPY` コマンドによってクリーンな `bun.lockb` がコンテナにコピーされ、`package-lock.json` が存在しないため、`bun install --production` は混乱することなく、正常に依存関係をインストールできました。

## 4. 結論

このデバッグセッションから得られる重要な教訓は、プロジェクトで使用するパッケージマネージャーを一貫させ、**関連するロックファイルも一つに統一する**ことです。複数のパッケージマネージャーのロックファイル（例: `package-lock.json`, `yarn.lock`, `bun.lockb`）が混在すると、特にコンテナ化されたクリーンな環境でのビルド時に、予期せぬ依存関係の解決エラーを引き起こす可能性があります。
