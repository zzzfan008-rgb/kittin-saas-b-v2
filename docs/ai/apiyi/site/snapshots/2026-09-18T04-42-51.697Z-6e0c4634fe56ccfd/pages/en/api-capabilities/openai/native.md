> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI Responses API Native Guide

> Call /v1/responses through APIYI: state management, reasoning controls, built-in tools, and semantic streaming events. OpenAI's recommended endpoint for new projects.

`/v1/responses` is OpenAI's current flagship native endpoint. In OpenAI's own words: "While Chat Completions remains supported, **Responses is recommended for all new projects**." APIYI fully supports this endpoint — just point base\_url at `https://api.apiyi.com/v1`.

This page is based on the official OpenAI documentation (`developers.openai.com/api/docs`, as of June 2026). All examples are copy-paste ready.

## Why Responses

Compared with Chat Completions, OpenAI cites three hard numbers:

* **Better reasoning**: the same reasoning model scores about 3% higher on SWE-bench via Responses (reasoning state persists across turns)
* **Cheaper input**: cache utilization is 40%–80% higher than Chat Completions (OpenAI internal testing), which directly cuts your input bill
* **More tools**: built-in tools like `web_search` and `code_interpreter` are Responses-only

When Chat Completions is still the right choice: you rely on existing frameworks (LangChain and most clients default to `/v1/chat/completions`), or you want one codebase that also calls Claude, Gemini, and other non-OpenAI models — see [Compatible Mode](/en/api-capabilities/openai/compatible).

<Note>
  What is deprecated is the **Assistants API** (scheduled to shut down on August 26, 2026 (UTC)), not Chat Completions. Both endpoints remain supported long-term; new features simply land on Responses first.
</Note>

## Quick Start

<CodeGroup>
  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/responses \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -d '{
      "model": "gpt-5.4",
      "input": "Introduce yourself in one sentence",
      "instructions": "You are a concise assistant"
    }'
  ```

  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.responses.create(
      model="gpt-5.4",
      input="Introduce yourself in one sentence",
      instructions="You are a concise assistant"
  )

  print(response.output_text)  # SDK helper that concatenates all text output
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const openai = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const response = await openai.responses.create({
    model: 'gpt-5.4',
    input: 'Introduce yourself in one sentence',
    instructions: 'You are a concise assistant'
  });

  console.log(response.output_text);
  ```
</CodeGroup>

<Tip>
  Prefer `response.output_text` over hand-written `output[0].content[0].text` — for reasoning models, the first item in `output` is often a `reasoning` item, not a `message`, so hard-coded indexing breaks.
</Tip>

## Request Parameters

| Parameter              | Type           | Default  | Description                                                                                      |
| ---------------------- | -------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `model`                | string         | required | e.g. `gpt-5.4`, `gpt-5.5`                                                                        |
| `input`                | string / array | required | User input; supports multimodal content arrays                                                   |
| `instructions`         | string         | null     | System instructions (system prompt equivalent)                                                   |
| `max_output_tokens`    | int            | null     | Output cap (includes reasoning tokens)                                                           |
| `reasoning`            | object         | medium   | `{"effort": "none/low/medium/high/xhigh"}`                                                       |
| `text`                 | object         | —        | `format` (output format), `verbosity` (low/medium/high)                                          |
| `tools`                | array          | \[]      | Functions + built-in tools                                                                       |
| `tool_choice`          | string         | "auto"   | `auto` / `required` / `none` / a specific tool                                                   |
| `parallel_tool_calls`  | boolean        | true     | Allow parallel tool calls                                                                        |
| `store`                | boolean        | true     | Keep response server-side — ⚠️ **unavailable on APIYI**, see Multi-turn below                    |
| `previous_response_id` | string         | null     | Chain to a prior response — ⚠️ **no effect on APIYI**; pass history in the `input` array         |
| `conversation`         | string         | null     | Persistent conversation object — ⚠️ **not supported on APIYI** (`/v1/conversations` returns 404) |
| `background`           | boolean        | false    | Async background execution (long tasks / Pro models)                                             |
| `stream`               | boolean        | false    | Streaming (semantic events)                                                                      |
| `prompt_cache_key`     | string         | null     | Cache routing key — see [Cache Billing](/en/api-capabilities/openai/prompt-caching)              |
| `metadata`             | object         | {}       | Custom metadata                                                                                  |

<Warning>
  gpt-5 series reasoning models **do not support `temperature` / `top_p`** — passing them raises an error. Use `reasoning.effort` and `text.verbosity` instead.
</Warning>

## Response Structure

`output` is an array of items. The three common types: `reasoning` (reasoning summary), `message` (text reply), and `function_call` (a function call request). A trimmed example:

```json theme={null}
{
  "id": "resp_abc123",
  "object": "response",
  "status": "completed",
  "model": "gpt-5.4-2026-03-05",
  "output": [
    { "type": "reasoning", "summary": [] },
    {
      "type": "message",
      "role": "assistant",
      "content": [{ "type": "output_text", "text": "Hi! I'm an AI assistant." }]
    }
  ],
  "usage": {
    "input_tokens": 24,
    "input_tokens_details": { "cached_tokens": 0 },
    "output_tokens": 58,
    "output_tokens_details": { "reasoning_tokens": 40 },
    "total_tokens": 82
  }
}
```

Two `usage` fields worth watching:

* `input_tokens_details.cached_tokens`: input that hit the cache (billed at 0.1×)
* `output_tokens_details.reasoning_tokens`: reasoning spend (billed at the output rate; tune with `reasoning.effort`)

## Multi-turn: maintain history yourself

When calling the Responses API through APIYI, **pass the full history as the `input` array** (each entry with `role` / `content`), the same approach as Chat Completions:

```python theme={null}
resp = client.responses.create(
    model="gpt-5.4",
    input=[
        {"role": "user", "content": "My name is Alice. Please remember it."},
        {"role": "assistant", "content": "Got it, your name is Alice."},
        {"role": "user", "content": "What's my name?"},
    ],
)
print(resp.output_text)  # Answers "Alice"
```

<Warning>
  **Server-side state is unavailable on APIYI — do not rely on it.** Tested through the gateway (multiple models, with retry delays):

  * `previous_response_id`: accepted without error (returns 200), but the next turn **does not remember** the previous one (`input_tokens` reflects only the current turn, no history loaded);
  * `GET /v1/responses/{id}`: returns 400 — stored responses **cannot be retrieved**;
  * `conversation` objects (`/v1/conversations`): return 404 — **not supported**.

  So `store` / `previous_response_id` / `conversation` should **not be used** on APIYI; always use the "`input` array with self-managed history" approach above. Full cross-format guidance: [Multi-Turn Conversation Guide](/en/api-capabilities/multi-turn-conversation).
</Warning>

<Warning>
  **Multi-turn does not reduce input billing**: every turn resends the full history, all billed as input tokens. Long conversations save money through cache discounts (the historical prefix auto-hits the 0.1× cache rate) — see [Cache Billing](/en/api-capabilities/openai/prompt-caching).
</Warning>

## Reasoning and Output Controls

### Choosing reasoning.effort

| Level              | When to use                                        |
| ------------------ | -------------------------------------------------- |
| `none`             | Simple Q\&A and format conversion — fast and cheap |
| `low`              | Routine chat, summaries                            |
| `medium` (default) | Balanced choice for everyday development           |
| `high`             | Complex code, multi-step reasoning                 |
| `xhigh`            | The hardest problems, with `gpt-5.5` / `gpt-5.4`   |

```python theme={null}
response = client.responses.create(
    model="gpt-5.5",
    input="Prove that the square root of 2 is irrational",
    reasoning={"effort": "xhigh"}
)
```

### text.verbosity

`low` / `medium` (default) / `high` controls answer length. Responses-only:

```python theme={null}
response = client.responses.create(
    model="gpt-5.4",
    input="Explain closures",
    text={"verbosity": "low"}  # short version
)
```

## Streaming

Responses streams **semantic events**, not the generic `choices[0].delta` chunks of Chat Completions. Core events:

| Event                                    | Meaning                                          |
| ---------------------------------------- | ------------------------------------------------ |
| `response.created`                       | Response started                                 |
| `response.output_item.added`             | A new output item (message / function\_call / …) |
| `response.output_text.delta`             | Text increment                                   |
| `response.function_call_arguments.delta` | Function-argument increment                      |
| `response.completed`                     | Done (includes final usage)                      |
| `error`                                  | Failure                                          |

```python theme={null}
stream = client.responses.create(
    model="gpt-5.4",
    input="Write a short poem about autumn",
    stream=True
)

for event in stream:
    if event.type == "response.output_text.delta":
        print(event.delta, end="", flush=True)
    elif event.type == "response.completed":
        print("\n\nUsage:", event.response.usage)
```

## Built-in Tools

Built-in tools are a Responses-only capability — declare them in `tools` and OpenAI executes them server-side:

| Tool             | type               | Description                                                                                                                                                                                          |
| ---------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Web search       | `web_search`       | Model searches the web autonomously                                                                                                                                                                  |
| File search      | `file_search`      | Query uploaded vector stores                                                                                                                                                                         |
| Code interpreter | `code_interpreter` | Run Python in a sandbox                                                                                                                                                                              |
| Computer use     | `computer_use`     | Drive a virtual desktop                                                                                                                                                                              |
| Remote MCP       | `mcp`              | Connect to remote MCP servers                                                                                                                                                                        |
| Image generation | `image_generation` | Inline image generation. **Not recommended on APIYI** (fixed per-call fee, stability not guaranteed) — use the [Images API](/en/api-capabilities/gpt-image-2/text-to-image) instead, billed by usage |
| Tool search      | `tool_search`      | Dynamic retrieval over large tool sets (gpt-5.4 and later)                                                                                                                                           |

Minimal `web_search` example:

```python theme={null}
response = client.responses.create(
    model="gpt-5.4",
    input="What are today's major AI news stories?",
    tools=[{"type": "web_search"}]
)
print(response.output_text)
```

<Info>
  Built-in tools execute on OpenAI's side; pass-through support per tool on the APIYI channel should be confirmed by testing. Custom function calling is fully supported — see [Function Calling](/en/api-capabilities/openai/function-calling).
</Info>

## Pro Models and Background Mode

`gpt-5.4-pro` and `gpt-5.5-pro` are deep-reasoning models for professional workloads (\$30 / \$180 per million tokens, **svip group only**) and are, in practice, **available via `/v1/responses` only**. A single request can take minutes — pair them with `background: true`:

```python theme={null}
# Submit a background task
response = client.responses.create(
    model="gpt-5.4-pro",
    input="Do a deep review of this architecture proposal: ...",
    background=True
)

# Poll for the result
import time
while response.status in ("queued", "in_progress"):
    time.sleep(10)
    response = client.responses.retrieve(response.id)

print(response.output_text)
```

<Warning>
  Pro models are expensive and slow — the trade is "minutes of waiting for a more reliable answer". For everyday development use `gpt-5.4` / `gpt-5.5`; don't reach for Pro without a clear deep-reasoning need.
</Warning>

## Supported Models and Pricing

| Model               | Input (per 1M tokens) | Output (per 1M tokens) | Notes                                                                                                                       |
| ------------------- | --------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `gpt-5.6-sol`       | \$4.00                | \$20.00                | Latest flagship, 1M context, the `gpt-5.6` alias points here; price cut 3 Sep, promotional rate at least through 2026/11/21 |
| `gpt-5.6-terra`     | \$2.50                | \$15.00                | Balanced workhorse of the 5.6 series                                                                                        |
| `gpt-5.6-luna`      | \$1.00                | \$6.00                 | Lightweight 5.6 variant                                                                                                     |
| `gpt-5.4`           | \$2.50                | \$15.00                | Previous workhorse, 1M context                                                                                              |
| `gpt-5.4-mini`      | \$0.75                | \$4.50                 | Lightweight, great value                                                                                                    |
| `gpt-5.5`           | \$5.00                | \$30.00                | Previous flagship, complex reasoning                                                                                        |
| `gpt-5.2`           | \$1.75                | \$14.00                | Previous workhorse                                                                                                          |
| `gpt-5.1` / `gpt-5` | \$1.25                | \$10.00                | Budget-friendly                                                                                                             |
| `gpt-5.4-pro`       | \$30.00               | \$180.00               | svip only, responses only, professional use                                                                                 |
| `gpt-5.5-pro`       | \$30.00               | \$180.00               | svip only, responses only, professional use                                                                                 |

Pinned date versions (e.g. `gpt-5.4-2026-03-05`) are also available at the same price. Full list: [Models & Pricing](/en/api-capabilities/model-info).

## Mapping from Chat Completions

<Warning>
  **Starting with GPT-5.4 (including `gpt-5.6-sol` / `gpt-5.6-terra` / `gpt-5.6-luna`), tool calling combined with an explicit reasoning effort can be rejected on `/v1/chat/completions`**: a request that carries `tools` while **explicitly** sending a non-`none` `reasoning_effort` fails with a 400 — `Function tools with reasoning_effort are not supported for ... in /v1/chat/completions`. This is an official OpenAI restriction; the `/v1/responses` endpoint covered on this page has no such limit — use Responses for tool calling with these models.

  Whether it fires **depends on which upstream route the request lands on**, so the same model can return 200 now and 400 later. Never treat "it worked last time" as proof you are safe. Measurements, the trade-off between the two remedies, and full migration steps: [Endpoint & Migration](/en/api-capabilities/openai/responses-migration).
</Warning>

Field mapping when migrating from `/v1/chat/completions`:

| Chat Completions                       | Responses                                                                     | Notes                               |
| -------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------- |
| `messages` array                       | `input`                                                                       | Plain string works for simple cases |
| system message                         | `instructions`                                                                | Standalone parameter                |
| `max_tokens` / `max_completion_tokens` | `max_output_tokens`                                                           | —                                   |
| `response_format`                      | `text.format`                                                                 | —                                   |
| top-level `reasoning_effort`           | `reasoning.effort`                                                            | Nested object in Responses          |
| `choices[0].message.content`           | `output_text`                                                                 | Reading the result                  |
| Stateless, manual history              | Also manual history (`input` array) ⚠️ server-side state unavailable on APIYI | —                                   |
| `usage.prompt_tokens`                  | `usage.input_tokens`                                                          | Different field names               |

<CodeGroup>
  ```python Chat Completions (old) theme={null}
  response = client.chat.completions.create(
      model="gpt-5.4",
      messages=[
          {"role": "system", "content": "You are a concise assistant"},
          {"role": "user", "content": "Hello"}
      ]
  )
  content = response.choices[0].message.content
  ```

  ```python Responses (new) theme={null}
  response = client.responses.create(
      model="gpt-5.4",
      input="Hello",
      instructions="You are a concise assistant"
  )
  content = response.output_text
  ```
</CodeGroup>

## Client Support Status

Why do most VS Code-family IDEs and plugins (Cline, Trae, etc.) only support `/v1/chat/completions` and not the Responses endpoint covered on this page?

* **chat/completions is the de facto industry standard**: third-party gateways, local inference runtimes (Ollama / vLLM / LM Studio), and non-OpenAI vendors all implement it, so one handler covers hundreds of providers — while `/v1/responses` is still essentially an OpenAI-only dialect
* **Responses is not a URL swap**: semantic event streaming (not delta concatenation), item-based output, and reasoning-state passing are all fundamentally different from chat/completions — clients have to rewrite their entire agent loop
* **Chicken-and-egg**: clients don't implement it because most custom endpoints (gateways) don't serve responses, and gateways aren't in a hurry for the same reason. APIYI already hosts `/v1/responses` (this page), so there is no gateway-side blocker

Mainstream client support as of July 2026:

| Client                                           | Responses support | Notes                                                                                                                                                                                                                                                  |
| ------------------------------------------------ | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Codex CLI](/en/scenarios/programming/codex-cli) | ✅ Native          | Built by OpenAI, the whole agent loop runs on Responses; chat/completions support was dropped in early 2026                                                                                                                                            |
| [opencode](/en/scenarios/programming/opencode)   | ✅                 | The OpenAI provider uses Responses by default                                                                                                                                                                                                          |
| [Roo Code](/en/scenarios/programming/roo-code)   | ✅ (up to gpt-5.4) | The "OpenAI" provider uses Responses and accepts a custom Base URL (the "OpenAI Compatible" provider is still chat/completions); discontinued, preset models stop at `gpt-5.4`; can be installed as a plugin inside Trae and other VS Code-family IDEs |
| Continue                                         | ✅                 | Defaults to responses for gpt-5 / o-series; acquired by Cursor, standalone product winding down                                                                                                                                                        |
| [Cline](/en/scenarios/programming/cline)         | ❌                 | The OpenAI Compatible path is hard-wired to chat/completions; the community feature request hasn't landed                                                                                                                                              |
| [Trae](/en/scenarios/programming/trae)           | ❌                 | Custom models only offer the chat/completions and messages endpoints                                                                                                                                                                                   |

For GPT-5.4+ "reasoning plus tool calling" workloads, Codex CLI / opencode are the first choice — point the Base URL at `https://api.apiyi.com/v1`. If `gpt-5.4` is enough and you want to stay in a VS Code-family IDE (including Trae), install the Roo Code plugin and pick its OpenAI provider.

## Troubleshooting

| Symptom                                                            | Cause and fix                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model_not_supported` error                                        | The model doesn't support the responses endpoint — use the gpt-5 series                                                                                                                                                                                                               |
| Multi-turn forgets context                                         | The safest approach is passing full history in the `input` array; chaining with `previous_response_id` did work when tested on 2026-09-02, but `GET /v1/responses/{id}` is still unavailable — verify in your own group before relying on it                                          |
| `output_text` is empty                                             | The output is all `function_call` items (the model wants tools run) — iterate over `output`                                                                                                                                                                                           |
| Error when passing `temperature`                                   | Unsupported on gpt-5 reasoning models — remove it, use `reasoning.effort`                                                                                                                                                                                                             |
| `Function tools with reasoning_effort are not supported ...` (400) | Official GPT-5.4+ restriction on `/v1/chat/completions` (tools and an explicit non-`none` reasoning\_effort are mutually exclusive) — switch to the `/v1/responses` endpoint on this page; migration steps in [Endpoint & Migration](/en/api-capabilities/openai/responses-migration) |

## Related Links

* This group: [Compatible Mode](/en/api-capabilities/openai/compatible) · [Endpoint & Migration](/en/api-capabilities/openai/responses-migration) · [Cache Billing](/en/api-capabilities/openai/prompt-caching) · [Function Calling](/en/api-capabilities/openai/function-calling)
* Get / manage tokens: `https://api.apiyi.com/token`
* OpenAI migration guide: `developers.openai.com/api/docs/guides/migrate-to-responses`
