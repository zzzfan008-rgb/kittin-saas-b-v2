> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-vip and 2.5 -vip Series Still Scaling, Unstable for Now

> gpt-image-2-vip and the gpt-image-2.5 -vip series run on reverse-engineered routes limited by account-pool concurrency. Demand surged after the holiday, and we have been adding capacity since yesterday; they remain unstable. Official gpt-image-2 and gpt-image-2.5 have ample concurrency, and we suggest using them as a fallback in production.

**2026/10/9 10:47 (UTC+8)** · Model Status · OpenAI

⚠️ **`gpt-image-2-vip` and the `gpt-image-2.5` -vip series have been adding capacity since yesterday and remain unstable**

The -vip series runs on reverse-engineered routes whose concurrency depends on the size of the account pool. Request volume rose sharply after the holiday and outpaced pool concurrency, so some periods see failed requests or slower queueing. We are continuously adding accounts to expand capacity.

Current status by route:

* `gpt-image-2-vip`, `gpt-image-2.5-vip`, `gpt-image-2.5-sunburst-vip`, `gpt-image-2.5-flare-vip`: scaling up, still fluctuating
* Official `gpt-image-2`: ample concurrency
* Official `gpt-image-2.5-sunburst` / `gpt-image-2.5-flare`: ample concurrency

For production workloads we still suggest keeping the official route as a fallback, along with client-side retries on failure. The official route is billed per token, unlike the per-image billing of -vip; see [GPT-Image Official Overview](/en/api-capabilities/gpt-image-2/overview). Thanks for your patience; we keep operating around the clock.

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.