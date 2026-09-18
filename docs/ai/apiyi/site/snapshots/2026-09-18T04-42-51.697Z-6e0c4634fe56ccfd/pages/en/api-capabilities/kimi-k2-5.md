> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Kimi K2.5 Text Generation

> Moonshot AI's native multimodal flagship with a 256K context window and a Thinking mode. APIYI connects via Alibaba Cloud official transfer — 0.88× group pricing plus deposit bonuses brings effective cost below 80% of official.

Kimi K2.5 is Moonshot AI's native multimodal flagship, released on January 27, 2026. It focuses on Visual Coding and autonomous Agent Swarm orchestration, with a 256K context window offered at no premium. APIYI integrates it via an **Alibaba Cloud official-transfer channel** for production-grade stability. The base group rate is **0.88× of official pricing**, and stacking deposit bonuses (from \$100 deposit → \$10 free and up) brings the **effective cost below 80% of official pricing**.

<Info>
  **Kimi K2.5 is live on APIYI**: Alibaba Cloud official-transfer channel, OpenAI-compatible endpoint, model ID `kimi-k2.5`. Unlike Kimi's official site, **Thinking mode must be explicitly enabled via `enable_thinking: true`** in the request body — by default the model runs in Instant mode.
</Info>

## Key Advantages

<CardGroup cols={2}>
  <Card title="256K Context" icon="scroll">
    256K tokens at no premium — fit an entire mid-size codebase or long document in a single call.
  </Card>

  <Card title="Thinking Mode" icon="brain">
    Enable deep reasoning with `enable_thinking: true` — built for complex planning, root-cause analysis, and agents.
  </Card>

  <Card title="Native Multimodal + Visual Coding" icon="eye">
    Understands images and code natively — excels at turning UI mockups, screenshots, and diagrams into runnable code.
  </Card>

  <Card title="Stable Alibaba Cloud Transfer" icon="server">
    Routed through Alibaba Cloud's official-transfer channel — enterprise-grade SLA under high concurrency.
  </Card>
</CardGroup>

## Model Info

| Parameter                       | Value                                                     |
| ------------------------------- | --------------------------------------------------------- |
| **Model ID**                    | `kimi-k2.5`                                               |
| **Context Window**              | 256,000 tokens                                            |
| **Modes**                       | Instant / Thinking / Agent / Agent Swarm                  |
| **Thinking Toggle**             | `enable_thinking: true` in request body (default `false`) |
| **Input**                       | Text + Image (native multimodal)                          |
| **Output**                      | Text                                                      |
| **Streaming**                   | ✅ Supported                                               |
| **Function Calling / Tool Use** | ✅ Supported                                               |
| **Channel**                     | Alibaba Cloud Official Transfer                           |

<Warning>
  Kimi's built-in `$web_search` tool is currently incompatible with Thinking mode. Per Moonshot's guidance, disable `enable_thinking` when you need the web\_search tool. This limitation matches the official platform.
</Warning>

## Pricing

| Item              | Official           | APIYI Group (0.88×) | With Deposit Bonus (approx.) |
| ----------------- | ------------------ | ------------------- | ---------------------------- |
| Input             | \$0.60 / 1M tokens | \$0.528 / 1M tokens | \~\$0.48 / 1M tokens         |
| Output            | \$2.50 / 1M tokens | \$2.20 / 1M tokens  | \~\$2.00 / 1M tokens         |
| Cache Hit (Input) | \$0.10 / 1M tokens | \$0.088 / 1M tokens | —                            |

<Info>
  **Pricing notes**: APIYI uses a **0.88× multiplier** (88% of official list price) as the base group rate. Stacking onboarding / bulk deposit bonuses (e.g. \$100 deposit → \$10 free and up) brings the **effective cost below 80% of official**. See [Deposit Promotions](/en/faq/recharge-promotions) for details.
</Info>

## How to Enable Thinking Mode

The biggest difference from Kimi's official site is that APIYI defaults to Instant mode — you must explicitly enable Thinking via `enable_thinking` in the request body:

| Use Case                                | `enable_thinking` | Notes                                                               |
| --------------------------------------- | ----------------- | ------------------------------------------------------------------- |
| Daily chat / fast responses             | `false` (default) | Instant mode, lowest latency                                        |
| Complex reasoning / code planning / RCA | `true`            | Thinking mode, emits reasoning trace                                |
| Agent with web\_search                  | `false`           | Official limitation: web\_search vs thinking are mutually exclusive |

### cURL Example (Thinking enabled)

```bash theme={null}
curl --location 'https://api.apiyi.com/v1/chat/completions' \
  --header "Authorization: Bearer sk-xxxx" \
  --header 'Content-Type: application/json' \
  --data '{
    "model": "kimi-k2.5",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "What is 1+1?"
      }
    ],
    "enable_thinking": true
  }'
```

## How to Call

### Endpoint

```
https://api.apiyi.com/v1/chat/completions
```

### Basic Usage (Instant Mode)

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/v1/chat/completions" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "kimi-k2.5",
      "messages": [
        {"role": "user", "content": "Introduce yourself in one sentence."}
      ]
    }'
  ```

  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.chat.completions.create(
      model="kimi-k2.5",
      messages=[
          {"role": "user", "content": "Introduce yourself in one sentence."}
      ]
  )

  print(response.choices[0].message.content)
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const response = await client.chat.completions.create({
    model: 'kimi-k2.5',
    messages: [
      { role: 'user', content: 'Introduce yourself in one sentence.' }
    ]
  });

  console.log(response.choices[0].message.content);
  ```
</CodeGroup>

### Advanced Usage (Thinking Mode)

<CodeGroup>
  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.chat.completions.create(
      model="kimi-k2.5",
      messages=[
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "Analyze the time complexity of this code and suggest optimizations."}
      ],
      extra_body={
          "enable_thinking": True
      }
  )

  print(response.choices[0].message.content)
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const response = await client.chat.completions.create({
    model: 'kimi-k2.5',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Analyze the time complexity of this code and suggest optimizations.' }
    ],
    // @ts-ignore - custom field
    enable_thinking: true
  });

  console.log(response.choices[0].message.content);
  ```
</CodeGroup>

### Streaming

```python theme={null}
response = client.chat.completions.create(
    model="kimi-k2.5",
    messages=[{"role": "user", "content": "Write a short poem about spring."}],
    stream=True,
    extra_body={"enable_thinking": True}
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

## Request Parameters

| Name              | Type    | Required | Notes                                 |
| ----------------- | ------- | -------- | ------------------------------------- |
| `model`           | string  | Yes      | Must be `kimi-k2.5`                   |
| `messages`        | array   | Yes      | Conversation messages                 |
| `enable_thinking` | boolean | No       | Enable Thinking mode; default `false` |
| `stream`          | boolean | No       | Stream output                         |
| `temperature`     | number  | No       | Sampling temperature, 0–2             |
| `max_tokens`      | integer | No       | Max output tokens                     |
| `tools`           | array   | No       | Function / tool list                  |

## Response Format

```json theme={null}
{
  "id": "chatcmpl-xxxxxxxx",
  "object": "chat.completion",
  "created": 1706300000,
  "model": "kimi-k2.5",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "1+1 equals 2."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 24,
    "completion_tokens": 12,
    "total_tokens": 36
  }
}
```

## Best Practices

1. **Switch modes per task**: Leave Instant mode on for daily chat and short generations; set `enable_thinking: true` for complex reasoning, code review, and agent planning.
2. **Use the 256K context**: Fit a mid-size repo, full product docs, or long meeting transcripts in one call — at no premium.
3. **Multimodal visual coding**: Send UI screenshots / design mockups and let K2.5 "read → plan → code" in one shot.
4. **Stretch the savings**: Stack the \$100+ deposit bonus with the 0.88× group rate — effective cost drops below 80% of official.
5. **Mind the web\_search caveat**: Disable `enable_thinking` if you need Moonshot's built-in `$web_search` tool.

## FAQ

<AccordionGroup>
  <Accordion title="Why isn't my request using Thinking mode?">
    Thinking mode is off by default. Make sure the request body includes `"enable_thinking": true`. With the OpenAI Python SDK, pass it inside `extra_body`; with the Node.js SDK you can pass it as a top-level field.
  </Accordion>

  <Accordion title="Is APIYI's Kimi K2.5 the same model as Moonshot's?">
    Yes — it's the same upstream model, routed through Alibaba Cloud's official-transfer channel. The only difference is that Thinking mode is off by default and must be opted into via `enable_thinking`.
  </Accordion>

  <Accordion title="How does the 0.88× group rate work?">
    When creating an API token in the APIYI console, assign it to a group that includes Kimi K2.5 — billing automatically applies the 0.88× multiplier. Combined with deposit bonuses, total cost drops further. See [Deposit Promotions](/en/faq/recharge-promotions).
  </Accordion>

  <Accordion title="Does it support function calling / tool use?">
    Yes. Pass standard OpenAI-style `tools` definitions. Note that the official `$web_search` built-in tool is mutually exclusive with Thinking mode — use them in separate calls.
  </Accordion>

  <Accordion title="Does Thinking mode cost extra?">
    Thinking traces count as output tokens and are billed normally. Complex tasks may produce significantly more output tokens, so enable it only when you need the deeper reasoning.
  </Accordion>
</AccordionGroup>

## Related Resources

<CardGroup cols={2}>
  <Card title="API Manual" icon="book" href="/en/api-manual">
    Complete API usage guide
  </Card>

  <Card title="Deposit Promotions" icon="gift" href="/en/faq/recharge-promotions">
    Stack bonuses to drive the price down further
  </Card>

  <Card title="Model Info" icon="list" href="/en/api-capabilities/model-info">
    Browse all available models and groups
  </Card>

  <Card title="Use Cases" icon="layers" href="/en/scenarios">
    Client integration walkthroughs
  </Card>
</CardGroup>
