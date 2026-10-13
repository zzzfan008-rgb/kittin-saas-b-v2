> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# MiniMax-H3 Video Generation Is Live

> A self-hosted MiniMax H3 (Hailuo 3.0) channel is live: 768P, 4–15 s, native stereo, one endpoint for text, first/last-frame, and mixed image/video/audio references; priced at 0.03 US dollars per second, reference media free, in the default and svip groups.

**2026/9/29 16:32 (UTC+8)** · New Model · MiniMax

🚀 **`MiniMax-H3` video generation is live, priced at \$0.03 per second**

This channel runs MiniMax's open weights on our own deployment: 768P, 4–15 seconds, stereo sound included. One endpoint, `POST /hailuo/v2/video_generation`, covers text-to-video, first/last-frame video, and mixed references with up to 9 images, 3 videos, and 3 audio clips. Reference media are free, and failed tasks are refunded in full automatically.

* Groups: `default` or `svip`
* The official MiniMax API lists 768P at \$0.08 per second; this channel is priced independently
* Note: 2K is not supported yet, and the `Idempotency-Key` header has no effect, so handle idempotency in your application

See the [launch article](/en/news/minimax-h3-launch) and the [integration docs](/en/api-capabilities/minimax-h3/overview).

***

← [Back to Live](/en/live) · 📚 [Monthly archive](/en/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.