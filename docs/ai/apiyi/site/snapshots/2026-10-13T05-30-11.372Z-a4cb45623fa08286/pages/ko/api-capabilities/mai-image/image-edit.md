> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 이미지 편집 API 레퍼런스

> 실시간 Playground를 지원하는 MAI-Image 2.6 이미지 편집 API 레퍼런스 — 1~5장의 참조 이미지와 편집 또는 합성 지시어를 업로드할 수 있으며, multipart/form-data 파일 업로드만 지원됩니다. 참조 이미지 개수에 따라 가격이 달라지지 않습니다.

<Info>
  오른쪽의 대화형 Playground는 로컬 이미지 업로드를 지원합니다. **Authorization**에 API 키를 입력하고(형식: `Bearer sk-xxx`), 하나 이상의 `image` 파일을 선택한 후 `prompt` 및 `model`을 입력하고 전송하십시오.
</Info>

<Warning>
  **🔴 이 엔드포인트는 `multipart/form-data` 파일 업로드만 허용합니다**

  `/v1/images/edits`에 JSON을 전송하면(`image`를 URL, data URI 또는 원시 base64로 전달하는 경우) 400이 반환됩니다:

  ```text theme={null}
  request Content-Type isn't multipart/form-data
  ```

  **이미지 URL은 입력으로 지원되지 않습니다.** URL만 있는 경우, 먼저 서버에서 다운로드한 후 해당 파일을 업로드하십시오. 파일 업로드는 이미지 호스팅이 필요하지 않으며 로컬 파일을 바로 전송하면 됩니다.
</Warning>

<Tip>
  **사용 사례**: 이 페이지는 참조 이미지를 사용한 편집을 다루며, 단일 이미지 편집 및 1\~5개의 이미지 합성을 지원합니다. 텍스트만으로 생성하려면 [텍스트-이미지 API](/ko/api-capabilities/mai-image/text-to-image)를 사용하십시오.
</Tip>

<Info>
  **🖼️ 1\~5개의 참조 이미지 지원 (2026-10-07부터)**

  * **방법**: `image[]` 필드를 필드당 이미지 1개씩 반복합니다. OpenAI SDK에서는 목록(`client.images.edit(image=[f1, f2, ...])`)을 전달하십시오. `image`를 반복해도 작동합니다
  * **순서**: 이미지는 업로드 순서대로 번호가 매겨지므로(이미지 1, 이미지 2, …), prompt에 "이미지 2의 여우를 이미지 1에 넣어줘"와 같이 작성할 수 있습니다
  * **가격**: 요청당 과금되며, **이미지 1개나 5개나 비용은 동일합니다**
  * **형식**: JPEG, PNG, WebP 지원. GIF 및 기타 형식은 400을 반환합니다
  * **5개 초과 이미지**는 400 `at most 5 reference images are accepted for <model>`을 반환합니다
</Info>

<Warning>
  **`image` + `image2`과 같이 번호가 매겨진 필드 이름을 사용하지 마십시오**: 요청은 200을 반환하지만 **첫 번째 이미지만 사용되고** 두 번째 이미지는 제외됩니다. `image1` + `image2`는 500 `image is required`을 반환합니다. 여러 이미지를 사용할 때는 항상 `image[]`을 반복하십시오.
</Warning>

<Info>
  **텍스트-이미지와 동일한 금지 파라미터**: `response_format`, `seed` 또는 `negative_prompt`를 전송하지 마십시오(400 반환). 응답은 항상 `data[0].b64_json` (PNG)입니다.
</Info>

## 코드 예제

### Python (OpenAI SDK · 단일 이미지)

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    timeout=180.0
)

# images.edit uses a multipart file upload under the hood; do not pass response_format
resp = client.images.edit(
    model="MAI-Image-2.6-Flash",
    image=open("teaset.jpg", "rb"),
    prompt="Change the teapot to a deep cobalt blue glaze, keep everything else identical"
)

with open("edited.png", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### Python (OpenAI SDK · 다중 이미지 합성)

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    timeout=180.0
)

# Pass a list of 1-5 files; the SDK uploads each one as an image[] field
# Images are numbered in upload order (image 1, image 2, ...); same price as a single image
resp = client.images.edit(
    model="MAI-Image-2.6-Flash",
    image=[open("teaset.jpg", "rb"), open("fox.jpg", "rb")],
    prompt="Put the fox from image 2 (keeping every detail of its look) into the scene of image 1, sitting next to the tea set; keep everything else in image 1 unchanged"
)

with open("fused.png", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### Python (requests · 단일 이미지)

```python theme={null}
import base64
import os
import requests

# Pass the file via files=; requests sets multipart/form-data and the boundary for you
# Do not use json=, and do not set Content-Type by hand
with open("teaset.jpg", "rb") as fp:
    response = requests.post(
        "https://api.apiyi.com/v1/images/edits",
        headers={"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"},
        data={
            "model": "MAI-Image-2.6",
            "prompt": "Change the teapot to a deep cobalt blue glaze, keep everything else exactly the same"
        },
        files={"image": ("teaset.jpg", fp, "image/jpeg")},
        timeout=180
    )
response.raise_for_status()

with open("edited.png", "wb") as f:
    f.write(base64.b64decode(response.json()["data"][0]["b64_json"]))
```

여러 장의 이미지를 사용할 경우, 이미지당 하나의 `image[]`를 갖는 튜플 목록으로 `files`를 전달하십시오 (dict는 중복 키를 가질 수 없습니다):

```python theme={null}
files = [
    ("image[]", ("teaset.jpg", open("teaset.jpg", "rb"), "image/jpeg")),
    ("image[]", ("fox.jpg", open("fox.jpg", "rb"), "image/jpeg")),
]
```

### cURL

```bash theme={null}
# Single-image edit: -F means multipart/form-data, @ uploads a local file
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=MAI-Image-2.6-Flash" \
  -F "prompt=Change the teapot to a deep cobalt blue glaze, keep everything else identical" \
  -F "image=@teaset.jpg" \
  | python3 -c "import sys,json,base64; open('edited.png','wb').write(base64.b64decode(json.load(sys.stdin)['data'][0]['b64_json']))"
```

```bash theme={null}
# Edit and change the canvas to 1536×1024 (a different aspect ratio recomposes the image)
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=MAI-Image-2.6" \
  -F "prompt=Turn this tea set into a lifestyle scene on a wooden table, natural light, photorealistic" \
  -F "width=1536" \
  -F "height=1024" \
  -F "image=@teaset.jpg"
```

```bash theme={null}
# Multi-image fusion: repeat the image[] field, 1-5 images, numbered in upload order
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=MAI-Image-2.6-Flash" \
  -F "prompt=Put the fox from image 2 (keeping every detail of its look) into the scene of image 1, sitting next to the tea set; keep everything else in image 1 unchanged" \
  -F "image[]=@teaset.jpg" \
  -F "image[]=@fox.jpg" \
  | python3 -c "import sys,json,base64; open('fused.png','wb').write(base64.b64decode(json.load(sys.stdin)['data'][0]['b64_json']))"
```

### Node.js (fetch + FormData)

```javascript theme={null}
import fs from 'node:fs';

const form = new FormData();
form.append('model', 'MAI-Image-2.6-Flash');
form.append('prompt', 'Replace the background with a snowy pine forest at night, keep the person unchanged');
form.append('image', new Blob([fs.readFileSync('./photo.jpg')]), 'photo.jpg');
// Multi-image fusion: call form.append('image[]', ...) once per image instead, up to 5

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    // Do not set Content-Type by hand; FormData adds the boundary
    headers: { 'Authorization': `Bearer ${process.env.APIYI_API_KEY}` },
    body: form,
    signal: AbortSignal.timeout(120000)
});

const data = await resp.json();
fs.writeFileSync('edited.png', Buffer.from(data.data[0].b64_json, 'base64'));
```

## 파라미터 참조

| 파라미터 | 타입 | 필수 여부 | 기본값 | 설명 |
| - | - | - | - | - |
| `model` | string | ✅ | — | `MAI-Image-2.6` (이미지당 \$0.12) 또는 `MAI-Image-2.6-Flash` (이미지당 \$0.06), **대소문자 구분** |
| `prompt` | string | ✅ | — | 편집 지시문입니다. 변경할 내용과 그 외 다른 부분은 동일하게 유지되도록 명시하십시오 |
| `image` / `image[]` | file | ✅ | — | 참조 이미지 파일(**1\~5개**)입니다. 단일 이미지에는 `image`를 사용하고, 여러 개인 경우 업로드 순서대로 이미지 1…N으로 지정되는 `image[]` 필드를 반복하십시오. JPEG / PNG / WebP를 지원하며, 개수에 따라 가격이 달라지지 않습니다 |
| `width` / `height` | integer | ❌ | 원본 비율을 따름 | 출력 크기이며, 텍스트 투 이미지 생성과 동일한 규칙이 적용됩니다. 종횡비가 다르면 이미지가 **재구성**됩니다 |
| `n` | integer | ❌ | `1` | 생성할 이미지 수입니다. **이 엔드포인트에서 지원되며**, 이미지당 과금됩니다 |
| ~~`mask`~~ | — | — | — | **지원되지 않음**, 400 `<model> does not support mask edits`을 반환합니다 |
| ~~`response_format`~~ / ~~`seed`~~ / ~~`negative_prompt`~~ | — | — | — | **400 반환** |

<Info>
  **생략 시 출력 크기**: 출력은 16의 배수로 맞춰진 원본의 종횡비를 따릅니다. 예를 들어 1344×756 입력은 1360×768이 됩니다. 이미지가 여러 개인 경우 **이미지 1**을 기준으로 종횡비가 설정됩니다. 구도를 유지해야 하는 부분 편집의 경우 `width` / `height`을 전달하지 마십시오.
</Info>

## 편집 결과 및 프롬프팅

편집 엔드포인트는 **원본의 구도, 색상, 세부 사항을 유지**하며 프롬프트에서 요청한 부분만 변경합니다:

<Frame>
  <img src="https://mintcdn.com/apiyillc/_zXMTnA1u6gpoDyM/images/mai-image-edit-teaset.jpg?fit=max&auto=format&n=_zXMTnA1u6gpoDyM&q=85&s=c86dc86c5aadf0173e19102433c01f49" alt="MAI-Image-2.6-Flash 편집 예시: 주전자 색상이 크림색에서 코발트 블루로 변경되고 다른 부분은 변경되지 않음" width="1048" height="532" data-path="images/mai-image-edit-teaset.jpg" />
</Frame>

| 프롬프트 | 결과 |
| - | - |
| ✅ `Change the teapot to a deep cobalt blue glaze, keep everything else exactly the same` | 주전자 색상만 변경되며, 라벨과 다른 오브젝트는 픽셀 단위까지 동일하게 유지됩니다 |
| ✅ `Turn this photo into a watercolor painting, keep the composition` | 스타일은 다시 칠해지지만 구도는 유지됩니다 |
| ⚠️ `Make it look better` | 너무 모호하여 변경 범위가 예측 불가능합니다 |

<Tip>
  **“다른 부분은 모두 그대로 유지해 주세요”라고 명시적으로 지정하는 것**이 이 모델에서 가장 효과적인 기법이며 원본을 최대한 그대로 보존할 수 있습니다.
</Tip>

### 다중 이미지 합성

이미지 1이 베이스 역할을 하며, 프롬프트의 설명에 따라 다른 참조 이미지의 오브젝트가 그 안에 배치됩니다. 아래 예시는 한 번의 요청으로 5장의 이미지(다기 세트 + 여우 + 고무 오리 + 자명종 시계 + 선인장)를 전송하며, 이미지 2의 여우, 이미지 3의 노란색 고무 오리, 이미지 4의 빨간색 빈티지 자명종 시계, 이미지 5의 화분에 심은 선인장을 각 오브젝트의 외형을 유지하면서 이미지 1의 찻상 위에 배치하고 이미지 1의 나머지 부분은 변경하지 않도록 요청하는 프롬프트입니다:

<Frame>
  <img src="https://mintcdn.com/apiyillc/M34PNfQX341lt5W7/images/mai-image-multi-ref-5.jpg?fit=max&auto=format&n=M34PNfQX341lt5W7&q=85&s=0c18a285c65fa48646505b109e3600c7" alt="MAI-Image-2.6-Flash 다중 이미지 합성 예시: 5개의 참조 이미지를 입력하여 다기 세트 이미지에 4개의 오브젝트를 모두 배치하고 나머지 부분은 변경하지 않음" width="1200" height="1229" data-path="images/mai-image-multi-ref-5.jpg" />
</Frame>

| 프롬프트 | 결과 |
| - | - |
| ✅ `Put the fox from image 2 into the scene of image 1, keep everything else in image 1 unchanged` | 업로드 순서에 따라 이미지를 이미지 N으로 지정하며, 가장 신뢰할 수 있는 표현 방식입니다 |
| ✅ 각 이미지의 오브젝트 이름 지정: `the yellow rubber duck from image 3, the red alarm clock from image 4` | 이미지가 많을 때 각 오브젝트의 이름을 명시하면 누락을 방지할 수 있습니다 |
| ⚠️ `Combine these images into one` | 베이스 이미지나 주체가 지정되지 않아 구도를 예측할 수 없습니다 |

## 응답 형식

```json theme={null}
{
  "created": 1791000788,
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

  * `b64_json`은 **`data:` 접두사가 없는 순수 base64**이며 PNG로 디코딩됩니다.
  * `n > 1` 사용 시 `data` 배열에 여러 항목이 포함되므로 `data[0]`만 읽지 마십시오.
  * `url` 및 `revised_prompt`는 반환되지 않습니다.
</Warning>

<Info>
  **`usage`을(를) 기준으로 과금을 대조하지 마십시오**: 해당 필드에는 자리표시자 값이 포함되어 있습니다(`prompt_tokens`은 항상 1000 × 이미지 수입니다). 편집은 텍스트 기반 이미지 생성과 **비용이 동일**하며, 이미지당 과금되고 **참조 이미지 수에 따라 가격이 변경되지 않습니다**. APIYI 콘솔의 과금 내역이 공식 기준입니다.
</Info>


## OpenAPI

````yaml api-reference/mai-image-edit-openapi-en.yaml POST /v1/images/edits
openapi: 3.1.0
info:
  title: MAI-Image 2.6 Image Editing API
  description: >
    Microsoft MAI-Image 2.6 image generation — image editing endpoint.


    - **The request must be `multipart/form-data` (file upload)**; JSON or image
    URLs return 400

    - **1–5 reference images**: use `image` for one; for several, repeat the
    `image[]` field (pass a list with the OpenAI SDK), numbered image 1…N in
    upload order. **Do not use numbered field names such as `image2`** (the
    second image is dropped)

    - No mask support; do not send `response_format` / `seed` /
    `negative_prompt`

    - Flat per-image pricing, same as text-to-image, regardless of the number of
    reference images; `n` works on this endpoint and is billed per image


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
  /v1/images/edits:
    post:
      tags:
        - Image Editing
      summary: 'Image editing: edit reference images (1–5)'
      description: >
        Edit or fuse 1–5 uploaded reference images from a text instruction with
        MAI-Image 2.6.


        - **Must use `multipart/form-data`**. Sending `application/json` returns
          400: `request Content-Type isn't multipart/form-data`
        - **Multi-image fusion**: repeat the `image[]` field, up to 5 images
        (more returns 400); `image` + `image2` uses only the first image; a
        `mask` field returns 400

        - Reference images must be JPEG / PNG / WebP

        - Without `width` / `height` the output follows the original's ratio; a
        different aspect ratio recomposes the image
      operationId: editMaiImage
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/MaiImageEditRequest'
            encoding:
              image:
                contentType: image/png, image/jpeg, image/webp
      responses:
        '200':
          description: Image generated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: >-
            Not multipart/form-data, more than 5 or unsupported-format reference
            images, a mask field, invalid parameters, or blocked by moderation
        '401':
          description: Unauthorized - invalid API key
        '429':
          description: Rate limit exceeded or insufficient balance
        '500':
          description: >-
            No image file field in the request, or numbered field names such as
            `image1` + `image2` (`image is required`)
      security:
        - bearerAuth: []
components:
  schemas:
    MaiImageEditRequest:
      type: object
      required:
        - model
        - prompt
        - image
      properties:
        model:
          type: string
          description: Model ID (case-sensitive)
          enum:
            - MAI-Image-2.6-Flash
            - MAI-Image-2.6
          default: MAI-Image-2.6-Flash
        prompt:
          type: string
          description: >-
            Edit instruction. State what to change and that everything else
            stays the same
          example: >-
            Change the teapot to a deep cobalt blue glaze, keep everything else
            identical
        image:
          type: array
          items:
            type: string
            format: binary
          minItems: 1
          maxItems: 5
          description: >-
            Reference image files, 1–5, numbered image 1…N in upload order. png
            / jpg / webp. In code, repeat the `image[]` field for several images
        width:
          type: integer
          description: >-
            Optional output width. Same rules as text-to-image: each side ≥ 768,
            width × height ≤ 2,359,296, sent together with `height`
          minimum: 768
        height:
          type: integer
          description: Optional output height, same rules as `width`
          minimum: 768
        'n':
          type: integer
          description: Number of images. Works on this endpoint, billed per image
          minimum: 1
          default: 1
          example: 1
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
          description: Creation timestamp
          example: 1791000788
        data:
          type: array
          description: Image results; length equals `n`
          items:
            type: object
            properties:
              b64_json:
                type: string
                description: 'Plain base64 image data (PNG, no data: prefix)'
        usage:
          type: object
          description: >-
            **Placeholder values, not for billing reconciliation.**
            `prompt_tokens` is always `1000 × images`
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
      description: API key from the APIYI console

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.