> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 画像編集 API リファレンス

> FLUX 画像編集 API リファレンスとライブデバッガー — 参照画像を最大 8 枚アップロードし、単一画像の編集や複数参照の融合のための指示を入力できます。FLUX.2 と FLUX.1 Kontext に対応します。

<Info>
  Playground の使い方: **Authorization** に API Key を入力します（形式 `Bearer sk-xxx`）。参照画像1の **公開URL** を `input_image` に貼り付けます。複数参照の場合は、追加画像の URL を `input_image_2` … `input_image_8` に入力します。次に `prompt` / `model` を入力して送信してください。Playground は URL のみ受け付けます。base64 の data URL 入力の場合は、下のコードサンプルをコピーしてローカルで実行してください。
</Info>

<Tip>
  **このページの用途**: 「1枚以上の参照画像を編集または融合する」ことです。FLUX の画像編集は 2 つのオプションをサポートしています。

  * **オプション A（このページの Playground、推奨）**: JSON + `input_image` から `/v1/images/generations` へ（テキストから画像生成と共通で、`input_image` を送信すると編集モードになります）。すべての FLUX モデル（Kontext を含み、検証済み）で動作し、複数参照の融合（`input_image_2` \~ `input_image_8`）をサポートします。
  * **オプション B**: OpenAI 互換の multipart エンドポイント `/v1/images/edits`（下の「オプション B」セクションを参照）— 単一画像の編集に対応し、OpenAI SDK の `client.images.edit()` と直接互換です。

  純粋なテキストから画像生成については、[Text-to-Image endpoint](/ja/api-capabilities/flux/text-to-image) を参照してください。
</Tip>

<Warning>
  **⚠️ 主な違い / 注意点（オプション A）**

  * **エンドポイントパス**: `/v1/images/generations`（テキストから画像生成と共通です。OpenAI 互換の単一画像用 `/v1/images/edits` エンドポイントもあります — オプション B を参照してください）
  * **Content-Type**: `application/json`（オプション B の `/edits` エンドポイントでは代わりに `multipart/form-data` を使用します）
  * **各参照画像フィールドは文字列です**: `input_image` / `input_image_2` … `input_image_8` は公開URL（推奨）または `data:image/...;base64,xxx` data URL を受け付けます
  * **参照画像の上限はモデルごとに異なります**: FLUX.2 \[pro/max/flex] は最大 **8**、FLUX.2 \[klein] は最大 **4**、FLUX.1 Kontext はネイティブで **1** をサポートします
  * **各画像は 20MB または 20MP 以下**、形式は `png` / `jpg` / `webp` です
  * **入力解像度**: 最小 64×64、最大 4MP。寸法は 16 の倍数である必要があります
  * **結果URLの有効期限は 10 分のみです** — `data[0].url` はすぐにダウンロードする必要があります
  * **`aspect_ratio` が省略された場合、出力寸法は最初の入力画像と一致します**
</Warning>

<Warning>
  **📎 複数参照では順序が重要です**

  `input_image` / `input_image_2` / `input_image_3` … の番号付けは、プロンプト内の **「image 1 / image 2 / image 3」** で使われるインデックスと**まったく同じ**です。

  > image 1 の人物を image 2 のシーンに配置し、image 3 のカラーパレットを適用します。

  各値は、公開アクセス可能な URL（20MB 以下を推奨）または `data:image/png;base64,xxx` data URL である必要があります。
</Warning>

## コード例

### cURL (2画像フュージョン · URL)

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "flux-2-pro",
    "prompt": "Naturally blend these two images",
    "input_image": "https://static.apiyi.com/apiyi-logo.png",
    "input_image_2": "https://images.unsplash.com/photo-1762138012600-2ab523f8b35a",
    "seed": 42,
    "output_format": "jpeg"
  }'
```

### cURL (3画像フュージョン · URL)

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "flux-2-pro",
    "prompt": "The person from image 1 is petting the cat from image 2, the bird from image 3 is next to them",
    "input_image": "https://example.com/person.jpg",
    "input_image_2": "https://example.com/cat.jpg",
    "input_image_3": "https://example.com/bird.jpg",
    "seed": 42,
    "output_format": "jpeg"
  }'
```

### cURL (単一画像編集 · コンテキスト)

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "flux-kontext-pro",
    "prompt": "Convert this architectural photo into a pencil sketch style, preserve all structural details",
    "input_image": "https://your-oss.example.com/architecture.jpg"
  }'
```

### cURL (ローカルファイル · base64 データ URL)

```bash theme={null}
# Encode local image as base64 data URL (macOS / Linux)
B64=$(base64 -w0 < person.png 2>/dev/null || base64 < person.png | tr -d '\n')

curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d "$(jq -nc --arg img "data:image/png;base64,$B64" '{
    model: "flux-2-pro",
    prompt: "Stylize image 1 as an oil painting",
    input_image: $img
  }')"
```

### Python (requests · 2画像フュージョン)

```python theme={null}
import requests

resp = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={
        "Authorization": "Bearer sk-your-api-key",
        "Content-Type": "application/json",
    },
    json={
        "model": "flux-2-pro",
        "prompt": "Naturally blend these two images",
        "input_image": "https://static.apiyi.com/apiyi-logo.png",
        "input_image_2": "https://images.unsplash.com/photo-1762138012600-2ab523f8b35a",
        "seed": 42,
        "output_format": "jpeg",
    },
    timeout=120,
)
image_url = resp.json()["data"][0]["url"]

# data[0].url is valid for only 10 minutes — download immediately
with open("fused.jpg", "wb") as f:
    f.write(requests.get(image_url, timeout=30).content)
```

### Python (requests · ローカルファイルを base64 として)

```python theme={null}
import base64, requests, mimetypes

def to_data_url(path: str) -> str:
    mime = mimetypes.guess_type(path)[0] or "image/png"
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    return f"data:{mime};base64,{b64}"

resp = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={
        "Authorization": "Bearer sk-your-api-key",
        "Content-Type": "application/json",
    },
    json={
        "model": "flux-2-pro",
        "prompt": "Place the person from image 1 into the scene from image 2",
        "input_image": to_data_url("person.png"),
        "input_image_2": "https://your-oss.example.com/scene.jpg",
    },
    timeout=120,
)
print(resp.json()["data"][0]["url"])
```

### Python (OpenAI SDK · extra\_body 経由で input\_image を渡す)

```python theme={null}
from openai import OpenAI
import requests

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# OpenAI SDK images.generate() targets /v1/images/generations with JSON;
# BFL-native fields are added straight into the body via extra_body.
resp = client.images.generate(
    model="flux-2-pro",
    prompt="Naturally blend these two images",
    extra_body={
        "input_image": "https://static.apiyi.com/apiyi-logo.png",
        "input_image_2": "https://images.unsplash.com/photo-1762138012600-2ab523f8b35a",
        "seed": 42,
        "output_format": "jpeg",
    },
)
image_url = resp.data[0].url
with open("fused.jpg", "wb") as f:
    f.write(requests.get(image_url, timeout=30).content)
```

### Node.js (fetch · 複数参照フュージョン)

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer sk-your-api-key',
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        model: 'flux-2-pro',
        prompt: 'Naturally blend these two images',
        input_image: 'https://static.apiyi.com/apiyi-logo.png',
        input_image_2: 'https://images.unsplash.com/photo-1762138012600-2ab523f8b35a',
        seed: 42,
        output_format: 'jpeg',
    }),
});

const { data } = await resp.json();
const img = await fetch(data[0].url);
const fs = await import('node:fs');
fs.writeFileSync('fused.jpg', Buffer.from(await img.arrayBuffer()));
```

## オプション B: OpenAI互換の編集エンドポイント（multipart）

上の JSON オプションに加えて、FLUX の画像編集は標準の OpenAI Images API edit endpoint もサポートしており、`client.images.edit()` と直接互換性があります（`flux-kontext-max` で 2026-07-04 に検証済み、生成成功）:

* **エンドポイント**: `POST https://api.apiyi.com/v1/images/edits`
* **Content-Type**: `multipart/form-data`（SDK と curl `-F` によって自動設定されます — **手動で設定しないでください**。設定すると boundary が失われ、解析に失敗します）

<Note>
  FLUX.1 Kontext series は入力画像を1枚のみ受け付けます。複数参照の融合にはオプション A（`input_image` \~ `input_image_8`）を使用してください。オプション B は現在、Kontext series で検証されています。
</Note>

### リクエストパラメータ（フォームフィールド）

| フィールド              | 型    | 必須 | 説明                                                                                              |
| ------------------ | ---- | -- | ----------------------------------------------------------------------------------------------- |
| `model`            | 文字列  | ✓  | 例: `flux-kontext-max` / `flux-kontext-pro`                                                      |
| `prompt`           | 文字列  | ✓  | 編集指示                                                                                            |
| `image`            | ファイル | ✓  | 元画像のバイナリ（png/jpg/webp、≤ 20MB）。**フィールド名は `image` である必要があります** — 省略すると `image is required` が返されます |
| `aspect_ratio`     | 文字列  | ✗  | 例: `1:1` / `16:9`。トップレベルのフォームフィールドとして渡します。OpenAI SDK のユーザーは `extra_body` で渡します                  |
| `safety_tolerance` | 整数   | ✗  | 0（最も厳格）– 6（最も寛容）                                                                                |

### cURL の例

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=flux-kontext-max" \
  -F "prompt=Change the outfit to a fashion look" \
  -F "aspect_ratio=16:9" \
  -F "image=@input.jpg"
```

### Python（OpenAI SDK）の例

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
)

result = client.images.edit(
    model="flux-kontext-max",
    image=open("input.jpg", "rb"),
    prompt="Change the outfit to a fashion look",
    extra_body={"aspect_ratio": "16:9"},  # FLUX-specific params go through extra_body
)
print(result.data[0].url)
```

### Node.js（fetch + FormData）の例

```javascript theme={null}
const form = new FormData();
form.append('model', 'flux-kontext-max');
form.append('prompt', 'Change the outfit to a fashion look');
form.append('aspect_ratio', '16:9');
form.append('image', imageBlob, 'input.jpg'); // browser Blob or Node's fs.openAsBlob()

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    // Note: do NOT set Content-Type manually — let the runtime generate the multipart boundary
    body: form,
});
const data = await resp.json();
console.log(data.data[0].url);
```

応答形式はオプション A（`data[0].url`、10分間有効な BFL 署名付き URL — 本番環境ではサーバー側で自分のストレージにダウンロードしてください）と同じです。

### どのオプションを使うべきですか？

|       | オプション A（JSON `input_image`）    | オプション B（multipart `/edits`）                   |
| ----- | ------------------------------ | --------------------------------------------- |
| 最適な用途 | 直接 HTTP / フロントエンドアプリ / 複数参照の融合 | 既存の OpenAI SDK コード、`client.images.edit()` の移行 |
| 複数画像  | はい（flux-2 は最大 8 枚）             | 1枚のみ                                          |
| 画像入力  | 公開 URL または base64 data URL     | バイナリファイル                                      |

## パラメータリファレンス

| 項目                                | 型    | 必須  | デフォルト    | 説明                                                                                                                |
| --------------------------------- | ---- | --- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| `model`                           | 文字列  | はい  | —        | FLUX のモデル ID。複数参照の融合では `flux-2-pro` / `flux-2-max` を優先し、単一画像の編集では `flux-kontext-max` / `flux-kontext-pro` も使用します  |
| `prompt`                          | 文字列  | はい  | —        | 編集 / 融合の指示。最大 32K tokens まで。「image 1 / image 2 / image 3」を使って image / input\_image\_2 / input\_image\_3 の順序を参照します |
| `input_image`                     | 文字列  | はい  | —        | 参照画像 1。公開 URL（推奨）または `data:image/...;base64,xxx` data URL                                                         |
| `input_image_2` … `input_image_8` | 文字列  | いいえ | —        | 参照画像 2–8 — URL または data URL。FLUX.2 \[pro/max/flex] は最大 8 枚、\[klein] は 4 枚、Kontext は追加画像をサポートしません                  |
| `aspect_ratio`                    | 文字列  | いいえ | 最初の入力に一致 | 例: `1:1` / `16:9` / `9:16` / `4:3` / `3:2`                                                                        |
| `seed`                            | 整数   | いいえ | ランダム     | 再現性のために固定                                                                                                         |
| `safety_tolerance`                | 整数   | いいえ | `2`      | 0（最も厳格）– 6（最も寛容）                                                                                                  |
| `output_format`                   | 文字列  | いいえ | `jpeg`   | `jpeg` / `png`                                                                                                    |
| `prompt_upsampling`               | ブール値 | いいえ | `false`  | プロンプトを自動アップサンプルします                                                                                                |
| `steps`                           | 整数   | いいえ | `50`     | **`flux-2-flex` のみ**、最大 50                                                                                        |
| `guidance`                        | 数値   | いいえ | `4.5`    | **`flux-2-flex` のみ**、1.5–10                                                                                       |

## マルチリファレンス戦略

<AccordionGroup>
  <Accordion icon="user" title="キャラクターの一貫性（最大8枚）">
    同じキャラクターの複数のショットを参照としてアップロードすると、モデルがアイデンティティの特徴を自動で維持します。広告キャンペーン、コミックパネル、ファッションエディトリアルに最適です。

    ```
    Eight consistent characters from the reference images,
    in a fashion editorial set on a Tokyo rooftop at golden hour
    ```
  </Accordion>

  <Accordion icon="palette" title="スタイル変換">
    1枚のコンテンツ画像 + 1枚のスタイル画像を用意し、promptで参照を明示します:

    ```
    Using the style of image 2, render the subject from image 1
    ```
  </Accordion>

  <Accordion icon="layers" title="オブジェクト合成">
    複数の画像のオブジェクトを1つの新しいシーンに組み合わせます:

    ```
    The person from image 1 is petting the cat from image 2,
    the bird from image 3 is next to them
    ```
  </Accordion>

  <Accordion icon="shirt" title="服装 / 商品の差し替え">
    ある画像の服装を別の被写体に差し替えます:

    ```
    Replace the top of the person in image 1 with the one from image 2,
    keep the pose and background unchanged
    ```
  </Accordion>
</AccordionGroup>

<Tip>
  **反復編集**: `data[0].url`をダウンロードし、次の呼び出しで新しい指示とともに`input_image`として再投入し、段階的に洗練します。各ラウンドは画像1枚分として課金されます。
</Tip>

## レスポンス形式

```json theme={null}
{
    "created": 1776832476,
    "data": [
        {
            "url": "https://delivery-eu.bfl.ai/results/xxx/sample.jpeg?signature=..."
        }
    ]
}
```

<Warning>
  **⚠️ `data[0].url` は10分間のみ有効です**

  * `delivery-eu.bfl.ai` / `delivery-us.bfl.ai` にホストされた URL、署名は10分後に期限切れになります
  * **CORS は無効です** — ブラウザの `fetch` はブロックされます
  * 本番環境では、サーバーサイドで自前の OSS / CDN にダウンロードする必要があります
  * FLUX の編集エンドポイントは `b64_json` を**返しません** — URL のみです
</Warning>

<Info>
  Edit リクエストの料金は text-to-image と同じです（1 image あたりであり、token あたりではありません）。マルチリファレンスでは追加の画像に対する追加料金は発生しません（OpenAI gpt-image-2 の編集とは異なります）。
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="エラー image is required (shell_api_error) の原因は何ですか？">
    リクエストは `/v1/images/edits` エンドポイント（オプション B）に届きましたが、ゲートウェイはリクエスト本文内に画像を見つけられませんでした。よくある原因は次のとおりです:

    1. multipartフォームに `image` の file フィールドがない、またはフィールド名が間違っている場合です（例: `image[]`, `file`）
    2. `Content-Type: multipart/form-data` が boundary なしで手動設定されている（SDK / fetch / curl を使う場合は、このヘッダーを自分で設定しないでください）
    3. クライアント側の画像変換に失敗したにもかかわらず、そのままリクエストが送信された場合です（`image` フィールドに実際に 0 バイトより多く入っていることを確認してください）
    4. JSON で画像を送るつもりだったのに `/edits` に当たってしまった場合です — JSON + `input_image` は `/v1/images/generations`（オプション A）に送られます
  </Accordion>
</AccordionGroup>


## OpenAPI

````yaml api-reference/flux-edit-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: FLUX Image Editing API
  description: >
    Black Forest Labs FLUX model family — image editing endpoint (apiyi proxy:
    `/v1/images/generations` + JSON body).


    - **Endpoint path**: `POST /v1/images/generations` (FLUX shares this path
    between text-to-image and editing — passing `input_image` switches to edit
    mode)

    - **Content-Type**: `application/json` (this Playground uses the JSON
    option, recommended; an OpenAI-compatible multipart single-image
    `/v1/images/edits` endpoint also exists — see "Option B" on the docs page)

    - **Reference image fields**: `input_image` / `input_image_2` …
    `input_image_8`, **values are public URL strings** (also accepts
    `data:image/...;base64,xxx` data URLs, but the Playground encourages plain
    URLs and leaves base64 for local code testing)

    - Multi-reference caps: FLUX.2 [pro/max/flex] up to 8, [klein] up to 4,
    FLUX.1 Kontext single image

    - In the prompt, "image 1 / image 2 / image 3" map to input_image /
    input_image_2 / input_image_3

    - Response `data[0].url` is **valid for only 10 minutes**, download
    immediately (CORS disabled)


    **Authentication**: include `Authorization: Bearer YOUR_API_KEY` in the
    request header.


    **Get API Key**: create a token at the [APIYI
    Console](https://api.apiyi.com/token).
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
      summary: Edit or fuse one or more reference images by instruction
      description: >
        Edit or fuse one or more reference images using FLUX.


        - **Path is shared with text-to-image: `/v1/images/generations`** (an
        OpenAI-compatible multipart single-image `/v1/images/edits` endpoint
        also exists — see "Option B" on the docs page)

        - Request Content-Type is `application/json`

        - **All reference image fields are URL strings**: `input_image`,
        `input_image_2` … `input_image_8`

        - If `aspect_ratio` is omitted, output dimensions match the first input
        image
      operationId: editFluxImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/EditImageRequest'
            example:
              model: flux-2-pro
              prompt: Naturally blend these two images
              input_image: https://static.apiyi.com/apiyi-logo.png
              input_image_2: https://images.unsplash.com/photo-1762138012600-2ab523f8b35a
              seed: 42
              output_format: jpeg
      responses:
        '200':
          description: Image generated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: >-
            Invalid params (missing input_image, dimensions not multiple of 16,
            exceeds 4MP, etc.)
        '401':
          description: Unauthorized — invalid API Key
        '403':
          description: Moderation block
        '413':
          description: Uploaded image too large
        '429':
          description: Rate limited or out of credits
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
        - input_image
      properties:
        model:
          type: string
          description: >-
            FLUX model ID. For multi-reference fusion prefer flux-2-pro /
            flux-2-max; for single-image edits also flux-kontext-max /
            flux-kontext-pro.
          enum:
            - flux-2-pro
            - flux-2-max
            - flux-2-flex
            - flux-2-klein-9b
            - flux-2-klein-4b
            - flux-kontext-max
            - flux-kontext-pro
          default: flux-2-pro
        prompt:
          type: string
          description: >-
            Edit / fusion instruction. In multi-reference scenarios, refer to
            images by index: 'image 1' / 'image 2' / 'image 3' map to
            input_image / input_image_2 / input_image_3.
          example: Naturally blend these two images
        input_image:
          type: string
          description: >-
            Public URL for reference image 1 (required). **Use plain URLs in the
            Playground**; for local code you can also pass a
            `data:image/png;base64,xxx` data URL.
          example: https://static.apiyi.com/apiyi-logo.png
        input_image_2:
          type: string
          description: Public URL for reference image 2 (optional)
        input_image_3:
          type: string
          description: Public URL for reference image 3 (optional)
        input_image_4:
          type: string
          description: Public URL for reference image 4 (optional)
        input_image_5:
          type: string
          description: Public URL for reference image 5 (optional)
        input_image_6:
          type: string
          description: Public URL for reference image 6 (optional)
        input_image_7:
          type: string
          description: Public URL for reference image 7 (optional)
        input_image_8:
          type: string
          description: >-
            Public URL for reference image 8 (optional, only FLUX.2
            [pro/max/flex] supports up to 8)
        aspect_ratio:
          type: string
          description: >-
            Aspect ratio, e.g. 1:1 / 16:9 / 9:16 / 4:3 / 3:4. Defaults to first
            input image.
        seed:
          type: integer
          description: Fix for reproducibility.
        safety_tolerance:
          type: integer
          description: Moderation level. 0 = strictest, 6 = most permissive. Default 2.
          minimum: 0
          maximum: 6
        output_format:
          type: string
          description: Output format. Default jpeg.
          enum:
            - jpeg
            - png
        prompt_upsampling:
          type: boolean
          description: Auto-upsample the prompt. Default false.
        steps:
          type: integer
          description: '**Only flux-2-flex**. Inference steps. Default 50.'
          minimum: 1
          maximum: 50
        guidance:
          type: number
          description: '**Only flux-2-flex**. Guidance scale. Default 4.5.'
          minimum: 1.5
          maximum: 10
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
          example: 1776832476
        data:
          type: array
          description: Result array (single image per call)
          items:
            type: object
            properties:
              url:
                type: string
                description: >-
                  **Signed URL, valid for 10 minutes**. Hosted on
                  delivery-eu.bfl.ai / delivery-us.bfl.ai with CORS disabled.
                example: >-
                  https://delivery-eu.bfl.ai/results/xxx/sample.jpeg?signature=...
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key from the APIYI Console

````