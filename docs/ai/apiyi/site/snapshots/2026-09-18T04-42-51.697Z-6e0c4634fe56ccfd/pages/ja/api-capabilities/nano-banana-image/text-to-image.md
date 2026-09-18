> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# テキストから画像への API リファレンス

> Nano Banana Pro のテキストから画像への API リファレンスとインタラクティブなプレイグラウンド — prompt から画像を生成します

<Info>
  右側のインタラクティブな Playground では、パラメータ（アスペクト比、解像度、応答タイプなど）をドロップダウンで選択できます。**Authorization** フィールドに API Key を入力し（形式: `Bearer sk-xxx`）、ワンクリックでテストリクエストを送信します。
</Info>

<Tip>
  **対象範囲**: このページは **text-to-image generation** 用です。prompt を入力するだけでよく、画像のアップロードは不要です。既存の画像を編集する場合は、[Image Editing endpoint](/ja/api-capabilities/nano-banana-image/image-edit) を使用してください。
</Tip>

<Warning>
  **🖥️ ブラウザ Playground の制限（重要）**

  この endpoint は、base64 エンコードされた画像（`inlineData.data`、通常は数 MB）を応答として返します。ブラウザのレンダリング制限により、右側の Playground では応答到着後に `请求时发生错误: unable to complete request` が表示されることがあります。**リクエスト自体は実際には成功しています**。ブラウザがそのような長い base64 文字列を描画できないだけです。

  **推奨ワークフロー**（初心者向け）:

  * **下の Python / Node.js / cURL のサンプルをコピーして、ローカルで実行してください**。コードは応答を自動的に `base64.b64decode`s し、**画像をファイルとして書き込みます**。
  * ブラウザ内の Playground をどうしても使う必要がある場合は、`imageSize` を最小のティア（例: `1K`）に設定して、応答を小さくしてください。
</Warning>

<Info>
  すべての image API は **同期的** です。ポーリングするための task ID はなく、クライアントが切断されると、リクエストがまだ課金中であっても結果は失われます。このモデルには十分に長い timeout を設定してください。[Image API Essentials & Best Practices](/ja/api-capabilities/image-api-best-practices) を参照してください。
</Info>

## コード例

### Python

```python theme={null}
import requests
import base64

API_KEY = "sk-your-api-key"
PROMPT = "A cute cat sitting in a garden, oil painting style, HD details"

response = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent",
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json={
        "contents": [{"parts": [{"text": PROMPT}]}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": "16:9", "imageSize": "2K"}
        }
    },
    timeout=300
).json()

img_data = response["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]
with open("output.png", 'wb') as f:
    f.write(base64.b64decode(img_data))
print("Image saved to output.png")
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{"parts": [{"text": "Futuristic city night view, neon lights, cyberpunk style"}]}],
    "generationConfig": {
      "responseModalities": ["IMAGE"],
      "imageConfig": {"aspectRatio": "16:9", "imageSize": "2K"}
    }
  }'
```

### Node.js

```javascript theme={null}
import fs from "fs";

const API_KEY = "sk-your-api-key";

const response = await fetch(
  "https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent",
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "Futuristic city night view, neon lights, cyberpunk style" }] }],
      generationConfig: {
        responseModalities: ["IMAGE"],
        imageConfig: { aspectRatio: "16:9", imageSize: "2K" }
      }
    })
  }
);

const data = await response.json();
const imgBase64 = data.candidates[0].content.parts[0].inlineData.data;
fs.writeFileSync("output.png", Buffer.from(imgBase64, "base64"));
```

## パラメータのクイックリファレンス

| パラメータ                                      | 型      | 必須  | 説明                                 |
| ------------------------------------------ | ------ | --- | ---------------------------------- |
| `contents[].parts[].text`                  | string | はい  | テキストプロンプト                          |
| `generationConfig.responseModalities`      | array  | はい  | `["IMAGE"]` または `["TEXT","IMAGE"]` |
| `generationConfig.imageConfig.aspectRatio` | string | いいえ | 10種類の比率、デフォルト `1:1`                |
| `generationConfig.imageConfig.imageSize`   | string | いいえ | `1K` / `2K` / `4K`、デフォルト `1K`      |

<Tip>
  詳細なパラメータのドキュメント、使用可能な値、デフォルトについては、右側の Playground のフィールド説明をご覧ください。すべての enum 型フィールド（`aspectRatio`、`imageSize` など）は、ドロップダウン選択に対応しており、手入力は不要です。
</Tip>

<Warning>
  **未対応の機能**

  以下の Google 公式機能は APIYI 経由では **サポートされておらず**、別途課金が必要です。

  * **Google Search によるグラウンディング**: `tools: [{"google_search": {}}]` 経由のリアルタイム検索情報
  * **thinkingConfig**（Thinking モード）: Nano Banana 2 でのみサポートされ、Nano Banana Pro ではサポートされません

  検索グラウンディング機能については、別途課金オプションについてサポートまでお問い合わせください。
</Warning>


## OpenAPI

````yaml api-reference/nano-banana-pro-generate-openapi-en.yaml POST /v1beta/models/gemini-3-pro-image-preview:generateContent
openapi: 3.1.0
info:
  title: Nano Banana Pro Text-to-Image API
  description: >
    Google's image generation model Nano Banana Pro (gemini-3-pro-image-preview)
    — Text-to-Image endpoint.


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
        - Text-to-Image
      summary: 'Text-to-Image: Generate an image from a text prompt'
      description: >
        Generate images using the Nano Banana Pro model based on a text prompt.


        - Only requires a text prompt and generation config

        - Supports 10 aspect ratios and 3 resolutions (1K / 2K / 4K)

        - 4K ultra-HD support, industry-best text rendering

        - For image editing, use the [Image Editing
        endpoint](/en/api-capabilities/nano-banana-image/image-edit)
      operationId: generateNanoBananaProTextToImageEn
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TextToImageRequest'
            example:
              contents:
                - parts:
                    - text: >-
                        A cute cat sitting in a garden, oil painting style, HD
                        details
              generationConfig:
                responseModalities:
                  - IMAGE
                imageConfig:
                  aspectRatio: '16:9'
                  imageSize: 2K
      responses:
        '200':
          description: Image generated successfully
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
    TextToImageRequest:
      type: object
      required:
        - contents
        - generationConfig
      properties:
        contents:
          type: array
          description: Content array containing the text prompt
          items:
            $ref: '#/components/schemas/TextContent'
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
    TextContent:
      type: object
      required:
        - parts
      properties:
        parts:
          type: array
          description: Content parts array
          items:
            $ref: '#/components/schemas/TextPart'
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
    TextPart:
      type: object
      required:
        - text
      properties:
        text:
          type: string
          description: Text prompt describing the image to generate
          example: A cute cat sitting in a garden, oil painting style, HD details
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
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key from APIYI Console

````