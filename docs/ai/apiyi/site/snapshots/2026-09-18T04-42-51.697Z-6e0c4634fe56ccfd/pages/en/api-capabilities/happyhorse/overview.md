> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# HappyHorse Video Generation (Alibaba Cloud)

> Complete guide to the Alibaba Cloud HappyHorse-1.1 video generation series: Text-to-Video / Image-to-Video / Reference-to-Video (up to 9 reference images) / Video Edit, unified DashScope async endpoint, high-fidelity subject preservation.

## Overview

**HappyHorse (快马)** is Alibaba's video generation model series, focused on **high-fidelity dynamic video generation** — it precisely understands text semantics and outputs smooth, natural, detail-rich, high-quality videos that keep subjects stable. APIYI connects directly through the **DashScope passthrough channel**, so a single APIYI Key lets you call every HappyHorse capability. The current flagship version, **HappyHorse-1.1** (Video Edit remains 1.0), covers four core use cases:

| Use case               | Model ID                    | Your input                                     | Output                                                     |
| ---------------------- | --------------------------- | ---------------------------------------------- | ---------------------------------------------------------- |
| **Text-to-Video**      | `happyhorse-1.1-t2v`        | A text prompt                                  | Short video                                                |
| **Image-to-Video**     | `happyhorse-1.1-i2v`        | First-frame image + prompt                     | Brings a still image to life (**no audio-driven support**) |
| **Reference-to-Video** | `happyhorse-1.1-r2v`        | Up to 9 reference images + prompt              | Video with high-fidelity subject and scene preservation    |
| **Video Edit**         | `happyhorse-1.0-video-edit` | Video + up to 5 reference images + instruction | Locally/globally edited video                              |

<Note>
  **🐎 Key highlight**: All four capabilities share the same async endpoint and the same request structure — **switching use cases only changes the `model` field**. HappyHorse leans toward "high-fidelity dynamic video"; Reference-to-Video supports **up to 9 reference images** and Video Edit supports **up to 5 reference images**, with strong subject consistency. It shares the same endpoint as the [Wan series](/en/api-capabilities/wan/overview) and is directly interchangeable.
</Note>

<CardGroup cols={2}>
  <Card title="Text-to-Video API" icon="wand-sparkles" href="/en/api-capabilities/happyhorse/text-to-video">
    `happyhorse-1.1-t2v`, generate video from a pure text prompt.
  </Card>

  <Card title="Image-to-Video API" icon="image" href="/en/api-capabilities/happyhorse/image-to-video">
    `happyhorse-1.1-i2v`, generate video from a first-frame image (no audio-driven).
  </Card>

  <Card title="Reference-to-Video API" icon="users" href="/en/api-capabilities/happyhorse/reference-to-video">
    `happyhorse-1.1-r2v`, up to 9 reference images to preserve the subject.
  </Card>

  <Card title="Video Edit API" icon="scissors" href="/en/api-capabilities/happyhorse/video-edit">
    `happyhorse-1.0-video-edit`, edit video with up to 5 reference images.
  </Card>
</CardGroup>

## Let an AI Agent Do the Integration

<Note>
  If you build with Codex / Claude Code / Cursor, copy the prompt below and hand it to your agent. It first fetches the plain-text version of this page (append `.md` to any docs URL), then writes code in your project's own stack — async polling, **why `/v1/videos` must not be used**, the missing-`X-DashScope-Async` error and the integer `duration` rule are already baked into the requirements.
</Note>

<Prompt description="Have a coding agent integrate or troubleshoot HappyHorse text-to-video, image-to-video, reference-to-video and video editing. Copy and paste into Codex, Claude Code, Cursor and similar tools." icon="bot" actions={["copy"]}>
  Integrate / troubleshoot HappyHorse video generation (text-to-video, image-to-video, reference-to-video, video editing) in this project.

  Read the docs before you touch code: fetch [https://docs.apiyi.com/en/api-capabilities/happyhorse/overview.md](https://docs.apiyi.com/en/api-capabilities/happyhorse/overview.md) for the plain-text version of this page. Each of the four capabilities has its own page (text-to-video, image-to-video, reference-to-video, video-edit) — same `.md` suffix.

  Requirements:

  1. Endpoint and async header (**the two things most likely to block you immediately**): submissions must go to `POST /wan/api/v1/services/aigc/video-generation/video-synthesis` and **must carry the header `X-DashScope-Async: enable`**. **Never use `/v1/videos`** — that route drops the `media` field and the upstream then reports `[InvalidParameter] Field required: input.media`. Polling uses a **different prefix**: `GET /v1/tasks/{task_id}`, and it does need an `Authorization` header.

  2. Polling and status: the task ID is at **`output.task_id`** in the submit response. Poll every 5 to 10 seconds and **never faster than 3 seconds**, or you get rate limited; give the client an overall 20-minute ceiling — a 720P 5-second clip typically takes about 105 to 115 seconds, and 1080P or longer videos take noticeably more. In the polling response the status is `submitted`, `in_progress`, `completed` or `failed`, and **success is `completed`**. A `progress` value stuck at 30 percent for a long time is normal — the upstream reports coarsely — so do not treat it as a hang. The task ID is valid for **24 hours**.

  3. Getting the video: the address is **`result_url`** in the polling response, an OSS signed link that **expires in 24 hours**. **Download it server-side immediately and re-host it in your own object storage or CDN**; never keep it as a long-term address. Do **not** send an `Authorization` header when downloading it — doing so returns 403 instead.

  4. Body shape and types: the body is DashScope's nested form, `{ model, input: { prompt, media[] }, parameters: { ... } }`, not a flat object. Two type traps: **`duration` must be the integer `5`, never the string `"5"`**, and **`resolution` must be uppercase `720P` or `1080P`** — this model has **no 480P tier**.

  5. Model names and parameters: the four models are `happyhorse-1.1-t2v`, `happyhorse-1.1-i2v`, `happyhorse-1.1-r2v` and `happyhorse-1.0-video-edit` — note the editing model is **`video-edit` with a hyphen**, the opposite of Wan's `videoedit`, so do not mix them up. `duration` is an integer from 2 to 15, defaulting to 5; `resolution` defaults to `720P`; `prompt_extend` defaults to `true` and is best left on. Two things to watch: **HappyHorse image-to-video does not support `driving_audio`** (that is a Wan-only capability), so sending it does nothing; and **video editing takes its output length from the source video, with `duration` having no effect**, so normally you just omit it.

  6. Media inputs: these live in `input.media[]`, each entry shaped `{"type": ..., "url": ...}`, where `url` must be a **publicly GET-able https link** (JPEG, PNG or WEBP) — upload local files to your own object storage first. Types and counts per capability: image-to-video needs exactly 1 `first_frame`; reference-to-video needs 1 to 9 `reference_image` entries; video editing needs 1 `video` plus 1 to 5 `reference_image` entries. Omitting `media` makes the upstream complain that an image-to-video model requires an image.

  7. Billing and idempotency: **billing is per second, tiered by resolution**, with 1080P notably pricier than 720P; video editing bills by the actual output seconds (following the source video, not `duration`). A task that ends `failed` is **not billed**, but **resubmitting the same task bills again** — build idempotency in rather than blindly auto-retrying. Errors come in two phases: rejection at submission (HTTP 4xx/5xx with a `type` such as `task_error` or `parse_request_failed`) means the request body is wrong, so fix it instead of retrying; failure during execution shows up as a `failed` task whose `error.message` carries a bracketed prefix, where `[InvalidImageUrl]` may just be a temporarily unreachable media link and is worth a retry, while `[InvalidParameter]` or a sensitive-word rejection **must not be retried**. Use exponential backoff for 5xx and network errors.

  8. Token requirements: this model needs a token carrying the `Wan&HappyHorse` group with a **pay-as-you-go or PAYG-priority** billing mode — **a per-call token cannot route to it**.

  9. Read the key from the `APIYI_API_KEY` environment variable. Never hardcode it, never commit it to git.

  10. When you are done, actually run one text-to-video call and one image-to-video call, then show me the videos and what those two calls cost. Note the whole flow takes several minutes, so if you run in a constrained execution environment, raise the command timeout above 600 seconds or run it in the background.
</Prompt>

<Accordion title="What this prompt saves you from">
  | Requirement                                | Pitfall it prevents                                                                                                                                         |
  | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | Never use `/v1/videos`                     | That route silently drops `media`, and the upstream complaint about a missing `input.media` reads like a parameter bug when it is really the wrong endpoint |
  | The `X-DashScope-Async` header             | Without it the call is treated as synchronous and rejected outright                                                                                         |
  | Submit and poll prefixes differ            | Submission is under `/wan/api/v1/...` while polling is at `/v1/tasks/{task_id}`                                                                             |
  | The model name is `video-edit`, hyphenated | Wan's equivalent is `wan2.7-videoedit` with no hyphen — the easiest thing to get wrong when integrating both families                                       |
  | i2v has no `driving_audio`                 | That capability is Wan-only, so copying Wan code sends a field that does nothing                                                                            |
  | Resubmission bills again                   | Failures are free, but blind retries cost real money — you need your own idempotency                                                                        |
  | Download without `Authorization`           | Sending auth to an OSS signed link returns 403, and the link expires in 24 hours                                                                            |
</Accordion>

## Why Choose APIYI for HappyHorse

<CardGroup cols={2}>
  <Card title="One Key for all capabilities" icon="key">
    No Alibaba Cloud sign-up, no region configuration. A single APIYI Key calls all four HappyHorse capabilities plus the [Wan series](/en/api-capabilities/wan/overview).
  </Card>

  <Card title="Direct access, no VPN needed" icon="globe">
    Connect directly to `api.apiyi.com`, accessible from domestic data centers and home broadband.
  </Card>

  <Card title="No charge on failure" icon="circle-check">
    Tasks that enter the `failed` state (unreachable media URL, sensitive prompt, etc.) are **not billed**, so retry with confidence.
  </Card>

  <Card title="DashScope protocol passthrough" icon="plug">
    Shares the same endpoint and schema as the Wan series; existing Wan code can call HappyHorse just by changing the `model` name.
  </Card>
</CardGroup>

## Core Features

<CardGroup cols={2}>
  <Card title="Four-in-one async endpoint" icon="list-check">
    t2v / i2v / r2v / video-edit share `POST /wan/api/v1/...video-synthesis`; after submission it returns a `task_id`, then you poll and download.
  </Card>

  <Card title="High-fidelity subject preservation" icon="target">
    The model leans toward a "high-fidelity dynamic video" style, keeping people/objects more stable throughout motion.
  </Card>

  <Card title="Up to 9 reference images" icon="images">
    `happyhorse-1.1-r2v` officially supports up to 9 `reference_image` entries, giving stronger subject consistency in multi-reference scenarios.
  </Card>

  <Card title="Multiple resolutions and durations" icon="expand">
    720P / 1080P resolutions, integer durations of 2–15 seconds, and `prompt_extend` smart rewriting to improve the quality of short prompts.
  </Card>
</CardGroup>

## Supported Models

| Model ID                    | Capability         | Required media input                  | Notes                                |
| --------------------------- | ------------------ | ------------------------------------- | ------------------------------------ |
| `happyhorse-1.1-t2v`        | Text-to-Video      | None                                  | Pure text generation                 |
| `happyhorse-1.1-i2v`        | Image-to-Video     | `first_frame`                         | **Does not support** `driving_audio` |
| `happyhorse-1.1-r2v`        | Reference-to-Video | `reference_image` (up to 9)           | Multi-reference subject preservation |
| `happyhorse-1.0-video-edit` | Video Edit         | `video` + `reference_image` (up to 5) | Model name **has a hyphen**          |

## ⚠️ Endpoint Selection (Most Important)

APIYI mounts two paths simultaneously, and **only the DashScope passthrough endpoint is fully usable for all HappyHorse capabilities**:

| Path                                                         | Protocol style               | i2v / r2v availability     | Conclusion              |
| ------------------------------------------------------------ | ---------------------------- | -------------------------- | ----------------------- |
| `/v1/videos`                                                 | OpenAI flat style            | ❌ Media fields are dropped | **Do not use**          |
| `/wan/api/v1/services/aigc/video-generation/video-synthesis` | DashScope native passthrough | ✅ Fully usable             | **Always use this one** |

<Warning>
  HappyHorse and Wan share the same passthrough endpoint. If you see any doc/example submitting a video task via `/v1/videos`, **ignore it**. All create requests go through `/wan/api/v1/...video-synthesis`, and all queries go through `/v1/tasks/{task_id}`.
</Warning>

## Async Call Flow

The whole flow is asynchronous, in three steps: **create task → poll status → download video**.

<Steps>
  <Step title="Create task">
    `POST /wan/api/v1/services/aigc/video-generation/video-synthesis`, with the request header `X-DashScope-Async: enable`. It immediately returns a `task_id`.
  </Step>

  <Step title="Poll status">
    `GET /v1/tasks/{task_id}` (with `Authorization`), querying every 5–10 seconds (**not less than 3 seconds**), until `status` becomes `completed`.
  </Step>

  <Step title="Download video">
    GET the mp4 directly from the `result_url` in the response, **without the `Authorization` header** (it's a signed OSS direct link; including Auth will cause a 403).
  </Step>
</Steps>

### Task Status Reference

| Status        | Meaning           | Next step                                                                                                          |
| ------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| `submitted`   | Submitted, queued | Keep polling                                                                                                       |
| `in_progress` | Generating        | Keep polling (progress often stalls at 30% — that's the upstream's coarse reporting granularity, not a stuck task) |
| `completed`   | Succeeded         | Download from `result_url`                                                                                         |
| `failed`      | Failed            | Check `error.message` / `fail_reason`                                                                              |

### Complete Python Client

```python theme={null}
import json, time, urllib.request

BASE = "https://api.apiyi.com"
KEY  = "sk-your-api-key"   # Your APIYI Key

def post(path, body):
    h = {"Authorization": f"Bearer {KEY}", "Content-Type": "application/json",
         "X-DashScope-Async": "enable"}
    req = urllib.request.Request(BASE + path, data=json.dumps(body).encode(), headers=h, method="POST")
    return json.loads(urllib.request.urlopen(req).read())

def get(path):
    req = urllib.request.Request(BASE + path, headers={"Authorization": f"Bearer {KEY}"})
    return json.loads(urllib.request.urlopen(req).read())

# 1. Create task (switching use cases only changes model and media)
r = post("/wan/api/v1/services/aigc/video-generation/video-synthesis", {
    "model": "happyhorse-1.1-t2v",
    "input": {"prompt": "A cat running across a meadow, bright sunshine, camera following"},
    "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True, "watermark": True}
})
task_id = r["output"]["task_id"]
print("task_id:", task_id)

# 2. Poll (every 5-10 seconds)
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

# 3. Download (do NOT include Authorization! result_url is a signed OSS direct link)
urllib.request.urlretrieve(url, "out.mp4")
print("saved out.mp4")
```

## Key Parameters Explained

When submitting, the body uses the DashScope nested structure: `{ model, input: { prompt, media[] }, parameters: {...} }`.

### `media[]` Types

| `type`            | Purpose                                                   | Applicable models |
| ----------------- | --------------------------------------------------------- | ----------------- |
| `first_frame`     | First-frame image (≤1)                                    | i2v, r2v          |
| `reference_image` | Reference image (up to 9 for r2v, up to 5 for video-edit) | r2v, video-edit   |
| `video`           | Input video                                               | video-edit        |

<Warning>
  HappyHorse's i2v **does not support `driving_audio`** (audio-driven is a capability exclusive to [Wan2.7-i2v](/en/api-capabilities/wan/image-to-video)). For lip-sync / rap, use Wan2.7.
</Warning>

### `parameters` Fields

| Field           | Type   | Values           | Notes                                                   |
| --------------- | ------ | ---------------- | ------------------------------------------------------- |
| `resolution`    | string | `720P` / `1080P` | Uppercase, explicit specification recommended           |
| `duration`      | int    | 2–15             | Seconds (integer), commonly 5 / 10                      |
| `prompt_extend` | bool   | `true` / `false` | Smart prompt rewriting, **strongly recommended `true`** |
| `watermark`     | bool   | `true` / `false` | "AI Generated" watermark in the bottom-right corner     |
| `seed`          | int    | 0–2147483647     | Fixing it improves reproducibility                      |

<Tip>
  `duration` must be an **integer** `5`, not the string `"5"`; writing `resolution` in **uppercase** `720P` is more reliable.
</Tip>

## How to Choose HappyHorse vs. Wan

HappyHorse and [Wan](/en/api-capabilities/wan/overview) are both Alibaba video models that share the same endpoint and schema (interchangeable by just changing the `model` name), but they emphasize different things:

| Dimension                   | HappyHorse-1.1                               | Wan2.7                                            |
| --------------------------- | -------------------------------------------- | ------------------------------------------------- |
| Audio-driven lip-sync (i2v) | ❌ Not supported, i2v is first-frame only     | ✅ `wan2.7-i2v` supports `driving_audio`           |
| Reference-to-Video limit    | Up to 9 reference images                     | Reference images + reference videos combined ≤5   |
| Video Edit reference images | ≤5                                           | ≤5                                                |
| Style emphasis              | High-fidelity dynamic video, stable subjects | Multi-subject interaction, voice timbre reference |

<Tip>
  **Need multiple reference images to keep the subject consistent** → choose `happyhorse-1.1-r2v` (up to 9).
  **Need lip-sync / rap / digital-human voiceover** → choose [Wan2.7-i2v](/en/api-capabilities/wan/image-to-video) (the only one that supports audio-driven).
</Tip>

## Best Practices

<Steps>
  <Step title="Iterate first at 720P / 5 seconds">
    During development, use low-resolution short videos to quickly validate prompts and reference images, then scale up resolution and duration once finalized.
  </Step>

  <Step title="Always enable prompt_extend">
    `prompt_extend: true` noticeably improves quality for short prompts.
  </Step>

  <Step title="Poll every 5-10 seconds">
    Do not go below 3 seconds (you'll be rate-limited). Each HappyHorse capability at 720P / 5 seconds typically takes 105–115 seconds.
  </Step>

  <Step title="Set a 20-minute client timeout as a safety net">
    1080P or long videos are significantly slower; set a 20-minute fallback timeout on the polling loop.
  </Step>

  <Step title="Download immediately once you get result_url">
    `result_url` **expires in 24 hours** by default, and it is a signed OSS direct link — do **not** include the Authorization header when downloading.
  </Step>
</Steps>

## Error Codes and Retries

| Source                                                   | Characteristics                                                                                                         | Handling                                                                        |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Create stage (rejected by APIYI)**                     | HTTP 4xx/5xx, with `type` of `task_error` / `parse_request_failed` / `build_request_failed`                             | Fix the body and retry (wrong field type, missing media, wrong endpoint)        |
| **Execution stage (rejected by upstream Alibaba Cloud)** | Task `status=failed`, with `error.message` prefixed by a bracketed code like `[InvalidParameter]` / `[InvalidImageUrl]` | Read the bracketed hint; usually an unreachable media URL or a sensitive prompt |

<Info>
  **Recommended client behavior**: use exponential backoff retries for HTTP 5xx / network errors; surface HTTP 4xx immediately without retrying; a `failed` task with `[InvalidImageUrl]` is retryable, while `[InvalidParameter]` / sensitive-word failures are not.
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="Is there any difference in how HappyHorse and Wan are integrated?">
    **No.** They share the same DashScope passthrough endpoint, the same request structure, the same set of media type names, and the same query endpoint. **Switching only changes the `model` field** (e.g., `wan2.7-t2v` → `happyhorse-1.1-t2v`); the rest of the body stays identical.
  </Accordion>

  <Accordion title="Why can't HappyHorse's i2v do lip-sync?">
    `happyhorse-1.1-i2v` does not support the `driving_audio` (audio-driven) field; i2v only accepts `first_frame`. For lip-sync / rap / digital-human voiceover, use [Wan2.7-i2v](/en/api-capabilities/wan/image-to-video).
  </Accordion>

  <Accordion title="Can happyhorse-1.1-r2v really take 9 reference images?">
    Yes. Officially it supports up to 9 `reference_image` entries — just put them in the `media` array. More reference images give stronger consistency for the subject / clothing / scene.
  </Accordion>

  <Accordion title="Why can't I submit via /v1/videos?">
    `/v1/videos` has incomplete support for the `media` field of i2v / r2v, causing the upstream to report `[InvalidParameter] Field required: input.media`. **All create requests go through `/wan/api/v1/services/aigc/video-generation/video-synthesis`**, and queries go through `/v1/tasks/{task_id}`.
  </Accordion>

  <Accordion title="What if downloading result_url returns a 403?">
    Remove the `Authorization` header. `result_url` is already a signed OSS direct link; adding your APIYI Key gets it rejected by OSS instead. `result_url` expires in 24 hours by default, so download it promptly.
  </Accordion>

  <Accordion title="Are failed tasks billed?">
    `status=failed` is not billed. But resubmitting the same task bills again, so handle idempotency.
  </Accordion>
</AccordionGroup>

## Group Setup

The HappyHorse and [Wan](/en/api-capabilities/wan/overview) series **share a single `Wan&HappyHorse` group** — one Token can call both series. Video models are billed **per second**, so the Token must meet two conditions to route successfully:

1. **Billing model**: choose **Pay-as-you-go Priority** or **Pay-as-you-go** — video is billed per second, so **Pay-per-request Tokens cannot route**
2. **Group**: select a group that includes `Wan&HappyHorse`

<Frame caption="Create Token: set billing model to Pay-as-you-go Priority and group to Wan&HappyHorse (0.14x) to call every Wan2.7 and HappyHorse video model (the screenshot shows the group's former name Wan, since renamed to Wan&HappyHorse)">
  <img src="https://mintcdn.com/apiyillc/5-SttsT0c5VQwgVz/images/wan-token-group-setup-20260523.png?fit=max&auto=format&n=5-SttsT0c5VQwgVz&q=85&s=f46887cb88777eb34d70837983f1fc49" alt="Create Token dialog: billing model set to Pay-as-you-go Priority, group dropdown showing Wan&HappyHorse (rate 0.14x), one Token usable for both Wan2.7 and HappyHorse" width="1286" height="988" data-path="images/wan-token-group-setup-20260523.png" />
</Frame>

## Pricing

### Default price = 98％ of Alibaba's official price (simple to reason about)

**HappyHorse model prices are built into the APIYI system** — no manual configuration needed; the group discount applies automatically. In the console the `Wan&HappyHorse` group shows a rate of **0.14x**, which is denominated in the built-in **RMB** pricing unit. Because APIYI bills in **USD at a fixed 1:7 exchange rate**, the effective conversion is:

```
0.14 (RMB pricing unit) × 7 (fixed exchange rate) = 0.98
```

In other words, the **default price = 98% of Alibaba's official price** — cheaper than buying direct from Alibaba, with no overseas link to build yourself.

> Conversion: **USD price per second = official RMB price × 0.14** (i.e. `× 0.98 ÷ 7`).

### Price detail (default price, billed per second)

HappyHorse-1.1 text-to-video / image-to-video / reference-to-video are priced the same, with two tiers — `720P` / `1080P` (480P is not supported):

| Resolution | Official price | Our default /s | 5 s    | 10 s   | 12 s   |
| ---------- | -------------- | -------------- | ------ | ------ | ------ |
| `720P`     | ¥0.9/s         | \$0.126/s      | \$0.63 | \$1.26 | \$1.51 |
| `1080P`    | ¥1.6/s         | \$0.224/s      | \$1.12 | \$2.24 | \$2.69 |

<Info>
  * `happyhorse-1.0-video-edit` output duration follows the source video and is billed by actual output seconds, not by `duration`.
  * Prices shown are the **default (98% of official)**; with the maximum top-up bonus, the effective price is roughly the table value **÷ 1.2** (e.g. 1080P 5 s \$1.12 → about \$0.93).
</Info>

### Stack top-up bonuses for an even lower effective price

After joining the [top-up bonus program](/en/faq/recharge-promotions), credited balance can be boosted up to \~1.2x, pushing the effective price lower still:

```
0.98 ÷ 1.2 ≈ 0.816
```

So large customers can reach as low as **\~81% of the official price** (0.98 ÷ 1.2 ≈ 0.816).

| Tier                                               | Effective price (vs Alibaba official) | Formula                            |
| -------------------------------------------------- | ------------------------------------- | ---------------------------------- |
| Default                                            | **98%**                               | rate 0.14x × fixed exchange rate 7 |
| With top-up bonuses (max tier for large customers) | **\~81.6%**                           | 0.98 ÷ 1.2                         |

<Info>
  * Billing dimension = **resolution tier × duration (seconds)**; failed tasks are not billed.
  * 1:7 is a **fixed settlement exchange rate** (not a preferential rate); it applies uniformly to all USD top-ups.
  * For the highest bonus tiers and eligible channels, see [top-up bonuses](/en/faq/recharge-promotions). The latest rate is authoritative in the [console](https://api.apiyi.com/token).
</Info>

## Related Documentation

<CardGroup cols={2}>
  <Card title="Text-to-Video Playground" icon="wand-sparkles" href="/en/api-capabilities/happyhorse/text-to-video">
    `happyhorse-1.1-t2v` online debugging
  </Card>

  <Card title="Image-to-Video Playground" icon="image" href="/en/api-capabilities/happyhorse/image-to-video">
    `happyhorse-1.1-i2v` first-frame generation
  </Card>

  <Card title="Reference-to-Video Playground" icon="users" href="/en/api-capabilities/happyhorse/reference-to-video">
    `happyhorse-1.1-r2v` up to 9 reference images
  </Card>

  <Card title="Video Edit Playground" icon="scissors" href="/en/api-capabilities/happyhorse/video-edit">
    `happyhorse-1.0-video-edit` outfit swap / background swap
  </Card>

  <Card title="Wan Series" icon="video" href="/en/api-capabilities/wan/overview">
    Also Alibaba's, model selection comparison
  </Card>
</CardGroup>

<Info>
  The HappyHorse series is provided via the APIYI DashScope passthrough channel. For questions or suggestions, please submit a ticket in the [APIYI Console](https://api.apiyi.com).
</Info>
