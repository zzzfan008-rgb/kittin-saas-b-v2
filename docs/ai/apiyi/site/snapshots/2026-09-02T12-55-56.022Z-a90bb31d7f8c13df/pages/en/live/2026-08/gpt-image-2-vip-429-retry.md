> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-vip is saturated: retry on 429, do not retry content-safety blocks

> On the afternoon of 25 August gpt-image-2-vip is running saturated, with non-streaming time-to-first-byte measured at 82–190 seconds. To avoid long blocking waits we lowered the gateway's internal retry count and handed the retry decision back to you: retry on 429, but do not retry content-safety blocks.

**2026/8/25 15:49 (UTC+8)** · Model Status · OpenAI

⚠️ **`gpt-image-2-vip` is running saturated: retry on 429, skip retries on content-safety blocks**

Traffic on `gpt-image-2-vip` is high this afternoon, and time-to-first-byte on non-streaming calls is measuring **82–190 seconds**. To stop a single call from blocking you for that long, we have **lowered the gateway's internal retry count** — the gateway no longer quietly retries on your behalf, so the decision is yours to make.

The two error classes need different handling:

* **429 (rate limit / queueing)**: transient congestion — **retry it**, and it will usually go through
* **Content-safety block**: a provider content-policy decision — **do not retry**, since the same prompt will return the same verdict and you only add waiting time

Two endpoints to retry against (pick whichever fits your case):

* `gpt-image-2-vip`: saturated, slower first byte, retries still go through
* Official-relay `gpt-image-2`: running normally, billed by usage; 4K and `quality=high` carry a higher per-image cost

Worth encoding both rules in your client's error branches: bounded backoff retries for 429, and a direct return to the user for content-safety errors so they can reword the prompt. See the [gpt-image-2 overview](/en/api-capabilities/gpt-image-2/overview) for parameters and error handling.

***

← [Back to Live Updates](/en/live) · 📚 [Archive by month](/en/live/archive)
