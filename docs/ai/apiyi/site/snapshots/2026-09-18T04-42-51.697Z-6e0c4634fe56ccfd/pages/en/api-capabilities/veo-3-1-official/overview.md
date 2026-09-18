> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# VEO 3.1 Official Video Generation

> Complete guide to Google Veo 3.1 official-relay channel: transparent passthrough to Google AI Studio, per-request billing at $0.3 / $1.2, flexible 4 / 6 / 8 second durations, 720p / 1080p / 4k tiers, and zero-friction onboarding — no group or billing-mode switching required.

## Overview

**VEO 3.1 Official** is APIYI's **official-relay channel** for Google Veo 3.1 — a transparent passthrough to Google AI Studio's `veo-3.1-generate-preview` / `veo-3.1-fast-generate-preview` async endpoints, with model IDs, response fields, and constraints identical to the upstream. **Pay-per-request billing**, **callable on the `Default` group** — the lowest-friction official-quality Veo 3.1 channel available today.

<Note>
  **🎬 Highlights**: Transparent passthrough to Google AI Studio + native synchronized audio + flexible 4 / 6 / 8 second durations + three resolution tiers (720p / 1080p / 4k) + per-request billing from \$0.3 + **`Default` group + Pay-per-request or Pay-as-you-go Priority Tokens** (no dedicated group needed; pure Pay-as-you-go is not supported). **Suited for ad shorts, e-commerce assets, social-media content, and product demos** that need official-grade quality with the simplest possible onboarding.
</Note>

<Warning>
  **⚠️ No CDN URL returned — you must download the MP4 stream yourself**: The channel currently **does not return any distributable public / CDN URL**. Once `status: "completed"`, **call `GET /v1/videos/{task_id}/content` to fetch the MP4 binary** and store it in your own OSS / CDN before serving to end users. Browsers cannot hit `/content` directly (auth header required). See [API Endpoints](#api-endpoints) below.
</Warning>

<CardGroup cols={2}>
  <Card title="Text-to-Video API" icon="wand-sparkles" href="/en/api-capabilities/veo-3-1-official/text-to-video">
    `POST /v1/videos`, generate video from text only — JSON request body, the simplest entry point.
  </Card>

  <Card title="Image-to-Video API" icon="image" href="/en/api-capabilities/veo-3-1-official/image-to-video">
    `POST /v1/videos` + multipart upload of `input_reference` to animate a static image into a clip.
  </Card>

  <Card title="Official vs Reverse" icon="scale" href="/en/api-capabilities/veo-3-1-official/vs-veo-reverse">
    Decision matrix against the existing [VEO 3.1 (Reverse Channel)](/en/api-capabilities/veo/overview).
  </Card>

  <Card title="Visual API Testing" icon="flask-conical" href="https://icover.ai/veo-official">
    Debug this endpoint directly in the iCover visual testing tool — no code required.
  </Card>

  <Card title="Async Task Lookup / Download" icon="list-checks" href="https://api.apiyi.com/task">
    View submitted video tasks and download video links in the APIYI console — a lookup entry outside the API.
  </Card>
</CardGroup>

## Let an AI Agent Do the Integration

<Note>
  If you build with Codex / Claude Code / Cursor, copy the prompt below and hand it to your agent. It first fetches the plain-text version of this page (append `.md` to any docs URL), then writes code in your project's own stack — async polling, **the fact that you must pull the MP4 down yourself**, tiered timeouts and the hard 4K constraints are already baked into the requirements.
</Note>

<Prompt description="Have a coding agent integrate or troubleshoot VEO 3.1 Official text-to-video and image-to-video. Copy and paste into Codex, Claude Code, Cursor and similar tools." icon="bot" actions={["copy"]}>
  Integrate / troubleshoot VEO 3.1 Official text-to-video and image-to-video in this project.

  Read the docs before you touch code: fetch [https://docs.apiyi.com/en/api-capabilities/veo-3-1-official/overview.md](https://docs.apiyi.com/en/api-capabilities/veo-3-1-official/overview.md) for the plain-text version of this page. For finer parameter detail, append `.md` to the text-to-video and image-to-video pages the same way.

  Requirements:

  1. Use the three-step async flow, not a synchronous wait. This channel is **async only**: `POST /v1/videos` submits the job and returns a `task_id`, then poll `GET /v1/videos/{task_id}` every **8 to 10 seconds** until `status` becomes `completed`, then download the MP4 from `GET /v1/videos/{task_id}/content`. **There is no webhook, only polling** — do not go looking for callback settings.

  2. Getting the video (**the most important item for this model**): the response contains **no CDN or public URL at all** — no `video_url`, no `data.url`. The video is only available as an MP4 binary stream from the `/content` endpoint, and that request **must carry an `Authorization` header**. So the frontend **cannot** put that endpoint URL into a video tag `src` — a browser request without the auth header gets a 401. The correct approach: **as soon as the status is `completed`, download the MP4 server-side and re-host it in your own object storage or CDN**, then serve your own URL to end users. How long the remote video is retained is not officially specified, so **never rely on `task_id` as a long-term address**. When downloading from `/content`, retry 3 to 5 times at 4-second intervals — a 400 occurs occasionally in the instant right after `status` flips to `completed`.

  3. Tiered timeouts: allow 30 seconds for the POST submission (a multipart reference-image upload can be slower). Cap the polling wait by resolution — **3 minutes** for 720p and 1080p, **10 minutes** for 4K. Put these in configuration rather than hardcoding a single value.

  4. Model and parameters: the model name is either `veo-3.1-fast-generate-preview` (cheaper, fine for everyday use) or `veo-3.1-generate-preview` (standard tier). The duration field is called **`seconds`, not `duration`**, and it **must be a string** (`"4"` / `"6"` / `"8"`) — a number is rejected by the server. **Naming the field `duration` raises no error: it is silently dropped and the duration falls back to 4 seconds** — that is exactly where "I asked for 8 seconds but got 4" comes from. **Duration and resolution are coupled**: both `1080p` and `4k` accept **only `seconds` of `"8"`**, and passing `"4"` or `"6"` errors out; only `720p` allows all three durations. So if your UI lets users pick resolution and duration together, constrain the pair rather than offering illegal combinations. 4K additionally requires the model `veo-3.1-generate-preview` and a 10-minute timeout. Note that 4K renders 4 to 6 times slower than 1080p and produces files roughly 10 times larger, while **per-call billing is independent of both duration and resolution (4K costs no more and saves nothing)** — so default to 1080p and make 4K an explicit user choice.

  5. Three hard constraints on image-to-video: the request must be **`multipart/form-data`**, not JSON; the image field must be named **exactly `input_reference`** (`image`, `reference` and `input_image` are all ignored); and **only one image is accepted** — extra images are silently dropped. Remote URLs are **not accepted**, so upload a file or Base64. Accepted types are `image/jpeg`, `image/png` and `image/webp`. Note this channel also offers **no first/last-frame and no multi-reference** capability, so do not code against Google's own Veo 3.1 docs for those. In multipart mode the `metadata.*` fields flatten into plain form fields named `resolution`, `aspectRatio` and `seed`.

  6. **Do not send `generateAudio`.** Veo 3.1 generates audio natively, but passing that parameter makes the upstream return `INVALID_ARGUMENT`. To steer sound effects, speech or ambience, put the intent in the prompt — there is no audio field on this channel at all.

  7. Billing and errors: **billing is per call, by model name**, independent of duration, resolution and whether you passed a reference image. In async mode, **generation failures, moderation blocks and overload errors are all unbilled — only a `completed` status is charged** — so automatic retries carry no risk of double charging. For error handling: an error with a `PUBLIC_` prefix is an upstream moderation block, is not billed, and can be retried directly after adjusting the prompt; `5xx` or `INTERNAL` are transient upstream errors worth 1 or 2 retries with the same seed; a task that turns `failed` is usually moderation or upstream capacity, and is likewise not billed.

  8. One token setting to watch: this model requires the token to be on **per-call billing** or **pay-as-you-go priority**; **plain pay-as-you-go is not supported**. If a call fails complaining about the billing mode, switch the token in the console.

  9. Read the key from the `APIYI_API_KEY` environment variable and use [https://api.apiyi.com/v1](https://api.apiyi.com/v1) as the base URL. Never hardcode it, never commit it to git.

  10. When you are done, actually run one text-to-video call and one image-to-video call, then show me the videos and what those two calls cost.
</Prompt>

<Accordion title="What this prompt saves you from">
  | Requirement                             | Pitfall it prevents                                                                                                                        |
  | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
  | Download and re-host the MP4 at once    | The response carries no distributable URL and remote retention is unspecified, so treating `task_id` as a durable address eventually fails |
  | Frontend cannot hit `/content` directly | That endpoint needs an auth header, so a browser request returns 401 and the video element just goes black                                 |
  | Poll instead of waiting synchronously   | The official relay exposes async endpoints only and has no webhook, so a single blocking HTTP call simply cannot work                      |
  | Duration is coupled to resolution       | Both `1080p` and `4k` accept only `seconds` of `"8"`, so defaulting to 1080p with `"4"` errors out — only 720p allows all three            |
  | `seconds` is a string, not a number     | The field is not called `duration` either; getting either wrong is rejected by the server                                                  |
  | Failures are not billed                 | Only `completed` is charged, which is what makes automatic retries safe                                                                    |
  | Token must be per-call or PAYG-priority | Plain pay-as-you-go simply will not run, and the error has nothing to do with your code                                                    |
</Accordion>

## Why APIYI's VEO 3.1 Official?

Drop-in replacement for the Google official / Vertex AI channel, optimized for production scenarios across **onboarding friction**, **stability**, and **cost**:

<CardGroup cols={2}>
  <Card title="Official Passthrough · Identical Model IDs" icon="shield-check">
    Transparent passthrough to Google AI Studio's Veo 3.1 async endpoints. **Model IDs (`veo-3.1-generate-preview` / `veo-3.1-fast-generate-preview`) match the upstream exactly**, with one-to-one alignment on request and response fields and constraints.
  </Card>

  <Card title="Zero-Friction Onboarding · No Group Switching" icon="plug">
    Calls work on the **`Default` group** with **Pay-per-request or Pay-as-you-go Priority Tokens** (pure Pay-as-you-go is not supported). **No dedicated group switch needed**; existing Pay-per-request Tokens work as-is — the lowest-friction official-quality channel for Veo 3.1.
  </Card>

  <Card title="Unlimited Concurrency · Production Scale" icon="infinity">
    Aggregated account pool with transparent proxy — scale batch shoots, ad pipelines, and high-volume production linearly. **No Google per-account tier ceiling**.
  </Card>

  <Card title="Per-Request Pricing · 60%+ Cheaper than Google" icon="percent">
    `veo-3.1-fast-generate-preview` \$0.3/req, `veo-3.1-generate-preview` \$1.2/req — flat across 4/6/8 sec and 720p/1080p/4k. **Vs. Google's official 8s 1080p, save 62–68%**, stack [top-up bonuses](/en/faq/recharge-promotions) for further savings; failed tasks not billed.
  </Card>

  <Card title="Global Zero-Friction Access" icon="globe">
    **No overseas server or proxy required** — connect to `api.apiyi.com` directly from Mainland China data centers, residential networks, or overseas nodes. Skip the Google AI Studio / Vertex AI cross-border setup entirely.
  </Card>

  <Card title="Professional Support · Enterprise Onboarding" icon="handshake">
    Our team has deep expertise in video generation: prompt engineering, resolution selection, batch production, and post-processing. Full PoC-to-production technical support for enterprise customers.
  </Card>
</CardGroup>

## Key Features

<CardGroup cols={2}>
  <Card title="Native Synchronized Audio" icon="volume-2">
    Veo 3.1 natively outputs **video with synchronized audio** (ambient sound, dialogue, score). No separate audio post-production needed — describe audio intent in your prompt.
  </Card>

  <Card title="Flexible 4 / 6 / 8 Second Durations" icon="clock">
    `seconds` string enum: `"4"` / `"6"` / `"8"`. **Per-request billing, duration does not affect price**. 1080p / 4k tiers require `"8"`.
  </Card>

  <Card title="Three Resolution Tiers" icon="expand">
    `720p` / `1080p` / `4k`, **uniform per-request pricing**. Toggle landscape (`16:9`) and portrait (`9:16`) freely.
  </Card>

  <Card title="Precise Instruction Following" icon="target">
    Veo 3.1 leads its tier on camera motion, object physics, and character expression fidelity. Rich camera-language keyword support (push/pull/pan/dolly, low/high angles).
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="Image-to-Video (input_reference)" icon="image">
    Upload one image as the visual anchor to animate static content. See [Image-to-Video](/en/api-capabilities/veo-3-1-official/image-to-video).
  </Card>

  <Card title="Async Task Model" icon="list-check">
    Submit returns a `task_id` immediately. Poll status independently and download the final video — ideal for batch management and resume-on-failure flows.
  </Card>

  <Card title="OpenAI-Compatible Protocol" icon="plug">
    `base_url=https://api.apiyi.com/v1` + `Bearer` auth. Works via raw HTTP or the OpenAI SDK's low-level `client.post()`.
  </Card>

  <Card title="Failures Are Free" icon="circle-check">
    In async mode, failed generations, content-policy rejections, parameter errors are **not billed**. **Only `status=completed` tasks are charged**.
  </Card>
</CardGroup>

## Pricing

APIYI uses **pay-per-request** billing — flat price within supported duration/resolution combos, **no surcharge for longer or higher-res output**. Per `ai.google.dev/gemini-api/docs/pricing` public rates, Google's official Veo 3.1 charges per second; the discounts below are computed for **8-second videos**.

| Model                           | APIYI Price     | Google Official 8s 1080p  | Google Official 8s 4K     |
| ------------------------------- | --------------- | ------------------------- | ------------------------- |
| `veo-3.1-fast-generate-preview` | **\$0.3 / req** | \$0.96<br />**68.8% off** | \$2.40<br />**87.5% off** |
| `veo-3.1-generate-preview`      | **\$1.2 / req** | \$3.20<br />**62.5% off** | \$4.80<br />**75.0% off** |

<Info>
  **Billing notes**:

  * Charged **per request by model name**, independent of duration (4/6/8 sec), resolution (720p/1080p/4k), or whether `input_reference` is provided — **picking 4K costs the same as 720p**
  * In async mode, failed generations / content-policy rejections / capacity errors are **all not billed**
  * Top-up bonus tiers under [Top-Up Promotions](/en/faq/recharge-promotions) further reduce effective cost
  * 4K renders 4–6× slower and produces files \~10× larger — **default to 1080p** for daily use
  * Google's official 4K rate is \$0.30/sec (fast) / \$0.60/sec (standard), i.e. \$2.40 / \$4.80 for 8 sec (source: `ai.google.dev/gemini-api/docs/pricing`)
</Info>

## Group Setup

VEO 3.1 Official **works on the `Default` group** (1x), **no dedicated group switching required**. The Token's billing mode must be **Pay-per-request** or **Pay-as-you-go Priority** — **pure Pay-as-you-go is not supported** (switch the Token mode in the [console](https://api.apiyi.com/token) if needed).

<Tip>
  **Low onboarding friction**: VEO 3.1 Official runs on the Default group and accepts both Pay-per-request and Pay-as-you-go Priority, with no dedicated group to set up — **ideal when you want "drop in your existing Pay-per-request Token + change `base_url`" zero-config onboarding**.
</Tip>

| Dimension         | VEO 3.1 Official                                                    | Notes                                 |
| ----------------- | ------------------------------------------------------------------- | ------------------------------------- |
| Group             | `Default` (1x)                                                      | No switching required                 |
| Billing model     | Pay-per-request ✅ / Pay-as-you-go Priority ✅ / pure Pay-as-you-go ❌ | Pure Pay-as-you-go must be switched   |
| Token requirement | Pay-per-request or Pay-as-you-go Priority + Default group           | No specialized Token needed           |
| Rate / Multiplier | 1.0x                                                                | Direct settlement at the prices above |

## Technical Specs

| Dimension                                        | `veo-3.1-fast-generate-preview`                         | `veo-3.1-generate-preview` |
| ------------------------------------------------ | ------------------------------------------------------- | -------------------------- |
| **Price**                                        | \$0.3 / request                                         | \$1.2 / request            |
| **Supported duration (seconds, string)**         | `"4"` / `"6"` / `"8"`                                   | `"4"` / `"6"` / `"8"`      |
| **Supported resolution (`metadata.resolution`)** | `720p` / `1080p` / `4k`                                 | `720p` / `1080p` / `4k`    |
| **Supported aspect (`metadata.aspectRatio`)**    | `16:9` / `9:16`                                         | `16:9` / `9:16`            |
| **Audio**                                        | ✅ Synchronized audio + video                            | ✅                          |
| **Image-to-video (input\_reference)**            | ✅ (1 reference image)                                   | ✅ (1 reference image)      |
| **Typical generation time**                      | 720p 60–90s · 1080p 80–120s · 4K 5–6 min                | Same                       |
| **Video retention**                              | Not officially documented — download immediately        | Same                       |
| **Response fields**                              | `id` / `task_id` / `status` / `progress` / `created_at` | Same                       |

<Warning>
  **At 1080p / 4k resolution, `seconds` must be `"8"`** — `"4"` or `"6"` will be rejected upstream. All three durations are supported at 720p.
</Warning>

## API Endpoints

| Endpoint                       | Method | Purpose                                                                           | Content-Type                                |
| ------------------------------ | ------ | --------------------------------------------------------------------------------- | ------------------------------------------- |
| `/v1/videos`                   | POST   | Submit a video generation task (text-to-video / image-to-video, unified endpoint) | `application/json` or `multipart/form-data` |
| `/v1/videos/{task_id}`         | GET    | Query task status and progress                                                    | —                                           |
| `/v1/videos/{task_id}/content` | GET    | **Download the generated MP4 (binary stream)**                                    | —                                           |

<Warning>
  **⚠️ MP4 binary download only — no CDN URL returned**

  This channel currently **does not output any CDN / public URL in the response** — the video file can only be retrieved as an **MP4 binary stream via `GET /v1/videos/{task_id}/content`** (requires the `Authorization: Bearer` header).

  Implications:

  * **No** `video_url` / `data.url` / any directly distributable link is returned in the response
  * Frontends **cannot** put the endpoint URL directly in a `<video>` tag — browser requests without the auth header will 401
  * **As soon as `status: "completed"`, download the MP4 and store it in your own OSS / CDN**, then serve your URL to end users
  * Video retention is not officially documented — **do not depend long-term on the remote `task_id`** to retrieve videos
</Warning>

<Tip>
  **Endpoint selection**: Primary `api.apiyi.com`; backup gateways `vip.apiyi.com` / `b.apiyi.com` have identical behavior.
</Tip>

## Key Parameters

<Tip>
  **⚡ Full parameter reference**: Jump to [Text-to-Video - Parameter Reference](/en/api-capabilities/veo-3-1-official/text-to-video#parameter-reference) for the complete table covering `model` / `prompt` / `seconds` / `size` / `metadata.*` types, defaults, and constraints. This section unpacks only the **3 most pitfall-prone parameters**.
</Tip>

### `seconds` (video length)

The length field is named **`seconds`** (not `duration`) and **must be a string** (`"4"` / `"6"` / `"8"`). Passing a number returns:

```
parse_request_failed: cannot unmarshal number into Go struct field ... duration of type string
```

| Value | 720p        | 1080p        | 4k           |
| ----- | ----------- | ------------ | ------------ |
| `"4"` | ✅           | ❌            | ❌            |
| `"6"` | ✅           | ❌            | ❌            |
| `"8"` | ✅ (default) | ✅ (required) | ✅ (required) |

<Warning>
  **Common pitfall: naming the field `duration` is silently ignored.** `duration` is not recognized by this channel → it's dropped → length falls back to the default **4 sec**:

  * At 720p (and other tiers that allow 4 sec): **no error, but you only get 4 sec** (this is exactly the "sent 8s, got 4s" case)
  * At 1080p / 4k: 4 sec is illegal, so it errors with `Resolution 1080p requires duration seconds to be 8 seconds, but got 4`

  **Correct usage: send the `seconds` field with value `"8"` (string).**
</Warning>

Parameter precedence: `metadata.durationSeconds > seconds > 8`

### `metadata.resolution` (resolution tier)

| Value            | Pixels (landscape) | Pixels (portrait) | Notes                                      |
| ---------------- | ------------------ | ----------------- | ------------------------------------------ |
| `720p` (default) | `1280x720`         | `720x1280`        | All three durations                        |
| `1080p`          | `1920x1080`        | `1080x1920`       | **`seconds="8"` only**                     |
| `4k`             | `3840x2160`        | `2160x3840`       | **`seconds="8"` only**, 4–6× slower render |

Parameter precedence: `metadata.resolution > size > 720p`

### ⚠️ Do not pass `generateAudio`

Veo 3 / 3.1 is **natively audio-aware**, but the `generateAudio` parameter **must not be passed** — upstream will reject with `INVALID_ARGUMENT`. To control audio, **write the intent into your prompt**:

> "Coastal lighthouse at dusk; waves, distant seabirds, low wind sounds, cinematic atmosphere"

## Best Practices

<Steps>
  <Step title="Pick a model by need">
    * **Iteration / batch previews** → `veo-3.1-fast-generate-preview` (\$0.3/request)
    * **Final delivery / 4K** → `veo-3.1-generate-preview` (\$1.2/request)
    * Run both with the same prompt + seed; pick by eye
  </Step>

  <Step title="Validate with 4 seconds first">
    For every new prompt, start with `seconds: "4"` to validate camera direction and style (60–90 sec render, \$0.3). Scale up to 8 sec or 1080p once the look is locked.
  </Step>

  <Step title="Use async polling, not sync wait">
    The Official channel is **async-only**: POST to submit and get `task_id` → poll `GET /v1/videos/{task_id}` every 8–10 sec until `status: "completed"` → download from `/content`. **No webhooks; polling only**.
  </Step>

  <Step title="Set client timeouts by tier">
    * 720p / 1080p: 3 min hard timeout
    * 4K: 10 min hard timeout
    * POST submit (multipart): 30 sec minimum
  </Step>

  <Step title="Download immediately on completion">
    Once `status` flips to `completed`, **download to your own OSS / CDN immediately** — do not depend long-term on the remote `task_id`. The `/content` endpoint **occasionally returns 400** right after `status` flips; retry after 4 seconds (the sample clients have this baked in).
  </Step>

  <Step title="Encode audio intent in the prompt">
    **Do not pass `generateAudio`** (it returns `INVALID_ARGUMENT`). For ambient sound, dialogue, BGM, describe in the prompt: "waves, distant seabirds, low wind sounds".
  </Step>

  <Step title="Rate-limit on your end">
    Concurrency caps are not publicly documented; in practice 10 simultaneous submissions all queued successfully. **Recommend production-side limit of in-flight ≤ 10**, with exponential backoff for 429 / 5xx.
  </Step>
</Steps>

## Error Codes & Retries

| Status / Symptom               | Meaning                                                            | Recommended Action                                                         |
| ------------------------------ | ------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| `400` + `parse_request_failed` | `seconds` was a number                                             | Use string `"4"` / `"6"` / `"8"`                                           |
| Only 4 sec / `... but got 4`   | Field was named `duration` (silently ignored, falls back to 4 sec) | Use `seconds` with value `"8"` (string)                                    |
| `INVALID_ARGUMENT`             | Passed `generateAudio` or non-8-sec at 1080p/4k                    | Drop `generateAudio`; set `seconds="8"` for HD/4K                          |
| `401`                          | Invalid token                                                      | Check `Authorization: Bearer <key>` (no extra whitespace), key still valid |
| `429`                          | Rate-limited / insufficient balance                                | Exponential backoff retry; top up and retry                                |
| `5xx` / `INTERNAL`             | Upstream transient error                                           | Retry 1–2 times with same seed (not billed)                                |
| `GET /content` occasional 400  | `status` just flipped to `completed`                               | Wait 4 sec and retry (clients should retry 3–5 times)                      |
| Task `failed`                  | Generation failed (typically content review or upstream capacity)  | Adjust prompt and retry; **task is not billed**                            |

<Info>
  **Recommended client settings**:

  * POST submit timeout: **30 sec** (multipart uploads may need more)
  * Polling interval: **8–10 sec**; max wait 720p/1080p **3 min**, 4K **10 min**
  * Exponential backoff retry for 5xx and `failed` (1–2 attempts recommended)
  * Retry `/content` 3–5 times with 4-second gaps
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="Official vs Reverse channel — what's the difference? Is the Reverse channel still usable?">
    **Official (this page)**: Transparent passthrough to Google AI Studio's upstream endpoints. Model IDs match Google upstream (`veo-3.1-generate-preview` / `veo-3.1-fast-generate-preview`), priced at \$0.3 / \$1.2 per request, async endpoint only.

    **Reverse** (existing [VEO 3.1](/en/api-capabilities/veo/overview)): Reverse-engineered access to Google Flow. Model IDs are `veo-3.1-fast` / `veo-3.1` / `-fl` series, priced from \$0.15 per request — cheaper, and supports both **streaming sync** and async modes, plus **frame-to-video** (first/last frame).

    See the full [Official vs Reverse decision matrix](/en/api-capabilities/veo-3-1-official/vs-veo-reverse). Both channels coexist; pick by business need.
  </Accordion>

  <Accordion title="Is the length field seconds or duration? And why must it be a string?">
    **The request field is `seconds`** (string `"4"` / `"6"` / `"8"`). Naming it `duration` is not recognized — it's silently dropped and length falls back to the default 4 sec, which is the root cause of "sent 8s but only got 4s".

    As for why it must be a string: the backend Go struct declares this field (internally named `duration`) as `string`, so a number is rejected at the decoder layer with `parse_request_failed: cannot unmarshal number into Go struct field ... duration of type string` (the `duration` in that error is the backend's internal field name — your request still sends `seconds`). **Remember: send `seconds`, and quote the value: `"4"` / `"6"` / `"8"`**.
  </Accordion>

  <Accordion title="How do I add dialogue / ambient sound / BGM? Can I pass generateAudio?">
    Veo 3 / 3.1 is a **natively audio-enabled** video model, but the `generateAudio` parameter **must not be passed** (upstream returns `INVALID_ARGUMENT`). To control sound, **write the intent into your prompt**:

    > "Coastal lighthouse at dusk; waves, distant seabirds, low wind sounds, cinematic atmosphere"
  </Accordion>

  <Accordion title="fast vs standard — which to pick? Is fast actually faster?">
    * At equivalent parameters, **render time is roughly the same** (measured 720p 8 sec: fast 83s, standard 78s). **fast is not faster — it is cheaper** (\$0.3 vs \$1.2)
    * Default to `veo-3.1-fast-generate-preview`
    * Switch to `veo-3.1-generate-preview` for final delivery or when detail fidelity / physics consistency matters
    * A/B in production: run both with same prompt + seed, pick by eye
  </Accordion>

  <Accordion title="Is 4K worth using?">
    **Not recommended for most cases**:

    * Same per-request price sounds attractive
    * But rendering is **4–6× slower** (720p 80s → 4K 350s)
    * Files are \~10× larger (720p 4MB → 4K 40MB) — bandwidth and storage costs double
    * 1080p is visually sufficient for most playback scenarios

    **When you do need 4K**: use `veo-3.1-generate-preview`, set `seconds="8"` (mandatory), client timeout ≥ 10 min, run as a backgrounded async task.
  </Accordion>

  <Accordion title="When is a task done? Are there webhooks?">
    * There are **no webhooks**; poll `GET /v1/videos/{task_id}` only
    * Recommended polling interval: **8 sec** (measured sufficient, won't trip rate limits)
    * Measured times: 720p / 1080p 60–115 sec, 4K 5–6 min
    * Client timeouts: 3 min for 720p/1080p, 10 min for 4K
  </Accordion>

  <Accordion title="Why does GET /content return 400?">
    Right after `status` flips to `completed`, calling `/v1/videos/{task_id}/content` occasionally returns 400 due to upstream CDN sync delay. **Wait 4 sec and retry once** typically resolves it (the sample clients retry 3–5 times with 4-second gaps).
  </Accordion>

  <Accordion title="Can I get a CDN URL for the video? Can the frontend hit the endpoint directly?">
    **Not currently**. This channel **does not return any CDN / public URL** in the response — no `video_url` / `data.url` / any other directly distributable link.

    **The only way to retrieve the video**: after `status: "completed"`, call `GET /v1/videos/{task_id}/content` to get the **MP4 binary stream** (requires `Authorization: Bearer` header).

    **Standard production pattern**:

    1. Backend downloads the MP4 as soon as the task completes → push to your own OSS / CDN
    2. Serve your CDN URL to end users
    3. **The frontend `<video>` tag should NOT point directly at `/content`** — browsers can't include the auth header, requests will 401

    If/when the upstream exposes CDN URLs, this page will be updated.
  </Accordion>

  <Accordion title="How long are videos kept on the server? Do I need to download immediately?">
    Retention period is **not officially documented**. **Strongly recommended: download immediately on completion** and store locally — do not depend long-term on the remote `task_id`; `/content` will eventually 404 after expiry.
  </Accordion>

  <Accordion title="Why does progress stay at 50%?">
    The `progress` field is coarse-grained — **only jumps between 0 / 50 / 100**. Do not use it for a percentage progress bar. Use a spinner, or compute "elapsed / expected" yourself.
  </Accordion>

  <Accordion title="Are failed generations billed?">
    **No**. **Only `status=completed` tasks are charged**. `failed` / canceled / content-policy rejected / parameter error are all free. **No real video output, no charge**.
  </Accordion>

  <Accordion title="Can seed reproduce identical videos?">
    **Not byte-identical**. Measured: same prompt + same seed (`88888`) + same params, fast run twice — file sizes 9.81 MB vs 9.25 MB, md5 completely different, render times also differ.

    **But seed is not decorative**: same-seed outputs **cluster together** (5-run test, intra-group file size spread only 6%), different seeds **shift systematically** (inter-group spread +36.8%). Implications:

    * Want a "stable look" → fix the seed
    * Want to "explore variations" → swap seed instead of fiddling with prompt
    * Want "exact replay" → forget it, store the mp4
  </Accordion>

  <Accordion title="Can I pass multiple reference images? First/last frame?">
    **Neither is currently supported**. Image-to-video accepts only 1 image, with the field name fixed as `input_reference`, and **only as file or Base64, not remote URL**.

    Google upstream Veo 3.1 supports multi-reference / first-last-frame / video extension, but this channel does not. **For first/last frame, use the [VEO 3.1 (Reverse)](/en/api-capabilities/veo/overview) `-fl` series**.
  </Accordion>

  <Accordion title="Concurrency limits? QPS caps?">
    Measured 10 simultaneous submissions, all queued successfully — no rejection. The exact cap is not publicly stated. **Recommend production-side limit of in-flight ≤ 10**, with exponential backoff on 429 / 5xx.
  </Accordion>

  <Accordion title="Do videos carry watermarks or provenance metadata?">
    * No visible watermark
    * But they carry **Google C2PA Content Credentials** (issued by Google C2PA Media Services, format `urn:c2pa:...`) embedded in MP4 metadata. End users cannot see them; **C2PA tools (e.g., Adobe Content Authenticity) can verify "generated by Veo"**
    * For redistribution scenarios, be aware; usually does not affect playback
  </Accordion>

  <Accordion title="Can I use the official OpenAI SDK directly?">
    Partially. The interface follows OpenAI conventions (`Bearer` auth + `/v1/...`), but the OpenAI official SDK **does not expose a `videos.create` method** (`/v1/videos` is a custom path). Use the OpenAI SDK's low-level `client.post()` or raw HTTP. **Raw HTTP is simplest** — see code samples in [Text-to-Video Playground](/en/api-capabilities/veo-3-1-official/text-to-video).
  </Accordion>
</AccordionGroup>

## Related Docs

* [Text-to-Video Playground](/en/api-capabilities/veo-3-1-official/text-to-video) — `POST /v1/videos` (JSON) interactive debugger + 5-language code samples
* [Image-to-Video Playground](/en/api-capabilities/veo-3-1-official/image-to-video) — `POST /v1/videos` (multipart) + `input_reference` usage
* [Official vs Reverse decision matrix](/en/api-capabilities/veo-3-1-official/vs-veo-reverse) — Differences vs [VEO 3.1 (Reverse)](/en/api-capabilities/veo/overview)
* [Top-Up Promotions](/en/faq/recharge-promotions) — Bonus tiers and eligible channels
* [API Manual](/en/api-manual) — Generic call conventions, timeout and retry guidance
* Google official model page: `ai.google.dev/gemini-api/docs/models/veo-3.1-generate-preview`
* Google video generation docs: `ai.google.dev/gemini-api/docs/video`

<Info>
  VEO 3.1 Official is APIYI's stable official-relay service — a transparent passthrough to Google AI Studio. Model IDs, response fields, and constraints match Google upstream exactly, **and the channel works on the Default group with pay-per-request billing** — the lowest-friction official-quality channel available. Please file feedback in the console support panel.
</Info>
