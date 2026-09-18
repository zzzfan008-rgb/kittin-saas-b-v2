> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini CLI

> APIYI 経由で Gemini CLI を使用し、AI支援プログラミング、コード生成、コードレビュー、Q&A などを行えます

## 概要

Gemini CLI は Google の公式コマンドラインツールで、ターミナルから Gemini AI モデルと直接やり取りできます。APIYI を通じて、次のことが可能です。

* 🚀 ターミナルで Gemini モデルを素早く呼び出す
* 💻 AI 支援のプログラミングとコード生成
* 🔍 コードレビューと最適化の提案
* 📝 技術 Q\&A とドキュメント生成
* 🌐 クロスプラットフォーム対応（Linux、macOS、Windows）

<Info>
  **なぜ APIYI を選ぶのですか？**

  APIYI 経由で Gemini CLI を使用すると、より安定したネットワーク接続、より良い価格設定、そして 24/7 の技術サポートが利用できます。
</Info>

## クイックスタート

### 前提条件

* Node.js >= 18.0.0
* npm または yarn のパッケージマネージャー
* APIYI アカウントと API Key

### 手順 1: Gemini CLI をインストール

<CodeGroup>
  ```bash npm theme={null}
  # Check Node.js version
  node --version  # Must be >= 18

  # Install Gemini CLI globally
  npm install -g @google/gemini-cli

  # Verify installation
  gemini --version
  ```

  ```bash yarn theme={null}
  # Check Node.js version
  node --version  # Must be >= 18

  # Install with yarn
  yarn global add @google/gemini-cli

  # Verify installation
  gemini --version
  ```
</CodeGroup>

### 手順 2: APIYI API Key を取得する

<Steps>
  <Step title="APIYI に登録/ログイン">
    登録またはログインするには `api.apiyi.com` にアクセスしてください
  </Step>

  <Step title="API Key を作成">
    ダッシュボードの「Token Management」ページ（`api.apiyi.com/token`）に移動し、「Create New Token」をクリックしてください
  </Step>

  <Step title="キーをコピー">
    生成された API Key（形式: `sk-***`）をコピーして、安全に保管してください
  </Step>
</Steps>

### 手順 3: 環境変数を設定する

<Warning>
  **重要な設定**: `GOOGLE_GEMINI_BASE_URL` は、追加のパス（`/v1` や `/gemini` のようなもの）を付けずに `https://api.apiyi.com` に設定する必要があります。そうしないと接続に失敗します。
</Warning>

<Tabs>
  <Tab title="Zsh (macOS/Linux)">
    ```bash theme={null}
    # Edit .zshrc file
    nano ~/.zshrc

    # Add these environment variables
    export GOOGLE_GEMINI_BASE_URL="https://api.apiyi.com"
    export GEMINI_API_KEY="sk-your-api-key"  # Replace with your APIYI key

    # Reload configuration
    source ~/.zshrc
    ```
  </Tab>

  <Tab title="Bash (Linux)">
    ```bash theme={null}
    # Edit .bashrc file
    nano ~/.bashrc

    # Add these environment variables
    export GOOGLE_GEMINI_BASE_URL="https://api.apiyi.com"
    export GEMINI_API_KEY="sk-your-api-key"  # Replace with your APIYI key

    # Reload configuration
    source ~/.bashrc
    ```
  </Tab>

  <Tab title="PowerShell (Windows)">
    ```powershell theme={null}
    # Set environment variables
    $env:GOOGLE_GEMINI_BASE_URL="https://api.apiyi.com"
    $env:GEMINI_API_KEY="sk-your-api-key"

    # Save permanently (optional)
    [System.Environment]::SetEnvironmentVariable('GOOGLE_GEMINI_BASE_URL', 'https://api.apiyi.com', 'User')
    [System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'sk-your-key', 'User')
    ```
  </Tab>

  <Tab title="CMD (Windows)">
    ```cmd theme={null}
    # Temporary environment variables
    set GOOGLE_GEMINI_BASE_URL=https://api.apiyi.com
    set GEMINI_API_KEY=sk-your-api-key

    # Save permanently (requires admin)
    setx GOOGLE_GEMINI_BASE_URL "https://api.apiyi.com"
    setx GEMINI_API_KEY "sk-your-api-key"
    ```
  </Tab>
</Tabs>

### 手順 4: 初期化してテストする

<Steps>
  <Step title="Gemini CLI を起動">
    ```bash theme={null}
    gemini
    ```
  </Step>

  <Step title="初回認証">
    対話型インターフェースで、次のように入力してください:

    ```bash theme={null}
    /auth
    ```

    選択: **Gemini API Key (AI Studio)**
  </Step>

  <Step title="接続をテスト">
    ```bash theme={null}
    # Simple test
    gemini "Hello, test connection"

    # Programming-related test
    gemini "Explain how React Hooks work"
    gemini "Write a Python function to calculate Fibonacci sequence"
    ```
  </Step>
</Steps>

## コア機能

### コード生成

<Tabs>
  <Tab title="関数生成">
    ```bash theme={null}
    gemini "Write a quick sort algorithm in Python with detailed comments"
    ```

    **出力例**:

    ```python theme={null}
    def quick_sort(arr):
        """
        Quick sort algorithm
        Time complexity: Average O(n log n), Worst O(n²)
        Space complexity: O(log n)
        """
        if len(arr) <= 1:
            return arr

        pivot = arr[len(arr) // 2]
        left = [x for x in arr if x < pivot]
        middle = [x for x in arr if x == pivot]
        right = [x for x in arr if x > pivot]

        return quick_sort(left) + middle + quick_sort(right)
    ```
  </Tab>

  <Tab title="プロジェクトのひな形作成">
    ```bash theme={null}
    gemini "Create an Express.js REST API project structure with user auth and database config"
    ```
  </Tab>

  <Tab title="ユニットテスト">
    ```bash theme={null}
    gemini "Write Jest unit tests for this function:
    function fibonacci(n) {
      if (n <= 1) return n;
      return fibonacci(n - 1) + fibonacci(n - 2);
    }"
    ```
  </Tab>
</Tabs>

### コードレビュー

```bash theme={null}
# Review code quality
gemini "Review the following code for performance issues and potential bugs:
[paste your code]
"

# Security audit
gemini "Check this code for security vulnerabilities, especially SQL injection and XSS"

# Best practices
gemini "What can be improved in this React component? Does it follow best practices?"
```

### 技術 Q\&A

```bash theme={null}
# Concept explanation
gemini "Explain JavaScript closures with practical use cases"

# Error troubleshooting
gemini "Why isn't my Promise being resolved correctly?"

# Performance optimization
gemini "How to optimize React component rendering performance?"

# Architecture design
gemini "Compare microservices vs monolithic architecture"
```

### ドキュメント生成

```bash theme={null}
# Generate README
gemini "Generate a professional README.md for my Node.js library with installation, usage, and API docs"

# API documentation
gemini "Generate OpenAPI 3.0 spec documentation for this REST API endpoint"

# Code comments
gemini "Add detailed JSDoc comments to the following code"
```

## インタラクティブコマンド

Gemini CLI のインタラクティブモードでは、次のコマンドを使用できます:

| コマンド     | 説明           | 例                             |
| -------- | ------------ | ----------------------------- |
| `/auth`  | 再認証する        | `/auth`                       |
| `/model` | モデルを切り替える    | `/model gemini-3-pro-preview` |
| `/clear` | 会話履歴をクリアする   | `/clear`                      |
| `/help`  | ヘルプ情報を表示する   | `/help`                       |
| `/exit`  | CLI を終了する    | `/exit` または `Ctrl+C`          |
| `/save`  | 会話をファイルに保存する | `/save conversation.txt`      |

<Tip>
  **モデル切り替え**: `/model` コマンドを使用して、`gemini-3-pro-preview`、`gemini-2.5-flash`、`gemini-2.5-pro` などのさまざまな Gemini モデルを切り替えます。
</Tip>

## サポートされているモデル

APIYI を通じて、最新の Gemini モデルをご利用いただけます。

### Gemini 3 シリーズ（推奨）

| モデル                               | ユースケース          | 特徴                          |
| --------------------------------- | --------------- | --------------------------- |
| **gemini-3-pro-preview**          | 高品質なコード、複雑な推論   | 🏆 最高性能、LMArena リーダーボードで第1位 |
| **gemini-3-pro-preview-thinking** | 超複雑な推論、アルゴリズム設計 | 🧠 思考過程の出力、深い推論             |

### Gemini 2.5 シリーズ

| モデル                       | ユースケース          | 特徴              |
| ------------------------- | --------------- | --------------- |
| **gemini-2.5-pro**        | プロフェッショナルなコード生成 | ⚡ 高性能、1M コンテキスト |
| **gemini-2.5-flash**      | 高速応答、日常開発       | 🚀 高速、低コスト      |
| **gemini-2.5-flash-lite** | 軽量タスク、バッチ呼び出し   | 💰 超低コスト、高頻度    |

<Info>
  **推奨構成**:

  * 複雑なプログラミング、アーキテクチャ設計: `gemini-3-pro-preview`
  * 日常的なコード生成、Q\&A: `gemini-2.5-flash`
  * バッチ処理、高速な反復: `gemini-2.5-flash-lite`
</Info>

<Card title="すべてのモデル一覧を見る" icon="list" href="/ja/api-capabilities/model-info">
  APIYI でサポートされているすべての Gemini モデル、詳細な料金と性能の比較をご覧いただけます
</Card>

## 高度な使い方

### VS Code 連携

VS Code で Gemini CLI 拡張機能を使用します。

```json theme={null}
{
  "gemini.apiKey": "sk-your-api-key",
  "gemini.baseUrl": "https://api.apiyi.com",
  "gemini.model": "gemini-3-pro-preview",
  "gemini.temperature": 0.7,
  "gemini.maxTokens": 4000
}
```

### GitHub Actions 連携

自動コードレビュー:

```yaml theme={null}
name: Gemini Code Review
on:
  pull_request:
    branches: [ main ]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install Gemini CLI
        run: npm install -g @google/gemini-cli

      - name: Run Code Review
        env:
          GEMINI_API_KEY: \${{ secrets.GEMINI_API_KEY }}
          GOOGLE_GEMINI_BASE_URL: https://api.apiyi.com
        run: |
          gemini "Review this Pull Request for code quality, security, and performance:
          $(git diff origin/main...HEAD)"
```

### バッチスクリプト

自動化スクリプトを作成します。

```bash theme={null}
#!/bin/bash

# Batch code review
for file in src/**/*.js; do
  echo "Reviewing $file..."
  gemini "Review code quality of $file" < "$file"
done

# Generate project documentation
gemini "Generate technical documentation outline for the entire project" < README.md
```

## よくある質問

<AccordionGroup>
  <Accordion title="接続に失敗した、または認証エラーが出ますか？">
    **チェックリスト**:

    1. **環境変数を確認する**:

       ```bash theme={null}
       echo $GOOGLE_GEMINI_BASE_URL
       echo $GEMINI_API_KEY
       ```

       出力は次のようになります:

       * `GOOGLE_GEMINI_BASE_URL`: `https://api.apiyi.com`（/v1 やその他のパスは不要）
       * `GEMINI_API_KEY`: `sk-` で始まる完全なキー

    2. **環境変数を再読み込みする**:
       ```bash theme={null}
       source ~/.zshrc  # or source ~/.bashrc
       ```

    3. **ターミナルを再起動する**: ターミナルを完全に閉じてから開き直します

    4. **API Key を確認する**: APIYI のダッシュボードにログインして、キーが有効で残高が十分であることを確認します
  </Accordion>

  <Accordion title="Gemini モデルを切り替えるには？">
    インタラクティブモードで `/model` コマンドを使います:

    ```bash theme={null}
    /model gemini-3-pro-preview
    /model gemini-3-pro-preview-thinking
    /model gemini-2.5-flash
    ```

    または、コマンドで直接指定します:

    ```bash theme={null}
    gemini --model gemini-3-pro-preview "your question"
    gemini --model gemini-2.5-flash "quick test"
    ```
  </Accordion>

  <Accordion title="会話履歴を保存するには？">
    **方法 1**: `/save` コマンドを使う

    ```bash theme={null}
    /save conversation-2025-01-01.txt
    ```

    **方法 2**: 出力をリダイレクトする

    ```bash theme={null}
    gemini "your question" > output.txt
    gemini "your question" | tee output.txt  # Display and save
    ```

    **方法 3**: セッション管理を使う

    ```bash theme={null}
    gemini --session my-project "continue previous discussion"
    ```
  </Accordion>

  <Accordion title="Node.js のバージョンが要件を満たしていませんか？">
    **推奨: nvm を使って Node.js のバージョンを管理します**:

    ```bash theme={null}
    # Install nvm
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

    # Install Node.js 18+
    nvm install 18
    nvm use 18
    nvm alias default 18

    # Verify version
    node --version
    ```
  </Accordion>

  <Accordion title="応答が遅いのはなぜですか？">
    **考えられる原因と解決策**:

    1. **ネットワークの問題**: APIYI は最適化された国内ノードを提供しており、通常は高速です
    2. **モデルの選択**: 最速の応答には `gemini-2.5-flash` または `gemini-2.5-flash-lite` を使います
    3. **token 制限**: 1 回のリクエストの複雑さを下げます
    4. **同時リクエスト**: 一度に多すぎるリクエストを送らないようにします

    **接続速度をテストする**:

    ```bash theme={null}
    time gemini --model gemini-2.5-flash "Hello"
    ```
  </Accordion>

  <Accordion title="Windows での使い方は？">
    **推奨: PowerShell を使います**:

    1. Node.js をインストールします（公式サイトからインストーラーをダウンロードします）
    2. PowerShell を管理者として実行します
    3. 環境変数を設定します:
       ```powershell theme={null}
       [System.Environment]::SetEnvironmentVariable('GOOGLE_GEMINI_BASE_URL', 'https://api.apiyi.com', 'User')
       [System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'sk-your-key', 'User')
       ```
    4. PowerShell を再起動します
    5. Gemini CLI をインストールして使います

    **または WSL**（Windows Subsystem for Linux）を使うと、より快適に利用できます。
  </Accordion>
</AccordionGroup>

## ベストプラクティス

### プロンプト最適化

<CardGroup cols={2}>
  <Card title="具体的にする" icon="target">
    ❌ 「このコードを最適化して」

    ✅ 「ループの効率とメモリ使用量に焦点を当てて、このコードのパフォーマンスを最適化して」
  </Card>

  <Card title="文脈を提供する" icon="book">
    ❌ 「この関数の何が問題ですか？」

    ✅ 「これは非同期エラーが発生しているユーザーログイン関数です。問題の原因を見つけるのを手伝ってください」
  </Card>

  <Card title="ステップごとに進める" icon="list-ordered">
    ❌ 「プロジェクト全体の完成を手伝って」

    ✅ 「手順1: データベースモデルを設計する; 手順2: API ルートを作成する; 手順3: ...」
  </Card>

  <Card title="例を依頼する" icon="code">
    ❌ 「クロージャについて説明して」

    ✅ 「JavaScript のクロージャを、3つの実用的な使用例とコード例付きで説明して」
  </Card>
</CardGroup>

### ワークフローの推奨事項

<Steps>
  <Step title="問題を定義する">
    解決したい問題や実装したい機能を明確に説明します
  </Step>

  <Step title="解決策を得る">
    Gemini CLI を使って、初期の解決策やコードを生成します
  </Step>

  <Step title="レビューして最適化する">
    AI に自分のコードをレビューさせ、潜在的な問題を見つけてもらいます
  </Step>

  <Step title="繰り返し改善する">
    要件を満たすまで、フィードバックに基づいて段階的に最適化します
  </Step>

  <Step title="ドキュメントを追加する">
    必要なコメントとドキュメントを生成します
  </Step>
</Steps>

## 料金

APIYI 経由で Gemini モデルを使用する費用は、選択したモデルと使用量によって異なります。

<Card title="詳細料金を見る" icon="dollar-sign" href="/ja/api-capabilities/model-info">
  すべての Gemini モデルの詳細料金と費用対効果の比較を見る
</Card>

<Info>
  APIYI ではチャージ特典があります: チャージ額が多いほど、特典率も高くなります（10%-20%）。初回チャージには追加特典があります。[チャージキャンペーンの詳細](/ja/faq/recharge-promotions)をご覧ください。
</Info>

## 関連リソース

* [Gemini CLI 公式ドキュメント](https://ai.google.dev/gemini-api/docs/cli)
* [APIYI クイックスタートガイド](/ja/getting-started)
* [モデルの推奨事項と料金](/ja/api-capabilities/model-info)
* [チャージ特典](/ja/faq/recharge-promotions)
* [API マニュアル](/ja/api-manual)

## サポートを受ける

<CardGroup cols={2}>
  <Card title="企業WeChat" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企業WeChatのQRコード" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    QRコードをスキャンするか、[サポートに連絡するにはクリックしてください](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    技術相談、利用ガイダンス
  </Card>

  <Card title="メールでのお問い合わせ" icon="mail">
    **カスタマーサポート**: [support@apiyi.com](mailto:support@apiyi.com)

    **営業**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>

<Tip>
  **クイックスタート**: 上記の「クイックスタート」セクションに従ってセットアップを完了し、5分で Gemini CLI の利用を始めましょう！
</Tip>
