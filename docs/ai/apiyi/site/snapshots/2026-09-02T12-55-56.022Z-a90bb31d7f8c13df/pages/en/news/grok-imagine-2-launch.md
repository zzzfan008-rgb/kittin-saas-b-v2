> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok Imagine 2 Image Models Launch: Full Test Results

> xAI's second-generation image model Grok Imagine 2 arrives on APIYI at a flat $0.02 / $0.045 per image regardless of resolution — xAI lists the quality tier at $0.07 for 2K, so ours lands near 64% of list — about 58% once the usual top-up bonus is stacked. Ranked #2 on Arena for both text-to-image and image editing. Our tests confirm all 5 aspect ratios take effect exactly, 2K reaches 2816x1584, and up to 10 images per call — plus two API conventions you must work around.

## Key Takeaways

* **Two models live**: `grok-imagine-image` (**\$0.02/image**) and `grok-imagine-image-quality` (**\$0.045/image**), callable from the `Default` Group
* **Flat per-request billing that ignores resolution**: xAI lists the quality tier at \$0.05 (1K) and \$0.07 (2K); we charge a flat **\$0.045** — about **90% of list at 1K and 64% at 2K**, so higher resolution means bigger savings; **stacking the top-up bonus brings 2K to roughly 58% of list, or 54% at maximum**
* **#2 on both Arena boards**: xAI reports Image 2.0 ranks second globally on Arena's text-to-image and image-edit leaderboards, behind OpenAI's gpt-image-2 (as of 7 August 2026)
* **Parameters genuinely work**: across 20 combinations of 5 aspect ratios x 2 resolution tiers, output pixels matched the request **20/20 exactly**, with 16:9 at 2K reaching 2816x1584
* **Editing is real editing**: only the specified part changes while art style, composition, palette and subject identity are preserved, with 1-4 image fusion
* **Two conventions you must know**: editing requires `multipart/form-data` (JSON returns 400), and reference images **cannot** go to the text-to-image endpoint (it returns 200 and silently discards them)

## Background

xAI released its next-generation image model **Grok Imagine Image 2.0** on **7 August 2026**, shipping it as the "Quality Mode" of Grok's image generator on `grok.com/imagine` and in the Grok iOS and Android apps. APIYI integrates exactly that **official-transit Quality Mode**.

The biggest change from the first generation is that **this is an editing-centric model**, not merely a better one-shot generator. xAI's reported Arena results place it **second globally on both the text-to-image and image-edit leaderboards**, behind OpenAI's gpt-image-2.

For developers, the most practical gain this generation is not "prettier pictures" — it is that **the parameters finally work**. We ran roughly 220 real calls against both models on APIYI. On the previous generation, aspect ratio and resolution were silently ignored at the gateway, 2K was unreachable, and multi-image requests returned 500. **All of those problems are gone.**

<Info>
  Sources: xAI's official release notes and model documentation at `docs.x.ai/developers/models/grok-imagine-image`; Arena leaderboard standings cited from xAI's official announcement (as of 7 August 2026). All API behaviour data in this article comes from APIYI's own testing on 12 August 2026 (\~220 calls).
</Info>

## Deep Dive

### Core capabilities

<CardGroup cols={2}>
  <Card title="Two tiers, one price" icon="expand">
    `1k` at \~1 megapixel and `2k` at \~4.2-4.5 megapixels — **flat billing regardless of resolution**, so 2K costs no extra (xAI charges more)
  </Card>

  <Card title="5 aspect ratios, exact" icon="maximize">
    `1:1` / `16:9` / `9:16` / `4:3` / `3:4` — 20 measured combinations matched the request exactly
  </Card>

  <Card title="Up to 10 per call" icon="images">
    `n` accepts 1-10, returning several images in one request — no client-side fan-out loop needed
  </Card>

  <Card title="True reference editing" icon="wand">
    Changes only what the prompt asks for, preserving everything else; supports 1-4 image fusion
  </Card>
</CardGroup>

### Output geometry: 20/20 exact

This is the most substantive improvement over the previous generation. Across 5 aspect ratios x 2 resolution tiers, both models produced identical results cell for cell:

| Aspect ratio | `resolution: 1k` | `resolution: 2k` |
| ------------ | ---------------- | ---------------- |
| `1:1`        | 1024x1024        | 2048x2048        |
| `16:9`       | 1280x720         | **2816x1584**    |
| `9:16`       | 720x1280         | 1584x2816        |
| `4:3`        | 1152x864         | 2368x1776        |
| `3:4`        | 864x1152         | 1776x2368        |

The 2K tier delivers roughly **4.0-4.8x the pixel area** of 1K — genuine high-resolution output, not upscaling.

<Warning>
  **1K returns JPEG and 2K returns PNG**, so the format changes with the resolution tier. 2K is lossless PNG at **5-6 MB per image** while 1K is JPEG at roughly 220-300 KB — about a 20x difference. For mobile or bulk transfer, prefer 1K; since both tiers cost the same, the choice is purely quality versus bandwidth — and when you do want quality, 2K carries no surcharge while sitting at a deeper discount versus list.
</Warning>

### Editing, measured

Editing is the centrepiece of this generation, so we verified it with a **controlled experiment** (the same prompt run 3 times with and 3 times without a reference image) rather than trusting HTTP 200:

| Input                                                    | Instruction                                   | Result                                                                                                 |
| -------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Watercolour fox with a blue scarf (16:9)                 | Change the scarf to red, keep everything else | Scarf turned red; **watercolour style, snowy composition, white border and framing all preserved** 3/3 |
| Cartoon orange cat sticker (gold crown, mint background) | Add round black sunglasses                    | Sunglasses added; **cartoon outline, crown and background colour untouched** 3/3                       |
| Fox illustration + cat sticker                           | Put the cat into the fox's scene              | The sticker cat genuinely entered the watercolour forest, **with both inputs' traits intact**          |
| Fox + cat + yellow duck + purple teapot (4 files)        | Combine them all into one scene               | **All four subjects appeared with their traits preserved** — see below                                 |

The control group (same prompt, no reference image) produced photorealistic new images that were **clearly distinguishable in style, subject and framing** — proving the reference really is consumed.

**Fusion is genuine fusion**: using 4 references with non-overlapping traits (watercolour fox with a blue scarf, cartoon crowned cat, yellow rubber duck, purple polka-dot teapot) across 2, 3 and 4 inputs, **each additional image added a corresponding subject** to the output with its distinctive traits intact — the files are consumed, not merely accepted.

<Info>
  **Edited output dimensions follow the FIRST reference image**: 1280x720 in gives 1280x720 out. `resolution` and `aspect_ratio` have no effect on the editing endpoint. Reversing the order of a 4-image set flipped the output from 1280x720 to 1024x1024, **following the new first image** — so **put your most important subject first**. Crop or resize the reference if you need a different framing.
</Info>

### Speed and concurrency

| Scenario      | Median latency          |
| ------------- | ----------------------- |
| 1K generation | about **9 seconds**     |
| 2K generation | about **15-17 seconds** |

**100 RPM runs comfortably** in our tests — no 429s, no queue rejections, ample channel capacity. Call concurrently without building a serial queue.

<Warning>
  Image APIs are **synchronous**: there is no async task ID, so a disconnected client loses the result while the request is still billed. **Set the client timeout to 360 seconds** — a 60-second timeout produces many spurious failures.
</Warning>

## Two Conventions You Must Work Around

These are the two easiest places to get caught. **Read them before integrating.**

### 1. Editing requires multipart — JSON always returns 400

`/v1/images/edits` accepts only `multipart/form-data` file uploads. Sending JSON — including the `{"image": {"type": "image_url", "url": "..."}}` form shown in some upstream vendor documentation — **always returns 400**:

```text theme={null}
request Content-Type isn't multipart/form-data
```

We exhausted 20 JSON variations with no exceptions. The correct form is a file upload:

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=grok-imagine-image" \
  -F "prompt=Change the scarf to red, keep everything else exactly the same" \
  -F "image=@fox.jpg"
```

The upside: file upload means **no image hosting required** — send the local file directly, which is simpler than preparing a public URL. The file field must be named `image` or `image[]`; `images` / `image_file` return 415.

### 2. Reference images must not go to the text-to-image endpoint

This one is subtler: passing `image` / `image_url` / `images` to `/v1/images/generations` **raises no error**. It returns 200 and generates an entirely new image from the prompt, **ignoring the reference completely — and billing you as usual**.

In our test, uploading a watercolour fox illustration with "change the scarf to red" returned **a photorealistic middle-aged man in a red scarf** — nothing to do with the input. With no error signal, this typically surfaces only when someone notices the output does not match the input.

**Any workflow involving a reference image must use `/v1/images/edits`.**

<Warning>
  Also note that **validation is lenient**: invalid `aspect_ratio` (e.g. `5:7`), `resolution` (e.g. `1K`, `1024x1024`) and `response_format` values all **silently fall back to defaults** and still return an image rather than a 400. When output does not match expectations, **check parameter spelling first**.

  The one exception is `resolution: "4k"`, which returns `503 model_service_unavailable` — that means **the tier is unsupported**, not that the channel is down. Retrying will not help; switch back to `1k` / `2k`.
</Warning>

## Practical Use

### Recommended scenarios

<CardGroup cols={2}>
  <Card title="Cost-sensitive batch generation" icon="percent">
    Flat per-image pricing with no 2K surcharge; `n` up to 10 turns batch selection into a single request
  </Card>

  <Card title="Local tweaks, not redraws" icon="wand">
    High editing fidelity suits "change one thing, leave the rest" iteration — recolouring, adding accessories, swapping backgrounds
  </Card>

  <Card title="Multi-image composition" icon="layers">
    Fuse 1-4 references to place subject A into scene and style B
  </Card>

  <Card title="Fixed-format asset production" icon="maximize">
    Reliable aspect ratios make 16:9 covers and 9:16 vertical posters reproducible at scale
  </Card>
</CardGroup>

### Code examples

**Text-to-image** (OpenAI SDK):

```python theme={null}
from openai import OpenAI
import urllib.request

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    timeout=360.0
)

resp = client.images.generate(
    model="grok-imagine-image",
    prompt="A photorealistic red wooden boat on a glassy alpine lake at dawn, cinematic photography",
    n=1,
    # aspect_ratio / resolution are not standard OpenAI SDK fields — pass via extra_body
    extra_body={"aspect_ratio": "16:9", "resolution": "1k", "response_format": "url"}
)

urllib.request.urlretrieve(resp.data[0].url, "out.jpg")
```

**Image editing** (multipart required):

```python theme={null}
import requests

with open("fox.jpg", "rb") as fp:
    r = requests.post(
        "https://api.apiyi.com/v1/images/edits",
        headers={"Authorization": "Bearer sk-your-api-key"},  # do NOT set Content-Type
        data={
            "model": "grok-imagine-image",
            "prompt": "Change the scarf to red, keep everything else exactly the same",
            "response_format": "url"
        },
        files={"image": ("fox.jpg", fp, "image/jpeg")},   # use files=, never json=
        timeout=360
    ).json()

print(r["data"][0]["url"])
```

### Best practices

1. **Pick the endpoint first**: no reference image means generation, any reference image means editing — the wrong choice fails silently with a wrong image
2. **Say "keep everything else unchanged" when editing**: the model follows this constraint closely and preserves the source
3. **Refer to "image 1 / image 2" explicitly when fusing**: this maps to `image[]` upload order and beats letting the model guess
4. **Do not rely on `seed`**: it is unsupported, and the same prompt yields different results across calls
5. **Do not reconcile billing from `usage`**: `prompt_tokens` is always `1000 x n`, a placeholder — use the Console billing records

## Pricing and Availability

| Model                        | Resolution  | APIYI price         | xAI list price | Discount          |
| ---------------------------- | ----------- | ------------------- | -------------- | ----------------- |
| `grok-imagine-image`         | `1k` / `2k` | **\$0.02 / image**  | \$0.02         | Matches list      |
| `grok-imagine-image-quality` | `1k`        | **\$0.045 / image** | \$0.05         | **90% of list**   |
| `grok-imagine-image-quality` | `2k`        | **\$0.045 / image** | \$0.07         | **\~64% of list** |

Both variants use **flat per-request billing**, and editing costs the same as text-to-image.

**An easily missed detail**: xAI prices the quality tier **by resolution** (\$0.05 at 1K, \$0.07 at 2K), while APIYI charges a flat **\$0.045** for both. In other words, **the higher the resolution you generate, the more you save** — roughly 90% of list at 1K and **64% at 2K**. For workloads that need high-resolution output anyway, that gap is far more meaningful than a token discount.

**Group**: the `Default` Group at 1.0x — **no Group switching required**. Set the Token billing model to `Pay-as-you-go Priority`.

### Effective cost with top-up bonuses

Per-request billing stacks with the [tiered top-up bonus](/en/faq/recharge-promotions) (calculated per single top-up, not cumulatively). Taking the quality tier at 2K:

| Top-up tier                     | Credit multiplier | Effective per image | vs xAI's \$0.07   |
| ------------------------------- | ----------------- | ------------------- | ----------------- |
| No promotion (list price)       | 1.0x              | \$0.045             | **64% of list**   |
| Single top-up of \$100 (+10%)   | 1.1x              | ≈ \$0.041           | **\~58% of list** |
| Single top-up of \$1,000 (+15%) | 1.15x             | ≈ \$0.039           | **\~56% of list** |
| Single top-up of \$3,000 (+20%) | 1.2x              | **\$0.0375**        | **\~54% of list** |

In other words, **at the common \$100 tier a 2K image costs roughly 58% of xAI's list price, dropping to about 54% at the maximum bonus**. The standard `grok-imagine-image` stacks the same way — \$0.02 becomes roughly \$0.0167 per image at the 20% bonus.

## Summary and Recommendations

On APIYI, Grok Imagine 2 is an image model with **controllable parameters, predictable cost and high editing fidelity**. Compared with the previous generation's gateway behaviour, aspect ratio, resolution and multi-image support are all fixed, 2K is genuinely reachable, and latency roughly halved.

**Choose it when** you need cost accurate to the image (flat pricing, no 2K surcharge), several images per call, or high-fidelity "change one thing, leave the rest" editing.

**Stay on [GPT-Image-2](/en/api-capabilities/gpt-image-2/overview) when** you need mask inpainting, pixel-exact custom sizes, or fusion across more than 4 references — Grok Imagine 2 supports none of these today, and gpt-image-2 does still hold the #1 Arena position.

The two coexist without conflict and the same Token calls both. Teams already integrated with GPT-Image-2 should read the **[Migrating from GPT-Image-2](/en/api-capabilities/grok-imagine-image/overview#migrating-from-gpt-image-2)** section — the endpoints are identical but the parameter system is not, and the inverted default response format is the easiest thing to miss.

<Info>
  **About the data**: all API behaviour, geometry, latency and editing results in this article come from APIYI testing on 12 August 2026 (UTC+8) across roughly 220 real calls. Model release details and Arena standings are cited from xAI's official announcement (7 August 2026). Pricing may change with vendor policy — the Console billing record is authoritative.
</Info>

## Related Documentation

* [Grok Imagine 2 Overview](/en/api-capabilities/grok-imagine-image/overview) - full parameters, Group setup, FAQ
* [Text-to-Image API Reference](/en/api-capabilities/grok-imagine-image/text-to-image) - with live Playground
* [Image Editing API Reference](/en/api-capabilities/grok-imagine-image/image-edit) - complete multipart examples
* [Image API Best Practices](/en/api-capabilities/image-api-best-practices)
