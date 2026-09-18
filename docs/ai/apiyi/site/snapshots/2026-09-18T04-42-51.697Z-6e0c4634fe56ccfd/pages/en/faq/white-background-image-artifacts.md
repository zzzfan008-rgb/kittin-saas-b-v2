> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Why Does a White-Background Image Show Black Spots, Dirty Patches, or Blurry Color Blocks?

> White-background images from the Google Aistudio API often show artifacts. Switch the prompt to a light tint, or move to the Vertex channel to fix it.

## Short Answer

This is a known issue with the Google Aistudio API. Under compute pressure, large pure-white regions in generated images tend to render with black spots, dirty patches, or blurry color blocks. It has been observed repeatedly since April 2026. Two fixes:

* **Option 1 (try this first)**: change the prompt from "white background" to a light tint (light gray, beige, soft blue) — no configuration change required.
* **Option 2**: contact support to enable the `VertexGemini` group, then create a token bound to that group. The Vertex channel produces clean pure-white backgrounds.

## Detailed Explanation

Under load, the Aistudio image pipeline has trouble compressing and reconstructing **large uniform-color regions**, especially pure white. Three artifacts are common:

* **Black spots / dirty patches**: localized dark spots or irregular blotches in the image
* **Blurry color blocks**: instead of pure white, you get a hazy grayish or yellowish area
* **Color cast**: the white background drifts warm (beige) or cool (grayish blue) versus the prompt

This is **not a model capability issue** — it is a rendering defect in the Aistudio pipeline on uniform backgrounds. Gemini image models such as Nano Banana Pro and Nano Banana 2 are all affected when routed through Aistudio.

## Resolution Steps

### Option 1: Prompt-level workaround (recommended first)

Replace "white background / pure white background / #FFFFFF" in the prompt with a light tint:

* **Light gray**: `light gray background` / `#F5F5F5`
* **Beige**: `beige background` / `#F5F0E5`
* **Soft blue**: `light blue background` / `#E8F0F8`
* **Transparent**: `transparent background` (if the model supports alpha output)

<Info>
  In practice, switching from pure white to light gray or beige almost completely eliminates black spots and dirty patches. The subject colors are not affected — only the background tint changes.
</Info>

### Option 2: Move to the Vertex channel

If your use case strictly requires a pure white background (e.g., e-commerce product shots), routing through Vertex fixes the root cause.

#### VertexGemini group reference

| Field                | Details                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Identifier**       | `VertexGemini`                                                                                                |
| **Description**      | Vertex Gemini Models: Nano Banana Pro / 2 Series. Dedicated image-generation capacity via the Vertex channel. |
| **Supported models** | Nano Banana Pro, Nano Banana 2                                                                                |
| **Pros**             | Resolves the blurry pure-white background issue                                                               |
| **Cons**             | Limited concurrency (\~100 RPM); invite-only; slightly slower than Aistudio                                   |

#### How to use

<Steps>
  <Step title="Request access from support">
    Contact APIYI support / ops to enable the `VertexGemini` group. It is currently invite-only.
  </Step>

  <Step title="Create a dedicated token">
    Log in to the APIYI console → `Token management` → `Create token` → select group **`VertexGemini`** → save the key.
  </Step>

  <Step title="Switch the call">
    Use the new token to call Nano Banana Pro / Nano Banana 2. The Base URL stays the same (`https://api.apiyi.com/v1`).
  </Step>
</Steps>

<Warning>
  The `VertexGemini` group has limited concurrency (\~100 RPM), so it is not recommended for high-throughput production workloads. Keep Aistudio as your primary channel and only switch to Vertex for pure-white-background testing.
</Warning>

## Common Questions

<AccordionGroup>
  <Accordion title="Why does changing the background color fix the problem?">
    The Aistudio rendering issue is triggered by compressing large uniform-color regions. Switching to light gray or beige gives the background some texture, which avoids the "compress a large uniform area" condition that triggers the artifacts.
  </Accordion>

  <Accordion title="Is Vertex always better quality than Aistudio?">
    Not necessarily. Vertex is more stable on pure-white / uniform-color backgrounds, but on other scenes (complex composition, portraits) the two are comparable — and Vertex is slower. Only switch when you have confirmed the issue is triggered by pure white.
  </Accordion>

  <Accordion title="How do I request the VertexGemini group?">
    It is invite-only — contact APIYI support or your account manager. For most users, Option 1 (switch to a light-tint background) is sufficient.
  </Accordion>

  <Accordion title="Does switching to Vertex change the request URL?">
    No. The Base URL stays `https://api.apiyi.com/v1`. Only the token's group changes; APIYI's backend routes Vertex-group traffic to the Vertex platform automatically.
  </Accordion>
</AccordionGroup>

## Related Documentation

<CardGroup cols={2}>
  <Card title="Nano Banana Image Failure" icon="banana" href="/en/faq/nano-banana-image-failure">
    Common issues and troubleshooting for Nano Banana image models.
  </Card>

  <Card title="Google Aistudio vs Vertex Channel" icon="network" href="/en/faq/google-upstream-aistudio-vertex">
    Differences between the Aistudio and Vertex Gemini image channels and how to choose.
  </Card>

  <Card title="Enterprise Vertex Fallback Group" icon="building" href="/en/faq/enterprise-group-vertex-fallback">
    How enterprise customers use the Vertex group as a fallback channel.
  </Card>

  <Card title="Image Async API" icon="loader" href="/en/faq/image-async-api">
    How to use the asynchronous image generation endpoint.
  </Card>
</CardGroup>
