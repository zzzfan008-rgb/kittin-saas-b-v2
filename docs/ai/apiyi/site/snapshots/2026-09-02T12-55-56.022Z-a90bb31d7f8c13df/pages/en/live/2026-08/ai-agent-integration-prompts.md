> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 13 Image and Video Models Get AI Agent Integration Prompts

> The overview pages for 9 image models and 4 video models now carry a one-click copyable prompt right below the intro. Paste it into Codex, Claude Code or Cursor and the agent fetches the page as plain text, then writes code in your own stack — timeouts, response handling, upload compression and per-model red lines all baked in. Live in six languages.

**2026/8/23 22:40 (UTC+8)** · Docs Update

🚀 **13 image and video model pages now carry an AI Agent integration prompt — copy one block and let your coding agent do the integration or the triage**

Each model's overview page now has a one-click copyable prompt just below the intro. Paste it into Codex, Claude Code, Cursor or any coding agent, and it first fetches the plain-text version of that page (append `.md` to any docs URL), then writes code in your project's own stack rather than copying the doc samples verbatim.

The prompt hard-codes the integration red lines people trip over most:

* **Timeout values**: image and video latencies differ widely, and a default 30-60 second client timeout cuts off perfectly healthy requests — which are still billed
* **How to read the response**: image models mostly return base64, while `FLUX` returns a URL that dies in about 10 minutes; video is async polling plus a 24-hour signed link, and both need re-hosting immediately
* **Compress before upload**: one standard of 2048px long edge at quality 0.9, so raw phone photos never go straight up
* **Per-model red lines**: never send `auto` to `gpt-image-2`, never send `generateAudio` to VEO, never route Wan through `/v1/videos`

Coverage spans the three `gpt-image-2` variants, Nano Banana Pro / 2 / Lite, FLUX, Seedream and Grok Imagine on the image side, plus Seedance 2.0, Wan2.7, HappyHorse and VEO 3.1 Official on the video side. Use it to get a new integration running in one pass, or as a checkup when an existing one misbehaves.

Live in all six languages.

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)
