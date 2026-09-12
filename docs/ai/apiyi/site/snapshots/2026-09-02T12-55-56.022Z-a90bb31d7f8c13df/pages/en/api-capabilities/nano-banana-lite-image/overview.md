> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Lite Image Gen/Editing

> Google's fastest, most efficient image model Nano Banana 2 Lite (gemini-3.1-flash-lite-image) - ~4s per image, ~2.7x faster than Nano Banana 2, focused on the 1K canvas + 14 aspect ratios. APIYI token-based averages ~$0.018/call in practice (40% of Google's rate), per-call $0.025.

## Overview

**Nano Banana 2 Lite** (shortened to **Nano Banana Lite** in this section) is a Google image model released on June 30, 2026, with model ID `gemini-3.1-flash-lite-image`. It is the **lightweight, economical version** of Nano Banana 2 (`gemini-3.1-flash-image`), focused on **speed and cost**: \~4s per image, \~**2.7x faster** than Nano Banana 2, making it the **fastest and cheapest** tier of the Nano Banana series.

<Note>
  **🍌 Released June 30, 2026**: Nano Banana 2 Lite is live! \~4s per image, \~2.7x faster than Nano Banana 2, focused on the 1K canvas + 14 aspect ratios, with a built-in SynthID invisible watermark. APIYI brought it online immediately — token-based **averages \~\$0.018/call in practice** (40% of Google's rate), per-call \$0.025 — built for high concurrency, low cost, and rapid iteration.
</Note>

<Warning>
  **Provisional pricing**: The model just launched and the current price is provisional; the final price may be adjusted later. We'll announce any change — please refer to the live price on the platform.
</Warning>

<Info>
  All image APIs are **synchronous** — there is no task ID to poll, and if your client disconnects the result is lost while the request is still billed. Set a generous timeout for this model; see [Image API Essentials & Best Practices](/en/api-capabilities/image-api-best-practices).
</Info>

<CardGroup cols={2}>
  <Card title="Text-to-Image API" icon="wand-sparkles" href="/en/api-capabilities/nano-banana-lite-image/text-to-image">
    Generate images from text prompts. Includes an interactive playground for online testing.
  </Card>

  <Card title="Image Editing API" icon="image" href="/en/api-capabilities/nano-banana-lite-image/image-edit">
    Upload an image + edit instructions to generate new images. Includes an interactive playground.
  </Card>
</CardGroup>

## Let an AI Agent Do the Integration

<Note>
  If you build with Codex / Claude Code / Cursor, copy the prompt below and hand it to your agent. It first fetches the plain-text version of this page (append `.md` to any docs URL), then writes code in your project's own stack — timeout, defensive `parts` parsing, upload compression and the fact that Lite is 1K-only are already baked into the requirements.
</Note>

<Prompt description="Have a coding agent integrate or troubleshoot Nano Banana Lite text-to-image and image editing. Copy and paste into Codex, Claude Code, Cursor and similar tools." icon="bot" actions={["copy"]}>
  Integrate / troubleshoot Nano Banana Lite (`gemini-3.1-flash-lite-image`) text-to-image and image editing in this project.

  Read the docs before you touch code: fetch [https://docs.apiyi.com/en/api-capabilities/nano-banana-lite-image/overview.md](https://docs.apiyi.com/en/api-capabilities/nano-banana-lite-image/overview.md) for the plain-text version of this page. For finer parameter detail, append `.md` to the text-to-image and image-edit pages the same way.

  Requirements:

  1. Timeout: call the Gemini-native format at `POST https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent` and set the client timeout to 300 seconds. This model normally returns an image in about 4 seconds; the 300 seconds is headroom for peak congestion, so **do not shrink the timeout to a few tens of seconds just because it is fast**. The image APIs are synchronous — there is no task ID, so if the client disconnects the result is lost while the request is still billed. Reverse proxies, gateways and serverless execution limits all need widening too.

  2. Parsing the response (**the single easiest thing to get wrong**): the image is base64, under `inlineData.data` inside `candidates[0].content.parts[]`. But `parts` is a **heterogeneous array whose length and order are not guaranteed** — a text part may come first, putting the image at index 1 instead of 0. So **never hardcode `parts[0]` or `parts[1]`**; flipping between the two does not fix it. The correct approach: iterate `parts`, filter for every entry that has `inlineData`, and take the **last** one. Read `mimeType` from the response too rather than assuming `image/png`. Then render the image and offer a save-to-disk action.

  3. Compress before upload: for edits you pass reference images as base64 inside `inlineData` (`image/png` and `image/jpeg` are supported). Compress first — only process files above 1.5MB, scale the long edge down to 2048px keeping the aspect ratio (never upscale a small image), re-encode at quality 0.9 and keep the original format. Keep the combined size under 6MB for multi-image requests. Base64 encoding inflates all of that by roughly a third, so do not send raw phone photos. If one image fails to compress, fall back to the original and carry on. Also note: **a single part may contain either `text` or `inlineData`, never both** — the correct structure is one text part plus N image parts.

  4. Resolution parameters: on Lite, `generationConfig.imageConfig.imageSize` accepts **only `1K`** — sending `2K` or `4K` errors out. If you are porting code over from Nano Banana 2, make sure you strip those values. `aspectRatio` supports the 14 ratios listed on this page; send it explicitly rather than relying on the default. Your UI only needs an aspect-ratio dropdown, not a resolution one.

  5. Error handling: when content moderation blocks a request the HTTP status is still 200, but `candidates[0].content.parts` comes back empty. Check `candidatesTokenCount` for 0 first, then check whether `finishReason` is anything other than `STOP`. Blocks such as `IMAGE_SAFETY` are **not billed**, and retrying the identical input once or twice often succeeds — build that automatic retry in.

  6. Read the key from the `APIYI_API_KEY` environment variable and send it in the `Authorization` header with a `Bearer` prefix. Never hardcode it, never commit it to git.

  7. When you are done, actually run one text-to-image call and one image-edit call, then show me the results and what those two calls cost.
</Prompt>

<Accordion title="What this prompt saves you from">
  | Requirement                    | Pitfall it prevents                                                                                                                                                                                                                                       |
  | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `imageSize` set to `1K` only   | Lite has a single tier; porting from Nano Banana 2 and leaving `2K` / `4K` in place errors out                                                                                                                                                            |
  | Never hardcode a `parts` index | Length and order are not guaranteed, so a fixed index fails intermittently. See [Nano Banana Developer Guide](/en/api-capabilities/nano-banana-dev-guide)                                                                                                 |
  | Timeout still set to 300s      | A 4-second typical latency tempts you into a tiny timeout, which then fires spuriously under peak congestion — and **a disconnected request is still billed**. See [Image API Essentials & Best Practices](/en/api-capabilities/image-api-best-practices) |
  | Compress before upload         | Base64 encoding inflates payloads by roughly a third, so raw phone photos slow every request. See [Image Compression & Output Resolution](/en/api-capabilities/image-compression-resolution)                                                              |
  | Auto-retry on `IMAGE_SAFETY`   | A moderation block returns 200 with no image and is not billed; an identical retry often passes. See [Gemini Image Error Handling](/en/api-capabilities/gemini-image-error-handling)                                                                      |
</Accordion>

## Why APIYI's Nano Banana Lite?

**Nano Banana Pro / 2 is the #1 model by usage volume on APIYI** — stable, reliable, and fast. The Lite tier pushes "fast" and "cheap" to a new level, ideal for high-throughput scenarios. APIYI deeply optimizes the experience across **reliability**, **cost**, and **integration**:

<CardGroup cols={2}>
  <Card title="Official Channel · Same as Gemini" icon="shield-check">
    100% compatible with Google's native Gemini API (`/v1beta/models/.../generateContent`) and the OpenAI SDK pattern — same request body, response fields, and error codes. Zero-code migration.
  </Card>

  <Card title="No Concurrency Limits" icon="infinity">
    Not bound by Google AI Studio's RPM/RPD ceilings. Enterprise-scale batch generation and peak traffic scale linearly without quota interruptions.
  </Card>

  <Card title="Token-based ~\$0.018/call" icon="percent">
    **Token-based averages \~\$0.018/call in practice** (40% of Google's rate: input \$0.10 / output \$12 per 1M tokens), cheaper than per-call \$0.025/image (vs Google \~\$0.034). Stack with [top-up bonuses](/en/faq/recharge-promotions) for even lower cost.
  </Card>

  <Card title="Global Zero-Barrier Access" icon="globe">
    **No overseas server or proxy required** — connect directly to `api.apiyi.com` from mainland data centers, residential networks, or overseas nodes. Stable latency, no cross-border re-architecture.
  </Card>

  <Card title="Full Model Lineup" icon="layers">
    Same series covers [Nano Banana Pro](/en/api-capabilities/nano-banana-image/overview) (ultimate quality), [Nano Banana 2](/en/api-capabilities/nano-banana-2-image/overview) (quality + speed), and Nano Banana 2 Lite (fastest, cheapest) — mix and match per scenario.
  </Card>

  <Card title="Professional Enterprise Support" icon="handshake">
    Our team specializes in production image-generation deployments, with deep experience in model selection, tuning, and integration — end-to-end support from PoC to production.
  </Card>
</CardGroup>

## Core Features

<CardGroup cols={2}>
  <Card title="~4s per Image" icon="gauge">
    \~4s per image, \~2.7x faster than Nano Banana 2 — built for high concurrency and rapid iteration
  </Card>

  <Card title="Low Cost" icon="hand-coins">
    Token-based averages \~\$0.018/call in practice (40% of Google's rate), cheaper than per-call \$0.025 — ideal for cost-sensitive per-image workloads
  </Card>

  <Card title="14 Aspect Ratios" icon="maximize">
    Covers 14 ratios including `1:1`, `4:1`, `1:4`, `16:9`, `9:16` — fits many layouts
  </Card>

  <Card title="SynthID Watermark" icon="shield-check">
    Output carries a SynthID invisible digital watermark — invisible to the naked eye, doesn't affect usage
  </Card>
</CardGroup>

## Version Comparison

| Feature        | **Nano Banana 2 Lite**        | Nano Banana 2            | Nano Banana Pro      |
| -------------- | ----------------------------- | ------------------------ | -------------------- |
| Model ID       | `gemini-3.1-flash-lite-image` | `gemini-3.1-flash-image` | `gemini-3-pro-image` |
| Positioning    | Fastest / cheapest            | Quality + speed          | Ultimate quality     |
| Quality        | ⭐⭐⭐⭐ Excellent                | ⭐⭐⭐⭐⭐ Pro-level          | ⭐⭐⭐⭐⭐ Highest        |
| Speed          | 🚀 \~4s                       | ⚡ Fast                   | 🐢 Slower            |
| Max Resolution | 1K                            | 4K                       | 4K                   |
| Aspect Ratios  | 14                            | 14                       | 10                   |
| APIYI Pricing  | **\$0.025/image**             | \$0.055/image            | \$0.09/image         |

<Tip>
  **Selection Guide**:

  * ⚡ **Best value / fast batch generation** → Nano Banana 2 Lite (\~4s per image, \$0.025 per-call)
  * 🔥 **Need 2K/4K HD or stronger quality** → Nano Banana 2 (Pro-level quality + Flash-tier speed)
  * 🎨 **Ultimate quality** → Nano Banana Pro (highest fidelity)
</Tip>

## Pricing

<Info>
  **Billing Mode Selection**: Nano Banana 2 Lite supports two billing modes, selected via the "Billing model" setting when creating your API token:

  * Select **Pay-as-you-go** or **Pay-as-you-go Priority** → Token-based billing
  * Select **Pay-per-request** or **Pay-per-request Priority** → Per-call billing
  * ⚠️ **Do NOT select Hybrid billing**
</Info>

### Token-based Billing (Recommended · 40％ of Google's Rate)

| Billing Item | Google Official  | APIYI                | Discount |
| ------------ | ---------------- | -------------------- | -------- |
| Input        | \$0.25/M tokens  | **\$0.10/M tokens**  | **40%**  |
| Output       | \$30.00/M tokens | **\$12.00/M tokens** | **40%**  |

<Info>
  **Predictable real-world unit price**: under token-based (per-token) billing, a 1K image **averages \~\$0.018/call in practice** (typical range \~\$0.016–\$0.019, driven by output tokens). That's cheaper than the flat per-call \$0.025/image, with a stable, predictable unit price.
</Info>

### Per-call Billing

| Model                                                | APIYI Pricing     | Google Official | Note                                                  |
| ---------------------------------------------------- | ----------------- | --------------- | ----------------------------------------------------- |
| **Nano Banana 2 Lite** `gemini-3.1-flash-lite-image` | **\$0.025/image** | \~\$0.034/image | Flat rate; may be lowered later but unchanged for now |

<Tip>
  **💰 Which billing mode? Prefer `Pay-as-you-go Priority`.** Token-based (per-token) billing runs \~\$0.018/call in practice — cheaper than per-call \$0.025 with a predictable unit price; and with the token's billing model set to `Pay-as-you-go Priority`, **one token also covers Nano Banana Pro / 2's per-call billing** — run the whole series with one token. The per-call \$0.025/image is a flat rate that **may be lowered later but is unchanged for now** — refer to the live price on the platform. Combined with top-up bonuses, actual costs are even lower.
</Tip>

<Warning>
  The model just launched and the current price is provisional; the final price may be adjusted later (the per-call \$0.025/image may be lowered later). We'll announce any change — please refer to the live price on the platform.
</Warning>

## Group Setup

Nano Banana 2 Lite works on APIYI's default channel — no dedicated group required:

| Group     | Rate | When to use                                             |
| --------- | ---- | ------------------------------------------------------- |
| `Default` | 1.0x | Base lane, matches the price table; recommended default |

**Recommended Billing model: pick `Pay-as-you-go Priority` by default.** Three reasons: ① token-based (per-token) billing runs \~\$0.018/call in practice, cheaper than per-call \$0.025; ② the unit price is stable and predictable; ③ one token **covers Lite / Nano Banana 2 token-based billing AND Nano Banana Pro per-call billing** — run the whole series with one token.

## Supported Resolutions & Aspect Ratios

### Output Resolutions

| Resolution | Description              | Recommended Use                                        |
| ---------- | ------------------------ | ------------------------------------------------------ |
| 1K         | The only tier (no 2K/4K) | Social images, thumbnails, draft previews, web display |

<Info>
  Nano Banana 2 Lite is focused on the **1K canvas** and does not support 2K/4K. For higher resolution or stronger quality, switch to [Nano Banana 2](/en/api-capabilities/nano-banana-2-image/overview) (up to 4K) or [Nano Banana Pro](/en/api-capabilities/nano-banana-image/overview).
</Info>

### Supported Aspect Ratios (14 total)

`1:1`, `1:4`, `4:1`, `1:8`, `8:1`, `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9`

### Output Dimensions per Aspect Ratio (1K, pixels)

In your request, set `aspectRatio` for the ratio and keep `imageSize` at `1K`:

| Aspect Ratio | 1K Output |
| ------------ | --------- |
| **1:1**      | 1024×1024 |
| **1:4**      | 512×2048  |
| **1:8**      | 384×3072  |
| **2:3**      | 848×1264  |
| **3:2**      | 1264×848  |
| **3:4**      | 896×1200  |
| **4:1**      | 2048×512  |
| **4:3**      | 1200×896  |
| **4:5**      | 928×1152  |
| **5:4**      | 1152×928  |
| **8:1**      | 3072×384  |
| **9:16**     | 768×1376  |
| **16:9**     | 1376×768  |
| **21:9**     | 1584×672  |

## FAQ

<AccordionGroup>
  <Accordion title="What's the difference between Nano Banana 2 Lite and Nano Banana 2?">
    Both are based on Google's Gemini 3.1 Flash series; **Lite** is the **lightweight, economical version**:

    * ✅ **Speed**: Lite generates in \~4s, \~2.7x faster than Nano Banana 2
    * ✅ **Price**: Lite token-based averages \~\$0.018/call in practice (40% of Google's rate), per-call \$0.025 — better for volume
    * ⚠️ **Resolution**: Lite supports 1K only; Nano Banana 2 goes up to 4K
    * ⚠️ **Quality ceiling**: for ultimate quality, Nano Banana 2 / Pro are better

    Migrating from Nano Banana 2 just needs a model-name change (note Lite is 1K only): swap `gemini-3.1-flash-image` for `gemini-3.1-flash-lite-image`.
  </Accordion>

  <Accordion title="Should I choose Lite or Nano Banana 2?">
    * **Best value / fast batch generation / 1K is enough** → choose **Lite** (\~4s, \$0.025 per-call)
    * **Need 2K/4K HD, or higher quality** → choose **Nano Banana 2** (up to 4K, Pro-level quality)

    The code is identical between the two — only the model name differs, so you can switch and test anytime.
  </Accordion>

  <Accordion title="How long does it take to generate an image?">
    Nano Banana 2 Lite is built for speed — **\~4s at 1K resolution**. Still, set a longer client timeout (e.g. 300 seconds) to handle occasional delays and peak congestion.
  </Accordion>

  <Accordion title="Is there a concurrency limit?">
    **The API has no concurrency limit and does not process serially.** You can safely fire concurrent requests yourself — requests don't queue or block each other. Unlike Google AI Studio, the APIYI channel has no hard RPM/RPD limits, so enterprise batch generation and peak traffic scale linearly.

    What actually matters is the `timeout` — though Lite is fast, a single request can still slow down during peak congestion, so set your client timeout to 300 seconds.
  </Accordion>

  <Accordion title="What input image formats are supported?">
    For image editing, `image/png` and `image/jpeg` are supported via base64 encoding. See the [Image Editing API Reference](/en/api-capabilities/nano-banana-lite-image/image-edit).
  </Accordion>

  <Accordion title="Do output images have watermarks?">
    All output images carry SynthID invisible digital watermarks (Google's AI-generated content identification technology) — invisible to the naked eye and doesn't affect usage.
  </Accordion>
</AccordionGroup>

## Related Documentation

* [Nano Banana 2 Image Generation](/en/api-capabilities/nano-banana-2-image/overview) - Quality + speed tier, up to 4K
* [Nano Banana Pro Image Generation](/en/api-capabilities/nano-banana-image/overview) - Ultimate-quality flagship
* [Image Generation Comparison Testing](https://imagen.apiyi.com/)
* [API Usage Manual](/en/api-manual)

<Info>
  Nano Banana 2 Lite just launched. Features and pricing may be adjusted. Please follow documentation updates for the latest information.
</Info>
