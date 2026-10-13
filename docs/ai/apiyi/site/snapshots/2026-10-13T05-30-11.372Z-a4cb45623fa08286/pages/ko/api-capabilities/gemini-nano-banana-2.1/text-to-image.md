> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 텍스트 투 이미지 API 레퍼런스

> Nano Banana 2.1 텍스트 투 이미지 API 레퍼런스 및 인터랙티브 플레이그라운드 — 텍스트 prompt를 통해 이미지를 생성합니다

<Info>
  오른쪽의 대화형 Playground에서는 매개변수(화면비, 해상도, 응답 유형 등)를 드롭다운으로 선택할 수 있습니다. **Authorization** 필드에 API Key(형식: `Bearer sk-xxx`)를 입력하여 클릭 한 번으로 테스트 요청을 보낼 수 있습니다.
</Info>

<Tip>
  **적용 범위**: 이 페이지는 **텍스트 기반 이미지 생성**을 다룹니다. prompt만 입력하면 되며, 이미지를 업로드할 필요가 없습니다. 기존 이미지를 편집하려면 [이미지 편집 엔드포인트](/ko/api-capabilities/gemini-nano-banana-2.1/image-edit)를 사용하십시오.
</Tip>

<Warning>
  **🖥️ 브라우저 Playground 제한 사항 (중요)**

  이 엔드포인트는 응답에 base64로 인코딩된 이미지(`inlineData.data`, 일반적으로 수 MB)를 반환합니다. 브라우저의 렌더링 제한으로 인해 응답을 받은 후 오른쪽 Playground에 `请求时发生错误: unable to complete request`가 표시될 수 있습니다. **요청은 실제로 성공한 것**이며, 단지 브라우저가 이렇게 긴 base64 문자열을 렌더링하지 못하는 것뿐입니다.

  **권장 워크플로** (초보자 권장):

  * **아래의 Python / Node.js / cURL 예제를 복사하여 로컬에서 실행하십시오**. 코드가 응답을 자동으로 `base64.b64decode`하고 **이미지를 파일로 저장합니다**.
  * 브라우저 내 Playground를 반드시 사용해야 하는 경우, 응답 크기를 줄이기 위해 `imageSize`을(를) 가장 작은 단계(`1K`)로 설정하십시오.
</Warning>

<Info>
  모든 이미지 API는 **동기식**입니다. 폴링할 작업 ID가 없으며, 클라이언트 연결이 끊어지면 결과가 유실되더라도 요청 요금은 과금됩니다. 이 모델에 대해서는 타임아웃을 넉넉하게 설정하십시오. 자세한 내용은 [이미지 API 필수 사항 및 모범 사례](/ko/api-capabilities/image-api-best-practices)를 참조하십시오.
</Info>

## 코드 예제

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

## 파라미터 빠른 참조

| 파라미터 | 타입 | 필수 여부 | 설명 |
| - | - | - | - |
| `contents[].parts[].text` | string | 필수 | 텍스트 prompt |
| `generationConfig.responseModalities` | array | 필수 | `["IMAGE"]` 또는 `["TEXT","IMAGE"]` |
| `generationConfig.imageConfig.aspectRatio` | string | 선택 | 14가지 비율, 생략 시 모델이 콘텐츠를 기반으로 자동 선택하므로 명시적으로 전달하는 것을 권장합니다 |
| `generationConfig.imageConfig.imageSize` | string | 선택 | `1K` / `2K` / `4K` (`512`은 지원되지 않음), 기본값 `1K` |
| `generationConfig.thinkingConfig.thinkingLevel` | string | 선택 | `minimal` / `medium` / `high`, 기본값 `medium` |
| `generationConfig.thinkingConfig.includeThoughts` | boolean | 선택 | 사고 과정 텍스트 반환, 기본값 `false` |

<Tip>
  자세한 파라미터 문서, 허용되는 값 및 기본값은 오른쪽 Playground의 필드 설명을 참조하십시오. 모든 enum 유형 필드(`aspectRatio`, `imageSize`, `thinkingLevel` 등)는 드롭다운 선택을 지원하므로 직접 입력할 필요가 없습니다.
</Tip>

<Info>
  **Google Search 그라운딩**: 요청 최상위 수준에 `"tools": [{"googleSearch": {}}]`를 추가하십시오. 각 검색 쿼리마다 \$0.014가 추가로 과금되며, 실행할 쿼리 수는 모델이 결정합니다. [Nano Banana 2.1 개요](/ko/api-capabilities/gemini-nano-banana-2.1/overview)를 참조하십시오.
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