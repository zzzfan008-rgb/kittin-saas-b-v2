> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Vision Understanding (Image Recognition) API

> Use AI models for intelligent image analysis and understanding, supporting object recognition, scene description, text extraction, and more

APIYI provides powerful image understanding capabilities, supporting deep analysis and understanding of images using various advanced AI models. Through a unified OpenAI API format, you can easily implement image recognition, scene description, OCR text recognition, and other functions.

<Note>
  **🔍 Intelligent Visual Analysis**
  Supports various visual tasks including object recognition, scene understanding, text extraction, sentiment analysis, and more, enabling AI to truly "understand" images.
</Note>

## 🌟 Core Features

* **🎯 Multi-Model Support**: Top multimodal models like the Gemini 3, GPT-5, and Claude 4 series
* **📸 Flexible Input**: Supports URL links and Base64 encoded images
* **🌏 Chinese Optimization**: Perfect support for Chinese scene understanding and text recognition
* **⚡ Fast Response**: High-performance inference with second-level results
* **💰 Cost Control**: Multiple model options to meet different budget requirements

## 📋 Supported Vision Models

The following are current mainstream multimodal recommendations. Model IDs may change with new releases — always defer to the console.

| Model Name                   | Model ID                 | Features                                      | Recommended Scenarios                   |
| ---------------------------- | ------------------------ | --------------------------------------------- | --------------------------------------- |
| **Gemini 3.1 Pro Preview** ⭐ | `gemini-3.1-pro-preview` | Strongest multimodal reasoning, rich detail   | Complex image/scene analysis            |
| **Gemini 3.5 Flash** 🔥      | `gemini-3.5-flash`       | Fast and low-cost, best value                 | Real-time recognition, batch processing |
| **GPT-5.5** ⭐                | `gpt-5.5`                | Strong all-round vision understanding, stable | General image understanding             |
| **Claude Opus 4.7**          | `claude-opus-4-7`        | Deep understanding, precise descriptions      | Professional image+text analysis        |
| **Claude Sonnet 4.6**        | `claude-sonnet-4-6`      | Rivals Opus, high cost-performance            | Cost-effective recognition              |
| **GPT-4o**                   | `gpt-4o`                 | Classic multimodal, mature and stable         | General scenarios                       |
| **Gemini 2.5 Flash**         | `gemini-2.5-flash`       | Ultra-fast and cheap, GA release              | Large-batch simple recognition          |

<Info>
  **Most chat models now support multimodal image input**: the table above lists common recommendations, not the full set. Mainstream models including the GPT-5, Gemini 3, Claude 4 series, Grok 4, and Kimi all accept image input.

  * ⚠️ However, **capabilities differ between generations from the same vendor** — `deepseek-v4-pro`, `deepseek-v4-flash` and `glm-5.2` are still text-only, and passing an image returns `Model do not support image input`. To check a specific model, use the "Input modalities" row on its detail page; see [Text + image in one API](/en/faq/text-and-image-in-one-api)
  * 📚 Full model list and feature comparison: [Popular Models (Kept Updated)](/en/api-capabilities/model-info)
  * 🔗 Live model list and pricing: [APIYI Console Pricing Page](https://www.apiyi.com/account/pricing) (check the console for vision support)
</Info>

## 🚀 Quick Start

### 1. Basic Example - Image URL

```python theme={null}
import requests

url = "https://api.apiyi.com/v1/chat/completions"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

payload = {
    "model": "gpt-5.5",
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Please describe this image in detail"
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://example.com/image.jpg"
                    }
                }
            ]
        }
    ]
}

response = requests.post(url, headers=headers, json=payload)
result = response.json()
print(result['choices'][0]['message']['content'])
```

### 2. Local Image Example - Base64 Encoding

```python theme={null}
import base64
import requests

def image_to_base64(image_path):
    """Convert local image to base64 encoding"""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Read local image
base64_image = image_to_base64("path/to/your/image.jpg")

url = "https://api.apiyi.com/v1/chat/completions"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

payload = {
    "model": "gemini-3.1-pro-preview",
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Analyze all text content in this image"
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                }
            ]
        }
    ]
}

response = requests.post(url, headers=headers, json=payload)
print(response.json()['choices'][0]['message']['content'])
```

### 3. Advanced Example - Multi-Image Comparison

```python theme={null}
import requests

url = "https://api.apiyi.com/v1/chat/completions"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

payload = {
    "model": "gemini-3.1-pro-preview",
    "messages": [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Please compare the differences between these two images:"},
                {
                    "type": "image_url",
                    "image_url": {"url": "https://example.com/image1.jpg"}
                },
                {
                    "type": "image_url",
                    "image_url": {"url": "https://example.com/image2.jpg"}
                }
            ]
        }
    ],
    "max_tokens": 1000
}

response = requests.post(url, headers=headers, json=payload)
print(response.json()['choices'][0]['message']['content'])
```

### 4. cURL Example (Command Line)

**Image URL method**:

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-3.1-pro-preview",
    "messages": [
      {
        "role": "user",
        "content": [
          { "type": "text", "text": "Please describe this image in detail" },
          { "type": "image_url", "image_url": { "url": "https://example.com/image.jpg" } }
        ]
      }
    ]
  }'
```

**Local image Base64 method** (encode the image to Base64, then embed it in the request body):

```bash theme={null}
# 1. Convert local image to base64 (macOS / Linux)
BASE64_IMAGE=$(base64 -i path/to/your/image.jpg | tr -d '\n')

# 2. Pass the image content via a data URI
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "messages": [
      {
        "role": "user",
        "content": [
          { "type": "text", "text": "Analyze all text content in this image" },
          { "type": "image_url", "image_url": { "url": "data:image/jpeg;base64,'"$BASE64_IMAGE"'" } }
        ]
      }
    ]
  }'
```

<Tip>
  **Prefer Base64 upload for reliability**: with the image URL method, the server has to download the image in real time first — if the image host responds slowly or restricts access, the download fails. Base64 embeds the image data directly in the request body, with no dependency on any external download, so it is more stable. Both methods are officially supported. Base64 is about 1.33x the size of the original image, so consider compressing large images before encoding.
</Tip>

### 5. Common Error: Image URL Download Timeout

When using the image URL method, you may receive an error like this:

```json theme={null}
{
  "error": {
    "message": "Timeout while downloading ip:port",
    "type": "invalid_request_error",
    "code": "invalid_image_url"
  }
}
```

This means **the server timed out while downloading the image from the URL** — it has nothing to do with the model, your API key, or your quota. Common causes:

1. The image host / origin server responds slowly, or is unfriendly to certain network regions
2. The image is too large and the download exceeds the time limit
3. The URL has hotlink protection, requires login, or is not a public direct link

**Solutions**:

* ✅ **Switch to Base64 (data URI) upload** (recommended, see Example 2 above) — the image data is submitted directly in the request body, completely bypassing the download step, which is the most stable option
* Use a faster, publicly accessible direct image link
* Compress the image and retry

### 6. Common Error: invalid base64 data (URL Mistakenly Placed in the Base64 Field)

If you receive a 400 error like the following (Claude-series wording shown here; other model series phrase it slightly differently, but the key signature is `invalid base64 data`):

```json theme={null}
{
  "type": "error",
  "error": {
    "type": "invalid_request_error",
    "message": "...source.base64: invalid base64 data"
  },
  "request_id": "req_011CczN..."
}
```

It usually means **an image URL was pasted into the Base64 data slot of the data URI**:

```json theme={null}
// ❌ Wrong: what follows base64, is an image link, not Base64-encoded data
"image_url": {
  "url": "data:image/jpeg;base64,https://example.com/generations/temp-xxx.jpg"
}
```

Whatever follows the `data:image/...;base64,` prefix must be **the Base64-encoded content of the image file itself**, not an image link. The URL method and the Base64 method are two mutually exclusive ways of passing an image — they cannot be mixed. A common cause: the client code always goes through a data URI concatenation path, so remote image URLs also get concatenated in.

**Correct usage, side by side**:

```json theme={null}
// ✅ Image is a remote URL → pass the link directly, no prefix at all
"image_url": {
  "url": "https://example.com/generations/temp-xxx.jpg"
}

// ✅ Image is a local file / binary → Base64-encode it first, then build the data URI (see Example 2 above)
"image_url": {
  "url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
}
```

<Tip>
  **Self-check**: decide by the image source before sending — if the string starts with `http`, use the URL method; only Base64-encode and build a data URI otherwise. Also, a valid Base64 string never contains characters like `://` or `?` — if you see them after `base64,`, a link was almost certainly concatenated in.
</Tip>

### 7. Common Error: Declared Media Type Doesn't Match the Actual Image Format

If you receive a 400 error like the following (the key signature is `The image was specified using the image/png media type, but the image appears to be a image/jpeg image`):

```json theme={null}
{
  "status_code": 400,
  "error": {
    "message": "InvokeModel: operation error Bedrock Runtime: InvokeModel, https response error StatusCode: 400, RequestID: e87a35ed-..., ValidationException: ...source.base64: The image was specified using the image/png media type, but the image appears to be a image/jpeg image"
  }
}
```

**What it means**: this error comes from the upstream model service's input validation (`Bedrock Runtime: InvokeModel, ValidationException` in the example indicates the request reached a Claude-series upstream channel and was rejected at the parameter-validation stage). The message is remarkably literal:

* Your data URI **declares** the image as PNG (`data:image/png;base64,...`)
* But after decoding the Base64, the upstream inspected the file header (magic bytes) and found the **actual content is JPEG**
* Declaration and content disagree → 400. The Base64 encoding itself is fine — the media type in the prefix is what's wrong

**Common causes**:

1. **MIME type inferred from the file extension, but the extension lies** — the file is named `xxx.png` but is really a JPEG with a renamed extension (download tools, chat apps, and screenshot tools all do this)
2. **`image/png` (or `image/jpeg`) hardcoded in the client code**, with every image getting the same prefix regardless of format
3. The image went through a processing pipeline that changed its format, but the filename stayed the same

**Fix**: never trust the extension — sniff the real MIME type from the file's magic bytes before building the data URI:

```python theme={null}
import base64

def image_to_data_uri(image_path):
    """Detect the real format from magic bytes so the media type always matches the content"""
    with open(image_path, "rb") as f:
        data = f.read()

    if data[:8] == b"\x89PNG\r\n\x1a\n":
        mime = "image/png"
    elif data[:3] == b"\xff\xd8\xff":
        mime = "image/jpeg"
    elif data[:6] in (b"GIF87a", b"GIF89a"):
        mime = "image/gif"
    elif data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        mime = "image/webp"
    else:
        raise ValueError(f"Unrecognized image format: {image_path}")

    return f"data:{mime};base64,{base64.b64encode(data).decode('utf-8')}"
```

Alternatively, re-encode with PIL — this guarantees declaration matches content in one step (and lets you compress and strip odd frames along the way):

```python theme={null}
import base64, io
from PIL import Image

def image_to_data_uri(image_path):
    img = Image.open(image_path)
    buf = io.BytesIO()
    img.convert("RGB").save(buf, format="JPEG", quality=90)
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/jpeg;base64,{b64}"
```

<Tip>
  **Self-check**: `file xxx.png` (macOS / Linux command line) reveals a file's true format in one second; in Python, `Image.open(path).format` does the same. Model series differ in how strictly they validate the media type — some let mismatches through, while the Claude series (especially via the Bedrock channel) is the strictest. Write your code so the declaration always matches the content, and you'll be safe on every model.
</Tip>

<Warning>
  **GPT-5 series parameter differences**: if you switch the examples to a GPT-5 series model such as `gpt-5.5` / `gpt-5.4`, note that:

  1. Use `max_completion_tokens` instead of `max_tokens`
  2. `temperature` only supports `1` (leave it at the default — do not pass other values)
  3. Do not pass the `top_p` parameter

  The Gemini and Claude series have no such restrictions and work normally with `max_tokens`, `temperature`, etc.
</Warning>

## 🎯 Common Use Cases

### 1. Product Recognition and Analysis

```python theme={null}
prompt = """
Please analyze this product image, including:
1. Product type and brand
2. Main features and selling points
3. Suitable target audience
4. Suggested marketing copy
"""
```

### 2. Document OCR Recognition

```python theme={null}
prompt = """
Please extract all text content from the image and organize it in the original format.
If there are tables, please present them in Markdown table format.
"""
```

### 3. Medical Imaging Assistance

```python theme={null}
prompt = """
This is a medical imaging picture, please:
1. Describe basic image information (such as imaging type, body part, etc.)
2. Label visible anatomical structures
3. Note: For reference only, not for diagnostic purposes
"""
```

### 4. Security Surveillance Analysis

```python theme={null}
prompt = """
Analyze the surveillance footage to identify:
1. Number of people and their positions in the scene
2. Any abnormal behavior
3. Environmental safety hazards
4. Timestamp information (if visible)
"""
```

## 💡 Best Practices

### Image Preprocessing Recommendations

1. **Format Support**: Mainstream formats like JPEG, PNG, GIF, WebP
2. **Size Limit**: Recommended single image under 20MB
3. **Resolution**: Higher resolution images achieve better recognition
4. **Compression**: Moderate compression to improve transfer speed

### Prompt Optimization

```python theme={null}
# ❌ Not Recommended: Vague prompt
prompt = "What is this"

# ✅ Recommended: Specific and clear prompt
prompt = """
Please analyze this image from the following aspects:
1. Main Objects: Identify main objects or people in the image
2. Scene Environment: Describe the shooting location and environmental features
3. Color Composition: Analyze color scheme and composition characteristics
4. Emotional Atmosphere: Emotions or atmosphere conveyed by the image
5. Possible Uses: What scenarios this image is suitable for
"""
```

### Error Handling

```python theme={null}
import requests
from requests.exceptions import RequestException

def analyze_image_with_retry(image_url, prompt, max_retries=3):
    """Image analysis function with retry mechanism"""
    for attempt in range(max_retries):
        try:
            response = requests.post(
                "https://api.apiyi.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-5.5",
                    "messages": [{
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image_url", "image_url": {"url": image_url}}
                        ]
                    }]
                },
                timeout=30
            )

            if response.status_code == 200:
                return response.json()
            elif response.status_code == 429:
                print(f"Rate limited, waiting to retry... (attempt {attempt + 1}/{max_retries})")
                time.sleep(2 ** attempt)  # Exponential backoff
            else:
                print(f"Error: {response.status_code} - {response.text}")

        except RequestException as e:
            print(f"Request exception: {e}")

    return None
```

## 🔧 Advanced Features

### 1. Streaming Output

For lengthy analyses, streaming output provides better user experience:

```python theme={null}
payload = {
    "model": "gpt-5.5",
    "messages": [...],
    "stream": True
}

response = requests.post(url, headers=headers, json=payload, stream=True)
for line in response.iter_lines():
    if line:
        print(line.decode('utf-8'))
```

### 2. Multi-turn Conversation

Maintain context for in-depth analysis:

```python theme={null}
messages = [
    {
        "role": "user",
        "content": [
            {"type": "text", "text": "What animal is this?"},
            {"type": "image_url", "image_url": {"url": "animal.jpg"}}
        ]
    },
    {
        "role": "assistant",
        "content": "This is a Golden Retriever."
    },
    {
        "role": "user",
        "content": [{"type": "text", "text": "How old does it look? How is its health condition?"}]
    }
]
```

### 3. Combined with Function Calling

```python theme={null}
tools = [
    {
        "type": "function",
        "function": {
            "name": "save_image_analysis",
            "description": "Save image analysis results to database",
            "parameters": {
                "type": "object",
                "properties": {
                    "objects": {"type": "array", "items": {"type": "string"}},
                    "scene": {"type": "string"},
                    "text_content": {"type": "string"}
                }
            }
        }
    }
]

payload = {
    "model": "gpt-5.5",
    "messages": messages,
    "tools": tools,
    "tool_choice": "auto"
}
```

## 📊 Performance Comparison

| Model                  | Response Speed | Recognition Accuracy | Chinese Support | Price |
| ---------------------- | -------------- | -------------------- | --------------- | ----- |
| Gemini 3.1 Pro Preview | ⭐⭐⭐⭐           | ⭐⭐⭐⭐⭐                | ⭐⭐⭐⭐⭐           | \$\$  |
| Gemini 3.5 Flash       | ⭐⭐⭐⭐⭐          | ⭐⭐⭐⭐⭐                | ⭐⭐⭐⭐            | \$    |
| GPT-5.5                | ⭐⭐⭐⭐           | ⭐⭐⭐⭐⭐                | ⭐⭐⭐⭐⭐           | \$\$  |
| Claude Sonnet 4.6      | ⭐⭐⭐⭐           | ⭐⭐⭐⭐⭐                | ⭐⭐⭐⭐            | \$\$  |
| Gemini 2.5 Flash       | ⭐⭐⭐⭐⭐          | ⭐⭐⭐⭐                 | ⭐⭐⭐⭐            | \$    |

## 🚨 Important Notes

1. **Privacy Protection**: Do not upload images containing sensitive information
2. **Compliant Usage**: Follow relevant laws and regulations, do not use for illegal purposes
3. **Result Verification**: AI analysis results are for reference only, important decisions require manual review
4. **Cost Control**: Choose models reasonably to avoid unnecessary expenses

## 🔗 Related Resources

* [Complete Code Examples](https://github.com/apiyi-api/ai-api-code-samples/tree/main/Vision-API-OpenAI)
* [API Pricing Information](https://api.apiyi.com/account/pricing)

<Note>
  💡 **Pro Tip**: Test first with cost-effective models like Gemini 3.5 Flash or Gemini 2.5 Flash, then switch to advanced models like Gemini 3.1 Pro or GPT-5.5 for production once you've confirmed quality. For more available models, see [Popular Models](/en/api-capabilities/model-info) or the [console model list](https://www.apiyi.com/account/pricing).
</Note>
