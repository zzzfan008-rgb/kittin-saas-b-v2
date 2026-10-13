> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 텍스트 투 이미지 API 레퍼런스

> Seedream 텍스트 투 이미지 API 레퍼런스 및 라이브 플레이그라운드 — 순수 텍스트 prompt, 1K/1.5K/2K/3K/4K 및 정확한 픽셀 크기, 단일 엔드포인트에서 모든 버전 제공

<Info>
  오른쪽의 인터랙티브 Playground를 통해 API를 직접 호출할 수 있습니다. **Authorization**을 API 키(형식: `Bearer sk-xxx`)로 설정하고, prompt를 입력한 후 모델과 크기를 선택하고 전송을 누르십시오.
</Info>

<Tip>
  **적용 범위**: 이 문서는 순수 텍스트-이미지 생성(`image` 필드 없음)을 다룹니다. 참조 이미지 편집, 다중 이미지 합성 또는 배치 시퀀스 생성에 대해서는 [이미지 편집](/ko/api-capabilities/seedream-image/image-edit)을 참조하십시오 — 동일한 엔드포인트이며 파라미터만 다릅니다.
</Tip>

<Warning>
  **🖥️ 브라우저 Playground 제한 사항(b64\_json 모드 전용)**

  기본 `response_format: "url"` 모드에서는 Playground가 정상 작동합니다(응답은 임시 BytePlus TOS 링크일 뿐입니다). `response_format: "b64_json"`(으)로 전환하면 응답에 수 MB 크기의 base64 문자열이 포함되어 브라우저 Playground에 `请求时发生错误: unable to complete request`이(가) 표시될 수 있습니다 — **실제로는 요청이 성공한 것이며**, 단지 브라우저에서 이처럼 긴 base64 문자열을 렌더링하지 못할 뿐입니다.

  **권장 워크플로**:

  * 이미지만 확인하고 싶으신가요? **기본 `url` 모드를 유지하십시오** — Playground에서 링크를 직접 반환합니다(24시간 이내에 자체 스토리지로 다운로드해야 함을 유의하십시오).
  * b64\_json이 필요하신가요? **아래 코드 샘플을 복사하여 로컬에서 실행하십시오** — 코드가 이미지를 자동으로 디코딩하여 파일로 저장합니다.
</Warning>

<Warning>
  **⚠️ 버전별로 해상도 등급이 다릅니다**

  * `seedream-5-0-flash-260915` — 프리셋 `1K` / `1.5K` / `2K` 및 총 0.92M~~4.62M 픽셀 범위의 정확한 WxH 지원, 가로세로 비율 최대 16:1(3K/4K 프리셋 없음, 프리셋 사용 시 모델이 화면 비율을 선택함, `sequential_image_generation` / `stream`은 허용되지 않음 — 전달 시 400 반환, 이미지당 약 15~~20초 소요, 요청당 \$0.018)
  * `seedream-5-0-pro-260628` — 프리셋 `1K` / `2K` 및 최대 4.19M 총 픽셀의 정확한 WxH 지원(16:9 비율에서 가장 긴 변이 2720×1530에 도달함이 확인됨, 3K/4K 프리셋 없음, `sequential_image_generation` / `stream`은 허용되지 않음 — 전달 시 400 반환, 이미지당 약 2분 소요)
  * `seedream-5-0-260128` — `2K` / `3K`만 지원(4K 미지원)
  * `seedream-4-5-251128` — `2K` / `4K`
  * `seedream-4-0-250828` — `1K` / `2K` / `4K`

  **지원되지 않는 크기는 400을 반환합니다**. 정확한 픽셀 값은 총 픽셀 수 ∈ \[1280×720, 4096×4096] 및 가로세로 비율 ∈ \[1/16, 16] 조건을 충족해야 합니다.
</Warning>

<Info>
  모든 이미지 API는 **동기식**입니다 — 폴링할 작업 ID가 없으며, 클라이언트 연결이 끊어지면 결과가 유실되어도 요청에 대해서는 과금됩니다. 이 모델에 대해 넉넉한 타임아웃을 설정하십시오. 자세한 내용은 [이미지 API 필수 사항 및 모범 사례](/ko/api-capabilities/image-api-best-practices)를 참조하십시오.
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

## 파라미터 참조

| 파라미터 | 타입 | 필수 여부 | 기본값 | 설명 |
| - | - | - | - | - |
| `model` | 문자열 | 예 | — | `seedream-5-0-260128` / `seedream-4-5-251128` / `seedream-4-0-250828` / `seedream-5-0-pro-260628` (pro 티어, 요청당 \$0.12) / `seedream-5-0-flash-260915` (fast 티어, 요청당 \$0.018) |
| `prompt` | 문자열 | 예 | — | prompt 텍스트입니다. 영어와 중국어를 지원합니다. 장면, 스타일, 조명을 상세하게 작성해 주십시오. |
| `size` | 문자열 | 아니요 | `2K` | 프리셋 티어(버전에 따라 상이함) 또는 정확한 픽셀 수 `WxH` |
| `response_format` | 문자열 | 아니요 | `url` | `url`은(는) 서명된 링크를 반환하고, `b64_json`은(는) 일반 base64 문자열을 반환합니다. |
| `output_format` | 문자열 | 아니요 | `jpeg` | 5.0 시리즈는 `png` / `jpeg`을(를) 지원하며, 4.5 / 4.0은 `jpeg`만 지원합니다(OpenAI SDK에서는 `extra_body`을(를) 통해 전달). |
| `n` | 정수 | — | — | ⚠️ **업스트림 미지원**: 해당 파라미터는 경고 없이 무시되며, 이미지는 여전히 1장만 생성되고 1장에 대해서만 과금됩니다. 다중 이미지 출력을 생성하려면 `sequential_image_generation`을(를) 사용하십시오(생성된 이미지당 과금됨). [이미지 편집](/ko/api-capabilities/seedream-image/image-edit)을 참조하십시오. |
| `seed` | 정수 | — | — | ⚠️ seedream-3-0-t2i에서만 공식적으로 지원되며, 현재 4.x / 5.x 모델에서는 무시됩니다. |
| `watermark` | 불리언 | 아니요 | 상이함 | BytePlus 워터마크 포함 여부(상업적 용도의 경우 `false`(으)로 설정하십시오. 생략 시 5.0-flash는 “AI 생성” 워터마크를 추가합니다) |
| `stream` | 불리언 | 아니요 | `false` | 스트리밍 출력으로, 긴 prompt 및 고해상도 작업에 유용합니다. 5.0-pro / 5.0-flash에서는 지원되지 않으며 400을 반환합니다. |

<Tip>
  자세한 파라미터 제약 조건, 허용되는 값 및 예시는 오른쪽 Playground 패널에서 확인할 수 있습니다. **편집 / 다중 이미지 파라미터(`image`, `sequential_image_generation` 등)는 [이미지 편집](/ko/api-capabilities/seedream-image/image-edit) 페이지에 설명되어 있습니다.**
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
    request, ~2 min per image) / `seedream-5-0-flash-260915` (fast tier, \$0.018
    per request, ~15–20 s per image)

    - Resolution tiers vary by version (5.0: 2K/3K; 4.5: 2K/4K; 4.0: 1K/2K/4K;
    5.0-pro: 1K/2K plus WxH up to 4.19M total px, longest edge ~2720 at 16:9;
    5.0-flash: 1K/1.5K/2K plus WxH from 0.92M to 4.62M total px)

    - Output format: the 5.0 series supports png/jpeg; 4.5/4.0 only jpeg

    - 5.0-pro / 5.0-flash do not accept `sequential_image_generation` / `stream`
    — passing them returns 400

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
            - seedream-5-0-flash-260915
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

            - `1K` (~1024×1024) — 4.0 / 5.0-pro / 5.0-flash

            - `1.5K` (~1536×1536) — 5.0-flash only

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
            generation. Not accepted by 5.0-pro / 5.0-flash (returns 400)
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

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.