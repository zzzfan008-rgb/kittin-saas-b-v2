> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Fable 5 Is Live: Mythos-Class Power, 30-Day Data Retention

> Anthropic's new flagship Claude Fable 5 is here, SOTA across software engineering and vision. claude-fable-5 is live on APIYI at official pricing ($10/$50 per 1M tokens). Important: Fable 5 and Mythos 5 follow a 30-day input/output data retention compliance requirement.

## Key Takeaways

* **Mythos-class flagship**: Claude Fable 5 hits SOTA on nearly all tested benchmarks, with standout software engineering and vision capabilities
* **Long-running + self-evolving**: Supports long-running, asynchronous execution; self-updates skills based on learnings and builds its own harnesses for sustained complex work
* **Strong vision understanding**: Reads diagrams, charts, and tables in files and PDFs — ideal for research and document-heavy work
* **Pricing matches official**: `claude-fable-5` is live on APIYI at \$10 input / \$50 output per 1M tokens
* **⚠️ 30-day data retention compliance**: Because of their advanced capabilities, Fable 5 and Mythos 5 retain inputs and outputs for 30 days for serious-abuse detection — read the compliance note below

## Background

In June 2026, Anthropic released its next-gen flagship Claude Fable 5, alongside the more capable, vetted-customers-only Mythos 5. Anthropic positions Fable 5 as next-generation intelligence for knowledge work and coding, reaching SOTA on nearly all tested benchmarks with exceptional software engineering and vision.

Unlike previous models, Fable 5 and Mythos 5 are **Mythos-class models**: because they are more capable and carry higher potential for misuse, Bedrock and Anthropic enforce **additional high-risk misuse checks** and a **30-day data retention compliance requirement** for both models. This is essential context before adopting Fable 5.

`claude-fable-5` is now live on APIYI at pricing identical to the official rates.

## Data Retention & Compliance (Important)

<Warning>
  **30-day data retention applies to Fable 5 and Mythos 5**

  With Anthropic's release of Claude Fable 5 and Mythos 5, and because of these advanced models' capabilities, Bedrock and Anthropic are enforcing additional checks for high-risk misuse activity. For Fable 5 and Mythos 5, **inputs and outputs will be retained for 30 days** to detect serious abuse.

  * **Default access**: Retained data is **accessed only by automated safety systems**; Anthropic human review happens **only when those systems flag potential harm**.
  * **Human review scope**: Anthropic reviewers may access inputs and outputs associated with the relevant account, but **only to the extent needed to complete the review**.
  * **Cross-account review**: If traffic from multiple accounts is flagged for the **same prohibited activity**, Anthropic may review that flagged traffic together in a single review.
</Warning>

<Info>
  **Retention is by AWS / Anthropic, not APIYI**: the 30-day retention above happens on **AWS Bedrock and Anthropic's official side** (passed through to Anthropic for abuse detection). **APIYI itself retains no data — it is a pure transparent proxy** that only forwards requests. Also, **only Fable 5 and Mythos 5 are subject to this retention; all other Claude models (e.g. Opus 4.8 / Sonnet 4.6) do not retain data.**
</Info>

<Info>
  Further reading (copy into your browser):

  * Anthropic on human review and data retention: `support.claude.com/en/articles/15425996`
  * AWS official blog (Fable 5 on AWS): `aws.amazon.com/blogs/aws/anthropic-claude-fable-5-on-aws-mythos-class-capabilities-with-built-in-safeguards-now-available/`
</Info>

## Deep Dive

### Core Features

<CardGroup cols={2}>
  <Card title="Near-universal SOTA" icon="trophy">
    State-of-the-art on nearly all tested benchmarks, with standout software engineering and vision
  </Card>

  <Card title="Long async execution" icon="clock">
    Long-running, asynchronous execution for sustained complex Agent workflows
  </Card>

  <Card title="Self-updating skills" icon="wand-sparkles">
    Self-updates skills based on learnings and develops its own harnesses, cutting setup cost
  </Card>

  <Card title="Strong vision" icon="image">
    Understands diagrams, charts, and tables in files and PDFs for research-heavy work
  </Card>
</CardGroup>

### Built-in Safety Guardrails

Fable 5 ships with guardrails: harmful prompts in high-risk domains (**cybersecurity, biology, chemistry, health**) are automatically **redirected (fallback) to Claude Opus 4.8**. The fully unrestricted Mythos 5 is available **only to a small group of vetted customers**.

<Info>
  On billing: when a harmful prompt triggers fallback to Opus 4.8, it is charged at **Opus rates**; mixed-token requests are charged Fable rates initially, then Opus rates for subsequent tokens after fallback. Final billing follows live platform data.
</Info>

### Specs

| Parameter           | Spec                                                     |
| ------------------- | -------------------------------------------------------- |
| **Model ID**        | `claude-fable-5`                                         |
| **Model tier**      | Mythos-class                                             |
| **Data retention**  | Inputs/outputs retained 30 days (abuse detection)        |
| **Safety fallback** | High-risk harmful prompts fall back to `claude-opus-4-8` |
| **API formats**     | OpenAI-compatible / Anthropic native                     |
| **Channels**        | Anthropic API, AWS Bedrock, APIYI                        |

## Usage

### Recommended Scenarios

1. **Complex software engineering**: repo-scale coding, cross-file refactors, architecture decisions
2. **Long-horizon Agent tasks**: long async execution and self-updating research/code agents
3. **Document & vision-heavy work**: research analysis over PDFs with charts, tables, and diagrams
4. **Hard reasoning tasks**: leverage the judgment of a Mythos-class flagship

### Code Examples

#### OpenAI format

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="claude-fable-5",
    messages=[
        {
            "role": "user",
            "content": "Review this codebase architecture and flag risks and refactor suggestions."
        }
    ]
)

print(response.choices[0].message.content)
```

#### Anthropic native format

```python theme={null}
import anthropic

client = anthropic.Anthropic(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com"
)

message = client.messages.create(
    model="claude-fable-5",
    max_tokens=8192,
    messages=[
        {
            "role": "user",
            "content": "Trace the root cause of this production bug step by step and propose a fix."
        }
    ]
)

print(message.content[0].text)
```

### Best Practices

1. **Compliance first**: brief your team on the 30-day data retention requirement before adoption; handle sensitive data per your internal compliance policy.
2. **Pick by task**: use `claude-fable-5` for hard coding/Agent tasks; for cost-sensitive routine work, consider `claude-opus-4-8` or the Sonnet line.
3. **Leverage vision**: feed chart-heavy PDFs directly for research and document parsing.

## Pricing & Availability

### Pricing

| Item       | Claude Fable 5   | Note             |
| ---------- | ---------------- | ---------------- |
| **Input**  | \$10 / 1M tokens | Matches official |
| **Output** | \$50 / 1M tokens | Matches official |

<Info>
  APIYI `claude-fable-5` pricing matches Anthropic's official rates exactly (\$10 / \$50 per 1M tokens). Final billing follows live platform data.
</Info>

### Stack with Top-up Promotions

Combine with APIYI top-up bonus promotions to lower your effective cost — see `docs.apiyi.com/faq/recharge-promotions`.

### How to Access

**APIYI platform**:

* Website: `apiyi.com`
* OpenAI format: `https://api.apiyi.com/v1`
* Anthropic native format: `https://api.apiyi.com`
* Model name: `claude-fable-5`

## Summary & Recommendations

Claude Fable 5 is Anthropic's new Mythos-class flagship — SOTA across software engineering and vision, with long async execution and self-updating skills. `claude-fable-5` is live on APIYI at official pricing (\$10/\$50).

**Read before adoption**:

* **30-day data retention**: Fable 5 and Mythos 5 retain inputs/outputs for 30 days for abuse detection; by default only automated safety systems access it, with human review only when potential harm is flagged. **Retention happens on the AWS / Anthropic side — APIYI is a pure transparent proxy and retains no data; other Claude models are unaffected.**
* **Safety fallback**: harmful prompts in high-risk domains fall back to Opus 4.8 and are charged at Opus rates.

<Info>
  Sources: Anthropic official note (`support.claude.com/en/articles/15425996`), AWS official blog (published June 2026). APIYI pricing follows live platform data. Retrieved: June 10, 2026.
</Info>
