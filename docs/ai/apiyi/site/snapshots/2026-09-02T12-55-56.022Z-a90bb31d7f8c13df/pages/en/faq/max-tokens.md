> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# What is max_tokens? What Happens If Not Set?

> Learn about the max_tokens parameter, OpenAI's parameter naming evolution, default behavior when not set, and maximum output token limits for popular models.

## Quick Answer

`max_tokens` controls the maximum number of tokens the model can generate in a single response. **APIYI does not impose any additional limits on max\_tokens** — the parameter is passed directly to the upstream model. You can set it yourself; if not set, the model's default value applies.

<Info>
  **APIYI's approach**: We do not enforce any max\_tokens limit. You have full control. When not set, each model uses its own default output behavior.
</Info>

## What max\_tokens Does

`max_tokens` (maximum output tokens) is one of the most common parameters when calling LLM APIs. It tells the model: **generate at most this many tokens in your response**.

* Set it **too low**: The model may be cut off mid-response (returns `finish_reason: "length"`)
* Set it **too high**: The model won't be forced to generate that many tokens, but you may incur higher costs (some models charge per output token)
* **Not set**: Uses the model's default value (varies by provider — see table below)

<Tip>
  **Token ≠ character**. In English, roughly 1 word ≈ 1-1.5 tokens. In Chinese, roughly 1 character ≈ 1-2 tokens. 4,096 tokens is approximately 3,000 English words.
</Tip>

## OpenAI Parameter Naming Evolution

OpenAI has used different parameter names across different APIs and time periods, which can cause confusion:

| API Type             | Parameter Name          | Applicable Models                | Introduced                 |
| -------------------- | ----------------------- | -------------------------------- | -------------------------- |
| Chat Completions API | `max_tokens`            | GPT-3.5, GPT-4, GPT-4o, etc.     | Original version           |
| Chat Completions API | `max_completion_tokens` | o1, o3, o4-mini reasoning models | September 2024 (o1 launch) |
| Responses API        | `max_output_tokens`     | GPT-4o, GPT-5.4, o3, all models  | 2025                       |

### Why the Rename?

When OpenAI released the o1 reasoning model in September 2024, it introduced "hidden reasoning tokens" — the model generates extensive internal reasoning tokens that **do not appear in your response**.

The original `max_tokens` meant both "tokens generated" and "tokens you receive," but with reasoning models these are no longer equal. So OpenAI introduced `max_completion_tokens` to explicitly mean "**the cap on tokens you receive in the response**."

Later, the Responses API unified on the more intuitive name `max_output_tokens`.

<Warning>
  **Important**: When using OpenAI's o-series reasoning models (e.g., o3, o4-mini) with the Chat Completions API, you **must use `max_completion_tokens`** instead of `max_tokens`, or you'll get an error.
</Warning>

## What Happens If max\_tokens Is Not Set?

Different providers handle this differently:

| Provider                | Default Behavior When Not Set                        | Notes                                                           |
| ----------------------- | ---------------------------------------------------- | --------------------------------------------------------------- |
| **OpenAI**              | No limit (outputs until context window is exhausted) | Model decides output length naturally                           |
| **Anthropic Claude**    | ❌ **Required parameter — errors if not set**         | Claude API requires explicit `max_tokens`                       |
| **Google Gemini**       | Defaults to 8,192 tokens                             | Even if the model supports more, only 8,192 tokens are returned |
| **DeepSeek (chat)**     | Defaults to 4,000 tokens                             | Can be manually increased to 8,000                              |
| **DeepSeek (reasoner)** | Defaults to 32,000 tokens                            | Includes chain-of-thought output, max 64,000                    |

<Warning>
  **Special Note**: Anthropic Claude API's `max_tokens` is a **required parameter**. If you don't include it, the API will return an error. Always set it when using Claude models.
</Warning>

## Maximum Output Tokens Reference

Below are the maximum output token limits for popular models. **Always check the official documentation for the latest values**, as models are updated frequently.

| Model             | Model ID             | Max Output Tokens | Context Window |
| ----------------- | -------------------- | ----------------- | -------------- |
| GPT-5.4           | `gpt-5.4-2026-03-05` | 128,000           | 1,047,576      |
| GPT-4o            | `gpt-4o`             | 16,384            | 128,000        |
| o3                | `o3`                 | 100,000           | 200,000        |
| Claude Opus 4.6   | `claude-opus-4-6`    | 128,000           | 1,000,000      |
| Claude Sonnet 4.6 | `claude-sonnet-4-6`  | 64,000            | 1,000,000      |
| Gemini 3.1 Pro    | `gemini-3.1-pro`     | 65,536            | 2,000,000      |
| DeepSeek V3       | `deepseek-chat`      | 8,000             | 64,000         |
| DeepSeek R1       | `deepseek-reasoner`  | 64,000            | 64,000         |

<Info>
  **Official Documentation** (for the latest values):

  * OpenAI: `platform.openai.com/docs/models`
  * Anthropic Claude: `docs.anthropic.com/en/docs/about-claude/models`
  * Google Gemini: `ai.google.dev/gemini-api/docs/models`
  * DeepSeek: `api-docs.deepseek.com/api/create-chat-completion`
</Info>

## Recommendations

<Tip>
  **Best Practice**: We recommend **explicitly setting `max_tokens`** in every API call because:

  * Different models/providers have different defaults, which can cause unexpected truncation
  * Controls output length and prevents unnecessary token consumption
  * Claude API requires it — building a consistent habit reduces errors
  * Typical settings: general chat `2048-4096`, long-form generation `8192-16384`, code generation `4096-8192`
</Tip>

## FAQ

<AccordionGroup>
  <Accordion title="Does APIYI impose any max_tokens limit?">
    **No**. APIYI passes the `max_tokens` parameter directly to the upstream model without any additional restrictions. Whatever you set is what the upstream model receives. The only limit comes from the model's own maximum output token cap.
  </Accordion>

  <Accordion title="What if I set max_tokens higher than the model's maximum?">
    No error will occur — the model will simply generate up to its own maximum. For example, GPT-4o has a max output of 16,384 tokens; even if you set `max_tokens: 100000`, it will output at most 16,384 tokens.
  </Accordion>

  <Accordion title="What's the difference between max_tokens and max_completion_tokens?">
    They serve the same purpose — limiting output tokens. The difference is naming:

    * `max_tokens`: OpenAI's original parameter name, used for GPT series non-reasoning models
    * `max_completion_tokens`: Since September 2024, used for OpenAI's o-series reasoning models
    * `max_output_tokens`: The unified parameter name in OpenAI's Responses API

    When calling through APIYI, use the appropriate parameter name based on the model and API format you're using.
  </Accordion>

  <Accordion title="Output was truncated (finish_reason is 'length') — how to fix?">
    This means the model's output reached the `max_tokens` limit. Solutions:

    1. Increase the `max_tokens` value
    2. Optimize your prompt to get more concise responses
    3. Check that you're using the correct parameter name (o-series models require `max_completion_tokens`)
  </Accordion>
</AccordionGroup>

## Related Documentation

<CardGroup cols={2}>
  <Card title="How to Choose the Right AI Model?" icon="compass" href="/en/faq/model-selection-guide">
    Select the best model for your use case
  </Card>

  <Card title="API Concurrency Limits" icon="gauge" href="/en/faq/api-concurrency">
    Learn about concurrency limits for different models
  </Card>

  <Card title="Base URL Configuration Guide" icon="settings" href="/en/faq/base-url-config">
    How to configure APIYI Base URL in various tools
  </Card>

  <Card title="APIYI Token Management" icon="key" href="https://api.apiyi.com/token">
    Manage API keys, check usage and balance
  </Card>
</CardGroup>
