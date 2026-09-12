> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 画像編集 API リファレンス

> gpt-image-2-vip の画像編集 API リファレンスとインタラクティブなプレイグラウンド — 参照画像と指示をアップロードして、単一画像の編集または複数画像の融合を行えます。`size` を使って出力寸法を固定します。

<Info>
  右側のインタラクティブなプレイグラウンドでは、ローカル画像を直接アップロードできます。API Key を **Authorization** フィールドに入力し（形式: `Bearer sk-xxx`）、画像を選択して、`prompt` / `model` / `size` を設定し、送信をクリックします。
</Info>

<Tip>
  **範囲**: このページは、**1枚以上の参照画像を編集または融合するため**のものです。リクエストでは `multipart/form-data` を使用します。純粋なテキストから画像生成の場合は、[Text-to-Image エンドポイント](/ja/api-capabilities/gpt-image-2-vip/text-to-image) を参照してください。

  **`gpt-image-2-all`との違い**: 呼び出し構造は同じで、`size` フィールドが 1 つ追加されるだけです。サイズを固定する必要がなく、最速の出力を求めるなら、[`gpt-image-2-all`](/ja/api-capabilities/gpt-image-2-all/image-edit) を使用してください。
</Tip>

<Warning>
  **🖥️ ブラウザのプレイグラウンドの制限**

  このエンドポイントは、**デフォルトで base64 文字列（`b64_json`）を返します**。これは数MBになることがあるため、ブラウザのプレイグラウンドでは `请求时发生错误: unable to complete request` と表示される場合があります — **実際にはリクエストは成功しています**。ブラウザがそのように長い base64 文字列をレンダリングできないだけです。

  **推奨ワークフロー**: base64 が必要な場合や、非常に大きな参照画像をアップロードする必要がある場合は、**下のコードサンプルをコピーしてローカルで実行してください**。
</Warning>

<Warning>
  **📎 複数画像の融合では順序が重要です**

  `image` フィールドは複数の参照画像を受け付けます。**順序が、プロンプト内での「image1 / image2 / image3」参照の基準になります。** プロンプトでは明示的に参照してください。例:

  > image1 の人物を image2 のシーンに配置し、image3 の画風で

  推奨は**1画像あたり 10MB 以下**で、形式は `png` / `jpg` / `webp` です。大きすぎる画像はゲートウェイの制限に引っかかる場合があります。
</Warning>

<Tip>
  **🎯 形状を維持する編集**: `size=auto` を指定した場合（または `size` を省略した場合）、出力は**プロンプトが編集対象として指定した参照画像のアスペクト比を引き継ぎます** — 複数画像のシナリオでは**必ずしも1枚目ではありません**。

  たとえば、プロンプトが「image2 を修正し、image2 の服と帽子を image1 に合わせる」で、image2 が 1:1 の場合、出力も 1:1 になります（image1 が横長の 16:9 でも同様です）。

  服の差し替え、アクセサリーの追加、レタッチ、その他の形状を維持する編集に便利です。プロンプトが対象を指定しない場合はモデルが自動で決めます。アスペクト比を変更する必要がある場合にのみ、明示的な 30バケットの `size` を指定してください。
</Tip>

<Warning>
  **⚠️ 主要パラメータの注意点**

  * **`size`**: **編集時は `auto` を優先してください（またはフィールドを省略してください）** — モデルは**プロンプトが編集対象として指定した参照画像**のアスペクト比を維持します。複数画像のシナリオでは、必ずしも1枚目ではありません。たとえば、プロンプトが「image2 を修正し、image2 の服を image1 に合わせる」であれば、出力の比率は image2 と一致します。プロンプトで対象が明確でない場合は、モデルが自動で決めます。別のサイズを強制するには、対応する 30 個のサイズのいずれかを選び、小文字の ASCII `x` を使用してください。例: `2048x1360`、`3840x2160`。一覧表は [概要ページ](/ja/api-capabilities/gpt-image-2-vip/overview#supported-sizes-full-30-size-table) を参照してください。
  * **`quality`**: ❌ 拒否されます — **指定しないでください**。
  * **`n`**: ❌ 拒否されます — 1回の呼び出しにつき画像 1 枚です。
  * **`response_format`**: 省略すると base64 が返ります（raw、プレフィックスなし、2026年7月確認済み）。画像 URL が必要なら `"url"` を指定してください。**URL 出力に依存する**事業者は、base64 へのフォールバックなしで決定的に URL を出力するために、token を `image2_OSS` グループに切り替えるべきです。
</Warning>

## コード例

### Python

**単一画像の編集**:

```python theme={null}
import requests

API_KEY = "sk-your-api-key"

with open("photo.png", "rb") as f:
    response = requests.post(
        "https://api.apiyi.com/v1/images/edits",
        headers={"Authorization": f"Bearer {API_KEY}"},
        data={
            "model": "gpt-image-2-vip",
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
            "model": "gpt-image-2-vip",
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

**単一画像の編集**:

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2-vip" \
  -F "prompt=Replace the background with a sunset beach" \
  -F "size=2048x1360" \
  -F "image=@./photo.png"
```

**複数画像の融合**:

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2-vip" \
  -F "prompt=Place the person from image1 into the scene of image2, in the style of image3" \
  -F "size=2048x2048" \
  -F "image=@./ref1.png" \
  -F "image=@./ref2.png" \
  -F "image=@./ref3.png"
```

### Node.js (ネイティブ fetch + FormData)

```javascript theme={null}
import fs from 'node:fs';

const form = new FormData();
form.append('model', 'gpt-image-2-vip');
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

### ブラウザー JavaScript (File オブジェクト)

```javascript theme={null}
// <input type="file" id="fileInput" multiple>
const files = document.getElementById('fileInput').files;
const form = new FormData();
form.append('model', 'gpt-image-2-vip');
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

## パラメータ

| 項目       | 型    | 必須  | 説明                                                                                                                |
| -------- | ---- | --- | ----------------------------------------------------------------------------------------------------------------- |
| `model`  | text | はい  | `gpt-image-2-vip`                                                                                                 |
| `prompt` | text | はい  | 自然言語による編集／融合の説明                                                                                                   |
| `image`  | file | はい  | 参照画像。繰り返し指定可（配列フィールド）                                                                                             |
| `size`   | text | いいえ | 出力サイズ: `auto`（デフォルト — **プロンプトが編集対象として指定する参照画像に従います**。必ずしも最初の画像とは限りません）または30種類のサイズのいずれか。形式 `WIDTHxHEIGHT`（小文字 `x`） |

<Tip>
  **マルチターン反復**: 前回の出力を次の呼び出しの `image` として新しい編集指示とともに渡し、段階的に洗練していきます。各ラウンドではそれぞれ独自の `size` を指定できます。
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
    GPT image generation reverse-engineered model `gpt-image-2-vip` (Codex line)
    — image editing endpoint.


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
  - url: https://vip.apiyi.com
    description: Backup endpoint
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

        - Strongly recommend passing `size` (one of the 30 sizes); do not pass
        `quality` / `n`

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
          description: Model name, fixed to gpt-image-2-vip
          enum:
            - gpt-image-2-vip
          default: gpt-image-2-vip
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