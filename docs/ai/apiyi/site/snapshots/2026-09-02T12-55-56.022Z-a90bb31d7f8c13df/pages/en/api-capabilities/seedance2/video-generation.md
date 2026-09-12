> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.0 / 2.5 Video Generation API Reference

> Seedance 2.0 and 2.5 video generation API reference with an interactive Playground: text-to-video, first+last/first frame, multi-modal reference, video editing and extension on one async endpoint, with full polling and download code.

<Info>
  Use the Playground on the right: set **Authorization** to `Bearer sk-your-api-key` (the Token needs the `SeeDance2` group, shared by 2.5 and the 2.0 family), fill in `model` / `content`, and send. A successful submission returns a task `id`; polling and download flows are covered in the code samples below.
</Info>

<Warning>
  **About the Playground "no response received" error**: this is an async task endpoint, and clicking Send in the browser may show that message — the browser's cross-origin safety check blocked the response, but **the task was actually submitted successfully** (verify via the query endpoint below or the console logs). The Playground can also only create a task; it cannot poll or download the video. To run the full create → poll → download flow, copy and run the **code samples** below (cURL / Python / Node.js).
</Warning>

<Tip>
  This is the task-creation endpoint for Seedance 2.0. Text-to-video, first+last/first frame, and multi-modal reference-to-video all share it — the `content` array selects the mode. For model selection, pricing, the resolution/pixel table, and FAQ, see the [Seedance 2.0 Overview](/en/api-capabilities/seedance2/overview).
</Tip>

<Warning>
  * The path prefix is `/seedance/api/v3` — **do not drop the `/api` segment**, and do not use `/v1/videos`
  * The Token must have the `SeeDance2` group enabled, otherwise you get "no available channel for this model": **2.5 and the 2.0 family both use `SeeDance2`**, so one Token reaches all four models (`mini` / `fast` also have the discounted `SD2Mini` / `SD2Fast`)
  * `generate_audio` **defaults to true** (output has sound) — pass `false` explicitly for silent video
  * Python requests needs the `"Accept-Encoding": "identity"` header — without it you may hit a gzip decoding error, a truncated non-JSON body (e.g. the leading `{"` is lost and you only get `id":"cgt-xxx"}`), or intermittent 400s
  * The success status is `succeeded` (not `completed`); the video URL lives at `content.video_url` and **expires in 24 hours**
</Warning>

## Code Examples

<CodeGroup>
  ```bash cURL (text-to-video) theme={null}
  curl -X POST "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "doubao-seedance-2-0-fast-260128",
      "content": [
        {"type": "text", "text": "Drone shot flying over an autumn valley, golden forests and a winding river, cinematic"}
      ],
      "resolution": "720p",
      "ratio": "16:9",
      "duration": 5,
      "generate_audio": false
    }'
  # Returns {"id":"cgt-2026xxxx-xxxxx"} — poll the query endpoint with this id
  ```

  ```python Python (full flow: create → poll → download) theme={null}
  import time
  import requests

  BASE = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks"
  HEADERS = {
      "Authorization": "Bearer sk-your-api-key",
      "Content-Type": "application/json",
      # Required: the gateway's gzip header does not match the actual encoding.
      # Without this you may get gzip decode errors, a truncated non-JSON body
      # (e.g. id":"cgt-xxx"} with the leading {" lost), or intermittent 400s
      "Accept-Encoding": "identity",
  }

  # 1. Create the task
  body = {
      "model": "doubao-seedance-2-0-fast-260128",
      "content": [
          {"type": "text", "text": "Waves crashing on rocks at sunset, slow motion, serene mood"}
      ],
      "resolution": "720p",
      "ratio": "16:9",
      "duration": 5,
      # "generate_audio": False,  # defaults to True; uncomment for silent video
      # "seed": 12345,            # fix the seed for similar, reproducible results
  }
  task_id = requests.post(BASE, json=body, headers=HEADERS, timeout=60).json()["id"]
  print("task_id:", task_id)

  # 2. Poll until a terminal state (succeeded / failed / expired)
  while True:
      time.sleep(20)
      task = requests.get(f"{BASE}/{task_id}", headers=HEADERS, timeout=30).json()
      status = task.get("status")
      print("status:", status)
      if status in ("succeeded", "failed", "expired"):
          break

  # 3. Download the video (the URL expires in 24 h — copy it out immediately)
  if status == "succeeded":
      video_url = task["content"]["video_url"]   # note: under content, not top-level
      print("tokens:", task["usage"]["completion_tokens"])
      with requests.get(video_url, stream=True, timeout=300) as r:
          r.raise_for_status()
          with open(f"{task_id}.mp4", "wb") as f:
              for chunk in r.iter_content(chunk_size=1 << 20):
                  f.write(chunk)
      print(f"saved {task_id}.mp4")
  else:
      print("task did not succeed:", task.get("error"))
  ```

  ```python Python (first+last frame / reference modes) theme={null}
  # First + last frame: 2 images, roles required; mutually exclusive with reference mode
  body_first_last = {
      "model": "doubao-seedance-2-0-260128",
      "content": [
          {"type": "text", "text": "Smooth transition from the first frame to the last, slow camera move"},
          {"type": "image_url", "image_url": {"url": "https://example.com/first.jpg"},
           "role": "first_frame"},
          {"type": "image_url", "image_url": {"url": "https://example.com/last.jpg"},
           "role": "last_frame"},
      ],
      "resolution": "720p",
      "ratio": "adaptive",   # match the first frame's ratio to avoid cropping
      "duration": 5,
  }

  # Multi-modal reference: 0-9 reference images + 0-3 reference videos + 0-3 reference audios
  # (at least 1 image or 1 video); can create / edit / extend videos
  body_reference = {
      "model": "doubao-seedance-2-0-260128",
      "content": [
          {"type": "text", "text": "Using the reference character and style, the character walks down a rainy street at night"},
          {"type": "image_url", "image_url": {"url": "https://example.com/character.png"},
           "role": "reference_image"},
          # {"type": "video_url", "video_url": {"url": "..."}, "role": "reference_video"},
          # {"type": "audio_url", "audio_url": {"url": "..."}, "role": "reference_audio"},
      ],
      "resolution": "720p",
      "ratio": "16:9",
      "duration": 5,
  }
  # Images also accept Base64 (data:image/png;base64,xxx) and platform asset IDs (asset://xxx)
  ```

  ```python Python (Seedance 2.5: 30-second clips / video editing / video extension) theme={null}
  # 2.5 shares the endpoint and request shape with 2.0 — only `model` changes.
  # The four bodies below are capabilities unique to 2.5.

  # 1. 30-second clip: 2.5 caps at 30 s (the 2.0 family caps at 15)
  body_30s = {
      "model": "doubao-seedance-2-5-260628",
      "content": [{"type": "text", "text": "Drone shot flying over an autumn valley, morning mist drifting through the trees, one continuous take"}],
      "resolution": "720p",
      "ratio": "16:9",
      "duration": 30,        # Do not omit: on 2.5 the default is -1 and the model picks its own length
  }

  # 2. Video editing: ratio must be adaptive, duration must be -1, source video 4-30 s
  body_edit = {
      "model": "doubao-seedance-2-5-260628",
      "content": [
          # The prompt needs an editing verb: add / remove / delete / change / replace
          {"type": "text", "text": "Add a few birds flying across @video1"},
          {"type": "video_url", "video_url": {"url": "https://example.com/source.mp4"},
           "role": "reference_video"},
      ],
      "resolution": "720p",
      "ratio": "adaptive",                    # Required; a concrete ratio returns a synchronous 400
      "duration": -1,                         # Required; a concrete duration returns a synchronous 400
      "omni_reference_task_type": "edit",     # Declare it to validate at submission time
      "output_format": "mov",                 # Optional: mov is recommended for post (some players cannot open it)
  }

  # 3. Video extension: ratio must be adaptive
  body_extend = {
      "model": "doubao-seedance-2-5-260628",
      "content": [
          # The prompt needs an extension verb: extend / continue
          {"type": "text", "text": "Extend @video1 forward, camera keeps pushing in as the light fades"},
          {"type": "video_url", "video_url": {"url": "https://example.com/source.mp4"},
           "role": "reference_video"},
      ],
      "resolution": "720p",
      "ratio": "adaptive",
      "omni_reference_task_type": "extend",
  }

  # 4. Audio-only reference: unique to 2.5; the 2.0 family requires an image or video alongside audio
  body_audio_only = {
      "model": "doubao-seedance-2-5-260628",
      "content": [
          {"type": "text", "text": "Abstract light and shadow pulsing to the rhythm of @audio1"},
          {"type": "audio_url", "audio_url": {"url": "https://example.com/track.mp3"},
           "role": "reference_audio"},
      ],
      "resolution": "720p",
      "ratio": "16:9",
      "duration": 5,
  }
  # Submission and polling are identical to the flow above.
  ```

  ```javascript Node.js (fetch) theme={null}
  const BASE = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks";
  const HEADERS = {
    "Authorization": "Bearer sk-your-api-key",
    "Content-Type": "application/json",
  };

  // 1. Create the task
  const { id } = await fetch(BASE, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      model: "doubao-seedance-2-0-fast-260128",
      content: [{ type: "text", text: "A mountain lake reflecting the starry sky, time-lapse" }],
      resolution: "720p",
      ratio: "9:16",        // portrait costs the same as landscape
      duration: 5,
    }),
  }).then(r => r.json());
  console.log("task_id:", id);

  // 2. Poll until a terminal state
  let task;
  do {
    await new Promise(r => setTimeout(r, 20000));
    task = await fetch(`${BASE}/${id}`, { headers: HEADERS }).then(r => r.json());
    console.log("status:", task.status);
  } while (!["succeeded", "failed", "expired"].includes(task.status));

  // 3. The video link (expires in 24 h — re-host immediately)
  if (task.status === "succeeded") console.log(task.content.video_url);
  ```

  ```bash cURL (poll a task) theme={null}
  curl "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks/cgt-2026xxxx-xxxxx" \
    -H "Authorization: Bearer sk-your-api-key"
  ```
</CodeGroup>

## Parameter Reference

| Parameter                  | Type   | Required | Default                            | Notes                                                                                                                                                                                                                                                                                                 |
| -------------------------- | ------ | -------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`                    | string | ✓        | —                                  | `doubao-seedance-2-5-260628` (**2.5, recommended** — 1080p, up to 30 s) / `doubao-seedance-2-0-260128` (standard, 1080p) / `doubao-seedance-2-0-fast-260128` (fast, up to 720p) / `doubao-seedance-2-0-mini-260615` (mini/lite, up to 720p, about half the standard price). Plain ID, no `ep-` prefix |
| `content`                  | array  | ✓        | —                                  | Input array — see "Generation modes" below                                                                                                                                                                                                                                                            |
| `resolution`               | string |          | `720p`                             | `480p` / `720p` / `1080p` (1080p on 2.5 and standard only; fast and mini cap at 720p). **No model supports `4k`**                                                                                                                                                                                     |
| `ratio`                    | string |          | `adaptive`                         | `16:9` / `4:3` / `1:1` / `3:4` / `9:16` / `21:9` / `adaptive`; every ratio in a tier costs the same                                                                                                                                                                                                   |
| `duration`                 | int    |          | `-1` on 2.5, `5` on the 2.0 family | Whole seconds **4-30** on 2.5, 4-15 on the 2.0 family; `-1` lets the model choose (billed by actual output). **On 2.5 the default is `-1`** — omit it and the model picks the length, changing what you pay                                                                                           |
| `generate_audio`           | bool   |          | `true`                             | Synchronized audio (voice/SFX/music, mono)                                                                                                                                                                                                                                                            |
| `watermark`                | bool   |          | `false`                            | Adds an AI-generated watermark                                                                                                                                                                                                                                                                        |
| `seed`                     | int    |          | `-1`                               | \[-1, 2^32-1]; same seed gives similar (not identical) results                                                                                                                                                                                                                                        |
| `return_last_frame`        | bool   |          | `false`                            | Returns a watermark-free last-frame png for clip chaining                                                                                                                                                                                                                                             |
| `execution_expires_after`  | int    |          | `172800`                           | Task expiry threshold in seconds, range \[3600, 259200]                                                                                                                                                                                                                                               |
| `output_format`            | string |          | `mp4`                              | **2.5 only**: `mp4` (universal) or `mov` (QuickTime, H.264 + yuv444p + PCM — better colour fidelity for post-production; some players cannot open it)                                                                                                                                                 |
| `omni_reference_task_type` | string |          | `auto`                             | **2.5 only**: `auto` / `edit` (video editing) / `extend` (video extension). Declaring it explicitly moves the constraint check **to submission time**, so you get a 400 immediately instead of a task that fails minutes later                                                                        |

<Warning>
  Neither Seedance 2.5 nor the 2.0 family supports `frames` or `camera_fixed` — those are Seedance 1.x parameters and will be ignored or rejected.

  **Task-type constraints unique to 2.5** (violations return `InvalidParameter.TaskTypeConstraint` at submission, not billed):

  | Task type                          | `ratio`                | `duration`                                             |
  | ---------------------------------- | ---------------------- | ------------------------------------------------------ |
  | Text-to-video / reference-to-video | unrestricted           | unrestricted                                           |
  | First frame / first+last frame     | **must be `adaptive`** | unrestricted                                           |
  | Video editing                      | **must be `adaptive`** | **must be `-1`**, and the source video must run 4-30 s |
  | Video extension                    | **must be `adaptive`** | unrestricted                                           |
</Warning>

### Generation modes (content combinations)

| Mode                           | content items                                                                                                                                                        | role values                                                  |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Text-to-video                  | 1 `text`                                                                                                                                                             | —                                                            |
| First + last frame             | optional text + 2 `image_url`                                                                                                                                        | required: `first_frame` / `last_frame`                       |
| First frame                    | optional text + 1 `image_url`                                                                                                                                        | `first_frame` or omitted                                     |
| Multi-modal reference-to-video | text + reference assets (2.5: up to 30 `image_url` + 10 `video_url` + 10 `audio_url`; 2.0 family: 0-9 images + 0-3 videos + 0-3 audios, at least 1 image or 1 video) | `reference_image` / `reference_video` / `reference_audio`    |
| Video editing (**2.5 only**)   | text with an editing verb + at least 1 `video_url`                                                                                                                   | `reference_video`, with `omni_reference_task_type: "edit"`   |
| Video extension (**2.5 only**) | text with an extension verb + at least 1 `video_url`                                                                                                                 | `reference_video`, with `omni_reference_task_type: "extend"` |

The three image modes are **mutually exclusive**. Images accept public URLs, Base64 (`data:image/png;base64,...`), and asset IDs (`asset://...`). Inputs containing real human faces are rejected. For end-to-end asset-reference code (ingest → `asset://` → generate → download), see the [Asset Reference Guide](/en/api-capabilities/seedance2/asset-reference).

**Inlining large media slows down task creation.** The time spent uploading Base64 payloads or fetching large image URLs all lands in the submission phase, which can stretch a create-task call from about a second to tens of seconds — or into a client read timeout. When a request carries images or video, ingest the media first and reference it as an `asset://` asset ID: see [Asset-First Workflow](/en/api-capabilities/seedance2/asset-first-workflow).

**Reference limits differ by generation**: 2.5 takes 30 images + 10 videos + 10 audio clips, and **audio may be the only reference**; the 2.0 family takes 9 images + 3 videos + 3 audio clips, and audio must be sent together with at least one image or video.

**Editing and extension are triggered by prompt intent** — `omni_reference_task_type` only moves the validation earlier. Refer to assets positionally in the prompt (`@video1`, `@image1`) in the order you passed them; editing needs a verb like add / remove / change / replace, extension needs extend / continue. If the task type the model infers from the prompt contradicts what you declared, the task fails asynchronously with `InvalidParameter.TaskTypeMismatch`.

## Response Format

Creation returns only the task ID (**not the video**):

```json theme={null}
{ "id": "cgt-20260606160057-6bbjd" }
```

Once you have the `id`, poll `GET /seedance/api/v3/contents/generations/tasks/{id}` for the task status.

### Recommended polling cadence

| Item          | Recommended                                               | Why                                                                                        |
| ------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| First check   | **20–30 s** after submitting                              | Anything earlier is guaranteed to return `queued` — a wasted request                       |
| Poll interval | Every **10–20 s**                                         | Generation is a minutes-long job; sub-second polling gains nothing and may hit rate limits |
| Timeout       | Treat **10 minutes** without a terminal state as abnormal | Relax to 15 minutes during peak queueing, or let `execution_expires_after` be the backstop |

Measured end-to-end latency (queueing included). 2.0 family at 720p: about **90–140 s** for a 5-second clip, **170 s** for 15 seconds. 2.5: about **150 s** at 720p/5s, **330 s** at 720p/30s, **150 s** at 1080p/5s. Higher resolution and longer duration are slower, and peak-hour queueing stretches this further. The code samples below use a fixed 20-second interval — good enough, with a predictable request count.

A successful task looks like this (real sample from our tests):

```json theme={null}
{
  "id": "cgt-20260606160057-6bbjd",
  "model": "doubao-seedance-2-0-fast-260128",
  "status": "succeeded",
  "content": {
    "video_url": "https://ark-acg-cn-beijing.tos-cn-beijing.volces.com/....mp4?X-Tos-Expires=86400&..."
  },
  "usage": { "completion_tokens": 108900, "total_tokens": 108900 },
  "created_at": 1780732857,
  "updated_at": 1780732991,
  "seed": 97151,
  "resolution": "720p",
  "ratio": "16:9",
  "duration": 5,
  "framespersecond": 24,
  "generate_audio": true,
  "draft": false
}
```

<Warning>
  * The video URL is at **`content.video_url`**, not top-level; it is a signed link that **expires in 24 hours** — download immediately
  * State machine: `queued → running → succeeded / failed / expired`; success is **`succeeded`**
  * Download the link with a plain GET — **do not send the `Authorization` header** to the signed URL
</Warning>

<Info>
  `usage.completion_tokens` is the billed token count and follows `tokens ≈ duration × width × height × 24 / 1024` (within 0.1% in our tests). With `duration: -1` or `ratio: adaptive`, the actual length and ratio are reported in the response's `duration` / `ratio` fields.
</Info>


## OpenAPI

````yaml api-reference/seedance2-video-openapi-en.yaml POST /seedance/api/v3/contents/generations/tasks
openapi: 3.1.0
info:
  title: Seedance 2.0 Video Generation API
  description: >
    ByteDance Seedance 2.0 video generation (official Volcengine Mainland China
    resource).


    Capabilities:

    - Text-to-video / image-to-video (first+last frame, first frame) /
    multi-modal reference-to-video (0-9 reference images + 0-3 reference videos
    + 0-3 reference audios, at least 1 image or 1 video)

    - Resolutions 480p / 720p / 1080p (fast model caps at 720p), 6 aspect ratios
    plus adaptive; all ratios in the same tier share the same pixel area and
    price

    - Duration 4-15 s (or -1 for model-chosen length), fixed 24 fps,
    synchronized audio ON by default (generate_audio defaults to true)

    - Async task flow: create returns a task id, poll GET
    /seedance/api/v3/contents/generations/tasks/{id} until succeeded, then
    download from content.video_url (expires in ~24 hours)


    Authentication: Bearer Token (Pay-as-you-go Priority billing model; the
    Token needs the matching group: SeeDance25 for 2.5, SeeDance2 for the 2.0
    family).

    Get your key from the APIYI console → Token management.
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
  - url: https://vip.apiyi.com
    description: Backup endpoint
security:
  - bearerAuth: []
paths:
  /seedance/api/v3/contents/generations/tasks:
    post:
      tags:
        - Video Generation
      summary: Create a Seedance 2.0 video generation task
      description: >
        Async endpoint: returns a task `id` immediately — **not the video
        itself**.


        - Required: `model` + `content` (text only, text+images,
        text+images+video+audio, etc.)

        - The three image modes are mutually exclusive: first+last frame (2
        images, role required) / first frame (1 image) / multi-modal
        reference-to-video (0-9 images + 0-3 videos + 0-3 audios, at least 1
        image or 1 video, image role = reference_image)

        - Inputs containing real human faces are rejected; audio must be sent
        together with at least one image or video

        - `frames` / `camera_fixed` are NOT supported (Seedance 1.x only)

        - Billing is pre-charged on submit and settled on completion; rejected
        requests are not billed


        After creation, poll `GET
        /seedance/api/v3/contents/generations/tasks/{id}`.

        Status flow: `queued → running → succeeded / failed / expired`.

        On success, download the mp4 from `content.video_url` (expires in ~24
        hours).

        See the "Seedance 2.0 Overview" doc for details.
      operationId: createSeedance2VideoTaskEn
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Seedance2CreateTaskRequest'
            example:
              model: doubao-seedance-2-5-260628
              content:
                - type: text
                  text: >-
                    Drone shot flying over an autumn valley, golden forests and
                    a winding river, cinematic
              resolution: 720p
              ratio: '16:9'
              duration: 5
              generate_audio: false
      responses:
        '200':
          description: Task created. Returns the task ID for polling
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Seedance2TaskCreated'
              example:
                id: cgt-20260606160057-6bbjd
        '400':
          description: >-
            InvalidParameter — e.g. 1080p with the fast model, duration outside
            4-15, or an unsupported ratio. The error message names the offending
            parameter; not billed
        '401':
          description: Unauthorized - invalid API key
        '403':
          description: Content moderation rejection (real human faces, policy violations)
        '429':
          description: Rate limited or insufficient quota
        '500':
          description: Internal server error
      security:
        - bearerAuth: []
components:
  schemas:
    Seedance2CreateTaskRequest:
      type: object
      required:
        - model
        - content
      properties:
        model:
          type: string
          description: >-
            Model ID (plain ID, no ep- prefix). 2.5 supports 1080p, 4-30 s, and
            up to 30 images + 10 videos + 10 audio clips as references; 2.0
            standard supports 1080p; fast and mini cap at 720p, with mini at
            about half the standard price. No model supports 4k
          enum:
            - doubao-seedance-2-5-260628
            - doubao-seedance-2-0-260128
            - doubao-seedance-2-0-fast-260128
            - doubao-seedance-2-0-mini-260615
          example: doubao-seedance-2-5-260628
        content:
          type: array
          description: >-
            Input array. Text-to-video: a single text item. Image-to-video: add
            image_url items (role: first_frame / last_frame). Multi-modal
            reference-to-video: image_url items (role: reference_image) plus
            optional video_url / audio_url. Reference limits: 2.5 allows 30
            images + 10 videos + 10 audio clips and audio may stand alone; the
            2.0 family allows 9 images + 3 videos + 3 audio clips and needs at
            least 1 image or 1 video. The three image modes are mutually
            exclusive
          items:
            type: object
            properties:
              type:
                type: string
                description: Content type
                enum:
                  - text
                  - image_url
                  - video_url
                  - audio_url
                example: text
              text:
                type: string
                description: >-
                  Prompt (required when type=text). Up to ~1000 English words;
                  put spoken lines in double quotes to improve generated
                  voice-over
                example: Waves crashing on rocks at sunset, slow motion, serene mood
              image_url:
                type: object
                description: >-
                  Image object (required when type=image_url). Accepts public
                  URL, Base64 (data:image/png;base64,...), or asset ID
                  (asset://...). Formats jpeg/png/webp/bmp/tiff/gif/heic/heif;
                  aspect ratio (0.4, 2.5); sides (300, 6000) px; under 30 MB
                  each. Real human faces are not allowed
                properties:
                  url:
                    type: string
                    description: Image URL / Base64 / asset:// ID
                    example: https://example.com/first.jpg
              video_url:
                type: object
                description: >-
                  Reference video object (required when type=video_url);
                  multi-modal reference mode only
                properties:
                  url:
                    type: string
                    description: Video URL
              audio_url:
                type: object
                description: >-
                  Reference audio object (required when type=audio_url).
                  wav/mp3, 2-15 s per clip, up to 3 clips and 15 s total; must
                  accompany at least one image or video
                properties:
                  url:
                    type: string
                    description: Audio URL
              role:
                type: string
                description: >-
                  Media role. Required for first+last frame
                  (first_frame/last_frame); optional for a single first frame;
                  reference media use reference_*
                enum:
                  - first_frame
                  - last_frame
                  - reference_image
                  - reference_video
                  - reference_audio
        resolution:
          type: string
          description: >-
            Resolution tier (defines pixel area — every ratio in a tier costs
            the same). 1080p is available on 2.5 and 2.0 standard only; fast and
            mini cap at 720p. No model supports 4k
          enum:
            - 480p
            - 720p
            - 1080p
          default: 720p
        ratio:
          type: string
          description: >-
            Aspect ratio. adaptive auto-fits the input (recommended for
            image-to-video to avoid cropping); the actual ratio is returned in
            the task's ratio field
          enum:
            - '16:9'
            - '4:3'
            - '1:1'
            - '3:4'
            - '9:16'
            - '21:9'
            - adaptive
          default: adaptive
        duration:
          type: integer
          description: >-
            Video length in whole seconds: 4-30 on 2.5, 4-15 on the 2.0 family;
            or -1 to let the model choose (billed by actual output). Cost scales
            linearly with duration. Note the default is -1 on 2.5 and 5 on the
            2.0 family
          default: 5
          example: 5
        generate_audio:
          type: boolean
          description: >-
            Generate synchronized audio (voice, SFX, background music; mono).
            Note it DEFAULTS TO TRUE — pass false explicitly for silent video
          default: true
        watermark:
          type: boolean
          description: Add an AI-generated watermark in the bottom-right corner
          default: false
        seed:
          type: integer
          description: >-
            Random seed, [-1, 2^32-1]. The same seed produces similar (not
            identical) results; -1 means random
          default: -1
        return_last_frame:
          type: boolean
          description: >-
            Return the last frame as a watermark-free png (same dimensions as
            the video) — chain it as the first frame of the next task to produce
            continuous multi-clip videos
          default: false
        execution_expires_after:
          type: integer
          description: >-
            Task expiry threshold in seconds; tasks exceeding it are marked
            expired. Range [3600, 259200]
          default: 172800
        output_format:
          type: string
          description: >-
            Output container, supported on doubao-seedance-2-5-260628 only. mov
            is a QuickTime container (H.264 + yuv444p + PCM) with better colour
            fidelity for post-production, but some players cannot open it
          enum:
            - mp4
            - mov
          default: mp4
        omni_reference_task_type:
          type: string
          description: >-
            Task type for omni-reference generation, supported on
            doubao-seedance-2-5-260628 only. Declaring edit or extend validates
            constraints up front: video editing requires ratio=adaptive and
            duration=-1, video extension requires ratio=adaptive; violations
            return InvalidParameter.TaskTypeConstraint at submission
          enum:
            - auto
            - edit
            - extend
          default: auto
    Seedance2TaskCreated:
      type: object
      description: >-
        Creation response. Poll GET
        /seedance/api/v3/contents/generations/tasks/{id}; on success the video
        URL is at content.video_url (expires in ~24 h) and billed tokens at
        usage.completion_tokens
      properties:
        id:
          type: string
          description: Video generation task ID (kept for 7 days)
          example: cgt-20260606160057-6bbjd
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: >-
        API key from the APIYI console (SeeDance25 group for 2.5, SeeDance2
        group for the 2.0 family)

````