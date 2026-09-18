> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Image Editing API Reference

> Nano Banana 2 image editing API reference and interactive playground — provide an image + instruction to generate an edited result

<Info>
  The interactive Playground on the right supports dropdown selection for parameters. Enter your API Key in the **Authorization** field (format: `Bearer sk-xxx`) to send test requests with one click.
</Info>

<Tip>
  **Scope**: This page is for **image editing**. You must provide an input image (base64-encoded) along with edit instructions. To generate a new image from text only, use the [Text-to-Image endpoint](/en/api-capabilities/nano-banana-2-image/text-to-image).
</Tip>

<Warning>
  **🖥️ Browser Playground limitation (important)**

  This endpoint returns a base64-encoded image (`inlineData.data`, typically several MB) in the response. Due to browser rendering limits, the Playground on the right may show `请求时发生错误: unable to complete request` after the response arrives — **the request actually succeeded**; the browser just can't render such a long base64 string.

  **Recommended workflow** (beginner-friendly):

  * **Copy the Python / Node.js / cURL sample below and run it locally**. The code automatically `base64.b64decode`s the response and **writes the image to a file**.
  * If you must use the in-browser Playground, **use a tiny reference image (\< 50KB)** and set `imageSize` to the smallest tier (e.g. `512` / `1K`).
</Warning>

<Warning>
  **⚠️ `parts` array structure (important — read this for multi-image edits)**

  Each `part` must be **either a `text` or an `inlineData`, never both**. This matches Google's official `gemini-3.1-flash-image-preview` contract.

  **Correct**: one text part (the instruction) + N inlineData parts (one per image):

  ```json theme={null}
  "contents": [{
    "parts": [
      {"text": "Combine the people from these two images into one office scene"},
      {"inlineData": {"mimeType": "image/png", "data": "<BASE64_DATA_IMG_1>"}},
      {"inlineData": {"mimeType": "image/png", "data": "<BASE64_DATA_IMG_2>"}}
    ]
  }]
  ```

  **Incorrect** (each part contains both `text` and `inlineData` — produces undefined behavior):

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
  **🖼️ About the `inlineData.data` field**

  This endpoint uses **JSON format** (not multipart file upload), so the Playground cannot directly select local files. You need to convert your image to a **Base64 string** first, then paste it into the `data` input.

  **One-line command: convert + copy to clipboard**:

  ```bash theme={null}
  # macOS
  base64 -i your-image.jpg | tr -d '\n' | pbcopy

  # Linux
  base64 -w0 your-image.jpg | xclip -selection clipboard

  # Windows PowerShell
  [Convert]::ToBase64String([IO.File]::ReadAllBytes("your-image.jpg")) | Set-Clipboard
  ```

  After running, just `Cmd+V` / `Ctrl+V` paste into the `data` field in the Playground. Also remember to set `mimeType` to the matching `image/jpeg` or `image/png`.

  **Recommendation**: Use small images (\< 200KB) for testing to avoid browser lag from long base64 strings. For frequent image editing tests, use the code examples below to run locally instead.
</Warning>

## Code Examples

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

## Multi-Image Editing

When merging or comparing several input images, use **a single `text` part** (the instruction) followed by **multiple `inlineData` parts** (one per image).

### Python (multi-image)

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

### cURL (multi-image, mirrors Google's official format)

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

## Parameter Quick Reference

| Parameter                                         | Type    | Required | Description                                                                                                     |
| ------------------------------------------------- | ------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `contents[].parts`                                | array   | Yes      | Composed of **1 text part + N inlineData parts**. Each part contains either `text` or `inlineData` — never both |
| `contents[].parts[].text`                         | string  | Yes      | Edit instruction (place it in the first part only)                                                              |
| `contents[].parts[].inlineData.mimeType`          | string  | Yes      | `image/jpeg` or `image/png`                                                                                     |
| `contents[].parts[].inlineData.data`              | string  | Yes      | Base64-encoded image (repeat one inlineData part per image for multi-image edits)                               |
| `generationConfig.responseModalities`             | array   | Yes      | Usually `["IMAGE"]`                                                                                             |
| `generationConfig.imageConfig.aspectRatio`        | string  | No       | 14 ratios, default `1:1`                                                                                        |
| `generationConfig.imageConfig.imageSize`          | string  | No       | `512` / `1K` / `2K` / `4K`, default `1K`                                                                        |
| `generationConfig.thinkingConfig.thinkingLevel`   | string  | No       | `minimal` (fast) / `High` (deep reasoning)                                                                      |
| `generationConfig.thinkingConfig.includeThoughts` | boolean | No       | Return thinking process text                                                                                    |

## Multi-turn conversational editing

Nano Banana 2 (`gemini-3.1-flash-image-preview`) supports **true conversational multi-turn editing**: append each turn's generated image back into `contents` as a **`role: "model"` `inlineData`**, then send the next user instruction. The model edits based on the **full conversation history** and **accumulates changes** (e.g. first recolor the sofa, then add an accessory — the earlier change is preserved).

<Info>
  This differs from reverse image models: the native Gemini format genuinely reads images from `model`-role history turns. For cross-turn consistency and step-by-step refinement, use the history-backfill pattern below.
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
  **Start multi-turn from an existing image**: put an `inlineData` (your own image) plus an instruction in the first user message to edit an existing photo, then keep backfilling the model output into `contents` each turn.
</Tip>

<Note>
  **Two multi-turn styles**:

  * **History backfill (above, recommended)**: `contents` keeps the alternating user/model history — accumulates changes across turns with better consistency.
  * **Re-feed (simpler)**: each turn sends a single user message (`text` + the previous image's `inlineData`) for one-step edits, without carrying earlier context.
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