> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Oxygen Video Generation Is Live

> APIYI and AZ8 launch AZ8's in-house all-round video model oxygen-1.0: an OpenAI Videos-compatible API covering text, first-frame, first-and-last-frame, and reference image/video/audio video, 320p–768p, 4–15 s, priced at 0.02 US dollars per second at any resolution, built for low-cost volume.

**2026/10/2 17:01 (UTC+8)** · New Model · AZ8

🚀 **`oxygen-1.0` video generation is live, priced at \$0.02 per second at any resolution**

APIYI has partnered with AZ8, a Singapore-based AI video platform, to launch Oxygen, AZ8's in-house all-round video model. The API is OpenAI Videos-compatible (`POST /v1/videos` to submit, `GET /v1/videos/{id}` to poll). One model covers text-to-video, first-frame, first-and-last-frame, and reference generation with up to 9 images, 3 videos, and 3 audio clips, and every clip comes with sound.

* Specs: 320p / 480p / 768p, 4–15 seconds, billed by `seconds`; a 5-second clip costs \$0.10 and a 15-second clip \$0.30
* Groups: `default` or `svip`; failed tasks are refunded in full automatically
* Note: always pass `size` explicitly (portrait is the default otherwise); advanced options such as first-and-last frames and reference media go inside the JSON envelope in `input_reference`, and are silently dropped if placed at the top level

It is built for low-cost, high-volume video generation. See the [launch article](/en/news/oxygen-1-0-launch) and the [integration docs](/en/api-capabilities/oxygen/overview).

***

← [Back to Live](/en/live) · 📚 [Monthly archive](/en/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.