> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan2.7 동영상 편집 API 레퍼런스

> Wan2.7-videoedit 동영상 편집 API 레퍼런스 및 실시간 플레이그라운드: 입력 동영상 + 참조 이미지 + 자연어 지시로 의상 교체와 배경 교체 같은 로컬/글로벌 편집을 수행합니다.

<Info>
  오른쪽의 Playground에서는 직접 디버깅할 수 있습니다: `Bearer sk-your-api-key`을 **Authorization**에 넣고, `model` / `input.media` / `parameters`를 채운 다음 요청을 전송하십시오. 성공적으로 제출되면 `task_id`가 반환됩니다. 폴링과 다운로드는 아래를 참조하십시오.
</Info>

<Tip>
  이 페이지는 `wan2.7-videoedit`(동영상 편집)의 생성 엔드포인트입니다. 동영상 + 1\~5개의 참조 이미지 + 자연어 편집 지시문을 제공하여 의상이나 배경을 바꾸는 등 동영상 요소를 편집할 수 있습니다. 모델 이름에는 **하이픈이 없습니다**(`videoedit`). 전체 비동기 흐름은 [Wan 개요](/ko/api-capabilities/wan/overview)를 참조하십시오.
</Tip>

<Warning>
  * `input.media`에는 `video`(편집 중인 동영상)와 최소 하나의 `reference_image`(참조 자산, ≤5)가 모두 포함되어야 합니다.
  * 모델 이름은 `wan2.7-videoedit`(**하이픈 없음**)이며, 하이픈이 있는 HappyHorse의 `happyhorse-1.0-video-edit`와 다르므로 혼동하지 마십시오.
  * 생성 요청은 `/wan/api/v1/...`으로 `X-DashScope-Async: enable`를 사용해 전송해야 하며, `/v1/videos`는 사용하지 마십시오.
</Warning>

## 코드 예시

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis" \
    -H "X-DashScope-Async: enable" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "wan2.7-videoedit",
      "input": {
        "prompt": "Replace the girl's outfit in the video with the outfit in the image",
        "media": [
          {"type": "video",           "url": "https://your-cdn.com/source.mp4"},
          {"type": "reference_image", "url": "https://your-cdn.com/new-clothes.png"}
        ]
      },
      "parameters": {"resolution": "720P", "prompt_extend": true, "watermark": true}
    }'
  ```

  ```python Python (requests) theme={null}
  import requests

  url = "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis"
  headers = {
      "Authorization": "Bearer sk-your-api-key",
      "Content-Type": "application/json",
      "X-DashScope-Async": "enable",
  }
  body = {
      "model": "wan2.7-videoedit",
      "input": {
          "prompt": "Replace the girl's outfit in the video with the outfit in the image",
          "media": [
              {"type": "video",           "url": "https://your-cdn.com/source.mp4"},
              {"type": "reference_image", "url": "https://your-cdn.com/new-clothes.png"},
          ],
      },
      "parameters": {"resolution": "720P", "prompt_extend": True, "watermark": True},
  }
  resp = requests.post(url, json=body, headers=headers, timeout=30)
  print("task_id:", resp.json()["output"]["task_id"])
  ```

  ```python Python (multiple reference images) theme={null}
  import requests

  # Up to 5 reference_image for finer local/global edits
  body = {
      "model": "wan2.7-videoedit",
      "input": {
          "prompt": "Replace the background in the video with the seaside in image 1, and change the character's outfit to image 2",
          "media": [
              {"type": "video",           "url": "https://your-cdn.com/source.mp4"},
              {"type": "reference_image", "url": "https://your-cdn.com/beach.png"},
              {"type": "reference_image", "url": "https://your-cdn.com/outfit.png"},
          ],
      },
      "parameters": {"resolution": "720P", "prompt_extend": True},
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

## 매개변수 및 미디어 빠른 참고

| 매개변수                       | 유형     | 필수 | 기본값     | 비고                    |
| -------------------------- | ------ | -- | ------- | --------------------- |
| `model`                    | string | ✓  | —       | 고정 `wan2.7-videoedit` |
| `input.prompt`             | string | ✓  | —       | 자연어 편집 지시문            |
| `input.media`              | array  | ✓  | —       | 아래 미디어 표를 참조하십시오      |
| `parameters.resolution`    | string |    | `720P`  | `720P` / `1080P`      |
| `parameters.prompt_extend` | bool   |    | `true`  | 스마트 재작성               |
| `parameters.watermark`     | bool   |    | `false` | “AI 생성” 워터마크          |

### `media[]` 값

| `type`            | 필수 | 수량  | 비고                  |
| ----------------- | -- | --- | ------------------- |
| `video`           | ✓  | 1   | 편집 중인 원본 동영상        |
| `reference_image` | ✓  | 1-5 | 참조 자산(새 의상, 새 배경 등) |

<Info>
  비디오 편집 출력 길이는 입력 동영상을 따르며, `duration` 매개변수가 아니라서 이 기능은 일반적으로 `duration`를 전달하지 않습니다.
</Info>

## 응답 형식

```json theme={null}
{
  "output": { "task_id": "3b216861-6a5f-441d-a438-602ab2c0d103", "task_status": "PENDING" },
  "request_id": "..."
}
```

## 상태 확인 및 다운로드

`task_id`를 받으면 mp4의 상태를 폴링하고 다운로드하기 위해 다음 세 단계를 따르십시오.

* **폴링** `GET /v1/tasks/{task_id}`을 `Authorization`로 조회합니다(`X-DashScope-Async` 헤더는 쿼리에 **필요하지 않습니다**). 5\~10초마다(3초 미만은 아님) `status`가 `completed`가 될 때까지 반복합니다.
* **상태 값**: `submitted`(대기 중) / `in_progress`(생성 중; `progress`가 30%에 머무는 경우가 많아도 정상입니다) / `completed`(성공) / `failed`(`error`를 확인하십시오).
* **다운로드**: 응답에서 `result_url`를 직접 GET하십시오. `Authorization` 헤더는 **사용하지 마십시오**(이는 OSS 서명된 직접 링크이며, Auth를 보내면 403이 반환됩니다). `result_url`는 기본적으로 **24시간** 후 만료되므로, 즉시 저장하십시오.

<CodeGroup>
  ```bash 상태 확인 theme={null}
  curl "https://api.apiyi.com/v1/tasks/3b216861-6a5f-441d-a438-602ab2c0d103" \
    -H "Authorization: Bearer sk-your-api-key"
  ```

  ```json 완료 응답 theme={null}
  {
    "status": "completed",
    "progress": 100,
    "result_url": "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=...",
    "task_id": "3b216861-6a5f-441d-a438-602ab2c0d103"
  }
  ```

  ```bash 동영상 다운로드 theme={null}
  # result_url is an OSS signed direct link — do NOT send the Authorization header (it returns 403)
  curl -L -o out.mp4 "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=..."
  ```

  ```bash 단일 명령: 확인 + 다운로드 theme={null}
  TASK_ID="3b216861-6a5f-441d-a438-602ab2c0d103"
  URL=$(curl -s "https://api.apiyi.com/v1/tasks/$TASK_ID" \
    -H "Authorization: Bearer sk-your-api-key" | jq -r '.result_url')
  curl -L -o out.mp4 "$URL"   # no Authorization
  ```
</CodeGroup>

<Warning>
  위 내용은 이미 task\_id가 있는 경우를 위한 빠른 확인/다운로드 경로입니다. timeout fallback이 포함된 전체 polling loop와 Python client는 [Wan 개요 · 비동기 호출 흐름](/ko/api-capabilities/wan/overview#async-call-flow)을 참조하십시오.
</Warning>


## OpenAPI

````yaml api-reference/wan-video-edit-openapi-en.yaml POST /wan/api/v1/services/aigc/video-generation/video-synthesis
openapi: 3.1.0
info:
  title: Wan2.7 Video Edit API
  description: >
    Alibaba Cloud Tongyi Wanxiang Wan2.7 video edit (`wan2.7-videoedit`, model
    name has no hyphen) — input video + reference images + natural-language
    instruction for local/global edits like outfit swap and background swap.
    DashScope async passthrough endpoint.


    - Creation requests must include the header `X-DashScope-Async: enable`

    - `input.media` must contain 1 `video` + 1-5 `reference_image`

    - The output duration follows the input video; usually `duration` is not
    passed

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
        Video edit: create an edit task from a video + reference images +
        instruction
      description: >
        Submit a `wan2.7-videoedit` video edit task (async); returns a
        `task_id`.


        - Required: `model`, `input.prompt` (edit instruction), `input.media` (1
        video + 1-5 reference_image), header `X-DashScope-Async: enable`

        - **The response does not contain the video file**; poll `GET
        /v1/tasks/{task_id}` until `completed`, then download from `result_url`

        - Time depends on the input video length; measured at about 100 seconds
      operationId: createWan27VideoEdit
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
              $ref: '#/components/schemas/WanVideoEditRequest'
            example:
              model: wan2.7-videoedit
              input:
                prompt: >-
                  Replace the girl's outfit in the video with the outfit in the
                  image
                media:
                  - type: video
                    url: https://your-cdn.com/source.mp4
                  - type: reference_image
                    url: https://your-cdn.com/new-clothes.png
              parameters:
                resolution: 720P
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
          description: Invalid parameter or more than 5 reference images
        '401':
          description: Unauthorized - invalid API Key
        '403':
          description: Blocked by content moderation, or no permission for the group
        '429':
          description: Rate limit exceeded or insufficient balance
        '500':
          description: Missing video / reference_image or upstream error
      security:
        - bearerAuth: []
components:
  schemas:
    WanVideoEditRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: Model ID, fixed wan2.7-videoedit (no hyphen)
          enum:
            - wan2.7-videoedit
          default: wan2.7-videoedit
        input:
          type: object
          required:
            - prompt
            - media
          properties:
            prompt:
              type: string
              description: Natural-language edit instruction
              example: >-
                Replace the girl's outfit in the video with the outfit in the
                image
            media:
              type: array
              description: Media asset array; must contain 1 video + 1-5 reference_image
              items:
                type: object
                required:
                  - type
                  - url
                properties:
                  type:
                    type: string
                    description: >-
                      Media type: video (the source video being edited) /
                      reference_image (reference asset)
                    enum:
                      - video
                      - reference_image
                  url:
                    type: string
                    description: Public https link fetchable directly with GET
                    example: https://your-cdn.com/source.mp4
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
              example: 3b216861-6a5f-441d-a438-602ab2c0d103
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
          description: Resolution tier (uppercase)
          enum:
            - 720P
            - 1080P
          default: 720P
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