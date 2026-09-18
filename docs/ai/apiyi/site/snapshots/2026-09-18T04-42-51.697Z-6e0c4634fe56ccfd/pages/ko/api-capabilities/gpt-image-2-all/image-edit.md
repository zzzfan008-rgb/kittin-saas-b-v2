> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 이미지 편집 API 레퍼런스

> gpt-image-2-all 이미지 편집 API 레퍼런스 및 인터랙티브 플레이그라운드 — 단일 이미지 편집 또는 다중 이미지 융합을 위해 참고 이미지를 업로드하고 지시사항을 입력합니다

<Info>
  오른쪽의 대화형 Playground는 로컬 파일을 직접 업로드할 수 있습니다. API 키를 **Authorization** 필드에 입력하고(형식: `Bearer sk-xxx`), 이미지를 선택한 뒤 `prompt`와 `model`를 채우고 전송을 클릭합니다.
</Info>

<Tip>
  **범위**: 이 페이지는 **하나 이상의 참고 이미지를 편집하거나 합성**하는 데 사용됩니다. 요청에는 `multipart/form-data`를 사용합니다. 순수한 텍스트-이미지 생성을 하려면 [Text-to-Image 엔드포인트](/ko/api-capabilities/gpt-image-2-all/text-to-image)를 사용합니다.
</Tip>

<Warning>
  **🖥️ 브라우저 Playground 제한(기본 b64\_json 모드)**

  이 엔드포인트는 \*\*기본값이 `response_format: "b64_json"`\*\*이므로, 응답에 수 MB 크기의 base64 문자열이 포함되고 브라우저 Playground에 `请求时发生错误: unable to complete request`가 표시될 수 있습니다. — **실제로 요청은 성공했습니다**; 브라우저가 그렇게 긴 base64 문자열을 렌더링할 수 없을 뿐입니다.

  **권장 워크플로**:

  * Playground에서 이미지만 보고 싶으신가요? **`"response_format": "url"`를 명시적으로 전달**하세요 — 응답이 단일 R2 링크가 되어 정상적으로 렌더링됩니다.
  * base64가 필요하거나 큰 참고 이미지를 업로드하려면? **아래 코드 샘플을 복사해 로컬에서 실행**하세요 — 코드가 업로드와 디코딩을 자동으로 처리합니다.
</Warning>

<Warning>
  **📎 다중 이미지의 순서는 중요합니다**

  `image` 필드는 반복해서 사용하여 여러 참고 이미지를 업로드할 수 있습니다. **순서에 따라 프롬프트에서 "image1/image2/image3"가 어떻게 해석되는지가 결정됩니다.** 다음처럼 명시적으로 지칭하는 것을 권장합니다.

  > image1의 인물을 image2의 장면에 넣고, image3의 예술 스타일을 사용합니다

  권장 사항: 이미지당 **10MB 이하**, 형식 `png` / `jpg` / `webp`. 너무 큰 이미지는 게이트웨이 제한에 걸릴 수 있습니다.
</Warning>

<Tip>
  **🎯 형태 보존 편집**: 이 엔드포인트의 출력 종횡비는 **프롬프트가 편집 대상으로 지정한 참고 이미지에 맞춰집니다** — 다중 이미지 상황에서 **반드시 첫 번째 이미지는 아닙니다**.

  예를 들어, 프롬프트가 "**image2를 수정**, image2의 옷과 모자를 image1에 맞게 바꾸세요"인 경우, image2가 1:1이면 출력도 1:1입니다(image1이 가로형 16:9이더라도).

  의상 교체, 액세서리 추가, 리터칭 및 기타 형태 보존 편집에 유용합니다. **`size` 필드는 이 모델에 영향을 주지 않습니다**(아무 값을 보내도 조용히 무시됩니다. 엄격한 크기 고정이 필요하면 [`gpt-image-2-vip`](/ko/api-capabilities/gpt-image-2-vip/image-edit)를 사용합니다). 프롬프트가 대상을 지정하지 않으면 모델이 자체적으로 결정합니다.
</Tip>

## 코드 예제

### Python

**단일 이미지 편집**:

```python theme={null}
import requests

API_KEY = "sk-your-api-key"

with open("photo.png", "rb") as f:
    response = requests.post(
        "https://api.apiyi.com/v1/images/edits",
        headers={"Authorization": f"Bearer {API_KEY}"},
        data={
            "model": "gpt-image-2.5-all",
            "prompt": "Change the background to a seaside sunset",
            "response_format": "url"
        },
        files=[
            ("image", ("photo.png", f, "image/png"))
        ],
        timeout=300  # conservative — absorbs tail latency + image upload/download time
    ).json()

print(response["data"][0]["url"])
```

**다중 이미지 융합**:

```python theme={null}
import requests

with open("ref1.png", "rb") as f1, \
     open("ref2.png", "rb") as f2, \
     open("ref3.png", "rb") as f3:
    response = requests.post(
        "https://api.apiyi.com/v1/images/edits",
        headers={"Authorization": "Bearer sk-your-api-key"},
        data={
            "model": "gpt-image-2.5-all",
            "prompt": "Put the person from image1 into the scene of image2, using the art style of image3",
            "response_format": "b64_json"
        },
        files=[
            ("image", ("ref1.png", f1, "image/png")),
            ("image", ("ref2.png", f2, "image/png")),
            ("image", ("ref3.png", f3, "image/png"))
        ],
        timeout=300  # conservative — absorbs tail latency + image upload/download time
    ).json()

# Verified July 2026: b64_json is raw base64 (no data: prefix); earlier versions
# included the prefix, so a defensive check is safest
import base64
b64 = response["data"][0]["b64_json"]
if b64.startswith("data:"):
    b64 = b64.split(",", 1)[1]
with open("edited.png", "wb") as f:
    f.write(base64.b64decode(b64))
```

### cURL

**단일 이미지 편집**:

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2.5-all" \
  -F "prompt=Change the background to a seaside sunset" \
  -F "response_format=url" \
  -F "image=@./photo.png"
```

**다중 이미지 융합**:

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2.5-all" \
  -F "prompt=Put the person from image1 into the scene of image2, using the art style of image3" \
  -F "response_format=b64_json" \
  -F "image=@./ref1.png" \
  -F "image=@./ref2.png" \
  -F "image=@./ref3.png"
```

### Node.js (네이티브 fetch + FormData)

```javascript theme={null}
import fs from 'node:fs';
import { Agent, setGlobalDispatcher } from 'undici';

// Editing uploads a reference image and waits on an MB-scale body, while undici's
// default connect timeout is only 10s and is NOT governed by AbortSignal.timeout
// below (different layers) — widen all three explicitly
setGlobalDispatcher(new Agent({
  connect: { timeout: 30_000 },
  headersTimeout: 300_000,
  bodyTimeout: 300_000,
}));

const form = new FormData();
form.append('model', 'gpt-image-2.5-all');
form.append('prompt', 'Change the background to outer space');
form.append('response_format', 'url');
form.append(
  'image',
  new Blob([fs.readFileSync('./photo.png')]),
  'photo.png'
);

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    signal: AbortSignal.timeout(300_000),   // total timeout — a different layer
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});
const data = await resp.json();
console.log(data.data[0].url);
```

<Tip>
  위의 `undici` 가져오기는 별도로 설치해야 합니다(`npm i undici`). 이는 내장 `fetch`을 구동하지만 해당 모듈 이름으로는 노출되지 않으며, 설치한 복사본도 `setGlobalDispatcher`을 통해 내장 `fetch`에 계속 연결됩니다.

  `maxRetries`, `connectTimeout` 및 전체 요청 타임아웃은 모두 서로 다른 계층에 있으며, 잘못된 항목을 구성하는 것이 Node 측에서 가장 흔히 발생하는 문제입니다. 연결 재설정, `UND_ERR_CONNECT_TIMEOUT` 또는 프록시 뒤에서 대규모 응답이 잘리는 문제가 발생하는 경우 [이미지 API 연결 끊김 문제 해결](/ko/api-capabilities/image-connection-drops)을 참조하십시오.
</Tip>

### 브라우저 JavaScript (File 객체)

```javascript theme={null}
// <input type="file" id="fileInput" multiple>
const files = document.getElementById('fileInput').files;
const form = new FormData();
form.append('model', 'gpt-image-2.5-all');
form.append('prompt', 'Fuse these images into one poster');
form.append('response_format', 'url');
for (const f of files) form.append('image', f);

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});
const { data } = await resp.json();
document.getElementById('result').src = data[0].url;
```

## 매개변수 빠른 참조

| 필드                | 유형  | 필수  | 설명                                                                                                                                                                                                                              |
| ----------------- | --- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`           | 텍스트 | 예   | `gpt-image-2.5-all` 또는 `gpt-image-2-all` (동일한 가격 및 동작)                                                                                                                                                                          |
| `prompt`          | 텍스트 | 예   | 자연어 편집/융합 지침                                                                                                                                                                                                                    |
| `image`           | 파일  | 예   | 참조 이미지입니다. 반복해서 지정할 수 있습니다                                                                                                                                                                                                      |
| `size`            | 텍스트 | 아니요 | **이 필드는 아무런 영향을 주지 않으며, 어떤 값을 보내도 조용히 무시됩니다.** 출력 가로세로 비율은 **프롬프트에서 편집 대상으로 지정한 참조 이미지**를 따릅니다(여러 이미지 시나리오에서 반드시 첫 번째 이미지인 것은 아닙니다). 크기를 엄격하게 고정하려면 [`gpt-image-2-vip`](/ko/api-capabilities/gpt-image-2-vip/image-edit)을 사용합니다 |
| `response_format` | 텍스트 | 아니요 | `b64_json` (기본값) 또는 `url`                                                                                                                                                                                                       |

<Tip>
  **다중 턴 반복**: 이전 출력 이미지를 새 지침과 함께 `image` 입력으로 다시 전달하여 결과를 반복적으로 개선합니다.
</Tip>

## 응답 형식

텍스트-투-이미지 엔드포인트와 동일합니다: **`data[0]`는 `url` 또는 `b64_json`만 반환하며 — 둘 다는 반환하지 않습니다**(`response_format`에 따라 다릅니다). 이 엔드포인트는 **기본값이 `b64_json`입니다**.

**`b64_json` 모드**(기본값):

```json theme={null}
{
  "data": [
    {
      "b64_json": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
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

**`url` 모드**(명시적인 `"response_format": "url"` 필요):

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
  2026년 7월 검증됨: `b64_json` 필드는 **`data:` 접두사 없는 원시 base64**입니다 — 렌더링하기 전에 디코딩하거나 직접 접두사를 붙이십시오. **이전 버전에는 접두사가 포함되어 있었습니다**, 따라서 두 형태를 모두 처리하려면 항상 먼저 `startsWith('data:')`를 확인하십시오.
</Warning>


## OpenAPI

````yaml api-reference/gpt-image-2-all-edit-openapi-en.yaml POST /v1/images/edits
openapi: 3.1.0
info:
  title: gpt-image-2-all Image Editing API
  description: >
    GPT image generation reverse-engineered model `gpt-image-2-all` — image
    editing endpoint.


    - Supports single-image editing and multi-image fusion (repeat the `image`
    field for multiple uploads; order is preserved)

    - Request format is `multipart/form-data`

    - Reference upload order in prompts as "image1/image2/image3"

    - **The `size` field has no effect** (sending any value is silently ignored,
    no error). The output aspect ratio **follows whichever reference image the
    prompt names as the edit target** — not necessarily the first one in
    multi-image scenarios. For example, with the prompt "modify image2", the
    output ratio matches image2; if the prompt doesn't disambiguate, the model
    decides on its own. For strict size locking, use `gpt-image-2-vip`.

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
  /v1/images/edits:
    post:
      tags:
        - Image Editing
      summary: 'Image editing: edit or fuse reference images with instructions'
      description: >
        Use `gpt-image-2-all` to edit or fuse input images based on a text
        instruction.


        - Provide at least one reference image via the `image` field

        - For multiple reference images, **repeat the same `image` field** —
        e.g., `-F image=@a.png -F image=@b.png` (upload order maps to "image1 /
        image2 / ..." in the prompt)

        - Recommended ≤ 10MB per image, formats png/jpg/webp

        - For pure text-to-image generation, use the [Text-to-Image
        endpoint](/en/api-capabilities/gpt-image-2-all/text-to-image)
      operationId: editGptImage2AllImage
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/EditImageRequest'
            encoding:
              image:
                contentType: image/png, image/jpeg, image/webp
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
    EditImageRequest:
      type: object
      required:
        - model
        - prompt
        - image
      properties:
        model:
          type: string
          description: >-
            Model name: gpt-image-2.5-all or gpt-image-2-all (same ChatGPT web
            line, same price and behavior)
          enum:
            - gpt-image-2.5-all
            - gpt-image-2-all
          default: gpt-image-2.5-all
        prompt:
          type: string
          description: >-
            Edit/fusion instruction. For multi-image fusion, reference upload
            order as image1/image2/image3
          example: >-
            Put the person from image1 into the scene of image2, using the art
            style of image3
        image:
          type: array
          description: >-
            Reference images. **For a single image, send the field once; for
            multiple images, repeat the same `image` field** (e.g., `-F
            image=@a.png -F image=@b.png`) — upload order maps to image1 /
            image2 / ... in the prompt. Recommended ≤ 10MB each, formats png /
            jpg / webp.
          items:
            type: string
            format: binary
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
        Image editing response. `data[0]` returns **either `url` or `b64_json`,
        never both** (depends on `response_format`; this endpoint defaults to
        `b64_json`).
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