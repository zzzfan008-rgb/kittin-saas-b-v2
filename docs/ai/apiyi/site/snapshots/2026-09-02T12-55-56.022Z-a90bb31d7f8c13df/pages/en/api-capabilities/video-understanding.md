> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Video Understanding API

> Use advanced models like Gemini 3.5 Flash and Gemini 3.1 Pro Preview for intelligent video analysis — content recognition, scene description, action analysis, and timestamp referencing

APIYI provides video understanding through Gemini's multimodal models: with a single prompt, the model "watches" the scenes, actions, on-screen text, and audio in a video and can reference key moments by timestamp. This page covers the supported models, the video input methods that actually work, and the limits that trip people up.

<Note>
  **Read this first**: Video can only be passed in via **Base64 inline (entire request ≤ 20 MB)** or a **YouTube link** (Gemini native format). Passing a plain public video URL (e.g. `https://example.com/demo.mp4`) returns `Request contains an invalid argument` —— this is Google refusing direct links, not an APIYI block. See "Video input methods" below.
</Note>

<CardGroup cols={2}>
  <Card title="Visual API Testing" icon="flask-conical" href="https://icover.ai/video-understanding">
    Upload a video and test the understanding endpoint in the iCover visual testing tool.
  </Card>
</CardGroup>

## Supported models

| Model                      | Model ID                 | Highlights                                | Recommended for                            |
| -------------------------- | ------------------------ | ----------------------------------------- | ------------------------------------------ |
| **Gemini 3.5 Flash** 🔥    | `gemini-3.5-flash`       | Fast, best value, strong multimodal       | Default choice for everyday video analysis |
| **Gemini 3.1 Pro Preview** | `gemini-3.1-pro-preview` | Google's strongest reasoning + multimodal | Complex, long-video deep analysis          |
| **Gemini 3.1 Flash Lite**  | `gemini-3.1-flash-lite`  | Ultra-low price and latency               | High-volume, high-concurrency workloads    |

The stable classics `gemini-2.5-pro` (2M context) and `gemini-2.5-flash` are still available. See [Models & Pricing](/api-capabilities/model-info) for full pricing.

## Video input methods

This is where most issues come from. Check the table below to confirm your input method is supported:

| Input method                                 | Supported | Notes                                                                                                                                                     |
| -------------------------------------------- | :-------: | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Base64 inline**                            |     ✅     | Read a local video, base64-encode it, and pass it in. **The entire request body must be ≤ 20 MB.** Works in both the OpenAI-compatible and native formats |
| **YouTube link**                             |     ✅     | **Gemini native format only**, passed via `file_uri`                                                                                                      |
| **Public video URL** (e.g. a `.mp4` address) |     ❌     | **Google does not accept it** and returns `Request contains an invalid argument` — this is not an APIYI block                                             |
| **Files API** (`files.upload`)               |     ❌     | Not supported by third parties; only Google's official endpoint supports it                                                                               |

<Warning>
  **The 20 MB limit**: With Base64, the entire request body (including the encoded video) must stay under 20 MB. For **videos larger than 20 MB**, your only options are: ① use a YouTube link; ② compress / clip the video locally to under 20 MB before base64-encoding.
</Warning>

## Quick start: Base64 inline (OpenAI-compatible format)

The most common approach: read a local video → base64-encode it → pass it in the `image_url` field.

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="YOUR_API_KEY",            # Replace with your APIYI key
    base_url="https://api.apiyi.com/v1"
)

{/* Read the local video and base64-encode it (entire request ≤ 20 MB) */}
with open("demo.mp4", "rb") as f:
    video_b64 = base64.b64encode(f.read()).decode()

response = client.chat.completions.create(
    model="gemini-3.5-flash",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Describe the content of this video in detail"},
            {
                "type": "image_url",
                "image_url": {"url": f"data:video/mp4;base64,{video_b64}"},
                "mime_type": "video/mp4",
            },
        ],
    }],
)

print(response.choices[0].message.content)
```

Equivalent curl (replace `<BASE64_VIDEO>` with the video's base64 string; for large files prefer letting the SDK encode automatically):

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-3.5-flash",
    "messages": [{
      "role": "user",
      "content": [
        {"type": "text", "text": "Summarize this video"},
        {"type": "image_url",
         "image_url": {"url": "data:video/mp4;base64,<BASE64_VIDEO>"},
         "mime_type": "video/mp4"}
      ]
    }]
  }'
```

## YouTube links (Gemini native format)

YouTube links require no download and are not subject to the 20 MB limit, but they can **only be passed via the Gemini native format** (`google-genai` SDK, endpoint `https://api.apiyi.com`).

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(
    api_key="YOUR_API_KEY",
    http_options={"base_url": "https://api.apiyi.com"}
)

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=types.Content(parts=[
        types.Part(file_data=types.FileData(
            file_uri="https://www.youtube.com/watch?v=VIDEO_ID"
        )),
        types.Part(text="Summarize the main content and key points of this video"),
    ]),
)

print(response.text)
```

<Info>
  For more native-format usage (streaming, thinking budget, function calling, etc.), see [Gemini Native Format](/en/api-capabilities/gemini/native).
</Info>

## Advanced tips

### Timestamp referencing

The model samples at 1 frame per second by default and understands the audio track, so you can reference moments directly with `MM:SS` in your prompt — this is a pure prompting technique and works with any input method:

```text theme={null}
Describe what happens between 00:30 and 01:15, and identify the on-screen text that appears at 02:40.
```

### Prompting ideas for common tasks

The same video supports different analyses just by changing the prompt — no code changes needed:

* **Content summary**: summarize the topic, key moments, and conclusion in 3–5 sentences
* **Educational analysis**: extract key concepts, chapter breakdown, and important timestamps
* **Surveillance analysis**: identify abnormal behavior, the people/objects present, and when they occur
* **Marketing review**: analyze how selling points are presented, pacing, and fit with the target audience
* **Action analysis**: break down the steps, posture details, and points to improve

## Technical notes

* **Sampling rate**: by default the model samples at **1 frame per second (FPS)** and also understands the audio track.
* **Token usage**: roughly **300 tokens/second** at default resolution, roughly **100 tokens/second** at low resolution — longer videos cost more tokens, so estimate accordingly.
* **Supported formats**: mp4, mpeg, mov (quicktime), avi, webm, wmv, 3gpp, and other common formats.

## FAQ

<AccordionGroup>
  <Accordion title="Public video link returns Request contains an invalid argument / fails to fetch">
    Google's video understanding **does not accept arbitrary public direct links** (e.g. `https://example.com/video.mp4`) and returns `Request contains an invalid argument`. This is not an APIYI or Nginx block. Use either: ① Base64 inline (≤20 MB); or ② a YouTube link (native format).
  </Accordion>

  <Accordion title="Why the 20 MB limit? It used to work">
    With Base64 inline, the entire request body has always been capped at 20 MB (matching Google's official limit). If what "used to work" was a public direct link, it was never actually a supported method — it just happened not to error in some cases; now it is rejected per spec.
  </Accordion>

  <Accordion title="Can I use files.upload to upload large videos?">
    No. Google's official Files API (`client.files.upload()`) is **not supported by third parties** — only Google's own endpoint supports it. For large videos, use a YouTube link, or compress to under 20 MB and use Base64.
  </Accordion>

  <Accordion title="What about videos larger than 20 MB?">
    Two paths: ① upload to YouTube and pass the link (native format, not subject to the 20 MB limit); ② use a tool like ffmpeg to compress or clip the key segment locally to under 20 MB, then base64-encode.
  </Accordion>
</AccordionGroup>

## Related resources

<CardGroup cols={2}>
  <Card title="Models & Pricing" icon="list" href="/api-capabilities/model-info">
    Browse all Gemini models and the latest pricing
  </Card>

  <Card title="Gemini Native Format" icon="sparkles" href="/en/api-capabilities/gemini/native">
    YouTube links, streaming, thinking budget, and other native usage
  </Card>

  <Card title="Vision Understanding API" icon="image" href="/api-capabilities/vision-understanding">
    Image content recognition and multimodal analysis
  </Card>

  <Card title="API Reference" icon="book" href="/api-manual">
    Full API spec and endpoint details
  </Card>
</CardGroup>
