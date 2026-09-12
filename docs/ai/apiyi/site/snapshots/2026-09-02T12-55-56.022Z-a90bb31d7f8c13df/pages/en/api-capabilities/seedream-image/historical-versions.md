> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedream Historical Versions

> Seedream 5.0 / 4.5 / 4.0 spec comparison, pricing differences, and migration guide. All three versions remain callable — pick by need, no breaking changes.

<Note>
  This page lists all Seedream versions **still callable** on APIYI. The three versions are active simultaneously, with **fully compatible parameters** — switch by changing only the `model` field. For the latest version and a general introduction, see [Seedream Overview](/en/api-capabilities/seedream-image/overview).
</Note>

## Versions at a Glance

| Version ID                | Release Date (UTC+8) | APIYI Price      | Status                 | Recommended Use                                                                    |
| ------------------------- | -------------------- | ---------------- | ---------------------- | ---------------------------------------------------------------------------------- |
| `seedream-5-0-pro-260628` | 2026-06-28           | \$0.12 / request | 🆕 Pro tier            | Top image quality / complex instructions for professional work (\~2 min per image) |
| `seedream-5-0-260128`     | 2026-01-28           | \$0.035 / image  | ✅ Recommended (latest) | Best overall experience, text rendering, png output                                |
| `seedream-4-5-251128`     | 2025-11-28           | \$0.04 / image   | ✅ Recommended          | 4K + strongest text rendering (posters, ads)                                       |
| `seedream-4-0-250828`     | 2025-08-28           | \$0.03 / image   | 🟡 Maintained          | 4K + best price, only version supporting prompt fast mode                          |

<Tip>
  `seedream-5-0-260128` can also be invoked with the alias `seedream-5-0-lite-260128` — the official docs accept both model\_id strings, with identical behavior.
</Tip>

## Per-version Specs

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
    The three versions are **fully compatible at the parameter level** — change only the `model` field to switch. Double-check:

    * Whether your `size` tier is supported by the new version (5.0 has no 1K / 4K; 4.5 has no 1K; 4.0 has all)
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
    Keep both old and new `model` configs in production code. If the new version misbehaves, flip back instantly. All three versions share unified billing — running both has no extra cost.
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

| Version                   | Unit Price       | 100 images | 1,000 images | 10,000 images |
| ------------------------- | ---------------- | ---------- | ------------ | ------------- |
| `seedream-5-0-pro-260628` | \$0.12 / request | \$12       | \$120        | \$1200        |
| `seedream-5-0-260128`     | \$0.035          | \$3.5      | \$35         | \$350         |
| `seedream-4-5-251128`     | \$0.04           | \$4        | \$40         | \$400         |
| `seedream-4-0-250828`     | \$0.03           | \$3        | \$30         | \$300         |

<Info>
  **How to choose**:

  * 4K assets + strong text → **4.5**
  * 4K assets + best price → **4.0**
  * Best overall / png output / transparent backgrounds → **5.0**
  * Long-running stable batch production → **4.0** (proven, cheapest, fast prompt mode)
  * Top quality / complex instructions for professional work → **5.0-pro** (\$0.12/request + \~2 min per image — skip unless you need it)
</Info>

## Compatibility Matrix

| Dimension                            | 5.0-pro                       | 5.0       | 4.5                   | 4.0       | Migration note                                                           |
| ------------------------------------ | ----------------------------- | --------- | --------------------- | --------- | ------------------------------------------------------------------------ |
| `1K` resolution tier                 | ✅                             | ❌         | ❌                     | ✅         | Migrating from 4.0 to 5.0-lite → switch 1K to 2K                         |
| `4K` resolution tier                 | ❌                             | ❌         | ✅                     | ✅         | Migrating from 4.5/4.0 to the 5.0 series → change the tier               |
| `output_format: "png"`               | ✅                             | ✅         | ❌                     | ❌         | Migrating from the 5.0 series → 4.5/4.0: **transparency is lost**        |
| `prompt_optimization: "fast"`        | ✅                             | ❌         | ❌                     | ✅         | 5.0-lite / 4.5 don't support fast — drop the parameter when switching    |
| `image` array (multi-image fusion)   | ✅ (up to 10 explicit)         | ✅         | ✅ (up to 10 explicit) | ✅         | Identical protocol                                                       |
| `sequential_image_generation`        | ❌ (**any value returns 400**) | ✅         | ✅                     | ✅         | Migrating to pro: remove the parameter entirely (including `"disabled"`) |
| `stream` streaming                   | ❌ (400 if passed)             | ✅         | ✅                     | ✅         | Migrating to pro: remove the parameter                                   |
| Response fields (`url` / `b64_json`) | identical                     | identical | identical             | identical | —                                                                        |
| Billing                              | **\$0.12 per request**        | per image | per image             | per image | —                                                                        |

## Related Docs

* [Seedream Overview](/en/api-capabilities/seedream-image/overview)
* [Text-to-Image Playground](/en/api-capabilities/seedream-image/text-to-image)
* [Image Editing Playground](/en/api-capabilities/seedream-image/image-edit)
* [Seedream 4.5 launch](/en/news/seedream-4-5-launch)
* BytePlus official tutorial: `docs.byteplus.com/en/docs/ModelArk/1824121`
