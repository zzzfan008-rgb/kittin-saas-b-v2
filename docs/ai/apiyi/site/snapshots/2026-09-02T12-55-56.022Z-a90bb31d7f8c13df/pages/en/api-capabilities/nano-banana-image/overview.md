> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Pro Image Generation

> Nano Banana Pro (Gemini 3 Pro) Image Generation API - 4K Support, Advanced Text Rendering. Custom resolution, 10 aspect ratios, 10-second quick generation, 70-83% off official pricing.

<Note>
  **🔥 Latest Release**: Google launched **Nano Banana 2** (`gemini-3.1-flash-image-preview`) on February 26, 2026 — Pro-level quality at Flash-tier speed, pay-as-you-go as low as \$0.025/image! [View Nano Banana 2 Documentation](/en/api-capabilities/nano-banana-2-image/overview)
</Note>

<Note>
  **🆕 Update May 29, 2026 (`-preview` dropped)**: Google updated its official docs and released the stable model name **`gemini-3-pro-image`** (without `-preview`). APIYI already supports it.

  * **The old name still works**: `gemini-3-pro-image-preview` keeps working as usual, **pricing unchanged**, no code changes needed.
  * **Both names work**: use either the new `gemini-3-pro-image` or the original `-preview` name.

  Heads-up: Google hasn't clarified whether the stable version differs from the preview in output quality, safety filtering, or other behavior. We welcome you to test and share feedback.
</Note>

<Info>
  All image APIs are **synchronous** — there is no task ID to poll, and if your client disconnects the result is lost while the request is still billed. Set a generous timeout for this model; see [Image API Essentials & Best Practices](/en/api-capabilities/image-api-best-practices).
</Info>

**Nano Banana Pro** (codename) is Google's image generation model series, currently with the following available versions:

### Latest Versions

* **Nano Banana 2**: `gemini-3.1-flash-image-preview` (🔥 Launched February 26, 2026) — [View Details](/en/api-capabilities/nano-banana-2-image/overview)
* **Nano Banana Pro**: `gemini-3-pro-image-preview` (Launched November 20, 2025)

### Previous Versions

* **Official Release**: `gemini-2.5-flash-image` (Stable version, supports 10 aspect ratios)
* **Preview Version**: `gemini-2.5-flash-image-preview` (⚠️ Discontinued on October 30, 2025)

<Card>
  **Core Advantages**

  * 🔥 **Nano Banana Pro New Features**:
    * 🎯 **4K High-Resolution Support**: Supports 1K, 2K, 4K three resolutions, up to 4096×4096
    * 📝 **Text Rendering King**: Clear and readable text in images, perfect for posters and ads
    * ✨ **Local Editing**: Supports camera angle, focus, color grading, scene lighting adjustments
    * 🧠 **Smart Reasoning**: Based on Gemini 3 Pro, better understanding of complex prompts

  * 🚀 **Universal Advantages**:
    * ⚡ **Generation Speed**: Nano Banana Pro \~20 seconds, previous version \~10 seconds
    * 💰 **Affordable Pricing**: Combined with top-up bonuses, extremely cost-effective
    * 🔄 **Full Compatibility**: Fully compatible with Google official Gemini API format
    * 🎨 **Google Technology**: Based on Google's latest and strongest image generation/editing technology
</Card>

## Interactive API Testing

<CardGroup cols={2}>
  <Card title="Text-to-Image API" icon="wand-sparkles" href="/en/api-capabilities/nano-banana-image/text-to-image">
    Enter a text prompt to generate images, with interactive Playground for online testing.
  </Card>

  <Card title="Image Editing API" icon="image" href="/en/api-capabilities/nano-banana-image/image-edit">
    Upload an image + edit instructions to generate edited images, with interactive Playground for online testing.
  </Card>
</CardGroup>

## Let an AI Agent Do the Integration

<Note>
  If you build with Codex / Claude Code / Cursor, copy the prompt below and hand it to your agent. It first fetches the plain-text version of this page (append `.md` to any docs URL), then writes code in your project's own stack — timeout, defensive `parts` parsing, upload compression and the resolution parameters are already baked into the requirements.
</Note>

<Prompt description="Have a coding agent integrate or troubleshoot Nano Banana Pro text-to-image and image editing. Copy and paste into Codex, Claude Code, Cursor and similar tools." icon="bot" actions={["copy"]}>
  Integrate / troubleshoot Nano Banana Pro (`gemini-3-pro-image`) text-to-image and image editing in this project.

  Read the docs before you touch code: fetch [https://docs.apiyi.com/en/api-capabilities/nano-banana-image/overview.md](https://docs.apiyi.com/en/api-capabilities/nano-banana-image/overview.md) for the plain-text version of this page. For finer parameter detail, append `.md` to the text-to-image and image-edit pages the same way.

  Requirements:

  1. Timeout: call the Gemini-native format at `POST https://api.apiyi.com/v1beta/models/gemini-3-pro-image:generateContent`. Set the client timeout per resolution tier: 300 seconds for 1K and 2K, and **600 seconds for 4K**. The image APIs are synchronous — there is no task ID, so if the client disconnects the result is lost while the request is still billed. Reverse proxies, gateways and serverless execution limits all need widening too: any layer shorter than the generation time will cut the request off. On Node, note that undici has three independent timeout settings that the SDK `timeout` option does not cover.

  2. Parsing the response (**the single easiest thing to get wrong**): the image is base64, under `inlineData.data` inside `candidates[0].content.parts[]`. But `parts` is a **heterogeneous array whose length and order are not guaranteed** — a text part may come first, putting the image at index 1 instead of 0. So **never hardcode `parts[0]` or `parts[1]`**; flipping between the two does not fix it. The correct approach: iterate `parts`, filter for every entry that has `inlineData`, and take the **last** one (complex tasks return several intermediate drafts, and only the last is final). Read `mimeType` from the response too rather than assuming `image/png`. Then render the image and offer a save-to-disk action.

  3. Compress before upload: for edits you pass reference images as base64 inside `inlineData`. Compress first — only process files above 1.5MB, scale the long edge down to 2048px keeping the aspect ratio (never upscale a small image), re-encode at quality 0.9 and keep the original format. Keep the combined size under 6MB for multi-image requests. The hard limits are 7MB per image, at most 14 images per request, and under 100MB total per upload; base64 encoding then inflates all of that by roughly a third, so aim to keep each image under 5MB for headroom. If one image fails to compress, fall back to the original and carry on. Also note: **a single part may contain either `text` or `inlineData`, never both** — the correct structure is one text part plus N image parts.

  4. Resolution parameters: explicitly send `generationConfig.imageConfig.imageSize` (`1K` / `2K` / `4K`, default `1K`) and `aspectRatio` (this page lists the 10 legal ratios) instead of relying on defaults. Expose both as dropdowns in your UI. If the user picks 4K, raise the timeout to 600 seconds as well. This model does **not** support `thinkingConfig`, nor Google Search grounding via `tools`, so do not send either.

  5. Error handling: when content moderation blocks a request the HTTP status is still 200, but `candidates[0].content.parts` comes back empty. Check `candidatesTokenCount` for 0 first, then check whether `finishReason` is anything other than `STOP`. Blocks such as `IMAGE_SAFETY` are **not billed**, and retrying the identical input once or twice often succeeds — build that automatic retry in.

  6. Read the key from the `APIYI_API_KEY` environment variable and send it in the `Authorization` header with a `Bearer` prefix. Never hardcode it, never commit it to git.

  7. When you are done, actually run one text-to-image call and one image-edit call, then show me the results and what those two calls cost.
</Prompt>

<Accordion title="What this prompt saves you from">
  | Requirement                    | Pitfall it prevents                                                                                                                                                                                                  |
  | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | Never hardcode a `parts` index | Length and order are not guaranteed, so a fixed index fails intermittently — and switching between index 0 and 1 does not fix it. See [Nano Banana Developer Guide](/en/api-capabilities/nano-banana-dev-guide)      |
  | Take the last image part       | Complex edit tasks return several intermediate drafts; only the last one is final                                                                                                                                    |
  | Timeout tiered by resolution   | 4K under a 300s timeout times out spuriously — and **a disconnected request is still billed**. See [Image API Essentials & Best Practices](/en/api-capabilities/image-api-best-practices)                            |
  | Compress before upload         | The hard cap is 7MB per image and base64 inflates that by roughly a third, so raw phone photos readily trigger a 500. See [Image Compression & Output Resolution](/en/api-capabilities/image-compression-resolution) |
  | Auto-retry on `IMAGE_SAFETY`   | A moderation block returns 200 with no image and is not billed; an identical retry often passes. See [Gemini Image Error Handling](/en/api-capabilities/gemini-image-error-handling)                                 |
</Accordion>

## Why APIYI's Nano Banana Pro?

**Nano Banana Pro / 2 is the #1 model by usage volume on APIYI** — stable, reliable, and fast. If you want to work with a professional team, APIYI is the right choice.

Google's flagship with strict content-safety controls, optimized by APIYI across **reliability**, **cost**, and **integration**:

<CardGroup cols={2}>
  <Card title="Official Channel · Same as Gemini" icon="shield-check">
    100% compatible with Google's native Gemini API (`/v1beta/models/.../generateContent`) and the OpenAI SDK pattern — same request body, response fields, and error codes. Zero-code migration.
  </Card>

  <Card title="No Concurrency Limits" icon="infinity">
    Not bound by Google AI Studio's RPM/RPD ceilings. Enterprise-scale batch generation and peak traffic scale linearly without quota interruptions.
  </Card>

  <Card title="31-38% of Google's List Price" icon="percent">
    \$0.09/image per-call (vs Google 4K \$0.24). Stack with [top-up bonuses](/en/faq/recharge-promotions) for as low as 31.25% of list — 4K savings up to 68.75%.
  </Card>

  <Card title="Global Zero-Barrier Access" icon="globe">
    **No overseas server or proxy required** — connect directly to `api.apiyi.com` from mainland data centers, residential networks, or overseas nodes. Stable latency, no cross-border re-architecture.
  </Card>

  <Card title="Full Model Lineup" icon="layers">
    Same series covers [Nano Banana 2](/en/api-capabilities/nano-banana-2-image/overview) (best value + Flash speed), Nano Banana Pro (ultimate quality), and the legacy Nano Banana — mix and match per scenario.
  </Card>

  <Card title="Professional Enterprise Support" icon="handshake">
    Our team specializes in production image-generation deployments, with deep experience in model selection, tuning, and integration — end-to-end support from PoC to production.
  </Card>
</CardGroup>

## Calling Method

Use Google's native Gemini API format:

```
POST /v1beta/models/gemini-3-pro-image-preview:generateContent
```

<Tip>
  * ✅ Supports 4K high-resolution (1K / 2K / 4K)
  * ✅ 10 aspect ratios to choose from
  * ✅ Industry-best text rendering
  * ✅ Advanced local editing
  * 📖 Fully compatible with Google official API format, refer to `ai.google.dev/gemini-api/docs/image-generation`
</Tip>

### Unsupported Features

<Warning>
  The following Google official features are **not supported** via APIYI and require separate billing:

  * **Grounding with Google Search**: Real-time search info via `tools: [{"google_search": {}}]`
  * **thinkingConfig** (Thinking mode): Only supported on Nano Banana 2, not on Nano Banana Pro
  * **Image Search Grounding**: Nano Banana 2 exclusive feature

  All other image generation and editing capabilities are fully supported.
</Warning>

## Price Comparison

| Model                       | Pricing                              | Advantage                                   |
| --------------------------- | ------------------------------------ | ------------------------------------------- |
| **Nano Banana Pro** (4K)    | \$0.09/image (\~¥0.52 with bonuses)  | 🔥 4K support, \~38% of official price      |
| **Nano Banana Pro** (1K-2K) | \$0.09/image (\~¥0.52 with bonuses)  | 🔥 High-res output, \~67% of official price |
| **Nano Banana**             | \$0.025/image (\~¥0.15 with bonuses) | ⭐ Fast generation, 52% of official price    |
| gpt-image-1                 | Higher                               | -                                           |
| flux-kontext-pro            | \$0.035/image                        | On par                                      |

<Tip>
  **Cost-effectiveness Recommendation**:

  * **Nano Banana Pro**: 4K support, strongest text rendering, pricing at \~38-67% of official
  * **NanoBananaEnterprise**: Enterprise HA channel available at 1.4x rate (\$0.126/image) for high-availability needs
  * **Nano Banana**: Fast generation (\~10 seconds), 52% of official price, suitable for regular high-quality image generation
</Tip>

## Group Setup

Nano Banana Pro ships with two groups on APIYI. Switch in dashboard → **Token Settings**:

| Group                  | Rate | When to use                                                                                                               |
| ---------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------- |
| `Default`              | 1.0x | Base lane, per-call \$0.09/image; recommended default                                                                     |
| `NanoBananaEnterprise` | 1.4x | Fallback lane, per-call \$0.126/image — manually switch when the default is tight or timeouts spike, capacity-prioritized |

**Why 1.4x?** Even at 1.4x, the price is still around 50% of Google's list — far below official pricing. This is a fallback lane for higher-concurrency workloads and unexpected upstream risk-control events, providing high-availability guarantees for enterprise customers. When the default group is tight, switch your Token to `NanoBananaEnterprise` to ride out the spike.

**Recommended Billing model**: pick `Pay-as-you-go Priority` — covers Nano Banana Pro's per-call billing AND Nano Banana 2's token-based billing, **one Token for the whole series**.

<Frame caption="Token settings: Billing model = Pay-as-you-go Priority, primary group = Default, fallback group = NanoBananaEnterprise (1.4x)">
  <img src="https://mintcdn.com/apiyillc/EyWjOyg5fLaMGReJ/images/nano-banana-enterprise-token-setup-20260506.png?fit=max&auto=format&n=EyWjOyg5fLaMGReJ&q=85&s=cf85cd8ddaaa541ebbd970a52a98c68f" alt="Token creation UI: Billing model 'Pay-as-you-go Priority' covers NB Pro per-call + NB2 token-based; primary group Default + fallback group NanoBananaEnterprise (1.4x lane)" width="1270" height="1052" data-path="images/nano-banana-enterprise-token-setup-20260506.png" />
</Frame>

<Tip>
  **Going further**: if your Token also covers other image models (e.g. GPT-image-2), keep the more stable `Default` as the primary group and put `NanoBananaEnterprise` in the fallback slot — 429s on the primary will auto-failover to the enterprise group without a token swap.
</Tip>

## Compatibility Notes

If you've previously used the following models, simply replace the model name:

### Upgrade to Latest Version

* Any old version → `gemini-3-pro-image-preview` (🔥 Recommended, Nano Banana Pro)
  * Supports 4K high-resolution output
  * Strongest text rendering capabilities
  * Local editing features

### Use Stable Version

* `gpt-4o-image` → `gemini-2.5-flash-image`
* `sora_image` → `gemini-2.5-flash-image`
* Old Nano Banana → `gemini-2.5-flash-image`

Keep other parameters unchanged for seamless switching.

## Supported Resolutions & Aspect Ratios

### Output Resolutions

Nano Banana Pro supports three resolution tiers — 1K, 2K, 4K (the 512px tier is exclusive to Nano Banana 2):

| Resolution | Description | Recommended Use                         |
| ---------- | ----------- | --------------------------------------- |
| 1K         | Default     | Social media, web display               |
| 2K         | HD          | HD displays, print materials            |
| 4K         | Ultra HD    | Professional design, commercial posters |

### Output Dimensions per Aspect Ratio (pixels)

The table below lists Nano Banana Pro's actual output dimensions for all 10 aspect ratios across the 1K / 2K / 4K resolution tiers (source: Google official docs). In your request, set `aspect_ratio` for the ratio and `image_size` (or `resolution`) for the tier:

| Aspect Ratio | 1K        | 2K        | 4K        |
| ------------ | --------- | --------- | --------- |
| **1:1**      | 1024×1024 | 2048×2048 | 4096×4096 |
| **2:3**      | 848×1264  | 1696×2528 | 3392×5056 |
| **3:2**      | 1264×848  | 2528×1696 | 5056×3392 |
| **3:4**      | 896×1200  | 1792×2400 | 3584×4800 |
| **4:3**      | 1200×896  | 2400×1792 | 4800×3584 |
| **4:5**      | 928×1152  | 1856×2304 | 3712×4608 |
| **5:4**      | 1152×928  | 2304×1856 | 4608×3712 |
| **9:16**     | 768×1376  | 1536×2752 | 3072×5504 |
| **16:9**     | 1376×768  | 2752×1536 | 5504×3072 |
| **21:9**     | 1584×672  | 3168×1344 | 6336×2688 |

<Info>
  If you need `1:4`, `4:1`, `1:8`, `8:1` ultra-tall/ultra-wide ratios or the 512px low-resolution tier, use [Nano Banana 2](/en/api-capabilities/nano-banana-2-image/overview) (14 aspect ratios + 512px).
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="Should I choose Nano Banana 2 or Pro?">
    **For best value** choose **Nano Banana 2** (`gemini-3.1-flash-image-preview`):

    * Pro-level quality + Flash-tier speed
    * Pay-as-you-go as low as \$0.025/image
    * 14 aspect ratios (4 more than Pro)
    * Exclusive: thinking mode, Image Search Grounding

    **For ultimate quality** choose **Nano Banana Pro** (`gemini-3-pro-image-preview`):

    * Highest fidelity
    * \$0.09/request

    See [Nano Banana 2 docs](/en/api-capabilities/nano-banana-2-image/overview) for details.
  </Accordion>

  <Accordion title="Should I choose Pro version or legacy version?">
    **Recommended for new projects: Nano Banana Pro** (`gemini-3-pro-image-preview`)

    ✅ **Pro Version Advantages**:

    * Supports 4K ultra-high resolution (1K, 2K, 4K)
    * Industry-leading text rendering quality
    * Advanced local editing features
    * Only \~38-67% of official pricing

    ⚡ **Legacy Version** (`gemini-2.5-flash-image`) suitable for:

    * Budget-sensitive scenarios (\~\$0.025/image vs \$0.09/image)
    * Need fast generation (10s vs 20s)
    * Existing project migration
  </Accordion>

  <Accordion title="How to switch from other image models to Nano Banana?">
    Simply change the model name from `gpt-4o-image` or `sora_image` to `gemini-3-pro-image-preview` (recommended Pro) or `gemini-2.5-flash-image` (legacy), keeping other parameters unchanged.
  </Accordion>

  <Accordion title="What format are generated images?">
    The model returns base64-encoded image data, typically in PNG or JPEG format. Code automatically detects format and saves to corresponding file type.
  </Accordion>

  <Accordion title="Does it support image editing features?">
    Yes, Nano Banana Pro supports both image generation and editing. See [Image Editing API Reference](/en/api-capabilities/nano-banana-image/image-edit).
  </Accordion>

  <Accordion title="Why do I get connection reset by peer / write_response_body_failed (500)?">
    The full error looks like:

    ```text theme={null}
    [&{{write tcp ip:port->ip:port: write: connection reset by peer Unknown error shell_api_error  write_response_body_failed} 500 }]
    ```

    This is **usually caused by oversized image uploads — the request body gets too large and the connection collapses**. Follow these best practices:

    * **Limit the image count**: stay within the official rules (max 14 images per prompt) — don't pile on reference images.
    * **Limit per-image size**: keep each image under 5MB — the official per-image cap is 7MB, and base64 encoding inflates size by roughly 1/3, so leave headroom.
    * **Compress on the frontend before uploading**: compress images on the frontend (or a server-side relay) before sending them to the API — common practice is capping the longest edge, converting to JPEG/WebP, and tuning the quality parameter.
    * **Switch to URL input**: the Gemini native format supports passing an image URL via `fileData.fileUri`, sidestepping oversized base64 request bodies entirely — see the [Nano Banana Dev Guide](/en/api-capabilities/nano-banana-dev-guide).
  </Accordion>
</AccordionGroup>

## Related Documentation

* [Nano Banana 2 Image Generation](/en/api-capabilities/nano-banana-2-image/overview)
* [Nano Banana Pricing](/en/api-capabilities/nano-banana-pricing)
* [Other Image Generation Models](/en/api-capabilities/gpt-image-1)
* [API Usage Manual](/en/api-manual)
