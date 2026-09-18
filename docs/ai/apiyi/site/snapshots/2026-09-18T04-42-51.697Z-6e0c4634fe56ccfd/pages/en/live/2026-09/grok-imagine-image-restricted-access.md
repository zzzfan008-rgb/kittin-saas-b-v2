> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok Imagine Image Models Are No Longer Open by Default — Access Requires a Dedicated Group

> grok-imagine-image / grok-imagine-image-quality are fully integrated but no longer sit in the Default group. Access now runs through the dedicated Grok_imagine group: customers with $1,000+ cumulative spend can ask support to enable it, everyone else applies for review, and calls without it return 503.

**2026/9/16 01:10 (UTC+8)** · Service Notice · xAI

🔒 **The Grok Imagine image models are fully integrated but not open by default — access requires the dedicated `Grok_imagine` group**

The content-safety policy of `grok-imagine-image` / `grok-imagine-image-quality` differs substantially from the other models on the platform, and some categories are not filtered. To limit compliance risk we grant access selectively: this family is **not in the `Default` group**, and a dedicated `Grok_imagine` group now carries it. A Token without that group returns `503` on every call — a permissions problem, not an outage, so retrying will not help.

How to get access:

* **Existing customers with \$1,000+ cumulative spend**: contact support, describe your use case, enabled after verification
* **Everyone else**: apply through [WeCom support](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec) with your **use case** and your **content-moderation controls**; we enable it for your account once approved

Once enabled, switch your Token to `Grok_imagine` — pricing matches `Default` (1.0x rate). Parameters, billing and the full application process: [Grok Imagine 2 Overview](/en/api-capabilities/grok-imagine-image/overview).

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)
