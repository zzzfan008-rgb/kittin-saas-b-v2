> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-vip back to normal, with notes on two early-morning windows

> gpt-image-2-vip is running normally at around 90s per image. Upstream risk controls left the account pool short overnight: some tasks timed out between 02:19 and 03:31, and HTTP 429 errors returned instantly from 03:55:38 to 04:16:32. Includes two integration suggestions on timeouts and dual-channel fallback.

**2026/8/13 09:59 (UTC+8)** · Model Status · OpenAI

✅ **`gpt-image-2-vip` is back to normal, currently around 90s per image**

Tightened upstream risk controls left the account pool short of capacity overnight, producing two windows of disruption (all times UTC+8): between **02:19 and 03:31** the API timed out on some tasks, leaving requests hanging for a long time; between **03:55:38 and 04:16:32** the model returned `Upstream resources are temporarily busy. Please try again later.` (HTTP 429, type `rate_limit_error`), so it was fully unavailable for those 20 minutes — though as an immediate error rather than a stalled connection, callers could detect it at once and route to another model. Capacity has since recovered.

Two integration suggestions:

* **Timeouts**: set the request timeout for `gpt-image-2-vip` straight to the maximum of **360 seconds**, so the first failure mode above cannot tie up your caller for long.
* **Dual-channel fallback**: wire up the official-relay `gpt-image-2` alongside the reverse-proxy `gpt-image-2-vip` so each backs the other. The official relay is the reliability anchor; the reverse-proxy route is stable most of the time but cannot be perfect, and running both in parallel materially reduces the impact of a single-point wobble.

Apologies for the disruption — we are keeping a close watch on upstream capacity.

***

← [Back to Live Updates](/en/live) · 📚 [Archive by month](/en/live/archive)
