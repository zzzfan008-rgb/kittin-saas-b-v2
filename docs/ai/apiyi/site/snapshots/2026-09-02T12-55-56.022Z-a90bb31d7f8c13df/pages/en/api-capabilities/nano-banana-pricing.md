> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Series Pricing

> Complete pricing comparison for Nano Banana series image models (Pro / 2 / 2 Lite / Gen 1), including per-request pricing, token-based pricing, top-up bonuses, and token selection guide. As low as 30.3% of official pricing.

## Overview

The Nano Banana series includes four image generation models, all available through APIYI at prices significantly lower than official rates. This page summarizes all Nano Banana model pricing to help you choose the best billing plan.

<Info>
  When calling the API, the **token type** you use determines the billing method. Nano Banana Pro, 2, and Lite all support two billing modes: **per-request** and **token-based**. Each has two tiers: default stable tier and enterprise high-availability tier.
</Info>

## Model Overview

| Feature        | **Nano Banana Pro**          | **Nano Banana 2**                | **Nano Banana 2 Lite**        | **Nano Banana (Gen 1)**  |
| -------------- | ---------------------------- | -------------------------------- | ----------------------------- | ------------------------ |
| Model ID       | `gemini-3-pro-image-preview` | `gemini-3.1-flash-image-preview` | `gemini-3.1-flash-lite-image` | `gemini-2.5-flash-image` |
| Max Resolution | 4K                           | 4K                               | 1K                            | 1K                       |
| Per-request    | \$0.09/req                   | \$0.055/req                      | \$0.025/req                   | \$0.02/req               |
| Token-based    | Beta testing                 | ✅ Available                      | ✅ Available                   | ❌ Not supported          |
| Best Discount  | 31.25% of official           | 30.3% of official                | 40% of official               | 50% of official          |

## Nano Banana Pro Pricing

Model: `gemini-3-pro-image-preview`

### Per-request Billing

\$0.09 per request, unified pricing for 1-4K resolution. Simple billing, great savings on 4K images.

| Item                 | APIYI Default | Top-up +10% | Top-up +20% | Google Official |
| -------------------- | ------------- | ----------- | ----------- | --------------- |
| Price per image (\$) | \$0.09        | \$0.0818    | \$0.075     | \$0.24          |
| Price per image (¥)  | ¥0.63         | ¥0.573      | ¥0.525      | ¥1.68           |
| vs. Official         | 37.5%         | 34.0%       | **31.25%**  | /               |

<Tip>
  Save up to **68.75%** on 4K images! Per-request billing doesn't differentiate by resolution — 4K costs the same as 1K, so higher resolution means better value.
</Tip>

### Token-based Billing (Not yet open, beta available)

| Item         | APIYI           | Google Official |
| ------------ | --------------- | --------------- |
| Input        | \$0.88/M tokens | \$2/M tokens    |
| Output       | \$52.8/M tokens | \$120/M tokens  |
| vs. Official | **44%**         | /               |

Estimated per-image cost:

| Resolution | APIYI Estimate | Google Estimate |
| ---------- | -------------- | --------------- |
| 1-2K       | \~\$0.075      | \~\$0.134       |
| 4K         | \~\$0.11       | \~\$0.24        |

<Info>
  Token-based costs vary with input/output image tokens. These are estimates. Token-based billing is better for 1-2K images; per-request billing is more cost-effective for 4K.
</Info>

## Nano Banana 2 Pricing

Model: `gemini-3.1-flash-image-preview`

### Per-request Billing

\$0.055 per request, unified pricing for 1-4K resolution.

| Item                 | APIYI Default | Top-up +10% | Top-up +20% | Google Official |
| -------------------- | ------------- | ----------- | ----------- | --------------- |
| Price per image (\$) | \$0.055       | \$0.05      | \$0.0458    | \$0.151         |
| Price per image (¥)  | ¥0.385        | ¥0.35       | ¥0.32       | ¥1.68           |
| vs. Official         | **36.4%**     | **33.1%**   | **30.3%**   | /               |

### Token-based Billing

| Item         | APIYI           | Google Official |
| ------------ | --------------- | --------------- |
| Input        | \$0.18/M tokens | \$0.5/M tokens  |
| Output       | \$21.6/M tokens | \$60/M tokens   |
| vs. Official | **36%**         | /               |

Estimated per-image cost:

| Resolution | APIYI Estimate | Google Official |
| ---------- | -------------- | --------------- |
| 512px      | \~\$0.024      | \$0.045         |
| 1K         | \~\$0.03       | \$0.067         |
| 2K         | \~\$0.036      | \$0.101         |
| 4K         | \~\$0.06       | \$0.151         |

<Info>
  These are estimates based on actual input/output tokens. Stack with top-up bonuses (up to 20%) for even lower costs.
</Info>

## Nano Banana 2 Lite Pricing

Model: `gemini-3.1-flash-lite-image`

The fastest, cheapest tier — focused on the 1K canvas, \~4s per image. **Prefer Pay-as-you-go Priority**: the real-world unit price is lower and predictable.

### Token-based Billing (Recommended)

| Item   | APIYI           | Google Official | vs. Official |
| ------ | --------------- | --------------- | ------------ |
| Input  | \$0.10/M tokens | \$0.25/M tokens | **40%**      |
| Output | \$12/M tokens   | \$30/M tokens   | **40%**      |

Estimated per-image cost:

| Resolution | APIYI Estimate | Google Official |
| ---------- | -------------- | --------------- |
| 1K         | **\~\$0.018**  | \~\$0.034       |

<Info>
  **Predictable in practice**: a 1K image under token-based (per-token) billing **averages \~\$0.018/call in practice** (typical range \~\$0.016–\$0.019, driven by output tokens), cheaper than the flat per-call \$0.025/image. Stack with top-up bonuses for even lower costs.
</Info>

### Per-request Billing

| Item            | APIYI       | Google Official | Note                                                  |
| --------------- | ----------- | --------------- | ----------------------------------------------------- |
| Price per image | \$0.025/req | \~\$0.034/image | Flat rate; may be lowered later but unchanged for now |

<Tip>
  **Which billing mode?** For Lite, **prefer `Pay-as-you-go Priority`** — \~\$0.018/call in practice, cheaper than per-call \$0.025 and predictable, and one token also covers Nano Banana Pro / 2's per-call billing to run the whole series. The per-call \$0.025/image is a flat rate that may be lowered later but is unchanged for now.
</Tip>

## Nano Banana Gen 1 Pricing

Model: `gemini-2.5-flash-image`

1K images only, fixed per-request billing.

| Item            | APIYI      | Google Official | Discount      |
| --------------- | ---------- | --------------- | ------------- |
| Price per image | \$0.02/req | \$0.039/req     | **\~50% off** |

Also eligible for top-up bonus promotions.

## Top-up Bonuses

Stack top-up bonuses on top of already discounted prices for even greater savings.

<CardGroup cols={2}>
  <Card title="Top-up Bonus Details" icon="gift" href="/faq/recharge-promotions">
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

| Model              | Use Case             | Recommended Token Type |
| ------------------ | -------------------- | ---------------------- |
| Nano Banana Pro    | Mixed 1-4K usage     | Token-based (priority) |
| Nano Banana Pro    | 4K only              | Per-request            |
| Nano Banana 2      | Mixed 0.5K-4K usage  | Token-based (priority) |
| Nano Banana 2      | 4K only              | Per-request            |
| Nano Banana 2 Lite | 1K volume generation | Token-based (priority) |

<Tip>
  **Simple rule**: If you mainly generate 4K images, choose **per-request billing** (same price regardless of resolution). For mixed resolution usage, **token-based billing** saves more on lower resolutions.
</Tip>

## Related Documentation

* [Nano Banana 2 Image Gen/Edit](/en/api-capabilities/nano-banana-2-image/overview) - Complete Nano Banana 2 guide
* [Nano Banana Pro Image Generation](/en/api-capabilities/nano-banana-image) - Nano Banana Pro guide
* [Nano Banana Pro Image Editing](/en/api-capabilities/nano-banana-image-edit) - Image editing features
* [Top-up Promotions](/en/faq/recharge-promotions) - Top-up bonus details
