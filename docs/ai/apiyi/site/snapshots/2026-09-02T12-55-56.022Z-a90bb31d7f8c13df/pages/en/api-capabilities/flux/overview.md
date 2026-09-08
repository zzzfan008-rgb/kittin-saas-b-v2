> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# FLUX Image Generation & Editing

> Black Forest Labs FLUX model family — from sub-second FLUX.2 [klein] to 4MP flagship [max], covering text-to-image, multi-reference editing, typography, and exact hex color control. OpenAI-compatible drop-in.

## Overview

**FLUX** is the flagship image generation model family from Black Forest Labs (BFL), based in Germany. The latest **FLUX.2** generation spans 5 tiers from sub-second to 4MP flagship quality, alongside the previous-generation **FLUX.1 Kontext** for image editing — 7 active models in total. Legacy FLUX.1 \[pro] models also remain callable. The APIYI gateway wraps BFL's async polling API into a synchronous OpenAI Images API (`/v1/images/generations` and `/v1/images/edits`), so you can drop in the OpenAI SDK with just a `base_url` change.

<Note>
  **🎨 Key Highlights**: FLUX.2 \[max] uniquely supports **grounding search** for real-time web knowledge. Native 4MP output (2048×2048) + up to 8 multi-reference images + 32K-token prompts + precise hex color control + best-in-class typography. **Ideal for flagship quality, multi-image consistency, brand color fidelity, and professional layouts** in production.
</Note>

<Info>
  All image APIs are **synchronous** — there is no task ID to poll, and if your client disconnects the result is lost while the request is still billed. Set a generous timeout for this model; see [Image API Essentials & Best Practices](/en/api-capabilities/image-api-best-practices).
</Info>

<CardGroup cols={2}>
  <Card title="Text-to-Image API" icon="wand-sparkles" href="/en/api-capabilities/flux/text-to-image">
    `/v1/images/generations`, generate images from text prompts across all 5 FLUX.2 models.
  </Card>

  <Card title="Image Editing API" icon="image" href="/en/api-capabilities/flux/image-edit">
    JSON `input_image` fields (up to 8 references for fusion, via `/generations`), plus an OpenAI-compatible multipart `/edits` single-image path. Works for FLUX.2 + FLUX.1 Kontext.
  </Card>

  <Card title="Historical Versions" icon="rotate-ccw-clock" href="/en/api-capabilities/flux/historical-versions">
    Specs, migration notes, and pricing for FLUX.1 \[pro] / \[pro] 1.1 / \[pro] 1.1 Ultra / \[dev].
  </Card>
</CardGroup>

## Let an AI Agent Do the Integration

<Note>
  If you build with Codex / Claude Code / Cursor, copy the prompt below and hand it to your agent. It first fetches the plain-text version of this page (append `.md` to any docs URL), then writes code in your project's own stack — timeout, **the 10-minute URL expiry that forces an immediate server-side copy**, upload compression and the multiple-of-16 dimension rule are already baked into the requirements.
</Note>

<Prompt description="Have a coding agent integrate or troubleshoot FLUX text-to-image and image editing. Copy and paste into Codex, Claude Code, Cursor and similar tools." icon="bot" actions={["copy"]}>
  Integrate / troubleshoot FLUX text-to-image and image editing in this project.

  Read the docs before you touch code: fetch [https://docs.apiyi.com/en/api-capabilities/flux/overview.md](https://docs.apiyi.com/en/api-capabilities/flux/overview.md) for the plain-text version of this page. For finer parameter detail, append `.md` to the text-to-image and image-edit pages the same way.

  Requirements:

  1. Timeout: set the client timeout to 120 seconds, or 180 seconds if you are using `flux-2-flex`. The image APIs are synchronous — there is no task ID, so if the client disconnects the result is lost while the request is still billed. Reverse proxies, gateways and serverless execution limits all need widening too: any layer shorter than the generation time will cut the request off.

  2. Handling the response (**the most important item for this model**): FLUX **returns a URL only and never base64** — the result is in `data[0].url`. Do not look for `b64_json` and do not send `response_format`. That signed link is **valid for only about 10 minutes**, and **CORS is not enabled**: fetching it directly from the browser is blocked by cross-origin rules (putting the link into an image tag `src` does display fine). So the correct approach is: **download the URL server-side immediately and re-host it in your own object storage**, then hand your own permanent link to the frontend. Never store the upstream link in your database as a long-lived address. Note also that this model returns **no `usage` field**, so do not expect token counts in the response.

  3. Uploading reference images: multi-image fusion goes through `/v1/images/generations` using the JSON fields `input_image`, `input_image_2` and so on up to `input_image_8`; each value may be an image URL or a data URL in `data:image/...;base64,...` form. The `/v1/images/edits` endpoint (multipart) **takes a single image only, and the file field must be named `image`** — anything else returns `image is required`. Reference-image limits vary by model: up to 8 for FLUX.2 pro / max / flex, up to 4 for klein, and just 1 for FLUX.1 Kontext. Compress before uploading — only process files above 1.5MB, scale the long edge down to 2048px keeping the aspect ratio (never upscale a small image), re-encode at quality 0.9 and keep the original format; keep any single image under 20MB and 20 megapixels. If one image fails to compress, fall back to the original and carry on.

  4. Size parameters: use either `size` (for example `1024x1024`) or the two integers `width` and `height` — the two forms are equivalent, pick one. **Both dimensions must be multiples of 16**, at least 64 by 64, and at most roughly 4 megapixels (2 megapixels or under is recommended). Note that `1000x1000` is illegal because it is not a multiple of 16, and `3840x2160` is illegal because it exceeds 4 megapixels — validate both rules before sending if your UI lets users type dimensions. For edits, `aspect_ratio` controls the shape, and omitting it makes the output follow the first input image. This model has **no `quality` parameter**; `flux-2-flex` alone exposes `steps` (default 50) and `guidance` (default 4.5) as quality knobs. Control cost through model choice instead: klein is cheapest, max is priciest, edits cost the same as generations, and extra reference images add nothing.

  5. Other notes: when calling through the OpenAI SDK, FLUX-specific parameters must go inside `extra_body` to be forwarded at all. `prompt_upsampling` defaults to off and rewrites your prompt, so leave it off for brand work. `webhook_url` is not forwarded, so do not depend on it.

  6. Read the key from the `APIYI_API_KEY` environment variable and use [https://api.apiyi.com/v1](https://api.apiyi.com/v1) as the base URL. Never hardcode it, never commit it to git.

  7. When you are done, actually run one text-to-image call and one image-edit call, then show me the results and what those two calls cost.
</Prompt>

<Accordion title="What this prompt saves you from">
  | Requirement                        | Pitfall it prevents                                                                                                                         |
  | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
  | Re-host server-side immediately    | The upstream link dies after about 10 minutes, so storing it as a long-lived address guarantees widespread 404s                             |
  | Do not `fetch` it from the browser | CORS is not enabled upstream, so a frontend fetch is blocked; only an image tag `src` renders                                               |
  | Do not look for `b64_json`         | This model returns a URL only, so base64 parsing yields an empty value                                                                      |
  | Dimensions must be multiples of 16 | A perfectly normal-looking `1000x1000` is rejected outright, and `3840x2160` exceeds the pixel ceiling                                      |
  | Compress before upload             | The cap is 20MB and 20 megapixels per image. See [Image Compression & Output Resolution](/en/api-capabilities/image-compression-resolution) |
  | Edit file field named `image`      | Any other name returns `image is required` — and multi-image fusion should not use that endpoint at all                                     |
</Accordion>

## Why APIYI's FLUX?

A drop-in replacement for the BFL official channel, optimized in **stability**, **cost**, and **integration experience** for production:

<CardGroup cols={2}>
  <Card title="OpenAI-Compatible Wrapper · Zero-Code Migration" icon="shield-check">
    BFL native uses async polling, while APIYI wraps it as the synchronous **OpenAI Images API**. Point the OpenAI SDK's `base_url` here — no need to write your own `polling_url` loop.
  </Card>

  <Card title="No Concurrency Cap · Beyond 24 Active Tasks" icon="infinity">
    BFL caps each account at **24 active tasks** (`flux-kontext-max` only 6). APIYI pools requests at the gateway, so enterprise users scale linearly without the per-account ceiling.
  </Card>

  <Card title="Same Price or Up to 17% Off" icon="percent">
    FLUX.2 \[pro/max/flex] match the official price at 1MP, klein 4B/9B is \~28% cheaper, FLUX.1 \[pro] 1.1 Ultra saves 17%, and stacking [top-up bonuses](/en/faq/recharge-promotions) yields **up to 15% additional discount**.
  </Card>

  <Card title="Global Zero-Friction Access" icon="globe">
    **No overseas server or proxy required**. Mainland China data centers, residential networks, and global nodes can all reach `api.apiyi.com` directly with stable latency.
  </Card>

  <Card title="Complete Model Ecosystem" icon="layers">
    Pair with [gpt-image-2](/en/api-capabilities/gpt-image-2/overview), [Seedream](/en/api-capabilities/seedream-image/overview), [Nano Banana](/en/api-capabilities/nano-banana-image/overview), and others on the same gateway — mix per scenario.
  </Card>

  <Card title="Professional Service · Enterprise Support" icon="handshake">
    Our team has deep experience in image generation deployment — model selection, tuning, and integration support from PoC to production.
  </Card>
</CardGroup>

## Key Features

<CardGroup cols={2}>
  <Card title="Full Speed Spectrum" icon="bolt">
    klein 4B/9B **sub-second** on consumer GPUs, pro **\< 10s**, max **\< 15s**, flex slower for higher precision. One family from real-time to flagship.
  </Card>

  <Card title="Native 4MP Output" icon="expand">
    Up to 2048×2048 (\~4MP), 2.5x more than FLUX.1's 1.6MP cap. Any aspect ratio (dimensions must be multiples of 16), minimum 64×64.
  </Card>

  <Card title="Multi-Reference Fusion" icon="layers">
    JSON fields `input_image` \~ `input_image_8` carry multiple references (URL or base64 data URL): FLUX.2 \[pro/max/flex] up to **8**, \[klein] up to 4. Reference them in the prompt as "image 1 / image 2".
  </Card>

  <Card title="Grounding Search" icon="globe">
    Exclusive to FLUX.2 \[max]: prompts can trigger real-time web search to render "yesterday's match score", "live weather", "historical event recreation", and more.
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="Precise Hex Color Control" icon="palette">
    Write hex codes like `#02eb3c` / `#ff0088` directly in prompts. The model renders exact colors — no post-processing needed for brand-critical work.
  </Card>

  <Card title="32K-Token Long Prompts" icon="type">
    Supports up to **32K tokens**, including structured JSON descriptions (subject / background / lighting / style). Ideal for production automation.
  </Card>

  <Card title="Typography-Tuned" icon="type">
    FLUX.2 \[flex] is purpose-built for typography. Poster headers, UI mockups, infographics — small text fidelity leads the industry. max / pro also work well.
  </Card>

  <Card title="OpenAI SDK Drop-in" icon="plug">
    Set `base_url` to `https://api.apiyi.com/v1` and call `client.images.generate(model="flux-2-pro", ...)` directly — zero code change.
  </Card>
</CardGroup>

## Pricing

Per-image pricing — see the **APIYI Price** column. BFL's official pricing is per **MP (megapixel)**, with a base price within 1MP and incremental cost per extra MP. APIYI's flat per-image pricing is more predictable.

### FLUX.2 Series (Latest Generation)

| Model ID          | APIYI Price | Official       | Speed      | Best For                                    |
| ----------------- | ----------- | -------------- | ---------- | ------------------------------------------- |
| `flux-2-max`      | \$0.0700    | from \$0.07/MP | \< 15s     | Flagship quality + grounding search         |
| `flux-2-pro`      | \$0.0300    | from \$0.03/MP | \< 10s     | Production at scale, best value             |
| `flux-2-flex`     | \$0.0600    | \$0.06/MP      | Slower     | Typography-tuned, adjustable steps/guidance |
| `flux-2-klein-9b` | \$0.0100    | from \$0.015   | Sub-second | Balanced quality and speed                  |
| `flux-2-klein-4b` | \$0.0100    | from \$0.014   | Sub-second | Fastest, consumer-GPU friendly              |

### FLUX.1 Kontext Series (Image Editing Specialist)

| Model ID           | APIYI Price | Official | Saves | Best For                                 |
| ------------------ | ----------- | -------- | ----- | ---------------------------------------- |
| `flux-kontext-max` | \$0.0700    | \$0.08   | 12.5% | Highest editing quality, fine typography |
| `flux-kontext-pro` | \$0.0350    | \$0.04   | 12.5% | Editing value pick, 5–6s generation      |

### FLUX.1 \[pro] Legacy (Historical, Still Callable)

| Model ID             | APIYI Price | Official | Saves |
| -------------------- | ----------- | -------- | ----- |
| `flux-pro-1.1-ultra` | \$0.0500    | \$0.06   | 17%   |
| `flux-pro-1.1`       | \$0.0350    | \$0.04   | 12.5% |
| `flux-pro`           | \$0.0400    | \$0.04   | Same  |
| `flux-dev`           | \$0.0200    | —        | —     |

Detailed specs and migration guidance in the [Historical Versions page](/en/api-capabilities/flux/historical-versions).

<Info>
  **Pricing Notes**:

  * APIYI uses flat per-image pricing — same cost regardless of output MP
  * Official prices are MP-tiered: a base price for the first MP plus incremental cost per extra MP
  * Editing requests cost the same as text-to-image (unlike OpenAI gpt-image-2 where edits are billed via Vision tokens)
  * klein 4B / klein 9B open weights are available on Hugging Face for self-hosting (Apache 2.0 / FLUX NCL)
  * Failed requests (4xx / moderation blocks) are not billed
</Info>

## Technical Specs

| Dimension               | Value                                                                                   |
| ----------------------- | --------------------------------------------------------------------------------------- |
| **Recommended primary** | `flux-2-pro` / `flux-2-pro-preview` (general) + `flux-kontext-max` (typography editing) |
| **Speed**               | sub-second (klein) / \< 10s (pro) / \< 15s (max) / slower (flex)                        |
| **Output resolution**   | Up to 4MP (2048×2048), any aspect ratio, dimensions must be multiples of 16             |
| **Input resolution**    | Min 64×64, max 4MP (editing endpoint only)                                              |
| **Reference images**    | 8 (FLUX.2 \[pro/max/flex]) / 4 (FLUX.2 \[klein]) / 1 (FLUX.1 Kontext)                   |
| **Prompt length**       | Up to 32K tokens                                                                        |
| **Output format**       | `jpeg` (default) / `png`                                                                |
| **Moderation**          | `safety_tolerance` 0–6 (0 = strictest, 6 = most permissive, default 2)                  |
| **Grounding search**    | Only `flux-2-max`                                                                       |
| **Response field**      | `data[0].url` (**valid for 10 minutes**, download immediately)                          |
| **Images per request**  | 1 (`n=1`)                                                                               |
| **prompt\_upsampling**  | Supported on FLUX.2 \[pro/max/flex], not on \[klein]                                    |

## API Endpoints

| Endpoint                      | Purpose                                                                                                                          | Content-Type          |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `POST /v1/images/generations` | Text-to-image + image editing / multi-reference fusion (JSON `input_image` \~ `input_image_8`, **recommended**, all FLUX models) | `application/json`    |
| `POST /v1/images/edits`       | OpenAI-compatible single-image editing (`client.images.edit()` drop-in; verified on the Kontext series)                          | `multipart/form-data` |

For multi-reference fusion, use `/generations` (JSON `input_image_N`). The `/edits` endpoint accepts a single `image` file only — best for migrating existing OpenAI SDK editing code.

<Tip>
  **Domain options**: `api.apiyi.com` is the primary domain. Alternative gateway domains like `b.apiyi.com` / `vip.apiyi.com` behave identically.
</Tip>

## Size (width / height) in Detail

### Common Dimensions

| Size        | Aspect         | Pixels  | Best For                    |
| ----------- | -------------- | ------- | --------------------------- |
| `1024x1024` | Square 1:1     | \~1MP   | General, social avatars     |
| `1024x1536` | Portrait 2:3   | \~1.6MP | Posters, portraits          |
| `1536x1024` | Landscape 3:2  | \~1.6MP | Scenery, desktop            |
| `1440x2048` | Portrait \~3:4 | \~2.9MP | Cinematic vertical          |
| `1920x1080` | Landscape 16:9 | \~2MP   | Video thumbnails            |
| `2048x2048` | Square 1:1     | 4MP     | Flagship print (FLUX.2 cap) |

### Custom Size Constraints

FLUX.2 accepts arbitrary dimensions, as long as **all** of the following hold:

1. **width / height must be multiples of 16**
2. **Minimum 64×64**
3. **Maximum \~4MP** (e.g., 2048×2048 / 1920×2048 / 2048×1920)
4. **Recommended total ≤ 2MP** to balance speed and cost

**Valid examples**: `1280x720`, `1920x1080`, `2048x1024`, `1456x1920`
**Invalid examples**: `1000x1000` (not multiple of 16), `3840x2160` (exceeds 4MP), `32x32` (below 64×64)

<Warning>
  **API: width/height vs OpenAI-compatible size**: BFL natively uses integer `width` / `height`. APIYI also accepts the OpenAI-style `size: "1024x1024"` string. The two are equivalent — pick either.
</Warning>

## Best Practices

<Steps>
  <Step title="Pick model by scenario">
    Flagship final + needs real-time knowledge → `flux-2-max`. Production batch → `flux-2-pro`. Typography posters / infographics → `flux-2-flex`. High-throughput real-time → `flux-2-klein-9b`. Image editing → `flux-kontext-max` or `flux-kontext-pro`.
  </Step>

  <Step title="Default to ≤ 2MP">
    The sweet spot for speed and cost is 1MP–2MP. Reach for 4MP only when truly needed (print, 4K screens). klein at high resolution increases per-call cost noticeably.
  </Step>

  <Step title="Reference images by index in prompts">
    The numbering of `input_image` / `input_image_2` / `input_image_3` is exactly the "image 1 / image 2 / image 3" index in your prompt. Say "the person from image 1 in the scene of image 2 with the color palette of image 3" — far more reliable than letting the model guess.
  </Step>

  <Step title="Download result URLs immediately">
    `data[0].url` is **valid for only 10 minutes**, hosted on `delivery-eu.bfl.ai` / `delivery-us.bfl.ai`, with CORS disabled. Production must server-side download to your own CDN.
  </Step>

  <Step title="Lock typography to flex or max">
    Sign text, posters, UI screenshots — prefer `flux-2-flex` (typography specialist) or `flux-2-max` (highest overall quality). Other models may still blur small text.
  </Step>

  <Step title="Use max for grounding search">
    Real-time knowledge ("today's weather", "last night's match") is supported only on `flux-2-max`. Other models rely on training data and cannot fetch live info.
  </Step>

  <Step title="Client timeout 60–120s">
    APIYI handles polling internally and pro / max return in \< 15s, but with queueing and network jitter set client timeout to 60–120s. flex can go up to 180s.
  </Step>

  <Step title="Fix seed for reproducibility">
    Same `seed` + same other params = consistent results, useful for A/B tests and client review. klein doesn't support `prompt_upsampling`; pro/max/flex have it off by default — opt in as needed.
  </Step>
</Steps>

## Error Codes & Retries

| Status  | Meaning                                                                               | Recommended Action                                                     |
| ------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `400`   | Invalid params (width/height not multiple of 16, exceeds 4MP, prompt over 32K tokens) | Validate against the size constraints, especially the 16-multiple rule |
| `401`   | Invalid token                                                                         | Check Bearer token                                                     |
| `403`   | Moderation block                                                                      | Adjust prompt or raise `safety_tolerance` (max 6)                      |
| `429`   | Rate-limited / out of credits / active tasks exceeded                                 | Exponential backoff retry                                              |
| `5xx`   | Gateway / backend error                                                               | Retry 1–2 times                                                        |
| Timeout | Long-tail                                                                             | Client timeout ≥ **60s** (flex up to 180s)                             |

<Info>
  **Recommended client config**:

  * Request timeout **60–120s** (flex up to 180s)
  * Exponential backoff for 5xx and 429 (recommended 2 retries)
  * Once `data[0].url` is received, **download asynchronously immediately** — do not wait for user click
  * Log the `x-request-id` response header for support
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="Why does the url field expire in 10 minutes?">
    BFL hosts results on `delivery-eu.bfl.ai` / `delivery-us.bfl.ai` with signed URLs valid for 10 minutes, **and CORS is disabled**. Production services must server-side download to your own OSS / CDN. Don't pass the original URL to browsers, and don't expect users to access it later.

    APIYI inherits the same URL mechanism — behavior matches the official channel.
  </Accordion>

  <Accordion title="The official API uses async polling — how does APIYI make it synchronous?">
    The APIYI gateway handles polling for you: you send a standard OpenAI Images API request, the gateway internally POSTs to BFL, polls `polling_url` until `Ready`, then wraps the final `result.sample` URL as `data[0].url` and returns. From the client's perspective, it's a single request-response — identical to OpenAI / GPT-Image / Nano Banana.
  </Accordion>

  <Accordion title="How many reference images can I send? How to write the prompt?">
    * **FLUX.2 \[pro/max/flex]**: up to **8**
    * **FLUX.2 \[klein]**: up to **4**
    * **FLUX.1 Kontext \[pro/max]**: single reference (multi-image needs client-side stitching)

    Reference them by index ("image 1 / image 2 / image 3") in the prompt, e.g., "place the person from image 1 into the scene from image 2, applying the color palette of image 3". Natural-language references also work — the model understands input images well.
  </Accordion>

  <Accordion title="What does prompt_upsampling do? Should I enable it?">
    `prompt_upsampling=true` makes the model auto-expand and refine your prompt (especially helpful for short prompts). But **it changes the original intent** — keep it off for brand work and on for free exploration.

    **Limitation**: FLUX.2 \[klein] doesn't support it (silently ignored if passed).
  </Accordion>

  <Accordion title="How do I use grounding search?">
    Only `flux-2-max` supports it. **No special parameter needed** — if your prompt requires real-time knowledge, the model will automatically search the web before generating. Example:

    > "Generate a news photo of the snowstorm hitting NYC on Dec 15, 2025"

    Great for "yesterday's match score", "live weather", "historical event recreation", "latest trends". Prompts without time-sensitive content won't trigger search and bill as normal generation.
  </Accordion>

  <Accordion title="What's the most effective way to use hex colors?">
    Write hex codes directly in the prompt with explicit "color" or "hex" markers:

    ```
    A vase on a table, the color of the vase is gradient from #02eb3c to #edfa3c, the flowers have color #ff0088
    ```

    Or for multi-color brand work:

    ```
    Luxury eyeshadow palette with 6 pans: top row #B76E79, #E8D5B7, #8B4789; bottom row #CD7F32, #F8F6F0, #800020
    ```

    Industry-leading precision — no post-processing color correction needed.
  </Accordion>

  <Accordion title="What's structured JSON prompting?">
    FLUX.2 supports JSON-formatted prompts:

    ```json theme={null}
    {
      "subject": "Mona Lisa painting by Leonardo da Vinci",
      "background": "museum gallery wall, ornate gold frame",
      "lighting": "soft gallery lighting",
      "style": "digital art, high contrast",
      "camera_angle": "eye level view",
      "composition": "centered, portrait orientation"
    }
    ```

    Pass the JSON string as the `prompt` field. Ideal for production automation and templated batch generation.
  </Accordion>

  <Accordion title="Which endpoint should I use for image editing?">
    Two options:

    * **Option A (recommended)**: JSON + `input_image` (\~ `input_image_8`) to `/v1/images/generations` — works for all FLUX models and supports multi-reference fusion
    * **Option B**: `multipart/form-data` to `/v1/images/edits` — the file field name must be `image` (single image), directly compatible with the OpenAI SDK's `client.images.edit()`, verified on the Kontext series

    See [Image Editing API](/en/api-capabilities/flux/image-edit) for parameters and examples.

    **Note**: FLUX.1 Kontext supports only single-reference natively; FLUX.2 supports up to 8 references (via Option A).
  </Accordion>

  <Accordion title="Can I use the OpenAI official SDK directly?">
    Yes, zero code change. Set `base_url` to `https://api.apiyi.com/v1`:

    ```python theme={null}
    from openai import OpenAI
    client = OpenAI(api_key="sk-your-key", base_url="https://api.apiyi.com/v1")
    resp = client.images.generate(
        model="flux-2-pro",
        prompt="...",
        size="1024x1024"
    )
    ```

    Same for the Node.js `openai` package. All FLUX models follow the OpenAI Images API response shape with `data[0].url`.
  </Accordion>

  <Accordion title="Can I cancel a running task?">
    **Not supported**. If the client disconnects, the server still completes the generation and bills as normal. Set client-side timeouts and don't rely on "disconnect = no charge".
  </Accordion>

  <Accordion title="What are the rate limits and concurrency caps?">
    BFL caps each account at **24 active tasks**, with `flux-kontext-max` separately limited to **6**.

    APIYI pools at the gateway, so enterprise concurrency is not bound by the per-account ceiling. For explicit SLA / RPM commitments, contact our team for a dedicated quota.
  </Accordion>

  <Accordion title="Do webhook callbacks work?">
    BFL natively supports `webhook_url` + `webhook_secret`, but APIYI's OpenAI-compatible wrapper waits synchronously and **does not pass through webhook fields** — you don't need to poll, request-response is one shot. If your business genuinely needs webhooks, contact us to enable a native async channel.
  </Accordion>

  <Accordion title="Are failed requests billed?">
    **No**. `400` (param error), `403` (moderation block), `429` (rate-limited) all return errors and are not billed. **Only requests that actually enter generation (200 + `data[0].url`) are billed**.
  </Accordion>
</AccordionGroup>

## Related Docs

* [Text-to-Image Playground](/en/api-capabilities/flux/text-to-image) — `/v1/images/generations` interactive debugger
* [Image Editing Playground](/en/api-capabilities/flux/image-edit) — multi-reference fusion + edit
* [Historical Versions & Migration](/en/api-capabilities/flux/historical-versions) — FLUX.1 \[pro] / \[pro] 1.1 / Ultra / \[dev]
* [API Manual](/en/api-manual) — general usage spec
* [GPT-Image-2 Overview](/en/api-capabilities/gpt-image-2/overview) — OpenAI flagship, supports 4K
* [Seedream Overview](/en/api-capabilities/seedream-image/overview) — BytePlus partnership channel

<Info>
  FLUX is BFL's first-party model family, leading the industry in hex color precision, typography fidelity, and long-prompt understanding. If you prioritize OpenAI ecosystem compatibility, see [GPT-Image-2](/en/api-capabilities/gpt-image-2/overview); for Chinese-language scenarios, see [Seedream](/en/api-capabilities/seedream-image/overview).
</Info>
