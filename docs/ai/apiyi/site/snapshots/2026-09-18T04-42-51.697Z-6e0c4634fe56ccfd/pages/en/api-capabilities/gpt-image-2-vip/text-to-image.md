> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Text-to-Image API Reference

> gpt-image-2-vip text-to-image API reference and interactive playground — generate images from text + size, $0.03/image flat across all sizes

<Info>
  The interactive Playground on the right supports direct online testing. Enter your API Key in the **Authorization** field (format: `Bearer sk-xxx`), set `prompt` and `size`, then click send.
</Info>

<Tip>
  **Scope**: This page is for **text-to-image generation**. Just enter a prompt and `size` — no image upload required. To edit or fuse existing images, use the [Image Editing endpoint](/en/api-capabilities/gpt-image-2-vip/image-edit).

  **Difference vs `gpt-image-2-all`**: identical call structure, just one extra `size` field. If you don't need to lock dimensions and want fastest output, use [`gpt-image-2-all`](/en/api-capabilities/gpt-image-2-all/text-to-image) instead.
</Tip>

<Warning>
  **🖥️ Browser Playground limitation**

  This endpoint **returns a base64 string (`b64_json`) by default**, which can be several MB, so the browser Playground may show `请求时发生错误: unable to complete request` — **the request actually succeeded**; the browser just can't render such a long base64 string.

  **Recommended workflow**: **copy the code sample below and run it locally** — it decodes the image and saves it to a file automatically.
</Warning>

<Info>
  All image APIs are **synchronous** — there is no task ID to poll, and if your client disconnects the result is lost while the request is still billed. Set a generous timeout for this model; see [Image API Essentials & Best Practices](/en/api-capabilities/image-api-best-practices).
</Info>

<Warning>
  **⚠️ Key parameter notes**

  * **`size`**: pass `auto` to let the model choose (vip tends to converge on a relatively **fixed/stable** size for a given prompt), or pick one of the 30 supported sizes (10 ratios × 1K Fast / 2K Recommended / 4K Detail — see the [full size table on the overview page](/en/api-capabilities/gpt-image-2-vip/overview#supported-sizes-full-30-size-table)) for strict locking. Use lowercase ASCII `x`, e.g., `2048x1360`, `3840x2160` — never `×` or uppercase `X`.
  * **`quality`**: ❌ rejected — **do not pass**.
  * **`n`**: ❌ rejected — single image per call. **Sending `n=3` charges 3× but still returns 1 image.** Drop the field.
  * **`aspect_ratio`**: ❌ rejected — ratio is determined by `size`.
  * **`response_format`**: omitting it returns base64 (raw, no prefix, verified 2026-07); pass `"url"` for an image URL. Businesses that **depend on URL output** should switch their token to the `image2_OSS` group for deterministic URL output with no base64 fallback.
</Warning>

## Code Examples

### Python

```python theme={null}
import requests

API_KEY = "sk-your-api-key"

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
        "model": "gpt-image-2.5-vip",
        "prompt": "Cinematic landscape, old lighthouse by the sea at dusk, photorealistic",
        "size": "2048x1152",         # 16:9 2K Recommended
        "response_format": "url"     # defaults to base64; explicit response_format needed to read the url field
    },
    timeout=300  # conservative; absorbs long-tail and image download
).json()

image_url = response["data"][0]["url"]
print(image_url)
```

**4K Detail tier example (wallpaper / print)**:

```python theme={null}
import requests

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={"Authorization": "Bearer sk-your-api-key"},
    json={
        "model": "gpt-image-2.5-vip",
        "prompt": "Desktop wallpaper, cyberpunk city night, neon signs, wet pavement reflections",
        "size": "3840x2160"          # 16:9 4K Detail
    },
    timeout=300
).json()

# Verified 2026-07: b64_json is raw base64 (no data: prefix); earlier versions included the prefix — a check is safest
import base64
b64 = response["data"][0]["b64_json"]
if b64.startswith("data:"):
    b64 = b64.split(",", 1)[1]
with open("wallpaper.png", "wb") as f:
    f.write(base64.b64decode(b64))
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2.5-vip",
    "prompt": "Product shot of a white ceramic mug on a gray desk, soft natural light",
    "size": "2048x1360"
  }'
```

### Node.js

```javascript theme={null}
const API_KEY = "sk-your-api-key";

const response = await fetch(
  "https://api.apiyi.com/v1/images/generations",
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-image-2.5-vip",
      prompt: "1:1 square logo, minimalist cat line art",
      size: "2048x2048"        // 1:1 2K Recommended
    })
  }
);

const data = await response.json();
// Verified raw base64 (no data: prefix) — prepend before rendering; earlier versions included the prefix, so check first
let b64 = data.data[0].b64_json;
if (!b64.startsWith("data:")) b64 = `data:image/png;base64,${b64}`;
document.getElementById("result").src = b64;
```

### OpenAI SDK (Python, recommended)

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.generate(
    model="gpt-image-2.5-vip",
    prompt="Ink wash landscape painting, traditional Chinese style, vertical composition",
    size="1536x2048",        # 3:4 2K Portrait
)
print(resp.data[0].url)
```

## Parameters

| Parameter | Type   | Required                 | Description                                                                                                                                                                                       |
| --------- | ------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`   | string | Yes                      | `gpt-image-2.5-vip` (= `gpt-image-2.5-sunburst-vip`) / `gpt-image-2.5-flare-vip` / previous-generation `gpt-image-2-vip`, same price and call format                                              |
| `prompt`  | string | Yes                      | Prompt — describe content, style, lighting, etc.                                                                                                                                                  |
| `size`    | string | **Strongly recommended** | Output size: `auto` (model decides — **vip stays relatively fixed for a given prompt**) or one of the 30 sizes; format `WIDTHxHEIGHT` (lowercase `x`); omitting the field is equivalent to `auto` |

<Tip>
  **Size cheat-sheet** — these cover most cases:

  * E-commerce hero shots: `2048x1360` (3:2 2K) / `2048x2048` (1:1 2K)
  * Vertical posters: `1536x2048` (3:4 2K) / `2480x3312` (3:4 4K)
  * Video thumbnails: `2048x1152` (16:9 2K) / `3840x2160` (16:9 4K)
  * Story / phone wallpapers: `1152x2048` (9:16 2K) / `2160x3840` (9:16 4K)

  Full 30-size table: [overview page](/en/api-capabilities/gpt-image-2-vip/overview#supported-sizes-full-30-size-table).
</Tip>

## Response Format

**Returns base64 by default** (`data[0].b64_json`, raw base64 without prefix, verified 2026-07). To get an **image URL** instead, pass `response_format: "url"` explicitly; businesses that **depend on URL output** should switch their token's group to **`image2_OSS`** for stable URL output with no base64 fallback. `data[0]` returns either `url` or `b64_json` — never both.

**`b64_json` mode** (default):

```json theme={null}
{
  "data": [
    {
      "b64_json": "iVBORw0KGgoAAAANSUhEUgAA..."
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

**`url` mode** (pass `response_format: "url"` explicitly; use the `image2_OSS` group if you depend on URLs — R2 CDN globally accelerated):

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
  **Compatibility note**: verified July 2026 — the `b64_json` field is **raw base64 without the `data:` prefix**; decode it to write a file, or prepend the prefix yourself before rendering. **Earlier versions did include the prefix**, so always run a `startsWith('data:')` check first to handle both shapes.
</Warning>

## Related Resources

<CardGroup cols={2}>
  <Card title="Model Overview (full size table)" icon="sparkles" href="/en/api-capabilities/gpt-image-2-vip/overview">
    Complete 30-size table, pricing, technical specs
  </Card>

  <Card title="Image Editing API" icon="image" href="/en/api-capabilities/gpt-image-2-vip/image-edit">
    `/v1/images/edits` multi-image fusion and editing
  </Card>

  <Card title="Sister model gpt-image-2-all" icon="copy" href="/en/api-capabilities/gpt-image-2-all/text-to-image">
    Same call format when you don't need locked size — faster output (\~30–60s)
  </Card>
</CardGroup>


## OpenAPI

````yaml api-reference/gpt-image-2-vip-generate-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: gpt-image-2-vip Text-to-Image API
  description: >
    GPT image generation reverse-engineered model `gpt-image-2-vip` (Adobe line,
    Firefly) — text-to-image endpoint.


    - Per-call billing, $0.03/image (flat across all sizes; no surcharge for 4K)

    - Supports 30 explicit sizes (10 ratios × 1K Fast / 2K Recommended / 4K
    Detail)

    - ~90–150s generation time, supports Chinese prompts

    - `quality` works in testing (all six tiers on the 2.5 models, up to `high`
    on `gpt-image-2-vip`; channel behavior, not a commitment); n / aspect_ratio
    are not supported

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
  /v1/images/generations:
    post:
      tags:
        - Text-to-Image
      summary: 'Text-to-Image: generate at an explicit size from a text prompt'
      description: >
        Generate images with `gpt-image-2-vip` from a text prompt and lock the
        output dimension via `size`.


        - `model` and `prompt` required; `size` strongly recommended

        - `size` must be one of the 30 supported sizes (see overview page)

        - `quality` is optional (see the field description); do not pass `n`

        - For editing or multi-image fusion, use the [Image Editing
        endpoint](/en/api-capabilities/gpt-image-2-vip/image-edit)
      operationId: generateGptImage2VipTextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TextToImageRequest'
            example:
              model: gpt-image-2.5-vip
              prompt: >-
                Cinematic landscape, old lighthouse by the sea at dusk,
                photorealistic
              size: 2048x1152
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
    TextToImageRequest:
      type: object
      required:
        - model
        - prompt
      properties:
        model:
          type: string
          description: >-
            Model name: gpt-image-2.5-vip (= sunburst-vip) /
            gpt-image-2.5-flare-vip / gpt-image-2-vip, same price and call
            format
          enum:
            - gpt-image-2.5-vip
            - gpt-image-2.5-sunburst-vip
            - gpt-image-2.5-flare-vip
            - gpt-image-2-vip
          default: gpt-image-2.5-vip
        prompt:
          type: string
          description: Prompt — describe content, style, lighting, etc.
          example: >-
            Cinematic landscape, old lighthouse by the sea at dusk,
            photorealistic
        quality:
          type: string
          description: >
            Quality tier (works in testing; channel behavior, not a commitment —
            go by the actual response). All six tiers on the 2.5 models
            (`gpt-image-2.5-vip` / `gpt-image-2.5-sunburst-vip` /
            `gpt-image-2.5-flare-vip`); `gpt-image-2-vip` stops at `high` and
            rejects `xhigh` / `max`.

            Same-named tiers are not equal: 2.5 `high` only equals
            `gpt-image-2-vip` `medium`, and 2.5 `max` equals its `high`. The
            flat $0.03 does not change with the tier, but latency rises with it.
          enum:
            - auto
            - low
            - medium
            - high
            - xhigh
            - max
          example: high
        size:
          type: string
          description: >
            Output size. Pass `auto` to let the model decide (vip tends to
            converge on a relatively fixed size for a given prompt), or pick one
            of the 30 supported sizes (10 ratios × 1K Fast / 2K Recommended / 4K
            Detail) to lock it strictly.

            Format: `WIDTHxHEIGHT` with lowercase ASCII `x`, e.g., `2048x1360`,
            `3840x2160`. Flat $0.03/image across all tiers.
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
          example: 2048x1152
    ImageResponse:
      type: object
      description: >
        Image generation response. **Returns base64 by default**
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