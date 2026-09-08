> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 텍스트-투-이미지 API 레퍼런스

> gpt-image-2-all 텍스트-투-이미지 API 레퍼런스 및 인터랙티브 플레이그라운드 — 텍스트 프롬프트로 이미지를 생성합니다, $0.03/이미지

<Info>
  오른쪽의 대화형 Playground는 직접 온라인 테스트를 지원합니다. **Authorization** 필드에 API 키를 입력하고(형식: `Bearer sk-xxx`), prompt를 입력한 뒤 전송을 클릭합니다.
</Info>

<Tip>
  **범위**: 이 페이지는 **텍스트-투-이미지 생성**용입니다. prompt만 입력하면 되며 이미지 업로드는 필요하지 않습니다. 기존 이미지를 편집하거나 합성하려면 [이미지 편집 엔드포인트](/ko/api-capabilities/gpt-image-2-all/image-edit)를 사용하십시오.
</Tip>

<Warning>
  **🖥️ 브라우저 Playground 제한(기본 b64\_json 모드)**

  이 엔드포인트는 기본적으로 `response_format: "b64_json"`를 사용하므로, 응답에 수 MB 크기의 base64 문자열이 포함되고 브라우저 Playground에 `请求时发生错误: unable to complete request`가 표시될 수 있습니다. — **요청은 실제로 성공한 것입니다**; 브라우저가 이렇게 긴 base64 문자열을 렌더링할 수 없을 뿐입니다.

  **권장 워크플로**:

  * Playground에서 이미지만 확인하고 싶으신가요? **`"response_format": "url"`를 명시적으로 전달하십시오** — 응답은 단일 R2 링크이며 문제없이 렌더링됩니다.
  * base64가 필요하신가요? **아래 코드 샘플을 복사해 로컬에서 실행하십시오** — 코드가 이미지를 자동으로 디코딩하고 파일로 저장합니다.
</Warning>

<Info>
  모든 이미지 API는 **동기식**입니다 — 조회할 task ID가 없으며, 클라이언트가 연결을 끊으면 요청은 여전히 과금된 상태로 유지되지만 결과는 사라집니다. 이 모델에는 넉넉한 timeout을 설정하십시오. [Image API Essentials & Best Practices](/ko/api-capabilities/image-api-best-practices)를 참조하십시오.
</Info>

<Warning>
  **⚠️ 파라미터 지원**

  * **`size`**: **이 필드는 효과가 없습니다** — `auto`나 어떤 구체적인 값을 보내도 오류는 발생하지 않지만, 해당 값은 서버에서 **조용히 무시됩니다**. 크기는 전적으로 prompt에 의해 결정됩니다:
    * prompt에 크기/비율이 언급된 경우(예: "Landscape 16:9") → 모델이 prompt를 따릅니다
    * prompt에 크기 힌트가 없는 경우 → 같은 prompt라도 호출마다 **서로 다른 크기**가 나오며, 마치 "다른 카드를 뽑는 것"과 같습니다 — 여러 구성을 탐색할 때 유용합니다
    * 크기를 엄격하게 고정하려면 [`gpt-image-2-vip`](/ko/api-capabilities/gpt-image-2-vip/text-to-image)를 사용하십시오(`auto` + 30개의 명시적 크기 지원)
  * **`n` / `quality` / `aspect_ratio`**: ❌ 거부됩니다. 이를 보내면 파라미터 검증 오류가 발생할 수 있습니다.

  크기와 비율은 `prompt`에 직접 작성하십시오. 예:

  * `Landscape 16:9 cinematic, old lighthouse by the sea at dusk`
  * `Portrait 9:16 phone wallpaper, cyberpunk city rainy night`
  * `1024×1024 square logo, minimalist cat line art`

  **크기 설명은 prompt의 앞부분에 두십시오**. 그래야 반영이 더 잘됩니다.
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
        "model": "gpt-image-2-all",
        "prompt": "Landscape 16:9 cinematic, old lighthouse at sunset, photorealistic",
        "response_format": "url"
    },
    timeout=300  # conservative — absorbs tail latency + image download time
).json()

image_url = response["data"][0]["url"]
print(image_url)
```

**b64\_json 모드 (base64 이미지 데이터를 반환합니다)**:

```python theme={null}
import base64
import requests

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={"Authorization": "Bearer sk-your-api-key"},
    json={
        "model": "gpt-image-2-all",
        "prompt": "1024x1024 square logo, minimalist cat line art",
        "response_format": "b64_json"
    },
    timeout=300  # conservative — absorbs tail latency + image download time
).json()

# Verified 2026-07: b64_json is raw base64 (no data: prefix); earlier versions included the prefix — a check is safest
b64 = response["data"][0]["b64_json"]
if b64.startswith("data:"):
    b64 = b64.split(",", 1)[1]
with open("output.png", "wb") as f:
    f.write(base64.b64decode(b64))
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2-all",
    "prompt": "Landscape 16:9 cinematic, old lighthouse at sunset",
    "response_format": "url"
  }'
```

### Node.js

```javascript theme={null}
import { Agent, setGlobalDispatcher } from "undici";
import { writeFile } from "node:fs/promises";

const API_KEY = "sk-your-api-key";

// Image endpoints mean long silences plus MB-scale bodies, while undici's default
// connect timeout is only 10s and is NOT governed by AbortSignal.timeout below
// (different layers) — widen all three explicitly
setGlobalDispatcher(new Agent({
  connect: { timeout: 30_000 },
  headersTimeout: 300_000,
  bodyTimeout: 300_000,
}));

const response = await fetch(
  "https://api.apiyi.com/v1/images/generations",
  {
    method: "POST",
    signal: AbortSignal.timeout(300_000),   // total timeout — a different layer
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-image-2-all",
      prompt: "1024x1024 square logo, minimalist cat line art",
      response_format: "b64_json"
    })
  }
);

const data = await response.json();
// Verified raw base64 (no data: prefix); earlier versions included one, so check first
let b64 = data.data[0].b64_json;
if (b64.startsWith("data:")) b64 = b64.slice(b64.indexOf(",") + 1);
await writeFile("output.png", Buffer.from(b64, "base64"));
```

<Tip>
  위의 `undici` import는 별도로 설치해야 합니다 (`npm i undici`) — 이는 내장 `fetch`를 구동하지만 해당 모듈 이름으로는 노출되지 않으며, 설치한 복사본도 `setGlobalDispatcher`를 통해 내장 `fetch`에 계속 접근합니다.

  `maxRetries`, `connectTimeout` 및 전체 요청 타임아웃은 모두 서로 다른 계층에 있으며, 잘못된 항목을 설정하는 것이 Node 측에서 가장 흔한 함정입니다. 연결 재설정, `UND_ERR_CONNECT_TIMEOUT` 또는 프록시 뒤에서 대형 응답이 잘리는 경우는 [Image API 연결 끊김 문제 해결](/ko/api-capabilities/image-connection-drops)을 참조하십시오.
</Tip>

### 브라우저 JavaScript (Fetch)

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'gpt-image-2-all',
        prompt: 'Portrait 9:16 phone wallpaper, cyberpunk city rainy night',
        response_format: 'b64_json'
    })
});
const { data } = await resp.json();
let b64 = data[0].b64_json;
if (!b64.startsWith('data:')) b64 = `data:image/png;base64,${b64}`;
document.getElementById('result').src = b64;
```

## 파라미터 빠른 참조

| 파라미터              | 유형     | 필수  | 설명                                                                                                                                          |
| ----------------- | ------ | --- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`           | string | Yes | 고정값: `gpt-image-2-all`                                                                                                                      |
| `prompt`          | string | Yes | Prompt. 크기/비율/스타일을 여기에 포함합니다                                                                                                                |
| `size`            | string | No  | `auto`만 허용됩니다(동일한 prompt라도 서로 다른 크기가 생성됩니다). 엄격하게 크기를 고정하려면 [`gpt-image-2-vip`](/ko/api-capabilities/gpt-image-2-vip/text-to-image)을 사용하십시오 |
| `response_format` | string | No  | `b64_json`(기본값, raw base64) 또는 `url`(R2 CDN 링크를 반환함); 항상 명시적으로 전달하십시오                                                                       |

<Tip>
  자세한 파라미터 제약과 허용 값은 오른쪽 Playground에 표시됩니다. `response_format` 필드는 드롭다운 선택을 지원합니다.
</Tip>

## 응답 형식

**`data[0]`는 `url` 또는 `b64_json` 중 하나만 반환합니다 — 둘 다는 아닙니다** (`response_format`에 따라 다릅니다). 이 엔드포인트는 **기본값이 `b64_json`입니다**.

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

**`url` 모드** (명시적인 `"response_format": "url"`가 필요합니다, R2 CDN 전역 가속 적용):

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
  **호환성 참고**: 2026년 7월 검증됨 — `b64_json` 필드는 **`data:` 접두사가 없는 원시 base64**입니다. 파일을 기록하려면 디코드하거나, 렌더링하기 전에 직접 접두사를 추가하십시오. **이전 버전에는 접두사가 포함되어 있었습니다**, 따라서 두 형태를 모두 처리할 수 있도록 항상 먼저 `startsWith('data:')` 검사를 실행하십시오.
</Warning>


## OpenAPI

````yaml api-reference/gpt-image-2-all-generate-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: gpt-image-2-all Text-to-Image API
  description: >
    GPT image generation reverse-engineered model `gpt-image-2-all` —
    text-to-image endpoint.


    - Per-call billing, $0.03/image

    - ~30–60s generation time, supports Chinese prompts

    - Describe size/ratio/style in the `prompt`. **The `size` field has no
    effect** — sending `size=auto` or any concrete value does not error, but the
    value is silently ignored; the prompt is the sole driver of dimensions, and
    the same prompt yields varied dimensions across calls (good for "drawing
    multiple variants"). `n` / `quality` are not supported either. For strict
    size locking, use `gpt-image-2-vip`.

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
      summary: 'Text-to-Image: generate an image from a text prompt'
      description: >
        Generate images with `gpt-image-2-all` from a text prompt.


        - Only `model` and `prompt` are required

        - Size/ratio goes directly in the prompt (e.g., "Landscape 16:9
        cinematic")

        - For editing or multi-image fusion, use the [Image Editing
        endpoint](/en/api-capabilities/gpt-image-2-all/image-edit)
      operationId: generateGptImage2AllTextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TextToImageRequest'
            example:
              model: gpt-image-2-all
              prompt: Landscape 16:9 cinematic, old lighthouse at sunset
              response_format: b64_json
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
          description: Model name, fixed to gpt-image-2-all
          enum:
            - gpt-image-2-all
          default: gpt-image-2-all
        prompt:
          type: string
          description: >-
            Prompt. Include size/ratio/style here, e.g., Landscape 16:9
            cinematic, old lighthouse at sunset
          example: Landscape 16:9 cinematic, old lighthouse at sunset
        response_format:
          type: string
          description: >-
            Response format. b64_json returns a base64 string already prefixed
            with a data URL header (default); url returns an R2 CDN link
          enum:
            - b64_json
            - url
          default: b64_json
    ImageResponse:
      type: object
      description: >
        Image generation response. `data[0]` returns **either `url` or
        `b64_json`, never both** (depends on `response_format`; this endpoint
        defaults to `b64_json`).
      properties:
        data:
          type: array
          description: Result array (this model returns 1 image per call)
          items:
            type: object
            properties:
              url:
                type: string
                description: R2 CDN accelerated link (returned when response_format=url)
              b64_json:
                type: string
                description: >-
                  Base64-encoded data URL (returned when
                  response_format=b64_json; already includes the
                  data:image/png;base64, prefix)
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