> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenCode

> ターミナル/IDE/デスクトッププラットフォームをサポートするオープンソースのAIコーディングエージェントで、APIYIで設定すると安定かつ効率的なコーディング体験を実現します

## 概要

OpenCode は TypeScript と AI SDK で構築された完全オープンソースの AI コーディングエージェントで、ターミナル TUI、IDE 連携、デスクトップアプリを提供します。GitHub で 94.9k+ の stars を獲得しており、活発なコミュニティがあります。

APIYI サービスを設定すると、次のような利点があります:

<CardGroup cols={2}>
  <Card title="🖥️ マルチプラットフォーム対応" icon="monitor">
    ターミナル TUI、VS Code 拡張機能、デスクトップアプリ
  </Card>

  <Card title="🔌 75+ モデル対応" icon="plug">
    Models.dev 経由で 75+ の LLM プロバイダーをサポート
  </Card>

  <Card title="🛠️ LSP を内蔵" icon="code">
    インテリジェントなコード理解のための Language Server Protocol 対応
  </Card>

  <Card title="🔄 マルチセッション並列処理" icon="layers">
    並列セッション処理とセッション共有
  </Card>
</CardGroup>

<Info>
  **プロジェクト情報**: OpenCode は活発にメンテナンスされているオープンソースプロジェクトです。Web サイト: `opencode.ai`, リポジトリ: `github.com/anomalyco/opencode`.
</Info>

## 前提条件

### OpenCode をインストールする

<Tabs>
  <Tab title="クイックインストール（推奨）">
    ```bash theme={null}
    curl -fsSL https://opencode.ai/install | bash
    ```
  </Tab>

  <Tab title="npm">
    ```bash theme={null}
    npm i -g opencode-ai@latest
    ```
  </Tab>

  <Tab title="Homebrew（macOS/Linux）">
    ```bash theme={null}
    brew install anomalyco/tap/opencode
    ```
  </Tab>

  <Tab title="Windows">
    Scoop:

    ```bash theme={null}
    scoop install opencode
    ```

    Chocolatey:

    ```bash theme={null}
    choco install opencode
    ```
  </Tab>

  <Tab title="Arch Linux">
    ```bash theme={null}
    paru -S opencode-bin
    ```
  </Tab>

  <Tab title="デスクトップアプリ">
    `opencode.ai`から、ご利用のシステム用のデスクトップアプリをダウンロードしてください:

    * macOS (Apple Silicon / Intel)
    * Windows
    * Linux (AppImage / deb)
  </Tab>
</Tabs>

インストールを確認します:

```bash theme={null}
opencode --version
```

## クイック設定

OpenCode は、複数の設定場所を持つ JSON 設定ファイルを使用します（優先順位は低い順から高い順）:

1. リモート設定 (`.well-known/opencode`)
2. グローバル設定: `~/.config/opencode/opencode.json`
3. カスタム設定: `OPENCODE_CONFIG` 環境変数で指定したパス
4. プロジェクト設定: プロジェクトルートの `opencode.json`
5. `.opencode` ディレクトリ設定
6. インライン設定: `OPENCODE_CONFIG_CONTENT` 環境変数

### 方法 1: カスタムプロバイダー（推奨）

設定ファイル `~/.config/opencode/opencode.json` を作成または編集します:

```json theme={null}
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "apiyi": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "APIYI",
      "options": {
        "baseURL": "https://api.apiyi.com/v1",
        "apiKey": "{env:APIYI_API_KEY}"
      },
      "models": {
        "claude-sonnet-4-20250514": {
          "name": "Claude Sonnet 4",
          "limit": { "context": 200000, "output": 8192 }
        },
        "gpt-4.1": {
          "name": "GPT-4.1",
          "limit": { "context": 1047576, "output": 32768 }
        },
        "deepseek-chat": {
          "name": "DeepSeek V3",
          "limit": { "context": 65536, "output": 8192 }
        },
        "gemini-2.5-pro-preview-05-06": {
          "name": "Gemini 2.5 Pro",
          "limit": { "context": 1048576, "output": 65536 }
        }
      }
    }
  },
  "model": "apiyi/claude-sonnet-4-20250514"
}
```

次に、環境変数を設定します:

<Tabs>
  <Tab title="macOS/Linux">
    ```bash theme={null}
    # zsh
    echo 'export APIYI_API_KEY="sk-your-apiyi-key"' >> ~/.zshrc
    source ~/.zshrc

    # bash
    echo 'export APIYI_API_KEY="sk-your-apiyi-key"' >> ~/.bashrc
    source ~/.bashrc
    ```
  </Tab>

  <Tab title="Windows">
    PowerShell:

    ```powershell theme={null}
    [System.Environment]::SetEnvironmentVariable('APIYI_API_KEY', 'sk-your-apiyi-key', 'User')
    ```

    または、システム環境変数に `APIYI_API_KEY` を追加します。
  </Tab>
</Tabs>

### 方法 2: /connect コマンドによる認証

OpenCode は、新しいプロバイダーをすばやく接続するための `/connect` コマンドを提供します:

1. OpenCode を起動したら、`/connect` と入力します
2. 「その他」を選択します
3. プロバイダー ID を入力します（例: `apiyi`）
4. API key を入力します

その後、設定ファイルにプロバイダーとモデルの定義を追加して使用します。

### 方法 3: 既存プロバイダーの上書き

手早く設定するには、組み込みの OpenAI プロバイダーの baseURL を上書きします:

```json theme={null}
{
  "provider": {
    "openai": {
      "options": {
        "baseURL": "https://api.apiyi.com/v1",
        "apiKey": "{env:APIYI_API_KEY}"
      }
    }
  }
}
```

### 方法 4: プロジェクトレベルの設定

プロジェクト固有の設定を行うには、プロジェクトルートに `opencode.json` を作成します:

```json theme={null}
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "apiyi": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "APIYI",
      "options": {
        "baseURL": "https://api.apiyi.com/v1",
        "apiKey": "{env:APIYI_API_KEY}"
      },
      "models": {
        "claude-sonnet-4-20250514": {
          "name": "Claude Sonnet 4",
          "limit": { "context": 200000, "output": 8192 }
        }
      }
    }
  },
  "model": "apiyi/claude-sonnet-4-20250514"
}
```

## エージェント システム

OpenCode には、用途がそれぞれ異なる 3 つの組み込みエージェントがあります:

| Agent       | 説明                                       | 用途              |
| ----------- | ---------------------------------------- | --------------- |
| **build**   | デフォルトのエージェントで、完全なアクセス権を持ち、コード生成と変更を担当します | 直接会話            |
| **plan**    | コード分析と計画用の読み取り専用エージェントで、ファイルは変更しません      | `/plan` コマンド    |
| **general** | 複数ステップの情報取得向けの複雑な検索サブエージェントです            | `@general` 呼び出し |

### エージェント モデルの設定

エージェントごとに異なるモデルを設定します:

```json theme={null}
{
  "provider": {
    "apiyi": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "APIYI",
      "options": {
        "baseURL": "https://api.apiyi.com/v1",
        "apiKey": "{env:APIYI_API_KEY}"
      },
      "models": {
        "claude-sonnet-4-20250514": {
          "name": "Claude Sonnet 4",
          "limit": { "context": 200000, "output": 8192 }
        },
        "deepseek-chat": {
          "name": "DeepSeek V3",
          "limit": { "context": 65536, "output": 8192 }
        },
        "gpt-4.1-mini": {
          "name": "GPT-4.1 Mini",
          "limit": { "context": 1047576, "output": 32768 }
        }
      }
    }
  },
  "agents": {
    "build": {
      "model": "apiyi/claude-sonnet-4-20250514"
    },
    "plan": {
      "model": "apiyi/deepseek-chat"
    },
    "general": {
      "model": "apiyi/gpt-4.1-mini"
    }
  }
}
```

## 推奨モデル

OpenCode は APIYI を通じて 400 以上の AI モデルをサポートしています。用途に合ったモデルを選択してください。

<Card title="プログラミングモデルの推奨を見る" icon="code" href="/ja/api-capabilities/model-info">
  最新のプログラミングモデルの推奨、性能比較、使用上の सुझावを確認できます。高性能モデル、コスト効率の高いオプション、推論強化モデルが含まれます。
</Card>

### シナリオ別モデル推奨

| Agent   | 目的           | 推奨モデル                       |
| ------- | ------------ | --------------------------- |
| build   | コード生成と修正     | Claude Sonnet 4, GPT-4.1    |
| plan    | タスク計画と分析     | DeepSeek V3, Gemini 2.5 Pro |
| general | クイック検索と Q\&A | GPT-4.1 Mini (低コスト)         |

## 主な機能

### ターミナルのインタラクティブインターフェース

対話型 TUI を開始するには OpenCode を起動します:

```bash theme={null}
# Start in current directory
opencode

# Specify project directory
opencode /path/to/project
```

### ファイル操作

OpenCode はプロジェクトファイルの読み取り、検索、変更を行えます:

```text theme={null}
> View the contents of src/index.ts

> Search for all files containing "TODO" in the project

> Refactor the calculateSum function in utils.ts to a more efficient implementation
```

### コマンド実行

ターミナルでコマンドを実行し、結果を確認します:

```text theme={null}
> Run npm test and analyze the failed tests

> Execute npm install and check for dependency conflicts
```

### セッション管理

* **マルチセッションの並列実行**: 複数のセッションを同時に実行できます
* **セッション共有**: セッションをエクスポートして共有できます
* **自動保存**: すべてのセッションは自動的に保存されます
* **コンテキスト保持**: セッション中は会話コンテキスト全体を保持します

## 使用のヒント

### 1. キーボードショートカット

| ショートカット  | 機能           |
| -------- | ------------ |
| `Ctrl+C` | 現在の操作を中断     |
| `Ctrl+D` | OpenCode を終了 |
| `Tab`    | 自動補完         |
| `↑/↓`    | コマンド履歴を参照    |

### 2. よく使うコマンド

| コマンド       | 機能                 |
| ---------- | ------------------ |
| `/connect` | 新しい Provider に接続   |
| `/model`   | 現在のモデルを切り替え        |
| `/plan`    | 分析に plan エージェントを使用 |
| `/clear`   | 現在のセッションをクリア       |
| `/help`    | ヘルプ情報を表示           |

### 3. サブエージェントを呼び出す

複雑なクエリでは、検索サブエージェントを呼び出すために `@general` を使用します:

```text theme={null}
> @general Find all files handling user authentication in the codebase and summarize their functions
```

### 4. 段階的開発

```text theme={null}
{/* Step 1: Generate basic framework */}
> Create a basic REST API structure

{/* Step 2: Add specific features */}
> Add user authentication middleware

{/* Step 3: Refine details */}
> Add request parameter validation and error handling
```

## トラブルシューティング

<AccordionGroup>
  <Accordion title="APIYI への接続に失敗しました">
    1. 環境変数が正しく設定されているか確認してください:

    ```bash theme={null}
    echo $APIYI_API_KEY  # macOS/Linux
    echo %APIYI_API_KEY%  # Windows
    ```

    2. 設定ファイル内の baseURL を確認してください:

    ```json theme={null}
    "baseURL": "https://api.apiyi.com/v1"
    ```

    3. API 接続をテストしてください:

    ```bash theme={null}
    curl -H "Authorization: Bearer $APIYI_API_KEY" \
         https://api.apiyi.com/v1/models
    ```
  </Accordion>

  <Accordion title="モデルが見つからないエラー">
    モデル ID が正しいことを確認してください。対応モデルについては APIYI コンソールを確認してください。

    一般的なモデル ID:

    * `claude-sonnet-4-20250514`
    * `gpt-4.1`
    * `deepseek-chat`
    * `gemini-2.5-pro-preview-05-06`
  </Accordion>

  <Accordion title="設定ファイルが反映されない">
    設定ファイルの読み込み優先度（低い順から高い順へ）:

    1. リモート設定 (`.well-known/opencode`)
    2. グローバル設定: `~/.config/opencode/opencode.json`
    3. `OPENCODE_CONFIG` 環境変数
    4. プロジェクト設定: `opencode.json`
    5. `.opencode` ディレクトリ設定
    6. `OPENCODE_CONFIG_CONTENT` 環境変数

    設定ファイルが正しい場所にあり、有効な JSON 形式であることを確認してください。
  </Accordion>

  <Accordion title="応答が遅い">
    1. より軽量なモデル（例: GPT-4.1 Mini）を試してください
    2. コンテキスト長を短くし、新しいセッションを開始してください
    3. ネットワーク接続の安定性を確認してください
  </Accordion>
</AccordionGroup>

## ベストプラクティス

### 1. モデル選定戦略

| タスクの種類   | 推奨モデル           | 理由                             |
| -------- | --------------- | ------------------------------ |
| 複雑なコード生成 | Claude Sonnet 4 | 高いコーディング能力があり、コンテキスト理解にも優れています |
| コードレビュー  | GPT-4.1         | 高い分析力があり、細部への注意力に優れています        |
| 迅速な Q\&A | DeepSeek V3     | 応答が速く、コスト効率に優れています             |
| 長文書の分析   | Gemini 2.5 Pro  | 超長文コンテキストに対応しています              |

### 2. 効果的なプロンプト

```text theme={null}
❌ Poor prompt: Help me write code

✅ Good prompt: Write an HTTP middleware in TypeScript that
logs requests, including request method, path,
response time, and status code, using pino for output
```

### 3. セキュリティ上の考慮事項

* API キーをコード内にハードコードしないでください
* 機密情報の管理には環境変数を使用してください
* AI が生成したコード、特にセキュリティ関連の部分は必ず確認してください
* AI に危険なシステムコマンドを実行させないよう注意してください

### 4. コスト管理

* エージェントごとに異なるモデルを設定してください（ビルドには高性能モデル、一般用途には軽量モデル）
* 単純なタスクには軽量モデルを使用してください
* APIYI コンソールを定期的に確認して使用状況を監視してください

## 代替案

OpenCode がニーズに合わない場合は、次のツールを検討してください:

<CardGroup cols={2}>
  <Card title="Claude Code" icon="bot" href="/ja/scenarios/programming/claude-code">
    Anthropic の公式ターミナル向けプログラミングアシスタント
  </Card>

  <Card title="Codex CLI" icon="code" href="/ja/scenarios/programming/codex-cli">
    OpenAI の公式コマンドラインツール
  </Card>

  <Card title="Gemini CLI" icon="terminal" href="/ja/scenarios/programming/gemini-cli">
    Google の公式ターミナル向けプログラミングアシスタント
  </Card>

  <Card title="Roo Code" icon="wand-sparkles" href="/ja/scenarios/programming/roo-code">
    VS Code の AI プログラミング拡張機能
  </Card>
</CardGroup>

## 関連リソース

<CardGroup cols={2}>
  <Card title="APIYI Console" icon="settings" href="https://api.apiyi.com">
    APIキーを管理し、使用状況を確認する
  </Card>

  <Card title="Model Recommendations" icon="chart-bar" href="/ja/api-capabilities/model-info">
    プログラミングシナリオ向けのモデル推奨を表示する
  </Card>
</CardGroup>
