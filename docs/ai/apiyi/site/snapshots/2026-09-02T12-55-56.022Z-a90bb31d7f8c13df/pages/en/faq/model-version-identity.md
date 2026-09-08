> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Why Don't AI Models Know Their Own Version?

> Explains why AI models can't accurately identify their version when called via API, and the difference between web apps and API calls

## Short Answer

<Info>
  **This is completely normal and does not affect model capabilities.**

  A model's name is assigned after training is complete — the model itself never "learned" its own identity. Official web apps (like claude.ai or chatgpt.com) can answer correctly because they include a built-in System Prompt that tells the model "who it is." API calls don't include this information by default, so the model will "guess wrong" about its version.
</Info>

## Real-World Example

<Warning>
  **Common Scenario**

  When calling Claude Sonnet 4.5 via API and asking "What model are you?", it might reply "I am Claude 3.5 Sonnet." This **does not mean** you called the wrong model — the model simply doesn't know its own name.

  The same thing happens with GPT-4o, Gemini, and all other models — this is a universal characteristic of large language models, not an issue specific to APIYI.
</Warning>

## Simple Analogy

<Card title="The Actor Analogy" icon="drama">
  Imagine a highly skilled actor:

  * Their **skills** come from years of training (like a model's training process)
  * Their **character name** is told to them by the director before filming (like a System Prompt)
  * If nobody tells them what role they're playing, they're still talented but **don't know their own character name**

  AI models work the same way: their capabilities come from training data, but the identity "I am Claude Sonnet 4.5" needs to be explicitly provided.
</Card>

## Technical Explanation

<AccordionGroup>
  <Accordion title="Why doesn't the model know its own name?">
    **Model naming happens after training**

    The development process for a large language model is:

    1. **Collect data** → Prepare training corpus
    2. **Train the model** → Learn language understanding and generation
    3. **Evaluate and fine-tune** → Optimize model performance
    4. **Name and release** → Assign a name (e.g., "Claude Sonnet 4.5")

    When training completes at step 2, the name from step 4 doesn't exist yet. The training data may contain names of older model versions (like Claude 3.5 Sonnet), so when asked, the model "guesses" a name it has seen before.

    **Analogy**: It's like how a person can't know their name before birth — the name is given after they're born.
  </Accordion>

  <Accordion title="Why can official web apps answer correctly?">
    **The role of built-in System Prompts**

    When you chat on claude.ai or chatgpt.com, the official web app automatically injects a hidden System Prompt at the beginning of each conversation, something like:

    ```
    You are Claude, developed by Anthropic. Your model version is Claude Sonnet 4.5...
    ```

    This prompt is invisible to users, but the model "reads" it and therefore knows who it is.

    **So**: the model doesn't inherently know its own name — the official web app "reminds" it every time.
  </Accordion>

  <Accordion title="Why is the API different?">
    **API calls don't include identity information by default**

    When calling a model via API, you only send:

    * The `model` parameter (tells the server which model to use)
    * The `messages` array (your conversation content)
    * An optional `system` parameter (your custom system prompt)

    The `model` parameter is routing information for the **server** — the model itself cannot read this field. If you don't specify the model's identity in the `system` prompt, it can only "guess" based on its training data.

    **This applies to all API platforms** — whether it's the official API, APIYI, or any other provider, the behavior is exactly the same.
  </Accordion>
</AccordionGroup>

## How to Verify the Model You're Actually Calling

<CardGroup cols={2}>
  <Card title="Check Call Logs" icon="file-text" href="/en/faq/call-logs">
    In the APIYI console's **Call Logs**, you can see the actual model name used for each request — this is the most accurate verification method.
  </Card>

  <Card title="Check API Response" icon="code">
    Every API response JSON includes a `model` field that clearly identifies the actual model version called.

    ```json theme={null}
    {
      "model": "claude-sonnet-4-5-20250514",
      "choices": [...]
    }
    ```
  </Card>
</CardGroup>

## APIYI Service Guarantee

<Tip>
  **APIYI forwards requests through official channels — model quality is identical to the source.**

  * APIYI directly forwards requests to official APIs from OpenAI, Anthropic, Google, etc.
  * Models not knowing their own identity is a universal phenomenon across all API platforms
  * You can verify the actual model called through call logs and the `model` field in API responses
  * If you have any doubts, feel free to contact our technical team for verification
</Tip>

## How to Make Models Correctly Identify Themselves

Simply add a `system` parameter to your API call to tell the model its identity:

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://vip.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="claude-sonnet-4-5-20250514",
    messages=[
        {
            "role": "system",
            "content": "You are Claude Sonnet 4.5, an AI assistant developed by Anthropic."
        },
        {
            "role": "user",
            "content": "What model are you?"
        }
    ]
)

print(response.choices[0].message.content)
# Output: I am Claude Sonnet 4.5, developed by Anthropic.
```

<Info>
  **Tip**: This works exactly the same way as the official web apps — telling the model its identity via System Prompt. Once added, the model can correctly answer "who am I."
</Info>

## Related Questions

<CardGroup cols={2}>
  <Card title="How to Choose the Right Model?" icon="compass" href="/en/faq/model-selection-guide">
    Learn about different models' features and use cases
  </Card>

  <Card title="Why Are Some Models Unavailable?" icon="lock" href="/en/faq/model-availability">
    Learn about model permissions and user tiers
  </Card>

  <Card title="How to View Call Logs?" icon="file-text" href="/en/faq/call-logs">
    Verify the actual model version called
  </Card>

  <Card title="API Call Errors?" icon="triangle-alert" href="/en/faq/invalid-api-key">
    Common API error troubleshooting guide
  </Card>
</CardGroup>

## Contact Us

<CardGroup cols={2}>
  <Card title="Enterprise WeChat" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="Enterprise WeChat QR Code" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    Scan QR code or [Click to contact support](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    Model verification, technical support
  </Card>

  <Card title="Email" icon="mail">
    **Support**: [support@apiyi.com](mailto:support@apiyi.com)

    **Business**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
