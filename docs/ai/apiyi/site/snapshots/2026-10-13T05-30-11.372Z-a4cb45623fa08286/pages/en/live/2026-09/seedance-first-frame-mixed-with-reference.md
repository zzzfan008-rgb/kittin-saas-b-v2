> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance says first/last frame cannot be mixed with reference media? New FAQ explains why

> New FAQ: the error first/last frame content cannot be mixed with reference media content means an image without a role was treated as a first frame alongside a reference video. It mostly comes from third-party tools using the generic video endpoint. Submit Seedance through the native endpoint, set role on every item, and pass reference videos as public URLs or asset IDs.

**2026/9/19 21:32 (UTC+8)** · Docs Update · ByteDance

📚 **Seedance says first/last frame cannot be mixed with reference media, though you never turned it on? The image has no `role`**

From a real ticket: the customer ticked "omni reference" in their tool, but the request went to the generic video endpoint `/v2/videos/generations`, which only has `images` / `videos` arrays and no `role`. A single image is a first frame by rule, so adding a reference video got a 400 at submission. In the same request, the video was a path on the customer's own machine that the provider could never reach.

The new FAQ explains why Seedance should always go through the native endpoint `/seedance/api/v3/contents/generations/tasks`, how to set `role` on each item, and how to pass reference videos (public URL or `asset://` asset ID). See [First Frame Mixed with Reference](/en/faq/seedance-first-frame-mixed-with-reference).

***

← [Back to Live](/en/live) · 📚 [Monthly archive](/en/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.