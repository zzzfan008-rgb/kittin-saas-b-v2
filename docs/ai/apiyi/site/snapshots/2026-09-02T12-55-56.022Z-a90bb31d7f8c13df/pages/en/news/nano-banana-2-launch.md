> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana 2 Launch: Pro Quality at Flash Price

> Google's latest image generation model Nano Banana 2 (gemini-3.1-flash-image-preview) is now live! Pro-level quality at Flash-tier speed, 4K output, 14 aspect ratios, Image Search Grounding. APIYI per-request $0.055/image, pay-as-you-go from $0.025/image.

## Key Highlights

* **Pro-level quality + Flash-tier speed**: Quality rivaling Nano Banana Pro, generation speed several times faster
* **Ultra-low pricing**: APIYI per-request \$0.055/image, pay-as-you-go from \$0.025/image
* **14 aspect ratios**: New additions 1:4, 4:1, 1:8, 8:1 for long-form images and infographics
* **Image Search Grounding**: Exclusive feature pulling visual context from Google Image Search
* **Thinking Mode**: Configurable reasoning levels for more precise complex prompt handling

## Background

On February 26, 2026, Google officially released **Nano Banana 2** (model ID: `gemini-3.1-flash-image-preview`), the latest flagship of the Nano Banana series. Unlike Nano Banana Pro which is based on Gemini 3 Pro, Nano Banana 2 is built on **Gemini 3.1 Flash**, dramatically improving generation speed and reducing costs while maintaining near-Pro-level quality.

This means users no longer need to choose between "quality" and "price" — Nano Banana 2 delivers both.

## Detailed Analysis

### New Model

<Card title="gemini-3.1-flash-image-preview" icon="banana">
  **Nano Banana 2 Image Generation**

  Image generation model based on Gemini 3.1 Flash with Pro-level quality at Flash-tier speed. Supports 4K output, 14 aspect ratios, Image Search Grounding, Thinking Mode, and more.
</Card>

### Comparison with Previous Versions

| Feature                    | **Nano Banana 2**                                  | Nano Banana Pro              | Nano Banana              |
| -------------------------- | -------------------------------------------------- | ---------------------------- | ------------------------ |
| **Model ID**               | `gemini-3.1-flash-image-preview`                   | `gemini-3-pro-image-preview` | `gemini-2.5-flash-image` |
| **Quality**                | ⭐⭐⭐⭐⭐ Pro-level                                    | ⭐⭐⭐⭐⭐ Highest                | ⭐⭐⭐⭐ Excellent           |
| **Speed**                  | 🚀 Fastest                                         | 🐢 Slower (\~20s)            | ⚡ Fast (\~10s)           |
| **Max Resolution**         | 4K                                                 | 4K                           | 2K                       |
| **Aspect Ratios**          | 14                                                 | 10                           | 10                       |
| **Image Search Grounding** | ✅ Exclusive                                        | ❌                            | ❌                        |
| **Thinking Mode**          | ✅                                                  | ❌                            | ❌                        |
| **Google Official 4K**     | \$0.151                                            | \$0.151                      | \$0.039 (1K only)        |
| **APIYI Pricing**          | **\$0.055 (per-req) / \~\$0.025+ (pay-as-you-go)** | \$0.09                       | \$0.025                  |

<Tip>
  **Key Numbers**: Google's official 4K pricing is \$0.151/image, APIYI's Nano Banana 2 per-request is just **\$0.055/image** (\~64% off), pay-as-you-go from **\~\$0.025/image** (512px)!
</Tip>

### Exclusive New Features

#### 🔍 Image Search Grounding

An exclusive Nano Banana 2 feature. By leveraging Google Image Search, the model can:

* Reference real-world visual materials for more accurate image generation
* Generate real landmarks, people, products that better match reality
* Combine real-time data to generate weather charts, event posters, etc.

```python theme={null}
import requests

response = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent",
    headers={"Authorization": "Bearer sk-your-api-key", "Content-Type": "application/json"},
    json={
        "contents": [{"parts": [{"text": "An illustrated view of the Shanghai Bund today"}]}],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"],
            "imageConfig": {"aspectRatio": "16:9", "imageSize": "2K"}
        },
        "tools": [{"google_search": {}}]
    },
    timeout=300
).json()
```

#### 🧠 Thinking Mode

Configurable with `minimal` or `high` thinking levels for pre-generation reasoning:

* **minimal**: Quick generation for simple prompts
* **high**: Deep reasoning for complex compositions, precise text, multi-element scenes

```python theme={null}
response = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent",
    headers={"Authorization": "Bearer sk-your-api-key", "Content-Type": "application/json"},
    json={
        "contents": [{"parts": [{"text": "Design a tech company annual report cover with text '2026 Annual Report', dark blue gradient background, data visualization elements"}]}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": "3:4", "imageSize": "4K"},
            "thinkingConfig": {"thinkingLevel": "high", "includeThoughts": True}
        }
    },
    timeout=300
).json()
```

#### 📐 14 Aspect Ratios

Four new ultra-tall/ultra-wide ratios:

| New Ratio | Use Case                                     |
| --------- | -------------------------------------------- |
| `1:4`     | Ultra-tall vertical images, mobile long-form |
| `4:1`     | Ultra-wide banners, website headers          |
| `1:8`     | Extreme vertical, infographics               |
| `8:1`     | Extreme horizontal, panoramic                |

Full supported ratios: `1:1`, `1:4`, `4:1`, `1:8`, `8:1`, `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9`

### Additional Highlights

<CardGroup cols={2}>
  <Card title="Accurate Text Rendering" icon="type">
    Inherits Nano Banana Pro's text rendering capabilities with multilingual clear text support. Perfect for posters, ads, and branded materials.
  </Card>

  <Card title="Multi-turn Editing" icon="message-circle">
    Supports iterative image editing through conversation. Upload an image and use chat instructions for background blur, object removal, style transfer, and more.
  </Card>

  <Card title="Subject Consistency" icon="users">
    Maintains resemblance across up to 5 characters and 14 reference objects — ideal for series content and character IP creation.
  </Card>

  <Card title="Batch API" icon="layers">
    Supports Batch API (24-hour turnaround) with higher rate limits for large-scale image generation tasks.
  </Card>
</CardGroup>

## Practical Usage

### Quick Start

#### Google Native Format (Recommended)

```python theme={null}
import requests
import base64

API_KEY = "sk-your-api-key"

response = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent",
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json={
        "contents": [{"parts": [{"text": "A cute Shiba Inu sitting under cherry blossom trees, watercolor style"}]}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": "16:9", "imageSize": "2K"}
        }
    },
    timeout=300
).json()

img_data = response["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]
with open("output.png", 'wb') as f:
    f.write(base64.b64decode(img_data))
print("Image saved")
```

#### OpenAI Compatible Mode

```python theme={null}
from openai import OpenAI

client = OpenAI(api_key="sk-your-api-key", base_url="https://api.apiyi.com/v1")

response = client.chat.completions.create(
    model="gemini-3.1-flash-image-preview",
    stream=False,
    messages=[{"role": "user", "content": "An autumn landscape painting with red leaves and flying birds"}]
)

print(response.choices[0].message.content)
```

<Warning>
  OpenAI compatible mode uses the `/v1/chat/completions` endpoint, NOT `/v1/images/generations`.
</Warning>

### Migrating from Nano Banana Pro

Simply change the model name:

```python theme={null}
# Nano Banana Pro (old)
model = "gemini-3-pro-image-preview"

# Nano Banana 2 (new) - cheaper and faster
model = "gemini-3.1-flash-image-preview"

# All other parameters remain the same
```

## Pricing & Availability

### Pricing Comparison

| Model             | APIYI Pricing (Per-request) | Google Official 4K | Savings                   |
| ----------------- | --------------------------- | ------------------ | ------------------------- |
| **Nano Banana 2** | **\$0.055/image**           | \$0.151            | **🔥 \~64% off official** |
| Nano Banana Pro   | \$0.09/image                | \$0.151            | \~40% off official        |
| Nano Banana       | \$0.02/image                | \$0.039 (1K only)  | \~36% off official        |

<Note>
  Nano Banana (`gemini-2.5-flash-image`) supports up to 2K only — no 4K option. The price shown is its 1K official pricing.
</Note>

### Pay-as-you-go Pricing (Nano Banana 2 Exclusive)

| Billing Item     | Google Official            | APIYI           | Discount |
| ---------------- | -------------------------- | --------------- | -------- |
| Input            | \$0.50/M tokens            | \$0.14/M tokens | **28%**  |
| Output (unified) | Image \$60/M, Text \$1.5/M | \$16.8/M tokens | **28%**  |

#### Pay-as-you-go Price Estimates

| Resolution | Google Official | APIYI         |
| ---------- | --------------- | ------------- |
| 512px      | \$0.045         | **\~\$0.025** |
| 1K         | \$0.067         | **\~\$0.035** |
| 2K         | \$0.101         | **\~\$0.045** |
| 4K         | \$0.151         | **\~\$0.07**  |

<Info>
  **Billing Mode Selection**: Choose via the "Billing model" setting when creating an API key:

  * **Pay-as-you-go / Pay-as-you-go Priority** → Token-based billing
  * **Pay-per-request / Pay-per-request Priority** → Per-request billing
  * ⚠️ Do NOT select Hybrid billing
</Info>

<Info>
  **💰 4K HD at great value!** Google's official 4K pricing is \$0.151/image, APIYI per-request is just \$0.055/image (\~64% off), pay-as-you-go as low as \~\$0.07/image (4K). Combined with recharge bonuses, actual costs are even lower.
</Info>

### Google Official Resolution Pricing Reference

| Resolution   | Google Official Price |
| ------------ | --------------------- |
| 512px        | \$0.045               |
| 1K (default) | \$0.067               |
| 2K           | \$0.101               |
| 4K           | \$0.151               |

### Availability

* ✅ **APIYI** (stable direct connection, first to launch) ⭐ Recommended
* ✅ **Gemini App** (web and mobile, set as default image model)
* ✅ **Google AI Studio** (marked as "New")
* ✅ **Vertex AI** (Preview access)

## Summary & Recommendations

Nano Banana 2 redefines image generation value — **Pro-level quality, Flash-tier speed, ultra-low pricing**. For the vast majority of users, it's the best replacement for Nano Banana Pro.

### 💡 Who Should Use It?

* **All image generation users**: Near-Pro quality, pay-as-you-go from \$0.025/image — incredible value
* **Special aspect ratio needs**: 14 aspect ratios cover more scenarios
* **Real-time data needs**: Image Search Grounding generates images with search context
* **Complex prompt users**: Thinking Mode makes complex scene generation more precise

### 🎯 Version Selection Guide

* 🔥 **First choice: Nano Banana 2** — Best value, pay-as-you-go from \$0.025/image, suitable for 90% of use cases
* 🎨 **Ultimate quality: Nano Banana Pro** — For professional scenarios demanding maximum fidelity
* ⚡ **Lowest cost: Nano Banana** — \$0.025/image for high-volume, budget-conscious needs

***

<Info>
  **Sources**:

  * Google Official Blog: Nano Banana 2 launch announcement `blog.google/innovation-and-ai/technology/ai/nano-banana-2/`
  * Google Developers Blog: `blog.google/innovation-and-ai/technology/developers-tools/build-with-nano-banana-2/`
  * Google AI Developer Docs: `ai.google.dev/gemini-api/docs/image-generation`
  * Google API Pricing: `ai.google.dev/gemini-api/docs/pricing`
  * Data retrieved: February 27, 2026
</Info>
