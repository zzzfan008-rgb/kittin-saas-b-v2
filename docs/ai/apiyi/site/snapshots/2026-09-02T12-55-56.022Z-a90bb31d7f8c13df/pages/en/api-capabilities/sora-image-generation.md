> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Sora Image Generation API

> Generate high-quality images quickly using Sora's reverse-engineered model, pay-per-request at only $0.01/image

Sora Image is an image generation API based on reverse-engineered technology from sora.chatgpt.com, implementing text-to-image through chat completion interface. Compared to traditional OpenAI Images API, pricing is more affordable at only \$0.01 per image.

<Note>
  **💰 Exceptional Value**
  Pay-per-request, only $0.01 per image! Compared to GPT-Image-1's token-based billing ($10 input/\$40 output per M tokens), pricing is more transparent and predictable!
</Note>

## 🌟 Core Features

* **💸 Ultimate Cost-Effectiveness**: \$0.01/image, pay-per-request, no Token consumption concerns
* **🎨 High-Quality Output**: Based on Sora official technology, generation quality comparable to DALL·E 3
* **⚡ Fast Response**: Optimized reverse-engineered technology, second-level generation
* **📐 Multiple Size Support**: Supports 2:3, 3:2, 1:1 ratios
* **🔧 Easy to Use**: Uses standard chat completion interface, no new API to learn

## 📋 Model Information

| Model            | Model ID       | Billing Method  | Price        | Features                               |
| ---------------- | -------------- | --------------- | ------------ | -------------------------------------- |
| **Sora Image**   | `sora_image`   | Pay-per-request | \$0.01/image | Text-to-image, high quality            |
| **GPT-4o Image** | `gpt-4o-image` | Pay-per-request | \$0.01/image | Same source technology, similar effect |

<Tip>
  💡 **Pricing Advantage**

  * GPT-Image-1: Token-based billing ($10 input/$40 output per M tokens)
  * Sora Image: Fixed \$0.01/image (regardless of prompt length)
  * Sora pricing is more transparent and predictable!
</Tip>

## 🚀 Quick Start

### Basic Example

```python theme={null}
import requests
import re

# API Configuration
API_KEY = "YOUR_API_KEY"
API_URL = "https://api.apiyi.com/v1/chat/completions"

def generate_image(prompt, ratio="2:3"):
    """
    Generate image using Sora Image

    Args:
        prompt: Image description text
        ratio: Image ratio, supports "2:3", "3:2", "1:1"
    """
    # Add ratio tag at end of prompt
    if ratio and ratio in ["2:3", "3:2", "1:1"]:
        prompt = f"{prompt}【{ratio}】"

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "sora_image",
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ]
    }

    response = requests.post(API_URL, headers=headers, json=payload)
    result = response.json()

    # Extract image URL
    content = result['choices'][0]['message']['content']
    image_urls = re.findall(r'!\[.*?\]\((https?://[^)]+)\)', content)

    return image_urls

# Usage example
urls = generate_image("A cute cat playing in the garden", "2:3")
print(f"Generated image: {urls[0]}")
```

### Batch Generation Example

```python theme={null}
def batch_generate_images(prompts, ratio="2:3"):
    """Batch generate images"""
    results = []

    for prompt in prompts:
        try:
            urls = generate_image(prompt, ratio)
            results.append({
                "prompt": prompt,
                "url": urls[0] if urls else None,
                "success": bool(urls)
            })
            print(f"✅ Successfully generated: {prompt}")
        except Exception as e:
            results.append({
                "prompt": prompt,
                "url": None,
                "success": False,
                "error": str(e)
            })
            print(f"❌ Generation failed: {prompt} - {e}")

    return results

# Batch generation example
prompts = [
    "Beach at sunset",
    "Futuristic tech city",
    "Fairy in a fantasy forest"
]

results = batch_generate_images(prompts, "3:2")
```

## 📐 Size Ratio Guide

Sora Image supports three preset ratios, specified by adding ratio tags at the end of prompts:

| Ratio Tag | Size Ratio | Use Cases                             | Example                      |
| --------- | ---------- | ------------------------------------- | ---------------------------- |
| **【2:3】** | Portrait   | Character portraits, phone wallpapers | `Beautiful flowers【2:3】`     |
| **【3:2】** | Landscape  | Landscape photos, banner images       | `Magnificent mountains【3:2】` |
| **【1:1】** | Square     | Social media avatars, icons           | `Cute puppy【1:1】`            |

### Size Usage Examples

```python theme={null}
# Portrait
portrait = generate_image("Elegant lady portrait, professional photography style【2:3】")

# Landscape
landscape = generate_image("Mountain valley at sunrise, soft lighting【3:2】")

# Square icon
icon = generate_image("Minimalist modern app icon design【1:1】")
```

## 🎯 Best Practices

### 1. Prompt Optimization

```python theme={null}
# ❌ Not recommended: Too simple
prompt = "cat"

# ✅ Recommended: Detailed description
prompt = """
A fluffy orange cat,
sitting on a sunny windowsill,
with blurred cityscape background,
photography style, high-definition details
【2:3】
"""
```

### 2. Error Handling

```python theme={null}
import time

def generate_with_retry(prompt, max_retries=3):
    """Image generation with retry mechanism"""
    for attempt in range(max_retries):
        try:
            urls = generate_image(prompt)
            if urls:
                return urls[0]
        except Exception as e:
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt  # Exponential backoff
                print(f"Retry {attempt + 1}/{max_retries}, waiting {wait_time}s...")
                time.sleep(wait_time)
            else:
                raise e

    return None
```

### 3. Result Saving

```python theme={null}
import requests
from datetime import datetime

def save_generated_image(url, prompt):
    """Save generated image locally"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"sora_{timestamp}.png"

    response = requests.get(url)
    with open(filename, 'wb') as f:
        f.write(response.content)

    # Save prompt information
    with open(f"sora_{timestamp}_prompt.txt", 'w', encoding='utf-8') as f:
        f.write(f"Prompt: {prompt}\n")
        f.write(f"URL: {url}\n")
        f.write(f"Time: {datetime.now()}\n")

    return filename
```

## 💡 Advanced Techniques

### 1. Stylized Generation

```python theme={null}
# Artistic style templates
art_styles = {
    "oil_painting": "oil painting style, thick brush strokes, rich color layers",
    "watercolor": "watercolor style, transparency, flowing colors",
    "sketch": "pencil sketch style, black and white, delicate lines",
    "anime": "Japanese anime style, big eyes, vibrant colors",
    "photorealistic": "ultra-realistic photography, high-definition details, professional photography"
}

def generate_with_style(subject, style_name):
    """Generate image with preset style"""
    style = art_styles.get(style_name, "")
    prompt = f"{subject}, {style}【2:3】"
    return generate_image(prompt)

# Usage example
url = generate_with_style("Beautiful rose flower", "watercolor")
```

### 2. Scene Templates

```python theme={null}
# Scene generation template
def generate_scene(subject, time="sunset", weather="clear", mood="serene"):
    """Generate scene image based on parameters"""
    prompt = f"""
    {subject}
    Time: {time}
    Weather: {weather}
    Mood: {mood}
    Photography style, professional composition
    【3:2】
    """
    return generate_image(prompt.strip())

# Generate different scenes
sunset_beach = generate_scene("Beach", "sunset", "breeze", "romantic")
morning_forest = generate_scene("Forest path", "morning", "mist", "mysterious")
```

### 3. Batch Theme Variations

```python theme={null}
def generate_variations(base_prompt, variations, ratio="2:3"):
    """Generate multiple variations of same theme"""
    results = []

    for variation in variations:
        full_prompt = f"{base_prompt}, {variation}【{ratio}】"
        try:
            url = generate_image(full_prompt)[0]
            results.append({
                "variation": variation,
                "url": url,
                "prompt": full_prompt
            })
        except Exception as e:
            print(f"Variation generation failed: {variation}")

    return results

# Generate different cat variations
base = "A cute cat"
variations = [
    "orange tabby",
    "black and white cow pattern",
    "pure white long hair",
    "gray short hair"
]

cat_variations = generate_variations(base, variations)
```

## 📊 Cost Calculator

```python theme={null}
def calculate_cost(num_images):
    """Calculate image generation cost"""
    cost_per_image = 0.01  # $0.01 per image
    total_cost = num_images * cost_per_image

    # Compare with GPT-Image-1
    # GPT-Image-1 uses token billing, assume ~1000 tokens per image average
    avg_tokens_per_image = 1000
    gpt_image_1_cost = num_images * (avg_tokens_per_image / 1_000_000) * 40  # Output token cost

    print(f"Sora Image Cost Calculation:")
    print(f"- Number of images: {num_images}")
    print(f"- Unit price: ${cost_per_image} (fixed price)")
    print(f"- Total cost: ${total_cost:.2f}")
    print(f"\nCompare with GPT-Image-1:")
    print(f"- GPT-Image-1 billing: Token-based ($10 input/$40 output per M)")
    print(f"- Estimated cost: ${gpt_image_1_cost:.2f} (assuming ~1000 tokens per image)")
    print(f"- Sora advantage: Fixed price, controllable cost")

# Calculation example
calculate_cost(100)  # Generate 100 images
```

## ⚠️ Usage Limits

1. **Request Frequency**: Recommend keeping within 10 requests/minute
2. **Prompt Length**: Recommend not exceeding 500 characters
3. **Ratio Limits**: Only supports 2:3, 3:2, 1:1 ratios
4. **Content Moderation**: Automatically filters inappropriate content requests

## 🔍 FAQ

### Q: Why is the price so affordable?

A: Sora Image uses optimized reverse-engineered technology, reducing intermediate costs and passing savings to users.

### Q: How is image quality?

A: Based on Sora official same-source technology, quality is excellent and suitable for most commercial scenarios. Compared to GPT-Image-1's token-based billing, Sora Image's fixed pricing makes budget control easier.

### Q: What languages are supported?

A: Perfectly supports both Chinese and English prompts, with optimized Chinese effects.

### Q: Image copyright concerns?

A: Generated images can be used commercially, but recommend avoiding copyrighted content generation.

## 🎨 Effect Showcase

Here are some example effects generated using Sora Image:

| Prompt                     | Ratio | Effect Description                   |
| -------------------------- | ----- | ------------------------------------ |
| Cyberpunk city night scene | 3:2   | Neon lights, futuristic architecture |
| Fantasy unicorn            | 2:3   | Pink tones, fairy tale style         |
| Japanese Zen garden        | 1:1   | Minimalist, serene atmosphere        |

## 🔗 Related Resources

* [Complete Example Code](https://github.com/apiyi-api/ai-api-code-samples/tree/main/sora_image-API)
* [Image Edit API](/en/api-capabilities/sora-image-edit) - Edit existing images with Sora
* [GPT-Image-1 API](/en/api-capabilities/gpt-image-1) - Official interface image generation
* [Online Testing Tool](https://imagen.apiyi.com) - Compare different model effects

<Note>
  🚀 **Quick Start**: Register for an APIYI account to get test credits and immediately experience Sora Image's powerful features!
</Note>
