> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# APIマニュアル

> APIYI インターフェースの使用マニュアルです。APIYI は OpenAI 互換の AI ゲートウェイで、1つのコードで 400+ の主要な大規模モデルに接続できます。このページでは、モデルの探し方、オンラインテスト、迅速な統合を案内します。

APIYI は **OpenAI互換の AI ゲートウェイ** です。1 つの標準インターフェースと 1 つの API Key だけで、400 以上の主要な大規模モデルを呼び出せます。このページはナビゲーションハブであり、**どのモデルを使うべきか** をすばやく見つけ、**エンドポイントをオンラインでテスト** し、**統合方法** を学べるようにします。

## プラットフォーム概要

### OpenAI互換モード

APIYIは **OpenAI互換フォーマット** を使用します。モデルを切り替える場合は **`model` フィールドを変更する** だけです — それ以外はすべて同じです:

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

# Switching models = change only the `model` field, nothing else
response = client.chat.completions.create(
    model="gpt-5-chat-latest",   # swap in any supported model name
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)
```

<Note>
  正確なモデル名、料金、おすすめの利用シーンについては、下の「モデルを選択」にある2つの専用ページをご覧ください。情報が古くなるのを避けるため、ここには記載していません。
</Note>

### 機能対応範囲

<CardGroup cols={2}>
  <Card title="対応済み" icon="circle-check">
    * Chat Completions
    * 画像 / 動画生成
    * 音声文字起こし (Whisper)
    * エンベディング
    * 関数呼び出し
    * streaming出力 (SSE)
    * 標準のOpenAIパラメータ: `temperature`, `top_p`, `max_tokens`, など
    * Responses エンドポイント
  </Card>

  <Card title="非対応" icon="circle-x">
    * ファインチューニング
    * ファイル管理
    * 組織管理
    * 課金管理
  </Card>
</CardGroup>

## モデルを選ぶ

どのモデルを使うべきか迷っていますか？ 次の2ページでは、価格、機能比較、おすすめを随時更新しています。

<CardGroup cols={2}>
  <Card title="テキスト / マルチモーダルモデル" icon="sparkles" href="/ja/api-capabilities/model-info">
    GPT、Claude、Gemini、Grok、DeepSeek、Qwen、Kimi、GLM などの機能、価格、選定ガイド。
  </Card>

  <Card title="画像 / 動画モデル" icon="image" href="/ja/api-capabilities/image-video-models">
    Nano Banana、GPT-image、Seedream、Flux などの画像モデルに加え、VEO、Sora、Wan などの動画モデル。価格と利用方法を掲載しています。
  </Card>
</CardGroup>

## 基本情報

### API エンドポイント

* **Primary**: `https://api.apiyi.com/v1`
* **Backup**: `https://vip.apiyi.com/v1`

### 認証

すべてのリクエストには、ヘッダーに API キーを含める必要があります:

```http theme={null}
Authorization: Bearer YOUR_API_KEY
```

### リクエスト形式

* **Content-Type**: `application/json`
* **Encoding**: UTF-8
* **Method**: `POST` ほとんどのエンドポイントで使用

## クイックスタート

### API Keyを取得する

1. [APIYIコンソール](https://api.apiyi.com/token)にアクセスしてログインします
2. token管理ページで、「追加」をクリックしてAPI Keyを作成します
3. 生成されたKeyをコピーして、リクエストで使用します

### 多言語のコード例を取得する

コンソールには、多くの言語向けの、すぐに実行できるコード例が組み込まれており、最新のAPIバージョンと同期して更新されます。**まずはこちらを使用してください**:

1. [token管理ページ](https://api.apiyi.com/token)に移動します
2. 対象のAPI Keyの行で、「操作」列の🔧レンチアイコンをクリックします
3. 「リクエスト例」を選択すると、cURL、Python、Node.js、Java、C#、Go、PHP、Rubyなどの完全な例を表示できます

<img src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/apiyi-token-simple-code.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=067d8d551cd1d8aaebb833932e6632a5" alt="APIYI token管理 - リクエスト例" width="1496" height="902" data-path="images/apiyi-token-simple-code.png" />

## オンラインテスト（Playground）

「API リファレンス」セクションには、**オンライン Playground** があります。API Key を入力すると、リクエストを送信してライブのレスポンスを直接確認できます。コードは不要です。

<CardGroup cols={3}>
  <Card title="Chat Completions" icon="messages-square" href="/en/api-reference/chat/chat-completions">
    `POST /v1/chat/completions` — メインのチャットおよびマルチモーダル エンドポイントです。
  </Card>

  <Card title="モデル一覧" icon="list" href="/en/api-reference/models/list-models">
    `GET /v1/models` — 現在利用可能なモデルを照会します。
  </Card>

  <Card title="エンベディング" icon="braces" href="/en/api-reference/embeddings/create-embeddings">
    `POST /v1/embeddings` — テキストのベクトル化です。
  </Card>
</CardGroup>

<Note>
  画像生成および動画生成エンドポイント用の Playgrounds は、それぞれのモデルページにあります（上の「モデルを選択」の下にある画像 / 動画モデルページを参照してください）。
</Note>

## 最小例

最も一般的なエンドポイント — Chat Completions — を、そのままコピーして実行してください。より多くのパラメータや言語については、上のプレイグラウンドかコンソールの「リクエスト例」をご利用ください：

<Tabs>
  <Tab title="Python (SDK)">
    ```python theme={null}
    from openai import OpenAI

    client = OpenAI(
        api_key="YOUR_API_KEY",
        base_url="https://api.apiyi.com/v1"
    )

    response = client.chat.completions.create(
        model="gpt-5-chat-latest",
        messages=[
            {"role": "system", "content": "You are a helpful AI assistant."},
            {"role": "user", "content": "Hello! Please introduce yourself."}
        ],
        temperature=0.7,
        max_tokens=1000
    )

    print(response.choices[0].message.content)
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={null}
    curl -X POST "https://api.apiyi.com/v1/chat/completions" \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "gpt-5-chat-latest",
        "messages": [
          {"role": "system", "content": "You are a helpful AI assistant."},
          {"role": "user", "content": "Hello! Please introduce yourself."}
        ],
        "temperature": 0.7,
        "max_tokens": 1000
      }'
    ```
  </Tab>
</Tabs>

## ストリーミング応答

リクエストで `stream: true` を設定すると、レスポンスは Server-Sent Events（SSE） としてチャンクごとに返されます。タイプライター風の出力に最適です:

```python theme={null}
stream = client.chat.completions.create(
    model="gpt-5-chat-latest",
    messages=[{"role": "user", "content": "Tell a short joke"}],
    stream=True
)

for chunk in stream:
    content = chunk.choices[0].delta.content or ""
    print(content, end="", flush=True)
```

各 SSE 行は `data: ` で始まり、最後の行 `data: [DONE]` が終了を示します。

## エラーハンドリング

エンドポイントは OpenAI のエラー形式に従います:

```json theme={null}
{
  "error": {
    "message": "Invalid API key provided",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}
```

一般的なエラーコード:

| エラーコード                  | HTTP ステータス | 説明              |
| ----------------------- | ---------- | --------------- |
| invalid\_api\_key       | 401        | 無効な API key     |
| insufficient\_quota     | 429        | 残高不足            |
| model\_not\_found       | 404        | モデルが存在しません      |
| invalid\_request\_error | 400        | リクエストパラメータが無効です |
| rate\_limit\_exceeded   | 429        | リクエストのレートが高すぎます |
| server\_error           | 500        | サーバー内部エラー       |

<Tip>
  指数バックオフを実装してください。429 / 500 の場合は、間隔を倍々にして再試行すると、安定性が大きく向上します。API Key は環境変数に保存し、絶対にハードコードしないでください。
</Tip>

上の表は、各コードの意味だけを示しています。**具体的な原因はレスポンス本文の `error.message` にあります**。そしてそのテキストは、API レスポンス内でちょうど 1 回だけ返され、バックエンドログには保持されません。必ず全文を出力し、クライアント側に保存してください:

<Card title="API エラー詳細の取得" icon="clipboard-list" href="/ja/api-manual/error-reporting">
  生のエラーを自分で出力する必要がある理由、言語ごとの正しい取得パターン、保持すべき 7 つのフィールド、そしてそのままコピーして使えるサポートチケット用テンプレート
</Card>

## レート制限

| 制限タイプ                     | デフォルト   | 説明            |
| ------------------------- | ------- | ------------- |
| RPM (requests per minute) | 3000    | API key ごと    |
| TPM (tokens per minute)   | 1000000 | API key ごと    |
| 同時リクエスト数                  | 100     | 同時に処理されるリクエスト |

制限を超えると`429`が返されます。リクエストレートを適切に調整してください。

## ヘルプが必要ですか？

<CardGroup cols={2}>
  <Card title="モデルを選ぶ" icon="sparkles" href="/ja/api-capabilities/model-info">
    テキスト / マルチモーダルモデルのおすすめと料金。
  </Card>

  <Card title="オンラインでテスト" icon="play" href="/en/api-reference/chat/chat-completions">
    API Reference Playground を開いて、直接リクエストを送信してください。
  </Card>
</CardGroup>

* ウェブサイトを訪問: [api.apiyi.com](https://api.apiyi.com)
* 技術サポートメール: `support@apiyi.com`
