> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Why Does the Gemini Image API Return NO_IMAGE?

> Learn why Gemini returns NO_IMAGE and how to improve image prompts and troubleshoot the request.

## Short answer

When the API returns `finishReason: NO_IMAGE` and `parts` is `null`, the model usually processed the request but did not return image content.

This does not necessarily mean that the prompt triggered a content-safety block. Prompts such as “What is GEO?” or “Explain this concept” look more like text questions. The model may not be able to confirm that the user explicitly wants an image, so it returns `NO_IMAGE`.

Make the image intent explicit at the beginning of the prompt, then describe the subject, layout, style, and output requirements.

Another frequent cause is a **prompt that asks the model to write text**, such as "produce a design proposal" or "make the analysis thorough." When the call only allows image output, such a request returns `NO_IMAGE` some of the time, so the same request may fail and then succeed. See "The prompt asks for written output" below.

<Note>
  If the response has no `candidates` but contains `promptFeedback.blockReason` (for example `OTHER`), that is a different problem: the input was blocked by the provider before generation started. See [Why Does Gemini Image Return blockReason: OTHER?](/en/faq/gemini-image-input-blocked)
</Note>

## Why does NO\_IMAGE happen?

### 1. The prompt looks like a text question

For example:

```text theme={null}
What is GEO?

GEO helps a company gain visibility in large-model AI systems...
```

This explains a concept, but does not clearly say:

* what type of image to generate;
* which elements should appear in the image;
* how the information should be laid out;
* whether the response should contain only an image.

Even when the request contains the words “generate an image,” the model may still interpret the overall request as a text explanation.

### 2. The image intent is not specific enough

Some platform tools automatically prepend instructions such as “Generate an image:”. With a direct API call, however, the request may be transparently forwarded without a complete image-generation instruction being added automatically.

Instead of writing only:

```text theme={null}
Generate an image: What is GEO?
```

State the image type and visual goal directly:

```text theme={null}
Generate a Chinese technology-style infographic poster about “What is GEO”.
```

### 3. The prompt has no visual description

If the prompt only explains a concept, the model does not know how to turn it into a visual composition. Consider specifying:

* image type: infographic, poster, flowchart, or promotional graphic;
* layout: three columns, timeline, or radial structure;
* visual style: technology, business, minimalist, or branded;
* text hierarchy: title, numbered sections, body copy, and layout;
* output instruction: generate an image only, without a text explanation.

### 4. The prompt asks for written output

Gemini image models can also read images and write text. If the prompt contains sentences that ask for written output, the model will sometimes "write the proposal first" instead of generating the image:

```text theme={null}
...Based on the outsole in image 1, design a marathon running shoe...
Produce a professional, precise, and actionable design proposal for the shoe.
Make sure the analysis is thorough and accurate, and that the design and color scheme can be used directly in product development.
```

Sentences like these suit a text model. When they are sent to an image model with image-only output (`responseModalities: ["IMAGE"]`), the proposal the model wants to write cannot be returned, so the response becomes `finishReason: NO_IMAGE`, `parts: null`, and zero output tokens.

We re-ran a real shoe-design request (3 reference images plus a prompt like the one above) in September 2026 (UTC+8) on gemini-3.1-flash-image with `responseModalities: ["IMAGE"]`:

| Prompt variant | Requests returning NO\_IMAGE |
| - | - |
| Original prompt | 10/48 (about 21%, varying between 1/12 and 5/12 across runs) |
| Removed the "design proposal" and "thorough analysis" sentences | 0/36 |
| Original prompt with one sentence appended: "output the final image only" | 0/24 |
| Removed the brand names from the prompt | 1/12 (brand names are not the trigger) |

That is why the same request can fail several times in a row and then succeed, even though the route has not changed. The simplest fix is to append a sentence like this to the end of the prompt:

```text theme={null}
Important: output only one final image. Do not output any written proposal, analysis, or prompt.
```

<Tip>
  When a reference image contains clearly readable text or third-party marks (for example, brand lettering on a shoe sole), the model is more likely to start by analyzing the material. In the same test, blurring that lettering also brought the request to 0/36.
</Tip>

## Different responseModalities settings, different symptoms

The same request with unclear image intent fails differently depending on `responseModalities`:

| Setting | What you see when no image is returned |
| - | - |
| `["IMAGE"]` | `finishReason: NO_IMAGE`, `parts: null`, zero output tokens |
| Omitted, or `["TEXT", "IMAGE"]` | `finishReason: STOP`, but `parts` contains only text and no image |

**Troubleshooting tip**: resend the failing request a few times without `responseModalities` and read what the model writes when it does not return an image:

* A proposal, an analysis, or an image prompt → the image intent is unclear; fix the prompt as described on this page
* A refusal such as "I can't generate this" → a content-safety policy was triggered; see [Nano Banana image generation failures](/en/faq/nano-banana-image-failure)

## Example GEO prompt

You can rewrite the original prompt as follows:

```text theme={null}
Generate a Chinese technology-style infographic poster titled “What is GEO”.

The image must contain one main title and three numbered sections:

1. Help companies gain visibility in large-model AI search and recommendations;
2. Make a company the answer to a user's question;
3. Build AI trust in and recommendations for a company's information.

Design requirements:

- Use a blue and purple technology style;
- Use a clear three-column layout;
- Emphasize “visibility,” “answer,” and “trusted recommendation”;
- Use clean, readable Chinese typography;
- Make it suitable as a corporate promotional poster;
- Generate an image only, without a text explanation.
```

<Tip>
  “Generate an image” is only an action hint. It does not replace a description of the visual result. The more clearly you describe the image type, subject, layout, and style, the easier it is for the model to identify the request as image generation.
</Tip>

## How to troubleshoot NO\_IMAGE

<Steps>
  <Step title="Step 1: Identify which field carries the failure">
    If `candidates[0].finishReason` is `NO_IMAGE`, this page applies. If there are no `candidates` and `promptFeedback.blockReason` has a value, the input was blocked before generation; see [Troubleshooting blockReason: OTHER](/en/faq/gemini-image-input-blocked).
  </Step>

  <Step title="Step 2: Check whether the response contains image data">
    Check `parts`, `inlineData`, `image`, or the equivalent image field in the response. If `parts` is `null`, the response usually contains no image content.
  </Step>

  <Step title="Step 3: Confirm that the prompt explicitly requests an image">
    Make sure the prompt contains a clear instruction such as “generate an image,” “create a poster,” or “create an image.” Do not submit only a text question such as “What is...” or “Explain...”. Also look for sentences that ask for written output, such as "produce a proposal," "analyze in depth," or "explain your design." Remove them, or append "output the image only" to the end of the prompt.
  </Step>

  <Step title="Step 4: Check content-safety factors next">
    If the prompt clearly requests an image but still returns `NO_IMAGE`, check for NSFW content, minors, well-known IP, watermark removal, real-person portraits, or other upstream safety policies.
  </Step>

  <Step title="Step 5: Check the call logs">
    Review the complete response, model name, request ID, and charge record in the call logs. `usageMetadata` shows that the model processed the request, but it does not prove that an image was generated or that a safety block occurred.
  </Step>
</Steps>

## How is NO\_IMAGE different from a safety block?

| Symptom | Possible cause | Recommended action |
| - | - | - |
| `NO_IMAGE` with `parts: null` and an abstract prompt | Image intent is unclear | Add the image type, visual subject, and layout requirements |
| A safety-policy error is returned | The upstream content-safety policy was triggered | Change or remove the content that may trigger the policy |
| `NO_IMAGE` comes and goes, and a retry of the same request succeeds | The prompt asks for written output, so the model sometimes writes a proposal first | Remove the proposal or analysis sentences, or append "output the final image only" |
| No `candidates`, and `promptFeedback.blockReason` is `OTHER` | The input was blocked by the provider before generation | See [Troubleshooting blockReason: OTHER](/en/faq/gemini-image-input-blocked) |
| The image intent is explicit but no image is returned | The model, group, token, or upstream route may be unavailable | Contact support with the complete error, model name, request ID, and time |

<Info>
  `finishReason: NO_IMAGE` only means that no image was returned. It does not by itself prove that the prompt violated a policy. Use the complete error, prompt, and call logs together.
</Info>

## Frequently asked questions

<AccordionGroup>
  <Accordion title="Will adding “generate an image” always fix the problem?">
    No. It only makes the basic intent clearer. Also describe the image type, subject, composition, style, and output requirements. For abstract concepts, explicitly ask for an infographic, poster, or flowchart.
  </Accordion>

  <Accordion title="Was the GEO topic blocked by content safety?">
    The GEO concept itself does not appear to contain an obvious safety risk. However, `NO_IMAGE` alone cannot completely rule out an upstream policy decision. In this case, the prompt reads more like a knowledge explanation, so unclear image intent is the more appropriate first check.
  </Accordion>

  <Accordion title="Why does the same request sometimes work and sometimes fail? Did the route change?">
    In most cases the route has not changed. `NO_IMAGE` caused by unclear intent is probabilistic: on each request the model chooses between generating an image and writing text first. In our tests, the same request failed about 21% of the time, often several times in a row. Retry `NO_IMAGE` responses automatically 1–2 times in your client, and fix the prompt to remove the root cause.
  </Accordion>

  <Accordion title="Why are there tokens in usageMetadata if no image was returned?">
    `usageMetadata` only shows that the model processed the input and produced reasoning or text tokens. It does not mean that the response contains an image. Check the image data fields in the response.
  </Accordion>

  <Accordion title="Will NO_IMAGE be charged?">
    Do not determine billing from `NO_IMAGE` alone. Check the APIYI call logs to confirm whether the request created a charge record.
  </Accordion>
</AccordionGroup>

## Still stuck? Contact support

If the request still returns `NO_IMAGE` after you make the image intent explicit, contact APIYI support and include:

* Model name and token group;
* Complete error message and `request ID`;
* Redacted prompt;
* Time of occurrence;
* Charge record from the call logs.

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

    We recommend including “NO\_IMAGE” and the model name in the subject.
  </Card>
</CardGroup>

## Related documentation

<CardGroup cols={2}>
  <Card title="Why Does Gemini Image Return blockReason: OTHER?" icon="shield-alert" href="/en/faq/gemini-image-input-blocked">
    How to find the blocked input image and preprocess reference images
  </Card>

  <Card title="Nano Banana image generation failures" icon="image-off" href="/en/faq/nano-banana-image-failure">
    Common causes including safety, watermark removal, well-known IP, and minors
  </Card>

  <Card title="How can I troubleshoot model API errors?" icon="alert-triangle" href="/en/faq/model-error-troubleshooting">
    General guidance for 401, 429, 503, 504, timeout, and group issues
  </Card>

  <Card title="How do I read billing amounts in the logs?" icon="file-text" href="/en/faq/log-billing-explained">
    Use call logs to confirm whether a request succeeded and was charged
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.