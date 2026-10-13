> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana 2.1 Is Live: 4K for $0.05

> Google's Nano Banana 2.1 (gemini-nano-banana-2.1), now GA, is live on APIYI: 67 points above Nano Banana 2 on the Arena text-to-image board, with Google's image output price halved. $0.05 per request (4K included); about $0.03 for a 1K image token-based.

## Key Takeaways

* **Better quality, higher rank**: 1328 on the Arena text-to-image board — 67 points above Nano Banana 2 and 80 above Nano Banana Pro; 1428 on image editing, also ahead of both
* **Google's image output price is halved**: image output drops from \$60 to \$30 per 1M tokens, but input rises from \$0.50 to \$1.50, and a 4K image now uses 3780 tokens instead of 2520
* **Two billing modes on APIYI**: \$0.05 per request (same for 1K / 2K / 4K), or token-based at \$0.66 input / \$13.2 output per 1M tokens — about \$0.021–\$0.033 for a 1K image in production
* **Simple rule**: token-based is cheaper for 1K / 2K; per-request is cheaper for 4K
* **Migration notes**: no 512px; the model thinks by default and thinking tokens count toward output cost; Nano Banana 2 stays available at the same price

## Background

In February 2026, Google released Nano Banana 2 (`gemini-3.1-flash-image`), delivering near-Pro quality at Flash-level speed and cost. It quickly became one of the most used image models on APIYI.

On October 6, Google released its upgrade, **Nano Banana 2.1**, with model ID `gemini-nano-banana-2.1`, generally available from day one. Google's docs position it as the primary workhorse for image generation and recommend it for all new projects.

Note that Google's deprecation table currently lists **no shutdown date** for `gemini-3.1-flash-image`; it only names 2.1 as the recommended replacement. Some articles online claim Nano Banana 2 will shut down on October 29, which does not match Google's table — go by the official one.

## Deep Dive

### Benchmarks

The figures below come from the public Arena (formerly LMArena) leaderboards as of 2026-10-06. 2.1 has only just been listed, so it has fewer votes and its scores are still preliminary:

| Leaderboard | Nano Banana 2.1 | Nano Banana 2 | Nano Banana Pro |
| - | - | - | - |
| Text-to-image score | **1328** (#5) | 1261 (#11) | 1248 (#16) |
| Image editing score | **1428** (#6) | 1387 (#14) | 1390 (#12) |
| Text-to-image votes | 5,312 | 59,779 | 174,996 |

What this means:

* 2.1 **beats Google's own Pro** on both boards, ending the pattern where the value model trailed the flagship on quality
* OpenAI's `gpt-image-2.5` models still top the boards; text-to-image ranks 4–6 (MAI-Image-2.6, Nano Banana 2.1, Grok Imagine 2.0) overlap within their error margins and are effectively one tier
* 2.1's edge is **the lowest price at this quality level**: 4K for \$0.05 per request

### Key Features

<CardGroup cols={2}>
  <Card title="Quality and text rendering" icon="sparkles">
    Better visual quality and in-image text accuracy, with the previous version's tiling artifacts fixed
  </Card>

  <Card title="Multi-turn consistency" icon="repeat">
    Characters and scenes stay steadier across conversational edits, with up to 4 character references
  </Card>

  <Card title="Three thinking levels" icon="brain">
    minimal / medium / high, default medium; the previous version had only minimal / high
  </Card>

  <Card title="Multi-reference fusion" icon="layers">
    Up to 10 object references + 4 character references + 3 style references
  </Card>
</CardGroup>

### Specs vs. Nano Banana 2

| | Nano Banana 2.1 | Nano Banana 2 |
| - | - | - |
| Model ID | `gemini-nano-banana-2.1` | `gemini-3.1-flash-image` |
| Resolutions | 1K / 2K / 4K | 512 / 1K / 2K / 4K |
| Aspect ratios | 14 | 14 |
| Output tokens per 4K image | 3780 | 2520 |
| Thinking levels (default) | minimal / medium / high (medium) | minimal / high (minimal) |
| Input modalities | Text, image, video, PDF | Text, image |
| Google price: input | \$1.50 / 1M | \$0.50 / 1M |
| Google price: text and thinking output | \$7.50 / 1M | \$3 / 1M |
| Google price: image output | \$30 / 1M | \$60 / 1M |
| Google price: per 4K image | \$0.113 | \$0.151 |

### Three details from our own tests

We ran about 30 requests on our production gateway on 2026-10-07:

1. **It thinks by default**: even with no thinking parameter, each request produces about 530–960 `thoughtsTokenCount`, plus roughly 230–400 non-image output tokens. All of it counts toward output cost, so **estimating from image tokens alone underestimates the cost by 20%–40%**. Setting `high` adds only about 30% more thinking tokens, roughly +6% for a 4K image.
2. **No 512**: `"imageSize": "512"` returns 400 (not billed). If your Nano Banana 2 code uses 512, change it to `1K` before switching.
3. **Sizes differ from the previous version**: without `aspectRatio`, the model picks a ratio based on the content (mostly 16:9 for scenes, 2:3 or 3:4 for posters). 8:1 at 1K is 2928×352, versus 3072×384 on Nano Banana 2. Don't reuse the old size table for front-end layout.

## Practical Use

### Recommended scenarios

* **E-commerce and marketing assets**: posters, product shots and banners with text, where the text rendering gains show most
* **Multi-turn editing**: start with a draft and refine it step by step, with better character and scene consistency
* **Bulk 4K output**: \$0.05 per request regardless of resolution, so the more 4K you generate, the better the deal
* **Images that need live data**: attach Google Search for weather cards or market charts (\$0.014 per search query on top)

### Code example

```python theme={null}
import base64
import requests

resp = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-nano-banana-2.1:generateContent",
    headers={"Authorization": "Bearer sk-your-apiyi-key"},
    json={
        "contents": [{"parts": [{"text": "A grand-opening poster for a coffee shop titled 'Autumn Special', warm tones, 4K"}]}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": "3:4", "imageSize": "4K"},
        },
    },
    timeout=360,
).json()

# The order of parts is not guaranteed; take the last image part
image = [p for p in resp["candidates"][0]["content"]["parts"] if "inlineData" in p][-1]
with open("poster.png", "wb") as f:
    f.write(base64.b64decode(image["inlineData"]["data"]))
```

### Best practices

* **Always pass `imageSize` and `aspectRatio`**; otherwise the model picks the ratio and the token-based cost is unpredictable
* **Set the timeout to 360 seconds**: most 4K requests in our tests took 30–50 seconds, a few over 2 minutes
* **Never hard-code `parts[0]`**: iterate over `parts` and take the last one with `inlineData`
* **Migrating from Nano Banana 2 takes two steps**: change the model name and switch 512 to 1K; request and response formats are unchanged

## Pricing and Availability

### Pricing

APIYI offers both per-request and token-based billing; choose the billing mode when you create a token:

| Billing mode | APIYI | Google |
| - | - | - |
| Per request | **\$0.05** (same for 1K / 2K / 4K) | 4K \$0.113 per image |
| Token-based input | \$0.66 / 1M tokens | \$1.50 / 1M tokens |
| Token-based output (image, text and thinking at one rate) | \$13.2 / 1M tokens | Images \$30 / 1M; text and thinking \$7.50 / 1M |

With token-based billing, **the cost per image varies**. Here are the actual charges for 60 token-billed production requests on 2026-10-07:

| Resolution | Min | Median | Max | Per-request price |
| - | - | - | - | - |
| 1K | \$0.021 | \$0.029 | \$0.033 | \$0.05 |
| 2K | \$0.033 | \$0.036 | \$0.058 | \$0.05 |
| 4K | \$0.061 | \$0.063 | \$0.067 | \$0.05 |

<Tip>
  **The short version**: for 1K / 2K, use token-based billing — usually \$0.02–\$0.04 per image. For 4K, use per-request billing at a fixed \$0.05. If you send 10+ reference images in one request, input tokens push the token-based cost close to \$0.05, so use per-request for those too.
</Tip>

<Note>Model prices are aligned with the official website and may change with it; the table above is for reference only — the **Model Pricing** tab in the top navigation is authoritative: [Model Pricing](/en/models/index).</Note>

Available groups: `Default` (1.0x) and `NB-Enterprise` (1.4x fallback channel). Nano Banana 2 remains available at the same price (\$0.055 per request).

### Stack it with top-up bonuses

These prices can be combined with APIYI's top-up bonus for an even lower actual cost; see [Top-up Promotions](/en/faq/recharge-promotions).

## Summary and Recommendations

Nano Banana 2.1 is an upgrade where quality goes up and price comes down: its Arena scores beat Google's own Pro, while Google's image output price is halved. On APIYI, **a 4K image costs just \$0.05 per request** — less than Nano Banana 2's \$0.055.

* **New projects**: use Nano Banana 2.1
* **Already on Nano Banana 2**: switching is worth it — change the model name and drop 512
* **Need 512px thumbnails**: stay on Nano Banana 2, or use Nano Banana 2 Lite
* **Want the top of the leaderboard**: compare the `gpt-image-2.5` models, which cost more

Full parameters, Playground and the Agent skill are in [Nano Banana 2.1 Image Gen/Editing](/en/api-capabilities/gemini-nano-banana-2.1/overview); the launch note is in [Live Updates](/en/live/2026-10/gemini-nano-banana-2-1).

<Info>
  **Sources** (retrieved 2026-10-07): Google Gemini API model and pricing pages `ai.google.dev/gemini-api/docs/models/gemini-nano-banana-2.1` and `ai.google.dev/gemini-api/docs/pricing`; deprecation schedule `ai.google.dev/gemini-api/docs/deprecations`; Arena text-to-image and image-editing leaderboards `arena.ai/leaderboard` (data as of 2026-10-06); APIYI pricing API and production gateway tests (2026-10-07).
</Info>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.