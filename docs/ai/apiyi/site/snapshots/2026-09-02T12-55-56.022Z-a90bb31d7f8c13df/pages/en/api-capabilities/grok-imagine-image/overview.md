> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok Imagine 2 Image Gen & Editing

> Complete guide to Grok Imagine 2, xAI's latest-generation image model (grok-imagine-image / grok-imagine-image-quality) on APIYI — 5 aspect ratios, 1K/2K tiers, up to 10 images per call, true reference-image editing, flat $0.02 / $0.045 per image regardless of resolution — about 64% of list price at 2K.

## Overview

**Grok Imagine 2** is xAI's **latest, second-generation** image model — a full generational step up from the first release in both parameter control and editing: aspect ratio and resolution genuinely take effect, the 2K tier is available, a single call returns up to 10 images, and reference editing truly preserves the source image.

APIYI offers two variants: `grok-imagine-image` (standard) and `grok-imagine-image-quality` (high quality). Both share the same endpoints and parameters — they differ only in output fidelity and price.

<Note>
  **Highlights**: flat per-request pricing that **ignores resolution** (xAI lists the quality tier at \$0.07 for 2K; we charge \$0.045 either way, roughly **64% of list**), 5 aspect ratios x 2 resolution tiers that **genuinely take effect**, up to 10 images per call, and high-fidelity reference editing that preserves art style, composition, palette and subject identity. A 1K image takes about 9 seconds.
</Note>

<Info>
  **The model IDs do not contain a `2`.** The product is named Grok Imagine 2, but the model names you call are **`grok-imagine-image`** and **`grok-imagine-image-quality`** — do not write `grok-imagine-2-image`, which returns 503 because no such model exists.
</Info>

<Warning>
  **📌 Read this first**: **reference images only work with the editing endpoint `/v1/images/edits` — never with text-to-image.**

  Passing `image` / `image_url` / `images` to `/v1/images/generations` returns **200 with a perfectly normal image**, but the reference is **silently discarded** and you are still billed — with no error of any kind. See [Endpoints](#endpoints) below.
</Warning>

<Info>
  All image APIs are **synchronous**: there is no async task ID, so if the client disconnects the result is lost while the request is still billed. Set a generous timeout — see [Image API Best Practices](/en/api-capabilities/image-api-best-practices).
</Info>

<CardGroup cols={2}>
  <Card title="Text-to-Image API" icon="wand-sparkles" href="/en/api-capabilities/grok-imagine-image/text-to-image">
    Generate images from a text prompt, with an interactive Playground for live testing.
  </Card>

  <Card title="Image Editing API" icon="image" href="/en/api-capabilities/grok-imagine-image/image-edit">
    Upload reference images plus an instruction, with 1-4 image fusion and a Playground.
  </Card>
</CardGroup>

## Let an AI Agent Do the Integration

<Note>
  If you build with Codex / Claude Code / Cursor, copy the prompt below and hand it to your agent. It first fetches the plain-text version of this page (append `.md` to any docs URL), then writes code in your project's own stack — timeout, re-hosting URL results immediately, **the endpoint that silently discards reference images while still billing you**, and the fact that `size` does nothing are already baked into the requirements.
</Note>

<Prompt description="Have a coding agent integrate or troubleshoot Grok Imagine 2 text-to-image and image editing. Copy and paste into Codex, Claude Code, Cursor and similar tools." icon="bot" actions={["copy"]}>
  Integrate / troubleshoot Grok Imagine 2 text-to-image and image editing in this project.

  Read the docs before you touch code: fetch [https://docs.apiyi.com/en/api-capabilities/grok-imagine-image/overview.md](https://docs.apiyi.com/en/api-capabilities/grok-imagine-image/overview.md) for the plain-text version of this page. For finer parameter detail, append `.md` to the text-to-image and image-edit pages the same way.

  Requirements:

  1. Model names: the standard tier is `grok-imagine-image` and the high-fidelity tier is `grok-imagine-image-quality`. **Note that the model ID contains no digit 2** — writing `grok-imagine-2-image` returns 503 because no such model exists.

  2. Timeout: raise the client timeout to 360 seconds. Measured latency is around 9 seconds at 1K and 15 seconds at 2K, but a 60-second timeout produces plenty of spurious failures, and those requests are still billed. The image APIs are synchronous — there is no task ID, so if the client disconnects the result is lost. Reverse proxies, gateways and serverless execution limits all need widening too.

  3. Choosing the endpoint (**the easiest thing to get wrong on this model**): text-to-image goes to `/v1/images/generations` as JSON, while **any request carrying a reference image must go to `/v1/images/edits` as `multipart/form-data`**. Both directions have traps. Passing a reference image to `/v1/images/generations` **returns 200, silently discards the reference, generates an unrelated text-only image, and bills you for it**. Sending JSON to `/v1/images/edits`, conversely, always returns 400. The file field must be named `image` or `image[]`; `images` or `image_file` returns 415. The edit endpoint takes 1 to 4 reference images, and sending 5 returns 400.

  4. Handling the response: the default is `url`, and you can pass `response_format` set to `b64_json` for plain base64 instead (with no `data:` prefix); each entry in `data[]` carries only one of the two. If you take the URL, download and re-host it in your own object storage immediately. Note also that this model returns **no `revised_prompt`**, that `created` is always 0, and that `usage` is a placeholder (`prompt_tokens` is always 1000 times n) — **do not use it for cost accounting**; rely on the console billing records instead.

  5. Size parameters: use `aspect_ratio` (`1:1` / `16:9` / `9:16` / `4:3` / `3:4`, default `1:1`) together with `resolution` (`1k` / `2k`, **lowercase**, default `1k`). **Do not send `size`** — it is silently ignored, so you think you asked for 1536 by 1024 and actually receive a 1024 by 1024 square. `quality` and `style` are silently ignored the same way; for higher fidelity switch to the `-quality` model name rather than sending a parameter. Out-of-enum values for `aspect_ratio` or `resolution` silently fall back to the defaults, and `resolution` set to `4k` specifically returns 503 — that is a parameter error, not an outage. One more thing: **on the edit endpoint neither `resolution` nor `aspect_ratio` has any effect**; the output frame always follows the dimensions of the first reference image.

  6. Compress before upload: compress each reference image first — only process files above 1.5MB, scale the long edge down to 2048px keeping the aspect ratio (never upscale a small image), re-encode at quality 0.9 and keep the original format. Keep the combined size under 6MB for multi-image requests. If one image fails to compress, fall back to the original and carry on — never abort the whole request over a compression failure.

  7. Error handling: `400 invalid_request` covers both malformed parameters and moderation blocks, and the response body does not distinguish them, so investigate both angles. `n` ranges from 1 to 10; 0 is treated as 1, and 11 or above returns 400. `seed` is accepted but has no effect, so results are not reproducible. This model does not support `mask`.

  8. Read the key from the `APIYI_API_KEY` environment variable and use [https://api.apiyi.com/v1](https://api.apiyi.com/v1) as the base URL. Never hardcode it, never commit it to git.

  9. When you are done, actually run one text-to-image call and one image-edit call, then show me the results and what those two calls cost.
</Prompt>

<Accordion title="What this prompt saves you from">
  | Requirement                                 | Pitfall it prevents                                                                                                                                                                                                                |
  | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | Reference images only to the edit endpoint  | Sending them to `/v1/images/generations` returns 200, silently drops the reference and still bills you — the costliest trap here, precisely because nothing errors                                                                 |
  | Never send `size`                           | It is silently ignored, so you believe you set a size but receive a 1024 by 1024 square                                                                                                                                            |
  | Model ID without the digit 2                | `grok-imagine-2-image` returns 503, which looks like an outage but is just a wrong name                                                                                                                                            |
  | Higher fidelity is a model, not a parameter | This model has no `quality` parameter; sending one is silently ignored                                                                                                                                                             |
  | Do not reconcile costs from `usage`         | It is a placeholder with `prompt_tokens` fixed at 1000 times n; use the console billing records                                                                                                                                    |
  | Timeout still set to 360s                   | A latency of some 15 seconds tempts you into a tiny timeout, which then fires at peak — and **a disconnected request is still billed**. See [Image API Essentials & Best Practices](/en/api-capabilities/image-api-best-practices) |
</Accordion>

## Why Grok Imagine 2 on APIYI

<CardGroup cols={2}>
  <Card title="OpenAI-compatible format" icon="shield-check">
    Standard `/v1/images/generations` and `/v1/images/edits` endpoints. Request bodies and response fields match the OpenAI Images API, so the official OpenAI SDK works directly — zero migration effort.
  </Card>

  <Card title="No concurrency caps" icon="infinity">
    No RPM/RPD hard limits. **Measured comfortably at 100 RPM** with ample channel capacity, so batch workloads scale linearly — no quota requests or self-imposed throttling needed.
  </Card>

  <Card title="Flat pricing, predictable cost" icon="percent">
    Fixed price per image, **independent of resolution**: xAI lists the quality tier at \$0.05 for 1K and \$0.07 for 2K, while we charge a flat \$0.045 — **about 64% of list at 2K**. Budget to the exact image count, and stack [recharge bonuses](/en/faq/recharge-promotions) to go lower.
  </Card>

  <Card title="Global access, no barriers" icon="globe">
    **No overseas server or proxy required.** Mainland data centers, home broadband and overseas nodes all connect directly to `api.apiyi.com`.
  </Card>

  <Card title="Full model ecosystem" icon="layers">
    Also available: [Nano Banana 2](/en/api-capabilities/nano-banana-2-image/overview), [GPT-Image-2](/en/api-capabilities/gpt-image-2/overview), [Seedream](/en/api-capabilities/seedream-image/overview), [FLUX](/en/api-capabilities/flux/overview), plus the [Grok text models](/en/api-capabilities/grok/overview).
  </Card>

  <Card title="Professional support" icon="handshake">
    Our team works deeply with image generation workloads and can support enterprise customers from PoC through production rollout.
  </Card>
</CardGroup>

## Key Features

<CardGroup cols={2}>
  <Card title="Two resolution tiers" icon="expand">
    `1k` at roughly 1 megapixel, `2k` at 4.2-4.5 megapixels (2816x1584 at 16:9) — **same price, so 2K is the better deal**
  </Card>

  <Card title="5 aspect ratios" icon="maximize">
    `1:1` / `16:9` / `9:16` / `4:3` / `3:4`, with measured pixel dimensions matching exactly
  </Card>

  <Card title="Up to 10 per call" icon="images">
    `n` accepts 1-10, returning multiple images in one request — ideal for batch selection
  </Card>

  <Card title="Fast generation" icon="zap">
    About 9s at 1K and 15-17s at 2K, with stable latency under load — 100 RPM runs comfortably
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="True reference editing" icon="wand">
    Changes only what you ask for — art style, composition, palette and subject identity stay intact
  </Card>

  <Card title="Multi-image fusion" icon="layers-2">
    The editing endpoint accepts 1-4 references — each one adds a subject in testing, and the first sets output dimensions
  </Card>

  <Card title="Two response formats" icon="braces">
    `url` direct links or `b64_json` raw base64, supported on both endpoints
  </Card>

  <Card title="OpenAI SDK ready" icon="plug">
    `client.images.generate()` and `client.images.edit()` work out of the box — no manual HTTP plumbing
  </Card>
</CardGroup>

## Pricing

| Model                            | Resolution  | APIYI price         | xAI list | Discount          |
| -------------------------------- | ----------- | ------------------- | -------- | ----------------- |
| **`grok-imagine-image`**         | `1k` / `2k` | **\$0.02 / image**  | \$0.02   | Matches list      |
| **`grok-imagine-image-quality`** | `1k`        | **\$0.045 / image** | \$0.05   | **90% of list**   |
| **`grok-imagine-image-quality`** | `2k`        | **\$0.045 / image** | \$0.07   | **\~64% of list** |

<Info>
  **Billing notes**

  * **We ignore resolution; xAI does not.** xAI lists the quality tier at \$0.05 for 1K and \$0.07 for 2K, while APIYI charges a flat **\$0.045** — so **the higher the resolution, the bigger the saving**, reaching about **64% of list at 2K**.
  * **Per image**: `n=4` bills as 4 images, regardless of prompt length.
  * **Editing costs the same** as text-to-image — `/v1/images/edits` carries no premium.
  * **The `usage` block cannot be used for reconciliation**: `prompt_tokens` is always `1000 x n`, a placeholder. Use the Console billing records instead.
</Info>

### Effective cost with top-up bonuses

These discounts **stack with the [tiered top-up bonus](/en/faq/recharge-promotions)** (calculated per single top-up, not cumulatively). Taking the quality tier at 2K:

| Top-up tier                     | Credit multiplier | Effective per image | vs xAI's \$0.07   |
| ------------------------------- | ----------------- | ------------------- | ----------------- |
| No promotion (list price)       | 1.0x              | \$0.045             | **64% of list**   |
| Single top-up of \$100 (+10%)   | 1.1x              | ≈ \$0.041           | **\~58% of list** |
| Single top-up of \$1,000 (+15%) | 1.15x             | ≈ \$0.039           | **\~56% of list** |
| Single top-up of \$3,000 (+20%) | 1.2x              | **\$0.0375**        | **\~54% of list** |

<Tip>
  **In the common case (the \$100 tier), a 2K image lands at roughly 58% of xAI's list price, dropping to about 54% at the maximum bonus.** The standard `grok-imagine-image` stacks the same way — its \$0.02 list price becomes roughly \$0.0167 per image at the 20% bonus.
</Tip>

## Group Setup

Grok Imagine 2 runs in the **`Default` Group (1.0x rate)**, matching the pricing table above. **No Group switching is required.**

**Recommended Token billing model**: `Pay-as-you-go Priority`. This family is billed per request, and both Pay-as-you-go Priority and Pay-per-request route correctly — choosing Pay-as-you-go Priority lets a single Token also cover token-billed models elsewhere on the platform.

<Tip>
  If your Token already covers other image models, simply keep `Default` as the primary Group. This family needs no dedicated Group or extra configuration.
</Tip>

## Technical Specifications

| Item                       | Specification                                                             |
| -------------------------- | ------------------------------------------------------------------------- |
| Model IDs                  | `grok-imagine-image`, `grok-imagine-image-quality`                        |
| Aspect ratios              | 5: `1:1` / `16:9` / `9:16` / `4:3` / `3:4`                                |
| Resolution tiers           | `1k` (\~0.9-1.05 MP), `2k` (\~4.2-4.5 MP)                                 |
| Output format              | **JPEG at 1K (\~220-300 KB), PNG at 2K (\~5-6 MB)**                       |
| Images per call            | `n` 1-10                                                                  |
| Reference images           | **1-4** on the editing endpoint (repeated `image[]`; a fifth returns 400) |
| Mask inpainting            | ❌ Not supported                                                           |
| Reproducible `seed`        | ❌ Not supported                                                           |
| `revised_prompt` echo      | ❌ Not returned                                                            |
| Latency                    | \~9s at 1K, \~15-17s at 2K                                                |
| Concurrency / rate         | Uncapped; **measured comfortably at 100 RPM**                             |
| Recommended client timeout | 360 seconds or more                                                       |

## Endpoints

| Capability            | Method | Path                     | Content-Type              |
| --------------------- | ------ | ------------------------ | ------------------------- |
| Text-to-image         | `POST` | `/v1/images/generations` | `application/json`        |
| Image editing         | `POST` | `/v1/images/edits`       | **`multipart/form-data`** |
| Chat-style generation | `POST` | `/v1/chat/completions`   | `application/json`        |

<Warning>
  **✅ The editing endpoint requires `multipart/form-data` file upload**

  Sending JSON to `/v1/images/edits` **always returns 400**:

  ```text theme={null}
  request Content-Type isn't multipart/form-data
  ```

  **This matters most if you are integrating from the upstream vendor's documentation** — that doc describes a JSON body with a public image URL, which does **not** work through the APIYI gateway. **Follow this page instead**: upload the file with `-F "image=@photo.jpg"`. Full examples in [Image Editing API](/en/api-capabilities/grok-imagine-image/image-edit).

  The file field must be named `image` or `image[]`; `images` / `image_file` return 415.
</Warning>

<Warning>
  **⚠️ Never send reference images to the text-to-image endpoint**

  When `/v1/images/generations` receives `image` / `image_url` / `images`, it does **not** raise an error. It returns 200 and generates a brand-new image from the prompt alone, ignoring your reference entirely — **and bills you as usual**.

  Because there is no error signal, this typically surfaces only when someone notices the output has nothing to do with the input. **Any workflow involving a reference image must use `/v1/images/edits`.**
</Warning>

<Tip>
  Primary domain `https://api.apiyi.com`, backup `https://vip.apiyi.com`. Chat-style generation (`/v1/chat/completions`) works but is **not the recommended path** — see the FAQ below.
</Tip>

## Migrating from GPT-Image-2

If you already integrate [GPT-Image-2](/en/api-capabilities/gpt-image-2/overview), the **endpoints and calling convention are identical** (`/v1/images/generations` + `/v1/images/edits`, OpenAI SDK compatible) — but the **parameter system is different**, so simply swapping the model name will not work. Here is what must change.

### Parameter mapping

| Aspect                  | GPT-Image-2                                            | **Grok Imagine 2**                                | Migration action                                  |
| ----------------------- | ------------------------------------------------------ | ------------------------------------------------- | ------------------------------------------------- |
| Output size             | `size` (explicit pixels such as `1536x1024`)           | `aspect_ratio` + `resolution`                     | **Must be rewritten**; `size` raises no error     |
| Quality tier            | `quality` (`low`/`medium`/`high`/`auto`)               | No such parameter — **use the model name**        | Drop `quality`, switch to the `-quality` variant  |
| Output format           | `output_format` (png/jpeg/webp) + `output_compression` | No such parameter — **format follows resolution** | Drop both; 1K is always JPEG, 2K always PNG       |
| Background              | `background` (`opaque`/`auto`)                         | No such parameter                                 | Drop it                                           |
| Moderation level        | `moderation` (`auto`/`low`)                            | No such parameter                                 | Drop it                                           |
| High fidelity           | `input_fidelity` must not be sent                      | No such parameter                                 | Drop it                                           |
| Images per call         | `n` **supports only 1**                                | `n` **supports 1-10**                             | ✅ You can remove the client-side fan-out loop     |
| Reference images (edit) | Up to 16                                               | **Up to 4**                                       | ⚠️ Rework flows that send more than 4             |
| Mask inpainting         | ✅ Supported                                            | ❌ **Not supported**                               | ⚠️ Mask-dependent flows cannot migrate            |
| Billing                 | Per token (\~\$0.21/image at high)                     | **Flat per request**, \$0.02 / \$0.045            | Budget model shifts from usage-based to per-image |

### The three easiest mistakes

<Warning>
  **1. The default response format is inverted — the most commonly missed change**

  GPT-Image-2 **only returns `b64_json`** (there is no `url`), while Grok Imagine 2 **returns `url` by default**. If your parser reads `resp.data[0].b64_json`, it will get `None` / `undefined` after migrating.

  Pick one of two fixes:

  * **Keep your existing code** → explicitly pass `"response_format": "b64_json"`
  * **Switch to direct links** → read `data[0].url` and download it

  Also note that GPT-Image-2's `usage` carries **real token counts**, whereas Grok Imagine 2's `usage` is a **placeholder** (always `1000 x n`). Any cost-reporting script built on `usage` will produce wrong numbers after migrating.
</Warning>

<Warning>
  **2. `size` fails silently rather than erroring**

  GPT-Image-2 validates strictly and usually returns 400 on bad input. **Grok Imagine 2 is lenient**: OpenAI-style fields such as `size`, `quality` and `style` are **silently ignored**, and invalid `aspect_ratio` / `resolution` values **silently fall back to defaults**.

  So if you change only `model` and forget to remove `size: "1536x1024"`, the request **returns 200 with a 1024x1024 square image** — with nothing telling you the parameter was ignored.

  After migrating, **verify the output pixel dimensions on the first call** to confirm `aspect_ratio` / `resolution` actually took effect.
</Warning>

<Warning>
  **3. Reference images can no longer go to the text-to-image endpoint**

  This pitfall is specific to this model: sending a reference image to `/v1/images/generations` returns **200, silently discards the reference, and still bills you**. Every reference-image call must use `/v1/images/edits` with `multipart/form-data` — see [Endpoints](#endpoints) above.
</Warning>

### Before and after

```python theme={null}
# Before: GPT-Image-2
resp = client.images.generate(
    model="gpt-image-2",
    prompt="Cyberpunk city on a rainy night",
    size="1536x1024",           # <- remove
    quality="high",             # <- remove
    output_format="jpeg"        # <- remove
)
img = base64.b64decode(resp.data[0].b64_json)

# After: Grok Imagine 2
resp = client.images.generate(
    model="grok-imagine-image",           # use grok-imagine-image-quality for higher fidelity
    prompt="Cyberpunk city on a rainy night",
    n=1,
    extra_body={
        "aspect_ratio": "16:9",           # <- replaces size
        "resolution": "1k",               # <- replaces the sizing role of quality
        "response_format": "b64_json"     # <- set explicitly to keep the parser unchanged
    }
)
img = base64.b64decode(resp.data[0].b64_json)
```

<Tip>
  **Which should you use?** Stay on [GPT-Image-2](/en/api-capabilities/gpt-image-2/overview) if you need mask inpainting, pixel-exact custom sizes, or fusion across up to 16 references. Choose Grok Imagine 2 for **predictable cost** (flat per image, no 2K surcharge), **multiple images per call** (`n` up to 10), or **high source fidelity when editing**. The two coexist — the same Token calls both.
</Tip>

## Key Parameters

### `aspect_ratio` and `resolution` (output size)

Together these determine the actual output pixels. Measured values match the request exactly:

| `aspect_ratio` | `resolution: 1k` | `resolution: 2k` |
| -------------- | ---------------- | ---------------- |
| `1:1`          | 1024x1024        | 2048x2048        |
| `16:9`         | 1280x720         | 2816x1584        |
| `9:16`         | 720x1280         | 1584x2816        |
| `4:3`          | 1152x864         | 2368x1776        |
| `3:4`          | 864x1152         | 1776x2368        |

<Warning>
  **Both parameters only apply to text-to-image.** On `/v1/images/edits` they are accepted without error but have **no effect** — the edited output always matches **the first reference image's dimensions** (1280x720 in, 1280x720 out; reversing the order of a fusion set flips the output to follow the new first image). To change the output size, crop or resize the reference image before uploading.
</Warning>

<Info>
  **Validation is lenient — typos do not raise errors.** Values outside the enum for `aspect_ratio` (e.g. `5:7`, `21:9`) or `resolution` (e.g. `1K`, `1024x1024`) **silently fall back to the default** and still return an image. An invalid `response_format` likewise falls back to `url`. So when output does not match expectations, **check your parameter spelling first**.

  The one exception is `resolution: "4k"`, which returns `503 model_service_unavailable`. That means **the tier is unsupported**, not that the channel is down — switch back to `1k` / `2k`.
</Info>

### `n` (images per call)

Accepts **1-10**; the returned `data` array length equals `n`, and each image is billed. `0` is silently treated as `1`; `11` or above returns 400.

## Best Practices

<Steps>
  <Step title="Decide up front: generation or editing?">
    No reference image → `/v1/images/generations`. Any reference image, even for a one-pixel tweak → `/v1/images/edits`. Picking the wrong endpoint produces no error, just an unexpected image.
  </Step>

  <Step title="Set the client timeout to 360 seconds">
    Image APIs are synchronous. 2K takes 15-17 seconds and can run longer during peaks or cold starts. A 60-second timeout causes spurious failures on requests that are still billed.
  </Step>

  <Step title="Control composition with aspect_ratio, not the prompt">
    The parameter genuinely works, so `aspect_ratio: "16:9"` is far more reliable than asking for a "landscape composition" in the prompt.
  </Step>

  <Step title="Choose the resolution tier by bandwidth">
    2K is lossless PNG at 5-6 MB per image; 1K is JPEG at 220-300 KB — roughly a 20x difference. Prefer 1K for mobile or bulk transfer. Since both tiers cost the same, the choice is purely quality versus bandwidth.
  </Step>

  <Step title="Say «keep everything else unchanged» when editing">
    Instructions like "change the scarf to red, keep everything else exactly the same" work very well — the model follows this constraint closely and preserves the rest of the image.
  </Step>

  <Step title="Refer to images explicitly when fusing">
    The `image[]` upload order is what "image 1 / image 2 / image 3" means. Writing "put the subject from image 1 into the scene from image 2" is far more reliable than letting the model guess.
  </Step>

  <Step title="Do not rely on seed for reproducibility">
    This family does not support `seed`; the same prompt yields different results across calls. Persist the images you want to keep rather than expecting to regenerate them.
  </Step>

  <Step title="Just go concurrent for batch work">
    There are no concurrency limits — **100 RPM runs comfortably** with ample channel capacity. No need to build a serial queue or request extra quota.
  </Step>
</Steps>

## Error Codes and Retries

| HTTP  | code                        | Meaning                                                | Recommended handling                                                |
| ----- | --------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------- |
| `400` | `invalid_image_request`     | Editing endpoint received JSON instead of multipart    | Switch to `multipart/form-data` upload; do not retry                |
| `400` | `invalid_request`           | Invalid parameters **or** prompt blocked by moderation | Same code for both — check parameters first, then revise the prompt |
| `415` | —                           | Unsupported file field name on the editing endpoint    | Rename the field to `image` or `image[]`                            |
| `429` | —                           | Rate limit exceeded or insufficient balance            | Exponential backoff, and check the account balance                  |
| `503` | `model_service_unavailable` | Unsupported parameter tier (e.g. `resolution: 4k`)     | **Not an outage** — switch back to `1k` / `2k`, do not retry        |
| `503` | —                           | No available channel in the current Group              | Check the Token's Group settings, see Group Setup above             |

<Info>
  **Client guidance**: `400` and `415` are deterministic — retrying is pointless, so alert instead. Only `429` and network-layer timeouts are worth retrying, with exponential backoff and at most 3 attempts.

  Note that `400 invalid_request` covers both "bad parameter" and "content blocked", and **the response body cannot distinguish them**. A practical heuristic is latency: moderation blocks return in about 5-6 seconds — faster than a successful generation (\~9s) — because the block happens before generation starts.
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="Why does sending JSON to /v1/images/edits return 400, when the vendor docs show JSON?">
    Because **the APIYI gateway's editing endpoint only accepts `multipart/form-data`**, while the upstream vendor documentation describes a JSON body with a public image URL. The two differ — follow this site's documentation.

    The correct form is a file upload:

    ```bash theme={null}
    curl -X POST "https://api.apiyi.com/v1/images/edits" \
      -H "Authorization: Bearer sk-your-api-key" \
      -F "model=grok-imagine-image" \
      -F "prompt=Change the scarf to red, keep everything else the same" \
      -F "image=@photo.jpg"
    ```

    The upside is that you **do not need image hosting** — upload the local file directly, which is simpler than preparing a public URL. Full examples in [Image Editing API](/en/api-capabilities/grok-imagine-image/image-edit).
  </Accordion>

  <Accordion title="I sent a reference image to text-to-image and got 200, but the result is unrelated?">
    That is expected behaviour, and the **most common pitfall** with this model: `/v1/images/generations` **silently ignores** `image` / `image_url` / `images`, generates purely from the prompt, and **bills you as usual**.

    With no error signal it is easy to conclude that "editing is broken". **Any workflow with a reference image must use `/v1/images/edits`.**
  </Accordion>

  <Accordion title="Why do resolution / aspect_ratio have no effect on the editing endpoint?">
    Edited output dimensions **follow the input reference image**: 1280x720 in gives 1280x720 out, 1024x1024 in gives 1024x1024 out. Passing `resolution` or `aspect_ratio` here raises no error but does nothing.

    To change the output size, crop or resize the reference image before uploading.
  </Accordion>

  <Accordion title="Why is there no revised_prompt in the response?">
    This family does **not** return `revised_prompt`, nor fields like `respect_moderation` or `model`. Each `data[]` entry contains **either** `url` **or** `b64_json` depending on `response_format` — never both.

    Do not assume these fields exist when parsing responses.
  </Accordion>

  <Accordion title="Can I reconcile billing using the token counts in usage?">
    **No.** `usage.prompt_tokens` is always `1000 x n` regardless of actual prompt length — it is a placeholder.

    This family is billed **per request** at a flat rate per image. Use the APIYI Console billing records for actual charges.
  </Accordion>

  <Accordion title="Why is 1K a JPEG while 2K is a PNG? The sizes differ a lot">
    That is upstream behaviour: `resolution: 1k` returns JPEG (\~220-300 KB) and `resolution: 2k` returns lossless PNG (\~5-6 MB), roughly a 20x difference.

    The URL extension, the HTTP `Content-Type` and the actual bytes are consistent with each other, so you can branch safely on `Content-Type`.

    For bandwidth-sensitive scenarios (mobile, bulk transfer) prefer `1k` — both tiers cost the same, so the decision is purely about quality. Conversely, when you do want quality, `2k` carries no surcharge and lands at a deeper discount versus list.
  </Accordion>

  <Accordion title="resolution: 4k returns 503 — is the channel down?">
    **No.** `4k` is not a supported tier for this family, and the gateway returns `503 model_service_unavailable`. The code looks like an outage but is really a parameter problem, so **retrying will not help** — switch back to `1k` or `2k`.

    Only `1k` and `2k` are supported.
  </Accordion>

  <Accordion title="Why do invalid parameters produce a wrong image instead of an error?">
    Validation on this family is lenient: invalid `aspect_ratio` (e.g. `5:7`), `resolution` (e.g. `1K`, `1024x1024`) and `response_format` (e.g. `base64`) all **silently fall back to defaults** and still return an image rather than a 400.

    So when the output does not match expectations, **check the parameter spelling first** — in particular, `resolution` values are lowercase `1k` / `2k`.
  </Accordion>

  <Accordion title="How many images can one call produce?">
    `n` accepts **1-10**, and the returned `data` array length equals `n`. Each image **is billed**.

    `0` is silently treated as `1`; `11` or above returns `400 invalid_request`.
  </Accordion>

  <Accordion title="Is seed-based reproducibility supported?">
    **No.** Passing `seed` raises no error but has no effect — the same prompt with the same `seed` returns different images across calls.

    Persist any image you need to reuse rather than trying to regenerate it.
  </Accordion>

  <Accordion title="Can I call this with the official OpenAI SDK?">
    Yes. Both endpoints are OpenAI Images API compatible — just point `base_url` at `https://api.apiyi.com/v1`:

    ```python theme={null}
    from openai import OpenAI
    client = OpenAI(api_key="sk-your-api-key", base_url="https://api.apiyi.com/v1")

    resp = client.images.generate(
        model="grok-imagine-image",
        prompt="a red wooden boat on an alpine lake at dawn",
        extra_body={"aspect_ratio": "16:9", "resolution": "1k"}
    )
    ```

    Note that `aspect_ratio` and `resolution` are not standard OpenAI SDK fields, so pass them via `extra_body`.
  </Accordion>

  <Accordion title="Are there concurrency limits? Will batch generation get throttled?">
    **No concurrency limits.** **Measured comfortably at 100 RPM** with no 429s and no queue rejections, backed by ample channel capacity. Call concurrently without building a serial queue or requesting extra quota.

    What actually matters is **`timeout`**: image APIs are synchronous, so set the client timeout to **360 seconds** to avoid cutting off requests that are still processing normally — and still being billed.
  </Accordion>

  <Accordion title="How does content moderation work, and how do I detect a block?">
    This family applies content moderation. Blocked requests return `400 invalid_request` using **exactly the same error code and message as a parameter error**, so the response body cannot distinguish them.

    A practical heuristic is **latency**: moderation blocks return in about 5-6 seconds (the block precedes generation), while a successful image takes about 9 seconds. Moderation outcomes also carry some randomness, so borderline content may not behave identically across retries — **do not draw conclusions from a single attempt**.

    If parameters are verified correct and 400s persist, the prompt most likely triggered moderation; revise the wording.
  </Accordion>

  <Accordion title="Can I generate images through /v1/chat/completions?">
    Yes, but it is **not the recommended path**. The endpoint returns a standard chat structure whose `content` is a markdown image link:

    ```text theme={null}
    ![image](https://apac.ossforai.com/...)
    ```

    That suits conversational clients such as Chatbox or LobeChat. For programmatic integration, **use the Images API** (`/v1/images/generations` and `/v1/images/edits`) — richer parameters, a more stable response shape, and consistent with this documentation.
  </Accordion>
</AccordionGroup>

## Related Documentation

* [Grok Imagine 2 Text-to-Image API](/en/api-capabilities/grok-imagine-image/text-to-image) - endpoint reference with Playground
* [Grok Imagine 2 Image Editing API](/en/api-capabilities/grok-imagine-image/image-edit) - reference editing and multi-image fusion
* [Grok Model Guide](/en/api-capabilities/grok/overview) - xAI text models
* [Image API Best Practices](/en/api-capabilities/image-api-best-practices) - timeouts, disconnects, compression
* [API Manual](/en/api-manual)
* [Recharge Promotions](/en/faq/recharge-promotions)
