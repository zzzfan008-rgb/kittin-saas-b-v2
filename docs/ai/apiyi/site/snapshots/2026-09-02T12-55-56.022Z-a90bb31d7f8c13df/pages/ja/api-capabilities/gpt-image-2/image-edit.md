> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 画像編集 API リファレンス

> gpt-image-2 画像編集 API リファレンスとライブテスト — 参照画像を最大16枚アップロード + 単一画像編集、複数画像の融合、またはマスク補完のための指示

<Info>
  右側のインタラクティブな Playground は、ローカル画像の直接アップロードをサポートしています。**Authorization** に APIキーを入力し（形式: `Bearer sk-xxx`）、image / mask ファイルを選択して、`prompt` と `model` を入力し、送信してください。
</Info>

<Tip>
  **用途**: このページは「1枚以上の参照画像に基づく edit / fuse / inpaint 用」です。リクエスト形式は `multipart/form-data` です。純粋な text-to-image の場合は、[Text-to-Image エンドポイント](/ja/api-capabilities/gpt-image-2/text-to-image) を使用してください。
</Tip>

<Warning>
  **🖥️ Browser Playground の制限（重要）**

  このエンドポイントは、レスポンスで **raw base64 文字列**（通常は数MB）を返します。ブラウザのレンダリング制限により、右側の Playground ではレスポンス到着後に `请求时发生错误: unable to complete request` と表示されることがありますが、**リクエスト自体は成功しています**。ブラウザがそのように長い base64 文字列を描画できないだけです。

  **推奨ワークフロー**（初心者向け）:

  * **下の Python / Node.js / cURL サンプルをコピーして、ローカルで実行してください**。コードはレスポンスを自動的に `base64.b64decode`s し、**画像をファイルに書き込みます**。
  * ブラウザ内の Playground を使う必要がある場合は、**小さな参照画像（\< 50KB）を使用し**、`size` を最小のティア（例: `1024x1024`）に設定し、`quality` を `low` に設定してください。
</Warning>

<Warning>
  **⚠️ 主な違い（gpt-image-1.5 から移行する場合）**

  * **`input_fidelity` を渡さないでください** — `gpt-image-2` は高忠実度を強制するため、渡すと 400 が返ります
  * **Edit リクエストは入力 token がかなり多くなります** — 参照画像は Vision の課金で多くの token に変換されるため、余裕を持って見積もってください
  * **マルチ画像融合: 最大 16** — `image[]` フィールドを繰り返してください。16 を超えるとエラーになります
</Warning>

<Warning>
  **📎 マルチ画像融合では順序が重要です**

  `image[]` フィールドでは複数の参照画像を受け付けます。**アップロード順が prompt 内の「image 1 / image 2 / image 3」参照に対応します**。明示的に参照してください:

  > image 1 の被写体を image 2 のシーンに配置し、image 3 の色調スタイルを使用する

  1ファイルあたりの上限: **各 50MB 未満**（multipart ファイルアップロード）、形式: `png` / `jpg` / `webp`；実際にはアップロード前に **1.5MB 以内** に圧縮してください（下の「アップロードサイズ制限」を参照）。
</Warning>

## コード例

### Python (OpenAI SDK · 単一画像編集)

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.edit(
    model="gpt-image-2",
    image=open("photo.png", "rb"),
    prompt="Replace the background with a seaside sunset, preserve subject details",
    size="1536x1024",
    quality="high"
)

# b64_json is raw base64 (no prefix) — decode manually
with open("edited.png", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### Python (OpenAI SDK · 複数画像融合)

```python theme={null}
resp = client.images.edit(
    model="gpt-image-2",
    image=[
        open("person.png", "rb"),
        open("scene.png", "rb"),
        open("style.png", "rb"),
    ],
    prompt="Place subject from image 1 into scene from image 2, using color style from image 3, keep lighting consistent",
    size="1536x1024",
    quality="high"
)

with open("fused.png", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### cURL (複数画像融合)

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2" \
  -F "prompt=Place subject from image 1 into scene from image 2, using color style from image 3" \
  -F "size=1536x1024" \
  -F "quality=high" \
  -F "image[]=@person.png" \
  -F "image[]=@scene.png" \
  -F "image[]=@style.png"
```

### cURL (マスクのインペインティング)

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2" \
  -F "prompt=Replace the sky with pink sunset clouds" \
  -F "size=1024x1024" \
  -F "quality=high" \
  -F "image[]=@photo.png" \
  -F "mask=@mask.png" \
  | jq -r '.data[0].b64_json' | base64 -d > photo_edited.png
```

### Node.js (ネイティブ fetch + FormData · 複数画像融合)

```javascript theme={null}
import fs from 'node:fs';

const form = new FormData();
form.append('model', 'gpt-image-2');
form.append('prompt', 'Place subject from image 1 into scene from image 2');
form.append('size', '1536x1024');
form.append('quality', 'high');
form.append('image[]', new Blob([fs.readFileSync('./person.png')]), 'person.png');
form.append('image[]', new Blob([fs.readFileSync('./scene.png')]), 'scene.png');

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});

const { data } = await resp.json();
fs.writeFileSync('fused.png', Buffer.from(data[0].b64_json, 'base64'));
```

## パラメーターリファレンス

| 項目                   | 型    | 必須  | デフォルト  | 説明                                                                                                                                                                                                             |
| -------------------- | ---- | --- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`              | text | はい  | —      | 固定: `gpt-image-2`                                                                                                                                                                                              |
| `prompt`             | text | はい  | —      | 編集 / 融合指示                                                                                                                                                                                                      |
| `image[]`            | file | はい  | —      | 参照画像、複数指定可 (**最大 16**)                                                                                                                                                                                         |
| `mask`               | file | いいえ | —      | マスク画像（最初の画像にのみ適用、アルファチャンネル必須）                                                                                                                                                                                  |
| `size`               | text | いいえ | `auto` | 出力サイズ、text-to-image と同じ                                                                                                                                                                                        |
| `quality`            | text | いいえ | `auto` | `low` / `medium` / `high` / `auto`                                                                                                                                                                             |
| `output_format`      | text | いいえ | `png`  | `png` / `jpeg` / `webp`                                                                                                                                                                                        |
| `output_compression` | text | いいえ | —      | 0–100、`jpeg` / `webp` のみ                                                                                                                                                                                       |
| `background`         | text | いいえ | `auto` | `transparent` / `opaque` / `auto`。`transparent` の場合、`output_format` は `png` または `webp` でなければなりません。編集エンドポイントでの透明化は、**再描画**であり、正確な切り抜きではないことに注意してください — [透過背景 FAQ](/ja/faq/image-transparent-background) をご覧ください |

<Warning>
  **`standard` / `hd` の旧 DALL·E 値を `quality` に渡さないでください。** 受け付けられるのは、4つの公式な列挙値 `low` / `medium` / `high` / `auto` だけです。旧値はバックエンドチャネル間で挙動が一貫せず、すぐに 400（`invalid_value`）で失敗する場合もあれば、黙って無視されてリクエストが `auto` で実行される場合もあります（コストが予測不能）。必ず4つの公式値のいずれかを明示的に指定してください。
</Warning>

## アップロードサイズの制限

| 項目                         | 制限                | 備考                                                                                                                                                      |
| -------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 参照画像数                      | 最大 **16** 枚       | `image[]` フィールドを繰り返してください                                                                                                                               |
| 画像ごと（multipart ファイルアップロード） | 各 **50MB 未満**     | 形式: `png` / `jpg` / `webp`                                                                                                                              |
| 画像ごと（base64 data URL）      | フィールド長 約**20MiB** | これは URL/base64 の **文字列フィールド** の長さ制限（schema `maxLength: 20971520`）であり、50MB の multipart 上限とは **別** です。base64 によりサイズは約 1/3 増えるため、元画像は **15MB 以内** に収めてください |
| マスクファイル                    | **4MB 未満の PNG**   | 元画像と同じ寸法で、アルファチャンネルが必要です                                                                                                                                |

<Warning>
  **合計リクエストサイズを上限いっぱいまで使わないでください**: 画像ごとの上限は 50MB、最大 16 枚までですが、上限に近い画像を複数送ると 1 回のリクエスト本文が非常に大きくなり、ゲートウェイ / CDN / タイムアウトの失敗が起きやすくなります。実運用では、**各画像を 1.5MB 以内に圧縮する**（JPEG 品質 80-90）と、成功率と生成速度の両方が目に見えて改善し、出力品質は入力ファイルサイズに依存しません。
</Warning>

## 参照画像の形式要件と前処理

`/v1/images/edits` は **png / jpg / webp** の標準形式のみを受け付けます。次の 400 が返ってきた場合:

```json theme={null}
{
  "error": {
    "message": "Invalid image file or mode for image 1, please check your image file. ...",
    "type": "shell_api_error",
    "code": "invalid_image_file"
  }
}
```

参照画像はおそらく **標準的な JPEG/PNG ではありません**。最もよくある落とし穴は、スマホのカメラで生成される **MPO 形式**（Multi-Picture Object、マルチフレーム JPEG コンテナ）です。`.jpg` Huawei Mateシリーズの端末からそのまま出力されたファイルには HDR のゲインマップ用サブフレームが埋め込まれており、実際には MPO です。これらのファイルは同じ `FFD8` ヘッダーで始まります。**拡張子と `file` コマンドのどちらも JPEG と表示される**ため、見た目では判別できません。フレームを認識できるパース（例: Pillow）だけが見分けられます。エラーにある「image 1」は N 番目の参照画像（1 始まり）を指すので、インデックスを使って問題のファイルを特定してください。

<Info>
  **2026 年 7 月に検証済み**: MPO ファイルは 5/5 のアップロードで 400 になりました。同じ画像を標準の JPEG/PNG に再エンコードすると、元の 3072×4096 のフル解像度のまま成功しました。問題は形式であり、寸法やファイルサイズではありません。このエラーは入力検証段階で素早く（約 4 秒）返され、**課金されません**。
</Info>

**検出と修正**: `Image.open(f).format` が `"MPO"` を返す場合、ファイルの変換が必要です。アップロードパイプラインに 1 回の再エンコード手順を入れておけば、HEIC や他のスマホ形式にも対応できます:

```python theme={null}
from PIL import Image
import io

def normalize_image(path: str) -> bytes:
    """Convert phone photos (MPO/HDR multi-frame etc.) to standard JPEG that passes edits validation"""
    im = Image.open(path)
    im.load()                      # for MPO, keeps only the first (full-size) frame
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGB")
    out = io.BytesIO()
    im.save(out, format="JPEG", quality=92)   # or format="PNG"
    return out.getvalue()
```

<Tip>
  製品がユーザー撮影の写真（室内レンダリング、商品写真など）を受け付ける場合は、画像を 1 枚ずつデバッグするのではなく、**サーバー側で一律に**再エンコードしてください。スマホの HDR 写真は今後も出てきます。入力処理のヒントは [Image API の基本とベストプラクティス](/ja/api-capabilities/image-api-best-practices) をご覧ください。
</Tip>

## マスク インペインティング要件

* **元画像と同じサイズ**、**PNG形式**、**4MB未満**
* **アルファチャンネル必須**: 透明（alpha=0）= インペイント対象領域、不透明 = 保持
* マスクは**最初**の画像にのみ適用されます
* マスクは「ソフトガイド」です — モデルはマスクされた領域の周囲を拡張または縮小する場合があります

<Tip>
  **マルチターンの反復**: 前回の出力を次の呼び出しの`image[]`としてフィードバックし、新しい指示で段階的に調整します。各ラウンドは個別に token 課金されます — 累積コストに注意してください。
</Tip>

## Response Format

```json theme={null}
{
    "created": 1776832476,
    "data": [
        {
            "b64_json": "iVBORw0KGgoAAAANSUhEUgAA..."
        }
    ],
    "usage": {
        "input_tokens": 848,
        "input_tokens_details": {
            "image_tokens": 832,
            "text_tokens": 16
        },
        "output_tokens": 196,
        "output_tokens_details": {
            "image_tokens": 196,
            "text_tokens": 0
        },
        "total_tokens": 1044
    }
}
```

<Warning>
  `b64_json` is **raw base64**, **without** the `data:image/...;base64,` prefix — different from `gpt-image-2-all`. Decode it client-side to write a file, or prepend the prefix for browser rendering.
</Warning>

<Info>
  Edit requests' `input_tokens` are typically **significantly higher** than text-to-image at the same size, because reference images are billed per Vision pricing rules — the exact amount is available directly in `usage.input_tokens_details.image_tokens`, tracked separately from the text portion (`text_tokens`). Multi-image fusion increases `image_tokens` **strictly linearly** per additional reference image (verified July 2026: 4 × 1024² images = 4 × 1024 tokens) — see [How Multiple Input Images Affect the Price](/ja/api-capabilities/gpt-image-2/overview#how-multiple-input-images-affect-the-price-verified-july-2026) for the measurement table. See [How to check the real token count for each call](/ja/api-capabilities/gpt-image-2/overview#how-to-check-the-real-token-count-for-each-call) on the overview page for the full field reference.
</Info>


## OpenAPI

````yaml api-reference/gpt-image-2-edit-openapi-en.yaml POST /v1/images/edits
openapi: 3.1.0
info:
  title: gpt-image-2 Image Edit API
  description: >
    OpenAI's flagship image generation model `gpt-image-2` — image edit
    endpoint.


    - Supports single-image edit, multi-image fusion (up to 16 reference
    images), mask inpainting

    - Request format: `multipart/form-data`

    - In prompt, use "image 1 / image 2 / image 3" to reference `image` upload
    order

    - **Reference images auto-enable high-fidelity** — **do not** pass
    `input_fidelity` (will error)

    - Edit requests have noticeably higher input tokens than text-to-image at
    the same size


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
  /v1/images/edits:
    post:
      tags:
        - Image Edit
      summary: 'Image Edit: edit or fuse reference images by instruction'
      description: >
        Use `gpt-image-2` to edit, fuse, or inpaint images by text instruction.


        - At least one `image` required (max 16)

        - multipart file upload: each image under 50MB, formats: png/jpg/webp
        (base64 data URL is bound by a ~20MiB field-length limit — keep
        originals ≤ 15MB)

        - `mask` field (optional) must match the original image's size, be PNG
        and under 4MB, and have an alpha channel (transparent = inpaint area)

        - mask only applies to the first image

        - Do not pass `input_fidelity` (forced high-fidelity, will error if
        passed)
      operationId: editGptImage2Image
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/EditImageRequest'
            encoding:
              image:
                contentType: image/png, image/jpeg, image/webp
              mask:
                contentType: image/png
      responses:
        '200':
          description: Image generated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: >-
            Invalid parameters (input_fidelity / background:transparent / size
            constraint violation, etc.)
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
    EditImageRequest:
      type: object
      required:
        - model
        - prompt
        - image
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
            Edit/fusion instruction. For multi-image, use 'image 1 / image 2 /
            image 3' to reference upload order
          example: >-
            Place subject from image 1 into scene from image 2, using color
            style from image 3
        image:
          type: array
          description: >-
            Reference images. **For a single image, send the field once; for
            multiple images, repeat the same `image` field** (e.g., `-F
            image=@a.png -F image=@b.png`, **max 16**) — upload order maps to
            image 1 / image 2 / ... in the prompt. multipart file upload: each
            under 50MB, formats: png/jpg/webp; compress to within 1.5MB in
            practice
          items:
            type: string
            format: binary
        mask:
          type: string
          format: binary
          description: >
            Mask image (optional, only applies to first image). Requirements:

            - Same size as original

            - PNG format, under 4MB

            - Must have alpha channel (alpha=0 = inpaint area, opaque =
            preserve)
        size:
          type: string
          description: >-
            Output size (same as text-to-image). Preset or constraint-satisfying
            custom size
          example: 1536x1024
          default: auto
        quality:
          type: string
          description: Quality tier
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
        background:
          type: string
          description: 'Background mode. auto or opaque. **Not supported**: transparent'
          enum:
            - auto
            - opaque
          default: auto
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
          example: 1776832476
        data:
          type: array
          description: Generation results (this model returns 1 image per call)
          items:
            type: object
            properties:
              b64_json:
                type: string
                description: '**Raw base64 string** (no data:image/...;base64, prefix)'
                example: iVBORw0KGgoAAAANSUhEUgAA...
        usage:
          type: object
          description: Token usage for this call
          properties:
            input_tokens:
              type: integer
              example: 1280
            output_tokens:
              type: integer
              example: 6240
            total_tokens:
              type: integer
              example: 7520
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key obtained from APIYI Console

````