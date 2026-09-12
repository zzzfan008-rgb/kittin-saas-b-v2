> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.5 Is Live: 30-Second Clips, 30 Reference Images

> ByteDance Seedance 2.5 is live on APIYI as doubao-seedance-2-5-260628. The duration cap rises to 30 seconds and reference images to 30, with new mov output and explicit video edit/extend task types. Its group and pricing changed on 2026-08-30 — see the later entry.

**2026/8/28 11:21 (UTC+8)** · New Model · ByteDance

<Warning>
  **The prices in this entry are out of date**: 2.5's rates were adjusted after launch — for the current details see [Seedance 2.5 and the 2.0 family share one group](/en/live/2026-08/seedance-2-5-group-merge). The capability notes below still apply.
</Warning>

🚀 **Seedance 2.5 is live — `doubao-seedance-2-5-260628`**

Endpoint, auth, and request shape are identical to 2.0, so **changing the `model` field is the whole migration**; the integration work described in the August 19 timeline post is complete. Against the 2.0 family: the duration cap goes from 15 to **30 seconds**, reference images from 9 to **30**, reference videos and audio from 3 to 10, audio can stand alone as a reference, and it adds `mov` output plus `omni_reference_task_type` (which moves video edit/extend validation to submission time). Resolutions are 480p / 720p / 1080p, with no 4k; 1080p is encoded as H.265, the other tiers as H.264.

The rates this entry launched with no longer apply — see [Seedance 2.5 and the 2.0 family share one group](/en/live/2026-08/seedance-2-5-group-merge) for current pricing.

Two easy mistakes: `duration` defaults to `-1` (the 2.0 family defaults to `5`), so omitting it lets the model pick — in testing it picked 10 seconds, doubling the cost; and first-frame / first+last-frame, video editing, and video extension all require `ratio` to be `adaptive`, with a concrete aspect ratio returning 400 at submission.

These findings come from 19 measured test cases on 2026-08-28. Full capabilities and pricing: [Seedance Overview](/en/api-capabilities/seedance2/overview).

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)
