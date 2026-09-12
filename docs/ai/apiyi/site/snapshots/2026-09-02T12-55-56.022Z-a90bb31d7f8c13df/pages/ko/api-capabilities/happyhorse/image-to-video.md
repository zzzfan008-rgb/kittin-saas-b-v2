> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# HappyHorse 이미지-to-동영상 API 레퍼런스

> HappyHorse-1.1-i2v 이미지-to-동영상 API 레퍼런스 및 온라인 디버깅: 첫 프레임 이미지에서 동영상을 생성합니다(오디오 구동 지원 없음). DashScope 비동기 패스스루 엔드포인트입니다.

<Info>
  오른쪽의 Playground에서 직접 디버깅할 수 있습니다: **Authorization**에 `Bearer sk-your-api-key`를 입력하고, `model` / `input.media` / `parameters`를 설정한 뒤 요청을 보내십시오. 성공적으로 제출하면 `task_id`가 반환됩니다. 폴링과 다운로드는 아래를 참조하십시오.
</Info>

<Tip>
  이 페이지는 `happyhorse-1.1-i2v` (이미지에서 동영상으로)의 create 엔드포인트를 다룹니다: 첫 프레임 이미지 + prompt를 제공하여 장면에 생동감을 불어넣으십시오. 전체 비동기 흐름은 [HappyHorse 개요](/ko/api-capabilities/happyhorse/overview)를 참조하십시오.
</Tip>

<Warning>
  * **HappyHorse의 i2v는 `driving_audio`를 지원하지 않습니다** (오디오 기반): `first_frame`만 허용합니다. 립싱크 / 랩에는 [Wan2.7-i2v](/ko/api-capabilities/wan/image-to-video)를 사용하십시오.
  * `input.media`가 필요합니다. 그렇지 않으면 upstream에서 `Image-to-video model ... must provide an image`를 반환합니다. 미디어 `url`는 GET으로 직접 가져올 수 있는 공개 https 링크여야 합니다.
  * create 요청은 `/wan/api/v1/...`으로 `X-DashScope-Async: enable`와 함께 전송됩니다. `/v1/videos`는 사용하지 마십시오.
</Warning>

## 코드 예제

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis" \
    -H "X-DashScope-Async: enable" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "happyhorse-1.1-i2v",
      "input": {
        "prompt": "A cat running across a meadow, bright sunshine, camera following",
        "media": [
          {"type": "first_frame", "url": "https://your-cdn.com/cat.png"}
        ]
      },
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": true, "watermark": true}
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
      "model": "happyhorse-1.1-i2v",
      "input": {
          "prompt": "A cat running across a meadow, bright sunshine, camera following",
          "media": [{"type": "first_frame", "url": "https://your-cdn.com/cat.png"}],
      },
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True, "watermark": True},
  }
  resp = requests.post(url, json=body, headers=headers, timeout=30)
  print("task_id:", resp.json()["output"]["task_id"])
  ```
</CodeGroup>

## 매개변수 및 미디어 빠른 참조

| 매개변수                       | 유형  | 필수 | 기본값     | 비고                          |
| -------------------------- | --- | -- | ------- | --------------------------- |
| `model`                    | 문자열 | ✓  | —       | `happyhorse-1.1-i2v`로 고정됩니다 |
| `input.prompt`             | 문자열 | ✓  | —       | 텍스트 prompt                  |
| `input.media`              | 배열  | ✓  | —       | 아래 미디어 표를 참조합니다             |
| `parameters.resolution`    | 문자열 |    | `720P`  | `720P` / `1080P`            |
| `parameters.duration`      | 정수  |    | `5`     | 2–15초 정수                    |
| `parameters.prompt_extend` | 불리언 |    | `true`  | 스마트 재작성, 켜는 것을 권장합니다        |
| `parameters.watermark`     | 불리언 |    | `false` | “AI Generated” 워터마크         |

### `media[]` 값

| `type`        | 필수 | 개수 | 비고                                                          |
| ------------- | -- | -- | ----------------------------------------------------------- |
| `first_frame` | ✓  | 1  | 첫 프레임 이미지입니다. 동영상은 이 이미지에서 시작합니다(HappyHorse i2v는 이것만 지원합니다) |

## 응답 형식

```json theme={null}
{
  "output": { "task_id": "...", "task_status": "PENDING" },
  "request_id": "..."
}
```

<Warning>
  제출 후 **`GET /v1/tasks/{task_id}`를 폴링**하여 `completed`가 되면, `result_url`에서 mp4를 다운로드합니다 (**`Authorization` 헤더 없이**, 24시간 후 만료됩니다). 전체 폴링 루프는 [HappyHorse 개요 · 비동기 호출 흐름](/ko/api-capabilities/happyhorse/overview#async-call-flow)에서 확인하십시오.
</Warning>


## OpenAPI

````yaml api-reference/happyhorse-image-to-video-openapi-en.yaml POST /wan/api/v1/services/aigc/video-generation/video-synthesis
openapi: 3.1.0
info:
  title: HappyHorse Image-to-Video API
  description: >
    Alibaba Cloud HappyHorse-1.0 Image-to-Video (`happyhorse-1.1-i2v`) —
    generate video from a first-frame image. DashScope async passthrough
    endpoint.


    - The create request must include the request header `X-DashScope-Async:
    enable`

    - **HappyHorse's i2v does not support driving_audio (audio-driven)**; it
    only accepts first_frame. For lip-sync, use wan2.7-i2v

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
      summary: 'Image-to-Video: create a video generation task from a first-frame image'
      description: >
        Submit a `happyhorse-1.1-i2v` Image-to-Video task (async), returning a
        `task_id`.


        - Required: `model`, `input.prompt`, `input.media` (1 first_frame),
        request header `X-DashScope-Async: enable`

        - **Does not support** driving_audio

        - **The response does not contain the video file**; poll `GET
        /v1/tasks/{task_id}` until `completed`, then download from `result_url`
      operationId: createHappyHorseImageToVideo
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
              $ref: '#/components/schemas/HappyHorseImageToVideoRequest'
            example:
              model: happyhorse-1.1-i2v
              input:
                prompt: >-
                  A cat running across a meadow, bright sunshine, camera
                  following
                media:
                  - type: first_frame
                    url: https://your-cdn.com/cat.png
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
            etc.)
        '401':
          description: Unauthorized - invalid API Key
        '403':
          description: Blocked by content moderation or group has no permission
        '429':
          description: Rate limit exceeded or insufficient balance
        '500':
          description: >-
            Missing media or upstream error, recommended to check the body and
            retry
      security:
        - bearerAuth: []
components:
  schemas:
    HappyHorseImageToVideoRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: Model ID, fixed to happyhorse-1.1-i2v for Image-to-Video
          enum:
            - happyhorse-1.1-i2v
          default: happyhorse-1.1-i2v
        input:
          type: object
          required:
            - prompt
            - media
          properties:
            prompt:
              type: string
              description: Text prompt
              example: A cat running across a meadow, bright sunshine, camera following
            media:
              type: array
              description: >-
                Media asset array; must contain 1 first_frame (HappyHorse i2v
                does not support driving_audio)
              items:
                type: object
                required:
                  - type
                  - url
                properties:
                  type:
                    type: string
                    description: 'Media type: first_frame (first-frame image, <=1)'
                    enum:
                      - first_frame
                  url:
                    type: string
                    description: >-
                      A public https image link fetchable directly via GET
                      (JPEG/PNG/WEBP)
                    example: https://your-cdn.com/cat.png
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