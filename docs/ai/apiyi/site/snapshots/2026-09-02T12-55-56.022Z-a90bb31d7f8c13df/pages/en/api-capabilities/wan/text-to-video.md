> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan2.7 Text-to-Video API Reference

> Wan2.7-t2v text-to-video API reference and live playground: generate 2-15 second video from a pure text prompt via the DashScope async passthrough endpoint.

<Info>
  The Playground on the right lets you debug directly: put `Bearer sk-your-api-key` in **Authorization**, fill in `model` / `input` / `parameters`, and send the request. A successful submission returns a `task_id`; see below for polling and download.
</Info>

<Tip>
  This page is the creation endpoint for `wan2.7-t2v` (text-to-video). It needs only a text prompt, no media. To make an image move or preserve subject features, use [Image-to-Video](/en/api-capabilities/wan/image-to-video) / [Reference-to-Video](/en/api-capabilities/wan/reference-to-video) instead. For the full async flow, status table, and Python client, see the [Wan Overview](/en/api-capabilities/wan/overview).
</Tip>

<Warning>
  * Creation requests must go to `/wan/api/v1/services/aigc/video-generation/video-synthesis` with the header `X-DashScope-Async: enable`. **Do not use `/v1/videos`.**
  * `duration` must be an **integer** (`5`, not `"5"`); write `resolution` in **uppercase** (`720P`).
</Warning>

## Code examples

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

## Parameter quick reference

| Parameter                  | Type   | Required | Default | Notes                                                           |
| -------------------------- | ------ | -------- | ------- | --------------------------------------------------------------- |
| `model`                    | string | ✓        | —       | Fixed `wan2.7-t2v`                                              |
| `input.prompt`             | string | ✓        | —       | Text prompt; describe scene, camera motion, lighting, and style |
| `input.negative_prompt`    | string |          | —       | Negative prompt, ≤500 characters                                |
| `parameters.resolution`    | string |          | `720P`  | `720P` / `1080P` (uppercase)                                    |
| `parameters.ratio`         | string |          | `16:9`  | `16:9` / `9:16` / `1:1` / `4:3` / `3:4`                         |
| `parameters.duration`      | int    |          | `5`     | 2-15 second integer                                             |
| `parameters.prompt_extend` | bool   |          | `true`  | Smart rewriting, recommended on                                 |
| `parameters.watermark`     | bool   |          | `false` | "AI generated" watermark in the bottom-right corner             |
| `parameters.seed`          | int    |          | random  | 0-2147483647, fix for reproducibility                           |

## Response format

A successful creation returns a `task_id` (**not the video itself**):

```json theme={null}
{
  "output": { "task_id": "c2e7570c-0af2-4eba-919f-3af3d1164a38", "task_status": "PENDING" },
  "request_id": "a23b81b0-0c05-9972-a6c9-ee757400afdb"
}
```

## Check status and download

Once you have the `task_id`, follow these three steps to poll status and download the mp4:

* **Poll** `GET /v1/tasks/{task_id}` (with `Authorization`; the query does **not** need the `X-DashScope-Async` header), every 5-10 seconds (not \< 3 seconds), until `status` becomes `completed`.
* **Status values**: `submitted` (queued) / `in_progress` (generating; `progress` often sitting at 30% is normal) / `completed` (success) / `failed` (check `error`).
* **Download**: GET the `result_url` from the response directly, **without the `Authorization` header** (it is an OSS signed direct link — sending Auth returns 403); `result_url` expires in **24 hours** by default, so save it promptly.

<CodeGroup>
  ```bash Check status theme={null}
  curl "https://api.apiyi.com/v1/tasks/c2e7570c-0af2-4eba-919f-3af3d1164a38" \
    -H "Authorization: Bearer sk-your-api-key"
  ```

  ```json Completed response theme={null}
  {
    "status": "completed",
    "progress": 100,
    "result_url": "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=...",
    "task_id": "c2e7570c-0af2-4eba-919f-3af3d1164a38"
  }
  ```

  ```bash Download video theme={null}
  # result_url is an OSS signed direct link — do NOT send the Authorization header (it returns 403)
  curl -L -o out.mp4 "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=..."
  ```

  ```bash One command: check + download theme={null}
  TASK_ID="c2e7570c-0af2-4eba-919f-3af3d1164a38"
  URL=$(curl -s "https://api.apiyi.com/v1/tasks/$TASK_ID" \
    -H "Authorization: Bearer sk-your-api-key" | jq -r '.result_url')
  curl -L -o out.mp4 "$URL"   # no Authorization
  ```
</CodeGroup>

<Warning>
  The above is the quick check/download path for "already have a task\_id". For the full polling loop (with timeout fallback) and Python client, see [Wan Overview · Async call flow](/en/api-capabilities/wan/overview#async-call-flow).
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