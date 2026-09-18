> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Text-to-Image API Reference

> Grok Imagine 2 text-to-image API reference and live testing — prompt-only generation with 5 aspect ratios, 1K/2K tiers, up to 10 images per call

<Warning>
  **🔒 Not open by default**: Grok Imagine 2 does not sit in the `Default` group. It lives in its own **`Grok_imagine` group**, and access must be requested before you can call it (including the Playground on this page). Without it, every call returns `503`.

  This family's content-safety policy differs substantially from the other models on the platform and some categories are not filtered, so to limit compliance risk we grant access selectively: existing customers with \$1,000+ cumulative spend can get it enabled by describing their use case to support; everyone else applies through [WeCom support](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec) with a description of the use case and the content-moderation controls in place. Full process: [Grok Imagine 2 Overview - Group Setup](/en/api-capabilities/grok-imagine-image/overview#group-setup).
</Warning>

<Info>
  The interactive Playground on the right lets you test the endpoint directly. Enter your API Key in **Authorization** (format: `Bearer sk-xxx`), fill in `prompt`, pick `aspect_ratio` / `resolution`, and send.
</Info>

<Tip>
  **When to use this page**: text-to-image generation from a prompt alone — no image upload involved. To modify an existing image or fuse several, use the [Image Editing endpoint](/en/api-capabilities/grok-imagine-image/image-edit).
</Tip>

<Warning>
  **⚠️ Do not send reference images to this endpoint**

  Passing `image` / `image_url` / `images` here **raises no error**. It returns 200 and generates a brand-new image from the prompt — **the reference is silently discarded and you are still billed**.

  With no error signal, this usually surfaces only when someone notices the output has nothing to do with the input. **Any workflow with a reference image must use [`/v1/images/edits`](/en/api-capabilities/grok-imagine-image/image-edit).**
</Warning>

<Warning>
  **⚠️ Invalid parameters do not raise errors**

  Invalid `aspect_ratio` (e.g. `5:7`), `resolution` (e.g. `1K`, `1024x1024`) and `response_format` (e.g. `base64`) all **silently fall back to defaults** and still return an image. When output does not match expectations, check the parameter spelling first — note that `resolution` values are lowercase `1k` / `2k`.

  One exception: `resolution: "4k"` returns `503 model_service_unavailable`, meaning **the tier is unsupported**, not that the channel is down. Retrying will not help.
</Warning>

<Info>
  All image APIs are **synchronous**: there is no async task ID, so a disconnected client loses the result while the request is still billed. 1K takes about 9 seconds and 2K about 15-17 seconds, so **set the client timeout to 360 seconds** — see [Image API Best Practices](/en/api-capabilities/image-api-best-practices).
</Info>

## Code Examples

### Python (OpenAI SDK)

```python theme={null}
from openai import OpenAI
import urllib.request

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    timeout=360.0  # image APIs are synchronous — allow plenty of time
)

resp = client.images.generate(
    model="grok-imagine-image",
    prompt="A photorealistic red wooden boat moored on a glassy alpine lake at dawn, "
           "mist over the water, snow-capped peaks behind, cinematic photography",
    n=1,
    # aspect_ratio / resolution are not standard OpenAI SDK fields — pass via extra_body
    extra_body={
        "aspect_ratio": "16:9",
        "resolution": "1k",
        "response_format": "url"
    }
)

# response_format defaults to url, returning a direct link (.jpg for 1K, .png for 2K)
urllib.request.urlretrieve(resp.data[0].url, "out.jpg")
```

### Python (raw requests)

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
        "model": "grok-imagine-image",
        "prompt": "Cyberpunk city on a rainy night, neon signage close-up, cinematic lighting",
        "n": 1,
        "aspect_ratio": "16:9",
        "resolution": "2k",          # 2k returns PNG at 5-6 MB per image
        "response_format": "b64_json"
    },
    timeout=360  # 2K takes 15-17s and longer at peak; 60s causes spurious timeouts
).json()

# b64_json is raw base64 with no data: prefix — decode and write directly
with open("out.png", "wb") as f:
    f.write(base64.b64decode(response["data"][0]["b64_json"]))
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "grok-imagine-image-quality",
    "prompt": "An orange tabby cat wearing sunglasses at a seaside bar, photorealistic, warm sunset tones",
    "n": 1,
    "aspect_ratio": "16:9",
    "resolution": "1k",
    "response_format": "url"
  }'
```

### Node.js (native fetch)

```javascript theme={null}
import fs from 'node:fs';

const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'grok-imagine-image',
        prompt: 'A serene Japanese garden with cherry blossoms, koi pond, golden hour',
        n: 2,                       // up to 10 per call, billed per image
        aspect_ratio: '4:3',
        resolution: '1k',
        response_format: 'url'
    }),
    // Node 18+ has no default timeout — use AbortSignal.timeout in production
    signal: AbortSignal.timeout(360000)
});

const data = await resp.json();

// with n=2 the data array holds two entries — download each
for (const [i, item] of data.data.entries()) {
    const img = await fetch(item.url);
    fs.writeFileSync(`out-${i}.jpg`, Buffer.from(await img.arrayBuffer()));
}
```

### Browser JavaScript

```javascript theme={null}
// ⚠️ Demo only: a front-end key is exposed — use a backend proxy in production
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'grok-imagine-image',
        prompt: 'a minimalist poster of a mountain at sunrise, flat vector style',
        aspect_ratio: '3:4',
        resolution: '1k',
        response_format: 'url'   // url is far lighter than b64_json in a browser
    })
});

const data = await resp.json();
document.querySelector('#preview').src = data.data[0].url;
```

## Parameter Reference

| Parameter         | Type    | Required | Default | Description                                                                         |
| ----------------- | ------- | -------- | ------- | ----------------------------------------------------------------------------------- |
| `model`           | string  | ✅        | —       | `grok-imagine-image` (\$0.02/image) or `grok-imagine-image-quality` (\$0.045/image) |
| `prompt`          | string  | ✅        | —       | Prompt in English or Chinese. Describe subject, scene, style and lighting           |
| `n`               | integer | ❌        | `1`     | Images per call, **1-10**, billed per image. `0` becomes `1`; `≥11` returns 400     |
| `aspect_ratio`    | string  | ❌        | `1:1`   | `1:1` / `16:9` / `9:16` / `4:3` / `3:4`; other values silently fall back to `1:1`   |
| `resolution`      | string  | ❌        | `1k`    | `1k` (JPEG, \~1 MP) or `2k` (PNG, \~4.2-4.5 MP). **Same price**; `4k` returns 503   |
| `response_format` | string  | ❌        | `url`   | `url` returns a direct link; `b64_json` returns raw base64 (**no** `data:` prefix)  |

**Actual output pixels per aspect ratio:**

| `aspect_ratio` | `1k`      | `2k`      |
| -------------- | --------- | --------- |
| `1:1`          | 1024x1024 | 2048x2048 |
| `16:9`         | 1280x720  | 2816x1584 |
| `9:16`         | 720x1280  | 1584x2816 |
| `4:3`          | 1152x864  | 2368x1776 |
| `3:4`          | 864x1152  | 1776x2368 |

<Info>
  `seed` is not supported (accepted without error but has no effect — results are not reproducible), and neither is mask inpainting. OpenAI-style fields such as `size` / `quality` / `style` are silently ignored.
</Info>

## Response Format

```json theme={null}
{
  "created": 0,
  "data": [
    {
      "url": "https://apac.ossforai.com/2026/08/12/1ab87d04-3637-464f-bafd-f026cac05dd3.jpg"
    }
  ],
  "usage": {
    "prompt_tokens": 1000,
    "total_tokens": 1000,
    "output_tokens": 0
  }
}
```

<Warning>
  **Response field pitfalls**

  * Each `data[]` entry contains **either** `url` **or** `b64_json` depending on `response_format` — never both.
  * **`revised_prompt` is not returned**, nor are `respect_moderation` / `model`. Do not assume they exist.
  * `b64_json` is **raw base64 with no `data:image/...;base64,` prefix** — decode it directly.
  * `created` is always `0` and cannot be used as a timestamp.
  * With `n > 1` the `data` array holds multiple entries — do not read only `data[0]`.
</Warning>

<Info>
  **`usage` cannot be used for reconciliation**: `prompt_tokens` is always `1000 x n`, independent of actual prompt length. This family is billed at a flat rate per image (\$0.02 / \$0.045); use the APIYI Console billing records for actual charges.
</Info>


## OpenAPI

````yaml api-reference/grok-imagine-image-generate-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: Grok Imagine 2 Text-to-Image API
  description: >
    xAI Grok Imagine 2 image generation models — text-to-image endpoint.


    - Two models: `grok-imagine-image` (standard, \$0.02 per image),
    `grok-imagine-image-quality` (high quality, \$0.045 per image)

    - Flat per-request pricing — **1K and 2K cost the same**

    - 5 aspect ratios x 2 resolution tiers, all parameters genuinely take effect

    - Up to 10 images per request (`n` from 1 to 10)

    - 1K returns JPEG (~220-300 KB), 2K returns PNG (~5-6 MB)


    **⚠️ This endpoint does not accept reference images**: passing `image` /
    `image_url` / `images`

    returns 200 with a normal image, but the reference is silently discarded and
    you are still billed.

    For reference-image editing use the

    [Image Editing endpoint](/en/api-capabilities/grok-imagine-image/image-edit)
    (`multipart/form-data`).


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
      summary: 'Text-to-image: generate images from a text prompt'
      description: >
        Generate images from a text prompt with Grok Imagine 2 models.


        - Required: `model`, `prompt`

        - Optional: `n`, `aspect_ratio`, `resolution`, `response_format`

        - Invalid values do not raise errors — they **silently fall back to the
        default**
          (e.g. `aspect_ratio: "5:7"` is treated as `1:1`)
        - `resolution: "4k"` returns 503 `model_service_unavailable` — this is
        an unsupported
          parameter tier, not a channel outage
        - `seed` is not supported; repeated calls with the same prompt are not
        reproducible
      operationId: generateGrokImagineTextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/GrokImagineGenerateRequest'
      responses:
        '200':
          description: Images generated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: >-
            Invalid parameters, or prompt blocked by content moderation (both
            share the `invalid_request` code)
        '401':
          description: Unauthorized - invalid API Key
        '429':
          description: Rate limit exceeded or insufficient balance
        '503':
          description: >-
            Unsupported parameter tier (e.g. `resolution: 4k`), or no available
            channel in the current Group
      security:
        - bearerAuth: []
components:
  schemas:
    GrokImagineGenerateRequest:
      type: object
      required:
        - model
        - prompt
      properties:
        model:
          type: string
          description: >-
            Model ID. The quality variant delivers higher fidelity at a higher
            price
          enum:
            - grok-imagine-image
            - grok-imagine-image-quality
          default: grok-imagine-image
        prompt:
          type: string
          description: >-
            Prompt, English or Chinese. Describe subject, scene, style and
            lighting in detail
          example: >-
            A photorealistic red wooden boat moored on a glassy alpine lake at
            dawn, mist over the water, snow-capped peaks behind, cinematic
            photography
        'n':
          type: integer
          description: >-
            Number of images, 1-10. Values of 11 or above return 400; 0 is
            silently treated as 1
          minimum: 1
          maximum: 10
          default: 1
          example: 1
        aspect_ratio:
          type: string
          description: >
            Output aspect ratio. Actual pixel dimensions per resolution tier:


            | Aspect ratio | `1k` | `2k` |

            |---|---|---|

            | `1:1` | 1024x1024 | 2048x2048 |

            | `16:9` | 1280x720 | 2816x1584 |

            | `9:16` | 720x1280 | 1584x2816 |

            | `4:3` | 1152x864 | 2368x1776 |

            | `3:4` | 864x1152 | 1776x2368 |


            Values outside this enum do not raise an error — they silently fall
            back to `1:1`.
          enum:
            - '1:1'
            - '16:9'
            - '9:16'
            - '4:3'
            - '3:4'
          default: '1:1'
          example: '16:9'
        resolution:
          type: string
          description: >
            Resolution tier. `1k` is roughly 0.9-1.05 megapixels and returns
            JPEG;

            `2k` is roughly 4.2-4.5 megapixels and returns PNG (5-6 MB per
            image).

            **Both tiers cost the same.**


            `4k` returns 503; other invalid values (such as `1K` or `1024x1024`)
            silently fall back to `1k`.
          enum:
            - 1k
            - 2k
          default: 1k
          example: 1k
        response_format:
          type: string
          description: >
            Response format. `url` returns a direct image link (no signed query
            params);

            `b64_json` returns a raw base64 string (**without** the `data:`
            prefix).


            Invalid values silently fall back to the default `url`.
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
                description: >-
                  Direct image link, returned when `response_format=url`. .jpg
                  for 1K, .png for 2K
                example: >-
                  https://apac.ossforai.com/2026/08/12/1ab87d04-3637-464f-bafd-f026cac05dd3.jpg
              b64_json:
                type: string
                description: >-
                  Raw base64 image data, returned when
                  `response_format=b64_json` (no data: prefix)
        usage:
          type: object
          description: >
            **Placeholder values — do not use for billing reconciliation.**
            `prompt_tokens` is always

            `1000 x n`, regardless of actual prompt length. Use the Console
            billing records instead.
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
      description: API Key created in the APIYI Console

````