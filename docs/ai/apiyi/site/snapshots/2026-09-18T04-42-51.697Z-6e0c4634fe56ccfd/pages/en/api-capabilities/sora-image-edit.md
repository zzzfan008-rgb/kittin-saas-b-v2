> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Sora Image Edit API

> Edit and transform existing images using Sora's reverse-engineered technology, pay-per-request at only $0.01/image

Sora Image editing functionality is based on image-to-image technology from sora.chatgpt.com, implementing intelligent editing and transformation of existing images through chat completion interface. Supports processing of single or multiple images with highly competitive pricing.

<Note>
  **🎨 Smart Image Editing**
  Upload image + text description = Brand new creation! Supports style conversion, element modification, multi-image fusion and other advanced features.
</Note>

## 🌟 Core Features

* **🔄 Flexible Editing**: Supports style conversion, element addition/removal, color adjustment, etc.
* **🎭 Multi-Image Processing**: Can process multiple images simultaneously, achieving fusion, splicing and other effects
* **💰 Exceptional Value**: \$0.01/image, pay-per-request
* **🚀 Instant Generation**: Based on chat interface, fast response
* **🌏 Chinese-Friendly**: Perfect support for Chinese edit instructions

## 📋 Feature Comparison

| Feature           | Sora Image Edit  | Traditional Image Edit API | DALL·E 2 Edit        |
| ----------------- | ---------------- | -------------------------- | -------------------- |
| Price             | \$0.01/image     | \$0.02-0.09/image          | \$0.018/image        |
| Chinese Support   | ✅ Native support | ❌ Translation needed       | ❌ Translation needed |
| Multi-Image Input | ✅ Supported      | ❌ Not supported            | ❌ Not supported      |
| Response Speed    | Fast             | Medium                     | Slow                 |

## 🚀 Quick Start

### Basic Example - Single Image Edit

```python theme={null}
import requests
import re

# API Configuration
API_KEY = "YOUR_API_KEY"
API_URL = "https://api.apiyi.com/v1/chat/completions"

def edit_image(image_url, prompt, model="gpt-4o-image"):
    """
    Edit single image

    Args:
        image_url: Original image URL
        prompt: Edit description
        model: Model to use, options: "gpt-4o-image" or "sora_image"
    """
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    # Build message containing image
    content = [
        {"type": "text", "text": prompt},
        {"type": "image_url", "image_url": {"url": image_url}}
    ]

    payload = {
        "model": model,
        "messages": [{"role": "user", "content": content}]
    }

    response = requests.post(API_URL, headers=headers, json=payload)
    result = response.json()

    # Extract edited image URL
    content = result['choices'][0]['message']['content']
    edited_urls = re.findall(r'!\[.*?\]\((https?://[^)]+)\)', content)

    return edited_urls[0] if edited_urls else None

# Usage example
original_url = "https://example.com/cat.jpg"
edited_url = edit_image(original_url, "Change the cat's fur color to rainbow")
print(f"Edited image: {edited_url}")
```

### Advanced Example - Multi-Image Fusion

```python theme={null}
def merge_images(image_urls, prompt, model="gpt-4o-image"):
    """
    Merge multiple images

    Args:
        image_urls: List of image URLs
        prompt: Fusion description
    """
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    # Build message containing multiple images
    content = [{"type": "text", "text": prompt}]
    for url in image_urls:
        content.append({
            "type": "image_url",
            "image_url": {"url": url}
        })

    payload = {
        "model": model,
        "messages": [{"role": "user", "content": content}]
    }

    response = requests.post(API_URL, headers=headers, json=payload)
    result = response.json()

    # Extract result
    content = result['choices'][0]['message']['content']
    merged_urls = re.findall(r'!\[.*?\]\((https?://[^)]+)\)', content)

    return merged_urls

# Fusion example
urls = [
    "https://example.com/landscape1.jpg",
    "https://example.com/landscape2.jpg"
]
merged = merge_images(urls, "Merge two landscape images into one panorama")
```

## 🎯 Editing Scenario Examples

### 1. Style Conversion

```python theme={null}
# Style conversion templates
style_templates = {
    "cartoon": "Convert to Disney cartoon style, vibrant colors",
    "oil_painting": "Convert to classic oil painting style, like Van Gogh's style",
    "ink_wash": "Convert to Chinese ink wash painting style, empty space aesthetics",
    "cyberpunk": "Convert to cyberpunk style, neon light effects",
    "sketch": "Convert to pencil sketch style, black and white lines"
}

def apply_style(image_url, style_name):
    """Apply preset style"""
    if style_name in style_templates:
        prompt = style_templates[style_name]
        return edit_image(image_url, prompt)
    else:
        return None

# Batch style conversion
original = "https://example.com/portrait.jpg"
for style in ["cartoon", "oil_painting", "ink_wash"]:
    result = apply_style(original, style)
    print(f"{style} style: {result}")
```

### 2. Smart Background Change

```python theme={null}
def change_background(image_url, new_background):
    """Change image background"""
    prompts = {
        "beach": "Keep subject, change background to sunny beach with palm trees and blue sky",
        "office": "Keep person, change background to modern office",
        "space": "Keep subject, change background to vast starry sky",
        "solid_color": "Remove background, change to pure white background"
    }

    prompt = prompts.get(new_background, f"Change background to {new_background}")
    return edit_image(image_url, prompt)

# Usage example
new_photo = change_background(
    "https://example.com/person.jpg",
    "beach"
)
```

### 3. Object Editing

```python theme={null}
def edit_objects(image_url, action, target, details=""):
    """Edit specific objects in image"""
    action_prompts = {
        "add": f"Add {target} to the image, {details}",
        "remove": f"Remove {target} from the image, naturally fill background",
        "replace": f"Replace {target} in the image with {details}",
        "modify": f"Modify {target} in the image, {details}"
    }

    prompt = action_prompts.get(action, "")
    return edit_image(image_url, prompt)

# Editing examples
# Add object
result1 = edit_objects(
    "https://example.com/room.jpg",
    "add", "a cat", "sitting on the sofa"
)

# Remove object
result2 = edit_objects(
    "https://example.com/street.jpg",
    "remove", "utility pole"
)

# Replace object
result3 = edit_objects(
    "https://example.com/table.jpg",
    "replace", "apple", "orange"
)
```

### 4. Color and Lighting Adjustment

```python theme={null}
def adjust_image(image_url, adjustments):
    """Adjust image color and lighting"""
    prompt_parts = []

    if "brightness" in adjustments:
        prompt_parts.append(f"adjust brightness to {adjustments['brightness']}")

    if "color_tone" in adjustments:
        prompt_parts.append(f"adjust color tone to {adjustments['color_tone']}")

    if "time" in adjustments:
        prompt_parts.append(f"adjust lighting to {adjustments['time']} effect")

    if "season" in adjustments:
        prompt_parts.append(f"adjust season feel to {adjustments['season']}")

    prompt = ", ".join(prompt_parts)
    return edit_image(image_url, prompt)

# Adjustment example
adjusted = adjust_image(
    "https://example.com/landscape.jpg",
    {
        "brightness": "bright",
        "color_tone": "warm tones",
        "time": "golden hour",
        "season": "autumn"
    }
)
```

## 💡 Advanced Techniques

### 1. Batch Processing Optimization

```python theme={null}
import asyncio
import aiohttp

async def edit_image_async(session, image_url, prompt):
    """Asynchronously edit image"""
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    content = [
        {"type": "text", "text": prompt},
        {"type": "image_url", "image_url": {"url": image_url}}
    ]

    payload = {
        "model": "gpt-4o-image",
        "messages": [{"role": "user", "content": content}]
    }

    async with session.post(API_URL, headers=headers, json=payload) as response:
        result = await response.json()
        content = result['choices'][0]['message']['content']
        urls = re.findall(r'!\[.*?\]\((https?://[^)]+)\)', content)
        return urls[0] if urls else None

async def batch_edit(image_urls, prompts):
    """Batch edit multiple images"""
    async with aiohttp.ClientSession() as session:
        tasks = []
        for url, prompt in zip(image_urls, prompts):
            task = edit_image_async(session, url, prompt)
            tasks.append(task)

        results = await asyncio.gather(*tasks)
        return results

# Batch processing example
image_urls = ["url1.jpg", "url2.jpg", "url3.jpg"]
prompts = ["Convert to cartoon style", "Add rainbow", "Change to night scene"]

results = asyncio.run(batch_edit(image_urls, prompts))
```

### 2. Edit History Management

```python theme={null}
import json
from datetime import datetime

class EditHistory:
    """Image edit history management"""

    def __init__(self, filename="edit_history.json"):
        self.filename = filename
        self.history = self.load_history()

    def load_history(self):
        try:
            with open(self.filename, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return []

    def save_edit(self, original_url, edited_url, prompt):
        """Save edit record"""
        record = {
            "timestamp": datetime.now().isoformat(),
            "original": original_url,
            "edited": edited_url,
            "prompt": prompt,
            "cost": 0.01
        }

        self.history.append(record)

        with open(self.filename, 'w') as f:
            json.dump(self.history, f, indent=2)

    def get_total_cost(self):
        """Calculate total cost"""
        return sum(record['cost'] for record in self.history)

# Using history management
history = EditHistory()

# Edit and record
original = "https://example.com/photo.jpg"
edited = edit_image(original, "Beautify photo")
history.save_edit(original, edited, "Beautify photo")

print(f"Total edited images: {len(history.history)}")
print(f"Total cost: ${history.get_total_cost():.2f}")
```

### 3. Smart Edit Suggestions

```python theme={null}
def suggest_edits(image_description):
    """Generate edit suggestions based on image description"""
    suggestions = []

    # Content-based suggestions
    if "portrait" in image_description:
        suggestions.extend([
            "Beauty skin smoothing, natural effect",
            "Change to professional studio background",
            "Adjust to professional portrait lighting"
        ])

    if "landscape" in image_description:
        suggestions.extend([
            "Enhance color saturation for more vivid scenery",
            "Adjust to golden hour lighting",
            "Add dreamy light effects"
        ])

    if "product" in image_description:
        suggestions.extend([
            "Change to pure white background",
            "Increase product shine",
            "Add reflection effect"
        ])

    # General suggestions
    suggestions.extend([
        "Convert to oil painting art style",
        "Apply vintage filter effect",
        "Optimize overall color balance"
    ])

    return suggestions

# Get edit suggestions
suggestions = suggest_edits("portrait photo")
print("Recommended editing operations:")
for i, suggestion in enumerate(suggestions[:5], 1):
    print(f"{i}. {suggestion}")
```

## 📊 Effect Comparison

| Edit Type          | Original Description | Edit Instruction           | Effect Description                      |
| ------------------ | -------------------- | -------------------------- | --------------------------------------- |
| Style Conversion   | Real photo           | Convert to anime style     | Keeps composition, Japanese anime style |
| Background Change  | Indoor portrait      | Change to beach background | Natural fusion, matched lighting        |
| Object Edit        | Desktop scene        | Add a cup of coffee        | Accurate perspective, realistic shadow  |
| Multi-Image Fusion | Two landscapes       | Create panorama            | Seamless splicing, unified tones        |

## ⚠️ Usage Recommendations

1. **Image Quality**: Higher input image resolution yields better editing results
2. **Clear Description**: Edit instructions should be specific and clear, avoid ambiguity
3. **Step-by-Step Editing**: Complex edits recommended step-by-step for better results
4. **Save Original**: Always keep original image backup

## 🔍 FAQ

### Q: What image formats are supported?

A: Supports common formats like JPG, PNG, WebP, input via URL method.

### Q: What image sizes can be processed?

A: Recommend images under 20MB, excessive size may affect processing speed.

### Q: What resolution are edited images?

A: Usually maintains similar resolution to original, depending on edit content.

### Q: How to process batch images?

A: Use async requests or loop calls, recommend controlling concurrency count.

## 🎨 Creative Applications

* **E-commerce Image Processing**: Batch change product backgrounds
* **Social Media Content**: Quickly generate multiple style variants
* **Creative Design**: Explore different visual effects
* **Photo Restoration**: Improve old photo quality
* **Content Creation**: Generate variants for story illustrations

## 🔗 Related Resources

* [Complete Example Code](https://github.com/apiyi-api/ai-api-code-samples/tree/main/sora_image-API)
* [Sora Image Generation API](/en/api-capabilities/sora-image-generation) - Text-to-image functionality
* [Vision Understanding API](/en/api-capabilities/vision-understanding) - Image analysis functionality
* [Online Experience Tool](https://imagen.apiyi.com) - Test various effects

<Note>
  💡 **Pro Tip**: Combine with Vision Understanding API to analyze image content first, then perform targeted editing for better results!
</Note>
