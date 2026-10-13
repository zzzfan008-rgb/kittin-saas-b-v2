> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# The two gpt-image-2.5 -vip models are more stable than gpt-image-2-vip

> gpt-image-2.5-sunburst-vip and gpt-image-2.5-flare-vip are currently more stable than gpt-image-2-vip. All three share the $0.03/image price, groups and endpoints, and the call format is compatible — just change model to a 2.5 name. Note that 2.5 quality tiers don't map one-to-one to 2-vip.

**2026/10/10 16:13 (UTC+8)** · Model Status · OpenAI

✅ **`gpt-image-2.5-sunburst-vip` and `gpt-image-2.5-flare-vip` are currently more stable than `gpt-image-2-vip`**

The three -vip models share the same price (\$0.03/image), groups (`Default` / `image2_OSS` / `svip`) and endpoints. The 2.5 models accept the `gpt-image-2-vip` call format, so you only need to change `model` to a 2.5 name; keep passing `size` and other parameters as before.

* `gpt-image-2.5-sunburst-vip` (alias `gpt-image-2.5-vip`): optimized for image quality and editing precision
* `gpt-image-2.5-flare-vip`: optimized for speed
* `gpt-image-2-vip`: still maintained as usual

The one thing to watch is `quality`: 2.5's `high` corresponds to `gpt-image-2-vip`'s `medium`, and 2.5's `max` equals its `high`. See the [GPT-Image-2.5-VIP overview](/en/api-capabilities/gpt-image-2-vip/overview).

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.