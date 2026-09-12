> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.0 / 2.5 Video Generation

> ByteDance Seedance via official Volcengine resources: the new 2.5 plus 2.0 standard / fast / mini in parallel — text-to-video, first+last/first frame, multi-modal reference, video editing and extension. Every aspect ratio at the same price per tier, synchronized audio by default. 2.5 adds 30-second clips, 30 reference images, and mov output, billed on the same SeeDance2 group as the 2.0 family.

## Overview

**doubao-seedance-2-5-260628** (2.5), **doubao-seedance-2-0-260128** (standard), **doubao-seedance-2-0-fast-260128** (fast), and **doubao-seedance-2-0-mini-260615** (mini/lite) are ByteDance's latest video generation model family — four models running in parallel, served through APIYI on **official Volcengine Mainland China resources** (not the BytePlus international edition) with upstream content-safety built in. They support text-to-video, first+last/first frame image-to-video, and multi-modal reference-to-video — and can generate voice, sound effects, and background music synchronized with the visuals.

**2.5 is the most capable tier**: the duration cap goes from 15 to **30 seconds**, reference images from 9 to **30**, audio can stand alone as a reference, and it adds **mov** output plus explicit video-edit/extend task types. **It also costs more** — roughly 1.5x the 2.0 standard model (about \$1.35 versus \$0.91 for 720p/5s), matching the gap between the two generations in Volcengine's own list prices. The 2.0 family stays available and is not being retired: for routine clips under 15 seconds the standard model is cheaper and **also supports 1080p**; mini is the volume-production pick (**about half the standard model's unit price and faster generation**, capped at 720p), with fast in between.

**2.5 runs on the same `SeeDance2` group as the 2.0 family** (0.18x) — one token reaches all four models. See "Group Setup" below.

<Note>
  **🎬 Highlights**: 2.5 supports **4-30 s**, the 2.0 family 4-15 s (both accept `-1` for a model-chosen length); three resolution tiers (480p/720p/1080p, where **1080p is limited to 2.5 and 2.0 standard**); 6 aspect ratios plus adaptive; **synchronized audio on by default**; multilingual prompts. Built for **short-video production, e-commerce assets, motion design, and virtual-human content** at scale.
</Note>

<Info>
  **🔥 Limited-time discount — through 2026-09-07 23:59 (UTC+8)**: two new single-model groups, `SD2Mini` (0.10x) and `SD2Fast` (0.15x), cut the rate by **44.4% for `mini` and 16.7% for `fast`**. Swap in one new Token to get it — no code changes. See "Limited-time discount groups" and "Group Setup" below.
</Info>

<Warning>
  **Tokens calling 2.5 need the `SeeDance2` group** (rate 0.18x) — the same group as the 2.0 family. A token on the Default group or another video group calling `doubao-seedance-2-5-260628` fails with "**no available channel for this model**".

  **One Token with `SeeDance2` enabled reaches all four models** — 2.5 and the 2.0 family share the same group and the same rate, so your code only changes the `model` field.
</Warning>

<CardGroup cols={2}>
  <Card title="Video Generation API Reference" icon="video" href="/en/api-capabilities/seedance2/video-generation">
    `POST /seedance/api/v3/contents/generations/tasks` — async task endpoint with an interactive Playground and full polling/download code.
  </Card>

  <Card title="API Manual" icon="book-open" href="/en/api-manual">
    Token creation, base URL, billing models, and general calling conventions.
  </Card>

  <Card title="Visual API Testing" icon="flask-conical" href="https://icover.ai/seedance-official">
    Debug this endpoint directly in the iCover visual testing tool — no code required.
  </Card>

  <Card title="Async Task Lookup / Download" icon="list-checks" href="https://api.apiyi.com/task">
    View submitted video tasks and download video links in the APIYI console — a lookup entry outside the API.
  </Card>
</CardGroup>

## Let an AI Agent Do the Integration

<Note>
  If you build with Codex / Claude Code / Cursor, copy the prompt below and hand it to your agent. It first fetches the plain-text version of this page (append `.md` to any docs URL), then writes code in your project's own stack — async polling, **the 24-hour link expiry that forces an immediate copy**, the gzip-header trap and the parameter red lines are already baked into the requirements.
</Note>

<Prompt description="Have a coding agent integrate or troubleshoot Seedance 2.5 / 2.0 video generation. Copy and paste into Codex, Claude Code, Cursor and similar tools." icon="bot" actions={["copy"]}>
  Integrate / troubleshoot Seedance 2.5 / 2.0 video generation (text-to-video, first/last frame, multimodal reference, video editing, video extension) in this project.

  Read the docs before you touch code: fetch [https://docs.apiyi.com/en/api-capabilities/seedance2/overview.md](https://docs.apiyi.com/en/api-capabilities/seedance2/overview.md) for the plain-text version of this page. For endpoint detail see the video-generation page, and for asset rules see the asset-library and asset-reference pages, all with the same `.md` suffix.

  Requirements:

  1. Use the three-step async flow, not a synchronous wait. Submit to `POST /seedance/api/v3/contents/generations/tasks` to get a task ID, poll `GET /seedance/api/v3/contents/generations/tasks/{id}`, then download the video on success. Three things are easy to get wrong: **the path prefix is `/seedance/api/v3` — do not drop the `/api`, and do not use `/v1/videos`**; the task ID is the top-level **`id`** field, not `task_id`; and **the success status is `succeeded`, not `completed`** (the machine is `queued` then `running` then `succeeded` / `failed` / `expired`). Polling cadence: wait 20 to 30 seconds after submitting before the first query, then poll every 10 to 20 seconds, with an overall budget of 15 minutes.

  2. Getting the video: the address is at **`content.video_url`** — nested inside `content`, not at the top level. It is a signed link that **expires in 24 hours**, so **download it server-side immediately and re-host it in your own object storage or CDN**; never store it in your database as a long-term address. Do **not** send an `Authorization` header when fetching that link. The task ID itself stays queryable for 7 days.

  3. **Send the `Accept-Encoding: identity` header** if you use Python requests. The gateway labels the response `content-encoding: gzip` while the body is not actually compressed, so without that header you hit random `ContentDecodingError` failures, truncated JSON (the leading `{"` going missing, for instance), or inexplicable 400s. curl and browser fetch are unaffected — only clients that auto-decompress, like requests, are bitten.

  4. Key parameters: pick the model first — `doubao-seedance-2-5-260628` (2.5, recommended) or `doubao-seedance-2-0-260128` / `-fast-260128` / `-mini-260615`. `resolution` is **lowercase** `480p` / `720p` / `1080p`, defaulting to `720p`; **only 2.5 and 2.0 standard support `1080p`** (fast and mini return 400 for it), and **no model in this family supports `4k`**. `ratio` is one of seven values (`16:9`, `4:3`, `1:1`, `3:4`, `9:16`, `21:9`, `adaptive`), defaulting to `adaptive`, and anything outside that set (such as `2:1`) returns 400. `duration`: **on 2.5 it is an integer from 4 to 30 and the default is `-1`** — omit it and the model picks the length itself (measured at 10 seconds in testing, which doubles the cost of a 5-second clip, so **pass it explicitly if cost matters**); on the 2.0 family it is 4 to 15 with a default of 5. **`generate_audio` defaults to `true`**, so you must pass `false` explicitly for silent output. Finally, `frames` and `camera_fixed` belong to Seedance 1.x and are not supported here — do not send them.

  5. Reference images and assets: images go inside `content[]` as `{"type":"image_url", ...}` entries, whose value may be a public URL, a Base64 data URI, or an asset-library ID (`asset://...`). The modes are **mutually exclusive**: first/last frame (2 images, with a required `role` of `first_frame` or `last_frame`), first frame only (1 image), or multimodal reference (**2.5 takes up to 30 images + 10 videos + 10 audio clips, and audio may be used on its own**; the 2.0 family takes 9 images + 3 videos + 3 audio clips and requires at least one image or video alongside audio). Each image must be under 30MB, with edges between 300 and 6000px and an aspect ratio between 0.4 and 2.5. **Images containing real human faces are rejected by upstream moderation** — those must first be enrolled in the asset library and then referenced as `asset://`, with the prompt naming them positionally as image 1, image 2 and so on. **Never write a raw asset ID into the prompt.**

  6. **Two hard constraints that exist only on 2.5, and violating them returns 400 outright**: for first-frame / first+last-frame, video editing, and video extension tasks the `ratio` **must be `adaptive`** — a concrete aspect ratio is rejected; and for video editing the `duration` **must be `-1`**, with the source video between 4 and 30 seconds. For edit or extend work, pass `omni_reference_task_type` explicitly (`edit` / `extend` / `auto`) so invalid parameters fail synchronously at submission with `InvalidParameter.TaskTypeConstraint` instead of failing the task minutes later. 2.5 also accepts `output_format` (`mp4` by default, or `mov`); mov is a high-colour-fidelity format for professional post-production that some players cannot open.

  7. Billing and errors: billing is token-based and driven by **resolution area multiplied by duration**, so all aspect ratios at the same resolution cost the same. **One video produces two billing rows in the logs** (a hold at submission, then reconciliation at completion) — this is normal, the true cost is their sum, and it is not double billing. Parameter 400s are not billed, and errors with a `PUBLIC_` prefix are upstream moderation blocks that are likewise not billed and can be retried after adjusting the asset or prompt. An error saying no channel is available for the model means the token group is wrong — **2.5 and the 2.0 family both use the `SeeDance2` group** (`mini` / `fast` also have the discounted `SD2Mini` / `SD2Fast`), with a pay-as-you-go or PAYG-priority billing mode. When a generation fails, including on moderation, **do not retry the identical prompt repeatedly**.

  8. Read the key from the `APIYI_API_KEY` environment variable. Never hardcode it, never commit it to git.

  9. When you are done, actually run one text-to-video call and one first-frame image-to-video call, then show me the videos and what those two calls cost. Note the whole flow takes several minutes, so if you run in a constrained execution environment, raise the command timeout above 600 seconds or run it in the background.
</Prompt>

<Accordion title="What this prompt saves you from">
  | Requirement                                     | Pitfall it prevents                                                                                                    |
  | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
  | Success status is `succeeded`                   | Porting from another video model, you naturally write `completed` and then poll forever without ever seeing success    |
  | Task ID is the top-level `id`                   | It is not called `task_id`, and the video address is nested at `content.video_url` rather than at the top level        |
  | Send `Accept-Encoding: identity`                | The gateway's gzip header contradicts the body, so Python requests randomly throws decode errors or truncates the JSON |
  | Download and re-host at once                    | The link expires in 24 hours, and sending `Authorization` while downloading actually breaks it                         |
  | Two billing rows are normal                     | A hold plus a settlement, not double billing; the real cost is their sum                                               |
  | Real faces go through the asset library         | Sending a photo of a real person directly is rejected by moderation; enroll it first and reference it as `asset://`    |
  | On 2.5 `duration` defaults to `-1`              | Omit the duration and the model picks its own length (10 s in testing), doubling the cost                              |
  | On 2.5 three task types force `ratio: adaptive` | First/last frame, editing, and extension reject any concrete aspect ratio with a 400                                   |
</Accordion>

## Why APIYI's Seedance?

A note on positioning first: this model carries **no official discount, and APIYI doesn't price it for profit** — it is offered to **secure supply and serve customers**. The real value of going through APIYI is not "cheaper", but access and experience:

<CardGroup cols={2}>
  <Card title="Official Resource · Mainland Edition" icon="shield-check">
    Official Volcengine Mainland China resources (not BytePlus international), with upstream content safety built in. Parameters, responses, and billing match the official API exactly.
  </Card>

  <Card title="Virtual-face Whitelist Access" icon="scan-face">
    The channel comes with upstream **virtual-face whitelist** access: AI-generated faces and virtual avatars can be used directly for image-to-video, no separate whitelist application to the official channel needed (real human faces remain restricted by upstream content safety).
  </Card>

  <Card title="Asset Library Included Free" icon="images">
    The [private asset library](/en/api-capabilities/seedance2/asset-library) behind character-consistent video (virtual-avatar ingest + real-person verification) is **free on APIYI**. Officially it is a separately purchased add-on — a six-figure CNY annual contract for customers without a framework agreement. We include it in the API price.
  </Card>

  <Card title="Supply-first Pricing · On Par with Official" icon="percent">
    No official discount exists, and APIYI doesn't profit from this model: unit prices align with Volcengine's official list (on-platform billing runs roughly 10% higher); combined with [top-up bonuses](/en/faq/recharge-promotions) the effective cost is **about on par with the official channel**, and high-tier recharge customers can land below it on some tiers.
  </Card>

  <Card title="Unlimited Concurrency · No Queuing" icon="infinity">
    In our tests, 15 simultaneous tasks all entered `running` immediately with zero queuing (measured 2026-06-06 (UTC+8)) — ready for batch production at scale.
  </Card>

  <Card title="Zero-friction Access · No ID Verification" icon="globe">
    **No Volcengine account, no real-name/identity verification, no spending threshold** (skip the CNY 200 activation deposit and enterprise verification). Mainland China data centers, residential networks, and overseas nodes can all reach `api.apiyi.com` directly with a single Token.
  </Card>

  <Card title="Full Video Model Lineup" icon="layers">
    [VEO 3.1](/en/api-capabilities/veo-3-1-official/overview) and [Wan2.7](/en/api-capabilities/wan/overview) are available on the same platform — mix and match per use case.
  </Card>

  <Card title="Professional Support" icon="handshake">
    A team experienced in video-generation workloads, providing model selection, tuning, and integration support from PoC to production.
  </Card>
</CardGroup>

## Key Features

<CardGroup cols={2}>
  <Card title="Three Tiers · Same Price per Tier" icon="monitor">
    480p / 720p / 1080p (**1080p on 2.5 and 2.0 standard only**; fast and mini cap at 720p). Within a tier, 16:9, 9:16, 1:1, and every other ratio share the **same pixel area and the same price** — switch between landscape and portrait at zero cost.
  </Card>

  <Card title="Synchronized Audio by Default" icon="volume-2">
    `generate_audio` defaults to true: voice, sound effects, and background music are generated to match the visuals. Put spoken lines in double quotes to improve voice-over quality.
  </Card>

  <Card title="Up to 30 s Controllable Duration" icon="timer">
    2.5 accepts whole seconds from **4 to 30**, the 2.0 family 4 to 15; `-1` lets the model pick a length (billed by actual output). **On 2.5 the `duration` default is `-1`** — omit it and the model chooses for you. Fixed 24 fps.
  </Card>

  <Card title="Multilingual Prompts" icon="languages">
    Chinese (up to \~500 chars) and English (up to \~1000 words), plus Japanese, Spanish, Portuguese, and Indonesian.
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="First+Last / First Frame" icon="image">
    Pin both first and last frames with two images, or animate a single image as the first frame. Combine with `return_last_frame` to chain clips into longer continuous videos.
  </Card>

  <Card title="Multi-modal Reference-to-Video" icon="images">
    2.5 takes up to **30 images + 10 videos + 10 audios**, and audio can be used on its own; the 2.0 family takes 9 images + 3 videos + 3 audios, with audio requiring an image or video alongside it. Create, edit, or extend videos while keeping characters and style consistent.
  </Card>

  <Card title="Async Task Flow" icon="clock">
    Submit and get a `task_id`, poll for status, then download the mp4 from `content.video_url` (link valid for 24 hours).
  </Card>

  <Card title="Reproducible Seeds" icon="dices">
    Fix `seed` for similar results across runs. `watermark` defaults to false — output is watermark-free.
  </Card>
</CardGroup>

## Pricing

<Info>
  **Pricing in one line — precise token billing, tier-by-tier pegged to the Volcengine official site.** The four models are **priced differently**: mini \< fast \< standard \< **2.5** (same direction as the official site; mini runs at about half the standard model's unit price and 2.5 at about 1.5× it — **they are NOT the same price level**). Volcengine offers **no discount** on this series, and this channel is priced to secure supply, so the nominal rate sits slightly above the official one; with the [top-up bonus](/en/faq/recharge-promotions) (10% for general customers, up to 20% for large-deposit customers) the effective cost is **essentially on par with the official site** — large-deposit customers pay only about 5% more, and at some tiers (e.g. 1080p large-customer price) even less. Billing is by area×duration, so a **±5% deviation is normal** — you're welcome to test, reconcile, and reach out anytime.

  One more thing: the [asset library](/en/api-capabilities/seedance2/asset-library) required for character-consistent video is **included free on APIYI** (officially a separately purchased add-on — a six-figure CNY annual contract for customers without a framework agreement). That value is not reflected in the unit-price comparison above.
</Info>

Token-based billing: `tokens ≈ (input video duration + output duration)(s) × output width × output height × 24 / 1024` (input video duration is 0 for text-/image-to-video; verified in our tests to within 0.1%). Since every ratio in a tier has the same pixel area, **price depends only on the resolution tier, output duration, and whether the input includes video**.

### Official price anchors (16:9 / 5 s output, CNY per video)

**① No input video** (text-to-video / image-to-video / reference images):

| Resolution | Standard `doubao-seedance-2.0` | Fast          | Mini          |
| ---------- | ------------------------------ | ------------- | ------------- |
| 480p       | CNY 2.31                       | CNY 1.86      | CNY 1.16      |
| 720p       | CNY 4.97                       | CNY 4.00      | CNY 2.50      |
| 1080p      | CNY 12.39                      | Not supported | Not supported |

**② With input video** (multi-modal reference incl. `video_url`; input video 2-15 s, low end ≈ 2-4 s input, high end ≈ 15 s input):

| Resolution | Standard `doubao-seedance-2.0` | Fast            | Mini            |
| ---------- | ------------------------------ | --------------- | --------------- |
| 480p       | CNY 2.53 - 5.62                | CNY 1.99 - 4.42 | CNY 1.28 - 2.84 |
| 720p       | CNY 5.44 - 12.10               | CNY 4.28 - 9.50 | CNY 2.74 - 6.10 |
| 1080p      | CNY 13.56 - 30.13              | Not supported   | Not supported   |

<Note>
  With input video, billed duration = **input video duration + output duration**, so it costs more than plain text-/image-to-video; a minimum-token floor also applies (very short inputs bill at the floor). The authoritative usage is the returned `usage.completion_tokens`.
</Note>

**Measured on-platform comparison** (tested 2026-06 and 2026-07, 16:9 / default audio / no input video; CNY at the fixed 1:7 rate, for reference only):

| Model                             | Resolution | Duration | APIYI cost | CNY    | General ÷1.1 (¥) | Large customer ÷1.2 (¥) | Official ref (¥) |
| --------------------------------- | ---------- | -------- | ---------- | ------ | ---------------- | ----------------------- | ---------------- |
| `doubao-seedance-2-0-fast-260128` | 720p       | 5s       | \$0.7253   | ¥5.08  | ¥4.62            | ¥4.23                   | ¥4.00            |
| `doubao-seedance-2-0-fast-260128` | 480p       | 5s       | \$0.3373   | ¥2.36  | ¥2.15            | ¥1.97                   | ¥1.86            |
| `doubao-seedance-2-0-260128`      | 720p       | 5s       | \$0.9074   | ¥6.35  | ¥5.77            | ¥5.29                   | ¥4.97            |
| `doubao-seedance-2-0-260128`      | 480p       | 5s       | \$0.4193   | ¥2.94  | ¥2.67            | ¥2.45                   | ¥2.31            |
| `doubao-seedance-2-0-260128`      | 1080p      | 5s       | \$2.0288   | ¥14.20 | ¥12.91           | ¥11.84                  | ¥12.39           |
| `doubao-seedance-2-0-fast-260128` | 720p       | 4s       | \$0.5814   | ¥4.07  | ¥3.70            | ¥3.39                   | ¥3.20            |
| `doubao-seedance-2-0-fast-260128` | 720p       | 8s       | \$1.1568   | ¥8.10  | ¥7.36            | ¥6.75                   | ¥6.40            |
| `doubao-seedance-2-0-mini-260615` | 720p       | 5s       | \$0.4508   | ¥3.16  | ¥2.87            | ¥2.63                   | ¥2.50            |
| `doubao-seedance-2-0-mini-260615` | 480p       | 4s       | \$0.1681   | ¥1.18  | ¥1.07            | ¥0.98                   | ¥0.93            |
| `doubao-seedance-2-0-mini-260615` | 720p       | 15s      | \$1.3451   | ¥9.42  | ¥8.56            | ¥7.85                   | ¥7.47            |

<Warning>
  **The three models are NOT the same price — never treat them as equal.** At the same resolution/duration, per-token price goes mini \< fast \< standard (e.g. 720p/5s: mini ≈ ¥3.16, fast ≈ ¥5.08, standard ≈ ¥6.35), matching the official price ladder. For batch production, mini **saves the most money and time** (our 2026-07 tests measured its effective unit price at exactly the platform's nominal rate, 0.00% deviation); 1080p is standard-only.
</Warning>

Note: "CNY" is the on-platform list charge; "General ÷1.1" and "Large customer ÷1.2" are the effective prices after a 10% / 20% [top-up bonus](/en/faq/recharge-promotions) — after the bonus, prices land close to the official reference, and the 1080p large-customer price is even below official. The authoritative usage is the returned `usage.completion_tokens`.

### Seedance 2.5 Pricing (`SeeDance2` group, 0.18x)

2.5 and the 2.0 family share **the same `SeeDance2` group and the same 0.18x rate** — the gap between generations comes entirely from the models' own unit prices. 720p/5s costs \$1.3721 on 2.5 versus \$0.9074 on the 2.0 standard model, roughly **1.5x**. That gap **mirrors Volcengine's own list prices** (their 2.5 token rate is about 52% above 2.0); it is not an APIYI markup. Whether the upgrade is worth it comes down to whether you actually need 30-second clips, 30 reference images, mov output, or video editing/extension — if you do not, the 2.0 standard model is cheaper and **also supports 1080p**.

**① No video in the input** (text-to-video, image-to-video, reference images):

| Resolution | Duration | Tokens  | APIYI cost | CNY    | General ÷1.1 (CNY) | Large customer ÷1.2 (CNY) |
| ---------- | -------- | ------- | ---------- | ------ | ------------------ | ------------------------- |
| 480p       | 4s       | 38,830  | \$0.4893   | ¥3.42  | ¥3.11              | ¥2.85                     |
| 480p       | 5s       | 48,437  | \$0.6103   | ¥4.27  | ¥3.88              | ¥3.56                     |
| 720p       | 5s       | 108,900 | \$1.3721   | ¥9.60  | ¥8.73              | ¥8.00                     |
| 720p       | 10s      | 216,900 | \$2.7329   | ¥19.13 | ¥17.39             | ¥15.94                    |
| 720p       | 30s      | 648,900 | \$8.1761   | ¥57.23 | ¥52.03             | ¥47.69                    |
| 1080p      | 5s       | 245,025 | \$3.0873   | ¥21.61 | ¥19.65             | ¥18.01                    |

**② Video in the input** (multi-modal reference with `video_url`, video editing, video extension): billed at a **separate, lower token rate**.

| Resolution | Output duration | Input video | Tokens | APIYI cost | CNY   |
| ---------- | --------------- | ----------- | ------ | ---------- | ----- |
| 480p       | 4s              | about 5 s   | 86,867 | \$0.6567   | ¥4.60 |

A lower rate does not mean a lower bill: with video in the input, **billable tokens = (input video duration + output duration) × area**, so the token count itself grows. The row above would cost \$1.0945 at rate ①; on rate ② it is \$0.6567.

**The two token rates**:

| Tier                                                | \$ per million tokens |
| --------------------------------------------------- | --------------------- |
| ① No video in the input (480p / 720p / 1080p alike) | **\$12.60**           |
| ② Video in the input                                | **\$7.56**            |

Both the token counts and the two rates come from actual billing logs (re-verified 2026-08-31), not from a rate calculation. After stacking the [recharge bonus](/en/faq/recharge-promotions), high-tier recharge customers land close to the official reference price.

<Warning>
  **The two easiest ways to overspend on 2.5**:

  1. **`duration` defaults to `-1`** (the 2.0 family defaults to 5). Omit it and 2.5 picks its own length between 4 and 30 seconds — a test request with no duration returned a 10-second clip, exactly twice the cost of 5 seconds. **Pass `duration` explicitly when cost matters.**
  2. **30 seconds costs 6× what 5 seconds costs** (¥57.23 vs ¥9.60 at 720p). Cost scales strictly with duration, so validate the prompt at 5 seconds before committing to long clips.
</Warning>

The tables above and the 2.0 table further up are **both on the `SeeDance2` group at 0.18x**, so they can be compared directly. `fast` and `mini` also have **limited-time discount groups** with lower prices — see the next section.

<Info>
  **Billing notes**:

  * Final charges follow the console's model pricing and call logs
  * **Tasks are pre-charged on submission and settled on completion** — your balance fluctuates briefly; reconcile against call logs, where one video produces **two** charge entries (see "Reading charges in the logs" below)
  * **The hold is based on duration alone, independent of resolution**: \$0.09/second for the 2.0 family, \$0.135/second for 2.5. That is why 1080p usually settles with an extra charge and 480p usually gets a partial refund — both are normal
  * Rejected requests (HTTP 400 parameter errors, etc.) are **not billed** (verified)
  * Cost scales linearly with duration: a 15 s video costs about 3× a 5 s one
</Info>

### Limited-time discount groups (mini / fast only, through 9/7)

<Info>
  **Two limited-time discount groups launched 2026-08-08**: `SD2Mini` (**0.10x** rate) and `SD2Fast` (**0.15x** rate). Against the regular `SeeDance2` group at 0.18x, that is **44.4% off for mini and 16.7% off for fast**. Model capabilities, parameters, endpoints, and call syntax are unchanged — **swap in one Token, leave your code alone**. Offer runs through **2026-09-07 23:59 (UTC+8)**.
</Info>

**Like-for-like price comparison** (scaled from the measured figures above in proportion to the new group rate, that is, divided by 0.18 and multiplied by the new rate; CNY converted at the fixed 1:7 rate, for reference only):

| Model  | Resolution / duration | Regular `SeeDance2` (0.18x) | Discount group | Discounted charge    | Reduction |
| ------ | --------------------- | --------------------------- | -------------- | -------------------- | --------- |
| `mini` | 720p / 5s             | \$0.4508 (¥3.16)            | `SD2Mini`      | **\$0.2504 (¥1.75)** | −44.4%    |
| `mini` | 480p / 4s             | \$0.1681 (¥1.18)            | `SD2Mini`      | **\$0.0934 (¥0.65)** | −44.4%    |
| `mini` | 720p / 15s            | \$1.3451 (¥9.42)            | `SD2Mini`      | **\$0.7473 (¥5.23)** | −44.4%    |
| `fast` | 720p / 5s             | \$0.7253 (¥5.08)            | `SD2Fast`      | **\$0.6044 (¥4.23)** | −16.7%    |
| `fast` | 480p / 5s             | \$0.3373 (¥2.36)            | `SD2Fast`      | **\$0.2811 (¥1.97)** | −16.7%    |
| `fast` | 720p / 4s             | \$0.5814 (¥4.07)            | `SD2Fast`      | **\$0.4845 (¥3.39)** | −16.7%    |
| `fast` | 720p / 8s             | \$1.1568 (¥8.10)            | `SD2Fast`      | **\$0.9640 (¥6.75)** | −16.7%    |

Same model, same spec: the discount groups save **44.4% on mini and 16.7% on fast**. This is a straight group-rate reduction and stacks independently with the [top-up bonus](/en/faq/recharge-promotions). Billing is unchanged — still settled on actual token usage, with ±5% deviation being normal.

<Warning>
  **Nothing gets cut off when the offer ends**: after 2026-09-07 23:59 (UTC+8), `SD2Mini` and `SD2Fast` **stay online** — their rate simply reverts to 0.18x, matching the regular `SeeDance2` group. Your Tokens keep working and no code changes are needed. If you have batch production planned, schedule it inside the discount window.
</Warning>

### Reading charges in the logs (pre-charge + settlement)

Open the console log page at `api.apiyi.com/log` and search for the model name `doubao-seedance-2-0` to see every charge. **One video produces two charge entries**:

1. **Pre-charge**: an estimated amount deducted when the task is submitted (log entry labeled "non-streaming", showing the token and group) — \$0.449998 in the screenshot below
2. **Settlement (charge or refund)**: after the task completes, the difference is settled against the actual generated tokens (log entry labeled "streaming", with a completion-token count) — \$5.611858 below; **1080p usually incurs an additional charge**

<Frame caption="Two charge entries for one 15 s 1080p video: pre-charge + settlement">
  <img src="https://mintcdn.com/apiyillc/ae60mWKk0AtXJTS1/images/seedance2-billing-log-two-entries.png?fit=max&auto=format&n=ae60mWKk0AtXJTS1&q=85&s=9e6583b5467c886a02da82513eb6a154" alt="APIYI log page showing the two charge entries for one Seedance 2.0 video: pre-charge and settlement" width="2000" height="624" data-path="images/seedance2-billing-log-two-entries.png" />
</Frame>

<Note>
  The settlement entry shows **neither the token nor its group** — this is normal. The sum of the two entries is the video's total cost.
</Note>

**How to read the time fields**:

1. The first entry's (pre-charge) timestamp is the video's **submission time**; its "first byte" value is how long the submission took to return a task ID (e.g. `首字节:3秒` / first byte: 3 s) — **not** the generation time
2. The settlement entry shows `流式` (streaming) and `首字节:<1秒` (first byte under 1 s) — these are just internal markers on the settlement record, **not a sign of any problem**
3. The video's actual **generation time** is the "耗时" (elapsed) column on the "Async tasks" page (`api.apiyi.com/task`) in the top navigation

<Frame caption="The first log entry's timestamp = submission time, and its first-byte value (3 s) is the submission latency; this fast example settled as a refund (negative amount), total cost 0.360000 − 0.022750 = 0.337250 USD">
  <img src="https://mintcdn.com/apiyillc/ae60mWKk0AtXJTS1/images/seedance2-billing-log-time-fields.png?fit=max&auto=format&n=ae60mWKk0AtXJTS1&q=85&s=ec4fd88847492864468cc91ffb643ca9" alt="Reading the time and first-byte fields on the log page: the first entry is the submission time and submission latency" width="1248" height="332" data-path="images/seedance2-billing-log-time-fields.png" />
</Frame>

<Frame caption="The elapsed column on the Async tasks page is the actual video generation time, e.g. 158 s, 303 s">
  <img src="https://mintcdn.com/apiyillc/ae60mWKk0AtXJTS1/images/seedance2-task-page-elapsed-time.png?fit=max&auto=format&n=ae60mWKk0AtXJTS1&q=85&s=9c1b2073b12afebcf1182246a6685a71" alt="The Async tasks page showing each video task's submission time and generation elapsed time" width="1506" height="532" data-path="images/seedance2-task-page-elapsed-time.png" />
</Frame>

For the 15 s 1080p video in the first screenshot, the total cost = 0.449998 + 5.611858 = **\$6.061856**. The matching task parameters are visible under "Async tasks" at the top of `api.apiyi.com/task`, and they line up exactly with the charges:

```json theme={null}
{
  "id": "cgt-20260703185641-9nbbg",
  "model": "doubao-seedance-2-0-260128",
  "status": "succeeded",
  "duration": 15,
  "resolution": "1080p",
  "ratio": "3:4",
  "framespersecond": 24,
  "generate_audio": true
}
```

The 732,108 completion tokens ≈ 15 × 1248 × 1664 × 24 / 1024 (a 3:4 video at 1080p outputs 1248×1664) — consistent with the billing formula.

<Note>
  This 15 s 1080p video totals about **¥42.4** (nominal charge at the fixed 1:7 rate); with the [top-up bonus](/en/faq/recharge-promotions) the effective cost is roughly ¥35-39, versus an official reference of about ¥37.2 for the same spec. **The official pricing itself is not cheap** — cost is driven by **model + resolution + duration** (switching to fast / 720p / 5 s is far cheaper). This model is supplied at a thin margin to secure availability, and large-deposit customers get bigger discounts.
</Note>

<Note>
  **Beta-supply notice**: Seedance 2.5 and the 2.0 family are currently in a beta supply phase. If your actual charges deviate noticeably from the table above, contact customer support and we will reconcile. Pricing will be adjusted dynamically with upstream policy (e.g. if a lower-priced official variant ships later) and APIYI's supply capacity; capable channel partners are welcome to reach out. This model is priced to **secure supply and serve customers**, not for profit.
</Note>

## Group Setup

Seedance 2.5 and the 2.0 family run on a **dedicated group**, with two **hard requirements**: ① the Token's billing model must be **Pay-as-you-go Priority** (or Pay-as-you-go) — Pay-per-request tokens cannot route; ② the Token must have the **matching group** enabled. Tokens on the Default group or other video groups will fail with "**no available channel for this model**".

There are three groups today. **2.5 and the 2.0 family share `SeeDance2`**, plus two limited-time discount groups that each serve exactly one model:

| Group       | Rate      | Models served                                      | Notes                                                                                                          |
| ----------- | --------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `SeeDance2` | 0.18x     | **All four models** (2.5 / standard / fast / mini) | The only route to 2.5 and the standard model; the fallback once the offer ends — ample concurrency, no queuing |
| `SD2Mini`   | **0.10x** | `doubao-seedance-2-0-mini-260615` only             | 🔥 Limited-time, **44.4% below** the original rate, through 2026-09-07 23:59 (UTC+8)                           |
| `SD2Fast`   | **0.15x** | `doubao-seedance-2-0-fast-260128` only             | 🔥 Limited-time, **16.7% below** the original rate, through 2026-09-07 23:59 (UTC+8)                           |

<Note>
  **One `SeeDance2` token reaches all four models**: 2.5 and the three 2.0-family models all live in this group, so your code only changes the `model` field.

  **The two discount groups are single-model channels**: `SD2Mini` carries only mini and `SD2Fast` only fast, so calling any other model through them returns the same error.

  **No cutoff when the offer ends**: after 2026-09-07 23:59 (UTC+8) both discount groups stay online with the rate reverting to 0.18x — no Token or code changes required.
</Note>

<Note>
  **2.5 uses the same 0.18x.** The gap between generations comes from the models' own unit prices (Volcengine prices 2.5 above 2.0), not from the group rate — so 2.5 and the 2.0 family run on exactly the same conversion basis.

  **Why 0.18x?** The system's built-in unit prices for Seedance match Volcengine's official list prices — but that list is denominated in **CNY**, while APIYI balances are denominated in **USD** (fixed 1:7 USD/CNY rate). A 1x rate would effectively charge 7× the official number, so the group rate is lowered to absorb the currency conversion — **that is where 0.18 comes from: not a discount, and not a markup**.

  Volcengine offers **no discount** on this series, and this channel is priced to secure supply. The nominal charge sits slightly above the official reference price by default, and the [top-up bonus](/en/faq/recharge-promotions) largely absorbs it: **large-deposit customers pay only about 5% more**, and some tiers (1080p, for instance) land below the official price.

  **Please be aware**: billing is always based on **actual token usage**, and token conversion carries a small natural variance (±5% is normal); the official list price is only a **reference anchor**, not a per-request guarantee. The current pricing is a reasonable supply-first arrangement — always evaluate it **together with the recharge bonus**. If a charge looks off, we're happy to reconcile bills with you anytime; however, "why is it slightly above the official price" is not up for debate — please keep this in mind, and skip this channel if that is a concern. On the flip side, **ample concurrency with no queuing** is exactly what this channel delivers.

  On top of that, the [asset library](/en/api-capabilities/seedance2/asset-library) (virtual-avatar ingest / real-person verification) is **included free on this channel** — officially it takes a six-figure CNY annual contract to purchase separately. That is part of what this channel is actually worth.
</Note>

### How to set up your Tokens

**If you are not chasing the discounts**: create one Token with the `SeeDance2` group enabled — it reaches **all four models** — and skip the table below.

**If you want the limited-time discounts**: `mini` and `fast` have single-model groups of their own, so split Tokens as below:

| Token                   | Primary group | What it runs                                                                           |
| ----------------------- | ------------- | -------------------------------------------------------------------------------------- |
| **A (new · discount)**  | `SD2Mini`     | `doubao-seedance-2-0-mini-260615` only, at 0.10x                                       |
| **B (new · discount)**  | `SD2Fast`     | `doubao-seedance-2-0-fast-260128` only, at 0.15x                                       |
| **C (existing · main)** | `SeeDance2`   | 2.5 and the 2.0 standard model; the whole 2.0 family falls back here after September 7 |

Every Token must use the Pay-as-you-go Priority (or Pay-as-you-go) billing model. If you only use mini, one Token A is enough; if you only use 2.5, one Token C is enough — you do not need all of them.

<Tip>
  **Why a separate discount Token is worth it**:

  * **You won't miss the deadline** — billing is split per Token, so what you used and saved during the offer is visible at a glance, and it is easier to decide whether to pull batch work forward as September 7 approaches
  * **Switching costs nothing** — when the offer ends, point your client back at Token C; no code changes, no group edits
  * **Dedicated Tokens are the production recommendation anyway** — per-business-line quota control and alerts, and far easier to trace an unexpected spike
</Tip>

<Info>
  **Seedance 2.5 is live** (2026-08-28): the model name is `doubao-seedance-2-5-260628`, on the same **`SeeDance2` group** (0.18x) as the 2.0 family. Endpoint, auth, and request shape are identical to 2.0 — **swap the `model` field and your code keeps working**. Against the 2.0 family: duration cap 15 s → **30 s**, reference images 9 → **30**, reference videos/audio 3 → **10**, audio usable on its own, plus **mov** output and the `omni_reference_task_type` task selector. It runs at roughly 1.5× the 2.0 standard model. See "Technical Specs" below for the full diff.
</Info>

## Technical Specs

| Dimension                      | Seedance 2.5                                                                                          | Seedance 2.0 family (standard / fast / mini)                                                     |
| ------------------------------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Models**                     | `doubao-seedance-2-5-260628`                                                                          | `doubao-seedance-2-0-260128` / `-fast-260128` / `-mini-260615`                                   |
| **Resolutions**                | 480p / 720p / **1080p** (no 4k)                                                                       | 480p / 720p / 1080p (1080p standard-only; fast and mini cap at 720p)                             |
| **Video codec**                | 1080p outputs **H.265 (hvc1)**; 480p / 720p output H.264 (avc1)                                       | H.264 (avc1)                                                                                     |
| **Aspect ratios**              | Same as right; **first/last frame, editing, and extension force `adaptive`**                          | `16:9` `4:3` `1:1` `3:4` `9:16` `21:9` `adaptive` (default adaptive)                             |
| **Duration**                   | **4-30** whole seconds, or `-1` model-chosen (**default is `-1`**)                                    | 4-15 whole seconds, or `-1` model-chosen (default 5)                                             |
| **Frame rate**                 | Fixed 24 fps (`frames` parameter not supported)                                                       | Same                                                                                             |
| **Output format**              | `output_format`: `mp4` (default) or **`mov`** (H.264 + yuv444p + PCM, for professional post)          | mp4 only                                                                                         |
| **Audio**                      | `generate_audio` defaults to `true`; mono                                                             | Same                                                                                             |
| **Reference limits**           | **30 images + 10 videos + 10 audio clips**; **audio may be the only reference**                       | 9 images + 3 videos + 3 audio clips; audio must accompany an image or video                      |
| **Task type parameter**        | `omni_reference_task_type`: `auto` / `edit` (video editing) / `extend` (video extension)              | Not supported                                                                                    |
| **Input images**               | jpeg/png/webp/bmp/tiff/gif/heic/heif; aspect ratio (0.4, 2.5); sides (300, 6000) px; under 30 MB each | Same                                                                                             |
| **Generation time (measured)** | 480p/4s: \~1.5-5 min; 720p/5s: \~2.5 min; **720p/30s: \~5.5 min**; 1080p/5s: \~2.5 min                | 5 s @720p: \~2-5 min; 1080p: \~3 min; 15 s: \~4.5 min; mini is faster (5 s @720p: \~1.5-2.5 min) |
| **Response fields**            | `content.video_url` (direct link, **expires in 24 h**), `usage.completion_tokens`                     | Same                                                                                             |
| **Task retention**             | task\_id queryable for 7 days                                                                         | Same                                                                                             |

## API Endpoints

| Endpoint                                               | Purpose                                | Content-Type       |
| ------------------------------------------------------ | -------------------------------------- | ------------------ |
| `POST /seedance/api/v3/contents/generations/tasks`     | Create a video generation task         | `application/json` |
| `GET /seedance/api/v3/contents/generations/tasks/{id}` | Poll task status / fetch the video URL | —                  |

<Tip>
  **Domains**: `api.apiyi.com` is the primary gateway; `vip.apiyi.com` and other platform domains behave identically. The path prefix is `/seedance/api/v3` — **do not drop the `/api` segment**, and do not use `/v1/videos`.
</Tip>

## Resolutions & Aspect Ratios in Detail

A resolution tier defines the **pixel area**, not the short side. Actual output dimensions per ratio (official values, verified in our tests):

| Ratio      | 480p                                            | 720p     | 1080p (2.5 / standard only) |
| ---------- | ----------------------------------------------- | -------- | --------------------------- |
| `16:9`     | 864×496                                         | 1280×720 | 1920×1080                   |
| `4:3`      | 752×560                                         | 1112×834 | 1664×1248                   |
| `1:1`      | 640×640                                         | 960×960  | 1440×1440                   |
| `3:4`      | 560×752                                         | 834×1112 | 1248×1664                   |
| `9:16`     | 496×864                                         | 720×1280 | 1080×1920                   |
| `21:9`     | 992×432                                         | 1470×630 | 2206×946                    |
| `adaptive` | Model picks one of the above based on the input | Same     | Same                        |

<Note>
  **On 2.5, 480p 16:9 is 854×480** (measured), not the 864×496 that 2.0 produces — slightly smaller in area, so the same spec costs slightly fewer tokens. Every other tier we measured matches across both generations: 480p 1:1 = 640×640, 720p 16:9 = 1280×720, 720p 21:9 = 1470×630, 1080p 16:9 = 1920×1080.

  **No model in this family supports `4k`** — sending `"resolution": "4k"` returns a synchronous 400 (not billed).
</Note>

### How adaptive works

1. **Text-to-video**: the model infers the best ratio from your prompt
2. **First+last / first frame**: matches the first-frame image's ratio (mismatched images are center-cropped)
3. **Multi-modal reference-to-video**: follows prompt intent, otherwise the first media item (video takes priority over images)
4. **Video editing / extension (2.5)**: the output ratio follows the input video being edited or extended
5. The actual ratio used is returned in the task response's `ratio` field

<Warning>
  `ratio` only accepts the 7 enum values above — passing e.g. `"2:1"` returns an `InvalidParameter` error (verified), as does a `duration` outside the supported range (4-30 on 2.5, 4-15 on the 2.0 family). Neither is billed.

  **2.5 additionally forces `ratio: adaptive` on three task types**: first-frame / first+last-frame generation, video editing, and video extension. Passing a concrete aspect ratio there returns `InvalidParameter.TaskTypeConstraint` **at submission time** (measured: a synchronous 400, not a task that fails minutes later).
</Warning>

## Best Practices

<Steps>
  <Step title="Pick the model by output needs">
    **Start by asking whether you need what only 2.5 has**: 30-second clips, 30 reference images, standalone audio references, mov output, or explicit video-edit/extend task types. If you need any of them, pick `doubao-seedance-2-5-260628` (roughly 1.5× the standard model's price, same group as the 2.0 family). If not, stay on the 2.0 family: **for batch production and cost-sensitive workloads use the lite model** `doubao-seedance-2-0-mini-260615` (about half the standard price and the fastest generation, capped at 720p); for 1080p or top quality use the standard model; `fast` is the middle ground.
  </Step>

  <Step title="Ingest images and video to asset IDs first">
    When a request carries media, create-task latency is dominated by **uploading that media**: inline Base64 or a large image URL stretches submission from about a second to tens of seconds, or into a read timeout. Ingest the media first, get an `asset://` asset ID, and reference that — the request body shrinks to a few dozen bytes, the task ID comes back immediately, and content checks move up to ingest time. See [Asset-First Workflow](/en/api-capabilities/seedance2/asset-first-workflow).
  </Step>

  <Step title="Use adaptive to avoid cropping">
    For image-to-video keep the default `adaptive` so the model matches your source image's ratio. Lock `9:16` (portrait) or `16:9` (landscape) only when the target platform demands it.
  </Step>

  <Step title="Duration is your cost dial">
    Cost scales strictly with length. Validate prompts with 5 s clips first, then scale up (2.5 goes to 30 s, which costs 6× a 5 s clip). **On 2.5, always pass `duration` explicitly** — its default is `-1`, so omitting it lets the model choose, and in testing it chose 10 seconds, doubling the cost.
  </Step>

  <Step title="Turn audio off when you don't need it">
    `generate_audio` defaults to true. Pass `false` for silent footage you plan to score yourself.
  </Step>

  <Step title="Quote dialogue for better voice-over">
    Put spoken lines inside double quotes in the prompt — the model generates matching voices automatically.
  </Step>

  <Step title="Add Accept-Encoding: identity in HTTP clients">
    The gateway labels responses `content-encoding: gzip` while the body is uncompressed; auto-decompressing clients such as Python requests raise `ContentDecodingError`. Adding the `Accept-Encoding: identity` header avoids this (curl is unaffected).
  </Step>

  <Step title="Poll every 15-30 s and download immediately">
    Tasks typically finish in 2-5 minutes. `content.video_url` is a signed link valid for 24 hours — copy the file to your own storage as soon as the task succeeds.
  </Step>

  <Step title="Chain clips with return_last_frame">
    Set `return_last_frame: true` to get a watermark-free last-frame png, then use it as the next task's first frame to build continuous multi-clip videos.
  </Step>
</Steps>

## Error Codes & Retries

| Code                                                | Meaning                                                                                                               | Suggested handling                                                                                                                 |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `400`                                               | `InvalidParameter`: bad resolution/ratio/duration (e.g. fast or mini + 1080p, any model + 4k, 2.5 + `duration: 31`)   | The message names the offending parameter — fix per the tables above; not billed                                                   |
| `400`                                               | `InvalidParameter.TaskTypeConstraint` (**2.5 only**): parameters conflict with the task type                          | Set `ratio` to `adaptive` for first/last-frame, editing, and extension tasks; set `duration` to `-1` for editing tasks; not billed |
| Task `failed` + `InvalidParameter.TaskTypeMismatch` | **2.5 only**: the declared `omni_reference_task_type` does not match the task type the model inferred from the prompt | Align the prompt with the intended task (edit: add / remove / replace; extend: extend / continue), or switch to `auto`             |
| `401`                                               | Invalid Token                                                                                                         | Check the Bearer Token                                                                                                             |
| `403`                                               | Content moderation rejection (real faces, policy violations)                                                          | Change the assets or prompt                                                                                                        |
| `429`                                               | Rate limited / insufficient quota                                                                                     | Exponential backoff; check balance                                                                                                 |
| `5xx`                                               | Gateway / backend error                                                                                               | Retry 1-2 times                                                                                                                    |
| Task `failed`                                       | Generation failed                                                                                                     | Inspect the task's error field; retry with a different seed if needed                                                              |
| Task `expired`                                      | Exceeded `execution_expires_after` (default 48 h)                                                                     | Resubmit                                                                                                                           |

<Info>
  **Client recommendations**:

  * 30-60 s request timeouts are enough for create/poll calls (the wait happens on the task side)
  * Poll every 15-30 s with an overall budget of **15+ minutes** (longer for 1080p / 15 s tasks)
  * Apply **exponential backoff** on 5xx and timeouts (2 retries)
  * Log the task `id` and the `x-request-id` response header for troubleshooting
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="Why does a request with images or video take so long to return a task ID, or time out?">
    It is **submission** that is slow, not generation. Your media has to travel upstream to APIYI, then be forwarded to Volcengine and decoded and validated there — the task ID only comes back after all of that. With inline Base64 or a large image URL, that step goes from about a second to tens of seconds, and even a 60-second client read timeout may not be enough. Generation itself normally takes 2–5 minutes, which is the provider's normal speed and unrelated to submission.

    The real fix is to **ingest the media first and reference it as an `asset://` asset ID**, which drops the request body from megabytes to a few dozen bytes. For the latency breakdown, migration steps, and how to tell whether a task was created after a timeout, see [Asset-First Workflow](/en/api-capabilities/seedance2/asset-first-workflow).
  </Accordion>

  <Accordion title="Seedance 2.5 or 2.0 — which should I use?">
    **Pick by the capability you need — 2.5 is not an automatic default.** It runs at roughly 1.5× the 2.0 standard model (720p/5s: \$1.3721 vs \$0.9074), which mirrors the gap in Volcengine's own list prices.

    **Go to 2.5 when** you need clips **longer than 15 seconds** (2.5 reaches 30), **more than 9 reference images** (2.5 takes 30), **mov output**, or **video editing / extension** with parameter errors surfacing at submission time (`omni_reference_task_type`). 2.5 also allows **audio as the only reference**, where 2.0 requires an image or video alongside it.

    **Stay on the 2.0 family when** your clips are under 15 seconds — the standard model **also supports 1080p** and sits in the same flagship quality tier; for cost-sensitive batch production use `mini` at about half the standard unit price and the fastest generation. The 2.0 family is not being retired.

    Endpoint, auth, and request shape are identical across generations, and **so is the group** — switching means changing one field: `model`.
  </Accordion>

  <Accordion title="Does 2.5 support 1080p? What about 4k?">
    **1080p works** (measured: 1920×1080 renders normally). **4k does not** — sending `"resolution": "4k"` returns a synchronous 400 (not billed).

    One easily missed difference: **2.5 encodes 1080p as H.265 (hvc1)**, while 480p and 720p use H.264 (avc1). H.265 files are smaller, but older players, some browsers, and certain editing suites handle it less reliably than H.264 — confirm your downstream pipeline can decode it before distributing 1080p.
  </Accordion>

  <Accordion title="How do I run video editing and video extension on 2.5?">
    Both are "omni reference" tasks, triggered by a reference video in `content` plus the intent expressed in your prompt. Pass `omni_reference_task_type` explicitly so errors surface early:

    * **Video editing**: `omni_reference_task_type: "edit"`, at least one `role: "reference_video"`, **`ratio` must be `adaptive` and `duration` must be `-1`**, and the source video must run 4-30 seconds. The prompt needs an editing verb (add, remove, delete, change, replace). Output ratio and duration follow the input video — and **the duration can be fractional** (a measured run returned 16.709 seconds).
    * **Video extension**: `omni_reference_task_type: "extend"`, again with a reference video and **`ratio` set to `adaptive`**. The prompt needs an extension verb (extend, continue).

    Refer to assets positionally in the prompt — `@video1`, `@image1` — in the order you passed them. Invalid parameters return a **400 at submission** (`InvalidParameter.TaskTypeConstraint`) rather than failing the task minutes later.
  </Accordion>

  <Accordion title="What is the mov output format on 2.5 for?">
    Passing `"output_format": "mov"` returns a QuickTime container (H.264 + yuv444p chroma + PCM audio) with higher colour and luminance fidelity — suited to grading, keying, and compositing, and recommended officially as both input and output for video editing / extension work. The default is `mp4`, which has the broadest compatibility.

    **Note that mov uses professional codecs some players cannot open** (VLC, mpv, ffplay, and IINA on macOS all handle it). For direct web or mobile distribution, stay on the default mp4.
  </Accordion>

  <Accordion title="I get 'no available channel for this model' — why?">
    The most common Seedance error, and nine times out of ten the Token has the wrong group enabled. The error names the group you are currently on, for example:

    ```
    Current group SeeDance2 has no available channels
    for model doubao-seedance-2-5-260628
    ```

    Match your model to its group and enable it in Token Settings:

    | Model you are calling             | Group to enable          |
    | --------------------------------- | ------------------------ |
    | `doubao-seedance-2-5-260628`      | `SeeDance2`              |
    | `doubao-seedance-2-0-260128`      | `SeeDance2`              |
    | `doubao-seedance-2-0-fast-260128` | `SeeDance2` or `SD2Fast` |
    | `doubao-seedance-2-0-mini-260615` | `SeeDance2` or `SD2Mini` |

    One Key with `SeeDance2` enabled reaches all four models. The billing model must also be Pay-as-you-go Priority or Pay-as-you-go — **Pay-per-request Tokens cannot route**.
  </Accordion>

  <Accordion title="Python requests raises gzip errors / returns truncated non-JSON bodies">
    The gateway's `content-encoding: gzip` header does not match the actual body encoding. Symptoms include `ContentDecodingError`, a truncated non-JSON body (e.g. the leading `{"` is lost and you only get `id":"cgt-xxx"}`), or intermittent 400s. Add `"Accept-Encoding": "identity"` to your request headers; curl and browser fetch are unaffected.
  </Accordion>

  <Accordion title="Why does my video have sound? How do I turn it off?">
    `generate_audio` defaults to `true` (verified): the model adds voice, sound effects, and background music automatically. Pass `"generate_audio": false` explicitly for silent output.
  </Accordion>

  <Accordion title="Where is the video URL, and why does it stop working?">
    On success the URL is at `content.video_url` in the poll response (**not top-level**). It is a signed link valid for \~24 hours — download and re-host it immediately. The task\_id itself remains queryable for 7 days.
  </Accordion>

  <Accordion title="What is the success status value?">
    The state machine is `queued → running → succeeded / failed / expired`. The success state is **`succeeded`**, not `completed` — an easy mistake when migrating from other video APIs.
  </Accordion>

  <Accordion title="Can I upload photos of real people for image-to-video?">
    No. Neither Seedance 2.5 nor the 2.0 family accepts reference images/videos containing real human faces (upstream content safety). Alternatives: reuse face-containing output generated by Seedance models within the last 30 days, use the platform's preset virtual avatars (`asset://` IDs), or use licensed face assets.
  </Accordion>

  <Accordion title="Does the asset library cost extra?">
    No. Virtual-avatar ingest, real-person verification, and the rest of the private asset library are **free with the Seedance 2.0 API on APIYI — no annual fee**. Officially this capability is a separately purchased add-on: a six-figure CNY annual contract for customers without a framework agreement (Volcengine also sells it directly). We value long-term users, so that cost is already baked into our API price; for customers making normal use of the SD2 API, there is no extra charge at normal business volumes. See [Asset Library](/en/api-capabilities/seedance2/asset-library) for usage.
  </Accordion>

  <Accordion title="Am I billed for failed or rejected requests?">
    Parameter rejections (HTTP 400) are **not billed** (verified). Billing is pre-charged on submit and settled on completion, so your balance fluctuates briefly — reconcile against call logs.
  </Accordion>

  <Accordion title="How do I estimate token usage? Is portrait more expensive?">
    `tokens ≈ duration(s) × width × height × 24 / 1024`, verified to within 0.1%. Every ratio in a tier has the same pixel area (720p 16:9 and 9:16 both cost 108,900 tokens per 5 s) — **landscape, portrait, and square all cost the same**.
  </Accordion>

  <Accordion title="Within the 2.0 family — standard vs fast vs mini?">
    Price and speed go mini \< fast \< standard (720p/5s nominal on-platform: about ¥3.16 / ¥5.08 / ¥6.35). **Pick mini for batch production and cost-sensitive workloads** — about half the standard price and the fastest generation (measured 2026-07: \~1.5-2.5 min for 5 s @720p). Pick standard for maximum detail, and fast as the middle ground. Both mini and fast cap at 720p — requesting 1080p returns a 400 parameter error (not billed).

    **If 1080p is all you need, the 2.0 standard model already has it** — no need to upgrade for that alone. Go to **2.5** for 30-second clips, more than 9 reference images, mov output, or video editing/extension (roughly 1.5× the standard model's price, same group as the 2.0 family).
  </Accordion>

  <Accordion title="What does duration: -1 do?">
    The model picks its own length (4-30 s on 2.5, 4-15 s on the 2.0 family) and bills by actual output. The final length is returned in the task's `duration` field.

    **Note that `-1` is the default on 2.5** (the 2.0 family defaults to 5 seconds) — omitting `duration` therefore opts you into model-chosen length, and a measured 2.5 request with no duration returned a 10-second clip, exactly twice the cost of 5 seconds. Pass `duration` explicitly if cost predictability matters.
  </Accordion>

  <Accordion title="Is the frames parameter supported for fractional seconds?">
    No. `frames` and `camera_fixed` are Seedance 1.x parameters — **supported by neither Seedance 2.5 nor the 2.0 series**. Use whole-second `duration` instead.
  </Accordion>

  <Accordion title="Can I mix first+last frame, first frame, and reference images?">
    No — they are three **mutually exclusive** modes: first+last (2 images with required `first_frame`/`last_frame` roles), first frame (1 image), and multi-modal reference-to-video (image role `reference_image`). To approximate "first/last frame + reference", use reference mode and designate a frame via the prompt.

    Reference limits differ by generation: **2.5 takes 30 images + 10 videos + 10 audio clips, and audio may stand alone**; the 2.0 family takes 9 images + 3 videos + 3 audio clips and needs at least 1 image or 1 video alongside any audio.
  </Accordion>

  <Accordion title="Are there concurrency limits or queues?">
    The `SeeDance2` group has ample concurrency with no queuing (15 simultaneous tasks all ran immediately in our test). Contact sales for larger sustained workloads.
  </Accordion>

  <Accordion title="Any prompt limitations?">
    Keep prompts under \~500 Chinese characters or \~1000 English words — longer prompts dilute detail. Supported languages: Chinese, English, Japanese, Spanish, Portuguese, Indonesian. Describe subject + action + camera movement + lighting/style.
  </Accordion>
</AccordionGroup>

## Related Docs

* [Video Generation API Reference & Playground](/en/api-capabilities/seedance2/video-generation) - `POST /seedance/api/v3/contents/generations/tasks`
* [Asset-First Workflow](/en/api-capabilities/seedance2/asset-first-workflow) - How to make create-task return instantly when a request carries media, and what to do after a timeout
* [VEO 3.1 Video Generation](/en/api-capabilities/veo-3-1-official/overview) - Google official video channel
* [Top-up Bonuses](/en/faq/recharge-promotions) - effective cost about on par with the official channel
* [API Manual](/en/api-manual) - general calling conventions

<Info>
  Seedance is one of the few first-tier 2026 video model families that **outputs synchronized audio by default**. Combined with same-price aspect ratios and 2.5's 30-second ceiling, it is a strong primary channel for short-video and e-commerce asset production. To compare alternatives, the same Token (with extra groups enabled) can call Sora 2, VEO 3.1, and Wan2.7 directly.
</Info>
