> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Common Reasons for Nano Banana Image Generation Failures

> Analysis of common causes for Nano Banana Pro/2 image generation failures, including content safety, watermark removal, famous IPs, minors, and other triggers of Google's safety mechanisms

## Quick Answer

The Nano Banana series (including Nano Banana Pro and Nano Banana 2) uses Google Gemini models under the hood. The primary reason for image generation failures is **triggering Google's content safety mechanisms**, which block non-compliant requests during the generation phase. APIYI acts as a transparent proxy, faithfully forwarding Google's feedback.

## Common Triggers

<CardGroup cols={2}>
  <Card title="NSFW Content" icon="ban">
    Prompts or reference images containing pornographic, violent, gory, or hate speech content are directly blocked by Google's safety mechanisms.
  </Card>

  <Card title="Watermark Removal" icon="droplet-off">
    Requesting watermark removal from images violates content policies and will be rejected by Google.
  </Card>

  <Card title="Famous IP / Copyrighted Characters" icon="copyright">
    Generation requests involving copyrighted characters from Disney, Marvel, Nintendo, etc. are rejected due to copyright protection.
  </Card>

  <Card title="Minor-Related Content" icon="baby">
    Any inappropriate content generation requests involving minors are subject to Google's zero-tolerance policy and strictly blocked.
  </Card>
</CardGroup>

### New Restrictions in Nano Banana 2

<Warning>
  Since Nano Banana 2 launched on February 27, 2026, Google has further tightened its safety mechanisms. The following scenarios also trigger blocking:
</Warning>

<CardGroup cols={2}>
  <Card title="Famous Individuals" icon="user-x">
    Image generation or editing requests involving public figures (celebrities, politicians, etc.) will be rejected.
  </Card>

  <Card title="Financial/Order Info Modification" icon="credit-card">
    Attempts to modify financial information, order screenshots, price tags, etc. in images will be blocked.
  </Card>

  <Card title="Outfit/Face Swapping" icon="shirt">
    Operations like changing outfits or swapping faces on people involve privacy and ethical concerns and will be rejected.
  </Card>

  <Card title="Implicit NSFW Content" icon="eye-off">
    Even without explicit sexual descriptions, suggestive or borderline inappropriate content will be detected and blocked.
  </Card>
</CardGroup>

## Policy Update Timeline

| Date              | Event                                | Impact                                                                                                              |
| ----------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| January 23, 2026  | Google adjusts risk control policies | Overall safety review becomes stricter; some previously allowed prompts are now blocked                             |
| February 27, 2026 | Nano Banana 2 launches               | New blocking rules for famous individuals, financial info modification, outfit/face swapping, implicit NSFW content |

## Typical Symptoms of Generation Failure

When image generation fails, the API still returns HTTP status code **200**, but the response contains no image data — instead, it returns a text explanation.

<Info>
  **Why is the status code 200?** APIYI acts as a transparent proxy, faithfully forwarding Google API's original response. Google returns a 200 status code with a text rejection explanation during safety blocking, rather than an HTTP error code.
</Info>

### Common Error Messages

Google API's rejection text typically contains messages like:

* `"I can't complete the modification of xxx"`
* `"I can't generate images that are sexually explicit."`
* `"I'm just a language model and can't help with that."`

<Warning>
  Note: Google's safety filtering has some randomness. **The same prompt may succeed sometimes and fail other times**, depending on reference image content, prompt combination, and other factors.
</Warning>

## Recommendations for Product Developers

If you're building user-facing products on the Nano Banana API, we recommend implementing proper error handling logic to provide friendly failure messages to your users.

<Tip>
  **Key Indicators to Check**:

  1. **candidatesTokenCount = 0**: Google rejected at the content review stage
  2. **finishReason is not STOP**: Blocked by safety policy during generation
  3. **Text present but no image**: API returned a rejection explanation instead of image data
</Tip>

## Contact Support

If your use case is legitimate and compliant but you're still experiencing generation failures, feel free to contact us for investigation:

<Card title="Technical Support" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
  * [Contact us on Enterprise WeChat](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)
  * Email: [hi@apiyi.com](mailto:hi@apiyi.com)
</Card>
