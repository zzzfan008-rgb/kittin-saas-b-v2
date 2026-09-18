> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# テキストから画像への API リファレンス

> Grok Imagine 2 のテキストから画像への API リファレンスとライブテスト — prompt のみで生成、5つのアスペクト比、1K/2K 階層、1回の呼び出しで最大10画像

<Warning>
  **🔒 デフォルトでは利用できません**: Grok イマジン 2 は `Default` グループには属していません。独自の **`Grok_imagine` グループ**に属しており、呼び出す前にアクセスをリクエストする必要があります（このページのプレイグラウンドを含みます）。アクセスがない場合、すべての呼び出しは `503` を返します。

  このファミリーのコンテンツ安全ポリシーは、プラットフォーム上の他のモデルと大きく異なり、一部のカテゴリはフィルタリングされません。そのため、コンプライアンスリスクを抑える目的でアクセスを選択的に付与しています。既存のお客様は、累計 \$1,000 以上を利用している場合、ユースケースをサポートに説明することで有効化できます。それ以外のお客様は、ユースケースと導入済みのコンテンツモデレーション制御を説明したうえで、[WeCom サポート](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)から申請してください。詳しい手順: [Grok イマジン 2 概要 - グループ設定](/ja/api-capabilities/grok-imagine-image/overview#group-setup)。
</Warning>

<Info>
  右側のインタラクティブなプレイグラウンドでは、エンドポイントを直接テストできます。**Authorization** に API キーを入力し（形式: `Bearer sk-xxx`）、`prompt` を入力して、`aspect_ratio` / `resolution` を選択し、送信してください。
</Info>

<Tip>
  **このページを使用する場面**: prompt だけを使用したテキストから画像への画像生成です。画像のアップロードは必要ありません。既存の画像を変更したり、複数の画像を合成したりする場合は、[画像編集エンドポイント](/ja/api-capabilities/grok-imagine-image/image-edit)を使用してください。
</Tip>

<Warning>
  **⚠️ 参照画像をこのエンドポイントに送信しないでください**

  ここで `image` / `image_url` / `images` を渡しても、**エラーは発生しません**。200 が返され、prompt からまったく新しい画像が生成されます。ただし、**参照画像は暗黙的に破棄され、それでも課金されます**。

  エラー通知がないため、通常は入力とまったく関係のない出力に気付いたときに初めて問題が判明します。**参照画像を使用するワークフローでは、必ず [`/v1/images/edits`](/ja/api-capabilities/grok-imagine-image/image-edit) を使用してください。**
</Warning>

<Warning>
  **⚠️ 無効なパラメータを指定してもエラーは発生しません**

  無効な `aspect_ratio`（例: `5:7`）、`resolution`（例: `1K`、`1024x1024`）、`response_format`（例: `base64`）はすべて**暗黙的にデフォルト値へフォールバック**し、それでも画像を返します。出力が期待どおりにならない場合は、まずパラメータのスペルを確認してください。なお、`resolution` の値は小文字の `1k` / `2k` です。

  例外として、`resolution: "4k"` は `503 model_service_unavailable` を返します。これは**ティアがサポートされていない**ことを意味し、チャネルが停止しているという意味ではありません。再試行しても解決しません。
</Warning>

<Info>
  すべての画像 API は**同期処理**です。非同期タスク ID は存在しないため、リクエストの課金が続いている間にクライアントが切断されると、結果が失われます。1K は約 9 秒、2K は約 15-17 秒かかるため、**クライアントのタイムアウトを 360 秒に設定してください**。詳しくは [画像 API のベストプラクティス](/ja/api-capabilities/image-api-best-practices)を参照してください。
</Info>

## コード例

### Python (OpenAI SDK)

```python theme={null}
from openai import OpenAI
import urllib.request

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    timeout=360.0  # image APIs are synchronous — allow plenty of time
)

resp = client.images.generate(
    model="grok-imagine-image",
    prompt="A photorealistic red wooden boat moored on a glassy alpine lake at dawn, "
           "mist over the water, snow-capped peaks behind, cinematic photography",
    n=1,
    # aspect_ratio / resolution are not standard OpenAI SDK fields — pass via extra_body
    extra_body={
        "aspect_ratio": "16:9",
        "resolution": "1k",
        "response_format": "url"
    }
)

# response_format defaults to url, returning a direct link (.jpg for 1K, .png for 2K)
urllib.request.urlretrieve(resp.data[0].url, "out.jpg")
```

### Python (生の requests)

```python theme={null}
import requests
import base64

API_KEY = "sk-your-api-key"

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    },
    json={
        "model": "grok-imagine-image",
        "prompt": "Cyberpunk city on a rainy night, neon signage close-up, cinematic lighting",
        "n": 1,
        "aspect_ratio": "16:9",
        "resolution": "2k",          # 2k returns PNG at 5-6 MB per image
        "response_format": "b64_json"
    },
    timeout=360  # 2K takes 15-17s and longer at peak; 60s causes spurious timeouts
).json()

# b64_json is raw base64 with no data: prefix — decode and write directly
with open("out.png", "wb") as f:
    f.write(base64.b64decode(response["data"][0]["b64_json"]))
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "grok-imagine-image-quality",
    "prompt": "An orange tabby cat wearing sunglasses at a seaside bar, photorealistic, warm sunset tones",
    "n": 1,
    "aspect_ratio": "16:9",
    "resolution": "1k",
    "response_format": "url"
  }'
```

### Node.js (ネイティブ fetch)

```javascript theme={null}
import fs from 'node:fs';

const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'grok-imagine-image',
        prompt: 'A serene Japanese garden with cherry blossoms, koi pond, golden hour',
        n: 2,                       // up to 10 per call, billed per image
        aspect_ratio: '4:3',
        resolution: '1k',
        response_format: 'url'
    }),
    // Node 18+ has no default timeout — use AbortSignal.timeout in production
    signal: AbortSignal.timeout(360000)
});

const data = await resp.json();

// with n=2 the data array holds two entries — download each
for (const [i, item] of data.data.entries()) {
    const img = await fetch(item.url);
    fs.writeFileSync(`out-${i}.jpg`, Buffer.from(await img.arrayBuffer()));
}
```

### ブラウザー JavaScript

```javascript theme={null}
// ⚠️ Demo only: a front-end key is exposed — use a backend proxy in production
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'grok-imagine-image',
        prompt: 'a minimalist poster of a mountain at sunrise, flat vector style',
        aspect_ratio: '3:4',
        resolution: '1k',
        response_format: 'url'   // url is far lighter than b64_json in a browser
    })
});

const data = await resp.json();
document.querySelector('#preview').src = data.data[0].url;
```

## パラメータリファレンス

| パラメータ             | 型       | 必須 | デフォルト | 説明                                                                                   |
| ----------------- | ------- | -- | ----- | ------------------------------------------------------------------------------------ |
| `model`           | string  | ✅  | —     | `grok-imagine-image` (\$0.02/image) または `grok-imagine-image-quality` (\$0.045/image) |
| `prompt`          | string  | ✅  | —     | 英語または中国語のプロンプトです。被写体、シーン、スタイル、ライティングを記述してください                                        |
| `n`               | integer | ❌  | `1`   | 1回あたりの画像数、**1-10**、画像ごとに課金されます。`0` は `1` になり、`≥11` は 400 を返します                       |
| `aspect_ratio`    | string  | ❌  | `1:1` | `1:1` / `16:9` / `9:16` / `4:3` / `3:4`；その他の値は黙って `1:1` にフォールバックします                  |
| `resolution`      | string  | ❌  | `1k`  | `1k`（JPEG、約1 MP）または `2k`（PNG、約4.2-4.5 MP）。**同一価格**；`4k` は 503 を返します                  |
| `response_format` | string  | ❌  | `url` | `url` は直接リンクを返し、`b64_json` は生の base64 を返します（`data:` プレフィックスは**なし**）                  |

**アスペクト比ごとの実際の出力ピクセル数:**

| `aspect_ratio` | `1k`      | `2k`      |
| -------------- | --------- | --------- |
| `1:1`          | 1024x1024 | 2048x2048 |
| `16:9`         | 1280x720  | 2816x1584 |
| `9:16`         | 720x1280  | 1584x2816 |
| `4:3`          | 1152x864  | 2368x1776 |
| `3:4`          | 864x1152  | 1776x2368 |

<Info>
  `seed` はサポートされていません（エラーなく受け付けられますが、効果はありません — 結果は再現できません）。マスクによる inpainting もサポートされていません。`size` / `quality` / `style` のような OpenAI 形式のフィールドは、黙って無視されます。
</Info>

## レスポンス形式

```json theme={null}
{
  "created": 0,
  "data": [
    {
      "url": "https://apac.ossforai.com/2026/08/12/1ab87d04-3637-464f-bafd-f026cac05dd3.jpg"
    }
  ],
  "usage": {
    "prompt_tokens": 1000,
    "total_tokens": 1000,
    "output_tokens": 0
  }
}
```

<Warning>
  **レスポンスフィールドの注意点**

  * 各 `data[]` エントリには、`response_format` に応じて **`url`** または **`b64_json`** のどちらか一方が含まれます — 両方が含まれることはありません。
  * **`revised_prompt` は返されず**、`respect_moderation` / `model` も返されません。存在すると想定しないでください。
  * `b64_json` は **`data:image/...;base64,` プレフィックスのない生の base64** です — そのままデコードしてください。
  * `created` は常に `0` であり、タイムスタンプとしては使用できません。
  * `n > 1` では、`data` 配列に複数のエントリが入ります — `data[0]` だけを読まないでください。
</Warning>

<Info>
  **`usage` は照合には使用できません**: `prompt_tokens` は実際の prompt の長さにかかわらず常に `1000 x n` です。このシリーズは画像ごとの定額料金（\$0.02 / \$0.045）で課金されます。実際の請求額は APIYI Console の課金記録を参照してください。
</Info>


## OpenAPI

````yaml api-reference/grok-imagine-image-generate-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: Grok Imagine 2 Text-to-Image API
  description: >
    xAI Grok Imagine 2 image generation models — text-to-image endpoint.


    - Two models: `grok-imagine-image` (standard, \$0.02 per image),
    `grok-imagine-image-quality` (high quality, \$0.045 per image)

    - Flat per-request pricing — **1K and 2K cost the same**

    - 5 aspect ratios x 2 resolution tiers, all parameters genuinely take effect

    - Up to 10 images per request (`n` from 1 to 10)

    - 1K returns JPEG (~220-300 KB), 2K returns PNG (~5-6 MB)


    **⚠️ This endpoint does not accept reference images**: passing `image` /
    `image_url` / `images`

    returns 200 with a normal image, but the reference is silently discarded and
    you are still billed.

    For reference-image editing use the

    [Image Editing endpoint](/en/api-capabilities/grok-imagine-image/image-edit)
    (`multipart/form-data`).


    **Auth**: add `Authorization: Bearer YOUR_API_KEY` to the request header.


    **Get API Key**: visit [APIYI Console](https://api.apiyi.com/token) to
    create a token.
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
      summary: 'Text-to-image: generate images from a text prompt'
      description: >
        Generate images from a text prompt with Grok Imagine 2 models.


        - Required: `model`, `prompt`

        - Optional: `n`, `aspect_ratio`, `resolution`, `response_format`

        - Invalid values do not raise errors — they **silently fall back to the
        default**
          (e.g. `aspect_ratio: "5:7"` is treated as `1:1`)
        - `resolution: "4k"` returns 503 `model_service_unavailable` — this is
        an unsupported
          parameter tier, not a channel outage
        - `seed` is not supported; repeated calls with the same prompt are not
        reproducible
      operationId: generateGrokImagineTextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/GrokImagineGenerateRequest'
      responses:
        '200':
          description: Images generated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: >-
            Invalid parameters, or prompt blocked by content moderation (both
            share the `invalid_request` code)
        '401':
          description: Unauthorized - invalid API Key
        '429':
          description: Rate limit exceeded or insufficient balance
        '503':
          description: >-
            Unsupported parameter tier (e.g. `resolution: 4k`), or no available
            channel in the current Group
      security:
        - bearerAuth: []
components:
  schemas:
    GrokImagineGenerateRequest:
      type: object
      required:
        - model
        - prompt
      properties:
        model:
          type: string
          description: >-
            Model ID. The quality variant delivers higher fidelity at a higher
            price
          enum:
            - grok-imagine-image
            - grok-imagine-image-quality
          default: grok-imagine-image
        prompt:
          type: string
          description: >-
            Prompt, English or Chinese. Describe subject, scene, style and
            lighting in detail
          example: >-
            A photorealistic red wooden boat moored on a glassy alpine lake at
            dawn, mist over the water, snow-capped peaks behind, cinematic
            photography
        'n':
          type: integer
          description: >-
            Number of images, 1-10. Values of 11 or above return 400; 0 is
            silently treated as 1
          minimum: 1
          maximum: 10
          default: 1
          example: 1
        aspect_ratio:
          type: string
          description: >
            Output aspect ratio. Actual pixel dimensions per resolution tier:


            | Aspect ratio | `1k` | `2k` |

            |---|---|---|

            | `1:1` | 1024x1024 | 2048x2048 |

            | `16:9` | 1280x720 | 2816x1584 |

            | `9:16` | 720x1280 | 1584x2816 |

            | `4:3` | 1152x864 | 2368x1776 |

            | `3:4` | 864x1152 | 1776x2368 |


            Values outside this enum do not raise an error — they silently fall
            back to `1:1`.
          enum:
            - '1:1'
            - '16:9'
            - '9:16'
            - '4:3'
            - '3:4'
          default: '1:1'
          example: '16:9'
        resolution:
          type: string
          description: >
            Resolution tier. `1k` is roughly 0.9-1.05 megapixels and returns
            JPEG;

            `2k` is roughly 4.2-4.5 megapixels and returns PNG (5-6 MB per
            image).

            **Both tiers cost the same.**


            `4k` returns 503; other invalid values (such as `1K` or `1024x1024`)
            silently fall back to `1k`.
          enum:
            - 1k
            - 2k
          default: 1k
          example: 1k
        response_format:
          type: string
          description: >
            Response format. `url` returns a direct image link (no signed query
            params);

            `b64_json` returns a raw base64 string (**without** the `data:`
            prefix).


            Invalid values silently fall back to the default `url`.
          enum:
            - url
            - b64_json
          default: url
          example: url
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
          description: >-
            Creation timestamp. Always 0 for this model — do not use it for
            timing
          example: 0
        data:
          type: array
          description: Array of image results, length equals the requested `n`
          items:
            type: object
            properties:
              url:
                type: string
                description: >-
                  Direct image link, returned when `response_format=url`. .jpg
                  for 1K, .png for 2K
                example: >-
                  https://apac.ossforai.com/2026/08/12/1ab87d04-3637-464f-bafd-f026cac05dd3.jpg
              b64_json:
                type: string
                description: >-
                  Raw base64 image data, returned when
                  `response_format=b64_json` (no data: prefix)
        usage:
          type: object
          description: >
            **Placeholder values — do not use for billing reconciliation.**
            `prompt_tokens` is always

            `1000 x n`, regardless of actual prompt length. Use the Console
            billing records instead.
          properties:
            prompt_tokens:
              type: integer
              example: 1000
            total_tokens:
              type: integer
              example: 1000
            output_tokens:
              type: integer
              example: 0
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key created in the APIYI Console

````