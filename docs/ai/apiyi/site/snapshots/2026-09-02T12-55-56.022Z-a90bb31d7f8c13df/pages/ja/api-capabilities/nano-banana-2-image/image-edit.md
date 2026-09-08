> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 画像編集 API リファレンス

> Nano Banana 2 画像編集 API リファレンスとインタラクティブなプレイグラウンド — 画像 + 指示を与えて、編集結果を生成します

<Info>
  右側のインタラクティブな Playground は、パラメータのドロップダウン選択をサポートしています。**Authorization** フィールドに API Key を入力し（形式: `Bearer sk-xxx`）、ワンクリックでテストリクエストを送信できます。
</Info>

<Tip>
  **適用範囲**: このページは**画像編集**用です。編集指示とともに、入力画像（base64 エンコード済み）を提供する必要があります。テキストのみから新しい画像を生成するには、[Text-to-Image endpoint](/ja/api-capabilities/nano-banana-2-image/text-to-image) を使用してください。
</Tip>

<Warning>
  **🖥️ ブラウザ版 Playground の制限（重要）**

  この endpoint は、レスポンス内で base64 エンコードされた画像（`inlineData.data`、通常は数 MB）を返します。ブラウザのレンダリング制限により、右側の Playground ではレスポンス到着後に `请求时发生错误: unable to complete request` と表示される場合があります — **リクエスト自体は成功しています**; ブラウザがそのような長い base64 文字列をレンダリングできないだけです。

  **推奨ワークフロー**（初心者向け）:

  * **下の Python / Node.js / cURL のサンプルをコピーして、ローカルで実行してください**。コードが自動的に `base64.b64decode`s してレスポンスを処理し、**画像をファイルに書き込みます**。
  * どうしてもブラウザ内の Playground を使う場合は、**小さな参照画像（\< 50KB）を使い**、`imageSize` を最小のティア（例: `512` / `1K`）に設定してください。
</Warning>

<Warning>
  **⚠️ `parts` 配列構造（重要 — 複数画像編集の場合はこれを読んでください）**

  各 `part` は、**`text` または `inlineData` のどちらか一方でなければならず、両方を含めてはいけません**。これは Google の公式 `gemini-3.1-flash-image-preview` 契約と一致しています。

  **正しい**: 1 つの text パート（指示）+ N 個の inlineData パート（画像ごとに 1 つずつ）:

  ```json theme={null}
  "contents": [{
    "parts": [
      {"text": "Combine the people from these two images into one office scene"},
      {"inlineData": {"mimeType": "image/png", "data": "<BASE64_DATA_IMG_1>"}},
      {"inlineData": {"mimeType": "image/png", "data": "<BASE64_DATA_IMG_2>"}}
    ]
  }]
  ```

  **誤り**（各パートに `text` と `inlineData` の両方が含まれている — 未定義の動作になります）:

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
  **🖼️ `inlineData.data` フィールドについて**

  この endpoint は**JSON 形式**（multipart ファイルアップロードではありません）を使用するため、Playground からローカルファイルを直接選択することはできません。まず画像を**Base64 文字列**に変換し、`data` 入力に貼り付ける必要があります。

  **ワンラインコマンド: 変換 + クリップボードへコピー**:

  ```bash theme={null}
  # macOS
  base64 -i your-image.jpg | tr -d '\n' | pbcopy

  # Linux
  base64 -w0 your-image.jpg | xclip -selection clipboard

  # Windows PowerShell
  [Convert]::ToBase64String([IO.File]::ReadAllBytes("your-image.jpg")) | Set-Clipboard
  ```

  実行後は、Playground の `data` フィールドに `Cmd+V` / `Ctrl+V` して貼り付けるだけです。また、`mimeType` を対応する `image/jpeg` または `image/png` に設定することも忘れないでください。

  **推奨**: 長い base64 文字列によるブラウザの遅延を避けるため、テストには小さな画像（\< 200KB）を使ってください。頻繁に画像編集テストを行う場合は、代わりに下のコード例を使ってローカルで実行することをおすすめします。
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
    "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent",
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
  "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent",
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

curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent" \
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

## マルチ画像編集

複数の入力画像を結合または比較する場合は、**1つの `text` パート**（指示）に続けて、**複数の `inlineData` パート**（画像ごとに1つ）を使用してください。

### Python（マルチ画像）

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
    "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent",
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

### cURL（マルチ画像、Google の公式形式に準拠）

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent" \
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

## パラメーター クイックリファレンス

| Parameter                                         | Type    | Required | Description                                                                                         |
| ------------------------------------------------- | ------- | -------- | --------------------------------------------------------------------------------------------------- |
| `contents[].parts`                                | array   | Yes      | **1つのテキスト部分 + N個の inlineData 部分** で構成されます。各部分には `text` または `inlineData` のどちらか一方のみを含め、両方を含めることはありません |
| `contents[].parts[].text`                         | string  | Yes      | 編集指示（最初の部分にのみ配置します）                                                                                 |
| `contents[].parts[].inlineData.mimeType`          | string  | Yes      | `image/jpeg` または `image/png`                                                                        |
| `contents[].parts[].inlineData.data`              | string  | Yes      | Base64 エンコードされた画像（複数画像の編集では、画像ごとに 1 つの inlineData 部分を繰り返します）                                        |
| `generationConfig.responseModalities`             | array   | Yes      | 通常は `["IMAGE"]`                                                                                     |
| `generationConfig.imageConfig.aspectRatio`        | string  | No       | 14 種類の比率、デフォルトは `1:1`                                                                               |
| `generationConfig.imageConfig.imageSize`          | string  | No       | `512` / `1K` / `2K` / `4K`、デフォルトは `1K`                                                              |
| `generationConfig.thinkingConfig.thinkingLevel`   | string  | No       | `minimal`（高速）/ `High`（深い推論）                                                                         |
| `generationConfig.thinkingConfig.includeThoughts` | boolean | No       | thinking process テキストを返します                                                                          |

## マルチターンの会話型編集

Nano Banana 2 (`gemini-3.1-flash-image-preview`) は、**真の会話型マルチターン編集**をサポートします。各ターンで生成された画像を `contents` に **`role: "model"` `inlineData`** として再追加し、その後に次のユーザー指示を送ります。モデルは **会話履歴全体** に基づいて編集し、**変更を積み重ねます**（例: まずソファの色を変え、次にアクセサリーを追加する — 以前の変更は保持されます）。

<Info>
  これは逆画像モデルとは異なります。ネイティブの Gemini 形式は、`model`-ロールの履歴ターンから画像を実際に読み取ります。ターンをまたぐ一貫性と段階的な洗練のため、以下の履歴バックフィルパターンを使用してください。
</Info>

```python theme={null}
import requests, base64

API_KEY = "sk-your-api-key"
URL = "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent"
H = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
CFG = {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "1:1", "imageSize": "2K"}}

contents = []  # keep one running conversation history

def turn(instruction, save_to):
    contents.append({"role": "user", "parts": [{"text": instruction}]})
    data = requests.post(URL, headers=H,
                         json={"contents": contents, "generationConfig": CFG}, timeout=300).json()
    part = next(p for p in data["candidates"][0]["content"]["parts"] if "inlineData" in p)
    contents.append({"role": "model", "parts": [part]})   # key: backfill the output image into history
    with open(save_to, "wb") as f:
        f.write(base64.b64decode(part["inlineData"]["data"]))
    return part

turn("Generate an orange cat sitting on a blue sofa, simple line-art style", "step1.png")
turn("Make the sofa red; keep the cat and composition unchanged", "step2.png")   # edits the previous image
turn("Put a small yellow hat on the cat; keep everything else the same", "step3.png")  # accumulates; red sofa kept
```

<Tip>
  **既存の画像からマルチターンを開始する**: 最初のユーザーメッセージに、既存の写真を編集するための `inlineData`（ご自身の画像）と指示を入れ、各ターンでモデル出力を `contents` にバックフィルし続けます。
</Tip>

<Note>
  **2つのマルチターン方式**:

  * **履歴バックフィル（上記、推奨）**: `contents` は、ユーザー/モデルの交互の履歴を維持し、より高い一貫性でターンをまたいで変更を積み重ねます。
  * **再フィード（よりシンプル）**: 各ターンで 1 つのユーザーメッセージ（`text` + 直前の画像の `inlineData`）を送り、前のコンテキストを引き継がずに 1 ステップの編集を行います。
</Note>


## OpenAPI

````yaml api-reference/nano-banana-2-edit-openapi-en.yaml POST /v1beta/models/gemini-3.1-flash-image-preview:generateContent
openapi: 3.1.0
info:
  title: Nano Banana 2 Image Editing API
  description: >
    Google's latest image generation model Nano Banana 2
    (gemini-3.1-flash-image-preview) — Image Editing endpoint.


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
  /v1beta/models/gemini-3.1-flash-image-preview:generateContent:
    post:
      tags:
        - Image Editing
      summary: 'Image Editing: Edit an existing image with text instructions'
      description: >
        Edit images using the Nano Banana 2 model with text-based instructions.
        Supports multi-turn conversational editing.


        - Must provide an input image (`inlineData`, base64-encoded)

        - Text (`text`) describes the edit instructions

        - For text-to-image, use the [Text-to-Image
        endpoint](/en/api-capabilities/nano-banana-2-image/text-to-image)
      operationId: editNanoBanana2ImageEn
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
          description: Successfully edited image
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
          description: Content array containing edit instructions and the image to edit
          items:
            $ref: '#/components/schemas/EditContent'
        generationConfig:
          $ref: '#/components/schemas/GenerationConfig'
    GenerateContentResponse:
      type: object
      properties:
        candidates:
          type: array
          description: Generation results array
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
          description: Response type. IMAGE returns image only, TEXT+IMAGE returns both
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
        thinkingConfig:
          $ref: '#/components/schemas/ThinkingConfig'
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
          description: Aspect ratio, supports 14 options
          enum:
            - '1:1'
            - '1:4'
            - '4:1'
            - '1:8'
            - '8:1'
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
            - '512'
            - 1K
            - 2K
            - 4K
          default: 1K
    ThinkingConfig:
      type: object
      description: >-
        Thinking mode configuration (Nano Banana 2 exclusive). When enabled, the
        model reasons and analyzes before generating, ideal for complex prompts
      properties:
        thinkingLevel:
          type: string
          description: >-
            Thinking depth. minimal = fast generation; High = deep reasoning,
            more accurate but slightly slower
          enum:
            - minimal
            - High
          default: minimal
        includeThoughts:
          type: boolean
          description: >-
            Whether to include thinking process text in the response. Note:
            thinking tokens are billed regardless of this setting
          default: false
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
      description: Inline image data (the image to edit)
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
      description: API Key obtained from APIYI Console

````