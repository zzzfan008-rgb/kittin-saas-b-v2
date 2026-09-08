> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# VEO 3.1 Official Launches: Google's Authorized Channel Now on APIYI

> APIYI brings Google Veo 3.1 official-relay channel online — a transparent passthrough to Google AI Studio. Pay-per-request at $0.3 / $1.2, supporting 720p / 1080p / 4k tiers with native synchronized audio. Default group + Pay-per-request or Pay-as-you-go Priority Tokens — zero onboarding friction.

## Key Highlights

* **Google AI Studio official-relay channel**: Transparent passthrough to Google Veo 3.1 async endpoints; model IDs match upstream exactly
* **Two models**: `veo-3.1-fast-generate-preview` (\$0.3/req) and `veo-3.1-generate-preview` (\$1.2/req) — per-request billing, independent of duration / resolution
* **Full capabilities**: flexible 4 / 6 / 8 second durations + 720p / 1080p / 4k resolution tiers + landscape/portrait + native synchronized audio
* **Zero onboarding friction**: **`Default` group works**, **Pay-per-request or Pay-as-you-go Priority Tokens both accepted** (pure Pay-as-you-go not supported), no dedicated group switch — existing Tokens drop in with just a `base_url` change
* **Failures are free**: only `status=completed` tasks are billed; failed / canceled / content-policy rejected are all free
* **Complementary to the existing Reverse channel**: [VEO 3.1 (Reverse)](/en/api-capabilities/veo/overview) stays online at \$0.15 starting, with streaming sync and frame-to-video; the new Official channel targets official-grade quality and stability. See the [comparison matrix](/en/api-capabilities/veo-3-1-official/vs-veo-reverse)

## Background

Google released the Veo 3.1 series in 2026 as a flagship cinematic video generation engine, featuring 4K output, native synchronized audio, complex camera motion, and exceptional temporal consistency. The upstream offers two variants:

* `veo-3.1-generate-preview` — highest-quality standard tier
* `veo-3.1-fast-generate-preview` — cost-optimized fast tier

APIYI previously offered Veo 3.1 via the [Reverse channel (VEO 3.1)](/en/api-capabilities/veo/overview) — Google Flow integration starting at \$0.15, with streaming sync and frame-to-video, ideal for cost-sensitive workloads. But the Reverse channel, being reverse-engineered, **differs from upstream on quality stability, model ID consistency, and enterprise compliance**.

**To close this gap, the APIYI team launches the VEO 3.1 Official Relay channel**: a transparent passthrough to Google AI Studio, with model IDs, response fields, and constraints matching Google upstream exactly. **Available 2026-05-21 (UTC+8)**.

## Detailed Walkthrough

### Key Features

<CardGroup cols={2}>
  <Card title="🎬 Native Synchronized Audio" icon="volume-2">
    Veo 3.1 natively outputs video with synchronized audio (ambient, dialogue, score) — no separate audio post-production. Describe audio intent in the prompt, **do not pass `generateAudio`**.
  </Card>

  <Card title="📐 Three Resolution Tiers" icon="expand">
    `720p` / `1080p` / `4k` — uniform per-request price. Landscape `16:9` and portrait `9:16` toggle freely.
  </Card>

  <Card title="⏱️ Flexible 4 / 6 / 8 Seconds" icon="clock">
    The length field is named `seconds` (not `duration`), a string enum; per-request billing means duration does not affect price. 1080p / 4k tiers require 8 seconds.
  </Card>

  <Card title="🎯 Precise Instruction Following" icon="target">
    Veo 3.1 leads its tier on camera motion, object physics, and character expression fidelity — rich camera-language keyword support.
  </Card>
</CardGroup>

### Key Selling Point: Drop-In Onboarding

Versus [Sora 2 Official Relay](/en/api-capabilities/sora-2/overview) (which requires the dedicated `Sora2Official` group + Pay-as-you-go Priority Token only), **VEO 3.1 Official runs on the `Default` group and accepts both Pay-per-request and Pay-as-you-go Priority Tokens** — existing Tokens drop in without any config changes:

```python theme={null}
{/* Single base_url change; no group switch, no specialized Token needed */}
from openai import OpenAI
client = OpenAI(api_key="sk-your-api-key", base_url="https://api.apiyi.com/v1")

resp = client.post(
    "/videos",
    body={
        "model": "veo-3.1-fast-generate-preview",
        "prompt": "A coastal lighthouse at dusk, slow push-in, ocean ambience, cinematic lighting",
        "seconds": "8",
        "size": "1280x720",
        "metadata": {"resolution": "720p", "aspectRatio": "16:9"}
    },
    cast_to=dict
)
```

### Models and Pricing — 60％+ Cheaper than Google Official

APIYI uses **pay-per-request** billing — flat price within supported duration/resolution combos, **no surcharge for longer or higher-res output**. Per `ai.google.dev/gemini-api/docs/pricing` public rates, Google's official Veo 3.1 charges per second; the discounts below are computed for **8-second videos**.

| Model                           | APIYI Price     | Google Official 8s 1080p  | Google Official 8s 4K     |
| ------------------------------- | --------------- | ------------------------- | ------------------------- |
| `veo-3.1-fast-generate-preview` | **\$0.3 / req** | \$0.96<br />**68.8% off** | \$2.40<br />**87.5% off** |
| `veo-3.1-generate-preview`      | **\$1.2 / req** | \$3.20<br />**62.5% off** | \$4.80<br />**75.0% off** |

**Per-request billing by model name**; duration (4/6/8 sec), resolution (720p/1080p/4k), and whether `input_reference` is provided do not affect price — **picking 4K costs the same as 720p**. **Only `status=completed` tasks are charged**, and [top-up bonuses](/en/faq/recharge-promotions) further reduce effective cost.

### Technical Specs

| Dimension            | `veo-3.1-fast-generate-preview`          | `veo-3.1-generate-preview` |
| -------------------- | ---------------------------------------- | -------------------------- |
| Supported duration   | `"4"` / `"6"` / `"8"` sec (string)       | Same                       |
| Supported resolution | 720p / 1080p / 4k                        | Same                       |
| Supported aspect     | 16:9 / 9:16                              | Same                       |
| Endpoint             | `POST /v1/videos` (async only)           | Same                       |
| Audio                | ✅ Synchronized audio                     | ✅                          |
| Image-to-video       | ✅ (1 `input_reference` image)            | ✅                          |
| Typical render time  | 720p 60–90s · 1080p 80–120s · 4K 5–6 min | Same                       |

### Three-Step Async Flow

```
Step 1: POST /v1/videos          → returns task_id + status="queued"
Step 2: GET /v1/videos/{task_id} → poll every 8 sec, until status="completed"
Step 3: GET /v1/videos/{task_id}/content → download MP4 binary
```

## Real-World Applications

### When to Use Which Channel

<CardGroup cols={2}>
  <Card title="✅ Use Official" icon="check">
    * Final client ad delivery
    * 4K cinematic clips
    * Quality stability / physics consistency priority
    * Overseas teams, existing Token unchanged
    * Strong instruction following (camera motion, expression)
  </Card>

  <Card title="🔄 Use Reverse (VEO 3.1)" icon="refresh-cw">
    * Short-video matrix batch production (\$0.15 unit price)
    * Frontend live display needing streaming sync progress
    * Need frame-to-video (Frame-to-Video) capability
    * Extreme cost-sensitivity
  </Card>
</CardGroup>

See the [Official vs Reverse decision tree](/en/api-capabilities/veo-3-1-official/vs-veo-reverse) for full scenario-by-scenario recommendations.

### Three Most Common Pitfalls

1. **The length field is named `seconds` (not `duration`) and must be a string** `"4"` / `"6"` / `"8"`. Naming it `duration` is silently ignored → falls back to the default 4 sec; passing a number fails with `parse_request_failed`
2. **Do not pass `generateAudio`** — upstream returns `INVALID_ARGUMENT`. Audio intent goes in the prompt
3. **At 1080p / 4k, `seconds` must be `"8"`** — `"4"` / `"6"` will be rejected upstream

Full code samples and 20+ FAQs in the [Official Overview](/en/api-capabilities/veo-3-1-official/overview) and [Text-to-Video Playground](/en/api-capabilities/veo-3-1-official/text-to-video).

## Pricing and Availability

* **Launch time**: 2026-05-21 (UTC+8)
* **Group**: `Default` (1x, **no switching needed**)
* **Billing model**: **Pay-per-request ✅ / Pay-as-you-go Priority ✅** (pure Pay-as-you-go ❌ not supported)
* **Top-up bonuses**: Stack with [Top-Up Promotions](/en/faq/recharge-promotions) for further savings
* **Available gateways**: `api.apiyi.com` (primary) + `vip.apiyi.com` / `b.apiyi.com` (backup)

## Summary and Recommendations

VEO 3.1 Official is APIYI's **official-relay channel** for Veo 3.1 — a transparent passthrough to Google AI Studio, positioned similarly to [Sora 2 Official](/en/api-capabilities/sora-2/overview) but with **lower onboarding friction**:

* ✅ Model IDs and response fields match Google upstream exactly
* ✅ `Default` group + **Pay-per-request or Pay-as-you-go Priority Tokens work** (pure Pay-as-you-go not supported) — existing Tokens require no config change
* ✅ Flexible 4 / 6 / 8 seconds + 720p / 1080p / 4k resolution tiers
* ✅ Failed tasks are not billed; charged only on successful completion
* ✅ Coexists with the existing [Reverse channel](/en/api-capabilities/veo/overview) — complementary by scenario

**Recommend starting with `veo-3.1-fast-generate-preview` (\$0.3 for 4–8 sec) to validate your prompts**, then switching to `veo-3.1-generate-preview` for final delivery once the look is locked.

## Related Docs

* [VEO 3.1 Official Overview](/en/api-capabilities/veo-3-1-official/overview)
* [Text-to-Video Playground](/en/api-capabilities/veo-3-1-official/text-to-video) — Interactive debugger + 5-language samples
* [Image-to-Video Playground](/en/api-capabilities/veo-3-1-official/image-to-video) — Multipart upload usage
* [Official vs Reverse Comparison](/en/api-capabilities/veo-3-1-official/vs-veo-reverse) — Three-step decision tree
* [VEO 3.1 (Reverse)](/en/api-capabilities/veo/overview) — Existing reverse channel, \$0.15 starting, streaming sync + frame-to-video
* [Sora 2 Official](/en/api-capabilities/sora-2/overview) — OpenAI's official-relay video generation
* [Top-Up Promotions](/en/faq/recharge-promotions) — Bonus tiers

<Info>
  Google official model page: `ai.google.dev/gemini-api/docs/models/veo-3.1-generate-preview` · Google video generation hub: `ai.google.dev/gemini-api/docs/video`
</Info>
