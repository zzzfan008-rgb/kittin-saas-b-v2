> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 텍스트-이미지 API 레퍼런스

> gpt-image-2-vip 텍스트-이미지 API 레퍼런스 및 인터랙티브 플레이그라운드 — 텍스트와 크기를 지정해 이미지를 생성합니다 + 모든 크기에서 이미지당 $0.03의 정액 요금

<Info>
  오른쪽의 대화형 Playground는 직접 온라인 테스트를 지원합니다. **Authorization** 필드에 API 키를 입력하고(형식: `Bearer sk-xxx`), `prompt`과 `size`를 설정한 뒤 전송하십시오.
</Info>

<Tip>
  **범위**: 이 페이지는 **텍스트-투-이미지 생성**용입니다. prompt만 입력하고 `size` — 이미지 업로드는 필요하지 않습니다. 기존 이미지를 편집하거나 합성하려면 [이미지 편집 endpoint](/ko/api-capabilities/gpt-image-2-vip/image-edit)를 사용하십시오.

  **`gpt-image-2-all`와의 차이**: 호출 구조는 동일하고, `size` 필드 하나만 추가됩니다. 차원을 고정할 필요가 없고 가장 빠른 출력을 원하시면 대신 [`gpt-image-2-all`](/ko/api-capabilities/gpt-image-2-all/text-to-image)을 사용하십시오.
</Tip>

<Warning>
  **🖥️ 브라우저 Playground 제한**

  이 endpoint는 **기본적으로 base64 문자열(`b64_json`)을 반환**하므로 크기가 몇 MB에 이를 수 있어 브라우저 Playground에 `请求时发生错误: unable to complete request`가 표시될 수 있습니다 — **요청은 실제로 성공한 것입니다**; 브라우저가 그처럼 긴 base64 문자열을 렌더링하지 못할 뿐입니다.

  **권장 작업 흐름**: **아래 코드 샘플을 복사해 로컬에서 실행하십시오** — 이미지를 디코딩하여 파일로 자동 저장합니다.
</Warning>

<Info>
  모든 image API는 **동기식**입니다 — 폴링할 task ID가 없으며, 클라이언트가 연결을 끊으면 요청은 계속 과금되는 동안 결과는 유실됩니다. 이 모델에는 넉넉한 timeout을 설정하십시오. [Image API Essentials & Best Practices](/ko/api-capabilities/image-api-best-practices)를 참조하십시오.
</Info>

<Warning>
  **⚠️ 주요 매개변수 참고사항**

  * **`size`**: 모델이 선택하게 하려면 `auto`를 전달하십시오(vip는 주어진 prompt에 대해 상대적으로 **고정적/안정적**인 크기로 수렴하는 경향이 있습니다). 또는 엄격하게 고정하려면 지원되는 30개 크기 중 하나(10개 비율 × 1K 빠름 / 2K 권장 / 4K 상세 — [개요 페이지의 전체 크기 표](/ko/api-capabilities/gpt-image-2-vip/overview#supported-sizes-full-30-size-table) 참조)를 선택하십시오. 소문자 ASCII `x`를 사용하십시오. 예: `2048x1360`, `3840x2160` — 절대 `×`나 대문자 `X`는 사용하지 마십시오.
  * **`quality`**: ❌ 거부됨 — **전달하지 마십시오**.
  * **`n`**: ❌ 거부됨 — 호출당 이미지 1장만 지원합니다. **`n=3`를 보내면 3배가 과금되지만 여전히 이미지 1장만 반환합니다.** 필드를 제거하십시오.
  * **`aspect_ratio`**: ❌ 거부됨 — 비율은 `size`에 의해 결정됩니다.
  * **`response_format`**: 생략하면 base64(원시, prefix 없음, 2026-07 검증)를 반환합니다. 이미지 URL을 받으려면 `"url"`를 전달하십시오. **URL 출력에 의존하는** 비즈니스는 base64 대체 없이 결정적인 URL 출력을 위해 token을 `image2_OSS` 그룹으로 전환해야 합니다.
</Warning>

## 코드 예제

### Python

```python theme={null}
import requests

API_KEY = "sk-your-api-key"

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
        "model": "gpt-image-2-vip",
        "prompt": "Cinematic landscape, old lighthouse by the sea at dusk, photorealistic",
        "size": "2048x1152",         # 16:9 2K Recommended
        "response_format": "url"     # defaults to base64; explicit response_format needed to read the url field
    },
    timeout=300  # conservative; absorbs long-tail and image download
).json()

image_url = response["data"][0]["url"]
print(image_url)
```

**4K 디테일 티어 예시(배경화면 / 인쇄용)**:

```python theme={null}
import requests

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={"Authorization": "Bearer sk-your-api-key"},
    json={
        "model": "gpt-image-2-vip",
        "prompt": "Desktop wallpaper, cyberpunk city night, neon signs, wet pavement reflections",
        "size": "3840x2160"          # 16:9 4K Detail
    },
    timeout=300
).json()

# Verified 2026-07: b64_json is raw base64 (no data: prefix); earlier versions included the prefix — a check is safest
import base64
b64 = response["data"][0]["b64_json"]
if b64.startswith("data:"):
    b64 = b64.split(",", 1)[1]
with open("wallpaper.png", "wb") as f:
    f.write(base64.b64decode(b64))
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2-vip",
    "prompt": "Product shot of a white ceramic mug on a gray desk, soft natural light",
    "size": "2048x1360"
  }'
```

### Node.js

```javascript theme={null}
const API_KEY = "sk-your-api-key";

const response = await fetch(
  "https://api.apiyi.com/v1/images/generations",
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-image-2-vip",
      prompt: "1:1 square logo, minimalist cat line art",
      size: "2048x2048"        // 1:1 2K Recommended
    })
  }
);

const data = await response.json();
// Verified raw base64 (no data: prefix) — prepend before rendering; earlier versions included the prefix, so check first
let b64 = data.data[0].b64_json;
if (!b64.startsWith("data:")) b64 = `data:image/png;base64,${b64}`;
document.getElementById("result").src = b64;
```

### OpenAI SDK (Python, 권장)

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.generate(
    model="gpt-image-2-vip",
    prompt="Ink wash landscape painting, traditional Chinese style, vertical composition",
    size="1536x2048",        # 3:4 2K Portrait
)
print(resp.data[0].url)
```

## 매개변수

| Parameter | Type   | Required   | Description                                                                                                                       |
| --------- | ------ | ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `model`   | string | Yes        | `gpt-image-2-vip`로 고정됩니다                                                                                                          |
| `prompt`  | string | Yes        | Prompt — 콘텐츠, 스타일, 조명 등을 설명합니다.                                                                                                   |
| `size`    | string | **강력히 권장** | 출력 크기: `auto`(모델이 결정합니다 — **vip는 주어진 prompt에 대해 비교적 고정됩니다**) 또는 30개 크기 중 하나입니다; 형식 `WIDTHxHEIGHT`(소문자 `x`); 필드를 생략하면 `auto`와 같습니다 |

<Tip>
  **크기 치트시트** — 다음 항목들이 대부분의 경우를 포함합니다:

  * 이커머스 히어로 샷: `2048x1360` (3:2 2K) / `2048x2048` (1:1 2K)
  * 세로 포스터: `1536x2048` (3:4 2K) / `2480x3312` (3:4 4K)
  * 동영상 썸네일: `2048x1152` (16:9 2K) / `3840x2160` (16:9 4K)
  * 스토리 / 휴대폰 배경화면: `1152x2048` (9:16 2K) / `2160x3840` (9:16 4K)

  전체 30개 크기 표: [개요 페이지](/ko/api-capabilities/gpt-image-2-vip/overview#supported-sizes-full-30-size-table).
</Tip>

## 응답 형식

**기본값으로 base64를 반환합니다** (`data[0].b64_json`, 접두사 없는 raw base64, 2026-07 검증됨). 대신 **이미지 URL**을 받으려면 `response_format: "url"`을 명시적으로 전달하십시오. URL 출력에 **의존하는** 비즈니스는 안정적인 URL 출력을 위해 base64 대체 없이 token의 그룹을 \*\*`image2_OSS`\*\*로 변경해야 합니다. `data[0]`는 `url` 또는 `b64_json` 중 하나만 반환합니다 — 둘 다는 아닙니다.

**`b64_json` 모드** (기본값):

```json theme={null}
{
  "data": [
    {
      "b64_json": "iVBORw0KGgoAAAANSUhEUgAA..."
    }
  ],
  "created": 1778037127,
  "usage": {
    "input_tokens": 98,
    "output_tokens": 1185,
    "total_tokens": 1283
  }
}
```

**`url` 모드** (`response_format: "url"`을 명시적으로 전달하십시오; URL에 의존한다면 `image2_OSS` 그룹을 사용하십시오 — R2 CDN이 전역으로 가속됩니다):

```json theme={null}
{
  "data": [
    {
      "url": "https://r2cdn.copilotbase.com/r2cdn2/0e82148a-bec0-4b42-bbca-117c6b42581b.png"
    }
  ],
  "created": 1778037331,
  "usage": {
    "input_tokens": 30,
    "output_tokens": 2074,
    "total_tokens": 2104
  }
}
```

<Warning>
  **호환성 참고**: 2026년 7월 검증됨 — `b64_json` 필드는 **`data:` 접두사가 없는 raw base64**입니다. 파일에 쓰려면 디코딩하고, 렌더링하기 전에 직접 접두사를 붙이십시오. **이전 버전에는 접두사가 포함되어 있었습니다**, 따라서 두 형태를 모두 처리하려면 항상 먼저 `startsWith('data:')` 검사를 실행하십시오.
</Warning>

## 관련 리소스

<CardGroup cols={2}>
  <Card title="모델 개요 (전체 크기 표)" icon="sparkles" href="/ko/api-capabilities/gpt-image-2-vip/overview">
    전체 30개 크기 표, 과금, 기술 사양
  </Card>

  <Card title="이미지 편집 API" icon="image" href="/ko/api-capabilities/gpt-image-2-vip/image-edit">
    `/v1/images/edits` 다중 이미지 융합 및 편집
  </Card>

  <Card title="자매 모델 gpt-image-2-all" icon="copy" href="/ko/api-capabilities/gpt-image-2-all/text-to-image">
    고정 크기가 필요하지 않을 때는 동일한 호출 형식 — 더 빠른 출력(\~30–60초)
  </Card>
</CardGroup>


## OpenAPI

````yaml api-reference/gpt-image-2-vip-generate-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: gpt-image-2-vip Text-to-Image API
  description: >
    GPT image generation reverse-engineered model `gpt-image-2-vip` (Codex line)
    — text-to-image endpoint.


    - Per-call billing, $0.03/image (flat across all sizes; no surcharge for 4K)

    - Supports 30 explicit sizes (10 ratios × 1K Fast / 2K Recommended / 4K
    Detail)

    - ~90–150s generation time, supports Chinese prompts

    - Does not accept quality / n / aspect_ratio

    - **Defaults to base64 (`b64_json`); can switch to R2 CDN URL (`url`)**.
    `data[0]` returns either `url` **or** `b64_json` — never both in the same
    response.


    **Authentication**: Add `Authorization: Bearer YOUR_API_KEY` to request
    headers


    **Get API Key**: Visit [API易 Console](https://api.apiyi.com/token) to create
    a token
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
      summary: 'Text-to-Image: generate at an explicit size from a text prompt'
      description: >
        Generate images with `gpt-image-2-vip` from a text prompt and lock the
        output dimension via `size`.


        - `model` and `prompt` required; `size` strongly recommended

        - `size` must be one of the 30 supported sizes (see overview page)

        - Do not pass `quality` / `n`

        - For editing or multi-image fusion, use the [Image Editing
        endpoint](/en/api-capabilities/gpt-image-2-vip/image-edit)
      operationId: generateGptImage2VipTextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TextToImageRequest'
            example:
              model: gpt-image-2-vip
              prompt: >-
                Cinematic landscape, old lighthouse by the sea at dusk,
                photorealistic
              size: 2048x1152
      responses:
        '200':
          description: >-
            Image successfully generated. Defaults to base64 in
            `data[0].b64_json` — `url` is not returned in the same response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
              example:
                data:
                  - b64_json: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
                created: 1778037127
                usage:
                  input_tokens: 98
                  output_tokens: 1185
                  total_tokens: 1283
        '400':
          description: size not in the 30-size set, or malformed
        '401':
          description: Unauthorized - Invalid API Key
        '429':
          description: Rate limited or quota exhausted
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
          description: Model name, fixed to gpt-image-2-vip
          enum:
            - gpt-image-2-vip
          default: gpt-image-2-vip
        prompt:
          type: string
          description: Prompt — describe content, style, lighting, etc.
          example: >-
            Cinematic landscape, old lighthouse by the sea at dusk,
            photorealistic
        size:
          type: string
          description: >
            Output size. Pass `auto` to let the model decide (vip tends to
            converge on a relatively fixed size for a given prompt), or pick one
            of the 30 supported sizes (10 ratios × 1K Fast / 2K Recommended / 4K
            Detail) to lock it strictly.

            Format: `WIDTHxHEIGHT` with lowercase ASCII `x`, e.g., `2048x1360`,
            `3840x2160`. Flat $0.03/image across all tiers.
          enum:
            - auto
            - 1280x1280
            - 848x1280
            - 1280x848
            - 960x1280
            - 1280x960
            - 1024x1280
            - 1280x1024
            - 720x1280
            - 1280x720
            - 1280x544
            - 2048x2048
            - 1360x2048
            - 2048x1360
            - 1536x2048
            - 2048x1536
            - 1632x2048
            - 2048x1632
            - 1152x2048
            - 2048x1152
            - 2048x864
            - 2880x2880
            - 2336x3520
            - 3520x2336
            - 2480x3312
            - 3312x2480
            - 2560x3216
            - 3216x2560
            - 2160x3840
            - 3840x2160
            - 3840x1632
          example: 2048x1152
    ImageResponse:
      type: object
      description: >
        Image generation response. **Returns base64 by default**
        (`data[0].b64_json`); to get a `url`, switch to the `image2_OSS` group
        with `response_format=url`. `data[0]` returns **either `url` or
        `b64_json`, never both**.
      properties:
        data:
          type: array
          description: Result array (this model returns 1 image per call)
          items:
            type: object
            properties:
              url:
                type: string
                description: >-
                  R2 CDN accelerated link (returned when using the image2_OSS
                  group with response_format=url)
              b64_json:
                type: string
                description: >-
                  Base64-encoded data URL (returned by default; already includes
                  the data:image/png;base64, prefix)
        created:
          type: integer
          description: Unix timestamp (seconds)
        usage:
          type: object
          description: Token usage statistics
          properties:
            input_tokens:
              type: integer
              description: Input tokens
            output_tokens:
              type: integer
              description: Output tokens (includes image-pixel accounting)
            total_tokens:
              type: integer
              description: Total tokens
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key from the API易 Console

````