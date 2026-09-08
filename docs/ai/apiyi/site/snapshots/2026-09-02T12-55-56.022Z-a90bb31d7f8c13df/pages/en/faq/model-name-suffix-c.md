> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# What does the -c suffix in model names mean?

> Explains the meaning of model names with -c suffix like gemini-3-pro-image-preview-c and their billing differences

## Short Answer

<Info>
  **`-c` stands for "call" (per-call billing).**

  Model names with the `-c` suffix (e.g., `gemini-3-pro-image-preview-c`) and those without (e.g., `gemini-3-pro-image-preview`) are essentially the **same model** with identical capabilities. The only difference is the billing method: the `-c` version is specifically for **per-call billing**.
</Info>

## Official Explanation

<img src="https://mintcdn.com/apiyillc/-8MuET9SQdeEzoC1/images/model-name-suffix-c-explain.png?fit=max&auto=format&n=-8MuET9SQdeEzoC1&q=85&s=892eb766d8a1d4f3ebd5a249d21b1d5a" alt="Model name -c suffix explanation" width="1062" height="476" data-path="images/model-name-suffix-c-explain.png" />

Key points:

* `-c` stands for "call" — a separate model name for per-call billing
* It is essentially the **same model** as the version without the suffix
* Both are official API forwarding, just using different model names to distinguish billing methods
* In the future, billing may be distinguished solely through token billing modes

## Why the -c Suffix?

APIYI is rolling out token-based billing, and some models support both token-based and per-call billing methods. The system uses model name suffixes to distinguish between different billing channels:

| Model Name                     | Billing Method | Description              |
| ------------------------------ | -------------- | ------------------------ |
| `gemini-3-pro-image-preview`   | Token-based    | Charged by token usage   |
| `gemini-3-pro-image-preview-c` | Per-call       | Fixed price per API call |

<Note>
  Both names call the **exact same official model** via official API forwarding. Model capabilities and output quality are identical.
</Note>

## How to Choose?

<CardGroup cols={2}>
  <Card title="Token-based (no suffix)" icon="chart-line">
    **Best for**:

    * Requests with fewer input/output tokens
    * Precise cost control needed
    * Primarily text understanding/analysis tasks

    Use the model name without `-c`
  </Card>

  <Card title="Per-call (-c suffix)" icon="hand">
    **Best for**:

    * Image generation and fixed-output scenarios
    * Transparent, fixed cost per call
    * No need to calculate token consumption

    Use the model name with `-c`
  </Card>
</CardGroup>

<Tip>
  **Recommended**: When creating a token, select the "**Token-first**" billing mode. The system will automatically choose the most suitable billing method for you, eliminating the need to manually distinguish model name suffixes. See [Token Billing Modes](/en/faq/token-billing-modes) for details.
</Tip>

## Future Plans

<Info>
  APIYI is continuously optimizing its billing system. In the future, billing may be distinguished **solely through token billing modes**, removing the need for model name suffixes. Please follow platform announcements for updates.
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="Is the -c model the same as the one without the suffix?">
    **Yes, they are exactly the same model.**

    The `-c` suffix only identifies the billing channel and does not affect model capabilities. Both names are ultimately forwarded to the same official API, with identical output quality.
  </Accordion>

  <Accordion title="Which model name should I use?">
    It depends on your token's billing mode:

    * **Token-first token**: Use the name without suffix (e.g., `gemini-3-pro-image-preview`), the system handles it automatically
    * **Per-call token**: Use the name with `-c` (e.g., `gemini-3-pro-image-preview-c`)
    * **Unsure**: We recommend using a "Token-first" token + model name without suffix
  </Accordion>

  <Accordion title="Do all models have a -c version?">
    No. Only models that support both token-based and per-call billing have a `-c` suffix version. Pure text models (such as GPT-4o, Claude) typically only support token-based billing and won't have a `-c` version.
  </Accordion>

  <Accordion title="Will the -c suffix always exist?">
    APIYI is adjusting its billing system and may no longer need model name suffixes to distinguish billing methods in the future, switching to full control through token billing modes. We recommend using "Token-first" tokens so you won't be affected by future changes.
  </Accordion>
</AccordionGroup>

## Related Documentation

<CardGroup cols={2}>
  <Card title="Token Billing Modes Explained" icon="calculator" href="/en/faq/token-billing-modes">
    Learn the differences between the 5 billing modes including Token-first and Per-call
  </Card>

  <Card title="How to Create Tokens?" icon="key" href="/en/faq/token-management">
    Complete guide to creating and managing API tokens
  </Card>
</CardGroup>
