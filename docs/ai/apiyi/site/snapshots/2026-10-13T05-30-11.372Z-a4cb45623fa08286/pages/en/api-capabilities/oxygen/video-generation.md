> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Oxygen Video Generation API Reference

> Oxygen (oxygen-1.0) video generation API reference and live Playground: OpenAI Videos compatible, submit with POST /v1/videos and query with GET /v1/videos/{id}, first/last-frame and reference media via an envelope, billed per second.

<Info>
  The interactive Playground on the right lets you test calls live. Enter your API key under **Authorization** (format `Bearer sk-xxx`), fill in `prompt`, `seconds`, and `size`, and send. The response is a task `id`; fetch the video with the query endpoint below.
</Info>

<Tip>
  **One endpoint, four modes**: `prompt` only = text-to-video; one image in `input_reference` = first-frame video; a JSON envelope in `input_reference` = first-and-last-frame or reference media video, and the envelope can also select 320p or 1:1. See the [Oxygen Overview](/en/api-capabilities/oxygen/overview) for the full picture.
</Tip>

<Warning>
  **⚠️ The four most common mistakes**

  1. **Always pass `size`**: without it the gateway defaults to `720x1280` and you get portrait output
  2. **Put advanced parameters in the `input_reference` envelope**: only `model`, `prompt`, `seconds`, `size`, and `input_reference` take effect at the top level; `last_image`, `reference_images`, `resolution`, and `aspect_ratio` placed there are **silently dropped** with no error
  3. **`input_reference` must be a string**: serialize the envelope with `json.dumps` / `JSON.stringify` first; passing an object or array is rejected
  4. **Set the length only with top-level `seconds`** (4–15); `duration` inside the envelope returns 400
</Warning>

## Code Examples

### Python (requests · submit + poll + download)

```python theme={null}
import os
import time
import requests

API_KEY = os.environ["APIYI_API_KEY"]
BASE = "https://api.apiyi.com/v1/videos"
HEADERS = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

# Step 1: submit the task
payload = {
    "model": "oxygen-1.0",
    "prompt": "A paper boat drifting on a calm pond, soft morning light",
    "seconds": "4",          # 4–15, billed per second
    "size": "1280x720",      # always pass it: 1280x720 = 480p landscape
}
r = requests.post(BASE, headers=HEADERS, json=payload, timeout=60)
r.raise_for_status()
video_id = r.json()["id"]
print("id:", video_id)

# Step 2: poll (usually 1–3 minutes, wait up to 15 minutes)
deadline = time.time() + 900
while time.time() < deadline:
    job = requests.get(f"{BASE}/{video_id}", headers=HEADERS, timeout=30).json()
    print(job["status"], job.get("progress"))
    if job["status"] == "completed":
        video_url = job["video_url"]
        break
    if job["status"] == "failed":
        # Failed tasks are refunded automatically; error has the reason
        raise RuntimeError(job.get("error"))
    time.sleep(5)
else:
    raise TimeoutError(video_id)

# Step 3: download video_url directly (no auth header; valid ~24 hours, store it promptly)
with requests.get(video_url, stream=True, timeout=300) as v, open("output.mp4", "wb") as f:
    v.raise_for_status()
    for chunk in v.iter_content(1 << 16):
        f.write(chunk)
print("Saved: output.mp4")
```

### Python (first-frame video · request body)

```python theme={null}
payload = {
    "model": "oxygen-1.0",
    "prompt": "The glass sphere rolls slowly across the table",
    "seconds": "4",
    "size": "1280x720",      # sets the resolution (480p); aspect ratio follows the first frame
    "input_reference": "https://your-cdn.example.com/first.png",  # a data:image/...;base64,... URI also works
}
```

### Python (first and last frame / reference media · JSON envelope)

```python theme={null}
import json

# First and last frame: the envelope is a JSON string, json.dumps it into input_reference
envelope = {
    "images": ["https://your-cdn.example.com/first.png"],   # first frame (max 1)
    "last_image": "https://your-cdn.example.com/last.png",  # last frame
}
payload = {
    "model": "oxygen-1.0",
    "prompt": "The glass sphere slowly dissolves into a deep blue abstract wave",
    "seconds": "5",
    "size": "1280x720",
    "input_reference": json.dumps(envelope),
}

# Reference media + portrait + 320p (reference media cannot be mixed with first/last frames)
envelope = {
    "reference_images": ["https://your-cdn.example.com/character.png"],   # up to 9
    "reference_videos": ["https://your-cdn.example.com/motion.mp4"],      # up to 3, https only
    "aspect_ratio": "9:16",
    "resolution": "320p",    # resolution in the envelope wins over size
}
payload = {
    "model": "oxygen-1.0",
    "prompt": "The character from the reference image dances following the reference video",
    "seconds": "8",
    "size": "720x1280",
    "input_reference": json.dumps(envelope),
}
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/videos" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  --max-time 60 \
  -d '{
    "model": "oxygen-1.0",
    "prompt": "A lighthouse at dusk, waves crashing on the rocks",
    "seconds": "4",
    "size": "1792x1024"
  }'
```

First and last frame (note that the value of `input_reference` is an escaped JSON string):

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/videos" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "oxygen-1.0",
    "prompt": "The glass sphere slowly dissolves into a deep blue abstract wave",
    "seconds": "5",
    "size": "1280x720",
    "input_reference": "{\"images\":[\"https://your-cdn.example.com/first.png\"],\"last_image\":\"https://your-cdn.example.com/last.png\"}"
  }'
```

### Node.js (native fetch)

```javascript theme={null}
const API_KEY = process.env.APIYI_API_KEY;
const BASE = 'https://api.apiyi.com/v1/videos';
const headers = { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' };

const submit = await fetch(BASE, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    model: 'oxygen-1.0',
    prompt: 'Aurora drifting over snowy mountains, time-lapse feel',
    seconds: '8',
    size: '1280x720',
    // Advanced parameters: JSON.stringify the envelope into a string first
    input_reference: JSON.stringify({ resolution: '320p' }),
  }),
});
if (!submit.ok) throw new Error(`submit ${submit.status}: ${await submit.text()}`);
const { id } = await submit.json();

let job;
for (;;) {
  await new Promise(r => setTimeout(r, 5000));
  job = await (await fetch(`${BASE}/${id}`, { headers })).json();
  if (job.status === 'completed' || job.status === 'failed') break;
}
if (job.status === 'failed') throw new Error(JSON.stringify(job.error));
console.log('video:', job.video_url);
```

## Have an id? One cURL to get the result

```bash theme={null}
curl "https://api.apiyi.com/v1/videos/task_xxxxxxxxxxxxxxxx" \
  -H "Authorization: Bearer $APIYI_API_KEY"
```

When `status` is `completed`, `video_url` is the MP4 address and can be downloaded directly:

```bash theme={null}
curl -L -o output.mp4 "<value of video_url>"
```

## Parameter Reference

### Top-level fields (only these five take effect)

| Parameter | Type | Required | Description |
| - | - | - | - |
| `model` | string | Yes | Always `oxygen-1.0` |
| `prompt` | string | Yes | Video description |
| `seconds` | string / integer | Yes | Integer 4–15, used for billing |
| `size` | string | Strongly recommended | `1280x720` / `720x1280` (480p), `1792x1024` / `1024x1792` (768p); defaults to `720x1280` if omitted |
| `input_reference` | string | No | Image URL or data URI = first frame; a JSON string starting with `{` = envelope (see below) |

### `input_reference` envelope keys

| Key | Type | Description |
| - | - | - |
| `images` | string\[] | First frame, max 1 (https or image data URI) |
| `last_image` | string | Last frame (https or image data URI) |
| `reference_images` | string\[] | Reference images, up to 9 |
| `reference_videos` | string\[] | Reference videos, up to 3, https only |
| `reference_audios` | string\[] | Reference audio, up to 3, https only |
| `resolution` | string | `320p` / `480p` / `768p`, wins over `size` |
| `aspect_ratio` | string | `16:9` / `9:16` / `1:1`, wins over `size`; ignored for image-to-video |
| `prompt` | string | If present, overrides the top-level `prompt` |

<Warning>
  The envelope **cannot contain `duration`** (use top-level `seconds`) or any key not in the table, and first/last frames (`images` / `last_image`) cannot be combined with `reference_*`. Any of these returns 400 (`param: input_reference`) with no charge.
</Warning>

### Resolution and output size (measured)

| Resolution | Landscape 16:9 | Portrait 9:16 | Square 1:1 |
| - | - | - | - |
| 320p | 576×320 | (not measured) | (not measured) |
| 480p | 864×480 | 480×864 | 480×480 |
| 768p | 1344×768 | 768×1344 | 768×768 |

Image-to-video follows the first frame's aspect ratio; for example, a square first frame gives 480×480 at 480p.

## Response Format

### Create task

```json theme={null}
{
  "id": "task_PSOFP1GQLtN6kGLXv9DpHMkMGBka70Ga",
  "object": "video",
  "model": "oxygen-1.0",
  "status": "queued",
  "progress": 0,
  "seconds": "4",
  "size": "1280x720",
  "created_at": 1790853159
}
```

### Query task (success)

```json theme={null}
{
  "id": "task_R0Sb8B4YqmNxVSkQZSphUZ8GwEebRMRu",
  "object": "video",
  "model": "oxygen-1.0",
  "status": "completed",
  "progress": 100,
  "seconds": "5",
  "created_at": 1790902499,
  "completed_at": 1790902566,
  "expires_at": 1790988966,
  "usage": {
    "billing_unit": "second",
    "billed_seconds": 5,
    "resolution": "480p",
    "unit_price_usd": 0.02
  },
  "video_url": "https://your-video-host.example.com/task_R0Sb8B4Y..._0.mp4"
}
```

### Query task (failure)

```json theme={null}
{
  "id": "task_xqNrojcHWebOegX70EZzqpM3EhdXMnOo",
  "object": "video",
  "model": "oxygen-1.0",
  "status": "failed",
  "progress": 100,
  "error": {
    "code": "upstream_timeout",
    "message": "upstream did not finish the video within the deadline"
  }
}
```

### Submission error (400)

```json theme={null}
{
  "message": "{\"error\":{\"code\":\"invalid_params\",\"message\":\"input_reference: duration is not used here; set the length with the top-level seconds field\",\"param\":\"input_reference\"}}",
  "type": "task_error",
  "code": "fail_to_fetch_task"
}
```

<Warning>
  **⚠️ Response notes**

  * Status goes `queued` → `in_progress` → `completed` / `failed`
  * The video is at **`video_url`**, downloadable without an auth header; it expires at `expires_at` (about 24 hours), so store it promptly
  * Right after `completed`, `/v1/videos/{id}/content` may need a few more seconds (it returns 400 at first); prefer `video_url`
  * `usage.unit_price_usd` is a per-resolution reference price; **actual billing follows your bill**: a flat \$0.02 per second
  * For submission errors, the detail is a JSON string inside `message` and needs to be parsed again
</Warning>

<Info>
  **Billing**: `seconds × \$0.02` is charged when the task is accepted; resolution and reference media do not change the price, and failed tasks are **refunded in full automatically**. Submissions that return 400 are not charged, and queries and downloads are free. See [Pricing in the overview](/en/api-capabilities/oxygen/overview#pricing).
</Info>


## OpenAPI

````yaml api-reference/oxygen-video-openapi-en.yaml POST /videos
openapi: 3.1.0
info:
  title: Oxygen Video Generation API
  description: >
    AZ8 Oxygen video generation model with an OpenAI Videos-compatible API. One
    endpoint covers text-to-video, first-frame / first-and-last-frame video, and
    reference image / video / audio video.


    - Model ID: `oxygen-1.0`

    - Length: top-level `seconds`, integer 4–15; resolution 320p / 480p / 768p

    - Billed at \$0.02 per second regardless of resolution; failed tasks are
    refunded automatically

    - **Only five top-level fields take effect: `model` / `prompt` / `seconds` /
    `size` / `input_reference`**; first/last frames, reference media, 320p, and
    1:1 go into the `input_reference` JSON envelope

    - **Asynchronous endpoint**: submitting returns a task `id`; poll `GET
    /v1/videos/{id}` for the result


    **Authentication**: add `Authorization: Bearer YOUR_API_KEY` to the request
    headers


    **Get an API key**: create a token in the [APIYI
    console](https://api.apiyi.com/token)
  version: 1.0.0
servers:
  - url: https://api.apiyi.com/v1
    description: Primary endpoint
security:
  - bearerAuth: []
paths:
  /videos:
    post:
      tags:
        - Video Generation
      summary: Create an Oxygen video generation task
      description: >
        Submits an asynchronous video generation task. Success only means the
        task was accepted; the response is a video object with `status: queued`.


        Modes:

        - No `input_reference` → text-to-video

        - `input_reference` = image URL or data URI → first-frame video (aspect
        ratio follows the first frame)

        - `input_reference` = JSON string starting with `{` → envelope: first
        and last frame (`images` + `last_image`), reference media
        (`reference_images` / `reference_videos` / `reference_audios`),
        `resolution` (including 320p), `aspect_ratio`


        Rules:

        - **Always pass `size`**; it defaults to `720x1280` (portrait) when
        omitted

        - `last_image`, `reference_images`, `resolution`, and `aspect_ratio` are
        silently dropped at the top level and must go in the envelope

        - `duration` is not allowed in the envelope; first/last frames cannot be
        mixed with reference media

        - Usually done in 1–3 minutes; query with `GET /v1/videos/{id}`
      operationId: createOxygenVideo
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/OxygenCreateRequest'
            examples:
              TextToVideo:
                summary: Text-to-video
                value:
                  model: oxygen-1.0
                  prompt: A paper boat drifting on a calm pond, soft morning light
                  seconds: '4'
                  size: 1280x720
              FirstFrame:
                summary: First-frame video
                value:
                  model: oxygen-1.0
                  prompt: The glass sphere rolls slowly across the table
                  seconds: '4'
                  size: 1280x720
                  input_reference: https://your-cdn.example.com/first.png
              FirstAndLastFrame:
                summary: First-and-last-frame video
                value:
                  model: oxygen-1.0
                  prompt: >-
                    The glass sphere slowly dissolves into a deep blue abstract
                    wave
                  seconds: '5'
                  size: 1280x720
                  input_reference: >-
                    {"images":["https://your-cdn.example.com/first.png"],"last_image":"https://your-cdn.example.com/last.png"}
              ReferenceImage:
                summary: Reference image video
                value:
                  model: oxygen-1.0
                  prompt: >-
                    The object from the reference image slowly rotates on a
                    wooden table
                  seconds: '4'
                  size: 720x1280
                  input_reference: >-
                    {"reference_images":["https://your-cdn.example.com/object.png"],"aspect_ratio":"9:16"}
              Select320p:
                summary: Select 320p
                value:
                  model: oxygen-1.0
                  prompt: A paper boat drifting on a calm pond
                  seconds: '4'
                  size: 1280x720
                  input_reference: '{"resolution":"320p"}'
      responses:
        '200':
          description: Task accepted
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OxygenVideo'
              example:
                id: task_PSOFP1GQLtN6kGLXv9DpHMkMGBka70Ga
                object: video
                model: oxygen-1.0
                status: queued
                progress: 0
                seconds: '4'
                size: 1280x720
                created_at: 1790853159
        '400':
          description: >-
            Validation failed (seconds outside 4–15, invalid envelope JSON /
            unknown key / duration in the envelope, first/last frames mixed with
            reference media, input_reference not a string, etc.); not charged.
            The detail is a JSON string in the `message` field
        '401':
          description: Unauthorized - invalid API key
        '500':
          description: Reference image download failed, etc.; not charged
        '503':
          description: >-
            No available channel in the token's group (usually a misspelled
            model name or a group that does not include this model)
      security:
        - bearerAuth: []
components:
  schemas:
    OxygenCreateRequest:
      type: object
      required:
        - model
        - prompt
        - seconds
      properties:
        model:
          type: string
          description: Always `oxygen-1.0`
          enum:
            - oxygen-1.0
          default: oxygen-1.0
        prompt:
          type: string
          description: Video description
          example: A paper boat drifting on a calm pond, soft morning light
        seconds:
          type: string
          description: >-
            Output length in seconds, integer 4–15, as a string or number. Used
            for billing; the clip usually runs slightly longer
          enum:
            - '4'
            - '5'
            - '6'
            - '7'
            - '8'
            - '9'
            - '10'
            - '11'
            - '12'
            - '13'
            - '14'
            - '15'
          default: '4'
        size:
          type: string
          description: >
            Sets the resolution and orientation. **Pass it every time**; it
            defaults to `720x1280` (portrait) when omitted.

            `1280x720` = 480p landscape, `720x1280` = 480p portrait, `1792x1024`
            = 768p landscape, `1024x1792` = 768p portrait.

            For 320p or 1:1, use `resolution` / `aspect_ratio` in the
            `input_reference` envelope.
          enum:
            - 1280x720
            - 720x1280
            - 1792x1024
            - 1024x1792
          default: 1280x720
        input_reference:
          type: string
          description: >
            Two forms:

            - **Image URL or data URI** → first-frame video; aspect ratio
            follows the first frame

            - **JSON string starting with `{`** (envelope) → allowed keys:
            `images` (first frame, max 1), `last_image` (last frame),
            `reference_images` (up to 9), `reference_videos` (up to 3, https
            only), `reference_audios` (up to 3, https only), `resolution`
            (`320p` / `480p` / `768p`, wins over size), `aspect_ratio` (`16:9` /
            `9:16` / `1:1`, ignored for image-to-video), `prompt`


            Must be a string, so serialize the envelope first. No `duration` and
            no unknown keys in the envelope; first/last frames cannot be mixed
            with reference media.
          example: https://your-cdn.example.com/first.png
    OxygenVideo:
      type: object
      properties:
        id:
          type: string
          description: Task id, used with `GET /v1/videos/{id}`
        object:
          type: string
          enum:
            - video
        model:
          type: string
        status:
          type: string
          enum:
            - queued
            - in_progress
            - completed
            - failed
        progress:
          type: integer
          description: 0–100
        seconds:
          type: string
        size:
          type: string
        created_at:
          type: integer
        completed_at:
          type: integer
        expires_at:
          type: integer
          description: >-
            When video_url expires (Unix seconds), about 24 hours after
            completion
        video_url:
          type: string
          description: >-
            Output MP4 URL, downloadable without an auth header; store it
            promptly
        usage:
          type: object
          description: >-
            Reference billing info; actual billing is a flat \$0.02 per second,
            see your bill
          properties:
            billing_unit:
              type: string
            billed_seconds:
              type: integer
            resolution:
              type: string
            unit_price_usd:
              type: number
        error:
          type: object
          properties:
            code:
              type: string
              description: For example `upstream_error`, `upstream_timeout`
            message:
              type: string
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API key from the APIYI console

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.