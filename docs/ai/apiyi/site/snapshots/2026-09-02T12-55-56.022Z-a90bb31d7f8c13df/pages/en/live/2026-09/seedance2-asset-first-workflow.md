> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance calls carrying media: ingest first, then reference the asset ID

> When a Seedance request carries images or video, create-task latency is dominated by uploading that media — inline Base64 stretches a one-second submission into tens of seconds or a client read timeout. Referencing an asset:// ID instead shrinks the body to a few dozen bytes and returns the task ID immediately. A new how-to page is now live.

**2026/9/2 11:54 (UTC+8)** · Docs Update · ByteDance

📊 **When a Seedance call carries media, it is submission that is slow, not generation — ingest first and reference an `asset://` asset ID**

Your media has to travel upstream to APIYI, then be forwarded to Volcengine and decoded and validated there; the task ID only comes back after all of that. With inline Base64 or a large image URL, the create-task call goes from about a second to tens of seconds — one customer raised their client read timeout to 300 seconds and still did not get a task ID. Generation itself normally takes 2–5 minutes, which is the provider's normal speed and unrelated to submission.

Referencing an `asset://` asset ID drops the request body from megabytes to a few dozen bytes and returns the task ID immediately. Content checks on your media also move up to ingest time, so nothing fails halfway through a generation task, and asset IDs stay reusable — which also improves character consistency across shots. The asset library is free with the Seedance API, with no annual fee.

A new page covers the latency breakdown, a comparison of the three ways to pass media, the three migration steps, and how to tell whether a task was created after a timeout: [Asset-First: Faster, More Reliable Image and Video Inputs](/en/api-capabilities/seedance2/asset-first-workflow).

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)
