> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# ChatGPT Next Web

> ワンクリックデプロイ対応のWebベース ChatGPT 統合ガイド

ChatGPT Next Web は、ワンクリックでのデプロイと複数の AI モデルをサポートする、丁寧に設計された ChatGPT Web クライアントです。

## クイックデプロイ

### Vercel ワンクリックデプロイ

1. [One-Click Deploy](https://vercel.com/new/clone?repository-url=https://github.com/Yidadaa/ChatGPT-Next-Web) をクリックします
2. 環境変数を設定します:
   * `OPENAI_API_KEY`: APIYI のキー
   * `BASE_URL`: `https://api.apiyi.com`
3. デプロイを完了します

### Docker デプロイ

```bash theme={null}
docker run -d \
  --name chatgpt-next-web \
  -p 3000:3000 \
  -e OPENAI_API_KEY="Your APIYI key" \
  -e BASE_URL="https://api.apiyi.com" \
  yidadaa/chatgpt-next-web
```

## 設定手順

### 基本設定

設定ページで次のように設定します:

* **API Key**: APIYIのキーを入力します
* **API Address**: `https://api.apiyi.com`

### OpenAI以外のモデル

Claude、Gemini などのモデルの場合:

1. 「カスタムモデル」に追加します
2. 形式: `+model-name@OpenAI`
3. 例: `+claude-3-opus-20240229@OpenAI`

## コア機能

### プリセットプロンプト

組み込みのリッチなプロンプトテンプレート

### マスク機能

プリセットのAIロールを作成

### 会話エクスポート

Markdown、画像、PDF形式に対応

### アクセス制御

アプリケーションにパスワード保護を設定します

## 環境変数

```bash theme={null}
# API Configuration
OPENAI_API_KEY=Your APIYI key
BASE_URL=https://api.apiyi.com

# Access Control
CODE=Your access password

# Model Configuration
DEFAULT_MODEL=gpt-3.5-turbo
CUSTOM_MODELS=+claude-3-opus-20240229@OpenAI
```

## 使用のヒント

### モデル選択戦略

| タスク種別      | 推奨モデル         | 理由      |
| ---------- | ------------- | ------- |
| 日常会話       | GPT-3.5-Turbo | 高速で経済的  |
| 複雑な推論      | GPT-4         | 高精度     |
| 創作         | Claude 3      | 高い創造性   |
| コードプログラミング | GPT-4         | 優れた論理能力 |

### prompt の最適化

```markdown theme={null}
# Role Setting
You are an experienced [specific role]

# Task Description
Please help me [specific task]

# Output Requirements
- Requirement 1
- Requirement 2
```

## よくある問題

### モデルが表示されない

v2.13.0 以上のバージョンを使用していることを確認してください

### 接続に失敗しました

APIアドレスを確認してください: `https://api.apiyi.com`

### 返信が中断されました

残高とネットワーク接続を確認してください

## 更新メンテナンス

### Vercel の更新

GitHub で fork を同期すると、Vercel が自動的に再デプロイします

### Docker の更新

```bash theme={null}
docker pull yidadaa/chatgpt-next-web
docker stop chatgpt-next-web
docker rm chatgpt-next-web
# Re-run container
```
