> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash Vision

> DeepSeek's first vision model deepseek-v4-flash-vision-exp: read images, screenshots and charts. 1M context, 384 tokens per image max. Priced at $0.44 input / $1.32 output per 1M tokens on APIYI, callable in both OpenAI and Anthropic formats.

`deepseek-v4-flash-vision-exp` is DeepSeek's **experimental vision model**, built on the V4 Flash
base with image input added: describe pictures, read text out of screenshots, read chart values,
compare multiple images. Everything on the text side (1M context, thinking mode, function calling,
context caching) is retained, and pricing is identical to the text-only V4 Flash ——
**vision costs no premium; images are converted to input tokens by their dimensions**.

APIYI has completed **124 test cases across roughly 1,100 calls**, covering three image-input
channels, four image formats, two protocols and two groups.

<Warning>
  **Read this before you call: this model is served by two groups on APIYI with different
  capabilities. Pick the group that matches your protocol.**

  | Protocol you use                                                         | Group your key must be in |
  | ------------------------------------------------------------------------ | ------------------------- |
  | OpenAI format (`/v1/chat/completions`, `/v1/responses`)                  | **`default`**             |
  | Anthropic format (`/v1/messages`, incl. Claude Code and similar clients) | **`ClaudeCode`**          |

  Picking the wrong group does not raise a "wrong group" error. It shows up as parameters silently
  doing nothing, a 400 on the second turn, or `/v1/responses` complaining about `messages`.
  Both groups are **priced identically** —— the group affects capability only, never billing.
  See "Choosing a group" below.
</Warning>

## Highlights

<CardGroup cols={2}>
  <Card title="No vision premium" icon="circle-dollar-sign">
    Same price as text-only V4 Flash: \$0.44 input, \$1.32 output per 1M tokens. Images become input tokens, capped at 384 per image.
  </Card>

  <Card title="Solid recognition in testing" icon="eye">
    Screenshot OCR values all correct, 5-bar chart read 5/5, counting a specific shape among 36 shapes 24/24. No hallucination on negative questions.
  </Card>

  <Card title="No need to pre-compress" icon="image">
    2000×2000 and 4000×4000 convert to exactly the same token count (346). Upstream rescales for you —— compressing only saves bandwidth, not money.
  </Card>

  <Card title="Both protocols work" icon="git-compare">
    OpenAI format (chat/completions + responses) and Anthropic format (/v1/messages) are both verified, each through its own group.
  </Card>
</CardGroup>

## Model information

| Field                           | Value                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Model name**                  | `deepseek-v4-flash-vision-exp`                                                                   |
| **Model version**               | DeepSeek-V4-Flash-Vision-Exp (experimental)                                                      |
| **Context window**              | 1M (measured hard ceiling 1,048,576 tokens, with `max_tokens` counted inside it)                 |
| **Max output**                  | 384K (measured hard limit 393,216; beyond it returns `valid range of max_tokens is [1, 393216]`) |
| **Available groups**            | `default`, `ClaudeCode`, `svip`                                                                  |
| **Endpoints**                   | `POST /v1/chat/completions`, `POST /v1/responses`, `POST /v1/messages`                           |
| **Image input**                 | ✅ JPEG / PNG / GIF / WebP                                                                        |
| **Thinking mode**               | On by default, can be disabled (the working syntax depends on the group, see below)              |
| **Streaming**                   | ✅ on all three endpoints                                                                         |
| **Function calling / tool use** | ✅ including incremental streaming assembly                                                       |
| **JSON output**                 | ✅ `json_object`; ❌ `json_schema` (not enabled upstream)                                          |
| **Pricing**                     | \$0.44 input, \$1.32 output, \$0.014 cache hit, per 1M tokens                                    |

<Note>
  Since 2026-08-17 the vendor bills this model in two tiers by time of day (peak hours are
  01:00-04:00 and 06:00-10:00 (UTC)). **APIYI charges the peak rate at all times**, so your cost
  never varies by the hour.
</Note>

## Choosing a group

The two groups on APIYI route to **different upstream endpoints**, so their capabilities are not
equivalent. The table below is measured on 2026-08-21, three repetitions per cell:

| Capability                              | `default` group                                      | `ClaudeCode` group    |
| --------------------------------------- | ---------------------------------------------------- | --------------------- |
| `/v1/chat/completions` with image       | ✅                                                    | ✅                     |
| `/v1/responses` with image              | ✅                                                    | ❌ 400 every time      |
| `/v1/messages` with image               | ⚠️ requires an explicit `top_p`, and multi-turn 400s | ✅ fully working       |
| `detail` token savings                  | ✅ effective                                          | ❌ ignored             |
| Disabling thinking (OpenAI format)      | ✅ effective                                          | ❌ ignored             |
| `logprobs`                              | ✅ populated                                          | ❌ returns empty       |
| `reasoning_tokens` in usage             | ✅ present                                            | ❌ whole field missing |
| Image via public URL (Anthropic format) | ❌                                                    | ✅                     |

### OpenAI format → use the `default` group

Create a token with group `default`, then:

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",          # a token in the default group
    base_url="https://api.apiyi.com/v1",
)
```

### Anthropic format → use the `ClaudeCode` group

Create a token with group `ClaudeCode`, then:

```python theme={null}
import anthropic

client = anthropic.Anthropic(
    api_key="sk-your-apiyi-key",          # a token in the ClaudeCode group
    base_url="https://api.apiyi.com",
)
```

<Tip>
  One account can hold several tokens in different groups at once and they do not interfere ——
  keeping one per protocol is the recommended setup. See
  [What are groups](/en/faq/groups-explained) and
  [Tokens and groups](/en/faq/token-and-groups) for how to create them, and
  [Codex vs ClaudeCode vs Default groups](/en/faq/codex-claudecode-default-groups)
  for how the three differ.
</Tip>

<Warning>
  **Never use the `default` group for the Anthropic format.** Two problems stack up there:

  1. Omitting `top_p` returns 400 `Invalid top_p value` every time
  2. Even with `top_p` supplied, replaying the first turn's `thinking` block into the second turn
     returns `unknown variant 'thinking'` —— and standard clients such as Claude Code and the
     Anthropic SDK always replay it, so **multi-turn always breaks**

  Switch to the `ClaudeCode` group and neither problem exists; the full tool-call round trip
  works as well.
</Warning>

## Three ways to send an image

### 1. Inline base64 (most common)

```python theme={null}
import base64

with open("image.jpg", "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="deepseek-v4-flash-vision-exp",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "What is in this image?"},
            {"type": "image_url",
             "image_url": {"url": f"data:image/jpeg;base64,{b64}"}},
        ],
    }],
    max_tokens=2000,
)
print(resp.choices[0].message.content)
```

### 2. Public image URL

```python theme={null}
resp = client.chat.completions.create(
    model="deepseek-v4-flash-vision-exp",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Describe this image."},
            {"type": "image_url",
             "image_url": {"url": "https://example.com/image.jpg"}},
        ],
    }],
    max_tokens=2000,
)
```

The URL may be at most 8192 characters and the download must finish within 60 seconds.
A dead link returns `Failed to download image`.

### 3. A `file` content block (equivalent to inline base64)

```json theme={null}
{
  "type": "file",
  "file_data": "data:image/jpeg;base64,<BASE64>",
  "filename": "image.jpg"
}
```

Measured token cost is identical to the `image_url` channel (303 for the same image either way).

<Warning>
  **The Files API (upload to `/v1/files`, then reference by `file_id`) is not available on APIYI**,
  which is the norm for third-party gateways. The two allowances the vendor reserves for `file_id`
  —— 64 MiB per image and 200 MiB per request —— are therefore out of reach.

  The limits that actually apply are **32 MiB per image and 48 MiB per request body**.
  Exceeding them returns `image file size exceeds limit 32 MB`.
</Warning>

## How images are billed

An image is converted to input tokens based on its **post-resize dimensions**, and billed together
with your text tokens at \$0.44 / 1M. The numbers below are measured on APIYI using a fixed prompt
and subtracting the text-only baseline:

| Image size                     | Tokens | Cost per image | Per 1,000 images |
| ------------------------------ | ------ | -------------- | ---------------- |
| 64×64                          | 114    | \$0.00005      | \$0.05           |
| 384×384                        | 114    | \$0.00005      | \$0.05           |
| 800×800                        | 346    | \$0.000152     | \$0.15           |
| 2000×2000                      | 346    | \$0.000152     | \$0.15           |
| 4000×4000                      | 346    | \$0.000152     | \$0.15           |
| 1600×1200                      | 354    | \$0.000156     | \$0.16           |
| 1600×1200 with `detail: "low"` | 142    | \$0.0000625    | \$0.06           |

Three rules, matching the vendor's description exactly:

* **384 tokens per image is a hard ceiling.** The largest value measured was 354; no image exceeds it
* **Large images are scaled down to roughly an 800×800 equivalent.** That is why 2000² and 4000²
  cost the same, and why **pre-compressing before upload saves bandwidth but not money**
* **Images below 384×384 are scaled up.** So 64×64 costs the same as 384×384 —— no need to shrink
  small images further

### The token saver: `detail: "low"`

When fine detail does not matter (identifying an image type, recognising the subject, rough
classification), add `detail: "low"` to downscale the image to 512×512 before inference:

```json theme={null}
{
  "type": "image_url",
  "image_url": {"url": "https://example.com/image.jpg", "detail": "low"}
}
```

All four levels, measured on the same 1600×1200 image:

| `detail`   | Tokens | vs. default |
| ---------- | ------ | ----------- |
| `low`      | 142    | **-60%**    |
| `high`     | 354    | same        |
| `original` | 354    | baseline    |
| `auto`     | 354    | same        |

<Warning>
  `detail` only takes effect when **both** conditions hold: it is set on an `image_url` block
  (on a `file` block it is silently ignored), and your token is in the **`default` group**
  (it does nothing in the `ClaudeCode` group).

  An invalid value fails loudly:
  `unknown variant 'ultra', expected one of 'low', 'high', 'original', 'auto'`.
</Warning>

## Controlling thinking mode

Thinking mode is **on by default**, and the thinking text counts against your `max_tokens` budget.
For pure image-reading tasks, turn it off: with thinking disabled our tests scored 24/24, ran
faster, saved the entire thinking output, and cut 80 input tokens as well (the thinking system
prompt costs exactly that much).

Every syntax, three runs each:

| Syntax                           | chat, `default` group                                     | chat, `ClaudeCode` group | `/v1/messages` |
| -------------------------------- | --------------------------------------------------------- | ------------------------ | -------------- |
| `thinking: {"type": "disabled"}` | ✅                                                         | ❌                        | ✅ both groups  |
| `reasoning_effort: "none"`       | ✅                                                         | ❌                        | —              |
| `reasoning_effort: "low"`        | ⚠️ thinking stays on, only the system prompt gets shorter | ❌                        | —              |
| `reasoning: {"effort": "none"}`  | ❌                                                         | ❌                        | —              |
| `enable_thinking: false`         | ❌                                                         | ❌                        | —              |

```python theme={null}
resp = client.chat.completions.create(
    model="deepseek-v4-flash-vision-exp",
    messages=[...],
    max_tokens=2000,
    extra_body={"thinking": {"type": "disabled"}},   # works in the default group
)
```

<Warning>
  **Do not set `max_tokens` too low.** With thinking on, even a one-line question can emit several
  hundred tokens of thinking first; too small a budget yields `finish_reason: "length"` with an
  empty `content` —— which looks like the model failed to answer. Use 2000 or more with thinking
  on, or simply disable thinking.
</Warning>

## Context caching

Caching needs no parameters: a repeated long prefix hits automatically, and the hit portion is
billed at \$0.014 / 1M. But **requests containing images differ from text-only ones in two ways**:

|                          | Text-only request | Request with an image |
| ------------------------ | ----------------- | --------------------- |
| First hit occurs on call | 2nd               | 3rd                   |
| The image's own tokens   | —                 | **never cached**      |

Measured with a 2304-token text prefix plus one 800×800 image:

| Call | prompt\_tokens | Hit      | Miss |
| ---- | -------------- | -------- | ---- |
| 1    | 2675           | 0        | 2675 |
| 2    | 2675           | 0        | 2675 |
| 3    | 2675           | **2304** | 371  |
| 4    | 2675           | 2304     | 371  |

The hit is exactly the text that sits **before** the image; the image and everything after it is
charged at full price every time. So **put your fixed long instructions ahead of the image** to get
them cached —— anything placed after the image can never hit.

<Note>
  In the Anthropic format these fields are named `cache_read_input_tokens` and
  `cache_creation_input_tokens`, and behave the same way. Note that explicit `cache_control`
  markers have **no effect** (upstream uses automatic prefix caching), and that the two protocols
  report usage differently: OpenAI's `prompt_tokens` is always the full count, while Anthropic's
  `input_tokens` drops to the uncached remainder after a hit —— **the two cannot be reconciled
  directly**.
</Note>

## Supported image formats

| Format           | Supported | Note                                                                        |
| ---------------- | --------- | --------------------------------------------------------------------------- |
| JPEG             | ✅         |                                                                             |
| PNG              | ✅         |                                                                             |
| GIF              | ✅         | Animated GIFs are **read as the first frame only**, and billed as one frame |
| WebP             | ✅         |                                                                             |
| BMP / TIFF / SVG | ❌         | Returns `You have uploaded an unsupported image`                            |

All four supported formats convert to identical token counts, so the container never affects cost.

<Tip>
  **The format is detected from file content, not from the MIME type you declare.** In testing,
  a PNG declared as `image/jpeg` worked fine —— a wrong extension or wrong MIME does not matter
  as long as the file itself is one of the four supported formats.
</Tip>

## Verified capability matrix

Measured by APIYI on 2026-08-21:

| Capability                                             | Vendor claim | Measured (`default` group)                                                             |
| ------------------------------------------------------ | ------------ | -------------------------------------------------------------------------------------- |
| Inline base64 image                                    | ✅            | ✅                                                                                      |
| Public URL image                                       | ✅            | ✅                                                                                      |
| `file` block with `file_data`                          | ✅            | ✅                                                                                      |
| `file_id` (Files API)                                  | ✅            | ❌ the platform does not offer a Files API                                              |
| Multiple images per request                            | up to 600    | ✅ 20 images verified, order and content all correct                                    |
| Image plus multi-turn context                          | ✅            | ✅                                                                                      |
| Image plus function calling                            | ✅            | ✅ including streaming increments                                                       |
| Image plus JSON output                                 | ✅            | ✅ `json_object`                                                                        |
| Structured output `json_schema`                        | —            | ❌ upstream returns `This response_format type is unavailable now`                      |
| Streaming                                              | ✅            | ✅ on all three endpoints                                                               |
| `logprobs` / `temperature` / `top_p` / `stop` / `seed` | ✅            | ✅                                                                                      |
| Responses `previous_response_id` chaining              | ✅            | ❌ **silently ineffective** (no error, but no context). Build the full `input` yourself |

### Accuracy spot checks

| Task                                                | Result                                 |
| --------------------------------------------------- | -------------------------------------- |
| OCR of a 6-line mixed alphanumeric screenshot       | Order ID, amount and email all correct |
| Reading a 5-bar chart                               | 5/5 correct, title included            |
| Counting a specific shape in a 6×6 grid (36 shapes) | 24/24 correct                          |
| Spotting the difference between two images          | Correct                                |
| Label recognition across 10 and 20 images in order  | All correct                            |
| Negative question (something absent from the image) | Correctly denied, no hallucination     |

## Limits and common errors

| Limit              | Value              | Error when exceeded                                     |
| ------------------ | ------------------ | ------------------------------------------------------- |
| Single image       | 32 MiB             | `image file size exceeds limit 32 MB`                   |
| Request body       | 48 MiB             | —                                                       |
| URL length         | 8192 characters    | `external link length … too long, max link length 8192` |
| Images per request | 600 per the vendor | —                                                       |
| `max_tokens`       | 393,216            | `valid range of max_tokens is [1, 393216]`              |
| `top_logprobs`     | 0–20               | `valid range of top_logprobs is [0, 20]`                |
| Context            | 1,048,576          | `This model's maximum context length is 1048576 tokens` |

<Note>
  The 1,048,576 context ceiling is measured, and the error message shows that **`max_tokens`
  counts against that same total** (`… in the messages, … in the completion`). When packing a
  long context, leave room for your output budget or you will hit the ceiling.
</Note>

Other common 400s:

* `You have uploaded an unsupported image` —— format is not one of the four, or the base64 is corrupt
* `Failed to download image` —— the URL is unreachable or took over 60 seconds
* `Image in assistant message is unsupported` —— images may only appear in `user` messages

<Note>
  In testing, roughly **1%-3%** of requests had their connection silently closed (surfacing to the
  client as an SSL EOF or a handshake timeout). This is unrelated to images and unrelated to the
  group —— it is an occasional transport-level event. **Always set a read timeout and retry**,
  otherwise a single request can hang for over two minutes.
  See [Timeout configuration](/en/faq/timeout-configuration).
</Note>

## Full examples

### OpenAI format (`default` group)

```python theme={null}
import base64
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",       # default group
    base_url="https://api.apiyi.com/v1",
)

with open("chart.png", "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="deepseek-v4-flash-vision-exp",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Read the five bar values in this chart. Numbers only."},
            {"type": "image_url",
             "image_url": {"url": f"data:image/png;base64,{b64}", "detail": "original"}},
        ],
    }],
    max_tokens=2000,
    extra_body={"thinking": {"type": "disabled"}},
)
print(resp.choices[0].message.content)
print(resp.usage)
```

### Anthropic format (`ClaudeCode` group)

```python theme={null}
import base64
import anthropic

client = anthropic.Anthropic(
    api_key="sk-your-apiyi-key",       # ClaudeCode group
    base_url="https://api.apiyi.com",
)

with open("chart.png", "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

msg = client.messages.create(
    model="deepseek-v4-flash-vision-exp",
    max_tokens=2000,
    thinking={"type": "disabled"},
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Read the five bar values in this chart. Numbers only."},
            {"type": "image", "source": {
                "type": "base64", "media_type": "image/png", "data": b64}},
        ],
    }],
)
print(msg.content)
```

## Related documentation

<CardGroup cols={2}>
  <Card title="Vision Understanding API" icon="eye" href="/en/api-capabilities/vision-understanding">
    General calling patterns and comparisons across vision models
  </Card>

  <Card title="DeepSeek V4 Flash" icon="zap" href="/en/api-capabilities/deepseek-v4-flash/overview">
    The text-only sibling on the same base, with 1M context and dual endpoints
  </Card>

  <Card title="Choosing a group" icon="users" href="/en/faq/codex-claudecode-default-groups">
    How the Codex, ClaudeCode and Default groups differ, and which to pick
  </Card>

  <Card title="Timeout configuration" icon="timer" href="/en/faq/timeout-configuration">
    Recommended client read timeout and retry settings
  </Card>
</CardGroup>
