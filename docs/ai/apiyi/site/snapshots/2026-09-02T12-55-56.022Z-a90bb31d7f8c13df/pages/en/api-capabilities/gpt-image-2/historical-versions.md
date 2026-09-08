> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image Legacy Versions

> Overview of legacy GPT-Image-1 / 1-mini / 1.5 models — model IDs, pricing, endpoints, and migration tips for moving to GPT-Image-2 / GPT-Image-2-All.

<Info>
  For new projects, use [GPT-Image-2](/en/api-capabilities/gpt-image-2/overview) (official) or [GPT-Image-2-All](/en/api-capabilities/gpt-image-2-all/overview) (reverse channel, flat \$0.03/image). This page keeps the essentials of the legacy versions so existing integrations can troubleshoot and migrate smoothly.
</Info>

## Legacy Lineup

| Model ID           | Released | Endpoint                                     | Pricing                                    | Status                                          |
| ------------------ | -------- | -------------------------------------------- | ------------------------------------------ | ----------------------------------------------- |
| `gpt-image-1.5`    | Dec 2025 | `/v1/images/generations`                     | Input \$5.00 / Output \$10.00 per M tokens | Available; upgrade to `gpt-image-2` recommended |
| `gpt-image-1`      | Apr 2025 | `/v1/images/generations`, `/v1/images/edits` | Input \$2.50 / Output \$8.00 per M tokens  | Available; upgrade to `gpt-image-2` recommended |
| `gpt-image-1-mini` | Apr 2025 | `/v1/images/generations`                     | Lower than `gpt-image-1`                   | Available                                       |

<Tip>
  **Drop-in migration**: change `model` to `gpt-image-2` or `gpt-image-2-all`. Parameters (`size` / `quality` / `output_format`, …) are largely compatible — no structural code changes required.
</Tip>

## Common Parameters (Generation)

All legacy versions share the same generation parameters:

| Parameter            | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `model`              | `gpt-image-1.5` / `gpt-image-1` / `gpt-image-1-mini` |
| `prompt`             | Image description (up to 1000 chars)                 |
| `size`               | `1024x1024` / `1536x1024` / `1024x1536` / `auto`     |
| `quality`            | `low` / `medium` / `high` / `auto`                   |
| `output_format`      | `png` (default) / `jpeg` / `webp`                    |
| `output_compression` | JPEG/WebP only, 0–100%                               |
| `background`         | `transparent` / `opaque` / `auto`                    |
| `n`                  | Number of images (1–10)                              |

## Quick Example

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

response = client.images.generate(
    model="gpt-image-1.5",  {/* or gpt-image-1 / gpt-image-1-mini */}
    prompt="A professional product photo on white background, soft studio lighting",
    size="1024x1024",
    quality="high"
)

print(response.data[0].url)
```

## Per-Image Pricing Reference

GPT-Image-1 / 1.5 support both token billing and per-image billing — the system automatically picks whichever is cheaper:

### GPT-Image-1.5

| Quality | 1024×1024 | 1024×1536 / 1536×1024 |
| ------- | --------- | --------------------- |
| Low     | \$0.009   | \$0.013               |
| Medium  | \$0.034   | \$0.050               |
| High    | \$0.133   | \$0.200               |

### GPT-Image-1

| Quality | 1024×1024 | 1024×1536 / 1536×1024 |
| ------- | --------- | --------------------- |
| Low     | \$0.005   | \$0.006               |
| Medium  | \$0.011   | \$0.015               |
| High    | \$0.036   | \$0.052               |

<Warning>
  Per-image figures are reference only. Actual charges follow whichever billing mode (token or per-image) the system determines is cheaper.
</Warning>

## Image Editing (`gpt-image-1` only)

`gpt-image-1` supports mask-based editing via the `/v1/images/edits` endpoint:

```python theme={null}
response = client.images.edit(
    model="gpt-image-1",
    image=open("original.png", "rb"),
    mask=open("mask.png", "rb"),
    prompt="A modern glass skyscraper with reflective windows",
    size="1024x1024"
)
```

| Parameter | Description                                               |
| --------- | --------------------------------------------------------- |
| `image`   | Source image, PNG/WebP/JPG, \< 50MB each, up to 16 images |
| `mask`    | Mask image — pixels with alpha=0 will be repainted        |
| `prompt`  | Description of what to generate in the masked region      |

<Note>
  For new editing workflows, use [GPT-Image-2 Edit](/en/api-capabilities/gpt-image-2/image-edit) (official) or [GPT-Image-2-All Edit](/en/api-capabilities/gpt-image-2-all/image-edit) (reverse, supports up to 16 input images for blending).
</Note>

## Migrating to GPT-Image-2 / 2-All

| Your need                                                                  | Recommended target                                |
| -------------------------------------------------------------------------- | ------------------------------------------------- |
| Stay on official OpenAI endpoint, need precise size/quality control        | `gpt-image-2` (official)                          |
| Want predictable flat pricing (\$0.03/image), better instruction following | `gpt-image-2-all` (reverse)                       |
| Still need mask-based image editing                                        | `gpt-image-2-all` edit endpoint (up to 16 images) |

<CardGroup cols={2}>
  <Card title="GPT-Image-2 Overview" icon="bolt" href="/en/api-capabilities/gpt-image-2/overview">
    Latest official version — endpoint and parameters compatible with legacy
  </Card>

  <Card title="GPT-Image-2-All Overview" icon="sparkles" href="/en/api-capabilities/gpt-image-2-all/overview">
    Reverse channel, flat \$0.03/image, faster turnaround
  </Card>

  <Card title="Official vs Reverse Comparison" icon="scale" href="/en/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    Side-by-side comparison and selection guide
  </Card>
</CardGroup>
