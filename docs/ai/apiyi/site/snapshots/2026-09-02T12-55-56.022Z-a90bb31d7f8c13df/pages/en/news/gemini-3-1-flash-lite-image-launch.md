> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana 2 Lite Is Live: 4-Second Images, ~40% of Official on Metered

> Google's Nano Banana 2 Lite (gemini-3.1-flash-lite-image) is here — ~4s per image, ~2.7x faster than Nano Banana 2, 1K canvas + 14 aspect ratios. APIYI has it live: metered at ~40% of official ($0.10 input / $12 output per 1M tokens), per-call $0.025.

## Key Takeaways

* **The Lite of Nano Banana 2**: Google released Nano Banana 2 Lite (`gemini-3.1-flash-lite-image`) on June 30 — the lightweight, economy version of Nano Banana 2 (`gemini-3.1-flash-image`)
* **Faster generation**: \~**4 seconds** per image, about **2.7x faster** than Nano Banana 2 — built for high concurrency, low cost, and fast iteration
* **\~40% of official on metered**: APIYI metered pricing is \$0.10 input / \$12 output per 1M tokens — about **40% of Google's official rate** (60% off)
* **\$0.025 per call**: per-call billing at \$0.025 (before discount), versus \~\$0.034 per image official
* **1K canvas + 14 aspect ratios**: focused on 1K resolution (no 2K/4K), 14 aspect ratios, with an invisible SynthID watermark

<Warning>
  **Tentative pricing**: the model just launched and the current price is provisional — it may be adjusted. We'll announce any changes separately; the live platform price always prevails.
</Warning>

## Background

On June 30, 2026, as part of an update to its Gemini image and video lines, Google released **Nano Banana 2 Lite** (model ID: `gemini-3.1-flash-lite-image`). It's the lightweight version of Nano Banana 2 (`gemini-3.1-flash-image`), positioned as the **fastest, most cost-effective** tier in Google's creative model family.

Unlike quality-topping Nano Banana Pro or the quality-and-speed Nano Banana 2, Lite centers on **speed and cost**: \~4 seconds per image, ideal for fast creative validation, high-throughput developer pipelines, and per-image-cost-sensitive batch work.

APIYI has brought `gemini-3.1-flash-lite-image` online right away, supporting both metered and per-call billing, with metered pricing at about 40% of official — great for cost-sensitive image generation.

## Deep Dive

### New Model

<Card title="gemini-3.1-flash-lite-image" icon="banana">
  **Nano Banana 2 Lite image generation**

  The lightweight, economy version of Nano Banana 2 — \~4s per image, \~2.7x faster than Nano Banana 2. Focused on 1K canvas, 14 aspect ratios, with an invisible SynthID watermark. Built for high concurrency, low cost, and fast iteration.
</Card>

### Same-Family Comparison

| Feature              | **Nano Banana 2 Lite**        | Nano Banana 2            | Nano Banana Pro      |
| -------------------- | ----------------------------- | ------------------------ | -------------------- |
| **Model ID**         | `gemini-3.1-flash-lite-image` | `gemini-3.1-flash-image` | `gemini-3-pro-image` |
| **Positioning**      | Fastest / cheapest            | Quality + speed          | Peak quality         |
| **Max resolution**   | 1K                            | 4K                       | 4K                   |
| **Generation speed** | 🚀 \~4s                       | ⚡ fast                   | 🐢 slower            |
| **Aspect ratios**    | 14                            | 14                       | 10                   |
| **APIYI metered**    | **\~40% of official**         | \~28% of official        | —                    |

<Tip>
  **Quick pick**: for **max value / fast batch generation**, choose Lite; for **2K/4K** or higher quality, choose Nano Banana 2 or Pro.
</Tip>

### Technical Specs

| Parameter         | Spec                                               |
| ----------------- | -------------------------------------------------- |
| **Model ID**      | `gemini-3.1-flash-lite-image`                      |
| **Resolution**    | 1K (no 2K/4K)                                      |
| **Aspect ratios** | 14 (`1:1`, `4:1`, `1:4`, `16:9`, `9:16`, etc.)     |
| **Speed**         | \~4s per image                                     |
| **Watermark**     | Invisible SynthID                                  |
| **API formats**   | Google-native / OpenAI-compatible                  |
| **Channels**      | Google AI Studio, Gemini API, Vertex / GEAP, APIYI |

## Real-World Use

### Recommended Scenarios

1. **Fast creative validation**: 4s per image — great for iterating on prompts and screening directions
2. **High-concurrency batch generation**: low per-image cost for scaled asset production
3. **Cost-sensitive in-product embedding**: embed image generation in your app with controlled per-image cost
4. **When 1K is enough**: social images, thumbnails, draft previews that don't need 4K

### Quick Start

#### Google-native format (recommended)

```python theme={null}
import requests
import base64

API_KEY = "sk-your-apiyi-key"

response = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent",
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json={
        "contents": [{"parts": [{"text": "A Shiba Inu under cherry blossoms, watercolor style"}]}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": "16:9", "imageSize": "1K"}
        }
    },
    timeout=300
).json()

img_data = response["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]
with open("output.png", "wb") as f:
    f.write(base64.b64decode(img_data))
print("Image saved")
```

#### OpenAI-compatible mode

```python theme={null}
from openai import OpenAI

client = OpenAI(api_key="sk-your-apiyi-key", base_url="https://api.apiyi.com/v1")

response = client.chat.completions.create(
    model="gemini-3.1-flash-lite-image",
    stream=False,
    messages=[{"role": "user", "content": "An autumn landscape painting with red leaves and birds in the distance"}]
)

print(response.choices[0].message.content)
```

### Migrating from Nano Banana 2

Just change the model name; keep other parameters (note Lite is 1K only):

```python theme={null}
# Nano Banana 2 (4K optional)
model = "gemini-3.1-flash-image"

# Nano Banana 2 Lite (faster, cheaper, 1K only)
model = "gemini-3.1-flash-lite-image"
```

## Pricing & Availability

### Pricing

**Metered (token-based, \~40% of official)**:

| Item       | APIYI               | Google official     | Discount  |
| ---------- | ------------------- | ------------------- | --------- |
| **Input**  | \$0.10 / 1M tokens  | \$0.25 / 1M tokens  | **\~40%** |
| **Output** | \$12.00 / 1M tokens | \$30.00 / 1M tokens | **\~40%** |

**Per-call**:

| Item               | APIYI (before discount) | Google official   |
| ------------------ | ----------------------- | ----------------- |
| **Per image (1K)** | **\$0.025 / call**      | \~\$0.034 / image |

<Info>
  **Choosing a billing mode**: set it via "Billing model" when creating a token:

  * **Pay-as-you-go / Pay-as-you-go Priority** → metered
  * **Pay-per-request / Pay-per-request Priority** → per-call
  * ⚠️ Do not select Hybrid billing.
</Info>

<Warning>
  The model just launched and the current price is provisional — it may be adjusted. We'll announce any changes separately; the live platform price always prevails.
</Warning>

### Stack with Top-up Promotions

Combine with APIYI top-up bonus promotions to further lower real cost: `docs.apiyi.com/faq/recharge-promotions`.

### Where to Get It

**APIYI platform**:

* Site: `apiyi.com`
* Google-native: `https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent`
* OpenAI-compatible: `https://api.apiyi.com/v1`
* Model name: `gemini-3.1-flash-lite-image`

## Summary & Recommendation

Nano Banana 2 Lite takes "fast" and "cheap" to a new level: \~4s per image and metered pricing at \~40% of official, focused on the 1K canvas — ideal for high-concurrency, low-cost, fast-iteration work. For 2K/4K or higher quality, switch to Nano Banana 2 or Nano Banana Pro.

**Core strengths**:

* **Faster**: \~4s per image, \~2.7x faster than Nano Banana 2
* **Cheaper**: metered \~40% of official, per-call \$0.025 (before discount)
* **Enough**: 1K + 14 aspect ratios covers most everyday generation

<Info>
  **Sources**:

  * Google blog: Nano Banana 2 Lite announcement `blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-omni-flash-nano-banana-2-lite/`
  * Google API pricing: `ai.google.dev/gemini-api/docs/pricing`
  * Google DeepMind model page: `deepmind.google/models/gemini-image/flash-lite/`
  * Data retrieved: July 1, 2026
</Info>
