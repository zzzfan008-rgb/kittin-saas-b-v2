> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# HappyHorse Video Edit API Reference

> HappyHorse-1.0-video-edit Video Edit API reference and online debugging: input video + up to 5 reference images + natural-language instructions for local/global edits.

<Info>
  You can debug directly in the Playground on the right: fill in **Authorization** with `Bearer sk-your-api-key`, set `model` / `input.media` / `parameters`, then send the request. A successful submission returns a `task_id`; see below for polling and downloading.
</Info>

<Tip>
  This page covers the create endpoint for `happyhorse-1.0-video-edit` (Video Edit): provide a video + up to 5 reference images + natural-language instructions to make local/global edits to video elements. Note that the model name **has a hyphen** (`video-edit`). For the complete async flow, see the [HappyHorse Overview](/en/api-capabilities/happyhorse/overview).
</Tip>

<Warning>
  * `input.media` must include both a `video` (the video being edited) and at least 1 `reference_image` (≤5).
  * The model name is `happyhorse-1.0-video-edit` (**has a hyphen**), different from Wan's `wan2.7-videoedit` (no hyphen) — don't get it wrong.
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

## Parameter and Media Quick Reference

| Parameter                  | Type   | Required | Default | Notes                                |
| -------------------------- | ------ | -------- | ------- | ------------------------------------ |
| `model`                    | string | ✓        | —       | Fixed to `happyhorse-1.0-video-edit` |
| `input.prompt`             | string | ✓        | —       | Natural-language editing instruction |
| `input.media`              | array  | ✓        | —       | See the media table below            |
| `parameters.resolution`    | string |          | `720P`  | `720P` / `1080P`                     |
| `parameters.prompt_extend` | bool   |          | `true`  | Smart rewriting                      |
| `parameters.watermark`     | bool   |          | `false` | "AI Generated" watermark             |

### `media[]` Values

| `type`            | Required | Count | Notes                                                   |
| ----------------- | -------- | ----- | ------------------------------------------------------- |
| `video`           | ✓        | 1     | The source video being edited                           |
| `reference_image` | ✓        | 1–5   | Reference material (new clothing, new background, etc.) |

<Info>
  The output duration of video editing follows the input video and is not determined by `duration`, so this capability typically does not pass `duration`.
</Info>

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