> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Native Tool Image Generation

> APIYI does not recommend generating images through the OpenAI Responses API's native image_generation tool: fixed per-call billing and no stability guarantee. Use the standalone Images API, billed by usage. This page is kept for existing integrations only.

## Overview

<Warning>
  **APIYI does not recommend this route for image generation. This page has been removed from the navigation and is kept for existing integrations only.**

  On APIYI the Responses native `image_generation` tool can **only be billed per call** (a fixed tool-call fee of roughly \$0.20 per image, with no usage-based option), which is not a reasonable pricing model;
  and because of supply constraints we **cannot guarantee the stability** of this path.

  Use the standalone Images API instead — [`/v1/images/generations`](/en/api-capabilities/gpt-image-2/text-to-image) and [`/v1/images/edits`](/en/api-capabilities/gpt-image-2/image-edit), billed by usage.
  If you need "let the agent decide whether to draw", have your chat model classify intent and then call the Images API; see the orchestration pattern in
  [Text + image in one API](/en/faq/text-and-image-in-one-api).
</Warning>

Beyond the standalone [text-to-image](/en/api-capabilities/gpt-image-2/text-to-image) / [image-edit](/en/api-capabilities/gpt-image-2/image-edit) endpoints, the gateway can also pass through the **OpenAI Responses API's native `image_generation` tool**: the main model `gpt-5.5` decides on its own when to draw, internally selects a GPT Image model, and returns the image as **base64** in the response `output` array.

<Note>
  **Verified working (2026-06-17)**: `gpt-5.5` + `POST /v1/responses` + `tools: [{"type": "image_generation"}]` returns a valid base64 PNG. Both image paths route directly through OpenAI's official upstream.
</Note>

<Info>
  **Which should you use?** Always use the standalone [`/v1/images/generations`](/en/api-capabilities/gpt-image-2/text-to-image) endpoint — it bills purely by actual usage, is cheaper and more controllable, and is the only image path APIYI guarantees supply for. The native tool method on this page adds a fixed tool-call fee of roughly \$0.20 per image and its stability cannot be guaranteed. **Not recommended for new integrations.**
</Info>

## Comparison of the two methods

| Aspect             | Native tool method (this page)                                                         | images API                                        |
| ------------------ | -------------------------------------------------------------------------------------- | ------------------------------------------------- |
| **Channel**        | Direct OpenAI official forwarding                                                      | Direct OpenAI official forwarding                 |
| **Endpoint**       | `/v1/responses`                                                                        | `/v1/images/generations`, `/v1/images/edits`      |
| **Tool**           | `image_generation`                                                                     | None (pass prompt directly)                       |
| **Billing**        | Usage-based **+ tool-call fee**                                                        | Usage-based                                       |
| **Billing detail** | Text/image input-output priced same as official; **fixed tool-call fee ≈ \$0.20/call** | Text/image input-output priced same as official   |
| **Best for**       | **Not recommended on APIYI** (fixed per-call fee, stability not guaranteed)            | **All image scenarios** — more reasonable billing |

> Core difference: the **native tool method adds a fixed ≈\$0.20 tool fee per image**, while the images API bills purely by actual usage — so it is cheaper in most cases.

## Minimal request

### cURL

```bash theme={null}
curl https://api.apiyi.com/v1/responses \
  -H "Authorization: Bearer $APIYI_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "input": "Generate an image of a gray tabby cat hugging an otter with an orange scarf",
    "tools": [
      { "type": "image_generation" }
    ]
  }'
```

<Note>
  **Pinning a 2.5 model (verified 2026-09-09)**: the tool object accepts a `model` field. Passing `{"type": "image_generation", "model": "gpt-image-2.5-flare", "size": "1024x1024", "quality": "low"}` works (HTTP 200, a 1024×1024 PNG comes back). Note that the `image_generation_call` output item **does not echo the model name**, only `quality` / `size` / `background` / `revised_prompt`, so the response cannot confirm which GPT Image model actually ran. When the model choice matters, call the standalone [text-to-image endpoint](/en/api-capabilities/gpt-image-2/text-to-image) instead.
</Note>

### Python (requests)

```python theme={null}
import base64, requests

resp = requests.post(
    "https://api.apiyi.com/v1/responses",
    headers={
        "Authorization": "Bearer $APIYI_KEY",
        "Content-Type": "application/json",
    },
    json={
        "model": "gpt-5.5",
        "input": "Generate an image of a gray tabby cat hugging an otter with an orange scarf",
        "tools": [{"type": "image_generation"}],
    },
    timeout=300,           # Generation is slow; allow plenty of timeout (~60-90s per image)
)
data = resp.json()

# Pull the image tool result out of the output array
for item in data["output"]:
    if item.get("type") == "image_generation_call":
        raw = base64.b64decode(item["result"])   # result field is a base64 image
        with open("output.png", "wb") as f:
            f.write(raw)
        print("Saved output.png,", len(raw), "bytes")
```

<Tip>
  Optional parameters go inside the `tools` item: `{"type": "image_generation", "output_format": "png|jpeg|webp", "size": "1024x1024", ...}`. Omit them to use the defaults (png).
</Tip>

## Response structure (key fields)

On success (HTTP 200), the response body contains:

```jsonc theme={null}
{
  "id": "resp_...",
  "model": "gpt-5.5-2026-04-23",
  "status": "completed",
  "output": [
    {
      "type": "image_generation_call",   // <- key: the tool actually fired
      "result": "<a very long base64 PNG string>"  // <- the image itself, base64, png by default
    },
    { "type": "message", "content": [ /* may be empty; image responses don't always include text */ ] }
  ],
  "usage": { "input_tokens": 2347, "output_tokens": 74 }
}
```

How to tell whether an image was actually produced:

* ✅ **Success**: `output` contains `type="image_generation_call"`, and `result` decodes to a valid image starting with `\x89PNG`.
* ⚠️ **Silently stripped**: HTTP 200 but **no** `image_generation_call` in `output`, only text (common when a channel doesn't support the tool).
* ❌ **Error**: non-200, or returns `unknown tool` / `no available channels`, etc. For the latter two, fall back to `/v1/images/generations`.

## Transparent background

The `image_generation` tool accepts `background: "transparent"`, same as `/v1/images/generations`:

```json theme={null}
{
  "model": "gpt-5.5",
  "input": "Generate a cartoon fox sticker",
  "tools": [{
    "type": "image_generation",
    "model": "gpt-image-2",
    "background": "transparent",
    "output_format": "png"
  }]
}
```

The returned `image_generation_call` echoes `"background": "transparent"`, and `result` decodes to a PNG with a real alpha channel. `output_format` must be `png` or `webp` — pairing it with `jpeg` errors out, since jpeg has no alpha channel.

For per-model transparency support see [How do I generate images with a transparent background](/en/faq/image-transparent-background).

## 💰 Billing

Take one real call as an example (input 2347 tokens, output 74 tokens, generating one 1122×1402 PNG). The **final charge = \$0.213954**, which is correct. Breakdown:

| Component              | Quota calculation                                                                            | USD                  |
| ---------------------- | -------------------------------------------------------------------------------------------- | -------------------- |
| Text portion           | `(input 2347 + output 74×completion multiplier 6) × input multiplier 2.5` = **6977.5 quota** | ≈ \$0.014            |
| **Image tool portion** | **≈ 100,000 quota** (per image, independent of tokens)                                       | **≈ \$0.20 / image** |
| **Total**              | **106,977 quota**                                                                            | **\$0.213954**       |

> Conversion: `500,000 quota = \$1` (derived from `106977 quota = \$0.213954`).

<Warning>
  **A display quirk in the console detail page (explain this to customers proactively)**

  On APIYI's "conditional billing detail" page:

  * The top section only shows the **text portion** of the math (`base cost = (2347 + 74×6) × 2.5 = 6977.50`);
  * The **image tool-call charge (≈100,000 quota / ≈\$0.20) shows up as a blank row in the detail list — it isn't rendered**;
  * but it **is correctly counted** in the bottom-line "final quota 106977 / \$0.213954".

  **Conclusion: billing is normal and accurate** — the detail UI simply fails to display the "image tool" row, so the line items don't sum to the final total. When explaining to customers, emphasize: **the total is correct; the difference is this image's tool fee (≈\$0.20/image), just not itemized separately.**
</Warning>

### Cost notes

* The generation fee is **fixed per image** (≈\$0.20/image) and does not vary with prompt length; the text token cost is small by comparison.
* Each image takes \~60-90s; set a client timeout of ≥300s.
* If you only need an image and don't need the model to decide autonomously, the standalone [`/v1/images/generations`](/en/api-capabilities/gpt-image-2/text-to-image) endpoint is likely cheaper and more controllable.

## Troubleshooting

| Symptom                            | Likely cause                                                 | Fix                                                 |
| ---------------------------------- | ------------------------------------------------------------ | --------------------------------------------------- |
| 200 but no `image_generation_call` | Current channel doesn't support the tool (silently stripped) | Switch key/channel, or use `/v1/images/generations` |
| `no available channels`            | No matching channel under the key's group                    | Switch to a key group with GPT/image channels       |
| Request timeout                    | Generation is slow                                           | Set client timeout to 300s                          |
| `result` doesn't decode to PNG     | Output format changed / channel anomaly                      | Check `output_format`, verify the magic bytes       |

## Related docs

* [GPT-Image-2 Overview](/en/api-capabilities/gpt-image-2/overview) - Model overview and pricing
* [Text-to-Image API Reference](/en/api-capabilities/gpt-image-2/text-to-image) - `/v1/images/generations`, the default choice for most cases
* [Image Edit API Reference](/en/api-capabilities/gpt-image-2/image-edit) - `/v1/images/edits`, reference-image edits / multi-image fusion / mask
