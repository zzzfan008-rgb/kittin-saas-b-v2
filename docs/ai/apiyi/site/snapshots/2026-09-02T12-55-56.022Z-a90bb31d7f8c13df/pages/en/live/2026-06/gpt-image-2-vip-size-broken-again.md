> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-vip size broken again · 1K only for now

> Due to another official rule change, the previously restored size on gpt-image-2-vip has broken again — the passed size is silently ignored, so only 1K works while 2K/4K aren't recognized. For 4K/2K or precise size control, only the official-relay gpt-image-2 works for now, billed by input/output tokens rather than per call.

**2026/6/23 11:03 (UTC+8)** · Model Status · OpenAI

⚠️ **`gpt-image-2-vip` size broken again · 1K only for now**

This morning, confirmed via customer reports plus our own testing and code-level research: after another official rule change (it was already adjusted once), the previously restored `size` on `gpt-image-2-vip` has broken again — 1K is fine, but the passed `size` value is no longer recognized and gets silently ignored, so only 1K output works for now. We'll keep tracking and investigating.

Current status per channel (pick whichever fits):

* `gpt-image-2-vip`: 1K generates normally; the passed `size` is currently silently ignored, and 2K / 4K aren't recognized
* Official-relay `gpt-image-2`: supports 4K / 2K and precise `size` control, running stably on APIYI's relay; billed by input / output tokens rather than per call

Thanks for your patience — we keep operating and tracking the upstream changes.

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)
