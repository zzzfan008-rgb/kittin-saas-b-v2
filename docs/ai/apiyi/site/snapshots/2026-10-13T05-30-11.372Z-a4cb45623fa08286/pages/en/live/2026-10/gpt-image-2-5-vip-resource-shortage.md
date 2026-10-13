> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Both gpt-image-2.5 -vip Models Unstable Lately, Other Image Models Available

> gpt-image-2.5-sunburst-vip and gpt-image-2.5-flare-vip run on the official-reverse route and depend on provider-side risk controls and account capacity, so they occasionally run short and fail. We keep maintaining capacity; add client-side retries or rotate across models, or choose gpt-image-2-vip, the official gpt-image-2.5-sunburst, or gpt-image-2.5-all as needed.

**2026/10/4 00:15 (UTC+8)** · Model Status · OpenAI

⚠️ **`gpt-image-2.5-sunburst-vip` and `gpt-image-2.5-flare-vip` have been unstable lately due to occasional capacity shortages**

Both models run on the official-reverse route, and their supply depends on provider-side risk controls and account capacity, so capacity sometimes runs short for a while and requests fail. We are doing our best to keep capacity healthy; to keep your workflow from stalling, add client-side retries on failure or rotate across several models.

If you need other options, the following models are available — pick whichever fits:

* `gpt-image-2-vip`: also official-reverse, \$0.03 per image, currently more stable than the 2.5 series
* Official `gpt-image-2.5-sunburst`: stable, supports 2K / 4K; billed per token, so higher resolutions and higher `quality` levels cost more per image
* `gpt-image-2.5-all`: native image generation from ChatGPT web, high quality and fast, \$0.03 per image; outputs 1K only, no 2K / 4K

Note: APIYI passes image results through transparently and does no secondary upscaling — `gpt-image-2.5-all` returns the native 1K image.

For parameters and setup, see the [GPT-Image-2-VIP overview](/en/api-capabilities/gpt-image-2-vip/overview), the [GPT-Image 2.5 official overview](/en/api-capabilities/gpt-image-2/overview) and the [GPT-Image-2.5-All overview](/en/api-capabilities/gpt-image-2-all/overview). Thanks for your understanding — we keep operating around the clock.

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.