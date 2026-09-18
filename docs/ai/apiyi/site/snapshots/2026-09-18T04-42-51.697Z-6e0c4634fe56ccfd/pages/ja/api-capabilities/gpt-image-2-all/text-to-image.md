> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# テキストから画像への API リファレンス

> gpt-image-2-all テキストから画像への API リファレンスとインタラクティブなプレイグラウンド — text prompt から画像を生成、$0.03/画像

<Info>
  右側のインタラクティブな Playground では、直接オンラインでテストできます。**Authorization** フィールドに API Key を入力し（形式: `Bearer sk-xxx`）、prompt を入力して送信してください。
</Info>

<Tip>
  **対象**: このページは **text-to-image generation** 用です。prompt を入力するだけで、画像のアップロードは不要です。既存の画像を編集または融合するには、[画像編集 endpoint](/ja/api-capabilities/gpt-image-2-all/image-edit) を使用してください。
</Tip>

<Warning>
  **🖥️ ブラウザ Playground の制限（デフォルトの b64\_json モード）**

  この endpoint は **`response_format: "b64_json"` がデフォルト** なので、レスポンスには数MB規模の base64 文字列が含まれ、ブラウザ Playground では `请求时发生错误: unable to complete request` と表示されることがあります — **リクエスト自体は実際には成功しています**; ブラウザはそのような長い base64 文字列をレンダリングできないだけです。

  **推奨ワークフロー**:

  * Playground で画像を表示したいだけですか? **`"response_format": "url"` を明示的に指定してください** — レスポンスは 1 本の R2 リンクになり、問題なく表示されます。
  * base64 が欲しいですか? **下のコードサンプルをコピーしてローカルで実行してください** — コードが自動でデコードし、画像をファイルに保存します。
</Warning>

<Info>
  すべての image API は **同期型** です — ポーリングする task ID はなく、クライアントが切断されると、リクエストがまだ課金対象のままでも結果は失われます。この model では十分に長い timeout を設定してください。詳細は [Image API Essentials & Best Practices](/ja/api-capabilities/image-api-best-practices) を参照してください。
</Info>

<Warning>
  **⚠️ パラメータ対応**

  * **`size`**: **このフィールドは効果がありません** — `auto` や任意の具体的な値を送ってもエラーにはならず、値はサーバー側で **黙って無視** されます。サイズは完全に prompt によって決まります:
    * prompt にサイズ/比率の指定がある場合（例: "Landscape 16:9"）→ model は prompt に従います
    * prompt にサイズのヒントがない場合 → 同じ prompt でも呼び出しごとに **異なるサイズ** が返り、"drawing different cards" のようになります — 複数の構図を試すのに便利です
    * サイズを厳密に固定したい場合は、[`gpt-image-2-vip`](/ja/api-capabilities/gpt-image-2-vip/text-to-image) を使用してください（`auto` + 30 の明示サイズに対応）
  * **`n` / `quality` / `aspect_ratio`**: ❌ 拒否されます。これらを送信すると、パラメータ検証エラーが発生する場合があります。

  サイズと比率は `prompt` に直接書いてください。例:

  * `Landscape 16:9 cinematic, old lighthouse by the sea at dusk`
  * `Portrait 9:16 phone wallpaper, cyberpunk city rainy night`
  * `1024×1024 square logo, minimalist cat line art`

  **サイズの説明は prompt の先頭に置いてください**。そうすると、より意図どおりに反映されやすくなります。
</Warning>

## コード例

### Python

```python theme={null}
import requests

API_KEY = "sk-your-api-key"

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
        "model": "gpt-image-2.5-all",
        "prompt": "Landscape 16:9 cinematic, old lighthouse at sunset, photorealistic",
        "response_format": "url"
    },
    timeout=300  # conservative — absorbs tail latency + image download time
).json()

image_url = response["data"][0]["url"]
print(image_url)
```

**b64\_json モード（base64 画像データを返します）**:

```python theme={null}
import base64
import requests

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={"Authorization": "Bearer sk-your-api-key"},
    json={
        "model": "gpt-image-2.5-all",
        "prompt": "1024x1024 square logo, minimalist cat line art",
        "response_format": "b64_json"
    },
    timeout=300  # conservative — absorbs tail latency + image download time
).json()

# Verified 2026-07: b64_json is raw base64 (no data: prefix); earlier versions included the prefix — a check is safest
b64 = response["data"][0]["b64_json"]
if b64.startswith("data:"):
    b64 = b64.split(",", 1)[1]
with open("output.png", "wb") as f:
    f.write(base64.b64decode(b64))
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2.5-all",
    "prompt": "Landscape 16:9 cinematic, old lighthouse at sunset",
    "response_format": "url"
  }'
```

### Node.js

```javascript theme={null}
import { Agent, setGlobalDispatcher } from "undici";
import { writeFile } from "node:fs/promises";

const API_KEY = "sk-your-api-key";

// Image endpoints mean long silences plus MB-scale bodies, while undici's default
// connect timeout is only 10s and is NOT governed by AbortSignal.timeout below
// (different layers) — widen all three explicitly
setGlobalDispatcher(new Agent({
  connect: { timeout: 30_000 },
  headersTimeout: 300_000,
  bodyTimeout: 300_000,
}));

const response = await fetch(
  "https://api.apiyi.com/v1/images/generations",
  {
    method: "POST",
    signal: AbortSignal.timeout(300_000),   // total timeout — a different layer
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-image-2.5-all",
      prompt: "1024x1024 square logo, minimalist cat line art",
      response_format: "b64_json"
    })
  }
);

const data = await response.json();
// Verified raw base64 (no data: prefix); earlier versions included one, so check first
let b64 = data.data[0].b64_json;
if (b64.startsWith("data:")) b64 = b64.slice(b64.indexOf(",") + 1);
await writeFile("output.png", Buffer.from(b64, "base64"));
```

<Tip>
  上記の `undici` import は別途インストールする必要があります（`npm i undici`）。これは組み込みの `fetch` を動作させますが、そのモジュール名では公開されておらず、インストールしたコピーも `setGlobalDispatcher` を介して組み込みの `fetch` に到達します。

  `maxRetries`、`connectTimeout`、およびリクエスト全体のタイムアウトは、それぞれ異なるレイヤーに存在します。誤ったものを設定することは、Node.js 側で最もよくある落とし穴です。接続のリセット、`UND_ERR_CONNECT_TIMEOUT`、またはプロキシ経由での大きなレスポンスの途中切断については、[画像 API の接続切断に関するトラブルシューティング](/ja/api-capabilities/image-connection-drops)を参照してください。
</Tip>

### ブラウザー JavaScript（Fetch）

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'gpt-image-2.5-all',
        prompt: 'Portrait 9:16 phone wallpaper, cyberpunk city rainy night',
        response_format: 'b64_json'
    })
});
const { data } = await resp.json();
let b64 = data[0].b64_json;
if (!b64.startsWith('data:')) b64 = `data:image/png;base64,${b64}`;
document.getElementById('result').src = b64;
```

## パラメータクイックリファレンス

| パラメータ             | 型      | 必須  | 説明                                                                                                                                |
| ----------------- | ------ | --- | --------------------------------------------------------------------------------------------------------------------------------- |
| `model`           | string | はい  | `gpt-image-2.5-all`または`gpt-image-2-all`（価格と動作は同じです）                                                                               |
| `prompt`          | string | はい  | プロンプト。サイズ／比率／スタイルをここに指定します                                                                                                        |
| `size`            | string | いいえ | `auto`のみ受け付けます（同じプロンプトでも寸法は変動します）。サイズを厳密に固定する場合は、[`gpt-image-2-vip`](/ja/api-capabilities/gpt-image-2-vip/text-to-image)を使用してください |
| `response_format` | string | いいえ | `b64_json`（デフォルト、raw base64）または`url`（R2 CDNリンクを返します）。常に明示的に指定してください                                                               |

<Tip>
  詳細なパラメータの制約と許可される値は、右側のプレイグラウンドに表示されます。`response_format`フィールドではドロップダウンから選択できます。
</Tip>

## レスポンス形式

**`data[0]` は `url` または `b64_json` のいずれかを返します — 両方ではありません**（`response_format` によります）。このエンドポイントは **既定で `b64_json` です**。

**`b64_json` モード**（デフォルト）:

```json theme={null}
{
  "data": [
    {
      "b64_json": "iVBORw0KGgoAAAANSUhEUgAA..."
    }
  ],
  "created": 1778037127,
  "usage": {
    "input_tokens": 98,
    "output_tokens": 1185,
    "total_tokens": 1283
  }
}
```

**`url` モード**（明示的な `"response_format": "url"` が必要、R2 CDN によるグローバル加速あり）:

```json theme={null}
{
  "data": [
    {
      "url": "https://r2cdn.copilotbase.com/r2cdn2/0e82148a-bec0-4b42-bbca-117c6b42581b.png"
    }
  ],
  "created": 1778037331,
  "usage": {
    "input_tokens": 30,
    "output_tokens": 2074,
    "total_tokens": 2104
  }
}
```

<Warning>
  **互換性に関する注意**: 2026年7月に確認済み — `b64_json` フィールドは **`data:` プレフィックスのない生の base64** です。ファイルとして書き込むにはデコードするか、描画前に自分でプレフィックスを付けてください。**以前のバージョンにはプレフィックスが含まれていました** ので、両方の形式に対応するため、必ず最初に `startsWith('data:')` チェックを実行してください。
</Warning>


## OpenAPI

````yaml api-reference/gpt-image-2-all-generate-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: gpt-image-2-all Text-to-Image API
  description: >
    GPT image generation reverse-engineered model `gpt-image-2-all` —
    text-to-image endpoint.


    - Per-call billing, $0.03/image

    - ~30–60s generation time, supports Chinese prompts

    - Describe size/ratio/style in the `prompt`. **The `size` field has no
    effect** — sending `size=auto` or any concrete value does not error, but the
    value is silently ignored; the prompt is the sole driver of dimensions, and
    the same prompt yields varied dimensions across calls (good for "drawing
    multiple variants"). `n` / `quality` are not supported either. For strict
    size locking, use `gpt-image-2-vip`.

    - **Defaults to base64 (`b64_json`); can switch to R2 CDN URL (`url`)**.
    `data[0]` returns either `url` **or** `b64_json` — never both in the same
    response.


    **Authentication**: Add `Authorization: Bearer YOUR_API_KEY` to request
    headers


    **Get API Key**: Visit [API易 Console](https://api.apiyi.com/token) to create
    a token
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
  - url: https://vip.apiyi.com
    description: Backup endpoint
security:
  - bearerAuth: []
paths:
  /v1/images/generations:
    post:
      tags:
        - Text-to-Image
      summary: 'Text-to-Image: generate an image from a text prompt'
      description: >
        Generate images with `gpt-image-2-all` from a text prompt.


        - Only `model` and `prompt` are required

        - Size/ratio goes directly in the prompt (e.g., "Landscape 16:9
        cinematic")

        - For editing or multi-image fusion, use the [Image Editing
        endpoint](/en/api-capabilities/gpt-image-2-all/image-edit)
      operationId: generateGptImage2AllTextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TextToImageRequest'
            example:
              model: gpt-image-2.5-all
              prompt: Landscape 16:9 cinematic, old lighthouse at sunset
              response_format: b64_json
      responses:
        '200':
          description: >-
            Image successfully generated. Defaults to base64 in
            `data[0].b64_json` — `url` is not returned in the same response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
              example:
                data:
                  - b64_json: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
                created: 1778037127
                usage:
                  input_tokens: 98
                  output_tokens: 1185
                  total_tokens: 1283
        '401':
          description: Unauthorized - Invalid API Key
        '429':
          description: Rate limited or quota exhausted
        '500':
          description: Internal server error
      security:
        - bearerAuth: []
components:
  schemas:
    TextToImageRequest:
      type: object
      required:
        - model
        - prompt
      properties:
        model:
          type: string
          description: >-
            Model name: gpt-image-2.5-all or gpt-image-2-all (same ChatGPT web
            line, same price and behavior)
          enum:
            - gpt-image-2.5-all
            - gpt-image-2-all
          default: gpt-image-2.5-all
        prompt:
          type: string
          description: >-
            Prompt. Include size/ratio/style here, e.g., Landscape 16:9
            cinematic, old lighthouse at sunset
          example: Landscape 16:9 cinematic, old lighthouse at sunset
        response_format:
          type: string
          description: >-
            Response format. b64_json returns a base64 string already prefixed
            with a data URL header (default); url returns an R2 CDN link
          enum:
            - b64_json
            - url
          default: b64_json
    ImageResponse:
      type: object
      description: >
        Image generation response. `data[0]` returns **either `url` or
        `b64_json`, never both** (depends on `response_format`; this endpoint
        defaults to `b64_json`).
      properties:
        data:
          type: array
          description: Result array (this model returns 1 image per call)
          items:
            type: object
            properties:
              url:
                type: string
                description: R2 CDN accelerated link (returned when response_format=url)
              b64_json:
                type: string
                description: >-
                  Base64-encoded data URL (returned when
                  response_format=b64_json; already includes the
                  data:image/png;base64, prefix)
        created:
          type: integer
          description: Unix timestamp (seconds)
        usage:
          type: object
          description: Token usage statistics
          properties:
            input_tokens:
              type: integer
              description: Input tokens
            output_tokens:
              type: integer
              description: Output tokens (includes image-pixel accounting)
            total_tokens:
              type: integer
              description: Total tokens
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key from the API易 Console

````