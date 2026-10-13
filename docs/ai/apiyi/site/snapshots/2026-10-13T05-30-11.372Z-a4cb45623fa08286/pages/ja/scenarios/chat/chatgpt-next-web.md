> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# ChatGPT Next Web

> ワンクリックデプロイ対応のWebベース ChatGPT 統合ガイド

ChatGPT Next Web は、ワンクリックでのデプロイと複数の AI モデルをサポートする、丁寧に設計された ChatGPT Web クライアントです。

## クイックデプロイ

### Vercel ワンクリックデプロイ

1. ワンクリックデプロイページを開きます: `vercel.com/new/clone?repository-url=https://github.com/Yidadaa/ChatGPT-Next-Web`
2. 環境変数を設定します:
   * `OPENAI_API_KEY`: お使いの APIYI キー
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

設定ページで以下を設定します：

* **APIキー**: APIYIキーを入力します
* **APIアドレス**: `https://api.apiyi.com`

### OpenAI以外のモデル

ClaudeやGeminiなどのモデルの場合：

1. 「カスタムモデル」に追加します
2. フォーマット: `+model-name@OpenAI`
3. 例: `+claude-opus-5@OpenAI`

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
DEFAULT_MODEL=gpt-5.4-mini
CUSTOM_MODELS=+claude-opus-5@OpenAI
```

## 利用のヒント

### モデル選定戦略

<Card title="現在利用されているモデルを見る" icon="star" href="/ja/api-capabilities/model-info">
  ライティング、コーディング、画像生成、動画生成をカバーする、最新のモデル推奨事項、性能比較、およびシナリオ別ガイダンス。
</Card>

### Promptの最適化

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


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.