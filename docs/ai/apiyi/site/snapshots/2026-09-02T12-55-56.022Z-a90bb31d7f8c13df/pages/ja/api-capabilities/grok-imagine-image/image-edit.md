> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 画像編集 API リファレンス

> Grok Imagine 2 の画像編集 API リファレンスとライブテスト — 編集または融合のために参照画像を1〜4枚アップロードし、指示を指定します。multipart/form-data が必要です

<Info>
  右側のインタラクティブな Playground ではローカルファイルのアップロードができます。**Authorization** に API キーを入力し（形式: `Bearer sk-xxx`）、`image` ファイルを選択して、`prompt` と `model` を入力し、送信してください。
</Info>

<Warning>
  **🔴 このエンドポイントでは `multipart/form-data` ファイルのアップロードが必要です**

  `/v1/images/edits` に JSON を送信すると **常に 400 が返ります**:

  ```text theme={null}
  request Content-Type isn't multipart/form-data
  ```

  **特に xAI や上流ベンダーのドキュメントから統合する場合は重要です**: そのドキュメントでは、公開画像 URL（`{"image": {"type": "image_url", "url": "..."}}`）を含む JSON 本文が説明されていますが、その形式は APIYI ゲートウェイ経由では **動作しません**。代わりにこのページに従ってください。

  逆に、ファイルアップロードなら **画像ホスティングは不要** です — ローカルファイルをそのまま送るだけなので、公開 URL を準備するより簡単です。

  ファイル項目名は **`image`** または **`image[]`** である必要があります。`images` / `image_file` は **415** を返します。`prompt` は必須で、省略すると 400 が返ります。
</Warning>

<Tip>
  **このページの使いどころ**: 参照画像を 1 枚編集する場合、または複数枚を融合する場合です。prompt のみの生成には、[Text-to-Image エンドポイント](/ja/api-capabilities/grok-imagine-image/text-to-image) を使用してください。
</Tip>

<Warning>
  **⚠️ 出力サイズは最初の参照画像に従い、変更できません**

  `resolution` と `aspect_ratio` はここでエラーなく受け付けられますが、**効果はありません** — 編集後の出力は常に **最初の参照画像のサイズ** に一致します（1280x720 を入力すると 1280x720 が出力され、1024x1024 を入力すると 1024x1024 が出力されます）。

  融合にも同じことが当てはまります。4 枚の参照画像の順序を逆にすると、出力は 1280x720 から 1024x1024 に変わり、**新しい先頭画像に従いました**。

  出力サイズを変更するには、**アップロード前に最初の参照画像をトリミングまたはリサイズしてください**。
</Warning>

<Info>
  **融合の順序は重要です**: `image[]` は参照画像を **1-4** 枚受け付けます（測定上の上限は 4 枚で、5 枚目は 400 を返します）。そして **アップロード順が、prompt 内の「image 1 / image 2 / image 3」を指します**。たとえば、「image 1 の被写体を image 2 のシーンに入れ、image 2 のアートスタイルを保つ」と明示してください。

  2 / 3 / 4 枚の参照画像で測定すると、**画像を 1 枚追加するごとに、それに対応する被写体が出力に加わり**、それぞれの固有の特徴が保持されます — 融合は本当に機能します。
</Info>

## コード例

### Python (OpenAI SDK、単一画像)

```python theme={null}
from openai import OpenAI
import urllib.request

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    timeout=360.0
)

# The SDK's images.edit already performs a multipart upload — pass the file object directly
resp = client.images.edit(
    model="grok-imagine-image",
    image=open("fox.jpg", "rb"),
    prompt="Change the scarf color to bright RED. Keep everything else exactly the same.",
    n=1
)

urllib.request.urlretrieve(resp.data[0].url, "edited.jpg")
```

### Python (生のリクエスト、単一画像)

```python theme={null}
import requests
import urllib.request

API_KEY = "sk-your-api-key"

# Key point: use files= so requests sets multipart/form-data and the boundary for you.
# Never use json= — that sends application/json and the gateway rejects it with 400.
with open("fox.jpg", "rb") as fp:
    response = requests.post(
        "https://api.apiyi.com/v1/images/edits",
        headers={"Authorization": f"Bearer {API_KEY}"},  # do NOT set Content-Type manually
        data={
            "model": "grok-imagine-image",
            "prompt": "Change the scarf to red, keep everything else exactly the same",
            "n": 1,
            "response_format": "url"
        },
        files={"image": ("fox.jpg", fp, "image/jpeg")},
        timeout=360
    ).json()

urllib.request.urlretrieve(response["data"][0]["url"], "edited.jpg")
```

### Python (マルチ画像融合、1-4ファイル)

```python theme={null}
import requests

API_KEY = "sk-your-api-key"

# Repeat the image[] field for multiple references — order is "image 1 / image 2"
files = [
    ("image[]", ("character.jpg", open("character.jpg", "rb"), "image/jpeg")),
    ("image[]", ("scene.jpg", open("scene.jpg", "rb"), "image/jpeg")),
]

response = requests.post(
    "https://api.apiyi.com/v1/images/edits",
    headers={"Authorization": f"Bearer {API_KEY}"},
    data={
        "model": "grok-imagine-image",
        "prompt": "Put the character from image 1 into the scene from image 2, "
                  "keeping image 2's art style and palette",
        "response_format": "url"
    },
    files=files,
    timeout=360
).json()

print(response["data"][0]["url"])
```

### cURL

```bash theme={null}
# Single-image edit: -F means multipart/form-data, @ uploads a local file
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=grok-imagine-image" \
  -F "prompt=Change the scarf to red, keep everything else exactly the same" \
  -F "n=1" \
  -F "response_format=url" \
  -F "image=@fox.jpg"
```

```bash theme={null}
# Multi-image fusion: repeat image[], order is "image 1 / image 2"
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=grok-imagine-image-quality" \
  -F "prompt=Put the character from image 1 into the scene from image 2, keep image 2's style" \
  -F "image[]=@character.jpg" \
  -F "image[]=@scene.jpg"
```

### Node.js (ネイティブ fetch + FormData)

```javascript theme={null}
import fs from 'node:fs';

const form = new FormData();
form.append('model', 'grok-imagine-image');
form.append('prompt', 'Change the scarf to red, keep everything else exactly the same');
form.append('n', '1');
form.append('response_format', 'url');
// Single image uses `image`; for fusion append `image[]` repeatedly (max 3)
form.append('image', new Blob([fs.readFileSync('./fox.jpg')]), 'fox.jpg');

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    // Do not set Content-Type manually — let FormData supply the boundary
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form,
    signal: AbortSignal.timeout(360000)
});

const data = await resp.json();
const img = await fetch(data.data[0].url);
fs.writeFileSync('edited.jpg', Buffer.from(await img.arrayBuffer()));
```

### ブラウザ JavaScript

```javascript theme={null}
// ⚠️ Demo only: a front-end key is exposed — use a backend proxy in production
const fileInput = document.querySelector('#file');   // an <input type="file"> element

const form = new FormData();
form.append('model', 'grok-imagine-image');
form.append('prompt', 'Replace the background with a snowy pine forest at night, keep the subject');
form.append('response_format', 'url');
form.append('image', fileInput.files[0]);

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});

const data = await resp.json();
document.querySelector('#preview').src = data.data[0].url;
```

## パラメータリファレンス

| パラメータ              | 型       | 必須 | デフォルト | 説明                                                                                   |
| ------------------ | ------- | -- | ----- | ------------------------------------------------------------------------------------ |
| `model`            | string  | ✅  | —     | `grok-imagine-image` (\$0.02/image) または `grok-imagine-image-quality` (\$0.045/image) |
| `prompt`           | string  | ✅  | —     | 編集指示。何を変更するかと、それ以外はすべてそのままにすることを記してください                                              |
| `image`            | file    | ✅  | —     | 参照画像ファイル。融合の場合は `image[]` を繰り返し、**1-4 files**（5つ目は400を返します）。**最初の1つが出力寸法を設定します**     |
| `n`                | integer | ❌  | `1`   | 出力画像数、**1-10**、参照数に関係なく画像ごとに課金されます                                                   |
| `response_format`  | string  | ❌  | `url` | `url` は直接リンクを返します。`b64_json` は生のbase64を返します（`data:` プレフィックスは**ありません**）               |
| ~~`resolution`~~   | string  | ❌  | —     | **ここでは効果はありません** — 出力は入力画像に従います                                                      |
| ~~`aspect_ratio`~~ | string  | ❌  | —     | **ここでは効果はありません** — 出力は入力画像に従います                                                      |

<Info>
  このファミリーは**マスクインペインティングをサポートしていません**。変更の範囲を限定したい場合は、prompt でそれを正確に記述してください。たとえば「スカーフだけを赤に変更し、それ以外はすべてまったく同じに保つ」といった具合です。モデルはそのような制約に厳密に従います。
</Info>

## 編集動作とプロンプトスタイル

編集エンドポイントは、入力画像のアートスタイル、構図、パレット、被写体のアイデンティティを保持し、prompt が指定した内容だけを変更します。安定した結果を得るには:

| プロンプトスタイル                                                                            | 結果                               |
| ------------------------------------------------------------------------------------ | -------------------------------- |
| ✅ `Change the scarf to red, keep everything else exactly the same`                   | スカーフだけが変更され、スタイル、構図、背景は保持されます    |
| ✅ `Add round black sunglasses to the cat, keep everything else unchanged`            | サングラスが追加されるだけで、輪郭スタイルと背景色はそのままです |
| ✅ `Put the character from image 1 into the scene from image 2, keep image 2's style` | 両方の入力の特徴を保持する融合です                |
| ⚠️ `Make it look better`                                                             | 曖昧すぎます — 変更範囲が予測不能になります          |

<Tip>
  **「他のすべては変更しないでください」と明示すること** は、このモデルで最も効果的な手法です。融合の場合は、`image[]` のアップロード順に合わせて、必ず「image 1 / image 2」を参照してください。

  また、**最も重要な被写体を最初に置いてください**: 最初の画像は出力サイズを決めるだけでなく、テストでは順序を逆にすると副次的な被写体のアイデンティティが別の被写体に混ざってしまいました。
</Tip>

## レスポンス形式

```json theme={null}
{
  "created": 0,
  "data": [
    {
      "url": "https://apac.ossforai.com/2026/08/12/09b026d5-3492-4678-907c-e25972e6c914.jpg"
    }
  ],
  "usage": {
    "prompt_tokens": 1000,
    "total_tokens": 1000
  }
}
```

<Warning>
  **レスポンスフィールドの落とし穴**

  * 各 `data[]` エントリには、`response_format` に応じて **`url`** または **`b64_json`** のどちらか一方のみが含まれます — 両方は含まれません。
  * **`revised_prompt`は返されません** — 存在すると仮定しないでください。
  * `b64_json` は **`data:image/...;base64,` 接頭辞のない生の base64** です — そのままデコードしてください。
  * `created` は常に `0` であり、タイムスタンプとして使用できません。
  * 出力サイズは **入力画像** によって決定されるため、リクエストパラメータから幅/高さを予測しないでください。
</Warning>

<Info>
  **`usage`は照合に使用できません**: `prompt_tokens` は常に `1000 x n` であり、プレースホルダーです。編集料金は text-to-image と同じで、画像ごとの定額料金です。実際の請求額は APIYI コンソールの課金記録を参照してください。
</Info>


## OpenAPI

````yaml api-reference/grok-imagine-image-edit-openapi-en.yaml POST /v1/images/edits
openapi: 3.1.0
info:
  title: Grok Imagine 2 Image Editing API
  description: >
    xAI Grok Imagine 2 image generation models — image editing endpoint.


    - **Requests must be `multipart/form-data` (file upload)** — sending JSON
    returns 400

    - Supports single-image editing and multi-image fusion (1-4 reference images
    via repeated `image[]`)

    - Reference fidelity is high: art style, composition, palette and subject
    identity are preserved;
      only what the prompt asks for changes
    - **Output dimensions follow the FIRST reference image**: `resolution` /
    `aspect_ratio` have no effect here

    - Flat per-request pricing, same as text-to-image


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
  /v1/images/edits:
    post:
      tags:
        - Image Editing
      summary: 'Image editing: edit a reference image or fuse several'
      description: >
        Edit uploaded reference images with a text instruction using Grok
        Imagine 2 models.


        - **Must use `multipart/form-data`.** Sending `application/json`
        (including the
          `{"image": {"type": "image_url", "url": "..."}}` form shown in upstream vendor docs)
          always returns 400 `invalid_image_request`:
          `request Content-Type isn't multipart/form-data`
        - The file field must be named `image` or `image[]`; `images` /
        `image_file` return 415

        - `prompt` is required; omitting it returns 400

        - 1-4 reference images (measured ceiling is 4; a fifth returns 400);
        with multiple images refer to them as "image 1 / image 2" in the prompt
      operationId: editGrokImagineImage
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/GrokImagineEditRequest'
            encoding:
              image:
                contentType: image/png, image/jpeg, image/webp
      responses:
        '200':
          description: Image generated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: >-
            Request was not multipart/form-data, prompt missing, or content
            blocked by moderation
        '401':
          description: Unauthorized - invalid API Key
        '415':
          description: Unsupported file field name (only `image` / `image[]` are accepted)
        '429':
          description: Rate limit exceeded or insufficient balance
      security:
        - bearerAuth: []
components:
  schemas:
    GrokImagineEditRequest:
      type: object
      required:
        - model
        - prompt
        - image
      properties:
        model:
          type: string
          description: Model ID
          enum:
            - grok-imagine-image
            - grok-imagine-image-quality
          default: grok-imagine-image
        prompt:
          type: string
          description: >
            Editing instruction. State what to change and explicitly ask for
            everything else to stay put,

            e.g. `Change the scarf color to bright RED. Keep everything else
            exactly the same.`
          example: >-
            Change the scarf color to bright RED. Keep everything else exactly
            the same.
        image:
          type: string
          format: binary
          description: >
            Reference image file. For multi-image fusion repeat the `image[]`
            field (1-4 files);

            upload order is what "image 1 / image 2 / image 3" refers to in the
            prompt, and

            **the first file also determines output dimensions**. Each added
            image contributes

            a subject in testing. Accepted formats: png / jpg / webp.
        'n':
          type: integer
          description: >-
            Number of output images, 1-10. Independent of the number of
            reference images
          minimum: 1
          maximum: 10
          default: 1
          example: 1
        response_format:
          type: string
          description: >-
            Response format. `url` returns a direct link; `b64_json` returns raw
            base64 (no data: prefix)
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
                description: Direct image link, returned when `response_format=url`
                example: >-
                  https://apac.ossforai.com/2026/08/12/09b026d5-3492-4678-907c-e25972e6c914.jpg
              b64_json:
                type: string
                description: >-
                  Raw base64 image data, returned when
                  `response_format=b64_json` (no data: prefix)
        usage:
          type: object
          description: >-
            **Placeholder values — do not use for billing reconciliation.**
            `prompt_tokens` is always `1000 x n`
          properties:
            prompt_tokens:
              type: integer
              example: 1000
            total_tokens:
              type: integer
              example: 1000
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key created in the APIYI Console

````