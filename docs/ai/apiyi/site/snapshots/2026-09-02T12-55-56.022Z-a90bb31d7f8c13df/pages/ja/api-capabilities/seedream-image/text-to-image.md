> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# テキストから画像への API リファレンス

> Seedream のテキストから画像への API リファレンスとライブプレイグラウンド — テキストのみの prompt、1K/2K/3K/4K と正確なピクセルサイズ、単一のエンドポイントで使える 3 つのバージョン

<Info>
  右側のインタラクティブなプレイグラウンドから、API を直接呼び出せます。**Authorization** に API キーを設定し（形式: `Bearer sk-xxx`）、prompt を入力して、モデルとサイズを選び、送信してください。
</Info>

<Tip>
  **対象範囲**: このページでは純粋な text-to-image のみを扱います（`image` フィールドなし）。参照画像の編集、複数画像の融合、またはバッチシーケンス生成については、[Image Editing](/ja/api-capabilities/seedream-image/image-edit) をご覧ください。— 同じ endpoint で、パラメータが異なるだけです。
</Tip>

<Warning>
  **🖥️ ブラウザのプレイグラウンドの制限（b64\_json モードのみ）**

  既定の `response_format: "url"` モードでは、プレイグラウンドは問題なく動作します（レスポンスは一時的な BytePlus TOS リンクになるだけです）。`response_format: "b64_json"` に切り替えると、レスポンスに複数 MB の base64 文字列が含まれ、ブラウザのプレイグラウンドで `请求时发生错误: unable to complete request` が表示されることがあります。— **リクエスト自体は成功しています**。ブラウザがそのような長い base64 文字列をレンダリングできないだけです。

  **推奨ワークフロー**:

  * 画像を表示したいだけですか？ **既定の `url` モードのままにしてください** — プレイグラウンドはリンクを直接返します（24時間以内にご自身のストレージへダウンロードすることを忘れないでください）。
  * b64\_json が必要ですか？ **下のコードサンプルをコピーして、ローカルで実行してください** — コードが自動的に画像をデコードしてファイルに保存します。
</Warning>

<Warning>
  **⚠️ 解像度の階層はバージョンによって異なります**

  * `seedream-5-0-pro-260628` — プリセット `1K` / `2K` に加え、合計ピクセル数 4.19M までの正確な WxH（16:9 では最長辺が 2720×1530 に達することを確認済み。3K/4K のプリセットはありません。`sequential_image_generation` / `stream` は受け付けられず、渡すと 400 が返ります。画像 1 枚あたり約 2 分）
  * `seedream-5-0-260128` — `2K` / `3K` のみ（4K なし）
  * `seedream-4-5-251128` — `2K` / `4K`
  * `seedream-4-0-250828` — `1K` / `2K` / `4K`

  **サポートされていないサイズは 400 を返します**。正確なピクセル値は、合計が \[1280×720, 4096×4096]、アスペクト比が \[1/16, 16] の範囲内である必要があります。
</Warning>

<Info>
  すべての image API は**同期型**です。ポーリングする task ID はなく、クライアントが切断されると、リクエストは課金されたまま結果が失われます。このモデルでは十分長いタイムアウトを設定してください。[Image API の基本とベストプラクティス](/ja/api-capabilities/image-api-best-practices) をご覧ください。
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

| Parameter         | Type    | Required | Default | Description                                                                                                                                                                                                      |
| ----------------- | ------- | -------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`           | string  | yes      | —       | `seedream-5-0-260128` / `seedream-4-5-251128` / `seedream-4-0-250828` / `seedream-5-0-pro-260628` (pro tier, \$0.12/request)                                                                                     |
| `prompt`          | string  | yes      | —       | prompt。英語と中国語に対応しています。シーン、スタイル、ライティングを詳しく指定してください。                                                                                                                                                               |
| `size`            | string  | no       | `2K`    | プリセットティア（バージョンにより異なります）または正確なピクセル `WxH`                                                                                                                                                                          |
| `response_format` | string  | no       | `url`   | `url` は署名付きリンクを返します。`b64_json` はプレーンな base64 文字列を返します                                                                                                                                                            |
| `output_format`   | string  | no       | `jpeg`  | 5.0 は `png` / `jpeg` に対応し、4.5 / 4.0 は `jpeg` のみ対応しています（OpenAI SDK では `extra_body` 経由で渡します）                                                                                                                       |
| `n`               | integer | —        | —       | ⚠️ **上流ではサポートされていません**: このパラメータは黙って無視されます — それでも 1 画像が返り、1 件分課金されます。複数画像出力には `sequential_image_generation` を使用してください（生成された画像ごとに課金されます）。[Image Editing](/ja/api-capabilities/seedream-image/image-edit) を参照してください |
| `seed`            | integer | —        | —       | ⚠️ 公式には seedream-3-0-t2i のみが対応しています。現在の 4.x / 5.x モデルでは無視されます                                                                                                                                                    |
| `watermark`       | boolean | no       | varies  | BytePlus のウォーターマークを含めるかどうか（商用利用では `false` を設定）                                                                                                                                                                   |
| `stream`          | boolean | no       | `false` | ストリーミング出力。長い prompt + 高解像度で便利です                                                                                                                                                                                  |

<Tip>
  詳細なパラメータ制約、許可される値、例は右側の Playground パネルで確認できます。**編集 / 複数画像パラメータ（`image`、`sequential_image_generation` など）は [Image Editing](/ja/api-capabilities/seedream-image/image-edit) ページで説明されています。**
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
    request, ~2 min per image)

    - Resolution tiers vary by version (5.0: 2K/3K; 4.5: 2K/4K; 4.0: 1K/2K/4K;
    5.0-pro: 1K/2K plus WxH up to 4.19M total px, longest edge ~2720 at 16:9)

    - Output format: 5.0 / 5.0-pro support png/jpeg; 4.5/4.0 only jpeg

    - 5.0-pro does not accept `sequential_image_generation` / `stream` — passing
    them returns 400

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

            - `1K` (~1024×1024) — 4.0 only

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
            generation
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