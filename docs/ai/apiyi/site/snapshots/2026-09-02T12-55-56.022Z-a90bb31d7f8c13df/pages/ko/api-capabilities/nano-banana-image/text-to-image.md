> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Text-to-Image API 참고

> Nano Banana Pro 텍스트-이미지 API 참고 및 대화형 플레이그라운드 — text prompt로 이미지를 생성합니다

<Info>
  오른쪽의 인터랙티브 플레이그라운드에서는 매개변수(종횡비, 해상도, 응답 유형 등)를 드롭다운으로 선택할 수 있습니다. 테스트 요청을 한 번에 보내려면 **Authorization** 필드에 API Key를 입력하십시오(형식: `Bearer sk-xxx`).
</Info>

<Tip>
  **범위**: 이 페이지는 **텍스트-투-이미지 생성**용입니다. 프롬프트만 입력하면 되며, 이미지 업로드는 필요하지 않습니다. 기존 이미지를 편집하려면 [이미지 편집 엔드포인트](/ko/api-capabilities/nano-banana-image/image-edit)를 사용하십시오.
</Tip>

<Warning>
  **🖥️ 브라우저 플레이그라운드 제한(중요)**

  이 엔드포인트는 응답으로 base64로 인코딩된 이미지(`inlineData.data`, 일반적으로 수 MB)를 반환합니다. 브라우저 렌더링 한계 때문에 오른쪽의 플레이그라운드에는 응답이 도착한 뒤 `请求时发生错误: unable to complete request`가 표시될 수 있습니다 — **요청은 실제로 성공했습니다**. 브라우저가 이렇게 긴 base64 문자열을 렌더링할 수 없을 뿐입니다.

  **권장 작업 흐름**(초보자 친화적):

  * 아래의 Python / Node.js / cURL 샘플을 복사해 로컬에서 실행하십시오. 코드는 응답을 자동으로 `base64.b64decode`하고 **이미지를 파일로 저장합니다**.
  * 브라우저 내 플레이그라운드를 반드시 사용해야 한다면, `imageSize`를 가장 작은 티어(예: `1K`)로 설정하여 응답을 줄이십시오.
</Warning>

<Info>
  모든 이미지 API는 **동기식**입니다. 즉, 폴링할 작업 ID가 없으며, 클라이언트가 연결을 끊으면 요청은 계속 과금되지만 결과는 사라집니다. 이 모델에는 충분히 넉넉한 타임아웃을 설정하십시오. 자세한 내용은 [이미지 API 필수 사항 및 모범 사례](/ko/api-capabilities/image-api-best-practices)를 참조하십시오.
</Info>

## 코드 예제

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

## 매개변수 빠른 참조

| 매개변수                                       | 유형     | 필수  | 설명                                |
| ------------------------------------------ | ------ | --- | --------------------------------- |
| `contents[].parts[].text`                  | string | Yes | 텍스트 프롬프트                          |
| `generationConfig.responseModalities`      | array  | Yes | `["IMAGE"]` 또는 `["TEXT","IMAGE"]` |
| `generationConfig.imageConfig.aspectRatio` | string | No  | 10가지 비율, 기본값 `1:1`                |
| `generationConfig.imageConfig.imageSize`   | string | No  | `1K` / `2K` / `4K`, 기본값 `1K`      |

<Tip>
  자세한 매개변수 문서, 허용 값, 기본값은 오른쪽 Playground의 필드 설명을 참조하십시오. `aspectRatio`, `imageSize` 같은 모든 enum 유형 필드는 드롭다운 선택을 지원하므로 수동 입력이 필요하지 않습니다.
</Tip>

<Warning>
  **지원되지 않는 기능**

  다음 Google 공식 기능은 APIYI를 통해서는 **지원되지 않으며** 별도의 과금이 필요합니다:

  * **Google Search를 통한 Grounding**: `tools: [{"google_search": {}}]`를 통한 실시간 검색 정보
  * **thinkingConfig**(Thinking 모드): Nano Banana 2에서만 지원되며, Nano Banana Pro에서는 지원되지 않음

  검색 grounding 기능에 대해서는 별도의 과금 옵션은 지원팀에 문의해 주십시오.
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