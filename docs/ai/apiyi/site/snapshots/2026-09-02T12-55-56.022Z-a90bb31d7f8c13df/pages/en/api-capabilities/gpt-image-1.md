> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image-1 Image Generation API - OpenAI's Latest Image API

> Use OpenAI's official Image API format to call the GPT-Image-1 model for high-quality image generation. APIYI is fully compatible with OpenAI format.

GPT-Image-1 is OpenAI's image generation model, providing high-quality image generation capabilities. Use it through APIYI with the standard OpenAI Image API format. For faster speed and stronger text rendering, check out [GPT-Image-1.5](/en/api-capabilities/gpt-image-1-5).

## Overview

GPT-Image-1 supports generating high-quality images from text prompts, fully compatible with OpenAI's official Image Generation API format.

### Key Features

* 🎨 **High-Quality Image Generation**: Creates detailed images that match your prompts
* 🚀 **Fast Response**: Optimized generation speed for quick results
* 💰 **Flexible Billing**: Supports token-based (\$2.50/M input, \$8.00/M output) or per-image billing (\$0.005-\$0.052/image)
* 🔧 **Full Compatibility**: 100% compatible with OpenAI Image API format
* 🆕 **Multiple Models**: Available in both gpt-image-1 and gpt-image-1-mini versions

## Quick Start

### Basic Configuration

```python theme={null}
import openai

# Configure APIYI endpoint and key
openai.api_base = "https://api.apiyi.com/v1"
openai.api_key = "your-api-key"
```

### Generate Images

Call using standard OpenAI Image API format:

```python theme={null}
# Generate image
response = openai.Image.create(
    model="gpt-image-1",
    prompt="A serene landscape with mountains and a lake at sunset",
    n=1,
    size="1024x1024"
)

# Get generated image URL
image_url = response['data'][0]['url']
print(f"Generated image URL: {image_url}")
```

## API Parameters

### Request Parameters

| Parameter            | Type    | Required | Description                                                                  |
| -------------------- | ------- | -------- | ---------------------------------------------------------------------------- |
| `model`              | string  | Yes      | Model name, use `gpt-image-1`                                                |
| `prompt`             | string  | Yes      | Text prompt for image generation, max 1000 characters                        |
| `n`                  | integer | No       | Number of images to generate, default 1, max 10                              |
| `size`               | string  | No       | Image size, supports `1024x1024`, `1536x1024`, `1024x1536`, `auto` (default) |
| `quality`            | string  | No       | Rendering quality, supports `low`, `medium`, `high`, `auto` (default)        |
| `output_format`      | string  | No       | Output format, supports `png` (default), `jpeg`, `webp`                      |
| `output_compression` | integer | No       | Compression level (0-100%), applies to JPEG and WebP only                    |
| `background`         | string  | No       | Background setting, supports `transparent`, `opaque`, `auto` (default)       |
| `response_format`    | string  | No       | Return format, `url` (default) or `b64_json`                                 |
| `user`               | string  | No       | User identifier for monitoring and abuse detection                           |

### Parameter Details

#### Size Options (size)

* `1024x1024` - Square (fastest generation by default)
* `1536x1024` - Landscape/horizontal mode
* `1024x1536` - Portrait/vertical mode
* `auto` - Model automatically selects best size based on prompt (default)

#### Quality Options (quality)

* `low` - Low quality, fastest generation
* `medium` - Medium quality
* `high` - High quality, most detailed
* `auto` - Model automatically selects based on prompt (default)

<Tip>
  **Performance Tip**: Square images + standard quality generate fastest. For latency-sensitive applications, use `jpeg` format instead of `png`.
</Tip>

#### Output Format (output\_format)

* `png` - Lossless compression, default format
* `jpeg` - Lossy compression, supports compression level, faster generation
* `webp` - Modern format, smaller files, supports compression level

When using `jpeg` or `webp`, control compression level with `output_compression` parameter (0-100%). For example, `output_compression=50` compresses the image by 50%.

#### Background Options (background)

* `transparent` - Transparent background (for PNG/WebP)
* `opaque` - Opaque background
* `auto` - Model automatically selects (default)

### Response Format

```json theme={null}
{
  "created": 1702486395,
  "data": [
    {
      "url": "https://..."
    }
  ]
}
```

## Models & Pricing

### Available Models

APIYI supports two GPT-Image series models:

<CardGroup cols={2}>
  <Card title="gpt-image-1" icon="image">
    Standard version with full image generation capabilities
  </Card>

  <Card title="gpt-image-1-mini" icon="sparkles">
    Lightweight version with faster generation and lower cost
  </Card>
</CardGroup>

### Pricing Options

GPT-Image-1 supports two billing methods, automatically selecting the most cost-effective option:

#### 1. Token-Based Billing (Pay-as-you-go)

Ideal for scenarios requiring precise cost control:

| Token Type    | Price                   |
| ------------- | ----------------------- |
| Input Tokens  | \$2.50 / million tokens |
| Output Tokens | \$8.00 / million tokens |

<Info>
  Token-based billing charges based on prompt length (input) and generated image data volume (output), providing controllable costs.
</Info>

#### 2. Per-Image Billing (Pay-per-use)

Ideal for batch generation or fixed cost requirements:

**Low Quality**

| Size      | Price           |
| --------- | --------------- |
| 1024×1024 | \$0.005 / image |
| 1024×1536 | \$0.006 / image |
| 1536×1024 | \$0.006 / image |

**Medium Quality**

| Size      | Price           |
| --------- | --------------- |
| 1024×1024 | \$0.011 / image |
| 1024×1536 | \$0.015 / image |
| 1536×1024 | \$0.015 / image |

**High Quality**

| Size      | Price           |
| --------- | --------------- |
| 1024×1024 | \$0.036 / image |
| 1024×1536 | \$0.052 / image |
| 1536×1024 | \$0.052 / image |

<Warning>
  The system automatically selects the more cost-effective billing method. You don't need to choose manually. Final charges are based on actual usage.
</Warning>

### Model Comparison

| Feature          | gpt-image-1               | gpt-image-1-mini                    |
| ---------------- | ------------------------- | ----------------------------------- |
| Image Quality    | Standard                  | Faster speed                        |
| Generation Speed | Standard                  | Faster                              |
| Pricing          | Standard pricing          | More affordable                     |
| Use Cases        | High-quality requirements | Rapid prototyping, batch generation |

<Tip>
  For budget-conscious scenarios or rapid iteration needs, we recommend gpt-image-1-mini. For production environments requiring the best quality, we recommend gpt-image-1.
</Tip>

## Usage Examples

### Python Example

```python theme={null}
import openai
import requests
from PIL import Image
from io import BytesIO

# Configuration
openai.api_base = "https://api.apiyi.com/v1"
openai.api_key = "your-api-key"

# Generate image (using new parameters)
def generate_image(prompt, size="auto", quality="auto", output_format="png", n=1):
    try:
        response = openai.Image.create(
            model="gpt-image-1",
            prompt=prompt,
            n=n,
            size=size,
            quality=quality,
            output_format=output_format
        )

        # Return image URLs
        return [item['url'] for item in response['data']]

    except Exception as e:
        print(f"Error generating image: {e}")
        return None

# Advanced example: using compression and background settings
def generate_advanced_image(prompt, compression=None):
    params = {
        "model": "gpt-image-1",
        "prompt": prompt,
        "size": "1536x1024",  # Landscape image
        "quality": "high",
        "output_format": "jpeg" if compression else "png",
        "background": "transparent"
    }

    # Add compression parameter if needed
    if compression:
        params["output_compression"] = compression

    try:
        response = openai.Image.create(**params)
        return response['data'][0]['url']
    except Exception as e:
        print(f"Error: {e}")
        return None

# Download and save image
def save_image(url, filename):
    response = requests.get(url)
    img = Image.open(BytesIO(response.content))
    img.save(filename)
    print(f"Image saved as {filename}")

# Usage example
prompts = [
    "A futuristic city with flying cars and neon lights",
    "A cozy coffee shop in autumn with warm lighting",
    "An abstract art piece with vibrant colors and geometric shapes"
]

for i, prompt in enumerate(prompts):
    print(f"Generating: {prompt}")
    urls = generate_image(prompt)
    if urls:
        save_image(urls[0], f"image_{i+1}.png")
```

### Node.js Example

```javascript theme={null}
const OpenAI = require('openai');
const fs = require('fs');
const https = require('https');

// Initialize client
const openai = new OpenAI({
  apiKey: 'your-api-key',
  baseURL: 'https://api.apiyi.com/v1'
});

// Generate image (using new parameters)
async function generateImage(prompt, options = {}) {
  try {
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: prompt,
      n: options.n || 1,
      size: options.size || "auto",
      quality: options.quality || "auto",
      output_format: options.format || "png",
      background: options.background || "auto",
      ...options.compression && { output_compression: options.compression }
    });

    return response.data[0].url;
  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
}

// Advanced example: generate high-quality landscape image
async function generateLandscapeImage(prompt) {
  const options = {
    size: "1536x1024",
    quality: "high",
    format: "jpeg",
    compression: 85  // 85% quality
  };

  return await generateImage(prompt, options);
}

// Download image
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Image saved to ${filepath}`);
        resolve();
      });
    }).on('error', reject);
  });
}

// Usage example
async function main() {
  const prompt = "A beautiful Japanese garden with cherry blossoms";
  const imageUrl = await generateImage(prompt);

  if (imageUrl) {
    await downloadImage(imageUrl, 'japanese_garden.png');
  }
}

main();
```

### cURL Example

```bash theme={null}
curl https://api.apiyi.com/v1/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "gpt-image-1",
    "prompt": "A white siamese cat sitting on a windowsill",
    "n": 1,
    "size": "1024x1024"
  }'
```

## Prompt Optimization Tips

### 1. Detailed Descriptions

Provide specific, detailed descriptions for better results:

```python theme={null}
# Basic prompt
prompt_basic = "a cat"

# Optimized prompt
prompt_detailed = "a fluffy white Persian cat sitting on a vintage velvet cushion, soft natural lighting, professional photography, shallow depth of field"
```

### 2. Style Specification

Explicitly specify the desired artistic style:

```python theme={null}
styles = [
    "in the style of Studio Ghibli anime",
    "photorealistic, professional photography",
    "digital art, concept art style",
    "oil painting, impressionist style",
    "minimalist, flat design illustration"
]
```

### 3. Composition and Perspective

Specifying composition and perspective yields more precise results:

```python theme={null}
compositions = [
    "close-up portrait, centered composition",
    "wide angle landscape shot, rule of thirds",
    "aerial view, bird's eye perspective",
    "low angle shot, dramatic perspective"
]
```

## Batch Generation

Example of generating multiple images in batch:

```python theme={null}
import asyncio
import aiohttp
import openai

async def generate_batch_images(prompts, size="1024x1024"):
    """Batch generate images"""
    tasks = []

    async with aiohttp.ClientSession() as session:
        for prompt in prompts:
            task = generate_single_image(session, prompt, size)
            tasks.append(task)

        results = await asyncio.gather(*tasks)

    return results

async def generate_single_image(session, prompt, size):
    """Asynchronously generate single image"""
    headers = {
        "Authorization": f"Bearer {openai.api_key}",
        "Content-Type": "application/json"
    }

    data = {
        "model": "gpt-image-1",
        "prompt": prompt,
        "n": 1,
        "size": size
    }

    async with session.post(
        f"{openai.api_base}/images/generations",
        headers=headers,
        json=data
    ) as response:
        result = await response.json()
        return {
            "prompt": prompt,
            "url": result['data'][0]['url']
        }

# Usage example
prompts = [
    "A majestic eagle soaring over mountains",
    "A underwater coral reef teeming with colorful fish",
    "A cozy cabin in a snowy forest at night",
    "A bustling Tokyo street with neon signs"
]

# Run batch generation
results = asyncio.run(generate_batch_images(prompts))
for result in results:
    print(f"Prompt: {result['prompt']}")
    print(f"URL: {result['url']}\n")
```

## Error Handling

### Common Error Codes

| Error Code | Description                | Solution                                 |
| ---------- | -------------------------- | ---------------------------------------- |
| 400        | Invalid request parameters | Check prompt length and parameter format |
| 401        | Authentication failed      | Verify API key is correct                |
| 429        | Too many requests          | Reduce request frequency or upgrade plan |
| 500        | Server error               | Retry later or contact technical support |

### Error Handling Example

```python theme={null}
import time
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

def generate_with_retry(prompt, max_retries=3):
    """Image generation with retry mechanism"""
    for attempt in range(max_retries):
        try:
            response = client.images.generate(
                model="gpt-image-1",
                prompt=prompt,
                n=1,
                size="1024x1024"
            )
            return response.data[0].url

        except Exception as e:
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt  # Exponential backoff
                print(f"Error: {e}. Retrying in {wait_time} seconds...")
                time.sleep(wait_time)
            else:
                print(f"Failed after {max_retries} attempts: {e}")
                return None
```

## Best Practices

### 1. Prompt Length Control

While max 1000 characters is supported, typically 100-200 characters of detailed description yields excellent results.

### 2. Image Size and Quality Selection

**Size Recommendations**:

* `1024x1024`: General scenarios, fastest generation
* `1536x1024`: Landscape composition, suitable for scenery, banners
* `1024x1536`: Portrait composition, suitable for portraits, posters
* `auto`: Let model automatically choose based on content

**Quality Recommendations**:

* `low`: Quick preview, batch generation
* `medium`: Daily use
* `high`: Professional use, print output
* `auto`: Model automatic optimization

**Format Selection**:

* `png`: Need transparent background or lossless quality
* `jpeg`: Prioritize speed and smaller files
* `webp`: Modern web applications, best compression ratio

### 3. Content Moderation

Generated images are automatically moderated to ensure compliance with usage policies. Avoid requesting generation of:

* Violent or disturbing imagery
* Adult content
* Hateful or discriminatory content
* Misleading or false information
* Copyright-infringing content

### 4. Cost Optimization

* Use smaller sizes for testing and previewing
* Set reasonable concurrency limits for batch generation
* Cache generated image URLs to avoid duplicate generation

## Comparison with Sora Image

| Feature         | GPT-Image-1                                                            | Sora Image                    |
| --------------- | ---------------------------------------------------------------------- | ----------------------------- |
| Pricing         | Token-based (\$2.50/\$8.00 per M) or per-image (\$0.005-\$0.052/image) | \$0.01/image                  |
| Billing Method  | Flexible (Token or per-image)                                          | Fixed per-request             |
| API Type        | Images API                                                             | Chat Completions API          |
| Size Support    | 1024×1024, 1024×1536, 1536×1024                                        | 2:3, 3:2, 1:1 ratios          |
| Quality Options | Low / Medium / High                                                    | Standard quality              |
| Response Format | URL or Base64                                                          | Markdown formatted image link |

## FAQ

### Q: Can generated images be used commercially?

A: Yes, you own full rights to images generated via the API and can use them for commercial purposes.

### Q: How long are image URLs valid?

A: Generated image URLs are typically valid for 24 hours. We recommend downloading and saving them promptly.

### Q: Are Chinese prompts supported?

A: Yes, but English prompts are recommended for best results.

### Q: How to improve generated image quality?

A: Use detailed, specific descriptions including style, lighting, composition, and other details.

## Related Resources

* OpenAI Official API Documentation: `platform.openai.com/docs/api-reference/images/create`
* OpenAI Official Image Generation Guide: `platform.openai.com/docs/guides/images`
* [APIYI Console](https://api.apiyi.com)
* Technical Support: `support@apiyi.com`

<Note>
  GPT-Image-1 offers flexible billing options: token-based (input \$2.50/M, output \$8.00/M) or per-image (\$0.005-\$0.052/image). The system automatically selects the more cost-effective method. Also available in gpt-image-1-mini for rapid prototyping and batch generation scenarios.
</Note>
