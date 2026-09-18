> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-all Launch: $0.03/image GPT Reverse-Engineered Image Model

> APIYI launches gpt-image-2-all, a GPT image generation reverse-engineered model! Flat $0.03/image per-call pricing, ~30s generation, supports text-to-image, multi-image fusion editing, natural-language editing, high text-rendering fidelity, and native Chinese prompt support.

## Highlights

* **Reliable reverse-engineered channel**: GPT image generation reverse-engineered model, behavior aligned with official capabilities
* **Highly competitive pricing**: Flat \$0.03/image, no resolution tiers, fully predictable cost
* **Three core capabilities**: Text-to-image / single-image editing / multi-image fusion / natural-language editing — one-stop coverage
* **High text-rendering fidelity**: Stable Chinese/English text rendering in signs, posters, and infographics
* **Native Chinese prompts**: High-quality output without translation
* **30-second generation**: Returns in \~30s, R2 CDN accelerated downloads

## Background

In April 2026, APIYI officially launched **gpt-image-2-all** — a GPT image generation **reverse-engineered** model. While the official GPT-Image-1.5 uses tiered pricing (with high-quality images reaching \$0.20 each), gpt-image-2-all offers a more economical choice at a **flat \$0.03/image per-call** rate — ideal for scenarios that need "predictable cost + strong text rendering + Chinese friendliness".

For large-scale production of Chinese-language infographics, marketing posters, and social media content, this is a compelling option that preserves GPT-style image generation while pushing per-image cost to a new low.

## Detailed Analysis

### New Model

<Card title="gpt-image-2-all" icon="wand-sparkles">
  **GPT image generation reverse-engineered model**

  Flat \$0.03/image, \~30s generation, supports text-to-image, single-image editing, multi-image fusion, and natural-language editing. No need to worry about size/n/quality parameters — just describe size and style in the prompt.
</Card>

### Model Comparison

| Feature              | **gpt-image-2-all** | GPT-Image-1.5 (Official)     | Nano Banana 2           |
| -------------------- | ------------------- | ---------------------------- | ----------------------- |
| Channel type         | Reverse-engineered  | Official direct              | Official direct         |
| Billing              | Flat per-call       | Tiered by resolution + Token | Per-call / Token-based  |
| Typical price        | **\$0.03/image**    | \$0.009 \~ \$0.20/image      | \$0.055/call            |
| Generation speed     | \~30s               | \~10s                        | \~5-15s                 |
| Size control         | Via prompt          | `size` parameter             | `aspectRatio` parameter |
| Chinese prompts      | ✅ Native            | ✅ Supported                  | ✅ Supported             |
| Text rendering       | ✅ High fidelity     | ⭐⭐⭐⭐⭐ Best                   | ⭐⭐⭐⭐ Excellent          |
| Multi-image fusion   | ✅ `image[]` array   | ✅ Edit endpoint              | ✅ inlineData            |
| Content restrictions | Fewer               | Stricter                     | Moderate                |

<Tip>
  **Choosing guide**:

  * 💰 **Cost-sensitive, Chinese-language scenarios** → gpt-image-2-all (flat \$0.03/image)
  * 🎨 **Best text rendering, official direct** → GPT-Image-1.5
  * 🍌 **4K resolution, 14 aspect ratios** → Nano Banana 2
</Tip>

### Triple Endpoint Compatibility

gpt-image-2-all is compatible with three standard OpenAI-style endpoints:

1. **Text-to-image**: `POST /v1/images/generations` (JSON)
2. **Image editing**: `POST /v1/images/edits` (multipart/form-data)
3. **Chat-based**: `POST /v1/chat/completions` (multi-turn with reference images)

You can reuse existing OpenAI SDKs and workflows seamlessly — just switch `base_url` and `model`.

### Important Notes

<Warning>
  **Does not accept size/n/quality/aspect\_ratio fields**

  This is an adaptive model; sending these fields may trigger parameter validation errors. **Size and ratio must go directly into the `prompt`**, and putting size words at the very front yields better adherence.

  Recommended phrasings:

  * `Landscape 16:9 cinematic, old lighthouse at sunset`
  * `1024×1024 square logo, minimalist cat line art`
  * `Portrait 9:16 phone poster, cyberpunk rainy night`
</Warning>

<Warning>
  **The b64\_json prefix behavior has changed — always detect it**

  At launch, this model's `b64_json` field included the `data:image/png;base64,` prefix; **as verified in July 2026 it now returns raw base64 (no prefix)**, which must be decoded or prefixed before use.

  We recommend adding a `startsWith('data:')` compatibility check.
</Warning>

## Practical Usage

### Quick Start (Python)

```python theme={null}
import requests

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={"Authorization": "Bearer sk-your-api-key"},
    json={
        "model": "gpt-image-2-all",
        "prompt": "Landscape 16:9 cinematic, old lighthouse at sunset",
        "response_format": "url"
    },
    timeout=300  # conservative — absorbs tail latency + image upload/download time
).json()

print(response["data"][0]["url"])
```

### Multi-Image Fusion (cURL)

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2-all" \
  -F "prompt=Put the person from image1 into the scene of image2, using the art style of image3" \
  -F "response_format=url" \
  -F "image[]=@./ref1.png" \
  -F "image[]=@./ref2.png" \
  -F "image[]=@./ref3.png"
```

### Use Cases

<CardGroup cols={2}>
  <Card title="Chinese Marketing Materials" icon="megaphone">
    Posters, livestream covers, social media graphics — stable Chinese text rendering
  </Card>

  <Card title="E-commerce Product Images" icon="shopping-bag">
    Multi-image fusion for product scene compositions — more flexible than compositing software
  </Card>

  <Card title="Infographics" icon="chart-bar">
    Text-annotated infographics at a fraction of the cost of high-quality official models
  </Card>

  <Card title="Natural-Language Editing" icon="message-circle">
    No masks needed — iteratively edit images via natural-language descriptions
  </Card>
</CardGroup>

## Pricing & Availability

| Item                | Details                                                     |
| ------------------- | ----------------------------------------------------------- |
| **Model name**      | `gpt-image-2-all`                                           |
| **Pricing**         | \$0.03 / image, per-call                                    |
| **Billing rule**    | Flat pricing — no tiers by resolution/quality/prompt length |
| **Failed requests** | Not charged (auth failures, parameter validation errors)    |
| **N images**        | 1 image per call; for N images call in parallel             |
| **Promotion**       | Stackable with deposit bonus activities                     |

<Info>
  **Ready to use**: Existing APIYI tokens can call this model directly — no special activation required.
</Info>

## Summary & Recommendations

The core value of gpt-image-2-all is **"GPT style + Chinese friendly + predictable cost"**:

* ✅ If your business produces high-volume Chinese marketing content → recommended as your **primary image generation channel**
* ✅ If you need the absolute best text rendering → use as a **complement to GPT-Image-1.5** (cost-sensitive tasks on gpt-image-2-all, best-text tasks on 1.5)
* ⚠️ If you need strict parameterized resolution/ratio control → **Nano Banana 2** is a better fit (14 aspect ratios, 4K output)

Get started now:

<CardGroup cols={2}>
  <Card title="Model Overview" icon="book" href="/en/api-capabilities/gpt-image-2-all/overview">
    Full capabilities and best practices
  </Card>

  <Card title="Text-to-Image Playground" icon="wand-sparkles" href="/en/api-capabilities/gpt-image-2-all/text-to-image">
    Test text-to-image online
  </Card>

  <Card title="Image Editing Playground" icon="image" href="/en/api-capabilities/gpt-image-2-all/image-edit">
    Upload images and test editing/fusion
  </Card>

  <Card title="Deposit Bonus" icon="gift" href="/en/faq/recharge-promotions">
    See current deposit bonus promotions
  </Card>
</CardGroup>
