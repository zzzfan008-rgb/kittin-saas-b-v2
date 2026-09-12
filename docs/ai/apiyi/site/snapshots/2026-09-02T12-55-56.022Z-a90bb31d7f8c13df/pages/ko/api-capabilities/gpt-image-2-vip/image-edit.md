> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 이미지 편집 API 레퍼런스

> gpt-image-2-vip 이미지 편집 API 레퍼런스 및 인터랙티브 플레이그라운드 — 참고 이미지를 업로드하고 단일 이미지 편집 또는 다중 이미지 융합을 위한 지시사항을 제공합니다. size를 사용해 출력 치수를 고정합니다.

<Info>
  오른쪽의 대화형 플레이그라운드는 로컬 이미지 직접 업로드를 지원합니다. **Authorization** 필드에 API Key를 입력하고(형식: `Bearer sk-xxx`), 이미지를 선택한 다음 `prompt` / `model` / `size`를 설정하고 전송을 클릭하십시오.
</Info>

<Tip>
  **범위**: 이 페이지는 **하나 이상의 참조 이미지를 편집하거나 융합**하는 용도입니다. 요청은 `multipart/form-data`를 사용합니다. 순수한 텍스트-투-이미지에 대해서는 [Text-to-Image 엔드포인트](/ko/api-capabilities/gpt-image-2-vip/text-to-image)를 참조하십시오.

  **`gpt-image-2-all`와의 차이점**: 호출 구조는 동일하고, `size` 필드가 하나 추가될 뿐입니다. 크기를 고정할 필요가 없고 가장 빠른 출력을 원한다면 [`gpt-image-2-all`](/ko/api-capabilities/gpt-image-2-all/image-edit)를 사용하십시오.
</Tip>

<Warning>
  **🖥️ 브라우저 플레이그라운드 제한**

  이 엔드포인트는 기본적으로 \*\*base64 문자열(`b64_json`)\*\*을 반환하므로 수 MB가 될 수 있습니다. 따라서 브라우저 플레이그라운드에 `请求时发生错误: unable to complete request`가 표시될 수 있습니다. **실제로는 요청이 성공한 것입니다**. 브라우저가 그렇게 긴 base64 문자열을 렌더링하지 못할 뿐입니다.

  **권장 작업 흐름**: base64가 필요하거나 매우 큰 참조 이미지를 업로드해야 할 때는 **아래 코드 예제를 복사해 로컬에서 실행하십시오**.
</Warning>

<Warning>
  **📎 다중 이미지 융합에서는 순서가 중요합니다**

  `image` 필드는 여러 참조 이미지를 허용합니다. **순서는 프롬프트에서 "image1 / image2 / image3" 참조의 기준이 됩니다.** 프롬프트에서 이를 명시적으로 참조하십시오. 예:

  > image1의 인물을 image2의 장면에 배치하고, image3의 회화 스타일을 적용하십시오

  이미지당 **≤ 10MB**를 권장하며, 형식은 `png` / `jpg` / `webp`입니다. 지나치게 큰 이미지는 게이트웨이 제한에 걸릴 수 있습니다.
</Warning>

<Tip>
  **🎯 형태 보존 편집**: `size=auto`를 전달하면(또는 `size`를 생략하면), 출력은 **프롬프트가 편집 대상으로 지목한 참조 이미지의 종횡비를 따릅니다**. 다중 이미지 시나리오에서는 **반드시 첫 번째 이미지일 필요는 없습니다**.

  예를 들어, 프롬프트가 "**image2를 수정**하고, image2의 의상과 모자를 image1에 맞게 바꾸십시오"라면 image2가 1:1일 경우 출력도 1:1입니다(image1이 가로형 16:9라도 마찬가지입니다).

  의상 교체, 액세서리 추가, 보정 및 기타 형태 보존 편집에 유용합니다. 프롬프트가 대상을 지정하지 않으면 모델이 자체적으로 결정합니다. 종횡비를 변경해야 할 때만 명시적인 30-bucket `size`을 전달하십시오.
</Tip>

<Warning>
  **⚠️ 주요 매개변수 참고 사항**

  * **`size`**: **편집의 경우 `auto`를 선호하십시오(또는 필드를 생략하십시오)** — 모델은 프롬프트가 편집 대상으로 지목한 **참조 이미지의 종횡비를 유지**합니다. 다중 이미지 시나리오에서는 반드시 첫 번째 이미지일 필요는 없습니다. 예를 들어, 프롬프트가 "image2를 수정하고 image2의 의상을 image1에 맞추십시오"라면 출력 비율은 image2와 일치합니다. 프롬프트가 대상을 명확히 구분하지 않으면 모델이 자체적으로 결정합니다. 다른 크기를 강제로 적용하려면 지원되는 30개 크기 중 하나를 선택하십시오. 소문자 ASCII `x`를 사용하며, 예: `2048x1360`, `3840x2160`. 전체 표: [개요 페이지](/ko/api-capabilities/gpt-image-2-vip/overview#supported-sizes-full-30-size-table).
  * **`quality`**: ❌ 거부됨 — **전달하지 마십시오**.
  * **`n`**: ❌ 거부됨 — 호출당 단일 이미지만 허용됩니다.
  * **`response_format`**: 생략하면 base64(원시 형식, 접두사 없음, 2026년 7월 확인됨)를 반환합니다. 이미지 URL이 필요하면 `"url"`를 전달하십시오. **URL 출력에 의존하는** 비즈니스는 base64 폴백 없이 결정적 URL 출력을 위해 토큰을 `image2_OSS` 그룹으로 전환해야 합니다.
</Warning>

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
            "model": "gpt-image-2-vip",
            "prompt": "Replace the background with a sunset beach",
            "size": "2048x1360"          # 3:2 2K Recommended
        },
        files=[
            ("image", ("photo.png", f, "image/png"))
        ],
        timeout=300  # conservative; absorbs upload + long-tail
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
            "model": "gpt-image-2-vip",
            "prompt": "Place the person from image1 into the scene of image2, in the style of image3",
            "size": "2048x2048"          # 1:1 2K Recommended
        },
        files=[
            ("image", ("ref1.png", f1, "image/png")),
            ("image", ("ref2.png", f2, "image/png")),
            ("image", ("ref3.png", f3, "image/png"))
        ],
        timeout=300
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
  -F "model=gpt-image-2-vip" \
  -F "prompt=Replace the background with a sunset beach" \
  -F "size=2048x1360" \
  -F "image=@./photo.png"
```

**다중 이미지 융합**:

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2-vip" \
  -F "prompt=Place the person from image1 into the scene of image2, in the style of image3" \
  -F "size=2048x2048" \
  -F "image=@./ref1.png" \
  -F "image=@./ref2.png" \
  -F "image=@./ref3.png"
```

### Node.js (기본 fetch + FormData)

```javascript theme={null}
import fs from 'node:fs';

const form = new FormData();
form.append('model', 'gpt-image-2-vip');
form.append('prompt', 'Replace the background with outer space');
form.append('size', '2048x1360');
form.append(
  'image',
  new Blob([fs.readFileSync('./photo.png')]),
  'photo.png'
);

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});
const data = await resp.json();
console.log(data.data[0].url);
```

### 브라우저 JavaScript(파일 객체)

```javascript theme={null}
// <input type="file" id="fileInput" multiple>
const files = document.getElementById('fileInput').files;
const form = new FormData();
form.append('model', 'gpt-image-2-vip');
form.append('prompt', 'Fuse these images into a single poster');
form.append('size', '2048x2048');
for (const f of files) form.append('image', f);

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});
const { data } = await resp.json();
document.getElementById('result').src = data[0].url;
```

## Parameters

| Field    | Type | Required | Description                                                                                                                  |
| -------- | ---- | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `model`  | text | 예        | `gpt-image-2-vip`로 고정                                                                                                        |
| `prompt` | text | 예        | 자연어 편집/융합 설명                                                                                                                 |
| `image`  | file | 예        | 참조 이미지이며, 반복 가능함(배열 필드)                                                                                                      |
| `size`   | text | 아니요      | 출력 크기: `auto` (기본값 — **프롬프트가 편집 대상으로 지정한 참조 이미지를 따르며**, 반드시 첫 번째 참조 이미지일 필요는 없음) 또는 30개 크기 중 하나; 형식 `WIDTHxHEIGHT` (소문자 `x`) |

<Tip>
  **다중 턴 반복**: 이전 출력을 다음 호출의 `image`으로 다시 전달하고, 새로운 편집 지시를 추가해 점진적으로 다듬습니다. 각 라운드마다 자체 `size`를 지정할 수 있습니다.
</Tip>

## 응답 형식

텍스트-투-이미지 엔드포인트와 동일합니다: **기본적으로 base64를 반환합니다** (`data[0].b64_json`, 접두사가 없는 raw base64이며, 2026년 7월 검증됨). **이미지 URL**이 필요하면 `response_format: "url"`를 명시적으로 전달하십시오. **URL 출력에 의존하는** 서비스는 base64 대체 없이 결정적인 URL 출력을 위해 토큰을 **`image2_OSS` 그룹**으로 전환해야 합니다. `data[0]`는 `url` 또는 `b64_json` 중 하나만 반환하며 — 둘 다는 아닙니다.

**`b64_json` 모드** (기본값):

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

**`url` 모드** (`response_format: "url"`를 명시적으로 전달하십시오; URL에 의존하는 경우 `image2_OSS` 그룹을 사용하십시오):

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
  2026년 7월 검증됨: `b64_json` 필드는 **`data:` 접두사가 없는 raw base64**입니다 — 렌더링하기 전에 직접 디코딩하거나 접두사를 앞에 붙이십시오. **이전 버전에는 접두사가 포함되어 있었습니다**, 따라서 두 형태를 모두 처리하려면 먼저 `startsWith('data:')`를 항상 확인하십시오.
</Warning>

## 관련 자료

<CardGroup cols={2}>
  <Card title="모델 개요(전체 크기 표)" icon="sparkles" href="/ko/api-capabilities/gpt-image-2-vip/overview">
    전체 30개 크기 표, 과금, 기술 사양
  </Card>

  <Card title="텍스트-이미지 API" icon="wand-sparkles" href="/ko/api-capabilities/gpt-image-2-vip/text-to-image">
    `/v1/images/generations` 호환되는 엔드포인트
  </Card>

  <Card title="자매 모델 gpt-image-2-all" icon="copy" href="/ko/api-capabilities/gpt-image-2-all/image-edit">
    고정 크기가 필요하지 않을 때는 동일한 호출 형식 — 더 빠른 출력
  </Card>
</CardGroup>


## OpenAPI

````yaml api-reference/gpt-image-2-vip-edit-openapi-en.yaml POST /v1/images/edits
openapi: 3.1.0
info:
  title: gpt-image-2-vip Image Editing API
  description: >
    GPT image generation reverse-engineered model `gpt-image-2-vip` (Codex line)
    — image editing endpoint.


    - Supports single-image editing and multi-image fusion (repeat the `image`
    field for multiple uploads; order is preserved)

    - Request format is `multipart/form-data`

    - Reference upload order in prompts as "image1/image2/image3"

    - Supports 30 explicit sizes (10 ratios × 1K / 2K / 4K, flat $0.03/image
    across all tiers)

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
      summary: 'Image editing: edit or fuse reference images with locked output size'
      description: >
        Edit or fuse reference images with `gpt-image-2-vip` and lock the output
        dimension via `size`.


        - Provide at least one reference image via the `image` field

        - For multiple reference images, **repeat the same `image` field** —
        e.g., `-F image=@a.png -F image=@b.png` (upload order maps to "image1 /
        image2 / ..." in the prompt)

        - Recommended ≤ 10MB per image, formats png/jpg/webp

        - Strongly recommend passing `size` (one of the 30 sizes); do not pass
        `quality` / `n`

        - For pure text-to-image, use the [Text-to-Image
        endpoint](/en/api-capabilities/gpt-image-2-vip/text-to-image)
      operationId: editGptImage2VipImage
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
    EditImageRequest:
      type: object
      required:
        - model
        - prompt
        - image
      properties:
        model:
          type: string
          description: Model name, fixed to gpt-image-2-vip
          enum:
            - gpt-image-2-vip
          default: gpt-image-2-vip
        prompt:
          type: string
          description: >-
            Edit/fusion instruction. For multi-image flows, reference upload
            order as image1/image2/image3
          example: >-
            Place the person from image1 into the scene of image2, in the style
            of image3
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
        size:
          type: string
          description: >
            Output size. **For editing, prefer `auto` (or omit the field)** —
            the model preserves the aspect ratio of **whichever reference image
            the prompt names as the target of the edit** (not necessarily the
            first one in multi-image scenarios). For example, with the prompt
            "modify image2, change image2's outfit to match image1", the output
            ratio matches image2. If the prompt doesn't disambiguate, the model
            decides on its own. To force a different dimension, pick one of the
            30 supported sizes; format: `WIDTHxHEIGHT` with lowercase ASCII `x`,
            e.g., `2048x1360`, `3840x2160`. Flat $0.03/image across all tiers.
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
          example: 2048x1360
    ImageResponse:
      type: object
      description: >
        Image editing response. **Returns base64 by default**
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