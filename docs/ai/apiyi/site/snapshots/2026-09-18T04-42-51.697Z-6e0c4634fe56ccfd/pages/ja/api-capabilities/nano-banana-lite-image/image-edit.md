> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 画像編集 API リファレンス

> Nano Banana 2 Lite 画像編集 API リファレンスとインタラクティブなプレイグラウンド — 画像 + 指示を与えて編集結果を生成します

<Info>
  右側のインタラクティブなプレイグラウンドでは、パラメータをドロップダウンで選択できます。**Authorization** フィールドに API Key を入力し（形式: `Bearer sk-xxx`）、ワンクリックでテストリクエストを送信してください。
</Info>

<Tip>
  **対象**: このページは **画像編集** 用です。編集指示とあわせて、入力画像（base64エンコード）を指定する必要があります。テキストだけで新しい画像を生成する場合は、[Text-to-Image エンドポイント](/ja/api-capabilities/nano-banana-lite-image/text-to-image) を使用してください。
</Tip>

<Warning>
  **🖥️ ブラウザ版 Playground の制約（重要）**

  このエンドポイントは、レスポンスで base64エンコードされた画像（`inlineData.data`、通常は数 MB）を返します。ブラウザのレンダリング制限により、レスポンス到着後に右側のプレイグラウンドで `请求时发生错误: unable to complete request` と表示される場合があります — **実際にはリクエストは成功しています**。ブラウザがそれほど長い base64 文字列を描画できないだけです。

  **推奨ワークフロー**（初心者向け）:

  * **下の Python / Node.js / cURL サンプルをコピーして、ローカルで実行してください**。コードが自動的に `base64.b64decode`し、**画像をファイルとして書き出します**。
  * ブラウザ内のプレイグラウンドを使う必要がある場合は、**小さな参照画像（50KB 未満）** を使ってレスポンスを小さくしてください。
</Warning>

<Warning>
  **⚠️ `parts` 配列の構造（重要 — 複数画像編集ではこれを読んでください）**

  各 `part` は、**`text` か `inlineData` のどちらか一方のみ**でなければなりません。両方を同時に含めることはできません。これは Google の公式 `gemini-3.1-flash-lite-image` 契約に一致します。

  **正しい例**: 1 つの text part（指示） + N 個の inlineData part（画像ごとに 1 つ）:

  ```json theme={null}
  "contents": [{
    "parts": [
      {"text": "Combine the people from these two images into one office scene"},
      {"inlineData": {"mimeType": "image/png", "data": "<BASE64_DATA_IMG_1>"}},
      {"inlineData": {"mimeType": "image/png", "data": "<BASE64_DATA_IMG_2>"}}
    ]
  }]
  ```

  **誤り**（各 part に `text` と `inlineData` の両方が含まれている — 未定義の動作を引き起こします）:

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

  このエンドポイントは **JSON 形式**（multipart のファイルアップロードではありません）を使用するため、プレイグラウンドからローカルファイルを直接選択することはできません。まず画像を **Base64 文字列** に変換し、それを `data` 入力に貼り付けてください。

  **1 行コマンド: 変換 + クリップボードへコピー**:

  ```bash theme={null}
  # macOS
  base64 -i your-image.jpg | tr -d '\n' | pbcopy

  # Linux
  base64 -w0 your-image.jpg | xclip -selection clipboard

  # Windows PowerShell
  [Convert]::ToBase64String([IO.File]::ReadAllBytes("your-image.jpg")) | Set-Clipboard
  ```

  実行後は、`Cmd+V` / `Ctrl+V` をプレイグラウンドの `data` フィールドに貼り付けるだけです。あわせて、`mimeType` を対応する `image/jpeg` または `image/png` に設定することも忘れないでください。

  **推奨**: テストでは、長い base64 文字列によるブラウザの遅延を避けるため、小さな画像（200KB 未満）を使用してください。画像編集テストを頻繁に行う場合は、代わりに下のコード例を使ってローカルで実行してください。
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
    "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent",
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
            "imageConfig": {"aspectRatio": "16:9", "imageSize": "1K"}
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
  "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent",
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
        imageConfig: { aspectRatio: "16:9", imageSize: "1K" }
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

curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent" \
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
      "imageConfig": {"aspectRatio": "16:9", "imageSize": "1K"}
    }
  }'
```

## マルチ画像編集

複数の入力画像を結合または比較する場合は、**単一の`text`パート**（指示）に続けて、**複数の`inlineData`パート**（画像ごとに1つ）を使用します。

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
    "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent",
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json={
        "contents": [{"parts": parts}],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"],
            "imageConfig": {"aspectRatio": "5:4", "imageSize": "1K"}
        }
    },
    timeout=300
).json()

img_data = response["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]
with open("merged.png", "wb") as f:
    f.write(base64.b64decode(img_data))
```

## パラメータのクイックリファレンス

| パラメータ                                      | 型      | 必須  | 説明                                                                                                         |
| ------------------------------------------ | ------ | --- | ---------------------------------------------------------------------------------------------------------- |
| `contents[].parts`                         | array  | Yes | **1つのテキスト部分 + N個の inlineData 部分** で構成されます。各部分には `text` または `inlineData` のどちらか一方のみが含まれます。両方が同時に含まれることはありません |
| `contents[].parts[].text`                  | string | Yes | 編集指示（最初の部分にのみ入れてください）                                                                                      |
| `contents[].parts[].inlineData.mimeType`   | string | Yes | `image/jpeg` または `image/png`                                                                               |
| `contents[].parts[].inlineData.data`       | string | Yes | Base64エンコードされた画像（複数画像の編集では、画像ごとに inlineData 部分を1つずつ繰り返します）                                                 |
| `generationConfig.responseModalities`      | array  | Yes | 通常は `["IMAGE"]`                                                                                            |
| `generationConfig.imageConfig.aspectRatio` | string | No  | 14種類の比率、デフォルトは `1:1`                                                                                       |
| `generationConfig.imageConfig.imageSize`   | string | No  | `1K` のみ（Lite は 1K キャンバスに重点を置いています）                                                                         |

## マルチターンの対話編集

Nano Banana 2 Lite (`gemini-3.1-flash-lite-image`) は **対話型マルチターン編集** をサポートします: 各ターンで生成された画像を `contents` に **`role: "model"` `inlineData`** として追加し、次のユーザー指示を送ります。モデルは **会話履歴全体** に基づいて編集し、**変更を積み重ねます**（例: まずソファの色を変え、次にアクセサリーを追加する — 前の変更は保持されます）。

```python theme={null}
import requests, base64

API_KEY = "sk-your-api-key"
URL = "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent"
H = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
CFG = {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "1:1", "imageSize": "1K"}}

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
  **既存画像からマルチターンを開始する**: 最初のユーザーメッセージで、既存の写真を編集するための `inlineData`（ご自身の画像）と指示を入れ、その後は各ターンでモデルの出力を `contents` に追記し続けます。
</Tip>


## OpenAPI

````yaml api-reference/nano-banana-lite-edit-openapi-en.yaml POST /v1beta/models/gemini-3.1-flash-lite-image:generateContent
openapi: 3.1.0
info:
  title: Nano Banana 2 Lite Image Editing API
  description: >
    Google's fastest, most efficient image model Nano Banana 2 Lite
    (gemini-3.1-flash-lite-image) — image editing endpoint.


    Provide an input image + edit instruction to generate a new edited image.
    For text-to-image, use the text-to-image endpoint.


    **Authentication**: Add `Authorization: Bearer YOUR_API_KEY` to the request
    headers


    **Get an API Key**: Visit the [APIYI console](https://api.apiyi.com/token)
    to create a token
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
  - url: https://vip.apiyi.com
    description: Backup endpoint
security:
  - bearerAuth: []
paths:
  /v1beta/models/gemini-3.1-flash-lite-image:generateContent:
    post:
      tags:
        - Image Editing
      summary: 'Image editing: edit an existing image per instructions'
      description: >
        Use the Nano Banana 2 Lite model to edit an input image per text
        instructions. Supports multi-turn conversational editing.


        - An input image (`inlineData`, base64-encoded) is required

        - Text (`text`) describes the edit instruction

        - For text-to-image, use the [text-to-image
        endpoint](/en/api-capabilities/nano-banana-lite-image/text-to-image)
      operationId: editNanoBananaLiteImage
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
                        Composite the people from these two images into the same
                        office scene, making funny faces
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
                  imageSize: 1K
      responses:
        '200':
          description: Image generated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GenerateContentResponse'
        '401':
          description: Unauthorized - invalid API Key
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
          description: >-
            Content array containing the edit instruction and the image(s) to
            edit
          items:
            $ref: '#/components/schemas/EditContent'
        generationConfig:
          $ref: '#/components/schemas/GenerationConfig'
    GenerateContentResponse:
      type: object
      properties:
        candidates:
          type: array
          description: Array of generation results
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
            Array of content parts. **Each part can be either text OR inlineData
            — the two cannot appear in the same part.**

            Multi-image editing: use one text part (edit instruction) + multiple
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
          description: >-
            Response type. IMAGE returns only images; TEXT+IMAGE returns both
            text and images
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
        A content part, either a TextPart or an ImagePart (cannot contain both
        text and inlineData)
      oneOf:
        - $ref: '#/components/schemas/TextPart'
        - $ref: '#/components/schemas/ImagePart'
    ImageConfig:
      type: object
      description: Image generation config
      properties:
        aspectRatio:
          type: string
          description: Aspect ratio, 14 supported
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
          description: Output resolution (Lite is focused on the 1K canvas)
          enum:
            - 1K
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
          example: Blur the background to emphasize the person in the foreground
    ImagePart:
      type: object
      description: 'Image part: the image to edit (repeat multiple for multi-image editing)'
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
      description: API Key obtained from the APIYI console

````