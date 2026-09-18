> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Do I Need to Set Available Models for Tokens?

> Detailed explanation of API.YI token's available models mechanism, usage recommendations, and common scenarios

## General Case: No Need to Set

<Info>
  **Recommended Practice**: When creating a token, **there is no need to set available models**, allowing you to use all models on the site.
</Info>

Available models use a **whitelist mechanism**:

* **Not Set**: The token can call all 400+ models on the site
* **Set**: The token can only call specified models and cannot use others

If your business scenarios are diverse, setting available models will limit the token's usage scope and affect flexibility.

## Why Not Recommend Setting?

### 1. Limits Call Range

Suppose you set available models to `gpt-4o`, `claude-3-5-sonnet-20241022`, then:

* ✅ Can call: `gpt-4o`, `claude-3-5-sonnet-20241022`
* ❌ Cannot call: `gemini-2.5-pro`, `deepseek-v3`, other 400+ models

This will severely limit your business flexibility.

### 2. Model Alias Issues

<Warning>
  **Model Alias Trap**: Some models have aliases, which can easily cause errors when setting available models.

  **Case Study**:

  * **Alias**: `nano-banana-pro` (friendly nickname)
  * **Official Name**: `gemini-3-pro-image-preview` (official API name)

  If you set available models to `nano-banana-pro`, but call `gemini-3-pro-image-preview` in code, you'll get an error:

  ```
  {
    "error": {
      "message": "Model not allowed for this API key",
      "type": "invalid_request_error"
    }
  }
  ```
</Warning>

### 3. Business Scenario Changes

As your business evolves, you may need to test or switch different models:

* Switch from GPT-4 to Claude 3.5
* Test domestic models like DeepSeek, Qwen
* Try newly released Gemini 2.5

If you set available models in advance, you'll need to modify the whitelist every time, which is very troublesome.

## When Should You Set It?

Although not recommended, you can consider setting available models in the following scenarios:

### Scenario 1: Sharing Tokens with Others

<Card title="Team Collaboration/Friend Sharing" icon="users">
  If you share a token KEY with colleagues or friends and want them to **only use specific models** (such as `gpt-3.5-turbo`) to avoid consuming your balance with expensive models, you can set available models.

  **Example**:

  * Your balance is limited, you only want colleagues to use `gpt-3.5-turbo`, `gpt-4o-mini`
  * After setting available models, even if colleagues try to call `o3`, they will be rejected
</Card>

### Scenario 2: Budget Control

<Card title="Strict Cost Management" icon="dollar-sign">
  If you set a strict budget for a project and only allow using low-cost models, you can restrict through available model whitelist:

  **Example**:

  * Project budget is limited, only allow using `deepseek-v3` (\$0.07/million tokens)
  * Prohibit using `o3` (\$20/million tokens) to avoid overspending
</Card>

### Scenario 3: Security Compliance

<Card title="Enterprise Security Policy" icon="shield">
  Some enterprises have strict AI model usage regulations, only allowing use of approved models.

  **Example**:

  * Company only allows using official OpenAI models
  * Set available models to `gpt-4o`, `gpt-4.1`, prohibit using other vendor models
</Card>

## How to Set Available Models?

If you really need to set available models, follow these steps:

1. Log in to [API.YI Token Management Page](https://api.apiyi.com/token)
2. Click "Add New KEY" or edit existing token
3. Select allowed models in the "Available Models" field
4. Save configuration

<Tip>
  **Use Official Names**: When setting available models, it's recommended to use the **official names** of models (such as `gemini-3-pro-image-preview`) instead of aliases (such as `nano-banana-pro`) to avoid call failures.

  You can view all model official names on the [Model List Page](/en/api-capabilities/model-info).
</Tip>

## Summary

| Setting Method               | Advantages                                                                                            | Disadvantages                                                                                     | Applicable Scenarios                                                    |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **Not Set Available Models** | ✅ Can use all 400+ models<br />✅ No need to worry about alias issues<br />✅ High business flexibility | ❌ Cannot restrict others from using expensive models                                              | Personal use, development testing, production environment (recommended) |
| **Set Available Models**     | ✅ Strictly control model usage scope<br />✅ Prevent expensive models from consuming balance           | ❌ Limits flexibility<br />❌ May encounter alias issues<br />❌ Need to manually maintain whitelist | Shared tokens, budget control, security compliance                      |

<Info>
  **Recommended Practice**: Unless there is a clear control requirement, **do not set available models** and enjoy access to all models.
</Info>

## Related Documentation

* [How to Create KEY?](/en/faq/token-management)
* [Model List](/en/api-capabilities/model-info)
* [Pricing](/pricing)
