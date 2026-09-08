> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Text-to-Image API リファレンス

> gpt-image-2 のテキストから画像への API リファレンスとライブテスト — 任意の有効な解像度（4K を含む）、token 課金

<Info>
  右側のインタラクティブな Playground ではライブテストに対応しています。**Authorization** に API キーを入力し（形式: `Bearer sk-xxx`）、prompt を入力して、サイズ / 品質を選び、送信してください。
</Info>

<Tip>
  **使用例**: このページは「text-to-image」用です。prompt を入力するだけで、画像のアップロードは不要です。参照画像編集、複数画像融合、またはマスク inpainting には、[Image Edit エンドポイント](/ja/api-capabilities/gpt-image-2/image-edit) を使用してください。
</Tip>

<Warning>
  **🖥️ Browser Playground の制限（重要）**

  このエンドポイントは、レスポンスで生の base64 文字列（通常は数 MB）を返します。ブラウザーのレンダリング制限により、右側の Playground ではレスポンス到着後に `请求时发生错误: unable to complete request` が表示される場合があります — **リクエスト自体は実際には成功しています**。ブラウザーがそれほど長い base64 文字列をレンダリングできないだけです。

  **推奨ワークフロー**（初心者向け）:

  * **下の Python / Node.js / cURL サンプルをコピーして、ローカルで実行してください**。コードが自動的に `base64.b64decode` し、**画像をファイルに書き出します**。
  * ブラウザー内の Playground をどうしても使う場合は、`size` を最小の階層（例: `1024x1024`）に設定し、`quality` を `low` にしてレスポンスを小さくしてください。
</Warning>

<Info>
  すべての画像 API は **同期** です — 追跡する task ID はなく、クライアントが切断されると結果は失われる一方で、リクエストは課金されたままです。このモデルでは十分に長い timeout を設定してください。[Image API の基礎とベストプラクティス](/ja/api-capabilities/image-api-best-practices) を参照してください。
</Info>

<Warning>
  **⚠️ 非対応パラメータ**

  * `input_fidelity` — `gpt-image-2` は高精細を強制します。これを指定すると 400 が返ります。1.5 から移行する場合は、その行を削除するだけです。

  **`2560×1440` を超える出力は引き続き実験的です**。本番では、プリセット: `2048x1152` / `2048x2048` / `3840x2160` を優先してください。
</Warning>

## コード例

### Python (OpenAI SDK)

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.generate(
    model="gpt-image-2",
    prompt="Cyberpunk city at night, neon sign closeup, cinematic frame",
    size="2048x1152",
    quality="high",
    output_format="jpeg",
    output_compression=85
)

# b64_json is raw base64 (no prefix) — decode and write to file
with open("out.jpg", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### Python (Raw requests)

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
        "model": "gpt-image-2",
        "prompt": "Landscape 2K seaside lighthouse at sunset, cinematic frame",
        "size": "2048x1152",
        "quality": "high"
    },
    timeout=360  # high + 2K/4K can run 3-5 min; ~120s defaults will frequently false-timeout
).json()

with open("out.png", "wb") as f:
    f.write(base64.b64decode(response["data"][0]["b64_json"]))
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2",
    "prompt": "Orange tabby cat with sunglasses at a seaside bar, cinematic",
    "size": "2048x1152",
    "quality": "high",
    "output_format": "jpeg",
    "output_compression": 85
  }'
```

### Node.js (Native fetch)

```javascript theme={null}
import fs from 'node:fs';

const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'gpt-image-2',
        prompt: 'Minimalist line-art cat logo',
        size: '1024x1024',
        quality: 'medium'
    })
});

const { data } = await resp.json();
// b64_json is raw base64 — decode manually
fs.writeFileSync('logo.png', Buffer.from(data[0].b64_json, 'base64'));
```

### ブラウザ JavaScript (直接レンダリング)

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'gpt-image-2',
        prompt: 'Watercolor-style Nordic aurora',
        size: '1536x1024',
        quality: 'high'
    })
});

const { data } = await resp.json();
// Browser rendering needs the data URL prefix prepended manually
document.getElementById('img').src = `data:image/png;base64,${data[0].b64_json}`;
```

## パラメータリファレンス

| パラメータ                | 型      | 必須  | デフォルト  | 説明                                                                                                                                                                                           |
| -------------------- | ------ | --- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`              | string | はい  | —      | 固定: `gpt-image-2`                                                                                                                                                                            |
| `prompt`             | string | はい  | —      | Prompt、中国語と英語の両方に対応                                                                                                                                                                          |
| `size`               | string | いいえ | `auto` | 出力サイズ — プリセットまたは制約を満たすカスタム                                                                                                                                                                   |
| `quality`            | string | いいえ | `auto` | `low` / `medium` / `high` / `auto`                                                                                                                                                           |
| `output_format`      | string | いいえ | `png`  | `png` / `jpeg` / `webp`                                                                                                                                                                      |
| `output_compression` | int    | いいえ | —      | 0–100、`jpeg` / `webp` のみに対応                                                                                                                                                                  |
| `background`         | string | いいえ | `auto` | `transparent` / `opaque` / `auto`。`transparent` の場合、`output_format` は `png` または `webp` でなければなりません — `jpeg` と組み合わせると 400 を返します。詳細は [透過背景のFAQ](/ja/faq/image-transparent-background) を参照してください |
| `moderation`         | string | いいえ | `auto` | `auto` / `low`（低強度のモデレーション）                                                                                                                                                                  |
| `n`                  | int    | いいえ | 1      | 1 のみ対応                                                                                                                                                                                       |

<Warning>
  **`quality` に legacy の DALL·E 値 `standard` / `hd` を渡さないでください。** 受け付けられるのは、4 つの公式 enum 値 `low` / `medium` / `high` / `auto` のみです。legacy の値はバックエンドチャネル間で挙動が一貫せず、すぐに 400（`invalid_value`）で失敗することもあれば、黙って無視されてリクエストが `auto` で実行されることもあります（コストは予測不能です）。必ず 4 つの公式値のいずれかを明示的に指定してください。
</Warning>

<Tip>
  詳細な制約、許可される値、例は右側の Playground で確認できます — すべての enum フィールドはドロップダウン選択に対応しています。
</Tip>

## レスポンス形式

```json theme={null}
{
    "created": 1776832476,
    "data": [
        {
            "b64_json": "iVBORw0KGgoAAAANSUhEUgAA..."
        }
    ],
    "usage": {
        "input_tokens": 17,
        "input_tokens_details": {
            "image_tokens": 0,
            "text_tokens": 17
        },
        "output_tokens": 196,
        "output_tokens_details": {
            "image_tokens": 196,
            "text_tokens": 0
        },
        "total_tokens": 213
    }
}
```

<Warning>
  **⚠️ b64\_json は生の base64 です**, **`data:image/...;base64,`** なしで出力されます。クライアントは次のようにする必要があります:

  * **ファイルに書き込む**: `base64.b64decode(b64_str)` → ディスクに書き込む
  * **ブラウザーで表示する**: `data:image/png;base64,` を手動で先頭に付与する

  2026年7月時点では、`gpt-image-2-all` / `gpt-image-2-vip` も生の base64 を返しますが、以前のバージョンではプレフィックスが含まれていました。モデルをまたいでコードを共有する場合は、常にまず `startsWith('data:')` を確認してください。
</Warning>

<Info>
  `usage` フィールドは、この呼び出しに対する実際の課金対象 token を反映します。`input_tokens_details` / `output_tokens_details` では、テキストと画像の token を個別に分けて表示します（プレーンな text-to-image では `image_tokens` は常に 0 です）。フィールドの完全なリファレンスとセルフサービスの料金計算式については、概要ページの[各呼び出しの実際の token 数を確認する方法](/ja/api-capabilities/gpt-image-2/overview#how-to-check-the-real-token-count-for-each-call)を参照してください。
</Info>


## OpenAPI

````yaml api-reference/gpt-image-2-generate-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: gpt-image-2 Text-to-Image API
  description: >
    OpenAI's flagship image generation model `gpt-image-2` — text-to-image
    endpoint.


    - Any valid resolution (1K / 2K / 4K, up to 3840×2160)

    - Quality tiers: low / medium / high / auto

    - Output formats: png (default) / jpeg / webp

    - Native Chinese prompt support

    - Single image per call (n=1)

    - ~120 seconds (4K high quality approaches 2 minutes)

    - **Not supported**: transparent background (`background: transparent` will
    error)


    **Authentication**: Add `Authorization: Bearer YOUR_API_KEY` to request
    headers


    **Get API Key**: Visit [APIYI Console](https://api.apiyi.com/token) to
    create a token
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
      summary: 'Text-to-Image: generate image from text prompt'
      description: >
        Generate an image from a text prompt using `gpt-image-2`.


        - Required: `model`, `prompt`

        - Optional: `size`, `quality`, `output_format`, `output_compression`,
        `background`, `moderation`, `n`

        - Custom sizes must satisfy: max edge ≤ 3840px, both edges multiples of
        16, ratio ≤ 3:1, total pixels 0.65MP–8.3MP

        - For reference-image editing or multi-image fusion, use [Image Edit
        endpoint](/en/api-capabilities/gpt-image-2/image-edit)
      operationId: generateGptImage2TextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TextToImageRequest'
            example:
              model: gpt-image-2
              prompt: Cyberpunk city at night, neon sign closeup, cinematic frame
              size: 2048x1152
              quality: high
              output_format: jpeg
              output_compression: 85
      responses:
        '200':
          description: Image generated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: >-
            Invalid parameters (size constraint violation, input_fidelity
            passed, background:transparent, etc.)
        '401':
          description: Unauthorized - invalid API Key
        '403':
          description: Content moderation block
        '429':
          description: Rate limit or quota exceeded
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
          description: Model name, fixed as gpt-image-2
          enum:
            - gpt-image-2
          default: gpt-image-2
        prompt:
          type: string
          description: >-
            Prompt text. Supports both Chinese and English. Place scene
            description at the front for better adherence.
          example: Cyberpunk city at night, neon sign closeup, cinematic frame
        size:
          type: string
          description: >
            Output size. Presets: 1024x1024 / 1536x1024 / 1024x1536 / 2048x2048
            / 2048x1152 / 3840x2160 / 2160x3840.

            Also accepts any valid custom size (max edge ≤ 3840, both multiples
            of 16, ratio ≤ 3:1, total pixels 0.65–8.3MP).
          example: 2048x1152
          default: auto
        quality:
          type: string
          description: >-
            Quality tier. low (sketches/batch), medium (daily), high (final/fine
            text), auto (default)
          enum:
            - auto
            - low
            - medium
            - high
          default: auto
        output_format:
          type: string
          description: Output format
          enum:
            - png
            - jpeg
            - webp
          default: png
        output_compression:
          type: integer
          description: Output compression (0–100), only effective for jpeg/webp
          minimum: 0
          maximum: 100
          example: 85
        background:
          type: string
          description: >-
            Background mode. auto (default) or opaque. **Not supported**:
            transparent
          enum:
            - auto
            - opaque
          default: auto
        moderation:
          type: string
          description: Moderation strength. auto (default) or low
          enum:
            - auto
            - low
          default: auto
        'n':
          type: integer
          description: Number of images. This model only supports 1
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
          description: Generation results (this model returns 1 image per call)
          items:
            type: object
            properties:
              b64_json:
                type: string
                description: >-
                  **Raw base64 string** (no data:image/...;base64, prefix).
                  Client must decode to file or prepend prefix.
                example: iVBORw0KGgoAAAANSUhEUgAA...
        usage:
          type: object
          description: Token usage for this call (used for token-based billing)
          properties:
            input_tokens:
              type: integer
              example: 42
            output_tokens:
              type: integer
              example: 6240
            total_tokens:
              type: integer
              example: 6282
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key obtained from APIYI Console

````