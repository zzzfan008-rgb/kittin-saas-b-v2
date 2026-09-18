> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.0 mini Is Live: About Half the Standard Price, SD2 Now Runs Three Models

> ByteDance's Seedance 2.0 lite model doubao-seedance-2-0-mini-260615 is live on APIYI: about half the standard model's unit price and faster generation, capped at 720p; text-to-video, first/last frame, and multi-modal reference all work as in the rest of the family, fully verified end to end with billing exactly matching the platform's nominal pricing.

**2026/7/12 15:20 (UTC+8)** · New Model · ByteDance

🚀 **Seedance 2.0 mini is live: SD2 now runs three models in parallel**

ByteDance's Seedance 2.0 lite model `doubao-seedance-2-0-mini-260615` is now available on APIYI, joining the standard and fast models in a **three-model lineup**. Mini is the cost-efficiency variant released in June 2026: **about half the standard model's unit price** (720p/5s nominal on-platform ≈ ¥3.16 vs the official reference of ¥2.50; with the top-up bonus the effective cost is about on par with the official channel), and generation is faster too (measured \~1.5-2.5 min for a 5 s 720p clip — quicker than both fast and standard).

Capabilities match the rest of the family: text-to-video, first+last/first frame, multi-modal reference-to-video, `-1` smart duration, synchronized audio by default, and same-price aspect ratios per tier. Note that **mini caps at 720p** (same as fast — 1080p remains standard-only). It runs on the same dedicated `SeeDance2` group, so existing tokens work as-is: just switch the model name.

We have verified the full pipeline on-platform: all 7 functional test cases succeeded, the measured unit price matches the platform's nominal pricing **exactly (0.00% deviation)**, and rejected requests are not billed.

📖 Docs: [Seedance 2.0 Overview](/en/api-capabilities/seedance2/overview) (three-model price comparison) · [Video Generation API Reference](/en/api-capabilities/seedance2/video-generation)

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)
