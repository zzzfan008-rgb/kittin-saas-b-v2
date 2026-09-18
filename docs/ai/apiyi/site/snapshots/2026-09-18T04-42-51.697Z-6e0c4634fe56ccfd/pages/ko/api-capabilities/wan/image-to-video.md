> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan2.7 Image-to-Video API 레퍼런스

> Wan2.7-i2v 이미지-to-Video API 레퍼런스 및 라이브 플레이그라운드: 첫 프레임에서 동영상을 생성하며, driving_audio를 지원하여 립싱크 / 랩을 구현합니다.

<Info>
  오른쪽 플레이그라운드에서 직접 디버깅할 수 있습니다: **Authorization**에 `Bearer sk-your-api-key`를 넣고, `model` / `input.media` / `parameters`를 채운 뒤 요청을 보내십시오. 제출이 성공하면 `task_id`이 반환됩니다. 폴링과 다운로드는 아래를 참조하십시오.
</Info>

<Tip>
  이 페이지는 `wan2.7-i2v`(이미지에서 동영상 생성)의 생성 엔드포인트입니다. 첫 프레임 + prompt를 제공하여 이미지를 생동감 있게 만들고, 선택적으로 `driving_audio`를 전달하면 인물이 오디오의 입 모양과 리듬을 따라가게 할 수 있습니다. 전체 비동기 흐름은 [Wan 개요](/ko/api-capabilities/wan/overview)를 참조하십시오.
</Tip>

<Warning>
  * **오디오 구동은 `wan2.7-i2v`에서만 지원됩니다**: [HappyHorse i2v](/ko/api-capabilities/happyhorse/image-to-video)는 `driving_audio`를 지원하지 않으므로 립싱크 / 랩에는 `wan2.7-i2v`를 사용해야 합니다.
  * `input.media`은 필수이며, 그렇지 않으면 업스트림이 `image-to-video model ... must provide an image`를 반환합니다. 각 미디어 `url`는 GET으로 직접 가져올 수 있는 공개 https 링크여야 합니다.
  * 생성 요청은 `/wan/api/v1/...`으로 `X-DashScope-Async: enable`와 함께 전송하며, `/v1/videos`는 사용하지 마십시오.
</Warning>

## 코드 예제

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis" \
    -H "X-DashScope-Async: enable" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "wan2.7-i2v",
      "input": {
        "prompt": "A spray-painted boy comes to life off the wall and performs an English rap, at night under a railway bridge, cinematic lighting",
        "media": [
          {"type": "first_frame",   "url": "https://your-cdn.com/rap.png"},
          {"type": "driving_audio", "url": "https://your-cdn.com/rap.mp3"}
        ]
      },
      "parameters": {"resolution": "720P", "duration": 10, "prompt_extend": true, "watermark": true}
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
      "model": "wan2.7-i2v",
      "input": {
          "prompt": "A spray-painted boy comes to life off the wall and performs an English rap, at night under a railway bridge",
          "media": [
              {"type": "first_frame",   "url": "https://your-cdn.com/rap.png"},
              {"type": "driving_audio", "url": "https://your-cdn.com/rap.mp3"},  # optional, for lip-sync
          ],
      },
      "parameters": {"resolution": "720P", "duration": 10, "prompt_extend": True, "watermark": True},
  }

  resp = requests.post(url, json=body, headers=headers, timeout=30)
  print("task_id:", resp.json()["output"]["task_id"])
  ```

  ```python Python (no audio) theme={null}
  import requests

  # Without lip-sync, pass only first_frame
  body = {
      "model": "wan2.7-i2v",
      "input": {
          "prompt": "A cat running across a meadow, bright sunshine, the camera following",
          "media": [{"type": "first_frame", "url": "https://your-cdn.com/cat.png"}],
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

| 매개변수                       | 타입     | 필수 | 기본값     | 설명                |
| -------------------------- | ------ | -- | ------- | ----------------- |
| `model`                    | string | ✓  | —       | 고정 `wan2.7-i2v`   |
| `input.prompt`             | string | ✓  | —       | 텍스트 prompt        |
| `input.media`              | array  | ✓  | —       | 아래 미디어 표를 참조하십시오  |
| `parameters.resolution`    | string |    | `720P`  | `720P` / `1080P`  |
| `parameters.duration`      | int    |    | `5`     | 2\~15초 정수         |
| `parameters.prompt_extend` | bool   |    | `true`  | 스마트 재작성, 켜는 것을 권장 |
| `parameters.watermark`     | bool   |    | `false` | “AI 생성” 워터마크      |

### `media[]` 값

| `type`          | 필수 | 개수 | 설명                                                     |
| --------------- | -- | -- | ------------------------------------------------------ |
| `first_frame`   | ✓  | 1  | 첫 프레임입니다. 동영상은 이 이미지에서 시작됩니다                           |
| `driving_audio` |    | 1  | 드라이빙 오디오(wav/mp3)입니다. 초상화가 오디오의 입 모양 움직임과 리듬을 따르도록 합니다 |

## 응답 형식

```json theme={null}
{
  "output": { "task_id": "f8ca39a0-6f4b-4ec2-99bf-8b9649d946c4", "task_status": "PENDING" },
  "request_id": "..."
}
```

## 상태 확인 및 다운로드

`task_id`를 확보한 뒤에는, mp4를 폴링하여 상태를 확인하고 다운로드하기 위해 다음 세 단계를 따르십시오.

* **폴링** `GET /v1/tasks/{task_id}`(`Authorization` 포함; 쿼리는 `X-DashScope-Async` 헤더가 **필요하지 않습니다**), 5-10초마다(3초 미만은 안 됨) `status`가 `completed`이 될 때까지 수행합니다.
* **상태 값**: `submitted`(대기 중) / `in_progress`(생성 중; `progress`가 30% 근처에서 멈춰 있는 것은 정상입니다) / `completed`(성공) / `failed`(`error` 확인).
* **다운로드**: 응답에서 `result_url`를 직접 GET으로 가져오되, **`Authorization` 헤더는 사용하지 마십시오**(OSS 서명된 직접 링크이므로, Auth를 보내면 403이 반환됩니다); `result_url`는 기본적으로 **24시간** 후 만료되므로 즉시 저장하십시오.

<CodeGroup>
  ```bash Check status theme={null}
  curl "https://api.apiyi.com/v1/tasks/f8ca39a0-6f4b-4ec2-99bf-8b9649d946c4" \
    -H "Authorization: Bearer sk-your-api-key"
  ```

  ```json Completed response theme={null}
  {
    "status": "completed",
    "progress": 100,
    "result_url": "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=...",
    "task_id": "f8ca39a0-6f4b-4ec2-99bf-8b9649d946c4"
  }
  ```

  ```bash Download video theme={null}
  # result_url is an OSS signed direct link — do NOT send the Authorization header (it returns 403)
  curl -L -o out.mp4 "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=..."
  ```

  ```bash One command: check + download theme={null}
  TASK_ID="f8ca39a0-6f4b-4ec2-99bf-8b9649d946c4"
  URL=$(curl -s "https://api.apiyi.com/v1/tasks/$TASK_ID" \
    -H "Authorization: Bearer sk-your-api-key" | jq -r '.result_url')
  curl -L -o out.mp4 "$URL"   # no Authorization
  ```
</CodeGroup>

<Warning>
  위 내용은 "이미 task\_id를 가지고 있는 경우"를 위한 빠른 확인/다운로드 경로입니다. 전체 폴링 루프(타임아웃 폴백 포함)와 Python 클라이언트는 [Wan Overview · Async call flow](/ko/api-capabilities/wan/overview#async-call-flow)를 참조하십시오.
</Warning>


## OpenAPI

````yaml api-reference/wan-image-to-video-openapi-en.yaml POST /wan/api/v1/services/aigc/video-generation/video-synthesis
openapi: 3.1.0
info:
  title: Wan2.7 Image-to-Video API
  description: >
    Alibaba Cloud Tongyi Wanxiang Wan2.7 image-to-video (`wan2.7-i2v`) —
    generate video from a first frame, with `driving_audio` support for lip-sync
    / rap. DashScope async passthrough endpoint.


    - Creation requests must include the header `X-DashScope-Async: enable`

    - **Audio drive is exclusive to wan2.7-i2v**; HappyHorse i2v does not
    support it

    - Async task endpoint: returns a `task_id`; poll `GET /v1/tasks/{task_id}`,
    then download from `result_url` (no Authorization header, expires in 24
    hours)

    - **Do not use `/v1/videos`** (media fields are dropped)


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
        Image-to-video: create a video generation task from a first frame (+
        optional driving audio)
      description: >
        Submit a `wan2.7-i2v` image-to-video task (async); returns a `task_id`.


        - Required: `model`, `input.prompt`, `input.media` (at least 1
        `first_frame`), header `X-DashScope-Async: enable`

        - Optional: `driving_audio` (makes the portrait follow the audio's mouth
        movements and rhythm), `parameters`

        - **The response does not contain the video file**; poll `GET
        /v1/tasks/{task_id}` until `completed`, then download from `result_url`

        - 720P / following audio typically takes 70-90 seconds
      operationId: createWan27ImageToVideo
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
              $ref: '#/components/schemas/WanImageToVideoRequest'
            example:
              model: wan2.7-i2v
              input:
                prompt: >-
                  A spray-painted boy comes to life off the wall and performs an
                  English rap, at night under a railway bridge, cinematic
                  lighting
                media:
                  - type: first_frame
                    url: https://your-cdn.com/rap.png
                  - type: driving_audio
                    url: https://your-cdn.com/rap.mp3
              parameters:
                resolution: 720P
                duration: 10
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
            Invalid parameter (wrong duration type, wrong resolution value,
            etc.)
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
    WanImageToVideoRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: >-
            Model ID; for image-to-video, fixed wan2.7-i2v (legacy version
            wan2.6-i2v)
          enum:
            - wan2.7-i2v
            - wan2.6-i2v
          default: wan2.7-i2v
        input:
          type: object
          required:
            - prompt
            - media
          properties:
            prompt:
              type: string
              description: Text prompt
              example: >-
                A spray-painted boy comes to life off the wall and performs an
                English rap
            negative_prompt:
              type: string
              description: Negative prompt, <=500 characters
            media:
              type: array
              description: >-
                Media asset array; must contain 1 first_frame and may contain 1
                optional driving_audio
              items:
                type: object
                required:
                  - type
                  - url
                properties:
                  type:
                    type: string
                    description: >-
                      Media type: first_frame (first frame image, <=1) /
                      driving_audio (driving audio for lip-sync)
                    enum:
                      - first_frame
                      - driving_audio
                  url:
                    type: string
                    description: >-
                      Public https link fetchable directly with GET (image
                      JPEG/PNG/WEBP; audio wav/mp3)
                    example: https://your-cdn.com/rap.png
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
              example: f8ca39a0-6f4b-4ec2-99bf-8b9649d946c4
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
        duration:
          type: integer
          description: Video duration (seconds), integer, range 2-15
          minimum: 2
          maximum: 15
          default: 5
        prompt_extend:
          type: boolean
          description: Whether to enable smart prompt rewriting, strongly recommend true
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