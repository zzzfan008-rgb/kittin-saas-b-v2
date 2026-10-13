> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedream 5.0 Flash Is Live: $0.018 per Image

> BytePlus's new fast image model Seedream 5.0 Flash is live on APIYI: $0.018 per request, the same as the official price, free reference images, 15–20 second generation in our tests, accurate Chinese layouts, plus interactive editing and transparent layer separation.

## Key Takeaways

* **New model, live now**: `seedream-5-0-flash-260915`, available in the `default` / `svip` groups, on the same `/v1/images/generations` endpoint as the other Seedream versions
* **Cheapest in the series**: **\$0.018 per request**, the same as BytePlus official pricing; **reference images are free** and failed requests are not billed. With top-up bonuses the effective price is roughly **9%–17% below** the official rate
* **Fast in practice**: 11–20 seconds for text-to-image and about 28 seconds for editing with 10 reference images, far quicker than 5.0 Pro's two minutes
* **Strong on layout and text**: a three-line Chinese poster and an English / Japanese / Korean title all rendered correctly in our tests, and interactive editing adds elements at a precise position
* **Transparent layers need layer separation**: `layer_decomposition` returns a background base plus several transparent layers, but it is **billed per output image**, often a dozen or more

## Background

Seedream is ByteDance's image generation series on BytePlus. APIYI already offered four versions: 5.0 Pro, 5.0, 4.5 and 4.0. 5.0 Pro has the best image quality, but at about 2 minutes and \$0.12 per request it suits demanding professional work.

5.0 Flash covers the other end: **fast, cheap and built for volume**. BytePlus positions it as "faster image creation, stronger layouts, lower cost at scale," aimed at ad assets, editorial visuals, UGC and high-volume creative work where speed and budget matter.

BytePlus is also clear about the trade-off: Flash prioritizes speed, cost and layout, and **5.0 Pro is still the better choice for photorealism and fine material detail**.

## Detailed Analysis

### Official Comparison: Flash vs. Pro

| Dimension | 5.0 Flash | 5.0 Pro |
| - | - | - |
| Generation time (official) | Under 20 s | 20–90 s |
| Generation time (APIYI tests) | 11–20 s | 110–130 s |
| APIYI price | **\$0.018 / request** | \$0.12 / request |
| Preset tiers | 1K / 1.5K / 2K | 1K / 2K |
| Maximum pixels | About 4.62M, side ratio up to 16:1 | About 4.19M (tested) |
| Interactive editing, layers, 14 languages | ✅ | ✅ |
| Batch sequence, streaming | ❌ | ❌ |
| Best at | Layout, font variety, bright color | Photorealism and material detail |

BytePlus also reports that in general scenes and graphic design tasks, Flash reduces some gray or yellow color casts and matches reference-image colors more closely.

### APIYI Test Results

We ran about 40 calls on launch day (2026-09-24, UTC+8). The main findings:

<CardGroup cols={2}>
  <Card title="Stable speed" icon="gauge">
    11–20 s for text-to-image and about 19 s at the largest exact size `2688x1712`; about 16 s for editing with 1 to 3 reference images and about 28 s with 10
  </Card>

  <Card title="Accurate text and layout" icon="type">
    All three lines of a Chinese coffee poster (title, subtitle and date) were correct, and so was a title in English, Japanese and Korean
  </Card>

  <Card title="Interactive editing" icon="mouse-pointer-click">
    Position-based edits such as "add a red NEW badge in the top-right corner" change only that area and leave the rest of the image almost untouched
  </Card>

  <Card title="Transparent layers" icon="layers">
    `layer_decomposition: true` returned 1 filled-in background base plus 11 RGBA transparent layers, with clean cutouts of elements like the cup and a maple leaf
  </Card>
</CardGroup>

### Specifications

| Item | Value |
| - | - |
| Model name | `seedream-5-0-flash-260915` |
| Endpoint | `POST /v1/images/generations` (shared by generation and editing) |
| Preset tiers | `1K` / `1.5K` / `2K`, default 2K when omitted; `3K` / `4K` return 400 |
| Exact pixels | 921,600–4,624,220 total pixels, side ratio up to 16:1 |
| Reference images | Up to 10, as URLs or data URLs; an 11th returns 400 |
| Output | `png` / `jpeg`, returned as `url` or `b64_json` |
| Not supported | `sequential_image_generation`, `stream` (any value returns 400); `n` is silently ignored |
| Watermark | Adds an "AI generated" watermark when `watermark` is omitted |

## Practical Use

### Recommended Scenarios

* **High-volume e-commerce and ad assets**: \$0.018 per request in under 20 seconds, good for generating hundreds or thousands of images and picking the best
* **Posters, covers and marketing images with text**: layout and text rendering are this model's strengths, in Chinese and other languages
* **Editing existing assets**: interactive editing changes images by position, and layer separation turns a finished image into reusable transparent elements
* **Not a good fit**: photorealistic portraits, fine material detail, or 3K / 4K output; use 5.0 Pro or 4.5 / 4.0 for those

### Code Example

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.generate(
    model="seedream-5-0-flash-260915",
    prompt="An autumn coffee shop poster with the headline 'Autumn Limited' and the subtitle 'Chestnut Latte, second cup half price', warm orange tones, magazine-style layout",
    size="2K",
    response_format="url",
    extra_body={
        "watermark": False,   # omitting it adds an "AI generated" watermark
    },
)
print(resp.data[0].url)   # the link expires in about 24 hours, so save it right away
```

For editing and multi-image fusion, put the reference image URLs in an `image` array inside `extra_body`; see the [Image Editing API](/en/api-capabilities/seedream-image/image-edit).

### Best Practices

<Warning>
  **Migrating from 5.0 or 4.x? Remove two fields first**: `sequential_image_generation` (including `"disabled"`) and `stream`. Flash supports neither, and any value returns 400.
</Warning>

* **Pass exact pixels for a fixed aspect ratio**: with preset tiers the model picks the ratio from the content, and 2K produced portraits such as 1776×2368 and 1664×2496 in our tests; for a 16:9 landscape image pass a size like `2560x1440`
* **Send `watermark: false` explicitly**: Flash adds a watermark by default, so turn it off for commercial assets
* **Use layer separation for transparency, not the prompt**: asking for a transparent background in the prompt returns a png with no alpha channel, just a checkerboard drawn into the image
* **Layers are billed per image, so run them at 1K**: one layer request returned 12 images and cost \$0.216; 1K took about 78 seconds, while a 2K request returned nothing after 15 minutes but was still billed \$0.216, so always use 1K and set the client timeout to 300 seconds or more
* **Start timeouts at 60 seconds**: a single image takes under 20 seconds, but many reference images or large data URL uploads are slower (one data URL edit took about 54 seconds)

## Pricing and Availability

### Pricing

| Item | Price |
| - | - |
| Per generation (1 image) | **\$0.018**, the same as BytePlus official pricing |
| Reference images | Free (1, 3 and 10 reference images each billed \$0.018 in our tests) |
| Failed requests such as parameter errors | Not billed |
| Layer separation (`layer_decomposition`) | Billed per output image, often a dozen or more |

Compared with the rest of the series: 5.0 Flash is \$0.018 per request, 5.0 is \$0.035 per image, 4.5 is \$0.04 per image and 5.0 Pro is \$0.12 per request.

Available groups: `default` and `svip`.

### Stack With Top-Up Promotions

Top-ups earn a tiered bonus, which puts Flash at roughly 9%–17% below the official price. See the [top-up promotions](/en/faq/recharge-promotions) for details.

## Summary

Seedream 5.0 Flash brings the entry price of the Seedream series down to \$0.018 per image while keeping the series' well-regarded Chinese layout ability. It stays under 20 seconds in our tests and doesn't charge for reference images, making it the best-value Seedream model for teams producing e-commerce images and marketing posters at scale.

We recommend it as the default for everyday batch generation. Switch to 5.0 Pro for photorealistic portraits or demanding material detail, and use 4.5 or 4.0 when you need 3K / 4K output. When integrating, remember three things: remove `sequential_image_generation` and `stream`, turn off the watermark explicitly, and use layer separation for transparent assets while budgeting per image.

For more parameters and version differences, see the [Seedream overview](/en/api-capabilities/seedream-image/overview) and [historical versions](/en/api-capabilities/seedream-image/historical-versions).

<Info>
  Sources: BytePlus's official Seedream 5.0 Flash one-pager and the BytePlus ModelArk image generation API docs `docs.byteplus.com/en/docs/ModelArk/1541523`; test data from APIYI's launch-day testing on September 24, 2026 (UTC+8). No third-party benchmarks cover this model yet.
</Info>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.