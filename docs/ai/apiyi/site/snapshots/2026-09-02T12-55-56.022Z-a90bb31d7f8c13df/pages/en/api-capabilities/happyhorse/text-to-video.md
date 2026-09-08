> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# HappyHorse Text-to-Video API Reference

> HappyHorse-1.1-t2v Text-to-Video API reference and online debugging: generate video from a pure text prompt, DashScope async passthrough endpoint.

<Info>
  You can debug directly in the Playground on the right: fill in **Authorization** with `Bearer sk-your-api-key`, set `model` / `input` / `parameters`, then send the request. A successful submission returns a `task_id`; see below for polling and downloading.
</Info>

<Tip>
  This page covers the create endpoint for `happyhorse-1.1-t2v` (Text-to-Video) and needs only a text prompt. For the complete async flow, status table, and Python client, see the [HappyHorse Overview](/en/api-capabilities/happyhorse/overview).
</Tip>

<Warning>
  * The create request must go to `/wan/api/v1/services/aigc/video-generation/video-synthesis` with the request header `X-DashScope-Async: enable`. **Do not use `/v1/videos`.**
  * `duration` must be an **integer** (`5`, not `"5"`); write `resolution` in **uppercase** `720P`.
</Warning>

## Code Examples

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

## Parameter Quick Reference

| Parameter                  | Type   | Required | Default | Notes                                                             |
| -------------------------- | ------ | -------- | ------- | ----------------------------------------------------------------- |
| `model`                    | string | ✓        | —       | Fixed to `happyhorse-1.1-t2v`                                     |
| `input.prompt`             | string | ✓        | —       | Text prompt; describe scene, camera movement, lighting, and style |
| `parameters.resolution`    | string |          | `720P`  | `720P` / `1080P` (uppercase)                                      |
| `parameters.duration`      | int    |          | `5`     | Integer of 2–15 seconds                                           |
| `parameters.prompt_extend` | bool   |          | `true`  | Smart rewriting, recommended on                                   |
| `parameters.watermark`     | bool   |          | `false` | "AI Generated" watermark in the bottom-right corner               |
| `parameters.seed`          | int    |          | random  | 0–2147483647, fix for reproducibility                             |

## Response Format

A successful creation returns a `task_id` (**not the video itself**):

```json theme={null}
{
  "output": { "task_id": "...", "task_status": "PENDING" },
  "request_id": "..."
}
```

<Warning>
  After submission, you must **poll `GET /v1/tasks/{task_id}`** until `status: "completed"`, then download the mp4 from the `result_url` in the response. When downloading, **do not include the `Authorization` header** (it's a signed OSS direct link), and `result_url` expires in 24 hours by default. See the full polling loop in [HappyHorse Overview · Async Call Flow](/en/api-capabilities/happyhorse/overview#async-call-flow).
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