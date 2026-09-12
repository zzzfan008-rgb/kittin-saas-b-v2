> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Do Google Models Run on AI Studio or Vertex?

> Nano Banana and other Google image models on APIYI run on official AI Studio by default; Vertex operates as a separate compute pool that takes over during AIStudio outages — the two work as redundant channels. This article lists verifiable facts and switching paths.

## Short Answer

**Nano Banana and other Google models run on "official AI Studio" by default; Vertex operates as a separate compute pool that takes over when AIStudio has issues. The two channels are redundant — not an either/or choice.**

<Info>
  This article only lists facts that can be verified from official docs or live status records. If you need details about scheduling logic, upstream compute pool capacity, or anything not covered in our docs, please contact support.
</Info>

## Default Group = Official AI Studio

Since Nano Banana launched in November 2025, APIYI has been routing `gemini-3-pro-image` (Nano Banana Pro), `gemini-3.1-flash-image` (Nano Banana 2), and the lite series **exclusively through official AI Studio** — never through reverse engineering channels (see [Live Update · 2026-07](/en/live/2026-07/nano-banana-pro-2-official-aistudio)).

<Tip>
  **Why emphasize "official AI Studio"**: Nano Banana's price being much lower than Google's official rate does NOT mean reverse engineering — the price advantage comes from aggregated scheduling and FX rates, not from bypassing Google's authentication.
</Tip>

Under the default group, you can **call directly in most cases** without any special configuration.

## Where Is Vertex? How to Enable It?

Vertex (Google Cloud's enterprise-grade channel) operates as a **separate compute pool** and is provided on APIYI as an independent group — select it when creating or editing a token. The exact group names shown on the dashboard are authoritative.

<Note>
  **About output file size**: Vertex's 4K output is larger than AI Studio's — **Vertex ≈ 20 MB per image, AI Studio ≈ 10 MB**. Plan your download, storage, and CDN bandwidth capacity using a 20 MB upper bound (see [Live Update · 2026-05-28](/en/live/2026-05/gemini-image-vertex-supply)).
</Note>

## AIStudio and Vertex Are Redundant Channels

The docs state explicitly: **APIYI provides AIStudio + Vertex dual-channel redundancy for the Nano Banana series** — when one official channel fails, the other takes over to maintain service availability ([Nano Banana Developer Guide](/en/api-capabilities/nano-banana-dev-guide)).

Cases where switching actually happened:

* **2026-06-19 incident**: Google's `AIStudio` compute issue caused official 2K/4K outputs to blur while 1K worked normally; **temporarily switched to Vertex channel** to recover 2K/4K (see [Live Update · 2026-06](/en/live/2026-06/nano-banana-2k-4k-via-vertex)).
* **2026-05-28 incident**: Both Gemini image preview models switched to the **Vertex high-price channel** to secure supply and returned to stable availability (see [Live Update · 2026-05](/en/live/2026-05/gemini-image-vertex-supply)).

<Warning>
  **Don't assume "Vertex is never affected."** Vertex taking over when AIStudio fails does NOT mean Vertex itself can never fail — APIYI has not published an "SLA 100% — Vertex never affected" commitment. When issues occur, always refer to `aistudio.google.com/status` and our [live updates](/en/live).
</Warning>

## How to Check Whether the Upstream Is Down?

The most authoritative source is Google's official AI Studio status page:

> **`aistudio.google.com/status`**

The status page publishes official incident notices for the Gemini model family. For example:

* **2026-06-19 15:54**: Marked as Detected. Original text: "We are experiencing issues with Nano Banana 2 and Nano Banana Pro models on Gemini API and AI Studio when using 2k or 4k resolution. Investigation is underway." (see [Live Update · 2026-06-19](/en/live/2026-06/aistudio-status-nano-banana))

<Tip>
  **Practical use**: When a customer reports "Banana is slow / images have issues", first check `aistudio.google.com/status`. If there's a Detected notice, you can usually localize whether it's an upstream issue within 1 minute.
</Tip>

## FAQ

<AccordionGroup>
  <Accordion title="Does the default pool only use AI Studio? Or does it include both Vertex and AI Studio?">
    The default group (Default) **runs on the official AI Studio channel** — this is the default route for Nano Banana and other Google image models. Vertex is an independent optional group, **NOT in the default group** — you must switch to a Vertex-related group to use Vertex.
  </Accordion>

  <Accordion title="Which group is Vertex in? How do I use Vertex?">
    Vertex is provided on the APIYI dashboard as an **independent optional group** (the exact name is authoritative per the dashboard). When creating or editing a token, pick the Vertex-related group under "Select Group" — the call signature stays the same, **no code changes needed**.
  </Accordion>

  <Accordion title="When Nano Banana is slow, is Vertex less affected? Is AI Studio the most affected?">
    **Based on recorded events, AI Studio did have a 2K/4K compute issue on 2026-06-19** — Vertex took over and recovered. But "Vertex is less affected" is currently **only proven for those recorded AIStudio compute incidents** — APIYI has not published SLA data for Vertex, nor made any "Vertex is never affected" commitment.

    If your business is sensitive to success rate, we recommend configuring **a fallback group for Nano Banana tokens** (see [Tokens and Groups](/en/faq/token-and-groups)) so that primary group congestion automatically switches to the backup channel.
  </Accordion>

  <Accordion title="How can I tell which channel my call actually used?">
    The specific channel is **not directly labeled in the response**. You can infer it indirectly:

    1. Whichever group your token is set to, calls use that group's default channel
    2. Check the returned image size — **AI Studio 4K ≈ 10 MB, Vertex 4K ≈ 20 MB**, the difference is noticeable
    3. During upstream incidents, check [Live Updates](/en/live) to see which channel the platform switched to
  </Accordion>
</AccordionGroup>

## Related Documents

<CardGroup cols={2}>
  <Card title="Nano Banana Developer Guide" icon="book-open" href="/en/api-capabilities/nano-banana-dev-guide">
    Complete Nano Banana usage guide, including AIStudio + Vertex dual-channel redundancy mechanism.
  </Card>

  <Card title="Nano Banana Pricing Overview" icon="tag" href="/en/api-capabilities/nano-banana-pricing">
    Complete pricing comparison for Nano Banana Pro / 2 / 2 Lite / first generation.
  </Card>

  <Card title="Live Updates Archive" icon="radio" href="/en/live/archive">
    Daily platform status, channel switches, and incident recovery timeline.
  </Card>

  <Card title="Tokens and Groups" icon="key" href="/en/faq/token-and-groups">
    Token groups and rules for default and fallback groups.
  </Card>
</CardGroup>

<Tip>
  **Need more?** Information not covered in this article — Vertex / AIStudio scheduling details, upstream compute pool capacity, SLAs — please contact us via WeCom customer service or email [hi@apiyi.com](mailto:hi@apiyi.com).
</Tip>
