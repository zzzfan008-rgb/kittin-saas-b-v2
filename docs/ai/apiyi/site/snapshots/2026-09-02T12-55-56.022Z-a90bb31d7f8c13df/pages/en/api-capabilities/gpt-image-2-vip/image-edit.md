> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Image Editing API Reference

> gpt-image-2-vip image editing API reference and interactive playground — upload reference images + instructions for single-image edits or multi-image fusion. Use size to lock output dimensions.

<Info>
  The interactive Playground on the right supports direct local image upload. Enter your API Key in the **Authorization** field (format: `Bearer sk-xxx`), pick the image, set `prompt` / `model` / `size`, then click send.
</Info>

<Tip>
  **Scope**: This page is for **editing or fusing one or more reference images**. The request uses `multipart/form-data`. For pure text-to-image, see the [Text-to-Image endpoint](/en/api-capabilities/gpt-image-2-vip/text-to-image).

  **Difference vs `gpt-image-2-all`**: identical call structure, just one extra `size` field. If you don't need to lock dimensions and want fastest output, use [`gpt-image-2-all`](/en/api-capabilities/gpt-image-2-all/image-edit).
</Tip>

<Warning>
  **🖥️ Browser Playground limitation**

  This endpoint **returns a base64 string (`b64_json`) by default**, which can be several MB, so the browser Playground may show `请求时发生错误: unable to complete request` — **the request actually succeeded**; the browser just can't render such a long base64 string.

  **Recommended workflow**: when you want base64 or need to upload very large reference images, **copy the code sample below and run it locally**.
</Warning>

<Warning>
  **📎 Multi-image fusion order matters**

  The `image` field accepts multiple reference images. **The order is the basis for "image1 / image2 / image3" references in your prompt.** Reference them explicitly in the prompt, e.g.:

  > Place the person from image1 into the scene of image2, in the painting style of image3

  Recommended **≤ 10MB per image**, formats `png` / `jpg` / `webp`. Overly large images may hit gateway limits.
</Warning>

<Tip>
  **🎯 Shape-preserving edits**: When you pass `size=auto` (or omit `size`), the output **inherits the aspect ratio of whichever reference image the prompt names as the edit target** — **not necessarily the first one** in multi-image scenarios.

  For example, with the prompt "**modify image2**, change image2's outfit and hat to match image1", if image2 is 1:1, the output is 1:1 (even if image1 is a landscape 16:9).

  Useful for outfit swaps, adding accessories, retouching, and other shape-preserving edits. If the prompt doesn't pick a target, the model decides on its own; pass an explicit 30-bucket `size` only when you need to change the aspect ratio.
</Tip>

<Warning>
  **⚠️ Key parameter notes**

  * **`size`**: **for editing, prefer `auto` (or omit the field)** — the model preserves the aspect ratio of **whichever reference image the prompt names as the target of the edit**, not necessarily the first one in multi-image scenarios. For example, with the prompt "modify image2, change image2's outfit to match image1", the output ratio matches image2; if the prompt doesn't disambiguate, the model decides on its own. To force a different dimension, pick one of the 30 supported sizes; use lowercase ASCII `x`, e.g., `2048x1360`, `3840x2160`. Full table: [overview page](/en/api-capabilities/gpt-image-2-vip/overview#supported-sizes-full-30-size-table).
  * **`quality`**: ❌ rejected — **do not pass**.
  * **`n`**: ❌ rejected — single image per call.
  * **`response_format`**: omitting it returns base64 (raw, no prefix, verified July 2026); pass `"url"` for an image URL. Businesses that **depend on URL output** should switch their token to the `image2_OSS` group for deterministic URL output with no base64 fallback.
</Warning>

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
            "model": "gpt-image-2-vip",
            "prompt": "Replace the background with a sunset beach",
            "size": "2048x1360"          # 3:2 2K Recommended
        },
        files=[
            ("image", ("photo.png", f, "image/png"))
        ],
        timeout=300  # conservative; absorbs upload + long-tail
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
            "model": "gpt-image-2-vip",
            "prompt": "Place the person from image1 into the scene of image2, in the style of image3",
            "size": "2048x2048"          # 1:1 2K Recommended
        },
        files=[
            ("image", ("ref1.png", f1, "image/png")),
            ("image", ("ref2.png", f2, "image/png")),
            ("image", ("ref3.png", f3, "image/png"))
        ],
        timeout=300
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
  -F "model=gpt-image-2-vip" \
  -F "prompt=Replace the background with a sunset beach" \
  -F "size=2048x1360" \
  -F "image=@./photo.png"
```

**Multi-image fusion**:

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2-vip" \
  -F "prompt=Place the person from image1 into the scene of image2, in the style of image3" \
  -F "size=2048x2048" \
  -F "image=@./ref1.png" \
  -F "image=@./ref2.png" \
  -F "image=@./ref3.png"
```

### Node.js (native fetch + FormData)

```javascript theme={null}
import fs from 'node:fs';

const form = new FormData();
form.append('model', 'gpt-image-2-vip');
form.append('prompt', 'Replace the background with outer space');
form.append('size', '2048x1360');
form.append(
  'image',
  new Blob([fs.readFileSync('./photo.png')]),
  'photo.png'
);

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});
const data = await resp.json();
console.log(data.data[0].url);
```

### Browser JavaScript (File objects)

```javascript theme={null}
// <input type="file" id="fileInput" multiple>
const files = document.getElementById('fileInput').files;
const form = new FormData();
form.append('model', 'gpt-image-2-vip');
form.append('prompt', 'Fuse these images into a single poster');
form.append('size', '2048x2048');
for (const f of files) form.append('image', f);

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});
const { data } = await resp.json();
document.getElementById('result').src = data[0].url;
```

## Parameters

| Field    | Type | Required | Description                                                                                                                                                                                            |
| -------- | ---- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `model`  | text | Yes      | Fixed at `gpt-image-2-vip`                                                                                                                                                                             |
| `prompt` | text | Yes      | Natural-language edit/fusion description                                                                                                                                                               |
| `image`  | file | Yes      | Reference image; can be repeated (array field)                                                                                                                                                         |
| `size`   | text | No       | Output size: `auto` (default — **follows whichever reference image the prompt names as the edit target**, not necessarily the first one) or one of the 30 sizes; format `WIDTHxHEIGHT` (lowercase `x`) |

<Tip>
  **Multi-turn iteration**: feed the previous output back as the next call's `image` with a new edit instruction to refine progressively. Each round can specify its own `size`.
</Tip>

## Response Format

Same as the text-to-image endpoint: **returns base64 by default** (`data[0].b64_json`, raw base64 with no prefix, verified July 2026). For an **image URL**, pass `response_format: "url"` explicitly; businesses that **depend on URL output** should switch their token to the **`image2_OSS` group** for deterministic URL output with no base64 fallback. `data[0]` returns either `url` or `b64_json` — never both.

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

**`url` mode** (pass `response_format: "url"` explicitly; use the `image2_OSS` group if you depend on URLs):

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

## Related Resources

<CardGroup cols={2}>
  <Card title="Model Overview (full size table)" icon="sparkles" href="/en/api-capabilities/gpt-image-2-vip/overview">
    Complete 30-size table, pricing, technical specs
  </Card>

  <Card title="Text-to-Image API" icon="wand-sparkles" href="/en/api-capabilities/gpt-image-2-vip/text-to-image">
    `/v1/images/generations` compatible endpoint
  </Card>

  <Card title="Sister model gpt-image-2-all" icon="copy" href="/en/api-capabilities/gpt-image-2-all/image-edit">
    Same call format when you don't need locked size — faster output
  </Card>
</CardGroup>


## OpenAPI

````yaml api-reference/gpt-image-2-vip-edit-openapi-en.yaml POST /v1/images/edits
openapi: 3.1.0
info:
  title: gpt-image-2-vip Image Editing API
  description: >
    GPT image generation reverse-engineered model `gpt-image-2-vip` (Codex line)
    — image editing endpoint.


    - Supports single-image editing and multi-image fusion (repeat the `image`
    field for multiple uploads; order is preserved)

    - Request format is `multipart/form-data`

    - Reference upload order in prompts as "image1/image2/image3"

    - Supports 30 explicit sizes (10 ratios × 1K / 2K / 4K, flat $0.03/image
    across all tiers)

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
      summary: 'Image editing: edit or fuse reference images with locked output size'
      description: >
        Edit or fuse reference images with `gpt-image-2-vip` and lock the output
        dimension via `size`.


        - Provide at least one reference image via the `image` field

        - For multiple reference images, **repeat the same `image` field** —
        e.g., `-F image=@a.png -F image=@b.png` (upload order maps to "image1 /
        image2 / ..." in the prompt)

        - Recommended ≤ 10MB per image, formats png/jpg/webp

        - Strongly recommend passing `size` (one of the 30 sizes); do not pass
        `quality` / `n`

        - For pure text-to-image, use the [Text-to-Image
        endpoint](/en/api-capabilities/gpt-image-2-vip/text-to-image)
      operationId: editGptImage2VipImage
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
        '400':
          description: size not in the 30-size set, or malformed
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
          description: Model name, fixed to gpt-image-2-vip
          enum:
            - gpt-image-2-vip
          default: gpt-image-2-vip
        prompt:
          type: string
          description: >-
            Edit/fusion instruction. For multi-image flows, reference upload
            order as image1/image2/image3
          example: >-
            Place the person from image1 into the scene of image2, in the style
            of image3
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
        size:
          type: string
          description: >
            Output size. **For editing, prefer `auto` (or omit the field)** —
            the model preserves the aspect ratio of **whichever reference image
            the prompt names as the target of the edit** (not necessarily the
            first one in multi-image scenarios). For example, with the prompt
            "modify image2, change image2's outfit to match image1", the output
            ratio matches image2. If the prompt doesn't disambiguate, the model
            decides on its own. To force a different dimension, pick one of the
            30 supported sizes; format: `WIDTHxHEIGHT` with lowercase ASCII `x`,
            e.g., `2048x1360`, `3840x2160`. Flat $0.03/image across all tiers.
          enum:
            - auto
            - 1280x1280
            - 848x1280
            - 1280x848
            - 960x1280
            - 1280x960
            - 1024x1280
            - 1280x1024
            - 720x1280
            - 1280x720
            - 1280x544
            - 2048x2048
            - 1360x2048
            - 2048x1360
            - 1536x2048
            - 2048x1536
            - 1632x2048
            - 2048x1632
            - 1152x2048
            - 2048x1152
            - 2048x864
            - 2880x2880
            - 2336x3520
            - 3520x2336
            - 2480x3312
            - 3312x2480
            - 2560x3216
            - 3216x2560
            - 2160x3840
            - 3840x2160
            - 3840x1632
          example: 2048x1360
    ImageResponse:
      type: object
      description: >
        Image editing response. **Returns base64 by default**
        (`data[0].b64_json`); to get a `url`, switch to the `image2_OSS` group
        with `response_format=url`. `data[0]` returns **either `url` or
        `b64_json`, never both**.
      properties:
        data:
          type: array
          description: Result array (this model returns 1 image per call)
          items:
            type: object
            properties:
              url:
                type: string
                description: >-
                  R2 CDN accelerated link (returned when using the image2_OSS
                  group with response_format=url)
              b64_json:
                type: string
                description: >-
                  Base64-encoded data URL (returned by default; already includes
                  the data:image/png;base64, prefix)
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