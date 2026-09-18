> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image Series Image Generation

> Overview of OpenAI GPT-Image series image generation models, including GPT-Image-1.5 and GPT-Image-1, accessible via APIYI.

The OpenAI GPT-Image series is one of the most advanced AI image generation model families, supporting text-to-image generation, image editing, and more. APIYI fully supports the GPT-Image series with complete compatibility with the OpenAI official Image API format.

## Model Comparison

| Feature                   | GPT-Image-1.5                               | GPT-Image-1              | GPT-Image-1-Mini                    |
| ------------------------- | ------------------------------------------- | ------------------------ | ----------------------------------- |
| **Release Date**          | December 2025                               | April 2025               | April 2025                          |
| **Generation Speed**      | Ultra fast (under 10s)                      | Standard                 | Faster                              |
| **Text Rendering**        | Excellent (dense text, tables)              | Good                     | Good                                |
| **Editing Capability**    | High-precision element preservation         | Standard                 | Standard                            |
| **Instruction Following** | More precise                                | Standard                 | Standard                            |
| **Input Price**           | \$5.00 / million tokens                     | \$2.50 / million tokens  | Lower                               |
| **Output Price**          | \$10.00 / million tokens                    | \$8.00 / million tokens  | Lower                               |
| **Best For**              | Professional design, branding, infographics | General image generation | Rapid prototyping, batch generation |

<Tip>
  **How to Choose?**

  * Need precise text rendering, brand assets, infographics → **GPT-Image-1.5**
  * General image generation, budget-conscious → **GPT-Image-1**
  * Rapid iteration, batch production → **GPT-Image-1-Mini**
</Tip>

## Quick Start

All GPT-Image models share the same API format — just change the `model` parameter to switch:

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

{/* Using GPT-Image-1.5 */}
response = client.images.generate(
    model="gpt-image-1.5",
    prompt="A professional product showcase with white background and soft lighting",
    size="1024x1024",
    quality="high"
)

print(response.data[0].url)
```

## Common Parameters

All GPT-Image models support the following parameters:

| Parameter       | Type    | Description                                           |
| --------------- | ------- | ----------------------------------------------------- |
| `model`         | string  | `gpt-image-1.5`, `gpt-image-1`, or `gpt-image-1-mini` |
| `prompt`        | string  | Image description (max 1000 characters)               |
| `size`          | string  | `1024x1024`, `1536x1024`, `1024x1536`, `auto`         |
| `quality`       | string  | `low`, `medium`, `high`, `auto`                       |
| `output_format` | string  | `png`, `jpeg`, `webp`                                 |
| `background`    | string  | `transparent`, `opaque`, `auto`                       |
| `n`             | integer | Number of images (1-10)                               |

## Detailed Documentation

<CardGroup cols={2}>
  <Card title="GPT-Image-1.5" icon="bolt" href="/en/api-capabilities/gpt-image-1-5">
    Latest flagship model, 4x speed boost, superior text rendering, LMArena #1
  </Card>

  <Card title="GPT-Image-1" icon="image" href="/en/api-capabilities/gpt-image-1">
    Classic image generation model, ideal for general use, cost-effective
  </Card>
</CardGroup>

## FAQ

<AccordionGroup>
  <Accordion title="What's the difference between GPT-Image-1.5 and GPT-Image-1?">
    GPT-Image-1.5 is 4x faster, \~20% cheaper, with significantly improved text rendering (supporting dense text and tables), and more precise editing that preserves original elements. GPT-Image-1 is best for general image generation at a lower price point.
  </Accordion>

  <Accordion title="Can generated images be used commercially?">
    Yes, images generated via the API are fully yours to use, including for commercial purposes.
  </Accordion>

  <Accordion title="Are Chinese prompts supported?">
    Yes, but English prompts generally produce the best results. For scenes requiring Chinese text rendering, GPT-Image-1.5 has significantly stronger text capabilities.
  </Accordion>

  <Accordion title="How do I migrate from GPT-Image-1 to 1.5?">
    Simply change the `model` parameter from `gpt-image-1` to `gpt-image-1.5`. All other parameters are fully compatible — no code changes needed.
  </Accordion>
</AccordionGroup>

## Related Resources

<CardGroup cols={2}>
  <Card title="Sora Image Generation" icon="wand-sparkles" href="/en/api-capabilities/sora-image-generation">
    Reverse-engineered image generation, \$0.01/image ultra-low price
  </Card>

  <Card title="Nano Banana Pro" icon="banana" href="/en/api-capabilities/nano-banana-image">
    4K HD, best-in-class text rendering, \$0.09/image
  </Card>
</CardGroup>
