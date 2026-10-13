> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# テキストから画像生成 API リファレンス

> ライブ Playground を備えた MAI-Image 2.6 テキストから画像生成 API リファレンス — テキスト prompt からの生成、最大 1536×1536 エリアまでのカスタム幅/高さに対応し、常に PNG base64 を返却します

<Info>
  右側のインタラクティブなPlaygroundでオンラインテストが行えます。**Authorization**（フォーマット：`Bearer sk-xxx`）にAPIキーを入力し、`model`を選択し、`prompt`を入力し、必要に応じて`width` / `height`を設定して送信してください。
</Info>

<Tip>
  **ユースケース**：このページはテキストからの画像生成専用です。既存の画像を編集する場合は、[画像編集API](/ja/api-capabilities/mai-image/image-edit)をご利用ください。
</Tip>

<Warning>
  **⚠️ 3つのパラメータは400を返します**

  このシリーズは`response_format`、`seed`、または`negative_prompt`を受け付けません。いずれかを送信すると400 `Invalid parameters: xxx`が返されます。gpt-image / DALL·Eから移行する場合は、まず`response_format`を削除してください。レスポンスは常に`data[0].b64_json`です。
</Warning>

<Warning>
  **⚠️ sizeではなくwidth + heightを使用してください**

  このエンドポイントは\*\*`size`を暗黙的に無視し\*\*、常に1024×1024でレンダリングします。整数の`width` + `height`（常にセットで指定）を使用してください：各辺 ≥ 768、width × height ≤ 2,359,296（1536×1536の面積）。
</Warning>

<Info>
  すべての画像APIは**同期**です：非同期タスクIDはありません。クライアントが切断された場合、結果は失われますがリクエストは課金されます。1024×1024の画像はFlashで約17秒、2.6で約30秒かかります。**クライアントのタイムアウトは、Flashで120秒以上、2.6で180秒以上に設定してください。** 詳細は[画像APIの基本とベストプラクティス](/ja/api-capabilities/image-api-best-practices)を参照してください。
</Info>

## コード例

### Python (OpenAI SDK)

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    timeout=180.0  # synchronous call, give it enough time
)

resp = client.images.generate(
    model="MAI-Image-2.6-Flash",
    prompt='A traditional teahouse storefront with a wooden sign that reads "Welcome", red lanterns, warm dusk light, photorealistic',
    # width / height are not standard OpenAI SDK fields, so pass them via extra_body
    # Do not pass response_format: it returns 400
    extra_body={"width": 1024, "height": 1024}
)

with open("out.png", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### Python (requests)

```python theme={null}
import base64
import os
import requests

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"},
    json={
        "model": "MAI-Image-2.6",
        "prompt": "A red fox sitting on a mossy rock in a misty forest, soft morning light, photorealistic",
        "width": 1536,
        "height": 1024
    },
    timeout=180
)
response.raise_for_status()

with open("out.png", "wb") as f:
    f.write(base64.b64decode(response.json()["data"][0]["b64_json"]))
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MAI-Image-2.6-Flash",
    "prompt": "A minimalist coffee shop poster with the headline \"Autumn Special\" at the top, warm brown palette",
    "width": 1024,
    "height": 1536
  }' | python3 -c "import sys,json,base64; open('out.png','wb').write(base64.b64decode(json.load(sys.stdin)['data'][0]['b64_json']))"
```

### Node.js (fetch)

```javascript theme={null}
import fs from 'node:fs';

const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.APIYI_API_KEY}`
    },
    body: JSON.stringify({
        model: 'MAI-Image-2.6-Flash',
        prompt: 'A serene Japanese garden with cherry blossoms, koi pond, golden hour',
        width: 1792,
        height: 1008               // 16:9; width × height must not exceed 2,359,296
    }),
    signal: AbortSignal.timeout(120000)
});

const data = await resp.json();
fs.writeFileSync('out.png', Buffer.from(data.data[0].b64_json, 'base64'));
```

### 複数の画像が必要な場合：並列リクエストを送信

text-to-image エンドポイントは1回の呼び出しにつき1枚の画像を返します（`n` は効果がありません）。そのため、リクエストを並列で実行してください：

```python theme={null}
import base64, os, requests
from concurrent.futures import ThreadPoolExecutor

def gen(i):
    r = requests.post(
        "https://api.apiyi.com/v1/images/generations",
        headers={"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"},
        json={"model": "MAI-Image-2.6-Flash", "prompt": "a watercolor lighthouse at dusk"},
        timeout=120
    )
    r.raise_for_status()
    open(f"out-{i}.png", "wb").write(base64.b64decode(r.json()["data"][0]["b64_json"]))

with ThreadPoolExecutor(max_workers=4) as pool:
    list(pool.map(gen, range(4)))
```

## パラメーターリファレンス

| パラメーター | 型 | 必須 | デフォルト値 | 説明 |
| - | - | - | - | - |
| `model` | string | ✅ | — | `MAI-Image-2.6` (\$0.12/画像) または `MAI-Image-2.6-Flash` (\$0.06/画像)、**大文字と小文字を区別** |
| `prompt` | string | ✅ | — | 任意の言語での prompt。画像内に表示するテキストは引用符で囲んでください |
| `width` | integer | ❌ | `1024` | 出力の幅。≥ 768、`height` と一緒に送信する必要があり、16の倍数に切り捨てられます |
| `height` | integer | ❌ | `1024` | 出力の高さ。≥ 768、幅 × 高さ ≤ 2,359,296 |
| ~~`response_format`~~ | — | — | — | **400を返します**。レスポンスは常に `b64_json` です |
| ~~`seed`~~ / ~~`negative_prompt`~~ | — | — | — | **400を返します** |
| ~~`size`~~ | — | — | — | このエンドポイントでは**暗黙的に無視されます** |
| ~~`n`~~ | — | — | — | このエンドポイントでは効果がありません。常に1枚の画像です |

<Info>
  `quality`、`output_format`、`background`、`style`、およびその他の OpenAI スタイルのフィールドは暗黙的に無視されます。出力は常にPNGです。
</Info>

## レスポンス形式

```json theme={null}
{
  "created": 1790999642,
  "data": [
    {
      "b64_json": "iVBORw0KGgoAAAANSUhEUgAABAAAAAQACAIAAADwf7zU..."
    }
  ],
  "usage": {
    "prompt_tokens": 1000,
    "total_tokens": 1000,
    "input_tokens": 1000,
    "output_tokens": 0
  }
}
```

<Warning>
  **レスポンスフィールド**

  * `b64_json` は **`data:image/png;base64,` プレフィックスのないプレーンな base64** です。直接デコードしてPNGを取得してください。
  * `url` フィールドはなく、`revised_prompt` もありません。
  * 1024×1024のPNGは約1.5〜1.7 MB（base64では2.1〜2.3 MB）、1536×1536は約4〜5 MBです。クライアントのレスポンスサイズ制限を確認してください。
</Warning>

<Info>
  **`usage` で課金の照合を行わないでください**: `prompt_tokens` は常に画像数 × 1000、`output_tokens` は常に0となり、これらはプレースホルダーです。このシリーズは画像ごとに課金され、APIYI コンソールの請求内容が正式なものとなります。
</Info>


## OpenAPI

````yaml api-reference/mai-image-generate-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: MAI-Image 2.6 Text-to-Image API
  description: >
    Microsoft MAI-Image 2.6 image generation — text-to-image endpoint.


    - Two models: `MAI-Image-2.6` (flagship, \$0.12/image) and
    `MAI-Image-2.6-Flash` (fast, \$0.06/image); model names are case-sensitive

    - Flat per-image pricing, **regardless of size**

    - Size via `width` + `height` (integers, always together): each side ≥ 768,
    width × height ≤ 2,359,296

    - Always returns 1 PNG in `data[0].b64_json` (plain base64, no `data:`
    prefix)


    **⚠️ Do not send `response_format` / `seed` / `negative_prompt`**: all three
    return 400.

    `size` is silently ignored on this endpoint.


    **Authentication**: add `Authorization: Bearer YOUR_API_KEY` to the request
    headers


    **Get an API key**: create a token in the [APIYI
    console](https://api.apiyi.com/token)
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
      summary: 'Text-to-image: generate an image from a text prompt'
      description: >
        Generate an image from a text prompt with MAI-Image 2.6.


        - Required: `model`, `prompt`

        - Optional: `width`, `height` (always together; default 1024×1024 when
        both are omitted)

        - Sizes that are not multiples of 16 are rounded down to a multiple of
        16

        - `n` has no effect; each call returns 1 image. Send parallel requests
        for more
      operationId: generateMaiImageTextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/MaiImageGenerateRequest'
      responses:
        '200':
          description: Image generated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: >-
            Invalid parameters (size out of range: `unsupported_request_value`;
            unsupported parameter: `invalid_request`), or blocked by moderation
            (`content_safety_violation`)
        '401':
          description: Unauthorized - invalid API key
        '404':
          description: >-
            Request sent to chat / responses; this series only supports the
            Images API
        '429':
          description: Rate limit exceeded or insufficient balance
        '503':
          description: Wrong model-name case, or no available channel in the current group
      security:
        - bearerAuth: []
components:
  schemas:
    MaiImageGenerateRequest:
      type: object
      required:
        - model
        - prompt
      properties:
        model:
          type: string
          description: Model ID (case-sensitive). 2.6 favors quality, Flash favors speed
          enum:
            - MAI-Image-2.6-Flash
            - MAI-Image-2.6
          default: MAI-Image-2.6-Flash
        prompt:
          type: string
          description: >-
            Prompt in any language. Put text that should appear in the image in
            quotes
          example: >-
            A traditional teahouse storefront with a wooden sign that reads
            "Welcome", red lanterns, warm dusk light, photorealistic
        width:
          type: integer
          description: >
            Output width in pixels. Each side ≥ 768, width × height ≤ 2,359,296
            (a 1536×1536 area);

            must be sent together with `height`; rounded down to a multiple of
            16.
          minimum: 768
          default: 1024
          example: 1024
        height:
          type: integer
          description: Output height in pixels, same rules as `width`
          minimum: 768
          default: 1024
          example: 1024
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
          description: Creation timestamp
          example: 1790999642
        data:
          type: array
          description: Image results; always 1 item for text-to-image
          items:
            type: object
            properties:
              b64_json:
                type: string
                description: 'Plain base64 image data (PNG, no data: prefix)'
        usage:
          type: object
          description: >
            **Placeholder values, not for billing reconciliation.**
            `prompt_tokens` is always `1000 × images` and `output_tokens` is
            always 0.

            The console bill is authoritative.
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
      description: API key from the APIYI console

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.