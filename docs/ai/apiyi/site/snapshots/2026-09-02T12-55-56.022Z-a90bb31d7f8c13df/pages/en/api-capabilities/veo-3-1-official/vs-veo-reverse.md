> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# VEO 3.1 Official vs Reverse Channel Comparison

> Full-dimension comparison of VEO 3.1 Official (this series) vs existing VEO 3.1 (Reverse Channel) — pricing, capabilities, decision tree, and scenario-by-scenario recommendations.

<Info>
  APIYI provides two Veo 3.1 channels simultaneously. This page helps you **pick by scenario**: official quality + can accept async polling → **Official** (this series); cost-sensitive + need streaming sync or frame-to-video → **Reverse** ([VEO 3.1](/en/api-capabilities/veo/overview)). Both channels can be **used in parallel under the same account** without conflict.
</Info>

## Full Comparison Matrix

| Dimension                | **Official** (this series)                                          | **Reverse** ([existing VEO 3.1](/en/api-capabilities/veo/overview))      |
| ------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Channel type**         | Transparent passthrough to Google AI Studio                         | Reverse-engineered access to Google Flow                                 |
| **Model IDs**            | `veo-3.1-generate-preview` / `veo-3.1-fast-generate-preview`        | `veo-3.1` / `veo-3.1-fast` / `-landscape` / `-fl` series (8 variants)    |
| **Billing mode**         | Pay-per-request (independent of duration / resolution)              | Pay-per-request (independent of duration / resolution)                   |
| **Price**                | \$0.3 (fast) / \$1.2 (standard)                                     | \$0.15 (fast) / \$0.25 (standard) — **50–75% cheaper**                   |
| **Endpoint paths**       | `POST /v1/videos` only (async)                                      | `POST /v1/chat/completions` (streaming sync) + `POST /v1/videos` (async) |
| **Streaming sync**       | ❌ Async polling only                                                | ✅ Supports `stream: true` for live progress                              |
| **Duration**             | 4 / 6 / 8 seconds (string)                                          | Fixed 8 seconds                                                          |
| **Resolution**           | 720p / 1080p / 4k (three tiers)                                     | HD landscape (1280×720) / portrait (720×1280)                            |
| **Reference image**      | 1 image via `input_reference` (multipart)                           | 1–2 images (**supports frame-to-video** with `-fl` series)               |
| **Landscape / portrait** | Via `aspectRatio` parameter                                         | Via model ID (`-landscape` series)                                       |
| **Group**                | `Default`                                                           | `Default`                                                                |
| **Billing model**        | Pay-per-request ✅ / Pay-as-you-go Priority ✅ (pure Pay-as-you-go ❌) | Pay-per-request ✅ / Pay-as-you-go Priority ✅                             |
| **Response fields**      | `id` / `task_id` / `status` / `progress` (coarse 0/50/100)          | Sync: full chat completion; async: `task_id` / `status`                  |
| **Failed billing**       | ❌ Not billed                                                        | ❌ Not billed                                                             |
| **Audio**                | Native synchronized audio                                           | Native synchronized audio                                                |
| **When to use**          | Production needing official quality + can accept async polling      | Cost-sensitive, needs sync UI progress, needs frame-to-video             |

## Three-Step Decision Tree

<Steps>
  <Step title="Q1: Do you need frame-to-video capability?">
    * **Yes** → Use **[VEO 3.1 (Reverse)](/en/api-capabilities/veo/overview)** `-fl` series (e.g., `veo-3.1-landscape-fast-fl`); Official **does not yet expose** frame-to-video
    * **No** → Go to Q2
  </Step>

  <Step title="Q2: Does your frontend need a streaming sync progress bar?">
    * **Yes** (user-facing UI can't go blank) → Use **[VEO 3.1 (Reverse)](/en/api-capabilities/veo/overview)** `/v1/chat/completions` streaming endpoint
    * **Backend tasked** (queue consumer, batch production) → Go to Q3
  </Step>

  <Step title="Q3: Budget vs quality priority?">
    * **Budget first** (\$0.15 vs \$0.3 difference matters) → Use **[VEO 3.1 (Reverse)](/en/api-capabilities/veo/overview)**, 50% lower price
    * **Quality / stability first** (final delivery, 4K, strong instruction following) → Use **Official** (this series) with `veo-3.1-generate-preview`
    * **Iteration / preview** → Use **Official** `veo-3.1-fast-generate-preview` (\$0.3) or **Reverse** `-fast` (\$0.15)
  </Step>
</Steps>

## Scenario-by-Scenario Recommendations

| Business scenario                                 | Recommended channel | Recommended model                              | Why                                            |
| ------------------------------------------------- | ------------------- | ---------------------------------------------- | ---------------------------------------------- |
| Short-video matrix batch production (100+/day)    | **Reverse**         | `veo-3.1-landscape-fast`                       | \$0.15 unit price, controllable batch cost     |
| Final client ad delivery                          | **Official**        | `veo-3.1-generate-preview`                     | Stable official quality + 4K optional          |
| Frontend live display (needs loading animation)   | **Reverse**         | `veo-3.1-landscape-fast` + streaming sync      | Visible progress, avoids blank-wait anxiety    |
| Static poster + frame-to-video → motion clip      | **Reverse**         | `veo-3.1-landscape-fast-fl`                    | Frame-to-video capability                      |
| 4K cinematic clips (hero asset)                   | **Official**        | `veo-3.1-generate-preview` + `resolution=4k`   | Only Official supports 4K                      |
| Overseas team onboarding (existing Key unchanged) | **Official**        | `veo-3.1-fast-generate-preview`                | Default group + pay-per-request, zero friction |
| Same-prompt multi-seed style exploration          | **Official**        | `veo-3.1-fast-generate-preview`                | 4–6 sec optional, low iteration cost           |
| Iteration + final delivery workflow               | Mixed               | Reverse fast iterate → Official standard final | Cheap iteration, stable delivery               |

## Can I use both channels together?

**Absolutely**. The two channels are independently routed:

* Under the same account, **a single Token** (on the Default group) can call both channels simultaneously; billing is tracked per-call
* Switch the `model` field as needed in your business code:
  * To use Official → `veo-3.1-fast-generate-preview` / `veo-3.1-generate-preview`
  * To use Reverse → `veo-3.1-fast` / `veo-3.1-landscape` / `veo-3.1-fl` etc.

<Tip>
  **Recommended setup**: Route "business-critical delivery" to Official, route "iteration / batch previews / sync UI" to Reverse. Unified account, clean billing, complementary capabilities.
</Tip>

## Related Docs

* [VEO 3.1 Official Overview](/en/api-capabilities/veo-3-1-official/overview) — Official channel complete intro
* [VEO 3.1 (Reverse) Overview](/en/api-capabilities/veo/overview) — Existing Reverse channel complete intro
* [VEO 3.1 Official Text-to-Video Playground](/en/api-capabilities/veo-3-1-official/text-to-video)
* [VEO 3.1 Official Image-to-Video Playground](/en/api-capabilities/veo-3-1-official/image-to-video)
* [VEO 3.1 (Reverse) Quick Start](/en/api-capabilities/veo/quick-start) — Streaming sync usage
* [VEO 3.1 (Reverse) Async API](/en/api-capabilities/veo/async-api) — Includes frame-to-video usage
