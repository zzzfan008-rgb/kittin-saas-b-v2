> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 텍스트-이미지 API 레퍼런스

> Grok Imagine 2 텍스트-이미지 API 레퍼런스 및 실시간 테스트 — prompt만으로 생성하는 방식으로 5개 화면 비율, 1K/2K 등급, 호출당 최대 10장까지 이미지 생성

<Info>
  오른쪽의 대화형 플레이그라운드에서 엔드포인트를 직접 테스트할 수 있습니다. **Authorization**에 API 키를 입력하고(형식: `Bearer sk-xxx`), `prompt`을 입력한 다음, `aspect_ratio` / `resolution`를 선택하고 전송합니다.
</Info>

<Tip>
  **이 페이지를 사용할 때**: prompt만으로 하는 text-to-image 생성입니다 — 이미지 업로드는 포함되지 않습니다. 기존 이미지를 수정하거나 여러 이미지를 합치려면 [Image Editing 엔드포인트](/ko/api-capabilities/grok-imagine-image/image-edit)를 사용하십시오.
</Tip>

<Warning>
  **⚠️ 이 엔드포인트로 참조 이미지를 보내지 마십시오**

  여기서 `image` / `image_url` / `images`를 전달해도 **오류가 발생하지 않습니다**. 200을 반환하고 prompt에서 새 이미지를 생성합니다 — **참조 이미지는 조용히 버려지며 여전히 과금됩니다**.

  오류 신호가 없으므로, 보통은 출력이 입력과 전혀 관련이 없다는 것을 누군가 알아차릴 때서야 드러납니다. **참조 이미지가 포함된 모든 워크플로우는 [`/v1/images/edits`](/ko/api-capabilities/grok-imagine-image/image-edit)를 사용해야 합니다.**
</Warning>

<Warning>
  **⚠️ 잘못된 매개변수는 오류를 발생시키지 않습니다**

  잘못된 `aspect_ratio`(예: `5:7`), `resolution`(예: `1K`, `1024x1024`) 및 `response_format`(예: `base64`)는 모두 **기본값으로 조용히 되돌아가며** 여전히 이미지를 반환합니다. 출력이 예상과 다르면 먼저 매개변수 철자를 확인하십시오 — `resolution` 값은 소문자 `1k` / `2k`입니다.

  예외가 하나 있습니다: `resolution: "4k"`는 `503 model_service_unavailable`를 반환하며, 이는 **티어가 지원되지 않음**을 의미하고 채널이 다운되었다는 뜻이 아닙니다. 재시도해도 도움이 되지 않습니다.
</Warning>

<Info>
  모든 이미지 API는 **동기식**입니다: 비동기 작업 ID가 없으므로, 클라이언트 연결이 끊기면 요청이 아직 과금되는 동안 결과를 잃게 됩니다. 1K는 약 9초, 2K는 약 15\~17초가 걸리므로 **클라이언트 타임아웃을 360초로 설정하십시오** — [Image API 모범 사례](/ko/api-capabilities/image-api-best-practices)를 참조하십시오.
</Info>

## 코드 예제

### Python (OpenAI SDK)

```python theme={null}
from openai import OpenAI
import urllib.request

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    timeout=360.0  # image APIs are synchronous — allow plenty of time
)

resp = client.images.generate(
    model="grok-imagine-image",
    prompt="A photorealistic red wooden boat moored on a glassy alpine lake at dawn, "
           "mist over the water, snow-capped peaks behind, cinematic photography",
    n=1,
    # aspect_ratio / resolution are not standard OpenAI SDK fields — pass via extra_body
    extra_body={
        "aspect_ratio": "16:9",
        "resolution": "1k",
        "response_format": "url"
    }
)

# response_format defaults to url, returning a direct link (.jpg for 1K, .png for 2K)
urllib.request.urlretrieve(resp.data[0].url, "out.jpg")
```

### Python (raw 요청)

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
        "model": "grok-imagine-image",
        "prompt": "Cyberpunk city on a rainy night, neon signage close-up, cinematic lighting",
        "n": 1,
        "aspect_ratio": "16:9",
        "resolution": "2k",          # 2k returns PNG at 5-6 MB per image
        "response_format": "b64_json"
    },
    timeout=360  # 2K takes 15-17s and longer at peak; 60s causes spurious timeouts
).json()

# b64_json is raw base64 with no data: prefix — decode and write directly
with open("out.png", "wb") as f:
    f.write(base64.b64decode(response["data"][0]["b64_json"]))
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "grok-imagine-image-quality",
    "prompt": "An orange tabby cat wearing sunglasses at a seaside bar, photorealistic, warm sunset tones",
    "n": 1,
    "aspect_ratio": "16:9",
    "resolution": "1k",
    "response_format": "url"
  }'
```

### Node.js (기본 fetch)

```javascript theme={null}
import fs from 'node:fs';

const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'grok-imagine-image',
        prompt: 'A serene Japanese garden with cherry blossoms, koi pond, golden hour',
        n: 2,                       // up to 10 per call, billed per image
        aspect_ratio: '4:3',
        resolution: '1k',
        response_format: 'url'
    }),
    // Node 18+ has no default timeout — use AbortSignal.timeout in production
    signal: AbortSignal.timeout(360000)
});

const data = await resp.json();

// with n=2 the data array holds two entries — download each
for (const [i, item] of data.data.entries()) {
    const img = await fetch(item.url);
    fs.writeFileSync(`out-${i}.jpg`, Buffer.from(await img.arrayBuffer()));
}
```

### 브라우저 JavaScript

```javascript theme={null}
// ⚠️ Demo only: a front-end key is exposed — use a backend proxy in production
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'grok-imagine-image',
        prompt: 'a minimalist poster of a mountain at sunrise, flat vector style',
        aspect_ratio: '3:4',
        resolution: '1k',
        response_format: 'url'   // url is far lighter than b64_json in a browser
    })
});

const data = await resp.json();
document.querySelector('#preview').src = data.data[0].url;
```

## 매개변수 참조

| 매개변수              | 유형      | 필수 여부 | 기본값   | 설명                                                                               |
| ----------------- | ------- | ----- | ----- | -------------------------------------------------------------------------------- |
| `model`           | string  | ✅     | —     | `grok-imagine-image` (\$0.02/이미지) 또는 `grok-imagine-image-quality` (\$0.045/이미지)  |
| `prompt`          | string  | ✅     | —     | 영어 또는 중국어로 된 prompt입니다. 주제, 장면, 스타일, 조명을 설명하십시오                                  |
| `n`               | integer | ❌     | `1`   | 호출당 이미지 수, **1-10**, 이미지당 과금됩니다. `0`는 `1`가 되며; `≥11`은 400을 반환합니다                 |
| `aspect_ratio`    | string  | ❌     | `1:1` | `1:1` / `16:9` / `9:16` / `4:3` / `3:4`; 다른 값은 조용히 `1:1`로 대체됩니다                  |
| `resolution`      | string  | ❌     | `1k`  | `1k` (JPEG, \~1 MP) 또는 `2k` (PNG, \~4.2-4.5 MP). **가격은 동일합니다**; `4k`은 503을 반환합니다 |
| `response_format` | string  | ❌     | `url` | `url`은 직접 링크를 반환하고; `b64_json`은 원시 base64를 반환합니다(**no** `data:` 접두사)             |

**비율별 실제 출력 픽셀 수:**

| `aspect_ratio` | `1k`      | `2k`      |
| -------------- | --------- | --------- |
| `1:1`          | 1024x1024 | 2048x2048 |
| `16:9`         | 1280x720  | 2816x1584 |
| `9:16`         | 720x1280  | 1584x2816 |
| `4:3`          | 1152x864  | 2368x1776 |
| `3:4`          | 864x1152  | 1776x2368 |

<Info>
  `seed`은 지원되지 않습니다(오류 없이 수락되지만 아무 효과가 없으며 — 결과를 재현할 수 없습니다), 마스크 inpainting도 지원되지 않습니다. `size` / `quality` / `style`와 같은 OpenAI 스타일 필드는 조용히 무시됩니다.
</Info>

## 응답 형식

```json theme={null}
{
  "created": 0,
  "data": [
    {
      "url": "https://apac.ossforai.com/2026/08/12/1ab87d04-3637-464f-bafd-f026cac05dd3.jpg"
    }
  ],
  "usage": {
    "prompt_tokens": 1000,
    "total_tokens": 1000,
    "output_tokens": 0
  }
}
```

<Warning>
  **응답 필드의 함정**

  * 각 `data[]` 항목에는 `response_format`에 따라 **`url` 또는 `b64_json` 중 하나만** 포함됩니다 — 둘 다 포함되지 않습니다.
  * **`revised_prompt`은 반환되지 않습니다**, 또한 `respect_moderation` / `model`도 반환되지 않습니다. 존재한다고 가정하지 마십시오.
  * `b64_json`은 **`data:image/...;base64,` 접두사가 없는 원시 base64**입니다 — 직접 디코딩하십시오.
  * `created`는 항상 `0`이며 타임스탬프로 사용할 수 없습니다.
  * `n > 1`을 사용할 때 `data` 배열에는 여러 항목이 들어 있습니다 — `data[0]`만 읽지 마십시오.
</Warning>

<Info>
  **`usage`는 정산에 사용할 수 없습니다**: `prompt_tokens`은 실제 prompt 길이와 무관하게 항상 `1000 x n`입니다. 이 계열은 이미지당 정액 요금(\$0.02 / \$0.045)으로 과금됩니다; 실제 청구 금액은 APIYI 콘솔 과금 기록을 사용하십시오.
</Info>


## OpenAPI

````yaml api-reference/grok-imagine-image-generate-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: Grok Imagine 2 Text-to-Image API
  description: >
    xAI Grok Imagine 2 image generation models — text-to-image endpoint.


    - Two models: `grok-imagine-image` (standard, \$0.02 per image),
    `grok-imagine-image-quality` (high quality, \$0.045 per image)

    - Flat per-request pricing — **1K and 2K cost the same**

    - 5 aspect ratios x 2 resolution tiers, all parameters genuinely take effect

    - Up to 10 images per request (`n` from 1 to 10)

    - 1K returns JPEG (~220-300 KB), 2K returns PNG (~5-6 MB)


    **⚠️ This endpoint does not accept reference images**: passing `image` /
    `image_url` / `images`

    returns 200 with a normal image, but the reference is silently discarded and
    you are still billed.

    For reference-image editing use the

    [Image Editing endpoint](/en/api-capabilities/grok-imagine-image/image-edit)
    (`multipart/form-data`).


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
      summary: 'Text-to-image: generate images from a text prompt'
      description: >
        Generate images from a text prompt with Grok Imagine 2 models.


        - Required: `model`, `prompt`

        - Optional: `n`, `aspect_ratio`, `resolution`, `response_format`

        - Invalid values do not raise errors — they **silently fall back to the
        default**
          (e.g. `aspect_ratio: "5:7"` is treated as `1:1`)
        - `resolution: "4k"` returns 503 `model_service_unavailable` — this is
        an unsupported
          parameter tier, not a channel outage
        - `seed` is not supported; repeated calls with the same prompt are not
        reproducible
      operationId: generateGrokImagineTextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/GrokImagineGenerateRequest'
      responses:
        '200':
          description: Images generated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: >-
            Invalid parameters, or prompt blocked by content moderation (both
            share the `invalid_request` code)
        '401':
          description: Unauthorized - invalid API Key
        '429':
          description: Rate limit exceeded or insufficient balance
        '503':
          description: >-
            Unsupported parameter tier (e.g. `resolution: 4k`), or no available
            channel in the current Group
      security:
        - bearerAuth: []
components:
  schemas:
    GrokImagineGenerateRequest:
      type: object
      required:
        - model
        - prompt
      properties:
        model:
          type: string
          description: >-
            Model ID. The quality variant delivers higher fidelity at a higher
            price
          enum:
            - grok-imagine-image
            - grok-imagine-image-quality
          default: grok-imagine-image
        prompt:
          type: string
          description: >-
            Prompt, English or Chinese. Describe subject, scene, style and
            lighting in detail
          example: >-
            A photorealistic red wooden boat moored on a glassy alpine lake at
            dawn, mist over the water, snow-capped peaks behind, cinematic
            photography
        'n':
          type: integer
          description: >-
            Number of images, 1-10. Values of 11 or above return 400; 0 is
            silently treated as 1
          minimum: 1
          maximum: 10
          default: 1
          example: 1
        aspect_ratio:
          type: string
          description: >
            Output aspect ratio. Actual pixel dimensions per resolution tier:


            | Aspect ratio | `1k` | `2k` |

            |---|---|---|

            | `1:1` | 1024x1024 | 2048x2048 |

            | `16:9` | 1280x720 | 2816x1584 |

            | `9:16` | 720x1280 | 1584x2816 |

            | `4:3` | 1152x864 | 2368x1776 |

            | `3:4` | 864x1152 | 1776x2368 |


            Values outside this enum do not raise an error — they silently fall
            back to `1:1`.
          enum:
            - '1:1'
            - '16:9'
            - '9:16'
            - '4:3'
            - '3:4'
          default: '1:1'
          example: '16:9'
        resolution:
          type: string
          description: >
            Resolution tier. `1k` is roughly 0.9-1.05 megapixels and returns
            JPEG;

            `2k` is roughly 4.2-4.5 megapixels and returns PNG (5-6 MB per
            image).

            **Both tiers cost the same.**


            `4k` returns 503; other invalid values (such as `1K` or `1024x1024`)
            silently fall back to `1k`.
          enum:
            - 1k
            - 2k
          default: 1k
          example: 1k
        response_format:
          type: string
          description: >
            Response format. `url` returns a direct image link (no signed query
            params);

            `b64_json` returns a raw base64 string (**without** the `data:`
            prefix).


            Invalid values silently fall back to the default `url`.
          enum:
            - url
            - b64_json
          default: url
          example: url
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
          description: >-
            Creation timestamp. Always 0 for this model — do not use it for
            timing
          example: 0
        data:
          type: array
          description: Array of image results, length equals the requested `n`
          items:
            type: object
            properties:
              url:
                type: string
                description: >-
                  Direct image link, returned when `response_format=url`. .jpg
                  for 1K, .png for 2K
                example: >-
                  https://apac.ossforai.com/2026/08/12/1ab87d04-3637-464f-bafd-f026cac05dd3.jpg
              b64_json:
                type: string
                description: >-
                  Raw base64 image data, returned when
                  `response_format=b64_json` (no data: prefix)
        usage:
          type: object
          description: >
            **Placeholder values — do not use for billing reconciliation.**
            `prompt_tokens` is always

            `1000 x n`, regardless of actual prompt length. Use the Console
            billing records instead.
          properties:
            prompt_tokens:
              type: integer
              example: 1000
            total_tokens:
              type: integer
              example: 1000
            output_tokens:
              type: integer
              example: 0
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key created in the APIYI Console

````