> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 画像編集 API リファレンス

> gpt-image-2-vip の画像編集 API リファレンスとインタラクティブなプレイグラウンド — 参照画像と指示をアップロードして、単一画像の編集または複数画像の融合を行えます。`size` を使って出力寸法を固定します。

<Info>
  右側のインタラクティブな Playground では、ローカル画像の直接アップロードに対応しています。**Authorization** フィールドに API Key を入力し（形式: `Bearer sk-xxx`）、画像を選択して `prompt` / `model` / `size` を設定したら、送信をクリックしてください。
</Info>

<Tip>
  **対象範囲**: このページは**1枚または複数の参照画像の編集や融合**を対象としています。リクエストには `multipart/form-data` を使用します。純粋なテキストからの画像生成については、[テキストから画像生成のエンドポイント](/ja/api-capabilities/gpt-image-2-vip/text-to-image)をご覧ください。

  **`gpt-image-2-all` との違い**: 呼び出しの構造は同一で、`size` フィールドが1つ追加されているだけです。寸法を固定する必要がなく、最速の出力を希望する場合は、[`gpt-image-2-all`](/ja/api-capabilities/gpt-image-2-all/image-edit)をご利用ください。
</Tip>

<Warning>
  **🖥️ ブラウザ Playground の制限事項**

  このエンドポイントは**デフォルトで base64 文字列（`b64_json`）を返します**。これは数MBになることがあるため、ブラウザの Playground では `请求时发生错误: unable to complete request` と表示される場合があります — **リクエスト自体は実際には成功しています**。ブラウザ側でこれほど長い base64 文字列をレンダリングできないだけです。

  **推奨ワークフロー**: base64 を取得したい場合や、非常に大きな参照画像をアップロードする必要がある場合は、**以下のコードサンプルをコピーしてローカルで実行してください**。
</Warning>

<Warning>
  **📎 複数画像の融合順序に関する注意**

  `image` フィールドは複数の参照画像を受け付けます。**その順序が、prompt 内で「image1 / image2 / image3」として参照する際の基準となります。** prompt 内でそれらを明示的に参照してください（例：

  > image1 の人物を image2 のシーンに配置し、image3 の絵画スタイルにしてください

  **1画像あたり ≤ 10MB**、フォーマットは `png` / `jpg` / `webp` を推奨します。画像サイズが大きすぎると、ゲートウェイの制限に達する可能性があります。
</Warning>

<Tip>
  **🎯 形状を維持した編集**: `size=auto` を渡す（または `size` を省略する）と、出力は **prompt で編集対象として指定された参照画像のアスペクト比を継承します**。複数画像のシナリオにおいて、**必ずしも最初の画像とは限りません**。

  たとえば、「**image2 を変更し**、image2 の服装と帽子を image1 に合わせて変更」という prompt の場合、image2 が 1:1 であれば、出力も 1:1 になります（たとえ image1 が横長の 16:9 であっても）。

  服装の着せ替え、小物の追加、レタッチなど、形状を維持した編集に役立ちます。prompt で対象が指定されていない場合、モデルが独自に判断します。アスペクト比を変更する必要がある場合のみ、明示的な30種類のバケットから `size` を渡してください。
</Tip>

<Warning>
  **⚠️ 主要パラメータの注意事項**

  * **`size`**: **編集を行う場合は、`auto` を推奨します（またはフィールドを省略してください）** — モデルは、複数画像のシナリオにおいて必ずしも最初の画像ではなく、**prompt で編集対象として指定された参照画像**のアスペクト比を維持します。たとえば、「image2 を変更し、image2 の服装を image1 に合わせて変更」という prompt の場合、出力比率は image2 と一致します。prompt で区別されていない場合は、モデルが独自に判断します。異なる寸法を強制したい場合は、サポートされている30種類のサイズから1つ選択してください。小文字の ASCII `x` を使用します（例: `2048x1360`、`3840x2160`）。一覧表: [概要ページ](/ja/api-capabilities/gpt-image-2-vip/overview#supported-sizes-full-30-size-table)。
  * **`quality`**: 任意指定であり、テストで有効です（チャネルの動作であり、確約ではありません — 実際のレスポンスに従ってください）。2.5 モデル（`gpt-image-2.5-vip` = `gpt-image-2.5-sunburst-vip`、`gpt-image-2.5-flare-vip`）は全6段階（`auto` / `low` / `medium` / `high` / `xhigh` / `max`）を受け入れます。`gpt-image-2-vip` は `high` までで、`xhigh` / `max` は拒否されます。同名の階層でも同等ではありません。2.5 の `high` は `gpt-image-2-vip` `medium` にのみ一致し、2.5 の `max` はその `high` に一致します。1画像あたり一律 \$0.03 であり、階層によって変わりませんが、上位の階層ほど時間がかかります。
  * **`n`**: ❌ 拒否されます — 1回の呼び出しにつき1画像のみです。
  * **`response_format`**: 省略すると base64 が返されます（プレフィックスなしの生データ、2026年7月検証済み）。画像 URL を取得するには `"url"` を渡してください。**URL 出力に依存する**ビジネスでは、base64 へのフォールバックなしで確実に URL を出力させるために、token を `image2_OSS` グループに切り替えてください。
</Warning>

## コード例

### Python

**単一画像編集**:

```python theme={null}
import requests

API_KEY = "sk-your-api-key"

with open("photo.png", "rb") as f:
    response = requests.post(
        "https://api.apiyi.com/v1/images/edits",
        headers={"Authorization": f"Bearer {API_KEY}"},
        data={
            "model": "gpt-image-2.5-vip",
            "prompt": "Replace the background with a sunset beach",
            "size": "2048x1360"          # 3:2 2K Recommended
        },
        files=[
            ("image", ("photo.png", f, "image/png"))
        ],
        timeout=300  # conservative; absorbs upload + long-tail
    ).json()

print(response["data"][0]["url"])
```

**複数画像の融合**:

```python theme={null}
import requests

with open("ref1.png", "rb") as f1, \
     open("ref2.png", "rb") as f2, \
     open("ref3.png", "rb") as f3:
    response = requests.post(
        "https://api.apiyi.com/v1/images/edits",
        headers={"Authorization": "Bearer sk-your-api-key"},
        data={
            "model": "gpt-image-2.5-vip",
            "prompt": "Place the person from image1 into the scene of image2, in the style of image3",
            "size": "2048x2048"          # 1:1 2K Recommended
        },
        files=[
            ("image", ("ref1.png", f1, "image/png")),
            ("image", ("ref2.png", f2, "image/png")),
            ("image", ("ref3.png", f3, "image/png"))
        ],
        timeout=300
    ).json()

# Verified July 2026: b64_json is raw base64 (no data: prefix); earlier versions
# included the prefix, so a defensive check is safest
import base64
b64 = response["data"][0]["b64_json"]
if b64.startswith("data:"):
    b64 = b64.split(",", 1)[1]
with open("edited.png", "wb") as f:
    f.write(base64.b64decode(b64))
```

### cURL

**単一画像編集**:

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2.5-vip" \
  -F "prompt=Replace the background with a sunset beach" \
  -F "size=2048x1360" \
  -F "image=@./photo.png"
```

**複数画像の融合**:

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2.5-vip" \
  -F "prompt=Place the person from image1 into the scene of image2, in the style of image3" \
  -F "size=2048x2048" \
  -F "image=@./ref1.png" \
  -F "image=@./ref2.png" \
  -F "image=@./ref3.png"
```

### Node.js（ネイティブ fetch + FormData）

```javascript theme={null}
import fs from 'node:fs';

const form = new FormData();
form.append('model', 'gpt-image-2.5-vip');
form.append('prompt', 'Replace the background with outer space');
form.append('size', '2048x1360');
form.append(
  'image',
  new Blob([fs.readFileSync('./photo.png')]),
  'photo.png'
);

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});
const data = await resp.json();
console.log(data.data[0].url);
```

### ブラウザー JavaScript（Fileオブジェクト）

```javascript theme={null}
// <input type="file" id="fileInput" multiple>
const files = document.getElementById('fileInput').files;
const form = new FormData();
form.append('model', 'gpt-image-2.5-vip');
form.append('prompt', 'Fuse these images into a single poster');
form.append('size', '2048x2048');
for (const f of files) form.append('image', f);

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});
const { data } = await resp.json();
document.getElementById('result').src = data[0].url;
```

## パラメーター

| フィールド | 型 | 必須 | 説明 |
| - | - | - | - |
| `model` | テキスト | はい | `gpt-image-2.5-vip`（= `gpt-image-2.5-sunburst-vip`）/ `gpt-image-2.5-flare-vip` / 旧世代の`gpt-image-2-vip`、価格と呼び出し形式は同一；`mask`は3つすべてで画像全体を再生成します |
| `prompt` | テキスト | はい | 自然言語による編集・融合の説明 |
| `image` | ファイル | はい | 参照画像。繰り返し指定できます（配列フィールド） |
| `size` | テキスト | いいえ | 出力サイズ：`auto`（デフォルト — **プロンプトで編集対象として指定された参照画像に従い、必ずしも最初の画像とは限りません**）または30種類のサイズのいずれか；形式 `WIDTHxHEIGHT`（小文字の`x`） |

<Tip>
  **マルチターン反復**：前回の出力を次の呼び出しの`image`として再入力し、新しい編集指示で段階的に調整します。各ラウンドでは独自の`size`を指定できます。
</Tip>

## 応答形式

text-to-image エンドポイントと同様です: **既定で base64 を返します**（`data[0].b64_json`、プレフィックスなしの生の base64、2026年7月に確認済み）。**画像URL** を取得するには、`response_format: "url"` を明示的に指定してください。**URL 出力に依存する** 事業者は、プレフィックスなしで決定的に URL を出力するよう、トークンを **`image2_OSS` グループ** に切り替える必要があります。`data[0]` は `url` または `b64_json` のどちらかを返し、両方が返ることはありません。

**`b64_json` モード**（既定）:

```json theme={null}
{
  "data": [
    {
      "b64_json": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
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

**`url` モード**（`response_format: "url"` を明示的に指定してください。URL に依存する場合は `image2_OSS` グループを使用してください）:

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
  2026年7月に確認済み: `b64_json` フィールドは **`data:` プレフィックスなしの生の base64** です — レンダリングする前にデコードするか、自分でプレフィックスを付けてください。**以前のバージョンではプレフィックスが含まれていました** ので、両方の形式に対応するために最初に必ず `startsWith('data:')` を確認してください。
</Warning>

## 関連リソース

<CardGroup cols={2}>
  <Card title="モデル概要（フルサイズ表）" icon="sparkles" href="/ja/api-capabilities/gpt-image-2-vip/overview">
    30サイズの完全な表、料金、技術仕様
  </Card>

  <Card title="テキストから画像への API" icon="wand-sparkles" href="/ja/api-capabilities/gpt-image-2-vip/text-to-image">
    `/v1/images/generations`互換エンドポイント
  </Card>

  <Card title="姉妹モデル gpt-image-2-all" icon="copy" href="/ja/api-capabilities/gpt-image-2-all/image-edit">
    固定サイズが不要な場合は同じ呼び出し形式で利用でき、出力がより高速です
  </Card>
</CardGroup>


## OpenAPI

````yaml api-reference/gpt-image-2-vip-edit-openapi-en.yaml POST /v1/images/edits
openapi: 3.1.0
info:
  title: gpt-image-2-vip Image Editing API
  description: >
    GPT image generation reverse-engineered model `gpt-image-2-vip` (Adobe line,
    Firefly) — image editing endpoint.


    - Supports single-image editing and multi-image fusion (repeat the `image`
    field for multiple uploads; order is preserved)

    - Request format is `multipart/form-data`

    - Reference upload order in prompts as "image1/image2/image3"

    - Supports 30 explicit sizes (10 ratios × 1K / 2K / 4K, flat $0.03/image
    across all tiers)

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
  /v1/images/edits:
    post:
      tags:
        - Image Editing
      summary: 'Image editing: edit or fuse reference images with locked output size'
      description: >
        Edit or fuse reference images with `gpt-image-2-vip` and lock the output
        dimension via `size`.


        - Provide at least one reference image via the `image` field

        - For multiple reference images, **repeat the same `image` field** —
        e.g., `-F image=@a.png -F image=@b.png` (upload order maps to "image1 /
        image2 / ..." in the prompt)

        - Recommended ≤ 10MB per image, formats png/jpg/webp

        - Strongly recommend passing `size` (one of the 30 sizes); `quality` is
        optional (see the field description); do not pass `n`

        - For pure text-to-image, use the [Text-to-Image
        endpoint](/en/api-capabilities/gpt-image-2-vip/text-to-image)
      operationId: editGptImage2VipImage
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/EditImageRequest'
            encoding:
              image:
                contentType: image/png, image/jpeg, image/webp
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
    EditImageRequest:
      type: object
      required:
        - model
        - prompt
        - image
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
          description: >-
            Edit/fusion instruction. For multi-image flows, reference upload
            order as image1/image2/image3
          example: >-
            Place the person from image1 into the scene of image2, in the style
            of image3
        image:
          type: array
          description: >-
            Reference images. **For a single image, send the field once; for
            multiple images, repeat the same `image` field** (e.g., `-F
            image=@a.png -F image=@b.png`) — upload order maps to image1 /
            image2 / ... in the prompt. Recommended ≤ 10MB each, formats png /
            jpg / webp.
          items:
            type: string
            format: binary
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
            Output size. **For editing, prefer `auto` (or omit the field)** —
            the model preserves the aspect ratio of **whichever reference image
            the prompt names as the target of the edit** (not necessarily the
            first one in multi-image scenarios). For example, with the prompt
            "modify image2, change image2's outfit to match image1", the output
            ratio matches image2. If the prompt doesn't disambiguate, the model
            decides on its own. To force a different dimension, pick one of the
            30 supported sizes; format: `WIDTHxHEIGHT` with lowercase ASCII `x`,
            e.g., `2048x1360`, `3840x2160`. Flat $0.03/image across all tiers.
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
          example: 2048x1360
    ImageResponse:
      type: object
      description: >
        Image editing response. **Returns base64 by default**
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