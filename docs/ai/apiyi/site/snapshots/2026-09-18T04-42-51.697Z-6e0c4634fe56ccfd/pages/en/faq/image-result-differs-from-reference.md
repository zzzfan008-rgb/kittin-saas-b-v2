> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Why Does the Generated Image Differ Greatly from the Reference?

> Gemini-3-Pro-Image and Banana-series models require base64 reference images, not OpenAI-format URLs. Common checks are listed below.

## Short Answer

If you are using `gemini-3-pro-image`, Banana Pro, or Banana 2, large differences between the generated image and the reference are usually caused by a reference-image upload format mismatch:

* These models **do not support OpenAI-format reference image uploads**
* References must be uploaded as **base64 strings**
* The issue is related to the integration method, not the model itself

## Troubleshooting Steps

Walk through the following checks in order:

<Steps>
  <Step title="Test the model in the web console">
    Open `imagen.apiyi.com` and run the same reference through the web UI.

    If the web result matches the reference, the model is working correctly and the issue is in your integration. If the web result is also different, continue with the next checks.
  </Step>

  <Step title="Check the token group">
    In the APIYI console, confirm your token includes the `gemini-3-pro-image` or Banana-series model group.

    If the model is not enabled, the call may fall back to default behavior and produce unexpected results.
  </Step>

  <Step title="Confirm the billing mode">
    In the token settings, check the billing mode:

    * **Pay-as-you-go first**: uses both pay-as-you-go and subscription quota
    * **Pay-as-you-go only**: only pay-as-you-go quota is available

    A mismatch between billing mode and model group can cause failed calls or unexpected results.
  </Step>

  <Step title="Verify the integration method">
    Re-check your request against the official model documentation.

    For Banana 2:
    `docs.apiyi.com/api-capabilities/nano-banana-2-image/image-edit`

    Pay attention to:

    * The reference field expects a **base64 string**, not a URL
    * The MIME type must match the actual image format
    * The parameter shape must match what this model supports
  </Step>
</Steps>

## Common Causes

| Symptom                               | Likely cause                                          |
| ------------------------------------- | ----------------------------------------------------- |
| Web UI works, API result is off       | Integration format mismatch (most common)             |
| All calls are off                     | Reference image not uploaded or upload failed         |
| Occasional differences                | Prompt description is too thin or too many references |
| Model group is enabled but call fails | Billing mode mismatch                                 |

<Tip>
  **Most common cause**: putting an image URL into an OpenAI-compatible `image_url` field. For models that do not support OpenAI-format references, encode the image as a base64 string and place it in the correct field.
</Tip>

## Related Questions

<CardGroup cols={2}>
  <Card title="Nano Banana Image Failure" icon="banana" href="/en/faq/nano-banana-image-failure">
    Common issues and fixes for Nano Banana models.
  </Card>

  <Card title="Image Async API" icon="loader" href="/en/faq/image-async-api">
    How to use the image async task endpoint.
  </Card>

  <Card title="How to Configure the Base URL" icon="link" href="/en/faq/base-url-config">
    Connect APIYI in various client tools.
  </Card>

  <Card title="Token Model Whitelist" icon="key" href="/en/faq/token-model-whitelist">
    Configure which models a token can access.
  </Card>
</CardGroup>
