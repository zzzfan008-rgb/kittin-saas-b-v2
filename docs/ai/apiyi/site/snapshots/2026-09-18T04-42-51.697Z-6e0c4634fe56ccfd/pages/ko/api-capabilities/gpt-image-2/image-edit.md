> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 이미지 편집 API 레퍼런스

> gpt-image-2.5-sunburst / gpt-image-2.5-flare / gpt-image-2 이미지 편집 API 레퍼런스 및 실시간 테스트 — 참조 이미지(최대 16개) + 단일 이미지 편집, 여러 이미지 융합 또는 마스크 인페인팅을 위한 지침 업로드

<Info>
  오른쪽의 대화형 플레이그라운드는 로컬 이미지 직접 업로드를 지원합니다. **Authorization**에 API Key를 입력하고(형식: `Bearer sk-xxx`), 이미지 / 마스크 파일을 선택한 다음 `prompt` 및 `model`를 입력하고 전송합니다.
</Info>

<Tip>
  **사용 사례**: 이 페이지는 “하나 이상의 참조 이미지를 기반으로 편집 / 융합 / 인페인팅”하는 용도입니다. 요청 형식은 `multipart/form-data`입니다. 순수한 텍스트-이미지 생성에는 [텍스트-이미지 엔드포인트](/ko/api-capabilities/gpt-image-2/text-to-image)를 사용합니다.
</Tip>

<Warning>
  **🖥️ 브라우저 플레이그라운드 제한 사항(중요)**

  이 엔드포인트는 응답에서 **원시 base64 문자열**(일반적으로 수 MB)을 반환합니다. 브라우저 렌더링 제한으로 인해 오른쪽의 플레이그라운드에는 응답이 도착한 후 `请求时发生错误: unable to complete request`가 표시될 수 있습니다. — **요청은 실제로 성공한 것입니다**. 브라우저에서 이렇게 긴 base64 문자열을 렌더링하지 못할 뿐입니다.

  **권장 워크플로**(초보자에게 적합):

  * **아래의 Python / Node.js / cURL 샘플을 복사하여 로컬에서 실행합니다**. 코드가 응답을 자동으로 `base64.b64decode`하고 **이미지를 파일에 기록합니다**.
  * 브라우저 내 플레이그라운드를 반드시 사용해야 한다면 \*\*매우 작은 참조 이미지(\< 50KB)\*\*를 사용하고, `size`을 가장 작은 등급(예: `1024x1024`)으로 설정한 다음 `quality`을 `low`로 설정합니다.
</Warning>

<Warning>
  **⚠️ gpt-image-1.5에서 마이그레이션할 때의 주요 차이점**

  * **`input_fidelity`을 전달하지 마십시오** — 세 모델 모두 고충실도를 강제하므로 전달하면 400 오류가 반환됩니다(2026-09-09에 2.5에서 검증됨).
  * **편집 요청은 입력 token이 눈에 띄게 더 많습니다** — 비전 과금을 통해 참조 이미지가 많은 token으로 변환되므로 이에 맞게 예산을 책정해야 합니다.
  * **다중 이미지 융합: 최대 16개** — `image[]` 필드를 반복 사용하십시오. 16개를 초과하면 오류가 발생합니다.
</Warning>

<Warning>
  **📎 다중 이미지 융합에서는 순서가 중요합니다**

  `image[]` 필드는 여러 참조 이미지를 허용합니다. **업로드 순서는 프롬프트의 “이미지 1 / 이미지 2 / 이미지 3” 참조에 매핑됩니다**. 다음과 같이 명시적으로 참조하십시오.

  > 이미지 1의 피사체를 이미지 2의 장면에 배치하고, 이미지 3의 색상 스타일을 사용합니다.

  파일별 제한: **각 파일 50MB 미만**(multipart 파일 업로드), 형식: `png` / `jpg` / `webp`. 업로드하기 전에 실제로는 **1.5MB 이내**로 압축하십시오(아래의 “업로드 크기 제한” 참조).
</Warning>

## 코드 예제

### Python (OpenAI SDK · 단일 이미지 편집)

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.edit(
    model="gpt-image-2.5-sunburst",
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
    model="gpt-image-2.5-sunburst",
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
  -F "model=gpt-image-2.5-sunburst" \
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
  -F "model=gpt-image-2.5-sunburst" \
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
form.append('model', 'gpt-image-2.5-sunburst');
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

## 매개변수 참조

| 필드                   | 유형  | 필수  | 기본값    | 설명                                                                                                                                                                                                                                          |
| -------------------- | --- | --- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`              | 텍스트 | 예   | —      | `gpt-image-2.5-sunburst` (편집 정밀도 우선, 편집에 권장) / `gpt-image-2.5-flare` (속도 우선) / `gpt-image-2` (이전 세대, 계속 사용 가능); 프로덕션에서는 날짜가 지정된 스냅샷 `gpt-image-2.5-sunburst-2026-09-08` / `gpt-image-2.5-flare-2026-09-08`을 고정하십시오. 세 가지 모두 가격과 매개변수가 동일합니다 |
| `prompt`             | 텍스트 | 예   | —      | 편집 / 융합 지침                                                                                                                                                                                                                                  |
| `image[]`            | 파일  | 예   | —      | 참조 이미지, 반복해서 지정할 수 있습니다 (**최대 16개**)                                                                                                                                                                                                        |
| `mask`               | 파일  | 아니요 | —      | 마스크 이미지 (첫 번째 이미지에만 적용되며 알파 채널이 필요합니다)                                                                                                                                                                                                      |
| `size`               | 텍스트 | 아니요 | `auto` | 출력 크기, 텍스트-이미지와 동일합니다                                                                                                                                                                                                                       |
| `quality`            | 텍스트 | 아니요 | `auto` | `low` / `medium` / `high` / `xhigh` / `max` / `auto`; `xhigh` / `max`는 2.5에서 새로 추가되었으며, `gpt-image-2`은 `high`에서 중단됩니다                                                                                                                       |
| `output_format`      | 텍스트 | 아니요 | `png`  | `png` / `jpeg` / `webp`                                                                                                                                                                                                                     |
| `output_compression` | 텍스트 | 아니요 | —      | 0–100, `jpeg` / `webp`에만 적용됩니다                                                                                                                                                                                                              |
| `background`         | 텍스트 | 아니요 | `auto` | `transparent` / `opaque` / `auto`. `transparent`을 사용하는 경우 `output_format`는 `png` 또는 `webp`이어야 합니다. 편집 엔드포인트의 투명도는 정밀한 컷아웃이 아니라 **다시 그리기**라는 점에 유의하십시오 — [투명 배경 FAQ](/ko/faq/image-transparent-background)를 참조하십시오                           |

<Warning>
  **`quality`에 기존 DALL·E 값 `standard` / `hd`을 전달하지 마십시오.** 공식 enum 값 6개인 `low` / `medium` / `high` / `xhigh` / `max` / `auto`만 허용됩니다 (`xhigh` / `max`는 두 2.5 모델에서만 허용됩니다). 기존 값은 백엔드 채널에 따라 일관되지 않게 동작합니다. 즉시 400(`invalid_value`)으로 실패하는 경우도 있고, 아무런 표시 없이 무시되어 요청이 `auto`로 실행되는 경우도 있습니다(비용을 예측할 수 없음). 항상 공식 값 중 하나를 명시적으로 전달하십시오.
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
  title: gpt-image-2.5 / 2 Image Edit API
  description: >
    OpenAI GPT-Image 2.5 / 2 series (`gpt-image-2.5-sunburst` /
    `gpt-image-2.5-flare` / `gpt-image-2`) — image edit endpoint. Same price and
    parameters across all three; sunburst has the highest editing precision.


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
        Use `gpt-image-2.5-sunburst` / `gpt-image-2.5-flare` / `gpt-image-2` to
        edit, fuse, or inpaint images by text instruction.


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
          default: gpt-image-2.5-sunburst
        prompt:
          type: string
          maxLength: 32000
          description: >-
            Edit/fusion instruction, up to 32,000 characters (provider limit,
            counted in characters). For multi-image, use 'image 1 / image 2 /
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
          description: Quality tier. xhigh / max are new in 2.5 and rejected by gpt-image-2
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