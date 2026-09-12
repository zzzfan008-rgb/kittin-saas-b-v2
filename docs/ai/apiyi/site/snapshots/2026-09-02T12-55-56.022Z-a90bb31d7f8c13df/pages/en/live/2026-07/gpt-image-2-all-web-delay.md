> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-all Delays · Root Cause Remains ChatGPT Web App

> ChatGPT web app image requests occasionally fail and retry, pushing some gpt-image-2-all requests past 300 seconds; the issue is upstream, not on our gateway. gpt-image-2-vip sees the same fluctuation — Nano Banana 2 and gemini-3.1-flash-lite-image are also available for 1K needs.

**2026/7/8 14:27 (UTC+8)** · Model Status · OpenAI / Google

⚠️ **`gpt-image-2-all` requests are taking longer · root cause remains the ChatGPT web app**

Investigation shows ChatGPT web app image requests have recently been failing and retrying intermittently, pushing overall latency up — some requests now take 300+ seconds. `gpt-image-2-vip` is subject to the same upstream fluctuation and isn't necessarily faster.

Channel status for 1K resolution needs (pick as needed):

* Official-forwarded `gpt-image-2`: latency similar to `gpt-image-2-vip`, no clear difference
* `gpt-image-2-vip`: subject to the same upstream fluctuation
* `Nano Banana 2`: available
* `gemini-3.1-flash-lite-image`: available

We continue monitoring the upstream fix.

***

← [Back to Live Updates](/en/live) · 📚 [Browse Archive](/en/live/archive)
