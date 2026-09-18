> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.5 reference-to-video read as video editing? New FAQ explains the difference

> New FAQ: with a reference video, Seedance 2.5 uses prompt intent to choose reference-to-video, video editing, or video extension. Editing requires ratio adaptive and duration -1, or submission fails with a 400. No parameter locks the task to reference-to-video; the FAQ gives three reliable approaches.

**2026/9/17 19:47 (UTC+8)** · Docs Update · ByteDance

📚 **Seedance 2.5 returns a 400 when you set an aspect ratio and duration? The task was most likely classified as video editing**

A real ticket: the request carried one `reference_video`, the prompt asked to "upscale the video and keep all elements unchanged", and it also set `ratio: "4:3"` and `duration: 15`. Submission failed at once with a 400 `TaskTypeConstraint`. With a reference video, 2.5 reads the prompt's intent to classify the task as reference-to-video, video editing, or video extension. Editing locks the aspect ratio and duration to the source video, so `ratio` must be `adaptive` and `duration` must be `-1`. `omni_reference_task_type` accepts only `auto` / `edit` / `extend`; no value locks a task to reference-to-video.

The new FAQ covers the classification rules, prompt rewrites, and three reliable approaches (the general `adaptive` + `-1` setup, rewriting the prompt to keep a fixed ratio and duration, and a retry in code). See [Seedance 2.5: Reference-to-Video vs. Video Editing](/en/faq/seedance2-reference-vs-edit). The docs sidebar under "Seedance 2.0 / 2.5" now has an "SD FAQ" subsection that collects the Seedance FAQs.

***

← [Back to Live](/en/live) · 📚 [Monthly archive](/en/live/archive)
