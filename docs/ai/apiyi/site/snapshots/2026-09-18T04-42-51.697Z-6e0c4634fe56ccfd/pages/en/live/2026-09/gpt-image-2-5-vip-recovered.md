> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2.5-vip Series Back in Service; the 10 September 429 Notice Is Closed

> As of 12 September, gpt-image-2.5-sunburst-vip and gpt-image-2.5-flare-vip (including the gpt-image-2.5-vip alias) are back in service. Capacity is still being restored, so occasional light fluctuation is possible in some time windows and a simple retry clears sporadic failures; the official gpt-image-2.5-flare / sunburst and gpt-image-2.5-all routes have remained normal throughout. We are continuing to expand and optimize provider-side capacity.

**2026/9/12 10:01 (UTC+8)** · Model Status · OpenAI

✅ **`gpt-image-2.5-sunburst-vip` and `gpt-image-2.5-flare-vip` are back in service; the 10 September 429 notice is closed**

The `-vip` series (the `gpt-image-2.5-vip` alias points to `gpt-image-2.5-sunburst-vip`) runs on the Adobe Firefly reverse route, which had been returning sustained 429s due to provider-side capacity constraints. Capacity has now been replenished and service is restored, but recovery is still in progress: occasional light fluctuation is possible in some time windows, and we are continuing to expand and optimize provider-side capacity. If you hit a sporadic failure, simply retry.

Current status by route (choose as needed):

* Reverse `gpt-image-2.5-vip` / `gpt-image-2.5-flare-vip` / `gpt-image-2.5-sunburst-vip` (Adobe Firefly): back in service, occasional light fluctuation during recovery
* Official `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst`: normal; workloads with stricter stability requirements can keep using it as a fallback route
* Reverse `gpt-image-2.5-all` (ChatGPT web conversational image generation): normal

Welcome back to GPT Image 2.5 VIP 🚀 Thank you for your patience over the past few days; we are monitoring continuously.

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)
