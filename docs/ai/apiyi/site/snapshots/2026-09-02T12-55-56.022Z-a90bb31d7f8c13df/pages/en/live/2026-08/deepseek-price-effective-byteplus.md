> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek Peak-Tier Pricing Is Now Live, Plus Two BytePlus-Relayed Legacy Snapshots

> DeepSeek peak-tier pricing took effect at 00:00 on 17 August (UTC+8). Of the seven DeepSeek models on APIYI, four run on DeepSeek's official relay, while deepseek-v4-flash-260425, deepseek-v4-pro-260425 and deepseek-v4-flash-ga-260731 come from BytePlus. flash-260425 is cheaper on input and output but costs more on cache reads.

**2026/8/17 19:07 (UTC+8)** · Price Update · DeepSeek / ByteDance

💸 **DeepSeek peak-tier pricing took effect at 00:00 today (UTC+8); here is where the two BytePlus-relayed legacy snapshots fit in**

The change follows DeepSeek's peak/off-peak billing, and APIYI bills at the peak tier at all times with no time-of-day variation — background in the [previous update](/en/live/2026-08/deepseek-price-peak-tier). Seven DeepSeek models are callable today: `deepseek-v4-pro`, `deepseek-v4-pro-0813`, `deepseek-v4-flash` and `deepseek-v4-flash-0731` run on DeepSeek's own official relay and are now on the new peak-tier rates; `deepseek-v4-flash-260425`, `deepseek-v4-pro-260425` and `deepseek-v4-flash-ga-260731` are relayed from **BytePlus (ByteDance's overseas Volcano Engine)**.

Current rates per 1M tokens (prompt / completion / cache read) — pick whichever fits:

* `deepseek-v4-flash`, `deepseek-v4-flash-0731`: \$0.44 / \$1.32 / \$0.0141 —— DeepSeek official relay
* `deepseek-v4-pro`, `deepseek-v4-pro-0813`: \$1.32 / \$3.96 / \$0.044 —— DeepSeek official relay
* `deepseek-v4-flash-ga-260731`: \$0.44 / \$1.32 / \$0.0136 —— BytePlus relay
* `deepseek-v4-flash-260425`: \$0.14 / \$0.28 / \$0.028 —— BytePlus relay, April snapshot
* `deepseek-v4-pro-260425`: \$1.74 / \$3.48 / \$0.15 —— BytePlus relay, April snapshot

The trade-off on the two 260425 snapshots is caching. `deepseek-v4-flash-260425` costs roughly a third of the current release on prompt tokens and a fifth on completion tokens, a clear win for batch work with mostly fresh context and little prefix reuse. But its cache read at \$0.028 is about twice the \$0.0141 of the current release, so long conversations and long system prompts — anything with a high cache-hit rate — end up more expensive. Same shape for `deepseek-v4-pro-260425`: cheaper completions, pricier prompts and cache reads.

Recharge bonuses stack on all of the versions above. For the rate change itself and the peak-window conversion, see the [deep dive](/en/news/deepseek-price-increase-2026-08).

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive) · 🔗 [Promotions](/en/faq/recharge-promotions)
