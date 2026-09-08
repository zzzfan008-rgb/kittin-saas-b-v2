> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-image-2 Official vs Reverse

> Compare gpt-image-2 (official) vs the reverse-engineered sister models gpt-image-2-all and gpt-image-2-vip: channel nature, pricing, endpoints, upload/output formats, speed vs quality positioning, prompt adherence — pick the right one.

## TL;DR

| If you need                                                                                                            | Pick                                                 |
| ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **`quality` knob / mask inpainting / arbitrary custom sizes (beyond the 30 presets) / strict OpenAI-API field parity** | `gpt-image-2` (Official, token-metered)              |
| **Predictable flat \$0.03/image + fast output (speed is the advantage)**                                               | `gpt-image-2-all` (Reverse, ChatGPT-web line, \~90s) |
| **Predictable flat \$0.03/image + locked sizes (30 presets incl. 4K) + sometimes higher quality (not in a hurry)**     | `gpt-image-2-vip` (Reverse, Codex line, \~120–200s)  |

All three models are **built on OpenAI's gpt-image-2 underneath**. The differences are in channel nature (official direct vs reverse-engineered), pricing model, and parameter granularity.

<Note>
  **The two reverse siblings (-all / -vip)**: This page's "Reverse" column covers **both** `gpt-image-2-all` and `gpt-image-2-vip` — they share the same call format (`-vip` additionally supports the `size` field) and the same \$0.03/image flat price. The difference now is **speed vs quality + size locking**:

  * `gpt-image-2-all`: ChatGPT web line, **\~90s** generation — **speed is the advantage**
  * `gpt-image-2-vip`: Codex line, **\~120–200s** generation — slower, but **sometimes higher quality**, and it **supports `size` locking (30 presets incl. 4K, restored since 2026-07-22)**
  * Both: no `quality`, no `n`, no mask inpainting

  For `quality` tiers, mask inpainting, or arbitrary custom sizes beyond the 30 presets, use the official `gpt-image-2`.
</Note>

<Tip>
  **About current speeds**: `-all` / `-vip` generation is **slower than at launch** due to **OpenAI upstream compute fluctuations** — this affects all reverse-channel users, not just APIYI; our account pool and ops are healthy. Set client timeouts to 300s+ and leave more headroom for complex prompts.
</Tip>

## Full Comparison Table

| Dimension                  | **gpt-image-2-all / -vip** (Reverse, cost-effective)                                                                                                                                                                                | **gpt-image-2** (Official)                                                               |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Model name**             | `gpt-image-2-all` (fastest) / `gpt-image-2-vip` (quality-first, size-locking)                                                                                                                                                       | `gpt-image-2`                                                                            |
| **Channel nature**         | `-all`: reverse-engineered ChatGPT web line<br />`-vip`: reverse-engineered Codex line                                                                                                                                              | Official direct (OpenAI Images API)                                                      |
| **Pricing**                | **Per-call**: flat \$0.03/call (both models, same price)                                                                                                                                                                            | **Token-metered**: matches official; \~**85% of list price** after APIYI deposit bonuses |
| **Typical cost/image**     | \$0.03 (regardless of size / quality / model)                                                                                                                                                                                       | Measured **\$0.03 – \$0.2** (correlates with prompt length, size, quality)               |
| **Token group**            | Default                                                                                                                                                                                                                             | Default                                                                                  |
| **Token type**             | **Per-call** or **Token-priority** both work                                                                                                                                                                                        | **Token-priority only** (this model is token-billed; per-call tokens will be rejected)   |
| **Recommended endpoint**   | **`/v1/images/generations` + `/v1/images/edits`** (more stable, more upstream supply, and same code as official — just swap the `model` name to switch during risk-control turbulence)                                              | `/v1/images/generations` + `/v1/images/edits`                                            |
| **Upload format**          | multipart file (edits endpoint)                                                                                                                                                                                                     | multipart file (edit endpoint)                                                           |
| **Output format**          | `b64_json` (default, **raw base64 with no prefix**, verified 2026-07; earlier versions included the prefix) or `url` (R2 CDN)                                                                                                       | `b64_json` (**raw base64, no prefix**)                                                   |
| **Reference image count**  | Multiple                                                                                                                                                                                                                            | **Max 16** (`image[]`)                                                                   |
| **Mask inpainting**        | ❌ Not supported                                                                                                                                                                                                                     | ✅ Supported (alpha channel required)                                                     |
| **Prompt adherence**       | Good                                                                                                                                                                                                                                | **Excellent**                                                                            |
| **Generation speed**       | `-all`: \~**90 seconds** (speed is the advantage)<br />`-vip`: \~**120–200 seconds** (slower, but sometimes higher quality)<br />📌 Currently slower than at launch — OpenAI upstream compute, not an APIYI-side issue              | \~**100-120 seconds**, complex + 4K can reach 3-5 minutes                                |
| **Quality tendency**       | `-all`: good<br />`-vip`: **sometimes higher** (Codex line, occasionally better detail)                                                                                                                                             | Stable, and `quality=high` maxes it out                                                  |
| **`size` parameter**       | `-all`: ❌ Not accepted (describe in prompt)<br />`-vip`: ✅ **Restored** (since 2026-07-22), 30 preset sizes (incl. 4K); images endpoints only, not supported on the chat endpoint                                                   | ✅ Any valid custom size                                                                  |
| **4K support**             | `-all`: ❌<br />`-vip`: ✅ 4K Detail tier (e.g. `3840x2160` / `2880x2880`), no surcharge                                                                                                                                              | ✅ Including `3840×2160`                                                                  |
| **Common output sizes**    | `-all`: 16:9 → 1672×941, 9:16 → 941×1672, 1:1 → 1254×1254 (adaptive)<br />`-vip`: 30 presets (10 ratios × 1K/2K/4K), see the [full 30-size table](/en/api-capabilities/gpt-image-2-vip/overview#supported-sizes-full-30-size-table) | 8 presets + any valid custom size                                                        |
| **`quality` parameter**    | ❌ Both reverse models reject it (do not pass)                                                                                                                                                                                       | ✅ `low` / `medium` / `high` / `auto`                                                     |
| **`n` parameter**          | ❌ Both reverse models reject it (1 image per call)                                                                                                                                                                                  | ✅ Supported                                                                              |
| **Transparent background** | ⚠️ No `background` parameter — prompt-only, occasionally unreliable                                                                                                                                                                 | ✅ Parameter-controlled and reliable — `background: "transparent"` with `png` / `webp`    |
| **Chinese prompts**        | ✅ Native                                                                                                                                                                                                                            | ✅ Native                                                                                 |
| **Text rendering**         | High fidelity                                                                                                                                                                                                                       | High fidelity (strongest at `high` tier)                                                 |
| **API docs**               | [GPT-Image-2-All Overview](/en/api-capabilities/gpt-image-2-all/overview) / [GPT-Image-2-VIP Overview](/en/api-capabilities/gpt-image-2-vip/overview)                                                                               | [GPT-Image-2 Overview](/en/api-capabilities/gpt-image-2/overview)                        |

<Info>
  🔑 **Create or manage API tokens**: [https://api.apiyi.com/token](https://api.apiyi.com/token)\
  When creating a token in the console, choose a group (`Default` is fine) and a token type (**Per-call** / **Token-priority**). **Calling `gpt-image-2` (official) requires a "Token-priority" token** — per-call tokens will be rejected due to billing-mode mismatch.
</Info>

## When to Pick Each

### Pick `gpt-image-2-all` (Reverse) when

<CardGroup cols={2}>
  <Card title="💰 Predictable cost" icon="dollar-sign">
    Stable \$0.03/image with no size/quality tier. **Ideal for batch production with hard cost ceilings** (infographics, marketing assets, e-commerce thumbnails).
  </Card>

  <Card title="⚡ Faster output" icon="bolt">
    \~90s generation — **slightly faster** than both `-vip` and the official version. **Better real-time UX.**
  </Card>

  <Card title="🔁 One codebase, swap anytime" icon="repeat">
    Standard Images API format — **same code** as `-vip` and the official-relay `gpt-image-2`; switch or fall back by changing the `model` name.
  </Card>

  <Card title="🌏 Chinese + marketing text" icon="type">
    Native Chinese prompt support, excellent text rendering for signage / posters / infographics — **great for Chinese-audience content production**.
  </Card>
</CardGroup>

### Pick `gpt-image-2-vip` (Reverse, quality-first) when

<CardGroup cols={2}>
  <Card title="🎨 Sometimes higher quality" icon="wand-sparkles">
    The Codex line's detail rendering is **occasionally better than `-all`** — for showcase images where you're not in a hurry and want a bit more quality at the same reverse-channel flat price.
  </Card>

  <Card title="⏱️ Trade time for quality" icon="hourglass">
    \~**120–200s** generation, slower than `-all` — pick it when you can accept a longer wait for a higher ceiling.
  </Card>

  <Card title="🖼️ Locked sizes / 4K" icon="expand">
    The `size` parameter is **restored** (since 2026-07-22): 30 preset sizes (10 ratios × 1K/2K/4K). E-commerce hero shots, poster templates and 4K wallpapers come out at exact dimensions — flat \$0.03/image, no 4K surcharge.
  </Card>

  <Card title="🔁 Code shared with -all" icon="copy">
    Same request structure as `-all` (just one extra `size` field) — **one codebase switches between both models** by swapping the `model` name based on your speed / quality preference.
  </Card>
</CardGroup>

<Note>
  `-vip`'s `size` only works on the `/v1/images/generations` and `/v1/images/edits` endpoints — **the `/v1/chat/completions` chat endpoint does not support `size`**. For arbitrary custom sizes beyond the 30 presets, `quality` tiers, or mask inpainting, use the official `gpt-image-2`. Availability of this parameter follows upstream changes — see [Live Updates](/en/live) for the latest status.
</Note>

### Pick `gpt-image-2` (Official) when

<CardGroup cols={2}>
  <Card title="🎚️ Quality tiers" icon="sliders-horizontal">
    `quality` supports low/medium/high/auto. **Use `low` for drafts to save cost; `high` for print-grade finals** — official-only; both reverse models reject it.
  </Card>

  <Card title="🎯 Mask inpainting" icon="paintbrush">
    Alpha-channel mask supported — **precisely modify a region while preserving the rest**. Both reverse models do not support this.
  </Card>

  <Card title="🖼️ Arbitrary custom sizes" icon="expand">
    `size` accepts **any valid resolution** (including 4K), not limited to presets. `-vip` only supports 30 preset sizes — **anything beyond those 30 goes official**.
  </Card>

  <Card title="🔌 Same as OpenAI Official" icon="plug">
    Goes through the official Images API — fields and behavior identical to OpenAI official. **Existing OpenAI-SDK-based code / systems migrate with zero changes** and stay stable long-term.
  </Card>
</CardGroup>

## Key Differences in Detail

### 1. b64\_json format gotcha (migration trap!)

As verified in July 2026, both models now return **raw base64 (no `data:` prefix)** — but `gpt-image-2-all` used to include the prefix, so the safest shared code checks for it first:

```python theme={null}
# Universal pattern: detect the prefix before processing — works for both models
b64 = resp["data"][0]["b64_json"]
if b64.startswith("data:"):          # handles historical prefixed responses
    b64 = b64.split(",", 1)[1]
with open("out.png", "wb") as f:
    f.write(base64.b64decode(b64))   # ✅ write file
img_tag = f'<img src="data:image/png;base64,{b64}">'  # ✅ browser render
```

<Warning>
  When switching between the two, **the `b64_json` handling code must change**, or you'll get a corrupted data URL or a decode failure.
</Warning>

### 2. Resolution control

**gpt-image-2-all** (in the prompt):

```
"Landscape 16:9 cinematic, old lighthouse at sunset"   → ~1672×941
"Portrait 9:16 phone wallpaper, cyberpunk city"        → ~941×1672
"1024×1024 square logo, minimalist cat line art"        → ~1254×1254
```

**gpt-image-2-vip** (`size` restored, since 2026-07-22):

Accepts **30 preset sizes** (10 ratios × 1K/2K/4K) — pass `size: "WIDTHxHEIGHT"` directly (must be one of the 30 presets; full list in the [30-size table](/en/api-capabilities/gpt-image-2-vip/overview#supported-sizes-full-30-size-table)):

```python theme={null}
client.images.generate(
    model="gpt-image-2-vip",
    prompt="...",
    size="3840x2160"    # ✅ one of the 30 presets; images endpoints only (not chat)
)
```

**gpt-image-2** (`size` parameter strict + `quality` tiers):

```python theme={null}
client.images.generate(
    model="gpt-image-2",
    prompt="...",
    size="2048x1152",   # ✅ output exactly this
    quality="high"      # official-only
)
```

### 3. Upload / output format differences

| Operation              | gpt-image-2-all                                                                                                                | gpt-image-2                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| **Upload reference**   | multipart `image` file field (edits endpoint)                                                                                  | multipart `image[]` file field               |
| **Download output**    | Default `b64_json` (raw base64, verified 2026-07); explicit `response_format: "url"` returns an R2 CDN link (**24h validity**) | `b64_json` (**raw base64**, requires decode) |
| **Multi-image fusion** | Repeat the `image` field on the edits endpoint                                                                                 | `image[]` array, **max 16**                  |

### 4. Cost ballpark

| Scenario                  | gpt-image-2-all / -vip                                         | gpt-image-2                                           |
| ------------------------- | -------------------------------------------------------------- | ----------------------------------------------------- |
| 1024×1024 draft           | \$0.03                                                         | \~\$0.006 (low)                                       |
| 1024×1024 medium quality  | \$0.03                                                         | \~\$0.053 (medium)                                    |
| 1024×1024 high quality    | \$0.03                                                         | \~\$0.211 (high)                                      |
| 2048×1152 high quality    | \$0.03                                                         | \~\$0.20+ (token-metered)                             |
| 3840×2160 4K high quality | \$0.03 (`-vip` 4K Detail tier, no surcharge; `-all` has no 4K) | Token-metered, **significantly higher than 1K**       |
| Edit / multi-image fusion | \$0.03                                                         | Input tokens rise sharply, single call can hit \$0.1+ |

<Info>
  **Bottom line**: For batch / low-quality workloads, the reverse channel isn't always cheaper (1K low is actually less expensive on the official tier). The **mid-to-high quality range** is the reverse channel's \$0.03 sweet spot. Pick official (token-metered) when you need **`quality` tiers / mask inpainting / locked sizes, 4K / strict OpenAI-API field parity**.
</Info>

## Client Settings

| Setting                    | gpt-image-2-all / -vip                                                    | gpt-image-2                                                  |
| -------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------ |
| **Timeout (conservative)** | `-all`: **300s** (typical \~90s)<br />`-vip`: **300s** (typical 120–200s) | **360s** (4K high quality realistically reaches 3-5 minutes) |
| **Retry strategy**         | Exponential backoff on 5xx / timeout, max 2 retries                       | Same                                                         |
| **Concurrency**            | 1 image per call — issue parallel requests for multiple                   | 1 image per call — issue parallel requests for multiple      |
| **Request ID**             | `request-id` response header                                              | `x-request-id` response header                               |

<Tip>
  **Common to all three models: for image edit / multi-image fusion, compress each input image to under 1.5MB** (JPEG quality 80-90 / down-sized resolution). Sporadic `shell_api_error` / `Unknown error` responses are most often triggered by oversized inputs — compressing measurably improves success rate and latency. **Output resolution is independent of input size** — quality is set on the output side (`size` + `quality` for official; the `size` tier for `-vip`; prompt phrasing for `-all`), not by input file size.
</Tip>

## FAQ

<AccordionGroup>
  <Accordion title="Should I compress input images? Does writing 4K / 8K in the prompt help?">
    **Yes, strongly recommended.** For all three models, compress each input image to **under 1.5MB** (JPEG quality 80-90 / down-sized resolution): sporadic `shell_api_error` / `Unknown error` responses are most often triggered by oversized inputs, and compressing measurably improves success rate and latency.

    **Don't worry about compression hurting quality** — output resolution is independent of input size. The "output-side" controls differ across the three:

    * `gpt-image-2-all`: controlled by prompt composition phrasing (see the verified phrasing table on the [-all overview page](/en/api-capabilities/gpt-image-2-all/overview)) — `4K` / `8K` in the prompt does not count
    * `gpt-image-2-vip`: controlled by the `size` field (30 preset sizes incl. 4K, restored since 2026-07-22) — `4K` / `8K` in the prompt does not count either
    * `gpt-image-2`: controlled by `size` + `quality` (any valid size)

    Bottom line: shrinking inputs only speeds things up — quality is set by output-side configuration, not input file size.
  </Accordion>

  <Accordion title="Can the same API Key call all three models?">
    Yes. All three run on the Default channel — the same API Key calls them with no extra config. Note: calling `gpt-image-2` (official) requires a "Token-priority" token; `-all` / `-vip` accept either token type.
  </Accordion>

  <Accordion title="Which endpoints should I use on the reverse channel?">
    **Use the OpenAI Images API** (`/v1/images/generations` for text-to-image + `/v1/images/edits` for editing), for two reasons:

    1. **More stable**: upstream resource supply for the Images API channel is more plentiful, so call success rates are higher
    2. **Compatible with the official relay for easy switching**: the call method and parameter format are fully compatible with the official-relay `gpt-image-2` — if the reverse channel hits risk-control turbulence, **just swap the `model` name to switch to the official relay** with zero code changes

    There is also a chat-based endpoint (`/v1/chat/completions`, **no longer recommended**), only useful for multi-turn iterative editing or passing online image URLs directly. Note that when the image intent is ambiguous, it may return plain text instead of an image (prepend a fixed prefix like "Generate an image:" to reinforce it). For full parameters, see the [-all chat-based API reference](/en/api-capabilities/gpt-image-2-all/chat-completions) / [-vip chat-based API reference](/en/api-capabilities/gpt-image-2-vip/chat-completions).
  </Accordion>

  <Accordion title="Within the reverse channel, -all vs -vip — which to pick?">
    Both are reverse-engineered channels at the same flat price (\$0.03/image), with the same call format (`-vip` additionally supports `size` locking). The difference is **speed vs quality + size locking**:

    * **Generation time**: `-all` \~90s — **speed is the advantage**; `-vip` \~120–200s. Currently slower than at launch due to OpenAI upstream compute fluctuations
    * **Quality**: `-vip` (Codex line) detail rendering is **sometimes higher** — for showcase images when you're not in a hurry
    * **Size locking**: `-vip` supports 30 preset `size` values (incl. 4K); `-all` rejects `size` — composition goes into the prompt

    Decision: want fast output → `-all`; quality-first or need locked sizes / 4K → `-vip`; need custom sizes beyond the 30 presets, `quality` tiers, or mask → official `gpt-image-2`. See the [GPT-Image-2-VIP Overview](/en/api-capabilities/gpt-image-2-vip/overview) for details.
  </Accordion>

  <Accordion title="I need locked sizes / 4K — what now?">
    Start with `gpt-image-2-vip`: its `size` parameter was restored on 2026-07-22 and supports **30 preset sizes (10 ratios × 1K/2K/4K)** at a flat \$0.03/image with no 4K surcharge. Note that `size` only works on the images endpoints and must be one of the 30 presets.

    Go official (`gpt-image-2`, token-metered) when you need **any valid size beyond the 30 presets**, **`quality` tiers** (low/medium/high/auto), **mask inpainting** (alpha-channel mask), or **strict OpenAI-API field parity** (zero-change migration for existing OpenAI-SDK code).
  </Accordion>

  <Accordion title="Migrating from 1.5 — which one should I pick?">
    * **Stick with the OpenAI SDK / must match OpenAI official, or need custom sizes beyond the 30 presets**: pick `gpt-image-2` (official). Drop `input_fidelity` and leave the rest unchanged (`background: transparent` keeps working).
    * **Cut cost, want fast output**: pick `gpt-image-2-all` (reverse, \~90s).
    * **Cut cost, quality-first or need locked sizes / 4K**: pick `gpt-image-2-vip` (reverse, \~120–200s, 30 preset sizes incl. 4K).
  </Accordion>

  <Accordion title="Can I deploy multiple models for failover?">
    Yes. A common pattern: **primary `-all` or `-vip`** (predictable cost — pick by speed / quality preference), **fallback `gpt-image-2`** (switch when you need `quality` tiers, mask, or custom sizes beyond the 30 presets). The reverse and official response shapes differ — normalize at the business layer.
  </Accordion>

  <Accordion title="The R2 CDN image link is slow — what can I do?">
    See [Slow CDN downloads — what to do](/en/faq/cdn-download-slow)
  </Accordion>
</AccordionGroup>

## Related Docs

* [GPT-Image-2 Overview](/en/api-capabilities/gpt-image-2/overview) - Full official integration docs
* [GPT-Image-2-All Overview](/en/api-capabilities/gpt-image-2-all/overview) - Reverse ChatGPT-web line (fastest output) full integration docs
* [GPT-Image-2-VIP Overview](/en/api-capabilities/gpt-image-2-vip/overview) - Reverse Codex line (sometimes higher quality, `size` locking) full integration docs
* [Deep dive: gpt-image-2 launch](/en/news/gpt-image-2-launch) - Official version launch
* [Deep dive: gpt-image-2-all launch](/en/news/gpt-image-2-all-launch) - Reverse-engineered version launch
* [Community: Luck GPT-Image 2 ComfyUI Nodes](/en/scenarios/ecosystem/luckgpt2-comfyui) - Multi-model ComfyUI node pack
* [Community: APIYI GPT-Image 2 Skills](/en/scenarios/ecosystem/apiyi-gpt-image-skills) - Multi-model AI Agent Skill pack
* [Deposit promotions](/en/faq/recharge-promotions) - Recharge bonus policy
