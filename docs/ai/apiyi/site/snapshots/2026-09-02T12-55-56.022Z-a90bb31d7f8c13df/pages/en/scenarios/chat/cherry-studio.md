> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Cherry Studio

> Powerful AI conversation client integration guide with OpenAI, Anthropic, and Gemini channel types

Cherry Studio is a powerful AI conversation client that supports multiple large language models. Through APIYI, you can use various mainstream AI models in Cherry Studio, and choose different channel types for the best experience and cost optimization.

## Quick Integration (OpenAI Compatible Format)

This is the most universal integration method, supporting all 400+ models on APIYI.

### 1. Get API Key

Please refer to the [API Key Management Tutorial](/faq/token-management) to get your API key.

### 2. Configuration Steps

<img src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/cherry-studio-config.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=697ce7c87d0a7ddadbc2a4ae4eeca322" alt="Cherry Studio OpenAI Compatible Configuration Interface" width="2400" height="1668" data-path="images/cherry-studio-config.png" />

Following the image above, complete the following configuration steps:

1. Open Cherry Studio application
2. Click the settings icon on the left to enter the settings page
3. Select "Model Service" option
4. Create a custom channel \[APIYI] in the model provider list
5. Fill in configuration information:
   * **API Address**: `https://api.apiyi.com`
   * **API Key**: Enter your APIYI key ([how to get](/faq/token-management))
6. Click the "➕ Add" button at the bottom to save the configuration

<Info>
  **Configuration Key Points**

  * API address must use: `https://api.apiyi.com`
  * For API key setup, see the [API Key Management Tutorial](/faq/token-management)
  * It's recommended to test the connection first to ensure correct configuration
</Info>

## Three Channel Types Comparison

Cherry Studio supports multiple channel types, all accessible through APIYI. Choose the best method for your use case:

| Feature              | OpenAI Compatible               | Anthropic Format            | Gemini Format                 |
| -------------------- | ------------------------------- | --------------------------- | ----------------------------- |
| **API Address**      | All use `https://api.apiyi.com` |                             |                               |
| **Supported Models** | All 400+ models                 | Claude models only          | Gemini models only            |
| **Key Benefit**      | Universal compatibility         | Cache cost savings          | Native features + image gen   |
| **Cache Billing**    | N/A                             | Cached tokens \~10% price   | N/A                           |
| **Special Features** | Widest model support            | Cost optimization for chats | Text-to-image, code execution |
| **Best For**         | General use, multi-model        | Heavy Claude usage          | Gemini-specific features      |

<Tip>
  **How to Choose?**

  * If you use multiple models, choose **OpenAI Compatible Format** (recommended default)
  * If you mainly use Claude with frequent conversations (within 5 minutes), choose **Anthropic Format** to save costs
  * If you need Gemini text-to-image or other native features, choose **Gemini Format**
</Tip>

## Anthropic Channel Type

The Anthropic native format supports **[Prompt Caching](/en/api-capabilities/claude-prompt-caching)**. During continuous conversations within 5 minutes, cached input tokens cost only about 10% of the normal price, significantly reducing usage costs.

### Configuration Steps

<img src="https://mintcdn.com/apiyillc/7TkKa5JmqO5PH0BI/images/cherry-studio-anthropic-provider.png?fit=max&auto=format&n=7TkKa5JmqO5PH0BI&q=85&s=2f3eeb3f3536cbe6cb0ec1f2bd2478f8" alt="Cherry Studio Add Anthropic Provider Dialog" width="1570" height="1020" data-path="images/cherry-studio-anthropic-provider.png" />

1. Open Cherry Studio Settings → Model Service
2. Click the "➕ Add" button at the bottom, then fill in the dialog:
   * **Provider Name**: Custom name (e.g., `APIYI-CLAUDE` for easy identification)
   * **Provider Type**: Select **Anthropic**
3. After clicking "OK" to create, fill in the configuration in the new channel:
   * **API Address**: `https://api.apiyi.com`
   * **API Key**: Enter your APIYI key
4. Add desired Claude models (e.g., `claude-sonnet-4-5-20250929`, `claude-opus-4-5-20251101`)

<Warning>
  **Note**: The Anthropic channel only supports Claude series models. For other models, use the OpenAI compatible format channel.
</Warning>

### When to Use

* **Continuous conversations**: Frequent chats within 5 minutes have high cache hit rates, saving significant costs
* **Long context conversations**: The longer the context, the more you save with caching
* **Occasional chats**: If you only chat sporadically, the OpenAI compatible format works just as well

<CardGroup cols={2}>
  <Card title="Claude API Documentation" icon="book" href="/en/api-capabilities/claude">
    View the complete Anthropic native format API documentation, including streaming, extended thinking, and other advanced features.
  </Card>

  <Card title="Prompt Caching Deep Dive" icon="database" href="/en/api-capabilities/claude-prompt-caching">
    Learn how Prompt Cache cuts your bill to 10%, with trigger conditions, minimal examples, and common pitfalls.
  </Card>
</CardGroup>

## Gemini Channel Type

The Gemini native format supports all Gemini-exclusive features, including **text-to-image generation** with `gemini-3-pro-image-preview`, code execution, native reasoning control, and more.

### Configuration Steps

1. Open Cherry Studio Settings → Model Service
2. Create a new channel, **select Google Gemini as the channel type**
3. Fill in configuration:
   * **API Address**: `https://api.apiyi.com`
   * **API Key**: Enter your APIYI key
4. Add desired Gemini models (e.g., `gemini-2.5-flash`, `gemini-3-pro-preview`, `gemini-3-pro-image-preview`)

<Warning>
  **Note**: The Gemini channel only supports Gemini series models. For other models, use the OpenAI compatible format channel.
</Warning>

### Special Features

* **Text-to-Image**: Use the `gemini-3-pro-image-preview` model to generate images directly in conversations
* **Code Execution**: Models can automatically execute Python code for data analysis
* **Reasoning Control**: Fine-tune reasoning depth via `thinking_budget`
* **Multimodal Support**: Full support for images, audio, video, and other media inputs

<Card title="Gemini Native Format Documentation" icon="sparkles" href="/en/api-capabilities/gemini/native">
  View the complete Gemini native format API documentation, including multimodal processing, reasoning control, code execution, and more.
</Card>

## Adding Models

After configuring channels, add the models you need in the corresponding channel:

1. Search for models in the model search box
2. Click the icon next to the model name to select or configure it
3. Enable or disable different model variants as needed

<Card title="View Latest Model Recommendations" icon="star" href="/api-capabilities/model-info">
  View the latest model recommendations, performance comparisons, and usage suggestions. Models are continuously updated to ensure you use the latest and most powerful AI models.
</Card>

<Info>
  **Why not list specific models here?**

  AI models are updated very frequently. To ensure you get the most accurate model recommendations, we maintain the latest model list, performance data, and usage suggestions on the [Model Recommendations page](/api-capabilities/model-info).
</Info>

## Advanced Features

### Image Support

If using models that support images (like GPT-4V):

1. Enable "Image" option in settings
2. Select models that support vision
3. Upload images in conversation

### Streaming Output

Cherry Studio supports streaming output by default, providing a better experience.

## Troubleshooting

### Connection Failed

* Check if API key is correct
* Confirm API address: `https://api.apiyi.com`
* Verify network connection status

### Model Unavailable

* Confirm account balance is sufficient
* Check if the model is in the correct channel type (e.g., Claude models need to be in OpenAI or Anthropic channel)
* Try other models

## Usage Tips

1. **Choose Channels Wisely**: Select the appropriate channel type based on your primary models — you can configure multiple channels simultaneously
2. **Choose Models Wisely**: Select appropriate models based on task requirements
3. **Regular Updates**: Follow new model releases
4. **Monitor Usage**: View usage through APIYI

Need more help? Please visit [APIYI Official Website](https://api.apiyi.com).
