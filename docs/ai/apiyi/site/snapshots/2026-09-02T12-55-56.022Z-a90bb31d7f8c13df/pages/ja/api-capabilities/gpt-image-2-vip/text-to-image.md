> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# テキストから画像生成 API リファレンス

> gpt-image-2-vip のテキストから画像生成 API リファレンスとインタラクティブなプレイグラウンド — テキストとサイズから画像を生成します。全サイズ一律で $0.03/画像

<Info>
  右側のインタラクティブなプレイグラウンドでは、オンラインで直接テストできます。API Key を **認証** フィールドに入力し（形式: `Bearer sk-xxx`）、`prompt` と `size` を設定してから、送信をクリックしてください。
</Info>

<Tip>
  **対象範囲**: このページは **text-to-image 生成** 用です。prompt を入力するだけで `size` できます。画像のアップロードは不要です。既存画像の編集や融合には、[画像編集エンドポイント](/ja/api-capabilities/gpt-image-2-vip/image-edit)を使用してください。

  **`gpt-image-2-all` との違い**: 呼び出し構造は同じで、追加されるのは `size` フィールド 1 つだけです。サイズを固定する必要がなく、最速の出力が欲しい場合は、代わりに [`gpt-image-2-all`](/ja/api-capabilities/gpt-image-2-all/text-to-image) を使用してください。
</Tip>

<Warning>
  **🖥️ ブラウザーの Playground の制限**

  このエンドポイントは**デフォルトで base64 文字列（`b64_json`）を返します**。これは数 MB になることもあるため、ブラウザーの Playground では `请求时发生错误: unable to complete request` が表示される場合があります。**実際にはリクエストは成功しています**。ブラウザーでは、これほど長い base64 文字列をレンダリングできないだけです。

  **推奨ワークフロー**: **以下のコードサンプルをコピーしてローカルで実行してください**。画像をデコードして、ファイルに自動で保存します。
</Warning>

<Info>
  すべての画像 API は**同期式**です。ポーリングする task ID はなく、クライアントが切断されると、リクエストは課金されたまま結果が失われます。このモデルでは十分に長いタイムアウトを設定してください。詳細は [Image API の基礎とベストプラクティス](/ja/api-capabilities/image-api-best-practices) を参照してください。
</Info>

<Warning>
  **⚠️ 重要なパラメータの注意点**

  * **`size`**: `auto` を指定すると、モデルに選択を任せられます（vip は、同じ prompt では比較的 **固定/安定** したサイズに収束する傾向があります）。厳密に固定したい場合は、対応する 30 種類のサイズ（10 比率 × 1K 高速 / 2K 推奨 / 4K 詳細 — [概要ページの完全なサイズ表](/ja/api-capabilities/gpt-image-2-vip/overview#supported-sizes-full-30-size-table) を参照）から 1 つを選んでください。小文字の ASCII `x` を使用し、たとえば `2048x1360`、`3840x2160` のようにします。`×` や大文字の `X` は使用しないでください。
  * **`quality`**: ❌ 受け付け不可 — **指定しないでください**。
  * **`n`**: ❌ 受け付け不可 — 1 回の呼び出しにつき画像は 1 枚です。**`n=3` を送信すると 3 倍課金されますが、それでも返る画像は 1 枚です。** このフィールドは削除してください。
  * **`aspect_ratio`**: ❌ 受け付け不可 — 比率は `size` によって決まります。
  * **`response_format`**: 省略すると base64（生データ、プレフィックスなし、2026-07 確認済み）を返します。画像 URL が必要な場合は `"url"` を指定してください。**URL 出力に依存する** ビジネス用途では、base64 フォールバックのない決定的な URL 出力を得るために、token を `image2_OSS` グループに切り替えてください。
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
        "model": "gpt-image-2-vip",
        "prompt": "Cinematic landscape, old lighthouse by the sea at dusk, photorealistic",
        "size": "2048x1152",         # 16:9 2K Recommended
        "response_format": "url"     # defaults to base64; explicit response_format needed to read the url field
    },
    timeout=300  # conservative; absorbs long-tail and image download
).json()

image_url = response["data"][0]["url"]
print(image_url)
```

**4K Detail ティアの例（壁紙 / 印刷）**:

```python theme={null}
import requests

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={"Authorization": "Bearer sk-your-api-key"},
    json={
        "model": "gpt-image-2-vip",
        "prompt": "Desktop wallpaper, cyberpunk city night, neon signs, wet pavement reflections",
        "size": "3840x2160"          # 16:9 4K Detail
    },
    timeout=300
).json()

# Verified 2026-07: b64_json is raw base64 (no data: prefix); earlier versions included the prefix — a check is safest
import base64
b64 = response["data"][0]["b64_json"]
if b64.startswith("data:"):
    b64 = b64.split(",", 1)[1]
with open("wallpaper.png", "wb") as f:
    f.write(base64.b64decode(b64))
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2-vip",
    "prompt": "Product shot of a white ceramic mug on a gray desk, soft natural light",
    "size": "2048x1360"
  }'
```

### Node.js

```javascript theme={null}
const API_KEY = "sk-your-api-key";

const response = await fetch(
  "https://api.apiyi.com/v1/images/generations",
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-image-2-vip",
      prompt: "1:1 square logo, minimalist cat line art",
      size: "2048x2048"        // 1:1 2K Recommended
    })
  }
);

const data = await response.json();
// Verified raw base64 (no data: prefix) — prepend before rendering; earlier versions included the prefix, so check first
let b64 = data.data[0].b64_json;
if (!b64.startsWith("data:")) b64 = `data:image/png;base64,${b64}`;
document.getElementById("result").src = b64;
```

### OpenAI SDK（Python、推奨）

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.generate(
    model="gpt-image-2-vip",
    prompt="Ink wash landscape painting, traditional Chinese style, vertical composition",
    size="1536x2048",        # 3:4 2K Portrait
)
print(resp.data[0].url)
```

## パラメーター

| Parameter | Type   | Required | Description                                                                                                                      |
| --------- | ------ | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `model`   | string | Yes      | `gpt-image-2-vip` に固定                                                                                                            |
| `prompt`  | string | Yes      | プロンプト — コンテンツ、スタイル、ライティングなどを記述します。                                                                                               |
| `size`    | string | **強く推奨** | 出力サイズ: `auto`（モデルが決定します — **vip は指定したプロンプトに対して比較的一定です**）または 30 のサイズのいずれか。形式は `WIDTHxHEIGHT`（小文字の `x`）；このフィールドを省略すると `auto` と同じです |

<Tip>
  **サイズ早見表** — ほとんどの場合はこれで足ります:

  * Eコマースのヒーローショット: `2048x1360` (3:2 2K) / `2048x2048` (1:1 2K)
  * 縦長ポスター: `1536x2048` (3:4 2K) / `2480x3312` (3:4 4K)
  * 動画サムネイル: `2048x1152` (16:9 2K) / `3840x2160` (16:9 4K)
  * ストーリー / スマホ壁紙: `1152x2048` (9:16 2K) / `2160x3840` (9:16 4K)

  30 サイズの完全な表: [概要ページ](/ja/api-capabilities/gpt-image-2-vip/overview#supported-sizes-full-30-size-table)。
</Tip>

## レスポンス形式

**デフォルトでは base64 を返します**（`data[0].b64_json`、プレフィックスなしの raw base64、2026-07 に検証済み）。代わりに **画像 URL** を取得するには、`response_format: "url"` を明示的に指定してください。**URL 出力に依存する**ビジネスは、base64 フォールバックなしで安定した URL 出力を得るために、token のグループを **`image2_OSS`** に切り替えてください。`data[0]` は `url` または `b64_json` のいずれかを返します — 両方が返ることはありません。

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

**`url` モード**（`response_format: "url"` を明示的に指定してください。URL に依存する場合は `image2_OSS` グループを使用してください — R2 CDN によりグローバルに高速化されています）:

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
  **互換性メモ**: 2026年7月に検証済み — `b64_json` フィールドは **`data:` プレフィックスなしの raw base64** です。ファイルを書き出すにはデコードするか、描画前にご自身でプレフィックスを付けてください。**以前のバージョンではプレフィックスが含まれていた**ため、両方の形式に対応できるよう、最初に必ず `startsWith('data:')` チェックを実行してください。
</Warning>

## 関連リソース

<CardGroup cols={2}>
  <Card title="モデル概要（全サイズ表）" icon="sparkles" href="/ja/api-capabilities/gpt-image-2-vip/overview">
    30サイズの完全な表、料金、技術仕様
  </Card>

  <Card title="画像編集 API" icon="image" href="/ja/api-capabilities/gpt-image-2-vip/image-edit">
    `/v1/images/edits` 複数画像の融合と編集
  </Card>

  <Card title="姉妹モデル gpt-image-2-all" icon="copy" href="/ja/api-capabilities/gpt-image-2-all/text-to-image">
    サイズを固定する必要がない場合は同じ呼び出し形式で、より高速に出力できます（約30～60秒）
  </Card>
</CardGroup>


## OpenAPI

````yaml api-reference/gpt-image-2-vip-generate-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: gpt-image-2-vip Text-to-Image API
  description: >
    GPT image generation reverse-engineered model `gpt-image-2-vip` (Codex line)
    — text-to-image endpoint.


    - Per-call billing, $0.03/image (flat across all sizes; no surcharge for 4K)

    - Supports 30 explicit sizes (10 ratios × 1K Fast / 2K Recommended / 4K
    Detail)

    - ~90–150s generation time, supports Chinese prompts

    - Does not accept quality / n / aspect_ratio

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
      summary: 'Text-to-Image: generate at an explicit size from a text prompt'
      description: >
        Generate images with `gpt-image-2-vip` from a text prompt and lock the
        output dimension via `size`.


        - `model` and `prompt` required; `size` strongly recommended

        - `size` must be one of the 30 supported sizes (see overview page)

        - Do not pass `quality` / `n`

        - For editing or multi-image fusion, use the [Image Editing
        endpoint](/en/api-capabilities/gpt-image-2-vip/image-edit)
      operationId: generateGptImage2VipTextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TextToImageRequest'
            example:
              model: gpt-image-2-vip
              prompt: >-
                Cinematic landscape, old lighthouse by the sea at dusk,
                photorealistic
              size: 2048x1152
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
        '400':
          description: size not in the 30-size set, or malformed
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
          description: Model name, fixed to gpt-image-2-vip
          enum:
            - gpt-image-2-vip
          default: gpt-image-2-vip
        prompt:
          type: string
          description: Prompt — describe content, style, lighting, etc.
          example: >-
            Cinematic landscape, old lighthouse by the sea at dusk,
            photorealistic
        size:
          type: string
          description: >
            Output size. Pass `auto` to let the model decide (vip tends to
            converge on a relatively fixed size for a given prompt), or pick one
            of the 30 supported sizes (10 ratios × 1K Fast / 2K Recommended / 4K
            Detail) to lock it strictly.

            Format: `WIDTHxHEIGHT` with lowercase ASCII `x`, e.g., `2048x1360`,
            `3840x2160`. Flat $0.03/image across all tiers.
          enum:
            - auto
            - 1280x1280
            - 848x1280
            - 1280x848
            - 960x1280
            - 1280x960
            - 1024x1280
            - 1280x1024
            - 720x1280
            - 1280x720
            - 1280x544
            - 2048x2048
            - 1360x2048
            - 2048x1360
            - 1536x2048
            - 2048x1536
            - 1632x2048
            - 2048x1632
            - 1152x2048
            - 2048x1152
            - 2048x864
            - 2880x2880
            - 2336x3520
            - 3520x2336
            - 2480x3312
            - 3312x2480
            - 2560x3216
            - 3216x2560
            - 2160x3840
            - 3840x2160
            - 3840x1632
          example: 2048x1152
    ImageResponse:
      type: object
      description: >
        Image generation response. **Returns base64 by default**
        (`data[0].b64_json`); to get a `url`, switch to the `image2_OSS` group
        with `response_format=url`. `data[0]` returns **either `url` or
        `b64_json`, never both**.
      properties:
        data:
          type: array
          description: Result array (this model returns 1 image per call)
          items:
            type: object
            properties:
              url:
                type: string
                description: >-
                  R2 CDN accelerated link (returned when using the image2_OSS
                  group with response_format=url)
              b64_json:
                type: string
                description: >-
                  Base64-encoded data URL (returned by default; already includes
                  the data:image/png;base64, prefix)
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