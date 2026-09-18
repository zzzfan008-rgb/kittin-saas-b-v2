> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# VEO 3.1 Reverse Channel Paused · Google Upstream 500 INTERNAL

> VEO 3.1 video generation reverse channel hit Google upstream system failures tonight with persistent 500 Internal errors. After hours of empty retries, the channel has been paused. Watching for recovery tomorrow.

**2026/5/13 00:58 (UTC+8)** · Model Status · Google

⚠️ **VEO 3.1 reverse video-generation channel paused · Google upstream 500 INTERNAL** — Tonight (UTC+8) Google's official side experienced a system issue. The VEO 3.1 reverse API persistently returns **500 Internal error**. Raw upstream error:

```json theme={null}
{
  "error": {
    "code": 500,
    "message": "Internal error encountered.",
    "status": "INTERNAL"
  }
}
```

🛑 **Current action**: The channel has been "running empty" (every call failing) for several hours. To avoid wasting client-side retries and timeouts, **we've paused this reverse channel for now**. **We'll keep watching Google upstream recovery through 5/13**; once recovered, we'll restore the channel immediately and post a follow-up update. Stay tuned.

💡 **For context**: This is a Google-side upstream infrastructure failure (`INTERNAL`), distinct from VEO / Sora 2's occasional `PUBLIC_*` content-moderation rejections — those are upstream policy and safely retryable; this one is upstream unavailability and retries won't help.

***

← [Back to Live](/en/live) · 📚 [Monthly Archive](/en/live/archive)
