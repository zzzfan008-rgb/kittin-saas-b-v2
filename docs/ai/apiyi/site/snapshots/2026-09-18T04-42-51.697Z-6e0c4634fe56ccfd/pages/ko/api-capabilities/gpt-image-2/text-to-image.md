> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 텍스트-이미지 API 레퍼런스

> gpt-image-2.5-flare / gpt-image-2.5-sunburst / gpt-image-2 텍스트-이미지 API 레퍼런스 및 실시간 테스트 — 유효한 모든 해상도 지원(4K 포함), token 기반 과금, 세 가지 모두 동일한 가격 및 매개변수

<Info>
  오른쪽의 대화형 플레이그라운드는 실시간 테스트를 지원합니다. **Authorization**에 API Key(형식: `Bearer sk-xxx`)를 입력하고, prompt를 작성한 후 크기 / 품질을 선택하여 전송합니다.
</Info>

<Tip>
  **사용 사례**: 이 페이지는 "텍스트-이미지"용입니다. prompt만 입력하면 되며 이미지를 업로드할 필요가 없습니다. 참조 이미지 편집, 다중 이미지 융합 또는 마스크 인페인팅에는 [이미지 편집 엔드포인트](/ko/api-capabilities/gpt-image-2/image-edit)를 사용합니다.
</Tip>

<Warning>
  **🖥️ 브라우저 플레이그라운드 제한 사항(중요)**

  이 엔드포인트는 응답에서 **원시 base64 문자열**(일반적으로 수 MB)을 반환합니다. 브라우저 렌더링 제한으로 인해 오른쪽의 플레이그라운드에는 응답이 도착한 후 `请求时发生错误: unable to complete request`이 표시될 수 있습니다. **요청은 실제로 성공한 것이며**, 브라우저에서 이렇게 긴 base64 문자열을 렌더링할 수 없을 뿐입니다.

  **권장 워크플로**(초보자용):

  * **아래의 Python / Node.js / cURL 샘플을 복사하여 로컬에서 실행합니다**. 코드는 응답을 자동으로 `base64.b64decode`s 처리하고 **이미지를 파일에 기록합니다**.
  * 브라우저 내 플레이그라운드를 반드시 사용해야 한다면 `size`을 가장 작은 등급(예: `1024x1024`)으로 설정하고, 응답 크기를 줄이도록 `quality`를 `low`으로 설정합니다.
</Warning>

<Info>
  모든 이미지 API는 **동기식**입니다. 폴링할 task ID가 없으며, 클라이언트 연결이 끊기면 요청에 대한 과금이 계속되는 동안 결과가 손실됩니다. 이 모델에는 충분히 긴 타임아웃을 설정하십시오. [이미지 API 필수 사항 및 모범 사례](/ko/api-capabilities/image-api-best-practices)를 참조하십시오.
</Info>

<Warning>
  **⚠️ 지원되지 않는 매개변수**

  * `input_fidelity` — 세 모델 모두 고충실도를 강제하므로, 이를 전달하면 400을 반환합니다(2026-09-09에 2.5에서 확인됨: `does not support the 'input_fidelity' parameter`). 1.5에서 마이그레이션하는 경우 해당 줄을 제거하기만 하면 됩니다.

  **`2560×1440` 이상의 출력은 여전히 실험 단계입니다**. 프로덕션 환경에서는 사전 설정인 `2048x1152` / `2048x2048` / `3840x2160`를 우선 사용하십시오.
</Warning>

## 코드 예제

### Python (OpenAI SDK)

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.generate(
    model="gpt-image-2.5-flare",
    prompt="Cyberpunk city at night, neon sign closeup, cinematic frame",
    size="2048x1152",
    quality="high",
    output_format="jpeg",
    output_compression=85
)

# b64_json is raw base64 (no prefix) — decode and write to file
with open("out.jpg", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### Python (원시 요청)

```python theme={null}
import requests
import base64

API_KEY = "sk-your-api-key"

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    },
    json={
        "model": "gpt-image-2.5-flare",
        "prompt": "Landscape 2K seaside lighthouse at sunset, cinematic frame",
        "size": "2048x1152",
        "quality": "high"
    },
    timeout=360  # high + 2K/4K can run 3-5 min; ~120s defaults will frequently false-timeout
).json()

with open("out.png", "wb") as f:
    f.write(base64.b64decode(response["data"][0]["b64_json"]))
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2.5-flare",
    "prompt": "Orange tabby cat with sunglasses at a seaside bar, cinematic",
    "size": "2048x1152",
    "quality": "high",
    "output_format": "jpeg",
    "output_compression": 85
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
        model: 'gpt-image-2.5-flare',
        prompt: 'Minimalist line-art cat logo',
        size: '1024x1024',
        quality: 'medium'
    })
});

const { data } = await resp.json();
// b64_json is raw base64 — decode manually
fs.writeFileSync('logo.png', Buffer.from(data[0].b64_json, 'base64'));
```

### 브라우저 JavaScript (직접 렌더링)

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'gpt-image-2.5-flare',
        prompt: 'Watercolor-style Nordic aurora',
        size: '1536x1024',
        quality: 'high'
    })
});

const { data } = await resp.json();
// Browser rendering needs the data URL prefix prepended manually
document.getElementById('img').src = `data:image/png;base64,${data[0].b64_json}`;
```

## 매개변수 참조

| 매개변수                 | 유형     | 필수  | 기본값    | 설명                                                                                                                                                                                                                                            |
| -------------------- | ------ | --- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`              | string | 예   | —      | `gpt-image-2.5-flare` (속도 우선, 일상적인 기본값) / `gpt-image-2.5-sunburst` (품질 및 편집 우선) / `gpt-image-2` (이전 세대, 계속 사용 가능); 프로덕션에서는 날짜가 지정된 스냅샷 `gpt-image-2.5-flare-2026-09-08` / `gpt-image-2.5-sunburst-2026-09-08`을 고정합니다. 세 모델 모두 가격과 매개변수가 동일합니다 |
| `prompt`             | string | 예   | —      | 프롬프트, 중국어 또는 영어 지원; 최대 32,000자(provider 제한이며 token이 아닌 문자 수로 계산)입니다. 긴 자료는 먼저 요약하고 [긴 프롬프트](/ko/api-capabilities/image-long-prompt)를 참조하십시오                                                                                                   |
| `size`               | string | 아니요 | `auto` | 출력 크기 — 사전 설정 또는 제약 조건을 충족하는 사용자 지정 값                                                                                                                                                                                                         |
| `quality`            | string | 아니요 | `auto` | `low` / `medium` / `high` / `xhigh` / `max` / `auto`; `xhigh` / `max`는 2.5에서 새로 추가되었으며, `gpt-image-2`는 `high`에서 중지됩니다                                                                                                                         |
| `output_format`      | string | 아니요 | `png`  | `png` / `jpeg` / `webp`                                                                                                                                                                                                                       |
| `output_compression` | int    | 아니요 | —      | 0–100, `jpeg` / `webp`에만 사용됩니다                                                                                                                                                                                                                |
| `background`         | string | 아니요 | `auto` | `transparent` / `opaque` / `auto`. `transparent`을 사용하는 경우 `output_format`는 `png` 또는 `webp`이어야 하며, `jpeg`와 함께 사용하면 400이 반환됩니다. [투명 배경 FAQ](/ko/faq/image-transparent-background)를 참조하십시오                                                       |
| `moderation`         | string | 아니요 | `auto` | `auto` / `low` (낮은 강도의 조정)                                                                                                                                                                                                                    |
| `n`                  | int    | 아니요 | 1      | 1만 지원됩니다                                                                                                                                                                                                                                      |

<Warning>
  **`quality`에 레거시 DALL·E 값 `standard` / `hd`를 전달하지 마십시오.** 공식 enum 값 6개 `low` / `medium` / `high` / `xhigh` / `max` / `auto`만 허용됩니다(`xhigh` / `max`는 두 2.5 모델에서만 허용됨). 레거시 값은 백엔드 채널에 따라 일관되지 않게 동작합니다. 경우에 따라 400(`invalid_value`)과 함께 즉시 실패하고, 경우에 따라 조용히 무시되어 요청이 `auto`에서 실행됩니다(예측할 수 없는 비용). 항상 공식 값 중 하나를 명시적으로 전달하십시오.
</Warning>

<Tip>
  자세한 제약 조건, 허용되는 값 및 예시는 오른쪽의 플레이그라운드에서 확인할 수 있으며, 모든 enum 필드는 드롭다운 선택을 지원합니다.
</Tip>

## 응답 형식

```json theme={null}
{
    "created": 1776832476,
    "data": [
        {
            "b64_json": "iVBORw0KGgoAAAANSUhEUgAA..."
        }
    ],
    "usage": {
        "input_tokens": 17,
        "input_tokens_details": {
            "image_tokens": 0,
            "text_tokens": 17
        },
        "output_tokens": 196,
        "output_tokens_details": {
            "image_tokens": 196,
            "text_tokens": 0
        },
        "total_tokens": 213
    }
}
```

<Warning>
  **⚠️ b64\_json은 원시 base64입니다**, **`data:image/...;base64,` 접두사 없이**입니다. 클라이언트는 다음을 수행해야 합니다:

  * **파일 쓰기**: `base64.b64decode(b64_str)` → 디스크에 기록
  * **브라우저 렌더링**: `data:image/png;base64,`을 수동으로 앞에 붙입니다

  2026년 7월 기준, `gpt-image-2-all` / `gpt-image-2-vip`도 원시 base64를 반환하지만, 이전 버전에는 접두사가 포함되어 있었습니다 — 모델 간에 코드를 공유할 때는 항상 먼저 `startsWith('data:')`를 확인하십시오.
</Warning>

<Info>
  `usage` 필드는 이 호출에 대해 실제로 과금된 token 수를 나타냅니다. `input_tokens_details` / `output_tokens_details`은 텍스트 token과 이미지 token을 별도로 분리합니다(`image_tokens`은 일반 text-to-image의 경우 항상 0입니다). 전체 필드 참고와 셀프서비스 비용 계산 공식은 개요 페이지의 [각 호출의 실제 token 수를 확인하는 방법](/ko/api-capabilities/gpt-image-2/overview#how-to-check-the-real-token-count-for-each-call)을 참조하십시오.
</Info>


## OpenAPI

````yaml api-reference/gpt-image-2-generate-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: gpt-image-2.5 / 2 Text-to-Image API
  description: >
    OpenAI GPT-Image 2.5 / 2 series (`gpt-image-2.5-flare` /
    `gpt-image-2.5-sunburst` / `gpt-image-2`) — text-to-image endpoint. Same
    price and parameters across all three.


    - Any valid resolution (1K / 2K / 4K, up to 3840×2160)

    - Quality tiers: low / medium / high / xhigh / max / auto (xhigh / max
    accepted by the two 2.5 models only)

    - Output formats: png (default) / jpeg / webp

    - Native Chinese prompt support

    - Single image per call (n=1)

    - Speed: flare is fastest; sunburst and gpt-image-2 are slower (4K high
    quality can take several minutes)

    - **Not supported**: transparent background (`background: transparent` will
    error)


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
  /v1/images/generations:
    post:
      tags:
        - Text-to-Image
      summary: 'Text-to-Image: generate image from text prompt'
      description: >
        Generate an image from a text prompt using `gpt-image-2.5-flare` /
        `gpt-image-2.5-sunburst` / `gpt-image-2`.


        - Required: `model`, `prompt`

        - Optional: `size`, `quality`, `output_format`, `output_compression`,
        `background`, `moderation`, `n`

        - Custom sizes must satisfy: max edge ≤ 3840px, both edges multiples of
        16, ratio ≤ 3:1, total pixels 0.65MP–8.3MP

        - For reference-image editing or multi-image fusion, use [Image Edit
        endpoint](/en/api-capabilities/gpt-image-2/image-edit)
      operationId: generateGptImage2TextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TextToImageRequest'
            example:
              model: gpt-image-2.5-flare
              prompt: Cyberpunk city at night, neon sign closeup, cinematic frame
              size: 2048x1152
              quality: high
              output_format: jpeg
              output_compression: 85
      responses:
        '200':
          description: Image generated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: >-
            Invalid parameters (size constraint violation, input_fidelity
            passed, background:transparent, etc.)
        '401':
          description: Unauthorized - invalid API Key
        '403':
          description: Content moderation block
        '429':
          description: Rate limit or quota exceeded
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
            Model name. gpt-image-2.5-flare (speed-first) /
            gpt-image-2.5-sunburst (quality- and editing-first) / gpt-image-2
            (previous generation) share the same price and parameters; pin a
            dated snapshot in production
          enum:
            - gpt-image-2.5-flare
            - gpt-image-2.5-sunburst
            - gpt-image-2
            - gpt-image-2.5-flare-2026-09-08
            - gpt-image-2.5-sunburst-2026-09-08
          default: gpt-image-2.5-flare
        prompt:
          type: string
          maxLength: 32000
          description: >-
            Prompt text, up to 32,000 characters (provider limit, counted in
            characters). Supports both Chinese and English. Place scene
            description at the front for better adherence.
          example: Cyberpunk city at night, neon sign closeup, cinematic frame
        size:
          type: string
          description: >
            Output size. Presets: 1024x1024 / 1536x1024 / 1024x1536 / 2048x2048
            / 2048x1152 / 3840x2160 / 2160x3840.

            Also accepts any valid custom size (max edge ≤ 3840, both multiples
            of 16, ratio ≤ 3:1, total pixels 0.65–8.3MP).
          example: 2048x1152
          default: auto
        quality:
          type: string
          description: >-
            Quality tier. low (sketches/batch), medium (daily), high (final/fine
            text), xhigh / max (new in 2.5: higher quality and cost, rejected by
            gpt-image-2), auto (default)
          enum:
            - auto
            - low
            - medium
            - high
            - xhigh
            - max
          default: auto
        output_format:
          type: string
          description: Output format
          enum:
            - png
            - jpeg
            - webp
          default: png
        output_compression:
          type: integer
          description: Output compression (0–100), only effective for jpeg/webp
          minimum: 0
          maximum: 100
          example: 85
        background:
          type: string
          description: >-
            Background mode. auto (default) or opaque. **Not supported**:
            transparent
          enum:
            - auto
            - opaque
          default: auto
        moderation:
          type: string
          description: Moderation strength. auto (default) or low
          enum:
            - auto
            - low
          default: auto
        'n':
          type: integer
          description: Number of images. This model only supports 1
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
          description: Generation results (this model returns 1 image per call)
          items:
            type: object
            properties:
              b64_json:
                type: string
                description: >-
                  **Raw base64 string** (no data:image/...;base64, prefix).
                  Client must decode to file or prepend prefix.
                example: iVBORw0KGgoAAAANSUhEUgAA...
        usage:
          type: object
          description: Token usage for this call (used for token-based billing)
          properties:
            input_tokens:
              type: integer
              example: 42
            output_tokens:
              type: integer
              example: 6240
            total_tokens:
              type: integer
              example: 6282
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key obtained from APIYI Console

````