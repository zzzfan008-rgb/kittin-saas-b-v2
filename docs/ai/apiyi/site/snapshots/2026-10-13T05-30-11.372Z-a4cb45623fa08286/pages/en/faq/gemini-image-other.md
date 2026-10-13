> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Why Does Gemini Image Return IMAGE_OTHER?

> When a Gemini image model returns finishReason: IMAGE_OTHER, the image was generated but filtered by the provider before delivery. How it differs from NO_IMAGE and blockReason, how to locate the trigger, and how to fix it.

## Short answer

If the Gemini image API returns HTTP 200 with `candidates[0].finishReason` set to `IMAGE_OTHER`, and `finishMessage` says `Unable to show the generated image`, **the model did generate an image, but the provider's output check filtered it before it was returned**.

* It is **probabilistic**: the same request sometimes succeeds and sometimes fails, and the failure rate can be high
* It is **unrelated to negative prompts, parameters, or the gateway**; the problem is what ends up in the picture
* The most typical trigger we have measured: **the prompt names a real person**
* The provider states in `finishMessage` that these requests are not charged

The approach is: **find the part of the prompt that makes the picture look like a specific real person or other restricted content, and replace it with a description.**

## How to recognize it

A typical response:

```json theme={null}
{
  "candidates": [
    {
      "finishReason": "IMAGE_OTHER",
      "finishMessage": "Unable to show the generated image. The model could not generate the image based on the prompt provided. You will not be charged for this request. Try rephrasing the prompt. ..."
    }
  ],
  "usageMetadata": {
    "promptTokenCount": 1430,
    "candidatesTokenCount": 274,
    "thoughtsTokenCount": 274
  },
  "modelVersion": "gemini-3-pro-image",
  "responseId": "..."
}
```

Note that `candidatesTokenCount` is not 0; it equals `thoughtsTokenCount`. The model finished thinking, but the final image was not delivered.

Three ways an image can go missing:

| Trait | IMAGE\_OTHER | NO\_IMAGE | blockReason: OTHER |
| - | - | - | - |
| Field carrying the failure | `candidates[0].finishReason` | `candidates[0].finishReason` | `promptFeedback.blockReason` |
| Where it happens | Image generated, **filtered on output** | The model never drew an image | Before generation, **input blocked** |
| `finishMessage` | `Unable to show the generated image` | Usually none | No `candidates` at all |
| Output tokens | Thinking tokens only | 0 or text only | 0 |
| Reproducible every time? | Probabilistic | Probabilistic | Usually yes |
| Common cause | Picture resembles a specific real person or other restricted content | The prompt asks for written output | A reference image is blocked |
| What to do | Rewrite the person or restricted part of the prompt | See [NO\_IMAGE troubleshooting](/en/faq/gemini-no-image) | See [blockReason: OTHER troubleshooting](/en/faq/gemini-image-input-blocked) |

<Info>
  In the official API reference, `IMAGE_OTHER` belongs to the same group as `IMAGE_SAFETY`, `IMAGE_PROHIBITED_CONTENT`, and `IMAGE_RECITATION`, all meaning "image generation was stopped". `IMAGE_OTHER` covers reasons outside the other categories, and the provider does not disclose the specific criteria.
</Info>

## A tested case

In September 2026 (UTC+8), a customer reported that a pure text-to-image player-card request **failed to return an image about 63% of the time** on gemini-3-pro-image. The prompt was about 5,500 characters:

* An opening sentence naming a real athlete and asking for a "1:1 replica" of their facial features
* Detailed pose, framing, uniform colors, art style, and white-background instructions
* Two long negative-prompt (NEGATIVE) blocks listing many brand names

Every failure we reproduced was `IMAGE_OTHER`, returned in about 20 seconds. We then removed one element at a time, 6 calls per group:

| Change | No image |
| - | - |
| Original prompt | **5/6** |
| **Only the sentence naming the real person removed**, everything else verbatim | **0/6** |
| Name kept, only the "1:1 replica" wording removed | 4/6 |
| Both negative-prompt blocks removed | 3/6 |

The conclusion is clear: **the real person's name itself is the trigger**. The model recognizes the name and draws toward that person's likeness; the closer the likeness, the more likely the output is filtered. The attempts that came out less similar got through, which is why it looked random. Neither the "1:1 replica" wording nor the long negative prompts were the cause.

With the name removed, the hair, face-shape, and eye descriptions already in the prompt were enough to produce a player card in the same style.

<Tip>
  Six calls per group is enough for this kind of bisection: when the original fails 5/6, the chance that the right fix passes 6 in a row by luck is about 2 in 100,000. The whole investigation took 24 calls.
</Tip>

## How to locate the trigger

<Steps>
  <Step title="Step 1: Confirm the failure type">
    Resend the same request 5 to 6 times, confirm that failures carry `finishReason: IMAGE_OTHER`, and note the failure rate. If you see `NO_IMAGE` or `blockReason` instead, use the matching troubleshooting page.
  </Step>

  <Step title="Step 2: Check names and specific subjects first">
    Look for **names of real people** in the prompt (celebrities, athletes, influencers, politicians, and so on), or instructions to look "exactly like" someone. Remove them and run another group.
  </Step>

  <Step title="Step 3: Remove sections by halves">
    If it is not a name, remove half the prompt at a time, 6 calls per group, and keep narrowing down only in the half whose failure rate drops clearly.
  </Step>

  <Step title="Step 4: Rewrite instead of just deleting">
    Once you find the trigger, replace the named reference with a **description** of appearance, clothing, and style, keeping the visual requirements you actually need.
  </Step>
</Steps>

## Recommendations

1. **Do not put real people's names in the prompt**: describe their appearance instead, for example "straight blonde hair with an off-center part, almond-shaped eyes, oval face". This was the only effective fix in our case.
2. **Trimming negative prompts is fine, but they are not the cause**: Gemini image models have no separate negative-prompt parameter, so a long NEGATIVE list is read as ordinary text. Trimming it makes the prompt clearer but does not lower the `IMAGE_OTHER` rate.
3. **Do not rely on retries**: with a failure rate above 60%, retrying is a gamble and adds latency. Your client can retry once on `IMAGE_OTHER` as a fallback, but the real fix is the prompt.
4. **Fix templates before batch generation**: if you generate from a roster (for example, one card per player), do not insert the names into the prompt. Use them only for your own file names or later layout.
5. **Use a reference image when a consistent likeness is required**: if you truly need to depict a specific person, provide a reference image authorized by that person, and keep in mind the real-person and minor restrictions listed in [Nano Banana image generation failures](/en/faq/nano-banana-image-failure).

Distinguishing the three forms in code:

```python theme={null}
def classify_no_image(resp: dict) -> str:
    if resp.get("promptFeedback", {}).get("blockReason"):
        return "input_blocked"        # see blockReason: OTHER troubleshooting
    cand = (resp.get("candidates") or [{}])[0]
    reason = cand.get("finishReason")
    if reason == "IMAGE_OTHER":
        return "output_filtered"      # rewrite names / restricted descriptions
    if reason == "NO_IMAGE":
        return "no_image_intent"      # see NO_IMAGE troubleshooting
    if reason in ("IMAGE_SAFETY", "IMAGE_PROHIBITED_CONTENT"):
        return "safety"               # explicit safety block, do not retry
    return "ok" if any("inlineData" in p for p in (cand.get("content") or {}).get("parts") or []) else "unknown"
```

## FAQ

<AccordionGroup>
  <Accordion title="Does it trigger if the prompt only mentions the name, without asking for a likeness?">
    Yes. In our tests, with the "1:1 replica" wording removed and only the name kept, the failure rate was still 4/6. The model recognizes the name and draws toward that person.
  </Accordion>

  <Accordion title="Why does the same request succeed sometimes and fail other times?">
    The filter runs after the image is generated, so the outcome depends on what was drawn that time. Every generation is different, so the same request can pass or be filtered.
  </Accordion>

  <Accordion title="Why did it work after I switched groups or channels?">
    The strictness of the output check can differ between groups, so the same prompt may fail at different rates. Group routing changes over time, though, so that difference is not stable. Fixing the prompt is the reliable approach.
  </Accordion>

  <Accordion title="Do negative prompts (NEGATIVE) help?">
    Gemini image models have no separate negative-prompt parameter; a NEGATIVE list in the prompt is read as ordinary text. It has no effect on `IMAGE_OTHER`, but a very long list can dilute the main description. Keep only the few items that matter and phrase them positively (for example, "plain white background" instead of a long list of "no stadium, no grass...").
  </Accordion>

  <Accordion title="Am I charged for IMAGE_OTHER?">
    The provider states in `finishMessage` that these requests are not charged. To confirm whether a request was billed, check the call logs in the APIYI console.
  </Accordion>
</AccordionGroup>

## Still stuck? Contact support

Please include the following so we can help:

* Model name and token group;
* The complete response (at least `finishReason`, `finishMessage`, and `responseId`) and the `request ID`;
* Time of occurrence (with time zone);
* The redacted prompt, and the failure rate you observed.

<Warning>
  Never send a complete API key. Redact the key before sharing screenshots or logs.
</Warning>

<CardGroup cols={2}>
  <Card title="WeCom Support" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="WeCom support QR code" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    Scan the QR code, or click this card to contact support directly.
  </Card>

  <Card title="Email Support" icon="mail">
    **Support**: [support@apiyi.com](mailto:support@apiyi.com)

    We recommend including "IMAGE\_OTHER" and the model name in the subject.
  </Card>
</CardGroup>

## Related documentation

<CardGroup cols={2}>
  <Card title="Why Does the Gemini Image API Return NO_IMAGE?" icon="image-off" href="/en/faq/gemini-no-image">
    Missing images caused by unclear prompt intent, and how to fix them
  </Card>

  <Card title="Why Does Gemini Image Return blockReason: OTHER?" icon="shield-alert" href="/en/faq/gemini-image-input-blocked">
    Locating a reference image blocked before generation, and preprocessing advice
  </Card>

  <Card title="Nano Banana image generation failures" icon="image-off" href="/en/faq/nano-banana-image-failure">
    Common causes including safety, watermark removal, well-known IP, and minors
  </Card>

  <Card title="Gemini Image API Error Handling" icon="triangle-alert" href="/en/api-capabilities/gemini-image-error-handling">
    The full response-checking order and user-friendly error messages
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.