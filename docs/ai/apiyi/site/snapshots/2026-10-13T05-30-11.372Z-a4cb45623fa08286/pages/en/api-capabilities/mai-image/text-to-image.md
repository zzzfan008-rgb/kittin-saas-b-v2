> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Text-to-Image API Reference

> MAI-Image 2.6 text-to-image API reference with live Playground — generate from a text prompt, custom width/height up to a 1536×1536 area, always returns PNG base64

<Info>
  The interactive Playground on the right lets you test online. Enter your API key under **Authorization** (format: `Bearer sk-xxx`), choose a `model`, type a `prompt`, optionally set `width` / `height`, and send.
</Info>

<Tip>
  **Use case**: this page is for generating images from text only. To modify an existing image, use the [Image Editing API](/en/api-capabilities/mai-image/image-edit).
</Tip>

<Warning>
  **⚠️ Three parameters return 400**

  This series does not accept `response_format`, `seed`, or `negative_prompt`; sending any of them returns 400 `Invalid parameters: xxx`. If you are migrating from gpt-image / DALL·E, remove `response_format` first. The response is always `data[0].b64_json`.
</Warning>

<Warning>
  **⚠️ Use width + height, not size**

  This endpoint **silently ignores `size`** and always renders 1024×1024. Use integer `width` + `height` (always together): each side ≥ 768, width × height ≤ 2,359,296 (a 1536×1536 area).
</Warning>

<Info>
  All image APIs are **synchronous**: there is no async task ID. If the client disconnects, the result is lost but the request is still billed. A 1024×1024 image takes about 17 s on Flash and about 30 s on 2.6. **Set the client timeout to at least 120 s for Flash and 180 s for 2.6.** See [Image API Essentials & Best Practices](/en/api-capabilities/image-api-best-practices).
</Info>

## Code Examples

### Python (OpenAI SDK)

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    timeout=180.0  # synchronous call, give it enough time
)

resp = client.images.generate(
    model="MAI-Image-2.6-Flash",
    prompt='A traditional teahouse storefront with a wooden sign that reads "Welcome", red lanterns, warm dusk light, photorealistic',
    # width / height are not standard OpenAI SDK fields, so pass them via extra_body
    # Do not pass response_format: it returns 400
    extra_body={"width": 1024, "height": 1024}
)

with open("out.png", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### Python (requests)

```python theme={null}
import base64
import os
import requests

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"},
    json={
        "model": "MAI-Image-2.6",
        "prompt": "A red fox sitting on a mossy rock in a misty forest, soft morning light, photorealistic",
        "width": 1536,
        "height": 1024
    },
    timeout=180
)
response.raise_for_status()

with open("out.png", "wb") as f:
    f.write(base64.b64decode(response.json()["data"][0]["b64_json"]))
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MAI-Image-2.6-Flash",
    "prompt": "A minimalist coffee shop poster with the headline \"Autumn Special\" at the top, warm brown palette",
    "width": 1024,
    "height": 1536
  }' | python3 -c "import sys,json,base64; open('out.png','wb').write(base64.b64decode(json.load(sys.stdin)['data'][0]['b64_json']))"
```

### Node.js (fetch)

```javascript theme={null}
import fs from 'node:fs';

const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.APIYI_API_KEY}`
    },
    body: JSON.stringify({
        model: 'MAI-Image-2.6-Flash',
        prompt: 'A serene Japanese garden with cherry blossoms, koi pond, golden hour',
        width: 1792,
        height: 1008               // 16:9; width × height must not exceed 2,359,296
    }),
    signal: AbortSignal.timeout(120000)
});

const data = await resp.json();
fs.writeFileSync('out.png', Buffer.from(data.data[0].b64_json, 'base64'));
```

### Need several images: send parallel requests

The text-to-image endpoint returns 1 image per call (`n` has no effect), so run requests in parallel:

```python theme={null}
import base64, os, requests
from concurrent.futures import ThreadPoolExecutor

def gen(i):
    r = requests.post(
        "https://api.apiyi.com/v1/images/generations",
        headers={"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"},
        json={"model": "MAI-Image-2.6-Flash", "prompt": "a watercolor lighthouse at dusk"},
        timeout=120
    )
    r.raise_for_status()
    open(f"out-{i}.png", "wb").write(base64.b64decode(r.json()["data"][0]["b64_json"]))

with ThreadPoolExecutor(max_workers=4) as pool:
    list(pool.map(gen, range(4)))
```

## Parameter Reference

| Parameter | Type | Required | Default | Description |
| - | - | - | - | - |
| `model` | string | ✅ | — | `MAI-Image-2.6` (\$0.12/image) or `MAI-Image-2.6-Flash` (\$0.06/image), **case-sensitive** |
| `prompt` | string | ✅ | — | Prompt in any language. Put text that should appear in the image in quotes |
| `width` | integer | ❌ | `1024` | Output width. ≥ 768, must be sent with `height`, rounded down to a multiple of 16 |
| `height` | integer | ❌ | `1024` | Output height. ≥ 768; width × height ≤ 2,359,296 |
| ~~`response_format`~~ | — | — | — | **Returns 400**; the response is always `b64_json` |
| ~~`seed`~~ / ~~`negative_prompt`~~ | — | — | — | **Return 400** |
| ~~`size`~~ | — | — | — | **Silently ignored** on this endpoint |
| ~~`n`~~ | — | — | — | No effect on this endpoint; always 1 image |

<Info>
  `quality`, `output_format`, `background`, `style`, and other OpenAI-style fields are silently ignored. Output is always PNG.
</Info>

## Response Format

```json theme={null}
{
  "created": 1790999642,
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

  * `b64_json` is **plain base64 without a `data:image/png;base64,` prefix**. Decode it directly to get a PNG.
  * There is no `url` field, and no `revised_prompt`.
  * A 1024×1024 PNG is about 1.5–1.7 MB (2.1–2.3 MB as base64); 1536×1536 is about 4–5 MB. Check your client's response size limits.
</Warning>

<Info>
  **Do not reconcile billing with `usage`**: `prompt_tokens` is always 1000 × the image count and `output_tokens` is always 0; these are placeholders. This series is billed per image, and the APIYI console bill is authoritative.
</Info>


## OpenAPI

````yaml api-reference/mai-image-generate-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: MAI-Image 2.6 Text-to-Image API
  description: >
    Microsoft MAI-Image 2.6 image generation — text-to-image endpoint.


    - Two models: `MAI-Image-2.6` (flagship, \$0.12/image) and
    `MAI-Image-2.6-Flash` (fast, \$0.06/image); model names are case-sensitive

    - Flat per-image pricing, **regardless of size**

    - Size via `width` + `height` (integers, always together): each side ≥ 768,
    width × height ≤ 2,359,296

    - Always returns 1 PNG in `data[0].b64_json` (plain base64, no `data:`
    prefix)


    **⚠️ Do not send `response_format` / `seed` / `negative_prompt`**: all three
    return 400.

    `size` is silently ignored on this endpoint.


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
  /v1/images/generations:
    post:
      tags:
        - Text-to-Image
      summary: 'Text-to-image: generate an image from a text prompt'
      description: >
        Generate an image from a text prompt with MAI-Image 2.6.


        - Required: `model`, `prompt`

        - Optional: `width`, `height` (always together; default 1024×1024 when
        both are omitted)

        - Sizes that are not multiples of 16 are rounded down to a multiple of
        16

        - `n` has no effect; each call returns 1 image. Send parallel requests
        for more
      operationId: generateMaiImageTextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/MaiImageGenerateRequest'
      responses:
        '200':
          description: Image generated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: >-
            Invalid parameters (size out of range: `unsupported_request_value`;
            unsupported parameter: `invalid_request`), or blocked by moderation
            (`content_safety_violation`)
        '401':
          description: Unauthorized - invalid API key
        '404':
          description: >-
            Request sent to chat / responses; this series only supports the
            Images API
        '429':
          description: Rate limit exceeded or insufficient balance
        '503':
          description: Wrong model-name case, or no available channel in the current group
      security:
        - bearerAuth: []
components:
  schemas:
    MaiImageGenerateRequest:
      type: object
      required:
        - model
        - prompt
      properties:
        model:
          type: string
          description: Model ID (case-sensitive). 2.6 favors quality, Flash favors speed
          enum:
            - MAI-Image-2.6-Flash
            - MAI-Image-2.6
          default: MAI-Image-2.6-Flash
        prompt:
          type: string
          description: >-
            Prompt in any language. Put text that should appear in the image in
            quotes
          example: >-
            A traditional teahouse storefront with a wooden sign that reads
            "Welcome", red lanterns, warm dusk light, photorealistic
        width:
          type: integer
          description: >
            Output width in pixels. Each side ≥ 768, width × height ≤ 2,359,296
            (a 1536×1536 area);

            must be sent together with `height`; rounded down to a multiple of
            16.
          minimum: 768
          default: 1024
          example: 1024
        height:
          type: integer
          description: Output height in pixels, same rules as `width`
          minimum: 768
          default: 1024
          example: 1024
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
          description: Creation timestamp
          example: 1790999642
        data:
          type: array
          description: Image results; always 1 item for text-to-image
          items:
            type: object
            properties:
              b64_json:
                type: string
                description: 'Plain base64 image data (PNG, no data: prefix)'
        usage:
          type: object
          description: >
            **Placeholder values, not for billing reconciliation.**
            `prompt_tokens` is always `1000 × images` and `output_tokens` is
            always 0.

            The console bill is authoritative.
          properties:
            prompt_tokens:
              type: integer
              example: 1000
            total_tokens:
              type: integer
              example: 1000
            output_tokens:
              type: integer
              example: 0
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API key from the APIYI console

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.