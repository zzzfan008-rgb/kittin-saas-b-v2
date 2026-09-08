> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 使用ガイド

> OpenClaw の使い方、コアスキル、よく使うコマンド、実践例

## 使用方法

### 方法 1: Web UI（推奨）

最も簡単な方法で、外部サービスは不要です:

```bash theme={null}
openclaw dashboard
```

ブラウザが `http://127.0.0.1:18789/` を開き、Web インターフェースで直接チャットできます。

<Tip>
  Web UI は、プロキシ要件なしで直接動作するため推奨されています。
</Tip>

### 方法 2: Telegram Bot

1. Telegram で `@BotFather` を検索します
2. ボットを作成するために `/newbot` を送信します
3. Bot Token を取得します
4. `openclaw onboard` 中に Token を入力します

<Warning>
  お住まいの地域で Telegram にプロキシが必要な場合:

  ```bash theme={null}
  export https_proxy=http://127.0.0.1:proxy-port
  export http_proxy=http://127.0.0.1:proxy-port
  openclaw gateway restart
  ```
</Warning>

### 方法 3: その他のプラットフォーム

OpenClaw は次にも対応しています:

* WhatsApp（QR をスキャンして接続）
* Discord（Bot の作成が必要です）
* Slack、Signal、iMessage、Microsoft Teams など

## コアスキル

OpenClaw には、さまざまなタスク向けの豊富な組み込みスキルが備わっています:

### ファイル操作

| スキル        | 機能                 |
| ---------- | ------------------ |
| `fs.read`  | ファイル（テキスト/画像）を読み取る |
| `fs.write` | ファイルを書き込む/作成する     |
| `fs.edit`  | ファイル内容を編集する        |

### システム操作

| スキル             | 機能                                |
| --------------- | --------------------------------- |
| `shell.exec`    | ターミナルコマンドを実行する                    |
| `shell.process` | 実行中のコマンドを管理する                     |
| `browser.*`     | ブラウザー自動化（ページを開く、スクリーンショット、クリックなど） |

### スマート機能

| スキル             | 機能                      |
| --------------- | ----------------------- |
| `web_search`    | ウェブ検索                   |
| `web_fetch`     | ウェブコンテンツを取得する           |
| `memory_search` | メモリを検索する                |
| `memory_get`    | メモリを取得する                |
| `cron.*`        | スケジュール済みタスク（リマインダー、自動化） |
| `tts`           | テキスト読み上げ                |

## 共通コマンド

### ターミナルコマンド

| コマンド                       | 機能               |
| -------------------------- | ---------------- |
| `openclaw onboard`         | セットアップウィザードを実行   |
| `openclaw gateway start`   | ゲートウェイサービスを開始    |
| `openclaw gateway restart` | ゲートウェイサービスを再起動   |
| `openclaw gateway stop`    | ゲートウェイサービスを停止    |
| `openclaw status`          | 実行中ステータスを確認      |
| `openclaw doctor`          | 設定の問題を診断         |
| `openclaw doctor --fix`    | 設定の問題を自動修正       |
| `openclaw dashboard`       | Web コントロールパネルを開く |
| `openclaw logs --follow`   | リアルタイムログを表示      |
| `openclaw configure`       | 設定を変更            |
| `openclaw update`          | 最新バージョンに更新       |

### チャットコマンド

チャットウィンドウで使用できるコマンド:

| コマンド              | 機能          |
| ----------------- | ----------- |
| `/help`           | ヘルプを表示      |
| `/new`            | 新しい会話を開始    |
| `/reset`          | 会話をリセット     |
| `/stop`           | 現在のタスクを停止   |
| `/think <level>`  | 思考の深さを設定    |
| `/model <id>`     | モデルを切り替え    |
| `/verbose on/off` | 詳細モードを切り替え  |
| `/status`         | ステータスを確認    |
| `/skills`         | 使用可能なスキルを表示 |

## 使用例

OpenClaw と自然に会話すると、タスクを理解して実行します:

### ファイル操作

```text theme={null}
> Create a test.txt file on my desktop with content "hello world"

> Read the content of ~/Documents/notes.txt

> Move all .png files from desktop to Pictures folder
```

### ターミナルコマンド

```text theme={null}
> List all files on my desktop

> Check current system memory usage

> Install the Python requests library
```

### ブラウザー制御

```text theme={null}
> Open browser and visit google.com

> Search for the latest MacBook Pro prices

> Take a screenshot of the current webpage
```

### スケジュール済みタスク

```text theme={null}
> Remind me to drink water every day at 9am

> Remind me to take a break every hour

> Remind me about the meeting tomorrow at 3pm
```

### プログラミング支援

```text theme={null}
> Write a Python script to batch rename files

> What's wrong with this code: [paste code]

> Create a simple HTML page for me
```

## 推奨モデル

OpenClaw は APIYI を通じて 400+ の主要な AI モデルをサポートしています。さまざまなタスクに適したモデルを選択してください。

<Card title="モデルのおすすめを見る" icon="star" href="/ja/api-capabilities/model-info">
  テキスト作成、プログラミング、迅速な応答、長文書処理など、最新のシナリオ別モデルおすすめを確認できます。
</Card>

### シナリオ別おすすめ

| タスク種類     | 推奨モデル           | 理由                  |
| --------- | --------------- | ------------------- |
| 複雑なタスクの実行 | Claude Sonnet 4 | 高い理解力、正確な実行         |
| 日常会話      | GPT-5.4         | 自然な応答、優れた汎用性        |
| コード作成     | DeepSeek V3.2   | 強いコーディング能力、コスト効率が高い |
| 長文書処理     | Gemini 3.1 Pro  | 超長文コンテキストをサポート      |
