> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# テキストから画像生成 API リファレンス

> FLUX テキストから画像生成 API リファレンスとライブデバッガー — OpenAI互換のドロップインで FLUX.2 [klein/pro/max/flex] ファミリー全体を利用可能、4MP 出力と正確な hex カラー制御

<Info>
  右側のインタラクティブなプレイグラウンドはライブデバッグをサポートしています。**Authorization** ヘッダーに API Key を入力し（形式: `Bearer sk-xxx`）、モデルとサイズを選択して、prompt を入力し、送信してください。
</Info>

<Tip>
  **このページの用途:** 「テキストから画像を生成」 — 必要なのは prompt だけで、アップロードは不要です。既存画像の編集やマルチリファレンス融合については、[画像編集エンドポイント](/ja/api-capabilities/flux/image-edit) を参照してください。
</Tip>

<Warning>
  **⚠️ 主な違い / 非対応パラメータ**

  * **結果 URL の有効期限は 10 分のみ** — `data[0].url` はすぐにダウンロードしてください。期限切れの URL は 404 を返します
  * **`width` / `height` は 16 の倍数である必要があります** — そうでない場合は 400 を返します
  * **`prompt_upsampling` は FLUX.2 \[klein] ではサポートされていません** — 何もせずに無視されます
  * **総ピクセル上限は 4MP** (\~2048×2048) — 超えると 400 を返します
  * **`grounding search` は `flux-2-max` でのみ利用可能です** — 時間に敏感な prompt でも、他のモデルではライブ検索は起動しません
</Warning>

<Info>
  すべての image API は **同期式** です。ポーリング用の task ID はなく、クライアントが切断されると、リクエストが課金されたままでも結果は失われます。このモデルでは十分に長いタイムアウトを設定してください。詳しくは [Image API の基本とベストプラクティス](/ja/api-capabilities/image-api-best-practices) を参照してください。
</Info>

## コード例

### Python (OpenAI SDK ドロップイン)

```python theme={null}
from openai import OpenAI
import requests

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.generate(
    model="flux-2-pro",
    prompt="A cinematic shot of a futuristic city at sunset, 85mm lens, hyper-realistic",
    size="1920x1080"
)

# data[0].url is valid for only 10 minutes — download immediately
image_url = resp.data[0].url
with open("out.jpg", "wb") as f:
    f.write(requests.get(image_url, timeout=30).content)
```

### Python (ネイティブ requests · width/height 構文付き)

```python theme={null}
import requests

API_KEY = "sk-your-api-key"

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    },
    json={
        "model": "flux-2-max",
        "prompt": "Score of yesterday's Champions League final, infographic style",
        "width": 1920,
        "height": 1080,
        "safety_tolerance": 2,
        "output_format": "jpeg",
        "seed": 42
    },
    timeout=120
).json()

image_url = response["data"][0]["url"]
with open("out.jpg", "wb") as f:
    f.write(requests.get(image_url, timeout=30).content)
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "flux-2-pro",
    "prompt": "Luxury eyeshadow palette with 6 pans: top row #B76E79, #E8D5B7, #8B4789; bottom row #CD7F32, #F8F6F0, #800020",
    "size": "1024x1024",
    "output_format": "png"
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
        model: 'flux-2-klein-9b',
        prompt: 'A serene mountain landscape at golden hour, soft diffused light',
        width: 1024,
        height: 1024
    })
});

const { data } = await resp.json();
// Download immediately — URL expires in 10 minutes
const img = await fetch(data[0].url);
fs.writeFileSync('out.jpg', Buffer.from(await img.arrayBuffer()));
```

### ブラウザ JavaScript (直接レンダリング)

```javascript theme={null}
{/* Demo only — production should proxy via backend to avoid leaking the key. The delivery URL has CORS disabled, so server-side download to your own CDN is recommended. */}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'flux-2-pro',
        prompt: 'Watercolor aurora borealis over Nordic mountains',
        size: '1536x1024'
    })
});

const { data } = await resp.json();
{/* delivery URL has CORS disabled, but <img src> works for direct rendering. Server-side download is still recommended for production. */}
document.getElementById('img').src = data[0].url;
```

## パラメータリファレンス

| Parameter           | Type    | Required | Default     | Description                                 |
| ------------------- | ------- | -------- | ----------- | ------------------------------------------- |
| `model`             | string  | Yes      | —           | FLUX モデル ID、下の表を参照してください                    |
| `prompt`            | string  | Yes      | —           | Prompt、最大 32K tokens。自然言語と構造化 JSON をサポートします |
| `size`              | string  | No       | `1024x1024` | OpenAI 形式のサイズ文字列、例: `1920x1080`             |
| `width`             | integer | No       | `1024`      | BFL ネイティブ、`size` の代替。16 の倍数である必要があります       |
| `height`            | integer | No       | `1024`      | BFL ネイティブ、16 の倍数である必要があります                  |
| `seed`              | integer | No       | random      | 再現性のための固定値                                  |
| `safety_tolerance`  | integer | No       | `2`         | 0（最も厳格）– 6（最も寛容）                            |
| `output_format`     | string  | No       | `jpeg`      | `jpeg` / `png`                              |
| `prompt_upsampling` | boolean | No       | `false`     | Prompt を自動拡張します（\[klein] では無効）              |
| `steps`             | integer | No       | `50`        | **`flux-2-flex` のみ**、最大 50                  |
| `guidance`          | number  | No       | `4.5`       | **`flux-2-flex` のみ**、1.5–10                 |
| `n`                 | integer | No       | `1`         | 1 のみサポートされています                              |

### サポートされているモデル ID

| Model ID             | Speed      | Best For                          |
| -------------------- | ---------- | --------------------------------- |
| `flux-2-max`         | \< 15s     | フラッグシップ + grounding search        |
| `flux-2-pro`         | \< 10s     | 大規模な本番運用、最も高い価値                   |
| `flux-2-flex`        | Slower     | タイポグラフィ専門                         |
| `flux-2-klein-9b`    | Sub-second | バランス型                             |
| `flux-2-klein-4b`    | Sub-second | 最速                                |
| `flux-pro-1.1-ultra` | \~10s      | レガシー 4MP（Historical Versions を参照） |
| `flux-pro-1.1`       | \~5s       | レガシー 1.6MP                        |
| `flux-pro`           | \~6s       | 初代 Pro                            |
| `flux-dev`           | \~5s       | 開発/テスト                            |

<Tip>
  詳細な制約、許可値、例は、右側の Playground のフィールドヒントに表示されます。すべての enum フィールドでドロップダウン選択をサポートしています。
</Tip>

## レスポンス形式

```json theme={null}
{
    "created": 1776832476,
    "data": [
        {
            "url": "https://delivery-eu.bfl.ai/results/xxx/sample.jpeg?signature=..."
        }
    ]
}
```

<Warning>
  **⚠️ `data[0].url` は10分間のみ有効です**

  * URL は `delivery-eu.bfl.ai` / `delivery-us.bfl.ai` でホストされ、署名は10分後に期限切れになります
  * **CORS は無効です** — ブラウザの `fetch` はブロックされますが、`<img src>` のレンダリングは動作します
  * 本番サービスでは、必ずサーバー側で自分の OSS / CDN にダウンロードしてください
  * OpenAI の `gpt-image-2`（`b64_json` を返す）とは異なり、**FLUX は URL のみを返します — base64 はありません**。
</Warning>

<Info>
  FLUX は `usage` フィールドを返しません（課金は token ではなく画像ごとです）。実際の課金はこのサイトの料金表に従います。レスポンスヘッダー `x-request-id` はサポート用のトレースに使用されます。
</Info>


## OpenAPI

````yaml api-reference/flux-generate-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: FLUX Text-to-Image API
  description: >
    Black Forest Labs FLUX model family — text-to-image endpoint
    (OpenAI-compatible wrapper).


    - Full model matrix: FLUX.2 [klein 4b/9b, pro, max, flex], FLUX.1
    [pro/1.1/1.1-ultra/dev]

    - Output up to 4MP (2048×2048), arbitrary aspect ratio (dimensions must be
    multiples of 16)

    - Supports 32K-token prompts, exact hex color control, structured JSON
    prompting

    - `flux-2-max` exclusive: grounding search (real-time web)

    - Response `data[0].url` is **valid for only 10 minutes**, download
    immediately (CORS disabled)

    - APIYI gateway wraps BFL's async polling as a synchronous OpenAI Images API


    **Authentication**: include `Authorization: Bearer YOUR_API_KEY` in the
    request header.


    **Get API Key**: create a token at the [APIYI
    Console](https://api.apiyi.com/token).
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
      summary: Generate an image from a text prompt
      description: >
        Generate images from text using the FLUX model family.


        - Required: `model`, `prompt`

        - Optional: `size` or `width`+`height` (pick one), `seed`,
        `safety_tolerance`, `output_format`, `prompt_upsampling`

        - flex-only: `steps`, `guidance`

        - Custom dimensions must satisfy: multiples of 16, 64×64 ≤ size ≤ 4MP

        - For reference-image editing or fusion, use the [Image Editing
        endpoint](/en/api-capabilities/flux/image-edit).
      operationId: generateFluxTextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TextToImageRequest'
            example:
              model: flux-2-pro
              prompt: A cinematic shot of a futuristic city at sunset, 85mm lens
              size: 1920x1080
              output_format: jpeg
              safety_tolerance: 2
      responses:
        '200':
          description: Image generated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: >-
            Invalid params (width/height not multiple of 16, exceeds 4MP, prompt
            over 32K tokens, etc.)
        '401':
          description: Unauthorized — invalid API Key
        '403':
          description: Moderation block
        '429':
          description: Rate limited or out of credits (active tasks > 24)
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
            FLUX model ID. For FLUX.2 prefer flux-2-pro / flux-2-max; legacy
            versions in the Historical Versions page.
          enum:
            - flux-2-max
            - flux-2-pro
            - flux-2-flex
            - flux-2-klein-9b
            - flux-2-klein-4b
            - flux-pro-1.1-ultra
            - flux-pro-1.1
            - flux-pro
            - flux-dev
          default: flux-2-pro
        prompt:
          type: string
          description: >-
            Prompt, up to 32K tokens. Supports natural language, hex codes, and
            structured JSON.
          example: A cinematic shot of a futuristic city at sunset, 85mm lens
        size:
          type: string
          description: >
            OpenAI-style size string. Pick either `size` or `width`+`height`.

            Common: 1024x1024 / 1536x1024 / 1024x1536 / 1920x1080 / 1440x2048 /
            2048x2048.

            Custom must satisfy: multiples of 16, 64×64–4MP.
          example: 1920x1080
          default: 1024x1024
        width:
          type: integer
          description: >-
            BFL-native syntax, alternative to `size`. Must be a multiple of 16,
            between 64 and 2048.
          minimum: 64
          maximum: 2048
          example: 1920
          default: 1024
        height:
          type: integer
          description: BFL-native syntax. Must be a multiple of 16, between 64 and 2048.
          minimum: 64
          maximum: 2048
          example: 1080
          default: 1024
        seed:
          type: integer
          description: >-
            Fix for reproducibility — same seed + same other params yields the
            same result.
          example: 42
        safety_tolerance:
          type: integer
          description: Moderation level. 0 = strictest, 6 = most permissive, default 2.
          minimum: 0
          maximum: 6
          default: 2
        output_format:
          type: string
          description: Output format.
          enum:
            - jpeg
            - png
          default: jpeg
        prompt_upsampling:
          type: boolean
          description: >-
            Auto-expand the prompt. Not supported on FLUX.2 [klein] (silently
            ignored).
          default: false
        steps:
          type: integer
          description: '**Only flux-2-flex**. Inference steps, max 50.'
          minimum: 1
          maximum: 50
          default: 50
        guidance:
          type: number
          description: >-
            **Only flux-2-flex**. Guidance scale. 1.5–10, higher = closer to
            prompt.
          minimum: 1.5
          maximum: 10
          default: 4.5
        'n':
          type: integer
          description: Number of images. Only 1 supported.
          enum:
            - 1
          default: 1
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
          description: Unix timestamp
          example: 1776832476
        data:
          type: array
          description: Result array (single image per call)
          items:
            type: object
            properties:
              url:
                type: string
                description: >-
                  **Signed URL, valid for 10 minutes**. Hosted on
                  delivery-eu.bfl.ai / delivery-us.bfl.ai with CORS disabled —
                  server-side download required.
                example: >-
                  https://delivery-eu.bfl.ai/results/xxx/sample.jpeg?signature=...
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key from the APIYI Console

````