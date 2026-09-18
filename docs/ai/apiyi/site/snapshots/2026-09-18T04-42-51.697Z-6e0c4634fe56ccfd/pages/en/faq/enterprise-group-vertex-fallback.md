> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# What Is the Enterprise Group? When Should You Use It?

> On APIYI, the Enterprise group is **per-model**, not a single universal group: gpt-image-2 uses image2Enterprise (1.2x), Nano Banana uses NanoBananaEnterprise (1.4x) or NanoBananaReverse (0.8x). This article summarizes the differences, multipliers, and use cases for each model's enterprise group.

## Short Answer

**On APIYI, "Enterprise group" is not a single universal group — each model has its own dedicated enterprise fallback channel.** They typically cost a bit more than the default group, but they keep producing images even when the default group is saturated — making them a fallback option for high-success-rate workloads.

<Info>
  This article only lists facts that can be verified from official docs or live status records. SLA, concurrency limits, and other unpublished data should be requested via customer support.
</Info>

## Enterprise Groups Are Per-Model

Unlike the universal groups `ClaudeCode`, `Sora2Official`, etc., enterprise groups are named per model:

| Model                                                      | Enterprise group name  | Multiplier | Channel nature                                                                                                           |
| ---------------------------------------------------------- | ---------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| gpt-image-2.5-flare / gpt-image-2.5-sunburst / gpt-image-2 | `image2Enterprise`     | 1.2x       | **OpenAI upstream** enterprise fallback (see [Live Update · 2026-05-13](/en/live/2026-05/gpt-image-2-default-saturated)) |
| Nano Banana Pro / 2                                        | `NanoBananaEnterprise` | 1.4x       | Google high-availability fallback (see [Image & Video Models](/en/api-capabilities/image-video-models))                  |
| Nano Banana Pro / 2                                        | `NanoBananaReverse`    | 0.8x       | **Reverse-engineered Vertex** channel (see [Live Update · 2026-06](/en/live/2026-06/nanobanana-reverse))                 |

<Tip>
  **Important clarification**: Enterprise groups are **NOT synonymous with Vertex fallback**. `image2Enterprise` is an OpenAI upstream fallback — unrelated to Google Vertex; `NanoBananaReverse` is the channel that actually goes through Vertex (via reverse engineering); `NanoBananaEnterprise` is a high-availability fallback whose channel composition is not explicitly documented.
</Tip>

## When the Default Group Saturated, Enterprise Groups Still Worked

Real-world case for `gpt-image-2`:

* **2026-05-13 14:29–14:31** call logs: 9 non-streaming calls **all routed to the `image2Enterprise` group**, with first-byte latency between 35-293 seconds at 1.2x multiplier — still produced images successfully (see [Live Update · 2026-05](/en/live/2026-05/gpt-image-2-default-saturated)).
* When the `gpt-image-2` default group was saturated, "**some default-group requests had been routed via the fallback path into the enterprise group**" — confirming the design intent that enterprise groups serve as a fallback (same live update).

`NanoBananaReverse`'s design intent (see [Live Update · 2026-06](/en/live/2026-06/nanobanana-reverse)):

> To relieve the impact on official-direct Nano Banana Pro / 2 during peak hours, we added a reverse-engineered Vertex group `NanoBananaReverse` at 80% of the default group's price (0.8x multiplier), per-call billing regardless of resolution.

<Warning>
  **No "enterprise group = always stable" guarantee.** Official docs explicitly state: the `gpt-image-2` enterprise group (official OpenAI API) also experienced "The server had an error while processing your request." errors on 2026-05-07, root-caused to an OpenAI upstream failure (see [Live Update · 2026-05](/en/live/2026-05/gpt-image-2-upstream-error)). Enterprise groups **mitigate** default-group congestion but do not guarantee upstream stability forever.
</Warning>

## How to Switch to an Enterprise Group?

Enterprise groups are configured **at the token level**:

1. Open [https://api.apiyi.com/token](https://api.apiyi.com/token)
2. Find the target token → click the "Manage (wrench icon)" in the action column → "Edit Token"
3. Under "Select Group", pick the corresponding enterprise group (e.g. `image2Enterprise`, `NanoBananaEnterprise`, `NanoBananaReverse`)
4. Save

No code changes needed. Detailed walkthrough in [Live Update · 2026-04 · image2-enterprise](/en/live/2026-04/image2-enterprise-stable) (gpt-image-2 example; the path is the same for other models).

<Tip>
  **NanoBananaReverse scope**: Only supports `gemini-3-pro-image` (Nano Banana Pro) and `gemini-3.1-flash-image` (Nano Banana 2), **per-call billing only**. If your Nano Banana Pro token is on usage-based billing, this group doesn't apply.
</Tip>

## FAQ

<AccordionGroup>
  <Accordion title="Is Enterprise the same as Vertex?">
    **Not necessarily** — it depends on which model's enterprise group:

    * `image2Enterprise` (gpt-image-2 specific) — **NOT Vertex**, it's an OpenAI upstream enterprise fallback
    * `NanoBananaEnterprise` (Nano Banana specific) — docs do not explicitly state whether it uses Vertex
    * `NanoBananaReverse` (Nano Banana Pro / 2) — **definitely uses reverse-engineered Vertex**

    Don't equate "enterprise group" with "Vertex fallback".
  </Accordion>

  <Accordion title="Which models have an enterprise group?">
    Per available docs / live updates:

    * gpt-image-2.5-flare / gpt-image-2.5-sunburst / gpt-image-2: `image2Enterprise` (1.2x)
    * Nano Banana Pro / 2: `NanoBananaEnterprise` (1.4x), `NanoBananaReverse` (0.8x)
    * Nano Banana OSS (URL output): `NB-OSS` (1x, but it's a beta — you need to contact customer support to enable the group visibility; see [Nano Banana OSS Group](/en/api-capabilities/nano-banana-oss-group))

    The exact groups available **follow what your dashboard shows** — the platform may add or rename groups over time.
  </Accordion>

  <Accordion title="When should I switch to the enterprise group?">
    Typical scenarios from recorded incidents:

    * Default group is persistently saturated / queued / timing out (e.g. gpt-image-2 around 2026-05)
    * Your business is success-rate sensitive and you don't want default-group failures to drag you down
    * Nano Banana Pro / 2 experience is poor at peak hours — consider `NanoBananaReverse` (per-call, 0.8x, cheaper)

    Conversely, **if the default group is well-resourced, don't bother switching to the enterprise group**: on 2026-05-23 after the gpt-image-2 default group was replenished, "**call directly — no need to specifically switch to image2Enterprise**" (see [Live Update · 2026-05](/en/live/2026-05/gpt-image-2-default-restocked-0523-2142)).
  </Accordion>

  <Accordion title="Is the enterprise group always more expensive than the default group?">
    Not necessarily. Multipliers from recorded data go both ways:

    * `image2Enterprise`: 1.2x (≈ 20% more than default)
    * `NanoBananaEnterprise`: 1.4x (≈ 40% more than default)
    * `NanoBananaReverse`: **0.8x** (≈ **20% less** than default)

    So "enterprise" does not mean "more expensive" — the multiplier depends on the specific model and group.
  </Accordion>

  <Accordion title="Can I configure Default + Enterprise as a fallback?">
    Yes. A token supports **1 default group + up to 2 fallback groups** (see [Tokens and Groups](/en/faq/token-and-groups)). When the primary group is congested, calls automatically switch to a backup channel. This is the recommended pattern for "high success rate" workloads.
  </Accordion>
</AccordionGroup>

## Related Documents

<CardGroup cols={2}>
  <Card title="Tokens and Groups" icon="key" href="/en/faq/token-and-groups">
    Token roles, creation/editing, and rules for default vs. fallback groups.
  </Card>

  <Card title="Nano Banana Developer Guide" icon="book-open" href="/en/api-capabilities/nano-banana-dev-guide">
    Complete Nano Banana documentation, including AIStudio + Vertex dual-channel redundancy.
  </Card>

  <Card title="Live Updates Archive" icon="radio" href="/en/live/archive">
    Daily platform status, channel switches, and incident recovery timeline.
  </Card>

  <Card title="Nano Banana Pricing Overview" icon="tag" href="/en/api-capabilities/nano-banana-pricing">
    Pricing comparison for Nano Banana Pro / 2 / 2 Lite / first generation.
  </Card>
</CardGroup>

<Tip>
  **Need more?** Information not covered in this article — enterprise-group SLAs, concurrency limits, enterprise-group rollout plans for new models — please contact us via WeCom customer service or email [hi@apiyi.com](mailto:hi@apiyi.com).
</Tip>
