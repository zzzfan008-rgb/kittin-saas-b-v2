> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 이미지 편집 API 레퍼런스

> Grok Imagine 2 이미지 편집 API 레퍼런스 및 실시간 테스트 — 편집 또는 융합을 위한 지시문과 함께 참조 이미지 1-4장을 업로드합니다; multipart/form-data가 필요합니다

<Warning>
  **🔒 기본적으로 열려 있지 않음**: Grok Imagine 2는 `Default` 그룹에 속하지 않습니다. 자체 **`Grok_imagine` 그룹**에 속하며, 호출하기 전에 액세스를 요청해야 합니다(이 페이지의 플레이그라운드 포함). 액세스 권한이 없으면 모든 호출이 `503`을 반환합니다.

  이 제품군의 콘텐츠 안전 정책은 플랫폼의 다른 모델과 크게 다르며 일부 카테고리는 필터링되지 않으므로, 컴플라이언스 위험을 제한하기 위해 선택적으로 액세스 권한을 부여합니다. 누적 지출이 \$1,000 이상인 기존 고객은 지원팀에 사용 사례를 설명하여 활성화할 수 있으며, 그 외 사용자는 사용 사례와 적용 중인 콘텐츠 조정 제어 방안을 설명하여 [WeCom 지원](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)을 통해 신청합니다. 전체 절차: [Grok Imagine 2 개요 - 그룹 설정](/ko/api-capabilities/grok-imagine-image/overview#group-setup).
</Warning>

<Info>
  오른쪽의 대화형 플레이그라운드는 로컬 파일 업로드를 지원합니다. **Authorization**에 API Key를 입력하고(형식: `Bearer sk-xxx`), `image` 파일을 선택한 다음 `prompt` 및 `model`을 입력하고 전송합니다.
</Info>

<Warning>
  **🔴 이 엔드포인트는 `multipart/form-data` 파일 업로드가 필요합니다**

  `/v1/images/edits`에 JSON을 전송하면 **항상 400을 반환합니다**:

  ```text theme={null}
  request Content-Type isn't multipart/form-data
  ```

  **특히 xAI 또는 업스트림 공급업체의 문서에서 통합하는 경우 중요합니다**: 해당 문서는 공개 이미지 URL(`{"image": {"type": "image_url", "url": "..."}}`)을 포함한 JSON 본문을 설명하지만, 그 형식은 APIYI 게이트웨이를 통해서는 **작동하지 않습니다**. 대신 이 페이지를 따르십시오.

  장점은 파일 업로드를 사용하면 **이미지 호스팅이 필요 없다는 것**입니다. 로컬 파일을 바로 전송하면 되므로 공개 URL을 준비하는 것보다 간단합니다.

  파일 필드 이름은 **`image`** 또는 \*\*`image[]`\*\*이어야 합니다. `images` / `image_file`은 **415**를 반환합니다. `prompt`은 필수이며, 생략하면 400을 반환합니다.
</Warning>

<Tip>
  **이 페이지를 사용하는 경우**: 참조 이미지 하나를 편집하거나 여러 개를 융합할 때입니다. prompt만으로 생성하려면 [텍스트-이미지 엔드포인트](/ko/api-capabilities/grok-imagine-image/text-to-image)를 사용하십시오.
</Tip>

<Warning>
  **⚠️ 출력 크기는 첫 번째 참조 이미지를 따르며 변경할 수 없습니다**

  `resolution` 및 `aspect_ratio`은 여기서 오류 없이 허용되지만 **효과가 없습니다**. 편집된 출력은 항상 **첫 번째 참조 이미지의 크기**와 일치합니다(1280x720 입력 시 1280x720 출력, 1024x1024 입력 시 1024x1024 출력).

  융합에도 동일하게 적용됩니다. 참조 이미지 4개의 순서를 뒤집으면 출력이 1280x720에서 1024x1024으로 바뀌며, **새로운 첫 번째 이미지**를 따릅니다.

  출력 크기를 변경하려면 **업로드 전에 첫 번째 참조 이미지를 자르거나 크기를 조정하십시오**.
</Warning>

<Info>
  **융합 순서는 중요합니다**: `image[]`은 **1-4**개의 참조 이미지를 허용하며(측정된 상한은 4개이고, 다섯 번째 이미지는 400을 반환함), **업로드 순서가 prompt에서 말하는 ‘이미지 1 / 이미지 2 / 이미지 3’을 의미합니다**. 예를 들어 ‘이미지 1의 피사체를 이미지 2의 장면에 배치하고, 이미지 2의 아트 스타일을 유지’와 같이 명시적으로 지정하십시오.

  2 / 3 / 4개의 참조 이미지로 측정한 결과, **추가되는 각 이미지는 출력에 해당 피사체를 추가**하며 각 이미지의 고유한 특성이 유지됩니다. 즉, 융합은 실제로 작동합니다.
</Info>

## 코드 예시

### Python (OpenAI SDK, 단일 이미지)

```python theme={null}
from openai import OpenAI
import urllib.request

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    timeout=360.0
)

# The SDK's images.edit already performs a multipart upload — pass the file object directly
resp = client.images.edit(
    model="grok-imagine-image",
    image=open("fox.jpg", "rb"),
    prompt="Change the scarf color to bright RED. Keep everything else exactly the same.",
    n=1
)

urllib.request.urlretrieve(resp.data[0].url, "edited.jpg")
```

### Python (원시 requests, 단일 이미지)

```python theme={null}
import requests
import urllib.request

API_KEY = "sk-your-api-key"

# Key point: use files= so requests sets multipart/form-data and the boundary for you.
# Never use json= — that sends application/json and the gateway rejects it with 400.
with open("fox.jpg", "rb") as fp:
    response = requests.post(
        "https://api.apiyi.com/v1/images/edits",
        headers={"Authorization": f"Bearer {API_KEY}"},  # do NOT set Content-Type manually
        data={
            "model": "grok-imagine-image",
            "prompt": "Change the scarf to red, keep everything else exactly the same",
            "n": 1,
            "response_format": "url"
        },
        files={"image": ("fox.jpg", fp, "image/jpeg")},
        timeout=360
    ).json()

urllib.request.urlretrieve(response["data"][0]["url"], "edited.jpg")
```

### Python (멀티 이미지 융합, 파일 1-4개)

```python theme={null}
import requests

API_KEY = "sk-your-api-key"

# Repeat the image[] field for multiple references — order is "image 1 / image 2"
files = [
    ("image[]", ("character.jpg", open("character.jpg", "rb"), "image/jpeg")),
    ("image[]", ("scene.jpg", open("scene.jpg", "rb"), "image/jpeg")),
]

response = requests.post(
    "https://api.apiyi.com/v1/images/edits",
    headers={"Authorization": f"Bearer {API_KEY}"},
    data={
        "model": "grok-imagine-image",
        "prompt": "Put the character from image 1 into the scene from image 2, "
                  "keeping image 2's art style and palette",
        "response_format": "url"
    },
    files=files,
    timeout=360
).json()

print(response["data"][0]["url"])
```

### cURL

```bash theme={null}
# Single-image edit: -F means multipart/form-data, @ uploads a local file
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=grok-imagine-image" \
  -F "prompt=Change the scarf to red, keep everything else exactly the same" \
  -F "n=1" \
  -F "response_format=url" \
  -F "image=@fox.jpg"
```

```bash theme={null}
# Multi-image fusion: repeat image[], order is "image 1 / image 2"
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=grok-imagine-image-quality" \
  -F "prompt=Put the character from image 1 into the scene from image 2, keep image 2's style" \
  -F "image[]=@character.jpg" \
  -F "image[]=@scene.jpg"
```

### Node.js (네이티브 fetch + FormData)

```javascript theme={null}
import fs from 'node:fs';

const form = new FormData();
form.append('model', 'grok-imagine-image');
form.append('prompt', 'Change the scarf to red, keep everything else exactly the same');
form.append('n', '1');
form.append('response_format', 'url');
// Single image uses `image`; for fusion append `image[]` repeatedly (max 3)
form.append('image', new Blob([fs.readFileSync('./fox.jpg')]), 'fox.jpg');

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    // Do not set Content-Type manually — let FormData supply the boundary
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form,
    signal: AbortSignal.timeout(360000)
});

const data = await resp.json();
const img = await fetch(data.data[0].url);
fs.writeFileSync('edited.jpg', Buffer.from(await img.arrayBuffer()));
```

### 브라우저 JavaScript

```javascript theme={null}
// ⚠️ Demo only: a front-end key is exposed — use a backend proxy in production
const fileInput = document.querySelector('#file');   // an <input type="file"> element

const form = new FormData();
form.append('model', 'grok-imagine-image');
form.append('prompt', 'Replace the background with a snowy pine forest at night, keep the subject');
form.append('response_format', 'url');
form.append('image', fileInput.files[0]);

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});

const data = await resp.json();
document.querySelector('#preview').src = data.data[0].url;
```

## 파라미터 레퍼런스

| 파라미터               | 타입      | 필수 | 기본값   | 설명                                                                                                 |
| ------------------ | ------- | -- | ----- | -------------------------------------------------------------------------------------------------- |
| `model`            | string  | ✅  | —     | `grok-imagine-image` (\$0.02/image) 또는 `grok-imagine-image-quality` (\$0.045/image)                |
| `prompt`           | string  | ✅  | —     | 편집 지시입니다. 무엇을 변경할지와 나머지는 모두 그대로 유지한다고 적습니다                                                         |
| `image`            | file    | ✅  | —     | 참조 이미지 파일입니다. 융합의 경우 `image[]`를 반복 사용하며, **1-4개 파일**(다섯 번째는 400을 반환합니다). **첫 번째 파일이 출력 차원을 설정합니다** |
| `n`                | integer | ❌  | `1`   | 출력 이미지, **1-10**, 이미지당 과금되며 참조 개수와 무관합니다                                                           |
| `response_format`  | string  | ❌  | `url` | `url`는 직접 링크를 반환합니다; `b64_json`는 원시 base64를 반환합니다(**없음** `data:` 접두사)                              |
| ~~`resolution`~~   | string  | ❌  | —     | **여기서는 영향이 없습니다** — 출력은 입력 이미지를 따릅니다                                                               |
| ~~`aspect_ratio`~~ | string  | ❌  | —     | **여기서는 영향이 없습니다** — 출력은 입력 이미지를 따릅니다                                                               |

<Info>
  이 계열은 **마스크 인페인팅을 지원하지 않습니다**. 변경 범위를 제한하려면 prompt에 이를 정확히 설명하십시오 — 예를 들어 “스카프만 빨간색으로 바꾸고, 나머지는 모두 정확히 그대로 유지합니다”라고 적으십시오. 모델은 이러한 제약을 매우 엄격하게 따릅니다.
</Info>

## 편집 동작 및 prompt 스타일

편집 엔드포인트는 **입력 이미지의 아트 스타일, 구도, 팔레트 및 주체 정체성을 유지하고**, prompt가 지정한 내용만 변경합니다. 안정적인 결과를 얻으려면:

| prompt 스타일                                                                           | 결과                                  |
| ------------------------------------------------------------------------------------ | ----------------------------------- |
| ✅ `Change the scarf to red, keep everything else exactly the same`                   | 스카프만 변경되며, 스타일, 구도 및 배경은 유지됩니다      |
| ✅ `Add round black sunglasses to the cat, keep everything else unchanged`            | 선글라스만 추가되며, 윤곽선 스타일과 배경색은 그대로 유지됩니다 |
| ✅ `Put the character from image 1 into the scene from image 2, keep image 2's style` | 두 입력의 특성을 모두 유지하는 융합입니다             |
| ⚠️ `Make it look better`                                                             | 너무 모호함 — 변경 범위가 예측 불가능해집니다          |

<Tip>
  **“나머지는 모두 그대로 유지하십시오”라고 명시적으로 말하는 것**이 이 모델에서 가장 효과적인 기법입니다. 융합의 경우에는 항상 `image[]` 업로드 순서에 맞춰 “image 1 / image 2”를 지칭하십시오.

  또한 **가장 중요한 주체를 먼저 배치하십시오**: 첫 번째 이미지는 출력 크기만 설정하는 것이 아니라, 테스트에서는 순서를 반대로 하면 보조 주체의 정체성이 다른 대상과 섞이는 문제가 발생했습니다.
</Tip>

## 응답 형식

```json theme={null}
{
  "created": 0,
  "data": [
    {
      "url": "https://apac.ossforai.com/2026/08/12/09b026d5-3492-4678-907c-e25972e6c914.jpg"
    }
  ],
  "usage": {
    "prompt_tokens": 1000,
    "total_tokens": 1000
  }
}
```

<Warning>
  **응답 필드 주의사항**

  * 각 `data[]` 항목에는 `response_format`에 따라 **`url` 또는 `b64_json` 중 하나만** 포함됩니다 — 둘 다는 아닙니다.
  * **`revised_prompt`은 반환되지 않습니다** — 존재한다고 가정하지 마십시오.
  * `b64_json`은 `data:image/...;base64,` 접두사가 없는 **원시 base64**입니다 — 바로 디코드하십시오.
  * `created`는 항상 `0`이며 타임스탬프로 사용할 수 없습니다.
  * 출력 차원은 **입력 이미지**에 의해 결정되므로 요청 파라미터로 너비/높이를 예측하지 마십시오.
</Warning>

<Info>
  **`usage`은 정산에 사용할 수 없습니다**: `prompt_tokens`는 항상 `1000 x n`인 플레이스홀더입니다. 편집 비용은 이미지당 정액 요율로 텍스트-투-이미지와 **동일**하며, 실제 과금은 APIYI 콘솔 과금 기록을 사용하십시오.
</Info>


## OpenAPI

````yaml api-reference/grok-imagine-image-edit-openapi-en.yaml POST /v1/images/edits
openapi: 3.1.0
info:
  title: Grok Imagine 2 Image Editing API
  description: >
    xAI Grok Imagine 2 image generation models — image editing endpoint.


    - **Requests must be `multipart/form-data` (file upload)** — sending JSON
    returns 400

    - Supports single-image editing and multi-image fusion (1-4 reference images
    via repeated `image[]`)

    - Reference fidelity is high: art style, composition, palette and subject
    identity are preserved;
      only what the prompt asks for changes
    - **Output dimensions follow the FIRST reference image**: `resolution` /
    `aspect_ratio` have no effect here

    - Flat per-request pricing, same as text-to-image


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
  /v1/images/edits:
    post:
      tags:
        - Image Editing
      summary: 'Image editing: edit a reference image or fuse several'
      description: >
        Edit uploaded reference images with a text instruction using Grok
        Imagine 2 models.


        - **Must use `multipart/form-data`.** Sending `application/json`
        (including the
          `{"image": {"type": "image_url", "url": "..."}}` form shown in upstream vendor docs)
          always returns 400 `invalid_image_request`:
          `request Content-Type isn't multipart/form-data`
        - The file field must be named `image` or `image[]`; `images` /
        `image_file` return 415

        - `prompt` is required; omitting it returns 400

        - 1-4 reference images (measured ceiling is 4; a fifth returns 400);
        with multiple images refer to them as "image 1 / image 2" in the prompt
      operationId: editGrokImagineImage
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/GrokImagineEditRequest'
            encoding:
              image:
                contentType: image/png, image/jpeg, image/webp
      responses:
        '200':
          description: Image generated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: >-
            Request was not multipart/form-data, prompt missing, or content
            blocked by moderation
        '401':
          description: Unauthorized - invalid API Key
        '415':
          description: Unsupported file field name (only `image` / `image[]` are accepted)
        '429':
          description: Rate limit exceeded or insufficient balance
      security:
        - bearerAuth: []
components:
  schemas:
    GrokImagineEditRequest:
      type: object
      required:
        - model
        - prompt
        - image
      properties:
        model:
          type: string
          description: Model ID
          enum:
            - grok-imagine-image
            - grok-imagine-image-quality
          default: grok-imagine-image
        prompt:
          type: string
          description: >
            Editing instruction. State what to change and explicitly ask for
            everything else to stay put,

            e.g. `Change the scarf color to bright RED. Keep everything else
            exactly the same.`
          example: >-
            Change the scarf color to bright RED. Keep everything else exactly
            the same.
        image:
          type: string
          format: binary
          description: >
            Reference image file. For multi-image fusion repeat the `image[]`
            field (1-4 files);

            upload order is what "image 1 / image 2 / image 3" refers to in the
            prompt, and

            **the first file also determines output dimensions**. Each added
            image contributes

            a subject in testing. Accepted formats: png / jpg / webp.
        'n':
          type: integer
          description: >-
            Number of output images, 1-10. Independent of the number of
            reference images
          minimum: 1
          maximum: 10
          default: 1
          example: 1
        response_format:
          type: string
          description: >-
            Response format. `url` returns a direct link; `b64_json` returns raw
            base64 (no data: prefix)
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
                description: Direct image link, returned when `response_format=url`
                example: >-
                  https://apac.ossforai.com/2026/08/12/09b026d5-3492-4678-907c-e25972e6c914.jpg
              b64_json:
                type: string
                description: >-
                  Raw base64 image data, returned when
                  `response_format=b64_json` (no data: prefix)
        usage:
          type: object
          description: >-
            **Placeholder values — do not use for billing reconciliation.**
            `prompt_tokens` is always `1000 x n`
          properties:
            prompt_tokens:
              type: integer
              example: 1000
            total_tokens:
              type: integer
              example: 1000
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key created in the APIYI Console

````