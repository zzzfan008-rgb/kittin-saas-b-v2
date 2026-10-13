> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Video Understanding Docs Updated: Seed, Qwen and Kimi Can Watch Video Too

> We tested video understanding on 19 models: the Seed family, four Qwen models and Kimi K3 work, while GPT, Grok, Claude, GLM and DeepSeek do not. The docs now cover the universal video_url format, per-provider input limits and two ways answers can be untrustworthy.

**2026/10/11 12:01 (UTC+8)** · Docs Update · Google / ByteDance / Alibaba / Moonshot / OpenAI / xAI

📊 **The [Video Understanding docs](/en/api-capabilities/video-understanding) have been rewritten from tests on 19 models — no longer Gemini-only**

We checked each model with the same 10-second test clip. Results:

* Works: the whole Seed family (`seed-2-0-pro-260328`, `dola-seed-2-1-turbo-260628`, etc.), `qwen3.8-max` / `qwen3.8-flash` / `qwen3-vl-plus` / `qwen3.5-omni-plus`, `kimi-k3`, and the Gemini models
* Not supported: GPT, Grok, Claude, GLM and DeepSeek; GPT and GLM silently drop the video and still return 200

The universal format is `video_url`; the older `image_url` + `data:video/mp4` form only works on Gemini. The page also adds a frame-extraction fallback and how to tell when an answer cannot be trusted.

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.