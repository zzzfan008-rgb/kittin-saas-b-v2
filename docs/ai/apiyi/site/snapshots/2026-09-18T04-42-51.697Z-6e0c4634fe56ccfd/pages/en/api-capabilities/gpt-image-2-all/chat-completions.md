> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Chat-Style API Reference

> gpt-image-2-all chat-style endpoint — one endpoint for both text-to-image and reference-image editing via inline URLs; for multi-turn edits, pass the previous output as image_url in a new user message.

<Note>
  **This calling style is no longer recommended**: use [/v1/images/generations](/en/api-capabilities/gpt-image-2-all/text-to-image) and [/v1/images/edits](/en/api-capabilities/gpt-image-2-all/image-edit) instead — more stable, and the same code works with the official-relay `gpt-image-2`. The chat-style endpoint on this page still works, and remains useful for multi-turn iterative editing or passing online image URLs directly.
</Note>

<Info>
  **What the chat-style endpoint offers**: **one endpoint for both text-to-image and reference-image editing**, accepting inline image URLs (CDN links or base64 data URLs) as references. The response is standard Chat Completions format, with the image returned as Markdown inside `choices[0].message.content`.

  If you want one codebase that works across both official-relay and reverse channels, use `/v1/images/generations` and `/v1/images/edits` (standard OpenAI Images API format).
</Info>

<Tip>
  **Choosing a mode**:

  * text-only `messages` → **text-to-image**
  * add `image_url` (URL or base64 data URL) to the user message → **reference-image editing**
  * to **edit the previous image across turns** → put the previous output's URL into the `image_url` of a **new user message** (see [Multi-turn editing](#multi-turn-editing))
</Tip>

<Warning>
  **Multi-turn editing does NOT work by keeping conversation history.** This is a reverse model and **only reads the `image_url` in the last user message as the base image**; any image placed in `assistant` history (whether a plain-text URL or an `image_url` structure) is **ignored**. To edit the previous image you must pass it as the reference in a **new user message** — see [Multi-turn editing](#multi-turn-editing).
</Warning>

## Response format

The response is **standard Chat Completions format**, with the generated image as **Markdown** inside `choices[0].message.content` (an R2 CDN link by default):

```json theme={null}
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1778037331,
  "model": "gpt-image-2.5-all",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "![image](https://r2cdn.copilotbase.com/r2cdn2/xxxx.png)\n\n"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": { "prompt_tokens": 24, "completion_tokens": 818, "total_tokens": 842 }
}
```

<Info>
  **Extracting the image**: pull the Markdown link `![...](url)` out of `choices[0].message.content` with a regex. In rare cases `content` holds a base64 data URL (`![image](data:image/png;base64,...)`), which the same regex captures — usable directly as an `<img src>`.
</Info>

<Warning>
  **🖥️ Browser Playground limit (when the response carries base64)**: if `content` returns a long base64 blob, the response string can reach several MB and the Playground **may show** `unable to complete request` — the **request actually succeeded**; the browser just can't render that much. Copy the code below and run it locally.
</Warning>

## Code examples

<Note>
  The response is a standard Chat Completions structure with a `choices` field, so you can **also use the OpenAI SDK directly** (`client.chat.completions.create(...)`), read `resp.choices[0].message.content` for the Markdown, and extract the image URL. The examples below use plain `requests` / `fetch`.
</Note>

### Python (text-to-image)

```python theme={null}
import re, requests

API_KEY = "sk-your-api-key"

resp = requests.post(
    "https://api.apiyi.com/v1/chat/completions",
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json={
        "model": "gpt-image-2.5-all",
        "messages": [
            {"role": "user", "content": "16:9 cinematic, an old seaside lighthouse at dusk, photorealistic"}
        ],
    },
    timeout=300,  # generous, to absorb tail latency + image upload/download
).json()

content = resp["choices"][0]["message"]["content"]
url = re.search(r'!\[[^\]]*\]\((.*?)\)', content).group(1)  # pull the image URL from Markdown
print(url)
```

### Python (reference-image editing)

```python theme={null}
import re, base64, requests

API_KEY = "sk-your-api-key"

# Either an HTTPS URL or a base64 data URL
with open("photo.png", "rb") as f:
    data_url = "data:image/png;base64," + base64.b64encode(f.read()).decode()

resp = requests.post(
    "https://api.apiyi.com/v1/chat/completions",
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json={
        "model": "gpt-image-2.5-all",
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Turn this photo into a watercolor painting"},
                    {"type": "image_url", "image_url": {"url": data_url}},
                ],
            }
        ],
    },
    timeout=300,
).json()

content = resp["choices"][0]["message"]["content"]
print(re.search(r'!\[[^\]]*\]\((.*?)\)', content).group(1))
```

### cURL (text-to-image)

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/chat/completions" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2.5-all",
    "messages": [
      {"role": "user", "content": "16:9, cyberpunk rainy night street, neon sign reading Hello World"}
    ]
  }'
{/* the image is in choices[0].message.content, like ![image](https://...png) */}
```

### cURL (reference-image editing)

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/chat/completions" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2.5-all",
    "messages": [
      {
        "role": "user",
        "content": [
          { "type": "text", "text": "Turn this photo into a watercolor painting" },
          { "type": "image_url", "image_url": { "url": "https://example.com/photo.png" } }
        ]
      }
    ]
  }'
```

### Node.js (text-to-image)

```javascript theme={null}
import { Agent, setGlobalDispatcher } from "undici";

const API_KEY = "sk-your-api-key";

// Generation is a long request, and undici's default connect timeout is only 10s —
// it is NOT governed by AbortSignal.timeout below (different layers)
setGlobalDispatcher(new Agent({
  connect: { timeout: 30_000 },
  headersTimeout: 300_000,
  bodyTimeout: 300_000,
}));

const resp = await fetch("https://api.apiyi.com/v1/chat/completions", {
  method: "POST",
  signal: AbortSignal.timeout(300_000),   // total timeout — a different layer
  headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "gpt-image-2.5-all",
    messages: [{ role: "user", content: "1024x1024 square logo, minimalist cat line art" }],
  }),
});

const data = await resp.json();
const content = data.choices[0].message.content;
const url = content.match(/!\[[^\]]*\]\((.*?)\)/)[1];  // extract image URL
console.log(url);
```

<Tip>
  The `undici` import above needs installing separately (`npm i undici`) — it powers the built-in `fetch` but is not exposed under that module name, and the copy you install still reaches the built-in `fetch` through `setGlobalDispatcher`.

  `maxRetries`, `connectTimeout` and the total request timeout all live at different layers, and configuring the wrong one is the most common Node-side pitfall. For connection resets, `UND_ERR_CONNECT_TIMEOUT`, or truncated large responses behind a proxy, see [Troubleshooting Image API Connection Drops](/en/api-capabilities/image-connection-drops).
</Tip>

## Multi-turn editing

To keep editing on top of the previous image, **do not rely on conversation history** (images in `assistant` turns are ignored). The correct way: **send the previous output's URL again as the `image_url` of a new user message**, together with the new instruction. To keep iterating, feed the latest output back in.

```python theme={null}
import re, requests

API_KEY = "sk-your-api-key"
URL = "https://api.apiyi.com/v1/chat/completions"
H = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}


def edit_with(image_url, instruction):
    """Use image_url as the base image, edit per instruction, return the new image URL."""
    resp = requests.post(URL, headers=H, json={
        "model": "gpt-image-2.5-all",
        "messages": [{
            "role": "user",
            "content": [
                {"type": "text", "text": instruction},
                {"type": "image_url", "image_url": {"url": image_url}},
            ],
        }],
    }, timeout=300).json()
    content = resp["choices"][0]["message"]["content"]
    return re.search(r'!\[[^\]]*\]\((.*?)\)', content).group(1)


# Turn 1: change the sofa color based on the original image
img1 = edit_with("https://example.com/cat.png", "Make the sofa red; keep the cat and composition unchanged")
# Turn 2: feed turn 1's output back in to refine further
img2 = edit_with(img1, "Put a small yellow hat on the cat; keep everything else the same")
print(img2)
```

<Warning>
  The "real conversational multi-turn via `assistant` history" pattern below **does NOT work** (the output won't be based on the previous image) — do not use it:

  ```json theme={null}
  {"messages": [
    {"role": "user", "content": "Generate an orange cat sitting on a blue sofa"},
    {"role": "assistant", "content": "![image](https://.../cat.png)"},
    {"role": "user", "content": "Make the sofa red"}
  ]}
  ```

  Put `https://.../cat.png` into the `image_url` of a **new user message** (see the code above) for the edit to actually build on that image.
</Warning>

<Tip>
  Equivalent approach: use the `/v1/images/edits` standard editing endpoint, uploading the previous output as the `image` field plus a new instruction — same iterative result. See [Image Editing API](/en/api-capabilities/gpt-image-2-all/image-edit).
</Tip>

## Parameter reference

| Parameter            | Type            | Required | Description                                                                                                                                 |
| -------------------- | --------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`              | string          | Yes      | `gpt-image-2.5-all` or `gpt-image-2-all` (same price and behavior)                                                                          |
| `messages`           | array           | Yes      | Message array; supports `system` / `user` / `assistant` roles (note: the base image is taken only from the last user message's `image_url`) |
| `messages[].content` | string \| array | Yes      | Plain text string (text-to-image) or multimodal array (editing with an image)                                                               |
| `stream`             | boolean         | No       | Whether to stream. This model produces the image in one shot — keep `false`                                                                 |

**Multimodal content parts** (when `content` is an array):

| Field           | Type   | Required    | Description                                                                           |
| --------------- | ------ | ----------- | ------------------------------------------------------------------------------------- |
| `type`          | enum   | Yes         | `text` or `image_url`                                                                 |
| `text`          | string | Conditional | Required when `type=text`                                                             |
| `image_url.url` | string | Conditional | Required when `type=image_url`. Supports `https://...` or `data:image/png;base64,...` |

## Why the chat-style endpoint

<CardGroup cols={2}>
  <Card title="Two abilities, one endpoint" icon="plug">
    No switching between generations / edits — everything goes through one endpoint
  </Card>

  <Card title="Inline URLs" icon="link">
    `image_url` accepts a CDN image link or base64 data URL directly — no multipart upload
  </Card>

  <Card title="Standard chat response" icon="code">
    The response has `choices`, so the OpenAI SDK and Chat frontends work directly; the image is in the Markdown of `message.content`
  </Card>

  <Card title="Iterative editing" icon="image">
    Feed the previous output as the reference in a new user turn to refine step by step (not conversational state memory)
  </Card>
</CardGroup>

<Tip>
  If your code must support **both official-relay and reverse channels**, use `/v1/images/generations` and `/v1/images/edits` (standard OpenAI Images API format) — one codebase switches channels.
</Tip>

## Related resources

<CardGroup cols={2}>
  <Card title="Model Overview" icon="sparkles" href="/en/api-capabilities/gpt-image-2-all/overview">
    Capabilities, pricing, best practices
  </Card>

  <Card title="Text-to-Image API (/v1/images/generations)" icon="wand-sparkles" href="/en/api-capabilities/gpt-image-2-all/text-to-image">
    OpenAI Images API compatible endpoint
  </Card>

  <Card title="Image Editing API (/v1/images/edits)" icon="image" href="/en/api-capabilities/gpt-image-2-all/image-edit">
    multipart/form-data reference-image editing; multi-turn works the same way
  </Card>

  <Card title="Online generation" icon="globe" href="https://imagen.apiyi.com">
    imagen.apiyi.com online testing
  </Card>
</CardGroup>


## OpenAPI

````yaml api-reference/gpt-image-2-all-chat-openapi-en.yaml POST /v1/chat/completions
openapi: 3.1.0
info:
  title: gpt-image-2-all Chat API (⭐ Recommended)
  description: >
    GPT image generation reverse-engineered model `gpt-image-2-all` — chat-based
    endpoint (OpenAI Chat Completions compatible).


    **⭐ Recommended endpoint**: Compared to `/v1/images/generations` and
    `/v1/images/edits`, the chat endpoint has **better prompt adherence** and
    **supports both text-to-image and image editing from the same endpoint**.


    - `messages` with text only → text-to-image

    - a user message with `image_url` → image editing with reference

    - `image_url.url` accepts `https://...` or `data:image/png;base64,...`

    - **Multi-turn editing**: send the previous output's URL as the `image_url`
    of a **new user message** (images in `assistant` history are ignored)

    - Per-call billing $0.03/image

    - **Standard Chat Completions response** — the image is returned as Markdown
    inside `choices[0].message.content` (an R2 CDN link by default)

    - Playground does not support streaming responses — use an SDK for streaming
    tests.


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
  /v1/chat/completions:
    post:
      tags:
        - Chat (Recommended)
      summary: Chat-based image generation / editing (⭐ Recommended)
      description: >
        Use the chat endpoint of `gpt-image-2-all` to generate or edit images
        via a `messages` array.


        - **Text-to-image**: `messages` contains text only

        - **Edit with reference**: add `image_url` (URL or base64 data URL) to a
        user message

        - **Multi-turn editing**: send the previous output's URL as the
        `image_url` of a **new user message**. Note: this model reads the base
        image only from the **last user message's `image_url`**; images in
        `assistant` history are ignored, so **you cannot do multi-turn by
        keeping conversation history**.


        The response is standard Chat Completions format, with the image as
        Markdown (`![image](url)`) inside `choices[0].message.content`.
      operationId: chatGptImage2All
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ChatCompletionRequest'
            examples:
              text-to-image:
                summary: Text-to-image (text only)
                description: Just a text prompt. Put size/ratio in the prompt.
                value:
                  model: gpt-image-2.5-all
                  messages:
                    - role: user
                      content: >-
                        Landscape 16:9 cinematic, old lighthouse at sunset,
                        photorealistic
              edit-with-reference:
                summary: Edit with reference image (multimodal)
                description: >-
                  Provide a reference image (URL or base64 data URL) plus an
                  edit instruction.
                value:
                  model: gpt-image-2.5-all
                  messages:
                    - role: user
                      content:
                        - type: text
                          text: Turn this image into a watercolor painting
                        - type: image_url
                          image_url:
                            url: https://example.com/photo.png
              multi-turn:
                summary: Multi-turn editing (use the previous output as the reference)
                description: >-
                  Multi-turn editing = send the previous output's URL as the
                  image_url of a new user message, with a new instruction. Do
                  not rely on assistant history (it is ignored).
                value:
                  model: gpt-image-2.5-all
                  messages:
                    - role: user
                      content:
                        - type: text
                          text: >-
                            Make the sofa red; keep the cat and composition
                            unchanged
                        - type: image_url
                          image_url:
                            url: >-
                              https://r2cdn.copilotbase.com/r2cdn2/previous-output.png
      responses:
        '200':
          description: >-
            Image generated. Standard Chat Completions format, with the image as
            Markdown inside `choices[0].message.content`.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ChatCompletionResponse'
              example:
                id: chatcmpl-xxx
                object: chat.completion
                created: 1778037331
                model: gpt-image-2.5-all
                choices:
                  - index: 0
                    message:
                      role: assistant
                      content: >+
                        ![image](https://r2cdn.copilotbase.com/r2cdn2/0e82148a-bec0-4b42-bbca-117c6b42581b.png)

                    finish_reason: stop
                usage:
                  prompt_tokens: 24
                  completion_tokens: 818
                  total_tokens: 842
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
          description: >-
            Model name: gpt-image-2.5-all or gpt-image-2-all (same ChatGPT web
            line, same price and behavior)
          enum:
            - gpt-image-2.5-all
            - gpt-image-2-all
          default: gpt-image-2.5-all
        messages:
          type: array
          description: >-
            Conversation messages. The base image is taken only from the last
            user message's image_url.
          items:
            $ref: '#/components/schemas/ChatMessage'
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
        Standard Chat Completions response. The generated image is returned as
        Markdown (`![image](url)`) inside `choices[0].message.content` — an R2
        CDN link by default; in rare cases a base64 data URL.
      properties:
        id:
          type: string
          description: Response ID
        object:
          type: string
          example: chat.completion
        created:
          type: integer
          description: Unix timestamp (seconds)
        model:
          type: string
          example: gpt-image-2-all
        choices:
          type: array
          items:
            type: object
            properties:
              index:
                type: integer
              message:
                type: object
                properties:
                  role:
                    type: string
                    example: assistant
                  content:
                    type: string
                    description: >-
                      Markdown containing the image, like
                      ![image](https://...png)
              finish_reason:
                type: string
                example: stop
        usage:
          type: object
          description: Token usage statistics
          properties:
            prompt_tokens:
              type: integer
            completion_tokens:
              type: integer
            total_tokens:
              type: integer
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
            Message role. Note: images placed in assistant turns are not used as
            the base image.
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
      description: API Key from the APIYI Console

````