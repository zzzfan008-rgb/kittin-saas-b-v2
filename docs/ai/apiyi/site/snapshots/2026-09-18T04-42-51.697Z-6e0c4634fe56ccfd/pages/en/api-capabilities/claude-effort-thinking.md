> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Effort & Thinking Guide

> How to correctly use output_config.effort and adaptive thinking in the Anthropic native format, with full runnable examples.

This page covers how to call Claude with the **Anthropic native Messages API** (routed through the APIYI gateway to AWS Bedrock), and the correct usage of `output_config.effort` (effort level) and `thinking` (adaptive thinking).

For channels, billing, and basic onboarding, see the [Claude API Basics](/en/api-capabilities/claude) page first.

<Info>
  Applicable models: Claude Opus 4.8 / 4.7 / 4.6, Sonnet 4.6, etc. This page uses **Opus 4.8** as the example.
</Info>

## Online testing tool

Don't want to write code? Try the APIYI online reasoning tester first: pick a model and an effort level, set Max Tokens, check "return thinking summary", and compare how each effort level reasons — right in the browser.

<Card title="Reasoning Tester · APIYI Online Tool" icon="flask-conical" href="https://imagen.apiyi.com/#reasoning">
  Run Claude (plus GPT / Gemini) reasoning tests directly in the browser — no code required, just paste your APIYI key.
</Card>

<img src="https://mintcdn.com/apiyillc/243pgGcIcpapNSDI/images/claude-effort-reasoning-tool.png?fit=max&auto=format&n=243pgGcIcpapNSDI&q=85&s=5207a7ea87e733a018c55c9480d2bc64" alt="APIYI online reasoning tester: claude-opus-4-8 with effort level selector" width="1400" height="856" data-path="images/claude-effort-reasoning-tool.png" />

## Request structure

### Endpoint and headers

```
POST https://api.apiyi.com/v1/messages
```

| Header              | Value              | Notes                                     |
| ------------------- | ------------------ | ----------------------------------------- |
| `content-type`      | `application/json` | Fixed                                     |
| `anthropic-version` | `2023-06-01`       | Anthropic native version header, required |
| `x-api-key`         | `your-apiyi-key`   | Anthropic native auth                     |

<Info>
  When APIYI routes to Bedrock, **the client still uses the Anthropic native format** (`x-api-key` + `/v1/messages`); the gateway handles translation to Bedrock's `bedrock-2023-05-31` internally. You do **not** need to set `anthropic_version: bedrock-2023-05-31`.
</Info>

### Minimal request body

```json theme={null}
{
  "model": "claude-opus-4-8",
  "max_tokens": 16000,
  "messages": [
    { "role": "user", "content": "Your question" }
  ]
}
```

## effort levels

`effort` controls how many tokens Claude is willing to spend to produce a result, trading off thoroughness against speed/cost. It affects **all** token consumption: the answer, tool calls, and extended thinking.

<Warning>
  **Key rules**

  1. `effort` must go in a top-level standalone `output_config` object — **not** inside `thinking`. Misplacing it raises a `ValidationException` / 400.
  2. **No beta header needed.** Effort is now open to all supported models; `anthropic-beta: effort-2025-11-24` is no longer required.
  3. The default is `high`; setting `"high"` behaves the same as omitting `effort` entirely.
</Warning>

### Request body with effort

```json theme={null}
{
  "model": "claude-opus-4-8",
  "max_tokens": 16000,
  "output_config": {
    "effort": "medium"
  },
  "messages": [
    { "role": "user", "content": "Analyze the tradeoffs of microservices vs. a monolith" }
  ]
}
```

### Level overview

| Level    | Description                                               | Typical use                                             |
| -------- | --------------------------------------------------------- | ------------------------------------------------------- |
| `low`    | Cheapest. Major token savings, slightly lower capability. | Simple tasks, high concurrency, sub-agents              |
| `medium` | Balanced. Moderate token savings.                         | A reasonable default for most agentic workflows         |
| `high`   | Default. High capability.                                 | Complex reasoning, hard coding, quality-sensitive tasks |
| `xhigh`  | Long-horizon extended capability, between high and max.   | Long coding / agentic tasks (over 30 minutes)           |
| `max`    | Unconstrained peak capability.                            | Truly frontier problems, deepest reasoning              |

<Tip>
  **Opus 4.8 recommendation**: start coding / agentic work at `xhigh`, use `high` for other intelligence-sensitive tasks, and only drop to `medium` / `low` once your evals confirm quality holds.

  When running `xhigh` / `max`, set `max_tokens` high (64k as a starting point) to leave the model room for thinking + output.
</Tip>

### Which levels each model supports

Not every model supports every level. `xhigh` was added on Opus 4.7, and `max` is not supported on Sonnet:

| Level                     | Opus 4.6 | Opus 4.7 / 4.8 | Sonnet 4.6 |
| ------------------------- | :------: | :------------: | :--------: |
| `low` / `medium` / `high` |     ✅    |        ✅       |      ✅     |
| `xhigh`                   |     ❌    |        ✅       |      ❌     |
| `max`                     |     ✅    |        ✅       |      ❌     |

<Warning>
  Common mistake: `claude-opus-4-6` with `effort: "xhigh"`. Opus 4.6 has no `xhigh` level — use `high` / `max` instead, or switch the model to `claude-opus-4-8` to use `xhigh`.
</Warning>

## Adaptive thinking

Opus 4.7 / 4.8 use **adaptive thinking**: the model decides when and how much to think, with effort controlling depth.

```json theme={null}
{
  "model": "claude-opus-4-8",
  "max_tokens": 16000,
  "thinking": {
    "type": "adaptive",
    "display": "summarized"
  },
  "output_config": {
    "effort": "xhigh"
  },
  "messages": [
    { "role": "user", "content": "Walk through and pinpoint the root cause of this production bug" }
  ]
}
```

* `thinking.type: "adaptive"` — enables adaptive thinking (omit it and the model won't think).
* `thinking.display: "summarized"` — returns **thinking summary** blocks in the response; drop it if you don't need to surface them.
* How effort relates to thinking: `high` / `xhigh` / `max` almost always think deeply; `low` / `medium` may skip thinking on simple problems.
* The `display` default differs by model: **Opus 4.6 defaults to `summarized`**, while Opus 4.7 / 4.8 default to `omitted` (the thinking block still exists but its `thinking` text is empty, which shows up as a pause before the answer). Set `display: "summarized"` explicitly to reliably get summaries.
* There is no `-thinking` suffix model in the native API. Whether the model thinks is controlled by the `thinking` **parameter**, not a model-name suffix; any `xxx-thinking` is a third-party alias — just use the base model ID plus the `thinking` parameter.

<Warning>
  Opus 4.7 / 4.8 do **not** support `thinking.type: "enabled"` + `budget_tokens` (it returns 400). Use adaptive + effort instead.
</Warning>

### What the thinking summary actually is (important)

* The summary is **generated by Anthropic (the model/serving layer)** — not the gateway and not a separate model. The raw chain of thought is never returned verbatim; what you get is the official summary.
* You **cannot style the thinking summary via the system prompt**. `system` shapes how the model *thinks* and the style of the *final answer*; the summary is just a readable rendering of internal reasoning. Put tone, formatting, and style requirements into the constraints on the **final answer** so they show up in the `text` block.
* Don't prompt the model to output its internal reasoning verbatim in the answer — it can trigger a refusal (`stop_reason: "refusal"`, with `stop_details.category` possibly `reasoning_extraction`). To see reasoning, read the `display: "summarized"` summary instead.

<Info>
  When continuing a multi-turn conversation **on the same model**, pass the thinking blocks from the previous turn back unchanged (including the signature and empty-text blocks) — the API rejects **modified** thinking blocks. Displaying the summary is fine; editing it before passing it back is not.
</Info>

## Parsing the response

The response `content` is an array of blocks, distinguished by `type`:

```python theme={null}
for block in data["content"]:
    if block["type"] == "thinking":
        print("[Thinking summary]", block["thinking"])
    elif block["type"] == "text":
        print("[Answer]", block["text"])
```

Token usage is in the `usage` field:

```json theme={null}
{
  "usage": {
    "input_tokens": 164,
    "output_tokens": 11056,
    "service_tier": "standard"
  }
}
```

<Info>
  If `stop_reason` is `max_tokens`, the output was truncated by `max_tokens` (thinking can easily fill the budget at high effort), and the answer text may be empty — just raise `max_tokens`.
</Info>

## thinking fields under streaming (stream)

With `stream: true`, thinking content does **not** come through `delta.text` — it's a dedicated event sequence:

| Event                 | Field                                              | Notes                                                                 |
| --------------------- | -------------------------------------------------- | --------------------------------------------------------------------- |
| `content_block_start` | `content_block.type = "thinking"`                  | Thinking block starts                                                 |
| `content_block_delta` | `delta.type = "thinking_delta"` → `delta.thinking` | Incremental summary text (not `delta.text`)                           |
| `content_block_delta` | `delta.type = "signature_delta"`                   | Thinking-block signature; preserve verbatim when replaying multi-turn |
| `content_block_stop`  | —                                                  | Thinking block ends; the `text` block follows                         |

The answer text still comes through `delta.type = "text_delta"` → `delta.text`. With `display: "omitted"`, the thinking block still appears but `delta.thinking` is an empty string.

## Full runnable example

```python theme={null}
import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("APIYI_API_KEY")
BASE_URL = "https://api.apiyi.com"

resp = requests.post(
    f"{BASE_URL}/v1/messages",
    headers={
        "content-type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": API_KEY,
    },
    json={
        "model": "claude-opus-4-8",
        "max_tokens": 16000,
        "thinking": {"type": "adaptive", "display": "summarized"},
        "output_config": {"effort": "xhigh"},
        "messages": [
            {"role": "user", "content": "Analyze the tradeoffs of microservices vs. a monolith"}
        ],
    },
    timeout=300,
)

data = resp.json()
print("status:", resp.status_code, "| usage:", data.get("usage"))
for block in data.get("content", []):
    if block.get("type") == "thinking":
        print("\n[Thinking summary]\n", block.get("thinking", ""))
    elif block.get("type") == "text":
        print("\n[Answer]\n", block.get("text", ""))
```

```bash theme={null}
curl https://api.apiyi.com/v1/messages \
  -H "content-type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -H "x-api-key: your-apiyi-key" \
  -d '{
    "model": "claude-opus-4-8",
    "max_tokens": 16000,
    "thinking": { "type": "adaptive" },
    "output_config": { "effort": "xhigh" },
    "messages": [{ "role": "user", "content": "Analyze the tradeoffs of microservices vs. a monolith" }]
  }'
```

## Notes for the Bedrock route

| Item                    | Notes                                                                                                                                                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `output_config`         | **Must be passed through.** If the gateway has a `delete output_config` override rule, effort gets silently dropped (returns 200 but has no effect).                                                             |
| `effort` position       | Inside the top-level `output_config`, never inside `thinking`.                                                                                                                                                   |
| Beta header             | Not needed for effort; not needed for adaptive thinking either.                                                                                                                                                  |
| `temperature` / `top_p` | Opus 4.7 / 4.8 with adaptive thinking should use default sampling; the gateway typically strips these two params for these models — that's expected, and the client need not set them.                           |
| Invalid effort values   | Bedrock **degrades gracefully** on unknown values (returns 200), no 400. So you can't tell whether effort passes through by "does invalid error out" — check whether token counts diverge across levels instead. |

## Troubleshooting

### `"thinking.type.enabled" is not supported for this model`

The most common 400 when calling Opus 4.7 / 4.8 through the AWS (Bedrock) route:

```
status_code=400, InvokeModelWithResponseStream: ... Bedrock Runtime,
StatusCode: 400, ValidationException: "thinking.type.enabled" is not supported
for this model. Use "thinking.type.adaptive" and "output_config.effort" to
control thinking behavior.
```

**Cause**: the request body still uses the old fixed-budget thinking form `thinking: { "type": "enabled", "budget_tokens": N }`. Opus 4.7 / 4.8 (and newer models) have **removed** it and support adaptive thinking only; the AWS upstream returns a `ValidationException` 400. This matches the note in the [Adaptive thinking](#adaptive-thinking) section above.

<Warning>
  The `thinking.type.enabled` in the error refers to your request's `thinking.type` field being set to `"enabled"`. Likewise `budget_tokens` is no longer supported; `temperature` / `top_p` / `top_k` are also removed on these models and will 400 if sent.
</Warning>

**Fix**: drop `type: "enabled"` and `budget_tokens`, and use `adaptive` + `output_config.effort` to control thinking depth.

```json theme={null}
{
  "model": "claude-opus-4-8",
  "max_tokens": 16000,
  "thinking": { "type": "adaptive", "display": "summarized" },
  "output_config": { "effort": "xhigh" },
  "messages": [
    { "role": "user", "content": "Your question" }
  ]
}
```

| Old form (400s)                                            | New form                                                            |
| ---------------------------------------------------------- | ------------------------------------------------------------------- |
| `"thinking": { "type": "enabled", "budget_tokens": 8000 }` | `"thinking": { "type": "adaptive" }`                                |
| Control thinking via `budget_tokens`                       | Control via `output_config.effort` (`low` – `max`)                  |
| `temperature` / `top_p` / `top_k`                          | Just remove them — steer with the prompt, no sampling params needed |

<Info>
  To run without thinking: Opus 4.7 / 4.8 accept `thinking: { "type": "disabled" }`, or simply omit the `thinking` field (no field = no thinking).
</Info>

## References

* Anthropic — Effort docs: `platform.claude.com/docs/en/build-with-claude/effort`
* AWS Bedrock — Adaptive thinking: `docs.aws.amazon.com/bedrock/latest/userguide/claude-messages-adaptive-thinking.html`
* AWS Bedrock — Claude Opus 4.8: `docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-opus-4-8.html`
