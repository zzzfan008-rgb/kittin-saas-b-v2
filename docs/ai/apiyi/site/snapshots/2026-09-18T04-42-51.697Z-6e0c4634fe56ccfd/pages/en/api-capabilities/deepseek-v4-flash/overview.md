> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash Text Generation

> DeepSeek V4 Flash GA: 1M context, 284B total / 13B activated MoE, both endpoints available. On APIYI at $0.44 input / $1.32 output per 1M tokens — DeepSeek bills peak/off-peak, APIYI bills the peak tier at all times — with a measured 322K-token context answered in 15 seconds.

DeepSeek V4 Flash GA (`deepseek-v4-flash-ga-260731`) corresponds to `DeepSeek-V4-Flash-0731`,
the open-source checkpoint DeepSeek promoted to general availability on July 31, 2026. The
architecture matches the April preview (284B total / 13B activated MoE, 1M context) and
DeepSeek states only the post-training stage was redone — yet agent benchmarks improved
sharply. APIYI has completed **21 test cases plus a dedicated dual-endpoint retest**;
both Chat Completions and Responses are callable directly.

<Info>
  **APIYI has launched DeepSeek V4 Flash GA**: model name `deepseek-v4-flash-ga-260731`,
  available on the `default` / `svip` groups. Note that this model **thinks a lot by default** —
  pass `thinking: {"type": "disabled"}` explicitly for simple tasks (see "Thinking control" below).
</Info>

## Key Advantages

<CardGroup cols={2}>
  <Card title="1M context that holds up" icon="scroll-text">
    Hard input ceiling of 1,048,570 tokens. A 322K-token needle-in-a-haystack test returned in 14.77s with a correct hit; max output is 393,216 tokens.
  </Card>

  <Card title="Two caching layers" icon="database-zap">
    Implicit cache needs no configuration and hits 99.9% on round two; Responses adds chained explicit caching that hits the entire prior context.
  </Card>

  <Card title="Concurrency without throttling" icon="gauge">
    All 20 parallel requests returned 200, with wall-clock only 1.3s above a single call — suited to high-concurrency agents and batch text jobs.
  </Card>

  <Card title="Pricing" icon="circle-dollar-sign">
    \$0.44 input / \$1.32 output per 1M tokens, with cache hits as low as \$0.0136. DeepSeek moved to two-tier peak/off-peak billing on 17 August 2026; APIYI bills the peak tier at all times.
  </Card>
</CardGroup>

## Model Information

| Parameter                            | Value                                                     |
| ------------------------------------ | --------------------------------------------------------- |
| **Model name**                       | `deepseek-v4-flash-ga-260731`                             |
| **Released**                         | July 31, 2026 (preview promoted to GA)                    |
| **Architecture**                     | 284B total / 13B activated, MoE                           |
| **Context window**                   | 1M (measured hard ceiling 1,048,570 tokens)               |
| **Max output**                       | 384K (measured hard ceiling 393,216 tokens)               |
| **Available groups**                 | `default`, `svip`                                         |
| **Endpoints**                        | `POST /v1/chat/completions`, `POST /v1/responses`         |
| **Deep thinking**                    | On by default and verbose; `thinking.type` can disable it |
| **Streaming**                        | ✅ both endpoints                                          |
| **Function calling / tool use**      | ✅ both endpoints                                          |
| **Image input**                      | ❌ text-only model                                         |
| **Anthropic endpoint / Claude Code** | ❌ not wired — use `deepseek-v4-flash` if needed           |

## Measured Capability Matrix

Results from APIYI testing on August 5, 2026 (official claims vs actual behavior):

| Capability                       | Official      | Chat Completions                     | Responses                                   |
| -------------------------------- | ------------- | ------------------------------------ | ------------------------------------------- |
| Basic chat (non-stream / stream) | ✅             | ✅ / ✅ (TTFB 1.43s)                   | ✅ / ✅ (TTFB 2.31s)                          |
| Function Call (two-round loop)   | ✅             | ✅                                    | ✅                                           |
| Thinking toggle `thinking.type`  | ✅             | ✅ disabled / enabled / auto all work | ✅ emits reasoning items                     |
| Reasoning tiers                  | ✅             | ⚠️ only `minimal` is deterministic   | ⚠️ same                                     |
| Implicit cache                   | ✅             | ✅ 99.9% hit on round two             | ✅ 99.9% hit                                 |
| Explicit cache                   | ✅ (Responses) | —                                    | ✅ requires `previous_response_id` chaining  |
| Structured output                | ❌             | ❌ accepted, not enforced             | ❌ accepted, not enforced                    |
| Online search                    | ✅ (Responses) | —                                    | ⚠️ wired, but backend failed 6/6            |
| MCP                              | ✅ (Responses) | —                                    | ❌ `AccessDenied`, account-level entitlement |
| Image input                      | —             | ❌                                    | ❌ explicit error                            |

<Warning>
  **Three capabilities do not match the official sheet — know these before integrating**:
  structured output fails silently on both endpoints (returns 200 while ignoring the schema
  entirely — use Function Call when you need enforcement); the online search tool is wired but
  its backend keeps erroring and returns no `results`; MCP returns `AccessDenied`
  (an account-level built-in-tool entitlement, not a model limitation).
</Warning>

## Thinking Control

This model **thinks a lot by default** — a one-line question like "is 9.11 bigger than 9.9"
consumed 263 reasoning tokens in our tests (the sibling `deepseek-v4-flash` used only 44).
Disable it explicitly for simple tasks:

```python theme={null}
extra_body={"thinking": {"type": "disabled"}}   # reliably off
# or
extra_body={"reasoning_effort": "minimal"}      # 0 reasoning tokens in 10/10 runs
```

<Warning>
  **`reasoning_effort` is not a monotonic ladder.** Two questions × five tiers × five samples:

  | Tier      | river median | prob median |
  | --------- | ------------ | ----------- |
  | `minimal` | **0**        | **0**       |
  | `low`     | 956          | 367         |
  | `medium`  | 506          | 193         |
  | `high`    | **97**       | **153**     |
  | `max`     | 577          | 173         |

  `high` produced less thinking than `low` on both questions, and within-tier variance
  (`low` ranged 150 to 1993) far exceeds between-tier differences.
  **Only `minimal` is reliable** — do not treat low → max as a cost dial.
</Warning>

## Caching

### Implicit cache (automatic on both endpoints)

An identical long prefix hits on the second request: a 15,634-token prefix matched 15,616
tokens (99.9%), billed at \$0.028 per million tokens.

<Tip>
  Implicit cache requires a **byte-identical prefix**. Keep anything variable — timestamps,
  random IDs, user names — at the end of the prompt, never mixed into the prefix.
</Tip>

### Explicit cache (Responses, requires chaining)

**Common mistake**: resending the same long prefix twice with `caching` set leaves
`cached_tokens` at 0. The correct pattern is to write on the first call, then chain with
`previous_response_id`:

| Round     | Call shape               | input\_tokens | cached\_tokens |
| --------- | ------------------------ | ------------- | -------------- |
| 1 (write) | `caching: enabled`       | 15,629        | 0              |
| 2         | + `previous_response_id` | 15,664        | **15,629**     |
| 3         | + `previous_response_id` | 15,701        | **15,664**     |
| 4         | + `previous_response_id` | 15,738        | **15,701**     |

## Quick Start

<CodeGroup>
  ```python Python theme={null}
  import os
  from openai import OpenAI

  client = OpenAI(
      api_key=os.environ["APIYI_API_KEY"],
      base_url="https://api.apiyi.com/v1",
  )

  resp = client.chat.completions.create(
      model="deepseek-v4-flash-ga-260731",
      messages=[{"role": "user", "content": "Explain the MoE architecture in one sentence"}],
      extra_body={"thinking": {"type": "disabled"}},
  )
  print(resp.choices[0].message.content)
  ```

  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Authorization: Bearer $APIYI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "deepseek-v4-flash-ga-260731",
      "messages": [{"role": "user", "content": "Explain the MoE architecture in one sentence"}],
      "thinking": {"type": "disabled"}
    }'
  ```

  ```javascript Node.js theme={null}
  import OpenAI from "openai";

  const client = new OpenAI({
    apiKey: process.env.APIYI_API_KEY,
    baseURL: "https://api.apiyi.com/v1",
  });

  const resp = await client.chat.completions.create({
    model: "deepseek-v4-flash-ga-260731",
    messages: [{ role: "user", content: "Explain the MoE architecture in one sentence" }],
    thinking: { type: "disabled" },
  });
  console.log(resp.choices[0].message.content);
  ```
</CodeGroup>

### Need structured output? Use Function Call

`response_format` has no effect on this model and raises no error — the easiest trap to fall
into. Tool arguments are what actually get constrained:

```python theme={null}
tools = [{
    "type": "function",
    "function": {
        "name": "submit_result",
        "description": "Submit the extracted result",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {"type": "string"},
                "temp_c": {"type": "number"},
            },
            "required": ["city", "temp_c"],
        },
    },
}]

resp = client.chat.completions.create(
    model="deepseek-v4-flash-ga-260731",
    messages=[{"role": "user", "content": "Beijing is 25 degrees today"}],
    tools=tools,
)

import json
print(json.loads(resp.choices[0].message.tool_calls[0].function.arguments))
```

## Pricing

| Item      | Price               |
| --------- | ------------------- |
| Input     | \$0.44 / M tokens   |
| Output    | \$1.32 / M tokens   |
| Cache hit | \$0.0136 / M tokens |

DeepSeek switched to two-tier billing at 00:00 on 17 August 2026 (UTC+8), with off-peak at half
the peak rate. APIYI bills the **peak tier at all times**, with no time-of-day variation — see
[the DeepSeek price change notice](/en/news/deepseek-price-increase-2026-08). Stacks with
[top-up promotions](/en/faq/recharge-promotions) to reduce your effective cost further.

<Info>
  **On "less than 1/10th of the flagship"**: the vendor's marketing compares against V4-Pro's
  preview-era \$1.74 / \$3.48. Against V4-Pro's current price (\$1.32 / \$3.96),
  this model is **roughly 1/3**, not 1/10.
</Info>

## Related Pages

<CardGroup cols={2}>
  <Card title="Chat Completions" icon="message-square" href="/en/api-capabilities/deepseek-v4-flash/chat-completions">
    OpenAI-compatible chat endpoint with an interactive playground
  </Card>

  <Card title="Responses" icon="git-fork" href="/en/api-capabilities/deepseek-v4-flash/responses">
    Responses endpoint with chained explicit caching
  </Card>

  <Card title="Launch write-up and full test data" icon="newspaper" href="/en/news/deepseek-v4-flash-ga-launch">
    Benchmarks, three-way speed comparison, and the traps we hit
  </Card>

  <Card title="Model pricing table" icon="table" href="/en/models">
    Unit prices, endpoints and groups for every model
  </Card>
</CardGroup>
