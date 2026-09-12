> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini Function Calling Guide

> function_declarations definitions, AUTO/ANY/NONE modes, function_response returns, and the Gemini 3 thought-signature requirement.

The Gemini native format fully supports Function Calling: the model outputs "which function + what arguments", you execute locally and return the result, and the model produces the final answer. The loop matches [OpenAI's FC](/en/api-capabilities/openai/function-calling), but **the field formats are entirely different** and cannot be mixed.

This page is based on the official Google documentation (`ai.google.dev/gemini-api/docs/function-calling`, as of June 2026).

## Format Differences vs OpenAI

|                            | Gemini native                                                       | OpenAI                                                             |
| -------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Tool definition            | `tools: [{"function_declarations": [...]}]`                         | `tools: [{"type": "function", ...}]`                               |
| Call output                | `function_call` in a part (`name` + `args` object)                  | `tool_calls` / `function_call` item (`arguments` is a JSON string) |
| Result return              | `Part(function_response=...)`                                       | `role:"tool"` message / `function_call_output` item                |
| Call strategy              | `tool_config.function_calling_config.mode`: `AUTO` / `ANY` / `NONE` | `tool_choice`: `auto` / `required` / `none`                        |
| Multi-turn reasoning state | **Gemini 3 requires thought signatures back**                       | No such requirement                                                |

One easy mistake: Gemini's `function_call.args` is a **structured object**, not a JSON string — no `json.loads` needed.

## The Full Call Loop

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(
    api_key="YOUR_API_KEY",
    http_options={"base_url": "https://api.apiyi.com"}
)

# 1. Define tools
tools = [{
    "function_declarations": [{
        "name": "get_weather",
        "description": "Get current weather for a city",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "City name, e.g. Beijing"},
                "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}
            },
            "required": ["city"]
        }
    }]
}]

# 2. First request: the model decides to call
contents = [types.Content(role="user", parts=[types.Part(text="How hot is it in Beijing right now?")])]

r1 = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=contents,
    config={"tools": tools}
)

call = r1.candidates[0].content.parts[0].function_call
print(f"Model wants: {call.name}, args: {dict(call.args)}")

# 3. Execute locally (fake data standing in for a real lookup)
weather = {"city": call.args["city"], "temp": 26, "condition": "sunny"}

# 4. Return the result: append the model's reply (function_call + thought signature)
#    and the function result to the history
contents.append(r1.candidates[0].content)
contents.append(types.Content(
    role="user",
    parts=[types.Part(
        function_response=types.FunctionResponse(name=call.name, response=weather)
    )]
))

r2 = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=contents,
    config={"tools": tools}
)
print(r2.text)
```

<Warning>
  **Gemini 3 thought signatures must be returned**: the `function_call` part carries an encrypted `thought_signature`, and the second request must include **the model's entire reply Content unchanged in the history** (step 4 above). A missing signature breaks the reasoning chain and can fail the request. The official `google-genai` SDK handles this automatically with the pattern above; don't strip the field in hand-written REST calls.
</Warning>

## Calling Modes

```python theme={null}
config = {
    "tools": tools,
    "tool_config": {"function_calling_config": {"mode": "AUTO"}}
}
```

| Mode                         | Behavior                                                                  |
| ---------------------------- | ------------------------------------------------------------------------- |
| `AUTO` (recommended default) | Model decides whether to call                                             |
| `ANY`                        | Forces a function call; combine with `allowed_function_names` to restrict |
| `NONE`                       | No calls — text only                                                      |

```python theme={null}
# Force get_weather only
config = {
    "tools": tools,
    "tool_config": {
        "function_calling_config": {
            "mode": "ANY",
            "allowed_function_names": ["get_weather"]
        }
    }
}
```

## Parallel and Multi-Step Calls

* **Parallel**: one turn may return several `function_call` parts (e.g. two cities at once); execute each and return all `function_response` parts together
* **Multi-step**: the model can chain "call → inspect result → call again"; loop until the response has no more `function_call`. Cap the loop to avoid runaway spend

```python theme={null}
# Generic agent loop skeleton
MAX_ROUNDS = 5
for _ in range(MAX_ROUNDS):
    response = client.models.generate_content(
        model="gemini-3.5-flash", contents=contents, config={"tools": tools}
    )
    parts = response.candidates[0].content.parts
    calls = [p.function_call for p in parts if getattr(p, "function_call", None)]
    if not calls:
        print(response.text)  # no more calls — final answer
        break

    contents.append(response.candidates[0].content)  # includes thought signatures
    result_parts = [
        types.Part(function_response=types.FunctionResponse(
            name=c.name, response=execute(c.name, dict(c.args))
        ))
        for c in calls
    ]
    contents.append(types.Content(role="user", parts=result_parts))
```

## Best Practices

* **Descriptions are written for the model**: spell out "when to call me"; narrow parameters with `enum` instead of free-form strings
* **Keep tool definitions stable**: they participate in cache prefix matching — churn hurts [cache hits](/en/api-capabilities/gemini/prompt-caching)
* **Need deterministic JSON output rather than an external tool?** Consider `response_schema` structured output instead of FC (see the [Native Calls](/en/api-capabilities/gemini/native) parameter table)
* For sandboxed computation, use the built-in [code\_execution](/en/api-capabilities/gemini/multimodal) tool instead of writing your own calculator function

## Common Pitfalls

| Symptom                                     | Fix                                                                                                            |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Second round errors / contradictory answers | The model reply (with thought signatures) wasn't appended verbatim — append the entire `candidates[0].content` |
| `json.loads` on `args` fails                | Gemini's `args` is an object, not a string — use `dict(call.args)`                                             |
| Model never calls the function              | Sharpen the description, or force with `mode: "ANY"`                                                           |
| OpenAI-style tools definition rejected      | The two formats can't be mixed — rewrite as `function_declarations` per above                                  |

## Related Links

* This group: [Native Calls](/en/api-capabilities/gemini/native) · [Multimodal & Code Execution](/en/api-capabilities/gemini/multimodal) · [Cache Billing](/en/api-capabilities/gemini/prompt-caching)
* OpenAI counterpart: [OpenAI Function Calling](/en/api-capabilities/openai/function-calling)
* Official Google docs: `ai.google.dev/gemini-api/docs/function-calling`
