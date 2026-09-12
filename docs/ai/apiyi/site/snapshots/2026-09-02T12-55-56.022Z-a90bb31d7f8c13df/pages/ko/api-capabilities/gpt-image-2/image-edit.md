> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 이미지 편집 API 참조

> gpt-image-2 이미지 편집 API 참조 및 실시간 테스트 — 참조 이미지를 최대 16장 업로드한 뒤 단일 이미지 편집, 다중 이미지 융합 또는 마스크 인페인팅을 위한 지침을 제공합니다

<Info>
  오른쪽의 인터랙티브 플레이그라운드는 로컬 이미지의 직접 업로드를 지원합니다. **Authorization**에 API Key를 입력하고(형식: `Bearer sk-xxx`), 이미지 / 마스크 파일을 선택한 다음, `prompt`과 `model`를 입력하고 전송합니다.
</Info>

<Tip>
  **사용 사례**: 이 페이지는 "하나 이상의 참조 이미지를 기반으로 편집 / 융합 / 인페인트"하는 용도입니다. 요청 형식은 `multipart/form-data`입니다. 순수 텍스트-투-이미지의 경우 [Text-to-Image endpoint](/ko/api-capabilities/gpt-image-2/text-to-image)를 사용하십시오.
</Tip>

<Warning>
  **🖥️ 브라우저 플레이그라운드 제한(중요)**

  이 endpoint는 응답에 **원시 base64 문자열**(보통 수 MB)을 반환합니다. 브라우저 렌더링 제한 때문에, 오른쪽의 Playground는 응답이 도착한 후 `请求时发生错误: unable to complete request`를 표시할 수 있습니다 — **실제로 요청은 성공한 상태**입니다. 브라우저가 이렇게 긴 base64 문자열을 렌더링하지 못할 뿐입니다.

  **권장 워크플로**(초보자 친화적):

  * 아래의 Python / Node.js / cURL 샘플을 **복사하여 로컬에서 실행하십시오**. 코드는 응답을 자동으로 `base64.b64decode`s하고 **이미지를 파일로 저장합니다**.
  * 반드시 브라우저 내 Playground를 사용해야 한다면, \*\*아주 작은 참조 이미지(\< 50KB)\*\*를 사용하고, `size`를 가장 작은 단계(예: `1024x1024`)로 설정한 다음, `quality`을 `low`으로 설정하십시오.
</Warning>

<Warning>
  **⚠️ 주요 차이점 (gpt-image-1.5에서 마이그레이션하는 경우)**

  * **`input_fidelity`를 전달하지 마십시오** — `gpt-image-2`는 고충실도를 강제하므로, 전달하면 400이 반환됩니다
  * **편집 요청의 입력 tokens가 눈에 띄게 더 많습니다** — 참조 이미지는 Vision 요금 기준으로 많은 tokens로 변환되므로, 예산을 고려하십시오
  * **다중 이미지 융합: 최대 16개** — `image[]` 필드를 반복해서 사용하십시오. 16개를 초과하면 오류가 발생합니다
</Warning>

<Warning>
  **📎 다중 이미지 융합은 순서가 중요합니다**

  `image[]` 필드는 여러 참조 이미지를 허용합니다. **업로드 순서는 prompt의 "image 1 / image 2 / image 3" 참조에 매핑됩니다**. 명시적으로 참조하십시오:

  > image 1의 피사체를 image 2의 장면에 배치하고, image 3의 색상 스타일을 사용합니다

  파일당 제한: 각 **50MB 미만**(멀티파트 파일 업로드), 형식: `png` / `jpg` / `webp`; 실제로는 업로드하기 전에 **1.5MB 이내**로 압축하는 것이 좋습니다(아래의 "업로드 크기 제한" 참조).
</Warning>

## 코드 예시

### Python (OpenAI SDK · 단일 이미지 편집)

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.edit(
    model="gpt-image-2",
    image=open("photo.png", "rb"),
    prompt="Replace the background with a seaside sunset, preserve subject details",
    size="1536x1024",
    quality="high"
)

# b64_json is raw base64 (no prefix) — decode manually
with open("edited.png", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### Python (OpenAI SDK · 다중 이미지 융합)

```python theme={null}
resp = client.images.edit(
    model="gpt-image-2",
    image=[
        open("person.png", "rb"),
        open("scene.png", "rb"),
        open("style.png", "rb"),
    ],
    prompt="Place subject from image 1 into scene from image 2, using color style from image 3, keep lighting consistent",
    size="1536x1024",
    quality="high"
)

with open("fused.png", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### cURL (다중 이미지 융합)

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2" \
  -F "prompt=Place subject from image 1 into scene from image 2, using color style from image 3" \
  -F "size=1536x1024" \
  -F "quality=high" \
  -F "image[]=@person.png" \
  -F "image[]=@scene.png" \
  -F "image[]=@style.png"
```

### cURL (마스크 인페인팅)

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2" \
  -F "prompt=Replace the sky with pink sunset clouds" \
  -F "size=1024x1024" \
  -F "quality=high" \
  -F "image[]=@photo.png" \
  -F "mask=@mask.png" \
  | jq -r '.data[0].b64_json' | base64 -d > photo_edited.png
```

### Node.js (네이티브 fetch + FormData · 다중 이미지 융합)

```javascript theme={null}
import fs from 'node:fs';

const form = new FormData();
form.append('model', 'gpt-image-2');
form.append('prompt', 'Place subject from image 1 into scene from image 2');
form.append('size', '1536x1024');
form.append('quality', 'high');
form.append('image[]', new Blob([fs.readFileSync('./person.png')]), 'person.png');
form.append('image[]', new Blob([fs.readFileSync('./scene.png')]), 'scene.png');

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});

const { data } = await resp.json();
fs.writeFileSync('fused.png', Buffer.from(data[0].b64_json, 'base64'));
```

## 파라미터 참고

| 필드                   | 유형   | 필수  | 기본값    | 설명                                                                                                                                                                                                                 |
| -------------------- | ---- | --- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `model`              | text | 예   | —      | 고정값: `gpt-image-2`                                                                                                                                                                                                 |
| `prompt`             | text | 예   | —      | 편집 / 융합 지침                                                                                                                                                                                                         |
| `image[]`            | file | 예   | —      | 참조 이미지, 반복 가능 (**최대 16개**)                                                                                                                                                                                         |
| `mask`               | file | 아니요 | —      | 마스크 이미지(첫 번째 이미지에만 적용되며, alpha 채널이 필요합니다)                                                                                                                                                                          |
| `size`               | text | 아니요 | `auto` | 출력 크기, text-to-image와 동일합니다                                                                                                                                                                                        |
| `quality`            | text | 아니요 | `auto` | `low` / `medium` / `high` / `auto`                                                                                                                                                                                 |
| `output_format`      | text | 아니요 | `png`  | `png` / `jpeg` / `webp`                                                                                                                                                                                            |
| `output_compression` | text | 아니요 | —      | 0–100, `jpeg` / `webp`에만 적용됩니다                                                                                                                                                                                     |
| `background`         | text | 아니요 | `auto` | `transparent` / `opaque` / `auto`. `transparent`와 함께 사용할 경우, `output_format`는 `png` 또는 `webp`여야 합니다. 편집 엔드포인트의 투명도는 정밀한 잘라내기가 아니라 **재그리기**라는 점에 유의하십시오 — [투명 배경 FAQ](/ko/faq/image-transparent-background)를 참조하십시오 |

<Warning>
  **레거시 DALL·E 값 `standard` / `hd`를 `quality`에 전달하지 마십시오.** 공식 enum 값 네 가지 `low` / `medium` / `high` / `auto`만 허용됩니다. 레거시 값은 백엔드 채널마다 일관되지 않게 동작합니다. 어떤 경우에는 400(`invalid_value`)으로 즉시 실패하고, 어떤 경우에는 조용히 무시되어 요청이 `auto`으로 실행됩니다(예측할 수 없는 비용). 항상 네 가지 공식 값 중 하나를 명시적으로 전달하십시오.
</Warning>

## 업로드 크기 제한

| 항목                     | 제한                | 비고                                                                                                                                                |
| ---------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 참조 이미지 수               | 최대 **16**개        | `image[]` 필드를 반복합니다                                                                                                                               |
| 이미지당(multipart 파일 업로드) | 각 **50MB 미만**     | 형식: `png` / `jpg` / `webp`                                                                                                                        |
| 이미지당(base64 data URL)  | 필드 길이 약 **20MiB** | 이는 URL/base64 **문자열 필드**(schema `maxLength: 20971520`)의 길이 제한이며, 50MB multipart 상한과는 **다릅니다**. base64는 크기를 약 1/3 늘리므로 원본 이미지는 **15MB 이내**로 유지하십시오 |
| 마스크 파일                 | **4MB 미만 PNG**    | 원본 이미지의 크기와 정확히 일치해야 하며, 알파 채널이 있어야 합니다                                                                                                           |

<Warning>
  **전체 요청 크기를 최대치까지 채우지 마십시오**: 이미지당 상한이 50MB이고 최대 16개 이미지를 보낼 수 있더라도, 상한에 가까운 이미지가 여러 개 있으면 단일 요청 본문이 지나치게 커져 게이트웨이 / CDN / 타임아웃 실패가 발생하기 쉽습니다. 실제로는 각 이미지를 **1.5MB 이내**로 압축(JPEG 품질 80-90)하면 성공률과 생성 속도 모두 눈에 띄게 좋아지며, 출력 품질은 입력 파일 크기와 무관합니다.
</Warning>

## 참조 이미지 형식 요구사항 및 전처리

`/v1/images/edits`은 **png / jpg / webp** 표준 형식만 허용합니다. 다음과 같은 400 오류를 받는 경우:

```json theme={null}
{
  "error": {
    "message": "Invalid image file or mode for image 1, please check your image file. ...",
    "type": "shell_api_error",
    "code": "invalid_image_file"
  }
}
```

참조 이미지는 대부분 **표준 JPEG/PNG가 아닙니다**. 가장 흔한 함정은 휴대폰 카메라의 **MPO 형식**(Multi-Picture Object, 다중 프레임 JPEG 컨테이너)입니다. `.jpg` Huawei Mate 시리즈 휴대폰에서 바로 나온 파일은 HDR gain-map 하위 프레임을 포함하며 실제로는 MPO입니다. 이러한 파일은 동일한 `FFD8` 헤더로 시작합니다. 즉, **확장자와 `file` 명령 모두 JPEG라고 보고**하므로 육안으로는 구분할 수 없습니다. 프레임을 인식하는 파싱(예: Pillow)만 이를 판별할 수 있습니다. 오류의 "image 1"은 N번째 참조 이미지(1부터 시작하는 인덱스)를 의미하므로, 인덱스를 사용해 문제 파일을 찾으십시오.

<Info>
  **2026년 7월 검증 완료**: MPO 파일은 5/5 업로드에서 모두 400 오류로 실패했으며, 같은 이미지를 표준 JPEG/PNG로 다시 인코딩하자 **원래의 3072×4096 해상도 그대로** 성공했습니다. 문제는 크기나 파일 크기가 아니라 형식입니다. 오류는 입력 검증 단계에서 빠르게(약 4초) 반환되며 **과금되지 않습니다**.
</Info>

**탐지 및 수정**: `Image.open(f).format`이 `"MPO"`을 반환하면 파일을 변환해야 합니다. 업로드 파이프라인에 한 번의 재인코딩 단계를 넣으면 HEIC 및 기타 휴대폰 형식도 함께 처리할 수 있습니다.

```python theme={null}
from PIL import Image
import io

def normalize_image(path: str) -> bytes:
    """Convert phone photos (MPO/HDR multi-frame etc.) to standard JPEG that passes edits validation"""
    im = Image.open(path)
    im.load()                      # for MPO, keeps only the first (full-size) frame
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGB")
    out = io.BytesIO()
    im.save(out, format="JPEG", quality=92)   # or format="PNG"
    return out.getvalue()
```

<Tip>
  제품이 사용자가 촬영한 사진(실내 렌더링, 제품 사진 등)을 허용한다면, 이미지를 하나씩 디버깅하기보다 **서버 측에서 일관되게** 재인코딩하는 편이 좋습니다. 휴대폰 HDR 사진은 계속 들어올 수 있기 때문입니다. 추가 입력 처리 팁: [Image API Essentials and Best Practices](/ko/api-capabilities/image-api-best-practices).
</Tip>

## 마스크 인페인팅 요구사항

* **원본과 동일한 크기**여야 하며, **PNG 형식**이고, **4MB 미만**이어야 합니다.
* **알파 채널이 있어야 합니다**: 투명(알파=0) = 인페인트 영역, 불투명 = 유지
* 마스크는 **첫 번째** 이미지에만 적용됩니다
* 마스크는 "부드러운 가이드"입니다 — 모델이 마스크된 영역 주변을 확장하거나 축소할 수 있습니다

<Tip>
  **멀티턴 반복**: 이전 출력을 다음 호출의 `image[]`로 다시 전달하고, 점진적으로 정교화하는 새 지시를 추가합니다. 각 라운드는 독립적으로 token 기준 과금됩니다 — 누적 비용을 주의하십시오.
</Tip>

## Response Format

```json theme={null}
{
    "created": 1776832476,
    "data": [
        {
            "b64_json": "iVBORw0KGgoAAAANSUhEUgAA..."
        }
    ],
    "usage": {
        "input_tokens": 848,
        "input_tokens_details": {
            "image_tokens": 832,
            "text_tokens": 16
        },
        "output_tokens": 196,
        "output_tokens_details": {
            "image_tokens": 196,
            "text_tokens": 0
        },
        "total_tokens": 1044
    }
}
```

<Warning>
  `b64_json` is **raw base64**, **without** the `data:image/...;base64,` prefix — different from `gpt-image-2-all`. Decode it client-side to write a file, or prepend the prefix for browser rendering.
</Warning>

<Info>
  Edit requests' `input_tokens` are typically **significantly higher** than text-to-image at the same size, because reference images are billed per Vision pricing rules — the exact amount is available directly in `usage.input_tokens_details.image_tokens`, tracked separately from the text portion (`text_tokens`). Multi-image fusion increases `image_tokens` **strictly linearly** per additional reference image (verified July 2026: 4 × 1024² images = 4 × 1024 tokens) — see [How Multiple Input Images Affect the Price](/ko/api-capabilities/gpt-image-2/overview#how-multiple-input-images-affect-the-price-verified-july-2026) for the measurement table. See [How to check the real token count for each call](/ko/api-capabilities/gpt-image-2/overview#how-to-check-the-real-token-count-for-each-call) on the overview page for the full field reference.
</Info>


## OpenAPI

````yaml api-reference/gpt-image-2-edit-openapi-en.yaml POST /v1/images/edits
openapi: 3.1.0
info:
  title: gpt-image-2 Image Edit API
  description: >
    OpenAI's flagship image generation model `gpt-image-2` — image edit
    endpoint.


    - Supports single-image edit, multi-image fusion (up to 16 reference
    images), mask inpainting

    - Request format: `multipart/form-data`

    - In prompt, use "image 1 / image 2 / image 3" to reference `image` upload
    order

    - **Reference images auto-enable high-fidelity** — **do not** pass
    `input_fidelity` (will error)

    - Edit requests have noticeably higher input tokens than text-to-image at
    the same size


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
  /v1/images/edits:
    post:
      tags:
        - Image Edit
      summary: 'Image Edit: edit or fuse reference images by instruction'
      description: >
        Use `gpt-image-2` to edit, fuse, or inpaint images by text instruction.


        - At least one `image` required (max 16)

        - multipart file upload: each image under 50MB, formats: png/jpg/webp
        (base64 data URL is bound by a ~20MiB field-length limit — keep
        originals ≤ 15MB)

        - `mask` field (optional) must match the original image's size, be PNG
        and under 4MB, and have an alpha channel (transparent = inpaint area)

        - mask only applies to the first image

        - Do not pass `input_fidelity` (forced high-fidelity, will error if
        passed)
      operationId: editGptImage2Image
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/EditImageRequest'
            encoding:
              image:
                contentType: image/png, image/jpeg, image/webp
              mask:
                contentType: image/png
      responses:
        '200':
          description: Image generated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: >-
            Invalid parameters (input_fidelity / background:transparent / size
            constraint violation, etc.)
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
    EditImageRequest:
      type: object
      required:
        - model
        - prompt
        - image
      properties:
        model:
          type: string
          description: Model name, fixed as gpt-image-2
          enum:
            - gpt-image-2
          default: gpt-image-2
        prompt:
          type: string
          description: >-
            Edit/fusion instruction. For multi-image, use 'image 1 / image 2 /
            image 3' to reference upload order
          example: >-
            Place subject from image 1 into scene from image 2, using color
            style from image 3
        image:
          type: array
          description: >-
            Reference images. **For a single image, send the field once; for
            multiple images, repeat the same `image` field** (e.g., `-F
            image=@a.png -F image=@b.png`, **max 16**) — upload order maps to
            image 1 / image 2 / ... in the prompt. multipart file upload: each
            under 50MB, formats: png/jpg/webp; compress to within 1.5MB in
            practice
          items:
            type: string
            format: binary
        mask:
          type: string
          format: binary
          description: >
            Mask image (optional, only applies to first image). Requirements:

            - Same size as original

            - PNG format, under 4MB

            - Must have alpha channel (alpha=0 = inpaint area, opaque =
            preserve)
        size:
          type: string
          description: >-
            Output size (same as text-to-image). Preset or constraint-satisfying
            custom size
          example: 1536x1024
          default: auto
        quality:
          type: string
          description: Quality tier
          enum:
            - auto
            - low
            - medium
            - high
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
        background:
          type: string
          description: 'Background mode. auto or opaque. **Not supported**: transparent'
          enum:
            - auto
            - opaque
          default: auto
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
          example: 1776832476
        data:
          type: array
          description: Generation results (this model returns 1 image per call)
          items:
            type: object
            properties:
              b64_json:
                type: string
                description: '**Raw base64 string** (no data:image/...;base64, prefix)'
                example: iVBORw0KGgoAAAANSUhEUgAA...
        usage:
          type: object
          description: Token usage for this call
          properties:
            input_tokens:
              type: integer
              example: 1280
            output_tokens:
              type: integer
              example: 6240
            total_tokens:
              type: integer
              example: 7520
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key obtained from APIYI Console

````