> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 텍스트-이미지 API 레퍼런스

> Nano Banana 2 Lite 텍스트-이미지 API 레퍼런스 및 대화형 플레이그라운드 — 텍스트 prompt로 이미지를 생성합니다

<Info>
  오른쪽의 대화형 Playground는 매개변수(종횡비, 응답 유형 등)에 대한 드롭다운 선택을 지원합니다. 테스트 요청을 원클릭으로 보내려면 **Authorization** 필드에 API Key를 입력하십시오(형식: `Bearer sk-xxx`).
</Info>

<Tip>
  **범위**: 이 페이지는 **text-to-image generation**용입니다. prompt만 입력하면 되며, 이미지 업로드는 필요하지 않습니다. 기존 이미지를 편집하려면 [Image Editing endpoint](/ko/api-capabilities/nano-banana-lite-image/image-edit)를 사용하십시오.
</Tip>

<Warning>
  **🖥️ 브라우저 Playground 제한(중요)**

  이 endpoint는 응답에 base64로 인코딩된 이미지(`inlineData.data`, 보통 수 MB)를 반환합니다. 브라우저 렌더링 제한 때문에 오른쪽 Playground는 응답이 도착한 뒤 `请求时发生错误: unable to complete request`로 표시될 수 있습니다 — **실제로 요청은 성공한 것입니다**; 브라우저가 그렇게 긴 base64 문자열을 렌더링하지 못할 뿐입니다.

  **권장 작업 흐름**(초보자 친화적):

  * 아래 Python / Node.js / cURL 샘플을 복사해 로컬에서 실행하십시오. 코드는 응답을 자동으로 `base64.b64decode`s하고 **이미지를 파일로 저장합니다**.
  * Nano Banana 2 Lite는 1K 캔버스에 초점을 맞추고 있으므로 응답 크기는 중간 정도이지만, 이미지를 저장하려면 로컬에서 실행하는 것이 여전히 가장 안전합니다.
</Warning>

<Info>
  모든 image API는 **동기식**입니다 — 폴링할 task ID가 없으며, 클라이언트가 연결을 끊으면 요청은 계속 과금되는 동안 결과는 사라집니다. 이 모델에는 넉넉한 타임아웃을 설정하십시오. [Image API Essentials & Best Practices](/ko/api-capabilities/image-api-best-practices)를 참조하십시오.
</Info>

## 코드 예제

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

### OpenAI 호환 모드

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

## 파라미터 빠른 참조

| 파라미터                                       | 유형     | 필수  | 설명                                |
| ------------------------------------------ | ------ | --- | --------------------------------- |
| `contents[].parts[].text`                  | string | 예   | 텍스트 prompt                        |
| `generationConfig.responseModalities`      | array  | 예   | `["IMAGE"]` 또는 `["TEXT","IMAGE"]` |
| `generationConfig.imageConfig.aspectRatio` | string | 아니요 | 14개 화면비, 기본값 `1:1`                |
| `generationConfig.imageConfig.imageSize`   | string | 아니요 | `1K` 전용(Lite는 1K 캔버스에 초점을 맞춥니다)   |

<Tip>
  자세한 파라미터 문서, 허용 값, 기본값은 오른쪽 플레이그라운드의 필드 설명을 참고하십시오. `aspectRatio`와 같은 모든 enum 유형 필드는 드롭다운 선택을 지원하므로 수동 입력이 필요하지 않습니다.
</Tip>

<Info>
  **Nano Banana 2에서 마이그레이션하는 경우**: 모델 이름을 `gemini-3.1-flash-image`에서 `gemini-3.1-flash-lite-image`으로만 변경하고, 다른 파라미터는 그대로 유지하십시오. Lite는 `1K`만 지원하므로 `2K/4K`를 전달하는 경우 `1K`로 다시 전환하십시오.
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