> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok Imagine 2 Image Models Are Live, 2K Lands Near 64% of List

> xAI's second-generation image models are up: grok-imagine-image at $0.02/image and grok-imagine-image-quality at $0.045/image, billed flat per request regardless of resolution. xAI charges $0.07 for 2K on the quality tier while we charge $0.045 either way, dropping to about 58% of list once top-up bonuses stack. Testing confirms 5 aspect ratios and 1K/2K take effect exactly, up to 10 images per call, and 1-4 image fusion when editing.

**2026/8/13 01:08 (UTC+8)** · New Model · xAI

🚀 **Grok Imagine 2 image models are live on the `Default` group, with 2K landing near 64% of list**

xAI's second-generation image model shipped 7 August (officially Grok Imagine Image 2.0), and what we integrate is the **official-transit Quality Mode**. The two variants `grok-imagine-image` and `grok-imagine-image-quality` share one set of endpoints and parameters, differing only in output fidelity and price. **Note the model IDs contain no `2`** — do not write `grok-imagine-2-image`.

**Pricing is the headline here**: xAI charges the quality tier **by resolution** (\$0.05 at 1K, \$0.07 at 2K), while we charge a flat **\$0.045** for both — so the higher the resolution, the more you save, landing at about 90% of list at 1K and **64% at 2K**. Stack the [top-up bonus](/en/faq/recharge-promotions) and the common \$100 tier reaches roughly **58%**, or **54%** at maximum. The standard tier at \$0.02/image matches xAI's list price.

From roughly 220 real calls: across 5 aspect ratios x 2 resolution tiers, **output pixels matched the request 20/20 exactly** (16:9 at 2K reaches 2816x1584); `n` accepts 1–10; 1K takes about 9 seconds and 2K about 15–17, with 100 RPM running comfortably. Reference editing is **genuine editing** — only the specified part changes while everything else is preserved — and fusion accepts **1–4 references**, with each added image contributing its own subject in testing.

Two integration conventions matter, because **following the upstream vendor's documentation will return 400**:

* Image editing must use `/v1/images/edits` with `multipart/form-data` file upload; JSON always returns 400 (the upside: no image hosting needed, just send the local file)
* Reference images **must not** go to `/v1/images/generations` — that returns 200 with a normal image, but the reference is silently discarded and you are still billed, with no error at all

Note too that the editing endpoint's output dimensions **follow the first reference image**; `resolution` and `aspect_ratio` have no effect there.

Full parameters, migration guide and code samples: [Grok Imagine 2 documentation](/en/api-capabilities/grok-imagine-image/overview); measured details in the [launch notes](/en/news/grok-imagine-2-launch). Teams already on GPT-Image-2 can jump straight to the [migration section](/en/api-capabilities/grok-imagine-image/overview#migrating-from-gpt-image-2) — the endpoints are identical, but the parameter system is not.

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)
