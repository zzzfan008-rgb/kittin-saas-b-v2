> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Open WebUI

> 機能豊富なセルフホスト型AIインターフェース統合ガイド

Open WebUI は、完全オフライン動作をサポートする、機能豊富なセルフホスト型 AI プラットフォームです。APIYI を通じて、Open WebUI にさまざまな主要な大規模言語モデルを統合できます。

## クイックデプロイ

### Docker クイックスタート

```bash theme={null}
docker run -d -p 3000:8080 \
  --add-host=host.docker.internal:host-gateway \
  -v open-webui:/app/backend/data \
  --name open-webui \
  --restart always \
  ghcr.io/open-webui/open-webui:main
```

### Docker Compose デプロイ

```yaml theme={null}
version: '3.6'

services:
  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: open-webui
    ports:
      - "3000:8080"
    volumes:
      - open-webui:/app/backend/data
    environment:
      - OPENAI_API_BASE_URL=https://api.apiyi.com
      - OPENAI_API_KEY=Your APIYI key
    restart: unless-stopped

volumes:
  open-webui:
```

## APIYI の設定

### 方法1: 環境変数による設定

デプロイ時に環境変数を設定します:

```bash theme={null}
docker run -d -p 3000:8080 \
  -e OPENAI_API_BASE_URL=https://api.apiyi.com \
  -e OPENAI_API_KEY=Your APIYI key \
  -v open-webui:/app/backend/data \
  --name open-webui \
  ghcr.io/open-webui/open-webui:main
```

### 方法2: インターフェースによる設定

1. Open WebUI の管理画面にアクセスします
2. **設定** > **接続** に移動します
3. **OpenAI API** セクションで設定します:
   * **API Base URL**: `https://api.apiyi.com/v1`
   * **API Key**: APIYI のキーを入力します
4. 設定を保存します

<Info>
  **設定のポイント**

  * API Base URL には `/v1` サフィックスを含める必要があります
  * API Key は [APIYI Console](https://api.apiyi.com) から取得できます
  * 管理と更新を容易にするため、環境変数による方法の使用を推奨します
</Info>

## 対応モデル

Open WebUI は APIYI を通じて 400以上の主要な AI モデルをサポートしています。

<Card title="今すぐおすすめのモデルを見る" icon="star" href="/ja/api-capabilities/model-info">
  最新のモデルおすすめ、パフォーマンス比較、シナリオ別ガイダンス — 執筆、プログラミング、高速応答、画像生成、動画生成などを網羅しています。
</Card>

<Info>
  **なぜここでは個別のモデルを掲載しないのですか？**

  AI モデルは急速に更新されます。常に正確なおすすめをお届けするため、モデル一覧、パフォーマンスデータ、利用ガイダンスは 1 か所にまとめて管理しています: [モデルおすすめページ](/ja/api-capabilities/model-info)。
</Info>

## コア機能

### RAG（Retrieval-Augmented Generation）

Open WebUI は、ドキュメントのアップロードとナレッジベース機能をサポートしています。

1. **ドキュメントのアップロード**
   * PDF、TXT、DOCX などの形式に対応しています
   * 自動ベクトル化して保存できます
   * 多言語ドキュメントに対応しています

2. **ナレッジベース管理**
   * 専用のナレッジベースを作成できます
   * ドキュメントの分類とタグ付けができます
   * インテリジェントな検索マッチングに対応しています

### OpenAI 互換API

Open WebUI は、完全なOpenAI互換APIを提供しています。

```bash theme={null}
# Chat completion
curl -X POST "http://localhost:3000/api/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer Your APIYI key" \
  -d '{
    "model": "gpt-4-turbo",
    "messages": [
      {"role": "user", "content": "Hello, world!"}
    ]
  }'
```

### ツール連携

外部ツールとプラグインに対応しています:

* Web検索
* コード実行
* 画像生成
* ドキュメント処理

## 詳細設定

### 複数モデルの設定

`docker-compose.yml`で複数のモデルソースを設定します:

```yaml theme={null}
environment:
  - OPENAI_API_BASE_URL=https://api.apiyi.com
  - OPENAI_API_KEY=Your APIYI key
  - ENABLE_OPENAI_API=true
  - ENABLE_OLLAMA_API=false
```

### ユーザー権限の管理

```yaml theme={null}
environment:
  - ENABLE_SIGNUP=false
  - DEFAULT_USER_ROLE=user
  - WEBHOOK_URL=Your webhook address
```

### データの永続化

```yaml theme={null}
volumes:
  - open-webui:/app/backend/data
  - ./uploads:/app/backend/data/uploads
  - ./vector_db:/app/backend/data/vector_db
```

## API統合例

### Python連携

```python theme={null}
import requests

# Open WebUI API endpoint
api_url = "http://localhost:3000/api/chat/completions"

# Request configuration
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer Your APIYI key"
}

data = {
    "model": "gpt-4-turbo",
    "messages": [
        {"role": "user", "content": "Explain the basic principles of quantum computing"}
    ],
    "stream": False
}

# Send request
response = requests.post(api_url, headers=headers, json=data)
result = response.json()
print(result["choices"][0]["message"]["content"])
```

### JavaScript連携

```javascript theme={null}
const apiUrl = 'http://localhost:3000/api/chat/completions';

const requestData = {
  model: 'gpt-4-turbo',
  messages: [
    { role: 'user', content: 'Write a simple Python function' }
  ]
};

fetch(apiUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer Your APIYI key'
  },
  body: JSON.stringify(requestData)
})
.then(response => response.json())
.then(data => {
  console.log(data.choices[0].message.content);
});
```

## トラブルシューティング

### よくある問題

**接続に失敗しました**

* API Base URL が正しいか確認してください: `https://api.apiyi.com/v1`
* API Key の有効性を確認してください
* ファイアウォール設定を確認してください

**モデルを利用できません**

* アカウント残高を確認してください
* モデルがサービス対象範囲内か確認してください
* APIYI のサービス状況を確認してください

**アップロードに失敗しました**

* ファイル形式のサポートを確認してください
* 十分なストレージ容量があるか確認してください
* ファイルサイズ制限を確認してください

### ログのデバッグ

デバッグモードを有効にします:

```bash theme={null}
docker logs -f open-webui
```

詳細ログを表示します:

```yaml theme={null}
environment:
  - LOG_LEVEL=DEBUG
  - WEBUI_DEBUG=true
```

## ベストプラクティス

### パフォーマンス最適化

1. **モデルの選択**
   * タスクの複雑さに合ったモデルを選択します
   * モデル選定の最新ガイダンスについては、[モデル推奨ページ](/ja/api-capabilities/model-info)を参照してください

2. **キャッシュ戦略**
   * 会話キャッシュを有効にします
   * 適切なキャッシュ有効期限を設定します
   * 未使用のキャッシュを定期的に削除します

3. **リソース管理**
   * メモリ使用量を監視します
   * 適切な同時実行数の上限を設定します
   * ユーザーデータを定期的にバックアップします

### セキュリティ設定

```yaml theme={null}
environment:
  - ENABLE_ADMIN_EXPORT=false
  - ENABLE_ADMIN_CHAT_ACCESS=false
  - JWT_EXPIRES_IN=7d
```

### 監視アラート

モニタリングシステムを統合します:

```yaml theme={null}
environment:
  - ENABLE_WEBHOOKS=true
  - WEBHOOK_URL=https://your-monitoring-url
```

さらにヘルプが必要ですか？[Open WebUI 公式ドキュメント](https://docs.openwebui.com)を確認するか、[APIYI 公式サイト](https://api.apiyi.com)をご覧ください。
