> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# VEO 3.1 Official Image-to-Video API

> VEO 3.1 Official image-to-video API reference and interactive Playground — multipart upload of a single input_reference image to animate static visuals.

<Info>
  The interactive Playground on the right supports live debugging. Fill in your API Key under **Authorization** (format `Bearer sk-xxx`), upload a reference image, enter prompt, pick model / seconds / resolution, then send. **`Default` group works — no dedicated group switch needed**.
</Info>

<Tip>
  **Scope**: This page covers "generate video from a reference image" — upload one image as the visual anchor / starting frame to animate static content. If you don't need a reference image, use the [Text-to-Video endpoint](/en/api-capabilities/veo-3-1-official/text-to-video) (same endpoint, JSON body).
</Tip>

<Warning>
  **⚠️ Image-to-video constraints**

  * **Content-Type must be `multipart/form-data`** (not JSON)
  * **Only 1 reference image supported**; field name is fixed as `input_reference`. Multi-image submissions only keep the first
  * **Remote URLs not accepted** — must be a file upload or Base64
  * Accepted formats: `image/jpeg` / `image/png` / `image/webp`
  * **The length field is named `seconds` (not `duration`) and must be a string** `"4"` / `"6"` / `"8"`. Naming it `duration` is silently ignored and falls back to the default 4 sec; passing a number fails
  * **At 1080p / 4k, `seconds` must be `"8"`**

  Google upstream Veo 3.1 supports multi-reference / first-last-frame / video extension; **this Official channel does not yet expose them**. For first/last frame, use the [VEO 3.1 (Reverse)](/en/api-capabilities/veo/overview) `-fl` series.
</Warning>

## Code Samples

### Python (OpenAI SDK · low-level client.post)

```python theme={null}
{/* OpenAI SDK has no videos.create method; /v1/videos is a custom path, use low-level client.post() */}
from openai import OpenAI
import time

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# Step 1: multipart upload (low-level client.post handles multipart boundary)
with open("./lighthouse.png", "rb") as f:
    resp = client.post(
        "/videos",
        body=None,
        files={
            "input_reference": ("lighthouse.png", f, "image/png")
        },
        extra_body={
            "model": "veo-3.1-fast-generate-preview",
            "prompt": "Camera slowly rises from the base of the lighthouse to the top, dusk lighting, ocean ambience",
            "seconds": "8",  # must be string
            "size": "1280x720",
            "resolution": "720p",
            "aspectRatio": "16:9"
        },
        cast_to=dict
    )
task_id = resp["task_id"]
print(f"Task ID: {task_id}, status: {resp['status']}")

# Step 2: poll (up to 3 minutes)
deadline = time.time() + 180
while time.time() < deadline:
    s = client.get(f"/videos/{task_id}", cast_to=dict)
    print(f"Status: {s['status']}, progress: {s.get('progress', 0)}%")
    if s["status"] == "completed":
        break
    if s["status"] == "failed":
        raise RuntimeError(f"Generation failed: {s}")
    time.sleep(8)

# Step 3: download (with retry)
import urllib.request, urllib.error
time.sleep(4)
for i in range(5):
    try:
        req = urllib.request.Request(
            f"https://api.apiyi.com/v1/videos/{task_id}/content",
            headers={"Authorization": "Bearer sk-your-api-key"}
        )
        with urllib.request.urlopen(req, timeout=180) as r, open("output.mp4", "wb") as f:
            while chunk := r.read(1 << 16):
                f.write(chunk)
        break
    except urllib.error.HTTPError:
        if i == 4:
            raise
        time.sleep(4)
print("Saved: output.mp4")
```

### Python (requests + multipart)

```python theme={null}
import requests
import time

API_KEY = "sk-your-api-key"
BASE_URL = "https://api.apiyi.com/v1"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}

# Step 1: multipart upload of reference image + form fields
with open("./lighthouse.png", "rb") as f:
    resp = requests.post(
        f"{BASE_URL}/videos",
        headers=HEADERS,  # do not set Content-Type manually; requests handles multipart boundary
        data={
            "model": "veo-3.1-fast-generate-preview",
            "prompt": "Camera slowly rises from the base of the lighthouse to the top, dusk lighting, waves lapping the rocks",
            "seconds": "8",  # string, not number
            "size": "1280x720",
            "resolution": "720p",
            "aspectRatio": "16:9",
            "seed": "20260521"
        },
        files={
            "input_reference": ("lighthouse.png", f, "image/png")
        },
        timeout=60  # multipart upload of large images may be slow
    ).json()
task_id = resp["task_id"]
print(f"Task ID: {task_id}")

# Step 2: poll
deadline = time.time() + 180
while time.time() < deadline:
    s = requests.get(f"{BASE_URL}/videos/{task_id}", headers=HEADERS).json()
    print(f"Status: {s['status']}, progress: {s.get('progress', 0)}%")
    if s["status"] == "completed":
        break
    if s["status"] == "failed":
        raise RuntimeError(s)
    time.sleep(8)

# Step 3: download (with 3 retries)
time.sleep(4)
for i in range(5):
    try:
        with requests.get(
            f"{BASE_URL}/videos/{task_id}/content",
            headers=HEADERS, stream=True, timeout=180
        ) as r:
            r.raise_for_status()
            with open("output.mp4", "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
        break
    except requests.HTTPError:
        if i == 4:
            raise
        time.sleep(4)
print("Saved: output.mp4")
```

### cURL (multipart upload)

```bash theme={null}
{/* Just want to check/download with an existing task_id? See the "Already have a task_id?" section below */}
{/* Step 1: multipart upload (input_reference uses @ to reference a local file) */}
RESP=$(curl -sS -X POST "https://api.apiyi.com/v1/videos" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=veo-3.1-fast-generate-preview" \
  -F "prompt=Camera slowly rises from the base of the lighthouse to the top, dusk lighting" \
  -F "seconds=8" \
  -F "size=1280x720" \
  -F "resolution=720p" \
  -F "aspectRatio=16:9" \
  -F "input_reference=@./lighthouse.png;type=image/png")
TASK_ID=$(echo "$RESP" | python3 -c 'import sys,json;print(json.load(sys.stdin)["task_id"])')
echo "task_id=$TASK_ID"

{/* Step 2: poll */}
while :; do
  S=$(curl -sS -H "Authorization: Bearer sk-your-api-key" "https://api.apiyi.com/v1/videos/$TASK_ID")
  ST=$(echo "$S" | python3 -c 'import sys,json;print(json.load(sys.stdin)["status"])')
  echo "status=$ST"
  [ "$ST" = "completed" ] && break
  [ "$ST" = "failed" ] && { echo "$S"; exit 1; }
  sleep 8
done

{/* Step 3: download (--retry covers occasional 400 right after status=completed) */}
sleep 4
curl -sSL --retry 3 --retry-delay 4 \
  -H "Authorization: Bearer sk-your-api-key" \
  "https://api.apiyi.com/v1/videos/$TASK_ID/content" \
  -o output.mp4
ls -lh output.mp4
```

### Node.js (native fetch + FormData)

```javascript theme={null}
import fs from 'node:fs';
import { FormData, File } from 'undici';

const API_KEY = 'sk-your-api-key';
const BASE_URL = 'https://api.apiyi.com/v1';

// Step 1: multipart upload
const buffer = fs.readFileSync('./lighthouse.png');
const form = new FormData();
form.append('model', 'veo-3.1-fast-generate-preview');
form.append('prompt', 'Camera slowly rises from the base of the lighthouse to the top, dusk lighting');
form.append('seconds', '8');  // string
form.append('size', '1280x720');
form.append('resolution', '720p');
form.append('aspectRatio', '16:9');
form.append('input_reference', new File([buffer], 'lighthouse.png', { type: 'image/png' }));

const submitResp = await fetch(`${BASE_URL}/videos`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${API_KEY}` },  // do not set Content-Type manually
    body: form
});
const { task_id } = await submitResp.json();
console.log(`Task ID: ${task_id}`);

// Step 2: poll
let status = 'queued';
while (status !== 'completed' && status !== 'failed') {
    await new Promise(r => setTimeout(r, 8000));
    const s = await (await fetch(`${BASE_URL}/videos/${task_id}`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
    })).json();
    status = s.status;
    console.log(`Status: ${status}, progress: ${s.progress ?? 0}%`);
}

if (status === 'failed') throw new Error('Generation failed');

// Step 3: download (with retry)
await new Promise(r => setTimeout(r, 4000));
let videoBuffer;
for (let i = 0; i < 4; i++) {
    try {
        const resp = await fetch(`${BASE_URL}/videos/${task_id}/content`, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        videoBuffer = Buffer.from(await resp.arrayBuffer());
        break;
    } catch (e) {
        if (i === 3) throw e;
        await new Promise(r => setTimeout(r, 4000));
    }
}
fs.writeFileSync('output.mp4', videoBuffer);
console.log('Saved: output.mp4');
```

### Browser JavaScript (file input upload)

```javascript theme={null}
{/* Demo only; route through a backend proxy in production to avoid Key leakage */}
const fileInput = document.querySelector('input[type=file]');
const file = fileInput.files[0];

const form = new FormData();
form.append('model', 'veo-3.1-fast-generate-preview');
form.append('prompt', 'Animate this scene with a gentle camera push-in and natural ambient sound');
form.append('seconds', '4');
form.append('size', '720x1280');
form.append('resolution', '720p');
form.append('aspectRatio', '9:16');
form.append('input_reference', file);

const submitResp = await fetch('https://api.apiyi.com/v1/videos', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});
const { task_id } = await submitResp.json();
console.log('Task ID:', task_id);

{/* After polling completes, route the /content endpoint through your backend proxy */}
```

## Already have a task\_id? Two copy-paste cURL commands

If you already have a `task_id` (returned when you submitted the task, or visible in your console logs), just replace two placeholders below and run:

* `sk-your-api-key` → your APIYI key
* `task_xxxxxxxxxxxxxxxx` → your task ID

### 1. Check task status

```bash theme={null}
curl "https://api.apiyi.com/v1/videos/task_xxxxxxxxxxxxxxxx" \
  -H "Authorization: Bearer sk-your-api-key"
```

When the JSON response shows `status: "completed"`, you can download; if it shows `in_progress`, wait a few seconds and check again.

### 2. Download the video (saved as output.mp4)

```bash theme={null}
curl -L --retry 3 --retry-delay 4 \
  "https://api.apiyi.com/v1/videos/task_xxxxxxxxxxxxxxxx/content" \
  -H "Authorization: Bearer sk-your-api-key" \
  -o output.mp4
```

<Tip>
  The `/content` endpoint requires the `Authorization` header — opening the URL directly in a browser address bar returns 401. `--retry 3` covers the occasional 400 right after `status` flips to `completed` (CDN sync delay).
</Tip>

## Parameter Reference

| Param             | Type       | Required | Default    | Description                                                                                                                                                   |
| ----------------- | ---------- | -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `input_reference` | file       | Yes      | —          | Reference image file. **Field name is fixed, only 1 image**, accepts `image/jpeg` / `image/png` / `image/webp`. **Remote URLs not accepted**                  |
| `model`           | string     | Yes      | —          | `veo-3.1-fast-generate-preview` (\$0.3/req) or `veo-3.1-generate-preview` (\$1.2/req)                                                                         |
| `prompt`          | string     | Yes      | —          | Describe how the scene should animate: camera motion, object action, lighting, style. **Do not pass `generateAudio`**, audio intent goes in the prompt        |
| `seconds`         | **string** | No       | `"8"`      | `"4"` / `"6"` / `"8"`. **The field is `seconds`, not `duration`** (naming it `duration` is silently ignored, falls back to 4 sec). **1080p/4k must be `"8"`** |
| `size`            | string     | No       | `1280x720` | Output pixels                                                                                                                                                 |
| `resolution`      | string     | No       | `720p`     | `720p` / `1080p` / `4k`                                                                                                                                       |
| `aspectRatio`     | string     | No       | `16:9`     | `16:9` (landscape) / `9:16` (portrait)                                                                                                                        |
| `seed`            | int        | No       | —          | Random seed (multipart form field; string-encoded number is fine)                                                                                             |

<Tip>
  **Field naming difference vs JSON mode**:

  * JSON mode nests under `metadata.*` (e.g. `metadata.resolution`)
  * **Multipart mode** flattens them as form fields (`resolution` / `aspectRatio` / `seed` directly)
  * The code samples above already use multipart conventions
</Tip>

<Warning>
  **Common mistakes**:

  * Sending `input_reference` as a Base64 string inside a JSON body — must use multipart file field
  * Naming the field `image` / `reference` / `input_image` — must be exactly `input_reference`
  * Sending 2 images — server only keeps the first, the second is silently dropped
  * Sending a remote URL (`https://cdn.../img.png`) — not accepted; must be file or Base64
</Warning>

## Response Format

The response structure is identical to [Text-to-Video](/en/api-capabilities/veo-3-1-official/text-to-video#response-format): Step 1 returns `task_id` + `status: "queued"`, Step 2 polling returns `status` + coarse `progress`, Step 3 downloads MP4 binary from `/content`.

```json theme={null}
{
  "id": "task_xxxxxxxxxxxxxxxx",
  "task_id": "task_xxxxxxxxxxxxxxxx",
  "object": "video",
  "model": "veo-3.1-fast-generate-preview",
  "status": "queued",
  "progress": 0,
  "created_at": 1775025000
}
```

<Warning>
  **⚠️ Response field gotchas**

  * `task_id` matches `id`; downstream should standardize on `task_id`
  * **No `video_url` field**; download from `GET /v1/videos/{task_id}/content`
  * `progress` jumps only between 0 / 50 / 100, not linear
  * `/content` returns 400 occasionally right after `status` flips to `completed`; retry after 4 sec
  * **Image-to-video tasks typically take 10–30% longer** than equivalent text-to-video tasks (extra image encoding step)
</Warning>

<Info>
  This endpoint is an async task entry. **Billing happens when the task reaches `completed`, charged per request by model name** (independent of whether `input_reference` is provided; fast \$0.3 / standard \$1.2). POST submission, polling, and download themselves are **not billed**; failed tasks are also **not billed**.
</Info>


## OpenAPI

````yaml api-reference/veo-3-1-official-image-to-video-openapi-en.yaml POST /v1/videos
openapi: 3.1.0
info:
  title: VEO 3.1 Official Image-to-Video API
  description: >
    Google Veo 3.1 image-to-video endpoint (Official Relay channel,
    multipart/form-data upload of `input_reference`).


    - **Only 1 reference image supported**; field name is fixed as
    `input_reference`; multi-image submissions keep only the first

    - Accepted formats: `image/jpeg` / `image/png` / `image/webp`

    - **Remote URLs not accepted** — must be file upload or Base64

    - The duration field is named `seconds` (not `duration`); it must be a
    string `"4"` / `"6"` / `"8"`; 1080p/4k must be `"8"`

    - Same per-request price as text-to-video (per model name); image upload
    does not add cost

    - **Async task endpoint**: this endpoint only submits the task; combine with
    `GET /v1/videos/{task_id}` to poll and `GET /v1/videos/{task_id}/content` to
    download

    - **Multipart mode flattens fields**: fields nested under `metadata.*` in
    JSON mode (e.g. `metadata.resolution`) become top-level form fields in
    multipart mode (`resolution`, `aspectRatio`, `seed`)

    - Google upstream has multi-reference / first-last-frame / video extension
    capabilities; **this Official channel does not yet expose them** — use the
    [VEO 3.1 (Reverse)](/en/api-capabilities/veo/overview) `-fl` series for
    first/last frame


    **Authentication**: include `Authorization: Bearer YOUR_API_KEY` in the
    request header


    **API Key configuration**: **`Default` group works — no dedicated group
    switch needed**; the Token must use **Pay-per-request** or **Pay-as-you-go
    Priority** billing mode (pure **Pay-as-you-go is not supported**)


    **Get an API Key**: visit the [APIYI console](https://api.apiyi.com/token)
    to create a Token
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
  - url: https://vip.apiyi.com
    description: Backup endpoint
security:
  - bearerAuth: []
paths:
  /v1/videos:
    post:
      tags:
        - Video Generation
      summary: 'Image-to-video: submit a generation task from a reference image'
      description: >
        Submit a Veo 3.1 image-to-video task. The client must use
        multipart/form-data with 1 reference image file + text fields.


        - Required: `model`, `prompt`, `input_reference`

        - Optional: `seconds` (default `"8"`, the duration field — not
        `duration`), `size` / `resolution` / `aspectRatio` / `seed`

        - Response structure, polling, and download flow are identical to
        text-to-video

        - Typical render time is 10–30% longer than equivalent text-to-video
        (extra image encoding step)
      operationId: generateVeo31OfficialImageToVideo
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/Veo31ImageToVideoRequest'
            example:
              model: veo-3.1-fast-generate-preview
              prompt: >-
                Camera slowly rises from the base of the lighthouse to the top,
                dusk lighting, waves lapping the rocks
              seconds: '8'
              size: 1280x720
              resolution: 720p
              aspectRatio: '16:9'
      responses:
        '200':
          description: Task submitted; returns task_id and queued status
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Veo31VideoTask'
        '400':
          description: >-
            Invalid parameter (seconds as number; field misnamed as duration;
            non-8-sec at 1080p/4k; unsupported image format; etc.)
        '401':
          description: Unauthorized - invalid API Key
        '413':
          description: Uploaded image too large
        '429':
          description: Rate limit or insufficient balance
        '500':
          description: Upstream gateway error; retry 1–2 times (failed tasks not billed)
      security:
        - bearerAuth: []
components:
  schemas:
    Veo31ImageToVideoRequest:
      type: object
      required:
        - model
        - prompt
        - input_reference
      properties:
        model:
          type: string
          description: |
            Model ID (per-request billing):
            - `veo-3.1-fast-generate-preview` — \$0.3/request
            - `veo-3.1-generate-preview` — \$1.2/request
          enum:
            - veo-3.1-fast-generate-preview
            - veo-3.1-generate-preview
          default: veo-3.1-fast-generate-preview
        prompt:
          type: string
          description: >
            Video generation prompt. **Focus on how the scene should animate**:
            camera motion, object action, lighting, audio atmosphere. **Do not
            pass `generateAudio`** — audio intent goes in the prompt.
          example: >-
            Camera slowly rises from the base of the lighthouse to the top, dusk
            lighting, waves lapping the rocks
        input_reference:
          type: string
          format: binary
          description: >
            Reference image file. **Field name is fixed as `input_reference`,
            only 1 image supported**.


            Accepted formats: `image/jpeg` / `image/png` / `image/webp`.
            **Remote URLs not accepted** — must be a file upload or Base64.
        seconds:
          type: string
          description: >
            Video length. **The field name is `seconds` (not `duration`)**, a
            **string enum**: `"4"` / `"6"` / `"8"`. Sending `duration` is
            silently ignored and falls back to the default 4 sec. **Must be
            `"8"` at 1080p / 4k**.
          enum:
            - '4'
            - '6'
            - '8'
          default: '8'
        size:
          type: string
          description: Output pixel dimensions; lower precedence than `resolution`
          enum:
            - 1280x720
            - 720x1280
            - 1920x1080
            - 1080x1920
            - 3840x2160
            - 2160x3840
          default: 1280x720
        resolution:
          type: string
          description: >-
            Resolution tier (multipart mode flattens this as a top-level form
            field; higher precedence than `size`)
          enum:
            - 720p
            - 1080p
            - 4k
          default: 720p
        aspectRatio:
          type: string
          description: 'Aspect ratio: `16:9` landscape (default) or `9:16` portrait'
          enum:
            - '16:9'
            - '9:16'
          default: '16:9'
        seed:
          type: string
          description: >-
            Random seed (multipart form field; string-encoded number is fine).
            Fixed seed clusters outputs in style but does not byte-reproduce.
          example: '20260521'
        negativePrompt:
          type: string
          description: >-
            Negative prompt; recommended `"blurry, watermark, distorted, low
            quality"`
          example: blurry, watermark, distorted, low quality
    Veo31VideoTask:
      type: object
      properties:
        id:
          type: string
          description: >-
            Task ID (matches `task_id`; downstream should standardize on
            `task_id`)
          example: task_xxxxxxxxxxxxxxxx
        task_id:
          type: string
          description: Task ID for subsequent polling and download
          example: task_xxxxxxxxxxxxxxxx
        object:
          type: string
          description: Object type, fixed to `video`
          example: video
        model:
          type: string
          description: Model ID used for this task
          example: veo-3.1-fast-generate-preview
        status:
          type: string
          description: |
            Task status:
            - `queued` — submitted, awaiting processing
            - `in_progress` — generating
            - `completed` — done, downloadable (`/v1/videos/{task_id}/content`)
            - `failed` — failed (**not billed**), retry possible
          enum:
            - queued
            - in_progress
            - completed
            - failed
          example: queued
        progress:
          type: integer
          description: >-
            Generation progress (coarse-grained, **jumps only between 0 / 50 /
            100**)
          example: 0
        created_at:
          type: integer
          description: Task creation Unix timestamp (seconds)
          example: 1775025000
        completed_at:
          type: integer
          description: >-
            Task completion Unix timestamp (seconds); only present for completed
            status
          example: 1775025090
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: >-
        API Key from APIYI console (Default group + Pay-per-request or
        Pay-as-you-go Priority Token; pure Pay-as-you-go not supported)

````