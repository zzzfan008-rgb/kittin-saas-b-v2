> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Both gpt-image-2.5 -vip Reverse Models Still Short on Supply, Official and -all Routes Normal, gpt-image-2-vip Stable

> Status sync for September 15: the gpt-image-2.5-flare-vip and gpt-image-2.5-sunburst-vip reverse routes are still short on supply and unavailable for now. For GPT Image 2.5 use the official gpt-image-2.5-flare / sunburst models (without -vip), which bill by token usage rather than per image; follow the docs to integrate. If you do not need strict size control or 2K/4K, the ChatGPT-web reverse gpt-image-2.5-all is also running normally. The previous-generation gpt-image-2-vip remains in service and stable.

**2026/9/15 17:09 (UTC+8)** · Model Status · OpenAI

⚠️ **The `gpt-image-2.5-flare-vip` / `gpt-image-2.5-sunburst-vip` reverse routes are still short on supply and unavailable for now; `gpt-image-2-vip` remains in service and stable**

The `gpt-image-2.5` `-vip` series (Adobe Firefly reverse route, alias `gpt-image-2.5-vip`) ran into provider-side resource shortages again after the 9/12 recovery and is currently without supply; we will update here once it is restored. If you need GPT Image 2.5 today, use the official `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst` models (the names without `-vip`). Note that the official route **bills by token usage**, not per image like `-vip`; follow the [GPT-Image-2.5 / 2 overview](/en/api-capabilities/gpt-image-2/overview) for parameters and integration.

Current status of each route (pick what fits):

* Official `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst`: normal, usage-based billing, supports `size` locking and 2K / 4K output
* Reverse `gpt-image-2.5-all` (ChatGPT web image generation, already Images 2.5): normal, per-image billing, no `size` parameter so it cannot lock a size or output 2K / 4K; fine when you do not need strict size control
* Reverse `gpt-image-2-vip` (previous-generation GPT Image 2, Adobe Firefly): in service and stable, per-image billing, supports `size`; see the [GPT-Image-2-VIP overview](/en/api-capabilities/gpt-image-2-vip/overview)
* Reverse `gpt-image-2.5-flare-vip` / `gpt-image-2.5-sunburst-vip`: short on supply, unavailable for now

Thank you for your patience; we keep operating and monitoring.

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)
