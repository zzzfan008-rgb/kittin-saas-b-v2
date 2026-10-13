> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 画像編集 API リファレンス

> 実行可能な Playground を備えた MAI-Image 2.6 画像編集 API リファレンス — 1〜5 枚の参照画像と編集または融合するための指示をアップロード、multipart/form-data ファイルアップロード専用。参照画像の枚数によって価格は変わりません

<Info>
  右側のインタラクティブなPlaygroundでは、ローカル画像のアップロードに対応しています。**Authorization** の下にAPIキー（形式: `Bearer sk-xxx`）を入力し、1つ以上の `image` ファイルを選択して、`prompt` と `model` を入力した上で送信してください。
</Info>

<Warning>
  **🔴 このエンドポイントは `multipart/form-data` ファイルアップロードのみを受け付けます**

  `/v1/images/edits` にJSONを送信した場合（`image` をURL、データURI、または生のbase64として指定）、400が返されます：

  ```text theme={null}
  request Content-Type isn't multipart/form-data
  ```

  **画像のURLは入力としてサポートされていません。** URLのみをお持ちの場合は、まずサーバー側でダウンロードしてからファイルをアップロードしてください。ファイルアップロードなら画像ホスティングは不要で、ローカルファイルを送信するだけです。
</Warning>

<Tip>
  **ユースケース**: このページは参照画像を使用した編集向けであり、単一画像の編集や1〜5枚の画像の合成に対応しています。テキストのみから生成する場合は、[テキストから画像生成 API](/ja/api-capabilities/mai-image/text-to-image) を使用してください。
</Tip>

<Info>
  **🖼️ 1〜5枚の参照画像をサポート（2026-10-07以降）**

  * **指定方法**: `image[]` フィールドを繰り返し、1フィールドにつき1枚の画像を指定します。OpenAI SDKを使用する場合は、リストを渡します: `client.images.edit(image=[f1, f2, ...])`。`image` を繰り返すことでも動作します
  * **順序**: 画像はアップロード順に番号付けされます（image 1、image 2、…）。そのため、prompt で「image 2のキツネをimage 1に配置する」のように指定できます
  * **料金**: リクエストごとに課金されます。**画像1枚でも5枚でも料金は同じです**
  * **対応フォーマット**: JPEG、PNG、WebP。GIFなどのその他のフォーマットは400を返します
  * **5枚を超える画像**: 400 `at most 5 reference images are accepted for <model>` が返されます
</Info>

<Warning>
  **`image` + `image2` のような連番のフィールド名は使用しないでください**: リクエストは200を返しますが、**最初の画像のみが使用され**、2枚目は破棄されます。`image1` + `image2` は500 `image is required` を返します。複数の画像を指定する場合は、常に `image[]` を繰り返してください。
</Warning>

<Info>
  **テキストから画像生成と同じ禁止パラメータ**: `response_format`、`seed`、または `negative_prompt` は送信しないでください（400）。レスポンスは常に `data[0].b64_json`（PNG）です。
</Info>

## コード例

### Python (OpenAI SDK · 単一画像)

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    timeout=180.0
)

# images.edit uses a multipart file upload under the hood; do not pass response_format
resp = client.images.edit(
    model="MAI-Image-2.6-Flash",
    image=open("teaset.jpg", "rb"),
    prompt="Change the teapot to a deep cobalt blue glaze, keep everything else identical"
)

with open("edited.png", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### Python (OpenAI SDK · 複数画像の合成)

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    timeout=180.0
)

# Pass a list of 1-5 files; the SDK uploads each one as an image[] field
# Images are numbered in upload order (image 1, image 2, ...); same price as a single image
resp = client.images.edit(
    model="MAI-Image-2.6-Flash",
    image=[open("teaset.jpg", "rb"), open("fox.jpg", "rb")],
    prompt="Put the fox from image 2 (keeping every detail of its look) into the scene of image 1, sitting next to the tea set; keep everything else in image 1 unchanged"
)

with open("fused.png", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### Python (requests · 単一画像)

```python theme={null}
import base64
import os
import requests

# Pass the file via files=; requests sets multipart/form-data and the boundary for you
# Do not use json=, and do not set Content-Type by hand
with open("teaset.jpg", "rb") as fp:
    response = requests.post(
        "https://api.apiyi.com/v1/images/edits",
        headers={"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"},
        data={
            "model": "MAI-Image-2.6",
            "prompt": "Change the teapot to a deep cobalt blue glaze, keep everything else exactly the same"
        },
        files={"image": ("teaset.jpg", fp, "image/jpeg")},
        timeout=180
    )
response.raise_for_status()

with open("edited.png", "wb") as f:
    f.write(base64.b64decode(response.json()["data"][0]["b64_json"]))
```

複数の画像を使用する場合は、画像ごとに1つの `image[]` を持つタプルのリストとして `files` を渡します（辞書型では重複するキーを保持できません）:

```python theme={null}
files = [
    ("image[]", ("teaset.jpg", open("teaset.jpg", "rb"), "image/jpeg")),
    ("image[]", ("fox.jpg", open("fox.jpg", "rb"), "image/jpeg")),
]
```

### cURL

```bash theme={null}
# Single-image edit: -F means multipart/form-data, @ uploads a local file
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=MAI-Image-2.6-Flash" \
  -F "prompt=Change the teapot to a deep cobalt blue glaze, keep everything else identical" \
  -F "image=@teaset.jpg" \
  | python3 -c "import sys,json,base64; open('edited.png','wb').write(base64.b64decode(json.load(sys.stdin)['data'][0]['b64_json']))"
```

```bash theme={null}
# Edit and change the canvas to 1536×1024 (a different aspect ratio recomposes the image)
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=MAI-Image-2.6" \
  -F "prompt=Turn this tea set into a lifestyle scene on a wooden table, natural light, photorealistic" \
  -F "width=1536" \
  -F "height=1024" \
  -F "image=@teaset.jpg"
```

```bash theme={null}
# Multi-image fusion: repeat the image[] field, 1-5 images, numbered in upload order
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=MAI-Image-2.6-Flash" \
  -F "prompt=Put the fox from image 2 (keeping every detail of its look) into the scene of image 1, sitting next to the tea set; keep everything else in image 1 unchanged" \
  -F "image[]=@teaset.jpg" \
  -F "image[]=@fox.jpg" \
  | python3 -c "import sys,json,base64; open('fused.png','wb').write(base64.b64decode(json.load(sys.stdin)['data'][0]['b64_json']))"
```

### Node.js (fetch + FormData)

```javascript theme={null}
import fs from 'node:fs';

const form = new FormData();
form.append('model', 'MAI-Image-2.6-Flash');
form.append('prompt', 'Replace the background with a snowy pine forest at night, keep the person unchanged');
form.append('image', new Blob([fs.readFileSync('./photo.jpg')]), 'photo.jpg');
// Multi-image fusion: call form.append('image[]', ...) once per image instead, up to 5

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    // Do not set Content-Type by hand; FormData adds the boundary
    headers: { 'Authorization': `Bearer ${process.env.APIYI_API_KEY}` },
    body: form,
    signal: AbortSignal.timeout(120000)
});

const data = await resp.json();
fs.writeFileSync('edited.png', Buffer.from(data.data[0].b64_json, 'base64'));
```

## パラメーターリファレンス

| パラメーター | 型 | 必須 | デフォルト値 | 説明 |
| - | - | - | - | - |
| `model` | string | ✅ | — | `MAI-Image-2.6` (\$0.12/画像) または `MAI-Image-2.6-Flash` (\$0.06/画像)、**大文字と小文字を区別** |
| `prompt` | string | ✅ | — | 編集の指示。何を変更し、それ以外のすべてをそのまま維持するかを指定します |
| `image` / `image[]` | file | ✅ | — | 参照画像ファイル、**1〜5枚**。画像が1枚の場合は `image` を使用し、複数の場合はアップロード順に画像1…Nとしてナンバリングしながら `image[]` フィールドを繰り返します。JPEG / PNG / WebP対応。枚数によって価格は変わりません |
| `width` / `height` | integer | ❌ | 元の比率に準拠 | 出力サイズ。テキストからの画像生成と同じルールが適用されます。異なるアスペクト比を指定すると、画像が**再構成**されます |
| `n` | integer | ❌ | `1` | 画像数。**このエンドポイントで機能し**、画像ごとに課金されます |
| ~~`mask`~~ | — | — | — | **サポートされていません**。400 `<model> does not support mask edits` を返します |
| ~~`response_format`~~ / ~~`seed`~~ / ~~`negative_prompt`~~ | — | — | — | **400を返します** |

<Info>
  **省略時の出力サイズ**: 出力は16の倍数にスナップされた元の画像のアスペクト比に従います（例: 1344×756 の入力に対しては 1360×768 が出力されます）。複数画像の場合、**画像1**によってアスペクト比が決まります。構図を維持すべき部分的な編集を行う場合は、`width` / `height` を送信しないでください。
</Info>

## 編集結果とpromptの指定

編集エンドポイントは、**元の構図、色、ディテールを維持し**、promptで指定された内容のみを変更します。

<Frame>
  <img src="https://mintcdn.com/apiyillc/_zXMTnA1u6gpoDyM/images/mai-image-edit-teaset.jpg?fit=max&auto=format&n=_zXMTnA1u6gpoDyM&q=85&s=c86dc86c5aadf0173e19102433c01f49" alt="MAI-Image-2.6-Flashの編集例：ティーポットの色がクリーム色からコバルトブルーに変更され、その他は変更なし" width="1048" height="532" data-path="images/mai-image-edit-teaset.jpg" />
</Frame>

| Prompt | 結果 |
| - | - |
| ✅ `Change the teapot to a deep cobalt blue glaze, keep everything else exactly the same` | ティーポットの色のみが変更され、ラベルやその他のオブジェクトはピクセル単位で完全に同一のまま維持されます |
| ✅ `Turn this photo into a watercolor painting, keep the composition` | スタイルが再描画され、構図は維持されます |
| ⚠️ `Make it look better` | 曖昧すぎるため、変更の範囲が予測できません |

<Tip>
  **「keep everything else the same」と明示的に指定すること**は、このモデルにおいて最も効果的な手法であり、元の状態を可能な限り維持します。
</Tip>

### 複数画像の融合

画像1がベースとなり、promptの指示に従って他の参照画像のオブジェクトが配置されます。以下の例では、1回のリクエストで5枚の画像（ティーセット + キツネ + ラバーダック + 目覚まし時計 + サボテン）を送信し、画像2のキツネ、画像3の黄色いラバーダック、画像4の赤いビンテージ目覚まし時計、画像5の鉢植えサボテンを、画像1のティーテーブルの上に配置し、各オブジェクトの外観を維持したまま画像1のその他の部分を変更しないよう指示するpromptを使用しています。

<Frame>
  <img src="https://mintcdn.com/apiyillc/M34PNfQX341lt5W7/images/mai-image-multi-ref-5.jpg?fit=max&auto=format&n=M34PNfQX341lt5W7&q=85&s=0c18a285c65fa48646505b109e3600c7" alt="MAI-Image-2.6-Flashの複数画像融合の例：5枚の参照画像を入力し、4つのオブジェクトすべてをティーセットの画像に配置し、その他は変更なし" width="1200" height="1229" data-path="images/mai-image-multi-ref-5.jpg" />
</Frame>

| Prompt | 結果 |
| - | - |
| ✅ `Put the fox from image 2 into the scene of image 1, keep everything else in image 1 unchanged` | アップロード順に画像を「image N」として参照します。最も信頼性の高い表現です |
| ✅ 各画像のオブジェクト名を指定：`the yellow rubber duck from image 3, the red alarm clock from image 4` | 画像数が多い場合、各オブジェクトに名前を付けることで抜け漏れを防ぎます |
| ⚠️ `Combine these images into one` | ベース画像や被写体が指定されていないため、構図が予測できません |

## レスポンス形式

```json theme={null}
{
  "created": 1791000788,
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

  * `b64_json` は **`data:` プレフィックスのないプレーンな base64** であり、PNG にデコードされます。
  * `n > 1` の場合、`data` 配列には複数のアイテムが含まれます。`data[0]` だけを読み取らないようにしてください。
  * `url` および `revised_prompt` は返されません。
</Warning>

<Info>
  **`usage` で課金を照合しないでください**：プレースホルダーが含まれています（`prompt_tokens` は常に画像数 × 1000 です）。編集の**コストはテキストから画像への生成と同じ**で、画像ごとに課金され、**参照画像の数によって価格が変わることはありません**。APIYI コンソールの請求内容が正式なものとなります。
</Info>


## OpenAPI

````yaml api-reference/mai-image-edit-openapi-en.yaml POST /v1/images/edits
openapi: 3.1.0
info:
  title: MAI-Image 2.6 Image Editing API
  description: >
    Microsoft MAI-Image 2.6 image generation — image editing endpoint.


    - **The request must be `multipart/form-data` (file upload)**; JSON or image
    URLs return 400

    - **1–5 reference images**: use `image` for one; for several, repeat the
    `image[]` field (pass a list with the OpenAI SDK), numbered image 1…N in
    upload order. **Do not use numbered field names such as `image2`** (the
    second image is dropped)

    - No mask support; do not send `response_format` / `seed` /
    `negative_prompt`

    - Flat per-image pricing, same as text-to-image, regardless of the number of
    reference images; `n` works on this endpoint and is billed per image


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
  /v1/images/edits:
    post:
      tags:
        - Image Editing
      summary: 'Image editing: edit reference images (1–5)'
      description: >
        Edit or fuse 1–5 uploaded reference images from a text instruction with
        MAI-Image 2.6.


        - **Must use `multipart/form-data`**. Sending `application/json` returns
          400: `request Content-Type isn't multipart/form-data`
        - **Multi-image fusion**: repeat the `image[]` field, up to 5 images
        (more returns 400); `image` + `image2` uses only the first image; a
        `mask` field returns 400

        - Reference images must be JPEG / PNG / WebP

        - Without `width` / `height` the output follows the original's ratio; a
        different aspect ratio recomposes the image
      operationId: editMaiImage
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/MaiImageEditRequest'
            encoding:
              image:
                contentType: image/png, image/jpeg, image/webp
      responses:
        '200':
          description: Image generated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: >-
            Not multipart/form-data, more than 5 or unsupported-format reference
            images, a mask field, invalid parameters, or blocked by moderation
        '401':
          description: Unauthorized - invalid API key
        '429':
          description: Rate limit exceeded or insufficient balance
        '500':
          description: >-
            No image file field in the request, or numbered field names such as
            `image1` + `image2` (`image is required`)
      security:
        - bearerAuth: []
components:
  schemas:
    MaiImageEditRequest:
      type: object
      required:
        - model
        - prompt
        - image
      properties:
        model:
          type: string
          description: Model ID (case-sensitive)
          enum:
            - MAI-Image-2.6-Flash
            - MAI-Image-2.6
          default: MAI-Image-2.6-Flash
        prompt:
          type: string
          description: >-
            Edit instruction. State what to change and that everything else
            stays the same
          example: >-
            Change the teapot to a deep cobalt blue glaze, keep everything else
            identical
        image:
          type: array
          items:
            type: string
            format: binary
          minItems: 1
          maxItems: 5
          description: >-
            Reference image files, 1–5, numbered image 1…N in upload order. png
            / jpg / webp. In code, repeat the `image[]` field for several images
        width:
          type: integer
          description: >-
            Optional output width. Same rules as text-to-image: each side ≥ 768,
            width × height ≤ 2,359,296, sent together with `height`
          minimum: 768
        height:
          type: integer
          description: Optional output height, same rules as `width`
          minimum: 768
        'n':
          type: integer
          description: Number of images. Works on this endpoint, billed per image
          minimum: 1
          default: 1
          example: 1
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
          description: Creation timestamp
          example: 1791000788
        data:
          type: array
          description: Image results; length equals `n`
          items:
            type: object
            properties:
              b64_json:
                type: string
                description: 'Plain base64 image data (PNG, no data: prefix)'
        usage:
          type: object
          description: >-
            **Placeholder values, not for billing reconciliation.**
            `prompt_tokens` is always `1000 × images`
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
      description: API key from the APIYI console

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.