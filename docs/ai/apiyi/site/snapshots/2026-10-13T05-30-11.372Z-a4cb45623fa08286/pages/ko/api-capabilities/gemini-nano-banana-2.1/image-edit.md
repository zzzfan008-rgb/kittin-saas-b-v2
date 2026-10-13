> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 이미지 편집 API 레퍼런스

> Nano Banana 2.1 이미지 편집 API 레퍼런스 및 대화형 플레이그라운드 — 이미지와 지시사항을 제공하여 편집된 결과를 생성합니다

<Info>
  오른쪽의 대화형 Playground는 매개변수의 드롭다운 선택을 지원합니다. **Authorization** 필드에 API Key를 입력(형식: `Bearer sk-xxx`)하면 클릭 한 번으로 테스트 요청을 전송할 수 있습니다.
</Info>

<Tip>
  **범위**: 이 페이지는 **이미지 편집** 전용입니다. 편집 지시 사항과 함께 입력 이미지(base64 인코딩)를 제공해야 합니다. 텍스트만으로 새 이미지를 생성하려면 [텍스트-이미지 생성 엔드포인트](/ko/api-capabilities/gemini-nano-banana-2.1/text-to-image)를 사용하십시오.
</Tip>

<Warning>
  **🖥️ 브라우저 Playground 제한 사항(중요)**

  이 엔드포인트는 응답으로 base64로 인코딩된 이미지(`inlineData.data`, 일반적으로 수 MB)를 반환합니다. 브라우저 렌더링 제한으로 인해 응답이 수신된 후 오른쪽 Playground에 `请求时发生错误: unable to complete request`가 표시될 수 있습니다. **요청은 실제로 성공한 것이며**, 브라우저가 이처럼 긴 base64 문자열을 렌더링하지 못하는 것뿐입니다.

  **권장 워크플로**(초보자 친화적):

  * **아래의 Python / Node.js / cURL 샘플을 복사하여 로컬에서 실행하십시오**. 코드가 자동으로 응답을 `base64.b64decode`하고 **이미지를 파일로 저장합니다**.
  * 브라우저 내 Playground를 반드시 사용해야 하는 경우, **초소형 참조 이미지(\< 50KB)를 사용**하고 `imageSize`를 가장 작은 티어(`1K`)로 설정하십시오.
</Warning>

<Warning>
  **⚠️ `parts` 배열 구조(중요 — 다중 이미지 편집 시 필독)**

  각 `part`은 **`text` 또는 `inlineData` 중 하나여야 하며, 둘 다 포함해서는 안 됩니다**. 이는 Google의 공식 `gemini-nano-banana-2.1` 규격과 일치합니다.

  **올바른 형식**: 하나의 텍스트 파트(지시 사항) + N개의 inlineData 파트(이미지당 하나):

  ```json theme={null}
  "contents": [{
    "parts": [
      {"text": "Combine the people from these two images into one office scene"},
      {"inlineData": {"mimeType": "image/png", "data": "<BASE64_DATA_IMG_1>"}},
      {"inlineData": {"mimeType": "image/png", "data": "<BASE64_DATA_IMG_2>"}}
    ]
  }]
  ```

  **잘못된 형식**(각 파트에 `text`와 `inlineData`가 모두 포함됨 — 정의되지 않은 동작 발생):

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
  **🖼️ `inlineData.data` 필드 안내**

  이 엔드포인트는 **JSON 형식**을 사용하므로(multipart 파일 업로드가 아님), Playground에서 로컬 파일을 직접 선택할 수 없습니다. 먼저 이미지를 **Base64 문자열**로 변환한 다음, `data` 입력란에 붙여넣어야 합니다.

  **한 줄 명령어: 변환 + 클립보드에 복사**:

  ```bash theme={null}
  # macOS
  base64 -i your-image.jpg | tr -d '\n' | pbcopy

  # Linux
  base64 -w0 your-image.jpg | xclip -selection clipboard

  # Windows PowerShell
  [Convert]::ToBase64String([IO.File]::ReadAllBytes("your-image.jpg")) | Set-Clipboard
  ```

  실행 후 Playground의 `data` 필드에 `Cmd+V` / `Ctrl+V`로 붙여넣기만 하면 됩니다. 또한 `mimeType`를 일치하는 `image/jpeg` 또는 `image/png`로 설정해야 합니다.

  **권장 사항**: 긴 base64 문자열로 인한 브라우저 랙을 방지하려면 테스트 시 작은 이미지(\< 200KB)를 사용하십시오. 이미지 편집 테스트를 자주 진행하는 경우, 아래의 코드 예제를 활용하여 로컬에서 실행하십시오.
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

## 다중 이미지 편집

여러 입력 이미지를 병합하거나 비교할 때는 **단일 `text` 파트**(지시 사항) 뒤에 **여러 개의 `inlineData` 파트**(이미지당 1개)를 사용합니다.

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

### cURL (다중 이미지, Google 공식 형식 반영)

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

## 파라미터 빠른 참조

| 파라미터 | 타입 | 필수 여부 | 설명 |
| - | - | - | - |
| `contents[].parts` | 배열 | 예 | **1개의 text 파트 + N개의 inlineData 파트**로 구성됩니다. 각 파트에는 `text` 또는 `inlineData` 중 하나만 포함되며, 둘 다 포함될 수는 없습니다 |
| `contents[].parts[].text` | 문자열 | 예 | 편집 지시문(첫 번째 파트에만 배치합니다) |
| `contents[].parts[].inlineData.mimeType` | 문자열 | 예 | `image/jpeg` 또는 `image/png` |
| `contents[].parts[].inlineData.data` | 문자열 | 예 | base64로 인코딩된 이미지(다중 이미지 편집 시 이미지당 하나의 inlineData 파트를 반복합니다) |
| `generationConfig.responseModalities` | 배열 | 예 | 일반적으로 `["IMAGE"]` |
| `generationConfig.imageConfig.aspectRatio` | 문자열 | 아니요 | 14가지 비율 지원. 생략 시 모델이 콘텐츠에 따라 선택하므로 명시적으로 전달하십시오 |
| `generationConfig.imageConfig.imageSize` | 문자열 | 아니요 | `1K` / `2K` / `4K` (`512`은 지원되지 않음), 기본값 `1K` |
| `generationConfig.thinkingConfig.thinkingLevel` | 문자열 | 아니요 | `minimal` / `medium` / `high`, 기본값 `medium` |
| `generationConfig.thinkingConfig.includeThoughts` | 불리언 | 아니요 | 사고 과정 텍스트를 반환합니다 |

## 멀티턴 대화형 편집

Nano Banana 2.1(`gemini-nano-banana-2.1`)은 **진정한 대화형 멀티턴 편집**을 지원합니다. 각 턴에서 생성된 이미지를 **`role: "model"` `inlineData`** 형태로 `contents`에 다시 추가한 후, 다음 사용자 지시를 전송하십시오. 모델은 **전체 대화 기록**을 기반으로 편집하며 **변경 사항을 누적**합니다(예: 먼저 소파 색상을 변경한 다음 액세서리를 추가하면 이전 변경 사항이 유지됩니다).

<Info>
  이는 역방향 이미지 모델과 다릅니다. 네이티브 Gemini 형식은 `model` 역할의 대화 기록 턴에서 이미지를 실제로 읽어들입니다. 턴 간 일관성과 단계별 정교화를 위해 아래의 히스토리 백필(history-backfill) 패턴을 사용하십시오.
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
  **기존 이미지에서 멀티턴 시작**: 첫 번째 사용자 메시지에 `inlineData`(보유한 이미지)와 지시사항을 함께 넣어 기존 사진을 편집한 다음, 매 턴마다 모델 출력을 `contents`에 계속 백필하십시오.
</Tip>

<Note>
  **두 가지 멀티턴 방식**:

  * **히스토리 백필(위 방식, 권장)**: `contents`에서 사용자/모델 대화 기록을 번갈아 유지합니다. 더 우수한 일관성으로 여러 턴에 걸쳐 변경 사항을 누적합니다.
  * **재전송(더 단순함)**: 이전 컨텍스트를 유지하지 않고 단일 단계 편집을 위해 매 턴마다 단일 사용자 메시지(`text` + 이전 이미지의 `inlineData`)를 전송합니다.
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