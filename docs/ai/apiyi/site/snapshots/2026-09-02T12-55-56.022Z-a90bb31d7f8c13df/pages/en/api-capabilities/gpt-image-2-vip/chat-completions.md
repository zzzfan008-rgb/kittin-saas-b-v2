> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Chat API Reference

> gpt-image-2-vip chat endpoint — one endpoint handles both text-to-image and reference-image editing, accepts online image URLs directly, supports multi-turn iteration.

<Note>
  **This calling style is no longer recommended**: use [/v1/images/generations](/en/api-capabilities/gpt-image-2-vip/text-to-image) and [/v1/images/edits](/en/api-capabilities/gpt-image-2-vip/image-edit) instead — more stable, and the same code works with the official-relay `gpt-image-2`. The chat endpoint on this page still works, and remains useful for multi-turn iterative editing or passing online image URLs directly.
</Note>

<Info>
  **Chat endpoint highlights**: **one endpoint** handles both text-to-image and reference-image editing, accepts **online image URLs** (CDN links or base64 data URLs) directly, and supports natural multi-turn iteration. Enter your API Key in the Playground on the right and pick an example from the dropdown (text-to-image / reference editing / multi-turn).

  If you want one codebase that hits both the official and reverse channels, prefer `/v1/images/generations` and `/v1/images/edits` (OpenAI Images API standard format).
</Info>

<Tip>
  **Mode selection**:

  * Text-only `messages` → **text-to-image**
  * Add `image_url` (URL or base64 data URL) → **reference-image edit**
  * Keep prior `assistant` messages and continue → **multi-turn iteration**

  **Difference vs `gpt-image-2-all`**: identical call format — just swap `model` to `gpt-image-2-vip`. This endpoint additionally accepts a top-level `size` field to lock dimensions (30-bucket set, same as `/v1/images/generations`).

  ✨ **`size` is optional**: pass it to lock the output dimensions; omit it to let the prompt drive sizing (same as `-all`).
</Tip>

<Warning>
  **🖥️ Browser Playground limitation (when response contains base64)**

  This endpoint **defaults to an R2 CDN URL** (`data[0].url`) and the Playground displays it fine. In rare cases the response carries base64 (`data[0].b64_json`), or you pass a large base64 input image via `image_url`, in which case the response string can be multi-MB and the browser Playground may show `请求时发生错误: unable to complete request` — **the request actually succeeded**; the browser just can't display such a long string.

  **Recommended workflow**: when you see this prompt, **copy the code samples below to your local machine** — your code can read the result from `data[0].url` or `data[0].b64_json` (**only one of the two appears**, never both).
</Warning>

## Code Examples

### Python (text-to-image)

```python theme={null}
import requests

API_KEY = "sk-your-api-key"

response = requests.post(
    "https://api.apiyi.com/v1/chat/completions",
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json={
        "model": "gpt-image-2-vip",
        "size": "2048x1152",  # Optional; omit to let the prompt drive sizing
        "messages": [
            {"role": "user", "content": "Cinematic landscape 16:9, old lighthouse by the sea at dusk, photorealistic"}
        ]
    },
    timeout=300
).json()

# Defaults to url; if you switch to b64_json mode, read response["data"][0]["b64_json"]
print(response["data"][0]["url"])
```

### Python (reference-image edit)

```python theme={null}
import requests
import base64

API_KEY = "sk-your-api-key"

# HTTPS URL or base64 data URL — both work
with open("photo.png", "rb") as f:
    data_url = "data:image/png;base64," + base64.b64encode(f.read()).decode()

response = requests.post(
    "https://api.apiyi.com/v1/chat/completions",
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json={
        "model": "gpt-image-2-vip",
        "size": "2048x2048",  # Optional; omit to let the prompt drive sizing
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Convert this image into watercolor style"},
                    {"type": "image_url", "image_url": {"url": data_url}}
                ]
            }
        ]
    },
    timeout=300
).json()

# Defaults to url; if you switch to b64_json mode, read response["data"][0]["b64_json"]
print(response["data"][0]["url"])
```

### cURL (text-to-image)

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/chat/completions" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2-vip",
    "size": "2048x1152",
    "messages": [
      {"role": "user", "content": "Cyberpunk rainy night street, 16:9, neon sign reading Hello World"}
    ]
  }'
```

### cURL (reference-image edit)

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/chat/completions" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2-vip",
    "messages": [
      {
        "role": "user",
        "content": [
          { "type": "text", "text": "Convert this image into watercolor style" },
          { "type": "image_url", "image_url": { "url": "https://example.com/photo.png" } }
        ]
      }
    ]
  }'
```

### Node.js (text-to-image)

```javascript theme={null}
const API_KEY = "sk-your-api-key";

const response = await fetch("https://api.apiyi.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-image-2-vip",
    messages: [
      { role: "user", content: "1024x1024 square logo, minimalist cat line art" }
    ]
  })
});

const data = await response.json();
// Defaults to url; if you switch to b64_json mode, read data.data[0].b64_json
console.log(data.data[0].url);
```

<Note>
  **About the OpenAI SDK**: The **request format** is OpenAI Chat Completions compatible, but the **response format** is `{data: [{url|b64_json}], created, usage}` — there is no `choices` field. Calling `client.chat.completions.create(...)` will fail to parse the response. Use the `requests` / `fetch` snippets above to read the raw JSON instead.
</Note>

## Parameters

| Parameter            | Type            | Required | Description                                                                                                                                                                                  |
| -------------------- | --------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`              | string          | Yes      | Fixed at `gpt-image-2-vip`                                                                                                                                                                   |
| `messages`           | array           | Yes      | Conversation array; supports `system` / `user` / `assistant` roles                                                                                                                           |
| `messages[].content` | string \| array | Yes      | Plain string (text-to-image) or multimodal array (with reference image)                                                                                                                      |
| `size`               | string          | No       | Output dimensions (30-bucket set), e.g. `2048x1152`, `3840x2160`. Omit to let the prompt drive sizing. See [model overview](/en/api-capabilities/gpt-image-2-vip/overview) for the full list |
| `stream`             | boolean         | No       | Streaming. This model is one-shot; keep `false`.                                                                                                                                             |

**Multimodal content fragments** (when `content` is an array):

| Field           | Type   | Required    | Description                                                                          |
| --------------- | ------ | ----------- | ------------------------------------------------------------------------------------ |
| `type`          | enum   | Yes         | `text` or `image_url`                                                                |
| `text`          | string | Conditional | Required when `type=text`                                                            |
| `image_url.url` | string | Conditional | Required when `type=image_url`. Accepts `https://...` or `data:image/png;base64,...` |

<Tip>
  See the right-side Playground for full field details. The "Example" dropdown switches between **text-to-image / reference editing / multi-turn iteration**.
</Tip>

## Response Format

The chat endpoint responds with `{data: [{url|b64_json}], created, usage}`. `data[0]` returns **either `url` or `b64_json`, never both**. This endpoint **defaults to `url`**.

**Default `url` output**:

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

**`b64_json` output** (rare):

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

<Info>
  **Parsing tip**: read `data[0].url` first; if it's empty, fall back to `data[0].b64_json`. The `b64_json` value already includes the `data:image/png;base64,` prefix and can be used directly as `<img src>`.
</Info>

## Why the Chat Endpoint

<CardGroup cols={2}>
  <Card title="One endpoint, two abilities" icon="plug">
    No need to switch between generations / edits — all flows hit the same endpoint.
  </Card>

  <Card title="Online URL inputs" icon="link">
    `image_url` accepts CDN URLs or base64 data URLs directly — no multipart upload needed.
  </Card>

  <Card title="Native multi-turn" icon="message-circle">
    Keep prior `assistant` messages to continue refining — same logic as ChatGPT.
  </Card>

  <Card title="Best SDK coverage" icon="package">
    Works with the official OpenAI SDK, LangChain, and most Chat frontends out of the box.
  </Card>
</CardGroup>

<Tip>
  **Strict size locking**: pass the top-level `size` field (e.g. `2048x1152`, `3840x2160`) to lock the output to one of the 30 buckets. If you prefer the OpenAI Images API standard format, you can also use the [text-to-image endpoint](/en/api-capabilities/gpt-image-2-vip/text-to-image) (`/v1/images/generations`).
</Tip>

## Related Resources

<CardGroup cols={2}>
  <Card title="Model Overview (full size table)" icon="sparkles" href="/en/api-capabilities/gpt-image-2-vip/overview">
    Complete 30-size table, pricing, technical specs
  </Card>

  <Card title="Text-to-Image API (/v1/images/generations)" icon="wand-sparkles" href="/en/api-capabilities/gpt-image-2-vip/text-to-image">
    OpenAI Images API compatible endpoint, pass `size` to lock dimensions
  </Card>

  <Card title="Image Editing API (/v1/images/edits)" icon="image" href="/en/api-capabilities/gpt-image-2-vip/image-edit">
    multipart/form-data upload with reference images
  </Card>

  <Card title="Sister model gpt-image-2-all" icon="copy" href="/en/api-capabilities/gpt-image-2-all/chat-completions">
    Same call format when you don't need locked size — faster output
  </Card>
</CardGroup>


## OpenAPI

````yaml api-reference/gpt-image-2-vip-chat-openapi-en.yaml POST /v1/chat/completions
openapi: 3.1.0
info:
  title: gpt-image-2-vip Chat API
  description: >
    GPT image generation reverse-engineered model `gpt-image-2-vip` (Codex line)
    — chat-based endpoint (OpenAI Chat Completions compatible).


    **Chat endpoint highlights**: **one endpoint** handles both text-to-image
    and reference-image editing, accepts **online image URLs** (CDN links or
    base64 data URLs) directly, and supports natural multi-turn iteration.


    - `messages` with text only → text-to-image

    - `messages` with `image_url` → image editing with reference

    - `image_url.url` accepts `https://...` or `data:image/png;base64,...`

    - Per-call billing $0.03/image

    - Optional `size` field to lock dimensions (30-bucket set, same as
    /v1/images/generations); omit to let the prompt drive dimensions

    - **Defaults to R2 CDN URL output** (unlike `/v1/images/generations` and
    `/v1/images/edits`, which default to base64). `data[0]` returns either `url`
    **or** `b64_json` — never both.

    - Playground does not support streaming responses — use an SDK for streaming
    tests.


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
  /v1/chat/completions:
    post:
      tags:
        - Chat
      summary: Chat-based image generation / editing
      description: >
        Use the chat endpoint of `gpt-image-2-vip` to generate or edit images
        via a `messages` array.


        - **Text-to-image**: `messages` contains text only — returns an image
        URL or data URL

        - **Edit with reference**: add `image_url` (URL or base64 data URL) —
        returns the edited image

        - **Multi-turn**: keep prior `messages` as context for iterative
        refinement


        The examples below provide **text-only** and **with-reference-image**
        modes, selectable via the right-side Playground dropdown.
      operationId: chatGptImage2Vip
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ChatCompletionRequest'
            examples:
              text-to-image:
                summary: Text-to-image (text only)
                description: >-
                  Just a text prompt. Optional `size` field to lock dimensions;
                  omit to let the prompt drive output size.
                value:
                  model: gpt-image-2-vip
                  size: 2048x1152
                  messages:
                    - role: user
                      content: >-
                        Landscape 16:9 cinematic, old lighthouse at sunset,
                        photorealistic
              edit-with-reference:
                summary: Edit with reference image (multimodal)
                description: >-
                  Provide a reference image (URL or base64 data URL) plus an
                  edit instruction. Optional `size` to lock the output
                  dimensions.
                value:
                  model: gpt-image-2-vip
                  size: 2048x2048
                  messages:
                    - role: user
                      content:
                        - type: text
                          text: Turn this image into a watercolor painting
                        - type: image_url
                          image_url:
                            url: https://example.com/photo.png
              multi-turn:
                summary: Multi-turn iteration
                description: Keep historical messages to continue refining.
                value:
                  model: gpt-image-2-vip
                  messages:
                    - role: user
                      content: Generate a square cat logo, minimalist line art
                    - role: assistant
                      content: (Previous image URL)
                    - role: user
                      content: >-
                        Change the line color to orange, keep the background
                        pure white
      responses:
        '200':
          description: >-
            Image generated. Defaults to an R2 CDN URL in `data[0].url` —
            `b64_json` is not returned in the same response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ChatCompletionResponse'
              example:
                data:
                  - url: >-
                      https://r2cdn.copilotbase.com/r2cdn2/0e82148a-bec0-4b42-bbca-117c6b42581b.png
                created: 1778037331
                usage:
                  input_tokens: 30
                  output_tokens: 2074
                  total_tokens: 2104
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
    ChatCompletionRequest:
      type: object
      required:
        - model
        - messages
      properties:
        model:
          type: string
          description: Model name, fixed to gpt-image-2-vip
          enum:
            - gpt-image-2-vip
          default: gpt-image-2-vip
        messages:
          type: array
          description: Conversation messages. Supports multi-turn and multimodal content.
          items:
            $ref: '#/components/schemas/ChatMessage'
        size:
          type: string
          description: >
            Output dimensions. Optional. Pass `auto` to let the model decide
            (vip tends to converge on a relatively fixed size for a given
            prompt; **with reference images, the output follows the aspect ratio
            of whichever reference image the prompt names as the edit target** —
            not necessarily the first one in multi-image scenarios), or pick one
            of the 30 supported sizes (10 ratios × 1K Fast / 2K Recommended / 4K
            Detail) to lock it strictly. Omit to let the prompt drive the output
            size.

            Format: `width x height` with a lowercase ASCII `x`, e.g.
            `2048x1360`, `3840x2160`. Flat $0.03/image across all buckets.
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
        stream:
          type: boolean
          default: false
          description: >-
            Whether to stream the response. This model returns one-shot — keep
            false. Playground does not support streaming preview.
        temperature:
          type: number
          minimum: 0
          maximum: 2
          default: 1
          description: >-
            Sampling temperature (minor effect on image generation — default is
            fine)
    ChatCompletionResponse:
      type: object
      description: >
        Response shape for the chat endpoint. `data[0]` returns **either `url`
        or `b64_json`, never both**. This endpoint defaults to `url`.
      properties:
        data:
          type: array
          description: Generated results (this model returns 1 image per call)
          items:
            type: object
            properties:
              url:
                type: string
                description: R2 CDN accelerated link (default for this endpoint)
              b64_json:
                type: string
                description: >-
                  Base64-encoded data URL (returned in rare cases, already
                  includes the data:image/png;base64, prefix)
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
    ChatMessage:
      type: object
      required:
        - role
        - content
      properties:
        role:
          type: string
          enum:
            - system
            - user
            - assistant
          description: >-
            Message role: system (system prompt), user (user input), assistant
            (model reply, for multi-turn context)
        content:
          oneOf:
            - type: string
              description: Plain text message. Used for text-to-image or text instructions.
            - type: array
              description: Multimodal content array. Used for editing with reference image.
              items:
                $ref: '#/components/schemas/MessageContentPart'
          description: >-
            Message content. String for plain text; array for multimodal (text +
            image).
    MessageContentPart:
      type: object
      description: Multimodal content fragment. Can be text or an image reference.
      required:
        - type
      properties:
        type:
          type: string
          enum:
            - text
            - image_url
          description: 'Fragment type: text or image_url'
        text:
          type: string
          description: Text content when type=text
          example: Turn this image into a watercolor painting
        image_url:
          $ref: '#/components/schemas/ImageUrl'
    ImageUrl:
      type: object
      description: Image reference. Accepts HTTPS URL or base64 data URL.
      required:
        - url
      properties:
        url:
          type: string
          description: >-
            Image URL. Accepts https://... or data:image/png;base64,... Single
            image recommended ≤ 10MB.
          example: https://example.com/photo.png
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key from the API易 Console

````