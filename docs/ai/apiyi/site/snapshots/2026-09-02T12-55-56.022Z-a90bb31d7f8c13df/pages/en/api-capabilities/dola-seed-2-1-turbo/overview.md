> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seed 2.1 Turbo Text Generation

> ByteDance Seed 2.1 Turbo, a production-grade text model: 256K context, controllable deep thinking, two-layer caching. APIYI serves both Chat Completions and Responses endpoints at $0.50 input / $2.50 output per 1M tokens.

Seed 2.1 Turbo (`dola-seed-2-1-turbo-260628`) is a production-grade text model released by ByteDance's Seed team on June 23, 2026 (BytePlus product name: Dola-Seed-2.1-turbo). It targets low-cost, low-latency enterprise workloads at high request volume, with a family-rated 256K context window. APIYI has **fully verified both endpoints** (15/15 test cases passed) — Chat Completions and Responses are both ready to call.

<Info>
  **Seed 2.1 Turbo is live on APIYI**: model name `dola-seed-2-1-turbo-260628`, available on the `default` / `svip` groups. One thing sets it apart from most models — **deep thinking is ON by default**. For latency- or cost-sensitive calls, explicitly pass `thinking: {"type": "disabled"}` (see "Controlling Deep Thinking" below).
</Info>

## Key Strengths

<CardGroup cols={2}>
  <Card title="Production-grade pricing" icon="circle-dollar-sign">
    \$0.50 input / \$2.50 output per 1M tokens — half the price of the same-generation Seed 2.1 Pro, built for high-frequency calls.
  </Card>

  <Card title="Two native endpoints" icon="git-fork">
    Both Chat Completions and Responses are natively supported: event streams, reasoning items, and multi-turn previous\_response\_id all work on the Responses side.
  </Card>

  <Card title="Controllable deep thinking" icon="brain">
    A thinking switch plus reasoning\_effort tiers (low vs high differs 4x in measured reasoning tokens) let you budget thinking per task.
  </Card>

  <Card title="Two-layer caching" icon="database-zap">
    Implicit caching hits automatically from the 2nd request; explicit caching on Responses with chained calls hits the full previous context and roughly halves latency.
  </Card>
</CardGroup>

## Model Information

| Parameter                       | Value                                                                  |
| ------------------------------- | ---------------------------------------------------------------------- |
| **Model name**                  | `dola-seed-2-1-turbo-260628`                                           |
| **Release date**                | June 23, 2026 (ByteDance Seed team)                                    |
| **Context window**              | 256K (family-rated)                                                    |
| **Available groups**            | `default`, `svip`                                                      |
| **Endpoints**                   | `POST /v1/chat/completions`, `POST /v1/responses`                      |
| **Deep thinking**               | ON by default; toggle via `thinking.type`, tier via `reasoning_effort` |
| **Streaming**                   | ✅ both endpoints                                                       |
| **Function calling / tool use** | ✅ both endpoints                                                       |

## Verified Capability Matrix

APIYI's measured results as of July 21, 2026 (official claims vs actual behavior):

| Capability                                        | Official claim     | Chat Completions                   | Responses                                    |
| ------------------------------------------------- | ------------------ | ---------------------------------- | -------------------------------------------- |
| Basic chat (non-stream / stream)                  | ✅                  | ✅ / ✅                              | ✅ / ✅ (full event stream)                    |
| Structured output (json\_schema, strict)          | ✅                  | ✅                                  | ✅ (`text.format`)                            |
| Thinking switch `thinking.type`                   | ✅                  | ✅ toggle works                     | reasoning items by default                   |
| Thinking tiers `reasoning_effort`                 | ✅                  | ✅ low/high measured 226/960 tokens | ✅ low/high measured 371/1317 tokens          |
| Function calling (two-turn loop)                  | ✅                  | ✅                                  | ✅                                            |
| Implicit caching                                  | ✅                  | ✅ hits on 2nd request              | ✅ hits on 2nd request                        |
| Explicit caching                                  | ✅ (Responses only) | —                                  | ✅ requires `previous_response_id` chaining   |
| Multi-turn `previous_response_id`                 | —                  | —                                  | ✅                                            |
| MCP                                               | ✅ (Responses only) | —                                  | officially supported, not yet verified by us |
| Web search / knowledge base / fine-tuning / batch | ❌                  | —                                  | —                                            |

## Pricing

| Item   | APIYI price        |
| ------ | ------------------ |
| Input  | \$0.50 / 1M tokens |
| Output | \$2.50 / 1M tokens |

<Info>
  **Billing note**: reasoning content is billed as regular output tokens — which is exactly why you should budget thinking depth per task. Top-up bonuses lower the effective cost further, see [Recharge Promotions](/en/faq/recharge-promotions).
</Info>

## Controlling Deep Thinking

**This is the single most important thing about this model**: deep thinking is on by default, so even a one-line question first produces hundreds of tokens of reasoning. In our tests, a one-sentence self-introduction consumed 444 output tokens (409 of them reasoning) and took 7–19 seconds non-streaming.

<Warning>
  For latency- or cost-sensitive workloads (support bots, high-frequency short Q\&A, batch jobs), explicitly pass `"thinking": {"type": "disabled"}`. Measured result: reasoning tokens drop to zero and responses get dramatically faster.
</Warning>

### Three thinking tiers, measured

| Setting                          | Reasoning tokens (measured) | Best for                                        |
| -------------------------------- | --------------------------- | ----------------------------------------------- |
| `thinking: {"type": "disabled"}` | 0                           | high-frequency short Q\&A, cost-sensitive calls |
| `reasoning_effort: "low"`        | Chat 226 / Responses 371    | routine reasoning tasks                         |
| `reasoning_effort: "high"`       | Chat 960 / Responses 1317   | complex planning, math, code analysis           |

<Tip>
  **Give `max_output_tokens` headroom**: reasoning counts against the output budget. On Responses, a small budget gets fully consumed by thinking and the call returns `status: "incomplete"` (`reason: length`) with **empty text** — it looks like no output, but it is a budget problem. Start at 1500, and use 4000+ with the high tier.
</Tip>

## Cutting Costs with Caching

The model supports two caching layers with different mechanics — do not mix them up:

### Implicit caching (automatic, both endpoints)

No parameters needed: a repeated long prefix (e.g. a fixed system prompt) hits automatically from the 2nd request. Measured: with a \~2,600-token system prompt, requests 2 and 3 reported 2,360 `cached_tokens`. Check hits in `usage.prompt_tokens_details.cached_tokens` (Chat) or `usage.input_tokens_details.cached_tokens` (Responses).

### Explicit caching (Responses only, requires chaining)

The correct way to use explicit caching is `caching: {"type": "enabled"}` **combined with `previous_response_id` chaining**: when turn 2 carries the previous response id, the entire previous context hits the cache (measured: 7,873 tokens fully cached, latency down from 8s to 4s).

<Warning>
  **Enabling without chaining loses on both fronts**: with `caching.enabled` set but no `previous_response_id`, merely repeating the same prefix yields `cached_tokens` of 0 every time — and the implicit prefix cache stops applying too. Either omit the caching parameter and rely on implicit caching, or enable it and chain strictly.
</Warning>

## Code Examples

### Chat Completions

<CodeGroup>
  ```bash cURL (thinking off, fast response) theme={null}
  curl -X POST "https://api.apiyi.com/v1/chat/completions" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "dola-seed-2-1-turbo-260628",
      "messages": [
        {"role": "user", "content": "Introduce yourself in one sentence"}
      ],
      "max_tokens": 500,
      "thinking": {"type": "disabled"}
    }'
  ```

  ```python Python (tiered thinking) theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.chat.completions.create(
      model="dola-seed-2-1-turbo-260628",
      messages=[
          {"role": "user", "content": "Analyze the time complexity of this code and suggest optimizations"}
      ],
      max_tokens=3000,
      reasoning_effort="high",  # low / medium / high
  )

  msg = response.choices[0].message
  print(msg.content)
  # Reasoning text is in msg.reasoning_content (via model_extra with the OpenAI SDK)
  ```

  ```javascript Node.js (streaming) theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const stream = await client.chat.completions.create({
    model: 'dola-seed-2-1-turbo-260628',
    messages: [{ role: 'user', content: 'Write a short poem about summer' }],
    max_tokens: 1500,
    stream: true,
    stream_options: { include_usage: true }
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
  ```
</CodeGroup>

### Responses (native multi-turn + explicit caching)

<CodeGroup>
  ```bash cURL (basic call) theme={null}
  curl -X POST "https://api.apiyi.com/v1/responses" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "dola-seed-2-1-turbo-260628",
      "input": "Introduce yourself in one sentence",
      "max_output_tokens": 1500
    }'
  ```

  ```python Python (chained calls with explicit caching) theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  # Turn 1: enable explicit caching
  r1 = client.responses.create(
      model="dola-seed-2-1-turbo-260628",
      input=[
          {"role": "system", "content": "A long, fixed background document goes here..."},
          {"role": "user", "content": "First question"},
      ],
      max_output_tokens=1500,
      extra_body={"caching": {"type": "enabled"}, "store": True},
  )
  print(r1.output_text)

  # Turn 2: carry the previous id - the whole prior context hits the cache (~2x faster measured)
  r2 = client.responses.create(
      model="dola-seed-2-1-turbo-260628",
      input="Second question",
      previous_response_id=r1.id,
      max_output_tokens=1500,
      extra_body={"caching": {"type": "enabled"}},
  )
  print(r2.output_text)
  print(r2.usage.input_tokens_details.cached_tokens)  # cache hits
  ```
</CodeGroup>

## Best Practices

1. **Thinking off as the baseline, on by exception**: make `thinking: {"type": "disabled"}` your default config and switch to `reasoning_effort` tiers only for genuinely complex tasks — do not pay thinking costs on simple questions.
2. **Give `max_output_tokens` headroom**: 3000+ with thinking on, 4000+ on the high tier, so reasoning never squeezes out the actual answer.
3. **Put fixed system prompts first**: implicit caching matches by prefix — keep the unchanging part at the front and save money automatically from the 2nd request.
4. **Use Responses chaining for multi-turn**: `previous_response_id` avoids resending history, and stacked with explicit caching it cuts both cost and latency on long-context conversations.
5. **Handle 503 in error logic**: a misspelled model name or missing group permission returns 503 (no available channel), not the OpenAI-conventional 404 — do not key retry logic on 404.

## FAQ

<AccordionGroup>
  <Accordion title="Why are simple questions slow and token-hungry?">
    Because **deep thinking is on by default**. Even a one-line question first generates hundreds of reasoning tokens (\~400 measured) — slow and costly. Add `"thinking": {"type": "disabled"}` to the request body; measured reasoning tokens drop to zero.
  </Accordion>

  <Accordion title="Responses returns incomplete with empty text - what happened?">
    `max_output_tokens` is too small and thinking consumed the whole budget (`incomplete_details.reason` is `length`). Raise the budget to 1500+, or disable/lower the thinking tier.
  </Accordion>

  <Accordion title="Chat Completions or Responses - which one?">
    Use Chat Completions for single-turn or self-managed history (broadest ecosystem compatibility). Use Responses for multi-turn conversations, explicit caching, or MCP tools — explicit caching and MCP are Responses-only.
  </Accordion>

  <Accordion title="Explicit caching is enabled but cached_tokens stays 0 - why?">
    Explicit caching requires **chaining**: from turn 2 onward you must pass the previous turn's `previous_response_id`. Independently repeated requests with `caching.enabled` never hit — and the implicit prefix cache stops applying too. If chaining does not fit your app, simply drop the caching parameter and rely on implicit caching.
  </Accordion>

  <Accordion title="Is MCP supported?">
    The official capability sheet lists MCP support on the Responses API. APIYI's test round did not cover MCP (it needs an external MCP server) — validate with low traffic before production use.
  </Accordion>

  <Accordion title="I got a 503 - is the service down?">
    Check the model name spelling first. This model returns 503 ("no available channels") instead of 404 for unknown model names. If the name is correct and 503 persists, check your group permission (this model needs `default` or `svip`) or contact support.
  </Accordion>
</AccordionGroup>

## Related Resources

<CardGroup cols={2}>
  <Card title="Chat Playground" icon="terminal" href="/en/api-capabilities/dola-seed-2-1-turbo/chat-completions">
    Debug the Chat Completions endpoint interactively
  </Card>

  <Card title="Responses Playground" icon="messages-square" href="/en/api-capabilities/dola-seed-2-1-turbo/responses">
    Debug the Responses endpoint interactively
  </Card>

  <Card title="Model Info" icon="list" href="/en/api-capabilities/model-info">
    Browse all available models and groups
  </Card>

  <Card title="API Manual" icon="book" href="/en/api-manual">
    The complete API usage guide
  </Card>
</CardGroup>
