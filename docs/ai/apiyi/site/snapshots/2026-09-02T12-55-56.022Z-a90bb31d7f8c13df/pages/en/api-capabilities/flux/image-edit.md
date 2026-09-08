> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Image Editing API Reference

> FLUX image editing API reference and live debugger — upload up to 8 reference images + instructions for single-image edits, multi-reference fusion. Works for FLUX.2 and FLUX.1 Kontext.

<Info>
  Playground usage: enter your API Key in **Authorization** (format `Bearer sk-xxx`). Paste the **public URL** of reference image 1 into `input_image`; for multi-reference, fill the URLs of additional images into `input_image_2` … `input_image_8`. Then fill `prompt` / `model` and send. The Playground only accepts URLs; for base64 data URL inputs, copy the code samples below and run them locally.
</Info>

<Tip>
  **Use this page for** "edit or fuse one or more reference images". FLUX image editing supports two options:

  * **Option A (this page's Playground, recommended)**: JSON + `input_image` to `/v1/images/generations` (shared with text-to-image — sending `input_image` triggers edit mode). Works for all FLUX models (including Kontext, verified), and supports multi-reference fusion (`input_image_2` \~ `input_image_8`).
  * **Option B**: the OpenAI-compatible multipart endpoint `/v1/images/edits` (see the "Option B" section below) — single-image editing, directly compatible with the OpenAI SDK's `client.images.edit()`.

  For pure text-to-image, see the [Text-to-Image endpoint](/en/api-capabilities/flux/text-to-image).
</Tip>

<Warning>
  **⚠️ Key differences / notes (Option A)**

  * **Endpoint path**: `/v1/images/generations` (shared with text-to-image; an OpenAI-compatible single-image `/v1/images/edits` endpoint also exists — see Option B)
  * **Content-Type**: `application/json` (Option B's `/edits` endpoint uses `multipart/form-data` instead)
  * **Every reference image field is a string**: `input_image` / `input_image_2` … `input_image_8` accept a public URL (recommended) or `data:image/...;base64,xxx` data URL
  * **Reference image cap varies by model**: FLUX.2 \[pro/max/flex] up to **8**, FLUX.2 \[klein] up to **4**, FLUX.1 Kontext supports **1** natively
  * **Each image ≤ 20MB or 20MP**, formats `png` / `jpg` / `webp`
  * **Input resolution**: min 64×64, max 4MP; dimensions must be multiples of 16
  * **Result URL is valid for only 10 minutes** — `data[0].url` must be downloaded immediately
  * **If `aspect_ratio` is omitted, output dimensions match the first input image**
</Warning>

<Warning>
  **📎 Multi-reference order matters**

  The numbering of `input_image` / `input_image_2` / `input_image_3` … **is exactly the index used by "image 1 / image 2 / image 3"** in your prompt:

  > Place the person from image 1 into the scene from image 2, applying the color palette of image 3.

  Each value must be a publicly reachable URL (≤ 20MB recommended) or a `data:image/png;base64,xxx` data URL.
</Warning>

## Code Examples

### cURL (two-image fusion · URL)

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "flux-2-pro",
    "prompt": "Naturally blend these two images",
    "input_image": "https://static.apiyi.com/apiyi-logo.png",
    "input_image_2": "https://images.unsplash.com/photo-1762138012600-2ab523f8b35a",
    "seed": 42,
    "output_format": "jpeg"
  }'
```

### cURL (three-image fusion · URL)

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "flux-2-pro",
    "prompt": "The person from image 1 is petting the cat from image 2, the bird from image 3 is next to them",
    "input_image": "https://example.com/person.jpg",
    "input_image_2": "https://example.com/cat.jpg",
    "input_image_3": "https://example.com/bird.jpg",
    "seed": 42,
    "output_format": "jpeg"
  }'
```

### cURL (single-image edit · Kontext)

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "flux-kontext-pro",
    "prompt": "Convert this architectural photo into a pencil sketch style, preserve all structural details",
    "input_image": "https://your-oss.example.com/architecture.jpg"
  }'
```

### cURL (local file · base64 data URL)

```bash theme={null}
# Encode local image as base64 data URL (macOS / Linux)
B64=$(base64 -w0 < person.png 2>/dev/null || base64 < person.png | tr -d '\n')

curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d "$(jq -nc --arg img "data:image/png;base64,$B64" '{
    model: "flux-2-pro",
    prompt: "Stylize image 1 as an oil painting",
    input_image: $img
  }')"
```

### Python (requests · two-image fusion)

```python theme={null}
import requests

resp = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={
        "Authorization": "Bearer sk-your-api-key",
        "Content-Type": "application/json",
    },
    json={
        "model": "flux-2-pro",
        "prompt": "Naturally blend these two images",
        "input_image": "https://static.apiyi.com/apiyi-logo.png",
        "input_image_2": "https://images.unsplash.com/photo-1762138012600-2ab523f8b35a",
        "seed": 42,
        "output_format": "jpeg",
    },
    timeout=120,
)
image_url = resp.json()["data"][0]["url"]

# data[0].url is valid for only 10 minutes — download immediately
with open("fused.jpg", "wb") as f:
    f.write(requests.get(image_url, timeout=30).content)
```

### Python (requests · local file as base64)

```python theme={null}
import base64, requests, mimetypes

def to_data_url(path: str) -> str:
    mime = mimetypes.guess_type(path)[0] or "image/png"
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    return f"data:{mime};base64,{b64}"

resp = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={
        "Authorization": "Bearer sk-your-api-key",
        "Content-Type": "application/json",
    },
    json={
        "model": "flux-2-pro",
        "prompt": "Place the person from image 1 into the scene from image 2",
        "input_image": to_data_url("person.png"),
        "input_image_2": "https://your-oss.example.com/scene.jpg",
    },
    timeout=120,
)
print(resp.json()["data"][0]["url"])
```

### Python (OpenAI SDK · pass input\_image via extra\_body)

```python theme={null}
from openai import OpenAI
import requests

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# OpenAI SDK images.generate() targets /v1/images/generations with JSON;
# BFL-native fields are added straight into the body via extra_body.
resp = client.images.generate(
    model="flux-2-pro",
    prompt="Naturally blend these two images",
    extra_body={
        "input_image": "https://static.apiyi.com/apiyi-logo.png",
        "input_image_2": "https://images.unsplash.com/photo-1762138012600-2ab523f8b35a",
        "seed": 42,
        "output_format": "jpeg",
    },
)
image_url = resp.data[0].url
with open("fused.jpg", "wb") as f:
    f.write(requests.get(image_url, timeout=30).content)
```

### Node.js (fetch · multi-reference fusion)

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer sk-your-api-key',
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        model: 'flux-2-pro',
        prompt: 'Naturally blend these two images',
        input_image: 'https://static.apiyi.com/apiyi-logo.png',
        input_image_2: 'https://images.unsplash.com/photo-1762138012600-2ab523f8b35a',
        seed: 42,
        output_format: 'jpeg',
    }),
});

const { data } = await resp.json();
const img = await fetch(data[0].url);
const fs = await import('node:fs');
fs.writeFileSync('fused.jpg', Buffer.from(await img.arrayBuffer()));
```

## Option B: OpenAI-Compatible Edit Endpoint (multipart)

Besides the JSON option above, FLUX image editing also supports the standard OpenAI Images API edit endpoint, directly compatible with `client.images.edit()` (verified 2026-07-04 with `flux-kontext-max`, successful generation):

* **Endpoint**: `POST https://api.apiyi.com/v1/images/edits`
* **Content-Type**: `multipart/form-data` (set automatically by SDKs and curl `-F` — **do not set it manually**, or the boundary gets lost and parsing fails)

<Note>
  The FLUX.1 Kontext series accepts a single input image only; for multi-reference fusion use Option A (`input_image` \~ `input_image_8`). Option B is currently verified on the Kontext series.
</Note>

### Request Parameters (form fields)

| Field              | Type    | Required | Description                                                                                                              |
| ------------------ | ------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `model`            | string  | ✓        | E.g. `flux-kontext-max` / `flux-kontext-pro`                                                                             |
| `prompt`           | string  | ✓        | Edit instruction                                                                                                         |
| `image`            | file    | ✓        | Source image binary (png/jpg/webp, ≤ 20MB). **The field name must be `image`** — omitting it returns `image is required` |
| `aspect_ratio`     | string  | ✗        | E.g. `1:1` / `16:9`, passed as a top-level form field; OpenAI SDK users pass it via `extra_body`                         |
| `safety_tolerance` | integer | ✗        | 0 (strictest) – 6 (most permissive)                                                                                      |

### cURL Example

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=flux-kontext-max" \
  -F "prompt=Change the outfit to a fashion look" \
  -F "aspect_ratio=16:9" \
  -F "image=@input.jpg"
```

### Python (OpenAI SDK) Example

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
)

result = client.images.edit(
    model="flux-kontext-max",
    image=open("input.jpg", "rb"),
    prompt="Change the outfit to a fashion look",
    extra_body={"aspect_ratio": "16:9"},  # FLUX-specific params go through extra_body
)
print(result.data[0].url)
```

### Node.js (fetch + FormData) Example

```javascript theme={null}
const form = new FormData();
form.append('model', 'flux-kontext-max');
form.append('prompt', 'Change the outfit to a fashion look');
form.append('aspect_ratio', '16:9');
form.append('image', imageBlob, 'input.jpg'); // browser Blob or Node's fs.openAsBlob()

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    // Note: do NOT set Content-Type manually — let the runtime generate the multipart boundary
    body: form,
});
const data = await resp.json();
console.log(data.data[0].url);
```

The response format is identical to Option A (`data[0].url`, a BFL signed URL valid for 10 minutes — server-side download to your own storage in production).

### Which Option Should I Use?

|             | Option A (JSON `input_image`)                        | Option B (multipart `/edits`)                              |
| ----------- | ---------------------------------------------------- | ---------------------------------------------------------- |
| Best for    | Direct HTTP / frontend apps / multi-reference fusion | Existing OpenAI SDK code, `client.images.edit()` migration |
| Multi-image | Yes (flux-2 up to 8)                                 | Single image only                                          |
| Image input | Public URL or base64 data URL                        | Binary file                                                |

## Parameter Reference

| Field                             | Type    | Required | Default             | Description                                                                                                                                       |
| --------------------------------- | ------- | -------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`                           | string  | Yes      | —                   | FLUX model ID. For multi-reference fusion prefer `flux-2-pro` / `flux-2-max`; for single-image edits also `flux-kontext-max` / `flux-kontext-pro` |
| `prompt`                          | string  | Yes      | —                   | Edit / fusion instruction, up to 32K tokens. Use "image 1 / image 2 / image 3" to reference image / input\_image\_2 / input\_image\_3 ordering    |
| `input_image`                     | string  | Yes      | —                   | Reference image 1. Public URL (recommended) or `data:image/...;base64,xxx` data URL                                                               |
| `input_image_2` … `input_image_8` | string  | No       | —                   | Reference images 2–8 — URL or data URL. FLUX.2 \[pro/max/flex] up to 8, \[klein] 4, Kontext does not support extras                               |
| `aspect_ratio`                    | string  | No       | matches first input | E.g. `1:1` / `16:9` / `9:16` / `4:3` / `3:2`                                                                                                      |
| `seed`                            | integer | No       | random              | Fix for reproducibility                                                                                                                           |
| `safety_tolerance`                | integer | No       | `2`                 | 0 (strictest) – 6 (most permissive)                                                                                                               |
| `output_format`                   | string  | No       | `jpeg`              | `jpeg` / `png`                                                                                                                                    |
| `prompt_upsampling`               | boolean | No       | `false`             | Auto-upsample the prompt                                                                                                                          |
| `steps`                           | integer | No       | `50`                | **Only `flux-2-flex`**, max 50                                                                                                                    |
| `guidance`                        | number  | No       | `4.5`               | **Only `flux-2-flex`**, 1.5–10                                                                                                                    |

## Multi-Reference Strategies

<AccordionGroup>
  <Accordion icon="user" title="Character Consistency (up to 8 images)">
    Upload multiple shots of the same character as references — the model preserves identity features automatically. Great for ad campaigns, comic panels, fashion editorials.

    ```
    Eight consistent characters from the reference images,
    in a fashion editorial set on a Tokyo rooftop at golden hour
    ```
  </Accordion>

  <Accordion icon="palette" title="Style Transfer">
    One content image + one style image, with explicit reference in the prompt:

    ```
    Using the style of image 2, render the subject from image 1
    ```
  </Accordion>

  <Accordion icon="layers" title="Object Composition">
    Combine objects from multiple images into one new scene:

    ```
    The person from image 1 is petting the cat from image 2,
    the bird from image 3 is next to them
    ```
  </Accordion>

  <Accordion icon="shirt" title="Outfit / Product Swap">
    Swap an outfit from one image to another subject:

    ```
    Replace the top of the person in image 1 with the one from image 2,
    keep the pose and background unchanged
    ```
  </Accordion>
</AccordionGroup>

<Tip>
  **Iterative editing**: download `data[0].url`, feed it back as `input_image` in the next call with a new instruction, and refine progressively. Each round bills as one image.
</Tip>

## Response Format

```json theme={null}
{
    "created": 1776832476,
    "data": [
        {
            "url": "https://delivery-eu.bfl.ai/results/xxx/sample.jpeg?signature=..."
        }
    ]
}
```

<Warning>
  **⚠️ `data[0].url` is valid for only 10 minutes**

  * URL hosted on `delivery-eu.bfl.ai` / `delivery-us.bfl.ai`, signature expires after 10 min
  * **CORS is disabled** — browser `fetch` is blocked
  * Production must server-side download to your own OSS / CDN
  * The FLUX edit endpoint does **not** return `b64_json` — only url
</Warning>

<Info>
  Edit requests cost the same as text-to-image (per image, not per token). Multi-reference does not charge extra for additional images (unlike OpenAI gpt-image-2 editing).
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="What causes the error image is required (shell_api_error)?">
    The request reached the `/v1/images/edits` endpoint (Option B), but the gateway couldn't find an image in the request body. Common causes:

    1. The multipart form has no `image` file field, or the field name is wrong (e.g. `image[]`, `file`)
    2. `Content-Type: multipart/form-data` was set manually without a boundary (don't set this header yourself when using an SDK / fetch / curl)
    3. The client's image conversion failed but the request was sent anyway (check that the `image` field actually contains more than 0 bytes)
    4. You meant to send an image via JSON but hit `/edits` — JSON + `input_image` goes to `/v1/images/generations` (Option A)
  </Accordion>
</AccordionGroup>


## OpenAPI

````yaml api-reference/flux-edit-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: FLUX Image Editing API
  description: >
    Black Forest Labs FLUX model family — image editing endpoint (apiyi proxy:
    `/v1/images/generations` + JSON body).


    - **Endpoint path**: `POST /v1/images/generations` (FLUX shares this path
    between text-to-image and editing — passing `input_image` switches to edit
    mode)

    - **Content-Type**: `application/json` (this Playground uses the JSON
    option, recommended; an OpenAI-compatible multipart single-image
    `/v1/images/edits` endpoint also exists — see "Option B" on the docs page)

    - **Reference image fields**: `input_image` / `input_image_2` …
    `input_image_8`, **values are public URL strings** (also accepts
    `data:image/...;base64,xxx` data URLs, but the Playground encourages plain
    URLs and leaves base64 for local code testing)

    - Multi-reference caps: FLUX.2 [pro/max/flex] up to 8, [klein] up to 4,
    FLUX.1 Kontext single image

    - In the prompt, "image 1 / image 2 / image 3" map to input_image /
    input_image_2 / input_image_3

    - Response `data[0].url` is **valid for only 10 minutes**, download
    immediately (CORS disabled)


    **Authentication**: include `Authorization: Bearer YOUR_API_KEY` in the
    request header.


    **Get API Key**: create a token at the [APIYI
    Console](https://api.apiyi.com/token).
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
  - url: https://vip.apiyi.com
    description: Backup endpoint
security:
  - bearerAuth: []
paths:
  /v1/images/generations:
    post:
      tags:
        - Image Editing
      summary: Edit or fuse one or more reference images by instruction
      description: >
        Edit or fuse one or more reference images using FLUX.


        - **Path is shared with text-to-image: `/v1/images/generations`** (an
        OpenAI-compatible multipart single-image `/v1/images/edits` endpoint
        also exists — see "Option B" on the docs page)

        - Request Content-Type is `application/json`

        - **All reference image fields are URL strings**: `input_image`,
        `input_image_2` … `input_image_8`

        - If `aspect_ratio` is omitted, output dimensions match the first input
        image
      operationId: editFluxImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/EditImageRequest'
            example:
              model: flux-2-pro
              prompt: Naturally blend these two images
              input_image: https://static.apiyi.com/apiyi-logo.png
              input_image_2: https://images.unsplash.com/photo-1762138012600-2ab523f8b35a
              seed: 42
              output_format: jpeg
      responses:
        '200':
          description: Image generated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: >-
            Invalid params (missing input_image, dimensions not multiple of 16,
            exceeds 4MP, etc.)
        '401':
          description: Unauthorized — invalid API Key
        '403':
          description: Moderation block
        '413':
          description: Uploaded image too large
        '429':
          description: Rate limited or out of credits
        '500':
          description: Internal server error
      security:
        - bearerAuth: []
components:
  schemas:
    EditImageRequest:
      type: object
      required:
        - model
        - prompt
        - input_image
      properties:
        model:
          type: string
          description: >-
            FLUX model ID. For multi-reference fusion prefer flux-2-pro /
            flux-2-max; for single-image edits also flux-kontext-max /
            flux-kontext-pro.
          enum:
            - flux-2-pro
            - flux-2-max
            - flux-2-flex
            - flux-2-klein-9b
            - flux-2-klein-4b
            - flux-kontext-max
            - flux-kontext-pro
          default: flux-2-pro
        prompt:
          type: string
          description: >-
            Edit / fusion instruction. In multi-reference scenarios, refer to
            images by index: 'image 1' / 'image 2' / 'image 3' map to
            input_image / input_image_2 / input_image_3.
          example: Naturally blend these two images
        input_image:
          type: string
          description: >-
            Public URL for reference image 1 (required). **Use plain URLs in the
            Playground**; for local code you can also pass a
            `data:image/png;base64,xxx` data URL.
          example: https://static.apiyi.com/apiyi-logo.png
        input_image_2:
          type: string
          description: Public URL for reference image 2 (optional)
        input_image_3:
          type: string
          description: Public URL for reference image 3 (optional)
        input_image_4:
          type: string
          description: Public URL for reference image 4 (optional)
        input_image_5:
          type: string
          description: Public URL for reference image 5 (optional)
        input_image_6:
          type: string
          description: Public URL for reference image 6 (optional)
        input_image_7:
          type: string
          description: Public URL for reference image 7 (optional)
        input_image_8:
          type: string
          description: >-
            Public URL for reference image 8 (optional, only FLUX.2
            [pro/max/flex] supports up to 8)
        aspect_ratio:
          type: string
          description: >-
            Aspect ratio, e.g. 1:1 / 16:9 / 9:16 / 4:3 / 3:4. Defaults to first
            input image.
        seed:
          type: integer
          description: Fix for reproducibility.
        safety_tolerance:
          type: integer
          description: Moderation level. 0 = strictest, 6 = most permissive. Default 2.
          minimum: 0
          maximum: 6
        output_format:
          type: string
          description: Output format. Default jpeg.
          enum:
            - jpeg
            - png
        prompt_upsampling:
          type: boolean
          description: Auto-upsample the prompt. Default false.
        steps:
          type: integer
          description: '**Only flux-2-flex**. Inference steps. Default 50.'
          minimum: 1
          maximum: 50
        guidance:
          type: number
          description: '**Only flux-2-flex**. Guidance scale. Default 4.5.'
          minimum: 1.5
          maximum: 10
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
          example: 1776832476
        data:
          type: array
          description: Result array (single image per call)
          items:
            type: object
            properties:
              url:
                type: string
                description: >-
                  **Signed URL, valid for 10 minutes**. Hosted on
                  delivery-eu.bfl.ai / delivery-us.bfl.ai with CORS disabled.
                example: >-
                  https://delivery-eu.bfl.ai/results/xxx/sample.jpeg?signature=...
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key from the APIYI Console

````