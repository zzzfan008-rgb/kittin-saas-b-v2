> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 이미지 편집 API 레퍼런스

> Nano Banana 2 Lite 이미지 편집 API 레퍼런스 및 대화형 플레이그라운드 — 이미지와 지시사항을 제공하여 편집된 결과를 생성합니다

<Info>
  오른쪽의 대화형 플레이그라운드는 매개변수에 대한 드롭다운 선택을 지원합니다. **Authorization** 필드에 API 키를 입력하고(형식: `Bearer sk-xxx`) 한 번의 클릭으로 테스트 요청을 보냅니다.
</Info>

<Tip>
  **범위**: 이 페이지는 **이미지 편집**용입니다. 편집 지침과 함께 입력 이미지(base64로 인코딩됨)를 제공해야 합니다. 텍스트만으로 새 이미지를 생성하려면 [텍스트-이미지 엔드포인트](/ko/api-capabilities/nano-banana-lite-image/text-to-image)를 사용하십시오.
</Tip>

<Warning>
  **🖥️ 브라우저 플레이그라운드 제한(중요)**

  이 엔드포인트는 응답에 base64로 인코딩된 이미지(`inlineData.data`, 일반적으로 수 MB)를 반환합니다. 브라우저 렌더링 제한 때문에 오른쪽 플레이그라운드에 응답이 도착한 뒤 `请求时发生错误: unable to complete request`가 표시될 수 있습니다. — **요청은 실제로 성공했습니다**; 브라우저가 이렇게 긴 base64 문자열을 렌더링할 수 없을 뿐입니다.

  **권장 워크플로**(초보자 친화적):

  * **아래의 Python / Node.js / cURL 샘플을 복사해 로컬에서 실행하십시오**. 코드는 응답을 자동으로 `base64.b64decode`s하고 **이미지를 파일에 씁니다**.
  * 반드시 브라우저 내 플레이그라운드를 사용해야 한다면, \*\*아주 작은 참조 이미지(50KB 미만)\*\*를 사용해 응답 크기를 줄이십시오.
</Warning>

<Warning>
  **⚠️ `parts` 배열 구조(중요 — 다중 이미지 편집 시 읽으십시오)**

  각 `part`는 **`text` 또는 `inlineData` 중 하나여야 하며, 둘 다일 수는 없습니다**. 이는 Google의 공식 `gemini-3.1-flash-lite-image` 계약과 일치합니다.

  **올바른 예**: 하나의 텍스트 부분(지침) + N개의 inlineData 부분(이미지당 하나씩):

  ```json theme={null}
  "contents": [{
    "parts": [
      {"text": "Combine the people from these two images into one office scene"},
      {"inlineData": {"mimeType": "image/png", "data": "<BASE64_DATA_IMG_1>"}},
      {"inlineData": {"mimeType": "image/png", "data": "<BASE64_DATA_IMG_2>"}}
    ]
  }]
  ```

  **잘못된 예**(각 부분에 `text`와 `inlineData`가 모두 포함됨 — 정의되지 않은 동작을 일으킵니다):

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
  **🖼️ `inlineData.data` 필드에 대하여**

  이 엔드포인트는 **JSON 형식**(multipart 파일 업로드가 아님)을 사용하므로, 플레이그라운드에서 로컬 파일을 직접 선택할 수 없습니다. 먼저 이미지를 **Base64 문자열**로 변환한 다음, `data` 입력란에 붙여넣어야 합니다.

  **한 줄 명령: 변환 + 클립보드에 복사**:

  ```bash theme={null}
  # macOS
  base64 -i your-image.jpg | tr -d '\n' | pbcopy

  # Linux
  base64 -w0 your-image.jpg | xclip -selection clipboard

  # Windows PowerShell
  [Convert]::ToBase64String([IO.File]::ReadAllBytes("your-image.jpg")) | Set-Clipboard
  ```

  실행한 뒤에는 `Cmd+V` / `Ctrl+V`를 복사해 플레이그라운드의 `data` 필드에 붙여넣으면 됩니다. 또한 `mimeType`를 일치하는 `image/jpeg` 또는 `image/png`로 설정하는 것도 기억하십시오.

  **권장 사항**: 브라우저가 긴 base64 문자열 때문에 느려지는 것을 피하려면 테스트에는 작은 이미지(200KB 미만)를 사용하십시오. 이미지 편집 테스트를 자주 수행한다면, 대신 아래 코드 예제를 사용해 로컬에서 실행하십시오.
</Warning>

## 코드 예제

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

## 다중 이미지 편집

여러 입력 이미지를 병합하거나 비교할 때는 **하나의 `text` 부분**(지시문) 뒤에 **여러 `inlineData` 부분**(이미지당 하나씩)을 사용합니다.

### Python (다중 이미지)

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

## 매개변수 빠른 참조

| 매개변수                                       | 유형     | 필수  | 설명                                                                                                |
| ------------------------------------------ | ------ | --- | ------------------------------------------------------------------------------------------------- |
| `contents[].parts`                         | array  | Yes | **1 text part + N inlineData parts**로 구성됩니다. 각 파트에는 `text` 또는 `inlineData` 중 하나만 포함되며 — 둘 다는 아닙니다 |
| `contents[].parts[].text`                  | string | Yes | 편집 지시문(첫 번째 파트에만 넣습니다)                                                                            |
| `contents[].parts[].inlineData.mimeType`   | string | Yes | `image/jpeg` 또는 `image/png`                                                                       |
| `contents[].parts[].inlineData.data`       | string | Yes | Base64로 인코딩된 이미지(다중 이미지 편집에서는 이미지마다 inlineData 파트를 하나씩 반복합니다)                                     |
| `generationConfig.responseModalities`      | array  | Yes | 일반적으로 `["IMAGE"]`                                                                                 |
| `generationConfig.imageConfig.aspectRatio` | string | No  | 14개의 비율, 기본값 `1:1`                                                                                |
| `generationConfig.imageConfig.imageSize`   | string | No  | `1K`만 해당(Lite는 1K 캔버스에 집중됩니다)                                                                     |

## 다중 턴 대화형 편집

Nano Banana 2 Lite (`gemini-3.1-flash-lite-image`)는 **대화형 다중 턴 편집**을 지원합니다. 각 턴에서 생성된 이미지를 `contents`에 \*\*`role: "model"` `inlineData`\*\*로 다시 추가한 다음, 다음 사용자 지시를 전송합니다. 모델은 **전체 대화 기록**을 바탕으로 편집하고 변경 사항을 **누적**합니다(예: 먼저 소파의 색을 바꾸고, 그다음 액세서리를 추가하면 이전 변경 사항이 유지됩니다).

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
  **기존 이미지에서 다중 턴을 시작합니다**: 기존 사진을 편집하기 위해 첫 번째 사용자 메시지에 `inlineData`(본인 이미지)와 지시사항을 넣고, 이후 각 턴마다 모델 출력을 `contents`에 계속 다시 채워 넣습니다.
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