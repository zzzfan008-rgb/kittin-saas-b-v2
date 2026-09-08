> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# What Are the API Concurrency Limits?

> Learn about concurrency limits for different model types and how to request higher quotas

## Short Answer

**Concurrency limits vary by model type** - text models have the highest concurrency, while image models have moderate controls.

<Info>
  **Important Note**

  Concurrency limits apply to **individual models**, not your entire account. For example, Nano Banana Pro has 30 concurrent requests, which doesn't affect other models' concurrency.
</Info>

## Concurrency Limits by Model Type

<CardGroup cols={3}>
  <Card title="Text Models" icon="file-text">
    **Default: 50 req/sec**

    * ✅ High concurrency support
    * ✅ Suitable for batch processing
    * 🔓 Higher quotas available
  </Card>

  <Card title="Async Video Models" icon="video">
    **Default: High concurrency**

    * ✅ Asynchronous processing
    * ✅ Large-scale call support
    * 📊 Ideal for batch video generation
  </Card>

  <Card title="Image Models" icon="image">
    **Default: 30 req/sec**

    * ⚠️ Concurrency controlled
    * 📦 Base64 large data transfer
    * 🔓 Adjustable upon request
  </Card>
</CardGroup>

## Why Do Image Models Have Concurrency Controls?

<Warning>
  **Technical Reason**

  Image generation APIs use **Base64 encoding** to transfer image data, resulting in large request payloads (typically 500KB-5MB per request). To ensure service stability and response speed, moderate concurrency control is necessary.

  **Example**: Nano Banana Pro has a default of 30 concurrent requests, sufficient for most use cases.
</Warning>

## How Concurrency is Calculated

### Per Individual Model

Concurrency limits apply to **each specific model**, not your entire account:

| Scenario              | Concurrency Calculation                                   |
| --------------------- | --------------------------------------------------------- |
| Same model calls      | Subject to that model's limit (e.g., Nano Banana Pro: 30) |
| Different model calls | Each model calculated independently                       |
| Multiple tokens       | Each token has independent concurrency                    |

<Tip>
  **Real Example**

  If you simultaneously use:

  * Nano Banana Pro (image): 30 concurrent
  * GPT-4o mini (text): 50 concurrent
  * FLUX.1 Pro (image): 30 concurrent

  **Total available concurrency**: 110+ requests (independent per model)
</Tip>

## How to Request Higher Concurrency?

### Individual Users

<Steps>
  <Step title="Assess Your Needs">
    Determine your required concurrency level and use case
  </Step>

  <Step title="Contact Support">
    [Contact us on Enterprise WeChat](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec) to explain your needs
  </Step>

  <Step title="Technical Review">
    We'll evaluate based on your use case and historical data
  </Step>

  <Step title="Quota Adjustment">
    Upon approval, we'll adjust concurrency limits for your token
  </Step>
</Steps>

### Enterprise Customers

<Info>
  **Dedicated Line Service**

  Enterprise customers can apply for dedicated line services with:

  * 🚀 **Higher Concurrency Quotas**: Customized for business needs
  * 🔒 **Isolated Resource Pools**: Unaffected by public traffic
  * ⚡ **Priority Scheduling**: Guaranteed response speed
  * 📞 **Dedicated Support**: One-on-one service

  Contact us to learn about enterprise service plans.
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="Why do text models have higher concurrency than image models?">
    Text models have smaller request/response payloads (typically a few KB), while image models transfer Base64-encoded image data (typically 500KB-5MB). Concurrency control ensures overall service quality.
  </Accordion>

  <Accordion title="How can I check my current concurrency quota?">
    You can check via:

    * Backend console token configuration
    * Rate Limit information in API response headers
    * Contact customer service for specific quotas
  </Accordion>

  <Accordion title="What happens if I exceed concurrency limits?">
    When exceeding limits, the API returns `429 Too Many Requests`. Recommendations:

    * Implement request queue management
    * Add retry mechanism (exponential backoff)
    * Apply for higher concurrency quota
  </Accordion>

  <Accordion title="Are concurrency limits shared across different tokens?">
    No. Each token has independent concurrency quotas without interference. For higher total concurrency, create multiple tokens to distribute requests.
  </Accordion>

  <Accordion title="Is there an extra fee for adjusting concurrency quotas?">
    Generally, reasonable concurrency adjustments are **free of charge**. However, extremely high concurrency or dedicated line services may involve enterprise custom plans - please consult customer service for details.
  </Accordion>
</AccordionGroup>

## Concurrency Optimization Tips

<CardGroup cols={2}>
  <Card title="Use Request Queues" icon="list">
    Implement local queue management to control simultaneous requests and avoid limits
  </Card>

  <Card title="Error Retry Mechanism" icon="refresh-cw">
    Use exponential backoff retry strategy when encountering 429 errors
  </Card>

  <Card title="Multiple Token Distribution" icon="key">
    Create multiple tokens to distribute requests across different tokens, increasing total concurrency
  </Card>

  <Card title="Prioritize Async Processing" icon="clock">
    For non-real-time scenarios, prefer async APIs (like video generation)
  </Card>
</CardGroup>

## Contact Us

To request higher concurrency quotas or inquire about enterprise dedicated line services:

<CardGroup cols={3}>
  <Card title="Email Support" icon="mail">
    [feedback@apiyi.com](mailto:feedback@apiyi.com)

    Describe your concurrency needs in detail
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
  **Please provide when requesting**:

  * 📊 **Use Case**: Specific application (e.g., e-commerce batch image generation, content moderation)
  * 📈 **Expected Concurrency**: Required concurrency level
  * 🕐 **Peak Hours**: Primary usage time periods
  * 📜 **Historical Data**: Current call volume and frequency

  This information helps us provide the most suitable concurrency quota plan for you.
</Tip>
