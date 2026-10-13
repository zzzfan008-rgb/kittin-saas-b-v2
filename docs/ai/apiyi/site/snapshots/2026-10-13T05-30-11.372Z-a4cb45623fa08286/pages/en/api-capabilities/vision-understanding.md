> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Vision Understanding (Image Recognition) API

> Recognize images with Gemini, GPT, Claude, Seed (Doubao), Qwen, Kimi and more — OCR, counting, scene description and multi-image comparison. Includes a tested list of 24 models, tokens per image, which models each of the four request formats (OpenAI-compatible / Responses / Anthropic / Gemini native) supports, and common errors such as oversized images and image URLs.

Most mainstream chat models on APIYI can "see" images: extract text (OCR), count objects, describe scenes and compare several images. This page gives the support list from our tests on 2026-10-11 (UTC+8), how many tokens one image costs, which models each of the four request formats can reach, and the most common errors.

<Note>
  **Read these three first**:

  1. **The universal format is the OpenAI-compatible `image_url`**: `{"type": "image_url", "image_url": {"url": "data:image/png;base64,..."}}` worked on all 22 vision models we tested. The Responses and Anthropic formats **only reach some models** — see "Which models each format supports".
  2. **Text-only models such as `deepseek-v4-pro` and `glm-5.3` do not accept images**: the request still returns 200, but the image is dropped and the model just says it cannot see one. To check whether the image reached the model, look at `usage.prompt_tokens` in the response.
  3. **Prefer Base64**: with a public URL the provider has to download the image, which fails if the host is slow, uses hotlink protection, or omits the `Content-Length` header (Qwen returns 400 in that case).
</Note>

<CardGroup cols={2}>
  <Card title="Image Recognition · APIYI Online Tool" icon="scan-eye" href="https://imagen.apiyi.com/#understand">
    Don't want to write code? Upload images in the browser (multi-image analysis supported), use built-in templates for general recognition, product titles, five-point descriptions, attribute analysis and OCR, and switch models to compare results — just paste your APIYI key.
  </Card>

  <Card title="Video Understanding API" icon="video" href="/en/api-capabilities/video-understanding">
    Need to analyze video? See the video support list and formats.
  </Card>
</CardGroup>

## Let an AI Agent Do the Integration

<Note>
  If you build with Codex / Claude Code / Cursor, copy the prompt below and hand it to your agent. It first fetches the plain-text version of this page (append `.md` to any docs URL), then writes code in your project's own stack — the universal `image_url` format, **downscaling large images first**, and **checking `prompt_tokens` to confirm the image actually reached the model** are already baked into the requirements.
</Note>

<Prompt description="Have a coding agent integrate or troubleshoot vision understanding (image recognition / OCR). Copy and paste into Codex, Claude Code, Cursor and similar tools." icon="bot" actions={["copy"]}>
  Integrate / troubleshoot vision understanding in this project: send images to a multimodal model for OCR, counting, scene description or multi-image comparison.

  Read the docs before you touch code: fetch [https://docs.apiyi.com/en/api-capabilities/vision-understanding.md](https://docs.apiyi.com/en/api-capabilities/vision-understanding.md) for the plain-text version of this page.

  Requirements:

  1. Endpoint and format: by default use the OpenAI-compatible `POST https://api.apiyi.com/v1/chat/completions` and pass each image as `{"type": "image_url", "image_url": {"url": ...}}` inside `messages[].content`, next to the text block; for several images add several `image_url` blocks — their order is image 1, image 2. Every vision model accepts this format. Only switch formats if the project already uses the Responses or Anthropic SDK, and check this page's "Which models each format supports" first — **the Responses endpoint cannot reach Gemini / Claude / Seed, the Anthropic endpoint cannot reach Seed / DeepSeek, and Grok silently drops images on the Anthropic endpoint**.

  2. Model choice: default to `gemini-3.8-flash` (passed every test, low price); for the most reliable OCR and understanding use `claude-sonnet-5-5` or `gpt-6-sol`; for bulk, low-cost jobs use `claude-haiku-5-5`, `qwen3.8-flash` or `gemini-3.5-flash-lite`. Text-only models such as `deepseek-v4-pro` and `glm-5.3` do not accept images — do not pick them. `gpt-6-luna` drops characters in OCR and `gemini-3.1-flash-lite` miscounts objects, so avoid them when accuracy matters. Make the model name configurable.

  3. How to send images: **prefer a Base64 data URI** (`data:image/png;base64,...`), and determine the format in the prefix from the file's real content (its header bytes), not its extension. Public URLs also work, but the provider downloads them: the host must be publicly reachable and fast, and **the response must include a `Content-Length` header** (Qwen models return `Missing Content-Length of multimodal url` otherwise). URL and Base64 are mutually exclusive — never put a link after `data:...;base64,`.

  4. **Downscale large images before sending**: resize the long side to about 2048 px and convert to JPEG (quality 85–90). Skipping this has real costs: GPT bills by image tiles, and one 9000×6000 image was billed 63,658 input tokens in testing; Claude rejects any image over 10 MB after Base64 encoding (with status 429 — do not treat it as rate limiting and retry); Seed caps total pixels at 36 million; Kimi returns 400 when one image exceeds 16,384 tokens.

  5. **Confirm the image actually reached the model**: read `usage.prompt_tokens` on every response. A 1200×760 image costs roughly 900–1,300 tokens on most providers; **if it is only a few dozen tokens, the image was dropped** — raise an error instead of using the answer, because a model that received no image occasionally invents plausible content.

  6. Parameters: on the chat endpoint `max_tokens` and `temperature` work normally on GPT / Claude / Gemini. `detail: "low"` is honored only by `gpt-5.4-mini` and Seed (tokens drop to half or less, but small text gets misread); other models ignore it. For structured results, ask for JSON in the prompt and parse it defensively.

  7. Timeouts and cost: a single image took 2 to 12 seconds in testing and large images take longer (30 to 70 seconds for a 10 MB image), so set the client timeout to at least 120 seconds. Billing is per token; the input cost of one image ranges from about \$0.0001 (Claude Haiku 5.5 / Qwen3.8 Flash) to about \$0.005 (Claude Opus 5.5).

  8. Read the key from the `APIYI_API_KEY` environment variable — never hard-code it or commit it to git.

  9. When you are done, run it for real once: send one image that contains text and show me the model's answer, `usage.prompt_tokens` and the cost of that call.
</Prompt>

<Accordion title="What this prompt protects you from">
  | Requirement | Trap it avoids |
  | - | - |
  | Default to chat `image_url` | The Responses and Anthropic endpoints only reach some models — switch models and you get 400 or a silently dropped image |
  | Prefer Base64, detect the format from header bytes | URLs depend on the provider downloading them, and Qwen also requires a `Content-Length` header |
  | Downscale large images | GPT bills 60,000+ tokens for one large image; Claude, Seed and Kimi reject it outright |
  | Claude's size error is a 429 | Do not retry it as rate limiting — downscaling is the fix |
  | Read `usage.prompt_tokens` | Text-only models drop images and still return 200; the token count is the one signal you can detect in code |
  | Skip text-only models | `deepseek-v4-pro` and `glm-5.3` only reply that they cannot see an image |
</Accordion>

## Supported models

These results come from tests run on 2026-10-11 (UTC+8): every model had to transcribe the same 1200×760 mixed Chinese/English order image (including a table) word for word, count shapes, spot the difference between two images and read public image URLs. A blank image was used as a control to rule out answers produced without looking.

| Provider | Model ID | Measured latency | Input tokens per image | Test results | Recommended for |
| - | - | :-: | :-: | - | - |
| Google | `gemini-3.8-flash` 🔥 | 5–8 s | \~1,090 | Passed everything, low price; supports Gemini's native format | Default choice, everyday image recognition |
| Google | `gemini-3.1-pro-preview` | 9–12 s | \~1,090 | Passed everything | Complex charts, recognition that needs reasoning |
| Google | `gemini-3.5-flash-lite` | 2–5 s | \~1,090 | Passed everything, among the fastest | High-volume, low-latency jobs |
| OpenAI | `gpt-6-sol` 🔥 | 5–6 s | \~1,100 | Passed everything | General recognition, Responses projects |
| OpenAI | `gpt-5.6-terra` | 5 s | \~1,100 | Passed everything | General recognition |
| OpenAI | `gpt-6-luna` | \~4 s | \~1,100 | ⚠️ Cheap, but drops characters in OCR (misread the order number and phone in all 5 runs) | Rough descriptions, not OCR |
| Anthropic | `claude-sonnet-5-5` 🔥 | 3–4 s | \~1,210 | Passed everything | Demanding OCR and understanding |
| Anthropic | `claude-opus-5-5` | 5–9 s | \~1,210 | Passed everything | Professional image-and-text analysis |
| Anthropic | `claude-haiku-5-5` | 3–8 s | \~1,210 | Passed everything, very low unit price | Bulk recognition and tagging |
| xAI | `grok-4.7` | 4–6 s | \~950 | Passed everything | General recognition |
| ByteDance | `seed-2-0-pro-260328` | 9–11 s | \~1,260 | Passed everything; honors `detail: low` (\~600 tokens) | Top pick among Chinese models |
| ByteDance | `seed-2-0-mini-260428` | 5–10 s | \~1,260 | Passed everything | Low-cost bulk jobs |
| ByteDance | `dola-seed-2-1-turbo-260628` | \~10 s | \~1,260 | Passed everything; thinking on by default | Recognition that needs reasoning |
| Alibaba | `qwen3.8-max` | 7–9 s | \~880 | Passed everything (URLs need `Content-Length`) | Complex recognition |
| Alibaba | `qwen3.8-flash` | 4–11 s | \~910 | Passed everything (same caveat), very low unit price | Bulk, cost-sensitive jobs |
| Alibaba | `qwen3-vl-plus` | 6–9 s | \~910 | Passed everything (same caveat) | Dedicated vision model |
| Moonshot | `kimi-k3` | 6–8 s | \~1,220 | Passed everything | Deep analysis |
| MiniMax | `MiniMax-M3` | 4–7 s | \~1,200 | Passed everything; its `<think>` reasoning is mixed into the content and must be stripped | General recognition |
| DeepSeek | `deepseek-v4-flash-vision-exp` | 3–5 s | \~570 | Passed everything, fewest image tokens | Low-cost recognition |

`gemini-3.1-flash-lite` and `gpt-5.4-mini` can also read images and got the OCR fully right, but **they miscount objects** (correct in 0 of 3 and 1 of 3 runs respectively), so avoid them for counting tasks. `qwen-vl-ocr` is a dedicated OCR model that **outputs only tables and skips all text outside them**, and in multi-image requests it only reads the first image — use it only for pure table / ID-document scenarios.

<Note>Model prices are aligned with the official sites and may change with them; the table above is for reference only — the **Model Pricing** tab in the top navigation is authoritative: [Model Pricing](/en/models/index).</Note>

### Models that do not accept images

| Model | Behavior when an image is sent |
| - | - |
| `deepseek-v4-pro` | Returns 200 but drops the image (`prompt_tokens` grows by only 5); the model replies that it cannot see one |
| Zhipu `glm-5.3` | The chat endpoint returns 200 but drops the image; the Responses endpoint explicitly returns `only supports text modality` |

For other models, check the "Input modalities" row on the model detail page; see [Text + image in one API](/en/faq/text-and-image-in-one-api).

## Which models each format supports

| Format | Works on (tested) | Does not work |
| - | - | - |
| **OpenAI-compatible chat** (`/v1/chat/completions` + `image_url`) | Every model in the table above | — |
| **OpenAI Responses** (`/v1/responses` + `input_image`) | GPT, Grok, Qwen3.8, Kimi, MiniMax, DeepSeek Vision | Gemini, Claude, Seed and Qwen3-VL return 400 |
| **Anthropic Messages** (`/v1/messages` + `image`, base64) | Claude, Gemini, GPT, Qwen, Kimi, MiniMax | Seed returns 401, DeepSeek returns 400; **Grok silently drops the image** |
| **Anthropic Messages** (`image`, url source) | Claude only | **Gemini silently drops the image**; GPT and Qwen return 400 |
| **Gemini native** (`generateContent` + `inline_data`) | Gemini (tested 3.8 Flash and 3.1 Pro) | — |

<Tip>
  **Use the OpenAI-compatible chat format for new projects** — switching models is just a model-name change. Responses suits projects already on the OpenAI Responses SDK; the Anthropic format suits the Claude ecosystem (Claude Code, the Anthropic SDK); Gemini native suits projects already on the `google-genai` SDK.
</Tip>

## Quick start: the universal format (`image_url`)

### Local image (Base64, recommended)

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="YOUR_API_KEY",            # Replace with your APIYI key
    base_url="https://api.apiyi.com/v1"
)

with open("demo.png", "rb") as f:
    image_b64 = base64.b64encode(f.read()).decode()

response = client.chat.completions.create(
    model="gemini-3.8-flash",          # or claude-sonnet-5-5 / gpt-6-sol / qwen3.8-flash, etc.
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Transcribe all text in the image word for word, and output tables as Markdown tables"},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image_b64}"}},
        ],
    }],
)

print(response.choices[0].message.content)
print(response.usage.prompt_tokens)    # ~900-1,300 for a 1200x760 image; a few dozen means the image never arrived
```

### Public image URL

```python theme={null}
response = client.chat.completions.create(
    model="gemini-3.8-flash",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Describe this image in detail"},
            {"type": "image_url", "image_url": {"url": "https://your-bucket.example.com/demo.png"}},
        ],
    }],
)
```

### Comparing several images

Add one `image_url` block per image, in order, and refer to them as "image 1" and "image 2" in the prompt:

```python theme={null}
response = client.chat.completions.create(
    model="claude-sonnet-5-5",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Below are image 1 and image 2. What is different between them?"},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image1_b64}"}},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image2_b64}"}},
        ],
    }],
)
```

### curl

```bash theme={null}
# 1. Build the request body: the Base64 string is long, so write it to a file instead of a command-line argument (macOS / Linux)
printf '{"model":"gemini-3.8-flash","messages":[{"role":"user","content":[{"type":"text","text":"Describe this image"},{"type":"image_url","image_url":{"url":"data:image/png;base64,%s"}}]}]}' \
  "$(base64 < demo.png | tr -d '\n')" > req.json

# 2. Send it
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  -d @req.json
```

<Tip>
  **Why Base64 is recommended**: with an image URL the provider downloads the image in real time, which fails if the host is slow, uses hotlink protection or restricts access; Qwen models also require the host to send a `Content-Length` header (some CDNs use chunked transfer without it, which in our tests returned `Missing Content-Length of multimodal url`). Base64 puts the image straight into the request body with no external download. Base64 is about 1.33× the original size, so downscale large images before encoding — see "Downscale large images first".
</Tip>

## Other formats

### OpenAI Responses (`input_image`)

For projects already on the OpenAI Responses SDK. **It only reaches GPT, Grok, Qwen3.8, Kimi, MiniMax and DeepSeek Vision** — Gemini / Claude / Seed return 400.

```python theme={null}
response = client.responses.create(
    model="gpt-6-sol",
    input=[{
        "role": "user",
        "content": [
            {"type": "input_text", "text": "Transcribe all text in the image word for word"},
            {"type": "input_image", "image_url": f"data:image/png;base64,{image_b64}"},
        ],
    }],
)

print(response.output_text)
```

### Anthropic Messages (`image`)

For the Claude ecosystem (the Anthropic SDK, Claude Code and so on), endpoint `https://api.apiyi.com`. The base64 source reaches Claude, Gemini, GPT, Qwen, Kimi and MiniMax; **the url source only works on Claude** (Gemini silently drops the image).

```python theme={null}
import anthropic, base64

client = anthropic.Anthropic(
    api_key="YOUR_API_KEY",            # Replace with your APIYI key
    base_url="https://api.apiyi.com"
)

with open("demo.png", "rb") as f:
    image_b64 = base64.b64encode(f.read()).decode()

message = client.messages.create(
    model="claude-sonnet-5-5",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": [
            {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": image_b64}},
            {"type": "text", "text": "Transcribe all text in the image word for word"},
        ],
    }],
)

print(message.content[0].text)
# Claude can also take a public URL: {"type": "image", "source": {"type": "url", "url": "https://..."}}
```

### Gemini native format (`inline_data`)

If your project already uses Google's official `google-genai` SDK, just point `base_url` at `https://api.apiyi.com`:

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(
    api_key="YOUR_API_KEY",            # Replace with your APIYI key
    http_options={"base_url": "https://api.apiyi.com"}
)

with open("demo.png", "rb") as f:
    image_bytes = f.read()

response = client.models.generate_content(
    model="gemini-3.8-flash",
    contents=types.Content(parts=[
        types.Part.from_bytes(data=image_bytes, mime_type="image/png"),
        types.Part(text="Transcribe all text in the image word for word"),
    ]),
)

print(response.text)
print(response.usage_metadata.prompt_tokens_details)  # includes an IMAGE entry when the image reached the model
```

REST form: `POST https://api.apiyi.com/v1beta/models/gemini-3.8-flash:generateContent` with the header `x-goog-api-key: YOUR_API_KEY`, and the image inside `contents[].parts[]` as `{"inline_data": {"mime_type": "image/png", "data": "<BASE64>"}}`. For more native usage see [Gemini native format](/en/api-capabilities/gemini/native).

## Downscale large images first

Providers handle large images very differently. Results for one 9000×6000 JPEG of about 10 MB:

| Model | Result |
| - | - |
| `gemini-3.8-flash` | Recognized normally, downscaled automatically, \~1,100 tokens |
| `grok-4.7` / `qwen3.8-flash` / `MiniMax-M3` | Recognized normally, \~2,600–3,700 tokens, 24–67 s |
| `gpt-6-sol` | Recognized normally, but **one image was billed 63,658 input tokens** (about \$0.13) |
| `claude-sonnet-5-5` | Rejected: `image exceeds 10 MB maximum` (**status 429**, not rate limiting) |
| `kimi-k3` | Rejected: one image exceeds 16,384 tokens |
| `seed-2-0-pro-260328` | Rejected: total pixels exceed 36 million |

<Warning>
  **Resize the long side to about 2048 px before uploading**: after downscaling the same image to 2048×1365, all 8 models in the table passed with fully correct OCR at roughly 700–3,700 tokens per image, and `gpt-6-sol` dropped from 63,658 to 3,320. If Claude returns 429, read the error body first — `image exceeds` means the image is too large, and retrying will not help.
</Warning>

```python theme={null}
import base64, io
from PIL import Image

def image_to_data_uri(path, max_side=2048):
    """Resize the long side to max_side and convert to JPEG, so the declared type always matches the content"""
    img = Image.open(path)
    img.thumbnail((max_side, max_side))
    buf = io.BytesIO()
    img.convert("RGB").save(buf, format="JPEG", quality=90)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()
```

## Common errors

### Image URL download timeout

If you get this error when passing an image URL:

```json theme={null}
{
  "error": {
    "message": "Timeout while downloading ip:port",
    "type": "invalid_request_error",
    "code": "invalid_image_url"
  }
}
```

it means **the provider timed out while downloading that image URL** — it has nothing to do with the model, key or balance. Typical causes: a slow host or one that is unfriendly to some regions, an oversized image, or a URL behind hotlink protection or a login.

**Fix**: switch to Base64 (recommended — it removes the download step entirely); or use a faster, publicly reachable URL; or compress the image and retry.

### Missing Content-Length of multimodal url (Qwen)

Qwen models require the image host to send a `Content-Length` response header. Some CDNs (Cloudflare, for example) serve images with chunked transfer and no such header, which triggers this error; serve the same image from object storage or send it as Base64 instead.

### invalid base64 data (a URL placed in the Base64 field)

If you get a 400 error like this (the key phrase is `invalid base64 data`; wording varies slightly by model):

```json theme={null}
{
  "type": "error",
  "error": {
    "type": "invalid_request_error",
    "message": "...source.base64: invalid base64 data"
  }
}
```

it usually means **an image URL was pasted into the Base64 data part of a data URI**:

```json theme={null}
// ❌ Wrong: what follows base64, is a link, not Base64-encoded data
"image_url": {
  "url": "data:image/jpeg;base64,https://example.com/generations/temp-xxx.jpg"
}
```

Whatever follows the `data:image/...;base64,` prefix must be **the Base64 encoding of the image file itself**. The URL form and the Base64 form are mutually exclusive and cannot be mixed:

```json theme={null}
// ✅ The image is a web URL → pass the link directly, with no prefix
"image_url": {
  "url": "https://example.com/generations/temp-xxx.jpg"
}

// ✅ The image is a local file / binary → Base64-encode it, then build the data URI
"image_url": {
  "url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
}
```

<Tip>
  **Self-check**: before sending, look at the image source — if the string starts with `http`, use the URL form; otherwise Base64-encode it and build a data URI. Valid Base64 never contains characters such as `://` or `?`, so seeing them after `base64,` almost certainly means a link was pasted in.
</Tip>

### Declared image type does not match the actual format (media type mismatch)

If you get a 400 error like this (the key phrase is `The image was specified using the image/png media type, but the image appears to be a image/jpeg image`):

```json theme={null}
{
  "status_code": 400,
  "error": {
    "message": "InvokeModel: operation error Bedrock Runtime: InvokeModel, https response error StatusCode: 400, ... ValidationException: ...source.base64: The image was specified using the image/png media type, but the image appears to be a image/jpeg image"
  }
}
```

it means the data URI **declares** the image as PNG (`data:image/png;base64,...`), but the provider decoded it, checked the file header and found **the actual content is JPEG**, so it rejected the request. Common causes: inferring the format from a file extension that was changed, or hard-coding `image/png` in code.

<Info>
  Whether this is checked depends on the upstream channel the model uses: in our 2026-10-11 (UTC+8) tests, sending a JPEG declared as PNG worked on all 22 vision models, but Claude models served through the Bedrock channel return the error above. Write code on the rule "the declared type must match the content" and you are safe on every channel.
</Info>

**Fix**: detect the real format from the file header before building the data URI, or convert everything to JPEG with PIL as in the function under "Downscale large images first":

```python theme={null}
import base64

def image_to_data_uri(image_path):
    """Detect the real format from the file header so the media type always matches the content"""
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

<Tip>
  `file xxx.png` (macOS / Linux command line) shows a file's real format in a second; in Python, `Image.open(path).format` gives you the same.
</Tip>

## Advanced tips

### Confirm the image actually reached the model

Check `usage.prompt_tokens` in the response: a 1200×760 image costs roughly 900–1,300 tokens on most providers (about 570 on DeepSeek Vision); **if the count barely grows over a text-only request, or does not grow at all, the image was dropped**. This happens on text-only models (`deepseek-v4-pro`, `glm-5.3`), on Grok via the Anthropic endpoint, and on Gemini via the Anthropic url source.

<Warning>
  **A model that received no image may invent an answer.** In our tests we asked for "transcribe all text in the image" without attaching any image: `gemini-3.8-flash` invented an entire table that did not exist in 1 of 6 runs, while every other model said it could not see an image. So in batch pipelines, do not rely on the answer alone — confirm delivery with `prompt_tokens` first.
</Warning>

### The `detail` parameter

`detail: "low"` inside `image_url` is honored only by some models: `gpt-5.4-mini` (1,147 → 233 tokens, but small text starts being misread) and Seed (1,340 → 602 tokens, OCR still fully correct); GPT-6 / 5.6, Gemini, Claude and Qwen ignore it. A more portable way to save tokens is to downscale the image yourself.

### Parameters

On the chat endpoint, `max_tokens` and `temperature` work normally on GPT (including GPT-6), Claude and Gemini (`temperature=0.3` passed on all of them in our tests). MiniMax-M3 puts its `<think>...</think>` reasoning in the content, so strip it yourself.

### Prompt ideas for common tasks

The same image can drive very different tasks just by changing the prompt — no code changes required:

* **OCR**: "Transcribe all text in the image word for word, and output tables as Markdown tables"
* **Counting / structured output**: "Count how many of each object there are and output only JSON: `{"object": count}`"
* **Product analysis**: "Identify the product type and brand, and list its main selling points and target audience"
* **Multi-image comparison**: "Below are image 1 and image 2 — list every difference"
* **Chart reading**: "Read the axes, the data trend and the maximum and minimum values"

<Warning>
  Results on medical images, ID documents or anything safety-related are for reference only — have important decisions reviewed by a person, and do not upload images containing sensitive personal information.
</Warning>

## FAQ

<AccordionGroup>
  <Accordion title="Which models can read images?">
    All 22 vision models tested on this page: Gemini, GPT, Claude, Grok, Seed, Qwen, Kimi, MiniMax and DeepSeek Vision. Text-only models such as `deepseek-v4-pro` and `glm-5.3` cannot. For other models, check the "Input modalities" row on the model detail page.
  </Accordion>

  <Accordion title="I sent an image but the model says it cannot see one?">
    Check `usage.prompt_tokens` in the response first: a few dozen tokens means the image never reached the model. Common causes: ① you picked a text-only model; ② you called Grok through the Anthropic endpoint, or Gemini through the Anthropic url source (both silently drop the image); ③ the provider could not download the public URL. Switching to chat `image_url` with Base64 solves almost all of these.
  </Accordion>

  <Accordion title="The same code returns 400 as soon as I switch models?">
    Most likely you are using the Responses or Anthropic format, which only support some models (see "Which models each format supports"). Switch to the OpenAI-compatible chat `image_url` format and it works across providers.
  </Accordion>

  <Accordion title="Claude returned 429 — am I being rate limited?">
    Read the error body first. If it says `image exceeds 10 MB maximum`, the image is too large (measured after Base64 encoding); retrying will not help — resize the long side to about 2048 px and send it again.
  </Accordion>

  <Accordion title="Why did one image cost tens of thousands of tokens?">
    GPT models bill by image tiles, so larger originals cost more tokens: one 9000×6000 image was billed 63,658 input tokens on `gpt-6-sol` in our tests. After resizing the long side to about 2048 px, the same image dropped to 3,320 tokens on `gpt-6-sol` and roughly 700–3,700 tokens across providers.
  </Accordion>

  <Accordion title="Which image formats are supported?">
    Mainstream formats such as JPEG, PNG, GIF and WebP all work; MPO files from phone cameras (still named .jpg) were also recognized in our tests. The safest approach is to convert everything to JPEG with PIL before sending.
  </Accordion>
</AccordionGroup>

## Related resources

<CardGroup cols={2}>
  <Card title="Model Pricing" icon="list" href="/en/models/index">
    All models and the latest pricing
  </Card>

  <Card title="Video Understanding API" icon="video" href="/en/api-capabilities/video-understanding">
    Video content recognition, scene description and timestamps
  </Card>

  <Card title="Gemini Native Format" icon="sparkles" href="/en/api-capabilities/gemini/native">
    Streaming, reasoning budgets and more in the native format
  </Card>

  <Card title="Text + Image in One API" icon="circle-help" href="/en/faq/text-and-image-in-one-api">
    How to tell which input modalities a model supports
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.