> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Text-to-Image API 레퍼런스

> 실시간 Playground를 제공하는 MAI-Image 2.6 Text-to-Image API 레퍼런스 — 텍스트 prompt로부터 생성, 최대 1536×1536 영역까지 사용자 정의 너비/높이 지원, 항상 PNG base64를 반환합니다

<Info>
  오른쪽의 인터랙티브 Playground에서 온라인으로 테스트할 수 있습니다. **Authorization** 항목에 API 키를 입력하고(형식: `Bearer sk-xxx`), `model`을(를) 선택한 후 `prompt`을(를) 입력하고, 필요에 따라 `width` / `height`을(를) 설정한 뒤 전송하십시오.
</Info>

<Tip>
  **사용 사례**: 이 페이지는 텍스트를 통한 이미지 생성 전용입니다. 기존 이미지를 수정하려면 [이미지 편집 API](/ko/api-capabilities/mai-image/image-edit)를 사용하십시오.
</Tip>

<Warning>
  **⚠️ 세 가지 파라미터는 400을 반환합니다**

  이 시리즈는 `response_format`, `seed` 또는 `negative_prompt`을(를) 지원하지 않으며, 이 중 하나라도 전송하면 400 `Invalid parameters: xxx`이(가) 반환됩니다. gpt-image / DALL·E에서 마이그레이션하는 경우 먼저 `response_format`을(를) 제거하십시오. 응답은 항상 `data[0].b64_json`입니다.
</Warning>

<Warning>
  **⚠️ size 대신 width + height를 사용하십시오**

  이 엔드포인트는 **별도의 알림 없이 `size`을(를) 무시하며** 항상 1024×1024 크기로 렌더링합니다. 정수형 `width` + `height`을(를) 함께 사용하십시오(항상 세트로 지정): 각 변 ≥ 768, width × height ≤ 2,359,296(1536×1536 면적).
</Warning>

<Info>
  모든 이미지 API는 **동기식**입니다. 비동기 작업 ID가 제공되지 않습니다. 클라이언트 연결이 끊어지면 결과가 유실되지만 요청에 대한 과금은 정상 처리됩니다. 1024×1024 이미지는 Flash에서 약 17초, 2.6에서 약 30초가 소요됩니다. **클라이언트 타임아웃을 Flash는 최소 120초, 2.6은 최소 180초로 설정하십시오.** 자세한 내용은 [이미지 API 필수 사항 및 모범 사례](/ko/api-capabilities/image-api-best-practices)를 참조하십시오.
</Info>

## 코드 예제

### Python (OpenAI SDK)

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    timeout=180.0  # synchronous call, give it enough time
)

resp = client.images.generate(
    model="MAI-Image-2.6-Flash",
    prompt='A traditional teahouse storefront with a wooden sign that reads "Welcome", red lanterns, warm dusk light, photorealistic',
    # width / height are not standard OpenAI SDK fields, so pass them via extra_body
    # Do not pass response_format: it returns 400
    extra_body={"width": 1024, "height": 1024}
)

with open("out.png", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### Python (requests)

```python theme={null}
import base64
import os
import requests

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"},
    json={
        "model": "MAI-Image-2.6",
        "prompt": "A red fox sitting on a mossy rock in a misty forest, soft morning light, photorealistic",
        "width": 1536,
        "height": 1024
    },
    timeout=180
)
response.raise_for_status()

with open("out.png", "wb") as f:
    f.write(base64.b64decode(response.json()["data"][0]["b64_json"]))
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MAI-Image-2.6-Flash",
    "prompt": "A minimalist coffee shop poster with the headline \"Autumn Special\" at the top, warm brown palette",
    "width": 1024,
    "height": 1536
  }' | python3 -c "import sys,json,base64; open('out.png','wb').write(base64.b64decode(json.load(sys.stdin)['data'][0]['b64_json']))"
```

### Node.js (fetch)

```javascript theme={null}
import fs from 'node:fs';

const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.APIYI_API_KEY}`
    },
    body: JSON.stringify({
        model: 'MAI-Image-2.6-Flash',
        prompt: 'A serene Japanese garden with cherry blossoms, koi pond, golden hour',
        width: 1792,
        height: 1008               // 16:9; width × height must not exceed 2,359,296
    }),
    signal: AbortSignal.timeout(120000)
});

const data = await resp.json();
fs.writeFileSync('out.png', Buffer.from(data.data[0].b64_json, 'base64'));
```

### 여러 장의 이미지가 필요한 경우: 병렬 요청 전송

text-to-image 엔드포인트는 1회 호출당 1장의 이미지를 반환하므로(`n`은 적용되지 않음), 요청을 병렬로 실행하십시오:

```python theme={null}
import base64, os, requests
from concurrent.futures import ThreadPoolExecutor

def gen(i):
    r = requests.post(
        "https://api.apiyi.com/v1/images/generations",
        headers={"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"},
        json={"model": "MAI-Image-2.6-Flash", "prompt": "a watercolor lighthouse at dusk"},
        timeout=120
    )
    r.raise_for_status()
    open(f"out-{i}.png", "wb").write(base64.b64decode(r.json()["data"][0]["b64_json"]))

with ThreadPoolExecutor(max_workers=4) as pool:
    list(pool.map(gen, range(4)))
```

## 파라미터 레퍼런스

| 파라미터 | 타입 | 필수 여부 | 기본값 | 설명 |
| - | - | - | - | - |
| `model` | string | ✅ | — | `MAI-Image-2.6` (\$0.12/이미지) 또는 `MAI-Image-2.6-Flash` (\$0.06/이미지), **대소문자 구분** |
| `prompt` | string | ✅ | — | 모든 언어의 prompt를 지원합니다. 이미지에 표시되어야 하는 텍스트는 따옴표로 감싸십시오 |
| `width` | integer | ❌ | `1024` | 출력 너비입니다. ≥ 768이어야 하며, 반드시 `height`와(과) 함께 전송되어야 하고 16의 배수로 내림됩니다 |
| `height` | integer | ❌ | `1024` | 출력 높이입니다. ≥ 768; 너비 × 높이 ≤ 2,359,296 |
| ~~`response_format`~~ | — | — | — | **400을 반환합니다**; 응답은 항상 `b64_json`입니다 |
| ~~`seed`~~ / ~~`negative_prompt`~~ | — | — | — | **400을 반환합니다** |
| ~~`size`~~ | — | — | — | 이 엔드포인트에서는 **조용히 무시됩니다** |
| ~~`n`~~ | — | — | — | 이 엔드포인트에서는 아무런 영향을 주지 않으며, 항상 1장의 이미지만 생성됩니다 |

<Info>
  `quality`, `output_format`, `background`, `style` 및 기타 OpenAI 스타일 필드는 조용히 무시됩니다. 출력은 항상 PNG입니다.
</Info>

## 응답 형식

```json theme={null}
{
  "created": 1790999642,
  "data": [
    {
      "b64_json": "iVBORw0KGgoAAAANSUhEUgAABAAAAAQACAIAAADwf7zU..."
    }
  ],
  "usage": {
    "prompt_tokens": 1000,
    "total_tokens": 1000,
    "input_tokens": 1000,
    "output_tokens": 0
  }
}
```

<Warning>
  **응답 필드**

  * `b64_json`은(는) **`data:image/png;base64,` 접두사가 없는 순수 base64**입니다. 이를 직접 디코딩하여 PNG를 가져올 수 있습니다.
  * `url` 필드가 없으며, `revised_prompt`도 없습니다.
  * 1024×1024 PNG는 약 1.5–1.7 MB(base64 기준 2.1–2.3 MB)이며, 1536×1536은 약 4–5 MB입니다. 클라이언트의 응답 크기 제한을 확인하시기 바랍니다.
</Warning>

<Info>
  **`usage`(으)로 과금을 대조하지 마십시오**: `prompt_tokens`은 항상 1000 × 이미지 수이고 `output_tokens`는 항상 0이며, 이는 플레이스홀더입니다. 이 시리즈는 이미지당 과금되며, APIYI 콘솔 청구 내역이 공식 기준입니다.
</Info>


## OpenAPI

````yaml api-reference/mai-image-generate-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: MAI-Image 2.6 Text-to-Image API
  description: >
    Microsoft MAI-Image 2.6 image generation — text-to-image endpoint.


    - Two models: `MAI-Image-2.6` (flagship, \$0.12/image) and
    `MAI-Image-2.6-Flash` (fast, \$0.06/image); model names are case-sensitive

    - Flat per-image pricing, **regardless of size**

    - Size via `width` + `height` (integers, always together): each side ≥ 768,
    width × height ≤ 2,359,296

    - Always returns 1 PNG in `data[0].b64_json` (plain base64, no `data:`
    prefix)


    **⚠️ Do not send `response_format` / `seed` / `negative_prompt`**: all three
    return 400.

    `size` is silently ignored on this endpoint.


    **Authentication**: add `Authorization: Bearer YOUR_API_KEY` to the request
    headers


    **Get an API key**: create a token in the [APIYI
    console](https://api.apiyi.com/token)
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
      summary: 'Text-to-image: generate an image from a text prompt'
      description: >
        Generate an image from a text prompt with MAI-Image 2.6.


        - Required: `model`, `prompt`

        - Optional: `width`, `height` (always together; default 1024×1024 when
        both are omitted)

        - Sizes that are not multiples of 16 are rounded down to a multiple of
        16

        - `n` has no effect; each call returns 1 image. Send parallel requests
        for more
      operationId: generateMaiImageTextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/MaiImageGenerateRequest'
      responses:
        '200':
          description: Image generated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: >-
            Invalid parameters (size out of range: `unsupported_request_value`;
            unsupported parameter: `invalid_request`), or blocked by moderation
            (`content_safety_violation`)
        '401':
          description: Unauthorized - invalid API key
        '404':
          description: >-
            Request sent to chat / responses; this series only supports the
            Images API
        '429':
          description: Rate limit exceeded or insufficient balance
        '503':
          description: Wrong model-name case, or no available channel in the current group
      security:
        - bearerAuth: []
components:
  schemas:
    MaiImageGenerateRequest:
      type: object
      required:
        - model
        - prompt
      properties:
        model:
          type: string
          description: Model ID (case-sensitive). 2.6 favors quality, Flash favors speed
          enum:
            - MAI-Image-2.6-Flash
            - MAI-Image-2.6
          default: MAI-Image-2.6-Flash
        prompt:
          type: string
          description: >-
            Prompt in any language. Put text that should appear in the image in
            quotes
          example: >-
            A traditional teahouse storefront with a wooden sign that reads
            "Welcome", red lanterns, warm dusk light, photorealistic
        width:
          type: integer
          description: >
            Output width in pixels. Each side ≥ 768, width × height ≤ 2,359,296
            (a 1536×1536 area);

            must be sent together with `height`; rounded down to a multiple of
            16.
          minimum: 768
          default: 1024
          example: 1024
        height:
          type: integer
          description: Output height in pixels, same rules as `width`
          minimum: 768
          default: 1024
          example: 1024
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
          description: Creation timestamp
          example: 1790999642
        data:
          type: array
          description: Image results; always 1 item for text-to-image
          items:
            type: object
            properties:
              b64_json:
                type: string
                description: 'Plain base64 image data (PNG, no data: prefix)'
        usage:
          type: object
          description: >
            **Placeholder values, not for billing reconciliation.**
            `prompt_tokens` is always `1000 × images` and `output_tokens` is
            always 0.

            The console bill is authoritative.
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
      description: API key from the APIYI console

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.