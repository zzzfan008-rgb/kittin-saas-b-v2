> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Series Pricing

> Complete pricing comparison for Nano Banana series image models (Pro / 2.1 / 2 / 2 Lite / Gen 1), including per-request pricing, token-based pricing, top-up bonuses, and token selection guide. As low as 30.3% of official pricing.

## Overview

The Nano Banana series includes five image generation models, all available through APIYI at prices significantly lower than official rates. This page summarizes all Nano Banana model pricing to help you choose the best billing plan.

<Info>
  When calling the API, the **token type** you use determines the billing method. Nano Banana Pro, 2.1, 2, and Lite all support two billing modes: **per-request** and **token-based**. Each has two tiers: default stable tier and enterprise high-availability tier.
</Info>

## Model Overview

| Feature | **Nano Banana Pro** | **Nano Banana 2.1** | **Nano Banana 2** | **Nano Banana 2 Lite** | **Nano Banana (Gen 1)** |
| - | - | - | - | - | - |
| Model ID | `gemini-3-pro-image-preview` | `gemini-nano-banana-2.1` | `gemini-3.1-flash-image-preview` | `gemini-3.1-flash-lite-image` | `gemini-2.5-flash-image` |
| Max Resolution | 4K | 4K | 4K | 1K | 1K |
| Per-request | \$0.09/req | \$0.045/req | \$0.055/req | \$0.025/req | \$0.02/req |
| Token-based | Beta testing | ✅ Available | ✅ Available | ✅ Available | ❌ Not supported |
| Best Discount | 31.25% of official | 33.2% of official | 30.3% of official | 40% of official | 50% of official |

## Nano Banana Pro Pricing

Model: `gemini-3-pro-image-preview`

### Per-request Billing

\$0.09 per request, unified pricing for 1-4K resolution. Simple billing, great savings on 4K images.

| Item | APIYI Default | Top-up +10% | Top-up +20% | Google Official |
| - | - | - | - | - |
| Price per image (\$) | \$0.09 | \$0.0818 | \$0.075 | \$0.24 |
| Price per image (¥) | ¥0.63 | ¥0.573 | ¥0.525 | ¥1.68 |
| vs. Official | 37.5% | 34.0% | **31.25%** | / |

<Tip>
  Save up to **68.75%** on 4K images! Per-request billing doesn't differentiate by resolution — 4K costs the same as 1K, so higher resolution means better value.
</Tip>

### Token-based Billing (Not yet open, beta available)

| Item | APIYI | Google Official |
| - | - | - |
| Input | \$0.88/M tokens | \$2/M tokens |
| Output | \$52.8/M tokens | \$120/M tokens |
| vs. Official | **44%** | / |

Estimated per-image cost:

| Resolution | APIYI Estimate | Google Estimate |
| - | - | - |
| 1-2K | \~\$0.075 | \~\$0.134 |
| 4K | \~\$0.11 | \~\$0.24 |

<Info>
  Token-based costs vary with input/output image tokens. These are estimates. Token-based billing is better for 1-2K images; per-request billing is more cost-effective for 4K.
</Info>

## Nano Banana 2.1 Pricing

Model: `gemini-nano-banana-2.1` (released October 6, 2026; an upgrade to Nano Banana 2 — see [Nano Banana 2.1 Image Gen/Editing](/en/api-capabilities/gemini-nano-banana-2.1/overview))

### Per-request Billing

\$0.045 per request (down from \$0.05 since October 13, 2026), the same price for 1K–4K, so 4K images get the best value.

| Item | APIYI default | +10% top-up bonus | +20% top-up bonus | Google (4K) |
| - | - | - | - | - |
| Per image (\$) | \$0.045 | \$0.0409 | \$0.0375 | \$0.113 |
| Per image (¥) | ¥0.315 | ¥0.286 | ¥0.263 | ¥0.791 |
| vs. Google | **39.8%** | **36.2%** | **33.2%** | / |

### Token-based Billing

| Item | APIYI | Google |
| - | - | - |
| Input | \$0.66/M tokens | \$1.5/M tokens |
| Output (image, text and thinking at one rate) | \$13.2/M tokens | Images \$30/M; text and thinking \$7.5/M |
| vs. Google | **44%** (of the image rate) | / |

Measured cost per image with token-based billing (2026-10-07, including default thinking tokens):

| Resolution | APIYI (measured) | Google |
| - | - | - |
| 1K | \~\$0.026 | \~\$0.040 |
| 2K | \~\$0.035 | \~\$0.058 |
| 4K | \~\$0.062 | \~\$0.120 |

<Info>
  Nano Banana 2.1 thinks by default, so each image adds roughly 400–1300 thinking tokens billed at the output rate together with the image, so the token-based cost per image varies. Token-based is cheaper for 1K / 2K; per-request (\$0.045) is cheaper for 4K. 512px is not supported.
</Info>

<Note>Model prices are aligned with the official website and may change with it; the table above is for reference only — the **Model Pricing** tab in the top navigation is authoritative: [Model Pricing](/en/models/index).</Note>

## Nano Banana 2 Pricing

Model: `gemini-3.1-flash-image-preview`

### Per-request Billing

\$0.055 per request, unified pricing for 1-4K resolution.

| Item | APIYI Default | Top-up +10% | Top-up +20% | Google Official |
| - | - | - | - | - |
| Price per image (\$) | \$0.055 | \$0.05 | \$0.0458 | \$0.151 |
| Price per image (¥) | ¥0.385 | ¥0.35 | ¥0.32 | ¥1.68 |
| vs. Official | **36.4%** | **33.1%** | **30.3%** | / |

### Token-based Billing

| Item | APIYI | Google Official |
| - | - | - |
| Input | \$0.18/M tokens | \$0.5/M tokens |
| Output | \$21.6/M tokens | \$60/M tokens |
| vs. Official | **36%** | / |

Estimated per-image cost:

| Resolution | APIYI Estimate | Google Official |
| - | - | - |
| 512px | \~\$0.024 | \$0.045 |
| 1K | \~\$0.03 | \$0.067 |
| 2K | \~\$0.036 | \$0.101 |
| 4K | \~\$0.06 | \$0.151 |

<Info>
  These are estimates based on actual input/output tokens. Stack with top-up bonuses (up to 20%) for even lower costs.
</Info>

## Nano Banana 2 Lite Pricing

Model: `gemini-3.1-flash-lite-image`

The fastest, cheapest tier — focused on the 1K canvas, \~4s per image. **Prefer Pay-as-you-go Priority**: the real-world unit price is lower and predictable.

### Token-based Billing (Recommended)

| Item | APIYI | Google Official | vs. Official |
| - | - | - | - |
| Input | \$0.10/M tokens | \$0.25/M tokens | **40%** |
| Output | \$12/M tokens | \$30/M tokens | **40%** |

Estimated per-image cost:

| Resolution | APIYI Estimate | Google Official |
| - | - | - |
| 1K | **\~\$0.018** | \~\$0.034 |

<Info>
  **Predictable in practice**: a 1K image under token-based (per-token) billing **averages \~\$0.018/call in practice** (typical range \~\$0.016–\$0.019, driven by output tokens), cheaper than the flat per-call \$0.025/image. Stack with top-up bonuses for even lower costs.
</Info>

### Per-request Billing

| Item | APIYI | Google Official | Note |
| - | - | - | - |
| Price per image | \$0.025/req | \~\$0.034/image | Flat rate; may be lowered later but unchanged for now |

<Tip>
  **Which billing mode?** For Lite, **prefer `Pay-as-you-go Priority`** — \~\$0.018/call in practice, cheaper than per-call \$0.025 and predictable, and one token also covers Nano Banana Pro / 2's per-call billing to run the whole series. The per-call \$0.025/image is a flat rate that may be lowered later but is unchanged for now.
</Tip>

## Nano Banana Gen 1 Pricing

Model: `gemini-2.5-flash-image`

1K images only, fixed per-request billing.

| Item | APIYI | Google Official | Discount |
| - | - | - | - |
| Price per image | \$0.02/req | \$0.039/req | **\~50% off** |

Also eligible for top-up bonus promotions.

## Top-up Bonuses

Stack top-up bonuses on top of already discounted prices for even greater savings.

<CardGroup cols={2}>
  <Card title="Top-up Bonus Details" icon="gift" href="/en/faq/recharge-promotions">
    View current top-up bonus tiers and promotion details.
  </Card>

  <Card title="Token Management" icon="key" href="https://api.apiyi.com/token">
    Create and manage your API tokens.
  </Card>
</CardGroup>

## Token Type Selection Guide

<Info>
  When creating a token, the "Billing model" setting determines the billing method. Choose based on your primary use case:
</Info>

| Model | Use Case | Recommended Token Type |
| - | - | - |
| Nano Banana Pro | Mixed 1-4K usage | Token-based (priority) |
| Nano Banana Pro | 4K only | Per-request |
| Nano Banana 2 | Mixed 0.5K-4K usage | Token-based (priority) |
| Nano Banana 2 | 4K only | Per-request |
| Nano Banana 2 Lite | 1K volume generation | Token-based (priority) |

<Tip>
  **Simple rule**: If you mainly generate 4K images, choose **per-request billing** (same price regardless of resolution). For mixed resolution usage, **token-based billing** saves more on lower resolutions.
</Tip>

## A Changing Bill Is Not a Price Change

Two bills for the same model can differ a lot without any price change: under **token-based billing** the cost of a single request floats with your parameters. The two biggest measured drivers:

| Parameter | Effect on one request's bill | Applies to |
| - | - | - |
| Output resolution | 1K to 4K: about **+90%** (\$0.033 → \$0.064, measured on Nano Banana 2; Pro token-based 1-2K to 4K is about +47%) | Token-based billing only; 2 Lite and the first generation output 1K, so this does not apply |
| `thinkingLevel` | default tier to `high`: about **+54%** | Nano Banana 2 / 2 Lite only; Pro always thinks and cannot be adjusted |

A request costing about \$0.033 yesterday and about \$0.052 today on the same model usually means different parameters, not a price adjustment.

<Info>
  Per-tier measurements (tokens, cost, latency) are in [Nano Banana 2 Image Gen/Editing](/en/api-capabilities/nano-banana-2-image/overview) and [Usage Fields & Output Explained](/en/api-capabilities/nano-banana-usage-metadata).
</Info>

**Choose per-request billing when you need predictable cost**: one price from 1K to 4K (Pro \$0.09 per image, Nano Banana 2 \$0.055), independent of resolution and token counts.

## Related Documentation

* [Nano Banana 2 Image Gen/Edit](/en/api-capabilities/nano-banana-2-image/overview) - Complete Nano Banana 2 guide
* [Nano Banana Pro Image Generation](/en/api-capabilities/nano-banana-image) - Nano Banana Pro guide
* [Nano Banana Pro Image Editing](/en/api-capabilities/nano-banana-image-edit) - Image editing features
* [Top-up Promotions](/en/faq/recharge-promotions) - Top-up bonus details


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.