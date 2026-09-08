> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-vip is back to normal speed — you can push concurrency again

> As of 26 August gpt-image-2-vip has returned to its usual speed, with non-streaming time-to-first-byte measured mostly at 37–55 seconds, so yesterday's advice to hold concurrency down no longer applies. The provider has also restored 4K output and the quality parameter, billed at $0.03 per request.

**2026/8/26 13:15 (UTC+8)** · Model Status · OpenAI

✅ **`gpt-image-2-vip` is back to normal speed — you can push concurrency again**

Yesterday afternoon's saturation has cleared. In today's logs from 13:13–13:14 (UTC+8), **time-to-first-byte on non-streaming calls sits mostly at 37–55 seconds**, with a few at 66–71 seconds — back to everyday levels after yesterday's 82–190 seconds. The temporary advice to **hold concurrency down and retry 429s yourself no longer needs to be kept**; raise concurrency as your workload requires.

<Frame caption="gpt-image-2-vip call logs from 13:13–13:14 (UTC+8) on 26 August, time-to-first-byte clustered at 37–55 seconds">
  <img src="https://mintcdn.com/apiyillc/c28UKRpk95VIIz0F/images/gpt-image-2-vip-speed-log-20260826.png?fit=max&auto=format&n=c28UKRpk95VIIz0F&q=85&s=8327c77c8f02028d93210de26d3d0757" alt="Console log list showing several non-streaming gpt-image-2-vip calls with time-to-first-byte ranging from 37 to 71 seconds" width="882" height="1422" data-path="images/gpt-image-2-vip-speed-log-20260826.png" />
</Frame>

The provider has also confirmed that `gpt-image-2-vip` **supports 4K output and the `quality` parameter again**:

* Endpoints: `/v1/images/generations` for generation, `/v1/images/edits` for editing
* `size`: the common 1K / 2K / 4K sizes
* `quality`: `low` / `medium` / `high`
* Billing: **\$0.03 per request**, so call it with a **per-request billing token** in the `default` group

See the [gpt-image-2 overview](/en/api-capabilities/gpt-image-2/overview) for parameters and code samples. Thanks for your patience over the past two days — we are keeping an eye on this route's load.

***

← [Back to Live Updates](/en/live) · 📚 [Archive by month](/en/live/archive)
