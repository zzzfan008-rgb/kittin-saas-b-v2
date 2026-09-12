> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2 status: Default group saturated · Enterprise group still serving

> gpt-image-2 default group is currently saturated; please switch your token group directly to image2Enterprise. Latest call logs show the enterprise group producing images normally with first-byte 35–293s; some default-group requests are being auto-routed to the enterprise group via fallback.

**2026/5/13 14:32 (UTC+8)** · Model Status · OpenAI

⚠️ **`gpt-image-2` current status: default group saturated, please continue using `image2Enterprise`** — Heads-up: `gpt-image-2` on the default group remains saturated (queueing / timeouts on the high side). The enterprise group `image2Enterprise` **is producing images normally**. Call logs from this afternoon (5/13 14:29–14:31 UTC+8) show the enterprise group with first-byte latency clustered in the **35–293 second** range; non-streaming calls returning normally, prompt / completion token counts healthy. Some default-group requests are being auto-routed to the enterprise group via **"Fallback hit: Default → image2Enterprise"**.

<Frame>
  <img src="https://mintcdn.com/apiyillc/dzF0LRNrHbNWs5rJ/images/gpt-image-2-enterprise-call-log-20260513.png?fit=max&auto=format&n=dzF0LRNrHbNWs5rJ&q=85&s=b85d44cdcf196bc8c870908efcd1e97e" alt="gpt-image-2 call log 5/13 14:29–14:31: 9 non-streaming calls all routed to image2Enterprise, first-byte 35-293s, 1.2x multiplier, last row shows 'Fallback hit Default → image2Enterprise'" width="1648" height="1212" data-path="images/gpt-image-2-enterprise-call-log-20260513.png" />
</Frame>

💡 **Recommendation**: Set your token's model group directly to **`image2Enterprise`** — skip the fallback round-trip (and the default-group queue/failure time). The enterprise group offers high concurrency and stable image generation at a **1.2x multiplier** (we don't profit on it — it's there to keep capacity flowing).

📖 How to adjust the token group (with screenshots): [/en/live/2026-04/image2-enterprise](/en/live/2026-04/image2-enterprise)

***

← [Back to Live](/en/live) · 📚 [Monthly Archive](/en/live/archive)
