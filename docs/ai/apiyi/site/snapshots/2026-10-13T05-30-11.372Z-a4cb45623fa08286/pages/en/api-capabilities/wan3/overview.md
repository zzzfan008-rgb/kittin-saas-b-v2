> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan3.0 Video Generation (Alibaba Tongyi Wanxiang)

> Complete guide to Alibaba Tongyi Wanxiang Wan3.0 video generation: one model ID covers text-to-video, image-to-video, reference-to-video and video editing, up to 30 seconds, 480P-1080P, native audio track, with per-tier pricing for Standard and Prime; 98% of official by default, as low as 81.7% with top-up bonuses ($0.0245/sec at 480P).

## Overview

**Wan3.0 is Tongyi Wanxiang's all-in-one video model.** Unlike Wan2.7, which makes you switch between four model IDs (`t2v` / `i2v` / `r2v` / `videoedit`), Wan3.0 handles **every mode through a single model ID** — what you send as media decides what it does. Text-to-video, image-to-video, reference-to-video and video editing all share one request body.

Two variants, identical capabilities, different speed and price:

| Model ID | Position | Relative speed | APIYI price at 720P | **With 20% top-up bonus, as low as** |
| - | - | - | - | - |
| `wan3.0-video` | Standard | Baseline | \$0.0588/sec | **\$0.049/sec** (≈ ¥0.34/sec) |
| `wan3.0-video-prime` | **Prime (faster)** | Faster delivery | \$0.126/sec | **\$0.105/sec** (≈ ¥0.74/sec) |

<Info>
  Both variants share **exactly the same parameters, endpoint and media rules** — only speed and unit price differ. Build against `wan3.0-video` first, then switch latency-sensitive production traffic to `wan3.0-video-prime`.
</Info>

## Let an AI Agent Do the Integration

<Note>
  If you build with Codex / Claude Code / Cursor, copy the prompt below and hand it to your agent. It first fetches the plain-text version of this page (append `.md` to any docs URL), then writes code in your project's own stack — **why `/v1/videos` must not be used**, the missing-`X-DashScope-Async` error, the `completed` (not `SUCCEEDED`) terminal state and the fact that reference-video seconds are billed are already baked into the requirements.
</Note>

<Prompt description="Have a coding agent integrate or troubleshoot Wan3.0 text-to-video, image-to-video, reference-to-video and video editing. Copy and paste into Codex, Claude Code, Cursor and similar tools." icon="bot" actions={["copy"]}>
  Integrate / troubleshoot Wan3.0 video generation (text-to-video, image-to-video, reference-to-video, video editing) in this project.

  Read the docs before you touch code: fetch [https://docs.apiyi.com/en/api-capabilities/wan3/overview.md](https://docs.apiyi.com/en/api-capabilities/wan3/overview.md) for the plain-text version of this page; the API reference page is [https://docs.apiyi.com/en/api-capabilities/wan3/video-generation.md](https://docs.apiyi.com/en/api-capabilities/wan3/video-generation.md).

  Requirements:

  1. Endpoint and async header (**the two things most likely to block you immediately**): submissions must go to `POST /wan/api/v1/services/aigc/video-generation/video-synthesis` and **must carry the header `X-DashScope-Async: enable`**. **Never use `/v1/videos`** — that route drops the `media` field, ignores the resolution and duration parameters, and bills inaccurately on the high side. Polling uses a **different prefix**: `GET /v1/tasks/{task_id}` (the async header is not needed when polling).

  2. Polling and status: the task ID is at **`output.task_id`** in the submit response. Poll every 5 to 10 seconds and **never faster than 3 seconds**; give the client an overall 20-minute ceiling (a 5-second clip measured about 100 seconds at 480P, 120 seconds at 720P and 170 seconds at 1080P). Statuses are `submitted`, `in_progress`, `completed` and `failed`, and **success is `completed`, not DashScope's native `SUCCEEDED`** — checking for the native enum means polling forever. A `progress` value stuck at 30 percent for a long time is normal, not a hang. **Parameter and media errors also return HTTP 200 first and then fail asynchronously**, so the submit status code alone tells you nothing.

  3. Getting the video: the address is the top-level **`result_url`**, an Aliyun OSS signed link that **expires in 24 hours**. **Download it server-side immediately and re-host it in your own object storage or CDN**; never keep it as a long-term address. Do **not** send an `Authorization` header when downloading it — doing so returns 403.

  4. Body shape and types: the body is DashScope's nested form, `{ model, input: { prompt, media[] }, parameters: { ... } }`, not a flat object. **`duration` must be the integer `5`, never the string `"5"`**, and **`resolution` must be uppercase `480P`, `720P` or `1080P`**.

  5. Model and modes: Wan3.0 has **a single model ID**; text-to-video, image-to-video, reference-to-video and video editing are distinguished purely by the `type` of each entry in `input.media[]`. **Do not copy Wan2.7's four model IDs (`t2v`, `i2v`, `r2v`, `videoedit`)** — they still work, but they call the previous generation, not Wan3.0. `wan3.0-video` (Standard) and `wan3.0-video-prime` (Prime, faster) take exactly the same parameters and differ only in speed and unit price, so make the model a config value. Each `media` entry is shaped `{"type": ..., "url": ...}`: no `media` means text-to-video; `first_frame` (optionally with `last_frame`) means image-to-video; `reference_image`, `reference_video` and `reference_audio` mean reference-to-video; `file` and `link` turn a document or web page into a video. **`first_frame` / `last_frame` cannot be mixed with `reference_*`, `file` or `link`** — the upstream rejects the mix. Each `url` must be a publicly GET-able https link that **stays reachable until the task finishes**. With several inputs, refer to them in the prompt as image 1, video 1 and so on, following the `media` order.

  6. Key parameters: **always set `resolution` explicitly** — it sets the unit price, and 480P costs a quarter of 1080P. Omitting `duration` yields 5 seconds. **Reference-video length plus output `duration` must not exceed 30 seconds combined**; exceeding it again means a 200 on submit and a `failed` task. `ratio` accepts `16:9`, `9:16`, `1:1`, `4:3`, `3:4` or `adaptive`, and **is ignored automatically whenever a first-frame image is supplied**. `prompt_extend` defaults to `true` and should stay on; `audio` defaults to `true`, so output carries a native audio track.

  7. Billing and idempotency: **billing is per second, priced by output resolution, and billed seconds = reference-video length + output length** — a 10-second reference video with a 2-second output bills 12 seconds; reference images, audio and files are free. To save money, trim the reference video first; lowering `duration` cannot remove the input seconds. **Tasks with a reference video are pre-charged at the 30-second ceiling** on submission and the difference is refunded automatically on completion (a separate negative line in the bill), so keep some balance headroom. A `failed` task is **fully refunded**, but **resubmitting the same task bills again** — keep a mapping from your business ID to the `task_id` for idempotency rather than blindly auto-retrying; change the prompt after a moderation failure and check URL reachability after a media failure. Use exponential backoff (1s, 4s, 16s) for 5xx and network errors.

  8. Token requirements: this model needs a token carrying the `Wan&HappyHorse` group with a **pay-as-you-go or PAYG-priority** billing mode — **a per-call token cannot route to it** and produces an error saying no channel is available.

  9. Read the key from the `APIYI_API_KEY` environment variable. Never hardcode it, never commit it to git.

  10. When you are done, actually run one 480P text-to-video call and one image-to-video call, then show me the videos and what those two calls cost. Note the whole flow takes several minutes, so if you run in a constrained execution environment, raise the command timeout above 600 seconds or run it in the background.
</Prompt>

<Accordion title="What this prompt saves you from">
  | Requirement | Pitfall it prevents |
  | - | - |
  | Never use `/v1/videos` | That route drops `media`, ignores resolution and duration and overbills — it looks like a parameter bug when it is really the wrong endpoint |
  | The `X-DashScope-Async` header | Without it the call is treated as synchronous and rejected outright |
  | Success is `completed` | Checking for DashScope's native `SUCCEEDED` means the poll loop never ends |
  | One model ID only | Copying Wan2.7's four model IDs still works but silently calls the previous generation, with different limits and prices |
  | First frame and reference media are exclusive | Mixing `first_frame` with `reference_*` is rejected — and asynchronously, as a `failed` task |
  | Reference-video seconds are billed | Lowering `duration` cannot remove the input seconds, and reference-video tasks are pre-charged at the 30-second ceiling |
  | No `Authorization` on download | The OSS signed link returns 403 when you send auth |
</Accordion>

## What changed from Wan2.7

| Dimension | Wan2.7 | **Wan3.0** |
| - | - | - |
| Model IDs | 4 (t2v / i2v / r2v / videoedit) | **1** (media decides the mode) |
| Max duration | 15 sec (10 sec with reference video) | **30 sec** (input + output combined) |
| Resolutions | 720P / 1080P | **480P** / 720P / 1080P |
| Audio | Requires `driving_audio` for lip sync | **Native audio track by default** |
| 720P price | \$0.084/sec | **\$0.0588/sec** (\~30% cheaper) |
| 1080P price | \$0.14/sec | **\$0.1176/sec** (\~16% cheaper) |

Wan2.7 remains fully available — see [Wan2.7 Video Generation](/en/api-capabilities/wan/overview).

## Key features

<CardGroup cols={2}>
  <Card title="Four modes, one model" icon="list-check">
    Text-to-video, image-to-video (first/last frame), reference-to-video (image, video, audio) and video editing share one model ID and one endpoint, distinguished by the `type` in `input.media[]`.
  </Card>

  <Card title="Up to 30 seconds" icon="clock">
    Up to 30 seconds per request (input reference video + output combined) — double Wan2.7's 15 seconds, enough for a full voice-over segment or a short-drama shot.
  </Card>

  <Card title="Native audio" icon="volume-2">
    Output ships with a `soun` track by default, no driving audio required. Use `reference_audio` when you want a specific voice timbre.
  </Card>

  <Card title="Three resolution tiers" icon="expand">
    The new 480P tier costs a quarter of 1080P — draft cheaply, then upscale for the final render.
  </Card>
</CardGroup>

## Group setup

Wan3.0 shares the **`Wan&HappyHorse` group** with Wan2.7 and [HappyHorse](/en/api-capabilities/happyhorse/overview) — one key calls them all. Video is billed **per second**, so your key must satisfy two conditions to route successfully:

1. **Billing mode**: choose "Pay-as-you-go priority" or "Pay-as-you-go" — per-second video **cannot route on a per-call key**
2. **Group**: include `Wan&HappyHorse`

<Frame caption="Create a key: set billing mode to pay-as-you-go priority and select the Wan&HappyHorse group (0.14x) to call every Wan3.0 / Wan2.7 / HappyHorse video model (the screenshot shows the old group name Wan)">
  <img src="https://mintcdn.com/apiyillc/5-SttsT0c5VQwgVz/images/wan-token-group-setup-20260523.png?fit=max&auto=format&n=5-SttsT0c5VQwgVz&q=85&s=f46887cb88777eb34d70837983f1fc49" alt="Token creation screen: billing mode set to pay-as-you-go priority, group dropdown set to Wan&HappyHorse (0.14x)" width="1286" height="988" data-path="images/wan-token-group-setup-20260523.png" />
</Frame>

## Pricing

<Info>
  **98% of Alibaba's official price by default — as low as 81.7% with the highest top-up bonus.**
  That puts 480P at **\$0.0245/sec** (≈ ¥0.17/sec) and 720P at **\$0.049/sec** (≈ ¥0.34/sec) for `wan3.0-video`.
</Info>

### How the rate is derived: 0.98x by default, as low as 0.817x with bonuses

The console shows the `Wan&HappyHorse` group at a **0.14x** multiplier, denominated in **CNY**. APIYI settles in **USD at a fixed 1:7 exchange rate**:

```
0.14 (CNY-denominated unit) × 7 (fixed rate) = 0.98
```

So **APIYI price per second (USD) = Alibaba's official CNY price per second × 0.14**, which is 98% of the official rate.

### Table 1: APIYI pricing in detail (billed per second)

| Model | Resolution | Default | With 10% bonus | **With 20% bonus** | 20%-bonus price in CNY |
| - | - | - | - | - | - |
| `wan3.0-video` | 480P | \$0.0294/sec | \$0.0267/sec | **\$0.0245/sec** | ¥0.1715/sec |
| `wan3.0-video` | 720P | \$0.0588/sec | \$0.0535/sec | **\$0.049/sec** | ¥0.343/sec |
| `wan3.0-video` | 1080P | \$0.1176/sec | \$0.1069/sec | **\$0.098/sec** | ¥0.686/sec |
| `wan3.0-video-prime` | 480P | \$0.063/sec | \$0.0573/sec | **\$0.0525/sec** | ¥0.3675/sec |
| `wan3.0-video-prime` | 720P | \$0.126/sec | \$0.1145/sec | **\$0.105/sec** | ¥0.735/sec |
| `wan3.0-video-prime` | 1080P | \$0.252/sec | \$0.2291/sec | **\$0.21/sec** | ¥1.47/sec |

| Tier | Share of Alibaba's official price | Formula |
| - | - | - |
| Default | **98%** | 0.14x multiplier × fixed rate 7 |
| 10% top-up bonus (standard) | **\~89.1%** | 0.98 ÷ 1.1 |
| 20% top-up bonus (large accounts) | **\~81.7%** | 0.98 ÷ 1.2 |

"With 10% / 20% bonus" is the **effective unit price** after a [top-up bonus](/en/faq/recharge-promotions) scales your credited balance — the amount deducted on each call is still the default price.

### Table 2: Tier-by-tier against Alibaba's official pricing

| Model | Resolution | Official list | Official current | APIYI default (CNY) | vs official | **With 20% bonus** |
| - | - | - | - | - | - | - |
| `wan3.0-video` | 480P | ¥0.30/sec | **¥0.21/sec** | ¥0.2058/sec | 98% | **¥0.1715/sec · 81.7%** |
| `wan3.0-video` | 720P | ¥0.60/sec | **¥0.42/sec** | ¥0.4116/sec | 98% | **¥0.343/sec · 81.7%** |
| `wan3.0-video` | 1080P | ¥1.20/sec | **¥0.84/sec** | ¥0.8232/sec | 98% | **¥0.686/sec · 81.7%** |
| `wan3.0-video-prime` | 480P | ¥0.45/sec | ¥0.45/sec | ¥0.441/sec | 98% | **¥0.3675/sec · 81.7%** |
| `wan3.0-video-prime` | 720P | ¥0.90/sec | ¥0.90/sec | ¥0.882/sec | 98% | **¥0.735/sec · 81.7%** |
| `wan3.0-video-prime` | 1080P | ¥1.80/sec | ¥1.80/sec | ¥1.764/sec | 98% | **¥1.47/sec · 81.7%** |

<Info>
  `wan3.0-video` currently carries an official **limited-time 30% discount** (applied to all users by default), and APIYI pricing follows the discounted rate. `wan3.0-video-prime` has no discount. APIYI pricing will be adjusted when the promotion ends.
</Info>

### Table 3: Total cost for common durations

| Model | Resolution | 5 sec | 10 sec | 30 sec (max) |
| - | - | - | - | - |
| `wan3.0-video` | 480P | \$0.147 | \$0.294 | \$0.882 |
| `wan3.0-video` | 720P | \$0.294 | \$0.588 | \$1.764 |
| `wan3.0-video` | 1080P | \$0.588 | \$1.176 | \$3.528 |
| `wan3.0-video-prime` | 480P | \$0.315 | \$0.63 | \$1.89 |
| `wan3.0-video-prime` | 720P | \$0.63 | \$1.26 | \$3.78 |
| `wan3.0-video-prime` | 1080P | \$1.26 | \$2.52 | \$7.56 |

### Stacking top-up bonuses

With a [top-up bonus](/en/faq/recharge-promotions), credited balance scales by up to \~1.2x, pushing the effective rate lower:

```
0.98 ÷ 1.2 ≈ 0.816
```

| Tier | Effective price (vs Alibaba official) | Formula |
| - | - | - |
| Default | **98%** | 0.14x multiplier × fixed rate 7 |
| 10% top-up bonus (standard) | **\~89.1%** | 0.98 ÷ 1.1 |
| 20% top-up bonus (large accounts, highest tier) | **\~81.7%** | 0.98 ÷ 1.2 |

1:7 is a **fixed settlement rate** (not a promotional rate) and applies to all USD top-ups.

<Note>Prices match the provider's official rates and may change along with them; the table above is for reference only, and the **Model Pricing** tab in the top navigation is authoritative: [Model Pricing](/en/models/index).</Note>

## ⚠️ Billing rules (different from other video models)

<Warning>
  **Billed seconds = input reference video duration + output video duration.** Per Alibaba: "Both input and output video are billed by duration; the unit price is determined by the output resolution."
</Warning>

| Rule | Detail |
| - | - |
| Reference **video** seconds are billed | A 10-second `reference_video` with a 2-second output bills **12 seconds** |
| Reference **images / audio / files** are free | Only video material counts toward billed duration |
| Unit price follows the **output** resolution | A 720P input with 1080P output bills the whole thing at the 1080P rate |
| 30-second combined cap | Input + output above 30 seconds is rejected upstream |
| No `duration` passed | Defaults to a 5-second output, billed as 5 seconds |
| Failed tasks | **Fully refunded**, no support ticket needed |

<Tip>
  To cut cost, **trim the reference video** — lowering `duration` does nothing for the input seconds. Example: a 10-second reference plus a 2-second output bills 12 seconds; trimming the reference to 3 seconds bills only 5.
</Tip>

### Pre-authorization and settlement

* **Without a reference video**: the requested `duration` is charged up front and that is the final amount — no settlement entry.
* **With a reference video**: at submit time the gateway does not yet know how long your input video is, so it pre-authorizes at the **30-second cap**, then recalculates against the actual billed seconds and refunds the difference (a separate negative entry on your bill).

<Info>
  The cap-based hold temporarily freezes a larger amount: \$0.147 at 480P, \$0.294 at 720P, \$0.588 at 1080P (`wan3.0-video`, 30 seconds). Keep enough balance available; the refund lands within seconds of task completion.
</Info>

## ⚠️ Endpoint choice (most important)

APIYI exposes two paths, but **only the DashScope passthrough endpoint works fully with Wan3.0**:

| Path | Protocol style | Availability | Verdict |
| - | - | - | - |
| `/v1/videos` | OpenAI flat style | ❌ Media fields dropped, **and billing is inaccurate** | **Do not use** |
| `/wan/api/v1/services/aigc/video-generation/video-synthesis` | Native DashScope passthrough | ✅ Fully supported | **Always use this** |

<Warning>
  Ignore any doc or sample that submits Wan video jobs to `/v1/videos`. That path drops the `media` field, **ignores resolution and duration parameters, and overcharges**. Send every Wan3.0 request to `/wan/api/v1/...video-synthesis`.
</Warning>

## Async workflow

<Steps>
  <Step title="Create the task">
    `POST /wan/api/v1/services/aigc/video-generation/video-synthesis` with the `X-DashScope-Async: enable` header. Returns a `task_id` immediately.
  </Step>

  <Step title="Poll for status">
    `GET /v1/tasks/{task_id}` (with `Authorization`), every 5–10 seconds (**never below 3**), until `status` becomes `completed`.
  </Step>

  <Step title="Download the video">
    GET the `result_url` from the response directly — **without the `Authorization` header** (it is a signed OSS link; sending auth returns 403). Valid for 24 hours.
  </Step>
</Steps>

### Task states

| Status | Meaning | Next step |
| - | - | - |
| `submitted` | Queued | Keep polling |
| `in_progress` | Generating | Keep polling (progress often sits at 30% — coarse upstream reporting, not a stall) |
| `completed` | Done | Download from `result_url` |
| `failed` | Failed | Check `error.message` / `fail_reason`; **not billed** |

<Warning>
  The terminal values are **`completed` / `failed`**, not DashScope's native `SUCCEEDED` / `FAILED`. Code written against the native enum will poll forever.
</Warning>

<Tip>
  **Invalid parameters also return HTTP 200 first and fail asynchronously** — not a synchronous 400. An unreachable media URL or an input+output total above 30 seconds only surfaces once you poll to the terminal state. Never trust the submit status code alone.
</Tip>

### Complete Python client

```python theme={null}
import json, time, urllib.request

BASE = "https://api.apiyi.com"
KEY  = "sk-your-api-key"   # your APIYI key

def post(path, body):
    h = {"Authorization": f"Bearer {KEY}", "Content-Type": "application/json",
         "X-DashScope-Async": "enable"}
    req = urllib.request.Request(BASE + path, data=json.dumps(body).encode(), headers=h, method="POST")
    return json.loads(urllib.request.urlopen(req).read())

def get(path):
    req = urllib.request.Request(BASE + path, headers={"Authorization": f"Bearer {KEY}"})
    return json.loads(urllib.request.urlopen(req).read())

# 1. Create the task (switch modes by changing input.media only — model ID stays the same)
r = post("/wan/api/v1/services/aigc/video-generation/video-synthesis", {
    "model": "wan3.0-video",
    "input": {"prompt": "A lighthouse by the sea at dusk, slow dolly-in, waves on the rocks, seagulls"},
    "parameters": {"resolution": "720P", "ratio": "16:9", "duration": 5, "prompt_extend": True}
})
task_id = r["output"]["task_id"]
print("task_id:", task_id)

# 2. Poll every 5–10 seconds
while True:
    info = get(f"/v1/tasks/{task_id}")
    status = info["status"]
    print("status:", status, "progress:", info.get("progress"))
    if status == "completed":
        url = info["result_url"]
        break
    if status == "failed":
        raise RuntimeError(info.get("error") or info.get("fail_reason"))
    time.sleep(10)

# 3. Download (no Authorization header! result_url is a signed OSS link)
urllib.request.urlretrieve(url, "out.mp4")
print("saved out.mp4")
```

## Parameter reference

The request body uses the nested DashScope structure: `{ model, input: { prompt, media[] }, parameters: {...} }`.

### `input` fields

| Field | Type | Required | Description |
| - | - | - | - |
| `prompt` | string | ✓ | Natural-language description. With multiple assets, refer to them as "image 1 / video 1" in the prompt |
| `negative_prompt` | string | | Negative prompt |
| `media` | array | Required for non-text-to-video | Media asset array, see below |

### `media[]` types and the mode they select

| `type` | Mode | Notes |
| - | - | - |
| no `media` | **Text-to-video** | Prompt only |
| `first_frame` | **Image-to-video** | Uses this image as the first frame |
| `last_frame` | First/last-frame video | Pairs with `first_frame` |
| `reference_image` | **Reference-to-video** | Keeps subject / outfit / scene consistent |
| `reference_video` | Reference-to-video / editing | **This video's duration is billed** |
| `reference_audio` | Voice / rhythm reference | Not billed |
| `file` / `link` | Document or web page to video | Not billed |

<Warning>
  **`first_frame` / `last_frame` cannot be mixed with `reference_*` / `file` / `link`** — the two asset families are mutually exclusive and mixing them is rejected upstream.
</Warning>

Every media object needs at least `type` and `url`. The `url` must be a publicly reachable https link (upload local files to OSS / a CDN first, and **keep them reachable until the task finishes**).

### `parameters` fields

| Field | Type | Values | Description |
| - | - | - | - |
| `resolution` | string | `480P` / `720P` / `1080P` | Uppercase. **Set it explicitly** — it determines the unit price |
| `ratio` | string | `16:9` / `9:16` / `1:1` / `4:3` / `3:4` / `adaptive` | Aspect ratio; ignored when a first frame is supplied |
| `duration` | int | Integer seconds | Output length; defaults to 5. **Input + output must total ≤ 30** |
| `prompt_extend` | bool | `true` / `false` | Prompt rewriting, defaults to `true` — **keep it on** |
| `audio` | bool | `true` / `false` | Whether to output an audio track, defaults to `true` |
| `watermark` | bool | `true` / `false` | "AI generated" watermark in the lower-right corner |
| `seed` | int | 0–2147483647 | Fixing it improves reproducibility |

<Tip>
  `duration` must be an **integer** (`5`, not `"5"`), and `resolution` is more reliable in **uppercase** (`720P`).
</Tip>

## Choosing: Wan3.0 / Wan2.7 / HappyHorse

| Scenario | Pick |
| - | - |
| Need 30-second clips, a cheap 480P tier, or native audio | **Wan3.0** |
| Need audio-driven lip sync (`driving_audio`) | [Wan2.7 `i2v`](/en/api-capabilities/wan/overview) |
| Latency-sensitive production traffic | **`wan3.0-video-prime`** |
| Want a lower unit price for similar capabilities | [HappyHorse](/en/api-capabilities/happyhorse/overview) |

## Best practices

<AccordionGroup>
  <Accordion title="Iterate at 480P, render the final cut at 1080P" icon="wallet">
    480P costs a quarter of 1080P. Nail the prompt and camera movement cheaply — the price of one 5-second 1080P render buys four drafts.
  </Accordion>

  <Accordion title="Trim reference videos before uploading" icon="scissors">
    Input video seconds are billed. If you only need 3 seconds of a clip, do not upload the 30-second original — this is the easiest cost trap on Wan3.0.
  </Accordion>

  <Accordion title="Describe motion, not just the picture" icon="pen-line">
    Video models respond to "who does what, and how the camera moves". "A ginger cat stretching on a windowsill, slow dolly-in" beats "a cute ginger cat, sunlight, high definition".
  </Accordion>

  <Accordion title="Never poll faster than every 3 seconds" icon="timer">
    Measured delivery for a 5-second clip: \~100 sec at 480P, \~120 sec at 720P, \~170 sec at 1080P. Polling every 5–10 seconds is plenty.
  </Accordion>

  <Accordion title="Do not auto-retry the same prompt on failure" icon="repeat">
    Failed tasks are refunded in full, but resubmitting **bills again**. For moderation failures change the prompt; for asset failures check URL reachability first.
  </Accordion>
</AccordionGroup>

## FAQ

<AccordionGroup>
  <Accordion title="Why are the billed seconds longer than my output video?">
    Billed seconds = **input reference video duration + output duration**. A 10-second reference with a 2-second output bills 12 seconds. Reference images, audio and files are free.
  </Accordion>

  <Accordion title="Why was a large amount charged at submit and then refunded?">
    Tasks with a reference video pre-authorize at the 30-second cap, then settle against actual billed seconds and refund the difference. You will see a negative adjustment entry on your bill.
  </Accordion>

  <Accordion title="The task stays in_progress with progress stuck at 30%?">
    That is coarse upstream reporting, not a stall. 1080P or long clips can take 3–5 minutes. Keep polling.
  </Accordion>

  <Accordion title="result_url returns 403 on download?">
    Do **not** send the `Authorization` header — it is a signed OSS link. Links expire after 24 hours, so re-host promptly.
  </Accordion>

  <Accordion title="Submit returned 200 but the task failed?">
    Parameter and asset errors fail asynchronously, not as a synchronous 400. Common causes: unreachable media URL (including expired signed links), input + output above 30 seconds, content moderation. Failed tasks are fully refunded.
  </Accordion>

  <Accordion title="Getting &#x22;no available channel for this model&#x22;?">
    Check that your key's **billing mode** is pay-as-you-go (per-call keys cannot route video models) and that its **group** includes `Wan&HappyHorse`.
  </Accordion>
</AccordionGroup>

## Related documentation

<CardGroup cols={2}>
  <Card title="Video Generation API reference" icon="code" href="/en/api-capabilities/wan3/video-generation">
    Live Playground plus cURL / Python / Node samples
  </Card>

  <Card title="Wan2.7 Video Generation" icon="video" href="/en/api-capabilities/wan/overview">
    The previous four-model generation, with audio-driven lip sync
  </Card>

  <Card title="HappyHorse Video Generation" icon="horse" href="/en/api-capabilities/happyhorse/overview">
    The other video series in the same group
  </Card>

  <Card title="Model Pricing" icon="dollar-sign" href="/en/models/index">
    Authoritative site-wide pricing table
  </Card>
</CardGroup>

Official references: `help.aliyun.com/zh/model-studio/wan3-video-generation-guide`, `help.aliyun.com/zh/model-studio/wan3-video-generation-api-reference`


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.