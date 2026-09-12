> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Why can't I run requests with remaining balance?

> APIYI balance insufficiency troubleshooting guide, understanding request pre-deduction mechanism and token length solutions

## Request Pre-Deduction Mechanism

APIYI uses a **request pre-deduction** mechanism, where estimated fees are deducted in advance when sending requests. If the current balance is insufficient to support the request, even if there is some balance in the account, the request will fail.

<Warning>
  **Pre-Deduction Explanation**

  The system estimates the maximum possible cost for this request based on input content complexity. If the estimated cost exceeds the current balance, the request cannot be executed.
</Warning>

## Common Cause Analysis

### 1. Input Content Token Overrun

**Image Content**

* Uploaded complex images (high resolution, multiple images)
* PDFs with many pages or complex documents
* Abundant visual content like charts, screenshots

**Text Content**

* Enabled web search plugins in third-party software
* Passed entire codebase (multiple directories and files)
* Long documents or large amounts of code

### 2. Exceeding Model Context Limits

These excessive contents may cause:

* **Exceeding the entire context of the current model** (input + output total)
* **Exceeding your current APIYI balance**
* **Request pre-deduction amount too high**

<Info>
  **Context Calculation**

  Model context limit = Input Token + Output Token total

  Example: If a model supports 128K context and your input already uses 100K tokens, output can have at most 28K tokens.
</Info>

## Solutions

### 1. Check Input Content

**Optimize Input**

* Compress or reduce image size
* Process large files in batches
* Disable unnecessary web search features
* Only pass relevant code files, not entire projects

**Content Segmentation**

* Split long documents into multiple parts
* Upload multiple images in batches
* Process code files one by one

### 2. Check Account Balance

**Balance Viewing**

* Log into console to view current balance
* Confirm balance is sufficient to pay estimated fees
* Consider recharging for more adequate balance

### 3. Choose Appropriate Model

**Recommended Test Models**

* `gpt-4o-mini` - Cheap price, suitable for testing
* `gpt-3.5-turbo` - Low-cost option
* `claude-3-haiku` - Fast and economical model

<Tip>
  **Cost Optimization Suggestion**

  First test your input content with cheaper models to confirm it's reasonable, then switch to higher-end models after confirmation.
</Tip>

### 4. Analyze Token Usage

**Token Calculation Tools**

* Use online Token calculators to estimate content length
* Check Token usage statistics from API returns
* Compare Token consumption of different content

## Technical Support

If the problem persists after following the above methods, contact technical customer service for help:

<Card title="Enterprise WeChat" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
  <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="Enterprise WeChat QR Code" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

  Scan QR code or [Click to contact support](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

  Please provide the following information for quick diagnosis:

  * Account balance screenshot
  * General description of input content
  * Model name used
  * Error message screenshot
</Card>

## Prevention Measures

### 1. Content Preprocessing

* Evaluate content complexity before sending
* Use compression tools to optimize file size
* Extract key information rather than full content

### 2. Balance Management

* Maintain sufficient account balance
* Set balance alert reminders
* Regularly review consumption records

### 3. Model Selection

* Choose appropriate model based on task complexity
* Use economical models for simple tasks
* Consider high-end models for complex tasks only

## Common Error Messages

* `Insufficient balance for this request` - Insufficient balance
* `Input too long` - Input content too long
* `Context length exceeded` - Context limit exceeded
* `Request timeout` - Request timeout (usually due to content being too long)
