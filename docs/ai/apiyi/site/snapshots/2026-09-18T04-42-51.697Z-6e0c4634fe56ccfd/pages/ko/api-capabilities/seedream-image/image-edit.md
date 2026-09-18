> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 이미지 편집 API 레퍼런스

> Seedream 이미지 편집, 다중 이미지 융합, 배치 시퀀스 생성 API 레퍼런스 및 라이브 플레이그라운드 — image 배열과 sequential_image_generation 파라미터로 전환되는 동일한 generations 엔드포인트

<Info>
  **하나의 엔드포인트, 여러 모드**: Seedream에는 별도의 `/v1/images/edits` 엔드포인트가 없습니다. 편집, 다중 이미지 융합, 배치 시퀀스는 모두 `POST /v1/images/generations`를 통해 실행됩니다. 이 페이지의 Playground는 [Text-to-Image](/ko/api-capabilities/seedream-image/text-to-image)와 동일한 엔드포인트를 사용하며, 차이는 본문에 있는 `image` 및 `sequential_image_generation` 파라미터뿐입니다.
</Info>

<Tip>
  **모드**:

  * **단일 이미지 편집** — `image: ["url"]` + `sequential_image_generation: "disabled"`
  * **다중 이미지 융합** — `image: ["url1", "url2", ...]` + `disabled`
  * **배치 시퀀스** — `sequential_image_generation: "auto"` + `sequential_image_generation_options.max_images: N`
  * **이미지-시퀀스** — 두 가지를 결합합니다: `image` 배열 + `auto` + `max_images`
</Tip>

<Warning>
  **🖥️ 브라우저 Playground 제한 (b64\_json 모드만 해당)**

  기본 `response_format: "url"` 모드에서는 Playground가 정상적으로 작동합니다(응답은 임시 BytePlus TOS 링크일 뿐입니다). `response_format: "b64_json"`로 전환하면 응답에 수 MB의 base64 문자열이 포함되어 브라우저 Playground에 `请求时发生错误: unable to complete request`가 표시될 수 있습니다 — **실제로 요청은 성공한 것입니다**; 브라우저가 이렇게 긴 base64 문자열을 렌더링하지 못할 뿐입니다.

  **권장 작업 흐름**:

  * 이미지만 보고 싶으신가요? **기본 `url` 모드를 유지하십시오** — Playground가 링크를 직접 반환합니다(24시간 이내에 자체 저장소로 다운로드해야 합니다).
  * b64\_json이 필요하신가요? **아래 코드 샘플을 복사하여 로컬에서 실행하십시오** — 코드는 이미지를 자동으로 디코딩하여 파일로 저장합니다.
</Warning>

<Warning>
  **⚠️ OpenAI gpt-image-2 편집과의 주요 차이점**

  * **multipart/form-data 업로드는 없습니다** — 먼저 이미지를 OSS 또는 공개 이미지 호스트에 업로드한 다음, `image` 배열에 URL을 전달하십시오
  * **`image`는 URL 배열**이며, 반복되는 `image[]` 필드가 아닙니다(OpenAI의 `multipart/form-data` 형식과는 다릅니다)
  * **`mask` 필드가 없습니다** — Seedream은 알파 채널 마스크 인페인팅을 지원하지 않으며, 전체 이미지는 프롬프트에 의해 다시 작성됩니다
  * **총 개수의 하드 제한**: 입력 참조 + 출력 ≤ 15개 이미지
</Warning>

<Warning>
  **📎 다중 이미지 순서는 중요합니다**

  `image` 배열에 있는 URL의 순서가 프롬프트에서 참조하는 「이미지 1 / 이미지 2 / 이미지 3」이 됩니다. 순서를 명시적으로 지정하십시오:

  > 이미지 1의 의상을 이미지 2의 복장으로 바꾸고, 이미지 3의 조명을 유지하십시오.

  영어 프롬프트가 가장 잘 작동합니다(모델은 주로 영어로 학습되었습니다). 다만 표현이 모호하지 않다면 중국어도 지원됩니다.
</Warning>

## 코드 예시

<Note>
  **`extra_body`에 대한 설명(중요 — 추가 중첩 레이어로 오해하지 마십시오)**

  `image`, `sequential_image_generation` 및 `watermark`는 OpenAI SDK의 `images.generate()`에서 표준 매개변수가 아니므로, Python SDK에서는 이를 전송하려면 **반드시** `extra_body` 내부에 넣어야 합니다.

  하지만 `extra_body`은 SDK의 매개변수 컨테이너일 뿐이며, 해당 필드는 요청 본문의 **최상위 수준에서** `model` 및 `prompt`과 **동일한 수준으로 평탄화되고 병합됩니다**. 실제로 전송되는 JSON은 아래 cURL 예시와 동일하며(`image`은 최상위 수준에 위치합니다), 요청에 실제 `"extra_body": {...}` 중첩은 **없습니다**.

  OpenAI SDK를 사용하지 않고 대신 JSON을 직접 구성하는 경우(requests / fetch / 기타), `extra_body`을 작성하지 마십시오. 대신 `image` 및 다른 필드를 `model`와 동일한 수준에 배치하십시오.
</Note>

### Python (OpenAI SDK · 단일 이미지 편집)

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.generate(
    model="seedream-5-0-260128",
    prompt="Generate a close-up image of a dog lying on lush grass.",
    size="2K",
    response_format="url",
    # Fields in extra_body are flattened to the top level of the request body
    # (same level as model) by the SDK — not an extra nesting layer
    extra_body={
        "image": ["https://your-oss.example.com/source-photo.png"],
        "sequential_image_generation": "disabled",
        "watermark": False,
    }
)

print(resp.data[0].url)
```

### Python (OpenAI SDK · 다중 이미지 융합)

```python theme={null}
resp = client.images.generate(
    model="seedream-4-5-251128",
    prompt="Replace the clothing in image 1 with the outfit from image 2, keeping the lighting style of image 3.",
    size="4K",
    response_format="url",
    extra_body={
        "image": [
            "https://your-oss.example.com/person.png",
            "https://your-oss.example.com/outfit.png",
            "https://your-oss.example.com/lighting-ref.png",
        ],
        "sequential_image_generation": "disabled",
        "watermark": False,
    }
)

print(resp.data[0].url)
```

### Python (OpenAI SDK · 일괄 시퀀스)

```python theme={null}
resp = client.images.generate(
    model="seedream-5-0-260128",
    prompt=(
        "Generate four cinematic sci-fi storyboard scenes:"
        "Scene 1 — astronaut repairing a spacecraft;"
        "Scene 2 — meteor strike in deep space;"
        "Scene 3 — emergency dodge in zero gravity;"
        "Scene 4 — astronaut returning to ship."
    ),
    size="2K",
    response_format="url",
    extra_body={
        "sequential_image_generation": "auto",
        "sequential_image_generation_options": {"max_images": 4},
        "watermark": False,
    }
)

for item in resp.data:
    print(item.url)
```

### cURL (다중 이미지 융합)

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "seedream-5-0-260128",
    "prompt": "Replace the clothing in image 1 with the outfit from image 2.",
    "image": [
      "https://your-oss.example.com/person.png",
      "https://your-oss.example.com/outfit.png"
    ],
    "sequential_image_generation": "disabled",
    "size": "2K",
    "response_format": "url",
    "watermark": false
  }'
```

### Node.js (fetch · 일괄 시퀀스)

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'seedream-5-0-260128',
        prompt: 'A four-panel comic about a cat astronaut: launch, space walk, alien encounter, return home.',
        size: '2K',
        sequential_image_generation: 'auto',
        sequential_image_generation_options: { max_images: 4 },
        response_format: 'url',
        watermark: false
    })
});

const { data } = await resp.json();
data.forEach((item, i) => console.log(`#${i + 1}:`, item.url));
```

<Warning>
  **참조 이미지는 base64가 아닌 공개 URL로 전달하십시오(2026-09-11부터 강조)**

  `image` 배열의 항목이 URL인 경우 요청 본문은 몇 KB에 불과하며, BytePlus가 **싱가포르 리전에서 사용자의 이미지를 직접 다운로드합니다**(확인 결과: 가져오기에 사용된 IP는 BytePlus에 속하며 APIYI 게이트웨이는 관여하지 않습니다).
  항목이 `data:image/...;base64,...` 문자열인 경우 고해상도 참조 이미지 몇 장만으로도 본문 크기가 20\~30MB에 쉽게 도달합니다. 이 본문은 먼저 APIYI 게이트웨이에 전체 업로드된 다음 싱가포르로 전달되어야 합니다. 국경 간 업로드가 느리면 요청 본문을 읽는 제공업체의 수신 제한 시간인 600초를 초과하여 `400 Error when parsing request`과 함께 실패합니다.
  게이트웨이가 base64를 사용자가 다운로드할 수 있는 링크로 변환해 주지 않으므로 전체 요청이 실패하며 URL 모드로 대체되지도 않습니다.

  * ✅ 이미지를 자체 객체 스토리지 또는 이미지 호스팅 서비스에 호스팅하고, 인증 없이 일반 GET으로 가져올 수 있는 공개 URL을 전달하십시오. 각 이미지는 약 10MB 이하로 유지하십시오.
  * ⚠️ base64가 불가피한 경우 먼저 압축하십시오. 긴 변은 2048px 이내로 유지하고, 품질 0.9로 다시 인코딩하며, 여러 이미지의 총 크기는 6MB 이하로 유지하십시오.
  * ❌ 20MB를 초과하는 base64 본문을 전송하지 말고, 사설 네트워크 주소나 로그인이 필요한 링크를 전달하지 마십시오(BytePlus는 가져오기에 실패하면 `InvalidParameter: Error while downloading`을 반환합니다).
</Warning>

## 매개변수 참조

| 매개변수                                             | 유형        | 필수      | 기본값        | 설명                                                                                                                      |
| ------------------------------------------------ | --------- | ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| `model`                                          | string    | 예       | —          | `seedream-5-0-260128` / `seedream-4-5-251128` / `seedream-4-0-250828` / `seedream-5-0-pro-260628` (Pro 티어, \$0.12/요청)   |
| `prompt`                                         | string    | 예       | —          | 편집 / 융합 / 시퀀스 지시문                                                                                                       |
| `image`                                          | string 배열 | 편집에 필요함 | —          | URL 또는 base64 데이터 URI 형식의 참조 이미지(`data:image/jpeg;base64,...`, 검증됨), **최대 10개**(공식 4.5 / 5.0-pro 문서 기준)                 |
| `sequential_image_generation`                    | string    | 아니요     | `disabled` | 단일 출력용 `disabled`; 배치 시퀀스용 `auto`. **5.0-pro에서는 지원되지 않습니다: 어떤 값이든(`disabled` 포함) 400을 반환하므로 — Pro에서는 매개변수를 완전히 생략하십시오** |
| `sequential_image_generation_options.max_images` | 정수        | 아니요     | —          | `auto`와 함께 사용할 때만 유효합니다. **입력 + 출력 ≤ 15**의 제한을 받습니다. 또한 5.0-pro에서는 지원되지 않습니다                                            |
| `size`                                           | string    | 아니요     | `2K`       | 사전 설정된 티어 또는 정확한 픽셀 — **티어 지원은 버전에 따라 다릅니다**(개요 참조)                                                                     |
| `response_format`                                | string    | 아니요     | `url`      | `url` / `b64_json`                                                                                                      |
| `output_format`                                  | string    | 아니요     | `jpeg`     | 5.0 / 5.0-pro는 `png` / `jpeg`를 지원하며; 4.5 / 4.0에서는 `jpeg`만 지원합니다                                                         |
| `watermark`                                      | 불리언       | 아니요     | 달라짐        | 상업적 사용을 위해 `false`로 설정합니다                                                                                               |
| `stream`                                         | 불리언       | 아니요     | `false`    | 스트리밍 출력이며, 긴 prompt에 권장됩니다. **5.0-pro에서는 지원되지 않습니다 — 400을 반환합니다**                                                       |

## 다중 이미지 및 시퀀스 모드의 개수 제약

| Scenario        | Input `image` count | `max_images` | 실제 출력 | 총 제약          |
| --------------- | ------------------- | ------------ | ----- | ------------- |
| 단일 이미지 편집       | 1                   | —            | 1     | 2 ≤ 15 ✅      |
| 다중 이미지 융합       | 3                   | —            | 1     | 4 ≤ 15 ✅      |
| 다중 이미지 융합 + 시퀀스 | 3                   | 4            | 4     | 7 ≤ 15 ✅      |
| 다중 이미지 융합 + 시퀀스 | 10                  | 6            | 6     | 16 > 15 ❌ 거부됨 |

<Tip>
  **반복적 정제**: 이전 출력의 URL을 다음 입력으로 넣고, 새 편집 지시와 함께 제공하여 점진적으로 정제합니다. 각 라운드는 이미지당 과금되므로 누적 비용에 유의하십시오.
</Tip>

## 응답 형식

```json theme={null}
{
  "model": "seedream-5-0-260128",
  "created": 1768518000,
  "data": [
    {
      "url": "https://ark-content-generation-v2-ap-southeast-1.tos-ap-southeast-1.bytepluses.com/seedream-5-0/.../scene-1.png",
      "size": "2048x2048"
    },
    {
      "url": "https://...scene-2.png",
      "size": "2048x2048"
    }
  ],
  "usage": {
    "generated_images": 2,
    "output_tokens": 12480,
    "total_tokens": 12480
  }
}
```

<Warning>
  **⚠️ `data` 배열 길이는 실제 출력 개수를 반영합니다**

  * `sequential_image_generation: "disabled"` → 단일 요소 `data`
  * `sequential_image_generation: "auto"` + `max_images: N` → 일반적으로 N개 요소입니다(프롬프트가 더 적은 결과를 생성하면 경우에 따라 더 적을 수 있습니다)
  * 과금은 `usage.generated_images` 기준이며, **`max_images` 기준이 아닙니다**
</Warning>

<Info>
  편집 요청은 텍스트-이미지와 동일하게, 출력 이미지당 과금됩니다. 참조 이미지 입력은 별도로 과금되지 않습니다.
</Info>


## OpenAPI

````yaml api-reference/seedream-image-edit-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: Seedream Image Editing / Multi-image Fusion / Batch Sequence API
  description: >
    BytePlus ModelArk Seedream image generation models — editing / multi-image
    fusion / batch sequence endpoint.


    **Important**: Seedream has no separate `/v1/images/edits` endpoint.
    Editing, multi-image fusion, and batch sequence generation all run through
    `POST /v1/images/generations`. The mode is switched via `image` and
    `sequential_image_generation` in the request body.


    - Single-image editing: `image: ["url"]` + `sequential_image_generation:
    "disabled"`

    - Multi-image fusion: `image: ["url1", "url2", ...]` + `disabled` (up to 10
    reference images)

    - Batch sequence: `sequential_image_generation: "auto"` + `max_images`

    - Hard constraint: **input reference images + output images ≤ 15**


    Unlike OpenAI gpt-image-2, this endpoint **does not accept
    multipart/form-data**. Upload images to your OSS or a public image host
    first, then pass the URLs as an array.


    **Auth**: add `Authorization: Bearer YOUR_API_KEY` to the request header.
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
      summary: Image Editing / Multi-image Fusion / Batch Sequence
      description: >
        Generate new images from reference images (`image` URL array) plus a
        prompt, or enable batch sequence to output multiple coherent images.


        - Single-image edit: pass 1 image + disabled

        - Multi-image fusion: pass multiple images + disabled, refer to "image 1
        / image 2" in the prompt

        - Batch sequence: with or without image, set auto + max_images
      operationId: editSeedreamImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SeedreamEditRequest'
            example:
              model: seedream-5-0-260128
              prompt: Replace the clothing in image 1 with the outfit from image 2.
              image:
                - https://your-oss.example.com/person.png
                - https://your-oss.example.com/outfit.png
              sequential_image_generation: disabled
              size: 2K
              response_format: url
              watermark: false
      responses:
        '200':
          description: Edited image generated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SeedreamImageResponse'
        '400':
          description: >-
            Invalid parameters (image array exceeds 10, total input+output
            exceeds 15, unsupported size, etc.)
        '401':
          description: Unauthorized — invalid API key
        '403':
          description: Blocked by content moderation
        '404':
          description: URLs in image array unreachable
        '429':
          description: Rate limit (default 500 RPM) or insufficient balance
        '500':
          description: Internal server error
      security:
        - bearerAuth: []
components:
  schemas:
    SeedreamEditRequest:
      type: object
      required:
        - model
        - prompt
      properties:
        model:
          type: string
          description: Model ID
          enum:
            - seedream-5-0-260128
            - seedream-5-0-lite-260128
            - seedream-4-5-251128
            - seedream-4-0-250828
            - seedream-5-0-pro-260628
          default: seedream-5-0-260128
        prompt:
          type: string
          description: >-
            Editing / fusion / sequence instruction. For multi-image scenarios,
            refer to images explicitly as 'image 1 / image 2'
          example: Replace the clothing in image 1 with the outfit from image 2.
        image:
          type: array
          items:
            type: string
            format: uri
          description: >-
            Reference image URL array. **Up to 10 images** (per official 4.5
            docs). Note: input + output count ≤ 15
          maxItems: 10
          example:
            - https://your-oss.example.com/person.png
            - https://your-oss.example.com/outfit.png
        sequential_image_generation:
          type: string
          description: >-
            Generation mode switch. disabled = single output (default); auto =
            batch sequence, paired with max_images
          enum:
            - disabled
            - auto
          default: disabled
        sequential_image_generation_options:
          type: object
          description: >-
            Batch sequence options. Effective only when
            sequential_image_generation=auto
          properties:
            max_images:
              type: integer
              description: Max number of output images. Subject to input + output ≤ 15
              minimum: 1
              maximum: 15
              example: 4
        size:
          type: string
          description: >
            Output size. Preset tiers (vary by version):

            - `1K` (4.0 only) / `2K` (all) / `3K` (5.0 only) / `4K` (4.5, 4.0)


            Or exact pixel size `WxH`, total pixels ∈ \[1280×720, 4096×4096\],
            aspect ratio ∈ \[1/16, 16\]
          example: 2K
          default: 2K
        response_format:
          type: string
          enum:
            - url
            - b64_json
          default: url
        output_format:
          type: string
          description: Output format. 5.0 supports png/jpeg; 4.5/4.0 only jpeg
          enum:
            - png
            - jpeg
          default: jpeg
        watermark:
          type: boolean
          default: false
        stream:
          type: boolean
          description: >-
            Streaming output. Recommended for long prompts and multi-image
            sequence scenarios
          default: false
    SeedreamImageResponse:
      type: object
      properties:
        model:
          type: string
          example: seedream-5-0-260128
        created:
          type: integer
          example: 1768518000
        data:
          type: array
          description: >-
            Result array. disabled mode returns 1 element; auto mode typically
            returns max_images elements (may be fewer)
          items:
            type: object
            properties:
              url:
                type: string
                example: >-
                  https://ark-content-generation-v2-ap-southeast-1.tos-ap-southeast-1.bytepluses.com/.../image.png
              b64_json:
                type: string
                description: 'Plain base64 string, no data: prefix'
              size:
                type: string
                example: 2048x2048
        usage:
          type: object
          description: Billed by generated_images actual count, NOT by max_images
          properties:
            generated_images:
              type: integer
              example: 1
            output_tokens:
              type: integer
              example: 6240
            total_tokens:
              type: integer
              example: 6240
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key obtained from APIYI Console

````