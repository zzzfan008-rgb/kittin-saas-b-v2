> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Google AI Studio Usage Guide: 3 Ways to Access Gemini Models Easily

> Google AI Studio is Google's free AI development platform, but using paid models like Nano Banana Pro requires an overseas credit card. This guide explains three solutions: API relay service (80% discount), membership proxy (¥230/month), and official subscription.

## Key Highlights

* **What is Google AI Studio**: Google's free online AI development platform for testing Gemini models directly in your browser
* **Why API Key Required**: Paid models (like Nano Banana Pro for image generation) require Google Cloud billing setup, which has high barriers
* **Solution 1: API Relay Service**: Use APIYi at 80% discount from official pricing, ideal for API integration scenarios
* **Solution 2: Membership Proxy**: Get Gemini membership via third-party proxy at ¥230/month, enjoy native interactive experience
* **Solution 3: Official Subscription**: Subscribe to Google AI Pro/Ultra directly, requires overseas payment method

## What is Google AI Studio?

### Product Overview

**Google AI Studio** is a browser-based integrated development environment (IDE) launched by Google, designed to help developers, students, and researchers quickly experience and build applications based on Gemini models. No installation required - simply visit `aistudio.google.com` to get started immediately.

### Core Features

<CardGroup cols={2}>
  <Card title="Rapid Prototyping" icon="wand-sparkles">
    * Visual prompt engineering
    * Real-time model testing
    * Conversation flow design
  </Card>

  <Card title="Multimodal Support" icon="layers">
    * Text, image, audio, video
    * File upload and analysis
    * Google Drive integration
  </Card>

  <Card title="Free to Use" icon="gift">
    * Completely free access to all models
    * 60 requests per minute
    * No credit card required (basic features)
  </Card>

  <Card title="Code Generation" icon="code">
    * Auto-generate API call code
    * Support multiple programming languages
    * One-click project export
  </Card>
</CardGroup>

### Use Cases

* **Quick Testing**: Test prompt effectiveness in AI Studio before writing code
* **Model Comparison**: Test multiple models simultaneously to choose the best fit
* **Educational Learning**: Students and teachers can learn AI development for free
* **Prototype Demos**: Showcase AI functionality prototypes to clients or teams

## Why Does Nano Banana Pro Require API Key Binding?

### What is Nano Banana Pro?

**Nano Banana Pro** is Google's latest image generation model released in November 2025, also known as **Gemini 3 Pro Image**. It can generate high-quality images at 1080p, 2K, and even 4K resolutions, making it Google's most powerful image generation model to date.

### Why is API Key Required?

Unlike text models like Gemini 2.5 Flash, **Nano Banana Pro has no free quota**. This means:

<Warning>
  **Billing Requirements**

  * Must create a Google Cloud project and enable billing
  * Must bind a valid credit card (typically requires overseas credit card)
  * Google will verify credit card validity and cardholder identity
  * Pricing: \$0.139/image (1080p/2K), \$0.24/image (4K)
</Warning>

### What are the Barriers?

Many users face the following challenges when trying to use Nano Banana Pro:

1. **Overseas Credit Card Requirement**: Google Cloud typically requires overseas credit cards (Visa, MasterCard, etc.)
2. **Strict Verification**: Google verifies cardholder identity; some cards may fail verification
3. **Complex Process**: Requires registering Google Cloud, creating projects, setting up billing accounts, etc.
4. **Exchange Rate Loss**: Foreign currency payments may incur exchange rate losses and processing fees

<Info>
  **Key Information**

  The API Key bound in Google AI Studio is actually a **Google Cloud** API Key, not a simple AI Studio Key. This means you need Google Cloud billing permissions, which is the main reason for the high barrier.
</Info>

## Three Solution Comparison

To address these barriers, we offer three solutions with different pros and cons. Choose based on your needs.

### Solution 1: API Relay Service (APIYi)

**Suitable For**: Developers, enterprise users, scenarios requiring extensive API calls

<Card title="APIYi - 80% Discount from Official Pricing" icon="star">
  **Core Advantages**

  * **Ultra-Low Pricing**: Only 20% of official pricing, significantly reducing costs
  * **No Overseas Credit Card**: Supports domestic payment methods (WeChat Pay, Alipay, etc.)
  * **Instant Access**: Register to get API Key immediately, no complex configuration
  * **High Concurrency Support**: Supports over 500 concurrent requests
  * **Stable & Reliable**: 24/7 technical support

  **Setup Steps**

  1. Visit APIYi website: `apiyi.com`
  2. Register and top up (multiple payment methods supported)
  3. Get API Key
  4. Use OpenAI SDK format (set base\_url to APIYi endpoint)

  **Code Example**

  ```python theme={null}
  import openai

  client = openai.OpenAI(
      api_key="your-apiyi-api-key",
      base_url="https://api.apiyi.com/v1"
  )

  # Call Nano Banana Pro (Gemini 3 Pro Image)
  response = client.images.generate(
      model="nano-banana-pro",
      prompt="A futuristic city with flying cars at sunset",
      size="1080p"
  )

  print(response.data[0].url)
  ```
</Card>

**Disadvantages**

* **Interface**: Cannot use Google AI Studio's native visual interface
* **Feature Limitations**: Only supports API calls, not AI Studio's advanced features (like real-time streaming, screen sharing, etc.)
* **Relay Dependency**: Depends on third-party service, requires trust in relay provider's stability

**Applicable Scenarios**

* Need to integrate into your own app or website
* Bulk image generation at scale
* Price-sensitive, want to reduce costs
* Don't need AI Studio's visual interface

### Solution 2: Membership Proxy Service

**Suitable For**: Individual users, content creators, users needing native experience

<Card title="Third-Party Membership Proxy" icon="user">
  **Core Advantages**

  * **Native Experience**: Full access to all Google AI Studio features
  * **Affordable Pricing**: Around ¥230/month, lower than official Pro subscription (¥144 official, but requires overseas payment)
  * **No Overseas Credit Card**: Bypass payment barrier through proxy service
  * **Extra Benefits**: 2TB cloud storage, Veo 2 video generation, etc.

  **Membership Benefits**

  * **Gemini Pro (¥230/month)**:
    * 100 Gemini 2.5 Pro conversations daily
    * 1000 images generated daily
    * 3 Veo 3 Fast videos daily
    * 2TB cloud storage
    * 20 Deep Research reports daily

  * **Gemini Ultra (Contact for pricing)**:
    * 500 conversations with any model daily
    * 1000 images generated daily
    * 5 Veo 3 videos daily
    * 30TB cloud storage
    * 200 Deep Research reports daily
</Card>

**Disadvantages**

* **Monthly Payment**: Requires continuous membership fees, not suitable for low-frequency use
* **Third-Party Dependency**: Relies on proxy service, involves certain risks
* **Account Security**: Need to provide Google account information, potential security concerns

**Applicable Scenarios**

* Need to use Google AI Studio's visual interface
* Frequently use Gemini for conversations, image generation, video generation
* Need not only API but complete AI tool suite
* Require native experience

### Solution 3: Official Subscription

**Suitable For**: Users with overseas payment methods, enterprise users

<Card title="Google AI Pro / Ultra - Official Subscription" icon="google">
  **Official Pricing**

  * **Google AI Pro**: \$19.99/month (approximately ¥144 RMB)
  * **Google AI Ultra**: \$249.99/month (approximately ¥1,803 RMB)

  **Subscription Method**

  1. Visit Google Gemini subscription page: `gemini.google/subscriptions/`
  2. Choose Pro or Ultra plan
  3. Bind overseas credit card or PayPal
  4. Complete payment

  **Core Advantages**

  * **Official Service**: Highest security and stability
  * **Complete Features**: All latest features available first
  * **No Intermediary Fees**: Pay directly to Google, no extra costs
</Card>

**Disadvantages**

* **Payment Barrier**: Requires overseas credit card or PayPal
* **Higher Pricing**: Ultra plan is expensive (nearly ¥2000/month)
* **Exchange Rate Fluctuation**: Foreign currency payment may be affected by exchange rates

**Applicable Scenarios**

* Already have overseas payment methods
* Enterprise users needing highest level of service guarantee
* Strict requirements for data security and privacy

## Solution Comparison Summary

| Comparison       | API Relay (APIYi)          | Membership Proxy      | Official Subscription      |
| ---------------- | -------------------------- | --------------------- | -------------------------- |
| **Price**        | 20% of official (lowest)   | ¥230/month            | \$19.99-\$249.99/month     |
| **Payment**      | Domestic payments          | Domestic payments     | Overseas card/PayPal       |
| **Interface**    | API only                   | Full native interface | Full native interface      |
| **Completeness** | API calls                  | All features          | All features               |
| **Concurrency**  | 500+                       | Depends on plan       | Depends on plan            |
| **Best For**     | Developers/API integration | Individuals/creators  | Enterprises/overseas users |
| **Barrier**      | Very low                   | Low                   | High (overseas payment)    |

## Usage Recommendations

### If You're a Developer

<Info>
  **Recommended: Solution 1 - API Relay Service (APIYi)**

  * Lowest price (20% of official)
  * High concurrency support (500+)
  * No overseas credit card required
  * Perfect for app integration
</Info>

### If You're a Content Creator

<Info>
  **Recommended: Solution 2 - Membership Proxy**

  * Full Google AI Studio experience
  * Complete suite including image, video generation, conversations
  * ¥230/month good value
  * No overseas credit card required
</Info>

### If You're an Enterprise User

<Info>
  **Recommended: Solution 3 - Official Subscription**

  * Highest level of service guarantee
  * Data security and privacy protection
  * Suitable for enterprises with overseas payment methods
  * Ultra plan for high-frequency scenarios
</Info>

## FAQ

### Q1: How does APIYi achieve 80％ discount?

APIYi achieves lower costs through bulk purchasing and optimized technical architecture. As a relay platform, it eliminates the complex process of users directly interfacing with Google Cloud, reducing operational costs.

### Q2: Is membership proxy safe?

Choosing reputable proxy services is relatively safe, but note:

* Select platforms with good reputation
* Don't use main account, recommend separate Google account
* Regularly change passwords, enable two-factor authentication

### Q3: What's the difference between free Google AI Studio and paid membership?

| Item                         | Free          | AI Pro   | AI Ultra |
| ---------------------------- | ------------- | -------- | -------- |
| Gemini 2.5 Pro conversations | 5/day         | 100/day  | 500/day  |
| Image generation             | 100/day       | 1000/day | 1000/day |
| Veo video generation         | Not supported | 3/day    | 5/day    |
| Deep Research                | 5/month       | 20/day   | 200/day  |
| Cloud storage                | 15GB          | 2TB      | 30TB     |

### Q4: How to choose the right solution?

* **Low-frequency use**: Free Google AI Studio (less than 5 conversations daily)
* **API integration**: APIYi relay (low price, high concurrency)
* **Daily creation**: Membership proxy (full experience, reasonable price)
* **Enterprise applications**: Official subscription (highest guarantee)

## Summary

Google AI Studio is a powerful AI development platform, but the overseas credit card barrier for using paid models like Nano Banana Pro stops many users. The three solutions introduced in this article each have pros and cons:

* **API Relay Service (APIYi)**: Best for developers, lowest price (80% off), but API-only
* **Membership Proxy**: Best for individuals and creators, ¥230/month, full native experience
* **Official Subscription**: Best for enterprises and users with overseas payment methods, highest security

Whichever solution you choose, you can easily experience Gemini's powerful capabilities. If you have any questions, feel free to contact our technical support team!

<Info>
  **Information Sources & Update Date**

  * Google AI Studio Official Documentation: `ai.google.dev/aistudio`
  * Nano Banana Pro Official Announcement: Google Developers Blog (November 20, 2025)
  * Gemini Subscription Plans: `gemini.google/subscriptions/`
  * Pricing Information: Google AI Studio Pricing Page
  * Data Retrieved: November 24, 2025
</Info>
