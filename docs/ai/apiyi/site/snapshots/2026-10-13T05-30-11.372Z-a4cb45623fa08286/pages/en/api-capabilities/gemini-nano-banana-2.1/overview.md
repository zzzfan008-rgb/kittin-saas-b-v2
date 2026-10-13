> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana 2.1 Image Gen/Editing

> Google Nano Banana 2.1 (gemini-nano-banana-2.1), generally available: an upgrade to Nano Banana 2 with better image quality, text rendering and multi-turn consistency. $0.045 per request (4K included), or token-based at $0.66 input / $13.2 output per 1M tokens.

## Overview

**Nano Banana 2.1** is an image generation model Google released on October 6, 2026. Its model ID is **`gemini-nano-banana-2.1`**, and it launched as generally available (GA). It is an upgrade to [Nano Banana 2](/en/api-capabilities/nano-banana-2-image/overview) (`gemini-3.1-flash-image`): it keeps Flash-level speed while improving image quality, in-image text rendering and multi-turn editing consistency, and it fixes the tiling artifacts of the previous version. Google recommends 2.1 for all new projects.

<Note>
  **🆕 Released October 6, 2026**: Available on APIYI now, with both **per-request** billing (\$0.045 per request, same price for 1K / 2K / 4K, down from \$0.05 since October 13, 2026) and **token-based** billing (\$0.66 input / \$13.2 output per 1M tokens). Nano Banana 2 remains available at the same price, and Google has not announced a shutdown date for it.
</Note>

<Info>
  All image APIs are **synchronous** — there is no task ID to poll, and if your client disconnects the result is lost while the request is still billed. Set a generous timeout for this model; see [Image API Essentials & Best Practices](/en/api-capabilities/image-api-best-practices).
</Info>

<CardGroup cols={2}>
  <Card title="Text-to-Image API" icon="wand-sparkles" href="/en/api-capabilities/gemini-nano-banana-2.1/text-to-image">
    Generate images from a text prompt, with an interactive Playground.
  </Card>

  <Card title="Image Editing API" icon="image" href="/en/api-capabilities/gemini-nano-banana-2.1/image-edit">
    Upload images plus an instruction to get an edited result, with an interactive Playground.
  </Card>
</CardGroup>

## Let an AI Agent Integrate It for You

<Note>
  If you build with Codex, Claude Code or Cursor, copy the prompt below into it. It first fetches the plain-text version of this page (append `.md` to any docs URL) and then writes code for your stack. The most common pitfalls — timeouts, defensive `parts` parsing, upload compression and resolution parameters — are already spelled out as requirements.
</Note>

<Prompt description="Have a coding agent integrate or debug Nano Banana 2.1 text-to-image and image editing. Copy and paste it into Codex, Claude Code, Cursor, etc." icon="bot" actions={["copy"]}>
  Integrate (or debug) Nano Banana 2.1 (`gemini-nano-banana-2.1`) text-to-image + image editing in this project.

  Read the docs before writing code: fetch [https://docs.apiyi.com/en/api-capabilities/gemini-nano-banana-2.1/overview.md](https://docs.apiyi.com/en/api-capabilities/gemini-nano-banana-2.1/overview.md) for the plain-text version of this page. For detailed parameters, append `.md` to the text-to-image and image-edit pages as well.

  Requirements:

  1. Timeouts: use the Gemini native format `POST https://api.apiyi.com/v1beta/models/gemini-nano-banana-2.1:generateContent` and set the client timeout to 360 seconds. Image calls are synchronous with no task ID: if the client disconnects, the result is lost but the request is still billed. Raise the limits on every layer in between too (reverse proxy, gateway, serverless execution limit) — any layer shorter than the generation time will cut the request. If you use Node, note that undici has three separate timeouts and the SDK `timeout` does not cover them.

  2. Parsing the response (**the easiest one to get wrong**): the image is base64 in `inlineData.data` inside `candidates[0].content.parts[]`. But `parts` is a **heterogeneous array whose length and order are not guaranteed** — a text part may come first, putting the image at index 1 instead of 0. So **never hard-code `parts[0]` or `parts[1]`**. Instead, iterate over `parts`, collect every part that has `inlineData`, and take the **last one** (complex tasks can return several drafts; the last one is final). Read `mimeType` from the response instead of hard-coding `image/png`. Render the image and offer a "save to disk" action.

  3. Upload compression: for editing, put reference images as base64 in `inlineData`. Compress before uploading — only files over 1.5MB, scale the long edge down to 2048px (never upscale), re-encode at quality 0.9 in the original format, and keep the total under 6MB for multi-image requests. Base64 adds roughly a third to the size, so keep each image under 5MB. If compressing one image fails, fall back to the original instead of failing the whole request. Also: **a single part may contain either `text` or `inlineData`, never both** — the correct structure is 1 text part + N image parts.

  4. Resolution parameters: **always pass** `generationConfig.imageConfig.imageSize` (`1K` / `2K` / `4K`, default `1K`; **this model does not support `512` and returns 400 if you pass it**) and `aspectRatio` (14 valid ratios are listed on this page). Without `aspectRatio`, the model picks a ratio based on the content, so the output shape is unpredictable. With token-based billing, **resolution directly sets the price**. Expose both resolution and ratio as dropdowns in the UI.

  5. Error handling: when content moderation blocks a request, HTTP is still 200 but `candidates[0].content.parts` is empty. Check `candidatesTokenCount == 0` first, then whether `finishReason` is not `STOP`. Blocks like `IMAGE_SAFETY` are **not billed**, and retrying the same request once or twice often succeeds, so retry them automatically.

  6. Read the key from the `APIYI_API_KEY` environment variable and send it as `Authorization: Bearer ...`. Never hard-code it or commit it to git.

  7. When done, actually run one text-to-image call and one image-edit call, and show me the images and the cost of both calls.
</Prompt>

<Accordion title="What this prompt protects you from">
  | Requirement | Pitfall it avoids |
  | - | - |
  | No hard-coded `parts` index | The number and order of `parts` are not guaranteed, so a fixed index fails intermittently. See the [Nano Banana Dev Guide](/en/api-capabilities/nano-banana-dev-guide) |
  | Take the last image part | Complex edits can return several drafts; the last one is final |
  | Never send `512` | 2.1 drops the 512 tier; Nano Banana 2 code that uses it fails with 400 |
  | Always pass `imageSize` and `aspectRatio` | With token-based billing, resolution sets the price; without a ratio the model chooses one, so the same prompt may come back landscape or portrait |
  | Compress before upload | Base64 adds about a third to the size. See [Image Compression & Output Resolution](/en/api-capabilities/image-compression-resolution) |
  | Auto-retry `IMAGE_SAFETY` | Moderation blocks return 200 with no image and are not billed; a plain retry often succeeds. See [Gemini Image Error Handling](/en/api-capabilities/gemini-image-error-handling) |
</Accordion>

## Key Features

<CardGroup cols={2}>
  <Card title="Better image quality" icon="sparkles">
    Higher visual quality than Nano Banana 2, with the previous version's tiling artifacts fixed
  </Card>

  <Card title="More accurate text" icon="type">
    Clearer in-image text with fewer typos — good for posters, marketing assets and infographics
  </Card>

  <Card title="Steadier multi-turn edits" icon="message-circle">
    Characters and scenes stay more consistent across conversational edits
  </Card>

  <Card title="Three thinking levels" icon="brain">
    minimal / medium / high, default medium — one more level than the previous version
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="Up to 4K output" icon="expand">
    1K / 2K / 4K; with per-request billing, 4K costs the same as 1K
  </Card>

  <Card title="14 aspect ratios" icon="maximize">
    Includes the extra-tall and extra-wide 1:4, 4:1, 1:8 and 8:1; Google says wide formats look better at higher resolutions
  </Card>

  <Card title="Multi-reference fusion" icon="users">
    Up to 10 object references + 4 character references + 3 style references
  </Card>

  <Card title="Google Search grounding" icon="search">
    Attach the `googleSearch` tool for images that need live information, such as weather cards or market charts
  </Card>
</CardGroup>

## How It Differs from Nano Banana 2

| | **Nano Banana 2.1** | Nano Banana 2 |
| - | - | - |
| Model ID | `gemini-nano-banana-2.1` | `gemini-3.1-flash-image` |
| Status | GA; Google recommends it for new projects | GA; still available |
| Quality / text rendering / multi-turn consistency | Better | Good |
| Resolutions | 1K / 2K / 4K | 512 / 1K / 2K / 4K |
| Output tokens per 4K image | 3780 | 2520 |
| Thinking levels | minimal / medium / high, default medium | minimal / high, default minimal |
| Google price: input | \$1.50 / 1M | \$0.50 / 1M |
| Google price: image output | \$30 / 1M | \$60 / 1M |
| Google price: per 4K image | \$0.113 | \$0.151 |
| **APIYI per request** | **\$0.045** | \$0.055 |
| **APIYI token-based** | \$0.66 input / \$13.2 output per 1M | \$0.18 input / \$21.6 output per 1M |

<Tip>
  **Which one to use**:

  * **New projects** → Nano Banana 2.1: better quality, and cheaper per request
  * **Already on Nano Banana 2** → switch by changing the model name; if your code uses the `512` tier, change it to `1K` first
  * **Need 512px thumbnails** → stay on Nano Banana 2, or use [Nano Banana 2 Lite](/en/api-capabilities/nano-banana-lite-image/overview)
  * **Want the highest quality** → [Nano Banana Pro](/en/api-capabilities/nano-banana-image/overview) (\$0.09 per request)
</Tip>

## Pricing

<Info>
  **Choosing a billing mode**: Nano Banana 2.1 supports two billing modes, chosen with the "Billing model" setting when you create a token:

  * **Pay-as-you-go** or **Pay-as-you-go Priority** → token-based billing
  * **Pay-per-request** or **Pay-per-request Priority** → per-request billing
  * ⚠️ **Do not choose Hybrid billing**
</Info>

### Per-request billing

| Model | APIYI price | Google price (4K) | vs. Google |
| - | - | - | - |
| **Nano Banana 2.1** `gemini-nano-banana-2.1` | **\$0.045 per request** (same for 1K / 2K / 4K) | \$0.113 per image | **about 40%** |

<Tip>
  **10% price cut from October 13, 2026: \$0.05 → \$0.045 per request** (same for 1K / 2K / 4K).

  * **Why**: with token-based billing, 1K / 2K images already cost only \$0.02–\$0.04 each, which made \$0.05 per request look expensive, so we lowered the per-request price too. For 4K, per-request is now nearly 30% cheaper than token-based (\$0.06 or more).
  * **Token-based pricing is unchanged**: \$0.66 input / \$13.2 output per 1M tokens.
  * **Even lower**: with the 10%–20% top-up bonus, the effective per-request cost is about \$0.038–\$0.041.
</Tip>

### Token-based billing

| Item | Google | APIYI | vs. Google |
| - | - | - | - |
| Input | \$1.50 / 1M tokens | \$0.66 / 1M tokens | **44%** |
| Output (image, text and thinking at one rate) | Images \$30 / 1M; text and thinking \$7.50 / 1M | \$13.2 / 1M tokens | **44%** of the image rate |

<Note>Model prices are aligned with the official website and may change with it; the table above is for reference only — the **Model Pricing** tab in the top navigation is authoritative: [Model Pricing](/en/models/index).</Note>

### Token-based billing: real charges from production

Nano Banana 2.1 **thinks before generating by default** (default level: medium). Besides the image tokens, each image produces roughly 400–1300 thinking and other output tokens, billed together with the image at \$13.2 / 1M. So the cost per image with token-based billing **is not fixed — it varies**. The table below is taken from real token-billed requests on 2026-10-07; amounts are the actual charges in the console (resolution inferred from output tokens):

| Scenario | Input tokens | Output tokens | Actual charge |
| - | - | - | - |
| 1K text-to-image | 36 | 1,970 | \$0.0260 |
| 1K single-image edit | 1,137 | 2,015 | \$0.0273 |
| 1K single-image edit (more thinking) | 1,132 | 2,409 | \$0.0325 |
| 2K text-to-image | 13 | 2,623 | \$0.0346 |
| 2K single-image edit | 1,188 | 2,957 | \$0.0398 |
| 2K fusion of 14 reference images | 15,735 | 2,827 | \$0.0581 |
| 4K text-to-image | 13 | 4,703 | \$0.0621 |
| 4K complex prompt | 72 | 4,933 | \$0.0652 |

Distribution of that day's 60 token-billed requests:

| Resolution | Requests | Min | Median | Max | Per-request price |
| - | - | - | - | - | - |
| 1K | 31 | \$0.021 | \$0.029 | \$0.033 | \$0.045 |
| 2K | 19 | \$0.033 | \$0.036 | \$0.058 | \$0.045 |
| 4K | 10 | \$0.061 | \$0.063 | \$0.067 | \$0.045 |

<Tip>
  **Which billing mode to choose**:

  * **1K / 2K → token-based**: usually \$0.02–\$0.04 per image, below the \$0.045 per-request price
  * **4K → per-request**: a fixed \$0.045, while token-based costs \$0.06 or more
  * **Many reference images in one request** (say 10+): input tokens push the token-based cost close to or above \$0.045, so use per-request for these too

  Combined with our [top-up bonus](/en/faq/recharge-promotions), your actual cost is lower still.
</Tip>

<Info>
  **Why image tokens alone underestimate the cost**: `thoughtsTokenCount` in `usageMetadata` is not included in `candidatesTokenCount`, but it is counted as output tokens in your APIYI logs and billed. Estimating from 1120 / 1680 / 3780 tokens underestimates the cost by 20%–40%. Reconcile against the charges in your console logs.
</Info>

## Parameters That Affect Your Bill

| Parameter | Effect on cost per request | Notes |
| - | - | - |
| `imageConfig.imageSize` | 1K \~\$0.026 → 4K \~\$0.062 (token-based) | The biggest lever; no effect on per-request billing |
| `thinkingConfig.thinkingLevel` | `high` uses about 30% more thinking tokens, about +6% for a 4K image | Small effect; turn it on when needed |
| `tools: [{"googleSearch": {}}]` | \$0.014 per search query; our tests ran 2 queries per image | Noticeably raises the cost per request |

### thinkingLevel: default is medium, and high costs only a little more

| Setting | Thinking tokens (median) | Cost per 4K image (token-based) |
| - | - | - |
| Not set (default medium) | \~690 | \~\$0.062 |
| `high` | \~940 | \~\$0.066 |

Unlike Nano Banana 2 (default minimal, where `high` costs 54% more), 2.1 already thinks by default, and `high` just thinks a bit longer. Turn it on freely when in-image text layout or chart proportions must be exact.

### Google Search grounding: billed per search query

For images that need live information (weather cards, market charts, posters for recent events), attach the `googleSearch` tool:

```json theme={null}
{
  "contents": [{ "parts": [{ "text": "A weather card poster for Tokyo today" }] }],
  "tools": [{ "googleSearch": {} }]
}
```

In our tests grounding triggered 3 out of 3 times, and the model ran 2 search queries per request on its own. Each query costs \$0.014 (\$14 per 1,000). **The model decides how many queries to run, and you can't cap it in advance**, so budget for 2–3 queries per request.

<Warning>
  **Search fees apply on top of per-request billing too**: \$0.045 per request covers the image only; with `googleSearch` attached, each search query is added on top.
</Warning>

## Groups

Nano Banana 2.1 is available in two groups on APIYI; switch between them in your token settings:

| Group | Multiplier | Use case |
| - | - | - |
| `Default` | 1.0x | Standard channel at the listed prices; recommended by default |
| `NB-Enterprise` | 1.4x | Fallback channel for when the default group is busy or timing out; stability first |

**Recommended token billing mode**: choose `Pay-as-you-go Priority` — it works with token-based billing for Nano Banana 2 / 2.1 and per-request billing for Nano Banana Pro, so **one token covers the whole family**. Put `Default` as the primary group and `NB-Enterprise` as the fallback; if the primary group returns 429, requests automatically fall back and keep generating.

## Resolutions and Aspect Ratios

### Output resolution

| Resolution | Description | Use case |
| - | - | - |
| 1K | Default | Social media, web |
| 2K | HD | HD displays, print |
| 4K | Ultra HD | Professional design, commercial posters |

<Warning>
  **`512` is not supported**: `"imageSize": "512"` returns 400 `Image size 512 is not supported for this model` (not billed). Change it when migrating from Nano Banana 2.
</Warning>

### Supported aspect ratios (14)

`1:1`, `1:4`, `4:1`, `1:8`, `8:1`, `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9`

**If you omit `aspectRatio`, the model picks a ratio based on the content**: in our tests, scene prompts mostly came out 16:9 and poster prompts 2:3 or 3:4. Pass it explicitly if you need a fixed ratio.

### Measured output sizes (pixels)

| Ratio | 1K | 2K | 4K |
| - | - | - | - |
| **16:9** | 1376×768 | 2752×1536 | 5504×3072 |
| **2:3** | 848×1264 | — | 3392×5056 |
| **3:4** | 896×1200 | — | — |
| **8:1** | 2928×352 | — | — |

<Info>
  Measured on 2026-10-07; "—" means not yet measured. Note that 8:1 at 1K is 2928×352, different from Nano Banana 2's 3072×384, so **don't reuse Nano Banana 2's size table** for front-end layout.
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="Are Nano Banana 2.1 and Nano Banana 2 the same model?">
    No. 2.1 is a separate model ID, `gemini-nano-banana-2.1`, with better quality, text rendering and multi-turn consistency, and a different pricing structure (more expensive input, cheaper image output, more tokens per 4K image). Both models are available on APIYI and don't affect each other.
  </Accordion>

  <Accordion title="What do I change to switch from Nano Banana 2?">
    1. Change the model name from `gemini-3.1-flash-image` (or `-preview`) to `gemini-nano-banana-2.1`
    2. If you use `"imageSize": "512"`, change it to `1K`
    3. If you estimate cost from tokens, re-check it against the "what one image actually costs" table above

    The request format, response structure, and multi-image and multi-turn editing all stay the same.
  </Accordion>

  <Accordion title="Will Nano Banana 2 be shut down?">
    As of October 7, 2026, Google has not announced a shutdown date for `gemini-3.1-flash-image`; it only lists 2.1 as the recommended replacement. Nano Banana 2 on APIYI remains available at the same price. We will notify you in advance if that changes.
  </Accordion>

  <Accordion title="Why is my bill higher than the image tokens suggest?">
    Because 2.1 thinks by default, each image adds roughly 400–1300 thinking and other output tokens, billed at the output rate together with the image. You can see them in `thoughtsTokenCount`. If you mostly generate 4K, per-request billing (\$0.045) is the better deal.
  </Accordion>

  <Accordion title="Is there a concurrency limit?">
    **There is no concurrency limit** — send concurrent requests freely; they don't queue or block each other. What matters is the `timeout`: 4K or peak-time requests can take a while (most 4K requests in our tests took 30–50 seconds, a few over 2 minutes), so **set the client timeout to 360 seconds**. If you hit occasional 429s, add `NB-Enterprise` as your token's fallback group.
  </Accordion>

  <Accordion title="Do output images have a watermark?">
    Every output image carries an invisible SynthID watermark (Google's marker for AI-generated content). It isn't visible and doesn't affect use.
  </Accordion>
</AccordionGroup>

## Related Docs

* [Nano Banana 2 Image Gen/Editing](/en/api-capabilities/nano-banana-2-image/overview) - previous version, supports 512px
* [Nano Banana Pro Image Gen/Editing](/en/api-capabilities/nano-banana-image/overview) - highest quality
* [Nano Banana Dev Guide](/en/api-capabilities/nano-banana-dev-guide) - size control, input image requirements, image URLs
* [Nano Banana Pricing](/en/api-capabilities/nano-banana-pricing)
* [Gemini Image Error Handling](/en/api-capabilities/gemini-image-error-handling)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.