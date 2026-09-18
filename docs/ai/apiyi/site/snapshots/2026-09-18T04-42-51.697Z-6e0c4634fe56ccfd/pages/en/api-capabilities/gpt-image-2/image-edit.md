> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Image Edit API Reference

> gpt-image-2.5-sunburst / gpt-image-2.5-flare / gpt-image-2 image edit API reference and live testing — upload reference images (up to 16) + instructions for single-image edit, multi-image fusion, or mask inpainting

<Info>
  The interactive Playground on the right supports direct local image upload. Fill in your API Key in **Authorization** (format: `Bearer sk-xxx`), select image / mask files, fill in `prompt` and `model`, and send.
</Info>

<Tip>
  **Use case**: This page is for "edit / fuse / inpaint based on one or more reference images". Request format is `multipart/form-data`. For pure text-to-image, use the [Text-to-Image endpoint](/en/api-capabilities/gpt-image-2/text-to-image).
</Tip>

<Warning>
  **🖥️ Browser Playground limitation (important)**

  This endpoint returns a **raw base64 string** (typically several MB) in the response. Due to browser rendering limits, the Playground on the right may show `请求时发生错误: unable to complete request` after the response arrives — **the request actually succeeded**; the browser just can't render such a long base64 string.

  **Recommended workflow** (beginner-friendly):

  * **Copy the Python / Node.js / cURL sample below and run it locally**. The code automatically `base64.b64decode`s the response and **writes the image to a file**.
  * If you must use the in-browser Playground, **use a tiny reference image (\< 50KB)**, set `size` to the smallest tier (e.g. `1024x1024`), and `quality` to `low`.
</Warning>

<Warning>
  **⚠️ Key differences (when migrating from gpt-image-1.5)**

  * **Do not pass `input_fidelity`** — all three models force high-fidelity; passing it returns 400 (verified on 2.5 on 2026-09-09)
  * **Edit requests have noticeably higher input tokens** — references convert to many tokens via Vision pricing; budget accordingly
  * **Multi-image fusion: max 16** — repeat the `image[]` field; more than 16 errors out
</Warning>

<Warning>
  **📎 Multi-image fusion order matters**

  The `image[]` field accepts multiple reference images. **Upload order maps to "image 1 / image 2 / image 3" references in the prompt**. Reference them explicitly:

  > Place subject from image 1 into scene from image 2, using color style from image 3

  Per-file limit: **under 50MB each** (multipart file upload), formats: `png` / `jpg` / `webp`; in practice compress to **within 1.5MB** before uploading (see "Upload Size Limits" below).
</Warning>

## Code Examples

### Python (OpenAI SDK · single-image edit)

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.edit(
    model="gpt-image-2.5-sunburst",
    image=open("photo.png", "rb"),
    prompt="Replace the background with a seaside sunset, preserve subject details",
    size="1536x1024",
    quality="high"
)

# b64_json is raw base64 (no prefix) — decode manually
with open("edited.png", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### Python (OpenAI SDK · multi-image fusion)

```python theme={null}
resp = client.images.edit(
    model="gpt-image-2.5-sunburst",
    image=[
        open("person.png", "rb"),
        open("scene.png", "rb"),
        open("style.png", "rb"),
    ],
    prompt="Place subject from image 1 into scene from image 2, using color style from image 3, keep lighting consistent",
    size="1536x1024",
    quality="high"
)

with open("fused.png", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### cURL (multi-image fusion)

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2.5-sunburst" \
  -F "prompt=Place subject from image 1 into scene from image 2, using color style from image 3" \
  -F "size=1536x1024" \
  -F "quality=high" \
  -F "image[]=@person.png" \
  -F "image[]=@scene.png" \
  -F "image[]=@style.png"
```

### cURL (mask inpainting)

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2.5-sunburst" \
  -F "prompt=Replace the sky with pink sunset clouds" \
  -F "size=1024x1024" \
  -F "quality=high" \
  -F "image[]=@photo.png" \
  -F "mask=@mask.png" \
  | jq -r '.data[0].b64_json' | base64 -d > photo_edited.png
```

### Node.js (Native fetch + FormData · multi-image fusion)

```javascript theme={null}
import fs from 'node:fs';

const form = new FormData();
form.append('model', 'gpt-image-2.5-sunburst');
form.append('prompt', 'Place subject from image 1 into scene from image 2');
form.append('size', '1536x1024');
form.append('quality', 'high');
form.append('image[]', new Blob([fs.readFileSync('./person.png')]), 'person.png');
form.append('image[]', new Blob([fs.readFileSync('./scene.png')]), 'scene.png');

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});

const { data } = await resp.json();
fs.writeFileSync('fused.png', Buffer.from(data[0].b64_json, 'base64'));
```

## Parameter Reference

| Field                | Type | Required | Default | Description                                                                                                                                                                                                                                                                                                               |
| -------------------- | ---- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`              | text | Yes      | —       | `gpt-image-2.5-sunburst` (editing-precision-first, the pick for edits) / `gpt-image-2.5-flare` (speed-first) / `gpt-image-2` (previous generation, still available); pin dated snapshots `gpt-image-2.5-sunburst-2026-09-08` / `gpt-image-2.5-flare-2026-09-08` in production. Same price and parameters across all three |
| `prompt`             | text | Yes      | —       | Edit / fusion instruction                                                                                                                                                                                                                                                                                                 |
| `image[]`            | file | Yes      | —       | Reference images, can repeat (**max 16**)                                                                                                                                                                                                                                                                                 |
| `mask`               | file | No       | —       | Mask image (only applies to first image, alpha channel required)                                                                                                                                                                                                                                                          |
| `size`               | text | No       | `auto`  | Output size, same as text-to-image                                                                                                                                                                                                                                                                                        |
| `quality`            | text | No       | `auto`  | `low` / `medium` / `high` / `xhigh` / `max` / `auto`; `xhigh` / `max` are new in 2.5, `gpt-image-2` stops at `high`                                                                                                                                                                                                       |
| `output_format`      | text | No       | `png`   | `png` / `jpeg` / `webp`                                                                                                                                                                                                                                                                                                   |
| `output_compression` | text | No       | —       | 0–100, only for `jpeg` / `webp`                                                                                                                                                                                                                                                                                           |
| `background`         | text | No       | `auto`  | `transparent` / `opaque` / `auto`. With `transparent`, `output_format` must be `png` or `webp`. Note that transparency on the edit endpoint is a **re-draw**, not a precise cutout — see the [transparent background FAQ](/en/faq/image-transparent-background)                                                           |

<Warning>
  **Do not pass the legacy DALL·E values `standard` / `hd` for `quality`.** Only the six official enum values `low` / `medium` / `high` / `xhigh` / `max` / `auto` are accepted (`xhigh` / `max` by the two 2.5 models only). The legacy values behave inconsistently across backend channels: sometimes they fail immediately with a 400 (`invalid_value`), and sometimes they are silently ignored and the request runs at `auto` (unpredictable cost). Always pass one of the official values explicitly.
</Warning>

## Upload Size Limits

| Item                              | Limit                    | Notes                                                                                                                                                                                                         |
| --------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reference image count             | Up to **16**             | Repeat the `image[]` field                                                                                                                                                                                    |
| Per image (multipart file upload) | **Under 50MB** each      | Formats: `png` / `jpg` / `webp`                                                                                                                                                                               |
| Per image (base64 data URL)       | Field length \~**20MiB** | This is a length limit on the URL/base64 **string field** (schema `maxLength: 20971520`) — **not** the same as the 50MB multipart cap; base64 inflates size by \~1/3, so keep original images **within 15MB** |
| Mask file                         | **PNG under 4MB**        | Must match the original image's dimensions, with an alpha channel                                                                                                                                             |

<Warning>
  **Don't max out the total request size**: even though the per-image cap is 50MB with up to 16 images, multiple near-cap images make a single request body enormous and prone to gateway / CDN / timeout failures. In practice, **compress each image to within 1.5MB** (JPEG quality 80-90) — success rate and generation speed both improve noticeably, and output quality is unrelated to input file size.
</Warning>

## Reference Image Format Requirements and Preprocessing

`/v1/images/edits` only accepts **png / jpg / webp** standard formats. If you receive this 400:

```json theme={null}
{
  "error": {
    "message": "Invalid image file or mode for image 1, please check your image file. ...",
    "type": "shell_api_error",
    "code": "invalid_image_file"
  }
}
```

the reference image is most likely **not a standard JPEG/PNG**. The most common trap is **MPO format** (Multi-Picture Object, a multi-frame JPEG container) from phone cameras: `.jpg` files straight out of Huawei Mate-series phones embed an HDR gain-map sub-frame and are actually MPO. These files start with the same `FFD8` header — **the extension and the `file` command both report JPEG** — so they're impossible to spot by eye; only frame-aware parsing (e.g. Pillow) can tell. The "image 1" in the error refers to the Nth reference image (1-indexed), so use the index to locate the offending file.

<Info>
  **Verified July 2026**: MPO files failed with 400 on 5/5 uploads; the same images re-encoded as standard JPEG/PNG succeeded **at the full original 3072×4096 resolution** — the problem is the format, not the dimensions or file size. The error is returned quickly (\~4s) at the input-validation stage and is **not billed**.
</Info>

**Detection and fix**: if `Image.open(f).format` returns `"MPO"`, the file needs conversion. A single re-encode step in your upload pipeline also covers HEIC and other phone formats:

```python theme={null}
from PIL import Image
import io

def normalize_image(path: str) -> bytes:
    """Convert phone photos (MPO/HDR multi-frame etc.) to standard JPEG that passes edits validation"""
    im = Image.open(path)
    im.load()                      # for MPO, keeps only the first (full-size) frame
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGB")
    out = io.BytesIO()
    im.save(out, format="JPEG", quality=92)   # or format="PNG"
    return out.getvalue()
```

<Tip>
  If your product accepts user-shot photos (interior renders, product shots, etc.), re-encode **uniformly on the server side** rather than debugging images one by one — phone HDR photos will keep showing up. More input-handling tips: [Image API Essentials and Best Practices](/en/api-capabilities/image-api-best-practices).
</Tip>

## Mask Inpainting Requirements

* **Same size** as original, **PNG format**, **under 4MB**
* **Must have alpha channel**: transparent (alpha=0) = inpaint area, opaque = preserve
* Mask only applies to the **first** image
* Mask is a "soft guide" — the model may extend or contract around the masked region

<Tip>
  **Multi-turn iteration**: feed the previous output back as the next call's `image[]` with a new instruction to incrementally refine. Each round is independently token-billed — watch cumulative cost.
</Tip>

## Response Format

```json theme={null}
{
    "created": 1776832476,
    "data": [
        {
            "b64_json": "iVBORw0KGgoAAAANSUhEUgAA..."
        }
    ],
    "usage": {
        "input_tokens": 848,
        "input_tokens_details": {
            "image_tokens": 832,
            "text_tokens": 16
        },
        "output_tokens": 196,
        "output_tokens_details": {
            "image_tokens": 196,
            "text_tokens": 0
        },
        "total_tokens": 1044
    }
}
```

<Warning>
  `b64_json` is **raw base64**, **without** the `data:image/...;base64,` prefix — different from `gpt-image-2-all`. Decode it client-side to write a file, or prepend the prefix for browser rendering.
</Warning>

<Info>
  Edit requests' `input_tokens` are typically **significantly higher** than text-to-image at the same size, because reference images are billed per Vision pricing rules — the exact amount is available directly in `usage.input_tokens_details.image_tokens`, tracked separately from the text portion (`text_tokens`). Multi-image fusion increases `image_tokens` **strictly linearly** per additional reference image (verified July 2026: 4 × 1024² images = 4 × 1024 tokens) — see [How Multiple Input Images Affect the Price](/en/api-capabilities/gpt-image-2/overview#how-multiple-input-images-affect-the-price-verified-july-2026) for the measurement table. See [How to check the real token count for each call](/en/api-capabilities/gpt-image-2/overview#how-to-check-the-real-token-count-for-each-call) on the overview page for the full field reference.
</Info>


## OpenAPI

````yaml api-reference/gpt-image-2-edit-openapi-en.yaml POST /v1/images/edits
openapi: 3.1.0
info:
  title: gpt-image-2.5 / 2 Image Edit API
  description: >
    OpenAI GPT-Image 2.5 / 2 series (`gpt-image-2.5-sunburst` /
    `gpt-image-2.5-flare` / `gpt-image-2`) — image edit endpoint. Same price and
    parameters across all three; sunburst has the highest editing precision.


    - Supports single-image edit, multi-image fusion (up to 16 reference
    images), mask inpainting

    - Request format: `multipart/form-data`

    - In prompt, use "image 1 / image 2 / image 3" to reference `image` upload
    order

    - **Reference images auto-enable high-fidelity** — **do not** pass
    `input_fidelity` (will error)

    - Edit requests have noticeably higher input tokens than text-to-image at
    the same size


    **Authentication**: Add `Authorization: Bearer YOUR_API_KEY` to request
    headers


    **Get API Key**: Visit [APIYI Console](https://api.apiyi.com/token) to
    create a token
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
  - url: https://vip.apiyi.com
    description: Backup endpoint
security:
  - bearerAuth: []
paths:
  /v1/images/edits:
    post:
      tags:
        - Image Edit
      summary: 'Image Edit: edit or fuse reference images by instruction'
      description: >
        Use `gpt-image-2.5-sunburst` / `gpt-image-2.5-flare` / `gpt-image-2` to
        edit, fuse, or inpaint images by text instruction.


        - At least one `image` required (max 16)

        - multipart file upload: each image under 50MB, formats: png/jpg/webp
        (base64 data URL is bound by a ~20MiB field-length limit — keep
        originals ≤ 15MB)

        - `mask` field (optional) must match the original image's size, be PNG
        and under 4MB, and have an alpha channel (transparent = inpaint area)

        - mask only applies to the first image

        - Do not pass `input_fidelity` (forced high-fidelity, will error if
        passed)
      operationId: editGptImage2Image
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/EditImageRequest'
            encoding:
              image:
                contentType: image/png, image/jpeg, image/webp
              mask:
                contentType: image/png
      responses:
        '200':
          description: Image generated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: >-
            Invalid parameters (input_fidelity / background:transparent / size
            constraint violation, etc.)
        '401':
          description: Unauthorized - invalid API Key
        '403':
          description: Content moderation block
        '429':
          description: Rate limit or quota exceeded
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
        - image
      properties:
        model:
          type: string
          description: >-
            Model name. gpt-image-2.5-flare (speed-first) /
            gpt-image-2.5-sunburst (quality- and editing-first) / gpt-image-2
            (previous generation) share the same price and parameters; pin a
            dated snapshot in production
          enum:
            - gpt-image-2.5-flare
            - gpt-image-2.5-sunburst
            - gpt-image-2
            - gpt-image-2.5-flare-2026-09-08
            - gpt-image-2.5-sunburst-2026-09-08
          default: gpt-image-2.5-sunburst
        prompt:
          type: string
          maxLength: 32000
          description: >-
            Edit/fusion instruction, up to 32,000 characters (provider limit,
            counted in characters). For multi-image, use 'image 1 / image 2 /
            image 3' to reference upload order
          example: >-
            Place subject from image 1 into scene from image 2, using color
            style from image 3
        image:
          type: array
          description: >-
            Reference images. **For a single image, send the field once; for
            multiple images, repeat the same `image` field** (e.g., `-F
            image=@a.png -F image=@b.png`, **max 16**) — upload order maps to
            image 1 / image 2 / ... in the prompt. multipart file upload: each
            under 50MB, formats: png/jpg/webp; compress to within 1.5MB in
            practice
          items:
            type: string
            format: binary
        mask:
          type: string
          format: binary
          description: >
            Mask image (optional, only applies to first image). Requirements:

            - Same size as original

            - PNG format, under 4MB

            - Must have alpha channel (alpha=0 = inpaint area, opaque =
            preserve)
        size:
          type: string
          description: >-
            Output size (same as text-to-image). Preset or constraint-satisfying
            custom size
          example: 1536x1024
          default: auto
        quality:
          type: string
          description: Quality tier. xhigh / max are new in 2.5 and rejected by gpt-image-2
          enum:
            - auto
            - low
            - medium
            - high
            - xhigh
            - max
          default: auto
        output_format:
          type: string
          description: Output format
          enum:
            - png
            - jpeg
            - webp
          default: png
        output_compression:
          type: integer
          description: Output compression (0–100), only effective for jpeg/webp
          minimum: 0
          maximum: 100
        background:
          type: string
          description: 'Background mode. auto or opaque. **Not supported**: transparent'
          enum:
            - auto
            - opaque
          default: auto
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
          example: 1776832476
        data:
          type: array
          description: Generation results (this model returns 1 image per call)
          items:
            type: object
            properties:
              b64_json:
                type: string
                description: '**Raw base64 string** (no data:image/...;base64, prefix)'
                example: iVBORw0KGgoAAAANSUhEUgAA...
        usage:
          type: object
          description: Token usage for this call
          properties:
            input_tokens:
              type: integer
              example: 1280
            output_tokens:
              type: integer
              example: 6240
            total_tokens:
              type: integer
              example: 7520
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key obtained from APIYI Console

````