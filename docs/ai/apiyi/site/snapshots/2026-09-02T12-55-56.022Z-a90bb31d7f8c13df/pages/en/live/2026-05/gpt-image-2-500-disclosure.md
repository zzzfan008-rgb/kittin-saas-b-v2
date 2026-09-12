> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-all / vip Now Surfaces Safety 500 Directly · Internal Retry Removed

> What appeared occasionally as 429 on gpt-image-2-all and gpt-image-2-vip was actually OpenAI's safety-system 500 rejection. The reverse channel's internal one-shot retry has been removed; 500s now surface as-is. Includes reverse vs official-relay clarification.

**2026/5/13 11:00 (UTC+8)** · Service Notice · OpenAI

⚠️ **`gpt-image-2-all` / `gpt-image-2-vip` now surface safety 500 errors directly (internal retry removed)** — The 429s some customers occasionally saw were **actually OpenAI's upstream safety-system 500 rejections**:

```text theme={null}
Your request was rejected by the safety system. If you believe this is an error,
contact us at help.openai.com
```

🔧 **What changed**: The reverse channel previously had a fallback that **retried once internally** (failed retries sometimes manifested as a 429 at the tail). **That retry has been removed.** Safety-system 500s now **surface as-is** to the caller, so you can detect these rejections in your own business logic and appeal upstream as recommended (`help.openai.com`).

💡 **Reverse vs official-relay**: `gpt-image-2-all` / `gpt-image-2-vip` are **reverse-channel** routes that perform some ops work (the prior internal retry, fallback routing, etc.). The **official-relay channel** (`gpt-image-2`, direct to OpenAI's official API) is a **pure transparent proxy** — it forwards upstream responses verbatim, with no post-processing.

📖 Official-relay vs reverse explained: [/en/api-capabilities/gpt-image-2/vs-gpt-image-2-all](/en/api-capabilities/gpt-image-2/vs-gpt-image-2-all)

***

← [Back to Live](/en/live) · 📚 [Monthly Archive](/en/live/archive)
