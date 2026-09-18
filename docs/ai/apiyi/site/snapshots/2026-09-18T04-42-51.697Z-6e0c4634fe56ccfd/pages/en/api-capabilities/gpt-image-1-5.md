> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image-1.5 Image Generation API

> OpenAI's latest flagship image generation model, 4x faster, superior text rendering, LMArena #1.

GPT-Image-1.5 is OpenAI's latest flagship image generation model, released in December 2025. It surpasses its predecessor in speed, text rendering, and editing precision. Ranked #1 on LMArena Text-to-Image leaderboard with 1277 Elo.

## Key Features

<CardGroup cols={2}>
  <Card title="4x Speed Boost" icon="bolt">
    Most images generate in under 10 seconds, 4x faster than GPT-Image-1
  </Card>

  <Card title="Superior Text Rendering" icon="type">
    Supports dense text, markdown tables, and small typography for infographics and posters
  </Card>

  <Card title="Precision Editing" icon="square-pen">
    Preserves composition, lighting, and brand elements across 5+ editing iterations
  </Card>

  <Card title="Leaderboard #1" icon="trophy">
    LMArena Text-to-Image 1277 Elo, Design Arena 1344, AA Arena 1272
  </Card>
</CardGroup>

## Comparison with GPT-Image-1

| Feature                   | GPT-Image-1.5                              | GPT-Image-1      |
| ------------------------- | ------------------------------------------ | ---------------- |
| **Generation Speed**      | Under 10s (4x faster)                      | Standard         |
| **Text Rendering**        | Excellent (dense text, tables, small type) | Good             |
| **Editing Precision**     | High-fidelity element preservation         | Standard         |
| **Instruction Following** | More precise and consistent                | Standard         |
| **Cost**                  | \~20% cheaper than GPT-Image-1             | Standard pricing |
| **LMArena Elo**           | 1277 (#1)                                  | -                |

## Pricing

### Token-Based Pricing

| Token Type    | Price                    |
| ------------- | ------------------------ |
| Input Tokens  | \$5.00 / million tokens  |
| Output Tokens | \$10.00 / million tokens |

### Per-Image Pricing

**Low Quality**

| Size      | Price           |
| --------- | --------------- |
| 1024×1024 | \$0.009 / image |
| 1024×1536 | \$0.013 / image |
| 1536×1024 | \$0.013 / image |

**Medium Quality**

| Size      | Price           |
| --------- | --------------- |
| 1024×1024 | \$0.034 / image |
| 1024×1536 | \$0.051 / image |
| 1536×1024 | \$0.050 / image |

**High Quality**

| Size      | Price           |
| --------- | --------------- |
| 1024×1024 | \$0.133 / image |
| 1024×1536 | \$0.200 / image |
| 1536×1024 | \$0.200 / image |

<Warning>
  The system automatically selects the more favorable billing method. Final charges are based on actual consumption.
</Warning>

## API Usage

### Endpoint

```
https://api.apiyi.com/v1/images/generations
```

### Request Examples

<CodeGroup>
  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/images/generations \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -d '{
      "model": "gpt-image-1.5",
      "prompt": "A professional infographic about AI trends in 2026, with charts, icons, and readable text labels",
      "size": "1024x1536",
      "quality": "high",
      "output_format": "png"
    }'
  ```

  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.images.generate(
      model="gpt-image-1.5",
      prompt="A professional infographic about AI trends in 2026, with charts, icons, and readable text labels",
      size="1024x1536",
      quality="high",
      output_format="png"
  )

  print(response.data[0].url)
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const response = await client.images.generate({
    model: 'gpt-image-1.5',
    prompt: 'A professional infographic about AI trends in 2026, with charts, icons, and readable text labels',
    size: '1024x1536',
    quality: 'high',
    output_format: 'png'
  });

  console.log(response.data[0].url);
  ```
</CodeGroup>

## Request Parameters

| Parameter            | Type    | Required | Description                                                                         |
| -------------------- | ------- | -------- | ----------------------------------------------------------------------------------- |
| `model`              | string  | Yes      | Model name, use `gpt-image-1.5`                                                     |
| `prompt`             | string  | Yes      | Image description (max 1000 characters)                                             |
| `n`                  | integer | No       | Number of images, default 1, max 10                                                 |
| `size`               | string  | No       | `1024x1024`, `1536x1024`, `1024x1536`, `auto` (default)                             |
| `quality`            | string  | No       | `low`, `medium`, `high`, `auto` (default)                                           |
| `output_format`      | string  | No       | `png` (default), `jpeg`, `webp`                                                     |
| `output_compression` | integer | No       | Compression level (0-100%), JPEG/WebP only                                          |
| `background`         | string  | No       | `transparent`, `opaque`, `auto` (default)                                           |
| `input_fidelity`     | string  | No       | Set to `high` for high-fidelity preservation of first 5 input images during editing |
| `response_format`    | string  | No       | `url` (default) or `b64_json`                                                       |

## Response Format

```json theme={null}
{
  "created": 1702486395,
  "data": [
    {
      "url": "https://..."
    }
  ]
}
```

## Best Use Cases

### Infographics and Typography

GPT-Image-1.5 has the strongest text rendering capability among AI image generation models:

* Infographic generation
* Product posters and marketing materials
* Social media visual content
* Data visualization with tables
* Brand assets (precise logo and brand element preservation)

```python theme={null}
{/* Infographic example */}
response = client.images.generate(
    model="gpt-image-1.5",
    prompt="Create a clean infographic comparing 3 AI models: GPT-5, Claude 4, Gemini 3. Include performance bars, pricing info, and feature comparison table. Modern flat design, blue and white color scheme.",
    size="1024x1536",
    quality="high"
)
```

### Product Photography and E-commerce

```python theme={null}
{/* Product showcase example */}
response = client.images.generate(
    model="gpt-image-1.5",
    prompt="Professional product photography of modern wireless earbuds case on white marble surface, soft studio lighting, 45-degree angle, clean background",
    size="1024x1024",
    quality="high"
)
```

### Iterative Editing

GPT-Image-1.5 supports multi-round precise editing, maintaining consistency in composition, lighting, and brand elements across 5+ iterations.

## FAQ

<AccordionGroup>
  <Accordion title="Is GPT-Image-1.5 more expensive than GPT-Image-1?">
    Per-image pricing is slightly higher (due to higher token unit prices), but it's 4x faster with better quality. Token pricing is \$5.00/M input and \$10.00/M output. Actual cost per image varies based on prompt complexity.
  </Accordion>

  <Accordion title="Can I switch directly from GPT-Image-1?">
    Yes, simply change the `model` parameter from `gpt-image-1` to `gpt-image-1.5`. The API format and parameters are fully compatible.
  </Accordion>

  <Accordion title="How strong is the text rendering?">
    GPT-Image-1.5 can accurately generate dense text, markdown tables, and small typography. It ranks #1 on both LMArena Text-to-Image and Design Arena leaderboards.
  </Accordion>

  <Accordion title="Does it support transparent backgrounds?">
    Yes. Set `background: "transparent"` and use `png` or `webp` format to get transparent background images.
  </Accordion>

  <Accordion title="How long are image URLs valid?">
    Generated image URLs are typically valid for 24 hours. We recommend downloading and saving them promptly.
  </Accordion>
</AccordionGroup>

## Related Resources

<CardGroup cols={2}>
  <Card title="GPT-Image Series Overview" icon="palette" href="/en/api-capabilities/gpt-image-series">
    View the complete GPT-Image series comparison and selection guide
  </Card>

  <Card title="GPT-Image-1" icon="image" href="/en/api-capabilities/gpt-image-1">
    Classic image generation model, ideal for general use
  </Card>
</CardGroup>

<Info>
  OpenAI official documentation: `platform.openai.com/docs/models/gpt-image-1.5`
</Info>
