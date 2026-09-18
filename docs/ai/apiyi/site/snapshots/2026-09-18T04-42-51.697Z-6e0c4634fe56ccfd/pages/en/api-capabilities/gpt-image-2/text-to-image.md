> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Text-to-Image API Reference

> gpt-image-2.5-flare / gpt-image-2.5-sunburst / gpt-image-2 text-to-image API reference and live testing — any valid resolution (incl. 4K), token-billed, all three at the same price and parameters

<Info>
  The interactive Playground on the right supports live testing. Fill in your API Key in **Authorization** (format: `Bearer sk-xxx`), enter a prompt, choose size / quality, and send.
</Info>

<Tip>
  **Use case**: This page is for "text-to-image". Just enter a prompt — no image upload needed. For reference image editing, multi-image fusion, or mask inpainting, use the [Image Edit endpoint](/en/api-capabilities/gpt-image-2/image-edit).
</Tip>

<Warning>
  **🖥️ Browser Playground limitation (important)**

  This endpoint returns a **raw base64 string** (typically several MB) in the response. Due to browser rendering limits, the Playground on the right may show `请求时发生错误: unable to complete request` after the response arrives — **the request actually succeeded**; the browser just can't render such a long base64 string.

  **Recommended workflow** (beginner-friendly):

  * **Copy the Python / Node.js / cURL sample below and run it locally**. The code automatically `base64.b64decode`s the response and **writes the image to a file**.
  * If you must use the in-browser Playground, set `size` to the smallest tier (e.g. `1024x1024`) and `quality` to `low` to shrink the response.
</Warning>

<Info>
  All image APIs are **synchronous** — there is no task ID to poll, and if your client disconnects the result is lost while the request is still billed. Set a generous timeout for this model; see [Image API Essentials & Best Practices](/en/api-capabilities/image-api-best-practices).
</Info>

<Warning>
  **⚠️ Unsupported parameters**

  * `input_fidelity` — all three models force high-fidelity; passing it returns 400 (verified on 2.5 on 2026-09-09: `does not support the 'input_fidelity' parameter`). When migrating from 1.5, just remove the line.

  **Outputs above `2560×1440` remain experimental**. For production, prefer presets: `2048x1152` / `2048x2048` / `3840x2160`.
</Warning>

## Code Examples

### Python (OpenAI SDK)

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.generate(
    model="gpt-image-2.5-flare",
    prompt="Cyberpunk city at night, neon sign closeup, cinematic frame",
    size="2048x1152",
    quality="high",
    output_format="jpeg",
    output_compression=85
)

# b64_json is raw base64 (no prefix) — decode and write to file
with open("out.jpg", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### Python (Raw requests)

```python theme={null}
import requests
import base64

API_KEY = "sk-your-api-key"

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    },
    json={
        "model": "gpt-image-2.5-flare",
        "prompt": "Landscape 2K seaside lighthouse at sunset, cinematic frame",
        "size": "2048x1152",
        "quality": "high"
    },
    timeout=360  # high + 2K/4K can run 3-5 min; ~120s defaults will frequently false-timeout
).json()

with open("out.png", "wb") as f:
    f.write(base64.b64decode(response["data"][0]["b64_json"]))
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2.5-flare",
    "prompt": "Orange tabby cat with sunglasses at a seaside bar, cinematic",
    "size": "2048x1152",
    "quality": "high",
    "output_format": "jpeg",
    "output_compression": 85
  }'
```

### Node.js (Native fetch)

```javascript theme={null}
import fs from 'node:fs';

const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'gpt-image-2.5-flare',
        prompt: 'Minimalist line-art cat logo',
        size: '1024x1024',
        quality: 'medium'
    })
});

const { data } = await resp.json();
// b64_json is raw base64 — decode manually
fs.writeFileSync('logo.png', Buffer.from(data[0].b64_json, 'base64'));
```

### Browser JavaScript (Direct render)

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'gpt-image-2.5-flare',
        prompt: 'Watercolor-style Nordic aurora',
        size: '1536x1024',
        quality: 'high'
    })
});

const { data } = await resp.json();
// Browser rendering needs the data URL prefix prepended manually
document.getElementById('img').src = `data:image/png;base64,${data[0].b64_json}`;
```

## Parameter Reference

| Param                | Type   | Required | Default | Description                                                                                                                                                                                                                                                                                                                |
| -------------------- | ------ | -------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`              | string | Yes      | —       | `gpt-image-2.5-flare` (speed-first, everyday default) / `gpt-image-2.5-sunburst` (quality- and editing-first) / `gpt-image-2` (previous generation, still available); pin dated snapshots `gpt-image-2.5-flare-2026-09-08` / `gpt-image-2.5-sunburst-2026-09-08` in production. Same price and parameters across all three |
| `prompt`             | string | Yes      | —       | Prompt, Chinese or English; up to 32,000 characters (provider limit, counted in characters not tokens). Distill long material first, see [Long Prompts](/en/api-capabilities/image-long-prompt)                                                                                                                            |
| `size`               | string | No       | `auto`  | Output size — preset or constraint-satisfying custom                                                                                                                                                                                                                                                                       |
| `quality`            | string | No       | `auto`  | `low` / `medium` / `high` / `xhigh` / `max` / `auto`; `xhigh` / `max` are new in 2.5, `gpt-image-2` stops at `high`                                                                                                                                                                                                        |
| `output_format`      | string | No       | `png`   | `png` / `jpeg` / `webp`                                                                                                                                                                                                                                                                                                    |
| `output_compression` | int    | No       | —       | 0–100, only for `jpeg` / `webp`                                                                                                                                                                                                                                                                                            |
| `background`         | string | No       | `auto`  | `transparent` / `opaque` / `auto`. With `transparent`, `output_format` must be `png` or `webp` — pairing it with `jpeg` returns 400. See the [transparent background FAQ](/en/faq/image-transparent-background)                                                                                                            |
| `moderation`         | string | No       | `auto`  | `auto` / `low` (low-strength moderation)                                                                                                                                                                                                                                                                                   |
| `n`                  | int    | No       | 1       | Only 1 supported                                                                                                                                                                                                                                                                                                           |

<Warning>
  **Do not pass the legacy DALL·E values `standard` / `hd` for `quality`.** Only the six official enum values `low` / `medium` / `high` / `xhigh` / `max` / `auto` are accepted (`xhigh` / `max` by the two 2.5 models only). The legacy values behave inconsistently across backend channels: sometimes they fail immediately with a 400 (`invalid_value`), and sometimes they are silently ignored and the request runs at `auto` (unpredictable cost). Always pass one of the official values explicitly.
</Warning>

<Tip>
  Detailed constraints, allowed values, and examples are visible in the Playground on the right — all enum fields support dropdown selection.
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
        "input_tokens": 17,
        "input_tokens_details": {
            "image_tokens": 0,
            "text_tokens": 17
        },
        "output_tokens": 196,
        "output_tokens_details": {
            "image_tokens": 196,
            "text_tokens": 0
        },
        "total_tokens": 213
    }
}
```

<Warning>
  **⚠️ b64\_json is raw base64**, **without** the `data:image/...;base64,` prefix. Client must:

  * **Write file**: `base64.b64decode(b64_str)` → write to disk
  * **Browser render**: prepend `data:image/png;base64,` manually

  As of July 2026, `gpt-image-2-all` / `gpt-image-2-vip` also return raw base64, but their earlier versions included the prefix — when sharing code across models, always check `startsWith('data:')` first.
</Warning>

<Info>
  The `usage` field reflects actual billed tokens for this call. `input_tokens_details` / `output_tokens_details` break text and image tokens out separately (`image_tokens` is always 0 for plain text-to-image). For the full field reference and a self-service cost formula, see [How to check the real token count for each call](/en/api-capabilities/gpt-image-2/overview#how-to-check-the-real-token-count-for-each-call) on the overview page.
</Info>


## OpenAPI

````yaml api-reference/gpt-image-2-generate-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: gpt-image-2.5 / 2 Text-to-Image API
  description: >
    OpenAI GPT-Image 2.5 / 2 series (`gpt-image-2.5-flare` /
    `gpt-image-2.5-sunburst` / `gpt-image-2`) — text-to-image endpoint. Same
    price and parameters across all three.


    - Any valid resolution (1K / 2K / 4K, up to 3840×2160)

    - Quality tiers: low / medium / high / xhigh / max / auto (xhigh / max
    accepted by the two 2.5 models only)

    - Output formats: png (default) / jpeg / webp

    - Native Chinese prompt support

    - Single image per call (n=1)

    - Speed: flare is fastest; sunburst and gpt-image-2 are slower (4K high
    quality can take several minutes)

    - **Not supported**: transparent background (`background: transparent` will
    error)


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
  /v1/images/generations:
    post:
      tags:
        - Text-to-Image
      summary: 'Text-to-Image: generate image from text prompt'
      description: >
        Generate an image from a text prompt using `gpt-image-2.5-flare` /
        `gpt-image-2.5-sunburst` / `gpt-image-2`.


        - Required: `model`, `prompt`

        - Optional: `size`, `quality`, `output_format`, `output_compression`,
        `background`, `moderation`, `n`

        - Custom sizes must satisfy: max edge ≤ 3840px, both edges multiples of
        16, ratio ≤ 3:1, total pixels 0.65MP–8.3MP

        - For reference-image editing or multi-image fusion, use [Image Edit
        endpoint](/en/api-capabilities/gpt-image-2/image-edit)
      operationId: generateGptImage2TextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TextToImageRequest'
            example:
              model: gpt-image-2.5-flare
              prompt: Cyberpunk city at night, neon sign closeup, cinematic frame
              size: 2048x1152
              quality: high
              output_format: jpeg
              output_compression: 85
      responses:
        '200':
          description: Image generated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: >-
            Invalid parameters (size constraint violation, input_fidelity
            passed, background:transparent, etc.)
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
    TextToImageRequest:
      type: object
      required:
        - model
        - prompt
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
          default: gpt-image-2.5-flare
        prompt:
          type: string
          maxLength: 32000
          description: >-
            Prompt text, up to 32,000 characters (provider limit, counted in
            characters). Supports both Chinese and English. Place scene
            description at the front for better adherence.
          example: Cyberpunk city at night, neon sign closeup, cinematic frame
        size:
          type: string
          description: >
            Output size. Presets: 1024x1024 / 1536x1024 / 1024x1536 / 2048x2048
            / 2048x1152 / 3840x2160 / 2160x3840.

            Also accepts any valid custom size (max edge ≤ 3840, both multiples
            of 16, ratio ≤ 3:1, total pixels 0.65–8.3MP).
          example: 2048x1152
          default: auto
        quality:
          type: string
          description: >-
            Quality tier. low (sketches/batch), medium (daily), high (final/fine
            text), xhigh / max (new in 2.5: higher quality and cost, rejected by
            gpt-image-2), auto (default)
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
          example: 85
        background:
          type: string
          description: >-
            Background mode. auto (default) or opaque. **Not supported**:
            transparent
          enum:
            - auto
            - opaque
          default: auto
        moderation:
          type: string
          description: Moderation strength. auto (default) or low
          enum:
            - auto
            - low
          default: auto
        'n':
          type: integer
          description: Number of images. This model only supports 1
          enum:
            - 1
          default: 1
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
          description: Unix timestamp
          example: 1776832476
        data:
          type: array
          description: Generation results (this model returns 1 image per call)
          items:
            type: object
            properties:
              b64_json:
                type: string
                description: >-
                  **Raw base64 string** (no data:image/...;base64, prefix).
                  Client must decode to file or prepend prefix.
                example: iVBORw0KGgoAAAANSUhEUgAA...
        usage:
          type: object
          description: Token usage for this call (used for token-based billing)
          properties:
            input_tokens:
              type: integer
              example: 42
            output_tokens:
              type: integer
              example: 6240
            total_tokens:
              type: integer
              example: 6282
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key obtained from APIYI Console

````