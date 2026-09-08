> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok Chat & Reasoning Guide

> Verified Chat Completions capabilities for the Grok series on APIYI: streaming, chain-of-thought reasoning_content and its billing, structured outputs via json_schema, function calling, vision input, and automatic prompt caching.

This page covers everything the Grok series can do on the `/v1/chat/completions` endpoint. All conclusions come from hands-on testing against the APIYI gateway on July 13, 2026 (UTC+8).

## Basic Chat and Streaming

All six models support the standard OpenAI format and streaming. `stream_options: {"include_usage": true}` is verified working (the final chunk carries complete usage):

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

stream = client.chat.completions.create(
    model="grok-4.3",
    messages=[{"role": "user", "content": "Count from 1 to 5, one number per line"}],
    stream=True,
    stream_options={"include_usage": True},
)
for chunk in stream:
    if chunk.choices and chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
    if chunk.usage:
        print(f"\nUsage: {chunk.usage.total_tokens} tokens")
```

Measured streaming time-to-first-token: 1.5–2.3 s across all models; non-streaming short Q\&A completes in 1.7–5.1 s overall.

## Chain-of-Thought (Reasoning)

This is the most commonly misunderstood billing aspect of the Grok series — read this section in full.

### Which models emit chain-of-thought

| Model                                      | Reasoning behavior                                                           |
| ------------------------------------------ | ---------------------------------------------------------------------------- |
| `grok-4.5` / `grok-4.3` / `grok-build-0.1` | **On by default**; responses include `reasoning_content`; cannot be disabled |
| `grok-4.20-0309-reasoning`                 | On, includes `reasoning_content`                                             |
| `grok-4.20-0309-non-reasoning`             | Off; `reasoning_tokens` is 0; answers directly                               |
| `grok-4.20-multi-agent-beta-0309`          | Internal reasoning not exposed, but `reasoning_tokens` are still billed      |

<Warning>
  **Reasoning tokens count toward output billing.** In one measured short Q\&A, the visible answer was only 30 tokens but 586 output tokens were billed (556 of them reasoning). For high-frequency short Q\&A, `grok-4.20-0309-non-reasoning` saves significantly.
</Warning>

### Reading chain-of-thought and reasoning usage

```python theme={null}
resp = client.chat.completions.create(
    model="grok-4.20-0309-reasoning",
    messages=[{"role": "user", "content": "Pipe A fills a pool in 8h, pipe B in 12h. How long together?"}]
)
msg = resp.choices[0].message
print("Answer:", msg.content)
print("Chain-of-thought:", msg.reasoning_content)
print("Reasoning tokens:", resp.usage.completion_tokens_details.reasoning_tokens)
```

### The reasoning\_effort parameter

`reasoning_effort` (e.g. `"low"` / `"high"`) is **accepted only by `grok-4.5`**; `grok-4.20-0309-reasoning` explicitly rejects it with a 400 `Model ... does not support parameter reasoningEffort`. Do not hard-code this parameter in cross-model code.

## Structured Outputs

The OpenAI-standard `response_format: json_schema` (strict mode) is supported. Verified passing on `grok-4.5` / `grok-4.3` / `grok-build-0.1` / `grok-4.20-0309-reasoning` and the multi-agent model — all return JSON strictly conforming to the schema:

```python theme={null}
resp = client.chat.completions.create(
    model="grok-4.5",
    messages=[{"role": "user", "content": "Zhang San is 25 and lives in Hangzhou. Extract the info."}],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "user_info",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "age": {"type": "integer"},
                    "city": {"type": "string"}
                },
                "required": ["name", "age", "city"],
                "additionalProperties": False
            }
        }
    }
)
print(resp.choices[0].message.content)   # {"name":"Zhang San","age":25,"city":"Hangzhou"}
```

## Function Calling

The OpenAI-standard `tools` / `tool_choice` fields and the full two-round tool-calling flow are supported (verified on `grok-4.5` / `grok-4.3` / `grok-build-0.1`):

```python theme={null}
tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get current weather for a city",
        "parameters": {
            "type": "object",
            "properties": {"city": {"type": "string", "description": "City name"}},
            "required": ["city"]
        }
    }
}]

messages = [{"role": "user", "content": "What's the weather in Shanghai right now?"}]

# Round 1: the model decides to call the tool
resp = client.chat.completions.create(model="grok-4.5", messages=messages, tools=tools)
msg = resp.choices[0].message
tool_call = msg.tool_calls[0]
print(tool_call.function.name, tool_call.function.arguments)  # get_weather {"city":"Shanghai"}

# Round 2: feed the tool result back
messages += [
    msg,
    {"role": "tool", "tool_call_id": tool_call.id,
     "content": '{"city": "Shanghai", "temp_c": 31, "condition": "sunny"}'}
]
resp2 = client.chat.completions.create(model="grok-4.5", messages=messages, tools=tools)
print(resp2.choices[0].message.content)  # It's sunny in Shanghai, 31°C.
```

Forced tool calls via `tool_choice` (`{"type": "function", "function": {"name": "get_weather"}}`) are also verified working.

<Tip>
  This section is about **client-side function calling** (your code executes the tool). If you want xAI's servers to search, run code, or connect to MCP for you, use the Responses API — see [Web & X Search](/en/api-capabilities/grok/web-search) and [Code Execution & MCP](/en/api-capabilities/grok/code-execution-mcp).
</Tip>

## Vision Input (Image Understanding)

Grok 4.x chat models accept image input (jpg / png, up to 20MiB per image) in the OpenAI Vision format. Verified on `grok-4.5` / `grok-4.3` / `grok-4.20-0309-non-reasoning` — all correctly identified shapes and colors:

```python theme={null}
import base64

with open("image.jpg", "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="grok-4.5",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "What's in this image?"},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}}
        ]
    }]
)
print(resp.choices[0].message.content)
```

<Warning>
  **Prefer base64 data URLs.** With external URLs, the image is fetched directly by xAI's upstream servers — in testing, some image hosts (e.g. Wikimedia) reject server-side fetches, failing the request with `image_download_error`. If you must use external URLs, make sure the host allows server-side access and the URL points directly at the image file.
</Warning>

## Prompt Caching (Automatic)

Grok prefix caching is **automatic — zero configuration**, and the cached portion is billed at the discounted rate (0.25× on `grok-4.6`, a 75% saving):

```python theme={null}
resp = client.chat.completions.create(model="grok-4.6", messages=messages)
print("Cache hits:", resp.usage.prompt_tokens_details.cached_tokens)
```

Optimization: put stable content (system prompt, few-shot examples) at the front of your messages and variable content at the end to maximize prefix hits. xAI states that cache entries can be evicted and hits are not guaranteed, so **budget at the uncached price**.

For how to read hits, the 128-token block granularity, and which endpoint suits long conversations, see the [Grok cache billing guide](/en/api-capabilities/grok/prompt-caching).

## FAQ

<AccordionGroup>
  <Accordion title="How do I turn off grok-4.5's chain-of-thought?">
    You can't. Internal reasoning is inherent to `grok-4.5` / `grok-4.3` / `grok-build-0.1`. If you don't need chain-of-thought and want fast, cheap answers, use `grok-4.20-0309-non-reasoning` instead.
  </Accordion>

  <Accordion title="Should reasoning_content go back into the next turn's context?">
    No. When replaying history in multi-turn conversations, send back only `content` (plus tool-calling fields). `reasoning_content` is not a standard field — feeding it back just inflates input tokens.
  </Accordion>

  <Accordion title="How should I set max_tokens?">
    Chain-of-thought consumes the output budget too. If `max_tokens` is too small, reasoning can eat the whole budget and truncate the visible answer. For reasoning models, start at 2048 or higher.
  </Accordion>

  <Accordion title="Do temperature / top_p work?">
    Yes, they're accepted normally. Note that reasoning-class models are less sensitive to sampling parameters than traditional models, so tuning value is limited.
  </Accordion>
</AccordionGroup>

## Related Docs

<CardGroup cols={2}>
  <Card title="Grok Overview" icon="rocket" href="/en/api-capabilities/grok/overview">
    Model lineup, pricing, and capability matrix
  </Card>

  <Card title="Cache Billing" icon="database" href="/en/api-capabilities/grok/prompt-caching">
    75% off on hits, how to read them, and how to structure long conversations
  </Card>

  <Card title="Web & X Search" icon="globe" href="/en/api-capabilities/grok/web-search">
    Hands-on with server-side live-search tools
  </Card>
</CardGroup>
