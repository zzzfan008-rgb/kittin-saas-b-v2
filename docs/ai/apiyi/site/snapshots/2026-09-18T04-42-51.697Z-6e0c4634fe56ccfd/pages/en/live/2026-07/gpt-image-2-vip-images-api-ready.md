> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-vip Capacity Restored · Images API Endpoint Remains Recommended

> gpt-image-2-vip and gpt-image-2-all are recommended to use /v1/images/generations and /v1/images/edits — fully compatible with official-relay gpt-image-2, switch by changing the model name. Images API channel capacity has improved and success rate is up; the chat endpoint remains resource-constrained.

**2026/7/8 15:51 (UTC+8)** · Service Notice · OpenAI

🚀 **`gpt-image-2-vip` capacity restored · Images API remains the recommended format**

Following up on the [7/6 service notice](/en/live/2026-07/gpt-image-2-images-api-recommended): upstream capacity for `/v1/images/generations` (text-to-image) and `/v1/images/edits` (image editing) has improved, and `gpt-image-2-vip`'s call success rate has risen accordingly. Same code and `size` parameters as official-relay `gpt-image-2` — switch by changing the `model` name.

The chat endpoint (`/v1/chat/completions`) remains resource-constrained and isn't recommended for image generation.

Thanks for your patience — we continue tracking upstream capacity.

***

← [Back to Live Updates](/en/live) · 📚 [Browse Archive](/en/live/archive)
