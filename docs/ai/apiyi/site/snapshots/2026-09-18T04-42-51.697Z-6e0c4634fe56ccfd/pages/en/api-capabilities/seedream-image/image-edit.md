> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Image Editing API Reference

> Seedream image editing, multi-image fusion, and batch sequence generation API reference and live Playground — same generations endpoint, switched via the image array and sequential_image_generation parameter

<Info>
  **One endpoint, multiple modes**: Seedream has no separate `/v1/images/edits` endpoint. Editing, multi-image fusion, and batch sequence all run through `POST /v1/images/generations`. This page's Playground hits the same endpoint as [Text-to-Image](/en/api-capabilities/seedream-image/text-to-image) — the only difference is the `image` and `sequential_image_generation` parameters in the body.
</Info>

<Tip>
  **Modes**:

  * **Single-image editing** — `image: ["url"]` + `sequential_image_generation: "disabled"`
  * **Multi-image fusion** — `image: ["url1", "url2", ...]` + `disabled`
  * **Batch sequence** — `sequential_image_generation: "auto"` + `sequential_image_generation_options.max_images: N`
  * **Image-to-sequence** — combine the two: `image` array + `auto` + `max_images`
</Tip>

<Warning>
  **🖥️ Browser Playground limitation (b64\_json mode only)**

  In the default `response_format: "url"` mode, the Playground works fine (the response is just a temporary BytePlus TOS link). If you switch to `response_format: "b64_json"`, the response contains a multi-MB base64 string and the browser Playground may show `请求时发生错误: unable to complete request` — **the request actually succeeded**; the browser just can't render such a long base64 string.

  **Recommended workflow**:

  * Just want to view the image? **Keep the default `url` mode** — the Playground returns the link directly (remember to download to your own storage within 24 hours).
  * Need b64\_json? **Copy the code sample below and run it locally** — the code will decode and save the image to a file automatically.
</Warning>

<Warning>
  **⚠️ Key differences vs. OpenAI gpt-image-2 editing**

  * **No multipart/form-data uploads** — upload your images to OSS or a public image host first, then pass URLs in the `image` array
  * **`image` is a URL array**, not a repeated `image[]` field (unlike OpenAI's `multipart/form-data` format)
  * **No `mask` field** — Seedream does not support alpha-channel mask inpainting; the whole image is rewritten by the prompt
  * **Hard limit on total count**: input references + output ≤ 15 images
</Warning>

<Warning>
  **📎 Multi-image order matters**

  The order of URLs in the `image` array becomes the "image 1 / image 2 / image 3" referenced in the prompt. Make ordering explicit:

  > Replace the clothing in image 1 with the outfit from image 2, keeping the lighting from image 3.

  English prompts work best (the model is trained primarily on English), but Chinese is also supported as long as the wording is unambiguous.
</Warning>

## Code Examples

<Note>
  **About `extra_body` (important — don't be misled into thinking it's an extra nesting layer)**

  `image`, `sequential_image_generation`, and `watermark` are not standard parameters of the OpenAI SDK's `images.generate()`, so in the Python SDK you **must** put them inside `extra_body` to send them.

  But `extra_body` is just the SDK's parameter container — its fields are **flattened and merged into the top level** of the request body, at the **same level** as `model` and `prompt`. The JSON that actually goes out is identical to the cURL example below (`image` sits at the top level); there is **no** real `"extra_body": {...}` nesting in the request.

  If you're not using the OpenAI SDK and instead build the JSON directly (requests / fetch / etc.), **do not** write `extra_body` — just place `image` and the other fields at the same level as `model`.
</Note>

### Python (OpenAI SDK · single-image editing)

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.generate(
    model="seedream-5-0-260128",
    prompt="Generate a close-up image of a dog lying on lush grass.",
    size="2K",
    response_format="url",
    # Fields in extra_body are flattened to the top level of the request body
    # (same level as model) by the SDK — not an extra nesting layer
    extra_body={
        "image": ["https://your-oss.example.com/source-photo.png"],
        "sequential_image_generation": "disabled",
        "watermark": False,
    }
)

print(resp.data[0].url)
```

### Python (OpenAI SDK · multi-image fusion)

```python theme={null}
resp = client.images.generate(
    model="seedream-4-5-251128",
    prompt="Replace the clothing in image 1 with the outfit from image 2, keeping the lighting style of image 3.",
    size="4K",
    response_format="url",
    extra_body={
        "image": [
            "https://your-oss.example.com/person.png",
            "https://your-oss.example.com/outfit.png",
            "https://your-oss.example.com/lighting-ref.png",
        ],
        "sequential_image_generation": "disabled",
        "watermark": False,
    }
)

print(resp.data[0].url)
```

### Python (OpenAI SDK · batch sequence)

```python theme={null}
resp = client.images.generate(
    model="seedream-5-0-260128",
    prompt=(
        "Generate four cinematic sci-fi storyboard scenes:"
        "Scene 1 — astronaut repairing a spacecraft;"
        "Scene 2 — meteor strike in deep space;"
        "Scene 3 — emergency dodge in zero gravity;"
        "Scene 4 — astronaut returning to ship."
    ),
    size="2K",
    response_format="url",
    extra_body={
        "sequential_image_generation": "auto",
        "sequential_image_generation_options": {"max_images": 4},
        "watermark": False,
    }
)

for item in resp.data:
    print(item.url)
```

### cURL (multi-image fusion)

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "seedream-5-0-260128",
    "prompt": "Replace the clothing in image 1 with the outfit from image 2.",
    "image": [
      "https://your-oss.example.com/person.png",
      "https://your-oss.example.com/outfit.png"
    ],
    "sequential_image_generation": "disabled",
    "size": "2K",
    "response_format": "url",
    "watermark": false
  }'
```

### Node.js (fetch · batch sequence)

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'seedream-5-0-260128',
        prompt: 'A four-panel comic about a cat astronaut: launch, space walk, alien encounter, return home.',
        size: '2K',
        sequential_image_generation: 'auto',
        sequential_image_generation_options: { max_images: 4 },
        response_format: 'url',
        watermark: false
    })
});

const { data } = await resp.json();
data.forEach((item, i) => console.log(`#${i + 1}:`, item.url));
```

<Warning>
  **Pass reference images as public URLs, not base64 (emphasized since 2026-09-11)**

  When the entries in the `image` array are URLs, the request body is only a few KB and BytePlus **downloads your images directly from its Singapore region** (verified: the fetching IP belongs to BytePlus, and the APIYI gateway is not involved).
  When the entries are `data:image/...;base64,...` strings, a few high-resolution reference images easily push the body to 20 to 30 MB. That body must first be uploaded in full to the APIYI gateway and then forwarded to Singapore. When the cross-border upload is slow, it exceeds the provider ingress limit of 600 seconds for reading the request body and fails with `400 Error when parsing request`.
  The whole request fails and does not fall back to URL mode, because the gateway does not convert base64 into a downloadable link for you.

  * ✅ Host the images on your own object storage or image host and pass public, unauthenticated URLs that can be fetched with a plain GET; keep each image under about 10 MB
  * ⚠️ If base64 is unavoidable, compress first: long edge within 2048 px, re-encode at quality 0.9, and keep the total under 6 MB for multiple images
  * ❌ Do not send base64 bodies above 20 MB, and do not pass private-network addresses or links that require login (BytePlus returns `InvalidParameter: Error while downloading` when the fetch fails)
</Warning>

## Parameter Reference

| Parameter                                        | Type            | Required             | Default    | Description                                                                                                                                                               |
| ------------------------------------------------ | --------------- | -------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`                                          | string          | yes                  | —          | `seedream-5-0-260128` / `seedream-4-5-251128` / `seedream-4-0-250828` / `seedream-5-0-pro-260628` (pro tier, \$0.12/request)                                              |
| `prompt`                                         | string          | yes                  | —          | Editing / fusion / sequence instruction                                                                                                                                   |
| `image`                                          | array of string | required for editing | —          | Reference images as URLs or base64 data URIs (`data:image/jpeg;base64,...`, verified), **up to 10** (per official 4.5 / 5.0-pro docs)                                     |
| `sequential_image_generation`                    | string          | no                   | `disabled` | `disabled` for single output; `auto` for batch sequence. **Not accepted by 5.0-pro: any value (including `disabled`) returns 400 — omit the parameter entirely with pro** |
| `sequential_image_generation_options.max_images` | integer         | no                   | —          | Effective only with `auto`. Subject to **input + output ≤ 15**. Also not accepted by 5.0-pro                                                                              |
| `size`                                           | string          | no                   | `2K`       | Preset tier or exact pixels — **tier support varies by version** (see Overview)                                                                                           |
| `response_format`                                | string          | no                   | `url`      | `url` / `b64_json`                                                                                                                                                        |
| `output_format`                                  | string          | no                   | `jpeg`     | 5.0 / 5.0-pro support `png` / `jpeg`; 4.5 / 4.0 only `jpeg`                                                                                                               |
| `watermark`                                      | boolean         | no                   | varies     | Set `false` for commercial use                                                                                                                                            |
| `stream`                                         | boolean         | no                   | `false`    | Streaming output, recommended for long prompts. **Not accepted by 5.0-pro — returns 400**                                                                                 |

## Count Constraints in Multi-image and Sequence Modes

| Scenario                      | Input `image` count | `max_images` | Actual output | Total constraint   |
| ----------------------------- | ------------------- | ------------ | ------------- | ------------------ |
| Single-image editing          | 1                   | —            | 1             | 2 ≤ 15 ✅           |
| Multi-image fusion            | 3                   | —            | 1             | 4 ≤ 15 ✅           |
| Multi-image fusion + sequence | 3                   | 4            | 4             | 7 ≤ 15 ✅           |
| Multi-image fusion + sequence | 10                  | 6            | 6             | 16 > 15 ❌ rejected |

<Tip>
  **Iterative refinement**: feed a previous output's URL as the next input, with a fresh edit instruction, to refine progressively. Each round is billed per image — watch cumulative cost.
</Tip>

## Response Format

```json theme={null}
{
  "model": "seedream-5-0-260128",
  "created": 1768518000,
  "data": [
    {
      "url": "https://ark-content-generation-v2-ap-southeast-1.tos-ap-southeast-1.bytepluses.com/seedream-5-0/.../scene-1.png",
      "size": "2048x2048"
    },
    {
      "url": "https://...scene-2.png",
      "size": "2048x2048"
    }
  ],
  "usage": {
    "generated_images": 2,
    "output_tokens": 12480,
    "total_tokens": 12480
  }
}
```

<Warning>
  **⚠️ The `data` array length reflects actual output count**

  * `sequential_image_generation: "disabled"` → single-element `data`
  * `sequential_image_generation: "auto"` + `max_images: N` → typically N elements (occasionally fewer if the prompt produces less)
  * Billing is by `usage.generated_images`, **not by `max_images`**
</Warning>

<Info>
  Editing requests are billed identically to text-to-image — per output image. Reference image inputs are not separately billed.
</Info>


## OpenAPI

````yaml api-reference/seedream-image-edit-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: Seedream Image Editing / Multi-image Fusion / Batch Sequence API
  description: >
    BytePlus ModelArk Seedream image generation models — editing / multi-image
    fusion / batch sequence endpoint.


    **Important**: Seedream has no separate `/v1/images/edits` endpoint.
    Editing, multi-image fusion, and batch sequence generation all run through
    `POST /v1/images/generations`. The mode is switched via `image` and
    `sequential_image_generation` in the request body.


    - Single-image editing: `image: ["url"]` + `sequential_image_generation:
    "disabled"`

    - Multi-image fusion: `image: ["url1", "url2", ...]` + `disabled` (up to 10
    reference images)

    - Batch sequence: `sequential_image_generation: "auto"` + `max_images`

    - Hard constraint: **input reference images + output images ≤ 15**


    Unlike OpenAI gpt-image-2, this endpoint **does not accept
    multipart/form-data**. Upload images to your OSS or a public image host
    first, then pass the URLs as an array.


    **Auth**: add `Authorization: Bearer YOUR_API_KEY` to the request header.
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
        - Image Editing
      summary: Image Editing / Multi-image Fusion / Batch Sequence
      description: >
        Generate new images from reference images (`image` URL array) plus a
        prompt, or enable batch sequence to output multiple coherent images.


        - Single-image edit: pass 1 image + disabled

        - Multi-image fusion: pass multiple images + disabled, refer to "image 1
        / image 2" in the prompt

        - Batch sequence: with or without image, set auto + max_images
      operationId: editSeedreamImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SeedreamEditRequest'
            example:
              model: seedream-5-0-260128
              prompt: Replace the clothing in image 1 with the outfit from image 2.
              image:
                - https://your-oss.example.com/person.png
                - https://your-oss.example.com/outfit.png
              sequential_image_generation: disabled
              size: 2K
              response_format: url
              watermark: false
      responses:
        '200':
          description: Edited image generated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SeedreamImageResponse'
        '400':
          description: >-
            Invalid parameters (image array exceeds 10, total input+output
            exceeds 15, unsupported size, etc.)
        '401':
          description: Unauthorized — invalid API key
        '403':
          description: Blocked by content moderation
        '404':
          description: URLs in image array unreachable
        '429':
          description: Rate limit (default 500 RPM) or insufficient balance
        '500':
          description: Internal server error
      security:
        - bearerAuth: []
components:
  schemas:
    SeedreamEditRequest:
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
            Editing / fusion / sequence instruction. For multi-image scenarios,
            refer to images explicitly as 'image 1 / image 2'
          example: Replace the clothing in image 1 with the outfit from image 2.
        image:
          type: array
          items:
            type: string
            format: uri
          description: >-
            Reference image URL array. **Up to 10 images** (per official 4.5
            docs). Note: input + output count ≤ 15
          maxItems: 10
          example:
            - https://your-oss.example.com/person.png
            - https://your-oss.example.com/outfit.png
        sequential_image_generation:
          type: string
          description: >-
            Generation mode switch. disabled = single output (default); auto =
            batch sequence, paired with max_images
          enum:
            - disabled
            - auto
          default: disabled
        sequential_image_generation_options:
          type: object
          description: >-
            Batch sequence options. Effective only when
            sequential_image_generation=auto
          properties:
            max_images:
              type: integer
              description: Max number of output images. Subject to input + output ≤ 15
              minimum: 1
              maximum: 15
              example: 4
        size:
          type: string
          description: >
            Output size. Preset tiers (vary by version):

            - `1K` (4.0 only) / `2K` (all) / `3K` (5.0 only) / `4K` (4.5, 4.0)


            Or exact pixel size `WxH`, total pixels ∈ \[1280×720, 4096×4096\],
            aspect ratio ∈ \[1/16, 16\]
          example: 2K
          default: 2K
        response_format:
          type: string
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
        watermark:
          type: boolean
          default: false
        stream:
          type: boolean
          description: >-
            Streaming output. Recommended for long prompts and multi-image
            sequence scenarios
          default: false
    SeedreamImageResponse:
      type: object
      properties:
        model:
          type: string
          example: seedream-5-0-260128
        created:
          type: integer
          example: 1768518000
        data:
          type: array
          description: >-
            Result array. disabled mode returns 1 element; auto mode typically
            returns max_images elements (may be fewer)
          items:
            type: object
            properties:
              url:
                type: string
                example: >-
                  https://ark-content-generation-v2-ap-southeast-1.tos-ap-southeast-1.bytepluses.com/.../image.png
              b64_json:
                type: string
                description: 'Plain base64 string, no data: prefix'
              size:
                type: string
                example: 2048x2048
        usage:
          type: object
          description: Billed by generated_images actual count, NOT by max_images
          properties:
            generated_images:
              type: integer
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