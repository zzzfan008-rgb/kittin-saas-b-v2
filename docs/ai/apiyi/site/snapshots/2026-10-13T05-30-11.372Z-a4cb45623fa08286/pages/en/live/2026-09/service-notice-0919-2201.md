> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Live joint troubleshooting: reproduce once, we inspect the request in real time

> The APIYI operations team now offers live joint troubleshooting: you make one call at an agreed time, and we temporarily record and inspect that request and our response on the server side to pin down the problem on the spot. We only look at the requests you reproduce, keys and credentials are masked automatically, and the temporary records are deleted as soon as we are done.

**2026/9/19 22:01 (UTC+8)** · Service Notice

🛠️ **Live joint troubleshooting: reproduce the problem once, and we inspect that request in real time to sort it out on the spot**

Some problems are hard to pin down from an error message alone: the provider rejects the request at submission and nothing is left in our logs, or the call succeeds but the result is unusable. You can now book a time and make one call live while we watch, on the server side, what your request actually contained and what the platform returned. That tells us right away whether the cause is a parameter, a media URL, the network, or the platform. We solved two tickets this way today: a video task rejected for conflicting inputs (see [First Frame Mixed with Reference](/en/faq/seedance-first-frame-mixed-with-reference)) and an image URL that failed to download.

We take your data security just as seriously:

* Enabled only temporarily for the agreed time window, and we only pull the requests you reproduce
* Keys and other credentials are masked automatically, never viewed or stored
* The temporary records are deleted as soon as troubleshooting ends, never kept or shared

Just contact support with a short description of the problem and a time that suits you.

***

← [Back to Live](/en/live) · 📚 [Monthly archive](/en/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.