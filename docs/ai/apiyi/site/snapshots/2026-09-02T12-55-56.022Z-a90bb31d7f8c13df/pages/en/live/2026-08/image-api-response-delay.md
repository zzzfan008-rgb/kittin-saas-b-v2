> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Occasional image API response-completion delay eased; running normally today

> Before the evening of 4 August, some image generation calls hit an occasional issue: the image data arrived in full but the connection's completion signal was late, stretching request latency for minutes at a time. It mainly affected calls receiving images as Base64; text endpoints were largely unaffected. Database optimisations are in place and service is normal today.

**2026/8/5 12:16 (UTC+8)** · Model Status

✅ **Occasional image API response-completion delay eased — running normally on 5 August**

Before the evening of 4 August, some image generation calls hit an occasional issue: the image data had already been delivered to the client in full, but the connection's "completion signal" was slow to arrive, so client code kept waiting and single-request latency stretched out for minutes at a time. **It mainly affected calls that receive images as Base64**; text endpoints were largely unaffected, and the image data itself was always complete and intact.

The root cause was the sheer volume of backend log data slowing down the post-response step of each request. We have applied targeted database optimisations and cleared and capped the backend analytics queries that were consuming the most resources. We also added official Gemini image API capacity today.

How to check on your side: compare **the request latency recorded in your APIYI console logs** with **the time it actually took you to receive the complete image data**. The two figures should normally be close. If the gap is large (for example, 20 seconds in the console but 2 minutes on your side), send us the corresponding request record.

Work on the logging layer is ongoing and we will keep monitoring. If you still see anything unusual, contact us anytime and we will follow up right away.

***

← [Back to Live Updates](/en/live) · 📚 [Archive by month](/en/live/archive)
