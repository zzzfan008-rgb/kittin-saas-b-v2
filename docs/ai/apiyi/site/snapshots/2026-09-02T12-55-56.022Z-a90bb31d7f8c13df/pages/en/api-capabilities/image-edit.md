> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Image Edit API

> Edit and modify images using OpenAI's official Image Edit API format

Use OpenAI's standard image editing API through APIYI to locally edit and modify existing images. This document details how to use the Image Edit API for image editing.

## Overview

The Image Edit API allows you to edit specific parts of an image by providing the original image, a mask, and a text prompt. This functionality is particularly suitable for:

* 🎨 **Local Modifications**: Modify only specific regions of the image
* 🔄 **Content Replacement**: Replace certain elements in the image
* ✨ **Creative Editing**: Add new elements while maintaining overall style
* 🖼️ **Image Restoration**: Repair or improve specific parts of the image

## How the API Works

Image editing requires three key elements:

1. **Original Image**: The base image to be edited
2. **Mask Image**: Specifies the regions to edit (transparent areas will be edited)
3. **Prompt**: Describes what you want to generate in the edit area

<Note>
  Transparent areas (alpha channel 0) in the mask image will be identified as parts needing editing. Fully opaque areas will remain unchanged.
</Note>

## Quick Start

### Basic Configuration

```python theme={null}
import openai
from PIL import Image
import requests
from io import BytesIO

# Configure APIYI
openai.api_base = "https://api.apiyi.com/v1"
openai.api_key = "your-api-key"
```

### Basic Edit Example

```python theme={null}
# Edit image
response = openai.Image.create_edit(
    image=open("original.png", "rb"),
    mask=open("mask.png", "rb"),
    prompt="A modern glass skyscraper with reflective windows",
    n=1,
    size="1024x1024"
)

# Get edited image URL
edited_image_url = response['data'][0]['url']
print(f"Edited image URL: {edited_image_url}")
```

## API Parameters

### Request Parameters

| Parameter         | Type         | Required | Description                                                                                                              |
| ----------------- | ------------ | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `image`           | string/array | Yes      | Image(s) to edit, supports PNG, WebP, or JPG files less than 50MB each. For gpt-image-1, you can provide up to 16 images |
| `mask`            | file         | Yes      | Mask image specifying edit regions, same format requirements as image                                                    |
| `prompt`          | string       | Yes      | Describes content to generate in masked area, max 1000 characters                                                        |
| `n`               | integer      | No       | Number of images to generate, default 1, max 10                                                                          |
| `size`            | string       | No       | Output image size, supports `256x256`, `512x512`, `1024x1024` (default)                                                  |
| `response_format` | string       | No       | Return format, `url` (default) or `b64_json`                                                                             |
| `user`            | string       | No       | User identifier                                                                                                          |

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

## Creating Mask Images

### Using Python PIL to Create Masks

```python theme={null}
from PIL import Image, ImageDraw

def create_mask(image_path, mask_areas):
    """
    Create mask image
    mask_areas: List containing coordinates of areas to edit [(x1, y1, x2, y2), ...]
    """
    # Open original image to get dimensions
    original = Image.open(image_path)
    width, height = original.size

    # Create fully black mask (completely opaque)
    mask = Image.new('RGBA', (width, height), (0, 0, 0, 255))
    draw = ImageDraw.Draw(mask)

    # Draw transparent areas (parts to edit)
    for area in mask_areas:
        draw.rectangle(area, fill=(0, 0, 0, 0))

    # Save mask
    mask.save('mask.png')
    return mask

# Example: Create center region mask
image_path = 'original.png'
img = Image.open(image_path)
width, height = img.size

# Edit center 50% of image
center_area = [
    (width * 0.25, height * 0.25,
     width * 0.75, height * 0.75)
]

mask = create_mask(image_path, center_area)
```

### Using Circular Mask

```python theme={null}
def create_circular_mask(image_path, center, radius):
    """Create circular mask"""
    original = Image.open(image_path)
    width, height = original.size

    # Create mask
    mask = Image.new('RGBA', (width, height), (0, 0, 0, 255))
    draw = ImageDraw.Draw(mask)

    # Draw circular transparent area
    x, y = center
    draw.ellipse(
        [(x - radius, y - radius),
         (x + radius, y + radius)],
        fill=(0, 0, 0, 0)
    )

    mask.save('circular_mask.png')
    return mask
```

## Complete Usage Example

### Python Complete Example

```python theme={null}
import openai
from PIL import Image, ImageDraw
import requests
from io import BytesIO
import os

# Configuration
openai.api_base = "https://api.apiyi.com/v1"
openai.api_key = "your-api-key"

class ImageEditor:
    def __init__(self):
        self.api_key = openai.api_key

    def create_mask_for_object_removal(self, image_path, bbox):
        """Create mask for object removal"""
        img = Image.open(image_path)
        mask = Image.new('RGBA', img.size, (0, 0, 0, 255))
        draw = ImageDraw.Draw(mask)
        draw.rectangle(bbox, fill=(0, 0, 0, 0))
        return mask

    def edit_image(self, image_path, mask, prompt):
        """Execute image editing"""
        try:
            # Prepare files
            with open(image_path, 'rb') as img_file:
                # Save mask to temporary file
                mask_path = 'temp_mask.png'
                mask.save(mask_path)

                with open(mask_path, 'rb') as mask_file:
                    # Call API
                    response = openai.Image.create_edit(
                        image=img_file,
                        mask=mask_file,
                        prompt=prompt,
                        n=1,
                        size="1024x1024"
                    )

                # Clean up temporary file
                os.remove(mask_path)

                return response['data'][0]['url']

        except Exception as e:
            print(f"Edit failed: {e}")
            return None

    def download_result(self, url, output_path):
        """Download edited image"""
        response = requests.get(url)
        img = Image.open(BytesIO(response.content))
        img.save(output_path)
        print(f"Saved to: {output_path}")

# Usage example
editor = ImageEditor()

# 1. Object removal example
image_path = "street_photo.png"
# Assume object to remove is at position (300, 200) to (500, 400)
bbox = (300, 200, 500, 400)
mask = editor.create_mask_for_object_removal(image_path, bbox)

# Edit image, fill removed area with background
result_url = editor.edit_image(
    image_path,
    mask,
    "empty street background, seamlessly blended"
)

if result_url:
    editor.download_result(result_url, "edited_street.png")
```

### Node.js Example

```javascript theme={null}
const OpenAI = require('openai');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

// Initialize client
const openai = new OpenAI({
  apiKey: 'your-api-key',
  baseURL: 'https://api.apiyi.com/v1'
});

// Create mask
async function createMask(imagePath, editArea) {
  const image = await loadImage(imagePath);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');

  // Fill black background (parts not to edit)
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, image.width, image.height);

  // Set transparent area (parts to edit)
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillRect(editArea.x, editArea.y, editArea.width, editArea.height);

  // Save mask
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('mask.png', buffer);
  return 'mask.png';
}

// Edit image
async function editImage(imagePath, maskPath, prompt) {
  try {
    const response = await openai.images.edit({
      image: fs.createReadStream(imagePath),
      mask: fs.createReadStream(maskPath),
      prompt: prompt,
      n: 1,
      size: "1024x1024"
    });

    return response.data[0].url;
  } catch (error) {
    console.error('Edit failed:', error);
    return null;
  }
}

// Usage example
async function main() {
  const imagePath = 'original.png';

  // Create mask - edit bottom right area
  const editArea = {
    x: 512,
    y: 512,
    width: 512,
    height: 512
  };

  const maskPath = await createMask(imagePath, editArea);

  // Execute edit
  const editedUrl = await editImage(
    imagePath,
    maskPath,
    "A beautiful garden with colorful flowers"
  );

  if (editedUrl) {
    console.log('Edit successful:', editedUrl);
  }

  // Clean up temporary files
  fs.unlinkSync(maskPath);
}

main();
```

## Practical Application Scenarios

### 1. Background Replacement

```python theme={null}
def replace_background(image_path, prompt_background):
    """Replace image background"""
    # Assume we have mask with foreground separated
    mask = Image.open("foreground_mask.png")

    response = openai.Image.create_edit(
        image=open(image_path, "rb"),
        mask=mask,
        prompt=f"Professional studio background, {prompt_background}",
        size="1024x1024"
    )

    return response['data'][0]['url']

# Usage example
new_url = replace_background(
    "portrait.png",
    "gradient blue background with soft lighting"
)
```

### 2. Object Removal

```python theme={null}
def remove_object(image_path, object_bbox):
    """Remove specific object from image"""
    # Create mask for object area
    img = Image.open(image_path)
    mask = Image.new('RGBA', img.size, (0, 0, 0, 255))
    draw = ImageDraw.Draw(mask)
    draw.rectangle(object_bbox, fill=(0, 0, 0, 0))

    # Save mask
    mask_path = "object_mask.png"
    mask.save(mask_path)

    # Edit image
    response = openai.Image.create_edit(
        image=open(image_path, "rb"),
        mask=open(mask_path, "rb"),
        prompt="seamlessly blend with surrounding environment, natural continuation of background",
        size="1024x1024"
    )

    return response['data'][0]['url']
```

### 3. Clothing Change

```python theme={null}
def change_clothing(portrait_path, clothing_mask_path, new_clothing_desc):
    """Change person's clothing"""
    response = openai.Image.create_edit(
        image=open(portrait_path, "rb"),
        mask=open(clothing_mask_path, "rb"),
        prompt=f"person wearing {new_clothing_desc}, natural fit and lighting",
        size="1024x1024"
    )

    return response['data'][0]['url']

# Example
new_url = change_clothing(
    "person.png",
    "clothing_mask.png",
    "elegant black business suit with white shirt"
)
```

### 4. Image Restoration

```python theme={null}
def repair_damaged_area(image_path, damage_mask_path):
    """Repair damaged image areas"""
    response = openai.Image.create_edit(
        image=open(image_path, "rb"),
        mask=open(damage_mask_path, "rb"),
        prompt="restore and repair the damaged area, maintain original style and details",
        size="1024x1024"
    )

    return response['data'][0]['url']
```

## Advanced Techniques

### 1. Feathered Mask

Create mask with feathered edges for more natural edits:

```python theme={null}
from PIL import ImageFilter

def create_feathered_mask(image_path, edit_area, feather_radius=20):
    """Create feathered mask"""
    img = Image.open(image_path)
    mask = Image.new('L', img.size, 0)
    draw = ImageDraw.Draw(mask)

    # Draw edit area
    draw.rectangle(edit_area, fill=255)

    # Apply Gaussian blur for feathering
    mask = mask.filter(ImageFilter.GaussianBlur(feather_radius))

    # Convert to RGBA
    rgba_mask = Image.new('RGBA', img.size, (0, 0, 0, 255))
    rgba_mask.putalpha(255 - mask)

    return rgba_mask
```

### 2. Multi-Region Editing

Edit multiple regions simultaneously:

```python theme={null}
def create_multi_region_mask(image_path, regions):
    """Create multi-region mask"""
    img = Image.open(image_path)
    mask = Image.new('RGBA', img.size, (0, 0, 0, 255))
    draw = ImageDraw.Draw(mask)

    for region in regions:
        if region['type'] == 'rectangle':
            draw.rectangle(region['coords'], fill=(0, 0, 0, 0))
        elif region['type'] == 'ellipse':
            draw.ellipse(region['coords'], fill=(0, 0, 0, 0))

    return mask

# Usage example
regions = [
    {'type': 'rectangle', 'coords': (100, 100, 300, 300)},
    {'type': 'ellipse', 'coords': (400, 400, 600, 600)}
]

mask = create_multi_region_mask('image.png', regions)
```

### 3. Smart Prompt Construction

```python theme={null}
def build_context_aware_prompt(original_desc, edit_type, new_element):
    """Build context-aware prompt"""
    prompts = {
        'replace': f"Replace with {new_element}, matching the {original_desc} style and lighting",
        'remove': f"Natural {original_desc} background, seamlessly filled",
        'add': f"Add {new_element} that fits naturally with {original_desc}",
        'repair': f"Restore and fix, maintaining {original_desc} characteristics"
    }

    return prompts.get(edit_type, f"{new_element} in {original_desc}")
```

## Best Practices

### 1. Image Preparation

* **Format Requirements**: Supports PNG, WebP, and JPG formats
* **File Size**: Less than 50MB per image
* **Batch Processing**: gpt-image-1 supports up to 16 images
* **Resolution Recommendation**: Use 1024x1024 for best results

### 2. Mask Design

* **Precise Mask**: More precise mask yields better edit results
* **Edge Treatment**: Consider using feathered edges for more natural edits
* **Region Size**: Avoid overly large edit regions which may affect results

### 3. Prompt Optimization

```python theme={null}
# Good prompt examples
good_prompts = [
    "Empty wooden table surface, matching the existing wood grain and lighting",
    "Clear blue sky with soft clouds, natural continuation of the horizon",
    "Modern glass building facade, reflecting the surrounding environment"
]

# Prompts to avoid
bad_prompts = [
    "Something different",  # Too vague
    "Red",  # Lacks context
    "Change it"  # Not specific
]
```

### 4. Error Handling

```python theme={null}
def safe_edit_image(image_path, mask_path, prompt, max_retries=3):
    """Image editing with error handling and retry"""
    for attempt in range(max_retries):
        try:
            # Validate files
            if not os.path.exists(image_path):
                raise FileNotFoundError(f"Image file not found: {image_path}")

            if not os.path.exists(mask_path):
                raise FileNotFoundError(f"Mask file not found: {mask_path}")

            # Check file size
            if os.path.getsize(image_path) > 50 * 1024 * 1024:
                raise ValueError("Image file exceeds 50MB")

            # Execute edit
            response = openai.Image.create_edit(
                image=open(image_path, "rb"),
                mask=open(mask_path, "rb"),
                prompt=prompt,
                size="1024x1024"
            )

            return response['data'][0]['url']

        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {e}")
            if attempt == max_retries - 1:
                raise
            time.sleep(2 ** attempt)  # Exponential backoff
```

## FAQ

### Q: Why doesn't the edit result match expectations?

A: Check if mask is correct, ensure transparent areas accurately cover parts to edit. Also optimize prompt with more specific descriptions.

### Q: What image formats are supported?

A: Supports PNG, WebP, and JPG formats, less than 50MB per image. gpt-image-1 supports up to 16 images.

### Q: How to achieve more natural edit results?

A: Use feathered masks, emphasize "natural blending" and "matching surrounding environment" in prompts.

### Q: Can multiple regions be edited simultaneously?

A: Yes, simply mark multiple transparent areas in the mask.

### Q: What are the limitations for editing large images?

A: Each image file must be less than 50MB. gpt-image-1 supports batch processing of up to 16 images.

## Related Resources

* OpenAI Official API Documentation: `platform.openai.com/docs/api-reference/images/createEdit`
* OpenAI Image Edit Guide: `platform.openai.com/docs/guides/images/edits`
* PIL/Pillow Documentation: `pillow.readthedocs.io`
* [APIYI Console](https://api.apiyi.com)

<Note>
  The Image Edit API is particularly suitable for scenarios requiring precise control of edit areas. With well-designed masks and optimized prompts, professional-grade image editing results can be achieved.
</Note>
