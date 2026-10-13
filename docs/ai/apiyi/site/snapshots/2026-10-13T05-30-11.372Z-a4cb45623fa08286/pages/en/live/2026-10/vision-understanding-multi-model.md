> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Vision Understanding Docs Update: 24 Models Tested, Four Formats Mapped

> The vision understanding page was rewritten from tests on 24 models: adds Gemini 3.8 Flash, GPT-6, Claude 5.5, Seed, Qwen3.8, Kimi K3 and more, maps which models each of the four request formats supports, and adds guidance on downscaling large images, image URLs and an AI agent integration prompt.

**2026/10/11 17:59 (UTC+8)** · Docs Update · Google / OpenAI / Anthropic / ByteDance / Alibaba / Moonshot

📊 **The [vision understanding docs](/en/api-capabilities/vision-understanding) have been fully rewritten from tests on 24 models**

We checked OCR, counting, multi-image comparison and public image URLs on every model with the same mixed Chinese/English order image. Key findings:

* All 22 vision models work with the OpenAI-compatible `image_url` format; `gemini-3.8-flash`, `claude-sonnet-5-5` and `gpt-6-sol` passed every test
* The Responses and Anthropic formats only reach some models, and Grok silently drops images on the Anthropic endpoint
* Downscale large images first: one 9000×6000 image was billed 63,658 tokens on `gpt-6-sol`, and Claude rejects images over 10 MB; after resizing the long side to 2048 px every model passed

The page also adds an AI agent integration prompt and removes the outdated note that GPT only supports `temperature=1`.

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.