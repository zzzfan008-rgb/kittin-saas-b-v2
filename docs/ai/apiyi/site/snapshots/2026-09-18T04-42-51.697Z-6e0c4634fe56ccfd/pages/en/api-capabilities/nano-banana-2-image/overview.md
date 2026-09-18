> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana 2 Image Gen/Editing

> Google's latest image generation model Nano Banana 2 (gemini-3.1-flash-image-preview) - Pro-level quality at Flash-tier speed, 4K output, 14 aspect ratios, Image Search Grounding, per-call $0.055/image, token-based from $0.025/image.

## Overview

**Nano Banana 2** (codename) is Google's latest image generation model released on February 26, 2026, with model ID `gemini-3.1-flash-image-preview`. It redefines image generation cost-effectiveness with **Pro-level quality at Flash-tier speed and cost**, making it the latest flagship of the Nano Banana series.

<Note>
  **🔥 Released February 26, 2026**: Nano Banana 2 is live! Pro-level quality, Flash-tier speed, token-based billing as low as 36% of Google's pricing! 512px from just \$0.025/image! Supports 4K output, 14 aspect ratios, Image Search Grounding, and more exclusive features.
</Note>

<Note>
  **🆕 Update May 29, 2026 (`-preview` dropped)**: Google updated its official docs and released the stable model name **`gemini-3.1-flash-image`** (without `-preview`). APIYI already supports it.

  * **The old name still works**: `gemini-3.1-flash-image-preview` keeps working as usual, **pricing unchanged**, no code changes needed.
  * **Both names work**: use either the new `gemini-3.1-flash-image` or the original `-preview` name.

  Heads-up: Google hasn't clarified whether the stable version differs from the preview in output quality, safety filtering, or other behavior. We welcome you to test and share feedback.
</Note>

<Info>
  All image APIs are **synchronous** — there is no task ID to poll, and if your client disconnects the result is lost while the request is still billed. Set a generous timeout for this model; see [Image API Essentials & Best Practices](/en/api-capabilities/image-api-best-practices).
</Info>

<CardGroup cols={2}>
  <Card title="Text-to-Image API" icon="wand-sparkles" href="/en/api-capabilities/nano-banana-2-image/text-to-image">
    Generate images from text prompts. Includes an interactive playground for online testing.
  </Card>

  <Card title="Image Editing API" icon="image" href="/en/api-capabilities/nano-banana-2-image/image-edit">
    Upload an image + edit instructions to generate new images. Includes an interactive playground.
  </Card>
</CardGroup>

## Let an AI Agent Do the Integration

<Note>
  If you build with Codex / Claude Code / Cursor, copy the prompt below and hand it to your agent. It first fetches the plain-text version of this page (append `.md` to any docs URL), then writes code in your project's own stack — timeout, defensive `parts` parsing, upload compression and the resolution parameters are already baked into the requirements.
</Note>

<Prompt description="Have a coding agent integrate or troubleshoot Nano Banana 2 text-to-image and image editing. Copy and paste into Codex, Claude Code, Cursor and similar tools." icon="bot" actions={["copy"]}>
  Integrate / troubleshoot Nano Banana 2 (`gemini-3.1-flash-image`) text-to-image and image editing in this project.

  Read the docs before you touch code: fetch [https://docs.apiyi.com/en/api-capabilities/nano-banana-2-image/overview.md](https://docs.apiyi.com/en/api-capabilities/nano-banana-2-image/overview.md) for the plain-text version of this page. For finer parameter detail, append `.md` to the text-to-image and image-edit pages the same way.

  Requirements:

  1. Timeout: call the Gemini-native format at `POST https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image:generateContent` and raise the client timeout to 360 seconds. The image APIs are synchronous — there is no task ID, so if the client disconnects the result is lost while the request is still billed. Reverse proxies, gateways and serverless execution limits all need widening too: any layer shorter than the generation time will cut the request off. On Node, note that undici has three independent timeout settings that the SDK `timeout` option does not cover.

  2. Parsing the response (**the single easiest thing to get wrong**): the image is base64, under `inlineData.data` inside `candidates[0].content.parts[]`. But `parts` is a **heterogeneous array whose length and order are not guaranteed** — a text part may come first, putting the image at index 1 instead of 0. This model is especially prone to that because it can return its reasoning text. So **never hardcode `parts[0]` or `parts[1]`**; flipping between the two does not fix it. The correct approach: iterate `parts`, filter for every entry that has `inlineData`, and take the **last** one (complex tasks return several intermediate drafts, and only the last is final). Read `mimeType` from the response too rather than assuming `image/png`. Then render the image and offer a save-to-disk action.

  3. Compress before upload: for edits you pass reference images as base64 inside `inlineData`. Compress first — only process files above 1.5MB, scale the long edge down to 2048px keeping the aspect ratio (never upscale a small image), re-encode at quality 0.9 and keep the original format. Keep the combined size under 6MB for multi-image requests. The hard limits are 7MB per image and at most 14 images per request; base64 encoding then inflates that by roughly a third, so aim to keep each image under 5MB for headroom. If one image fails to compress, fall back to the original and carry on. Also note: **a single part may contain either `text` or `inlineData`, never both** — the correct structure is one text part plus N image parts.

  4. Resolution parameters: **always send** `generationConfig.imageConfig.imageSize` (`512` / `1K` / `2K` / `4K`, default `1K`) and `aspectRatio` (this page lists the 14 legal ratios). Under pay-as-you-go billing the **resolution directly sets the unit price**, so relying on the default makes cost unpredictable. Expose both as dropdowns in your UI. Also: in code always use the model name `gemini-3.1-flash-image` and **not the variant with the `-4k` suffix** (that one exists for chat clients); to get 4K, just set `imageSize` accordingly. This model does not support Google Search grounding via `tools`, so do not send it.

  5. Error handling: when content moderation blocks a request the HTTP status is still 200, but `candidates[0].content.parts` comes back empty. Check `candidatesTokenCount` for 0 first, then check whether `finishReason` is anything other than `STOP`. Blocks such as `IMAGE_SAFETY` are **not billed**, and retrying the identical input once or twice often succeeds — build that automatic retry in.

  6. Read the key from the `APIYI_API_KEY` environment variable and send it in the `Authorization` header with a `Bearer` prefix. Never hardcode it, never commit it to git.

  7. When you are done, actually run one text-to-image call and one image-edit call, then show me the results and what those two calls cost.
</Prompt>

<Accordion title="What this prompt saves you from">
  | Requirement                         | Pitfall it prevents                                                                                                                                                                                                                     |
  | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | Never hardcode a `parts` index      | Length and order are not guaranteed, so a fixed index fails intermittently; this model returns reasoning text, which readily pushes the image to index 1. See [Nano Banana Developer Guide](/en/api-capabilities/nano-banana-dev-guide) |
  | Take the last image part            | Complex edit tasks return several intermediate drafts; only the last one is final                                                                                                                                                       |
  | Always send `imageSize`             | Under pay-as-you-go billing resolution sets the unit price, so defaults make cost unpredictable                                                                                                                                         |
  | Model name without the `-4k` suffix | The suffixed name exists for chat clients; API calls are more stable on the plain name                                                                                                                                                  |
  | Compress before upload              | The hard cap is 7MB per image and base64 inflates that by roughly a third. See [Image Compression & Output Resolution](/en/api-capabilities/image-compression-resolution)                                                               |
  | Auto-retry on `IMAGE_SAFETY`        | A moderation block returns 200 with no image and is not billed; an identical retry often passes. See [Gemini Image Error Handling](/en/api-capabilities/gemini-image-error-handling)                                                    |
</Accordion>

## Why APIYI's Nano Banana 2?

**Nano Banana Pro / 2 is the #1 model by usage volume on APIYI** — stable, reliable, and fast. If you want to work with a professional team, APIYI is the right choice.

A freshly released Google flagship still capacity-constrained at the source — APIYI deeply optimizes the experience across **reliability**, **cost**, and **integration**:

<CardGroup cols={2}>
  <Card title="Official Channel · Same as Gemini" icon="shield-check">
    100% compatible with Google's native Gemini API (`/v1beta/models/.../generateContent`) and the OpenAI SDK pattern — same request body, response fields, and error codes. Zero-code migration.
  </Card>

  <Card title="No Concurrency Limits" icon="infinity">
    Not bound by Google AI Studio's RPM/RPD ceilings. Enterprise-scale batch generation and peak traffic scale linearly without quota interruptions.
  </Card>

  <Card title="28-36% of Google's List Price" icon="percent">
    \$0.055/image per-call (vs Google \$0.151), 512px from \$0.025/image token-based (vs \$0.045). Stack with [top-up bonuses](/en/faq/recharge-promotions) for as low as 30.3% of the list.
  </Card>

  <Card title="Global Zero-Barrier Access" icon="globe">
    **No overseas server or proxy required** — connect directly to `api.apiyi.com` from mainland data centers, residential networks, or overseas nodes. Stable latency, no cross-border re-architecture.
  </Card>

  <Card title="Full Model Lineup" icon="layers">
    Same series covers [Nano Banana Pro](/en/api-capabilities/nano-banana-image/overview) (ultimate quality), Nano Banana 2 (best value), and the legacy Nano Banana — mix and match per scenario.
  </Card>

  <Card title="Professional Enterprise Support" icon="handshake">
    Our team specializes in production image-generation deployments, with deep experience in model selection, tuning, and integration — end-to-end support from PoC to production.
  </Card>
</CardGroup>

## Core Features

<CardGroup cols={2}>
  <Card title="Pro-Level Quality" icon="sparkles">
    Vibrant lighting, rich textures, sharp details - quality rivaling Nano Banana Pro at much faster speeds
  </Card>

  <Card title="4K Ultra-HD Output" icon="expand">
    Supports 512px, 1K, 2K, 4K resolutions, up to 4096×4096
  </Card>

  <Card title="14 Aspect Ratios" icon="maximize">
    New additions: 1:4, 4:1, 1:8, 8:1 - total 14 aspect ratios covering more use cases
  </Card>

  <Card title="Image Search Grounding" icon="search">
    Nano Banana 2 exclusive - pulls visual context from Google Image Search
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="Accurate Text Rendering" icon="type">
    Clear, legible text in images with multilingual support - perfect for posters and marketing materials
  </Card>

  <Card title="Multi-turn Editing" icon="message-circle">
    Conversational image editing with iterative refinement through chat
  </Card>

  <Card title="Thinking Mode" icon="brain">
    Configurable minimal or high thinking levels for more precise complex prompt handling
  </Card>

  <Card title="Subject Consistency" icon="users">
    Maintains resemblance across up to 5 characters and 14 reference objects
  </Card>
</CardGroup>

## Version Comparison

| Feature                | **Nano Banana 2**                | Nano Banana Pro              | Nano Banana              |
| ---------------------- | -------------------------------- | ---------------------------- | ------------------------ |
| Model ID               | `gemini-3.1-flash-image-preview` | `gemini-3-pro-image-preview` | `gemini-2.5-flash-image` |
| Quality                | ⭐⭐⭐⭐⭐ Pro-level                  | ⭐⭐⭐⭐⭐ Highest                | ⭐⭐⭐⭐ Excellent           |
| Speed                  | 🚀 Fastest                       | 🐢 Slower                    | ⚡ Fast                   |
| Max Resolution         | 4K                               | 4K                           | 1K                       |
| Aspect Ratios          | 14                               | 10                           | 10                       |
| Image Search Grounding | ✅ Exclusive                      | ❌                            | ❌                        |
| APIYI Pricing          | **\$0.055/image (per-call)**     | \$0.09/image                 | \$0.02/image             |
| Status                 | Preview                          | Preview                      | GA                       |

<Tip>
  **Selection Guide**:

  * 🔥 **Best Value** → Nano Banana 2 (token-based from \$0.025/image, Pro-level quality + Flash-tier speed)
  * 🎨 **Ultimate Quality** → Nano Banana Pro (\$0.09/image, highest fidelity)
  * ⚡ **Lowest Cost** → Nano Banana (\$0.025/image, fast and stable)
</Tip>

## Pricing

<Info>
  **Billing Mode Selection**: Nano Banana 2 supports two billing modes, selected via the "Billing model" setting when creating your API token:

  * Select **Pay-as-you-go** or **Pay-as-you-go Priority** → Token-based billing
  * Select **Pay-per-request** or **Pay-per-request Priority** → Per-call billing (same as Nano Banana Pro)
  * ⚠️ **Do NOT select Hybrid billing**
</Info>

### Per-call Billing

| Model                                              | APIYI Pricing     | Google Official 4K      | Discount         |
| -------------------------------------------------- | ----------------- | ----------------------- | ---------------- |
| **Nano Banana 2** `gemini-3.1-flash-image-preview` | **\$0.055/image** | \$0.151/image           | **🔥 \~64% off** |
| Nano Banana Pro `gemini-3-pro-image-preview`       | \$0.09/image      | \$0.24/image            | **\~63% off**    |
| Nano Banana `gemini-2.5-flash-image`               | \$0.02/image      | \$0.039/image (1K only) | \~50% off        |

<Tip>
  **Enterprise HA Channel**: NanoBananaEnterprise is available at 1.4x the standard Nano Banana Pro rate (\$0.126/image), offering a dedicated high-availability fallback for enterprise workloads.
</Tip>

### Token-based Billing (Nano Banana 2 Exclusive)

| Billing Item                     | Google Official             | APIYI           | Discount |
| -------------------------------- | --------------------------- | --------------- | -------- |
| Input                            | \$0.50/M tokens             | \$0.18/M tokens | **36%**  |
| Output (images and text unified) | Images \$60/M, Text \$1.5/M | \$21.6/M tokens | **36%**  |

### Token-based Billing Price Estimates

| Resolution | Google Official | APIYI         | Fal AI |
| ---------- | --------------- | ------------- | ------ |
| 512px      | \$0.045         | **\~\$0.025** | \$0.06 |
| 1K         | \$0.067         | **\~\$0.035** | \$0.08 |
| 2K         | \$0.101         | **\~\$0.045** | \$0.12 |
| 4K         | \$0.151         | **\~\$0.07**  | \$0.16 |

<Tip>
  **💰 Token-based billing saves more!** With token-based billing, 512px images from just \$0.025 — only 36% of Google's pricing! For low-resolution use cases, this is much cheaper than per-call billing (\$0.055/image). For 4K, token-based pricing (\~\$0.07) is even cheaper than per-call billing, and both are far below Google's official \$0.151/image. Combined with top-up bonuses, actual costs are even lower.
</Tip>

## Three parameters that affect billing

The figures below come from live testing against the production gateway on 2026-08-27 (12–20 runs per condition, all based on actual charges recorded in the console rather than estimates). Their impact on your bill differs by two orders of magnitude, so optimise in the order shown.

| Parameter                      | Impact per call                            | Worth tuning?        |
| ------------------------------ | ------------------------------------------ | -------------------- |
| `imageConfig.imageSize`        | 1K \$0.033 → 4K \$0.064, **+90%**          | ✅ Biggest lever      |
| `thinkingConfig.thinkingLevel` | Default \$0.033 → `high` \$0.052, **+54%** | ✅ Enable when needed |
| `responseModalities`           | −2.8%, not statistically significant       | ❌ Saves nothing      |

### thinkingLevel: the default already is minimal, and high costs half as much again

`gemini-3.1-flash-image` supports thinking-level control (Pro does not). Same prompt, 20 runs each:

| Setting           | Mean output tokens | `thoughtsTokenCount` | Charge per call | Median latency |
| ----------------- | ------------------ | -------------------- | --------------- | -------------- |
| Omitted (default) | 1548.7             | field absent         | \$0.0335        | 13.3s          |
| `minimal`         | 1546.0             | field absent         | \$0.0334        | 13.6s          |
| `high`            | 1557.5             | median 784.5         | **\$0.0516**    | 20.7s          |

* **The default is identical to `minimal`** — statistically indistinguishable (p=0.64), so passing `minimal` explicitly gains nothing.
* Only at `high` does `thoughtsTokenCount` appear as its own field, and it is **folded into `completion_tokens` and billed at the image rate**.
* **Complex prompts only cost more once `high` is on**: at the default level, a 3-token prompt and a 98-token reasoning prompt produced no significant difference in output tokens (p=0.37); with `high`, the reasoning prompt used **126% more** thinking tokens and cost **38% more** per call.

<Tip>
  Leave this parameter alone for everyday generation. Enable `high` only when you have hard requirements on composition logic, in-image text layout, or chart proportion accuracy — at the cost of +54% spend and +55% latency.
</Tip>

### Google Search grounding: works, but billed per search query

For images that need live information to be correct (weather cards, market charts, event posters), attach the `googleSearch` tool. Grounding triggered in 12/12 runs.

```json theme={null}
{
  "contents": [{ "parts": [{ "text": "A weather card poster for Tokyo today" }] }],
  "tools": [{ "googleSearch": {} }]
}
```

**Output tokens are barely affected** (−2.1% versus the no-tool control once the search fee is removed, not significant); the entire cost comes from the search calls themselves at **\$0.014 each**.

| Condition          | Grounding triggered | Median queries | Charge per call    |
| ------------------ | ------------------- | -------------- | ------------------ |
| No tool            | 0/12                | 0              | \$0.036            |
| `googleSearch: {}` | 12/12               | 2              | **\$0.062 (+73%)** |

<Warning>
  **The model decides how many searches to run; you cannot set it in advance.** In testing a single image request issued 1–3 queries on its own, so with this tool enabled the per-call cost is a range of **\$0.050–\$0.078**, not a fixed number. Budget against the upper bound.
</Warning>

### Image Search grounding: exclusive to Nano Banana 2, and currently free

`searchTypes.imageSearch` lets the model pull visual references from Google Image Search — useful for "make a collage from real photos" or "draw this from the actual object".

```json theme={null}
{
  "tools": [{ "googleSearch": { "searchTypes": { "imageSearch": {} } } }]
}
```

| Condition           | Grounding triggered | Search fee charged | Charge per call |
| ------------------- | ------------------- | ------------------ | --------------- |
| No tool             | 0/12                | 0/12               | \$0.036         |
| `imageSearch` alone | 7/12                | **0/12**           | **\$0.032**     |

* Confirmed by `imageSearchQueries` appearing in `groundingMetadata`, with values like `["current weather in Tokyo"]`.
* **No extra charge at present** — the per-call cost even came in slightly below the no-tool control.
* It triggered in 7 of 12 runs: **the model decides whether to search**, it does not query every time.
* Web search and image search **can be enabled together**, but the model chooses which to use, so the cost becomes unpredictable.

<Warning>
  **`searchTypes` must be an object, not an array.**

  ✅ `{"searchTypes": {"imageSearch": {}}}` — works

  ❌ `{"searchTypes": ["imageSearch"]}` — **no error, returns 200, and you still get an image, but image search never triggers once.** Nothing in the response body reveals it. The upstream error for the array form is `Proto field is not repeating, cannot start list`.
</Warning>

### responseModalities: saves nothing, but removes unwanted text

`responseModalities: ["IMAGE"]` declares that you only want images. 20 runs each:

| Setting            | Mean output tokens | Charge per call |
| ------------------ | ------------------ | --------------- |
| Omitted (default)  | 1548.7             | \$0.0335        |
| `["IMAGE"]`        | 1535.0             | \$0.0332        |
| `["TEXT","IMAGE"]` | 1542.8             | \$0.0333        |

* **All three are within 1% of each other**, and `["TEXT","IMAGE"]` is exactly equivalent to omitting the field (p=0.90).
* With ordinary generation prompts, **60/60 responses already contained a single image part and no text at all**, so the modality switch has nothing to act on. Only reasoning prompts (infographics, data charts) attach a summary paragraph roughly a third of the time; there `["IMAGE"]` suppresses it and saves about **2.8%** (p=0.09, not significant).

<Info>
  **Why there is nothing to save**: output tokens are not "image + text" but **1120 for the image plus roughly 400 tokens of invisible overhead**. That overhead appears in no field of `candidatesTokensDetails`, yet it **is billed at full rate and accounts for 28% of the per-call charge**, and it does not vary with prompt length. The text is negligible next to it.

  So estimating per-image cost from 1120 tokens **understates it by about 28%** — reconcile against `candidatesTokenCount` or `totalTokenCount` instead.
</Info>

## Group Setup

Nano Banana 2 ships with two groups on APIYI. Switch in dashboard → **Token Settings**:

| Group                  | Rate | When to use                                                                                       |
| ---------------------- | ---- | ------------------------------------------------------------------------------------------------- |
| `Default`              | 1.0x | Base lane, matches the price table; recommended default                                           |
| `NanoBananaEnterprise` | 1.4x | Fallback lane — manually switch when the default is tight or timeouts spike, capacity-prioritized |

**Why 1.4x?** Even at 1.4x, the price is still around 50% of Google's list — far below official pricing. This is a fallback lane for higher-concurrency workloads and unexpected upstream risk-control events, providing high-availability guarantees for enterprise customers. When the default group is tight, switch your Token to `NanoBananaEnterprise` to ride out the spike.

**Recommended Billing model**: pick `Pay-as-you-go Priority` — covers Nano Banana 2's token-based billing AND Nano Banana Pro's per-call billing, **one Token for the whole series**.

<Frame caption="Token settings: Billing model = Pay-as-you-go Priority, primary group = Default, fallback group = NanoBananaEnterprise (1.4x)">
  <img src="https://mintcdn.com/apiyillc/EyWjOyg5fLaMGReJ/images/nano-banana-enterprise-token-setup-20260506.png?fit=max&auto=format&n=EyWjOyg5fLaMGReJ&q=85&s=cf85cd8ddaaa541ebbd970a52a98c68f" alt="Token creation UI: Billing model 'Pay-as-you-go Priority' covers NB2 token-based + NB Pro per-call; primary group Default + fallback group NanoBananaEnterprise (1.4x lane)" width="1270" height="1052" data-path="images/nano-banana-enterprise-token-setup-20260506.png" />
</Frame>

<Tip>
  **Going further**: if your Token also covers other image models (e.g. GPT-image-2), keep the more stable `Default` as the primary group and put `NanoBananaEnterprise` in the fallback slot — 429s on the primary will auto-failover to the enterprise group without a token swap.
</Tip>

## Supported Resolutions & Aspect Ratios

### Output Resolutions

| Resolution | Description           | Recommended Use                         |
| ---------- | --------------------- | --------------------------------------- |
| 512px      | Low resolution        | Thumbnails, quick previews              |
| 1K         | Default               | Social media, web display               |
| 2K         | High definition       | HD displays, print materials            |
| 4K         | Ultra-high definition | Professional design, commercial posters |

### Supported Aspect Ratios (14 total)

`1:1`, `1:4`, `4:1`, `1:8`, `8:1`, `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9`

### Output Dimensions per Aspect Ratio (pixels)

The table below lists Nano Banana 2's actual output dimensions for all 14 aspect ratios across the 512px / 1K / 2K / 4K resolution tiers (source: Google official docs). In your request, set `aspect_ratio` for the ratio and `image_size` (or `resolution`) for the tier:

| Aspect Ratio | 512px    | 1K        | 2K        | 4K         |
| ------------ | -------- | --------- | --------- | ---------- |
| **1:1**      | 512×512  | 1024×1024 | 2048×2048 | 4096×4096  |
| **1:4**      | 256×1024 | 512×2048  | 1024×4096 | 2048×8192  |
| **1:8**      | 192×1536 | 384×3072  | 768×6144  | 1536×12288 |
| **2:3**      | 424×632  | 848×1264  | 1696×2528 | 3392×5056  |
| **3:2**      | 632×424  | 1264×848  | 2528×1696 | 5056×3392  |
| **3:4**      | 448×600  | 896×1200  | 1792×2400 | 3584×4800  |
| **4:1**      | 1024×256 | 2048×512  | 4096×1024 | 8192×2048  |
| **4:3**      | 600×448  | 1200×896  | 2400×1792 | 4800×3584  |
| **4:5**      | 464×576  | 928×1152  | 1856×2304 | 3712×4608  |
| **5:4**      | 576×464  | 1152×928  | 2304×1856 | 4608×3712  |
| **8:1**      | 1536×192 | 3072×384  | 6144×768  | 12288×1536 |
| **9:16**     | 384×688  | 768×1376  | 1536×2752 | 3072×5504  |
| **16:9**     | 688×384  | 1376×768  | 2752×1536 | 5504×3072  |
| **21:9**     | 792×168  | 1584×672  | 3168×1344 | 6336×2688  |

<Info>
  Compared to Nano Banana Pro's 10 aspect ratios, Nano Banana 2 adds `1:4`, `4:1`, `1:8`, `8:1` - ultra-tall/ultra-wide ratios ideal for long-form images and infographics. It is also the only model with a 512px low-resolution tier, great for thumbnails and quick previews.
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="What's the difference between Nano Banana 2 and Nano Banana Pro?">
    **Nano Banana 2** (`gemini-3.1-flash-image-preview`) is based on Gemini 3.1 Flash, while **Nano Banana Pro** (`gemini-3-pro-image-preview`) is based on Gemini 3 Pro. Key differences:

    * ✅ **Speed**: Nano Banana 2 is faster (Flash-tier speed)
    * ✅ **Price**: Nano Banana 2 token-based billing is cheaper (from \$0.025 vs \$0.09)
    * ✅ **Aspect Ratios**: Nano Banana 2 supports 14 (4 more)
    * ✅ **Image Search Grounding**: Nano Banana 2 exclusive
    * ⚠️ **Ultimate Quality**: Nano Banana Pro still slightly better
  </Accordion>

  <Accordion title="Should I switch from Nano Banana Pro to Nano Banana 2?">
    **Recommended!** Nano Banana 2 offers near-Pro-level quality at a lower price with faster speed. Unless you have extreme quality requirements, Nano Banana 2 is the better choice.

    Simply change the model name from `gemini-3-pro-image-preview` to `gemini-3.1-flash-image-preview`.
  </Accordion>

  <Accordion title="Should I use gemini-3.1-flash-image-preview or the -4k suffix version?">
    **For code / API calls, we recommend always using the general model name `gemini-3.1-flash-image-preview` (without the `-4k` suffix), not `gemini-3.1-flash-image-preview-4k`.**

    * **The official name has no `-4k`**: Google's official model name is `gemini-3.1-flash-image-preview`. This is also the general channel we invest the most resources in maintaining, so it offers the best stability and compatibility.
    * **Where `-4k` comes from**: `gemini-3.1-flash-image-preview-4k` was originally a configuration prepared for "chat-to-image" scenarios in conversational clients like Chatbox—generating images directly through chat in a messaging UI.
    * **Code + Gemini native format favors the general name**: If you're calling via code using the Gemini native format (`/v1beta/models/.../generateContent`), the regular model name `gemini-3.1-flash-image-preview` is more stable.

    When you need 4K output, there's no need to rely on the `-4k` model name—just specify the 4K resolution in your request parameters (see "Supported Resolutions and Aspect Ratios" above).
  </Accordion>

  <Accordion title="What is Image Search Grounding?">
    Image Search Grounding is a Nano Banana 2 exclusive feature. It pulls visual context from Google Image Search to generate images that better match real-world subjects. For example, when generating images of real landmarks, it can reference search results for improved accuracy.
  </Accordion>

  <Accordion title="What does Thinking Mode do?">
    Thinking Mode allows the model to reason and analyze before generating images, improving accuracy for complex prompts. Setting it to `high` produces the best results but slightly increases generation time. Best for tasks requiring precise composition, text rendering, or complex scenes.
  </Accordion>

  <Accordion title="How long does it take to generate an image?">
    Generation time depends on resolution and thinking mode:

    * **1K resolution**: \~5-10 seconds
    * **2K resolution**: \~10-15 seconds
    * **4K resolution**: \~15-25 seconds
    * Enabling high thinking mode adds a few extra seconds

    Recommend setting a longer timeout (at least 360 seconds) for occasional delays and peak congestion.
  </Accordion>

  <Accordion title="Is there a concurrency limit? Is the API serial? What if I need 20 users calling at once?">
    **The API has no concurrency limit and does not process serially.** You can safely fire concurrent requests yourself — requests don't queue or block each other. For 20 users calling simultaneously, just issue 20 concurrent requests; no extra quota request or throttling needed.

    Unlike Google AI Studio, the APIYI channel has no hard RPM/RPD limits, so enterprise batch generation and peak traffic scale linearly.

    **What actually matters is the `timeout`**: image generation (especially 4K or during peak congestion) can take a while per request, so **set your client timeout to 360 seconds** to avoid cutting off requests that are still being processed normally.

    <Tip>
      If you occasionally hit 429 (throttled due to high concurrency), add `NanoBananaEnterprise` as the fallback group on your token (see "Group Setup" above). When the primary group is saturated it auto-falls back, further improving success rates under high concurrency.
    </Tip>
  </Accordion>

  <Accordion title="What input image formats are supported?">
    Supports `image/png` and `image/jpeg` formats. Can be uploaded via base64 encoding or Files API.
  </Accordion>

  <Accordion title="Do output images have watermarks?">
    All output images carry SynthID invisible digital watermarks (Google's AI-generated content identification technology) - invisible to the naked eye and doesn't affect usage.
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

* [Nano Banana Pro Image Generation](/en/api-capabilities/nano-banana-image) - Previous flagship version
* [Nano Banana Image Editing](/en/api-capabilities/nano-banana-image-edit) - Image editing features
* [Image Generation Comparison Testing](https://imagen.apiyi.com/)
* [API Usage Manual](/en/api-manual)

<Info>
  Nano Banana 2 is currently in Preview status. Features and pricing may be adjusted. Please follow documentation updates for the latest information.
</Info>
