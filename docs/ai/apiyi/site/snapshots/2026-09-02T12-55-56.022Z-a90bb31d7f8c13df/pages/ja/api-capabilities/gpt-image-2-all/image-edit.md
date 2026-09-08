> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 画像編集 API リファレンス

> gpt-image-2-all の画像編集 API リファレンスとインタラクティブなプレイグラウンド — 参照画像をアップロードし、単一画像編集または複数画像の融合のための指示を指定できます

<Info>
  右側の対話型プレイグラウンドでは、ローカルファイルを直接アップロードできます。**Authorization** フィールドに API Key を入力し（形式: `Bearer sk-xxx`）、画像を選択して、`prompt` と `model` を入力し、送信をクリックしてください。
</Info>

<Tip>
  **適用範囲**: このページは、**1枚以上の参照画像を編集または融合する**ためのものです。リクエストは `multipart/form-data` を使用します。純粋なテキストから画像生成を行う場合は、[テキストから画像生成エンドポイント](/ja/api-capabilities/gpt-image-2-all/text-to-image) を使用してください。
</Tip>

<Warning>
  **🖥️ ブラウザー プレイグラウンドの制限（既定の b64\_json モード）**

  このエンドポイントは**既定で `response_format: "b64_json"`** になるため、応答には数 MB の base64 文字列が含まれ、ブラウザーのプレイグラウンドでは `请求时发生错误: unable to complete request` と表示される場合があります — **リクエスト自体は実際には成功しています**。ブラウザーがそのように長い base64 文字列を描画できないだけです。

  **推奨ワークフロー**:

  * プレイグラウンドで画像を見られれば十分ですか？ **`"response_format": "url"` を明示的に指定してください** — 応答は単一の R2 リンクになり、問題なく表示されます。
  * base64 が必要、または大きな参照画像をアップロードしたいですか？ **下のコードサンプルをコピーしてローカルで実行してください** — コードがアップロードとデコードを自動で処理します。
</Warning>

<Warning>
  **📎 複数画像では順序が重要です**

  `image` フィールドは繰り返し指定でき、複数の参照画像をアップロードできます。**順序によって、prompt 内の「image1/image2/image3」がどの画像として解釈されるかが決まります。** そのため、次のように明示的に参照することを推奨します。

  > image1 の人物を image2 のシーンに配置し、image3 の画風を適用する

  推奨は画像 1 枚あたり **≤ 10MB**、形式は `png` / `jpg` / `webp` です。画像が大きすぎるとゲートウェイの制限に達する場合があります。
</Warning>

<Tip>
  **🎯 形状を維持する編集**: このエンドポイントの出力アスペクト比は、prompt で編集対象として指定された参照画像に従います。**複数画像のシナリオでも、必ずしも1枚目とは限りません。**

  たとえば、prompt が "**image2 を修正**、image2 の服装と帽子を image1 に合わせて変更する" で、image2 が 1:1 の場合、出力も 1:1 になります（image1 が横長の 16:9 でも同様です）。

  服装の差し替え、アクセサリーの追加、レタッチ、その他の形状を維持する編集に便利です。**`size` フィールドはこのモデルでは効果がありません**（どの値を送っても黙って無視されます。サイズを厳密に固定したい場合は、[`gpt-image-2-vip`](/ja/api-capabilities/gpt-image-2-vip/image-edit) を使用してください）。prompt が対象を指定しない場合は、モデルが自動で判断します。
</Tip>

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
            "model": "gpt-image-2-all",
            "prompt": "Change the background to a seaside sunset",
            "response_format": "url"
        },
        files=[
            ("image", ("photo.png", f, "image/png"))
        ],
        timeout=300  # conservative — absorbs tail latency + image upload/download time
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
            "model": "gpt-image-2-all",
            "prompt": "Put the person from image1 into the scene of image2, using the art style of image3",
            "response_format": "b64_json"
        },
        files=[
            ("image", ("ref1.png", f1, "image/png")),
            ("image", ("ref2.png", f2, "image/png")),
            ("image", ("ref3.png", f3, "image/png"))
        ],
        timeout=300  # conservative — absorbs tail latency + image upload/download time
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
  -F "model=gpt-image-2-all" \
  -F "prompt=Change the background to a seaside sunset" \
  -F "response_format=url" \
  -F "image=@./photo.png"
```

**複数画像の融合**:

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2-all" \
  -F "prompt=Put the person from image1 into the scene of image2, using the art style of image3" \
  -F "response_format=b64_json" \
  -F "image=@./ref1.png" \
  -F "image=@./ref2.png" \
  -F "image=@./ref3.png"
```

### Node.js (ネイティブ fetch + FormData)

```javascript theme={null}
import fs from 'node:fs';
import { Agent, setGlobalDispatcher } from 'undici';

// Editing uploads a reference image and waits on an MB-scale body, while undici's
// default connect timeout is only 10s and is NOT governed by AbortSignal.timeout
// below (different layers) — widen all three explicitly
setGlobalDispatcher(new Agent({
  connect: { timeout: 30_000 },
  headersTimeout: 300_000,
  bodyTimeout: 300_000,
}));

const form = new FormData();
form.append('model', 'gpt-image-2-all');
form.append('prompt', 'Change the background to outer space');
form.append('response_format', 'url');
form.append(
  'image',
  new Blob([fs.readFileSync('./photo.png')]),
  'photo.png'
);

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    signal: AbortSignal.timeout(300_000),   // total timeout — a different layer
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});
const data = await resp.json();
console.log(data.data[0].url);
```

<Tip>
  上の `undici` の import は別途インストールが必要です（`npm i undici`）—これは組み込みの `fetch` を支えていますが、そのモジュール名では公開されておらず、インストールしたコピーも `setGlobalDispatcher` を通じて組み込みの `fetch` に到達します。

  `maxRetries`、`connectTimeout`、および合計の request timeout はそれぞれ別の層にあり、誤ったものを設定するのが Node 側でもっともよくある落とし穴です。connection resets、`UND_ERR_CONNECT_TIMEOUT`、または proxy 配下で大きなレスポンスが途中で切れる場合は、[Image API 接続切断のトラブルシューティング](/ja/api-capabilities/image-connection-drops) を参照してください。
</Tip>

### ブラウザ JavaScript (File オブジェクト)

```javascript theme={null}
// <input type="file" id="fileInput" multiple>
const files = document.getElementById('fileInput').files;
const form = new FormData();
form.append('model', 'gpt-image-2-all');
form.append('prompt', 'Fuse these images into one poster');
form.append('response_format', 'url');
for (const f of files) form.append('image', f);

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});
const { data } = await resp.json();
document.getElementById('result').src = data[0].url;
```

## パラメータ早見表

| フィールド             | 型    | 必須  | 説明                                                                                                                                                                                                   |
| ----------------- | ---- | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`           | テキスト | はい  | 固定: `gpt-image-2-all`                                                                                                                                                                                |
| `prompt`          | テキスト | はい  | 自然言語による編集/融合指示                                                                                                                                                                                       |
| `image`           | ファイル | はい  | 参照画像; 複数回指定可                                                                                                                                                                                         |
| `size`            | テキスト | いいえ | **このフィールドは効果がなく、任意の値を送信しても静かに無視されます。** 出力アスペクト比は、プロンプトが編集対象として指定した参照画像に従います（マルチ画像のシナリオでは、必ずしも最初の1枚とは限りません）。厳密なサイズ固定には、[`gpt-image-2-vip`](/ja/api-capabilities/gpt-image-2-vip/image-edit) を使用してください |
| `response_format` | テキスト | いいえ | `b64_json`（デフォルト）または`url`                                                                                                                                                                            |

<Tip>
  **マルチターン反復**: 前回の出力画像を `image` 入力として新しい指示とともに再投入し、結果を反復的に洗練します。
</Tip>

## レスポンス形式

text-to-image エンドポイントと同様に、**`data[0]` は `url` または `b64_json` のどちらかを返し、両方は返しません**（`response_format` に依存します）。このエンドポイントは **既定で `b64_json`** です。

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

**`url` モード**（明示的な `"response_format": "url"` が必要です）:

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
  2026年7月時点で確認済み: `b64_json` フィールドは **`data:` プレフィックスのない raw base64** です。レンダリング前にデコードするか、自分でプレフィックスを付けてください。**以前のバージョンではプレフィックスが含まれていました** ので、両方の形に対応するには最初に `startsWith('data:')` を必ず確認してください。
</Warning>


## OpenAPI

````yaml api-reference/gpt-image-2-all-edit-openapi-en.yaml POST /v1/images/edits
openapi: 3.1.0
info:
  title: gpt-image-2-all Image Editing API
  description: >
    GPT image generation reverse-engineered model `gpt-image-2-all` — image
    editing endpoint.


    - Supports single-image editing and multi-image fusion (repeat the `image`
    field for multiple uploads; order is preserved)

    - Request format is `multipart/form-data`

    - Reference upload order in prompts as "image1/image2/image3"

    - **The `size` field has no effect** (sending any value is silently ignored,
    no error). The output aspect ratio **follows whichever reference image the
    prompt names as the edit target** — not necessarily the first one in
    multi-image scenarios. For example, with the prompt "modify image2", the
    output ratio matches image2; if the prompt doesn't disambiguate, the model
    decides on its own. For strict size locking, use `gpt-image-2-vip`.

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
      summary: 'Image editing: edit or fuse reference images with instructions'
      description: >
        Use `gpt-image-2-all` to edit or fuse input images based on a text
        instruction.


        - Provide at least one reference image via the `image` field

        - For multiple reference images, **repeat the same `image` field** —
        e.g., `-F image=@a.png -F image=@b.png` (upload order maps to "image1 /
        image2 / ..." in the prompt)

        - Recommended ≤ 10MB per image, formats png/jpg/webp

        - For pure text-to-image generation, use the [Text-to-Image
        endpoint](/en/api-capabilities/gpt-image-2-all/text-to-image)
      operationId: editGptImage2AllImage
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
          description: Model name, fixed to gpt-image-2-all
          enum:
            - gpt-image-2-all
          default: gpt-image-2-all
        prompt:
          type: string
          description: >-
            Edit/fusion instruction. For multi-image fusion, reference upload
            order as image1/image2/image3
          example: >-
            Put the person from image1 into the scene of image2, using the art
            style of image3
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
        response_format:
          type: string
          description: >-
            Response format. b64_json returns a base64 string already prefixed
            with a data URL header (default); url returns an R2 CDN link
          enum:
            - b64_json
            - url
          default: b64_json
    ImageResponse:
      type: object
      description: >
        Image editing response. `data[0]` returns **either `url` or `b64_json`,
        never both** (depends on `response_format`; this endpoint defaults to
        `b64_json`).
      properties:
        data:
          type: array
          description: Result array (this model returns 1 image per call)
          items:
            type: object
            properties:
              url:
                type: string
                description: R2 CDN accelerated link (returned when response_format=url)
              b64_json:
                type: string
                description: >-
                  Base64-encoded data URL (returned when
                  response_format=b64_json; already includes the
                  data:image/png;base64, prefix)
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