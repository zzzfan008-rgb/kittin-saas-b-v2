> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Pro Launch: 4K Image Generation

> Google's latest image generation model Nano Banana Pro (Gemini 3 Pro Image) is now available! Support for 4K high-res images, industry-best text rendering, and powerful local editing. Available now on APIYI at official pricing.

## Key Highlights

* **4K Support**: Generate images in 1K, 2K, and 4K resolutions
* **Best Text Rendering**: Industry-leading text clarity in images
* **Local Editing**: Adjust camera angle, focus, color grading, lighting
* **Gemini 3 Pro Powered**: Advanced reasoning and real-world knowledge
* **Stable & Fast**: \~20 seconds generation time, "strong + stable" feedback

## Background

On November 20, 2025, Google officially released Nano Banana Pro (codename: Gemini 3 Pro Image Preview), a major upgrade from Nano Banana (Gemini 2.5 Flash Image). The new model achieves significant improvements in resolution, text rendering, and editing capabilities.

APIYI has integrated this model immediately, providing designers and developers with stable, high-quality image generation services.

## Feature Comparison

| Feature            | Nano Banana (2.5) | Nano Banana Pro (3.0) | Improvement          |
| ------------------ | ----------------- | --------------------- | -------------------- |
| **Max Resolution** | 1024×1024         | 4K (4096×4096)        | 🚀 16x pixels        |
| **Text Rendering** | Good              | Industry Best         | ⭐⭐⭐                  |
| **Local Editing**  | Basic             | Advanced              | ⭐⭐⭐                  |
| **Speed**          | \~10s             | \~20s                 | ⏱️ Slower but better |
| **Reasoning**      | Gemini 2.5 Flash  | Gemini 3 Pro          | 🧠 Significant       |
| **Pricing**        | Standard          | Standard              | 💰 Same price        |

### Core Features

#### 🎨 4K High Resolution

<CardGroup cols={3}>
  <Card title="1K (Standard)" icon="image">
    1024×1024 pixels

    Quick prototypes, social media
  </Card>

  <Card title="2K (HD)" icon="image">
    2048×2048 pixels

    Website banners, digital ads
  </Card>

  <Card title="4K (Ultra HD)" icon="image">
    4096×4096 pixels

    Print materials, professional design
  </Card>
</CardGroup>

#### ✍️ Best Text Rendering

* **Clear & Readable**: Sharp text edges, accurate font recognition
* **Rich Styles**: Multiple fonts, sizes, colors, and effects
* **Multi-language**: Perfect support for English, Chinese, and more
* **Precise Layout**: Text position, alignment, and spacing

**Perfect for**:

* 📊 Posters and promotional materials
* 🏷️ Brand slogans and advertisements
* 📰 Social media graphics
* 🎨 Packaging and product labels

#### 🛠️ Local Editing

<CardGroup cols={2}>
  <Card title="Camera Control" icon="camera">
    * Adjust shooting angle
    * Change focal length and depth
    * Control composition
  </Card>

  <Card title="Lighting" icon="sun">
    * Scene lighting control
    * Day/night conversion
    * Shadow and highlight adjustment
  </Card>

  <Card title="Color Grading" icon="palette">
    * Hue and saturation
    * Contrast and brightness
    * Filters and stylization
  </Card>

  <Card title="Effects" icon="wand-sparkles">
    * Bokeh effect
    * Depth of field
    * Artistic rendering
  </Card>
</CardGroup>

## Use Cases

<CardGroup cols={2}>
  <Card title="Professional Design" icon="pencil-ruler">
    * High-res posters
    * Print materials
    * Brand visual design
    * Product packaging
  </Card>

  <Card title="Text in Images" icon="type">
    * Advertising with text
    * Social media graphics
    * Slogans and captions
    * Infographics
  </Card>

  <Card title="Local Editing" icon="pencil">
    * Style adjustment
    * Lighting optimization
    * Bokeh effects
    * Detail refinement
  </Card>

  <Card title="Brand Marketing" icon="megaphone">
    * Brand consistency
    * Visual marketing assets
    * Multi-channel content
    * A/B testing materials
  </Card>
</CardGroup>

## Code Example

```python theme={null}
import openai

client = openai.OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# Basic image generation
response = client.images.generate(
    model="gemini-3-pro-image-preview",
    prompt="A modern minimalist coffee shop poster with text 'Morning Brew', warm tones, professional photography",
    n=1,
    size="1024x1024",
    quality="hd"
)

image_url = response.data[0].url
print(f"Generated image: {image_url}")

# 4K high-res generation
response = client.images.generate(
    model="gemini-3-pro-image-preview",
    prompt="A 4K tech company poster with text 'AI Changes Future', futuristic style, blue tones",
    size="4096x4096",
    quality="hd"
)
```

## Best Practices

### Prompt Tips

**For Text Rendering**:

```
✅ Good Prompt:
"A modern minimalist poster with clear, readable text 'Morning Coffee',
sans-serif font, white text on dark blue background, centered"

❌ Avoid:
"Poster with text"  # Too vague
```

**For High-Res Images**:

```
✅ Good Prompt:
"A 4K ultra-HD product photo, rich details, professional photography,
studio lighting, white background, centered product, soft shadows"

❌ Avoid:
"Product photo"  # Lacks detail
```

### Resolution Guide

* **1K (1024×1024)**:
  * Quick prototypes
  * Social media (Instagram, Twitter)
  * Web thumbnails

* **2K (2048×2048)**:
  * Website banners
  * Digital advertising
  * Presentations

* **4K (4096×4096)**:
  * Print materials (posters, brochures)
  * Large displays and billboards
  * Professional design projects

## Pricing

| Resolution         | Price per Image | Use Case                             |
| ------------------ | --------------- | ------------------------------------ |
| **1K (1024×1024)** | \$0.04          | Quick prototypes, social media       |
| **2K (2048×2048)** | \$0.08          | Website banners, digital ads         |
| **4K (4096×4096)** | \$0.16          | Print materials, professional design |

<Info>
  **Special Offer**: With APIYI's recharge bonus program, enjoy even lower costs! Full 4K HD version priced at only \$0.09/image, official 4K price is \$0.24/image, approximately 38% of official price! Bulk generation available with additional discounts.
</Info>

## Migration Guide

Upgrading from old Nano Banana is simple:

```python theme={null}
# Old version
model="gemini-2.5-flash-image"

# New version - just change model name
model="gemini-3-pro-image-preview"

# All other parameters remain the same
```

## Getting Started

1. **Sign up**: [https://api.apiyi.com](https://api.apiyi.com)
2. **Add credits**: Enjoy recharge bonuses
3. **Check docs**: [Nano Banana Guide](/en/api-capabilities/nano-banana-image)
4. **Start using**: Change `model` to `gemini-3-pro-image-preview`

***

<Info>
  **Sources**:

  * Google Official Blog: Nano Banana Pro Announcement
  * Google Cloud Docs: Gemini 3 Pro Image API
  * APIYI User Feedback: "strong + stable"
  * Data retrieved: November 20, 2025
</Info>
