> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# テキストから画像生成 API リファレンス

> gpt-image-2-vip のテキストから画像生成 API リファレンスとインタラクティブなプレイグラウンド — テキストとサイズから画像を生成します。全サイズ一律で $0.03/画像

<Info>
  右側のインタラクティブなPlaygroundでは、オンラインで直接テストが行えます。**Authorization**フィールドにAPI Key（形式：`Bearer sk-xxx`）を入力し、`prompt`と`size`を設定して、送信をクリックしてください。
</Info>

<Tip>
  **適用範囲**: このページは**テキストからの画像生成**を対象としています。画像のアップロードは不要で、promptと`size`を入力するだけです。既存の画像を編集または合成する場合は、[画像編集エンドポイント](/ja/api-capabilities/gpt-image-2-vip/image-edit)をご利用ください。

  **`gpt-image-2-all`との違い**: 呼び出し構造は同一で、`size`フィールドが1つ追加されているだけです。サイズを固定する必要がなく、最速の出力を希望される場合は、代わりに[`gpt-image-2-all`](/ja/api-capabilities/gpt-image-2-all/text-to-image)をご利用ください。
</Tip>

<Warning>
  **🖥️ ブラウザPlaygroundの制限事項**

  このエンドポイントは**デフォルトでbase64文字列（`b64_json`）を返します**。これは数MBになる場合があるため、ブラウザのPlaygroundに`请求时发生错误: unable to complete request`と表示されることがあります — **リクエスト自体は実際には成功しています**。ブラウザ側でこれほど長いbase64文字列をレンダリングできないだけです。

  **推奨されるワークフロー**: **以下のコードサンプルをコピーしてローカルで実行してください** — 画像を自動的にデコードしてファイルに保存します。
</Warning>

<Info>
  すべての画像APIは**同期的**です — ポーリング用のタスクIDは存在せず、クライアントが切断された場合、リクエストに対して課金されたままで結果は失われます。このモデルには十分なタイムアウトを設定してください。詳細は[画像APIの基本とベストプラクティス](/ja/api-capabilities/image-api-best-practices)をご覧ください。
</Info>

<Warning>
  **⚠️ 主要パラメータの注意事項**

  * **`size`**: モデルに選択させる場合は`auto`を渡し（vipは指定されたpromptに対して比較的**固定／安定した**サイズに収束する傾向があります）、厳密に固定したい場合はサポートされている30種類のサイズ（10種類のアスペクト比 × 1K Fast / 2K Recommended / 4K Detail — [概要ページの全サイズ一覧表](/ja/api-capabilities/gpt-image-2-vip/overview#supported-sizes-full-30-size-table)を参照）から1つ選択してください。小文字のアスキー文字`x`を使用してください（例：`2048x1360`、`3840x2160`）。決して`×`や大文字の`X`は使用しないでください。
  * **`quality`**: 任意であり、テストにおいて有効です（チャンネルの挙動であり確約ではありません — 実際のレスポンスをご確認ください）。2.5モデル（`gpt-image-2.5-vip` = `gpt-image-2.5-sunburst-vip`、`gpt-image-2.5-flare-vip`）は、`auto` / `low` / `medium` / `high` / `xhigh` / `max`の6つのティアすべてを受け付けます。`gpt-image-2-vip`は`high`までとなり、`xhigh` / `max`は拒否されます。同名のティアでも同等ではありません。2.5の`high`は`gpt-image-2-vip`の`medium`にのみ一致し、2.5の`max`はその`high`に一致します。画像1枚あたり一律\$0.03という価格はティアによって変わりませんが、上位ティアほど時間がかかります。
  * **`n`**: ❌ 拒否されます — 1回の呼び出しにつき画像1枚です。**`n=3`を送信すると3倍課金されますが、返される画像は1枚のままです。** このフィールドは除外してください。
  * **`aspect_ratio`**: ❌ 拒否されます — アスペクト比は`size`によって決定されます。
  * **`response_format`**: 省略するとbase64が返されます（プレフィックスなしの生データ、2026-07検証済み）。画像URLを取得するには`"url"`を渡してください。**URL出力に依存する**ビジネスでは、base64へのフォールバックなしで確実にURLを出力するために、tokenを`image2_OSS`グループに切り替えてください。
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
        "model": "gpt-image-2.5-vip",
        "prompt": "Cinematic landscape, old lighthouse by the sea at dusk, photorealistic",
        "size": "2048x1152",         # 16:9 2K Recommended
        "response_format": "url"     # defaults to base64; explicit response_format needed to read the url field
    },
    timeout=300  # conservative; absorbs long-tail and image download
).json()

image_url = response["data"][0]["url"]
print(image_url)
```

**4Kディテール階層の例（壁紙／印刷）**:

```python theme={null}
import requests

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={"Authorization": "Bearer sk-your-api-key"},
    json={
        "model": "gpt-image-2.5-vip",
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
    "model": "gpt-image-2.5-vip",
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
      model: "gpt-image-2.5-vip",
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
    model="gpt-image-2.5-vip",
    prompt="Ink wash landscape painting, traditional Chinese style, vertical composition",
    size="1536x2048",        # 3:4 2K Portrait
)
print(resp.data[0].url)
```

## パラメータ

| パラメータ | 型 | 必須 | 説明 |
| - | - | - | - |
| `model` | string | はい | `gpt-image-2.5-vip` (= `gpt-image-2.5-sunburst-vip`) / `gpt-image-2.5-flare-vip` / 前世代の `gpt-image-2-vip`、価格と呼び出し形式は同じ |
| `prompt` | string | はい | Prompt — コンテンツ、スタイル、ライティングなどを記述します。 |
| `size` | string | **強く推奨** | 出力サイズ: `auto`（モデルが決定 — **特定の prompt に対して vip は比較的固定されます**）または30種類のサイズのいずれか。フォーマット `WIDTHxHEIGHT`（小文字の `x`）。フィールドを省略すると `auto` と同じです。 |

<Tip>
  **サイズ早見表** — ほとんどのケースをカバーします:

  * Eコマースのメインビジュアル: `2048x1360` (3:2 2K) / `2048x2048` (1:1 2K)
  * 縦型ポスター: `1536x2048` (3:4 2K) / `2480x3312` (3:4 4K)
  * 動画サムネイル: `2048x1152` (16:9 2K) / `3840x2160` (16:9 4K)
  * ストーリー / スマートフォン用壁紙: `1152x2048` (9:16 2K) / `2160x3840` (9:16 4K)

  30種類すべてのサイズ表: [概要ページ](/ja/api-capabilities/gpt-image-2-vip/overview#supported-sizes-full-30-size-table)。
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
    GPT image generation reverse-engineered model `gpt-image-2-vip` (Adobe line,
    Firefly) — text-to-image endpoint.


    - Per-call billing, $0.03/image (flat across all sizes; no surcharge for 4K)

    - Supports 30 explicit sizes (10 ratios × 1K Fast / 2K Recommended / 4K
    Detail)

    - ~90–150s generation time, supports Chinese prompts

    - `quality` works in testing (all six tiers on the 2.5 models, up to `high`
    on `gpt-image-2-vip`; channel behavior, not a commitment); n / aspect_ratio
    are not supported

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

        - `quality` is optional (see the field description); do not pass `n`

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
              model: gpt-image-2.5-vip
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
          description: >-
            Model name: gpt-image-2.5-vip (= sunburst-vip) /
            gpt-image-2.5-flare-vip / gpt-image-2-vip, same price and call
            format
          enum:
            - gpt-image-2.5-vip
            - gpt-image-2.5-sunburst-vip
            - gpt-image-2.5-flare-vip
            - gpt-image-2-vip
          default: gpt-image-2.5-vip
        prompt:
          type: string
          description: Prompt — describe content, style, lighting, etc.
          example: >-
            Cinematic landscape, old lighthouse by the sea at dusk,
            photorealistic
        quality:
          type: string
          description: >
            Quality tier (works in testing; channel behavior, not a commitment —
            go by the actual response). All six tiers on the 2.5 models
            (`gpt-image-2.5-vip` / `gpt-image-2.5-sunburst-vip` /
            `gpt-image-2.5-flare-vip`); `gpt-image-2-vip` stops at `high` and
            rejects `xhigh` / `max`.

            Same-named tiers are not equal: 2.5 `high` only equals
            `gpt-image-2-vip` `medium`, and 2.5 `max` equals its `high`. The
            flat $0.03 does not change with the tier, but latency rises with it.
          enum:
            - auto
            - low
            - medium
            - high
            - xhigh
            - max
          example: high
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

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.