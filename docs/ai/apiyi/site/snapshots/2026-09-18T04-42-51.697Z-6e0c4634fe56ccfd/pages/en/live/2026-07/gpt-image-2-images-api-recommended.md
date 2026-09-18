> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-vip / -all: Use the Images API Endpoints

> The reverse models gpt-image-2-vip and gpt-image-2-all now recommend the OpenAI Images API endpoints /v1/images/generations and /v1/images/edits: aligned with the official calling standard and backed by more stable supply. The chat endpoint still works but is no longer recommended; docs updated.

**2026/7/6 18:46 (UTC+8)** · Service Notice · OpenAI

📣 **`gpt-image-2-vip` / `gpt-image-2-all`: use the two OpenAI Images API endpoints for image generation**

For **alignment with the official calling standard** and **more stable supply**, the two reverse models now recommend `/v1/images/generations` (text-to-image) and `/v1/images/edits` (image editing): same code and fully compatible `size` parameters as the official-relay `gpt-image-2` — switching is just a `model` name change — and upstream resource supply for the Images API channel is more plentiful, so success rates are higher.

The chat endpoint (`/v1/chat/completions`) still works but is **no longer recommended** for image generation; it remains only for multi-turn iterative editing or passing online image URLs directly. The docs have been updated accordingly — see the [GPT-Image-2-All overview](/en/api-capabilities/gpt-image-2-all/overview) and [GPT-Image-2-VIP overview](/en/api-capabilities/gpt-image-2-vip/overview).

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)
