> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-image-2.5 Launches: Flare Is Faster, Sunburst Is Sharper

> OpenAI released GPT-image-2.5 on September 8 with two API models: Flare (speed-first, up to 50% lower latency than gpt-image-2) and Sunburst (quality- and editing-precision-first). APIYI's official relay is live, integration is identical to gpt-image-2, pricing stays at $5/$8/$30 per 1M tokens, and two new quality tiers, xhigh and max, are added.

## Key Highlights

* **🚀 One generation, two models**: `gpt-image-2.5-flare` is speed-first, `gpt-image-2.5-sunburst` is quality- and editing-first; they currently point to `gpt-image-2.5-flare-2026-09-08` / `gpt-image-2.5-sunburst-2026-09-08`
* **⚡ Flare is faster**: OpenAI says Flare delivers higher image quality than `gpt-image-2` at up to 50% lower latency; early customers measured 2–4× the speed of `gpt-image-2`
* **🎯 Sunburst is sharper**: OpenAI's most capable image generation and editing model, better at preserving earlier edits and reference subjects across turns, with longer generation times than Flare
* **🎚️ Six quality tiers**: `quality` gains `xhigh` / `max` on top of `low` / `medium` / `high` / `auto`; `gpt-image-2` stops at `high`
* **💰 Same price**: \$5 text input, \$8 image input, \$30 image output per 1M tokens, item for item the same as `gpt-image-2`
* **🔌 Zero-change integration**: APIYI's official relay is live; swap the `model` name and you are done, in the `Default` / `image2Enterprise` / `svip` groups

## Background

On September 8, 2026, OpenAI released **ChatGPT Images 2.5**. The official pitch is "sharper details, more precise editing, faster generation": more natural lighting, richer textures, better handling of complex layouts and transparent backgrounds, stronger preservation of people and objects from reference images, and better memory of earlier changes across multi-turn edits. OpenAI also disclosed that ChatGPT Images and the GPT-Image API models together now produce more than 3 billion images a week.

Unlike April's `gpt-image-2`, which shipped as a single model, this generation is split in two on the API side. **Flare** is the small model, optimized for speed, and OpenAI positions it as "the default choice for most applications". **Sunburst** is the base model, optimized for quality, built for premium visual workflows that need detailed editing. ChatGPT also gained Sketch (hand-drawn references) and image comments for localized edits, but those are ChatGPT product features and are not part of the API.

APIYI completed the official-relay integration the day after release. Both models share the images API, the same parameter set and the same price list as `gpt-image-2`, so existing `gpt-image-2` code only needs a model-name change.

## Deep Dive

### How the two models divide the work

<CardGroup cols={2}>
  <Card title="gpt-image-2.5-flare · speed-first" icon="zap">
    The small model, optimized for speed. OpenAI says it beats `gpt-image-2` on quality at up to 50% lower latency; early customer evaluations put it at 2–4× the speed of `gpt-image-2`. Suited to creator and social content, product imagery, visual search, rapid prototyping and high-volume generation.
  </Card>

  <Card title="gpt-image-2.5-sunburst · precision-first" icon="crosshair">
    The base model, optimized for quality, which OpenAI calls its "most capable model for image generation and editing". Editing instructions are followed more precisely and multi-turn edits are more stable, suited to production-ready campaign creative and polished product imagery. Generation takes longer than Flare.
  </Card>
</CardGroup>

Model selection can stay simple: **default to Flare**, and switch to Sunburst only when editing precision falls short or you need production-grade large images. The two models share identical parameters, so switching is a one-field change and a single pipeline can pick per task.

### Differences from gpt-image-2

| Item                        | gpt-image-2                        | gpt-image-2.5-flare              | gpt-image-2.5-sunburst              |
| --------------------------- | ---------------------------------- | -------------------------------- | ----------------------------------- |
| Positioning                 | Single flagship                    | Speed-first small model          | Quality-first base model            |
| Quality vs gpt-image-2      | Baseline                           | Higher                           | Higher (highest of the two)         |
| Latency vs gpt-image-2      | Baseline                           | Up to 50% lower                  | Longer than Flare                   |
| `quality` tiers             | `low` / `medium` / `high` / `auto` | Six, adds `xhigh` / `max`        | Six, adds `xhigh` / `max`           |
| Multi-turn edit consistency | —                                  | Improved                         | Improved further                    |
| Price per 1M tokens         | \$5 / \$8 / \$30                   | Same                             | Same                                |
| Current snapshot            | `gpt-image-2-2026-04-21`           | `gpt-image-2.5-flare-2026-09-08` | `gpt-image-2.5-sunburst-2026-09-08` |

### Technical specs

Size rules carry over from `gpt-image-2`: presets `1024x1024` / `1536x1024` / `1024x1536`; custom sizes must use multiples of 16, keep the aspect ratio between 1:3 and 3:1, cap the longest edge at 3840 pixels and stay between 0.65MP and 8.3MP total. Resolutions above 2560×1440 are still marked experimental.

Output formats are `png` (default) / `jpeg` / `webp`, with `output_compression` available for `jpeg` / `webp`; transparent backgrounds need `background: "transparent"` with `png` or `webp`. Streaming via `stream: true` + `partial_images` (0–3) works as before. The official model pages list `v1/images/generations` and `v1/images/edits` as supported endpoints, with mask inpainting supported.

<Warning>
  `xhigh` / `max` are new `quality` tiers with no official per-image price by size. APIYI measured the 2.5 models at 1024×1024 on 2026-09-09: `low` 196 / `medium` 439 / `high` 1,756 / `xhigh` 3,122 / `max` 7,024 output tokens, so `max` is what corresponds to gpt-image-2 `high` (7,024) and the same `high` yields a quarter of the tokens on 2.5. Do not carry `quality` over verbatim from gpt-image-2; check `usage.output_tokens` once first.
</Warning>

## Practical Use

### Code samples

Change the `model` in your existing `gpt-image-2` code and leave everything else as is:

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="your-apiyi-api-key",
    base_url="https://api.apiyi.com/v1"
)

# Everyday batch generation: Flare
resp = client.images.generate(
    model="gpt-image-2.5-flare",
    prompt="A Kyoto alley on a late-autumn morning, cobblestones in thin mist, cinematic framing",
    size="1536x1024",
    quality="high",
    output_format="jpeg",
    output_compression=85
)
with open("flare.jpg", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))

# Precision editing: Sunburst
resp = client.images.edit(
    model="gpt-image-2.5-sunburst",
    image=[open("product.png", "rb"), open("scene.png", "rb")],
    prompt="Place the product from image 1 on the desk in image 2, keep the label text, match the lighting of image 2",
    size="1024x1024",
    quality="xhigh"
)
with open("sunburst.png", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### Best practices

<Info>
  **Production recommendations**:

  * Default to `gpt-image-2.5-flare`; switch to `gpt-image-2.5-sunburst` for editing tasks or production-grade large images
  * Pin the dated snapshots `gpt-image-2.5-flare-2026-09-08` / `gpt-image-2.5-sunburst-2026-09-08` in production so a future alias change does not move you
  * Get `quality="high"` working first, then evaluate `xhigh` / `max`; budget the two new tiers from measured `usage`
  * Sunburst takes longer, so start client timeouts at the 360-second value proven on `gpt-image-2`
  * As with `gpt-image-2`, do not send `input_fidelity`; edits run at high fidelity by default
</Info>

## Pricing and Availability

### Pricing

APIYI's official relay prices both models at OpenAI's official rates, identical item for item to `gpt-image-2`:

| Item         | Price (per 1M tokens)  |
| ------------ | ---------------------- |
| Text input   | \$5.00 (cached \$1.25) |
| Image input  | \$8.00 (cached \$2.00) |
| Image output | \$30.00                |

Because billing is per token, the `low` / `medium` / `high` per-image reference prices at 1K sizes match `gpt-image-2` (about \$0.006 / \$0.053 / \$0.211 at 1024×1024). The full cost table is in the [gpt-image-2 official-relay guide](/en/api-capabilities/gpt-image-2/overview). `xhigh` / `max` and 2K / 4K have no fixed per-image price; go by `usage.output_tokens` in each response.

### Groups and the reverse-engineered sibling

| Model                    | Route                                | Groups                                         | Billing          |
| ------------------------ | ------------------------------------ | ---------------------------------------------- | ---------------- |
| `gpt-image-2.5-flare`    | Official relay                       | `Default` / `image2Enterprise` (1.2x) / `svip` | Per token        |
| `gpt-image-2.5-sunburst` | Official relay                       | `Default` / `image2Enterprise` (1.2x) / `svip` | Per token        |
| `gpt-image-2.5-all`      | Reverse-engineered (ChatGPT web app) | `Default`                                      | \$0.03 per image |

The `Default` group works out of the box; production workloads that need higher stability can use the `image2Enterprise` group, which has steadier supply. Model names and endpoints are unchanged across groups. On the reverse-engineered side, `gpt-image-2.5-all` is sourced from the ChatGPT web app and priced the same as `gpt-image-2-all`; see the [gpt-image-2-all guide](/en/api-capabilities/gpt-image-2-all/overview).

### Stack recharge promotions

Official-relay pricing matches OpenAI's list; the discount comes from recharge bonuses, which bring the effective cost below direct OpenAI billing. See [Recharge promotions](/en/faq/recharge-promotions).

## Summary and Recommendations

The real change in GPT-image-2.5 is not "bigger" but **split by scenario**: Flare covers most everyday generation at lower latency, Sunburst pushes editing precision and the quality ceiling one notch higher, and both keep `gpt-image-2` pricing. For teams already on `gpt-image-2`, this is close to a free upgrade.

* ✅ **Batch generation, social content, product images**: swap `gpt-image-2` for `gpt-image-2.5-flare`, faster with no quality loss
* ✅ **Multi-turn retouching, production-grade campaign creative**: use `gpt-image-2.5-sunburst` for more precise edits and better subject preservation
* ✅ **Budget-sensitive, size-agnostic**: `gpt-image-2.5-all` at \$0.03 per image is a good fit for prototyping
* ⚠️ **Measure the new quality tiers first**: `xhigh` / `max` have no official per-image price; verify with `usage` before production

<Info>
  **Sources and dates**:

  * OpenAI announcement: `openai.com/index/introducing-chatgpt-images-2-5`
  * OpenAI model pages: `developers.openai.com/api/docs/models/gpt-image-2.5-flare`, `developers.openai.com/api/docs/models/gpt-image-2.5-sunburst`
  * OpenAI image generation guide: `developers.openai.com/api/docs/guides/image-generation`
  * Data retrieved: September 9, 2026
</Info>
