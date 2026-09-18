> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan2.7 텍스트-투-비디오 API 레퍼런스

> Wan2.7-t2v 텍스트-투-비디오 API 레퍼런스 및 라이브 플레이그라운드: DashScope 비동기 패스스루 엔드포인트를 통해 순수 텍스트 prompt로 2-15초 길이의 비디오를 생성합니다.

<Info>
  오른쪽의 Playground에서는 직접 디버깅할 수 있습니다. `Bearer sk-your-api-key`를 **Authorization**에 넣고, `model` / `input` / `parameters`를 입력한 뒤 요청을 전송하십시오. 성공적으로 제출하면 `task_id`가 반환됩니다. 폴링과 다운로드는 아래를 참조하십시오.
</Info>

<Tip>
  이 페이지는 `wan2.7-t2v`(텍스트-투-비디오)의 생성 엔드포인트입니다. 필요한 것은 텍스트 prompt뿐이며, 미디어는 필요하지 않습니다. 이미지를 움직이게 하거나 주제 특징을 유지하려면 대신 [이미지-투-비디오](/ko/api-capabilities/wan/image-to-video) / [레퍼런스-투-비디오](/ko/api-capabilities/wan/reference-to-video)를 사용하십시오. 전체 비동기 흐름, 상태 표, Python 클라이언트는 [Wan 개요](/ko/api-capabilities/wan/overview)를 참조하십시오.
</Tip>

<Warning>
  * 생성 요청은 헤더 `X-DashScope-Async: enable`와 함께 `/wan/api/v1/services/aigc/video-generation/video-synthesis`로 보내야 합니다. **`/v1/videos`를 사용하지 마십시오.**
  * `duration`은 **정수**여야 하며(`5`, `"5"`가 아님), `resolution`는 **대문자**로 작성해야 합니다(`720P`).
</Warning>

## 코드 예제

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis" \
    -H "X-DashScope-Async: enable" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "wan2.7-t2v",
      "input": {
        "prompt": "A lighthouse on the seashore at dusk, the camera slowly pushing in, waves gently lapping the rocks, seabirds calling, cinematic lighting, steady camera work"
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
      "X-DashScope-Async": "enable",   # required when creating a task
  }
  body = {
      "model": "wan2.7-t2v",
      "input": {"prompt": "A lighthouse on the seashore at dusk, the camera slowly pushing in, waves gently lapping the rocks, seabirds calling"},
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True, "watermark": True},
  }

  resp = requests.post(url, json=body, headers=headers, timeout=30)
  task_id = resp.json()["output"]["task_id"]
  print("task_id:", task_id)   # then poll /v1/tasks/{task_id}
  ```

  ```python Python (zero dependencies) theme={null}
  import json, urllib.request

  BASE, KEY = "https://api.apiyi.com", "sk-your-api-key"
  body = {
      "model": "wan2.7-t2v",
      "input": {"prompt": "A lighthouse on the seashore at dusk, the camera slowly pushing in, waves gently lapping the rocks"},
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
| `model`                    | string | ✓  | —       | 고정 `wan2.7-t2v`                         |
| `input.prompt`             | string | ✓  | —       | 텍스트 prompt; 장면, 카메라 움직임, 조명, 스타일을 설명합니다 |
| `input.negative_prompt`    | string |    | —       | 네거티브 prompt, ≤500자                      |
| `parameters.resolution`    | string |    | `720P`  | `720P` / `1080P` (대문자)                  |
| `parameters.ratio`         | string |    | `16:9`  | `16:9` / `9:16` / `1:1` / `4:3` / `3:4` |
| `parameters.duration`      | int    |    | `5`     | 2-15초 정수                                |
| `parameters.prompt_extend` | bool   |    | `true`  | 스마트 재작성, 켜기를 권장합니다                      |
| `parameters.watermark`     | bool   |    | `false` | 오른쪽 아래 모서리에 “AI generated” 워터마크         |
| `parameters.seed`          | int    |    | random  | 0-2147483647, 재현성을 위해 고정합니다             |

## 응답 형식

생성에 성공하면 `task_id`를 반환합니다 (**동영상 자체는 아님**):

```json theme={null}
{
  "output": { "task_id": "c2e7570c-0af2-4eba-919f-3af3d1164a38", "task_status": "PENDING" },
  "request_id": "a23b81b0-0c05-9972-a6c9-ee757400afdb"
}
```

## 상태 확인 및 다운로드

`task_id`를 받으면 mp4를 상태 확인하고 다운로드하기 위해 다음 세 단계를 따르십시오.

* **폴링**: `GET /v1/tasks/{task_id}`(`Authorization` 포함; 쿼리에는 `X-DashScope-Async` 헤더가 **필요하지 않습니다**), 5\~10초마다(3초 미만은 아님) `status`가 `completed`가 될 때까지 반복하십시오.
* **상태 값**: `submitted`(대기 중) / `in_progress`(생성 중; `progress`가 30%에 멈춰 있는 경우가 흔하며 이는 정상입니다) / `completed`(성공) / `failed`(`error` 확인).
* **다운로드**: 응답에서 `result_url`를 직접 GET 하며, **`Authorization` 헤더 없이** 수행하십시오(이것은 OSS 서명된 직접 링크입니다. Auth를 보내면 403이 반환됩니다); `result_url`는 기본적으로 **24시간** 후 만료되므로 즉시 저장하십시오.

<CodeGroup>
  ```bash 상태 확인 theme={null}
  curl "https://api.apiyi.com/v1/tasks/c2e7570c-0af2-4eba-919f-3af3d1164a38" \
    -H "Authorization: Bearer sk-your-api-key"
  ```

  ```json 완료된 응답 theme={null}
  {
    "status": "completed",
    "progress": 100,
    "result_url": "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=...",
    "task_id": "c2e7570c-0af2-4eba-919f-3af3d1164a38"
  }
  ```

  ```bash 동영상 다운로드 theme={null}
  # result_url is an OSS signed direct link — do NOT send the Authorization header (it returns 403)
  curl -L -o out.mp4 "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=..."
  ```

  ```bash 한 번에 실행: 상태 확인 + 다운로드 theme={null}
  TASK_ID="c2e7570c-0af2-4eba-919f-3af3d1164a38"
  URL=$(curl -s "https://api.apiyi.com/v1/tasks/$TASK_ID" \
    -H "Authorization: Bearer sk-your-api-key" | jq -r '.result_url')
  curl -L -o out.mp4 "$URL"   # no Authorization
  ```
</CodeGroup>

<Warning>
  위 내용은 “task\_id가 이미 있는 경우”를 위한 빠른 확인/다운로드 경로입니다. 전체 폴링 루프(타임아웃 대체 동작 포함)와 Python 클라이언트는 [Wan 개요 · 비동기 호출 흐름](/ko/api-capabilities/wan/overview#async-call-flow)을 참조하십시오.
</Warning>


## OpenAPI

````yaml api-reference/wan-text-to-video-openapi-en.yaml POST /wan/api/v1/services/aigc/video-generation/video-synthesis
openapi: 3.1.0
info:
  title: Wan2.7 Text-to-Video API
  description: >
    Alibaba Cloud Tongyi Wanxiang Wan2.7 text-to-video (`wan2.7-t2v`) — generate
    video from a pure text prompt via the DashScope async passthrough endpoint.


    - Creation requests must include the header `X-DashScope-Async: enable`

    - Async task endpoint: this endpoint only submits the task and returns a
    `task_id`; poll `GET /v1/tasks/{task_id}`, then download the mp4 from the
    response's `result_url`

    - `result_url` is an Alibaba Cloud OSS signed direct link; **do not send the
    Authorization header** when downloading, and it is valid for 24 hours

    - **Do not use `/v1/videos`** to submit Wan video tasks (media fields are
    dropped)


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
      summary: 'Text-to-video: create a video generation task from a text prompt'
      description: >
        Submit a `wan2.7-t2v` text-to-video task (async); returns a `task_id`
        and `task_status: "PENDING"`.


        - Required: `model`, `input.prompt`, header `X-DashScope-Async: enable`

        - Optional: `parameters` (resolution / ratio / duration / prompt_extend
        / watermark / seed)

        - **The response does not contain the video file**; poll `GET
        /v1/tasks/{task_id}` until `status: "completed"`, then download from
        `result_url`

        - 720P / 5 seconds typically takes 100-120 seconds
      operationId: createWan27TextToVideo
      parameters:
        - name: X-DashScope-Async
          in: header
          required: true
          description: >-
            Async processing switch; must be set to enable, otherwise it returns
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
              $ref: '#/components/schemas/WanTextToVideoRequest'
            example:
              model: wan2.7-t2v
              input:
                prompt: >-
                  A lighthouse on the seashore at dusk, the camera slowly
                  pushing in, waves gently lapping the rocks, seabirds calling,
                  cinematic lighting, steady camera work
              parameters:
                resolution: 720P
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
          description: >-
            Invalid parameter (duration passed as a string, wrong resolution
            value, missing prompt, etc.)
        '401':
          description: Unauthorized - invalid API Key
        '403':
          description: Blocked by content moderation, or no permission for the group
        '429':
          description: Rate limit exceeded or insufficient balance
        '500':
          description: Upstream gateway error; retry 1-2 times
      security:
        - bearerAuth: []
components:
  schemas:
    WanTextToVideoRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: >-
            Model ID; for text-to-video, fixed wan2.7-t2v (legacy version
            wan2.6-t2v)
          enum:
            - wan2.7-t2v
            - wan2.6-t2v
          default: wan2.7-t2v
        input:
          type: object
          required:
            - prompt
          properties:
            prompt:
              type: string
              description: Text prompt; describe scene, camera motion, lighting, and style
              example: >-
                A lighthouse on the seashore at dusk, the camera slowly pushing
                in, waves gently lapping the rocks, seabirds calling
            negative_prompt:
              type: string
              description: >-
                Negative prompt, content you do not want to appear, <=500
                characters
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
              example: c2e7570c-0af2-4eba-919f-3af3d1164a38
            task_status:
              type: string
              description: Initial task status
              enum:
                - PENDING
                - RUNNING
                - SUCCEEDED
                - FAILED
              example: PENDING
        request_id:
          type: string
          description: >-
            Unique request identifier; provide it to support when
            troubleshooting
          example: a23b81b0-0c05-9972-a6c9-ee757400afdb
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
        ratio:
          type: string
          description: Aspect ratio; ignored automatically when a first frame is supplied
          enum:
            - '16:9'
            - '9:16'
            - '1:1'
            - '4:3'
            - '3:4'
          default: '16:9'
        duration:
          type: integer
          description: Video duration (seconds), integer, range 2-15
          minimum: 2
          maximum: 15
          default: 5
        prompt_extend:
          type: boolean
          description: >-
            Whether to enable smart prompt rewriting; clearly improves short
            prompts, strongly recommend true
          default: true
        watermark:
          type: boolean
          description: Whether to add an AI generated watermark in the bottom-right corner
          default: false
        seed:
          type: integer
          description: Random seed, 0-2147483647; fixing it improves reproducibility
          minimum: 0
          maximum: 2147483647
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: The API Key obtained from the APIYI console

````