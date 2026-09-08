> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# HappyHorse Image-to-Video API Reference

> HappyHorse-1.1-i2v Image-to-Video API reference and online debugging: generate video from a first-frame image (no audio-driven support), DashScope async passthrough endpoint.

<Info>
  You can debug directly in the Playground on the right: fill in **Authorization** with `Bearer sk-your-api-key`, set `model` / `input.media` / `parameters`, then send the request. A successful submission returns a `task_id`; see below for polling and downloading.
</Info>

<Tip>
  This page covers the create endpoint for `happyhorse-1.1-i2v` (Image-to-Video): give a first-frame image + prompt to bring the scene to life. For the complete async flow, see the [HappyHorse Overview](/en/api-capabilities/happyhorse/overview).
</Tip>

<Warning>
  * **HappyHorse's i2v does not support `driving_audio`** (audio-driven): it only accepts `first_frame`. For lip-sync / rap, use [Wan2.7-i2v](/en/api-capabilities/wan/image-to-video).
  * `input.media` is required; otherwise the upstream reports `Image-to-video model ... must provide an image`. The media `url` must be a public https link that can be fetched directly via GET.
  * The create request goes to `/wan/api/v1/...` with `X-DashScope-Async: enable`; do not use `/v1/videos`.
</Warning>

## Code Examples

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

## Parameter and Media Quick Reference

| Parameter                  | Type   | Required | Default | Notes                           |
| -------------------------- | ------ | -------- | ------- | ------------------------------- |
| `model`                    | string | ✓        | —       | Fixed to `happyhorse-1.1-i2v`   |
| `input.prompt`             | string | ✓        | —       | Text prompt                     |
| `input.media`              | array  | ✓        | —       | See the media table below       |
| `parameters.resolution`    | string |          | `720P`  | `720P` / `1080P`                |
| `parameters.duration`      | int    |          | `5`     | Integer of 2–15 seconds         |
| `parameters.prompt_extend` | bool   |          | `true`  | Smart rewriting, recommended on |
| `parameters.watermark`     | bool   |          | `false` | "AI Generated" watermark        |

### `media[]` Values

| `type`        | Required | Count | Notes                                                                                   |
| ------------- | -------- | ----- | --------------------------------------------------------------------------------------- |
| `first_frame` | ✓        | 1     | First-frame image; the video starts from this image (HappyHorse i2v supports only this) |

## Response Format

```json theme={null}
{
  "output": { "task_id": "...", "task_status": "PENDING" },
  "request_id": "..."
}
```

<Warning>
  After submission, **poll `GET /v1/tasks/{task_id}`** until `completed`, then download the mp4 from `result_url` (**without the `Authorization` header**, expires in 24 hours). See the full polling loop in [HappyHorse Overview · Async Call Flow](/en/api-capabilities/happyhorse/overview#async-call-flow).
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