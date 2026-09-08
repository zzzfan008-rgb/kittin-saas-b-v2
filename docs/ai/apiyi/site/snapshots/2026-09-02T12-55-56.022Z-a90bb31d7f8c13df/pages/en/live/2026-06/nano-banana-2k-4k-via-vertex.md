> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana 2K/4K Working Again · Temporary Vertex Failover (root cause: AIStudio compute)

> Precise root cause: the blurry output was an AIStudio-side compute issue on Google, making official 2K and 4K blurry while 1K stayed fine. We've temporarily routed image generation through Vertex to tide things over; 2K/4K now generate normally, though Vertex is capped around 100 RPM total with limited concurrency (ramp up moderately), and we'll route back once Google recovers.

**2026/6/19 17:54 (UTC+8)** · Model Status · Google

✅ **Nano Banana 2K / 4K working again · temporary `Vertex` failover (root cause: AIStudio compute)**

Precise root cause: the blurry output is a compute issue on Google's `AIStudio` side, which made official 2K / 4K blurry while 1K stayed normal (see the [earlier outage note](/en/live/2026-06/nano-banana-4k-2k-blurry)). We've temporarily routed image generation through `Vertex` to tide things over — it's live and already in use, so in short, it works now.

Current status:

* 2K / 4K: generating normally again via the temporary `Vertex` route
* Concurrency: `Vertex` is currently capped around 100 RPM total with limited concurrency — ramp up moderately
* 1K: normal throughout

We'll keep watching for `AIStudio` to recover and route back to the regular channel, syncing an update the moment it changes.

***

← [Back to Live](/en/live) · 📚 [Monthly Archive](/en/live/archive)
