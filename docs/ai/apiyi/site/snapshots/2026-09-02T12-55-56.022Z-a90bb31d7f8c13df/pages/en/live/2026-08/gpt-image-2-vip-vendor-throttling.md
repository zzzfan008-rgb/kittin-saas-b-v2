> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-vip unstable under provider-side rate limiting

> From 20:30 (UTC+8) on 24 August, gpt-image-2-vip has been affected by tightened provider-side rate limiting and abuse controls, with higher failure rates and longer latency. The official-relay gpt-image-2 is running normally; pass the quality parameter explicitly to keep billing predictable.

**2026/8/24 21:55 (UTC+8)** · Model Status · OpenAI

⚠️ **`gpt-image-2-vip` has been unstable since 20:30 (UTC+8) tonight due to provider-side rate limiting**

`gpt-image-2-vip` has been a popular choice because `size` is honoured precisely and it can render at 2K and 4K. Since 20:30 (UTC+8) tonight, abuse controls and rate limiting on the provider side have tightened noticeably, and the model is seeing higher failure rates and longer latency. It is still fluctuating.

Status of the image endpoints in this series (pick whichever fits your case):

* `gpt-image-2-vip`: unstable, affected by provider-side rate limiting
* Official-relay `gpt-image-2`: running normally, billed by usage; 4K and `quality=high` carry a higher per-image cost

When using the official-relay `gpt-image-2`, **pass `quality` explicitly** (for example `medium`). If you omit it, the default is `auto` — a dynamic tier where the model picks the quality level itself, so latency and cost drift between runs of the same prompt and your spend becomes hard to predict. The four official values are `low` / `medium` / `high` / `auto`; see [gpt-image-2 overview](/en/api-capabilities/gpt-image-2/overview) for the parameter reference and per-tier pricing.

We are working on it and monitoring continuously, and will update here as soon as service recovers.

***

← [Back to Live Updates](/en/live) · 📚 [Archive by month](/en/live/archive)
