> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Why does my image turn reddish after editing with banana pro?

> Common ways to mitigate the reddish/warm cast on Nano Banana Pro image edits: switch to the Vertex channel, or fall back to gpt-image-2.

## Short answer

An overall reddish/warm cast on Nano Banana Pro (`gemini-3-pro-image`) image edits is a frequently seen symptom. Two common mitigations:

1. Route banana pro through the **Vertex** channel
2. Switch to **gpt-image-2** for the edit task

## Detailed explanation

### Which channel does banana pro use by default?

Nano Banana Pro on apiyi routes through the **official AI Studio** channel by default. Vertex is a separate, optional pool that takes over when AI Studio has issues (see [Is Google routed through AI Studio or Vertex?](/en/faq/google-upstream-aistudio-vertex)).

### How do I switch to Vertex?

Vertex is exposed as a **separate group** in the apiyi console. When creating or editing a token, pick a Vertex-related group; no code change is required (see [Is Google routed through AI Studio or Vertex?](/en/faq/google-upstream-aistudio-vertex)).

### Will gpt-image-2 fix this?

gpt-image-2 generally preserves source colors better on edit tasks. Treat it as a fallback option — see [GPT-Image-2 image edit API](/en/api-capabilities/gpt-image-2-all/image-edit).

## Troubleshooting

<Steps>
  <Step title="Reproduce on the web playground">
    Open `imagen.apiyi.com` and re-run the same prompt + reference image.

    * Reproduces on web → likely model behavior; try Vertex / gpt-image-2
    * Web is fine → look at your integration (see [Image output differs heavily from the reference image](/en/faq/image-result-differs-from-reference))
  </Step>

  <Step title="Confirm the reference image is uploaded as base64">
    Nano Banana Pro does **not** accept OpenAI-style reference image uploads — base64 is required (see [Image output differs heavily from the reference image](/en/faq/image-result-differs-from-reference)). If you put a URL directly into `image_url`, the model is essentially "imagining" the reference, which can also manifest as a color cast.
  </Step>

  <Step title="Try the Vertex channel">
    Switch your token'"'"'s group to a Vertex group and re-run the same prompt. Compare the cast against AI Studio.
  </Step>

  <Step title="Try gpt-image-2">
    If Vertex still shows a cast, fall back to gpt-image-2. Note that the visual style will differ from banana pro; expect to re-tune your prompt.
  </Step>
</Steps>

## FAQ

<AccordionGroup>
  <Accordion title="gpt-image-2 vs banana pro on edits">
    banana pro leans toward "stylized re-render", gpt-image-2 leans toward "subtle in-place edit". gpt-image-2 typically preserves source colors better.
  </Accordion>
</AccordionGroup>

## Related docs

* [Is Google routed through AI Studio or Vertex?](/en/faq/google-upstream-aistudio-vertex)
* [Image output differs heavily from the reference image](/en/faq/image-result-differs-from-reference)
* [Nano Banana Pro image edit API](/en/api-capabilities/nano-banana-image/image-edit)
* [GPT-Image-2 image edit API](/en/api-capabilities/gpt-image-2-all/image-edit)

## Contact us

If you need help confirming whether the Vertex group is available on your account, or troubleshooting edit color casts, please reach out to support.
