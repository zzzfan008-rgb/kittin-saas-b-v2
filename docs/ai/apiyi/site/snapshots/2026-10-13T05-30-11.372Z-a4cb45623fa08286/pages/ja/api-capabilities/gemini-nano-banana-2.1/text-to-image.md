> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# テキストから画像生成 API リファレンス

> Nano Banana 2.1 テキストから画像生成 API リファレンスとインタラクティブなプレイグラウンド — テキスト prompt から画像を生成します

<Info>
  右側のインタラクティブなPlaygroundでは、パラメータ（アスペクト比、解像度、レスポンスタイプなど）のドロップダウン選択に対応しています。**Authorization**フィールドにAPIキー（形式: `Bearer sk-xxx`）を入力すると、ワンクリックでテストリクエストを送信できます。
</Info>

<Tip>
  **対象範囲**: 本ページは**テキストからの画像生成**向けです。promptを入力するだけで利用でき、画像のアップロードは不要です。既存の画像を編集する場合は、[画像編集エンドポイント](/ja/api-capabilities/gemini-nano-banana-2.1/image-edit)をご利用ください。
</Tip>

<Warning>
  **🖥️ ブラウザPlaygroundの制限事項（重要）**

  このエンドポイントは、レスポンス内にbase64エンコードされた画像（`inlineData.data`、通常は数MB）を返します。ブラウザのレンダリング制限により、レスポンスの受信後に右側のPlaygroundに`请求时发生错误: unable to complete request`と表示される場合がありますが、**リクエスト自体は正常に成功しています**。単にブラウザがこれほど長いbase64文字列をレンダリングできないだけです。

  **推奨ワークフロー**（初心者向け）:

  * **下記のPython / Node.js / cURLサンプルをコピーしてローカルで実行してください**。コードが自動的にレスポンスを`base64.b64decode`し、**画像をファイルに書き込みます**。
  * ブラウザ内のPlaygroundを使用する必要がある場合は、`imageSize`を最小レベル（`1K`）に設定してレスポンスサイズを抑えてください。
</Warning>

<Info>
  すべての画像APIは**同期型**です。ポーリング用のタスクIDは存在せず、クライアントの接続が切断された場合、リクエストに対して課金が発生したまま結果が失われます。このモデルには余裕を持ったタイムアウト時間を設定してください。詳細は[画像APIの基本とベストプラクティス](/ja/api-capabilities/image-api-best-practices)をご参照ください。
</Info>

## コード例

### Python

```python theme={null}
import requests
import base64

API_KEY = "sk-your-api-key"
PROMPT = "A cute Shiba Inu sitting under cherry blossom trees, watercolor style, HD details"

response = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-nano-banana-2.1:generateContent",
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

img_data = [p for p in response["candidates"][0]["content"]["parts"] if "inlineData" in p][-1]["inlineData"]["data"]
with open("output.png", 'wb') as f:
    f.write(base64.b64decode(img_data))
print("Image saved to output.png")
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1beta/models/gemini-nano-banana-2.1:generateContent" \
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
  "https://api.apiyi.com/v1beta/models/gemini-nano-banana-2.1:generateContent",
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
const imgBase64 = data.candidates[0].content.parts.filter((p) => p.inlineData).at(-1).inlineData.data;
fs.writeFileSync("output.png", Buffer.from(imgBase64, "base64"));
```

## パラメータクイックリファレンス

| パラメータ | 型 | 必須 | 説明 |
| - | - | - | - |
| `contents[].parts[].text` | string | はい | テキスト prompt |
| `generationConfig.responseModalities` | array | はい | `["IMAGE"]` または `["TEXT","IMAGE"]` |
| `generationConfig.imageConfig.aspectRatio` | string | いいえ | 14種類のアスペクト比。省略した場合、モデルがコンテンツに基づいて選択するため、明示的に指定してください |
| `generationConfig.imageConfig.imageSize` | string | いいえ | `1K` / `2K` / `4K`（`512` は非対応）、デフォルトは `1K` |
| `generationConfig.thinkingConfig.thinkingLevel` | string | いいえ | `minimal` / `medium` / `high`、デフォルトは `medium` |
| `generationConfig.thinkingConfig.includeThoughts` | boolean | いいえ | 思考プロセスのテキストを返します。デフォルトは `false` |

<Tip>
  詳細なパラメータドキュメント、許容値、およびデフォルト値については、右側の Playground にあるフィールドの説明を参照してください。すべての enum 型フィールド（`aspectRatio`、`imageSize`、`thinkingLevel` など）はドロップダウン選択に対応しており、手動での入力は不要です。
</Tip>

<Info>
  **Google Search grounding**: リクエストのトップレベルに `"tools": [{"googleSearch": {}}]` を追加します。検索クエリごとに \$0.014 が追加で課金され、モデルが実行するクエリ数を決定します。[Nano Banana 2.1 の概要](/ja/api-capabilities/gemini-nano-banana-2.1/overview)を参照してください。
</Info>


## OpenAPI

````yaml api-reference/gemini-nano-banana-2.1-generate-openapi-en.yaml POST /v1beta/models/gemini-nano-banana-2.1:generateContent
openapi: 3.1.0
info:
  title: Nano Banana 2.1 Text-to-Image API
  description: >
    Google image generation model Nano Banana 2.1 (gemini-nano-banana-2.1) —
    Text-to-Image endpoint.


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
        - Text-to-Image
      summary: 'Text-to-Image: Generate an image from a text prompt'
      description: >
        Generate images using the Nano Banana 2.1 model based on a text prompt.


        - Only requires a text prompt and generation config

        - Supports 14 aspect ratios and 3 resolutions (1K / 2K / 4K)

        - For image editing, use the [Image Editing
        endpoint](/en/api-capabilities/gemini-nano-banana-2.1/image-edit)
      operationId: generateNanoBanana21TextToImageEn
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
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key obtained from APIYI Console

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.