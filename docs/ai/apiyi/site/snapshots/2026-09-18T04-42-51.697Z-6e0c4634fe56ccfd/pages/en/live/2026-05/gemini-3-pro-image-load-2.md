> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gemini-3-pro-image-preview load returns on Google's side · intermittent 429

> Tonight Google's compute supply for gemini-3-pro-image-preview is tight again — even with account quota it intermittently returns 429 / 503 high-demand errors. This is upstream Google-side fluctuation; loosen timeout and retry interval, then retry later. gemini-3.1-flash-image-preview is running normally.

**2026/5/27 23:28 (UTC+8)** · Model Status · Google

⚠️ **`gemini-3-pro-image-preview` (Nano Banana Pro) load returns on Google's side · intermittent 429** — Following up on today's load alert: tonight Google's compute supply for this model is tight again, **intermittently returning** `503 / 429 upstream_error` **even though the account still has quota**: `This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.`. This is upstream Google-side fluctuation — loosen your timeout and retry interval, then retry later. `gemini-3.1-flash-image-preview` is running normally at the moment and can be used as needed.

***

← [Back to Live Updates](/en/live) · 📚 [Archive](/en/live/archive)
