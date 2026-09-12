> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI Function Calling Guide

> Tool definitions, strict mode, parallel calls, streaming assembly — and the format differences between the responses and chat/completions endpoints.

Function Calling (FC) is the foundation of agent building: **the model never executes functions — it only outputs "which function to call, with what arguments"**. Execution happens in your own code; you send the result back and the model produces the final answer.

This page is based on the official OpenAI documentation (`developers.openai.com/api/docs/guides/function-calling`, as of June 2026). Examples for both endpoints are copy-paste ready.

## The Full Call Loop

<Steps>
  <Step title="Define tools">
    Send function names, descriptions, and parameter JSON Schemas with the request
  </Step>

  <Step title="Model returns a call">
    When the model decides to call, it returns the function name and JSON arguments
  </Step>

  <Step title="Execute locally">
    Your code parses the arguments and actually runs the function (query a DB, hit an external API…)
  </Step>

  <Step title="Send the result back">
    Send the result with the conversation in a second request; the model answers based on it
  </Step>
</Steps>

## Key Format Differences Between the Two Endpoints

Same feature, different field formats on `/v1/chat/completions` vs `/v1/responses` — the most common integration trap:

|                 | Chat Completions                                                    | Responses                                                                          |
| --------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Tool definition | Nested: `{"type": "function", "function": {name, parameters, ...}}` | Flat: `{"type": "function", "name": ..., "parameters": ...}`                       |
| Call output     | `message.tool_calls[]` (with `id`)                                  | Top-level output item: `{"type": "function_call", "call_id", "name", "arguments"}` |
| Result return   | `{"role": "tool", "tool_call_id": ..., "content": ...}`             | `{"type": "function_call_output", "call_id": ..., "output": ...}`                  |
| strict mode     | Set `"strict": true` explicitly                                     | Server normalizes schemas to strict where possible                                 |

<Warning>
  The two formats **cannot be mixed**. Sending Chat Completions' nested `function: {...}` definition to `/v1/responses` (or vice versa) is the single most common cause of "invalid parameter" SDK errors.
</Warning>

Moving an existing tool-calling flow from Chat Completions over to Responses — for instance because you hit the GPT-5.4+ restriction on `tools` plus `reasoning_effort` — is covered with a full before/after code comparison in [Endpoint & Migration](/en/api-capabilities/openai/responses-migration).

## Full Example: Chat Completions

A weather lookup through the complete define → call → execute → return loop:

<CodeGroup>
  ```python Python theme={null}
  import json
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  tools = [{
      "type": "function",
      "function": {
          "name": "get_weather",
          "description": "Get current weather for a city",
          "parameters": {
              "type": "object",
              "properties": {
                  "city": {"type": "string", "description": "City name, e.g. Beijing"}
              },
              "required": ["city"],
              "additionalProperties": False
          },
          "strict": True
      }
  }]

  messages = [{"role": "user", "content": "What's the weather in Beijing?"}]

  # 1st request: the model decides to call the function
  r1 = client.chat.completions.create(
      model="gpt-5.4", messages=messages, tools=tools
  )
  tool_call = r1.choices[0].message.tool_calls[0]
  args = json.loads(tool_call.function.arguments)

  # Execute locally (fake data standing in for a real lookup)
  weather = {"city": args["city"], "temp": "26°C", "condition": "sunny"}

  # 2nd request: return the result; the model writes the final answer
  messages.append(r1.choices[0].message)
  messages.append({
      "role": "tool",
      "tool_call_id": tool_call.id,
      "content": json.dumps(weather)
  })

  r2 = client.chat.completions.create(
      model="gpt-5.4", messages=messages, tools=tools
  )
  print(r2.choices[0].message.content)
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const openai = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const tools = [{
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Get current weather for a city',
      parameters: {
        type: 'object',
        properties: {
          city: { type: 'string', description: 'City name, e.g. Beijing' }
        },
        required: ['city'],
        additionalProperties: false
      },
      strict: true
    }
  }];

  const messages = [{ role: 'user', content: "What's the weather in Beijing?" }];

  const r1 = await openai.chat.completions.create({
    model: 'gpt-5.4', messages, tools
  });
  const toolCall = r1.choices[0].message.tool_calls[0];
  const args = JSON.parse(toolCall.function.arguments);

  const weather = { city: args.city, temp: '26°C', condition: 'sunny' };

  messages.push(r1.choices[0].message);
  messages.push({
    role: 'tool',
    tool_call_id: toolCall.id,
    content: JSON.stringify(weather)
  });

  const r2 = await openai.chat.completions.create({
    model: 'gpt-5.4', messages, tools
  });
  console.log(r2.choices[0].message.content);
  ```

  ```bash cURL (1st request) theme={null}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -d '{
      "model": "gpt-5.4",
      "messages": [{"role": "user", "content": "What is the weather in Beijing?"}],
      "tools": [{
        "type": "function",
        "function": {
          "name": "get_weather",
          "description": "Get current weather for a city",
          "parameters": {
            "type": "object",
            "properties": {"city": {"type": "string"}},
            "required": ["city"],
            "additionalProperties": false
          },
          "strict": true
        }
      }]
    }'
  ```
</CodeGroup>

## Full Example: Responses

Note the three differences: tool definitions are **flat**, calls come back as top-level `function_call` items, and results return as `function_call_output`. With `previous_response_id`, the second request doesn't need to resend the full history:

```python theme={null}
import json
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

tools = [{
    "type": "function",          # flat definition — no nested "function" field
    "name": "get_weather",
    "description": "Get current weather for a city",
    "parameters": {
        "type": "object",
        "properties": {
            "city": {"type": "string", "description": "City name, e.g. Beijing"}
        },
        "required": ["city"],
        "additionalProperties": False
    }
}]

# 1st request
r1 = client.responses.create(
    model="gpt-5.4",
    input="What's the weather in Beijing?",
    tools=tools
)

# Find the function_call item in the output array
call = next(item for item in r1.output if item.type == "function_call")
args = json.loads(call.arguments)

weather = {"city": args["city"], "temp": "26°C", "condition": "sunny"}

# 2nd request: chain with previous_response_id, return only the function result
r2 = client.responses.create(
    model="gpt-5.4",
    previous_response_id=r1.id,
    input=[{
        "type": "function_call_output",
        "call_id": call.call_id,
        "output": json.dumps(weather)
    }],
    tools=tools
)
print(r2.output_text)
```

## strict Mode (Structured Outputs)

`strict: true` guarantees the model's arguments **conform exactly to your JSON Schema** — no hallucinated or missing fields. Three requirements:

1. The schema must include `"additionalProperties": false`
2. Every field must appear in `required` (express optionality with `"type": ["string", "null"]`)
3. Only the supported JSON Schema subset (primitive types, enum, arrays, nested objects, …)

```json theme={null}
// ✅ Valid strict schema
{
  "type": "object",
  "properties": {
    "city": {"type": "string"},
    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
    "date": {"type": ["string", "null"], "description": "Optional, defaults to today"}
  },
  "required": ["city", "unit", "date"],
  "additionalProperties": false
}
```

```json theme={null}
// ❌ Invalid: missing additionalProperties, date not in required
{
  "type": "object",
  "properties": {
    "city": {"type": "string"},
    "date": {"type": "string"}
  },
  "required": ["city"]
}
```

<Warning>
  **strict mode is incompatible with parallel function calls**: when you need strict schema guarantees, also set `parallel_tool_calls: false`.
</Warning>

## parallel\_tool\_calls and tool\_choice

### Parallel calls

`parallel_tool_calls` defaults to on: the model may request several functions in one turn (e.g. weather for Beijing and Shanghai simultaneously). Execute each, then **return all results** before the next request — every result must pair with its `call_id` (responses) or `tool_call_id` (chat).

### tool\_choice strategies

| Value                                         | Behavior                               |
| --------------------------------------------- | -------------------------------------- |
| `"auto"` (default)                            | Model decides whether and what to call |
| `"required"`                                  | Must call at least one function        |
| `{"type": "function", "name": "get_weather"}` | Force a specific function              |
| `"none"`                                      | No calls — text only                   |

### allowed\_tools subsets

When you have many tools but want to expose only some this turn, use the `allowed_tools` form of `tool_choice` to restrict the callable subset — it **doesn't modify the tools list itself**, so it doesn't break the stable prefix for [caching](/en/api-capabilities/openai/prompt-caching):

```python theme={null}
tool_choice={
    "type": "allowed_tools",
    "mode": "auto",
    "tools": [{"type": "function", "name": "get_weather"}]
}
```

## Function Calls in Streaming

### Chat Completions: assemble by index

Function arguments stream in fragments. Accumulate the `arguments` string per `index`, then `json.loads` after the stream ends:

```python theme={null}
stream = client.chat.completions.create(
    model="gpt-5.4", messages=messages, tools=tools, stream=True
)

calls = {}  # index -> {name, arguments}
for chunk in stream:
    delta = chunk.choices[0].delta if chunk.choices else None
    if delta and delta.tool_calls:
        for tc in delta.tool_calls:
            entry = calls.setdefault(tc.index, {"name": "", "arguments": ""})
            if tc.function.name:
                entry["name"] = tc.function.name
            if tc.function.arguments:
                entry["arguments"] += tc.function.arguments

print(calls)  # arguments are complete JSON only after the stream ends
```

### Responses: listen for semantic events

`response.function_call_arguments.delta` events carry argument increments, and `response.function_call_arguments.done` delivers the complete arguments — no manual index assembly.

## Best Practices and Pitfalls

Writing good tool definitions:

* **Names and descriptions are written for the model**: spell out "when to call me", e.g. `"Get real-time weather; call only when the user explicitly asks about weather"`
* **Narrow parameters with enum**: if values are enumerable, don't use free-form strings — it eliminates most hallucinated arguments
* **Keep tool definitions early in the prompt and stable**: tools participate in the cache prefix; stable definitions mean 90%-off input (see [Cache Billing](/en/api-capabilities/openai/prompt-caching))
* **Cap your agent loop**: set a max number of rounds so the model can't burn money cycling call → return → call

Common pitfalls:

| Symptom                                 | Fix                                                                                                        |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `arguments` isn't valid JSON            | Turn on `strict: true` — solves it at the root                                                             |
| Model calls a nonexistent function      | Tighten with `tool_choice`; check whether descriptions mislead                                             |
| `call_id` mismatch after parallel calls | Every result must pair one-to-one with its `call_id` / `tool_call_id` — one missing pair fails the request |
| Parameter errors from mixed formats     | Check the difference table above; match definition shape (nested/flat) to the endpoint                     |

## Model Support and Selection

The entire gpt-5 series supports function calling. By scenario:

| Scenario                            | Recommended model                       | Why                               |
| ----------------------------------- | --------------------------------------- | --------------------------------- |
| Everyday agents / tool use          | `gpt-5.4` (\$2.50 / \$15.00 per 1M)     | Best capability-to-cost balance   |
| High-frequency lightweight routing  | `gpt-5.4-mini` (\$0.75 / \$4.50 per 1M) | Cheap; plenty for simple dispatch |
| Complex multi-step reasoning agents | `gpt-5.5` (\$5.00 / \$30.00 per 1M)     | Steadier on long planning chains  |

## Related Links

* This group: [Native Calls](/en/api-capabilities/openai/native) · [Compatible Mode](/en/api-capabilities/openai/compatible) · [Cache Billing](/en/api-capabilities/openai/prompt-caching)
* Get / manage tokens: `https://api.apiyi.com/token`
* Official OpenAI docs: `developers.openai.com/api/docs/guides/function-calling`
