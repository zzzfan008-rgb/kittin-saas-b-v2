> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan2.7 Image-to-Video API Reference

> Wan2.7-i2v image-to-video API reference and live playground: generate video from a first frame, with driving_audio support for lip-sync / rap.

<Info>
  The Playground on the right lets you debug directly: put `Bearer sk-your-api-key` in **Authorization**, fill in `model` / `input.media` / `parameters`, and send the request. A successful submission returns a `task_id`; see below for polling and download.
</Info>

<Tip>
  This page is the creation endpoint for `wan2.7-i2v` (image-to-video): give a first frame + prompt to bring the image to life, and optionally pass `driving_audio` to make the portrait follow the audio's mouth movements and rhythm. For the full async flow, see the [Wan Overview](/en/api-capabilities/wan/overview).
</Tip>

<Warning>
  * **Audio drive is exclusive to `wan2.7-i2v`**: [HappyHorse i2v](/en/api-capabilities/happyhorse/image-to-video) does not support `driving_audio`, so lip-sync / rap must use `wan2.7-i2v`.
  * `input.media` is required, otherwise the upstream returns `image-to-video model ... must provide an image`. Each media `url` must be a public https link that can be fetched directly with GET.
  * Creation requests go to `/wan/api/v1/...` with `X-DashScope-Async: enable`; do not use `/v1/videos`.
</Warning>

## Code examples

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

## Parameter and media quick reference

| Parameter                  | Type   | Required | Default | Notes                           |
| -------------------------- | ------ | -------- | ------- | ------------------------------- |
| `model`                    | string | ✓        | —       | Fixed `wan2.7-i2v`              |
| `input.prompt`             | string | ✓        | —       | Text prompt                     |
| `input.media`              | array  | ✓        | —       | See the media table below       |
| `parameters.resolution`    | string |          | `720P`  | `720P` / `1080P`                |
| `parameters.duration`      | int    |          | `5`     | 2-15 second integer             |
| `parameters.prompt_extend` | bool   |          | `true`  | Smart rewriting, recommended on |
| `parameters.watermark`     | bool   |          | `false` | "AI generated" watermark        |

### `media[]` values

| `type`          | Required | Count | Notes                                                                                     |
| --------------- | -------- | ----- | ----------------------------------------------------------------------------------------- |
| `first_frame`   | ✓        | 1     | First frame; the video starts from this image                                             |
| `driving_audio` |          | 1     | Driving audio (wav/mp3); makes the portrait follow the audio's mouth movements and rhythm |

## Response format

```json theme={null}
{
  "output": { "task_id": "f8ca39a0-6f4b-4ec2-99bf-8b9649d946c4", "task_status": "PENDING" },
  "request_id": "..."
}
```

## Check status and download

Once you have the `task_id`, follow these three steps to poll status and download the mp4:

* **Poll** `GET /v1/tasks/{task_id}` (with `Authorization`; the query does **not** need the `X-DashScope-Async` header), every 5-10 seconds (not \< 3 seconds), until `status` becomes `completed`.
* **Status values**: `submitted` (queued) / `in_progress` (generating; `progress` often sitting at 30% is normal) / `completed` (success) / `failed` (check `error`).
* **Download**: GET the `result_url` from the response directly, **without the `Authorization` header** (it is an OSS signed direct link — sending Auth returns 403); `result_url` expires in **24 hours** by default, so save it promptly.

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
  The above is the quick check/download path for "already have a task\_id". For the full polling loop (with timeout fallback) and Python client, see [Wan Overview · Async call flow](/en/api-capabilities/wan/overview#async-call-flow).
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