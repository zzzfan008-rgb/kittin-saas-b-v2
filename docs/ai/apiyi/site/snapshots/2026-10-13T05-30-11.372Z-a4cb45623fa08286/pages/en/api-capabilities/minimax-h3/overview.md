> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# MiniMax-H3 Video Generation

> MiniMax H3 (Hailuo 3.0) video generation guide: one endpoint for text, first/last-frame, and reference image/video/audio video, native stereo audio, 768P, 4–15 s, billed at $0.03 per second.

## Overview

MiniMax H3 (Hailuo 3.0) is an omni-modal video model released by MiniMax on 2026-07-31 (UTC+8). A single model takes in text, images, video, and audio and outputs video **with a stereo audio track**. APIYI serves `MiniMax-H3` from a self-hosted deployment of the open weights, at 768P, 4–15 seconds per clip, billed per second.

<Note>
  **Highlights**: one endpoint covers text-to-video, first-frame / last-frame / first-and-last-frame video, and mixed reference generation with up to 9 images, 3 videos, and 3 audio clips. Every clip comes with music and sound effects. **\$0.03 per second** (the official MiniMax API charges \$0.08), so a 10-second clip costs \$0.30, and failed tasks are refunded automatically.
</Note>

<CardGroup cols={2}>
  <Card title="Video Generation API Reference" icon="video" href="/en/api-capabilities/minimax-h3/video-generation">
    Create a task and query it by task\_id, with Python / cURL / Node.js examples and a live Playground
  </Card>

  <Card title="Top-up Bonuses" icon="gift" href="/en/faq/recharge-promotions">
    Top-up bonuses lower the effective price further
  </Card>
</CardGroup>

## Let an AI Agent Integrate It for You

<Note>
  If you build with Codex / Claude Code / Cursor, copy the prompt below into it. The agent first fetches the plain-text version of this page (append `.md` to any docs URL), then writes code for your stack. The common mistakes are already spelled out: the path needs `/hailuo`, results sit inside `task`, and `duration` must be an integer from 4 to 15.
</Note>

<Prompt description="Have a coding agent integrate or debug MiniMax-H3 video generation. Copy and paste it into Codex, Claude Code, Cursor, and similar tools." icon="bot" actions={["copy"]}>
  Integrate or debug MiniMax-H3 video generation (text-to-video / first-and-last-frame video / reference video) in this project.

  Read the docs before writing code: fetch [https://docs.apiyi.com/en/api-capabilities/minimax-h3/overview.md](https://docs.apiyi.com/en/api-capabilities/minimax-h3/overview.md) for the plain-text version of this page; parameters and code samples are at [https://docs.apiyi.com/en/api-capabilities/minimax-h3/video-generation.md](https://docs.apiyi.com/en/api-capabilities/minimax-h3/video-generation.md) .

  Requirements:

  1. Endpoints: submit with `POST https://api.apiyi.com/hailuo/v2/video_generation`, query with `GET https://api.apiyi.com/hailuo/v2/query/video_generation/{task_id}`. **The path must start with `/hailuo`**; without it you get a web page instead of JSON.

  2. Polling and status: submission only returns `{"task_id": ...}`. Poll every 10 seconds; set the overall timeout by task type: 30 minutes without a reference video, 2 hours with one. The query result is wrapped in a **`task`** object; status is `queued` / `running` / `succeeded` / `failed`, and **success is `succeeded`**. `progress` is only ever 0 or 1, so don't build a progress bar on it.

  3. Storing the video: the URL is **`task.content.url`** and needs no auth header. Download it on the server side and store it yourself. Check the URL with GET; it returns 403 to HEAD requests.

  4. Request body and types: all five fields `{ model, content[], resolution, duration, ratio }` are required. `model` is always `MiniMax-H3` (case-sensitive); **`duration` is an integer**, and a string like `"5"` or a decimal is rejected; **`resolution` must be uppercase `768P`**, and both `768p` and `2K` are rejected.

  5. Parameter limits: `duration` 4 to 15 seconds; `ratio` one of `21:9` `16:9` `4:3` `1:1` `3:4` `9:16` `adaptive`; **text-only and audio-only requests cannot use `adaptive`**. `content` must contain exactly one text item of at most 7000 characters. Don't add fields that aren't documented (such as `seed` or `prompt`); they are rejected.

  6. Media input: images go in `{"type":"image_url","image_url":{"url":...},"role":...}`, videos use `video_url` + `reference_video`, audio uses `audio_url` + `reference_audio`. Every URL must be a **public https link**; Base64, data URIs, and private addresses are not supported. First/last frames (`first_frame` / `last_frame`) **cannot** be mixed with reference media, and with more than one image each needs a `role`. Limits: 9 reference images, 3 reference videos (15 seconds total at most), 3 reference audio clips. In the prompt, refer to media as `<Picture 1>` `<Video 1>` `<Audio 1>`, numbered by order within each type.

  7. Billing and idempotency: billed per second at 0.03 US dollars, with no extra charge for reference images, videos, or audio; `failed` tasks are refunded automatically and submission errors are not billed. **The `Idempotency-Key` header currently has no effect, so every resubmission is billed again.** Keep your own mapping from business ID to task\_id, and only retry HTTP 500s and network errors at submission, with backoff (5 s / 10 s / 20 s). For 400 errors, fix the parameters instead of retrying.

  8. Token: the `default` group or the `svip` group works; set the billing model to **Pay-as-you-go Priority**. A "no available channel" error means the Token's group is wrong or the model name is misspelled.

  9. Read the key from the `APIYI_API_KEY` environment variable. Don't hard-code it or commit it to git.

  10. When done, run one real 5-second text-to-video request and send me the video URL and what the call cost. The whole flow takes 2 to 4 minutes; if you run in a sandbox, set the command timeout above 600 seconds or run it in the background.
</Prompt>

<Accordion title="What this prompt protects you from">
  | Requirement | Mistake it prevents |
  | - | - |
  | Path starts with `/hailuo` | A bare `/v2/...` returns a web page, JSON parsing fails, and it looks like the service is down |
  | Results live in `task` | Looking for `status` at the top level never matches, so polling spins until timeout |
  | `duration` is an integer 4–15 | Strings or decimals are rejected, and the error message misleadingly says the JSON is invalid |
  | No `adaptive` for text only | Text-to-video needs a fixed ratio |
  | Idempotency key has no effect | You assume `Idempotency-Key` makes retries safe, but every retry is a new charge |
  | Check URLs with GET | The video URL returns 403 to HEAD, which looks like a dead link |
</Accordion>

## Why APIYI's MiniMax-H3?

<CardGroup cols={2}>
  <Card title="Full capability set" icon="layers">
    Text, first/last-frame, and mixed image / video / audio reference generation are all available, with the same reference limits as the official model (9 images + 3 videos + 3 audio clips)
  </Card>

  <Card title="Per-second billing, refunds on failure" icon="receipt">
    \$0.03 per second, and you only pay for videos that succeed; failed tasks are refunded in full and submission errors are free
  </Card>

  <Card title="Top-up bonuses stack" icon="gift">
    Combine with [top-up bonuses](/en/faq/recharge-promotions) for a lower effective cost
  </Card>

  <Card title="Global access, no barriers" icon="globe">
    Connect directly to `api.apiyi.com` with one API Key; no overseas account needed
  </Card>

  <Card title="Full video model lineup" icon="clapperboard">
    The same key also works with [Seedance 2.0 / 2.5](/en/api-capabilities/seedance2/overview), [Wan2.7](/en/api-capabilities/wan/overview), [VEO 3.1](/en/api-capabilities/veo-3-1-official/overview), and more
  </Card>

  <Card title="Professional support" icon="headset">
    Contact support with integration questions; enterprise customers get hands-on onboarding
  </Card>
</CardGroup>

## Key Features

<CardGroup cols={2}>
  <Card title="Native stereo audio" icon="music">
    Every clip includes music and sound effects driven by the prompt and any reference audio, with no dubbing step
  </Card>

  <Card title="7 aspect ratios" icon="ratio">
    Six fixed ratios from `21:9` to `9:16`, plus `adaptive` to follow the reference image
  </Card>

  <Card title="Any whole length from 4 to 15 s" icon="timer">
    Billed by the actual seconds requested, so short clips cost less
  </Card>

  <Card title="Long prompts" icon="text">
    Up to 7000 characters per prompt, enough for shot-by-shot descriptions
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="First/last-frame control" icon="image">
    Provide only the first frame, only the last frame, or both to set how the clip starts and ends
  </Card>

  <Card title="Multiple reference images" icon="images">
    Up to 9 reference images; tag characters and objects in the prompt with `<Picture 1>` and so on
  </Card>

  <Card title="Motion transfer from video" icon="film">
    Up to 3 reference videos to copy camera moves and motion rhythm
  </Card>

  <Card title="Audio-driven video" icon="audio-lines">
    Up to 3 reference audio clips; the picture follows the music or voice
  </Card>
</CardGroup>

## Pricing

This channel runs MiniMax's open H3 weights on our own deployment. It is **not a relay of the official MiniMax API**, so it has its own pricing:

| Item | APIYI (self-hosted, 768P) | Official MiniMax API (768P) |
| - | - | - |
| Output video | **\$0.03 / second** | \$0.08 / second |
| Reference images | Free (up to 9) | First 5 free, then \$0.04 per image |
| Reference videos | Free | \$0.08 per second of input |
| Reference audio | Free | Free |
| Example: 10 s text-to-video | **\$0.30** | \$0.80 |

<Note>This channel is a self-hosted deployment of the open weights, priced independently of the official MiniMax API, and prices may change; the table above is for reference only, and the **Model Pricing** tab in the top navigation is authoritative: [Model Pricing](/en/models/index). Official prices from `platform.minimax.io/docs/guides/pricing-paygo` (retrieved 2026-09-29).</Note>

<Info>
  **Billing details**:

  * Billed by the requested `duration` in seconds, pre-charged when the task is accepted
  * **No extra charge for reference media**: reference images (up to 9), videos, and audio don't change the price; only duration is billed
  * Failed tasks (media download failure, unsupported format, execution failure, etc.) are **refunded in full automatically**
  * Requests that return 4xx / 5xx at submission are not billed; querying and downloading are free
  * See [top-up bonuses](/en/faq/recharge-promotions) for a lower effective cost
</Info>

## Group Setup

MiniMax-H3 **works in the `default` group**, and the `svip` group works too; no dedicated group is needed. We recommend setting the Token's billing model to **Pay-as-you-go Priority**. If a call returns "no available channels for the current group", the Token's group does not include this model or the `model` value is misspelled (it is case-sensitive).

| Item | Requirement |
| - | - |
| Group | `default` or `svip` |
| Billing model | Pay-as-you-go Priority (recommended) |
| Model name | `MiniMax-H3`, case-sensitive |

## Technical Specs

| Item | Spec |
| - | - |
| Model ID | `MiniMax-H3` |
| Resolution | `768P` only |
| Duration | Integer 4–15 s (the finished clip is usually 0.1–0.5 s longer) |
| Aspect ratio | `21:9` 1536×672 / `16:9` 1344×768 / `4:3` 1024×768 / `1:1` 768×768 / `3:4` 768×1024 / `9:16` 768×1344 / `adaptive` |
| Audio | Stereo track always included, no switch |
| Prompt | 1 text item, 1–7000 characters |
| Reference media | Images ≤ 9, videos ≤ 3 (≤ 15 s total), audio ≤ 3; ≤ 12 media items overall |
| Media input | Public HTTPS URLs only |
| Output | MP4, via `task.content.url` |
| Generation time | About 3 minutes for 5 s, about 13 minutes for 15 s; much longer with a reference video, see "Estimated Generation Time" below |

<Warning>
  The official MiniMax H3 model supports 2K, but this channel **only offers 768P**; `2K` is rejected.
</Warning>

## Estimated Generation Time

Generation time for MiniMax-H3 depends mainly on two things: **output duration** and **whether a reference video is included**. The table below reflects the current state of this channel, based on 400+ successful tasks from 2026-09-29 to 2026-10-10 (UTC+8):

| Output duration | No reference video (text / image to video) | With reference video |
| - | - | - |
| 4–6 s | About 3 min, mostly within 5 min | About 15 min (12–25 min) |
| 7–10 s | About 6 min, mostly within 11 min | Few samples; allow 30+ min |
| 11–15 s | About 13 min, mostly within 20 min | About 85 min (50–90 min) |

* **Time grows faster than duration**: a 15-second clip takes about 5× as long as a 5-second clip, not 3×
* **Reference videos take the longest**: the model parses the reference video frame by frame and computes it together with the new frames, multiplying the workload
* **Set client timeouts from this table**: 30 minutes for tasks without a reference video and 2 hours for tasks with one, so running tasks are not mistaken for failures

<Note>
  These are this channel's current measured numbers. For time-sensitive workloads, start with 4–6 second clips or use reference images instead of reference videos. **A faster, higher-quality MiniMax group is coming soon**; we will announce it on this page and in the [Changelog](/en/changelog).
</Note>

## API Endpoints

| Purpose | Method | Path | Content-Type |
| - | - | - | - |
| Create task | `POST` | `/hailuo/v2/video_generation` | `application/json` |
| Query task | `GET` | `/hailuo/v2/query/video_generation/{task_id}` | — |

<Tip>
  Primary host `https://api.apiyi.com`, backup host `https://b.apiyi.com`, same paths. Note that the paths **start with `/hailuo`**, not `/v1`.
</Tip>

## Generation Modes

The generation mode is inferred from the media in `content[]`:

| Mode | `content[]` | `ratio` |
| - | - | - |
| Text-to-video | 1 text item only | Fixed ratio required |
| First-frame video | Text + 1 `first_frame` image | Fixed or `adaptive` |
| Last-frame video | Text + 1 `last_frame` image | Fixed or `adaptive` |
| First-and-last-frame video | Text + `first_frame` + `last_frame` | Fixed or `adaptive` |
| Reference video | Text + any mix of `reference_image` / `reference_video` / `reference_audio` | Fixed or `adaptive`; **audio only requires a fixed ratio** |

### Referring to media in the prompt

Each media type is numbered by its order in `content[]`: the first and second reference images are `<Picture 1>` and `<Picture 2>`, the first reference video is `<Video 1>`, the first reference audio clip is `<Audio 1>`. For example:

```text theme={null}
<Picture 1> dances with the moves from <Video 1>, in time with <Audio 1>
```

<Warning>
  * First/last frames **cannot** be combined with any reference media
  * With a single image you can omit `role` (it is treated as the first frame); **with two or more images, set `role` on each**
  * The **combined length** of reference videos cannot exceed 15 seconds, otherwise the task fails (and is refunded); a single clip over 15 seconds is trimmed to its first 15 seconds
</Warning>

## Best Practices

<Steps>
  <Step title="Test with 4–5 seconds first">
    Billing is per second, so confirm composition and style with a short clip before rendering 10–15 seconds
  </Step>

  <Step title="Use a fixed ratio for text-to-video">
    `16:9` for landscape, `9:16` for portrait, `21:9` for widescreen; with a first frame, `adaptive` keeps the image's ratio
  </Step>

  <Step title="Host media on stable public storage">
    Use direct links from your own object storage or CDN so hotlink protection or expired signatures don't break media downloads
  </Step>

  <Step title="Describe camera moves and sound">
    Cover the subject, action, camera movement, lighting, and the music and sound effects you want; the model generates them together
  </Step>

  <Step title="Poll every 10 seconds">
    A 5-second clip usually takes about 3 minutes; set the overall client timeout to 30 minutes without a reference video and 2 hours with one (see "Estimated Generation Time")
  </Step>

  <Step title="Handle idempotency yourself">
    Keep a mapping from business ID to task\_id; if a submission times out, look for an existing task before submitting again
  </Step>

  <Step title="Store the video right away">
    Download `task.content.url` with GET and serve it from your own storage
  </Step>
</Steps>

## Error Codes & Retries

| Stage | What you see | Cause | What to do |
| - | - | - | - |
| Submit | 400, `type: invalid_request`, message in Chinese | Invalid parameters (duration, ratio, counts, roles, etc.) | Fix the parameter; don't retry |
| Submit | 400, `bad_request_error` | Rejected upstream (e.g. `resolution must be 768P`, unsupported field) | Fix the parameter |
| Submit | 500, `Unknown Error` | Some invalid parameters (multiple text items, `http://` links, unknown fields, etc.) or transient overload | Check the body against Generation Modes first; if it's valid, retry with backoff |
| Submit | 503, no available channel | The Token's group doesn't include this model, or `model` is misspelled | Check the Token's group and the model name |
| Run | `status: failed`, `input_download_failed` | A media URL can't be downloaded (e.g. 404) | Switch to a publicly reachable link and resubmit |
| Run | `status: failed`, `input_format_unsupported` | Wrong media format (e.g. audio in an image slot) | Check media types and formats |
| Run | `status: failed`, `task_execution_failed` | Generation failed | Resubmit later (the failed task was refunded) |

<Info>
  **Client tips**: set the submit timeout to 60 seconds (at peak times submission alone can take more than 10 seconds); only retry HTTP 500s and network errors, with backoff. Every run-stage failure is refunded automatically, and resubmitting creates a new charge.
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="Why did I get a web page instead of JSON?">
    The path is missing the `/hailuo` prefix. The correct paths are `/hailuo/v2/video_generation` and `/hailuo/v2/query/video_generation/{task_id}`.
  </Accordion>

  <Accordion title="Is 2K or 1080P supported?">
    This channel supports `768P` only. The official MiniMax model supports 2K, but this channel does not offer it.
  </Accordion>

  <Accordion title="Can I set 1–3 seconds?">
    No. `duration` is an integer from 4 to 15.
  </Accordion>

  <Accordion title="Do the videos have sound? Can I turn it off?">
    Every clip includes a stereo audio track, and there is no parameter to disable it. Strip the track in post-processing if you don't need it.
  </Accordion>

  <Accordion title="Does the Idempotency-Key header prevent double billing?">
    Not at the moment. Resubmitting with the same `Idempotency-Key` still creates a new task that is billed separately. Track submitted tasks in your own application.
  </Accordion>

  <Accordion title="Are failed tasks billed?">
    No. Once a task reaches `failed` it is refunded in full automatically; requests rejected at submission are not billed either.
  </Accordion>

  <Accordion title="Can I send Base64 or local files?">
    No. All media must be public HTTPS URLs. Upload to your own object storage first and pass the link.
  </Accordion>

  <Accordion title="What size does adaptive produce?">
    It follows the input image's aspect ratio, e.g. 768×768 for a square image and 1344×768 for a 16:9 image. Text-only and audio-only requests cannot use `adaptive`.
  </Accordion>

  <Accordion title="Is a reference video longer than 15 seconds an error?">
    A single clip over 15 seconds is trimmed to its first 15 seconds automatically, but if several reference videos add up to more than 15 seconds the task fails (and is refunded).
  </Accordion>

  <Accordion title="How long does generation take?">
    About 3 minutes for a 5-second clip and about 13 minutes for a 15-second clip; tasks with a reference video take much longer, about 85 minutes at 15 seconds. See "Estimated Generation Time" above for the full table.
  </Accordion>

  <Accordion title="How long does the video URL stay valid?">
    We have not seen it expire quickly, but long-term availability is not guaranteed, so download and store the video promptly. Check the URL with GET; HEAD requests return 403.
  </Accordion>

  <Accordion title="What if submission sometimes returns 500 Unknown Error?">
    First confirm the request body follows the rules (exactly one text item, no extra fields, https media links). If it does, it is usually transient overload: wait a few seconds and retry. Failed submissions are not billed.
  </Accordion>
</AccordionGroup>

## Related Docs

* [MiniMax-H3 Video Generation API Reference](/en/api-capabilities/minimax-h3/video-generation)
* [Seedance 2.0 / 2.5 Video Generation](/en/api-capabilities/seedance2/overview)
* [Wan2.7 Video Generation](/en/api-capabilities/wan/overview)
* [VEO 3.1 Video Generation](/en/api-capabilities/veo-3-1-official/overview)
* [Top-up Bonuses](/en/faq/recharge-promotions)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.