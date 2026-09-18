> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-vip Supports 4K Output and the quality Parameter Again

> The reverse-engineered model gpt-image-2-vip supports 4K output and the quality parameter (low / medium / high) again, on both Images API endpoints — generation and editing — with common 1K / 2K / 4K sizes and per-request billing at $0.03 per call. Use a Default group per-request billing token.

**2026/7/28 23:03 (UTC+8)** · Model Status · OpenAI

✅ **`gpt-image-2-vip` supports 4K output and the `quality` parameter again**

`gpt-image-2-vip` runs on a reverse-engineered route, so its capabilities fluctuate with OpenAI's rule changes: 4K output and `quality` were unavailable for a period, and both are working again as of this update; `size` has stayed in effect since [the 7/11 update](/en/live/2026-07/gpt-image-2-vip-size-restored). A reverse-engineered route **carries no permanent availability guarantee** — a future rule change upstream may break it again.

What is supported right now:

* Image generation: `/v1/images/generations`
* Image editing: `/v1/images/edits`
* Model name: `gpt-image-2-vip`
* Size: common 1K / 2K / 4K sizes
* Quality: `quality` accepts `low` / `medium` / `high`
* Billing: per-request, \$0.03 per call

🔑 For `gpt-image-2-vip`, please use a **Default group per-request billing token**.

Thanks for following along — we keep tracking upstream changes.

📖 Onboarding: [gpt-image-2-vip Overview](/en/api-capabilities/gpt-image-2-vip/overview)

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)
