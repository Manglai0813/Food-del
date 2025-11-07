# 14. Dockerビルドデバッグ：tsconfig.jsonの罠編

## 1. はじめに

ロックファイルの問題を解決した後、私たちのDockerビルドは新たなエラーに直面しました。これらのエラーはTypeScriptコンパイラ(`tsc`)自体から発生しており、`tsconfig.json`の設定が本番ビルドの要件と一致していなかったことが原因でした。

この文書では、私たちが遭遇した2つの主要な`tsconfig.json`関連の問題とその解決策を記録します。

## 2. エラーその1：「dist」ディレクトリが見つからない

### a. 問題の発生

ビルドプロセスは、`Dockerfile`の最終段階にある`COPY --from=builder /app/dist ./dist`という命令で失敗しました。エラーメッセージは以下の通りです。

**エラーログ:**
```
ERROR: failed to calculate checksum of ref ...: "/app/dist": not found
```

### b. エラー分析

このエラーは、Dockerが`builder`ステージから`dist`ディレクトリをコピーしようとしたとき、そのディレクトリが存在しなかったことを意味します。`builder`ステージのログを確認すると、`RUN bun run build`（`tsc`を実行するコマンド）はエラーなく完了していました。

これは、「`tsc`は正常に実行されたが、**いかなるファイルも出力しなかった**」という矛盾した状況を示唆していました。

### c. 根本原因と解決策

`tsconfig.json`ファイルを確認したところ、原因が判明しました。

**原因:**
```json
"compilerOptions": {
    // ...
    "noEmit": true,
    // ...
}
```
`"noEmit": true`というオプションは、TypeScriptコンパイラに「すべての型チェックを行え。ただし、**JavaScriptファイルを一切出力するな**」と指示するものです。これは、Bunのランタイムのように別のツールがリアルタイムでトランスパイルを行う開発環境では便利ですが、本番用のビルド成果物を作成する際には致命的です。

**解決策:**
1.  `tsconfig.json`から`"noEmit": true,`の行を削除する。
2.  コンパイラに出力先を明示的に伝えるため、`"outDir": "./dist",`を追加する。

この修正により、`tsc`は正しくJavaScriptファイルを`dist`ディレクトリに生成するようになりました。

## 3. エラーその2：「allowImportingTsExtensions」のコンフリクト

### a. 問題の発生

`noEmit`の問題を修正して再度ビルドを実行すると、今度は`tsc`自体が新しいエラーをスローしました。

**エラーログ:**
```
error TS5096: Option 'allowImportingTsExtensions' can only be used when either 'noEmit' or 'emitDeclarationOnly' is set.
```

### b. エラー分析

エラーメッセージは非常に明確です。`allowImportingTsExtensions`というオプションは、`noEmit`が`true`（または`emitDeclarationOnly`が`true`）の場合にしか使えない、と述べています。

### c. 根本原因と解決策

**原因:**
`"allowImportingTsExtensions": true`は、コード内で`import './file.ts'`のように`.ts`拡張子付きでモジュールをインポートすることを許可する、比較的新しい便利なオプションです。しかし、これはBunやViteのようなモダンな開発ツールが内部でパス解決を処理してくれることを前提としています。

私たちが`tsc`を使って標準的なNode.jsで実行可能なJavaScriptを生成する場合、この非標準的なインポート方法はサポートされていません。`noEmit`を`false`にしたことで、この互換性のない設定がエラーとして表面化しました。

**解決策:**
-   `tsconfig.json`から`"allowImportingTsExtensions": true,`の行を削除する。

幸い、このプロジェクトのソースコードは、`import '@/services/orderService'`のように拡張子を省略する標準的なインポートスタイルに従っていたため、このオプションを削除してもコードの修正は不要でした。

## 4. 結論

この一連のデバッグから、`tsconfig.json`は開発時の型チェックと、本番用のコード生成とで、求められる設定が異なる場合があることがわかります。特に`noEmit`, `outDir`, `allowImportingTsExtensions`のようなコンパイラの出力挙動を制御するオプションは、ビルドパイプラインを構築する際に注意深く確認する必要があります。最終的に私たちがたどり着いた設定は、開発時の型チェックと本番用のコンパイルの両方の要件を満たす、汎用性の高いものとなりました。
