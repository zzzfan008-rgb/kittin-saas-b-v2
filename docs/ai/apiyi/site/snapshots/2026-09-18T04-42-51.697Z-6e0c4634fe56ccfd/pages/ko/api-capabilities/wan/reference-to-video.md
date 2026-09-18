> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan2.7 Reference-to-Video API 참조

> Wan2.7-r2v reference-to-video API 참조 및 라이브 플레이그라운드: 참조 이미지/동영상의 주제 특징을 유지하며, 다중 주제 상호작용, 음성 참조, 분할 화면 스토리보드를 지원합니다.

<Info>
  오른쪽의 Playground에서는 직접 디버깅할 수 있습니다: `Bearer sk-your-api-key`를 **Authorization**에 넣고, `model` / `input.media` / `parameters`를 채운 다음 요청을 보내십시오. 성공적으로 제출하면 `task_id`가 반환됩니다. 폴링 및 다운로드는 아래를 참조하십시오.
</Info>

<Tip>
  이 페이지는 `wan2.7-r2v`(reference-to-video)의 생성 엔드포인트입니다. 참조 이미지/비디오를 제공하면 모델이 대상(사람/동물/사물)과 장면 특징을 유지하면서, 단일 캐릭터 연기 또는 다중 캐릭터 상호작용을 생성합니다. 더 많은 참조 이미지가 필요하면(최대 9개), [HappyHorse r2v](/ko/api-capabilities/happyhorse/reference-to-video)를 고려해 보십시오. 전체 비동기 흐름은 [Wan 개요](/ko/api-capabilities/wan/overview)를 참조하십시오.
</Tip>

<Warning>
  * **참조 자산 인용 규칙**: prompt에서 "image 1 / image 2"는 `reference_image`를, "video 1 / video 2"는 `reference_video`를 가리키는 데 사용하며, `media` 배열과 같은 순서로 작성하십시오(이미지와 비디오는 각각 별도로 계산합니다). 이미지/비디오가 하나뿐이면 "the reference image" / "the reference video"라고 간단히 쓰면 됩니다.
  * **개수 제한**: `reference_image` + `reference_video` 총합 ≤5; 최대 `first_frame` 1개입니다.
  * 생성 요청은 `/wan/api/v1/...`에 `X-DashScope-Async: enable`를 사용해 보내십시오; `/v1/videos`는 사용하지 마십시오.
</Warning>

## 코드 예시

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis" \
    -H "X-DashScope-Async: enable" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "wan2.7-r2v",
      "input": {
        "prompt": "A girl wearing this gown walks slowly through a garden bathed in sunset, the breeze gently lifting her skirt, cinematic lighting",
        "media": [
          {"type": "reference_image", "url": "https://your-cdn.com/dress.png"}
        ]
      },
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": true, "watermark": true}
    }'
  ```

  ```python Python (단일 이미지 참조) theme={null}
  import requests

  url = "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis"
  headers = {
      "Authorization": "Bearer sk-your-api-key",
      "Content-Type": "application/json",
      "X-DashScope-Async": "enable",
  }
  body = {
      "model": "wan2.7-r2v",
      "input": {
          "prompt": "The reference image: a girl walking slowly through a garden bathed in sunset, cinematic lighting",
          "media": [{"type": "reference_image", "url": "https://your-cdn.com/girl.png"}],
      },
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True},
  }
  resp = requests.post(url, json=body, headers=headers, timeout=30)
  print("task_id:", resp.json()["output"]["task_id"])
  ```

  ```python Python (다중 피사체 + 음성) theme={null}
  import requests

  # Multi-subject: image 1 = girl (with voice), video 1 = boy (with voice), image 2/3 = props/background
  body = {
      "model": "wan2.7-r2v",
      "input": {
          "prompt": "Video 1 holds image 2, walks past image 1, and says: the sunshine is lovely today.",
          "media": [
              {"type": "reference_image", "url": "https://your-cdn.com/girl.jpg",
               "reference_voice": "https://your-cdn.com/girl-voice.mp3"},
              {"type": "reference_video", "url": "https://your-cdn.com/boy.mp4",
               "reference_voice": "https://your-cdn.com/boy-voice.mp3"},
              {"type": "reference_image", "url": "https://your-cdn.com/object.png"},
          ],
      },
      "parameters": {"resolution": "720P", "ratio": "16:9", "duration": 10, "prompt_extend": False, "watermark": True},
  }
  resp = requests.post(
      "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis",
      json=body,
      headers={"Authorization": "Bearer sk-your-api-key", "Content-Type": "application/json",
               "X-DashScope-Async": "enable"},
      timeout=30,
  )
  print(resp.json()["output"]["task_id"])
  ```
</CodeGroup>

## 매개변수 및 미디어 빠른 참조

| 매개변수                       | 유형  | 필수 | 기본값     | 비고                                                          |
| -------------------------- | --- | -- | ------- | ----------------------------------------------------------- |
| `model`                    | 문자열 | ✓  | —       | `wan2.7-r2v`으로 고정                                           |
| `input.prompt`             | 문자열 | ✓  | —       | ≤5000자; 자산을 참조하려면 "image 1/video 1"을 사용합니다                  |
| `input.media`              | 배열  | ✓  | —       | 아래 미디어 표를 참조하십시오                                            |
| `parameters.resolution`    | 문자열 |    | `1080P` | `720P` / `1080P`                                            |
| `parameters.ratio`         | 문자열 |    | `16:9`  | `16:9` / `9:16` / `1:1` / `4:3` / `3:4` (첫 프레임이 전달되면 무시됩니다) |
| `parameters.duration`      | 정수  |    | `5`     | 참조 비디오가 있으면 2-10, 없으면 2-15                                  |
| `parameters.prompt_extend` | 불리언 |    | `true`  | 스마트 재작성                                                     |
| `parameters.watermark`     | 불리언 |    | `false` | “AI 생성” 워터마크                                                |

### `media[]` 값

| `type`            | 개수 / 제한       | 비고                                                                             |
| ----------------- | ------------- | ------------------------------------------------------------------------------ |
| `reference_image` | 비디오와 함께 최대 5개 | 참조 이미지입니다. 피사체(사람/동물/물체) 또는 장면을 제공합니다. 음성을 설정하려면 `reference_voice`를 첨부할 수 있습니다 |
| `reference_video` | 이미지와 함께 최대 5개 | 참조 비디오입니다. 피사체와 음성 참조를 제공합니다. 빈 장면 영상은 전달하지 마십시오                               |
| `first_frame`     | 최대 1개         | 선택 사항인 첫 프레임입니다. 시작 프레임을 함께 제어합니다                                              |
| `reference_voice` | 첨부된 필드        | `reference_image`/`reference_video`에 첨부하여 해당 피사체의 음성을 설정합니다(wav/mp3, 1-10초)    |

## 응답 형식

```json theme={null}
{
  "output": { "task_id": "acda59b4-3b10-4789-a5e5-edadae48adcb", "task_status": "PENDING" },
  "request_id": "..."
}
```

## 상태 확인 및 다운로드

`task_id`를 받으면, mp4의 상태를 조회하고 다운로드하기 위해 다음 세 단계를 따르십시오.

* **조회** `GET /v1/tasks/{task_id}` (`Authorization` 포함; 쿼리는 `X-DashScope-Async` 헤더가 **필요하지 않습니다**), 10초마다(3초 미만은 안 됨) `status`가 `completed`가 될 때까지 반복하십시오. Reference-to-video는 보통 1\~5분이 걸리므로, 대체 수단으로 20분의 클라이언트 타임아웃을 설정하십시오.
* **상태 값**: `submitted`(대기 중) / `in_progress`(생성 중; `progress`가 30%에서 멈춰 있는 것은 정상입니다) / `completed`(성공) / `failed`(`error` 확인).
* **다운로드**: 응답에서 `result_url`를 직접 GET 하며, **`Authorization` 헤더 없이** 수행하십시오(이는 OSS 서명된 직접 링크입니다. Auth를 보내면 403이 반환됩니다); `result_url`는 기본적으로 **24시간** 후 만료되므로, 즉시 저장하십시오.

<CodeGroup>
  ```bash Check status theme={null}
  curl "https://api.apiyi.com/v1/tasks/acda59b4-3b10-4789-a5e5-edadae48adcb" \
    -H "Authorization: Bearer sk-your-api-key"
  ```

  ```json Completed response theme={null}
  {
    "status": "completed",
    "progress": 100,
    "result_url": "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=...",
    "task_id": "acda59b4-3b10-4789-a5e5-edadae48adcb"
  }
  ```

  ```bash Download video theme={null}
  # result_url is an OSS signed direct link — do NOT send the Authorization header (it returns 403)
  curl -L -o out.mp4 "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=..."
  ```

  ```bash One command: check + download theme={null}
  TASK_ID="acda59b4-3b10-4789-a5e5-edadae48adcb"
  URL=$(curl -s "https://api.apiyi.com/v1/tasks/$TASK_ID" \
    -H "Authorization: Bearer sk-your-api-key" | jq -r '.result_url')
  curl -L -o out.mp4 "$URL"   # no Authorization
  ```
</CodeGroup>

<Warning>
  위 내용은 “이미 task\_id가 있는 경우”를 위한 빠른 조회/다운로드 경로입니다. 전체 폴링 루프(타임아웃 대체 수단 포함)와 Python 클라이언트는 [Wan 개요 · 비동기 호출 흐름](/ko/api-capabilities/wan/overview#async-call-flow)을 참조하십시오.
</Warning>


## OpenAPI

````yaml api-reference/wan-reference-to-video-openapi-en.yaml POST /wan/api/v1/services/aigc/video-generation/video-synthesis
openapi: 3.1.0
info:
  title: Wan2.7 Reference-to-Video API
  description: >
    Alibaba Cloud Tongyi Wanxiang Wan2.7 reference-to-video (`wan2.7-r2v`) —
    preserve subject features from reference images/videos, with multi-subject
    interaction, voice reference, and split-screen storyboards. DashScope async
    passthrough endpoint.


    - Creation requests must include the header `X-DashScope-Async: enable`

    - In the prompt, use "image 1 / video 1" to refer to reference assets, in
    the same order as the media array

    - `reference_image` + `reference_video` total <=5; `first_frame` <=1

    - Async task endpoint: returns a `task_id`; poll `GET /v1/tasks/{task_id}`,
    then download from `result_url` (no Authorization header, expires in 24
    hours)

    - **Do not use `/v1/videos`**


    **Authentication**: add `Authorization: Bearer YOUR_API_KEY` to the request
    header


    **Get an API Key**: visit the APIYI console `api.apiyi.com/token` to create
    a Token
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
  - url: https://vip.apiyi.com
    description: Backup endpoint
security:
  - bearerAuth: []
paths:
  /wan/api/v1/services/aigc/video-generation/video-synthesis:
    post:
      tags:
        - Video Generation
      summary: >-
        Reference-to-video: create a video task that preserves subject features
        from reference images/videos
      description: >
        Submit a `wan2.7-r2v` reference-to-video task (async); returns a
        `task_id`.


        - Required: `model`, `input.prompt`, `input.media` (at least 1
        reference_image / reference_video), header `X-DashScope-Async: enable`

        - Optional: `reference_voice` (voice reference), `parameters` (including
        ratio)

        - **The response does not contain the video file**; poll `GET
        /v1/tasks/{task_id}` until `completed`, then download from `result_url`

        - 720P / 5 seconds typically takes 120-140 seconds; multi-subject tasks
        may take 1-5 minutes
      operationId: createWan27ReferenceToVideo
      parameters:
        - name: X-DashScope-Async
          in: header
          required: true
          description: Async processing switch; must be set to enable
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
              $ref: '#/components/schemas/WanReferenceToVideoRequest'
            example:
              model: wan2.7-r2v
              input:
                prompt: >-
                  A girl wearing this gown walks slowly through a garden bathed
                  in sunset, the breeze gently lifting her skirt, cinematic
                  lighting
                media:
                  - type: reference_image
                    url: https://your-cdn.com/dress.png
              parameters:
                resolution: 720P
                ratio: '16:9'
                duration: 5
                prompt_extend: true
                watermark: true
      responses:
        '200':
          description: Task submitted; returns task_id and PENDING status
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WanVideoTask'
        '400':
          description: Invalid parameter or more than 5 reference assets
        '401':
          description: Unauthorized - invalid API Key
        '403':
          description: Blocked by content moderation, or no permission for the group
        '429':
          description: Rate limit exceeded or insufficient balance
        '500':
          description: Missing media or upstream error; check the body and retry
      security:
        - bearerAuth: []
components:
  schemas:
    WanReferenceToVideoRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: >-
            Model ID; for reference-to-video use wan2.7-r2v (legacy versions
            wan2.6-r2v / wan2.6-r2v-flash)
          enum:
            - wan2.7-r2v
            - wan2.6-r2v
            - wan2.6-r2v-flash
          default: wan2.7-r2v
        input:
          type: object
          required:
            - prompt
            - media
          properties:
            prompt:
              type: string
              description: >-
                Text prompt, <=5000 characters; use 'image 1/video 1' to refer
                to reference assets
              example: >-
                The reference image: a girl walking slowly through a garden
                bathed in sunset, cinematic lighting
            negative_prompt:
              type: string
              description: Negative prompt, <=500 characters
            media:
              type: array
              description: >-
                Media asset array; reference_image + reference_video total <=5,
                first_frame <=1
              items:
                type: object
                required:
                  - type
                  - url
                properties:
                  type:
                    type: string
                    description: >-
                      Media type: reference_image (reference image) /
                      reference_video (reference video) / first_frame (optional
                      first frame)
                    enum:
                      - reference_image
                      - reference_video
                      - first_frame
                  url:
                    type: string
                    description: Public https link fetchable directly with GET
                    example: https://your-cdn.com/dress.png
                  reference_voice:
                    type: string
                    description: >-
                      Optional: voice reference audio URL (wav/mp3, 1-10s) to
                      set this subject's voice
        parameters:
          $ref: '#/components/schemas/WanParameters'
    WanVideoTask:
      type: object
      properties:
        output:
          type: object
          properties:
            task_id:
              type: string
              description: >-
                Task ID, used to poll GET /v1/tasks/{task_id}, valid for 24
                hours
              example: acda59b4-3b10-4789-a5e5-edadae48adcb
            task_status:
              type: string
              enum:
                - PENDING
                - RUNNING
                - SUCCEEDED
                - FAILED
              example: PENDING
        request_id:
          type: string
          description: Unique request identifier
          example: ...
    WanParameters:
      type: object
      properties:
        resolution:
          type: string
          description: >-
            Resolution tier (uppercase); wan2.7-r2v supports 720P / 1080P,
            default 1080P
          enum:
            - 720P
            - 1080P
          default: 1080P
        ratio:
          type: string
          description: Aspect ratio; ignored automatically when a first_frame is supplied
          enum:
            - '16:9'
            - '9:16'
            - '1:1'
            - '4:3'
            - '3:4'
          default: '16:9'
        duration:
          type: integer
          description: >-
            Video duration (seconds), integer; range 2-10 with a reference
            video, 2-15 without
          minimum: 2
          maximum: 15
          default: 5
        prompt_extend:
          type: boolean
          description: Whether to enable smart prompt rewriting
          default: true
        watermark:
          type: boolean
          description: Whether to add an AI generated watermark in the bottom-right corner
          default: false
        seed:
          type: integer
          description: Random seed, 0-2147483647
          minimum: 0
          maximum: 2147483647
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: The API Key obtained from the APIYI console

````