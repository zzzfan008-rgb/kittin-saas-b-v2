> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Image Editing API Reference

> MAI-Image 2.6 image editing API reference with live Playground — upload 1–5 reference images plus an instruction to edit or fuse them, multipart/form-data file upload only; the number of reference images does not change the price

<Info>
  The interactive Playground on the right supports uploading local images. Enter your API key under **Authorization** (format: `Bearer sk-xxx`), pick one or more `image` files, fill in `prompt` and `model`, and send.
</Info>

<Warning>
  **🔴 This endpoint only accepts `multipart/form-data` file uploads**

  Sending JSON to `/v1/images/edits` (with `image` as a URL, data URI, or raw base64) returns 400:

  ```text theme={null}
  request Content-Type isn't multipart/form-data
  ```

  **Image URLs are not supported as input.** If you only have a URL, download it on your server first, then upload the file. File upload needs no image hosting; just send the local file.
</Warning>

<Tip>
  **Use case**: this page is for editing with reference images, covering single-image edits and fusing 1–5 images. To generate from text only, use the [Text-to-Image API](/en/api-capabilities/mai-image/text-to-image).
</Tip>

<Info>
  **🖼️ 1–5 reference images supported (since 2026-10-07)**

  * **How**: repeat the `image[]` field, one image per field. With the OpenAI SDK, pass a list: `client.images.edit(image=[f1, f2, ...])`. Repeating `image` also works
  * **Order**: images are numbered in upload order (image 1, image 2, …), so the prompt can say "put the fox from image 2 into image 1"
  * **Price**: billed per request; **1 image or 5 images costs the same**
  * **Formats**: JPEG, PNG, WebP; GIF and other formats return 400
  * **More than 5 images** returns 400 `at most 5 reference images are accepted for <model>`
</Info>

<Warning>
  **Do not use numbered field names such as `image` + `image2`**: the request returns 200 but **only the first image is used**; the second is dropped. `image1` + `image2` returns 500 `image is required`. For several images, always repeat `image[]`.
</Warning>

<Info>
  **Same forbidden parameters as text-to-image**: do not send `response_format`, `seed`, or `negative_prompt` (400). The response is always `data[0].b64_json` (PNG).
</Info>

## Code Examples

### Python (OpenAI SDK · single image)

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    timeout=180.0
)

# images.edit uses a multipart file upload under the hood; do not pass response_format
resp = client.images.edit(
    model="MAI-Image-2.6-Flash",
    image=open("teaset.jpg", "rb"),
    prompt="Change the teapot to a deep cobalt blue glaze, keep everything else identical"
)

with open("edited.png", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### Python (OpenAI SDK · multi-image fusion)

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    timeout=180.0
)

# Pass a list of 1-5 files; the SDK uploads each one as an image[] field
# Images are numbered in upload order (image 1, image 2, ...); same price as a single image
resp = client.images.edit(
    model="MAI-Image-2.6-Flash",
    image=[open("teaset.jpg", "rb"), open("fox.jpg", "rb")],
    prompt="Put the fox from image 2 (keeping every detail of its look) into the scene of image 1, sitting next to the tea set; keep everything else in image 1 unchanged"
)

with open("fused.png", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### Python (requests · single image)

```python theme={null}
import base64
import os
import requests

# Pass the file via files=; requests sets multipart/form-data and the boundary for you
# Do not use json=, and do not set Content-Type by hand
with open("teaset.jpg", "rb") as fp:
    response = requests.post(
        "https://api.apiyi.com/v1/images/edits",
        headers={"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"},
        data={
            "model": "MAI-Image-2.6",
            "prompt": "Change the teapot to a deep cobalt blue glaze, keep everything else exactly the same"
        },
        files={"image": ("teaset.jpg", fp, "image/jpeg")},
        timeout=180
    )
response.raise_for_status()

with open("edited.png", "wb") as f:
    f.write(base64.b64decode(response.json()["data"][0]["b64_json"]))
```

For several images, pass `files` as a list of tuples with one `image[]` per image (a dict cannot hold repeated keys):

```python theme={null}
files = [
    ("image[]", ("teaset.jpg", open("teaset.jpg", "rb"), "image/jpeg")),
    ("image[]", ("fox.jpg", open("fox.jpg", "rb"), "image/jpeg")),
]
```

### cURL

```bash theme={null}
# Single-image edit: -F means multipart/form-data, @ uploads a local file
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=MAI-Image-2.6-Flash" \
  -F "prompt=Change the teapot to a deep cobalt blue glaze, keep everything else identical" \
  -F "image=@teaset.jpg" \
  | python3 -c "import sys,json,base64; open('edited.png','wb').write(base64.b64decode(json.load(sys.stdin)['data'][0]['b64_json']))"
```

```bash theme={null}
# Edit and change the canvas to 1536×1024 (a different aspect ratio recomposes the image)
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=MAI-Image-2.6" \
  -F "prompt=Turn this tea set into a lifestyle scene on a wooden table, natural light, photorealistic" \
  -F "width=1536" \
  -F "height=1024" \
  -F "image=@teaset.jpg"
```

```bash theme={null}
# Multi-image fusion: repeat the image[] field, 1-5 images, numbered in upload order
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=MAI-Image-2.6-Flash" \
  -F "prompt=Put the fox from image 2 (keeping every detail of its look) into the scene of image 1, sitting next to the tea set; keep everything else in image 1 unchanged" \
  -F "image[]=@teaset.jpg" \
  -F "image[]=@fox.jpg" \
  | python3 -c "import sys,json,base64; open('fused.png','wb').write(base64.b64decode(json.load(sys.stdin)['data'][0]['b64_json']))"
```

### Node.js (fetch + FormData)

```javascript theme={null}
import fs from 'node:fs';

const form = new FormData();
form.append('model', 'MAI-Image-2.6-Flash');
form.append('prompt', 'Replace the background with a snowy pine forest at night, keep the person unchanged');
form.append('image', new Blob([fs.readFileSync('./photo.jpg')]), 'photo.jpg');
// Multi-image fusion: call form.append('image[]', ...) once per image instead, up to 5

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    // Do not set Content-Type by hand; FormData adds the boundary
    headers: { 'Authorization': `Bearer ${process.env.APIYI_API_KEY}` },
    body: form,
    signal: AbortSignal.timeout(120000)
});

const data = await resp.json();
fs.writeFileSync('edited.png', Buffer.from(data.data[0].b64_json, 'base64'));
```

## Parameter Reference

| Parameter | Type | Required | Default | Description |
| - | - | - | - | - |
| `model` | string | ✅ | — | `MAI-Image-2.6` (\$0.12/image) or `MAI-Image-2.6-Flash` (\$0.06/image), **case-sensitive** |
| `prompt` | string | ✅ | — | Edit instruction. State what to change and that everything else stays the same |
| `image` / `image[]` | file | ✅ | — | Reference image files, **1–5**. Use `image` for one image; for several, repeat the `image[]` field, numbered image 1…N in upload order. JPEG / PNG / WebP; the count does not change the price |
| `width` / `height` | integer | ❌ | Follows the original's ratio | Output size, same rules as text-to-image; a different aspect ratio **recomposes** the image |
| `n` | integer | ❌ | `1` | Number of images. **Works on this endpoint**, billed per image |
| ~~`mask`~~ | — | — | — | **Not supported**; returns 400 `<model> does not support mask edits` |
| ~~`response_format`~~ / ~~`seed`~~ / ~~`negative_prompt`~~ | — | — | — | **Return 400** |

<Info>
  **Output size when you omit it**: the output follows the original's aspect ratio snapped to multiples of 16, e.g. a 1344×756 input gives 1360×768; with several images, **image 1** sets the aspect ratio. For local edits that should keep the composition, do not send `width` / `height`.
</Info>

## Editing Results and Prompting

The editing endpoint **keeps the original's composition, colors, and details** and only changes what the prompt asks for:

<Frame>
  <img src="https://mintcdn.com/apiyillc/_zXMTnA1u6gpoDyM/images/mai-image-edit-teaset.jpg?fit=max&auto=format&n=_zXMTnA1u6gpoDyM&q=85&s=c86dc86c5aadf0173e19102433c01f49" alt="MAI-Image-2.6-Flash editing example: teapot recolored from cream to cobalt blue, everything else unchanged" width="1048" height="532" data-path="images/mai-image-edit-teaset.jpg" />
</Frame>

| Prompt | Result |
| - | - |
| ✅ `Change the teapot to a deep cobalt blue glaze, keep everything else exactly the same` | Only the teapot changes color; labels and other objects stay pixel-identical |
| ✅ `Turn this photo into a watercolor painting, keep the composition` | Style is repainted, composition kept |
| ⚠️ `Make it look better` | Too vague; the scope of changes is unpredictable |

<Tip>
  **Explicitly saying "keep everything else the same"** is the most effective technique with this model and preserves as much of the original as possible.
</Tip>

### Multi-Image Fusion

Image 1 serves as the base, and objects from the other reference images are placed into it as the prompt describes. The example below sends 5 images in one request (tea set + fox + rubber duck + alarm clock + cactus), with a prompt asking to place the fox from image 2, the yellow rubber duck from image 3, the red vintage alarm clock from image 4 and the potted cactus from image 5 onto the tea table in image 1, keeping each object's look and leaving the rest of image 1 unchanged:

<Frame>
  <img src="https://mintcdn.com/apiyillc/M34PNfQX341lt5W7/images/mai-image-multi-ref-5.jpg?fit=max&auto=format&n=M34PNfQX341lt5W7&q=85&s=0c18a285c65fa48646505b109e3600c7" alt="MAI-Image-2.6-Flash multi-image fusion example: 5 reference images in, all four objects placed into the tea set image with the rest unchanged" width="1200" height="1229" data-path="images/mai-image-multi-ref-5.jpg" />
</Frame>

| Prompt | Result |
| - | - |
| ✅ `Put the fox from image 2 into the scene of image 1, keep everything else in image 1 unchanged` | Refer to images as image N in upload order; the most reliable phrasing |
| ✅ Name the object in each image: `the yellow rubber duck from image 3, the red alarm clock from image 4` | With many images, naming each object keeps any from being left out |
| ⚠️ `Combine these images into one` | No base image or subject named, so the composition is unpredictable |

## Response Format

```json theme={null}
{
  "created": 1791000788,
  "data": [
    {
      "b64_json": "iVBORw0KGgoAAAANSUhEUgAABAAAAAQACAIAAADwf7zU..."
    }
  ],
  "usage": {
    "prompt_tokens": 1000,
    "total_tokens": 1000,
    "input_tokens": 1000,
    "output_tokens": 0
  }
}
```

<Warning>
  **Response fields**

  * `b64_json` is **plain base64 without a `data:` prefix** and decodes to a PNG.
  * With `n > 1` the `data` array has several items; don't read only `data[0]`.
  * No `url` and no `revised_prompt` are returned.
</Warning>

<Info>
  **Do not reconcile billing with `usage`**: it holds placeholders (`prompt_tokens` is always 1000 × the image count). Editing **costs the same** as text-to-image, billed per image, and **the number of reference images does not change the price**; the APIYI console bill is authoritative.
</Info>


## OpenAPI

````yaml api-reference/mai-image-edit-openapi-en.yaml POST /v1/images/edits
openapi: 3.1.0
info:
  title: MAI-Image 2.6 Image Editing API
  description: >
    Microsoft MAI-Image 2.6 image generation — image editing endpoint.


    - **The request must be `multipart/form-data` (file upload)**; JSON or image
    URLs return 400

    - **1–5 reference images**: use `image` for one; for several, repeat the
    `image[]` field (pass a list with the OpenAI SDK), numbered image 1…N in
    upload order. **Do not use numbered field names such as `image2`** (the
    second image is dropped)

    - No mask support; do not send `response_format` / `seed` /
    `negative_prompt`

    - Flat per-image pricing, same as text-to-image, regardless of the number of
    reference images; `n` works on this endpoint and is billed per image


    **Authentication**: add `Authorization: Bearer YOUR_API_KEY` to the request
    headers


    **Get an API key**: create a token in the [APIYI
    console](https://api.apiyi.com/token)
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
security:
  - bearerAuth: []
paths:
  /v1/images/edits:
    post:
      tags:
        - Image Editing
      summary: 'Image editing: edit reference images (1–5)'
      description: >
        Edit or fuse 1–5 uploaded reference images from a text instruction with
        MAI-Image 2.6.


        - **Must use `multipart/form-data`**. Sending `application/json` returns
          400: `request Content-Type isn't multipart/form-data`
        - **Multi-image fusion**: repeat the `image[]` field, up to 5 images
        (more returns 400); `image` + `image2` uses only the first image; a
        `mask` field returns 400

        - Reference images must be JPEG / PNG / WebP

        - Without `width` / `height` the output follows the original's ratio; a
        different aspect ratio recomposes the image
      operationId: editMaiImage
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/MaiImageEditRequest'
            encoding:
              image:
                contentType: image/png, image/jpeg, image/webp
      responses:
        '200':
          description: Image generated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: >-
            Not multipart/form-data, more than 5 or unsupported-format reference
            images, a mask field, invalid parameters, or blocked by moderation
        '401':
          description: Unauthorized - invalid API key
        '429':
          description: Rate limit exceeded or insufficient balance
        '500':
          description: >-
            No image file field in the request, or numbered field names such as
            `image1` + `image2` (`image is required`)
      security:
        - bearerAuth: []
components:
  schemas:
    MaiImageEditRequest:
      type: object
      required:
        - model
        - prompt
        - image
      properties:
        model:
          type: string
          description: Model ID (case-sensitive)
          enum:
            - MAI-Image-2.6-Flash
            - MAI-Image-2.6
          default: MAI-Image-2.6-Flash
        prompt:
          type: string
          description: >-
            Edit instruction. State what to change and that everything else
            stays the same
          example: >-
            Change the teapot to a deep cobalt blue glaze, keep everything else
            identical
        image:
          type: array
          items:
            type: string
            format: binary
          minItems: 1
          maxItems: 5
          description: >-
            Reference image files, 1–5, numbered image 1…N in upload order. png
            / jpg / webp. In code, repeat the `image[]` field for several images
        width:
          type: integer
          description: >-
            Optional output width. Same rules as text-to-image: each side ≥ 768,
            width × height ≤ 2,359,296, sent together with `height`
          minimum: 768
        height:
          type: integer
          description: Optional output height, same rules as `width`
          minimum: 768
        'n':
          type: integer
          description: Number of images. Works on this endpoint, billed per image
          minimum: 1
          default: 1
          example: 1
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
          description: Creation timestamp
          example: 1791000788
        data:
          type: array
          description: Image results; length equals `n`
          items:
            type: object
            properties:
              b64_json:
                type: string
                description: 'Plain base64 image data (PNG, no data: prefix)'
        usage:
          type: object
          description: >-
            **Placeholder values, not for billing reconciliation.**
            `prompt_tokens` is always `1000 × images`
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
      description: API key from the APIYI console

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.