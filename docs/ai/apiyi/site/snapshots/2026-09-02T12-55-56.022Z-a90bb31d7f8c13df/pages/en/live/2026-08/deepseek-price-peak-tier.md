> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek Moves to Peak/Off-Peak Billing — APIYI Prices at the Peak Tier

> DeepSeek switches to peak/off-peak billing at 16:00 UTC on 16 August 2026. APIYI follows for deepseek-v4-flash and deepseek-v4-pro, pricing both at the peak tier with no time-of-day variation, because official capacity shortfalls are covered by the pricier BytePlus and Alibaba Cloud routes at no margin. Recharge bonuses still stack.

**2026/8/15 08:55 (UTC+8)** · Price Update · DeepSeek

💸 **DeepSeek is switching to peak/off-peak billing, and APIYI is following with peak-tier pricing on the same effective date**

The official change takes effect at `16:00 UTC on August 16, 2026` — **00:00 on 17 August, UTC+8**. From then on the API bills in two tiers, with off-peak rates at half the peak rates; peak hours are 01:00–04:00 and 06:00–10:00 UTC (09:00–12:00 and 14:00–18:00 UTC+8), and everything else is off-peak. Source: `api-docs.deepseek.com/quick_start/pricing`.

APIYI follows for `deepseek-v4-flash` and `deepseek-v4-pro`, billing **at the peak tier at all times, with no time-of-day variation**. New rates per 1M tokens (cache-hit input / cache-miss input / output):

* `deepseek-v4-flash`: \$0.014 / \$0.44 / \$1.32
* `deepseek-v4-pro`: \$0.044 / \$1.32 / \$3.96

Why a fixed peak tier: our billing system does not support time-of-day rates, but the main reason is supply. We route to the official endpoint first, and when official concurrency falls short we fall back to BytePlus and Alibaba Cloud's official resale, whose DeepSeek pricing has always run well above the official rate. Pricing uniformly at the peak tier is what lets us keep both routes available — we do not take a margin on this.

Even at list price, recharge bonuses still stack, so the effective cost stays below the nominal rate.

For the full rate table, the peak-window conversion, and the three pricing options gateways face, see the [deep dive](/en/news/deepseek-price-increase-2026-08).

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive) · 🔗 [Promotions](/en/faq/recharge-promotions)
