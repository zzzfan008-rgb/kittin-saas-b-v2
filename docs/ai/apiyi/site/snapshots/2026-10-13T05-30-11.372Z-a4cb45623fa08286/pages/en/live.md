> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Live Updates

> Real-time model status, industry news, and service updates from APIYI

<Update label="2026/10/13 00:17" description="Price Update" tags={["Google", "Price Update"]}>
  💸 **Nano Banana 2.1 (`gemini-nano-banana-2.1`) per-request price cut of 10%: \$0.05 → \$0.045** — 1K / 2K / 4K stay at one price, and for 4K, per-request is now nearly 30% cheaper than token-based; token-based pricing is unchanged (\$0.66 input / \$13.2 output per 1M tokens), and top-up bonuses lower the cost further.

  📖 [View details](/en/live/2026-10/gemini-nano-banana-2-1-price-cut)
</Update>

<Update label="2026/10/12 20:20" description="Service Notice" tags={["Service Notice"]}>
  🚀 **Personal access tokens are live; legacy system tokens are scheduled to retire on 2026-11-11 (UTC+8)** —— balance, log and token management APIs now use personal access tokens, which support per-scope permissions, expiry dates and IP allowlists. We may extend the date based on usage, but recommend switching now: just replace the header value.

  📖 [View details](/en/live/2026-10/personal-access-token-launch)
</Update>

<Update label="2026/10/11 17:59" description="Docs Update" tags={["Google", "OpenAI", "Anthropic", "ByteDance", "Alibaba", "Moonshot", "Docs Update"]}>
  📊 **Vision understanding docs fully rewritten from tests on 24 models** —— all 22 vision models work with the `image_url` format, and the page now maps which models the Responses / Anthropic / Gemini native formats support; it adds downscaling guidance (one 9000×6000 image was billed 63,658 tokens on `gpt-6-sol`) and an AI agent integration prompt.

  📖 [View details](/en/live/2026-10/vision-understanding-multi-model)
</Update>

<Update label="2026/10/11 12:01" description="Docs Update" tags={["Google", "ByteDance", "Alibaba", "Moonshot", "OpenAI", "xAI", "Docs Update"]}>
  📊 **Video Understanding docs rewritten from tests on 19 models — no longer Gemini-only** —— the Seed family, four Qwen models including `qwen3.8-max`, and `kimi-k3` can watch video; GPT, Grok, Claude, GLM and DeepSeek cannot, and GPT and GLM silently drop the video; the universal format is `video_url`.

  📖 [View details](/en/live/2026-10/video-understanding-multi-model)
</Update>

<Update label="2026/10/11 11:59" description="New Model" tags={["Alibaba", "New Model"]}>
  🚀 **The iCover AI video testing tool now supports Wan3.0, with multimodal reference uploads** — reference images (up to 9), video, audio, `pdf` / `docx` documents and web links can all be used as inputs, by URL or local upload, so you can test online in [iCover AI](https://icover.ai/zh/wan-official) without writing code.

  📖 [View details](/en/live/2026-10/icover-wan3-0)
</Update>

<Update label="2026/10/11 00:46" description="Service Notice" tags={["Alibaba", "DeepSeek", "Zhipu", "Service Notice"]}>
  ⏸ **Alibaba Cloud Bailian has retired a batch of models; APIYI removes 36 in sync** — the Qwen series is a direct pass-through of the official Alibaba Cloud API and follows its lifecycle. Affected models include early Qwen3 / Qwen-VL versions such as `qwen3-max`, `qwen3-coder-plus` and `qwen-vl-max`, plus Bailian-hosted `deepseek-v3.2`, `glm-4.7` and others; see details for the full list. Please switch to a model that is still listed.

  📖 [View details](/en/live/2026-10/bailian-models-offline)
</Update>

<Update label="2026/10/10 22:23" description="New Model" tags={["Alibaba", "New Model"]}>
  🚀 **Wan3.0 video generation is live: `wan3.0-video` (Standard) and `wan3.0-video-prime` (Prime)** — one model ID covers text-to-video, image-to-video, reference-to-video and video editing, up to 30 seconds, 480P–1080P, audio by default; 98% of official price, \$0.0588/sec for Standard at 720P. Use the `Wan&HappyHorse` token group.

  📖 [View details](/en/live/2026-10/wan3-0-video-launch)
</Update>

<Update label="2026/10/10 16:13" description="Model Status" tags={["OpenAI", "Model Status"]}>
  ✅ **`gpt-image-2.5-sunburst-vip` and `gpt-image-2.5-flare-vip` are currently more stable than `gpt-image-2-vip`** — all three share the \$0.03/image price, groups and endpoints, and 2.5 accepts the 2-vip call format, so just change `model` to a 2.5 name. `quality` tiers differ: 2.5's `max` equals 2-vip's `high`.

  📖 [View details](/en/live/2026-10/gpt-image-2-5-vip-more-stable)
</Update>

<Update label="2026/10/10 14:05" description="Price Update" tags={["OpenAI", "Price Update"]}>
  💸 **`gpt-image-2-all` and `gpt-image-2.5-all` price cut: \$0.03 → \$0.025 per image** — the -all series delivers high quality and is more stable than -vip; its only trade-off is 1K–1.5K output. The -vip trio keeps its price and is still maintained. \$0.025 is pre-discount, and top-up bonuses (10%–20%) lower it further.

  📖 [View details](/en/live/2026-10/gpt-image-2-all-price-cut)
</Update>

<Update label="2026/10/9 10:47" description="Model Status" tags={["OpenAI", "Model Status"]}>
  ⚠️ **`gpt-image-2-vip` and the `gpt-image-2.5` -vip series have been adding capacity since yesterday and remain unstable** — these reverse-engineered routes are limited by account-pool concurrency and demand surged after the holiday, so we keep adding accounts; official `gpt-image-2` and `gpt-image-2.5` have ample concurrency, and we still suggest the official route as a production fallback.

  📖 [View details](/en/live/2026-10/gpt-image-vip-pool-scaling)
</Update>

***

> 📖 For earlier updates, visit the [Live Updates Archive](/en/live/archive) — browse history by month, category, or vendor.

<CardGroup cols={3}>
  <Card title="Deep Dive" icon="newspaper" href="/en/news/gemini-3-1-flash-lite-launch" horizontal>
    AI Radar
  </Card>

  <Card title="Telegram" icon="telegram" iconType="brands" href="https://t.me/apiyinews" horizontal>
    Global users
  </Card>

  <Card title="Media Models" icon="images" href="/en/api-capabilities/image-video-models" horizontal>
    New additions
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.