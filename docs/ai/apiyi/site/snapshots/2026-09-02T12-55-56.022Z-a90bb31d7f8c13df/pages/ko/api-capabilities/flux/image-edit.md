> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 이미지 편집 API Reference

> FLUX 이미지 편집 API Reference 및 라이브 디버거 — 단일 이미지 편집, 다중 참조 융합을 위해 참조 이미지 최대 8장과 지시사항을 업로드합니다. FLUX.2와 FLUX.1 Kontext를 지원합니다.

<Info>
  플레이그라운드 사용법: API Key를 **Authorization**에 입력합니다(형식 `Bearer sk-xxx`). 기준 이미지 1의 **공개 URL**을 `input_image`에 붙여넣고, 여러 레퍼런스를 사용할 경우 추가 이미지의 URL을 `input_image_2` … `input_image_8`에 채웁니다. 그런 다음 `prompt` / `model`를 채워 전송합니다. 플레이그라운드는 URL만 허용하며, base64 데이터 URL 입력은 아래 코드 예제를 복사해 로컬에서 실행해야 합니다.
</Info>

<Tip>
  **이 페이지의 용도**는 "하나 이상의 레퍼런스 이미지를 편집하거나 융합"하는 것입니다. FLUX 이미지 편집은 두 가지 옵션을 지원합니다.

  * **옵션 A(이 페이지의 플레이그라운드, 권장)**: JSON + `input_image`을 `/v1/images/generations`까지(텍스트-이미지와 공유됩니다 — `input_image`를 보내면 편집 모드가 활성화됩니다). 모든 FLUX 모델(검증된 Kontext 포함)에서 작동하며, 멀티 레퍼런스 융합(`input_image_2` \~ `input_image_8`)을 지원합니다.
  * **옵션 B**: OpenAI 호환 멀티파트 엔드포인트 `/v1/images/edits`(아래 "옵션 B" 섹션 참고) — 단일 이미지 편집용이며, OpenAI SDK의 `client.images.edit()`와 직접 호환됩니다.

  순수 텍스트-이미지는 [Text-to-Image 엔드포인트](/ko/api-capabilities/flux/text-to-image)를 참고합니다.
</Tip>

<Warning>
  **⚠️ 주요 차이점 / 참고 사항(옵션 A)**

  * **엔드포인트 경로**: `/v1/images/generations`(텍스트-이미지와 공유됩니다. OpenAI 호환 단일 이미지 `/v1/images/edits` 엔드포인트도 있습니다 — 옵션 B를 참고하십시오)
  * **Content-Type**: `application/json`(옵션 B의 `/edits` 엔드포인트는 대신 `multipart/form-data`을 사용합니다)
  * **모든 레퍼런스 이미지 필드는 문자열입니다**: `input_image` / `input_image_2` … `input_image_8`는 공개 URL(권장) 또는 `data:image/...;base64,xxx` 데이터 URL을 허용합니다
  * **레퍼런스 이미지 상한은 모델별로 다릅니다**: FLUX.2 \[pro/max/flex]는 최대 **8**, FLUX.2 \[klein]은 최대 **4**, FLUX.1 Kontext는 기본적으로 **1**을 지원합니다
  * **각 이미지는 20MB 또는 20MP 이하**여야 하며, 형식은 `png` / `jpg` / `webp`입니다
  * **입력 해상도**: 최소 64×64, 최대 4MP이며, 가로세로 길이는 16의 배수여야 합니다
  * **결과 URL은 10분 동안만 유효합니다** — `data[0].url`은 즉시 다운로드해야 합니다
  * **`aspect_ratio`를 생략하면** 출력 크기는 첫 번째 입력 이미지와 같습니다
</Warning>

<Warning>
  **📎 멀티 레퍼런스 순서는 중요합니다**

  `input_image` / `input_image_2` / `input_image_3` …의 번호는 프롬프트에서 "image 1 / image 2 / image 3"에 사용되는 인덱스와 **정확히 동일합니다**:

  > image 1의 사람을 image 2의 장면에 배치하고, image 3의 색상 팔레트를 적용합니다.

  각 값은 공개적으로 접근 가능한 URL(20MB 이하 권장) 또는 `data:image/png;base64,xxx` 데이터 URL이어야 합니다.
</Warning>

## 코드 예제

### cURL (두 이미지 융합 · URL)

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "flux-2-pro",
    "prompt": "Naturally blend these two images",
    "input_image": "https://static.apiyi.com/apiyi-logo.png",
    "input_image_2": "https://images.unsplash.com/photo-1762138012600-2ab523f8b35a",
    "seed": 42,
    "output_format": "jpeg"
  }'
```

### cURL (세 이미지 융합 · URL)

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "flux-2-pro",
    "prompt": "The person from image 1 is petting the cat from image 2, the bird from image 3 is next to them",
    "input_image": "https://example.com/person.jpg",
    "input_image_2": "https://example.com/cat.jpg",
    "input_image_3": "https://example.com/bird.jpg",
    "seed": 42,
    "output_format": "jpeg"
  }'
```

### cURL (단일 이미지 편집 · Kontext)

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "flux-kontext-pro",
    "prompt": "Convert this architectural photo into a pencil sketch style, preserve all structural details",
    "input_image": "https://your-oss.example.com/architecture.jpg"
  }'
```

### cURL (로컬 파일 · base64 data URL)

```bash theme={null}
# Encode local image as base64 data URL (macOS / Linux)
B64=$(base64 -w0 < person.png 2>/dev/null || base64 < person.png | tr -d '\n')

curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d "$(jq -nc --arg img "data:image/png;base64,$B64" '{
    model: "flux-2-pro",
    prompt: "Stylize image 1 as an oil painting",
    input_image: $img
  }')"
```

### Python (requests · 두 이미지 융합)

```python theme={null}
import requests

resp = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={
        "Authorization": "Bearer sk-your-api-key",
        "Content-Type": "application/json",
    },
    json={
        "model": "flux-2-pro",
        "prompt": "Naturally blend these two images",
        "input_image": "https://static.apiyi.com/apiyi-logo.png",
        "input_image_2": "https://images.unsplash.com/photo-1762138012600-2ab523f8b35a",
        "seed": 42,
        "output_format": "jpeg",
    },
    timeout=120,
)
image_url = resp.json()["data"][0]["url"]

# data[0].url is valid for only 10 minutes — download immediately
with open("fused.jpg", "wb") as f:
    f.write(requests.get(image_url, timeout=30).content)
```

### Python (requests · 로컬 파일을 base64로)

```python theme={null}
import base64, requests, mimetypes

def to_data_url(path: str) -> str:
    mime = mimetypes.guess_type(path)[0] or "image/png"
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    return f"data:{mime};base64,{b64}"

resp = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={
        "Authorization": "Bearer sk-your-api-key",
        "Content-Type": "application/json",
    },
    json={
        "model": "flux-2-pro",
        "prompt": "Place the person from image 1 into the scene from image 2",
        "input_image": to_data_url("person.png"),
        "input_image_2": "https://your-oss.example.com/scene.jpg",
    },
    timeout=120,
)
print(resp.json()["data"][0]["url"])
```

### Python (OpenAI SDK · extra\_body를 통해 input\_image 전달)

```python theme={null}
from openai import OpenAI
import requests

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# OpenAI SDK images.generate() targets /v1/images/generations with JSON;
# BFL-native fields are added straight into the body via extra_body.
resp = client.images.generate(
    model="flux-2-pro",
    prompt="Naturally blend these two images",
    extra_body={
        "input_image": "https://static.apiyi.com/apiyi-logo.png",
        "input_image_2": "https://images.unsplash.com/photo-1762138012600-2ab523f8b35a",
        "seed": 42,
        "output_format": "jpeg",
    },
)
image_url = resp.data[0].url
with open("fused.jpg", "wb") as f:
    f.write(requests.get(image_url, timeout=30).content)
```

### Node.js (fetch · 다중 참조 융합)

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer sk-your-api-key',
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        model: 'flux-2-pro',
        prompt: 'Naturally blend these two images',
        input_image: 'https://static.apiyi.com/apiyi-logo.png',
        input_image_2: 'https://images.unsplash.com/photo-1762138012600-2ab523f8b35a',
        seed: 42,
        output_format: 'jpeg',
    }),
});

const { data } = await resp.json();
const img = await fetch(data[0].url);
const fs = await import('node:fs');
fs.writeFileSync('fused.jpg', Buffer.from(await img.arrayBuffer()));
```

## 옵션 B: OpenAI 호환 편집 엔드포인트 (멀티파트)

위의 JSON 옵션 외에도, FLUX 이미지 편집은 표준 OpenAI Images API 편집 엔드포인트도 지원하며, `client.images.edit()`와 직접 호환됩니다(`flux-kontext-max`로 2026-07-04 검증, 생성 성공):

* **엔드포인트**: `POST https://api.apiyi.com/v1/images/edits`
* **Content-Type**: `multipart/form-data`(SDK와 curl `-F`에서 자동으로 설정됩니다 — **수동으로 설정하지 마십시오**, 그렇지 않으면 바운더리가 손실되어 파싱에 실패합니다)

<Note>
  FLUX.1 Kontext 시리즈는 입력 이미지 1장만 허용합니다. 여러 참조를 융합하려면 옵션 A(`input_image` \~ `input_image_8`)를 사용하십시오. 옵션 B는 현재 Kontext 시리즈에서 검증되었습니다.
</Note>

### 요청 매개변수 (폼 필드)

| Field              | Type    | Required | Description                                                                                       |
| ------------------ | ------- | -------- | ------------------------------------------------------------------------------------------------- |
| `model`            | string  | ✓        | 예: `flux-kontext-max` / `flux-kontext-pro`                                                        |
| `prompt`           | string  | ✓        | 편집 지시문                                                                                            |
| `image`            | file    | ✓        | 소스 이미지 바이너리(png/jpg/webp, ≤ 20MB). **필드 이름은 반드시 `image`여야 합니다** — 생략하면 `image is required`를 반환합니다 |
| `aspect_ratio`     | string  | ✗        | 예: `1:1` / `16:9`, 최상위 폼 필드로 전달됩니다; OpenAI SDK 사용자는 `extra_body`를 통해 전달합니다                        |
| `safety_tolerance` | integer | ✗        | 0(가장 엄격함) – 6(가장 허용적임)                                                                            |

### cURL 예시

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=flux-kontext-max" \
  -F "prompt=Change the outfit to a fashion look" \
  -F "aspect_ratio=16:9" \
  -F "image=@input.jpg"
```

### Python (OpenAI SDK) 예시

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
)

result = client.images.edit(
    model="flux-kontext-max",
    image=open("input.jpg", "rb"),
    prompt="Change the outfit to a fashion look",
    extra_body={"aspect_ratio": "16:9"},  # FLUX-specific params go through extra_body
)
print(result.data[0].url)
```

### Node.js (fetch + FormData) 예시

```javascript theme={null}
const form = new FormData();
form.append('model', 'flux-kontext-max');
form.append('prompt', 'Change the outfit to a fashion look');
form.append('aspect_ratio', '16:9');
form.append('image', imageBlob, 'input.jpg'); // browser Blob or Node's fs.openAsBlob()

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    // Note: do NOT set Content-Type manually — let the runtime generate the multipart boundary
    body: form,
});
const data = await resp.json();
console.log(data.data[0].url);
```

응답 형식은 옵션 A(`data[0].url`, 10분 동안 유효한 BFL 서명 URL — 운영 환경에서는 서버 측에서 자체 저장소로 다운로드)와 동일합니다.

### 어떤 옵션을 사용해야 합니까?

|        | 옵션 A (JSON `input_image`)    | 옵션 B (multipart `/edits`)                       |
| ------ | ---------------------------- | ----------------------------------------------- |
| 권장 용도  | 직접 HTTP / 프런트엔드 앱 / 다중 참조 융합 | 기존 OpenAI SDK 코드, `client.images.edit()` 마이그레이션 |
| 다중 이미지 | 예 (flux-2는 최대 8개)            | 단일 이미지만                                         |
| 이미지 입력 | 공개 URL 또는 base64 데이터 URL     | 바이너리 파일                                         |

## 매개변수 참조

| 필드                                | 유형      | 필수  | 기본값         | 설명                                                                                                                                 |
| --------------------------------- | ------- | --- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `model`                           | string  | 예   | —           | FLUX 모델 ID입니다. 다중 참조 융합에는 `flux-2-pro` / `flux-2-max`를 우선 사용하십시오. 단일 이미지 편집에는 `flux-kontext-max` / `flux-kontext-pro`도 사용할 수 있습니다. |
| `prompt`                          | string  | 예   | —           | 편집 / 융합 지시문이며, 최대 32K tokens까지 지원합니다. "image 1 / image 2 / image 3"을 사용하여 image / input\_image\_2 / input\_image\_3 순서를 참조하십시오.    |
| `input_image`                     | string  | 예   | —           | 참조 이미지 1입니다. 공개 URL(권장) 또는 `data:image/...;base64,xxx` data URL을 사용할 수 있습니다.                                                       |
| `input_image_2` … `input_image_8` | string  | 아니요 | —           | 참조 이미지 2–8입니다. URL 또는 data URL을 사용합니다. FLUX.2 \[pro/max/flex]는 최대 8개, \[klein]은 4개까지 지원하며, Kontext는 추가 항목을 지원하지 않습니다.              |
| `aspect_ratio`                    | string  | 아니요 | 첫 번째 입력과 일치 | 예: `1:1` / `16:9` / `9:16` / `4:3` / `3:2`                                                                                         |
| `seed`                            | integer | 아니요 | 무작위         | 재현성을 위해 고정합니다                                                                                                                      |
| `safety_tolerance`                | integer | 아니요 | `2`         | 0(가장 엄격함) – 6(가장 허용적임)                                                                                                             |
| `output_format`                   | string  | 아니요 | `jpeg`      | `jpeg` / `png`                                                                                                                     |
| `prompt_upsampling`               | boolean | 아니요 | `false`     | prompt를 자동으로 업샘플링합니다.                                                                                                              |
| `steps`                           | integer | 아니요 | `50`        | **`flux-2-flex`만**, 최대 50                                                                                                          |
| `guidance`                        | number  | 아니요 | `4.5`       | **`flux-2-flex`만**, 1.5–10                                                                                                         |

## 다중 참조 전략

<AccordionGroup>
  <Accordion icon="user" title="캐릭터 일관성(최대 8장)">
    동일한 캐릭터의 여러 샷을 참조로 업로드하면 모델이 신원 특징을 자동으로 보존합니다. 광고 캠페인, 만화 패널, 패션 화보에 적합합니다.

    ```
    Eight consistent characters from the reference images,
    in a fashion editorial set on a Tokyo rooftop at golden hour
    ```
  </Accordion>

  <Accordion icon="palette" title="스타일 전이">
    콘텐츠 이미지 1장 + 스타일 이미지 1장, prompt에 명시적으로 참조를 넣습니다:

    ```
    Using the style of image 2, render the subject from image 1
    ```
  </Accordion>

  <Accordion icon="layers" title="오브젝트 구성">
    여러 이미지의 오브젝트를 하나의 새로운 장면으로 결합합니다:

    ```
    The person from image 1 is petting the cat from image 2,
    the bird from image 3 is next to them
    ```
  </Accordion>

  <Accordion icon="shirt" title="의상 / 제품 교체">
    한 이미지의 의상을 다른 대상에 교체합니다:

    ```
    Replace the top of the person in image 1 with the one from image 2,
    keep the pose and background unchanged
    ```
  </Accordion>
</AccordionGroup>

<Tip>
  **반복 편집**: `data[0].url`를 다운로드한 뒤, 다음 호출에서 새 지시와 함께 `input_image`로 다시 전달하고 점진적으로 다듬습니다. 각 라운드는 이미지 1장으로 과금됩니다.
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
  **⚠️ `data[0].url`은 유효 기간이 10분뿐입니다**

  * URL은 `delivery-eu.bfl.ai` / `delivery-us.bfl.ai`에 호스팅되며, 서명은 10분 후 만료됩니다
  * **CORS is disabled** — 브라우저 `fetch`는 차단됩니다
  * 프로덕션에서는 서버 측에서 자체 OSS / CDN으로 다운로드해야 합니다
  * FLUX 편집 엔드포인트는 `b64_json`를 **반환하지 않으며** — URL만 반환합니다
</Warning>

<Info>
  편집 요청의 비용은 text-to-image와 동일합니다(이미지당 과금되며, token당 과금되지 않습니다). Multi-reference는 추가 이미지에 대해 별도 비용이 청구되지 않습니다(OpenAI gpt-image-2 편집과는 다릅니다).
</Info>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="image is required (shell_api_error) 오류의 원인은 무엇입니까?">
    요청이 `/v1/images/edits` 엔드포인트(옵션 B)에 도달했지만, 게이트웨이가 요청 본문에서 이미지를 찾지 못했습니다. 일반적인 원인은 다음과 같습니다:

    1. multipart form에 `image` 파일 필드가 없거나, 필드명이 올바르지 않습니다(예: `image[]`, `file`)
    2. `Content-Type: multipart/form-data`가 boundary 없이 수동으로 설정되었습니다(SDK / fetch / curl을 사용할 때는 이 헤더를 직접 설정하지 마십시오)
    3. 클라이언트의 이미지 변환에 실패했지만 요청은 그대로 전송되었습니다(`image` 필드에 실제로 0바이트를 초과하는 내용이 있는지 확인하십시오)
    4. 이미지를 JSON으로 보내려 했지만 `/edits`에 도달했습니다 — JSON + `input_image`은 `/v1/images/generations`로 전송됩니다(옵션 A)
  </Accordion>
</AccordionGroup>


## OpenAPI

````yaml api-reference/flux-edit-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: FLUX Image Editing API
  description: >
    Black Forest Labs FLUX model family — image editing endpoint (apiyi proxy:
    `/v1/images/generations` + JSON body).


    - **Endpoint path**: `POST /v1/images/generations` (FLUX shares this path
    between text-to-image and editing — passing `input_image` switches to edit
    mode)

    - **Content-Type**: `application/json` (this Playground uses the JSON
    option, recommended; an OpenAI-compatible multipart single-image
    `/v1/images/edits` endpoint also exists — see "Option B" on the docs page)

    - **Reference image fields**: `input_image` / `input_image_2` …
    `input_image_8`, **values are public URL strings** (also accepts
    `data:image/...;base64,xxx` data URLs, but the Playground encourages plain
    URLs and leaves base64 for local code testing)

    - Multi-reference caps: FLUX.2 [pro/max/flex] up to 8, [klein] up to 4,
    FLUX.1 Kontext single image

    - In the prompt, "image 1 / image 2 / image 3" map to input_image /
    input_image_2 / input_image_3

    - Response `data[0].url` is **valid for only 10 minutes**, download
    immediately (CORS disabled)


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
        - Image Editing
      summary: Edit or fuse one or more reference images by instruction
      description: >
        Edit or fuse one or more reference images using FLUX.


        - **Path is shared with text-to-image: `/v1/images/generations`** (an
        OpenAI-compatible multipart single-image `/v1/images/edits` endpoint
        also exists — see "Option B" on the docs page)

        - Request Content-Type is `application/json`

        - **All reference image fields are URL strings**: `input_image`,
        `input_image_2` … `input_image_8`

        - If `aspect_ratio` is omitted, output dimensions match the first input
        image
      operationId: editFluxImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/EditImageRequest'
            example:
              model: flux-2-pro
              prompt: Naturally blend these two images
              input_image: https://static.apiyi.com/apiyi-logo.png
              input_image_2: https://images.unsplash.com/photo-1762138012600-2ab523f8b35a
              seed: 42
              output_format: jpeg
      responses:
        '200':
          description: Image generated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: >-
            Invalid params (missing input_image, dimensions not multiple of 16,
            exceeds 4MP, etc.)
        '401':
          description: Unauthorized — invalid API Key
        '403':
          description: Moderation block
        '413':
          description: Uploaded image too large
        '429':
          description: Rate limited or out of credits
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
        - input_image
      properties:
        model:
          type: string
          description: >-
            FLUX model ID. For multi-reference fusion prefer flux-2-pro /
            flux-2-max; for single-image edits also flux-kontext-max /
            flux-kontext-pro.
          enum:
            - flux-2-pro
            - flux-2-max
            - flux-2-flex
            - flux-2-klein-9b
            - flux-2-klein-4b
            - flux-kontext-max
            - flux-kontext-pro
          default: flux-2-pro
        prompt:
          type: string
          description: >-
            Edit / fusion instruction. In multi-reference scenarios, refer to
            images by index: 'image 1' / 'image 2' / 'image 3' map to
            input_image / input_image_2 / input_image_3.
          example: Naturally blend these two images
        input_image:
          type: string
          description: >-
            Public URL for reference image 1 (required). **Use plain URLs in the
            Playground**; for local code you can also pass a
            `data:image/png;base64,xxx` data URL.
          example: https://static.apiyi.com/apiyi-logo.png
        input_image_2:
          type: string
          description: Public URL for reference image 2 (optional)
        input_image_3:
          type: string
          description: Public URL for reference image 3 (optional)
        input_image_4:
          type: string
          description: Public URL for reference image 4 (optional)
        input_image_5:
          type: string
          description: Public URL for reference image 5 (optional)
        input_image_6:
          type: string
          description: Public URL for reference image 6 (optional)
        input_image_7:
          type: string
          description: Public URL for reference image 7 (optional)
        input_image_8:
          type: string
          description: >-
            Public URL for reference image 8 (optional, only FLUX.2
            [pro/max/flex] supports up to 8)
        aspect_ratio:
          type: string
          description: >-
            Aspect ratio, e.g. 1:1 / 16:9 / 9:16 / 4:3 / 3:4. Defaults to first
            input image.
        seed:
          type: integer
          description: Fix for reproducibility.
        safety_tolerance:
          type: integer
          description: Moderation level. 0 = strictest, 6 = most permissive. Default 2.
          minimum: 0
          maximum: 6
        output_format:
          type: string
          description: Output format. Default jpeg.
          enum:
            - jpeg
            - png
        prompt_upsampling:
          type: boolean
          description: Auto-upsample the prompt. Default false.
        steps:
          type: integer
          description: '**Only flux-2-flex**. Inference steps. Default 50.'
          minimum: 1
          maximum: 50
        guidance:
          type: number
          description: '**Only flux-2-flex**. Guidance scale. Default 4.5.'
          minimum: 1.5
          maximum: 10
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
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
                  delivery-eu.bfl.ai / delivery-us.bfl.ai with CORS disabled.
                example: >-
                  https://delivery-eu.bfl.ai/results/xxx/sample.jpeg?signature=...
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key from the APIYI Console

````