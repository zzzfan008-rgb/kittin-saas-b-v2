> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Text-to-Image API Reference

> gpt-image-2-all text-to-image API reference and interactive playground — generate images from text prompts, $0.03/image

<Info>
  The interactive Playground on the right supports direct online testing. Enter your API Key in the **Authorization** field (format: `Bearer sk-xxx`), type a prompt, and click send.
</Info>

<Tip>
  **Scope**: This page is for **text-to-image generation**. Just enter a prompt — no image upload required. To edit or fuse existing images, use the [Image Editing endpoint](/en/api-capabilities/gpt-image-2-all/image-edit).
</Tip>

<Warning>
  **🖥️ Browser Playground limitation (default b64\_json mode)**

  This endpoint **defaults to `response_format: "b64_json"`**, so the response carries a multi-MB base64 string and the browser Playground may show `请求时发生错误: unable to complete request` — **the request actually succeeded**; the browser just can't render such a long base64 string.

  **Recommended workflow**:

  * Just want to view the image in the Playground? **Pass `"response_format": "url"` explicitly** — the response is a single R2 link and renders fine.
  * Want base64? **Copy the code sample below and run it locally** — the code will decode and save the image to a file automatically.
</Warning>

<Info>
  All image APIs are **synchronous** — there is no task ID to poll, and if your client disconnects the result is lost while the request is still billed. Set a generous timeout for this model; see [Image API Essentials & Best Practices](/en/api-capabilities/image-api-best-practices).
</Info>

<Warning>
  **⚠️ Parameter Support**

  * **`size`**: **the field has no effect** — sending `auto` or any concrete value does not error, but the value is **silently ignored** by the server. Dimensions are driven entirely by the prompt:
    * Prompt mentions a size/ratio (e.g., "Landscape 16:9") → the model follows the prompt
    * Prompt has no size hints → the same prompt yields **varied dimensions** across calls, like "drawing different cards" — useful for exploring multiple compositions
    * For strict size locking, use [`gpt-image-2-vip`](/en/api-capabilities/gpt-image-2-vip/text-to-image) (supports `auto` + 30 explicit sizes)
  * **`n` / `quality` / `aspect_ratio`**: ❌ rejected. Sending these may trigger parameter validation errors.

  Write size and ratio directly into the `prompt`, e.g.:

  * `Landscape 16:9 cinematic, old lighthouse by the sea at dusk`
  * `Portrait 9:16 phone wallpaper, cyberpunk city rainy night`
  * `1024×1024 square logo, minimalist cat line art`

  **Put size descriptions at the front of the prompt** for better adherence.
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
        "model": "gpt-image-2-all",
        "prompt": "Landscape 16:9 cinematic, old lighthouse at sunset, photorealistic",
        "response_format": "url"
    },
    timeout=300  # conservative — absorbs tail latency + image download time
).json()

image_url = response["data"][0]["url"]
print(image_url)
```

**b64\_json mode (returns base64 image data)**:

```python theme={null}
import base64
import requests

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={"Authorization": "Bearer sk-your-api-key"},
    json={
        "model": "gpt-image-2-all",
        "prompt": "1024x1024 square logo, minimalist cat line art",
        "response_format": "b64_json"
    },
    timeout=300  # conservative — absorbs tail latency + image download time
).json()

# Verified 2026-07: b64_json is raw base64 (no data: prefix); earlier versions included the prefix — a check is safest
b64 = response["data"][0]["b64_json"]
if b64.startswith("data:"):
    b64 = b64.split(",", 1)[1]
with open("output.png", "wb") as f:
    f.write(base64.b64decode(b64))
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2-all",
    "prompt": "Landscape 16:9 cinematic, old lighthouse at sunset",
    "response_format": "url"
  }'
```

### Node.js

```javascript theme={null}
import { Agent, setGlobalDispatcher } from "undici";
import { writeFile } from "node:fs/promises";

const API_KEY = "sk-your-api-key";

// Image endpoints mean long silences plus MB-scale bodies, while undici's default
// connect timeout is only 10s and is NOT governed by AbortSignal.timeout below
// (different layers) — widen all three explicitly
setGlobalDispatcher(new Agent({
  connect: { timeout: 30_000 },
  headersTimeout: 300_000,
  bodyTimeout: 300_000,
}));

const response = await fetch(
  "https://api.apiyi.com/v1/images/generations",
  {
    method: "POST",
    signal: AbortSignal.timeout(300_000),   // total timeout — a different layer
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-image-2-all",
      prompt: "1024x1024 square logo, minimalist cat line art",
      response_format: "b64_json"
    })
  }
);

const data = await response.json();
// Verified raw base64 (no data: prefix); earlier versions included one, so check first
let b64 = data.data[0].b64_json;
if (b64.startsWith("data:")) b64 = b64.slice(b64.indexOf(",") + 1);
await writeFile("output.png", Buffer.from(b64, "base64"));
```

<Tip>
  The `undici` import above needs installing separately (`npm i undici`) — it powers the built-in `fetch` but is not exposed under that module name, and the copy you install still reaches the built-in `fetch` through `setGlobalDispatcher`.

  `maxRetries`, `connectTimeout` and the total request timeout all live at different layers, and configuring the wrong one is the most common Node-side pitfall. For connection resets, `UND_ERR_CONNECT_TIMEOUT`, or truncated large responses behind a proxy, see [Troubleshooting Image API Connection Drops](/en/api-capabilities/image-connection-drops).
</Tip>

### Browser JavaScript (Fetch)

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'gpt-image-2-all',
        prompt: 'Portrait 9:16 phone wallpaper, cyberpunk city rainy night',
        response_format: 'b64_json'
    })
});
const { data } = await resp.json();
let b64 = data[0].b64_json;
if (!b64.startsWith('data:')) b64 = `data:image/png;base64,${b64}`;
document.getElementById('result').src = b64;
```

## Parameters Quick Reference

| Parameter         | Type   | Required | Description                                                                                                                                                              |
| ----------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `model`           | string | Yes      | Fixed value: `gpt-image-2-all`                                                                                                                                           |
| `prompt`          | string | Yes      | Prompt. Include size/ratio/style here                                                                                                                                    |
| `size`            | string | No       | Only `auto` is accepted (the same prompt yields varied dimensions). For strict size locking, use [`gpt-image-2-vip`](/en/api-capabilities/gpt-image-2-vip/text-to-image) |
| `response_format` | string | No       | `b64_json` (default, raw base64) or `url` (returns R2 CDN link); always pass explicitly                                                                                  |

<Tip>
  Detailed parameter constraints and allowed values are shown in the right-hand Playground. The `response_format` field supports dropdown selection.
</Tip>

## Response Format

**`data[0]` returns either `url` or `b64_json` — never both** (depends on `response_format`). This endpoint **defaults to `b64_json`**.

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

**`url` mode** (requires explicit `"response_format": "url"`, R2 CDN globally accelerated):

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


## OpenAPI

````yaml api-reference/gpt-image-2-all-generate-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: gpt-image-2-all Text-to-Image API
  description: >
    GPT image generation reverse-engineered model `gpt-image-2-all` —
    text-to-image endpoint.


    - Per-call billing, $0.03/image

    - ~30–60s generation time, supports Chinese prompts

    - Describe size/ratio/style in the `prompt`. **The `size` field has no
    effect** — sending `size=auto` or any concrete value does not error, but the
    value is silently ignored; the prompt is the sole driver of dimensions, and
    the same prompt yields varied dimensions across calls (good for "drawing
    multiple variants"). `n` / `quality` are not supported either. For strict
    size locking, use `gpt-image-2-vip`.

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
      summary: 'Text-to-Image: generate an image from a text prompt'
      description: >
        Generate images with `gpt-image-2-all` from a text prompt.


        - Only `model` and `prompt` are required

        - Size/ratio goes directly in the prompt (e.g., "Landscape 16:9
        cinematic")

        - For editing or multi-image fusion, use the [Image Editing
        endpoint](/en/api-capabilities/gpt-image-2-all/image-edit)
      operationId: generateGptImage2AllTextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TextToImageRequest'
            example:
              model: gpt-image-2-all
              prompt: Landscape 16:9 cinematic, old lighthouse at sunset
              response_format: b64_json
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
    TextToImageRequest:
      type: object
      required:
        - model
        - prompt
      properties:
        model:
          type: string
          description: Model name, fixed to gpt-image-2-all
          enum:
            - gpt-image-2-all
          default: gpt-image-2-all
        prompt:
          type: string
          description: >-
            Prompt. Include size/ratio/style here, e.g., Landscape 16:9
            cinematic, old lighthouse at sunset
          example: Landscape 16:9 cinematic, old lighthouse at sunset
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
        Image generation response. `data[0]` returns **either `url` or
        `b64_json`, never both** (depends on `response_format`; this endpoint
        defaults to `b64_json`).
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