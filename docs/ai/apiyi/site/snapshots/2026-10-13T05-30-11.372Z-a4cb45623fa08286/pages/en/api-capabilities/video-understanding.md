> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Video Understanding API

> Analyze video with Gemini, Seed (Doubao), Qwen, Kimi and more — content recognition, scene description, action analysis and timestamp referencing. Includes a tested support list for 19 models, the universal video_url format, per-provider input limits, and the models that do not accept video.

Several model families on APIYI can "watch" a video: with a single prompt, the model recognizes scenes, actions and on-screen text, and can reference key moments by timestamp. Besides Gemini, the **entire Seed (Doubao) family, Qwen's vision and omni models, and Kimi K3** all passed our tests. This page covers the support list, the universal request format, and the limits that trip people up.

<Note>
  **Read these three first**:

  1. **The universal format is `video_url`**: `{"type": "video_url", "video_url": {"url": "data:video/mp4;base64,..."}}` works on Seed, Qwen, Kimi, MiniMax and Gemini. The older `image_url` + `data:video/mp4` form shown on earlier versions of this page **only works on Gemini** — every other model returns 400.
  2. **GPT, Grok, Claude, GLM and DeepSeek do not accept video input.** GPT and GLM **silently drop the video** and still return 200, and GPT may even invent a plausible answer — see "Models that do not support video".
  3. **Gemini does not accept plain public video URLs**: it may return `Request contains an invalid argument`, or it may return 200 with the video silently dropped (`prompt_tokens` is only a few dozen) and answer that it cannot see the video — or even describe it as a black screen; Seed, Qwen and Kimi can take a public https URL directly.
</Note>

<CardGroup cols={2}>
  <Card title="Visual API Testing" icon="flask-conical" href="https://icover.ai/video-understanding">
    Upload a video and test the understanding endpoint in the iCover visual testing tool.
  </Card>
</CardGroup>

## Let an AI Agent Do the Integration

<Note>
  If you build with Codex / Claude Code / Cursor, copy the prompt below and hand it to your agent. It first fetches the plain-text version of this page (append `.md` to any docs URL), then writes code in your project's own stack — the universal `video_url` format, **Gemini's no-public-URL rule and 20 MB cap**, and **checking `prompt_tokens` to confirm the video actually reached the model** are already baked into the requirements.
</Note>

<Prompt description="Have a coding agent integrate or troubleshoot video understanding (Gemini / Seed / Qwen / Kimi). Copy and paste into Codex, Claude Code, Cursor and similar tools." icon="bot" actions={["copy"]}>
  Integrate / troubleshoot video understanding in this project: send a video to a multimodal model for summaries, scene descriptions, action analysis or timestamp referencing.

  Read the docs before you touch code: fetch [https://docs.apiyi.com/en/api-capabilities/video-understanding.md](https://docs.apiyi.com/en/api-capabilities/video-understanding.md) for the plain-text version of this page. For YouTube links also read the gemini/native page, with the same `.md` suffix.

  Requirements:

  1. Endpoint and format: use the OpenAI-compatible `POST https://api.apiyi.com/v1/chat/completions` and always pass the video as `{"type": "video_url", "video_url": {"url": ...}}` inside `messages[].content`, next to the text block. **Do not use the old `image_url` + `data:video/mp4` form** (only Gemini accepts it; every other model returns 400), **and do not use `input_video` on the Responses endpoint**. This is a synchronous call — no polling.

  2. Model choice: default to `gemini-3.8-flash` (fewest video tokens, supports YouTube links); use `seed-2-0-pro-260328` when you need precise timestamps or the video already sits at a public URL; for bulk, low-cost jobs consider `qwen3.8-flash` or `seed-2-0-mini-260428`. **GPT, Grok, Claude, GLM and DeepSeek do not support video** — GPT and GLM silently drop the video and still return 200, and GPT invents answers, so do not pick them; if you must, extract frames locally and send them as multiple images. `MiniMax-M3` gets timestamps wrong, so avoid it when timestamps matter. Make the model name configurable.

  3. How to send the video: **Gemini only accepts a Base64 data URI** (`data:video/mp4;base64,...`), **the whole request body must stay under 20 MB** (Base64 inflates by about a third, so budget roughly 14 MB of raw file), **it does not accept public URLs** (the video is dropped, and the model may say it cannot see it or describe a black screen), **and `files.upload` is not supported**; YouTube links only work through Gemini's native format (`google-genai` SDK, base\_url `https://api.apiyi.com`); if the project already uses that SDK, Base64 video can also go through the native format with `Part.from_bytes` — no need to switch to the OpenAI-compatible format. Seed / Qwen / Kimi can take a public https URL directly, but the provider must be able to reach it — if unsure, get Base64 working first. Compress or trim oversized videos with ffmpeg and convert to H.264 mp4.

  4. **Confirm the video actually reached the model**: read `usage.prompt_tokens` on every response. A 10-second 540p clip is about 700 tokens on Gemini, about 5,000 on Seed / Qwen and about 14,000 on Kimi (expect roughly ±30% at other resolutions — only the order of magnitude matters); **if it is only a few dozen tokens, the video was dropped** — raise an error instead of using the model's answer.

  5. **Stop the model from inventing answers to fit the question**: when the input is wrong (wrong file, video decoded to a black or gray screen, a placeholder image during integration) and the prompt assumes content, Gemini tends to make up content that is not there, while `prompt_tokens` looks perfectly normal. For batch pipelines where you do not control the input, first ask the neutral question "describe what you received" to confirm the input, then ask the specific question.

  6. Timestamps: reference segments as `MM:SS` in the prompt and ask for `MM:SS` in the output. On Seed you can add `"fps": 2` inside `video_url` for denser sampling (more tokens); other models ignore that field.

  7. Timeouts and cost: latency grows with video length — a 10-second clip took 4 to 30 seconds in testing — so set the client timeout to at least 300 seconds. Billing is per token, and video costs roughly 70 tokens per second on Gemini, 500 on Seed / Qwen and 1,400 on Kimi; estimate cost from that and trim long videos to the segment you need before sending.

  8. Read the key from the `APIYI_API_KEY` environment variable — never hard-code it or commit it to git.

  9. When you are done, run it for real once: send a short clip of about 10 seconds and show me the model's answer, `usage.prompt_tokens` and the cost of that call.
</Prompt>

<Accordion title="What this prompt protects you from">
  | Requirement | Trap it avoids |
  | - | - |
  | Always use `video_url` | The common `image_url` + `data:video/mp4` form only works on Gemini — switch models and you get 400 |
  | Skip GPT / Grok / Claude / GLM | GPT and GLM silently drop the video and still return 200; GPT even writes a plausible-looking answer |
  | Gemini: Base64 only, body under 20 MB | Public URLs are silently dropped (the model says it cannot see the video, or describes a black screen) or return `invalid argument`, and `files.upload` is unavailable to third parties |
  | Read `usage.prompt_tokens` | A dropped video shows up as only a few dozen tokens — the one signal you can detect in code |
  | Ask a neutral question first | With bad input Gemini follows the prompt and invents an answer; token counts look normal |
  | Timeout of 300 s or more | Long videos, Kimi and thinking models take several times longer; default timeouts cut off before the result arrives |
</Accordion>

## Supported models

These results come from tests run on 2026-10-11 (UTC+8): the same 10-second test clip (a different digit and shape every 2.5 seconds) was sent to every model, which had to list the digits in order with their timestamps. A blank image was used as a control to rule out answers produced without actually seeing the video.

| Provider | Model ID | Measured latency | Input tokens for the 10 s clip | Highlights | Recommended for |
| - | - | :-: | :-: | - | - |
| Google | `gemini-3.8-flash` 🔥 | 4–9 s | \~700 | Lowest video token count at half the unit price of 3.5 Flash; supports YouTube links | Everyday video analysis, YouTube content |
| Google | `gemini-3.1-pro-preview` | — | — | Google's strongest reasoning + multimodal | Complex, long-video deep analysis |
| Google | `gemini-3.1-flash-lite` | — | — | Ultra-low price and latency | High-volume, high-concurrency workloads |
| ByteDance | `seed-2-0-pro-260328` 🔥 | 8–10 s | \~5,000 | Most accurate timestamps; `fps` controls sampling | Top non-Gemini pick, precise timestamps |
| ByteDance | `dola-seed-2-1-turbo-260628` | 16–28 s | \~5,000 | Thinking on by default — more detailed, slower | Video Q\&A that needs reasoning |
| ByteDance | `seed-2-0-lite-260428` | \~14 s | \~5,000 | Balanced | General analysis |
| ByteDance | `seed-2-0-mini-260428` | \~5 s | \~5,000 | Cheapest and fastest Seed model | Bulk tagging, coarse filtering |
| ByteDance | `seed-1-8-251228` | \~6 s | \~5,000 | Previous-generation stable model | Existing workloads |
| Alibaba | `qwen3.8-flash` | 8–12 s | \~5,300 | Extremely low price | Bulk, cost-sensitive jobs |
| Alibaba | `qwen3.8-max` | 14–16 s | \~5,300 | Flagship reasoning | Complex video Q\&A |
| Alibaba | `qwen3-vl-plus` | \~4 s | \~5,200 | Dedicated vision model, fast | Recognition and OCR tasks |
| Alibaba | `qwen3.5-omni-plus` | \~4 s | \~5,200 | Omni-modal | Combined audio-visual understanding |
| Moonshot | `kimi-k3` | 14–30 s | \~14,000 | Accurate, but uses about 3× the video tokens of the others | Deep analysis where cost matters less |
| MiniMax | `MiniMax-M3` | \~5 s | \~3,700 | ⚠️ Gets the content order right but **timestamps are wrong** (compressed into the first 2 seconds in 3 of 3 runs) | Content-only use, no timestamps |

The previous `gemini-3.7-flash` and `gemini-3.5-flash`, plus the stable classics `gemini-2.5-pro` (2M context) and `gemini-2.5-flash`, are still available; 3.8 Flash used exactly the same video tokens as 3.5 Flash in our test (about 713 for 10 seconds) at half the input price. Latency and token figures apply to the 10-second 540p test clip above; longer or higher-resolution videos scale up roughly in proportion. Actual latency also depends on the endpoint and provider-side queuing, so the same clip can vary by 2–3×.

<Note>Model prices are aligned with the official sites and may change with them; the table above is for reference only — the **Model Pricing** tab in the top navigation is authoritative: [Model Pricing](/en/models/index).</Note>

### Models that do not support video

| Model | Behavior when a video is sent |
| - | - |
| OpenAI `gpt-6-sol` / `gpt-6-luna` / `gpt-5.6-terra`, etc. | The chat endpoint **returns 200 but drops the video** (`prompt_tokens` is only a few dozen); the Responses endpoint explicitly rejects `input_video` |
| xAI `grok-4.7` / `grok-4.5`, etc. | Error: `unsupported message content type` |
| Anthropic Claude (all models) | Video input is not supported |
| Zhipu `glm-5.3` | Returns 200 but drops the video; the model replies that no video was received |
| `deepseek-v4-flash-vision-exp` | Error: `unknown variant video_url` (images only) |

<Warning>
  **GPT may make up an answer after the video is dropped**: in our tests `gpt-6-sol` invented digit sequences that were not in the video in 3 of 3 runs, and described a London street scene as "a swimming pool with inflatable floats". If you must use these models, switch to the "frames as images" approach below.
</Warning>

## Video input methods

| Input method | Gemini | Seed / Qwen / Kimi / MiniMax |
| - | :-: | :-: |
| **`video_url` + Base64** (`data:video/mp4;base64,...`) | ✅ | ✅ |
| **`video_url` + public https URL** | ❌ Google rejects plain URLs | ✅ The provider must be able to reach the URL |
| **`image_url` + `data:video/mp4`** (legacy form) | ✅ | ❌ Returns 400 |
| **YouTube link** | ✅ Gemini native format only | ❌ |
| **Files API** (`files.upload`) | ❌ Official Google endpoint only | ❌ |

<Warning>
  **Gemini's 20 MB limit**: with Base64, the entire request body (including the encoded video) must stay under 20 MB. For larger videos, either ① use a YouTube link, ② compress or trim the video below 20 MB locally before encoding, or ③ switch to Seed / Qwen and pass a public URL directly.
</Warning>

<Tip>
  **The provider has to be able to fetch your URL**: the video is downloaded by the model provider, so the address must be reachable from its side. In our tests a URL on Volcengine object storage worked for Seed, Qwen, Kimi and MiniMax, while a Google Cloud Storage URL returned 403 on Seed. If unsure, get Base64 working first, then switch to a URL.
</Tip>

## Quick start: the universal format (`video_url`)

Works with Seed, Qwen, Kimi, MiniMax and Gemini.

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="YOUR_API_KEY",            # replace with your APIYI key
    base_url="https://api.apiyi.com/v1"
)

with open("demo.mp4", "rb") as f:
    video_b64 = base64.b64encode(f.read()).decode()

response = client.chat.completions.create(
    model="seed-2-0-pro-260328",       # or qwen3.8-flash / kimi-k3 / gemini-3.8-flash, etc.
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Describe this video in detail and give timestamps for the key moments"},
            {
                "type": "video_url",
                "video_url": {"url": f"data:video/mp4;base64,{video_b64}"},
                # or pass a public URL directly (not on Gemini): {"url": "https://your-bucket.example.com/demo.mp4"}
            },
        ],
    }],
)

print(response.choices[0].message.content)
```

The equivalent curl call (replace `<BASE64_VIDEO>` with the video's base64 string, or replace the whole `url` with a public address):

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "seed-2-0-pro-260328",
    "messages": [{
      "role": "user",
      "content": [
        {"type": "text", "text": "Summarize this video"},
        {"type": "video_url",
         "video_url": {"url": "data:video/mp4;base64,<BASE64_VIDEO>"}}
      ]
    }]
  }'
```

<Tip>
  **Seed lets you tune the sampling rate**: add `"fps": 2` inside `video_url` to look more closely at fast motion (in our test the 10-second clip went from about 4,900 to about 6,200 input tokens). Qwen and Kimi ignore this field.
</Tip>

## Gemini-specific formats

### Base64 inline (legacy `image_url` form)

Gemini accepts both the `video_url` form above and the `image_url` form below, so existing code keeps working; **for new code, use `video_url` so you can switch models freely**.

```python theme={null}
response = client.chat.completions.create(
    model="gemini-3.8-flash",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Describe this video in detail"},
            {
                "type": "image_url",
                "image_url": {"url": f"data:video/mp4;base64,{video_b64}"},
                "mime_type": "video/mp4",
            },
        ],
    }],
)
```

### Base64 inline (Gemini native format)

If your project already uses Google's official `google-genai` SDK, there is no need to switch to the OpenAI-compatible format: point `base_url` at `https://api.apiyi.com` and inline the video with `Part.from_bytes`. As above, the whole request body must stay under 20 MB.

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(
    api_key="YOUR_API_KEY",            # Replace with your APIYI key
    http_options={"base_url": "https://api.apiyi.com"}
)

with open("demo.mp4", "rb") as f:
    video_bytes = f.read()

response = client.models.generate_content(
    model="gemini-3.8-flash",
    contents=types.Content(parts=[
        types.Part.from_bytes(data=video_bytes, mime_type="video/mp4"),
        types.Part(text="Describe this video in detail and mark the timestamps of key moments"),
    ]),
)

print(response.text)
print(response.usage_metadata.prompt_tokens_details)  # includes a VIDEO entry when the video reached the model
```

REST equivalent: the Base64 string is long, so do not paste it into a command-line argument — write it to a JSON file first and send it with `-d @req.json`.

```bash theme={null}
# Build the request body (macOS / Linux)
printf '{"contents":[{"parts":[{"inline_data":{"mime_type":"video/mp4","data":"%s"}},{"text":"Summarize this video"}]}]}' \
  "$(base64 < demo.mp4 | tr -d '\n')" > req.json

curl "https://api.apiyi.com/v1beta/models/gemini-3.8-flash:generateContent" \
  -H "x-goog-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d @req.json
```

<Tip>
  **The native format makes it easier to confirm the video reached the model**: `usageMetadata.promptTokensDetails` in the response splits the input by modality — our 10-second test clip came back as `VIDEO` 660 plus a few `TEXT` tokens, the same total as the OpenAI-compatible format. If there is no `VIDEO` entry, the video was not received.
</Tip>

### YouTube links (Gemini native format)

YouTube links need no download and are not subject to the 20 MB limit, but they **only work through the Gemini native format** (the `google-genai` SDK, endpoint `https://api.apiyi.com`).

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(
    api_key="YOUR_API_KEY",
    http_options={"base_url": "https://api.apiyi.com"}
)

response = client.models.generate_content(
    model="gemini-3.8-flash",
    contents=types.Content(parts=[
        types.Part(file_data=types.FileData(
            file_uri="https://www.youtube.com/watch?v=VIDEO_ID"
        )),
        types.Part(text="Summarize the main content and key information in this video"),
    ]),
)

print(response.text)
```

<Info>
  For more native-format features (streaming, thinking budget, function calling, etc.), see [Gemini Native Format](/en/api-capabilities/gemini/native).
</Info>

## Models that do not support video: frames as images

For image-only models such as GPT and Grok, extract frames locally at a fixed interval and send them as multiple images. In our tests `gpt-6-sol`, `gpt-6-luna`, `gpt-5.6-terra`, `grok-4.7` and `grok-4.5` all described the content and order correctly from 4 frames. The trade-off: **audio and the motion between frames are lost**, and you need to state the timing in the prompt yourself.

```python theme={null}
import base64, subprocess, glob

# Extract one frame every 2 seconds (requires ffmpeg installed locally)
subprocess.run(["ffmpeg", "-i", "demo.mp4", "-vf", "fps=0.5", "frame-%02d.jpg"], check=True)

frames = []
for path in sorted(glob.glob("frame-*.jpg")):
    b64 = base64.b64encode(open(path, "rb").read()).decode()
    frames.append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}})

response = client.chat.completions.create(
    model="gpt-6-sol",
    messages=[{
        "role": "user",
        "content": [{"type": "text", "text": "These are frames taken every 2 seconds from one video, in time order. Describe the video."}] + frames,
    }],
)
```

## Advanced tips

### Timestamp referencing

Reference segments directly in the prompt with `MM:SS` — this is purely a prompting technique and works on any model that supports video:

```text theme={null}
Describe what happens between 00:30 and 01:15, and tell me what text appears at 02:40.
```

When precise timestamps matter, prefer Seed or Qwen; MiniMax-M3 timestamps were unreliable in our tests.

### Two ways an answer can be untrustworthy

**① The video never reached the model**: check `usage.prompt_tokens` in the response. A 10-second clip is about 5,000 tokens on Seed / Qwen and about 700 on Gemini; **if it is only a few dozen tokens, the video was dropped** (this is what happens on GPT and GLM, and on Gemini when given a public URL), and the answer cannot be trusted. The model will not necessarily say it cannot see anything: given a public URL, Gemini describes the missing video as "a completely black screen", and GPT invents content that is not there.

**② The input is wrong and the prompt assumes content**: for example the wrong file was sent, the video decoded to a black or gray screen, or a placeholder image was used during integration. Here `prompt_tokens` looks perfectly normal, so token counts will not catch it.

<Warning>
  **Gemini models tend to go along with the question and invent an answer in case ②.** In our tests we replaced the video with a blank image:

  * Asked neutrally ("describe what you received"), Gemini 3.8 Flash / 3.5 Flash / 3.1 Pro / 3.1 Flash Lite correctly said it was a blank image in all 12 runs — **their image understanding itself is fine**;
  * But once the question assumed content ("which digits appear in the video, in order" — or even "are there any digits? if not, say no"), 3.5 Flash / 3.1 Pro / 3.1 Flash Lite invented digits that were not there in 12 of 18 runs;
  * The newer `gemini-3.8-flash` is clearly better but not fixed: it still invented an answer in 2 of 7 runs with the same leading questions;
  * Asked the same questions, Seed, Qwen and Kimi all correctly answered that they could not see any / there were none.

  Recognition of real videos is unaffected. For batch pipelines where you do not control the input, **first ask a neutral question to have the model describe what it sees, confirm the input is right, then ask the specific question** — or use Seed / Qwen.
</Warning>

### Prompt ideas for common tasks

The same video can drive very different analyses just by changing the prompt — no code changes required:

* **Content summary**: summarize the topic, key scenes and takeaway in 3-5 sentences
* **Lesson analysis**: extract key concepts, chapter breakdown and important timestamps
* **Surveillance review**: flag unusual behavior, people/objects that appear, and when they appear
* **Marketing review**: assess how product selling points are presented, pacing and audience fit
* **Motion analysis**: break down action steps, posture cues and areas for improvement

## Technical notes

* **Gemini**: samples at **1 frame per second** by default and also processes the audio track; Gemini 3.x counts frames at low resolution by default, about **70 tokens per second** in our test.
* **Seed / Qwen**: about **500 tokens per second** in our test (540p video); Seed's sampling can be tuned with `fps`.
* **Kimi K3**: about **1,400 tokens per second** in our test, so long videos cost noticeably more.
* **Supported formats**: common formats such as mp4, mov and webm; converting to H.264 mp4 gives the best compatibility.

## FAQ

<AccordionGroup>
  <Accordion title="Can GPT, Grok or Claude understand video?">
    No. Claude and Grok return an error outright; GPT's chat endpoint **silently drops the video** and still returns 200, and the model may invent an answer. If you need these models, extract frames first and send them as images — see "Models that do not support video: frames as images".
  </Accordion>

  <Accordion title="Which Chinese models support video understanding?">
    Passed our tests: the whole Seed family (`seed-2-0-pro-260328`, `dola-seed-2-1-turbo-260628`, `seed-2-0-lite-260428`, `seed-2-0-mini-260428`, `seed-1-8-251228`), Qwen's `qwen3.8-max`, `qwen3.8-flash`, `qwen3-vl-plus` and `qwen3.5-omni-plus`, and `kimi-k3`. `MiniMax-M3` recognizes the content but gets timestamps wrong. `glm-5.3` and `deepseek-v4-flash-vision-exp` do not support video.
  </Accordion>

  <Accordion title="The same code returns 400 when I switch models?">
    You are most likely using the legacy `image_url` + `data:video/mp4` form, which only Gemini accepts. Switch to `{"type": "video_url", "video_url": {"url": ...}}` and it works across providers.
  </Accordion>

  <Accordion title="Gemini described things that are not in my video?">
    First make sure the input itself is fine (not a black screen, a blank frame or the wrong file). In our tests, when the input was wrong and the question assumed content, Gemini tended to invent an answer that matched the question. To troubleshoot, switch to a neutral prompt such as "describe what you received" and check whether it describes your video; see "Two ways an answer can be untrustworthy".
  </Accordion>

  <Accordion title="Public video URL returns Request contains an invalid argument / fetch failed">
    Gemini **does not accept arbitrary public URLs** (for example `https://example.com/video.mp4`); this is not an APIYI block. On Gemini, use Base64 inline (under 20 MB) or a YouTube link instead — or switch to Seed / Qwen, which can fetch public URLs directly. On `/v1/chat/completions` it does not always error: it may return 200 with the model claiming to see a black screen — in that case `prompt_tokens` is only a few dozen and the result is unusable.
  </Accordion>

  <Accordion title="Why does Gemini cap requests at 20 MB? It used to work.">
    With Base64 inline, Gemini has always capped the entire request body at 20 MB (matching Google's official limit). If what "used to work" was a public URL, that was never a supported method — it just happened not to error in some cases, and is now rejected explicitly.
  </Accordion>

  <Accordion title="Can I use files.upload for large videos?">
    No. Gemini's official Files API (`client.files.upload()`) is **not supported on third-party endpoints** — only on Google's own. For large videos, use a YouTube link, compress to under 20 MB for Base64, or switch to Seed / Qwen with a public URL.
  </Accordion>

  <Accordion title="What about videos over 20 MB?">
    Three options: ① upload to YouTube and pass the link (Gemini native format); ② use ffmpeg or a similar tool to compress or trim the key segment to under 20 MB, then encode it as base64; ③ host the video on publicly reachable object storage and pass the URL to Seed / Qwen.
  </Accordion>
</AccordionGroup>

## Related resources

<CardGroup cols={2}>
  <Card title="Model Pricing" icon="list" href="/en/models/index">
    All models and the latest pricing
  </Card>

  <Card title="Gemini Native Format" icon="sparkles" href="/en/api-capabilities/gemini/native">
    YouTube links, streaming, thinking budget and more native features
  </Card>

  <Card title="Vision Understanding API" icon="image" href="/en/api-capabilities/vision-understanding">
    Image content recognition and multimodal analysis
  </Card>

  <Card title="Qwen3.8-Max" icon="brain" href="/en/api-capabilities/qwen-3-8/overview">
    Qwen flagship with native image and video input
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.