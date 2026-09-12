> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan2.7 Reference-to-Video API Reference

> Wan2.7-r2v reference-to-video API reference and live playground: preserve subject features from reference images/videos, with multi-subject interaction, voice reference, and split-screen storyboards.

<Info>
  The Playground on the right lets you debug directly: put `Bearer sk-your-api-key` in **Authorization**, fill in `model` / `input.media` / `parameters`, and send the request. A successful submission returns a `task_id`; see below for polling and download.
</Info>

<Tip>
  This page is the creation endpoint for `wan2.7-r2v` (reference-to-video): give reference images/videos and the model preserves their subjects (people/animals/objects) and scene features, generating single-character performances or multi-character interactions. If you need more reference images (up to 9), consider [HappyHorse r2v](/en/api-capabilities/happyhorse/reference-to-video). For the full async flow, see the [Wan Overview](/en/api-capabilities/wan/overview).
</Tip>

<Warning>
  * **Reference-asset citation convention**: in the prompt, use "image 1 / image 2" to refer to `reference_image` and "video 1 / video 2" to refer to `reference_video`, in the same order as the `media` array (images and videos counted separately). With a single image/video, you can simply write "the reference image" / "the reference video".
  * **Count limits**: `reference_image` + `reference_video` total ≤5; at most 1 `first_frame`.
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
      "model": "wan2.7-r2v",
      "input": {
        "prompt": "A girl wearing this gown walks slowly through a garden bathed in sunset, the breeze gently lifting her skirt, cinematic lighting",
        "media": [
          {"type": "reference_image", "url": "https://your-cdn.com/dress.png"}
        ]
      },
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": true, "watermark": true}
    }'
  ```

  ```python Python (single-image reference) theme={null}
  import requests

  url = "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis"
  headers = {
      "Authorization": "Bearer sk-your-api-key",
      "Content-Type": "application/json",
      "X-DashScope-Async": "enable",
  }
  body = {
      "model": "wan2.7-r2v",
      "input": {
          "prompt": "The reference image: a girl walking slowly through a garden bathed in sunset, cinematic lighting",
          "media": [{"type": "reference_image", "url": "https://your-cdn.com/girl.png"}],
      },
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True},
  }
  resp = requests.post(url, json=body, headers=headers, timeout=30)
  print("task_id:", resp.json()["output"]["task_id"])
  ```

  ```python Python (multi-subject + voice) theme={null}
  import requests

  # Multi-subject: image 1 = girl (with voice), video 1 = boy (with voice), image 2/3 = props/background
  body = {
      "model": "wan2.7-r2v",
      "input": {
          "prompt": "Video 1 holds image 2, walks past image 1, and says: the sunshine is lovely today.",
          "media": [
              {"type": "reference_image", "url": "https://your-cdn.com/girl.jpg",
               "reference_voice": "https://your-cdn.com/girl-voice.mp3"},
              {"type": "reference_video", "url": "https://your-cdn.com/boy.mp4",
               "reference_voice": "https://your-cdn.com/boy-voice.mp3"},
              {"type": "reference_image", "url": "https://your-cdn.com/object.png"},
          ],
      },
      "parameters": {"resolution": "720P", "ratio": "16:9", "duration": 10, "prompt_extend": False, "watermark": True},
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

| Parameter                  | Type   | Required | Default | Notes                                                                          |
| -------------------------- | ------ | -------- | ------- | ------------------------------------------------------------------------------ |
| `model`                    | string | ✓        | —       | Fixed `wan2.7-r2v`                                                             |
| `input.prompt`             | string | ✓        | —       | ≤5000 characters; use "image 1/video 1" to reference assets                    |
| `input.media`              | array  | ✓        | —       | See the media table below                                                      |
| `parameters.resolution`    | string |          | `1080P` | `720P` / `1080P`                                                               |
| `parameters.ratio`         | string |          | `16:9`  | `16:9` / `9:16` / `1:1` / `4:3` / `3:4` (ignored when a first frame is passed) |
| `parameters.duration`      | int    |          | `5`     | 2-10 with a reference video; 2-15 without                                      |
| `parameters.prompt_extend` | bool   |          | `true`  | Smart rewriting                                                                |
| `parameters.watermark`     | bool   |          | `false` | "AI generated" watermark                                                       |

### `media[]` values

| `type`            | Count / limit          | Notes                                                                                                              |
| ----------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `reference_image` | ≤5 combined with video | Reference image, provides a subject (person/animal/object) or scene; can attach `reference_voice` to set the voice |
| `reference_video` | ≤5 combined with image | Reference video, provides subject and voice reference; do not pass empty-scene footage                             |
| `first_frame`     | ≤1                     | Optional first frame, jointly controls the starting frame                                                          |
| `reference_voice` | attached field         | Attached to a `reference_image`/`reference_video` to set that subject's voice (wav/mp3, 1-10s)                     |

## Response format

```json theme={null}
{
  "output": { "task_id": "acda59b4-3b10-4789-a5e5-edadae48adcb", "task_status": "PENDING" },
  "request_id": "..."
}
```

## Check status and download

Once you have the `task_id`, follow these three steps to poll status and download the mp4:

* **Poll** `GET /v1/tasks/{task_id}` (with `Authorization`; the query does **not** need the `X-DashScope-Async` header), every 10 seconds (not \< 3 seconds), until `status` becomes `completed`. Reference-to-video usually takes 1-5 minutes, so set a 20-minute client timeout as a fallback.
* **Status values**: `submitted` (queued) / `in_progress` (generating; `progress` often sitting at 30% is normal) / `completed` (success) / `failed` (check `error`).
* **Download**: GET the `result_url` from the response directly, **without the `Authorization` header** (it is an OSS signed direct link — sending Auth returns 403); `result_url` expires in **24 hours** by default, so save it promptly.

<CodeGroup>
  ```bash Check status theme={null}
  curl "https://api.apiyi.com/v1/tasks/acda59b4-3b10-4789-a5e5-edadae48adcb" \
    -H "Authorization: Bearer sk-your-api-key"
  ```

  ```json Completed response theme={null}
  {
    "status": "completed",
    "progress": 100,
    "result_url": "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=...",
    "task_id": "acda59b4-3b10-4789-a5e5-edadae48adcb"
  }
  ```

  ```bash Download video theme={null}
  # result_url is an OSS signed direct link — do NOT send the Authorization header (it returns 403)
  curl -L -o out.mp4 "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=..."
  ```

  ```bash One command: check + download theme={null}
  TASK_ID="acda59b4-3b10-4789-a5e5-edadae48adcb"
  URL=$(curl -s "https://api.apiyi.com/v1/tasks/$TASK_ID" \
    -H "Authorization: Bearer sk-your-api-key" | jq -r '.result_url')
  curl -L -o out.mp4 "$URL"   # no Authorization
  ```
</CodeGroup>

<Warning>
  The above is the quick check/download path for "already have a task\_id". For the full polling loop (with timeout fallback) and Python client, see [Wan Overview · Async call flow](/en/api-capabilities/wan/overview#async-call-flow).
</Warning>


## OpenAPI

````yaml api-reference/wan-reference-to-video-openapi-en.yaml POST /wan/api/v1/services/aigc/video-generation/video-synthesis
openapi: 3.1.0
info:
  title: Wan2.7 Reference-to-Video API
  description: >
    Alibaba Cloud Tongyi Wanxiang Wan2.7 reference-to-video (`wan2.7-r2v`) —
    preserve subject features from reference images/videos, with multi-subject
    interaction, voice reference, and split-screen storyboards. DashScope async
    passthrough endpoint.


    - Creation requests must include the header `X-DashScope-Async: enable`

    - In the prompt, use "image 1 / video 1" to refer to reference assets, in
    the same order as the media array

    - `reference_image` + `reference_video` total <=5; `first_frame` <=1

    - Async task endpoint: returns a `task_id`; poll `GET /v1/tasks/{task_id}`,
    then download from `result_url` (no Authorization header, expires in 24
    hours)

    - **Do not use `/v1/videos`**


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
        Reference-to-video: create a video task that preserves subject features
        from reference images/videos
      description: >
        Submit a `wan2.7-r2v` reference-to-video task (async); returns a
        `task_id`.


        - Required: `model`, `input.prompt`, `input.media` (at least 1
        reference_image / reference_video), header `X-DashScope-Async: enable`

        - Optional: `reference_voice` (voice reference), `parameters` (including
        ratio)

        - **The response does not contain the video file**; poll `GET
        /v1/tasks/{task_id}` until `completed`, then download from `result_url`

        - 720P / 5 seconds typically takes 120-140 seconds; multi-subject tasks
        may take 1-5 minutes
      operationId: createWan27ReferenceToVideo
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
              $ref: '#/components/schemas/WanReferenceToVideoRequest'
            example:
              model: wan2.7-r2v
              input:
                prompt: >-
                  A girl wearing this gown walks slowly through a garden bathed
                  in sunset, the breeze gently lifting her skirt, cinematic
                  lighting
                media:
                  - type: reference_image
                    url: https://your-cdn.com/dress.png
              parameters:
                resolution: 720P
                ratio: '16:9'
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
          description: Invalid parameter or more than 5 reference assets
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
    WanReferenceToVideoRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: >-
            Model ID; for reference-to-video use wan2.7-r2v (legacy versions
            wan2.6-r2v / wan2.6-r2v-flash)
          enum:
            - wan2.7-r2v
            - wan2.6-r2v
            - wan2.6-r2v-flash
          default: wan2.7-r2v
        input:
          type: object
          required:
            - prompt
            - media
          properties:
            prompt:
              type: string
              description: >-
                Text prompt, <=5000 characters; use 'image 1/video 1' to refer
                to reference assets
              example: >-
                The reference image: a girl walking slowly through a garden
                bathed in sunset, cinematic lighting
            negative_prompt:
              type: string
              description: Negative prompt, <=500 characters
            media:
              type: array
              description: >-
                Media asset array; reference_image + reference_video total <=5,
                first_frame <=1
              items:
                type: object
                required:
                  - type
                  - url
                properties:
                  type:
                    type: string
                    description: >-
                      Media type: reference_image (reference image) /
                      reference_video (reference video) / first_frame (optional
                      first frame)
                    enum:
                      - reference_image
                      - reference_video
                      - first_frame
                  url:
                    type: string
                    description: Public https link fetchable directly with GET
                    example: https://your-cdn.com/dress.png
                  reference_voice:
                    type: string
                    description: >-
                      Optional: voice reference audio URL (wav/mp3, 1-10s) to
                      set this subject's voice
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
              example: acda59b4-3b10-4789-a5e5-edadae48adcb
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
          description: >-
            Resolution tier (uppercase); wan2.7-r2v supports 720P / 1080P,
            default 1080P
          enum:
            - 720P
            - 1080P
          default: 1080P
        ratio:
          type: string
          description: Aspect ratio; ignored automatically when a first_frame is supplied
          enum:
            - '16:9'
            - '9:16'
            - '1:1'
            - '4:3'
            - '3:4'
          default: '16:9'
        duration:
          type: integer
          description: >-
            Video duration (seconds), integer; range 2-10 with a reference
            video, 2-15 without
          minimum: 2
          maximum: 15
          default: 5
        prompt_extend:
          type: boolean
          description: Whether to enable smart prompt rewriting
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