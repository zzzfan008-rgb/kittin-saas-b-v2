> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 텍스트-투-이미지 API 레퍼런스

> Seedream 텍스트-투-이미지 API 레퍼런스와 실시간 플레이그라운드 — 순수 텍스트 prompt, 1K/2K/3K/4K 및 정확한 픽셀 크기, 하나의 endpoint에서 세 가지 버전

<Info>
  오른쪽의 인터랙티브 Playground를 사용하면 API를 직접 호출할 수 있습니다. **Authorization**을 API 키로 설정하고(형식: `Bearer sk-xxx`), prompt를 입력한 다음 모델과 크기를 선택하고 전송하면 됩니다.
</Info>

<Tip>
  **범위**: 이 페이지는 순수 text-to-image만 다룹니다(`image` 필드 없음). 참고 이미지 편집, 다중 이미지 융합 또는 배치 시퀀스 생성을 원하시면 [Image Editing](/ko/api-capabilities/seedream-image/image-edit)을 참조하십시오. 엔드포인트는 같고, 파라미터만 다릅니다.
</Tip>

<Warning>
  **🖥️ Browser Playground 제한(b64\_json 모드만 해당)**

  기본 `response_format: "url"` 모드에서는 Playground가 정상적으로 작동합니다(응답은 임시 BytePlus TOS 링크일 뿐입니다). `response_format: "b64_json"`로 전환하면 응답에 수 MB 크기의 base64 문자열이 포함되며 브라우저 Playground에 `请求时发生错误: unable to complete request`가 표시될 수 있습니다 — **실제로 요청은 성공했습니다**; 브라우저가 그렇게 긴 base64 문자열을 렌더링하지 못할 뿐입니다.

  **권장 워크플로**:

  * 이미지만 보고 싶으신가요? **기본 `url` 모드를 유지하십시오** — Playground가 링크를 직접 반환합니다(24시간 이내에 본인 저장소로 다운로드하는 것을 기억하십시오).
  * b64\_json이 필요하신가요? **아래 코드 예제를 복사하여 로컬에서 실행하십시오** — 코드가 이미지를 자동으로 디코딩해 파일로 저장합니다.
</Warning>

<Warning>
  **⚠️ 해상도 등급은 버전마다 다릅니다**

  * `seedream-5-0-pro-260628` — 프리셋 `1K` / `2K` 및 최대 총 픽셀 4.19M까지의 정확한 WxH(16:9에서는 가장 긴 변이 2720×1530에 도달함, 검증됨; 3K/4K 프리셋 없음; `sequential_image_generation` / `stream`은 허용되지 않음 — 전달하면 400이 반환됨; 이미지당 약 2분)
  * `seedream-5-0-260128` — `2K` / `3K`만 지원(4K 없음)
  * `seedream-4-5-251128` — `2K` / `4K`
  * `seedream-4-0-250828` — `1K` / `2K` / `4K`

  **지원되지 않는 크기는 400을 반환합니다**. 정확한 픽셀은 총합 ∈ \[1280×720, 4096×4096] 및 종횡비 ∈ \[1/16, 16]을 만족해야 합니다.
</Warning>

<Info>
  모든 이미지 API는 **동기식**입니다 — 폴링할 task ID가 없으며, 클라이언트 연결이 끊기면 결과는 사라지지만 요청은 계속 과금됩니다. 이 모델에는 충분히 긴 timeout을 설정하십시오. [Image API Essentials & Best Practices](/ko/api-capabilities/image-api-best-practices)를 참조하십시오.
</Info>

## 코드 예시

### Python (OpenAI SDK)

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.generate(
    model="seedream-5-0-260128",
    prompt="A modern tech product launch poster with bold typography, sleek smartphone on gradient background, text: 'Innovation 2026', ultra detailed, professional",
    size="2K",
    response_format="url",
    extra_body={
        "output_format": "png",
        "watermark": False,
    }
)

print(resp.data[0].url)
```

### Python (원시 요청)

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
        "model": "seedream-5-0-260128",
        "prompt": "A serene Japanese garden with cherry blossoms, koi pond, traditional wooden bridge, golden hour, ultra detailed",
        "size": "2K",
        "response_format": "url",
        "watermark": False
    },
    timeout=60  # ~15s typical, 4K + hd may reach 30-60s
).json()

print(response["data"][0]["url"])
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "seedream-5-0-260128",
    "prompt": "A futuristic cityscape at night with neon lights and flying vehicles, cyberpunk style, high detail",
    "size": "2K",
    "response_format": "url",
    "watermark": false
  }'
```

### Node.js (fetch)

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'seedream-5-0-260128',
        prompt: 'Minimalist line-art logo of a cat, monochrome, vector style',
        size: '2K',
        response_format: 'url',
        output_format: 'png',
        watermark: false
    })
});

const { data } = await resp.json();
console.log(data[0].url);
```

### 브라우저 JavaScript

```javascript theme={null}
{/* Demo only — proxy through your backend in production to avoid leaking the key */}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'seedream-5-0-260128',
        prompt: 'Watercolor northern lights over snowy mountains',
        size: '2K'
    })
});

const { data } = await resp.json();
document.getElementById('img').src = data[0].url;
```

## 매개변수 참조

| 매개변수              | 유형      | 필수  | 기본값     | 설명                                                                                                                                                                                                                   |
| ----------------- | ------- | --- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`           | string  | 예   | —       | `seedream-5-0-260128` / `seedream-4-5-251128` / `seedream-4-0-250828` / `seedream-5-0-pro-260628` (Pro 티어, \$0.12/request)                                                                                           |
| `prompt`          | string  | 예   | —       | Prompt 텍스트입니다. 영어와 중국어를 지원합니다. 장면, 스타일, 조명에 대해 자세히 작성하십시오.                                                                                                                                                           |
| `size`            | string  | 아니요 | `2K`    | 버전마다 다른 프리셋 티어 또는 정확한 픽셀 `WxH`                                                                                                                                                                                       |
| `response_format` | string  | 아니요 | `url`   | `url`는 서명된 링크를 반환합니다. `b64_json`는 일반 base64 문자열을 반환합니다.                                                                                                                                                              |
| `output_format`   | string  | 아니요 | `jpeg`  | 5.0은 `png` / `jpeg`를 지원합니다. 4.5 / 4.0은 `jpeg`만 지원합니다(OpenAI SDK의 `extra_body`를 통해 전달하십시오)                                                                                                                            |
| `n`               | integer | —   | —       | ⚠️ **업스트림에서 지원되지 않음**: 이 매개변수는 조용히 무시됩니다. 여전히 이미지 1장이 반환되고 1장분으로 과금됩니다. 다중 이미지 출력을 위해서는 `sequential_image_generation`를 사용하십시오(생성된 이미지당 과금됨), [Image Editing](/ko/api-capabilities/seedream-image/image-edit)을 참조하십시오 |
| `seed`            | integer | —   | —       | ⚠️ 공식적으로는 seedream-3-0-t2i만 지원하며, 현재 4.x / 5.x 모델에서는 무시됩니다                                                                                                                                                           |
| `watermark`       | boolean | 아니요 | 버전마다 다름 | BytePlus 워터마크를 포함할지 여부(상업적 사용 시 `false`로 설정)                                                                                                                                                                         |
| `stream`          | boolean | 아니요 | `false` | 스트리밍 출력이며, 긴 prompt + 고해상도에 유용합니다                                                                                                                                                                                    |

<Tip>
  자세한 매개변수 제약, 허용 값, 예시는 오른쪽 Playground 패널에서 확인할 수 있습니다. **편집 / 다중 이미지 매개변수(`image`, `sequential_image_generation` 등)는 [Image Editing](/ko/api-capabilities/seedream-image/image-edit) 페이지에 문서화되어 있습니다.**
</Tip>

## 응답 형식

```json theme={null}
{
  "model": "seedream-5-0-260128",
  "created": 1768518000,
  "data": [
    {
      "url": "https://ark-content-generation-v2-ap-southeast-1.tos-ap-southeast-1.bytepluses.com/seedream-5-0/.../image.png",
      "size": "2048x2048"
    }
  ],
  "usage": {
    "generated_images": 1,
    "output_tokens": 6240,
    "total_tokens": 6240
  }
}
```

<Warning>
  **⚠️ 응답 필드 주의 사항**

  * `response_format=url`일 때, `data[].url`는 **임시 서명된 BytePlus TOS URL**입니다(일반적으로 24시간 동안 유효합니다). 운영 환경에서는 즉시 자체 저장소로 다운로드하십시오.
  * `response_format=b64_json`일 때, `data[].b64_json`는 `data:image/...;base64,` 접두사가 없는 **일반 base64 문자열**입니다. 파일 출력용으로는 이를 디코딩하고(`base64.b64decode`), 브라우저 렌더링용으로는 직접 접두사를 추가하십시오.
  * `data[].size`는 **실제 출력 크기**를 반영하며, 모델의 가로세로 비율 정규화 후 요청한 `size`와 약간 다를 수 있습니다.
</Warning>

<Info>
  `usage.generated_images`는 과금된 이미지 수를 반영합니다. Seedream은 이미지당 과금되며, `output_tokens` / `total_tokens`는 관측 지표이므로 과금에 영향을 주지 않습니다.
</Info>


## OpenAPI

````yaml api-reference/seedream-image-generate-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: Seedream Text-to-Image API
  description: >
    BytePlus ModelArk Seedream image generation models — text-to-image endpoint
    (no `image` field).


    - Active versions unified: `seedream-5-0-260128` / `seedream-4-5-251128` /
    `seedream-4-0-250828` / `seedream-5-0-pro-260628` (pro tier, \$0.12 per
    request, ~2 min per image)

    - Resolution tiers vary by version (5.0: 2K/3K; 4.5: 2K/4K; 4.0: 1K/2K/4K;
    5.0-pro: 1K/2K plus WxH up to 4.19M total px, longest edge ~2720 at 16:9)

    - Output format: 5.0 / 5.0-pro support png/jpeg; 4.5/4.0 only jpeg

    - 5.0-pro does not accept `sequential_image_generation` / `stream` — passing
    them returns 400

    - Latency ≈ 15s per image, may extend to 30-60s for 4K + hd

    - Default 500 RPM (Max Images per Minute)

    - For editing, multi-image fusion, or batch sequence generation, see [Image
    Editing](/en/api-capabilities/seedream-image/image-edit) (same endpoint,
    different params)


    **Auth**: add `Authorization: Bearer YOUR_API_KEY` to the request header.


    **Get API Key**: visit [APIYI Console](https://api.apiyi.com/token) to
    create a token.
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
      summary: 'Text-to-Image: generate an image from a text prompt'
      description: >
        Generate an image with the Seedream models from a text prompt.


        - Required: `model`, `prompt`

        - Optional: `size`, `response_format`, `output_format`, `watermark`,
        `stream`

        - Note: OpenAI's `n` parameter is not supported upstream (silently
        ignored — you still get 1 image); for multi-image output use
        `sequential_image_generation`

        - Resolution tiers vary by version — see [Overview / Technical
        Specs](/en/api-capabilities/seedream-image/overview#technical-specs)

        - For reference-image editing or multi-image fusion, use the same
        endpoint with `image` and `sequential_image_generation` — see [Image
        Editing](/en/api-capabilities/seedream-image/image-edit)
      operationId: generateSeedreamTextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SeedreamGenerateRequest'
            example:
              model: seedream-5-0-260128
              prompt: >-
                A modern tech product launch poster, sleek smartphone on
                gradient background, text: 'Innovation 2026', ultra detailed,
                professional
              size: 2K
              response_format: url
              output_format: png
              watermark: false
      responses:
        '200':
          description: Image generated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SeedreamImageResponse'
        '400':
          description: >-
            Invalid parameters (size not supported by this version, pixel out of
            range, aspect ratio out of bounds)
        '401':
          description: Unauthorized — invalid API key
        '403':
          description: Blocked by content moderation
        '429':
          description: Rate limit (default 500 RPM) or insufficient balance
        '500':
          description: Internal server error
      security:
        - bearerAuth: []
components:
  schemas:
    SeedreamGenerateRequest:
      type: object
      required:
        - model
        - prompt
      properties:
        model:
          type: string
          description: Model ID
          enum:
            - seedream-5-0-260128
            - seedream-5-0-lite-260128
            - seedream-4-5-251128
            - seedream-4-0-250828
            - seedream-5-0-pro-260628
          default: seedream-5-0-260128
        prompt:
          type: string
          description: >-
            Prompt, supports both English and Chinese. Describe scene, style,
            and lighting in detail for better results.
          example: >-
            A serene Japanese garden with cherry blossoms, koi pond, traditional
            bridge, golden hour, ultra detailed
        size:
          type: string
          description: >
            Output size. Preset tiers (vary by version):

            - `1K` (~1024×1024) — 4.0 only

            - `2K` (~2048×2048) — 5.0 / 4.5 / 4.0

            - `3K` (~3072×3072) — 5.0 only

            - `4K` (~4096×4096) — 4.5 / 4.0


            Or exact pixel size `WxH`, total pixels ∈ \[1280×720, 4096×4096\],
            aspect ratio ∈ \[1/16, 16\]
          example: 2K
          default: 2K
        response_format:
          type: string
          description: >-
            url returns a temp signed link (24h validity); b64_json returns
            plain base64 (no data: prefix)
          enum:
            - url
            - b64_json
          default: url
        output_format:
          type: string
          description: Output format. 5.0 supports png/jpeg; 4.5/4.0 only jpeg
          enum:
            - png
            - jpeg
          default: jpeg
        seed:
          type: integer
          description: >-
            Random seed. Note: officially supported only by seedream-3-0-t2i;
            ignored by the current 4.x / 5.x models
          example: 42
        watermark:
          type: boolean
          description: >-
            Whether to include the BytePlus watermark. Set to false for
            commercial use
          default: false
        stream:
          type: boolean
          description: >-
            Enable streaming output. Useful for long prompts and high-resolution
            generation
          default: false
    SeedreamImageResponse:
      type: object
      properties:
        model:
          type: string
          example: seedream-5-0-260128
        created:
          type: integer
          description: Unix timestamp
          example: 1768518000
        data:
          type: array
          items:
            type: object
            properties:
              url:
                type: string
                description: >-
                  Image URL (returned when response_format=url; signed temp URL
                  valid for 24h)
                example: >-
                  https://ark-content-generation-v2-ap-southeast-1.tos-ap-southeast-1.bytepluses.com/seedream-5-0/.../image.png
              b64_json:
                type: string
                description: >-
                  Plain base64 string (no data:image/...;base64, prefix).
                  Returned when response_format=b64_json.
              size:
                type: string
                description: >-
                  Actual output size, may differ slightly from requested due to
                  aspect-ratio adjustments
                example: 2048x2048
        usage:
          type: object
          properties:
            generated_images:
              type: integer
              description: Actual billed image count
              example: 1
            output_tokens:
              type: integer
              example: 6240
            total_tokens:
              type: integer
              example: 6240
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key obtained from APIYI Console

````