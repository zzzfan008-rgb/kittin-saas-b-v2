> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan3.0 동영상 생성 API 레퍼런스

> Wan3.0 동영상 생성 API 레퍼런스 및 실시간 Playground: 단일 모델 ID로 텍스트-투-비디오, 이미지-투-비디오, 레퍼런스-투-비디오 및 동영상 편집을 지원하며, 최대 30초, 480P-1080P, DashScope 비동기 패스스루 엔드포인트를 제공합니다.

<Info>
  오른쪽의 Playground를 사용하여 직접 테스트할 수 있습니다. **Authorization**에 `Bearer sk-your-api-key`을(를) 입력하고, `model` / `input` / `parameters`을(를) 채운 다음 전송하십시오. 성공적으로 제출되면 `task_id`이(가) 반환되며, 폴링 및 다운로드는 아래에서 다룹니다.
</Info>

<Tip>
  Wan3.0은 **단일 모델 ID로 모든 모드를 지원합니다** — 전송하는 미디어에 따라 동작 방식이 결정됩니다. 전체 비동기 워크플로, 상태 표, 과금 규칙 및 Python 클라이언트는 [Wan3.0 개요](/ko/api-capabilities/wan3/overview)에서 확인할 수 있습니다.
</Tip>

<Warning>
  * 생성 요청은 반드시 `X-DashScope-Async: enable` 헤더와 함께 `/wan/api/v1/services/aigc/video-generation/video-synthesis`(으)로 전송해야 합니다. **`/v1/videos`은(는) 사용하지 마십시오**(미디어 필드가 누락되고 과금이 부정확해집니다).
  * `duration`은(는) 반드시 **정수**(`5`이며, `"5"`이 아님)여야 하고, `resolution`은(는) **대문자**(`720P`)(으)로 작성해야 합니다.
  * 최종 상태는 `completed` / `failed`이며, `SUCCEEDED`이(가) **아닙니다**.
</Warning>

## 네 가지 모드, 하나의 필드

| 모드 | `media`에 입력할 내용 |
| - | - |
| 텍스트-동영상 | `media` 생략 |
| 이미지-동영상 | `[{ "type": "first_frame", "url": "..." }]` |
| 첫/마지막 프레임 동영상 | `first_frame` + `last_frame` |
| 참조-동영상 | `reference_image` / `reference_video` / `reference_audio` (혼합 가능) |

<Warning>
  `first_frame` / `last_frame`은 `reference_*` / `file` / `link`와 **혼합할 수 없습니다**.
</Warning>

## 코드 예제

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis" \
    -H "X-DashScope-Async: enable" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "wan3.0-video",
      "input": {
        "prompt": "A lighthouse by the sea at dusk, slow dolly-in, waves on the rocks, cinematic lighting"
      },
      "parameters": {
        "resolution": "720P",
        "ratio": "16:9",
        "duration": 5,
        "prompt_extend": true
      }
    }'
  ```

  ```python Python (requests) theme={null}
  import requests

  url = "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis"
  headers = {
      "Authorization": "Bearer sk-your-api-key",
      "Content-Type": "application/json",
      "X-DashScope-Async": "enable",   # required when creating a task
  }
  body = {
      "model": "wan3.0-video",
      "input": {"prompt": "A lighthouse by the sea at dusk, slow dolly-in, waves on the rocks"},
      "parameters": {"resolution": "720P", "ratio": "16:9", "duration": 5, "prompt_extend": True},
  }

  resp = requests.post(url, json=body, headers=headers, timeout=30)
  task_id = resp.json()["output"]["task_id"]
  print("task_id:", task_id)
  ```

  ```javascript Node.js theme={null}
  const res = await fetch(
    "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer sk-your-api-key",
        "Content-Type": "application/json",
        "X-DashScope-Async": "enable",
      },
      body: JSON.stringify({
        model: "wan3.0-video",
        input: { prompt: "A lighthouse by the sea at dusk, slow dolly-in, waves on the rocks" },
        parameters: { resolution: "720P", ratio: "16:9", duration: 5, prompt_extend: true },
      }),
    }
  );
  const data = await res.json();
  console.log("task_id:", data.output.task_id);
  ```
</CodeGroup>

### 이미지 투 비디오 (첫 프레임)

```json theme={null}
{
  "model": "wan3.0-video",
  "input": {
    "prompt": "The cat turns toward the camera and blinks",
    "media": [{ "type": "first_frame", "url": "https://example.com/cat.jpg" }]
  },
  "parameters": { "resolution": "720P", "duration": 5 }
}
```

### 레퍼런스 투 비디오 (참조 이미지 + 참조 동영상)

```json theme={null}
{
  "model": "wan3.0-video-prime",
  "input": {
    "prompt": "Replace the person in video 1 with the person in image 1, keep everything else",
    "media": [
      { "type": "reference_image", "url": "https://example.com/person.jpg" },
      { "type": "reference_video", "url": "https://example.com/source.mp4" }
    ]
  },
  "parameters": { "resolution": "720P", "ratio": "9:16", "duration": 5 }
}
```

<Warning>
  **참조 동영상 길이에 대해 과금됩니다.** 위의 예시에서 10초 길이의 참조와 5초의 출력은 **15초**로 과금됩니다. 입력 + 출력은 최대 30초로 제한됩니다. 자세한 내용은 [과금 규칙](/ko/api-capabilities/wan3/overview#%EF%B8%8F-billing-rules-different-from-other-video-models)을 참고하십시오.
</Warning>

## 폴링 및 다운로드

```bash theme={null}
# Poll every 5-10 seconds (never below 3)
curl "https://api.apiyi.com/v1/tasks/$TASK_ID" \
  -H "Authorization: Bearer sk-your-api-key"

# Download: result_url is a signed OSS link - do not send Authorization
curl -o out.mp4 "$RESULT_URL"
```

| 상태 | 의미 | 다음 단계 |
| - | - | - |
| `submitted` | 대기 중 | 계속 폴링 |
| `in_progress` | 생성 중 | 계속 폴링 |
| `completed` | 완료 | `result_url`에서 다운로드 |
| `failed` | 실패 | `error.message` 확인; **과금되지 않음** |

## 한눈에 보는 가격

기본 요율은 \*\*Alibaba 공식 가격의 98%\*\*이며, 최대 [충전 보너스](/ko/faq/recharge-promotions) 적용 시 \*\*약 81.7%\*\*까지 낮아집니다.

| 모델 | 해상도 | 기본 요금 | 10% 보너스 적용 시 | **20% 보너스 적용 시** | 20% 보너스 적용 가격(CNY) |
| - | - | - | - | - | - |
| `wan3.0-video` | 480P | \$0.0294/초 | \$0.0267/초 | **\$0.0245/초** | ¥0.1715/초 |
| `wan3.0-video` | 720P | \$0.0588/초 | \$0.0535/초 | **\$0.049/초** | ¥0.343/초 |
| `wan3.0-video` | 1080P | \$0.1176/초 | \$0.1069/초 | **\$0.098/초** | ¥0.686/초 |
| `wan3.0-video-prime` | 480P | \$0.063/초 | \$0.0573/초 | **\$0.0525/초** | ¥0.3675/초 |
| `wan3.0-video-prime` | 720P | \$0.126/초 | \$0.1145/초 | **\$0.105/초** | ¥0.735/초 |
| `wan3.0-video-prime` | 1080P | \$0.252/초 | \$0.2291/초 | **\$0.21/초** | ¥1.47/초 |

<Note>가격은 제공업체의 공식 요율을 따르며 이에 따라 변경될 수 있습니다. 위 표는 참고용일 뿐이며, 상단 내비게이션의 **모델 가격** 탭을 기준으로 합니다: [모델 가격](/en/models/index).</Note>

<Card title="전체 파라미터, 과금 규칙 및 모범 사례" icon="book-open" href="/ko/api-capabilities/wan3/overview">
  Wan3.0 개요
</Card>


## OpenAPI

````yaml api-reference/wan3-video-openapi-en.yaml POST /wan/api/v1/services/aigc/video-generation/video-synthesis
openapi: 3.1.0
info:
  title: Wan3.0 Video Generation API
  description: >
    Alibaba Tongyi Wanxiang Wan3.0 video generation — one model ID covers
    text-to-video, image-to-video, reference-to-video and video editing.
    DashScope async passthrough endpoint.


    - Create requests must carry the `X-DashScope-Async: enable` header

    - Async task endpoint: this call only submits the job and returns a
    `task_id`. Poll `GET /v1/tasks/{task_id}`, then download the mp4 from
    `result_url`

    - Terminal states are `completed` / `failed`, **not** DashScope's native
    `SUCCEEDED`

    - `result_url` is a signed Alibaba OSS link — **do not send the
    Authorization header** when downloading. Valid for 24 hours

    - **Do not use `/v1/videos`** to submit Wan video jobs (media fields are
    dropped and billing is inaccurate)


    **Billing**: per second. Billed seconds = input reference video duration +
    output video duration; the unit price follows the output resolution.
    Reference images / audio / files are free. Input + output is capped at 30
    seconds. Failed tasks are fully refunded.


    **Authentication**: add `Authorization: Bearer YOUR_API_KEY` to the request
    headers


    **Get an API Key**: create one in the APIYI console at `api.apiyi.com/token`
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
security:
  - bearerAuth: []
paths:
  /wan/api/v1/services/aigc/video-generation/video-synthesis:
    post:
      tags:
        - Video Generation
      summary: 'Video generation: create a Wan3.0 video task'
      description: >
        Submits an asynchronous Wan3.0 video job and returns a `task_id` with
        `task_status: "PENDING"`.


        - Required: `model`, `input.prompt`, and the `X-DashScope-Async: enable`
        header

        - The mode is decided by `input.media[]`: omit it for text-to-video;
        `first_frame` for image-to-video; `reference_image` / `reference_video`
        for reference-to-video

        - `first_frame` / `last_frame` cannot be mixed with `reference_*` /
        `file` / `link`

        - **The response contains no video file** — poll `GET
        /v1/tasks/{task_id}` until `status: "completed"`, then download from
        `result_url`

        - Typical latency for a 5-second clip: ~100 sec at 480P, ~120 sec at
        720P, ~170 sec at 1080P
      operationId: createWan30Video
      parameters:
        - name: X-DashScope-Async
          in: header
          required: true
          description: >-
            Async switch. Must be set to enable, otherwise the upstream returns:
            current user api does not support synchronous calls
          schema:
            type: string
            enum:
              - enable
            default: enable
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Wan30VideoRequest'
            example:
              model: wan3.0-video
              input:
                prompt: >-
                  A lighthouse by the sea at dusk, slow dolly-in, waves on the
                  rocks, seagulls, cinematic lighting
              parameters:
                resolution: 720P
                ratio: '16:9'
                duration: 5
                prompt_extend: true
      responses:
        '200':
          description: Task created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Wan30VideoResponse'
              example:
                output:
                  task_id: 9db29626-79fc-40d1-b9c2-c6b0caf8ac15
                  task_status: PENDING
                request_id: e616d8c9-1147-9ecd-b2b5-abbbe89a4642
        '400':
          description: Invalid request parameters
        '401':
          description: 'Authentication failed: invalid API key'
        '403':
          description: >-
            Forbidden: the key group does not include Wan&HappyHorse, or the key
            is on per-call billing
      security:
        - bearerAuth: []
components:
  schemas:
    Wan30VideoRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          enum:
            - wan3.0-video
            - wan3.0-video-prime
          default: wan3.0-video
          description: >-
            Model ID. wan3.0-video is the standard variant; wan3.0-video-prime
            is the faster Prime variant at a higher unit price
        input:
          $ref: '#/components/schemas/Wan30Input'
        parameters:
          $ref: '#/components/schemas/Wan30Parameters'
    Wan30VideoResponse:
      type: object
      properties:
        output:
          type: object
          properties:
            task_id:
              type: string
              description: Task ID, used for polling GET /v1/tasks/{task_id}
            task_status:
              type: string
              description: Always PENDING at submit time
        request_id:
          type: string
          description: Upstream request ID
    Wan30Input:
      type: object
      required:
        - prompt
      properties:
        prompt:
          type: string
          description: >-
            Natural-language description. With multiple assets, refer to them as
            image 1 / video 1 in the prompt
          example: A lighthouse by the sea at dusk, slow dolly-in, waves on the rocks
        negative_prompt:
          type: string
          description: Negative prompt
        media:
          type: array
          description: >-
            Media asset array. Omit for text-to-video. first_frame / last_frame
            cannot be mixed with reference_* / file / link
          items:
            $ref: '#/components/schemas/Wan30Media'
    Wan30Parameters:
      type: object
      properties:
        resolution:
          type: string
          enum:
            - 480P
            - 720P
            - 1080P
          default: 1080P
          description: >-
            Output resolution (uppercase). Determines the unit price — set it
            explicitly
        ratio:
          type: string
          enum:
            - '16:9'
            - '9:16'
            - '1:1'
            - '4:3'
            - '3:4'
            - adaptive
          description: Aspect ratio. Ignored when a first frame is supplied
        duration:
          type: integer
          description: >-
            Output length in whole seconds. Defaults to 5. Input reference video
            duration + output duration must not exceed 30 seconds
          example: 5
        prompt_extend:
          type: boolean
          default: true
          description: Prompt rewriting. Keep it true
        audio:
          type: boolean
          default: true
          description: Whether to output an audio track. Enabled by default
        watermark:
          type: boolean
          default: false
          description: AI generated watermark in the lower-right corner
        seed:
          type: integer
          minimum: 0
          maximum: 2147483647
          description: Random seed. Fixing it improves reproducibility
    Wan30Media:
      type: object
      required:
        - type
        - url
      properties:
        type:
          type: string
          enum:
            - first_frame
            - last_frame
            - reference_image
            - reference_video
            - reference_audio
            - file
            - link
          description: >-
            Asset type. reference_video duration counts toward billed seconds;
            all other assets are free
        url:
          type: string
          format: uri
          description: >-
            A publicly reachable https link that must stay available until the
            task completes
          example: https://example.com/first-frame.jpg
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 'APIYI API key, format: Bearer sk-your-api-key'

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.