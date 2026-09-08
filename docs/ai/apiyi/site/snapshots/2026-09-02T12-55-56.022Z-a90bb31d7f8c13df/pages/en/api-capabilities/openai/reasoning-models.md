> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI Compatible Mode: Reasoning Model Output

> How reasoning models behave under /v1/chat/completions: thinking content (reasoning_content), thought signatures, and structured output — with per-model test results.

Reasoning models "think" before they answer. Called through [compatible mode](/en/api-capabilities/openai/compatible), their output carries a few extras over regular models. This page covers three things: **how to get the thinking, how to handle multi-turn, and how to make structured output reliable.**

<Info>
  This page focuses on `/v1/chat/completions` compatible mode. For Claude's native thinking blocks (the `thinking` field on `/v1/messages`), see the [Claude Effort & Thinking Guide](/en/api-capabilities/claude-effort-thinking). For Gemini's native `thinking_level` and `thought_signature`, see [Gemini Native Calls](/en/api-capabilities/gemini/native).
</Info>

## Overview

In compatible mode, reasoning models fall into three groups by "does it emit thinking text":

| Type                | Example models                                        | Thinking content                       | Getting the answer                                   |
| ------------------- | ----------------------------------------------------- | -------------------------------------- | ---------------------------------------------------- |
| No thinking emitted | gpt-4.1-mini, gemini-3.1-flash-lite, claude-haiku-4-5 | None                                   | Same as regular models                               |
| Emits thinking text | grok-4.3, qwen3.6-plus, glm-5.1                       | `reasoning_content` field              | Answer in `content`, thinking in `reasoning_content` |
| Tokens only         | gpt-5.4-mini                                          | No text, only `usage.reasoning_tokens` | Same as regular models                               |

<Tip>
  No matter the type, **the answer is always in `content`**. If you read only `content`, every reasoning model integrates just like a regular model; read `reasoning_content` only when you want to surface the thinking.
</Tip>

## Thinking content: reasoning\_content

Models that emit thinking text put the chain of thought in `reasoning_content`, parallel to `content`.

**Non-streaming** — `message` carries both:

```json theme={null}
{
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "1+1 equals 2.",
      "reasoning_content": "The user is asking 1+1 ... (a chain of thought)"
    },
    "finish_reason": "stop"
  }]
}
```

```python theme={null}
msg = resp.choices[0].message
print("answer:", msg.content)
# thinking (only some models; may live in model_extra in the SDK)
print("thinking:", getattr(msg, "reasoning_content", None))
```

**Streaming** — a run of `delta.reasoning_content` is pushed first; `delta.content` starts only once thinking is done. Be sure to **render the two separately** (collapse the thinking, stream the answer), or the UI will flash a wall of thoughts first:

```python theme={null}
for chunk in stream:
    if not chunk.choices:
        continue
    delta = chunk.choices[0].delta
    reasoning = getattr(delta, "reasoning_content", None)
    if reasoning:
        render_thinking(reasoning)   # collapsible / muted text
    if delta.content:
        render_answer(delta.content) # main answer area
```

<Warning>
  **The streamed "mutual exclusivity" of reasoning vs content differs across three models** — tolerate all three:

  * **grok-4.3**: during thinking only the `reasoning_content` key is present; during the answer only `content` (the other key simply doesn't appear).
  * **qwen3.6-plus**: both keys are present; the inactive one is `null`.
  * **glm-5.1**: during thinking `content` is `""` (empty string) while `reasoning_content` has a value.

  Uniform approach: read with a truthiness check (`if reasoning:` / `if content:`) to skip all three empty states — missing, `null`, and `""`.
</Warning>

<Note>
  Reasoning tokens can dwarf the answer. In testing, a trivial "1+1" question produced hundreds of `reasoning_tokens` on grok-4.3 against just a few answer tokens. Thinking is billed as output tokens, so **evaluate whether to enable / display it for latency- and cost-sensitive use cases**.
</Note>

## Thought signatures and multi-turn

A "thought signature" is a **Gemini native** concept: in native multimodal / function calling, the model returns an encrypted `thought_signature` that must be passed back across turns to preserve reasoning continuity (see [Gemini Native Calls](/en/api-capabilities/gemini/native) and [Gemini Function Calling](/en/api-capabilities/gemini/function-calling)).

**In `/v1/chat/completions` compatible mode, reasoning models are stateless:**

* Multi-turn only requires putting the previous assistant turn's **`content`** into the message history;
* There is **no need to pass back `reasoning_content`**, and **no signature field appears** in the response;
* In testing, gemini-3.1-flash-lite and grok-4.3 both kept multi-turn context correctly while only `content` was passed back.

```python theme={null}
messages = [
    {"role": "user", "content": "Remember the number 42."},
    {"role": "assistant", "content": "Got it, I'll remember 42."},  # content only
    {"role": "user", "content": "What is that number times 2?"}
]
# grok-4.3 / gemini-3.1-flash-lite both answer 84 correctly
```

<Tip>
  If you need to preserve Gemini's thought signatures across turns, or use Claude's native thinking blocks in multi-turn, switch to the corresponding **native** endpoint rather than compatible mode.
</Tip>

## Structured output

Use `response_format` to make the model emit JSON only. Two types:

```python theme={null}
# 1) json_schema: strictly constrain fields by schema (OpenAI standard)
response_format = {
    "type": "json_schema",
    "json_schema": {
        "name": "city_info",
        "strict": True,
        "schema": {
            "type": "object",
            "properties": {
                "city": {"type": "string"},
                "population": {"type": "integer"},
                "is_capital": {"type": "boolean"}
            },
            "required": ["city", "population", "is_capital"],
            "additionalProperties": False
        }
    }
}

# 2) json_object: only guarantees valid JSON, no field constraints
response_format = {"type": "json_object"}
```

### Per-model support (tested)

`json_schema` support varies widely — **this is the biggest pitfall in structured output**:

| Model                 | `json_schema`                                         | `json_object` | Can `content` be parsed directly |
| --------------------- | ----------------------------------------------------- | ------------- | -------------------------------- |
| gpt-4.1-mini          | ✅ strictly honored                                    | ✅             | ✅ pure JSON                      |
| gemini-3.1-flash-lite | ✅                                                     | ✅             | ✅                                |
| grok-4.3              | ✅ (also emits thinking)                               | ✅             | ✅ content is pure JSON           |
| gpt-5.4-mini          | ⚠️ JSON correct, but prefixed with `<think>…</think>` | —             | ❌ strip the think block first    |
| qwen3.6-plus          | ⚠️ returns 400: messages must contain the word "json" | ✅             | ✅                                |
| claude-haiku-4-5      | ❌ ignores schema, returns Markdown                    | —             | ❌                                |
| glm-5.1               | ❌ ignores schema, returns prose                       | ✅             | ✅ under json\_object             |

### Getting JSON reliably across models

<Warning>
  Don't assume `json_schema` works on every model. For cross-model reliability, combine:

  1. Prefer `json_object` — broader compatibility than `json_schema`;
  2. In the prompt, **explicitly say "return JSON only" and include the word "json"** (required by qwen, more reliable for others too);
  3. Parse **defensively**: strip ` ```json ` code fences, strip a `<think>…</think>` prefix, then `json.loads`, and degrade gracefully on failure.
</Warning>

````python theme={null}
import json, re

def parse_json_loose(content: str):
    # remove a <think>…</think> prefix (gpt-5.4-mini)
    content = re.sub(r"<think>.*?</think>", "", content, flags=re.S).strip()
    # remove ```json code fences
    content = re.sub(r"^```(json)?|```$", "", content, flags=re.M).strip()
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return None   # degrade: log raw / retry / switch model
````

## Related links

* Same group: [Handling Responses](/en/api-capabilities/openai/response-handling) · [Compatible Mode Calls](/en/api-capabilities/openai/compatible) · [Function Calling](/en/api-capabilities/openai/function-calling)
* Native thinking: [Claude Effort & Thinking Guide](/en/api-capabilities/claude-effort-thinking) · [Gemini Native Calls](/en/api-capabilities/gemini/native)
* Models & pricing: [Models & Pricing Overview](/en/api-capabilities/model-info)
