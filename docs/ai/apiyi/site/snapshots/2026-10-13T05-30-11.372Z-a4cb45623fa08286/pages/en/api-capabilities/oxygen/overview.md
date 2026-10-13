> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Oxygen Video Generation

> AZ8 Oxygen (oxygen-1.0) video generation guide: OpenAI Videos-compatible API covering text, first-frame, first-and-last-frame, and reference image/video/audio video, 320p–768p, 4–15 s, billed at $0.02 per second.

## Overview

Oxygen is a video generation model provided by AZ8, an AI video creation platform based in Singapore (formerly Videoinu). APIYI serves it as `oxygen-1.0` through an **OpenAI Videos**-compatible API (`POST /v1/videos` to submit, `GET /v1/videos/{id}` to query), with 4–15 second clips at 320p / 480p / 768p, **billed at \$0.02 per second regardless of resolution**.

<Note>
  **Highlights**: one model covers text-to-video, first-frame video, first-and-last-frame video, and reference generation with up to 9 images, 3 videos, and 3 audio clips. Output comes with an audio track. **\$0.02 per second**: a 5-second clip costs \$0.10 and a 15-second clip \$0.30, and failed tasks are refunded automatically. Built for high-volume, low-cost video generation.
</Note>

<CardGroup cols={2}>
  <Card title="Video Generation API Reference" icon="video" href="/en/api-capabilities/oxygen/video-generation">
    Submit, poll, and download, with Python / cURL / Node.js examples and a live Playground
  </Card>

  <Card title="Top-up Bonuses" icon="gift" href="/en/faq/recharge-promotions">
    Top-up bonuses lower the effective price further
  </Card>
</CardGroup>

## Let an AI Agent Integrate It for You

<Note>
  If you build with Codex / Claude Code / Cursor, copy the prompt below into it. The agent first fetches the plain-text version of this page (append `.md` to any docs URL), then writes code for your stack. The common mistakes are already spelled out: always pass `size`, put advanced parameters in the `input_reference` JSON envelope, and set the length only with `seconds`.
</Note>

<Prompt description="Have a coding agent integrate or debug Oxygen (oxygen-1.0) video generation. Copy and paste it into Codex, Claude Code, Cursor, etc." icon="bot" actions={["copy"]}>
  Integrate or debug Oxygen (oxygen-1.0) video generation in this project (text-to-video / first frame / first and last frame / reference media).

  Read the docs before writing code: fetch [https://docs.apiyi.com/en/api-capabilities/oxygen/overview.md](https://docs.apiyi.com/en/api-capabilities/oxygen/overview.md) for the plain-text version of this page; parameters and code samples are at [https://docs.apiyi.com/en/api-capabilities/oxygen/video-generation.md](https://docs.apiyi.com/en/api-capabilities/oxygen/video-generation.md) .

  Requirements:

  1. Endpoints: OpenAI Videos format. Submit with `POST https://api.apiyi.com/v1/videos` (JSON), query with `GET https://api.apiyi.com/v1/videos/{id}`. Submitting returns `{"id": ..., "status": "queued"}` right away; poll for the video.

  2. Polling and status: query every 5 seconds with a 15-minute overall timeout. Status is `queued` / `in_progress` / `completed` / `failed`; **success is `completed`**.

  3. Getting the file: on success, download the **`video_url`** from the response directly (no auth header needed). **Do not rely on `/v1/videos/{id}/content`**: right after completion it may still return 400. The link expires at `expires_at` (about 24 hours), so copy it to your own storage right away.

  4. Length: top-level `seconds` is required, an integer from 4 to 15 (the string `"5"` also works), and **billing is based on it**.

  5. Resolution and orientation: **always pass `size` explicitly**. Without it the gateway fills in `720x1280` and you get a portrait video. `1280x720` / `720x1280` = 480p, `1792x1024` / `1024x1792` = 768p.

  6. Image-to-video with a first frame only: set `input_reference` to a public https image URL or a data URI. The output follows the first frame's aspect ratio.

  7. Advanced parameters (first and last frame, reference media, 320p, 1:1): **must go inside a JSON string in `input_reference`** (starting with `{`), e.g. `"input_reference": "{\"images\":[\"https://...first.png\"],\"last_image\":\"https://...last.png\"}"`. Allowed keys: `images`, `last_image`, `reference_images` (up to 9), `reference_videos` (up to 3), `reference_audios` (up to 3), `resolution` (`320p` / `480p` / `768p`), `aspect_ratio` (`16:9` / `9:16` / `1:1`), `prompt`. **These fields are silently dropped, with no error, if you put them at the top level**. `duration` is not allowed inside the envelope (400), and first/last frames cannot be mixed with reference media.

  8. Billing and retries: \$0.02 per second at any resolution; charged at submission, refunded in full when a task ends `failed`, and no charge when submission returns 400. For an occasional `upstream_error`, resubmit after a few minutes; for 400 errors fix the parameters instead of retrying.

  9. Token: `default` or `svip` group with **Pay-as-you-go Priority** billing. Read the key from the `APIYI_API_KEY` environment variable; never hard-code it or commit it to git.

  10. After the change, actually run one 4-second text-to-video with `size: "1280x720"` and show me the `video_url` and the cost of the call (it should be \$0.08). The whole flow takes 1–3 minutes; in a sandboxed environment set the command timeout to 600 seconds or more, or run it in the background.
</Prompt>

<Accordion title="What this prompt protects you from">
  | Requirement | Mistake it prevents |
  | - | - |
  | Always pass `size` | Without it the gateway defaults to a portrait size, so a landscape request comes back portrait |
  | Advanced parameters in the `input_reference` envelope | `last_image`, `reference_images`, or `resolution` at the top level are silently dropped with no error: the last frame is ignored, references are ignored, and the resolution is wrong |
  | Length only via `seconds` | `duration` inside the envelope is rejected; billing and clip length both follow `seconds` |
  | Download `video_url` | Calling `/content` right as the status turns `completed` may return 400 and look like a failure |
  | Copy the file right away | The link expires after about 24 hours |
</Accordion>

## Why APIYI's Oxygen?

<CardGroup cols={2}>
  <Card title="Volume pricing" icon="receipt">
    \$0.02 per second at any resolution; \$0.08 for 4 seconds, good for batch output and A/B drafts
  </Card>

  <Card title="Automatic refunds" icon="shield-check">
    Failed tasks are refunded in full and rejected submissions are free, so you only pay for videos you get
  </Card>

  <Card title="OpenAI Videos compatible" icon="plug">
    Same submit-and-query pattern as `/v1/videos`, so existing Sora-style code needs few changes
  </Card>

  <Card title="Top-up bonuses stack" icon="gift">
    Combine with [Top-up Bonuses](/en/faq/recharge-promotions) for a lower effective cost
  </Card>

  <Card title="Full video model lineup" icon="clapperboard">
    The same key also calls [Seedance 2.0 / 2.5](/en/api-capabilities/seedance2/overview), [MiniMax-H3](/en/api-capabilities/minimax-h3/overview), [Wan2.7](/en/api-capabilities/wan/overview), and more
  </Card>

  <Card title="Global access" icon="globe">
    Connect directly to `api.apiyi.com` with one API key, no overseas account needed
  </Card>
</CardGroup>

## Key Features

<CardGroup cols={2}>
  <Card title="Four generation modes" icon="layers">
    Text, first frame, first and last frame, and reference image / video / audio, all on one endpoint
  </Card>

  <Card title="Three resolutions" icon="monitor">
    320p / 480p / 768p at the same price; trade speed for detail as needed
  </Card>

  <Card title="Any whole length from 4 to 15 s" icon="timer">
    Billed by the requested seconds, so short clips cost less
  </Card>

  <Card title="Built-in audio" icon="music">
    The output MP4 includes an audio track, no separate dubbing needed
  </Card>
</CardGroup>

## Pricing

| Item | Price |
| - | - |
| Output video (320p / 480p / 768p, same price) | **\$0.02 / second** |
| First frame, last frame, reference image / video / audio | No extra charge |
| Example: 4-second clip | \$0.08 |
| Example: 15-second clip | \$0.30 |

<Note>Prices may change; the table above is for reference only, and the **Model Pricing** tab in the top navigation is authoritative: [Model Pricing](/en/models/index).</Note>

<Info>
  **Billing notes**:

  * Billed by the requested `seconds`, charged when the task is accepted; the actual clip runs slightly longer (about 4.5 s for a 4 s request) at no extra cost
  * Resolution, aspect ratio, and reference media do not affect the price
  * Failed tasks (provider failure, timeout, etc.) are **refunded in full automatically**
  * Submissions that return 400 are not charged; queries and downloads are free
</Info>

## Group Setup

`oxygen-1.0` **works in the `default` group**, and the `svip` group works too. Set the token's billing mode to **Pay-as-you-go Priority**. If a call returns "no available channel in the current group", the token's group does not include this model or the `model` name is misspelled.

| Item | Requirement |
| - | - |
| Group | `default` or `svip` |
| Billing mode | Pay-as-you-go Priority |
| Model name | `oxygen-1.0` (the `-1.0` suffix is required) |

## Technical Specs

| Item | Spec |
| - | - |
| Model ID | `oxygen-1.0` |
| Length | Integer 4–15 seconds (top-level `seconds`) |
| Resolution | 320p / 480p (default) / 768p |
| Aspect ratio | Landscape 16:9, portrait 9:16, square 1:1; image-to-video follows the first frame |
| Output size (measured) | 320p: 576×320; 480p: 864×480 / 480×864 / 480×480; 768p: 1344×768 / 768×1344 / 768×768 |
| Audio | Output includes an audio track |
| Image input | Public https URL or image data URI |
| Reference media | Images up to 9, videos up to 3, audio up to 3 (video and audio as https URLs only) |
| Output | MP4 via `video_url` in the query response, valid for about 24 hours |
| Generation time | Usually 1–3 minutes; 5+ minutes when the queue is busy |

## API Endpoints

| Purpose | Method | Path |
| - | - | - |
| Create task | `POST` | `/v1/videos` |
| Query task | `GET` | `/v1/videos/{id}` |
| Download (optional) | `GET` | `/v1/videos/{id}/content` |

<Tip>
  Primary domain `https://api.apiyi.com`, backup domain `https://b.apiyi.com`, same paths. For downloads, use `video_url` from the query response directly.
</Tip>

## Generation Modes

Only five top-level fields take effect: `model`, `prompt`, `seconds`, `size`, and `input_reference`. First and last frames, reference media, 320p, and 1:1 are **advanced parameters that go into the `input_reference` JSON envelope** (a JSON string starting with `{`):

| Mode | How to write it | Resolution / aspect ratio |
| - | - | - |
| Text-to-video | Omit `input_reference` | Set by `size` |
| First-frame video | `input_reference` = image URL or data URI | Resolution from `size`, aspect ratio follows the first frame |
| First-and-last-frame video | Envelope `{"images":["first"],"last_image":"last"}` | Same as above |
| Reference media video | Envelope `{"reference_images":[...],"reference_videos":[...],"reference_audios":[...]}` | Set by `size`; `aspect_ratio` can go in the envelope |
| 320p or 1:1 | Envelope `{"resolution":"320p","aspect_ratio":"1:1"}` (can be combined with any mode above) | Envelope wins over `size` |

How `size` maps to resolution:

| `size` | Resolution | Orientation |
| - | - | - |
| `1280x720` | 480p | Landscape 16:9 |
| `720x1280` | 480p | Portrait 9:16 |
| `1792x1024` | 768p | Landscape 16:9 |
| `1024x1792` | 768p | Portrait 9:16 |

Envelope example (first and last frame):

```json theme={null}
{
  "model": "oxygen-1.0",
  "prompt": "The glass sphere slowly dissolves into a deep blue abstract wave",
  "seconds": "5",
  "size": "1280x720",
  "input_reference": "{\"images\":[\"https://your-cdn.example.com/first.png\"],\"last_image\":\"https://your-cdn.example.com/last.png\"}"
}
```

<Warning>
  * `last_image`, `reference_images`, `resolution`, `aspect_ratio`, and similar fields are **silently dropped when placed at the top level**: no error and normal billing, but the last frame is ignored, references are ignored, and resolution follows `size`. Always put them in the `input_reference` envelope
  * **`duration` is not allowed in the envelope**; use top-level `seconds`. Invalid JSON or misspelled keys return 400 (`param: input_reference`) with no charge
  * First/last frames **cannot** be mixed with reference media
  * `input_reference` must be a **string**: serialize the envelope first (`json.dumps` in Python, `JSON.stringify` in JS). Passing an object or array directly is rejected
</Warning>

## Best Practices

<Steps>
  <Step title="Test with 4 seconds first">
    Billing is per second, so confirm composition and style at 4 seconds before rendering 10–15 second finals
  </Step>

  <Step title="Always set size">
    Landscape `1280x720`, portrait `720x1280`; for more detail use `1792x1024` / `1024x1792` (768p)
  </Step>

  <Step title="Use first and last frames with similar aspect ratios">
    The output follows the first frame's ratio; a last frame with a very different ratio gets cropped in the transition
  </Step>

  <Step title="Host media on stable public storage">
    Use your own OSS / CDN direct links to avoid hotlink protection or expired signatures breaking the download
  </Step>

  <Step title="Poll every 5 seconds with a 15-minute timeout">
    Most clips finish in 1–3 minutes; it can take longer at peak times
  </Step>

  <Step title="Copy video_url to your storage right away">
    The link expires after about 24 hours; download it and serve it from your own storage
  </Step>
</Steps>

## Error Codes & Retries

| Stage | Symptom | Cause | Fix |
| - | - | - | - |
| Submit | 400, `invalid_params`, `param: input.duration` | `seconds` outside 4–15 | Change the length; not charged |
| Submit | 400, `invalid_params`, `param: input_reference` | Invalid envelope JSON, unknown key, or `duration` in the envelope | Fix the envelope per the message; not charged |
| Submit | 400, `cannot unmarshal array ... input_reference` | `input_reference` sent as an array or object instead of a string | Serialize it with `json.dumps` / `JSON.stringify` |
| Submit | 500, reference file download failed | The image URL in `input_reference` is not reachable | Use a publicly reachable https URL |
| Submit | 503, no available channel | Token group does not include this model, or the model name is misspelled | Check the group and `oxygen-1.0` |
| Run | `failed`, `upstream_error` | Occasional provider-side failure | Resubmit after a few minutes (already refunded) |
| Run | `failed`, `upstream_timeout` | Queued too long upstream and hit the time limit | Resubmit later (already refunded) |

<Info>
  The error detail is a JSON string inside the response's `message` field, e.g. `{"message":"{\"error\":{\"code\":\"invalid_params\",...}}","type":"task_error"}`, so parse it a second time.
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="Why did my landscape video come out portrait?">
    `size` was not passed. Without it the gateway defaults to `720x1280` (portrait). For landscape, pass `1280x720` or `1792x1024` explicitly.
  </Accordion>

  <Accordion title="Why do last_image / reference_images have no effect?">
    They were placed at the top level of the request. Only `model`, `prompt`, `seconds`, `size`, and `input_reference` take effect there; everything else is silently dropped. Put them in the `input_reference` JSON envelope, see "Generation Modes" above.
  </Accordion>

  <Accordion title="How do I get 320p? Passing resolution does nothing.">
    A top-level `resolution` is dropped. Put it in the envelope: `"input_reference": "{\"resolution\":\"320p\"}"`. All three resolutions cost the same.
  </Accordion>

  <Accordion title="Do the resolutions cost different amounts?">
    No, all are \$0.02 per second. 320p renders faster with smaller files; 768p is sharper.
  </Accordion>

  <Accordion title="The status says completed but /content returns 400?">
    Right after the status turns `completed`, `/v1/videos/{id}/content` may need a few more seconds. Use `video_url` from the query response instead.
  </Accordion>

  <Accordion title="How long does the video link last?">
    About 24 hours (see `expires_at` in the query response). Download and store it promptly.
  </Accordion>

  <Accordion title="Am I charged for failed tasks?">
    No. A task that ends `failed` is refunded in full automatically, and submissions that return 400 are not charged.
  </Accordion>

  <Accordion title="What should I do about an occasional upstream_error?">
    It is an occasional provider-side failure and has already been refunded. Resubmitting after a few minutes usually works.
  </Accordion>

  <Accordion title="Why is the clip slightly longer than seconds?">
    Output runs a little longer (about 4.5 s for 4 s, 5.2 s for 5 s). Billing uses the requested `seconds`, so there is no extra charge.
  </Accordion>

  <Accordion title="Can the first frame be Base64?">
    Yes. Both `input_reference` and `images` in the envelope accept image data URIs (such as `data:image/jpeg;base64,...`). Reference video and audio accept https URLs only.
  </Accordion>

  <Accordion title="Can I set the aspect ratio for image-to-video?">
    No. Image-to-video follows the first frame's aspect ratio and ignores `aspect_ratio`. You can still pick the resolution via `size` or `resolution` in the envelope.
  </Accordion>
</AccordionGroup>

## Related Docs

* [Oxygen Video Generation API Reference](/en/api-capabilities/oxygen/video-generation)
* [MiniMax-H3 Video Generation](/en/api-capabilities/minimax-h3/overview)
* [Seedance 2.0 / 2.5 Video Generation](/en/api-capabilities/seedance2/overview)
* [Wan2.7 Video Generation](/en/api-capabilities/wan/overview)
* [Top-up Bonuses](/en/faq/recharge-promotions)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.