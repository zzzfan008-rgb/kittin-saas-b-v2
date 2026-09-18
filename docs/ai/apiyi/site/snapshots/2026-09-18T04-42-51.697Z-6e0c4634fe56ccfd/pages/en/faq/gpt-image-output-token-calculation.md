> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Why Are GPT Image Output Tokens So High?

> Explains how GPT Image separates input and output tokens, and why resolution, quality, aspect ratio, and image count can significantly affect cost.

## Short Answer

This is normal. A 4K image at `high` quality is inherently expensive in GPT Image, and even a single output image can consume a large number of `output_tokens`.

Image output tokens are not calculated simply from “one output file” or as a fixed linear ratio of total pixels. They are mainly affected by:

1. `quality`: `low`, `medium`, `high`, or `auto`
2. Output dimensions and aspect ratio
3. Generation count `n`
4. The model's internal canvas partitioning and image complexity

<Info>
  `usage.output_tokens` represents the **image tokens used to generate the output image**, not reference-image input. Reference images are reported separately under `usage.input_tokens_details.image_tokens`.
</Info>

## Why Can One Image Use So Many Tokens?

“One image” describes the number of returned results, not the amount of generation work. The model must generate the entire canvas in its internal image-representation space. Higher quality and larger resolution generally require more image computation and output tokens.

For example, both requests return one image:

```json theme={null}
{
  "size": "1024x1024",
  "quality": "low",
  "n": 1
}
```

```json theme={null}
{
  "size": "3840x2160",
  "quality": "high",
  "n": 1
}
```

The second request still returns only one image, but it uses a 4K landscape canvas and the high-quality tier. A much larger output-token count is expected.

## Four Main Cost Factors

### 1. The `quality` Parameter

`quality` is usually the most visible cost variable:

| Value    | Typical use                              | Output-token trend     |
| -------- | ---------------------------------------- | ---------------------- |
| `low`    | Fast previews and drafts                 | Lowest                 |
| `medium` | Balance of quality and cost              | Medium                 |
| `high`   | Fine textures, text, and complex details | Highest                |
| `auto`   | Model selects the tier                   | May vary between calls |

<Warning>
  With `quality: "auto"` or no explicit `quality`, the model may select a different tier based on the prompt. Calls with identical dimensions and reference images can therefore differ by several times in `output_tokens`. For predictable budgeting, explicitly set `low`, `medium`, or `high`.
</Warning>

The project documentation includes a real example: three requests each used 1061 input tokens, while their output counts were 1286, 5146, and 1287 tokens. The middle call automatically selected a higher quality level and cost about 3.5 times as much as the other two.

### 2. Output Dimensions

Higher resolution generally means a larger internal canvas and more output tokens. A 4K `high` request can cost far more than a 1K `low` request.

However, the following formula cannot predict the exact result:

```text theme={null}
output tokens = width × height × fixed coefficient
```

Pixel count is useful only for rough budgeting. The model determines the actual `output_tokens` during generation, and the response's `usage.output_tokens` is the source of truth.

### 3. Aspect Ratio and Internal Canvas Partitioning

Output tokens also depend on how the internal canvas is tiled, scaled, and covered. Token usage is therefore not always strictly monotonic with the final pixel count.

At the same quality tier, a larger non-square image can sometimes consume fewer output tokens than a smaller or more square image. This is not contradictory: the model uses discrete canvas or tiling rules rather than billing each final pixel independently.

<Tip>
  When comparing dimensions, consider both `quality` and aspect ratio. Do not compare only the “4K” or “2K” label or total pixel count.
</Tip>

### 4. Generation Count `n`

As a general rule, generating more images increases total output tokens. N generated images carry roughly N sets of output cost.

However, the current `gpt-image-2` endpoint supports only `n=1`. To generate multiple images, send multiple independent requests; each request is billed separately for input and output tokens. Whether another image model supports `n>1` depends on that model's documentation.

## Which Tokens Are Affected by Reference Images?

Reference-image count primarily affects **input image tokens**, not output image tokens:

| Field                                      | Meaning                                   |
| ------------------------------------------ | ----------------------------------------- |
| `usage.input_tokens_details.text_tokens`   | Prompt text input                         |
| `usage.input_tokens_details.image_tokens`  | Reference-image input                     |
| `usage.output_tokens_details.image_tokens` | Generated image output                    |
| `usage.output_tokens`                      | Total image output tokens for the request |

`gpt-image-2` processes reference images at high fidelity. More reference images increase input image tokens approximately linearly, while the final output's `output_tokens` are still mainly determined by output quality, dimensions, aspect ratio, and the model's internal generation process.

If the billing record explicitly attributes the large count to “image output,” it should not be blamed on the number of references. Reference-image cost should appear separately in the input-image token field.

## How to Calculate the Real Cost

Using the current `gpt-image-2` billing structure:

```text theme={null}
total cost
= text input tokens × text input rate
+ reference-image input tokens × image input rate
+ output image tokens × image output rate
```

Example response:

```json theme={null}
{
  "usage": {
    "input_tokens": 1040,
    "input_tokens_details": {
      "text_tokens": 16,
      "image_tokens": 1024
    },
    "output_tokens": 5146,
    "output_tokens_details": {
      "text_tokens": 0,
      "image_tokens": 5146
    },
    "total_tokens": 6186
  }
}
```

This means:

* 16 tokens came from prompt text
* 1024 tokens came from the reference image
* 5146 tokens came from the generated image
* Only one image was returned, but its quality and canvas required 5146 output image tokens

<Info>
  There is no universal fixed token count per 2K or 4K image across all dimensions and content. Budget tables are estimates only. Final billing should use the actual `usage` values returned by the API or shown in the console logs.
</Info>

## How to Reduce Token Usage

<Steps>
  <Step title="Set an explicit quality tier">
    Avoid `auto`. Pass `low`, `medium`, or `high` explicitly so the model does not unexpectedly select a more expensive tier.
  </Step>

  <Step title="Avoid unnecessary resolution">
    Use 1K or 2K for previews and internal review, then generate 4K `high` only for final delivery.
  </Step>

  <Step title="Choose the required aspect ratio">
    Use the canvas your workload actually needs instead of increasing dimensions only to appear more detailed.
  </Step>

  <Step title="Control output count">
    Multiple candidates increase total output cost approximately linearly. Validate prompts with a small batch before scaling up.
  </Step>

  <Step title="Record usage fields">
    Store each request's `size`, `quality`, `output_tokens`, and cost to build a cost baseline from real production data.
  </Step>
</Steps>

## Related Documentation

* [GPT-Image-2 Overview and Billing](/en/api-capabilities/gpt-image-2/overview)
* [GPT-Image-2 Text-to-Image API](/en/api-capabilities/gpt-image-2/text-to-image)
* [GPT-Image-2 Image Editing API](/en/api-capabilities/gpt-image-2/image-edit)
* [How Do I View API Logs?](/en/faq/call-logs)
