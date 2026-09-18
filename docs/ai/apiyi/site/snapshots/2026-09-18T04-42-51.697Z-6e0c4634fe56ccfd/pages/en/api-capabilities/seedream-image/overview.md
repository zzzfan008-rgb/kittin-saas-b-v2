> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedream Image Generation & Editing

> Complete guide to ByteDance BytePlus ModelArk Seedream image-generation models — three active versions (5.0 / 4.5 / 4.0), 4K output, multi-image fusion, batch sequence generation, reference-image editing, all on a single endpoint.

## Overview

**Seedream** is the flagship image-generation model series from ByteDance BytePlus ModelArk, with a **unified generation-editing architecture**: text-to-image, single-image editing, multi-image fusion, and batch sequence generation all run through one `/v1/images/generations` endpoint — only the parameters differ. APIYI has a strategic partnership with BytePlus and integrates every active version on day one.

<Note>
  **🎨 Highlights**: three active versions (5.0 / 4.5 / 4.0) on unified billing + 4K output + up to 10 reference images for fusion + batch (input + output ≤ 15) + leading text rendering. **Ideal for e-commerce hero images, ad posters, product photography, and content creation** — anywhere high quality plus readable text matters.
</Note>

<Info>
  All image APIs are **synchronous** — there is no task ID to poll, and if your client disconnects the result is lost while the request is still billed. Set a generous timeout for this model; see [Image API Essentials & Best Practices](/en/api-capabilities/image-api-best-practices).
</Info>

<Note>
  **Which Seedream is this?** APIYI serves Seedream on **official overseas BytePlus (international) resources** — not the mainland Doubao / Volcengine edition. The international edition applies a comparatively lighter content-moderation policy than the domestic one, giving you more creative freedom — a real advantage of this platform, but **it does not mean moderation-free**: BytePlus still runs built-in content safety checks, and violating prompts or reference images are rejected with 400/403 (rejections are not billed). Use within compliance.
</Note>

<CardGroup cols={2}>
  <Card title="Text-to-Image API" icon="wand-sparkles" href="/en/api-capabilities/seedream-image/text-to-image">
    `POST /v1/images/generations`. Generate images from prompts at 1K / 2K / 3K / 4K or exact pixel sizes.
  </Card>

  <Card title="Image Editing API" icon="image" href="/en/api-capabilities/seedream-image/image-edit">
    Same endpoint with `image` parameter. Single-image editing, multi-image fusion, and batch sequence (up to 15 images).
  </Card>

  <Card title="Historical Versions" icon="rotate-ccw-clock" href="/en/api-capabilities/seedream-image/historical-versions">
    5.0 / 4.5 / 4.0 spec comparison, pricing differences, and migration guide.
  </Card>
</CardGroup>

## Let an AI Agent Do the Integration

<Note>
  If you build with Codex / Claude Code / Cursor, copy the prompt below and hand it to your agent. It first fetches the plain-text version of this page (append `.md` to any docs URL), then writes code in your project's own stack — timeout, re-hosting URL results immediately, editing via a URL array rather than multipart, and the parameters `seedream-5-0-pro` rejects are already baked into the requirements.
</Note>

<Prompt description="Have a coding agent integrate or troubleshoot Seedream text-to-image and image editing. Copy and paste into Codex, Claude Code, Cursor and similar tools." icon="bot" actions={["copy"]}>
  Integrate / troubleshoot Seedream text-to-image and image editing in this project.

  Read the docs before you touch code: fetch [https://docs.apiyi.com/en/api-capabilities/seedream-image/overview.md](https://docs.apiyi.com/en/api-capabilities/seedream-image/overview.md) for the plain-text version of this page. For finer parameter detail, append `.md` to the text-to-image and image-edit pages the same way.

  Requirements:

  1. Timeout: tier the client timeout by model — start at 60 seconds for the 4.x series, raise it to 120 seconds for `seedream-5-0`, and **raise it to 240 seconds for `seedream-5-0-pro`, which measures around 2 minutes per image**. The image APIs are synchronous — there is no task ID, so if the client disconnects the result is lost while the request is still billed. Reverse proxies, gateways and serverless execution limits all need widening too.

  2. Handling the response: the default is `url` — a BytePlus TOS temporary signed link that expires in about 24 hours — and you can pass `response_format` set to `b64_json` for plain base64 instead (with no `data:` prefix). If you take the URL, **download and re-host it in your own object storage immediately**; never store the upstream link in your database as a long-lived address. If you take base64, render it and offer a save-to-disk action. Send `response_format` explicitly rather than relying on the default.

  3. Uploading reference images (**the biggest difference from other image models**): Seedream uses a unified generate-and-edit architecture, so there is **no `/v1/images/edits` endpoint** — both generation and editing hit `/v1/images/generations` as `application/json`. Reference images go in the `image` field, which is a **URL array** — not a multipart file upload, and not a repeated `image[]` field. Array entries may be image URLs or data URLs in `data:image/jpeg;base64,...` form, and the two can be mixed. Up to 10 reference images are allowed, and **input images plus output images together must not exceed 15**. There is no `mask` field. For large local files, upload to your own object storage first and pass the URL; if you use data URLs, compress first — only process files above 1.5MB, scale the long edge down to 2048px keeping the aspect ratio (never upscale a small image), re-encode at quality 0.9, and keep the combined size under 6MB for multi-image requests. If one image fails to compress, fall back to the original and carry on.

  4. Parameter red lines: this model has **no `quality` parameter** — fidelity comes from the model version and `size`. `size` accepts either a tier (`1K` / `2K` / `3K` / `4K`, default `2K`) or exact pixels; note that `seedream-5-0-pro` caps out around 4.19 million pixels at 2048 by 2048 and has **no 3K or 4K tier**. `n` is **silently ignored** (you still get one image and pay for one), so use `sequential_image_generation` for multiple outputs; `seed` has no effect on 4.x or 5.x. For commercial use **always send `watermark` set to false**, because the default varies by version. `output_format` supports png only on 5.0 and 5.0-pro; 4.5 and 4.0 emit jpeg only, with no alpha channel.

  5. Two hard red lines for `seedream-5-0-pro`: **do not send `sequential_image_generation` at all — any value, including `"disabled"`, returns 400** — and **do not send `stream`** (also 400). If you are porting code over from 5.0 or 4.x, strip both fields entirely.

  6. Read the key from the `APIYI_API_KEY` environment variable and use [https://api.apiyi.com/v1](https://api.apiyi.com/v1) as the base URL. Never hardcode it, never commit it to git. When calling through the OpenAI SDK, the `image`, `sequential_image_generation`, `watermark` and `output_format` parameters must go inside `extra_body` to be forwarded.

  7. When you are done, actually run one text-to-image call and one image-edit call, then show me the results and what those two calls cost.
</Prompt>

<Accordion title="What this prompt saves you from">
  | Requirement                     | Pitfall it prevents                                                                                                                                                                                                          |
  | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | Editing does not use multipart  | Seedream has no `/v1/images/edits`; reference images are a JSON URL array, so the OpenAI-style multipart approach fails outright                                                                                             |
  | Re-host server-side immediately | The upstream link expires in about 24 hours, so storing it long-term produces a slow drip of 404s                                                                                                                            |
  | Timeout tiered by model         | `seedream-5-0-pro` measures around 2 minutes, so a 60s timeout fires constantly — and **a disconnected request is still billed**. See [Image API Essentials & Best Practices](/en/api-capabilities/image-api-best-practices) |
  | Two banned fields on `5-0-pro`  | `sequential_image_generation` returns 400 even when set to `"disabled"` — the easiest trap when porting from another version                                                                                                 |
  | Do not rely on `n`              | It is silently ignored and still yields one image; use `sequential_image_generation` instead                                                                                                                                 |
  | Send `watermark` set to false   | The default varies by version, so commercial output may come back watermarked                                                                                                                                                |
</Accordion>

## Why APIYI's Seedream

Drop-in replacement for the BytePlus ModelArk official channel, optimized for production use along three axes — **stability**, **cost**, **integration**:

<CardGroup cols={2}>
  <Card title="Strategic partnership · stable resources" icon="shield-check">
    Authorized direct connection to BytePlus ModelArk. Request and response behavior is identical to the upstream — **no protocol bypass**, safe for production.
  </Card>

  <Card title="Unlimited concurrency · enterprise-ready" icon="infinity">
    Linear scaling for batch generation, multi-image fusion, and sequence generation — no Tier-style account limits. **Default 500 RPM**, contact sales for higher quotas.
  </Card>

  <Card title="Same price + up to 20% off via top-ups" icon="percent">
    Default unit price matches BytePlus official pricing. Combined with [top-up bonuses](/en/faq/recharge-promotions), the effective price drops to **as low as 80%** of list.
  </Card>

  <Card title="Global zero-friction access" icon="globe">
    **No overseas server or proxy required**. Connects directly to `api.apiyi.com` from mainland China data centers, residential networks, and overseas nodes. No need to set up routing for BytePlus `ap-southeast-1` / `eu-west-1` regions.
  </Card>

  <Card title="OpenAI-compatible · zero code change" icon="plug">
    The path `/v1/images/generations` is identical to OpenAI. Point the OpenAI SDK's `base_url` at APIYI and call the API as-is. Pass extension parameters (`image` / `sequential_image_generation` etc.) via `extra_body`. Note that OpenAI's `n` parameter is not supported upstream (silently ignored — you still get 1 image); use `sequential_image_generation` for multi-image output.
  </Card>

  <Card title="Professional support · enterprise concierge" icon="handshake">
    Deep expertise in image-generation use cases — multi-image fusion, text rendering, batch asset production. End-to-end support from PoC to production rollout.
  </Card>
</CardGroup>

## Key Features

<CardGroup cols={2}>
  <Card title="4K high-fidelity output" icon="expand">
    4.0 / 4.5 support native 4K (4096×4096) with rich detail layers — ideal for posters and print. 5.0-lite tops out at 3K but offers a more refined overall experience.
  </Card>

  <Card title="Unified generation-editing" icon="wand-sparkles">
    Text-to-image, single-image editing, multi-image fusion, and batch sequence all share **one endpoint and one parameter set**. Switch modes via `image` and `sequential_image_generation`.
  </Card>

  <Card title="Multi-image fusion · up to 10 references" icon="layers">
    `image` accepts a URL array. Refer to "image 1 / image 2" in the prompt for explicit ordering. Pair with `sequential_image_generation: "disabled"` for subject-consistent fusion.
  </Card>

  <Card title="Text rendering breakthrough" icon="type">
    The 4.5 release dramatically improved small-text legibility. Posters, ad copy, and product text are clear and accurate — best in class.
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="Batch sequence (up to 15)" icon="images">
    `sequential_image_generation: "auto"` plus `max_images` outputs a coherent series — perfect for storyboards, brand visuals, and product series.
  </Card>

  <Card title="≈ 15s per image · balanced speed" icon="bolt">
    Typical single-image latency is \~15s; 4K + hd may extend up to a minute. **500 RPM** default, scalable on request.
  </Card>

  <Card title="Flexible sizes · arbitrary aspect" icon="ruler">
    Resolution presets (`1K`/`2K`/`3K`/`4K`) or exact pixels. Total pixels ∈ \[1280×720, 4096×4096], aspect ratio ∈ \[1/16, 16].
  </Card>

  <Card title="Drop-in OpenAI SDK" icon="plug">
    Set `base_url=https://api.apiyi.com/v1` and call with the official OpenAI SDK. Extension params go through `extra_body`. Zero code change for migration.
  </Card>
</CardGroup>

## Pricing

Per-image billing, **same price as BytePlus official**. Top-up bonuses lower the effective unit price further.

| Model                     | APIYI Price                | List Price (RMB est.) | Status                                                          |
| ------------------------- | -------------------------- | --------------------- | --------------------------------------------------------------- |
| `seedream-5-0-pro-260628` | \$0.12 / request (1 image) | ≈ ¥0.84 / request     | 🆕 Pro tier (\~2 min per image; use 5.0-lite for everyday work) |
| `seedream-5-0-260128`     | \$0.035 / image            | ≈ ¥0.245 / image      | ✅ Recommended (latest)                                          |
| `seedream-4-5-251128`     | \$0.04 / image             | ≈ ¥0.28 / image       | ✅ Recommended                                                   |
| `seedream-4-0-250828`     | \$0.03 / image             | ≈ ¥0.21 / image       | 🟡 Maintained (still callable)                                  |

<Info>
  **Billing notes**:

  * Billed per generated image, regardless of prompt length or fusion mode
  * `seedream-5-0-pro` is billed at a **fixed \$0.12 per request** (1 image per request; batch sequence not supported). Officially the model uses two output-pixel price tiers (one price for ≤2.36M px, one for >2.36M px) plus a per-image fee for reference images beyond the first; APIYI simplifies this to a flat per-request price — **no tiers, input-image fees included**. This model carries **no official discount of any kind**; APIYI prices it on a supply-guarantee basis — effectively at no margin once top-up bonuses and tax costs are factored in — and any price change will be announced in advance
  * In `sequential_image_generation: "auto"` mode, billing is by actual output count (e.g. `max_images: 4` outputs 4 → 4 billed)
  * Failed requests (4xx / blocked by moderation) **are not billed**
  * Free trial: 200 free images on first onboarding (provided by BytePlus)
  * Top-up bonus details: see [Top-up Promotions](/en/faq/recharge-promotions)
</Info>

## Technical Specs

| Dimension                         | seedream-5-0-pro                                                                      | seedream-5-0                      | seedream-4-5          | seedream-4-0          |
| --------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------- | --------------------- | --------------------- |
| **Model ID**                      | `seedream-5-0-pro-260628`                                                             | `seedream-5-0-260128`             | `seedream-4-5-251128` | `seedream-4-0-250828` |
| **Model ID alias**                | —                                                                                     | `seedream-5-0-lite-260128`        | —                     | —                     |
| **Release date**                  | 2026-06-28 (UTC+8)                                                                    | 2026-01-28 (UTC+8)                | 2025-11-28 (UTC+8)    | 2025-08-28 (UTC+8)    |
| **Resolution tiers**              | 1K / 2K + exact WxH (≤ 4.19M total px; at 16:9 the longest edge reaches 2720, \~2.7K) | 2K / 3K                           | 2K / 4K               | 1K / 2K / 4K          |
| **Output format**                 | `png` / `jpeg`                                                                        | `png` / `jpeg`                    | `jpeg`                | `jpeg`                |
| **Prompt optimization**           | standard / fast                                                                       | standard                          | standard              | standard / fast       |
| **Text-to-image**                 | ✅                                                                                     | ✅                                 | ✅                     | ✅                     |
| **Single-image editing**          | ✅                                                                                     | ✅                                 | ✅                     | ✅                     |
| **Multi-image fusion**            | ✅ (up to 10)                                                                          | ✅                                 | ✅ (up to 10)          | ✅                     |
| **Batch sequence**                | ❌ (400 if passed)                                                                     | ✅                                 | ✅                     | ✅                     |
| **Streaming output**              | ❌ (400 if passed)                                                                     | ✅                                 | ✅                     | ✅                     |
| **Max images per minute (RPM)**   | 500                                                                                   | 500                               | 500                   | 500                   |
| **Single-request input + output** | input ≤ 10, output 1                                                                  | ≤ 15                              | ≤ 15                  | ≤ 15                  |
| **Typical latency**               | \~2 minutes                                                                           | \~30s                             | 10-20s                | 10-15s                |
| **Response field**                | same                                                                                  | `data[].url` or `data[].b64_json` | same                  | same                  |

## Generation Time Comparison

Measured single-request latency per version (measured 2026-07, UTC+8; wall-clock time from request to full response — expect normal per-request variance):

| Scenario                               | seedream-4-0 | seedream-4-5 | seedream-5-0 | seedream-5-0-pro                 |
| -------------------------------------- | ------------ | ------------ | ------------ | -------------------------------- |
| Text-to-image (1K/2K)                  | 7-11s        | 8-13s        | 29-34s       | **110-130s**                     |
| Text-to-image (top tier)               | \~15s (4K)   | \~18s (4K)   | \~37s (3K)   | \~134s (WxH 2720×1530, max size) |
| Editing / multi-image fusion           | \~11s        | 17-21s       | 38-40s       | **115-132s**                     |
| Batch sequence (2 images, edit + auto) | —            | \~36s        | —            | — (not supported)                |
| **Recommended client timeout**         | ≥ 60s        | ≥ 60s        | ≥ 120s       | **≥ 240s**                       |

<Warning>
  **`seedream-5-0-pro` consistently takes \~2 minutes per image** (110-132s measured across every run, no exceptions). This is expected behavior for a deep-reasoning image model, not a fault. Before adopting pro, confirm your product can absorb the latency: interactive flows (user waiting on screen) are a poor fit — use 5.0-lite (\~30s) instead; pro suits offline batch production where image quality and instruction adherence matter most.
</Warning>

## API Endpoints

| Endpoint                      | Purpose                                                                                                                                         | Content-Type       |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `POST /v1/images/generations` | Text-to-image / single-image editing / multi-image fusion / batch sequence — all modes share **one endpoint**, switched via request body params | `application/json` |

<Tip>
  **Domain choice**: `api.apiyi.com` is the primary endpoint. `vip.apiyi.com` and other gateway domains are also available, with identical behavior. **You do not need to use BytePlus native domains** like `ark.ap-southeast.bytepluses.com` / `ark.eu-west.bytepluses.com` — APIYI normalizes everything to OpenAI-compatible paths.
</Tip>

## Key Parameters in Detail

### `size` (output size)

Two value families — pick one:

**Preset tiers** (model decides aspect ratio):

| Tier | Approx pixels         | Supported by  |
| ---- | --------------------- | ------------- |
| `1K` | \~1024×1024           | 4.0 / 5.0-pro |
| `2K` | \~2048×2048 (default) | all versions  |
| `3K` | \~3072×3072           | 5.0 only      |
| `4K` | \~4096×4096           | 4.5 / 4.0     |

**Exact pixels** (custom):

* Total pixels ∈ \[1280×720, 4096×4096]
* Aspect ratio ∈ \[1/16, 16]
* Default: `2048x2048`

**Valid examples**: `1920x1080` (FullHD), `3840x2160` (landscape 4K), `1080x1920` (phone portrait), `2560x1440` (landscape 2K)
**Invalid examples**: `5000x5000` (over the cap), `100x1600` (aspect under 1/16)

<Warning>
  Sizes with total pixels above 4096×4096 return 400. Extreme aspect ratios (close to 1/16 or 16) may stretch unnaturally — prefer presets or common 16:9 / 9:16 / 1:1.

  **The 5.0-series models use a different exact-pixel range than 4.x** (higher floor, lower cap). Out-of-range sizes return 400 with the valid range in the error message. Measured reference: 5.0-lite floor is around 2560×1440; **5.0-pro caps at 4.19M total pixels (max 2048×2048; at 16:9 the longest edge reaches 2720×1530 ≈ 2.7K, verified working) — there are no 3K/4K presets**.
</Warning>

### `image` and `sequential_image_generation` (mode switches)

The `/v1/images/generations` endpoint covers both text-to-image and editing/fusion. Two parameters together select the mode:

| Mode                 | `image`                 | `sequential_image_generation`                               | Notes                                                               |
| -------------------- | ----------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------- |
| Pure text-to-image   | omitted                 | omitted or `"disabled"`                                     | 1 output                                                            |
| Single-image editing | `["url1"]`              | `"disabled"`                                                | Edit based on 1 reference                                           |
| Multi-image fusion   | `["url1", "url2", ...]` | `"disabled"`                                                | Up to 10 references; refer as "image 1 / image 2"                   |
| Batch sequence       | optional                | `"auto"` + `sequential_image_generation_options.max_images` | N coherent outputs, **N ≤ max\_images** and **input + output ≤ 15** |

<Warning>
  **`seedream-5-0-pro` does not accept the `sequential_image_generation` parameter** — passing any value (including `"disabled"`) returns 400. For editing / fusion with the pro model, pass `image` only and omit the parameter entirely; the same applies to `stream`.
</Warning>

For full code examples, see [Text-to-Image](/en/api-capabilities/seedream-image/text-to-image) and [Image Editing](/en/api-capabilities/seedream-image/image-edit).

## Best Practices

<Steps>
  <Step title="Pick the right version">
    * **Best overall experience** → `seedream-5-0-260128` (most features, but 3K cap)
    * **4K + strong text rendering** → `seedream-4-5-251128` (4K + text breakthrough)
    * **4K + best price** → `seedream-4-0-250828` (cheapest 4K)
    * **Top image quality / complex instructions (professional work)** → `seedream-5-0-pro-260628` (\$0.12/request, \~2 min per image, 1K/2K only — not recommended for everyday use)
  </Step>

  <Step title="Prefer preset sizes">
    `1K`/`2K`/`3K`/`4K` are tuned by BytePlus for stable speed and quality. Use exact pixels only when you have a real aspect requirement. Note version differences in supported tiers.
  </Step>

  <Step title="Refer to images explicitly">
    With multiple `image` URLs, write the prompt with explicit references — "Place the person from image 1 into the scene of image 2 using the colour palette of image 3" — instead of letting the model guess.
  </Step>

  <Step title="Control batch sequence cost">
    `sequential_image_generation: "auto"` + `max_images: 4` outputs 4 — billed × 4. Validate with `max_images: 1` first, then scale up.
  </Step>

  <Step title="Pick output format by use case">
    5.0 / 5.0-pro support `png` and `jpeg`; 4.5 / 4.0 only `jpeg`. Use the 5.0 series + png when you need transparent backgrounds or lossless detail, jpeg for size-sensitive scenarios.
  </Step>

  <Step title="Set client timeout ≥ 60 seconds">
    Single image is \~15s, but batch sequence (4 images) or 4K + hd may take 30-60s. **Start with a 60s client timeout** and show progress feedback in the UI. **`seedream-5-0-pro` takes \~2 minutes per image — use a timeout of 240s or more**.
  </Step>

  <Step title="Disable watermark when needed">
    Set `watermark: false` to remove the BytePlus watermark (defaults vary by version, so set it explicitly). Required for commercial assets.
  </Step>
</Steps>

## Error Codes & Retries

| Status  | Meaning                                                                       | Recommended action                                                 |
| ------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `400`   | Invalid parameters (size out of bounds, `image` array > 10, unsupported tier) | Validate against the supported tier of the version in use          |
| `401`   | Invalid token                                                                 | Check Bearer Token                                                 |
| `403`   | Blocked by content moderation                                                 | Adjust prompt or replace reference images                          |
| `429`   | Rate limit (default 500 RPM) or insufficient balance                          | Exponential backoff; contact sales for higher RPM                  |
| `5xx`   | Gateway / upstream error                                                      | Retry 1-2 times                                                    |
| Timeout | Long-tail request                                                             | Client timeout ≥ **60s** (batch sequence or 4K + hd may reach 60s) |

<Info>
  **Client recommendations**:

  * Start with a **60-second** request timeout (batch sequence or 4K + hd may take a minute)
  * Apply **exponential backoff** for 5xx and timeouts (suggested 2 retries)
  * Log the `x-request-id` response header for support tickets
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="5.0 Pro / 5.0 / 4.5 / 4.0 — which to pick?">
    | Need                                                         | Recommended                                                                             |
    | ------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
    | Latest features + best overall                               | `seedream-5-0-260128`                                                                   |
    | 4K + strong text rendering (posters, ads)                    | `seedream-4-5-251128`                                                                   |
    | 4K + best price                                              | `seedream-4-0-250828`                                                                   |
    | Long-running stable batch production                         | `seedream-4-0-250828` (proven, cheapest, fast prompt mode)                              |
    | Top image quality / complex instructions (professional work) | `seedream-5-0-pro-260628` (\$0.12/request, \~2 min per image — skip unless you need it) |

    See [Historical Versions](/en/api-capabilities/seedream-image/historical-versions) for full comparison.
  </Accordion>

  <Accordion title="Why does image editing also use the generations endpoint?">
    Seedream uses a unified generation-editing architecture — there is **no separate `/v1/images/edits` endpoint**. Unlike OpenAI's gpt-image-2 (multipart upload to `/v1/images/edits`), Seedream uses `application/json` and passes image **URLs as an array** in the `image` field.

    Benefits: protocol consistency, parameter reuse, easy mode switching. See [Image Editing](/en/api-capabilities/seedream-image/image-edit) for details.
  </Accordion>

  <Accordion title="Does the image field accept base64?">
    **Yes** (verified by testing). Use a data URI: `data:image/<format>;base64,<base64 string>` with the `<format>` in lowercase (e.g. `data:image/jpeg;base64,...`). URLs and base64 entries can be mixed in the same array. **Prefer public URLs whenever you can**: URLs are downloaded by BytePlus directly from Singapore without passing through the APIYI gateway, while a base64 body must first be uploaded across the border in full. Bodies above 20 MB can hit the provider's 600-second request-body timeout when that link is slow, and the gateway does not convert base64 into a URL for you. See the warning at the top of the image editing page.
  </Accordion>

  <Accordion title="Multi-image fusion limit? Batch sequence limit?">
    * **Multi-image fusion** (`image` array): 4.5 / 5.0-pro explicitly support up to 10. 5.0 / 4.0 also support multi-image, though no explicit ceiling is documented.
    * **Batch sequence** (`max_images`): bounded by the global rule **input references + output ≤ 15**. When combining fusion and sequence, count the total. Note **5.0-pro does not support batch sequence** (passing `sequential_image_generation` returns 400).
  </Accordion>

  <Accordion title="Does b64_json need a data:image prefix?">
    Depends on `response_format`:

    * `response_format: "url"` (default) → `data[0].url` is a temp signed URL, render directly with `<img src=...>`
    * `response_format: "b64_json"` → `data[0].b64_json` is a **plain base64 string** (no `data:image/...;base64,` prefix). Decode and write to disk, or prepend the prefix manually for browser rendering.
  </Accordion>

  <Accordion title="Is streaming output supported?">
    Supported on 5.0 / 4.5 / 4.0 via `stream: true`. Streaming is especially useful for long prompts and high-resolution images — the frontend can render partial results progressively. **`seedream-5-0-pro` does not support streaming** — passing `stream` returns 400.
  </Accordion>

  <Accordion title="Rate limit?">
    **Default 500 images per minute** (Max Images per Minute), unified across versions. Contact sales for higher quotas.
  </Accordion>

  <Accordion title="Are failed requests billed?">
    **No**. BytePlus has built-in moderation. Moderation rejects and parameter errors return `400` / `403` and are **not billed**. Other zero-billed errors: `401` (invalid token), `429` (rate limited). **Only successful generation (`200` with valid response) is billed**.
  </Accordion>

  <Accordion title="Can I use the official OpenAI SDK?">
    Yes, with no code changes. Point `base_url` at `https://api.apiyi.com/v1` and pass extension params (`image` / `sequential_image_generation` / `watermark` etc.) via `extra_body`:

    ```python theme={null}
    from openai import OpenAI

    client = OpenAI(api_key="sk-your-key", base_url="https://api.apiyi.com/v1")
    resp = client.images.generate(
        model="seedream-5-0-260128",
        prompt="...",
        size="2K",
        extra_body={
            "image": ["https://.../ref.png"],
            "sequential_image_generation": "disabled",
            "watermark": False,
        }
    )
    ```
  </Accordion>

  <Accordion title="Who owns the generated images?">
    Generated images can be used commercially and non-commercially. See the BytePlus terms of service for details.
  </Accordion>

  <Accordion title="Are transparent backgrounds supported?">
    `seedream-5-0` / `seedream-5-0-pro` support `png` output and can produce transparent backgrounds when prompted ("transparent background, alpha channel"). `seedream-4-5` / `4-0` output only `jpeg` and **do not support transparency** — post-process to remove the background yourself.
  </Accordion>

  <Accordion title="Can I cancel a generation in flight?">
    **No**. `/v1/images/generations` is synchronous. Once submitted, the request runs to completion. The server still completes and bills even if the client disconnects. Set client timeouts and avoid the assumption that disconnect saves cost.
  </Accordion>
</AccordionGroup>

## Related Docs

* [Text-to-Image Playground](/en/api-capabilities/seedream-image/text-to-image) — `POST /v1/images/generations` with five language code samples
* [Image Editing Playground](/en/api-capabilities/seedream-image/image-edit) — `image` + `sequential_image_generation` patterns
* [Historical Versions](/en/api-capabilities/seedream-image/historical-versions) — 5.0 / 4.5 / 4.0 comparison and migration
* [API Manual](/en/api-manual) — general invocation guide
* [Image Generation Sandbox](https://imagen.apiyi.com/) — try it online
* BytePlus official docs: `docs.byteplus.com/en/docs/ModelArk/1824121` — Seedream 4.0-5.0 tutorial

<Info>
  Seedream is provided through APIYI's strategic partnership with BytePlus ModelArk. Three versions share a single integration, billing, and authentication path — pick by need. For questions or feedback, file a ticket from the console.
</Info>
