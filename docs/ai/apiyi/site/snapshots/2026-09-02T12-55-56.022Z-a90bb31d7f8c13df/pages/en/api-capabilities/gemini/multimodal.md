> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini Multimodal Input & Code Execution

> Pass images, audio, and video inline to Gemini: the 20MB limit, media_resolution cost control, and sandboxed Python via code_execution.

The Gemini native format accepts images, audio, and video directly for understanding and analysis, and ships a built-in `code_execution` tool that runs Python in a sandbox. Examples below assume the client setup from [Native Calls](/en/api-capabilities/gemini/native).

<Warning>
  **Two hard limits on the APIYI channel**:

  1. **The Files API is not supported** (`client.files.upload()` works only on Google's official endpoint) — media must be passed **inline**
  2. Inline media is capped at **20MB per file**; compress or extract frames first if larger
</Warning>

## Image Understanding

Pass a PIL Image directly — the SDK handles encoding:

```python theme={null}
from google import genai
from PIL import Image

client = genai.Client(
    api_key="YOUR_API_KEY",
    http_options={"base_url": "https://api.apiyi.com"}
)

img = Image.open("photo.jpg")

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=[
        "Describe this image in detail: key elements, colors, composition.",
        img
    ]
)
print(response.text)
```

Or pass bytes explicitly with `types.Part.from_bytes`:

```python theme={null}
from google.genai import types

with open("photo.jpg", "rb") as f:
    image_bytes = f.read()

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=[
        types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
        "What's in this image?"
    ]
)
```

## Audio Understanding

```python theme={null}
from google.genai import types

with open("meeting.mp3", "rb") as f:
    audio_bytes = f.read()

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=[
        types.Part.from_bytes(data=audio_bytes, mime_type="audio/mp3"),
        "Transcribe this audio and summarize the main topics."
    ]
)
print(response.text)
```

## Video Understanding

```python theme={null}
from google.genai import types

with open("demo.mp4", "rb") as f:
    video_bytes = f.read()

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=[
        types.Part.from_bytes(data=video_bytes, mime_type="video/mp4"),
        "Summarize the main content and key information of this video."
    ]
)
print(response.text)
```

Video is tokenized per frame plus the audio track — longer videos get expensive. More video workflows: [Video Understanding](/en/api-capabilities/video-understanding).

## Cost Control with media\_resolution

Token consumption for media scales with resolution. For "rough look" tasks (classification, presence checks), lower resolution saves real money:

```python theme={null}
from google.genai import types

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=["What's the theme of this image?", img],
    config=types.GenerateContentConfig(
        media_resolution="MEDIA_RESOLUTION_LOW"  # LOW / MEDIUM / HIGH
    )
)
```

| Level    | Use for                                                  |
| -------- | -------------------------------------------------------- |
| `LOW`    | Classification, coarse recognition — cheapest            |
| `MEDIUM` | General description and understanding (balanced default) |
| `HIGH`   | OCR, small text, detail-dense tasks                      |

## Supported Formats

| Type   | Formats        | How to pass                    |
| ------ | -------------- | ------------------------------ |
| Images | JPG, PNG, WebP | PIL Image or `Part.from_bytes` |
| Audio  | MP3, WAV       | `Part.from_bytes`              |
| Video  | MP4, MOV       | `Part.from_bytes`              |

All inline, max 20MB per file.

## Code Execution

Declare the `code_execution` tool and the model writes Python, runs it in a sandbox, and answers based on the result — ideal for calculations and data analysis:

```python theme={null}
response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents="""
Sales data: Product A 100 units × \$50, Product B 200 × \$30, Product C 150 × \$40.
Compute total revenue, average unit price, and each product's revenue share.
""",
    config={"tools": [{"code_execution": {}}]}
)

for part in response.candidates[0].content.parts:
    if getattr(part, "executable_code", None):
        print(f"[Code executed]\n{part.executable_code.code}")
    if getattr(part, "code_execution_result", None):
        print(f"[Result]\n{part.code_execution_result.output}")
    if getattr(part, "text", None):
        print(f"[Explanation]\n{part.text}")
```

<Info>
  Code execution limits: Python only; the sandbox has no network or filesystem access; execution time is capped. To call your own external services, use [Function Calling](/en/api-capabilities/gemini/function-calling).
</Info>

## Related Links

* This group: [Native Calls](/en/api-capabilities/gemini/native) · [Cache Billing](/en/api-capabilities/gemini/prompt-caching) · [Function Calling](/en/api-capabilities/gemini/function-calling)
* Use cases: [Video Understanding](/en/api-capabilities/video-understanding) · [Vision Understanding](/en/api-capabilities/vision-understanding)
* Official Google docs: `ai.google.dev/gemini-api/docs/vision`
