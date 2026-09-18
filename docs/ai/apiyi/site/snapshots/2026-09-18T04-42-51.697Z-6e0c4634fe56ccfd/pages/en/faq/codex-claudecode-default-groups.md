> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# How Do the Codex, ClaudeCode, and Default Groups Differ?

> Explains the upstream source, protocol, and recommended development use cases for the CodexReverse, ClaudeCode, and Default token groups.

## Short Answer

The three groups mainly differ in their **upstream source, request protocol, and intended tools**:

* **CodexReverse**: A reverse-engineered Codex resource channel for everyday Codex development, with normal usability and a high cache-hit rate
* **ClaudeCode**: A dedicated group for Claude Code and environments using Anthropic's native `/v1/messages` protocol
* **Default**: A general official-relay group for mixed access to GPT, Claude, Gemini, DeepSeek, and other models

## Which Group Should I Use?

| Group          | Main characteristics                                                                                     | Recommended use                                                                                           |
| -------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `CodexReverse` | An economical reverse-engineered Codex channel with a different source from official API relay resources | Codex CLI, Codex coding tasks, and cost-sensitive development                                             |
| `ClaudeCode`   | Aggregates models compatible with Anthropic's native `/v1/messages` protocol                             | Claude Code, Anthropic-native clients, and compatible coding models used inside Claude Code               |
| `Default`      | General official-relay resources with broad model coverage                                               | Mixed development, production workloads prioritizing stability, and one token for multiple model families |

<Info>
  **“Official relay” and “reverse-engineered” describe different upstream resource sources.** `Default` uses official API relay resources, while `CodexReverse` uses reverse-engineered Codex resources. Both can work normally, but production stability, pricing, cache behavior, and model availability may differ.
</Info>

## Recommended Setup for Daily Development

If you use both Codex and Claude Code, keeping two separate tokens is a sensible setup:

* Use the `CodexReverse` token in Codex
* Use the `ClaudeCode` token in Claude Code
* Keep an additional `Default` token if other applications need mixed access to multiple model providers

This avoids mixing protocols and routes, while keeping usage logs and costs easier to review.

<Warning>
  Groups affect model availability, routing, and billing multipliers. `CodexReverse` is not the same as an official API relay resource. For production workloads with strict stability or source-compliance requirements, prefer the `Default` official-relay group and validate it with your actual workload.
</Warning>

## Related Documentation

* [What Are Groups?](/en/faq/groups-explained)
* [Tokens and Groups](/en/faq/token-and-groups)
* [Codex CLI Integration Guide](/en/scenarios/programming/codex-cli)
* [Claude Code Integration Guide](/en/scenarios/programming/claude-code)
