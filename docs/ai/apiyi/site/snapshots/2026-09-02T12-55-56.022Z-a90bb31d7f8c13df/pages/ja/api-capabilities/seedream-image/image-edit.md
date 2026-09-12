> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 画像編集 API リファレンス

> Seedream の画像編集、複数画像の融合、バッチ連続生成の API リファレンスとライブ プレイグラウンド — 画像配列と sequential_image_generation パラメータで切り替える、同じ generations エンドポイント

<Info>
  **1つのエンドポイント、複数のモード**: Seedream には個別の `/v1/images/edits` エンドポイントはありません。編集、複数画像の融合、バッチシーケンスはすべて `POST /v1/images/generations` で行われます。このページのプレイグラウンドは [テキストから画像生成](/ja/api-capabilities/seedream-image/text-to-image) と同じエンドポイントを呼び出します — 唯一の違いは、リクエスト本文内の `image` と `sequential_image_generation` パラメータです。
</Info>

<Tip>
  **モード**:

  * **単一画像の編集** — `image: ["url"]` + `sequential_image_generation: "disabled"`
  * **複数画像の融合** — `image: ["url1", "url2", ...]` + `disabled`
  * **バッチシーケンス** — `sequential_image_generation: "auto"` + `sequential_image_generation_options.max_images: N`
  * **画像からシーケンス** — 2 つを組み合わせます: `image` 配列 + `auto` + `max_images`
</Tip>

<Warning>
  **🖥️ ブラウザ版 Playground の制限（b64\_json モードのみ）**

  デフォルトの `response_format: "url"` モードでは、Playground は問題なく動作します（レスポンスは一時的な BytePlus TOS リンクだけです）。`response_format: "b64_json"` に切り替えると、レスポンスに数 MB の base64 文字列が含まれ、ブラウザ版 Playground では `请求时发生错误: unable to complete request` と表示されることがあります — **リクエスト自体は実際には成功しています**。ブラウザがそのような長い base64 文字列をレンダリングできないだけです。

  **推奨ワークフロー**:

  * 画像を表示したいだけですか？ **デフォルトの `url` モードのままにしてください** — Playground はリンクを直接返します（24 時間以内にご自身のストレージへダウンロードしてください）。
  * b64\_json が必要ですか？ **下のコードサンプルをコピーしてローカルで実行してください** — コードが画像をデコードしてファイルに自動保存します。
</Warning>

<Warning>
  **⚠️ OpenAI gpt-image-2 の編集との主な違い**

  * **multipart/form-data アップロードは不要です** — まず画像を OSS か公開画像ホストにアップロードし、その後 `image` 配列に URL を渡します
  * **`image` は URL 配列であり、繰り返しの `image[]` フィールドではありません**（OpenAI の `multipart/form-data` 形式とは異なります）
  * **`mask` フィールドはありません** — Seedream はアルファチャンネルマスクのインペインティングをサポートしておらず、画像全体が prompt によって書き換えられます
  * **合計数には厳しい上限があります**: 入力参照 + 出力 ≤ 15 枚の画像
</Warning>

<Warning>
  **📎 複数画像では順序が重要です**

  `image` 配列内の URL の順序が、prompt で参照される「画像 1 / 画像 2 / 画像 3」になります。順序を明示してください:

  > 画像 1 の服を画像 2 の衣装に置き換え、画像 3 の照明は維持してください。

  英語の prompt が最も効果的です（モデルは主に英語で学習されています）が、表現が明確であれば中国語もサポートされています。
</Warning>

## コード例

<Note>
  **`extra_body` について（重要 — 追加のネスト層だと誤解しないでください）**

  `image`、`sequential_image_generation`、および `watermark` は、OpenAI SDK の `images.generate()` の標準パラメータではないため、Python SDK では送信するには `extra_body` の中に入れる **必要があります**。

  しかし、`extra_body` は単なる SDK のパラメータコンテナであり、そのフィールドはリクエストボディの **最上位にフラット化されてマージされ**、`model` や `prompt` と **同じ階層** に置かれます。実際に送信される JSON は下の cURL 例と同じで、（`image` は最上位にあります）；リクエスト内に本当の `"extra_body": {...}` ネストは **ありません**。

  OpenAI SDK を使わずに JSON を直接組み立てる場合（requests / fetch / など）は、**`extra_body` と書かないでください** — `image` と他のフィールドを `model` と同じ階層に置くだけです。
</Note>

### Python (OpenAI SDK · 単一画像編集)

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.generate(
    model="seedream-5-0-260128",
    prompt="Generate a close-up image of a dog lying on lush grass.",
    size="2K",
    response_format="url",
    # Fields in extra_body are flattened to the top level of the request body
    # (same level as model) by the SDK — not an extra nesting layer
    extra_body={
        "image": ["https://your-oss.example.com/source-photo.png"],
        "sequential_image_generation": "disabled",
        "watermark": False,
    }
)

print(resp.data[0].url)
```

### Python (OpenAI SDK · 複数画像融合)

```python theme={null}
resp = client.images.generate(
    model="seedream-4-5-251128",
    prompt="Replace the clothing in image 1 with the outfit from image 2, keeping the lighting style of image 3.",
    size="4K",
    response_format="url",
    extra_body={
        "image": [
            "https://your-oss.example.com/person.png",
            "https://your-oss.example.com/outfit.png",
            "https://your-oss.example.com/lighting-ref.png",
        ],
        "sequential_image_generation": "disabled",
        "watermark": False,
    }
)

print(resp.data[0].url)
```

### Python (OpenAI SDK · バッチシーケンス)

```python theme={null}
resp = client.images.generate(
    model="seedream-5-0-260128",
    prompt=(
        "Generate four cinematic sci-fi storyboard scenes:"
        "Scene 1 — astronaut repairing a spacecraft;"
        "Scene 2 — meteor strike in deep space;"
        "Scene 3 — emergency dodge in zero gravity;"
        "Scene 4 — astronaut returning to ship."
    ),
    size="2K",
    response_format="url",
    extra_body={
        "sequential_image_generation": "auto",
        "sequential_image_generation_options": {"max_images": 4},
        "watermark": False,
    }
)

for item in resp.data:
    print(item.url)
```

### cURL (複数画像融合)

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "seedream-5-0-260128",
    "prompt": "Replace the clothing in image 1 with the outfit from image 2.",
    "image": [
      "https://your-oss.example.com/person.png",
      "https://your-oss.example.com/outfit.png"
    ],
    "sequential_image_generation": "disabled",
    "size": "2K",
    "response_format": "url",
    "watermark": false
  }'
```

### Node.js (fetch · バッチシーケンス)

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'seedream-5-0-260128',
        prompt: 'A four-panel comic about a cat astronaut: launch, space walk, alien encounter, return home.',
        size: '2K',
        sequential_image_generation: 'auto',
        sequential_image_generation_options: { max_images: 4 },
        response_format: 'url',
        watermark: false
    })
});

const { data } = await resp.json();
data.forEach((item, i) => console.log(`#${i + 1}:`, item.url));
```

## パラメータリファレンス

| Parameter                                        | Type            | Required | Default    | Description                                                                                                                  |
| ------------------------------------------------ | --------------- | -------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `model`                                          | string          | yes      | —          | `seedream-5-0-260128` / `seedream-4-5-251128` / `seedream-4-0-250828` / `seedream-5-0-pro-260628` (pro tier, \$0.12/request) |
| `prompt`                                         | string          | yes      | —          | 編集 / フュージョン / シーケンス指示                                                                                                        |
| `image`                                          | array of string | 編集時必須    | —          | URLまたはbase64 data URIとしての参照画像（`data:image/jpeg;base64,...`、検証済み）、**最大10枚**（公式4.5 / 5.0-proドキュメント準拠）                          |
| `sequential_image_generation`                    | string          | no       | `disabled` | 単一出力用の `disabled`; バッチシーケンス用の `auto`。**5.0-proでは未対応: どの値でも（`disabled`を含む）400を返します — proではパラメータを完全に省略してください**                 |
| `sequential_image_generation_options.max_images` | integer         | no       | —          | `auto` の場合のみ有効。**input + output ≤ 15** が適用されます。5.0-proでも未対応                                                                  |
| `size`                                           | string          | no       | `2K`       | プリセットティアまたは正確なピクセル数 — **ティアのサポートはバージョンによって異なります**（Overviewを参照）                                                               |
| `response_format`                                | string          | no       | `url`      | `url` / `b64_json`                                                                                                           |
| `output_format`                                  | string          | no       | `jpeg`     | 5.0 / 5.0-pro は `png` / `jpeg` をサポートし、4.5 / 4.0 は `jpeg` のみ                                                                  |
| `watermark`                                      | boolean         | no       | varies     | 商用利用には `false` を設定します                                                                                                        |
| `stream`                                         | boolean         | no       | `false`    | ストリーミング出力。長い prompt に推奨されます。**5.0-proでは未対応 — 400を返します**                                                                      |

## 複数画像およびシーケンスモードにおけるカウント制約

| シナリオ           | 入力 `image` 数 | `max_images` | 実際の出力 | 合計制約         |
| -------------- | ------------ | ------------ | ----- | ------------ |
| 単一画像編集         | 1            | —            | 1     | 2 ≤ 15 ✅     |
| 複数画像合成         | 3            | —            | 1     | 4 ≤ 15 ✅     |
| 複数画像合成 + シーケンス | 3            | 4            | 4     | 7 ≤ 15 ✅     |
| 複数画像合成 + シーケンス | 10           | 6            | 6     | 16 > 15 ❌ 却下 |

<Tip>
  **反復的な精緻化**: 以前の出力の URL を次の入力として、新しい編集指示を与え、段階的に精緻化します。各ラウンドは画像ごとに課金されます。累積コストに注意してください。
</Tip>

## 応答形式

```json theme={null}
{
  "model": "seedream-5-0-260128",
  "created": 1768518000,
  "data": [
    {
      "url": "https://ark-content-generation-v2-ap-southeast-1.tos-ap-southeast-1.bytepluses.com/seedream-5-0/.../scene-1.png",
      "size": "2048x2048"
    },
    {
      "url": "https://...scene-2.png",
      "size": "2048x2048"
    }
  ],
  "usage": {
    "generated_images": 2,
    "output_tokens": 12480,
    "total_tokens": 12480
  }
}
```

<Warning>
  **⚠️ `data` 配列の長さは実際の出力数を反映します**

  * `sequential_image_generation: "disabled"` → 単一要素の `data`
  * `sequential_image_generation: "auto"` + `max_images: N` → 通常は N 要素（prompt の生成結果が少ない場合は、さらに少なくなることがあります）
  * 課金は `usage.generated_images` 単位で、**`max_images` 単位ではありません**
</Warning>

<Info>
  編集リクエストは text-to-image と同様に、出力画像ごとに課金されます。参照画像の入力は別途課金されません。
</Info>


## OpenAPI

````yaml api-reference/seedream-image-edit-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: Seedream Image Editing / Multi-image Fusion / Batch Sequence API
  description: >
    BytePlus ModelArk Seedream image generation models — editing / multi-image
    fusion / batch sequence endpoint.


    **Important**: Seedream has no separate `/v1/images/edits` endpoint.
    Editing, multi-image fusion, and batch sequence generation all run through
    `POST /v1/images/generations`. The mode is switched via `image` and
    `sequential_image_generation` in the request body.


    - Single-image editing: `image: ["url"]` + `sequential_image_generation:
    "disabled"`

    - Multi-image fusion: `image: ["url1", "url2", ...]` + `disabled` (up to 10
    reference images)

    - Batch sequence: `sequential_image_generation: "auto"` + `max_images`

    - Hard constraint: **input reference images + output images ≤ 15**


    Unlike OpenAI gpt-image-2, this endpoint **does not accept
    multipart/form-data**. Upload images to your OSS or a public image host
    first, then pass the URLs as an array.


    **Auth**: add `Authorization: Bearer YOUR_API_KEY` to the request header.
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
        - Image Editing
      summary: Image Editing / Multi-image Fusion / Batch Sequence
      description: >
        Generate new images from reference images (`image` URL array) plus a
        prompt, or enable batch sequence to output multiple coherent images.


        - Single-image edit: pass 1 image + disabled

        - Multi-image fusion: pass multiple images + disabled, refer to "image 1
        / image 2" in the prompt

        - Batch sequence: with or without image, set auto + max_images
      operationId: editSeedreamImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SeedreamEditRequest'
            example:
              model: seedream-5-0-260128
              prompt: Replace the clothing in image 1 with the outfit from image 2.
              image:
                - https://your-oss.example.com/person.png
                - https://your-oss.example.com/outfit.png
              sequential_image_generation: disabled
              size: 2K
              response_format: url
              watermark: false
      responses:
        '200':
          description: Edited image generated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SeedreamImageResponse'
        '400':
          description: >-
            Invalid parameters (image array exceeds 10, total input+output
            exceeds 15, unsupported size, etc.)
        '401':
          description: Unauthorized — invalid API key
        '403':
          description: Blocked by content moderation
        '404':
          description: URLs in image array unreachable
        '429':
          description: Rate limit (default 500 RPM) or insufficient balance
        '500':
          description: Internal server error
      security:
        - bearerAuth: []
components:
  schemas:
    SeedreamEditRequest:
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
            Editing / fusion / sequence instruction. For multi-image scenarios,
            refer to images explicitly as 'image 1 / image 2'
          example: Replace the clothing in image 1 with the outfit from image 2.
        image:
          type: array
          items:
            type: string
            format: uri
          description: >-
            Reference image URL array. **Up to 10 images** (per official 4.5
            docs). Note: input + output count ≤ 15
          maxItems: 10
          example:
            - https://your-oss.example.com/person.png
            - https://your-oss.example.com/outfit.png
        sequential_image_generation:
          type: string
          description: >-
            Generation mode switch. disabled = single output (default); auto =
            batch sequence, paired with max_images
          enum:
            - disabled
            - auto
          default: disabled
        sequential_image_generation_options:
          type: object
          description: >-
            Batch sequence options. Effective only when
            sequential_image_generation=auto
          properties:
            max_images:
              type: integer
              description: Max number of output images. Subject to input + output ≤ 15
              minimum: 1
              maximum: 15
              example: 4
        size:
          type: string
          description: >
            Output size. Preset tiers (vary by version):

            - `1K` (4.0 only) / `2K` (all) / `3K` (5.0 only) / `4K` (4.5, 4.0)


            Or exact pixel size `WxH`, total pixels ∈ \[1280×720, 4096×4096\],
            aspect ratio ∈ \[1/16, 16\]
          example: 2K
          default: 2K
        response_format:
          type: string
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
        watermark:
          type: boolean
          default: false
        stream:
          type: boolean
          description: >-
            Streaming output. Recommended for long prompts and multi-image
            sequence scenarios
          default: false
    SeedreamImageResponse:
      type: object
      properties:
        model:
          type: string
          example: seedream-5-0-260128
        created:
          type: integer
          example: 1768518000
        data:
          type: array
          description: >-
            Result array. disabled mode returns 1 element; auto mode typically
            returns max_images elements (may be fewer)
          items:
            type: object
            properties:
              url:
                type: string
                example: >-
                  https://ark-content-generation-v2-ap-southeast-1.tos-ap-southeast-1.bytepluses.com/.../image.png
              b64_json:
                type: string
                description: 'Plain base64 string, no data: prefix'
              size:
                type: string
                example: 2048x2048
        usage:
          type: object
          description: Billed by generated_images actual count, NOT by max_images
          properties:
            generated_images:
              type: integer
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