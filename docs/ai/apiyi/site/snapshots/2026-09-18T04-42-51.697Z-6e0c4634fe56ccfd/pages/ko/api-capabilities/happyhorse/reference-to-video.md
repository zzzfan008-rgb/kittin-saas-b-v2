> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# HappyHorse 레퍼런스-투-비디오 API 레퍼런스

> HappyHorse-1.1-r2v 레퍼런스-투-비디오 API 레퍼런스 및 온라인 디버깅: 주제와 장면을 일관되게 유지하기 위해 최대 9장의 참조 이미지를 사용하며, DashScope 비동기 패스스루 엔드포인트입니다.

<Info>
  오른쪽의 플레이그라운드에서 직접 디버그할 수 있습니다: **Authorization**에 `Bearer sk-your-api-key`을 입력하고, `model` / `input.media` / `parameters`를 설정한 다음 요청을 전송합니다. 제출이 성공하면 `task_id`가 반환됩니다. 아래에서 폴링과 다운로드를 확인하십시오.
</Info>

<Tip>
  이 페이지는 `happyhorse-1.1-r2v`(참조 기반 동영상)의 create 엔드포인트를 다룹니다: 참조 이미지를 제공하면 모델이 그 안의 피사체와 장면 특징을 보존합니다. HappyHorse-r2v는 **최대 9개의 참조 이미지**를 지원하여 다중 참조 시나리오에서 더 강한 피사체 일관성을 제공합니다. 전체 비동기 흐름은 [HappyHorse 개요](/ko/api-capabilities/happyhorse/overview)를 참조하십시오.
</Tip>

<Warning>
  * `happyhorse-1.1-r2v`는 최대 **9**개의 `reference_image` 항목을 지원합니다(Wan2.7-r2v의 합산 ≤5보다 많습니다).
  * `input.media`이 필요하며, 미디어 `url`는 GET으로 직접 가져올 수 있는 공개 https 링크여야 합니다.
  * create 요청은 `/wan/api/v1/...`로 `X-DashScope-Async: enable`을 사용해 전송해야 하며, `/v1/videos`를 사용하면 안 됩니다.
</Warning>

## 코드 예시

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis" \
    -H "X-DashScope-Async: enable" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "happyhorse-1.1-r2v",
      "input": {
        "prompt": "Following the reference image, a girl walking slowly through a garden bathed in sunset light, cinematic lighting",
        "media": [
          {"type": "reference_image", "url": "https://your-cdn.com/girl.png"}
        ]
      },
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": true, "watermark": true}
    }'
  ```

  ```python Python (단일 참조 이미지) theme={null}
  import requests

  url = "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis"
  headers = {
      "Authorization": "Bearer sk-your-api-key",
      "Content-Type": "application/json",
      "X-DashScope-Async": "enable",
  }
  body = {
      "model": "happyhorse-1.1-r2v",
      "input": {
          "prompt": "Following the reference image, a girl walking slowly through a garden bathed in sunset light, cinematic lighting",
          "media": [{"type": "reference_image", "url": "https://your-cdn.com/girl.png"}],
      },
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True},
  }
  resp = requests.post(url, json=body, headers=headers, timeout=30)
  print("task_id:", resp.json()["output"]["task_id"])
  ```

  ```python Python (여러 참조 이미지, 최대 9개) theme={null}
  import requests

  # happyhorse-1.1-r2v supports up to 9 reference_image entries
  refs = [
      "https://your-cdn.com/ref1.png",
      "https://your-cdn.com/ref2.png",
      "https://your-cdn.com/ref3.png",
  ]
  body = {
      "model": "happyhorse-1.1-r2v",
      "input": {
          "prompt": "Keep the character and clothing features from the reference images, strolling through a city night scene with neon lighting",
          "media": [{"type": "reference_image", "url": u} for u in refs],
      },
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True},
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

| 매개변수                       | 유형     | 필수 | 기본값     | 설명                        |
| -------------------------- | ------ | -- | ------- | ------------------------- |
| `model`                    | string | ✓  | —       | `happyhorse-1.1-r2v`로 고정됨 |
| `input.prompt`             | string | ✓  | —       | 텍스트 prompt                |
| `input.media`              | array  | ✓  | —       | 아래 미디어 표를 참조합니다           |
| `parameters.resolution`    | string |    | `720P`  | `720P` / `1080P`          |
| `parameters.duration`      | int    |    | `5`     | 2–15초 정수                  |
| `parameters.prompt_extend` | bool   |    | `true`  | 스마트 재작성, 켜기를 권장합니다        |
| `parameters.watermark`     | bool   |    | `false` | “AI Generated” 워터마크       |

### `media[]` 값

| `type`            | 필수 | 개수  | 설명                                    |
| ----------------- | -- | --- | ------------------------------------- |
| `reference_image` | ✓  | 1–9 | 참조 이미지입니다. 대상(사람/동물/물체)과 장면 특징을 유지합니다 |

## 응답 형식

```json theme={null}
{
  "output": { "task_id": "...", "task_status": "PENDING" },
  "request_id": "..."
}
```

<Warning>
  제출 후, **`GET /v1/tasks/{task_id}`를 폴링**하여 `completed`까지 기다린 다음, `result_url`에서 mp4를 다운로드합니다(**`Authorization` 헤더 없이**, 24시간 후 만료됩니다). 전체 폴링 루프는 [HappyHorse 개요 · 비동기 호출 흐름](/ko/api-capabilities/happyhorse/overview#async-call-flow)에서 확인합니다.
</Warning>


## OpenAPI

````yaml api-reference/happyhorse-reference-to-video-openapi-en.yaml POST /wan/api/v1/services/aigc/video-generation/video-synthesis
openapi: 3.1.0
info:
  title: HappyHorse Reference-to-Video API
  description: >
    Alibaba Cloud HappyHorse-1.0 Reference-to-Video (`happyhorse-1.1-r2v`) — up
    to 9 reference images to keep the subject and scene consistent. DashScope
    async passthrough endpoint.


    - The create request must include the request header `X-DashScope-Async:
    enable`

    - `reference_image` up to 9 (more than Wan2.7-r2v's combined <=5)

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
        Reference-to-Video: create a video task with up to 9 reference images to
        preserve the subject
      description: >
        Submit a `happyhorse-1.1-r2v` Reference-to-Video task (async), returning
        a `task_id`.


        - Required: `model`, `input.prompt`, `input.media` (1-9
        reference_image), request header `X-DashScope-Async: enable`

        - **The response does not contain the video file**; poll `GET
        /v1/tasks/{task_id}` until `completed`, then download from `result_url`
      operationId: createHappyHorseReferenceToVideo
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
              $ref: '#/components/schemas/HappyHorseReferenceToVideoRequest'
            example:
              model: happyhorse-1.1-r2v
              input:
                prompt: >-
                  Following the reference image, a girl walking slowly through a
                  garden bathed in sunset light, cinematic lighting
                media:
                  - type: reference_image
                    url: https://your-cdn.com/girl.png
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
          description: Invalid parameter or more than 9 reference images
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
    HappyHorseReferenceToVideoRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: Model ID, fixed to happyhorse-1.1-r2v for Reference-to-Video
          enum:
            - happyhorse-1.1-r2v
          default: happyhorse-1.1-r2v
        input:
          type: object
          required:
            - prompt
            - media
          properties:
            prompt:
              type: string
              description: >-
                Text prompt; preserves the subject/clothing/scene features from
                the reference images
              example: >-
                Following the reference image, a girl walking slowly through a
                garden bathed in sunset light, cinematic lighting
            media:
              type: array
              description: Media asset array; reference_image up to 9
              maxItems: 9
              items:
                type: object
                required:
                  - type
                  - url
                properties:
                  type:
                    type: string
                    description: 'Media type: reference_image (reference image)'
                    enum:
                      - reference_image
                  url:
                    type: string
                    description: A public https image link fetchable directly via GET
                    example: https://your-cdn.com/girl.png
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