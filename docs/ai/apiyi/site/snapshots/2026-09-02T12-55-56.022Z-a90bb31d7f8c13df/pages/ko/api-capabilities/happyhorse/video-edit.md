> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# HappyHorse 비디오 편집 API 레퍼런스

> HappyHorse-1.0-video-edit 비디오 편집 API 레퍼런스 및 온라인 디버깅: 입력 비디오 + 최대 5개의 참조 이미지 + 로컬/전역 편집을 위한 자연어 지시사항.

<Info>
  오른쪽의 Playground에서 직접 디버그할 수 있습니다. **Authorization**에 `Bearer sk-your-api-key`를 입력하고, `model` / `input.media` / `parameters`를 설정한 뒤 요청을 전송하십시오. 성공적으로 제출하면 `task_id`가 반환됩니다. 폴링 및 다운로드는 아래를 참고하십시오.
</Info>

<Tip>
  이 페이지는 `happyhorse-1.0-video-edit`(동영상 편집)의 생성 엔드포인트를 다룹니다. 동영상 1개 + 최대 5장의 참조 이미지 + 자연어 지시를 제공하여 동영상 요소를 국소적으로 또는 전역적으로 편집합니다. 모델 이름에는 하이픈이 있습니다(`video-edit`). 전체 비동기 흐름은 [HappyHorse 개요](/ko/api-capabilities/happyhorse/overview)를 참고하십시오.
</Tip>

<Warning>
  * `input.media`에는 `video`(편집 중인 동영상)과 최소 1개의 `reference_image`(5개 이하)이 모두 포함되어야 합니다.
  * 모델 이름은 `happyhorse-1.0-video-edit`(**하이픈이 있습니다**)이며, Wan의 `wan2.7-videoedit`(하이픈 없음)과 다르므로 헷갈리지 마십시오.
  * 생성 요청은 `/wan/api/v1/...`로 `X-DashScope-Async: enable`와 함께 전송되며, `/v1/videos`는 사용하지 마십시오.
</Warning>

## 코드 예제

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis" \
    -H "X-DashScope-Async: enable" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "happyhorse-1.0-video-edit",
      "input": {
        "prompt": "Replace the clothes of the girl in the video with the clothes in the image",
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
      "model": "happyhorse-1.0-video-edit",
      "input": {
          "prompt": "Replace the clothes of the girl in the video with the clothes in the image",
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
</CodeGroup>

## 매개변수 및 미디어 빠른 참조

| 매개변수                       | 유형     | 필수 | 기본값     | 비고                               |
| -------------------------- | ------ | -- | ------- | -------------------------------- |
| `model`                    | string | ✓  | —       | `happyhorse-1.0-video-edit`로 고정됨 |
| `input.prompt`             | string | ✓  | —       | 자연어 편집 지시문                       |
| `input.media`              | array  | ✓  | —       | 아래의 미디어 표를 참조하십시오                |
| `parameters.resolution`    | string |    | `720P`  | `720P` / `1080P`                 |
| `parameters.prompt_extend` | bool   |    | `true`  | 스마트 재작성                          |
| `parameters.watermark`     | bool   |    | `false` | “AI Generated” 워터마크              |

### `media[]` 값

| `type`            | 필수 | 개수  | 비고                  |
| ----------------- | -- | --- | ------------------- |
| `video`           | ✓  | 1   | 편집 대상인 원본 비디오       |
| `reference_image` | ✓  | 1–5 | 참고 자료(새 의상, 새 배경 등) |

<Info>
  비디오 편집의 출력 길이는 입력 비디오를 따르며 `duration`에 의해 결정되지 않으므로, 이 기능은 일반적으로 `duration`를 전달하지 않습니다.
</Info>

## 응답 형식

```json theme={null}
{
  "output": { "task_id": "...", "task_status": "PENDING" },
  "request_id": "..."
}
```

<Warning>
  제출 후, **`GET /v1/tasks/{task_id}`을 폴링**하여 `completed`가 될 때까지 기다린 다음, `result_url`에서 mp4를 다운로드하십시오(**`Authorization` 헤더 없이**, 24시간 후 만료됩니다). 전체 폴링 루프는 [HappyHorse 개요 · 비동기 호출 흐름](/ko/api-capabilities/happyhorse/overview#async-call-flow)에서 확인하십시오.
</Warning>


## OpenAPI

````yaml api-reference/happyhorse-video-edit-openapi-en.yaml POST /wan/api/v1/services/aigc/video-generation/video-synthesis
openapi: 3.1.0
info:
  title: HappyHorse Video Edit API
  description: >
    Alibaba Cloud HappyHorse-1.0 Video Edit (`happyhorse-1.0-video-edit`, the
    model name has a hyphen) — input video + up to 5 reference images +
    natural-language instructions for local/global edits. DashScope async
    passthrough endpoint.


    - The create request must include the request header `X-DashScope-Async:
    enable`

    - `input.media` must contain 1 `video` + 1-5 `reference_image`

    - The output duration follows the input video; usually `duration` is not
    passed

    - Async task-style endpoint: returns a `task_id`, poll `GET
    /v1/tasks/{task_id}`, then download from `result_url` (without the
    Authorization header, expires in 24 hours)

    - **Do not use `/v1/videos`**


    **Authentication**: add `Authorization: Bearer YOUR_API_KEY` to the request
    header


    **Get an API Key**: visit the APIYI Console `api.apiyi.com/token` to create
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
        Video Edit: create an edit task from video + reference images +
        instruction
      description: >
        Submit a `happyhorse-1.0-video-edit` Video Edit task (async), returning
        a `task_id`.


        - Required: `model`, `input.prompt` (editing instruction), `input.media`
        (1 video + 1-5 reference_image), request header `X-DashScope-Async:
        enable`

        - **The response does not contain the video file**; poll `GET
        /v1/tasks/{task_id}` until `completed`, then download from `result_url`
      operationId: createHappyHorseVideoEdit
      parameters:
        - name: X-DashScope-Async
          in: header
          required: true
          description: Async processing switch, must be set to enable
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
              $ref: '#/components/schemas/HappyHorseVideoEditRequest'
            example:
              model: happyhorse-1.0-video-edit
              input:
                prompt: >-
                  Replace the clothes of the girl in the video with the clothes
                  in the image
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
          description: Task submitted, returns task_id and PENDING status
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HappyHorseVideoTask'
        '400':
          description: Invalid parameter or more than 5 reference images
        '401':
          description: Unauthorized - invalid API Key
        '403':
          description: Blocked by content moderation or group has no permission
        '429':
          description: Rate limit exceeded or insufficient balance
        '500':
          description: Missing video / reference_image or upstream error
      security:
        - bearerAuth: []
components:
  schemas:
    HappyHorseVideoEditRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: Model ID, fixed to happyhorse-1.0-video-edit (has a hyphen)
          enum:
            - happyhorse-1.0-video-edit
          default: happyhorse-1.0-video-edit
        input:
          type: object
          required:
            - prompt
            - media
          properties:
            prompt:
              type: string
              description: Natural-language editing instruction
              example: >-
                Replace the clothes of the girl in the video with the clothes in
                the image
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
                      reference_image (reference material)
                    enum:
                      - video
                      - reference_image
                  url:
                    type: string
                    description: A public https link fetchable directly via GET
                    example: https://your-cdn.com/source.mp4
        parameters:
          $ref: '#/components/schemas/HappyHorseParameters'
    HappyHorseVideoTask:
      type: object
      properties:
        output:
          type: object
          properties:
            task_id:
              type: string
              description: >-
                Task ID, used for polling GET /v1/tasks/{task_id}, valid for 24
                hours
              example: hh-...
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
    HappyHorseParameters:
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
          description: Whether to add the AI Generated watermark in the bottom-right corner
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
      description: The API Key obtained from the APIYI Console

````