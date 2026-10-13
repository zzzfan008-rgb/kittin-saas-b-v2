> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# テキストから画像生成 API リファレンス

> Seedream テキストから画像生成 API リファレンスおよびライブプレイグラウンド — テキストのみの prompt、1K/1.5K/2K/3K/4K および正確なピクセルサイズ、単一のエンドポイントですべてのバージョンに対応

<Info>
  右側のインタラクティブなPlaygroundを使用すると、APIを直接呼び出すことができます。**Authorization**にご自身のAPIキーを設定し（形式：`Bearer sk-xxx`）、promptを入力し、モデルとサイズを選択して送信を押してください。
</Info>

<Tip>
  **適用範囲**：このページでは純粋なテキストからの画像生成（`image`フィールドなし）について説明します。参照画像編集、複数画像の合成、またはバッチシーケンス生成については、[画像編集](/ja/api-capabilities/seedream-image/image-edit)を参照してください — 同じエンドポイントで、パラメータのみが異なります。
</Tip>

<Warning>
  **🖥️ ブラウザPlaygroundの制限事項（b64\_jsonモードのみ）**

  デフォルトの`response_format: "url"`モードでは、Playgroundは正常に動作します（レスポンスは一時的なBytePlus TOSリンクのみです）。`response_format: "b64_json"`に切り替えると、レスポンスには数MBのbase64文字列が含まれ、ブラウザのPlaygroundに`请求时发生错误: unable to complete request`が表示される場合があります — **リクエスト自体は正常に成功しています**。ブラウザがこれほど長いbase64文字列を描画できないだけです。

  **推奨されるワークフロー**：

  * 画像を確認したいだけの場合：**デフォルトの`url`モードのままにしてください** — Playgroundが直接リンクを返します（24時間以内にご自身のストレージにダウンロードすることを忘れないでください）。
  * b64\_jsonが必要な場合：**以下のコードサンプルをコピーしてローカルで実行してください** — コードが自動的に画像をデコードしてファイルに保存します。
</Warning>

<Warning>
  **⚠️ バージョンによって解像度ティアが異なります**

  * `seedream-5-0-flash-260915` — プリセット`1K` / `1.5K` / `2K`、および総ピクセル数0.92M〜4.62Mの正確な幅×高さ（WxH）、アスペクト比最大16:1（3K/4Kプリセットなし。プリセット使用時はモデルがアスペクト比を選択します。`sequential_image_generation` / `stream`は受け付けられず、渡すと400が返されます。画像1枚あたり約15〜20秒、\$0.018/リクエスト）
  * `seedream-5-0-pro-260628` — プリセット`1K` / `2K`、および総ピクセル数最大4.19Mの正確な幅×高さ（WxH）（16:9では長辺が2720×1530に達することを検証済み。3K/4Kプリセットなし。`sequential_image_generation` / `stream`は受け付けられず、渡すと400が返されます。画像1枚あたり約2分）
  * `seedream-5-0-260128` — `2K` / `3K`のみ（4Kなし）
  * `seedream-4-5-251128` — `2K` / `4K`
  * `seedream-4-0-250828` — `1K` / `2K` / `4K`

  **サポートされていないサイズは400を返します**。正確なピクセル数は、総ピクセル数 ∈ \[1280×720, 4096×4096] かつアスペクト比 ∈ \[1/16, 16] を満たす必要があります。
</Warning>

<Info>
  すべての画像APIは**同期**処理です — ポーリング用のタスクIDは存在せず、クライアントの接続が切断された場合、リクエストの課金は発生したまま結果が失われます。このモデルには十分なタイムアウト値を設定してください。詳細については[画像APIの基本とベストプラクティス](/ja/api-capabilities/image-api-best-practices)を参照してください。
</Info>

## コード例

### Python（OpenAI SDK）

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.generate(
    model="seedream-5-0-260128",
    prompt="A modern tech product launch poster with bold typography, sleek smartphone on gradient background, text: 'Innovation 2026', ultra detailed, professional",
    size="2K",
    response_format="url",
    extra_body={
        "output_format": "png",
        "watermark": False,
    }
)

print(resp.data[0].url)
```

### Python（生の requests）

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
        "model": "seedream-5-0-260128",
        "prompt": "A serene Japanese garden with cherry blossoms, koi pond, traditional wooden bridge, golden hour, ultra detailed",
        "size": "2K",
        "response_format": "url",
        "watermark": False
    },
    timeout=60  # ~15s typical, 4K + hd may reach 30-60s
).json()

print(response["data"][0]["url"])
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "seedream-5-0-260128",
    "prompt": "A futuristic cityscape at night with neon lights and flying vehicles, cyberpunk style, high detail",
    "size": "2K",
    "response_format": "url",
    "watermark": false
  }'
```

### Node.js（fetch）

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'seedream-5-0-260128',
        prompt: 'Minimalist line-art logo of a cat, monochrome, vector style',
        size: '2K',
        response_format: 'url',
        output_format: 'png',
        watermark: false
    })
});

const { data } = await resp.json();
console.log(data[0].url);
```

### ブラウザ JavaScript

```javascript theme={null}
{/* Demo only — proxy through your backend in production to avoid leaking the key */}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'seedream-5-0-260128',
        prompt: 'Watercolor northern lights over snowy mountains',
        size: '2K'
    })
});

const { data } = await resp.json();
document.getElementById('img').src = data[0].url;
```

## パラメータリファレンス

| パラメータ | 型 | 必須 | デフォルト値 | 説明 |
| - | - | - | - | - |
| `model` | string | はい | — | `seedream-5-0-260128` / `seedream-4-5-251128` / `seedream-4-0-250828` / `seedream-5-0-pro-260628` (Proティア、\$0.12/リクエスト) / `seedream-5-0-flash-260915` (fastティア、\$0.018/リクエスト) |
| `prompt` | string | はい | — | promptテキスト。英語と中国語に対応しています。シーン、スタイル、照明について詳細に記述してください。 |
| `size` | string | いいえ | `2K` | プリセットティア（バージョンにより異なります）または正確なピクセル数 `WxH` |
| `response_format` | string | いいえ | `url` | `url` は署名付きリンクを返します。`b64_json` はプレーンな base64 文字列を返します |
| `output_format` | string | いいえ | `jpeg` | 5.0シリーズは `png` / `jpeg` に対応、4.5 / 4.0 は `jpeg` のみに対応（OpenAI SDK では `extra_body` 経由で渡します） |
| `n` | integer | — | — | ⚠️ **アップストリームで非対応**: このパラメータは警告なしに無視されます — 常に1枚の画像のみ取得され、1枚分が課金されます。複数画像の出力には `sequential_image_generation` を使用してください（生成された画像ごとに課金）。詳細は[画像編集](/ja/api-capabilities/seedream-image/image-edit)を参照してください |
| `seed` | integer | — | — | ⚠️ 公式には seedream-3-0-t2i のみでサポートされています。現在の 4.x / 5.x モデルでは無視されます |
| `watermark` | boolean | いいえ | モデルにより異なる | BytePlusのウォーターマークを含めるかどうか（商用利用の場合は `false` に設定してください。5.0-flash では省略時に「AI generated」ウォーターマークが追加されます） |
| `stream` | boolean | いいえ | `false` | ストリーミング出力。長い prompt や高解像度の場合に便利です。5.0-pro / 5.0-flash では受け入れられず、400 が返されます |

<Tip>
  詳細なパラメータ制約、許容値、サンプルは右側の Playground パネルで確認できます。**編集／複数画像のパラメータ（`image`、`sequential_image_generation` など）は、[画像編集](/ja/api-capabilities/seedream-image/image-edit)ページに記載されています。**
</Tip>

## レスポンス形式

```json theme={null}
{
  "model": "seedream-5-0-260128",
  "created": 1768518000,
  "data": [
    {
      "url": "https://ark-content-generation-v2-ap-southeast-1.tos-ap-southeast-1.bytepluses.com/seedream-5-0/.../image.png",
      "size": "2048x2048"
    }
  ],
  "usage": {
    "generated_images": 1,
    "output_tokens": 6240,
    "total_tokens": 6240
  }
}
```

<Warning>
  **⚠️ レスポンスフィールドの注意点**

  * `response_format=url` の場合、`data[].url` は **一時的な署名付き BytePlus TOS URL** です（通常は 24 時間有効です）。本番では、すぐにご自身のストレージへダウンロードしてください。
  * `response_format=b64_json` の場合、`data[].b64_json` は `data:image/...;base64,` プレフィックスのない **プレーンな base64 文字列** です。ファイル出力用にデコードする（`base64.b64decode`）か、ブラウザ表示用にご自身でプレフィックスを付けてください。
  * `data[].size` は **実際の出力サイズ** を反映しており、モデルのアスペクト比正規化後に要求した `size` とわずかに異なる場合があります。
</Warning>

<Info>
  `usage.generated_images` は課金対象の画像枚数を反映します。Seedream は画像ごとに課金されます。`output_tokens` / `total_tokens` はオブザーバビリティ指標であり、課金には影響しません。
</Info>


## OpenAPI

````yaml api-reference/seedream-image-generate-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: Seedream Text-to-Image API
  description: >
    BytePlus ModelArk Seedream image generation models — text-to-image endpoint
    (no `image` field).


    - Active versions unified: `seedream-5-0-260128` / `seedream-4-5-251128` /
    `seedream-4-0-250828` / `seedream-5-0-pro-260628` (pro tier, \$0.12 per
    request, ~2 min per image) / `seedream-5-0-flash-260915` (fast tier, \$0.018
    per request, ~15–20 s per image)

    - Resolution tiers vary by version (5.0: 2K/3K; 4.5: 2K/4K; 4.0: 1K/2K/4K;
    5.0-pro: 1K/2K plus WxH up to 4.19M total px, longest edge ~2720 at 16:9;
    5.0-flash: 1K/1.5K/2K plus WxH from 0.92M to 4.62M total px)

    - Output format: the 5.0 series supports png/jpeg; 4.5/4.0 only jpeg

    - 5.0-pro / 5.0-flash do not accept `sequential_image_generation` / `stream`
    — passing them returns 400

    - Latency ≈ 15s per image, may extend to 30-60s for 4K + hd

    - Default 500 RPM (Max Images per Minute)

    - For editing, multi-image fusion, or batch sequence generation, see [Image
    Editing](/en/api-capabilities/seedream-image/image-edit) (same endpoint,
    different params)


    **Auth**: add `Authorization: Bearer YOUR_API_KEY` to the request header.


    **Get API Key**: visit [APIYI Console](https://api.apiyi.com/token) to
    create a token.
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
      summary: 'Text-to-Image: generate an image from a text prompt'
      description: >
        Generate an image with the Seedream models from a text prompt.


        - Required: `model`, `prompt`

        - Optional: `size`, `response_format`, `output_format`, `watermark`,
        `stream`

        - Note: OpenAI's `n` parameter is not supported upstream (silently
        ignored — you still get 1 image); for multi-image output use
        `sequential_image_generation`

        - Resolution tiers vary by version — see [Overview / Technical
        Specs](/en/api-capabilities/seedream-image/overview#technical-specs)

        - For reference-image editing or multi-image fusion, use the same
        endpoint with `image` and `sequential_image_generation` — see [Image
        Editing](/en/api-capabilities/seedream-image/image-edit)
      operationId: generateSeedreamTextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SeedreamGenerateRequest'
            example:
              model: seedream-5-0-260128
              prompt: >-
                A modern tech product launch poster, sleek smartphone on
                gradient background, text: 'Innovation 2026', ultra detailed,
                professional
              size: 2K
              response_format: url
              output_format: png
              watermark: false
      responses:
        '200':
          description: Image generated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SeedreamImageResponse'
        '400':
          description: >-
            Invalid parameters (size not supported by this version, pixel out of
            range, aspect ratio out of bounds)
        '401':
          description: Unauthorized — invalid API key
        '403':
          description: Blocked by content moderation
        '429':
          description: Rate limit (default 500 RPM) or insufficient balance
        '500':
          description: Internal server error
      security:
        - bearerAuth: []
components:
  schemas:
    SeedreamGenerateRequest:
      type: object
      required:
        - model
        - prompt
      properties:
        model:
          type: string
          description: Model ID
          enum:
            - seedream-5-0-260128
            - seedream-5-0-lite-260128
            - seedream-4-5-251128
            - seedream-4-0-250828
            - seedream-5-0-pro-260628
            - seedream-5-0-flash-260915
          default: seedream-5-0-260128
        prompt:
          type: string
          description: >-
            Prompt, supports both English and Chinese. Describe scene, style,
            and lighting in detail for better results.
          example: >-
            A serene Japanese garden with cherry blossoms, koi pond, traditional
            bridge, golden hour, ultra detailed
        size:
          type: string
          description: >
            Output size. Preset tiers (vary by version):

            - `1K` (~1024×1024) — 4.0 / 5.0-pro / 5.0-flash

            - `1.5K` (~1536×1536) — 5.0-flash only

            - `2K` (~2048×2048) — 5.0 / 4.5 / 4.0

            - `3K` (~3072×3072) — 5.0 only

            - `4K` (~4096×4096) — 4.5 / 4.0


            Or exact pixel size `WxH`, total pixels ∈ \[1280×720, 4096×4096\],
            aspect ratio ∈ \[1/16, 16\]
          example: 2K
          default: 2K
        response_format:
          type: string
          description: >-
            url returns a temp signed link (24h validity); b64_json returns
            plain base64 (no data: prefix)
          enum:
            - url
            - b64_json
          default: url
        output_format:
          type: string
          description: Output format. 5.0 supports png/jpeg; 4.5/4.0 only jpeg
          enum:
            - png
            - jpeg
          default: jpeg
        seed:
          type: integer
          description: >-
            Random seed. Note: officially supported only by seedream-3-0-t2i;
            ignored by the current 4.x / 5.x models
          example: 42
        watermark:
          type: boolean
          description: >-
            Whether to include the BytePlus watermark. Set to false for
            commercial use
          default: false
        stream:
          type: boolean
          description: >-
            Enable streaming output. Useful for long prompts and high-resolution
            generation. Not accepted by 5.0-pro / 5.0-flash (returns 400)
          default: false
    SeedreamImageResponse:
      type: object
      properties:
        model:
          type: string
          example: seedream-5-0-260128
        created:
          type: integer
          description: Unix timestamp
          example: 1768518000
        data:
          type: array
          items:
            type: object
            properties:
              url:
                type: string
                description: >-
                  Image URL (returned when response_format=url; signed temp URL
                  valid for 24h)
                example: >-
                  https://ark-content-generation-v2-ap-southeast-1.tos-ap-southeast-1.bytepluses.com/seedream-5-0/.../image.png
              b64_json:
                type: string
                description: >-
                  Plain base64 string (no data:image/...;base64, prefix).
                  Returned when response_format=b64_json.
              size:
                type: string
                description: >-
                  Actual output size, may differ slightly from requested due to
                  aspect-ratio adjustments
                example: 2048x2048
        usage:
          type: object
          properties:
            generated_images:
              type: integer
              description: Actual billed image count
              example: 1
            output_tokens:
              type: integer
              example: 6240
            total_tokens:
              type: integer
              example: 6240
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key obtained from APIYI Console

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.