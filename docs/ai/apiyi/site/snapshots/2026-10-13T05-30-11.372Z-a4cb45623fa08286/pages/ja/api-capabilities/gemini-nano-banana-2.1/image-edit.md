> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 画像編集 API リファレンス

> Nano Banana 2.1 画像編集 API リファレンスとインタラクティブなプレイグラウンド — 画像と指示を指定して編集結果を生成します

<Info>
  右側のインタラクティブなPlaygroundでは、パラメータをドロップダウン形式で選択できます。**Authorization**フィールドにAPIキー（形式: `Bearer sk-xxx`）を入力すると、ワンクリックでテストリクエストを送信できます。
</Info>

<Tip>
  **対象範囲**: このページは**画像編集**専用です。編集の指示とともに、入力画像（base64エンコード済み）を提供する必要があります。テキストのみから新しい画像を生成する場合は、[テキストから画像生成エンドポイント](/ja/api-capabilities/gemini-nano-banana-2.1/text-to-image)を使用してください。
</Tip>

<Warning>
  **🖥️ ブラウザPlaygroundの制限事項（重要）**

  このエンドポイントは、レスポンスとしてbase64エンコードされた画像（`inlineData.data`、通常は数MB）を返します。ブラウザのレンダリング制限により、レスポンス受信後に右側のPlaygroundに`请求时发生错误: unable to complete request`と表示される場合がありますが、**リクエスト自体は実際には成功しています**。単にブラウザがこれほど長いbase64文字列を描画できないだけです。

  **推奨ワークフロー**（初心者向け）:

  * **以下のPython / Node.js / cURLサンプルをコピーしてローカルで実行してください**。コードがレスポンスを自動的に`base64.b64decode`し、**画像をファイルに書き込みます**。
  * どうしてもブラウザ内のPlaygroundを使用する場合は、**非常に小さい参照画像（50KB未満）を使用し**、`imageSize`を最小レベル（`1K`）に設定してください。
</Warning>

<Warning>
  **⚠️ `parts` 配列構造（重要 — 複数画像の編集時は必ずお読みください）**

  各`part`は、**`text`または`inlineData`のいずれか1つである必要があり、両方を含めることはできません**。これはGoogle公式の`gemini-nano-banana-2.1`仕様に準拠しています。

  **正しい例**: 1つのtextパート（指示） + N個のinlineDataパート（画像1枚につき1個）:

  ```json theme={null}
  "contents": [{
    "parts": [
      {"text": "Combine the people from these two images into one office scene"},
      {"inlineData": {"mimeType": "image/png", "data": "<BASE64_DATA_IMG_1>"}},
      {"inlineData": {"mimeType": "image/png", "data": "<BASE64_DATA_IMG_2>"}}
    ]
  }]
  ```

  **誤った例**（各パートに`text`と`inlineData`の両方が含まれている — 予期しない動作を引き起こします）:

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

  このエンドポイントは **JSON 形式**（マルチパートファイルアップロードではありません）を使用しているため、Playgroundでローカルファイルを直接選択することはできません。まず画像を **Base64 文字列**に変換し、それを `data` 入力欄に貼り付ける必要があります。

  **ワンライナーコマンド: 変換してクリップボードにコピー**:

  ```bash theme={null}
  # macOS
  base64 -i your-image.jpg | tr -d '\n' | pbcopy

  # Linux
  base64 -w0 your-image.jpg | xclip -selection clipboard

  # Windows PowerShell
  [Convert]::ToBase64String([IO.File]::ReadAllBytes("your-image.jpg")) | Set-Clipboard
  ```

  実行後、Playgroundの `data` フィールドに `Cmd+V` / `Ctrl+V` で貼り付けるだけです。また、`mimeType` を一致する `image/jpeg` または `image/png` に設定することも忘れないでください。

  **推奨事項**: 長いbase64文字列によるブラウザの遅延を避けるため、テストには小さな画像（200KB未満）を使用してください。頻繁に画像編集テストを行う場合は、代わりに以下のコード例を使用してローカルで実行してください。
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
    "https://api.apiyi.com/v1beta/models/gemini-nano-banana-2.1:generateContent",
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

img_data = [p for p in response["candidates"][0]["content"]["parts"] if "inlineData" in p][-1]["inlineData"]["data"]
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
  "https://api.apiyi.com/v1beta/models/gemini-nano-banana-2.1:generateContent",
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
const imgBase64 = data.candidates[0].content.parts.filter((p) => p.inlineData).at(-1).inlineData.data;
fs.writeFileSync("edited.png", Buffer.from(imgBase64, "base64"));
```

### cURL

```bash theme={null}
# Note: convert image to base64 first
# IMAGE_B64=$(base64 -i input.jpg | tr -d '\n')

curl -X POST "https://api.apiyi.com/v1beta/models/gemini-nano-banana-2.1:generateContent" \
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

## 複数画像の編集

複数の入力画像を統合または比較する場合、**単一の `text` パート**（指示内容）の後に**複数の `inlineData` パート**（画像ごとに1つ）を使用します。

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
    "https://api.apiyi.com/v1beta/models/gemini-nano-banana-2.1:generateContent",
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

img_data = [p for p in response["candidates"][0]["content"]["parts"] if "inlineData" in p][-1]["inlineData"]["data"]
with open("merged.png", "wb") as f:
    f.write(base64.b64decode(img_data))
```

### cURL（複数画像、Google の公式フォーマットに準拠）

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1beta/models/gemini-nano-banana-2.1:generateContent" \
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

## パラメータクイックリファレンス

| パラメータ | 型 | 必須 | 説明 |
| - | - | - | - |
| `contents[].parts` | 配列 | 必須 | **1つのtextパート + N個のinlineDataパート**で構成されます。各パートには`text`または`inlineData`のいずれか一方のみを含める必要があり、両方を含めることはできません |
| `contents[].parts[].text` | 文字列 | 必須 | 編集指示（最初のパートにのみ配置してください） |
| `contents[].parts[].inlineData.mimeType` | 文字列 | 必須 | `image/jpeg`または`image/png` |
| `contents[].parts[].inlineData.data` | 文字列 | 必須 | Base64エンコードされた画像（複数画像を編集する場合は、画像ごとに1つのinlineDataパートを繰り返します） |
| `generationConfig.responseModalities` | 配列 | 必須 | 通常は`["IMAGE"]` |
| `generationConfig.imageConfig.aspectRatio` | 文字列 | 任意 | 14種類の比率。省略された場合はモデルがコンテンツに基づいて選択するため、明示的に指定してください |
| `generationConfig.imageConfig.imageSize` | 文字列 | 任意 | `1K` / `2K` / `4K`（`512`は非サポート）、デフォルトは`1K` |
| `generationConfig.thinkingConfig.thinkingLevel` | 文字列 | 任意 | `minimal` / `medium` / `high`、デフォルトは`medium` |
| `generationConfig.thinkingConfig.includeThoughts` | 真偽値 | 任意 | 思考プロセスのテキストを返します |

## マルチターンの対話型編集

Nano Banana 2.1（`gemini-nano-banana-2.1`）は**真の対話型マルチターン編集**をサポートしています。`contents`に各ターンで生成された画像を\*\*`role: "model"` `inlineData`**として追加し、次のユーザー指示を送信します。モデルは**完全な会話履歴\*\*に基づいて編集を行い、**変更を累積**します（例：最初にソファの色を変更し、次に小物を追加した場合でも、以前の変更は保持されます）。

<Info>
  これはリバース画像モデルとは異なります。ネイティブのGeminiフォーマットは、`model`ロールの履歴ターンから画像を忠実に読み取ります。ターン間の一貫性と段階的な調整を行うには、以下の履歴バックフィルパターンを使用してください。
</Info>

```python theme={null}
import requests, base64

API_KEY = "sk-your-api-key"
URL = "https://api.apiyi.com/v1beta/models/gemini-nano-banana-2.1:generateContent"
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
  **既存の画像からマルチターンを開始する**: 既存の写真を編集するには、最初のユーザーメッセージに`inlineData`（ご自身の画像）と指示を含め、その後ターンごとにモデル出力を`contents`へバックフィルし続けます。
</Tip>

<Note>
  **2つのマルチターンスタイル**:

  * **履歴バックフィル（上記、推奨）**: `contents`でユーザーとモデルが交互に続く履歴を保持し、より優れた一貫性でターン間の変更を累積します。
  * **再フィード（よりシンプル）**: 以前のコンテキストを引き継がずに、各ターンで1ステップの編集用に単一のユーザーメッセージ（`text` + 前の画像の`inlineData`）を送信します。
</Note>


## OpenAPI

````yaml api-reference/gemini-nano-banana-2.1-edit-openapi-en.yaml POST /v1beta/models/gemini-nano-banana-2.1:generateContent
openapi: 3.1.0
info:
  title: Nano Banana 2.1 Image Editing API
  description: >
    Google image generation model Nano Banana 2.1 (gemini-nano-banana-2.1) —
    Image Editing endpoint.


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
security:
  - bearerAuth: []
paths:
  /v1beta/models/gemini-nano-banana-2.1:generateContent:
    post:
      tags:
        - Image Editing
      summary: 'Image Editing: Edit an existing image with text instructions'
      description: >
        Edit images using the Nano Banana 2.1 model with text-based
        instructions. Supports multi-turn conversational editing.


        - Must provide an input image (`inlineData`, base64-encoded)

        - Text (`text`) describes the edit instructions

        - For text-to-image, use the [Text-to-Image
        endpoint](/en/api-capabilities/gemini-nano-banana-2.1/text-to-image)
      operationId: editNanoBanana21ImageEn
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
          description: >-
            Aspect ratio, 14 options. If omitted, the model picks one based on
            the content (in our tests, scenes mostly came out 16:9 and posters
            2:3 / 3:4). Pass it explicitly if you need a fixed ratio
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
        imageSize:
          type: string
          description: Output resolution
          enum:
            - 1K
            - 2K
            - 4K
          default: 1K
    ThinkingConfig:
      type: object
      description: >-
        Thinking configuration. Nano Banana 2.1 thinks before generating by
        default (default level: medium); thinking tokens are billed together
        with the image as output
      properties:
        thinkingLevel:
          type: string
          description: >-
            Thinking depth: minimal / medium (default) / high. In our tests,
            high used about 30% more thinking tokens than the default
          enum:
            - minimal
            - medium
            - high
          default: medium
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

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.