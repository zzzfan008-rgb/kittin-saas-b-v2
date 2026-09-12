> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.5 and the 2.0 family share the SeeDance2 group — one token covers all four models

> Seedance 2.5 and the three 2.0-family models all sit on the SeeDance2 group (0.18x), so a single token reaches every one of them with no separate token for 2.5. Measured rates come in two tiers: $12.60 per million tokens with no video in the input, and a lower $7.56 when the input contains video.

**2026/8/31 11:20 (UTC+8)** · Price Update · ByteDance

🗂️ **Seedance 2.5 and the 2.0 family share the `SeeDance2` group (0.18x) — one token covers all four models**

All four models sit under **one group**, which keeps things simpler to manage: **a single token with `SeeDance2` enabled reaches every one of them** (`doubao-seedance-2-5-260628` plus the 2.0 standard / `fast` / `mini`), with no separate token needed for 2.5, and **model name, endpoint, request shape and your code all stay unchanged**.

Measured rates (derived from actual billing logs, not from a rate calculation) come in two tiers:

* **No video in the input** (text-to-video, image-to-video, reference images): \$12.60 per million tokens, the same for 480p, 720p and 1080p
* **Video in the input** (multi-modal reference with `video_url`, video editing, video extension): \$7.56 per million tokens, a separate and lower tier

Typical clips: 480p/4s \$0.4893, 720p/5s \$1.3721, 1080p/5s \$3.0873, 720p/30s \$8.1761.

Full group notes and pricing tables are on the [Seedance overview](/en/api-capabilities/seedance2/overview).

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)
