> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-vip Brief Saturation 13:46–14:00 (UTC+8) Resolved, Caused by Account-Pool Concurrency Shortage

> For about 15 minutes on 5 September, from 13:46 to 14:00 (UTC+8), gpt-image-2-vip hit concurrency saturation due to an account-pool shortage, and some requests slowed down or failed. Service recovered at 14:00 sharp. The reverse channel is an ongoing contest with the provider's platform risk controls, so we suggest wiring the official gpt-image-2 as a fallback.

**2026/9/5 15:24 (UTC+8)** · Model Status · OpenAI

✅ **`gpt-image-2-vip` saw about 15 minutes of concurrency saturation from 13:46 to 14:00 (UTC+8) and has been back to normal since 14:00 sharp**

Cause: the saturation came from insufficient concurrency in the account pool behind `gpt-image-2-vip`, not from the gateway or request parameters. This model runs on a reverse channel, which is by nature an ongoing contest with the provider's platform risk controls: pool capacity fluctuates with risk-control actions, so brief saturation cannot be ruled out entirely. No code or parameter changes are needed after recovery.

We suggest wiring the official `gpt-image-2` into your pipeline as a fallback: both use the same images API with compatible parameters, so requests can fail over automatically the next time `gpt-image-2-vip` fluctuates. See the [gpt-image-2 integration guide](/en/api-capabilities/gpt-image-2/overview).

Thank you for your patience; we are monitoring continuously.

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)
