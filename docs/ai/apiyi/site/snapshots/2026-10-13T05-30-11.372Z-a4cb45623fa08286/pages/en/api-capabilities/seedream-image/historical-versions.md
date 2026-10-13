> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedream Historical Versions

> Seedream 5.0 Flash / 5.0 Pro / 5.0 / 4.5 / 4.0 spec comparison, pricing differences, and migration guide. Every version remains callable — pick by need.

<Note>
  This page lists all Seedream versions **still callable** on APIYI. All versions are active simultaneously with **largely compatible parameters** — in most cases you switch by changing only the `model` field (5.0 Flash and 5.0 Pro do not support sequential generation or streaming; see the compatibility matrix below). For the latest version and a general introduction, see [Seedream Overview](/en/api-capabilities/seedream-image/overview).
</Note>

## Versions at a Glance

| Version ID | Release Date (UTC+8) | APIYI Price | Status | Recommended Use |
| - | - | - | - | - |
| `seedream-5-0-flash-260915` | 2026-09-15 | \$0.018 / request | 🆕 Latest · fast tier | High-volume generation, poster layouts, e-commerce and ad assets (\~15–20 s per image, cheapest in the series) |
| `seedream-5-0-pro-260628` | 2026-06-28 | \$0.12 / request | Pro tier | Top image quality / complex instructions for professional work (\~2 min per image) |
| `seedream-5-0-260128` | 2026-01-28 | \$0.035 / image | ✅ Recommended | Best overall experience, text rendering, png output |
| `seedream-4-5-251128` | 2025-11-28 | \$0.04 / image | ✅ Recommended | 4K + strongest text rendering (posters, ads) |
| `seedream-4-0-250828` | 2025-08-28 | \$0.03 / image | 🟡 Maintained | 4K + best price, only version supporting prompt fast mode |

<Tip>
  `seedream-5-0-260128` can also be invoked with the alias `seedream-5-0-lite-260128` — the official docs accept both model\_id strings, with identical behavior.
</Tip>

## Per-version Specs

### `seedream-5-0-flash-260915` (5.0 Flash)

* **Release date**: 2026-09-15 (UTC+8); available on APIYI since 2026-09-24
* **APIYI price**: **\$0.018 / request** (fixed per-request price, 1 image per request), the same as BytePlus official pricing. **Reference images are free** (1, 3 and 10 reference images each billed \$0.018 in our tests), and failed requests such as parameter errors are not billed. With top-up bonuses the effective price is roughly **9%–17% below** the official rate
* **Resolution tiers**: presets `1K` / `1.5K` / `2K` (**no 3K/4K**; passing them returns 400). Omitting `size` defaults to 2K. With presets, **the model picks the aspect ratio from the content** (2K produced 1776×2368 and 1664×2496 portraits in our tests); pass exact pixels if you need a fixed ratio
* **Exact pixel range**: 921,600–4,624,220 total pixels (about 0.92M–4.62M), long-to-short side ratio up to 16:1; out-of-range values return 400 with the valid range in the error message (`2688x1712` and `4096x256` work)
* **Output formats**: `png` / `jpeg`
* **Speed**: 11–20 s for text-to-image; about 16 s for editing with reference images, about 28 s with 10 reference images
* **Core features**:
  * Positioned by BytePlus as fast, layout-strong and low-cost: better font variety, composition and color brightness than 5.0 Pro on layout tasks, with less gray or yellow color cast
  * **Accurate text rendering**: a three-line Chinese poster and an English / Japanese / Korean title all rendered correctly in our tests
  * **Layer separation (transparent layers)**: `layer_decomposition: true` splits an image into a background base plus separate elements on alpha-channel layers, useful for re-layout and asset reuse
  * **Interactive editing**: edit by position (for example, "add a NEW badge in the top-right corner") while leaving the rest of the image unchanged
  * Multi-image fusion with **up to 10** reference images (an 11th returns 400)
* **Known limitations**:
  * **No `sequential_image_generation` / `stream`**: as with 5.0 Pro, any value (including `"disabled"`) returns 400, so don't send them
  * `n` is silently ignored; you get and pay for 1 image
  * **Adds an "AI generated" watermark by default**; pass `watermark: false` explicitly for commercial use
  * **Transparency needs layer separation, not prompting**: asking for a transparent background in the prompt returns a png without an alpha channel (the checkerboard is drawn into the image). For transparent assets use `layer_decomposition: true` with one reference image; it returns a filled-in background base plus several RGBA layers (12 images in about 78 s at 1K in our tests). **Layer separation is billed per output image**: 12 images cost \$0.216. A 2K layer request returned nothing after 15 minutes **but was still billed \$0.216**, so always use `1K`. See [Image Editing](/en/api-capabilities/seedream-image/image-edit)
  * For photorealistic portraits and fine material detail, BytePlus still recommends 5.0 Pro

### `seedream-5-0-pro-260628` (5.0 Pro)

* **Release date**: 2026-06-28 (UTC+8); available on APIYI since 2026-07-19
* **APIYI price**: **\$0.12 / request** (fixed per-request price, 1 image per request, ≈ ¥0.84 list). Officially the model uses two output-pixel price tiers (≤2.36M / >2.36M) plus a fee for reference images beyond the first; APIYI simplifies this to a flat per-request price with input-image fees included
* **Resolution tiers**: presets `1K` / `2K` (**no 3K/4K presets**) plus exact pixels `WxH` up to **4.19M** total (max 2048×2048; at 16:9 the longest edge reaches `2720x1530` ≈ 2.7K, verified)
* **Output format**: `png` / `jpeg`
* **Prompt optimization**: standard / fast
* **Highlights**:
  * Strongest image quality and instruction following in the family; interactive editing (specify edit locations via coordinates, selection boxes, arrows)
  * Multi-image fusion officially supports **up to 10 reference images**
* **Known limitations**:
  * **`sequential_image_generation` / `stream` are not accepted** — any value (including `"disabled"`) returns 400; omit both parameters entirely
  * Slow generation: consistently **\~2 minutes** per image (110-130s measured) — set client timeout ≥ 240s
  * 3.4× the unit price of 5.0-lite; use 5.0-lite for everyday work

### `seedream-5-0-260128` (5.0-lite)

* **Release date**: 2026-01-28 (UTC+8)
* **APIYI price**: \$0.035 / image (≈ ¥0.245 list)
* **Resolution tiers**: `2K` / `3K` (**no 4K**)
* **Output format**: `png` / `jpeg` (only version with png output)
* **Prompt optimization**: standard
* **Highlights**:
  * Best overall experience; the most mature implementation of multi-image fusion / editing / batch sequence
  * Only version supporting `png` output (and therefore transparent backgrounds)
  * Mature streaming output (`stream: true`)
* **Known limits**:
  * Resolution capped at 3K (\~3072×3072). For 4K assets, use 4.5 / 4.0
* **Official docs**: `docs.byteplus.com/en/docs/ModelArk/1824121`

### `seedream-4-5-251128`

* **Release date**: 2025-11-28 (UTC+8)
* **APIYI price**: \$0.04 / image (≈ ¥0.28 list)
* **Resolution tiers**: `2K` / `4K`
* **Output format**: `jpeg`
* **Prompt optimization**: standard
* **Highlights**:
  * 1.2B-parameter unified generation-editing architecture
  * **Text rendering breakthrough**: small text remains crisp — best in class for posters, ads, UI screenshots
  * Multi-image fusion explicitly supports up to 10 reference images
  * Editing preserves lighting, tone, and natural facial detail
* **Known limits**:
  * `jpeg` output only (no `png`, no transparency)
* **News article**: [Seedream 4.5 launch](/en/news/seedream-4-5-launch)

### `seedream-4-0-250828`

* **Release date**: 2025-08-28 (UTC+8)
* **APIYI price**: \$0.03 / image (≈ ¥0.21 list)
* **Resolution tiers**: `1K` / `2K` / `4K` (broadest coverage)
* **Output format**: `jpeg`
* **Prompt optimization**: standard / **fast**
* **Highlights**:
  * Battle-tested stable version
  * Strong visual consistency, balanced 4K detail
  * **Only version supporting prompt fast mode** — faster generation for cost-sensitive scenarios
* **Known limits**:
  * Text rendering weaker than 4.5
  * `jpeg` output only

## Migration Guidance

<Steps>
  <Step title="Assess differences">
    The versions are **largely compatible at the parameter level** — in most cases change only the `model` field to switch. Double-check:

    * Whether your `size` tier is supported by the new version (5.0 Flash and 5.0 Pro top out around 2K; 5.0 has no 1K / 4K; 4.5 has no 1K; 4.0 has all)
    * Whether you send `sequential_image_generation` or `stream` (remove them when switching to 5.0 Flash / 5.0 Pro, or you get a 400)
    * Whether you depend on `output_format: "png"` (5.0 only)
    * Whether you use `prompt_optimization: "fast"` (4.0 only)
  </Step>

  <Step title="Run them side by side">
    Run the same prompt batch on the old and new versions, compare quality and cost. Validate with a small batch (10-20 images) before scaling.
  </Step>

  <Step title="Roll out gradually">
    Cut traffic in stages (10% / 50% / 100%). At each stage, observe quality, failure rate, and cost before scaling further.
  </Step>

  <Step title="Keep a fallback">
    Keep both old and new `model` configs in production code. If the new version misbehaves, flip back instantly. Each version bills at its own unit price — running both has no extra cost.
  </Step>
</Steps>

## Legacy Invocation Example

```python theme={null}
{/* Switching versions only changes the model field; other params are compatible */}
from openai import OpenAI

client = OpenAI(api_key="sk-your-api-key", base_url="https://api.apiyi.com/v1")

resp = client.images.generate(
    model="seedream-4-0-250828",   # change this line to switch to 4.5 / 5.0
    prompt="A serene mountain landscape at golden hour, snow-capped peaks, ultra detailed, 4K",
    size="4K",                      # NOTE: 5.0 does not support 4K — use 2K or 3K
    response_format="url",
    extra_body={
        "watermark": False,
    }
)

print(resp.data[0].url)
```

## Cost Comparison

Estimated by typical volume (**before top-up bonuses**; effective price drops to as low as 80% with bonuses):

| Version | Unit Price | 100 images | 1,000 images | 10,000 images |
| - | - | - | - | - |
| `seedream-5-0-flash-260915` | \$0.018 / request | \$1.8 | \$18 | \$180 |
| `seedream-5-0-pro-260628` | \$0.12 / request | \$12 | \$120 | \$1200 |
| `seedream-5-0-260128` | \$0.035 | \$3.5 | \$35 | \$350 |
| `seedream-4-5-251128` | \$0.04 | \$4 | \$40 | \$400 |
| `seedream-4-0-250828` | \$0.03 | \$3 | \$30 | \$300 |

<Info>
  **How to choose**:

  * 4K assets + strong text → **4.5**
  * 4K assets + best price → **4.0**
  * High volume / poster layouts / speed and cost → **5.0 Flash** (\$0.018/request, \~15–20 s per image, up to about 2K)
  * Best overall / png output / transparent backgrounds → **5.0**
  * Long-running stable batch production → **4.0** (proven, cheapest, fast prompt mode)
  * Top quality / complex instructions for professional work → **5.0-pro** (\$0.12/request + \~2 min per image — skip unless you need it)
</Info>

## Compatibility Matrix

| Dimension | 5.0-flash | 5.0-pro | 5.0 | 4.5 | 4.0 | Migration note |
| - | - | - | - | - | - | - |
| `1K` resolution tier | ✅ | ✅ | ❌ | ❌ | ✅ | Migrating from 4.0 to 5.0-lite → switch 1K to 2K |
| `4K` resolution tier | ❌ | ❌ | ❌ | ✅ | ✅ | Migrating from 4.5/4.0 to the 5.0 series → change the tier |
| `output_format: "png"` | ✅ (no alpha when generating directly; transparency via layers) | ✅ | ✅ | ❌ | ❌ | Migrating from the 5.0 series → 4.5/4.0: **transparency is lost** |
| `prompt_optimization: "fast"` | ❌ (not supported officially) | ✅ | ❌ | ❌ | ✅ | 5.0-lite / 4.5 don't support fast — drop the parameter when switching |
| `image` array (multi-image fusion) | ✅ (up to 10, tested) | ✅ (up to 10 explicit) | ✅ | ✅ (up to 10 explicit) | ✅ | Identical protocol |
| `sequential_image_generation` | ❌ (**any value returns 400**, tested) | ❌ (**any value returns 400**) | ✅ | ✅ | ✅ | Migrating to flash / pro: remove the parameter entirely (including `"disabled"`) |
| `stream` streaming | ❌ (400 if passed, tested) | ❌ (400 if passed) | ✅ | ✅ | ✅ | Migrating to flash / pro: remove the parameter |
| `layer_decomposition` layers | ✅ (billed per output image, use 1K) | — | — | — | — | Tested on 5.0-flash only |
| Response fields (`url` / `b64_json`) | identical | identical | identical | identical | identical | — |
| Billing | **\$0.018 per request** | **\$0.12 per request** | per image | per image | per image | — |

## Related Docs

* [Seedream Overview](/en/api-capabilities/seedream-image/overview)
* [Text-to-Image Playground](/en/api-capabilities/seedream-image/text-to-image)
* [Image Editing Playground](/en/api-capabilities/seedream-image/image-edit)
* [Seedream 4.5 launch](/en/news/seedream-4-5-launch)
* BytePlus official tutorial: `docs.byteplus.com/en/docs/ModelArk/1824121`


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.