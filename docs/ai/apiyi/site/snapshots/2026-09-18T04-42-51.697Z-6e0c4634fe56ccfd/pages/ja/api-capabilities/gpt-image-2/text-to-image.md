> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# テキストから画像への API リファレンス

> gpt-image-2.5-flare / gpt-image-2.5-sunburst / gpt-image-2 のテキストから画像への API リファレンスとライブテスト — 任意の解像度（4K を含む）に対応、token 課金、3つすべて同一価格・同一パラメータ

<Info>
  右側のインタラクティブなプレイグラウンドでは、ライブテストを実行できます。**Authorization** に API キー（形式: `Bearer sk-xxx`）を入力し、プロンプトを入力して、サイズ / 品質を選択して送信します。
</Info>

<Tip>
  **ユースケース**: このページは「テキストから画像へ」用です。プロンプトを入力するだけでよく、画像のアップロードは必要ありません。参照画像の編集、複数画像の融合、またはマスクによるインペインティングには、[画像編集エンドポイント](/ja/api-capabilities/gpt-image-2/image-edit)を使用してください。
</Tip>

<Warning>
  **🖥️ ブラウザプレイグラウンドの制限（重要）**

  このエンドポイントは、レスポンスで**生の base64 文字列**（通常は数 MB）を返します。ブラウザのレンダリング制限により、右側のプレイグラウンドではレスポンスの到着後に`请求时发生错误: unable to complete request`と表示される場合があります。**リクエストは実際には成功しています**。ブラウザでは、このように長い base64 文字列をレンダリングできないだけです。

  **推奨ワークフロー**（初心者向け）:

  * **以下の Python / Node.js / cURL サンプルをコピーして、ローカルで実行してください**。コードがレスポンスを自動的に`base64.b64decode`し、**画像をファイルに書き込みます**。
  * ブラウザ内のプレイグラウンドを使用する必要がある場合は、`size`を最小ティア（例: `1024x1024`）に設定し、`quality`を`low`に設定してレスポンスを小さくしてください。
</Warning>

<Info>
  すべての画像 API は**同期型**です。ポーリングするタスク ID はなく、クライアントが切断すると、リクエストの課金が継続している間でも結果は失われます。このモデルには十分に長いタイムアウトを設定してください。[画像 API の基本とベストプラクティス](/ja/api-capabilities/image-api-best-practices)を参照してください。
</Info>

<Warning>
  **⚠️ サポートされていないパラメータ**

  * `input_fidelity` — 3 つのモデルすべてで高忠実度が強制されます。これを渡すと 400 が返されます（2026-09-09 に 2.5 で検証: `does not support the 'input_fidelity' parameter`）。1.5 から移行する場合は、この行を削除するだけです。

  `2560×1440`を超える出力は、**引き続き実験的なものです**。本番環境では、プリセットの `2048x1152` / `2048x2048` / `3840x2160`を優先してください。
</Warning>

## コード例

### Python（OpenAI SDK）

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.generate(
    model="gpt-image-2.5-flare",
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

### Python（requests を直接使用）

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
        "model": "gpt-image-2.5-flare",
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
    "model": "gpt-image-2.5-flare",
    "prompt": "Orange tabby cat with sunglasses at a seaside bar, cinematic",
    "size": "2048x1152",
    "quality": "high",
    "output_format": "jpeg",
    "output_compression": 85
  }'
```

### Node.js（ネイティブ fetch）

```javascript theme={null}
import fs from 'node:fs';

const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'gpt-image-2.5-flare',
        prompt: 'Minimalist line-art cat logo',
        size: '1024x1024',
        quality: 'medium'
    })
});

const { data } = await resp.json();
// b64_json is raw base64 — decode manually
fs.writeFileSync('logo.png', Buffer.from(data[0].b64_json, 'base64'));
```

### ブラウザ JavaScript（直接レンダリング）

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'gpt-image-2.5-flare',
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

| パラメータ                | 型      | 必須  | デフォルト  | 説明                                                                                                                                                                                                                              |
| -------------------- | ------ | --- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`              | string | はい  | —      | `gpt-image-2.5-flare`（速度優先、日常利用のデフォルト）/ `gpt-image-2.5-sunburst`（品質と編集を優先）/ `gpt-image-2`（旧世代、引き続き利用可能）。本番環境では日付付きスナップショット `gpt-image-2.5-flare-2026-09-08` / `gpt-image-2.5-sunburst-2026-09-08` を固定してください。3つすべてで価格とパラメータは同一です |
| `prompt`             | string | はい  | —      | プロンプト（中国語または英語）。最大32,000文字（プロバイダーの制限。token ではなく文字数でカウント）。長い内容は先に要約し、[長いプロンプト](/ja/api-capabilities/image-long-prompt)を参照してください                                                                                                  |
| `size`               | string | いいえ | `auto` | 出力サイズ — プリセット、または制約を満たすカスタムサイズ                                                                                                                                                                                                  |
| `quality`            | string | いいえ | `auto` | `low` / `medium` / `high` / `xhigh` / `max` / `auto`。`xhigh` / `max` は2.5で追加され、`gpt-image-2` は `high` で停止します                                                                                                                    |
| `output_format`      | string | いいえ | `png`  | `png` / `jpeg` / `webp`                                                                                                                                                                                                         |
| `output_compression` | int    | いいえ | —      | 0～100。`jpeg` / `webp` にのみ使用します                                                                                                                                                                                                  |
| `background`         | string | いいえ | `auto` | `transparent` / `opaque` / `auto`。`transparent` を使用する場合、`output_format` は `png` または `webp` でなければなりません — `jpeg` と組み合わせると400が返されます。[透明背景に関するFAQ](/ja/faq/image-transparent-background)を参照してください                                   |
| `moderation`         | string | いいえ | `auto` | `auto` / `low`（低強度のモデレーション）                                                                                                                                                                                                     |
| `n`                  | int    | いいえ | 1      | 1のみサポートされています                                                                                                                                                                                                                   |

<Warning>
  **`quality` に従来のDALL·Eの値 `standard` / `hd` を渡さないでください。** 受け付けられるのは、公式の6つの列挙値 `low` / `medium` / `high` / `xhigh` / `max` / `auto` のみです（`xhigh` / `max` は2つの2.5モデルでのみ使用可能）。従来の値はバックエンドのチャネルによって挙動が一貫しません。400（`invalid_value`）ですぐに失敗する場合もあれば、無視されてリクエストが `auto` で実行される場合もあります（費用を予測できません）。必ず公式の値を1つ明示的に渡してください。
</Warning>

<Tip>
  詳細な制約、使用可能な値、例は右側のPlaygroundで確認できます — すべての列挙フィールドはドロップダウン選択に対応しています。
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
  title: gpt-image-2.5 / 2 Text-to-Image API
  description: >
    OpenAI GPT-Image 2.5 / 2 series (`gpt-image-2.5-flare` /
    `gpt-image-2.5-sunburst` / `gpt-image-2`) — text-to-image endpoint. Same
    price and parameters across all three.


    - Any valid resolution (1K / 2K / 4K, up to 3840×2160)

    - Quality tiers: low / medium / high / xhigh / max / auto (xhigh / max
    accepted by the two 2.5 models only)

    - Output formats: png (default) / jpeg / webp

    - Native Chinese prompt support

    - Single image per call (n=1)

    - Speed: flare is fastest; sunburst and gpt-image-2 are slower (4K high
    quality can take several minutes)

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
        Generate an image from a text prompt using `gpt-image-2.5-flare` /
        `gpt-image-2.5-sunburst` / `gpt-image-2`.


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
              model: gpt-image-2.5-flare
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
          description: >-
            Model name. gpt-image-2.5-flare (speed-first) /
            gpt-image-2.5-sunburst (quality- and editing-first) / gpt-image-2
            (previous generation) share the same price and parameters; pin a
            dated snapshot in production
          enum:
            - gpt-image-2.5-flare
            - gpt-image-2.5-sunburst
            - gpt-image-2
            - gpt-image-2.5-flare-2026-09-08
            - gpt-image-2.5-sunburst-2026-09-08
          default: gpt-image-2.5-flare
        prompt:
          type: string
          maxLength: 32000
          description: >-
            Prompt text, up to 32,000 characters (provider limit, counted in
            characters). Supports both Chinese and English. Place scene
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
            text), xhigh / max (new in 2.5: higher quality and cost, rejected by
            gpt-image-2), auto (default)
          enum:
            - auto
            - low
            - medium
            - high
            - xhigh
            - max
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