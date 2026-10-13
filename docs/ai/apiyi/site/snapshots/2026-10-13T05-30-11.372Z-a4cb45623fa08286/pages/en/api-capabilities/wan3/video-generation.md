> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan3.0 Video Generation API Reference

> Wan3.0 video generation API reference and live Playground: one model ID covers text-to-video, image-to-video, reference-to-video and video editing, up to 30 seconds, 480P-1080P, DashScope async passthrough endpoint.

<Info>
  Use the Playground on the right to test directly: put `Bearer sk-your-api-key` in **Authorization**, fill in `model` / `input` / `parameters`, and send. A successful submit returns a `task_id`; polling and download are covered below.
</Info>

<Tip>
  Wan3.0 covers **every mode through one model ID** — what you send as media decides what it does. The full async workflow, status table, billing rules and Python client live in the [Wan3.0 overview](/en/api-capabilities/wan3/overview).
</Tip>

<Warning>
  * Create requests must go to `/wan/api/v1/services/aigc/video-generation/video-synthesis` with the `X-DashScope-Async: enable` header. **Do not use `/v1/videos`** (media fields are dropped and billing is inaccurate).
  * `duration` must be an **integer** (`5`, not `"5"`); write `resolution` in **uppercase** (`720P`).
  * Terminal states are `completed` / `failed`, **not** `SUCCEEDED`.
</Warning>

## Four modes, one field

| Mode | What to put in `media` |
| - | - |
| Text-to-video | Omit `media` |
| Image-to-video | `[{ "type": "first_frame", "url": "..." }]` |
| First/last-frame video | `first_frame` + `last_frame` |
| Reference-to-video | `reference_image` / `reference_video` / `reference_audio` (can be mixed) |

<Warning>
  `first_frame` / `last_frame` **cannot** be mixed with `reference_*` / `file` / `link`.
</Warning>

## Code samples

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis" \
    -H "X-DashScope-Async: enable" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "wan3.0-video",
      "input": {
        "prompt": "A lighthouse by the sea at dusk, slow dolly-in, waves on the rocks, cinematic lighting"
      },
      "parameters": {
        "resolution": "720P",
        "ratio": "16:9",
        "duration": 5,
        "prompt_extend": true
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
      "model": "wan3.0-video",
      "input": {"prompt": "A lighthouse by the sea at dusk, slow dolly-in, waves on the rocks"},
      "parameters": {"resolution": "720P", "ratio": "16:9", "duration": 5, "prompt_extend": True},
  }

  resp = requests.post(url, json=body, headers=headers, timeout=30)
  task_id = resp.json()["output"]["task_id"]
  print("task_id:", task_id)
  ```

  ```javascript Node.js theme={null}
  const res = await fetch(
    "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer sk-your-api-key",
        "Content-Type": "application/json",
        "X-DashScope-Async": "enable",
      },
      body: JSON.stringify({
        model: "wan3.0-video",
        input: { prompt: "A lighthouse by the sea at dusk, slow dolly-in, waves on the rocks" },
        parameters: { resolution: "720P", ratio: "16:9", duration: 5, prompt_extend: true },
      }),
    }
  );
  const data = await res.json();
  console.log("task_id:", data.output.task_id);
  ```
</CodeGroup>

### Image-to-video (first frame)

```json theme={null}
{
  "model": "wan3.0-video",
  "input": {
    "prompt": "The cat turns toward the camera and blinks",
    "media": [{ "type": "first_frame", "url": "https://example.com/cat.jpg" }]
  },
  "parameters": { "resolution": "720P", "duration": 5 }
}
```

### Reference-to-video (reference image + reference video)

```json theme={null}
{
  "model": "wan3.0-video-prime",
  "input": {
    "prompt": "Replace the person in video 1 with the person in image 1, keep everything else",
    "media": [
      { "type": "reference_image", "url": "https://example.com/person.jpg" },
      { "type": "reference_video", "url": "https://example.com/source.mp4" }
    ]
  },
  "parameters": { "resolution": "720P", "ratio": "9:16", "duration": 5 }
}
```

<Warning>
  **Reference video duration is billed.** In the example above, a 10-second reference with a 5-second output bills **15 seconds**. Input + output is capped at 30 seconds. See [billing rules](/en/api-capabilities/wan3/overview#%EF%B8%8F-billing-rules-different-from-other-video-models).
</Warning>

## Polling and download

```bash theme={null}
# Poll every 5-10 seconds (never below 3)
curl "https://api.apiyi.com/v1/tasks/$TASK_ID" \
  -H "Authorization: Bearer sk-your-api-key"

# Download: result_url is a signed OSS link - do not send Authorization
curl -o out.mp4 "$RESULT_URL"
```

| Status | Meaning | Next step |
| - | - | - |
| `submitted` | Queued | Keep polling |
| `in_progress` | Generating | Keep polling |
| `completed` | Done | Download from `result_url` |
| `failed` | Failed | Check `error.message`; **not billed** |

## Price at a glance

The default rate is **98% of Alibaba's official price**; with the highest [top-up bonus](/en/faq/recharge-promotions) it drops to **\~81.7%**.

| Model | Resolution | Default | With 10% bonus | **With 20% bonus** | 20%-bonus price in CNY |
| - | - | - | - | - | - |
| `wan3.0-video` | 480P | \$0.0294/sec | \$0.0267/sec | **\$0.0245/sec** | ¥0.1715/sec |
| `wan3.0-video` | 720P | \$0.0588/sec | \$0.0535/sec | **\$0.049/sec** | ¥0.343/sec |
| `wan3.0-video` | 1080P | \$0.1176/sec | \$0.1069/sec | **\$0.098/sec** | ¥0.686/sec |
| `wan3.0-video-prime` | 480P | \$0.063/sec | \$0.0573/sec | **\$0.0525/sec** | ¥0.3675/sec |
| `wan3.0-video-prime` | 720P | \$0.126/sec | \$0.1145/sec | **\$0.105/sec** | ¥0.735/sec |
| `wan3.0-video-prime` | 1080P | \$0.252/sec | \$0.2291/sec | **\$0.21/sec** | ¥1.47/sec |

<Note>Prices match the provider's official rates and may change along with them; the table above is for reference only, and the **Model Pricing** tab in the top navigation is authoritative: [Model Pricing](/en/models/index).</Note>

<Card title="Full parameters, billing rules and best practices" icon="book-open" href="/en/api-capabilities/wan3/overview">
  Wan3.0 overview
</Card>


## OpenAPI

````yaml api-reference/wan3-video-openapi-en.yaml POST /wan/api/v1/services/aigc/video-generation/video-synthesis
openapi: 3.1.0
info:
  title: Wan3.0 Video Generation API
  description: >
    Alibaba Tongyi Wanxiang Wan3.0 video generation — one model ID covers
    text-to-video, image-to-video, reference-to-video and video editing.
    DashScope async passthrough endpoint.


    - Create requests must carry the `X-DashScope-Async: enable` header

    - Async task endpoint: this call only submits the job and returns a
    `task_id`. Poll `GET /v1/tasks/{task_id}`, then download the mp4 from
    `result_url`

    - Terminal states are `completed` / `failed`, **not** DashScope's native
    `SUCCEEDED`

    - `result_url` is a signed Alibaba OSS link — **do not send the
    Authorization header** when downloading. Valid for 24 hours

    - **Do not use `/v1/videos`** to submit Wan video jobs (media fields are
    dropped and billing is inaccurate)


    **Billing**: per second. Billed seconds = input reference video duration +
    output video duration; the unit price follows the output resolution.
    Reference images / audio / files are free. Input + output is capped at 30
    seconds. Failed tasks are fully refunded.


    **Authentication**: add `Authorization: Bearer YOUR_API_KEY` to the request
    headers


    **Get an API Key**: create one in the APIYI console at `api.apiyi.com/token`
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
security:
  - bearerAuth: []
paths:
  /wan/api/v1/services/aigc/video-generation/video-synthesis:
    post:
      tags:
        - Video Generation
      summary: 'Video generation: create a Wan3.0 video task'
      description: >
        Submits an asynchronous Wan3.0 video job and returns a `task_id` with
        `task_status: "PENDING"`.


        - Required: `model`, `input.prompt`, and the `X-DashScope-Async: enable`
        header

        - The mode is decided by `input.media[]`: omit it for text-to-video;
        `first_frame` for image-to-video; `reference_image` / `reference_video`
        for reference-to-video

        - `first_frame` / `last_frame` cannot be mixed with `reference_*` /
        `file` / `link`

        - **The response contains no video file** — poll `GET
        /v1/tasks/{task_id}` until `status: "completed"`, then download from
        `result_url`

        - Typical latency for a 5-second clip: ~100 sec at 480P, ~120 sec at
        720P, ~170 sec at 1080P
      operationId: createWan30Video
      parameters:
        - name: X-DashScope-Async
          in: header
          required: true
          description: >-
            Async switch. Must be set to enable, otherwise the upstream returns:
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
              $ref: '#/components/schemas/Wan30VideoRequest'
            example:
              model: wan3.0-video
              input:
                prompt: >-
                  A lighthouse by the sea at dusk, slow dolly-in, waves on the
                  rocks, seagulls, cinematic lighting
              parameters:
                resolution: 720P
                ratio: '16:9'
                duration: 5
                prompt_extend: true
      responses:
        '200':
          description: Task created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Wan30VideoResponse'
              example:
                output:
                  task_id: 9db29626-79fc-40d1-b9c2-c6b0caf8ac15
                  task_status: PENDING
                request_id: e616d8c9-1147-9ecd-b2b5-abbbe89a4642
        '400':
          description: Invalid request parameters
        '401':
          description: 'Authentication failed: invalid API key'
        '403':
          description: >-
            Forbidden: the key group does not include Wan&HappyHorse, or the key
            is on per-call billing
      security:
        - bearerAuth: []
components:
  schemas:
    Wan30VideoRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          enum:
            - wan3.0-video
            - wan3.0-video-prime
          default: wan3.0-video
          description: >-
            Model ID. wan3.0-video is the standard variant; wan3.0-video-prime
            is the faster Prime variant at a higher unit price
        input:
          $ref: '#/components/schemas/Wan30Input'
        parameters:
          $ref: '#/components/schemas/Wan30Parameters'
    Wan30VideoResponse:
      type: object
      properties:
        output:
          type: object
          properties:
            task_id:
              type: string
              description: Task ID, used for polling GET /v1/tasks/{task_id}
            task_status:
              type: string
              description: Always PENDING at submit time
        request_id:
          type: string
          description: Upstream request ID
    Wan30Input:
      type: object
      required:
        - prompt
      properties:
        prompt:
          type: string
          description: >-
            Natural-language description. With multiple assets, refer to them as
            image 1 / video 1 in the prompt
          example: A lighthouse by the sea at dusk, slow dolly-in, waves on the rocks
        negative_prompt:
          type: string
          description: Negative prompt
        media:
          type: array
          description: >-
            Media asset array. Omit for text-to-video. first_frame / last_frame
            cannot be mixed with reference_* / file / link
          items:
            $ref: '#/components/schemas/Wan30Media'
    Wan30Parameters:
      type: object
      properties:
        resolution:
          type: string
          enum:
            - 480P
            - 720P
            - 1080P
          default: 1080P
          description: >-
            Output resolution (uppercase). Determines the unit price — set it
            explicitly
        ratio:
          type: string
          enum:
            - '16:9'
            - '9:16'
            - '1:1'
            - '4:3'
            - '3:4'
            - adaptive
          description: Aspect ratio. Ignored when a first frame is supplied
        duration:
          type: integer
          description: >-
            Output length in whole seconds. Defaults to 5. Input reference video
            duration + output duration must not exceed 30 seconds
          example: 5
        prompt_extend:
          type: boolean
          default: true
          description: Prompt rewriting. Keep it true
        audio:
          type: boolean
          default: true
          description: Whether to output an audio track. Enabled by default
        watermark:
          type: boolean
          default: false
          description: AI generated watermark in the lower-right corner
        seed:
          type: integer
          minimum: 0
          maximum: 2147483647
          description: Random seed. Fixing it improves reproducibility
    Wan30Media:
      type: object
      required:
        - type
        - url
      properties:
        type:
          type: string
          enum:
            - first_frame
            - last_frame
            - reference_image
            - reference_video
            - reference_audio
            - file
            - link
          description: >-
            Asset type. reference_video duration counts toward billed seconds;
            all other assets are free
        url:
          type: string
          format: uri
          description: >-
            A publicly reachable https link that must stay available until the
            task completes
          example: https://example.com/first-frame.jpg
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 'APIYI API key, format: Bearer sk-your-api-key'

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.