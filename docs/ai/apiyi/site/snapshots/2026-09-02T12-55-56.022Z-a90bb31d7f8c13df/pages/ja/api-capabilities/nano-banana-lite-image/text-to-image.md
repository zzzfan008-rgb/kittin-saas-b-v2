> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Text-to-Image API リファレンス

> Nano Banana 2 Lite の text-to-image API リファレンスとインタラクティブなプレイグラウンド — text prompt から画像を生成します

<Info>
  右側のインタラクティブな Playground では、パラメータ（アスペクト比、レスポンス形式など）をドロップダウンで選択できます。**Authorization** フィールドに API Key を入力し（形式: `Bearer sk-xxx`）、ワンクリックでテストリクエストを送信できます。
</Info>

<Tip>
  **適用範囲**: このページは **テキストから画像生成** 用です。prompt を入力するだけでよく、画像のアップロードは不要です。既存の画像を編集する場合は、[Image Editing endpoint](/ja/api-capabilities/nano-banana-lite-image/image-edit) を使用してください。
</Tip>

<Warning>
  **🖥️ ブラウザ Playground の制限（重要）**

  この endpoint は、レスポンス内で base64 エンコードされた画像（`inlineData.data`、通常は数 MB）を返します。ブラウザのレンダリング制限により、右側の Playground ではレスポンス到着後に `请求时发生错误: unable to complete request` と表示されることがありますが、**リクエスト自体は実際には成功しています**。ブラウザがそのような長い base64 文字列をレンダリングできないだけです。

  **推奨ワークフロー**（初心者向け）:

  * **下の Python / Node.js / cURL サンプルをコピーしてローカルで実行してください**。コードはレスポンスを自動的に`base64.b64decode`sし、**画像をファイルに書き込みます**。
  * Nano Banana 2 Lite は 1K キャンバスに最適化されているため、レスポンスサイズは比較的控えめですが、それでも画像を保存するにはローカル実行が最も安全です。
</Warning>

<Info>
  すべての image API は **同期式** です。ポーリングするタスク ID はなく、クライアントが切断されると、リクエストがまだ課金対象のままであっても結果は失われます。このモデルでは十分に長いタイムアウトを設定してください。[Image API Essentials & Best Practices](/ja/api-capabilities/image-api-best-practices) を参照してください。
</Info>

## コード例

### Python

```python theme={null}
import requests
import base64

API_KEY = "sk-your-api-key"
PROMPT = "A cute Shiba Inu sitting under cherry blossom trees, watercolor style, HD details"

response = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent",
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json={
        "contents": [{"parts": [{"text": PROMPT}]}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": "16:9", "imageSize": "1K"}
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
curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{"parts": [{"text": "Futuristic city night view, neon lights, cyberpunk style"}]}],
    "generationConfig": {
      "responseModalities": ["IMAGE"],
      "imageConfig": {"aspectRatio": "16:9", "imageSize": "1K"}
    }
  }'
```

### Node.js

```javascript theme={null}
import fs from "fs";

const API_KEY = "sk-your-api-key";

const response = await fetch(
  "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent",
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
        imageConfig: { aspectRatio: "16:9", imageSize: "1K" }
      }
    })
  }
);

const data = await response.json();
const imgBase64 = data.candidates[0].content.parts[0].inlineData.data;
fs.writeFileSync("output.png", Buffer.from(imgBase64, "base64"));
```

### OpenAI 互換モード

```python theme={null}
from openai import OpenAI

client = OpenAI(api_key="sk-your-api-key", base_url="https://api.apiyi.com/v1")

response = client.chat.completions.create(
    model="gemini-3.1-flash-lite-image",
    stream=False,
    messages=[{"role": "user", "content": "An autumn landscape painting with red leaves and birds in the distance"}]
)

print(response.choices[0].message.content)
```

## パラメータのクイックリファレンス

| パラメータ                                      | 型   | 必須  | 説明                                 |
| ------------------------------------------ | --- | --- | ---------------------------------- |
| `contents[].parts[].text`                  | 文字列 | はい  | テキストプロンプト                          |
| `generationConfig.responseModalities`      | 配列  | はい  | `["IMAGE"]` または `["TEXT","IMAGE"]` |
| `generationConfig.imageConfig.aspectRatio` | 文字列 | いいえ | 14種類のアスペクト比、デフォルトは `1:1`           |
| `generationConfig.imageConfig.imageSize`   | 文字列 | いいえ | `1K` のみ（Liteは1Kキャンバスに重点を置いています）    |

<Tip>
  詳細なパラメータドキュメント、使用可能な値、デフォルトは右側のプレイグラウンドのフィールド説明をご覧ください。列挙型のすべてのフィールド（`aspectRatio` など）はドロップダウン選択に対応しており、手動入力は不要です。
</Tip>

<Info>
  **Nano Banana 2 からの移行**: モデル名を`gemini-3.1-flash-image`から`gemini-3.1-flash-lite-image`に変更するだけで、他のパラメータは変更しないでください。Liteは`1K` のみをサポートしています。`2K/4K` を渡す場合は、`1K` に戻してください。
</Info>


## OpenAPI

````yaml api-reference/nano-banana-lite-generate-openapi-en.yaml POST /v1beta/models/gemini-3.1-flash-lite-image:generateContent
openapi: 3.1.0
info:
  title: Nano Banana 2 Lite Text-to-Image API
  description: >
    Google's fastest, most efficient image model Nano Banana 2 Lite
    (gemini-3.1-flash-lite-image) — text-to-image endpoint.


    ~4s per image, focused on the 1K canvas, 14 aspect ratios.


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
        - Text-to-Image
      summary: 'Text-to-image: generate an image from a text description'
      description: >
        Use the Nano Banana 2 Lite model to generate images from text prompts.


        - Only a prompt (`text`) and generation config are required

        - Supports 14 aspect ratios, focused on 1K resolution

        - For image editing, use the [image editing
        endpoint](/en/api-capabilities/nano-banana-lite-image/image-edit)
      operationId: generateNanoBananaLiteTextToImage
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
                        A cute Shiba Inu sitting under cherry blossoms,
                        watercolor style, high detail
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
    TextContent:
      type: object
      required:
        - parts
      properties:
        parts:
          type: array
          description: Array of content parts
          items:
            $ref: '#/components/schemas/TextPart'
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
    TextPart:
      type: object
      required:
        - text
      properties:
        text:
          type: string
          description: Text prompt describing the image to generate
          example: A cute Shiba Inu sitting under cherry blossoms, watercolor style
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
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key obtained from the APIYI console

````