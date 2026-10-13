> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2.5 official relay: Default group short on concurrency, image2Enterprise running stably

> The upstream concurrency quota for gpt-image-2.5 official relay in the Default group is tight, so requests queue or fail at peak hours; the image2Enterprise group runs on OpenAI's enterprise fallback route and is currently stable at a 1.2x rate. Top-up tier bonuses offset that rate, with the bonus tier set by single top-up amount and capped at 20%.

**2026/9/21 12:20 (UTC+8)** · Model Status · OpenAI

⚠️ **`gpt-image-2.5` official relay is short on concurrency in the `Default` group, while `image2Enterprise` runs stably**

The upstream concurrency quota for the default group is tight at current volumes, so requests queue or fail at peak hours. The enterprise group runs on OpenAI's enterprise fallback route with separate capacity. Current status of both groups:

* `Default` group: concurrency is tight, with queuing and a higher failure rate at peak hours
* `image2Enterprise` group: ample concurrency, generating stably, at a 1.2x rate

The enterprise group's 1.2x rate is 20% above the default group, and top-up tier bonuses offset that: the bonus rate depends on the amount of a single top-up, so at the top 20% tier what you pay matches the provider's own pricing, while lower tiers still cost somewhat more than the default group. See [Top-up Promotions](/en/faq/recharge-promotions) for the tier table. The group is selected per Token — see [Enterprise Groups](/en/faq/enterprise-group-vertex-fallback) for how to switch.

We are adding concurrency capacity to the default group and will post an update once it is restored.

***

← [Back to Live](/en/live) · 📚 [Monthly archive](/en/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.