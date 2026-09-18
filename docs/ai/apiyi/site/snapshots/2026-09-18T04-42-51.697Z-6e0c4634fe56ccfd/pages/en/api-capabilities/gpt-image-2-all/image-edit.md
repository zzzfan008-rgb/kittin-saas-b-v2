> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Image Editing API Reference

> gpt-image-2-all image editing API reference and interactive playground — upload reference images + instructions for single-image editing or multi-image fusion

<Info>
  The interactive Playground on the right supports direct local file upload. Enter your API Key in the **Authorization** field (format: `Bearer sk-xxx`), select images, fill in `prompt` and `model`, then click send.
</Info>

<Tip>
  **Scope**: This page is for **editing or fusing one or more reference images**. Requests use `multipart/form-data`. For pure text-to-image generation, use the [Text-to-Image endpoint](/en/api-capabilities/gpt-image-2-all/text-to-image).
</Tip>

<Warning>
  **🖥️ Browser Playground limitation (default b64\_json mode)**

  This endpoint **defaults to `response_format: "b64_json"`**, so the response carries a multi-MB base64 string and the browser Playground may show `请求时发生错误: unable to complete request` — **the request actually succeeded**; the browser just can't render such a long base64 string.

  **Recommended workflow**:

  * Just want to view the image in the Playground? **Pass `"response_format": "url"` explicitly** — the response is a single R2 link and renders fine.
  * Want base64 or uploading large reference images? **Copy the code sample below and run it locally** — the code handles upload and decoding automatically.
</Warning>

<Warning>
  **📎 Multi-image order matters**

  The `image` field can be repeated to upload multiple reference images. **The order determines how "image1/image2/image3" in the prompt are resolved.** We recommend referring to them explicitly, e.g.:

  > Put the person from image1 into the scene of image2, using the art style of image3

  Recommended **≤ 10MB per image**, formats `png` / `jpg` / `webp`. Overly large images may hit gateway limits.
</Warning>

<Tip>
  **🎯 Shape-preserving edits**: This endpoint's output aspect ratio **follows whichever reference image the prompt names as the edit target** — **not necessarily the first one** in multi-image scenarios.

  For example, with the prompt "**modify image2**, change image2's outfit and hat to match image1", if image2 is 1:1, the output is 1:1 (even if image1 is a landscape 16:9).

  Useful for outfit swaps, adding accessories, retouching, and other shape-preserving edits. **The `size` field has no effect on this model** (sending any value is silently ignored — for strict size locking, use [`gpt-image-2-vip`](/en/api-capabilities/gpt-image-2-vip/image-edit)). If the prompt doesn't pick a target, the model decides on its own.
</Tip>

## Code Examples

### Python

**Single-image edit**:

```python theme={null}
import requests

API_KEY = "sk-your-api-key"

with open("photo.png", "rb") as f:
    response = requests.post(
        "https://api.apiyi.com/v1/images/edits",
        headers={"Authorization": f"Bearer {API_KEY}"},
        data={
            "model": "gpt-image-2.5-all",
            "prompt": "Change the background to a seaside sunset",
            "response_format": "url"
        },
        files=[
            ("image", ("photo.png", f, "image/png"))
        ],
        timeout=300  # conservative — absorbs tail latency + image upload/download time
    ).json()

print(response["data"][0]["url"])
```

**Multi-image fusion**:

```python theme={null}
import requests

with open("ref1.png", "rb") as f1, \
     open("ref2.png", "rb") as f2, \
     open("ref3.png", "rb") as f3:
    response = requests.post(
        "https://api.apiyi.com/v1/images/edits",
        headers={"Authorization": "Bearer sk-your-api-key"},
        data={
            "model": "gpt-image-2.5-all",
            "prompt": "Put the person from image1 into the scene of image2, using the art style of image3",
            "response_format": "b64_json"
        },
        files=[
            ("image", ("ref1.png", f1, "image/png")),
            ("image", ("ref2.png", f2, "image/png")),
            ("image", ("ref3.png", f3, "image/png"))
        ],
        timeout=300  # conservative — absorbs tail latency + image upload/download time
    ).json()

# Verified July 2026: b64_json is raw base64 (no data: prefix); earlier versions
# included the prefix, so a defensive check is safest
import base64
b64 = response["data"][0]["b64_json"]
if b64.startswith("data:"):
    b64 = b64.split(",", 1)[1]
with open("edited.png", "wb") as f:
    f.write(base64.b64decode(b64))
```

### cURL

**Single-image edit**:

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2.5-all" \
  -F "prompt=Change the background to a seaside sunset" \
  -F "response_format=url" \
  -F "image=@./photo.png"
```

**Multi-image fusion**:

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2.5-all" \
  -F "prompt=Put the person from image1 into the scene of image2, using the art style of image3" \
  -F "response_format=b64_json" \
  -F "image=@./ref1.png" \
  -F "image=@./ref2.png" \
  -F "image=@./ref3.png"
```

### Node.js (native fetch + FormData)

```javascript theme={null}
import fs from 'node:fs';
import { Agent, setGlobalDispatcher } from 'undici';

// Editing uploads a reference image and waits on an MB-scale body, while undici's
// default connect timeout is only 10s and is NOT governed by AbortSignal.timeout
// below (different layers) — widen all three explicitly
setGlobalDispatcher(new Agent({
  connect: { timeout: 30_000 },
  headersTimeout: 300_000,
  bodyTimeout: 300_000,
}));

const form = new FormData();
form.append('model', 'gpt-image-2.5-all');
form.append('prompt', 'Change the background to outer space');
form.append('response_format', 'url');
form.append(
  'image',
  new Blob([fs.readFileSync('./photo.png')]),
  'photo.png'
);

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    signal: AbortSignal.timeout(300_000),   // total timeout — a different layer
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});
const data = await resp.json();
console.log(data.data[0].url);
```

<Tip>
  The `undici` import above needs installing separately (`npm i undici`) — it powers the built-in `fetch` but is not exposed under that module name, and the copy you install still reaches the built-in `fetch` through `setGlobalDispatcher`.

  `maxRetries`, `connectTimeout` and the total request timeout all live at different layers, and configuring the wrong one is the most common Node-side pitfall. For connection resets, `UND_ERR_CONNECT_TIMEOUT`, or truncated large responses behind a proxy, see [Troubleshooting Image API Connection Drops](/en/api-capabilities/image-connection-drops).
</Tip>

### Browser JavaScript (File objects)

```javascript theme={null}
// <input type="file" id="fileInput" multiple>
const files = document.getElementById('fileInput').files;
const form = new FormData();
form.append('model', 'gpt-image-2.5-all');
form.append('prompt', 'Fuse these images into one poster');
form.append('response_format', 'url');
for (const f of files) form.append('image', f);

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});
const { data } = await resp.json();
document.getElementById('result').src = data[0].url;
```

## Parameters Quick Reference

| Field             | Type | Required | Description                                                                                                                                                                                                                                                                                                               |
| ----------------- | ---- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`           | text | Yes      | `gpt-image-2.5-all` or `gpt-image-2-all` (same price and behavior)                                                                                                                                                                                                                                                        |
| `prompt`          | text | Yes      | Natural-language edit/fusion instruction                                                                                                                                                                                                                                                                                  |
| `image`           | file | Yes      | Reference image; can be repeated                                                                                                                                                                                                                                                                                          |
| `size`            | text | No       | **Field has no effect; sending any value is silently ignored.** Output aspect ratio **follows whichever reference image the prompt names as the edit target** (not necessarily the first one in multi-image scenarios). For strict size locking, use [`gpt-image-2-vip`](/en/api-capabilities/gpt-image-2-vip/image-edit) |
| `response_format` | text | No       | `b64_json` (default) or `url`                                                                                                                                                                                                                                                                                             |

<Tip>
  **Multi-turn iteration**: Feed the previous output image back as `image` input with new instructions to iteratively refine the result.
</Tip>

## Response Format

Same as the text-to-image endpoint: **`data[0]` returns either `url` or `b64_json` — never both** (depends on `response_format`). This endpoint **defaults to `b64_json`**.

**`b64_json` mode** (default):

```json theme={null}
{
  "data": [
    {
      "b64_json": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
    }
  ],
  "created": 1778037127,
  "usage": {
    "input_tokens": 98,
    "output_tokens": 1185,
    "total_tokens": 1283
  }
}
```

**`url` mode** (requires explicit `"response_format": "url"`):

```json theme={null}
{
  "data": [
    {
      "url": "https://r2cdn.copilotbase.com/r2cdn2/0e82148a-bec0-4b42-bbca-117c6b42581b.png"
    }
  ],
  "created": 1778037331,
  "usage": {
    "input_tokens": 30,
    "output_tokens": 2074,
    "total_tokens": 2104
  }
}
```

<Warning>
  Verified July 2026: the `b64_json` field is **raw base64 without the `data:` prefix** — decode it or prepend the prefix yourself before rendering. **Earlier versions did include the prefix**, so always check `startsWith('data:')` first to handle both shapes.
</Warning>


## OpenAPI

````yaml api-reference/gpt-image-2-all-edit-openapi-en.yaml POST /v1/images/edits
openapi: 3.1.0
info:
  title: gpt-image-2-all Image Editing API
  description: >
    GPT image generation reverse-engineered model `gpt-image-2-all` — image
    editing endpoint.


    - Supports single-image editing and multi-image fusion (repeat the `image`
    field for multiple uploads; order is preserved)

    - Request format is `multipart/form-data`

    - Reference upload order in prompts as "image1/image2/image3"

    - **The `size` field has no effect** (sending any value is silently ignored,
    no error). The output aspect ratio **follows whichever reference image the
    prompt names as the edit target** — not necessarily the first one in
    multi-image scenarios. For example, with the prompt "modify image2", the
    output ratio matches image2; if the prompt doesn't disambiguate, the model
    decides on its own. For strict size locking, use `gpt-image-2-vip`.

    - **Defaults to base64 (`b64_json`); can switch to R2 CDN URL (`url`)**.
    `data[0]` returns either `url` **or** `b64_json` — never both in the same
    response.


    **Authentication**: Add `Authorization: Bearer YOUR_API_KEY` to request
    headers


    **Get API Key**: Visit [API易 Console](https://api.apiyi.com/token) to create
    a token
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
      summary: 'Image editing: edit or fuse reference images with instructions'
      description: >
        Use `gpt-image-2-all` to edit or fuse input images based on a text
        instruction.


        - Provide at least one reference image via the `image` field

        - For multiple reference images, **repeat the same `image` field** —
        e.g., `-F image=@a.png -F image=@b.png` (upload order maps to "image1 /
        image2 / ..." in the prompt)

        - Recommended ≤ 10MB per image, formats png/jpg/webp

        - For pure text-to-image generation, use the [Text-to-Image
        endpoint](/en/api-capabilities/gpt-image-2-all/text-to-image)
      operationId: editGptImage2AllImage
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/EditImageRequest'
            encoding:
              image:
                contentType: image/png, image/jpeg, image/webp
      responses:
        '200':
          description: >-
            Image successfully generated. Defaults to base64 in
            `data[0].b64_json` — `url` is not returned in the same response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
              example:
                data:
                  - b64_json: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
                created: 1778037127
                usage:
                  input_tokens: 98
                  output_tokens: 1185
                  total_tokens: 1283
        '401':
          description: Unauthorized - Invalid API Key
        '429':
          description: Rate limited or quota exhausted
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
            Model name: gpt-image-2.5-all or gpt-image-2-all (same ChatGPT web
            line, same price and behavior)
          enum:
            - gpt-image-2.5-all
            - gpt-image-2-all
          default: gpt-image-2.5-all
        prompt:
          type: string
          description: >-
            Edit/fusion instruction. For multi-image fusion, reference upload
            order as image1/image2/image3
          example: >-
            Put the person from image1 into the scene of image2, using the art
            style of image3
        image:
          type: array
          description: >-
            Reference images. **For a single image, send the field once; for
            multiple images, repeat the same `image` field** (e.g., `-F
            image=@a.png -F image=@b.png`) — upload order maps to image1 /
            image2 / ... in the prompt. Recommended ≤ 10MB each, formats png /
            jpg / webp.
          items:
            type: string
            format: binary
        response_format:
          type: string
          description: >-
            Response format. b64_json returns a base64 string already prefixed
            with a data URL header (default); url returns an R2 CDN link
          enum:
            - b64_json
            - url
          default: b64_json
    ImageResponse:
      type: object
      description: >
        Image editing response. `data[0]` returns **either `url` or `b64_json`,
        never both** (depends on `response_format`; this endpoint defaults to
        `b64_json`).
      properties:
        data:
          type: array
          description: Result array (this model returns 1 image per call)
          items:
            type: object
            properties:
              url:
                type: string
                description: R2 CDN accelerated link (returned when response_format=url)
              b64_json:
                type: string
                description: >-
                  Base64-encoded data URL (returned when
                  response_format=b64_json; already includes the
                  data:image/png;base64, prefix)
        created:
          type: integer
          description: Unix timestamp (seconds)
        usage:
          type: object
          description: Token usage statistics
          properties:
            input_tokens:
              type: integer
              description: Input tokens
            output_tokens:
              type: integer
              description: Output tokens (includes image-pixel accounting)
            total_tokens:
              type: integer
              description: Total tokens
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key from the API易 Console

````