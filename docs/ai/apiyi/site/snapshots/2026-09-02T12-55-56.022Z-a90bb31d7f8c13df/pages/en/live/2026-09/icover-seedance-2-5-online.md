> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# iCover AI video testing tool now offers SeeDance 2.5, no code required

> APIYI's visual video testing tool iCover AI has been updated: SeeDance 2.5 (doubao-seedance-2-5-260628) is now selectable in the model dropdown, and all four task types — text-to-video, first frame, first/last frame, multimodal — can be tried without code. For reference media, ingest into the asset library first and reference the asset:// ID for faster submissions.

**2026/9/2 20:37 (UTC+8)** · Service Notice · ByteDance

🚀 **iCover AI has been updated — SeeDance 2.5 is now selectable right in the model dropdown**

At [icover.ai/zh/seedance-official](https://icover.ai/zh/seedance-official), SeeDance 2.5 (`doubao-seedance-2-5-260628`) now sits alongside 2.0. All four task types — text-to-video, first frame, first/last frame, and multimodal — plus aspect ratio, resolution and duration are picked directly on the page, so you can run through the output quality and parameter combinations before deciding how to wire it into your own service. Set duration explicitly: SeeDance 2.5 supports 4–30 seconds, and the `smart` setting typically resolves to about 10 seconds, roughly twice the cost of 5 seconds.

<Frame caption="The SeeDance 2.5 / 2.0 generator in iCover AI: model, aspect ratio, resolution and duration all selectable on the page">
  <img src="https://mintcdn.com/apiyillc/2hrltgejiOJbcIE8/images/icover-ai-seedance-2-5-generator.jpg?fit=max&auto=format&n=2hrltgejiOJbcIE8&q=85&s=87cce4f3be2ddf992f3d4a817b79921c" alt="iCover AI SeeDance 2.5 / 2.0 video generator UI" width="1400" height="1374" data-path="images/icover-ai-seedance-2-5-generator.jpg" />
</Frame>

For reference images, video and audio, we recommend the ingest-first flow: upload the media to the asset library, get an `asset://` ID back, then insert it from the "asset" tab on each media slot. The request body shrinks to a few dozen bytes, the create-task call returns immediately, content checks move up to ingest time, and asset IDs stay reusable across tasks so a character keeps its look. The reference-image slot on the test page caps at 12 as a demo limit; the API itself supports up to 30 images plus 10 video and 10 audio references, so call it directly per the [integration docs](/en/api-capabilities/seedance2/overview) for batch work.

For the latency breakdown and migration steps behind the asset-first flow, see [Asset-First: Faster, More Reliable Image and Video Inputs](/en/api-capabilities/seedance2/asset-first-workflow).

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)
