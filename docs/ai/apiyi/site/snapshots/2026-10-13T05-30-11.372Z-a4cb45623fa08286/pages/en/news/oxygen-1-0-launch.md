> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Oxygen Video Generation Is Live

> APIYI and AZ8 launch AZ8's in-house all-round video model oxygen-1.0: an OpenAI Videos-compatible API for text, first-frame, first-and-last-frame, and reference image/video/audio video, 320p–768p, 4–15 s, priced at $0.02 per second at any resolution.

## Key Takeaways

* **Launched jointly by APIYI and AZ8**: Oxygen, AZ8's in-house all-round video model, is live as `oxygen-1.0` and works in the `default` group
* **One model, four ways to generate**: text-to-video, first-frame, first-and-last-frame, and reference generation with up to 9 images, 3 videos, and 3 audio clips; every clip comes with sound
* **OpenAI Videos-compatible**: submit with `POST /v1/videos` and poll with `GET /v1/videos/{id}`, so existing Sora-style integrations need only small changes
* **Priced at \$0.02 per second, same price at all three resolutions**: \$0.08 for 4 seconds, \$0.30 for 15 seconds; reference media cost nothing extra, and failed tasks are refunded in full automatically
* **Built for volume**: batch production, A/B drafts, and short-form video assets

## Background

AZ8 is a Singapore-based AI video creation platform (formerly Videoinu). In May 2026 it launched a canvas-based workspace that lets creators arrange text, image, video, and audio nodes on a single infinite canvas. Oxygen is AZ8's in-house video generation model.

APIYI has partnered with AZ8 to open Oxygen up as a standard API. Unlike flagship video models that compete on resolution and image quality, Oxygen has a clear focus: **broad capability at a low unit price**. It does not chase 1080p or 4K. Instead, the common 320p–768p tiers all cost the same, so batch generation costs are predictable.

## In-Depth Analysis

### Benchmarks

AZ8 has not published quantitative benchmarks for Oxygen, and third-party leaderboards have not listed it yet, so this article cites no rankings. The specs, timings, and billing below come from APIYI's own pre-launch testing.

### Key Features

<CardGroup cols={2}>
  <Card title="Four generation modes, one model" icon="layers">
    No media means text-to-video; one image means first-frame video; a first and last frame give a transition; reference images, videos, or audio give reference generation.
  </Card>

  <Card title="Mixed image, video, and audio references" icon="images">
    Up to 9 reference images, 3 reference videos, and 3 reference audio clips to lock characters and props, copy camera moves, or drive the rhythm.
  </Card>

  <Card title="Three resolutions, one price" icon="monitor">
    320p, 480p, and 768p all cost \$0.02 per second. 320p renders faster with smaller files for previews; 768p is for final cuts.
  </Card>

  <Card title="Built-in audio" icon="music">
    Output MP4 files include an audio track, with no separate dubbing or post-production needed.
  </Card>
</CardGroup>

### Specifications

| Item | Spec (tested on APIYI) |
| - | - |
| Model ID | `oxygen-1.0` |
| API | OpenAI Videos: `POST /v1/videos`, `GET /v1/videos/{id}` |
| Duration | Integer 4–15 seconds (top-level `seconds`); clips usually run 0.2–0.5 s longer than requested |
| Resolution and output size | 320p: 576×320; 480p: 864×480 / 480×864 / 480×480; 768p: 1344×768 / 768×1344 / 768×768 |
| Aspect ratio | 16:9, 9:16, 1:1; image-to-video follows the first frame |
| Image input | Public https URL or image data URI |
| Reference media | Images ≤ 9, videos ≤ 3, audio ≤ 3 (videos and audio by https URL only) |
| Output | MP4 via `video_url` in the query response, valid for about 24 hours |
| Generation time | Usually 1–3 minutes; 5+ minutes when queues are busy |

### Two Things You Must Get Right

<Warning>
  * **Always pass `size` explicitly**: without it the gateway fills in `720x1280`, so a landscape request comes back portrait. `1280x720` / `720x1280` give 480p, and `1792x1024` / `1024x1792` give 768p
  * **Put advanced options inside the JSON envelope in `input_reference`**: first-and-last frames, reference media, 320p, and 1:1 must be written as a JSON string starting with `{` in `input_reference`. If you place these fields at the top level of the request body they are **silently dropped**: no error, normal billing, but the last frame and reference images are ignored
</Warning>

## Practical Applications

### Recommended Use Cases

* **Batch short-form assets**: animate product shots, feed ads, and social visuals for a few cents each
* **Storyboard drafts and A/B tests**: compare several creative directions quickly at 4 seconds and 320p, then render the final version
* **First-and-last-frame transitions**: supply the opening and closing frames and generate the motion in between
* **Character-consistent series**: lock people and props with multiple reference images, and pace the clip with reference audio

### Code Example

```python theme={null}
import json
import time
import requests

API_KEY = "sk-your-apiyi-key"
BASE = "https://api.apiyi.com/v1"
HEADERS = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

# First-and-last-frame video: advanced options go inside the input_reference JSON envelope
envelope = {
    "images": ["https://your-cdn.example.com/first.png"],
    "last_image": "https://your-cdn.example.com/last.png",
}
task = requests.post(f"{BASE}/videos", headers=HEADERS, timeout=60, json={
    "model": "oxygen-1.0",
    "prompt": "The glass sphere slowly dissolves into a deep blue abstract wave",
    "seconds": "5",            # integer 4–15, billed per second
    "size": "1280x720",        # always pass it; sets resolution and orientation
    "input_reference": json.dumps(envelope),  # must be a string
}).json()

while True:
    task = requests.get(f"{BASE}/videos/{task['id']}", headers=HEADERS, timeout=30).json()
    if task["status"] in ("completed", "failed"):
        break
    time.sleep(5)
print(task.get("video_url") or task.get("error"))
```

For text-to-video, drop `input_reference`. For first-frame only, set `input_reference` to an image URL or data URI. Full parameters and multi-language examples are in the [Oxygen Video Generation API reference](/en/api-capabilities/oxygen/video-generation).

### Best Practices

1. **Test with 4 seconds first**: billing is per second, so confirm composition and style before rendering 10–15 seconds
2. **Use first and last frames with similar aspect ratios**: the clip follows the first frame, and a very different last frame gets cropped
3. **Host media on stable public storage**: hotlink protection or expired signatures make the task fail while fetching media (failures are refunded automatically)
4. **Download from `video_url` and store it right away**: right after the status turns `completed`, `/v1/videos/{id}/content` may still return 400, and the link expires after about 24 hours
5. **Resubmit occasional `upstream_error` failures after a few minutes**: they are refunded automatically; for 400 errors, fix the parameters instead of retrying

## Pricing and Availability

### Pricing

| Item | Price |
| - | - |
| Output video (320p / 480p / 768p, same price) | **\$0.02 / second** |
| First frame, last frame, reference images / videos / audio | No extra charge |
| 4-second video | \$0.08 |
| 10-second video | \$0.20 |
| 15-second video | \$0.30 |

<Note>Model prices may change; the table above is for reference only, and the **Model Pricing** tab in the top navigation is authoritative: [Model Pricing](/en/models/index).</Note>

* Billed by the requested `seconds` and pre-charged when the task is accepted; the small extra length of the clip is not charged
* Tasks that end as `failed` are refunded in full automatically; requests rejected with 400 at submission are not charged; polling and downloads are free
* Groups: `default` or `svip`; set the token billing mode to Pay-as-you-go Priority

### Stack with Top-up Promotions

Top-up bonuses stack on top of this pricing for a lower effective rate. See [Top-up promotions](/en/faq/recharge-promotions).

## Summary and Recommendations

Oxygen's selling point is **all-round capability at a low price**: one model covers text, first-frame, first-and-last-frame, and multimodal reference generation, every clip has sound, and all three resolutions cost \$0.02 per second. For teams that generate a lot of footage or iterate on many drafts, it brings the cost of a clip down to a few cents.

If you need 1080p or above, or higher image quality, compare [Seedance 2.0 / 2.5](/en/api-capabilities/seedance2/overview) and [MiniMax-H3](/en/api-capabilities/minimax-h3/overview) on APIYI and mix them by use case: Oxygen for drafts and volume, flagship models for final cuts.

Get started: [Oxygen overview](/en/api-capabilities/oxygen/overview) · [Video generation API reference](/en/api-capabilities/oxygen/video-generation)

<Info>
  **Sources (retrieved 2026-10-02)**:

  * AZ8 platform introduction: `martechseries.com/video/az8-launches-canvas-based-ai-video-creation-workspace/` (launch timing and positioning of the canvas workspace)
  * Model capabilities and parameters: API documentation provided by AZ8
  * APIYI specs, output sizes, timings, and billing: pre-launch testing from 2026-09-30 to 2026-10-02 (UTC+8); pricing per `api.apiyi.com/api/pricing`
</Info>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.