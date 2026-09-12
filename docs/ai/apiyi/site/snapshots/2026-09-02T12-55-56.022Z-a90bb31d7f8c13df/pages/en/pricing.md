> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Pricing

> Understand APIYI and AI model pricing logic and advantages, enjoy more favorable prices than official sources. We provide transparent and preferential pricing plans, allowing you to enjoy top AI model services at lower costs.

## APIYI Pricing Principles

### 1. Model Price Alignment

* **Overseas Models**: Prices equal to official websites (including OpenAI, Claude, Gemini, Grok, etc.)
* **Domestic Models**: Prices lower than official websites (including DeepSeek, Qwen, Doubao, Kimi, etc.)
* **Rare Models**: Some newly released overseas models (e.g., o3-pro) or models with high access thresholds may have slight markups. However, with top-up bonuses and discounts, prices are close to official rates.

<CardGroup cols={2}>
  <Card title="Transparent Pricing, 20% Off" icon="tags">
    Most model prices are consistent with official rates. Consumption is completely transparent, just for peace of mind\~
  </Card>

  <Card title="Complete Models, Fast Updates" icon="bell-dot">
    Whenever manufacturers release new models, APIYI updates promptly. Speed is an advantage!
  </Card>
</CardGroup>

## Top-up Advantages

### 2. Fixed Exchange Rate

<CardGroup cols={2}>
  <Card title="Fixed Exchange Rate" icon="dollar-sign">
    **1:7** fixed exchange rate

    Does not fluctuate with the real-time rate — simpler billing, and stacks with top-up promotions for extra savings
  </Card>

  <Card title="Low Entry Threshold" icon="coins">
    **\$5** minimum

    Just 35 RMB to start using
  </Card>
</CardGroup>

### 3. Top-up Bonuses

<Note>
  **The more you top up, the more you save**

  First-time bonuses + Tiered bonuses (10%-20%), overall discount up to **20% off** official prices
</Note>

<Card title="View Complete Top-up Promotion Policy" icon="gift" href="/faq/recharge-promotions">
  Learn about detailed first-time bonuses, tiered bonus rates, enterprise services, and more
</Card>

## More Advantages Over Official Websites

More importantly, compared to official single accounts, APIYI provides more comprehensive services:

<CardGroup cols={2}>
  <Card title="Unlimited Usage" icon="infinity">
    * No rate limits
    * No account ban risk
    * Pay-as-you-go billing
  </Card>

  <Card title="Complete Model Selection" icon="layers">
    * 400+ popular models
    * One-click switching
    * Continuous updates
  </Card>

  <Card title="Easy Integration" icon="plug">
    * Unified API interface
    * OpenAI format compatible
    * Zero migration cost
  </Card>

  <Card title="Enterprise-Grade Service" icon="shield-check">
    * Professional technical support
    * Stable and reliable
    * Data security guarantee
  </Card>
</CardGroup>

## Billing Basics

### What is 'Pay-as-you-go'?

Pay-as-you-go means you only pay for the services you actually use, without monthly or annual prepayment.

<CardGroup cols={2}>
  <Card title="Flexible Usage" icon="chart-line">
    * Pay for what you use
    * No minimum consumption
    * Start or stop anytime
  </Card>

  <Card title="Cost Control" icon="gauge">
    * Real-time consumption view
    * Set quota alerts
    * Precise to each call
  </Card>
</CardGroup>

### Billing Mode Priority

APIYI supports two billing modes. When a model supports both:

<Warning>
  **Per-call billing takes priority over per-token billing**

  If a model supports both per-call and per-token billing, the system defaults to per-call billing.
</Warning>

#### Token (API Key) Settings Impact

Your billing method is also affected by token configuration:

<CardGroup cols={2}>
  <Card title="Token-Only Billing" icon="sliders-horizontal">
    If token is set to "token-only billing", even if the model supports per-call billing, it will use per-token billing
  </Card>

  <Card title="Default Setting" icon="circle-check">
    Tokens support all billing modes by default, system auto-selects (per-call priority)
  </Card>
</CardGroup>

### 'Per-Call Billing' Scenarios

The following types of models typically use per-call billing:

<Tabs>
  <Tab title="Image Generation">
    **Applicable Models**:

    * sora\_image series (reverse-engineered models)
    * flux-kontext-pro (official model)
    * DALL-E series
    * Midjourney-related models

    **Billing Unit**: Per image
  </Tab>

  <Tab title="Video Generation">
    **Applicable Models**:

    * Video generation APIs
    * Animation models

    **Billing Unit**: Per video/per second
  </Tab>

  <Tab title="Special Models">
    **Identification**:

    * Models with `-all` suffix (reverse-engineered)
    * Specific functional models

    **Billing Unit**: Per call
  </Tab>
</Tabs>

<Info>
  View complete model price list: [APIYI Pricing](https://api.apiyi.com/account/pricing)
</Info>

### What are Tokens?

Tokens are the basic units for AI models to process text. Understanding tokens helps you estimate and control costs.

<Info>
  **Token Calculation Reference**

  * Chinese: 1 character ≈ 1-2 tokens
  * English: 1 word ≈ 1-2 tokens
  * 1000 tokens ≈ 750 English words ≈ 500 Chinese characters
</Info>

#### Token Calculation Example

```
Input text: "Hello, please help me write a Python function"
Token count: About 12-15 tokens

Output text: "def hello_world():\n    print('Hello, World!')"
Token count: About 15-20 tokens

Total consumption: Input + Output ≈ 30-35 tokens
```

### Prompts and Completions

In each API call, costs consist of two parts:

<Steps>
  <Step title="Prompt - Input Tokens">
    All content you send to the model, including:

    * System prompts
    * User questions
    * Context information
    * Conversation history (if any)
  </Step>

  <Step title="Completion - Output Tokens">
    Content generated by the model, including:

    * Text responses
    * Code generation
    * Structured data
  </Step>
</Steps>

<Warning>
  Different models may have different input and output prices. Usually output tokens cost more than input tokens.
</Warning>

## How to Choose the Right Model?

### Model Selection Strategy

<Tabs>
  <Tab title="Cost Priority">
    **Suitable Scenarios**: Batch processing, simple tasks, testing & development

    **Recommended Models**:

    * gemini-2.5-flash (fast and good)
    * gpt-4.1 (official replacement for gpt-4.5)
    * deepseek-v3 (domestic excellence, high cost-performance)

    **Estimated Cost**: \$0.1-1/million tokens
  </Tab>

  <Tab title="Performance Priority">
    **Suitable Scenarios**: Complex reasoning, professional content, high-quality output

    **Recommended Models**:

    * gemini-2.5-pro (strong multimodal)
    * claude-sonnet-4-20250514-thinking (long text processing)
    * o3 (OpenAI's main reasoning model, multimodal)
    * deepseek-r1-0528 (R1 optimized version)

    **Estimated Cost**: \$3-15/million tokens
  </Tab>

  <Tab title="Balanced Choice">
    **Suitable Scenarios**: Daily use, medium complexity tasks

    **Recommended Models**:

    * gpt-4.1 (balanced cost-performance)
    * claude-3-5-haiku-20241022 (fast response)
    * qwen-max (Chinese optimized)

    **Estimated Cost**: \$0.5-3/million tokens
  </Tab>
</Tabs>

See the "Popular Models" page on the left for more information.

### Cost Estimation Method

<Steps>
  <Step title="Small Sample Testing">
    Test with a small number of samples (5-10)
  </Step>

  <Step title="View Consumption Logs">
    Check detailed token consumption for each call in APIYI console
  </Step>

  <Step title="Calculate Average">
    Calculate average token count per call
  </Step>

  <Step title="Estimate Total Cost">
    Average tokens × Expected calls × Model unit price
  </Step>
</Steps>

<Card title="Practical Advice" icon="lightbulb">
  1. Test with cheaper models first, verify feasibility
  2. Analyze actual consumption through APIYI backend logs
  3. Choose appropriate model based on task complexity
  4. Optimize prompts to reduce unnecessary token consumption
</Card>

## Real-time Price Inquiry

<CardGroup cols={2}>
  <Card title="Model Price List" icon="table" href="https://api.apiyi.com/account/pricing">
    View real-time prices for all models

    * Per-token billing prices
    * Per-call billing prices
    * Discount comparisons
  </Card>

  <Card title="Cost Calculator (In Development)" icon="calculator" href="https://api.apiyi.com">
    Quickly estimate usage costs

    * Input estimated usage
    * Select models
    * Auto calculate fees
  </Card>
</CardGroup>

## FAQ

<AccordionGroup>
  <Accordion title="How to check real-time prices?">
    Login to [APIYI Console](https://api.apiyi.com), view real-time prices for all models on the model list page.
  </Accordion>

  <Accordion title="How long does top-up take?">
    Top-up is instant, usable immediately after successful payment.
  </Accordion>

  <Accordion title="Do you support invoices?">
    Yes, we support official invoices. Please submit invoice application in console.
  </Accordion>

  <Accordion title="Are there bulk purchase discounts?">
    Enterprise bulk top-ups can enjoy more discounts. Please contact customer service.
  </Accordion>
</AccordionGroup>

## Invoice Information

### Invoice Process

After successful online top-up or corporate transfer, invoices are issued based on actual payment amount (all prices include tax). Customers need to provide detailed invoice information: company or university name, tax ID, etc.

<Steps>
  <Step title="Submit Invoice Information">
    Top navigation in website backend - Invoicing, self-submit invoice form

    [Submit Invoice Application →](https://xinqikeji.feishu.cn/share/base/form/shrcns8TS3alZTN2Av1JfkOvmqh)
  </Step>

  <Step title="Invoice Type">
    * Can issue VAT regular invoice (special invoice needs separate tax point negotiation)
    * Invoice category: **Information Technology Service Fee** or **Data Collection Fee**
    * Can provide: Purchase list with official seal
  </Step>

  <Step title="Delivery Time">
    About 1 business day, sent via WeChat or email as electronic invoice
  </Step>
</Steps>

<Info>
  We have many university and enterprise customers and can accommodate various reasonable reimbursement requirements.
</Info>

***

<Card title="Get Started" icon="rocket" href="https://api.apiyi.com">
  Register account, top up to enjoy discounts, experience 400+ AI models
</Card>
