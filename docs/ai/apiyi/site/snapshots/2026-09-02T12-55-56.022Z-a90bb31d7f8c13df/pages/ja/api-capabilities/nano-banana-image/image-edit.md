> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Image Editing API リファレンス

> Nano Banana Pro の画像編集 API リファレンスとインタラクティブなプレイグラウンド — 画像 + 指示を与えて編集結果を生成します

<Info>
  右側のインタラクティブな Playground では、パラメータをドロップダウンで選択できます。API Key を **Authorization** フィールド（形式: `Bearer sk-xxx`）に入力すると、ワンクリックでテストリクエストを送信できます。
</Info>

<Tip>
  **範囲**: このページは **画像編集** 用です。編集指示に加えて、入力画像（base64エンコードされたもの）を提供する必要があります。テキストのみから新しい画像を生成するには、[Text-to-Image エンドポイント](/ja/api-capabilities/nano-banana-image/text-to-image) を使用してください。
</Tip>

<Warning>
  **🖥️ ブラウザ Playground の制限（重要）**

  このエンドポイントは、レスポンスで base64エンコードされた画像（`inlineData.data`、通常は数MB）を返します。ブラウザのレンダリング制限により、右側の Playground ではレスポンス到着後に `请求时发生错误: unable to complete request` が表示される場合があります — **リクエスト自体は正常に成功しています**。ブラウザが、そのような長い base64 文字列をレンダリングできないだけです。

  **推奨ワークフロー**（初心者向け）:

  * **下の Python / Node.js / cURL サンプルをコピーして、ローカルで実行してください**。コードが自動で `base64.b64decode`s し、**画像をファイルに書き出します**。
  * どうしてもブラウザ内の Playground を使う必要がある場合は、**小さな参照画像（\< 50KB）を使用し、`imageSize` を最小の階層（例: `1K`）に設定してください**。
</Warning>

<Warning>
  **⚠️ `parts` 配列の構造（重要 — 複数画像編集ではここを読んでください）**

  各 `part` は、**`text` か `inlineData` のどちらか一方のみ**でなければなりません。両方を含めてはいけません。これは Google の公式な `gemini-3-pro-image-preview` 契約と一致します。

  **正しい例**: 1 つの text part（指示） + N 個の inlineData part（画像 1 枚につき 1 つ）:

  ```json theme={null}
  "contents": [{
    "parts": [
      {"text": "Combine the people from these two images into one office scene"},
      {"inlineData": {"mimeType": "image/png", "data": "<BASE64_DATA_IMG_1>"}},
      {"inlineData": {"mimeType": "image/png", "data": "<BASE64_DATA_IMG_2>"}}
    ]
  }]
  ```

  **誤った例**（各 part に `text` と `inlineData` の両方が含まれている — 未定義動作を引き起こします）:

  ```json theme={null}
  "contents": [{
    "parts": [
      {"inlineData": {...}, "text": "is this the prompt 1"},
      {"inlineData": {...}, "text": "is this the prompt 2"}
    ]
  }]
  ```
</Warning>

<Warning>
  **`inlineData.data` フィールドについて**

  このエンドポイントは **JSON 形式**（multipart のファイルアップロードではありません）を使用するため、Playground からローカルファイルを直接選択することはできません。まず画像を **Base64 文字列** に変換し、それを `data` 入力に貼り付ける必要があります。

  **1 行コマンド: 変換 + クリップボードにコピー**:

  ```bash theme={null}
  # macOS
  base64 -i your-image.jpg | tr -d '\n' | pbcopy

  # Linux
  base64 -w0 your-image.jpg | xclip -selection clipboard

  # Windows PowerShell
  [Convert]::ToBase64String([IO.File]::ReadAllBytes("your-image.jpg")) | Set-Clipboard
  ```

  実行後は、そのまま `Cmd+V` / `Ctrl+V` して Playground の `data` フィールドに貼り付けてください。また、`mimeType` を対応する `image/jpeg` または `image/png` に設定することも忘れないでください。

  **推奨**: ブラウザの遅延を避けるため、テストには小さな画像（200KB 未満）を使用してください。画像編集のテストを頻繁に行う場合は、代わりに下のコード例を使ってローカルで実行してください。
</Warning>

## コード例

### Python

```python theme={null}
import requests
import base64

API_KEY = "sk-your-api-key"

# Read the image to edit
with open("input.jpg", "rb") as f:
    image_b64 = base64.b64encode(f.read()).decode()

response = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent",
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json={
        "contents": [{
            "parts": [
                {"text": "Please blur the background to highlight the person in the foreground"},
                {"inlineData": {"mimeType": "image/jpeg", "data": image_b64}}
            ]
        }],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": "16:9", "imageSize": "2K"}
        }
    },
    timeout=300
).json()

img_data = response["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]
with open("edited.png", 'wb') as f:
    f.write(base64.b64decode(img_data))
print("Edited image saved to edited.png")
```

### Node.js

```javascript theme={null}
import fs from "fs";

const API_KEY = "sk-your-api-key";
const imageB64 = fs.readFileSync("input.jpg").toString("base64");

const response = await fetch(
  "https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent",
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: "Please blur the background to highlight the person in the foreground" },
          { inlineData: { mimeType: "image/jpeg", data: imageB64 } }
        ]
      }],
      generationConfig: {
        responseModalities: ["IMAGE"],
        imageConfig: { aspectRatio: "16:9", imageSize: "2K" }
      }
    })
  }
);

const data = await response.json();
const imgBase64 = data.candidates[0].content.parts[0].inlineData.data;
fs.writeFileSync("edited.png", Buffer.from(imgBase64, "base64"));
```

### cURL

```bash theme={null}
# Note: convert image to base64 first
# IMAGE_B64=$(base64 -i input.jpg | tr -d '\n')

curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [
        {"text": "Please blur the background to highlight the person in the foreground"},
        {"inlineData": {"mimeType": "image/jpeg", "data": "'"$IMAGE_B64"'"}}
      ]
    }],
    "generationConfig": {
      "responseModalities": ["IMAGE"],
      "imageConfig": {"aspectRatio": "16:9", "imageSize": "2K"}
    }
  }'
```

## 複数画像編集

複数の入力画像を結合または比較する場合は、**単一の `text` パート**（指示）を使用し、その後に**複数の `inlineData` パート**（画像ごとに 1 つ）を続けます。

### Python（複数画像）

```python theme={null}
import requests
import base64

API_KEY = "sk-your-api-key"

def to_b64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()

# Prepare multiple images (2 here as an example)
images = ["person1.png", "person2.png"]
parts = [{"text": "Combine the people from these images into one office scene, making funny faces"}]
for path in images:
    parts.append({"inlineData": {"mimeType": "image/png", "data": to_b64(path)}})

response = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent",
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json={
        "contents": [{"parts": parts}],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"],
            "imageConfig": {"aspectRatio": "5:4", "imageSize": "2K"}
        }
    },
    timeout=300
).json()

img_data = response["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]
with open("merged.png", "wb") as f:
    f.write(base64.b64decode(img_data))
```

### cURL（複数画像、Google の公式形式に準拠）

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [
        {"text": "An office group photo of these people, they are making funny faces."},
        {"inlineData": {"mimeType": "image/png", "data": "<BASE64_DATA_IMG_1>"}},
        {"inlineData": {"mimeType": "image/png", "data": "<BASE64_DATA_IMG_2>"}},
        {"inlineData": {"mimeType": "image/png", "data": "<BASE64_DATA_IMG_3>"}}
      ]
    }],
    "generationConfig": {
      "responseModalities": ["TEXT", "IMAGE"],
      "imageConfig": {"aspectRatio": "5:4", "imageSize": "2K"}
    }
  }'
```

## パラメータ早見表

| パラメータ                                      | 型      | 必須  | 説明                                                                                                  |
| ------------------------------------------ | ------ | --- | --------------------------------------------------------------------------------------------------- |
| `contents[].parts`                         | array  | はい  | **1つのテキスト部分 + N個の inlineData 部分** で構成されます。各部分には `text` または `inlineData` のどちらか一方のみが含まれます — 両方は含まれません |
| `contents[].parts[].text`                  | string | はい  | 編集指示（最初の部分のみに入れてください）                                                                               |
| `contents[].parts[].inlineData.mimeType`   | string | はい  | `image/jpeg` または `image/png`                                                                        |
| `contents[].parts[].inlineData.data`       | string | はい  | Base64 エンコードされた画像（複数画像編集では、画像ごとに inlineData 部分を 1 つずつ繰り返します）                                        |
| `generationConfig.responseModalities`      | array  | はい  | 通常は `["IMAGE"]`                                                                                     |
| `generationConfig.imageConfig.aspectRatio` | string | いいえ | 10 個の比率、デフォルトは `1:1`                                                                                |
| `generationConfig.imageConfig.imageSize`   | string | いいえ | `1K` / `2K` / `4K`、デフォルトは `1K`                                                                      |

<Tip>
  Nano Banana Pro はマルチ画像編集をサポートします。複数の画像を編集指示とともに入力でき、マルチ画像合成やスタイル転送のような高度な機能に対応しています。
</Tip>


## OpenAPI

````yaml api-reference/nano-banana-pro-edit-openapi-en.yaml POST /v1beta/models/gemini-3-pro-image-preview:generateContent
openapi: 3.1.0
info:
  title: Nano Banana Pro Image Editing API
  description: >
    Google's image generation model Nano Banana Pro (gemini-3-pro-image-preview)
    — Image Editing endpoint.


    Provide an input image + edit instructions to generate a new edited image.
    For text-to-image, use the text-to-image endpoint instead.


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
  /v1beta/models/gemini-3-pro-image-preview:generateContent:
    post:
      tags:
        - Image Editing
      summary: 'Image Editing: Edit an existing image with text instructions'
      description: >
        Edit images using the Nano Banana Pro model with text-based
        instructions.


        - Must provide an input image (`inlineData`, base64-encoded)

        - Text (`text`) describes the edit instructions

        - Supports 4K HD editing, fine local editing, text rendering

        - For text-to-image, use the [Text-to-Image
        endpoint](/en/api-capabilities/nano-banana-image/text-to-image)
      operationId: editNanoBananaProImageEn
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/EditImageRequest'
            example:
              contents:
                - parts:
                    - text: >-
                        Combine the people from these two images into one office
                        scene, making funny faces
                    - inlineData:
                        mimeType: image/png
                        data: <BASE64_DATA_IMG_1>
                    - inlineData:
                        mimeType: image/png
                        data: <BASE64_DATA_IMG_2>
              generationConfig:
                responseModalities:
                  - IMAGE
                imageConfig:
                  aspectRatio: '16:9'
                  imageSize: 2K
      responses:
        '200':
          description: Image edited successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GenerateContentResponse'
        '401':
          description: Unauthorized - Invalid API Key
        '429':
          description: Rate limit exceeded
        '500':
          description: Internal server error
      security:
        - bearerAuth: []
components:
  schemas:
    EditImageRequest:
      type: object
      required:
        - contents
        - generationConfig
      properties:
        contents:
          type: array
          description: Content array with edit instructions and image to edit
          items:
            $ref: '#/components/schemas/EditContent'
        generationConfig:
          $ref: '#/components/schemas/GenerationConfig'
    GenerateContentResponse:
      type: object
      properties:
        candidates:
          type: array
          description: Generated results array
          items:
            type: object
            properties:
              content:
                type: object
                properties:
                  parts:
                    type: array
                    items:
                      type: object
                      properties:
                        inlineData:
                          type: object
                          properties:
                            mimeType:
                              type: string
                              example: image/png
                            data:
                              type: string
                              description: Base64-encoded image data
              finishReason:
                type: string
                example: STOP
        usageMetadata:
          type: object
          properties:
            promptTokenCount:
              type: integer
              example: 10
            candidatesTokenCount:
              type: integer
              example: 258
    EditContent:
      type: object
      required:
        - parts
      properties:
        parts:
          type: array
          description: >
            Content parts array. **Each part must be EITHER text OR inlineData —
            never both in the same part.**

            For multi-image editing: one text part (the instruction) + multiple
            inlineData parts (one per image), matching Google's official format.
          items:
            $ref: '#/components/schemas/EditPart'
    GenerationConfig:
      type: object
      required:
        - responseModalities
      properties:
        responseModalities:
          type: array
          description: Response type. IMAGE returns only image, TEXT+IMAGE returns both
          items:
            type: string
            enum:
              - IMAGE
              - TEXT
          default:
            - IMAGE
          example:
            - IMAGE
        imageConfig:
          $ref: '#/components/schemas/ImageConfig'
    EditPart:
      description: >-
        A content part — either a TextPart or an ImagePart (never both text and
        inlineData in one part)
      oneOf:
        - $ref: '#/components/schemas/TextPart'
        - $ref: '#/components/schemas/ImagePart'
    ImageConfig:
      type: object
      description: Image generation configuration
      properties:
        aspectRatio:
          type: string
          description: Aspect ratio, 10 options available
          enum:
            - '1:1'
            - '2:3'
            - '3:2'
            - '3:4'
            - '4:3'
            - '4:5'
            - '5:4'
            - '9:16'
            - '16:9'
            - '21:9'
          default: '1:1'
        imageSize:
          type: string
          description: Output resolution
          enum:
            - 1K
            - 2K
            - 4K
          default: 1K
    TextPart:
      type: object
      description: 'Text part: the edit instruction'
      required:
        - text
      properties:
        text:
          type: string
          description: Edit instruction describing how to modify the image
          example: Please blur the background to highlight the person in the foreground
    ImagePart:
      type: object
      description: 'Image part: an input image (repeat this part for multi-image editing)'
      required:
        - inlineData
      properties:
        inlineData:
          $ref: '#/components/schemas/InlineData'
    InlineData:
      type: object
      description: Inline image data (for image editing)
      required:
        - mimeType
        - data
      properties:
        mimeType:
          type: string
          description: Image MIME type
          enum:
            - image/png
            - image/jpeg
          default: image/jpeg
        data:
          type: string
          description: Base64-encoded image data
          example: iVBORw0KGgoAAAANSUhEUg...
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key from APIYI Console

````