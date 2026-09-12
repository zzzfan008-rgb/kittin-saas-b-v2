> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# テキストから画像へのAPIリファレンス

> Nano Banana 2 のテキストから画像へのAPIリファレンスとインタラクティブなプレイグラウンド — テキスト prompt から画像を生成します

<Info>
  右側のインタラクティブなプレイグラウンドでは、パラメータ（アスペクト比、解像度、レスポンスタイプなど）をドロップダウンで選択できます。**Authorization** フィールドに API Key を入力し（形式: `Bearer sk-xxx`）、ワンクリックでテストリクエストを送信できます。
</Info>

<Tip>
  **適用範囲**: このページは**テキストから画像への生成**向けです。prompt を入力するだけでよく、画像のアップロードは不要です。既存の画像を編集する場合は、[Image Editing endpoint](/ja/api-capabilities/nano-banana-2-image/image-edit) を使用してください。
</Tip>

<Warning>
  **🖥️ ブラウザプレイグラウンドの制限（重要）**

  この endpoint は、base64 エンコードされた画像（`inlineData.data`、通常は数 MB）をレスポンスで返します。ブラウザのレンダリング制限により、右側のプレイグラウンドではレスポンス到着後に`请求时发生错误: unable to complete request`が表示されることがありますが、**リクエスト自体は実際に成功しています**。単に、ブラウザがそのような長い base64 文字列をレンダリングできないだけです。

  **推奨ワークフロー**（初心者向け）:

  * **下の Python / Node.js / cURL のサンプルをコピーして、ローカルで実行してください**。コードはレスポンスを自動的に`base64.b64decode`sし、**画像を書き出してファイルに保存します**。
  * ブラウザ内のプレイグラウンドを使う必要がある場合は、`imageSize`を最小のティア（例: `512` / `1K`）に設定して、レスポンスを小さくしてください。
</Warning>

<Info>
  すべての画像 API は**同期型**です。ポーリングするタスク ID はなく、クライアントが切断されると、リクエストがまだ課金対象のままでも結果は失われます。このモデルでは十分に長いタイムアウトを設定してください。[Image API Essentials & Best Practices](/ja/api-capabilities/image-api-best-practices) を参照してください。
</Info>

## コード例

### Python

```python theme={null}
import requests
import base64

API_KEY = "sk-your-api-key"
PROMPT = "A cute Shiba Inu sitting under cherry blossom trees, watercolor style, HD details"

response = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent",
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
curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent" \
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
  "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent",
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

## パラメータ クイックリファレンス

| パラメータ                                             | 型   | 必須  | 説明                                            |
| ------------------------------------------------- | --- | --- | --------------------------------------------- |
| `contents[].parts[].text`                         | 文字列 | はい  | テキストプロンプト                                     |
| `generationConfig.responseModalities`             | 配列  | はい  | `["IMAGE"]` または `["TEXT","IMAGE"]`            |
| `generationConfig.imageConfig.aspectRatio`        | 文字列 | いいえ | 14種類の比率、デフォルトは `1:1`                          |
| `generationConfig.imageConfig.imageSize`          | 文字列 | いいえ | `512` / `1K` / `2K` / `4K`、デフォルトは `1K`        |
| `generationConfig.thinkingConfig.thinkingLevel`   | 文字列 | いいえ | `minimal`（高速） / `High`（深い推論）、デフォルトは `minimal` |
| `generationConfig.thinkingConfig.includeThoughts` | 真偽値 | いいえ | 思考プロセスのテキストを返します。デフォルトは `false`               |

<Tip>
  詳細なパラメータドキュメント、使用可能な値、デフォルト値については、右側のプレイグラウンドにある各フィールドの説明をご覧ください。列挙型フィールド（`aspectRatio`、`imageSize`、`thinkingLevel` のようなもの）はすべてドロップダウン選択に対応しており、手動入力は不要です。
</Tip>

<Warning>
  **未対応機能**

  以下の Google 公式機能は APIYI では**サポートされておらず**、別途課金が必要です。

  * **Grounding with Google Search**: `tools: [{"google_search": {}}]` 経由のリアルタイム検索情報
  * **画像検索グラウンディング** (Nano Banana 2 専用): Google の画像検索からのビジュアルコンテキスト

  これらの機能には追加の Google Search API 課金が必要で、APIYI の転送には含まれていません。
</Warning>


## OpenAPI

````yaml api-reference/nano-banana-2-generate-openapi-en.yaml POST /v1beta/models/gemini-3.1-flash-image-preview:generateContent
openapi: 3.1.0
info:
  title: Nano Banana 2 Text-to-Image API
  description: >
    Google's latest image generation model Nano Banana 2
    (gemini-3.1-flash-image-preview) — Text-to-Image endpoint.


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
        - Text-to-Image
      summary: 'Text-to-Image: Generate an image from a text prompt'
      description: >
        Generate images using the Nano Banana 2 model based on a text prompt.


        - Only requires a text prompt and generation config

        - Supports 14 aspect ratios and 4 resolutions (512px / 1K / 2K / 4K)

        - For image editing, use the [Image Editing
        endpoint](/en/api-capabilities/nano-banana-2-image/image-edit)
      operationId: generateNanoBanana2TextToImageEn
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
                        A cute Shiba Inu sitting under cherry blossom trees,
                        watercolor style, HD details
              generationConfig:
                responseModalities:
                  - IMAGE
                imageConfig:
                  aspectRatio: '16:9'
                  imageSize: 2K
      responses:
        '200':
          description: Successfully generated image
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
          description: Content array containing text prompts
          items:
            $ref: '#/components/schemas/TextContent'
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
    TextPart:
      type: object
      required:
        - text
      properties:
        text:
          type: string
          description: Text prompt describing the image to generate
          example: >-
            A cute Shiba Inu sitting under cherry blossom trees, watercolor
            style
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
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key obtained from APIYI Console

````