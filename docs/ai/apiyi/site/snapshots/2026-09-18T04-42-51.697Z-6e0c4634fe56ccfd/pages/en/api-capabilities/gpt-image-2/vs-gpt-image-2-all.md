> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-image-2.5 / 2 Official vs Reverse

> Compare the official gpt-image-2.5-flare / gpt-image-2.5-sunburst / gpt-image-2 vs the reverse-engineered sister models gpt-image-2.5-all, gpt-image-2-all, gpt-image-2.5-vip and gpt-image-2-vip: channel nature, pricing, endpoints, upload/output formats, speed vs quality positioning, prompt adherence — pick the right one.

## TL;DR

| If you need                                                                                                            | Pick                                                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`quality` knob / mask inpainting / arbitrary custom sizes (beyond the 30 presets) / strict OpenAI-API field parity** | Official, token-metered: `gpt-image-2.5-flare` (speed-first) / `gpt-image-2.5-sunburst` (editing-precision-first) / `gpt-image-2` (previous generation)                             |
| **Predictable flat \$0.03/image + fast output (speed is the advantage)**                                               | `gpt-image-2-all` / `gpt-image-2.5-all` (Reverse, ChatGPT-web line, \~90s; 2.5-all is backed by Images 2.5)                                                                         |
| **Predictable flat \$0.03/image + locked sizes (30 presets incl. 4K)**                                                 | `gpt-image-2-vip` / `gpt-image-2.5-flare-vip` / `gpt-image-2.5-sunburst-vip` (Reverse, Adobe line; the two 2.5 models take all six `quality` tiers, `gpt-image-2-vip` up to `high`) |

All eight models are **built on OpenAI's GPT-Image 2.5 / 2 series underneath**. The differences are in channel nature (official direct vs reverse-engineered), pricing model, and parameter granularity. The three official models share price and parameters; the five reverse models share price and call format.

<Note>
  **The three reverse lines (-all / 2.5-all / -vip trio)**: This page's "Reverse" column covers **`gpt-image-2-all`**, **`gpt-image-2.5-all`** and **`gpt-image-2-vip` / `gpt-image-2.5-flare-vip` / `gpt-image-2.5-sunburst-vip`** (alias `gpt-image-2.5-vip` = sunburst-vip). All share the \$0.03/image flat price and the same call format (the three `-vip` models additionally support `size`):

  * `gpt-image-2-all` / `gpt-image-2.5-all`: ChatGPT web line, **\~90s** generation — **speed is the advantage**; 2.5-all is backed by Images 2.5
  * `gpt-image-2-vip` and the two 2.5 -vip models: Adobe line (Firefly), **`size` locking (30 presets incl. 4K)**; all three accept `quality` (channel behavior, not a commitment): the two 2.5 models opened `xhigh` / `max` in 2026-09-10 retesting and now take all six tiers, `gpt-image-2-vip` goes up to `high`; all three return transparent backgrounds; flare-vip is the fastest with a softer look, sunburst-vip is visually close to `gpt-image-2-vip`
  * In common: none support `n`; `mask` is whole-image regeneration on all of them, with no guarantee of touching only the masked region

  For precise mask inpainting, arbitrary custom sizes beyond the 30 presets, or `n` > 1, use the official models (`gpt-image-2.5-flare` / `gpt-image-2.5-sunburst` / `gpt-image-2`).
</Note>

<Tip>
  **About current speeds**: `-all` / `-vip` generation is **slower than at launch** due to **OpenAI upstream compute fluctuations** — this affects all reverse-channel users, not just APIYI; our account pool and ops are healthy. Set client timeouts to 300s+ and leave more headroom for complex prompts.
</Tip>

## Full Comparison Table

| Dimension                    | **gpt-image-2-all / 2.5-all / -vip** (Reverse, cost-effective)                                                                                                                                                                                                                                                                                                                                                                | **gpt-image-2.5-flare / sunburst / gpt-image-2** (Official)                                                                                                                                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Model name**               | `gpt-image-2-all` (fastest) / `gpt-image-2.5-all` (2.5 version of the same line) / `gpt-image-2-vip` (quality-first, size-locking) / `gpt-image-2.5-flare-vip` · `gpt-image-2.5-sunburst-vip` (2.5 versions of the same line, alias `gpt-image-2.5-vip`)                                                                                                                                                                      | `gpt-image-2.5-flare` (speed-first) / `gpt-image-2.5-sunburst` (editing-precision-first) / `gpt-image-2` (previous generation)                                                                                                               |
| **Channel nature**           | `-all` / `2.5-all`: reverse-engineered ChatGPT web line<br />the three `-vip` models: reverse-engineered Adobe line (Firefly; a high-quality GPT-Image 2.5 reverse line, not upscaling)                                                                                                                                                                                                                                       | Official direct (OpenAI Images API); same price and parameters across all three                                                                                                                                                              |
| **Pricing**                  | **Per-call**: flat \$0.03/call (all five reverse models, same price)                                                                                                                                                                                                                                                                                                                                                          | **Token-metered**: matches official; \~**85% of list price** after APIYI deposit bonuses                                                                                                                                                     |
| **Typical cost/image**       | \$0.03 (regardless of size / quality / model)                                                                                                                                                                                                                                                                                                                                                                                 | Measured **\$0.03 – \$0.2** (correlates with prompt length, size, quality)                                                                                                                                                                   |
| **Token group**              | Default                                                                                                                                                                                                                                                                                                                                                                                                                       | Default                                                                                                                                                                                                                                      |
| **Token type**               | **Per-call** or **Token-priority** both work                                                                                                                                                                                                                                                                                                                                                                                  | **Token-priority only** (this model is token-billed; per-call tokens will be rejected)                                                                                                                                                       |
| **Recommended endpoint**     | **`/v1/images/generations` + `/v1/images/edits`** (more stable, more upstream supply, and same code as official — just swap the `model` name to switch during risk-control turbulence)                                                                                                                                                                                                                                        | `/v1/images/generations` + `/v1/images/edits`                                                                                                                                                                                                |
| **Upload format**            | multipart file (edits endpoint)                                                                                                                                                                                                                                                                                                                                                                                               | multipart file (edit endpoint)                                                                                                                                                                                                               |
| **Output format**            | `b64_json` (default, **raw base64 with no prefix**, verified 2026-07; earlier versions included the prefix) or `url` (R2 CDN)                                                                                                                                                                                                                                                                                                 | `b64_json` (**raw base64, no prefix**)                                                                                                                                                                                                       |
| **Reference image count**    | Multiple                                                                                                                                                                                                                                                                                                                                                                                                                      | **Max 16** (`image[]`)                                                                                                                                                                                                                       |
| **Mask inpainting**          | `-all` / `2.5-all`: ❌ not supported<br />the three `-vip` models: ⚠️ accepted but whole-image regeneration — three runs on real photos measured an inside/outside change ratio of about 1 (2026-09-09); no guarantee of touching only the masked region                                                                                                                                                                       | ✅ Supported (alpha channel required)                                                                                                                                                                                                         |
| **Prompt adherence**         | Good                                                                                                                                                                                                                                                                                                                                                                                                                          | **Excellent**                                                                                                                                                                                                                                |
| **Generation speed**         | `-all`: \~**90 seconds** (speed is the advantage)<br />`gpt-image-2-vip`: \~**90–150 seconds**<br />the two 2.5 -vip models: serial 1024² runs measured flare 22–138 s and sunburst 37–120 s, wide variance; no concurrency planning needed within 500 RPM, retry an occasional 429 with backoff or check [Live Updates](/en/live)<br />📌 Currently slower than at launch — OpenAI upstream compute, not an APIYI-side issue | `gpt-image-2.5-flare`: fastest official, 1K `low` measured \~10 s (2026-09-09)<br />`gpt-image-2.5-sunburst`: 1K `low` measured \~14 s, slower at high quality<br />`gpt-image-2`: \~**100-120 seconds**, complex + 4K can reach 3-5 minutes |
| **Quality tendency**         | `-all` / `2.5-all`: good (same line; the two names produce the same images)<br />`-vip`: on six same-size prompts judged by eye, sunburst-vip is close to `gpt-image-2-vip`, flare-vip is softer with fewer decorative details; Chinese headline strokes are correct on all three                                                                                                                                             | Stable; both 2.5 models beat gpt-image-2, sunburst highest, and `quality=xhigh` / `max` max it out                                                                                                                                           |
| **`size` parameter**         | `-all` / `2.5-all`: ❌ Not accepted (describe in prompt)<br />the three `-vip` models: ✅ **Restored** (since 2026-07-22), 30 preset sizes (incl. 4K); images endpoints only, not supported on the chat endpoint. With `size` omitted, `gpt-image-2-vip` / sunburst-vip return 2048×2048 and flare-vip a fixed 1024×1536 (the default has changed upstream before) — pass a preset to lock it                                   | ✅ Any valid custom size                                                                                                                                                                                                                      |
| **4K support**               | `-all` / `2.5-all`: ❌<br />the three `-vip` models: ✅ 4K Detail tier (e.g. `3840x2160` / `2880x2880`), no surcharge                                                                                                                                                                                                                                                                                                           | ✅ Including `3840×2160`                                                                                                                                                                                                                      |
| **Common output sizes**      | `-all`: 16:9 → 1672×941, 9:16 → 941×1672, 1:1 → 1254×1254 (adaptive)<br />the three `-vip` models: 30 presets (10 ratios × 1K/2K/4K), see the [full 30-size table](/en/api-capabilities/gpt-image-2-vip/overview#supported-sizes-full-30-size-table); sizes outside the presets do not error but get aligned to multiples of 16 or raised to the minimum edge                                                                 | 8 presets + any valid custom size                                                                                                                                                                                                            |
| **`quality` parameter**      | `-all` / `2.5-all`: ❌ rejected (do not pass)<br />the three `-vip` models: ✅ measured, channel behavior, not a commitment — the two 2.5 models take all six tiers `auto` / `low` / `medium` / `high` / `xhigh` / `max` (`xhigh` / `max` opened 2026-09-10), `gpt-image-2-vip` up to `high`                                                                                                                                    | ✅ `low` / `medium` / `high` / `xhigh` / `max` / `auto` (`xhigh` / `max` on the two 2.5 models only)                                                                                                                                          |
| **`quality` tier alignment** | Output tokens at 2048×1152: `gpt-image-2-vip` low 157 / medium 1,413 / high 5,650; the two 2.5 -vip models low 157 / medium 367 / high 1,413 / xhigh 2,511 / max 5,650 — **2.5 `high` = `gpt-image-2-vip` `medium`, 2.5 `max` = `gpt-image-2-vip` `high`**, the same relationship as official 2.5 vs gpt-image-2; per-call billing, so the tier does not change the price                                                     | Output tokens at 1024²: official 2.5 low 196 / medium 439 / high 1,756 / xhigh 3,122 / max 7,024; `gpt-image-2` low 196 / medium 1,756 / high 7,024 — official 2.5 `high` = `gpt-image-2` `medium`; token-metered                            |
| **`n` parameter**            | ❌ None of the five reverse models support it (1 image per call)                                                                                                                                                                                                                                                                                                                                                               | ✅ Supported                                                                                                                                                                                                                                  |
| **Transparent background**   | `-all` / `2.5-all`: ⚠️ no `background` parameter, prompt-only, occasionally unreliable<br />the three `-vip` models: ✅ `background: "transparent"` returns an alpha PNG in testing (not a commitment)                                                                                                                                                                                                                         | ✅ Parameter-controlled and reliable — `background: "transparent"` with `png` / `webp`                                                                                                                                                        |
| **Chinese prompts**          | ✅ Native                                                                                                                                                                                                                                                                                                                                                                                                                      | ✅ Native                                                                                                                                                                                                                                     |
| **Text rendering**           | High fidelity                                                                                                                                                                                                                                                                                                                                                                                                                 | High fidelity (strongest at `high` tier)                                                                                                                                                                                                     |
| **API docs**                 | [GPT-Image-2.5-All Overview](/en/api-capabilities/gpt-image-2-all/overview) / [GPT-Image-2.5-VIP Overview](/en/api-capabilities/gpt-image-2-vip/overview)                                                                                                                                                                                                                                                                     | [GPT-Image-2.5 / 2 Overview](/en/api-capabilities/gpt-image-2/overview)                                                                                                                                                                      |

<Info>
  🔑 **Create or manage API tokens**: [https://api.apiyi.com/token](https://api.apiyi.com/token)\
  When creating a token in the console, choose a group (`Default` is fine) and a token type (**Per-call** / **Token-priority**). **Calling the three official models (`gpt-image-2.5-flare` / `sunburst` / `gpt-image-2`) requires a "Token-priority" token** — per-call tokens will be rejected due to billing-mode mismatch.
</Info>

## When to Pick Each

### Pick `gpt-image-2-all` / `gpt-image-2.5-all` (Reverse) when

<CardGroup cols={2}>
  <Card title="💰 Predictable cost" icon="dollar-sign">
    Stable \$0.03/image with no size/quality tier. **Ideal for batch production with hard cost ceilings** (infographics, marketing assets, e-commerce thumbnails).
  </Card>

  <Card title="⚡ Faster output" icon="bolt">
    \~90s generation — **slightly faster** than both `-vip` and the official version. **Better real-time UX.**
  </Card>

  <Card title="🔁 One codebase, swap anytime" icon="repeat">
    Standard Images API format — **same code** as the three `-vip` models and the three official models; switch or fall back by changing the `model` name. `gpt-image-2-all` and `gpt-image-2.5-all` share price and behavior; the new name simply reflects that ChatGPT web has moved to Images 2.5.
  </Card>

  <Card title="🌏 Chinese + marketing text" icon="type">
    Native Chinese prompt support, excellent text rendering for signage / posters / infographics — **great for Chinese-audience content production**.
  </Card>
</CardGroup>

### Pick the three `-vip` models (Reverse, size-locking) when

<CardGroup cols={2}>
  <Card title="🎚️ quality works (all six tiers on 2.5)" icon="sliders-horizontal">
    `gpt-image-2.5-flare-vip` / `gpt-image-2.5-sunburst-vip` accept all six tiers from `auto` to `max` in testing (`xhigh` / `max` opened 2026-09-10); `gpt-image-2-vip` goes up to `high`. All of it is channel behavior, not a commitment. Tier alignment: 2.5 `high` only equals `gpt-image-2-vip` `medium`, and 2.5 `max` equals `gpt-image-2-vip` `high`; the flat \$0.03 does not change with the tier.
  </Card>

  <Card title="⏱️ Choosing among the three" icon="hourglass">
    flare-vip is the fastest with a softer look; sunburst-vip has higher quality and editing precision and looks close to `gpt-image-2-vip`; all three reach the same top token tier (`max` on 2.5, `high` on `gpt-image-2-vip`). All are slower than `-all` — `max` at 1024² measured 80–160 s — so pick them when a longer wait is acceptable.
  </Card>

  <Card title="🖼️ Locked sizes / 4K" icon="expand">
    The `size` parameter is **restored** (since 2026-07-22): 30 preset sizes (10 ratios × 1K/2K/4K). E-commerce hero shots, poster templates and 4K wallpapers come out at exact dimensions — flat \$0.03/image, no 4K surcharge.
  </Card>

  <Card title="🔁 Code shared with -all" icon="copy">
    Same request structure as `-all` (just one extra `size` field) — **one codebase switches across all five reverse models** by swapping the `model` name based on your speed / quality preference.
  </Card>
</CardGroup>

<Note>
  `-vip`'s `size` only works on the `/v1/images/generations` and `/v1/images/edits` endpoints — **the `/v1/chat/completions` chat endpoint does not support `size`**. For arbitrary custom sizes beyond the 30 presets or precise mask inpainting, use the official models (`gpt-image-2.5-flare` / `sunburst`). Availability of this parameter follows upstream changes — see [Live Updates](/en/live) for the latest status.
</Note>

### Pick the official models (`gpt-image-2.5-flare` / `sunburst` / `gpt-image-2`) when

<CardGroup cols={2}>
  <Card title="🎚️ Quality tiers" icon="sliders-horizontal">
    All six `quality` tiers are available **and officially committed**, with tiers and token counts stable per the official spec. The reverse 2.5 -vip models have also opened all six tiers (measured 2026-09-10), but that is channel behavior with no commitment, and `gpt-image-2-vip` still stops at `high`.
  </Card>

  <Card title="🎯 Mask inpainting" icon="paintbrush">
    Alpha-channel mask supported — **precisely modify a region while preserving the rest**. The reverse models only regenerate the whole image and do not guarantee touching only the masked region.
  </Card>

  <Card title="🖼️ Arbitrary custom sizes" icon="expand">
    `size` accepts **any valid resolution** (including 4K), not limited to presets. The `-vip` trio only guarantees the 30 presets and rewrites anything else — **strict custom sizes go official**.
  </Card>

  <Card title="🔌 Same as OpenAI Official" icon="plug">
    Goes through the official Images API — fields and behavior identical to OpenAI official. **Existing OpenAI-SDK-based code / systems migrate with zero changes** and stay stable long-term.
  </Card>
</CardGroup>

## Key Differences in Detail

### 1. b64\_json format gotcha (migration trap!)

As verified in July 2026, the official and reverse models all return **raw base64 (no `data:` prefix)** — but `gpt-image-2-all` used to include the prefix, so the safest shared code checks for it first:

```python theme={null}
# Universal pattern: detect the prefix before processing — works for all official and reverse models
b64 = resp["data"][0]["b64_json"]
if b64.startswith("data:"):          # handles historical prefixed responses
    b64 = b64.split(",", 1)[1]
with open("out.png", "wb") as f:
    f.write(base64.b64decode(b64))   # ✅ write file
img_tag = f'<img src="data:image/png;base64,{b64}">'  # ✅ browser render
```

<Warning>
  When switching between official and reverse, **the `b64_json` handling code must change**, or you'll get a corrupted data URL or a decode failure.
</Warning>

### 2. Resolution control

**`gpt-image-2-all` / `gpt-image-2.5-all`** (no `size` field — composition goes in the prompt; both names behave the same):

```
"Landscape 16:9 cinematic, old lighthouse at sunset"   → ~1672×941
"Portrait 9:16 phone wallpaper, cyberpunk city"        → ~941×1672
"1024×1024 square logo, minimalist cat line art"        → ~1254×1254
```

**The three `-vip` models** (`gpt-image-2.5-vip` / `gpt-image-2.5-flare-vip` / `gpt-image-2-vip`; `size` restored since 2026-07-22):

Accept **30 preset sizes** (10 ratios × 1K/2K/4K) — pass `size: "WIDTHxHEIGHT"` directly (must be one of the 30 presets; full list in the [30-size table](/en/api-capabilities/gpt-image-2-vip/overview#supported-sizes-full-30-size-table)). All three also accept `quality` in testing (channel behavior, not a commitment): the two 2.5 models take all six tiers (`xhigh` / `max` opened 2026-09-10), `gpt-image-2-vip` up to `high`; the 2.5 models' `high` output tokens only equal `gpt-image-2-vip` `medium`, and their `max` equals its `high`:

```python theme={null}
client.images.generate(
    model="gpt-image-2.5-vip",   # alias = gpt-image-2.5-sunburst-vip; swap in gpt-image-2.5-flare-vip / gpt-image-2-vip on this line only
    prompt="...",
    size="3840x2160",   # ✅ one of the 30 presets; images endpoints only (not chat)
    quality="max"       # optional; all six tiers on the 2.5 models, gpt-image-2-vip stops at high; flat $0.03 regardless of tier
)
```

**Official models** (`size` strictly honored + `quality` tiers; the sample uses `gpt-image-2.5-flare`, swap in `sunburst` / `gpt-image-2` by changing only the model name):

```python theme={null}
client.images.generate(
    model="gpt-image-2.5-flare",
    prompt="...",
    size="2048x1152",   # ✅ output exactly this
    quality="max"       # all six tiers; xhigh / max on the two 2.5 models only; 2.5 high only equals gpt-image-2 medium
)
```

### 3. Upload / output format differences

| Operation              | Five reverse models (`-all` / `2.5-all` / the `-vip` trio)                                                                     | Three official models (`2.5-flare` / `2.5-sunburst` / `gpt-image-2`) |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| **Upload reference**   | multipart `image` file field (edits endpoint)                                                                                  | multipart `image[]` file field                                       |
| **Download output**    | Default `b64_json` (raw base64, verified 2026-07); explicit `response_format: "url"` returns an R2 CDN link (**24h validity**) | `b64_json` (**raw base64**, requires decode)                         |
| **Multi-image fusion** | Repeat the `image` field on the edits endpoint                                                                                 | `image[]` array, **max 16**                                          |

### 4. Cost ballpark

| Scenario                            | Five reverse models (`-all` / `2.5-all` / the `-vip` trio)                                            | Official `gpt-image-2.5-flare` / `sunburst`               | Official `gpt-image-2`                                |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------- |
| 1024×1024 draft (`low`)             | \$0.03                                                                                                | \~\$0.006 (196 tok)                                       | \~\$0.006 (196 tok)                                   |
| 1024×1024 medium quality (`medium`) | \$0.03                                                                                                | \~\$0.013 (439 tok)                                       | \~\$0.053 (1,756 tok)                                 |
| 1024×1024 high quality (`high`)     | \$0.03                                                                                                | \~\$0.053 (1,756 tok)                                     | \~\$0.211 (7,024 tok)                                 |
| 1024×1024 `xhigh` / `max`           | \$0.03 (accepted on the 2.5 -vip models; `gpt-image-2-vip` stops at `high`; `-all` rejects `quality`) | \~\$0.094 (3,122 tok) / \~\$0.211 (7,024 tok)             | ❌ Not supported                                       |
| 2048×1152 high quality              | \$0.03                                                                                                | Token-metered; `high` lands around `gpt-image-2` `medium` | \~\$0.20+ (token-metered)                             |
| 3840×2160 4K high quality           | \$0.03 (`-vip` 4K Detail tier, no surcharge; `-all` / `2.5-all` have no 4K)                           | Token-metered, **significantly higher than 1K**           | Token-metered, **significantly higher than 1K**       |
| Edit / multi-image fusion           | \$0.03                                                                                                | Input tokens rise sharply, single call can hit \$0.1+     | Input tokens rise sharply, single call can hit \$0.1+ |

Official figures are rough: output tokens measured on 2026-09-09 × \$30 per million, excluding prompt input tokens (usually under \$0.001).

<Info>
  **Bottom line**: For batch / low-quality workloads, the reverse channel isn't always cheaper (1K `low` is actually less expensive on the official tier, and the two 2.5 models cost only \~\$0.013 / \~\$0.053 even at `medium` / `high`). The **mid-to-high quality range** (`gpt-image-2` from `medium` up, the 2.5 models from `xhigh` up) is where the reverse channel's \$0.03 becomes the sweet spot. Pick official (token-metered) when you need **`quality` tiers / mask inpainting / locked sizes, 4K / strict OpenAI-API field parity**.
</Info>

## Client Settings

| Setting                    | Five reverse models (`-all` / `2.5-all` / the `-vip` trio)                                             | Three official models (`2.5-flare` / `2.5-sunburst` / `gpt-image-2`)                                                                                                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Timeout (conservative)** | `-all` / `2.5-all`: **300s** (typical \~90s)<br />the three `-vip` models: **300s** (typical 120–200s) | 2.5 models at `low` / `medium`: **240s**; `high` / `xhigh`: **300s**; `max` and `gpt-image-2` `high`: **600s** fallback (4K high quality realistically reaches 3-5 minutes) — see the tier table in the [official overview](/en/api-capabilities/gpt-image-2/overview) |
| **Retry strategy**         | Exponential backoff on 5xx / timeout, max 2 retries                                                    | Same                                                                                                                                                                                                                                                                   |
| **Concurrency**            | 1 image per call — issue parallel requests for multiple                                                | 1 image per call — issue parallel requests for multiple                                                                                                                                                                                                                |
| **Request ID**             | `request-id` response header                                                                           | `x-request-id` response header                                                                                                                                                                                                                                         |

<Tip>
  **Common to all eight models: for image edit / multi-image fusion, compress each input image to under 1.5MB** (JPEG quality 80-90 / down-sized resolution). Sporadic `shell_api_error` / `Unknown error` responses are most often triggered by oversized inputs — compressing measurably improves success rate and latency. **Output resolution is independent of input size** — quality is set on the output side (`size` + `quality` for official; the `size` tier plus `quality` for the `-vip` trio; prompt phrasing for `-all` / `2.5-all`), not by input file size.
</Tip>

## FAQ

<AccordionGroup>
  <Accordion title="Should I compress input images? Does writing 4K / 8K in the prompt help?">
    **Yes, strongly recommended.** For all eight models, compress each input image to **under 1.5MB** (JPEG quality 80-90 / down-sized resolution): sporadic `shell_api_error` / `Unknown error` responses are most often triggered by oversized inputs, and compressing measurably improves success rate and latency.

    **Don't worry about compression hurting quality** — output resolution is independent of input size. The "output-side" controls differ across the three families:

    * `gpt-image-2-all` / `gpt-image-2.5-all`: controlled by prompt composition phrasing (see the verified phrasing table on the [-all overview page](/en/api-capabilities/gpt-image-2-all/overview)) — `4K` / `8K` in the prompt does not count
    * The three `-vip` models (`gpt-image-2.5-vip` / `gpt-image-2.5-flare-vip` / `gpt-image-2-vip`): controlled by the `size` field (30 preset sizes incl. 4K), optionally with `quality` (six tiers on the 2.5 models, up to `high` on `gpt-image-2-vip`) — `4K` / `8K` in the prompt does not count either
    * Official models (`gpt-image-2.5-flare` / `sunburst` / `gpt-image-2`): controlled by `size` + `quality` (any valid size)

    Bottom line: shrinking inputs only speeds things up — quality is set by output-side configuration, not input file size.
  </Accordion>

  <Accordion title="Can the same API Key call all eight models?">
    Yes. All eight run on the Default group — the same API Key calls them with no extra config. Note: calling the official models requires a "Token-priority" token; `-all` / `-vip` accept either token type.
  </Accordion>

  <Accordion title="Which endpoints should I use on the reverse channel?">
    **Use the OpenAI Images API** (`/v1/images/generations` for text-to-image + `/v1/images/edits` for editing), for two reasons:

    1. **More stable**: upstream resource supply for the Images API channel is more plentiful, so call success rates are higher
    2. **Compatible with the official relay for easy switching**: the call method and parameter format are fully compatible with the three official models (`gpt-image-2.5-flare` / `sunburst` / `gpt-image-2`) — if the reverse channel hits risk-control turbulence, **just swap the `model` name to switch to the official relay** with zero code changes

    There is also a chat-based endpoint (`/v1/chat/completions`, **no longer recommended**), only useful for multi-turn iterative editing or passing online image URLs directly. Note that when the image intent is ambiguous, it may return plain text instead of an image (prepend a fixed prefix like "Generate an image:" to reinforce it). For full parameters, see the [-all chat-based API reference](/en/api-capabilities/gpt-image-2-all/chat-completions) / [-vip chat-based API reference](/en/api-capabilities/gpt-image-2-vip/chat-completions).
  </Accordion>

  <Accordion title="Within the reverse channel, -all vs -vip — which to pick?">
    Both lines are reverse-engineered channels at the same flat price (\$0.03/image), with the same call format (the `-vip` trio additionally supports `size` locking and `quality`, all six tiers on the 2.5 models). The difference is **speed vs quality + size locking**:

    * **Generation time**: `-all` / `2.5-all` \~90s — **speed is the advantage**; the `-vip` trio \~120–200s. Currently slower than at launch due to OpenAI upstream compute fluctuations
    * **Quality**: `-vip` (Adobe line) detail rendering is **sometimes higher** — for showcase images when you're not in a hurry; within the trio, sunburst-vip looks close to `gpt-image-2-vip` and flare-vip is softer
    * **Size locking**: the `-vip` trio supports 30 preset `size` values (incl. 4K); `-all` / `2.5-all` reject `size` — composition goes into the prompt

    Decision: want fast output → `-all` / `2.5-all`; need locked sizes / 4K → the `-vip` trio; need custom sizes beyond the 30 presets or precise mask → official. See the [GPT-Image-2.5-VIP Overview](/en/api-capabilities/gpt-image-2-vip/overview) for details.
  </Accordion>

  <Accordion title="Within -vip, the two 2.5 models vs gpt-image-2-vip — which to pick?">
    Same price, groups and call format (a 253-request three-arm comparison on the same channel and token on 2026-09-09 found the contract identical cell for cell). Only three things differ:

    * **Tiers**: the 2.5 models take all six (`xhigh` / `max` opened 2026-09-10), `gpt-image-2-vip` up to `high`; same-named tiers are not equal — at 2048×1152, 2.5 `high` 1,413 = `gpt-image-2-vip` `medium`, and 2.5 `max` 5,650 = `gpt-image-2-vip` `high`. All three reach the same top token tier
    * **Quality and speed**: flare-vip is the fastest with a softer look and fewer decorative details; sunburst-vip looks close to `gpt-image-2-vip`
    * **Default size**: flare-vip is a fixed 1024×1536, the other two 2048×2048; always pass `size` to lock it

    The alias `gpt-image-2.5-vip` is sunburst-vip. The full row-by-row table is in the [GPT-Image-2.5-VIP Overview, section "Three -vip models compared"](/en/api-capabilities/gpt-image-2-vip/overview).
  </Accordion>

  <Accordion title="I need locked sizes / 4K — what now?">
    Start with the `-vip` trio (`gpt-image-2.5-vip` by default; pick `gpt-image-2-vip` with `high` for the highest token tier): the `size` parameter was restored on 2026-07-22 and supports **30 preset sizes (10 ratios × 1K/2K/4K)** at a flat \$0.03/image with no 4K surcharge. Note that `size` only works on the images endpoints and must be one of the 30 presets.

    Go official (`gpt-image-2.5-flare` / `sunburst` / `gpt-image-2`, token-metered) when you need **any valid size beyond the 30 presets**, **officially committed `quality` tiers** (the `-vip` tiers are channel behavior with no commitment), **precise mask inpainting** (alpha-channel mask), or **strict OpenAI-API field parity** (zero-change migration for existing OpenAI-SDK code).
  </Accordion>

  <Accordion title="Migrating from 1.5 — which one should I pick?">
    * **Stick with the OpenAI SDK / must match OpenAI official, or need custom sizes beyond the 30 presets**: pick the official models (`gpt-image-2.5-flare` for text-to-image, `gpt-image-2.5-sunburst` for edits). Drop `input_fidelity` and leave the rest unchanged (`background: transparent` keeps working).
    * **Cut cost, want fast output**: pick `gpt-image-2.5-all` (reverse, \~90s; same price and behavior as `gpt-image-2-all`).
    * **Cut cost, quality-first or need locked sizes / 4K**: pick `gpt-image-2.5-vip` (reverse, \~120–200s, 30 preset sizes incl. 4K, all six `quality` tiers; `gpt-image-2-vip` stops at `high`).
  </Accordion>

  <Accordion title="Can I deploy multiple models for failover?">
    Yes. A common pattern: **primary `2.5-all` or `2.5-vip`** (predictable cost — pick by speed / quality preference), **fallback to the official `gpt-image-2.5-flare` / `sunburst`** (switch when you need `quality` tiers, mask, or custom sizes beyond the 30 presets). The reverse and official response shapes differ — normalize at the business layer.
  </Accordion>

  <Accordion title="The R2 CDN image link is slow — what can I do?">
    See [Slow CDN downloads — what to do](/en/faq/cdn-download-slow)
  </Accordion>
</AccordionGroup>

## Related Docs

* [GPT-Image-2.5 / 2 Overview](/en/api-capabilities/gpt-image-2/overview) - Full integration docs for the three official models
* [GPT-Image-2.5-All Overview](/en/api-capabilities/gpt-image-2-all/overview) - Reverse ChatGPT-web line (fastest output; `gpt-image-2.5-all` / `gpt-image-2-all`) full integration docs
* [GPT-Image-2.5-VIP Overview](/en/api-capabilities/gpt-image-2-vip/overview) - Reverse Adobe line (the `gpt-image-2.5-vip` series plus `gpt-image-2-vip`; `size` locking, `quality` tiers) full integration docs
* [Deep dive: GPT-image-2.5 launch](/en/news/gpt-image-2-5-launch) - The 2.5 dual-model launch
* [Deep dive: gpt-image-2 launch](/en/news/gpt-image-2-launch) - Official version launch
* [Deep dive: gpt-image-2-all launch](/en/news/gpt-image-2-all-launch) - Reverse-engineered version launch
* [Community: Luck GPT-Image 2 ComfyUI Nodes](/en/scenarios/ecosystem/luckgpt2-comfyui) - Multi-model ComfyUI node pack
* [Community: APIYI GPT-Image 2 Skills](/en/scenarios/ecosystem/apiyi-gpt-image-skills) - Multi-model AI Agent Skill pack
* [Deposit promotions](/en/faq/recharge-promotions) - Recharge bonus policy
