> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# How to Choose the Right AI Model?

> Learn how to select the most suitable AI model for your application scenarios and master the core principles of model selection

## Quick Model Reference

<Info>
  **Recommended Resource**: [Model Information Overview](/en/api-capabilities/model-info)

  This page is regularly updated with the latest model list, performance metrics, and pricing information to help you quickly understand all available models.
</Info>

## Core Selection Principles

<CardGroup cols={2}>
  <Card title="Prefer New Over Old" icon="trending-up">
    **Prioritize Newer Models**

    * ✅ Better performance and quality
    * ✅ Lower prices despite improvements
    * ✅ Richer feature sets
    * ✅ Longer context support
  </Card>

  <Card title="Match Your Scenario" icon="target">
    **Align with Actual Needs**

    * 📊 Data Analysis: Models with strong reasoning
    * 💬 Conversations: Balance performance and cost
    * 🎨 Creative Work: Multimodal capabilities
    * ⚡ Batch Processing: High cost-efficiency
  </Card>
</CardGroup>

## Common Scenario Recommendations

### Text Generation & Conversations

<AccordionGroup>
  <Accordion title="💬 General Dialogue & Content Creation">
    **Recommended Models**:

    * **Claude 3.5 Sonnet**: Strong overall capabilities for complex tasks
    * **GPT-4o mini**: Exceptional value for high-volume usage
    * **Gemini 2.0 Flash**: Fast and cost-effective

    **Use Cases**: Customer service bots, content generation, copywriting
  </Accordion>

  <Accordion title="🧠 Complex Reasoning & Data Analysis">
    **Recommended Models**:

    * **Claude 3.7 Sonnet**: Top-tier reasoning ability
    * **Gemini 3 Pro Preview**: Data analysis specialist
    * **o1 Series**: Deep thinking models

    **Use Cases**: Data analysis, code generation, logical reasoning
  </Accordion>

  <Accordion title="⚡ Batch Processing & High Concurrency">
    **Recommended Models**:

    * **GPT-4o mini**: Starting at \$0.15/million tokens
    * **Gemini 2.0 Flash**: Fast with high stability
    * **GLM-4-Flash**: Cost-effective domestic option

    **Use Cases**: Batch translation, content moderation, data processing
  </Accordion>
</AccordionGroup>

### Image Generation

<Accordion title="🎨 Image Generation Model Selection">
  **Recommended Models**:

  * **FLUX.1 Pro**: Highest quality for professional scenarios
  * **FLUX.1 Schnell**: Speed-first for rapid iteration
  * **SeeDream 4.5**: 4K generation, great value (\$0.035/image)

  **Use Cases**:

  * **E-commerce Product Images**: SeeDream 4.5 (supports reference images)
  * **Marketing Creatives**: FLUX.1 Pro (best quality)
  * **Quick Prototypes**: FLUX.1 Schnell (3-second generation)
</Accordion>

### Code & Technical Applications

<Accordion title="💻 Code Generation & Technical Development">
  **Recommended Models**:

  * **Claude 3.7 Sonnet**: Best code quality
  * **GPT-4o**: Comprehensive multi-language support
  * **Gemini 3 Pro Preview**: 76.2% on SWE-bench

  **Use Cases**: Code generation, code review, technical documentation
</Accordion>

## Scenario-Specific Consultation

If you have specific application scenarios and are unsure which model to choose, feel free to contact us for professional advice:

<CardGroup cols={3}>
  <Card title="Email Support" icon="mail">
    [feedback@apiyi.com](mailto:feedback@apiyi.com)

    Describe your use case in detail
  </Card>

  <Card title="Enterprise WeChat" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="Enterprise WeChat QR Code" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    Scan QR code or [Click to contact support](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    Quick response, real-time communication
  </Card>

  <Card title="Telegram" icon="send">
    @apiyi001

    Instant messaging, efficient answers
  </Card>
</CardGroup>

<Tip>
  **Please provide the following information when consulting**:

  * 🎯 **Application Scenario**: Specific use case (e.g., batch image title generation, customer service dialogue)
  * 📊 **Usage Scale**: Expected daily call volume
  * ⚡ **Performance Requirements**: Response speed, quality expectations
  * 💰 **Budget Range**: Cost control targets

  This information helps us recommend the most suitable model combination for you.
</Tip>

## Real-World Example

<Warning>
  **Case Study: Batch Image Title Generation**

  **Customer Need**: Generate title descriptions for a large number of product images

  **Recommended Solution**:

  * **GPT-4o mini**: Low cost (\$0.15/million tokens), stable quality, suitable for batch processing
  * **Gemini 2.0 Flash**: Fast speed, even lower cost, suitable for ultra-large batches

  **Rationale**: Such tasks don't require high creativity but are sensitive to cost and speed. Mini and flash series offer the best value.
</Warning>

## Model Update Notes

<Info>
  **Stay Informed**

  AI models iterate rapidly, and new models typically bring significant improvements in both performance and pricing. We recommend:

  * 📖 Regularly check the [Model Information page](/en/api-capabilities/model-info) for the latest models
  * 🔔 Follow the [Changelog](/en/changelog) for new model release notifications
  * 🧪 Use free credits to test new model performance
  * 📈 Gradually migrate to new models based on actual results

  **Remember**: Prefer new over old - newer models are often better and cheaper!
</Info>
