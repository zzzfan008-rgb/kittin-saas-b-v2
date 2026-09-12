> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI gpt-image-2 Launches: Native 4K + 30% Price Cut

> OpenAI's flagship image model gpt-image-2 is here! Native support for any 2K/4K resolution, automatic high-fidelity reference images, 20-30% cheaper than 1.5. APIYI is live with zero-code OpenAI SDK migration.

## Key Highlights

* **🖼️ Native 2K/4K**: Single-shot output up to 3840×2160 (\~8.3MP), no upscaling pipeline needed
* **🎯 Auto High-Fidelity**: Reference image editing/fusion auto-enables high-fidelity, no manual `input_fidelity`
* **💰 20-30% Cheaper**: Token cost drops noticeably vs same-size, same-quality `gpt-image-1.5`
* **🌏 Native Chinese Prompts**: High-quality output without translation, stronger text rendering
* **🔌 Zero-Code OpenAI SDK**: Just point `base_url` to `api.apiyi.com/v1`
* **🛠️ Full Capabilities**: Text-to-image / reference editing / multi-image fusion (up to 5) / mask inpainting

## Background

In April 2026, OpenAI officially released **gpt-image-2**, the flagship upgrade to `gpt-image-1.5`. This is another structural step forward in OpenAI's image generation track: where 1.5 focused on "4x speed + precision editing," this generation tackles two long-standing pain points head-on — **resolution ceiling** and **per-unit cost**.

The most immediate change is **arbitrary valid sizes** — as long as you satisfy "max edge ≤ 3840px, both edges are multiples of 16, aspect ratio ≤ 3:1, total pixels 0.65MP–8.3MP," you can render directly. That means 4K landscape wallpapers, 1792×1024 cinematic frames, 3200×1800 infographics — all sizes that previously required upscaling post-processing — now come out in a single call.

The APIYI team integrated the model on day one. OpenAI's official SDK only needs a `base_url` change to call `gpt-image-2` — zero code migration.

## Detailed Analysis

### Core Features

<CardGroup cols={2}>
  <Card title="🖼️ Any Resolution (incl. 4K)" icon="expand">
    Supports any valid output size. Presets cover 1K / 2K / 3840×2160 4K. Custom sizes only need to satisfy basic constraints (edges as multiples of 16, ratio ≤ 3:1).
  </Card>

  <Card title="🎯 Auto High-Fidelity" icon="wand-sparkles">
    Reference image editing automatically enables high-fidelity processing. Detail, character identity, and text retention dramatically improved. **Do not** pass `input_fidelity` — it will error.
  </Card>

  <Card title="💰 20-30% Cheaper" icon="dollar-sign">
    1024×1024 high quality drops from the \$0.25 range of 1.5 to \$0.211/image. 2K/4K is token-metered but trends down equally — long-term cost noticeably lower.
  </Card>

  <Card title="🌏 Chinese + Text Rendering" icon="type">
    Native Chinese prompt support. Stable rendering of Chinese/English text in signage, posters, UI screenshots. Fine text is rarely blurry on `high` quality.
  </Card>
</CardGroup>

### Performance & Specs

| Dimension              | gpt-image-2                                                                                                                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Output resolution      | Any valid size (1K/2K/4K, max 3840×2160)                                                                                                                                                        |
| Quality tiers          | `auto` / `low` / `medium` / `high`                                                                                                                                                              |
| Output format          | `png` (default) / `jpeg` / `webp`                                                                                                                                                               |
| Per call               | 1 image (`n=1`)                                                                                                                                                                                 |
| Speed                  | \~120s (4K high quality approaches 2 min)                                                                                                                                                       |
| Chinese prompts        | ✅ Native                                                                                                                                                                                        |
| Reference image limit  | 5 (`image[]`)                                                                                                                                                                                   |
| Mask inpainting        | ✅ Supported (alpha channel required)                                                                                                                                                            |
| Transparent background | ❌ Not supported at launch (`background: transparent` errored) — **opened up on 2026-08-21**, see [How do I generate images with a transparent background](/en/faq/image-transparent-background) |

### Key Differences vs gpt-image-1.5

| Item                   | gpt-image-1.5           | **gpt-image-2**                                         |
| ---------------------- | ----------------------- | ------------------------------------------------------- |
| Max resolution         | 1024×1536               | **3840×2160 (4K)**                                      |
| Custom sizes           | Limited presets         | **Any valid size**                                      |
| Reference fidelity     | Manual `input_fidelity` | **Auto-enabled**                                        |
| Same-tier price        | Baseline                | **20-30% lower**                                        |
| Transparent background | ✅ Supported             | ❌ Not supported at launch (**opened up on 2026-08-21**) |
| Speed                  | \~30s                   | \~120s (trades for size/fidelity)                       |

<Warning>
  Outputs above `2560×1440` (\~3.69MP) are officially marked **experimental** and may show quality fluctuations. For production, prefer presets like `2048x1152` / `2048x2048` / `3840x2160`.
</Warning>

## Real-World Applications

### Recommended Scenarios

<CardGroup cols={2}>
  <Card title="🎬 Film / Wallpaper / Large Assets" icon="film">
    Single-shot 4K (3840×2160 / 2160×3840). Perfect for movie posters, desktop wallpapers, video preview frames, large-screen materials — no upscaling pipeline needed.
  </Card>

  <Card title="🎨 IP & Character Consistency" icon="user">
    Auto high-fidelity on reference images. Pass a character sheet to generate variations across scenes — identity, outfit, color palette retention significantly improved.
  </Card>

  <Card title="🖌️ Image Editing / Multi-Image Fusion" icon="layers">
    Up to 5 reference images + mask soft-guidance. Supports composite edit instructions like "subject from img1 + scene from img2 + style from img3."
  </Card>

  <Card title="📰 Infographics / Long Posters" icon="newspaper">
    Supports any aspect ratio within 3:1. 1792×1024 cinematic, 3200×1800 long-form, 2048×1152 video covers — all single-shot.
  </Card>
</CardGroup>

### Code Examples

#### Text-to-Image (Python, OpenAI SDK)

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="your-apiyi-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.generate(
    model="gpt-image-2",
    prompt="Cyberpunk city at night, neon sign closeup, cinematic frame",
    size="2048x1152",
    quality="high",
    output_format="jpeg",
    output_compression=85
)

with open("out.jpg", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

#### Multi-Image Fusion + High-Fidelity Edit

```python theme={null}
resp = client.images.edit(
    model="gpt-image-2",
    image=[
        open("person.png", "rb"),
        open("scene.png", "rb"),
        open("style.png", "rb"),
    ],
    prompt="Place subject from img1 into scene from img2, using color style from img3",
    size="1536x1024",
    quality="high"
)

with open("edited.png", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

<Info>
  **Response format**: `gpt-image-2` returns a **raw base64 string** (no `data:image/...;base64,` prefix). Decode it client-side to write a file, or prepend the prefix for browser rendering.
</Info>

### Best Practices

<Info>
  **Production tips**:

  * Prefer official presets (1024×1024 / 1536×1024 / 2048×1152 / 3840×2160) for stable speed/quality
  * Default to `output_format=jpeg` + `output_compression=85` — faster than PNG, half the size
  * Lock `quality=high` for text / signage / poster scenarios — lower tiers can still blur fine text
  * Set client timeout **≥ 360 seconds** (conservative; `quality=high` + 2K/4K can take 3-5 minutes, and the \~120s figure causes many false timeouts)
  * Exponential backoff on 5xx and timeouts, max 2 retries; log `x-request-id` for support
</Info>

<Warning>
  **Migration notes**:

  * Code that passed `input_fidelity` must **remove the parameter** — the new model forces high-fidelity and will error
  * ~~`background: "transparent"` is unsupported~~ — **2026-08-21 update: transparency is now supported**; keep `background: "transparent"` as-is (`output_format` must be `png` or `webp`)
  * Still single-image per call (`n=1`) — issue parallel requests for multiple images
</Warning>

## Pricing & Availability

### Pricing (token-metered, common preset reference)

| Quality    | 1024×1024 | 1024×1536 | 1536×1024 |
| ---------- | --------- | --------- | --------- |
| **Low**    | \$0.006   | \$0.005   | \$0.005   |
| **Medium** | \$0.053   | \$0.041   | \$0.041   |
| **High**   | \$0.211   | \$0.165   | \$0.165   |

<Info>
  **Pricing notes**:

  * 2K/4K has no fixed per-image price — billed by actual input + output tokens
  * Edit requests have noticeably higher input tokens than text-to-image due to forced high-fidelity
  * Streaming (`stream: true` + `partial_images: N`) costs an extra 100 output image tokens per partial
  * Source: OpenAI official pricing (April 2026)
</Info>

### Stack with APIYI Recharge Promotions

On APIYI, beyond official token pricing, you can stack recharge bonuses for up to 20% additional discount. Details:

📖 Recharge promotions: `docs.apiyi.com/en/faq/recharge-promotions`

### gpt-image-2 vs gpt-image-2-all (Reverse)

| Pick                          | When                                                                        |
| ----------------------------- | --------------------------------------------------------------------------- |
| **gpt-image-2** (Official)    | Need precise size/quality control, depend on official API contract, want 4K |
| **gpt-image-2-all** (Reverse) | Want flat \$0.03/image, \~30s render, minimal parameters                    |

## Summary & Recommendations

`gpt-image-2` delivers "native large resolution + auto high-fidelity + same-tier price cut" all at once — a structural upgrade for **large-asset production** and **reference-driven editing** workflows.

### Recommended Use Cases

* ✅ **Design / Video teams**: Direct 4K posters, video covers, desktop wallpapers — skip the upscaling step
* ✅ **IP / character consistency**: Auto high-fidelity on references for character variations across scenes
* ✅ **Multi-image fusion workflows**: Up to 5 references + mask, composite edit instructions in one call
* ✅ **Smooth migration from 1.5**: Drop `input_fidelity` and leave the rest as-is (`transparent` works again since 2026-08-21)

### Usage Tips

1. **Stick with 1K presets when 4K isn't needed**: 1024×1024 / 1536×1024 are fastest and cheapest
2. **Budget extra for edit requests**: Forced high-fidelity means noticeably higher input tokens than pure text-to-image
3. **Timeout ≥ 360 seconds**: `quality=high` + 2K/4K can run 3-5 minutes — show progress in your UI
4. **Stick to presets for stability**: Sizes above 2560×1440 remain experimental — use cautiously in production

<Info>
  **Sources & dates**:

  * OpenAI official docs: `developers.openai.com/api/docs/guides/image-generation`
  * APIYI integration doc: `docs.apiyi.com/knowledge-base/gpt-image-2-API-for-user`
  * Data accessed: April 23, 2026
</Info>

***

Try `gpt-image-2` native 4K generation today — get an API key on APIYI and call directly from the OpenAI SDK with `base_url=https://api.apiyi.com/v1`!
