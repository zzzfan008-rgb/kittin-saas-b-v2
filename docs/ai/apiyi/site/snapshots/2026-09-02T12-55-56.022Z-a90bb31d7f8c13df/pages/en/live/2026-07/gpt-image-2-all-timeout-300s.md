> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-all Occasional 300s Timeouts Explained

> Long gpt-image-2-all requests are mostly caused by account-pool retries after content-safety failures. Keep prompts and input images compliant, keep client timeout at 300s or shorter; billed calls that hit 300s will get credit reissued, expected Saturday July 11.

**2026/7/6 15:24 (UTC+8)** · Model Status · OpenAI

⚠️ **`gpt-image-2-all` occasionally hits 300s timeouts · related to content-safety blocks**

Our investigation shows that the long-running `gpt-image-2-all` requests are mostly ones where a content-safety check failed and triggered account-pool retries — the stacked retries stretch the total duration. It is not a performance degradation of the channel itself.

Usage advice:

* Keep prompts and input images compliant and reasonable, to reduce safety-triggered retries at the source
* A client `timeout` of 300s is fine, and shortening it somewhat is also OK to avoid long waits

Compensation: for calls in the logs where `gpt-image-2-all` was billed and the duration reached 300s, APIYI will reissue the credits in one batch, expected on Saturday, 2026/7/11 (UTC+8).

Thanks for your understanding — we keep operating and improving.

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)
