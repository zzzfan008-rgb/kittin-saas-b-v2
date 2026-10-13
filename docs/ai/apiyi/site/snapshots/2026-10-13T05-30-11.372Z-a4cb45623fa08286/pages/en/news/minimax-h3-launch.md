> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# MiniMax H3 Video Generation Is Live

> APIYI launches a self-hosted MiniMax H3 (Hailuo 3.0) channel: one endpoint for text, first/last-frame, and mixed image/video/audio reference video, native stereo, 768P, 4–15 s, $0.03 per second with no charge for reference media.

## Key Takeaways

* **One endpoint for every mode**: text-to-video, first / last / first-and-last-frame video, and mixed reference generation with up to 9 images, 3 videos, and 3 audio clips all go through `POST /hailuo/v2/video_generation`
* **Native stereo audio**: every clip includes music and sound effects, and the picture can follow the rhythm of reference audio
* **Self-hosted deployment of the open weights**: 768P, any whole duration from 4 to 15 seconds, 7 aspect ratios
* **Priced at \$0.03 per second**: a 10-second clip costs \$0.30; reference images, videos, and audio are free; failed tasks are refunded in full automatically
* **Works in the `default` group**, and the `svip` group works too

## Background

MiniMax released H3 (Hailuo 3.0) on 2026-07-31 (UTC+8). Instead of one API per task, as in earlier generations, a single H3 model reads text, images, video, and audio together and outputs video with a stereo audio track. MiniMax later released the model weights under the MiniMax H3 Community License, which lets third parties run their own inference.

What APIYI launches here is a **self-hosted deployment of those open weights**, not a relay of the official MiniMax API. There are two differences: only 768P is offered (the official API also has 2K), and pricing is independent. Everything else, including reference limits, aspect ratios, duration range, and audio output, matches the official model.

## In Detail

### Benchmarks

MiniMax's announcement focuses on capability demos and cost; it does not publish reproducible quantitative benchmarks, and we don't cite third-party rankings we could not trace to a primary source. APIYI's own measurements are under Technical Specs below.

### Key Features

<CardGroup cols={2}>
  <Card title="One endpoint, four modes" icon="layers">
    The mode is inferred from `content[]`: text only is text-to-video; `first_frame` / `last_frame` images make keyframe video; `reference_*` media make reference video.
  </Card>

  <Card title="Mixed image, video, and audio references" icon="images">
    Up to 9 reference images, 3 reference videos, and 3 reference audio clips, 12 in total. Refer to them in the prompt as `<Picture 1>`, `<Video 1>`, `<Audio 1>`.
  </Card>

  <Card title="Native stereo audio" icon="music">
    The output MP4 carries a 32 kHz stereo track; music, effects, and rhythm come from the prompt and reference audio, with no dubbing step.
  </Card>

  <Card title="7 aspect ratios, billed by the second" icon="ratio">
    Six fixed ratios from `21:9` to `9:16`, plus `adaptive` to follow the reference image; any whole duration from 4 to 15 seconds.
  </Card>
</CardGroup>

### Technical Specs

| Item | Spec (measured on APIYI) |
| - | - |
| Model ID | `MiniMax-H3` |
| Architecture | 33B dense Transformer (official model card) |
| Resolution | 768P |
| Aspect ratio and output size | `21:9` 1536×672, `16:9` 1344×768, `4:3` 1024×768, `1:1` 768×768, `3:4` 768×1024, `9:16` 768×1344 |
| Duration | Whole seconds from 4 to 15; the finished clip is usually 0.1–0.5 s longer |
| Reference media | Images ≤ 9, videos ≤ 3 (≤ 15 s total), audio ≤ 3; public HTTPS URLs only |
| Prompt | 1 item, up to 7000 characters |
| Generation time | Measured median about 3 minutes (2–6 minutes) |

<Warning>
  Two limits to know up front: this channel **does not support 2K**, and the `Idempotency-Key` header **currently has no effect**, so a resubmission creates a new task that is billed separately. Handle idempotency in your own application.
</Warning>

## Putting It to Use

### Recommended Use Cases

* **Music visuals and dance clips**: let reference audio drive the rhythm
* **Short dramas with consistent characters**: pin characters and props with several reference images
* **Motion and camera transfer**: copy camera moves from a reference video
* **Animating products and posters**: a first frame plus a camera description, with `adaptive` to keep the image's ratio

### Code Example

```python theme={null}
import time
import requests

API_KEY = "sk-your-apiyi-key"
BASE = "https://api.apiyi.com/hailuo/v2"
HEADERS = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

task_id = requests.post(f"{BASE}/video_generation", headers=HEADERS, timeout=60, json={
    "model": "MiniMax-H3",
    "content": [{"type": "text", "text": "A lighthouse by the sea at dusk, slow dolly in, waves and low strings"}],
    "resolution": "768P",
    "duration": 10,        # integer 4–15, billed per second
    "ratio": "16:9",
}).json()["task_id"]

while True:
    task = requests.get(f"{BASE}/query/video_generation/{task_id}", headers=HEADERS, timeout=30).json()["task"]
    if task["status"] in ("succeeded", "failed"):
        break
    time.sleep(10)
print(task.get("content", {}).get("url") or task["error"])
```

Full parameters, media requirements, and examples in more languages are in the [MiniMax-H3 Video Generation API Reference](/en/api-capabilities/minimax-h3/video-generation).

### Best Practices

1. **Start the path with `/hailuo`**; without it you get a web page instead of JSON
2. **Test with 4–5 seconds first**, then render the 10–15 second version once the composition works
3. **Use a fixed ratio for text-only requests**; `adaptive` only works with images or videos
4. **Host media on stable public storage**; hotlink protection or expired signatures make the task fail when downloading media (failures are refunded)
5. **Store `task.content.url` right away**, and check links with GET, because HEAD requests return 403

## Pricing and Availability

### Pricing

| Item | APIYI (self-hosted, 768P) | Official MiniMax API (768P) |
| - | - | - |
| Output video | **\$0.03 / second** | \$0.08 / second |
| Reference images | Free (up to 9) | First 5 free, then \$0.04 per image |
| Reference videos | Free | \$0.08 per second of input |
| Reference audio | Free | Free |
| 10 s text-to-video | **\$0.30** | \$0.80 |

<Note>This channel is a self-hosted deployment of the open weights, priced independently of the official MiniMax API, and prices may change; the table above is for reference only, and the **Model Pricing** tab in the top navigation is authoritative: [Model Pricing](/en/models/index).</Note>

* Billed by the requested `duration`, pre-charged when the task is accepted; failed tasks are **refunded in full automatically**, and submission errors are not billed
* Groups: `default` or `svip`; we recommend the Pay-as-you-go Priority billing model for the Token

### Top-up Bonuses

Top-up bonuses stack with the prices above for a lower effective cost; see [Top-up Bonuses](/en/faq/recharge-promotions).

## Summary

MiniMax H3's value is **folding many video tasks into one model**: the same endpoint handles text prompts and mixed image, video, and audio references, and it produces stereo sound. APIYI's self-hosted channel offers 768P output at \$0.03 per second with no charge for reference media, which suits teams that iterate a lot or render in batches. If you need 2K output, or rely on an idempotency key to prevent double billing, weigh those two limits before integrating.

Get started: [MiniMax-H3 Overview](/en/api-capabilities/minimax-h3/overview) · [Video Generation API Reference](/en/api-capabilities/minimax-h3/video-generation)

<Info>
  **Sources (retrieved 2026-09-29)**:

  * MiniMax blog: `minimax.io/blog/minimax-h3` (release date, capabilities)
  * Official model card: `huggingface.co/MiniMaxAI/MiniMax-H3` (33B architecture, reference limits, 32 kHz stereo, license)
  * Official MiniMax API pricing: `platform.minimax.io/docs/guides/pricing-paygo`
  * APIYI specs, timing, and billing: measured 2026-09-29 (UTC+8)
</Info>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.