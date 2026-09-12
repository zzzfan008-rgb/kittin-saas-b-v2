> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Image Editing API Reference

> Grok Imagine 2 image editing API reference and live testing — upload 1-4 reference images plus an instruction for editing or fusion; requires multipart/form-data

<Info>
  The interactive Playground on the right accepts local file uploads. Enter your API Key in **Authorization** (format: `Bearer sk-xxx`), choose an `image` file, fill in `prompt` and `model`, and send.
</Info>

<Warning>
  **🔴 This endpoint requires `multipart/form-data` file upload**

  Sending JSON to `/v1/images/edits` **always returns 400**:

  ```text theme={null}
  request Content-Type isn't multipart/form-data
  ```

  **This matters especially if you are integrating from xAI or the upstream vendor's documentation**: that doc describes a JSON body with a public image URL (`{"image": {"type": "image_url", "url": "..."}}`), and that form does **not** work through the APIYI gateway. Follow this page instead.

  The upside: file upload means **no image hosting required** — just send the local file, which is simpler than preparing a public URL.

  The file field must be named **`image`** or **`image[]`**; `images` / `image_file` return **415**. `prompt` is required — omitting it returns 400.
</Warning>

<Tip>
  **When to use this page**: editing one reference image, or fusing several. For prompt-only generation, use the [Text-to-Image endpoint](/en/api-capabilities/grok-imagine-image/text-to-image).
</Tip>

<Warning>
  **⚠️ Output dimensions follow the FIRST reference image and cannot be changed**

  `resolution` and `aspect_ratio` are accepted here without error but have **no effect** — the edited output always matches **the first reference image's dimensions** (1280x720 in gives 1280x720 out; 1024x1024 in gives 1024x1024 out).

  The same applies to fusion: reversing the order of 4 references flipped the output from 1280x720 to 1024x1024, **following the new first image**.

  To change the output size, **crop or resize the first reference image before uploading**.
</Warning>

<Info>
  **Fusion order is meaningful**: `image[]` accepts **1-4** reference images (measured ceiling is 4; a fifth returns 400), and **the upload order is what "image 1 / image 2 / image 3" refers to in the prompt**. State it explicitly, e.g. "put the subject from image 1 into the scene from image 2, keeping image 2's art style".

  Measured across 2 / 3 / 4 references: **each additional image adds a corresponding subject to the output**, with each one's distinctive traits preserved — fusion genuinely works.
</Info>

## Code Examples

### Python (OpenAI SDK, single image)

```python theme={null}
from openai import OpenAI
import urllib.request

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    timeout=360.0
)

# The SDK's images.edit already performs a multipart upload — pass the file object directly
resp = client.images.edit(
    model="grok-imagine-image",
    image=open("fox.jpg", "rb"),
    prompt="Change the scarf color to bright RED. Keep everything else exactly the same.",
    n=1
)

urllib.request.urlretrieve(resp.data[0].url, "edited.jpg")
```

### Python (raw requests, single image)

```python theme={null}
import requests
import urllib.request

API_KEY = "sk-your-api-key"

# Key point: use files= so requests sets multipart/form-data and the boundary for you.
# Never use json= — that sends application/json and the gateway rejects it with 400.
with open("fox.jpg", "rb") as fp:
    response = requests.post(
        "https://api.apiyi.com/v1/images/edits",
        headers={"Authorization": f"Bearer {API_KEY}"},  # do NOT set Content-Type manually
        data={
            "model": "grok-imagine-image",
            "prompt": "Change the scarf to red, keep everything else exactly the same",
            "n": 1,
            "response_format": "url"
        },
        files={"image": ("fox.jpg", fp, "image/jpeg")},
        timeout=360
    ).json()

urllib.request.urlretrieve(response["data"][0]["url"], "edited.jpg")
```

### Python (multi-image fusion, 1-4 files)

```python theme={null}
import requests

API_KEY = "sk-your-api-key"

# Repeat the image[] field for multiple references — order is "image 1 / image 2"
files = [
    ("image[]", ("character.jpg", open("character.jpg", "rb"), "image/jpeg")),
    ("image[]", ("scene.jpg", open("scene.jpg", "rb"), "image/jpeg")),
]

response = requests.post(
    "https://api.apiyi.com/v1/images/edits",
    headers={"Authorization": f"Bearer {API_KEY}"},
    data={
        "model": "grok-imagine-image",
        "prompt": "Put the character from image 1 into the scene from image 2, "
                  "keeping image 2's art style and palette",
        "response_format": "url"
    },
    files=files,
    timeout=360
).json()

print(response["data"][0]["url"])
```

### cURL

```bash theme={null}
# Single-image edit: -F means multipart/form-data, @ uploads a local file
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=grok-imagine-image" \
  -F "prompt=Change the scarf to red, keep everything else exactly the same" \
  -F "n=1" \
  -F "response_format=url" \
  -F "image=@fox.jpg"
```

```bash theme={null}
# Multi-image fusion: repeat image[], order is "image 1 / image 2"
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=grok-imagine-image-quality" \
  -F "prompt=Put the character from image 1 into the scene from image 2, keep image 2's style" \
  -F "image[]=@character.jpg" \
  -F "image[]=@scene.jpg"
```

### Node.js (native fetch + FormData)

```javascript theme={null}
import fs from 'node:fs';

const form = new FormData();
form.append('model', 'grok-imagine-image');
form.append('prompt', 'Change the scarf to red, keep everything else exactly the same');
form.append('n', '1');
form.append('response_format', 'url');
// Single image uses `image`; for fusion append `image[]` repeatedly (max 3)
form.append('image', new Blob([fs.readFileSync('./fox.jpg')]), 'fox.jpg');

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    // Do not set Content-Type manually — let FormData supply the boundary
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form,
    signal: AbortSignal.timeout(360000)
});

const data = await resp.json();
const img = await fetch(data.data[0].url);
fs.writeFileSync('edited.jpg', Buffer.from(await img.arrayBuffer()));
```

### Browser JavaScript

```javascript theme={null}
// ⚠️ Demo only: a front-end key is exposed — use a backend proxy in production
const fileInput = document.querySelector('#file');   // an <input type="file"> element

const form = new FormData();
form.append('model', 'grok-imagine-image');
form.append('prompt', 'Replace the background with a snowy pine forest at night, keep the subject');
form.append('response_format', 'url');
form.append('image', fileInput.files[0]);

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});

const data = await resp.json();
document.querySelector('#preview').src = data.data[0].url;
```

## Parameter Reference

| Parameter          | Type    | Required | Default | Description                                                                                                                      |
| ------------------ | ------- | -------- | ------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `model`            | string  | ✅        | —       | `grok-imagine-image` (\$0.02/image) or `grok-imagine-image-quality` (\$0.045/image)                                              |
| `prompt`           | string  | ✅        | —       | Editing instruction. State what changes and that everything else stays put                                                       |
| `image`            | file    | ✅        | —       | Reference image file. For fusion repeat `image[]`, **1-4 files** (a fifth returns 400). **The first one sets output dimensions** |
| `n`                | integer | ❌        | `1`     | Output images, **1-10**, billed per image, independent of reference count                                                        |
| `response_format`  | string  | ❌        | `url`   | `url` returns a direct link; `b64_json` returns raw base64 (**no** `data:` prefix)                                               |
| ~~`resolution`~~   | string  | ❌        | —       | **No effect here** — output follows the input image                                                                              |
| ~~`aspect_ratio`~~ | string  | ❌        | —       | **No effect here** — output follows the input image                                                                              |

<Info>
  This family does **not support mask inpainting**. To limit the scope of a change, describe it precisely in the prompt — for example "change only the scarf to red, keep everything else exactly the same". The model follows such constraints closely.
</Info>

## Editing Behaviour and Prompt Style

The editing endpoint **preserves the input image's art style, composition, palette and subject identity**, changing only what the prompt specifies. For stable results:

| Prompt style                                                                         | Result                                                                  |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| ✅ `Change the scarf to red, keep everything else exactly the same`                   | Only the scarf changes; style, composition and background are preserved |
| ✅ `Add round black sunglasses to the cat, keep everything else unchanged`            | Only sunglasses are added; outline style and background colour stay put |
| ✅ `Put the character from image 1 into the scene from image 2, keep image 2's style` | Fusion that retains characteristics of both inputs                      |
| ⚠️ `Make it look better`                                                             | Too vague — the scope of change becomes unpredictable                   |

<Tip>
  **Explicitly saying "keep everything else unchanged"** is the single most effective technique with this model. For fusion, always refer to "image 1 / image 2" matching the `image[]` upload order.

  Also **put your most important subject first**: the first image not only sets output dimensions, but in testing a reversed order caused a secondary subject's identity to blend into another.
</Tip>

## Response Format

```json theme={null}
{
  "created": 0,
  "data": [
    {
      "url": "https://apac.ossforai.com/2026/08/12/09b026d5-3492-4678-907c-e25972e6c914.jpg"
    }
  ],
  "usage": {
    "prompt_tokens": 1000,
    "total_tokens": 1000
  }
}
```

<Warning>
  **Response field pitfalls**

  * Each `data[]` entry contains **either** `url` **or** `b64_json` depending on `response_format` — never both.
  * **`revised_prompt` is not returned** — do not assume it exists.
  * `b64_json` is **raw base64 with no `data:image/...;base64,` prefix** — decode it directly.
  * `created` is always `0` and cannot be used as a timestamp.
  * Output dimensions are determined by **the input image**, so do not predict width/height from request parameters.
</Warning>

<Info>
  **`usage` cannot be used for reconciliation**: `prompt_tokens` is always `1000 x n`, a placeholder. Editing costs **the same** as text-to-image at a flat rate per image; use the APIYI Console billing records for actual charges.
</Info>


## OpenAPI

````yaml api-reference/grok-imagine-image-edit-openapi-en.yaml POST /v1/images/edits
openapi: 3.1.0
info:
  title: Grok Imagine 2 Image Editing API
  description: >
    xAI Grok Imagine 2 image generation models — image editing endpoint.


    - **Requests must be `multipart/form-data` (file upload)** — sending JSON
    returns 400

    - Supports single-image editing and multi-image fusion (1-4 reference images
    via repeated `image[]`)

    - Reference fidelity is high: art style, composition, palette and subject
    identity are preserved;
      only what the prompt asks for changes
    - **Output dimensions follow the FIRST reference image**: `resolution` /
    `aspect_ratio` have no effect here

    - Flat per-request pricing, same as text-to-image


    **Auth**: add `Authorization: Bearer YOUR_API_KEY` to the request header.


    **Get API Key**: visit [APIYI Console](https://api.apiyi.com/token) to
    create a token.
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
        - Image Editing
      summary: 'Image editing: edit a reference image or fuse several'
      description: >
        Edit uploaded reference images with a text instruction using Grok
        Imagine 2 models.


        - **Must use `multipart/form-data`.** Sending `application/json`
        (including the
          `{"image": {"type": "image_url", "url": "..."}}` form shown in upstream vendor docs)
          always returns 400 `invalid_image_request`:
          `request Content-Type isn't multipart/form-data`
        - The file field must be named `image` or `image[]`; `images` /
        `image_file` return 415

        - `prompt` is required; omitting it returns 400

        - 1-4 reference images (measured ceiling is 4; a fifth returns 400);
        with multiple images refer to them as "image 1 / image 2" in the prompt
      operationId: editGrokImagineImage
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/GrokImagineEditRequest'
            encoding:
              image:
                contentType: image/png, image/jpeg, image/webp
      responses:
        '200':
          description: Image generated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: >-
            Request was not multipart/form-data, prompt missing, or content
            blocked by moderation
        '401':
          description: Unauthorized - invalid API Key
        '415':
          description: Unsupported file field name (only `image` / `image[]` are accepted)
        '429':
          description: Rate limit exceeded or insufficient balance
      security:
        - bearerAuth: []
components:
  schemas:
    GrokImagineEditRequest:
      type: object
      required:
        - model
        - prompt
        - image
      properties:
        model:
          type: string
          description: Model ID
          enum:
            - grok-imagine-image
            - grok-imagine-image-quality
          default: grok-imagine-image
        prompt:
          type: string
          description: >
            Editing instruction. State what to change and explicitly ask for
            everything else to stay put,

            e.g. `Change the scarf color to bright RED. Keep everything else
            exactly the same.`
          example: >-
            Change the scarf color to bright RED. Keep everything else exactly
            the same.
        image:
          type: string
          format: binary
          description: >
            Reference image file. For multi-image fusion repeat the `image[]`
            field (1-4 files);

            upload order is what "image 1 / image 2 / image 3" refers to in the
            prompt, and

            **the first file also determines output dimensions**. Each added
            image contributes

            a subject in testing. Accepted formats: png / jpg / webp.
        'n':
          type: integer
          description: >-
            Number of output images, 1-10. Independent of the number of
            reference images
          minimum: 1
          maximum: 10
          default: 1
          example: 1
        response_format:
          type: string
          description: >-
            Response format. `url` returns a direct link; `b64_json` returns raw
            base64 (no data: prefix)
          enum:
            - url
            - b64_json
          default: url
          example: url
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
          description: >-
            Creation timestamp. Always 0 for this model — do not use it for
            timing
          example: 0
        data:
          type: array
          description: Array of image results, length equals the requested `n`
          items:
            type: object
            properties:
              url:
                type: string
                description: Direct image link, returned when `response_format=url`
                example: >-
                  https://apac.ossforai.com/2026/08/12/09b026d5-3492-4678-907c-e25972e6c914.jpg
              b64_json:
                type: string
                description: >-
                  Raw base64 image data, returned when
                  `response_format=b64_json` (no data: prefix)
        usage:
          type: object
          description: >-
            **Placeholder values — do not use for billing reconciliation.**
            `prompt_tokens` is always `1000 x n`
          properties:
            prompt_tokens:
              type: integer
              example: 1000
            total_tokens:
              type: integer
              example: 1000
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key created in the APIYI Console

````