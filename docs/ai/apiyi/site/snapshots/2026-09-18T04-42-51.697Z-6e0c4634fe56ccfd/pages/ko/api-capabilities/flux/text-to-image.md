> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 텍스트-투-이미지 API 레퍼런스

> FLUX 텍스트-투-이미지 API 레퍼런스와 실시간 디버거 — OpenAI 호환 드롭인 방식으로 전체 FLUX.2 [klein/pro/max/flex] 패밀리를 지원하며, 4MP 출력과 정확한 hex 색상 제어를 제공합니다

<Info>
  오른쪽의 대화형 Playground는 실시간 디버깅을 지원합니다. **Authorization** 헤더에 API Key를 입력하고(형식: `Bearer sk-xxx`), 모델과 크기를 선택한 다음 prompt를 입력하여 전송합니다.
</Info>

<Tip>
  **이 페이지는 다음 용도로 사용합니다:** “text generates image” — prompt만 있으면 되며 업로드는 필요하지 않습니다. 기존 이미지를 편집하거나 여러 참조 이미지를 융합하려면 [Image Editing endpoint](/ko/api-capabilities/flux/image-edit)를 참조하십시오.
</Tip>

<Warning>
  **⚠️ 주요 차이점 / 지원되지 않는 매개변수**

  * **결과 URL은 10분 동안만 유효합니다** — `data[0].url`는 즉시 다운로드해야 하며, 만료된 URL은 404를 반환합니다
  * **`width` / `height`는 16의 배수여야 합니다** — 그렇지 않으면 400을 반환합니다
  * **`prompt_upsampling`는 FLUX.2 \[klein]에서 지원되지 않습니다** — 무시되어도 별도로 알림이 표시되지 않습니다
  * **총 픽셀 한도는 4MP**(\~2048×2048) — 초과하면 400을 반환합니다
  * **`grounding search`는 `flux-2-max`에서만 지원됩니다** — 다른 모델은 시의성이 중요한 prompt라도 실시간 검색을 트리거하지 않습니다
</Warning>

<Info>
  모든 image API는 **동기식**입니다 — 폴링할 task ID가 없으며, 클라이언트가 연결을 끊으면 요청이 아직 과금되는 동안 결과는 사라집니다. 이 모델에는 충분히 넉넉한 timeout을 설정하십시오. 자세한 내용은 [Image API Essentials & Best Practices](/ko/api-capabilities/image-api-best-practices)를 참조하십시오.
</Info>

## 코드 예제

### Python (OpenAI SDK 드롭인)

```python theme={null}
from openai import OpenAI
import requests

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.generate(
    model="flux-2-pro",
    prompt="A cinematic shot of a futuristic city at sunset, 85mm lens, hyper-realistic",
    size="1920x1080"
)

# data[0].url is valid for only 10 minutes — download immediately
image_url = resp.data[0].url
with open("out.jpg", "wb") as f:
    f.write(requests.get(image_url, timeout=30).content)
```

### Python (네이티브 requests · width/height 문법 포함)

```python theme={null}
import requests

API_KEY = "sk-your-api-key"

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    },
    json={
        "model": "flux-2-max",
        "prompt": "Score of yesterday's Champions League final, infographic style",
        "width": 1920,
        "height": 1080,
        "safety_tolerance": 2,
        "output_format": "jpeg",
        "seed": 42
    },
    timeout=120
).json()

image_url = response["data"][0]["url"]
with open("out.jpg", "wb") as f:
    f.write(requests.get(image_url, timeout=30).content)
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "flux-2-pro",
    "prompt": "Luxury eyeshadow palette with 6 pans: top row #B76E79, #E8D5B7, #8B4789; bottom row #CD7F32, #F8F6F0, #800020",
    "size": "1024x1024",
    "output_format": "png"
  }'
```

### Node.js (네이티브 fetch)

```javascript theme={null}
import fs from 'node:fs';

const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'flux-2-klein-9b',
        prompt: 'A serene mountain landscape at golden hour, soft diffused light',
        width: 1024,
        height: 1024
    })
});

const { data } = await resp.json();
// Download immediately — URL expires in 10 minutes
const img = await fetch(data[0].url);
fs.writeFileSync('out.jpg', Buffer.from(await img.arrayBuffer()));
```

### Browser JavaScript (직접 렌더링)

```javascript theme={null}
{/* Demo only — production should proxy via backend to avoid leaking the key. The delivery URL has CORS disabled, so server-side download to your own CDN is recommended. */}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'flux-2-pro',
        prompt: 'Watercolor aurora borealis over Nordic mountains',
        size: '1536x1024'
    })
});

const { data } = await resp.json();
{/* delivery URL has CORS disabled, but <img src> works for direct rendering. Server-side download is still recommended for production. */}
document.getElementById('img').src = data[0].url;
```

## 매개변수 참조

| 매개변수                | 유형  | 필수  | 기본값         | 설명                                            |
| ------------------- | --- | --- | ----------- | --------------------------------------------- |
| `model`             | 문자열 | 예   | —           | FLUX 모델 ID, 아래 표 참조                           |
| `prompt`            | 문자열 | 예   | —           | Prompt, 최대 32K tokens. 자연어 및 구조화된 JSON을 지원합니다 |
| `size`              | 문자열 | 아니요 | `1024x1024` | OpenAI 스타일 크기 문자열, 예: `1920x1080`             |
| `width`             | 정수  | 아니요 | `1024`      | BFL 네이티브, `size`의 대안이며 16의 배수여야 합니다           |
| `height`            | 정수  | 아니요 | `1024`      | BFL 네이티브, 16의 배수여야 합니다                        |
| `seed`              | 정수  | 아니요 | random      | 재현성을 위해 고정합니다                                 |
| `safety_tolerance`  | 정수  | 아니요 | `2`         | 0(가장 엄격함) – 6(가장 허용적임)                        |
| `output_format`     | 문자열 | 아니요 | `jpeg`      | `jpeg` / `png`                                |
| `prompt_upsampling` | 불리언 | 아니요 | `false`     | 프롬프트 자동 확장(\[klein]에서는 지원하지 않음)               |
| `steps`             | 정수  | 아니요 | `50`        | **`flux-2-flex`에만 해당**, 최대 50                 |
| `guidance`          | 숫자  | 아니요 | `4.5`       | **`flux-2-flex`에만 해당**, 1.5–10                |
| `n`                 | 정수  | 아니요 | `1`         | 1만 지원됩니다                                      |

### 지원되는 모델 ID

| 모델 ID                | 속도     | 적합한 용도              |
| -------------------- | ------ | ------------------- |
| `flux-2-max`         | \< 15s | 플래그십 + grounding 검색 |
| `flux-2-pro`         | \< 10s | 대규모 프로덕션, 최고의 가성비   |
| `flux-2-flex`        | 더 느림   | 타이포그래피 전문           |
| `flux-2-klein-9b`    | 1초 미만  | 균형형                 |
| `flux-2-klein-4b`    | 1초 미만  | 가장 빠름               |
| `flux-pro-1.1-ultra` | 약 10s  | 레거시 4MP(과거 버전 참고)   |
| `flux-pro-1.1`       | 약 5s   | 레거시 1.6MP           |
| `flux-pro`           | 약 6s   | 1세대 프로              |
| `flux-dev`           | 약 5s   | 개발/테스트              |

<Tip>
  세부 제약, 허용 값, 예시는 오른쪽 Playground 필드 힌트에서 확인할 수 있습니다. 모든 enum 필드는 드롭다운 선택을 지원합니다.
</Tip>

## 응답 형식

```json theme={null}
{
    "created": 1776832476,
    "data": [
        {
            "url": "https://delivery-eu.bfl.ai/results/xxx/sample.jpeg?signature=..."
        }
    ]
}
```

<Warning>
  **⚠️ `data[0].url`의 유효 시간은 10분입니다**

  * URL은 `delivery-eu.bfl.ai` / `delivery-us.bfl.ai`에 호스팅되며, 서명은 10분 후 만료됩니다
  * **CORS는 비활성화되어 있습니다** — 브라우저 `fetch`는 차단되지만, `<img src>` 렌더링은 작동합니다
  * 운영 서비스는 반드시 서버 측에서 자체 OSS / CDN으로 다운로드해야 합니다
  * OpenAI의 `gpt-image-2`는 `b64_json`를 반환하는 것과 달리, **FLUX는 URL만 반환합니다 — base64는 없습니다**.
</Warning>

<Info>
  FLUX는 `usage` 필드를 반환하지 않습니다(이미지당 과금되며, token당은 아닙니다). 실제 과금은 이 사이트의 요금표를 따릅니다. 응답 헤더 `x-request-id`는 지원 추적용입니다.
</Info>


## OpenAPI

````yaml api-reference/flux-generate-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: FLUX Text-to-Image API
  description: >
    Black Forest Labs FLUX model family — text-to-image endpoint
    (OpenAI-compatible wrapper).


    - Full model matrix: FLUX.2 [klein 4b/9b, pro, max, flex], FLUX.1
    [pro/1.1/1.1-ultra/dev]

    - Output up to 4MP (2048×2048), arbitrary aspect ratio (dimensions must be
    multiples of 16)

    - Supports 32K-token prompts, exact hex color control, structured JSON
    prompting

    - `flux-2-max` exclusive: grounding search (real-time web)

    - Response `data[0].url` is **valid for only 10 minutes**, download
    immediately (CORS disabled)

    - APIYI gateway wraps BFL's async polling as a synchronous OpenAI Images API


    **Authentication**: include `Authorization: Bearer YOUR_API_KEY` in the
    request header.


    **Get API Key**: create a token at the [APIYI
    Console](https://api.apiyi.com/token).
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
  - url: https://vip.apiyi.com
    description: Backup endpoint
security:
  - bearerAuth: []
paths:
  /v1/images/generations:
    post:
      tags:
        - Text-to-Image
      summary: Generate an image from a text prompt
      description: >
        Generate images from text using the FLUX model family.


        - Required: `model`, `prompt`

        - Optional: `size` or `width`+`height` (pick one), `seed`,
        `safety_tolerance`, `output_format`, `prompt_upsampling`

        - flex-only: `steps`, `guidance`

        - Custom dimensions must satisfy: multiples of 16, 64×64 ≤ size ≤ 4MP

        - For reference-image editing or fusion, use the [Image Editing
        endpoint](/en/api-capabilities/flux/image-edit).
      operationId: generateFluxTextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TextToImageRequest'
            example:
              model: flux-2-pro
              prompt: A cinematic shot of a futuristic city at sunset, 85mm lens
              size: 1920x1080
              output_format: jpeg
              safety_tolerance: 2
      responses:
        '200':
          description: Image generated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: >-
            Invalid params (width/height not multiple of 16, exceeds 4MP, prompt
            over 32K tokens, etc.)
        '401':
          description: Unauthorized — invalid API Key
        '403':
          description: Moderation block
        '429':
          description: Rate limited or out of credits (active tasks > 24)
        '500':
          description: Internal server error
      security:
        - bearerAuth: []
components:
  schemas:
    TextToImageRequest:
      type: object
      required:
        - model
        - prompt
      properties:
        model:
          type: string
          description: >-
            FLUX model ID. For FLUX.2 prefer flux-2-pro / flux-2-max; legacy
            versions in the Historical Versions page.
          enum:
            - flux-2-max
            - flux-2-pro
            - flux-2-flex
            - flux-2-klein-9b
            - flux-2-klein-4b
            - flux-pro-1.1-ultra
            - flux-pro-1.1
            - flux-pro
            - flux-dev
          default: flux-2-pro
        prompt:
          type: string
          description: >-
            Prompt, up to 32K tokens. Supports natural language, hex codes, and
            structured JSON.
          example: A cinematic shot of a futuristic city at sunset, 85mm lens
        size:
          type: string
          description: >
            OpenAI-style size string. Pick either `size` or `width`+`height`.

            Common: 1024x1024 / 1536x1024 / 1024x1536 / 1920x1080 / 1440x2048 /
            2048x2048.

            Custom must satisfy: multiples of 16, 64×64–4MP.
          example: 1920x1080
          default: 1024x1024
        width:
          type: integer
          description: >-
            BFL-native syntax, alternative to `size`. Must be a multiple of 16,
            between 64 and 2048.
          minimum: 64
          maximum: 2048
          example: 1920
          default: 1024
        height:
          type: integer
          description: BFL-native syntax. Must be a multiple of 16, between 64 and 2048.
          minimum: 64
          maximum: 2048
          example: 1080
          default: 1024
        seed:
          type: integer
          description: >-
            Fix for reproducibility — same seed + same other params yields the
            same result.
          example: 42
        safety_tolerance:
          type: integer
          description: Moderation level. 0 = strictest, 6 = most permissive, default 2.
          minimum: 0
          maximum: 6
          default: 2
        output_format:
          type: string
          description: Output format.
          enum:
            - jpeg
            - png
          default: jpeg
        prompt_upsampling:
          type: boolean
          description: >-
            Auto-expand the prompt. Not supported on FLUX.2 [klein] (silently
            ignored).
          default: false
        steps:
          type: integer
          description: '**Only flux-2-flex**. Inference steps, max 50.'
          minimum: 1
          maximum: 50
          default: 50
        guidance:
          type: number
          description: >-
            **Only flux-2-flex**. Guidance scale. 1.5–10, higher = closer to
            prompt.
          minimum: 1.5
          maximum: 10
          default: 4.5
        'n':
          type: integer
          description: Number of images. Only 1 supported.
          enum:
            - 1
          default: 1
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
          description: Unix timestamp
          example: 1776832476
        data:
          type: array
          description: Result array (single image per call)
          items:
            type: object
            properties:
              url:
                type: string
                description: >-
                  **Signed URL, valid for 10 minutes**. Hosted on
                  delivery-eu.bfl.ai / delivery-us.bfl.ai with CORS disabled —
                  server-side download required.
                example: >-
                  https://delivery-eu.bfl.ai/results/xxx/sample.jpeg?signature=...
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key from the APIYI Console

````