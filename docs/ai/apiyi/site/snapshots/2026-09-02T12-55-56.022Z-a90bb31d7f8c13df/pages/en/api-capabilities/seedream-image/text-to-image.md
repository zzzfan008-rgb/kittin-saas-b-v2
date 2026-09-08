> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Text-to-Image API Reference

> Seedream text-to-image API reference and live Playground — pure text prompts, 1K/2K/3K/4K and exact pixel sizes, three versions on a single endpoint

<Info>
  The interactive Playground on the right lets you call the API directly. Set **Authorization** to your API key (format: `Bearer sk-xxx`), enter a prompt, pick a model and size, and hit send.
</Info>

<Tip>
  **Scope**: this page covers pure text-to-image (no `image` field). For reference-image editing, multi-image fusion, or batch sequence generation, see [Image Editing](/en/api-capabilities/seedream-image/image-edit) — same endpoint, just different parameters.
</Tip>

<Warning>
  **🖥️ Browser Playground limitation (b64\_json mode only)**

  In the default `response_format: "url"` mode, the Playground works fine (the response is just a temporary BytePlus TOS link). If you switch to `response_format: "b64_json"`, the response contains a multi-MB base64 string and the browser Playground may show `请求时发生错误: unable to complete request` — **the request actually succeeded**; the browser just can't render such a long base64 string.

  **Recommended workflow**:

  * Just want to view the image? **Keep the default `url` mode** — the Playground returns the link directly (remember to download to your own storage within 24 hours).
  * Need b64\_json? **Copy the code sample below and run it locally** — the code will decode and save the image to a file automatically.
</Warning>

<Warning>
  **⚠️ Resolution tiers vary by version**

  * `seedream-5-0-pro-260628` — presets `1K` / `2K` plus exact WxH up to 4.19M total pixels (at 16:9 the longest edge reaches 2720×1530, verified; no 3K/4K presets; `sequential_image_generation` / `stream` not accepted — passing them returns 400; \~2 min per image)
  * `seedream-5-0-260128` — `2K` / `3K` only (no 4K)
  * `seedream-4-5-251128` — `2K` / `4K`
  * `seedream-4-0-250828` — `1K` / `2K` / `4K`

  **Unsupported sizes return 400**. Exact pixels must satisfy total ∈ \[1280×720, 4096×4096] and aspect ratio ∈ \[1/16, 16].
</Warning>

<Info>
  All image APIs are **synchronous** — there is no task ID to poll, and if your client disconnects the result is lost while the request is still billed. Set a generous timeout for this model; see [Image API Essentials & Best Practices](/en/api-capabilities/image-api-best-practices).
</Info>

## Code Examples

### Python (OpenAI SDK)

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.generate(
    model="seedream-5-0-260128",
    prompt="A modern tech product launch poster with bold typography, sleek smartphone on gradient background, text: 'Innovation 2026', ultra detailed, professional",
    size="2K",
    response_format="url",
    extra_body={
        "output_format": "png",
        "watermark": False,
    }
)

print(resp.data[0].url)
```

### Python (raw requests)

```python theme={null}
import requests

API_KEY = "sk-your-api-key"

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    },
    json={
        "model": "seedream-5-0-260128",
        "prompt": "A serene Japanese garden with cherry blossoms, koi pond, traditional wooden bridge, golden hour, ultra detailed",
        "size": "2K",
        "response_format": "url",
        "watermark": False
    },
    timeout=60  # ~15s typical, 4K + hd may reach 30-60s
).json()

print(response["data"][0]["url"])
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "seedream-5-0-260128",
    "prompt": "A futuristic cityscape at night with neon lights and flying vehicles, cyberpunk style, high detail",
    "size": "2K",
    "response_format": "url",
    "watermark": false
  }'
```

### Node.js (fetch)

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'seedream-5-0-260128',
        prompt: 'Minimalist line-art logo of a cat, monochrome, vector style',
        size: '2K',
        response_format: 'url',
        output_format: 'png',
        watermark: false
    })
});

const { data } = await resp.json();
console.log(data[0].url);
```

### Browser JavaScript

```javascript theme={null}
{/* Demo only — proxy through your backend in production to avoid leaking the key */}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'seedream-5-0-260128',
        prompt: 'Watercolor northern lights over snowy mountains',
        size: '2K'
    })
});

const { data } = await resp.json();
document.getElementById('img').src = data[0].url;
```

## Parameter Reference

| Parameter         | Type    | Required | Default | Description                                                                                                                                                                                                                                                               |
| ----------------- | ------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`           | string  | yes      | —       | `seedream-5-0-260128` / `seedream-4-5-251128` / `seedream-4-0-250828` / `seedream-5-0-pro-260628` (pro tier, \$0.12/request)                                                                                                                                              |
| `prompt`          | string  | yes      | —       | Prompt text. Supports English and Chinese. Be detailed about scene, style, lighting.                                                                                                                                                                                      |
| `size`            | string  | no       | `2K`    | Preset tier (varies by version) or exact pixels `WxH`                                                                                                                                                                                                                     |
| `response_format` | string  | no       | `url`   | `url` returns a signed link; `b64_json` returns a plain base64 string                                                                                                                                                                                                     |
| `output_format`   | string  | no       | `jpeg`  | 5.0 supports `png` / `jpeg`; 4.5 / 4.0 only `jpeg` (pass via `extra_body` in OpenAI SDK)                                                                                                                                                                                  |
| `n`               | integer | —        | —       | ⚠️ **Not supported upstream**: the parameter is silently ignored — you still get 1 image and are billed for 1. For multi-image output use `sequential_image_generation` (billed per generated image), see [Image Editing](/en/api-capabilities/seedream-image/image-edit) |
| `seed`            | integer | —        | —       | ⚠️ Officially supported only by seedream-3-0-t2i; ignored by the current 4.x / 5.x models                                                                                                                                                                                 |
| `watermark`       | boolean | no       | varies  | Whether to include the BytePlus watermark (set `false` for commercial use)                                                                                                                                                                                                |
| `stream`          | boolean | no       | `false` | Streaming output, useful for long prompts + high resolution                                                                                                                                                                                                               |

<Tip>
  Detailed parameter constraints, allowed values, and examples are visible in the Playground panel on the right. **Editing / multi-image parameters (`image`, `sequential_image_generation`, etc.) are documented on the [Image Editing](/en/api-capabilities/seedream-image/image-edit) page.**
</Tip>

## Response Format

```json theme={null}
{
  "model": "seedream-5-0-260128",
  "created": 1768518000,
  "data": [
    {
      "url": "https://ark-content-generation-v2-ap-southeast-1.tos-ap-southeast-1.bytepluses.com/seedream-5-0/.../image.png",
      "size": "2048x2048"
    }
  ],
  "usage": {
    "generated_images": 1,
    "output_tokens": 6240,
    "total_tokens": 6240
  }
}
```

<Warning>
  **⚠️ Response field caveats**

  * When `response_format=url`, `data[].url` is a **temporary signed BytePlus TOS URL** (typically valid for 24 hours). For production, download immediately to your own storage.
  * When `response_format=b64_json`, `data[].b64_json` is a **plain base64 string**, **without** the `data:image/...;base64,` prefix. Decode it (`base64.b64decode`) for file output, or prepend the prefix yourself for browser rendering.
  * `data[].size` reflects the **actual output size**, which may differ slightly from the requested `size` after the model's aspect-ratio normalization.
</Warning>

<Info>
  `usage.generated_images` reflects the billed image count. Seedream bills per image; `output_tokens` / `total_tokens` are observability metrics and do not affect billing.
</Info>


## OpenAPI

````yaml api-reference/seedream-image-generate-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: Seedream Text-to-Image API
  description: >
    BytePlus ModelArk Seedream image generation models — text-to-image endpoint
    (no `image` field).


    - Active versions unified: `seedream-5-0-260128` / `seedream-4-5-251128` /
    `seedream-4-0-250828` / `seedream-5-0-pro-260628` (pro tier, \$0.12 per
    request, ~2 min per image)

    - Resolution tiers vary by version (5.0: 2K/3K; 4.5: 2K/4K; 4.0: 1K/2K/4K;
    5.0-pro: 1K/2K plus WxH up to 4.19M total px, longest edge ~2720 at 16:9)

    - Output format: 5.0 / 5.0-pro support png/jpeg; 4.5/4.0 only jpeg

    - 5.0-pro does not accept `sequential_image_generation` / `stream` — passing
    them returns 400

    - Latency ≈ 15s per image, may extend to 30-60s for 4K + hd

    - Default 500 RPM (Max Images per Minute)

    - For editing, multi-image fusion, or batch sequence generation, see [Image
    Editing](/en/api-capabilities/seedream-image/image-edit) (same endpoint,
    different params)


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
  /v1/images/generations:
    post:
      tags:
        - Text-to-Image
      summary: 'Text-to-Image: generate an image from a text prompt'
      description: >
        Generate an image with the Seedream models from a text prompt.


        - Required: `model`, `prompt`

        - Optional: `size`, `response_format`, `output_format`, `watermark`,
        `stream`

        - Note: OpenAI's `n` parameter is not supported upstream (silently
        ignored — you still get 1 image); for multi-image output use
        `sequential_image_generation`

        - Resolution tiers vary by version — see [Overview / Technical
        Specs](/en/api-capabilities/seedream-image/overview#technical-specs)

        - For reference-image editing or multi-image fusion, use the same
        endpoint with `image` and `sequential_image_generation` — see [Image
        Editing](/en/api-capabilities/seedream-image/image-edit)
      operationId: generateSeedreamTextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SeedreamGenerateRequest'
            example:
              model: seedream-5-0-260128
              prompt: >-
                A modern tech product launch poster, sleek smartphone on
                gradient background, text: 'Innovation 2026', ultra detailed,
                professional
              size: 2K
              response_format: url
              output_format: png
              watermark: false
      responses:
        '200':
          description: Image generated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SeedreamImageResponse'
        '400':
          description: >-
            Invalid parameters (size not supported by this version, pixel out of
            range, aspect ratio out of bounds)
        '401':
          description: Unauthorized — invalid API key
        '403':
          description: Blocked by content moderation
        '429':
          description: Rate limit (default 500 RPM) or insufficient balance
        '500':
          description: Internal server error
      security:
        - bearerAuth: []
components:
  schemas:
    SeedreamGenerateRequest:
      type: object
      required:
        - model
        - prompt
      properties:
        model:
          type: string
          description: Model ID
          enum:
            - seedream-5-0-260128
            - seedream-5-0-lite-260128
            - seedream-4-5-251128
            - seedream-4-0-250828
            - seedream-5-0-pro-260628
          default: seedream-5-0-260128
        prompt:
          type: string
          description: >-
            Prompt, supports both English and Chinese. Describe scene, style,
            and lighting in detail for better results.
          example: >-
            A serene Japanese garden with cherry blossoms, koi pond, traditional
            bridge, golden hour, ultra detailed
        size:
          type: string
          description: >
            Output size. Preset tiers (vary by version):

            - `1K` (~1024×1024) — 4.0 only

            - `2K` (~2048×2048) — 5.0 / 4.5 / 4.0

            - `3K` (~3072×3072) — 5.0 only

            - `4K` (~4096×4096) — 4.5 / 4.0


            Or exact pixel size `WxH`, total pixels ∈ \[1280×720, 4096×4096\],
            aspect ratio ∈ \[1/16, 16\]
          example: 2K
          default: 2K
        response_format:
          type: string
          description: >-
            url returns a temp signed link (24h validity); b64_json returns
            plain base64 (no data: prefix)
          enum:
            - url
            - b64_json
          default: url
        output_format:
          type: string
          description: Output format. 5.0 supports png/jpeg; 4.5/4.0 only jpeg
          enum:
            - png
            - jpeg
          default: jpeg
        seed:
          type: integer
          description: >-
            Random seed. Note: officially supported only by seedream-3-0-t2i;
            ignored by the current 4.x / 5.x models
          example: 42
        watermark:
          type: boolean
          description: >-
            Whether to include the BytePlus watermark. Set to false for
            commercial use
          default: false
        stream:
          type: boolean
          description: >-
            Enable streaming output. Useful for long prompts and high-resolution
            generation
          default: false
    SeedreamImageResponse:
      type: object
      properties:
        model:
          type: string
          example: seedream-5-0-260128
        created:
          type: integer
          description: Unix timestamp
          example: 1768518000
        data:
          type: array
          items:
            type: object
            properties:
              url:
                type: string
                description: >-
                  Image URL (returned when response_format=url; signed temp URL
                  valid for 24h)
                example: >-
                  https://ark-content-generation-v2-ap-southeast-1.tos-ap-southeast-1.bytepluses.com/seedream-5-0/.../image.png
              b64_json:
                type: string
                description: >-
                  Plain base64 string (no data:image/...;base64, prefix).
                  Returned when response_format=b64_json.
              size:
                type: string
                description: >-
                  Actual output size, may differ slightly from requested due to
                  aspect-ratio adjustments
                example: 2048x2048
        usage:
          type: object
          properties:
            generated_images:
              type: integer
              description: Actual billed image count
              example: 1
            output_tokens:
              type: integer
              example: 6240
            total_tokens:
              type: integer
              example: 6240
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key obtained from APIYI Console

````