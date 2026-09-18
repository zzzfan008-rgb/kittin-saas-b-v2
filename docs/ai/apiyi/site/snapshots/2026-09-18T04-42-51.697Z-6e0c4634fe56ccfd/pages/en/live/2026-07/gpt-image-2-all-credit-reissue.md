> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-all: Weekend Credit Reissue for This Week's Timeouts

> This week's ChatGPT website image-generation outage affected gpt-image-2-all. Over the weekend we will scan image logs for calls exceeding 300 seconds and reissue credits in one batch. Official capacity has partially recovered but slow requests still occur; for hard stability requirements, the official-relay gpt-image-2 is available.

**2026/7/10 00:45 (UTC+8)** · Service Notice · OpenAI

⚠️ **`gpt-image-2-all`: this week's timed-out calls will get credits reissued over the weekend · speed has partially recovered but still fluctuates**

This week's ChatGPT website image-generation outage (see the official incident notice at `status.openai.com`) affected `gpt-image-2-all`. Over the weekend (expected from Saturday 2026/7/11, UTC+8) we will scan this week's image logs for calls that took over 300 seconds and reissue credits to customers in one batch. Official capacity has partially recovered — first-byte times are mostly 40-60 seconds in our tests — but slow requests over 220 seconds still occur from time to time.

Two notes to help you choose a channel by need:

* `gpt-image-2-all`: a reverse-engineered resource whose availability tracks the ChatGPT website — when the official site is healthy, so are we
* Official-relay `gpt-image-2`: goes through the official API with token-based billing and reliable stability; at 1K image sizes the price difference is not large

Feel free to compare both channels with our image testing tool at [imagen.apiyi.com](https://imagen.apiyi.com). Thanks for your patience — we keep the service maintained.

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)
