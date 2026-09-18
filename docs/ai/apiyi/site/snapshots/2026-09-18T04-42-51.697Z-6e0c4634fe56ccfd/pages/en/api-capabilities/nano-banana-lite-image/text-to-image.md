> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Text-to-Image API Reference

> Nano Banana 2 Lite text-to-image API reference and interactive playground — generate images from text prompts

<Info>
  The interactive Playground on the right supports dropdown selection for parameters (aspect ratio, response type, etc.). Enter your API Key in the **Authorization** field (format: `Bearer sk-xxx`) to send test requests with one click.
</Info>

<Tip>
  **Scope**: This page is for **text-to-image generation**. Just enter a prompt — no image upload required. For editing an existing image, use the [Image Editing endpoint](/en/api-capabilities/nano-banana-lite-image/image-edit).
</Tip>

<Warning>
  **🖥️ Browser Playground limitation (important)**

  This endpoint returns a base64-encoded image (`inlineData.data`, typically several MB) in the response. Due to browser rendering limits, the Playground on the right may show `请求时发生错误: unable to complete request` after the response arrives — **the request actually succeeded**; the browser just can't render such a long base64 string.

  **Recommended workflow** (beginner-friendly):

  * **Copy the Python / Node.js / cURL sample below and run it locally**. The code automatically `base64.b64decode`s the response and **writes the image to a file**.
  * Nano Banana 2 Lite is focused on the 1K canvas, so the response is moderate in size, but running locally is still the safest way to save the image.
</Warning>

<Info>
  All image APIs are **synchronous** — there is no task ID to poll, and if your client disconnects the result is lost while the request is still billed. Set a generous timeout for this model; see [Image API Essentials & Best Practices](/en/api-capabilities/image-api-best-practices).
</Info>

## Code Examples

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

### OpenAI-compatible mode

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

## Parameter Quick Reference

| Parameter                                  | Type   | Required | Description                                  |
| ------------------------------------------ | ------ | -------- | -------------------------------------------- |
| `contents[].parts[].text`                  | string | Yes      | Text prompt                                  |
| `generationConfig.responseModalities`      | array  | Yes      | `["IMAGE"]` or `["TEXT","IMAGE"]`            |
| `generationConfig.imageConfig.aspectRatio` | string | No       | 14 ratios, default `1:1`                     |
| `generationConfig.imageConfig.imageSize`   | string | No       | `1K` only (Lite is focused on the 1K canvas) |

<Tip>
  See the field descriptions in the Playground on the right for detailed parameter docs, allowed values, and defaults. All enum-type fields (like `aspectRatio`) support dropdown selection — no manual typing needed.
</Tip>

<Info>
  **Migrating from Nano Banana 2**: just change the model name from `gemini-3.1-flash-image` to `gemini-3.1-flash-lite-image`; keep other parameters unchanged. Note Lite supports `1K` only — if you pass `2K/4K`, switch back to `1K`.
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