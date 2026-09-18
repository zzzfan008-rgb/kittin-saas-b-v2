> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# HappyHorse 텍스트-투-비디오 API 레퍼런스

> HappyHorse-1.1-t2v 텍스트-투-비디오 API 레퍼런스 및 온라인 디버깅: 순수한 텍스트 prompt로 동영상을 생성하는 DashScope 비동기 패스스루 엔드포인트입니다.

<Info>
  오른쪽 플레이그라운드에서 바로 디버깅할 수 있습니다: **Authorization**에 `Bearer sk-your-api-key`를 입력하고, `model` / `input` / `parameters`를 설정한 다음 요청을 전송하십시오. 성공적으로 제출되면 `task_id`가 반환됩니다. 폴링과 다운로드는 아래를 참조하십시오.
</Info>

<Tip>
  이 페이지는 `happyhorse-1.1-t2v`(텍스트-투-비디오)의 생성 엔드포인트를 다루며, 텍스트 prompt만 필요합니다. 전체 비동기 흐름, 상태 표, Python 클라이언트는 [HappyHorse 개요](/ko/api-capabilities/happyhorse/overview)를 참조하십시오.
</Tip>

<Warning>
  * 생성 요청은 요청 헤더 `X-DashScope-Async: enable`와 함께 `/wan/api/v1/services/aigc/video-generation/video-synthesis`로 전송해야 합니다. **`/v1/videos`를 사용하지 마십시오.**
  * `duration`는 **정수**여야 합니다(`5`, `"5"` 아님). `resolution`는 **대문자** `720P`로 작성하십시오.
</Warning>

## 코드 예시

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis" \
    -H "X-DashScope-Async: enable" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "happyhorse-1.1-t2v",
      "input": {
        "prompt": "A cat running across a meadow, bright sunshine, camera following, cinematic lighting"
      },
      "parameters": {
        "resolution": "720P",
        "duration": 5,
        "prompt_extend": true,
        "watermark": true
      }
    }'
  ```

  ```python Python (requests) theme={null}
  import requests

  url = "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis"
  headers = {
      "Authorization": "Bearer sk-your-api-key",
      "Content-Type": "application/json",
      "X-DashScope-Async": "enable",   # Required for creating a task
  }
  body = {
      "model": "happyhorse-1.1-t2v",
      "input": {"prompt": "A cat running across a meadow, bright sunshine, camera following"},
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True, "watermark": True},
  }

  resp = requests.post(url, json=body, headers=headers, timeout=30)
  print("task_id:", resp.json()["output"]["task_id"])
  ```

  ```python Python (zero dependencies) theme={null}
  import json, urllib.request

  BASE, KEY = "https://api.apiyi.com", "sk-your-api-key"
  body = {
      "model": "happyhorse-1.1-t2v",
      "input": {"prompt": "A cat running across a meadow, bright sunshine"},
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True},
  }
  req = urllib.request.Request(
      BASE + "/wan/api/v1/services/aigc/video-generation/video-synthesis",
      data=json.dumps(body).encode(),
      headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json",
               "X-DashScope-Async": "enable"},
      method="POST",
  )
  print(json.loads(urllib.request.urlopen(req).read())["output"]["task_id"])
  ```
</CodeGroup>

## 매개변수 빠른 참조

| 매개변수                       | 유형     | 필수 | 기본값     | 비고                                      |
| -------------------------- | ------ | -- | ------- | --------------------------------------- |
| `model`                    | string | ✓  | —       | `happyhorse-1.1-t2v`로 고정                |
| `input.prompt`             | string | ✓  | —       | 텍스트 prompt; 장면, 카메라 움직임, 조명, 스타일을 설명합니다 |
| `parameters.resolution`    | string |    | `720P`  | `720P` / `1080P` (대문자)                  |
| `parameters.duration`      | int    |    | `5`     | 2\~15초 정수                               |
| `parameters.prompt_extend` | bool   |    | `true`  | 스마트 재작성, 켜기를 권장합니다                      |
| `parameters.watermark`     | bool   |    | `false` | 오른쪽 아래 모서리의 “AI 생성됨” 워터마크               |
| `parameters.seed`          | int    |    | random  | 0–2147483647, 재현성을 위해 고정                |

## 응답 형식

성공적으로 생성되면 `task_id`를 반환합니다 (**동영상 자체는 아님**):

```json theme={null}
{
  "output": { "task_id": "...", "task_status": "PENDING" },
  "request_id": "..."
}
```

<Warning>
  제출 후에는 `status: "completed"`가 될 때까지 **`GET /v1/tasks/{task_id}`를 폴링**한 다음, 응답의 `result_url`에서 mp4를 다운로드합니다. 다운로드할 때는 **`Authorization` 헤더를 포함하지 마십시오**(서명된 OSS 직접 링크입니다). 또한 `result_url`는 기본적으로 24시간 후 만료됩니다. 전체 폴링 루프는 [HappyHorse Overview · Async Call Flow](/ko/api-capabilities/happyhorse/overview#async-call-flow)에서 확인할 수 있습니다.
</Warning>


## OpenAPI

````yaml api-reference/happyhorse-text-to-video-openapi-en.yaml POST /wan/api/v1/services/aigc/video-generation/video-synthesis
openapi: 3.1.0
info:
  title: HappyHorse Text-to-Video API
  description: >
    Alibaba Cloud HappyHorse-1.0 Text-to-Video (`happyhorse-1.1-t2v`) — generate
    video from a pure text prompt, DashScope async passthrough endpoint.


    - The create request must include the request header `X-DashScope-Async:
    enable`

    - Async task-style endpoint: returns a `task_id`, which must be polled via
    `GET /v1/tasks/{task_id}`, then downloaded from `result_url` (without the
    Authorization header, expires in 24 hours)

    - **Do not use `/v1/videos`**

    - Shares the same endpoint and schema as the Wan series; interchangeable by
    just changing the model name


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
      summary: 'Text-to-Video: create a video generation task from a text prompt'
      description: >
        Submit a `happyhorse-1.1-t2v` Text-to-Video task (async), returning a
        `task_id`.


        - Required: `model`, `input.prompt`, request header `X-DashScope-Async:
        enable`

        - **The response does not contain the video file**; poll `GET
        /v1/tasks/{task_id}` until `completed`, then download from `result_url`

        - 720P / 5 seconds typically takes 105–115 seconds
      operationId: createHappyHorseTextToVideo
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
              $ref: '#/components/schemas/HappyHorseTextToVideoRequest'
            example:
              model: happyhorse-1.1-t2v
              input:
                prompt: >-
                  A cat running across a meadow, bright sunshine, camera
                  following, cinematic lighting
              parameters:
                resolution: 720P
                duration: 5
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
          description: >-
            Invalid parameter (wrong duration type, invalid resolution value,
            missing prompt, etc.)
        '401':
          description: Unauthorized - invalid API Key
        '403':
          description: Blocked by content moderation or group has no permission
        '429':
          description: Rate limit exceeded or insufficient balance
        '500':
          description: Upstream gateway error, recommended to retry 1-2 times
      security:
        - bearerAuth: []
components:
  schemas:
    HappyHorseTextToVideoRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: Model ID, fixed to happyhorse-1.1-t2v for Text-to-Video
          enum:
            - happyhorse-1.1-t2v
          default: happyhorse-1.1-t2v
        input:
          type: object
          required:
            - prompt
          properties:
            prompt:
              type: string
              description: >-
                Text prompt; describe the scene, camera movement, lighting, and
                style
              example: A cat running across a meadow, bright sunshine, camera following
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
              example: hh-12ab34cd-...
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
        duration:
          type: integer
          description: Video duration (seconds), integer, value 2-15
          minimum: 2
          maximum: 15
          default: 5
        prompt_extend:
          type: boolean
          description: Whether to enable smart prompt rewriting, strongly recommended true
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