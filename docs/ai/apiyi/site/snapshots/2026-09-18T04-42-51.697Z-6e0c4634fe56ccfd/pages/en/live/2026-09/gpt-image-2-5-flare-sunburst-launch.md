> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2.5 Dual Models Live via Official Relay: flare Is Faster, sunburst Edits Better

> OpenAI's next-generation image models gpt-image-2.5-flare and gpt-image-2.5-sunburst are live on APIYI through the official relay, available in the Default group with the image2Enterprise group as the more stable option. Integration is identical to the official-relay gpt-image-2 and pricing is likewise token-based. flare generates faster; sunburst has stronger image-editing ability. On the reverse side, gpt-image-2.5-all from the ChatGPT web app is also out, priced the same as gpt-image-2-all.

**2026/9/9 10:53 (UTC+8)** · New Model · OpenAI

🚀 **`gpt-image-2.5-flare` and `gpt-image-2.5-sunburst` are live via the official relay, callable directly in the `Default` group**

Both are OpenAI's next-generation GPT image models, currently pointing to `gpt-image-2.5-flare-2026-09-08` and `gpt-image-2.5-sunburst-2026-09-08`. Integration is identical to the official-relay `gpt-image-2`: same images API, just swap the `model` name. For parameter details see the official docs at `developers.openai.com/api/docs/guides/image-generation`, or our [gpt-image-2 official-relay guide](/en/api-capabilities/gpt-image-2/overview).

Pricing is the same as `gpt-image-2`, billed per token. Pick whichever fits, or expose both and let your users choose:

* `gpt-image-2.5-flare`: faster generation, suited to latency-sensitive batch jobs
* `gpt-image-2.5-sunburst`: stronger image editing, suited to retouching and multi-image fusion

For groups, the `Default` group is available; production workloads that need higher stability can use the `image2Enterprise` group (1.2x), which has steadier supply. Model names and endpoints are unchanged across both groups.

On the reverse-engineered side: `gpt-image-2-all` is now sourced from the ChatGPT web app, and we are adding the matching `gpt-image-2.5-all`, also reverse-engineered from the ChatGPT web app. Its price is unchanged from `gpt-image-2-all` (\$0.03 per image, per-call billing), and it is callable in the `Default` group.

📖 Full specs, code samples and model selection: [GPT-image-2.5 Launches: Flare Is Faster, Sunburst Is Sharper](/en/news/gpt-image-2-5-launch)

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)
